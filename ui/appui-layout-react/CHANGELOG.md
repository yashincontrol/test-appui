# Change Log - @itwin/appui-layout-react

This log was last generated on Fri, 17 Mar 2023 17:52:32 GMT and should not be manually modified.

## 3.6.2
Fri, 17 Mar 2023 17:52:32 GMT

### Updates

- Added header to GroupProps

## 3.6.1
Fri, 24 Feb 2023 22:00:48 GMT

_Version update only_

## 3.6.0
Wed, 08 Feb 2023 14:58:39 GMT

### Updates

- Fix a floating widget resize issue.
- Fix Grip.scss webpack variables issue.
- Updated the side panel handles
- Fix floating widget offset issue.

## 3.5.6
Fri, 24 Feb 2023 16:02:47 GMT

_Version update only_

## 3.5.5
Thu, 26 Jan 2023 22:53:27 GMT

_Version update only_

## 3.5.4
Wed, 18 Jan 2023 15:27:15 GMT

_Version update only_

## 3.5.3
Fri, 13 Jan 2023 17:23:07 GMT

_Version update only_

## 3.5.2
Wed, 11 Jan 2023 16:46:30 GMT

_Version update only_

## 3.5.1
Thu, 15 Dec 2022 16:38:28 GMT

_Version update only_

## 3.5.0
Wed, 07 Dec 2022 19:12:36 GMT

### Updates

- Expose onMouseEnter and onMouseLeave events for a FloatingWidget.
- upgrade to node 18
- Number sort
- Close widget overflow popup when panel is collapsed.
- Bring panel handle on top of panel splitter
- Unpin classnames package, enable allowSynteticDefaultImports to use latest.
- Deprecate all components.
- Use --buic-toolbar-opacity to set the opacity of toolbar items.
- Update TabState to honor allowedPanelTargets when creating new widgets.

## 3.4.7
Wed, 30 Nov 2022 14:28:19 GMT

_Version update only_

## 3.4.6
Tue, 22 Nov 2022 14:24:19 GMT

_Version update only_

## 3.4.5
Thu, 17 Nov 2022 21:32:49 GMT

_Version update only_

## 3.4.4
Thu, 10 Nov 2022 19:32:17 GMT

_Version update only_

## 3.4.3
Fri, 28 Oct 2022 13:34:57 GMT

_Version update only_

## 3.4.2
Mon, 24 Oct 2022 13:23:45 GMT

_Version update only_

## 3.4.1
Mon, 17 Oct 2022 20:06:51 GMT

_Version update only_

## 3.4.0
Thu, 13 Oct 2022 20:24:47 GMT

### Updates

- Updated Message Center dialog to have static width between tabs.
- Fix a floating widget resize issue.
- Correctly remove floating widgets from NineZoneState.
- Determine bounds when adding a new floating widget.
- Updated Node types declaration to support latest v16
- Fix panel splitters being interactive when the panels are not.
- New icons from Visual Design team for pin/unpin panel.
- Fix auto-sized floating widget position when dragging.
- Fix styling to correctly overflow widget content.
- Add pulse animation to widget targets.
- Increase visibility of widget targets.

## 3.3.5
Tue, 27 Sep 2022 11:50:59 GMT

### Updates

- New icons from Visual Design team for pin/unpin panel.
- Fix styling to correctly overflow widget content.

## 3.3.4
Thu, 08 Sep 2022 19:00:04 GMT

_Version update only_

## 3.3.3
Tue, 06 Sep 2022 20:54:19 GMT

_Version update only_

## 3.3.2
Thu, 01 Sep 2022 14:37:22 GMT

_Version update only_

## 3.3.1
Fri, 26 Aug 2022 15:40:02 GMT

_Version update only_

## 3.3.0
Thu, 18 Aug 2022 19:08:01 GMT

### Updates

- upgrade mocha to version 10.0.0
- Keep floating widget visible while dragged (with UI auto-hide enabled).
- Fix an issue where a widget is not removed correctly in FLOATING_WIDGET_SEND_BACK action.
- Fix styling of tab overflow menu.
- Deprecated `isInFooterMode` for `FooterIndicator`, should always be considered true.
- Fix widget duplication in send back action.
- Fix processing of widget container dragging to empty panel.
- Add hideWithUiWhenFloating prop to widgets so that an app can opt into hiding specific floating widgets when the UI automatically hides.
- Save state of floating widgets when they are hidden
- Add updated widget targets.
- Update iTwinUI-react to 1.38.1
- Allow tippy.js to close when tab is clicked.

## 3.2.9
Fri, 26 Aug 2022 14:21:40 GMT

_Version update only_

## 3.2.8
Tue, 09 Aug 2022 15:52:41 GMT

