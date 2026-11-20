/**
 * What the server shell hands the interactions' seam (`renderInteraction` in
 * `#plate/ui/item/interactions/index.tsx`) at each interaction of an item's body, beside the
 * interaction paired with its payload node and the mode: an island's context, and a review's.
 *
 * The shell renders plate's own redaction (`redact`) node for node, and pairs each interaction with
 * its payload node (`interactionPayload` in `#plate/payload.ts`), so by the time an interaction is
 * handed over the core has settled everything QTI and the host decide: the seeded shuffle (the
 * configuration's `seed`, the instance and the response), the entry name each response posts
 * under, the value each restores, and the template and feedback content the record shows.
 *
 * @module
 */
import type { Option } from "effect";
import type { ReactNode } from "react";
import type { TextEntryKeypad } from "#plate/configuration.ts";
import type { Credit } from "#plate/credit.ts";
import type { Locale } from "#plate/messages.ts";
import type { BodyElement, RedactedLevel, RedactedNode } from "#plate/model/item.ts";
import type { ResponseValue } from "#plate/model/values.ts";
import type { ReadsAloud } from "#plate/ui/item/contents/catalog.tsx";
import type { Writing } from "#plate/ui/item/html.ts";

/**
 * Where a run of content stands, which decides a notice's element: `phrasing`, a `span`, where
 * only phrasing content may stand (a prompt, a choice's content, a label); `flow`, a `div`, where
 * flow content may (the item body, gap match's sentence).
 */
export type Position = "flow" | "phrasing";

/**
 * How {@link IslandContext.content} writes a run of an interaction's own content.
 */
export interface ContentOptions {
  /**
   * Render an element the walk cannot render itself: it is called only for an element outside the
   * XSD's HTML subset (`htmlSubset` in `#plate/ui/item/html.ts`), such as gap match's `qti-gap`,
   * which an interaction owns. An element in the subset always renders the walk's way, its
   * children walked, and never reaches here.
   *
   * @param element The element as the redacted body holds it, its attributes and children as
   *   written.
   * @returns The node to stand in its place; undefined drops the element with its subtree, as the
   *   walk drops every element outside the subset when no `own` is given.
   */
  readonly own?: (element: BodyElement<RedactedLevel>) => ReactNode;
  /**
   * Where the content stands, `phrasing` by default.
   */
  readonly position?: Position;
  /**
   * Which writing of the content this is, `original` by default; `copy` for a second writing of
   * content the page shows elsewhere too, which writes none of the author's `id`s
   * (`Addressing.writing` in `#plate/ui/item/html.ts`).
   */
  readonly writing?: Writing;
}

/**
 * What an island is handed of the shell's context, beside its payload node and the redacted model
 * node: what the page may know of the render, and none of the server data the shell holds.
 *
 * It has no field for the item model, the record's outcomes, the values a review shows or the
 * solution, so an island's props, which are built from it, the payload node and the model node
 * alone, cannot hold a correct response, a mapping or a template value the redaction withheld:
 * the payload node holds none of them (`#plate/payload.ts`), the redacted body holds none
 * (`redactItem` copies no declaration), the model node of an interaction declares none, and its
 * module's `parse` reaches nothing of the declaration but its type (`BoundDeclaration` in
 * `#plate/interactions/contract.ts`), so a value of any type, a number as much as a string, has no
 * way in. An island reaches nothing else. The seam hands each island a fresh object of exactly
 * these fields (`islandContextOf` in `#plate/ui/item/interactions/index.tsx`), so not even a
 * spread of it carries more.
 */
