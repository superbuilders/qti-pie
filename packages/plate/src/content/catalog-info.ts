/**
 * Catalog Resources: the item's `qti-catalog-info`, read into the item model as written and
 * resolved under the supports a host enables; the server shell presents what the resolution keeps
 * (`#plate/ui/item/contents/catalog.tsx`).
 *
 * A catalog is dormant alternative content outside the body. The item root's walk dispatches the
 * element to {@link catalogInfoModule}'s `parse`, which reads every catalog, card, entry and file
 * href as written. The resolution is the module's `redact`, which runs once the body is redacted,
 * a function of the redacted body's references and the supports alone, in the information model's
 * steps:
 *
 * 1. Supports: `Supports.catalog` names each enabled support, predefined or `ext:`.
 * 2. Reference: a catalog that no part of the redacted body names by `data-catalog-idref`
 *    (`ItemRedactKit.catalogReferences` in `#plate/content/contract.ts`) is dropped, so a catalog
 *    named only by content the page is not given, a feedback the values hide among it, never
 *    reaches the page or the redacted copy, and neither does one named only by a card's content.
 * 3. Card: for each enabled support, the catalog's card with that `support` (one at most; the database
 *    refuses a second).
 * 4. Direct content: a card with no entries gives its `qti-html-content` and its `qti-file-href`s.
 * 5. Entry selection: a card with entries gives the entry whose parameter matches the candidate's, for
 *    the four supports `Supports` carries a parameter for: `keyword-translation`, the entry's
 *    `xml:lang` against `keywordTranslationLanguage`; `sign-language`, its `xml:lang` against
 *    `signLanguage`; `spoken`, its `data-reading-type` against `readAloud`; `braille`, its
 *    `data-braille-type` against `braille`'s `brailleType`. A match is equality of the collapsed
 *    values, and a field that is none matches no entry. Every other support carries no parameter,
 *    so no entry matches and step 6 decides.
 * 6. Default: with no matching entry, the entry marked `default="true"`. With no default either, the
 *    sources stop, and plate's default is that the card gives nothing.
 * 7. File choice: among several `qti-file-href`, each is kept with its `mime-type`; none is picked,
 *    since no reading says which.
 * 8. Presentation: the sources stop at each support's own row. The payload gives the server shell each
 *    kept catalog's active cards and how many body elements reference it, and the shell presents
 *    them: a `glossary-on-screen` card beside each body element that references its catalog, a
 *    `spoken` card that gives audio ({@link spokenAudioOf}) as read-aloud's control beside each
 *    part that references its catalog while the candidate answers (spec reading
 *    `read-aloud-controls`), and every other card in a listing after the body. A body element's, a
 *    prompt's and a choice's references are the body's alike (spec reading
 *    `prompt-and-choice-catalogs`).
 * 9. Dormant otherwise: a card of a support the host did not enable, an entry not chosen and a catalog
 *    no reference names are in neither the page nor the redacted copy, withheld through the
 *    redaction kit.
 *
 * @module
 */
import { regex } from "arkregex";
import { Array as Arr, Option, pipe } from "effect";
import type { ContentRedactKit, ItemContentModule } from "#plate/content/contract.ts";
import { qtiNamespace } from "#plate/document/source.ts";
import type { SourceElement } from "#plate/document/source.ts";
import type { ReaderKit } from "#plate/interactions/contract.ts";
import { bodyAttributeOf, collapseXmlSpace } from "#plate/model/attributes.ts";
import type { BodyAttribute, BodyNode, Nodes, RedactedLevel } from "#plate/model/item.ts";
import { catalogSupports } from "#plate/supports.ts";
import type { CatalogSupport, ExtensionSupport, Supports } from "#plate/supports.ts";

/**
 * The QTI element Catalog Resources is read from.
 */
const element = "qti-catalog-info";

/**
 * One `qti-file-href` of a card or an entry: the file's href as written, a path in the package,
 * and its required `mime-type`. The server shell writes each as a link; no reading says which of
 * several a delivery picks, so plate picks none (step 7).
 */
