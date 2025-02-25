/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module Text
 */

import * as React from "react";
import { StyledText } from "./StyledText";
import { TextProps } from "./TextProps";

/** Styled muted/gray text React functional component
 * @public
 * @deprecated in 4.0 Use \<Text isMuted /\> from iTwinUI-react package.
 */
export function MutedText(props: TextProps) {
  {/* eslint-disable-next-line */}
  return <StyledText {...props} mainClassName="uicore-text-muted" />;
}
