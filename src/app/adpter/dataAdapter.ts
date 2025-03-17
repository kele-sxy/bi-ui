import { ServerDashboard } from 'app/pages/DashBoardPage/pages/Board/slice/types';
import { View } from 'app/types/View';

/**
 *     蓝象     vs   data art
 * fed dataset --->   view
 * fed report  --->   chart
 * fed board   --->   board
 */

/**
 * 转换联邦数据详情
 * @param beData
 * @returns
 */
export const fedDataSetToDataArtView = (beData: any): View => {
  const soloDatasetConfig = JSON.parse(beData.soloDatasetConfig || '{}');
  const partyDatasetConfig = JSON.parse(beData.partyDatasetConfig || '[]');
  const columns = {};
  const hierarchy = {};

  const unionConfig = [soloDatasetConfig, ...partyDatasetConfig];

  console.log('unionConfig', unionConfig);

  unionConfig.forEach(item => {
    const { partnerCode, joinFields, name } = item;
    const curFields = Object.keys(beData.fedColumns?.[partnerCode] || []);
    curFields.forEach(field => {
      const commonColInfo = {
        type: beData.fedColumns?.[partnerCode]?.[field] || 'STRING',
        category: 'UNCATEGORIZED',
        // add for disable drill, will add to dataart via transformHierarchyMeta
        cooperatorCode: partnerCode,
        local: true,
        joinField: joinFields?.includes(field),
      };
      columns[`${name}.${field}`] = {
        ...commonColInfo,
        name: [name, field],
      };
      hierarchy[`${name}.${field}`] = {
        ...commonColInfo,
        name: `${name}.${field}`,
        path: [name, field],
      };
    });
  });

  const model = {
    version: '1.0.0-RC.1',
    columns,
    hierarchy,
  };
  const script = {
    table: [soloDatasetConfig.name, ...partyDatasetConfig.map(x => x.name)],
    columns: 'all',
    joins: [],
    sourceId: '263e6afdc9fd49658e387b08abc99d82',
  };
  const data: View = {
    config:
      '{"version":"1.0.0-RC.1","concurrencyControl":true,"concurrencyControlMode":"DIRTYREAD","cache":false,"cacheExpires":0,"expensiveQuery":false}',
    createBy: '534f81694ce64551a1f899e03f787de2',
    createTime: '2022-11-04 10:52:48',
    description: beData.description,
    id: `${beData.id}`,
    index: 0.0,
    isFolder: false,
    model: JSON.stringify(model),
    name: beData.name,
    // orgId: 'ecac2714a20d4915bdbaa7daef89fd53',
    parentId: '843c1fc802a34e00b6e3183512640dc9',
    // permission: null,
    relSubjectColumns: [],
    relVariableSubjects: [],
    script: JSON.stringify(script),
    sourceId: '263e6afdc9fd49658e387b08abc99d82',
    status: 1,
    type: 'STRUCT',
    updateBy: '534f81694ce64551a1f899e03f787de2',
    updateTime: '2022-11-04 10:55:45',
    variables: [],
  };
  return data;
};

export const fedReportToChart = (
  beData,
  // ): Omit<ChartDTO, 'config'> & { config: string } => {
): any => {
  return {
    config: beData.config || '{}',
    createBy: '534f81694ce64551a1f899e03f787de2',
    createTime: '2023-03-17 12:34:29',
    description: '',
    // download: true,
    id: `${beData.id}`,
    // index: 12.0,
    name: `${beData.name}`,
    orgId: 'ecac2714a20d4915bdbaa7daef89fd53',
    // parentId: null,
    // permission: null,
    queryVariables: [],
    status: 2,
    // thumbnail: null,
    updateBy: '534f81694ce64551a1f899e03f787de2',
    updateTime: '2023-03-29 18:43:37',
    view: fedDataSetToDataArtView(beData.fedDataset),
    viewId: `${beData.fedDataset.id}`,
  };
};

// http://localhost:3000/gaia/v1/bi/#/organizations/ecac2714a20d4915bdbaa7daef89fd53/boardDetail/%7B%22url%22%3A%22%2Fedge%2Fmng%2Fapi%2FdataServer%2Fv2%2Fdetail%22%2C%22params%22%3A%7B%22serviceId%22%3A%223487d223e28649258f5047a35cc054c4%22%7D%2C%22targetChain%22%3A%22extraMap.fedBoardDTO%22%7D?hideNav=true

export const fedBoardToBoard = (beData): ServerDashboard => {
  console.log('beData', beData);

  return {
    config: beData.config,
    createBy: '534f81694ce64551a1f899e03f787de2',
    createTime: '2023-03-17 13:04:25',
    datacharts: (beData.fedReports || []).map(x => {
      return {
        // kele: 蓝象状态
        beStatus: x.status, // offline
        isDeleted: x.isDeleted,
        ...fedReportToChart(x),
      };
    }),
    // download: true,
    id: `${beData.id}`,
    index: 14.0,
    name: `${beData.name}`,
    orgId: 'ecac2714a20d4915bdbaa7daef89fd53',
    parentId: null,
    // permission: null,
    queryVariables: [],
    status: 2,
    thumbnail: '',
    updateBy: '534f81694ce64551a1f899e03f787de2',
    updateTime: '2023-04-01 18:29:46',
    views: (beData.fedDatasets || []).map(x => fedDataSetToDataArtView(x)),
    //TODO:
    widgets: beData.widgets || [],
  };
};
