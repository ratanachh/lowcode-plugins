import React, { PureComponent } from 'react';
import { project } from '@rchh/lowcode-engine';
import { Button, Icon } from '@alifd/next';
import { PluginProps, IPublicTypeDisposable } from '@rchh/lowcode-types';
import { intl } from './locale';

export interface IProps extends PluginProps {
  logo?: string;
}

export interface IState {
  undoEnable: boolean;
  redoEnable: boolean;
}

class Test extends PureComponent<IProps, IState> {
  static displayName = 'Test';

  private history: any;
  private changeDocumentDispose?: IPublicTypeDisposable;
  private changeStateDispose?: IPublicTypeDisposable;
  constructor(props: any) {
    super(props);
    this.state = {
      undoEnable: false,
      redoEnable: false,
    };
    this.init();
  }

  init = (): void => {
    this.changeDocumentDispose = project.onChangeDocument(doc => {
      this.history = doc.history;
      this.updateState(this.history?.getState() || 0);
      this.changeStateDispose?.();
      this.changeStateDispose = this.history.onChangeState(() => {
        this.updateState(this.history?.getState() || 0);
      });
    });
  };

  updateState = (state: number): void => {
    this.setState({
      undoEnable: !!(state & 1),
      redoEnable: !!(state & 2),
    });
  };

  handleUndoClick = (): void => {
    this.history.back();
  };

  handleRedoClick = (): void => {
    this.history.forward();
  };

  componentWillUnmount() {
    this.changeDocumentDispose?.();
    this.changeStateDispose?.();
  }

  render(): React.ReactNode {
    const { undoEnable, redoEnable } = this.state;
    return (
      <div className="lowcode-plugin-undo-redo">
        <Button
          size="medium"
          data-tip={intl('Undo')}
          data-dir="bottom"
          onClick={this.handleUndoClick}
          ghost
          disabled={!undoEnable}
        >
          <Icon type="houtui" />
        </Button>
        <Button
          size="medium"
          data-tip={intl('Redo')}
          data-dir="bottom"
          onClick={this.handleRedoClick}
          ghost
          disabled={!redoEnable}
        >
          <Icon type="qianjin" />
        </Button>
      </div>
    );
  }
}

const plugin = (ctx: any) => {
  return {
    // Plugin name, unique within the registration environment
    name: 'PluginTest',
    // Plugins this one depends on (array of plugin names)
    dep: [],
    // Plugin initializer, called right after the engine has been initialized
    init() {
      // Add a pane to the engine
      ctx.skeleton.add({
        area: 'topArea',
        type: 'Widget',
        name: 'undoRedo',
        content: Test,
        props: {
          align: 'right',
          width: 88,
        },
      })
    },
  };
};

plugin.pluginName = 'PluginTest'

export default plugin
