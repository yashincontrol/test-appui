/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { render, screen } from "@testing-library/react";
import { expect } from "chai";
import * as React from "react";
import { TitleBarButton } from "../../../appui-layout-react";
import { selectorMatches } from "../../Utils";

describe("<TitleBarButton />", () => {
  it("renders correctly", () => {
    render(<TitleBarButton />);
    expect(screen.getByRole("button")).to.satisfy(selectorMatches(".nz-footer-dialog-button"));
  });
});
