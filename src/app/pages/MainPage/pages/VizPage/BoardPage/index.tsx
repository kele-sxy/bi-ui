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
}

// qingyang add
// http://localhost:3000/#/organizations/ecac2714a20d4915bdbaa7daef89fd53/boardDetail/9adac00ae8304ac4b0a7a8450830375f?hideNav=true
export const BoardPage = memo(() => {
  // init these like VizPage
  useVizSlice();
  useBoardSlice();
  useEditBoardSlice();
  useStoryBoardSlice();
  const paramsMatch = useRouteMatch<RouteParams>(
    '/organizations/:orgId/boardDetail/:vizId',
  );
  const { vizId = '' } = paramsMatch?.params || {};
  return (
    <Board
      key={vizId}
      id={vizId}
      autoFit={true}
      showZoomCtrl={true}
      renderMode="read"
      hideTitle={true}
    />
    // <Switch>
    //   <Route
    //     path="/organizations/:orgId/vizs/:vizId?/boardEditor"
    //     render={() => <BoardEditor boardId={vizId} />}
    //   />
    // </Switch>
  );
});