export interface IslandContext {
  /**
   * The redacted body the render writes, which the shell's names and numberings read
   * (`#plate/ui/item/interactions/labels.ts`).
   */
  readonly body: readonly RedactedNode[];
  /**
   * The author's `class` on this interaction, as written, none when absent or left with no class
   * (`carriedClass` in `#plate/vocabulary.ts`): the island's root carries it, or the review
   * markup's root, since QTI's vocabulary classes (`qti-orientation-*`, `qti-labels-*`,
   * `qti-choices-stacking-*`) style the interaction.
   */
  readonly className: Option.Option<string>;
  /**
   * Write a run of the interaction's own content, a prompt, a choice's content or gap match's
   * sentence, as server React elements, with the body's mapping: the XSD's HTML subset and the
   * attributes it declares, `xml:lang` as `lang`, every id and IDREF scoped
   * (`#plate/ui/item/ids.ts`), every package URL as its address in the configuration's `assets`,
   * the item's heading shift, and a notice as plate's Notice part. An interaction among the nodes,
   * which QTI's schema admits nowhere in an interaction's content, is a defect.
   *
   * @param nodes The body nodes, in document order.
   * @param options The elements the interaction owns, and where the content stands.
   * @returns The content.
   */
  readonly content: (nodes: readonly RedactedNode[], options?: ContentOptions) => ReactNode;
  /**
   * The instance the host named, which scopes every id and entry name.
   */
  readonly instance: string;
  /**
   * The locale of plate's own text, which `message` in `#plate/messages.ts` writes the catalog in.
   */
  readonly locale: Locale;
  /**
   * Give read-aloud's control for a catalog a part of the interaction's own content references,
   * such as a Choice's choice, which the island writes beside that part (`readAloudOf` in
   * `#plate/ui/item/contents/catalog.tsx`): none while the candidate does not answer, and none for
   * a catalog that keeps no spoken card that gives audio.
   */
  readonly readAloud: ReadsAloud;
  /**
   * Read-aloud's control for the interaction's prompt, where its `qti-prompt` references a catalog
   * whose spoken card gives audio (`ModuleInteraction.promptCatalog` in
   * `#plate/interactions/contract.ts`) and the candidate answers, which `promptAt` writes after the
   * prompt (`#plate/ui/item/interactions/labels.ts`); none otherwise.
   */
  readonly spokenPrompt: Option.Option<ReactNode>;
  /**
   * The configuration's `textEntryKeypad`: whether a Text Entry's island shows an on-screen keypad
   * under its box.
   */
  readonly textEntryKeypad: TextEntryKeypad;
}

/**
 * What a review that marks the candidate's answers shows of the correct response: `solution`, all
 * of it, each part the candidate did not give marked `missed` and a Control's right answer written
 * after it; `own`, none of it, so only the candidate's own answers are marked, each right or wrong,
 * and no correct response they did not give appears. "A review that hides the solution marks only
 * the candidate's own response, right or wrong, and never reveals a correct response" (Bjorn's
 * restatement of plate's UI suite's M2, 2026-11-18; spec reading 230). The host shows the solution
 * only where the item session control lets the candidate see it (`show-solution`, information
 * model 7.19.4).
 */
export type Reveals = "own" | "solution";

/**
 * What a review marks the candidate's answers against: each response's correct response, by
 * response identifier, as `solution` gives them, and what the review shows of them.
 */
export interface GradedMarks {
  readonly against: Readonly<Record<string, ResponseValue>>;
  readonly reveals: Reveals;
}

/**
 * How the attempt a review shows did, as the host hands it to `<Item>` (`ItemProps.graded`): the
 * credit its verdict says, and what it marks the candidate's answers against. The review shows what
 * it is handed and grades nothing itself: it reads no score, and it judges no answer but against
 * the correct responses it is given.
 */
export interface Graded {
  /**
   * The credit the attempt earned, which the review's verdict says (`verdictOf` in
   * `#plate/ui/item/feedback.tsx`) and each feedback part it shows carries; absent, the review says
   * none, as where the host hides its feedback (`show-feedback`, information model 7.19.2) or the
   * item's scores cannot say.
   */
  readonly credit?: Credit;
  /**
   * What the review marks the candidate's answers against; absent, it marks none.
   */
  readonly marks?: GradedMarks;
}

/**
 * What a review or a solution shows of each response: `answers`, a review's, the candidate's
 * answers, marked against the correct responses the host handed (`against`, by response
 * identifier, empty where it handed none), showing of them what `reveals` says; `solution`, the
 * correct responses, which it marks nothing on. Only `<Item>`'s mode decides its kind
 * (`#plate/ui/item/item.tsx`).
 */
export type Shows =
  | {
      readonly against: ReadonlyMap<string, ResponseValue>;
      readonly kind: "answers";
      readonly reveals: Reveals;
    }
  | { readonly kind: "solution" };

/**
 * What the shell hands a review or a solution of an interaction: the island's context and the
 * server data a review reads besides. The seam hands it to a review alone; an island is handed its
 * {@link IslandContext}.
 */
export interface ReviewContext extends IslandContext {
  /**
   * What the render shows of each response, and what it marks the shown answers against.
   */
  readonly shows: Shows;
  /**
   * The responses shown, by response identifier: in `review` the candidate's, in `solution` the
   * correct ones.
   */
  readonly values: ReadonlyMap<string, ResponseValue>;
}
