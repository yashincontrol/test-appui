/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module Popup
 */

import "./PositionPopup.scss";
import classnames from "classnames";
import * as React from "react";
import { PointProps } from "@itwin/appui-abstract";
import { CommonDivProps, CommonProps, Div, Size, SizeProps } from "@itwin/core-react";

/** Props for popup at screen position
 * @beta */
export interface PositionPopupProps extends CommonProps {
  /** Center point */
  point: PointProps;
  /** Function called when size is known. */
  onSizeKnown?: (size: SizeProps) => void;
  /** Content */
  children?: React.ReactNode;
}

/** Popup component at screen position
 * @beta */
export class PositionPopup extends React.PureComponent<PositionPopupProps> {

  constructor(props: PositionPopupProps) {
    super(props);
  }

  public override render() {
    const { point, className, style, onSizeKnown, ...props } = this.props; // eslint-disable-line @typescript-eslint/no-unused-vars

    const divStyle: React.CSSProperties = {
      ...style,
      top: point.y,
      left: point.x,
    };

    return (
      <div {...props} className={classnames("uifw-position-popup", className)} style={divStyle} ref={(e) => this.setDivRef(e)}>
        {this.props.children}
      </div>
    );
  }

  private setDivRef(div: HTMLDivElement | null) {
    // istanbul ignore else
    if (div) {
      const rect = div.getBoundingClientRect();
      const size = new Size(rect.width, rect.height);

      // istanbul ignore else
      if (this.props.onSizeKnown)
        this.props.onSizeKnown(size);
    }
  }

}

/** PositionPopup content with padding
 * @beta
 */
export function PositionPopupContent(props: CommonDivProps) {
  return <Div {...props} mainClassName="uifw-position-popup-content" />;
}
