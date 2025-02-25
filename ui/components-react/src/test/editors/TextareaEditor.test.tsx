/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { expect } from "chai";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import sinon from "sinon";
import * as React from "react";
import {
  InputEditorSizeParams, MultilineTextEditorParams, PropertyEditorInfo,
  PropertyEditorParamTypes, SpecialKey, StandardEditorNames,
} from "@itwin/appui-abstract";
import { TextareaEditor } from "../../components-react/editors/TextareaEditor";
import { EditorContainer } from "../../components-react/editors/EditorContainer";
import TestUtils, { styleMatch, userEvent } from "../TestUtils";

describe("<TextareaEditor />", () => {
  let theUserTo: ReturnType<typeof userEvent.setup>;
  beforeEach(()=>{
    theUserTo = userEvent.setup();
  });

  before(async () => {
    await TestUtils.initializeUiComponents();
  });

  it("renders correctly with style and no record", async () => {
    render(<TextareaEditor style={{ color: "red" }} />);
    await theUserTo.click(screen.getByTestId("components-popup-button"));

    expect(screen.getByRole("textbox"))
      .to.satisfy(styleMatch({color: "red"}));
  });

  it("getValue returns proper value after componentDidMount & setState", async () => {
    const record = TestUtils.createPrimitiveStringProperty("Test", "MyValue");
    render(<TextareaEditor propertyRecord={record} />);
    await waitFor(() => expect(screen.getByTestId("components-popup-button").firstElementChild).to.have.property("innerHTML", "MyValue"));
  });

  it("HTML input onChange updates value", async () => {
    const record = TestUtils.createPrimitiveStringProperty("Test1", "MyValue");
    render(<TextareaEditor propertyRecord={record} />);

    await theUserTo.click(screen.getByTestId("components-popup-button"));

    await theUserTo.clear(screen.getByRole("textbox"));
    await theUserTo.type(screen.getByRole("textbox"), "My new value");
    expect(screen.getByTestId("components-popup-button").firstElementChild).to.have.property("innerHTML", "My new value");
  });

  it("new props updates the display", async () => {
    const record = TestUtils.createPrimitiveStringProperty("Test", "MyValue");
    const { rerender } = render(<TextareaEditor propertyRecord={record} />);

    const testValue = "MyNewValue";
    const newRecord = TestUtils.createPrimitiveStringProperty("Test", testValue);
    rerender(<TextareaEditor propertyRecord={newRecord} />);
    await waitFor(() => expect(screen.getByTestId("components-popup-button").firstElementChild).to.have.property("innerHTML", testValue));
  });

  it("should support InputEditorSize params", async () => {
    const size = 4;
    const maxLength = 60;
    const editorInfo: PropertyEditorInfo = {
      params: [
        {
          type: PropertyEditorParamTypes.InputEditorSize,
          size,
          maxLength,
        } as InputEditorSizeParams,
      ],
    };

    const record = TestUtils.createPrimitiveStringProperty("Test", "MyValue", "Test", editorInfo);
    render(<TextareaEditor propertyRecord={record} />);

    await theUserTo.click(screen.getByTestId("components-popup-button"));

    expect(screen.getByRole("textbox"))
      .to.satisfy(styleMatch({minWidth: "3em"}))
      .and.to.have.property("maxLength", 60);
  });

  it("should support MultilineTextEditor Params", async () => {
    const editorInfo: PropertyEditorInfo = {
      params: [
        {
          type: PropertyEditorParamTypes.MultilineText,
          rows: 4,
        } as MultilineTextEditorParams,
      ],
    };

    const record = TestUtils.createPrimitiveStringProperty("Test", "MyValue", "Test", editorInfo);
    render(<TextareaEditor propertyRecord={record} />);
    await theUserTo.click(screen.getByTestId("components-popup-button"));

    expect(screen.getByRole("textbox"))
      .to.have.property("rows", 4);
  });

  it("calls onCommit on OK button click", async () => {
    const spyOnCommit = sinon.spy();
    const record = TestUtils.createPrimitiveStringProperty("Test1", "MyValue");
    render(<TextareaEditor propertyRecord={record} onCommit={spyOnCommit} />);

    await theUserTo.click(screen.getByTestId("components-popup-button"));
    await theUserTo.click(screen.getByTestId("components-popup-ok-button"));

    expect(spyOnCommit.calledOnce).to.be.true;

  });

  it("calls onCancel on Cancel button click", async () => {
    const spyOnCancel = sinon.spy();
    const record = TestUtils.createPrimitiveStringProperty("Test1", "MyValue");
    render(<TextareaEditor propertyRecord={record} onCancel={spyOnCancel} />);

    await theUserTo.click(screen.getByTestId("components-popup-button"));
    await theUserTo.click(screen.getByTestId("components-popup-cancel-button"));

    expect(spyOnCancel.calledOnce).to.be.true;
  });

  it("renders editor for 'text' type and 'multi=line' editor using TextareaEditor", () => {
    const editorInfo: PropertyEditorInfo = {
      name: StandardEditorNames.MultiLine,
    };
    const propertyRecord = TestUtils.createPrimitiveStringProperty("Test", "MyValue", undefined, editorInfo);
    const renderedComponent = render(<EditorContainer propertyRecord={propertyRecord} title="abc" onCommit={() => { }} onCancel={() => { }} />);
    expect(renderedComponent.container.querySelector(".components-textarea-editor")).to.not.be.empty;

  });

  it("calls onCancel on Escape on button", async () => {
    const editorInfo: PropertyEditorInfo = {
      name: StandardEditorNames.MultiLine,
    };
    const propertyRecord = TestUtils.createPrimitiveStringProperty("Test", "MyValue", undefined, editorInfo);

    const spyOnCommit = sinon.spy();
    const spyOnCancel = sinon.spy();
    const renderedComponent = render(<EditorContainer propertyRecord={propertyRecord} title="abc" onCommit={spyOnCommit} onCancel={spyOnCancel} />);
    expect(renderedComponent).not.to.be.undefined;
    const popupButton = await waitFor(() => renderedComponent.getByTestId("components-popup-button"));
    expect(popupButton).not.to.be.null;

    fireEvent.keyDown(popupButton, { key: SpecialKey.Escape });
    await TestUtils.flushAsyncOperations();
    expect(spyOnCancel.calledOnce).to.be.true;
  });

});
