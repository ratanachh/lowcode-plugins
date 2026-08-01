import DataSourcePanePlugin from './pane';

import {
  DataSourcePaneImportPlugin,
  DataSourceType,
} from './types';
import { IPublicModelPluginContext } from '@rchh/lowcode-types';
import { intl } from './locale';

export interface Options {
  importPlugins?: DataSourcePaneImportPlugin[];
  dataSourceTypes: DataSourceType[];
  exportPlugins?: DataSourcePaneImportPlugin[];
}

// TODO: the 2.0 plugin argument shape changed and no longer supports a bare `options: Options`
const plugin = (ctx: IPublicModelPluginContext, options: Options) => {
  return {
    name: 'com.alibaba.lowcode.datasource.pane',
    width: 300,
    // Plugins this one depends on (array of plugin names)
    dep: [],
    // Data and methods exposed by the plugin
    exports() {
      return {};
    },
    // Plugin initializer, called right after the engine has been initialized
    init() {
      const dataSourceTypes = ctx.preference.getPreferenceValue('dataSourceTypes') || options.dataSourceTypes;
      const importPlugins = ctx.preference.getPreferenceValue('importPlugins') || options.importPlugins;
      const schemaDock = ctx.skeleton.add({
        area: 'leftArea',
        name: 'dataSourcePane',
        type: 'PanelDock',
        props: {
          icon: 'shujuyuan',
          description: intl('DataSource'),
        },
        panelProps: {
          width: '300px',
          // title: 'Source code pane',
        },
        content: DataSourcePanePlugin,
        contentProps: {
          importPlugins,
          dataSourceTypes,
          event: ctx.event,
          project: ctx.project,
          logger: ctx.logger,
          setters: ctx.setters,
        },
      });

      schemaDock && schemaDock.disable();
      ctx.project.onSimulatorRendererReady(() => {
        schemaDock.enable();
      });
    },
  };
};

plugin.pluginName = 'DataSourcePane';
plugin.meta = {
  preferenceDeclaration: {
    title: intl('PluginPreferenceTitle'),
    properties: [{
      key: 'importPlugins',
      type: 'array',
      description: '',
    }, {
      key: 'dataSourceTypes',
      type: 'array',
      description: intl('DataSourceType'),
    }],
  },
};

export default plugin;
