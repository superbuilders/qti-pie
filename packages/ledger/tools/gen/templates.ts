import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { readProgram } from "@qti-pie/pantry/import/program.ts";
import { nonElementKinds } from "@qti-pie/pantry/grammar/install.ts";
import { publishedTemplates } from "@qti-pie/pantry/qti/templates.ts";
import { Effect } from "effect";
import type { Generator } from "#tools/gen/generator.ts";
import { must } from "#tools/gen/grade/text.ts";

/**
 * The directory of the template documents, each `<name>.xml`, byte for byte as
 * `https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/<name>.xml` serves it.
 */
const templatesDirectory = path.join(import.meta.dirname, "..", "..", "qti-rptemplates");

/**
 * The response processing element, each template document's root (information model §4.6).
 */
const processingKind = "qti-response-processing";

/**
 * The kinds of a node that is no element: a template's character data, white space and comments,
 * which the grader reads no row of (its base values' texts are `templateTexts`).
 */
const nonElement: ReadonlySet<string> = new Set(nonElementKinds);

/**
 * Whether an attribute's lexical form is its value under every white space facet XML Schema
 * gives (preserve, replace, collapse; Part 2 §4.3.6): no tab, line feed or carriage return, and no
 * space at its ends or beside another. pantry's `Attribute.value` normalizes the lexical form by
 * the facet its domain names, so where this holds the value is the lexical form whatever the
 * domain, and the generator states it without restating pantry's grammar.
 *
 * @param lexical The attribute's lexical form.
 * @returns Whether every facet leaves it as it is.
 */
const normalized = (lexical: string): boolean => !/[\t\n\r]|^ | $| {2}/u.test(lexical);

/**
 * A text field's literal in the generated module.
 *
 * @param value The text.
 * @returns Its literal.
 */
const textOf = (value: string): string => JSON.stringify(value);

/**
 * A natural field's literal in the generated module.
 *
 * @param value The number.
 * @returns Its bigint literal.
 */
const naturalOf = (value: bigint): string => `${String(value)}n`;

/**
 * A row's text in the generated module: its fields in code-point order, each its literal.
 *
 * @param row Each field's literal.
 * @returns Its text.
 */
const rowText = (row: Readonly<Record<string, string>>): string =>
  `{ ${Object.entries(row)
    .toSorted(([a], [b]) => (a < b ? -1 : 1))
    .map(([key, literal]) => `${key}: ${literal}`)
    .join(", ")} }`;

/**
 * The module's text: each template's response processing subtree, its elements, its closed
 * attributes and its base values, as pantry's import reads the template's document.
 *
 * @returns The text, unformatted.
 */
const moduleText = async (): Promise<string> => {
  const program = await Effect.runPromise(
    readProgram(templatesDirectory, "qti-rptemplates").pipe(Effect.provide(NodeServices.layer)),
  );
  const literals = program.inputs.Literal;
  const bytes = new Map(
    await Promise.all(
      publishedTemplates.map(
        async (template) =>
          [template, await readFile(path.join(templatesDirectory, `${template}.xml`))] as const,
      ),
    ),
  );
  const handles: string[] = [];
  const nodes: string[] = [];
  const attributes: string[] = [];
  const texts: string[] = [];
  const digests: string[] = [];
  for (const template of publishedTemplates) {
    const file = `${template}.xml`;
    const placed = program.documents.find(({ listed }) => listed.path === file);
    must(placed !== undefined, `the template document ${file}`);

    const { rows } = placed.view;
    const root = rows.nodes.find(
      ({ kind, parent, start }) => kind === processingKind && parent === 0n && start > 0n,
    );
    must(root !== undefined, `${file}'s root ${processingKind}`);

    const within = (start: bigint): boolean => start >= root.start && start < root.end;
    const elements = rows.nodes.filter(({ kind, start }) => within(start) && !nonElement.has(kind));
    const elementOf = (start: bigint): string => `${template}.${String(start)}`;
    for (const node of elements) {
      handles.push(JSON.stringify(elementOf(node.start)));
      nodes.push(
        rowText({
          element: textOf(elementOf(node.start)),
          end: naturalOf(node.end),
          kind: textOf(node.kind),
          parent: naturalOf(node.parent),
          start: naturalOf(node.start),
          template: textOf(template),
        }),
      );
    }
    for (const attribute of rows.attributes.filter(({ start }) => within(start))) {
      must(
        normalized(attribute.lexical),
        `${file}: ${attribute.name}="${attribute.lexical}" is its value under every facet`,
      );
      attributes.push(
        rowText({
          element: textOf(elementOf(attribute.start)),
          name: textOf(attribute.name),
          start: naturalOf(attribute.start),
          template: textOf(template),
          value: textOf(attribute.lexical),
        }),
      );
    }
    for (const literal of [...literals.values()].filter(
      (row) => row.path === file && within(row.start),
    )) {
      texts.push(
        rowText({
          element: textOf(elementOf(literal.start)),
          start: naturalOf(literal.start),
          template: textOf(template),
          text: textOf(literal.text),
        }),
      );
    }
    const read = bytes.get(template);
    must(read !== undefined, `${file}'s bytes`);
    digests.push(
      ` * - \`${file}\`: SHA-256 \`${createHash("sha256").update(read).digest("base64")}\``,
    );
  }
  must(
    program.documents.every(
      ({ listed }) =>
        listed.documentType === "manifest" ||
        publishedTemplates.some((t) => listed.path === `${t}.xml`),
    ),
    "every document of the directory a published template's",
  );

  return `/**
 * The rules of the response processing templates QTI 3.0.1 publishes (spec reading 51, pantry's
 * \`publishedTemplates\`), as the SQL grader reads a program: each template's
 * \`qti-response-processing\` subtree, its elements, its closed attributes and its base values, at the
 * positions pantry's import gives them (\`readProgram\`, as it reads a package's document), from the
 * template documents in \`qti-rptemplates/\`, which this module is generated from
 * (\`tools/gen/templates.ts\`): the ledger's closed \`TemplateNode\`, \`TemplateAttribute\` and
 * \`TemplateText\` (\`#ledger/ledger.ts\`). An attribute's value is its lexical form, which every white
 * space facet leaves as it is in these documents (the generator holds that of each). The documents:
 *
${digests.join("\n")}
 */

/**
 * Each element of a template's processing subtree by its handle, \`<template>.<position>\`: the key of
 * the closed relations below, whose keys are closed ids.
 */
export const templateElements = [${handles.join(", ")}] as const;

/**
 * Each element of a template's processing subtree, by its handle, with its template and position.
 */
export const templateNodes = [${nodes.join(",\n")}] as const;

/**
 * Each closed attribute of an element of a template's processing subtree, by its element and its
 * name.
 */
export const templateAttributes = [${attributes.join(",\n")}] as const;

/**
 * Each base value of a template's processing subtree, its text, by its element.
 */
export const templateTexts = [${texts.join(",\n")}] as const;
`;
};

/**
 * `src/standard-templates.ts`, the published templates' rules as closed facts, from the template
 * documents in `qti-rptemplates/`.
 */
export const generator: Generator = {
  generate: async ({ format }) => await format(await moduleText()),
  reads: ["qti-rptemplates/"],
  target: "src/standard-templates.ts",
};
