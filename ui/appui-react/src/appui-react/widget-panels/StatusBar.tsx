/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module StatusBar
 */

import "./StatusBar.scss";
import classnames from "classnames";
import * as React from "react";
import { CommonProps } from "@itwin/core-react";
import { ConfigurableUiControlType } from "../configurableui/ConfigurableUiControl";
import { StatusBar } from "../statusbar/StatusBar";
import { StatusBarWidgetControl } from "../statusbar/StatusBarWidgetControl";
import { useActiveFrontstageDef } from "../frontstage/FrontstageDef";

/** @internal */
export function WidgetPanelsStatusBar(props: CommonProps) {
  const frontstageDef = useActiveFrontstageDef();
  const widgetDef = frontstageDef?.statusBar;
  if (!widgetDef)
    return null;
  const content = widgetDef.reactNode;
  const widgetControl = content === undefined ? widgetDef.getWidgetControl(ConfigurableUiControlType.StatusBarWidget) as StatusBarWidgetControl | undefined : undefined;
  const className = classnames(
    "uifw-widgetPanels-statusBar",
    props.className,
  );
  return (
    <StatusBar
      className={className}
      style={props.style}
      widgetControl={widgetControl}
    >
      {widgetDef.reactNode}
    </StatusBar>
  );
}
