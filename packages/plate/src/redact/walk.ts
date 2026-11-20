/**
 * The redaction walk: the allowlist of what the server shell may know about an item.
 *
 * {@link redactItem} copies the parts of an item the page may know into a {@link Redacted}, which
 * the server shell renders node for node. The copy names every field it keeps and never spreads a
 * model object, so a field the model gains reaches the page only when this file names it. It holds
 * no correct response, mapping, processing rule, template rule or feedback content the record
 * hides, nor any outcome or template value but the ones the body's printed variables print, as text
 * and the ones its `param-variable` parameters pass, as their `value`, nor a template or feedback
 * visibility: a template block, inline or choice, and a feedback block, inline or modal feedback,
 * is settled as shown, hidden or withheld before the page sees it. What the page cannot be given,
 * it cannot leak. What each printed variable and parameter prints, and what the record shows, is
 * `#plate/redact/print.ts`'s.
 *
 * A response's default is no secret: it is the value the response holds as its attempt starts,
 * which the candidate sees and may change (spec reading 183). `redactItem` keeps it in the
 * response's binding where an interaction the page shows starts at it, and `postings`
 * (`#plate/postings.ts`) gives the entries it posts, which the host's `<Responses>` starts from.
 *
 * @module
 */
import { Brand, Option } from "effect";
import type { Configuration } from "#plate/configuration.ts";
import { defaultView } from "#plate/content/contract.ts";
import type { ContentRedactKit } from "#plate/content/contract.ts";
import { redactContent, redactItemContent } from "#plate/content/modules.ts";
import type { ItemNodesKept } from "#plate/content/modules.ts";
import { textBound } from "#plate/engine/format.ts";
import { own } from "#plate/engine/refs.ts";
import {
  decideRegions,
  interactionsIn,
  isInteraction,
  redactRegions,
} from "#plate/model/interactions.ts";
import type { Region } from "#plate/model/interactions.ts";
import type {
  BodyElement,
  BodyNode,
  FeedbackContent,
  Interaction,
  Item,
  Nodes,
  RedactedLevel,
  RedactedNode,
  Stimulus,
  TemplateContent,
} from "#plate/model/item.ts";
import type { RedactRecord } from "#plate/model/record.ts";
import { isNull } from "#plate/model/values.ts";
import type { ModelledBaseType, RecordValue, Value } from "#plate/model/values.ts";
import {
  expandedParameter,
  feedbackOutcomes,
  feedbackShownBy,
  mathText,
  mathValueOf,
  parameterText,
  printedText,
  printingOf,
  shownBy,
} from "#plate/redact/print.ts";
import type { Printer } from "#plate/redact/print.ts";
import { noSupports } from "#plate/supports.ts";
import type { Supports } from "#plate/supports.ts";
import type { OutcomeView } from "#plate/vocabulary.ts";

/**
 * A response's binding as the page may know it, with no correct response or mapping: for a
 * response of a base type its identifier, base type and cardinality, and for a record response
 * its identifier and the cardinality `record`, since a record has no base type of its own; and the
 * value it starts at, its `defaultValue` ({@link startOf}).
 */
export type ResponseBinding =
  | {
      readonly baseType: ModelledBaseType;
      readonly cardinality: Value["cardinality"];
      /**
       * The value the response holds as its attempt starts, which the interaction that binds it
       * shows ({@link startOf}); none for NULL.
       */
      readonly defaultValue: Option.Option<Value>;
      readonly identifier: string;
    }
  | {
      readonly cardinality: "record";
      /**
       * The record the response holds as its attempt starts, which the interaction that binds it
       * shows ({@link startOf}); none for the NULL record.
       */
      readonly defaultValue: Option.Option<RecordValue>;
      readonly identifier: string;
    };

/**
 * The fields of an item the page may know, which {@link redactItem} copies by name.
 *
 * `responses` lists the response bindings, every response but those only content the page does not
 * see binds ({@link hiddenOnlyResponses}): those of a base type in document order, then the record
 * responses in document order. `src/index.ts` does not export it.
 */
export interface RedactedFields {
  /**
   * The body, at the redacted level: no printed variable, template block or inline, or feedback
   * block or inline at any depth, each settled into its text, its content, nothing or its notice.
   * A feedback block the page shows keeps its place as an element of its own name,
   * {@link feedbackBlockTag}, holding its content, so the page can tell feedback from the question.
   */
  readonly body: readonly RedactedNode[];
  /**
   * The nodes of the elements the item-placed content modules read that the redaction kept, by
   * element, each decided by its module's `redact`; an element's list empty where none was kept.
   */
  readonly content: ItemNodesKept;
  /**
   * The document's location as the host named it.
   */
  readonly document: string;
  readonly identifier: string;
  /**
   * The root's `xml:lang`.
   */
  readonly lang: Option.Option<string>;
  /**
   * The modal feedback the page shows, in document order ({@link ShownModalFeedback}).
   */
  readonly modalFeedback: readonly ShownModalFeedback[];
  readonly responses: readonly ResponseBinding[];
  readonly title: string;
  /**
   * The first printed variable, `param-variable` parameter or `math-variable` MathML token on
   * content the page sees whose text passed a bound and so printed nothing: the bound in
   * characters, the variable's identifier (a parameter's or a token's template variable), which
   * limit the bound is, and its path (a token's `math` element's). `limit` is `"text"`
   * with the bound 1,000,000, the most one text may hold, or `"budget"` with the output budget the
   * redaction ran under, when the item's printed text passed it at that variable. It names the
   * limit, not the cause, so it tells the two apart when the budget is 1,000,000 too. None when
   * every text fits. `<Item>` refuses the item with `OutputTooLarge` naming it, so no page shows
   * the slot blank.
   */
  readonly unprinted: Option.Option<{
    readonly bound: number;
    readonly identifier: string;
    readonly limit: "budget" | "text";
    readonly path: string;
  }>;
}

