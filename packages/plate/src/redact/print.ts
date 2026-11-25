/**
 * What a redaction prints and shows: the record a page is shown by ({@link printingOf}), the text
 * each printed variable and `param-variable` parameter writes from it through `formatPrinted`, and
 * whether its values show each template block, inline and choice ({@link shownBy}) and each
 * feedback block, inline and modal feedback ({@link feedbackShownBy}). The walk in
 * `#plate/redact/walk.ts` asks for each on the content it walks.
 *
 * @module
 */
import { Array as Arr, Option } from "effect";
import { formatPrinted, plainPrinting } from "#plate/redact/format.ts";
import type { PrintOptions } from "#plate/redact/format.ts";
import type { IntegerOrRef } from "#plate/model/integer-ref.ts";
import type {
  BodyElement,
  FeedbackVisibility,
  Item,
  PrintedVariable,
  TemplateDeclaration,
  TemplateVisibility,
} from "#plate/model/item.ts";
import type { RedactRecord, Showing } from "#plate/model/record.ts";
import { own } from "#plate/model/values.ts";
import type { Value } from "#plate/model/values.ts";

/**
 * The text of one printed variable or `param-variable` parameter, not yet formatted: given the most
 * characters it may hold, `formatPrinted`'s text, none when it would pass that or `textBound`
 * (`#plate/redact/format.ts`).
 */
export type Printer = (bound: number) => Option.Option<string>;

/**
 * Give the value a record holds for a variable: its template value, else its outcome value (an
 * item's identifiers are unique across both), read from the record's own keys only.
 *
 * @param record The record.
 * @param identifier The variable's identifier.
 * @returns The value, or none when the record holds no value by that name.
 */
const heldValue = (record: RedactRecord, identifier: string): Option.Option<Value> =>
  Option.orElse(own(record.templates, identifier), () => own(record.outcomes, identifier));

/**
 * Give the integer a single integer value holds.
 *
 * @param value The value.
 * @returns The integer, or none when the value is NULL or not a single integer.
 */
const integerOf = (value: Value): Option.Option<bigint> => {
  const [single] = value.values;

  return value.cardinality === "single" && single?.baseType === "integer"
    ? Option.some(single.value)
    : Option.none();
};

/**
 * Resolve a printed variable's `base` or `index`: a literal as written, or the integer the record
 * holds for the variable it names.
 *
 * @param written The attribute's value.
 * @param record The record.
 * @returns Some integer; some none when the named variable is NULL or not a single integer, which
 *   the database refuses (`printed-variable-ref`) on a checked item, so the attribute's default
 *   applies; none when the record holds no value by that name.
 */
const resolvedInteger = (
  written: IntegerOrRef,
  record: RedactRecord,
): Option.Option<Option.Option<bigint>> =>
  written._tag === "literal"
    ? Option.some(Option.some(written.value))
    : Option.map(heldValue(record, written.identifier), integerOf);

/**
 * Give a printed variable's attributes as the formatter takes them, its `base` and `index` read
 * from the record where written as names. A `base` whose variable holds NULL or no single integer,
 * which the database refuses on a checked item, is the attribute's default, 10, and such an
 * `index` none.
 *
 * @param node The printed variable.
 * @param record The record.
 * @returns The options, or none when the record holds no value of a name `base` or `index` names.
 */
const printOptionsOf = (node: PrintedVariable, record: RedactRecord): Option.Option<PrintOptions> =>
  Option.map(
    Option.all([
      resolvedInteger(node.base, record),
      Option.match(node.index, {
        onNone: () => Option.some(Option.none<bigint>()),
        onSome: (index) => resolvedInteger(index, record),
      }),
    ]),
    ([base, index]): PrintOptions => ({
      base: Option.getOrElse(base, () => plainPrinting.base),
      delimiter: node.delimiter,
      format: node.format,
      index,
      powerForm: node.powerForm,
    }),
  );

/**
 * Give the text a printed variable prints from a record, unformatted: `formatPrinted` over the
 * value of the variable it names, through its attributes. The formatter runs only when the walk
 * calls the printer, which it does only where it writes text.
 *
 * @param node The printed variable.
 * @param record The record.
 * @returns The printer, whose text is empty for NULL; or none when the record holds no value of
 *   the variable, or of a name its `base` or `index` names.
 */
export const printedText = (node: PrintedVariable, record: RedactRecord): Option.Option<Printer> =>
  Option.flatMap(heldValue(record, node.identifier), (value) =>
    Option.map(
      printOptionsOf(node, record),
      (options): Printer =>
        (bound) =>
          formatPrinted(value, options, bound),
    ),
  );

