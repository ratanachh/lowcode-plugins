import { IPublicModelPluginContext } from '@rchh/lowcode-types';
import { IconQuestion } from './icon';
import { intl } from './locale';

const PluginManual = (ctx: IPublicModelPluginContext) => {
  return {
    init() {
      // Add a pane to the engine
      ctx.skeleton.add({
        area: 'leftArea',
        name: 'manualPane',
        type: 'PanelDock',
        props: {
          align: 'bottom',
          icon: IconQuestion,
          description: intl('HowToUse'),
          onClick() {
            window.open('https://lowcode-engine.cn/site/docs/demoUsage/intro', '_blank').focus();
          },
        },
      });
    },
  };
};

PluginManual.pluginName = 'PluginManual';

export default PluginManual;
