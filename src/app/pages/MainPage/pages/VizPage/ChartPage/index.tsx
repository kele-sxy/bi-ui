import { memo } from 'react';
import { useRouteMatch } from 'react-router';
import { ChartPreviewBoard } from '../ChartPreview';

interface RouteParams {
  orgId: string;
  vizId: string;
}

// qingyang modified
// http://localhost:3000/#/organizations/ecac2714a20d4915bdbaa7daef89fd53/chartDetail/78ec792596334fe48248f29ebd5ba536?hideNav=true
export const ChartPage = memo(() => {
  const paramsMatch = useRouteMatch<RouteParams>(
    '/organizations/:orgId/chartDetail/:vizId',
  );
  const { vizId = '', orgId = '' } = paramsMatch?.params || {};

  return (
    <ChartPreviewBoard
      key={vizId}
      backendChartId={vizId}
      orgId={orgId}
      hideTitle={true}
    />
  );
});
