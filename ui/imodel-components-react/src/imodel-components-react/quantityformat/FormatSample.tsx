/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module QuantityFormat
 */

import * as React from "react";
import { FormatterSpec } from "@itwin/core-quantity";
import { SpecialKey } from "@itwin/appui-abstract";
import { CommonProps, Icon } from "@itwin/core-react";
import { Input } from "@itwin/itwinui-react";
import { UiIModelComponents } from "../UiIModelComponents";
import { SvgProgressForward } from "@itwin/itwinui-icons-react";

/** Properties of [[FormatSample]] component.
 * @alpha
 */
export interface FormatSampleProps extends CommonProps {
  formatSpec?: FormatterSpec;
  initialMagnitude?: number;
  hideLabels?: boolean;
}

/** Component to show the persistence value and formatted value given a FormatterSpec.
 * @alpha
 */
export function FormatSample(props: FormatSampleProps) {
  const { initialMagnitude, formatSpec, hideLabels } = props;
  const initialValue = initialMagnitude ?? 0;
  const [magnitude, setMagnitude] = React.useState(initialValue);
  const [sampleValue, setSampleValue] = React.useState(initialValue.toString());

  React.useEffect(() => {
    const value = initialMagnitude ?? 0;
    setMagnitude(value);
    setSampleValue(value.toString());
  }, [initialMagnitude]);

  const handleOnValueBlur = React.useCallback(() => {
    let newValue = Number.parseFloat(sampleValue);
    if (Number.isNaN(newValue))
      newValue = 0;
    setMagnitude(newValue);
    setSampleValue(newValue.toString());
  }, [sampleValue]);

  const handleOnValueChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSampleValue(event.target.value);
  }, []);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // istanbul ignore else
    if (e.key === SpecialKey.Enter) {
      let newValue = Number.parseFloat(sampleValue);
      if (Number.isNaN(newValue))
        newValue = 0;
      setMagnitude(newValue);
      setSampleValue(newValue.toString());
      e.preventDefault();
    }
  }, [sampleValue]);

  const activePersistenceUnitLabel = formatSpec ? formatSpec.persistenceUnit.label : "";
  const formattedValue = formatSpec ? formatSpec.applyFormatting(magnitude) : "";

  const valueLabel = React.useRef(UiIModelComponents.translate("QuantityFormat.labels.value"));
  const formattedLabel = React.useRef(UiIModelComponents.translate("QuantityFormat.labels.formatted"));

  return (
    <>
      {!hideLabels && <span className={"uicore-label"}>{valueLabel.current}</span>}
      <span className="components-inline">
        <Input data-testid="format-sample-input" className={"components-quantity-persistence-input"} value={sampleValue} onChange={handleOnValueChange} onKeyDown={handleKeyDown} onBlur={handleOnValueBlur} size="small" />{activePersistenceUnitLabel}
      </span>
      {!hideLabels && <span className={"uicore-label"}>{formattedLabel.current}</span>}
      <span data-testid="progress-forward">
        {hideLabels && (formattedValue.length > 0) && <Icon iconSpec={<SvgProgressForward />} />}
        <span data-testid="format-sample-formatted" className={"uicore-label components-quantity-formatted-sample"}>{formattedValue}</span>
      </span>
    </>
  );
}