_Version update only_

## 3.2.7
Mon, 01 Aug 2022 13:36:56 GMT

_Version update only_

## 3.2.6
Fri, 15 Jul 2022 19:04:43 GMT

_Version update only_

## 3.2.5
Wed, 13 Jul 2022 15:45:52 GMT

_Version update only_

## 3.2.4
Tue, 21 Jun 2022 18:06:33 GMT

_Version update only_

## 3.2.3
Fri, 17 Jun 2022 15:18:39 GMT

_Version update only_

## 3.2.2
Fri, 10 Jun 2022 16:11:36 GMT

_Version update only_

## 3.2.1
Tue, 07 Jun 2022 15:02:56 GMT

_Version update only_

## 3.2.0
Fri, 20 May 2022 13:10:54 GMT

### Updates

- Add ability to pass parameters to UiItemsManager when loading items provider to specify what stages allow the provider to supply items.
- Add option to auto-collapse unpinned widget panels.
- Animate tool settings appearance in the docked tool settings bar.

## 3.1.3
Fri, 15 Apr 2022 13:49:25 GMT

_Version update only_

## 3.1.2
Wed, 06 Apr 2022 22:27:56 GMT

_Version update only_

## 3.1.1
Thu, 31 Mar 2022 15:55:48 GMT

_Version update only_

## 3.1.0
Tue, 29 Mar 2022 20:53:46 GMT

### Updates

- Add data attributes to identify item and its UI provider.
- Update to itwinui-css version "0.44.0".
- Update to @itwin/itwinui-react: 1.32.0
- Update to latest itwinui-react

## 3.0.3
Fri, 25 Mar 2022 15:10:01 GMT

_Version update only_

## 3.0.2
Thu, 10 Mar 2022 21:18:13 GMT

_Version update only_

## 3.0.1
Thu, 24 Feb 2022 15:26:55 GMT

_Version update only_

## 3.0.0
Mon, 24 Jan 2022 14:00:52 GMT

### Updates

- Upgrade target to ES2019 and deliver both a CommonJs and ESModule version of package
- Update Floating Widget to allow overflow so popups like from Select component will properly display.
- rename to @itwin/appui-layout-react
- Update snapshots
- Support for TypeDoc v0.22.7. Fix various broken docs links.
- Create empty frontstage and UiItemsProviders to populate it and update how ContentGroups are defined.
- update immer to fix security warning
- Deprecate obsolete APIs. Publish beta APIs from last release.
- Remove link to learning doc that's no longer delivered.
- Upgraded itwinui-react to 1.16.2. Fixed editor sizes.
- Update styling on some status field items for better popup alignment.
- Allow widgets supplied by a UiItemsProvider to specify a default state of floating.
- Update to latest itwinui-react
- Clean up css for status bar entries to avoid unwanted text wrapping
- Incorporating iTwinUI-CSS and iTwinUI-React into iModel.js
- Rename ui directories to match new package names.
- Initialize popout window size and position when popping out from floating state to avoid crash.
- Update to React 17.
- Created imodel-components folder & package and moved color, lineweight, navigationaids, quantity, timeline & viewport. Deprecated MessageSeverity in ui-core & added it ui-abstract. Added MessagePresenter interface to ui-abstract.
- Remove react 16 peer dependency.
- Remove WidgetProvider and associated events.
- fix bad styling on message center status bar item.
- Replaced ui-core Slider with one from iTwinUi-react.
- Update to latest types/react package
- reset to use overflow hidden in floating widgets as it messes up auto-sizing and re-sizing.
- Add support for widget tab icons in UI-2
- Update widget tab styling to provide padding between icon and active stripe.
- Lock down and update version numbers so docs will build.

## 2.19.28
Wed, 12 Jan 2022 14:52:38 GMT

_Version update only_

## 2.19.27
Wed, 05 Jan 2022 20:07:20 GMT

_Version update only_

## 2.19.26
Wed, 08 Dec 2021 20:54:53 GMT

_Version update only_

## 2.19.25
Fri, 03 Dec 2021 20:05:49 GMT

_Version update only_

## 2.19.24
Mon, 29 Nov 2021 18:44:31 GMT

_Version update only_

## 2.19.23
Mon, 22 Nov 2021 20:41:40 GMT

_Version update only_

## 2.19.22
Wed, 17 Nov 2021 01:23:26 GMT

_Version update only_

## 2.19.21
Wed, 10 Nov 2021 10:58:24 GMT

_Version update only_

## 2.19.20
Fri, 29 Oct 2021 16:14:22 GMT

_Version update only_

## 2.19.19
Mon, 25 Oct 2021 16:16:25 GMT

### Updates

