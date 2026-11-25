/**
 * A rich-text essay's answer in a review or a solution: the document its XHTML holds
 * (`#plate/rich-text/xhtml.ts`), drawn as server markup formatted as the child wrote it, where
 * AlphaTest's review showed the answer in its editor, read-only and with no toolbar
 * (mastery-track-player 941a86a, `ExtendedTextInteraction.tsx` lines 296–300 and 831–841), and a
 * plain textarea would show its words alone.
 *
 * The markup is built from the document, never from the value's own markup, so a value plate did
 * not write reads as its text, a line to each line; and a link keeps its address only where it is
 * http, https or mailto, as Quill's own link keeps one, so a value posted around the editor cannot
 * put a script's address on the page.
 *
 * @module
 */
import { Fragment, createElement } from "react";
import type { ReactNode } from "react";
import { linesOfXhtml } from "#plate/rich-text/xhtml.ts";
import type { Line, Run } from "#plate/rich-text/xhtml.ts";
import type { Named } from "#plate/ui/attributes.ts";

/**
 * The protocols a link of the answer keeps its address under.
 */
const linkProtocols: ReadonlySet<string> = new Set(["http:", "https:", "mailto:"]);

/**
 * The address a link of the answer goes to: its own where it is http, https or mailto, none
 * otherwise.
 *
 * @param link The link's address, as the value holds it.
 * @returns The address, none for another.
 */
const hrefOf = (link: string): string | undefined => {
  const url = URL.parse(link);

  return url !== null && linkProtocols.has(url.protocol) ? url.href : undefined;
};

/**
 * Draw a run: its text inside its format's elements, the outermost first, as the value's writer
 * nests them: a link, a script, bold, italic, the underline and the strike.
 *
 * @param run The run.
 * @param key Its place among its line's runs, its key: a run is a place in its line.
 * @returns The run's markup.
 */
const runNode = ({ format, text }: Run, key: number): ReactNode => {
  let node: ReactNode = text;

  if (format.strike) {
    node = <span data-strike="">{node}</span>;
  }

  if (format.underline) {
    node = <span data-underline="">{node}</span>;
  }

  if (format.italic) {
    node = <em>{node}</em>;
  }

  if (format.bold) {
    node = <strong>{node}</strong>;
  }

  if (format.script !== undefined) {
    node = createElement(format.script === "sub" ? "sub" : "sup", undefined, node);
  }

  if (format.link !== undefined) {
    node = <a href={hrefOf(format.link)}>{node}</a>;
  }

  return <Fragment key={key}>{node}</Fragment>;
};

/**
 * Draw a line as its block: a paragraph, a header or a list's item, its alignment and indent as
 * `data-align` and `data-indent`, an empty one holding a break so it keeps its line.
 *
 * @param line The line.
 * @param key Its place among the answer's lines.
 * @returns The block.
 */
const blockNode = ({ format, runs }: Line, key: number): ReactNode => {
  const header = format.header === undefined ? "p" : (`h${String(format.header)}` as const);
  const element = format.list === undefined ? header : "li";

  return createElement(
    element,
    {
      "data-align": format.align,
      "data-indent": format.indent === 0 ? undefined : format.indent,
      key,
    },
    runs.length === 0 ? <br /> : runs.map(runNode),
  );
};

/**
 * Draw the answer's lines: each a block, a run of list lines of one kind one list.
 *
 * @param lines The lines.
 * @returns The blocks and lists.
 */
const blocksOf = (lines: readonly Line[]): readonly ReactNode[] => {
  const drawn: ReactNode[] = [];
  let list: { readonly items: ReactNode[]; readonly kind: "bullet" | "ordered" } | undefined;

  for (const [at, line] of lines.entries()) {
    const kind = line.format.list;

    if (kind === undefined) {
      list = undefined;
      drawn.push(blockNode(line, at));
    } else if (list?.kind === kind) {
      list.items.push(blockNode(line, at));
    } else {
      list = { items: [blockNode(line, at)], kind };
      drawn.push(createElement(kind === "ordered" ? "ol" : "ul", { key: at }, list.items));
    }
  }

  return drawn;
};

/**
 * Render a rich-text essay's answer, read-only.
 *
 * The parts: `plate-rich-answer`, a read-only multi-line text box named as the essay's box is, in
 * the tab order as the read-only textarea it stands for is, holding the answer's paragraphs,
 * headers and lists, each alignment and indent as `data-align` and `data-indent`, the underline and
 * the strike as `data-underline` and `data-strike` spans.
 *
 * @param props The answer's XHTML, and the box's names.
 * @param props.naming What names the box.
 * @param props.xhtml The value.
 * @returns The answer.
 */
export const RichAnswer = ({
  naming,
  xhtml,
}: {
  readonly naming: Named;
  readonly xhtml: string;
}) => (
  <div
    {...naming}
    aria-multiline="true"
    aria-readonly="true"
    data-slot="plate-rich-answer"
    role="textbox"
    tabIndex={0}
  >
    {blocksOf(linesOfXhtml(xhtml))}
  </div>
);
