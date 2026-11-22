/**
 * The import's readings of an attribute's lexical form: its value, the host's twin of
 * `Attribute.value` ({@link attributeValueOf}, and {@link valueAt} at an element), and the one
 * decision that a value names something, for every relation that holds such a name as a written
 * row rather than as a query over `Attribute` (grizzle's Q18 and Q19).
 *
 * The value reads the installed grammar's rows (`#pantry/grammar/install.ts`). Its normalization
 * by class is `normalizedIn` of `#pantry/grammar/domains.ts`, beside `collapse`; the lookup of an
 * attribute's class cannot live there, since that module is the grammar's compiler, which the
 * installed grammar imports.
 */
import { isNcName } from "@bjornpagen/grizzle-text/regex/xml";
import { Option } from "effect";
import { normalizedIn, patternFlags } from "#pantry/grammar/domains.ts";
import type { WhiteSpaceClass } from "#pantry/grammar/domains.ts";
import { attributeRows, grammar } from "#pantry/grammar/install.ts";
import { governorOf, lexicalOf } from "#pantry/import/fold.ts";
import type { FlatDocument } from "#pantry/import/fold.ts";
import type { Composed } from "#pantry/model/composed.ts";
import type { NodeRow } from "#pantry/model/xdm.ts";

/**
 * Each attribute's value domain under each governor that admits it, by `governor name`, as the
 * installed grammar holds it (`attributeRows`, the rows `AttributeGrammar` restates).
 */
const domainAt: ReadonlyMap<string, string> = new Map(
  attributeRows.map(({ domain, governor, name }) => [`${governor} ${name}`, domain] as const),
);

/**
 * Each value domain's class, the grammar's `valueDomain` rows (`ValueDomainOf`): its one class, or
 * a mixed union's rest's.
 */
const classAt: ReadonlyMap<string, WhiteSpaceClass> = new Map(
  grammar.attributes.valueDomain.rows.map(
    ({ domain, whiteSpace }) => [domain, whiteSpace] as const,
  ),
);

/**
 * Each mixed union's leading members, the grammar's `leadingMembers` rows (`LeadingMembers`): the
 * pattern they hold a form by as written, compiled once, and the class they normalize it in.
 */
const leadingAt: ReadonlyMap<
  string,
  { readonly holds: RegExp; readonly whiteSpace: WhiteSpaceClass }
> = new Map(
  grammar.attributes.leadingMembers.rows.map(
    ({ domain, pattern, whiteSpace }) =>
      [domain, { holds: new RegExp(pattern, patternFlags), whiteSpace }] as const,
  ),
);

/**
 * Read the class a domain normalizes a lexical form in: its mixed union's leading members' where
 * they hold the form as written, and else its own class, or its rest's ({@link classAt}).
 *
 * @param domain - The domain, one `attributeRows` names.
 * @param lexical - The form.
 * @returns The class.
 * @throws {Error} When the grammar's `valueDomain` rows hold no row of the domain: every domain an
 *   attribute is declared in has one, so a miss is a broken grammar table, never a form to read.
 */
const classIn = (domain: string, lexical: string): WhiteSpaceClass => {
  const leading = leadingAt.get(domain);
  if (leading?.holds.test(lexical) === true) {
    return leading.whiteSpace;
  }

  const whiteSpace = classAt.get(domain);
  if (whiteSpace === undefined) {
    throw new Error(
      `The installed grammar declares attributes in the domain ${domain} and holds no valueDomain row of it. Every declared attribute's domain has one: regenerate the grammar (#pantry/grammar/install.ts).`,
    );
  }

  return whiteSpace;
};

/**
 * How `Attribute.value` reads an attribute's lexical form (`#pantry/qti/attributes.ts`; XML Schema
 * Part 2, §4.3.6), by whether its element's governor admits the attribute's name:
 *
 * - `admitted`: in `whiteSpace`, its domain's class under the governor, from the grammar's
 *   `valueDomain` and `leadingMembers` rows (`ValueDomainOf` and `LeadingMembers`), so a mixed
 *   union's form is normalized in its leading members' class where they hold it as written and in
 *   its rest's otherwise;
 * - `unadmitted`: as written. The governor declares no attribute of the name, so the generated term
 *   finds no domain to normalize the form in and keeps it, and AL1 admission refuses the attribute.
 *   Shred keeps such an attribute as a closed one wherever its name is a closed name some kind
 *   declares, so a reader of one name on every element (a `dir` on any MathML element) meets it.
 */
