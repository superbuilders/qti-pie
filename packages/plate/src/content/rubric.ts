/**
 * Rubric Block: an item body's `qti-rubric-block`, read, redacted, copied and coded for the views
 * its `view` names, and for no other; the server shell writes it as one `div`
 * (`#plate/ui/item/contents/rubric.tsx`).
 *
 * The block is shown only to the views its `view` list names (reading 65: "Each block is shown only
 * to the views its `view` names"): the item model holds only the blocks the candidate's view names
 * (`inCandidateView` in `#plate/model/body.ts`), and the redaction keeps a block when the view the
 * item is shown to is among them and drops it otherwise, withholding its content, so a scorer's
 * rubric is in neither a candidate's page nor the redacted copy a host sends to a page. The item is
 * shown to the candidate's view when the host names none, so a candidate render holds no scorer,
 * proctor, tutor, author or test-constructor rubric. A block the view names is placed in document
 * order, where it stands in the body, whatever its `use`; a block that carries
 * `qti-rubric-discretionary-placement` is placed there too, since the class gives the delivery
 * leave to place the block for its view actors elsewhere and does not oblige it.
 *
 * A rubric's `qti-stylesheet` and `qti-catalog-info` children are read past: each is recorded as a
 * mark on the verdict and renders nothing, since plate applies no stylesheet and resolves only the
 * item's own catalog (`#plate/content/catalog-info.ts`). A test's, a test part's or a section's
 * rubric block is not this module's: it reads the item body's alone.
 *
 * @module
 */
import { Option } from "effect";
import type { BodyContentModule } from "#plate/content/contract.ts";
import { qtiNamespace } from "#plate/document/source.ts";
import type { ByLevel } from "#plate/interactions/contract.ts";
import type { Level, ModelLevel, Nodes, RedactedLevel } from "#plate/model/item.ts";

/**
 * The QTI element Rubric Block is read from.
 */
const element = "qti-rubric-block";

/**
 * A run of the white space an XSD list's tokens are separated by, which XML allows as a space, a
 * tab, a carriage return or a line feed.
 */
const separators = /[\t\n\r ]+/u;

/**
 * A rubric block in the item body: the content of its `qti-content-body` in document order,
 * its `use` as written, the views its `view` names as written, and its `xml:lang`. The redaction
 * keeps the node only for a view among its `views`.
 *
 * Its `qti-stylesheet` and `qti-catalog-info` children are not in the node: they are read past and
 * recorded as marks on the verdict.
 *
 * @template L The level of its content.
 */
interface RubricBlock<L extends Level = ModelLevel> {
  /**
   * The body nodes of the block's `qti-content-body`: flow content, printed variables and template
   * content, which hold no interaction.
   */
  readonly content: Nodes<L>;
  /**
   * The block's `xml:lang` as written, none when the block carries none.
   */
  readonly lang: Option.Option<string>;
  /**
   * The block's `use` as written: `instructions`, `scoring`, `navigation` or an `ext:` name.
   */
  readonly use: string;
  /**
   * The views the block's `view` lists, as written and in order: each of `author`, `candidate`,
   * `proctor`, `scorer`, `testConstructor` and `tutor` the block is shown to.
   */
  readonly views: readonly string[];
}

/**
 * A rubric block's model node at each level.
 */
interface RubricByLevel extends ByLevel {
  readonly node: RubricBlock<this["level"]>;
}

/**
 * The payload node of a rubric block: what {@link RubricBlock} gives the page, its content, which
 * the server shell writes as it writes the body.
 */
export interface RubricBlockPayload {
  /**
   * The block's `xml:lang`, which the server shell writes as `lang`.
   */
  readonly lang: Option.Option<string>;
  /**
   * The block's content as body nodes, in document order.
   */
  readonly nodes: Nodes<RedactedLevel>;
  /**
   * The block's `use` as written, which the server shell writes as `data-use`.
   */
  readonly use: string;
  /**
   * The views the block names, as written and in order.
   */
  readonly views: readonly string[];
}

/**
 * The Rubric Block module.
 *
 * It reads a `qti-rubric-block` of the item body into a {@link RubricBlock}, keeps it in the
 * redacted item only for the views its `view` names, and gives the page its `use`, its views, its
 * `xml:lang` and its content in document order. A rubric block in another block's content body
 * stands where it is written.
 */
export const rubricModule: BodyContentModule<typeof element, RubricByLevel, RubricBlockPayload> = {
  /**
   * Give the body nodes the server shell writes as the block's content, which its asset check
   * and its heading shift read as they read a Prompt's, so a heading in a rubric shifts with the
   * body's.
   *
   * @param payload The block's payload node.
   * @returns Its content, in document order.
   */
  content: (payload) => payload.nodes,
  /**
   * Give the payload node of a block the redaction kept: what the page may know of it.
   *
   * @param node The block the redaction kept.
   * @returns The block's payload node.
   */
  copy: (node) => ({
    lang: node.lang,
    nodes: node.content,
    use: node.use,
    views: node.views,
  }),
  element,
  namespace: qtiNamespace,
  normalise: (source) => source,
  /**
   * Read a `qti-rubric-block` into its {@link RubricBlock}: the required `use` and `view`, its
   * `xml:lang`, and the children of its `qti-content-body` as body nodes. Its `qti-stylesheet` and
   * `qti-catalog-info` children are recorded as marks in document order, as the verdict names them,
   * and read no further.
   *
   * @param source The `qti-rubric-block` element.
   * @param context The body walk's context, whose reader kit reads the element and records its
   *   marks.
   * @returns The block.
   */
  parse: (source, context) => {
    const { read } = context;
    const use = read.requiredValue(source, "use");
    const view = read.requiredValue(source, "view");

    read.markElement(source);
    for (const stylesheet of read.childrenNamed(source, "qti-stylesheet")) {
      read.mark(stylesheet, read.nameOf(stylesheet));
    }

    const body = read.requiredChild(source, "qti-content-body");

    read.markElement(body);

    const content = read.nodes(body);

    for (const catalog of read.childrenNamed(source, "qti-catalog-info")) {
      read.mark(catalog, read.nameOf(catalog));
    }

    return {
      content,
      lang: read.valueOf(source, "xml:lang"),
      use,
      views: view.split(separators).filter((token) => token !== ""),
    };
  },
  placement: "body",
  /**
   * Decide what the redacted item keeps of a block: the block, its content walked through the kit,
   * when the view the item is shown to is among the views the block names; otherwise none, the
   * content withheld through the kit, so a view the block does not name never receives its content,
   * and a printed variable, template content or notice inside it is still reached.
   *
   * @param node The block.
   * @param kit The redaction's walk and the view the item is shown to.
   * @returns The block kept for the view, or none.
   */
  redact: (node, kit) => {
    if (node.views.includes(kit.view)) {
      return Option.some({ ...node, content: kit.nodes(node.content) });
    }

    kit.withhold(node.content);

    return Option.none();
  },
};
