"use client";

/**
 * Read-aloud's session in the page: `<ReadAloudSession>`, which `<Item>` holds around the item it
 * writes while the candidate answers, keyed by the item's instance, so each item has a session of
 * its own and moving to another item unmounts every control of the one left, ending its chain. Each
 * read-aloud island mounts its control in it ({@link useReadAloudSession}) and reports what its
 * recording does; the session's state machine (`heard` in `#plate/read-aloud/session.ts`) decides
 * what plays, and this module carries out its commands on the controls.
 *
 * @module
 */
import { createContext, use, useState } from "react";
import type { ReactNode } from "react";
import { heard, newSession } from "#plate/read-aloud/session.ts";
import type { ReadAloudControl, Refusal, Report, Session } from "#plate/read-aloud/session.ts";
import { ReadAloudOutsideSession } from "#plate/ui/defects.ts";

/**
 * A read-aloud control as its session holds it, the session's commands on it carried out by its
 * island: its role, its recording, whose place in the document orders the chain, and what the
 * island does on each command.
 */
interface ReadAloudPart extends ReadAloudControl {
  /**
   * The control's `audio`, whose place among the item's others is the control's.
   */
  readonly element: Element;
  /**
   * Take the control's notice down.
   */
  readonly hush: () => void;
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
  /**
   * Tell the child, at the control, that its press cannot play.
   */
  readonly tell: () => void;
}

/**
 * What one mounted control reports to its session, each bound to the control: a press that plays
 * it, a press that stops it, its recording's end, its stop by anything else, its refusal, and its
 * unmount, after which it reports nothing.
 */
export interface ReadAloudPort {
  /**
   * Report that the recording played to its end.
   */
  readonly ended: () => void;
  /**
   * Report that the recording stopped before its end.
   */
  readonly paused: () => void;
  /**
   * Report a press that plays the control.
   */
  readonly press: () => void;
  /**
   * Report that the recording would not play.
   *
   * @param refusal Why, as the browser said it.
   */
  readonly refused: (refusal: Refusal) => void;
  /**
   * Report a press that stops the control.
   */
  readonly release: () => void;
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
 * What an island reads of its item's session: the notice's texts, and the mount that gives a
 * control its port.
 */
interface ReadAloudSessionValue {
  readonly failed: ReadAloudFailedTexts;
  /**
   * Mount a control in the session.
   *
   * @param part The control.
   * @returns The control's port.
   */
  readonly mount: (part: ReadAloudPart) => ReadAloudPort;
}

/**
 * The session of the enclosing `<ReadAloudSession>`; undefined outside one.
 */
const ReadAloudSessionContext = createContext<ReadAloudSessionValue | undefined>(undefined);

/**
 * Give the controls mounted, in document order: the order of their recordings in the page. Two
 * recordings never hold one another, so each follows or precedes the other, and
 * `compareDocumentPosition` gives that one flag alone.
 *
 * @param mounted The controls mounted.
 * @returns The controls, in document order.
 * @see https://dom.spec.whatwg.org/#dom-node-comparedocumentposition
 */
const inDocumentOrder = (mounted: ReadonlySet<ReadAloudPart>): readonly ReadAloudPart[] =>
  [...mounted].toSorted((left, right) =>
    left.element.compareDocumentPosition(right.element) === Node.DOCUMENT_POSITION_FOLLOWING
      ? -1
      : 1,
  );

/**
 * Give what hears a control's `play()` rejected: the control's refusal, reported with the cause as
 * the browser gave it, which the machine tells apart (an `AbortError` is no failure).
 *
 * @param control The control played.
 * @param hear The session's ear.
 * @returns The rejection's handler.
 */
const rejectionAt =
  (control: ReadAloudPart, hear: (report: Report<ReadAloudPart>) => void) =>
  (cause: unknown): void => {
    hear({ control, kind: "refused", refusal: { cause, kind: "rejected" } });
  };

/**
 * Hold one item's session: the state machine's state, the controls mounted, and the mount that
 * gives each its port. Each report runs one turn of the machine, then its commands in order; a
 * `play`'s rejection comes back as the control's refusal.
 *
 * @returns The mount.
 */
const sessionOf = (): ReadAloudSessionValue["mount"] => {
  let session: Session<ReadAloudPart> = newSession;
  const mounted = new Set<ReadAloudPart>();

  /**
   * Run one turn of the machine and carry out its commands on their controls.
   *
   * @param report What a control reports.
   */
  const hear = (report: Report<ReadAloudPart>): void => {
    const turn = heard(session, report);

    ({ session } = turn);

    for (const { act, control } of turn.commands) {
      if (act === "play") {
        control.play().catch(rejectionAt(control, hear));
      } else {
        control[act]();
      }
    }
  };

  return (part) => {
    mounted.add(part);

    return {
      ended: () => {
        hear({ control: part, kind: "ended" });
      },
      paused: () => {
        hear({ control: part, kind: "paused" });
      },
      press: () => {
        hear({ control: part, kind: "press", mounted: inDocumentOrder(mounted) });
      },
      refused: (refusal) => {
        hear({ control: part, kind: "refused", refusal });
      },
      release: () => {
        hear({ control: part, kind: "release" });
      },
      unmount: () => {
        mounted.delete(part);
        hear({ control: part, kind: "unmounted" });
      },
    };
  };
};

/**
 * Hold the read-aloud session of one item around its content, so its controls play as one: the
 * item's first press, where it is a prompt's, plays the item's every control in turn, and a press
 * that cannot play tells the child so. `<Item>` keys it by the item's instance.
 *
 * @param props The notice's texts and the item's content.
 * @param props.children The item's content, with its read-aloud controls.
 * @param props.failed The notice a press gets that cannot play.
 * @returns The content, under the session.
 */
export const ReadAloudSession = ({
  children,
  failed,
}: Readonly<{ children: ReactNode; failed: ReadAloudFailedTexts }>) => {
  const [mount] = useState(sessionOf);

  return <ReadAloudSessionContext value={{ failed, mount }}>{children}</ReadAloudSessionContext>;
};

/**
 * Read the session of the item a read-aloud control stands in.
 *
 * @returns The notice's texts and the mount.
 * @throws {ReadAloudOutsideSession} When the control is rendered outside a `<ReadAloudSession>`.
 */
export const useReadAloudSession = (): ReadAloudSessionValue => {
  const session = use(ReadAloudSessionContext);

  if (session === undefined) {
    throw new ReadAloudOutsideSession();
  }

  return session;
};
