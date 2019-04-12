/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
/** @module Popup */

import * as classnames from "classnames";
import * as React from "react";
import { CommonProps } from "@bentley/ui-core";
import { CssProperties } from "../../utilities/Css";
import { Point, PointProps } from "../../utilities/Point";
import { Rectangle, RectangleProps } from "../../utilities/Rectangle";
import { SizeProps, Size } from "../../utilities/Size";
import "./Tooltip.scss";

/** Properties of [[Tooltip]] component.
 * @alpha Remove: position.
 */
export interface TooltipProps extends CommonProps {
  /** Tooltip content. */
  children?: React.ReactNode;
  /** Position of the tooltip. */
  position: PointProps;
  /** Function called when the bounds of the tooltip changes. */
  onSizeChanged?: (size: SizeProps) => void;
}

/** Default properties of [[Tooltip]] component.
 * @alpha
 */
export type TooltipDefaultProps = Pick<TooltipProps, "position">;

/** Function to apply offset and contain tooltip bounds in container.
 * @alpha Join currying functions, return PointProps.
 */
export const offsetAndContainInContainer = (offset: PointProps = new Point(20, 20)) => (tooltipBounds: RectangleProps, containerSize: SizeProps) => {
  let newBounds = Rectangle.create(tooltipBounds).offset(offset);
  const containerBounds = Rectangle.createFromSize(containerSize);
  if (containerBounds.contains(newBounds))
    return newBounds.topLeft();

  newBounds = newBounds.containIn(containerBounds);
  return newBounds.topLeft();
};

/** Positionable tooltip component.
 * @alpha Remove by merging with ToolSettingsTooltip.
 */
export class Tooltip extends React.PureComponent<TooltipProps> {
  public static readonly defaultProps: TooltipDefaultProps = {
    position: {
      x: 0,
      y: 0,
    },
  };

  private _lastSize = new Size();
  private _tooltip = React.createRef<HTMLDivElement>();

  public render() {
    const className = classnames(
      "nz-popup-tooltip-tooltip",
      this.props.className);

    const style: React.CSSProperties = {
      ...this.props.style,
      ...CssProperties.fromPosition(this.props.position),
    };

    return (
      <div
        className={className}
        ref={this._tooltip}
        style={style}
      >
        {this.props.children}
      </div>
    );
  }

  public componentDidMount() {
    this.onSizeChanged();
  }

  public componentDidUpdate(): void {
    this.onSizeChanged();
  }

  private onSizeChanged() {
    const tooltip = this._tooltip.current;
    if (!tooltip)
      return;

    const rect = tooltip.getBoundingClientRect();
    const size = {
      height: rect.height,
      width: rect.width,
    };

    if (this._lastSize.equals(size))
      return;

    this._lastSize = Size.create(size);
    this.props.onSizeChanged && this.props.onSizeChanged(size);
  }
}
