/**
 * A package-media policy file, `policy.json`, as an application keeps it: the extensions whose
 * files it serves a player, each with the media type it serves them with. Each entry is one
 * `MediaType` row of the package-media level (`#pantry/qti/media.ts`), keyed by its extension, so
 * an extension has one type and a type may stand under several extensions (`jpg` and `jpeg`). A
 * file whose extension the policy does not list is stored and withheld, never refused.
 */
import { Schema } from "effect";

/**
 * A file extension a media policy lists: lowercase ASCII letters and digits, at most 127, without
 * its dot, as an entry's path writes it after its last `.` (`photo.jpg` is `jpg`). An entry's
 * extension is matched against it in ASCII lower case, so `jpg` serves `photo.jpg` and
 * `photo.JPG`.
 */
export const MediaExtension = Schema.String.check(
  Schema.isPattern(/^[a-z0-9]{1,127}$/u, {
    message:
      "Write an extension in lowercase ASCII letters and digits, at most 127, without its dot, such as svg or jpg",
  }),
);

/**
 * The media type a policy serves an extension's files with, as an HTTP `Content-Type` names it: a
 * type and a subtype, each a restricted name (RFC 6838, §4.2), in lower case, the form the
 * registry writes, with no parameter.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc6838#section-4.2 | RFC 6838, §4.2 Naming Requirements}
 */
export const MediaType = Schema.String.check(
  Schema.isPattern(/^[a-z0-9][a-z0-9!#$&^_.+-]{0,126}\/[a-z0-9][a-z0-9!#$&^_.+-]{0,126}$/u, {
    message:
      "Write a media type in lower case as a type and a subtype with no parameter, such as image/svg+xml (RFC 6838, §4.2)",
  }),
);

/**
 * An install's policy, `policy.json`: exactly `{ "media": { "<extension>": "<type>/<subtype>", ...
 * } }`, the one closed record of the extensions whose files the install serves, each with the media
 * type it serves them with, each entry one row of `MediaType` (`#pantry/qti/media.ts`). It lists at
 * least one extension.
 */
export const MediaPolicySchema = Schema.Struct({
  media: Schema.Record(MediaExtension, MediaType).check(
    Schema.isMinProperties(1, {
      message: 'List at least one extension, such as { "svg": "image/svg+xml" }',
    }),
  ),
});
