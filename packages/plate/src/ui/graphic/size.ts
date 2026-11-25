/**
 * The pixel space of a graphic interaction's image, the space its areas' coordinates are in: the
 * size the author wrote on the image (`AuthoredSize`, which the core reads once, at its parse, in
 * `#plate/interactions/image-size.ts`), completed by the image's natural size where the author left
 * a dimension unwritten. Pure, and safe to import on the server and the client.
 *
 * @module
 */
import type { AuthoredSize, ImageSize } from "#plate/interactions/image-size.ts";

/**
 * Give an image's pixel space, the space its areas' coordinates are in: the author's `width` and
 * `height` when both are written; one of them with the other from the natural aspect, as the
 * browser draws an image given one; the natural size when neither is.
 *
 * The natural size is the image's own, once the client has it: an `img`'s natural width and
 * height, and for an `object`, which reports none, the size of the image its `data` names, which an
 * `object` the author gave no size is laid out at. The stage reports only a positive one, and an
 * image that loaded nothing reports none, so the space is unknown wherever the author did not
 * write it in full; the server, which reads no image, knows it only where the author wrote both.
 *
 * @param authored The author's size.
 * @param natural The image's natural size, none until it is known and always none on the server.
 * @returns The size, or none while it is unknown.
 * @see https://html.spec.whatwg.org/multipage/embedded-content-other.html#dimension-attributes
 */
export const sizeOf = (authored: AuthoredSize, natural?: ImageSize): ImageSize | undefined => {
  switch (authored.kind) {
    case "both": {
      return authored.size;
    }
    case "height": {
      return natural === undefined
        ? undefined
        : { height: authored.height, width: (authored.height * natural.width) / natural.height };
    }
    case "neither": {
      return natural;
    }
    case "width": {
      return natural === undefined
        ? undefined
        : { height: (authored.width * natural.height) / natural.width, width: authored.width };
    }
  }
};
