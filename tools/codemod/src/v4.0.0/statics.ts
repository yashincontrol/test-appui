/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import type { API, FileInfo, Options } from "jscodeshift";
import { useCallExpression } from "../utils/CallExpression";
import { useExtensions } from "../utils/Extensions";

export default function transformer(file: FileInfo, api: API, options: Options) {
  const j = api.jscodeshift;
  useExtensions(j);
  useCallExpression(j);

  const root = j(file.source);
  root.findCallExpressions("FrontstageManager.initialize").remove();
  root.rename("@itwin/appui-react:FrontstageManager.setActiveLayout", "@itwin/appui-react:UiFramework.content.layouts.setActive");
  root.rename("@itwin/appui-react:FrontstageManager.setActiveContentGroup", "@itwin/appui-react:UiFramework.content.layouts.setActiveContentGroup");

  root.rename("@itwin/appui-react:ConfigurableUiManager.addFrontstageProvider", "@itwin/appui-react:UiFramework.frontstages.addFrontstageProvider");
  root.rename("@itwin/appui-react:ConfigurableUiManager.loadKeyboardShortcuts", "@itwin/appui-react:UiFramework.keyboardShortcuts.loadKeyboardShortcuts");
  root.rename("@itwin/appui-react:ConfigurableUiManager.registerControl", "@itwin/appui-react:UiFramework.controls.register");
  root.rename("@itwin/appui-react:ConfigurableUiManager.isControlRegistered", "@itwin/appui-react:UiFramework.controls.isRegistered");
  root.rename("@itwin/appui-react:ConfigurableUiManager.createControl", "@itwin/appui-react:UiFramework.controls.create");
  root.rename("@itwin/appui-react:ConfigurableUiManager.unregisterControl", "@itwin/appui-react:UiFramework.controls.unregister");
  root.findCallExpressions("ConfigurableUiManager.initialize").remove();
  root.findCallExpressions("ConfigurableUiManager.loadTasks").remove();
  root.findCallExpressions("ConfigurableUiManager.loadWorkflow").remove();
  root.findCallExpressions("ConfigurableUiManager.loadWorkflows").remove();
  root.findCallExpressions("KeyboardShortcutManager.initialize").remove();
  root.findCallExpressions("ToolSettingsManager.initialize").remove();
  root.rename("@itwin/appui-react:ContentLayoutManager.getLayoutKey", "@itwin/appui-react:UiFramework.content.layouts.getKey");
  root.rename("@itwin/appui-react:ContentLayoutManager.getLayoutForGroup", "@itwin/appui-react:UiFramework.content.layouts.getForGroup");
  root.rename("@itwin/appui-react:ContentLayoutManager.findLayout", "@itwin/appui-react:UiFramework.content.layouts.find");
  root.rename("@itwin/appui-react:ContentLayoutManager.addLayout", "@itwin/appui-react:UiFramework.content.layouts.add");
  root.rename("@itwin/appui-react:ContentLayoutManager.setActiveLayout", "@itwin/appui-react:UiFramework.content.layouts.setActive");
  root.rename("@itwin/appui-react:ContentLayoutManager.refreshActiveLayout", "@itwin/appui-react:UiFramework.content.layouts.refreshActive");
  root.findCallExpressions("ContentDialogManager.initialize").remove();
  root.rename("@itwin/appui-react:ContentDialogManager.openDialog", "@itwin/appui-react:UiFramework.content.dialogs.open");
  root.rename("@itwin/appui-react:ContentDialogManager.closeDialog", "@itwin/appui-react:UiFramework.content.dialogs.close");
  root.rename("@itwin/appui-react:ContentDialogManager.activeDialog", "@itwin/appui-react:UiFramework.content.dialogs.active");
  root.rename("@itwin/appui-react:ContentDialogManager.dialogCount", "@itwin/appui-react:UiFramework.content.dialogs.count");
  root.rename("@itwin/appui-react:ContentDialogManager.getDialogZIndex", "@itwin/appui-react:UiFramework.content.dialogs.getZIndex");
  root.rename("@itwin/appui-react:ContentDialogManager.getDialogInfo", "@itwin/appui-react:UiFramework.content.dialogs.getInfo");
  root.rename("@itwin/appui-react:ModalDialogManager.openDialog", "@itwin/appui-react:UiFramework.dialogs.modal.open");
  root.rename("@itwin/appui-react:ModalDialogManager.closeDialog", "@itwin/appui-react:UiFramework.dialogs.modal.close");
  root.rename("@itwin/appui-react:ModalDialogManager.activeDialog", "@itwin/appui-react:UiFramework.dialogs.modal.active");
  root.rename("@itwin/appui-react:ModalDialogManager.dialogCount", "@itwin/appui-react:UiFramework.dialogs.modal.count");
  root.rename("@itwin/appui-react:ModalDialogManager.dialogCount", "@itwin/appui-react:UiFramework.dialogs.modal.count");
  root.findCallExpressions("ModelessDialogManager.initialize").remove();
  root.rename("@itwin/appui-react:ModelessDialogManager.openDialog", "@itwin/appui-react:UiFramework.dialogs.modeless.open");
  root.rename("@itwin/appui-react:ModelessDialogManager.closeDialog", "@itwin/appui-react:UiFramework.dialogs.modeless.close");
  root.rename("@itwin/appui-react:ModelessDialogManager.activeDialog", "@itwin/appui-react:UiFramework.dialogs.modeless.active");
  root.rename("@itwin/appui-react:ModelessDialogManager.dialogCount", "@itwin/appui-react:UiFramework.dialogs.modeless.count");
  root.rename("@itwin/appui-react:ModelessDialogManager.getDialogZIndex", "@itwin/appui-react:UiFramework.dialogs.modeless.getZIndex");
  root.rename("@itwin/appui-react:ModelessDialogManager.getDialogInfo", "@itwin/appui-react:UiFramework.dialogs.modeless.getInfo");
  root.rename("@itwin/appui-react:UiFramework.childWindowManager.openChildWindow", "@itwin/appui-react:UiFramework.childWindows.open");
  root.rename("@itwin/appui-react:UiFramework.childWindowManager.findChildWindowId", "@itwin/appui-react:UiFramework.childWindows.findId");
  root.rename("@itwin/appui-react:UiFramework.childWindowManager.closeAllChildWindows", "@itwin/appui-react:UiFramework.childWindows.closeAll");
  root.rename("@itwin/appui-react:UiFramework.childWindowManager.closeChildWindow", "@itwin/appui-react:UiFramework.childWindows.close");
  root.rename("@itwin/appui-react:FrontstageManager", "@itwin/appui-react:UiFramework.frontstages");
  root.rename("@itwin/appui-react:ConfigurableUiManager", "@itwin/appui-react:UiFramework.controls");
  root.rename("@itwin/appui-react:KeyboardShortcutManager", "@itwin/appui-react:UiFramework.keyboardShortcuts");
  root.rename("@itwin/appui-react:ToolSettingsManager", "@itwin/appui-react:UiFramework.toolSettings");
  root.rename("@itwin/appui-react:ContentLayoutManager", "@itwin/appui-react:UiFramework.content.layouts");
  root.rename("@itwin/appui-react:ContentDialogManager", "@itwin/appui-react:UiFramework.content.dialogs");
  root.rename("@itwin/appui-react:ContentViewManager", "@itwin/appui-react:UiFramework.content");
  root.rename("@itwin/appui-react:ModalDialogManager", "@itwin/appui-react:UiFramework.dialogs.modal");
  root.rename("@itwin/appui-react:ModelessDialogManager", "@itwin/appui-react:UiFramework.dialogs.modeless");
  root.rename("@itwin/appui-react:UiShowHideManager", "@itwin/appui-react:UiFramework.visibility");
  root.rename("@itwin/appui-react:UiFramework.backstageManager", "@itwin/appui-react:UiFramework.backstage");

  return root.toSource(options.printOptions);
}