/**
 * A modal feedback a redaction shows: its content, settled as the body is, and its `title`, none
 * when it has none. One the record shows holds its content; one whose outcome the record holds no
 * value of holds only its notice, `qti-modal-feedback`.
 */
export interface ShownModalFeedback {
  readonly content: readonly RedactedNode[];
  readonly title: Option.Option<string>;
}

/**
 * An item with every part the page may not know removed: the body the server shell renders, node
 * for node, and the facts it refuses or titles the page by.
 *
 * The brand is checked in the type: a full {@link Item}, or any object built by hand, does not
 * type-check where a `Redacted` is expected. {@link redactItem} makes one from an item, through
 * {@link brandRedacted}, and the value holds exactly the fields of {@link RedactedFields}.
 */
export type Redacted = Brand.Branded<RedactedFields, "Redacted">;

/**
 * Brand redacted fields as a {@link Redacted}, with no run-time check: the brand is nominal, and
 * gives back the same object.
 *
 * Only {@link redactItem}'s allowlisted copy calls it; `src/index.ts` does not export it. Any other
 * caller would make a `Redacted` the allowlist never saw.
 */
export const brandRedacted = Brand.nominal<Redacted>();

/**
 * The feature a printed variable's notice names: its element's name, as for any `qti-*` element
 * the body shows as a notice.
 */
const printedNotice = "qti-printed-variable";

/**
 * The feature a template block's or inline's notice names: its element's name, as for a printed
 * variable.
 */
const templateNotice: Readonly<Record<TemplateContent["kind"], string>> = {
  "template-block": "qti-template-block",
  "template-inline": "qti-template-inline",
};

/**
 * The name of the element a feedback block the page shows stands as in the redacted body, its own
 * name, holding its content in place of its `qti-content-body` and its `identifier` alone, its
 * visibility settled: the server shell writes it in plate's feedback part
 * (`#plate/ui/item/content.tsx`), so the page can tell feedback from the question it follows, where
 * its content alone would read as more of the question, and titles the one whose identifier names
 * the item's explanation (`isExplanation` in `#plate/ui/item/feedback.tsx`).
 */
export const feedbackBlockTag = "qti-feedback-block";

/**
 * The feature a feedback block's or inline's notice names: its element's name, as for a template
 * block.
 */
const feedbackNotice: Readonly<Record<FeedbackContent["kind"], string>> = {
  "feedback-block": feedbackBlockTag,
  "feedback-inline": "qti-feedback-inline",
};

/**
 * Give the element a feedback block the page shows stands as ({@link feedbackBlockTag}).
 *
 * @param path The block's path.
 * @param identifier The block's `identifier`.
 * @param content Its content, as the page sees it.
 * @returns The element, holding the content and the `identifier` alone.
 */
const shownBlock = (
  path: string,
  identifier: string,
  content: Nodes<RedactedLevel>,
): RedactedNode => ({
  attributes: [{ name: "identifier", value: identifier }],
  children: content,
  kind: "element",
  path,
  tag: feedbackBlockTag,
});

/**
 * The feature a withheld modal feedback's notice names: its element's name.
 */
const modalNotice = "qti-modal-feedback";

/**
 * The path of an item's root, which the item-placed content modules' kit names as the place of a
 * text it writes: none of them holds MathML of its own, so none writes one there, and the MathML in
 * their body content is walked as body content, under its own path.
 */
const itemPath = "qti-assessment-item";

/**
 * The path of a stimulus's root, which its catalog's kit names as {@link itemPath} names an item's.
 */
const stimulusPath = "qti-assessment-stimulus";

/**
 * What {@link printBody} reads of the document it shows: its body, its modal feedback and its
 * item-placed content, and the declarations of the variables these print and are shown by. An
 * item gives its own; a stimulus declares no variable and holds no modal feedback
 * ({@link redactStimulus}).
 */
type Printed = Pick<
  Item,
  "body" | "content" | "modalFeedback" | "outcomes" | "responses" | "templates"
>;

/**
 * The feature a withheld `param`'s notice names: its element's name, as for a printed variable.
 */
const parameterNotice = "param";

/**
 * What a walk of {@link printBody} writes in place of a printed variable and of a `param-variable`
 * parameter the values cover: `"text"` writes the text each prints or passes, through
 * `formatPrinted`, as {@link redactItem} gives the page, at most `budget` characters of it in all;
 * `"structure"` writes none, for the callers that read only which parts the page shows
 * ({@link redactStructure}). Either decides every visibility, binding and notice the same way.
 * Content the page does not see is walked as `"structure"` under either, so it formats nothing and
 * spends none of the budget.
 */
type Writing = { readonly budget: number; readonly kind: "text" } | { readonly kind: "structure" };

/**
 * The walk that writes no text.
 */
const structureOnly: Writing = { kind: "structure" };

/**
 * The walk that writes each printed text within the output budget a caller holds it to.
 *
 * @param limits The output budget, such as the configuration `configure` gave, which holds it to
 *   1 to 536,870,888.
 * @returns The walk.
 */
const textWithin = (limits: Pick<Configuration, "outputBudget">): Writing => ({
  budget: limits.outputBudget,
  kind: "text",
});

/**
 * A redacted body, and the responses only content the page does not see binds.
 */
