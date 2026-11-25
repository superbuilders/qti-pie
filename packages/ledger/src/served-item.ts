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
 * they wrote ({@link reviewOf}). Nothing here decodes an answer either: a page posts its responses
 * typed, and the application decodes the post once at its boundary with plate's `PostedResponses`
 * (`@qti-pie/plate/codec`), reading nothing first. Nothing here decides what an item session takes
 * either: the database derives the control it is delivered under and whether it takes another
 * attempt (`#ledger/session-control.ts`), and every page of it shows what that derives, QTI 3.0.1's
 * rule ({@link showingOf}, {@link reviewShowsOf}), so a host passes it through and decides nothing.
 * The values an answer or a take writes, and those the reads give back, cross to plate through
 * `#ledger/served-values.ts`.
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
  noSupports,
  openAdmitted,
  pciModulesIn,
  resolvePciModules,
  restore,
  shownResponses,
  shuffleSeed,
  solution,
  startingResponses,
} from "@qti-pie/plate";
import type {
  Accepted,
  AcceptedStimulus,
  HostFacts,
  ItemRecord,
  ModuleRoute,
  PciModuleRoute,
  PciModules,
  Responses,
  Showing,
  Supports,
} from "@qti-pie/plate";
import type { Graded, ItemProps } from "@qti-pie/plate/ui/props";
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
 * What a review shows of an item, three switches, each independent of the others, which
 * {@link reviewShowsOf} derives from the item session's control and state:
 *
 * - `feedback`, QTI's show-feedback: the item's modal and integrated feedback, as the outcomes the
 *   database's response processing set show it (information model 7.19.2);
 * - `marks`: the database's marks on the candidate's own answers, each right or wrong, and the
 *   verdict its credit says;
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
 * The item-session control an item session is delivered under, as the database derives it
 * (`#ledger/session-control.ts` ItemSessionControl): a test member's its test's, by the nearest
 * scope, an item stage's the one the application's decision states. `maxAttempts` is QTI's
 * `max-attempts`, 0 no limit; `showFeedback` and `showSolution` are QTI's show-feedback and
 * show-solution, which govern the feedback and the solution once the session closes (information
 * model Tables 7.19.1 to 7.19.3).
 */
export interface SessionControl {
  readonly maxAttempts: bigint;
  readonly showFeedback: boolean;
  readonly showSolution: boolean;
}

/**
 * An item session's state, as the database derives it: `attempts`, the attempts QTI's
 * `numAttempts` counts; `left`, the attempts its max-attempts leaves it, none under max-attempts 0
 * and for an adaptive item, whose attempts its completion status limits; and `closed`, whether it
 * takes no further attempt (`ItemSessionOpen`): its last attempt made, an adaptive item completed,
 * or its sitting ended. A host draws "try again" or "done" from it, never by itself.
 */
export interface Session {
  readonly attempts: bigint;
  readonly closed: boolean;
  readonly left: Option.Option<bigint>;
}

/**
 * What the database states of an item session as it is served: the control it is delivered under
 * and its state, both derived from its facts ({@link sessionFactsOf}).
 */
export interface SessionFacts {
  readonly control: SessionControl;
  readonly session: Session;
}

/**
 * An item session's control as a read carries it, `#ledger/session-control.ts`
 * `sessionControlOf`'s row: the control, `open`, some exactly where the session takes another
 * attempt, `counted`, its counted attempts, one row where it has one, and `left`, one row where its
 * max-attempts leaves it a number of attempts.
 */
export interface SessionRow extends SessionControl {
  readonly counted: readonly { readonly attempts: bigint }[];
  readonly left: readonly { readonly left: bigint }[];
  readonly open: Option.Option<unknown>;
}

/**
 * Read an item session's control and state from the read that carries them, its one row. The rows
 * are the database's own, and every item session has its control ("Item stage control"), so none
 * is a defect.
 *
 * @param rows The session's control, `sessionControlOf`'s attachment.
 * @returns The session's facts.
 */
export const sessionFactsOf = (rows: readonly SessionRow[]) =>
  Effect.map(
    Effect.orDie(Effect.fromOption(Option.fromUndefinedOr(rows[0]))),
    (row): SessionFacts => ({
      control: {
        maxAttempts: row.maxAttempts,
        showFeedback: row.showFeedback,
        showSolution: row.showSolution,
      },
      session: {
        attempts: Option.match(Option.fromUndefinedOr(row.counted[0]), {
          onNone: () => 0n,
          onSome: ({ attempts }) => attempts,
        }),
        closed: Option.isNone(row.open),
        left: Option.map(Option.fromUndefinedOr(row.left[0]), ({ left }) => left),
      },
    }),
  );

