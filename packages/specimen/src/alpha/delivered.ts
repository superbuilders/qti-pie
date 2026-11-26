/**
 * The one way the alpha suites press into a Portable Custom Interaction's document: a tap, a click,
 * or the press that starts a drag succeeds only once the document reports the `pointerdown` it
 * received, and a press it never received fails as `tap not delivered`, never as the rule's own
 * failure.
 *
 * A PCI's frame is a sandboxed document of an opaque origin, which Chrome renders in a process of
 * its own. Its frame posts `ready` from its script, which says nothing of the browser: until the
 * browser can hit-test the new frame, a press at its place lands on the host page and is lost,
 * and a rule that then reads the PCI reads a part never pressed. So each press first waits for two
 * of the document's own frames, which come only once it paints, then presses, then waits for two
 * more, which come after every input event sent before them, and reads how many presses the
 * document received: one more, or the press was not delivered. Every wait ends on the document's
 * frames, which come whether the page is right or broken; none on a delay.
 *
 * Test support for the alpha suites under `src/alpha/`.
 *
 * @module
 * @see https://html.spec.whatwg.org/multipage/imagebitmap-and-animations.html#animation-frames
 * @see https://w3c.github.io/pointerevents/#the-pointerdown-event
 */
import { Data, Effect } from "effect";
import type { Frame } from "playwright-core";

/**
 * A press the harness sent into a PCI's document that the document never received: the browser
 * gave it to the host page, or to nothing.
 */
export class TapNotDelivered extends Data.TaggedError("TapNotDelivered")<{
  readonly step: string;
}> {
  /**
   * The press that was lost.
   */
  override get message(): string {
    return `tap not delivered: ${this.step} reached no pointerdown in the PCI's document, so the rule's reading after it would be of a press never made`;
  }
}

declare global {
  interface Window {
    /**
     * How many presses the document has received since the harness first asked, once it has.
     */
    pressesReceived?: number;
  }
}

/**
 * Count, in the PCI's document, every press it receives from now on, where it counts none yet: a
 * `pointerdown` heard at its window as it is captured, before any of the PCI's own listeners can
 * stop it. Then wait for two of the document's frames and give the count.
 *
 * @returns How many presses the document has received.
 */
const pressesReceived = async (): Promise<number> => {
  if (window.pressesReceived === undefined) {
    window.pressesReceived = 0;
    window.addEventListener(
      "pointerdown",
      () => {
        window.pressesReceived = (window.pressesReceived ?? 0) + 1;
      },
      { capture: true },
    );
  }

  const first = Promise.withResolvers<number>();

  requestAnimationFrame(first.resolve);
  await first.promise;

  const second = Promise.withResolvers<number>();

  requestAnimationFrame(second.resolve);
  await second.promise;

  return window.pressesReceived;
};

/**
 * Press into a PCI's document, and succeed only once the document reports the press: after two of
 * its frames, the press, then two more, it has received one press more than before.
 *
 * @param frame The PCI's document's frame: the frame it stands in, or the page where it stands at
 *   the top of its tab.
 * @param attempt The harness's own run of a promise of Chrome's, which fails as the harness does.
 * @param step The press, for a failure.
 * @param press The press: a click, a tap, or the press that starts a drag, which makes one new
 *   pointer.
 * @returns The press, delivered.
 */
export const pressInto = <F>(
  frame: Frame,
  attempt: <A>(step: string, run: () => Promise<A>) => Effect.Effect<A, F>,
  step: string,
  press: Effect.Effect<void, F>,
): Effect.Effect<void, F | TapNotDelivered> =>
  Effect.gen(function* delivered() {
    const before = yield* attempt(`count the presses before ${step}`, () =>
      frame.evaluate(pressesReceived),
    );

    yield* press;

    const after = yield* attempt(`count the presses after ${step}`, () =>
      frame.evaluate(pressesReceived),
    );

    yield* after > before ? Effect.void : Effect.fail(new TapNotDelivered({ step }));
  });
