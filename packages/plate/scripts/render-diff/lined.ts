/**
 * The form a render diff writes a render in, so a unified diff of two of them shows the change
 * rather than one line of thousands of characters: {@link lined}.
 *
 * @module
 */

/**
 * The HTML elements that take no end tag, which React writes as `<name …/>`; an element named here
 * opens no level of nesting even when a raw fragment writes it without the slash.
 *
 * @see https://html.spec.whatwg.org/multipage/syntax.html#void-elements
 */
const voidElements: ReadonlySet<string> = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr",
]);

/**
 * One token of a render: a comment, a tag, a lone `<` that opens no tag, or a run of text.
 */
const token = /<!--[\s\S]*?-->|<[^>]*>|<|[^<]+/gu;

/**
 * The name of the element a start tag opens.
 */
const startTagName = /^<(?<name>[A-Za-z][^\s/>]*)/u;

/**
 * Give the change in nesting depth a token makes after it is written.
 *
 * @param text The token.
 * @returns 1 for a start tag that opens an element with content, 0 for anything else: an end
 *   tag's step back is taken before it is written.
 */
const opens = (text: string): number => {
  const name = startTagName.exec(text)?.groups?.["name"];

  return name === undefined || text.endsWith("/>") || voidElements.has(name.toLowerCase()) ? 0 : 1;
};

/**
 * Break a render into one line per tag, comment and text run, each indented two spaces per level
 * of the elements it sits in, ending in a newline.
 *
 * The break and indentation are inserted only beside the `<` and `>` of tags, and text is written
 * as it is, so the lines read as the render does; a render diff still compares renders as they
 * were rendered, before this, so whitespace this adds can never hide a change.
 *
 * @param html The render, as `renderToString` gives it.
 * @returns The lines.
 */
export const lined = (html: string): string => {
  let depth = 0;
  const lines: string[] = [];

  for (const [text] of html.matchAll(token)) {
    if (text.startsWith("</")) {
      depth = Math.max(0, depth - 1);
    }

    lines.push(`${"  ".repeat(depth)}${text}`);
    depth += opens(text);
  }

  return `${lines.join("\n")}\n`;
};
