import { RuntimeDataSourceConfig as DataSourceConfig } from '@rchh/lowcode-datasource-types';
import { DataSourceType } from './DataSourceType';

// Import plugin
export interface DataSourcePaneImportPlugin {
  name: string;
  title: string;
  component: React.ReactNode;
  componentProps?: DataSourcePaneImportPluginCustomProps;
}

export interface DataSourcePaneImportPluginCustomProps extends DataSourcePaneImportPluginComponentProps {
  [customPropName: string]: any;
}

export interface DataSourcePaneImportPluginComponentProps {
  dataSourceTypes: DataSourceType[];
  onImport?: (dataSourceList: DataSourceConfig[]) => void;
  onCancel?: () => void;
}

export { DataSourceConfig };
