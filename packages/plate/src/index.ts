/**
 * The public surface of `@qti-pie/plate`, published through the `exports` map in `package.json`:
 * the functions a host serving items calls, the types their signatures name and the errors they
 * fail with.
 *
 * `openAdmitted` opens a document the database admitted, and `acceptedItem` takes the accepted item
 * from its verdict. `configure` decodes the host's settings. `shuffleSeed` derives a served item's
 * shuffle seed from its decision's one seed, and `stageOrder` the order a stage's items show in.
 * Plate grades nothing: the QTI database runs template processing at the take, and response
 * processing, openness and credit in the statement that records an attempt, and the host hands
 * plate the values that statement returns, as an {@link ItemRecord} and a review's `graded`.
 * `redact` copies the item into the form a page may know, `shownResponses` names the responses its
 * page's interactions write, and `startingResponses` gives the responses an attempt starts from,
 * which a host's `<Responses>` holds. A host posts them typed, as `PostedResponses` in
 * `@qti-pie/plate/codec` encodes them, and its server decodes them once with the same Schema.
 * `format` writes a value
 * in its base type's lexical form, which `parseLexical` reads back, and `readIeeeDouble` reads an
 * `xs:double` as plate reads every one. The QTI database admits or refuses the answers in the
 * statement that grades them, and `refusalMessages` words a refused answer's reasons for its page.
 * `textOfXhtml` reads an `xhtml` Extended Text's value back as the text its box shows, the text the
 * QTI database matches its `pattern-mask` against (reading 244). `typedResponseOf` reads a typed
 * response from its boxes' texts as a Text Entry's and an Extended Text's islands do, by
 * `readTyped` and `readRecord`, one box's reading, so server code reads typed text as a page does.
 * `restore` reads a record's shown values back, and `solution` gives the item's correct responses
 * as its interactions show them. `assetPaths` names the package files an item body's URL attribute
 * names. `Supports` is the accessibility supports a host enables for one candidate, `<Item>`'s
 * `supports`, and `noSupports` enables none, from which a host enables the spoken support at a
 * reading type, as a candidate's read-aloud setting asks.
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
 * Nothing else under `src/` is reachable from outside the package but the UI's four entries,
 * `./codec`, the posted body's codec and the value model's Schemas, which a browser bundle loads,
 * `./admission-codes`, the reason codes `refusalMessages` words, the one list (generated from the
 * QTI database's machine) the ledger builds its closed roster `AdmissionCode` from without loading
 * the rest of plate, `./test/admitted`, the test support that tells a document the database
 * admitted, which specimen's UI suite sweeps the corpus by as plate's own sweeps do, and
 * `./test/records`, the record a test shows an item by before its first attempt. The tests' seams
 * (`acceptForTest` and its kin) and the redacted item's brand constructor (`brandRedacted`) are
 * never exported, so a host holds an `Accepted` only from `openAdmitted`, and a `Redacted` only
 * from `redact`.
 *
 * @module
 */
export type {
  AdmissionCode,
  Refusal,
  RefusalCount,
  RefusalMessage,
  RefusalNumber,
  RefusalReason,
  RefusalWord,
} from "#plate/admission.ts";

export { refusalMessages } from "#plate/admission.ts";

export type { Configuration, ConfigurationInput } from "#plate/configuration.ts";

export { configure, InvalidConfiguration } from "#plate/configuration.ts";

export { textOfXhtml } from "#plate/interactions/xhtml-text.ts";

export { collapseXmlSpace } from "#plate/model/attributes.ts";

export type { CompletionStatus } from "#plate/model/built-ins.ts";

export { asTyped, readRecord, readTyped, typedResponseOf } from "#plate/model/typed-text.ts";

export type {
  TypedDeclared,
  TypedReading,
  UnreadReason,
  Written,
} from "#plate/model/typed-text.ts";

export type { ItemRecord, Showing } from "#plate/model/record.ts";

export { assetPaths } from "#plate/model/url.ts";

export type {
  Declared,
  ModelledBaseType,
  RecordDeclared,
  RecordValue,
  Responses,
  ResponseValue,
  Value,
} from "#plate/model/values.ts";

export {
  format,
  isModelled,
  isNullResponse,
  parseLexical,
  readIeeeDouble,
} from "#plate/model/values.ts";

export type { HostFacts, PciHostFacts, PciModuleRoute } from "#plate/pci/host.ts";

export type { PciInteractionModules } from "#plate/pci/modules.ts";

export { pciModulesIn } from "#plate/pci/modules.ts";

export type { ModuleRoute, PciModules, PciNotice, PciResolution } from "#plate/pci/resolve.ts";

export { resolvePciModules } from "#plate/pci/resolve.ts";

export { shownResponses, startingResponses } from "#plate/starting.ts";

export { redact } from "#plate/redact.ts";

export type { Redacted } from "#plate/redact/walk.ts";

export type { Restored } from "#plate/restore.ts";

export { restore } from "#plate/restore.ts";

export type { ItemIdentity } from "#plate/seed.ts";

export { shuffleSeed, stageOrder } from "#plate/seed.ts";

export { solution } from "#plate/solution.ts";

export type { Supports } from "#plate/supports.ts";

export { noSupports } from "#plate/supports.ts";

export { openAdmitted } from "#plate/validate/admitted.ts";

export type { Accepted, AcceptedStimulus, Verdict } from "#plate/validate/verdict.ts";

export { acceptedItem, acceptedStimulus, unsupportedFeatures } from "#plate/validate/verdict.ts";
