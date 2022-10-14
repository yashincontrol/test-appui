/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { render } from "@testing-library/react";
import { createNineZoneState } from "../../appui-layout-react";
import { TestNineZoneProvider } from "../Providers";
import { TabOutline } from "../../appui-layout-react/outline/TabOutline";

function Wrapper(props: React.PropsWithChildren<{}>) {
  const state = createNineZoneState();
  return (
    <TestNineZoneProvider state={state}>
      {props.children}
    </TestNineZoneProvider>
  );
}

const wrapper = Wrapper;

describe("TabOutline", () => {
  it("should render", () => {
    const { container } = render(
      <TabOutline />,
      {
        wrapper,
      }
    );
    container.getElementsByClassName("nz-outline-tabOutline").length.should.eq(1);
  });
});
