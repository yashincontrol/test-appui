/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import produce from "immer";
import * as React from "react";
import * as sinon from "sinon";
import { Rectangle } from "@itwin/core-react";
import { fireEvent, render } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import {
  addPanelWidget, addTab, createNineZoneState, DragManager,
  NineZoneDispatch, PanelSide, PanelSideContext, useResizeGrip, WidgetPanelContext, WidgetPanelGrip,
} from "../../appui-layout-react";
import { createDragInfo, TestNineZoneProvider, TestNineZoneProviderProps } from "../Providers";
import { updatePanelState } from "../../appui-layout-react/state/internal/PanelStateHelpers";
import { withWrapperAndProps } from "../Utils";

describe("WidgetPanelGrip", () => {
  const wrapper = (props: any) => <WidgetPanelContext.Provider
    value={{
      getBounds: () => ({
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
      }),
    }}
    {...props}
  />;

  it("should render resizing", () => {
    const { container } = render(
      <TestNineZoneProvider>
        <PanelSideContext.Provider value="left">
          <WidgetPanelGrip />
        </PanelSideContext.Provider>
      </TestNineZoneProvider>,
      { wrapper }
    );
    const grip = container.getElementsByClassName("nz-widgetPanels-grip")[0];
    const handle = grip.getElementsByClassName("nz-handle")[0];
    fireEvent.mouseDown(handle);
    fireEvent.mouseMove(handle);
    container.firstChild!.should.matchSnapshot();
  });

  it("should dispatch PANEL_TOGGLE_COLLAPSED", () => {
    const dispatch = sinon.stub<NineZoneDispatch>();
    let state = createNineZoneState();
    state = addTab(state, "t1");
    state = addPanelWidget(state, "left", "w1", ["t1"]);
    render(
      <TestNineZoneProvider
        defaultState={state}
        dispatch={dispatch}
      >
        <PanelSideContext.Provider value="left">
          <WidgetPanelGrip />
        </PanelSideContext.Provider>
      </TestNineZoneProvider>,
      { wrapper }
    );
    const grip = document.getElementsByClassName("nz-widgetPanels-grip")[0];
    const handle = grip.getElementsByClassName("nz-handle")[0];
    fireEvent.mouseDown(handle);
    fireEvent.mouseUp(handle);
    fireEvent.mouseDown(handle);
    fireEvent.mouseUp(handle);
    dispatch.calledOnceWithExactly(sinon.match({
      type: "PANEL_TOGGLE_COLLAPSED",
      side: "left",
    })).should.true;
  });

  it("should start resize via timer and dispatch PANEL_SET_SIZE", () => {
    const fakeTimers = sinon.useFakeTimers();
    const dispatch = sinon.stub<NineZoneDispatch>();
    let state = createNineZoneState();
    state = updatePanelState(state, "left", { size: 200 });
    state = addTab(state, "t1");
    state = addPanelWidget(state, "left", "w1", ["t1"]);
    render(
      <TestNineZoneProvider
        defaultState={state}
        dispatch={dispatch}
      >
        <PanelSideContext.Provider value="left">
          <WidgetPanelGrip />
        </PanelSideContext.Provider>
      </TestNineZoneProvider>,
      { wrapper }
    );
    const grip = document.getElementsByClassName("nz-widgetPanels-grip")[0];
    const handle = grip.getElementsByClassName("nz-handle")[0];
    fireEvent.mouseDown(handle);
    fakeTimers.tick(300);

    const event = new MouseEvent("mousemove");
    sinon.stub(event, "clientX").get(() => 220);
    fireEvent(document, event);

    dispatch.callCount.should.eq(1);
    sinon.assert.calledOnceWithExactly(dispatch, sinon.match({
      type: "PANEL_SET_SIZE",
      side: "left",
      size: 220,
    }));
  });

  it("should not start resize w/o pointer down", () => {
    let state = createNineZoneState();
    state = addTab(state, "t1");
    state = addPanelWidget(state, "left", "w1", ["t1"]);
    const { container } = render(
      <TestNineZoneProvider
        defaultState={state}
      >
        <PanelSideContext.Provider value="left">
          <WidgetPanelGrip />
        </PanelSideContext.Provider>
      </TestNineZoneProvider>,
      { wrapper }
    );
    const grip = document.getElementsByClassName("nz-widgetPanels-grip")[0];
    const handle = grip.getElementsByClassName("nz-handle")[0];
    fireEvent.pointerMove(handle);
    container.firstChild!.should.matchSnapshot();
  });

  it("should reset initial position on pointer up", () => {
    let state = createNineZoneState();
    state = addTab(state, "t1");
    state = addPanelWidget(state, "left", "w1", ["t1"]);
    const { container } = render(
      <TestNineZoneProvider
        defaultState={state}
      >
        <PanelSideContext.Provider value="left">
          <WidgetPanelGrip />
        </PanelSideContext.Provider>
      </TestNineZoneProvider>,
      { wrapper }
    );
    const grip = document.getElementsByClassName("nz-widgetPanels-grip")[0];
    const handle = grip.getElementsByClassName("nz-handle")[0];
    fireEvent.pointerDown(handle);
    fireEvent.pointerMove(handle);
    fireEvent.pointerUp(handle);
    container.firstChild!.should.matchSnapshot();
  });

  it("should auto-open collapsed unpinned panel", () => {
    const dispatch = sinon.stub<NineZoneDispatch>();
    let state = createNineZoneState();
    state = updatePanelState(state, "left", {
      pinned: false,
      collapsed: true,
    });
    state = addTab(state, "t1");
    state = addPanelWidget(state, "left", "w1", ["t1"]);
    render(
      <TestNineZoneProvider
        defaultState={state}
        dispatch={dispatch}
      >
        <PanelSideContext.Provider value="left">
          <WidgetPanelGrip />
        </PanelSideContext.Provider>
      </TestNineZoneProvider>,
      { wrapper }
    );
    const grip = document.getElementsByClassName("nz-widgetPanels-grip")[0];
    const handle = grip.getElementsByClassName("nz-handle")[0];
    fireEvent.mouseOver(handle);

    sinon.assert.calledOnceWithExactly(dispatch, {
      type: "PANEL_SET_COLLAPSED",
      side: "left",
      collapsed: false,
    });
  });
});

