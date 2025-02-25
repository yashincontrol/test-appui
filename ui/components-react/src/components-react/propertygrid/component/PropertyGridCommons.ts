/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module PropertyGrid
 */

import { PropertyRecord } from "@itwin/appui-abstract";
import { CommonProps, Orientation } from "@itwin/core-react";
import { HighlightingComponentProps } from "../../common/HighlightingComponentProps";
import { matchLinks } from "../../common/Links";
import { PropertyUpdatedArgs } from "../../editors/EditorContainer";
import { ActionButtonRenderer } from "../../properties/renderers/ActionButtonRenderer";
import { PropertyValueRendererManager } from "../../properties/ValueRendererManager";
import { FilteredType } from "../dataproviders/filterers/PropertyDataFiltererBase";
import { PropertyCategory } from "../PropertyDataProvider";

/** Arguments for the Property Editing event callback
 * @public
 */
export interface PropertyEditingArgs {
  /** PropertyRecord being edited  */
  propertyRecord: PropertyRecord;
  /** Unique key of currently edited property */
  propertyKey?: string;
}

/** Arguments for `PropertyGridProps.onPropertyContextMenu` callback
 * @public
 */
export interface PropertyGridContextMenuArgs {
  /** PropertyRecord being edited  */
  propertyRecord: PropertyRecord;
  /** An event which caused the context menu callback */
  event: React.MouseEvent;
}

/**
 * Common Property Grid Props to be used by Property Grid Variants
 * @public
 */
export interface CommonPropertyGridProps extends CommonProps {
  /** Grid orientation. When not defined, it is chosen automatically based on width of the grid. */
  orientation?: Orientation;

  /** Enables/disables property hovering effect */
  isPropertyHoverEnabled?: boolean;

  /** Called to show a context menu when properties are right-clicked */
  onPropertyContextMenu?: (args: PropertyGridContextMenuArgs) => void;

  /** Enables/disables property selection */
  isPropertySelectionEnabled?: boolean;
  /** Enables/disables property selection with right click */
  isPropertySelectionOnRightClickEnabled?: boolean;
  /** Callback to property selection */
  onPropertySelectionChanged?: (property: PropertyRecord) => void;

  /** Enables/disables property editing */
  isPropertyEditingEnabled?: boolean;
  /** Callback for when properties are being edited */
  onPropertyEditing?: (args: PropertyEditingArgs, category: PropertyCategory) => void;
  /** Callback for when properties are updated */
  onPropertyUpdated?: (args: PropertyUpdatedArgs, category: PropertyCategory) => Promise<boolean>;

  /** Custom property value renderer manager */
  propertyValueRendererManager?: PropertyValueRendererManager;

  /** Indicates whether the orientation is fixed and does not auto-switch to Vertical when the width is too narrow. Defaults to false. */
  isOrientationFixed?: boolean;
  /** The minimum width before the auto-switch to Vertical when the width is too narrow. Defaults to 300. */
  horizontalOrientationMinWidth?: number;

  /** Minimum allowed label column width, after which resizing stops */
  minLabelWidth?: number;
  /** Minimum allowed value column width, after which resizing stops */
  minValueWidth?: number;
  /** Fixed action button column width */
  actionButtonWidth?: number;

  /**
   * Array of action button renderers. Each renderer is called for each property and can decide
   * to render an action button for the property or not.
   */
  actionButtonRenderers?: ActionButtonRenderer[];
}

/**
 * Properties for highlighting text in property grid.
 * @public
 */
export interface PropertyGridContentHighlightProps extends HighlightingComponentProps {
  /**
   * Specifies what the highlighting should be applied on - category labels, property labels and / or property values.
   * Defaults to "nowhere".
   */
  filteredTypes?: FilteredType[];
}

/** @internal */
export class PropertyGridCommons {
  public static getCurrentOrientation(width: number, preferredOrientation?: Orientation, isOrientationFixed?: boolean, horizontalOrientationMinWidth?: number): Orientation {
    const orientation = preferredOrientation ?? Orientation.Horizontal;
    if (isOrientationFixed)
      return orientation;

    horizontalOrientationMinWidth = horizontalOrientationMinWidth ?? 300;
    // Switch to Vertical if width too small
    if (width < horizontalOrientationMinWidth)
      return Orientation.Vertical;

    return orientation;
  }

  /**
   * Helper method to handle link clicks
   * @internal
   */
  public static handleLinkClick(text: string) {
    const linksArray = matchLinks(text);
    if (linksArray.length <= 0)
      return;
    const foundLink = linksArray[0];
    // istanbul ignore else
    if (foundLink && foundLink.url) {
      if (foundLink.schema === "mailto:" || foundLink.schema === "pw:")
        location.href = foundLink.url;
      else {
        const windowOpen = window.open(foundLink.url, "_blank");
        if (windowOpen)
          windowOpen.focus();
      }
    }
  }

  /**
   * A helper method to get links from string.
   * @internal
   */
  public static getLinks = (value: string): Array<{ start: number, end: number }> => {
    return matchLinks(value).map((linkInfo: { index: number, lastIndex: number }) => {
      return { start: linkInfo.index, end: linkInfo.lastIndex };
    });
  };
}
