/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { render } from "@testing-library/react";
import { expect } from "chai";
import * as React from "react";
import { ViewToolWidgetComposer } from "../../appui-react/widgets/ViewToolWidgetComposer";
import { childStructure } from "../TestUtils";

describe("ViewToolWidgetComposer", () => {

  it("ViewToolWidgetComposer should render correctly", () => {
    const { container } = render(<ViewToolWidgetComposer />);

    expect(container).to.satisfy(childStructure([
      ".nz-widget-navigationArea .nz-horizontal-toolbar-container:empty",
      ".nz-widget-navigationArea .nz-vertical-toolbar-container:empty",
      ".nz-widget-navigationArea .nz-navigation-aid-container div:empty",
    ]));
  });

  it("ViewToolWidgetComposer with no navigation aid should render correctly", () => {
    const { container } = render(<ViewToolWidgetComposer hideNavigationAid />);

    expect(container).to.not.satisfy(childStructure([
      ".nz-navigation-aid-container",
    ]));
  });
});
