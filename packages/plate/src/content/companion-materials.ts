/**
 * Companion Materials: the item's `qti-companion-materials-info`, read into the item model; the
 * server shell lists the materials before the item body, each also written as data attributes a
 * host reads to supply the tool (`#plate/ui/item/contents/companion-materials.tsx`).
 *
 * The element names what a candidate may use with the item: calculators, rules, protractors,
 * digital materials (files of the package) and physical materials. A delivery system provides what
 * is listed alongside the item; how it does so is at its discretion, a listed calculator type or
 * protractor must be provided, and no material has a scoring meaning. Plate builds no tool: it
 * lists the materials and writes what the host needs to supply each.
 *
 * The item root's walk dispatches the element to {@link companionMaterialsModule}'s `parse`, which
 * reads the five kinds of child the XSD gives it, each zero or more, in document order, and ignores
 * the extension elements of other namespaces after them: the verdict judges such an island for
 * itself (`checkIsland` in `#plate/content/modules.ts`), and the module neither lists nor marks any
 * element it does not read. The names are read as the XSD and the information model spell them, in
 * lowercase: `scientific`, `qti-rule-system-si`, `qti-increment-us` ("Companion-material names are
 * lowercase.", reading `companion-material-names`, which sets aside the implementation guide's
 * `Scientific` and `qti-rule-system-SI`).
 *
 * @module
 */
import { Array as Arr, Option, pipe } from "effect";
import type { ItemContentModule } from "#plate/content/contract.ts";
import { qtiNamespace } from "#plate/document/source.ts";
import type { SourceElement } from "#plate/document/source.ts";
import type { ReaderKit } from "#plate/interactions/contract.ts";
import { trimXmlSpace } from "#plate/model/values.ts";
import { calculatorTypes } from "#plate/supports.ts";
import type { CalculatorType } from "#plate/supports.ts";

/**
 * The QTI element Companion Materials is read from.
 */
const element = "qti-companion-materials-info";

/**
 * One measuring increment of a rule or a protractor: its value as written, a decimal, and its
 * `unit` as written (`Millimeter`, `Centimeter`, `Meter`, `Kilometer`, `Inch`, `Foot`, `Yard`,
 * `Mile`, `Radian`, `Degree`, `Minute` or `Second`).
 */
export interface MaterialIncrement {
  readonly unit: string;
  readonly value: string;
}

/**
 * The measuring system a rule or a protractor is marked in: `si`, from `qti-rule-system-si` and
 * `qti-increment-si`, or `us`, from `qti-rule-system-us` and `qti-increment-us`.
 */
export type MaterialSystem = "si" | "us";

/**
 * What a protractor measures with, and a rule beside its minimum length: its system, its major
 * increment, which the XSD requires, and its minor increment when it has one, each as written.
 */
export interface IncrementScale {
  readonly major: MaterialIncrement;
  readonly minor: Option.Option<MaterialIncrement>;
  readonly system: MaterialSystem;
}

/**
 * What a rule measures with: its increments, and the minimum length it must have, which every
 * rule system of the XSD requires and no protractor's increments hold.
 */
export interface RuleScale extends IncrementScale {
  readonly minimumLength: string;
}

/**
 * A file the item names, an `ItemFileInfoDType` as a `qti-calculator-info` or a
 * `qti-digital-material` writes it: the href of its `qti-file-href` as written, a file of the
 * package, its `qti-resource-icon`, its `label` and its `mime-type`.
 */
export interface MaterialFile {
  readonly href: string;
  readonly icon: Option.Option<string>;
  readonly label: Option.Option<string>;
  readonly mimeType: Option.Option<string>;
}

/**
 * A `qti-calculator`: its `qti-calculator-type`, its description, and the file that tells how to
 * use it when the item has one.
 */
export interface CalculatorMaterial {
  readonly calculatorType: CalculatorType;
  readonly description: string;
  readonly info: Option.Option<MaterialFile>;
  readonly kind: "calculator";
}

/**
 * A `qti-rule`: its description and its scale, from the one rule system the XSD requires.
 */
export interface RuleMaterial {
  readonly description: string;
  readonly kind: "rule";
  readonly scale: RuleScale;
}

/**
 * A `qti-protractor`: its description and its scale, from the one increment element the XSD
 * requires.
 */
export interface ProtractorMaterial {
  readonly description: string;
  readonly kind: "protractor";
  readonly scale: IncrementScale;
}

/**
 * A `qti-digital-material` that names its file.
 */
export interface DigitalMaterial {
  readonly file: MaterialFile;
  readonly kind: "digital";
}

/**
 * A `qti-physical-material`: the text that says what the candidate may bring.
 */
export interface PhysicalMaterial {
  readonly kind: "physical";
  readonly text: string;
}

