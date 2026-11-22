"use client";

/**
 * The rich-text essay's client island: an Extended Text of `format="xhtml"` with one box, answered
 * in Quill, AlphaTest's player's editor (mastery-track-player 941a86a, Quill 2.0.3,
 * `ExtendedTextInteraction.tsx` lines 283–314), under its toolbar, its response the XHTML plate
 * writes of the editor's document (`#plate/rich-text/xhtml.ts`), never Quill's DOM.
 *
 * Quill's module loads when the island mounts, so a page with no such essay loads none of it, and
 * the server's markup holds the editor's place. The toolbar is AlphaTest's, command for command:
 * headers 1 to 3, bold, italic, underline, strike, an ordered and a bullet list, subscript and
 * superscript, indent and outdent, alignment, a link, and clean. The editor keeps the formats the
 * toolbar has and no other (Quill's `formats`), so a pasted picture or a colour is left out, where
 * AlphaTest's kept whatever Quill could hold; and it indents a line 5 deep at most, the deepest the
 * shared vocabulary's start margins go, where Quill's own indent goes 8 deep. Quill's sheet is
 * plate's base sheet's (`quill/dist/quill.snow.css`), so the host's build serves it, and Quill
 * loads nothing from another host.
 *
 * @module
 */
import type Quill from "quill";
import { useEffect, useEffectEvent, useLayoutEffect, useRef } from "react";
import {
  indentLevels,
  linesOfXhtml,
  opsOfLines,
  linesOfOps,
  xhtmlOfLines,
} from "#plate/rich-text/xhtml.ts";
import type { Line } from "#plate/rich-text/xhtml.ts";
import { textOfXhtml } from "#plate/interactions/xhtml-text.ts";
import type { Authored, Named } from "#plate/ui/attributes.ts";
import { WordCount } from "#plate/ui/extended-text/word-count.tsx";
import type { WordCountLabels } from "#plate/ui/extended-text/word-count.tsx";
import { PromptPart } from "#plate/ui/prompt.tsx";
import type { Prompt } from "#plate/ui/prompt.tsx";
import { asTyped } from "#plate/model/typed-text.ts";
import { useBoxes } from "#plate/ui/typed.ts";
import type { BoxCounts, TypedDeclared } from "#plate/ui/typed.ts";

/**
 * What the server gives a rich-text essay's island: the Extended Text's names, its response, its
 * prompt and its placeholder.
 */
export interface RichTextProps extends Authored<Named> {
  /**
   * What the empty editor shows: the author's `placeholder-text`, or AlphaTest's own words.
   */
  readonly placeholder: string;
  /**
   * The `qti-prompt`, server-rendered under its scoped id, which `naming` then names the editor by;
   * undefined when the interaction has none.
   */
  readonly prompt: Prompt | undefined;
  /**
   * The response the editor writes, as its declaration types it: a single `string`.
   */
  readonly response: TypedDeclared;
  /**
   * What the count under the editor says: `one` at one word, `other` with `{n}` for any other
   * count.
   */
  readonly wordCount: WordCountLabels;
}

/**
 * How many boxes a rich-text essay shows: its one editor.
 */
const oneBox: BoxCounts = { most: 1, shown: 1 };

/**
 * AlphaTest's toolbar, as `ExtendedTextInteraction.tsx` gave Quill (lines 303–312).
 */
const toolbar = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ script: "sub" }, { script: "super" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ align: [] }],
  ["link"],
  ["clean"],
];

/**
 * The formats the editor keeps: those the toolbar has.
 */
const formats = [
  "align",
  "bold",
  "header",
  "indent",
  "italic",
  "link",
  "list",
  "script",
  "strike",
  "underline",
];

/**
 * Write the editor's document as the value the essay posts: the XHTML of its lines, or nothing for
 * an editor holding one empty line, as an empty one does.
 *
 * @param lines The document's lines.
 * @returns The value, empty for none.
 */
const valueOf = (lines: readonly Line[]): string =>
  lines.every((line) => line.runs.length === 0) && lines.length <= 1 ? "" : xhtmlOfLines(lines);

/**
 * What the island hands the editor it makes, read once Quill's module has loaded: what it opens
 * holding, its names, its placeholder, where its value goes, and where the island keeps the editor
 * so that a value the host gives the response afterwards reaches it.
 */
interface EditorHooks {
  readonly made: (editor: Quill | null) => void;
  readonly naming: Named;
  readonly opened: string;
  readonly placeholder: string;
  readonly typed: (xhtml: string) => void;
}

/**
 * Make the editor in its place once Quill's module has loaded, unless the island has gone by then:
 * AlphaTest's toolbar, the toolbar's formats alone, indent at most 5 deep, an undo that holds the
 * child's own edits alone (a value plate draws in is no edit to undo), opened at the response's
 * document, its editing area named as the Extended Text's box is, and writing its value on every
 * change. The editor goes with the island.
 *
 * @param place The element the editor stands in.
 * @param gone Aborted when the island unmounts.
 * @param hooksNow What the editor opens holding, its names and placeholder, and where its value
 *   goes, as they are once the module has loaded.
 */
