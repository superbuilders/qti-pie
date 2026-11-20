/**
 * Portable Custom Interaction (Q-16) in the server shell: what renders a
 * `qti-portable-custom-interaction`'s payload node, its island in `answering`
 * (`#plate/ui/portable-custom/portable-custom.tsx`) and its server markup in `review` and
 * `solution`.
 *
 * The island stands where the PCI can run and its response can post: the host passed its `pci`
 * facts and routed the PCI's response (the payload node's `host`), and the response is declared of
 * a cardinality and base type the form posts as text ({@link postedOf}). Anywhere else the PCI is
 * plate's Notice part naming the element, as a kind plate does not render is, rather than a frame
 * whose answers could not be kept.
 *
 * A review or a solution shows the response as text, with no frame: the value the record holds, or
 * the correct one, each value in plate's lexical form, a record field by field. Plate's rule for
 * both modes is server markup that ships no JavaScript, and a frame is script; a PCI's own
 * read-only rendering depends on it honouring the `review` and `solution` statuses, which the host
 * cannot hold it to inside its sandbox; and the text is the value that was scored, which plate
 * knows to be true, readable without the PCI.
 *
 * A review against the host's solution marks the value whole ({@link markOf}), as `qti-match`
 * compares two values: a PCI's values mean what its module makes of them, so plate marks no part
 * of a list, and a record, which `qti-match` does not compare, is not marked. Where the value is
 * not right, the correct response follows under "Right answer", as a Text Entry's does.
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Data_PortableCustomInteraction
 */
import { Array as Arr, Option } from "effect";
import { Fragment } from "react";
import type { ReactNode } from "react";
import { isPosted } from "#plate/form/encoding.ts";
import type { PostedBaseType } from "#plate/form/encoding.ts";
import { portableCustomModule } from "#plate/interactions/portable-custom.ts";
import type { PortableCustomHost } from "#plate/interactions/portable-custom.ts";
import { messageText } from "#plate/messages.ts";
import type { Locale, MessageKey } from "#plate/messages.ts";
import type { ModelOf } from "#plate/model/interactions.ts";
import type { RedactedLevel } from "#plate/model/item.ts";
import { format, isNullResponse, isRecordValue, match } from "#plate/model/values.ts";
import type { ResponseValue, Value } from "#plate/model/values.ts";
import type { Paired } from "#plate/payload.ts";
import type { PciFrameRoute } from "#plate/pci/frame-protocol.ts";
import type { PciModuleRoute } from "#plate/pci/host.ts";
import { noticeOf } from "#plate/ui/item/content.tsx";
import type { IslandContext, ReviewContext, Shows } from "#plate/ui/item/context.ts";
import { groupOf } from "#plate/ui/item/interactions/group.ts";
import { controlParts } from "#plate/ui/item/interactions/control-mark.tsx";
import type { ControlMark } from "#plate/ui/item/interactions/control-mark.tsx";
import { classRootOf, labelsOf, promptAt } from "#plate/ui/item/interactions/labels.ts";
import { markingOf, missedShown } from "#plate/ui/item/interactions/marks.ts";
import type { AnswerMark, Marking } from "#plate/ui/item/interactions/marks.ts";
import { markPart } from "#plate/ui/item/interactions/words.tsx";
import type { Words } from "#plate/ui/item/interactions/words.tsx";
import type { FrameFacts } from "#plate/ui/portable-custom/host.ts";
import { portableCustomKeys } from "#plate/ui/portable-custom/labels.ts";
import { PortableCustom } from "#plate/ui/portable-custom/portable-custom.tsx";
import type { PostedAs } from "#plate/ui/portable-custom/response.ts";
import { PromptPart } from "#plate/ui/prompt.tsx";

/**
 * Tell whether a declaration's cardinality is one a value of a base type has.
 *
 * @param cardinality The cardinality as written.
 * @returns Whether it is `single`, `multiple` or `ordered`.
 */
const isValueCardinality = (cardinality: string): cardinality is Value["cardinality"] =>
  cardinality === "single" || cardinality === "multiple" || cardinality === "ordered";

/**
 * Tell whether a posted base type posts as text: every one but `file`, which a form posts as its
 * bytes.
 *
 * @param baseType The base type.
 * @returns Whether it posts as text.
 */
const isText = (baseType: PostedBaseType): baseType is Exclude<PostedBaseType, "file"> =>
  baseType !== "file";

/**
 * Give how a PCI's response posts, as the server's posting binds it: a record, or a value of a
 * base type the form posts as text.
 *
 * @param model The PCI's model node: its bound declaration's cardinality and base type, as
 *   written.
 * @returns How it posts, none for a response the island cannot post: undeclared, of a base type
 *   the form does not post, or a `file`.
 */
