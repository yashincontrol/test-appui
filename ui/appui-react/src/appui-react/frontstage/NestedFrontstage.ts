/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module Frontstage
 */

import { CommandItemDef } from "../shared/CommandItemDef";
import { UiFramework } from "../UiFramework";
import { IconSpecUtilities } from "@itwin/appui-abstract";
import svgProgressBackwardCircular from "@bentley/icons-generic/icons/progress-backward.svg";

/**
 * Nested Frontstage related classes and commands
 * @public
 */
export class NestedFrontstage {
  private static iconSpec = IconSpecUtilities.createWebComponentIconSpec(svgProgressBackwardCircular);
  /** Command that returns to the previous Frontstage */
  public static get backToPreviousFrontstageCommand() {
    return new CommandItemDef({
      commandId: "backToPreviousFrontstage",
      iconSpec: NestedFrontstage.iconSpec,
      labelKey: "UiFramework:commands.backToPreviousFrontstage",
      execute: async () => {
        await UiFramework.frontstages.closeNestedFrontstage();
      },
    });
  }
}
