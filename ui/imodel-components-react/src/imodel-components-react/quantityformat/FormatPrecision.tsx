/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module QuantityFormat
 */

import * as React from "react";
import { CommonProps } from "@itwin/core-react";
import { FormatProps, FormatType, parseFormatType } from "@itwin/core-quantity";
import { DecimalPrecisionSelector } from "./misc/DecimalPrecision";
import { FractionPrecisionSelector } from "./misc/FractionPrecision";
import { UiIModelComponents } from "../UiIModelComponents";

/** Properties of [[FormatPrecision]] component.
 * @alpha
 */
export interface FormatPrecisionProps extends CommonProps {
  formatProps: FormatProps;
  onChange?: (format: FormatProps) => void;
}

/** Component to show/edit Quantity Format Precision.
 * @alpha
 */
export function FormatPrecision(props: FormatPrecisionProps) {
  const { formatProps, onChange } = props;

  const handlePrecisionChange = React.useCallback((precision: number) => {
    const newFormatProps = { ...formatProps, precision };
    onChange && onChange(newFormatProps);
  }, [formatProps, onChange]);

  const formatType = parseFormatType(formatProps.type, "format");

  const label = React.useRef(UiIModelComponents.translate("QuantityFormat.labels.precision"));
  return (
    <>
      <span className={"uicore-label"}>{label.current}</span>
      {formatType === FormatType.Fractional ?
        <FractionPrecisionSelector data-testid="fraction-precision-selector" precision={formatProps.precision ?? 0} onChange={handlePrecisionChange} /> :
        <DecimalPrecisionSelector data-testid="decimal-precision-selector" precision={formatProps.precision ?? 0} onChange={handlePrecisionChange} />
      }
    </>
  );
}
