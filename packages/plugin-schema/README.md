# lowcode-plugin-@rchh/lowcode-plugin-schema [![][npm-image]][npm-url]

show lowcode schema
View the Lowcode Engine schema

---

## Usage

### Register the plugin
#### Show the page-level schema
```jsx
import { plugins } from '@rchh/lowcode-engine';
import LowcodePluginAliLowcodePluginSchema from '@rchh/lowcode-plugin-schema';

// Register with the engine
plugins.register(LowcodePluginAliLowcodePluginSchema);
```
#### Show the project-level schema
```jsx
import { plugins } from '@rchh/lowcode-engine';
import LowcodePluginAliLowcodePluginSchema from '@rchh/lowcode-plugin-schema';

// Register with the engine
plugins.register(LowcodePluginAliLowcodePluginSchema, { isProjectSchema: true });
```

### Plugin properties & methods

#### isProjectSchema
- description: 'Whether to show the project-level schema'
- type: 'boolean'
- default: false

### Plugin dependencies
None
