/**
 * The responses a golden case posts: for every item, a set of named cases, each a sequence of
 * attempts, each attempt the value every posting of the item gives, generated from the item's own
 * declarations and the choices its interactions offer.
 *
 * Generation reads only the item: its response declarations (correct responses, mappings, area
 * mappings, defaults), the identifiers its interactions bind (choices, gaps, hotspots, match sets),
 * the base values its processing compares responses with, and the limits its interactions declare
 * (bounds, play counts, image sizes). Every value is built from a lexical form through plate's
 * `parseLexical`, so a value plate cannot hold is never posted; a value an interaction's limits
 * refuse is posted, so the golden records the refusal.
 *
 * @module
 */
import { Array as Arr, Option, Result } from "effect";
import type { SourceDocument, SourceElement } from "#plate/document/source.ts";
import type { ResponseDeclaration } from "#plate/model/item.ts";
import { format, parseLexical } from "#plate/model/values.ts";
import type { ModelledBaseType, ResponseValue, Single, Value } from "#plate/model/values.ts";
import type { Posting } from "#plate/postings.ts";
import type { Accepted } from "#plate/validate/verdict.ts";
import { uploadedFile } from "#scripts/golden/files.ts";
import { goldenMap } from "#scripts/golden/values.ts";

/**
 * One attempt's responses: the value of every posting, by its response identifier.
 */
export type Posted = Readonly<Record<string, ResponseValue>>;

/**
 * A named sequence of attempts, each starting from the record the one before it left.
 */
export interface Case {
  readonly attempts: readonly Posted[];
  readonly name: string;
}

/**
 * The most distinct singles a response varies over, by code-point order of their lexical forms
 * after the correct ones: a bound of the generator's size, never of what an item may hold.
 */
const singlesPerResponse = 24;

/**
 * The element kinds whose `identifier` an interaction binds as a choice a response may name.
 */
const choiceKinds: ReadonlySet<string> = new Set([
  "qti-associable-hotspot",
  "qti-gap",
  "qti-gap-img",
  "qti-gap-text",
  "qti-hotspot-choice",
  "qti-hottext",
  "qti-inline-choice",
  "qti-simple-associable-choice",
  "qti-simple-choice",
]);

/**
 * The element kinds of a pair's source, in a gap or graphic gap match.
 */
const sourceKinds: ReadonlySet<string> = new Set(["qti-gap-img", "qti-gap-text"]);

/**
 * The element kinds of a pair's target, in a gap or graphic gap match.
 */
const targetKinds: ReadonlySet<string> = new Set(["qti-associable-hotspot", "qti-gap"]);

/**
 * Give an element's attribute value.
 *
 * @param element The element.
 * @param name The attribute's local name, in no namespace.
 * @returns The value, none where the element has no such attribute.
 */
const attribute = (element: SourceElement, name: string): Option.Option<string> =>
  Option.fromUndefinedOr(
    element.attributes.find((each) => each.local === name && each.namespace === "")?.value,
  );

/**
 * Give every element of a subtree, the root first, in document order.
 *
 * @param root The subtree's root.
 * @returns The elements.
 */
const elementsOf = (root: SourceElement): readonly SourceElement[] => [
  root,
  ...root.children.flatMap((child) => (child.kind === "element" ? elementsOf(child) : [])),
];

/**
 * Give the text of an element's text children, joined.
 *
 * @param element The element.
 * @returns Its text.
 */
const textOf = (element: SourceElement): string =>
  element.children.map((child) => (child.kind === "text" ? child.text : "")).join("");

/**
 * Give the identifiers elements of some kinds carry, in document order, each once.
 *
 * @param elements The elements.
 * @param kinds The kinds.
 * @returns The identifiers.
 */
const identifiersOf = (
  elements: readonly SourceElement[],
  kinds: ReadonlySet<string>,
): readonly string[] => [
  ...new Set(
    elements.flatMap((element) =>
      kinds.has(element.local) ? Option.toArray(attribute(element, "identifier")) : [],
    ),
  ),
];

/**
 * Give every pair of two lists, as the lexical form of a pair.
 *
 * @param sources The first members.
 * @param targets The second members.
 * @returns The pairs, `source target`.
 */