const postedOf = (model: ModelOf<"portable-custom", RedactedLevel>): Option.Option<PostedAs> =>
  model.cardinality.pipe(
    Option.flatMap((cardinality): Option.Option<PostedAs> => {
      if (cardinality === "record") {
        return Option.some({ cardinality });
      }

      return isValueCardinality(cardinality)
        ? model.baseType.pipe(
            Option.filter(isPosted),
            Option.filter(isText),
            Option.map((baseType) => ({ baseType, cardinality })),
          )
        : Option.none();
    }),
  );

/**
 * Write a route the host resolved as the frame protocol carries it: each location as a key,
 * absent where the route has none.
 *
 * @param route The route, as the payload node holds it.
 * @returns The route.
 */
const routeOf = (route: PciModuleRoute): PciFrameRoute => ({
  id: route.id,
  waitSeconds: route.waitSeconds,
  ...Option.match(route.primary, { onNone: () => ({}), onSome: (primary) => ({ primary }) }),
  ...Option.match(route.fallback, { onNone: () => ({}), onSome: (fallback) => ({ fallback }) }),
});

/**
 * Give the island where the PCI runs, from what the host told the module.
 *
 * @param host What the host told the module of this PCI.
 * @returns The frame page's URL, the routes, and the entry module where the PCI names one.
 */
const frameOf = (host: PortableCustomHost): FrameFacts => ({
  loader: host.loader,
  routes: host.routes.map(routeOf),
  ...Option.match(host.entry, { onNone: () => ({}), onSome: (entry) => ({ entry }) }),
});

/**
 * Render a Portable Custom Interaction's island, where it can run and post.
 *
 * @param paired The Portable Custom Interaction and its payload node.
 * @param paired.model The redacted model node the payload node was given for, whose bound
 *   declaration's type says how the response posts.
 * @param paired.payload Its payload node, as its module's `redact` gave it: the type identifier, the
 *   configuration, the host's facts, the prompt, the markup and its templates, and the names.
 * @param context What the page may know of the render.
 * @returns The island; or the Notice part naming `qti-portable-custom-interaction`, where the host
 *   gave no facts for it or its response cannot post.
 */
export const island = (
  { model, payload: node }: Paired<"portable-custom">,
  context: IslandContext,
): ReactNode =>
  Option.match(Option.all({ host: node.host, posted: postedOf(model) }), {
    onNone: () => noticeOf(portableCustomModule.element, context.locale, "flow"),
    onSome: ({ host, posted }) => {
      const prompt = promptAt(node.prompt, node.response, context);

      return (
        <PortableCustom
          frame={frameOf(host)}
          labels={labelsOf(portableCustomKeys, context.locale, {})}
          markup={context.content(node.markup, { position: "flow" })}
          name={node.formName}
          naming={groupOf(prompt, node, context)}
          posted={posted}
          prompt={prompt}
          properties={node.configuration.properties}
          responseIdentifier={node.configuration.responseIdentifier}
          root={classRootOf(context)}
          templates={node.inertTemplates.map((nodes) =>
            context.content(nodes, { position: "flow" }),
          )}
          typeIdentifier={node.typeIdentifier}
        />
      );
    },
  });

/**
 * How a review writes one value part: the mark on it, none where it marks none, and what its
 * `plate-mark` part says for a screen reader.
 */
interface ValueMark {
  readonly mark: AnswerMark | undefined;
  readonly words: Words;
}

/**
 * The correct response a review writes under "Right answer", whose term says what it is, so its
 * part says nothing more.
 */
const missedValue: ValueMark = { mark: "missed", words: "silent" };

/**
 * Write the values of a value shown in a review or a solution as text: each value in plate's
 * lexical form, a list for a `multiple` (unordered) or `ordered` one, a record field by field.
 *
 * @param shown The value, holding at least one value or field.
 * @returns The value's text.
 */
const valueText = (shown: ResponseValue): ReactNode => {
  if (isRecordValue(shown)) {
    return (
      <dl>
        {shown.fields.map((field) => (
          <Fragment key={field.identifier}>
            <dt>{field.identifier}</dt>
            <dd>{format(field.value)}</dd>
          </Fragment>
        ))}
      </dl>
    );
  }

  const [only] = shown.values;

  if (shown.cardinality === "single" && only !== undefined) {
    return format(only);
  }

  const List = shown.cardinality === "ordered" ? "ol" : "ul";

  return (
    <List>
      {shown.values.map((single, index) => (
        // A bag may hold one value twice, and a sequence keeps its order, so a value's place is
        // its identity.
        <li key={index}>{format(single)}</li>
      ))}
    </List>
  );
};

