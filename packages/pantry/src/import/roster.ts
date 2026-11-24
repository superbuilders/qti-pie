/**
 * The relations one package's import writes, by name: the relations `insertAll` takes over `Qti` at
 * its top level, committed here so that the importer names them without building the schema. The
 * writer inserts each, and the merge unions each by the one part of a relation it reads, its name.
 *
 * The list is held to the schema both ways. The type checker holds {@link writtenRelations} to
 * grizzle's `InsertAllRowsOf<typeof Qti>`: a name it lacks or one it does not take fails the build.
 * `roster.test.ts` holds it to `insertableNamesOf(Qti)` and to the relations the builders and the
 * writer write with a real package. A relation a module adds to the schema fails both until its
 * name is listed here.
 *
 * Each name is one keyed set of a package's inputs (`PackageInputs` of `#pantry/import/write.ts`):
 * the package's entries, `Package`, `Entry` and `Media` (`#pantry/import/record.ts`); each
 * document's tree, `Node`, with its nodes nested; the document layer's relations, which
 * `documentRowsOf` writes; and every overlay's.
 */
import type { InsertAllRowsOf } from "@bjornpagen/grizzle";
import { Struct } from "effect";
import type { Qti } from "#pantry/qti/schema.ts";

/**
 * A relation an import writes directly: one `insertAll` takes over `Qti` at its top level, every
 * stored relation of `Qti` but a sequence's member (a tree's nodes, an attribute's IDREF tokens and
 * the like), which is written nested at its owner's count field. A counted family's member, an
 * attribute or a namespace declaration, is a row of its own relation, written directly.
 */
export type WrittenName = keyof InsertAllRowsOf<typeof Qti>;

/**
 * Every relation an import writes directly, by its name, each as the name the merge reads
 * (`unionsOf` of `#pantry/import/overlays/index.ts`). Its `satisfies` makes the type checker refuse
 * a relation `insertAll` takes that it lacks, a name `insertAll` does not take, and an entry whose
 * name is not its key.
 */
