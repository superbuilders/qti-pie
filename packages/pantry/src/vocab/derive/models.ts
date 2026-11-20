/**
 * The content-model deriver: it reads every vocabulary's XSDs into the content-model IR of
 * `src/vocab/inventory/types.ts`, and prints the generated leaf `src/vocab/inventory/models.ts`
 * (review R12).
 *
 * Run it from `packages/pantry` as `node src/vocab/derive/models.ts`. It reads only the files
 * `sources.ts` pins and touches no database, and it imports nothing that reads the leaf, so it
 * still runs while the leaf is being rewritten:
 *
 * ```sh
 * node src/vocab/derive/models.ts > src/vocab/inventory/models.ts
 * pnpm exec vp fmt src/vocab/inventory/models.ts
 * ```
 *
 * `models.test.ts` beside it checks that a re-run reproduces the committed leaf byte for byte.
 *
 * Reading rules, beyond those of the IR's module comment:
 *
 * - **The schemas.** QTI 3.0.1's ASI, content-packaging, CSM, content-packaging extension and AfA DRD
 *   XSDs, and the LOM, QTI metadata, usage data, MathML, SSML, XInclude and `xml.xsd` XSDs they
 *   import. SSML is its no-namespace file as the core profile includes it as a chameleon and
 *   redefines it (`ssml.ts`).
 * - **The kinds.** Every element declaration of those schemas, global or local, that is not abstract
 *   is a kind of the vocabulary of its namespace: its handle prefix and local name
 *   (`namespaces.ts`), unless the element is declared with several types, when its type's naming
 *   decision names it (`naming.ts`). An element of several types with an undecided type is refused.
 *   An anonymous type is told apart by the top-level group it is written in, as MathML's three
 *   `semantics` declarations are ({@link declaredOf}).
 * - **A kind's model.** A declaration of a named or anonymous complex type reads that type; of a
 *   simple type, `simple`; of no type, its substitution group head's, else `xs:anyType`'s, which is
 *   mixed content of one lax `##any` wildcard, any number of times. A kind declared more than once
 *   has one model; declarations of one kind with two models are refused, since a naming decision
 *   then names each.
 * - **Empty content.** A model group that is empty content by XML Schema 1.0 Part 1, §3.4.2, clause
 *   2.1 (an empty `xs:sequence` or `xs:all`, an empty optional `xs:choice`, any group of
 *   `maxOccurs` 0) adds no particle, and a type left with none is `empty`, unless it is mixed.
 * - **Wildcards.** A wildcard's target namespace is its kind's (see {@link modelsOf}).
 * - **Types.** A model states its element's declared type, and every named type and built-in its
 *   derivations ({@link derivationsOf}): the `xsi:type` values an element of it may name. A `block`
 *   is refused, and so is a derivation a `final` forbids.
 * - **Sources.** Every model and particle cites the file and line of the construct it is read from
 *   (`sources.ts`'s lines, joined to the tree by document order).
 */
import { NodeRuntime, NodeServices } from "@effect/platform-node";
import { Array as Arr, Console, Effect, Layer, Match, Option, Order, Result } from "effect";
import { Command } from "effect/cli";
import { Digest } from "effect/crypto";
import { codePointOrder } from "@qti-pie/crust/charset.ts";
import type { Element, XmlDocument } from "@qti-pie/crust/tree.ts";
import { XML_NAMESPACE } from "@qti-pie/crust/tree.ts";
import {
  attributeOf,
  contentParticles,
  derivationOf,
  elementNamespaceOf,
  elementsOf,
  firstXs,
  isAbstract,
  isCompositor,
  isXs,
  loadSchemaSet,
  mixedOf,
  occursOf,
  particlesOf,
  refuse,
  requireAttribute,
  requireComponent,
  resolve,
  wildcardOf,
} from "#pantry/vocab/derive/derive.ts";
import type { SchemaSet, XsdReadingError, XsdSchema } from "#pantry/vocab/derive/derive.ts";
import { decidedHandleOf, isDecided } from "#pantry/vocab/derive/naming.ts";
import { builtinBases } from "#pantry/vocab/derive/domains.ts";
import { readPlaced } from "#pantry/vocab/derive/sources.ts";
import type { Placed, SourcePath } from "#pantry/vocab/derive/sources.ts";
import { redefinitionKey, ssmlSchemaOf } from "#pantry/vocab/derive/ssml.ts";
import type {
  Compositor,
  ContentModel,
  ContentType,
  ExpandedName,
  Occurs,
  Particle,
  Source,
  TypeDerivation,
} from "#pantry/vocab/inventory/types.ts";
import { contentParticle } from "#pantry/vocab/inventory/types.ts";
import {
  handlePrefixOf,
  noNamespace,
  vocabularyNamespaces,
  xsNamespace,
} from "#pantry/vocab/namespaces.ts";

/**
 * One schema as the IR reads it: its index, the complex types a redefinition replaces, which the
 * index holds under {@link redefinitionKey}, and where each of its elements is stated.
 */
export interface SchemaView {
  readonly redefined: ReadonlySet<string>;
  readonly schema: XsdSchema;
  readonly sourceOf: SourceOf;
}

/**
 * Find where an element of the schema documents is stated: its file and the line its start tag
 * begins on.
 */
type SourceOf = (node: Element) => Result.Result<Source, XsdReadingError>;

/**
 * The schemas, by target namespace.
 */
export type World = ReadonlyMap<string, SchemaView>;

/**
 * The pinned entry document of each schema the vocabularies read. SSML is read apart, from its two
 * files.
 */
const worldSources = [
  "imsqti_asiv3p0p1_v1p0.xsd",
  "imsqtiv3p0p1_imscpv1p2_v1p0.xsd",
  "csm/imsqtiv3p0p1_csmv1p1_v1p0.xsd",
  "cpext/imsqtiv3p0p1_cpextv1p2_v1p0.xsd",
  "drd/imsqtiv3p0p1_afa3p0drd_v1p0.xsd",
  "lom/imsmd_loose_v1p3p2.xsd",
  "imsqti_metadatav3p0_v1p0.xsd",
  "usagedata/imsqti_usagedatav3p0_v1p0.xsd",
  "mathml/mathml3.xsd",
  "w3/XInclude.xsd",
  "w3/xml.xsd",
] as const satisfies readonly SourcePath[];

/**
 * The two SSML files: the no-namespace schema and the core profile that redefines it.
 */
const ssmlSources = ["ssml/synthesis-nonamespace.xsd", "ssml/ssmlv1p1-core.xsd"] as const;

/**
 * Exactly one occurrence: the bounds of a type's content as a whole.
 */
const once: Occurs = { max: Option.some(1), min: 1 };

/**
 * Where `xs:anyType`'s content is stated: by XML Schema itself, in no pinned XSD.
 */
const anyTypeSource: Source = { _tag: "spec", cite: "XML Schema 1.0 Part 1 §3.4.7 xs:anyType" };

/**
 * The model `xs:anyType` gives an element declared with no type: mixed content of a lax `##any`
 * wildcard, any number of times.
 */
const anyTypeContent: ContentType = {
  _tag: "mixed",
  particle: {
    _tag: "group",
    compositor: "sequence",
    occurs: once,
    particles: [
      {
        _tag: "any",
        namespace: "##any",
        occurs: { max: Option.none(), min: 0 },
        processing: "lax",
        source: anyTypeSource,
      },
    ],
    source: anyTypeSource,
  },
};

/**
 * The complex type a schema's type name stands for: its redefinition where one replaces it.
 *
 * Public, and stable while the vocabularies are derived: the declarations deriver reads a governing
 * type's definition with it.
 *
 * @param view - The schema.
 * @param local - The type's local name in the schema's target namespace.
 * @returns The `xs:complexType` element, `None` for a name that is no complex type here.
 */
export const complexTypeIn = (view: SchemaView, local: string): Option.Option<Element> =>
  Option.fromNullishOr(
    view.schema.complexTypes.get(view.redefined.has(local) ? redefinitionKey(local) : local),
  );

