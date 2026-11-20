import { acceptedItem, configure } from "@qti-pie/plate";
import type { Accepted, Configuration, InvalidConfiguration, Verdict } from "@qti-pie/plate";
import { admitted } from "@qti-pie/plate/test/admitted";
/**
 * Opening a case's item as a host serving it would, `@qti-pie/specimen/open`: plate opens the
 * document as content the database admitted, through plate's one admission helper (`admitted`,
 * `@qti-pie/plate/test/admitted`), which fails where the admission run has not admitted it, and
 * decodes its configuration. It loads plate's reader and the XSD tables securing reads, so it
 * stays apart from the generator.
 *
 * @module
 */
import { Data, Effect, Option } from "effect";
import type { Item } from "#specimen/write.ts";

/**
 * Plate did not accept a case's item as it is: left it unchecked, or accepted it with a feature it
 * does not render. Each is a defect of the writer or of plate, never a case to skip.
 */
export class SpecimenRefused extends Data.TaggedError("SpecimenRefused")<{
  readonly verdict: Verdict;
}> {
  /**
   * What plate said of the item.
   */
  override get message(): string {
    const { verdict } = this;

    switch (verdict.verdict) {
      case "unchecked": {
        return `plate left the specimen unchecked: ${verdict.reasons
          .map((reason) => `${reason.reason} at ${reason.path}`)
          .join("; ")}`;
      }
      case "accepted-with-unsupported": {
        return verdict.kind === "item"
          ? `plate accepted the specimen with features it does not render: ${verdict.accepted.item.unsupported
              .map((feature) => `${feature.feature} at ${feature.path}`)
              .join("; ")}`
          : `plate accepted the specimen as a ${verdict.kind}, not an item`;
      }
      case "accepted": {
        return `plate accepted the specimen as a ${verdict.kind}, not an item`;
      }
      default: {
        return verdict satisfies never;
      }
    }
  }
}

/**
 * A case's item as plate opened it: the accepted document and its configuration.
 */
export interface Opened {
  readonly accepted: Accepted;
  readonly configuration: Configuration;
}

/**
 * Open a case's item: open its XML through plate's `admitted`, which must accept it as an item
 * with nothing unsupported, and decode its configuration with `configure`, under the host's shuffle
 * seed where it gives one and the case's own otherwise.
 *
 * @param item The item.
 * @param seed The host's shuffle seed, none to keep the case's own.
 * @returns The opened item, {@link SpecimenRefused} when plate does not accept it as it is, or
 *   plate's `InvalidConfiguration` when its configuration does not decode.
 */
export const opened = Effect.fn("specimen.opened")(function* opened(
  item: Item,
  seed: Option.Option<string>,
): Effect.fn.Return<Opened, InvalidConfiguration | SpecimenRefused> {
  const verdict = yield* admitted(item.location, new TextEncoder().encode(item.xml));
  const configuration = yield* configure(
    Option.match(seed, {
      onNone: () => item.configuration,
      onSome: (given) => ({ ...item.configuration, seed: given }),
    }),
  );
  const accepted = verdict.verdict === "accepted" ? acceptedItem(verdict) : Option.none();

  return yield* Option.match(accepted, {
    onNone: () => Effect.fail(new SpecimenRefused({ verdict })),
    onSome: (held) => Effect.succeed({ accepted: held, configuration }),
  });
});
