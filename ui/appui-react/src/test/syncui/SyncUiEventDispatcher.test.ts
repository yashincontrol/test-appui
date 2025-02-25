/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { expect } from "chai";
import * as sinon from "sinon";
import * as moq from "typemoq";
import { UiSyncEventArgs } from "@itwin/appui-abstract";
import { IModelRpcProps } from "@itwin/core-common";
import { IModelApp, IModelConnection, MockRender, ScreenViewport, SelectionSet } from "@itwin/core-frontend";
import {
  ActiveContentChangedEventArgs,
  ContentControlActivatedEventArgs, ContentLayoutActivatedEventArgs, FrontstageActivatedEventArgs, FrontstageReadyEventArgs, ModalFrontstageChangedEventArgs, NavigationAidActivatedEventArgs, SyncUiEventDispatcher,
  ToolActivatedEventArgs,
  UiFramework, WidgetStateChangedEventArgs,
} from "../../appui-react";
import TestUtils from "../TestUtils";
/* eslint-disable deprecation/deprecation */

const timeToWaitForUiSyncCallback = 60;

describe("SyncUiEventDispatcher", () => {
  before(async () => {
    await TestUtils.initializeUiFramework();
  });

  after(() => {
    TestUtils.terminateUiFramework();
  });

  beforeEach(() => {
    SyncUiEventDispatcher.setTimeoutPeriod(2);
  });

  it("test hasEventOfInterest", () => {
    const eventIds = new Set<string>();
    eventIds.add("dog");
    eventIds.add("cat");
    eventIds.add("rabbit");

    expect(SyncUiEventDispatcher.hasEventOfInterest(eventIds, ["dog", "cat", "rabbit"])).to.be.true;
    expect(SyncUiEventDispatcher.hasEventOfInterest(eventIds, ["dog", "cat"])).to.be.true;
    expect(SyncUiEventDispatcher.hasEventOfInterest(eventIds, ["dog"])).to.be.true;
    expect(SyncUiEventDispatcher.hasEventOfInterest(eventIds, ["cat", "rabbit"])).to.be.true;
    expect(SyncUiEventDispatcher.hasEventOfInterest(eventIds, ["rabbit"])).to.be.true;
    // idsOfInterest are now case insensitive - the set of eventIds held by the dispacther are in lower case.
    expect(SyncUiEventDispatcher.hasEventOfInterest(eventIds, ["Rabbit"])).to.be.true;
    expect(SyncUiEventDispatcher.hasEventOfInterest(eventIds, ["DOG", "cAT", "Rabbit"])).to.be.true;
    expect(SyncUiEventDispatcher.hasEventOfInterest(eventIds, ["horse"])).to.be.false;

    const dummyImodelId = "dummy";
    UiFramework.setActiveIModelId(dummyImodelId);
    expect(UiFramework.getActiveIModelId()).to.be.equal(dummyImodelId);
  });

  it("test immediate sync event", () => {
    let callbackCalled = false;
    let callbackHasExpectedEventId = false;

    const handleSyncUiEvent = (args: UiSyncEventArgs): void => {
      callbackCalled = true;
      callbackHasExpectedEventId = args.eventIds.has("event1");
    };

    SyncUiEventDispatcher.onSyncUiEvent.addListener(handleSyncUiEvent);

    SyncUiEventDispatcher.dispatchImmediateSyncUiEvent("Event1");
    expect(callbackCalled).to.be.true;
    expect(callbackHasExpectedEventId).to.be.true;
    SyncUiEventDispatcher.onSyncUiEvent.removeListener(handleSyncUiEvent);
  });

  it("test timed sync event", () => {
    const fakeTimers = sinon.useFakeTimers();
    let callback1Called = false;
    let callback1HasExpectedEventId = false;

    const handleSyncUiEvent1 = (args: UiSyncEventArgs): void => {
      callback1Called = true;
      callback1HasExpectedEventId = args.eventIds.has("event1");
    };

    SyncUiEventDispatcher.onSyncUiEvent.addListener(handleSyncUiEvent1);
    SyncUiEventDispatcher.dispatchSyncUiEvent("Event1");
    expect(callback1Called).to.be.false;

    fakeTimers.tick(timeToWaitForUiSyncCallback);
    fakeTimers.restore();

    expect(callback1Called).to.be.true;
    expect(callback1HasExpectedEventId).to.be.true;
    SyncUiEventDispatcher.onSyncUiEvent.removeListener(handleSyncUiEvent1);
  });

  it("test multiple event Id with a timed sync event", () => {
    const fakeTimers = sinon.useFakeTimers();
    let callbackCalled = false;
    let callbackHasExpectedEventIds = false;

    const handleSyncUiEvent = (args: UiSyncEventArgs): void => {
      callbackCalled = true;
      callbackHasExpectedEventIds = args.eventIds.has("event1") && args.eventIds.has("event2");
    };

    SyncUiEventDispatcher.onSyncUiEvent.addListener(handleSyncUiEvent);

    SyncUiEventDispatcher.dispatchSyncUiEvents(["Event1", "Event2"]);
    expect(callbackCalled).to.be.false;

    fakeTimers.tick(timeToWaitForUiSyncCallback);
    fakeTimers.restore();

    expect(callbackCalled).to.be.true;
    expect(callbackHasExpectedEventIds).to.be.true;
    SyncUiEventDispatcher.onSyncUiEvent.removeListener(handleSyncUiEvent);
  });

  it("test multiple event Id with a multiple dispatches", () => {
    const fakeTimers = sinon.useFakeTimers();
    let callbackCalled = false;
    let callbackHasExpectedEventIds = false;

    const handleSyncUiEvent = (args: UiSyncEventArgs): void => {
      callbackCalled = true;
      callbackHasExpectedEventIds = args.eventIds.has("event1") && args.eventIds.has("event2") && args.eventIds.has("event3");
    };

    SyncUiEventDispatcher.onSyncUiEvent.addListener(handleSyncUiEvent);

    SyncUiEventDispatcher.dispatchSyncUiEvents(["Event1", "Event2"]);
    expect(callbackCalled).to.be.false;
    SyncUiEventDispatcher.dispatchSyncUiEvent("Event3");
    expect(callbackCalled).to.be.false;

    fakeTimers.runAll();
    fakeTimers.restore();

    expect(callbackCalled).to.be.true;
    expect(callbackHasExpectedEventIds).to.be.true;
    SyncUiEventDispatcher.onSyncUiEvent.removeListener(handleSyncUiEvent);
  });

  it("Test event handlers", () => {
    const fakeTimers = sinon.useFakeTimers();
    const handleSyncUiEvent = sinon.spy();

    SyncUiEventDispatcher.initialize();
    SyncUiEventDispatcher.onSyncUiEvent.addListener(handleSyncUiEvent);

    handleSyncUiEvent.resetHistory();
    UiFramework.frontstages.onContentControlActivatedEvent.emit({} as ContentControlActivatedEventArgs);
    fakeTimers.runAll();
    expect(handleSyncUiEvent.calledOnce).to.be.true;

    handleSyncUiEvent.resetHistory();
    UiFramework.frontstages.onContentLayoutActivatedEvent.emit({} as ContentLayoutActivatedEventArgs);
    fakeTimers.runAll();
    expect(handleSyncUiEvent.calledOnce).to.be.true;

    handleSyncUiEvent.resetHistory();
    UiFramework.frontstages.onFrontstageActivatedEvent.emit({} as FrontstageActivatedEventArgs);
    fakeTimers.runAll();
    expect(handleSyncUiEvent.calledOnce).to.be.true;

    handleSyncUiEvent.resetHistory();
    UiFramework.frontstages.onFrontstageReadyEvent.emit({} as FrontstageReadyEventArgs);
    fakeTimers.runAll();
    expect(handleSyncUiEvent.calledOnce).to.be.true;

    handleSyncUiEvent.resetHistory();
    UiFramework.frontstages.onModalFrontstageChangedEvent.emit({} as ModalFrontstageChangedEventArgs);
    fakeTimers.runAll();
    expect(handleSyncUiEvent.calledOnce).to.be.true;

    handleSyncUiEvent.resetHistory();
    UiFramework.frontstages.onNavigationAidActivatedEvent.emit({} as NavigationAidActivatedEventArgs);
    fakeTimers.runAll();
    expect(handleSyncUiEvent.calledOnce).to.be.true;

    handleSyncUiEvent.resetHistory();
    UiFramework.frontstages.onToolActivatedEvent.emit({} as ToolActivatedEventArgs);
    fakeTimers.runAll();
    expect(handleSyncUiEvent.calledOnce).to.be.true;

    handleSyncUiEvent.resetHistory();
    UiFramework.frontstages.onWidgetStateChangedEvent.emit({} as WidgetStateChangedEventArgs);
    fakeTimers.runAll();
    expect(handleSyncUiEvent.calledOnce).to.be.true;

    handleSyncUiEvent.resetHistory();
    UiFramework.backstage.open();
    fakeTimers.runAll();
    expect(handleSyncUiEvent.calledOnce).to.be.true;

    handleSyncUiEvent.resetHistory();
    UiFramework.content.onActiveContentChangedEvent.emit({} as ActiveContentChangedEventArgs);
    fakeTimers.runAll();
    fakeTimers.restore();
    expect(handleSyncUiEvent.calledOnce).to.be.true;

    SyncUiEventDispatcher.onSyncUiEvent.removeListener(handleSyncUiEvent);
  });

  describe("ConnectionEvents", () => {
    const imodelToken: IModelRpcProps = { key: "" };
    const imodelMock = moq.Mock.ofType<IModelConnection>();
    let ss: SelectionSet;

    beforeEach(() => {
      imodelMock.reset();
      imodelMock.setup((x) => x.getRpcProps()).returns(() => imodelToken);

      ss = new SelectionSet(imodelMock.object);
      imodelMock.setup((x) => x.selectionSet).returns(() => ss);
    });
  });

  describe("SelectedViewportChanged", () => {
    before(async () => {
      await TestUtils.initializeUiFramework();
      await MockRender.App.startup();
      SyncUiEventDispatcher.initialize();
    });

    after(async () => {
      await MockRender.App.shutdown();
      TestUtils.terminateUiFramework();
    });

    it("handles onSelectedViewportChanged", () => {
      IModelApp.viewManager.onSelectedViewportChanged.raiseEvent({});
    });

    it("handles onSelectedViewportChanged with previous", () => {
      const viewportMock = moq.Mock.ofType<ScreenViewport>();
      IModelApp.viewManager.onSelectedViewportChanged.raiseEvent({ previous: viewportMock.object });
    });
  });
});