/**
 * What an element declaration declares its element with.
 *
 * - `complex`: a complex type, named (`name` its local name) or written in place (`anonymous`).
 * - `simple`: a simple type, built-in, named or written in place.
 * - `anyType`: no type and no substitution group head to take one from.
 */
export type Declared =
  | { readonly _tag: "anyType" }
  | {
      readonly _tag: "complex";
      readonly definition: Element;
      readonly name: string;
      readonly named: Option.Option<ExpandedName>;
    }
  | { readonly _tag: "simple"; readonly name: string; readonly named: Option.Option<ExpandedName> };

/**
 * The name a declared type is decided by: its local name, or `anonymous`.
 */
const anonymous = "anonymous";

/**
 * Whether an element of a schema document is, or holds, another, by identity.
 *
 * @param node - The element searched.
 * @param target - The element sought.
 * @returns Whether `target` is `node` or one of its descendants.
 */
const holds = (node: Element, target: Element): boolean =>
  node === target || elementsOf(node).some((child) => holds(child, target));

/**
 * Name the anonymous complex type of a local declaration: `anonymous`, or, for an element a naming
 * decision names, `anonymous in group <name>` after the top-level group the declaration is written
 * in.
 *
 * The group is what tells such an element's types apart: MathML declares `semantics` three times
 * with three anonymous types, in the groups `semantics`, `semantics-ci` and `semantics-contexp`
 * (`mathml3-common.xsd` line 72, `mathml3-strict-content.xsd` lines 65 and 84), so each is a kind
 * of its own (`naming.ts`). An element no decision names keeps `anonymous`, so its handle stays its
 * local name whatever group it sits in.
 *
 * @param view - The schema the declaration is in.
 * @param declaration - The `xs:element` declaration.
 * @param namespace - The namespace of the element it declares ({@link elementNamespaceOf}).
 * @returns The name its type goes by in a naming decision.
 */
const anonymousNameOf = (view: SchemaView, declaration: Element, namespace: string): string => {
  const decided = Option.exists(attributeOf(declaration, "name"), (local) =>
    isDecided(namespace, local),
  );
  const within = decided
    ? Arr.findFirst([...view.schema.groups], ([, group]) => holds(group, declaration))
    : Option.none();

  return Option.match(within, {
    onNone: () => anonymous,
    onSome: ([group]) => `${anonymous} in group ${group}`,
  });
};

/**
 * Read what a declaration declares its element with.
 *
 * @param view - The schema the declaration is in.
 * @param declaration - The `xs:element` declaration.
 * @param namespace - The namespace of the element it declares ({@link elementNamespaceOf}), which
 *   names an anonymous type in a naming decision.
 * @returns The type, or an {@link XsdReadingError} for a type name the schema does not declare.
 */
export const declaredOf = (
  view: SchemaView,
  declaration: Element,
  namespace: string,
): Result.Result<Declared, XsdReadingError> =>
  Result.gen(function* declaredOfBody() {
    const inPlace = firstXs(declaration, "complexType");

    if (Option.isSome(inPlace)) {
      return {
        _tag: "complex",
        definition: inPlace.value,
        name: anonymousNameOf(view, declaration, namespace),
        named: Option.none(),
      } as const;
    }

    if (Option.isSome(firstXs(declaration, "simpleType"))) {
      return { _tag: "simple", name: anonymous, named: Option.none() } as const;
    }

    const type = attributeOf(declaration, "type");

    if (Option.isSome(type)) {
      const name = yield* resolve(view.schema, type.value);

      if (name.namespace === xsNamespace) {
        return name.local === "anyType"
          ? ({ _tag: "anyType" } as const)
          : ({ _tag: "simple", name: name.local, named: Option.some(name) } as const);
      }

      const complex = complexTypeIn(view, name.local);

      if (name.namespace === view.schema.targetNamespace && Option.isSome(complex)) {
        return {
          _tag: "complex",
          definition: complex.value,
          name: name.local,
          named: Option.some(name),
        } as const;
      }

      yield* requireComponent(view.schema, view.schema.simpleTypes, "simpleType", type.value);

      return { _tag: "simple", name: name.local, named: Option.some(name) } as const;
    }

    const head = attributeOf(declaration, "substitutionGroup");

    if (Option.isNone(head)) {
      return { _tag: "anyType" } as const;
    }

    const headName = yield* resolve(view.schema, head.value);
    const headDeclaration = Option.fromNullishOr(view.schema.elements.get(headName.local));

    if (headName.namespace !== view.schema.targetNamespace || Option.isNone(headDeclaration)) {
      return yield* refuse(`the substitution group head ${head.value} is not declared`);
    }

    return yield* declaredOf(view, headDeclaration.value, view.schema.targetNamespace);
  });

/**
 * The name a declared type goes by in a naming decision.
 *
 * @param declared - The type.
 * @returns Its local name, `anonymous` for one written in place, and `anyType` for none.
 */
export const typeNameOf = (declared: Declared): string =>
  declared._tag === "anyType" ? "anyType" : declared.name;

/**
 * One element declaration, as the IR reads it: its namespace and local name, its type, and whether
 * it is a top-level declaration, which a `lax` or `strict` element wildcard reads elements as.
 */
export interface Declaration {
  readonly declaration: Element;
  readonly global: boolean;
  readonly local: string;
  readonly namespace: string;
  readonly type: Declared;
}

/**
 * Every element declaration of a schema that names its element and is not abstract, in document
 * order: each top-level component, then the declarations written inside it.
 *
 * A local declaration is in the target namespace when its `form`, else the schema's
 * `elementFormDefault`, is `qualified`, and in no namespace otherwise.
 *
 * @param view - The schema.
 * @param root - The root of one of its documents.
 * @returns The declarations, or an {@link XsdReadingError} for a type the reading does not read.
 */
export const declarationsIn = (
  view: SchemaView,
  root: Element,
): Result.Result<readonly Declaration[], XsdReadingError> =>
  Result.gen(function* declarationsInBody() {
    const found: Declaration[] = [];
    const { schema } = view;
    const visit = (node: Element, global: boolean): Result.Result<void, XsdReadingError> =>
      Result.gen(function* visitBody() {
        const name = isXs(node, "element") ? attributeOf(node, "name") : Option.none();

        if (Option.isSome(name) && !(global && (yield* isAbstract(node)))) {
          const namespace = yield* elementNamespaceOf(schema, node, global);

          found.push({
            declaration: node,
            global,
            local: name.value,
            namespace,
            type: yield* declaredOf(view, node, namespace),
          });
        }

        for (const child of elementsOf(node)) {
          yield* visit(child, false);
        }
      });

    for (const component of elementsOf(root)) {
      const held = isXs(component, "redefine") ? elementsOf(component) : [component];

      for (const each of held) {
        yield* visit(each, isXs(each, "element"));
      }
    }

    return found;
  });

/**
 * The handle of an element of a type, in the vocabulary of its namespace.
 *
 * @param namespace - The element's namespace.
 * @param local - Its local name.
 * @param type - The name its type goes by.
 * @returns The decided handle of an element of several types, else the namespace's handle prefix
 *   and the local name; an {@link XsdReadingError} for a namespace no vocabulary is in, or an
 *   element of several types whose type no decision names.
 */
export const handleOf = (
  namespace: string,
  local: string,
  type: string,
): Result.Result<string, XsdReadingError> =>
  Option.match(decidedHandleOf(namespace, local, type), {
    onNone: () =>
      isDecided(namespace, local)
        ? refuse(
            `the element {${namespace}}${local} of type ${type} has no handle in src/vocab/derive/naming.ts, which names its other types`,
          )
        : Option.match(handlePrefixOf(namespace), {
            onNone: () => refuse(`no vocabulary is in the namespace "${namespace}" of ${local}`),
            onSome: (prefix) => Result.succeed(`${prefix}${local}`),
          }),
    onSome: Result.succeed,
  });

