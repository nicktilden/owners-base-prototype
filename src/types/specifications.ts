/**
 * SPECIFICATIONS TYPES
 *
 * CSI MasterFormat specification sections. Two-level hierarchy:
 *   Division  — top-level grouping (e.g. "01 - General Requirements")
 *   Section   — individual spec section within a division (e.g. "011000 - SUMMARY")
 */

export interface SpecificationSection {
  id: string;
  divisionId: string;
  code: string;
  title: string;
}

export interface SpecificationDivision {
  id: string;
  accountId: string;
  code: string;
  title: string;
  sections: SpecificationSection[];
}
