/**
 * The kinds whose `label` asks for the tool that labelled it (spec reading `label-tool`), read from
 * the types the ASI XSDs declare.
 *
 * The QTI 3.0.1 information model states the sentence "If an item uses labels then values for the
 * associated toolName and toolVersion characteristics must also be provided" in the description
 * of one `label` characteristic per class, and of no other: BasePromptInteraction's, the six of the
 * BaseSequence family, ItemBody's and AssessmentItem's, the item root's own (§4.1.3, which says
 * "attributes"). The other
 * classes that declare a `label` describe it as text for a reader and ask for nothing:
 * AssessmentStimulus's ("A human readable label", §4.3.3), ItemFileInfo's ("A human readable
 * label/short description for the file", §5.80.2) and PrintedVariable's (one "appropriate for a
 * tooltip", §7.30.4). Each label is read by its own
 * characteristic's description, so a kind's label asks for its tool exactly when the kind's
 * declared type is, or derives from, a type whose label states the sentence.
 *
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/info#DataCharacteristic_BaseSequence.Attr_label | QTI 3.0 information model, 5.16.5 label}
 */
import { Option } from "effect";
import { typeHandle } from "#pantry/grammar/xsi.ts";
import type { TypeDerivation } from "#pantry/vocab/inventory/types.ts";
import { asiNamespace } from "#pantry/vocab/namespaces.ts";

/**
 * The ASI types whose `label` characteristic states the tool sentence, each with the section of
 * the information model that states it.
 */
const toolLabelTypes = [
  { section: "5.15.5", type: "BasePromptInteractionDType" },
  { section: "5.16.5", type: "BaseSequenceDType" },
  { section: "5.17.5", type: "BaseSequenceEmptyDType" },
  { section: "5.18.5", type: "BaseSequenceFullDType" },
  { section: "5.19.5", type: "BaseSequenceRIdentDType" },
  { section: "5.20.5", type: "BaseSequenceXBaseDType" },
  { section: "5.21.5", type: "BaseSequenceXBaseEmptyDType" },
  { section: "5.79.4", type: "ItemBodyDType" },
  { section: "4.1.3", type: "AssessmentItemDType" },
] as const;

/**
 * Find the kinds whose declared type is one of {@link toolLabelTypes} or derives from one.
 *
 * A kind's governing type under `xsi:type` is validly derived from its declared type (XML Schema
 * 1.0 Part 1, cvc-elt.4.3), so it derives from the same base and its label asks for the same.
 *
 * @param input - The composition's types.
 * @param input.declaredType - The type each kind declares, as `xsi.ts` reads it.
 * @param input.derivations - The named types validly derived from each type.
 * @param input.kinds - The kinds, in roster order.
 * @returns The kinds, in roster order.
 */
export const toolLabelKindsOf = <K extends string>(input: {
  readonly declaredType: (kind: K) => Option.Option<string>;
  readonly derivations: readonly TypeDerivation[];
  readonly kinds: readonly K[];
}): readonly K[] => {
  const types = new Set(
    input.derivations
      .filter(
        ({ type }) =>
          type.namespace === asiNamespace &&
          toolLabelTypes.some((held) => held.type === type.local),
      )
      .flatMap(({ derived }) => derived.map(typeHandle)),
  );

  return input.kinds.filter((kind) =>
    Option.exists(input.declaredType(kind), (type) => types.has(type)),
  );
};
