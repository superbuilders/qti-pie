/**
 * A calculator's and a digital material's file (`qti-file-href` of `ItemFileInfo`, information
 * model §5.80.3, "This is the URI for the associated content file", typed `FileHrefDType`,
 * `<xs:restriction base="xs:anyURI" />`, xsd:24100-24102): a file reference of the text census
 * (spec reading R9-b), read as an href is. A path that resolves in the package names a file the
 * package must hold and list (IMS Content Packaging 1.2, InterchangePackage (b) and (d)), whatever
 * its extension, so a reference sheet's PDF or PNG is admitted; an address outside the package,
 * `data:` among them, is "an external file" (§5.80) and is stored unresolved, never refused.
 *
 * Oracle: the specification. CP 1.2 decides a path's verdict (a path the package holds and lists
 * breaks nothing; one it does not hold breaks File exists; one it holds and does not list breaks
 * File listed), and RFC 3986 §4.3 decides that a URI with a scheme is external. Each case's
 * verdict is held to the law oracle's (`#pantry/test/probe.ts`), and each case's resolution to the
 * `TextReference` row the import's write stores (`readProgram`, grizzle's insertion preview).
 *
 * Bound: two holders (a digital material, a calculator's info) × seven hrefs (a listed PNG, a
 * listed PDF, a listed `.JPG`, a path the package does not hold, a held path no `cp:file` lists, an
 * `https:` PDF and a `data:` URI): 14 packages, exhausted.
 */
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, layer } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { int } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Duration, Effect, FileSystem, Option } from "effect";
import { readProgram } from "#pantry/import/program.ts";
import { asi, breachesOf, judged, manifestOf, shown } from "#pantry/test/probe.ts";
import { previewRowsOf } from "#pantry/test/host-judge.ts";
import { scratchDirectory } from "#pantry/test/scratch.ts";

/**
 * The holders of a file of the box.
 */
const holderNames = ["calculator", "material"] as const;

/**
 * A holder of the box.
 */
type Holder = (typeof holderNames)[number];

/**
 * The hrefs of the box, by what each names.
 */
const hrefNames = ["absent", "data", "external", "jpgUpper", "pdf", "png", "unlisted"] as const;

/**
 * An href of the box.
 */
type Href = (typeof hrefNames)[number];

/**
 * Each href as written, and whether the package holds and lists the file it names.
 */
const hrefs = {
  absent: { held: false, listed: false, written: "sheets/absent.pdf" },
  data: { held: false, listed: false, written: "data:application/pdf;base64,JVBERi0=" },
  external: { held: false, listed: false, written: "https://example.org/sheets/table.pdf" },
  jpgUpper: { held: true, listed: true, written: "sheets/table.JPG" },
  pdf: { held: true, listed: true, written: "sheets/table.pdf" },
  png: { held: true, listed: true, written: "sheets/table.png" },
  unlisted: { held: true, listed: false, written: "sheets/stray.pdf" },
} as const satisfies Readonly<
  Record<Href, { readonly held: boolean; readonly listed: boolean; readonly written: string }>
>;

/**
 * Each holder's companion materials, naming one file.
 */
const holders = {
  calculator: (href: string) =>
    `<qti-companion-materials-info><qti-calculator><qti-calculator-type>basic</qti-calculator-type><qti-description>A calculator</qti-description><qti-calculator-info label="calculator"><qti-file-href>${href}</qti-file-href></qti-calculator-info></qti-calculator></qti-companion-materials-info>`,
  material: (href: string) =>
    `<qti-companion-materials-info><qti-digital-material label="The periodic table" mime-type="application/pdf"><qti-file-href>${href}</qti-file-href></qti-digital-material></qti-companion-materials-info>`,
} as const satisfies Readonly<Record<Holder, (href: string) => string>>;

/**
 * One case of the box.
 */
interface FileCase {
  readonly holder: Holder;
  readonly href: Href;
}

/**
 * Every case of the box.
 */
const cases: readonly FileCase[] = holderNames.flatMap((holder) =>
  hrefNames.map((href) => ({ holder, href })),
);

/**
 * Write a case as text.
 *
 * @param input - The case.
 * @returns Its text.
 */
const literalOf = (input: FileCase): string => `${input.href} in a ${input.holder}`;

/**
 * Write a case's package: the item, its companion file, and the file itself where the case holds
 * it, listed where the case lists it.
 *
 * @param input - The case.
 * @returns Each file's text by path.
 */
