/**
 * Read-aloud's session over one item: which of the item's read-aloud controls plays, the chain the
 * item's first press starts where it is a prompt's, and the notice a press gets that cannot play.
 * A state machine over what the controls report ({@link heard}), pure, so its rules are checked
 * apart from any browser (`session.test.ts`); `<Item>`'s client provider holds one per item and
 * carries out its commands on the controls (`ReadAloudSession` in
 * `#plate/ui/read-aloud/session.tsx`).
 *
 * The rules are AlphaTest's player's, which pre-readers' tests read aloud by (mastery-track-player
 * at 941a86a, `src/contexts/TtsSessionContext.tsx` lines 96–159, `src/utils/audio-failure.ts`):
 *
 * - **The chain.** The item's first press, where it plays a prompt, plays that prompt, then every
 *   other control mounted at the press, prompts before text before choices ({@link ranks}), each
 *   rank in document order, one after another as each ends. A control unmounted before its turn is
 *   skipped, and one that cannot play is told once and passed over.
 * - **Alone.** Any other press, a later press of a prompt included, plays its own part alone.
 * - **Cancelling.** A press of another control, a press that stops the playing one, a stop by
 *   anything else (another media's play, the page hidden) and an unmount of the playing one end the
 *   chain, as moving to another item does: the provider, keyed by the item's instance, unmounts
 *   every control with it.
 * - **The notice.** A press whose recording cannot play, or a chain any of whose recordings cannot,
 *   is told so once, at the first control that cannot ({@link interrupts} says which refusals are
 *   no failure), and the next press takes the notice down. A refusal of a control that is not
 *   playing belongs to no press and is told nothing.
 *
 * @module
 */
import { Array as Arr, Option } from "effect";

/**
 * What a read-aloud control reads, as its place in a chain orders it: an interaction's `prompt`,
 * the `text` of an element of the body or a stimulus, or a `choice`, which the child picks, moves,
 * orders or fills, a Match's group and a graphic interaction's area among them. AlphaTest's player
 * names them `prompt`, `stimulus` and `option`.
 */
export type ReadAloudRole = "choice" | "prompt" | "text";

/**
 * The rank of each role in a chain, as AlphaTest's player ranks them (`ROLE_RANK`,
 * `TtsSessionContext.tsx` line 48): a prompt's control plays before a text's, a text's before a
 * choice's.
 */
const ranks = { choice: 2, prompt: 0, text: 1 } as const satisfies Readonly<
  Record<ReadAloudRole, number>
>;

/**
 * What the session reads of a control: its role. A control is told apart from another by identity
 * alone, so two controls of one role are two controls.
 */
export interface ReadAloudControl {
  readonly role: ReadAloudRole;
}

/**
 * Where an item's read-aloud stands: `unpressed`, before any of its controls is pressed, when a
 * press of a prompt's control would start the chain; `resting`, nothing playing, the first press
 * spent; `alone`, one control playing its own part; `chain`, the chain at the control `playing`,
 * the controls `waiting` to play after it, in order.
 *
 * @template Control The controls.
 */
export type Phase<Control> =
  | { readonly kind: "alone"; readonly playing: Control }
  | { readonly kind: "chain"; readonly playing: Control; readonly waiting: readonly Control[] }
  | { readonly kind: "resting" }
  | { readonly kind: "unpressed" };

/**
 * An item's read-aloud session: its phase, and the control at which the notice of the latest
 * press stands, none while that press has not failed.
 *
 * @template Control The controls.
 */
export interface Session<Control> {
  readonly phase: Phase<Control>;
  readonly told: Option.Option<Control>;
}

/**
 * The session of an item no control of which has been pressed.
 */
export const newSession: Session<never> = { phase: { kind: "unpressed" }, told: Option.none() };

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
 * What a control reports to its item's session: `press`, a press to play it, with the controls
 * `mounted` at that moment in document order; `release`, a press that stops it; `ended`, its
 * recording played to its end; `paused`, its recording stopped otherwise, by another media's play,
 * the page hidden or the session's own command; `refused`, its recording would not play; and
 * `unmounted`, the control left the page.
 *
 * @template Control The controls.
 */
export type Report<Control> =
  | { readonly control: Control; readonly kind: "ended" }
  | { readonly control: Control; readonly kind: "paused" }
  | { readonly control: Control; readonly kind: "press"; readonly mounted: readonly Control[] }
  | { readonly control: Control; readonly kind: "refused"; readonly refusal: Refusal }
  | { readonly control: Control; readonly kind: "release" }
  | { readonly control: Control; readonly kind: "unmounted" };

/**
 * What the session asks of a control: `play` its recording from the start, `stop` it, `tell` the
 * child its press cannot play, or `hush`, take that notice down.
 *
 * @template Control The controls.
 */
export interface Command<Control> {
  readonly act: "hush" | "play" | "stop" | "tell";
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
    default: {
      return refusal satisfies never;
    }
  }
};

/**
 * Give the control a phase plays.
 *
 * @param phase The phase.
 * @returns The control playing, none while nothing plays.
 */
const playingOf = <Control>(phase: Phase<Control>): Option.Option<Control> =>
  phase.kind === "alone" || phase.kind === "chain" ? Option.some(phase.playing) : Option.none();

/**
 * Tell whether a phase plays a control.
 *
 * @param phase The phase.
 * @param control The control.
 * @returns Whether it is the control playing.
 */
