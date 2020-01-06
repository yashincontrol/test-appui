/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @module TypeConverters */

import { TypeConverter, StandardTypeConverterTypeNames } from "./TypeConverter";
import { TypeConverterManager } from "./TypeConverterManager";
import { Id64 } from "@bentley/bentleyjs-core";
import { Primitives } from "@bentley/imodeljs-frontend";

/** Hexadecimal Type Converter.
 * @public
 */
export class HexadecimalTypeConverter extends TypeConverter {
  public convertToString(value?: Primitives.Hexadecimal) {
    if (value === undefined)
      return "";

    // Need to Uppercase without changing 0x part
    const hexString = value.toString();
    return "0x" + hexString.substring(2, hexString.length).toUpperCase();
  }

  public convertFromString(value: string) {
    if (value.substr(0, 2) !== "0x")
      value = "0x" + value;

    value = Id64.fromString(value);
    if (Id64.isValidId64(value))
      return value;

    return undefined;
  }

  public sortCompare(a: Primitives.Hexadecimal, b: Primitives.Hexadecimal): number {
    // Normalize the strings
    a = Id64.fromString(a);
    b = Id64.fromString(b);

    if (a === b)
      return 0;
    if (a > b)
      return 1;
    return -1;
  }
}

TypeConverterManager.registerConverter(StandardTypeConverterTypeNames.Hex, HexadecimalTypeConverter);
TypeConverterManager.registerConverter(StandardTypeConverterTypeNames.Hexadecimal, HexadecimalTypeConverter);
