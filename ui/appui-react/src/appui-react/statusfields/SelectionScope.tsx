/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module StatusBar
 */

import "./SelectionScope.scss";
import classnames from "classnames";
import * as React from "react";
import { connect } from "react-redux";
import { FooterIndicator } from "@itwin/appui-layout-react";
import { Select, SelectOption } from "@itwin/itwinui-react";
import { PresentationSelectionScope } from "../redux/SessionState";
import { UiFramework } from "../UiFramework";
import { CommonProps } from "@itwin/core-react";

/** Defines properties supported by the SelectionScopeField Component.
 * @public
 */
interface SelectionScopeFieldProps extends CommonProps {

  activeSelectionScope: string;
  availableSelectionScopes: PresentationSelectionScope[];
}

/**
 * Status Field React component. This component is designed to be specified in a status bar definition.
 * It is used to display the number of selected items based on the Presentation Rules Selection Manager.
 * The IModelApp should call either UiFramework.setIModelConnection or SyncUiEventDispatcher.initializeConnectionEvents
 * with the active iModelConnection each time a new iModel is opened so the selection scope data is properly updated
 * in the Redux state.
 * @public
 */
class SelectionScopeFieldComponent extends React.Component<SelectionScopeFieldProps> {
  private _label = UiFramework.translate("selectionScopeField.label");
  private _toolTip = UiFramework.translate("selectionScopeField.toolTip");
  private _scopeOptions: SelectOption<string>[] = [];

  constructor(props: SelectionScopeFieldProps) {
    super(props);
    this._scopeOptions = this.props.availableSelectionScopes.map((scope: PresentationSelectionScope) => {
      const label = !!scope.label ? scope.label : UiFramework.translate(`selectionScopeLabels.${scope.id}`);
      return { value: scope.id, label };
    });
  }

  private _updateSelectValue = (newValue: string) => {
    // istanbul ignore else
    if (newValue) {
      UiFramework.setActiveSelectionScope(newValue);
    }
  };

  public override render(): React.ReactNode {

    return (
      <FooterIndicator
        className={classnames("uifw-statusFields-selectionScope", this.props.className)}
        style={this.props.style}
      >
        <label className="uifw-statusFields-selectionScope-label">
          {this._label}:
        </label>
        <Select
          className="uifw-statusFields-selectionScope-selector"
          value={this.props.activeSelectionScope}
          options={this._scopeOptions}
          onChange={this._updateSelectValue}
          data-testid="components-selectionScope-selector"
          title={this._toolTip}
          size="small" />
      </FooterIndicator >
    );
  }
}

/** Function used by Redux to map state data in Redux store to props that are used to render this component. */
function mapStateToProps(state: any) {
  const frameworkState = state[UiFramework.frameworkStateKey];  // since app sets up key, don't hard-code name
  /* istanbul ignore next */
  if (!frameworkState)
    return undefined;

  return { activeSelectionScope: frameworkState.sessionState.activeSelectionScope, availableSelectionScopes: frameworkState.sessionState.availableSelectionScopes };
}

// we declare the variable and export that rather than using export default.
/**
 * SelectionScopeField React component. This component is designed to be specified in a status bar definition. It will
 * display the active selection scope that is used by the PresentationManager to determine what elements are added to the selection nap mode.
 * This React component is Redux connected.
 * @public
 */ // eslint-disable-next-line @typescript-eslint/naming-convention
export const SelectionScopeField = connect(mapStateToProps)(SelectionScopeFieldComponent);
