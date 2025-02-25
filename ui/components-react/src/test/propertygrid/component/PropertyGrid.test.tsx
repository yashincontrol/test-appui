/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { expect } from "chai";
import * as faker from "faker";
import sinon from "sinon";
import * as moq from "typemoq";
import { PropertyRecord, PropertyValueFormat } from "@itwin/appui-abstract";
import { Orientation } from "@itwin/core-react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PropertyGrid } from "../../../components-react/propertygrid/component/PropertyGrid";
import { PropertyGridCommons } from "../../../components-react/propertygrid/component/PropertyGridCommons";
import {
  IPropertyDataProvider, PropertyCategory, PropertyData, PropertyDataChangeEvent,
} from "../../../components-react/propertygrid/PropertyDataProvider";
import { ResolvablePromise } from "../../test-helpers/misc";
import TestUtils, { selectorMatches, userEvent } from "../../TestUtils";

/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable deprecation/deprecation */

describe("PropertyGrid", () => {
  let theUserTo: ReturnType<typeof userEvent.setup>;
  const categories: PropertyCategory[] = [
    { name: "Group_1", label: "Group 1", expand: true },
    { name: "Group_2", label: "Group 2", expand: false },
  ];
  const records: PropertyRecord[] = [
    TestUtils.createPrimitiveStringProperty("CADID1", "0000 0005 00E0 02D8"),
    TestUtils.createPrimitiveStringProperty("CADID2", "0000 0005 00E0 02D9"),
  ];
  let dataProvider: IPropertyDataProvider;

  beforeEach(() => {
    theUserTo = userEvent.setup();
    const evt = new PropertyDataChangeEvent();
    dataProvider = {
      onDataChanged: evt,
      getData: async (): Promise<PropertyData> => ({
        label: PropertyRecord.fromString(faker.random.word()),
        description: faker.random.words(),
        categories,
        records: {
          Group_1: [records[0]],
          Group_2: [records[1]],
        },
      }),
    };
  });

  before(async () => {
    await TestUtils.initializeUiComponents();
  });

  after(() => {
    TestUtils.terminateUiComponents();
  });

  describe("rendering", () => {

    it("renders correctly horizontally", async () => {
      render(<PropertyGrid orientation={Orientation.Horizontal} dataProvider={dataProvider} isOrientationFixed={true} />);

      await waitFor(() =>
        expect(screen.getByRole("presentation"))
          .satisfy(selectorMatches(".components-property-list--horizontal *"))
      );
    });

    it("renders correctly vertically", async () => {
      render(<PropertyGrid orientation={Orientation.Vertical} dataProvider={dataProvider} isOrientationFixed={true} />);

      await waitFor(() =>
        expect(screen.getByRole("presentation"))
          .satisfy(selectorMatches(".components-property-list--vertical *"))
      );
    });

    it("renders PropertyCategoryBlocks correctly", async () => {
      render(<PropertyGrid orientation={Orientation.Horizontal} dataProvider={dataProvider} />);

      await waitFor(() => {
        expect(screen.getByText("Group 1")).to.exist;
        expect(screen.getByText("Group 2")).to.exist;
      });
    });

    it("renders nested property categories", async () => {
      const parentCategory: PropertyCategory = {
        name: "ParentCategory",
        label: "Parent",
        expand: true,
      };
      const childCategory: PropertyCategory = {
        name: "ChildCategory",
        label: "Child",
        expand: true,
      };
      parentCategory.childCategories = [childCategory];
      dataProvider = {
        onDataChanged: new PropertyDataChangeEvent(),
        getData: async (): Promise<PropertyData> => ({
          label: PropertyRecord.fromString(faker.random.word()),
          description: faker.random.words(),
          categories: [parentCategory],
          records: {
            [childCategory.name]: [TestUtils.createPrimitiveStringProperty("test", "Test", "Test")],
          },
        }),
      };
      render(<PropertyGrid dataProvider={dataProvider} />);

      await waitFor(() =>
        expect(screen.getByTitle("Test")).to.satisfy(selectorMatches([
          ".components-property-grid-wrapper",
          ".property-categories",
          ".property-categories",
          ".components-property-record-value",
          "span",
        ].join(" ")))
      );
    });

    it("renders PropertyCategoryBlock as collapsed when it gets clicked", async () => {
      render(<PropertyGrid orientation={Orientation.Horizontal} dataProvider={dataProvider} />);

      await waitFor(() => {
        screen.getByText("Group 1");
      });
      expect(screen.getByText("CADID1")).to.exist;

      await theUserTo.click(screen.getByText("Group 1"));

      expect(screen.queryByText("CADID1")).to.be.null;
    });

    it("keeps the collapsed state of PropertyCategoryBlock when data is refreshed", async () => {
      const rootCategory1: PropertyCategory = {
        name: "RootCategory1",
        label: "Root1",
        expand: true,
      };
      const childCategory: PropertyCategory = {
        name: "ChildCategory",
        label: "Child",
        expand: false,
      };
      rootCategory1.childCategories = [childCategory];
      const rootCategory2: PropertyCategory = {
        name: "RootCategory2",
        label: "Root2",
        expand: false,
      };
      dataProvider = {
        onDataChanged: new PropertyDataChangeEvent(),
        getData: async (): Promise<PropertyData> => ({
          label: PropertyRecord.fromString(faker.random.word()),
          description: faker.random.words(),
          categories: [rootCategory1, rootCategory2],
          records: {
            [childCategory.name]: [TestUtils.createPrimitiveStringProperty("test", "Test", "Test")],
          },
        }),
      };

      const { container, findByText } = render(
        <PropertyGrid orientation={Orientation.Horizontal} dataProvider={dataProvider} />,
      );
      const rootCategoryBlock1 = await findByText("Root1");
      const childCategoryBlock = await findByText("Child");
      const rootCategoryBlock2 = await findByText("Root2");

      fireEvent.click(childCategoryBlock);
      const childCategoryHeader = container.getElementsByClassName("iui-header")[1];
      expect(childCategoryHeader.textContent).to.be.equal("Child");
      expect(childCategoryHeader.getAttribute("aria-expanded")).to.be.equal("true");

      fireEvent.click(rootCategoryBlock1);
      const root1CategoryHeader = container.getElementsByClassName("iui-header")[0];
      expect(root1CategoryHeader.textContent).to.be.equal("Root1");
      expect(root1CategoryHeader.getAttribute("aria-expanded")).to.be.equal("false");

      fireEvent.click(rootCategoryBlock2);
      const root2CategoryHeader = container.getElementsByClassName("iui-header")[1];
      expect(root2CategoryHeader.textContent).to.be.equal("Root2");
      expect(root2CategoryHeader.getAttribute("aria-expanded")).to.be.equal("true");

      // Refresh PropertyGrid data.
      act(() => { dataProvider.onDataChanged.raiseEvent(); });
      await findByText("Root1");

      const categoryHeaders = container.getElementsByClassName("iui-header");
      expect(categoryHeaders.length).to.be.equal(2);
      expect(categoryHeaders[0].textContent).to.be.equal("Root1");
      expect(categoryHeaders[0].getAttribute("aria-expanded")).to.be.equal("false");
      expect(categoryHeaders[1].textContent).to.be.equal("Root2");
      expect(categoryHeaders[1].getAttribute("aria-expanded")).to.be.equal("true");
    });

    it("rerenders if data in the provider changes", async () => {
      render(<PropertyGrid orientation={Orientation.Horizontal} dataProvider={dataProvider} />);
      await waitFor(() => {
        expect(screen.getByText("Group 1")).to.exist;
      });

      dataProvider.getData = async (): Promise<PropertyData> => ({
        label: PropertyRecord.fromString(faker.random.word()),
        description: faker.random.words(),
        categories: [...categories, { name: "Group_3", label: "Group 3", expand: false }],
        records: {
          Group_1: [records[0]],
          Group_2: [records[1]],
          Group_3: [],
        },
      });
      dataProvider.onDataChanged.raiseEvent();

      await waitFor(() => {
        expect(screen.getByText("Group 3")).to.exist;
      });
    });

    it("rerenders when provider changes", async () => {
      const { rerender } = render(<PropertyGrid orientation={Orientation.Horizontal} dataProvider={dataProvider} />);
      await waitFor(() => {
        expect(screen.getByText("Group 1")).to.exist;
      });

      const provider2 = {
        onDataChanged: new PropertyDataChangeEvent(),
        getData: async (): Promise<PropertyData> => ({
          label: PropertyRecord.fromString("two"),
          categories: [categories[0]],
          records: {
            Group_1: [PropertyRecord.fromString("test", "Test")],
          },
        }),
      };

      rerender(<PropertyGrid orientation={Orientation.Horizontal} dataProvider={provider2} />);

      await waitFor(() => {
        expect(screen.getByTitle("test")).to.exist;
      });
    });

    it("doesn't rerender on intermediate data changes", async () => {
      const data: PropertyData = {
        label: PropertyRecord.fromString(faker.random.word()),
        categories: [{ label: faker.random.word(), name: "test", expand: true }],
        records: {
          test: [
            new PropertyRecord(
              { valueFormat: PropertyValueFormat.Primitive, displayValue: faker.random.word() },
              { typename: faker.database.type(), name: faker.random.word(), displayLabel: faker.random.word() }),
          ],
        },
      };
      const dataPromise = new ResolvablePromise<PropertyData>();
      const dataFake = sinon.fake.returns(dataPromise);
      dataProvider.getData = dataFake;

      // first render
      render(<PropertyGrid orientation={Orientation.Horizontal} dataProvider={dataProvider} />);
      expect(dataFake).to.be.calledOnce;

      // simulate multiple onDataChanged calls
      for (let i = 1; i <= 10; ++i)
        dataProvider.onDataChanged.raiseEvent();

      // resolve the data promise
      await dataPromise.resolve(data);

      // expect data to be requested one more time for the last change,
      // but not for intermediate ones
      expect(dataFake).to.be.calledTwice;
    });

    it("changes orientation when props change", async () => {
      const { rerender } = render(
        <PropertyGrid
          orientation={Orientation.Horizontal}
          dataProvider={dataProvider}
          isOrientationFixed={true}
        />);

      await waitFor(() =>
        expect(screen.getByTitle("CADID1")).to.satisfy(selectorMatches([
          ".components-property-list--horizontal",
          "span",
        ].join(" ")))
      );

      rerender(
        <PropertyGrid
          orientation={Orientation.Vertical}
          dataProvider={dataProvider}
          isOrientationFixed={true}
        />);

      await waitFor(() =>
        expect(screen.getByTitle("CADID1")).to.satisfy(selectorMatches([
          ".components-property-list--vertical",
          "span",
        ].join(" ")))
      );
    });

    // Spent a couple of hours, could not figure how to test this with RTL and Mocha...
    // describe("responsive behavior", () => {

    //   it("changes orientation when width is lower than 300", async () => {
    //     render(
    //       <PropertyGrid
    //         dataProvider={dataProvider}
    //         horizontalOrientationMinWidth={275}
    //         isOrientationFixed={false}
    //       />);

    //     await TestUtils.flushAsyncOperations();
    //     propertyGridMount.update();

    //     const resizeDetector = propertyGridMount.find(ResizableContainerObserver);
    //     expect(resizeDetector.length).to.eq(1);

    //     resizeDetector.prop("onResize")!(250, 400);
    //     propertyGridMount.update();

    //     expect(propertyGridMount.state("orientation")).to.be.eq(Orientation.Vertical);

    //     resizeDetector.prop("onResize")!(274, 400);
    //     propertyGridMount.update();

    //     expect(propertyGridMount.state("orientation")).to.be.eq(Orientation.Vertical);

    //     resizeDetector.prop("onResize")!(400, 400);
    //     propertyGridMount.update();

    //     expect(propertyGridMount.state("orientation")).to.be.eq(Orientation.Horizontal);

    //     resizeDetector.prop("onResize")!(400, 500);
    //     propertyGridMount.update();

    //     expect(propertyGridMount.state("orientation")).to.be.eq(Orientation.Horizontal);
    //   });

    // });

  });

  describe("property selection", () => {
    it("calls onPropertySelectionChanged when property gets clicked and selection is enabled", async () => {
      const onPropertySelectionChanged = sinon.spy();
      render(
        <PropertyGrid
          orientation={Orientation.Horizontal}
          dataProvider={dataProvider}
          isPropertySelectionEnabled={true}
          onPropertySelectionChanged={onPropertySelectionChanged}
        />);

      await waitFor(() =>
        expect(screen.getByRole("presentation"))
          .satisfy(selectorMatches(".components--clickable"))
      );
      await theUserTo.click(screen.getByRole("presentation"));
      expect(onPropertySelectionChanged.called).to.be.true;
    });

    it("deselects if clicked a 2nd time", async () => {
      render(
        <PropertyGrid
          orientation={Orientation.Horizontal}
          dataProvider={dataProvider}
          isPropertySelectionEnabled={true}
        />);

      await waitFor(() =>
        expect(screen.getByRole("presentation"))
          .satisfy(selectorMatches(".components--clickable"))
      );
      await theUserTo.click(screen.getByRole("presentation"));

      expect(screen.getByRole("presentation"))
        .satisfy(selectorMatches(".components--selected"));

      await theUserTo.click(screen.getByRole("presentation"));

      expect(screen.getByRole("presentation"))
        .satisfy(selectorMatches(":not(.components--selected)"));
    });

    it("does not call onPropertySelectionChanged when property gets clicked and selection is disabled", async () => {
      const onPropertySelectionChanged = sinon.spy();
      render(
        <PropertyGrid
          orientation={Orientation.Horizontal}
          dataProvider={dataProvider}
          isPropertySelectionEnabled={false}
          onPropertySelectionChanged={onPropertySelectionChanged}
          isOrientationFixed={true}
        />);

      await waitFor(() =>
        expect(screen.getByRole("presentation"))
          .satisfy(selectorMatches(":not(.components--clickable)"))
      );
      await theUserTo.click(screen.getByRole("presentation"));

      expect(onPropertySelectionChanged.called).to.be.false;
    });

    it("calls onPropertySelectionChanged when property gets right clicked and right click selection is enabled", async () => {
      const onPropertySelectionChanged = sinon.spy();
      render(
        <PropertyGrid
          orientation={Orientation.Horizontal}
          dataProvider={dataProvider}
          isPropertySelectionEnabled={true}
          isPropertySelectionOnRightClickEnabled={true}
          onPropertySelectionChanged={onPropertySelectionChanged}
        />);

      await waitFor(() =>
        expect(screen.getByRole("presentation"))
          .satisfy(selectorMatches(".components--clickable"))
      );
      await theUserTo.pointer({target: screen.getByRole("presentation"), keys: "[MouseRight]"});

      expect(onPropertySelectionChanged.called).to.be.true;
    });

    it("calls onPropertySelectionChanged once when property gets right clicked after left clicked and both left and right click selections are enabled", async () => {
      const onPropertySelectionChanged = sinon.spy();
      render(
        <PropertyGrid
          orientation={Orientation.Horizontal}
          dataProvider={dataProvider}
          isPropertySelectionOnRightClickEnabled={true}
          isPropertySelectionEnabled={true}
          onPropertySelectionChanged={onPropertySelectionChanged}
        />);

      await waitFor(() =>
        expect(screen.getByRole("presentation"))
          .satisfy(selectorMatches(".components--clickable"))
      );
      await theUserTo.pointer({target: screen.getByRole("presentation"), keys: "[MouseLeft][MouseRight]"});

      expect(onPropertySelectionChanged.callCount).to.be.equal(2);
    });

    it("does not deselect if right clicked a 2nd time", async () => {
      render(
        <PropertyGrid
          orientation={Orientation.Horizontal}
          dataProvider={dataProvider}
          isPropertySelectionEnabled={true}
          isPropertySelectionOnRightClickEnabled={true}
        />);

      await waitFor(() =>
        expect(screen.getByRole("presentation"))
          .satisfy(selectorMatches(".components--clickable"))
      );
      await theUserTo.pointer({target: screen.getByRole("presentation"), keys: "[MouseRight][MouseRight]"});

      expect(screen.getByRole("presentation"))
        .satisfy(selectorMatches(".components--selected"));
    });

    it("deselects if left clicked after right clicked", async () => {
      render(
        <PropertyGrid
          orientation={Orientation.Horizontal}
          dataProvider={dataProvider}
          isPropertySelectionEnabled={true}
          isPropertySelectionOnRightClickEnabled={true}
        />);

      await waitFor(() =>
        expect(screen.getByRole("presentation"))
          .satisfy(selectorMatches(".components--clickable"))
      );
      await theUserTo.pointer({target: screen.getByRole("presentation"), keys: "[MouseRight][MouseLeft]"});

      expect(screen.getByRole("presentation"))
        .satisfy(selectorMatches(":not(.components--selected)"));
    });

    it("does not call onPropertySelectionChanged when property gets right clicked and selection is disabled", async () => {
      const onPropertySelectionChanged = sinon.spy();
      render(
        <PropertyGrid
          orientation={Orientation.Horizontal}
          dataProvider={dataProvider}
          isPropertySelectionEnabled={true}
          isPropertySelectionOnRightClickEnabled={false}
          onPropertySelectionChanged={onPropertySelectionChanged}
          isOrientationFixed={true}
        />);

      await waitFor(() =>
        expect(screen.getByRole("presentation"))
          .satisfy(selectorMatches(".components--clickable"))
      );
      await theUserTo.pointer({target: screen.getByRole("presentation"), keys: "[MouseRight]"});

      expect(onPropertySelectionChanged.called).to.be.false;
    });
  });

  describe("property editing", () => {

    it("starts editor on click & commits on Enter", async () => {
      const spyMethod = sinon.spy();
      const wrapper = render(
        <PropertyGrid
          orientation={Orientation.Horizontal}
          dataProvider={dataProvider}
          isPropertyEditingEnabled={true}
          onPropertyUpdated={spyMethod}
        />);

      await TestUtils.flushAsyncOperations();

      const clickable = wrapper.container.querySelector(".components--clickable");
      expect(clickable).not.to.be.null;
      fireEvent.click(clickable!);

      expect(wrapper.container.querySelector("input.components-cell-editor")).not.to.be.null;

      const inputNode = wrapper.container.querySelector("input");
      expect(inputNode).not.to.be.null;
      fireEvent.keyDown(inputNode as HTMLElement, { key: "Enter" });
      await TestUtils.flushAsyncOperations();
      expect(spyMethod).to.be.calledOnce;
    });

    it("does not start editor on click if not selected yet", async () => {
      render(
        <PropertyGrid
          orientation={Orientation.Horizontal}
          dataProvider={dataProvider}
          isPropertySelectionEnabled={true}   // when this is true, user must click once to select then again to edit
          isPropertyEditingEnabled={true}
        />);

      await waitFor(() =>
        expect(screen.getByRole("presentation"))
          .satisfy(selectorMatches(".components--clickable"))
      );
      await theUserTo.click(screen.getByRole("presentation"));

      expect(screen.queryByTestId("editor-container")).to.be.null;
    });

    it("starts editor on click if clicked before to select", async () => {
      render(
        <PropertyGrid
          orientation={Orientation.Horizontal}
          dataProvider={dataProvider}
          isPropertySelectionEnabled={true}   // when this is true, user must click once to select then again to edit
          isPropertyEditingEnabled={true}
        />);

      await waitFor(() =>
        expect(screen.getByRole("presentation"))
          .satisfy(selectorMatches(".components--clickable"))
      );
      await theUserTo.click(screen.getByRole("presentation"));
      await theUserTo.click(screen.getByRole("presentation"));

      await theUserTo.type(screen.getByRole("textbox"), "[Escape]");

      expect(screen.queryByTestId("editor-container"), "Cell editor did not disappear after pressing Escape").to.be.null;
    });

  });

  describe("property hover", () => {
    it("enables property hovering", async () => {
      const wrapper = render(
        <PropertyGrid
          orientation={Orientation.Horizontal}
          dataProvider={dataProvider}
          isPropertyHoverEnabled={true}
        />);

      await wrapper.findByText("Group 1");
      expect(wrapper.container.querySelector(".components--hoverable")).not.to.be.null;
    });
  });

  describe("context menu", () => {

    it("calls onPropertyContextMenu callback when right clicked on a property", async () => {
      const callback = sinon.spy();
      render(
        <PropertyGrid
          orientation={Orientation.Horizontal}
          dataProvider={dataProvider}
          onPropertyContextMenu={callback}
          isOrientationFixed={true}
        />);
      await waitFor(() =>
        expect(screen.getByRole("presentation"))
          .satisfy(selectorMatches(":not(.components--clickable)"))
      );
      await theUserTo.pointer({target: screen.getByRole("presentation"), keys: "[MouseRight]"});

      expect(callback).to.be.calledOnce;
      expect(callback.firstCall.args[0].propertyRecord).to.deep.eq(records[0]);
    });

  });

  it("handles onDataChanged event subscriptions when mounting, changing props and unmounting", () => {
    const evt1 = new PropertyDataChangeEvent();
    const providerMock1 = moq.Mock.ofType<IPropertyDataProvider>();
    providerMock1.setup(async (x) => x.getData()).returns(async () => ({ label: PropertyRecord.fromString(""), categories: [], records: {} }));
    providerMock1.setup((x) => x.onDataChanged).returns(() => evt1);

    const evt2 = new PropertyDataChangeEvent();
    const providerMock2 = moq.Mock.ofType<IPropertyDataProvider>();
    providerMock2.setup(async (x) => x.getData()).returns(async () => ({ label: PropertyRecord.fromString(""), categories: [], records: {} }));
    providerMock2.setup((x) => x.onDataChanged).returns(() => evt2);

    const { rerender, unmount } = render(<PropertyGrid orientation={Orientation.Horizontal} dataProvider={providerMock1.object} />);
    expect(evt1.numberOfListeners).to.eq(1, "listener should be added when component is mounted");

    rerender(<PropertyGrid orientation={Orientation.Horizontal} dataProvider={providerMock1.object} />);
    expect(evt1.numberOfListeners).to.eq(1, "additional listener should not be added when data provider doesn't change");

    rerender(<PropertyGrid orientation={Orientation.Horizontal} dataProvider={providerMock2.object} />);
    expect(evt1.numberOfListeners).to.eq(0, "listener should be removed when data provider is not used anymore");
    expect(evt2.numberOfListeners).to.eq(1, "listener should be added when data provider changes");

    unmount();
    expect(evt2.numberOfListeners).to.eq(0, "listener should be removed when component is unmounted");
  });

});
describe("PropertyGrid Commons", () => {

  describe("getLinks", () => {

    it("detects url link", () => {
      const testLinkWithIndexes = { link: "Link: https://www.testLink.com", linkIndexes: { start: 6, end: 30 } };
      const linkResult = PropertyGridCommons.getLinks(testLinkWithIndexes.link);
      expect(linkResult.length).to.be.equal(1);
      expect(linkResult[0].start).to.be.equal(testLinkWithIndexes.linkIndexes.start);
      expect(linkResult[0].end).to.be.equal(testLinkWithIndexes.linkIndexes.end);
    });

  });

  describe("handleLinkClick", () => {
    const locationMockRef: moq.IMock<Location> = moq.Mock.ofInstance(location);
    let spy: sinon.SinonStub<[(string | URL | undefined)?, (string | undefined)?, (string | undefined)?, (boolean | undefined)?], Window | null>;

    before(() => {
      location = locationMockRef.object;
    });

    after(() => {
      locationMockRef.reset();
    });

    afterEach(() => {
      spy.restore();
    });

    it("opens new window if the link text was found without http schema", async () => {
      spy = sinon.stub(window, "open");
      spy.returns(null);

      PropertyGridCommons.handleLinkClick("www.testLink.com");
      expect(spy).to.be.calledOnceWith("http://www.testLink.com", "_blank");
    });

    it("opens new window if the link text was found in record with http schema", async () => {
      spy = sinon.stub(window, "open");
      spy.returns(null);

      PropertyGridCommons.handleLinkClick("http://www.testLink.com");
      expect(spy).to.be.calledOnceWith("http://www.testLink.com", "_blank");
    });

    it("does not open new window if there were no url links", async () => {
      spy = sinon.stub(window, "open");
      spy.returns(null);

      PropertyGridCommons.handleLinkClick("not an url link");
      PropertyGridCommons.handleLinkClick("testEmail@mail.com");
      sinon.assert.notCalled(spy);
    });

    it("sets location href value to value got in the text if it is an email link", async () => {
      PropertyGridCommons.handleLinkClick("someOtherLink@mail.com");
      expect(locationMockRef.object.href).to.be.equal("mailto:someOtherLink@mail.com");
    });

    it("sets location href value to value got in the text if it is an ProjectWise Explorer link", async () => {
      PropertyGridCommons.handleLinkClick("pw://server.bentley.com:datasource-01/Documents/ProjectName");
      expect(locationMockRef.object.href).to.be.equal("pw://server.bentley.com:datasource-01/Documents/ProjectName");
    });

    it("calls window.open.focus if window.open returns not null", () => {
      const windowMock = moq.Mock.ofType<Window>();
      windowMock.setup((x) => x.focus());

      spy = sinon.stub(window, "open");
      spy.returns(windowMock.object);

      PropertyGridCommons.handleLinkClick("www.testLink.com");

      expect(spy).to.be.calledOnceWith("http://www.testLink.com", "_blank");
      windowMock.verify((x) => x.focus(), moq.Times.once());
    });
  });

});
