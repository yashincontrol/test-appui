/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import { expect } from "chai";
import TestUtils from "./TestUtils";
import { UiComponents } from "../ui-components";

describe("UiComponents", () => {

  beforeEach(() => {
    TestUtils.terminateUiComponents();
  });

  it("i18n should throw Error without initialize", () => {
    expect(() => UiComponents.i18n).to.throw(Error);
  });

});