const makeEditor = async (
  place: HTMLElement,
  gone: AbortSignal,
  hooksNow: () => EditorHooks,
): Promise<void> => {
  const { default: Editor } = await import("quill");

  if (!gone.aborted) {
    const hooks = hooksNow();
    const { Attributor } = Editor.import("parchment");
    const indent = Editor.import("formats/indent");

    // Quill's indent is one attributor for every editor of the page: plate's editors are the
    // page's, and indent 5 deep at most.
    if (indent instanceof Attributor) {
      indent.whitelist = indentLevels.filter((level) => level > 0).map(String);
    }

    const area = document.createElement("div");

    place.append(area);

    const editor: Quill = new Editor(area, {
      formats,
      modules: { history: { userOnly: true }, toolbar },
      placeholder: hooks.placeholder,
      theme: "snow",
    });
    const { "aria-label": label, "aria-labelledby": labelledBy } = hooks.naming;

    editor.root.setAttribute("role", "textbox");
    editor.root.setAttribute("aria-multiline", "true");

    if (label !== undefined) {
      editor.root.setAttribute("aria-label", label);
    }

    if (labelledBy !== undefined) {
      editor.root.setAttribute("aria-labelledby", labelledBy);
    }

    editor.setContents([...opsOfLines(linesOfXhtml(hooks.opened))], "silent");
    editor.on("text-change", () => {
      hooks.typed(valueOf(linesOfOps(editor.getContents().ops)));
    });
    hooks.made(editor);
    gone.addEventListener("abort", () => {
      hooks.made(null);
      editor.off("text-change");
      place.replaceChildren();
    });
  }
};

/**
 * Render a rich-text essay for the child to answer, holding its response in the item's
 * `<Responses>`.
 *
 * The parts:
 *
 * - `plate-extended-text`, the root, with the author's `class` and `data-*`, and `data-format`
 *   `xhtml`;
 * - `plate-prompt`, the prompt, under the id `naming` names the editor by;
 * - `plate-rich-text`, the editor's place, in which Quill draws its toolbar and its editing area,
 *   named as the Extended Text's box is, at least 200 px tall, as AlphaTest's editor stood
 *   (`ExtendedTextInteraction.tsx` line 400) whatever the `expected-lines`;
 * - `plate-word-count`, under the editor, how many words the answer's text holds
 *   (`#plate/ui/extended-text/word-count.tsx`).
 *
 * Every change writes the response, the XHTML of the editor's document: an empty editor posts
 * nothing. A value the host gives the response from outside, a save restored or the item started
 * afresh, is drawn into the editor, so the child's next keystroke never writes over it.
 *
 * @param props The interaction, its response and its words ({@link RichTextProps}).
 * @returns The essay, its editor bound to the response.
 */
export const RichText = (props: RichTextProps) => {
  const { naming, placeholder, prompt, response, root, wordCount } = props;
  const [[box], write] = useBoxes({
    counts: oneBox,
    declared: response,
    patternMask: undefined,
    reading: { base: 10, baseType: "string", blankIsEmpty: false },
    typer: undefined,
    written: asTyped,
  });
  const place = useRef<HTMLDivElement>(null);
  const editor = useRef<Quill | null>(null);
  const shown = useRef(box.text);

  /**
   * Write the editor's value to the response, through the boxes as they are when it changes.
   *
   * @param xhtml The value.
   */
  const typed = useEffectEvent((xhtml: string) => {
    shown.current = xhtml;
    write(0, xhtml);
  });

  /**
   * What the editor it makes is handed: the response's value and the names as they are now, and
   * {@link typed}.
   *
   * @returns The hooks.
   */
  const hooks = useEffectEvent((): EditorHooks => ({
    made: (made) => {
      editor.current = made;
      shown.current = box.text;
    },
    naming,
    opened: box.text,
    placeholder,
    typed: (xhtml) => {
      typed(xhtml);
    },
  }));

  // The island makes its editor once, and the editor goes with it.
  useEffect((): (() => void) | undefined => {
    const at = place.current;

    if (at === null) {
      return undefined;
    }

    const gone = new AbortController();

    void makeEditor(at, gone.signal, () => hooks());

    return () => {
      gone.abort();
    };
  }, []);

  // A value the editor did not write, the host's, is drawn into the editor, in the commit's own task,
  // so a keystroke the editor writes meanwhile is never compared with a value it has passed.
  useLayoutEffect(() => {
    const made = editor.current;

    if (made !== null && box.text !== shown.current) {
      shown.current = box.text;
      made.setContents([...opsOfLines(linesOfXhtml(box.text))], "silent");
    }
  }, [box.text]);

  return (
    <div {...root} data-format="xhtml" data-slot="plate-extended-text">
      <PromptPart prompt={prompt} />
      <div data-slot="plate-rich-text" ref={place} />
      <WordCount labels={wordCount} read="rich" text={textOfXhtml(box.text)} />
    </div>
  );
};
