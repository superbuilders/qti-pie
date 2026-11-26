import { regex } from "arkregex";
import { RuleTester } from "oxlint/plugins-dev";
import classesLiveInStyles from "#tools/classes-live-in-styles.ts";

/**
 * The cases a rule tester runs, by what its `run` takes.
 */
type TestCases = Parameters<RuleTester["run"]>[2];

/**
 * The rule's cases, kept read-only: the tester is handed copies of the lists.
 */
interface Cases {
  readonly invalid: readonly TestCases["invalid"][number][];
  readonly valid: readonly TestCases["valid"][number][];
}

/**
 * A file of plate's UI that passes no author's class through.
 */
const island = "/qti-pie/packages/plate/src/ui/choice/choice.tsx";

/**
 * A file of plate's UI that the options list as a passthrough site.
 */
const passthrough = "/qti-pie/packages/plate/src/ui/item/item.tsx";

/**
 * The one passthrough site the cases' options list, by its path from qti-pie's root.
 */
const passthroughSite = "packages/plate/src/ui/item/item.tsx";

/**
 * The one site whose markup the cases' options let hold the one `style` element that pins its
 * root's and body's style, by its path from qti-pie's root.
 */
const pinSite = "packages/plate/src/ui/portable-custom/frame-page.ts";

/**
 * The frame page, the file of the one `markupPins` site.
 */
const framePage = "/qti-pie/packages/plate/src/ui/portable-custom/frame-page.ts";

/**
 * The options a case runs under, made for each case: the one passthrough site and the one
 * `markupPins` site.
 *
 * @returns The options.
 */
const optionsOf = () => [{ markupPins: [pinSite], passthrough: [passthroughSite] }];

/**
 * What a refused class says.
 */
const noClass = regex("writes no class of its own", "u");

/**
 * What a refused style says.
 */
const noStyle = regex("writes no style", "u");

/**
 * Write a template's substitution of a name, as a case's code holds it.
 *
 * @param name The name.
 * @returns The substitution's text.
 */
const substitution = (name: string): string => `$\u{7B}${name}}`;

/**
 * What a refused style in markup says.
 */
const noMarkupStyle = regex("writes no style in its markup", "u");

/**
 * What a refused stylesheet import says.
 */
const noStylesheet = regex("imports no stylesheet", "u");

/**
 * A case of plate's UI the rule admits.
 *
 * @param filename Where the file is.
 * @param code The file's text.
 * @returns The case.
 */
const valid = (filename: string, code: string) => ({ code, filename, options: optionsOf() });

/**
 * A case of plate's UI the rule refuses once.
 *
 * @param filename Where the file is.
 * @param message What the one report says.
 * @param code The file's text.
 * @returns The case.
 */
const invalid = (filename: string, message: RegExp, code: string) => ({
  code,
  errors: [{ message }],
  filename,
  options: optionsOf(),
});

/**
 * The rule's cases: a part named by `data-slot` and its state by `data-*`, a class only read, typed
 * or passed through at a listed site, markup with no style, and the frame page's one `style`
 * element at its `markupPins` site, all admitted; a class written anywhere else, any other style,
 * in JSX, an object, a member or markup, a `style` attribute at the frame page too, a second
 * `style` element there, in the same string or another of the file, and one anywhere else, and any
 * stylesheet import, refused, at a passthrough site too.
 */
const cases: Cases = {
  invalid: [
    invalid(island, noClass, `export const A = () => <div className="plate-choice" />;`),
    invalid(island, noClass, `export const A = () => <svg class="plate-stage" />;`),
    invalid(island, noClass, `export const A = () => <Field labelClassName="plate-label" />;`),
    invalid(island, noClass, `export const props = { className: "plate-choice" };`),
    invalid(island, noClass, `export const props = { "className": "plate-choice" };`),
    invalid(
      island,
      noClass,
      `export const set = (part: HTMLElement) => { part.className = "x"; };`,
    ),
    invalid(island, noClass, `export const add = (part: HTMLElement) => part.classList.add("x");`),
    invalid(island, noStyle, `export const A = () => <div style={{ inset: 0 }} />;`),
    invalid(island, noStyle, `export const props = { style: { inset: 0 } };`),
    invalid(
      island,
      noStyle,
      `export const set = (part: HTMLElement) => { part.style.inset = "0"; };`,
    ),
    invalid(island, noStylesheet, `import "#plate/styles/theme.css";`),
    invalid(island, noStylesheet, `export * from "#plate/styles/base.css";`),
    invalid(island, noStylesheet, `export const load = () => import("#plate/styles/theme.css");`),
    invalid(passthrough, noStyle, `export const A = () => <div style={{ inset: 0 }} />;`),
    invalid(passthrough, noStylesheet, `import "#plate/styles/theme.css";`),
    invalid(
      island,
      noMarkupStyle,
      `export const html = \`<html style="${substitution("pin")}"><body></body></html>\`;`,
    ),
    invalid(island, noMarkupStyle, `export const html = '<div class="x" style="margin: 0">';`),
    invalid(
      framePage,
      noMarkupStyle,
      `export const html = \`<html style="${substitution("pin")}"><body></body></html>\`;`,
    ),
    invalid(
      framePage,
      noMarkupStyle,
      `export const html = \`<head><style>${substitution("pins")}</style><style>p{}</style></head>\`;`,
    ),
    invalid(
      framePage,
      noMarkupStyle,
      `export const pins = \`<style>${substitution("pins")}</style>\`;\nexport const more = '<style>p{}</style>';`,
    ),
    invalid(island, noMarkupStyle, `export const html = '<head><style>p{}</style></head>';`),
    {
      code: `export const A = () => <div data-slot="plate-choice" />;`,
      errors: [{ message: regex("takes one object option", "u") }],
      filename: island,
      options: [{ passthrough: [] }],
    },
  ],
  valid: [
    valid(island, `export const A = () => <div data-slot="plate-choice" data-picked="" />;`),
    valid(
      island,
      `export const split = (root: { className: string }) => { const { className } = root; return className; };`,
    ),
    valid(island, `export interface Root { readonly className: string | undefined }`),
    valid(island, `import { Option } from "effect";`),
    valid(island, `export const html = '<html lang="en"><body data-pinned=""></body></html>';`),
    valid(
      framePage,
      `export const html = \`<!DOCTYPE html><html><head><style>${substitution("pins")}</style></head><body></body></html>\`;`,
    ),
    valid(passthrough, `export const root = (author: string) => ({ className: author });`),
    valid(
      passthrough,
      `export const set = (part: HTMLElement, author: string) => { part.className = author; };`,
    ),
    valid(
      passthrough,
      `export const A = (props: { readonly author: string }) => <div className={props.author} />;`,
    ),
  ],
};

RuleTester.describe = (_suite, run) => {
  run();
};

RuleTester.it = (_name, run) => {
  run();
};

new RuleTester().run("classes-live-in-styles", classesLiveInStyles, {
  invalid: [...cases.invalid],
  valid: [...cases.valid],
});

console.log(
  `classes-live-in-styles: ${cases.valid.length + cases.invalid.length} cases agree with the rule`,
);
