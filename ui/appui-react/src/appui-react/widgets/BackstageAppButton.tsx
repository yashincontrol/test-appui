/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module Widget
 */

import * as React from "react";
import widgetIconSvg from "@bentley/icons-generic/icons/home.svg";
import { IconSpecUtilities } from "@itwin/appui-abstract";
import { Icon, IconSpec, useWidgetOpacityContext } from "@itwin/core-react";
import { AppButton } from "@itwin/appui-layout-react";
import { UiFramework } from "../UiFramework";

/**
 * Properties for the [[BackstageAppButton]] React component
 * @public
 */
export interface BackstageAppButtonProps {
  /** Icon specification for the App button */
  icon?: IconSpec;
  /** If specified overrides the default label shown in tooltip. */
  label?: string;
  /** If specified overrides the default action that displays the backstage. */
  execute?: () => void;
}

/**
 * BackstageAppButton used to toggle display of Backstage and is shown in the corner of the ToolWidget.
 * @public
 */
export function BackstageAppButton(props: BackstageAppButtonProps) {
  const backstageToggleCommand = React.useMemo(() => UiFramework.backstage.getBackstageToggleCommand(props.icon), [props.icon]);
  const backstageLabel = React.useMemo(() => props.label || backstageToggleCommand.tooltip, [backstageToggleCommand.tooltip, props.label]);
  const [icon, setIcon] = React.useState(props.icon ? props.icon : IconSpecUtilities.createWebComponentIconSpec(widgetIconSvg));
  const isInitialMount = React.useRef(true);
  const divClassName = "uifw-app-button-small";
  const { onElementRef, proximityScale } = useWidgetOpacityContext();
  const ref = React.useRef<HTMLDivElement>(null);

  const handleClick = React.useCallback(() => {
    if (props.execute)
      props.execute();

    else
      backstageToggleCommand.execute();
  }, [backstageToggleCommand, props]);

  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      onElementRef(ref);
    } else {
      setIcon(props.icon ? props.icon : IconSpecUtilities.createWebComponentIconSpec(widgetIconSvg));
    }
  }, [props.icon, onElementRef]);

  let buttonProximityScale: number | undefined;

  if (UiFramework.visibility.useProximityOpacity && !UiFramework.isMobile()) {
    buttonProximityScale = proximityScale;
  }

  return (
    <div ref={ref} className={divClassName}>
      <AppButton
        small={true}
        mouseProximity={buttonProximityScale}
        onClick={handleClick}
        icon={<Icon iconSpec={icon} />}
        title={backstageLabel} />
    </div>
  );
}