const filesOf = (input: FileCase) => {
  const href = hrefs[input.href];
  const listing = href.listed ? `<file href="${href.written}"/>` : "";
  const item = `<qti-assessment-item xmlns="${asi}" identifier="item" title="Item" adaptive="false" time-dependent="false">${holders[input.holder](href.written)}<qti-item-body><p>Use the sheet.</p></qti-item-body></qti-assessment-item>`;
  const documents = {
    "imsmanifest.xml": manifestOf(
      `<resource identifier="R" type="imsqti_item_xmlv3p0" href="item.xml"><file href="item.xml"/>${listing}</resource>`,
    ),
    "item.xml": item,
  };

  return href.held
    ? { ...documents, [href.written]: "%PDF-1.7 or any bytes: no law reads a media file" }
    : documents;
};

/**
 * What the specification makes of a case: the laws it breaks, and how its text resolves.
 */
interface Expected {
  readonly laws: readonly string[];
  readonly scope: "entry" | "external";
}

/**
 * Decide a case by IMS Content Packaging 1.2 and RFC 3986 ({@link Expected}).
 *
 * @param input - The case.
 * @returns Its laws, sorted, and its resolution.
 */
const expectedOf = (input: FileCase): Expected => {
  const href = hrefs[input.href];
  const external = /^[A-Za-z][A-Za-z0-9+.-]*:/u.test(href.written);
  const laws = external
    ? []
    : [
        ...(href.held ? [] : ["File exists"]),
        ...(href.held && !href.listed ? ["File listed"] : []),
      ];

  return { laws: laws.toSorted(), scope: external ? "external" : "entry" };
};

/**
 * A situation the box must reach.
 */
type Situation = "a file outside the package" | "a file the package holds" | "a path it lacks";

/**
 * Name the situation a case reaches.
 *
 * @param input - The case.
 * @param expected - Its verdict.
 * @returns The situation.
 */
const situationOf = (input: FileCase, expected: Expected): Situation => {
  if (expected.scope === "external") {
    return "a file outside the package";
  }

  return hrefs[input.href].held ? "a file the package holds" : "a path it lacks";
};

layer(NodeServices.layer, { excludeTestServices: true })("a companion material's file", (it) => {
  it.effect(
    "admits a calculator's and a digital material's file the package holds or that lies outside it, and refuses a path it lacks or does not list",
    (ctx) =>
      searched(
        ctx,
        Effect.gen(function* companionFileRuns() {
          const fs = yield* FileSystem.FileSystem;
          const directory = yield* scratchDirectory("companion-file-");

          return yield* exhaust(
            {
              box: "two holders × seven hrefs",
              caseHang: Duration.minutes(2),
              concurrency: 1,
              coverage: requiredInSpace<Situation>([
                "a file the package holds",
                "a file outside the package",
                "a path it lacks",
              ]),
              generator: int(0, cases.length - 1),
              literal: (at) =>
                Option.match(Option.fromUndefinedOr(cases[at]), {
                  onNone: () => String(at),
                  onSome: literalOf,
                }),
              oracle: {
                kind: "specification",
                name: "information model §5.80.3, IMS Content Packaging 1.2 InterchangePackage (b) and (d), RFC 3986 §4.3",
              },
              suite: "pantry/companion-file",
            },
            (at, c) =>
              Effect.gen(function* companionFileCase() {
                const input = cases[at];
                assert.isDefined(input, `no case ${String(at)}`);
                if (input === undefined) {
                  return;
                }

                const expected = expectedOf(input);
                c.note(situationOf(input, expected));

                const files = filesOf(input);
                const breaches = breachesOf(yield* judged(files));
                assert.deepStrictEqual(
                  [...new Set(breaches.map(({ law }) => law))].toSorted(),
                  expected.laws,
                  `${literalOf(input)}:\n${shown(breaches)}`,
                );

                const dir = `${directory}/c${String(at)}`;
                yield* fs.makeDirectory(`${dir}/sheets`, { recursive: true });
                yield* Effect.forEach(Object.entries(files), ([path, text]) =>
                  fs.writeFileString(`${dir}/${path}`, text),
                );

                const program = yield* readProgram(dir, "probe");
                yield* fs.remove(dir, { recursive: true });

                const references = previewRowsOf(program.inputs).TextReference;
                assert.deepStrictEqual(
                  references.map(({ kind, scope, target }) => ({ kind, scope, target })),
                  [
                    {
                      kind: "qti-file-href",
                      scope: expected.scope,
                      target: hrefs[input.href].written,
                    },
                  ],
                  literalOf(input),
                );
              }),
          );
        }).pipe(Effect.scoped),
      ),
  );
});