- Drop unnecessary dep on @bentley/react-scripts; add a *.d.ts file for svg?sprite loader syntax

## 2.19.18
Thu, 21 Oct 2021 20:59:44 GMT

### Updates

- Fix statusbar styling issue report by Design Review team.

## 2.19.17
Thu, 14 Oct 2021 21:19:43 GMT

_Version update only_

## 2.19.16
Mon, 11 Oct 2021 17:37:46 GMT

_Version update only_

## 2.19.15
Fri, 08 Oct 2021 16:44:23 GMT

_Version update only_

## 2.19.14
Fri, 01 Oct 2021 13:07:03 GMT

_Version update only_

## 2.19.13
Tue, 21 Sep 2021 21:06:40 GMT

_Version update only_

## 2.19.12
Wed, 15 Sep 2021 18:06:47 GMT

_Version update only_

## 2.19.11
Thu, 09 Sep 2021 21:04:58 GMT

_Version update only_

## 2.19.10
Wed, 08 Sep 2021 14:36:01 GMT

_Version update only_

## 2.19.9
Wed, 25 Aug 2021 15:36:01 GMT

_Version update only_

## 2.19.8
Mon, 23 Aug 2021 13:23:13 GMT

_Version update only_

## 2.19.7
Fri, 20 Aug 2021 17:47:22 GMT

_Version update only_

## 2.19.6
Tue, 17 Aug 2021 20:34:29 GMT

_Version update only_

## 2.19.5
Fri, 13 Aug 2021 21:48:09 GMT

_Version update only_

## 2.19.4
Thu, 12 Aug 2021 13:09:26 GMT

_Version update only_

## 2.19.3
Wed, 04 Aug 2021 20:29:34 GMT

_Version update only_

## 2.19.2
Tue, 03 Aug 2021 18:26:23 GMT

_Version update only_

## 2.19.1
Thu, 29 Jul 2021 20:01:11 GMT

### Updates

- Initialize size and position of popout window when popping a widget out from floating state.

## 2.19.0
Mon, 26 Jul 2021 12:21:25 GMT

_Version update only_

## 2.18.4
Tue, 10 Aug 2021 19:35:13 GMT

_Version update only_

## 2.18.3
Wed, 28 Jul 2021 17:16:30 GMT

_Version update only_

## 2.18.2
Mon, 26 Jul 2021 16:18:31 GMT

_Version update only_

## 2.18.1
Fri, 16 Jul 2021 17:45:09 GMT

_Version update only_

## 2.18.0
Fri, 09 Jul 2021 18:11:24 GMT

### Updates

- Add ability to provide widgets to zones via UiItemsProvider when using AppUI version 1.

## 2.17.3
Mon, 26 Jul 2021 16:08:36 GMT

_Version update only_

## 2.17.2
Thu, 08 Jul 2021 15:23:00 GMT

_Version update only_

## 2.17.1
Fri, 02 Jul 2021 15:38:31 GMT

_Version update only_

## 2.17.0
Mon, 28 Jun 2021 16:20:11 GMT

### Updates

- Add ability to define state of popout widgets in NinezoneState.
- Add ability to maintain tab state even if UiItemsProvider that added the tab is not loaded. This allow preference size to be maintained.
- fix css deprecation warning about using 'fit-available'.
- Update scss to remove use of slash for division to avoid SASS deprecation warnings.
- Fix sass error reported by Civil iTwin.
- publish in-use APIs

## 2.16.10
Thu, 22 Jul 2021 20:23:45 GMT

_Version update only_

## 2.16.9
Tue, 06 Jul 2021 22:08:34 GMT

_Version update only_

## 2.16.8
Fri, 02 Jul 2021 17:40:46 GMT

_Version update only_

## 2.16.7
Mon, 28 Jun 2021 18:13:04 GMT

_Version update only_

## 2.16.6
Mon, 28 Jun 2021 13:12:55 GMT

_Version update only_

## 2.16.5
Fri, 25 Jun 2021 16:03:01 GMT

_Version update only_

## 2.16.4
Wed, 23 Jun 2021 17:09:07 GMT

_Version update only_

## 2.16.3
Wed, 16 Jun 2021 20:29:32 GMT

_Version update only_

## 2.16.2
Thu, 03 Jun 2021 18:08:11 GMT

_Version update only_

## 2.16.1
Thu, 27 May 2021 20:04:22 GMT

_Version update only_

## 2.16.0
Mon, 24 May 2021 15:58:39 GMT

### Updates

- Update unit tests for resizeObserver fix.
- Update test to account for different number of calls to getBoundingClientRect.
- Update to latest classnames package 

## 2.15.6
Wed, 26 May 2021 15:55:19 GMT

### Updates

- Footer separator fix

