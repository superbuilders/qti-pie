/**
 * Companion Materials (I-13) in the server shell: the materials the item says a candidate may use
 * with it (`#plate/content/companion-materials.ts`), listed before the body, so they are known
 * before the questions are read, each written with the data attributes a host reads to supply the
 * tool. Plate builds no tool; a delivery system provides what the item lists, at its discretion.
 *
 * The part is `plate-companion-materials`, an `aside` named by a visible heading at the configured
 * heading level (`aria-labelledby`, the heading's id scoped by the instance), holding a `ul` of one
 * `plate-companion-material` per material in document order:
 *
 * - `data-material` names its kind: `calculator`, `rule`, `protractor`, `digital` or `physical`;
 * - A calculator carries `data-calculator-type` as written, and reads its name in the locale
 *   (`basic`, `standard`, `scientific` or `graphing`), then its description;
 * - A rule or a protractor carries `data-system` (`si` or `us`) and each of `data-minimum-length`,
 *   `data-minor-increment` with `data-minor-unit`, and `data-major-increment` with
 *   `data-major-unit` it writes, and reads its description with those in brackets;
 * - A digital material, and a calculator's file that tells how to use it, is a link to the file's
 *   address in the configuration's `assets` ({@link missingInMaterials} lets `<Item>` refuse an
 *   item one of whose files has none), named by its `label` or else its file name, with its icon,
 *   when it has one, as an `img` with empty `alt` before the text, since the text names it (WCAG
 *   1.1.1);
 * - A physical material reads its text as written.
 *
 * @module
 */
import { Option, Result } from "effect";
import { createElement } from "react";
import type { ReactNode } from "react";
import type {
  CompanionMaterialsNode,
  Material,
  MaterialFile,
  MaterialIncrement,
  ProtractorMaterial,
  RuleMaterial,
} from "#plate/content/companion-materials.ts";
import { scopedId } from "#plate/form/encoding.ts";
import { message } from "#plate/messages.ts";
import type { Locale, MessageKey } from "#plate/messages.ts";
import { addressUrl, classifyUrl } from "#plate/model/url.ts";
import type { UrlContext } from "#plate/model/url.ts";
import type { CalculatorType } from "#plate/supports.ts";
import type { Addressing } from "#plate/ui/item/html.ts";

/**
 * The catalog's names of a calculator, one per type.
 */
type CalculatorName = Extract<MessageKey, `materialCalculator${string}`>;

/**
 * The name each calculator type reads in the locale.
 */
const calculatorNames: Readonly<Record<CalculatorType, CalculatorName>> = {
  basic: "materialCalculatorBasic",
  graphing: "materialCalculatorGraphing",
  scientific: "materialCalculatorScientific",
  standard: "materialCalculatorStandard",
};

/**
 * Give the address of a file a material names, as the page writes it.
 *
 * @param context How the page uses the file: a `link` it follows, a `resource` it shows.
 * @param href The file's href as written.
 * @param addressing The item's location and the assets.
 * @returns The address, none when the URL is one `checkAdmitted` drops; the file's path when `assets`
 *   gives it no address.
 */
const addressOf = (
  context: UrlContext,
  href: string,
  addressing: Pick<Addressing, "assets" | "document">,
): Option.Option<Result.Result<string, string>> => {
  const url = classifyUrl(context, href);

  return url.kind === "dropped" || url.kind === "fragment"
    ? Option.none()
    : Option.some(addressUrl(url, addressing.document, addressing.assets));
};

/**
 * Name a file for a link that has no label: the last segment of its href.
 *
 * @param href The href as written.
 * @returns The segment after the last `/`, the whole href when that is empty.
 */
const fileName = (href: string): string => {
  const name = href.slice(href.lastIndexOf("/") + 1);

  return name === "" ? href : name;
};

/**
 * Write a material's file as a link: its icon, then its label or its file name.
 *
 * @param file The file.
 * @param addressing The item's location and the assets.
 * @returns The link.
 */
const fileLink = (file: MaterialFile, addressing: Addressing): ReactNode => {
  const href = Option.getOrUndefined(
    Option.flatMap(addressOf("link", file.href, addressing), Result.getSuccess),
  );
  const icon = file.icon.pipe(
    Option.flatMap((source) =>
      addressOf("resource", source, addressing).pipe(Option.flatMap(Result.getSuccess)),
    ),
  );

  return createElement(
    "a",
    { href, type: Option.getOrUndefined(file.mimeType) },
    Option.match(icon, {
      onNone: () => null,
      onSome: (src) => createElement("img", { alt: "", src }),
    }),
    Option.getOrElse(file.label, () => fileName(file.href)),
  );
};

/**
 * Write an increment as its value and its unit, as written.
 *
 * @param increment The increment.
 * @returns The value, then the unit.
 */
const incrementText = (increment: MaterialIncrement): string =>
  `${increment.value} ${increment.unit}`;

/**
 * Write what a rule or a protractor measures with, in the locale: a rule's minimum length, then
 * the minor increment when the material writes one, then the major increment.
 *
 * @param material The rule or the protractor.
 * @param locale The locale of plate's text.
 * @returns The phrases.
 */
