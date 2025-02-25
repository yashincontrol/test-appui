/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module ContentView
 */

import * as React from "react";
import { Id64String } from "@itwin/core-bentley";
import { IModelConnection, ScreenViewport, ViewState } from "@itwin/core-frontend";
import { ViewportComponent, ViewStateProp } from "@itwin/imodel-components-react";
import { FillCentered } from "@itwin/core-react";

import { ConfigurableCreateInfo } from "../configurableui/ConfigurableUiControl";
import { connectIModelConnectionAndViewState } from "../redux/connectIModel";
import { UiFramework } from "../UiFramework";
import { DefaultViewOverlay } from "./DefaultViewOverlay";
import { ViewportContentControl } from "./ViewportContentControl";
import { StandardRotationNavigationAidControl } from "../navigationaids/StandardRotationNavigationAid";
import { UiError } from "@itwin/appui-abstract";
import { useSelector } from "react-redux";
import { FrameworkState } from "../redux/FrameworkState";

/** Viewport that is connected to the IModelConnection property in the Redux store. The application must set up the Redux store and include the FrameworkReducer.
 * @public
 */
export const IModelConnectedViewport = connectIModelConnectionAndViewState(null, null)(ViewportComponent); // eslint-disable-line @typescript-eslint/naming-convention

/** [[IModelViewportControl]] options. These options are set in the applicationData property of the [[ContentProps]].
 * @public
 */
export interface IModelViewportControlOptions {
  /** ViewState or a function to return a ViewState */
  viewState?: ViewStateProp;
  /** IModelConnection of data in Viewport */
  iModelConnection?: IModelConnection | (() => IModelConnection);
  /** Map of options that can be used to enable/disable features within the view */
  featureOptions?: { [key: string]: any };
  /** Optional background color which may be used if viewState and iModelConnection are undefined */
  bgColor?: string;
  /** Optional property to always use the supplied `viewState` property instead of using viewport.view when set */
  alwaysUseSuppliedViewState?: boolean;
  /** Optional property to supply custom view overlay. Uses when caller want to supply custom overlay component. */
  supplyViewOverlay?: (_viewport: ScreenViewport) => React.ReactNode;
  /** Optional property to defer reactNode initialization until first reactNode property is needed. Useful when subclassing the `IModelViewportControl`. */
  deferNodeInitialization?: boolean;
}

interface ViewOverlayHostProps {
  viewport: ScreenViewport;
  featureOptions?: { [key: string]: any };
  userSuppliedOverlay?: (_viewport: ScreenViewport) => React.ReactNode;
}
/** View Overlay component -- exported for testing
 * @internal
 */
// istanbul ignore next
export function ViewOverlayHost({ viewport, featureOptions, userSuppliedOverlay }: ViewOverlayHostProps) {
  const displayViewOverlay = useSelector((state: FrameworkState) => {
    const frameworkState = (state as any)[UiFramework.frameworkStateKey];
    return frameworkState ? frameworkState.configurableUiState.viewOverlayDisplay : true;
  });
  if (!displayViewOverlay)
    return null;
  return userSuppliedOverlay ? <React.Fragment>{userSuppliedOverlay(viewport)}</React.Fragment> : <DefaultViewOverlay viewport={viewport} featureOptions={featureOptions} />;
}
/** iModel Viewport Control
 * @public
 */
// istanbul ignore next
export class IModelViewportControl extends ViewportContentControl {
  public static get id() {
    return "UiFramework.IModelViewportControl";
  }
  protected _featureOptions: { [key: string]: boolean | string } = {};
  protected _viewState: ViewStateProp | undefined;
  protected _iModelConnection: IModelConnection | undefined;
  protected _alwaysUseSuppliedViewState: boolean;
  private _userSuppliedViewOverlay?: (_viewport: ScreenViewport) => React.ReactNode;

  constructor(info: ConfigurableCreateInfo, protected _options: IModelViewportControlOptions) {
    super(info, _options);

    if (_options.featureOptions)
      this._featureOptions = _options.featureOptions;
    this._alwaysUseSuppliedViewState = _options.alwaysUseSuppliedViewState ?? false;
    this._userSuppliedViewOverlay = _options.supplyViewOverlay;

    if (!_options.deferNodeInitialization)
      this.initializeReactNode();
  }

