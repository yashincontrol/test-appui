/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module Widget
 */

import "./TitleBarTarget.scss";
import classnames from "classnames";
import * as React from "react";
import { assert } from "@itwin/core-bentley";
import { DraggedWidgetIdContext, useTarget } from "../base/DragManager";
import { CursorTypeContext } from "../base/NineZone";
import { getCursorClassName } from "../widget-panels/CursorOverlay";
import { WidgetState } from "../state/WidgetState";
import { WidgetIdContext } from "../widget/Widget";
import { TabOutline } from "../outline/TabOutline";
import { useAllowedWidgetTarget } from "./useAllowedWidgetTarget";
import { WidgetDropTargetState } from "../state/DropTargetState";
import { useLayout } from "../base/LayoutStore";
import { useSendBackHomeState } from "../widget/SendBack";

/** @internal */
export function TitleBarTarget() {
  const cursorType = React.useContext(CursorTypeContext);
  const draggedWidgetId = React.useContext(DraggedWidgetIdContext);
  const widgetId = React.useContext(WidgetIdContext);
  const activeHomeState = useSendBackHomeState();
  assert(!!widgetId);
  const draggedTab = useLayout((state) => !!state.draggedTab);
  const [ref] = useTarget<HTMLDivElement>(useTargetArgs(widgetId));
  const allowedTarget = useAllowedWidgetTarget(widgetId);

  // istanbul ignore next
  const hidden = !allowedTarget || ((!draggedTab && !draggedWidgetId) || draggedWidgetId === widgetId) && !(activeHomeState?.widgetId === widgetId);
  const className = classnames(
    "nz-target-titleBarTarget",
    hidden && "nz-hidden",
    // istanbul ignore next
    cursorType && getCursorClassName(cursorType),
  );
  return (
    <div
      className={className}
      ref={ref}
    >
      <TabOutline />
    </div>
  );
}

function useTargetArgs(widgetId: WidgetState["id"]) {
  return React.useMemo<WidgetDropTargetState>(() => {
    return {
      type: "widget",
      widgetId,
    };
  }, [widgetId]);
}