const plays = <Control>(phase: Phase<Control>, control: Control): boolean =>
  Option.exists(playingOf(phase), (playing) => playing === control);

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
 * Give the commands that take down the latest press's notice, where it stands: what every press
 * runs first.
 *
 * @param session The session.
 * @returns The `hush`, or none while no notice stands.
 */
const hushing = <Control>(session: Session<Control>): readonly Command<Control>[] =>
  Option.toArray(session.told.pipe(Option.map((control) => command("hush", control))));

/**
 * Give the controls a chain plays after the prompt that starts it: every other control mounted at
 * the press, by rank, each rank in document order (a sort is stable).
 *
 * @param prompt The prompt pressed.
 * @param mounted The controls mounted at the press, in document order.
 * @returns The controls, in the order they play.
 */
const chained = <Control extends ReadAloudControl>(
  prompt: Control,
  mounted: readonly Control[],
): readonly Control[] =>
  mounted
    .filter((control) => control !== prompt)
    .toSorted((left, right) => ranks[left.role] - ranks[right.role]);

/**
 * Move on from the control a session plays: to the chain's next control, which then plays, or to
 * rest where the control plays alone or the chain is done.
 *
 * @param session The session, playing a control.
 * @returns The turn.
 */
const onward = <Control>(session: Session<Control>): Turn<Control> => {
  const { phase } = session;

  if (phase.kind === "chain" && Arr.isReadonlyArrayNonEmpty(phase.waiting)) {
    const [next, ...waiting] = phase.waiting;

    return {
      commands: [command("play", next)],
      session: { ...session, phase: { kind: "chain", playing: next, waiting } },
    };
  }

  return { commands: [], session: { ...session, phase: { kind: "resting" } } };
};

/**
 * Pass a control by: the phase without it, at rest where it is the control playing, and a chain
 * that would play it later playing on without it.
 *
 * @param phase The phase.
 * @param control The control, which left the page.
 * @returns The phase after it left.
 */
const without = <Control>(phase: Phase<Control>, control: Control): Phase<Control> => {
  if (plays(phase, control)) {
    return { kind: "resting" };
  }

  return phase.kind === "chain"
    ? { ...phase, waiting: phase.waiting.filter((other) => other !== control) }
    : phase;
};

/**
 * Answer a press to play a control: it plays, the chain where the item's first press plays a
 * prompt, else alone; the control playing before stops, and the latest notice comes down.
 *
 * @param session The session.
 * @param control The control pressed.
 * @param mounted The controls mounted at the press, in document order.
 * @returns The turn.
 */
const pressed = <Control extends ReadAloudControl>(
  session: Session<Control>,
  control: Control,
  mounted: readonly Control[],
): Turn<Control> => ({
  commands: [
    ...hushing(session),
    ...Option.toArray(
      playingOf(session.phase).pipe(
        Option.filter((playing) => playing !== control),
        Option.map((playing) => command("stop", playing)),
      ),
    ),
    command("play", control),
  ],
  session: {
    phase:
      session.phase.kind === "unpressed" && control.role === "prompt"
        ? { kind: "chain", playing: control, waiting: chained(control, mounted) }
        : { kind: "alone", playing: control },
    told: Option.none(),
  },
});

/**
 * Answer a recording that cannot play: it stops, the press is told where it has not been yet, and
 * the chain moves on past it.
 *
 * @param session The session, playing the control.
 * @param control The control.
 * @returns The turn.
 */
const failed = <Control>(session: Session<Control>, control: Control): Turn<Control> => {
  const next = onward(session);

  return {
    commands: [
      command("stop", control),
      ...(Option.isNone(session.told) ? [command("tell", control)] : []),
      ...next.commands,
    ],
    session: { ...next.session, told: Option.orElse(session.told, () => Option.some(control)) },
  };
};

/**
 * Hear a report of one of the item's controls: the session after it, and the commands that carry
 * it out. A report of a control the session does not play changes nothing, but a press, which
 * plays it, a release, which stops it, and an unmount, after which a chain passes it by.
 *
 * @param session The session.
 * @param report What the control reports.
 * @returns The turn.
 */
export const heard = <Control extends ReadAloudControl>(
  session: Session<Control>,
  report: Report<Control>,
): Turn<Control> => {
  const unchanged: Turn<Control> = { commands: [], session };

  switch (report.kind) {
    case "ended": {
      return plays(session.phase, report.control) ? onward(session) : unchanged;
    }
    case "paused": {
      return plays(session.phase, report.control)
        ? { commands: [], session: { ...session, phase: { kind: "resting" } } }
        : unchanged;
    }
    case "press": {
      return pressed(session, report.control, report.mounted);
    }
    case "refused": {
      return interrupts(report.refusal) || !plays(session.phase, report.control)
        ? unchanged
        : failed(session, report.control);
    }
    case "release": {
      return {
        commands: [...hushing(session), command("stop", report.control)],
        session: {
          phase: plays(session.phase, report.control) ? { kind: "resting" } : session.phase,
          told: Option.none(),
        },
      };
    }
    case "unmounted": {
      return {
        commands: [],
        session: {
          phase: without(session.phase, report.control),
          told: session.told.pipe(Option.filter((control) => control !== report.control)),
        },
      };
    }
    default: {
      return report satisfies never;
    }
  }
};
