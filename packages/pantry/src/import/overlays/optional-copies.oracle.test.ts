/**
 * The row of an optional attribute stands exactly where the attribute is written: a
 * `cp:resource`'s `href`, its `ResourceHref` and the arm its scope names (IMS Content Packaging
 * 1.2, `resource`: `href` is
 * optional). A value that may be missing is a row of its own relation, which represents an actual
 * optional domain value (AGENTS.md, Schema intent), so no such row stands for an attribute that is
 * not written. A `lom:string`'s optional `language` has no row: `lom-title` reads the attribute
 * itself (`#pantry/qti/queries.ts` MatchedTitle).
 *
 * The row is held to its attribute both ways at its element's place, and holds the href's
 * resolution, never its form, which the attribute alone holds (C18): the containment of the
 * attribute's selection in the rows makes the row exist wherever the attribute is written, and the
 * way back, a containment from the row's place into the attribute's selection, refuses a row with
 * no attribute, under "Manifest overlay".
 *
 * Oracle: the specification, as read above. The import's rows hold each row exactly where its
 * attribute is written and break neither law on the host
 * (`#pantry/test/gen/genetic/host-laws.ts` `hostVerdictOf`). A row planted where its attribute is
 * not written, every other row it touches made to agree as a writer would, newly breaks exactly one
 * statement, the way back, named by its law: without the way back, nothing refuses it.
 *
 * Bound: an item resource beside two `webcontent` resources, each writing an `href` or not and
 * listing its own file: 4 packages, exhausted, with a row planted on every resource of each that
 * writes none.
 */
import * as NodeServices from "@effect/platform-node/NodeServices";
import { sameLaw } from "@bjornpagen/grizzle";
import type { Law } from "@bjornpagen/grizzle";
import { assert, layer } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { int } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Array as Arr, Duration, Effect, FileSystem, Option } from "effect";
import { readProgram } from "#pantry/import/program.ts";
import type { PackageInputs } from "#pantry/import/write.ts";
import { writePackage } from "#pantry/test/gen/every-relation.ts";
import type { PackageEntries } from "#pantry/test/gen/every-relation.ts";
import { hostVerdictOf } from "#pantry/test/gen/genetic/host-laws.ts";
import { scratchDirectory } from "#pantry/test/scratch.ts";
import { lawNameOf } from "#pantry/import/refusal.ts";
import { nameOf as packageNameOf } from "#pantry/test/package-name.ts";

/**
 * A `webcontent` resource of a case: its identifier, the file it lists, and whether it writes that
 * file as its `href`.
 */
interface WebResource {
  readonly file: string;
  readonly identifier: string;
  readonly writesHref: boolean;
}

/**
 * One case of the box: the two `webcontent` resources.
 */
interface OptionalCase {
  readonly resources: readonly WebResource[];
}

/**
 * Both values of a flag.
 */
const flags = [false, true] as const;

/**
 * Every case of the box: `W1` and `W2`, listing `page1.html` and `page2.html`, each writing its
 * file as its `href` or not.
 */
const cases: readonly OptionalCase[] = flags.flatMap((h1) =>
  flags.map((h2): OptionalCase => ({
    resources: [
      { file: "page1.html", identifier: "W1", writesHref: h1 },
      { file: "page2.html", identifier: "W2", writesHref: h2 },
    ],
  })),
);

/**
 * A situation the box must reach.
 */
type Situation = "a resource with no href" | "every attribute written";

/**
 * Name a case.
 *
 * @param of - The case.
 * @returns Its name.
 */
const nameOf = (of: OptionalCase): string =>
  `hrefs ${JSON.stringify(of.resources.map(({ writesHref }) => writesHref))}`;

/**
 * The resources of a case that write no `href`.
 *
 * @param of - The case.
 * @returns Those resources.
 */
const hrefless = (of: OptionalCase): readonly WebResource[] =>
  of.resources.filter(({ writesHref }) => !writesHref);

/**
 * The situation a case is in.
 *
 * @param of - The case.
 * @returns Its situation.
 */
