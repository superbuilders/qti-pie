import { assert, describe, it } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { int } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Duration, Effect, Formatter, Option, Predicate, Result } from "effect";
import { readXml } from "@qti-pie/crust/read.ts";
import { indexed } from "#pantry/grammar/closed.ts";
import type { Roster } from "#pantry/grammar/closed.ts";
import { composed, layerAttributeNames } from "#pantry/grammar/compose.ts";
import type { ComposedGrammar } from "#pantry/grammar/compose.ts";
import { foreignKinds, openClasses } from "#pantry/grammar/kinds.ts";
import { shredGrammarOf } from "#pantry/model/composed.ts";
import { shred } from "#pantry/model/shred.ts";
import { declaredRelation, declaredRoster } from "#pantry/test/declared.ts";
import type { StatedRelation } from "#pantry/test/declared.ts";
import { toyFacets, toyGrammar, toySource, toyVocabulary } from "#pantry/test/gen/grammar.ts";
import {
  attributeDeclarations,
  globalAttributes,
  typeAttributeDeclarations,
} from "#pantry/vocab/inventory/attributes.ts";
import type { Domain } from "#pantry/vocab/inventory/types.ts";
import { coveredElements } from "#pantry/vocab/inventory/extensions.ts";
import { asiNamespace } from "#pantry/vocab/namespaces.ts";
import { admittedOf } from "#pantry/test/indexes.ts";
import { searchWidth, searchTimeout } from "#pantry/test/settings.ts";

/**
 * The timeout, in milliseconds, that this file's slower tests state, each itself or through its
 * describe: a hang guard.
 */
const testTimeoutMs = 300_000;

/**
 * The composed grammar of production, failing the test that reads it when a generator refuses.
 */
const grammar = Effect.fromResult(composed());

/**
 * Whether a value of a grammar is a closed relation: its key, payload and rows, indexed or not.
 *
 * @param value - A value the grammar holds.
 * @returns Whether it is one.
 */
const isRelation = (value: unknown): value is StatedRelation =>
  typeof value === "object" &&
  value !== null &&
  "key" in value &&
  "payload" in value &&
  "rows" in value;

/**
 * Whether a value of a grammar is a roster: its handles and their codes.
 *
 * @param value - A value the grammar holds.
 * @returns Whether it is one.
 */
const isRoster = (value: unknown): value is Roster<string> =>
  typeof value === "object" &&
  value !== null &&
  "handles" in value &&
  "codeOf" in value &&
  "has" in value;

/**
 * Collect every roster a grammar holds, at any depth of its records, each relation's fields'
 * among them: a relation's key and payload are lists of fields, which are walked, and its rows and
 * a roster's handles lists of values, which are not.
 *
 * @param value - The grammar, or a value it holds.
 * @param seen - The records walked already.
 * @returns The rosters, each once.
 */
// oxlint-disable-next-line anti-slop/no-unknown-parameters -- A grammar's records hold values of every type, which this walks.
const rostersIn = (value: unknown, seen = new Set<object>()): readonly Roster<string>[] => {
  if (!Predicate.isObject(value) || seen.has(value)) {
    return [];
  }

  seen.add(value);

  return isRoster(value)
    ? [value]
    : Object.entries(value).flatMap(([name, held]: readonly [string, unknown]) =>
        (name === "key" || name === "payload") && Array.isArray(held)
          ? held.flatMap((field) => rostersIn(field, seen))
          : rostersIn(held, seen),
      );
};

/**
 * Collect every closed relation a grammar holds, at any depth of its records: a roster's handles
 * and a relation's rows are lists, which hold none.
 *
 * @param value - The grammar, or a value it holds.
 * @param seen - The records walked already.
 * @returns The relations, each once.
 */
// oxlint-disable-next-line anti-slop/no-unknown-parameters -- A grammar's records hold values of every type, which this walks.
const relationsIn = (value: unknown, seen = new Set<object>()): readonly StatedRelation[] => {
  if (!Predicate.isObject(value) || seen.has(value)) {
    return [];
  }

  seen.add(value);

  return isRelation(value)
    ? [value]
    : Object.values(value).flatMap((held) => relationsIn(held, seen));
};

