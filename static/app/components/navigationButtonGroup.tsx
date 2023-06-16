import {LocationDescriptor} from 'history';

import {LinkButton, LinkButtonProps} from 'sentry/components/button';
import ButtonBar from 'sentry/components/buttonBar';
import {IconNext, IconPrevious} from 'sentry/icons';
import {t} from 'sentry/locale';

type Props = {
  /**
   * A set of LocationDescriptors that will be used in the buttons in the following order:
   * [Oldest, Older, Newer, Newest]
   */
  links: [LocationDescriptor, LocationDescriptor, LocationDescriptor, LocationDescriptor];
  className?: string;
  hasNext?: boolean;
  hasPrevious?: boolean;
  onNewerClick?: () => void;
  onNewestClick?: () => void;
  onOlderClick?: () => void;
  onOldestClick?: () => void;
  size?: LinkButtonProps['size'];
};

function NavigationButtonGroup({
  links,
  hasNext = false,
  hasPrevious = false,
  className,
  size,
  onOldestClick,
  onOlderClick,
  onNewerClick,
  onNewestClick,
}: Props) {
  return (
    <ButtonBar className={className} merged>
      <LinkButton
        size={size}
        to={links[0]}
        disabled={!hasPrevious}
        aria-label={t('Oldest')}
        icon={<IconPrevious size="xs" />}
        onClick={onOldestClick}
      />
      <LinkButton
        size={size}
        to={links[1]}
        disabled={!hasPrevious}
        onClick={onOlderClick}
      >
        {t('Older')}
      </LinkButton>
      <LinkButton size={size} to={links[2]} disabled={!hasNext} onClick={onNewerClick}>
        {t('Newer')}
      </LinkButton>
      <LinkButton
        size={size}
        to={links[3]}
        disabled={!hasNext}
        aria-label={t('Newest')}
        icon={<IconNext size="xs" />}
        onClick={onNewestClick}
      />
    </ButtonBar>
  );
}

export default NavigationButtonGroup;
