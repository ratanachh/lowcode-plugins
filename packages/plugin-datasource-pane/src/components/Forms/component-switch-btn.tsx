import React, { PureComponent } from 'react';
import { Button, Icon } from '@alifd/next';
import { IconVariable } from '../icons/variable';
import _get from 'lodash/get';
import { connect, mapProps } from '@formily/react';
import cn from 'classnames';
import { generateClassName } from '../../utils/misc';
import { Field } from '@formily/core'
import { isJSExpression, JSExpression } from '@rchh/lowcode-types';

export interface ComponentSwitchBtnCompProps {
  className?: string;
  style?: React.CSSProperties;
  component: string;
  originalComponent: string;
  setComponent: (component: string) => void;
  field: Field
}

export interface ComponentSwitchBtnCompState {
  currentComponent: string;
}

class ComponentSwitchBtnCompComp extends PureComponent<
  ComponentSwitchBtnCompProps,
  ComponentSwitchBtnCompState
> {
  static isFieldComponent = true;

  static defaultProps = {};

  state: ComponentSwitchBtnCompState = {
    currentComponent: this.props.originalComponent,
  };

  private originalComponent = null;

  componentDidMount() {
    this.originalComponent = this.props.originalComponent;

    // In the form callback, switch the component when the initial value is an expression
    if (isJSExpression(this.props.field.value)) {
      this.props.setComponent('LowcodeExpression')
      this.setState({ currentComponent: 'LowcodeExpression' });
    }
  }

  handleSwitch = () => {
    const { field, setComponent } = this.props

    let nextComponent = null;
    if (this.state.currentComponent === this.originalComponent) {
      nextComponent = this.props.component;
    } else {
      nextComponent = this.originalComponent;
    }

    let nextValue: number | boolean | string | JSExpression | Array<any> = field.value

    switch(nextComponent) {
      case 'Switch':
        // expression -> boolean
        if (isJSExpression(nextValue)) {
          nextValue = (nextValue && nextValue.value === 'true') || false;
        }
        break;
      case 'NumberPicker':
        // expression -> number
        if (isJSExpression(nextValue)) {
          const val = +(nextValue && nextValue.value)
          nextValue = isNaN(val) ? 0 : val
        }
        break;
      case 'ArrayItems':
         // expression -> array
        if (isJSExpression(nextValue)) {
          nextValue = []
        }
        break;
      case 'LowcodeExpression':
        // plain component -> expression
        nextValue = {
          type: 'JSExpression',
          value: nextValue + '',
        }
        break;
      default: // by default expression -> string (used by the Input and Select components)
        if (isJSExpression(nextValue)) {
          nextValue = (nextValue && nextValue.value) || ''
        }
    }

    this.setState({ currentComponent: nextComponent! });
    field.setValue(nextValue)
    setComponent?.(nextComponent!);
  };

  render() {
    const { className, style } = this.props;
    return (
      <Button
        className={cn(generateClassName('component-switchbtn'), className)}
        style={style}
        text
        onClick={this.handleSwitch}
      >
        <IconVariable size={20} fill="#8f9bb3" />
      </Button>
    );
  }
}

export const ComponentSwitchBtn = connect(
  ComponentSwitchBtnCompComp,
  mapProps((props, field) => {
    return {
      field,
      setComponent: field.setComponent,
      originalComponent: _get(field, 'component[0]'),
    };
  }),
);
