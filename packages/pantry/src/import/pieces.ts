/**
 * The host's text splits: every lexical form the import writes in pieces is cut here, since no
 * grizzle scalar term splits a text (no substring, split or pattern group at the vendored
 * commit; grizzle's Q7). Each overlay writes the pieces as fields beside the form, and its
 * `E1_derived` proves they concatenate to it, so a wrong split is refused, never stored.
 *
 * Four splits, each written once:
 *
 * - {@link piecesOf}: a form around its collapsed value, `lead ‖ value ‖ trail` (identifiers, IDs,
 *   LOM entries, test tokens, a reference's outer whitespace, a bare processing reference);
 * - {@link tokensOf}: a whitespace-separated list, each token with the whitespace before it (IDREFS,
 *   `headers`, `tolerance`, an IDREF or IDREFS text);
 * - {@link hrefPiecesOf}: an href's path and its query or fragment;
 * - {@link srcsetCandidatesOf}: a `srcset`'s image candidates, each a URL and its descriptors.
 *
 * GRIZZLE-PENDING: Q7: a total Text split (substring, pattern group or k-th token) generates each
 * piece from its form, and this module goes.
 */
import { regex } from "arkregex";
import type { Addition } from "@bjornpagen/grizzle";
import type { Qti } from "#pantry/qti/schema.ts";

/**
 * XML whitespace `S`, possibly none, as the schema's one `Space` type holds every lead, trail and
 * token affix (`#pantry/qti/token-list.ts`).
 */
export type Space = Addition<(typeof Qti)["relations"]["Idref"]>["before"];

/**
 * An href's `params` piece, as `ResourceHref` and `Reference` type it: empty, or from a `?` or `#`.
 */
type Params = Addition<(typeof Qti)["relations"]["Reference"]>["params"];

/**
 * The XML whitespace characters (XML 1.0, production 3, `S`).
 */
const spaceCharacters: ReadonlySet<string> = new Set(["\t", "\n", "\r", " "]);

/**
 * State that a text is XML whitespace, possibly none, the language of {@link Space}.
 *
 * @param text - The text.
 * @returns Whether every character is a tab, a line feed, a carriage return or a space.
 */
const isSpace = (text: string): text is Space => regex("^[\t\n\r ]*$", "u").test(text);

/**
 * Hold a run a split cut at whitespace to {@link Space}.
 *
 * @param text - The run.
 * @returns The run.
 * @throws {Error} When it holds a character that is no XML whitespace, which no split here cuts:
 *   a defect of the split, never of the document.
 */
const spaceOf = (text: string): Space => {
  if (isSpace(text)) {
    return text;
  }

  throw new Error(
    `A split cut ${JSON.stringify(text)} as XML whitespace, and it holds another character. Cut each piece of #pantry/import/pieces.ts at the whitespace it counts.`,
  );
};

/**
 * A form split around its collapsed value: the whitespace before it, the rest with no whitespace
 * at either end, and the whitespace after it.
 */
export interface Pieces {
  readonly lead: Space;
  readonly trail: Space;
  readonly value: string;
}

/**
 * Split a form around its value, as XML Schema's `collapse` strips its ends (Part 2, §4.3.6): the
 * whitespace before its first character that is not whitespace, the value up to and including
 * its last, and the rest. A form of whitespace alone is all lead, its value empty. Each whitespace
 * character is one UTF-16 unit, so the bounds are read by unit.
 *
 * @param text - The form, as written.
 * @returns Its pieces, which concatenate to it.
 * @see {@link https://www.w3.org/TR/xml/#NT-S | XML 1.0, S}
 */
export const piecesOf = (text: string): Pieces => {
  let start = 0;
  while (start < text.length && spaceCharacters.has(text.charAt(start))) {
    start += 1;
  }

  let end = text.length;
  while (end > start && spaceCharacters.has(text.charAt(end - 1))) {
    end -= 1;
  }

  return {
    lead: spaceOf(text.slice(0, start)),
    trail: spaceOf(text.slice(end)),
    value: text.slice(start, end),
  };
};

/**
 * One token of a whitespace-separated list, with the whitespace written before it, and after it
 * where it is the last.
 */
