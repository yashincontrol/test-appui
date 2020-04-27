/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module Toggle
 */

import * as React from "react";
import classnames from "classnames";
import { CommonProps } from "../utils/Props";
import "./Toggle.scss";

/** Toggle display types
 * @public
 */
export enum ToggleButtonType {
  /** Primary (green) background */
  Primary,
  /** Blue background */
  Blue,
}

/** Properties for [[Toggle]] component
 * @public
 */
export interface ToggleProps extends CommonProps {
  /** Indicates whether the Toggle is disabled (default is false) */
  disabled?: boolean;
  /** Indicates whether the Toggle is "on" or "off" (default is false) */
  isOn?: boolean;
  /** Show the toggle rounded or square (rounded is default) */
  rounded?: boolean;
  /** Show a check mark icon when the toggle is "on" (false is default) */
  showCheckmark?: boolean;
  /** Button type, either Primary or Blue (Blue is default) */
  buttonType?: ToggleButtonType;
  /** Function called when the toggle state is changed */
  onChange?: (checked: boolean) => any;
  /** Function called when the toggle loses focus  */
  onBlur?: (event: React.FocusEvent) => any;
  /** Use larger size (default is false) */
  large?: boolean;
  /** Indicates whether to set focus to the input element */
  setFocus?: boolean;
}

/** @internal */
interface ToggleState {
  height: number;
  width: number;
  checked: boolean;
  toggling: boolean;
}

/**
 * Toggle React component to show an "on" or "off" state
 * @public
 */
export class Toggle extends React.PureComponent<ToggleProps, ToggleState> {
  private _padding: number = 2;
  private _inputElement = React.createRef<HTMLInputElement>();

  constructor(props: ToggleProps) {
    super(props);

    this.state = {
      height: 0,
      width: 0,
      checked: this.props.isOn!,
      toggling: false,
    };
  }

  public static defaultProps: Partial<ToggleProps> = {
    rounded: true,
    isOn: false,
    showCheckmark: false,
    buttonType: ToggleButtonType.Blue,
  };

  public componentDidMount() {
    if (this.props.setFocus && this._inputElement.current) {
      this._inputElement.current.focus();
    }
  }

  public componentDidUpdate(prevProps: ToggleProps) {
    if (this.props.isOn !== prevProps.isOn) {
      this.setState((_, props) => ({ checked: props.isOn ? true : false }));
      return;
    }
    if (this.props.disabled !== prevProps.disabled)
      this.forceUpdate();
  }

  private _handleChange = () => {
    this.setState(
      (prevState) => ({ checked: !prevState.checked, toggling: true }),
      () => { this.props.onChange && this.props.onChange(this.state.checked); });

    setTimeout(() => this.setState({ toggling: false }), 250);
  }

  private _handleBlur = (event: React.FocusEvent) => {
    // istanbul ignore else
    if (this.props.onBlur)
      this.props.onBlur(event);
  }

  private _setHeight = (newHeight: number, newWidth: number) => {
    // istanbul ignore next
    if (this.state.height !== newHeight || this.state.width !== newWidth) {
      this.setState({ height: newHeight, width: newWidth });
    }
  }

  private _getOffset(): number {
    return (this.state.checked) ? this.state.width - this.state.height : 0;
  }

  public render(): JSX.Element {
    const halfHeight = this.state.height / 2;
    const checkmarkClassName = classnames(
      "core-toggle-checkmark",
      "icon", "icon-checkmark",
      this.props.showCheckmark && "visible",
      this.state.toggling && "core-toggling",
    );
    const toggleStyle: React.CSSProperties = { borderRadius: this.props.rounded ? halfHeight : 3, fontSize: halfHeight, ...this.props.style };
    const toggleClassName = classnames(
      "core-toggle",
      this.props.buttonType === ToggleButtonType.Primary && "core-toggle-primary",
      this.props.large && "core-toggle-large",
      this.props.rounded && "rounded",
      this.props.disabled && "uicore-disabled",
      this.props.className);
    const toggleHandleStyle: React.CSSProperties = {
      width: this.state.height - (this._padding * 2),
      transform: "translateX(" + this._getOffset() + "px)",
      top: this._padding,
      bottom: this._padding,
      left: this._padding,
    };
    const handleClassName = classnames(
      "core-toggle-handle",
      this.state.toggling && "core-toggling",
    );

    return (
      <label ref={(el) => { if (el) this._setHeight(el.clientHeight, el.clientWidth); }} style={toggleStyle} className={toggleClassName}>
        <input type="checkbox" ref={this._inputElement} className="core-toggle-input"
          checked={this.state.checked} disabled={this.props.disabled}
          onChange={this._handleChange} onBlur={this._handleBlur} />
        <span className="core-toggle-background" />
        <span className={checkmarkClassName} />
        <span className={handleClassName} style={toggleHandleStyle} />
      </label>
    );
  }
}
