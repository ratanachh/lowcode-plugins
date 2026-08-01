import * as React from 'react';
import { IPublicModelPluginContext } from '@rchh/lowcode-types';
import { default as BlockPane } from './pane';
import { intl } from './locale';

const LowcodePluginCusPlugin = (ctx: IPublicModelPluginContext) => {
  return {
    // Plugin name, unique within the registration environment
    name: 'LowcodePluginCusPlugin',
    // Plugins this one depends on (array of plugin names)
    dep: [],
    // Data and methods exposed by the plugin
    exports() {
      return {
        data: 'This is how a plugin can expose its data',
        func: () => {
          console.log('Methods work the same way');
        },
      }
    },
    // Plugin initializer, called right after the engine has been initialized
    init() {
      // Methods and properties exposed by other plugins are available here
      // const { data, func } = ctx.plugins.pluginA;
      // func(); 

      // console.log(options.name);

      // Add a pane to the engine
      ctx.skeleton.add({
        area: 'leftArea',
        name: 'blockPane',
        type: 'PanelDock',
        props: {
          icon: <img src='https://i.ablula.tech/portal/block.svg' style={{ filter: 'brightness(1)' }} />,
          description: intl('BlockPane'),
        },
        content: BlockPane,
      });

      ctx.logger.log('Log something');
    },
  };
};

LowcodePluginCusPlugin.pluginName = 'BlockPlugin';

export default LowcodePluginCusPlugin;