export interface CatalogFile {
  readonly href: string;
  readonly mimeType: string;
}

/**
 * One `qti-card-entry` as written: its content, whether it designates itself the card's default,
 * its files, its `xml:lang`, and its other attributes in no namespace (the `data-*` parameters a
 * candidate's PNP aligns with), each as written. Only the chosen entry's content reaches the page.
 *
 * The module reads the element `checkAdmitted` secured: that step removes each attribute the XSD's
 * wildcard alone admits, but keeps every author `data-*` plate does not reserve (`isAuthorData` in
 * `#plate/vocabulary.ts`), so `attributes` holds `data-reading-type` and `data-braille-type` for
 * step 5's `spoken` and `braille` matches to read.
 */
interface CatalogEntryNode {
  readonly attributes: readonly BodyAttribute[];
  readonly content: readonly BodyNode[];
  readonly default: boolean;
  readonly files: readonly CatalogFile[];
  readonly lang: Option.Option<string>;
}

/**
 * A `qti-card` with no entries: its direct content and files (step 4), either or both of which may
 * be empty, as the XSD's sequence of an optional `qti-html-content` and any `qti-file-href`s
 * admits.
 */
interface DirectCardNode {
  readonly content: readonly BodyNode[];
  readonly files: readonly CatalogFile[];
  readonly kind: "direct";
  readonly lang: Option.Option<string>;
  readonly support: string;
}

/**
 * A `qti-card` of entries, one or more, which hold its content (steps 5 and 6).
 */
interface EntriesCardNode {
  readonly entries: Arr.NonEmptyReadonlyArray<CatalogEntryNode>;
  readonly kind: "entries";
  readonly lang: Option.Option<string>;
  readonly support: string;
}

/**
 * One `qti-card` of the item model, as the XSD's CardDType's choice gives it: its direct content
 * and files, or its entries, beside its `support` and its `xml:lang`, each as written.
 */
type CatalogCardNode = DirectCardNode | EntriesCardNode;

/**
 * One `qti-catalog` of the item model: its `id` as written and its cards in document order.
 */
interface CatalogNode {
  readonly cards: readonly CatalogCardNode[];
  readonly id: string;
}

/**
 * The model node of `qti-catalog-info`: the catalogs as read.
 */
interface CatalogInfoNode {
  readonly catalogs: readonly CatalogNode[];
}

/**
 * An active card as the page sees it: the card's `support` as written, the chosen content copied
 * into payload nodes, its files, and the language of what it shows, the chosen entry's `xml:lang`
 * when it has one and the card's otherwise.
 */
export interface CatalogCard {
  readonly content: Nodes<RedactedLevel>;
  readonly files: readonly CatalogFile[];
  readonly lang: Option.Option<string>;
  readonly support: string;
}

/**
 * One catalog the redaction keeps, as the page sees it: its `id`, its active cards in document
 * order, and how many parts of the redacted body reference it, at least one.
 */
export interface CatalogPayload {
  readonly cards: readonly CatalogCard[];
  readonly id: string;
  readonly references: number;
}

/**
 * What the redaction keeps of `qti-catalog-info`, which is the payload node too: the catalogs a
 * part of the redacted body names that keep an active card, each with its active cards alone.
 */
export interface CatalogInfoPayload {
  readonly catalogs: readonly CatalogPayload[];
}

/**
 * Give the key a catalog is found by: its `id`, or a body element's `data-catalog-idref`, collapsed
 * ({@link collapseXmlSpace}), as a `support`, an `id`, an `idref` and each matched parameter
 * compare by their collapsed values (reading R9-a), so a reference names a catalog exactly when the
 * two keys are equal.
 *
 * @param value The `id` or the `data-catalog-idref` as written.
 * @returns The key.
 */
export const catalogKey = (value: string): string => collapseXmlSpace(value);

/**
 * The support whose cards hold what a candidate hears read aloud: "the alternative content is to be
 * supplied for spoken content" (information model §8.38, SupportEnum).
 */
const spokenSupport = "spoken";

