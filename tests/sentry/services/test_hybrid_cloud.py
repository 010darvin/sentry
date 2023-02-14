from collections import deque

from sentry.services.hybrid_cloud import (
    SiloDataInterface,
    UnsetType,
    app,
    auth,
    identity,
    integration,
    log,
    notifications,
    organization,
    organization_mapping,
    tombstone,
    user,
    user_option,
)
from sentry.testutils import TestCase
from sentry.utils import json


class SiloDataInterfaceTest(TestCase):
    INTERFACE_CLASSES = frozenset(
        [
            app.ApiSentryApp,
            app.ApiSentryAppInstallation,
            auth.ApiAuthIdentity,
            auth.ApiAuthProvider,
            auth.ApiAuthProviderFlags,
            auth.ApiAuthState,
            auth.ApiMemberSsoState,
            auth.ApiOrganizationAuthConfig,
            identity.APIIdentity,
            identity.APIIdentityProvider,
            integration.APIIntegration,
            integration.APIOrganizationIntegration,
            log.AuditLogEvent,
            log.UserIpEvent,
            notifications.ApiNotificationSetting,
            organization.ApiOrganization,
            organization.ApiOrganizationFlags,
            organization.ApiOrganizationMember,
            organization.ApiOrganizationMemberFlags,
            organization.ApiOrganizationSummary,
            organization.ApiProject,
            organization.ApiTeam,
            organization.ApiTeamMember,
            organization.ApiUserOrganizationContext,
            organization_mapping.APIOrganizationMapping,
            organization_mapping.ApiOrganizationMappingUpdate,
            tombstone.ApiTombstone,
            user.APIAvatar,
            user.APIUser,
            user.APIUserEmail,
            user_option.ApiUserOption,
        ]
    )

    INTERFACE_CONSTRUCTORS = {
        organization.ApiUserOrganizationContext: (
            lambda: organization.ApiUserOrganizationContext()
        ),
    }

    def test_schema_generation(self):
        for api_type in self.INTERFACE_CLASSES:
            # We're mostly interested in whether an error occurs
            schema = api_type.schema_json()
            assert schema

    def test_interface_class_coverage(self):
        subclasses = set()
        stack = deque([SiloDataInterface])
        while stack:
            next_class = stack.pop()
            if next_class not in subclasses:
                subclasses.add(next_class)
                stack += next_class.__subclasses__()

        subclasses.difference_update({SiloDataInterface, UnsetType})
        uncovered = subclasses.difference(self.INTERFACE_CLASSES)
        assert uncovered == set(), "SiloDataInterface subclasses exist that are not tested"

    def test_model_serialization(self):
        for api_type in self.INTERFACE_CLASSES:
            # All such model classes should have default values for all attributes
            obj = api_type()

            model_dict = obj.dict()
            serial = json.dumps(model_dict)  # check json lib can serialize all elements
            assert serial

            from_dict = api_type.parse_obj(model_dict)
            assert obj == from_dict
