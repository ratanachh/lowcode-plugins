import React from 'react';
import {
  plugins,
  project,
} from '@rchh/lowcode-engine';
import AliLowCodeEngineExt from '@rchh/lowcode-engine-ext';
import { Button } from '@alifd/next';
import ComponentsPane from '@rchh/lowcode-plugin-components-pane';
import Inject, { injectAssets } from '@rchh/lowcode-plugin-inject';

// Register with the engine
import TitleSetter from '@alilc/lowcode-setter-title';
import BehaviorSetter from '../setters/behavior-setter';
import CustomSetter from '../setters/custom-setter';
import Logo from '../sample-plugins/logo';
import { deleteHiddenTransducer } from '../sample-plugins/delete-hidden-transducer';

import {
  loadIncrementalAssets,
  getPageSchema,
  saveSchema,
  resetSchema,
  preview,
} from './utils';
import assets from './assets.json';
import { registerRefProp } from '../sample-plugins/set-ref-prop';

export default async function registerPlugins() {
  await plugins.register(Inject);

  await plugins.register(registerRefProp);

  await plugins.register(deleteHiddenTransducer);

  const editorInit = (ctx: any) => {
    return {
      name: 'editor-init',
      async init() {
        // Change the setter of the breadcrumb separator property
        // const assets = await (
        //   await fetch(
        //     `https://alifd.alicdn.com/npm/@rchh/lowcode-materials/build/lowcode/assets-prod.json`
        //   )
        // ).json();
        // Set the material descriptions
        const { material, project } = ctx;

        await material.setAssets(await injectAssets(assets));

        const schema = await getPageSchema();

        // Load the schema
        project.openDocument(schema);
      },
    };
  };
  editorInit.pluginName = 'editorInit';
  await plugins.register(editorInit);

  const builtinPluginRegistry = (ctx: any) => {
    return {
      name: 'builtin-plugin-registry',
      async init() {
        const { skeleton } = ctx;
        // Register the logo pane
        skeleton.add({
          area: 'topArea',
          type: 'Widget',
          name: 'logo',
          content: Logo,
          contentProps: {
            logo: 'https://img.alicdn.com/imgextra/i4/O1CN013w2bmQ25WAIha4Hx9_!!6000000007533-55-tps-137-26.svg',
            href: 'https://lowcode-engine.cn',
          },
          props: {
            align: 'left',
          },
        });

        // Register the components pane
        const componentsPane = skeleton.add({
          area: 'leftArea',
          type: 'PanelDock',
          name: 'componentsPane',
          content: ComponentsPane,
          contentProps: {},
          props: {
            align: 'top',
            icon: 'zujianku',
            description: 'Component library',
          },
        });
        componentsPane?.disable?.();
        project.onSimulatorRendererReady(() => {
          componentsPane?.enable?.();
        });
      },
    };
  };
  builtinPluginRegistry.pluginName = 'builtinPluginRegistry';
  await plugins.register(builtinPluginRegistry);

  // Configure the built-in setters and the event / variable binding panes
  const setterRegistry = (ctx: any) => {
    const { setterMap, pluginMap } = AliLowCodeEngineExt;
    return {
      name: 'ext-setters-registry',
      async init() {
        const { setters, skeleton } = ctx;
        // Register the setter map
        setters.registerSetter(setterMap as any);
        // Register the plugins
        // Register the event binding pane
        skeleton.add({
          area: 'centerArea',
          type: 'Widget',
          content: pluginMap.EventBindDialog,
          name: 'eventBindDialog',
          props: {},
        });

        // Register the variable binding pane
        skeleton.add({
          area: 'centerArea',
          type: 'Widget',
          content: pluginMap.VariableBindDialog,
          name: 'variableBindDialog',
          props: {},
        });
      },
    };
  };
  setterRegistry.pluginName = 'setterRegistry';
  await plugins.register(setterRegistry);

  const loadAssetsSample = (ctx: any) => {
    return {
      name: 'loadAssetsSample',
      async init() {
        const { skeleton } = ctx;

        skeleton.add({
          name: 'loadAssetsSample',
          area: 'topArea',
          type: 'Widget',
          props: {
            align: 'right',
            width: 80,
          },
          content: (
            <Button onClick={loadIncrementalAssets}>Load assets asynchronously</Button>
          ),
        });
      },
    };
  };
  loadAssetsSample.pluginName = 'loadAssetsSample';
  await plugins.register(loadAssetsSample);

  // Register the save pane
  const saveSample = (ctx: any) => {
    return {
      name: 'saveSample',
      async init() {
        const { skeleton, hotkey } = ctx;

        skeleton.add({
          name: 'saveSample',
          area: 'topArea',
          type: 'Widget',
          props: {
            align: 'right',
          },
          content: <Button onClick={() => saveSchema()}>Save locally</Button>,
        });
        skeleton.add({
          name: 'resetSchema',
          area: 'topArea',
          type: 'Widget',
          props: {
            align: 'right',
          },
          content: <Button onClick={() => resetSchema()}>Reset page</Button>,
        });
        hotkey.bind('command+s', (e) => {
          e.preventDefault();
          saveSchema();
        });
      },
    };
  };
  saveSample.pluginName = 'saveSample';
  await plugins.register(saveSample);

  const previewSample = (ctx: any) => {
    return {
      name: 'previewSample',
      async init() {
        const { skeleton } = ctx;
        skeleton.add({
          name: 'previewSample',
          area: 'topArea',
          type: 'Widget',
          props: {
            align: 'right',
          },
          content: (
            <Button type="primary" onClick={() => preview()}>
              Preview
            </Button>
          ),
        });
      },
    };
  };
  previewSample.pluginName = 'previewSample';
  await plugins.register(previewSample);

  const customSetter = (ctx: any) => {
    return {
      name: '___registerCustomSetter___',
      async init() {
        const { setters } = ctx;

        setters.registerSetter('TitleSetter', TitleSetter);
        setters.registerSetter('BehaviorSetter', BehaviorSetter);
        setters.registerSetter('CustomSetter', CustomSetter);
      },
    };
  };
  customSetter.pluginName = 'customSetter';
  await plugins.register(customSetter);
}