describe("useResizeGrip", () => {
  interface WrapperProps extends TestNineZoneProviderProps {
    children?: React.ReactNode;
    side?: PanelSide;
  }

  function Wrapper(props: WrapperProps) {
    const { children, side, defaultState, ...nzProps } = props;
    const nineZone = defaultState || createNineZoneState();
    return <TestNineZoneProvider // eslint-disable-line react/display-name
      defaultState={nineZone}
      {...nzProps}
    >
      <WidgetPanelContext.Provider value={{ getBounds: () => new Rectangle() }}>
        <PanelSideContext.Provider value={side || "left"}>
          {children}
        </PanelSideContext.Provider>
      </WidgetPanelContext.Provider>
    </TestNineZoneProvider>;
  }
  const wrapper = Wrapper;

  it("should resize top panel", () => {
    const defaultState = produce(createNineZoneState(), (draft) => {
      draft.panels.top.size = 200;
    });
    const dispatch = sinon.stub<NineZoneDispatch>();
    const initialProps: WrapperProps = {
      dispatch,
      defaultState,
      side: "top",
    };
    const { result } = renderHook(() => useResizeGrip(), withWrapperAndProps(Wrapper, initialProps));
    const element = document.createElement("div");
    result.current[0](element);
    fireEvent.mouseDown(element);
    fireEvent.mouseMove(document, { clientY: 210 });
    sinon.assert.calledOnceWithExactly(dispatch, {
      type: "PANEL_SET_SIZE",
      side: "top",
      size: 210,
    });
  });

  it("should resize bottom panel", () => {
    const defaultState = produce(createNineZoneState(), (draft) => {
      draft.panels.bottom.size = 200;
    });
    const dispatch = sinon.stub<NineZoneDispatch>();
    const initialProps: WrapperProps = {
      dispatch,
      defaultState,
      side: "bottom",
    };
    const { result } = renderHook(() => useResizeGrip(), withWrapperAndProps(Wrapper, initialProps));
    const element = document.createElement("div");
    result.current[0](element);
    fireEvent.mouseDown(element);
    fireEvent.mouseMove(document, { clientY: -210 });
    sinon.assert.calledOnceWithExactly(dispatch, {
      type: "PANEL_SET_SIZE",
      side: "bottom",
      size: 210,
    });
  });

  it("should not invoke onResize if ref is unset", () => {
    const dispatch = sinon.stub<NineZoneDispatch>();
    const dragManagerRef = React.createRef<DragManager>();
    const initialProps: WrapperProps = {
      dragManagerRef,
      dispatch,
      side: "bottom",
    };
    renderHook(() => useResizeGrip(), withWrapperAndProps(Wrapper, initialProps));
    dragManagerRef.current?.handleDragStart({
      info: createDragInfo(),
      item: {
        type: "panelGrip",
        id: "bottom",
      },
    });
    dragManagerRef.current?.handleDrag(10, 20);
    dispatch.callCount.should.eq(0);
  });

  it("should set resizing to true when drag starts", () => {
    const { result } = renderHook(() => useResizeGrip(), { wrapper });
    const element = document.createElement("div");
    result.current[0](element);
    fireEvent.mouseDown(element);
    fireEvent.mouseMove(document);
    result.current[1].should.true;
  });

  it("should set resizing to false when drag ends", () => {
    const { result } = renderHook(() => useResizeGrip(), { wrapper });
    const element = document.createElement("div");
    result.current[0](element);
    fireEvent.mouseDown(element);
    fireEvent.mouseMove(document);
    fireEvent.mouseUp(document);
    result.current[1].should.false;
  });

  it("should not start drag in timeout w/o required args", () => {
    const fakeTimers = sinon.useFakeTimers();
    const { result } = renderHook(() => useResizeGrip(), { wrapper });
    const element = document.createElement("div");
    result.current[0](element);
    fireEvent.mouseDown(element);
    result.current[0](null);
    fakeTimers.tick(300);
    result.current[1].should.false;
  });

  it("should not resize if panel size is not set", () => {
    const dispatch = sinon.stub<NineZoneDispatch>();
    const initialProps: WrapperProps = {
      dispatch,
      side: "left",
    };
    const { result } = renderHook(() => useResizeGrip(), withWrapperAndProps(Wrapper, initialProps));
    const element = document.createElement("div");
    result.current[0](element);
    fireEvent.mouseDown(element);
    fireEvent.mouseMove(document, { clientX: 210 });
    sinon.assert.notCalled(dispatch);
  });

  it("should expand collapsed panel", () => {
    const defaultState = produce(createNineZoneState(), (draft) => {
      draft.panels.left.size = 300;
      draft.panels.left.collapsed = true;
    });
    const dispatch = sinon.stub<NineZoneDispatch>();
    const initialProps: WrapperProps = {
      dispatch,
      side: "left",
      defaultState,
    };
    const { result } = renderHook(() => useResizeGrip(), withWrapperAndProps(Wrapper, initialProps));
    const element = document.createElement("div");
    result.current[0](element);
    fireEvent.mouseDown(element);
    fireEvent.mouseMove(document, { clientX: 210 });
    sinon.assert.calledOnceWithExactly(dispatch, {
      type: "PANEL_SET_COLLAPSED",
      side: "left",
      collapsed: false,
    });
  });

  it("should not expand if collapseOffset is not reached", () => {
    const defaultState = produce(createNineZoneState(), (draft) => {
      draft.panels.left.size = 300;
      draft.panels.left.collapsed = true;
    });
    const dispatch = sinon.stub<NineZoneDispatch>();
    const initialProps: WrapperProps = {
      dispatch,
      side: "left",
      defaultState,
    };
    const { result } = renderHook(() => useResizeGrip(), withWrapperAndProps(Wrapper, initialProps));
    const element = document.createElement("div");
    result.current[0](element);
    fireEvent.mouseDown(element);
    fireEvent.mouseMove(document, { clientX: 50 });
    sinon.assert.notCalled(dispatch);
  });

  it("should collapse", () => {
    const defaultState = produce(createNineZoneState(), (draft) => {
      draft.panels.left.size = 200;
    });
    const dispatch = sinon.stub<NineZoneDispatch>();
    const initialProps: WrapperProps = {
      dispatch,
      side: "left",
      defaultState,
    };
    const { result } = renderHook(() => useResizeGrip(), withWrapperAndProps(Wrapper, initialProps));
    const element = document.createElement("div");
    result.current[0](element);
    fireEvent.mouseDown(element, { clientX: 200 });
    fireEvent.mouseMove(document, { clientX: 50 });
    sinon.assert.callCount(dispatch, 2);
    sinon.assert.calledWithExactly(dispatch, {
      type: "PANEL_SET_COLLAPSED",
      side: "left",
      collapsed: true,
    });
    sinon.assert.calledWithExactly(dispatch, {
      type: "PANEL_SET_SIZE",
      side: "left",
      size: 200,
    });
  });

  it("should not resize if drag direction does not match resize direction", () => {
    const defaultState = produce(createNineZoneState(), (draft) => {
      draft.panels.left.size = 300;
    });
    const dispatch = sinon.stub<NineZoneDispatch>();
    const initialProps: WrapperProps = {
      dispatch,
      side: "left",
      defaultState,
    };
    const { result } = renderHook(() => useResizeGrip(), withWrapperAndProps(Wrapper, initialProps));
    const element = document.createElement("div");
    result.current[0](element);
    fireEvent.mouseDown(element);
    fireEvent.mouseMove(document, { clientX: 50 });
    sinon.assert.notCalled(dispatch);
  });
});
