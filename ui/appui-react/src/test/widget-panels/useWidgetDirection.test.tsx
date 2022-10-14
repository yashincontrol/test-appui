/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { renderHook } from "@testing-library/react-hooks";
import { addPanelWidget, addTab, createNineZoneState, NineZoneContext, TabIdContext } from "@itwin/appui-layout-react";
import { useWidgetDirection } from "../../appui-react";
import TestUtils from "../TestUtils";
import { Provider } from "react-redux";

describe("useWidgetDirection", () => {
  before(async () => {
    await TestUtils.initializeUiFramework();
  });

  after(() => {
    TestUtils.terminateUiFramework();
  });

  it("should return 'vertical'", async () => {
    await TestUtils.flushAsyncOperations();

    const nineZone = createNineZoneState();
    const { result } = renderHook<{ children?: React.ReactNode }, "horizontal" | "vertical">(() => useWidgetDirection(), {
      wrapper: ({ children }) => ( // eslint-disable-line react/display-name
        <NineZoneContext.Provider value={nineZone}>
          {children}
        </NineZoneContext.Provider>
      ),
    });
    result.current.should.eq("vertical");
  });

  it("should return 'horizontal' for a widget in a horizontal side panel", async () => {
    await TestUtils.flushAsyncOperations();

    let nineZone = createNineZoneState();
    nineZone = addTab(nineZone, "t1");
    nineZone = addPanelWidget(nineZone, "top", "w1", ["t1"]);
    const { result } = renderHook<{ children?: React.ReactNode }, "horizontal" | "vertical">(() => useWidgetDirection(), {
      wrapper: ({ children }) => ( // eslint-disable-line react/display-name
        <Provider store={TestUtils.store} >
          <NineZoneContext.Provider value={nineZone}>
            <TabIdContext.Provider value="t1">
              {children}
            </TabIdContext.Provider>
          </NineZoneContext.Provider>
        </Provider>
      ),
    });
    result.current.should.eq("horizontal");
  });

  it("should return 'vertical' for a widget in a vertical side panel", async () => {
    await TestUtils.flushAsyncOperations();

    let nineZone = createNineZoneState();
    nineZone = addTab(nineZone, "t1");
    nineZone = addPanelWidget(nineZone, "left", "w1", ["t1"]);
    const { result } = renderHook<{ children?: React.ReactNode }, "horizontal" | "vertical">(() => useWidgetDirection(), {
      wrapper: ({ children }) => ( // eslint-disable-line react/display-name
        <Provider store={TestUtils.store} >
          <NineZoneContext.Provider value={nineZone}>
            <TabIdContext.Provider value="t1">
              {children}
            </TabIdContext.Provider>
          </NineZoneContext.Provider>
        </Provider>
      ),
    });
    result.current.should.eq("vertical");
  });
});