## 2.15.5
Thu, 20 May 2021 15:06:27 GMT

_Version update only_

## 2.15.4
Tue, 18 May 2021 21:59:07 GMT

_Version update only_

## 2.15.3
Mon, 17 May 2021 13:31:38 GMT

### Updates

- Update unit tests for resizeObserver fix.

## 2.15.2
Wed, 12 May 2021 18:08:13 GMT

_Version update only_

## 2.15.1
Wed, 05 May 2021 13:18:31 GMT

_Version update only_

## 2.15.0
Fri, 30 Apr 2021 12:36:58 GMT

### Updates

- Specify grid-column in the scss for the Navigation and Tools widgets.

## 2.14.4
Thu, 22 Apr 2021 21:07:34 GMT

_Version update only_

## 2.14.3
Thu, 15 Apr 2021 15:13:16 GMT

### Updates

- Cleanup statusbar styling to ensure items are centered and do not overflow area.

## 2.14.2
Thu, 08 Apr 2021 14:30:09 GMT

_Version update only_

## 2.14.1
Mon, 05 Apr 2021 16:28:00 GMT

_Version update only_

## 2.14.0
Fri, 02 Apr 2021 13:18:42 GMT

### Updates

- Add api to float and dock widgets in UI2.0.
- Replace custom assert definition with one from bentleyjs-core.

## 2.13.0
Tue, 09 Mar 2021 20:28:13 GMT

### Updates

- Updated to use TypeScript 4.1
- Floating widget opacity for UI 2.0. Slider formatMin, formatMax props.
- begin rename project from iModel.js to iTwin.js

## 2.12.3
Mon, 08 Mar 2021 15:32:00 GMT

_Version update only_

## 2.12.2
Wed, 03 Mar 2021 18:48:53 GMT

_Version update only_

## 2.12.1
Tue, 23 Feb 2021 20:54:45 GMT

_Version update only_

## 2.12.0
Thu, 18 Feb 2021 22:10:13 GMT

_Version update only_

## 2.11.2
Thu, 18 Feb 2021 02:50:59 GMT

_Version update only_

## 2.11.1
Thu, 04 Feb 2021 17:22:41 GMT

_Version update only_

## 2.11.0
Thu, 28 Jan 2021 13:39:27 GMT

### Updates

- Allow all PopupProps to be passed in to FooterPopup.
- Fix double border issue in minimized active widget tab.
- Update panel transition to persist content size when collapsing.

## 2.10.3
Fri, 08 Jan 2021 18:34:03 GMT

_Version update only_

## 2.10.2
Fri, 08 Jan 2021 14:52:02 GMT

_Version update only_

## 2.10.1
Tue, 22 Dec 2020 00:53:38 GMT

_Version update only_

## 2.10.0
Fri, 18 Dec 2020 18:24:01 GMT

### Updates

- Cancel requested animation frame in Panel component.
- Improve panel widget transitions.
- Render single border between panel widgets.

## 2.9.9
Sun, 13 Dec 2020 19:00:03 GMT

_Version update only_

## 2.9.8
Fri, 11 Dec 2020 02:57:36 GMT

_Version update only_

## 2.9.7
Wed, 09 Dec 2020 20:58:23 GMT

_Version update only_

## 2.9.6
Mon, 07 Dec 2020 18:40:48 GMT

_Version update only_

## 2.9.5
Sat, 05 Dec 2020 01:55:56 GMT

_Version update only_

## 2.9.4
Wed, 02 Dec 2020 20:55:40 GMT

_Version update only_

## 2.9.3
Mon, 23 Nov 2020 20:57:56 GMT

_Version update only_

## 2.9.2
Mon, 23 Nov 2020 15:33:50 GMT

_Version update only_

## 2.9.1
Thu, 19 Nov 2020 17:03:42 GMT

_Version update only_

## 2.9.0
Wed, 18 Nov 2020 16:01:50 GMT

### Updates

- Update widget colors.
- Fix widget grip position issue.
- Fix incorrect targeted state of tab targets.

## 2.8.1
Tue, 03 Nov 2020 00:33:56 GMT

_Version update only_

## 2.8.0
Fri, 23 Oct 2020 17:04:02 GMT

### Updates

- Allow to expand collapsed panel with unitialized size.
- Added jsdoc ESLint rule for UI packages

## 2.7.6
Wed, 11 Nov 2020 16:28:23 GMT

_Version update only_

## 2.7.5
Fri, 23 Oct 2020 16:23:51 GMT

_Version update only_

## 2.7.4
Mon, 19 Oct 2020 17:57:02 GMT

### Updates

- Add timer to panel auto expander.

## 2.7.3
Wed, 14 Oct 2020 17:00:59 GMT