interface RedactedBody {
  readonly body: readonly RedactedNode[];
  /**
   * The nodes the item-placed content modules read that their `redact` kept, by element:
   * {@link RedactedFields.content}.
   */
  readonly content: ItemNodesKept;
  /**
   * The modal feedback the page shows: {@link RedactedFields.modalFeedback}.
   */
  readonly modalFeedback: readonly ShownModalFeedback[];
  /**
   * The responses some interaction binds that no interaction of `body` binds, in the order the
   * walk first meets them: {@link hiddenOnlyResponses}' set.
   */
  readonly hiddenOnly: ReadonlySet<string>;
  /**
   * The first printed variable or `param-variable` parameter on content the page sees whose text
   * passed its bound: {@link RedactedFields.unprinted}. Always none under `"structure"`.
   */
  readonly unprinted: RedactedFields["unprinted"];
}

/**
 * Show an item's body from the values given.
 *
 * A printed variable whose value, and whose `base`'s and `index`'s where they name variables, the
 * values hold becomes a text node of what it prints, or nothing when that is empty (a NULL value).
 * One the values do not cover, and every one when there are no values, is withheld behind its
 * notice, `qti-printed-variable` at the variable's path.
 *
 * A template block or inline the values show ({@link shownBy}) leaves its content in its
 * place, and one they hide leaves nothing. One whose template variable the values do not hold, and
 * every one when there are no values, is withheld behind its notice, `qti-template-block` or
 * `qti-template-inline` at its path. A choice the values show keeps its identifier, its content
 * and `fixed`, and no template visibility; one they hide is absent from its interaction. One whose
 * template variable they do not hold, and every choice with a template visibility when there are
 * no values, is absent too.
 *
 * A feedback block or inline is shown, hidden or withheld by the outcome values as a template
 * block or inline is by the template values ({@link feedbackShownBy}), its notice
 * `qti-feedback-block` or `qti-feedback-inline`. A feedback inline the values show leaves its
 * content in its place, a run of its sentence; a feedback block they show stands as an element of
 * its own name ({@link feedbackBlockTag}) holding its content, and the walk tells whether the page
 * sees one.
 *
 * A `param` whose `value` names a `param-variable` template variable the values hold passes that
 * value, written as {@link parameterText} writes it, in place of the name; its other attributes
 * stay as written. One whose variable the values do not hold, and every one when there are no
 * values, is withheld behind its notice, `param` at its path. A `param` naming anything else keeps
 * its `value` as written.
 *
 * A MathML `mi` or `ci` whose content names a `math-variable` template variable the values hold
 * becomes an `mn` or a `cn` holding the variable's text, written as a printed variable with no
 * `format` writes it (`mathText` in `#plate/redact/print.ts`), and spends from the budget as a
 * printed variable does, recorded by the variable's identifier at its `math` element's path. One
 * the values do not hold, and every one when there are no values or under `"structure"`, stays as
 * written.
 *
 * The same walk tells which responses only content the page does not see binds. A rendered
 * interaction binds its response on content the page sees or on content it does not; a template
 * block or inline whose content the page does not see (hidden, withheld, or inside content it does
 * not see) binds, on content it does not see, every response its source content binds, a notice's
 * interaction included ({@link TemplateContent.responses}). A response bound on content the page
 * does not see and by no interaction it sees is hidden-only. A notice's interaction on content the
 * page sees binds nothing here, so a response only such notices bind, like one no interaction
 * binds, is never hidden-only.
 *
 * Under `"text"`, a printed variable or a `param-variable` parameter on content the page sees whose
 * text passed `formatPrinted`'s bound ({@link textBound}) leaves its slot empty, as NULL's does:
 * the printed variable writes nothing and the parameter passes the empty value. The walk records
 * the first such one it meets, a printed variable by its identifier and a parameter by its template
 * variable's, with the bound, the limit `"text"` and its path, so `<Item>` refuses the item rather
 * than show the blank. Content the page does not see is walked as under `"structure"`, so it
 * formats nothing and records nothing.
 *
 * Under `"text"` the walk also counts, in walk order, the characters each printed variable and
 * `param-variable` parameter on content the page sees writes, against the budget, and gives the
 * formatter what remains as its bound, so it stops building a text as soon as it would pass it. The
 * first text that would pass what remains, when less than {@link textBound} remains, leaves its
 * slot empty and is recorded as above with the budget as its bound and the limit `"budget"`; from
 * there the walk formats nothing more and records nothing more, every later printed variable
 * writing nothing and every later parameter passing the empty value. A text past {@link textBound}
 * with at least that much budget left is recorded with {@link textBound}, spends nothing, and the
 * walk goes on. So the walk builds at most the budget's characters of printed text, and one member
 * more.
 *
 * Under `"structure"` the walk writes no text: a printed variable the values cover leaves nothing
 * in its place, and a `param-variable` parameter they expand keeps its `value` as written. Every
 * other decision, the hidden-only responses and every interaction and choice shown, is the same as
 * under `"text"`, since none of them reads a printed text.
 *
 * @param item The item, or what a stimulus gives in its place ({@link Printed}).
 * @param root The path of the document's root, where the item-placed content modules' kit records
 *   a text past its bound.
 * @param printing The values the body is shown by, none to withhold every printed variable, every
 *   template block and inline, every choice with a template visibility and every `param-variable`
 *   parameter.
 * @param writing Whether the walk writes each printed variable's and parameter's text (`"text"`),
 *   within its budget, or none (`"structure"`).
 * @param supports The supports the host enabled, which each content module's `redact` decides by.
 * @param view The view the item is shown to, which each content module's `redact` decides by.
 * @returns The body, every printed variable its text (nothing under `"structure"`) or its notice,
 *   every template block and inline its content, nothing or its notice, every feedback block and
 *   inline its content (a block's in its element), nothing or its notice, and every
 *   `param-variable` parameter its value (as written under `"structure"`) or its notice; the
 *   responses only content the page does not see binds; and the first text on content the page sees
 *   that passed its bound, none under `"structure"`.
 */