/**
 * Write a value shown in a review or a solution: its text ({@link valueText}), its mark and the
 * mark's words, and the `empty` text for NULL or no value, which no mark marks.
 *
 * @param shown The value, none when the view holds none for the response.
 * @param marked How the review marks it.
 * @param locale The locale of plate's own text.
 * @returns The `plate-portable-custom-value` part.
 */
const valuePart = (
  shown: ResponseValue | undefined,
  marked: ValueMark,
  locale: Locale,
): ReactNode =>
  shown === undefined || isNullResponse(shown) ? (
    <dd data-empty="" data-slot="plate-portable-custom-value">
      {messageText(locale, "portableCustomEmpty")}
    </dd>
  ) : (
    <dd data-mark={marked.mark} data-slot="plate-portable-custom-value">
      {valueText(shown)}
      {markPart(marked.words, locale)}
    </dd>
  );

/**
 * Mark the value a review shows against the correct response, whole, as `qti-match` compares two
 * values ({@link match}): a list is right only as the whole correct list. Against a correct
 * response, the right answer written where the value is not right is the correct response itself.
 *
 * @param shown The value shown, none for no value: NULL holds no answer to mark, and a record is
 *   no value `qti-match` compares.
 * @param marking How the review marks the response.
 * @returns The mark.
 */
const markOf = (shown: ResponseValue | undefined, marking: Marking): ControlMark<Value> => {
  if (marking.kind !== "against") {
    return { kind: "unmarked" };
  }

  const answer = Arr.head(missedShown(marking, [marking.correct]));

  if (shown === undefined || isNullResponse(shown)) {
    return { answer, kind: "unanswered" };
  }

  if (isRecordValue(shown)) {
    return { kind: "unmarked" };
  }

  return match(shown, marking.correct) ? { kind: "right" } : { answer, kind: "wrong" };
};

/**
 * The catalog's message for whose answer a review or a solution shows, by what it shows: the
 * candidate's answers, or the correct responses.
 */
const whose = {
  answers: "portableCustomGiven",
  solution: "portableCustomCorrect",
} as const satisfies Readonly<Record<Shows["kind"], MessageKey>>;

/**
 * Write the correct response a mark carries, under its term.
 *
 * @param mark The mark on the value shown.
 * @param locale The locale of plate's own text.
 * @returns The term "Right answer" and the correct response's `plate-portable-custom-value` part,
 *   `data-mark="missed"`, or nothing where the value shown is right or unmarked.
 */
const answerParts = (mark: ControlMark<Value>, locale: Locale): ReactNode => {
  switch (mark.kind) {
    case "unanswered":
    case "wrong": {
      return Option.match(mark.answer, {
        onNone: () => null,
        onSome: (answer) => (
          <>
            <dt>{messageText(locale, whose.solution)}</dt>
            {valuePart(answer, missedValue, locale)}
          </>
        ),
      });
    }
    case "right":
    case "unmarked": {
      return null;
    }
    default: {
      return mark satisfies never;
    }
  }
};

/**
 * Render a Portable Custom Interaction's review or solution: its prompt and the response as text,
 * with no frame, marked whole against the host's solution in a review, the correct response after
 * a value that is not right (the module doc says why).
 *
 * @param paired The Portable Custom Interaction and its payload node.
 * @param paired.payload Its payload node, as its module's `redact` gave it.
 * @param context What the shell knows: what the render shows and marks it against, and the values
 *   shown, the candidate's in a review and the correct ones in a solution.
 * @returns The markup: `plate-portable-custom`, named as the island names its group, holding the
 *   prompt and `plate-portable-custom-response`, a `dl` whose terms say whose answer each value is.
 */
export const review = (
  { payload: node }: Paired<"portable-custom">,
  context: ReviewContext,
): ReactNode => {
  const { locale } = context;
  const prompt = promptAt(node.prompt, node.response, context);
  const shown = context.values.get(node.response);
  const mark = markOf(shown, markingOf(node.response, context));

  return (
    <div
      {...classRootOf(context)}
      {...groupOf(prompt, node, context)}
      data-slot="plate-portable-custom"
    >
      <PromptPart prompt={prompt} />
      <dl data-slot="plate-portable-custom-response">
        <dt>{messageText(locale, whose[context.shows.kind])}</dt>
        {valuePart(shown, controlParts[mark.kind], locale)}
        {answerParts(mark, locale)}
      </dl>
    </div>
  );
};
