/**
 * An item opened for serving, `@qti-pie/ledger/served-item.ts`: an item document of the database,
 * written back as XML by pantry from the rows an application's read carries (`documentXml`), opened
 * by plate as admitted content (`openAdmitted`) with the stimuli its refs name, and what plate's
 * `<Item>` is handed for it in each mode. Every application that serves items over the ledger
 * (edullm's QTI app, metis) opens them through this module alone, naming only what it serves
 * differently, its {@link Host}, and providing the content-addressed store its package files live
 * in, pantry's `MediaStore`.
 *
 * Nothing here grades: the database's statements judge and score an answer, and a review shows what
 * they wrote ({@link reviewOf}). The values an answer or a take writes, and those the reads give
 * back, cross to plate through `#ledger/served-values.ts`.
 *
 * @module
 */
import type { Sha256 } from "@bjornpagen/grizzle";
import { documentXml } from "@qti-pie/pantry/export/render.ts";
import { MediaStore } from "@qti-pie/pantry/package/media.ts";
import {
  acceptedItem,
  acceptedStimulus,
  assetPaths,
  configure,
  decode,
  encode,
  noSupports,
  openAdmitted,
  partition,
  pciModulesIn,
  postings,
  resolvePciModules,
  restore,
  shuffleSeed,
  solution,
  unpostedEndAttempts,
} from "@qti-pie/plate";
import type {
  Accepted,
  AcceptedStimulus,
  Entry,
  HostFacts,
  ItemRecord,
  ModuleRoute,
  PciModuleRoute,
  PciModules,
  Responses,
  Supports,
} from "@qti-pie/plate";
import type { Graded, ItemProps, PostedEntries } from "@qti-pie/plate/ui/props";
import { Effect, Option, Schema } from "effect";
import { begunOfRows } from "#ledger/served-values.ts";
import type { Judged, StartRows } from "#ledger/served-values.ts";

/**
 * What an application serves differently, which every opening of an item names: the address a page
 * loads a package file from, by the SHA-256 of its bytes (edullm's media CDN, metis's
 * `/media/<digest>`), the 32 raw bytes, which the host renders in its address as it writes it,
 * and the page every Portable Custom Interaction's frame loads, plate's frame page
 * (`@qti-pie/plate/ui/pci-frame`) where the application serves it. The server reads a file's bytes
 * from the application's `MediaStore`, never at its address.
 */
export interface Host {
  readonly mediaUrlOf: (digest: Sha256) => string;
  readonly pciFrame: string;
}

/**
 * What a review shows of an item, three switches, each independent of the others, which the
 * application derives from what it delivers under:
 *
 * - `feedback`, QTI's show-feedback: the item's modal and integrated feedback, as the outcomes the
 *   database's response processing set show it (information model 7.19.2); edullm's QTI app shows
 *   it always between attempts and, once the item session closes, where its stage does (7.19.1);
 * - `marks`: the database's marks on the candidate's own answers, each right or wrong, and the
 *   verdict its credit says. QTI's show-feedback and show-solution govern the item's feedback and
 *   its solution, not these, so they are the delivery's own policy: edullm's QTI app shows them
 *   exactly where it shows feedback, and metis's review shows them alone, the item's feedback
 *   hidden;
 * - `solution`, QTI's show-solution: the correct response, each part the candidate did not give
 *   marked missed beside the answers marked right or wrong, so it marks the answers whatever
 *   `marks` says, and `marks` adds the verdict.
 *
 * Every combination is a review plate draws.
 */
export interface ReviewShows {
  readonly feedback: boolean;
  readonly marks: boolean;
  readonly solution: boolean;
}

/**
 * The child's answer could not be read as the item declares it, as a whole number typed as words is
 * not one: nothing was recorded, and the child can change it.
 */
class AnswerUnreadable extends Schema.TaggedError<AnswerUnreadable>()("AnswerUnreadable", {}) {}

/**
 * The item refused the answer as posted, as more choices than it allows, or, where the stage
 * validates responses, fewer than it asks for: the database's admission judged it in the statement
 * that would record it, so nothing was recorded, and the child can change it. It carries the
 * refusal's words for the child's form, by the response each names, as plate's `refusalMessages`
 * writes them from the admission's rows, at least one.
 */
