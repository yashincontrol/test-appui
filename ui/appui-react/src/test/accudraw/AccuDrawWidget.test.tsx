/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { expect } from "chai";
import * as React from "react";
import { IModelAppOptions, MockRender } from "@itwin/core-frontend";
import { FrameworkAccuDraw } from "../../appui-react/accudraw/FrameworkAccuDraw";
import { AccuDrawWidget } from "../../appui-react/accudraw/AccuDrawWidget";
import { TestUtils } from "../TestUtils";
import { render, screen } from "@testing-library/react";

describe("AccuDrawWidget", () => {
  before(async () => {
    await TestUtils.initializeUiFramework();

    const opts: IModelAppOptions = {};
    opts.accuDraw = new FrameworkAccuDraw();
    await MockRender.App.startup(opts);
  });

  after(async () => {
    await MockRender.App.shutdown();
    TestUtils.terminateUiFramework();
  });

  it("should render AccuDrawWidget correctly", () => {
    render(<AccuDrawWidget />);
    expect(screen.getByLabelText<HTMLInputElement>("X").value).to.equal("0'-0\"");
    expect(screen.getByLabelText<HTMLInputElement>("Y").value).to.equal("0'-0\"");
  });

});
