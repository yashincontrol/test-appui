/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { expect } from "chai";
import * as React from "react";
import * as sinon from "sinon";
import * as moq from "typemoq";
import { AxisIndex, Matrix3d, Transform, Vector3d } from "@itwin/core-geometry";
import { DrawingViewState, IModelApp, IModelConnection, ScreenViewport, ToolAdmin } from "@itwin/core-frontend";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { TestUtils } from "../TestUtils";
import { CubeHover, CubeNavigationAid, CubeNavigationHitBoxX, CubeNavigationHitBoxY, CubeNavigationHitBoxZ, FaceCell, NavCubeFace } from "../../imodel-components-react/navigationaids/CubeNavigationAid";
import { ViewportComponentEvents } from "../../imodel-components-react/viewport/ViewportComponentEvents";
import { Face } from "../../imodel-components-react/navigationaids/Cube";
import userEvent from "@testing-library/user-event";

describe("CubeNavigationAid", () => {
  let theUserTo: ReturnType<typeof userEvent.setup>;
  beforeEach(()=>{
    theUserTo = userEvent.setup();
  });
  before(async () => {
    await TestUtils.initializeUiIModelComponents();
  });

  after(() => {
    TestUtils.terminateUiIModelComponents();
  });

  let rotation = Matrix3d.createIdentity();

  const connection = moq.Mock.ofType<IModelConnection>();
  const viewState = moq.Mock.ofType<DrawingViewState>();
  viewState.setup((x) => x.id).returns(() => "id1");
  viewState.setup((x) => x.classFullName).returns(() => "Bis:DrawingViewDefinition");
  viewState.setup((x) => x.getRotation).returns(() => () => rotation);
  const vp = moq.Mock.ofType<ScreenViewport>();
  vp.setup((x) => x.view).returns(() => viewState.object);
  vp.setup((x) => x.rotation).returns(() => rotation);

  const waitForSpy = async (spy: sinon.SinonSpy, timeoutMillis: number = 1500) => {
    return waitFor(() => {
      if (!spy.called)
        throw new Error("Waiting for spy timed out!");
    }, { timeout: timeoutMillis, interval: 10 });
  };

  const cssMatrix3dToBentleyTransform = (mStr: string) => {
    const mat = mStr.match(/matrix3d\(([-\de\. ,]+)\)/);
    if (mat !== null && mat[1] !== undefined) {
      const params = mat[1].split(",");
      if (params.length !== 16)
        return undefined;
      const p = [];
      for (const param of params) {
        const n = parseFloat(param);
        if (isNaN(n)) {
          return undefined;
        }
        p.push(n);
      }
      return Transform.createRowValues(
        p[0], p[4], p[8], p[12],
        p[1], p[5], p[9], p[13],
        p[2], p[6], p[10], p[14],
      );
    }
    return undefined;
  };

  describe("<CubeNavigationAid />", () => {
    afterEach(() => {
      sinon.restore();
    });
    it("should render", () => {
      render(<CubeNavigationAid iModelConnection={connection.object} />);
    });
    it("should exist", async () => {
      const component = render(<CubeNavigationAid iModelConnection={connection.object} />);
      const navAid = component.getByTestId("components-cube-navigation-aid");
      expect(navAid).to.exist;
    });
    [vp.object, undefined].map((lockedViewport) =>{
      const shouldStr = !!lockedViewport ? "locked cube should not" : "should";
      it(`${shouldStr} change from top to front when arrow clicked`, async () => {
        sinon.replaceGetter(IModelApp, "toolAdmin", () => ({markupView: lockedViewport}) as ToolAdmin);
        const animationEnd = sinon.fake();
        const component = render(<CubeNavigationAid iModelConnection={connection.object} animationTime={.1} onAnimationEnd={animationEnd} viewport={lockedViewport} />);

        const topFace = component.getByTestId("components-cube-face-top");
        const pointerButton = component.getByTestId("cube-pointer-button-down");

        const mat = cssMatrix3dToBentleyTransform(topFace.style.transform)!;
        expect(mat.matrix.isAlmostEqual(Matrix3d.createIdentity())).is.true;

        pointerButton.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));

        await waitForSpy(animationEnd);

        const expectedMatrix = !!lockedViewport ? mat.matrix : Matrix3d.createRowValues(1, 0, 0, 0, 0, -1, 0, 1, 0);

        const mat2 = cssMatrix3dToBentleyTransform(topFace.style.transform)!;
        expect(mat2.matrix.isAlmostEqual(expectedMatrix)).is.true;
      });
      it(`${shouldStr} change from top to back when arrow clicked`, async () => {
        sinon.replaceGetter(IModelApp, "toolAdmin", () => ({markupView: lockedViewport}) as ToolAdmin);
        const animationEnd = sinon.fake();
        const component = render(<CubeNavigationAid iModelConnection={connection.object} animationTime={.1} onAnimationEnd={animationEnd} viewport={lockedViewport} />);

        const topFace = component.getByTestId("components-cube-face-top");
        const pointerButton = component.getByTestId("cube-pointer-button-up");

        const mat = cssMatrix3dToBentleyTransform(topFace.style.transform)!;
        expect(mat.matrix.isAlmostEqual(Matrix3d.createIdentity())).is.true;

        pointerButton.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));

        await waitForSpy(animationEnd);

        const expectedMatrix = !!lockedViewport ? mat.matrix : Matrix3d.createRowValues(-1, 0, 0, 0, 0, -1, 0, -1, 0);

        const mat2 = cssMatrix3dToBentleyTransform(topFace.style.transform)!;
        expect(mat2.matrix.isAlmostEqual(expectedMatrix)).is.true;
      });
      it(`${shouldStr} change from top to left when arrow clicked`, async () => {
        sinon.replaceGetter(IModelApp, "toolAdmin", () => ({markupView: lockedViewport}) as ToolAdmin);
        const animationEnd = sinon.fake();
        const component = render(<CubeNavigationAid iModelConnection={connection.object} animationTime={.1} onAnimationEnd={animationEnd} viewport={lockedViewport} />);

        const topFace = component.getByTestId("components-cube-face-top");
        const pointerButton = component.getByTestId("cube-pointer-button-left");

        const mat = cssMatrix3dToBentleyTransform(topFace.style.transform)!;
        expect(mat.matrix.isAlmostEqual(Matrix3d.createIdentity())).is.true;

        pointerButton.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));

        await waitForSpy(animationEnd);

        const expectedMatrix = !!lockedViewport ? mat.matrix : Matrix3d.createRowValues(0, 1, 0, 0, 0, -1, -1, 0, 0);

        const mat2 = cssMatrix3dToBentleyTransform(topFace.style.transform)!;
        expect(mat2.matrix.isAlmostEqual(expectedMatrix)).is.true;
      });
      it(`${shouldStr} change from top to right when arrow clicked`, async () => {
        sinon.replaceGetter(IModelApp, "toolAdmin", () => ({markupView: lockedViewport}) as ToolAdmin);
        const animationEnd = sinon.fake();
        const component = render(<CubeNavigationAid iModelConnection={connection.object} animationTime={.1} onAnimationEnd={animationEnd} viewport={lockedViewport} />);

        const topFace = component.getByTestId("components-cube-face-top");
        const pointerButton = component.getByTestId("cube-pointer-button-right");

        const mat = cssMatrix3dToBentleyTransform(topFace.style.transform)!;
        expect(mat.matrix.isAlmostEqual(Matrix3d.createIdentity())).is.true;

        pointerButton.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));

        await waitForSpy(animationEnd);

        const expectedMatrix = !!lockedViewport ? mat.matrix : Matrix3d.createRowValues(0, -1, 0, 0, 0, -1, 1, 0, 0);

        const mat2 = cssMatrix3dToBentleyTransform(topFace.style.transform)!;
        expect(mat2.matrix.isAlmostEqual(expectedMatrix)).is.true;
      });
      it(`${shouldStr} highlight hovered cell`, async () => {
        sinon.replaceGetter(IModelApp, "toolAdmin", () => ({markupView: lockedViewport}) as ToolAdmin);
        const component = render(<CubeNavigationAid iModelConnection={connection.object} viewport={lockedViewport} />);

        const topCenterCell = component.getByTestId("nav-cube-face-cell-top-0-0-1");

        expect(topCenterCell.classList.contains("cube-hover")).to.be.false;

        topCenterCell.dispatchEvent(new MouseEvent("mouseover", { bubbles: true, cancelable: true, view: window }));

        const expected = !lockedViewport;

        await waitFor(() => {
          expect(topCenterCell.classList.contains("cube-hover")).to.equal(expected);
        });
      });
      it(`${shouldStr} click center cell`, async () => {
        sinon.replaceGetter(IModelApp, "toolAdmin", () => ({markupView: lockedViewport}) as ToolAdmin);
        const component = render(<CubeNavigationAid iModelConnection={connection.object} viewport={lockedViewport} />);

        const topFace = component.getByTestId("components-cube-face-top");
        const topCenterCell = component.getByTestId("nav-cube-face-cell-top-0-0-1");

        expect(topCenterCell.classList.contains("cube-active")).to.be.false;

        const mat = cssMatrix3dToBentleyTransform(topFace.style.transform)!;
        expect(mat.matrix.isAlmostEqual(Matrix3d.createIdentity())).is.true;

        topCenterCell.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, view: window }));
        await waitFor(() => {
          expect(topCenterCell.classList.contains("cube-active")).to.equal(!lockedViewport);
        });

        topCenterCell.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, view: window }));

        const expectedMatrix = !!lockedViewport ? mat.matrix : Matrix3d.createIdentity();

        const mat2 = cssMatrix3dToBentleyTransform(topFace.style.transform)!;
        expect(mat2.matrix.isAlmostEqual(expectedMatrix)).is.true;
      });
      it(`${shouldStr} click corner cell`, async () => {
        sinon.replaceGetter(IModelApp, "toolAdmin", () => ({markupView: lockedViewport}) as ToolAdmin);
        const animationEnd = sinon.fake();
        const component = render(<CubeNavigationAid iModelConnection={connection.object} animationTime={.1} onAnimationEnd={animationEnd} viewport={lockedViewport} />);

        const topFace = component.getByTestId("components-cube-face-top");
        const topCornerCell = component.getByTestId("nav-cube-face-cell-top--1-1-1");

        expect(topCornerCell.classList.contains("cube-active")).to.be.false;

        const mat = cssMatrix3dToBentleyTransform(topFace.style.transform)!;
        expect(mat.matrix.isAlmostEqual(Matrix3d.createIdentity())).is.true;
        topCornerCell.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, view: window }));
        await waitFor(() => {
          expect(topCornerCell.classList.contains("cube-active")).to.equal(!lockedViewport);
        });
        topCornerCell.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, view: window }));
        await waitForSpy(animationEnd);
        const expectedMatrix = !!lockedViewport ? mat.matrix : Matrix3d.createRowValues(-0.7071067811865476, 0.7071067811865476, 0, -0.4082482904638629, -0.4082482904638629, -0.8164965809277258, -0.5773502691896257, -0.5773502691896257, 0.5773502691896256);
        await waitFor(() => {
          const mat2 = cssMatrix3dToBentleyTransform(topFace.style.transform)!;
          expect(mat2.matrix.isAlmostEqual(expectedMatrix)).is.true;
        });
      });
      it(`${shouldStr} switch from corner to top face`, async () => {
        sinon.replaceGetter(IModelApp, "toolAdmin", () => ({markupView: lockedViewport}) as ToolAdmin);
        const animationEnd = sinon.fake();
        const component = render(<CubeNavigationAid iModelConnection={connection.object} animationTime={.1} onAnimationEnd={animationEnd} viewport={lockedViewport} />);

        const topFace = component.getByTestId("components-cube-face-top");
        const topCornerCell = component.getByTestId("nav-cube-face-cell-top--1-1-1");
        const topCenterCell = component.getByTestId("nav-cube-face-cell-top-0-0-1");

        const mat = cssMatrix3dToBentleyTransform(topFace.style.transform)!;
        expect(mat.matrix.isAlmostEqual(Matrix3d.createIdentity())).is.true;
        topCornerCell.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, view: window }));
        topCornerCell.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, view: window }));
        await waitForSpy(animationEnd);

        const expectedMatrixTemp = !!lockedViewport ? mat.matrix : Matrix3d.createRowValues(-0.7071067811865476, 0.7071067811865476, 0, -0.4082482904638629, -0.4082482904638629, -0.8164965809277258, -0.5773502691896257, -0.5773502691896257, 0.5773502691896256);
        const mat2 = cssMatrix3dToBentleyTransform(topFace.style.transform)!;
        expect(mat2.matrix.isAlmostEqual(expectedMatrixTemp)).is.true;
        animationEnd.resetHistory();
        topCenterCell.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, view: window }));
        topCenterCell.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, view: window }));
        await waitForSpy(animationEnd);
        const expectedMatrix = !!lockedViewport ? mat.matrix : Matrix3d.createRowValues(-1, 1.2246467991473532e-16, 0, -1.2246467991473532e-16, -1, 0, 0, 0, 1);
        const mat3 = cssMatrix3dToBentleyTransform(topFace.style.transform)!;
        expect(mat3.matrix.isAlmostEqual(expectedMatrix)).is.true;
      });
      it(`${shouldStr} switch from corner to bottom face`, async () => {
        sinon.replaceGetter(IModelApp, "toolAdmin", () => ({markupView: lockedViewport}) as ToolAdmin);
        const animationEnd = sinon.fake();
        const component = render(<CubeNavigationAid iModelConnection={connection.object} animationTime={.1} onAnimationEnd={animationEnd} viewport={lockedViewport} />);

        const topFace = component.getByTestId("components-cube-face-top");
        const bottomCornerCell = component.getByTestId("nav-cube-face-cell-bottom--1--1--1");
        const bottomCornerCenter = component.getByTestId("nav-cube-face-cell-bottom-0-0--1");

        const mat = cssMatrix3dToBentleyTransform(topFace.style.transform)!;
        expect(mat.matrix.isAlmostEqual(Matrix3d.createIdentity())).is.true;
        bottomCornerCell.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, view: window }));
        bottomCornerCell.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, view: window }));
        await waitForSpy(animationEnd);

        const expectedMatrixTemp = !!lockedViewport ? mat.matrix : Matrix3d.createRowValues(0.7071067811865476, 0.7071067811865476, 0, 0.4082482904638629, -0.4082482904638629, -0.8164965809277258, -0.5773502691896257, 0.5773502691896257, -0.5773502691896256);
        const mat2 = cssMatrix3dToBentleyTransform(topFace.style.transform)!;
        expect(mat2.matrix.isAlmostEqual(expectedMatrixTemp)).is.true;

        animationEnd.resetHistory();
        bottomCornerCenter.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, view: window }));
        bottomCornerCenter.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, view: window }));
        await waitForSpy(animationEnd);

        const expectedMatrix = !!lockedViewport ? mat.matrix : Matrix3d.createRowValues(1, 0, 0, 0, -1, 0, 0, 0, -1);
        const mat3 = cssMatrix3dToBentleyTransform(topFace.style.transform)!;
        expect(mat3.matrix.isAlmostEqual(expectedMatrix)).is.true;
      });
      it(`${shouldStr} drag cube`, async () => {
        sinon.replaceGetter(IModelApp, "toolAdmin", () => ({markupView: lockedViewport}) as ToolAdmin);
        const component = render(<CubeNavigationAid iModelConnection={connection.object} viewport={lockedViewport} />);

        const topFace = component.getByTestId("components-cube-face-top");
        const topCenterCell = component.getByTestId("nav-cube-face-cell-top-0-0-1");

        expect(topCenterCell.classList.contains("cube-active")).to.be.false;

        const mat = cssMatrix3dToBentleyTransform(topFace.style.transform)!;
        expect(mat.matrix.isAlmostEqual(Matrix3d.createIdentity())).is.true;
        await theUserTo.pointer([
          { keys: "[MouseLeft>]", target: topCenterCell, coords: { x: 2, y: 2, clientX: 2, clientY: 2}},
          { coords: { x: 10, y: 2, clientX: 10, clientY: 2}},
          { coords: { x: 20, y: 2, clientX: 20, clientY: 2}},
          { keys: "[/MouseLeft]"},
        ]);

        await waitFor(() => {
          const expectedMatrix = !!lockedViewport ? mat.matrix : Matrix3d.createRowValues(0.62160997, 0.7833269, 0, -0.7833269, 0.62160997, 0, 0, 0, 1);
          const mat2 = cssMatrix3dToBentleyTransform(topFace.style.transform)!;
          expect(mat2.matrix.isAlmostEqual(expectedMatrix)).is.true;
        });
      });
    });

    describe("onViewRotationChangeEvent", () => {
      beforeEach(() => {
        rotation = Matrix3d.createIdentity();
      });
      it("should update onViewRotationChangeEvent", async () => {
        const component = render(<CubeNavigationAid iModelConnection={connection.object} viewport={vp.object} />);
        const topFace = component.getByTestId("components-cube-face-top");
        const mat = cssMatrix3dToBentleyTransform(topFace.style.transform)!;
        expect(mat.matrix.isAlmostEqual(Matrix3d.createIdentity())).is.true;
        ViewportComponentEvents.onViewRotationChangeEvent.emit({ viewport: vp.object });
        const mat2 = cssMatrix3dToBentleyTransform(topFace.style.transform)!;
        expect(mat2.matrix.isAlmostEqual(Matrix3d.createIdentity())).is.true;
      });
      it("should update onViewRotationChangeEvent with new rotation", async () => {
        const component = render(<CubeNavigationAid iModelConnection={connection.object} viewport={vp.object} />);
        const topFace = component.getByTestId("components-cube-face-top");
        const mat = cssMatrix3dToBentleyTransform(topFace.style.transform)!;
        expect(mat.matrix.isAlmostEqual(Matrix3d.createIdentity())).is.true;
        rotation = Matrix3d.create90DegreeRotationAroundAxis(AxisIndex.Z);
        ViewportComponentEvents.onViewRotationChangeEvent.emit({ viewport: vp.object });
        await waitFor(() => {
          const mat2 = cssMatrix3dToBentleyTransform(topFace.style.transform)!;
          expect(mat2.matrix.isAlmostEqual(Matrix3d.createRowValues(0, 1, 0, -1, 0, 0, 0, 0, 1))).is.true;
        });
      });
    });
  });
  describe("<NavCubeFace />", () => {
    it("should render", () => {
      render(<NavCubeFace face={Face.Top} label="test" hoverMap={{}} onFaceCellClick={sinon.fake()} onFaceCellHoverChange={sinon.fake()} />);
    });
    it("should exist", () => {
      const component = render(<NavCubeFace face={Face.Top} label="test" hoverMap={{}} onFaceCellClick={sinon.fake()} onFaceCellHoverChange={sinon.fake()} />);
      const face = component.getByTestId("nav-cube-face");
      expect(face).to.exist;
    });
    describe("methods and callbacks", () => {
      beforeEach(() => {
        NavCubeFace.faceCellToPos = sinon.spy(NavCubeFace.faceCellToPos);
        render(<NavCubeFace face={Face.Top} label="test" hoverMap={{}} onFaceCellClick={sinon.fake()} onFaceCellHoverChange={sinon.fake()} />);
      });

      describe("faceCellToPos", () => {
        it("should be called when component is rendered", () => {
          NavCubeFace.faceCellToPos.should.have.been.calledWith(Face.Top, 0, 0);
        });
        it("should return correct Point3d", () => {
          const pos = NavCubeFace.faceCellToPos(Face.Back, -1, 1);
          pos.x.should.equal(CubeNavigationHitBoxX.Right);
          pos.y.should.equal(CubeNavigationHitBoxY.Back);
          pos.z.should.equal(CubeNavigationHitBoxZ.Bottom);
        });
      });
    });
  });
  describe("<FaceCell />", () => {
    it("should render", () => {
      render(<FaceCell onFaceCellClick={sinon.fake()} onFaceCellHoverChange={sinon.fake()} hoverMap={{}} vector={Vector3d.create(1, 1, 1)} face={Face.Top} />);
    });
    it("should exist", () => {
      const component = render(<FaceCell onFaceCellClick={sinon.fake()} onFaceCellHoverChange={sinon.fake()} hoverMap={{}} vector={Vector3d.create(1, 1, 1)} face={Face.Top} />);
      const faceCell = component.getByTestId("nav-cube-face-cell-top-1-1-1");
      expect(faceCell).to.exist;
    });
    describe("onFaceCellClick", () => {
      it("should be called when cell is clicked", () => {
        const cellClick = sinon.spy();
        const pos = Vector3d.create(1, 1, 1);
        const component = render(<FaceCell onFaceCellClick={cellClick} onFaceCellHoverChange={sinon.fake()} hoverMap={{}} vector={pos} face={Face.Top} />);
        const faceCell = component.getByTestId("nav-cube-face-cell-top-1-1-1");
        fireEvent.mouseDown(faceCell);
        fireEvent.mouseUp(faceCell);
        expect(cellClick).to.be.called;
      });

      it("should be called when cell is touched", () => {
        const cellClick = sinon.spy();
        const pos = Vector3d.create(1, 1, 1);
        const component = render(<FaceCell onFaceCellClick={cellClick} onFaceCellHoverChange={sinon.fake()} hoverMap={{}} vector={pos} face={Face.Top} />);
        const faceCell = component.getByTestId("nav-cube-face-cell-top-1-1-1");
        fireEvent.touchStart(faceCell, {
          targetTouches: [{
            clientX: 10,
            clientY: 10,
          }],
        });
        fireEvent.touchEnd(faceCell, {
          changedTouches: [{
            clientX: 10,
            clientY: 10,
          }],
        });
        expect(cellClick).to.be.called;
      });
    });
    describe("onFaceCellHoverChange", () => {
      it("should be called when cell is hovered", () => {
        const cellHover = sinon.spy();
        const pos = Vector3d.create(1, 1, 1);
        const component = render(<FaceCell onFaceCellClick={sinon.fake()} onFaceCellHoverChange={cellHover} hoverMap={{}} vector={pos} face={Face.Top} />);
        const faceCell = component.getByTestId("nav-cube-face-cell-top-1-1-1");
        fireEvent.mouseOver(faceCell);
        expect(cellHover).to.be.calledWithExactly(pos, CubeHover.Hover);
      });
      it("should be called when cell is unhovered", () => {
        const cellHover = sinon.spy();
        const pos = Vector3d.create(1, 1, 1);
        const component = render(<FaceCell onFaceCellClick={sinon.fake()} onFaceCellHoverChange={cellHover} hoverMap={{}} vector={pos} face={Face.Top} />);
        const faceCell = component.getByTestId("nav-cube-face-cell-top-1-1-1");
        fireEvent.mouseOver(faceCell);
        fireEvent.mouseOut(faceCell);
        expect(cellHover).to.be.calledWithExactly(pos, CubeHover.None);
      });
      it("should be called when cell is clicked", () => {
        const cellHover = sinon.spy();
        const pos = Vector3d.create(1, 1, 1);
        const component = render(<FaceCell onFaceCellClick={sinon.fake()} onFaceCellHoverChange={cellHover} hoverMap={{}} vector={pos} face={Face.Top} />);
        const faceCell = component.getByTestId("nav-cube-face-cell-top-1-1-1");
        fireEvent.mouseDown(faceCell);
        expect(cellHover).to.be.calledWithExactly(pos, CubeHover.Active);
      });
      it("should be called when cell is unclicked", () => {
        const cellHover = sinon.spy();
        const pos = Vector3d.create(1, 1, 1);
        const component = render(<FaceCell onFaceCellClick={sinon.fake()} onFaceCellHoverChange={cellHover} hoverMap={{}} vector={pos} face={Face.Top} />);
        const faceCell = component.getByTestId("nav-cube-face-cell-top-1-1-1");
        fireEvent.mouseDown(faceCell);
        fireEvent.mouseUp(faceCell);
        expect(cellHover).to.be.calledWithExactly(pos, CubeHover.None);
      });
    });
  });

});
