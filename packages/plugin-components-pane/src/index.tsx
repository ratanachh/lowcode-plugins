import { IPublicModelPluginContext } from '@rchh/lowcode-types';
import ComponentsPane from './pane';
import { intl } from './locale';

const ENGINE_TO_PANE_LANG: Record<string, string> = {
  'en-US': 'en_US',
  en_US: 'en_US',
  'zh-CN': 'zh_CN',
  zh_CN: 'zh_CN',
};

const DEFAULT_PANE_LANG = 'en_US';

function resolvePaneLang(locale?: string): string {
  if (!locale) {
    return DEFAULT_PANE_LANG;
  }
  return (
    ENGINE_TO_PANE_LANG[locale] ||
    ENGINE_TO_PANE_LANG[locale.replace('_', '-')] ||
    DEFAULT_PANE_LANG
  );
}

function getEngineLocale(): string | undefined {
  try {
    const engine = (window as any).AliLowCodeEngine;
    return engine?.common?.editorCabin?.globalLocale?.getLocale?.();
  } catch {
    return undefined;
  }
}

const ComponentPanelPlugin = (ctx: IPublicModelPluginContext) => {
  return {
    async init() {
      const { skeleton, project } = ctx;
      // Register the components pane (default English; follows engine locale when set)
      const componentsPane = skeleton.add({
        area: 'leftArea',
        type: 'PanelDock',
        name: 'componentsPane',
        content: ComponentsPane,
        contentProps: {
          lang: resolvePaneLang(getEngineLocale()),
        },
        props: {
          align: 'top',
          icon: 'zujianku',
          description: intl('ComponentLibrary'),
        },
      });
      componentsPane?.disable?.();
      project.onSimulatorRendererReady(() => {
        componentsPane?.enable?.();
      });
    },
  };
};
ComponentPanelPlugin.pluginName = 'ComponentPanelPlugin';
export default ComponentPanelPlugin;

