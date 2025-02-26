import type {RawReplayError as TRawReplayError} from 'sentry/utils/replays/types';

type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;

export function RawReplayError(
  error: Overwrite<Partial<TRawReplayError>, {timestamp: Date}>
): TRawReplayError {
  return {
    'error.type': [] as string[],
    id: error.id ?? 'e123',
    issue: error.issue ?? 'JS-374',
    'issue.id': 3740335939,
    'project.name': 'javascript',
    timestamp: error.timestamp.toISOString(),
    title: 'A Redirect with :orgId param on customer domain',
  };
}
