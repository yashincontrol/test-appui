/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module Text
 */

import classnames from "classnames";
import * as React from "react";
import { TextProps } from "./TextProps";

/** Properties for [[StyledText]] component
 * @public
 */
export interface StyledTextProps extends TextProps {
  /** Main CSS class name */
  mainClassName: string;
}

/** The base component for other text components that pass a main CSS class name.
 * @public
 * @deprecated in 4.0 Use \<Text /\> component from iTwinUI-react library.
 */
export function StyledText(props: StyledTextProps) {
  const { mainClassName, className, style, children, ...spanProps } = props;

  return (
    <span
      {...spanProps}
      className={classnames(mainClassName, className)}
      style={style}
    >
      {children}
    </span>
  );
}
