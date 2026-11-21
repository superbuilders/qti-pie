"use client";

/**
 * Read-aloud's sessions in the page. `<ReadAloudItem>`, which `<Item>` holds around the item it
 * writes while the candidate answers, keyed by the item's instance, is the item's: moving to
 * another item unmounts every control of the one left, ending its chain. Each read-aloud island
 * mounts its control in it ({@link useReadAloudItem}) and reports what its recording does; the
 * state machine (`heard` in `#plate/read-aloud/session.ts`) decides what plays, and this module
 * carries out its commands on the controls. `<ReadAloudSession>`, which a host holds around a whole
 * test, is the test's: it remembers which of the test's items a press has been heard of, so an item
 * the student comes back to chains no more.
 *
 * @module
 */
import { createContext, use, useState } from "react";
import type { ReactNode } from "react";
import { heard, openedIn, pressedAfter } from "#plate/read-aloud/session.ts";
import type { ReadAloudControl, Refusal, Report, Session } from "#plate/read-aloud/session.ts";
import { ReadAloudOutsideItem } from "#plate/ui/defects.ts";

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
interface ReadAloudItemValue {
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
 * A test's memory of its items: the session each opens with, and what it learns from each turn.
 */
interface ReadAloudMemory {
  /**
   * Hear an item's turn, which spends its first press for the rest of the test once it has left
   * `unpressed`.
   *
   * @param instance The item's instance.
   * @param session The item's session after the turn.
   */
  readonly heard: (instance: string, session: Session<ReadAloudPart>) => void;
  /**
   * Give the session an item opens with.
   *
   * @param instance The item's instance.
   * @returns Its session: unpressed, unless the test heard a press of it before.
   */
  readonly opened: (instance: string) => Session<ReadAloudPart>;
}

/**
 * The session of the enclosing `<ReadAloudItem>`; undefined outside one.
 */
const ReadAloudItemContext = createContext<ReadAloudItemValue | undefined>(undefined);

/**
 * The memory of the enclosing `<ReadAloudSession>`, the host's for its whole test; undefined
 * outside one, where each item holds a memory of its own.
 */
const ReadAloudSessionContext = createContext<ReadAloudMemory | undefined>(undefined);

/**
 * Make a memory that has heard a press of no item.
 *
 * @returns The memory.
 */
const memoryOf = (): ReadAloudMemory => {
  let pressed: ReadonlySet<string> = new Set();

  return {
    heard: (instance, session) => {
      pressed = pressedAfter(pressed, instance, session);
    },
    opened: (instance) => openedIn(pressed, instance),
  };
};

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
 * Hold one item's session: the state machine's state, from the session its test's memory opens it
 * with, the controls mounted, and the mount that gives each its port. Each report runs one turn of
 * the machine, which the memory hears, then its commands in order; a `play`'s rejection comes back
 * as the control's refusal.
 *
 * @param memory The test's memory of its items.
 * @param instance The item's instance.
 * @returns The mount.
 */
const sessionOf = (memory: ReadAloudMemory, instance: string): ReadAloudItemValue["mount"] => {
  let session = memory.opened(instance);
  const mounted = new Set<ReadAloudPart>();

  /**
   * Run one turn of the machine and carry out its commands on their controls.
   *
   * @param report What a control reports.
   */
  const hear = (report: Report<ReadAloudPart>): void => {
    const turn = heard(session, report);

    ({ session } = turn);
    memory.heard(instance, session);

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
 * Hold a test's read-aloud memory around every item of the test, so an item the student comes back
 * to keeps its first press spent: a press of its prompt plays the prompt alone, as AlphaTest's
 * player's does for the whole test. A host renders one per test session, around every item it
 * shows. Where none encloses an item, `<Item>` holds a memory of the item's own, which lasts while
 * it shows the item, so each time it shows the item again its first press of a prompt chains again.
 *
 * @param props The test's items.
 * @param props.children The items, every `<Item>` of the test session.
 * @returns The items, under the memory.
 */
export const ReadAloudSession = ({ children }: Readonly<{ children: ReactNode }>) => {
  const [memory] = useState(memoryOf);

  return <ReadAloudSessionContext value={memory}>{children}</ReadAloudSessionContext>;
};

/**
 * Hold the read-aloud session of one item around its content, so its controls play as one: the
 * item's first press, where it is a prompt's and the test heard no press of the item before, plays
 * the item's every control in turn, and a press that cannot play tells the child so. `<Item>` keys
 * it by the item's instance.
 *
 * @param props The notice's texts, the item's instance and its content.
 * @param props.children The item's content, with its read-aloud controls.
 * @param props.failed The notice a press gets that cannot play.
 * @param props.instance The item's instance, by which the test remembers it.
 * @returns The content, under the session.
 */
export const ReadAloudItem = ({
  children,
  failed,
  instance,
}: Readonly<{ children: ReactNode; failed: ReadAloudFailedTexts; instance: string }>) => {
  const test = use(ReadAloudSessionContext);
  const [mount] = useState(() => sessionOf(test ?? memoryOf(), instance));

  return <ReadAloudItemContext value={{ failed, mount }}>{children}</ReadAloudItemContext>;
};

/**
 * Read the session of the item a read-aloud control stands in.
 *
 * @returns The notice's texts and the mount.
 * @throws {ReadAloudOutsideItem} When the control is rendered outside a `<ReadAloudItem>`.
 */
export const useReadAloudItem = (): ReadAloudItemValue => {
  const item = use(ReadAloudItemContext);

  if (item === undefined) {
    throw new ReadAloudOutsideItem();
  }

  return item;
};
