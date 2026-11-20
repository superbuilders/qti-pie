/**
 * Catalog Resources (I-14) in the server shell: what the catalog module kept of the item's
 * catalogs for the supports the host enabled (`#plate/content/catalog-info.ts`), presented as the
 * information model's step 8 leaves to the delivery.
 *
 * - **Glossary on screen** (A-15): a `glossary-on-screen` card is presented beside each element of
 *   the body that references its catalog, as a native disclosure, `plate-glossary`: a `details`
 *   whose `summary` reads "Definition" and is named by that word and the term together, holding the
 *   card's content and a link to each of its files. The reader opens it by keyboard (Enter or Space
 *   on the focused `summary`) or pointer, with no script and no reveal on hover (WCAG 2.1.1,
 *   1.4.13); the browser gives the `summary` its role, name and expanded state (4.1.2). A `details`
 *   is flow content, which a `p` cannot hold, so it follows the term's enclosing block, the nearest
 *   element at a flow position at or above the term, in focus order (2.4.3); the term names it with
 *   `aria-details`. Plate writes no `open` and moves no focus (3.2.1).
 * - **Read aloud**: a `spoken` card that gives audio (`spokenAudioOf` in
 *   `#plate/content/catalog-info.ts`) is the recording of the part of the item that references its
 *   catalog, "the audio as an alternative to the written text provided in the default content"
 *   (implementation guide §5.2.8.3). While the candidate answers, it is presented as read-aloud's
 *   control (`ReadAloud` in `#plate/ui/read-aloud/read-aloud.tsx`) beside each part that references
 *   its catalog where a control can stand ({@link readAloudOf}): after an element of the body at a
 *   flow position, after an interaction's prompt, and beside a Choice's choice and an Order's
 *   choice in its bank. It is never listed: a recording is heard beside what it reads, and a list
 *   of recordings apart from their text, or of links to them, presents nothing a candidate can
 *   follow. A review and a solution present it nowhere, since their page ships no island but a
 *   Media's replay.
 * - **The listing**: every other kept card, and the glossary cards of a catalog no element of the
 *   body references (one referenced only from an interaction's own content, where a disclosure
 *   would sit inside a control), are listed after the body in `plate-catalog`, each card a
 *   `plate-catalog-card` carrying its `support` as `data-support` and its language as `lang`,
 *   holding its content and a link to each of its files.
 *
 * A card's file is written as a link whose text is the href as written and whose `href` is the
 * file's address in the configuration's `assets` ({@link missingInCatalog} lets `<Item>` refuse an
 * item one of whose files has none), with its `mime-type` as `type`.
 *
 * The walk (`#plate/ui/item/content.tsx`) hands the glossary its writer of body nodes, so this
 * file imports nothing of the walk.
 *
 * @module
 */
import { Array as Arr, Option, Result } from "effect";
import { createElement } from "react";
import type { Key, ReactNode } from "react";
import { catalogKey, spokenAudioOf } from "#plate/content/catalog-info.ts";
import type {
  CatalogCard,
  CatalogFile,
  CatalogInfoPayload,
  CatalogPayload,
} from "#plate/content/catalog-info.ts";
import { contentNodes, copyContent } from "#plate/content/modules.ts";
import { scopedId } from "#plate/form/encoding.ts";
import { message } from "#plate/messages.ts";
import type { Locale } from "#plate/messages.ts";
import { addressUrl, classifyUrl } from "#plate/model/url.ts";
import { isInteraction } from "#plate/model/interactions.ts";
import type { Addressing } from "#plate/ui/item/html.ts";
import { writtenTag } from "#plate/ui/item/html.ts";
import { authoredId } from "#plate/ui/item/ids.ts";
import { bodyAttributeOf } from "#plate/model/attributes.ts";
import type { BodyElement, RedactedLevel, RedactedNode } from "#plate/model/item.ts";
import { ReadAloud } from "#plate/ui/read-aloud/read-aloud.tsx";
import type { ReadAloudSource } from "#plate/ui/read-aloud/read-aloud.tsx";

/**
 * The support whose cards are presented beside the terms that reference their catalog.
 */
const glossarySupport = "glossary-on-screen";

/**
 * What the glossary gives a term of the body: the id its disclosure carries, which the term names
 * through `aria-details`, the term's own id, which the disclosure's `summary` is named by, and the
 * disclosure, written with the walk's writer of body nodes.
 */
export interface Glossed {
  /**
   * Write the term's disclosure, its content written by the walk.
   *
   * @param nodes The walk's writer of body nodes, at the position after the term's block.
   * @param key The disclosure's key among the nodes written after the block.
   * @returns The `plate-glossary` part.
   */
  readonly disclosure: (
    nodes: (content: readonly RedactedNode[]) => readonly ReactNode[],
    key: Key,
  ) => ReactNode;
  /**
   * The id the term's disclosure carries.
   */
  readonly details: string;
  /**
   * The id the term carries: its author's, scoped, or one plate gives it.
   */
  readonly term: string;
}

/**
 * The glossary of one page: what it gives each term of the body, none for an element that
 * references no catalog keeping a glossary card.
 */