/**
 * Tell whether an item session's page shows the feedback its record's outcomes select: while the
 * session is open, as between attempts and before the first, always, "A value of max-attempts
 * greater than 1, by definition, indicates that any applicable feedback must be shown"; once it
 * closed, where its show-feedback is true.
 *
 * @param facts The item session's control and state.
 * @returns Whether its feedback shows.
 * @see QTI 3.0.1 information model Table 7.19.1: "once the maximum number of allowed attempts have
 *   been used (or for adaptive items, completion-status has been set to completed) whether or not
 *   feedback is shown is controlled by the show-feedback constraint"; Table 7.19.2: "This
 *   constraint affects the visibility of feedback after the end of the last attempt".
 */
const feedbackShows = ({ control, session }: SessionFacts): boolean =>
  !session.closed || control.showFeedback;

/**
 * Give what a review of an item session shows: its feedback where {@link feedbackShows}; its marks
 * and verdict where its feedback shows or the session closed, since QTI's show-feedback and
 * show-solution govern the item's feedback and its solution, not the marks on the candidate's own
 * answers (edullm-bd, 2026-11-23: a test that leaves show-feedback at its default still shows the
 * child's marks after the last attempt); and its solution once the session closed, where its
 * show-solution is true.
 *
 * @param facts The item session's control and state.
 * @returns What the review shows.
 * @see QTI 3.0.1 information model Table 7.19.3, show-solution: "This constraint controls whether
 *   or not the system may provide the candidate with a way of entering the solution state. The
 *   default is 'false'".
 */
export const reviewShowsOf = (facts: SessionFacts): ReviewShows => {
  const feedback = feedbackShows(facts);

  return {
    feedback,
    marks: feedback || facts.session.closed,
    solution: facts.session.closed && facts.control.showSolution,
  };
};

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
 * configuration it is rendered with, the instance token its ids and its posted field are named
 * under, the stimuli its refs name, each accepted from its own document, and the supports enabled
 * for the candidate it is served to; what plate's `<Item>` takes in every mode.
 */
export type ServedItem = Pick<ItemProps, "configuration" | "instance" | "item"> & {
  readonly stimuli: readonly AcceptedStimulus[];
  readonly supports: Supports;
};

/**
 * An item session's item, opened ({@link openSessionItem}): the served item, with the control the
 * session is delivered under and its state as the database read them, which every page of it
 * shows by.
 */
export type SessionItem = ServedItem & SessionFacts;

/**
 * `<Item>`'s props for a page of an item session, with the session's state they were drawn under,
 * which the host draws its way on from.
 */
export type SessionProps = ItemProps & { readonly session: Session };

/**
 * `<Item>`'s props for a review of an item session's attempt, with the session's state after it and
 * what the review shows ({@link reviewShowsOf}).
 */
export type Review = SessionProps & { readonly shows: ReviewShows };

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
 * passes it on, a module's with its `.js` already given (R1, plate's `scriptLocationOf`): its file
 * by reading 201. It is a path from the package's root, percent-decoded, whatever the item's
 * directory, its query and fragment set aside, as plate resolves all four of a PCI's module
 * attributes (`assetPaths`, which sets the item's location aside for them).
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
 * configuration file the item references is read from the store by its digest, for its waits alone:
 * plate's resolution routes a module only from its own `primary-path` and `fallback-path`, never
 * from a configuration's `paths` (plate's R2, reading 246), the locations "Module held" holds to
 * files the delivery serves, and the law holds every configuration a PCI writes to one too, so a
 * stated wait is always read; one the item references no file at, the schema's default, is absent
 * and waits 7. The manifest lists each file the item references, the only files whose digest the
 * application holds, so those are the files it calls listed. Each of the resolution's notices is
 * logged as a warning, naming the item and the response. An item with no PCI reads nothing.
 * Exported as the one routing of an item's PCIs, which the delivery level's "Module held" is held
 * to by its test (`#ledger/module-held.db.test.ts`).
 *
 * @param host The application's addresses.
 * @param accepted The item, accepted.
 * @param rows The item's read.
 * @returns The host facts.
 */
