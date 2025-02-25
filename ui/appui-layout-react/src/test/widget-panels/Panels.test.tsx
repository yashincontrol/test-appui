/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { render } from "@testing-library/react";
import { addPanelWidget, addTab, createNineZoneState, WidgetPanels } from "../../appui-layout-react";
import { TestNineZoneProvider } from "../Providers";

describe("WidgetPanels", () => {
  it("should render", () => {
    const { container } = render(
      <TestNineZoneProvider>
        <WidgetPanels />
      </TestNineZoneProvider>,
    );
    container.firstChild!.should.matchSnapshot();
  });

  it("should render widget content", () => {
    let state = createNineZoneState();
    state = addTab(state, "t1");
    state = addPanelWidget(state, "left", "w1", ["t1"]);
    const { container } = render(
      <TestNineZoneProvider
        defaultState={state}
        widgetContent={<div>Hello World!</div>}
      >
        <WidgetPanels />
      </TestNineZoneProvider>,
    );
    container.firstChild!.should.matchSnapshot();
  });
});
