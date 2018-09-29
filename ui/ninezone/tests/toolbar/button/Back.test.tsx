/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 - present Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import { mount, shallow } from "enzyme";
import * as React from "react";

import BackButton from "../../../src/toolbar/button/Back";

describe("<BackButton />", () => {
  it("should render", () => {
    mount(<BackButton />);
  });

  it("renders correctly", () => {
    shallow(<BackButton />).should.matchSnapshot();
  });
});
