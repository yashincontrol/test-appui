/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module Tools
 */

import * as React from "react";// cSpell:ignore keyinbrowser
import {
  FitViewTool, FlyViewTool, IModelApp, MeasureDistanceTool, MeasureLocationTool, PanViewTool, RotateViewTool, SelectionTool, SetupWalkCameraTool,
  ViewClipByElementTool, ViewClipByPlaneTool, ViewClipByRangeTool, ViewClipByShapeTool, ViewClipDecorationProvider, ViewRedoTool, ViewToggleCameraTool,
  ViewUndoTool, WalkViewTool, WindowAreaTool, ZoomViewTool,
} from "@itwin/core-frontend";
import { ConditionalBooleanValue, ConditionalStringValue, IconSpecUtilities } from "@itwin/appui-abstract";
import { getIsHiddenIfSelectionNotActive } from "../selection/SelectionContextItemDef";
import { CommandItemDef } from "../shared/CommandItemDef";
import { ToolItemDef } from "../shared/ToolItemDef";
import { SyncUiEventId } from "../syncui/SyncUiEventDispatcher";
import { GroupItemDef } from "../toolbar/GroupItem";
import { RestoreFrontstageLayoutTool } from "./RestoreLayoutTool";
import { UiFramework } from "../UiFramework";
import cameraAnimationIcon from "@itwin/itwinui-icons/icons/camera-animation.svg";
import cameraAnimationDisabledIcon from "@itwin/itwinui-icons/icons/camera-animation-disabled.svg";
import svgGyroscope from "@bentley/icons-generic/icons/gyroscope.svg";
import svgRotateLeft from "@bentley/icons-generic/icons/rotate-left.svg";
import svgSectionTool from "@bentley/icons-generic/icons/section-tool.svg";
import svgSelectionClear from "@bentley/icons-generic/icons/selection-clear.svg";
import { SvgMeasure, SvgProcess } from "@itwin/itwinui-icons-react";

/** Utility Class that provides definitions of tools provided by the ($core-frontend) core. These definitions can be used to populate the UI.
 * @public
 */
// istanbul ignore next
export class CoreTools {
  public static get keyinPaletteButtonItemDef() {
    return new ToolItemDef({
      toolId: "uif:keyinpalette",
      iconSpec: <SvgProcess />,
      labelKey: "UiFramework:keyinbrowser.label",
      execute: () => { IModelApp.uiAdmin.showKeyinPalette(); },
    });
  }

  public static get fitViewCommand() {
    return new ToolItemDef({
      toolId: FitViewTool.toolId,
      iconSpec: FitViewTool.iconSpec,
      label: FitViewTool.flyover,
      description: FitViewTool.description,
      execute: async () => IModelApp.tools.run(FitViewTool.toolId, IModelApp.viewManager.selectedView, true),
    });
  }

  public static get windowAreaCommand() {
    return new ToolItemDef({
      toolId: WindowAreaTool.toolId,
      iconSpec: WindowAreaTool.iconSpec,
      label: WindowAreaTool.flyover,
      description: WindowAreaTool.description,
      execute: async () => IModelApp.tools.run(WindowAreaTool.toolId, IModelApp.viewManager.selectedView),
    });
  }

  public static get zoomViewCommand() {
    return new ToolItemDef({
      toolId: ZoomViewTool.toolId,
      iconSpec: ZoomViewTool.iconSpec,
      label: ZoomViewTool.flyover,
      description: ZoomViewTool.description,
      execute: async () => IModelApp.tools.run(ZoomViewTool.toolId, IModelApp.viewManager.selectedView),
    });
  }

  public static get panViewCommand() {
    return new ToolItemDef({
      toolId: PanViewTool.toolId,
      iconSpec: PanViewTool.iconSpec,
      label: PanViewTool.flyover,
      description: PanViewTool.description,
      execute: async () => IModelApp.tools.run(PanViewTool.toolId, IModelApp.viewManager.selectedView),
    });
  }

  public static get rotateViewCommand() {
    return new ToolItemDef({
      toolId: RotateViewTool.toolId,
      iconSpec: new ConditionalStringValue(() => {
        const activeContentControl = UiFramework.content.getActiveContentControl();
        if (activeContentControl?.viewport?.view.is2d())
          return IconSpecUtilities.createWebComponentIconSpec(svgRotateLeft);
        return IconSpecUtilities.createWebComponentIconSpec(svgGyroscope);
      }, [SyncUiEventId.ActiveContentChanged, SyncUiEventId.ActiveViewportChanged, SyncUiEventId.ViewStateChanged]),
      label: RotateViewTool.flyover,
      description: RotateViewTool.description,
      execute: async () => IModelApp.tools.run(RotateViewTool.toolId, IModelApp.viewManager.selectedView),
    });
  }

