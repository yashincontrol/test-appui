/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module StatusBar
 */

import classnames from "classnames";
import * as React from "react";
import { ConditionalBooleanValue, ConditionalStringValue, UiSyncEventArgs } from "@itwin/appui-abstract";
import { CommonProps, useRefs, useResizeObserver } from "@itwin/core-react";
import { eqlOverflown } from "@itwin/appui-layout-react";
import { SyncUiEventDispatcher } from "../syncui/SyncUiEventDispatcher";
import { StatusBarOverflow } from "./Overflow";
import { StatusBarOverflowPanel } from "./OverflowPanel";
import { StatusBarCenterSection, StatusBarLeftSection, StatusBarRightSection, StatusBarSpaceBetween } from "./StatusBar";
import { isStatusBarActionItem, isStatusBarCustomItem, isStatusBarLabelItem, StatusBarActionItem, StatusBarItem, StatusBarLabelItem, StatusBarSection } from "./StatusBarItem";
import { useDefaultStatusBarItems } from "./useDefaultStatusBarItems";
import { useUiItemsProviderStatusBarItems } from "./useUiItemsProviderStatusBarItems";
import { StatusBarLabelIndicator } from "../statusbar/LabelIndicator";
import { StatusBarItemsManager } from "./StatusBarItemsManager";
import { isProviderItem } from "../ui-items-provider/isProviderItem";

/** Private  function to generate a value that will allow the proper order to be maintained when items are placed in overflow panel */
function getCombinedSectionItemPriority(item: StatusBarItem) {
  let sectionValue = 0;
  if (item.section === StatusBarSection.Center)
    sectionValue = 100000;
  else if (item.section === StatusBarSection.Context)
    sectionValue = 200000;
  else if (item.section === StatusBarSection.Right)
    sectionValue = 300000;
  return sectionValue + item.itemPriority;
}

interface DockedStatusBarEntryContextArg {
  readonly isOverflown: boolean;
  readonly onResize: (w: number) => void;
}

const DockedStatusBarEntryContext = React.createContext<DockedStatusBarEntryContextArg>(null!);
DockedStatusBarEntryContext.displayName = "nz:DockedStatusBarEntryContext";

/** @internal */
export function useStatusBarEntry() {
  return React.useContext(DockedStatusBarEntryContext);
}

/** Properties of [[DockedStatusBarItem]] component.
 * @internal future
 */
export interface StatusBarItemProps extends CommonProps {
  /** Tool setting content. */
  children?: React.ReactNode;
  itemPriority?: number;
  providerId?: string;
  section?: string;
}

/** Used in [[StatusBarComposer]] component to display a statusbar item.
 * @internal future
 */
export function DockedStatusBarItem(props: StatusBarItemProps) {
  const { onResize } = useStatusBarEntry();
  const ref = useResizeObserver<HTMLDivElement>(onResize);
  const className = classnames(
    "uifw-statusbar-item-container",
    props.className,
  );
  return (
    <div
      data-item-id={props.itemId}
      data-item-type="status-bar-item"
      data-item-location={props.section}
      data-item-priority={props.itemPriority}
      data-item-provider-id={props.providerId}
      className={className}
      ref={ref}
      style={props.style}
    >
      {props.children}
    </div>
  );
}

interface DockedStatusBarEntryProps {
  children?: React.ReactNode;
  entryKey: string;
  getOnResize: (key: string) => (w: number) => void;
}

/** Wrapper for status bar entries so their size can be used to determine if the status bar container can display them or if they will need to be placed in an overflow panel. */
// eslint-disable-next-line @typescript-eslint/naming-convention, no-shadow
function DockedStatusBarEntry({ children, entryKey, getOnResize }: DockedStatusBarEntryProps) {
  const onResize = React.useMemo(() => getOnResize(entryKey), [getOnResize, entryKey]);
  const entry = React.useMemo<DockedStatusBarEntryContextArg>(() => ({
    isOverflown: false,
    onResize,
  }), [onResize]);
  return (
    <DockedStatusBarEntryContext.Provider value={entry}>
      {children}
    </DockedStatusBarEntryContext.Provider>
  );
}

