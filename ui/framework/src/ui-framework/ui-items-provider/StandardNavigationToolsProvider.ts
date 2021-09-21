/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module StandardUiItemsProvider
 */

import { CommonToolbarItem, StageUsage, ToolbarOrientation, ToolbarUsage, UiItemsManager, UiItemsProvider } from "@bentley/ui-abstract";
import { ToolbarHelper } from "../toolbar/ToolbarHelper";
import { CoreTools } from "../tools/CoreToolDefinitions";

/** Defines what tools to include
 * @beta
 */
export interface DefaultNavigationTools {
  horizontal?: {
    rotateView?: boolean;
    panView?: boolean;
    fitView?: boolean;
    windowArea?: boolean;
    viewUndoRedo?: boolean;
  };
  vertical?: {
    walk?: boolean;
    toggleCamera?: boolean;
  };
}

/** Provide standard tools for the ViewNavigationWidgetComposer
 * @beta
 */
export class StandardNavigationToolsProvider implements UiItemsProvider {
  public static providerId = "uifw:StandardNavigationToolsProvider";
  public readonly id = StandardNavigationToolsProvider.providerId;

  public static register(defaultNavigationTools?: DefaultNavigationTools, isSupportedStage?: (stageId: string, stageUsage: string, stageAppData?: any) => boolean) {
    UiItemsManager.register(new StandardNavigationToolsProvider(defaultNavigationTools, isSupportedStage));
  }

  public static unregister() {
    UiItemsManager.unregister(StandardNavigationToolsProvider.providerId);
  }

  constructor(private defaultNavigationTools?: DefaultNavigationTools, private isSupportedStage?: (stageId: string, stageUsage: string, stageAppData?: any) => boolean) { }

  public provideToolbarButtonItems(stageId: string, stageUsage: string, toolbarUsage: ToolbarUsage, toolbarOrientation: ToolbarOrientation, stageAppData?: any): CommonToolbarItem[] {
    const items: CommonToolbarItem[] = [];
    let provideToStage = false;

    if (this.isSupportedStage) {
      provideToStage = this.isSupportedStage(stageId, stageUsage, stageAppData);
    } else {
      provideToStage = (stageUsage === StageUsage.General);
    }

    if (provideToStage && toolbarUsage === ToolbarUsage.ViewNavigation && toolbarOrientation === ToolbarOrientation.Horizontal) {

      if (!this.defaultNavigationTools || !this.defaultNavigationTools.horizontal || this.defaultNavigationTools.horizontal.rotateView)
        items.push(ToolbarHelper.createToolbarItemFromItemDef(10, CoreTools.rotateViewCommand));

      if (!this.defaultNavigationTools || !this.defaultNavigationTools.horizontal || this.defaultNavigationTools.horizontal.panView)
        items.push(ToolbarHelper.createToolbarItemFromItemDef(20, CoreTools.panViewCommand));

      if (!this.defaultNavigationTools || !this.defaultNavigationTools.horizontal || this.defaultNavigationTools.horizontal.fitView) {
        items.push(ToolbarHelper.createToolbarItemFromItemDef(30, CoreTools.fitViewCommand));
      }

      if (!this.defaultNavigationTools || !this.defaultNavigationTools.horizontal || this.defaultNavigationTools.horizontal.windowArea) {
        items.push(ToolbarHelper.createToolbarItemFromItemDef(40, CoreTools.windowAreaCommand));
      }

      if (!this.defaultNavigationTools || !this.defaultNavigationTools.horizontal || this.defaultNavigationTools.horizontal.viewUndoRedo) {
        items.push(ToolbarHelper.createToolbarItemFromItemDef(50, CoreTools.viewUndoCommand));
        items.push(ToolbarHelper.createToolbarItemFromItemDef(60, CoreTools.viewRedoCommand));
      }

    } else /* istanbul ignore else */ if (provideToStage && toolbarUsage === ToolbarUsage.ViewNavigation && toolbarOrientation === ToolbarOrientation.Vertical) {

      if (!this.defaultNavigationTools || !this.defaultNavigationTools.vertical || this.defaultNavigationTools.vertical.walk)
        items.push(ToolbarHelper.createToolbarItemFromItemDef(10, CoreTools.walkViewCommand));

      if (!this.defaultNavigationTools || !this.defaultNavigationTools.vertical || this.defaultNavigationTools.vertical.toggleCamera)
        items.push(ToolbarHelper.createToolbarItemFromItemDef(20, CoreTools.toggleCameraViewCommand));
    }
    return items;
  }
}