_Version update only_

## 2.7.2
Tue, 13 Oct 2020 18:20:39 GMT

_Version update only_

## 2.7.1
Thu, 08 Oct 2020 13:04:35 GMT

_Version update only_

## 2.7.0
Fri, 02 Oct 2020 18:03:32 GMT

### Updates

- Footer indicator improvement
- Fixed lint warnings.
- Table cell editing via keyboard

## 2.6.5
Sat, 26 Sep 2020 16:06:34 GMT

_Version update only_

## 2.6.4
Tue, 22 Sep 2020 17:40:07 GMT

_Version update only_

## 2.6.3
Mon, 21 Sep 2020 14:47:10 GMT

_Version update only_

## 2.6.2
Mon, 21 Sep 2020 13:07:45 GMT

_Version update only_

## 2.6.1
Fri, 18 Sep 2020 13:15:09 GMT

_Version update only_

## 2.6.0
Thu, 17 Sep 2020 13:16:12 GMT

### Updates

- BadgeType support for Backstage items
- Moved ESLint configuration to a plugin
- Addressed ESLint warnings in UI packages. Fixed react-set-state-usage rule. Allowing PascalCase for functions in UI packages for React function component names.
- Update minimized active tab styling.
- Increase invisible clickable bounds of stage panel resize grip.
- Add resizable flag to PanelState.
- Required active tab id in WidgetState.
- Add panel collapse transition and auto-collapse interaction for unpinned panels.
- Ability to provide allowed panel targets for a tab.
- Widget tab badge support.

## 2.5.5
Wed, 02 Sep 2020 17:42:23 GMT

_Version update only_

## 2.5.4
Fri, 28 Aug 2020 15:34:16 GMT

_Version update only_

## 2.5.3
Wed, 26 Aug 2020 11:46:00 GMT

_Version update only_

## 2.5.2
Tue, 25 Aug 2020 22:09:08 GMT

_Version update only_

## 2.5.1
Mon, 24 Aug 2020 18:13:04 GMT

_Version update only_

## 2.5.0
Thu, 20 Aug 2020 20:57:10 GMT

### Updates

- Fixed updating focus when Tabs activeIndex updated. More a11y issues.
- Added eslint-plugin-jsx-a11y devDependency and made first pass at adding a11y roles
- Added react-axe and resolved some a11y issues
- Moved SpecialKey & FunctionKey enums to ui-abstract & started using them throughout UI packages
- lock down @types/react version at 16.9.43 to prevent build error from csstype dependency
- Added Table component keyboard row selection. Miscellaneous a11y fixes.
- Switch to ESLint
- Add drop shadow to toolsettings overflow popup.  
- Close widget overflow popup when tab is clicked.
- Add corner resize handles to floating widgets.
- Add preferredPanelWidgetSize to TabState.

## 2.4.2
Fri, 14 Aug 2020 16:34:09 GMT

_Version update only_

## 2.4.1
Fri, 07 Aug 2020 19:57:43 GMT

_Version update only_

## 2.4.0
Tue, 28 Jul 2020 16:26:24 GMT

### Updates

- Contain floating widget bounds.
- Ability to provide title for dock tool settings button.
- Persist floating widget size.
- Add send home button to floating widgets.
- Use Popup components for widget overflow and tool settings overflow popups.

## 2.3.3
Thu, 23 Jul 2020 12:57:15 GMT

_Version update only_

## 2.3.2
Tue, 14 Jul 2020 23:50:36 GMT

_Version update only_

## 2.3.1
Mon, 13 Jul 2020 18:50:14 GMT

_Version update only_

## 2.3.0
Fri, 10 Jul 2020 17:23:14 GMT

### Updates

- Fix tool settings styling on FireFox. Floating Toolsettings was missing z-index.
- Replace PointerEvents with touch and mouse events.

## 2.2.1
Tue, 07 Jul 2020 14:44:52 GMT

_Version update only_

## 2.2.0
Fri, 19 Jun 2020 14:10:03 GMT

### Updates

- Updates to documentation
- Added support for popup with multiple editors
- Fix widget panel interactions on touch devices.
- Prevent widget content renderer from overflowing widget tabs.
- Fix touch drag of tool settings handle.
- Fix widget drag interactions for touch devices.
- Fix widget content flicker when expanding minimized widget.

## 2.1.0
Thu, 28 May 2020 22:48:59 GMT

### Updates

- Fix toolbar overflow panel display.
- Remove border on small app button.
- Address React warnings about deprecated methods.
- Contain floating widgets in visible nine zone area.
- Use react-scripts for demo app.

## 2.0.0
Wed, 06 May 2020 13:17:49 GMT

### Updates