  public static get walkViewCommand() {
    return new ToolItemDef({
      toolId: WalkViewTool.toolId,
      iconSpec: WalkViewTool.iconSpec,
      label: WalkViewTool.flyover,
      description: WalkViewTool.description,
      isHidden: new ConditionalBooleanValue(() => {
        const activeContentControl = UiFramework.content.getActiveContentControl();
        return !!activeContentControl?.viewport?.view.is2d();
      }, [SyncUiEventId.ActiveContentChanged, SyncUiEventId.ActiveViewportChanged, SyncUiEventId.ViewStateChanged]),
      execute: async () => IModelApp.tools.run(WalkViewTool.toolId, IModelApp.viewManager.selectedView),
    });
  }

  public static get selectElementCommand() {
    return new ToolItemDef({
      toolId: SelectionTool.toolId,
      iconSpec: SelectionTool.iconSpec,
      label: SelectionTool.flyover,
      description: SelectionTool.description,
      execute: async () => IModelApp.tools.run(SelectionTool.toolId),
    });
  }

  public static get setupCameraWalkTool() {
    return new ToolItemDef({
      toolId: SetupWalkCameraTool.toolId,
      iconSpec: SetupWalkCameraTool.iconSpec,
      label: SetupWalkCameraTool.flyover,
      description: SetupWalkCameraTool.description,
      execute: async () => IModelApp.tools.run(SetupWalkCameraTool.toolId),
    });
  }

  public static get toggleCameraViewCommand() {
    return new ToolItemDef({
      toolId: ViewToggleCameraTool.toolId,
      iconSpec: new ConditionalStringValue(() => {
        const activeContentControl = UiFramework.content.getActiveContentControl();
        if (activeContentControl?.viewport?.view.is3d() && activeContentControl?.viewport?.isCameraOn) {
          return IconSpecUtilities.createWebComponentIconSpec(cameraAnimationIcon);
        }
        return IconSpecUtilities.createWebComponentIconSpec(cameraAnimationDisabledIcon);
      }, [SyncUiEventId.ActiveContentChanged, SyncUiEventId.ActiveViewportChanged, SyncUiEventId.ViewStateChanged]),
      label: new ConditionalStringValue(() => {
        const activeContentControl = UiFramework.content.getActiveContentControl();
        if (activeContentControl?.viewport?.view.is3d() && activeContentControl?.viewport?.isCameraOn) {
          return UiFramework.translate("tools.View.ToggleCamera.turnOffFlyover");
        }
        return UiFramework.translate("tools.View.ToggleCamera.turnOnFlyover");
      }, [SyncUiEventId.ActiveContentChanged, SyncUiEventId.ActiveViewportChanged, SyncUiEventId.ViewStateChanged]),
      description: ViewToggleCameraTool.description,
      isHidden: new ConditionalBooleanValue(() => {
        const activeContentControl = UiFramework.content.getActiveContentControl();
        return !(activeContentControl?.viewport?.view.is3d() && activeContentControl?.viewport?.view.supportsCamera());
      }, [SyncUiEventId.ActiveContentChanged, SyncUiEventId.ActiveViewportChanged, SyncUiEventId.ViewStateChanged]),
      execute: async () => IModelApp.tools.run(ViewToggleCameraTool.toolId, IModelApp.viewManager.selectedView),
    });
  }

  public static get flyViewCommand() {
    return new ToolItemDef({
      toolId: FlyViewTool.toolId,
      iconSpec: FlyViewTool.iconSpec,
      label: FlyViewTool.flyover,
      description: FlyViewTool.description,
      execute: async () => IModelApp.tools.run(FlyViewTool.toolId, IModelApp.viewManager.selectedView),
    });
  }

  // TODO - Need to provide a sync message that is fired when the Undo/Redo button needs to be refreshed in the
  // active view.
  public static get viewUndoCommand() {
    return new ToolItemDef({
      toolId: ViewUndoTool.toolId,
      isDisabled: new ConditionalBooleanValue(() => {
        const activeContentControl = UiFramework.content.getActiveContentControl();
        if (activeContentControl && activeContentControl.viewport)
          return !activeContentControl.viewport.isUndoPossible;
        return false;
      }, [SyncUiEventId.ActiveContentChanged, SyncUiEventId.ActiveViewportChanged, SyncUiEventId.ViewStateChanged]),
      iconSpec: ViewUndoTool.iconSpec,
      label: ViewUndoTool.flyover,
      description: ViewUndoTool.description,
      execute: async () => IModelApp.tools.run(ViewUndoTool.toolId, IModelApp.viewManager.selectedView),
    });
  }

