/**
 * The island's acknowledgment of a height its PCI's frame posted (`PageLanded` and `PageSettled` of
 * `#plate/ui/portable-custom/protocol.ts`), as one function, {@link landHeight}: plate's island
 * runs it (`hostFrame` in `#plate/ui/portable-custom/host.ts`), and a page that stands in for the
 * island in a test writes its source text into its own script, so every island acknowledges as
 * plate's does.
 *
 * **Why one function.** A test's page takes `landHeight`'s source text,
 * `Function.prototype.toString`'s, as the frame page takes the frame boot's
 * (`#plate/ui/portable-custom/frame-page.ts`), so the function reaches nothing outside itself but
 * the page's globals, and this module imports types alone.
 *
 * @module
 * @see https://html.spec.whatwg.org/multipage/imagebitmap-and-animations.html#animation-frames
 */
import type { PageLanded, PageSettled } from "#plate/ui/portable-custom/protocol.ts";

/**
 * Apply a height the frame posted and acknowledge it twice: measure the frame element's height,
 * write the height the island gives it, and tell the frame the element's height before and after,
 * laid out, with the page's device pixel ratio (`landed`); then read the element's laid-out height
 * in each animation frame of the page, and once two consecutive frames read it the same, tell the
 * frame the post has settled at it (`settled`), whatever moved the element meanwhile: a CSS
 * transition, a host's script tweening its height frame by frame, a clamp, or nothing.
 *
 * @param frame The frame element.
 * @param pixels The height the frame posted.
 * @param written The height the island writes as the element's `height`: the post, whole, or what
 *   a host's own rule makes of it.
 * @param tell Send the frame a message, which the caller gives the frame's nonce.
 * @constraint The settled height is read, never awaited: an animation may run for ever and its
 *   `finished` never settle, and an infinite `outline-color` pulse on the frame element held an
 *   acknowledgment that waited for every animation's end back for good, the frame at its first
 *   post (CLEAN i7″ and RED i7″, Chrome 158); and a host's script that tweens the element's height
 *   in `requestAnimationFrame`, as GSAP and react-spring do, runs no animation the page can see,
 *   and each of its steps read after an acknowledgment at the apply as the host's own resize ran
 *   the frame to 6,592,961 px in 9 s (RED i7″, TR4). An animation that moves no box holds nothing:
 *   only the height is read.
 * @constraint Two equal frames are the least that tells a height at rest from one moving, and they
 *   settle early only where a motion moves the element by less than the layout unit, 1/64 px, over
 *   a frame: at an ease-in's first frames. The frame then takes its viewport where it stands as the
 *   echo, and the motion's later steps are the host's own resizes, which cost a post only where
 *   the content left the line its slope keeps, and every post is held to the content plus the
 *   viewport as measured (`postPixels` in `#plate/ui/portable-custom/frame-boot.ts`), so an early
 *   settle costs posts the content's own changes would, never a run.
 * @constraint A host that moves the element every frame for ever never settles, and the frame
 *   waits: the element's height is then the host's, which no post of the frame's would hold.
 */
export const landHeight = (
  frame: HTMLIFrameElement,
  pixels: number,
  written: number,
  tell: (message: Omit<PageLanded, "nonce"> | Omit<PageSettled, "nonce">) => void,
): void => {
  const from = frame.getBoundingClientRect().height;

  frame.height = String(written);

  /**
   * Read the element's height in the next animation frame, and tell the frame the post settled
   * there once it reads as it did in the frame before.
   *
   * @param before The height read in the frame before.
   */
  const settling = (before: number): void => {
    requestAnimationFrame(() => {
      const now = frame.getBoundingClientRect().height;

      if (now === before) {
        tell({ height: now, kind: "settled", pixels });
      } else {
        settling(now);
      }
    });
  };

  const applied = frame.getBoundingClientRect().height;

  tell({ from, height: applied, kind: "landed", pixels, ratio: devicePixelRatio });
  requestAnimationFrame(() => {
    settling(frame.getBoundingClientRect().height);
  });
};
