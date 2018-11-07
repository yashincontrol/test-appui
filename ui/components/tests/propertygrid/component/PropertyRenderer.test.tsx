/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import { expect } from "chai";
import { mount } from "enzyme";
import sinon from "sinon";
import * as React from "react";
import { Orientation } from "@bentley/ui-core";
import { SamplePropertyRecord } from "../PropertyTestHelpers";
import { PropertyRenderer } from "../../../src/propertygrid/component/PropertyRenderer";
import TestUtils from "../../TestUtils";
import { PropertyValueRendererManager } from "../../../src/properties/ValueRendererManager";

describe("PropertyRenderer", () => {
  let propertyRecord: SamplePropertyRecord;

  before(() => {
    propertyRecord = new SamplePropertyRecord("CADID", 0, "0000 0005 00E0 02D8");

    TestUtils.initializeUiComponents();
  });

  it("triggers selection if property gets clicked once", () => {
    const onClick = sinon.spy();

    const propertyRenderer = mount(
      <PropertyRenderer
        orientation={Orientation.Horizontal}
        propertyRecord={propertyRecord}
        onClick={onClick}
      />);

    propertyRenderer.find(".components-property-record--horizontal").first().simulate("click");

    expect(onClick.callCount).to.be.eq(1);
  });

  it("triggers deselection if property gets clicked twice", () => {
    const onClick = sinon.spy();

    const propertyRenderer = mount(
      <PropertyRenderer
        orientation={Orientation.Horizontal}
        propertyRecord={propertyRecord}
        onClick={onClick}
      />);

    const propertyElement = propertyRenderer.find(".components-property-record--horizontal").first();
    propertyElement.simulate("click");
    propertyElement.simulate("click");

    expect(onClick.callCount).to.be.eq(2);
  });

  it("does not throw if property is clicked but onPropertySelected/Deselected props are not supplied", () => {
    const propertyRenderer = mount(
      <PropertyRenderer
        orientation={Orientation.Horizontal}
        propertyRecord={propertyRecord}
      />);

    const propertyElement = propertyRenderer.find(".components-property-record--horizontal").first();
    propertyElement.simulate("click");
    propertyElement.simulate("click");
  });

  it("updates displayed value if propertyRecord changes", async () => {
    const propertyRenderer = mount(
      <PropertyRenderer
        orientation={Orientation.Horizontal}
        propertyRecord={propertyRecord}
      />);

    const recordValue = "ChangedValue";

    propertyRenderer.setProps({ propertyRecord: new SamplePropertyRecord("Label", 0, recordValue) });

    await TestUtils.flushAsyncOperations();

    const displayValueWrapper = mount(<div>{propertyRenderer.state("displayValue")}</div>);

    expect(displayValueWrapper.html().indexOf(recordValue)).to.be.greaterThan(-1);
  });

  it("renders as selected when isSelected prop is true", () => {
    const propertyRenderer = mount(
      <PropertyRenderer
        orientation={Orientation.Horizontal}
        propertyRecord={propertyRecord}
        isSelected={true}
      />);

    expect(propertyRenderer.find(".components--selected").first().exists()).to.be.true;
  });

  it("renders as clickable when onClick prop is given", () => {
    const propertyRenderer = mount(
      <PropertyRenderer
        orientation={Orientation.Horizontal}
        propertyRecord={propertyRecord}
        onClick={() => { }}
      />);

    expect(propertyRenderer.find(".components--clickable").first().exists()).to.be.true;
  });

  it("renders value differently if provided with custom propertyValueRendererManager", async () => {
    class RendererManager extends PropertyValueRendererManager {
      public async render({ }) {
        return (<span>Test</span>);
      }
    }

    const propertyRenderer = mount(
      <PropertyRenderer
        orientation={Orientation.Horizontal}
        propertyRecord={propertyRecord}
        onClick={() => { }}
        propertyValueRendererManager={new RendererManager()}
      />);

    await TestUtils.flushAsyncOperations();

    expect(propertyRenderer.find(".components-property-record-value").text()).to.be.eq("Test");
  });

  it("handles mouse enter by setting isHover", () => {
    const propertyRenderer = mount(
      <PropertyRenderer
        orientation={Orientation.Horizontal}
        propertyRecord={propertyRecord}
        onClick={() => { }}
      />);

    const clickable = propertyRenderer.find(".components--clickable");
    expect(clickable.length).to.eq(1);

    clickable.simulate("mouseEnter");
    propertyRenderer.update();
    expect(propertyRenderer.find(".components--hover").length).to.eq(1);

    clickable.simulate("mouseLeave");
    propertyRenderer.update();
    expect(propertyRenderer.find(".components--hover").length).to.eq(0);
  });

  it("turns off isHover if selected", () => {
    const propertyRenderer = mount(
      <PropertyRenderer
        orientation={Orientation.Horizontal}
        propertyRecord={propertyRecord}
        onClick={() => { }}
      />);

    const clickable = propertyRenderer.find(".components--clickable");
    expect(clickable.length).to.eq(1);

    clickable.simulate("mouseEnter");
    propertyRenderer.update();

    expect(propertyRenderer.find(".components--hover").length).to.eq(1);

    propertyRenderer.setProps({ isSelected: true });
    propertyRenderer.update();
    expect(propertyRenderer.find(".components--hover").length).to.eq(0);
  });

  it("renders an editor correctly", () => {
    const propertyRenderer = mount(
      <PropertyRenderer
        orientation={Orientation.Horizontal}
        propertyRecord={propertyRecord}
        isEditing={true}
      />);

    expect(propertyRenderer.find(".components-text-editor").length).to.eq(1);
  });

  it("when editing, calls onEditCommit on Enter key", () => {
    const spyMethod = sinon.spy();
    const propertyRenderer = mount(
      <PropertyRenderer
        orientation={Orientation.Horizontal}
        propertyRecord={propertyRecord}
        isEditing={true}
        onEditCommit={spyMethod}
      />);

    const inputNode = propertyRenderer.find("input");
    expect(inputNode.length).to.eq(1);

    inputNode.simulate("keyDown", { key: "Enter" });
    expect(spyMethod.calledOnce).to.be.true;
  });

  it("when editing, calls onEditCancel on Escape key", () => {
    const spyMethod = sinon.spy();
    const propertyRenderer = mount(
      <PropertyRenderer
        orientation={Orientation.Horizontal}
        propertyRecord={propertyRecord}
        isEditing={true}
        onEditCancel={spyMethod}
      />);

    const inputNode = propertyRenderer.find("input");
    expect(inputNode.length).to.eq(1);

    inputNode.simulate("keyDown", { key: "Escape" });
    expect(spyMethod.calledOnce).to.be.true;
  });

});
