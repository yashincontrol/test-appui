/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { expect } from "chai";
import * as React from "react";
import * as sinon from "sinon";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { IModelApp, MockRender, QuantityType, QuantityTypeKey } from "@itwin/core-frontend";
import TestUtils, { getButtonWithText, handleError, selectChangeValueByText, stubScrollIntoView } from "../TestUtils";
import { getQuantityFormatsSettingsManagerEntry } from "../../appui-react/settings/quantityformatting/QuantityFormat";
import { ModalDialogRenderer } from "../../appui-react/dialog/ModalDialogManager";
import { FormatProps, UnitSystemKey } from "@itwin/core-quantity";
import { UiFramework } from "../../appui-react/UiFramework";

describe("QuantityFormatSettingsPage", () => {
  const sandbox = sinon.createSandbox();

  before(async () => {
    await TestUtils.initializeUiFramework();
    await MockRender.App.startup();
  });

  after(async () => {
    TestUtils.terminateUiFramework();
    await MockRender.App.shutdown();
  });

  beforeEach(async () => {
    await IModelApp.quantityFormatter.reinitializeFormatAndParsingsMaps(new Map<UnitSystemKey, Map<QuantityTypeKey, FormatProps>>(), "imperial");
  });

  afterEach(() => {
    sandbox.restore();
  });

  stubScrollIntoView();

  it("will handle internal unit system change", async () => {
    const settingsEntry = getQuantityFormatsSettingsManagerEntry(10);
    expect(settingsEntry.itemPriority).to.eql(10);

    const unitSystemSpy = sandbox.spy(IModelApp.quantityFormatter, "setActiveUnitSystem");

    const wrapper = render(settingsEntry.page);

    const selectButton = wrapper.getByTestId("unitSystemSelector");

    // initial unit system value should be imperial so no change expected for initial change.
    selectChangeValueByText(selectButton, "presentationUnitSystem.BritishImperial", handleError);
    expect(unitSystemSpy).to.be.callCount(0);

    selectChangeValueByText(selectButton, "presentationUnitSystem.Metric", handleError);
    expect(unitSystemSpy).to.be.callCount(1);
    unitSystemSpy.resetHistory();
    await TestUtils.flushAsyncOperations();

    selectChangeValueByText(selectButton, "presentationUnitSystem.USCustomary", handleError);
    expect(unitSystemSpy).to.be.callCount(1);
    unitSystemSpy.resetHistory();
    await TestUtils.flushAsyncOperations();

    selectChangeValueByText(selectButton, "presentationUnitSystem.USSurvey", handleError);
    expect(unitSystemSpy).to.be.callCount(1);
    unitSystemSpy.resetHistory();
    await TestUtils.flushAsyncOperations();

    selectChangeValueByText(selectButton, "presentationUnitSystem.BritishImperial", handleError);
    expect(unitSystemSpy).to.be.callCount(1);
    await TestUtils.flushAsyncOperations();

    wrapper.unmount();
  });

  it("will listen for external unit system changes", async () => {
    const settingsEntry = getQuantityFormatsSettingsManagerEntry(10, { initialQuantityType: QuantityType.Length });
    expect(settingsEntry.itemPriority).to.eql(10);

    const wrapper = render(settingsEntry.page);
    await IModelApp.quantityFormatter.setActiveUnitSystem("metric", false);

    await waitFor(() => {
      const exampleFormat = wrapper.getByTestId("format-sample-formatted");
      expect(exampleFormat.textContent).to.eql("1234.56 m");
    });

    wrapper.unmount();
  });

  it("will render 3 units and process quantity type selection in list", async () => {
    await IModelApp.quantityFormatter.setActiveUnitSystem("imperial", false);

    const availableUnitSystems = new Set<UnitSystemKey>(["metric", "imperial", "usSurvey"]);
    const settingsEntry = getQuantityFormatsSettingsManagerEntry(10, { initialQuantityType: QuantityType.LengthEngineering, availableUnitSystems });
    expect(settingsEntry.itemPriority).to.eql(10);

    const wrapper = render(settingsEntry.page);
    await TestUtils.flushAsyncOperations();

    const listSelector = `ul.uifw-quantity-types`;
    const categoryList = wrapper.container.querySelector(listSelector);
    expect(categoryList!.getAttribute("data-value")).to.eql("QuantityTypeEnumValue-9");

    const dataValueSelector = `li[data-value='QuantityTypeEnumValue-7']`;
    const categoryEntry = wrapper.container.querySelector(dataValueSelector);
    expect(categoryEntry).not.to.be.null;
    fireEvent.click(categoryEntry!);
    await TestUtils.flushAsyncOperations();
    expect(categoryList!.getAttribute("data-value")).to.eql("QuantityTypeEnumValue-7");

    wrapper.unmount();
  });

  it("save prop changes", async () => {
    const availableUnitSystems = new Set<UnitSystemKey>(["metric", "imperial", "usSurvey"]);
    const settingsEntry = getQuantityFormatsSettingsManagerEntry(10, { initialQuantityType: QuantityType.LengthEngineering, availableUnitSystems });
    expect(settingsEntry.itemPriority).to.eql(10);

    const wrapper = render(<div>
      <ModalDialogRenderer />
      {settingsEntry.page}
    </div>);

    const setButton = getButtonWithText(wrapper.container, "settings.quantity-formatting.setButtonLabel", handleError);
    expect(setButton!.hasAttribute("disabled")).to.be.true;
    const clearButton = getButtonWithText(wrapper.container, "settings.quantity-formatting.clearButtonLabel", handleError);
    expect(clearButton!.hasAttribute("disabled")).to.be.true;

    const checkbox = wrapper.getByTestId("show-unit-label-checkbox");
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(setButton!.hasAttribute("disabled")).to.be.false;
    });
    fireEvent.click(setButton!);
    await waitFor(() => {
      expect(setButton!.hasAttribute("disabled")).to.be.true;
    });
    expect(clearButton!.hasAttribute("disabled")).to.be.false;
    fireEvent.click(clearButton!);
    await TestUtils.flushAsyncOperations();
    expect(clearButton!.hasAttribute("disabled")).to.be.true;

    wrapper.unmount();
  });

  it("will trigger modal and save prop changes", async () => {
    const availableUnitSystems = new Set<UnitSystemKey>(["metric", "imperial", "usSurvey"]);
    const settingsEntry = getQuantityFormatsSettingsManagerEntry(10, { initialQuantityType: QuantityType.LengthEngineering, availableUnitSystems });
    expect(settingsEntry.itemPriority).to.eql(10);

    const wrapper = render(<div>
      <ModalDialogRenderer />
      {settingsEntry.page}
    </div>);

    const setButton = getButtonWithText(wrapper.container, "settings.quantity-formatting.setButtonLabel", handleError);
    expect(setButton!.hasAttribute("disabled")).to.be.true;
    const clearButton = getButtonWithText(wrapper.container, "settings.quantity-formatting.clearButtonLabel", handleError);
    expect(clearButton!.hasAttribute("disabled")).to.be.true;

    const checkbox = wrapper.getByTestId("show-unit-label-checkbox");
    fireEvent.click(checkbox);
    await TestUtils.flushAsyncOperations();

    await waitFor(() => {
      expect(setButton!.hasAttribute("disabled")).to.be.false;
    });

    const dataValueSelector = `li[data-value='QuantityTypeEnumValue-7']`;
    const categoryEntry = wrapper.container.querySelector(dataValueSelector);
    expect(categoryEntry).not.to.be.null;
    fireEvent.click(categoryEntry!);
    await TestUtils.flushAsyncOperations();

    const yesButton = wrapper.container.querySelector("button.dialog-button-yes");
    fireEvent.click(yesButton!);
    await TestUtils.flushAsyncOperations();
    wrapper.unmount();
  });

  it("will trigger modal and don't save prop changes", async () => {
    const availableUnitSystems = new Set<UnitSystemKey>(["metric", "imperial", "usSurvey"]);
    const settingsEntry = getQuantityFormatsSettingsManagerEntry(10, { initialQuantityType: QuantityType.LengthEngineering, availableUnitSystems });
    expect(settingsEntry.itemPriority).to.eql(10);

    const wrapper = render(<div>
      <ModalDialogRenderer />
      {settingsEntry.page}
    </div>);

    const setButton = getButtonWithText(wrapper.container, "settings.quantity-formatting.setButtonLabel", handleError);
    expect(setButton!.hasAttribute("disabled")).to.be.true;
    const clearButton = getButtonWithText(wrapper.container, "settings.quantity-formatting.clearButtonLabel", handleError);
    expect(clearButton!.hasAttribute("disabled")).to.be.true;
    await TestUtils.flushAsyncOperations();

    const checkbox = wrapper.getByTestId("show-unit-label-checkbox");
    fireEvent.click(checkbox);
    await TestUtils.flushAsyncOperations();

    expect(setButton!.hasAttribute("disabled")).to.be.false;

    const dataValueSelector = `li[data-value='QuantityTypeEnumValue-7']`;
    const categoryEntry = wrapper.container.querySelector(dataValueSelector);
    expect(categoryEntry).not.to.be.null;
    fireEvent.click(categoryEntry!);
    await TestUtils.flushAsyncOperations();

    const noButton = wrapper.container.querySelector("button.dialog-button-no");
    fireEvent.click(noButton!);
    await TestUtils.flushAsyncOperations();

    wrapper.unmount();
  });

  it("will trigger modal by event from settings manager and don't save prop changes", async () => {
    const availableUnitSystems = new Set<UnitSystemKey>(["metric", "imperial", "usSurvey"]);
    const settingsEntry = getQuantityFormatsSettingsManagerEntry(10, { initialQuantityType: QuantityType.LengthEngineering, availableUnitSystems });
    expect(settingsEntry.itemPriority).to.eql(10);

    const wrapper = render(<div>
      <ModalDialogRenderer />
      {settingsEntry.page}
    </div>);

    const setButton = getButtonWithText(wrapper.container, "settings.quantity-formatting.setButtonLabel", handleError);
    expect(setButton!.hasAttribute("disabled")).to.be.true;
    const clearButton = getButtonWithText(wrapper.container, "settings.quantity-formatting.clearButtonLabel", handleError);
    expect(clearButton!.hasAttribute("disabled")).to.be.true;
    await TestUtils.flushAsyncOperations();

    const checkbox = wrapper.getByTestId("show-unit-label-checkbox");
    const addListenerSpy = sinon.spy(UiFramework.settingsManager.onProcessSettingsTabActivation, "addListener");
    fireEvent.click(checkbox);
    await TestUtils.flushAsyncOperations();

    expect(setButton!.hasAttribute("disabled")).to.be.false;

    // Wait that the handler have been updated, otherwise it compares with the previous version...
    // Visual change already have been processed but scope didnt upddate.
    await waitFor(() => {
      expect(addListenerSpy).to.have.been.called;
    });

    UiFramework.settingsManager.onProcessSettingsTabActivation.emit({ requestedSettingsTabId: "unknown", tabSelectionFunc: () => { } });

    await screen.findByText(/dialog\.no/);
    const noButton = wrapper.container.querySelector("button.dialog-button-no");
    fireEvent.click(noButton!);

    wrapper.unmount();
  });

});
