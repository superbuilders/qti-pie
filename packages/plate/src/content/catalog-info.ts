/**
 * Catalog Resources: the item's `qti-catalog-info`, read into the item model as written and
 * resolved under the supports a host enables; the server shell presents what the resolution keeps
 * (`#plate/ui/item/contents/catalog.tsx`).
 *
 * A catalog is dormant alternative content outside the body. The item root's walk dispatches the
 * element to {@link catalogInfoModule}'s `parse`, which reads every catalog, card, entry and file
 * href as written, and takes the body's `data-catalog-idref` references from its context, since
 * the body walk collects them and drops the attribute from each element. The resolution is the
 * module's `redact`, a function of the item and the supports alone, in the information model's
 * steps:
 *
 * 1. Supports: `Supports.catalog` names each enabled support, predefined or `ext:`.
 * 2. Reference: a catalog that no element of the body names by `data-catalog-idref` is dropped.
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
 *    them: a `glossary-on-screen` card beside each body element that references its catalog, and
 *    every other card in a listing after the body.
 * 9. Dormant otherwise: a card of a support the host did not enable, an entry not chosen and a catalog
 *    no reference names are in neither the page nor the redacted copy, withheld through the
 *    redaction kit.
 *
 * @module
 */
import { Array as Arr, Option, pipe } from "effect";
import type {
  CatalogReference,
  ContentRedactKit,
  ItemContentModule,
} from "#plate/content/contract.ts";
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
 * The model node of `qti-catalog-info`: the catalogs as read, and the body's references to them
 * as the item root's walk handed them.
 */
interface CatalogInfoNode {
  readonly catalogs: readonly CatalogNode[];
  readonly references: readonly CatalogReference[];
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
 * One catalog the redaction keeps: its `id` and its active cards in document order.
 */
interface KeptCatalog {
  readonly cards: readonly CatalogCard[];
  readonly id: string;
}

/**
 * What the redaction keeps of `qti-catalog-info`: the catalogs a reference names that keep an
 * active card, each with its active cards alone, and the body's references, which `copy` counts.
 */
interface KeptCatalogInfo {
  readonly catalogs: readonly KeptCatalog[];
  readonly references: readonly CatalogReference[];
}

/**
 * One kept catalog as the page sees it: its `id`, its active cards in document order, and how many
 * elements of the body referenced it.
 */
export interface CatalogPayload {
  readonly cards: readonly CatalogCard[];
  readonly id: string;
  readonly references: number;
}

/**
 * The payload node of `qti-catalog-info`: the kept catalogs as the page sees them.
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
 * Count the body's references to a catalog: each `data-catalog-idref` whose collapsed token is the
 * catalog's collapsed `id`.
 *
 * @param node The model node.
 * @param catalog The catalog.
 * @returns The count.
 */
const referencesTo = (
  node: Pick<CatalogInfoNode, "references">,
  catalog: Pick<CatalogNode, "id">,
): number => {
  const id = collapseXmlSpace(catalog.id);

  return node.references.filter((reference) => collapseXmlSpace(reference.idref) === id).length;
};

/**
 * The Catalog Resources module: it reads the item's catalogs and keeps the active cards under the
 * enabled supports, each catalog with the count of body elements that reference it. The resolution
 * steps and plate's defaults where the sources stop are stated at the module's head.
 */
export const catalogInfoModule: ItemContentModule<
  typeof element,
  CatalogInfoNode,
  KeptCatalogInfo,
  CatalogInfoPayload
> = {
  /**
   * Every active card's content, in order, which the server shell writes as it writes the body, so
   * its asset check and its heading shift read a card's content.
   */
  content: (payload) =>
    payload.catalogs.flatMap((catalog) => catalog.cards.flatMap((card) => card.content)),
  /**
   * Give the kept catalogs for the page: each active card's content, and each catalog's reference
   * count in place of the references.
   */
  copy: (node) => ({
    catalogs: node.catalogs.map((catalog) => ({
      cards: catalog.cards,
      id: catalog.id,
      references: referencesTo(node, catalog),
    })),
  }),
  element,
  namespace: qtiNamespace,
  normalise: (source) => source,
  /**
   * Read the element's catalogs as written, and take the body's references from the context. The
   * references are copied first, so a `data-catalog-idref` inside card content, which the body
   * walk also collects, counts as no reference of the body.
   */
  parse: (source, context) => {
    const references = [...context.catalogReferences];

    return pipe(
      context.read
        .childrenNamed(source, "qti-catalog")
        .map((catalog) => catalogOf(context.read, catalog)),
      (catalogs) => Option.some({ catalogs, references }),
    );
  },
  placement: "item",
  /**
   * Resolve the catalogs under the kit's supports: per catalog a reference names, the active cards
   * alone ({@link activeCard}); a catalog no reference names, or that keeps no card, is dropped
   * with its content withheld; a node that keeps no catalog gives none.
   */
  redact: (node, kit) => {
    const catalogs = node.catalogs.flatMap((catalog) => {
      if (referencesTo(node, catalog) === 0) {
        for (const card of catalog.cards) {
          kit.withhold(allContentOf(card));
        }

        return [];
      }

      const cards = catalog.cards.flatMap((card) => Option.toArray(activeCard(card, kit)));

      return cards.length === 0 ? [] : [{ cards, id: catalog.id }];
    });

    return catalogs.length === 0
      ? Option.none()
      : Option.some({ catalogs, references: node.references });
  },
};