export class AnswerRefused extends Schema.TaggedError<AnswerRefused>()("AnswerRefused", {
  messages: Schema.NonEmptyArray(Schema.Struct({ response: Schema.String, text: Schema.String })),
}) {}

/**
 * An opened item, as plate holds it for an item session, a preview or a lab: accepted, with the
 * configuration it is rendered with, the instance token its form's entries are named under, the
 * stimuli its refs name, each accepted from its own document, and the supports enabled for the
 * candidate it is served to; what plate's `<Item>` takes in every mode.
 */
export type ServedItem = Pick<ItemProps, "configuration" | "instance" | "item"> & {
  readonly stimuli: readonly AcceptedStimulus[];
  readonly supports: Supports;
};

/**
 * Give the supports an item session enables for its candidate, from whether it reads aloud (the
 * database's `ReadAloud`): where it does, the Access for All PNP's `spoken` support at the reading
 * type `computer-read-aloud`, which activates each item's spoken catalog cards for that reading
 * type, so plate plays their recordings.
 *
 * @param readAloud Whether the item session reads aloud.
 * @returns The `spoken` support at `computer-read-aloud` where it does, no support where it does
 *   not.
 * @see QTI 3.0.1 information model §5.29: "A candidate's profile (or assessment program settings) will indicate
 *   whether the candidate should be presented any of the possible supports included within the CatalogInfo".
 */
export const supportsOf = (readAloud: boolean): Supports =>
  readAloud
    ? { ...noSupports, catalog: new Set(["spoken"]), readAloud: Option.some("computer-read-aloud") }
    : noSupports;

/**
 * Plate refused an item the database holds: its content is not one plate renders. Content is
 * authored for plate, so this is a defect, named by the item's package and path.
 */
class ItemNotRenderable extends Schema.TaggedError<ItemNotRenderable>()("ItemNotRenderable", {
  package: Schema.String,
  path: Schema.String,
  verdict: Schema.String,
}) {}

/**
 * Plate gave no stimulus of a document an item's ref names, which the database holds as a stimulus
 * document (its law "Stimulus ref target"): a defect, named by the document's package and path.
 */
class StimulusNotRenderable extends Schema.TaggedError<StimulusNotRenderable>()(
  "StimulusNotRenderable",
  { package: Schema.String, path: Schema.String, verdict: Schema.String },
) {}

/**
 * The rows of one document's scan, which an application's read carries for an item or a stimulus,
 * as pantry writes the document back from them.
 */
export type DocumentRows = Parameters<typeof documentXml>[1];

/**
 * A document as a read carries it, an item's or a stimulus's an item's refs name, the row
 * `@qti-pie/ledger/served-reads.ts` delivers: its package and its path, the files it names that the
 * application serves (pantry's `ServedFile`), each by its path and the SHA-256 of its bytes, the
 * files it names that the install withholds (pantry's `WithheldFile`), and its rows, pantry's
 * `documentScanOf`.
 */
export interface DocumentRead {
  readonly document: DocumentRows;
  readonly files: readonly { readonly digest: Sha256; readonly path: string }[];
  readonly package: string;
  readonly path: string;
  readonly withheld: readonly { readonly path: string }[];
}

/**
 * An item document as a read carries it, `itemRowsOf`'s row: what opening it reads, its
 * document's read, its item's QTI `identifier`, which plate's seeds are drawn over (a salt, never
 * the item's name, which is its document), and the stimuli its refs name, each its own document's
 * read.
 */
export interface ItemRows extends DocumentRead {
  readonly identifier: string;
  readonly stimuli: readonly DocumentRead[];
}

/**
 * Write a document's XML, an item's or a stimulus's, from the rows its scan read, as pantry exports
 * it. The rows are the database's own, so a refusal is a defect.
 *
 * @param read The document's read.
 * @returns The document's bytes.
 */
const xmlOf = (read: DocumentRead) =>
  Effect.orDie(documentXml({ package: read.package, path: read.path }, read.document));

