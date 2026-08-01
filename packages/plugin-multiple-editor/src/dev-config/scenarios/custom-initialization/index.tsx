import { common, plugins, config } from '@rchh/lowcode-engine';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { createFetchHandler } from '@rchh/lowcode-datasource-fetch-handler';
import { scenarioSwitcher } from '../../sample-plugins/scenario-switcher';
import registerPlugins from '../../universal/plugin';
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

  const Workbench = common.skeletonCabin.Workbench;
  function EditorView() {
    /** Whether the plugins finished initializing; the Workbench can only render afterwards */
    const [hasPluginInited, setHasPluginInited] = useState(false);

    useEffect(() => {
      plugins
        .init(preference)
        .then(() => {
          setHasPluginInited(true);
        })
        .catch((err) => console.error(err));
    }, []);

    return hasPluginInited && <Workbench />;
  }

  config.setConfig({
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
  });
  // @ts-ignore
  ReactDOM.render(<EditorView />, document.getElementById('lce-container')!);
})();
