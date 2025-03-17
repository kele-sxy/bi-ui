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
  const guestId = beData.roles.guest?.[0];
  const guestFields = Object.keys(beData.fedColumns?.[guestId] || []);
  guestFields.forEach(field => {
    const commonColInfo = {
      type: beData.fedColumns?.[guestId]?.[field] || 'STRING',
      category: 'UNCATEGORIZED',
      // add for disable drill, will add to dataart via transformHierarchyMeta
      cooperatorCode: soloDatasetConfig.partnerCode,
      local: true,
      joinField: soloDatasetConfig?.joinFields?.includes(field),
    };
    columns[`${soloDatasetConfig.name}.${field}`] = {
      ...commonColInfo,
      name: [soloDatasetConfig.name, field],
    };
    hierarchy[`${soloDatasetConfig.name}.${field}`] = {
      ...commonColInfo,
      name: `${soloDatasetConfig.name}.${field}`,
      path: [soloDatasetConfig.name, field],
    };
  });
  partyDatasetConfig.forEach(datasetConfig => {
    const partyId = datasetConfig.partnerCode;
    const hostFields = Object.keys(beData.fedColumns?.[partyId] || []);
    hostFields.forEach(field => {
      const commonColInfo = {
        type: beData.fedColumns?.[partyId]?.[field] || 'STRING',
        category: 'UNCATEGORIZED',
        // add for disable drill, will add to dataart via transformHierarchyMeta
        cooperatorCode: partyId,
        local: false,
        joinField: datasetConfig?.joinFields?.includes(field),
      };
      columns[`${datasetConfig.name}.${field}`] = {
        ...commonColInfo,
        name: [datasetConfig.name, field],
      };
      hierarchy[`${datasetConfig.name}.${field}`] = {
        ...commonColInfo,
        name: `${datasetConfig.name}.${field}`,
        path: [datasetConfig.name, field],
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

export const fedBoardToBoard = (beData): ServerDashboard => {
  return {
    config: beData.config,
    createBy: '534f81694ce64551a1f899e03f787de2',
    createTime: '2023-03-17 13:04:25',
    datacharts: (beData.fedReports || []).map(x => fedReportToChart(x)),
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
