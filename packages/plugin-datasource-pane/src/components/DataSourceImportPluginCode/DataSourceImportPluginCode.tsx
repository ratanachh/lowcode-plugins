/**
 * Source code import plugin
 * @todo associate types with the editor and provide detailed error messages
 */
import React, { PureComponent } from 'react';
import { Button, Message } from '@alifd/next';
import _noop from 'lodash/noop';
import _isArray from 'lodash/isArray';
import _last from 'lodash/last';
import _isPlainObject from 'lodash/isPlainObject';
import MonacoEditor from '@rchh/lowcode-plugin-base-monaco-editor';
import type { editor } from 'monaco-editor';
import { RuntimeDataSourceConfig as DataSourceConfig } from '@rchh/lowcode-datasource-types';
import Ajv from 'ajv';
import { DataSourcePaneImportPluginComponentProps } from '../../types';
import { intl } from '../../locale';

import './index.scss';

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
  static defaultProps = {
    defaultValue: [
      {
        type: 'http',
        id: 'test',
      },
    ],
  };

  state = {
    code: '',
    isCodeValid: true,
  };

  /* @author daifuyang
  ** @description fixes the default panel ref missing a submit method
  */
  submit = () => {
    return new Promise((resolve, reject) => {
      const { isCodeValid, code } = this.state;

      if (!isCodeValid) reject(new Error(intl('InvalidImportFormat')));

      // Only resolve the data that passes schema validation
      resolve(this.deriveValue(JSON.parse(code)));
    });
  };

  private monacoRef: any;

  constructor(props: DataSourceImportPluginCodeProps) {
    super(props);
    this.state.code = JSON.stringify(this.deriveValue(this.props.defaultValue));
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
      // Fall back to an empty schema for backwards compatibility
      return ajv.validate(dataSourceType.schema || {}, dataSource);
    });
  };

  handleComplete = () => {
    if (this.monacoRef) {
      if (
        !this.monacoRef
          .getModelMarkers()
          .find((marker: editor.IMarker) => marker.owner === 'json')
      ) {
        Message.success(intl('ValidateSuccess'));
        this.setState({ isCodeValid: true });
        // const model: any = _last(this.monacoRef.getModels());
        // if (!model) return;
        // this.props.onImport?.(this.deriveValue(JSON.parse(model.getValue())));
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

  /* @author daifuyang
  ** @description fixes the editor mount event
  */
  handleEditorDidMount = (editor: MonacoEditor, monaco: MonacoEditor) => {
    this.monacoRef = editor?.editor;
  };


  render() {
    const { onCancel = _noop } = this.props;
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
        <p className="btns">
          <Button onClick={onCancel}>{intl('Cancel')}</Button>
          <Button type="primary" onClick={this.handleComplete}>
            {intl('Validate')}
          </Button>
        </p>
      </div>
    );
  }
}
