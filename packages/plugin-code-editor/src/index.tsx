import { CodeEditorPane } from './pane';
import { project } from '@rchh/lowcode-engine';
import icon from './icon';
import { IPublicModelPluginContext } from '@rchh/lowcode-types';
import { intl } from './locale';

const plugin = (ctx: IPublicModelPluginContext) => {
  return {
    name: 'codeEditor',
    width: 600,
    // Plugins this one depends on (array of plugin names)
    dep: [],
    // Data and methods exposed by the plugin
    exports() {
      return {};
    },
    // Plugin initializer, called right after the engine has been initialized
    init() {
      const codeEditorDock = ctx.skeleton.add({
        area: 'leftArea',
        name: 'codeEditor',
        type: 'PanelDock',
        props: {
          icon,
          description: intl('SourcePane'),
        },
        panelProps: {
          width: '600px',
          title: intl('SourcePane'),
        },
        content: (
          <CodeEditorPane
            event={ctx.event}
            skeleton={ctx.skeleton}
            project={ctx.project}
          />
        ),
      });

      codeEditorDock && codeEditorDock.disable();
      project.onSimulatorRendererReady(() => {
        codeEditorDock.enable();
      });
    },
  };
};

plugin.pluginName = 'codeEditor';

export default plugin;