/**
 * The kinds a reference to a global element stands for: the element unless it is abstract, then
 * each member of its substitution group, read the same way, in document order.
 *
 * @param view - The schema that declares the element.
 * @param local - Its local name.
 * @param seen - The heads being read around it, so a circular group, which XML Schema forbids,
 *   ends.
 * @returns The kinds, or an {@link XsdReadingError} for a name the schema declares no top-level
 *   element of.
 */
const substitutesOf = (
  view: SchemaView,
  local: string,
  seen: ReadonlySet<string>,
): Result.Result<readonly string[], XsdReadingError> =>
  Result.gen(function* substitutesOfBody() {
    const { schema } = view;
    // `substitutions` holds every top-level element, its members none when it heads no group.
    const declared = Option.all([
      Option.fromNullishOr(schema.elements.get(local)),
      Option.fromNullishOr(schema.substitutions.get(local)),
    ]);

    if (Option.isNone(declared)) {
      return yield* refuse(
        `a reference names {${schema.targetNamespace}}${local}, which its schema declares no top-level element of`,
      );
    }

    const [declaration, members] = declared.value;
    const kinds: string[] = [];

    if (!(yield* isAbstract(declaration))) {
      kinds.push(
        yield* handleOf(
          schema.targetNamespace,
          local,
          typeNameOf(yield* declaredOf(view, declaration, schema.targetNamespace)),
        ),
      );
    }

    for (const member of members) {
      if (!seen.has(member)) {
        kinds.push(...(yield* substitutesOf(view, member, new Set([...seen, local]))));
      }
    }

    return kinds;
  });

/**
 * The kinds an element particle stands for.
 *
 * @param world - The schemas.
 * @param view - The schema the particle is written in.
 * @param particle - The `xs:element` particle.
 * @returns A local declaration's one kind, or a reference's kinds ({@link substitutesOf}), in the
 *   schema of the referenced element's namespace; an {@link XsdReadingError} for a reference into
 *   a namespace no pinned schema is of, or one that stands for no kind.
 */
const kindsOf = (
  world: World,
  view: SchemaView,
  particle: Element,
): Result.Result<readonly [string, ...string[]], XsdReadingError> =>
  Result.gen(function* kindsOfBody() {
    const named = attributeOf(particle, "name");
    let kinds: readonly string[];

    if (Option.isSome(named)) {
      const namespace = yield* elementNamespaceOf(view.schema, particle, false);

      kinds = [
        yield* handleOf(
          namespace,
          named.value,
          typeNameOf(yield* declaredOf(view, particle, namespace)),
        ),
      ];
    } else {
      const ref = yield* requireAttribute(particle, "ref");
      const target = yield* resolve(view.schema, ref);
      const holder = Option.fromNullishOr(world.get(target.namespace));

      if (Option.isNone(holder)) {
        return yield* refuse(`the reference ${ref} names a namespace no pinned schema declares`);
      }

      kinds = yield* substitutesOf(holder.value, target.local, new Set());
    }

    return yield* Option.match(Arr.head(kinds), {
      onNone: () => refuse(`the element particle ${particle.qname} stands for no kind`),
      onSome: (first) => Result.succeed([first, ...kinds.slice(1)] as const),
    });
  });

/**
 * The compositors, by their element names.
 */
const compositors: readonly Compositor[] = ["all", "choice", "sequence"];

/**
 * The compositor an element is.
 *
 * @param node - An element of a content model.
 * @returns Its compositor, `None` for an element that is no `xs:sequence`, `xs:choice` or `xs:all`.
 */
const compositorOf = (node: Element): Option.Option<Compositor> =>
  Arr.findFirst(compositors, (compositor) => isXs(node, compositor));

/**
 * Read one particle to the IR.
 *
 * @param world - The schemas.
 * @param view - The schema the particle is written in.
 * @param node - An `xs:element`, `xs:any`, `xs:group` reference or compositor.
 * @param occurs - The particle's bounds: its own, or for a group definition's compositor the
 *   reference's.
 * @returns The particle, or an {@link XsdReadingError}.
 */
const particleOf = (
  world: World,
  view: SchemaView,
  node: Element,
  occurs: Occurs,
): Result.Result<Particle, XsdReadingError> =>
  Result.gen(function* particleOfBody() {
    const source = yield* view.sourceOf(node);

    if (isXs(node, "element")) {
      return {
        _tag: "element",
        kinds: yield* kindsOf(world, view, node),
        occurs,
        source,
      } as const;
    }

    if (isXs(node, "any")) {
      const { namespace, processing } = yield* wildcardOf(node);

      return { _tag: "any", namespace, occurs, processing, source } as const;
    }

    if (isXs(node, "group")) {
      const ref = yield* requireAttribute(node, "ref");
      const held = particlesOf(
        yield* requireComponent(view.schema, view.schema.groups, "group", ref),
      );
      const compositor =
        held.length === 1 ? Option.filter(Arr.head(held), isCompositor) : Option.none();

      if (Option.isNone(compositor)) {
        return yield* refuse(`the group ${ref} holds ${held.length} particles, not one compositor`);
      }

      return { ...(yield* particleOf(world, view, compositor.value, occurs)), source };
    }

    const compositor = compositorOf(node);

    if (Option.isSome(compositor)) {
      const particles: Particle[] = [];

      for (const particle of particlesOf(node)) {
        particles.push(yield* particleOf(world, view, particle, yield* occursOf(particle)));
      }

      return { _tag: "group", compositor: compositor.value, occurs, particles, source } as const;
    }

    return yield* refuse(`an ${node.qname} stands where a particle is read`);
  });

/**
 * Whether one model group a type's content writes is empty content, as XML Schema 1.0 Part 1,
 * §3.4.2, clause 2.1, reads it: an `xs:all` or `xs:sequence` with no particle (2.1.2), an
 * `xs:choice` with no particle and `minOccurs` 0 (2.1.3), or any of the four, a group reference
 * included, with `maxOccurs` 0 (2.1.4). A group reference whose group's compositor is empty is not:
 * it is a particle, so the content is element-only, and admits whitespace.
 *
 * @param node - An `xs:all`, `xs:choice`, `xs:sequence` or `xs:group` reference among a type's or a
 *   derivation step's children.
 * @returns Whether it is empty content, or an {@link XsdReadingError} for an unread bound.
 */
const isEmptyContent = (node: Element): Result.Result<boolean, XsdReadingError> =>
  Result.map(occursOf(node), (occurs) => {
    const held = particlesOf(node).length > 0;

    return (
      Option.contains(occurs.max, 0) ||
      ((isXs(node, "all") || isXs(node, "sequence")) && !held) ||
      (isXs(node, "choice") && !held && occurs.min === 0)
    );
  });

/**
 * Read a complex type's `{content type}` to the IR.
 *
 * Each derivation step's model group is its effective content unless it is empty content
 * ({@link isEmptyContent}), and an extension's content is its base's followed by its own
 * (XML Schema 1.0 Part 1, §3.4.2, clause 3.2), so the type's particles are every step's non-empty
 * group, base first. A type with none is `empty` unless it is mixed, which admits character data
 * alone; one with any is element-only or mixed.
 *
 * @param world - The schemas.
 * @param view - The schema the type is in.
 * @param complexType - The `xs:complexType` element.
 * @returns Its content type.
 */
const contentTypeOf = (
  world: World,
  view: SchemaView,
  complexType: Element,
): Result.Result<ContentType, XsdReadingError> =>
  Result.gen(function* contentTypeOfBody() {
    if (Option.isSome(firstXs(complexType, "simpleContent"))) {
      return { _tag: "simple" } as const;
    }

    const nodes = yield* contentParticles(view.schema, complexType);
    const particles: Particle[] = [];

    for (const node of nodes) {
      if (!(yield* isEmptyContent(node))) {
        particles.push(yield* particleOf(world, view, node, yield* occursOf(node)));
      }
    }

    const particle: Particle = {
      _tag: "group",
      compositor: "sequence",
      occurs: once,
      particles,
      source: yield* view.sourceOf(complexType),
    };

    if (yield* mixedOf(view.schema, complexType)) {
      return { _tag: "mixed", particle } as const;
    }

    return particles.length === 0
      ? ({ _tag: "empty" } as const)
      : ({ _tag: "element-only", particle } as const);
  });

