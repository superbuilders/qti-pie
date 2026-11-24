/**
 * The reference package of the response processing templates QTI 3.0.1 publishes (spec reading 51,
 * pantry's `publishedTemplates`): 1EdTech's six template documents, byte for byte as
 * `https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/<name>.xml` serves them, each at
 * `<name>.xml` and listed by its manifest as an `imsqti_rptemplate_xmlv3p0` resource, whose root is
 * the template's `qti-response-processing`. It is content like any other package: pantry admits it,
 * an installation's content load publishes it under {@link templatePackage}, before any item that
 * names a template ("Template held"), and the SQL grader runs a published template's rules from its
 * document's stored walk, as it runs a located template's (the ledger's
 * `PublishedTemplateDocument`, the delivery level's `ResponseProgram`).
 *
 * Information model §4.6.1 (`template`): "If a template identifier is given it may be used to
 * locate an externally defined responseProcessing template"; the templates are published documents,
 * never rules a processor holds built in.
 */
import { fileURLToPath } from "node:url";

/**
 * The package's name, the key its rows are stored under.
 */
export const templatePackage = "qti-rptemplates";

/**
 * The package's directory, as pantry's import reads a package (`readPackage`).
 */
export const templatePackageDirectory = fileURLToPath(
  new URL("../qti-rptemplates", import.meta.url),
);
