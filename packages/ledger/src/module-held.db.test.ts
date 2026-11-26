/**
 * "Module held" on the lease's result database (the result composition,
 * `#ledger/test/result-level.ts`, which the ledger's global setup installs,
 * `#ledger/test/result-install.ts`): a package whose items' portable custom interactions name
 * modules it holds as files the delivery serves is published, and every module of each of its
 * items' PCIs is routed to the address of its file by the delivery's own routing (`pciFactsOf`,
 * `#ledger/served-item.ts`); a package whose item's PCI names a module the delivery could not serve
 * is refused, naming the laws that refuse it. It runs wherever a lane names its lease (pantry's
 * `QTI_PIE_PG_*`), and is skipped elsewhere, as every database suite is.
 *
 * The oracle is {@link cases}, a table written from the sources apart from the code: QTI 3.0.1
 * makes a PCI's `module` "the Module Id which would be passed at runtime to the PCI API to
 * dynamically load the Javascript module" (information model §5.106.2) and a
 * `qti-interaction-module`'s `primary-path` and `fallback-path` its two locations (§7.17.2,
 * §7.17.3), both attributes and its `id` read collapsed, as the XSD types them (reading
 * `typed-value-whitespace`); a location without a protocol is "a QTI content package relative path"
 * with `.js` assumed (implementation guide §3.7.12.2), read as reading `pci-module-locations` reads
 * it, its query and fragment apart and its path percent-decoded; and the guide lets the delivery
 * engine "apply security rules to the URLs from which it will load Javascript files" (§3.7.12.2).
 * This delivery loads modules from the files an item names that its media policy serves, so the
 * owner's rule (edullm-bd, 2026-11-25) is: an item is published only where each of its PCIs writes
 * `module`, lists that module among its `qti-interaction-module`s by its `id`, and every module it
 * lists has a location in the package whose file the media policy serves, from which alone the
 * delivery loads it, and every configuration it writes is such a file too, read for its waits alone
 * (reading `pci-configuration-waits`); a PCI of a stimulus is never run, so it is not held; and a
 * location in the package names a file the package holds (pantry's "File exists", IMS Content
 * Packaging 1.2, InterchangePackage (d)).
 *
 * Each case is a package of its own, its PCIs under the K–2 forms' names (Bjorn's hard cutover:
 * type identifier `urn:fdc:alpha.school:2026:<name>`, module id `<name>`, file
 * `modules/<name>.js`), published through the suite's login under a name of this run's own, since a
 * package is closed and never published twice. The media policy is the player's, pantry's closed
 * `mediaPolicy`, which lists `js` and no `json`, so a configuration in a `.json` file is withheld.
 */
import { createHash, randomBytes } from "node:crypto";
import { Sha256 } from "@bjornpagen/grizzle";
import type { BrokenLaws } from "@bjornpagen/grizzle";
import { Db } from "@bjornpagen/grizzle/runtime";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { element } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { assert, describe, layer } from "@effect/vitest";
import { importRowsOf } from "@qti-pie/pantry/import/program.ts";
import { readPackage } from "@qti-pie/pantry/import/read.ts";
import { MediaStore, memoryMediaStore } from "@qti-pie/pantry/package/media.ts";
import {
  Array as Arr,
  Duration,
  Effect,
  FileSystem,
  Formatter,
  Option,
  pipe,
  Result,
} from "effect";
import { openServedItem, pciFactsOf } from "#ledger/served-item.ts";
import { lease, suiteLayerOf, SuiteLogin } from "#ledger/test/result-suite.ts";

/**
 * This run's own token, in every package name it publishes under, so no run meets a package an
 * earlier run stored.
 */
const run = randomBytes(6).toString("hex");

/**
 * The item's path in each case's package.
 */
const ITEM = "items/pci.xml";

/**
 * The stimulus's path, where a case holds one.
 */
const STIMULUS = "items/stimulus.xml";

/**
 * A location outside the package: a CDN's, which this delivery never loads.
 */
const remote = (name: string) => `https://cdn.example.org/modules/${name}.js`;