/**
 * Give the path in the package that a location of a PCI's module facts names, as plate's resolution
 * passes it on: as the item writes it, with `.js` appended to a module's unless it already ends in
 * `.js`. It is a path from the package's root, percent-decoded, whatever the item's directory, as
 * plate resolves all four of a PCI's module attributes (`assetPaths`, which sets the item's
 * location aside for them), by reading 201.
 *
 * @param item The item's path in its package.
 * @param location The location as the item writes it.
 * @returns The path, none for an `https:` URL, a path that climbs above the package's root or a
 *   value that is no URL.
 * @see QTI 3.0.1 implementation guide §3.7.12.2, of a module's location: "Otherwise it should be assumed to be a QTI
 *   content package relative path", the default configuration read from "<content package base
 *   href>/modules/module_resolution.js"; the information model of both configuration attributes, "Relative URLs
 *   indicate relative paths in the QTI content package" (§5.77.1, §5.77.2).
 */
const packagePathOf = (item: string, location: string): Option.Option<string> =>
  Option.fromUndefinedOr(assetPaths(item, "qti-interaction-module", "primary-path", location)[0]);

/**
 * Give the configuration files a PCI's resolution reads, by the paths plate's resolution asks for
 * them: each configuration file the PCI writes, else the schema's default, every one whether the
 * package holds it or not. Resolving with no file held asks for each and has no other effect, so
 * plate's resolution stays the one place those defaults are applied.
 *
 * @param modules The PCI's module facts as written.
 * @returns Each path its resolution asks for.
 */
const configurationsOf = (modules: PciModules): readonly string[] => {
  const asked = new Set<string>();

  resolvePciModules(
    modules,
    (path) => {
      asked.add(path);

      return Option.none();
    },
    () => true,
  );

  return [...asked];
};

/**
 * Read a PCI's configuration file as text from the application's content-addressed store, by the
 * SHA-256 of its bytes. The store is the application's own and keyed by that digest, and the
 * publish puts every file an item references before it publishes the item, so a file it holds no
 * bytes for is a defect.
 *
 * @param path The file's path in its package, which names its span.
 * @param digest The SHA-256 of its bytes.
 * @returns The file's text.
 */
const configurationText = Effect.fn("qti.item.pci.configuration")(function* configurationText(
  path: string,
  digest: Sha256,
) {
  yield* Effect.annotateCurrentSpan({ digest: digest.toHex(), path });

  const store = yield* MediaStore;
  const bytes = yield* Effect.orDie(store.get(digest));

  return new TextDecoder().decode(bytes);
});

/**
 * Give where the frame loads a module location from: a file the item references at its address, the
 * one kind of location plate's resolution keeps (it drops every absolute one, so a module loads no
 * script from outside the package). A package location the item references no file at has none: the
 * application serves only the files an item references, the manifest lists each of them (pantry
 * holds every reference to a file the manifest describes), and plate's resolution has already given
 * it its `pci-module-unlisted` notice.
 *
 * @param host The application's addresses.
 * @param item The item's path in its package.
 * @param digests Each file the item references, by its path, with the SHA-256 of its bytes.
 * @param location The location as plate's resolution gives it.
 * @returns The file's address, none where the item references no file there.
 */
const servedAt = (
  host: Host,
  item: string,
  digests: ReadonlyMap<string, Sha256>,
  location: string,
): Option.Option<string> =>
  packagePathOf(item, location).pipe(
    Option.flatMap((path) => Option.fromUndefinedOr(digests.get(path))),
    Option.map(host.mediaUrlOf),
  );

/**
 * Give the item's facts for plate's Portable Custom Interactions (`pci` of `HostFacts`): the host's
 * frame page as the loader, and, by the response each binds, every PCI's module routes, which
 * plate's resolution (`resolvePciModules`) gives from its module facts as written (`pciModulesIn`)
 * and the item's files, each location then mapped to where the frame loads it (`servedAt`). A
 * configuration file the item references is read from the store by its digest; one it references no
 * file at is absent. The manifest lists each file the item references, the only files whose digest
 * the application holds, so those are the files it calls listed. Each of the resolution's notices
 * is logged as a warning, naming the item and the response. An item with no PCI reads nothing.
 *
 * @param host The application's addresses.
 * @param accepted The item, accepted.
 * @param rows The item's read.
 * @returns The host facts.
 */
