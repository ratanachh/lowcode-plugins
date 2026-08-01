import React, { PureComponent } from 'react';
import { Button, MenuButton } from '@alifd/next';
import { RuntimeDataSourceConfig as DataSourceConfig } from '@rchh/lowcode-datasource-types';
import _isArray from 'lodash/isArray';
import { generateClassName } from '../../utils/misc';
import { DataSourcePaneImportPlugin, DataSourceType, DataSourcePanelMode } from '../../types';
import { intl } from '../../locale';

const { Item: MenuButtonItem } = MenuButton;

// function deriveTypeFromValue(val: any) {
//   if (_isBoolean(val)) return 'bool';
//   if (_isNumber(val)) return 'number';
//   if (_isPlainObject(val)) return 'obj';
//   return 'string';
// }

export interface DataSourceOperationsProps {
  importPlugins?: DataSourcePaneImportPlugin[];
  dataSourceTypes: DataSourceType[];
  dataSource: DataSourceConfig[];
  onCreate?: (dataSourceType: string) => void;
  onImport?: (importPluginName: string) => void;
  onStartSort?: () => void;
  onFinishSort?: () => void;
  onCancelSort?: () => void;
  onStartExport?: () => void;
  onFinishExport?: () => void;
  onCancelExport?: () => void;
  selectedList: string[];
  mode: DataSourcePanelMode;
  empty: boolean;
}

export class DataSourceOperations extends PureComponent<DataSourceOperationsProps> {
  handleDataSourceFormBtnClick = (dataSourceType: string) => {
    this.props.onCreate?.(dataSourceType);
  };

  handleDataSourceFormMenuBtnClick = (dataSourceType: string) => {
    this.props.onCreate?.(dataSourceType);
  };

  handleImportDataSourceMenuBtnClick = (importPluginName: string) => {
    // TODO: figure out what this is
    // @ts-ignore
    this.props.onImport?.({
      name: importPluginName,
    } as unknown as DataSourceConfig);
  };

  renderOperatons = () => {
    const { importPlugins, dataSourceTypes, mode, selectedList, empty } =
      this.props;

    if (mode === DataSourcePanelMode.SORTING) {
      return [
        <Button onClick={this.props.onFinishSort}>{intl('Done')}</Button>,
        <Button text onClick={this.props.onCancelSort}>
          {intl('Cancel')}
        </Button>,
      ];
    }
    if (mode === DataSourcePanelMode.EXPORTING) {
      return [
        <Button
          disabled={selectedList.length === 0}
          key="do-export"
          onClick={this.props.onFinishExport}
        >
          {intl('ExportSelected', { count: selectedList.length })}
        </Button>,
        <Button text key="finish-export" onClick={this.props.onCancelExport}>
          {intl('Cancel')}
        </Button>,
      ];
    }

    return [
      _isArray(dataSourceTypes) && dataSourceTypes.length > 0 ? (
        <MenuButton
          key="create"
          label={intl('Create')}
          onItemClick={this.handleDataSourceFormMenuBtnClick}
        >
          {dataSourceTypes.map((type) => (
            <MenuButtonItem key={type.type}>{type.type}</MenuButtonItem>
          ))}
        </MenuButton>
      ) : _isArray(dataSourceTypes) && dataSourceTypes.length === 1 ? (
        <Button
          key="create"
          onClick={this.handleDataSourceFormBtnClick.bind(
            this,
            dataSourceTypes[0].type,
          )}
        >
          {intl('Create')}
        </Button>
      ) : null,
      !empty ? (
        <Button text key="sort" onClick={this.props.onStartSort}>
          {intl('Sort')}
        </Button>
      ) : null,
      _isArray(importPlugins) && importPlugins.length > 1 ? (
        <MenuButton
          text
          key="import"
          label={intl('Import')}
          onItemClick={this.handleImportDataSourceMenuBtnClick}
        >
          {importPlugins.map((plugin) => (
            <MenuButtonItem key={plugin.name}>{plugin.name}</MenuButtonItem>
          ))}
        </MenuButton>
      ) : _isArray(importPlugins) && importPlugins.length === 1 ? (
        <Button
          key="import"
          onClick={this.handleImportDataSourceMenuBtnClick.bind(
            this,
            importPlugins[0].name,
          )}
          text
        >
          {intl('Import')}
        </Button>
      ) : null,
      !empty ? (
        <Button text key="export" onClick={this.props.onStartExport}>
          {intl('Export')}
        </Button>
      ) : null,
    ];
  };

  render() {
    return (
      <div className={generateClassName('operations')}>
        {this.renderOperatons()}
      </div>
    );
  }
}