const printBody = (
  item: Printed,
  root: string,
  printing: Option.Option<RedactRecord>,
  writing: Writing,
  supports: Supports,
  view: OutcomeView,
): RedactedBody => {
  const outcomes = printing.pipe(Option.map((record) => feedbackOutcomes(item, record)));
  // The responses an interaction the page sees binds, and those content it does not see binds.
  const shownBound = new Set<string>();
  const unseenBound = new Set<string>();
  // The first printed variable or parameter on content the page sees whose text passed its bound;
  // the characters of text the walk has printed there; and whether a text passed what remained of
  // the budget, after which the walk prints nothing more.
  let unprinted: RedactedFields["unprinted"] = Option.none();
  let spent = 0;
  let exhausted = false;
  /**
   * Give the text a printed variable or a parameter writes, formatted within what remains of the
   * budget and spent from it, or the empty text when it passed its bound, recording the first that
   * did: with the budget as the bound and the limit `"budget"` when less than {@link textBound}
   * remained, which ends the printing, and with {@link textBound} and the limit `"text"` otherwise.
   * The walk asks for text only on content the page sees, so nothing is formatted, spent or
   * recorded for content it does not see; under `"structure"`, and once the budget is spent, it
   * gives the empty text without formatting.
   *
   * @param print The printer of the text.
   * @param identifier The printed variable's identifier, or the parameter's template variable's.
   * @param path The printed variable's or the `param`'s path.
   * @returns The text, or the empty text past its bound.
   */
  const written = (print: Printer, identifier: string, path: string): string => {
    if (writing.kind === "structure" || exhausted) {
      return "";
    }

    const remaining = writing.budget - spent;
    const text = print(remaining);
    if (Option.isSome(text)) {
      spent += text.value.length;

      return text.value;
    }

    exhausted = remaining < textBound;
    if (Option.isNone(unprinted)) {
      unprinted = Option.some({
        bound: exhausted ? writing.budget : textBound,
        identifier,
        limit: exhausted ? "budget" : "text",
        path,
      });
    }

    return "";
  };

  /**
   * Record responses as bound on content the page sees, or on content it does not.
   *
   * @param responses The responses.
   * @param seen Whether the page sees the content that binds them.
   */
  const bind = (responses: readonly string[], seen: boolean): void => {
    for (const response of responses) {
      (seen ? shownBound : unseenBound).add(response);
    }
  };

  /**
   * Tell whether the values show a region of an interaction: always for content with no template
   * visibility, and for a choice with one, where they decide it shown; one they hide or withhold is
   * not shown.
   *
   * @param region The region.
   * @returns Whether the page sees its content.
   */
  const regionShown = (region: Region): boolean =>
    Option.match(region.shownBy, {
      onNone: () => true,
      onSome: ({ choice, visibility }) =>
        Option.getOrElse(shownBy(printing, visibility, choice), () => false),
    });

  /**
   * The walk over the body: its members call one another through `walk`, as body nodes nest in
   * elements, choices, template and feedback content and content modules' nodes.
   */
  const walk = {
    /**
     * Show a template or feedback block or inline as its values decide it: its content where it
     * stands when they show it, nothing when they hide it, and its notice when they withhold it.
     * Content the page does not see is still walked, unseen, so every response it binds is bound on
     * content the page does not see.
     *
     * @param part The block or inline.
     * @param decided Whether the values show it, none when they withhold it.
     * @param feature Its notice's feature.
     * @param seen Whether the page sees where it stands.
     * @param stands What its content stands as in its place when the values show it: the content
     *   itself, or a feedback block's element holding it ({@link shownBlock}).
     * @returns The nodes the page is given in its place.
     */
    conditional: (
      part: Pick<TemplateContent, "content" | "path" | "responses">,
      decided: Option.Option<boolean>,
      feature: string,
      seen: boolean,
      stands: (content: Nodes<RedactedLevel>) => Nodes<RedactedLevel>,
    ): Nodes<RedactedLevel> =>
      Option.match(decided, {
        onNone: (): Nodes<RedactedLevel> => {
          bind(part.responses, false);
          walk.nodes(part.content, false);

          return [{ feature, kind: "unsupported", path: part.path }];
        },
        onSome: (visible) => {
          if (!(seen && visible)) {
            bind(part.responses, false);
          }

          const content = walk.nodes(part.content, seen && visible);

          return visible ? stands(content) : [];
        },
      }),

    /**
     * Give the kit a content module's `redact` decides by: the text a `math-variable` template
     * variable writes in a MathML token, spent from the budget as a printed variable's is; the walk
     * over the nodes it keeps, as the page sees them; the walk over the nodes it withholds, as
     * content the page does not see; the record, the supports and the view.
     *
     * @param seen Whether the page sees the module's node.
     * @param path The module's node's path, which a text past its bound is recorded at.
     * @returns The kit.
     */
    contentKit: (seen: boolean, path: string): ContentRedactKit => ({
      mathText: (name) =>
        seen && writing.kind === "text"
          ? Option.map(mathValueOf(item, printing, name), (value) =>
              written((bound) => mathText(value, bound), name, path),
            )
          : Option.none(),
      nodes: (nodes) => walk.nodes(nodes, seen),
      record: printing,
      supports,
      view,
      withhold: (nodes) => {
        walk.nodes(nodes, false);
      },
    }),

    /**
     * Show a body element from the values: a `param` whose `param-variable` parameter the values
     * withhold becomes its notice, its children walked unseen; any other element keeps its place, a
     * `param`'s `value` expanded from its parameter, and its children are walked as it is seen.
     *
     * @param node The element.
     * @param seen Whether the page sees it.
     * @returns The nodes the page is given in its place.
     */
    element: (node: BodyElement, seen: boolean): Nodes<RedactedLevel> => {
      const parameter = expandedParameter(item, printing, node);
      const withheld = Option.exists(parameter, Option.isNone);
      const children = walk.nodes(node.children, seen && !withheld);
      if (withheld) {
        return [{ feature: parameterNotice, kind: "unsupported", path: node.path }];
      }

      const attributes = Option.match(Option.flatten(parameter), {
        onNone: () => node.attributes,
        onSome: (expanded) => {
          const value =
            seen && writing.kind === "text"
              ? written(
                  (bound) => parameterText(expanded.value, bound),
                  expanded.identifier,
                  node.path,
                )
              : expanded.identifier;

          return node.attributes.map((attribute) =>
            attribute.name === "value" ? { name: attribute.name, value } : attribute,
          );
        },
      });

      return [{ ...node, attributes, children }];
    },

    /**
     * Show an interaction from the values: each region's content walked as the page sees it, a
     * region whose choice the values hide or withhold walked unseen, then each such choice decided,
     * kept with its visibility settled where they show it and gone where they hide or withhold it.
     *
     * @param node The interaction.
     * @param seen Whether the page sees it.
     * @returns The interaction the page is given.
     */
    interaction: (node: Interaction, seen: boolean): Interaction<RedactedLevel> => {
      bind([node.response], seen);

      const mapped = redactRegions(node, (region) =>
        walk.nodes(region.nodes, seen && regionShown(region)),
      );

      return decideRegions<RedactedLevel>(mapped, regionShown);
    },
    /**
     * Show body nodes from the values, walking content the page does not see as well, so its
     * responses are bound.
     *
     * @param nodes The body nodes.
     * @param seen Whether the page sees them.
     * @returns The nodes the page is given in their place.
     */
    nodes: (nodes: readonly BodyNode[], seen: boolean): Nodes<RedactedLevel> =>
      nodes.flatMap((node): readonly RedactedNode[] => {
        if (isInteraction(node)) {
          return [walk.interaction(node, seen)];
        }

        switch (node.kind) {
          case "element": {
            return walk.element(node, seen);
          }
          case "unsupported": {
            return [node];
          }
          case "container": {
            return [{ ...node, children: walk.nodes(node.children, seen) }];
          }
          case "content": {
            const kept = redactContent(node, walk.contentKit(seen, node.path));

            return Option.isSome(kept) ? [kept.value] : [];
          }
          case "printed-variable": {
            return Option.match(
              printing.pipe(Option.flatMap((record) => printedText(node, record))),
              {
                onNone: (): readonly RedactedNode[] => [
                  { feature: printedNotice, kind: "unsupported", path: node.path },
                ],
                onSome: (print): readonly RedactedNode[] => {
                  const printed = seen ? written(print, node.identifier, node.path) : "";

                  return printed === "" ? [] : [{ kind: "text", text: printed }];
                },
              },
            );
          }
          case "template-block":
          case "template-inline": {
            return walk.conditional(
              node,
              shownBy(printing, node.templateVisibility, node.identifier),
              templateNotice[node.kind],
              seen,
              (content) => content,
            );
          }
          case "feedback-block": {
            return walk.conditional(
              node,
              feedbackShownBy(outcomes, node.feedbackVisibility, node.identifier),
              feedbackNotice[node.kind],
              seen,
              (content) => [shownBlock(node.path, node.identifier, content)],
            );
          }
          case "feedback-inline": {
            return walk.conditional(
              node,
              feedbackShownBy(outcomes, node.feedbackVisibility, node.identifier),
              feedbackNotice[node.kind],
              seen,
              (content) => content,
            );
          }
          case "text": {
            return [node];
          }
          default: {
            return node satisfies never;
          }
        }
      }),
  };

  const body = walk.nodes(item.body, true);
  // Each modal feedback after the body, in document order, as the document holds it. Before
  // response processing has run in the attempt shown none is seen, so its content is walked unseen:
  // its printed variables print nothing.
  const submitted = Option.exists(printing, (record) => record.attempt === "submitted");
  const modalFeedback = item.modalFeedback.flatMap((feedback): readonly ShownModalFeedback[] => {
    const decided = submitted
      ? feedbackShownBy(outcomes, feedback.feedbackVisibility, feedback.identifier)
      : Option.some(false);

    return Option.match(decided, {
      onNone: () => {
        walk.nodes(feedback.content, false);

        return [
          {
            content: [{ feature: modalNotice, kind: "unsupported", path: feedback.path }],
            title: Option.none(),
          },
        ];
      },
      onSome: (visible) => {
        const content = walk.nodes(feedback.content, visible);

        return visible ? [{ content, title: feedback.title }] : [];
      },
    });
  });

  const content = redactItemContent(item.content, walk.contentKit(true, root));

  const hiddenOnly = new Set([...unseenBound].filter((response) => !shownBound.has(response)));

  return {
    body,
    content,
    hiddenOnly,
    modalFeedback,
    unprinted,
  };
};

