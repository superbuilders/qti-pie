"use client";

/**
 * A sitting's presence beacon in the page, one implementation for every host (edullm's QTI app,
 * metis): while a question of the sitting is on screen, the page in front of the child, its window
 * focused, and the child's last touch within {@link presenceIdleMillis}, the page posts an empty
 * beacon to the host's own route every {@link presenceBeaconPeriodMillis}, carrying the sitting's
 * key alone. Each condition is read at the tick, never tracked from blur and focus events, so focus
 * inside a calculator or a Portable Custom Interaction's frame still counts. The ledger keeps what
 * the beacons witness, one window from a stretch's first beacon to its last (`@qti-pie/ledger`'s
 * `beaconTest`), and derives time from it when read, so a beacon that gets no answer is presence
 * not witnessed: nothing sends it again, and the next tick's beacon is the next witness.
 *
 * Its route is the host's own, never a server action: Next runs a page's server actions one at a
 * time, so a beacon would wait behind a save and a save behind a beacon.
 *
 * @module
 */
import { Effect } from "effect";
import { useEffect, useEffectEvent } from "react";

/**
 * How often the page posts the beacon while its conditions hold: the owner's period, with the
 * ledger's grace of three periods (`@qti-pie/ledger`'s `presenceGraceMicros`).
 *
 * @limitKind published
 * @owner Bjorn, the owner, in the presence design he approved on 2026-11-23
 * @unit milliseconds
 * @scope the interval between two presence beacons one page posts for its sitting while a question
 *   is on screen
 * @constraint protocol constant
 * @source edullm's out/rc-cutover/decisions-for-bjorn.html, item 2a, approved "2 a yes"; the
 *   design is out/rc-cutover/PRESENCE.md, "The browser: one shared hook"
 * @quote Then it posts an empty beacon every **1 s**, carrying only the sitting's key.
 * @verified 2026-11-23
 */
export const presenceBeaconPeriodMillis = 1000;

/**
 * How long the page goes without the child's input before its beacon stops: AlphaTest's idle
 * limit, after which its player closed the question's clock as idle. Input starts it again.
 *
 * @limitKind published
 * @owner AlphaTest's player (mastery-track-player 941a86a, hooks/test/questionTimePolicy.ts)
 * @unit milliseconds
 * @scope the time since the child's last input on one sitting's page
 * @constraint configurable default
 * @source https://github.com/trilogy-group/mastery-track-player/blob/941a86a/src/hooks/test/questionTimePolicy.ts#L2
 * @quote export const QUESTION_IDLE_MS = 5 * 60_000;
 * @verified 2026-11-23
 */
export const presenceIdleMillis = 5 * 60_000;

/**
 * The window events that are the child's input, as AlphaTest's player listens for them.
 */
const inputs = [
  "pointermove",
  "pointerdown",
  "click",
  "keydown",
  "beforeinput",
  "input",
  "scroll",
  "touchstart",
] as const;

/**
 * What a host hands the beacon.
 */
export interface PresenceBeacon {
  /**
   * Whether a question of the sitting is on screen: the beacon posts nothing otherwise.
   */
  readonly answering: boolean;
  /**
   * Hear the route's answer to a post that got one: a host that reads its refusals (a superseded
   * session, a closed sitting) learns of them within a period. A post that got none is not heard.
   *
   * @param response The route's answer.
   */
  readonly answered: (response: Response) => void;
  /**
   * The beacon's whole body: the sitting's key, encoded by the host as its route decodes it.
   */
  readonly body: string;
  /**
   * Renew the host's session credential before each post, as each of its writes renews it
   * (Clerk's `getToken`). A renewal that rejects, a session lapsed or signed out among them,
   * sends nothing.
   *
   * @returns The renewal.
   */
  readonly renew: () => Promise<void>;
  /**
   * The host's beacon route, on the page's origin.
   */
  readonly route: string;
}

/**
 * Post the sitting's presence beacon while a question of it is on screen and the child is at it:
 * once at once, then every {@link presenceBeaconPeriodMillis}, each tick posting only where the page
 * is visible, its window has focus, and the child's last input is within {@link presenceIdleMillis},
 * the page's showing of the question counting as one. Every post is one `fetch` that outlives the
 * page (`keepalive`), never awaited by the next: no retry, no queue and no count.
 *
 * @param beacon What the host hands the beacon ({@link PresenceBeacon}).
 */
export const usePresenceBeacon = ({
  answering,
  answered,
  body,
  renew,
  route,
}: PresenceBeacon): void => {
  /**
   * One post of the beacon, renewed first, its answer heard, and its failure, the renewal's or the
   * network's, presence not witnessed.
   */
  const post = useEffectEvent(() => {
    Effect.tryPromise(renew).pipe(
      Effect.andThen(
        Effect.tryPromise(() => fetch(route, { body, keepalive: true, method: "POST" })),
      ),
      Effect.tap((response) =>
        Effect.sync(() => {
          answered(response);
        }),
      ),
      Effect.ignore,
      Effect.runFork,
    );
  });

  useEffect((): (() => void) | undefined => {
    if (!answering) {
      return undefined;
    }

    let touched = performance.now();
    const touch = () => {
      touched = performance.now();
    };
    const listeners = new AbortController();
    for (const input of inputs) {
      window.addEventListener(input, touch, {
        capture: true,
        passive: true,
        signal: listeners.signal,
      });
    }

    const tick = () => {
      if (
        document.visibilityState === "visible" &&
        document.hasFocus() &&
        performance.now() - touched < presenceIdleMillis
      ) {
        post();
      }
    };

    tick();

    const ticks = window.setInterval(tick, presenceBeaconPeriodMillis);

    return () => {
      listeners.abort();
      window.clearInterval(ticks);
    };
  }, [answering]);
};
