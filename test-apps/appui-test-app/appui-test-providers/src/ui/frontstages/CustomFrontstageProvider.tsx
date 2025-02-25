/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import {
  BackstageAppButton, ConfigurableCreateInfo, ContentControl, ContentGroup,
  ContentToolWidgetComposer, CoreTools, FrontstageConfig, FrontstageProvider, StagePanelState,
  StandardContentToolsUiItemsProvider, StandardNavigationToolsUiItemsProvider, StandardStatusbarUiItemsProvider,
  StatusBarComposer, UiFramework, UiItemsManager, ViewToolWidgetComposer,
} from "@itwin/appui-react";
import { StandardContentLayouts } from "@itwin/appui-abstract";
import { CustomStageUiItemsProvider } from "../providers/CustomStageUiItemsProvider";

class CustomContentControl extends ContentControl {
  constructor(info: ConfigurableCreateInfo, options: any) {
    super(info, options);

    this.reactNode = (
      <h1 style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        Custom content!
      </h1>
    );
  }
}

export class CustomFrontstageProvider extends FrontstageProvider {
  public static readonly stageId = "appui-test-providers:CustomFrontstage";

  public get id(): string {
    return CustomFrontstageProvider.stageId;
  }

  public override frontstageConfig(): FrontstageConfig {
    const id = this.id;
    const contentGroup = new ContentGroup({
      id: "test-group",
      layout: StandardContentLayouts.singleView,
      contents: [{ id: "custom-content", classId: CustomContentControl }],
    });
    return {
      id,
      version: 1,
      contentGroup,
      contentManipulation: {
        id: `${id}-contentManipulationTools`,
        content: <ContentToolWidgetComposer
          cornerButton={
            <BackstageAppButton label="Toggle Backstage" icon="icon-bentley-systems"
              execute={() => UiFramework.backstage.getBackstageToggleCommand().execute()} />
          }
        />,
      },
      viewNavigation: {
        id: `${id}-viewNavigationTools`,
        content: <ViewToolWidgetComposer />,
      },
      toolSettings: {
        id: `${id}-toolSettings`,
      },
      statusBar: {
        id: `${id}-statusBar`,
        content: <StatusBarComposer key={UiFramework.frontstages.activeFrontstageId} items={[]} />,
      },
      leftPanel: {
        size: 500,
        defaultState: StagePanelState.Minimized,
        sections: {
          start: [
            {
              id: "widget-1",
              label: "Widget 1",
              content: <>Frontstage provided widget: <b>widget-1</b></>,
            },
          ],
        },
      },
    };
  }

  public static register(_localizationNamespace: string) {
    // Provides standard tools for ToolWidget in stage
    UiItemsManager.register(new StandardContentToolsUiItemsProvider({
      vertical: {
        selectElement: true,
      },
      horizontal: {
        clearSelection: true,
        clearDisplayOverrides: true,
        hide: "group",
        isolate: "group",
        emphasize: "element",
      },
    }), { providerId: "widget-api-stage-standardContentTools", stageIds: [CustomFrontstageProvider.stageId] });

    // Provides standard tools for NavigationWidget in stage
    UiItemsManager.register(new StandardNavigationToolsUiItemsProvider(), { providerId: "widget-api-stage-standardNavigationTools", stageIds: [CustomFrontstageProvider.stageId] });

    // Provides standard status fields for stage
    UiItemsManager.register(new StandardStatusbarUiItemsProvider(), { providerId: "widget-api-stage-standardStatusItems", stageIds: [CustomFrontstageProvider.stageId] });

    UiFramework.frontstages.addFrontstageProvider(new CustomFrontstageProvider());
    UiFramework.frontstages.onFrontstageActivatedEvent.addListener(({ activatedFrontstageDef }) => {
      if (activatedFrontstageDef.id !== CustomFrontstageProvider.stageId)
        return;
      const defaultTool = CoreTools.selectElementCommand;
      defaultTool.execute();
    });
    CustomStageUiItemsProvider.register();
  }
}