/**
 * Tell whether an interaction starts at the default of the response it binds (spec reading 183).
 * Every kind does, since a response variable "is set to this value at the start of the first
 * attempt" (QTI 3.0 information model, section 2.2.2.2), but two whose own rule says otherwise,
 * each the kind's rule over the general one: a Choice "is always initialized with no choices
 * selected" (section 2.4.1.1), and of an End Attempt's response "The default value of the response
 * variable is always ignored" (section 2.4.5).
 *
 * @param interaction The interaction.
 * @returns Whether it starts at its response's default.
 */
const startsAtDefault = (interaction: Interaction): boolean =>
  interaction.kind !== "choice" && interaction.kind !== "end-attempt";

/**
 * Give the responses a body's interactions start at their defaults: each one whose first
 * interaction in document order, the one `postingsIn` reads a response's posting from, starts at
 * its default ({@link startsAtDefault}).
 *
 * @param body The redacted body.
 * @returns The responses' identifiers.
 */
const startingResponses = (body: readonly BodyNode[]): ReadonlySet<string> => {
  const first = new Map<string, Interaction>();
  for (const interaction of interactionsIn(body)) {
    if (!first.has(interaction.response)) {
      first.set(interaction.response, interaction);
    }
  }

  return new Set(
    [...first].flatMap(([response, interaction]) =>
      startsAtDefault(interaction) ? [response] : [],
    ),
  );
};