/**
 * A module of the K–2 forms: its type identifier, its module id and its file in the package.
 */
const moduleOf = (name: "count-placements" | "mark-objects" | "build-with-blocks") => ({
  file: `modules/${name}.js`,
  id: name,
  type: `urn:fdc:alpha.school:2026:${name}`,
});

const counter = moduleOf("count-placements");

const marks = moduleOf("mark-objects");

const blocks = moduleOf("build-with-blocks");

/**
 * One `qti-interaction-module` a PCI lists: its `id` as written, and each location it writes.
 */
interface Listed {
  readonly id: string;
  readonly primary: Option.Option<string>;
  readonly fallback: Option.Option<string>;
}

/**
 * A PCI: its type identifier, its `module` as written where it writes one, the modules it lists (no
 * `qti-interaction-modules` where none), the primary configuration its modules child names where it
 * names one, and the module the delivery must route it to where the table admits it: the module's
 * id, the file its route serves, at every location it has, and the wait its fallback holds before
 * it loads, none where the route has no fallback (reading `pci-wait-before-fallback`).
 */
interface Pci {
  readonly type: string;
  readonly module: Option.Option<string>;
  readonly listed: readonly Listed[];
  readonly configuration: Option.Option<string>;
  readonly routed: Option.Option<{
    readonly id: string;
    readonly file: string;
    readonly primaryWaitSeconds: Option.Option<number>;
  }>;
}

/**
 * The laws a refusal names.
 */
type LawName = "Module held" | "File exists";

/**
 * What the table expects of a case's publish: accepted, its item's PCIs each routed to its module's
 * file, or refused, breaking these laws. A refusal names the laws of the first PostgreSQL object
 * that refused the write (grizzle's `BrokenLaws`), so it names at least one of them: a case that
 * breaks one law is refused naming exactly it, and one that breaks two laws over different
 * relations, one or both. The test holds each refusal to the laws its case breaks, stricter than
 * grizzle's `some`, which may name a law of the same object the row did not break.
 */
type Expected =
  | Readonly<{ kind: "accepted" }>
  | Readonly<{ kind: "refused"; laws: readonly LawName[] }>;

/**
 * A case: its item's PCIs, the PCI of its stimulus where it holds one, the files its package holds
 * beside its documents, by path with their text, and what the table expects.
 */
interface Case {
  readonly name: string;
  readonly pcis: Arr.NonEmptyReadonlyArray<Pci>;
  readonly stimulus: Option.Option<Pci>;
  readonly files: readonly (readonly [string, string])[];
  readonly expected: Expected;
}

const accepted: Expected = { kind: "accepted" };

/**
 * The wait before a fallback no configuration states (the implementation guide §3.7.12.2, readings
 * `pci-configuration-waits` and `pci-wait-before-fallback`): 7 seconds.
 */
const defaultWaitSeconds = 7;

const refused = (...laws: readonly LawName[]): Expected => ({ kind: "refused", laws });

/**
 * A module's script: an AMD module that registers its type identifier, as a PCI module does
 * (implementation guide §3.7.12).
 *
 * @param type The type identifier it registers.
 * @returns The script.
 */
const moduleScript = (type: string) =>
  `define(["qtiCustomInteractionContext"], function (context) { context.register({ typeIdentifier: "${type}", getInstance: function () {} }); });\n`;

/**
 * A module's file, held in the package.
 *
 * @param module The module.
 * @returns Its path and text.
 */
const fileOf = (module: ReturnType<typeof moduleOf>) =>
  [module.file, moduleScript(module.type)] as const;

/**
 * A primary configuration (implementation guide §3.7.12.2) mapping each module id to its file, at
 * the default `modules/module_resolution.js`.
 *
 * @param modules The modules it maps.
 * @returns Its path and text.
 */
const configurationOf = (...modules: readonly ReturnType<typeof moduleOf>[]) =>
  [
    "modules/module_resolution.js",
    JSON.stringify({
      paths: Object.fromEntries(modules.map(({ file, id }) => [id, file.replace(/\.js$/u, "")])),
      waitSeconds: 7,
    }),
  ] as const;

