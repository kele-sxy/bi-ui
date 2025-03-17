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

import {
  CloseOutlined,
  ImportOutlined,
  LeftOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { Button, Space } from 'antd';
import { BE_MODE, isInIframe, MSG_VIEW_DETAIL } from 'app/constants';
import useI18NPrefix from 'app/hooks/useI18NPrefix';
import { selectVizs } from 'app/pages/MainPage/pages/VizPage/slice/selectors';
import classnames from 'classnames';
import { FC, memo, useCallback, useContext, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import styled from 'styled-components/macro';
import {
  FONT_SIZE_ICON_SM,
  FONT_WEIGHT_MEDIUM,
  LINE_HEIGHT_ICON_SM,
  SPACE_LG,
  SPACE_SM,
} from 'styles/StyleConstants';
import { useStatusTitle } from '../../hooks/useStatusTitle';
import { BoardToolBarContext } from '../../pages/BoardEditor/components/BoardToolBar/context/BoardToolBarContext';
import ChartSelectModalModal from '../../pages/BoardEditor/components/ChartSelectModal';
import { clearEditBoardState } from '../../pages/BoardEditor/slice/actions/actions';
import { addDataChartWidgets } from '../../pages/BoardEditor/slice/thunk';
import { BoardActionContext } from '../ActionProvider/BoardActionProvider';
import { WidgetActionContext } from '../ActionProvider/WidgetActionProvider';
import { BoardInfoContext } from '../BoardProvider/BoardInfoProvider';
import { BoardContext } from '../BoardProvider/BoardProvider';

const EditorHeader: FC = memo(({ children }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const t = useI18NPrefix(`viz.action`);
  const { updateBoard } = useContext(BoardActionContext);
  const { onEditClearActiveWidgets } = useContext(WidgetActionContext);
  const { name, status } = useContext(BoardContext);
  const { saving } = useContext(BoardInfoContext);
  const title = useStatusTitle(name, status);

  //qingyang add start
  const { boardId, boardType } = useContext(BoardToolBarContext);
  const [dataChartVisible, setDataChartVisible] = useState<boolean>(false);
  const chartOptionsMock = useSelector(selectVizs);
  const chartOptions = useMemo(
    () => chartOptionsMock.filter(item => item.relType !== 'DASHBOARD'),
    [chartOptionsMock],
  );
  const onSelectedDataCharts = useCallback(
    (chartIds: string[]) => {
      dispatch(addDataChartWidgets({ boardId, chartIds, boardType }));
      setDataChartVisible(false);
    },
    [boardId, boardType, dispatch],
  );
  //qingyang add end

  const onCloseBoardEditor = () => {
    // qingyang add
    if (BE_MODE && isInIframe()) {
      window.parent?.postMessage({ msgType: MSG_VIEW_DETAIL }, '*');
    } else {
      const pathName = history.location.pathname;
      const prePath = pathName.split('/boardEditor')[0];
      history.push(`${prePath}`);
    }
    dispatch(clearEditBoardState());
  };
  const onUpdateBoard = () => {
    onEditClearActiveWidgets();
    setImmediate(() => {
      updateBoard?.(onCloseBoardEditor);
    });
  };

  return (
    <Wrapper onClick={onEditClearActiveWidgets}>
      <h1 className={classnames({ disabled: status < 2 })}>
        <LeftOutlined onClick={onCloseBoardEditor} />
        {title}
      </h1>
      <Space>
        {children}
        <>
          <Button
            key="cancel"
            icon={<CloseOutlined />}
            onClick={onCloseBoardEditor}
          >
            {t('common.cancel')}
          </Button>
          {/* qingyang add */}
          <Button
            key="addChart"
            icon={<ImportOutlined />}
            onClick={() => setDataChartVisible(true)}
          >
            {t('common.importExistingDataCharts')}
          </Button>
          <Button
            key="update"
            type="primary"
            loading={saving}
            icon={<SaveOutlined />}
            onClick={onUpdateBoard}
          >
            {t('common.save')}
          </Button>
        </>
      </Space>
      {/* qingyang add */}
      <ChartSelectModalModal
        dataCharts={chartOptions}
        visible={dataChartVisible}
        onSelectedCharts={onSelectedDataCharts}
        onCancel={() => setDataChartVisible(false)}
      />
    </Wrapper>
  );
});

export default EditorHeader;
const Wrapper = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  padding: ${SPACE_SM} ${SPACE_LG};
  background-color: ${p => p.theme.componentBackground};
  box-shadow: ${p => p.theme.shadowSider};

  h1 {
    flex: 1;
    font-size: ${FONT_SIZE_ICON_SM};
    font-weight: ${FONT_WEIGHT_MEDIUM};
    line-height: ${LINE_HEIGHT_ICON_SM};

    &.disabled {
      color: ${p => p.theme.textColorLight};
    }
  }
`;
