/**
 * The response processing templates the information model publishes (spec reading 51) and the
 * `template` URIs that name them: pantry's "Template needs" reads them over `TemplateProcessing`
 * (`#pantry/qti/queries.ts`), and so does every reader that asks which published template an item's
 * response processing names, the QTI database's delivery level among them.
 */
/**
 * The response processing templates the information model publishes, by name (spec reading 51,
 * from section 2.5.1's list): `match_correct`, `map_response` and `map_response_point`, and the
 * Common Cartridge templates `CC2_match`, `CC2_match_basic` and `CC2_map_response`. A `template`
 * URI names one by {@link urisOf}.
 */
export const publishedTemplates = [
  "match_correct",
  "map_response",
  "map_response_point",
  "CC2_match",
  "CC2_match_basic",
  "CC2_map_response",
] as const;

/**
 * A published template's name.
 */
export type PublishedTemplate = (typeof publishedTemplates)[number];

/**
 * The URI prefixes a published template is named under (spec reading 51): the information model's
 * and the implementation guide's examples'.
 */
const templatePrefixes = [
  "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/",
  "https://www.imsglobal.org/question/qti_v3p0/rptemplates/",
] as const;

/**
 * The `template` URIs that name some published templates (spec reading 51): each template's four,
 * either of {@link templatePrefixes} followed by its name, with or without `.xml`. A `template`'s
 * `value` is its lexical form collapsed, as `xs:anyURI`'s whitespace facet collapses it, so it
 * names a template exactly where it is one of these.
 *
 * @param templates - The templates.
 * @returns Their URIs.
 */
export const urisOf = (templates: readonly PublishedTemplate[]) =>
  templates.flatMap((template) =>
    templatePrefixes.flatMap((prefix) => [`${prefix}${template}`, `${prefix}${template}.xml`]),
  );
