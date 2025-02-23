/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as sinon from "sinon";
import { expect } from "chai";
import { fireEvent, waitFor } from "@testing-library/react";

/** Options for waitForSpy test helper function */
export interface WaitForSpyOptions {
  timeout?: number;
  error?: string;
}

/** Wait for spy to be called. Throws on timeout (250 by default) */
export const waitForSpy = async (spy: sinon.SinonSpy, options?: WaitForSpyOptions) => {
  const defaultValues: WaitForSpyOptions = { timeout: 250, error: "Waiting for spy timed out!" };
  const { timeout, error } = options ? { ...defaultValues, ...options } : defaultValues;

  return waitFor(() => {
    if (!spy.called)
      throw new Error(error);
  }, { timeout, interval: 10 });
};

/**
 * Select component pick value using index
 */
export const selectChangeValueByIndex = (select: HTMLElement, index: number, onError?: (msg: string) => void): void => {
  fireEvent.click(select.querySelector(".iui-select-button") as HTMLElement);
  const tippy = select.ownerDocument.querySelector("[data-tippy-root]") as HTMLElement;
  const menu = tippy.querySelector(".iui-menu") as HTMLUListElement;
  if (!menu)
    onError && onError(`Couldn't find menu`);
  expect(menu).to.exist;

  const menuItem = menu.querySelectorAll("li");
  if (menuItem[index] === undefined)
    onError && onError(`Couldn't find menu item ${index}`);
  expect(menuItem[index]).to.not.be.undefined;

  fireEvent.click(menuItem[index]);
};

/**
 * Select component change value using text of menu item to find item
 */
export const selectChangeValueByText = (select: HTMLElement, label: string, onError?: (msg: string) => void): void => {

  fireEvent.click(select.querySelector(".iui-select-button") as HTMLElement);
  const tippy = select.ownerDocument.querySelector("[data-tippy-root]") as HTMLElement;
  const menu = tippy.querySelector(".iui-menu") as HTMLUListElement;
  if (!menu)
    onError && onError(`Couldn't find menu`);
  expect(menu).to.exist;

  const menuItems = menu.querySelectorAll("li span.iui-content");
  if (menuItems.length <= 0)
    onError && onError("Couldn't find any menu items");
  expect(menuItems.length).to.be.greaterThan(0);

  const menuItem = [...menuItems].find((span) => span.textContent === label);
  if (!menuItem)
    onError && onError(`Couldn't find menu item with '${label}' label`);
  expect(menuItem).to.not.be.undefined;

  fireEvent.click(menuItem!);
};

/**
 * Get a iTwinUI Button with a given label
 */
export function getButtonWithText(container: HTMLElement, label: string, onError?: (msg: string) => void): Element | undefined {
  const selector = "button.iui-button";
  const buttons = container.querySelectorAll(selector);
  if (buttons.length <= 0)
    onError && onError(`Couldn't find any '${selector}' buttons`);

  const button = [...buttons].find((btn) => {
    const span = btn.querySelector("span.iui-button-label");
    return span!.textContent === label;
  });
  if (!button)
    onError && onError(`No button found with '${label}' label`);

  return button;
}

/** Handle an error when attempting to get an element */
export function handleError(msg: string) {
  console.log(msg); // eslint-disable-line no-console
}

/** Creates Promise */
export class ResolvablePromise<T> implements PromiseLike<T> {
  private _wrapped: Promise<T>;
  private _resolve!: (value: T) => void;
  public constructor() {
    this._wrapped = new Promise<T>((resolve: (value: T) => void) => {
      this._resolve = resolve;
    });
  }
  public then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): PromiseLike<TResult1 | TResult2> {
    return this._wrapped.then(onfulfilled, onrejected);
  }
  public async resolve(result: T) {
    this._resolve(result);
    await new Promise<void>((resolve: () => void) => {
      setImmediate(resolve);
    });
  }
}

/** Stubs scrollIntoView. */
export function stubScrollIntoView() {
  const originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView;
  const scrollIntoViewMock = function () { };

  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;
  });

  afterEach(() => {
    window.HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  });
}
