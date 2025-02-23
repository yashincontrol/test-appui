/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { expect } from "chai";
import * as React from "react";
import * as sinon from "sinon";
import { Logger } from "@itwin/core-bentley";
import { ContentDialog, ContentDialogManager, ContentDialogRenderer, DialogChangedEventArgs } from "../../appui-react";
import TestUtils, { createStaticInternalPassthroughValidators, userEvent } from "../TestUtils";
import { render, screen, waitFor } from "@testing-library/react";
import { MockRender } from "@itwin/core-frontend";
import { InternalContentDialogManager } from "../../appui-react/dialog/InternalContentDialogManager";
/* eslint-disable deprecation/deprecation */

describe("ContentDialogManager", () => {
  let theUserTo: ReturnType<typeof userEvent.setup>;
  beforeEach(()=>{
    theUserTo = userEvent.setup();
    InternalContentDialogManager.closeAll();
    spyMethod.resetHistory();
  });

  const spyMethod = sinon.spy();

  function handleContentDialogChanged(_args: DialogChangedEventArgs) {
    spyMethod();
  }

  before(async () => {
    await TestUtils.initializeUiFramework(true);
    await MockRender.App.startup();

    ContentDialogManager.onContentDialogChangedEvent.addListener(handleContentDialogChanged);
  });

  after(async () => {
    ContentDialogManager.onContentDialogChangedEvent.removeListener(handleContentDialogChanged);
    await MockRender.App.shutdown();
    TestUtils.terminateUiFramework(); // clear out the framework key
  });

  it("ContentDialogManager methods", () => {
    const dialogId = "Test1";
    const reactNode = <ContentDialog
      opened={true}
      title="My Title"
      dialogId={dialogId}>
      <div />
    </ContentDialog>;

    expect(ContentDialogManager.dialogCount).to.eq(0);
    ContentDialogManager.openDialog(reactNode, dialogId);
    expect(spyMethod.calledOnce).to.be.true;

    expect(ContentDialogManager.activeDialog).to.eq(reactNode);

    expect(ContentDialogManager.dialogCount).to.eq(1);
    ContentDialogManager.openDialog(reactNode, dialogId);
    expect(ContentDialogManager.dialogCount).to.eq(1);

    expect(ContentDialogManager.dialogs.length).to.eq(1);
    expect(ContentDialogManager.dialogs[0].reactNode).to.eq(reactNode);

    ContentDialogManager.update();
    expect(spyMethod.calledTwice).to.be.true;

    ContentDialogManager.closeDialog(dialogId);
    expect(spyMethod.calledThrice).to.be.true;
    expect(ContentDialogManager.dialogCount).to.eq(0);
  });

  it("closeDialog should log error if passed a bad id", () => {
    const logSpyMethod = sinon.spy(Logger, "logError");
    ContentDialogManager.closeDialog("bad");
    logSpyMethod.calledOnce.should.true;
  });

  it("ContentDialogRenderer component", async () => {
    const dialogId = "Test1";
    const reactNode = <ContentDialog
      opened={true}
      title="My Title"
      dialogId={dialogId}>
      <button>MyTestButton</button>
    </ContentDialog>;

    render(<ContentDialogRenderer />);

    expect(ContentDialogManager.dialogCount).to.eq(0);
    ContentDialogManager.openDialog(reactNode, dialogId);
    expect(ContentDialogManager.dialogCount).to.eq(1);

    expect(await screen.findByRole("button", {name: "MyTestButton"})).to.exist;

    ContentDialogManager.closeDialog(dialogId);
    expect(ContentDialogManager.dialogCount).to.eq(0);

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "MyTestButton" })).to.be.null;
    });
  });

  it("ContentDialogRenderer component with two dialogs", async () => {
    const dialogId1 = "Test1";
    const reactNode1 = <ContentDialog
      opened={true}
      title="My Title1"
      dialogId={dialogId1}>
      <button>MyTestButton</button>
    </ContentDialog>;

    const dialogId2 = "Test2";
    const reactNode2 = <ContentDialog
      opened={true}
      title="My Title2"
      dialogId={dialogId2}>
      <button>MySecondTestButton</button>
    </ContentDialog>;

    render(<ContentDialogRenderer />);

    expect(ContentDialogManager.dialogCount).to.eq(0);

    ContentDialogManager.openDialog(reactNode1, dialogId1);
    expect(ContentDialogManager.dialogCount).to.eq(1);
    expect(await screen.findByRole("button", {name: "MyTestButton"})).to.exist;

    ContentDialogManager.openDialog(reactNode2, dialogId2);
    expect(ContentDialogManager.dialogCount).to.eq(2);
    expect(screen.getByRole("button", {name: "MyTestButton"})).to.exist;
    expect(await screen.findByRole("button", {name: "MySecondTestButton"})).to.exist;

    ContentDialogManager.closeDialog(dialogId2);
    expect(ContentDialogManager.dialogCount).to.eq(1);
    expect(screen.getByRole("button", {name: "MyTestButton"})).to.exist;
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "MySecondTestButton" })).to.be.null;
    });

    ContentDialogManager.closeDialog(dialogId1);
    expect(ContentDialogManager.dialogCount).to.eq(0);
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "MyTestButton" })).to.be.null;
    });
    expect(screen.queryByRole("button", {name: "MySecondTestButton"})).to.be.null;
  });

  it("ContentDialogRenderer component with two dialogs closed in FIFO order", async () => {
    const dialogId1 = "Test1";
    const reactNode1 = <ContentDialog
      opened={true}
      title="My Title"
      dialogId={dialogId1}>
      <button>MyTestButton</button>
    </ContentDialog>;

    const dialogId2 = "Test2";
    const reactNode2 = <ContentDialog
      opened={true}
      title="My Title 2"
      dialogId={dialogId2}>
      <button>MySecondTestButton</button>
    </ContentDialog>;

    render(<ContentDialogRenderer />);

    expect(ContentDialogManager.dialogCount).to.eq(0);

    ContentDialogManager.openDialog(reactNode1, dialogId1);
    expect(ContentDialogManager.dialogCount).to.eq(1);
    expect(ContentDialogManager.getDialogInfo(dialogId1)).not.to.be.undefined;

    expect(await screen.findByRole("button", {name: "MyTestButton"})).to.exist;

    ContentDialogManager.openDialog(reactNode2, dialogId2);
    expect(ContentDialogManager.dialogCount).to.eq(2);
    expect(screen.getByRole("button", {name: "MyTestButton"})).to.exist;
    expect(await screen.findByRole("button", {name: "MySecondTestButton"})).to.exist;

    ContentDialogManager.closeDialog(dialogId1);
    expect(ContentDialogManager.dialogCount).to.eq(1);
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "MyTestButton" })).to.be.null;
    });
    expect(screen.getByRole("button", {name: "MySecondTestButton"})).to.exist;

    ContentDialogManager.closeDialog(dialogId2);
    expect(ContentDialogManager.dialogCount).to.eq(0);
    expect(screen.queryByRole("button", {name: "MyTestButton"})).to.be.null;
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "MySecondTestButton" })).to.be.null;
    });
  });

  it("ContentDialogRenderer component with two dialogs and bring forward", async () => {
    const dialogId1 = "Test1";
    const reactNode1 = <ContentDialog
      opened={true}
      title="My Title"
      dialogId={dialogId1}>
      <button>MyTestButton</button>
    </ContentDialog>;

    const dialogId2 = "Test2";
    const reactNode2 = <ContentDialog
      opened={true}
      title="My Title 2"
      dialogId={dialogId2}>
      <button>MySecondTestButton</button>
    </ContentDialog>;

    render(<ContentDialogRenderer />);

    expect(ContentDialogManager.dialogCount).to.eq(0);

    ContentDialogManager.openDialog(reactNode1, dialogId1);
    await waitFor(() => {
      expect(ContentDialogManager.activeDialog).to.eq(reactNode1);
    });

    ContentDialogManager.openDialog(reactNode2, dialogId2);
    await waitFor(() => {
      expect(ContentDialogManager.activeDialog).to.eq(reactNode2);
    });

    // Click the 2nd dialog - should stay forward
    await theUserTo.click(await screen.findByRole("button", {name: "MySecondTestButton"}));
    expect(ContentDialogManager.activeDialog).to.eq(reactNode2);

    // Click the 1st dialog to bring it forward
    await theUserTo.click(screen.getByRole("button", {name: "MyTestButton"}));
    expect(ContentDialogManager.activeDialog).to.eq(reactNode1);

    ContentDialogManager.closeDialog(dialogId1);
    expect(ContentDialogManager.activeDialog).to.eq(reactNode2);

    ContentDialogManager.closeDialog(dialogId2);
  });

  it("calls Internal static for everything", () => {
    const [validateMethod, validateProp] = createStaticInternalPassthroughValidators(ContentDialogManager, InternalContentDialogManager);

    validateMethod("closeAll");
    validateMethod(["closeDialog", "close"], "id");
    validateMethod(["getDialogInfo", "getInfo"], "id");
    validateMethod(["getDialogZIndex", "getZIndex"], "id");
    validateMethod("handlePointerDownEvent", {} as any, "id", sinon.spy());
    validateMethod("initialize");
    validateMethod(["openDialog", "open"], "", "id", document);
    validateMethod("update");
    validateProp(["activeDialog", "active"]);
    validateProp(["dialogCount", "count"]);
    validateProp("dialogManager");
    validateProp("dialogs");
    validateProp("onContentDialogChangedEvent");
  });

});