- Add support for 2.0 ui Tool and Navigation widgets to react to UiFramework.onUiVisibilityChanged events
- Removed @deprecated APIs from ui-framework & ui-core and updated NextVersion.md
- Removed deprecated Expandable item History Tray support
- fix sizing of SvgSprite icons in backstage.
- Add missing tilde to scss files
- Address warning to convert 'start' to 'flex start'
- Fix bug 292829 where toolbar border displayed when all items are hidden.
- Update test to avoid warnings.
- Fixed ReactResizeDetector usage after upgrade. Converted Toggle component to function. Hover/pressed styling in 2.0 Toolbar.
- Using center of Messages indicator as target. Added CSS classname overrides to StatusBarComposer for sections. UI 2.0 color tweaks.
- Ui 2.0 - Blur the toolbar item background
- update styling of widget panel background color
-  Updates to remove need for svg-sprite-loader, use defualt CRA svgr loader instead.
- Upgrade to Rush 5.23.2
- Fixed Safari browser issues
- Update StatusBarComposer to support Overflow panel.
- Ui 2.0 - Toolbar display changes
- Updated Toolbar colors/opacity for Ui 2.0
- Move common hooks to ui-core.
- Move react to peerDependencies.
- Learning documentation for ui-core
- TOC for UI 2.0 Docs, @alpha to @beta, Components Examples
- Ability to drag docked tool settings to widget mode.
- Support for floating widget targets.
- Fix safe area insets for bottom zones w/o footer. 
- Keep active tab visible.
- Reparent widget content when dragging widget around.
- Floating widget stacking order.
- Map children to panes fix.
- Upgraded icons-generic-webfont to ^1.0.0
- Update auto-generated dialog items to work with the Tool Settings Bar.
- Update stage panels to not hide overflow to popups are not clipped.
- Minor styling changes
- Remove support for the iModel.js module system by no longer delivering modules.
- Update how overflow toolsetting panel is constructed.

## 1.14.1
Wed, 22 Apr 2020 19:04:00 GMT

_Version update only_

## 1.14.0
Tue, 31 Mar 2020 15:44:19 GMT

_Version update only_

## 1.13.0
Wed, 04 Mar 2020 16:16:31 GMT

### Updates

- Fix safe area insets for bottom zones w/o footer.

## 1.12.0
Wed, 12 Feb 2020 17:45:50 GMT

### Updates

- Upgraded icons-generic-webfont to ^1.0.0

## 1.11.0
Wed, 22 Jan 2020 19:24:12 GMT

### Updates

- Upgrade to TypeScript 3.7.2.
- Docked tool settings component.

## 1.10.0
Tue, 07 Jan 2020 19:44:01 GMT

### Updates

- Fix widget target infinite set state issue.
- Add css option to pad between icon and label in Label StatusBar Indicator.

## 1.9.0
Tue, 10 Dec 2019 18:08:56 GMT

### Updates

- Invoke onTargetChanged when component unmounts.
- No longer accessing this.state or this.props in setState updater - flagged by lgtm report
- Added support for NotifyMessageDetails.displayTime for Toast messages
- Ability to determine available tool settings width.
- Fix code analysis report issues.
- Use exhaustive-deps linter rule.
- Expandable group touch support.
- Use typescript as webpack configuration language.
- Ability to set zone width from zones manager.
- Removed unused React state variables. Removed unsupported setState calls from render() methods.
- Added ConditionalField and FooterModeField components. StatusBar responsive changes.

## 1.8.0
Fri, 22 Nov 2019 14:03:34 GMT

### Updates

- Update Icon package version.
- Tablet responsive UI
- Added StatusBarComposer, StatusBarItem, StatusBarManager and StatusBarItemsManager
- Added tslint-react-hooks to UI packages
- Remove unsupported fit-content CSS value.
- Fix flex CSS rule shorthand issue in stage panel splitter.
- Touch support for widget drag, widget resize and stage panel splitter.
- Add disabled resize handles option to widget.
- Deprecate history tray components.
- Open tool panel via drag interaction.

## 1.7.0
Fri, 01 Nov 2019 13:28:37 GMT

### Updates

- Fixed mouse interaction for Navigation Aids
- Made the Status Bar & Backstage more responsive on smaller screens
- Added initial ui-abstract package setup
- Added UiAdmin with support for displaying Menus and Toolbars at a location
- Merge zone to save window resize settings and update target zone bounds.
- Fix footer offset in widget mode.
- Enable pointer events over toolbar instead of toolbar container.
- Persist zones layout on window resize.
- Fix Safari high CPU issue.

## 1.6.0
Wed, 09 Oct 2019 20:28:43 GMT

### Updates

