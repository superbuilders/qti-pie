/**
 * Grizzle's text primitives as plate and specimen read them (DECISIONS 56): XML Schema's `collapse`
 * and `replace` (`collapsed`, `replaced`), the XML whitespace at a value's ends removed
 * (`trimmed`), an NCName as XML Schema 1.0 reads `xs:NCName` (`isNcName`), code point order
 * (`compareCodePoints`) and UTF-8 length (`utf8Length`). crust re-exports them from
 * `@bjornpagen/grizzle-text`, dependency-free and browser-safe, so each is one implementation
 * across grizzle, pantry, crust and plate.
 *
 * @module
 */
export { isNcName } from "@bjornpagen/grizzle-text/regex/xml";

export { collapsed, compareCodePoints, replaced, trimmed } from "@bjornpagen/grizzle-text/text";

export { utf8Length } from "@bjornpagen/grizzle-text/utf8";