  protected initializeReactNode() {
    const options = this._options;

    if (options.viewState)
      this._viewState = options.viewState;

    const iModelConnection = (typeof options.iModelConnection === "function") ? options.iModelConnection() : options.iModelConnection;

    if (this._viewState && iModelConnection) {
      /** Passing _determineViewState as a function reference; it is not called here. */
      this._reactNode = this.getImodelViewportReactElement(iModelConnection, this._determineViewState);
    } else {
      if (UiFramework.getIModelConnection() && UiFramework.getDefaultViewState()) {
        this._reactNode = this.getImodelConnectedViewportReactElement();
      } else {
        this._reactNode = this.getNoContentReactElement(options);
        this.setIsReady();
      }
    }
  }

  protected override getReactNode(): React.ReactNode {
    if (!React.isValidElement(this._reactNode) && this._options.deferNodeInitialization)
      this.initializeReactNode();

    return this.getKeyedReactNode();
  }

  /**
   * This is passed as a function to the ViewportComponent as the `viewState` prop in getImodelViewportReactElement().
   * It is called by ViewportComponent on a mount to resolve the viewState.
   */
  private _determineViewState = (): ViewState => {
    let viewState: ViewState;

    if (this.viewport && !this._alwaysUseSuppliedViewState)
      viewState = this.viewport.view;
    else if (this._viewState) {
      if (typeof this._viewState === "function")
        viewState = this._viewState();
      else
        viewState = this._viewState;
    } else
      throw new UiError(UiFramework.loggerCategory(this), "No ViewState could be determined");

    return viewState!;
  };

  /** Get the React component that will contain the Viewport */
  protected getImodelConnectedViewportReactElement(): React.ReactNode {
    return <IModelConnectedViewport
      viewportRef={(v: ScreenViewport) => {
        this.viewport = v;
        // for convenience, if window defined bind viewport to window
        if (undefined !== window)
          (window as any).viewport = v;
        if (!UiFramework.frontstages.isLoading)
          UiFramework.frontstages.activeFrontstageDef?.setActiveViewFromViewport(v);
      }}
      getViewOverlay={this._getViewOverlay}
    />;
  }

  /** Get the React component that will contain the Viewport */
  protected getImodelViewportReactElement(iModelConnection: IModelConnection, viewState: ViewStateProp): React.ReactNode {
    return <ViewportComponent
      viewState={viewState}
      imodel={iModelConnection}
      controlId={this.controlId}
      viewportRef={(v: ScreenViewport) => {
        this.viewport = v;
        // for convenience, if window defined bind viewport to window
        if (undefined !== window)
          (window as any).viewport = v;
        if (!UiFramework.frontstages.isLoading)
          UiFramework.frontstages.activeFrontstageDef?.setActiveViewFromViewport(v);
      }}
      getViewOverlay={this._getViewOverlay}
    />;
  }

  /** Get the React component that will be shown when no iModel data is available */
  protected getNoContentReactElement(_options: IModelViewportControlOptions): React.ReactNode {
    const noContent = UiFramework.translate("general.no-content");
    return <FillCentered> {noContent} </FillCentered>;
  }

  /** Get the React.Element for a ViewSelector change. */
  public override getReactElementForViewSelectorChange(iModelConnection: IModelConnection, _unusedViewDefinitionId: Id64String, viewState: ViewState, _name: string): React.ReactNode {
    return this.getImodelViewportReactElement(iModelConnection, viewState);
  }

  /** Get the default ViewOverlay unless parameter is set to not use it. May be override in an application specific sub-class  */
  protected _getViewOverlay = (vp: ScreenViewport): React.ReactNode => {
    return <ViewOverlayHost viewport={vp} featureOptions={this._featureOptions} userSuppliedOverlay={this._userSuppliedViewOverlay} data-testid="ViewOverlay" />;
  };

  /** Get the NavigationAidControl associated with this ContentControl */
  public override get navigationAidControl(): string {
    if (this.viewport)
      return super.navigationAidControl;
    else
      return StandardRotationNavigationAidControl.navigationAidId;
  }
}

UiFramework.controls.register(IModelViewportControl.id, IModelViewportControl);