/**
 * Tell whether a card's file is audio: its `mime-type`'s top-level type is `audio`, compared
 * without regard to case, as RFC 2045 §5.1 compares a media type ("The type, subtype, and
 * parameter names are not case sensitive").
 *
 * @param file The file.
 * @returns Whether it is audio.
 */
const isAudio = (file: CatalogFile): boolean => regex("^audio/", "iu").test(file.mimeType);

/**
 * Give the audio an active card gives a candidate who hears content read aloud: a `spoken` card's
 * audio files, in document order, the pre-recorded "alternative to the written text provided in
 * the default content" (implementation guide §5.2.8.3, whose example stores each recording in more
 * than one audio format beside a file of another type). Several are one recording in several
 * formats, among which a browser plays the first it can (HTML's `source` selection), so plate
 * picks none (step 7). Empty for a card of any other support, and for a spoken card with no audio
 * file, whose content is text for a speech engine plate does not have.
 *
 * @param card The active card.
 * @returns Its audio files, in document order.
 */
export const spokenAudioOf = (card: CatalogCard): readonly CatalogFile[] =>
  catalogKey(card.support) === spokenSupport ? card.files.filter(isAudio) : [];

/**
 * The support whose cards are presented beside the terms that reference their catalog.
 */
const glossarySupport = "glossary-on-screen";

/**
 * Tell whether a card is a glossary card.
 *
 * @param card The card.
 * @returns Whether its collapsed `support` is `glossary-on-screen`.
 */
export const isGlossary = (card: CatalogCard): boolean =>
  catalogKey(card.support) === glossarySupport;

/**
 * Give the kept cards the page lists after the body, in document order: every kept card but two
 * kinds. A `spoken` card is for spoken support, never drawn on the page: it is the content a
 * candidate hears in place of the part that references its catalog, read aloud where it gives
 * audio ({@link spokenAudioOf}) and presenting nothing where it holds only text for a speech engine
 * plate does not have, so a reader's script, such as a stem's "Add. … blank", never reaches the
 * page as text (edullm-bd, 2026-11-22). A glossary card of a catalog a term of the body references
 * is presented beside that term instead.
 *
 * @param catalogs The kept catalogs, in document order.
 * @param presented The keys ({@link catalogKey}) of the catalogs a term of the body references,
 *   whose glossary cards the glossary presents.
 * @returns The cards listed, in document order.
 */
export const listedCards = (
  catalogs: readonly CatalogPayload[],
  presented: ReadonlySet<string>,
): readonly CatalogCard[] =>
  catalogs.flatMap((catalog) =>
    catalog.cards.filter(
      (card) =>
        catalogKey(card.support) !== spokenSupport &&
        !(isGlossary(card) && presented.has(catalogKey(catalog.id))),
    ),
  );

/**
 * Read an element's `xml:lang` as written.
 *
 * @param read The reader kit.
 * @param source The element.
 * @returns The language, none when the element writes none.
 */
const langOf = (read: ReaderKit, source: SourceElement): Option.Option<string> =>
  read.valueOf(source, "xml:lang");

/**
 * Read the `qti-file-href` children of a card or an entry.
 *
 * @param read The reader kit.
 * @param parent The card or entry.
 * @returns The files in document order.
 */
const filesOf = (read: ReaderKit, parent: SourceElement): readonly CatalogFile[] =>
  read.childrenNamed(parent, "qti-file-href").map((file) =>
    pipe(read.requiredValue(file, "mime-type"), (mimeType) => ({
      href: read.textOf(file),
      mimeType,
    })),
  );

/**
 * Read the content of a card's or an entry's first `qti-html-content`, as the body walk reads body
 * nodes: HTML as elements, MathML through its module, and any other `qti-*` element as the notice
 * the body walk gives it.
 *
 * @param read The reader kit.
 * @param parent The card or entry.
 * @returns The content, empty when the parent holds no `qti-html-content`.
 */