const pciFactsOf = Effect.fnUntraced(function* pciFactsOf(
  host: Host,
  accepted: Accepted,
  rows: ItemRows,
) {
  const item = rows.path;
  const digests = new Map(rows.files.map(({ digest, path }) => [path, digest] as const));
  const pcis = pciModulesIn(accepted);
  const configurations = new Set(
    pcis.flatMap(({ modules }) =>
      configurationsOf(modules).flatMap((written) => Option.toArray(packagePathOf(item, written))),
    ),
  );
  const held = [...configurations].flatMap((path) =>
    Option.toArray(Option.fromUndefinedOr(digests.get(path))).map((digest) => ({ digest, path })),
  );
  const read = yield* Effect.forEach(
    held,
    ({ digest, path }) =>
      Effect.map(configurationText(path, digest), (text) => [path, text] as const),
    { concurrency: "unbounded" },
  );
  const texts = new Map(read);
  const files = (written: string) =>
    Option.flatMap(packagePathOf(item, written), (path) => Option.fromUndefinedOr(texts.get(path)));
  const listed = (written: string) =>
    Option.exists(packagePathOf(item, written), (path) => digests.has(path));
  const served = (location: string) => servedAt(host, item, digests, location);
  const routed = yield* Effect.all(
    pcis.map(({ modules, response }) => {
      const resolution = resolvePciModules(modules, files, listed);

      return Effect.as(
        Effect.forEach(
          resolution.notices,
          (notice) =>
            Effect.logWarning("PCI module notice", {
              package: rows.package,
              path: rows.path,
              response,
              ...notice,
            }),
          { discard: true },
        ),
        [
          response,
          resolution.routes.map((route: ModuleRoute): PciModuleRoute => ({
            ...route,
            fallback: route.fallback.pipe(Option.flatMap(served)),
            primary: route.primary.pipe(Option.flatMap(served)),
          })),
        ] as const,
      );
    }),
  );

  return { pci: { loader: host.pciFrame, modules: new Map(routed) } } satisfies HostFacts;
});

/**
 * Open a stimulus an item's ref names, by plate from its XML, which pantry writes back from its
 * document's rows, at its own path in its package, as the item is.
 *
 * @param stimulus The stimulus's read.
 * @returns The stimulus, accepted; one plate gives no stimulus of dies as
 *   {@link StimulusNotRenderable}.
 * @see QTI 3.0.1 information model §4.3: "the shared stimulus content must be supplied in the same context for each of
 *   the Assessment Items that make use of it".
 */
const openStimulus = Effect.fn("qti.item.stimulus.open")(function* openStimulus(
  stimulus: DocumentRead,
) {
  const xml = yield* xmlOf(stimulus);
  const verdict = yield* openAdmitted(stimulus.path, xml);

  return yield* Effect.fromOption(acceptedStimulus(verdict)).pipe(
    Effect.mapError(() =>
      StimulusNotRenderable.make({
        package: stimulus.package,
        path: stimulus.path,
        verdict: verdict.verdict,
      }),
    ),
    Effect.orDie,
  );
});

/**
 * What an opening of an item names beyond its rows and the application's addresses: the
 * configuration's `seed`, which a shuffled interaction's order follows, the instance token its
 * form's entries are named under, and the supports enabled for its candidate. Whether a stage
 * validates responses is no part of it: the database's admission reads the session's policy.
 */
interface Opening {
  readonly instance: string;
  readonly seed: string;
  readonly supports: Supports;
}

/**
 * Open an item, by plate from its XML, which pantry writes back from the document's rows, at its
 * own path in its package, with the stimuli its refs name, each opened from its own document
 * (`openStimulus`). pantry admitted that XML at import, so plate opens it as admitted content and
 * loads none of its XSD tables. Each package file the item references is addressed by the digest of
 * its bytes, so plate writes every picture's address, writes none for a file the install withholds
 * and renders the item without it, and fails, naming the path, on one the item names that neither
 * list holds.
 *
 * @param rows The item's read.
 * @param opening How it is opened.
 * @param host The application's addresses.
 * @returns The served item; one plate does not render dies as {@link ItemNotRenderable}.
 */
