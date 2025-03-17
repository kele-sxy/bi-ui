import { ServerDatachart } from 'app/pages/DashBoardPage/pages/Board/slice/types';
import { Variable } from 'app/pages/MainPage/pages/VariablePage/slice/types';
import { Folder } from 'app/pages/MainPage/pages/VizPage/slice/types';
import { View } from 'app/types/View';
import { request2 } from 'utils/request';
import {
  fedBoardToBoard,
  fedDataSetToDataArtView,
  fedReportToChart,
} from './dataAdapter';

const GAIA_API_PREFIX = '/gaia/v1';

/**
 * 查询联邦数据列表
 * @param arg
 */
export const fetchDataViewsActionFromBe = async arg => {
  const res = await request2<any>({
    method: 'GET',
    baseURL: GAIA_API_PREFIX,
    url: `/edge/mng/analyse/fed-dataset/list`,
    params: {
      ...arg,
      pageSize: 99999,
    },
  });
  const response: { data: any[] } = {
    data: (res?.data?.list || []).map(x => {
      return {
        config: null,
        createBy: null,
        createTime: null,
        description: null,
        id: `${x.id}`,
        index: 1.0,
        isFolder: false,
        model: null,
        name: x.name,
        orgId: arg.orgId,
        parentId: null,
        permission: null,
        script: null,
        sourceId: null,
        status: null,
        type: null,
        updateBy: null,
        updateTime: null,
      };
    }),
  };
  return response;
};
/**
 * 查询联邦数据详情
 * @param arg
 * @returns
 */
export const fetchViewDetailActionFromBe = async arg => {
  const res = await request2<any>({
    method: 'GET',
    baseURL: GAIA_API_PREFIX,
    url: `/edge/mng/analyse/fed-dataset/explore`,
    params: {
      id: arg,
    },
  });
  const response = {
    data: fedDataSetToDataArtView(res.data),
  };
  return response;
};

/**
 * 保存报表
 * @param chartId
 * @param originBody
 * @returns
 */
export const updateChartActionForBe = async (chartId, originBody) => {
  const res = await request2<any>({
    method: 'POST',
    baseURL: GAIA_API_PREFIX,
    url: `/edge/mng/analyse/fed-report/create`,
    data: {
      ...originBody,
      id: chartId,
      fedDatasetId: originBody.viewId,
    },
  });
  const response: {
    data: boolean;
  } = {
    data: !!res?.data,
  };
  return response;
};

/**
 * 查询报表列表
 * @param chartId
 * @returns
 */
export const fetchChartListFromBe = async () => {
  const res = await request2<any>({
    method: 'GET',
    baseURL: GAIA_API_PREFIX,
    url: `/edge/mng/analyse/fed-report/list`,
    params: {
      pageSize: 99999,
    },
  });

  const response: { data: Folder[] } = {
    data: (res?.data?.list || []).map(x => {
      return {
        avatar: 'cluster-column-chart',
        createBy: null,
        createTime: null,
        id: `DATACHART_${x.id}`,
        index: 12.0,
        name: `${x.name}`,
        orgId: 'ecac2714a20d4915bdbaa7daef89fd53',
        parentId: null,
        permission: null,
        relId: `${x.id}`,
        relType: 'DATACHART',
        subType: null,
        updateBy: null,
        updateTime: null,
      };
    }),
  };
  return response;
};

/**
 * 查询报表详情
 * @param chartId
 * @returns
 */
export const fetchChartActionFromBe = async chartId => {
  const res = await request2<any>({
    method: 'GET',
    baseURL: GAIA_API_PREFIX,
    url: `/edge/mng/analyse/fed-report/queryReportDetail`,
    params: {
      id: chartId,
    },
  });
  const response = {
    data: fedReportToChart(res.data),
  };
  return response;
};

/**
 * 批量查询报表详情
 */
export const batchFetchChartInfoFromBe = async args => {
  const res = await request2<any>({
    method: 'GET',
    baseURL: GAIA_API_PREFIX,
    url: `/edge/mng/analyse/fed-report/batchQueryReportDetail`,
    params: {
      idList: args,
    },
  });
  const viewVariables: Record<string, Variable[]> = {};
  res.data.forEach(x => {
    viewVariables[`${x.fedDataset.id}`] = [];
  });
  const response: {
    data: {
      datacharts: ServerDatachart[];
      views: View[];
      viewVariables: Record<string, Variable[]>;
    };
  } = {
    data: {
      datacharts: res.data.map(x => fedReportToChart(x)),
      viewVariables: viewVariables,
      views: res.data.map(x => fedDataSetToDataArtView(x.fedDataset)),
    },
  };
  return response;
};

/**
 * 执行disntinct
 */
export const fetchDistinctDataFromBe = async args => {
  const res = await request2<any>({
    method: 'GET',
    baseURL: GAIA_API_PREFIX,
    url: `/edge/mng/analyse/fed-dataset/explore`,
    params: {
      id: args.viewId,
    },
  });
  console.log(res, args);
  const statistic = res.data?.exploreAnalysis?.statistics?.find(
    x => x.name === args.columns?.[0]?.column?.[1],
  );
  const category = JSON.parse(statistic?.hiddenStatistic?.category || '{}');
  const distinctData = (category?.constData || []).map(x => [x.item]);
  console.log(distinctData);
  return {
    data: {
      columns: [
        {
          fmt: null,
          foreignKeys: null,
          name: [
            `${args.columns?.[0]?.column?.[0]}.${args.columns?.[0]?.column?.[1]}`,
          ],
          type: 'STRING',
        },
      ],
      id: 'DF2051f9614bfc4505ba933ea81891c742',
      name: null,
      pageInfo: {
        countTotal: false,
        pageNo: 1,
        pageSize: 99999999,
        total: distinctData.length,
      },
      rows: distinctData,
      script: null,
      vizId: null,
      vizType: null,
    },
    errCode: 0,
    exception: null,
    message: null,
    pageInfo: null,
    success: true,
    warnings: null,
  };
};

