/**
 * Read-aloud's session over one item: which of the item's read-aloud controls plays, and at which
 * the notice of a press that cannot play stands. A state machine over what the controls report
 * ({@link heard}), pure, so its rules are checked apart from any browser (`session.test.ts`);
 * `<Item>`'s client provider holds one per item, carries out its commands on the controls and shows
 * each control what the session holds of it ({@link shownAt}), its toggle pressed while it plays
 * and its notice while it is told (`ReadAloudItem` in `#plate/ui/read-aloud/session.tsx`), so a
 * control shows the session's state and nothing else's.
 *
 * A control's recording is its own part's, "the audio as an alternative to the written text
 * provided in the default content" (implementation guide §5.2.8.3), and QTI states no sequencing of
 * spoken recordings, so a control plays its own part and no other's. The one order the guide gives
 * a play (§5.1.2.4: "The sequence of play is determined by the order of reference from the
 * qti-item-body content") is the sign-language support's: it orders the videos of an item's
 * portions, and starts none.
 *
 * - **A press.** A press of a control plays its own recording alone, from its start, and stops the
 *   one playing; a press of the control playing stops it, whether or not its recording has begun to
 *   sound, since the session, not the page, says what plays. Nothing plays but at a press: a
 *   recording that ends, stops or cannot play is followed by nothing.
 * - **Stopping.** A stop by anything else (another media's play, the page hidden) and an unmount of
 *   the playing control leave the item at rest, as moving to another item does: the provider, keyed
 *   by the item's instance, unmounts every control with it.
 * - **The notice.** A press whose recording cannot play is told so, at its control
 *   ({@link interrupts} says which refusals are no failure), until the next press, as AlphaTest's
 *   player tells it (mastery-track-player at 941a86a, `src/utils/audio-failure.ts`). A refusal of a
 *   control that is not playing belongs to no press and is told nothing.
 *
 * @module
 */

/**
 * An item's read-aloud session: `playing`, its `control` playing its own part; `told`, nothing
 * playing and the notice of the latest press standing at its `control`, whose recording could not
 * play; `resting`, nothing playing and no notice standing. A notice stands only while nothing
 * plays: the press that plays a control takes it down.
 *
 * @template Control The controls, each told apart from another by identity alone.
 */
export type Session<Control> =
  | { readonly control: Control; readonly kind: "playing" }
  | { readonly control: Control; readonly kind: "told" }
  | { readonly kind: "resting" };

/**
 * The session every item opens with: nothing plays and no notice stands.
 */
export const newSession: Session<never> = { kind: "resting" };

/**
 * What one control shows of its item's session: `playing` while the session plays it, `told` while
 * the notice stands at it, `resting` otherwise.
 */
export type Shown = Session<unknown>["kind"];

/**
 * Give what a control shows of its item's session.
 *
 * @param session The session.
 * @param control The control.
 * @returns `playing` or `told` where the session plays it or tells at it, else `resting`.
 */
export const shownAt = <Control>(session: Session<Control>, control: Control): Shown =>
  session.kind !== "resting" && session.control === control ? session.kind : "resting";

/**
 * Why a recording would not play, as the browser said it: `rejected`, the promise `play()` gave
 * rejected with `cause`; `media-error`, a `MediaError` of `code` reached the `audio`; `no-source`,
 * every one of its `source`s failed, so it holds nothing to play.
 */
export type Refusal =
  | { readonly cause: unknown; readonly kind: "rejected" }
  | { readonly code: number; readonly kind: "media-error" }
  | { readonly kind: "no-source" };

/**
 * What a control reports to its item's session: `press`, a press of it, which plays it, or stops it
 * while the session plays it; `stopped`, its recording no longer plays, played to its end or
 * stopped otherwise (another media's play, the page hidden, the session's own command), reported
 * only while the recording does not play again, since a press that plays it again overtakes a stop
 * the page has yet to report; `refused`, its recording would not play; and `unmounted`, the control
 * left the page.
 *
 * @template Control The controls.
 */