/**
 * Give the value a response starts at, as the page shows it (spec reading 183): the default the
 * record's template processing set for it, else its declared `qti-default-value`, as an attempt
 * starts it (`firstAttempt` in `#plate/engine/attempt.ts`). None for NULL, and none for an item
 * whose template processing runs and that has no record, since its processing may set another
 * default and nothing has run it.
 *
 * @param identifier The response.
 * @param declared Its declared default.
 * @param printing The values the redaction prints from ({@link printingOf}), none for an item
 *   whose template processing runs and that has no record.
 * @returns The value it starts at, or none.
 */
const startOf = (
  identifier: string,
  declared: Option.Option<Value>,
  printing: Option.Option<RedactRecord>,
): Option.Option<Value> =>
  printing.pipe(
    Option.flatMap((record) => Option.orElse(own(record.defaults, identifier), () => declared)),
    Option.filter((value) => !isNull(value)),
  );

/**
 * Give the response bindings a redaction lists: each response the item declares but the
 * hidden-only ones, those of a base type in document order, then the record responses in document
 * order. The item keeps the two kinds in two maps, so their order across the two is not kept.
 *
 * Each holds the value it starts at ({@link startOf}) where the body's first interaction that binds
 * it starts at its default ({@link startsAtDefault}), and none where no interaction of the body
 * binds it, or where that interaction starts empty, so no default reaches the page that no
 * interaction shows. A record response starts at its declared default, which template processing
 * never sets (a rule that would is marked `record-set` and does not run).
 *
 * @param item The item.
 * @param hiddenOnly The responses only content the page does not see binds.
 * @param body The redacted body, whose interactions show the defaults.
 * @param printing The values the redaction prints from ({@link printingOf}).
 * @returns The bindings.
 */
const bindingsShown = (
  item: Item,
  hiddenOnly: ReadonlySet<string>,
  body: readonly BodyNode[],
  printing: Option.Option<RedactRecord>,
): readonly ResponseBinding[] => {
  const starting = startingResponses(body);

  return [
    ...[...item.responses.values()].flatMap(
      ({ baseType, cardinality, defaultValue, identifier }): readonly ResponseBinding[] =>
        hiddenOnly.has(identifier)
          ? []
          : [
              {
                baseType,
                cardinality,
                defaultValue: starting.has(identifier)
                  ? startOf(identifier, defaultValue, printing)
                  : Option.none(),
                identifier,
              },
            ],
    ),
    ...[...item.records.values()].flatMap(
      ({ defaultValue, identifier }): readonly ResponseBinding[] =>
        hiddenOnly.has(identifier)
          ? []
          : [
              {
                cardinality: "record",
                defaultValue: starting.has(identifier) ? defaultValue : Option.none(),
                identifier,
              },
            ],
    ),
  ];
};

/**
 * The author's inputs to one redaction beside the item and its record: the output budget, the
 * supports the host enabled for the candidate and the view the item is shown to. Each content
 * module's `redact` decides by the last two, so content a view or a support does not show never
 * reaches the page.
 */
export interface RedactOptions {
  /**
   * The configuration `configure` gave, whose `outputBudget` the printed text is held to.
   */
  readonly configuration: Pick<Configuration, "outputBudget">;
  /**
   * The accessibility supports the host enabled for the candidate, `noSupports` for none, which
   * decide what catalog content the redacted item holds.
   */
  readonly supports: Supports;
  /**
   * The view the item is shown to, which decides which rubric blocks the redacted item holds.
   */
  readonly view: OutcomeView;
}

