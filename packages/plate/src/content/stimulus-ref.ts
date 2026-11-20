/**
 * Shared stimuli: each `qti-assessment-stimulus-ref` of the item, read into the item model, and
 * delivered with the item, its stimulus written beside the item's body or inside the element that
 * names it (`#plate/ui/item/contents/stimulus.tsx`).
 *
 * "This is the structure that enables reference to a 'qti-assessment-stimulus' instance. The
 * stimulus must be contained within its own instance and so the Item uses the
 * 'qti-assessment-stimulus-ref' structure to provide the link between the Item and the Stimulus"
 * (information model §7.6). Its `identifier` is "The unique identifier for the stimulus reference"
 * (§7.6.1), and its `href` "The uri used to refer to the stimulus file (e.g. elsewhere in the same
 * content package). There is no requirement that this be unique. Several items may refer to the
 * same stimulus" (§7.6.2). The item's refs are "[0.. unbounded]": "The set of identifier
 * references to the stimulus content that should be associated with the Item. Each identifier must
 * resolve to some AssessmentStimulus object that has been associated with the Item" (§4.1.15).
 *
 * The item root's walk dispatches the element to {@link stimulusRefModule}'s `parse`, which reads
 * the ref's identifier and the file its `href` names in the package: `checkAdmitted` classified the
 * `href` as a nested document (`embed`, `#plate/model/url.ts`), keeping a package path in its
 * parsed form and dropping any other, and the module resolves the kept path against the item's
 * location, as plate resolves every package URL (`assetPaths`). The database holds every such path
 * to a document whose root is a `qti-assessment-stimulus` ("Stimulus ref target", pantry's
 * `package.ts`). An `href` securing dropped, a URI outside the package, names no stimulus plate
 * delivers: the ref is the mark `qti-assessment-stimulus-ref` beside securing's own, and the model
 * holds no node of it. Its `title` is the stimulus's to be "selected in situations where the
 * contents are not available, for example when an author is browsing a repository" (§7.6.3), so
 * no page reads it, and the model holds none.
 *
 * @module
 */
import { Array as Arr, Option, pipe } from "effect";
import type { ItemContentModule } from "#plate/content/contract.ts";
import { qtiNamespace } from "#plate/document/source.ts";
import { assetPaths, isPackagePath } from "#plate/model/url.ts";
import type { PackagePath } from "#plate/model/url.ts";

/**
 * The QTI element a shared stimulus is referenced by.
 */
const element = "qti-assessment-stimulus-ref";

/**
 * The model node of one `qti-assessment-stimulus-ref`, and its payload node: the ref's
 * `identifier`, its outer XML whitespace removed as an identifier reads (§7.6.1: "They are always
 * compared case-sensitively"), which a body element's `data-stimulus-idref` names it by, and
 * `target`, the stimulus document its `href` names, by its path from the package root, which the
 * host hands the stimulus by. The page may know all of it, so `copy` is the identity.
 */
export interface StimulusRefNode {
  readonly identifier: string;
  readonly target: PackagePath;
}

/**
 * The Stimulus Reference module: it reads each of the item's stimulus refs whose `href` names a
 * document of the package, and keeps every one, since nothing in a ref is hidden from the page.
 */
export const stimulusRefModule: ItemContentModule<
  typeof element,
  StimulusRefNode,
  StimulusRefNode,
  StimulusRefNode
> = {
  /**
   * No body content: the stimulus a ref names is a document of its own, which the server shell
   * walks under its own location, headings and catalog.
   */
  content: () => [],
  copy: (node) => node,
  element,
  namespace: qtiNamespace,
  normalise: (source) => source,
  /**
   * Read the ref's identifier and the package path its `href` names: the `href` as securing kept
   * it, resolved against the item's location. One securing dropped records the element's mark and
   * gives none. A kept path that names no file of the package is outside admission's contract,
   * since the database refuses a ref whose `href` names no stimulus document ("File exists",
   * "Stimulus ref target"), so it is a defect.
   */
  parse: (source, context) => {
    const { read } = context;
    const identifier = read.identifierAttribute(source, "identifier");

    return Option.match(read.valueOf(source, "href"), {
      onNone: () => context.mark(element),
      onSome: (href) =>
        pipe(
          Arr.findFirst(assetPaths(read.location, element, "href", href), isPackagePath),
          Option.match({
            onNone: () => read.inadmissible("stimulus-ref-target", context.path, { element, href }),
            onSome: (target) => Option.some({ identifier, target }),
          }),
        ),
    });
  },
  placement: "item",
  /**
   * Keep the ref as it is: the stimulus it names is shown to every view and under every support.
   */
  redact: (node) => Option.some(node),
};
