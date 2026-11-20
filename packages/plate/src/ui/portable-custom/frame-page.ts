/**
 * The frame page of a Portable Custom Interaction (Q-16): the one document every PCI's sandboxed
 * frame loads, which a host serves at a URL of its own (the `loader` of its `pci` facts,
 * `PciHostFacts` in `#plate/pci/host.ts`), with the response headers {@link framePage} gives. The
 * page holds no item's data: the island sends the PCI's content and routes once the frame has
 * booted (`#plate/ui/portable-custom/protocol.ts`), so one static page serves every PCI and a host
 * may cache it.
 *
 * Its one script is the frame boot (`#plate/ui/portable-custom/frame-boot.ts`), inline, allowed by
 * its SHA-256 hash in the page's own content-security policy, with `'strict-dynamic'`, so the
 * module scripts the boot adds run, wherever their routes point, while no other inline script,
 * event-handler attribute or `javascript:` URL does: the markup the island sends is written with
 * `innerHTML`, and nothing in it runs. `script-src` carries no `'unsafe-inline'`. The policy's own
 * `sandbox allow-scripts` keeps the page's origin opaque even when it is opened outside a frame,
 * so it never runs as the host's origin, and `frame-ancestors 'self'` lets only the host's own
 * pages frame it.
 *
 * What a PCI may fetch is held to `https:` (and `data:` and `blob:` URLs for images, media and
 * fonts): its stylesheets, images, media, fonts and its own requests. Its inline styles apply:
 * `style-src` allows `'unsafe-inline'`, in this page alone, so a `style` element or a `style`
 * attribute that the PCI or its markup writes styles it, as PCIs commonly style themselves. That is
 * safe here because the frame's origin is opaque (the sandbox never allows `allow-same-origin`):
 * an inline style styles the frame's own document and reaches nothing of the host's.
 *
 * The page supports both colour schemes, `color-scheme` `light dark` in its `meta`, so it takes the
 * scheme of the frame that holds it: "In embedded documents (such as an iframe or an SVG img), the
 * embedding element's element color scheme is used as the embedded document's preferred color
 * scheme (treated as a normal color scheme preference), rather than the user's preference" (CSS
 * Color Adjustment 1, Editor's Draft, section 2.1). So a PCI's `prefers-color-scheme` reads the
 * host's scheme, its text defaults to that scheme's, and the page's canvas stays transparent over
 * the frame's own surface. A page that named no scheme would be light alone, and in a dark host
 * "the UA must use an opaque canvas of the Canvas color appropriate to the embedded document's used
 * color scheme" where the two schemes differ (section 2.2 of the Candidate Recommendation): a white
 * page in a dark one.
 *
 * @module
 * @see https://www.w3.org/TR/CSP3/#strict-dynamic-usage
 * @see https://www.w3.org/TR/CSP3/#directive-style-src
 * @see https://www.w3.org/TR/CSP3/#directive-sandbox
 * @see https://html.spec.whatwg.org/multipage/iframe-embed-object.html#attr-iframe-sandbox
 * @see https://drafts.csswg.org/css-color-adjust-1/#color-scheme-page
 * @see https://www.w3.org/TR/css-color-adjust-1/#color-scheme-effect
 * @see https://html.spec.whatwg.org/multipage/semantics.html#meta-color-scheme
 */
import { Effect } from "effect";
import { Digest } from "effect/crypto";
import { Base64 } from "effect/encoding";
import { bootFrame } from "#plate/ui/portable-custom/frame-boot.ts";

/**
 * The frame page as a host serves it: its HTML, and the response headers it is served with, the
 * content-security policy among them.
 */
export interface FramePage {
  /**
   * The response headers, by name, each to be sent as written: the content type, the
   * content-security policy that allows the boot by its hash, `X-Content-Type-Options: nosniff`
   * and `Referrer-Policy: no-referrer`, so no module request names the page that framed it.
   */
  readonly headers: Readonly<Record<string, string>>;
  /**
   * The page's HTML: a document whose body holds only the boot, as one inline script.
   */
  readonly html: string;
}

/**
 * The boot as the page writes it: the function's source text, run once in strict mode, as the
 * PCI contract asks of the context a PCI's code runs in. The text holds no `</script` and no
 * `<!--`, which would end or bend the script element: the boot's source has neither.
 */
const script = `"use strict";(${String(bootFrame)})();`;

/**
 * Write the frame page's content-security policy, with the boot's hash as its one script source.
 *
 * @param hash The SHA-256 of the boot's text, in base64.
 * @returns The policy, its directives separated by `; `.
 */
const policyOf = (hash: string): string =>
  [
    "default-src 'none'",
    `script-src 'sha256-${hash}' 'strict-dynamic'`,
    "style-src https: 'unsafe-inline'",
    "img-src https: data: blob:",
    "media-src https: data: blob:",
    "font-src https: data:",
    "connect-src https:",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'self'",
    "sandbox allow-scripts",
  ].join("; ");

/**
 * The frame page's HTML, its boot the inline script at the end of its body, where the boot finds
 * the body it writes the PCI's `dom` into. Its colour schemes are a `meta`, which the page reads
 * before any stylesheet a PCI loads, "to aid user agents in rendering the page background with the
 * desired color scheme immediately (rather than waiting for all CSS in the page to load)".
 */
const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light dark"><title></title></head><body><script>${script}</script></body></html>`;

/**
 * Give the frame page a host serves for every Portable Custom Interaction, at the URL it names as
 * the `loader` of its `pci` facts: the HTML, and the headers to serve it with. The page is the
 * same on every call, so a host may cache it, and serves it to any request: it holds nothing of
 * an item or a candidate.
 *
 * @example
 *   const page = yield * framePage;
 *   return new Response(page.html, { headers: page.headers });
 *
 * @returns The page, its policy allowing the boot by the boot's SHA-256, which the host's
 *   `Digest` service computes (`Digest.layerWebCrypto` from `effect/crypto`).
 */
export const framePage: Effect.Effect<FramePage, never, Digest.Digest> = Effect.gen(
  function* writeFramePage() {
    const digest = yield* Digest.Digest;
    const hash = yield* digest.digest(Digest.sha256, new TextEncoder().encode(script));

    return {
      headers: {
        "Content-Security-Policy": policyOf(Base64.encode(hash)),
        "Content-Type": "text/html; charset=utf-8",
        "Referrer-Policy": "no-referrer",
        "X-Content-Type-Options": "nosniff",
      },
      html,
    };
  },
);
