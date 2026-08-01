# @rchh/lowcode-plugin-resource-tabs [![][npm-image]][npm-url]


---

## Usage

### Register the plugin
```jsx
import { plugins } from '@rchh/lowcode-engine';
import PluginResourceTabs from '@rchh/lowcode-plugin-resource-tabs';

// Register with the engine
plugins.register(PluginResourceTabs);
```

### Plugin properties & methods

#### appKey
- description: 'Unique identifier used to cache the application tabs'
- type: 'string'

### tabClassName
- description: 'Tab className'

### shape
- type: 'string',
- description: 'Tab shape'

### onSort
- type: 'function',
- description: 'tabs sort function',

### Plugin dependencies

This plugin depends on the following plugins:

| Plugin name | Package name |
| --- | --- |
