/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module Item
 */

import { IModelApp, Tool } from "@itwin/core-frontend";
import { OnItemExecutedFunc } from "@itwin/appui-abstract";
import { ActionButtonItemDef } from "./ActionButtonItemDef";
import { ToolItemProps } from "./ItemProps";

/** An Item that starts the execution of a Tool.
 * @public
 */
export class ToolItemDef extends ActionButtonItemDef {
  public toolId: string = "";

  constructor(toolItemProps: ToolItemProps, onItemExecuted?: OnItemExecutedFunc) {
    super(toolItemProps, onItemExecuted);

    if (toolItemProps.execute) {
      this._commandHandler = { execute: toolItemProps.execute, parameters: toolItemProps.parameters, getCommandArgs: toolItemProps.getCommandArgs };
    }

    this.toolId = toolItemProps.toolId;
  }

  public get id(): string {
    return this.toolId;
  }

  /** Create a ToolItemDef that will run a registered tool. */
  public static getItemDefForTool(tool: typeof Tool, icon?: string, ...args: any[]): ToolItemDef {
    return new ToolItemDef({
      toolId: tool.toolId,
      icon: icon ? icon : (tool.iconSpec && tool.iconSpec.length > 0) ? tool.iconSpec : undefined,
      label: () => tool.flyover,
      description: () => tool.description,
      execute: async () => IModelApp.tools.run(tool.toolId, ...args),
    });
  }
}
