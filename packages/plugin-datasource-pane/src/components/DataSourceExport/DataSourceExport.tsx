/* eslint-disable @typescript-eslint/indent */
/**
 * Source code import plugin
 * @todo associate types with the editor and provide detailed error messages
 */
import React, { PureComponent } from 'react';
import { Button, Message } from '@alifd/next';
import _isArray from 'lodash/isArray';
import _isPlainObject from 'lodash/isPlainObject';
import MonacoEditor from '@rchh/lowcode-plugin-base-monaco-editor';
import type { editor } from 'monaco-editor';
import { RuntimeDataSourceConfig as DataSourceConfig } from '@rchh/lowcode-datasource-types';
import Ajv from 'ajv';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { DataSourceType } from '../../types';
import { generateClassName } from '../../utils/misc';
import { intl } from '../../locale';

// import './import-plugins/code.scss';

export interface DataSourceExportProps {
  dataSourceList: DataSourceConfig[];
  dataSourceTypes: DataSourceType[];
}

export interface DataSourceExportState {
  code: string;
  isCodeValid: boolean;
}

export class DataSourceExport extends PureComponent<DataSourceExportProps, DataSourceExportState> {
  static defaultProps = {
    dataSourceList: [],
  };

  state = {
    code: '',
    isCodeValid: true,
  };

  submit = () => {
    return new Promise((resolve, reject) => {
    const { isCodeValid, code } = this.state;

    if (isCodeValid) reject(new Error(intl('InvalidFormat')));
    resolve({ schema: code });
    });
  };

  private monacoRef: any;

  constructor(props: DataSourceExportProps) {
    super(props);
    this.state.code = JSON.stringify(this.deriveValue(this.props.dataSourceList), null, 2);
    this.handleEditorDidMount = this.handleEditorDidMount.bind(this);
    this.handleEditorChange = this.handleEditorChange.bind(this);
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

      const dataSourceType = dataSourceTypes.find((type) => type.type === dataSource.type);

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

  handleCopy = () => {
    Message.success(intl('CopiedToClipboard'));
  };

  handleEditorChange = (newValue) => {
    if (this.monacoRef) {
      if (!this.monacoRef.getModelMarkers().find((marker: editor.IMarker) => marker.owner === 'json')) {
        this.setState({ isCodeValid: true, code: newValue });
      }
    }
  };

  handleEditorDidMount = (editor: MonacoEditor, monaco: MonacoEditor) => {
    this.monacoRef = editor?.editor;
  };

  handleReset = () => {
    const code = JSON.stringify(this.deriveValue(this.props.dataSourceList), null, 2)
    if (this.monacoRef) {
      this.monacoRef.getModels()?.[0]?.setValue?.(code);
    }
  };

  render() {
    const { code, isCodeValid } = this.state;

    // @todo
    // formatOnType formatOnPaste
    return (
      <div className={generateClassName('export')}>
        <MonacoEditor
          theme="vs-vision"
          width={1000}
          height={300}
          value={code}
          wordWrap="on"
          lineNumbers
          language="json"
          onChange={this.handleEditorChange}
          editorDidMount={this.handleEditorDidMount}
        />
        {!isCodeValid && <p className="error-msg">{intl('InvalidFormat')}</p>}
        <p className={generateClassName('export-btns')}>
          <CopyToClipboard text={code} onCopy={this.handleCopy}>
            <Button type="primary">
              {intl('CopyCodeToClipboard')}
            </Button>
          </CopyToClipboard>
          <Button onClick={this.handleReset}>
            {intl('Reset')}
          </Button>
        </p>
      </div>
    );
  }
}