/**
 * A kind's model, and where it is stated: its type's `xs:complexType`, or its element's
 * `xs:element` for a type with no complex definition.
 */
interface Modeled {
  readonly content: ContentType;
  readonly source: Source;
  readonly type: Option.Option<ExpandedName>;
}

/**
 * `xs:anyType`, the type of an element declared with none.
 */
const anyTypeName: ExpandedName = { local: "anyType", namespace: xsNamespace };

/**
 * The expanded name of a declaration's type: `xs:anyType` for none, `None` for a type written in
 * place.
 *
 * @param declared - The type.
 * @returns Its name.
 */
const declaredNameOf = (declared: Declared): Option.Option<ExpandedName> =>
  declared._tag === "anyType" ? Option.some(anyTypeName) : declared.named;

/**
 * A particle's structure, without its sources, as text.
 *
 * @param particle - The particle.
 * @returns A key two particles share exactly when their structures are equal.
 */
const particleStructureOf = (particle: Particle): string => {
  const bounds = `${particle.occurs.min}..${Option.match(particle.occurs.max, { onNone: () => "n", onSome: String })}`;

  return Match.valueTags(particle, {
    any: ({ namespace, processing }) => `any ${namespace} ${processing} ${bounds}`,
    element: ({ kinds }) => `element ${kinds.join(" ")} ${bounds}`,
    group: ({ compositor, particles }) =>
      `${compositor} ${bounds} (${particles.map(particleStructureOf).join(", ")})`,
  });
};

/**
 * A model's structure: its content without the sources of its particles, which two declarations
 * that agree on a model may state on different lines.
 *
 * @param content - The model.
 * @returns A key two models share exactly when their structures are equal.
 */
const structureOf = (content: ContentType): string =>
  Option.match(contentParticle(content), {
    onNone: () => content._tag,
    onSome: (particle) => `${content._tag} ${particleStructureOf(particle)}`,
  });

/**
 * Whether a model holds an element wildcard.
 *
 * @param content - The model.
 * @returns Whether an `any` particle sits anywhere in it.
 */
const holdsWildcard = (content: ContentType): boolean => {
  const visit = (particle: Particle): boolean =>
    particle._tag === "any" || (particle._tag === "group" && particle.particles.some(visit));

  return Option.exists(contentParticle(content), visit);
};

/**
 * Read the content models: one per kind the schemas declare.
 *
 * A wildcard's namespace test is the target namespace of the schema document it is written in
 * (XML Schema 1.0, §3.10.2; a chameleon include's, the including schema's, §4.2.1), and the IR
 * keeps no namespace beside a wildcard: it reads a wildcard's own namespace as its kind's, which a
 * namespace class relative to the parent (`src/vocab/open.ts`) then reads off the parent element.
 * That holds by construction here, since a declaration's type, its bases and its groups are read
 * only from the declaration's own schema, but an unqualified local declaration is in no namespace
 * while its schema has one, so a model that holds a wildcard and breaks it is refused.
 *
 * @param world - The schemas.
 * @param documents - Every document of those schemas, each with the schema it belongs to.
 * @returns Each kind's model, by kind, in declaration order.
 */
export const modelsOf = (
  world: World,
  documents: readonly (readonly [SchemaView, XmlDocument])[],
): Result.Result<ReadonlyMap<string, Modeled>, XsdReadingError> =>
  Result.gen(function* modelsOfBody() {
    const models = new Map<string, Modeled>();

    for (const [view, document] of documents) {
      for (const { declaration, local, namespace, type } of yield* declarationsIn(
        view,
        document.root,
      )) {
        const content: ContentType = yield* Match.valueTags(type, {
          anyType: () => Result.succeed(anyTypeContent),
          complex: ({ definition }) => contentTypeOf(world, view, definition),
          simple: () => Result.succeed<ContentType>({ _tag: "simple" }),
        });

        if (holdsWildcard(content) && namespace !== view.schema.targetNamespace) {
          return yield* refuse(
            `the element {${namespace}}${local} holds a wildcard written in a schema whose target namespace is ${view.schema.targetNamespace === noNamespace ? "absent" : view.schema.targetNamespace}, but the IR reads a wildcard's target namespace as its element's`,
          );
        }

        const kind = yield* handleOf(namespace, local, typeNameOf(type));
        const known = Option.fromNullishOr(models.get(kind));
        const source = yield* view.sourceOf(
          type._tag === "complex" ? type.definition : declaration,
        );

        if (Option.isNone(known)) {
          models.set(kind, { content, source, type: declaredNameOf(type) });
        } else if (structureOf(known.value.content) !== structureOf(content)) {
          return yield* refuse(
            `the kind ${kind} is declared with two content models; name each of its types in src/vocab/derive/naming.ts`,
          );
        }
      }
    }

    return models;
  });

/**
 * The key of an expanded name in a map.
 *
 * @param name - The name.
 * @returns `{namespace}local`.
 */
const nameKey = ({ local, namespace }: ExpandedName): string => `{${namespace}}${local}`;

/**
 * The models as the leaf's rows, by kind in code-point order.
 *
 * @param models - Each kind's model.
 * @returns The rows.
 */
export const rowsOf = (models: ReadonlyMap<string, Modeled>): readonly ContentModel[] =>
  Arr.sort(
    [...models].map(([kind, { content, source, type }]) => ({ content, kind, source, type })),
    Order.mapInput(codePointOrder, ({ kind }: ContentModel) => kind),
  );

/**
 * Every element of a tree, in document order: the order their start tags stand in the file.
 *
 * @param node - The tree's root.
 * @returns The elements.
 */
const inDocumentOrder = (node: Element): readonly Element[] => [
  node,
  ...elementsOf(node).flatMap(inDocumentOrder),
];

/**
 * The XSD attributes that block a derivation from standing in for its base in an instance, through
 * `xsi:type` (XML Schema 1.0 Part 1, §3.3.2, §3.4.2): no pinned XSD writes one, so every derivation
 * the bases chain is one `xsi:type` may name.
 */
const blockers = ["block", "blockDefault"] as const;

/**
 * How a type is derived from its base.
 */
type DerivationMethod = "extension" | "list" | "restriction" | "union";

/**
 * Every derivation method, which `#all` stands for in a `final`.
 */
const derivationMethods: readonly DerivationMethod[] = [
  "extension",
  "list",
  "restriction",
  "union",
];

/**
 * The derivation methods a `final` or `finalDefault` value forbids: each one it lists, or all for
 * `#all`.
 *
 * @param value - The attribute's value.
 * @returns The methods.
 */
const finalOf = (value: string): ReadonlySet<string> =>
  new Set(value.trim() === "#all" ? derivationMethods : value.trim().split(/\s+/u));

/**
 * The name of `xs:anySimpleType`, the base of every primitive, list and union.
 */
const anySimpleTypeName: ExpandedName = { local: "anySimpleType", namespace: xsNamespace };

/**
 * A type's base in XML Schema's type hierarchy: a complex type's derivation step's `base`, or
 * `xs:anyType` for one with none (Part 1, §3.4.2); a simple type's restriction base, through an
 * anonymous base to its own, or `xs:anySimpleType` for a list or a union (§3.14.2).
 *
 * @param view - The schema the type is in.
 * @param definition - The `xs:complexType` or `xs:simpleType`.
 * @returns The base's name, or an {@link XsdReadingError} for a derivation step that names none.
 */
const baseOf = (
  view: SchemaView,
  definition: Element,
): Result.Result<
  { readonly base: ExpandedName; readonly method: DerivationMethod },
  XsdReadingError
