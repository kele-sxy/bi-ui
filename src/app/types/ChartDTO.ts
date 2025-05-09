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

import ChartDataView from 'app/types/ChartDataView';
import { Variable } from '../pages/MainPage/pages/VariablePage/slice/types';
import { ChartDetailConfigDTO } from './ChartConfigDTO';

export type ChartDTO = {
  id: string;
  name: string;
  orgId: string;
  status: number;
  updateTime?: string;
  viewId: string;
  view: ChartDataView;
  config: ChartDetailConfigDTO;
  queryVariables?: Variable[];
  //qingyang add
  description?: string;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
};
