import React, { PureComponent } from 'react';
// import { VirtualList } from '@alifd/next';
import { RuntimeDataSourceConfig as DataSourceConfig } from '@rchh/lowcode-datasource-types';
import { DroppableDataSourceListItem } from '../DataSourceListItem';
import { createStateMachine, DataSourcePaneStateContext } from '../../utils/stateMachine';
import { DataSourcePaneContext } from '../../utils/panel-context';
import { generateClassName } from '../../utils/misc';
import { DataSourceInfoTag } from '../../types';
import { intl } from '../../locale';

export interface DataSourceListProps {
  dataSource: DataSourceConfig[];
  onOperationClick?: (operationType: string, dataSourceId: string) => void;
  onToggleSelect?: (dataSourceId: string) => void;
  renderItemInfoTags?: (dataSource: DataSourceConfig) => DataSourceInfoTag[];
}

interface DataSourceListState {
  current: any;
  dataSource: DataSourceConfig[];
  dragId?: string;
}

const OPERATIONS = [
  {
    title: intl('View'),
    icon: 'eye',
    type: 'view',
    disabled: false,
    visible: true,
  },
  {
    title: intl('Edit'),
    icon: 'edit',
    type: 'edit',
    disabled: false,
    visible: true,
  },
  {
    title: intl('Delete'),
    icon: 'ashbin',
    type: 'remove',
    disabled: false,
    visible: true,
  },
  {
    title: intl('Duplicate'),
    icon: 'copy',
    type: 'duplicate',
    disabled: false,
    visible: true,
  },
];

export class DataSourceList extends PureComponent<
  DataSourceListProps,
  DataSourceListState
> {
  static contextType = DataSourcePaneContext;

  private serviceS: any;

  state = {
    current: createStateMachine().initialState,
    dataSource: [...this.props.dataSource],
    dragId: undefined,
  };

  componentDidMount() {
    // @ts-ignore
    this.serviceS = this.context?.stateService?.subscribe?.((state) => {
      this.setState({ current: state });
      /* if (state.value === 'idle') {
          console.log('idle', this.props.dataSource);
          this.setState({
            dataSource: this.props.dataSource
          });
        } */
    });
  }

  componentWillUnmount() {
    this.serviceS?.unsubscribe?.();
  }

  componentDidUpdate(prevProps: DataSourceListProps) {
    // TODO
    if (
      JSON.stringify(prevProps.dataSource) !==
      JSON.stringify(this.props.dataSource)
    ) {
      this.setState({ dataSource: this.props.dataSource });
    }
  }

  deriveListDataSource = () => {
    const { onOperationClick, renderItemInfoTags } = this.props;
    const { dataSource, current } = this.state;
    let listMode = 'normal';
    if (current.matches('sort')) {
      listMode = 'sorting';
    } else if (current.matches('export')) {
      listMode = 'exporting';
    }
    const operations = OPERATIONS.map((i) => ({
      ...i,
      visible: i.type === 'view' || listMode === 'normal',
    }));
    if (dataSource.length === 0) {
      return (
        <span className={generateClassName('list-empty')}>{intl('NoDataSourceFound')}</span>
      );
    }
    return (
      dataSource?.map((item) => (
        <li key={item.id}>
          <DroppableDataSourceListItem
            renderInfoTags={renderItemInfoTags}
            mode={listMode}
            onStartDrag={this.handleStartDrag}
            onDragOver={this.handleDragOver}
            onDrop={this.handleDrop}
            dataSource={item}
            onOperationClick={onOperationClick}
            operations={operations}
            onToggleSelect={this.handleToggleSelect}
            selected={
              current.context.export.selectedDataSourceIdList.indexOf(
                item.id,
              ) !== -1
            }
          />
        </li>
      )) || []
    );
  };

  handleStartDrag = (dragId: string) => {
    // TODO fires twice
    // console.log('start drag', dragId);
    this.setState({ dragId });
    // this.setState({ dataSource: this.state.dataSource.slice() });
  };

  handleDragOver = (dragOverId: string) => {
    // console.log('drag over', dragOverId);
    this.setState(({ dataSource }) => {
      const nextDataSource = dataSource.slice();
      const fromItemIndex = nextDataSource.findIndex(
        (i) => i.id === this.state.dragId,
      );
      const fromItem = nextDataSource[fromItemIndex];
      const toItemIndex = nextDataSource.findIndex((i) => i.id === dragOverId);
      const toItem = nextDataSource[toItemIndex];
      nextDataSource[fromItemIndex] = toItem;
      nextDataSource[toItemIndex] = fromItem;
      return { dataSource: nextDataSource };
    });
  };

  handleDrop = () => {
    this.context.stateService.send({
      type: 'SAVE_SORT',
      payload: this.state.dataSource,
    });
  };

  handleToggleSelect = (dataSourceId: string) => {
    this.context.stateService.send({
      type: 'EXPORT.toggleSelect',
      dataSourceId,
    });
  };

  render() {
    return (
      <div className={generateClassName('list')}>
        <ul className={generateClassName('list-wrap')}>
          {this.deriveListDataSource()}
        </ul>
      </div>
    );
  }
}
