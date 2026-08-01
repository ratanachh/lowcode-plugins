import { init, plugins } from '@rchh/lowcode-engine';
import { createFetchHandler } from '@rchh/lowcode-datasource-fetch-handler';
import registerPlugins from './plugin';
import { scenarioSwitcher } from '../../sample-plugins/scenario-switcher';
import '../../universal/global.scss';

const preference = new Map();
preference.set('DataSourcePane', {
  importPlugins: [],
  dataSourceTypes: [
    {
      type: 'fetch',
    },
    {
      type: 'jsonp',
    },
  ],
});

(async function main() {
  await plugins.register(scenarioSwitcher);
  await registerPlugins();

  init(
    document.getElementById('lce-container')!,
    {
      // designMode: 'live',
      // locale: 'zh-CN',
      enableCondition: true,
      enableCanvasLock: true,
      // Variables bound by default
      supportVariableGlobally: true,
      // simulatorUrl does not need to be configured when it shares a parent path with engine-core.js!
      // Here the alifd CDN is used, so engine-core.js and react-simulator-renderer.js live in different npm packages and paths
      simulatorUrl: [
        'https://alifd.alicdn.com/npm/@rchh/lowcode-react-simulator-renderer@latest/dist/css/react-simulator-renderer.css',
        'https://alifd.alicdn.com/npm/@rchh/lowcode-react-simulator-renderer@latest/dist/js/react-simulator-renderer.js',
      ],
      requestHandlersMap: {
        fetch: createFetchHandler(),
      },
    } as any,
    preference
  );
})();
