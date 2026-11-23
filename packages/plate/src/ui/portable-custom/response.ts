/**
 * A Portable Custom Interaction's (Q-16) response between the PCI and the host's `<Responses>`: the
 * Appendix C JSON a PCI speaks, read and written by `#plate/pci/json.ts`, against the response's
 * declaration, so what the PCI says is the value the item holds and posts, typed as its declaration
 * types it.
 *
 * The module is imported by client modules only.
 *
 * @module
 */
import type { Declared, ModelledBaseType, RecordDeclared } from "#plate/model/values.ts";

/**
 * A PCI's response as its declaration types it, which the island writes whole: a value of any base
 * type but `file`, of a `single`, `multiple` or `ordered` declaration, or a record, its fields as
 * the PCI gives them (QTI 3.0.1 PCI, Appendix C: a record response is the record the PCI returns).
 * A response of a `file` declaration has no island: plate's form posts no file, so the server gives
 * its PCI its notice.
 */
export type PciDeclared = Declared<Exclude<ModelledBaseType, "file">> | RecordDeclared;
