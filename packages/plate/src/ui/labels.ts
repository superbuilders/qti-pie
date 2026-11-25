/**
 * Filling an island's labels: the texts plate writes for the child, which the server takes from
 * plate's message catalog and an island completes with what only the client knows, such as the
 * visible text of the chip a child just placed.
 *
 * @module
 */
import { regex } from "arkregex";

/**
 * A `{name}` placeholder, as plate's message catalog writes them.
 */
const placeholder = regex("\\{(?<name>[A-Za-z]+)\\}", "gu");

/**
 * Fill a label's placeholders, leaving any the values do not name as written.
 *
 * @param label The label's text, with `{name}` placeholders.
 * @param values The text for each placeholder, by name.
 * @returns The label with every named placeholder filled.
 */
export const fillLabel = (
  label: string,
  values: Readonly<Record<string, string | number>>,
): string =>
  label.replaceAll(placeholder, (whole, name: string) => {
    const value = values[name];

    return value === undefined ? whole : String(value);
  });
