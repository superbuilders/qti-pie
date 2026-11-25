/**
 * Placeholder pictures: each an SVG that prints its own label and pixel size, so a screenshot says
 * what the author wrote and how big. The item names it by a package path, and its address is a
 * `data:` URL in the configuration's `assets`, since plate drops a `data:` URL written in the item
 * (`url-scheme:data`).
 *
 * @module
 */
import { dimension } from "#specimen/dimension.ts";
import { element, text } from "#specimen/xml.ts";

/**
 * A picture's shape: wide (3:2, as a 1536 × 1024 diagram is), square, or tall (2:3).
 */
export const aspect = dimension("Shape", [
  ["wide", "Wide (3:2)", "wide"],
  ["square", "Square", "square"],
  ["tall", "Tall (2:3)", "tall"],
]);

/**
 * A picture's size, by its longer side: tiny (96 px), normal (640 px, the pilot's), or huge
 * (1536 px, Cameron's diagrams).
 */
export const scale = dimension("Size", [
  ["normal", "Normal (640 px)", "normal"],
  ["tiny", "Tiny (96 px)", "tiny"],
  ["huge", "Huge (1536 px)", "huge"],
]);

/**
 * A picture's shape and size.
 */
export interface Picture {
  readonly aspect: (typeof aspect.values)[number]["value"];
  readonly scale: (typeof scale.values)[number]["value"];
}

/**
 * A picture's authored size in pixels.
 */
export interface Size {
  readonly height: number;
  readonly width: number;
}

/**
 * Each size's longer side, in pixels.
 */
const longer: Readonly<Record<Picture["scale"], number>> = { huge: 1536, normal: 640, tiny: 96 };

/**
 * A picture's authored size: its longer side as its scale says, its shorter two thirds of it,
 * rounded, or equal when square.
 *
 * @param picture The picture.
 * @returns Its size.
 */
export const sizeOf = (picture: Picture): Size => {
  const side = longer[picture.scale];
  const shorter = Math.round((side * 2) / 3);

  switch (picture.aspect) {
    case "wide": {
      return { height: shorter, width: side };
    }
    case "square": {
      return { height: side, width: side };
    }
    case "tall": {
      return { height: side, width: shorter };
    }
  }
};

/**
 * A package file a case's item names, and its address: an entry of plate's configuration
 * `assets`, the path from the package root first.
 */
export type Asset = readonly [path: string, address: string];

/**
 * Where every case's item lives, from the package root: the path plate resolves the item's
 * relative URLs against.
 */
export const itemLocation = "items/specimen.xml";

/**
 * The folder, relative to the item, every file it names lives in.
 */
const mediaFolder = "media";

/**
 * Draw a placeholder: a grey frame crossed corner to corner, its label and size printed in the
 * middle, and any marks a kind draws over it.
 *
 * @param size Its size.
 * @param label What it prints above its size.
 * @param marks SVG markup drawn over it, in its pixel coordinates: a graphic kind's areas.
 * @returns The SVG document.
 */
export const placeholder = (size: Size, label: string, marks: readonly string[]): string => {
  const { height, width } = size;
  const font = Math.max(8, Math.round(Math.min(width, height) / 10));

  return element(
    "svg",
    {
      height,
      viewBox: `0 0 ${String(width)} ${String(height)}`,
      width,
      xmlns: "http://www.w3.org/2000/svg",
    },
    [
      element(
        "rect",
        {
          fill: "#e6e6e6",
          height: height - 2,
          stroke: "#7a7a7a",
          "stroke-width": 2,
          width: width - 2,
          x: 1,
          y: 1,
        },
        [],
      ),
      element(
        "path",
        {
          d: `M0 0L${String(width)} ${String(height)}M${String(width)} 0L0 ${String(height)}`,
          stroke: "#c4c4c4",
        },
        [],
      ),
      element(
        "text",
        {
          "font-family": "sans-serif",
          "font-size": font,
          "text-anchor": "middle",
          x: width / 2,
          y: height / 2 - font * 0.2,
        },
        [text(label)],
      ),
      element(
        "text",
        {
          "font-family": "sans-serif",
          "font-size": font,
          "text-anchor": "middle",
          x: width / 2,
          y: height / 2 + font,
        },
        [text(`${String(width)} × ${String(height)}`)],
      ),
      ...marks,
    ],
  );
};

/**
 * A file an item names: the URL the item writes, relative to it, and its entry of `assets`.
 */
export interface Placed {
  readonly asset: Asset;
  readonly src: string;
}

/**
 * Place a file beside the item: named `media/<name>` in the item, and given its address.
 *
 * @param name Its file name, unique within the case's item.
 * @param address Its address: a `data:` URL, or any URL with no whitespace that neither starts nor
 *   ends with a comma.
 * @returns The file as the item names it.
 */
export const placed = (name: string, address: string): Placed => ({
  asset: [
    `${itemLocation.slice(0, itemLocation.lastIndexOf("/") + 1)}${mediaFolder}/${name}`,
    address,
  ],
  src: `${mediaFolder}/${name}`,
});

/**
 * An SVG document's `data:` URL: percent-encoded, so it holds no whitespace and ends in no comma.
 *
 * @param svg The document.
 * @returns Its address.
 */
export const svgAddress = (svg: string): string => `data:image/svg+xml,${encodeURIComponent(svg)}`;

/**
 * A picture as an item shows it: its `img` markup, and the file it names.
 */
interface Shown {
  readonly file: Placed;
  readonly markup: string;
}

/**
 * Write a picture as an item's `img`: its placeholder placed beside the item, printing its label,
 * its shape and its size, its alt text its label, and its authored size.
 *
 * @param picture The picture.
 * @param label What it shows, which it prints and its alt text says; unique within the item, since
 *   it names the file.
 * @returns The `img` markup and its file.
 */
export const image = (picture: Picture, label: string): Shown => {
  const size = sizeOf(picture);
  const file = placed(
    `${label.toLowerCase().replaceAll(/[^a-z0-9]+/gu, "-")}-${picture.aspect}-${picture.scale}.svg`,
    svgAddress(placeholder(size, `${label}, ${picture.aspect}`, [])),
  );

  return {
    file,
    markup: element(
      "img",
      { alt: label, height: size.height, src: file.src, width: size.width },
      [],
    ),
  };
};
