/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { render, screen } from "@testing-library/react";
import { expect } from "chai";
import * as React from "react";
import { ToolbarButton } from "../../../appui-layout-react";
import { childStructure, selectorMatches, styleMatch } from "../../Utils";

describe("<ToolbarButton  />", () => {
  it("renders correctly", () => {
    render(<ToolbarButton />);

    expect(screen.getByRole("button")).to.satisfy(selectorMatches(".nz-toolbar-button-button"));
  });

  it("renders correctly with mouseProximity & small", () => {
    render(<ToolbarButton mouseProximity={0.50} small />);

    expect(screen.getByRole("button"))
      .satisfy(styleMatch({boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.175)"}))
      .not.satisfy(childStructure(".nz-gradient"));
  });

});