const pairsOf = (sources: readonly string[], targets: readonly string[]): readonly string[] =>
  sources.flatMap((source) => targets.map((target) => `${source} ${target}`));

/**
 * Give the lexical forms the interactions bound to a response offer it: the choices it may name,
 * or for a pair response the pairs of its sources and targets.
 *
 * @param document The item's source.
 * @param identifier The response.
 * @param baseType The response's base type.
 * @returns The lexical forms, in document order.
 */
const offeredBy = (
  document: SourceDocument,
  identifier: string,
  baseType: ModelledBaseType,
): readonly string[] =>
  elementsOf(document.root)
    .filter((element) =>
      Option.exists(attribute(element, "response-identifier"), (bound) => bound === identifier),
    )
    .flatMap((interaction) => {
      const inside = elementsOf(interaction).slice(1);

      if (baseType !== "pair" && baseType !== "directedPair") {
        return identifiersOf(inside, choiceKinds);
      }

      const sets = interaction.children.filter(
        (child): child is SourceElement =>
          child.kind === "element" && child.local === "qti-simple-match-set",
      );
      const [first, second] = sets;

      if (first !== undefined && second !== undefined) {
        return pairsOf(
          identifiersOf(elementsOf(first), choiceKinds),
          identifiersOf(elementsOf(second), choiceKinds),
        );
      }

      const sources = identifiersOf(inside, sourceKinds);
      const targets = identifiersOf(inside, targetKinds);

      if (sources.length > 0 && targets.length > 0) {
        return pairsOf(sources, targets);
      }

      const choices = identifiersOf(inside, choiceKinds);

      return pairsOf(choices, choices).filter((pair) => {
        const [left, right] = pair.split(" ");

        return left !== right;
      });
    });

/**
 * Give the lexical forms of base values of one base type the item's processing holds: the
 * literals its rules compare responses with.
 *
 * @param document The item's source.
 * @param baseType The base type.
 * @returns The lexical forms, in document order.
 */
const literalsOf = (document: SourceDocument, baseType: ModelledBaseType): readonly string[] =>
  elementsOf(document.root)
    .filter(
      (element) =>
        element.local === "qti-base-value" &&
        Option.exists(attribute(element, "base-type"), (written) => written === baseType),
    )
    .map(textOf);

/**
 * Give the variants of a string a candidate may type for it: its case changed, white space and
 * punctuation around it, the characters XML white space does not hold (NBSP), and the letters whose
 * case mappings differ between simple and full mapping (ß, İ, Σ).
 *
 * @param text The string.
 * @returns The variants, the string itself first.
 */
const stringVariants = (text: string): readonly string[] => [
  text,
  text.toLowerCase(),
  text.toUpperCase(),
  ` ${text} `,
  `\t${text}\n`,
  `${text}.`,
  `${text}!`,
  `"${text}"`,
  `'${text}'`,
  text.replaceAll(" ", "  "),
  text.replaceAll(" ", " "),
  text.replaceAll(",", ""),
  `${text}x`,
  text.slice(0, Math.ceil(text.length / 2)),
  `${text}ß`,
  `${text}SS`,
  `İ${text}`,
  `${text} ΣΑΣ`,
];

/**
 * Give the variants of a number's lexical form a candidate may give for it: itself, one either
 * side, its negation, zero, and a fractional neighbour.
 *
 * @param text The number's lexical form.
 * @param baseType Its base type, `integer` or `float`.
 * @returns The variants.
 */
const numberVariants = (text: string, baseType: "float" | "integer"): readonly string[] => {
  const number = Number(text);

  if (!Number.isFinite(number)) {
    return [text];
  }

  const integers = [number, number + 1, number - 1, -number, 0].map((each) =>
    String(Math.trunc(each)),
  );

  return baseType === "integer"
    ? integers
    : [...integers, String(number + 0.5), String(number * 1.0001), String(number + 1e-9)];
};

/**
 * Give the points that probe an area: its centre, a point on its edge and points just outside,
 * from its shape's coordinates.
 *
 * @param coords The area's coordinates.
 * @returns The points, as lexical forms `x y`.
 */
