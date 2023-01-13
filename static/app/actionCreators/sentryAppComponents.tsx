import type {Client} from 'sentry/api';
import SentryAppComponentsStore from 'sentry/stores/sentryAppComponentsStore';
import type {SentryAppComponent} from 'sentry/types';

export async function fetchSentryAppComponents(
  api: Client,
  orgSlug: string,
  projectId: string
): Promise<SentryAppComponent[]> {
  const componentsUri = `/organizations/${orgSlug}/sentry-app-components/?projectId=${projectId}`;

  const res = await api.requestPromise(componentsUri);
  SentryAppComponentsStore.loadComponents(res);
  return res;
}