  public static get viewRedoCommand() {
    return new ToolItemDef({
      toolId: ViewRedoTool.toolId,
      iconSpec: ViewRedoTool.iconSpec,
      label: ViewRedoTool.flyover,
      description: ViewRedoTool.description,
      execute: async () => IModelApp.tools.run(ViewRedoTool.toolId, IModelApp.viewManager.selectedView),
      isDisabled: new ConditionalBooleanValue(() => {
        const activeContentControl = UiFramework.content.getActiveContentControl();
        if (activeContentControl && activeContentControl.viewport)
          return !activeContentControl.viewport.isRedoPossible;
        return false;
      }, [SyncUiEventId.ActiveContentChanged, SyncUiEventId.ActiveViewportChanged, SyncUiEventId.ViewStateChanged]),
    });
  }

  private static turnOnClipVolume() {
    const vp = IModelApp.viewManager.selectedView;
    if (!vp || !vp.view.is3d())
      return;

    // Turn on clip volume flag for section tools
    vp.viewFlags = vp.viewFlags.with("clipVolume", true);
  }

  // note current ViewClipByPlaneTool is not automatically registered so the app must call ViewClipByPlaneTool.register();
  public static get sectionByPlaneCommandItemDef() {
    return new ToolItemDef({
      toolId: ViewClipByPlaneTool.toolId,
      iconSpec: ViewClipByPlaneTool.iconSpec,
      label: ViewClipByPlaneTool.flyover,
      description: ViewClipByPlaneTool.description,
      execute: async () => {
        this.turnOnClipVolume();
        return IModelApp.tools.run(ViewClipByPlaneTool.toolId, ViewClipDecorationProvider.create());
      },
    });
  }

  // note current ViewClipByElementTool is not automatically registered so the app must call ViewClipByElementTool.register();
  public static get sectionByElementCommandItemDef() {
    return new ToolItemDef({
      toolId: ViewClipByElementTool.toolId,
      iconSpec: ViewClipByElementTool.iconSpec,
      label: ViewClipByElementTool.flyover,
      description: ViewClipByElementTool.description,
      execute: async () => {
        this.turnOnClipVolume();
        return IModelApp.tools.run(ViewClipByElementTool.toolId, ViewClipDecorationProvider.create());
      },
    });
  }

  // note current ViewClipByRangeTool is not automatically registered so the app must call ViewClipByRangeTool.register();
  public static get sectionByRangeCommandItemDef() {
    return new ToolItemDef({
      toolId: ViewClipByRangeTool.toolId,
      iconSpec: ViewClipByRangeTool.iconSpec,
      label: ViewClipByRangeTool.flyover,
      description: ViewClipByRangeTool.description,
      execute: async () => {
        this.turnOnClipVolume();
        return IModelApp.tools.run(ViewClipByRangeTool.toolId, ViewClipDecorationProvider.create());
      },
    });
  }

  // note current ViewClipByShapeTool is not automatically registered so the app must call ViewClipByShapeTool.register();
  public static get sectionByShapeCommandItemDef() {
    return new ToolItemDef({
      toolId: ViewClipByShapeTool.toolId,
      iconSpec: ViewClipByShapeTool.iconSpec,
      label: ViewClipByShapeTool.flyover,
      description: ViewClipByShapeTool.description,
      execute: async () => {
        this.turnOnClipVolume();
        return IModelApp.tools.run(ViewClipByShapeTool.toolId, ViewClipDecorationProvider.create());
      },
    });
  }

  public static get sectionToolGroup() {
    ViewClipByElementTool.register();
    ViewClipByPlaneTool.register();
    ViewClipByRangeTool.register();
    ViewClipByShapeTool.register();

    return new GroupItemDef({
      groupId: "sectionTools-group",
      labelKey: "UiFramework:tools.sectionTools",
      iconSpec: IconSpecUtilities.createWebComponentIconSpec(svgSectionTool),
      isHidden: new ConditionalBooleanValue(() => {
        const activeContentControl = UiFramework.content.getActiveContentControl();
        return !!activeContentControl?.viewport?.view.is2d();
      }, [SyncUiEventId.ActiveContentChanged, SyncUiEventId.ActiveViewportChanged, SyncUiEventId.ViewStateChanged]),
      items: [this.sectionByPlaneCommandItemDef, this.sectionByElementCommandItemDef, this.sectionByRangeCommandItemDef, this.sectionByShapeCommandItemDef],
      itemsInColumn: 4,
    });
  }

