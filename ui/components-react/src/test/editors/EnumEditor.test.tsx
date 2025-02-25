/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { expect } from "chai";
import * as React from "react";
import sinon from "sinon";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { SpecialKey } from "@itwin/appui-abstract";
import { EditorContainer } from "../../components-react/editors/EditorContainer";
import { EnumEditor } from "../../components-react/editors/EnumEditor";
import TestUtils, { MineDataController, styleMatch, userEvent } from "../TestUtils";
import { PropertyEditorManager } from "../../components-react/editors/PropertyEditorManager";
import { stubScrollIntoView } from "../test-helpers/misc";

describe("<EnumEditor />", () => {
  let theUserTo: ReturnType<typeof userEvent.setup>;
  beforeEach(()=>{
    theUserTo = userEvent.setup();
  });
  stubScrollIntoView();

  it("render without record", () => {
    render(<EnumEditor style={{width: 400}}/>);
    expect(screen.getByTestId("components-select-editor"))
      .to.satisfy(styleMatch({width: "400px"}));
  });

  it("uses record value", async () => {
    const record = TestUtils.createEnumProperty("Test", 0);
    render(<EnumEditor propertyRecord={record} />);

    await waitFor(() => expect(screen.getByText("Yellow")).to.exist);
  });

  it("HTML select onChange updates string value", async () => {
    const record = TestUtils.createEnumProperty("Test1", "0");
    const spyOnCommit = sinon.spy();
    render(<EnumEditor propertyRecord={record} onCommit={spyOnCommit} />);
    await theUserTo.click(screen.getByTestId("components-select-editor").firstElementChild!);
    await theUserTo.click(screen.getByRole("option", {name: "Green"}));
    expect(spyOnCommit.calledOnce).to.be.true;
  });

  it("HTML select onChange updates numeric value", async () => {
    const record = TestUtils.createEnumProperty("Test1", 0);
    const spyOnCommit = sinon.spy();
    render(<EnumEditor propertyRecord={record} onCommit={spyOnCommit} />);
    await theUserTo.click(screen.getByTestId("components-select-editor").firstElementChild!);
    await theUserTo.click(screen.getByRole("option", {name: "Green"}));
    expect(spyOnCommit.calledOnce).to.be.true;
  });

  it("onCommit should not be called for escape", async () => {
    const propertyRecord = TestUtils.createEnumProperty("Test", 0);
    const spyOnCommit = sinon.spy();
    const wrapper = render(<EditorContainer propertyRecord={propertyRecord} title="abc" onCommit={spyOnCommit} onCancel={() => { }} />);
    await TestUtils.flushAsyncOperations();
    const selectNode = wrapper.getByTestId("components-select-editor");
    expect(selectNode).not.to.be.null;

    fireEvent.keyDown(selectNode, { key: SpecialKey.Escape });
    await TestUtils.flushAsyncOperations();
    expect(spyOnCommit.called).to.be.false;
  });

  it("new props updates the display", async () => {
    const record = TestUtils.createEnumProperty("Test", 0);
    const { rerender } = render(<EnumEditor propertyRecord={record} />);
    await waitFor(() => expect(screen.getByText("Yellow")).to.exist);

    const testValue = 1;
    const newRecord = TestUtils.createEnumProperty("Test", testValue);
    rerender(<EnumEditor propertyRecord={newRecord} />);
    await waitFor(() => expect(screen.getByText("Red")).to.exist);
  });

  it("should not commit if DataController fails to validate", async () => {
    PropertyEditorManager.registerDataController("myData", MineDataController);
    const record = TestUtils.createEnumProperty("Test", 0);
    record.property.dataController = "myData";

    const spyOnCommit = sinon.spy();
    const spyOnCancel = sinon.spy();
    const renderedComponent = render(<EditorContainer propertyRecord={record} title="abc" onCommit={spyOnCommit} onCancel={spyOnCancel} />);
    expect(renderedComponent).not.to.be.undefined;

    const selectNode = renderedComponent.getByTestId("components-select-editor");
    expect(selectNode).not.to.be.null;

    fireEvent.blur(selectNode);
    await TestUtils.flushAsyncOperations();
    expect(spyOnCommit.called).to.be.false;

    fireEvent.keyDown(selectNode, { key: SpecialKey.Escape });
    await TestUtils.flushAsyncOperations();
    expect(spyOnCancel.called).to.be.true;

    PropertyEditorManager.deregisterDataController("myData");
  });

  it("keyDown should propagate up", async () => {
    const propertyRecord = TestUtils.createEnumProperty("Test", 0);
    const spyParent = sinon.spy();
    const wrapper = render(
      <div onKeyDown={spyParent} role="presentation">
        <EditorContainer propertyRecord={propertyRecord} title="abc" onCommit={() => { }} onCancel={() => { }} />
      </div>
    );
    await TestUtils.flushAsyncOperations();
    const selectNode = wrapper.getByTestId("components-select-editor");
    expect(selectNode).not.to.be.null;

    fireEvent.keyDown(selectNode, { key: SpecialKey.PageDown });
    await TestUtils.flushAsyncOperations();
    expect(spyParent.called).to.be.true;
  });

});
