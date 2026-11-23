/**
 * The labels and names the server gives an interaction's island: the catalog's text in the item's
 * locale (`#plate/ui/<kind>/labels.ts`), the author's own message where the interaction writes
 * one, the author's `aria-label` and `aria-labelledby`, and plate's own name for a control the
 * author named by nothing, numbered once among the item's such controls.
 *
 * The shell owns these names: the core gives each interaction's `aria-label` and `aria-labelledby`
 * as written, and this module decides which name a page writes and which control plate names.
 *
 * @module
 */
import { Option, Record as Rec, pipe } from "effect";
import type { ReactNode } from "react";
import { scopedId } from "#plate/form/encoding.ts";
import { message, messageText, numeral } from "#plate/messages.ts";
import type { Locale, MessageKey } from "#plate/messages.ts";
import { redactedInteractionsIn } from "#plate/model/interactions.ts";
import type { ModelOf } from "#plate/model/interactions.ts";
import { trimXmlSpace } from "#plate/model/values.ts";
import { elementsIn } from "#plate/ui/item/content.tsx";
import type { ClassRoot, DataRoot, Named, NameAttributes } from "#plate/ui/attributes.ts";
import type { IslandContext } from "#plate/ui/item/context.ts";
import { authoredIdrefs } from "#plate/ui/item/ids.ts";
import { namesSomething } from "#plate/content/text.ts";
import { bodyAttributeOf } from "#plate/model/attributes.ts";
import type { BodyAttribute, Interaction, RedactedLevel, RedactedNode } from "#plate/model/item.ts";
import type { Prompt, PromptContent } from "#plate/ui/prompt.tsx";
import type { ChoiceInteraction } from "#plate/interactions/choice.ts";
import type { BankCaptionKey } from "#plate/interactions/plot-roles.ts";
import type { ExtendedTextInteraction } from "#plate/interactions/extended-text.ts";
import type { InlineChoiceInteraction } from "#plate/interactions/inline-choice.ts";
import type { TextEntryInteraction } from "#plate/interactions/text-entry.ts";
import { asciiTokens } from "#plate/model/whitespace.ts";

/**
 * Give the author's text where it is written and not blank, else the catalog's: a blank message
 * would say nothing where plate's own words say why.
 *
 * @param written The author's text, as written, none when absent.
 * @param catalog The catalog's text.
 * @returns The author's text, or the catalog's.
 */
const authorsOr = (written: Option.Option<string>, catalog: string): string =>
  Option.getOrElse(written.pipe(Option.filter((text) => trimXmlSpace(text) !== "")), () => catalog);

/**
 * The catalog's message for each label a kind's island writes, by the label's field: a kind's
 * `ui/<kind>/labels.ts` declares one `as const`, a family's composed by spread, such as Match's
 * placement labels and its own.
 *
 * @template K The fields.
 */
export type LabelKeys<K extends string> = Readonly<Record<K, MessageKey>>;

/**
 * The text of each label a kind's island writes, by field: what the server passes as the island's
 * `labels`, so no wording ships in the client's code.
 *
 * @template R The kind's {@link LabelKeys}.
 */
export type Labels<R> = { readonly [F in keyof R]: string };

/**
 * Give a kind's labels in a locale: each field the author's own message where the interaction
 * writes one that is not blank, such as `data-max-selections-message` or
 * `data-patternmask-message`, else the catalog's ({@link authorsOr}).
 *
 * @template K The fields.
 * @param keys The catalog's message for each field.
 * @param locale The locale of plate's own text.
 * @param authors The author's own message for each field the interaction writes one for, as
 *   written: none for a field the author has no message for.
 * @returns The labels.
 */
export const labelsOf = <K extends string>(
  keys: LabelKeys<K>,
  locale: Locale,
  authors: { readonly [F in K]?: Option.Option<string> },
): Labels<LabelKeys<K>> =>
  pipe(
    keys,
    Rec.map((key, field) => authorsOr(authors[field] ?? Option.none(), messageText(locale, key))),
  );

/**
 * Give the author's `aria-label` where it is written and not blank: a blank one is no name, as the
 * accessible-name computation skips it (accname 1.2, step 2D).
 *
 * @param written The author's `aria-label`, none when absent.
 * @returns The label as written, undefined when absent or blank.
 * @see https://www.w3.org/TR/accname-1.2/#comp_label
 */
const authorsLabel = (written: Option.Option<string>): string | undefined =>
  Option.getOrUndefined(written.pipe(Option.filter((text) => trimXmlSpace(text) !== "")));

/**
 * Each redacted body's ids, the `id`s its elements carry as the shell writes them, read once per
 * body.
 */
const idSets = new WeakMap<readonly RedactedNode[], ReadonlySet<string>>();

