/**
 * The parse proof of a list the import writes in pieces (C3, C50; spec readings 103, 121 and 126),
 * stated once for every list the schema holds. The host splits a list's lexical form
 * (`#pantry/import/pieces.ts`): `tokensOf` splits a whitespace-separated list, and
 * `srcsetCandidatesOf` a `srcset`. Each piece is a member row of an ordered family of its owner,
 * in the form's order. The members' `piece`s concatenate, by grizzle's `Monoid.concat` fold, to
 * the owner's `tokenText`, and the owner's own law holds that text to its form. So a wrong split is
 * refused, never stored. The running texts and the end are of any length, so each rides the
 * family's axes by its SHA-256 digest, a generated field beside it ({@link piecesDigests},
 * {@link tokenTextDigest}).
 *
 * A whitespace list's token (`Idref`, `TextIdref`, `HeaderToken` and `ToleranceToken`) is a run of
 * no XML whitespace, each but the first after whitespace ({@link whitespaceTokens}). That check
 * proves the split alone. What a token may be is its list's datatype: an IDREF item's NCName, a
 * `headers` identifier, or a tolerance's number or variable reference. The datatype is judged once,
 * by the value domain of the whole form: AL1's lexical half for an attribute, and TextDomain for an
 * element's text (both `#pantry/qti/attributes.ts`). It is never judged a second time on each
 * token. A `srcset`'s candidates are another grammar, HTML's image candidate strings, and their
 * check is `#pantry/qti/package.ts`'s.
 *
 * {@link tokenList} states one family, its fold and its member check for a list whose owner is keyed
 * by its element, `(package, path, start)`. `Idref` cannot go through it. Its owner is a closed
 * attribute, keyed `(package, path, start, name)`, and grizzle types a family only over terms
 * written where it is built, never over a generic list of them. So `#pantry/qti/attributes.ts`
 * states its family and fold over these same fields, piece and check.
 *
 * @see {@link https://www.w3.org/TR/xml/#NT-S | XML 1.0, S}
 * @see {@link https://www.w3.org/TR/xmlschema-2/#IDREFS | XML Schema Part 2, §3.3.10 IDREFS}
 */
import type {
  AnyRelation,
  Check,
  GeneratedField,
  Relation,
  RelationName,
  RowScalars,
} from "@bjornpagen/grizzle";
import {
  accumulated,
  check,
  Crypto,
  drawn,
  fin,
  fold,
  generated,
  law,
  Monoid,
  on,
  ordered,
  relation,
  sha256,
  str,
  Text,
} from "@bjornpagen/grizzle";
import { EntryPath, matchedText, PackageName } from "#pantry/qti/limits.ts";
import { anyText, natural } from "#pantry/grammar/install.ts";
import { entryOf } from "#pantry/vocab/laws.ts";

/**
 * XML whitespace `S`, possibly none. A lexical form holds it around its token or value: every
 * token's affixes and every other lead and trail of the schema are this one type. Exported for
 * `src/import/refusal.ts`, which names its pattern law.
 *
 * @see {@link https://www.w3.org/TR/xml/#NT-S | XML 1.0, S}
 */
export const Space = law(entryOf("E1 derived"), str.regex("^[\\t\\n\\r ]*$"));

/**
 * {@link Space}'s language as a pattern a law matches a text against: XML whitespace `S`,
 * possibly none.
 *
 * @see {@link https://www.w3.org/TR/xml/#NT-S | XML 1.0, S}
 */
export const spacePattern = Text.pattern("^[\\t\\n\\r ]*$");

/**
 * A token: one or more characters, none of them XML whitespace. It is a whitespace list's token,
 * and a value collapsed from its lexical form: an assessment object's identifier
 * (`#pantry/qti/metadata.ts` `ObjectIdentifier`). That the value is an NCName, and a list token of
 * its list's datatype, is its form's value domain's.
 */
export const tokenPattern = Text.pattern("^[^\\t\\n\\r ]+$");