/**
 * One material the item lists.
 */
export type Material =
  | CalculatorMaterial
  | DigitalMaterial
  | PhysicalMaterial
  | ProtractorMaterial
  | RuleMaterial;

/**
 * The model node of `qti-companion-materials-info`, and its payload node: the materials in
 * document order, which the XSD fixes as calculators, then rules, protractors, digital materials
 * and physical materials. The page may know all of it, so `copy` is the identity.
 */
export interface CompanionMaterialsNode {
  readonly materials: readonly Material[];
}

/**
 * Read the trimmed text of an element's first QTI child of one name.
 *
 * @param read The reader kit.
 * @param parent The element.
 * @param local The child's local name.
 * @returns The child's text without its outer XML whitespace, none when the element has no such
 *   child.
 */
const childText = (read: ReaderKit, parent: SourceElement, local: string): Option.Option<string> =>
  Option.map(Option.fromUndefinedOr(read.childrenNamed(parent, local)[0]), (child) =>
    trimXmlSpace(read.textOf(child)),
  );

/**
 * Read the trimmed text of the QTI child of one name an element must hold.
 *
 * @param read The reader kit.
 * @param parent The element.
 * @param local The child's local name.
 * @returns The child's text without its outer XML whitespace.
 */
const requiredText = (read: ReaderKit, parent: SourceElement, local: string): string =>
  pipe(read.requiredChild(parent, local), (child) => trimXmlSpace(read.textOf(child)));

/**
 * Read a calculator's `qti-calculator-type` as written: an `xs:string` enumeration, which keeps its
 * whitespace, and which the database holds it to.
 *
 * @param read The reader kit.
 * @param calculator The `qti-calculator`.
 * @returns The type.
 */
const calculatorTypeOf = (read: ReaderKit, calculator: SourceElement): CalculatorType =>
  pipe(read.requiredChild(calculator, "qti-calculator-type"), (child) => {
    const written = read.textOf(child);

    return Option.match(
      Arr.findFirst(calculatorTypes, (type) => type === written),
      {
        onNone: () =>
          read.inadmissible("value-type", read.pathOf(child), {
            element: read.nameOf(child),
            value: written,
          }),
        onSome: (type) => type,
      },
    );
  });

/**
 * Read an optional attribute without its outer XML whitespace, none when it is absent or blank.
 *
 * @param read The reader kit.
 * @param source The element.
 * @param name The attribute's name.
 * @returns The trimmed value.
 */
const attributeText = (
  read: ReaderKit,
  source: SourceElement,
  name: string,
): Option.Option<string> =>
  Option.filter(Option.map(read.valueOf(source, name), trimXmlSpace), (value) => value !== "");

/**
 * Read one increment: its value and its required `unit`, each without its outer XML whitespace.
 *
 * @param read The reader kit.
 * @param increment The `qti-minor-increment` or `qti-major-increment`.
 * @returns The increment.
 */
const incrementOf = (read: ReaderKit, increment: SourceElement): MaterialIncrement =>
  pipe(read.requiredValue(increment, "unit"), (unit) => ({
    unit: trimXmlSpace(unit),
    value: trimXmlSpace(read.textOf(increment)),
  }));

/**
 * Read the increments of a rule's system or a protractor's increment element: the major one the
 * XSD requires, and the minor one when it holds one.
 *
 * @param read The reader kit.
 * @param holder The system or increment element.
 * @param system The system it is of.
 * @returns The scale.
 */
const incrementScaleOf = (
  read: ReaderKit,
  holder: SourceElement,
  system: MaterialSystem,
): IncrementScale => {
  const major = pipe(read.requiredChild(holder, "qti-major-increment"), (child) =>
    incrementOf(read, child),
  );
  const minor = Option.map(Arr.head(read.childrenNamed(holder, "qti-minor-increment")), (child) =>
    incrementOf(read, child),
  );

  return { major, minor, system };
};

/**
 * Find the system element of a rule or a protractor, the one of the XSD's two its choice requires:
 * the `si` one, else the `us` one.
 *
 * @param read The reader kit.
 * @param parent The rule or the protractor.
 * @param names The local names of the system elements, by system.
 * @returns The element and its system.
 */
const systemOf = (
  read: ReaderKit,
  parent: SourceElement,
  names: Readonly<Record<MaterialSystem, string>>,
): { readonly holder: SourceElement; readonly system: MaterialSystem } =>
  Option.match(Arr.head(read.childrenNamed(parent, names.si)), {
    onNone: () =>
      pipe(read.requiredChild(parent, names.us), (holder) => ({ holder, system: "us" })),
    onSome: (holder) => ({ holder, system: "si" }),
  });