/**
 * Give the ids the item's elements carry, as the author wrote them: the targets an author's
 * `aria-labelledby` may name.
 *
 * @param body The redacted body.
 * @returns The ids, unscoped.
 */
const idsOf = (body: readonly RedactedNode[]): ReadonlySet<string> => {
  const known = idSets.get(body);

  if (known !== undefined) {
    return known;
  }

  const ids = new Set(
    elementsIn(body, false).flatMap((element) =>
      Option.toArray(bodyAttributeOf(element.attributes, "id")),
    ),
  );

  idSets.set(body, ids);

  return ids;
};

/**
 * The model node of a control plate names when the author named it by nothing: a Choice's, a Hot
 * Text's or a Hotspot's group, a Text Entry, an Extended Text, an Inline Choice, a Slider or a
 * Position Object.
 */
type Nameable =
  | ChoiceInteraction<RedactedLevel>
  | ExtendedTextInteraction<RedactedLevel>
  | InlineChoiceInteraction<RedactedLevel>
  | ModelOf<"hotspot", RedactedLevel>
  | ModelOf<"hottext", RedactedLevel>
  | ModelOf<"position-object", RedactedLevel>
  | ModelOf<"slider", RedactedLevel>
  | TextEntryInteraction;

/**
 * Where a control plate names stands among the item's: `n`, from 1, of `count`.
 */
interface Numbered {
  readonly count: number;
  readonly n: number;
}

/**
 * Tell whether the author named a control: by an `aria-label` that is not blank, or by an
 * `aria-labelledby` one of whose ids an element of the item carries.
 *
 * @param names The author's names, as written.
 * @param ids The ids the item's elements carry.
 * @returns Whether the author named it.
 */
const named = (names: WrittenNames, ids: ReadonlySet<string>): boolean =>
  authorsLabel(names.ariaLabel) !== undefined ||
  Option.exists(names.ariaLabelledby, (written) => asciiTokens(written).some((id) => ids.has(id)));

/**
 * The kinds plate names when the author named them by nothing, {@link Nameable}'s.
 */
const nameableKinds: ReadonlySet<Interaction["kind"]> = new Set([
  "choice",
  "extended-text",
  "hotspot",
  "hottext",
  "inline-choice",
  "position-object",
  "slider",
  "text-entry",
]);

/**
 * Tell whether an interaction is of a kind plate names ({@link Nameable}). The guard names
 * `Nameable` alone, so TypeScript narrows by `kind`; met with the interaction union, it would pair
 * each of the eight kinds with each of the nineteen, 144 of the pairs `never`.
 *
 * @param interaction The interaction.
 * @returns Whether its kind is one of {@link nameableKinds}.
 */
const isNameable = (interaction: Interaction<RedactedLevel>): interaction is Nameable =>
  nameableKinds.has(interaction.kind);

/**
 * Tell whether plate names a control the author named by nothing ({@link named}), that nothing of
 * its own names either, neither a Prompt that names something (a Choice's, a Hotspot's, a Hot
 * Text's, an Extended Text's, a Slider's) nor a `qti-label` that names something (an Inline
 * Choice's).
 *
 * @param control The control, as the redacted body holds it.
 * @param ids The ids the item's elements carry.
 * @param context What the shell knows: the locale a notice in a prompt or a label is written in.
 * @returns Whether plate names it.
 */
const isUnnamed = (
  control: Nameable,
  ids: ReadonlySet<string>,
  context: Pick<IslandContext, "locale">,
): boolean => {
  switch (control.kind) {
    case "text-entry":
    case "position-object": {
      return !named(control, ids);
    }
    case "choice":
    case "extended-text":
    case "hotspot":
    case "hottext":
    case "slider": {
      return (
        !named(control, ids) &&
        !Option.exists(control.prompt, (prompt) => namesSomething(prompt, context.locale))
      );
    }
    case "inline-choice": {
      return (
        !named(control, ids) &&
        !Option.exists(control.label, (label) => namesSomething(label, context.locale))
      );
    }
    default: {
      return control satisfies never;
    }
  }
};

/**
 * Each redacted body's controls plate names, numbered once per body.
 */
const numberings = new WeakMap<readonly RedactedNode[], ReadonlyMap<Nameable, Numbered>>();

/**
 * Number the item's controls plate names, each interaction once, in document order (inside
 * elements, containers and a Gap Match's sentence, as `redactedInteractionsIn` walks them): an
 * island names an Extended Text's boxes within the interaction itself (its `box` label), so here
 * each interaction is one, and "Answer 2 of 3" is the second of three.
 *
 * @param context What the shell knows: the redacted body and the locale.
 * @returns Each control plate names, with its place among them.
 */
