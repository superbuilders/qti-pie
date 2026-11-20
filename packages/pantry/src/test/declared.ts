/**
 * A generator's closed relations and rosters declared through grizzle, as `install.ts` declares
 * production's, so a test over any composition reads grizzle's own refusal of their rows, toy
 * compositions and the relations only the host reads among them.
 *
 * Their names are a generator's, known only at run time, so each is declared through grizzle's
 * door for a generated schema, `@bjornpagen/grizzle/dynamic`, whose types take any string as a name
 * and whose run time checks it.
 *
 * Grizzle checks a closed relation's rows when it declares it (`closed.relation`, `closedRows` in
 * grizzle's `schema/relation.ts`): each closed id a handle of its roster, and one fact per key,
 * where a row written twice is one fact and two rows of one key with different values break the
 * key. It checks a roster when it declares one (`closed.ordered(name, handles)`, `admitRoster`):
 * its handles nonempty, distinct and at most 63 UTF-8 bytes each. A slot past its owner's count is
 * refused only when grizzle packs a relation a law reads, so no declaration here meets it.
 *
 * A generator's open-typed payload field holds its relation's distinct values (`valueField` of
 * `#pantry/grammar/closed.ts`), coded by their place in value order (fin.md §17, "Codes"), so each
 * is declared as a closed id over the codes of its values, and a row's value as its code. A
 * dependent field is a closed id over the codes at its widest prefix, as grizzle declares a slot.
 *
 * @see {@link https://github.com/bjornpagen/grizzle/blob/9059cfc2/packages/engine/src/schema/relation.ts | grizzle's closedRows and admitRoster, at the vendored commit}
 */
import { closedId, CompileError } from "@bjornpagen/grizzle";
import { closed } from "@bjornpagen/grizzle/dynamic";
import { Array as Arr, Option, Result } from "effect";
import type { AnyField, AnyKeyField, Primitive, Roster } from "#pantry/grammar/closed.ts";

/**
 * A closed relation as a generator states it: its key, its payload and its rows.
 */
export interface StatedRelation {
  readonly key: readonly AnyKeyField[];
  readonly name: string;
  readonly payload: readonly AnyField[];
  readonly rows: readonly Readonly<Record<string, Primitive>>[];
}

/**
 * What grizzle refuses of a relation's rows or of a roster's handles when it declares them: a
 * closed id outside its roster, two facts of one key with different values, or a roster that lists
 * a handle twice.
 */
export type RowFault = "a handle twice" | "outside its roster" | "two facts at one key";

/**
 * Run one of grizzle's declarations, keeping its refusal: a `CompileError`, which is how every
 * builder refuses its caller's arguments. Any other throw is a defect of this module or of
 * grizzle, and fails the test that called it.
 *
 * @param declare - The declaration.
 * @returns What it declared, or grizzle's refusal.
 * @throws {unknown} What the declaration throws that is no `CompileError`.
 */
const declaring = <A>(declare: () => A): Result.Result<A, CompileError> =>
  Result.try({
    catch: (cause) => {
      if (cause instanceof CompileError) {
        return cause;
      }

      throw cause;
    },
    try: declare,
  });

/**
 * The one handle of the roster a field with no handle is declared over, which no generator's row
 * holds, so grizzle refuses every row's value there as outside its roster, as the field's own
 * empty code space would.
 */
const noHandle = "(no handle)";

/**
 * Spell a field's name as the tail of a name it is part of: its first letter in upper case.
 *
 * @param name - The field's name.
 * @returns The tail.
 */
const tailOf = (name: string): string => `${name.charAt(0).toUpperCase()}${name.slice(1)}`;

/**
 * Declare a generator's roster through grizzle. A roster with no handle is no fault here: a toy
 * composition's roster may hold none, and grizzle declares no empty roster, so none is declared.
 *
 * @param held - The roster.
 * @returns The handles grizzle declared, or its refusal.
 */
export const declaredRoster = (
  held: Roster<string>,
): Result.Result<{ readonly handles: number }, CompileError> => {
  const { handles, name } = held;

  return Arr.isReadonlyArrayNonEmpty(handles)
    ? declaring(() => ({ handles: closed.ordered(name, handles).handles.length }))
    : Result.succeed({ handles: 0 });
};

/**
 * Read the handles a field of a stated relation ranges over: an id or a dependent field's roster's,
 * and a value field's codes, each spelled as its numeral.
 *
 * @param field - The field.
 * @returns The handles, in code order.
 */
const handlesOf = (field: AnyField | AnyKeyField): readonly string[] =>
  field._tag === "value" ? field.values.map((_, code) => String(code)) : field.roster.handles;

/**
 * Declare a generator's closed relation through grizzle, each field a closed id: an id field over
 * its roster, a dependent field over its widest prefix's codes, and a value field over the codes of
 * its values, each row's value its code, a value the field does not hold a code no roster has. A
 * relation with no row states no fact to refuse, and its rosters may be empty, so none is declared;
 * a field with no handle is declared over {@link noHandle}.
 *
 * @param relation - The relation as its generator states it.
 * @returns The facts grizzle keeps, one per distinct row, or its refusal.
 */
export const declaredRelation = (
  relation: StatedRelation,
): Result.Result<{ readonly facts: number }, CompileError> => {
  const fields = [...relation.key, ...relation.payload];
  const key = relation.key.map(({ name }) => name);
  if (!Arr.isReadonlyArrayNonEmpty(relation.rows) || !Arr.isReadonlyArrayNonEmpty(key)) {
    return Result.succeed({ facts: 0 });
  }

  const rows = relation.rows.map((row) =>
    Object.fromEntries(
      fields.map((field) => {
        const value = row[field.name];
        if (field._tag !== "value") {
          return [field.name, String(value)];
        }

        const code = value === undefined ? -1 : field.values.indexOf(value);

        return [field.name, code === -1 ? `outside ${String(value)}` : String(code)];
      }),
    ),
  );

  return declaring(() => {
    const declared = Object.fromEntries(
      fields.map((field) => {
        const handles = handlesOf(field);
        const name =
          field._tag === "value" ? `${relation.name}${tailOf(field.name)}` : field.roster.name;

        return [
          field.name,
          closedId(
            closed.ordered(name, Arr.isReadonlyArrayNonEmpty(handles) ? handles : [noHandle]),
          ),
        ];
      }),
    );

    return { facts: closed.relation(relation.name, declared, key, rows).rows.length };
  });
};

/**
 * Find the first of several declarations grizzle refused, in their order.
 *
 * @param declarations - What each declaration declared, or grizzle's refusal.
 * @returns The first refusal, or none where grizzle declared each.
 */
export const firstRefusal = (
  declarations: readonly Result.Result<unknown, CompileError>[],
): Option.Option<CompileError> =>
  Arr.findFirst(declarations, Result.isFailure).pipe(Option.map(({ failure }) => failure));

/**
 * Read which fault grizzle refused a declaration for, by the reason it states.
 *
 * @param refusal - Grizzle's refusal.
 * @returns The fault, or none for a refusal of another rule, which no generator's rows meet.
 */
export const rowFaultOf = (refusal: CompileError): RowFault | undefined => {
  const { reason } = refusal;
  if (reason._tag === "Refused") {
    if (reason.refusal === "a roster lists each handle once") {
      return "a handle twice";
    }

    return reason.refusal ===
      "two facts of one relation share a key with different values; a key names one fact"
      ? "two facts at one key"
      : undefined;
  }

  return reason._tag === "MalformedDescription" &&
    reason.what === "a handle of the closed relation's roster"
    ? "outside its roster"
    : undefined;
};
