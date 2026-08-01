import React, { PureComponent } from 'react';
import { Message, Button } from '@alifd/next';
import { InterpretDataSourceConfig } from '@rchh/lowcode-types';
import { Project, Event, Setters } from '@rchh/lowcode-shell';
import Logger from 'zen-logger';
import _get from 'lodash/get';
import _set from 'lodash/set';
import _isEmpty from 'lodash/isEmpty';
import _isFunction from 'lodash/isFunction';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { EditorContext } from '../utils/editor-context';
import { DataSourcePane } from './DataSourcePane';
import { DataSourceFilter } from '../components/DataSourceFilter';
import { DataSourceList } from '../components/DataSourceList';
import { DroppableDataSourceListItem } from '../components/DataSourceListItem';
import {
  DataSourcePaneImportPlugin,
  DataSourceType,
  DataSourceConfig,
} from '../types';
import { DataSourceImportPluginCode } from '../components/DataSourceImportPluginCode';
import { JSFunctionComp } from '../components/Forms';
import { ErrorBoundary } from 'react-error-boundary';
import { isSchemaValid, correctSchema } from '../utils/schema';
import { createStateService } from '../utils/stateMachine';
import { DataSourcePaneContext } from '../utils/panel-context';
import { mergeTwoObjectListByKey } from '../utils/misc';
import { common } from '@rchh/lowcode-engine';
import { intl } from '../locale';

import './index.scss';

export interface DataSource {
  list: InterpretDataSourceConfig[];
}

export { DataSourceForm } from '../components/DataSourceForm';

const PLUGIN_NAME = 'dataSourcePane';

export interface DataSourcePanePluginProps {
  event: Event;
  project: Project;
  setters: Setters | null;
  importPlugins?: DataSourcePaneImportPlugin[];
  dataSourceTypes: DataSourceType[];
  exportPlugins?: DataSourcePaneImportPlugin[];
  logger: Logger;
  // For testing
  defaultSchema?: DataSource | (() => DataSource);
  onSchemaChange?: (schema: DataSource) => void;
  onError?: (error: Error) => void;
}

export interface DataSourcePanePluginState {
  /** Whether the pane is open */
  active: boolean;
  panelKey: number;
}

export { DataSourcePaneImportPlugin, DataSourceType, DataSourceConfig };

const BUILTIN_IMPORT_PLUGINS: DataSourcePaneImportPlugin[] = [
  {
    name: 'default',
    title: intl('SourceCode'),
    component: DataSourceImportPluginCode,
  },
];

// TODO
export function createDataSourcePane() {}

export default class DataSourcePanePlugin extends PureComponent<
  DataSourcePanePluginProps,
  DataSourcePanePluginState
> {
  static displayName = 'DataSourcePanePlugin';

  static defaultProps = {
    dataSourceTypes: [],
    importPlugins: [],
    exportPlugins: [],
  };

  stateService = createStateService();

  state = {
    active: false,
    panelKey: 1,
  };

  constructor(props: DataSourcePanePluginProps) {
    super(props);
    // The first active event does not reach the listener
    this.state.active = true;

    const { event } = this.props;
    // @todo pluginName, to unsubscribe
    event.on('skeleton.panel-dock.active', (pluginName: string) => {
      if (pluginName === PLUGIN_NAME) {
        this.setState({ active: true });
      }
    });
    event.on('skeleton.panel-dock.unactive', (pluginName: string) => {
      if (pluginName === PLUGIN_NAME) {
        this.setState({ active: false });
      }
    });

    this.handleSchemaChange.bind(this);
  }

  componentDidMount() {
    this.stateService.start();
  }

  componentWillUnmount() {
    this.stateService.stop();
  }

  handleSchemaChange = (schema: DataSource) => {
    const { project, onSchemaChange } = this.props;
    if (project) {
      const docSchema = project.exportSchema(common.designerCabin.TransformStage.Save);
      if (!_isEmpty(docSchema)) {
        _set(docSchema, 'componentsTree[0].dataSource', schema);
        project.importSchema(docSchema);
      }
    }

    onSchemaChange?.(schema);
  };

  handleReset = () => {
    this.setState(({ panelKey }) => ({ panelKey: panelKey + 1 }));
  };

  render() {
    const {
      importPlugins,
      exportPlugins,
      dataSourceTypes,
      defaultSchema,
      project,
      logger,
      onError,
      setters,
    } = this.props;
    const { active, panelKey } = this.state;

    if (!active) return null;

    const projectSchema = project.exportSchema(common.designerCabin.TransformStage.Save) ?? {};
    let schema = defaultSchema;
    if (_isFunction(defaultSchema)) {
      schema = defaultSchema();
    }
    if (!schema) {
      schema = _get(projectSchema, 'componentsTree[0].dataSource');
    }
    if (!isSchemaValid(schema)) {
      logger.warn('Found an invalid schema', schema);
      schema = correctSchema(schema);
      logger.log('Corrected the schema', schema);
    }

    return (
      <EditorContext.Provider value={{ project, logger, setters }}>
        <DataSourcePaneContext.Provider
          value={{ stateService: this.stateService, dataSourceTypes }}
        >
          <DndProvider backend={HTML5Backend}>
            <ErrorBoundary
              onError={onError}
              FallbackComponent={ErrorFallback}
              onReset={this.handleReset}
              resetKeys={[panelKey]}
            >
              { /* @ts-ignore */ }
              <DataSourcePane
                key={panelKey + 1}
                importPlugins={mergeTwoObjectListByKey(
                  BUILTIN_IMPORT_PLUGINS as unknown as Array<Record<string, unknown>>,
                  importPlugins as unknown as Array<Record<string, unknown>>,
                  'name',
                )}
                exportPlugins={mergeTwoObjectListByKey(
                  BUILTIN_IMPORT_PLUGINS as unknown as Array<Record<string, unknown>>,
                  exportPlugins as unknown as Array<Record<string, unknown>>,
                  'name',
                )}
                dataSourceTypes={dataSourceTypes}
                initialSchema={schema}
                onSchemaChange={this.handleSchemaChange}
              />
            </ErrorBoundary>
          </DndProvider>
        </DataSourcePaneContext.Provider>
      </EditorContext.Provider>
    );
  }
}

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}
function ErrorFallback(props: ErrorFallbackProps) {
  return (
    <Message type="error" shape="addon" title={intl('RenderError')}>
      {props.error.message}
      <Button onClick={props.resetErrorBoundary}>{intl('RefreshPane')}</Button>
    </Message>
  );
}

export {
  DataSourceImportPluginCode,
  JSFunctionComp,
  DataSourcePane,
  DataSourceList,
  DroppableDataSourceListItem,
  DataSourceFilter,
  DataSourcePaneContext,
  createStateService,
};

export * from '../datasource-types';
export * from '../types';
