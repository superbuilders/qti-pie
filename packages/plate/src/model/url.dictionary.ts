/**
 * The closed vocabulary `url.test.ts` exhausts, the domain itself, never cases a person chose:
 * HTML attributes, each with the kind of URL it holds.
 *
 * @module
 */
import { dictionary } from "@bjornpagen/testing/dictionary";

/**
 * An HTML attribute and the kind of URL it holds, as `#plate/model/url.ts`'s `UrlContext` names
 * the kinds, or `none` for an attribute that holds no URL.
 */
export interface HtmlAttribute {
  readonly attribute: string;
  readonly context: "embed" | "link" | "none" | "resource" | "srcset";
  readonly element: string;
}

/**
 * HTML attributes of every kind of URL the classifier reads, by HTML's own definitions of them: a
 * hyperlink's `href`, followed and never fetched (`link`); an image's `src` and a video's
 * `poster`, fetched as media (`resource`); an object's `data`, a nested document (`embed`); a
 * picture source's `srcset`, a list of image candidates (`srcset`); and two that hold no URL, an
 * image's `alt`, its text, and `src` on a paragraph, which HTML gives no such attribute.
 */
export const htmlAttributes = dictionary<HtmlAttribute>([
  { attribute: "href", context: "link", element: "a" },
  { attribute: "src", context: "resource", element: "img" },
  { attribute: "poster", context: "resource", element: "video" },
  { attribute: "data", context: "embed", element: "object" },
  { attribute: "srcset", context: "srcset", element: "source" },
  { attribute: "alt", context: "none", element: "img" },
  { attribute: "src", context: "none", element: "p" },
]);
