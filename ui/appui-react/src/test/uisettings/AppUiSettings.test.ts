/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { expect } from "chai";
import { storageMock, TestUtils } from "../TestUtils";
import { UiFramework } from "../../appui-react/UiFramework";
import { AppUiSettings, InitialAppUiSettings } from "../../appui-react/uistate/AppUiSettings";
import { SYSTEM_PREFERRED_COLOR_THEME } from "../../appui-react/theme/ThemeManager";

describe("AppUiSettings", () => {
  const localStorageToRestore = Object.getOwnPropertyDescriptor(window, "localStorage")!;
  let localStorageMock = storageMock();

  beforeEach(async () => {
    // create a new mock each run so there are no "stored values"
    localStorageMock = storageMock();
    await TestUtils.initializeUiFramework();
    Object.defineProperty(window, "localStorage", {
      get: () => localStorageMock,
    });
  });

  afterEach(() => {
    TestUtils.terminateUiFramework();
    Object.defineProperty(window, "localStorage", localStorageToRestore);
  });

  it("should get/set settings", async () => {
    const uiSetting = new AppUiSettings({});
    await uiSetting.loadUserSettings(UiFramework.getUiStateStorage());
    const opacity = 0.5;
    const toolbarOpacity = 0.8;
    const colorTheme = "dark";
    const useDragInteraction = true;
    const showWidgetIcon = false;
    const animateToolSettings = false;
    const autoCollapseUnpinnedPanels = true;
    const useToolAsToolSettingsLabel = false;

    UiFramework.setWidgetOpacity(opacity);
    UiFramework.setToolbarOpacity(toolbarOpacity);
    UiFramework.setUseDragInteraction(true);
    UiFramework.setColorTheme(colorTheme);
    UiFramework.setUseDragInteraction(useDragInteraction);
    UiFramework.setShowWidgetIcon(showWidgetIcon);
    UiFramework.setAutoCollapseUnpinnedPanels(autoCollapseUnpinnedPanels);
    UiFramework.setAutoCollapseUnpinnedPanels(autoCollapseUnpinnedPanels); // verify it handles the same value again
    UiFramework.setAnimateToolSettings(animateToolSettings);
    UiFramework.setUseToolAsToolSettingsLabel(useToolAsToolSettingsLabel);
    await TestUtils.flushAsyncOperations();
    expect(UiFramework.getWidgetOpacity()).to.eql(opacity);
    expect(UiFramework.getToolbarOpacity()).to.eql(toolbarOpacity);
    expect(UiFramework.getColorTheme()).to.eql(colorTheme);
    expect(UiFramework.useDragInteraction).to.eql(useDragInteraction);
    expect(UiFramework.showWidgetIcon).to.eql(showWidgetIcon);
    expect(UiFramework.autoCollapseUnpinnedPanels).to.eql(autoCollapseUnpinnedPanels);
    expect(UiFramework.animateToolSettings).to.eql(animateToolSettings);
    expect(UiFramework.useToolAsToolSettingsLabel).to.eql(useToolAsToolSettingsLabel);
  });

  it("should used default settings", async () => {
    const defaults: InitialAppUiSettings = {
      colorTheme: SYSTEM_PREFERRED_COLOR_THEME,
      dragInteraction: false,
      widgetOpacity: 0.8,
      showWidgetIcon: true,
      autoCollapseUnpinnedPanels: true,
      animateToolSettings: true,
      useToolAsToolSettingsLabel: true,
      toolbarOpacity: 0.5,
    };

    const uiSetting = new AppUiSettings(defaults);
    await uiSetting.loadUserSettings(UiFramework.getUiStateStorage());
    await TestUtils.flushAsyncOperations();
    expect(UiFramework.getWidgetOpacity()).to.eql(defaults.widgetOpacity);
    expect(UiFramework.getColorTheme()).to.eql(defaults.colorTheme);
    expect(UiFramework.useDragInteraction).to.eql(defaults.dragInteraction);
    expect(UiFramework.showWidgetIcon).to.eql(defaults.showWidgetIcon);
    expect(UiFramework.autoCollapseUnpinnedPanels).to.eql(defaults.autoCollapseUnpinnedPanels);
    expect(UiFramework.animateToolSettings).to.eql(defaults.animateToolSettings);
    expect(UiFramework.useToolAsToolSettingsLabel).to.eql(defaults.useToolAsToolSettingsLabel);
  });

});