describe("the composition", () => {
  it.effect(
    "states every closed relation's rows as grizzle declares them, each closed id within its roster and one fact per key, the relations grizzle never declares among them",
    () =>
      // Oracle: grizzle's own declaration (`#pantry/test/declared.ts`), which refuses a closed id
      // outside its roster and two facts of one key when it declares a relation, as it does each
      // relation `install.ts` declares. No generator checks a row, so this test is where a
      // generator or a facet that states a fault fails, in a relation only the host reads (the
      // attribute admission, `ElementName`) as in any other.
      Effect.gen(function* faultless() {
        const relations = relationsIn(yield* grammar);
        const refusals = relations.flatMap((relation) =>
          Result.match(declaredRelation(relation), {
            onFailure: ({ message }) => [message],
            onSuccess: () => [],
          }),
        );

        assert.isAbove(relations.length, 0);
        assert.deepStrictEqual(refusals, []);
      }),
    testTimeoutMs,
  );

  it.effect(
    "admits under each parent at most one element kind of each expanded name, so a name resolves under a parent to one kind",
    () =>
      // Oracle: XML Schema's Element Declarations Consistent (Part 1, §3.8.6): the element
      // declarations of one name a content model holds are one declaration, so a parent admits one
      // kind of each name. `resolve` reads a name's kinds in code order and takes the first its
      // parent admits (`rosters.ts`, `resolution`), so this test is where a model or a facet that
      // admits two kinds of one name under one parent fails.
      Effect.gen(function* consistent() {
        const { content, kinds } = yield* grammar;
        const members = Map.groupBy(content.admissionIn.rows, ({ map }) => map);
        const named = new Map<string, Set<string>>();
        for (const { admission, parent } of content.contentModelOf.rows) {
          for (const { child } of members.get(admission) ?? []) {
            for (const { local, namespace } of Option.toArray(
              kinds.elementName.lookup({ kind: child }),
            )) {
              named
                .getOrInsertComputed(`${parent} {${namespace}}${local}`, () => new Set())
                .add(child);
            }
          }
        }

        const twice = [...named].flatMap(([at, held]) =>
          held.size > 1 ? [`${at}: ${[...held].join(" ")}`] : [],
        );

        assert.isAbove(named.size, 0);
        assert.deepStrictEqual(twice.slice(0, 20), []);
      }),
    testTimeoutMs,
  );

  it.effect(
    "lists every roster's handles as grizzle declares a roster, each once, the rosters grizzle never declares among them",
    () =>
      // Oracle: grizzle's own declaration (`#pantry/test/declared.ts`), which refuses a roster that
      // lists a handle twice, as it does each roster `install.ts` declares, so this test is where a
      // vocabulary that lists a kind, a name or a handle twice fails, in a roster only the host
      // reads as in any other.
      Effect.gen(function* distinct() {
        const rosters = rostersIn(yield* grammar);
        const refusals = rosters.flatMap((held) =>
          Result.match(declaredRoster(held), {
            onFailure: ({ message }) => [message],
            onSuccess: () => [],
          }),
        );

        assert.isAbove(rosters.length, 0);
        assert.deepStrictEqual(refusals, []);
      }),
    testTimeoutMs,
  );

  it.effect(
    "admits XML Schema's xsi: names on every element kind, xsi:nil only on the foreign kinds (audit A6)",
    () =>
      Effect.gen(function* xsi() {
        const { attributes, kinds } = yield* grammar;
        const holders = (name: string) =>
          attributes.admission.rows.filter((row) => row.name === name).map(({ kind }) => kind);
        const elements = kinds.isElement.rows.map(({ kind }) => kind);

        for (const name of ["xsi:schemaLocation", "xsi:type", "xsi:noNamespaceSchemaLocation"]) {
          assert.deepStrictEqual(new Set(holders(name)), new Set(elements), name);
        }

        assert.deepStrictEqual(new Set(holders("xsi:nil")), new Set(Object.values(foreignKinds)));
      }),
  );

  it.effect("codes the open classes first in AttributeName, 0 to 3", () =>
    Effect.gen(function* openCodes() {
      const { kinds } = yield* grammar;

      assert.deepStrictEqual(
        openClasses.map((name) => kinds.attributeName.codeOf(name)),
        [Option.some(0), Option.some(1), Option.some(2), Option.some(3)],
      );
    }),
  );

  it.effect(
    "types every global attribute the leaf declares as a static name, each coded right after the open classes",
    () =>
      // Oracle: the leaf's `globalAttributes`, read directly: the document layer's static list is
      // exactly its names, and each holds the code the run-time layer gave it, 4 onward.
      Effect.gen(function* layerNames() {
        const { kinds } = yield* grammar;
        const globals = globalAttributes.map(({ name }) => name);

        assert.deepStrictEqual(new Set(layerAttributeNames), new Set(globals));
        assert.deepStrictEqual(
          new Set(
            globals.map((name) => Option.getOrElse(kinds.attributeName.codeOf(name), () => -1)),
          ),
          new Set(globals.map((_, at) => openClasses.length + at)),
        );
      }),
  );

  it("resolves a child a vocabulary admits by a stated triple, beside the children its models admit", () => {
    // Oracle: the specification as a checker: a name resolves under a parent to the kind admitted
    // there, whoever states the admission.
    const result = toyGrammar([
      toyVocabulary({
        admission: [{ child: "e1", parent: "e0" }],
        attributes: [],
        data: ["ws"],
        facets: toyFacets({}),
        kinds: ["e0", "e1"],
      }),
    ]);

    assert.deepStrictEqual(
      result.pipe(
        Result.map(({ kinds }) =>
          [kinds.resolve("urn:toy", "e1", "e0"), kinds.resolve("urn:toy", "e1", "e1")].map(
            (resolved): string => Option.getOrElse(resolved, () => "none"),
          ),
        ),
      ),
      Result.succeed(["e1", "none"]),
    );
  });

  it("admits at a wildcard only the global kinds of the composition at hand, none of a vocabulary it leaves out", () => {
    // Oracle: the specification as a checker: a wildcard admits a global element declaration of
    // the schema set, or an undeclared element as its namespace class's foreign kind (XML Schema
    // Part 1, §3.10.4). A toy composition leaves out every vocabulary that declares production's
    // global elements, so its `##any` wildcard admits the three foreign kinds alone.
    const toy = toyVocabulary({
      admission: [],
      attributes: [],
      data: ["ws", "comment", "pi"],
      facets: toyFacets({}),
      kinds: ["e0"],
    });
    const result = toyGrammar([
      {
        ...toy,
        models: [
          {
            content: {
              _tag: "element-only",
              particle: {
                _tag: "any",
                namespace: "##any",
                occurs: { max: Option.none(), min: 0 },
                processing: "lax",
                source: toySource,
              },
            },
            kind: "e0",
            source: toySource,
            type: Option.none(),
          },
        ],
      },
    ]);

    assert.deepStrictEqual(
      result.pipe(
        Result.map(
          ({ content, kinds }) =>
            new Set(
              admittedOf(content.contentModelOf, content.admissionIn)
                .filter(
                  ({ child, parent }) =>
                    parent === "e0" && Option.isSome(kinds.isElement.lookup({ kind: child })),
                )
                .map(({ child }) => child),
            ),
        ),
      ),
      Result.succeed(new Set(Object.values(foreignKinds))),
    );
  });
});

