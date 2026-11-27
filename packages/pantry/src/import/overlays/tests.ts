/**
 * The overlay rows of banks and assemblies (plan §1.7 O7, §C's `rowsOf`), each relation's rows a
 * keyed set.
 *
 * Two builders, as `#pantry/qti/tests.ts` has two layers:
 *
 * - {@link rowsOf} reads one document's view (`DocumentView` of `#pantry/import/fold.ts`) into its
 *   document-level rows: the document, its tokens, names, sites and stimulus refs, each href
 *   resolved as its `ReferencePath` is (`#pantry/import/overlays/package.ts`).
 * - {@link assembledRowsOf} reads every document's rows of one package into the assemblies: one
 *   instance tree per document that heads one, every assembled document no include splices in place
 *   (`splicingParents` and `IncludeRoot`, spec reading `fragment-placement`).
 *
 * The rows restate what the documents say and nothing else, and the database proves every one of
 * them (`testLaws`), so a row a builder gets wrong is refused, never accepted. Where a document
 * breaks a law, the builder still writes what the document says, so the law that refuses it is the
 * one its rows name: an inclusion cycle is cut where it closes, leaving the site that closes it
 * without the child it requires, so no instance repeats a document on its chain and the cycle's
 * law alone refuses it ("Inclusion cycle").
 */
import { Option } from "effect";
import { Bits } from "@bjornpagen/grizzle";
import type { Addition } from "@bjornpagen/grizzle";
import type { Kind } from "#pantry/grammar/compose.ts";
import { Flag, grammar } from "#pantry/grammar/install.ts";
import { isSite as isReadSite } from "#pantry/import/context.ts";
import { foldAt, governorOf } from "#pantry/import/fold.ts";
import type { AttributeIndex, DocumentView, Folds } from "#pantry/import/fold.ts";
import { namedBy, valueAt } from "#pantry/import/names.ts";
import { keyTextOf } from "#pantry/import/key-text.ts";
import type { ListedTarget } from "#pantry/import/context.ts";
import { comparedPathOf, entryPathOf, hrefResolverOf } from "#pantry/import/overlays/package.ts";
import type { Composed } from "#pantry/model/composed.ts";
import type { FlatRows, NodeRow } from "#pantry/model/xdm.ts";
import type {
  Inclusion,
  Instance,
  Named,
  Site,
  SitePath,
  SiteTarget,
  StimulusRef,
  AssembledDocument,
} from "#pantry/qti/tests.ts";
import {
  includeKind,
  itemRefKind,
  namedKinds,
  sectionKind,
  sectionRefKind,
  splicingParents,
  stimulusRefKind,
} from "#pantry/vocab/terms/tests.ts";

/**
 * Where one document stands in its package, as this builder reads it beside the document's view:
 * its package's manifest identifier, its entry's path, and the documents and entries of its package
 * by their paths, which a site's href names. It is the part of the importer's `DocumentPlace`
 * (Q5.15) this builder reads.
 */
export interface TestIds {
  /**
   * Whether the document is in an assembly, as the importer's contexts read it
   * (`#pantry/import/context.ts` `contextsOf`): a bank, or a document that holds a site or that a
   * site names.
   */
  readonly assembled: boolean;
  /**
   * Whether the package holds an entry at a path.
   */
  readonly entryAt: (path: string) => boolean;
  readonly package: Addition<typeof Site>["package"];
  readonly path: Addition<typeof Site>["path"];
  /**
   * The document a site's href names, with its root's kind and context, none where the path names
   * no listed document.
   */
  readonly targetAt: (path: string) => Option.Option<ListedTarget>;
}

/**
 * One document's overlay rows, one keyed set per relation: each map from the text of a row's key
 * in its relation ({@link keyTextOf}) to the row as its writer writes it. A row keyed by its
 * element is keyed by `(package, path, start)` ({@link elementKeyOf}); the document's own row by
 * `(package, path)`. So the rows of two documents of a package never meet at one key when the
 * merge unions every document's sets (`unionOf` of `#pantry/import/overlays/index.ts`).
 */
