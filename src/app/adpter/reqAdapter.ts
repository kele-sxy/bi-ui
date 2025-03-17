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

const isJSON = (str: any) => {
  if (typeof str === 'string') {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      console.log('e');
      return false;
    }
  }
  return false;
};

/**
 * 查询联邦数据列表
 * @param arg
 */
export const fetchDataViewsActionFromBe = async arg => {
  const res = await request2<any>({
    method: 'GET',
    baseURL: GAIA_API_PREFIX,
    url: `/dataServing/data/serving/mng/analyse/fed-dataset/list`,
    params: {
      ...arg,
      pageSize: 99999,
      status: 'success',
    },
  });
  // datasetType: "0" 联合 “1” 本方
  const response: { data: any[] } = {
    data: (res?.data?.list || []).map(x => {
      const sub = x.datasetType === '0' ? '联合' : '本方';
      return {
        config: null,
        createBy: null,
        createTime: null,
        description: null,
        id: `${x.id}`,
        index: 1.0,
        isFolder: false,
        model: null,
        name: `${x.name}（${sub}）`,
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
    url: `/dataServing/data/serving/mng/analyse/fed-dataset/explore`,
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
    url: `/dataServing/data/serving/mng/analyse/fed-report/create`,
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
    url: `/dataServing/data/serving/mng/analyse/fed-report/list`,
    params: {
      pageSize: 99999,
      status: 'online',
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
    url: `/dataServing/data/serving/mng/analyse/fed-report/queryReportDetail`,
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
    url: `/dataServing/data/serving/mng/analyse/fed-report/batchQueryReportDetail`,
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
    url: `/dataServing/data/serving/mng/analyse/fed-dataset/explore`,
    params: {
      id: args.viewId,
    },
  });
  console.log(res, args);
  const statistic = res.data?.exploreAnalysis?.statistics?.find(
    x => x.name === args.columns?.[0]?.column?.[1],
  );
  const category = JSON.parse(
    statistic?.hiddenStatistic?.category ||
      statistic?.hiddenStatistic?.string ||
      '{}',
  );
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

  const isGet = args.method === 'GET';
  const wrapper = args.wrapper || 'data';
  const targetChainForReport = args?.targetChainForReport;
  const curReportId = args.chartId;
  const authorization = args?.authorization;
  // extraMap.fedBoardDetail.1
  const extra: any = isGet
    ? {
        method: 'GET',
        params: args?.params, // 新的预览
      }
    : {
        method: 'POST',
        // 老的逻辑
        data: args?.data || {
          ...args,
          reportId: args.chartId,
          fedDatasetId: args.viewId,
        },
      };
  const extraHeaders = authorization
    ? {
        headers: {
          Authorization: authorization,
        },
      }
    : {};

  try {
    res = await request2<any>({
      baseURL: args.baseURL || GAIA_API_PREFIX,
      url:
        args.url || `/dataServing/data/serving/mng/analyse/fed-report/execute`,
      ...extraHeaders,
      ...extra,
    });
  } catch (e) {}

  let reportData = res?.[wrapper];

  if (targetChainForReport) {
    const arr = targetChainForReport.split('.');

    if (arr.length) {
      arr.forEach((item: any) => {
        reportData = isJSON(reportData[item])
          ? JSON.parse(reportData[item])
          : reportData[item];
      });
    }
  }

  console.log('reportData', reportData);

  let innerData: any = [];
  const isReplce = !!args?.targetChainForReportInner; // 替换原本的标识
  if (isReplce) {
    innerData = reportData.filter((item: any) => {
      return item.reportId === curReportId;
    })[0];
  }

  const response = {
    data: isReplce ? innerData[args?.targetChainForReportInner] : reportData,
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
    url: `/dataServing/data/serving/mng/analyse/fed-board/list`,
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
export const fetchBoardDetailFromBe = async ({
  method,
  baseURL,
  url,
  params,
  targetChain,
  data,
  id,
  authorization,
  wrapper,
}: any) => {
  console.log(
    'method, baseURL, url, params',
    method,
    baseURL,
    url,
    params,
    data,
    targetChain,
    authorization,
  );

  const isPost = method === 'POST';

  // extraMap.fedBoardDetail.1
  const extra: any = isPost
    ? {
        method: 'POST',
        data,
      }
    : {
        method: 'GET',
        params: params
          ? params
          : {
              id,
            }, // 新的预览
      };

  const extraHeaders = authorization
    ? {
        headers: {
          Authorization: authorization,
        },
      }
    : {};

  console.log('1231211', {
    baseURL: baseURL || GAIA_API_PREFIX,
    url:
      url || `/dataServing/data/serving/mng/analyse/fed-board/queryBoardDetail`,
    ...extraHeaders,
    ...extra,
  });

  const res = await request2<any>({
    baseURL: baseURL || GAIA_API_PREFIX,
    url:
      url || `/dataServing/data/serving/mng/analyse/fed-board/queryBoardDetail`,
    ...extraHeaders,
    ...extra,
  });
  let boardData = res?.[wrapper ? wrapper : 'data'];

  if (targetChain) {
    const arr = targetChain.split('.');

    if (arr.length) {
      arr.forEach((item: any) => {
        boardData = isJSON(boardData[item])
          ? JSON.parse(boardData[item])
          : boardData[item];
      });
    }
  }

  const response = {
    data: fedBoardToBoard(boardData),
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
    url: `/dataServing/data/serving/mng/analyse/fed-board/create`,
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
