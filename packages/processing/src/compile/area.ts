/**
 * The resolver of an area: an element's `shape` and `coords` (QTI's Coords, §7.9, and ShapeEnum,
 * §8.29) read once, at compile time, into exact integer coordinates over one denominator, every
 * percentage taken of the size of the image the area lies on (reading `circle-percentage-radius`:
 * a circle's radius of the smaller of its width and height).
 *
 * Coordinates that do not fit a shape are read as the HTML Standard's image-map processing reads
 * them (reading `area-coords-fit`): a circle without three coordinates or with a radius not above
 * 0, a rect or an ellipse without four, a poly under three vertices, hold no point (`nowhere`); a
 * poly's odd last coordinate is dropped and every coordinate past what a shape takes is ignored;
 * `default` is the whole image (`everywhere`). A rect's corners are ordered, so no reader meets
 * them either way round. An area with a percentage whose image's size is not known is refused.
 *
 * @module
 */
import type { Area, Vertex } from "#processing/ir.ts";
import { checked, refused } from "#processing/operators/operator.ts";
import type { Checked } from "#processing/operators/operator.ts";
import { attributeOf, collapseXmlSpace, trimXmlSpace } from "#processing/xml.ts";
import type { XmlElement } from "#processing/xml.ts";
import { regex } from "arkregex";

/**
 * An image's size, in whole pixels.
 */
export interface ImageSize {
  readonly height: number;
  readonly width: number;
}

/**
 * A coordinate as written: an exact rational, and whether it is a percentage.
 */
interface Written {
  readonly denominator: bigint;
  readonly numerator: bigint;
  readonly percent: boolean;
}

/**
 * A decimal number, its optional fraction and exponent, and an optional `%`.
 */
const coordinate = regex(
  "^(?<sign>[+-]?)(?<whole>[0-9]*)(?:\\.(?<fraction>[0-9]*))?(?:[eE](?<exponent>[+-]?[0-9]+))?(?<percent>%?)$",
  "u",
);

/**
 * Read one coordinate exactly.
 *
 * @param text - The coordinate as written.
 * @returns It, or `undefined` where it is no number.
 */
const writtenOf = (text: string): Written | undefined => {
  const parts = coordinate.exec(trimXmlSpace(text))?.groups;
  const whole = parts?.whole ?? "";
  const fraction = parts?.fraction ?? "";
  if (parts === undefined || whole + fraction === "") {
    return undefined;
  }

  const exponent = BigInt(parts.exponent ?? "0") - BigInt(fraction.length);
  const digits = BigInt(whole + fraction) * (parts.sign === "-" ? -1n : 1n);

  return exponent >= 0n
    ? { denominator: 1n, numerator: digits * 10n ** exponent, percent: parts.percent === "%" }
    : { denominator: 10n ** -exponent, numerator: digits, percent: parts.percent === "%" };
};

/**
 * The greatest common divisor of two integers.
 *
 * @param left - One.
 * @param right - The other.
 * @returns Their gcd, at least 1.
 */
const gcd = (left: bigint, right: bigint): bigint => {
  let [a, b] = [left < 0n ? -left : left, right < 0n ? -right : right];
  while (b !== 0n) {
    [a, b] = [b, a % b];
  }

  return a === 0n ? 1n : a;
};

/**
 * A rational coordinate, a percentage taken of its extent.
 */
interface Rational {
  readonly denominator: bigint;
  readonly numerator: bigint;
}

/**
 * A rational in lowest terms.
 *
 * @param rational - The rational.
 * @returns It, its numerator and denominator divided by their gcd.
 */
const lowest = (rational: Rational): Rational => {
  const divisor = gcd(rational.numerator, rational.denominator);

  return { denominator: rational.denominator / divisor, numerator: rational.numerator / divisor };
};

/**
 * A coordinate as a rational number of pixels: as written, or its percentage of an extent.
 *
 * @param written - The coordinate.
 * @param extent - The extent a percentage is of, if known.
 * @returns The rational, or `undefined` for a percentage of an unknown extent.
 */
const pixels = (written: Written, extent: number | undefined): Rational | undefined => {
  if (!written.percent) {
    return written;
  }

  return extent === undefined
    ? undefined
    : { denominator: written.denominator * 100n, numerator: written.numerator * BigInt(extent) };
};

