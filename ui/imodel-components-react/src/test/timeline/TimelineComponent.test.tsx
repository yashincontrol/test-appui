/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { expect } from "chai";
import React from "react";
import * as sinon from "sinon";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { UiAdmin } from "@itwin/appui-abstract";
import { BaseTimelineDataProvider } from "../../imodel-components-react/timeline/BaseTimelineDataProvider";
import { PlaybackSettings, TimelinePausePlayAction, TimelinePausePlayArgs } from "../../imodel-components-react/timeline/interfaces";
import { TimelineComponent, TimelineMenuItemProps } from "../../imodel-components-react/timeline/TimelineComponent";
import { TestUtils } from "../TestUtils";
import { MockRender } from "@itwin/core-frontend";
import userEvent from "@testing-library/user-event";

class TestTimelineDataProvider extends BaseTimelineDataProvider {
  public playing = false;
  public pointerCallbackCalled = false;
  public settingsCallbackCalled = false;
  public forwardCallbackCalled = false;
  public backwardCallbackCalled = false;

  public override onAnimationFractionChanged = (animationFraction: number) => {
    this.pointerCallbackCalled = true;
    this.animationFraction = animationFraction;
  };

  public onJump = (forward: boolean) => {
    this.forwardCallbackCalled = forward;
    this.backwardCallbackCalled = !forward;
  };

  public override onPlaybackSettingChanged = (settings: PlaybackSettings) => {
    this.settingsCallbackCalled = true;
    this.updateSettings(settings);
  };

  public onPlayPause = (playing: boolean) => {
    this.playing = playing;
  };

  constructor() {
    super();

    this.animationFraction = 0.3;
    const duration = 20 * 1000;
    const loop = false;
    const startDate = new Date(2014, 6, 6);
    const endDate = new Date(2016, 8, 12);

    this.updateSettings({
      duration,
      loop,
    });

    this.start = startDate;
    this.end = endDate;
  }
}

function TestRepeatTimelineComponent() {
  const duration = 20 * 1000;
  const startDate = new Date(2014, 6, 6);
  const endDate = new Date(2016, 8, 12);
  const [loop, setLoop] = React.useState<boolean>(false);

  const handleOnSettingsChange = (settings: PlaybackSettings) => {
    if (settings.loop !== undefined) {
      setLoop(settings.loop);
    }
  };

  return (
    <div>
      <TimelineComponent
        startDate={startDate}
        endDate={endDate}
        initialDuration={0}
        totalDuration={duration}
        minimized={true}
        showDuration={true}
        alwaysMinimized={true}
        repeat={loop}
        onSettingsChange={handleOnSettingsChange}
        componentId={"testApp-testRepeatTimeline"} // qualify id with "<appName>-" to ensure uniqueness
      />
    </div>
  );
}

