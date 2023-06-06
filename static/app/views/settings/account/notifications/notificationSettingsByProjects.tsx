import {Fragment} from 'react';
import styled from '@emotion/styled';

import AsyncComponent from 'sentry/components/asyncComponent';
import EmptyMessage from 'sentry/components/emptyMessage';
import Form from 'sentry/components/forms/form';
import JsonForm from 'sentry/components/forms/jsonForm';
import Pagination from 'sentry/components/pagination';
import {t} from 'sentry/locale';
import {Project} from 'sentry/types';
import {sortProjects} from 'sentry/utils';
import {
  MIN_PROJECTS_FOR_PAGINATION,
  MIN_PROJECTS_FOR_SEARCH,
  NotificationSettingsByProviderObject,
  NotificationSettingsObject,
} from 'sentry/views/settings/account/notifications/constants';
import {
  getParentData,
  getParentField,
  groupByOrganization,
} from 'sentry/views/settings/account/notifications/utils';
import {
  RenderSearch,
  SearchWrapper,
} from 'sentry/views/settings/components/defaultSearchBar';

export type NotificationSettingsByProjectsBaseProps = {
  notificationSettings: NotificationSettingsObject;
  notificationType: string;
  onChange: (
    changedData: NotificationSettingsByProviderObject,
    parentId: string
  ) => NotificationSettingsObject;
  onSubmitSuccess: () => void;
};
export type Props = {
  organizationId: string;
} & NotificationSettingsByProjectsBaseProps &
  AsyncComponent['props'];

type State = {
  projects: Project[];
} & AsyncComponent['state'];

class NotificationSettingsByProjects extends AsyncComponent<Props, State> {
  getDefaultState(): State {
    return {
      ...super.getDefaultState(),
      projects: [],
    };
  }

  getEndpoints(): ReturnType<AsyncComponent['getEndpoints']> {
    const {organizationId} = this.props;
    return [
      // TODO(hybrid-cloud): figure out how to inject the org's region api URL in this context
      [
        'projects',
        `/projects/`,
        {
          query: {organization_id: organizationId},
        },
      ],
    ];
  }

  /**
   * Check the notification settings for how many projects there are.
   */
  getProjectCount = (): number => {
    const {notificationType, notificationSettings} = this.props;

    return Object.values(notificationSettings[notificationType]?.project || {}).length;
  };

  /**
   * The UI expects projects to be grouped by organization but can also use
   * this function to make a single group with all organizations.
   */
  getGroupedProjects = (): {[key: string]: Project[]} => {
    const {projects: stateProjects} = this.state;

    return Object.fromEntries(
      Object.values(groupByOrganization(sortProjects(stateProjects))).map(
        ({organization, projects}) => [`${organization.name} Projects`, projects]
      )
    );
  };

  renderBody() {
    const {notificationType, notificationSettings, onChange, onSubmitSuccess} =
      this.props;
    const {projects, projectsPageLinks} = this.state;

    const canSearch = this.getProjectCount() >= MIN_PROJECTS_FOR_SEARCH;
    const shouldPaginate = projects.length >= MIN_PROJECTS_FOR_PAGINATION;

    const renderSearch: RenderSearch = ({defaultSearchBar}) => (
      <StyledSearchWrapper>{defaultSearchBar}</StyledSearchWrapper>
    );

    return (
      <Fragment>
        {canSearch &&
          this.renderSearchInput({
            stateKey: 'projects',
            url: `/projects/?organization_id=${this.props.organizationId}`,
            placeholder: t('Search Projects'),
            children: renderSearch,
          })}
        <Form
          saveOnBlur
          apiMethod="PUT"
          apiEndpoint="/users/me/notification-settings/"
          initialData={getParentData(notificationType, notificationSettings, projects)}
          onSubmitSuccess={onSubmitSuccess}
        >
          {projects.length === 0 ? (
            <EmptyMessage>{t('No projects found')}</EmptyMessage>
          ) : (
            Object.entries(this.getGroupedProjects()).map(([groupTitle, parents]) => (
              <JsonForm
                collapsible
                key={groupTitle}
                // title={groupTitle}
                fields={parents.map(parent =>
                  getParentField(notificationType, notificationSettings, parent, onChange)
                )}
              />
            ))
          )}
        </Form>
        {canSearch && shouldPaginate && (
          <Pagination pageLinks={projectsPageLinks} {...this.props} />
        )}
      </Fragment>
    );
  }
}

export default NotificationSettingsByProjects;

const StyledSearchWrapper = styled(SearchWrapper)`
  * {
    width: 100%;
  }
`;