export interface TestRows {
  readonly AssembledDocument: ReadonlyMap<string, Addition<typeof AssembledDocument>>;
  readonly Inclusion: ReadonlyMap<string, Addition<typeof Inclusion>>;
  readonly Named: ReadonlyMap<string, Addition<typeof Named>>;
  readonly Site: ReadonlyMap<string, Addition<typeof Site>>;
  readonly SitePath: ReadonlyMap<string, Addition<typeof SitePath>>;
  readonly SiteTarget: ReadonlyMap<string, Addition<typeof SiteTarget>>;
  readonly StimulusRef: ReadonlyMap<string, Addition<typeof StimulusRef>>;
}

/**
 * The fields that name an element of a package, the key every relation of this module keyed by
 * its element holds: its package, its document's path and its start.
 */
type ElementPlace = Pick<Addition<typeof Site>, "package" | "path" | "start">;

/**
 * The text of the key of a row keyed by its element.
 *
 * @param place - The element's place, the row's own fields.
 * @returns The text of `(package, path, start)`.
 */
const elementKeyOf = (place: ElementPlace): string =>
  keyTextOf(place.package, place.path, place.start);

/**
 * Key a relation's rows, each by its element ({@link elementKeyOf}).
 *
 * @param rows - The rows, at most one per element.
 * @returns The keyed set.
 */
const byElement = <Row extends ElementPlace>(rows: readonly Row[]): ReadonlyMap<string, Row> =>
  new Map(rows.map((row) => [elementKeyOf(row), row] as const));

/**
 * Whether a kind is one of a list's.
 *
 * @param kinds - The list.
 * @param kind - The kind.
 * @returns Whether the list holds it.
 */
const among = (kinds: readonly string[], kind: string): boolean => kinds.includes(kind);

/**
 * Decide whether a site places the document it names (`SiteTarget.places`, spec readings
 * `inclusion-cycles` and `fragment-placement`): a section ref whose target's root is a section
 * (information model §7.5: "The only documents that can be refered to by qti-assessment-section-ref
 * are XML documents that contain a single qti-assessment-section as a single root"), or an include
 * that may stand for that document's root (`IncludeRoot`, reading `include-as-information-model`),
 * whatever its parent. A section ref to a document of any other root names it but places nothing,
 * and "Section ref target" refuses it; an include that may not stand for its target's root names it
 * but places nothing, and "Include root" alone refuses it.
 *
 * @param site - The site: its kind and its parent's kind.
 * @param root - The root kind of the document its href names.
 * @returns Whether it places it.
 */
const placesAt = (
  site: Pick<Addition<typeof Site>, "kind" | "parentKind">,
  root: string,
): boolean =>
  site.kind === sectionRefKind
    ? root === sectionKind
    : Option.isSome(
        Option.flatMap(
          grammar.include.includeSetOf.lookup({ parent: site.parentKind }),
          ({ set }) => grammar.include.includeMember.lookup({ kind: root, set }),
        ),
      );

/**
 * Decide whether a site splices the document it names in place (`Inclusion.splices`, spec reading
 * `fragment-placement`): it is an include under one of `splicingParents` that places that document,
 * as {@link placesAt} decides. An include under a section places its target whole, as a section ref
 * places its section document (reading `fragment-placement`).
 *
 * @param site - The site: its kind and its parent's kind.
 * @param root - The root kind of the document its href names.
 * @returns Whether it splices it.
 */
const splicesAt = (
  site: Pick<Addition<typeof Site>, "kind" | "parentKind">,
  root: string,
): boolean =>
  site.kind === includeKind && among(splicingParents, site.parentKind) && placesAt(site, root);

/**
 * One document as the builders read it: its flat rows and the indexes over them, each node by its
 * start.
 */
interface View {
  /**
   * Each node's attributes by name, a node that writes none absent.
   */
  readonly attributes: AttributeIndex;
  /**
   * Each node's kind, and its children in document order, every node held.
   */
  readonly byStart: ReadonlyMap<bigint, Held>;
  /**
   * Each node's fold under the document's context: its ancestry and nearest interaction among
   * them.
   */
  readonly folds: Folds;
  readonly ids: TestIds;
  readonly rows: FlatRows<Composed>;
}