> =>
  Result.gen(function* baseOfBody() {
    if (isXs(definition, "complexType")) {
      const step = yield* derivationOf(definition);

      if (Option.isNone(step)) {
        return { base: anyTypeName, method: "restriction" } as const;
      }

      const { local, namespace } = yield* resolve(
        view.schema,
        yield* requireAttribute(step.value, "base"),
      );

      return {
        base: { local, namespace },
        method: isXs(step.value, "extension") ? "extension" : "restriction",
      } as const;
    }

    const restriction = firstXs(definition, "restriction");

    if (Option.isNone(restriction)) {
      return {
        base: anySimpleTypeName,
        method: Option.isSome(firstXs(definition, "list")) ? "list" : "union",
      } as const;
    }

    const base = attributeOf(restriction.value, "base");

    if (Option.isSome(base)) {
      const { local, namespace } = yield* resolve(view.schema, base.value);

      return { base: { local, namespace }, method: "restriction" } as const;
    }

    const inline = firstXs(restriction.value, "simpleType");

    return Option.isSome(inline)
      ? { base: (yield* baseOf(view, inline.value)).base, method: "restriction" as const }
      : yield* refuse("a simple type's restriction names no base");
  });

/**
 * Order expanded names by namespace, then local name.
 */
const byName: Order.Order<ExpandedName> = Order.combine(
  Order.mapInput(Order.String, ({ namespace }: ExpandedName) => namespace),
  Order.mapInput(Order.String, ({ local }: ExpandedName) => local),
);

/**
 * The key of a derivation a `final` forbids: the base type's {@link nameKey} and the method.
 *
 * @param base - The base type.
 * @param method - The derivation method.
 * @returns `{namespace}local method`.
 */
const forbiddenKey = (base: ExpandedName, method: string): string => `${nameKey(base)} ${method}`;

/**
 * The derivations the named types of some documents forbid: each type's own `final`, or when it
 * states none its document's `finalDefault` (XML Schema 1.0 Part 1, §3.4.2 and §3.14.2,
 * `{final}`), as the type and each method the value forbids.
 *
 * @param documents - The documents, each with its schema.
 * @returns The forbidden derivations, by {@link forbiddenKey}.
 */
const finalsIn = (
  documents: readonly (readonly [SchemaView, XmlDocument])[],
): ReadonlySet<string> => {
  const forbidden = new Set<string>();

  for (const [view, document] of documents) {
    const finalDefault = attributeOf(document.root, "finalDefault");

    for (const component of elementsOf(document.root).flatMap((node) =>
      isXs(node, "redefine") ? elementsOf(node) : [node],
    )) {
      const local = attributeOf(component, "name");
      const final = Option.orElse(attributeOf(component, "final"), () => finalDefault);

      if (
        (isXs(component, "complexType") || isXs(component, "simpleType")) &&
        Option.isSome(local) &&
        Option.isSome(final)
      ) {
        for (const method of finalOf(final.value)) {
          forbidden.add(
            forbiddenKey({ local: local.value, namespace: view.schema.targetNamespace }, method),
          );
        }
      }
    }
  }

  return forbidden;
};

/**
 * One type in XML Schema's type hierarchy, as {@link derivationsOf} links it: its name and
 * {@link nameKey}, its base's name, `None` for `xs:anyType`, and the types derived from it in one
 * step.
 */
interface TypeNode {
  readonly base: Option.Option<ExpandedName>;
  readonly children: TypeNode[];
  readonly key: string;
  readonly name: ExpandedName;
}

/**
 * Read the type derivations: for every named type of the schemas and every built-in,
 * the named types validly derived from it, itself first, then the rest by distance down the chain
 * of bases, nearest first, then by name.
 *
 * @param world - The schemas.
 * @param documents - Every document of those schemas, which are checked to write no blocker.
 * @returns Each type's derived types, by its {@link nameKey}, or an {@link XsdReadingError} for a
 *   blocker, which the reading would have to subtract.
 */
export const derivationsOf = (
  world: World,
  documents: readonly (readonly [SchemaView, XmlDocument])[],
): Result.Result<ReadonlyMap<string, TypeDerivation>, XsdReadingError> =>
  Result.gen(function* derivationsOfBody() {
    for (const [, document] of documents) {
      for (const node of inDocumentOrder(document.root)) {
        const blocker = blockers.find((name) => Option.isSome(attributeOf(node, name)));

        if (blocker !== undefined) {
          return yield* refuse(
            `an ${node.qname} writes ${blocker}, whose blocked derivations the reading does not subtract`,
          );
        }
      }
    }

    const finals = finalsIn(documents);

    const bases = new Map<string, readonly [ExpandedName, Option.Option<ExpandedName>]>();

    for (const [local, base] of builtinBases) {
      bases.set(nameKey({ local, namespace: xsNamespace }), [
        { local, namespace: xsNamespace },
        base.pipe(Option.map((named) => ({ local: named, namespace: xsNamespace }))),
      ]);
    }

    for (const view of new Set(world.values())) {
      for (const [local, definition] of [...view.schema.complexTypes, ...view.schema.simpleTypes]) {
        // A redefinition stands under its own key beside the type it replaces, whose name and base
        // are the type's.
        if (!local.endsWith(redefinitionKey(""))) {
          const name = { local, namespace: view.schema.targetNamespace };
          const { base, method } = yield* baseOf(view, definition);

          if (finals.has(forbiddenKey(base, method))) {
            return yield* refuse(
              `the type ${nameKey(name)} derives by ${method} from ${nameKey(base)}, whose final forbids it`,
            );
          }

          bases.set(nameKey(name), [name, Option.some(base)]);
        }
      }
    }

    const nodes: readonly TypeNode[] = [...bases].map(([key, [name, base]]) => ({
      base,
      children: [],
      key,
      name,
    }));
    const byKey = new Map(nodes.map((node) => [node.key, node] as const));

    for (const node of nodes) {
      for (const base of Option.toArray(node.base)) {
        const parent = Option.fromNullishOr(byKey.get(nameKey(base)));

        if (Option.isNone(parent)) {
          return yield* refuse(
            `the type ${nameKey(node.name)} derives from ${nameKey(base)}, which no schema declares`,
          );
        }

        parent.value.children.push(node);
      }
    }

    const derivations = new Map<string, TypeDerivation>();

    for (const node of nodes) {
      const derived: ExpandedName[] = [];
      let level: readonly TypeNode[] = [node];

      while (level.length > 0) {
        level = Arr.sort(
          level.flatMap((held) => held.children),
          Order.mapInput(byName, (held: TypeNode) => held.name),
        );
        derived.push(...level.map((held) => held.name));
      }

      derivations.set(node.key, { derived: [node.name, ...derived], type: node.name });
    }

    return derivations;
  });

/**
 * The derivations as the leaf's rows, by type name.
 *
 * @param derivations - Each type's derivations.
 * @returns The rows.
 */
const derivationRowsOf = (
  derivations: ReadonlyMap<string, TypeDerivation>,
): readonly TypeDerivation[] =>
  Arr.sort(
    [...derivations.values()],
    Order.mapInput(byName, ({ type }: TypeDerivation) => type),
  );

/**
 * The documents the schemas are read from, each with its file and the lines of its start tags: each
 * entry document's pin with its documents in reading order, and SSML's two files.
 */
interface WorldDocuments {
  readonly sets: readonly (readonly [SourcePath, SchemaSet])[];
  readonly ssml: readonly [base: Placed, core: Placed];
}

/**
 * Read the documents of the schemas: each pinned entry document with the documents it includes, and
 * SSML's two files.
 *
 * @returns The documents.
 */
const loadWorldDocuments = Effect.fn("vocab.loadWorldDocuments")(function* loadWorldDocuments() {
  const sets: (readonly [SourcePath, SchemaSet])[] = [];

  for (const source of worldSources) {
    sets.push([source, yield* loadSchemaSet(source)]);
  }

  const [base, core] = yield* Effect.all([readPlaced(ssmlSources[0]), readPlaced(ssmlSources[1])], {
    concurrency: "unbounded",
  });

  return { sets, ssml: [base, core] } satisfies WorldDocuments;
});

/**
 * Index where every element of some documents is stated, joining each tree's elements to its
 * file's start-tag lines by document order.
 *
 * @param placed - The documents, each with its file and lines.
 * @returns The lookup, or an {@link XsdReadingError} for a document whose tree and file hold
 *   different numbers of elements, which no join by order can place.
 */
