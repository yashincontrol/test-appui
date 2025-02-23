/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module Widget
 */

import "./MergeTarget.scss";
import classnames from "classnames";
import * as React from "react";
import { DraggedWidgetIdContext, useTarget } from "../base/DragManager";
import { CursorTypeContext } from "../base/NineZone";
import { getCursorClassName } from "../widget-panels/CursorOverlay";
import { WidgetState } from "../state/WidgetState";
import { WidgetDropTargetState } from "../state/DropTargetState";
import { useAllowedWidgetTarget } from "./useAllowedWidgetTarget";
import { useLayout } from "../base/LayoutStore";

/** @internal */
export interface MergeTargetProps {
  widgetId: WidgetState["id"];
}

/** @internal */
export function MergeTarget(props: MergeTargetProps) {
  const { widgetId } = props;
  const cursorType = React.useContext(CursorTypeContext);
  const draggedWidgetId = React.useContext(DraggedWidgetIdContext);
  const draggedTab = useLayout((state) => !!state.draggedTab);
  const [ref, targeted] = useTarget<HTMLDivElement>(useTargetArgs(widgetId));
  const allowedTarget = useAllowedWidgetTarget(widgetId);
  // istanbul ignore next
  const hidden = !allowedTarget || ((!draggedTab && !draggedWidgetId) || draggedWidgetId === widgetId);
  const className = classnames(
    "nz-target-mergeTarget",
    // istanbul ignore next
    targeted && "nz-targeted",
    hidden && "nz-hidden",
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

function useTargetArgs(widgetId: WidgetState["id"]) {
  return React.useMemo<WidgetDropTargetState>(() => {
    return {
      type: "widget",
      widgetId,
    };
  }, [widgetId]);
}
