/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module Widget
 */

import * as React from "react";
import { CoreTools } from "../CoreToolDefinitions";
import { NavigationWidgetComposer } from "./NavigationWidgetComposer";
import { ToolbarComposer } from "../toolbar/ToolbarComposer";
import { ToolbarUsage, ToolbarOrientation, CommonToolbarItem } from "@bentley/ui-abstract";
import { ToolbarHelper } from "../toolbar/ToolbarHelper";

/** Properties that can be used to append items to the default set of toolbar items of [[DefaultNavigationWidget]].
 * @beta
 */
export interface BasicNavigationWidgetProps {
  /** optional set of additional items to include in horizontal toolbar */
  additionalHorizontalItems?: CommonToolbarItem[];
  /** optional set of additional items to include in vertical toolbar */
  additionalVerticalItems?: CommonToolbarItem[];
}

/** Basic Navigation Widget that provides standard tools to manipulate views containing element data. Supports the specification
 *  of additional horizontal and vertical toolbar items through props.
 * @beta
 */
// tslint:disable-next-line: variable-name
export const BasicNavigationWidget: React.FC<BasicNavigationWidgetProps> = (props) => {

  const getHorizontalToolbarItems = React.useCallback(
    (): CommonToolbarItem[] => {
      const items: CommonToolbarItem[] = ToolbarHelper.createToolbarItemsFromItemDefs([
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
    (): CommonToolbarItem[] => {
      const items: CommonToolbarItem[] = [];
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

  return (
    <NavigationWidgetComposer
      horizontalToolbar={<ToolbarComposer items={horizontalItems} usage={ToolbarUsage.ViewNavigation} orientation={ToolbarOrientation.Horizontal} />}
      verticalToolbar={<ToolbarComposer items={verticalItems} usage={ToolbarUsage.ViewNavigation} orientation={ToolbarOrientation.Vertical} />}
    />
  );
};