const pointsAround = (coords: readonly number[]): readonly string[] => {
  const [x = 0, y = 0, third = 0, fourth = 0] = coords;
  const xs = [x, third, Math.round((x + third) / 2), x - 1, third + 1];
  const ys = [y, fourth, Math.round((y + fourth) / 2), y - 1, fourth + 1];

  return xs.flatMap((px) => ys.map((py) => `${String(Math.round(px))} ${String(Math.round(py))}`));
};

/**
 * Give the variants a candidate may give of a response's seeds, by its base type: each string's
 * and each number's variants, a boolean's two values whatever the seeds, and any other base type's
 * seeds as they are.
 */
const variantsBy: Readonly<
  Record<ModelledBaseType, (seeds: readonly string[]) => readonly string[]>
> = {
  boolean: () => ["true", "false"],
  directedPair: (seeds) => seeds,
  duration: (seeds) => seeds.flatMap((seed) => numberVariants(seed, "float")),
  file: (seeds) => seeds,
  float: (seeds) => seeds.flatMap((seed) => numberVariants(seed, "float")),
  identifier: (seeds) => seeds,
  integer: (seeds) => seeds.flatMap((seed) => numberVariants(seed, "integer")),
  pair: (seeds) => seeds,
  point: (seeds) => seeds,
  string: (seeds) => seeds.flatMap(stringVariants),
  uri: (seeds) => seeds,
};

/**
 * Exchange two adjacent singles of a sequence.
 *
 * @param values The sequence.
 * @param index The first of the two.
 * @returns The sequence with them exchanged; the sequence itself where it ends before the second.
 */
const swapped = (values: readonly Single[], index: number): readonly Single[] => {
  const [first, second] = values.slice(index, index + 2);

  return first === undefined || second === undefined
    ? values
    : values.toSpliced(index, 2, second, first);
};

/**
 * Give the lexical forms one response varies over: its correct singles first, then its default's,
 * its mapping's keys, its area mapping's probes, the interactions' offers, the processing's
 * literals of its base type and each one's variants, each once, at most
 * {@link singlesPerResponse}.
 *
 * @param document The item's source.
 * @param declaration The response's declaration.
 * @returns The lexical forms.
 */
const lexicalsOf = (
  document: SourceDocument,
  declaration: ResponseDeclaration,
): readonly string[] => {
  const { baseType } = declaration;
  const correct = Option.match(declaration.correct, {
    onNone: (): readonly string[] => [],
    onSome: (value) => value.values.map(format),
  });
  const defaults = Option.match(declaration.defaultValue, {
    onNone: (): readonly string[] => [],
    onSome: (value) => value.values.map(format),
  });
  const keys = Option.match(declaration.mapping, {
    onNone: (): readonly string[] => [],
    onSome: (mapping) => mapping.entries.map((entry) => format(entry.key)),
  });
  const probes = Option.match(declaration.areaMapping, {
    onNone: (): readonly string[] => [],
    onSome: (mapping) => mapping.entries.flatMap((entry) => pointsAround(entry.coords)),
  });
  const seeds = [
    ...correct,
    ...defaults,
    ...keys,
    ...offeredBy(document, declaration.identifier, baseType),
    ...literalsOf(document, baseType),
  ];
  const varied = variantsBy[baseType](seeds);

  return [...new Set([...correct, ...probes, ...varied])].slice(0, singlesPerResponse);
};

/**
 * Read lexical forms as singles of a base type, dropping any plate holds no single of.
 *
 * @param baseType The base type.
 * @param lexicals The lexical forms.
 * @returns The singles.
 */
const singlesOf = (baseType: ModelledBaseType, lexicals: readonly string[]): readonly Single[] =>
  lexicals.flatMap((lexical) => {
    const read = parseLexical(baseType, lexical);

    return Result.isSuccess(read) && !(read.success.baseType === "string" && lexical === "")
      ? [read.success]
      : [];
  });

/**
 * Construct a value of a declaration's type.
 *
 * @param declaration The declaration.
 * @param singles The singles, none for NULL.
 * @returns The value.
 */