/**
 * A node as the view holds it: its kind, and its children in document order.
 */
interface Held {
  readonly children: NodeRow<Composed>[];
  readonly kind: Kind;
}

/**
 * Read a node of the document: total, since {@link testViewOf} holds every node, each parent before
 * its children.
 *
 * @param byStart - The document's nodes.
 * @param start - The start of a node of the document.
 * @returns The node as the view holds it.
 * @throws {Error} When the document holds no node at that start: a defect of the caller, which read
 *   a node of another document, or a parent before it was held.
 */
const heldAt = (byStart: ReadonlyMap<bigint, Held>, start: bigint): Held => {
  const held = byStart.get(start);
  if (held === undefined) {
    throw new Error(
      `No node of the document read so far starts at ${start}, and the view holds each node of its document, each parent before its children. Read each node in its own document's view, in document order.`,
    );
  }

  return held;
};

/**
 * Read a document into its {@link View}.
 *
 * @param document - The document's view.
 * @param ids - Where it stands in its package.
 * @returns The view.
 * @throws {Error} When a node comes before its parent, which `flatten`'s document order rules out:
 *   a defect of the caller, never of the document.
 */
const testViewOf = (document: DocumentView, ids: TestIds): View => {
  const { rows } = document;
  const byStart = new Map<bigint, Held>();
  for (const node of rows.nodes) {
    byStart.set(node.start, { children: [], kind: node.kind });
    if (node.parent !== node.start) {
      heldAt(byStart, node.parent).children.push(node);
    }
  }

  return {
    attributes: document.attributes,
    byStart,
    folds: document.folds,
    ids,
    rows,
  };
};

/**
 * Read a node's parent's kind: the document node's own for the document node, its own parent.
 *
 * @param view - The document.
 * @param node - The node.
 * @returns Its parent's kind.
 */
const parentKindOf = (view: View, node: NodeRow<Composed>): Kind =>
  heldAt(view.byStart, node.parent).kind;

/**
 * Read a node's children, in document order.
 *
 * @param view - The document.
 * @param start - The node's start.
 * @returns Its children, none for a leaf.
 */
const childrenOf = (view: View, start: bigint): readonly NodeRow<Composed>[] =>
  heldAt(view.byStart, start).children;

/**
 * A node's tuple as a site copies it, beside its node's context.
 *
 * @param view - The document.
 * @param node - The node.
 * @returns Its tuple.
 */
const tupleOf = (view: View, node: NodeRow<Composed>) => ({
  kind: node.kind,
  nearest: foldAt(view.folds, node.start).nearest,
  package: view.ids.package,
  parent: node.parent,
  path: view.ids.path,
  start: node.start,
});

/**
 * The fields that name an element of the document: its package, its document's path and its start.
 *
 * @param view - The document.
 * @param node - The node.
 * @returns Its key's fields.
 */
const placeOf = (view: View, node: NodeRow<Composed>): ElementPlace => ({
  package: view.ids.package,
  path: view.ids.path,
  start: node.start,
});

/**
 * Read a node's identifier, its attribute's `value` as the database reads it ({@link valueAt};
 * `TestIdentifier` of `#pantry/qti/overlay-queries/tests.ts`), the form collapsed, as
 * `IdentifierDType`'s class is.
 */
type TokenOf = (node: NodeRow<Composed>) => Option.Option<string>;

/**
 * Write a document's names: a bank's root section and each item ref whose identifier names
 * something, with its identifier. One that writes none names nothing, so it has no row, and AL3
 * refuses it alone (spec reading `unidentified-parts`). One whose identifier is no NCName ({@link
 * namedBy}) names nothing either, so it has no row, and its value domain refuses it alone (spec
 * reading `ncname-names`, decision 457 (2)).
 *
 * @param view - The document.
 * @param token - Each node's identifier.
 * @returns The rows, by element.
 */