const contentOf = (read: ReaderKit, parent: SourceElement): readonly BodyNode[] => {
  const [html] = read.childrenNamed(parent, "qti-html-content");

  return html === undefined ? [] : read.nodes(html);
};

/**
 * Read one `qti-card-entry`.
 *
 * @param read The reader kit.
 * @param entry The entry.
 * @returns The entry node.
 */
const entryOf = (read: ReaderKit, entry: SourceElement): CatalogEntryNode => {
  const isDefault = read.xsBoolean(entry, "default", false);
  const content = contentOf(read, entry);
  const files = filesOf(read, entry);

  return {
    attributes: entry.attributes
      .filter((attribute) => attribute.namespace === "" && attribute.local !== "default")
      .map((attribute) => ({ name: attribute.local, value: attribute.value })),
    content,
    default: isDefault,
    files,
    lang: langOf(read, entry),
  };
};

/**
 * Read one `qti-card`.
 *
 * @param read The reader kit.
 * @param card The card.
 * @returns The card node.
 */
const cardOf = (read: ReaderKit, card: SourceElement): CatalogCardNode => {
  const support = read.requiredValue(card, "support");
  const lang = langOf(read, card);
  const entries = read.childrenNamed(card, "qti-card-entry").map((entry) => entryOf(read, entry));

  if (Arr.isReadonlyArrayNonEmpty(entries)) {
    return { entries, kind: "entries", lang, support };
  }

  const content = contentOf(read, card);
  const files = filesOf(read, card);

  return { content, files, kind: "direct", lang, support };
};

/**
 * Read one `qti-catalog`.
 *
 * @param read The reader kit.
 * @param catalog The catalog.
 * @returns The catalog node.
 */
const catalogOf = (read: ReaderKit, catalog: SourceElement): CatalogNode => {
  const id = read.requiredValue(catalog, "id");
  const cards = read.childrenNamed(catalog, "qti-card").map((card) => cardOf(read, card));

  return { cards, id };
};

/**
 * Tell whether a support name is one of the predefined vocabulary; an `ext:` support is none.
 *
 * @param support The collapsed support name.
 * @returns Whether the vocabulary holds it.
 */
const isPredefined = (support: string): support is CatalogSupport =>
  catalogSupports.some((name) => name === support);

/**
 * Tell whether a support name is one a host can enable: predefined, or an `ext:` extension. A
 * card whose `support` is neither (which the XSD refuses first) is enabled by no host.
 *
 * @param support The collapsed support name.
 * @returns Whether `Supports.catalog` can hold it.
 */
const isSupportName = (support: string): support is CatalogSupport | ExtensionSupport =>
  isPredefined(support) || support.startsWith("ext:");

/**
 * Tell whether the host enabled a card's support (step 1).
 *
 * @param supports The supports the host enabled.
 * @param support The card's `support` as written.
 * @returns Whether the card's collapsed support is among the enabled.
 */
const isEnabled = (supports: Supports, support: string): boolean => {
  const name = collapseXmlSpace(support);

  return isSupportName(name) && supports.catalog.has(name);
};

/**
 * Read one entry attribute, collapsed, none when the entry writes none.
 *
 * @param entry The entry.
 * @param name The attribute's name.
 * @returns The collapsed value.
 */
const parameterOf = (entry: CatalogEntryNode, name: string): Option.Option<string> =>
  Option.map(bodyAttributeOf(entry.attributes, name), collapseXmlSpace);

/**
 * The parameter of one support a card entry is chosen by (step 5): where the candidate's value
 * sits in the supports, and where an entry writes its own.
 */
interface Parameter {
  /**
   * Read the candidate's value from the supports, none when the field is none, which matches no
   * entry.
   *
   * @param supports The supports the host enabled.
   * @returns The candidate's value as the host wrote it.
   */
  readonly candidate: (supports: Supports) => Option.Option<string>;
  /**
   * Read the value an entry writes for the parameter, none when the entry writes none.
   *
   * @param entry The entry.
   * @returns The value as written.
   */
  readonly written: (entry: CatalogEntryNode) => Option.Option<string>;
}