- Added AutoSuggest component and improved KeyinBrowser component
- Ability to drag and resize tool settings widget.
- Change prop type from RefObject<T> to T.

## 1.5.0
Mon, 30 Sep 2019 22:28:48 GMT

### Updates

- copyright headers
- Tool Assistance changes per UX Design
- Tool Assistance for Ctrl+Z and other chars
- upgrade to TypeScript 3.6.2
- Prevent BackstageItem label overflow.
- Make components aware of safe area insets.
- Enable backstage scrolling.
- Scrollable tool settings content.

## 1.4.0
Tue, 10 Sep 2019 12:09:49 GMT

### Updates

- Allow an app to specify touch-specific instructions in tool assistance.

## 1.3.0
Tue, 13 Aug 2019 20:25:53 GMT

### Updates

- Update to use latest icon library
- Add support for BackstageComposer so Plugins can add backstage items.
- Added CursorPrompt, improved Pointer messages
- Fixed Group Button history is overlapping a Popup Button panel when hovering over the Group button
- Updated generic icon package
- Moved Point, PointProps, Rectangle, RectangleProps, Size and SizeProps to ui-core from ui-ninezone
- Improved ToolAssistance item spacing. ViewSelector shows current view.
- Update to latest icon package version.

## 1.2.0
Wed, 24 Jul 2019 11:47:26 GMT

### Updates

- Move zonesBounds from manager to props.
- Update horizontal toolbar styles
- Update <img> height/width for toolbar items so svg icons would display.
- Added ToolAssistance support and Tool.iconSpec
- Demo changes.
- Refactor and test ZonesManager.

## 1.1.0
Mon, 01 Jul 2019 19:04:29 GMT

### Updates

- Added beta badge support to toolbar buttons and widget tabs
- Resolved tslint issue with ui-ninezone demo
- Removed missing group descriptions
- Update to TypeScript 3.5
- Add stage panel support.

## 1.0.0
Mon, 03 Jun 2019 18:09:39 GMT

### Updates

- Added UI Logger & UiError usage & improved i18n calls
- Update to css-loader 2.1.1
- Moved NoChildrenProps, OmitChildrenProp and flattenChildren to ui-core from ui-ninezone
- Added Overflow button support
- Release tag cleanup and ui-framework unit tests
- Add support for solar timeline.
- Added NumericInput component to ui-core. Added dependency on react-numeric-input.
- Prevent zones component from creating a stacking context.

## 0.191.0
Mon, 13 May 2019 15:52:05 GMT

### Updates

- Update to latest version of icon library.
- @beta tags for Toolbar. More React.PureComponent usage. Added constructors to prevent deprecated warnings. Coverage minimum thresholds.
- Fixed AppButton onClick on Firefox and bar color
- CommonProps usage in ui-framework. SvgPath sample in ui-test-app. Added tools/build/tslint-docs.json.
- Show/Hide UI enhancements. Widget Opacity enhancements.
- Added local snapshot support to ui-test-app. Added specialized div components to ui-core.
- Fix broken links
- Fixed Viewport heights & initial navigation aid. Widget transparency.
- From hackathon-ui-team: StagePanels, UI Show/Hide, PopupButtons
- Put sourcemap in npm package.
- Require React & React-dom 16.8
- Update icons-generic-webfont version to latest available.
- Add TitleBar component for toolsetting instead of using one from footer. Title bas needed to be more compact in toolsettings widget.
- Tool Settings: removed minimize tab, added min to title bar, styled title
- Auto close popups when clicking outside.
- Move zone components to @beta.
- Move tool settings components to @beta.
- Remove popover components.
- Prevent widget content unmount in 9-Zone demo.
- Change start to flex-start to avoid linting warnings from postcss-loader
- Upgrade TypeDoc dependency to 0.14.2

## 0.190.0
Thu, 14 Mar 2019 14:26:49 GMT

### Updates

- Added 'uifw-' to ContentLayout CSS class names and others. Fixed Status Bar separators.
- Added 'uifw-' prefix to most ui-framework CSS class names
- Cleaned up index.scss for variables & mixins in ui-core and added classes.scss that generates CSS

## 0.189.0
Wed, 06 Mar 2019 15:41:22 GMT

### Updates

- UI documentation fixes
- Use new buildIModelJsBuild script
- Remove unneeded typedoc plugin dependency
- Minor UI Color Theme changes
- Support for including CSS files in published UI packages
- Added styling capability ot messages
- Removed dependency on BWC. Parts of BWC copied into ui-core in preparation for theming support.
- Added ToggleEditor. Support for defaultTool in Frontstage.
- Save BUILD_SEMVER to globally accessible map
- Added support for UI color themes
- Display status message above status indicator popup.
- Update to use newer generic-icons-webfont package.
- Upgrade to TypeScript 3.2.2