const namedOf = (view: View, token: TokenOf): ReadonlyMap<string, Addition<typeof Named>> =>
  byElement(
    view.rows.nodes
      .filter(({ kind }) => among(namedKinds, kind))
      .flatMap((node) =>
        Option.toArray(Option.flatMap(token(node), namedBy)).map((identifier) => ({
          ...placeOf(view, node),
          identifier,
        })),
      ),
  );

/**
 * Whether a node is a site: an include under a parent whose model holds an explicit include
 * particle (spec reading `include-as-information-model`), that pantry reads (spec reading
 * `inclusion-cycles`, `isSite` of `#pantry/import/context.ts`).
 *
 * @param view - The document.
 * @param node - The node.
 * @returns Whether it is.
 */
const isSite = (view: View, node: NodeRow<Composed>): boolean =>
  isReadSite(view, node, parentKindOf(view, node));

/**
 * An item ref's or a site's href, resolved as its `ReferencePath` is: its element (`package`,
 * `path`, `start`) and kind, `target`, the path it is compared by, in the element's own package,
 * whether that is the entry path it names (`resolved`), and whether it resolves outside the package
 * (`external`), as its `Reference`'s scope says. An href this representation does not resolve is
 * compared by its path as written, as a manifest href is (`comparedPathOf`, reading
 * `href-resolution`), and no `ReferencePath` holds it, so "Href form" refuses an item ref's; a
 * site's has no {@link SitePath}, and an external one marks its {@link Site} `external`.
 */
export interface ResolvedHref {
  readonly external: boolean;
  readonly kind: string;
  readonly package: TestIds["package"];
  readonly path: TestIds["path"];
  readonly resolved: boolean;
  readonly start: bigint;
  readonly target: string;
}

/**
 * Resolve a document's hrefs: each item ref's and site's that writes one, against the base in
 * scope, as `referenceRowsOf` resolves a `ReferencePath`. An item ref or a site with no href
 * has none: AL3 refuses an item ref without one, and an include without one names no document,
 * which its site's existence law refuses ("Include target", spec reading `include-target`).
 *
 * @param view - The document.
 * @returns The hrefs, by their element's start.
 */
const hrefsOf = (view: View): ReadonlyMap<bigint, ResolvedHref> => {
  const resolve = hrefResolverOf(view, view.ids.path);

  return new Map(
    view.rows.nodes.flatMap((node) =>
      node.kind === itemRefKind || isSite(view, node)
        ? Option.toArray(valueAt(view, node, "href")).map((href) => {
            const resolution = resolve(node.start, href);

            return [
              node.start,
              {
                ...placeOf(view, node),
                external: resolution.scope === "external",
                kind: node.kind,
                resolved: Option.isSome(entryPathOf(resolution)),
                target: comparedPathOf(resolution, href),
              },
            ] as const;
          })
        : [],
    ),
  );
};

/**
 * Resolve the hrefs of a document's item refs, which `ItemRefHref` copies: each item ref's path,
 * as its `ReferencePath` resolves it, whatever the document's root, so "Item ref target" judges
 * every item ref that names a path of the package.
 *
 * @param document - The document's view.
 * @param ids - Where it stands in its package.
 * @returns The item refs' hrefs, in document order.
 */
export const itemRefPathsOf = (document: DocumentView, ids: TestIds): readonly ResolvedHref[] =>
  [...hrefsOf(testViewOf(document, ids)).values()].filter(({ kind }) => kind === itemRefKind);

/**
 * Write a document's sites, whether or not each writes an href, and `external` where its href
 * resolves outside the package.
 *
 * @param view - The document.
 * @param hrefs - The document's hrefs.
 * @returns The rows, by element.
 */