/**
 * The attributes the reading-90 property writes on an element, each a named variant: a valid
 * `data-` name; an undeclared name in no namespace; a name in another namespace; a name in the
 * element's own namespace; `xml:id` and `xml:space`, which `xml.xsd` declares; an `xsi:` name;
 * and ARIA's `aria-keyshortcuts`, read only where a kind declares it (spec reading 10: the empty
 * elements declare `aria-keyshorts` alone, and refuse it).
 */
const extensionVariants = [
  "data",
  "undeclared",
  "foreign",
  "own-namespace",
  "xml:id",
  "xml:space",
  "xsi",
  "aria-keyshortcuts",
] as const;

/**
 * An attribute variant of {@link extensionVariants}.
 */
type ExtensionVariant = (typeof extensionVariants)[number];

/**
 * Each variant's attribute as written, its namespace declarations beside it, and the name a kind
 * declares it under when one does.
 */
const writtenAs: Readonly<
  Record<ExtensionVariant, { readonly declared: string; readonly text: string }>
> = {
  "aria-keyshortcuts": { declared: "aria-keyshortcuts", text: 'aria-keyshortcuts="Alt+A"' },
  data: { declared: "", text: 'data-extension="x"' },
  foreign: { declared: "", text: 'xmlns:f="urn:foreign" f:x="x"' },
  "own-namespace": { declared: "", text: `xmlns:o="${asiNamespace}" o:x="x"` },
  undeclared: { declared: "", text: 'foo="x"' },
  "xml:id": { declared: "xml:id", text: 'xml:id="x"' },
  "xml:space": { declared: "xml:space", text: 'xml:space="preserve"' },
  xsi: {
    declared: "",
    text: 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="a.xsd"',
  },
};