const valueOf = (declaration: ResponseDeclaration, singles: readonly Single[]): Value => ({
  baseType: declaration.baseType,
  cardinality: declaration.cardinality,
  values: declaration.cardinality === "single" ? singles.slice(0, 1) : singles,
});

/**
 * Give the values one response varies over: for a single, NULL and each single; for a multiple or
 * ordered, the correct container, each with one value left out, each with one value added, each
 * single alone, the reverse and each adjacent swap of an ordered, every single at once, and NULL.
 *
 * @param declaration The response's declaration.
 * @param singles The singles it varies over, its correct ones first.
 * @returns The values, named.
 */
const variedValues = (
  declaration: ResponseDeclaration,
  singles: readonly Single[],
): readonly (readonly [name: string, value: Value])[] => {
  const named = (name: string, values: readonly Single[]) =>
    [name, valueOf(declaration, values)] as const;
  const correct = Option.match(declaration.correct, {
    onNone: (): readonly Single[] => [],
    onSome: (value) => value.values,
  });
  const alone = singles.map((single) => named(`alone ${format(single)}`, [single]));

  if (declaration.cardinality === "single") {
    return [named("null", []), ...alone];
  }

  const others = singles.filter(
    (single) => !correct.some((each) => format(each) === format(single)),
  );
  const dropped = correct.map((_, index) =>
    named(`correct without ${String(index)}`, correct.toSpliced(index, 1)),
  );
  const added = others.map((single) =>
    named(`correct with ${format(single)}`, [...correct, single]),
  );
  const reordered =
    declaration.cardinality === "ordered"
      ? [
          named("correct reversed", correct.toReversed()),
          ...correct
            .slice(1)
            .map((_, index) =>
              named(`correct swapped at ${String(index)}`, swapped(correct, index)),
            ),
        ]
      : [];

  return [
    named("null", []),
    named("correct", correct),
    ...dropped,
    ...added,
    ...reordered,
    ...alone,
    named("every single", singles),
  ];
};

/**
 * Give the interactions bound to a response, in document order.
 *
 * @param document The item's source.
 * @param identifier The response.
 * @returns The interactions.
 */
const boundTo = (document: SourceDocument, identifier: string): readonly SourceElement[] =>
  elementsOf(document.root).filter(
    (element) =>
      element.local.endsWith("-interaction") &&
      Option.exists(attribute(element, "response-identifier"), (bound) => bound === identifier),
  );

/**
 * Give an identifier no element of the item carries: `unknown`, else `unknown-` and the least
 * number from 1 that no element carries.
 *
 * @param document The item's source.
 * @returns The identifier.
 */
const unheldOf = (document: SourceDocument): string => {
  const held = new Set(
    elementsOf(document.root).flatMap((element) =>
      Option.toArray(attribute(element, "identifier")),
    ),
  );
  const fresh = (n: number): string => {
    const candidate = n === 0 ? "unknown" : `unknown-${String(n)}`;

    return held.has(candidate) ? fresh(n + 1) : candidate;
  };

  return fresh(0);
};

/**
 * Read an attribute as a whole number of pixels or counts, as plate reads an image's size: digits
 * between XML white space.
 *
 * @param element The element.
 * @param name The attribute.
 * @returns The number, none where the attribute is absent or no whole number.
 */
const wholeOf = (element: SourceElement, name: string): Option.Option<number> =>
  attribute(element, name).pipe(
    Option.map((written) => written.trim()),
    Option.filter((written) => /^[0-9]+$/u.test(written)),
    Option.map(Number),
  );

/**
 * Read an attribute as a finite number.
 *
 * @param element The element.
 * @param name The attribute.
 * @returns The number, none where the attribute is absent or no finite number.
 */
const numberOf = (element: SourceElement, name: string): Option.Option<number> =>
  attribute(element, name).pipe(
    Option.map((written) => Number(written.trim())),
    Option.filter(Number.isFinite),
  );

/**
 * Give an element's element children, in document order.
 *
 * @param element The element.
 * @returns Its element children.
 */
const childElementsOf = (element: SourceElement): readonly SourceElement[] =>
  element.children.filter((child): child is SourceElement => child.kind === "element");