export type Glossary = (element: BodyElement<RedactedLevel>) => Option.Option<Glossed>;

/**
 * Give the kept catalogs a payload holds.
 *
 * @param payloads The payload's `qti-catalog-info` nodes.
 * @returns The catalogs, in document order.
 */
const catalogsOf = (payloads: readonly CatalogInfoPayload[]): readonly CatalogPayload[] =>
  payloads.flatMap((payload) => payload.catalogs);

/**
 * Tell whether a card is a glossary card.
 *
 * @param card The card.
 * @returns Whether its collapsed `support` is `glossary-on-screen`.
 */
const isGlossary = (card: CatalogCard): boolean => catalogKey(card.support) === glossarySupport;

/**
 * Collect the elements of the body that reference a catalog, in document order: through every
 * element the walk writes, a module's container and the body content of a content node, and never
 * into an interaction, whose own content presents no disclosure.
 *
 * @param nodes The body nodes, as the redacted body holds them.
 * @returns The referencing elements.
 */
export const termsIn = (nodes: readonly RedactedNode[]): readonly BodyElement<RedactedLevel>[] =>
  nodes.flatMap((node): readonly BodyElement<RedactedLevel>[] => {
    if (isInteraction(node)) {
      return [];
    }

    switch (node.kind) {
      case "element": {
        if (!writtenTag(node.tag)) {
          return [];
        }

        return node.catalog === undefined
          ? termsIn(node.children)
          : [node, ...termsIn(node.children)];
      }
      case "container": {
        return termsIn(node.children);
      }
      case "content": {
        return termsIn(contentNodes(copyContent(node)));
      }
      case "text":
      case "unsupported": {
        return [];
      }
      default: {
        return node satisfies never;
      }
    }
  });

/**
 * Give the address of one of a card's files: its href resolved against the item's location and
 * written as the file's address in the configuration's `assets`.
 *
 * @param file The file.
 * @param addressing The item's location and the assets.
 * @returns The address; none when the URL is one `checkAdmitted` drops, which it never keeps, or
 *   one `assets` holds no address for, which {@link missingInCatalog} refuses first.
 */
const fileAddress = (
  file: CatalogFile,
  addressing: Pick<Addressing, "assets" | "document">,
): Option.Option<string> => {
  const url = classifyUrl("link", file.href);

  return url.kind === "dropped"
    ? Option.none()
    : Result.getSuccess(addressUrl(url, addressing.document, addressing.assets));
};

/**
 * Write one of a card's files as a link: its text the href as written, its `href` the file's
 * address, its `type` the `mime-type`.
 *
 * @param file The file.
 * @param addressing The item's location and the assets.
 * @param key The link's key.
 * @returns The link; one with no `href` when the file has no address ({@link fileAddress}).
 */
const fileLink = (file: CatalogFile, addressing: Addressing, key: Key): ReactNode =>
  createElement(
    "a",
    { href: Option.getOrUndefined(fileAddress(file, addressing)), key, type: file.mimeType },
    file.href,
  );

/**
 * What read-aloud gives one page: for a catalog a part of the item references, by its `id` as the
 * reference writes it, read-aloud's control for that catalog's spoken audio, named by the label
 * that says which part it reads and keyed among its siblings; none where the catalog keeps no
 * spoken card that gives audio, and none on a page that presents no read-aloud.
 */
export type ReadsAloud = (catalog: string, label: string, key: Key) => Option.Option<ReactNode>;

/**
 * The read-aloud of a page that presents none: a review's and a solution's, whose page ships no
 * island but a Media's replay.
 */
export const noReadAloud: ReadsAloud = () => Option.none();

/**
 * Build the read-aloud of a page the candidate answers: each kept catalog whose active `spoken`
 * card gives audio ({@link spokenAudioOf}), by its key, with that audio's files as their
 * addresses in `assets` and their `mime-type`s, in document order. A catalog holds one card of a
 * support at most (information model §5.26.1, "Use only one card for any particular named support
 * in a catalog", which the database holds), so it has one recording at most.
 *
 * @param payloads The payload's `qti-catalog-info` nodes.
 * @param addressing The item's location and the assets.
 * @returns The page's read-aloud.
 */
export const readAloudOf = (
  payloads: readonly CatalogInfoPayload[],
  addressing: Pick<Addressing, "assets" | "document">,
): ReadsAloud => {
  const recordings = new Map(
    catalogsOf(payloads).flatMap((catalog) =>
      catalog.cards.flatMap((card) => {
        const sources = spokenAudioOf(card).flatMap((file) =>
          Option.toArray(
            Option.map(fileAddress(file, addressing), (src): ReadAloudSource => ({
              src,
              type: file.mimeType,
            })),
          ),
        );

        return Arr.isReadonlyArrayNonEmpty(sources)
          ? [[catalogKey(catalog.id), sources] as const]
          : [];
      }),
    ),
  );

  return (catalog, label, key) =>
    Option.map(Option.fromUndefinedOr(recordings.get(catalogKey(catalog))), (sources) =>
      createElement(ReadAloud, { key, label, sources }),
    );
};

