/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as sinon from "sinon";
import { act, fireEvent } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import { usePointerCaptor } from "../../appui-layout-react";
import { DragManagerProvider } from "../Providers";

describe("usePointerCaptor", () => {
  const wrapper = DragManagerProvider;

  it("should call onPointerDown", () => {
    const spy = sinon.stub<NonNullable<Parameters<typeof usePointerCaptor>[0]>>();
    const { result } = renderHook(() => usePointerCaptor(spy));
    const element = document.createElement("div");
    act(() => {
      result.current(element);
    });

    fireEvent.mouseDown(element);

    spy.calledOnce.should.true;
  });

  it("should call onPointerMove", () => {
    const spy = sinon.stub<NonNullable<Parameters<typeof usePointerCaptor>[1]>>();
    const { result } = renderHook(() => usePointerCaptor(undefined, spy));
    const element = document.createElement("div");
    act(() => {
      result.current(element);
    });

    fireEvent.mouseDown(element);
    fireEvent.mouseMove(document);

    spy.calledOnce.should.true;
  });

  it("should call onPointerUp", () => {
    const spy = sinon.stub<NonNullable<Parameters<typeof usePointerCaptor>[2]>>();
    const { result } = renderHook(() => usePointerCaptor(undefined, undefined, spy));
    const element = document.createElement("div");
    act(() => {
      result.current(element);
    });

    fireEvent.mouseDown(element);
    fireEvent.mouseUp(document);

    spy.calledOnce.should.true;
  });

  it("should call onPointerDown for touchstart", () => {
    const spy = sinon.stub<NonNullable<Parameters<typeof usePointerCaptor>[0]>>();
    const { result } = renderHook(() => usePointerCaptor(spy), { wrapper });
    const element = document.createElement("div");
    act(() => {
      result.current(element);
      fireEvent.touchStart(element, {
        touches: [{}],
      });
    });

    spy.calledOnce.should.true;
  });

  it("should call onPointerMove for touchmove", () => {
    const spy = sinon.stub<NonNullable<Parameters<typeof usePointerCaptor>[1]>>();
    const { result } = renderHook(() => usePointerCaptor(undefined, spy), { wrapper });
    const element = document.createElement("div");
    act(() => {
      result.current(element);
      fireEvent.touchStart(element, {
        touches: [{}],
      });
      fireEvent.touchMove(element, {
        touches: [{}],
      });
    });

    spy.calledOnce.should.true;
  });

  it("should call onPointerUp for touchend", () => {
    const spy = sinon.stub<NonNullable<Parameters<typeof usePointerCaptor>[2]>>();
    const { result } = renderHook(() => usePointerCaptor(undefined, undefined, spy), { wrapper });
    const element = document.createElement("div");
    act(() => {
      result.current(element);
      fireEvent.touchStart(element, {
        touches: [{}],
      });
      fireEvent.touchEnd(element, {
        touches: [{}],
      });
    });
    spy.calledOnce.should.true;

    act(() => {
      result.current(null);
    });
  });

  it("should not call onPointerDown when touches.length !== 1", () => {
    const spy = sinon.stub<NonNullable<Parameters<typeof usePointerCaptor>[0]>>();
    const { result } = renderHook(() => usePointerCaptor(spy));
    const element = document.createElement("div");
    act(() => {
      result.current(element);
      fireEvent.touchStart(element, {
        touches: [],
      });
    });

    spy.notCalled.should.true;
  });

  it("should not call onPointerMove when touches.length !== 1", () => {
    const spy = sinon.stub<NonNullable<Parameters<typeof usePointerCaptor>[1]>>();
    const { result } = renderHook(() => usePointerCaptor(undefined, spy), { wrapper });
    const element = document.createElement("div");
    act(() => {
      result.current(element);
      fireEvent.touchStart(element, {
        touches: [{}],
      });
      fireEvent.touchMove(element, {
        touches: [],
      });
    });

    spy.notCalled.should.true;
  });

  it("should not add target touch listeners", () => {
    const { result } = renderHook(() => usePointerCaptor(), { wrapper });
    const element = document.createElement("div");

    act(() => {
      result.current(element);
    });

    const spy = sinon.spy(HTMLElement.prototype, "addEventListener");
    act(() => {
      const touchStart = new TouchEvent("touchstart");
      sinon.stub(touchStart, "target").get(() => ({}));
      sinon.stub(touchStart, "touches").get(() => [{}]);
      element.dispatchEvent(touchStart);
    });

    spy.notCalled.should.true;
  });

  it("should not remove target touch listeners", () => {
    const { result } = renderHook(() => usePointerCaptor(), { wrapper });
    const element = document.createElement("div");

    act(() => {
      result.current(element);
      fireEvent.touchStart(element, {
        touches: [{}],
      });
    });

    const spy = sinon.spy(HTMLElement.prototype, "removeEventListener");
    act(() => {
      const touchEnd = new TouchEvent("touchend");
      sinon.stub(touchEnd, "target").get(() => ({}));
      sinon.stub(touchEnd, "touches").get(() => [{}]);
      element.dispatchEvent(touchEnd);
    });

    spy.notCalled.should.true;
  });

  it("should call onPointerMove for document touchmove", () => {
    const spy = sinon.stub<NonNullable<Parameters<typeof usePointerCaptor>[1]>>();
    const { result } = renderHook(() => usePointerCaptor(undefined, spy), { wrapper });
    const element = document.createElement("div");
    act(() => {
      result.current(element);

      fireEvent.touchStart(element, {
        touches: [{}],
      });

      fireEvent.touchMove(document, {
        touches: [{}],
      });
    });

    spy.calledOnce.should.true;
  });

  it("should not handle document touchmove if it was dispatched for touch target", () => {
    const spy = sinon.stub<NonNullable<Parameters<typeof usePointerCaptor>[1]>>();
    const { result } = renderHook(() => usePointerCaptor(undefined, spy), { wrapper });
    const element = document.createElement("div");
    act(() => {
      result.current(element);

      fireEvent.touchStart(element, {
        touches: [{}],
      });

      const touchEnd = new TouchEvent("touchmove");
      sinon.stub(touchEnd, "target").get(() => element);
      sinon.stub(touchEnd, "touches").get(() => [{}]);
      document.dispatchEvent(touchEnd);
    });

    spy.notCalled.should.true;
  });

  it("should not handle document touchend if it was dispatched for touch target", () => {
    const spy = sinon.stub<NonNullable<Parameters<typeof usePointerCaptor>[1]>>();
    const { result } = renderHook(() => usePointerCaptor(undefined, spy), { wrapper });
    const element = document.createElement("div");
    act(() => {
      result.current(element);

      fireEvent.touchStart(element, {
        touches: [{}],
      });

      const touchEnd = new TouchEvent("touchend");
      sinon.stub(touchEnd, "target").get(() => element);
      sinon.stub(touchEnd, "touches").get(() => [{}]);
      document.dispatchEvent(touchEnd);
    });

    spy.notCalled.should.true;
  });
});
