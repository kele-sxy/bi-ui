import Board from 'app/pages/DashBoardPage/pages/Board';
import { useBoardSlice } from 'app/pages/DashBoardPage/pages/Board/slice';
import { useEditBoardSlice } from 'app/pages/DashBoardPage/pages/BoardEditor/slice';
import { useStoryBoardSlice } from 'app/pages/StoryBoardPage/slice';
import { memo } from 'react';
import { useRouteMatch } from 'react-router';
import { useVizSlice } from '../slice';

interface RouteParams {
  orgId: string;
  vizId: string;
  extraConfig: string;
}

// qingyang add
// http://localhost:3000/#/organizations/ecac2714a20d4915bdbaa7daef89fd53/boardDetail/9adac00ae8304ac4b0a7a8450830375f?hideNav=true
export const BoardPage = memo(() => {
  // init these like VizPage
  useVizSlice();
  useBoardSlice();
  useEditBoardSlice();
  useStoryBoardSlice();

  // 预览模式
  const paramsMatchMore = useRouteMatch<RouteParams>(
    '/organizations/:orgId/boardDetail/:vizId/:extraConfig/',
  );

  // 普通模式
  const paramsMatch = useRouteMatch<RouteParams>(
    '/organizations/:orgId/boardDetail/:vizId/',
  );

  // 是否是预览模式
  const hasMore = !!paramsMatchMore; // 是否能匹配到/organizations/:orgId/boardDetail/:vizId/:extraConfig/ => 对外预览模式

  // 初始化值
  let vizId: any = '';
  let extraConfig: any = '';

  if (hasMore) {
    vizId = paramsMatchMore?.params?.vizId;
    extraConfig = paramsMatchMore?.params?.extraConfig;
  } else {
    vizId = paramsMatch?.params?.vizId || '';
  }

  console.log('hasMore 模式', hasMore, extraConfig);

  // 更新实际接口配置
  let config = {};
  if (extraConfig) {
    config = JSON.parse(decodeURIComponent(extraConfig));
  }

  return (
    <Board
      extraConfig={config}
      key={vizId}
      id={vizId}
      autoFit={true}
      showZoomCtrl={true}
      renderMode="read"
      hideTitle={true}
    />
  );
});