/**
 * A listed module located at its file in the package, as its primary path.
 */
const atPrimary = (module: ReturnType<typeof moduleOf>, path = module.file): Listed => ({
  fallback: Option.none(),
  id: module.id,
  primary: Option.some(path),
});

/**
 * A PCI that names and lists one module, routed to its file, its fallback, where it lists one,
 * holding the default wait.
 */
const heldPci = (module: ReturnType<typeof moduleOf>, listed: Listed = atPrimary(module)): Pci => ({
  configuration: Option.none(),
  listed: [listed],
  module: Option.some(module.id),
  routed: Option.some({
    file: module.file,
    id: module.id,
    primaryWaitSeconds: Option.as(listed.fallback, defaultWaitSeconds),
  }),
  type: module.type,
});

/**
 * A PCI the law refuses: what it writes, with no route.
 */
const refusedPci = (
  module: ReturnType<typeof moduleOf>,
  written: Option.Option<string>,
  listed: readonly Listed[],
): Pci => ({
  configuration: Option.none(),
  listed,
  module: written,
  routed: Option.none(),
  type: module.type,
});

/**
 * The table: each case written from the sources in the header, apart from the code.
 */
const cases: Arr.NonEmptyReadonlyArray<Case> = [
  {
    expected: accepted,
    files: [fileOf(counter)],
    name: "held at its primary path",
    pcis: [heldPci(counter)],
    stimulus: Option.none(),
  },
  {
    // Reading `pci-module-locations`: ".js" is assumed where the path writes none.
    expected: accepted,
    files: [fileOf(marks)],
    name: "held at its primary path, .js assumed",
    pcis: [heldPci(marks, atPrimary(marks, `modules/${marks.id}`))],
    stimulus: Option.none(),
  },
  {
    expected: accepted,
    files: [fileOf(blocks)],
    name: "held at its fallback path alone",
    pcis: [
      heldPci(blocks, {
        fallback: Option.some(blocks.file),
        id: blocks.id,
        primary: Option.none(),
      }),
    ],
    stimulus: Option.none(),
  },
  {
    // §3.7.12.1: "a primary location (typically used to reference CDN hosted files) and a fallback
    // location (typically referencing content package provided files)".
    expected: accepted,
    files: [fileOf(counter)],
    name: "a remote primary, held at its fallback path",
    pcis: [
      heldPci(counter, {
        fallback: Option.some(counter.file),
        id: counter.id,
        primary: Option.some(remote(counter.id)),
      }),
    ],
    stimulus: Option.none(),
  },
  {
    // Reading `typed-value-whitespace`: `module` and `id` are xs:NCName, read collapsed.
    expected: accepted,
    files: [fileOf(counter)],
    name: "its module and id written with outer whitespace",
    pcis: [
      {
        ...heldPci(counter, atPrimary(counter)),
        listed: [{ ...atPrimary(counter), id: ` ${counter.id}  ` }],
        module: Option.some(`  ${counter.id} `),
      },
    ],
    stimulus: Option.none(),
  },
  {
    // Reading `pci-module-locations`: the query is no part of the file.
    expected: accepted,
    files: [fileOf(counter)],
    name: "held at a primary path with a query",
    pcis: [heldPci(counter, atPrimary(counter, `modules/${counter.id}?v=1`))],
    stimulus: Option.none(),
  },
  {
    // Reading `pci-module-locations`: the fragment is no part of the file.
    expected: accepted,
    files: [fileOf(counter)],
    name: "a remote primary, held at a fallback path with a fragment",
    pcis: [
      heldPci(counter, {
        fallback: Option.some(`modules/${counter.id}#v1`),
        id: counter.id,
        primary: Option.some(remote(counter.id)),
      }),
    ],
    stimulus: Option.none(),
  },
  {
    // RFC 3986 §2.1: `%2E` is `.`, so the path's file already ends in `.js`.
    expected: accepted,
    files: [fileOf(counter)],
    name: "held at a primary path whose .js is percent-encoded",
    pcis: [heldPci(counter, atPrimary(counter, `modules/${counter.id}%2Ejs`))],
    stimulus: Option.none(),
  },
  {
    expected: accepted,
    files: [fileOf(counter), fileOf(marks)],
    name: "two PCIs, each held",
    pcis: [heldPci(counter), heldPci(marks)],
    stimulus: Option.none(),
  },
  {
    // §3.7.12.2: a primary configuration's `paths` locate a module with no primary path; the
    // delivery's rule loads a module from its own locations alone, so a configuration mapping it to
    // another module's file routes nothing, and it loads from its own fallback; reading `pci-wait-before-fallback`: its
    // `waitSeconds` is the wait its fallback holds.
    expected: accepted,
    files: [
      fileOf(counter),
      fileOf(marks),
      [
        "modules/cfg.js",
        JSON.stringify({ paths: { [counter.id]: `modules/${marks.id}` }, waitSeconds: 30 }),
      ],
    ],
    name: "a configuration mapping the module to another module's file",
    pcis: [
      {
        ...heldPci(counter),
        configuration: Option.some("modules/cfg.js"),
        listed: [
          { fallback: Option.some(counter.file), id: counter.id, primary: Option.none() },
          atPrimary(marks),
        ],
        routed: Option.some({
          file: counter.file,
          id: counter.id,
          primaryWaitSeconds: Option.some(30),
        }),
      },
    ],
    stimulus: Option.none(),
  },
  {
    // Reading `pci-configuration-waits`: a stated wait is never dropped, however long; the frame holds one longer than a
    // timer can as no limit. Reading `pci-wait-before-fallback`: a wait is held only before a fallback.
    expected: accepted,
    files: [fileOf(counter), ["modules/cfg.js", JSON.stringify({ waitSeconds: 1e9 })]],
    name: "a configuration stating a wait longer than a timer holds",
    pcis: [
      {
        ...heldPci(counter),
        configuration: Option.some("modules/cfg.js"),
        listed: [{ ...atPrimary(counter), fallback: Option.some(counter.file) }],
        routed: Option.some({
          file: counter.file,
          id: counter.id,
          primaryWaitSeconds: Option.some(1e9),
        }),
      },
    ],
    stimulus: Option.none(),
  },
  {
    // A stimulus's interaction is never run, so its module is never loaded.
    expected: accepted,
    files: [fileOf(counter)],
    name: "a stimulus whose PCI is located only outside the package",
    pcis: [heldPci(counter)],
    stimulus: Option.some(
      refusedPci(blocks, Option.some(blocks.id), [
        { fallback: Option.none(), id: blocks.id, primary: Option.some(remote(blocks.id)) },
      ]),
    ),
  },
  {
    // Reading `pci-configuration-waits`: a configuration the PCI writes gives a wait the delivery reads, so it is a file
    // the delivery serves; one outside the package is not.
    expected: refused("Module held"),
    files: [fileOf(counter)],
    name: "a configuration it writes outside the package",
    pcis: [{ ...heldPci(counter), configuration: Option.some(remote("cfg")) }],
    stimulus: Option.none(),
  },
  {
    // Reading `pci-configuration-waits` and pantry's `ServedFile`: a file of an extension the policy does not list is
    // stored and served to no player.
    expected: refused("Module held"),
    files: [fileOf(counter), ["modules/cfg.json", JSON.stringify({ waitSeconds: 30 })]],
    name: "a configuration it writes of an extension the media policy withholds",
    pcis: [{ ...heldPci(counter), configuration: Option.some("modules/cfg.json") }],
    stimulus: Option.none(),
  },
  {
    // Reading `pci-configuration-waits`: an empty configuration, a valid xs:anyURI, names no file the item's media is
    // served as.
    expected: refused("Module held"),
    files: [fileOf(counter)],
    name: "an empty configuration",
    pcis: [{ ...heldPci(counter), configuration: Option.some("") }],
    stimulus: Option.none(),
  },
  {
    // IMS Content Packaging 1.2, InterchangePackage (d), and reading `pci-configuration-waits`.
    expected: refused("File exists", "Module held"),
    files: [fileOf(counter)],
    name: "a configuration it writes that the package lacks",
    pcis: [{ ...heldPci(counter), configuration: Option.some("modules/cfg.js") }],
    stimulus: Option.none(),
  },
  {
    // §5.106.2 lets the modules child name what loads without `module`; the delivery's rule does not.
    expected: refused("Module held"),
    files: [fileOf(counter)],
    name: "no module attribute",
    pcis: [refusedPci(counter, Option.none(), [atPrimary(counter)])],
    stimulus: Option.none(),
  },
  {
    expected: refused("Module held"),
    files: [fileOf(marks)],
    name: "its module named by no listed module",
    pcis: [refusedPci(counter, Option.some(counter.id), [atPrimary(marks)])],
    stimulus: Option.none(),
  },
  {
    expected: refused("Module held"),
    files: [],
    name: "its module located only outside the package",
    pcis: [
      refusedPci(counter, Option.some(counter.id), [
        { fallback: Option.none(), id: counter.id, primary: Option.some(remote(counter.id)) },
      ]),
    ],
    stimulus: Option.none(),
  },
  {
    // §3.7.12.1: the default configuration names the module's file; no listed module locates it.
    expected: refused("Module held"),
    files: [fileOf(counter), configurationOf(counter)],
    name: "its module resolved by a configuration file alone",
    pcis: [refusedPci(counter, Option.some(counter.id), [])],
    stimulus: Option.none(),
  },
  {
    // §5.77.3: a listed module with no path "will be resolved via the module configuration files".
    expected: refused("Module held"),
    files: [fileOf(counter), fileOf(blocks), configurationOf(blocks)],
    name: "a listed library module located by a configuration file alone",
    pcis: [
      refusedPci(counter, Option.some(counter.id), [
        atPrimary(counter),
        { fallback: Option.none(), id: blocks.id, primary: Option.none() },
      ]),
    ],
    stimulus: Option.none(),
  },
  {
    expected: refused("Module held"),
    files: [fileOf(counter)],
    name: "a listed library module located only outside the package",
    pcis: [
      refusedPci(counter, Option.some(counter.id), [
        atPrimary(counter),
        { fallback: Option.none(), id: blocks.id, primary: Option.some(remote(blocks.id)) },
      ]),
    ],
    stimulus: Option.none(),
  },
  {
    // Each PCI's own modules child: the second's module is listed only by the first.
    expected: refused("Module held"),
    files: [fileOf(counter), fileOf(marks)],
    name: "a PCI whose module only another PCI of the item lists",
    pcis: [heldPci(counter), refusedPci(marks, Option.some(counter.id), [atPrimary(marks)])],
    stimulus: Option.none(),
  },
  {
    // IMS Content Packaging 1.2, InterchangePackage (d): a location in the package names a file it
    // holds; a file not held is not served.
    expected: refused("File exists", "Module held"),
    files: [],
    name: "its module's file not in the package",
    pcis: [refusedPci(counter, Option.some(counter.id), [atPrimary(counter)])],
    stimulus: Option.none(),
  },
];

