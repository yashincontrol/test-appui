/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { act, render } from "@testing-library/react";
import { addTab, createNineZoneState, DragManager, PanelSideContext } from "../../appui-layout-react";
import { createDragInfo, TestNineZoneProvider, TestNineZoneProviderProps } from "../Providers";
import { SectionOutline } from "../../appui-layout-react/outline/SectionOutline";
import { expect } from "chai";
import { updatePanelState } from "../../appui-layout-react/state/internal/PanelStateHelpers";

function Wrapper({
  children,
  ...other
}: React.PropsWithChildren<TestNineZoneProviderProps>) {
  return (
    <TestNineZoneProvider
      {...other}
    >
      <PanelSideContext.Provider value="left">
        {children}
      </PanelSideContext.Provider>
    </TestNineZoneProvider>
  );
}

const wrapper = Wrapper;

describe("SectionOutline", () => {
  it("should render", () => {
    const { container } = render(
      <SectionOutline sectionIndex={0} />,
      {
        wrapper,
      }
    );
    container.getElementsByClassName("nz-outline-sectionOutline").length.should.eq(1);
  });

  it("should render visible", () => {
    const dragManager = React.createRef<DragManager>();
    let state = createNineZoneState();
    state = updatePanelState(state, "left", { size: 200, splitterPercent: 40 });
    state = addTab(state, "t1");
    const { container } = render(
      <SectionOutline sectionIndex={0} />,
      {
        wrapper: (props) => <Wrapper defaultState={state} dragManagerRef={dragManager} {...props} />, // eslint-disable-line react/display-name
      }
    );

    act(() => {
      dragManager.current!.handleDragStart({
        info: createDragInfo(),
        item: {
          type: "tab",
          id: "t1",
        },
      });
      dragManager.current!.handleTargetChanged({
        type: "section",
        sectionIndex: 0,
        newWidgetId: "nw1",
        side: "left",
      });
    });

    const element = container.getElementsByClassName("nz-outline-sectionOutline")[0];
    expect(element).to.not.be.undefined;

    (element as HTMLElement).style.height.should.eq("40%");
  });
});
