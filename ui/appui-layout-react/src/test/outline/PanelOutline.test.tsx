/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { act, render } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import * as React from "react";

import {
  addFloatingWidget,
  addTab,
  createNineZoneState,
  DragManager,
  PanelSide,
  PanelSideContext,
  useActiveSendBackWidgetIdStore,
} from "../../appui-layout-react";
import {
  PanelOutline,
  useHidden,
} from "../../appui-layout-react/outline/PanelOutline";
import { updatePanelState } from "../../appui-layout-react/state/internal/PanelStateHelpers";
import {
  createDragStartArgs,
  TestNineZoneProvider,
  TestNineZoneProviderProps,
} from "../Providers";

describe("PanelOutline", () => {
  interface WrapperProps extends TestNineZoneProviderProps {
    side?: PanelSide;
  }

  function Wrapper({
    children,
    side,
    ...other
  }: React.PropsWithChildren<WrapperProps>) {
    side = side ?? "left";
    return (
      <TestNineZoneProvider {...other}>
        <PanelSideContext.Provider value={side}>
          {children}
        </PanelSideContext.Provider>
      </TestNineZoneProvider>
    );
  }

  it("should render", () => {
    const { container } = render(<PanelOutline />, {
      wrapper: Wrapper,
    });
    container
      .getElementsByClassName("nz-outline-panelOutline")
      .length.should.eq(1);
  });

  it("should render spanned horizontal outline", () => {
    let state = createNineZoneState();
    state = updatePanelState(state, "bottom", { span: true });
    const { container } = render(<PanelOutline />, {
      wrapper: (props) => ( // eslint-disable-line react/display-name
        <Wrapper defaultState={state} side="bottom" {...props} />
      ),
    });
    container
      .getElementsByClassName("nz-outline-panelOutline nz-span")
      .length.should.eq(1);
  });
});

describe("useHidden", () => {
  interface WrapperProps extends TestNineZoneProviderProps {
    side?: PanelSide;
  }

  function Wrapper({
    children,
    side,
    ...other
  }: React.PropsWithChildren<WrapperProps>) {
    side = side ?? "left";
    return (
      <TestNineZoneProvider {...other}>
        <PanelSideContext.Provider value={side}>
          {children}
        </PanelSideContext.Provider>
      </TestNineZoneProvider>
    );
  }

  it("should return `true` if target is not a panel", () => {
    const dragManagerRef = React.createRef<DragManager>();
    const { result } = renderHook(() => useHidden(), {
      wrapper: (props) => ( // eslint-disable-line react/display-name
        <Wrapper dragManagerRef={dragManagerRef} {...props} />
      ),
    });
    act(() => {
      dragManagerRef.current?.handleDragStart(createDragStartArgs());
      dragManagerRef.current?.handleTargetChanged({
        type: "window",
      });
    });
    result.current.should.true;
  });

  it("should return `true` if target is not a current panel", () => {
    const dragManagerRef = React.createRef<DragManager>();
    const { result } = renderHook(() => useHidden(), {
      wrapper: (props) => ( // eslint-disable-line react/display-name
        <Wrapper dragManagerRef={dragManagerRef} {...props} />
      ),
    });
    act(() => {
      dragManagerRef.current?.handleDragStart(createDragStartArgs());
      dragManagerRef.current?.handleTargetChanged({
        type: "panel",
        side: "right",
        newWidgetId: "",
      });
    });
    result.current.should.true;
  });

  it("should return `false` if target is a current panel", () => {
    const dragManagerRef = React.createRef<DragManager>();
    const { result } = renderHook(() => useHidden(), {
      wrapper: (props) => ( // eslint-disable-line react/display-name
        <Wrapper dragManagerRef={dragManagerRef} {...props} />
      ),
    });
    act(() => {
      dragManagerRef.current?.handleDragStart(createDragStartArgs());
      dragManagerRef.current?.handleTargetChanged({
        type: "panel",
        side: "left",
        newWidgetId: "",
      });
    });
    result.current.should.false;
  });

  it("should return `false` if sendBackHome state points to a current panel", () => {
    let state = createNineZoneState();
    state = addTab(state, "t1");
    state = addFloatingWidget(state, "w1", ["t1"], {
      home: {
        widgetIndex: 0,
        widgetId: undefined,
        side: "left",
      },
    });

    useActiveSendBackWidgetIdStore.setState("w1");
    const { result } = renderHook(() => useHidden(), {
      wrapper: (props) => <Wrapper defaultState={state} {...props} />, // eslint-disable-line react/display-name
    });

    result.current.should.false;
  });

  it("should return `true` if sendBackHome state points to a different panel", () => {
    let state = createNineZoneState();
    state = addTab(state, "t1");
    state = addFloatingWidget(state, "w1", ["t1"], {
      home: {
        widgetIndex: 0,
        widgetId: undefined,
        side: "right",
      },
    });

    useActiveSendBackWidgetIdStore.setState("w1");
    const { result } = renderHook(() => useHidden(), {
      wrapper: (props) => <Wrapper defaultState={state} {...props} />, // eslint-disable-line react/display-name
    });

    result.current.should.true;
  });
});
