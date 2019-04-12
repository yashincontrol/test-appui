/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
/** @module Zone */

import * as classnames from "classnames";
import * as React from "react";
import { CommonProps } from "@bentley/ui-core";
import { RectangleProps } from "../utilities/Rectangle";
import { CssProperties } from "../utilities/Css";
import "./GhostOutline.scss";

/** Properties of [[GhostOutline]] component.
 * @alpha
 */
export interface GhostOutlineProps extends CommonProps {
  /** Actual bounds of this [[GhostOutline]]. */
  bounds?: RectangleProps;
}

/** Component used to visualize merge/unmerge action by displaying zone outline.
 * @note Should be placed in [[Zone]] component.
 * @alpha
 */
export class GhostOutline extends React.PureComponent<GhostOutlineProps> {
  public render() {
    const className = classnames(
      "nz-zones-ghostOutline",
      this.props.className);

    const style: React.CSSProperties = {
      ...this.props.bounds ? CssProperties.fromBounds(this.props.bounds) : undefined,
      ...this.props.style,
    };

    return (
      <div
        className={className}
        style={style}
      />
    );
  }
}
