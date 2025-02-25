/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
({
  id: this.props.id,
  version: this.props.version ?? 1.0,
  contentGroup: contentGroup,
  usage: this.props.usage,

  contentManipulation: {
    id: `${this.props.id}-contentManipulationTools`,
    content: <ContentToolWidgetComposer cornerButton={this.props.cornerButton} />,
  },

  viewNavigation: {
    id: `${this.props.id}-viewNavigationTools`,
    content: <ViewToolWidgetComposer hideNavigationAid={this.props.hideNavigationAid} />,
  },

  toolSettings: {
    id: `${this.props.id}-toolSettings`,
  },

  statusBar: {
    id: `${this.props.id}-statusBar`,
  },

  leftPanel: {
    size: 300,
    pinned: false,
    defaultState: StagePanelState.Minimized,
    ...this.props.leftPanelProps,
  },

  topPanel: {
    size: 90,
    pinned: false,
    defaultState: StagePanelState.Minimized,
    ...this.props.topPanelProps,
  },

  rightPanel: {
    defaultState: StagePanelState.Open,
    ...this.props.rightPanelProps,
  },

  bottomPanel: {
    size: 180,
    defaultState: StagePanelState.Open,
    ...this.props.bottomPanelProps,
  },
})