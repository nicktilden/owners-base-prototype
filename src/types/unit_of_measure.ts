/**
 * UNIT OF MEASURE TYPES
 */

export type UnitOfMeasureCategory =
  | 'Time'
  | 'Amount'
  | 'Length'
  | 'Area'
  | 'Volume'
  | 'Mass';

export interface UnitOfMeasure {
  code: string;          // e.g. "lf", "sf", "ls"
  label: string;         // e.g. "Linear Feet", "Square Feet", "Lump Sum"
  abbreviation: string;  // e.g. "LF", "SF", "LS" (display form)
  category: UnitOfMeasureCategory;
}

export const UNITS_OF_MEASURE: UnitOfMeasure[] = [
  // Time
  { code: 'days',   label: 'Days',         abbreviation: 'Days',  category: 'Time' },
  { code: 'hours',  label: 'Hours',        abbreviation: 'Hrs',   category: 'Time' },
  { code: 'months', label: 'Months',       abbreviation: 'Mo',    category: 'Time' },
  { code: 'weeks',  label: 'Weeks',        abbreviation: 'Wks',   category: 'Time' },
  { code: 'years',  label: 'Years',        abbreviation: 'Yrs',   category: 'Time' },

  // Amount
  { code: 'ea',     label: 'Each',         abbreviation: 'EA',    category: 'Amount' },
  { code: 'fh',     label: 'FH',           abbreviation: 'FH',    category: 'Amount' },
  { code: 'ls',     label: 'Lump Sum',     abbreviation: 'LS',    category: 'Amount' },
  { code: 'wd',     label: 'WD',           abbreviation: 'WD',    category: 'Amount' },

  // Length
  { code: 'in_dia', label: 'Inch Diameter',abbreviation: 'In Dia',category: 'Length' },
  { code: 'lf',     label: 'Linear Feet',  abbreviation: 'LF',    category: 'Length' },
  { code: 'm',      label: 'Meters',       abbreviation: 'M',     category: 'Length' },
  { code: 'mm',     label: 'Millimeters',  abbreviation: 'MM',    category: 'Length' },

  // Area
  { code: 'm2',     label: 'Square Meters',abbreviation: 'M²',    category: 'Area' },
  { code: 'sf',     label: 'Square Feet',  abbreviation: 'SF',    category: 'Area' },
  { code: 'sy',     label: 'Square Yards', abbreviation: 'SY',    category: 'Area' },

  // Volume
  { code: 'cf',     label: 'Cubic Feet',   abbreviation: 'CF',    category: 'Volume' },
  { code: 'cy',     label: 'Cubic Yards',  abbreviation: 'CY',    category: 'Volume' },
  { code: 'm3',     label: 'Cubic Meters', abbreviation: 'M³',    category: 'Volume' },

  // Mass
  { code: 'kg',     label: 'Kilograms',    abbreviation: 'KG',    category: 'Mass' },
  { code: 'lbs',    label: 'Pounds',       abbreviation: 'LBS',   category: 'Mass' },
  { code: 'sta',    label: 'STA',          abbreviation: 'STA',   category: 'Mass' },
  { code: 't',      label: 'Tonnes',       abbreviation: 'T',     category: 'Mass' },
  { code: 'ton',    label: 'Tons',         abbreviation: 'TON',   category: 'Mass' },
];

export const UNITS_OF_MEASURE_BY_CODE: Record<string, UnitOfMeasure> = Object.fromEntries(
  UNITS_OF_MEASURE.map((u) => [u.code, u])
);

export const UNITS_OF_MEASURE_BY_CATEGORY: Record<UnitOfMeasureCategory, UnitOfMeasure[]> =
  UNITS_OF_MEASURE.reduce((acc, u) => {
    if (!acc[u.category]) acc[u.category] = [];
    acc[u.category].push(u);
    return acc;
  }, {} as Record<UnitOfMeasureCategory, UnitOfMeasure[]>);
