/**
 * Datart
 *
 * Copyright 2021
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { BE_LOGIN, BE_MODE } from 'app/constants';
import { selectLoggedInUser } from 'app/slice/selectors';
import { RootState } from 'types';
import { request2 } from 'utils/request';
import { errorHandle } from 'utils/utils';
import { mainActions } from '.';
import { UserSettingTypes } from '../constants';
import { SubjectTypes } from '../pages/PermissionPage/constants';
import { SubjectPermissions } from '../pages/PermissionPage/slice/types';
import {
  selectOrganizations,
  selectOrgId,
  selectUserSettings,
} from './selectors';
import {
  AddOrganizationParams,
  AddOrganizationPayload,
  DataProvider,
  DataProviderConfigTemplate,
  DataProviderViewModel,
  DeleteOrganizationPayload,
  DownloadTask,
  DownloadTaskState,
  EditOrganizationParams,
  Organization,
  UserSetting,
  UserSettingsPayload,
} from './types';
import { findLvoSetting, updateLvoUserSettings } from './utils';

export const getUserSettings = createAsyncThunk<
  UserSettingsPayload,
  string | undefined
>('main/getUserSettings', async orgId => {
  try {
    if (BE_MODE && BE_LOGIN) {
      return {
        orgId: 'ecac2714a20d4915bdbaa7daef89fd53',
        userSettings: [
          {
            config: '',
            createBy: '',
            createTime: '',
            id: '4598b632e0bf460f8593fd169f3069aa',
            // permission: null,
            relId: 'ecac2714a20d4915bdbaa7daef89fd53',
            relType: UserSettingTypes.LastVisitedOrganization,
            updateBy: '',
            updateTime: '',
            userId: '534f81694ce64551a1f899e03f787de2',
          },
        ],
        organizations: [
          {
            avatar:
              'resources/org/avatar/ecac2714a20d4915bdbaa7daef89fd53/BEE-512x512.png',
            description: '',
            id: 'ecac2714a20d4915bdbaa7daef89fd53',
            name: "admin's Organization",
          },
        ],
      };
    }
    const [{ data: userSettings }, { data: organizations }] = await Promise.all(
      [
        request2<UserSetting[]>('settings/user'),
        request2<Organization[]>('/orgs'),
      ],
    );

    if (orgId) {
      const index = organizations.findIndex(({ id }) => id === orgId);
      if (index >= 0) {
        return {
          userSettings: await updateLvoUserSettings(userSettings, orgId),
          organizations,
          orgId,
        };
      }
    } else {
      const lvoSetting = findLvoSetting(userSettings);
      if (lvoSetting) {
        return { userSettings, organizations, orgId: lvoSetting.relId };
      } else if (organizations.length > 0) {
        return {
          userSettings: await updateLvoUserSettings(
            userSettings,
            organizations[0].id,
          ),
          organizations,
          orgId: organizations[0].id,
        };
      }
    }

    return { userSettings, organizations };
  } catch (error) {
    errorHandle(error);
    throw error;
  }
});

export const getLoggedInUserPermissions = createAsyncThunk<
  SubjectPermissions,
  string,
  { state: RootState }
>('main/getLoggedInUserPermissions', async (orgId, { getState }) => {
  const loggedInUser = selectLoggedInUser(getState());
  if (BE_MODE) {
    return {
      orgId: 'ecac2714a20d4915bdbaa7daef89fd53',
      orgOwner: true,
      permissionInfos: [],
      subjectId: loggedInUser?.id || '',
      subjectType: SubjectTypes.User,
    };
  }
  const { data } = await request2<SubjectPermissions>({
    url: '/roles/permission/subject',
    method: 'GET',
    params: {
      orgId,
      subjectType: SubjectTypes.User,
      subjectId: loggedInUser?.id,
    },
  });
  return data;
});

export const switchOrganization = createAsyncThunk<
  null,
  string,
  { state: RootState }
>('main/switchOrganization', async (orgId, { getState, dispatch }) => {
  try {
    const userSettings = selectUserSettings(getState());
    dispatch(mainActions.setOrgId(orgId));
    dispatch(
      mainActions.setUserSettings(
        await updateLvoUserSettings(userSettings, orgId),
      ),
    );
    return null;
  } catch (error) {
    errorHandle(error);
    throw error;
  }
});

export const getOrganizations = createAsyncThunk<Organization[]>(
  'main/getOrganizations',
  async () => {
    const { data } = await request2<Organization[]>('/orgs');
    return data;
  },
);

export const getDataProviders = createAsyncThunk<DataProviderViewModel>(
  'main/getDataProviders',
  async () => {
    if (BE_MODE) {
      const providers = [
        { name: 'file-data-provider', type: 'FILE' },
        { name: 'http-data-provider', type: 'HTTP' },
        { name: 'jdbc-data-provider', type: 'JDBC' },
      ];
      return providers.reduce<DataProviderViewModel>(
        (obj, { name, type }) => ({ ...obj, [type]: { name, config: null } }),
        {},
      );
    }
    const { data } = await request2<DataProvider[]>('/data-provider/providers');
    return data.reduce<DataProviderViewModel>(
      (obj, { name, type }) => ({ ...obj, [type]: { name, config: null } }),
      {},
    );
  },
);

export const getDataProviderConfigTemplate = createAsyncThunk<
  DataProviderConfigTemplate,
  string
>('main/getDataProviderConfigTemplate', async type => {
  const { data } = await request2<DataProviderConfigTemplate>(
    `/data-provider/${type}/config/template`,
  );
  return data;
});

export const getDataProviderDatabases = createAsyncThunk<string[], string>(
  'main/getDataProviderDatabases',
  async sourceId => {
    const { data } = await request2<string[]>(
      `/data-provider/${sourceId}/databases`,
    );
    return data;
  },
);

export const addOrganization = createAsyncThunk<
  AddOrganizationPayload,
  AddOrganizationParams,
  { state: RootState }
>(
  'main/addOrganization',
  async ({ organization, resolve }, { getState, dispatch }) => {
    const userSettings = selectUserSettings(getState());
    const { data } = await request2<Organization>({
      url: '/orgs',
      method: 'POST',
      data: organization,
    });
    dispatch(mainActions.setOrgId(''));
    resolve();
    return {
      organization: data,
      userSettings: await updateLvoUserSettings(userSettings, data.id),
    };
  },
);

export const editOrganization = createAsyncThunk<
  Omit<Organization, 'avatar'>,
  EditOrganizationParams
>('main/editOrganization', async ({ organization, resolve }) => {
  await request2<boolean>({
    url: `/orgs/${organization.id}`,
    method: 'PUT',
    data: organization,
  });
  resolve();
  return organization;
});

export const deleteOrganization = createAsyncThunk<
  DeleteOrganizationPayload,
  (redirectOrgId?: string) => void,
  { state: RootState }
>('main/deleteOrganization', async (resolve, { getState, dispatch }) => {
  const orgId = selectOrgId(getState());
  const organizations = selectOrganizations(getState());
  const userSettings = selectUserSettings(getState());

  await request2<boolean>({ url: `/orgs/${orgId}`, method: 'DELETE' });
  dispatch(mainActions.setOrgId(''));
  resolve();
  const rest = organizations.filter(({ id }) => id !== orgId);
  const nextOrgId = rest[0]?.id || '';
  return {
    delOrgId: orgId,
    nextOrgId,
    userSettings: await updateLvoUserSettings(userSettings, nextOrgId),
  };
});

interface FetchDownloadTasksPayload {
  resolve?: (isNeedClear: boolean) => void;
}
export const fetchDownloadTasks = createAsyncThunk(
  'main/fetchDownloadTasks',
  async (payload: FetchDownloadTasksPayload | undefined, { dispatch }) => {
    if (BE_MODE) {
      return;
    }
    const { data } = await request2<DownloadTask[]>({
      url: `/download/tasks`,
      method: 'GET',
    });
    dispatch(mainActions.setDownloadManagement({ newTasks: data }));
    const isNeedClear = !(data || []).some(
      v => v.status === DownloadTaskState.CREATED,
    );
    payload?.resolve?.(isNeedClear);
  },
);
