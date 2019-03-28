/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { SampleAppIModelApp, SampleAppUiActionId } from "..";
import {
  Backstage,
  FrontstageManager,
  FrontstageLaunchBackstageItem,
  CommandLaunchBackstageItem,
  SeparatorBackstageItem,
  BooleanSyncUiListener,
  SettingsModalFrontstage,
  TaskLaunchBackstageItem,
} from "@bentley/ui-framework";

export class AppBackstage extends React.Component {

  public render(): React.ReactNode {
    return (
      <Backstage accessToken={SampleAppIModelApp.store.getState().sampleAppState.accessToken} >
        <FrontstageLaunchBackstageItem frontstageId="Test1" labelKey="SampleApp:backstage.testFrontstage1" iconSpec="icon icon-placeholder" />
        <FrontstageLaunchBackstageItem frontstageId="Test2" labelKey="SampleApp:backstage.testFrontstage2" iconSpec="icon icon-placeholder" />
        <BooleanSyncUiListener eventIds={[SampleAppUiActionId.setTestProperty]} boolFunc={(): boolean => SampleAppIModelApp.getTestProperty() !== "HIDE"}>
          {(isVisible: boolean) => isVisible && <FrontstageLaunchBackstageItem frontstageId="Test3" labelKey="SampleApp:backstage.testFrontstage3" iconSpec="icon icon-placeholder" />}
        </BooleanSyncUiListener>
        <BooleanSyncUiListener eventIds={[SampleAppUiActionId.setTestProperty]} boolFunc={(): boolean => SampleAppIModelApp.getTestProperty() === "HIDE"} defaultValue={false}>
          {(isEnabled: boolean) => <FrontstageLaunchBackstageItem frontstageId="Test4" labelKey="SampleApp:backstage.testFrontstage4" iconSpec="icon icon-placeholder" isEnabled={isEnabled} />}
        </BooleanSyncUiListener>
        <SeparatorBackstageItem />
        <FrontstageLaunchBackstageItem frontstageId="IModelOpen" labelKey="SampleApp:backstage.imodelopen" iconSpec="icon icon-folder-opened" />
        <FrontstageLaunchBackstageItem frontstageId="IModelIndex" labelKey="SampleApp:backstage.imodelindex" iconSpec="icon icon-placeholder" />
        <SeparatorBackstageItem />
        <CommandLaunchBackstageItem labelKey="SampleApp:backstage.testFrontstage6" iconSpec="icon icon-settings"
          commandId="SampleApp:backstage.testFrontstage6" execute={() => FrontstageManager.openModalFrontstage(new SettingsModalFrontstage())} />
        <SeparatorBackstageItem />
        <FrontstageLaunchBackstageItem frontstageId="ViewsFrontstage" labelKey="SampleApp:backstage.viewIModel" descriptionKey="SampleApp:backstage.iModelStage" iconSpec="icon-placeholder" />
        <SeparatorBackstageItem />
        <TaskLaunchBackstageItem workflowId="ExampleWorkflow" taskId="Task1" labelKey="SampleApp:backstage.task1" iconSpec="icon-placeholder" />
        <TaskLaunchBackstageItem workflowId="ExampleWorkflow" taskId="Task2" labelKey="SampleApp:backstage.task2" iconSpec="icon-placeholder" />
        <FrontstageLaunchBackstageItem frontstageId="ScheduleAnimationFrontstage" label="Schedule Animation" iconSpec="icon-placeholder" />
      </Backstage>
    );
  }
}

export default AppBackstage;
