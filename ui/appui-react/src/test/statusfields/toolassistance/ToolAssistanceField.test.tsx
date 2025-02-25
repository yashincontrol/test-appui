/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { expect } from "chai";
import * as React from "react";
import * as sinon from "sinon";
import { Logger } from "@itwin/core-bentley";
import { MockRender, ToolAssistance, ToolAssistanceImage, ToolAssistanceInputMethod } from "@itwin/core-frontend";
import { LocalStateStorage } from "@itwin/core-react";
import { render, screen, waitFor } from "@testing-library/react";
import {
  AppNotificationManager, CursorPopupManager, StatusBar, ToolAssistanceField, UiFramework,
} from "../../../appui-react";
import TestUtils, { selectorMatches, storageMock, userEvent } from "../../TestUtils";

describe(`ToolAssistanceField`, () => {
  let theUserTo: ReturnType<typeof userEvent.setup>;
  beforeEach(async () => {
    theUserTo = userEvent.setup();
    CursorPopupManager.clearPopups();
    await uiSettingsStorage.saveSetting("ToolAssistance", "showPromptAtCursor", true);
    await uiSettingsStorage.saveSetting("ToolAssistance", "mouseTouchTabIndex", 0);
  });
  const uiSettingsStorage = new LocalStateStorage({ localStorage: storageMock() } as Window);

  before(async () => {
    await TestUtils.initializeUiFramework();
    await MockRender.App.startup();
  });

  after(async () => {
    TestUtils.terminateUiFramework();
    await MockRender.App.shutdown();
  });

  // cSpell:Ignore TOOLPROMPT

  it("Status Bar with ToolAssistanceField should mount", async () => {
    render(<StatusBar>
      <ToolAssistanceField uiStateStorage={uiSettingsStorage} />
    </StatusBar>);

    const helloWorld = "Hello World!";
    const notifications = new AppNotificationManager();
    notifications.outputPrompt(helloWorld);
    await waitFor(() => {
      expect(screen.getByText("Hello World!")).to.satisfy(selectorMatches(".nz-indicator .nz-content"));
    });
  });

  it("Status Bar with ToolAssistanceField should display prompt", async () => {
    const wrapper = render(<ToolAssistanceField uiStateStorage={uiSettingsStorage} />);

    const helloWorld = "Hello World!";
    const notifications = new AppNotificationManager();
    notifications.outputPrompt(helloWorld);

    const prompt = await wrapper.findByText("Hello World!");
    expect(prompt).to.exist;
  });

  it("dialog should open and close on click", async () => {
    render(<StatusBar>
      <ToolAssistanceField uiStateStorage={uiSettingsStorage} />
    </StatusBar>);

    const helloWorld = "Hello World!";
    const notifications = new AppNotificationManager();
    notifications.outputPrompt(helloWorld);

    await theUserTo.click(screen.getByRole("button"));

    expect(screen.getByText("toolAssistance.promptAtCursor")).to.satisfy(selectorMatches(
      ".nz-footer-toolAssistance-item .iui-toggle-switch-label"
    ));

    await theUserTo.click(screen.getByTitle(/Hello World!.*toolAssistance\.moreInfo/));

    expect(screen.queryByText("toolAssistance.promptAtCursor")).to.null;
  });

  it("passing isNew:true should use newDot", async () => {
    render(<StatusBar>
      <ToolAssistanceField uiStateStorage={uiSettingsStorage} />
    </StatusBar>);

    const notifications = new AppNotificationManager();
    const mainInstruction = ToolAssistance.createInstruction(ToolAssistanceImage.CursorClick, "Click on something", true);

    const instruction1 = ToolAssistance.createInstruction(ToolAssistanceImage.AcceptPoint, "xyz", true);
    const instruction2 = ToolAssistance.createKeyboardInstruction(ToolAssistance.createKeyboardInfo(["A"]), "Press a key", true);
    const section1 = ToolAssistance.createSection([instruction1, instruction2], "Inputs");

    const instructions = ToolAssistance.createInstructions(mainInstruction, [section1]);

    notifications.setToolAssistance(instructions);

    await theUserTo.click(screen.getByRole("button"));

    expect(screen.getByRole("dialog").querySelectorAll(".nz-footer-toolAssistance-newDot,.nz-text-new")).lengthOf(6);
  });

  it("ToolAssistanceImage.Keyboard with a single key should generate key image", async () => {
    render(<StatusBar>
      <ToolAssistanceField uiStateStorage={uiSettingsStorage} />
    </StatusBar>);

    const notifications = new AppNotificationManager();
    const mainInstruction = ToolAssistance.createInstruction(ToolAssistanceImage.AcceptPoint, "xyz");
    const instruction1 = ToolAssistance.createKeyboardInstruction(ToolAssistance.createKeyboardInfo(["A"]), "Press a key");
    const section1 = ToolAssistance.createSection([instruction1], "Inputs");
    const instructions = ToolAssistance.createInstructions(mainInstruction, [section1]);
    notifications.setToolAssistance(instructions);

    await theUserTo.click(screen.getByRole("button"));

    expect(screen.getByRole("dialog").querySelectorAll(".uifw-toolassistance-key")).lengthOf(1);
  });

  it("should support known icons and multiple sections", async () => {
    render(<StatusBar>
      <ToolAssistanceField uiStateStorage={uiSettingsStorage} />
    </StatusBar>);

    const notifications = new AppNotificationManager();
    const mainInstruction = ToolAssistance.createInstruction("icon-clock", "This is the prompt that is fairly long 1234567890");

    const instruction1 = ToolAssistance.createInstruction(ToolAssistanceImage.AcceptPoint, "xyz");
    const instruction2 = ToolAssistance.createInstruction(ToolAssistanceImage.MouseWheel, "xyz");
    const section1 = ToolAssistance.createSection([instruction1, instruction2], "Inputs");

    const instruction21 = ToolAssistance.createInstruction(ToolAssistanceImage.LeftClick, "xyz");
    const instruction22 = ToolAssistance.createInstruction(ToolAssistanceImage.RightClick, "xyz");
    const instruction23 = ToolAssistance.createInstruction(ToolAssistanceImage.LeftClickDrag, "xyz");
    const instruction24 = ToolAssistance.createInstruction(ToolAssistanceImage.RightClickDrag, "xyz");
    const instruction25 = ToolAssistance.createInstruction(ToolAssistanceImage.MouseWheelClickDrag, "xyz");
    const section2 = ToolAssistance.createSection([instruction21, instruction22, instruction23, instruction24, instruction25], "More Inputs");

    const instruction31 = ToolAssistance.createInstruction(ToolAssistanceImage.OneTouchTap, "xyz");
    const instruction32 = ToolAssistance.createInstruction(ToolAssistanceImage.OneTouchDoubleTap, "xyz");
    const instruction33 = ToolAssistance.createInstruction(ToolAssistanceImage.OneTouchDrag, "xyz");
    const instruction34 = ToolAssistance.createInstruction(ToolAssistanceImage.TwoTouchTap, "xyz");
    const instruction35 = ToolAssistance.createInstruction(ToolAssistanceImage.TwoTouchDrag, "xyz");
    const instruction36 = ToolAssistance.createInstruction(ToolAssistanceImage.TwoTouchPinch, "xyz");
    const instruction37 = ToolAssistance.createInstruction(ToolAssistanceImage.TouchCursorTap, "xyz");
    const instruction38 = ToolAssistance.createInstruction(ToolAssistanceImage.TouchCursorDrag, "xyz");
    const section3 = ToolAssistance.createSection([instruction31, instruction32, instruction33, instruction34, instruction35, instruction36, instruction37, instruction38], "Touch Inputs");

    const instructions = ToolAssistance.createInstructions(mainInstruction, [section1, section2, section3]);

    notifications.setToolAssistance(instructions);

    await theUserTo.click(screen.getByRole("button"));

    expect(screen.getByRole("dialog").querySelectorAll([
      "div.nz-footer-toolAssistance-dialog",
      "div.nz-footer-toolAssistance-separator",
      "div.nz-footer-toolAssistance-instruction",
    ].join(","))).lengthOf(21);
  });

  it("ToolAssistanceImage.Keyboard with a key containing multiple chars should use large key", async () => {
    render(<StatusBar>
      <ToolAssistanceField uiStateStorage={uiSettingsStorage} />
    </StatusBar>);

    const notifications = new AppNotificationManager();
    const mainInstruction = ToolAssistance.createInstruction(ToolAssistanceImage.AcceptPoint, "xyz");
    const instruction1 = ToolAssistance.createKeyboardInstruction(ToolAssistance.shiftKeyboardInfo, "Press the Shift key");
    const section1 = ToolAssistance.createSection([instruction1], "Inputs");
    const instructions = ToolAssistance.createInstructions(mainInstruction, [section1]);

    notifications.setToolAssistance(instructions);

    await theUserTo.click(screen.getByRole("button"));

    expect(screen.getByRole("dialog").querySelectorAll(
      ".uifw-toolassistance-key-large"
    )).lengthOf(1);
  });

  it("ToolAssistanceImage.Keyboard with 2 keys should use medium keys", async () => {
    render(<StatusBar>
      <ToolAssistanceField uiStateStorage={uiSettingsStorage} />
    </StatusBar>);

    const notifications = new AppNotificationManager();
    const mainInstruction = ToolAssistance.createInstruction(ToolAssistanceImage.AcceptPoint, "xyz");
    const instruction1 = ToolAssistance.createKeyboardInstruction(ToolAssistance.createKeyboardInfo(["A", "B"]), "Press one of two keys");
    const section1 = ToolAssistance.createSection([instruction1], "Inputs");
    const instructions = ToolAssistance.createInstructions(mainInstruction, [section1]);

    notifications.setToolAssistance(instructions);

    await theUserTo.click(screen.getByRole("button"));

    expect(screen.getByRole("dialog").querySelectorAll(
      ".uifw-toolassistance-key-medium"
    )).lengthOf(2);
  });

  it("ToolAssistanceImage.Keyboard with a modifier key should a medium modifier key & medium key", async () => {
    render(<StatusBar>
      <ToolAssistanceField uiStateStorage={uiSettingsStorage} />
    </StatusBar>);

    const notifications = new AppNotificationManager();
    const mainInstruction = ToolAssistance.createInstruction(ToolAssistanceImage.AcceptPoint, "xyz");
    const instruction1 = ToolAssistance.createKeyboardInstruction(ToolAssistance.createKeyboardInfo([ToolAssistance.ctrlKey, "Z"]), "Press Ctrl+Z", true);
    const section1 = ToolAssistance.createSection([instruction1], "Inputs");
    const instructions = ToolAssistance.createInstructions(mainInstruction, [section1]);

    notifications.setToolAssistance(instructions);

    await theUserTo.click(screen.getByRole("button"));

    expect(screen.getByRole("dialog").querySelectorAll(
      ".uifw-toolassistance-key-medium,.uifw-toolassistance-key-modifier"
    )).lengthOf(2);
  });

  it("ToolAssistanceImage.Keyboard with bottomRow should use small keys", async () => {
    render(<StatusBar>
      <ToolAssistanceField uiStateStorage={uiSettingsStorage} />
    </StatusBar>);

    const notifications = new AppNotificationManager();
    const mainInstruction = ToolAssistance.createInstruction(ToolAssistanceImage.AcceptPoint, "xyz");
    const instruction1 = ToolAssistance.createKeyboardInstruction(ToolAssistance.createKeyboardInfo(["W"], ["A", "S", "D"]), "Press one of four keys");
    const section1 = ToolAssistance.createSection([instruction1], "Inputs");
    const instructions = ToolAssistance.createInstructions(mainInstruction, [section1]);

    notifications.setToolAssistance(instructions);

    await theUserTo.click(screen.getByRole("button"));

    expect(screen.getByRole("dialog").querySelectorAll(
      ".uifw-toolassistance-key-small"
    )).lengthOf(4);
  });

  it("ToolAssistanceImage.Keyboard but keyboardInfo should log error", async () => {
    const spyMethod = sinon.spy(Logger, "logError");
    render(<StatusBar>
      <ToolAssistanceField uiStateStorage={uiSettingsStorage} />
    </StatusBar>);

    const notifications = new AppNotificationManager();
    const mainInstruction = ToolAssistance.createInstruction(ToolAssistanceImage.Keyboard, "Press a key" /* No keyboardInfo */);
    const instructions = ToolAssistance.createInstructions(mainInstruction);

    notifications.setToolAssistance(instructions);

    await waitFor(() => {
      spyMethod.called.should.true;
    });
  });

  it("ToolAssistanceImage.Keyboard with invalid keyboardInfo should log error", async () => {
    const spyMethod = sinon.spy(Logger, "logError");
    render(<StatusBar>
      <ToolAssistanceField uiStateStorage={uiSettingsStorage} />
    </StatusBar>);

    const notifications = new AppNotificationManager();
    const mainInstruction = ToolAssistance.createKeyboardInstruction(ToolAssistance.createKeyboardInfo([]), "Press key");
    const instructions = ToolAssistance.createInstructions(mainInstruction);

    notifications.setToolAssistance(instructions);

    await waitFor(() => {
      spyMethod.called.should.true;
    });
  });

  it("createModifierKeyInstruction should generate valid instruction", async () => {
    render(<StatusBar>
      <ToolAssistanceField uiStateStorage={uiSettingsStorage} />
    </StatusBar>);

    const notifications = new AppNotificationManager();
    const mainInstruction = ToolAssistance.createInstruction(ToolAssistanceImage.CursorClick, "Click on something", true, ToolAssistanceInputMethod.Both, ToolAssistance.createKeyboardInfo([]));

    const instruction1 = ToolAssistance.createModifierKeyInstruction(ToolAssistance.shiftKey, ToolAssistanceImage.LeftClick, "Shift + something else");
    const instruction2 = ToolAssistance.createModifierKeyInstruction(ToolAssistance.ctrlKey, "icon-cursor-click", "Ctrl + something else");
    const instruction3 = ToolAssistance.createModifierKeyInstruction(ToolAssistance.shiftKey, ToolAssistanceImage.LeftClickDrag, "shiftKey + drag something");
    const instruction4 = ToolAssistance.createModifierKeyInstruction(ToolAssistance.shiftKey, ToolAssistanceImage.RightClickDrag, "shiftKey + drag something");
    const instruction5 = ToolAssistance.createModifierKeyInstruction(ToolAssistance.shiftKey, ToolAssistanceImage.MouseWheelClickDrag, "shiftKey + drag something");
    const section1 = ToolAssistance.createSection([instruction1, instruction2, instruction3, instruction4, instruction5], "Inputs");
    const instructions = ToolAssistance.createInstructions(mainInstruction, [section1]);
    notifications.setToolAssistance(instructions);

    await theUserTo.click(screen.getByRole("button"));

    expect(screen.getByRole("dialog").querySelectorAll([
      "div.uifw-toolassistance-key-modifier",
      "div.uifw-toolassistance-svg-medium",
      "div.uifw-toolassistance-icon-medium",
      "div.uifw-toolassistance-svg-medium-wide",
    ].join(","))).lengthOf(10);
  });

  it("should support svg icons in string-based instruction.image", async () => {
    render(<StatusBar>
      <ToolAssistanceField uiStateStorage={uiSettingsStorage} />
    </StatusBar>);

    const notifications = new AppNotificationManager();
    const mainInstruction = ToolAssistance.createInstruction("webSvg:test", "This is the prompt");

    const instructions = ToolAssistance.createInstructions(mainInstruction);

    notifications.setToolAssistance(instructions);

    await theUserTo.click(screen.getByRole("button"));

    expect(screen.getByRole("dialog").querySelectorAll("div.uifw-toolassistance-svg")).lengthOf(1);
    expect(screen.getByRole("dialog").querySelectorAll("div.uifw-toolassistance-icon-large")).lengthOf(0);
  });

  it("invalid modifier key info along with image should log error", async () => {
    const spyMethod = sinon.spy(Logger, "logError");
    render(<StatusBar>
      <ToolAssistanceField uiStateStorage={uiSettingsStorage} />
    </StatusBar>);

    const notifications = new AppNotificationManager();
    const mainInstruction = ToolAssistance.createInstruction(ToolAssistanceImage.CursorClick, "Click on something", true, ToolAssistanceInputMethod.Both, ToolAssistance.createKeyboardInfo([]));
    const instructions = ToolAssistance.createInstructions(mainInstruction);
    notifications.setToolAssistance(instructions);

    await waitFor(() => {
      spyMethod.called.should.true;
    });
  });

  it("should close on outside click", async () => {
    render(<>
      <div data-testid={"outside"} />
      <StatusBar>
        <ToolAssistanceField uiStateStorage={uiSettingsStorage} />
      </StatusBar>
    </>);

    await theUserTo.click(screen.getByRole("button"));

    expect(screen.getByText("toolAssistance.title")).to.exist;

    await theUserTo.click(screen.getByTestId("outside"));

    expect(screen.queryByText("toolAssistance.title")).to.be.null;
  });

  it("should not close on outside click if pinned", async () => {
    render(<>
      <div data-testid={"outside"} />
      <StatusBar>
        <ToolAssistanceField uiStateStorage={uiSettingsStorage} />
      </StatusBar>
    </>);

    await theUserTo.click(screen.getByRole("button"));
    await theUserTo.click(screen.getByTitle("toolAssistance.pin"));
    await theUserTo.click(screen.getByTestId("outside"));

    expect(screen.getByText("toolAssistance.title")).to.exist;
  });

  it("dialog should open and close on click, even if pinned", async () => {
    render(<StatusBar>
      <ToolAssistanceField uiStateStorage={uiSettingsStorage} />
    </StatusBar>);

    const helloWorld = "Hello World!";
    const notifications = new AppNotificationManager();
    notifications.outputPrompt(helloWorld);
    await theUserTo.click(screen.getByRole("button"));
    await theUserTo.click(screen.getByTitle("toolAssistance.pin"));
    await theUserTo.click(screen.getByTitle(/Hello World!.*toolAssistance\.moreInfo/));
    expect(screen.queryByText("toolAssistance.title")).to.be.null;
  });

  it("should set showPromptAtCursor on toggle click", async () => {
    render(<StatusBar>
      <ToolAssistanceField uiStateStorage={uiSettingsStorage} />
    </StatusBar>);
    await theUserTo.click(screen.getByRole("button"));

    const notifications = new AppNotificationManager();
    const mainInstruction = ToolAssistance.createInstruction(ToolAssistanceImage.CursorClick, "Click on something", true);
    const instructions = ToolAssistance.createInstructions(mainInstruction);
    notifications.setToolAssistance(instructions);

    await theUserTo.click(await screen.findByText("toolAssistance.promptAtCursor"));

    expect(screen.getByRole<HTMLInputElement>("switch").checked).to.be.false;
  });

  it("cursorPrompt should open when tool assistance set", async () => {
    render(<StatusBar>
      <ToolAssistanceField
        uiStateStorage={uiSettingsStorage}
        defaultPromptAtCursor={true}
      />
    </StatusBar>);

    const spyMethod = sinon.spy();
    CursorPopupManager.onCursorPopupUpdatePositionEvent.addListener(spyMethod);

    const notifications = new AppNotificationManager();
    const mainInstruction = ToolAssistance.createInstruction(ToolAssistanceImage.CursorClick, "Click on something", true);
    const instructions = ToolAssistance.createInstructions(mainInstruction);
    notifications.setToolAssistance(instructions);

    await waitFor(() => {
      spyMethod.called.should.true;
    });

    CursorPopupManager.onCursorPopupUpdatePositionEvent.removeListener(spyMethod);
  });

  it("cursorPrompt should open when tool icon changes", async () => {
    render(<StatusBar>
      <ToolAssistanceField
        uiStateStorage={uiSettingsStorage}
        defaultPromptAtCursor={true}
      />
    </StatusBar>);

    const spyMethod = sinon.spy();
    CursorPopupManager.onCursorPopupUpdatePositionEvent.addListener(spyMethod);

    // emit before instructions set
    UiFramework.frontstages.onToolIconChangedEvent.emit({ iconSpec: "icon-placeholder" });

    spyMethod.called.should.false;

    const notifications = new AppNotificationManager();
    const mainInstruction = ToolAssistance.createInstruction(ToolAssistanceImage.CursorClick, "Click on something", true);
    const instructions = ToolAssistance.createInstructions(mainInstruction);
    notifications.setToolAssistance(instructions);

    spyMethod.resetHistory();

    // emit after instructions set
    UiFramework.frontstages.onToolIconChangedEvent.emit({ iconSpec: "icon-placeholder" });

    await waitFor(() => {
      spyMethod.called.should.true;
    });

    CursorPopupManager.onCursorPopupUpdatePositionEvent.removeListener(spyMethod);
  });

  it("mouse & touch instructions should generate tabs", async () => {
    render(<StatusBar>
      <ToolAssistanceField uiStateStorage={uiSettingsStorage} />
    </StatusBar>);

    const notifications = new AppNotificationManager();
    const mainInstruction = ToolAssistance.createInstruction(ToolAssistanceImage.CursorClick, "Click on something", true);

    const instruction1 = ToolAssistance.createInstruction(ToolAssistanceImage.AcceptPoint, "mouseClick", true, ToolAssistanceInputMethod.Mouse);
    const instruction2 = ToolAssistance.createInstruction(ToolAssistanceImage.AcceptPoint, "fingerTouch", true, ToolAssistanceInputMethod.Touch);
    const section1 = ToolAssistance.createSection([instruction1, instruction2], "Inputs");

    const instructions = ToolAssistance.createInstructions(mainInstruction, [section1]);

    notifications.setToolAssistance(instructions);

    await theUserTo.click(screen.getByRole("button"));

    expect(screen.getByText("toolAssistance.mouse")).to.satisfy(selectorMatches(
      ".nz-content .iui-tabs-wrapper .iui-tab.iui-active .iui-tab-label div"
    ));
    expect(screen.getByText("mouseClick")).to.exist;
    expect(screen.queryByText("fingerTouch")).to.be.null;

    const touchTab = screen.getByText("toolAssistance.touch");
    expect(touchTab).to.satisfy(selectorMatches(
      ".nz-content .iui-tabs-wrapper .iui-tab:not(.iui-active) .iui-tab-label div"
    ));

    await theUserTo.click(touchTab);
    expect(screen.getByText("toolAssistance.touch")).to.satisfy(selectorMatches(
      ".nz-content .iui-tabs-wrapper .iui-tab.iui-active .iui-tab-label div"
    ));
    expect(screen.getByText("fingerTouch")).to.exist;
    expect(screen.queryByText("mouseClick")).to.be.null;
  });

  it("touch instructions should show", async () => {
    render(<StatusBar>
      <ToolAssistanceField uiStateStorage={uiSettingsStorage} />
    </StatusBar>);

    const notifications = new AppNotificationManager();
    const mainInstruction = ToolAssistance.createInstruction(ToolAssistanceImage.CursorClick, "Click on something", true);
    const instruction1 = ToolAssistance.createInstruction(ToolAssistanceImage.AcceptPoint, "xyz", true, ToolAssistanceInputMethod.Touch);
    const section1 = ToolAssistance.createSection([instruction1], "Inputs");
    const instructions = ToolAssistance.createInstructions(mainInstruction, [section1]);
    notifications.setToolAssistance(instructions);

    await theUserTo.click(screen.getByRole("button"));

    expect(screen.queryByRole("tablist")).to.be.null;
    expect(screen.getByText("xyz")).to.exist;
  });

  it("dialog should open, pin and close on click", async () => {
    render(<StatusBar>
      <ToolAssistanceField uiStateStorage={uiSettingsStorage} />
    </StatusBar>);

    const helloWorld = "Hello World!";
    const notifications = new AppNotificationManager();
    notifications.outputPrompt(helloWorld);
    await theUserTo.click(screen.getByRole("button"));
    await theUserTo.click(screen.getByTitle("toolAssistance.pin"));
    await theUserTo.click(screen.getByTitle("dialog.close"));
    expect(screen.queryByText("toolAssistance.title")).to.be.null;
  });
});
