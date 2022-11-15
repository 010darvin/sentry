import styled from '@emotion/styled';

import Button from 'sentry/components/button';
import ButtonBar from 'sentry/components/buttonBar';
import OnboardingPanel from 'sentry/components/onboardingPanel';
import useLazyLoad from 'sentry/components/useLazyLoad';
import {t} from 'sentry/locale';

import {SERVER_SIDE_SAMPLING_DOC_LINK} from './utils';

type Props = {
  hasAccess: boolean;
  onGetStarted: () => void;
  onReadDocs: () => void;
};

export function SamplingPromo({onGetStarted, onReadDocs, hasAccess}: Props) {
  const src = useLazyLoad({
    loader: async () =>
      (await import('sentry-images/spot/onboarding-server-side-sampling.svg')).default,
  });

  return (
    <OnboardingPanel image={<img src={src} />}>
      <h3>{t('Sample for relevancy')}</h3>
      <Paragraph>
        {t(
          'Create rules to sample transactions under specific conditions, keeping what you need and dropping what you don’t.'
        )}
      </Paragraph>
      <ButtonList gap={1}>
        <Button
          priority="primary"
          onClick={onGetStarted}
          disabled={!hasAccess}
          title={hasAccess ? undefined : t('You do not have permission to set up rules')}
        >
          {t('Start Setup')}
        </Button>
        <Button href={SERVER_SIDE_SAMPLING_DOC_LINK} onClick={onReadDocs} external>
          {t('Read Docs')}
        </Button>
      </ButtonList>
    </OnboardingPanel>
  );
}

const ButtonList = styled(ButtonBar)`
  grid-template-columns: repeat(auto-fit, minmax(130px, max-content));
`;

const Paragraph = styled('p')`
  font-size: ${p => p.theme.fontSizeLarge};
`;