/**
 * 执行报表获取分析结果
 * @param args
 * @returns
 */
export const fetchDataSetActionFromBe = async args => {
  let res;
  try {
    res = await request2<any>({
      method: 'POST',
      baseURL: GAIA_API_PREFIX,
      url: `/edge/mng/analyse/fed-report/execute`,
      data: {
        ...args,
        reportId: args.chartId,
        fedDatasetId: args.viewId,
      },
    });
  } catch (e) {}
  // const cubeData = {
  //   columns: [
  //     {
  //       fmt: null,
  //       foreignKeys: null,
  //       name: ['groupdata_leader.company'],
  //       type: 'String',
  //     },
  //     {
  //       fmt: null,
  //       foreignKeys: null,
  //       name: ['COUNT(groupdata_leader.age)'],
  //       type: 'NUMERIC',
  //     },
  //   ],
  //   rows: [
  //     ['A', '1'],
  //     ['B', '2'],
  //     ['C', '3'],
  //     ['D', '4'],
  //     ['E', '5'],
  //     ['F', '6'],
  //   ],
  // };
  //清扬测试
  // const testData = {
  //   columns: [
  //     { fmt: null, foreignKeys: null, name: ['data1.籍贯'], type: 'STRING' },
  //     {
  //       fmt: null,
  //       foreignKeys: null,
  //       name: ['COUNT(data1.姓名)'],
  //       type: 'NUMERIC',
  //     },
  //   ],
  //   id: 'DFf8be3bf8c8b84592ba40d7bc10997c2c',
  //   name: null,
  //   pageInfo: { countTotal: false, pageNo: 1, pageSize: 100, total: 4 },
  //   rows: [
  //     ['上海', 1],
  //     ['安徽', 1],
  //     ['江苏', 1],
  //     ['浙江', 3],
  //   ],
  //   script: null,
  //   vizId: null,
  //   vizType: null,
  // };
  // const testData1 = {
  //   columns: [
  //     { fmt: null, foreignKeys: null, name: ['data1.姓名'], type: 'STRING' },
  //     {
  //       fmt: null,
  //       foreignKeys: null,
  //       name: ['SUM(data1.年龄)'],
  //       type: 'NUMERIC',
  //     },
  //   ],
  //   id: 'DFf88337d90dee4d73ac983263d1fe1426',
  //   name: null,
  //   pageInfo: { countTotal: false, pageNo: 1, pageSize: 100, total: 6 },
  //   rows: [
  //     ['userA', 20.0],
  //     ['userB', 30.0],
  //     ['userC', 80.0],
  //     ['userD', 44.0],
  //     ['userE', 31.0],
  //     ['userF', 16.0],
  //   ],
  //   script:
  //     'SELECT `data1`.`姓名` AS `data1.姓名`, SUM(`data1`.`年龄`) AS `SUM(data1.年龄)` FROM `data1` GROUP BY `data1`.`姓名`',
  //   vizId: null,
  //   vizType: null,
  // };
  const response = {
    data: res?.data, // || cubeData || testData || testData1,
  };
  return response;
};

/**
 * 仪表盘列表
 * @returns
 */
export const fetchBoardListFromBe = async () => {
  const res = await request2<any>({
    method: 'GET',
    baseURL: GAIA_API_PREFIX,
    url: `/edge/mng/analyse/fed-board/list`,
    params: {
      pageSize: 99999,
    },
  });

  const response: { data: Folder[] } = {
    data: (res?.data?.list || []).map(x => {
      return {
        avatar: null,
        createBy: null,
        createTime: null,
        id: `DASHBOARD_${x.id}`,
        index: 1.0,
        name: x.name,
        orgId: 'ecac2714a20d4915bdbaa7daef89fd53',
        parentId: null,
        permission: null,
        relId: `${x.id}`,
        relType: 'DASHBOARD',
        subType: 'auto',
        updateBy: null,
        updateTime: null,
      };
    }),
  };
  return response;
};

/**
 * 仪表盘详情
 * @param boardId
 * @returns
 */
export const fetchBoardDetailFromBe = async boardId => {
  const res = await request2<any>({
    method: 'GET',
    baseURL: GAIA_API_PREFIX,
    url: `/edge/mng/analyse/fed-board/queryBoardDetail`,
    params: {
      id: boardId,
    },
  });
  const response = {
    data: fedBoardToBoard(res.data),
  };
  return response;
};

/**
 * 保存仪表盘
 * @param chartId
 * @param originBody
 * @returns
 */
export const updateDashboardForBe = async (boardId, originBody) => {
  const res = await request2<any>({
    method: 'POST',
    baseURL: GAIA_API_PREFIX,
    url: `/edge/mng/analyse/fed-board/create`,
    data: {
      ...originBody,
      id: boardId,
      layout: originBody.subType,
    },
  });
  const response: {
    data: boolean;
  } = {
    data: !!res?.data,
  };
  return response;
};