export const pciFactsOf = Effect.fnUntraced(function* pciFactsOf(
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
 * configuration's `seed`, which a shuffled interaction's order follows, the instance token its ids
 * and its posted field are named under, and the supports enabled for its candidate. Whether a stage
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
 * The instance token a served item's ids and its posted field are named under: one stable token for
 * every attempt and render of an item session, since a page shows one item and the instance keys
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
 * @param session.control Its control and state, as a read attaches them ({@link sessionFactsOf}).
 * @param session.readAloud Whether it reads aloud, which enables its supports (`supportsOf`).
 * @param session.seed The seed its decision drew.
 * @param session.start Its start, as a read attaches it: one row, so none is a defect.
 * @param host The application's addresses.
 * @returns The session's item and the record its first attempt starts from.
 */
export const openSessionItem = Effect.fn("qti.item.session.open")(function* openSessionItem(
  rows: ItemRows,
  session: {
    readonly control: readonly SessionRow[];
    readonly readAloud: boolean;
    readonly seed: string;
    readonly start: readonly StartRows[];
  },
  host: Host,
) {
  const shuffle = shuffleSeed(session.seed, { identifier: rows.identifier, package: rows.package });
  const opened = yield* openServedItem(rows, shuffle, { readAloud: session.readAloud }, host);
  const facts = yield* sessionFactsOf(session.control);
  const start = yield* Effect.orDie(Effect.fromOption(Option.fromUndefinedOr(session.start[0])));
  const begun = yield* begunOfRows(opened.item.item, start);

  return { begun, served: { ...opened, ...facts } satisfies SessionItem };
});

/**
 * What a page is shown by that has no record: the item as it reads with none, its template content
 * withheld, and no feedback, which only a record's outcomes could show.
 */
const unrecorded: Showing = { showFeedback: false };

/**
 * Give what an item session's page is shown by while the child answers it, and in its solution:
 * the record the attempt starts from, whose outcomes show its feedback, a hint's among them, where
 * the session's feedback shows ({@link feedbackShows}: while it is open, and once it closed under
 * show-feedback true), and else the record with no feedback, so the page the child answers, the
 * entries it starts from and the responses it posts all read the same.
 *
 * @param facts The item session's control and state.
 * @param record The database's record.
 * @returns What the page is shown by.
 */
export const showingOf = (facts: SessionFacts, record: ItemRecord): Showing =>
  feedbackShows(facts) ? { record, showFeedback: true } : { record, showFeedback: false };

/**
 * Lay values over an attempt's start: each response the start holds, at the value given where one
 * is, else at its start, so the result names exactly the responses the page posts.
 *
 * @param start The attempt's start.
 * @param values The values laid over it, by identifier.
 * @returns The responses.
 */
const laidOver = (start: Responses, values: Responses): Responses =>
  Object.fromEntries(
    Object.entries(start).map(([identifier, value]) => [
      identifier,
      (Object.hasOwn(values, identifier) ? values[identifier] : undefined) ?? value,
    ]),
  );

/**
 * Give the responses an attempt's islands start from, plate's `startingResponses` under the record
 * the attempt starts from (spec reading 183): every response the page shows at its start, a Choice
 * and an End Attempt empty whatever their default, every other island at its response's default,
 * the record's own where template processing set one, else its declaration's, so a slider with a
 * default shows it and the answer posts it until the child changes it; and every End Attempt
 * response of the item at `false`, the one whose press ends the attempt posting `true`. Every
 * attempt starts so, as a reload does: no draft is kept, and an End Attempt's press, a hint's, is
 * how its attempt ended, no response to carry into the next. A host starts its `<Responses>` from
 * plate's `heldOf` of these. The page shows them under the session's control ({@link showingOf}),
 * as {@link answeringOf} shows the item, so the responses it starts from are those it shows.
 *
 * @param served The session's item.
 * @param record The database's record the attempt starts from.
 * @returns The responses.
 */
export const startingOf = (served: SessionItem, record: ItemRecord): Responses =>
  startingResponses(served.item, showingOf(served, record));

/**
 * Give the responses an attempt resumes from: a save's values laid over its start
 * ({@link startingOf}), so a default the child cleared stays cleared, and a response the save does
 * not hold, one the page shows only now, starts as a fresh attempt's does.
 *
 * @param served The session's item.
 * @param record The database's record the attempt starts from.
 * @param saved The save's responses, the database's (`responsesOfRows`).
 * @returns The responses.
 */
export const resumedOf = (served: SessionItem, record: ItemRecord, saved: Responses): Responses =>
  laidOver(startingOf(served, record), saved);

/**
 * Give the responses that answer the item rightly, plate's `solution` under the record's correct
 * responses in force, those its template processing set among them, laid over the attempt's start
 * ({@link startingOf}): a response with no correct response stays at its start.
 *
 * @param served The session's item.
 * @param record The database's record of the item session.
 * @returns The responses.
 */
export const correctOf = (served: SessionItem, record: ItemRecord): Responses =>
  laidOver(startingOf(served, record), solution(served.item, record));

/**
 * Give the item in plate's solution mode, as `record` shows it under the session's control
 * ({@link showingOf}): every interaction as server markup showing the item's correct responses in
 * force, the record's, those its template processing set among them, and its template values.
 *
 * @param served The session's item.
 * @param record The database's record of the item session.
 * @returns `<Item>`'s props.
 */
export const solutionOf = (served: SessionItem, record: ItemRecord): SessionProps => ({
  ...served,
  ...showingOf(served, record),
  mode: "solution",
  values: solution(served.item, record),
});

/**
 * Tell whether the item asks the child nothing: no interaction it shows writes a response, as a
 * lesson that is a video and its text has none, so the child only reads or watches it and goes on.
 *
 * @param served The served item.
 * @returns Whether it shows no response.
 */
export const asksNothing = ({ item }: ServedItem): boolean =>
  shownResponses(item, unrecorded).length === 0;

/**
 * Give the item in plate's answering mode, as `record` shows it under the session's control
 * ({@link showingOf}): each interaction its island, holding no correct response, which reads and
 * writes the responses the host's `<Responses>` holds, and each Portable Custom Interaction run by
 * the host facts `pciFactsOf` gives for the item's rows. Only this mode reads the PCI facts:
 * plate's review and solution show a PCI's response as text, with no frame, so neither a review nor
 * a solution reads a configuration file.
 *
 * @param served The session's item.
 * @param rows The item's read.
 * @param record The database's record the next attempt starts from: the item session's start record
 *   before the first, else its record of the last attempt, whose outcomes show its feedback, a
 *   hint's among them, between attempts.
 * @param host The application's addresses.
 * @returns `<Item>`'s props, with the session's state.
 */
export const answeringOf = Effect.fn("qti.item.answering")(function* answeringOf(
  served: SessionItem,
  rows: ItemRows,
  record: ItemRecord,
  host: Host,
) {
  const facts = yield* pciFactsOf(host, served.item, rows);

  return {
    ...served,
    ...showingOf(served, record),
    host: facts,
    mode: "answering",
  } satisfies SessionProps;
});

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
 * Give the item as the child answered it, in plate's review mode, as the item session's control and
 * its state after the attempt show it ({@link reviewShowsOf}): every interaction as server markup
 * showing the responses the attempt ended with, the database's record of it, as plate's `restore`
 * shows each, through its interaction's own reading of a stored value, with what the database
 * judged of it where the review shows marks or the solution ({@link gradedOf}). Where the review
 * shows feedback, the item's feedback follows the outcomes the database's response processing set.
 * Where it hides it, no feedback shows (plate's `showFeedback` `false`), and the item as `begun`,
 * its record before the first attempt, shows the rest, its template values kept, so nothing says
 * how the answer did; the marks and the verdict, where it shows them, are the review's own.
 *
 * @param served The served item.
 * @param records The item session's records.
 * @param records.begun Its record before the first attempt.
 * @param records.after The database's record of the reviewed attempt (`recordOfRows`).
 * @param judged What the database judged of the attempt (`judgedOfRows`).
 * @param facts The item session's control and its state after the attempt, as the write that
 *   recorded it reads them back ({@link sessionFactsOf}).
 * @returns `<Item>`'s props, with the session's state and what the review shows.
 * @see QTI 3.0.1 information model 7.19.2: "feedback is not shown. This includes both Modal Feedback and Integrated
 *   Feedback even if the candidate has access to the review state"; 7.19.3: its absence "is defined to be the version
 *   of the qti-item-body displayed to the candidate at the start of each attempt".
 */
export const reviewOf = (
  served: ServedItem,
  records: { readonly after: ItemRecord; readonly begun: ItemRecord },
  judged: Judged,
  facts: SessionFacts,
): Review => {
  const shows = reviewShowsOf(facts);

  return {
    ...served,
    graded: gradedOf(shows, judged),
    mode: "review",
    ...(shows.feedback
      ? { record: records.after, showFeedback: true }
      : { record: records.begun, showFeedback: false }),
    session: facts.session,
    shows,
    values: restore(served.item, records.after).values,
  };
};
