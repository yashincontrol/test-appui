/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
/** @module Tools */

import {
  IModelApp, PrimitiveTool,
  BeButtonEvent, EventHandled, Viewport,
} from "@bentley/imodeljs-frontend";

import { Point3d } from "@bentley/geometry-core";
import { ConfigurableUiManager } from "../configurableui/ConfigurableUiManager";
import { AnalysisAnimationToolSettingsProvider } from "./AnalysisAnimationToolSettings";

/** Tool that shows animation of Analysis information store as a 'special' property in the display style. */
export class AnalysisAnimationTool extends PrimitiveTool {
  public static toolId = "AnalysisAnimationTool";
  public readonly points: Point3d[] = [];

  /** Allow tool to run on ready only iModels. */
  public requireWriteableTarget(): boolean { return false; }
  public onPostInstall() { super.onPostInstall(); this.setupAndPromptForNextAction(); }

  /** Show tool prompt. */
  public setupAndPromptForNextAction(): void {
    IModelApp.notifications.outputPromptByKey("UiFramework:tools.AnalysisAnimation.Prompts.SelectView");
  }

  /** Handle user pressing left mouse button. */
  public async onDataButtonDown(ev: BeButtonEvent): Promise<EventHandled> {
    this.points.push(ev.point.clone());
    this.setupAndPromptForNextAction();
    return EventHandled.No;
  }

  /** Handle user pressing right mouse button. */
  public async onResetButtonUp(_ev: BeButtonEvent): Promise<EventHandled> {
    IModelApp.toolAdmin.startDefaultTool();
    return EventHandled.No;
  }

  /** Process request to restart the tool. */
  public onRestartTool(): void {
    const tool = new AnalysisAnimationTool();
    if (!tool.run())
      this.exitTool();
  }

  /** Process selected viewport changes. */
  public onSelectedViewportChanged(_previous: Viewport | undefined, current: Viewport | undefined): void {
    if (current && undefined !== current.view.AnalysisStyle)
      return;
    IModelApp.toolAdmin.startDefaultTool();
  }
}

ConfigurableUiManager.registerControl(AnalysisAnimationTool.toolId, AnalysisAnimationToolSettingsProvider);