/**
 * Read an entry's `xml:lang`, the parameter of the two language supports.
 *
 * @param entry The entry.
 * @returns The language as written.
 */
const writtenLang = (entry: CatalogEntryNode): Option.Option<string> => entry.lang;

/**
 * The four supports `Supports` carries a parameter for, by collapsed support name: a card of any
 * other support matches no entry, and its default alone decides (step 6).
 */
const parameters: ReadonlyMap<string, Parameter> = new Map<string, Parameter>([
  [
    "braille",
    {
      candidate: (supports) =>
        supports.braille.pipe(Option.flatMap((braille) => braille.brailleType)),
      written: (entry) => parameterOf(entry, "data-braille-type"),
    },
  ],
  [
    "keyword-translation",
    { candidate: (supports) => supports.keywordTranslationLanguage, written: writtenLang },
  ],
  ["sign-language", { candidate: (supports) => supports.signLanguage, written: writtenLang }],
  [
    "spoken",
    {
      candidate: (supports) => supports.readAloud,
      written: (entry) => parameterOf(entry, "data-reading-type"),
    },
  ],
]);

/**
 * Find the entry whose parameter equals the candidate's (step 5), the collapsed values compared.
 *
 * @param card The card of entries.
 * @param supports The supports the host enabled.
 * @returns The first matching entry, none when the support carries no parameter, the candidate
 *   set none, or no entry writes the candidate's value.
 */
const matchingEntry = (
  card: EntriesCardNode,
  supports: Supports,
): Option.Option<CatalogEntryNode> =>
  Option.fromUndefinedOr(parameters.get(collapseXmlSpace(card.support))).pipe(
    Option.flatMap((parameter) =>
      parameter.candidate(supports).pipe(
        Option.map(collapseXmlSpace),
        Option.flatMap((value) =>
          Option.fromUndefinedOr(
            card.entries.find((entry) =>
              parameter
                .written(entry)
                .pipe(Option.exists((written) => collapseXmlSpace(written) === value)),
            ),
          ),
        ),
      ),
    ),
  );

/**
 * Choose the entry a card with entries gives (steps 5 and 6): the one whose parameter matches the
 * candidate's, else the one marked default, else none, so the card gives nothing.
 *
 * @param card The card of entries.
 * @param supports The supports the host enabled.
 * @returns The chosen entry.
 */
const chosenEntry = (card: EntriesCardNode, supports: Supports): Option.Option<CatalogEntryNode> =>
  matchingEntry(card, supports).pipe(
    Option.orElse(() => Option.fromUndefinedOr(card.entries.find((entry) => entry.default))),
  );

/**
 * Every body node a card holds, its direct content or each entry's: what the redaction withholds
 * when the card stays dormant.
 *
 * @param card The card.
 * @returns Its content.
 */
const allContentOf = (card: CatalogCardNode): readonly BodyNode[] =>
  card.kind === "direct" ? card.content : card.entries.flatMap((entry) => entry.content);

/**
 * What a card shows once its entry is chosen: a direct card's content and files, or the chosen
 * entry's, with the entry's language when it names one and the card's otherwise.
 */
type Shown = Pick<DirectCardNode, "content" | "files" | "lang">;

/**
 * Choose what a card of entries shows (steps 5 and 6), withholding each entry not chosen, which
 * stays dormant.
 *
 * @param card The card of entries.
 * @param kit The redaction kit.
 * @returns What the chosen entry shows, none when the card chooses no entry.
 */
const chosenShown = (card: EntriesCardNode, kit: ContentRedactKit): Option.Option<Shown> => {
  const chosen = chosenEntry(card, kit.supports);
  for (const entry of card.entries) {
    if (!Option.contains(chosen, entry)) {
      kit.withhold(entry.content);
    }
  }

  return chosen.pipe(
    Option.map((entry) => ({
      content: entry.content,
      files: entry.files,
      lang: Option.orElse(entry.lang, () => card.lang),
    })),
  );
};