/**
 * Copy the parts of an item the page may know: the allowlist, and the only way to make a
 * {@link Redacted} from an item.
 *
 * It copies, each by name, the document location, the identifier, the title, `lang`, the body, each
 * response's binding but the ones {@link hiddenOnlyResponses} gives, with the value it starts at
 * where an interaction the page shows starts at it ({@link bindingsShown}), and the first text past
 * its bound (`unprinted`). Each printed variable of the body is
 * copied as the text it prints: the value the record holds for the variable it names, its template
 * value else its outcome value, written by `formatPrinted` (`#plate/engine/format.ts`) through its
 * `format`, `base`, `index`, `power-form` and `delimiter`, a `base` or `index` written as a name
 * read from the record too. A NULL value prints nothing. A printed variable whose value, or whose
 * named `base`'s or `index`'s, the record does not hold stays its notice, `qti-printed-variable`.
 *
 * Each template block and inline, and each choice with a `template-identifier`, is shown or hidden
 * by the template value the record holds ({@link shownBy}): a block or inline shown leaves
 * its content in its place, a hidden one nothing; a choice shown keeps its identifier, content and
 * `fixed`, a hidden one is absent from its interaction, so a shuffled interaction presents the
 * choices that remain under the same key, and its postings name none of it. One whose template
 * variable the record does not hold is withheld: a block or inline stays its notice,
 * `qti-template-block` or `qti-template-inline`, and a choice is absent. The redacted item lists no
 * response only content the page does not see binds: `responses`
 * keeps, in document order, every response but those, so a response one interaction binds in a
 * hidden block and another the page sees binds stays, and so does one only a notice on content the
 * page sees binds, or no interaction binds.
 *
 * Each `param` whose `value` names a template variable declared `param-variable="true"` passes the
 * value the record holds for it in place of the name, converted as the information model's Param
 * `value` says: an integer by `%i`, and a float and a duration by `%G`, through `formatPrinted`, a
 * boolean as `true` or `false`, a point as its coordinates and a pair or a directed pair as its
 * identifiers, each two separated by one space. One whose variable the record does not hold stays
 * its notice, `param`. Any other `param` keeps its `value` as written.
 *
 * A printed variable, or a `param-variable` parameter, on content the page sees whose text would
 * pass `formatPrinted`'s bound of 1,000,000 characters (a conversion wider than that, or a whole
 * text longer) prints nothing, and `unprinted` names the first the walk meets: the bound, the
 * printed variable's identifier (a parameter's template variable's), the limit `"text"` and its
 * path. `<Item>` refuses such an item with `OutputTooLarge` rather than show the slot blank.
 * Content the page does not see formats nothing and is never named there. `unprinted` is none when
 * every text fits.
 *
 * The printed text is held to an output budget: the configuration's `outputBudget`, which
 * `configure` holds to 1 to 536,870,888, else its default, 16,777,216 characters, counted as a
 * string's `length` counts them. It counts the text each printed variable and `param-variable`
 * parameter on content the page sees writes, in document order, and stops printing at the first
 * whose text would pass what remains: that one and every one after it print nothing, and
 * `unprinted` names it with the budget as its bound and the limit `"budget"`, so `<Item>` refuses
 * the item with `OutputTooLarge` rather than show the page with its slots blank. So a redaction
 * never builds more printed text than the budget, and one member more, however much the item would
 * print.
 *
 * With no record, an item whose template processing does not run reads as the record its first
 * attempt starts with: each template variable at its declared default, else NULL (none where the
 * item has a `qti-template-processing` the engine does not run, since nothing computed them), and
 * each outcome at its starting value. An item whose template processing runs has no values
 * without its record, so each of its printed variables, template blocks, template inlines and
 * `param-variable` parameters stays its notice and each of its choices with a template visibility
 * is absent.
 *
 * It never copies an outcome declaration, a correct response, a mapping, the default of a response
 * no interaction it shows starts at, a processing rule, a template rule, a template value or an
 * outcome value it does not print or pass to a parameter, a block's, inline's or choice's template
 * visibility, the seed or an override template processing set (the record's part it reads holds
 * neither), or a field it does not name.
 *
 * @param item The item.
 * @param options The output budget, the supports and the view ({@link RedactOptions}).
 * @param record The template values and outcome values of the attempt shown, which its printed
 *   variables print, its `param-variable` parameters pass, and which show or hide its template
 *   blocks, inlines and choices; none to show the item as it reads with no record.
 * @returns The redacted item.
 */
export const redactItem = (item: Item, options: RedactOptions, record?: RedactRecord): Redacted => {
  const printing = printingOf(item, record);
  const { body, content, hiddenOnly, modalFeedback, unprinted } = printBody(
    item,
    itemPath,
    printing,
    textWithin(options.configuration),
    options.supports,
    options.view,
  );

  return brandRedacted({
    body,
    content,
    document: item.document,
    identifier: item.identifier,
    lang: item.lang,
    modalFeedback,
    responses: bindingsShown(item, hiddenOnly, body, printing),
    title: item.title,
    unprinted,
  });
};

/**
 * What the page is shown of an item's structure under a record: what {@link redactItem} decides,
 * with no printed text. Plate's own, for the callers that read only which interactions, choices
 * and responses the page shows; `src/index.ts` does not export it, and it is no {@link Redacted},
 * so `payload` never takes one.
 */
export interface RedactedStructure {
  /**
   * The body as `redactItem` gives it, but that a printed variable the record covers leaves
   * nothing in its place and a `param-variable` parameter it expands keeps its `value` as written.
   */
  readonly body: readonly RedactedNode[];
  /**
   * The responses only content the page does not see binds: {@link hiddenOnlyResponses}' set.
   */
  readonly hiddenOnly: ReadonlySet<string>;
  /**
   * The response bindings, as `redactItem` lists them.
   */
  readonly responses: readonly ResponseBinding[];
}

/**
 * Decide what the page is shown of an item under a record without printing it: the walk
 * {@link redactItem} makes, with every visibility, binding and notice decided as it decides them,
 * that formats no printed variable and no `param-variable` parameter's value. So the interactions
 * and choices of its body, its responses and its hidden-only responses are `redactItem`'s, and its
 * cost does not follow the length of what the item prints.
 *
 * It is for plate's own callers that read only what the page shows, such as `checkResponses`,
 * `results` and a session's skip rule; `src/index.ts` does not export it. It reads the item as the
 * candidate sees it with no support enabled, as {@link hiddenOnlyResponses} does: no content
 * module binds a response, so the supports and the view change none of what it reads.
 *
 * @example
 *   interactionsIn(redactStructure(item, record).body);
 *   // the interactions redactItem(item, record).body holds, each with the same choices
 *
 * @param item The item.
 * @param record The template values and outcome values of the attempt shown, as `redactItem` takes
 *   them; none to read the item as it reads with no record.
 * @returns The item's structure as the page is shown it, with no printed text.
 */
