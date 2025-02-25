/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module Item
 */

import * as React from "react";
import { BadgeType, ConditionalBooleanValue, ConditionalStringValue, StringGetter } from "@itwin/appui-abstract";
import { PropsHelper } from "../utils/PropsHelper";
import { ItemProps } from "./ItemProps";
import { IconSpec } from "@itwin/core-react";

/** Base state for any 'stateful' React component
 * @public
 */
export interface BaseItemState {
  isVisible?: boolean;        // Default - true
  isEnabled?: boolean;        // Default - true
  isActive?: boolean;         // Default - false
  isPressed?: boolean;        // Default - false
}

/** The base class for Items.
 * @public
 */
export abstract class ItemDefBase {
  private _label: string | StringGetter | ConditionalStringValue = "";
  private _tooltip: string | StringGetter | ConditionalStringValue = "";
  private _description: string | StringGetter | ConditionalStringValue = "";

  public isPressed: boolean = false;
  private _isActive: boolean = false;
  public get isActive(): boolean { return this._isActive; }
  public set isActive(v: boolean) { this._isActive = v; }
  public applicationData?: any;

  public isHidden?: boolean | ConditionalBooleanValue;
  public isDisabled?: boolean | ConditionalBooleanValue;

  public badgeType?: BadgeType;

  public iconSpec?: IconSpec;
  public iconElement?: React.ReactNode;

  public static initializeDef(me: ItemDefBase, itemProps: ItemProps): void {
    me.isHidden = itemProps.isHidden;
    me.isDisabled = itemProps.isDisabled;

    me.isPressed = (itemProps.isPressed !== undefined) ? itemProps.isPressed : false;
    me.isActive = (itemProps.isActive !== undefined) ? itemProps.isActive : false;

    me.badgeType = itemProps.badgeType;

    if (itemProps.applicationData !== undefined)
      me.applicationData = itemProps.applicationData;
    if (itemProps.iconSpec)
      me.iconSpec = itemProps.iconSpec;
    if (itemProps.icon)
      me.iconSpec = itemProps.icon;

    me._label = PropsHelper.getStringSpec(itemProps.label, itemProps.labelKey);
    me._tooltip = PropsHelper.getStringSpec(itemProps.tooltip, itemProps.tooltipKey);
    me._description = PropsHelper.getStringSpec(itemProps.description, itemProps.descriptionKey);
  }

  constructor(itemProps: ItemProps) {
    ItemDefBase.initializeDef(this, itemProps);
  }

  public get trayId() { return undefined; }
  public abstract get id(): string;

  /** Get the label string */
  public get rawLabel(): string | StringGetter | ConditionalStringValue {
    return this._label;
  }

  /** Get the label string */
  public get label(): string {
    return PropsHelper.getStringFromSpec(this._label);
  }

  /** Set the label.
   * @param v A string or a function to get the string.
   */
  public setLabel(v: string | StringGetter | ConditionalStringValue) {
    this._label = v;
  }

  /** Get the tooltip string */
  public get tooltip(): string {
    return PropsHelper.getStringFromSpec(this._tooltip);
  }

  /** Set the tooltip.
   * @param v A string or a function to get the string.
   */
  public setTooltip(v: string | StringGetter | ConditionalStringValue) {
    this._tooltip = v;
  }

  /** Get the description string */
  public get description(): string {
    return PropsHelper.getStringFromSpec(this._description);
  }

  /** Set the description.
   * @param v A string or a function to get the string.
   */
  public setDescription(v: string | StringGetter | ConditionalStringValue) {
    this._description = v;
  }
}
