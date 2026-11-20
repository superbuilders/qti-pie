/**
 * The public surface of `@qti-pie/plate`, published through the `exports` map in `package.json`:
 * the functions a host serving items calls, the types their signatures name and the errors they
 * fail with.
 *
 * `openAdmitted` opens a document the database admitted, and `acceptedItem`
 * takes the accepted item from its verdict. `configure` decodes the host's settings. `itemSeeds`
 * derives a served item's shuffle and processing seeds from its decision's one seed, and
 * `stageOrder` the order a stage's items show in. `begin` starts the record of an item's first
 * attempt, drawing the values its template processing sets under the processing seed; `scoreRecord`
 * runs one attempt from a record and gives the record after it, `attemptOf` reads the facts a host
 * records of that attempt, and `recordAfter` rebuilds the next attempt's record from `begin`'s and
 * the attempts made, each with its clock reading. `numAttempts` counts those attempts as QTI's
 * built-in does, and `itemSessionOpen` says whether the item session takes another, by the stage's
 * limit or, for an adaptive item, its completion. `redact` copies the item into the form a page may
 * know, `postings` gives the bindings its responses post under, and `entryName` (with its inverse
 * `responseOf`), `partition`, `decode` and `encode` carry a response between its value and the
 * entries a form posts. `format` writes a value in its base type's lexical form, which
 * `parseLexical` reads back, and `readIeeeDouble` reads an `xs:double` as plate reads every one.
 * `checkResponses` validates the answers as the item's interactions do, `score` is `scoreRecord`
 * over an optional record, `restore` reads a record's shown values back, and `solution` gives the
 * item's correct responses. `assetPaths` names the package files an item body's URL attribute
 * names.
 *
 * A Portable Custom Interaction runs where the host says: `pciModulesIn` gives each PCI of an item
 * with its module facts as written, `resolvePciModules` resolves them against the package's files
 * into the routes the host serves, and the host passes those, with its frame page's URL, as the
 * `pci` member of its `HostFacts`, which `<Item>` takes as `host`. The frame page itself is
 * `@qti-pie/plate/ui/pci-frame`'s (`src/ui/portable-custom/frame-page.ts`).
 *
 * The page is the UI's: `@qti-pie/plate/ui` (`src/ui/index.ts`) gives `<Item>`, the React Server
 * Component that renders an opened item, and `@qti-pie/plate/ui/client` (`src/ui/client.ts`) the
 * client islands and `<Responses>`, which holds an item's responses as the host's state.
 *
 * Plate judges no document's validity: the database does (pantry's laws), and a host serves only
 * what it admitted, through `openAdmitted`, which secures it by the ASI XSD's tables.
 *
 * `openAdmitted` and `configure` return Effects. Every other function is plain, callable with no
 * Effect runtime: it returns its value, or a `Result` when a caller can make it fail.
 *
 * Nothing else under `src/` is reachable from outside the package but the UI's four entries and
 * `./test/admitted`, the test support that tells a document the database admitted, which specimen's
 * UI suite sweeps the corpus by as plate's own sweeps do. The tests' seams (`acceptForTest` and its
 * kin) and the redacted item's brand constructor (`brandRedacted`) are never exported, so a host
 * holds an `Accepted` only from `openAdmitted`, and a `Redacted` only from `redact`.
 *
 * @module
 */
export type { Attempt, ClockedAttempt } from "#plate/attempts.ts";

export { attemptOf, itemSessionOpen, numAttempts, recordAfter } from "#plate/attempts.ts";

export { begin } from "#plate/begin.ts";

export type { Configuration } from "#plate/configuration.ts";

export { configure, InvalidConfiguration } from "#plate/configuration.ts";

export type { Credit } from "#plate/credit.ts";

export { credit } from "#plate/credit.ts";

export type { EngineFailure } from "#plate/engine/evaluate.ts";

export {
  OutcomeMismatchError,
  RecordOperandError,
  UnknownIdentifierError,
  UnmappedResponseError,
} from "#plate/engine/failures.ts";

export type {
  Binding,
  DecodeOptions,
  Entry,
  Partition,
  RecordBinding,
  ValueBinding,
} from "#plate/form/encoding.ts";

export {
  decode,
  encode,
  entryName,
  Malformed,
  partition,
  responseOf,
} from "#plate/form/encoding.ts";

export type { ValidationMessage } from "#plate/interactions/contract.ts";

export { collapseXmlSpace } from "#plate/model/attributes.ts";

export type { CompletionStatus } from "#plate/model/built-ins.ts";

export type { ItemRecord } from "#plate/model/record.ts";

export { assetPaths } from "#plate/model/url.ts";

export type {
  ModelledBaseType,
  RecordValue,
  Responses,
  ResponseValue,
  Value,
} from "#plate/model/values.ts";

export { format, isModelled, parseLexical, readIeeeDouble } from "#plate/model/values.ts";

export type { HostFacts, PciHostFacts, PciModuleRoute } from "#plate/pci/host.ts";

export type { PciInteractionModules } from "#plate/pci/modules.ts";

export { pciModulesIn } from "#plate/pci/modules.ts";

export type { ModuleRoute, PciModules, PciNotice, PciResolution } from "#plate/pci/resolve.ts";

export { resolvePciModules } from "#plate/pci/resolve.ts";

export type { Posting } from "#plate/postings.ts";

export { postings } from "#plate/postings.ts";

export { redact } from "#plate/redact.ts";

export type { Redacted } from "#plate/redact/walk.ts";

export { checkResponses } from "#plate/responses.ts";

export type { Restored } from "#plate/restore.ts";

export { restore } from "#plate/restore.ts";

export {
  InvalidRecord,
  InvalidResponses,
  RecordMismatch,
  ResponsesRefused,
  scoreRecord,
} from "#plate/score.ts";

export type { ItemIdentity, ItemSeeds } from "#plate/seed.ts";

export { itemSeeds, stageOrder } from "#plate/seed.ts";

export { solution } from "#plate/solution.ts";

export { openAdmitted } from "#plate/validate/admitted.ts";

export type { Accepted, Verdict } from "#plate/validate/verdict.ts";

export { acceptedItem, unsupportedFeatures } from "#plate/validate/verdict.ts";
