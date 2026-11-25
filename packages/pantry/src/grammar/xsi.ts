/**
 * The relations of the `xsi:type` law, "XsiType derived" (rule `xsi-type`, spec reading 47): the
 * `TypeName` roster of the pinned XSDs' named types, `XsiType(kind, type)`, the types an element of
 * a kind may name in its `xsi:type`, and `AnonymousType(kind)`, the kinds whose declared type is
 * anonymous. An element's governing type, where a named type governs it, is a
 * `TypeName` code, a row of its own keyed by its node (`ElementType` of `#pantry/qti/node.ts`, and
 * `OpenElementType` of `#pantry/qti/chardata.ts` for a foreign element): the type its `xsi:type`
 * names, else its declared type. An element no named type governs has no such row, and no handle
 * stands for the absence.
 *
 * An element a declaration assesses strictly may carry `xsi:type` only where its value is a QName
 * that resolves to a type definition validly derived from the declared one (XML Schema 1.0 Part 1,
 * §3.3.4 Element Locally Valid (Element), clause 4; derivation by §3.4.6 and §3.14.6), and the
 * definition is one of the schema its document is assessed against (clause 4.1, "resolves to a type
 * definition"; spec reading 81's schema sets). So a kind's row names a derived type only where a
 * schema set its documents are assessed against holds it, its own schema's or XML Schema's
 * (`typeAvailable` of `#pantry/vocab/open.ts`): a content-packaging kind such as `csmd:GUID` names
 * no ASI type, which no manifest's set imports. A kind standing in several sets takes the union,
 * reading 81's limit. The codec resolves the QName against the element's in-scope namespaces, and
 * the law reads this set. An element of an anonymous declared type admits no named type, since none
 * derives from an anonymous one: its kind has no `XsiType` row, and its `AnonymousType` row says
 * that it stands with no type at all, its own with no `xsi:type`.
 *
 * A foreign element has no declaration, so no derivation constrains its `xsi:type`, and this law
 * selects it out. Its `xsi:type` still governs it where the QName resolves to a type its document's
 * schema set holds or a built-in (§3.3.4, Schema-Validity Assessment (Element), clause 1.2; spec
 * reading 60): the codec writes that type as the element's `OpenElementType`, and none for a name
 * no such type has, which leaves the element to lax assessment. The foreign governor laws judge it
 * where the type is simple, through the attribute grammar's `Governor`
 * (`#pantry/grammar/attributes.ts`): it admits the four `xsi:` names alone (Element Locally Valid
 * (Type), clause 3.1.1), holds no element child (clause 3.1.2, law "Foreign simple content") and
 * holds text in the type's `TypeText` domain (clause 3.1.3, `TextDomain`). A complex type is spec
 * reading 50's unchecked limit.
 */
import { Option, Result, Schema } from "effect";
import { idField, roster, sourced } from "#pantry/grammar/closed.ts";
import type { IdField, Roster, Sourced, SourcedRow } from "#pantry/grammar/closed.ts";
import type { ContentModel, ExpandedName, TypeDerivation } from "#pantry/vocab/inventory/types.ts";
import {
  inNamespaceOf,
  namespaceNameOf,
  vocabularyNamespaces,
  xsNamespace,
} from "#pantry/vocab/namespaces.ts";
import type { NamespaceOfKind } from "#pantry/vocab/namespaces.ts";
import { typeAvailable } from "#pantry/vocab/open.ts";

/**
 * The prefix each pinned namespace's type handles open with: the one its vocabulary's kind handles
 * carry (`vocabularyNamespaces`), none for QTI's own, and `xs:` for XML Schema's built-ins.
 *
 * Each namespace has its own prefix and each prefix ends a handle's first `:` or opens none, so a
 * handle spells exactly one expanded name ({@link expandedNameOf}). A handle is held in a
 * PostgreSQL `name`, at most 63 UTF-8 bytes (grizzle's README, "Tables and types"), which an
 * expanded name `{namespace}local` overruns 132 times among the pinned types; a prefixed one is at
 * most 40 bytes.
 */