  public static get sectionToolGroupWithPanel() {
    ViewClipByElementTool.register();
    ViewClipByPlaneTool.register();
    ViewClipByRangeTool.register();
    ViewClipByShapeTool.register();

    return new GroupItemDef({
      groupId: "sectionTools-group-with-panel",
      labelKey: "UiFramework:tools.sectionTools",
      panelLabelKey: "UiFramework:tools.sectionPanelLabel",
      iconSpec: IconSpecUtilities.createWebComponentIconSpec(svgSectionTool),
      isHidden: new ConditionalBooleanValue(() => {
        const activeContentControl = UiFramework.content.getActiveContentControl();
        return !!activeContentControl?.viewport?.view.is2d();
      }, [SyncUiEventId.ActiveContentChanged, SyncUiEventId.ActiveViewportChanged, SyncUiEventId.ViewStateChanged]),
      items: [
        new ToolItemDef({
          ...this.sectionByPlaneCommandItemDef,
          labelKey: "UiFramework:tools.sectionByPlane",
        }),
        new ToolItemDef({
          ...this.sectionByElementCommandItemDef,
          labelKey: "UiFramework:tools.sectionByElement",
        }),
        new ToolItemDef({
          ...this.sectionByRangeCommandItemDef,
          labelKey: "UiFramework:tools.sectionByRange",
        }),
        new ToolItemDef({
          ...this.sectionByShapeCommandItemDef,
          labelKey: "UiFramework:tools.sectionByShape",
        }),
      ],
      itemsInColumn: 4,
    });

  }

  // note current MeasureDistanceTool is not automatically registered so the app must call MeasureDistanceTool.register();
  public static get measureDistanceToolItemDef() {
    return new ToolItemDef({
      toolId: MeasureDistanceTool.toolId,
      iconSpec: MeasureDistanceTool.iconSpec,
      label: MeasureDistanceTool.flyover,
      description: MeasureDistanceTool.description,
      execute: async () => {
        return IModelApp.tools.run(MeasureDistanceTool.toolId);
      },
    });
  }

  // note current MeasureLocationTool is not automatically registered so the app must call MeasureLocationTool.register();
  public static get measureLocationToolItemDef() {
    return new ToolItemDef({
      toolId: MeasureLocationTool.toolId,
      iconSpec: MeasureLocationTool.iconSpec,
      label: MeasureLocationTool.flyover,
      description: MeasureLocationTool.description,
      execute: async () => {
        return IModelApp.tools.run(MeasureLocationTool.toolId);
      },
    });
  }

  public static get measureToolGroup() {
    MeasureDistanceTool.register();
    MeasureLocationTool.register();

    return new GroupItemDef({
      groupId: "measureTools-group",
      labelKey: "UiFramework:tools.measureTools",
      iconSpec: <SvgMeasure />,
      items: [this.measureDistanceToolItemDef, this.measureLocationToolItemDef],
      itemsInColumn: 2,
    });
  }

  public static get clearSelectionItemDef() {
    return new CommandItemDef({
      commandId: "UiFramework.ClearSelection",
      iconSpec: IconSpecUtilities.createWebComponentIconSpec(svgSelectionClear),
      labelKey: "UiFramework:buttons.clearSelection",
      isHidden: getIsHiddenIfSelectionNotActive(),
      execute: async () => {
        const iModelConnection = UiFramework.getIModelConnection();
        if (iModelConnection) {
          iModelConnection.selectionSet.emptyAll();
        }
        const tool = IModelApp.toolAdmin.primitiveTool;
        if (tool)
          await tool.onRestartTool();
        else
          await IModelApp.toolAdmin.startDefaultTool();
      },
    });
  }

  public static get restoreFrontstageLayoutCommandItemDef() {
    return new ToolItemDef({
      toolId: RestoreFrontstageLayoutTool.toolId,
      iconSpec: RestoreFrontstageLayoutTool.iconSpec,
      label: RestoreFrontstageLayoutTool.flyover,
      description: RestoreFrontstageLayoutTool.description,
      execute: async () => {
        return IModelApp.tools.run(RestoreFrontstageLayoutTool.toolId);
      },
    });
  }
}