/**
 * How long one case may run before it is stopped and reported, the suite's one guard on time: a
 * publish or a read that runs past it is hung, whatever the machine's load.
 */
const caseHang = Duration.minutes(2);

/**
 * The response identifier of a document's PCI by its place.
 */
const responseOf = (at: number) => `RESPONSE${String(at)}`;

/**
 * An attribute of a listed module's location, none where it writes none.
 *
 * @param name The attribute's name.
 * @param value Its value.
 * @returns The attribute, with its leading space.
 */
const locationAttribute = (name: string, value: Option.Option<string>) =>
  Option.match(value, { onNone: () => "", onSome: (path) => ` ${name}="${path}"` });

/**
 * A PCI's element.
 *
 * @param pci The PCI.
 * @param at Its place in its document, which names the response it binds.
 * @returns Its XML.
 */
const pciXml = (pci: Pci, at: number) => {
  const module = Option.match(pci.module, { onNone: () => "", onSome: (id) => ` module="${id}"` });
  const modules =
    pci.listed.length === 0
      ? ""
      : `<qti-interaction-modules${locationAttribute("primary-configuration", pci.configuration)}>${pci.listed
          .map(
            ({ fallback, id, primary }) =>
              `<qti-interaction-module id="${id}"${locationAttribute("primary-path", primary)}${locationAttribute("fallback-path", fallback)}/>`,
          )
          .join("")}</qti-interaction-modules>`;

  return `<qti-portable-custom-interaction response-identifier="${responseOf(at)}" custom-interaction-type-identifier="${pci.type}"${module}><qti-prompt>Put 6 on the mat.</qti-prompt>${modules}<qti-interaction-markup><p>The mat.</p></qti-interaction-markup></qti-portable-custom-interaction>`;
};

