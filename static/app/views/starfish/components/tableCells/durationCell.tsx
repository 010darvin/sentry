import styled from '@emotion/styled';

import Duration from 'sentry/components/duration';
import {space} from 'sentry/styles/space';
import {formatPercentage} from 'sentry/utils/formatters';
import {ComparisonLabel} from 'sentry/views/starfish/components/samplesTable/common';

type Props = {
  milliseconds: number;
  delta?: number;
};

export default function DurationCell({milliseconds, delta}: Props) {
  return (
    <Container>
      <Duration seconds={milliseconds / 1000} fixedDigits={2} abbreviation />
      {delta ? (
        <ComparisonLabel value={delta}>
          {delta > 0 ? '+' : ''}
          {formatPercentage(delta)}
        </ComparisonLabel>
      ) : null}
    </Container>
  );
}

const Container = styled('div')`
  display: flex;
  width: 100%;
  justify-content: flex-end;
  margin-left: auto;
  gap: ${space(1)};
`;
