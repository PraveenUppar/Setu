/**
 * Column specs for the repeater, kept separate from the component.
 *
 * A module spec is data and lives on the server; the repeater is a client
 * component. Defining the columns here lets M2 declare its tables without the
 * module registry importing React, and lets the page hand plain data across
 * the boundary — the same split that FieldView makes for ordinary fields.
 */
export interface RepeaterColumn {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: { value: string; label: string }[];
  /** Show a running total under this column. */
  total?: boolean;
  width?: string;
  placeholder?: string;
}