const numberingOf = (
  context: Pick<IslandContext, "body" | "locale">,
): ReadonlyMap<Nameable, Numbered> => {
  const known = numberings.get(context.body);

  if (known !== undefined) {
    return known;
  }

  const ids = idsOf(context.body);
  const controls = redactedInteractionsIn(context.body)
    .filter(isNameable)
    .filter((control) => isUnnamed(control, ids, context));
  const numbering = new Map(
    controls.map((control, index): [Nameable, Numbered] => [
      control,
      { count: controls.length, n: index + 1 },
    ]),
  );

  numberings.set(context.body, numbering);

  return numbering;
};

/**
 * Give plate's own name for a control the author named by nothing: "Answer" for the item's only
 * such control, and "Answer n of count" among several, numbered once per interaction; undefined
 * for a control something else names, whose island takes that name.
 *
 * @param control The control's model node, as the redacted body holds it.
 * @param context What the shell knows: the redacted body and the locale.
 * @returns The name, or undefined.
 */
const plateName = (
  control: Nameable,
  context: Pick<IslandContext, "body" | "locale">,
): string | undefined => {
  const numbered = numberingOf(context).get(control);
  const { locale } = context;

  if (numbered === undefined) {
    return undefined;
  }

  return numbered.count === 1
    ? messageText(locale, "answer")
    : message(locale, "answerOf", {
        count: numeral(locale, numbered.count),
        n: numeral(locale, numbered.n),
      });
};

/**
 * Give a control's own name, the island's `name` label: {@link plateName}'s, else "Answer", which
 * the island reads only when nothing else names the control.
 *
 * @param control The control's model node, as the redacted body holds it.
 * @param context What the shell knows: the redacted body and the locale.
 * @returns The name.
 */
export const ownName = (
  control: Nameable,
  context: Pick<IslandContext, "body" | "locale">,
): string => plateName(control, context) ?? messageText(context.locale, "answer");

/**
 * Give an island the author's `aria-labelledby`: each of its ids that an element of the item
 * carries, scoped as the shell scopes the body's ids, so the reference finds its target and names
 * nothing that is not there (accname 1.2, step 2B).
 *
 * @param written The author's `aria-labelledby`, none when absent.
 * @param context What the shell knows: the instance and the redacted body.
 * @returns The scoped ids joined by one space, undefined when none names an element.
 * @see https://www.w3.org/TR/accname-1.2/#comp_labelledby
 */
const labelledByOf = (
  written: Option.Option<string>,
  context: Pick<IslandContext, "body" | "instance">,
): string | undefined => {
  if (Option.isNone(written)) {
    return undefined;
  }

  const ids = idsOf(context.body);

  return authoredIdrefs(
    context.instance,
    asciiTokens(written.value)
      .filter((id) => ids.has(id))
      .join(" "),
  );
};

/**
 * The author's names for an interaction as written: its `aria-label` and its `aria-labelledby`.
 */
export interface WrittenNames {
  readonly ariaLabel: Option.Option<string>;
  readonly ariaLabelledby: Option.Option<string>;
}

/**
 * Tell whether written content shows something, and so is content a prompt may hold: React writes
 * nothing for `null`, `undefined` and the booleans.
 *
 * @param written The content as the shell wrote it.
 * @returns Whether it is prompt content.
 */
const isShown = (written: ReactNode): written is PromptContent =>
  written !== null && written !== undefined && written !== true && written !== false;

/**
 * Give an interaction's prompt as an island and a review write it: the `qti-prompt` written
 * through the shell where flow content stands, with read-aloud's control for it where the context
 * gives one (`spokenPrompt` of `IslandContext`). A prompt whose content names something
 * ({@link namesSomething}) takes one id in every mode, scoped by the instance and the response,
 * which names its group or control; one that names nothing is `silent` (`Prompt` in
 * `#plate/ui/prompt.tsx`).
 *
 * @param prompt The prompt's body nodes, none when the interaction has none.
 * @param response The response the interaction binds, which scopes the id.
 * @param context What the shell knows: its content walk, the instance, the locale and the prompt's
 *   read-aloud.
 * @returns The prompt; undefined where the interaction has none, or one the shell writes as
 *   nothing.
 */
export const promptAt = (
  prompt: Option.Option<readonly RedactedNode[]>,
  response: string,
  context: Pick<IslandContext, "content" | "instance" | "locale" | "spokenPrompt">,
): Prompt | undefined =>
  Option.getOrUndefined(
    prompt.pipe(
      Option.flatMap((nodes) =>
        Option.liftPredicate(context.content(nodes, { position: "flow" }), isShown).pipe(
          Option.map((content): Prompt => {
            const shown: Prompt = namesSomething(nodes, context.locale)
              ? { content, id: scopedId(context.instance, response, "prompt"), kind: "naming" }
              : { content, kind: "silent" };

            return Option.match(context.spokenPrompt.pipe(Option.filter(isShown)), {
              onNone: () => shown,
              onSome: (readAloud) => ({ ...shown, readAloud }),
            });
          }),
        ),
      ),
    ),
  );