const sitesOf = (
  view: View,
  hrefs: ReadonlyMap<bigint, ResolvedHref>,
): ReadonlyMap<string, Addition<typeof Site>> =>
  byElement(
    view.rows.nodes.flatMap((node) =>
      isSite(view, node)
        ? [
            {
              ...tupleOf(view, node),
              ancestry: Bits.of(Flag, [...foldAt(view.folds, node.start).ancestry]),
              children: BigInt(childrenOf(view, node.start).length),
              external: hrefs.get(node.start)?.external ?? false,
              governor: governorOf(node.kind, node.governs),
              nearestKind: foldAt(view.folds, node.start).nearestKind,
              nearestPath: Option.getOrElse(
                foldAt(view.folds, node.start).nearestPath,
                () => view.ids.path,
              ),
              parentKind: parentKindOf(view, node),
            },
          ]
        : [],
    ),
  );

/**
 * Write each site's {@link SitePath}: its href's path, and whether the package holds an entry
 * there, a row only where the site writes an href that resolves to a path of the package.
 * An href that resolves outside the package has none: its site is marked `external`, stored as
 * written and never fetched (spec reading `include-target`).
 *
 * @param view - The document.
 * @param sites - The document's sites.
 * @param hrefs - The document's hrefs.
 * @returns The rows, by element.
 */
const sitePathsOf = (
  view: View,
  sites: ReadonlyMap<string, Addition<typeof Site>>,
  hrefs: ReadonlyMap<bigint, ResolvedHref>,
): ReadonlyMap<string, Addition<typeof SitePath>> =>
  byElement(
    [...sites.values()].flatMap((site) =>
      Option.match(
        Option.filter(Option.fromNullishOr(hrefs.get(site.start)), ({ resolved }) => resolved),
        {
          onNone: () => [],
          onSome: (href) => [
            {
              entry: view.ids.entryAt(href.target),
              kind: site.kind,
              package: site.package,
              path: site.path,
              start: site.start,
              target: href.target,
            },
          ],
        },
      ),
    ),
  );

/**
 * Write each site's {@link SiteTarget}: the path of the document its href's path names, with that
 * document's root kind and context, and the site's fields the target's laws read. A site that
 * writes no href, or whose path names no listed document, has none.
 *
 * @param view - The document.
 * @param sites - The document's sites.
 * @param paths - The sites' paths.
 * @returns The rows, by element.
 */
const siteTargetsOf = (
  view: View,
  sites: ReadonlyMap<string, Addition<typeof Site>>,
  paths: ReadonlyMap<string, Addition<typeof SitePath>>,
): ReadonlyMap<string, Addition<typeof SiteTarget>> =>
  byElement(
    [...sites.values()].flatMap((site) =>
      Option.match(
        Option.flatMap(Option.fromNullishOr(paths.get(elementKeyOf(site))), (href) =>
          Option.map(view.ids.targetAt(href.target), (target) => ({ href, target })),
        ),
        {
          onNone: () => [],
          onSome: ({ href, target }) => [
            {
              ancestry: site.ancestry,
              kind: site.kind,
              nearest: site.nearest,
              nearestKind: site.nearestKind,
              package: site.package,
              parentKind: site.parentKind,
              path: site.path,
              places: placesAt(site, target.rootKind),
              splices: splicesAt(site, target.rootKind),
              start: site.start,
              target: href.target,
              targetNearest: target.context.nearest,
              targetNearestKind: target.context.nearestKind,
              targetNearestPath: Option.getOrElse(target.context.nearestPath, () => href.target),
              targetRoot: target.rootKind,
            },
          ],
        },
      ),
    ),
  );

/**
 * Write each include's {@link Inclusion}: its site's parent kind and target root, and the
 * include parent its parent's kind is. An include whose href names no document has no target, so
 * no root and no row.
 *
 * @param targets - The document's sites' targets.
 * @returns The rows, by element.
 */
const inclusionsOf = (
  targets: ReadonlyMap<string, Addition<typeof SiteTarget>>,
): ReadonlyMap<string, Addition<typeof Inclusion>> =>
  byElement(
    [...targets.values()].flatMap((site) =>
      site.kind === includeKind
        ? [
            {
              package: site.package,
              parentKind: site.parentKind,
              path: site.path,
              places: site.places,
              root: site.targetRoot,
              splices: site.splices,
              start: site.start,
            },
          ]
        : [],
    ),
  );