const sourcesIn = (placed: readonly Placed[]): Result.Result<SourceOf, XsdReadingError> =>
  Result.gen(function* sourcesInBody() {
    const located = new WeakMap<Element, Source>();

    for (const { document, file, lines } of placed) {
      const elements = inDocumentOrder(document.root);

      if (elements.length !== lines.length) {
        return yield* refuse(
          `${file} holds ${elements.length} elements in its tree but ${lines.length} start tags`,
        );
      }

      for (const [element, line] of Arr.zip(elements, lines)) {
        located.set(element, { _tag: "xsd", file, line });
      }
    }

    return (node: Element) =>
      Option.match(Option.fromNullishOr(located.get(node)), {
        onNone: () => refuse(`an ${node.qname} that no document of the schemas holds`),
        onSome: (source) => Result.succeed(source),
      });
  });

/**
 * Index the schemas from their documents: each set as one schema, and SSML's
 * no-namespace file as its core profile redefines it.
 *
 * @param read - The documents.
 * @returns The schemas by namespace, every document with its schema, and each namespace's entry
 *   document, the one its schema is read from.
 */
const worldOf = (
  read: WorldDocuments,
): Result.Result<
  {
    readonly documents: readonly (readonly [SchemaView, XmlDocument])[];
    readonly entries: readonly (readonly [string, SourcePath])[];
    readonly world: World;
  },
  XsdReadingError
> =>
  Result.gen(function* worldOfBody() {
    const sourceOf = yield* sourcesIn([
      ...read.sets.flatMap(([, { placed }]) => [...placed.values()]),
      read.ssml[0],
      read.ssml[1],
    ]);
    const views = new Map<string, SchemaView>();
    const documents: (readonly [SchemaView, XmlDocument])[] = [];
    const entries: (readonly [string, SourcePath])[] = [];

    for (const [source, { placed, schema }] of read.sets) {
      const view: SchemaView = { redefined: new Set(), schema, sourceOf };

      views.set(schema.targetNamespace, view);
      entries.push([schema.targetNamespace, source]);
      documents.push(...[...placed.values()].map(({ document }) => [view, document] as const));
    }

    const [base, core] = read.ssml;
    const ssml = yield* ssmlSchemaOf(base.document, core.document);
    const ssmlView: SchemaView = { redefined: ssml.redefined, schema: ssml.schema, sourceOf };

    views.set(ssml.schema.targetNamespace, ssmlView);
    documents.push([ssmlView, base.document]);
    entries.push([ssml.schema.targetNamespace, ssmlSources[1]]);

    return { documents, entries, world: views };
  });

/**
 * Read the schemas: each pinned entry document with the documents it includes, and SSML from its
 * two files.
 *
 * @returns The schemas by namespace, every document with its schema, and each namespace's entry
 *   document, the one its schema is read from.
 */
export const loadWorld = Effect.fn("vocab.loadWorld")(function* loadWorld() {
  return yield* Effect.fromResult(worldOf(yield* loadWorldDocuments()));
});

/**
 * Read the content models and the type derivations into the leaf's rows.
 *
 * @returns The rows.
 */
export const loadModels = Effect.fn("vocab.loadModels")(function* loadModels() {
  const { documents, world } = yield* loadWorld();

  return {
    derivations: derivationRowsOf(yield* Effect.fromResult(derivationsOf(world, documents))),
    models: rowsOf(yield* Effect.fromResult(modelsOf(world, documents))),
  } satisfies ModelsLeaf;
});

/**
 * The models leaf's rows: every kind's content model, and every type's derivations.
 */
interface ModelsLeaf {
  readonly derivations: readonly TypeDerivation[];
  readonly models: readonly ContentModel[];
}

/**
 * The lines of a JSDoc comment; `vp fmt` wraps them.
 *
 * @param paragraphs - Each paragraph as its lines.
 * @returns The comment, from its opening line to its closing one.
 */
const commentOf = (paragraphs: readonly (readonly string[])[]): readonly string[] => [
  "/**",
  ...paragraphs.flatMap((lines, index) => [
    ...(index === 0 ? [] : [" *"]),
    ...lines.map((line) => ` * ${line}`),
  ]),
  " */",
];

/**
 * The names of the four common occurrences, by range.
 */
const commonOccurs: ReadonlyMap<string, string> = new Map([
  ["0..1", "optional"],
  ["0..n", "many"],
  ["1..1", "once"],
  ["1..n", "some"],
]);

/**
 * The name of one occurrence the leaf states as a constant.
 *
 * @param occurs - The occurrence.
 * @returns `once`, `optional`, `many` or `some` for the four common ones, else
 *   `between<min>And<max>` or `atLeast<min>`.
 */
const occursName = ({ max, min }: Occurs): string => {
  const range = `${min}..${Option.match(max, { onNone: () => "n", onSome: String })}`;

  return Option.match(Option.fromNullishOr(commonOccurs.get(range)), {
    onNone: () =>
      Option.match(max, {
        onNone: () => `atLeast${min}`,
        onSome: (bound) => `between${min}And${bound}`,
      }),
    onSome: (name) => name,
  });
};

/**
 * The stem of a namespace's constant in the leaf: XML Schema's and XML's own, or the vocabulary's
 * name from `namespaces.ts`.
 *
 * Every type a model names is a built-in or a named type of a pinned schema, each in XML
 * Schema's namespace, XML's or a vocabulary's, so {@link renderModels} finds a stem for each.
 *
 * @param namespace - The namespace.
 * @returns The stem, `None` for a namespace no vocabulary names.
 */
const namespaceNameOf = (namespace: string): Option.Option<string> => {
  if (namespace === xsNamespace) {
    return Option.some("xs");
  }

  if (namespace === XML_NAMESPACE) {
    return Option.some("xml");
  }

  return Option.map(
    Arr.findFirst(
      Object.entries(vocabularyNamespaces),
      ([, vocabulary]) => vocabulary.namespace === namespace,
    ),
    ([name]) => name,
  );
};

/**
 * Write an identifier stem from a handle: `qti-item-body` is `qtiItemBody`, `m:mi` is `mMi`.
 *
 * @param handle - The handle.
 * @returns The stem.
 */
const camelOf = (handle: string): string =>
  handle
    .split(/[^A-Za-z0-9]+/u)
    .filter((part) => part !== "")
    .map((part, index) => (index === 0 ? part : `${part.charAt(0).toUpperCase()}${part.slice(1)}`))
    .join("");

/**
 * The smallest particle the leaf states as a constant when it recurs: an element particle of more
 * kinds than this, or any group.
 */
const hoistedKinds = 3;

/**
 * Whether a particle is worth a constant of its own when it recurs.
 *
 * @param particle - The particle.
 * @returns Whether it is a group or an element particle of many kinds.
 */
const hoistable = (particle: Particle): boolean =>
  particle._tag === "group" ||
  (particle._tag === "element" && particle.kinds.length > hoistedKinds);

/**
 * A helper the models leaf may define: the IR types it names, whether it comes before the
 * occurrence constants (which call it), and its lines.
 */
interface Helper {
  readonly before: boolean;
  readonly imports: readonly string[];
  readonly lines: readonly string[];
}

/**
 * The helpers the models leaf defines, each only when the leaf calls it, in this order.
 */