export type ValueReading =
  | { readonly _tag: "admitted"; readonly whiteSpace: WhiteSpaceClass }
  | { readonly _tag: "unadmitted" };

/**
 * Read how `Attribute.value` reads an attribute's lexical form ({@link ValueReading}).
 *
 * @param governor - Its element's governor (`governorOf` of `#pantry/import/fold.ts`).
 * @param name - The attribute's name.
 * @param lexical - Its lexical form.
 * @returns The reading.
 */
export const valueReadingOf = (governor: string, name: string, lexical: string): ValueReading =>
  Option.match(Option.fromUndefinedOr(domainAt.get(`${governor} ${name}`)), {
    onNone: (): ValueReading => ({ _tag: "unadmitted" }),
    onSome: (domain): ValueReading => ({ _tag: "admitted", whiteSpace: classIn(domain, lexical) }),
  });

/**
 * Read an attribute's value, the host's twin of `Attribute.value`, the field PostgreSQL generates
 * (`#pantry/qti/attributes.ts`): its lexical form normalized in the class it is read in, collapsed,
 * replaced or as written ({@link normalizedIn}), or as written where its governor admits it not
 * ({@link ValueReading}).
 *
 * @param governor - Its element's governor (`governorOf` of `#pantry/import/fold.ts`).
 * @param name - The attribute's name.
 * @param lexical - Its lexical form.
 * @returns Its value.
 */
export const attributeValueOf = (governor: string, name: string, lexical: string): string => {
  const reading = valueReadingOf(governor, name, lexical);

  return reading._tag === "admitted" ? normalizedIn(lexical, reading.whiteSpace) : lexical;
};

/**
 * Read an element's attribute of one closed name as `Attribute.value` holds it: its lexical form
 * ({@link lexicalOf}) read under the element's governor ({@link attributeValueOf}), none where the
 * element writes none.
 *
 * @param document - The document, by its attributes' index.
 * @param element - The element's node row.
 * @param name - The attribute's name.
 * @returns Its value.
 */
export const valueAt = (
  document: Pick<FlatDocument, "attributes">,
  element: NodeRow<Composed>,
  name: Composed["name"],
): Option.Option<string> =>
  Option.map(lexicalOf(document, element.start, name), (lexical) =>
    attributeValueOf(governorOf(element.kind, element.governs), name, lexical),
  );

/**
 * Read the name an attribute's value gives ({@link attributeValueOf}, its form normalized in its
 * class, collapsed for each attribute below): the value, where it is an NCName ({@link isNcName}).
 * Any other value names nothing, so the relation that would hold the name has no row for it, and
 * the attribute's value domain refuses it alone (spec readings 152 and 157, decision 457 (2)).
 *
 * The relations whose rows it decides:
 *
 * - `BindingName` and `BoundVariable` (`#pantry/qti/interactions.ts`), an interaction's bindings;
 * - The content references and a section's feedback names (`referenceSources` and `fragmentSources`
 *   of `#pantry/qti/interactions.ts`);
 * - `VariableRef` (`#pantry/qti/expressions.ts`), a bare processing reference;
 * - `Named` (`#pantry/qti/tests.ts`), a structure's `identifier`.
 *
 * The schema states each of their sources as a selection that matches `namingPattern`
 * (`#pantry/qti/attributes.ts`), and holds it forward only: each row the selection selects has its
 * row in the relation, and no law refuses a row beyond them. So a row for a form that names nothing
 * would stand and be judged beside the value domain, which reading 152 rules out, and the decision
 * stays here: a counted family counts each relation, and a family reads stored tables only (Q18),
 * and a query collapses no unbounded text (Q19).
 *
 * @param value - The attribute's value.
 * @returns The name, none where the value names nothing.
 */
// GRIZZLE-PENDING: Q18, Q19: each relation above becomes a query over `Attribute` that matches its value, and this gate goes.
export const namedBy = (value: string): Option.Option<string> =>
  Option.liftPredicate(value, isNcName);