const situationOf = (of: OptionalCase): Situation =>
  hrefless(of).length > 0 ? "a resource with no href" : "every attribute written";

/**
 * The `href`s a case writes: the item resource's, `item.xml`, and each `webcontent` resource's that
 * writes one, its own file.
 *
 * @param of - The case.
 * @returns The hrefs.
 */
const writtenHrefs = (of: OptionalCase): readonly string[] => [
  "item.xml",
  ...of.resources.filter(({ writesHref }) => writesHref).map(({ file }) => file),
];

/**
 * Build a case's package: an item named by its resource's `href`, and the two `webcontent`
 * resources, each listing its own page.
 *
 * @param of - The case.
 * @returns The package's entries.
 */
const packageOf = (of: OptionalCase): PackageEntries => {
  const text = new TextEncoder();
  const web = of.resources
    .map(
      ({ file, identifier, writesHref }) =>
        `<resource identifier="${identifier}" type="webcontent"${writesHref ? ` href="${file}"` : ""}><file href="${file}"/></resource>`,
    )
    .join("");

  return new Map([
    [
      "imsmanifest.xml",
      text.encode(
        `<?xml version="1.0" encoding="UTF-8"?>\n<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" xmlns:imsmd="http://ltsc.ieee.org/xsd/LOM" identifier="M"><metadata><schema>QTI Package</schema><schemaversion>3.0.1</schemaversion></metadata><organizations/><resources><resource identifier="R" type="imsqti_item_xmlv3p0" href="item.xml"><file href="item.xml"/></resource>${web}</resources></manifest>\n`,
      ),
    ],
    [
      "item.xml",
      text.encode(
        `<?xml version="1.0" encoding="UTF-8"?>\n<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="item" title="Item" time-dependent="false"><qti-item-body><p>Hi</p></qti-item-body></qti-assessment-item>\n`,
      ),
    ],
    ...of.resources.map(({ file }) => [file, text.encode(`<p>${file}</p>\n`)] as const),
  ]);
};

/**
 * An element's place as the test compares it, its document's path and its `start`: every row of
 * one case is of its one package.
 *
 * @param row - A row of the element.
 * @param row.path - Its document's path.
 * @param row.start - Its position there.
 * @returns The place's text.
 */
const placeOf = ({ path, start }: { readonly path: string; readonly start: bigint }): string =>
  JSON.stringify([path, String(start)]);

/**
 * Describe a law as the test compares it: a containment by its two relations, any other by its
 * kind, each with the law a refusal names it by.
 *
 * @param law - The law.
 * @returns Its description.
 */
const describeLaw = (law: Law): string =>
  `${law.kind === "contained" ? `${law.from.relation} ⊆ ${law.to.relation}` : law.kind}, ${Option.match(
    lawNameOf(law),
    { onNone: () => "named by no law", onSome: (name) => `"${name}"` },
  )}`;

/**
 * The statements planted rows break that the import's own rows do not.
 *
 * @param planted - The rows with a row planted.
 * @param own - The import's own rows.
 * @returns Each newly broken statement, described.
 */
const newlyBroken = (planted: PackageInputs, own: PackageInputs): readonly string[] => {
  const before = hostVerdictOf(own).brokenLaws;

  return hostVerdictOf(planted)
    .brokenLaws.filter((law) => !before.some((held) => sameLaw(held, law)))
    .map(describeLaw);
};

