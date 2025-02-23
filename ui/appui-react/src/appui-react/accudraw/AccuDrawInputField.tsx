/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module AccuDraw
 */

import "./AccuDrawInputField.scss";
import classnames from "classnames";
import * as React from "react";
import { ItemField } from "@itwin/core-frontend";
import { CommonProps, Icon, IconSpec, useRefs } from "@itwin/core-react";
import { isLetter, SpecialKey } from "@itwin/appui-abstract";
import { Input } from "@itwin/itwinui-react";
import { AccuDrawSetFieldFocusEventArgs, AccuDrawSetFieldValueToUiEventArgs, FrameworkAccuDraw } from "./FrameworkAccuDraw";
import { UiFramework } from "../UiFramework";
import { SvgLock } from "@itwin/itwinui-icons-react";
/** Properties for [[AccuDrawInputField]] component
 * @beta
 */
export interface AccuDrawInputFieldProps extends CommonProps {
  /** Which AccuDraw field this represents */
  field: ItemField;
  /** id for the input element */
  id: string;
  /** Indicates whether field is locked */
  isLocked?: boolean;
  /** label for the input element */
  label?: string;
  /** icon for the input element */
  iconSpec?: IconSpec;
  /** Custom CSS class name for the label */
  labelClassName?: string;
  /** Custom CSS Style for the label */
  labelStyle?: React.CSSProperties;
  /** Center justified label */
  labelCentered?: boolean;
  /** Triggered when the content is changed */
  onValueChanged: (stringValue: string) => void;
  /** Frequency to poll for changes in value, in milliseconds */
  valueChangedDelay?: number;
  /** Listens for <Enter> keypress */
  onEnterPressed?: () => void;
  /** Listens for <Esc> keypress */
  onEscPressed?: () => void;
  /** Provides ability to return reference to HTMLInputElement */
  ref?: React.Ref<HTMLInputElement>;
}

const ForwardRefAccuDrawInput = React.forwardRef<HTMLInputElement, AccuDrawInputFieldProps>(
  function ForwardRefAccuDrawInputField(props: AccuDrawInputFieldProps, ref) {
    const { className, style, id, label, iconSpec, labelClassName, labelStyle, labelCentered, field, isLocked,
      onValueChanged, valueChangedDelay, onEnterPressed, onEscPressed, ...inputProps } = props;
    const [stringValue, setStringValue] = React.useState("");
    const timeoutId = React.useRef(0);
    const [needValueChanged, setNeedValueChanged] = React.useState(false);
    const [needSelection, setNeedSelection] = React.useState(false);
    const [isFocusField, setIsFocusField] = React.useState(false);
    const inputElementRef = React.useRef<HTMLInputElement>(null);
    const refs = useRefs(inputElementRef, ref);  // combine ref needed for target with the forwardRef needed by the Parent when parent is a Type Editor.

    React.useEffect(() => {
      const formattedValue = FrameworkAccuDraw.getFieldDisplayValue(field);
      setStringValue(formattedValue);
    }, [field]);

    const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
      const value = event.currentTarget.value;

      // istanbul ignore next
      if (value === undefined)
        return;

      // istanbul ignore else
      if (stringValue !== value) {
        setStringValue(value);
        setNeedValueChanged(true);
      }
    }, [stringValue]);

    const unsetTimeout = (): void => {
      // istanbul ignore else
      if (timeoutId) {
        window.clearTimeout(timeoutId.current);
        timeoutId.current = 0;
      }
    };

    React.useEffect(() => {
      // After setStringValue & re-render
      // istanbul ignore else
      if (needValueChanged) {
        if (valueChangedDelay) {
          unsetTimeout();
          timeoutId.current = window.setTimeout(() => {
            onValueChanged(stringValue);
          }, valueChangedDelay);
        } else {
          onValueChanged(stringValue);
        }
        setNeedValueChanged(false);
      }
    }, [onValueChanged, valueChangedDelay, stringValue, needValueChanged]);

    React.useEffect(() => {
      // On unmount
      return () => unsetTimeout();
    }, []);

    const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
      switch (e.key) {
        case SpecialKey.Escape:
          onEscPressed && onEscPressed();
          return;
        case SpecialKey.Enter:
          onEnterPressed && onEnterPressed();
          return;
      }

      if (isLetter(e.key)) {
        e.preventDefault();
        UiFramework.keyboardShortcuts.processKey(e.key);
        return;
      }
    }, [onEscPressed, onEnterPressed]);

    React.useEffect(() => {
      const handleSetFieldValueToUi = (args: AccuDrawSetFieldValueToUiEventArgs) => {
        if (args.field === field && stringValue !== args.formattedValue) {
          setStringValue(args.formattedValue);
          // istanbul ignore else
          if (isFocusField)
            setNeedSelection(true);
        }
      };
      return FrameworkAccuDraw.onAccuDrawSetFieldValueToUiEvent.addListener(handleSetFieldValueToUi);
    }, [field, isFocusField, stringValue]);

    React.useEffect(() => {
      if (needSelection) {
        // istanbul ignore else
        if (inputElementRef.current)
          inputElementRef.current.select();
        setNeedSelection(false);
      }
    }, [needSelection]);

    React.useEffect(() => {
      const handleSetFieldFocus = (args: AccuDrawSetFieldFocusEventArgs) => {
        setIsFocusField(args.field === field);
      };
      return FrameworkAccuDraw.onAccuDrawSetFieldFocusEvent.addListener(handleSetFieldFocus);
    }, [field]);

    const inputClassNames = classnames("uifw-accudraw-input-field", className);
    const labelClassNames = classnames("uifw-accudraw-input-label",
      labelCentered && "uifw-label-centered",
      labelClassName
    );

    return (
      <>
        <label htmlFor={id} className={labelClassNames} style={labelStyle}>
          {label}
          {iconSpec && <Icon iconSpec={iconSpec} />}
        </label>
        <Input {...inputProps} ref={refs} id={id} value={stringValue}
          className={inputClassNames} style={style} autoComplete="off"
          onChange={handleChange} onKeyDown={handleKeyDown} size="small" />
        <span className="uifw-accudraw-lock" >
          {isLocked && <Icon iconSpec={<SvgLock />} />}
        </span>
      </>
    );
  }
);

/** Input field for AccuDraw Ui
 * @beta
 */
export const AccuDrawInputField: (props: AccuDrawInputFieldProps) => JSX.Element | null = ForwardRefAccuDrawInput;