/**
 * A case's item: one integer response for each PCI, which binds it, and a ref to its stimulus where
 * it has one, so opening the item opens the stimulus too (information model §7.6).
 *
 * @param c The case.
 * @returns The item's XML.
 */
const itemXml = (c: Case) =>
  `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="pci" title="PCI" adaptive="false" time-dependent="false">${c.pcis
    .map(
      (_, at) =>
        `<qti-response-declaration identifier="${responseOf(at)}" cardinality="single" base-type="integer"><qti-correct-response><qti-value>6</qti-value></qti-correct-response></qti-response-declaration>`,
    )
    .join("")}${Option.match(c.stimulus, {
    onNone: () => "",
    onSome: () =>
      `<qti-assessment-stimulus-ref identifier="stimulus" href="${STIMULUS.slice(ITEM.lastIndexOf("/") + 1)}"/>`,
  })}<qti-item-body>${c.pcis.map(pciXml).join("")}</qti-item-body></qti-assessment-item>`;

/**
 * A case's stimulus: its one PCI, in a `div`.
 *
 * @param pci The stimulus's PCI.
 * @returns The stimulus's XML.
 */
const stimulusXml = (pci: Pci) =>
  `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-stimulus xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="stimulus" title="Stimulus"><qti-stimulus-body><div>${pciXml(pci, 0)}</div></qti-stimulus-body></qti-assessment-stimulus>`;