/**
 * Give the size an element's image is authored at: its first `img`, `picture` or `object` child,
 * a picture's by its first `img`, with both a width and a height above 0.
 *
 * @param holder The element holding the image.
 * @returns The width and height, none where the image or either dimension is missing.
 */
const imageSizeOf = (holder: SourceElement): Option.Option<readonly [number, number]> =>
  Arr.findFirst(childElementsOf(holder), (child) =>
    ["img", "object", "picture"].includes(child.local),
  ).pipe(
    Option.flatMap((image) =>
      image.local === "picture"
        ? Arr.findFirst(childElementsOf(image), (child) => child.local === "img")
        : Option.some(image),
    ),
    Option.flatMap((carrier) =>
      Option.all([wholeOf(carrier, "width"), wholeOf(carrier, "height")]),
    ),
    Option.filter(([width, height]) => width > 0 && height > 0),
  );

/**
 * Give the element whose image a point of an interaction is placed on: a Position Object's stage,
 * the `qti-position-object-stage` that holds it, and any other interaction itself.
 *
 * @param document The item's source.
 * @param interaction The interaction.
 * @returns The element, none for a Position Object no stage holds.
 */
const pointHolderOf = (
  document: SourceDocument,
  interaction: SourceElement,
): Option.Option<SourceElement> =>
  interaction.local === "qti-position-object-interaction"
    ? Option.fromUndefinedOr(
        elementsOf(document.root).find(
          (element) =>
            element.local === "qti-position-object-stage" && element.children.includes(interaction),
        ),
      )
    : Option.some(interaction);

/**
 * A probe of a response: what it is named by, and the lexical form it posts.
 */
type Probe = readonly [name: string, lexical: string];

/**
 * The bounds the interactions that declare numeric bounds hold for their response, by the
 * interaction's element, each as the lexical forms just past it: one below a Slider's
 * `lower-bound` and one above its `upper-bound`, as whole numbers for an integer; a Media's play
 * count below its floor of 0, and one above its `max-plays` when that is above 0. An interaction
 * of any other element declares none.
 */
const pastBoundsBy: ReadonlyMap<
  string,
  (interaction: SourceElement, whole: boolean) => readonly Probe[]
> = new Map([
  [
    "qti-slider-interaction",
    (interaction: SourceElement, whole: boolean): readonly Probe[] => [
      ...Option.toArray(numberOf(interaction, "lower-bound")).map((lower): Probe => [
        "past lower-bound",
        String(whole ? Math.floor(lower) - 1 : lower - 1),
      ]),
      ...Option.toArray(numberOf(interaction, "upper-bound")).map((upper): Probe => [
        "past upper-bound",
        String(whole ? Math.ceil(upper) + 1 : upper + 1),
      ]),
    ],
  ],
  [
    "qti-media-interaction",
    (interaction: SourceElement): readonly Probe[] => [
      ["past plays", "-1"],
      ...Option.toArray(
        wholeOf(interaction, "max-plays").pipe(Option.filter((most) => most > 0)),
      ).map((most): Probe => ["past max-plays", String(most + 1)]),
    ],
  ],
]);

/**
 * What the probes of one response read: the interactions bound to it, the first lexical form they
 * offer it, and an identifier no element of the item carries.
 */
interface ProbeContext {
  readonly document: SourceDocument;
  readonly interactions: readonly SourceElement[];
  readonly offer: Option.Option<string>;
  readonly unheld: string;
}

/**
 * The floats no number variant gives, which comparisons must hold apart or together exactly: NaN,
 * which equals nothing, the two infinities, and negative zero, which equals zero.
 */
const floatEdges = ["NaN", "INF", "-INF", "-0"] as const;

/**
 * Give the probe of a choice no interaction holds, paired with the second member of the first pair
 * the interactions offer.
 *
 * @param context The response's probe context.
 * @returns The probe, none where the interactions offer no pair.
 */
const unknownPairOf = (context: ProbeContext): readonly Probe[] =>
  Option.toArray(
    context.offer.pipe(
      Option.flatMap((offer) => Arr.get(offer.split(" "), 1)),
      Option.map((member): Probe => ["unknown", `${context.unheld} ${member}`]),
    ),
  );

