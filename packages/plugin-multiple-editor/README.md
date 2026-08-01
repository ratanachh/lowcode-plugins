# Multiple file editor

This plugin lets you organize code in an arbitrarily nested file tree inside the Lowcode Engine.

## Demo

```ts
import multipleFileCodeEditorFactory from '@rchh/lowcode-plugin-multiple-editor';

import { PrettierPlugin } from '@rchh/lowcode-plugin-multiple-editor/es/plugins/prettier-plugin';


const PLUGIN_NAME = 'multiple-file-code-editor';
// See the TypeScript type declarations for the full set of options
const plugin: any = multipleFileCodeEditorFactory({
  softSave: true, // when true, saving stores the code on the plugin instance instead of calling the engine's importSchema
  es6: true, // compile option; when true only es module compilation is performed
  // Plugins can be used to extend the functionality of the code editor
  plugins: [searchPlugin as any, lintPlugin, new PrettierPlugin()],
  // Built-in hook for running setup work when the plugin initializes, e.g. adding type declarations
  onInstall(controller: EditorController) {
    for (const [path, content] of extraLibList) {
      controller.addExtraLib(content, path);
    }
    controller.addComponentDeclarations(declarations);
    controller.onImportSchema(async (schema) => {
      // Todo sth.
    });
    window.codeEditorController = controller;
  },
  defaultFiles: {
    utils: `
export function helloWorld() {
  console.log('hello world');
}
    `
  }
});

plugin.pluginName = PLUGIN_NAME;

await plugins.register(plugin);
```

## How it works

Every time you save while using this plugin:

1. The code is compiled and an `__initExtra` function is generated; it initializes the real definitions of every method and lifecycle hook
1. The `constructor` body is modified to call `__initExtra`. The constructor runs inside the rendering engine, and once it completes all methods and lifecycle hooks have their real definitions
1. A file map is stored on the schema at `schema.componentsTree[0]._sourceCodeMap`

## Usage notes

1. Replacing every `project.importSchema` and `project.exportSchema` call with `codeEditorController.importSchema` and `codeEditorController.exportSchema` is recommended, because the plugin needs to post-process the file contents
2. Functions and variables cannot be defined in `index.js` outside of the class; define them in another file instead
3. Expressions cannot be used in the `state` definition of the `index.js` class
4. To use type definitions inside a setter, enable singleton mode for base-editor by calling the following at your application entry point
5. If the lowcode project uses code generation, the generator must be customized to emit the files from `_sourceCodeMap` into the project and to fix up the file references; the exact approach is up to you

__Using singleton mode__
```ts
import { configure } from '@rchh/lowcode-plugin-base-monaco-editor';
configure({ singleton: true });
```
