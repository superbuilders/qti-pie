import { RuleTester } from "oxlint/plugins-dev";
import classesLiveInStyles from "#tools/classes-live-in-styles.ts";

/**
 * A file of plate's UI that passes no author's class through.
 */
const island = "/qti-pie/packages/plate/src/ui/choice/choice.tsx";

/**
 * A file of plate's UI that the options list as a passthrough site.
 */
const passthrough = "/qti-pie/packages/plate/src/ui/item/item.tsx";

/**
 * The options the cases run under: the one passthrough site, by its path from qti-pie's root.
 */
const options = [{ passthrough: ["packages/plate/src/ui/item/item.tsx"] }];

/**
 * What a refused class says.
 */
const noClass = /writes no class of its own/u;

/**
 * What a refused style says.
 */
const noStyle = /writes no style/u;

/**
 * What a refused stylesheet import says.
 */
const noStylesheet = /imports no stylesheet/u;

/**
 * A case of plate's UI the rule admits.
 *
 * @param filename Where the file is.
 * @param code The file's text.
 * @returns The case.
 */
const valid = (filename: string, code: string) => ({ code, filename, options });

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
  options,
});

/**
 * The rule's cases: a part named by `data-slot` and its state by `data-*`, a class only read, typed
 * or passed through at a listed site, all admitted; a class written anywhere else, any style and
 * any stylesheet import, refused, at a passthrough site too.
 */
const cases = {
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
    {
      code: `export const A = () => <div data-slot="plate-choice" />;`,
      errors: [{ message: /takes one object option/u }],
      filename: island,
      options: [{ classes: [] }],
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

new RuleTester().run("classes-live-in-styles", classesLiveInStyles, cases);

console.log(
  `classes-live-in-styles: ${cases.valid.length + cases.invalid.length} cases agree with the rule`,
);
