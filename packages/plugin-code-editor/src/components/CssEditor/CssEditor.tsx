import React, { PureComponent } from 'react';
import MonacoEditor from '@rchh/lowcode-plugin-base-monaco-editor';
import { Tab } from '@alifd/next';

import { IEditorInstance } from '@rchh/lowcode-plugin-base-monaco-editor/lib/helper';

import { TAB_KEY } from '../../config';

import './CssEditor.less';
import { beautifyCSS } from '../../utils';

export interface CssEditorProps {
  cssCode?: string;
  currentTab: TAB_KEY;
  onTabChange: (tab: TAB_KEY) => void;
  saveSchema: () => void;
}

export interface CssEditorState {
  code: string;
}

// TODO: add CSS syntax hints later
export class CssEditor extends PureComponent<CssEditorProps, CssEditorState> {
  static defaultProps: Partial<CssEditorProps>;

  state: CssEditorState = {
    code: this.props.cssCode ?? '',
  };

  cssEditor: IEditorInstance;

  editorDidMount(editor: IEditorInstance): void {
    this.cssEditor = editor;
  }

  getBeautifiedCSS() {
    const { code } = this.state;
    const nextCode = beautifyCSS(code);
    // The CSS gets formatted, so sync the result back
    this.setState({
      code: nextCode,
    });
    return nextCode;
  }

  render() {
    const { code } = this.state;
    return (
      <>
        <Tab
          size="small"
          shape="wrapped"
          activeKey={this.props.currentTab}
        >
          <Tab.Item
            title={`${code !== this.props.cssCode ? '* ' : ''}index.css`}
            key={TAB_KEY.CSS}
            onClick={() => this.props.onTabChange(TAB_KEY.CSS)}
          />
          {/** Multi-file support would be controlled here */}
        </Tab>
        {this.props.currentTab === TAB_KEY.CSS && (
          <div className="plugin-code-editor-css plugin-code-editor-inner">
            <MonacoEditor
              value={code}
              language="css"
              height="100%"
              supportFullScreen
              onChange={(newCode: string) => {
                this._updateCode(newCode);
              }}
              editorDidMount={(useMonaco, editor: IEditorInstance) => {
                this.editorDidMount(editor);
              }}
            />
          </div>
        )}
      </>
    );
  }

  _updateCode(newCode: string) {
    this.setState({ code: newCode });
  }
}
