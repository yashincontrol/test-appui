/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
/** @module SyncUi */

// cSpell:ignore configurableui
import { UiEvent } from "@bentley/ui-core";
import { FrontstageManager } from "../configurableui/FrontstageManager";
import { Backstage } from "../configurableui/backstage/Backstage";
import { WorkflowManager } from "../configurableui/Workflow";
import { ContentViewManager } from "../configurableui/ContentViewManager";
import { IModelConnection, SelectEventType, IModelApp, SelectedViewportChangedArgs } from "@bentley/imodeljs-frontend";

// cSpell:ignore activecontentchanged, activitymessageupdated, activitymessagecancelled, backstagecloseevent, contentlayoutactivated, contentcontrolactivated,
// cSpell:ignore elementtooltipchanged, frontstageactivated, inputfieldmessageadded, inputfieldmessageremoved, modalfrontstagechanged, modaldialogchanged
// cSpell:ignore navigationaidactivated, notificationmessageadded, toolactivated, taskactivated, widgetstatechanged, workflowactivated frontstageactivating
// cSpell:ignore frontstageready activedgnviewportchanged selectionsetchanged
/** Event Id used to sync UI components. Typically used to refresh visibility or enable state of control. */
export const enum SyncUiEventId {
  ActiveContentChanged = "activecontentchanged",
  BackstageCloseEvent = "backstagecloseevent",
  ContentLayoutActivated = "contentlayoutactivated",
  ContentControlActivated = "contentcontrolactivated",
  FrontstageActivating = "frontstageactivating",
  FrontstageReady = "frontstageready",
  ModalFrontstageChanged = "modalfrontstagechanged",
  ModalDialogChanged = "modaldialogchanged",
  NavigationAidActivated = "navigationaidactivated",
  ToolActivated = "toolactivated",
  TaskActivated = "taskactivated",
  WidgetStateChanged = "widgetstatechanged",
  WorkflowActivated = "workflowactivated",
  ActiveDgnViewportChanged = "activedgnviewportchanged",
  SelectionSetChanged = "selectionsetchanged",
}

/** SyncUi Event arguments. Contains a set of lower case event Ids.
 */
export interface SyncUiEventArgs {
  eventIds: Set<string>;
}

/** SyncUi Event class.
 */
export class SyncUiEvent extends UiEvent<SyncUiEventArgs> { }

/** SyncUi Event Dispatcher class. This class is used to send eventIds to interested Ui components so the component can determine if it needs
 * to refresh its display by calling setState on itself.
 */
export class SyncUiEventDispatcher {
  private static _syncEventTimer: NodeJS.Timer | undefined;
  private static _eventIds: Set<string>;
  private static _eventIdAdded: boolean = false;
  private static _syncUiEvent: SyncUiEvent;
  private static _timeoutPeriod: number = 200;

  /** @hidden - used for testing only */
  public static setTimeoutPeriod(period: number): void {
    SyncUiEventDispatcher._timeoutPeriod = period;
  }

  /** Return set of event ids that will be sent to listeners/. */
  public static get syncEventIds(): Set<string> {
    if (!SyncUiEventDispatcher._eventIds)
      SyncUiEventDispatcher._eventIds = new Set<string>();

    return SyncUiEventDispatcher._eventIds;
  }

  /** Return SyncUiEvent so callers can register an event callback. */
  public static get onSyncUiEvent(): SyncUiEvent {
    if (!SyncUiEventDispatcher._syncUiEvent)
      SyncUiEventDispatcher._syncUiEvent = new SyncUiEvent();

    return SyncUiEventDispatcher._syncUiEvent;
  }

  /** Immediately trigger sync event processing. */
  public static dispatchImmediateSyncUiEvent(eventId: string): void {
    const eventIds = new Set<string>();
    eventIds.add(eventId.toLowerCase());
    SyncUiEventDispatcher.onSyncUiEvent.emit({ eventIds });
  }

  /** Save eventId in Set for processing. */
  public static dispatchSyncUiEvent(eventId: string): void {
    SyncUiEventDispatcher.syncEventIds.add(eventId.toLowerCase());
    if (!SyncUiEventDispatcher._syncEventTimer) {  // if there is not a timer active, create one
      SyncUiEventDispatcher._syncEventTimer = setTimeout(SyncUiEventDispatcher.checkForAdditionalIds, SyncUiEventDispatcher._timeoutPeriod);
    } else {
      SyncUiEventDispatcher._eventIdAdded = true;
    }
  }

  /** Save multiple eventIds in Set for processing. */
  public static dispatchSyncUiEvents(eventIds: string[]): void {
    eventIds.forEach((id) => SyncUiEventDispatcher.syncEventIds.add(id.toLowerCase()));
    if (!SyncUiEventDispatcher._syncEventTimer) {  // if there is not a timer active, create one
      SyncUiEventDispatcher._syncEventTimer = setTimeout(SyncUiEventDispatcher.checkForAdditionalIds, SyncUiEventDispatcher._timeoutPeriod);
    } else {
      SyncUiEventDispatcher._eventIdAdded = true;
    }
  }

