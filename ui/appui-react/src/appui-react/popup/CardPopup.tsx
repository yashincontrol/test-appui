/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module Popup
 */

import "./CardPopup.scss";
import * as React from "react";
import classnames from "classnames";
import { CommonToolbarItem, OnCancelFunc, OnItemExecutedFunc, PropertyRecord, RelativePosition, SpecialKey } from "@itwin/appui-abstract";
import { DivWithOutsideClick, FocusTrap, Orientation, Point, Size, SizeProps } from "@itwin/core-react";
import { Text } from "@itwin/itwinui-react";
import { CursorPopup } from "../cursor/cursorpopup/CursorPopup";
import { isReactContent, PopupContentType, PopupManager, PopupPropsBase } from "./PopupManager";
import { PositionPopup } from "./PositionPopup";
import { MessageDiv } from "../messages/MessageSpan";
import { Direction, PropertyValueRendererManager, ToolbarOpacitySetting, ToolbarPanelAlignment, ToolbarWithOverflow } from "@itwin/components-react";

/** Props for defining a CardPopup editor
 * @beta */
export interface CardPopupProps extends PopupPropsBase {
  content: PopupContentType;
  title: string | PropertyRecord | undefined;
  items: CommonToolbarItem[] | undefined;
  relativePosition: RelativePosition;
  orientation: Orientation;
  onCancel: OnCancelFunc;
  onItemExecuted: OnItemExecutedFunc;
}

/** @internal */
interface CardPopupState {
  size: Size;
}

/** Popup component for Input Editor
 * @beta
 */
export class CardPopup extends React.PureComponent<CardPopupProps, CardPopupState> {
  /** @internal */
  public override readonly state = {
    size: new Size(-1, -1),
  };

  private _onSizeKnown = (newSize: SizeProps) => {
    // istanbul ignore else
    if (!this.state.size.equals(newSize))
      this.setState({ size: Size.create(newSize) });
  };

  private _handleKeyDown = (event: React.KeyboardEvent): void => {
    switch (event.key) {
      case SpecialKey.Escape:
        this._cancel();
        break;
    }
  };

  private _cancel() {
    // istanbul ignore else
    if (this.props.onCancel) {
      this.props.onCancel();
    }
  }

  public override render() {
    let point = PopupManager.getPopupPosition(this.props.el, this.props.pt, new Point(), this.state.size);
    const popupRect = CursorPopup.getPopupRect(point, this.props.offset, this.state.size, this.props.relativePosition);
    point = new Point(popupRect.left, popupRect.top);

    return (
      <PositionPopup key={this.props.id}
        className={classnames("uifw-no-border", "uifw-card")}
        point={point}
        onSizeKnown={this._onSizeKnown}
      >
        <DivWithOutsideClick onOutsideClick={this.props.onCancel} onKeyDown={this._handleKeyDown}>
          <FocusTrap active={true} returnFocusOnDeactivate={true}>
            <Card content={this.props.content} title={this.props.title} items={this.props.items}
              onItemExecuted={this.props.onItemExecuted} />
          </FocusTrap>
        </DivWithOutsideClick>
      </PositionPopup>
    );
  }
}

/** Props defining a Card component
 * @beta */
export interface CardProps {
  content: PopupContentType;
  title: string | PropertyRecord | undefined;
  items: CommonToolbarItem[] | undefined;
  onItemExecuted: OnItemExecutedFunc;
}

/** Card component
 * @beta */
export function Card(props: CardProps) {
  let titleNode: React.ReactNode;
  // istanbul ignore else
  if (props.title) {
    if (typeof props.title === "string")
      titleNode = <Text variant="leading">{props.title}</Text>;
    else {
      const propertyValueRendererManager = PropertyValueRendererManager.defaultManager;
      const titleValue = propertyValueRendererManager.render(props.title);
      titleNode = <Text variant="leading">{titleValue}</Text>;
    }
  }

  const content = isReactContent(props.content) ? props.content.reactNode : <MessageDiv message={props.content} />;

  return (
    <>
      <div className="uifw-card-content">
        {props.title &&
          <>
            {titleNode}
            <div className="uifw-card-gap" />
          </>
        }
        {content}
      </div>
      {props.items &&
        <>
          <div className="uifw-card-separator" />
          <ToolbarWithOverflow
            expandsTo={Direction.Bottom}
            panelAlignment={ToolbarPanelAlignment.Start}
            items={props.items}
            useDragInteraction={true}
            toolbarOpacitySetting={ToolbarOpacitySetting.Transparent}
            onItemExecuted={props.onItemExecuted}
          />
        </>
      }
    </>
  );
}