/**
 * Find a chain of element kinds from a document root to a kind, each admitted under the one before
 * it, and each a kind with an element name, no foreign kind: the shortest path an element of the
 * kind is reached by.
 *
 * @param production - The composed grammar.
 * @param kind - The kind.
 * @returns The kinds from the root to it, none when no root reaches it.
 */
const pathTo = (production: ComposedGrammar, kind: string): Option.Option<readonly string[]> => {
  const elements = new Set<string>(production.kinds.elementName.rows.map((row) => row.kind));
  const children = new Map<string, string[]>();
  for (const row of admittedOf(production.content.contentModelOf, production.content.admissionIn)) {
    if (elements.has(row.child)) {
      children.set(row.parent, [...(children.get(row.parent) ?? []), row.child]);
    }
  }

  const before = new Map<string, string>();
  const pending = [...(children.get("document") ?? [])];
  for (const root of pending) {
    before.set(root, "document");
  }

  for (let at = pending.shift(); at !== undefined; at = pending.shift()) {
    if (at === kind) {
      const chain = [at];
      for (let up = before.get(at); up !== undefined && up !== "document"; up = before.get(up)) {
        chain.unshift(up);
      }

      return Option.some(chain);
    }

    for (const child of children.get(at) ?? []) {
      if (!before.has(child)) {
        before.set(child, at);
        pending.push(child);
      }
    }
  }

  return Option.none();
};

