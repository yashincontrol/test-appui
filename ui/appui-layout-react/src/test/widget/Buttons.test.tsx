/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { expect } from "chai";
import { render } from "@testing-library/react";
import {
  addFloatingWidget, addPanelWidget, addTab, createNineZoneState, PanelSideContext,
  TabBarButtons, toolSettingsTabId, WidgetIdContext,
} from "../../appui-layout-react";
import { TestNineZoneProvider } from "../Providers";

describe("TabBarButtons", () => {
  it("should render SendBack button in a floating widget", () => {
    let state = createNineZoneState();
    state = addTab(state, "t1", { label: "t1-label" });
    state = addFloatingWidget(state, "fw1", ["t1"]);
    const wrapper = render(
      <TestNineZoneProvider defaultState={state}>
        <WidgetIdContext.Provider value="fw1">
          <TabBarButtons />
        </WidgetIdContext.Provider>
      </TestNineZoneProvider>
    );
    expect(wrapper.container.querySelector("button.nz-widget-sendBack")).to.not.be.null;
  });

  it("should render Popout button in a floating widget that canPopout ", () => {
    let state = createNineZoneState();
    state = addTab(state, "t1", { label: "t1-label", canPopout: true });
    state = addFloatingWidget(state, "fw1", ["t1"]);
    const wrapper = render(
      <TestNineZoneProvider defaultState={state}>
        <WidgetIdContext.Provider value="fw1">
          <TabBarButtons />
        </WidgetIdContext.Provider>
      </TestNineZoneProvider>
    );
    expect(wrapper.container.querySelector("button.nz-widget-sendBack")).to.not.be.null;
    expect(wrapper.container.querySelector("button.nz-widget-popoutToggle")).to.not.be.null;
  });

  it("should render Dock button in floating ToolSettings", () => {
    let state = createNineZoneState();
    state = addFloatingWidget(state, "fw1", [toolSettingsTabId]);
    const wrapper = render(
      <TestNineZoneProvider defaultState={state}>
        <WidgetIdContext.Provider value="fw1">
          <TabBarButtons />
        </WidgetIdContext.Provider>
      </TestNineZoneProvider>
    );
    expect(wrapper.container.querySelector("button.nz-widget-dock")).to.not.be.null;
  });

  it("should render Pin button in main panel widget", () => {
    let state = createNineZoneState();
    state = addTab(state, "t1", { label: "t1-label", canPopout: false });
    state = addPanelWidget(state, "left", "w1", ["t1"], { activeTabId: "t1" });
    const wrapper = render(
      <TestNineZoneProvider defaultState={state}>
        <PanelSideContext.Provider value="left">
          <WidgetIdContext.Provider value="w1">
            <TabBarButtons />
          </WidgetIdContext.Provider>
        </PanelSideContext.Provider>
      </TestNineZoneProvider>
    );
    expect(wrapper.container.querySelector("button.nz-widget-pinToggle")).to.not.be.null;
  });

  it("should render Popout and Pin buttons in main panel widget that canPopout ", () => {
    let state = createNineZoneState();
    state = addTab(state, "t1", { label: "t1-label", canPopout: true });
    state = addPanelWidget(state, "left", "w1", ["t1"], { activeTabId: "t1" });
    const wrapper = render(
      <TestNineZoneProvider defaultState={state}>
        <PanelSideContext.Provider value="left">
          <WidgetIdContext.Provider value="w1">
            <TabBarButtons />
          </WidgetIdContext.Provider>
        </PanelSideContext.Provider>
      </TestNineZoneProvider>
    );
    expect(wrapper.container.querySelector("button.nz-widget-popoutToggle")).to.not.be.null;
    expect(wrapper.container.querySelector("button.nz-widget-pinToggle")).to.not.be.null;
  });

  it("should render popout button", () => {
    let state = createNineZoneState();
    state = addTab(state, "t1", { label: "t1-label", canPopout: true });
    state = addPanelWidget(state, "left", "w1", ["t1"], { activeTabId: "t1" });
    const wrapper = render(
      <TestNineZoneProvider defaultState={state}>
        <PanelSideContext.Provider value="left">
          <WidgetIdContext.Provider value="w1">
            <TabBarButtons />
          </WidgetIdContext.Provider>
        </PanelSideContext.Provider>
      </TestNineZoneProvider>
    );
    expect(wrapper.container.querySelector("button.nz-widget-popoutToggle")).to.not.be.null;
  });
});