layer(NodeServices.layer, { excludeTestServices: true })(
  "the rows of a resource's href, as the import's rows hold them",
  (it) => {
    it.effect(
      "holds each row exactly where its attribute is written, and refuses one planted where it is not by its way back alone",
      (ctx) =>
        searched(
          ctx,
          Effect.gen(function* optionalCopiesRuns() {
            const fs = yield* FileSystem.FileSystem;
            const directory = yield* scratchDirectory("optional-copies-");

            assert.strictEqual(cases.length, 4);

            return yield* exhaust(
              {
                box: "an item resource beside two webcontent resources, each writing an href or not",
                caseHang: Duration.minutes(2),
                coverage: requiredInSpace<Situation>([
                  "a resource with no href",
                  "every attribute written",
                ]),
                generator: int(0, cases.length - 1),
                literal: (at) => nameOf(Arr.getUnsafe(cases, at)),
                oracle: {
                  kind: "specification",
                  name: "IMS Content Packaging 1.2's optional resource href, a row exactly where it is written",
                },
                suite: "import/overlays/optional-copies",
              },
              (at, c) =>
                Effect.gen(function* optionalCopiesCase() {
                  const of = Arr.getUnsafe(cases, at);
                  const said = nameOf(of);
                  c.note(situationOf(of));

                  const dir = `${directory}/c${String(at)}`;
                  yield* writePackage(packageOf(of), dir);

                  const { documents, inputs } = yield* Effect.orDie(
                    readProgram(dir, packageNameOf(dir)),
                  );
                  yield* fs.remove(dir, { recursive: true });

                  /**
                   * Every href of the box names an entry at the package's root, so each has its
                   * entry arm, whose target, the path it resolves to, is the href as written.
                   */
                  const hrefs = [...inputs.ResourceHref.values()];
                  assert.sameMembers(
                    [...inputs.ResourceHrefPath.values()].map(({ target }) => target),
                    [...writtenHrefs(of)],
                    `${said}: ResourceHrefPath`,
                  );

                  const own = hostVerdictOf(inputs).broken;
                  assert.isFalse(
                    own.has("Manifest overlay"),
                    `${said}: ${String(own.get("Manifest overlay")?.witness)}`,
                  );
                  assert.isFalse(
                    own.has("E1 derived"),
                    `${said}: ${String(own.get("E1 derived")?.witness)}`,
                  );

                  const hrefPlaces = new Set(hrefs.map(placeOf));
                  const files = [...inputs.FilePath.values()];
                  /**
                   * The `webcontent` resources, each by its `identifier`'s element in the manifest.
                   */
                  const webIdentifiers = new Set(of.resources.map(({ identifier }) => identifier));
                  const bare = documents.flatMap(({ ids, view }) =>
                    view.rows.attributes.flatMap(({ lexical, name, start }) => {
                      const resource = { package: ids.package, path: ids.path, start };

                      return name === "identifier" &&
                        webIdentifiers.has(lexical) &&
                        !hrefPlaces.has(placeOf(resource))
                        ? [resource]
                        : [];
                    }),
                  );
                  assert.lengthOf(bare, hrefless(of).length, said);
                  for (const resource of bare) {
                    /**
                     * A resource's file is its first child, the first file after it in document
                     * order: the file's resource is its node's parent, which no FilePath row
                     * copies.
                     */
                    const file = Arr.head(
                      files
                        .filter(
                          ({ path, start }) => path === resource.path && start > resource.start,
                        )
                        .toSorted((a, b) => Number(a.start - b.start)),
                    );
                    assert.isTrue(Option.isSome(file), `${said}: the resource's file`);
                    if (Option.isNone(file)) {
                      continue;
                    }

                    /**
                     * The href a writer plants is its resource's own file's, in the package, so its
                     * header beside its entry arm; its typed path is the query `TypedPath`'s,
                     * which no row stores.
                     */
                    const { target } = file.value;
                    const head = {
                      package: resource.package,
                      path: resource.path,
                      start: resource.start,
                    };
                    const planted: PackageInputs = {
                      ...inputs,
                      ResourceHref: new Map([
                        ...inputs.ResourceHref,
                        [`planted ${placeOf(resource)}`, { ...head, scope: "entry" }],
                      ]),
                      ResourceHrefPath: new Map([
                        ...inputs.ResourceHrefPath,
                        [`planted ${placeOf(resource)}`, { ...head, target }],
                      ]),
                    };
                    const broken = newlyBroken(planted, inputs);
                    assert.deepStrictEqual(
                      broken,
                      ['ResourceHref ⊆ Attribute, "Manifest overlay"'],
                      `${said}: a ResourceHref planted on ${target}'s resource, which writes no href, newly breaks ${JSON.stringify(broken)}`,
                    );
                  }
                }),
            );
          }).pipe(Effect.scoped),
        ),
    );
  },
);
