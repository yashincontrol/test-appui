/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module StandardUiItemsProvider
 */

import * as React from "react";
import { StatusBarItemUtilities } from "../statusbar/StatusBarItemUtilities";
import { ToolAssistanceField } from "../statusfields/toolassistance/ToolAssistanceField";
import { MessageCenterField } from "../statusfields/MessageCenter";
import { ActivityCenterField } from "../statusfields/ActivityCenter";
import { SnapModeField } from "../statusfields/SnapMode";
import { SelectionInfoField } from "../statusfields/SelectionInfo";
import { TileLoadingIndicator } from "../statusfields/tileloading/TileLoadingIndicator";
import { SelectionScopeField } from "../statusfields/SelectionScope";
import { DefaultStatusbarItems } from "./StandardStatusbarUiItemsProvider";
import { StatusBarSeparator } from "../statusbar/Separator";
import { StatusBarItem, StatusBarSection } from "../statusbar/StatusBarItem";
import { UiItemsManager } from "./UiItemsManager";
import { BaseUiItemsProvider } from "./BaseUiItemsProvider";

/**
 * Provide standard statusbar fields for the SimpleStatusbarWidget
 * @public
 */
export class StandardStatusbarItemsProvider extends BaseUiItemsProvider {
  constructor(providerId: string, private _defaultItems?: DefaultStatusbarItems, isSupportedStage?: (stageId: string, stageUsage: string, stageAppData?: any) => boolean) {
    super(providerId, isSupportedStage);
  }

  /**
  * static function to register the StandardStatusbarItemsProvider
  * @param providerId - unique identifier for this instance of the provider. This is required in case separate packages want
  * to set up custom stage with their own subset of standard status bar items.
  * @param defaultItems - if undefined all available item are provided to stage except for activityCenter. If defined only those
  * specific tool buttons are shown.
  * @param isSupportedStage - optional function that will be called to determine if tools should be added to current stage. If not set and
  * the current stage's `usage` is set to `StageUsage.General` then the provider will add items to frontstage.
  */
  public static register(providerId: string, defaultItems?: DefaultStatusbarItems, isSupportedStage?: (stageId: string, stageUsage: string, stageAppData?: any) => boolean) {
    const provider = new StandardStatusbarItemsProvider(providerId, defaultItems, isSupportedStage);
    UiItemsManager.register(provider);
    return provider;
  }

  public override provideStatusBarItemsInternal(_stageId: string, _stageUsage: string, _stageAppData?: any): StatusBarItem[] {
    const statusBarItems: StatusBarItem[] = [];
    if (!this._defaultItems || this._defaultItems.messageCenter) {
      statusBarItems.push(StatusBarItemUtilities.createCustomItem("uifw.MessageCenter", StatusBarSection.Left, 10, <MessageCenterField />));
    }
    if (!this._defaultItems || this._defaultItems.toolAssistance) {
      if (!this._defaultItems || this._defaultItems.preToolAssistanceSeparator)
        statusBarItems.push(StatusBarItemUtilities.createCustomItem("uifw.PreToolAssistance", StatusBarSection.Left, 15, <StatusBarSeparator />));

      statusBarItems.push(StatusBarItemUtilities.createCustomItem("uifw.ToolAssistance", StatusBarSection.Left, 20, <ToolAssistanceField />));

      if (!this._defaultItems || this._defaultItems.postToolAssistanceSeparator)
        statusBarItems.push(StatusBarItemUtilities.createCustomItem("uifw.PostToolAssistance", StatusBarSection.Left, 25, <StatusBarSeparator />));
    }
    if (this._defaultItems?.activityCenter) {
      statusBarItems.push(StatusBarItemUtilities.createCustomItem("uifw.ActivityCenter", StatusBarSection.Left, 30, <ActivityCenterField />));
    }
    if (!this._defaultItems || this._defaultItems.accuSnapModePicker) {
      statusBarItems.push(StatusBarItemUtilities.createCustomItem("uifw.SnapMode", StatusBarSection.Center, 10, <SnapModeField />));
    }

    if (!this._defaultItems || this._defaultItems.tileLoadIndicator) {
      statusBarItems.push(StatusBarItemUtilities.createCustomItem("uifw.TileLoadIndicator", StatusBarSection.Right, 10, <TileLoadingIndicator />));
    }

    if (!this._defaultItems || this._defaultItems.selectionScope) {
      statusBarItems.push(StatusBarItemUtilities.createCustomItem("uifw.SelectionScope", StatusBarSection.Right, 20, <SelectionScopeField />));
    }

    if (!this._defaultItems || this._defaultItems.selectionInfo) {
      statusBarItems.push(StatusBarItemUtilities.createCustomItem("uifw.SelectionInfo", StatusBarSection.Right, 30, <SelectionInfoField />));
    }

    return statusBarItems;
  }
}
