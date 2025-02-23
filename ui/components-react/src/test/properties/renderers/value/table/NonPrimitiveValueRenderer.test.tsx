/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { expect } from "chai";
import * as React from "react";
import sinon from "sinon";
import { fireEvent, render } from "@testing-library/react";
import { TableNonPrimitiveValueRenderer } from "../../../../../components-react/properties/renderers/value/table/NonPrimitiveValueRenderer";

describe("TableNonPrimitiveValueRenderer", () => {
  const dialogContents = <div><p>Hello</p></div>;

  it("renders correctly", () => {
    const renderer = render(
      <TableNonPrimitiveValueRenderer
        buttonLabel="Open greeting"
        dialogContents={dialogContents}
        dialogTitle={"Greeting"}
      />);

    // Verify that text "Open greeting" is renderer. Throws otherwise
    renderer.getByText("Open greeting");
  });

  it("calls onDialogOpen when button gets clicked", () => {
    const onDialogOpen = sinon.spy();

    const renderer = render(
      <TableNonPrimitiveValueRenderer
        buttonLabel="Open greeting"
        dialogContents={dialogContents}
        dialogTitle={"Greeting"}
        onDialogOpen={onDialogOpen}
      />);

    const button = renderer.container.getElementsByClassName("core-underlined-button")[0];
    fireEvent.click(button);

    expect(onDialogOpen.calledOnce).to.be.true;
    expect(onDialogOpen.args[0][0].content).to.be.eq(dialogContents);
    expect(onDialogOpen.args[0][0].title).to.be.eq("Greeting");
  });

  it("renders DOM exactly the same when hovered on without appropriate callbacks set", () => {
    const renderer = render(
      <TableNonPrimitiveValueRenderer
        buttonLabel="Open greeting"
        dialogContents={dialogContents}
        dialogTitle={"Greeting"}
      />);

    const renderedDom = renderer.container.innerHTML;

    const button = renderer.container.getElementsByClassName("core-underlined-button")[0];

    fireEvent.mouseEnter(button);
    expect(renderer.container.innerHTML).to.be.eq(renderedDom);

    fireEvent.mouseLeave(button);
    expect(renderer.container.innerHTML).to.be.eq(renderedDom);
  });

  it("renders DOM exactly the same when clicked on without appropriate callbacks set", () => {
    const renderer = render(
      <TableNonPrimitiveValueRenderer
        buttonLabel="Open greeting"
        dialogContents={dialogContents}
        dialogTitle={"Greeting"}
      />);

    const renderedDom = renderer.container.innerHTML;

    const button = renderer.container.getElementsByClassName("core-underlined-button")[0];

    fireEvent.click(button);

    expect(renderer.container.innerHTML).to.be.eq(renderedDom);
  });
});
