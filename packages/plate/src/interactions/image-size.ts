/**
 * The size an author wrote on the image a graphic interaction draws on: the pixel space its areas'
 * coordinates, its points and its placed objects are in. Hotspot, Graphic Gap Match, Graphic Order
 * and Graphic Associate read it from their image, Graphic Gap Match from each gap image too, Select
 * Point and Position Object from their stage image, and Position Object from its object; each reads
 * it here, once, and its payload carries it.
 *
 * A graphic interaction's image is an `img`, a `picture` or an `object` (QTI 3.0 information model
 * 5.68.5, the Hotspot's `imageSelection`, and its graphic siblings'), and its `width` and `height`
 * are each a `LengthDType`, digits with an optional `%` (5.69.4, 5.69.5). Written in digits, a
 * dimension is the image's own size in pixels, which the browser draws it at; written with `%`, it
 * sizes the image against its container and says nothing of the pixel space, so it reads as
 * unwritten, and the page takes the image's natural size once it loads. A `picture`'s size is its
 * first `img`'s, the element that carries the dimensions and that the browser draws.
 *
 * @module
 * @see https://html.spec.whatwg.org/multipage/embedded-content-other.html#dimension-attributes
 */
import { regex } from "arkregex";
import { Array as Arr, Option } from "effect";
import type { SourceElement } from "#plate/document/source.ts";
import type { ReaderKit } from "#plate/interactions/contract.ts";
import { trimXmlSpace } from "#plate/model/values.ts";

/**
 * The elements a graphic interaction's image may be, in the QTI namespace: `img`, `picture`, or the
 * deprecated `object`.
 */
export const imageElements = ["img", "object", "picture"] as const;

/**
 * Find the image an element holds: its first child that is an `img`, a `picture` or an `object`.
 *
 * @param read The reader kit.
 * @param parent The interaction, or a gap image.
 * @returns The image element, none where it holds none.
 */
export const imageElementOf = (
  read: ReaderKit,
  parent: SourceElement,
): Option.Option<SourceElement> =>
  Arr.findFirst(read.elementsOf(parent), (child) =>
    imageElements.some((local) => read.isQti(child, local)),
  );

/**
 * The size of an image's own pixel space, in pixels.
 */
export interface ImageSize {
  readonly height: number;
  readonly width: number;
}

/**
 * The image's size as the author wrote it: both dimensions in pixels, one of them, the other then
 * following the image's natural aspect, as the browser draws an image given one; or neither, the
 * image then drawn at its natural size.
 */
export type AuthoredSize =
  | { readonly kind: "both"; readonly size: ImageSize }
  | { readonly height: number; readonly kind: "height" }
  | { readonly kind: "neither" }
  | { readonly kind: "width"; readonly width: number };

/**
 * A dimension written in pixels: digits alone, with no `%`.
 */
const pixels = regex("^[0-9]+$", "u");

/**
 * Find the element that carries an image's dimensions: an `img` or `object` itself, and a
 * `picture`'s first `img`.
 *
 * @param read The reader kit.
 * @param image The image element.
 * @returns The element, none for a `picture` that holds no `img`.
 */
export const sizeCarrierOf = (
  read: ReaderKit,
  image: SourceElement,
): Option.Option<SourceElement> =>
  read.isQti(image, "picture")
    ? Option.fromUndefinedOr(read.childrenNamed(image, "img")[0])
    : Option.some(image);

/**
 * Read one dimension of an image in pixels: its digits once leading and trailing whitespace is
 * trimmed, a positive number.
 *
 * @param read The reader kit.
 * @param carrier The element that carries the dimensions.
 * @param name `width` or `height`.
 * @returns The dimension, none where it is unwritten, a percentage, or 0, which gives no pixel
 *   space.
 */
const dimensionOf = (
  read: ReaderKit,
  carrier: SourceElement,
  name: "height" | "width",
): Option.Option<number> =>
  read.valueOf(carrier, name).pipe(
    Option.map(trimXmlSpace),
    Option.filter((written) => pixels.test(written)),
    Option.map(Number),
    Option.filter((value) => value > 0),
  );

/**
 * Read the size the author wrote on an image ({@link AuthoredSize}).
 *
 * @param read The reader kit.
 * @param image The image element, an `img`, `picture` or `object`.
 * @returns The size, `neither` for a `picture` that holds no `img`.
 */
export const authoredSizeOf = (read: ReaderKit, image: SourceElement): AuthoredSize => {
  const carrier = sizeCarrierOf(read, image);
  const height = carrier.pipe(Option.flatMap((element) => dimensionOf(read, element, "height")));
  const width = carrier.pipe(Option.flatMap((element) => dimensionOf(read, element, "width")));

  return Option.match(height, {
    onNone: () =>
      Option.match(width, {
        onNone: (): AuthoredSize => ({ kind: "neither" }),
        onSome: (value): AuthoredSize => ({ kind: "width", width: value }),
      }),
    onSome: (heightValue) =>
      Option.match(width, {
        onNone: (): AuthoredSize => ({ height: heightValue, kind: "height" }),
        onSome: (widthValue): AuthoredSize => ({
          kind: "both",
          size: { height: heightValue, width: widthValue },
        }),
      }),
  });
};
