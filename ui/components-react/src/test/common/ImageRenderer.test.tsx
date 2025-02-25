/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { expect } from "chai";
import * as React from "react";
import { UiError } from "@itwin/appui-abstract";
import { render } from "@testing-library/react";
import { LoadedBinaryImage } from "../../components-react/common/IImageLoader";
import { ImageRenderer } from "../../components-react/common/ImageRenderer";
import { UiCore } from "@itwin/core-react";
import { EmptyLocalization } from "@itwin/core-common";

describe("ImageRenderer", () => {
  before(async () => {
    await UiCore.initialize(new EmptyLocalization());
  });

  const imageRenderer = new ImageRenderer();
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="480" height="543.03003" viewBox="0 0 257.002 297.5" xml:space="preserve">
      <g transform="matrix(0.8526811,0,0,0.8526811,18.930632,21.913299)">
        <polygon points="8.003,218.496 0,222.998 0,74.497 8.003,78.999 8.003,218.496 "/>
      </g>
    </svg>
  `;

  const hex = "89504e470d0a1a0a0000000d49484452000000080000000808020000004b6d29dc000000097048597300002e2300002e230178a53f76000000434944415408d7858dc109804010c4b26213c1fe4b93edc2f171277e3c9c67481858ac0088bea8fbe11a2e8c468206d887657956034766bbad3e66d1f4703bedfff9e76ec62115e8243cfe640000000049454e44ae426082";
  const hexBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAQ0lEQVQI14WNwQmAQBDEsmITwf5Lk+3C8XEnfjycZ0gYWKwAiL6o++EaLoxGggbYh2V5VgNHZrutPmbR9HA77f/5527GIRXoJDz+ZAAAAABJRU5ErkJggg==";

  const renderedSvg = `<div><i class="icon core-svg-icon"><div><svg-loader src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMCIgd2lkdGg9IjQ4MCIgaGVpZ2h0PSI1NDMuMDMwMDMiIHZpZXdCb3g9IjAgMCAyNTcuMDAyIDI5Ny41IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KICAgICAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoMC44NTI2ODExLDAsMCwwLjg1MjY4MTEsMTguOTMwNjMyLDIxLjkxMzI5OSkiPgogICAgICAgIDxwb2x5Z29uIHBvaW50cz0iOC4wMDMsMjE4LjQ5NiAwLDIyMi45OTggMCw3NC40OTcgOC4wMDMsNzguOTk5IDguMDAzLDIxOC40OTYgIi8+CiAgICAgIDwvZz4KICAgIDwvc3ZnPg=="><svg xml:space="preserve" viewBox="0 0 257.002 297.5" height="543.03003" width="480" version="1.0" xmlns="http://www.w3.org/2000/svg">
      <g transform="matrix(0.8526811,0,0,0.8526811,18.930632,21.913299)">
        <polygon points="8.003,218.496 0,222.998 0,74.497 8.003,78.999 8.003,218.496"></polygon>
      </g>
    </svg></svg-loader></div></i></div>`;

  describe("render", () => {
    it("renders binary", () => {
      const image = imageRenderer.render({ sourceType: "binary", fileFormat: "png", value: hex } as LoadedBinaryImage);

      const imageRender = render(<>{image}</>);

      const imgElement = imageRender.container.children[0] as HTMLImageElement;

      expect(imgElement.tagName).to.equal("IMG");
      expect(imgElement.src).to.equal(`data:image/png;base64,${hexBase64}`);
    });

    it("renders svg", () => {
      const image = imageRenderer.render({ sourceType: "svg", value: svg });
      const imageRender = render(<>{image}</>);

      expect(imageRender.container.innerHTML).to.eq(renderedSvg);

      // render a second time to see if it produces identical value
      const image2 = imageRenderer.render({ sourceType: "svg", value: svg });
      const imageRender2 = render(<>{image2}</>);

      expect(imageRender.container.innerHTML).to.be.eq(imageRender2.container.innerHTML);
    });

    it("renders url", () => {
      const image = imageRenderer.render({ sourceType: "url", value: "some-image.png" });

      const imageRender = render(<>{image}</>);

      const imgElement = imageRender.container.children[0] as HTMLImageElement;
      expect(imgElement.tagName).to.equal("IMG");
      expect(imgElement.src).to.equal("some-image.png");
    });

    it("renders core-icon", () => {
      const image = imageRenderer.render({ sourceType: "core-icon", value: "icon-placeholder" });

      const imageRender = render(<>{image}</>);

      expect(imageRender.container.querySelector(".bui-webfont-icon")).to.not.be.null;
      expect(imageRender.container.querySelector(".icon-placeholder")).to.not.be.null;
    });

    const coreIconsInWebfontFormatTestData = [
      {
        iconName: "fa:fa-anchor",
        expectedIconNameSelector: ".fa\\:fa-anchor",
      },
      {
        iconName: "fas:fa-archway",
        expectedIconNameSelector: ".fas\\:fa-archway",
      },
      {
        iconName: "bui-webfont-icon:icon-placeholder",
        expectedIconNameSelector: ".bui-webfont-icon\\:icon-placeholder",
      },
    ];

    for (const iconTest of coreIconsInWebfontFormatTestData) {
      it(`renders core-icon when {className}:{iconName} format value given: ${iconTest.iconName}`, () => {
        const image = imageRenderer.render({ sourceType: "core-icon", value: iconTest.iconName });

        const imageRender = render(<>{image}</>);

        expect(imageRender.container.querySelector(".bui-webfont-icon")).to.not.be.null;
        expect(imageRender.container.querySelector(iconTest.expectedIconNameSelector)).to.not.be.null;
      });
    }

    const webfontIconsTestData = [
      {
        iconName: "fa:fa-anchor",
        expectedIconClassSelector: ".fa",
        expectedIconNameSelector: ".fa-anchor",
      },
      {
        iconName: "fas:fa-archway",
        expectedIconClassSelector: ".fas",
        expectedIconNameSelector: ".fa-archway",
      },
      {
        iconName: "fas\\:test\\:escaped\\:className:fa-address-card",
        expectedIconClassSelector: ".fas\\:test\\:escaped\\:className",
        expectedIconNameSelector: ".fa-address-card",
      },
      {
        iconName: "fas:fa-test\\:escaped\\:icon\\:name",
        expectedIconClassSelector: ".fas",
        expectedIconNameSelector: ".fa-test\\:escaped\\:icon\\:name",
      },
      {
        iconName: "fas\\:test\\:escaped:fa-test\\:escaped\\:icon\\:name",
        expectedIconClassSelector: ".fas\\:test\\:escaped",
        expectedIconNameSelector: ".fa-test\\:escaped\\:icon\\:name",
      },
    ];

    for (const iconTest of webfontIconsTestData) {
      it(`renders webfont-icon with expected icon class and name when given icon name ${iconTest.iconName}`, () => {
        const image = imageRenderer.render({ sourceType: "webfont-icon", value: iconTest.iconName });

        const imageRender = render(<>{image}</>);

        expect(imageRender.container.querySelector(iconTest.expectedIconClassSelector)).to.not.be.null;
        expect(imageRender.container.querySelector(iconTest.expectedIconNameSelector)).to.not.be.null;
      });
    }

    const badlyFormedWebfontIconsTestData = [
      { iconName: "icon-placeholder", expectedIconNameSelector: ".icon-placeholder" },
      { iconName: "fa:fa-anchor:fa", expectedIconNameSelector: ".fa\\:fa-anchor\\:fa" },
      { iconName: "fas:fa-archway:fa-anchor", expectedIconNameSelector: ".fas\\:fa-archway\\:fa-anchor" },
      { iconName: "a:b:c:d:e:f", expectedIconNameSelector: ".a\\:b\\:c\\:d\\:e\\:f" },
    ];

    for (const iconTest of badlyFormedWebfontIconsTestData) {
      it(`renders webfont-icon as core-icon when given icon name ${iconTest.iconName}`, () => {
        const image = imageRenderer.render({ sourceType: "webfont-icon", value: iconTest.iconName });

        const imageRender = render(<>{image}</>);

        expect(imageRender.container.querySelector(".bui-webfont-icon")).to.not.be.null;
        expect(imageRender.container.querySelector(iconTest.expectedIconNameSelector)).to.not.be.null;
      });
    }

    it("throws when provided image source is not supported", () => {
      expect(() => imageRenderer.render({ sourceType: "random-type" } as any)).to.throw(UiError);
    });
  });
});