const openItem = Effect.fn("qti.item.open")(function* openItem(
  rows: ItemRows,
  opening: Opening,
  host: Host,
) {
  const xml = yield* xmlOf(rows);
  const verdict = yield* openAdmitted(rows.path, xml);
  const accepted = yield* Effect.fromOption(acceptedItem(verdict)).pipe(
    Effect.mapError(() =>
      ItemNotRenderable.make({ package: rows.package, path: rows.path, verdict: verdict.verdict }),
    ),
    Effect.orDie,
  );
  const stimuli = yield* Effect.forEach(rows.stimuli, openStimulus, { concurrency: "unbounded" });
  const files = new Map(
    [...rows.files, ...rows.stimuli.flatMap((stimulus) => stimulus.files)].map(
      ({ digest, path }) => [path, digest] as const,
    ),
  );
  const withheld = new Set(
    [...rows.withheld, ...rows.stimuli.flatMap((stimulus) => stimulus.withheld)].map(
      ({ path }) => path,
    ),
  );
  const configuration = yield* configure({
    assets: [
      ...[...files].map(([path, digest]) => [path, host.mediaUrlOf(digest)] as const),
      ...[...withheld].map((path) => [path, null] as const),
    ],
    seed: opening.seed,
  }).pipe(Effect.orDie);

  return {
    configuration,
    instance: opening.instance,
    item: accepted,
    stimuli,
    supports: opening.supports,
  } satisfies ServedItem;
});

/**
 * The instance token a served item's form entries are named under: one stable token for every
 * attempt and render of an item session, since a page shows one item and the instance keys
 * processing's draws with the seed.
 */
const servedInstance = "served";

/**
 * Open an item session's item under the shuffle seed plate derives from its decision's seed and the
 * item's identity (`shuffleSeed`), which keys its shuffled interactions' order, the same on every
 * request.
 *
 * @param rows The item's read.
 * @param shuffle The item session's shuffle seed.
 * @param settings What the item session's stage and the database state of it.
 * @param settings.readAloud Whether it reads aloud, which enables its supports (`supportsOf`).
 * @param host The application's addresses.
 * @returns The served item.
 */
export const openServedItem = (
  rows: ItemRows,
  shuffle: string,
  settings: { readonly readAloud: boolean },
  host: Host,
) =>
  openItem(
    rows,
    {
      instance: servedInstance,
      seed: shuffle,
      supports: supportsOf(settings.readAloud),
    },
    host,
  );

/**
 * Open an item session's item as the database holds the session: under the shuffle seed plate
 * derives from its decision's seed and the item's identity (`shuffleSeed`, {@link openServedItem}),
 * with the record its first attempt starts from, the database's start of the session, in which its
 * template processing ran at the take (`begunOfRows`). The one opening of an item session,
 * whichever read found it.
 *
 * @param rows The item's read.
 * @param session What the database states of the item session.
 * @param session.readAloud Whether it reads aloud, which enables its supports (`supportsOf`).
 * @param session.seed The seed its decision drew.
 * @param session.start Its start, as a read attaches it: one row, so none is a defect.
 * @param host The application's addresses.
 * @returns The served item and the record its first attempt starts from.
 */
export const openSessionItem = Effect.fn("qti.item.session.open")(function* openSessionItem(
  rows: ItemRows,
  session: {
    readonly readAloud: boolean;
    readonly seed: string;
    readonly start: readonly StartRows[];
  },
  host: Host,
) {
  const shuffle = shuffleSeed(session.seed, { identifier: rows.identifier, package: rows.package });
  const served = yield* openServedItem(rows, shuffle, { readAloud: session.readAloud }, host);
  const start = yield* Effect.orDie(Effect.fromOption(Option.fromUndefinedOr(session.start[0])));
  const begun = yield* begunOfRows(served.item.item, start);

  return { begun, served };
});

/**
 * Give the entries that post some responses as each response's binding posts them.
 *
 * @param served The served item.
 * @param responses The responses, by identifier.
 * @returns The entries; a response they hold no value of posts none, so its control stays empty.
 */