/**
 * The extent each coordinate's percentage is of: x of the width, y of the height, a circle's radius
 * of the smaller, an ellipse's radii of the width and the height.
 *
 * @param geometry - The shape.
 * @param count - How many coordinates are written.
 * @param image - The image's size, where known.
 * @returns Each coordinate's extent, where known.
 */
const extentsOf = (
  geometry: "circle" | "ellipse" | "poly" | "rect",
  count: number,
  image: ImageSize | undefined,
): readonly (number | undefined)[] =>
  image === undefined
    ? []
    : Array.from({ length: count }, (_, index) => {
        if (geometry === "circle" && index === 2) {
          return Math.min(image.width, image.height);
        }

        return index % 2 === 0 ? image.width : image.height;
      });

/**
 * An area of a shape from its coordinates, over their one denominator.
 *
 * @param geometry - The shape.
 * @param written - Its coordinates, in pixels.
 * @returns The area.
 */
const areaFrom = (
  geometry: "circle" | "ellipse" | "poly" | "rect",
  written: readonly Rational[],
): Area => {
  const rationals = written.map(lowest);
  let denominator = 1n;
  for (const each of rationals) {
    denominator = (denominator / gcd(denominator, each.denominator)) * each.denominator;
  }

  const scaled = rationals.map((each) => (each.numerator * denominator) / each.denominator);
  const at = (index: number): bigint => scaled[index] ?? 0n;
  const vertex = (index: number): Vertex => ({ x: at(index), y: at(index + 1) });
  switch (geometry) {
    case "circle": {
      return scaled.length < 3 || at(2) <= 0n
        ? { kind: "nowhere" }
        : { centre: vertex(0), denominator, kind: "circle", radius: at(2) };
    }
    case "ellipse": {
      return scaled.length < 4 || at(2) <= 0n || at(3) <= 0n
        ? { kind: "nowhere" }
        : { across: at(2), centre: vertex(0), denominator, down: at(3), kind: "ellipse" };
    }
    case "rect": {
      return scaled.length < 4
        ? { kind: "nowhere" }
        : {
            bottom: at(1) > at(3) ? at(1) : at(3),
            denominator,
            kind: "rect",
            left: at(0) < at(2) ? at(0) : at(2),
            right: at(0) > at(2) ? at(0) : at(2),
            top: at(1) < at(3) ? at(1) : at(3),
          };
    }
    case "poly": {
      const vertices = Array.from({ length: Math.floor(scaled.length / 2) }, (_, index) =>
        vertex(index * 2),
      );
      const [first, second, third, ...rest] = vertices;

      return first === undefined || second === undefined || third === undefined
        ? { kind: "nowhere" }
        : { denominator, kind: "poly", vertices: [first, second, third, ...rest] };
    }
  }
};

/**
 * The geometries `shape` names.
 */
const geometries = ["circle", "default", "ellipse", "poly", "rect"] as const;

/**
 * Resolve an element's area against the size of the image it lies on.
 *
 * @param element - The element writing `shape` and `coords`.
 * @param image - The image's size, where known.
 * @param place - The element's place.
 * @returns The area, or a refusal where its shape or coordinates are unreadable, or a percentage's
 *   image has no known size.
 */
export const resolveArea = (
  element: XmlElement,
  image: ImageSize | undefined,
  place: number,
): Checked<Area> => {
  const geometry = geometries.find(
    (each) => each === collapseXmlSpace(attributeOf(element, "shape") ?? ""),
  );
  const coords = attributeOf(element, "coords") ?? "";
  const written = trimXmlSpace(coords) === "" ? [] : coords.split(",").map(writtenOf);
  if (geometry === undefined) {
    return refused(
      "attribute",
      place,
      "write the area's shape as circle, default, ellipse, poly or rect",
    );
  }

  const read: Written[] = [];
  for (const each of written) {
    if (each === undefined) {
      return refused("attribute", place, "write the area's coords as comma-separated numbers");
    }

    read.push(each);
  }

  if (geometry === "default") {
    return checked({ kind: "everywhere" });
  }

  const extents = extentsOf(geometry, read.length, image);
  const rationals: Rational[] = [];
  for (const [index, each] of read.entries()) {
    const rational = pixels(each, extents[index]);
    if (rational === undefined) {
      return refused(
        "attribute",
        place,
        "give the image an area's percentage coordinates are of a width and a height",
      );
    }

    rationals.push(rational);
  }

  return checked(areaFrom(geometry, rationals));
};
