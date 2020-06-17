/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module Toolbar
 */

import "./Item.scss";
import classnames from "classnames";
import * as React from "react";
import { CommonProps } from "@bentley/ui-core";

/** Properties of [[ToolbarButtonItem]] component.
 * @beta
 */
export interface ToolbarButtonItemProps extends CommonProps {
  /** button icon. */
  icon?: React.ReactNode;
  /** Describes if item is active. */
  isActive?: boolean;
  /** Describes if the item is disabled. */
  isDisabled?: boolean;
  /** Function called when the item is clicked. */
  onClick?: () => void;
  /** Function called when a key is pressed. */
  onKeyDown?: (e: React.KeyboardEvent) => void;
  /** Title for the item. */
  title: string;
  /** A badge to draw. */
  badge?: React.ReactNode;
  /** If true add a gap before button. Default to false. */
  addGroupSeparator?: boolean;
}

/** Toolbar item component. Used in [[Toolbar]] component.
 * @beta
 */
export const ToolbarButtonItem = React.memo<React.FC<ToolbarButtonItemProps>>( // tslint:disable-line: variable-name
  (props: ToolbarButtonItemProps) => {
    const className = classnames(
      "components-toolbar-button-item",
      props.isActive && "components-active",
      props.isDisabled && "components-disabled",
      props.className);

    return (
      <button
        disabled={props.isDisabled}  // this is needed to prevent focusing/keyboard access to disabled buttons
        onClick={props.onClick}
        onKeyDown={props.onKeyDown}
        className={className}
        style={props.style}
        title={props.title}
      >
        <div className="components-icon">
          {props.icon}
        </div>
        {props.badge &&
          <div className="components-badge">
            {props.badge}
          </div>
        }
      </button>
    );
  });