/**
 * Tell whether a card shows nothing: no content and no file, as the XSD admits an empty card, which
 * the reading admits ("A card holds an HTML content node, file hrefs, both, or nothing") and plate
 * neither lists nor copies.
 *
 * @param shown What the card shows.
 * @returns Whether it is empty.
 */
const isEmpty = (shown: Shown): boolean => shown.content.length === 0 && shown.files.length === 0;

/**
 * Resolve one card under the supports (steps 3 to 6): the active card, pruned to what it shows,
 * or none for a card the host did not enable, one that chooses no entry, or one that shows nothing
 * (no content and no file). The content of what is not shown is handed to the kit's `withhold`, and
 * the shown content is walked through its `nodes`.
 *
 * @param card The card as read.
 * @param kit The redaction kit.
 * @returns The active card, or none.
 */
const activeCard = (card: CatalogCardNode, kit: ContentRedactKit): Option.Option<CatalogCard> => {
  if (!isEnabled(kit.supports, card.support)) {
    kit.withhold(allContentOf(card));

    return Option.none();
  }

  const shown = card.kind === "direct" ? Option.some(card) : chosenShown(card, kit);

  return shown.pipe(
    Option.flatMap((kept) => {
      if (isEmpty(kept)) {
        kit.withhold(kept.content);

        return Option.none();
      }

      return Option.some({
        content: kit.nodes(kept.content),
        files: kept.files,
        lang: kept.lang,
        support: card.support,
      });
    }),
  );
};

/**
 * Count the redacted body's references to a catalog: each `data-catalog-idref` whose collapsed
 * token is the catalog's collapsed `id`.
 *
 * @param references Every `data-catalog-idref` of the redacted body, as written.
 * @param catalog The catalog.
 * @returns The count.
 */
const referencesTo = (references: readonly string[], catalog: Pick<CatalogNode, "id">): number => {
  const id = collapseXmlSpace(catalog.id);

  return references.filter((idref) => collapseXmlSpace(idref) === id).length;
};

/**
 * The Catalog Resources module: it reads the item's catalogs and keeps the active cards under the
 * enabled supports, each catalog with the count of the redacted body's parts that reference it. The
 * resolution steps and plate's defaults where the sources stop are stated at the module's head.
 */
export const catalogInfoModule: ItemContentModule<
  typeof element,
  CatalogInfoNode,
  CatalogInfoPayload,
  CatalogInfoPayload
> = {
  /**
   * Every active card's content, in order, which the server shell writes as it writes the body, so
   * its asset check and its heading shift read a card's content.
   */
  content: (payload) =>
    payload.catalogs.flatMap((catalog) => catalog.cards.flatMap((card) => card.content)),
  /**
   * Give the kept catalogs for the page, as the redaction kept them.
   */
  copy: (node) => node,
  element,
  namespace: qtiNamespace,
  normalise: (source) => source,
  /**
   * Read the element's catalogs as written.
   */
  parse: (source, context) =>
    pipe(
      context.read
        .childrenNamed(source, "qti-catalog")
        .map((catalog) => catalogOf(context.read, catalog)),
      (catalogs) => Option.some({ catalogs }),
    ),
  placement: "item",
  /**
   * Resolve the catalogs under the kit's supports: per catalog a part of the redacted body names
   * (`catalogReferences`), the active cards alone ({@link activeCard}) and the count of those
   * parts; a catalog no such part names, or that keeps no card, is dropped with its content
   * withheld; a node that keeps no catalog gives none.
   */
  redact: (node, kit) => {
    const catalogs = node.catalogs.flatMap((catalog): readonly CatalogPayload[] => {
      const references = referencesTo(kit.catalogReferences, catalog);
      if (references === 0) {
        for (const card of catalog.cards) {
          kit.withhold(allContentOf(card));
        }

        return [];
      }

      const cards = catalog.cards.flatMap((card) => Option.toArray(activeCard(card, kit)));

      return cards.length === 0 ? [] : [{ cards, id: catalog.id, references }];
    });

    return catalogs.length === 0 ? Option.none() : Option.some({ catalogs });
  },
};
