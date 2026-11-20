"use client";

/**
 * An item's responses on the client: the form entries the item posts, which the host holds as React
 * state and each interaction island reads and writes through one context. The entries are plate's
 * form encoding (`#plate/form/encoding.ts`), so what the islands hold is what the form posts and
 * what the server decodes, with nothing to convert on either side.
 *
 * @module
 */
import { createContext, use, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Entry } from "#plate/form/encoding.ts";
import { ResponsesMissing } from "#plate/ui/defects.ts";

/**
 * One posted entry, plate's `Entry` (`#plate/form/encoding.ts`): the name a response posts under,
 * from plate's `entryName`, and one text it posts. A response holding several values posts one
 * entry per value, in its order, so a bag repeats a text as often as it holds it and a sequence
 * keeps its order.
 */
export type PostedEntry = Entry;

/**
 * Every entry an item posts.
 */
export type PostedEntries = readonly PostedEntry[];

/**
 * What a host's `onChange` is called with: every entry the item posts after a child's change, and
 * the entry names the change wrote, each one a response posts under. A write names its response
 * even when it leaves the response's texts as they were, so a host tells a response the child has
 * changed from one still at the value it started at, as a default the child never touched (QTI
 * 3.0 information model 2.2.2.2; spec reading 183).
 */
type OnChange = (next: PostedEntries, written: readonly string[]) => void;

/**
 * What the context carries: the host's entries and its setter.
 */
interface ResponsesValue {
  readonly entries: PostedEntries;
  readonly onChange: OnChange;
}

/**
 * The context `<Responses>` gives the islands inside it; undefined outside one.
 */
const ResponsesContext = createContext<ResponsesValue | undefined>(undefined);

/**
 * The key of each entry's hidden input: its name and how many entries of that name precede it, so
 * a bag's repeated texts keep distinct keys.
 *
 * @param entries The entries in posting order.
 * @returns One key per entry.
 */
const keysOf = (entries: PostedEntries): readonly string[] => {
  const seen = new Map<string, number>();

  return entries.map(([name]) => {
    const count = seen.get(name) ?? 0;

    seen.set(name, count + 1);

    return `${name}#${count}`;
  });
};

/**
 * Hold an item's responses for its islands, and post them: one hidden input per entry, so the
 * host's `<form action>` posts exactly the entries it holds. The host owns the state; a refused
 * save is the host setting `value` back to the last save taken.
 *
 * @param props.value The entries the item posts now.
 * @param props.onChange Called with every entry the item posts after a child's change, and the entry
 *   names that change wrote ({@link OnChange}).
 * @param props.children The item, with its islands.
 * @returns The hidden inputs and the item.
 */
export const Responses = ({
  value,
  onChange,
  children,
}: Readonly<{
  value: PostedEntries;
  onChange: OnChange;
  children: ReactNode;
}>) => {
  const responses = useMemo(() => ({ entries: value, onChange }), [value, onChange]);
  const keys = keysOf(value);

  return (
    <ResponsesContext value={responses}>
      {value.map(([name, text], index) => (
        <input key={keys[index]} type="hidden" name={name} value={text} />
      ))}
      {children}
    </ResponsesContext>
  );
};

/**
 * Tell whether two lists of texts are the same, text for text in order.
 *
 * @param left One list.
 * @param right The other.
 * @returns Whether they hold the same texts in the same order.
 */
const sameTexts = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((text, index) => text === right[index]);

/**
 * Read and write the texts one response posts. Writing replaces every entry of `name` and keeps the
 * other responses' entries as they are.
 *
 * The texts keep their identity while they stay the same: another response changing leaves this
 * one's array as it was, and a write the host takes comes back as the very array written. So an
 * island tells a change from outside, the host restoring a value or setting a refused save back,
 * by comparing arrays, and its memos over the texts hold.
 *
 * @param name The entry name the response posts under.
 * @returns The response's texts in posting order, and a setter for them.
 * @throws {ResponsesMissing} When it is called outside a `<Responses>`, whose entries it reads.
 * @see https://react.dev/reference/react/useState#storing-information-from-previous-renders
 */
export const useResponse = (
  name: string,
): readonly [texts: readonly string[], set: (texts: readonly string[]) => void] => {
  const responses = use(ResponsesContext);

  if (responses === undefined) {
    throw new ResponsesMissing();
  }

  const { entries, onChange } = responses;
  const posted = useMemo(
    () => entries.filter(([entry]) => entry === name).map(([, text]) => text),
    [entries, name],
  );
  const [kept, keep] = useState<readonly string[]>(posted);
  const texts = sameTexts(kept, posted) ? kept : posted;

  if (texts !== kept) {
    keep(texts);
  }

  const set = (next: readonly string[]) => {
    keep(next);
    onChange(
      [
        ...entries.filter(([entry]) => entry !== name),
        ...next.map((text): PostedEntry => [name, text]),
      ],
      [name],
    );
  };

  return [texts, set];
};

/**
 * Tell whether two lists of entries are the same, entry for entry in order.
 *
 * @param left One list.
 * @param right The other.
 * @returns Whether they hold the same names and texts in the same order.
 */
const sameEntries = (left: PostedEntries, right: PostedEntries): boolean =>
  left.length === right.length &&
  left.every(([name, text], index) => {
    const other = right[index];

    return other !== undefined && other[0] === name && other[1] === text;
  });

/**
 * Read and write, together, the entries several responses post: an island holding several
 * interactions writes all of theirs at once. Writing replaces every entry of the names in one
 * change and keeps the other responses' entries as they are, so two of the names never overwrite
 * each other, as two {@link useResponse} setters called in one event would: each builds the host's
 * entries from the same render.
 *
 * The entries keep their posting order across the names, which a refused post comes back in. They
 * keep their identity while they stay the same, as {@link useResponse}'s texts do, and a write the
 * host takes comes back as the very array written.
 *
 * @param names The entry names, each one a response posts under.
 * @returns The entries of those names in posting order, and a setter for them, whose entries all
 *   carry one of the names.
 * @throws {ResponsesMissing} When it is called outside a `<Responses>`, whose entries it reads.
 * @see https://react.dev/reference/react/useState#storing-information-from-previous-renders
 */
export const useEntries = (
  names: readonly string[],
): readonly [entries: PostedEntries, set: (next: PostedEntries) => void] => {
  const responses = use(ResponsesContext);

  if (responses === undefined) {
    throw new ResponsesMissing();
  }

  const { entries, onChange } = responses;
  const posted = useMemo(
    () => entries.filter(([entry]) => names.includes(entry)),
    [entries, names],
  );
  const [kept, keep] = useState<PostedEntries>(posted);
  const shown = sameEntries(kept, posted) ? kept : posted;

  if (shown !== kept) {
    keep(shown);
  }

  const set = (next: PostedEntries) => {
    keep(next);
    onChange([...entries.filter(([entry]) => !names.includes(entry)), ...next], names);
  };

  return [shown, set];
};
