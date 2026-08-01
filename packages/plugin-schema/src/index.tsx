import * as React from 'react';
import { IPublicModelPluginContext } from '@rchh/lowcode-types';
import PluginSchema from './editor';
import { enUS, zhCN, intl } from './locale';

const plugin = (ctx: IPublicModelPluginContext, options: any) => {
  return {
    // Plugin initializer, called right after the engine has been initialized
    init() {
      const { intl, intlNode, getLocale } = ctx.common.utils.createIntl({
        'en-US': enUS,
        'zh-CN': zhCN,
      });
      ctx.intl = intl;
      ctx.intlNode = intlNode;
      ctx.getLocale = getLocale;
      const isProjectSchema = (options && options['isProjectSchema']) === true;

      // Add a pane to the engine
      ctx.skeleton.add({
        area: 'leftArea',
        name: 'LowcodePluginAliLowcodePluginSchema',
        type: 'PanelDock',
        props: {
          align: 'bottom',
          icon: 'ellipsis',
          description: 'Schema',
        },
        panelProps: {
          width: 'calc(100% - 50px)',
        },
        content: () => (
          <PluginSchema
            pluginContext={ctx}
            showProjectSchema={isProjectSchema}
          />
        ),
      })
    },
  };
};

plugin.pluginName = 'LowcodePluginAliLowcodePluginSchema';
plugin.meta = {
  preferenceDeclaration: {
    title: intl('SchemaPanePreferenceTitle'),
    properties: [
      {
        key: 'isProjectSchema',
        type: 'boolean',
        description: intl('IsProjectSchema'),
        default: false,
      },
    ],
  },
};

export default plugin;