export interface Token {
  readonly after: Space;
  readonly before: Space;
  readonly token: string;
}

/**
 * Split a whitespace-separated list into its tokens, each a maximal run of no whitespace with the
 * whitespace written before it, and the last with the whitespace after it, so the pieces
 * concatenate to the list and every token but the first follows whitespace (`E1_derived` on
 * `Idref`, `ToleranceToken` and `TextIdref`).
 *
 * @param text - The list, as written.
 * @returns Its tokens, in order; none for a list of whitespace alone.
 */
export const tokensOf = (text: string): readonly Token[] => {
  const runs = [...text.matchAll(regex("[^\t\n\r ]+", "gu"))];

  return runs.map((run, at): Token => {
    const previous = runs[at - 1];
    const from = previous === undefined ? 0 : previous.index + previous[0].length;
    const to = run.index + run[0].length;

    return {
      after: spaceOf(at === runs.length - 1 ? text.slice(to) : ""),
      before: spaceOf(text.slice(from, run.index)),
      token: run[0],
    };
  });
};

/**
 * An href's two written pieces (reading 102), `href = path ‖ params`.
 */
export interface HrefPieces {
  readonly params: Params;
  readonly path: string;
}

/**
 * State that a text is an href's `params` piece.
 *
 * @param text - The text.
 * @returns Whether it is empty or starts with `?` or `#`.
 */
const isParams = (text: string): text is Params =>
  text === "" || text.startsWith("?") || text.startsWith("#");

/**
 * Hold a piece the split cut as an href's `params` to its type.
 *
 * @param text - The piece: empty, or from the href's first `?` or `#`.
 * @returns The piece.
 * @throws {Error} When it is neither, which the split never cuts.
 */
const paramsOf = (text: string): Params => {
  if (isParams(text)) {
    return text;
  }

  throw new Error(
    `The href split cut ${JSON.stringify(text)} as params, which start at a "?" or "#". Correct hrefPiecesOf.`,
  );
};

/**
 * Split an href into its two written pieces (reading 102): `path`, up to its first `?` or `#`, and
 * `params`, the query or fragment from there, so `href = path ‖ params`.
 *
 * @param href - The href, as written.
 * @returns Its pieces.
 */
export const hrefPiecesOf = (href: string): HrefPieces => {
  const at = href.search(regex("[?#]", "u"));

  return at === -1
    ? { params: "", path: href }
    : { params: paramsOf(href.slice(at)), path: href.slice(0, at) };
};

/**
 * The pieces of a `srcset`'s image candidate as `SrcsetCandidate` types them.
 */
type CandidateRow = Addition<(typeof Qti)["relations"]["SrcsetCandidate"]>;

/**
 * One image candidate of a `srcset` as written (HTML, "srcset attributes"): `lead`, the whitespace
 * and commas before its URL; `url`, a run of non-whitespace characters that neither starts nor ends
 * with a comma; and `descriptor`, the rest up to the comma that ends the candidate, empty or
 * starting with whitespace.
 */
export interface SrcsetCandidatePieces {
  readonly descriptor: CandidateRow["descriptor"];
  readonly lead: CandidateRow["lead"];
  readonly url: CandidateRow["url"];
}

/**
 * The language of a `srcset`'s lead and trail: whitespace and commas.
 */
const gapForm = regex("^[\t\n\r ,]*$", "u");

/**
 * The language of an image candidate's URL: non-whitespace, starting and ending with no comma.
 */
const urlForm = regex("^[^\t\n\r ,](?:[^\t\n\r ]*[^\t\n\r ,])?$", "u");

/**
 * The language of an image candidate's descriptors: empty, or whitespace and any text after it.
 */
const descriptorForm = regex("^(?:[\t\n\r ].*)?$", "su");

/**
 * State that a piece of a `srcset` is whitespace and commas, `SrcsetGap`'s language.
 *
 * @param text - The piece.
 * @returns Whether it is.
 */
const isGap = (text: string): text is CandidateRow["lead"] => gapForm.test(text);

/**
 * State that a piece of a `srcset` is an image candidate's URL, `SrcsetUrl`'s language.
 *
 * @param text - The piece.
 * @returns Whether it is.
 */
const isUrl = (text: string): text is CandidateRow["url"] => urlForm.test(text);

