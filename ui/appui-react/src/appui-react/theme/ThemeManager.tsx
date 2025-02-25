/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module State
 */

import * as React from "react";
import { connect } from "react-redux";
import { ThemeProvider, ThemeType } from "@itwin/itwinui-react";
import { FrameworkState } from "../redux/FrameworkState";
import { UiFramework } from "../UiFramework";

/** Enum for the Color Theme string.
 * @public
 */
export enum ColorTheme {
  Light = "light",
  Dark = "dark",
}

/** System preferred color theme.
 * @public
 */
export const SYSTEM_PREFERRED_COLOR_THEME = "SYSTEM_PREFERRED";

/** The default widget opacity.
 * @public
 */
export const WIDGET_OPACITY_DEFAULT = 0.90;

/** The default widget opacity.
 * @public
 */
export const TOOLBAR_OPACITY_DEFAULT = 0.50;

/** Properties of [[ThemeManagerComponent]].
 */
interface ThemeManagerProps {
  /** theme ("light", "dark", etc.) */
  theme: string;
  /* Widget Opacity */
  widgetOpacity: number;
  children?: React.ReactNode;
  toolbarOpacity: number;
}

function mapStateToProps(state: any) {
  const frameworkState = state[UiFramework.frameworkStateKey] as FrameworkState;  // since app sets up key, don't hard-code name
  // istanbul ignore if
  if (!frameworkState)
    return undefined;

  return {
    theme: frameworkState.configurableUiState.theme,
    widgetOpacity: frameworkState.configurableUiState.widgetOpacity,
    toolbarOpacity: frameworkState.configurableUiState.toolbarOpacity,
  };
}

/** @internal */
interface ThemeManagerState {
  ownerDocument: Document | undefined;
}

/** ThemeManagerComponent handles setting themes.
 */
class ThemeManagerComponent extends React.Component<ThemeManagerProps, ThemeManagerState> {

  public override readonly state: ThemeManagerState = {
    ownerDocument: undefined,
  };

  public override componentDidMount() {
    this._setTheme(this.props.theme);
  }

  public override componentDidUpdate(prevProps: ThemeManagerProps) {
    if (this.props.theme !== prevProps.theme)
      this._setTheme(this.props.theme);
    const currentWidgetOpacity = document.documentElement.style.getPropertyValue("--buic-widget-opacity");
    if (this.props.widgetOpacity.toString() !== currentWidgetOpacity)
      this._setWidgetOpacity(this.props.widgetOpacity);
    const currentToolbarOpacity = document.documentElement.style.getPropertyValue("--buic-toolbar-opacity");
    if (this.props.toolbarOpacity.toString() !== currentToolbarOpacity)
      this._setToolbarOpacity(this.props.toolbarOpacity);
  }

  private _setTheme = (theme: string) => {
    document.documentElement.classList.add("theme-transition");
    document.documentElement.setAttribute("data-theme", theme);
    window.setTimeout(() => document.documentElement.classList.remove("theme-transition"), 1000);
  };

  private _setWidgetOpacity = (opacity: number) => {
    setTimeout(() =>
      document.documentElement.style.setProperty("--buic-widget-opacity", opacity.toString()));
  };

  private _setToolbarOpacity = (opacity: number) => {
    setTimeout(() =>
      document.documentElement.style.setProperty("--buic-toolbar-opacity", opacity.toString()));
  };

  private _handleRefSet = (popupDiv: HTMLElement | null) => {
    const ownerDocument = popupDiv?.ownerDocument ?? undefined;
    if (ownerDocument) {
      this.setState({ ownerDocument });
    }
  };

  public override render(): React.ReactNode {
    const theme: ThemeType = (this.props.theme === SYSTEM_PREFERRED_COLOR_THEME) ? "os" : this.props.theme as ThemeType;

    return (
      <ThemeProvider style={{ height: "100%" }} theme={theme} data-root-container={"iui-root-id"} ref={this._handleRefSet}>
        {this.props.children}
      </ThemeProvider>
    );
  }
}

/**
 * ThemeManager handles setting color themes.
 * This React component is Redux connected.
 * @public
 */
export const ThemeManager = connect(mapStateToProps)(ThemeManagerComponent); // eslint-disable-line @typescript-eslint/naming-convention