/**
 * Write a document's stimulus refs, each with its identifier ({@link TokenOf}), whatever the
 * document's root: a stimulus ref sits in an item. One that writes no identifier has no row, and
 * AL3 refuses it alone (spec reading `unidentified-parts`).
 *
 * @param view - The document.
 * @param token - Each node's identifier.
 * @returns The rows, by element.
 */
const stimulusRefsOf = (
  view: View,
  token: TokenOf,
): ReadonlyMap<string, Addition<typeof StimulusRef>> =>
  byElement(
    view.rows.nodes
      .filter(({ kind }) => kind === stimulusRefKind)
      .flatMap((node) =>
        Option.toArray(token(node)).map((identifier) => ({ ...placeOf(view, node), identifier })),
      ),
  );

/**
 * Keep a relation's rows where the document is in an assembly, and none otherwise.
 *
 * @param assembled - Whether the document is in an assembly ({@link TestIds}' `assembled`).
 * @param rows - The rows.
 * @returns The rows kept.
 */
const keptIf = <A>(assembled: boolean, rows: ReadonlyMap<string, A>): ReadonlyMap<string, A> =>
  assembled ? rows : new Map();

/**
 * Build the overlay rows of one document: its tokens, sites and stimulus refs whatever its root,
 * since every include's `href` is copied, an item's among them; and every other overlay's where the
 * document is in an assembly, none otherwise.
 *
 * An absent required attribute leaves out the row whose copy proves it (an item ref's or a site's
 * `href`, a name's or a stimulus ref's `identifier`), and AL3 refuses the element.
 *
 * @param document - The document's view.
 * @param ids - Where it stands in its package.
 * @returns Every overlay's rows.
 */
export const rowsOf = (document: DocumentView, ids: TestIds): TestRows => {
  const view = testViewOf(document, ids);
  const token: TokenOf = (node) => valueAt(view, node, "identifier");
  const hrefs = hrefsOf(view);
  const sites = sitesOf(view, hrefs);
  const paths = sitePathsOf(view, sites, hrefs);
  const targets = siteTargetsOf(view, sites, paths);

  return {
    AssembledDocument: keptIf(
      ids.assembled,
      new Map([[keyTextOf(ids.package, ids.path), { package: ids.package, path: ids.path }]]),
    ),
    Inclusion: inclusionsOf(targets),
    Named: keptIf(ids.assembled, namedOf(view, token)),
    Site: sites,
    SitePath: paths,
    SiteTarget: targets,
    StimulusRef: stimulusRefsOf(view, token),
  };
};

/**
 * A member instance as its tree writes it: every field its caller writes but its root fields, with
 * its own children nested.
 */
export type InstanceMember = Omit<Addition<typeof Instance>, "assembly" | "package"> & {
  readonly children: readonly InstanceMember[];
};

/**
 * An assembly's root instance as its tree writes it: its root fields, and its children nested.
 */
export type InstanceRoot = Addition<typeof Instance> & {
  readonly children: readonly InstanceMember[];
};

/**
 * A package's assemblies, one keyed set per relation, each row by the text of its key
 * ({@link keyTextOf}): each root instance by `(package, assembly)`, with its tree nested, and each
 * counted member by its relation's key.
 */
export interface AssembledRows {
  readonly Instance: ReadonlyMap<string, InstanceRoot>;
}

/**
 * One document's rows beside its root's kind, which its `Document` holds and no row of this module
 * copies: what {@link assembledRowsOf} reads of each document.
 */
export interface AssemblyInput {
  readonly rootKind: Kind;
  readonly rows: TestRows;
}

/**
 * A document that heads or joins an assembly: its `AssembledDocument` row, its root's kind and
 * every row it writes.
 */
interface AssemblyDocument extends AssemblyInput {
  readonly document: Addition<typeof AssembledDocument>;
}

/**
 * One instance as the builder walks an assembly: its document's path and that document's rows,
 * and its place in the tree's pre-order, which the tree draws the same way: `start` is its key.
 */