const helpers = {
  all: {
    before: false,
    imports: ["Occurs", "Particle", "Source"],
    lines: [
      ...commentOf([
        ["An `all` group."],
        [
          "@param occurs - Its bounds.",
          "@param source - Where it is stated.",
          "@param particles - Its particles.",
          "@returns The particle.",
        ],
      ]),
      "const all = (",
      "  occurs: Occurs,",
      "  source: Source,",
      "  ...particles: readonly Particle[]",
      "): Particle => ({",
      '  _tag: "group",',
      '  compositor: "all",',
      "  occurs,",
      "  particles,",
      "  source,",
      "});",
    ],
  },
  bounded: {
    before: true,
    imports: ["Occurs"],
    lines: [
      ...commentOf([
        ["Bounds with a greatest count."],
        ["@param min - The least.", "@param max - The greatest.", "@returns The occurrence."],
      ]),
      "const bounded = (min: number, max: number): Occurs => ({ max: Option.some(max), min });",
    ],
  },
  choice: {
    before: false,
    imports: ["Occurs", "Particle", "Source"],
    lines: [
      ...commentOf([
        ["A `choice` group."],
        [
          "@param occurs - Its bounds.",
          "@param source - Where it is stated.",
          "@param particles - Its alternatives.",
          "@returns The particle.",
        ],
      ]),
      "const choice = (",
      "  occurs: Occurs,",
      "  source: Source,",
      "  ...particles: readonly Particle[]",
      "): Particle => ({",
      '  _tag: "group",',
      '  compositor: "choice",',
      "  occurs,",
      "  particles,",
      "  source,",
      "});",
    ],
  },
  element: {
    before: false,
    imports: ["Occurs", "Particle", "Source"],
    lines: [
      ...commentOf([
        ["An element particle."],
        [
          "@param occurs - Its bounds.",
          "@param source - Where it is stated.",
          "@param kinds - The kinds it stands for.",
          "@returns The particle.",
        ],
      ]),
      "const element = (",
      "  occurs: Occurs,",
      "  source: Source,",
      "  ...kinds: readonly [string, ...string[]]",
      "): Particle => ({",
      '  _tag: "element",',
      "  kinds,",
      "  occurs,",
      "  source,",
      "});",
    ],
  },
  elementOnly: {
    before: false,
    imports: ["ContentType", "Particle"],
    lines: [
      ...commentOf([
        ["Element content alone."],
        ["@param particle - Its particle.", "@returns The content type."],
      ]),
      'const elementOnly = (particle: Particle): ContentType => ({ _tag: "element-only", particle });',
    ],
  },
  empty: {
    before: false,
    imports: ["ContentType"],
    lines: [...commentOf([["No content."]]), 'const empty: ContentType = { _tag: "empty" };'],
  },
  mixed: {
    before: false,
    imports: ["ContentType", "Particle"],
    lines: [
      ...commentOf([
        ["Element content with character data between the children."],
        ["@param particle - Its particle.", "@returns The content type."],
      ]),
      'const mixed = (particle: Particle): ContentType => ({ _tag: "mixed", particle });',
    ],
  },
  model: {
    before: false,
    imports: ["ContentModel", "ContentType", "ExpandedName", "Source"],
    lines: [
      ...commentOf([
        ["One row."],
        [
          "@param kind - The kind.",
          "@param source - Where it is stated.",
          "@param type - Its element's declared type, `None` for one written in place.",
          "@param content - Its content type.",
          "@returns The row.",
        ],
      ]),
      "const model = (",
      "  kind: string,",
      "  source: Source,",
      "  type: Option.Option<ExpandedName>,",
      "  content: ContentType,",
      "): ContentModel => ({ content, kind, source, type });",
    ],
  },
  sequence: {
    before: false,
    imports: ["Occurs", "Particle", "Source"],
    lines: [
      ...commentOf([
        ["A `sequence` group."],
        [
          "@param occurs - Its bounds.",
          "@param source - Where it is stated.",
          "@param particles - Its particles.",
          "@returns The particle.",
        ],
      ]),
      "const sequence = (",
      "  occurs: Occurs,",
      "  source: Source,",
      "  ...particles: readonly Particle[]",
      "): Particle => ({",
      '  _tag: "group",',
      '  compositor: "sequence",',
      "  occurs,",
      "  particles,",
      "  source,",
      "});",
    ],
  },
  simple: {
    before: false,
    imports: ["ContentType"],
    lines: [
      ...commentOf([["Character data of a simple type alone."]]),
      'const simple: ContentType = { _tag: "simple" };',
    ],
  },
  unbounded: {
    before: true,
    imports: ["Occurs"],
    lines: [
      ...commentOf([
        ["Bounds with no greatest count."],
        ["@param min - The least.", "@returns The occurrence."],
      ]),
      "const unbounded = (min: number): Occurs => ({ max: Option.none(), min });",
    ],
  },
  wildcard: {
    before: false,
    imports: ["NamespaceConstraint", "Occurs", "Particle", "Processing", "Source"],
    lines: [
      ...commentOf([
        ["An element wildcard."],
        [
          "@param occurs - Its bounds.",
          "@param source - Where it is stated.",
          "@param namespace - Its namespace constraint.",
          "@param processing - Its processing.",
          "@returns The particle.",
        ],
      ]),
      "const wildcard = (",
      "  occurs: Occurs,",
      "  source: Source,",
      "  namespace: NamespaceConstraint,",
      "  processing: Processing,",
      '): Particle => ({ _tag: "any", namespace, occurs, processing, source });',
    ],
  },
} as const satisfies Readonly<Record<string, Helper>>;

/**
 * The name of a helper the models leaf may define.
 */
type HelperName = keyof typeof helpers;

/**
 * The helpers' names, in the order the leaf defines them.
 */
const helperNames: readonly HelperName[] = Object.keys(helpers).filter((name): name is HelperName =>
  Object.hasOwn(helpers, name),
);

/**
 * Writes sources into a generated leaf: each as `xsd(file, line)` or `spec(cite)`, each file once
 * as a constant named after its path.
 */
interface SourcesWriter {
  /**
   * Write one row's source.
   *
   * @param source - The source.
   * @returns Its expression.
   */
  readonly expression: (source: Source) => string;
  /**
   * The helpers and file constants the expressions written so far call, to stand before them.
   *
   * @returns The lines.
   */
  readonly preamble: () => readonly string[];
}

/**
 * Write a line number as the lint writes numbers: its digits grouped by three with `_` from five
 * digits on.
 *
 * @param value - The number.
 * @returns Its numeral.
 */
const numeralOf = (value: number): string =>
  value < 10_000 ? String(value) : String(value).replaceAll(/\B(?=(?:\d{3})+$)/gu, "_");

/**
 * Start writing sources into a leaf.
 *
 * @returns The writer, with no file named yet.
 */
export const sourcesWriter = (): SourcesWriter => {
  const files = new Map<SourcePath, string>();
  let cited = false;
  const write = (source: Source): string =>
    Match.valueTags(source, {
      spec: ({ cite }) => {
        cited = true;

        return `spec(${JSON.stringify(cite)})`;
      },
      xsd: ({ file, line }) => {
        const name = camelOf(file);

        files.set(file, name);

        return `xsd(${name}, ${numeralOf(line)})`;
      },
    });

  return {
    expression: write,
    preamble: () => [
      ...(cited
        ? [
            ...commentOf([
              ["Where a specification states a construct no pinned XSD writes."],
              ["@param cite - The text that states it.", "@returns The source."],
            ]),
            'const spec = (cite: string): Source => ({ _tag: "spec", cite });',
            "",
          ]
        : []),
      ...(files.size > 0
        ? [
            ...commentOf([
              ["Where a pinned XSD states a construct."],
              [
                "@param file - The pinned file.",
                "@param line - The line its start tag begins on.",
                "@returns The source.",
              ],
            ]),
            'const xsd = (file: SourcePath, line: number): Source => ({ _tag: "xsd", file, line });',
            "",
          ]
        : []),
      ...Arr.sort(
        [...files],
        Order.mapInput(Order.String, ([file]: readonly [string, string]) => file),
      ).flatMap(([file, name]) => [
        ...commentOf([[`The pinned \`${file}\`.`]]),
        `const ${name}: SourcePath = ${JSON.stringify(file)};`,
        "",
      ]),
    ],
  };
};

/**
 * Write the content-model leaf, unformatted.
 *
 * The module states each occurrence once as a constant, then each particle that recurs once as a
 * constant named after the first kind that holds it, inner constants first, then the rows.
 *
 * @param rows - The rows, in leaf order.
 * @returns The module text, without a final line break, which `vp fmt` turns into the committed
 *   leaf.
 */
