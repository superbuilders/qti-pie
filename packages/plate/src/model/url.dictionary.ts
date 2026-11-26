/**
 * The closed vocabulary `url.test.ts` exhausts, the domain itself, never cases a person chose:
 * HTML attributes, each with the kind of URL it holds, and the ASI XSD's URL attributes, each
 * with its type.
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

/**
 * A URL attribute the ASI XSD declares (QTI 3.0.1's `imsqti_asiv3p0p1_v1p0.xsd`), the XSD type it
 * gives the attribute's value, and where a relative value resolves from: the item's directory, or
 * the package root, as an interaction module's paths and configurations do (reading
 * `pci-module-locations`).
 */
export interface AsiUrlAttribute {
  readonly attribute: string;
  readonly element: string;
  readonly from: "item" | "package root";
  readonly type: "URLDType" | "xs:anyURI" | "xs:string";
}

/**
 * The URL attributes of the ASI XSD an item's content and its interaction modules hold, each typed
 * as the XSD types it: `xs:anyURI` for a link's, a citation's, a long description's, an image's
 * source, a stimulus reference's and an interaction module's; `URLDType`, an `xs:normalizedString`,
 * for a media element's source and a video's poster; and `xs:string` for an object's data.
 */
export const asiUrlAttributes = dictionary<AsiUrlAttribute>([
  { attribute: "href", element: "a", from: "item", type: "xs:anyURI" },
  { attribute: "src", element: "audio", from: "item", type: "URLDType" },
  { attribute: "cite", element: "blockquote", from: "item", type: "xs:anyURI" },
  { attribute: "longdesc", element: "img", from: "item", type: "xs:anyURI" },
  { attribute: "src", element: "img", from: "item", type: "xs:anyURI" },
  { attribute: "data", element: "object", from: "item", type: "xs:string" },
  { attribute: "cite", element: "q", from: "item", type: "xs:anyURI" },
  { attribute: "href", element: "qti-assessment-stimulus-ref", from: "item", type: "xs:anyURI" },
  {
    attribute: "fallback-path",
    element: "qti-interaction-module",
    from: "package root",
    type: "xs:anyURI",
  },
  {
    attribute: "primary-path",
    element: "qti-interaction-module",
    from: "package root",
    type: "xs:anyURI",
  },
  {
    attribute: "primary-configuration",
    element: "qti-interaction-modules",
    from: "package root",
    type: "xs:anyURI",
  },
  {
    attribute: "secondary-configuration",
    element: "qti-interaction-modules",
    from: "package root",
    type: "xs:anyURI",
  },
  { attribute: "src", element: "source", from: "item", type: "URLDType" },
  { attribute: "src", element: "track", from: "item", type: "URLDType" },
  { attribute: "poster", element: "video", from: "item", type: "URLDType" },
  { attribute: "src", element: "video", from: "item", type: "URLDType" },
]);