/**
 * A whitespace list's token's own fields, beside its owner's key: `before`, `token` and `after`,
 * the host's split, with the whitespace written before the token and, for the last, after it;
 * `at`, its drawn place; and `piecesWas` and `piecesAfter`, the concatenation before and after it.
 * The running values are of any length: they ride the family's predecessor and last axes by their
 * digests ({@link piecesDigests}), so no list is refused for its length.
 */
export const tokenFields = {
  after: Space,
  at: drawn(natural),
  before: Space,
  piecesAfter: accumulated(anyText, ""),
  piecesWas: accumulated(anyText, ""),
  token: matchedText,
} as const;

/**
 * A whitespace list's token's row, as a generated field reads it: its own fields, whatever its
 * owner's key.
 */
type TokenRow = RowScalars<Relation<string, typeof tokenFields, readonly ["at"]>>;

/**
 * A list piece's running texts' SHA-256 digests, `piecesWasDigest` and `piecesAfterDigest`, which
 * PostgreSQL stores beside them: the concatenation's fold names them where the texts stand, so the
 * family's predecessor axis pairs each piece's `piecesWasDigest` with its predecessor's
 * `piecesAfterDigest` and its last axis the owner's {@link tokenTextDigest} with its last piece's
 * `piecesAfterDigest`, a text of any length riding the axes as 32 bytes (grizzle's README,
 * "Families": a running text of any length rides the axes by its digest).
 *
 * @param t - The piece's row.
 * @param t.piecesAfter - The concatenation after it.
 * @param t.piecesWas - The concatenation before it.
 * @returns Its generated digests.
 */
export const piecesDigests = (t: Pick<TokenRow, "piecesAfter" | "piecesWas">) => ({
  piecesAfterDigest: law(entryOf("E1 derived"), generated(sha256, Crypto.sha256(t.piecesAfter))),
  piecesWasDigest: law(entryOf("E1 derived"), generated(sha256, Crypto.sha256(t.piecesWas))),
});

/**
 * A list owner's row, as a generated field reads it: the end of its pieces' concatenation, whatever
 * its owner's key.
 */
type OwnerRow = RowScalars<
  Relation<string, { readonly tokenText: typeof tokenFields.piecesWas }, readonly ["tokenText"]>
>;

/**
 * A list owner's end's SHA-256 digest, `tokenTextDigest`, which the concatenation's fold names
 * where the end stands, beside its pieces' {@link piecesDigests}.
 *
 * @param o - The owner's row.
 * @param o.tokenText - The end of its pieces' concatenation.
 * @returns Its generated digest.
 */
export const tokenTextDigest = (o: OwnerRow) => ({
  tokenTextDigest: law(entryOf("E1 derived"), generated(sha256, Crypto.sha256(o.tokenText))),
});

/**
 * A token's generated fields: its piece, its token with the whitespace written around it, `before ‖
 * token ‖ after`, and its running texts' {@link piecesDigests}.
 *
 * @param t - The token's row.
 * @returns Its generated `piece`, `piecesAfterDigest` and `piecesWasDigest`.
 */
export const tokenPiece = (
  t: Pick<TokenRow, "after" | "before" | "piecesAfter" | "piecesWas" | "token">,
) => ({
  piece: law(
    entryOf("E1 derived"),
    generated(anyText, Text.concat(Text.concat(t.before, t.token), t.after)),
  ),
  ...piecesDigests(t),
  tokenDigest: law(entryOf("E1 derived"), generated(sha256, Crypto.sha256(t.token))),
});

/**
 * Construct a whitespace list's token relation whose owner is keyed by its element, `(package,
 * path, start)`: {@link tokenFields} beside the owner's key, in the order of their names, which is
 * the order of its columns. Its `piece` is generated, `before ‖ token ‖ after`, the concatenation's
 * step, any text, and so are its running texts' digests ({@link tokenPiece}).
 *
 * @param name - The relation's name.
 * @returns The relation, keyed by its owner's key and its place.
 */