  /** Trigger registered event processing when timer has expired and no addition eventId are added. */
  private static checkForAdditionalIds() {
    if (!SyncUiEventDispatcher._eventIdAdded && SyncUiEventDispatcher._syncEventTimer) {
      if (SyncUiEventDispatcher._syncEventTimer) clearTimeout(SyncUiEventDispatcher._syncEventTimer);
      SyncUiEventDispatcher._syncEventTimer = undefined;
      SyncUiEventDispatcher._eventIdAdded = false;
      if (SyncUiEventDispatcher.syncEventIds.size > 0) {
        const eventIds = new Set<string>();
        SyncUiEventDispatcher.syncEventIds.forEach((value) => eventIds.add(value));
        SyncUiEventDispatcher.syncEventIds.clear();
        SyncUiEventDispatcher.onSyncUiEvent.emit({ eventIds });
      }
      return;
    }

    if (SyncUiEventDispatcher._syncEventTimer) clearTimeout(SyncUiEventDispatcher._syncEventTimer);
    SyncUiEventDispatcher._eventIdAdded = false;
    // if events have been added before the initial timer expired wait half that time to see if events are still being added.
    SyncUiEventDispatcher._syncEventTimer = setTimeout(SyncUiEventDispatcher.checkForAdditionalIds, SyncUiEventDispatcher._timeoutPeriod / 2);
  }

  /** Checks to see if an eventId of interest is contained in the set of eventIds */
  public static hasEventOfInterest(eventIds: Set<string>, idsOfInterest: string[]) {
    if ((idsOfInterest.length > 0) && idsOfInterest.some((value: string): boolean => eventIds.has(value)))
      return true;
    return false;
  }

  /** Initializes the Monitoring of Events that trigger dispatching sync events */
  public static initialize() {
    // TODO: add selection change processing event(s)
    FrontstageManager.onContentControlActivatedEvent.addListener(() => {
      SyncUiEventDispatcher.dispatchSyncUiEvent(SyncUiEventId.ContentControlActivated);
    });

    FrontstageManager.onContentLayoutActivatedEvent.addListener(() => {
      SyncUiEventDispatcher.dispatchSyncUiEvent(SyncUiEventId.ContentLayoutActivated);
    });

    FrontstageManager.onFrontstageActivatedEvent.addListener(() => {
      SyncUiEventDispatcher.dispatchSyncUiEvent(SyncUiEventId.FrontstageActivating);
    });

    FrontstageManager.onFrontstageReadyEvent.addListener(() => {
      SyncUiEventDispatcher.dispatchSyncUiEvent(SyncUiEventId.FrontstageReady);
    });

    FrontstageManager.onModalFrontstageChangedEvent.addListener(() => {
      SyncUiEventDispatcher.dispatchSyncUiEvent(SyncUiEventId.ModalFrontstageChanged);
    });

    FrontstageManager.onNavigationAidActivatedEvent.addListener(() => {
      SyncUiEventDispatcher.dispatchSyncUiEvent(SyncUiEventId.NavigationAidActivated);
    });

    FrontstageManager.onToolActivatedEvent.addListener(() => {
      SyncUiEventDispatcher.dispatchSyncUiEvent(SyncUiEventId.ToolActivated);
    });

    FrontstageManager.onWidgetStateChangedEvent.addListener(() => {
      SyncUiEventDispatcher.dispatchSyncUiEvent(SyncUiEventId.WidgetStateChanged);
    });

    Backstage.onBackstageCloseEventEvent.addListener(() => {
      SyncUiEventDispatcher.dispatchSyncUiEvent(SyncUiEventId.BackstageCloseEvent);
    });

    WorkflowManager.onTaskActivatedEvent.addListener(() => {
      SyncUiEventDispatcher.dispatchSyncUiEvent(SyncUiEventId.TaskActivated);
    });

    WorkflowManager.onWorkflowActivatedEvent.addListener(() => {
      SyncUiEventDispatcher.dispatchSyncUiEvent(SyncUiEventId.WorkflowActivated);
    });

    ContentViewManager.onActiveContentChangedEvent.addListener(() => {
      SyncUiEventDispatcher.dispatchSyncUiEvent(SyncUiEventId.ActiveContentChanged);
    });

    if (IModelApp && IModelApp.viewManager)
      IModelApp.viewManager.onSelectedViewportChanged.addListener((args: SelectedViewportChangedArgs) => {
        SyncUiEventDispatcher.dispatchSyncUiEvent(SyncUiEventId.ActiveDgnViewportChanged);

        // if this is the first view being opened up start the default tool so tool admin is happy.
        if (undefined === args.previous)
          IModelApp.toolAdmin.startDefaultTool();
      });
  }

  private static selectionChangedHandler(_iModelConnection: IModelConnection, _evType: SelectEventType, _ids?: Set<string>) {
    SyncUiEventDispatcher.dispatchSyncUiEvent(SyncUiEventId.SelectionSetChanged);
  }

  public static clearConnectionEvents(iModelConnection: IModelConnection) {
    iModelConnection.selectionSet.onChanged.removeListener(SyncUiEventDispatcher.selectionChangedHandler);
  }

  public static initializeConnectionEvents(iModelConnection: IModelConnection) {
    iModelConnection.selectionSet.onChanged.removeListener(SyncUiEventDispatcher.selectionChangedHandler);
    iModelConnection.selectionSet.onChanged.addListener(SyncUiEventDispatcher.selectionChangedHandler);
  }
}