/** Private function to set up sync event monitoring of statusbar items */
function useStatusBarItemSyncEffect(itemsManager: StatusBarItemsManager, syncIdsOfInterest: string[]) {
  React.useEffect(() => {
    const handleSyncUiEvent = (args: UiSyncEventArgs) => {
      if (0 === syncIdsOfInterest.length)
        return;

      // istanbul ignore else
      if (syncIdsOfInterest.some((value: string): boolean => args.eventIds.has(value.toLowerCase()))) {
        // process each item that has interest
        itemsManager.refreshAffectedItems(args.eventIds);
      }
    };

    // Note: that items with conditions have condition run when loaded into the items manager
    SyncUiEventDispatcher.onSyncUiEvent.addListener(handleSyncUiEvent);
    return () => {
      SyncUiEventDispatcher.onSyncUiEvent.removeListener(handleSyncUiEvent);
    };
  }, [itemsManager, itemsManager.items, syncIdsOfInterest]);
}

function StatusBarLabelItemComponent(props: StatusBarLabelItem) {
  const label = ConditionalStringValue.getValue(props.label);
  return (
    <StatusBarLabelIndicator
      iconSpec={props.icon}
      label={label}
    />
  );
}

function StatusBarActionItemComponent(props: StatusBarActionItem) {
  const title = ConditionalStringValue.getValue(props.tooltip);
  return (
    <StatusBarLabelIndicator
      title={title}
      onClick={props.execute}
      iconSpec={props.icon}
    />
  );
}

/** local function to combine items from Stage and from Extensions */
function combineItems(stageItems: ReadonlyArray<StatusBarItem>, addonItems: ReadonlyArray<StatusBarItem>) {
  const items: StatusBarItem[] = [];
  if (stageItems.length) {
    // Walk through each and ensure no duplicate ids are added.
    stageItems.forEach((srcItem) => {
      if (-1 === items.findIndex((item) => item.id === srcItem.id)) {
        items.push(srcItem);
      }
    });
  }
  if (addonItems.length) {
    // Walk through each and ensure no duplicate ids are added.
    addonItems.forEach((srcItem) => {
      if (-1 === items.findIndex((item) => item.id === srcItem.id)) {
        items.push(srcItem);
      }
    });
  }
  return items;
}

/** local function to ensure a width value is defined for a status bar entries.  */
function verifiedMapEntries<T>(map: Map<string, T | undefined>) {
  for (const [, val] of map) {
    // istanbul ignore next
    if (val === undefined)
      return undefined;
  }
  return map as Map<string, T>;
}

/** Returns a subset of docked entry keys that exceed given width and should be placed in overflow panel. */
function getItemToPlaceInOverflow(width: number, docked: ReadonlyArray<readonly [string, number]>, overflowWidth: number) {
  let settingsWidth = 0;

  let i = 0;
  for (; i < docked.length; i++) {
    const w = docked[i][1];
    const newSettingsWidth = settingsWidth + w;
    if (newSettingsWidth > width) {
      settingsWidth += overflowWidth;
      break;
    }
    settingsWidth = newSettingsWidth;
  }

  let j = i;
  for (; j > 0; j--) {
    if (settingsWidth <= width)
      break;
    const w = docked[j][1];
    settingsWidth -= w;
  }

  const overflowItems = new Array<string>();
  for (i = j; i < docked.length; i++) {
    overflowItems.push(docked[i][0]);
  }
  return overflowItems;
}

function isItemInOverflow(id: string, overflowItemIds: ReadonlyArray<string> | undefined) {
  if (!overflowItemIds || 0 === overflowItemIds.length)
    return false;
  return !!overflowItemIds.find((value) => value === id);
}

/** Properties for the [[StatusBarComposer]] React components
 * @public
 */
export interface StatusBarComposerProps extends CommonProps {
  /** Status Bar items */
  items: StatusBarItem[];

  /** CSS class name override for the overall Status Bar */
  mainClassName?: string;
  /** CSS class name override for the left section */
  leftClassName?: string;
  /** CSS class name override for the center section */
  centerClassName?: string;
  /** CSS class name override for the right section */
  rightClassName?: string;
}

/** Component to load components into the [[StatusBar]].
 * @public
 */
