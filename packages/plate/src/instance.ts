/**
 * An item instance's token, which scopes every id plate writes and names the entry its End Attempts
 * post in: {@link checkInstance}, the requirements a token meets, and {@link scopedId}, plate's own
 * ids under it.
 *
 * @module
 */
import { regex } from "arkregex";
import { Array, Option } from "effect";

/**
 * The requirements an instance token meets, in the order {@link checkInstance} checks them.
 *
 * - `non-empty`: it holds at least one character.
 * - `characters`: every character is an ASCII letter, a digit, `_`, `.`, `:` or `-`, which an `id`,
 *   an IDREFS list and a form entry name all take, and none of which is whitespace.
 * - `id-boundary`: it does not end in `-` and holds no `--`. The renderer's ids are
 *   `<instance>-<segment>-…` (`scopedId`) and an authored id is `<instance>--<id>` (`authoredId`),
 *   so a token that broke this would let one instance's part id equal another's authored id: `ab-`
 *   with `status` and `ab` with an authored `status` both give `ab--status`.
 */
const instanceRequirements = ["non-empty", "characters", "id-boundary"] as const;

/**
 * A requirement an instance token meets: one of {@link instanceRequirements}.
 */
export type InstanceRequirement = (typeof instanceRequirements)[number];

/**
 * How a token breaks the first requirement it breaks, with what breaks it: `characters` the first
 * character outside the set, `id-boundary` where the token meets an id's boundary, `end` where it
 * ends in `-` and `double` where it holds `--`.
 */
export type InstanceBreach =
  | { readonly requirement: "non-empty" }
  | { readonly character: string; readonly requirement: "characters" }
  | { readonly at: "double" | "end"; readonly requirement: "id-boundary" };

/**
 * A character an instance token is not made of: anything but an ASCII letter, a digit, `_`, `.`,
 * `:` and `-`.
 */
const outsideCharacter = regex("[^\\w.:-]", "u");

/**
 * How a token breaks each requirement, one check per requirement, none where it meets it.
 */
const breachesOf = {
  characters: (token: string) =>
    Option.map(Option.fromUndefinedOr(outsideCharacter.exec(token)?.[0]), (character) => ({
      character,
      requirement: "characters",
    })),
  "id-boundary": (token: string) => {
    if (token.endsWith("-")) {
      return Option.some({ at: "end", requirement: "id-boundary" });
    }

    return token.includes("--")
      ? Option.some({ at: "double", requirement: "id-boundary" })
      : Option.none();
  },
  "non-empty": (token: string) =>
    token === "" ? Option.some({ requirement: "non-empty" }) : Option.none(),
} as const satisfies {
  readonly [R in InstanceRequirement]: (
    token: string,
  ) => Option.Option<Extract<InstanceBreach, { readonly requirement: R }>>;
};

/**
 * Check an instance token: an opaque token, unique per page, that scopes an item instance's ids
 * and names the entry its End Attempts post in (`endedName`).
 *
 * A host's own key for the item's use passes, such as `sitting-42.1`, as do React's `useId()`
 * forms `_r_1_` (React 19.2 and later) and `:r1:` (React 18 and 19.0); React 19.1's `«r1»` does
 * not, so its caller passes a token of their own.
 *
 * Two tokens that each pass can still collide when one extends the other after a `-`, such as `a`
 * and `a-b`: an id joins the token to its segments with `-`, and a segment, a response identifier
 * among them, may itself hold one, so instance `a` with response `b-X` writes the ids instance
 * `a-b` with response `X` does. Unique tokens of one length never do.
 *
 * @example
 *   checkInstance("_r_1_"); // Option.none()
 *   checkInstance("ab-"); // Option.some({ at: "end", requirement: "id-boundary" })
 *
 * @param token The token an author passes as the instance.
 * @returns How it breaks the first of {@link instanceRequirements} it breaks, or none when it meets
 *   them all.
 */
export const checkInstance = (token: string): Option.Option<InstanceBreach> =>
  Array.findFirst(instanceRequirements, (requirement): Option.Option<InstanceBreach> =>
    breachesOf[requirement](token),
  );

/**
 * Construct one of plate's own ids, scoped by the item's instance, so two instances on one page
 * never share an id: an id joins the instance to its segments with `-`.
 *
 * @example
 *   scopedId("sitting-42.1", "item"); // "sitting-42.1-item"
 *
 * @param instance The item instance token, one {@link checkInstance} passes.
 * @param segments The id's further parts, such as a response identifier and a part's name.
 * @returns The instance and the segments joined by `-`.
 */
export const scopedId = (instance: string, ...segments: readonly (number | string)[]): string =>
  [instance, ...segments].join("-");

/**
 * Name the entry an End Attempt's button posts its response's identifier under when its press
 * submits the host's form, HTML's submitter, so only the button that ended the attempt posts it:
 * the instance's token and `#ended`. No instance token holds `#`, so the name is no other
 * instance's.
 *
 * @param instance The item instance token, one {@link checkInstance} passes.
 * @returns The entry's name.
 */
export const endedName = (instance: string): string => `${instance}#ended`;