export const listTokens = <const Name extends string>(name: RelationName<Name>) =>
  relation.generated(
    name,
    {
      after: tokenFields.after,
      at: tokenFields.at,
      before: tokenFields.before,
      package: PackageName,
      path: EntryPath,
      piecesAfter: tokenFields.piecesAfter,
      piecesWas: tokenFields.piecesWas,
      start: natural,
      token: tokenFields.token,
    },
    ["package", "path", "start", "at"],
    (t) => tokenPiece(t),
  );

/**
 * A relation of a list's pieces whose owner is keyed by its element: each piece's place, its
 * generated `piece`, the concatenation's running values and their generated digests.
 */
type ListPieces = Relation<
  string,
  {
    readonly at: typeof tokenFields.at;
    readonly package: typeof PackageName;
    readonly path: typeof EntryPath;
    readonly piece: GeneratedField<typeof anyText>;
    readonly piecesAfter: typeof tokenFields.piecesAfter;
    readonly piecesAfterDigest: GeneratedField<typeof sha256>;
    readonly piecesWas: typeof tokenFields.piecesWas;
    readonly piecesWasDigest: GeneratedField<typeof sha256>;
    readonly start: typeof natural;
  },
  readonly ["package", "path", "start", "at"]
>;

/**
 * A list's owner keyed by its element: its count of pieces, `tokens`, the end of their
 * concatenation, `tokenText`, and its generated digest, `tokenTextDigest`.
 */
type ListOwner = Relation<
  string,
  {
    readonly package: typeof PackageName;
    readonly path: typeof EntryPath;
    readonly start: typeof natural;
    readonly tokenText: typeof tokenFields.piecesWas;
    readonly tokenTextDigest: GeneratedField<typeof sha256>;
    readonly tokens: typeof tokenFields.at;
  },
  readonly ["package", "path", "start"]
>;

/**
 * A whitespace list's token relation, whatever its owner's key: a relation that shows the token
 * list's fields, as a check reads its source (grizzle's `Shows`).
 */
type WhitespaceTokens = AnyRelation & {
  readonly heading: typeof tokenFields & { readonly piece: GeneratedField<typeof anyText> };
  readonly name: string;
};

/**
 * State the split of a whitespace list (`E1_derived`): each token is a run of no whitespace, and
 * each but the first follows whitespace. With the concatenation, that makes the tokens exactly the
 * form's whitespace-separated tokens.
 *
 * @param tokens - The list's token relation.
 * @returns The check.
 */
export const whitespaceTokens = <T extends WhitespaceTokens>(tokens: T) =>
  check("E1_derived", tokens, (t) =>
    t.and(Text.matches(t.token, tokenPattern), t.or(t.eq(t.at, 0n), t.ne(t.before, ""))),
  );

/**
 * State a list whose owner is keyed by its element: its pieces an ordered family of the owner,
 * counted by `tokens`; their concatenation folded into `tokenText`, its running texts and end
 * named by their digests; and the check on each piece,
 * {@link whitespaceTokens} for a whitespace list, or the list's own grammar's.
 *
 * @param pieces - The list's piece relation.
 * @param owner - Its owner.
 * @param pieceCheck - The check on each piece.
 * @returns The family, the fold and the check, the statements the list's module lists under
 *   "E1 derived".
 */
export const tokenList = <
  P extends ListPieces,
  O extends ListOwner,
  C extends Check<"E1_derived", P>,
>(
  pieces: P,
  owner: O,
  pieceCheck: C,
) => {
  const family = ordered(on(pieces, "package", "path", "start", "at"), fin(owner, "tokens"));

  return [
    family,
    fold(
      family,
      Monoid.concat,
      on(pieces, "package", "path", "start", "piece", "piecesWasDigest", "piecesAfterDigest"),
      on(owner, "package", "path", "start", "tokenTextDigest"),
    ),
    pieceCheck,
  ] as const;
};