export function StatusBarComposer(props: StatusBarComposerProps) {
  const { className, style, items, mainClassName, leftClassName, centerClassName, rightClassName } = props;
  const [defaultItemsManager, setDefaultItemsManager] = React.useState(() => new StatusBarItemsManager(items));
  const [isOverflowPanelOpen, setIsOverflowPanelOpen] = React.useState(false);
  const containerWidth = React.useRef<number | undefined>(undefined);

  const isInitialMount = React.useRef(true);
  React.useEffect(() => {
    if (isInitialMount.current)
      isInitialMount.current = false;
    else {
      setDefaultItemsManager(new StatusBarItemsManager(items));
    }
  }, [items]);
  const defaultItems = useDefaultStatusBarItems(defaultItemsManager);
  const syncIdsOfInterest = React.useMemo(() => StatusBarItemsManager.getSyncIdsOfInterest(defaultItems), [defaultItems]);
  useStatusBarItemSyncEffect(defaultItemsManager, syncIdsOfInterest);

  const [addonItemsManager] = React.useState(() => new StatusBarItemsManager());
  const addonItems = useUiItemsProviderStatusBarItems(addonItemsManager);
  const addonSyncIdsOfInterest = React.useMemo(() => StatusBarItemsManager.getSyncIdsOfInterest(addonItems), [addonItems]);
  useStatusBarItemSyncEffect(addonItemsManager, addonSyncIdsOfInterest);

  const statusBarItems = React.useMemo(() => combineItems(defaultItems, addonItems), [defaultItems, addonItems]);
  const entryWidths = React.useRef(new Map<string, number | undefined>());
  const overflowWidth = React.useRef<number | undefined>(undefined);
  const [overflown, setOverflown] = React.useState<ReadonlyArray<string>>();

  const calculateOverflow = React.useCallback(() => {
    const widths = verifiedMapEntries(entryWidths.current);
    if (containerWidth.current === undefined ||
      widths === undefined ||
      overflowWidth.current === undefined
    ) {
      setOverflown(new Array<string>());
      return;
    }

    // Calculate overflow.
    const newOverflown = getItemToPlaceInOverflow(containerWidth.current, [...widths.entries()], overflowWidth.current);
    if (!eqlOverflown(overflown, newOverflown)) {
      setOverflown(newOverflown);
      // istanbul ignore next
      if (0 === newOverflown.length && isOverflowPanelOpen)
        setIsOverflowPanelOpen(false);
    }
  }, [isOverflowPanelOpen, overflown]);

  const handleOverflowResize = React.useCallback((w: number) => {
    const calculate = overflowWidth.current !== w;
    overflowWidth.current = w;
    calculate && calculateOverflow();
  }, [calculateOverflow]);

  const handleEntryResize = React.useCallback((key: string) => (w: number) => {
    const oldW = entryWidths.current.get(key);
    if ((undefined === oldW) || Math.abs(oldW - w) > 2) {
      entryWidths.current.set(key, w);
      calculateOverflow();
    }
  }, [calculateOverflow]);

  const getSectionName = (section: StatusBarSection) => {
    switch (section) {
      case StatusBarSection.Center:
      case StatusBarSection.Stage:
        return "status-bar-center";
      case StatusBarSection.Context:
        return "status-bar-right-start";
      case StatusBarSection.Right:
      case StatusBarSection.Selection:
        return "status-bar-right-end";
      case StatusBarSection.Left:
      case StatusBarSection.Message:
        return "status-bar-left";
    }
  };

  /** generate a wrapped status bar entry that will report its size. */
  const getComponent = React.useCallback((item: StatusBarItem, key: string, itemPriority: number,
    section: StatusBarSection): React.ReactNode => {
    const providerId = isProviderItem(item) ? item.providerId : undefined;
    return (
      <DockedStatusBarEntry
        key={key}
        entryKey={key}
        getOnResize={handleEntryResize}
      >
        <DockedStatusBarItem key={key} itemId={item.id} itemPriority={itemPriority} providerId={providerId} section={getSectionName(section)} >
          {isStatusBarCustomItem(item) && item.content}
          {isStatusBarActionItem(item) && <StatusBarActionItemComponent {...item} />}
          {isStatusBarLabelItem(item) && <StatusBarLabelItemComponent {...item} />}
        </DockedStatusBarItem>
      </DockedStatusBarEntry>
    );
  }, [handleEntryResize]);

  const getSectionItems = React.useCallback((section: StatusBarSection): React.ReactNode[] => {
    const sectionItems = statusBarItems
      .filter((item) => item.section as number === section && !isItemInOverflow(item.id, overflown) && !ConditionalBooleanValue.getValue(item.isHidden))
      .sort((a, b) => a.itemPriority - b.itemPriority);

    return sectionItems.map((sectionItem) => (
      <React.Fragment key={sectionItem.id}>
        {getComponent(sectionItem, sectionItem.id, sectionItem.itemPriority, sectionItem.section)}
      </React.Fragment>
    ));
  }, [statusBarItems, overflown, getComponent]);

  const getOverflowItems = React.useCallback((): React.ReactNode[] => {
    const itemsInOverflow = statusBarItems
      .filter((item) => isItemInOverflow(item.id, overflown) && !ConditionalBooleanValue.getValue(item.isHidden))
      .sort((a, b) => getCombinedSectionItemPriority(a) - getCombinedSectionItemPriority(b)).reverse();

    return itemsInOverflow.map((item) => (
      <React.Fragment key={item.id}>
        {getComponent(item, item.id, item.itemPriority, item.section)}
      </React.Fragment>
    ));
  }, [statusBarItems, overflown, getComponent]);

  const handleContainerResize = React.useCallback((w: number) => {
    if ((undefined === containerWidth.current) || Math.abs(containerWidth.current - w) > 2) {
      containerWidth.current = w;
      calculateOverflow();
    }
  }, [calculateOverflow]);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const targetRef = React.useRef<HTMLDivElement>(null);
  const resizeObserverRef = useResizeObserver(handleContainerResize);
  // allow  both the containerRef and the resize observer function that takes a ref to be processed when the ref is set.
  const refs = useRefs(containerRef, resizeObserverRef);

  const onOverflowClick = React.useCallback(() => {
    setIsOverflowPanelOpen((prev) => !prev);
  }, []);
  // istanbul ignore next
  const handleOnClose = React.useCallback(() => {
    setIsOverflowPanelOpen(false);
  }, []);
  const leftItems = React.useMemo(() => getSectionItems(StatusBarSection.Left), [getSectionItems]);
  const centerItems = React.useMemo(() => getSectionItems(StatusBarSection.Center), [getSectionItems]);
  const rightItems = React.useMemo(() => getSectionItems(StatusBarSection.Right), [getSectionItems]);
  const contextItems = React.useMemo(() => getSectionItems(StatusBarSection.Context), [getSectionItems]);
  const overflowItems = React.useMemo(() => getOverflowItems(), [getOverflowItems]);

  const containerClassName = classnames(
    "uifw-statusbar-docked",
    className,
  );

  return (
    <div
      className={containerClassName}
      ref={refs}
      style={style}
      role="presentation"
    >
      <StatusBarSpaceBetween className={mainClassName}>
        <StatusBarLeftSection className={leftClassName}>
          {leftItems}
        </StatusBarLeftSection>
        <StatusBarCenterSection className={centerClassName}>
          {centerItems}
          {contextItems}
        </StatusBarCenterSection>
        <StatusBarRightSection className={rightClassName}>
          {rightItems}
          {(!overflown || overflown.length > 0) && (
            <>
              <StatusBarOverflow
                onClick={onOverflowClick}
                onResize={handleOverflowResize}
                ref={targetRef}
              />
              {overflowItems.length > 0 && isOverflowPanelOpen && targetRef.current &&
                <StatusBarOverflowPanel
                  onClose={handleOnClose}
                  open={true}
                  target={targetRef.current}
                >
                  <div className="uifw-statusbar-overflow-items-container" data-testid="uifw-statusbar-overflow-items-container">
                    {overflowItems.map((overflowEntry) => overflowEntry)}
                  </div>
                </StatusBarOverflowPanel>
              }
            </>
          )}

        </StatusBarRightSection>
      </StatusBarSpaceBetween>
    </div>
  );
}