describe("spec reading 90, through the codec", () => {
  it.effect(
    "reads on every covered element exactly its declared names, data-* and xsi: names, and aria-keyshortcuts only where declared",
    (ctx) =>
      Effect.gen(function* covered() {
        const production = yield* grammar;
        const shredGrammar = shredGrammarOf(production);
        const names = new Map<string, { readonly local: string; readonly namespace: string }>(
          production.kinds.elementName.rows.map(({ kind, local, namespace }) => [
            kind,
            { local, namespace },
          ]),
        );
        const declared = new Set(attributeDeclarations.map(({ kind, name }) => `${kind} ${name}`));
        // Oracle: reading 90 restated: on a covered element an attribute its XSD does not
        // declare is read only when it is a `data-` name in no namespace or an `xsi:` name
        // (reading 47), and reading 10 adds no `aria-keyshortcuts` where the XSD declares
        // `aria-keyshorts`; every covered element holds a `##any` `lax` wildcard, so a `data-`
        // name is in its namespace constraint.
        const readOf = (kind: string, variant: ExtensionVariant): boolean => {
          const { declared: name } = writtenAs[variant];

          return (
            variant === "data" ||
            variant === "xsi" ||
            (name !== "" && declared.has(`${kind} ${name}`))
          );
        };
        // The box: the kinds whose element the Schematron's extension rules cover, read from the
        // leaf by expanded name, that a document root reaches, under every variant; of each
        // (variant, verdict) cell, its first `perCell` kinds. The
        // codec reads every kind's attributes by the one admission lookup, so a cell's further
        // kinds repeat its first; the host test below holds the data-* hosts of every kind.
        const perCell = 3;
        const coveredNames = new Set(
          coveredElements.map(({ element }) => `{${element.namespace}}${element.local}`),
        );
        const every = production.kinds.isElement.rows.flatMap(({ kind }) => {
          const named = names.get(kind);
          const path = pathTo(production, kind);

          return named !== undefined &&
            coveredNames.has(`{${named.namespace}}${named.local}`) &&
            Option.isSome(path)
            ? extensionVariants.map((variant) => ({
                path: path.value,
                read: readOf(kind, variant),
                variant,
              }))
            : [];
        });
        const cases = [...Map.groupBy(every, ({ read, variant }) => `${variant} ${read}`)].flatMap(
          ([, cell]) => cell.slice(0, perCell),
        );

        assert.isAbove(every.length, 1000);

        return yield* searched(
          ctx,
          exhaust(
            {
              box: `the first ${perCell} kinds of each (variant, verdict) a document root reaches whose element the Schematron extension rules cover, ${cases.length}`,
              caseHang: Duration.seconds(30),
              concurrency: 1,
              coverage: requiredInSpace<ExtensionVariant | "read" | "refused">([
                ...extensionVariants,
                "read",
                "refused",
              ]),
              generator: int(0, cases.length - 1),
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: "spec reading 90 restated over the leaf's attribute declarations, with readings 47 and 10",
              },
              suite: "grammar/compose/reading-90",
            },
            (index, c) =>
              Effect.gen(function* readOne() {
                const { path, read, variant } = cases[index] ?? {
                  path: [],
                  read: true,
                  variant: "data",
                };
                // Each element declares its own namespace as the default, so a path through another
                // vocabulary's elements (`xi:include`, MathML) names each in its namespace.
                const steps = path.map((step) => names.get(step) ?? { local: step, namespace: "" });
                const target = steps.at(-1)?.local ?? "";
                const opening = steps
                  .map(
                    ({ local, namespace }, at) =>
                      `<${local} xmlns="${namespace}"${at === steps.length - 1 ? ` ${writtenAs[variant].text}` : ""}>`,
                  )
                  .join("");
                const closing = steps
                  .toReversed()
                  .map(({ local }) => `</${local}>`)
                  .join("");
                const document = yield* Effect.orDie(
                  readXml(new TextEncoder().encode(`${opening}${closing}`)),
                );
                const outcome = yield* shred(document, shredGrammar).pipe(Effect.result);
                c.note(variant);
                c.note(read ? "read" : "refused");

                assert.strictEqual(
                  Result.isSuccess(outcome),
                  read,
                  `${target} with ${writtenAs[variant].text}: ${Result.isFailure(outcome) ? outcome.failure.message : "read"}`,
                );
              }),
          ),
        );
      }),
    searchTimeout,
  );

  it.effect(
    "holds data-* to exactly the kinds whose element the extension rules cover (a kind per context variant of an element)",
    () =>
      // Oracle: `coveredElements` (the Schematron's extension rules, reading 90) read against the
      // composed grammar's own admissions: Revision 2.1 admitted `data-*` on the extension hosts, 127
      // elements. Both sides are sets of kinds, compared as sets; a
      // difference is the operator's open question O5, to be reported, never asserted away.
      Effect.gen(function* hosts() {
        const { attributes, kinds } = yield* grammar;
        const coveredNames = new Set(
          coveredElements.map(({ element }) => `{${element.namespace}}${element.local}`),
        );
        const admitting = new Set(
          attributes.admission.rows.filter((row) => row.name === "data-*").map(({ kind }) => kind),
        );
        const listed = new Set(
          kinds.elementName.rows
            .filter(({ local, namespace }) => coveredNames.has(`{${namespace}}${local}`))
            .map(({ kind }) => kind),
        );
        yield* Effect.logInfo(`admitting ${admitting.size}, covered ${listed.size}`);

        assert.deepStrictEqual([...admitting].toSorted(), [...listed].toSorted(), "data-* hosts");
      }),
  );
});

