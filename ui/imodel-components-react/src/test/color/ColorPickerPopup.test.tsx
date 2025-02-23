/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { expect } from "chai";
import React from "react";
import sinon from "sinon";
import { ColorByName, ColorDef } from "@itwin/core-common";
import { fireEvent, render } from "@testing-library/react";
import { RelativePosition, SpecialKey } from "@itwin/appui-abstract";
import { TestUtils } from "../TestUtils";
import { ColorPickerPopup } from "../../imodel-components-react/color/ColorPickerPopup";

describe("<ColorPickerPopup/>", () => {
  const colorDef = ColorDef.create(ColorByName.blue);

  before(async () => {
    await TestUtils.initializeUiIModelComponents();
  });

  after(() => {
    TestUtils.terminateUiIModelComponents();
  });

  it("should render", () => {
    const renderedComponent = render(<ColorPickerPopup initialColor={colorDef} />);
    expect(renderedComponent).not.to.be.undefined;
    expect(renderedComponent.container.querySelector(".components-caret")).to.be.null;
  });

  it("should render with caret", () => {
    const renderedComponent = render(<ColorPickerPopup initialColor={colorDef} showCaret />);
    expect(renderedComponent).not.to.be.undefined;
    expect(renderedComponent.container.querySelector(".components-caret")).not.to.be.null;
  });

  it("button press should open popup and allow color selection", async () => {
    const spyOnColorPick = sinon.spy();

    function handleColorPick(color: ColorDef): void {
      expect(color.tbgr).to.be.equal(ColorByName.red);
      spyOnColorPick();
    }

    const renderedComponent = render(<ColorPickerPopup initialColor={colorDef} onColorChange={handleColorPick} showCaret />);
    expect(renderedComponent.getByTestId("components-colorpicker-popup-button")).to.exist;
    const pickerButton = renderedComponent.getByTestId("components-colorpicker-popup-button");
    expect(pickerButton.tagName).to.be.equal("BUTTON");
    expect(renderedComponent.getByTestId("caret-down")).not.to.be.null;
    fireEvent.click(pickerButton);
    expect(renderedComponent.getByTestId("caret-up")).not.to.be.null;

    const panel = renderedComponent.getByTestId("core-popup");
    const colorSwatch = panel.querySelector(".iui-color-swatch") as HTMLElement;
    expect(colorSwatch).not.to.be.null;
    fireEvent.click(colorSwatch);
    expect(spyOnColorPick).to.be.calledOnce;
  });

  it("button press should open popup and allow color selection of specified preset", async () => {
    const spyOnColorPick = sinon.spy();

    function handleColorPick(color: ColorDef): void {
      expect(color.tbgr).to.be.equal(ColorByName.green);
      spyOnColorPick();
    }

    const renderedComponent = render(<ColorPickerPopup initialColor={colorDef} popupPosition={RelativePosition.BottomRight} colorDefs={[ColorDef.green, ColorDef.black, ColorDef.red]} onColorChange={handleColorPick} />);
    expect(renderedComponent.getByTestId("components-colorpicker-popup-button")).to.exist;
    const pickerButton = renderedComponent.getByTestId("components-colorpicker-popup-button");
    expect(pickerButton.tagName).to.be.equal("BUTTON");
    fireEvent.click(pickerButton);

    const panel = renderedComponent.getByTestId("core-popup");
    const colorSwatch = panel.querySelector(".iui-color-swatch") as HTMLElement;
    expect(colorSwatch).not.to.be.null;
    fireEvent.click(colorSwatch);
    expect(spyOnColorPick).to.be.calledOnce;
  });

  it("readonly - button press should not open popup", async () => {
    const renderedComponent = render(<ColorPickerPopup initialColor={colorDef} colorDefs={[ColorDef.blue, ColorDef.black, ColorDef.red]} readonly={true} />);
    const pickerButton = renderedComponent.getByTestId("components-colorpicker-popup-button");
    expect(pickerButton.tagName).to.be.equal("BUTTON");
    fireEvent.click(pickerButton);

    const corePopupDiv = renderedComponent.queryByTestId("core-popup");
    expect(corePopupDiv).not.to.be.null;
    if (corePopupDiv)
      expect(corePopupDiv.classList.contains("visible")).to.be.false;
  });

  it("button press should open popup and allow trigger color selection when popup closed", async () => {
    const spyOnColorPopupClosed = sinon.spy();

    function handleColorPopupClosed(color: ColorDef): void {
      expect(color.tbgr).to.be.equal(ColorDef.green.tbgr);
      spyOnColorPopupClosed();
    }

    const renderedComponent = render(<ColorPickerPopup initialColor={colorDef} popupPosition={RelativePosition.BottomRight} colorDefs={[ColorDef.green, ColorDef.black, ColorDef.red]} onClose={handleColorPopupClosed} />);
    expect(renderedComponent.getByTestId("components-colorpicker-popup-button")).to.exist;
    const pickerButton = renderedComponent.getByTestId("components-colorpicker-popup-button");
    expect(pickerButton.tagName).to.be.equal("BUTTON");
    fireEvent.click(pickerButton);

    const panel = renderedComponent.getByTestId("core-popup");
    const colorSwatch = panel.querySelector(".iui-color-swatch") as HTMLElement;
    expect(colorSwatch).not.to.be.null;
    fireEvent.click(colorSwatch);

    fireEvent.click(pickerButton); /* close popup */
    expect(spyOnColorPopupClosed).to.be.calledOnce;
  });

  it("captureClicks property should stop mouse click propagation", async () => {
    const spyOnClick = sinon.spy();

    /* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */
    const renderedComponent = render(<div onClick={spyOnClick}>
      <ColorPickerPopup initialColor={colorDef} popupPosition={RelativePosition.BottomRight} colorDefs={[ColorDef.green, ColorDef.black, ColorDef.red]} captureClicks={true} />
    </div>);
    const pickerButton = renderedComponent.getByTestId("components-colorpicker-popup-button");
    fireEvent.click(pickerButton);
    expect(spyOnClick).not.to.be.called;

    const panel = renderedComponent.getByTestId("core-popup");
    const colorSwatch = panel.querySelector(".iui-color-swatch") as HTMLElement;
    expect(colorSwatch).not.to.be.null;
    fireEvent.click(colorSwatch);
    expect(spyOnClick).not.to.be.called;
  });

  it("mouse click should propagate if captureClicks not set to true", async () => {
    const spyOnClick = sinon.spy();

    /* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */
    const renderedComponent = render(<div onClick={spyOnClick}>
      <ColorPickerPopup initialColor={colorDef} popupPosition={RelativePosition.BottomRight} colorDefs={[ColorDef.green, ColorDef.black, ColorDef.red]} />
    </div>);
    const pickerButton = renderedComponent.getByTestId("components-colorpicker-popup-button");
    fireEvent.click(pickerButton);
    expect(spyOnClick).to.be.called;

    const popupDiv = renderedComponent.getByTestId("core-popup");
    const colorSwatch = popupDiv.querySelector(".iui-color-swatch") as HTMLElement;
    expect(colorSwatch).not.to.be.null;
    fireEvent.click(colorSwatch);
    expect(spyOnClick).to.be.calledTwice;
  });

  it("ensure update prop is handled", async () => {
    /* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */
    const renderedComponent = render(<div>
      <ColorPickerPopup initialColor={colorDef} popupPosition={RelativePosition.BottomRight} colorDefs={[ColorDef.green, ColorDef.black, ColorDef.red]} />
    </div>);

    let colorSwatch = renderedComponent.container.querySelector("div.components-colorpicker-button-color-swatch") as HTMLElement;
    expect(colorSwatch.style.backgroundColor).to.eql("rgb(0, 0, 255)");
    // ensure update prop is handled
    const newColorDef = ColorDef.create(ColorByName.green); // green = 0x008000,
    renderedComponent.rerender(<div><ColorPickerPopup initialColor={newColorDef} popupPosition={RelativePosition.BottomRight} colorDefs={[ColorDef.green, ColorDef.black, ColorDef.red]} /></div>);
    colorSwatch = renderedComponent.container.querySelector("div.components-colorpicker-button-color-swatch") as HTMLElement;
    expect(colorSwatch.style.backgroundColor).to.eql("rgb(0, 128, 0)");
  });

  it("ensure closing X is shown", async () => {
    const spyOnClick = sinon.spy();

    /* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */
    const renderedComponent = render(<div>
      <ColorPickerPopup initialColor={colorDef} popupPosition={RelativePosition.BottomRight}
        colorDefs={[ColorDef.green, ColorDef.black, ColorDef.red]} captureClicks={true} onClick={spyOnClick} />
    </div>);
    const pickerButton = renderedComponent.getByTestId("components-colorpicker-popup-button");
    fireEvent.click(pickerButton);

    const popupDiv = renderedComponent.getByTestId("core-popup");
    expect(popupDiv).not.to.be.undefined;

    const closeButton = renderedComponent.getByTestId("core-dialog-close");
    fireEvent.click(closeButton);
    await TestUtils.flushAsyncOperations();

    expect(renderedComponent.container.querySelector("button.core-dialog-close")).to.be.null;
  });

  it("ensure closing X is NOT shown", async () => {
    const spyOnClick = sinon.spy();

    /* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */
    const renderedComponent = render(<div>
      <ColorPickerPopup initialColor={colorDef} popupPosition={RelativePosition.BottomRight} hideCloseButton
        colorDefs={[ColorDef.green, ColorDef.black, ColorDef.red]} captureClicks={true} onClick={spyOnClick} />
    </div>);
    const pickerButton = renderedComponent.getByTestId("components-colorpicker-popup-button");
    fireEvent.click(pickerButton);

    const popupDiv = renderedComponent.getByTestId("core-popup");
    expect(popupDiv).not.to.be.undefined;

    expect(popupDiv.querySelector("button.core-dialog-close")).to.be.null;
  });

  it("ensure rgb values are shown", async () => {
    const spyOnClick = sinon.spy();
    const spyOnChange = sinon.spy();

    /* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */
    const renderedComponent = render(<div>
      <ColorPickerPopup initialColor={colorDef} popupPosition={RelativePosition.BottomRight} colorInputType="rgb"
        colorDefs={[ColorDef.green, ColorDef.black, ColorDef.red]} captureClicks={true} onClick={spyOnClick} onColorChange={spyOnChange} />
    </div>);
    const pickerButton = renderedComponent.getByTestId("components-colorpicker-popup-button");
    fireEvent.click(pickerButton);

    const popupDiv = renderedComponent.getByTestId("core-popup");
    const inputs = popupDiv.querySelectorAll('.iui-input[data-iui-size="small"]');
    fireEvent.change(inputs[0], { target: { value: "100" } });
    expect((inputs[0] as HTMLInputElement).value).to.eq("100");
    fireEvent.keyDown(inputs[0], { key: SpecialKey.Enter });
    spyOnChange.calledOnce.should.be.true;
  });

  it("ensure hsl values are shown", async () => {
    const spyOnClick = sinon.spy();
    const spyOnChange = sinon.spy();

    /* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */
    const renderedComponent = render(<div>
      <ColorPickerPopup initialColor={colorDef} popupPosition={RelativePosition.BottomRight} colorInputType="hsl"
        colorDefs={[ColorDef.green, ColorDef.black, ColorDef.red]} captureClicks={true} onClick={spyOnClick} onColorChange={spyOnChange} />
    </div>);
    const pickerButton = renderedComponent.getByTestId("components-colorpicker-popup-button");
    fireEvent.click(pickerButton);

    // const popupDiv = renderedComponent.container.querySelector(".iui-color-selection-wrapper") as HTMLElement;
    // expect(popupDiv).not.to.be.null;
    const popupDiv = renderedComponent.getByTestId("core-popup");
    const inputs = popupDiv.querySelectorAll('.iui-input[data-iui-size="small"]');
    fireEvent.change(inputs[0], { target: { value: "100" } });
    expect((inputs[0] as HTMLInputElement).value).to.eq("100");
    fireEvent.keyDown(inputs[0], { key: SpecialKey.Enter });
    spyOnChange.calledOnce.should.be.true;
  });

  it("should not show swatches", async () => {

    /* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */
    const renderedComponent = render(<div>
      <ColorPickerPopup initialColor={colorDef} popupPosition={RelativePosition.BottomRight}
        colorDefs={[]} captureClicks={true} />
    </div>);
    const pickerButton = renderedComponent.getByTestId("components-colorpicker-popup-button");
    fireEvent.click(pickerButton);

    const popupDiv = renderedComponent.getByTestId("core-popup");
    expect(popupDiv.querySelectorAll(".iui-color-swatch").length).to.be.eql(0);
  });

});