/**
 * A case's manifest: the item's resource listing the item and every file the package holds, and the
 * stimulus's where it has one, on which the item's depends.
 *
 * @param name The package's name, its manifest's identifier.
 * @param c The case.
 * @returns The manifest's XML.
 */
const manifestXml = (name: string, c: Case) =>
  `<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="${name}"><metadata><schema>QTI Package</schema><schemaversion>3.0.1</schemaversion></metadata><organizations/><resources><resource identifier="item" type="imsqti_item_xmlv3p0" href="${ITEM}"><file href="${ITEM}"/>${c.files
    .map(([file]) => `<file href="${file}"/>`)
    .join("")}${Option.match(c.stimulus, {
    onNone: () => "",
    onSome: () => `<dependency identifierref="stimulus"/>`,
  })}</resource>${Option.match(c.stimulus, {
    onNone: () => "",
    onSome: () =>
      `<resource identifier="stimulus" type="imsqti_stimulus_xmlv3p0" href="${STIMULUS}"><file href="${STIMULUS}"/></resource>`,
  })}</resources></manifest>`;

/**
 * The application's addresses as a host gives them: each file at `media/<the hex of its SHA-256>`.
 */
const host = {
  mediaUrlOf: (digest: { readonly toHex: () => string }) => `media/${digest.toHex()}`,
  pciFrame: "/pci/frame.html",
};

/**
 * The address a file's text is served at: its SHA-256's.
 *
 * @param text The file's text.
 * @returns Its address.
 */
const addressOf = (text: string) =>
  `media/${createHash("sha256").update(text, "utf-8").digest("hex")}`;

/**
 * The laws a refusal names, each once. The suite's login is over the composition's top level, so
 * every law its writes break is its own.
 *
 * @param broken The refusal.
 * @returns The names.
 */
