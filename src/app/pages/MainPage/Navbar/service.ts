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

import { BE_MODE } from 'app/constants';
import { request2 } from 'utils/request';
import { DownloadTask, DownloadTaskState } from '../slice/types';

export const loadTasks = async () => {
  // qingyang add
  if (BE_MODE) {
    return {
      isNeedStopPolling: true,
      data: [],
    };
  }
  const { data } = await request2<DownloadTask[]>({
    url: `/download/tasks`,
    method: 'GET',
  });
  const isNeedStopPolling = !(data || []).some(
    v => v.status === DownloadTaskState.CREATED,
  );
  return {
    isNeedStopPolling,
    data: data || [],
  };
};
