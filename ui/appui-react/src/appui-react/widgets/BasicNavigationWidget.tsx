/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module Widget
 */

import classnames from "classnames";
import * as React from "react";
import { CoreTools } from "../tools/CoreToolDefinitions";
import { ToolbarComposer } from "../toolbar/ToolbarComposer";
import { ToolbarHelper } from "../toolbar/ToolbarHelper";
import { useUiVisibility } from "../hooks/useUiVisibility";
import { NavigationWidgetComposer } from "./NavigationWidgetComposer";
import { ToolbarItem, ToolbarOrientation, ToolbarUsage } from "../toolbar/ToolbarItem";

/** Properties that can be used to append items to the default set of toolbar items.
 * @public
 */
export interface BasicNavigationWidgetProps {
  /** optional set of additional items to include in horizontal toolbar */
  additionalHorizontalItems?: ToolbarItem[];
  /** optional set of additional items to include in vertical toolbar */
  additionalVerticalItems?: ToolbarItem[];
}

/** Basic Navigation Widget that provides standard tools to manipulate views containing element data.
 * Supports the specification of additional horizontal and vertical toolbar items through props.
 * @public
 */
export function BasicNavigationWidget(props: BasicNavigationWidgetProps) {

  const getHorizontalToolbarItems = React.useCallback(
    (): ToolbarItem[] => {
      const items: ToolbarItem[] = ToolbarHelper.createToolbarItemsFromItemDefs([
        CoreTools.rotateViewCommand,
        CoreTools.panViewCommand,
        CoreTools.fitViewCommand,
        CoreTools.windowAreaCommand,
        CoreTools.viewUndoCommand,
        CoreTools.viewRedoCommand,
      ]);
      if (props.additionalHorizontalItems)
        items.push(...props.additionalHorizontalItems);
      return items;
    }, [props.additionalHorizontalItems]);

  const getVerticalToolbarItems = React.useCallback(
    (): ToolbarItem[] => {
      const items: ToolbarItem[] = [];
      items.push(
        ToolbarHelper.createToolbarItemFromItemDef(10, CoreTools.walkViewCommand),
        ToolbarHelper.createToolbarItemFromItemDef(20, CoreTools.toggleCameraViewCommand),
      );
      if (props.additionalVerticalItems)
        items.push(...props.additionalVerticalItems);
      return items;
    }, [props.additionalVerticalItems]);

  const [horizontalItems, setHorizontalItems] = React.useState(() => getHorizontalToolbarItems());
  const [verticalItems, setVerticalItems] = React.useState(() => getVerticalToolbarItems());

  const isInitialMount = React.useRef(true);
  React.useEffect(() => {
    if (isInitialMount.current)
      isInitialMount.current = false;
    else {
      setHorizontalItems(getHorizontalToolbarItems());
      setVerticalItems(getVerticalToolbarItems());
    }
  }, [props.additionalHorizontalItems, props.additionalVerticalItems, getHorizontalToolbarItems, getVerticalToolbarItems]);

  const uiIsVisible = useUiVisibility();
  // istanbul ignore next
  const className = classnames(
    !uiIsVisible && "nz-hidden",
  );

  return (
    <NavigationWidgetComposer className={className}
      horizontalToolbar={<ToolbarComposer items={horizontalItems} usage={ToolbarUsage.ViewNavigation} orientation={ToolbarOrientation.Horizontal} />}
      verticalToolbar={<ToolbarComposer items={verticalItems} usage={ToolbarUsage.ViewNavigation} orientation={ToolbarOrientation.Vertical} />}
    />
  );
}
