/**
 * Plate's UI's data, `@qti-pie/plate/ui/props`: the types of what a host hands `<Item>`, of how a
 * review graded the attempt it shows, and of the entries an item posts, for server code that builds
 * or reads them, such as the ledger's, without loading the UI. No module this entry reaches renders
 * anything: the UI's entries (`@qti-pie/plate/ui`, `@qti-pie/plate/ui/client`) reach every
 * interaction's island, whose browser libraries a server's program resolves to their server builds
 * (MathLive's `node` condition gives no `MathfieldElement`), so a program that imports the UI's
 * entries compiles the islands, and one that imports this entry compiles none of them.
 *
 * `@qti-pie/plate/ui` and `@qti-pie/plate/ui/client` export these same types, for the host that
 * renders.
 *
 * @module
 */
import type { Configuration } from "#plate/configuration.ts";
import type { Entry } from "#plate/form/encoding.ts";
import type { RedactRecord } from "#plate/model/record.ts";
import type { ResponseValue } from "#plate/model/values.ts";
import type { RenderMode } from "#plate/payload.ts";
import type { HostFacts } from "#plate/pci/host.ts";
import type { Supports } from "#plate/supports.ts";
import type { Graded } from "#plate/ui/item/context.ts";
import type { Accepted, AcceptedStimulus } from "#plate/validate/verdict.ts";
import type { OutcomeView } from "#plate/vocabulary.ts";

export type { Credit, Graded, GradedMarks, Reveals } from "#plate/ui/item/context.ts";

export type { AnswerMark, PartMark } from "#plate/ui/item/interactions/marks.ts";

/**
 * One posted entry, plate's `Entry` (`#plate/form/encoding.ts`): the name a response posts under,
 * from plate's `entryName`, and one text it posts. A response holding several values posts one
 * entry per value, in its order, so a bag repeats a text as often as it holds it and a sequence
 * keeps its order.
 */
export type PostedEntry = Entry;

/**
 * Every entry an item posts.
 */
export type PostedEntries = readonly PostedEntry[];

/**
 * What `<Item>` takes: the opened item, the configuration, the instance the host names, the mode,
 * the QTI database's results the page shows, and what the host knows of where the item's scripts
 * run.
 */
export interface ItemProps {
  /**
   * The configuration `configure` gives: the address of each file in `assets`, the `locale` of
   * plate's own text, the `seed` a shuffle is keyed by with the response, the
   * `headingLevel` the item's shallowest heading lands at, and the `outputBudget` its printed
   * text is held to.
   */
  readonly configuration: Configuration;
  /**
   * What the host knows and plate does not, which the interaction modules that need it read: a
   * Portable Custom Interaction's frame page and module routes (`pci`, `PciHostFacts`), without
   * which a PCI is plate's Notice part. A render input, never item data: none reaches the page but
   * what a module bakes into its own payload node. None when absent.
   */
  readonly host?: HostFacts;
  /**
   * The host's name for this use of the item, one per item session: it scopes every id and entry
   * name the item writes. A token `checkInstance` passes.
   */
  readonly instance: string;
  /**
   * The item `openAdmitted` accepted, as `acceptedItem` gives it.
   */
  readonly item: Accepted;
  /**
   * The state the item is shown in: `answering`, where each interaction is its island; `review`,
   * a recorded attempt; `solution`, the correct responses. In `review` and `solution` each
   * interaction is plain server markup and ships no JavaScript, but a Media, whose replay island
   * plays its media and posts nothing.
   */
  readonly mode: RenderMode;
  /**
   * The record of the attempt shown, such as `restore`'s `record` after `score`: its outcomes
   * decide the feedback shown and the printed variables' text, its template values the template
   * content and the choices shown. None shows the item as it reads with no record.
   */
  readonly record?: RedactRecord;
  /**
   * How the attempt a review shows did, read in `review` alone: the credit its feedback carries
   * where the host shows the review's feedback, and the marks it draws, the database's
   * `AttemptMark` rows of the attempt, revealing the solution where the host may show it
   * (`show-solution`), else marking the candidate's own answers alone. None marks nothing and
   * carries no credit.
   */
  readonly graded?: Graded;
  /**
   * The stimuli the item's stimulus refs name, each the `acceptedStimulus` of its document opened
   * by `openAdmitted` at its path in the package, with its files' addresses in the configuration's
   * `assets`: the shared content the candidate reads to answer the item (information model §7.6),
   * which plate reads no file to find. The host may hand more than the item names; one the item
   * names and the host does not hand is refused (`StimulusMissing`). None when absent.
   */
  readonly stimuli?: readonly AcceptedStimulus[];
  /**
   * The accessibility supports the host enabled for the candidate, none enabled when absent.
   */
  readonly supports?: Supports;
  /**
   * The responses shown, by response identifier: in `review` the candidate's (`restore`'s
   * `values`), in `solution` the correct ones (`solution`'s). None in `answering`, where the host's
   * `<Responses>` holds them.
   */
  readonly values?: Readonly<Record<string, ResponseValue>>;
  /**
   * The view the item is shown to, one of QTI's six, the candidate's when absent.
   */
  readonly view?: OutcomeView;
}