/**
 * Find the first file a kept card names that `assets` gives no address, so `<Item>` refuses the
 * item before it writes any of it, as it refuses one whose body names such a file.
 *
 * @param payloads The payload's `qti-catalog-info` nodes.
 * @param addressing The item's location and the assets.
 * @returns The file's path from the package root, or undefined when every file has an address.
 */
export const missingInCatalog = (
  payloads: readonly CatalogInfoPayload[],
  addressing: Pick<Addressing, "assets" | "document">,
): string | undefined => {
  for (const card of catalogsOf(payloads).flatMap((catalog) => catalog.cards)) {
    for (const file of card.files) {
      const url = classifyUrl("link", file.href);

      if (url.kind !== "dropped") {
        const missing = Result.getFailure(addressUrl(url, addressing.document, addressing.assets));

        if (Option.isSome(missing)) {
          return missing.value;
        }
      }
    }
  }

  return undefined;
};

/**
 * Build the glossary of a page: each term of the body ({@link termsIn}) whose catalog keeps a
 * glossary card is given an ordinal in document order, which its disclosure's id carries, and a
 * term with no id of its author's is given one of plate's.
 *
 * @param payloads The payload's `qti-catalog-info` nodes.
 * @param body The payload's body.
 * @param addressing The instance, the item's location and the assets.
 * @param locale The locale of plate's text.
 * @returns The glossary.
 */
export const glossaryOf = (
  payloads: readonly CatalogInfoPayload[],
  body: readonly RedactedNode[],
  addressing: Addressing,
  locale: Locale,
): Glossary => {
  const cards = new Map(
    catalogsOf(payloads).flatMap((catalog) =>
      catalog.cards.filter(isGlossary).map((card) => [catalogKey(catalog.id), card] as const),
    ),
  );
  const presented = new Map(
    termsIn(body)
      .flatMap((term) =>
        Option.toArray(
          Option.fromUndefinedOr(term.catalog).pipe(
            Option.flatMap((catalog) => Option.fromUndefinedOr(cards.get(catalogKey(catalog)))),
            Option.map((card) => [term, card] as const),
          ),
        ),
      )
      .map(([term, card], ordinal) => [term, { card, ordinal }] as const),
  );

  return (element) =>
    Option.map(Option.fromUndefinedOr(presented.get(element)), ({ card, ordinal }): Glossed => {
      const details = scopedId(addressing.instance, "glossary", ordinal);
      const term = Option.match(bodyAttributeOf(element.attributes, "id"), {
        onNone: () => scopedId(addressing.instance, "term", ordinal),
        onSome: (authored) => authoredId(addressing.instance, authored),
      });
      const summary = `${details}-summary`;

      return {
        details,
        disclosure: (nodes, key) =>
          createElement(
            "details",
            {
              "data-slot": "plate-glossary",
              "data-support": card.support,
              id: details,
              key,
              lang: Option.getOrUndefined(card.lang),
            },
            createElement(
              "summary",
              { "aria-labelledby": `${summary} ${term}`, id: summary },
              message(locale, "glossarySummary"),
            ),
            ...nodes(card.content),
            ...card.files.map((file, index) => fileLink(file, addressing, `file-${String(index)}`)),
          ),
        term,
      };
    });
};

/**
 * Write the listing after the body: each kept card but a glossary card presented beside a term and
 * a spoken card that gives audio, which read-aloud presents or nothing does ({@link readAloudOf}),
 * in document order, as a `plate-catalog-card` in `plate-catalog`; nothing when no card is listed.
 *
 * @param payloads The payload's `qti-catalog-info` nodes.
 * @param body The payload's body, whose terms the glossary presents.
 * @param nodes The walk's writer of body nodes, at a flow position.
 * @param addressing The instance, the item's location and the assets.
 * @returns The `plate-catalog` part, or nothing.
 */
export const listing = (
  payloads: readonly CatalogInfoPayload[],
  body: readonly RedactedNode[],
  nodes: (content: readonly RedactedNode[]) => readonly ReactNode[],
  addressing: Addressing,
): ReactNode => {
  const presented = new Set(
    termsIn(body).flatMap((term) => (term.catalog === undefined ? [] : [catalogKey(term.catalog)])),
  );
  const listed = catalogsOf(payloads).flatMap((catalog) =>
    catalog.cards.filter(
      (card) =>
        (!isGlossary(card) || !presented.has(catalogKey(catalog.id))) &&
        spokenAudioOf(card).length === 0,
    ),
  );

  return listed.length === 0
    ? undefined
    : createElement(
        "div",
        { "data-slot": "plate-catalog" },
        listed.map((card, index) =>
          createElement(
            "div",
            {
              "data-slot": "plate-catalog-card",
              "data-support": card.support,
              key: index,
              lang: Option.getOrUndefined(card.lang),
            },
            ...nodes(card.content),
            ...card.files.map((file, at) => fileLink(file, addressing, `file-${String(at)}`)),
          ),
        ),
      );
};