/**
 * Read a protractor's scale.
 *
 * @param read The reader kit.
 * @param protractor The `qti-protractor`.
 * @returns The scale.
 */
const protractorScaleOf = (read: ReaderKit, protractor: SourceElement): IncrementScale =>
  pipe(
    systemOf(read, protractor, { si: "qti-increment-si", us: "qti-increment-us" }),
    ({ holder, system }) => incrementScaleOf(read, holder, system),
  );

/**
 * Read a rule's scale: its system's increments and its minimum length.
 *
 * @param read The reader kit.
 * @param rule The `qti-rule`.
 * @returns The scale.
 */
const ruleScaleOf = (read: ReaderKit, rule: SourceElement): RuleScale =>
  pipe(
    systemOf(read, rule, { si: "qti-rule-system-si", us: "qti-rule-system-us" }),
    ({ holder, system }) => {
      const increments = incrementScaleOf(read, holder, system);
      const minimumLength = requiredText(read, holder, "qti-minimum-length");

      return { ...increments, minimumLength };
    },
  );

/**
 * Read a file info, an `ItemFileInfoDType`.
 *
 * @param read The reader kit.
 * @param source The `qti-calculator-info` or `qti-digital-material`.
 * @returns The file.
 */
const fileOf = (read: ReaderKit, source: SourceElement): MaterialFile =>
  pipe(requiredText(read, source, "qti-file-href"), (href) => ({
    href,
    icon: Option.filter(childText(read, source, "qti-resource-icon"), (icon) => icon !== ""),
    label: attributeText(read, source, "label"),
    mimeType: attributeText(read, source, "mime-type"),
  }));

/**
 * Read one child of the element as the material it gives.
 *
 * @param read The reader kit.
 * @param child The child, an element of the QTI namespace.
 * @returns The material, none for a child that is not one of the five kinds.
 */
const materialOf = (read: ReaderKit, child: SourceElement): Option.Option<Material> => {
  switch (child.local) {
    case "qti-calculator": {
      return (() => {
        const calculatorType = calculatorTypeOf(read, child);
        const description = requiredText(read, child, "qti-description");
        const info = Option.map(
          Arr.head(read.childrenNamed(child, "qti-calculator-info")),
          (file) => fileOf(read, file),
        );

        return Option.some({ calculatorType, description, info, kind: "calculator" });
      })();
    }

    case "qti-digital-material": {
      return pipe(fileOf(read, child), (file) => Option.some({ file, kind: "digital" }));
    }

    case "qti-physical-material": {
      return Option.some({ kind: "physical", text: trimXmlSpace(read.textOf(child)) });
    }

    case "qti-protractor": {
      return (() => {
        const description = requiredText(read, child, "qti-description");
        const scale = protractorScaleOf(read, child);

        return Option.some({ description, kind: "protractor", scale });
      })();
    }

    case "qti-rule": {
      return (() => {
        const description = requiredText(read, child, "qti-description");
        const scale = ruleScaleOf(read, child);

        return Option.some({ description, kind: "rule", scale });
      })();
    }

    default: {
      return Option.none();
    }
  }
};

/**
 * Read the element's materials, in document order. A child that is not one of the five kinds, an
 * extension element of another namespace among them, gives none.
 *
 * @param read The reader kit.
 * @param source The `qti-companion-materials-info`.
 * @returns The materials.
 */
const materialsOf = (read: ReaderKit, source: SourceElement): readonly Material[] =>
  pipe(
    read
      .elementsOf(source)
      .filter((child) => read.inQti(child))
      .map((child) => materialOf(read, child)),
    (materials) => materials.flatMap(Option.toArray),
  );

/**
 * The Companion Materials module: it reads the item's `qti-companion-materials-info` and keeps the
 * materials the page may know. It reads the names as the XSD spells them, in lowercase
 * ("Companion-material names are lowercase.", reading `companion-material-names`), and gives a
 * calculator's type and a rule's system as it read them.
 */
export const companionMaterialsModule: ItemContentModule<
  typeof element,
  CompanionMaterialsNode,
  CompanionMaterialsNode,
  CompanionMaterialsNode
> = {
  content: () => [],
  /**
   * Copy the node as it is: nothing in it is hidden from the page.
   */
  copy: (node) => node,
  element,
  namespace: qtiNamespace,
  normalise: (source) => source,
  /**
   * Read the materials the element lists, and record no mark: a child the module does not read,
   * an extension element of another namespace, is ignored.
   */
  parse: (source, context) =>
    pipe(materialsOf(context.read, source), (materials) => Option.some({ materials })),
  placement: "item",
  /**
   * Keep the node when it lists a material, and none otherwise: the list of nothing is no list.
   */
  redact: (node) => (node.materials.length === 0 ? Option.none() : Option.some(node)),
};
