/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import * as moq from "typemoq";
import * as sinon from "sinon";
import { BeEvent } from "@itwin/core-bentley";
import { IModelApp, MockRender, ScreenViewport, Viewport } from "@itwin/core-frontend";
import { TileLoadingIndicator } from "../../../appui-react";
import TestUtils from "../../TestUtils";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { expect } from "chai";

describe("TileLoadingIndicator", () => {

  before(async () => {
    await TestUtils.initializeUiFramework();
    await MockRender.App.startup();
  });

  after(async () => {
    await MockRender.App.shutdown();
    TestUtils.terminateUiFramework();
  });

  it("should render correctly as footer by default", () => {
    const wrapper = render(<TileLoadingIndicator />);

    expect(wrapper.container.querySelector(".uifw-tile-loading-bar")).to.exist;
    cleanup();
  });

  it("should unmount correctly", () => {
    const spy = sinon.spy();
    const viewOpenSpy = sinon.stub(IModelApp.viewManager.onViewOpen, "addListener").returns(spy);

    const { unmount } = render(<TileLoadingIndicator />);
    expect(viewOpenSpy).to.have.been.called;

    unmount();
    expect(spy).to.have.been.called;
  });

  it("50% then 100% complete", async () => {
    // numReadyTiles / (numReadyTiles + numRequestedTiles)
    const onRenderEvent = new BeEvent<(vp: Viewport) => void>();
    const viewportMock = moq.Mock.ofType<ScreenViewport>();

    // added because component registers interest in onRender events
    viewportMock.setup((x) => x.onRender).returns(() => onRenderEvent);

    await IModelApp.viewManager.setSelectedView(viewportMock.object);
    render(<TileLoadingIndicator />);
    IModelApp.viewManager.onViewOpen.emit(viewportMock.object);
    // 10% complete
    viewportMock.setup((viewport) => viewport.numRequestedTiles).returns(() => 90);
    viewportMock.setup((viewport) => viewport.numReadyTiles).returns(() => 10);
    onRenderEvent.raiseEvent(viewportMock.object);
    await waitFor( () => expect(screen.getByText("10 / 100")).to.exist);

    // 50% complete
    viewportMock.setup((viewport) => viewport.numRequestedTiles).returns(() => 250);
    viewportMock.setup((viewport) => viewport.numReadyTiles).returns(() => 250);
    onRenderEvent.raiseEvent(viewportMock.object);
    await waitFor( () => expect(screen.getByText("250 / 500")).to.exist);

    // 100% complete
    viewportMock.setup((viewport) => viewport.numRequestedTiles).returns(() => 0);
    viewportMock.setup((viewport) => viewport.numReadyTiles).returns(() => 0);
    onRenderEvent.raiseEvent(viewportMock.object);
    await waitFor( () => expect(screen.getByText("0 / 0")).to.exist);

  });
});