/**
 * Whether a leaf definition is or is derived from `xs:ID`: atomic, with the built-in `ID`.
 *
 * @param domain - The leaf definition.
 * @returns Whether it is an ID type.
 */
const isId = (domain: Domain): boolean => domain._tag === "atomic" && domain.builtin === "ID";

/**
 * Each host's declared attributes as the leaf states them: a kind's by its handle, a governing
 * type's by its `TypeName` handle, each name with whether its type is an ID.
 */
const declaredUses: ReadonlyMap<string, ReadonlyMap<string, boolean>> = (() => {
  const uses = new Map<string, Map<string, boolean>>();
  const note = (host: string, name: string, domain: Domain) => {
    uses.set(host, (uses.get(host) ?? new Map<string, boolean>()).set(name, isId(domain)));
  };
  for (const { domain, kind, name } of attributeDeclarations) {
    note(kind, name, domain);
  }

  for (const { domain, name, owner } of typeAttributeDeclarations) {
    note(owner, name, domain);
  }

  return uses;
})();

describe("spec reading 109, wild IDs", () => {
  it.effect(
    "admit no wild xml:id on a kind or governor whose declared uses include an ID-derived one, and keep it on every other: every admitted kind and governor",
    (ctx) =>
      // Oracle: XML Schema 1.0 Part 1, §3.4.4, Element Locally Valid (Complex Type), clause 5.2,
      // over the leaf's own declarations (`attributeDeclarations`, `typeAttributeDeclarations`):
      // an `xml:id` the host does not declare is a wild ID where its type is `xml.xsd`'s `xs:ID`,
      // and it stands on no host that declares an ID-derived use. The same declarations say where
      // the reading bars it, so a host that declares none keeps every `xml:id` its wildcard gave it
      // before the reading, which the measured before/after diff of the slice's report counts.
      // Bound: every kind the attribute grammar admits a name on, and every governor.
      Effect.gen(function* wildIds() {
        const { attributes } = yield* Effect.fromResult(composed());
        const identity = indexed(attributes.identity);
        const hosts = [
          ...Map.groupBy(attributes.admission.rows, ({ kind }): string => kind),
          ...Map.groupBy(attributes.governed.rows, ({ governor }): string => governor),
        ];
        const typeOf = new Map<string, string>(
          attributes.governor.rows.map(({ governor, governs }) => [governor, governs] as const),
        );

        return yield* searched(
          ctx,
          exhaust(
            {
              box: `every admitted kind and governor, ${hosts.length}`,
              caseHang: Duration.minutes(1),
              concurrency: searchWidth,
              coverage: requiredInSpace<"declares an ID" | "declares no ID">([
                "declares an ID",
                "declares no ID",
              ]),
              generator: int(0, hosts.length - 1),
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: "XML Schema 1.0 Part 1, §3.4.4 clause 5.2, over the leaf's declarations",
              },
              suite: "grammar/compose/wild-ids",
            },
            (index, c) =>
              Effect.sync(() => {
                const [at, rows] = hosts[index] ?? ["", []];
                const uses = declaredUses.get(typeOf.get(at) ?? at) ?? new Map<string, boolean>();
                const declaresId = [...uses.values()].some(Boolean);
                c.note(declaresId ? "declares an ID" : "declares no ID");

                const wild = rows.filter(
                  ({ domain, name }) =>
                    name === "xml:id" &&
                    !uses.has(name) &&
                    identity
                      .lookup({ domain })
                      .pipe(Option.exists(({ identity: kind }) => kind === "ID")),
                );

                assert.deepStrictEqual(declaresId ? wild.map(({ name }) => name) : [], [], at);
              }),
          ),
        );
      }),
    searchTimeout,
  );
});
