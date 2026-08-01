/* eslint-disable @typescript-eslint/indent */
/**
 * Source code import plugin
 * @todo associate types with the editor and provide detailed error messages
 */
import React, { PureComponent } from 'react';
import _isArray from 'lodash/isArray';
import _last from 'lodash/last';
import _isPlainObject from 'lodash/isPlainObject';
import MonacoEditor from '@rchh/lowcode-plugin-base-monaco-editor';
import type { editor } from 'monaco-editor';
import { RuntimeDataSourceConfig as DataSourceConfig } from '@rchh/lowcode-datasource-types';
import Ajv from 'ajv';
import { DataSourcePaneImportPluginComponentProps } from '../../types';
import { intl } from '../../locale';

// import './import-plugins/code.scss';

export interface DataSourceImportProps
  extends DataSourcePaneImportPluginComponentProps {
  defaultValue?: DataSourceConfig[];
}

export interface DataSourceImportState {
  code: string;
  isCodeValid: boolean;
}

export class DataSourceImport extends PureComponent<
  DataSourceImportProps,
  DataSourceImportState
> {
  static defaultProps = {
    defaultValue: [
      {
        type: 'fetch',
        isInit: false,
        options: {
          method: 'GET',
          isCors: true,
          timeout: 5000,
          uri: '/info',
          params: {},
          headers: {}
        },
        id: 'info'
      }
    ],
  };

  state = {
    code: '',
    isCodeValid: true,
  };

  submit = () => {
    return new Promise((resolve, reject) => {
      const { isCodeValid, code } = this.state;

      if (!isCodeValid) reject(new Error(intl('InvalidImportFormat')));

      // Only resolve the data that passes schema validation
      resolve(this.deriveValue(JSON.parse(code)));
    });
  };

  private monacoRef: any;

  constructor(props: DataSourceImportProps) {
    super(props);
    this.state.code = JSON.stringify(this.deriveValue(this.props.defaultValue), null, 2);
    this.handleEditorDidMount = this.handleEditorDidMount.bind(this);
    this.handleEditorChange = this.handleEditorChange.bind(this);
    this.handleComplete = this.handleComplete.bind(this);
  }

  deriveValue = (value: any) => {
    const { dataSourceTypes } = this.props;

    if (!_isArray(dataSourceTypes) || dataSourceTypes.length === 0) return [];

    let result = value;
    if (_isPlainObject(result)) {
      // Wrap a plain object into an array
      result = [result];
    } else if (!_isArray(result)) {
      return [];
    }

    const ajv = new Ajv();

    return (result as DataSourceConfig[]).filter((dataSource) => {
      if (!dataSource.type) return false;

      const dataSourceType = dataSourceTypes.find(
        (type) => type.type === dataSource.type,
      );

      if (!dataSourceType) return false;

      // Backwards compatibility
      if (dataSourceType.schema) {
        // Warn the user about data sources that fail validation
        const validate = ajv.compile(dataSourceType.schema)
        const valid = validate(dataSource)
        if (!valid) console.warn(validate.errors)
        return valid
      } else {
        // When no schema validation rule is provided, accept the data source
        return true
      }
    });
  };

  /**
   * Appears to be unused.
   * @deprecated
   */
  handleComplete = () => {
    if (this.monacoRef) {
      if (
        !this.monacoRef
          .getModelMarkers()
          .find((marker: editor.IMarker) => marker.owner === 'json')
      ) {
        this.setState({ isCodeValid: true });
        const model: any = _last(this.monacoRef.getModels());
        if (!model) return;
        this.props.onImport?.(this.deriveValue(JSON.parse(model.getValue())));
        return;
      }
    }
    this.setState({ isCodeValid: false });
  };

  handleEditorChange = (newValue: string) => {
    if (this.monacoRef) {
      if (
        !this.monacoRef
          .getModelMarkers()
          .find((marker: editor.IMarker) => marker.owner === 'json')
      ) {
        this.setState({ isCodeValid: true, code: newValue });
      }
    }
  };

  handleEditorDidMount = (editor: MonacoEditor, monaco: MonacoEditor) => {
    this.monacoRef = editor?.editor;
  };

  render() {
    const { code, isCodeValid } = this.state;

    // @todo
    // formatOnType formatOnPaste
    return (
      <div className="lowcode-plugin-datasource-import-plugin-code">
        <MonacoEditor
          theme="vs-vision"
          width={800}
          height={400}
          value={code}
          language="json"
          onChange={this.handleEditorChange}
          editorDidMount={this.handleEditorDidMount}
        />
        {!isCodeValid && <p className="error-msg">{intl('InvalidFormat')}</p>}
      </div>
    );
  }
}
