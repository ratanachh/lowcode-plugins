## Lowcode Engine - Data source pane plugin

Configures the data sources of a page.

An example of pluginProps

```
{
  importPlugins: [],
  exportPlugins: [],
  formComponents: {},
  tagSelector: () => {},
  dataSourceTypes: [
    {
      type: 'mopen',
      schema: {
        type: 'object',
        properties: {
          options: {
            type: 'object',
            properties: {
              uri: {
                title: 'api',
              },
              v: {
                title: 'v',
                type: 'string',
              },
              appKey: {
                title: 'appKey',
                type: 'string',
              },
            },
          },
        },
      },
    },
  ],
}
```

Using the preset data source types

```
import {
  DataSourceTypeFetch,
  DataSourceTypeJsonp,
  DataSourceTypeMtop,
} from '@rchh/lowcode-plugin-datasource-pane';
```

## How to customize

## Customizing data source types

### Type definition

`fetch`, `mtop` and `jsonp` are built in, and custom types can be passed in.

```
type DataSourceType = {
  type: string;
  optionsSchema: JSONSchema6
};
```

Data source types must be extended within the constraints of the group specification. For now, extra fields may only be added under `options`.

For example, the `mtop` type needs an `options.v` (version) field.

### formily components

### Drill-down

## Customizing data source info tags

Use the `renderDataSourceInfoTags` method to control what information a data source displays.

```
(dataSourceConfig) => {
  if (dataSourceConfig.type = 'fetch') {
    return [{
      type: 'primary',
      content: dataSourceConfig.type
    }];
  }
}
```

## Customizing import plugins

### Import component example

See pluginProps for how import components are wired in.
```
import { DataSourceImportPluginTest } from './DataSourceImportPluginTest';

{
  ...
    importPlugins: [
        {
            name: 'Import here',
            title: 'Import here',
            component: DataSourceImportPluginTest,
            componentProps: {
                onImport: (res) => {
                    console.log('ceshi ')

                },
                onCancel: () => {
                    console.log('ceshi2 ')

                }
            }
        }
    ],
        exportPlugins: [],
            formComponents: { },
  ...
}

// DataSourceImportPluginTest.jsx

/**
 * Source code import plugin
 * @todo associate types with the editor and provide detailed error messages
 */
import React, { PureComponent } from 'react';
import { Button } from '@alifd/next';
import _noop from 'lodash/noop';
import _isArray from 'lodash/isArray';
import _last from 'lodash/last';
import _isPlainObject from 'lodash/isPlainObject';
import { RuntimeDataSourceConfig as DataSourceConfig } from '@rchh/lowcode-datasource-types';
import { JSONSchema6 } from 'json-schema';
import type { ComponentType } from 'react';
export interface DataSourceType {
    type: string;
    schema: JSONSchema6;
    plugin?: ComponentType;
}
export interface DataSourcePaneImportPluginComponentProps {
    dataSourceTypes: DataSourceType[];
    onImport?: (dataSourceList: DataSourceConfig[]) => void;
    onCancel?: () => void;
}
export interface DataSourceImportPluginCodeProps
    extends DataSourcePaneImportPluginComponentProps {
    defaultValue?: DataSourceConfig[];
}
export interface DataSourceImportPluginCodeState {
    code: string;
    isCodeValid: boolean;
}
export class DataSourceImportPluginCode extends PureComponent<
    DataSourceImportPluginCodeProps,
    DataSourceImportPluginCodeState
> {
    handleComplete = () => {
        console.log('confirm')
    };
    onCancel = () => {
        console.log('cancel')
    };
    render() {
        return (
            <div className="lowcode-plugin-datasource-import-plugin-code">
                This code can be customized
                <p className="btns">
                    <Button onClick={this.onCancel}>Cancel</Button>
                    <Button type="primary" onClick={this.handleComplete}>
                        Confirm
                    </Button>
                </p>
            </div>
        );
    }
}

```

See DataSourceImportPluginCode for a concrete component
 [view](https://github.com/alibaba/lowcode-plugins/blob/main/packages/plugin-datasource-pane/src/components/DataSourceImportPluginCode/DataSourceImportPluginCode.tsx)

 demo screenshot
 ![Alt](https://user-images.githubusercontent.com/14235113/186659341-dff511e8-f032-423c-8be7-e0cc281f3964.png)




## Customizing export plugins

WIP

# Event hooks

# Dependencies

* formily v2
* xstate
* manaco
* react-dnd


# Differences from the previous version

* Supports exporting and custom export plugins
* Supports sorting
* Supports info tags
* Better experience when editing object parameters
* Supports expressions in field configuration

# Contributing

Merge requests are welcome

# Roadmap

* Detail page drill-down
* Internationalization support
* Unit tests


# References

* [Page building protocol specification](https://ratanachh.github.io/lowcode-engine/docs/specs/lowcode-spec)
