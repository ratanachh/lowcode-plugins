import React from 'react';
import {
  plugins,
  skeleton,
  project,
  setters,
} from '@rchh/lowcode-engine';
import AliLowCodeEngineExt from '@rchh/lowcode-engine-ext';
import { Button } from '@alifd/next';
// import UndoRedoPlugin from '@rchh/lowcode-plugin-undo-redo';
import ComponentsPane from '@rchh/lowcode-plugin-components-pane';
import ZhEnPlugin from '@rchh/lowcode-plugin-zh-en';
// import DataSourcePanePlugin from '@rchh/lowcode-plugin-datasource-pane';
import SchemaPlugin from '@rchh/lowcode-plugin-schema';
// import CodeEditor from '@rchh/lowcode-plugin-code-editor';
import ManualPlugin from '@rchh/lowcode-plugin-manual';
import Inject, { injectAssets } from '@rchh/lowcode-plugin-inject';
import SimulatorResizer from '@rchh/lowcode-plugin-simulator-select';

// Register with the engine
import TitleSetter from '@alilc/lowcode-setter-title';
import BehaviorSetter from '../../setters/behavior-setter';
import CustomSetter from '../../setters/custom-setter';
import Logo from '../../sample-plugins/logo';

import {
  loadIncrementalAssets,
  getPageSchema,
  saveSchema,
  resetSchema,
  preview,
  getProjectSchemaFromLocalStorage,
} from '../../universal/utils';
import assets from './assets.json';
import schema from './schema.json';

export default async function registerPlugins() {
  await plugins.register(ManualPlugin);

  await plugins.register(Inject);

  // See the plugin API at https://yuque.antfin.com/ali-lowcode/docs/cdukce
  SchemaPlugin.pluginName = 'SchemaPlugin';
  await plugins.register(SchemaPlugin);

  (SimulatorResizer as any).pluginName = 'SimulatorResizer';
  plugins.register(SimulatorResizer);

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

        material.setAssets(await injectAssets(assets));

        // Load the schema
        project.openDocument(
          getProjectSchemaFromLocalStorage('basic-fusion')
            .componentsTree?.[0] || schema
        );
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

  // Register undo / redo
  // await plugins.register(UndoRedoPlugin);

  // Register the Chinese / English switcher
  await plugins.register(ZhEnPlugin);

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
          content: (
            <Button onClick={() => saveSchema('basic-fusion')}>
              Save locally
            </Button>
          ),
        });
        skeleton.add({
          name: 'resetSchema',
          area: 'topArea',
          type: 'Widget',
          props: {
            align: 'right',
          },
          content: (
            <Button onClick={() => resetSchema('basic-fusion')}>
              Reset page
            </Button>
          ),
        });
        hotkey.bind('command+s', (e) => {
          e.preventDefault();
          saveSchema('basic-fusion');
        });
      },
    };
  };
  saveSample.pluginName = 'saveSample';
  await plugins.register(saveSample);

  // DataSourcePanePlugin.pluginName = 'DataSourcePane';
  // await plugins.register(DataSourcePanePlugin);

  // CodeEditor.pluginName = 'CodeEditor';
  // await plugins.register(CodeEditor);

  // Register the code generation plugin
  // CodeGenPlugin.pluginName = 'CodeGenPlugin';
  // await plugins.register(CodeGenPlugin);

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
            <Button type="primary" onClick={() => preview('basic-fusion')}>
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