export const typePrefixes: ReadonlyMap<string, string> = new Map([
  ...Object.values(vocabularyNamespaces).map(
    ({ namespace, prefix }) => [namespace, prefix] as const,
  ),
  [xsNamespace, "xs:"],
]);

/**
 * The namespace each type handle prefix stands for: {@link typePrefixes} read backward.
 */
const prefixedNamespaces: ReadonlyMap<string, string> = new Map(
  [...typePrefixes].map(([namespace, prefix]) => [prefix, namespace] as const),
);

/**
 * Spell a type's expanded name as its `TypeName` handle: its namespace's prefix
 * ({@link typePrefixes}), then its local name, so `xs:NCName`, `lom:Identifier.Type` and, in QTI's
 * own namespace, `ItemBodyDType`. A type in a namespace no pinned XSD declares, which no roster
 * holds, keeps its expanded name, `{namespace}local`, which opens with a `{` no prefixed handle
 * does, so no two names share a handle.
 *
 * @param name - The type's name.
 * @returns The handle.
 */
export const typeHandle = ({ local, namespace }: ExpandedName): string => {
  const prefix = typePrefixes.get(namespace);

  return prefix === undefined ? `{${namespace}}${local}` : `${prefix}${local}`;
};

/**
 * Read a `TypeName` handle back as the expanded name it spells, {@link typeHandle}'s inverse.
 *
 * @param handle - A handle {@link typeHandle} spelled.
 * @returns The name, or none for a handle whose prefix no pinned namespace has.
 */
export const expandedNameOf = (handle: string): Option.Option<ExpandedName> => {
  if (handle.startsWith("{")) {
    const close = handle.indexOf("}");

    return close > 0
      ? Option.some({ local: handle.slice(close + 1), namespace: handle.slice(1, close) })
      : Option.none();
  }

  const colon = handle.indexOf(":");
  const prefix = colon === -1 ? "" : handle.slice(0, colon + 1);

  return Option.map(Option.fromNullishOr(prefixedNamespaces.get(prefix)), (namespace) => ({
    local: handle.slice(prefix.length),
    namespace,
  }));
};

/**
 * `XsiType`: (kind, type) where an element of the kind may name the type in its `xsi:type`, each
 * row sourced to the kind's model, whose declared type it derives from. `K` is the `NodeKind`
 * handles its kinds range over.
 */
export type XsiType<K extends string = string> = Sourced<
  readonly [IdField<"kind", K>, IdField<"type", string>],
  readonly []
>;

/**
 * One `XsiType` row, with the source of the model it reads.
 */
type XsiTypeRow = SourcedRow<
  readonly [IdField<"kind", string>, IdField<"type", string>],
  readonly []
>;

/**
 * `AnonymousType`: the kinds whose model declares an anonymous type, so an element of the kind
 * stands with no named governing type, each row sourced to the kind's model. `K` is the `NodeKind`
 * handles its kinds range over.
 */
export type AnonymousType<K extends string = string> = Sourced<
  readonly [IdField<"kind", K>],
  readonly []
>;

/**
 * One `AnonymousType` row, with the source of the model it reads.
 */
type AnonymousTypeRow = SourcedRow<readonly [IdField<"kind", string>], readonly []>;

/**
 * The `xsi:type` law's relations of a composition, `K` the `NodeKind` handles their kinds range
 * over.
 */
export interface XsiTypes<K extends string = string> {
  readonly anonymousType: AnonymousType<K>;
  /**
   * Find the type a kind declares: the governing type of its element without `xsi:type`.
   *
   * @param kind - The kind.
   * @returns The declared type's handle, or none for an anonymous one or a kind no model declares.
   */
  readonly declaredType: (kind: string) => Option.Option<string>;
  /**
   * The `TypeName` roster, the code space of every governing-type field and the types the pinned
   * schemas define: every named type of the pinned XSDs, built-ins included, each as
   * {@link typeHandle} spells it. An `xsi:type` resolves only against a type of the schemas its
   * document is assessed against (XML Schema 1.0 Part 1, §3.3.4, Element Locally Valid (Element),
   * clause 4.2: the QName must resolve "to a type definition" of them), so every lookup of a type
   * by name asks the roster's `has`.
   */
  readonly typeName: Roster<string>;
  readonly xsiType: XsiType<K>;
}