/**
 * State that a piece of a `srcset` is an image candidate's descriptors, `SrcsetDescriptor`'s
 * language.
 *
 * @param text - The piece.
 * @returns Whether it is.
 */
const isDescriptor = (text: string): text is CandidateRow["descriptor"] =>
  descriptorForm.test(text);

/**
 * Hold a piece of a `srcset` the split cut to its language.
 *
 * @param text - The piece.
 * @param holds - Whether the piece is in its language.
 * @param what - The piece's name, for the defect.
 * @returns The piece.
 * @throws {Error} When the piece is outside its language, which no cut here makes: a defect of the
 *   split, never of the document.
 */
const pieceOf = <T extends string>(
  text: string,
  holds: (piece: string) => piece is T,
  what: string,
): T => {
  if (holds(text)) {
    return text;
  }

  throw new Error(
    `The srcset split cut ${JSON.stringify(text)} as a ${what}, outside its language. Correct srcsetCandidatesOf in #pantry/import/pieces.ts.`,
  );
};

/**
 * A `srcset` as {@link srcsetCandidatesOf} splits it: its image candidates in order, and `trail`,
 * the whitespace and commas after the last.
 */
export interface SrcsetSplit {
  readonly candidates: readonly SrcsetCandidatePieces[];
  readonly trail: Addition<(typeof Qti)["relations"]["Srcset"]>["trail"];
}

/**
 * Whether a character of a `srcset` is whitespace: one of {@link spaceCharacters}, XML's, which an
 * attribute value holds as HTML's ASCII whitespace (a form feed is no XML character).
 *
 * @param character - The character, none past the text's end.
 * @returns Whether it is whitespace.
 */
const isSpaceAt = (character: string | undefined): boolean =>
  character !== undefined && spaceCharacters.has(character);

/**
 * Split a `srcset` into its image candidates as HTML's "parse a srcset attribute" algorithm reads
 * them (HTML Standard, §4.8.4.3.10): skip whitespace and commas; collect the URL, a run of
 * non-whitespace characters, its trailing commas given back to the next candidate's lead, after
 * which it has no descriptors; otherwise collect its descriptors up to the first comma outside
 * parentheses. What follows the last candidate, whitespace and commas, is the `trail`.
 *
 * Every piece is a stretch of the value: `lead ‖ url ‖ descriptor` of each candidate in order, then
 * `trail`, is the value, which the database proves (`E1_derived` over `SrcsetForm`). The
 * descriptors are kept as written and never read: a candidate's URL alone names a file (spec
 * reading 124).
 *
 * @param lexical - The `srcset` as written.
 * @returns Its candidates in order, and its trail.
 */
export const srcsetCandidatesOf = (lexical: string): SrcsetSplit => {
  const candidates: SrcsetCandidatePieces[] = [];
  let position = 0;
  for (;;) {
    const leadStart = position;
    while (isSpaceAt(lexical[position]) || lexical[position] === ",") {
      position += 1;
    }

    if (position >= lexical.length) {
      return { candidates, trail: pieceOf(lexical.slice(leadStart), isGap, "trail") };
    }

    const urlStart = position;
    while (position < lexical.length && !isSpaceAt(lexical[position])) {
      position += 1;
    }

    let urlEnd = position;
    while (urlEnd > urlStart && lexical[urlEnd - 1] === ",") {
      urlEnd -= 1;
    }

    const lead = pieceOf(lexical.slice(leadStart, urlStart), isGap, "lead");
    const url = pieceOf(lexical.slice(urlStart, urlEnd), isUrl, "URL");
    if (urlEnd < position) {
      candidates.push({ descriptor: "", lead, url });
      position = urlEnd;
      continue;
    }

    const descriptorStart = position;
    let depth = 0;
    while (position < lexical.length && (lexical[position] !== "," || depth > 0)) {
      if (lexical[position] === "(") {
        depth += 1;
      } else if (lexical[position] === ")" && depth > 0) {
        depth -= 1;
      }

      position += 1;
    }

    candidates.push({
      descriptor: pieceOf(lexical.slice(descriptorStart, position), isDescriptor, "descriptor"),
      lead,
      url,
    });
  }
};
