## Ali Lowcode Engine Plugins

### Install dependencies

The lerna setup at the repository root is currently broken, so do not run `npm i` there. Enter `packages/*` and run `npm i` instead.

### Run locally

Enter `packages/*` and run `npm run start`.

### Build locally

Enter `packages/*` and run `npm run build`.

### Publish

You first need npm publish access to the `@alilc` scope and a successful `npm login`.

Bump the version, then enter `packages/*` and run `npm publish`.

## Plugin list

- base-monaco-editor
- plugin-code-editor
- plugin-schema
- plugin-undo-redo
- plugin-zh-cn
- plugin-block
- action-block
