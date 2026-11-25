"use client";

/**
 * Read-aloud's session in the page. `<ReadAloudItem>`, which `<Item>` holds around the item it
 * writes while the candidate answers, keyed by the item's instance, is the item's: moving to
 * another item unmounts every control of the one left, which stops what it plays. Each read-aloud
 * island mounts its control in it under the island's own id ({@link useReadAloudItem}) and reports
 * what its recording does; the state machine (`heard` in `#plate/read-aloud/session.ts`) decides
 * what plays, this module carries out its commands on the controls, and each island shows what the
 * session holds of it ({@link ReadAloudItemValue.shown}), read as React reads an external store, so
 * a toggle is pressed and a notice stands only where the session says, however the island was
 * hidden, shown again or remounted in between.
 *
 * @module
 */
import { createContext, use, useState } from "react";
import type { ReactNode } from "react";
import { heard, newSession, shownAt } from "#plate/read-aloud/session.ts";
import type { Refusal, Report, Session, Shown } from "#plate/read-aloud/session.ts";
import { ReadAloudOutsideItem } from "#plate/ui/defects.ts";

/**
 * A read-aloud control's recording as its session's commands reach it, carried out by its island.
 */
interface ReadAloudPart {
  /**
   * Play the recording from its start.
   *
   * @returns The promise `play()` gives, which rejects where the recording will not play.
   */
  readonly play: () => Promise<void>;
  /**
   * Stop the recording and take it back to its start.
   */
  readonly stop: () => void;
}

/**
 * What one mounted control reports to its session, each bound to the control: a press of it, its
 * recording's stop, its refusal, and its unmount, after which it reports nothing.
 */
export interface ReadAloudPort {
  /**
   * Report a press of the control, which plays it, or stops it while the session plays it.
   */
  readonly press: () => void;
  /**
   * Report that the recording would not play.
   *
   * @param refusal Why, as the browser said it.
   */
  readonly refused: (refusal: Refusal) => void;
  /**
   * Report that the recording no longer plays: it played to its end or stopped otherwise, and it
   * has not been played again since.
   */
  readonly stopped: () => void;
  /**
   * Report that the control left the page.
   */
  readonly unmount: () => void;
}

/**
 * The notice a press gets that cannot play, from plate's message catalog in the item's locale:
 * its title and what the child can do.
 */
interface ReadAloudFailedTexts {
  readonly description: string;
  readonly title: string;
}

/**
 * An item's session as its islands reach it: the mount, and what each control shows of the
 * session, with the subscription React reads it through.
 */
interface ReadAloudStore {
  /**
   * Mount a control in the session, under the island's id, which the session tells it by.
   *
   * @param control The island's id.
   * @param part The control's recording.
   * @returns The control's port.
   */
  readonly mount: (control: string, part: ReadAloudPart) => ReadAloudPort;
  /**
   * Give what a control shows of the session now.
   *
   * @param control The island's id.
   * @returns `playing`, `told` or `resting`.
   */
  readonly shown: (control: string) => Shown;
  /**
   * Hear every turn of the session from now on.
   *
   * @param listener What runs after each turn.
   * @returns The unsubscription.
   */
  readonly subscribe: (listener: () => void) => () => void;
}

/**
 * What an island reads of its item's session: the notice's texts, and the session's store.
 */
interface ReadAloudItemValue extends ReadAloudStore {
  readonly failed: ReadAloudFailedTexts;
}

/**
 * The session of the enclosing `<ReadAloudItem>`; undefined outside one.
 */
const ReadAloudItemContext = createContext<ReadAloudItemValue | undefined>(undefined);

/**
 * Give what hears a control's `play()` rejected: the control's refusal, reported with the cause as
 * the browser gave it, which the machine tells apart (an `AbortError` is no failure), while the
 * control still holds the recording it played. A rejection that settles after the control left,
 * or after it mounted another recording, is none of its own, and is heard of no more.
 *
 * @param control The control played.
 * @param part The recording it played.
 * @param parts The recordings the session's controls hold now, by control.
 * @param hear The session's ear.
 * @returns The rejection's handler.
 */
const rejectionAt =
  (
    control: string,
    part: ReadAloudPart,
    parts: ReadonlyMap<string, ReadAloudPart>,
    hear: (report: Report<string>) => void,
  ) =>
  (cause: unknown): void => {
    if (parts.get(control) === part) {
      hear({ control, kind: "refused", refusal: { cause, kind: "rejected" } });
    }
  };

/**
 * Hold one item's session: the state machine's state, from the session every item opens with, the
 * recordings of the controls mounted, by id, and the listeners each island reads it through. Each
 * report runs one turn of the machine, then its commands in order, then tells every listener; a
 * `play`'s rejection comes back as the control's refusal, while the control still holds the
 * recording it played, which the browser tells apart (an `AbortError` is no failure).
 *
 * @returns The session's store.
 */
const sessionOf = (): ReadAloudStore => {
  let session: Session<string> = newSession;
  const parts = new Map<string, ReadAloudPart>();
  const listeners = new Set<() => void>();

  /**
   * Run one turn of the machine, carry out its commands on their controls and tell the listeners.
   *
   * @param report What a control reports.
   */
  const hear = (report: Report<string>): void => {
    const turn = heard(session, report);

    ({ session } = turn);

    for (const { act, control } of turn.commands) {
      // The session commands no control that has left the page (`session.test.ts`), so each
      // command finds its control's recording.
      const part = parts.get(control);

      if (part !== undefined && act === "play") {
        part.play().catch(rejectionAt(control, part, parts, hear));
      } else if (part !== undefined) {
        part.stop();
      }
    }

    for (const listener of listeners) {
      listener();
    }
  };

  return {
    mount: (control, part) => {
      parts.set(control, part);

      return {
        press: () => {
          hear({ control, kind: "press" });
        },
        refused: (refusal) => {
          hear({ control, kind: "refused", refusal });
        },
        stopped: () => {
          hear({ control, kind: "stopped" });
        },
        unmount: () => {
          parts.delete(control);
          hear({ control, kind: "unmounted" });
        },
      };
    },
    shown: (control) => shownAt(session, control),
    subscribe: (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
};

/**
 * Hold the read-aloud session of one item around its content, so its controls play one at a time:
 * a press of a control plays its own part alone and stops any other of the item's controls
 * playing, a press of the control playing stops it, nothing plays but at a press, and a press that
 * cannot play tells the child so. `<Item>` keys it by the item's instance.
 *
 * @param props The notice's texts and the item's content.
 * @param props.children The item's content, with its read-aloud controls.
 * @param props.failed The notice a press gets that cannot play.
 * @returns The content, under the session.
 */
export const ReadAloudItem = ({
  children,
  failed,
}: Readonly<{ children: ReactNode; failed: ReadAloudFailedTexts }>) => {
  const [store] = useState(sessionOf);

  return <ReadAloudItemContext value={{ ...store, failed }}>{children}</ReadAloudItemContext>;
};

/**
 * Read the session of the item a read-aloud control stands in.
 *
 * @returns The notice's texts and the session's store.
 * @throws {ReadAloudOutsideItem} When the control is rendered outside a `<ReadAloudItem>`.
 */
export const useReadAloudItem = (): ReadAloudItemValue => {
  const item = use(ReadAloudItemContext);

  if (item === undefined) {
    throw new ReadAloudOutsideItem();
  }

  return item;
};