describe("<TimelineComponent showDuration={true} />", () => {
  let theUserTo: ReturnType<typeof userEvent.setup>;
  beforeEach(()=>{
    theUserTo = userEvent.setup();
  }); let fakeTimers: sinon.SinonFakeTimers | undefined;
  const rafSpy = sinon.spy((cb: FrameRequestCallback) => {
    return window.setTimeout(cb, 0);
  });

  const getBoundingClientRect = Element.prototype.getBoundingClientRect;
  const sliderContainerSize = DOMRect.fromRect({ x: 10, width: 1000, height: 60 });

  before(async () => {
    Element.prototype.getBoundingClientRect = () => sliderContainerSize;

    if (!window.PointerEvent)
      window.PointerEvent = window.MouseEvent as any;
    sinon.restore();
    // need to initialize to get localized strings
    await TestUtils.initializeUiIModelComponents();
    await MockRender.App.startup();

    // JSDom used in testing does not provide implementations for requestAnimationFrame/cancelAnimationFrame so add dummy ones here.
    window.requestAnimationFrame = rafSpy;
    window.cancelAnimationFrame = () => { };
  });

  afterEach(() => {
    fakeTimers && fakeTimers.restore();

    rafSpy.resetHistory();
  });

  after(async () => {
    sinon.restore();
    Element.prototype.getBoundingClientRect = getBoundingClientRect;
    await MockRender.App.shutdown();

    TestUtils.terminateUiIModelComponents();
  });

  it("should render without milestones - minimized", async () => {
    const dataProvider = new TestTimelineDataProvider();
    expect(dataProvider.loop).to.be.false;
    fakeTimers = sinon.useFakeTimers();

    const renderedComponent = render(<TimelineComponent
      startDate={dataProvider.start}
      endDate={dataProvider.end}
      initialDuration={dataProvider.initialDuration}
      totalDuration={dataProvider.duration}
      minimized={true}
      showDuration={true}
      onChange={dataProvider.onAnimationFractionChanged}
      onSettingsChange={dataProvider.onPlaybackSettingChanged}
      onPlayPause={dataProvider.onPlayPause} />);

    expect(renderedComponent).not.to.be.undefined;
    // renderedComponent.debug();

    // hit play/pause button to start animation
    const playButton = renderedComponent.getAllByTestId("play-button")[0];
    expect(dataProvider.playing).to.be.false;
    expect(dataProvider.pointerCallbackCalled).to.be.false;

    fireEvent.click(playButton);
    // Wait for animation.
    fakeTimers.tick(600);
    // Wait for 1st raf cb.
    fakeTimers.tick(1);

    // kill some time to wait for setState and subsequent call to window.requestAnimationFrame to process
    // await new Promise((r) => { setTimeout(r, 40); });
    expect(dataProvider.playing).to.be.true;

    // hit play/pause button to pause animation
    fireEvent.click(playButton);
    // Wait for animation.
    fakeTimers.tick(600);
    // Wait for 1st raf cb.
    fakeTimers.tick(1);

    // kill some time to wait for setState and subsequent call to window.requestAnimationFrame to process
    // await new Promise((r) => { setTimeout(r, 40); });
    expect(dataProvider.playing).to.be.false;
    expect(dataProvider.pointerCallbackCalled).to.be.true;
  });

  it("should show tooltip on pointer move", async () => {
    const spyOnChange = sinon.spy();
    const dataProvider = new TestTimelineDataProvider();
    expect(dataProvider.loop).to.be.false;
    fakeTimers = sinon.useFakeTimers({shouldAdvanceTime: true});

    const renderedComponent = render(<TimelineComponent
      startDate={dataProvider.start}
      endDate={dataProvider.end}
      initialDuration={10 * 1000}
      totalDuration={40 * 1000}
      minimized={true}
      showDuration={true}
      onChange={spyOnChange}
      onSettingsChange={dataProvider.onPlaybackSettingChanged}
      onPlayPause={dataProvider.onPlayPause} />);

    expect(renderedComponent).not.to.be.undefined;
    expect(renderedComponent.container.querySelector(".tooltip-text")).not.to.exist;
    const thumb = renderedComponent.container.querySelector(".iui-slider-thumb");
    expect(thumb).to.exist;
    fireEvent.focus(thumb!, {});
    expect(renderedComponent.container.querySelector(".tooltip-text")).to.exist;
    fireEvent.blur(thumb!, {});
    expect(renderedComponent.container.querySelector(".tooltip-text")).not.to.exist;
    const sliderContainer = renderedComponent.container.querySelector(".iui-slider-container");
    expect(sliderContainer).to.exist;

    await theUserTo.pointer([
      { target: thumb!, coords: { x: 210, clientX: 210, y: 0, clientY: 0}, keys: "[MouseLeft>]"},
      { coords: { x: 410, clientX: 410, y: 0, clientY: 0 }},
      { keys: "[/MouseLeft]" },
    ]);
  });

  it("timeline with short duration", async () => {
    const dataProvider = new TestTimelineDataProvider();
    dataProvider.getSettings().duration = 2;  // make sure this is shorter than 40 so we get to end of animation

    fakeTimers = sinon.useFakeTimers();

    const renderedComponent = render(<TimelineComponent
      startDate={dataProvider.start}
      endDate={dataProvider.end}
      initialDuration={dataProvider.initialDuration}
      totalDuration={dataProvider.duration}
      minimized={true}
      showDuration={true}
      onChange={dataProvider.onAnimationFractionChanged}
      onJump={dataProvider.onJump}
      onPlayPause={dataProvider.onPlayPause} />);

    // hit play/pause button to start animation
    const playButtons = renderedComponent.getAllByTestId("play-button");
    const playButton = playButtons[0];
    expect(dataProvider.playing).to.be.false;
    expect(dataProvider.pointerCallbackCalled).to.be.false;

    fireEvent.click(playButton);
    expect(dataProvider.playing).to.be.true;

    // Wait for animation.
    fakeTimers.tick(1);
    fakeTimers.setSystemTime(600);
    fakeTimers.tick(1);

    // kill some time to wait for setState and subsequent call to window.requestAnimationFrame to process
    // await new Promise((r) => { setTimeout(r, 40); });
    expect(dataProvider.playing).to.be.false;
  });

  it("timeline with short duration (repeat animation loop) - expanded", async () => {
    const dataProvider = new TestTimelineDataProvider();
    dataProvider.getSettings().duration = 30;  // make sure this is shorter than 40 so we get to end of animation
    dataProvider.getSettings().loop = true;
    fakeTimers = sinon.useFakeTimers();

    const renderedComponent = render(<TimelineComponent
      startDate={dataProvider.start}
      endDate={dataProvider.end}
      initialDuration={dataProvider.initialDuration}
      totalDuration={dataProvider.duration}
      minimized={true}
      showDuration={true}
      onChange={dataProvider.onAnimationFractionChanged}
      onJump={dataProvider.onJump}
      repeat={dataProvider.getSettings().loop}
      onPlayPause={dataProvider.onPlayPause} />);

    // hit play/pause button to start animation
    const playButtons = renderedComponent.getAllByTestId("play-button");
    const playButton = playButtons[0];
    expect(dataProvider.playing).to.be.false;
    expect(dataProvider.pointerCallbackCalled).to.be.false;

    fireEvent.click(playButton);
    expect(dataProvider.playing).to.be.true;

    // Wait for animation.
    fakeTimers.tick(600);
    // Wait for 1st raf cb.
    fakeTimers.tick(1);

    // kill some time to wait for setState and subsequent call to window.requestAnimationFrame to process
    // await new Promise((r) => { setTimeout(r, 40); });
    expect(dataProvider.playing).to.be.true;

    fireEvent.click(playButton);
    expect(dataProvider.playing).to.be.false;
  });

  it("timeline with short duration (repeat set and at end of animation loop) - expanded", async () => {
    const dataProvider = new TestTimelineDataProvider();
    dataProvider.getSettings().duration = 30;  // make sure this is shorter than 40 so we get to end of animation
    dataProvider.getSettings().loop = true;
    dataProvider.animationFraction = 1.0;
    fakeTimers = sinon.useFakeTimers();

    const renderedComponent = render(<TimelineComponent
      startDate={dataProvider.start}
      endDate={dataProvider.end}
      initialDuration={dataProvider.initialDuration}
      totalDuration={dataProvider.duration}
      minimized={true}
      showDuration={true}
      onChange={dataProvider.onAnimationFractionChanged}
      onJump={dataProvider.onJump}
      repeat={dataProvider.getSettings().loop}
      onPlayPause={dataProvider.onPlayPause} />);

    // hit play/pause button to start animation
    const playButton = renderedComponent.getAllByTestId("play-button")[0];
    expect(dataProvider.playing).to.be.false;
    expect(dataProvider.pointerCallbackCalled).to.be.false;

    fireEvent.click(playButton);
    expect(dataProvider.playing).to.be.true;

    // Wait for animation.
    fakeTimers.tick(600);
    // Wait for 1st raf cb.
    fakeTimers.tick(1);

    // kill some time to wait for setState and subsequent call to window.requestAnimationFrame to process
    // await new Promise((r) => { setTimeout(r, 40); });
    expect(dataProvider.playing).to.be.true;

    fireEvent.click(playButton);
    expect(dataProvider.playing).to.be.false;
  });

  it("timeline with no dates (Analysis animation", async () => {
    const dataProvider = new TestTimelineDataProvider();
    dataProvider.getSettings().duration = 30;  // make sure this is shorter than the timeout of 40 so we get to end of animation
    fakeTimers = sinon.useFakeTimers();

    const renderedComponent = render(<TimelineComponent
      initialDuration={dataProvider.initialDuration}
      totalDuration={dataProvider.duration}
      minimized={true}
      showDuration={true}
      onChange={dataProvider.onAnimationFractionChanged}
      onJump={dataProvider.onJump}
      onPlayPause={dataProvider.onPlayPause} />);

    // hit play/pause button to start animation
    const playButtons = renderedComponent.getAllByTestId("play-button");
    const playButton = playButtons[playButtons.length - 1]; // last play button is the one in the scrubber.
    expect(dataProvider.playing).to.be.false;
    expect(dataProvider.pointerCallbackCalled).to.be.false;

    fireEvent.click(playButton);
    expect(dataProvider.playing).to.be.true;

    fakeTimers.tick(1);
    // Wait for animation.
    fakeTimers.setSystemTime(600);
    // Wait for 1st raf cb.
    fakeTimers.tick(1);

    // kill some time to wait for setState and subsequent call to window.requestAnimationFrame to process
    // await new Promise((r) => { setTimeout(r, 40); });
    expect(dataProvider.playing).to.be.false;
  });

  it("open/close timeline settings - minimized", async () => {
    const dataProvider = new TestTimelineDataProvider();

    const renderedComponent = render(<TimelineComponent
      startDate={dataProvider.start}
      endDate={dataProvider.end}
      initialDuration={dataProvider.initialDuration}
      totalDuration={dataProvider.duration}
      minimized={true}
      showDuration={true}
      onChange={dataProvider.onAnimationFractionChanged}
      onSettingsChange={dataProvider.onPlaybackSettingChanged}
      onPlayPause={dataProvider.onPlayPause} />);

    expect(renderedComponent).not.to.be.undefined;

    // hit the setting button
    const settingMenuSpan = renderedComponent.getByTestId("timeline-settings");
    fireEvent.click(settingMenuSpan);
    const repeatItem = renderedComponent.getByText("timeline.repeat");
    expect(repeatItem).not.to.be.null;
    fireEvent.click(repeatItem);

    expect(dataProvider.settingsCallbackCalled).to.be.true;

    const durationInputField = renderedComponent.queryByTestId("timeline-duration-edit-input");
    expect(durationInputField).not.to.be.null;
    fireEvent.change(durationInputField!, { target: { value: "00:44" } });
    // callback is not triggered until Enter key is pressed.
    fireEvent.keyDown(durationInputField!, { key: "Enter" });

    expect(dataProvider.duration).to.be.equal(44000);

    fireEvent.change(durationInputField!, { target: { value: "00:66" } });
    // callback is not triggered until Enter key is pressed.
    fireEvent.keyDown(durationInputField!, { key: "Escape" });

    expect(dataProvider.duration).to.be.equal(44000);

    act(() => durationInputField!.focus());
    fireEvent.change(durationInputField!, { target: { value: "00:66" } });
    act(() => settingMenuSpan.focus());
    // expect(dataProvider.duration).to.be.equal(66000);
  });
  it("open/close timeline settings - always minimized", async () => {
    const dataProvider = new TestTimelineDataProvider();

    const renderedComponent = render(
      <TimelineComponent
        startDate={dataProvider.start}
        endDate={dataProvider.end}
        initialDuration={dataProvider.initialDuration}
        totalDuration={dataProvider.duration}
        minimized={true}
        showDuration={true}
        onChange={dataProvider.onAnimationFractionChanged}
        onSettingsChange={dataProvider.onPlaybackSettingChanged}
        onPlayPause={dataProvider.onPlayPause}
        alwaysMinimized={false}
      />,
    );

    expect(renderedComponent).not.to.be.undefined;

    const settingMenuSpan = renderedComponent.getByTestId("timeline-settings");
    fireEvent.click(settingMenuSpan);

    renderedComponent.rerender(
      <TimelineComponent
        startDate={dataProvider.start}
        endDate={dataProvider.end}
        initialDuration={dataProvider.initialDuration}
        totalDuration={dataProvider.duration}
        minimized={true}
        showDuration={false}
        onChange={dataProvider.onAnimationFractionChanged}
        onSettingsChange={dataProvider.onPlaybackSettingChanged}
        onPlayPause={dataProvider.onPlayPause}
        alwaysMinimized={true}
      />,
    );
  });
  it("Dynamically set duration", async () => {
    const dataProvider = new TestTimelineDataProvider();

    const renderedComponent = render(
      <TimelineComponent
        startDate={dataProvider.start}
        endDate={dataProvider.end}
        initialDuration={dataProvider.initialDuration}
        totalDuration={dataProvider.duration}
        minimized={true}
        showDuration={true}
        onChange={dataProvider.onAnimationFractionChanged}
        onSettingsChange={dataProvider.onPlaybackSettingChanged}
        onPlayPause={dataProvider.onPlayPause}
        alwaysMinimized={false}
      />,
    );

    expect(renderedComponent).not.to.be.undefined;

    // trigger call to componentDidUpdate
    renderedComponent.rerender(
      <TimelineComponent
        startDate={dataProvider.start}
        endDate={dataProvider.end}
        initialDuration={50000}
        totalDuration={dataProvider.duration}
        minimized={true}
        showDuration={true}
        onChange={dataProvider.onAnimationFractionChanged}
        onSettingsChange={dataProvider.onPlaybackSettingChanged}
        onPlayPause={dataProvider.onPlayPause}
        alwaysMinimized={false}
      />,
    );
  });
  it("onPlayPause called for TimerPausePlay event", async () => {
    fakeTimers = sinon.useFakeTimers();
    const dataProvider = new TestTimelineDataProvider();
    const spyOnPlayPause = sinon.spy();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const renderedComponent = render(<TimelineComponent
      initialDuration={dataProvider.initialDuration}
      totalDuration={dataProvider.duration}
      minimized={true}
      showDuration={true}
      onChange={dataProvider.onAnimationFractionChanged}
      onJump={dataProvider.onJump}
      onPlayPause={spyOnPlayPause}
      componentId={"TestTimeline"} />);

    const args: TimelinePausePlayArgs = { uiComponentId: "TestTimeline", timelineAction: TimelinePausePlayAction.Play };
    UiAdmin.sendUiEvent(args);

    // React18 is scheduling setStates,
    // Wait for the playing to effectively start, otherwise "Pause" event wouldn't do anything.
    await waitFor(() => {
      expect(screen.getAllByTitle("timeline.pause")).lengthOf(2);
    });

    args.timelineAction = TimelinePausePlayAction.Pause;
    UiAdmin.sendUiEvent(args);
    args.timelineAction = TimelinePausePlayAction.Toggle;
    UiAdmin.sendUiEvent(args);
    expect(spyOnPlayPause.calledThrice).to.be.true;
    UiAdmin.sendUiEvent({ uiComponentId: "TestTimeline" });
    // onPlayPause should not be called again, since the args don't include an action
    expect(spyOnPlayPause.calledThrice).to.be.true;
  });
  it("re-render on repeat change", () => {
    const dataProvider = new TestTimelineDataProvider();
    const renderedComponent = render(
      <TimelineComponent
        startDate={dataProvider.start}
        endDate={dataProvider.end}
        initialDuration={dataProvider.initialDuration}
        totalDuration={dataProvider.duration}
        minimized={false}
        showDuration={true}
        repeat={false}
        onChange={dataProvider.onAnimationFractionChanged}
        onSettingsChange={dataProvider.onPlaybackSettingChanged}
        onPlayPause={dataProvider.onPlayPause}
        alwaysMinimized={false}
      />,
    );

    expect(renderedComponent).not.to.be.undefined;
    expect(dataProvider.getSettings().loop).to.be.false;

    // trigger call to componentDidUpdate
    renderedComponent.rerender(
      <TimelineComponent
        startDate={dataProvider.start}
        endDate={dataProvider.end}
        initialDuration={50000}
        totalDuration={dataProvider.duration}
        minimized={false}
        showDuration={true}
        repeat={true}
        onChange={dataProvider.onAnimationFractionChanged}
        onSettingsChange={dataProvider.onPlaybackSettingChanged}
        onPlayPause={dataProvider.onPlayPause}
        alwaysMinimized={false}
      />,
    );
    expect(dataProvider.getSettings().loop).to.be.true;
  });
  it("test repeat button does not loop endlessly with external state variable", () => {
    const renderedComponent = render(
      <TestRepeatTimelineComponent />,
    );

    expect(renderedComponent).not.to.be.undefined;

    const settingMenuSpan = renderedComponent.getByTestId("timeline-settings");
    fireEvent.click(settingMenuSpan);

    const repeatItem = renderedComponent.getByText("timeline.repeat");
    expect(repeatItem).not.to.be.null;
    fireEvent.click(repeatItem);
  });
  it("re-render on totalDuration change", () => {
    const dataProvider = new TestTimelineDataProvider();
    const renderedComponent = render(
      <TimelineComponent
        startDate={dataProvider.start}
        endDate={dataProvider.end}
        initialDuration={dataProvider.initialDuration}
        totalDuration={dataProvider.duration}
        minimized={false}
        showDuration={true}
        repeat={false}
        onChange={dataProvider.onAnimationFractionChanged}
        onSettingsChange={dataProvider.onPlaybackSettingChanged}
        onPlayPause={dataProvider.onPlayPause}
        alwaysMinimized={false}
      />,
    );

    expect(renderedComponent).not.to.be.undefined;

    const newDuration = dataProvider.getSettings().duration! * 2;

    // trigger call to componentDidUpdate
    renderedComponent.rerender(
      <TimelineComponent
        startDate={dataProvider.start}
        endDate={dataProvider.end}
        initialDuration={50000}
        totalDuration={newDuration}
        minimized={true}
        showDuration={true}
        repeat={true}
        onChange={dataProvider.onAnimationFractionChanged}
        onSettingsChange={dataProvider.onPlaybackSettingChanged}
        onPlayPause={dataProvider.onPlayPause}
        alwaysMinimized={false}
      />,
    );
    expect(dataProvider.getSettings().duration).to.be.eq(newDuration);
  });
  it("re-render on new start and end date", () => {
    const dataProvider = new TestTimelineDataProvider();
    const renderedComponent = render(
      <TimelineComponent
        startDate={dataProvider.start}
        endDate={dataProvider.end}
        initialDuration={dataProvider.initialDuration}
        totalDuration={dataProvider.duration}
        minimized={true}
        showDuration={true}
        onChange={dataProvider.onAnimationFractionChanged}
        onSettingsChange={dataProvider.onPlaybackSettingChanged}
        onPlayPause={dataProvider.onPlayPause}
        alwaysMinimized={false}
      />,
    );

    expect(renderedComponent).not.to.be.undefined;
    const newStartDate = new Date(2019, 4, 1);
    const newEndDate = new Date(2020, 5, 7);

    // trigger call to componentDidUpdate
    renderedComponent.rerender(
      <TimelineComponent
        startDate={newStartDate}
        endDate={newEndDate}
        initialDuration={50000}
        totalDuration={dataProvider.duration}
        minimized={true}
        showDuration={true}
        onChange={dataProvider.onAnimationFractionChanged}
        onSettingsChange={dataProvider.onPlaybackSettingChanged}
        onPlayPause={dataProvider.onPlayPause}
        alwaysMinimized={false}
      />,
    );
    const startDateItem = renderedComponent.container.querySelector(".start-date") as HTMLElement;
    expect(startDateItem).not.to.be.null;
    expect(startDateItem?.innerHTML).to.be.eq(newStartDate.toLocaleDateString());

    const endDateItem = renderedComponent.container.querySelector(".end-date") as HTMLElement;
    expect(endDateItem).not.to.be.null;
    expect(endDateItem?.innerHTML).to.be.eq(newEndDate.toLocaleDateString());
  });
  it("should call onForward on forward button click", () => {
    const dataProvider = new TestTimelineDataProvider();
    const spyOnJump = sinon.spy();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const renderedComponent = render(<TimelineComponent
      initialDuration={dataProvider.initialDuration}
      totalDuration={dataProvider.duration}
      minimized={true}
      showDuration={true}
      onChange={dataProvider.onAnimationFractionChanged}
      onJump={spyOnJump}
      onPlayPause={dataProvider.onPlayPause}
      componentId={"TestTimeline"} />);
    const forwardButton = renderedComponent.getAllByTestId("play-forward")[0];
    fireEvent.click(forwardButton);
    expect(spyOnJump).to.be.called;
  });
  it("should call onBackward on back button click", () => {
    const dataProvider = new TestTimelineDataProvider();
    const spyOnJump = sinon.spy();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const renderedComponent = render(<TimelineComponent
      initialDuration={dataProvider.initialDuration}
      totalDuration={dataProvider.duration}
      minimized={true}
      showDuration={true}
      onChange={dataProvider.onAnimationFractionChanged}
      onJump={spyOnJump}
      onPlayPause={dataProvider.onPlayPause}
      componentId={"TestTimeline"} />);
    const backButton = renderedComponent.getAllByTestId("play-backward")[0];
    fireEvent.click(backButton);
    expect(spyOnJump).to.be.called;
  });
  it("should append items", () => {
    const duration = 8 * 1000;
    const startDate = new Date(2014, 6, 6);
    const endDate = new Date(2016, 8, 12);
    const appendMenuItems: TimelineMenuItemProps[] = [
      { label: "8 seconds", timelineDuration: 8 * 1000 },
      { label: "5 Seconds", timelineDuration: 5 * 1000 },
      { label: "3 Seconds", timelineDuration: 3 * 1000 },
    ];
    const renderedComponent = render(
      <div>
        <TimelineComponent
          startDate={startDate}
          endDate={endDate}
          initialDuration={0}
          totalDuration={duration}
          minimized={true}
          showDuration={true}
          alwaysMinimized={true}
          appMenuItemOption={"append"}
          appMenuItems={appendMenuItems}
          componentId={"sampleApp-appendSampleTimeline"} // qualify id with "<appName>-" to ensure uniqueness
        />
      </div>
    );
    expect(renderedComponent).not.to.be.undefined;

    const settingMenuSpan = renderedComponent.getByTestId("timeline-settings");
    fireEvent.click(settingMenuSpan);

    const addedItem = renderedComponent.getByText("8 seconds");
    expect(addedItem).not.to.be.null;

    const standardItem = renderedComponent.getByText("timeline.slow");
    expect(standardItem).not.to.be.null;
  });
  it("should prefix items", () => {
    const duration = 500;
    const startDate = new Date(2014, 6, 6);
    const endDate = new Date(2016, 8, 12);
    const prefixMenuItems: TimelineMenuItemProps[] = [
      { label: "1/2 Second", timelineDuration: 500 },
      { label: "1 Seconds", timelineDuration: 1000 },
      { label: "2 Seconds", timelineDuration: 2 * 1000 },
    ];
    const renderedComponent = render(
      <div>
        <TimelineComponent
          startDate={startDate}
          endDate={endDate}
          initialDuration={0}
          totalDuration={duration}
          minimized={true}
          showDuration={true}
          alwaysMinimized={true}
          appMenuItemOption={"prefix"}
          appMenuItems={prefixMenuItems}
          componentId={"sampleApp-prefixSampleTimeline"} // qualify id with "<appName>-" to ensure uniqueness
        />
      </div>
    );
    expect(renderedComponent).not.to.be.undefined;

    const settingMenuSpan = renderedComponent.getByTestId("timeline-settings");
    fireEvent.click(settingMenuSpan);

    const addedItem = renderedComponent.getByText("2 Seconds");
    expect(addedItem).not.to.be.null;
    fireEvent.click(addedItem);

    // open menu again
    fireEvent.click(settingMenuSpan);
    const standardItem = renderedComponent.getByText("timeline.slow");
    expect(standardItem).not.to.be.null;
  });
  it("should replace items", () => {
    const duration = 40 * 1000;
    const startDate = new Date(2018, 6, 6);
    const endDate = new Date(2021, 8, 12);
    const replaceMenuItems: TimelineMenuItemProps[] = [
      { label: "40 Seconds", timelineDuration: 40 * 1000 },
      { label: "1 Minute", timelineDuration: 60 * 1000 },
      { label: "90 Seconds", timelineDuration: 90 * 1000 },
    ];
    const renderedComponent = render(
      <div className="component-examples">
        <TimelineComponent
          startDate={startDate}
          endDate={endDate}
          initialDuration={0}
          totalDuration={duration}
          minimized={true}
          showDuration={true}
          alwaysMinimized={true}
          appMenuItemOption={"replace"}
          appMenuItems={replaceMenuItems}
          componentId={"sampleApp-replaceSampleTimeline"} // qualify id with "<appName>-" to ensure uniqueness
        />
      </div>
    );
    expect(renderedComponent).not.to.be.undefined;

    const settingMenuSpan = renderedComponent.getByTestId("timeline-settings");
    fireEvent.click(settingMenuSpan);

    const addedItem = renderedComponent.queryByText("40 Seconds");
    expect(addedItem).not.to.be.null;

    expect(renderedComponent.queryByText("timeline.slow")).to.be.null;
  });
  it("should remove repeat option", () => {
    const duration = 40 * 1000;
    const startDate = new Date(2018, 6, 6);
    const endDate = new Date(2021, 8, 12);
    const renderedComponent = render(
      <div className="component-examples">
        <TimelineComponent
          startDate={startDate}
          endDate={endDate}
          initialDuration={0}
          totalDuration={duration}
          minimized={true}
          showDuration={true}
          alwaysMinimized={true}
          includeRepeat={false}
          componentId={"sampleApp-noRepeatSampleTimeline"} // qualify id with "<appName>-" to ensure uniqueness
        />
      </div>
    );
    expect(renderedComponent).not.to.be.undefined;

    const settingMenuSpan = renderedComponent.getByTestId("timeline-settings");
    fireEvent.click(settingMenuSpan);

    expect(renderedComponent.queryByText("timeline.repeat")).to.be.null;

    const mouseUp = new MouseEvent("mouseup");
    sinon.stub(mouseUp, "target").get(() => document.createElement("div"));
    window.dispatchEvent(mouseUp);
  });
  it("should respect time zone offset", () => {
    const duration = 10 * 1000;
    const startDate = new Date("July 1, 2016, 00:00:00 GMT -0000");
    const endDate = new Date("July 1, 2016, 20:30:45 GMT -0000");

    const renderedComponent = render(
      <TimelineComponent
        startDate={startDate}
        endDate={endDate}
        minimized={true}
        showDuration={false}
        totalDuration={duration}
        timeZoneOffset={-300}
        dateFormatOptions={{ locales: "en-US", options: { year: "numeric", month: "short", day: "numeric" } }}
        timeFormatOptions={{ locales: "en-US", options: { hour: "2-digit", minute: "numeric", second: "numeric", hour12: true } }}
        componentId={"sampleApp-timeZoneOffset"}
      />
    );
    expect(renderedComponent).not.to.be.undefined;

    const startDateLabel = renderedComponent.getByTestId("test-start-date");
    expect(startDateLabel).not.to.be.null;
    expect(startDateLabel.innerHTML).to.equal("Jun 30, 2016");

    const startTimeLabel = renderedComponent.getByTestId("test-start-time");
    expect(startTimeLabel).not.to.be.null;
    expect(startTimeLabel.innerHTML.replace("\u202f", " ")).to.equal("07:00:00 PM");
  });

  it("should mark today's date on the timeline", () => {
    const duration = 10 * 1000;
    const todayDate = new Date();
    const startDate = new Date(todayDate.getTime() - 6 * 28 * 24 * 60 * 60);
    const endDate = new Date(todayDate.getTime() + 6 * 28 * 24 * 60 * 60);
    const marker = {};

    const renderedComponent = render(
      <TimelineComponent
        startDate={startDate}
        endDate={endDate}
        minimized={true}
        showDuration={false}
        totalDuration={duration}
        componentId={"sampleApp-MarkToday"}
        markDate={marker}
      />
    );
    expect(renderedComponent).not.to.be.undefined;
    const dateMarker = renderedComponent.getByTestId("test-date-marker");
    expect(dateMarker).not.to.be.null;

  });
  it("should mark a date on the timeline with a custom symbol", () => {
    const duration = 10 * 1000;
    const startDate = new Date("July 1, 2016, 00:00:00 GMT -0000");
    const endDate = new Date("July 1, 2017, 20:30:45 GMT -0000");
    const myDateMarker = <span data-testid="test-custom-date-marker">{"T"}</span>;
    const marker = { date: new Date("December 15, 2016"), dateMarker: myDateMarker };

    const renderedComponent = render(
      <TimelineComponent
        startDate={startDate}
        endDate={endDate}
        minimized={true}
        showDuration={false}
        totalDuration={duration}
        componentId={"sampleApp-MarkTodayCustom"}
        markDate={marker}
      />
    );
    expect(renderedComponent).not.to.be.undefined;
    const dateMarker = renderedComponent.getByTestId("test-custom-date-marker");
    expect(dateMarker).not.to.be.null;
  });
});