/**
 * Give the probes of a number just past each bound the response's interactions declare
 * ({@link pastBoundsBy}).
 *
 * @param context The response's probe context.
 * @param whole Whether the response is an integer.
 * @returns The probes.
 */
const pastBoundsOf = (context: ProbeContext, whole: boolean): readonly Probe[] =>
  context.interactions.flatMap((interaction) =>
    Option.match(Option.fromUndefinedOr(pastBoundsBy.get(interaction.local)), {
      onNone: (): readonly Probe[] => [],
      onSome: (bounds) => bounds(interaction, whole),
    }),
  );

/**
 * The probes of each base type that no varied value reaches, past the limits the response's
 * interactions set: a choice no interaction holds, alone (with a real member, for a pair); a pair
 * of a choice with itself; a point one past the image it is placed on in both coordinates; and a
 * number just past each bound its interactions declare. Every other base type has none.
 */
const probesBy: Readonly<Record<ModelledBaseType, (context: ProbeContext) => readonly Probe[]>> = {
  boolean: () => [],
  directedPair: unknownPairOf,
  duration: () => [],
  file: () => [],
  float: (context) => [
    ...pastBoundsOf(context, false),
    ...floatEdges.map((lexical): Probe => ["edge", lexical]),
  ],
  identifier: (context) =>
    Option.toArray(context.offer).map((): Probe => ["unknown", context.unheld]),
  integer: (context) => pastBoundsOf(context, true),
  pair: (context) => [
    ...unknownPairOf(context),
    ...Option.toArray(
      context.offer.pipe(
        Option.flatMap((offer) => Arr.head(offer.split(" "))),
        Option.map((member): Probe => ["self", `${member} ${member}`]),
      ),
    ),
  ],
  point: (context) =>
    context.interactions.flatMap((interaction) =>
      Option.toArray(
        Option.flatMap(pointHolderOf(context.document, interaction), imageSizeOf).pipe(
          Option.map(([width, height]): Probe => [
            "beyond",
            `${String(width + 1)} ${String(height + 1)}`,
          ]),
        ),
      ),
    ),
  string: () => [],
  uri: () => [],
};

/**
 * Give the values that probe a response's interactions past their limits ({@link probesBy}),
 * then, for a container, its first single given twice.
 *
 * @param document The item's source.
 * @param declaration The response's declaration.
 * @param singles The singles it varies over, its correct ones first.
 * @returns The values, named.
 */
const probesOf = (
  document: SourceDocument,
  declaration: ResponseDeclaration,
  singles: readonly Single[],
): readonly (readonly [name: string, value: Value])[] => {
  const { baseType, cardinality, identifier } = declaration;
  const probes = probesBy[baseType]({
    document,
    interactions: boundTo(document, identifier),
    offer: Arr.head(offeredBy(document, identifier, baseType)),
    unheld: unheldOf(document),
  });

  return [
    ...probes.flatMap(([name, lexical]) =>
      singlesOf(baseType, [lexical]).map(
        (single) => [`${name} ${format(single)}`, valueOf(declaration, [single])] as const,
      ),
    ),
    ...(cardinality === "single"
      ? []
      : Option.toArray(Arr.head(singles)).map(
          (first) => [`repeated ${format(first)}`, valueOf(declaration, [first, first])] as const,
        )),
  ];
};

/**
 * Give an item's cases: every posting untouched; every posting at its correct response; then, for
 * each posting in turn, each of its varied values with every other posting at its correct response;
 * the sequences of attempts that QTI's session rules turn on: a wrong answer then the correct
 * one, the correct one twice, a hint (an End Attempt's `true`) then the correct answer, two hints,
 * and for an adaptive item four attempts; then, for each posting in turn, each value that probes
 * its interactions past their limits ({@link probesOf}), with every other posting at its correct
 * response; and last, for each file response an Upload binds, which plate shows as a notice and so
 * posts nothing for, the file `golden/files.ts` states. The probes and the uploads come last, so
 * the cases before them are the same whatever probes an item gives.
 *
 * @param accepted The item.
 * @param document The item's source.
 * @param posts The item's postings.
 * @param untouched The value each posting gives when the candidate leaves it as the form starts
 *   it, by response identifier.
 * @returns The cases.
 */