/**
 * Give what names an interaction's group or control of what the item writes, in the order the
 * accessible-name computation weighs it: its prompt where the prompt names something, else the
 * author's `aria-labelledby` ids that name an element of the item, scoped, else the author's
 * `aria-label` that is not blank.
 *
 * @param prompt The prompt ({@link promptAt}), undefined where the interaction has none.
 * @param names The author's names, as written.
 * @param context What the shell knows: the instance and the redacted body.
 * @returns The name, none where nothing the item writes names it.
 * @see https://www.w3.org/TR/accname-1.2/#computation-steps
 */
export const authorsNameOf = (
  prompt: Prompt | undefined,
  names: WrittenNames,
  context: Pick<IslandContext, "body" | "instance">,
): Option.Option<Named> => {
  if (prompt?.kind === "naming") {
    return Option.some({ "aria-labelledby": prompt.id });
  }

  const labelledBy = labelledByOf(names.ariaLabelledby, context);

  if (labelledBy !== undefined) {
    return Option.some({ "aria-labelledby": labelledBy });
  }

  return Option.map(Option.fromUndefinedOr(authorsLabel(names.ariaLabel)), (label) => ({
    "aria-label": label,
  }));
};

/**
 * Give what names an interaction's group: {@link authorsNameOf}'s name, else nothing, a group a
 * screen reader announces by its role.
 *
 * @param prompt The prompt, undefined where the interaction has none.
 * @param names The author's names, as written.
 * @param context What the shell knows: the instance and the redacted body.
 * @returns The attributes to spread on the group.
 */
export const groupNameOf = (
  prompt: Prompt | undefined,
  names: WrittenNames,
  context: Pick<IslandContext, "body" | "instance">,
): NameAttributes => Option.getOrElse(authorsNameOf(prompt, names, context), () => ({}));

/**
 * Give what names a control plate always names: {@link authorsNameOf}'s name, else plate's own,
 * so every control has a name (WCAG 4.1.2).
 *
 * @param prompt The prompt, undefined where the interaction has none.
 * @param names The author's names, as written.
 * @param own Plate's own name for the control: {@link ownName}'s for a control plate numbers, or
 *   the catalog's for one it names by its kind, such as End Attempt's.
 * @param context What the shell knows: the instance and the redacted body.
 * @returns The attribute to spread on the control.
 */
export const controlNameOf = (
  prompt: Prompt | undefined,
  names: WrittenNames,
  own: string,
  context: Pick<IslandContext, "body" | "instance">,
): Named => Option.getOrElse(authorsNameOf(prompt, names, context), () => ({ "aria-label": own }));

/**
 * Give what an island's or review's root carries of what the author wrote on the interaction's
 * root: its class, and the author's `data-*` its model node holds (`ModuleInteraction.data` in
 * `#plate/interactions/contract.ts`), each a name securing kept and plate does not reserve.
 *
 * @param model The interaction's model node: its author's `data-*`, none listed where it carries
 *   none.
 * @param model.data The author's `data-*`, in document order.
 * @param context What the shell knows: the author's class.
 * @returns The root's attributes.
 */
export const rootOf = (
  { data }: { readonly data: readonly BodyAttribute[] },
  context: Pick<IslandContext, "className">,
): DataRoot => ({
  ...Object.fromEntries(data.map(({ name, value }) => [name, value])),
  className: Option.getOrUndefined(context.className),
});

/**
 * Give what a Portable Custom Interaction's root carries of what the author wrote on it: its class
 * alone, since its `data-*` are its properties, which its module reads.
 *
 * @param context What the shell knows: the author's class.
 * @returns The root's attribute.
 */
export const classRootOf = (context: Pick<IslandContext, "className">): ClassRoot => ({
  className: Option.getOrUndefined(context.className),
});

/**
 * Give a Gap Match's or a Graphic Gap Match's bank its caption where the host asks for one
 * (`bankCaption`), the island's and the review's alike: a Gap Match's AlphaTest's "DRAG & DROP THE
 * ANSWER", and a Graphic Gap Match's by what its choices go on (`bankCaptionKeyOf` in
 * `#plate/interactions/plot-roles.ts`).
 *
 * @param context What the shell knows: the host's `bankCaption` and the locale.
 * @param key The caption's message.
 * @returns The caption, or undefined where the host asks for none.
 */
export const bankCaptionOf = (
  context: Pick<IslandContext, "bankCaption" | "locale">,
  key: BankCaptionKey,
): string | undefined => (context.bankCaption ? message(context.locale, key) : undefined);
