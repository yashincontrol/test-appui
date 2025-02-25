/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module ConfigurableUi
 */

import { FrontstageProvider } from "../frontstage/FrontstageProvider";
import { KeyboardShortcutProps } from "../framework/FrameworkKeyboardShortcuts";
import { UiFramework } from "../UiFramework";
import { ConfigurableUiControlConstructor, ConfigurableUiElement } from "./ConfigurableUiControl";
import { InternalConfigurableUiManager as internal } from "./InternalConfigurableUiManager";

/** Configurable Ui Manager maintains controls, Frontstages, Content Groups, Content Layouts, Tasks and Workflows.
 * @public
 * @deprecated in 3.7. Use `UiFramework.controls` property.
 */
export class ConfigurableUiManager {
  /** Initializes the InternalConfigurableUiManager and registers core controls.
   * @deprecated in 3.7. This is called internally.
  */
  public static initialize() {
    return internal.initialize();
  }

  /** Registers a control implementing the [[ConfigurableUiElement]] interface.
   * These controls can be a
   * [[ContentControl]],
   * [[NavigationAidControl]],
   * [[StatusBarWidgetControl]],
   * [[WidgetControl]] or
   * [ToolUiProvider]($appui-react).
   * @param classId the class id of the control to register
   * @param constructor the constructor of the control to register
   * @deprecated in 3.7. Use `register` method.
   */
  public static registerControl(classId: string, constructor: ConfigurableUiControlConstructor): void {
    return internal.register(classId, constructor);
  }

  /** Determines if a control has been registered based on its classId.
   * @param classId   the class id of the control to test
   * @returns  true if the control is registered or false if not
   */
  public static isControlRegistered(classId: string): boolean {
    return internal.isRegistered(classId);
  }

  /** Determines if a control has been registered.
   * @internal
   */
  public static getConstructorClassId(constructor: ConfigurableUiControlConstructor): string | undefined {
    return internal.getConstructorClassId(constructor);
  }

  /** Unregisters a control that has been registered.
   * @param classId   the class id of the control to unregister
   * @deprecated in 3.7. Use `unregister` method.
   */
  public static unregisterControl(classId: string): void {
    return internal.unregister(classId);
  }

  /** Creates a control registered by calling registerControl.
   * @param classId   the class id of the control to create
   * @param uniqueId  a unique id for the control
   * @param options   options passed to the constructor of the control
   * @param controlId controlId which may not be unique across all control instances.
   * @returns  the created control
   * @deprecated in 3.7. Use `create` method.
   */
  public static createControl(classId: string, uniqueId: string, options?: any, controlId?: string): ConfigurableUiElement | undefined {
    return internal.create(classId, uniqueId, options, controlId);
  }

  /** Add a Frontstage via a provider into the [[FrontstageManager]].
   * @param frontstageProvider  Provider of the Frontstage to add
   * @deprecated in 3.7. Use `UiFramework.frontstages.addFrontstageProvider` method.
   */
  public static addFrontstageProvider(frontstageProvider: FrontstageProvider): void {
    UiFramework.frontstages.addFrontstageProvider(frontstageProvider);
  }

  /** Loads one or more Keyboard Shortcuts into the [[KeyboardShortcutManager]].
   * @param shortcutList  the properties of the Keyboard Shortcuts to load
   * @deprecated in 3.7. Use `UiFramework.keyboardShortcuts.loadShortcuts` method.
   */
  public static loadKeyboardShortcuts(shortcutList: KeyboardShortcutProps[]): void {
    UiFramework.keyboardShortcuts.loadShortcuts(shortcutList);
  }

  /** Gets the HTML wrapper element for Configurable UI */
  public static getWrapperElement(): HTMLElement {
    return internal.getWrapperElement();
  }

  /** Closes all UI popups currently open */
  public static closeUi(): void {
    return internal.closeUi();
  }

}