export const redactStructure = (item: Item, record?: RedactRecord): RedactedStructure => {
  const printing = printingOf(item, record);
  const { body, hiddenOnly } = printBody(
    item,
    itemPath,
    printing,
    structureOnly,
    noSupports,
    defaultView,
  );

  return { body, hiddenOnly, responses: bindingsShown(item, hiddenOnly, body, printing) };
};

/**
 * Give the responses only content the page does not see binds: those some interaction binds, a
 * rendered interaction anywhere in the body or any interaction, rendered or a notice, inside a
 * template block or inline the record hides or withholds (or one inside content the page does not
 * see), and that no interaction of `redactItem(item, record).body` binds. {@link redactItem} lists
 * none of them in `responses`.
 *
 * A response bound only to a notice on content the page sees, or bound by no interaction, is not
 * among them, so a caller that passes such a response through keeps doing so. The set comes
 * from the same walk `redactItem` makes, so the two never disagree, made as
 * {@link redactStructure} makes it: it formats no printed variable and no parameter's value.
 *
 * @example
 *   // A block shown when T holds A binds SHOWN; a block shown when T holds B binds HIDDEN.
 *   hiddenOnlyResponses(item, { outcomes: {}, templates: { T: identifierA } });
 *   // Set { "HIDDEN" }
 *
 * @param item The item.
 * @param record The template values and outcome values of the attempt shown, as `redactItem` takes
 *   them; none to read the item as it reads with no record.
 * @returns The responses, in the order the walk first meets them.
 */
export const hiddenOnlyResponses = (item: Item, record?: RedactRecord): ReadonlySet<string> =>
  printBody(item, itemPath, printingOf(item, record), structureOnly, noSupports, defaultView)
    .hiddenOnly;

/**
 * The fields of a stimulus the page may know, which {@link redactStimulus} copies by name.
 */
export interface RedactedStimulusFields {
  /**
   * The stimulus body, at the redacted level, as {@link RedactedFields.body} is the item's.
   */
  readonly body: readonly RedactedNode[];
  /**
   * The catalogs of the stimulus the redaction kept, as `qti-catalog-info`'s module keeps an
   * item's under the supports the host enabled.
   */
  readonly content: Pick<ItemNodesKept, "qti-catalog-info">;
  /**
   * The stimulus document's location as the host named it, its path from the package root.
   */
  readonly document: string;
  /**
   * The stimulus root's `xml:lang`.
   */
  readonly lang: Option.Option<string>;
  /**
   * The stimulus root's `title`.
   */
  readonly title: string;
}

/**
 * A stimulus with every part the page may not know removed: the body and catalog the server shell
 * renders beside or inside the item that references it. Branded as {@link Redacted} is, so only
 * {@link redactStimulus} makes one.
 */
export type RedactedStimulus = Brand.Branded<RedactedStimulusFields, "RedactedStimulus">;

/**
 * Brand redacted stimulus fields, with no run-time check. Only {@link redactStimulus} calls it.
 */
const brandStimulus = Brand.nominal<RedactedStimulus>();

/**
 * The variables a stimulus declares: none. "The key feature is that this shared stimulus content
 * must be supplied in the same context for each of the Assessment Items that make use of it"
 * (information model §4.3), so nothing in it reads an item's variables, and the XSD gives a
 * stimulus no declaration of its own.
 */
const undeclared: Pick<Item, "outcomes" | "responses" | "templates"> = {
  outcomes: new Map(),
  responses: new Map(),
  templates: new Map(),
};

/**
 * Copy the parts of a stimulus the page may know: the allowlist, and the only way to make a
 * {@link RedactedStimulus}.
 *
 * Its body is walked as {@link redactItem} walks an item's with no values: the stimulus declares
 * no variable ({@link undeclared}), so a printed variable, a template block or inline, a feedback
 * block or inline and a `param-variable` parameter in it stays its notice, and nothing is printed,
 * so no text passes a bound. Its catalogs are resolved under the supports the host enabled for the
 * candidate, as the item's are: a card of a support the host did not enable, its spoken card among
 * them, never reaches the page. It copies, each by name, the document location, `lang`, `title`,
 * the body and the kept catalogs.
 *
 * @param stimulus The stimulus, as an accepted stimulus holds it.
 * @param options The output budget, the supports and the view ({@link RedactOptions}).
 * @returns The redacted stimulus.
 */
export const redactStimulus = (stimulus: Stimulus, options: RedactOptions): RedactedStimulus => {
  const { body, content } = printBody(
    {
      ...undeclared,
      body: stimulus.body,
      content: {
        "qti-assessment-stimulus-ref": [],
        "qti-catalog-info": stimulus.content["qti-catalog-info"],
        "qti-companion-materials-info": [],
      },
      modalFeedback: [],
    },
    stimulusPath,
    Option.none(),
    textWithin(options.configuration),
    options.supports,
    options.view,
  );

  return brandStimulus({
    body,
    content: { "qti-catalog-info": content["qti-catalog-info"] },
    document: stimulus.document,
    lang: stimulus.lang,
    title: stimulus.title,
  });
};