export const entriesOf = ({ instance, item }: ServedItem, responses: Responses): PostedEntries =>
  postings(item, instance).flatMap(({ binding, identifier, options }) =>
    Option.match(Option.fromUndefinedOr(responses[identifier]), {
      onNone: () => [],
      onSome: (value) => encode(value, binding, options),
    }),
  );

/**
 * Give the entries that post the item's correct responses, plate's `solution` under the record's
 * correct responses in force, those its template processing set among them.
 *
 * @param served The served item.
 * @param record The database's record of the item session.
 * @returns The entries; a response with no correct response posts none.
 */
export const correctEntriesOf = (served: ServedItem, record: ItemRecord): PostedEntries =>
  entriesOf(served, solution(served.item, record));

/**
 * Give the item in plate's solution mode, as `record` shows it: every interaction as server markup
 * showing the item's correct responses in force, the record's, those its template processing set
 * among them, and its template values.
 *
 * @param served The served item.
 * @param record The database's record of the item session.
 * @returns `<Item>`'s props.
 */
export const solutionOf = (served: ServedItem, record: ItemRecord): ItemProps => ({
  ...served,
  mode: "solution",
  record,
  values: solution(served.item, record),
});

/**
 * Tell whether the item asks the child nothing: it has no control that posts a response, as a
 * lesson that is a video and its text has none, so the child only reads or watches it and goes on.
 *
 * @param served The served item.
 * @returns Whether it posts no response.
 */
export const asksNothing = ({ instance, item }: ServedItem): boolean =>
  postings(item, instance).length === 0;

/**
 * Give the item in plate's answering mode, as `record` shows it: each interaction its island,
 * holding no correct response, which reads and writes the entries the form's `<Responses>` holds,
 * and each Portable Custom Interaction run by the host facts `pciFactsOf` gives for the item's
 * rows. Only this mode reads the PCI facts: plate's review and solution show a PCI's response as
 * text, with no frame, so neither a review nor a solution reads a configuration file.
 *
 * @param served The served item.
 * @param rows The item's read.
 * @param record The database's record the next attempt starts from: the item session's start record
 *   before the first, else its record of the last attempt, whose outcomes show its feedback, a
 *   hint's among them, between attempts.
 * @param host The application's addresses.
 * @returns `<Item>`'s props.
 */
export const answeringOf = Effect.fn("qti.item.answering")(function* answeringOf(
  served: ServedItem,
  rows: ItemRows,
  record: ItemRecord,
  host: Host,
) {
  const facts = yield* pciFactsOf(host, served.item, rows);

  return { ...served, host: facts, mode: "answering", record } satisfies ItemProps;
});

/**
 * Give the entries an attempt's islands start from, each posting's `start`, plate's rendering rule
 * (spec reading 183): a Choice and an End Attempt start empty whatever their default, and every
 * other island at its response's default, the record's own where template processing set one, else
 * its declaration's, so a slider with a default shows it and the answer posts it until the child
 * changes it. Every attempt starts so, as a reload does: no draft is kept, and an End Attempt's
 * press, a hint's, is how its attempt ended, no response to carry into the next.
 *
 * @param served The served item.
 * @param record The database's record the attempt starts from.
 * @returns The starting entries.
 */
export const startingEntriesOf = (
  { instance, item }: ServedItem,
  record: ItemRecord,
): PostedEntries => postings(item, instance, record).flatMap(({ start }) => start);

/**
 * Give how the attempt a review shows did, as plate's review is handed it, from what the database
 * judged of it: where the review shows marks, its credit, which the review's verdict says; and
 * every mark of its responses' parts, revealing the solution where the review shows it, each
 * interaction marked right, wrong or missed, and else, where it shows marks, the candidate's own
 * answers alone, right or wrong, never a right answer they did not give (Bjorn, 2026-11-18). Plate
 * draws of the marks what the reveal says, so the missed marks are handed in either case. A review
 * that shows neither carries no credit and marks nothing; the item's feedback is no part of it
 * ({@link reviewOf}).
 *
 * @param shows What the review shows.
 * @param judged What the database judged of the attempt.
 * @returns What `<Item>` is handed as `graded`.
 */