export const casesOf = (
  accepted: Accepted,
  document: SourceDocument,
  posts: readonly Posting[],
  untouched: Posted,
): readonly Case[] => {
  const declarations = posts.flatMap((posting) =>
    Option.toArray(Option.fromUndefinedOr(accepted.item.responses.get(posting.identifier))),
  );
  const correctOf = (declaration: ResponseDeclaration): ResponseValue =>
    Option.getOrElse(
      declaration.correct,
      () => untouched[declaration.identifier] ?? valueOf(declaration, []),
    );
  const allCorrect = {
    ...untouched,
    ...Object.fromEntries(declarations.map((each) => [each.identifier, correctOf(each)])),
  } satisfies Posted;
  const casesFor = (
    declaration: ResponseDeclaration,
    values: readonly (readonly [name: string, value: Value])[],
  ): readonly Case[] =>
    values.map(
      ([name, value]) =>
        ({
          attempts: [{ ...allCorrect, [declaration.identifier]: value }],
          name: `${declaration.identifier}: ${name}`,
        }) satisfies Case,
    );
  const singlesFor = (declaration: ResponseDeclaration): readonly Single[] =>
    singlesOf(declaration.baseType, lexicalsOf(document, declaration));
  const varied = declarations.flatMap((declaration) =>
    casesFor(declaration, variedValues(declaration, singlesFor(declaration))),
  );
  const probed = declarations.flatMap((declaration) =>
    casesFor(declaration, probesOf(document, declaration, singlesFor(declaration))),
  );
  const wrong = varied.find(
    (each) =>
      each.name.includes(": alone ") &&
      JSON.stringify(goldenMap(each.attempts[0] ?? {})) !== JSON.stringify(goldenMap(allCorrect)),
  );
  const hints = declarations.filter(
    (declaration) =>
      declaration.baseType === "boolean" &&
      declaration.cardinality === "single" &&
      posts.some(
        (posting) =>
          posting.identifier === declaration.identifier &&
          elementsOf(document.root).some(
            (element) =>
              element.local === "qti-end-attempt-interaction" &&
              Option.exists(
                attribute(element, "response-identifier"),
                (bound) => bound === declaration.identifier,
              ),
          ),
      ),
  );
  const hinted = hints.map(
    (declaration) =>
      ({
        ...untouched,
        [declaration.identifier]: valueOf(declaration, singlesOf("boolean", ["true"])),
      }) satisfies Posted,
  );
  const sequences: readonly Case[] = [
    ...Option.toArray(Option.fromUndefinedOr(wrong)).flatMap((each): readonly Case[] => [
      { attempts: [...each.attempts, allCorrect], name: `sequence: ${each.name}, then correct` },
      ...(accepted.item.adaptive
        ? [
            {
              attempts: [...each.attempts, ...each.attempts, allCorrect, allCorrect],
              name: `sequence: adaptive ${each.name} twice, then correct twice`,
            },
          ]
        : []),
    ]),
    { attempts: [allCorrect, allCorrect], name: "sequence: correct twice" },
    ...hinted.flatMap((hint): readonly Case[] => [
      { attempts: [hint, allCorrect], name: "sequence: hint, then correct" },
      { attempts: [hint, hint], name: "sequence: hint twice" },
    ]),
  ];

  const uploads = [...accepted.item.responses.values()].filter(
    (declaration) =>
      declaration.baseType === "file" &&
      boundTo(document, declaration.identifier).some(
        (interaction) => interaction.local === "qti-upload-interaction",
      ),
  );
  const uploaded = uploads.map((declaration): Case => ({
    attempts: [
      {
        ...allCorrect,
        [declaration.identifier]: valueOf(declaration, [{ baseType: "file", value: uploadedFile }]),
      },
    ],
    name: `${declaration.identifier}: file ${uploadedFile.name}`,
  }));

  return [
    { attempts: [untouched], name: "untouched" },
    { attempts: [allCorrect], name: "correct" },
    ...varied,
    ...sequences,
    ...probed,
    ...uploaded,
  ];
};