const lawNamesOf = (broken: BrokenLaws): readonly string[] =>
  broken.kind === "above"
    ? assert.fail(`a refusal by a level above the suite's: ${Formatter.format(broken)}`)
    : Arr.dedupe(broken.laws.map(({ law }) => law.entry.name));

/**
 * Publish a case's package through the suite's login, under a name of this run's own.
 *
 * @param c The case.
 * @param name The package's name.
 * @returns What the publish did: accepted, or refused naming its laws.
 */
const publishCase = Effect.fn("module-held.publish")(function* publishCase(c: Case, name: string) {
  const { suite } = yield* SuiteLogin;
  const fs = yield* FileSystem.FileSystem;
  const dir = yield* fs.makeTempDirectoryScoped({ prefix: `${name}-` });
  yield* fs.makeDirectory(`${dir}/items`, { recursive: true });
  yield* fs.makeDirectory(`${dir}/modules`, { recursive: true });
  yield* fs.writeFileString(`${dir}/imsmanifest.xml`, manifestXml(name, c));
  yield* fs.writeFileString(`${dir}/${ITEM}`, itemXml(c));
  for (const pci of Option.toArray(c.stimulus)) {
    yield* fs.writeFileString(`${dir}/${STIMULUS}`, stimulusXml(pci));
  }
  for (const [file, text] of c.files) {
    yield* fs.writeFileString(`${dir}/${file}`, text);
  }

  const read = yield* readPackage(dir, name);
  const rows = yield* importRowsOf(read);
  const db = yield* Db.open(suite.roles.result_runner, {});
  const outcome = yield* Effect.result(
    db.workload.publish.once({ facts: { insert: rows.insert }, params: { package: rows.package } }),
  );

  if (Result.isSuccess(outcome)) {
    // A case run again (an exploration's replay of a failing case) meets the package its first run
    // published.
    assert.include(["accepted", "unchanged"], outcome.success.kind, `${c.name}: published`);

    return { kind: "accepted" } as const;
  }

  assert.strictEqual(
    outcome.failure.kind,
    "refused",
    `${c.name}: a refusal, got ${Formatter.format(outcome.failure)}`,
  );

  return {
    kind: "refused",
    laws: outcome.failure.kind === "refused" ? lawNamesOf(outcome.failure.refused) : [],
  } as const;
});

/**
 * Route a published case's item's PCIs as the delivery routes them: its files' bytes put in a store
 * of the case's own by their SHA-256, as an application's import puts them before it publishes, its
 * item read as opening reads it (`servedItemOf`, `itemRowsOf`), opened (`openServedItem`) and
 * routed (`pciFactsOf`, which reads a configuration the item names from the store), then held to
 * the table: each PCI's module, by its response, routed to the address of its file at every
 * location it has.
 *
 * @param c The case.
 * @param name The package's name.
 * @returns Nothing, once every PCI is held.
 */
const routedCase = Effect.fn("module-held.routed")(function* routedCase(c: Case, name: string) {
  const { suite } = yield* SuiteLogin;
  const db = yield* Db.open(suite.roles.result_runner, {});
  const found = yield* db.workload.servedItemOf.once({
    facts: {},
    params: { package: name, path: ITEM },
  });
  const rows = Option.getOrThrowWith(
    Option.fromUndefinedOr(Arr.fromIterable(found)[0]?.item[0]),
    () => new Error(`${c.name}: no item read`),
  );
  const store = yield* MediaStore;
  for (const [, text] of c.files) {
    const bytes = new TextEncoder().encode(text);
    yield* store.put(Sha256.ofBytes(bytes), bytes);
  }
  const served = yield* openServedItem(rows, "seed", { readAloud: false }, host);
  const facts = yield* pciFactsOf(host, served.item, rows);
  const texts = new Map(c.files);

  for (const [at, pci] of c.pcis.entries()) {
    const { file, id, primaryWaitSeconds } = Option.getOrThrowWith(
      pci.routed,
      () => new Error(`${c.name}: unrouted`),
    );
    const route = (facts.pci.modules.get(responseOf(at)) ?? []).find((each) => each.id === id);
    const address = addressOf(texts.get(file) ?? "");

    // Each location the route has is the held file's address, and it has one at least: the frame
    // tries the primary first, so a primary naming another file would load it.
    assert.isTrue(
      route !== undefined &&
        (Option.isSome(route.primary) || Option.isSome(route.fallback)) &&
        [route.primary, route.fallback.pipe(Option.map(({ location }) => location))].every(
          (location) =>
            Option.match(location, { onNone: () => true, onSome: (url) => url === address }),
        ),
      `${c.name}: ${responseOf(at)}'s module ${id} routed to ${file} alone, got ${Formatter.format(route)}`,
    );
    assert.deepStrictEqual(
      route?.fallback.pipe(Option.map((fallback) => fallback.primaryWaitSeconds)),
      primaryWaitSeconds,
      `${c.name}: ${responseOf(at)}'s module ${id} waits before its fallback as its primary configuration states, and holds no wait with no fallback`,
    );
  }

  // The delivery routes the item's own PCIs alone: a module its stimulus's PCI names is never loaded.
  assert.includeMembers(
    c.pcis.flatMap((pci) => pci.listed.map(({ id }) => id.trim())),
    Arr.flatten([...facts.pci.modules.values()]).map(({ id }) => id),
    `${c.name}: only the item's own modules routed`,
  );
});