export type Report<Control> =
  | { readonly control: Control; readonly kind: "press" }
  | { readonly control: Control; readonly kind: "refused"; readonly refusal: Refusal }
  | { readonly control: Control; readonly kind: "stopped" }
  | { readonly control: Control; readonly kind: "unmounted" };

/**
 * What the session asks of a control: `play` its recording from the start, or `stop` it.
 *
 * @template Control The controls.
 */
export interface Command<Control> {
  readonly act: "play" | "stop";
  readonly control: Control;
}

/**
 * A session after a report, and the commands that carry it out, in the order they run.
 *
 * @template Control The controls.
 */
export interface Turn<Control> {
  readonly commands: readonly Command<Control>[];
  readonly session: Session<Control>;
}

/**
 * The code of a `MediaError` whose fetch the user agent aborted at the page's request, as when
 * the page stopped or reloaded the recording (HTML's `MEDIA_ERR_ABORTED`).
 *
 * @see https://html.spec.whatwg.org/multipage/media.html#dom-mediaerror-media_err_aborted
 */
const mediaErrAborted = 1;

/**
 * Tell whether a refusal interrupts a recording rather than fails it: `play()` rejected with an
 * `AbortError`, which it does only when the page paused or reloaded the recording before it
 * played, or a `MediaError` of `MEDIA_ERR_ABORTED`. Each follows a stop the session or the page
 * made, so no child is told it failed; every other refusal is a failure.
 *
 * @param refusal The refusal.
 * @returns Whether it interrupts.
 * @see https://html.spec.whatwg.org/multipage/media.html#dom-media-play
 * @see https://github.com/beyondai-projects/mastery-track-player/blob/941a86a/src/utils/audio-failure.ts#L69-L83
 */
const interrupts = (refusal: Refusal): boolean => {
  switch (refusal.kind) {
    case "media-error": {
      return refusal.code === mediaErrAborted;
    }
    case "no-source": {
      return false;
    }
    case "rejected": {
      return refusal.cause instanceof DOMException && refusal.cause.name === "AbortError";
    }
  }
};

/**
 * Tell whether a session plays a control.
 *
 * @param session The session.
 * @param control The control.
 * @returns Whether it is the control playing.
 */
const plays = <Control>(session: Session<Control>, control: Control): boolean =>
  session.kind === "playing" && session.control === control;

/**
 * Write one command.
 *
 * @param act What the control is asked.
 * @param control The control.
 * @returns The command.
 */
const command = <Control>(act: Command<Control>["act"], control: Control): Command<Control> => ({
  act,
  control,
});

/**
 * Answer a press of a control: the control the session plays stops, and the item rests; any other
 * plays its own part alone, the control playing before it stopping first, and the latest notice
 * comes down.
 *
 * @param session The session.
 * @param control The control pressed.
 * @returns The turn.
 */
const pressed = <Control>(session: Session<Control>, control: Control): Turn<Control> => {
  if (plays(session, control)) {
    return { commands: [command("stop", control)], session: newSession };
  }

  return {
    commands: [
      ...(session.kind === "playing" ? [command("stop", session.control)] : []),
      command("play", control),
    ],
    session: { control, kind: "playing" },
  };
};

/**
 * Hear a report of one of the item's controls: the session after it, and the commands that carry
 * it out. A report of a control the session neither plays nor tells at changes nothing, but a
 * press, which plays it.
 *
 * @param session The session.
 * @param report What the control reports.
 * @returns The turn.
 */
export const heard = <Control>(
  session: Session<Control>,
  report: Report<Control>,
): Turn<Control> => {
  const unchanged: Turn<Control> = { commands: [], session };

  switch (report.kind) {
    case "press": {
      return pressed(session, report.control);
    }
    case "refused": {
      return interrupts(report.refusal) || !plays(session, report.control)
        ? unchanged
        : {
            commands: [command("stop", report.control)],
            session: { control: report.control, kind: "told" },
          };
    }
    case "stopped": {
      return plays(session, report.control) ? { commands: [], session: newSession } : unchanged;
    }
    case "unmounted": {
      return shownAt(session, report.control) === "resting"
        ? unchanged
        : { commands: [], session: newSession };
    }
  }
};