const scalePhrases = (
  material: ProtractorMaterial | RuleMaterial,
  locale: Locale,
): readonly string[] => [
  ...(material.kind === "rule"
    ? [message(locale, "materialMinimumLength", { length: material.scale.minimumLength })]
    : []),
  ...Option.toArray(
    material.scale.minor.pipe(
      Option.map((increment) =>
        message(locale, "materialMinorIncrement", { increment: incrementText(increment) }),
      ),
    ),
  ),
  message(locale, "materialMajorIncrement", { increment: incrementText(material.scale.major) }),
];

/**
 * Write a rule's or a protractor's text: its description, then its scale's phrases in brackets.
 *
 * @param material The rule or the protractor.
 * @param locale The locale of plate's text.
 * @returns The text.
 */
const scaledText = (material: ProtractorMaterial | RuleMaterial, locale: Locale): string => {
  const phrases = scalePhrases(material, locale).join(", ");

  return material.description === "" ? phrases : `${material.description} (${phrases})`;
};

/**
 * Give the data attributes a rule's or a protractor's scale writes for the host: its system, its
 * increments, and a rule's minimum length.
 *
 * @param material The rule or the protractor.
 * @returns The attributes.
 */
const scaleAttributes = (material: ProtractorMaterial | RuleMaterial) => ({
  "data-major-increment": material.scale.major.value,
  "data-major-unit": material.scale.major.unit,
  "data-minimum-length": material.kind === "rule" ? material.scale.minimumLength : undefined,
  "data-minor-increment": Option.getOrUndefined(material.scale.minor)?.value,
  "data-minor-unit": Option.getOrUndefined(material.scale.minor)?.unit,
  "data-system": material.scale.system,
});

/**
 * Write one material as a `plate-companion-material` list item.
 *
 * @param material The material.
 * @param index Its index, its key.
 * @param addressing The instance, the item's location and the assets.
 * @param locale The locale of plate's text.
 * @returns The list item.
 */
const materialItem = (
  material: Material,
  index: number,
  addressing: Addressing,
  locale: Locale,
): ReactNode => {
  const part = {
    "data-material": material.kind,
    "data-slot": "plate-companion-material",
    key: index,
  };

  switch (material.kind) {
    case "calculator": {
      const name = message(locale, calculatorNames[material.calculatorType]);

      return createElement(
        "li",
        {
          ...part,
          "data-calculator-type": material.calculatorType,
        },
        material.description === "" ? name : `${name}: ${material.description}`,
        Option.match(material.info, {
          onNone: () => null,
          onSome: (file) => [" ", fileLink(file, addressing)],
        }),
      );
    }
    case "digital": {
      return createElement("li", part, fileLink(material.file, addressing));
    }
    case "physical": {
      return createElement("li", part, material.text);
    }
    case "protractor":
    case "rule": {
      return createElement(
        "li",
        { ...part, ...scaleAttributes(material) },
        scaledText(material, locale),
      );
    }
    default: {
      return material satisfies never;
    }
  }
};

/**
 * Write the materials the item lists, as the `plate-companion-materials` part.
 *
 * @param payloads The payload's `qti-companion-materials-info` nodes.
 * @param addressing The instance, the item's location and the assets.
 * @param locale The locale of plate's text.
 * @param headingLevel The level the part's heading stands at, the configuration's.
 * @returns The part, or nothing when the item lists no material.
 */
export const companionMaterials = (
  payloads: readonly CompanionMaterialsNode[],
  addressing: Addressing,
  locale: Locale,
  headingLevel: number,
): ReactNode => {
  const materials = payloads.flatMap((payload) => payload.materials);

  if (materials.length === 0) {
    return undefined;
  }

  const heading = scopedId(addressing.instance, "materials");

  return createElement(
    "aside",
    { "aria-labelledby": heading, "data-slot": "plate-companion-materials" },
    createElement(`h${String(headingLevel)}`, { id: heading }, message(locale, "materialsHeading")),
    createElement(
      "ul",
      {},
      materials.map((material, index) => materialItem(material, index, addressing, locale)),
    ),
  );
};

/**
 * Find the first file a listed material names, its link or its icon, that `assets` gives no
 * address, so `<Item>` refuses the item before it writes any of it.
 *
 * @param payloads The payload's `qti-companion-materials-info` nodes.
 * @param addressing The item's location and the assets.
 * @returns The file's path from the package root, or undefined when every file has an address.
 */
export const missingInMaterials = (
  payloads: readonly CompanionMaterialsNode[],
  addressing: Pick<Addressing, "assets" | "document">,
): string | undefined => {
  const files = payloads
    .flatMap((payload) => payload.materials)
    .flatMap((material): readonly MaterialFile[] => {
      switch (material.kind) {
        case "calculator": {
          return Option.toArray(material.info);
        }
        case "digital": {
          return [material.file];
        }
        case "physical":
        case "protractor":
        case "rule": {
          return [];
        }
        default: {
          return material satisfies never;
        }
      }
    });

  for (const file of files) {
    const urls = [
      addressOf("link", file.href, addressing),
      ...Option.toArray(
        file.icon.pipe(Option.map((icon) => addressOf("resource", icon, addressing))),
      ),
    ];

    for (const url of urls) {
      const missing = url.pipe(Option.flatMap(Result.getFailure));

      if (Option.isSome(missing)) {
        return missing.value;
      }
    }
  }

  return undefined;
};