/**
 * What a case reaches: each verdict the table states.
 */
const situations = ["accepted and routed", "refused"] as const;

type Situation = (typeof situations)[number];

describe.skipIf(Option.isNone(lease))("Module held, on the lease's result database", () => {
  layer(suiteLayerOf("module_held"), { excludeTestServices: true })(
    "a PCI's modules are files of its own package the delivery serves",
    (it) => {
      it.effect(
        "publishes and routes every case the table admits, and refuses every other naming only laws it breaks",
        (ctx) =>
          // Oracle: the table, written from QTI 3.0.1 §5.106.2, §5.77.1–2, §7.17.2–3, readings `typed-value-whitespace`, `pci-module-locations` and `pci-configuration-waits`, the implementation guide §3.7.12 and the owner's rule, in this module's header.
          // Bound: every case of the table, each its own package, under the player's media policy,
          // which lists js (pantry's `mediaPolicy`).
          Effect.gen(function* everyCase() {
            return yield* searched(
              ctx,
              exhaust(
                {
                  box: `every case of the table, ${String(cases.length)} packages`,
                  caseHang,
                  coverage: requiredInSpace<Situation>(situations),
                  generator: element(
                    pipe(
                      cases,
                      Arr.map((c, at) => ({ at, c })),
                    ),
                  ),
                  literal: ({ c }) => c.name,
                  oracle: {
                    kind: "specification",
                    name: "cases, the table: QTI 3.0.1 §5.106.2, §5.77.1–2 and §7.17.2–3, readings `typed-value-whitespace`, `pci-module-locations` and `pci-configuration-waits`, the implementation guide §3.7.12, IMS Content Packaging 1.2 InterchangePackage (d), and the owner's rule",
                  },
                  suite: "ledger/module-held",
                },
                ({ at, c }, note) =>
                  Effect.gen(function* holdCase() {
                    const name = `module-held-${run}-${String(at)}`;
                    const got = yield* Effect.scoped(publishCase(c, name));

                    if (c.expected.kind === "accepted") {
                      note.note("accepted and routed");
                      assert.deepStrictEqual(got, { kind: "accepted" }, c.name);
                      yield* routedCase(c, name).pipe(Effect.provide(memoryMediaStore));
                    } else {
                      note.note("refused");
                      assert.strictEqual(got.kind, "refused", `${c.name}: refused`);

                      const named = got.kind === "refused" ? [...got.laws] : [];
                      assert.isNotEmpty(named, `${c.name}: refused naming a law`);
                      assert.includeMembers(
                        [...c.expected.laws],
                        named,
                        `${c.name}: refused naming only laws it breaks, ${c.expected.laws.join(", ")}`,
                      );
                    }
                  }).pipe(Effect.orDie),
              ),
            );
          }),
      );
    },
  );
});