const gradedOf = (shows: ReviewShows, judged: Judged): Graded => {
  const credit = shows.marks ? judged.credit : Option.none();
  const marks: Option.Option<NonNullable<Graded["marks"]>> = shows.solution
    ? Option.some({ parts: judged.marks, reveals: "solution" })
    : Option.map(Option.liftPredicate(shows.marks, Boolean), () => ({
        parts: judged.marks,
        reveals: "own" as const,
      }));

  return {
    ...Option.match(credit, { onNone: () => ({}), onSome: (kind) => ({ credit: kind }) }),
    ...Option.match(marks, { onNone: () => ({}), onSome: (marked) => ({ marks: marked }) }),
  };
};

/**
 * Give the item as the child answered it, in plate's review mode: every interaction as server
 * markup showing the responses the attempt ended with, the database's record of it, as plate's
 * `restore` shows each, through its interaction's own reading of a stored value, with what the
 * database judged of it where the review shows marks or the solution ({@link gradedOf}). Where the
 * review shows feedback, the item's feedback follows the outcomes the database's response
 * processing set. Where it hides it, the item as `begun`, its record before the first attempt,
 * shows it, its template values kept, so no feedback says how the answer did; the marks and the
 * verdict, where it shows them, are the review's own.
 *
 * @param served The served item.
 * @param records The item session's records.
 * @param records.begun Its record before the first attempt.
 * @param records.after The database's record of the reviewed attempt (`recordOfRows`).
 * @param shows What the review shows.
 * @param judged What the database judged of the attempt (`judgedOfRows`).
 * @returns `<Item>`'s props.
 * @see QTI 3.0.1 information model 7.19.2: "feedback is not shown. This includes both Modal Feedback and Integrated
 *   Feedback even if the candidate has access to the review state"; 7.19.3: its absence "is defined to be the version
 *   of the qti-item-body displayed to the candidate at the start of each attempt".
 */
export const reviewOf = (
  served: ServedItem,
  records: { readonly after: ItemRecord; readonly begun: ItemRecord },
  shows: ReviewShows,
  judged: Judged,
): ItemProps => ({
  ...served,
  graded: gradedOf(shows, judged),
  mode: "review",
  record: shows.feedback ? records.after : records.begun,
  values: restore(served.item, records.after).values,
});

/**
 * Read the child's responses from the entries the form posted, as each response's binding declares,
 * by identifier: a decoding, which judges nothing. The responses read are those of the interactions
 * the page shows under `record`, the record the attempt started from, which {@link answeringOf} and
 * {@link startingEntriesOf} were given: feedback and template content show or hide them by its
 * values, so an interaction the page shows only once feedback reveals it, as an adaptive item's
 * next part does, posts its response. A Text Entry's or a plain Extended Text's text of white space
 * alone is NULL (plate's `postings`, SV-DESIGN-05). Every End Attempt the page does not show under
 * that record, one inside hidden feedback among them, is `false`, whatever its default (plate's
 * `unpostedEndAttempts`; SV-RP-01).
 *
 * @param served The served item.
 * @param record The record the attempt started from, the one its page was rendered under.
 * @param entries The entries the form posted.
 * @returns The responses; a text that is no value of its base type fails as
 *   {@link AnswerUnreadable}.
 * @see QTI 3.0.1 information model §5.45: "If response processing is invoked in any other way ... then the associated
 *   response variable is set to 'false'. The default value of the response variable is always ignored."; §5.49, of an
 *   interaction inside hidden feedback: "The candidate must not be able to set or update the value of the associated
 *   response variables", which only the record the page shows tells.
 */
export const postedOf = Effect.fnUntraced(function* postedOf(
  { instance, item }: ServedItem,
  record: ItemRecord,
  entries: readonly Entry[],
) {
  const { own } = partition(entries, instance);
  const posted = yield* Effect.forEach(
    postings(item, instance, record),
    ({ binding, identifier, options }) =>
      Effect.fromResult(decode(own, binding, options)).pipe(
        Effect.mapBoth({
          onFailure: () => AnswerUnreadable.make({}),
          onSuccess: (value) => [identifier, value] as const,
        }),
      ),
  );

  return Object.fromEntries([
    ...unpostedEndAttempts(item, instance, record),
    ...posted,
  ]) satisfies Responses;
});