export const renderModels = ({ derivations, models: rows }: ModelsLeaf): string => {
  const seen = new Set<string>();
  const recurring = new Set<string>();
  const count = (particle: Particle): void => {
    const key = JSON.stringify(particle);

    if (seen.has(key)) {
      recurring.add(key);
    }

    seen.add(key);
    if (particle._tag === "group") {
      for (const inner of particle.particles) {
        count(inner);
      }
    }
  };

  for (const { content } of rows) {
    for (const particle of Option.toArray(contentParticle(content))) {
      count(particle);
    }
  }

  const writer = sourcesWriter();
  const sourceExpression = writer.expression;
  const occursUsed = new Map<string, Occurs>();
  const hoisted = new Map<string, string>();
  const taken = new Set<string>();
  const constants: string[] = [];
  const expression = (particle: Particle, owner: string): string => {
    const key = JSON.stringify(particle);
    const known = hoisted.get(key);

    if (known !== undefined) {
      return known;
    }

    const occurs = occursName(particle.occurs);

    occursUsed.set(occurs, particle.occurs);

    const source = sourceExpression(particle.source);
    const written = Match.valueTags(particle, {
      any: ({ namespace, processing }) =>
        `wildcard(${occurs}, ${source}, ${JSON.stringify(namespace)}, ${JSON.stringify(processing)})`,
      element: ({ kinds }) =>
        `element(${[occurs, source, ...kinds.map((kind) => JSON.stringify(kind))].join(", ")})`,
      group: ({ compositor, particles }) =>
        `${compositor}(${[occurs, source, ...particles.map((inner) => expression(inner, owner))].join(", ")})`,
    });

    if (hoistable(particle) && recurring.has(key)) {
      const stem = `${camelOf(owner)}Particle`;
      let name = stem;

      for (let suffix = 2; taken.has(name); suffix += 1) {
        name = `${stem}${suffix}`;
      }

      taken.add(name);
      hoisted.set(key, name);
      constants.push(
        ...commentOf([[`A particle that recurs, first held by \`${owner}\`.`]]),
        `const ${name} = ${written};`,
        "",
      );

      return name;
    }

    return written;
  };
  const contentExpression = (content: ContentType, owner: string): string =>
    Match.valueTags(content, {
      "element-only": ({ particle }) => `elementOnly(${expression(particle, owner)})`,
      empty: () => "empty",
      mixed: ({ particle }) => `mixed(${expression(particle, owner)})`,
      simple: () => "simple",
    });
  const namespaceNames = new Map<string, string>();
  const nameExpression = ({ local, namespace }: ExpandedName): string => {
    const written = `${Option.getOrThrowWith(
      namespaceNameOf(namespace),
      () =>
        new Error(
          `The models leaf names a type in the namespace "${namespace}", which neither XML Schema, XML nor any vocabulary of src/vocab/namespaces.ts is in, so it has no constant to write the name with. Add the namespace's vocabulary to vocabularyNamespaces.`,
        ),
    )}Namespace`;

    namespaceNames.set(namespace, written);

    return `named(${written}, ${JSON.stringify(local)})`;
  };
  const body = rows.map(
    ({ content, kind, source, type }) =>
      `  model(${JSON.stringify(kind)}, ${sourceExpression(source)}, ${Option.match(type, { onNone: () => "anonymous", onSome: (named) => `Option.some(${nameExpression(named)})` })}, ${contentExpression(content, kind)}),`,
  );
  const derivationBody = derivations.map(
    ({ derived, type }) =>
      `  derivation(${nameExpression(type)}, ${derived.map(nameExpression).join(", ")}),`,
  );
  const used = new Set<HelperName>(["model"]);
  const note = (text: string): void => {
    for (const name of helperNames) {
      if (new RegExp(`\\b${name}\\b`, "u").test(text)) {
        used.add(name);
      }
    }
  };

  for (const line of [...constants, ...body]) {
    note(line);
  }

  if (occursUsed.size > 0) {
    used.add("bounded");
  }

  const occursLines = Arr.sort(
    [...occursUsed],
    Order.mapInput(Order.String, ([name]: readonly [string, Occurs]) => name),
  ).flatMap(([name, { max, min }]) => {
    const written = Option.match(max, {
      onNone: () => `unbounded(${min})`,
      onSome: (bound) => `bounded(${min}, ${bound})`,
    });

    note(written);

    return [
      ...commentOf([
        [`The bounds ${min}..${Option.match(max, { onNone: () => "n", onSome: String })}.`],
      ]),
      `const ${name} = ${written};`,
      "",
    ];
  });

  return [
    ...commentOf([
      [
        `The content-model IR of every kind the pinned XSDs declare: ${rows.length} rows, one per kind.`,
      ],
      [
        "Generated by `node src/vocab/derive/models.ts` and formatted with `vp fmt`; `src/vocab/derive/models.test.ts` checks that a re-run reproduces this file byte for byte. The reading rules are `src/vocab/inventory/types.ts`'s and the deriver's.",
      ],
    ]),
    'import { Option } from "effect";',
    "",
    "import type {",
    ...Arr.sort(
      Arr.dedupe([
        "ExpandedName",
        "Source",
        "TypeDerivation",
        ...helperNames.filter((name) => used.has(name)).flatMap((name) => helpers[name].imports),
      ]),
      Order.String,
    ).map((name) => `  ${name},`),
    '} from "#pantry/vocab/inventory/types.ts";',
    'import type { SourcePath } from "#pantry/vocab/derive/sources.ts";',
    "",
    ...helperNames.flatMap((name) =>
      used.has(name) && helpers[name].before ? [...helpers[name].lines, ""] : [],
    ),
    ...writer.preamble(),
    ...commentOf([
      ["A name in a namespace."],
      ["@param namespace - The namespace.", "@param local - The local name.", "@returns The name."],
    ]),
    "const named = (namespace: string, local: string): ExpandedName => ({ local, namespace });",
    "",
    ...commentOf([["The declared type of an element whose type is written in place."]]),
    "const anonymous: Option.Option<ExpandedName> = Option.none();",
    "",
    ...commentOf([
      ["One type's derivations."],
      [
        "@param type - The type.",
        "@param derived - The types validly derived from it, itself first.",
        "@returns The row.",
      ],
    ]),
    "const derivation = (",
    "  type: ExpandedName,",
    "  ...derived: readonly [ExpandedName, ...ExpandedName[]]",
    "): TypeDerivation => ({ derived, type });",
    "",
    ...Arr.sort(
      [...namespaceNames],
      Order.mapInput(Order.String, ([, name]: readonly [string, string]) => name),
    ).flatMap(([namespace, name]) => [
      ...commentOf([[`The namespace ${namespace}.`]]),
      `const ${name} = ${JSON.stringify(namespace)};`,
      "",
    ]),
    ...occursLines,
    ...helperNames.flatMap((name) =>
      used.has(name) && !helpers[name].before ? [...helpers[name].lines, ""] : [],
    ),
    ...constants,
    ...commentOf([["Every kind's content model, by kind."]]),
    "export const contentModels: readonly ContentModel[] = [",
    ...body,
    "];",
    "",
    ...commentOf([
      [
        "Every named type's and built-in's derivations, by type name: the `xsi:type` values an element of the type admits (XML Schema 1.0 Part 1, §3.4.6, §3.14.6).",
      ],
    ]),
    "export const typeDerivations: readonly TypeDerivation[] = [",
    ...derivationBody,
    "];",
  ].join("\n");
};

/**
 * The command line: it prints the models leaf to standard output.
 */
const command = Command.make(
  "models",
  {},
  Effect.fn("vocab.deriveModelsCommand")(function* deriveModelsCommand() {
    yield* Console.log(renderModels(yield* loadModels()));
  }),
).pipe(
  Command.withDescription(
    "Print the content-model IR leaf, read from the pinned XSDs in ~/.cache/qti-pie/qti3/xsd.",
  ),
);

if (import.meta.main) {
  NodeRuntime.runMain(
    Command.run(command, { version: "0.0.0" }).pipe(
      Effect.provide(Layer.mergeAll(NodeServices.layer, Digest.layerWebCrypto)),
    ),
  );
}