## 0.188.0
Wed, 16 Jan 2019 16:36:09 GMT

_Version update only_

## 0.187.0
Tue, 15 Jan 2019 15:18:59 GMT

_Version update only_

## 0.186.0
Mon, 14 Jan 2019 23:09:10 GMT

### Updates

- Add Status Field to show selection count

## 0.185.0
Fri, 11 Jan 2019 18:29:00 GMT

_Version update only_

## 0.184.0
Thu, 10 Jan 2019 22:46:17 GMT

### Updates

- Keyboard Shortcut support
- Ensure unique relative paths in ninezone source.

## 0.183.0
Mon, 07 Jan 2019 21:49:21 GMT

_Version update only_

## 0.182.0
Mon, 07 Jan 2019 13:31:34 GMT

_Version update only_

## 0.181.0
Fri, 04 Jan 2019 13:02:40 GMT

_Version update only_

## 0.180.0
Wed, 02 Jan 2019 15:18:23 GMT

_Version update only_

## 0.179.0
Wed, 19 Dec 2018 18:26:14 GMT

### Updates

- Added showDialogInitially support to ActivityMessageDetails
- Refactor Tooltip component to position over multiple viewports.

## 0.178.0
Thu, 13 Dec 2018 22:06:10 GMT

### Updates

- Migrate from React.Component to React.PureComponent

## 0.177.0
Wed, 12 Dec 2018 17:21:32 GMT

_Version update only_

## 0.176.0
Mon, 10 Dec 2018 21:19:45 GMT

_Version update only_

## 0.175.0
Mon, 10 Dec 2018 17:08:55 GMT

_Version update only_

## 0.174.0
Mon, 10 Dec 2018 13:24:09 GMT

_Version update only_

## 0.173.0
Thu, 06 Dec 2018 22:03:29 GMT

### Updates

- Fixed initial & return layout of Frontstage. Styling of scrollbar in Chrome.
- Custom imodelJs noDirectImport lint rule implemented, noDuplicateImport lint rule turned on.

## 0.172.0
Tue, 04 Dec 2018 17:24:39 GMT

### Updates

- Created index file to match package name, eliminate subdirectory index files, decrease usage of default exports, some class name changes to avoid conflicts in the index file.

## 0.171.0
Mon, 03 Dec 2018 18:52:58 GMT

### Updates

- Changed Omit typedef source from ui/ninezone to ui/core

## 0.170.0
Mon, 26 Nov 2018 19:38:42 GMT

### Updates

- Changed Omit typedef source from ui/ninezone to ui/core

## 0.169.0
Tue, 20 Nov 2018 16:17:15 GMT

_Version update only_

## 0.168.0
Sat, 17 Nov 2018 14:20:11 GMT

_Version update only_

## 0.167.0
Fri, 16 Nov 2018 21:45:44 GMT

### Updates

- Fixed some content control sizing issues
- Moved most isHidden logic for toolbar items into ui-ninezone
- Hiding items by rendering them conditionally instead of using a CSS class.
- ui-framework unit tests & docs

## 0.166.0
Mon, 12 Nov 2018 16:42:10 GMT

_Version update only_

## 0.165.0
Mon, 12 Nov 2018 15:47:00 GMT

_Version update only_

## 0.164.0
Thu, 08 Nov 2018 17:59:21 GMT

### Updates

- Updated to TypeScript 3.1
- Fixed height issues with widget content

## 0.163.0
Wed, 31 Oct 2018 20:55:37 GMT

### Updates

- Added JSX specification for Frontstage, Zone & Widget
- Fixed ui-framework unit test

## 0.162.0
Wed, 24 Oct 2018 19:20:07 GMT

### Updates

- Make ToolAdmin.defaultTool. public. Allow getToolTip to return HTMLElement | string.
- Tooltips, ToolAdmin.activeToolChanged support, SheetNavigationAid/SheetsModalFrontstage improvements.
- Ui Documentation
- Vertical PropertyGrid layout improvements. PropertyGrid background color. Setting the widget state.

## 0.161.0
Fri, 19 Oct 2018 13:04:14 GMT

_Version update only_

## 0.160.0
Wed, 17 Oct 2018 18:18:38 GMT

_Version update only_

## 0.159.0
Tue, 16 Oct 2018 14:09:09 GMT

_Version update only_

## 0.158.0
Mon, 15 Oct 2018 19:36:09 GMT

_Version update only_

## 0.157.0
Sun, 14 Oct 2018 17:20:06 GMT

### Updates

- Fixing scripts for linux

## 0.156.0
Fri, 12 Oct 2018 23:00:10 GMT

### Updates

- Initial release

