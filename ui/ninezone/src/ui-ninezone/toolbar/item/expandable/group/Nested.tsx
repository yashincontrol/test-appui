/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module Toolbar
 */

import classnames from "classnames";
import * as React from "react";
import { Panel } from "./Panel";
import { GroupProps } from "./Group";
import { Columns } from "./Columns";
import { Title } from "./Title";
import { BackArrow } from "./BackArrow";
import "./Nested.scss";

/** Properties of [[NestedGroup]] component.
 * @alpha
 */
export interface NestedGroupProps extends GroupProps {
  /** Function called when the back arrow is clicked. */
  onBack?: () => void;
  /** Function called when pointer up event is received for back arrow. */
  onBackPointerUp?: () => void;
}

/** Nested tool group component. Used in [[ExpandableItem]] component.
 * @alpha
 */
export class NestedGroup extends React.PureComponent<NestedGroupProps> {
  public render() {
    const className = classnames(
      "nz-toolbar-item-expandable-group-nested",
      this.props.className);

    return (
      <Panel className={className} style={this.props.style}>
        <BackArrow
          className="nz-back"
          onClick={this.props.onBack}
          onPointerUp={this.props.onBackPointerUp}
        />
        <Title>
          {this.props.title}
        </Title>
        <Columns>
          {this.props.columns}
        </Columns>
      </Panel>
    );
  }
}
