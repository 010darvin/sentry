from __future__ import annotations

import logging
import sys
from typing import Any, Mapping

from django.conf import settings
from requests import PreparedRequest

from sentry.db.postgres.transactions import in_test_hide_transaction_boundary
from sentry.integrations.client import ApiClient
from sentry.services.hybrid_cloud.integration.service import integration_service
from sentry.services.hybrid_cloud.util import control_silo_function
from sentry.silo.base import SiloMode
from sentry.silo.util import (
    DEFAULT_REQUEST_BODY,
    PROXY_BASE_PATH,
    PROXY_OI_HEADER,
    PROXY_SIGNATURE_HEADER,
    encode_subnet_signature,
    trim_leading_slashes,
)

logger = logging.getLogger(__name__)


def infer_org_integration(
    integration_id: int, ctx_logger: logging.Logger | None = None
) -> int | None:
    """
    Given an integration_id, return the first associated org_integration_id.
    The IntegrationProxyClient requires org_integration context to proxy requests properly
    but sometimes clients don't have context on the specific organization issuing a request.
    In those situations, we just grab the first organization and log this assumption.
    """
    org_integration_id = None
    with in_test_hide_transaction_boundary():
        org_integrations = integration_service.get_organization_integrations(
            integration_id=integration_id
        )
    if len(org_integrations) > 0:
        org_integration_id = org_integrations[0].id
        if ctx_logger:
            ctx_logger.info(
                "infer_organization_from_integration",
                extra={
                    "integration_id": integration_id,
                    "org_integration_id": org_integration_id,
                },
            )
    return org_integration_id


class IntegrationProxyClient(ApiClient):
    """
    Universal Client to access third-party resources safely in Hybrid Cloud.
    Requests to third parties must always exit the Sentry subnet via the Control Silo, and only
    add sensitive credentials at that stage.

    When testing, client requests will always go to the base_url unless `self._use_proxy_url_for_tests`
    is set to True. Enable to test proxying locally.
    """

    _should_proxy_to_control = False
    _use_proxy_url_for_tests = False

    def __init__(
        self,
        org_integration_id: int | None = None,
        verify_ssl: bool = True,
        logging_context: Mapping[str, Any] | None = None,
    ) -> None:
        super().__init__(verify_ssl=verify_ssl, logging_context=logging_context)
        self.org_integration_id = org_integration_id

        is_region_silo = SiloMode.get_current_mode() == SiloMode.REGION
        subnet_secret = getattr(settings, "SENTRY_SUBNET_SECRET", None)
        control_address = getattr(settings, "SENTRY_CONTROL_ADDRESS", None)
        is_test_environment = "pytest" in sys.modules

        if is_region_silo and subnet_secret and control_address:
            self._should_proxy_to_control = True
            self.proxy_url = f"{settings.SENTRY_CONTROL_ADDRESS}{PROXY_BASE_PATH}"

        if is_test_environment and not self._use_proxy_url_for_tests:
            logger.info("proxy_disabled_in_test_env")
            self.proxy_url = self.base_url

    @control_silo_function
    def authorize_request(self, prepared_request: PreparedRequest) -> PreparedRequest:
        """
        Used in the Control Silo to authorize all outgoing requests to the service provider.
        """
        return prepared_request

    def finalize_request(self, prepared_request: PreparedRequest) -> PreparedRequest:
        """
        Every request through these subclassed clients run this method.
        If running as a monolith/control, we must authorize each request before sending.
        If running as a region, we don't authorize and instead, send it to our proxy endpoint,
        where tokens are added in by Control Silo. We do this to avoid race conditions around
        stale tokens and centralize token refresh flows.
        """

        if not self._should_proxy_to_control or not prepared_request.url:
            prepared_request = self.authorize_request(prepared_request=prepared_request)
            return prepared_request

        # E.g. client.get("/chat.postMessage") -> proxy_path = 'chat.postMessage'
        proxy_path = trim_leading_slashes(prepared_request.url[len(self.base_url) :])
        url = f"{self.proxy_url}/{proxy_path}"

        request_body = prepared_request.body
        if not isinstance(request_body, bytes):
            request_body = request_body.encode("utf-8") if request_body else DEFAULT_REQUEST_BODY
        prepared_request.headers[PROXY_OI_HEADER] = str(self.org_integration_id)
        prepared_request.headers[PROXY_SIGNATURE_HEADER] = encode_subnet_signature(
            secret=settings.SENTRY_SUBNET_SECRET,
            path=proxy_path,
            identifier=str(self.org_integration_id),
            request_body=request_body,
        )
        prepared_request.url = url
        logger.info(
            "prepare_proxy_request",
            extra={
                "desitination": prepared_request.url,
                "organization_integration_id": self.org_integration_id,
            },
        )
        return prepared_request
