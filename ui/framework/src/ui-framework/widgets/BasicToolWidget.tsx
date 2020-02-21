/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module Widget
 */

import * as React from "react";
import { CoreTools } from "../CoreToolDefinitions";
import { SelectionContextToolDefinitions } from "../selection/SelectionContextItemDef";
import { ToolWidgetComposer, BackstageAppButton } from "./ToolWidgetComposer";
import { ToolbarComposer } from "../toolbar/ToolbarComposer";
import { ToolbarUsage, ToolbarOrientation, CommonToolbarItem } from "@bentley/ui-abstract";
import { ToolbarHelper } from "../toolbar/ToolbarHelper";

/** Properties that can be used to append items to the default set of toolbar items of [[ReviewToolWidget]].
 * @beta
 */
export interface BasicToolWidgetProps {
  /** if true include hide/isolate Models and Categories */
  showCategoryAndModelsContextTools?: boolean;
  /** Name of icon WebFont entry or if specifying an SVG symbol added by plug on use "svg:" prefix to imported symbol Id. */
  icon?: string;
  /** optional set of additional items to include in horizontal toolbar */
  additionalHorizontalItems?: CommonToolbarItem[];
  /** optional set of additional items to include in vertical toolbar */
  additionalVerticalItems?: CommonToolbarItem[];
}

/** Default Tool Widget for standard "review" applications. Provides standard tools to review, and measure elements.
 * This definition will also show a overflow button if there is not enough room to display all the toolbar buttons.
 * @beta
 */
// tslint:disable-next-line: variable-name
export const BasicToolWidget: React.FC<BasicToolWidgetProps> = (props) => {

  const getHorizontalToolbarItems = React.useCallback(
    (useCategoryAndModelsContextTools: boolean): CommonToolbarItem[] => {
      const items: CommonToolbarItem[] = [];
      if (useCategoryAndModelsContextTools) {
        items.push(
          ToolbarHelper.createToolbarItemFromItemDef(10, CoreTools.clearSelectionItemDef),
          ToolbarHelper.createToolbarItemFromItemDef(20, SelectionContextToolDefinitions.hideSectionToolGroup),
          ToolbarHelper.createToolbarItemFromItemDef(30, SelectionContextToolDefinitions.isolateSelectionToolGroup),
          ToolbarHelper.createToolbarItemFromItemDef(40, SelectionContextToolDefinitions.emphasizeElementsItemDef),
        );
      } else {
        items.push(
          ToolbarHelper.createToolbarItemFromItemDef(10, CoreTools.clearSelectionItemDef),
          ToolbarHelper.createToolbarItemFromItemDef(20, SelectionContextToolDefinitions.hideElementsItemDef),
          ToolbarHelper.createToolbarItemFromItemDef(30, SelectionContextToolDefinitions.isolateElementsItemDef),
          ToolbarHelper.createToolbarItemFromItemDef(40, SelectionContextToolDefinitions.emphasizeElementsItemDef),
        );
      }
      if (props.additionalHorizontalItems)
        items.push(...props.additionalHorizontalItems);
      return items;
    }, [props.additionalHorizontalItems]);

  const getVerticalToolbarItems = React.useCallback(
    (): CommonToolbarItem[] => {
      const items: CommonToolbarItem[] = [];
      items.push(
        ToolbarHelper.createToolbarItemFromItemDef(10, CoreTools.selectElementCommand),
        ToolbarHelper.createToolbarItemFromItemDef(20, CoreTools.measureToolGroup),
        ToolbarHelper.createToolbarItemFromItemDef(30, CoreTools.sectionToolGroup),
      );
      if (props.additionalVerticalItems)
        items.push(...props.additionalVerticalItems);
      return items;
    }, [props.additionalVerticalItems]);

  const [horizontalItems, setHorizontalItems] = React.useState(() => getHorizontalToolbarItems(!!props.showCategoryAndModelsContextTools));
  const [verticalItems, setVerticalItems] = React.useState(() => getVerticalToolbarItems());

  const isInitialMount = React.useRef(true);
  React.useEffect(() => {
    if (isInitialMount.current)
      isInitialMount.current = false;
    else {
      setHorizontalItems(getHorizontalToolbarItems(!!props.showCategoryAndModelsContextTools));
      setVerticalItems(getVerticalToolbarItems());
    }
  }, [props.showCategoryAndModelsContextTools, props.additionalHorizontalItems, props.additionalVerticalItems, getHorizontalToolbarItems, getVerticalToolbarItems]);

  return (
    <ToolWidgetComposer
      cornerItem={<BackstageAppButton icon={props.icon} />}
      horizontalToolbar={<ToolbarComposer items={horizontalItems} usage={ToolbarUsage.ContentManipulation} orientation={ToolbarOrientation.Horizontal} />}
      verticalToolbar={<ToolbarComposer items={verticalItems} usage={ToolbarUsage.ContentManipulation} orientation={ToolbarOrientation.Vertical} />}
    />
  );
};