/**
 * Give the values a redaction prints from: the record given, as the QTI database returned it, its
 * outcomes before any response processing of the attempt shown (`attempt` `none`) the database's
 * start values, since such a page is "the version of the qti-item-body displayed to the candidate
 * at the start of each attempt" (section 7.19.3, `allow-review`); or none with no record, so a page
 * with no record prints no template or outcome value and shows no outcome-driven content. Plate
 * derives no variable's value.
 *
 * @param record The record, undefined where the showing gives none.
 * @returns The values, or none with no record.
 */
export const printingOf = (record: RedactRecord | undefined): Option.Option<RedactRecord> =>
  Option.fromUndefinedOr(record);

/**
 * Decide whether a variable's value shows a part under its `show-hide`, the one rule template
 * content, a choice's template visibility and feedback share: the value matches the part's
 * identifier when it holds a single of base type identifier equal to it, as a single value or as a
 * member of a multiple or ordered one ("matches, or contains"); `show` shows the part exactly when
 * the value matches, and `hide` exactly when it does not. NULL, a value of another base type, and
 * no value, match nothing.
 *
 * @param showHide The part's `show-hide`.
 * @param value The variable's value, none when there is none.
 * @param identifier The part's `identifier`.
 * @returns Whether the part is shown.
 */
const shows = (
  showHide: "hide" | "show",
  value: Option.Option<Value>,
  identifier: string,
): boolean => {
  const matches = Option.exists(value, (held) =>
    held.values.some((single) => single.baseType === "identifier" && single.value === identifier),
  );

  return showHide === "show" ? matches : !matches;
};

/**
 * Decide what the page sees of a feedback block, inline or modal feedback. Where the page shows no
 * feedback (`showFeedback` `false`, the item session control's `show-feedback`, information model
 * 7.19.2: "If it is 'false' then feedback is not shown. This includes both Modal Feedback and
 * Integrated Feedback") it is hidden. Where it shows feedback, the outcome values decide it: `show`
 * hides it "by default and shown only if the associated outcome variable matches, or contains, the
 * value of the identifier", and `hide` shows it "by default and hidden if" the variable does (the
 * information model's FeedbackBlock, section 5.49.3, FeedbackInline, 5.52.3, and ModalFeedback,
 * 5.93.2), by {@link shows}; and when they hold no value of its outcome, as a stimulus, which
 * declares no variable, holds none, it is withheld.
 *
 * @param feedback The outcome values feedback shows by, the record's as the database returned them
 *   ({@link feedbackValuesOf}), none where the page shows no feedback.
 * @param visibility The element's `outcome-identifier` and `show-hide`.
 * @param identifier The element's `identifier`.
 * @returns Some whether it is shown, or none when it is withheld.
 */
export const feedbackShownBy = (
  feedback: Option.Option<RedactRecord["outcomes"]>,
  visibility: FeedbackVisibility,
  identifier: string,
): Option.Option<boolean> =>
  Option.match(feedback, {
    onNone: () => Option.some(false),
    onSome: (values) =>
      Option.map(own(values, visibility.outcomeIdentifier), (value) =>
        shows(visibility.showHide, Option.some(value), identifier),
      ),
  });

/**
 * Give the outcome values a page's feedback shows by: the record's, where the page shows feedback,
 * and none where it shows none ({@link Showing}).
 *
 * @param showing What the page shows the item by.
 * @returns The outcome values, or none where the page shows no feedback.
 */
export const feedbackValuesOf = (showing: Showing): Option.Option<RedactRecord["outcomes"]> =>
  showing.showFeedback ? Option.some(showing.record.outcomes) : Option.none();

/**
 * Decide what the page sees of a part with a template visibility, a choice, a template block or a
 * template inline: whether the values show it, or none when they cannot say, because there are no
 * values or they hold no value of its template variable, so the part is withheld. `show` shows it
 * when the template variable matches, or contains, its identifier, and `hide` shows it unless the
 * variable does (the information model's TemplateBlock, section 5.145, and SimpleChoice's
 * `template-identifier`, section 5.132.3), by {@link shows}.
 *
 * @param printing The values the redaction reads, none when it has none.
 * @param visibility The part's `template-identifier` and `show-hide`.
 * @param identifier The part's `identifier`.
 * @returns Some whether the part is shown, or none when it is withheld.
 */
export const shownBy = (
  printing: Option.Option<RedactRecord>,
  visibility: TemplateVisibility,
  identifier: string,
): Option.Option<boolean> =>
  printing.pipe(
    Option.flatMap((record) =>
      Option.map(own(record.templates, visibility.templateIdentifier), (value) =>
        shows(visibility.showHide, Option.some(value), identifier),
      ),
    ),
  );

/**
 * Give the value a MathML `mi` or `ci` stands in for: the value the values hold for the template
 * variable its content names, when that variable is declared `math-variable="true"` (the
 * information model's section 2.3.3, MathML, and TemplateDeclaration's `math-variable`, section
 * 5.151.5).
 *
 * @param item The item, whose template declarations the name is looked up among.
 * @param printing The values the redaction reads, none when it has none.
 * @param name The token's content, its outer whitespace gone.
 * @returns The value; none when the name is no `math-variable` template variable, or the values
 *   hold no value of it.
 */