export const writtenRelations = {
  AssembledDocument: { name: "AssembledDocument" },
  Attribute: { name: "Attribute" },
  AttributeEntity: { name: "AttributeEntity" },
  BindingName: { name: "BindingName" },
  BoundVariable: { name: "BoundVariable" },
  CandidatePath: { name: "CandidatePath" },
  CatalogScope: { name: "CatalogScope" },
  Choice: { name: "Choice" },
  ChoiceInteraction: { name: "ChoiceInteraction" },
  CnAttribute: { name: "CnAttribute" },
  CnCount: { name: "CnCount" },
  CnPartText: { name: "CnPartText" },
  CnSlot: { name: "CnSlot" },
  Comment: { name: "Comment" },
  ContextRef: { name: "ContextRef" },
  CountBound: { name: "CountBound" },
  DataSsml: { name: "DataSsml" },
  DataSsmlMember: { name: "DataSsmlMember" },
  DataSsmlProperty: { name: "DataSsmlProperty" },
  Doctype: { name: "Doctype" },
  Document: { name: "Document" },
  DocumentId: { name: "DocumentId" },
  ElementType: { name: "ElementType" },
  EncodingDecl: { name: "EncodingDecl" },
  Entry: { name: "Entry" },
  Expression: { name: "Expression" },
  FeedbackRef: { name: "FeedbackRef" },
  File: { name: "File" },
  FileOutside: { name: "FileOutside" },
  FilePath: { name: "FilePath" },
  FragmentContextName: { name: "FragmentContextName" },
  FragmentContextRef: { name: "FragmentContextRef" },
  FragmentFeedbackName: { name: "FragmentFeedbackName" },
  FragmentFeedbackRef: { name: "FragmentFeedbackRef" },
  FragmentPrintedName: { name: "FragmentPrintedName" },
  FragmentPrintedRef: { name: "FragmentPrintedRef" },
  FragmentScope: { name: "FragmentScope" },
  FragmentTemplateName: { name: "FragmentTemplateName" },
  FragmentTemplateRef: { name: "FragmentTemplateRef" },
  Hottext: { name: "Hottext" },
  IdentityText: { name: "IdentityText" },
  IdrefTarget: { name: "IdrefTarget" },
  Inclusion: { name: "Inclusion" },
  Instance: { name: "Instance" },
  Interaction: { name: "Interaction" },
  InteractionAttribute: { name: "InteractionAttribute" },
  ItemMode: { name: "ItemMode" },
  ItemRefDocument: { name: "ItemRefDocument" },
  ItemRefHref: { name: "ItemRefHref" },
  LabelUse: { name: "LabelUse" },
  LeastCount: { name: "LeastCount" },
  LinkReading: { name: "LinkReading" },
  Literal: { name: "Literal" },
  LiteralTyped: { name: "LiteralTyped" },
  MathAction: { name: "MathAction" },
  MathAlignGroup: { name: "MathAlignGroup" },
  MathAlignScope: { name: "MathAlignScope" },
  MathCell: { name: "MathCell" },
  MathCn: { name: "MathCn" },
  MathRank: { name: "MathRank" },
  Media: { name: "Media" },
  MostCount: { name: "MostCount" },
  Named: { name: "Named" },
  Namespace: { name: "Namespace" },
  Node: { name: "Node" },
  NumberedReading: { name: "NumberedReading" },
  OpenAttribute: { name: "OpenAttribute" },
  OpenAttributeEntity: { name: "OpenAttributeEntity" },
  OpenElementName: { name: "OpenElementName" },
  OpenElementType: { name: "OpenElementType" },
  Package: { name: "Package" },
  PciModuleForm: { name: "PciModuleForm" },
  Pi: { name: "Pi" },
  PlacedBinding: { name: "PlacedBinding" },
  PlacedChoice: { name: "PlacedChoice" },
  PlacedExpression: { name: "PlacedExpression" },
  PlacedHottext: { name: "PlacedHottext" },
  PlacedId: { name: "PlacedId" },
  PlacedIdref: { name: "PlacedIdref" },
  PlacedMathRank: { name: "PlacedMathRank" },
  PlacedShareTarget: { name: "PlacedShareTarget" },
  PlacedVariableRef: { name: "PlacedVariableRef" },
  PrintedVariableRef: { name: "PrintedVariableRef" },
  Processing: { name: "Processing" },
  Reference: { name: "Reference" },
  ReferencePath: { name: "ReferencePath" },
  ReferringDocument: { name: "ReferringDocument" },
  ResourceDocument: { name: "ResourceDocument" },
  ResourceHref: { name: "ResourceHref" },
  ResourceHrefOutside: { name: "ResourceHrefOutside" },
  ResourceHrefPath: { name: "ResourceHrefPath" },
  SdDecl: { name: "SdDecl" },
  ShareFragment: { name: "ShareFragment" },
  ShareTarget: { name: "ShareTarget" },
  Site: { name: "Site" },
  SitePath: { name: "SitePath" },
  SiteTarget: { name: "SiteTarget" },
  Srcset: { name: "Srcset" },
  SsmlScope: { name: "SsmlScope" },
  StimulusRef: { name: "StimulusRef" },
  TemplateRef: { name: "TemplateRef" },
  TextReference: { name: "TextReference" },
  TextReferencePath: { name: "TextReferencePath" },
  VariableRef: { name: "VariableRef" },
  XmlDecl: { name: "XmlDecl" },
} as const satisfies { readonly [Name in WrittenName]: { readonly name: Name } };

/**
 * The document layer's relations, which `documentRowsOf` of `#pantry/import/write.ts` writes for
 * each document: its `Document` row, its XML declaration's rows where it writes one, its elements'
 * attributes, closed and open, with their entity references, and their namespace declarations, its
 * comments', instructions' and doctypes' rows, its foreign elements' expanded names, its elements'
 * named governing types, and the type of the resource that lists it, where one does.
 */
export const documentLayerNames = [
  "Attribute",
  "AttributeEntity",
  "Comment",
  "Doctype",
  "Document",
  "ElementType",
  "EncodingDecl",
  "Namespace",
  "OpenAttribute",
  "OpenAttributeEntity",
  "OpenElementName",
  "OpenElementType",
  "Pi",
  "ResourceDocument",
  "SdDecl",
  "XmlDecl",
] as const satisfies readonly WrittenName[];

/**
 * The document layer's relations by name, as the merge reads them: `DocumentLayerRows` is read from
 * this record.
 */
export const documentLayer = Struct.pick(writtenRelations, documentLayerNames);

/**
 * Every overlay's relation, by its name: each written relation but the package's entries',
 * `Package`, `Entry` and `Media`, the tree's, `Node`, and the document layer's. `overlayRowsOf`
 * (`#pantry/import/overlays/index.ts`) unions `OverlayRows` over it, which the type checker holds
 * to name every relation of `OverlayRows`.
 */
export const overlayRelations = Struct.omit(writtenRelations, [
  "Entry",
  "Media",
  "Node",
  "Package",
  ...documentLayerNames,
]);