/**
 * A model declares a type that no derivation lists, so the types validly derived from it are not
 * known: the one way the `xsi:type` relations are not generated.
 */
export class UnderivedType extends Schema.TaggedError<UnderivedType>()("UnderivedType", {
  kind: Schema.String,
  type: Schema.String,
}) {
  /**
   * The kind, its declared type, and the repair.
   */
  override get message(): string {
    return `${this.kind} declares the type ${this.type}, which no type derivation lists, so the types its xsi:type may name are unknown. Derive the type's derivations.`;
  }
}

/**
 * The derivations read for lookup: each type's derived names, by the type's handle, and the
 * `TypeName` roster's handles.
 */
interface DerivationIndex {
  readonly derivedFrom: ReadonlyMap<string, readonly ExpandedName[]>;
  readonly names: readonly string[];
}

/**
 * Index derivations for lookup, in one pass over them: the `TypeName` handles in the order the
 * derivations first name them.
 *
 * @param derivations - The derivations.
 * @returns Their index.
 */
const derivationIndexOf = (derivations: readonly TypeDerivation[]): DerivationIndex => {
  const derivedFrom = new Map<string, readonly ExpandedName[]>();
  const names = new Set<string>();
  for (const { derived, type } of derivations) {
    const own = typeHandle(type);
    derivedFrom.set(own, derived);
    for (const handle of [own, ...derived.map(typeHandle)]) {
      names.add(handle);
    }
  }

  return { derivedFrom, names: [...names] };
};

/**
 * Generate the `xsi:type` relations from the content models' declared types and the types validly
 * derived from each.
 *
 * @param input - The rosters, the models and the derivations.
 * @param input.derivations - The named types validly derived from each type.
 * @param input.kinds - The `NodeKind` roster.
 * @param input.models - The content models, each with its declared type and the namespace of its
 *   kind's elements, in which a derived type stands with no schema set's help.
 * @returns The relations, or the first model whose type no derivation lists.
 */
export const xsiTypesOf = (input: {
  readonly derivations: readonly TypeDerivation[];
  readonly kinds: Roster<string>;
  readonly models: readonly (ContentModel & { readonly namespace: NamespaceOfKind })[];
}): Result.Result<XsiTypes, UnderivedType> =>
  Result.gen(function* generateXsiTypes() {
    const { derivedFrom, names } = derivationIndexOf(input.derivations);
    const rows: XsiTypeRow[] = [];
    const anonymous: AnonymousTypeRow[] = [];
    const declared = new Map<string, string>();
    for (const { kind, namespace, source, type } of input.models) {
      if (Option.isNone(type)) {
        anonymous.push({ row: { kind }, source });
      } else {
        const handle = typeHandle(type.value);
        declared.set(kind, handle);

        const derived = derivedFrom.get(handle);
        if (derived === undefined) {
          return yield* Result.fail(new UnderivedType({ kind, type: handle }));
        }

        for (const each of derived
          .filter((held) => {
            const name = namespaceNameOf(held.namespace);

            return inNamespaceOf(name, namespace) || typeAvailable(namespace, name);
          })
          .map((held) => ({ row: { kind, type: typeHandle(held) }, source }))) {
          rows.push(each);
        }
      }
    }

    const typeName = roster("TypeName", names);

    return {
      anonymousType: sourced({
        key: [idField("kind", input.kinds)],
        name: "AnonymousType",
        payload: [],
        rows: anonymous,
      }),
      /**
       * A kind no model declares, or declares of an anonymous type, has none.
       */
      declaredType: (kind) => Option.fromNullishOr(declared.get(kind)),
      typeName,
      xsiType: sourced({
        key: [idField("kind", input.kinds), idField("type", typeName)],
        name: "XsiType",
        payload: [],
        rows,
      }),
    };
  });