interface Walked {
  readonly document: string;
  readonly rows: TestRows;
}

/**
 * The walk of one assembly: its root's kind, and every document of the package that heads or joins
 * one by its path.
 */
interface Walk {
  readonly assemblyKind: Kind;
  readonly byDocument: ReadonlyMap<string, AssemblyDocument>;
}

/**
 * Place a document and one child per site of it that places its target (`SiteTarget.places`), each
 * the document the site names. A site that names no document of the package places nothing, and its
 * own laws refuse it; nor does an include that may not stand for its target's root, which "Include
 * root" alone refuses; nor does a site that names a document on the chain, the document itself
 * included, which would close an inclusion cycle: its instance holds fewer children than its
 * document has sites that place their target, which "Inclusion cycle" refuses, and no instance
 * repeats a document, whose placements would break the assembly's keys.
 *
 * @param walk - The assembly's walk.
 * @param chain - The paths of the documents of the instance's ancestors.
 * @param placed - The document it places.
 * @param fields - The instance's written fields but its root fields and its children.
 * @returns The instance as its tree writes it.
 */
const place = (
  walk: Walk,
  chain: readonly string[],
  placed: AssemblyDocument,
  fields: Omit<InstanceMember, "children">,
): InstanceMember => {
  const self: Walked = { document: fields.document, rows: placed.rows };

  const sites = [...self.rows.Site.values()].toSorted((a, b) => (a.start < b.start ? -1 : 1));
  const closing = new Set([...chain, self.document]);
  const children = sites.flatMap((site) =>
    Option.toArray(
      Option.flatMap(
        Option.filter(
          Option.fromNullishOr(self.rows.SiteTarget.get(elementKeyOf(site))),
          ({ places }) => places,
        ),
        ({ target }) => Option.fromNullishOr(walk.byDocument.get(target)),
      ),
    )
      .filter(({ document }) => !closing.has(document.path))
      .map((target) =>
        place(walk, [...chain, self.document], target, {
          assemblyKind: walk.assemblyKind,
          document: target.document.path,
          rootKind: target.rootKind,
          site: site.start,
          siteDocument: self.document,
        }),
      ),
  );

  return { ...fields, children };
};

/**
 * Build a package's assemblies from its documents' rows: one tree per document that heads one. A
 * document heads an assembly unless an include that splices it names it (`SiteTarget.splices`, spec
 * reading `fragment-placement`): a fragment such an include splices is judged where it is included,
 * in the assemblies of the documents that place it, and never alone. Every instance is named by its
 * assembly's path and its pre-order start, so the build is a function of the documents alone.
 *
 * @param documents - Every document's rows ({@link rowsOf}) of one package, each beside its root's
 *   kind.
 * @returns The assemblies' rows.
 */
export const assembledRowsOf = (documents: readonly AssemblyInput[]): AssembledRows => {
  const spliced = new Set(
    documents.flatMap(({ rows }) =>
      rows.SiteTarget.values()
        .filter(({ splices }) => splices)
        .map(({ target }) => target)
        .toArray(),
    ),
  );
  const assembledDocuments = documents.flatMap(({ rootKind, rows }) =>
    [...rows.AssembledDocument.values()].map((document): AssemblyDocument => ({
      document,
      rootKind,
      rows,
    })),
  );
  const byDocument = new Map(
    assembledDocuments.map((assembled) => [assembled.document.path, assembled] as const),
  );
  const roots = new Map<string, InstanceRoot>();
  for (const head of assembledDocuments.filter(({ document }) => !spliced.has(document.path))) {
    const { package: pkg, path } = head.document;
    const { rootKind } = head;
    const tree = place({ assemblyKind: rootKind, byDocument }, [], head, {
      assemblyKind: rootKind,
      document: path,
      rootKind,
      site: 0n,
      siteDocument: path,
    });
    roots.set(keyTextOf(pkg, path), { ...tree, assembly: path, package: pkg });
  }

  return { Instance: roots };
};