export const mathValueOf = (
  item: Pick<Item, "templates">,
  printing: Option.Option<RedactRecord>,
  name: string,
): Option.Option<Value> =>
  Option.fromUndefinedOr(item.templates.get(name)).pipe(
    Option.filter((declaration) => declaration.mathVariable),
    Option.flatMap((declaration) =>
      printing.pipe(Option.flatMap((record) => own(record.templates, declaration.identifier))),
    ),
  );

/**
 * Write a template value as the content of the `mn` or `cn` that replaces an `mi` or `ci` naming
 * it. The information model says only "with the template variable's value as their content"
 * (section 2.3.3), so the value is written as a printed variable with no `format` writes it
 * (reading `math-variable`): a number as its canonical text, a container's members joined by `;`,
 * and NULL as the empty text.
 *
 * @param value The template variable's value.
 * @param bound The most characters the text may hold, as `formatPrinted` takes it.
 * @returns The text, or none when it would pass `bound` or `formatPrinted`'s bound.
 */
export const mathText = (value: Value, bound: number): Option.Option<string> =>
  formatPrinted(value, plainPrinting, bound);

/**
 * Give the template variable a body element stands in for as a parameter: the declaration a
 * `param`'s `value` names, when it is declared `param-variable="true"` (the information model's
 * Param `value`, section 7.29.2, and TemplateDeclaration's `param-variable`, section 5.151.4).
 *
 * @param item The item, whose template declarations the `value` is looked up among.
 * @param node The body element.
 * @returns The declaration; none for an element other than `param`, and for a `param` whose
 *   `value` names no template variable or one not declared `param-variable`.
 */
const parameterOf = (
  item: Pick<Item, "templates">,
  node: BodyElement,
): Option.Option<TemplateDeclaration> =>
  node.tag === "param"
    ? Arr.findFirst(node.attributes, (attribute) => attribute.name === "value").pipe(
        Option.flatMap(({ value }) => Option.fromUndefinedOr(item.templates.get(value))),
        Option.filter((declaration) => declaration.paramVariable),
      )
    : Option.none();

/**
 * Write a template value as the `value` a parameter passes, converted as the information model's
 * Param `value` says (section 7.29.2): an integer by `%i`, and a float and a duration by `%G`, each
 * through `formatPrinted`; a boolean as `true` or `false`; a point as its two coordinates,
 * horizontal first, and a pair or a directed pair as its two identifiers, each two separated by one
 * space; an identifier, a string and a URI as they are. A `file` value cannot be expanded, and the
 * value model holds none. The standard gives no form for a container or for NULL, so they take the
 * printed variable's default (reading `param-variable-containers`): a container's members joined by
 * `;`, and NULL as the empty string.
 *
 * @param value The template variable's value.
 * @param bound The most characters the text may hold, as `formatPrinted` takes it.
 * @returns The text the parameter passes, or none when it would pass `bound` or `formatPrinted`'s
 *   bound (`textBound` (`#plate/redact/format.ts`)), so it is not passed.
 */
export const parameterText = (value: Value, bound: number): Option.Option<string> =>
  formatPrinted(
    value,
    {
      ...plainPrinting,
      format: Option.some(
        value.baseType === "float" || value.baseType === "duration" ? "%G" : "%i",
      ),
    },
    bound,
  );

/**
 * A `param-variable` parameter the values expand: the template variable it names, and the value
 * the values hold for it, whose text ({@link parameterText}) the parameter passes.
 */
interface Expanded {
  readonly identifier: string;
  readonly value: Value;
}

/**
 * Decide what the page sees of a body element's `value` as a parameter: the value the values hold
 * for the `param-variable` template variable it names ({@link parameterOf}), whose text the walk
 * writes ({@link parameterText}), or none when they cannot give it, because there are no values or
 * they hold no value of that variable, so the `param` is withheld. It formats nothing: when the
 * walk writes no text, a parameter the values expand keeps its `value` as written, the variable's
 * name, and the formatter never runs.
 *
 * @param item The item.
 * @param printing The values the redaction reads, none when it has none.
 * @param node The body element.
 * @returns None for an element that stands in for no template variable, which is copied as written;
 *   some {@link Expanded} for a parameter the values expand; some none for one they withhold.
 */
export const expandedParameter = (
  item: Pick<Item, "templates">,
  printing: Option.Option<RedactRecord>,
  node: BodyElement,
): Option.Option<Option.Option<Expanded>> =>
  Option.map(parameterOf(item, node), (declaration) =>
    printing.pipe(
      Option.flatMap((record) => own(record.templates, declaration.identifier)),
      Option.map((value): Expanded => ({ identifier: declaration.identifier, value })),
    ),
  );
