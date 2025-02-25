/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module Widget
 */

import "./TabTarget.scss";
import classnames from "classnames";
import * as React from "react";
import { assert } from "@itwin/core-bentley";
import { DraggedWidgetIdContext, useTarget } from "../base/DragManager";
import { CursorTypeContext } from "../base/NineZone";
import { getCursorClassName } from "../widget-panels/CursorOverlay";
import { WidgetState } from "../state/WidgetState";
import { WidgetIdContext } from "../widget/Widget";
import { TabIdContext } from "../widget/ContentRenderer";
import { useAllowedWidgetTarget } from "./useAllowedWidgetTarget";
import { TabDropTargetState } from "../state/DropTargetState";
import { useLayout } from "../base/LayoutStore";
import { getWidgetState } from "../state/internal/WidgetStateHelpers";

/** @internal */
export function TabTarget() {
  const cursorType = React.useContext(CursorTypeContext);
  const draggedTab = useLayout((state) => !!state.draggedTab);
  const draggedWidgetId = React.useContext(DraggedWidgetIdContext);
  const widgetId = React.useContext(WidgetIdContext);
  assert(!!widgetId);
  const tabIndex = useTabIndex();
  const [ref, targeted] = useTarget<HTMLDivElement>(useTargetArgs(widgetId, tabIndex));
  const allowedTarget = useAllowedWidgetTarget(widgetId);
  // istanbul ignore next
  const hidden = !allowedTarget || ((!draggedTab && !draggedWidgetId) || draggedWidgetId === widgetId);
  const className = classnames(
    "nz-target-tabTarget",
    hidden && "nz-hidden",
    // istanbul ignore next
    targeted && "nz-targeted",
    // istanbul ignore next
    cursorType && getCursorClassName(cursorType),
  );
  return (
    <div
      className={className}
      ref={ref}
    />
  );
}

function useTabIndex() {
  const widgetId = React.useContext(WidgetIdContext);
  const tabId = React.useContext(TabIdContext);
  assert(!!widgetId);
  return useLayout((state) => {
    const widget = getWidgetState(state, widgetId);
    return widget.tabs.findIndex((id) => id === tabId);
  });
}

function useTargetArgs(widgetId: WidgetState["id"], tabIndex: number) {
  return React.useMemo<TabDropTargetState>(() => {
    return {
      type: "tab",
      widgetId,
      tabIndex,
    };
  }, [widgetId, tabIndex]);
}
