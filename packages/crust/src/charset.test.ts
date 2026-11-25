import { assert, describe, it } from "@effect/vitest";
import { word } from "@bjornpagen/testing/dictionary";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { boolean, constant, element as oneOfThe } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Effect, Option, Result } from "effect";
import { registeredCharsets } from "#crust/charset.dictionary.ts";
import type { RegisteredCharset } from "#crust/charset.dictionary.ts";
import { classify, exportCharset } from "#crust/charset.ts";
import { encode } from "#crust/encode.ts";
import { boxHolds } from "#crust/test/box.ts";
import { caseHang } from "#crust/test/trees.ts";
import type { Attribute, Child, Element, Misc, PrologNode, XmlDocument } from "#crust/tree.ts";

/**
 * Builds an attribute in no namespace, whose name and value are the two arguments.
 */
const attribute = (qname: string, value: string): Attribute => ({
  local: qname,
  namespace: "",
  prefix: "",
  qname,
  references: [],
  value,
});

/**
 * Builds an element in no namespace with the given attributes and children.
 */
const element = (
  qname: string,
  attributes: readonly Attribute[],
  children: readonly Child[],
): Element => ({
  attributes,
  children,
  kind: "element",
  local: qname,
  namespace: "",
  prefix: "",
  qname,
});

/**
 * Builds a document read under `charset` around `root`, with the given prolog and epilog.
 */
const document = (
  charset: string,
  root: Element,
  around: { readonly epilog?: readonly Misc[]; readonly prolog?: readonly PrologNode[] },
): XmlDocument => ({
  charset,
  declaration: Option.none(),
  epilog: around.epilog ?? [],
  prolog: around.prolog ?? [],
  root,
});

/**
 * The euro sign, a code point above U+00FF, so above both single-byte thresholds.
 */
const euro = "€";

/**
 * Builds a comment node holding `text`.
 */
const comment = (text: string): Misc => ({ kind: "comment", text });

/**
 * A name of the registered-names box: a charset of the registry and one of its names, each letter
 * in either case.
 */
interface SpelledName {
  readonly charset: RegisteredCharset;
  readonly spelling: string;
}

/**
 * Draw a name of the registered-names box: a charset of {@link registeredCharsets}, one of its
 * names, and each of the name's letters upper or lower case, the others as written.
 */
const spelledName: Gen<SpelledName> = (source) => {
  const charset = source.draw(word(registeredCharsets));
  const name = source.draw(oneOfThe(charset.names));
  const spelling = Array.from(name, (character) => {
    const upper = character.toUpperCase();
    const lower = character.toLowerCase();

    if (upper === lower) {
      return character;
    }

    return source.draw(boolean) ? upper : lower;
  }).join("");

  return { charset, spelling };
};

/**
 * How many spellings {@link spelledName} draws: 2 to the power of a name's letters, summed over
 * the 27 names, US-ASCII's 10 giving 464, ISO-8859-1's 9 giving 1,126, UTF-8's and UTF-16's 2 each
 * 40, and UTF-16BE's and UTF-16LE's 2 each 160.
 */
const SPELLINGS = 464 + 1126 + 40 + 160 + 160 + 40;

/**
 * How a processor reads a registered name: as the charset it names, or as no charset it knows.
 */
type NameReading = "registered" | "unknown";

/**
 * Whether a `TextDecoder`, the WHATWG Encoding Standard's table that a `decode-only` label falls
 * to, knows a label.
 *
 * @param label - The label.
 * @returns Whether it decodes under some encoding.
 */
const knownToTextDecoder = (label: string): boolean =>
  Result.isSuccess(Result.try(() => new TextDecoder(label)));

/**
 * One character of each region the charsets' single-byte ceilings bound: below U+0080, U+0080 to
 * U+00FF, above U+00FF in the Basic Multilingual Plane, and beyond it. XML 1.0 production [4]
 * lets a name start with each, so each may stand in every field.
 */
const REGION_CHARACTERS = ["a", "é", "€", "\u{1F600}"] as const;

/**
 * The fields of crust's tree that hold text (`#crust/tree.ts`): a doctype's text, a comment's
 * text, an instruction's target and data, an element's and an attribute's name, an attribute's
 * value and the name of a reference it records, an entity reference's name, and a text run, plain
 * or CDATA.
 */
const TREE_FIELDS = [
  "doctype text",
  "comment text",
  "instruction target",
  "instruction data",
  "element name",
  "attribute name",
  "attribute value",
  "attribute reference name",
  "entity reference name",
  "text run",
  "CDATA run",
] as const;

/**
 * A {@link TREE_FIELDS} member.
 */
type TreeField = (typeof TREE_FIELDS)[number];

/**
 * Where a field's node stands: a comment or an instruction in the prolog, the root's content or
 * the epilog; an element as the root or its child; the doctype in the prolog; every other field
 * on the root.
 */
type Holder = "prolog" | "content" | "epilog" | "root" | "child";

/**
 * The places a comment or an instruction stands in.
 */
const MISC_HOLDERS = ["prolog", "content", "epilog"] as const;

/**
 * The places an element stands in.
 */
const ELEMENT_HOLDERS = ["root", "child"] as const;

/**
 * Draw where a field's node stands ({@link Holder}).
 *
 * @param field - The field.
 * @returns The generator of its holders.
 */
const holderOf = (field: TreeField): Gen<Holder> => {
  switch (field) {
    case "doctype text": {
      return constant("prolog");
    }
    case "comment text":
    case "instruction target":
    case "instruction data": {
      return oneOfThe(MISC_HOLDERS);
    }
    case "element name": {
      return oneOfThe(ELEMENT_HOLDERS);
    }
    case "attribute name":
    case "attribute value":
    case "attribute reference name":
    case "entity reference name":
    case "text run":
    case "CDATA run": {
      return constant("root");
    }
  }
};

/**
 * A document of the export-places box: a charset of the registry by its label, a character, the
 * field it stands in and where.
 */
interface Placement {
  readonly character: string;
  readonly charset: RegisteredCharset;
  readonly field: TreeField;
  readonly holder: Holder;
}

/**
 * Draw a document of the export-places box: a charset of {@link registeredCharsets}, a character
 * of {@link REGION_CHARACTERS}, a field of {@link TREE_FIELDS} and its holder.
 */
const placement: Gen<Placement> = (source) => {
  const charset = source.draw(word(registeredCharsets));
  const character = source.draw(oneOfThe(REGION_CHARACTERS));
  const field = source.draw(oneOfThe(TREE_FIELDS));

  return { character, charset, field, holder: source.draw(holderOf(field)) };
};

/**
 * How many documents {@link placement} draws: 6 charsets by 4 characters by 18 places, a doctype,
 * 3 holders of each of a comment's text and an instruction's target and data, 2 of an element's
 * name, and 6 fields on the root.
 */
const PLACEMENTS = 6 * 4 * (1 + 3 * 3 + 2 + 6);

/**
 * What a document of the export-places box reaches: its label kept with every character as itself,
 * kept with a character above the ceiling written as a reference, or unwritable.
 */
type PlacementSituation = "kept" | "unwritable" | "written as a reference";

/**
 * Build a document read under `charset` whose one text field `field`, standing where `holder`
 * says, holds `character`: the field's own text where a field may hold any, and else a name led by
 * a letter.
 *
 * @param charset - The label the document was read under.
 * @param field - The field.
 * @param holder - Where its node stands.
 * @param character - The character.
 * @returns The document.
 */
const holding = (
  charset: string,
  field: TreeField,
  holder: Holder,
  character: string,
): XmlDocument => {
  const misc = (made: Misc): XmlDocument => {
    if (holder === "prolog") {
      return document(charset, element("a", [], []), { prolog: [made] });
    }

    return holder === "epilog"
      ? document(charset, element("a", [], []), { epilog: [made] })
      : document(charset, element("a", [], [made]), {});
  };

  switch (field) {
    case "doctype text": {
      return document(charset, element("a", [], []), {
        prolog: [{ kind: "doctype", text: `<!DOCTYPE a [<!-- ${character} -->]>` }],
      });
    }
    case "comment text": {
      return misc(comment(character));
    }
    case "instruction target": {
      return misc({ data: "", kind: "pi", target: `p${character}` });
    }
    case "instruction data": {
      return misc({ data: character, kind: "pi", target: "p" });
    }
    case "element name": {
      return holder === "root"
        ? document(charset, element(`a${character}`, [], []), {})
        : document(charset, element("a", [], [element(`b${character}`, [], [])]), {});
    }
    case "attribute name": {
      return document(charset, element("a", [attribute(`c${character}`, "")], []), {});
    }
    case "attribute value": {
      return document(charset, element("a", [attribute("c", character)], []), {});
    }
    case "attribute reference name": {
      const reference = { name: `e${character}`, offset: 0 };

      return document(
        charset,
        element("a", [{ ...attribute("c", `&${reference.name};`), references: [reference] }], []),
        {},
      );
    }
    case "entity reference name": {
      return document(
        charset,
        element("a", [], [{ kind: "entityRef", name: `e${character}` }]),
        {},
      );
    }
    case "text run": {
      return document(
        charset,
        element("a", [], [{ cdata: false, kind: "text", value: character }]),
        {},
      );
    }
    case "CDATA run": {
      return document(
        charset,
        element("a", [], [{ cdata: true, kind: "text", value: character }]),
        {},
      );
    }
  }
};

describe("classify", () => {
  it.effect(
    `interprets every name IANA registers for a charset crust writes, in either case of each letter, as that charset or as no charset it knows: ${String(SPELLINGS)} spellings`,
    (ctx) =>
      Effect.andThen(
        boxHolds(spelledName, SPELLINGS),
        searched(
          ctx,
          exhaust(
            {
              box: "every Name and Alias IANA's Character Sets registry gives US-ASCII, ISO-8859-1, UTF-8, UTF-16BE, UTF-16LE and UTF-16, each letter in either case",
              caseHang,
              coverage: requiredInSpace<NameReading>(["registered", "unknown"]),
              generator: spelledName,
              literal: ({ charset, spelling }) =>
                `{ charset: ${JSON.stringify(charset.label)}, spelling: ${JSON.stringify(spelling)} }`,
              oracle: {
                kind: "specification",
                name: "XML 1.0 section 4.3.3: a processor matches an encoding name in any case, and interprets an IANA-registered name as the encoding IANA registers for it or treats it as unknown; unknown is a label classify leaves decode-only that no TextDecoder knows, so the reader refuses it",
              },
              suite: "crust/charset/registered-names",
            },
            ({ charset, spelling }, c) =>
              Effect.sync(() => {
                const classified = classify(spelling);

                if (classified === charset.class) {
                  c.note("registered");
                  return;
                }

                assert.strictEqual(classified, "decode-only", spelling);
                assert.isFalse(knownToTextDecoder(spelling), `${spelling} is decoded as another`);
                c.note("unknown");
              }),
          ),
        ),
      ),
  );

  it.effect("gives UTF-8 and each UTF-16 label its own class", () =>
    Effect.sync(() => {
      assert.strictEqual(classify("utf-8"), "utf8");
      assert.strictEqual(classify("UTF-16"), "utf16");
      assert.strictEqual(classify("utf-16le"), "utf16le");
      assert.strictEqual(classify("UTF-16BE"), "utf16be");
    }),
  );
});

describe("exportCharset", () => {
  it.effect("returns the label as spelled, not its canonical name", () =>
    Effect.sync(() => {
      const doc = document("latin1", element("item", [], []), {});

      assert.strictEqual(exportCharset("latin1", doc), "latin1");
    }),
  );

  it.effect("leaves a UTF-8 or UTF-16 document alone whatever characters it holds", () =>
    Effect.sync(() => {
      const doc = document("UTF-8", element("item", [], []), { prolog: [comment(euro)] });

      assert.strictEqual(exportCharset("UTF-8", doc), "UTF-8");
      assert.strictEqual(exportCharset("UTF-16", doc), "UTF-16");
    }),
  );

  it.effect("returns UTF-8 for a windows-1252 document", () =>
    Effect.sync(() => {
      const doc = document("windows-1252", element("item", [], []), {});

      assert.strictEqual(exportCharset("windows-1252", doc), "UTF-8");
    }),
  );

  it.effect("returns UTF-8 for an ISO-8859-1 document with U+20AC inside a comment", () =>
    Effect.sync(() => {
      const doc = document("ISO-8859-1", element("item", [], []), {
        prolog: [comment(` ${euro} `)],
      });

      assert.strictEqual(exportCharset("ISO-8859-1", doc), "UTF-8");
    }),
  );

  it.effect(
    `exports under the read label exactly when every character no reference can write is within the charset's single bytes, for every charset crust writes, a character of each region its ceilings bound and every text field of the tree: ${String(PLACEMENTS)} documents`,
    (ctx) =>
      Effect.andThen(
        boxHolds(placement, PLACEMENTS),
        searched(
          ctx,
          exhaust(
            {
              box: "US-ASCII, ISO-8859-1, UTF-8, UTF-16BE, UTF-16LE and UTF-16, by the label IANA prefers, each with a, é, € or U+1F600 in one text field of the tree: a doctype, a comment's text or an instruction's target or data in the prolog, the root's content or the epilog, the root's or a child's name, an attribute's name, value or recorded reference, an entity reference, a text run or a CDATA run",
              caseHang,
              coverage: requiredInSpace<PlacementSituation>([
                "kept",
                "unwritable",
                "written as a reference",
              ]),
              generator: placement,
              literal: ({ character, charset, field, holder }) =>
                `{ character: ${JSON.stringify(character)}, charset: ${JSON.stringify(charset.label)}, field: ${JSON.stringify(field)}, holder: ${JSON.stringify(holder)} }`,
              oracle: {
                kind: "specification",
                name: "XML 1.0 section 4.1: a character reference stands only in content and in an attribute value (productions [43] and [10]), and a CDATA run's characters are text a writer may end its section to write, so a character above the charset's single-byte ceiling (ANSI X3.4's 0x7F, ISO/IEC 8859-1's 0xFF, none for a Unicode encoding form) is unwritable in every other field; then the export is UTF-8 and the encoder refuses the label, naming the character and the ceiling, and else it keeps the label and encodes",
              },
              suite: "crust/charset/export-places",
            },
            ({ character, charset, field, holder }, c) =>
              Effect.gen(function* exportsUnderTheLabel() {
                const doc = holding(charset.label, field, holder, character);
                const name = `${charset.label} ${field} ${holder} ${JSON.stringify(character)}`;
                const codePoint = character.codePointAt(0) ?? 0;
                const reachable =
                  field === "text run" || field === "CDATA run" || field === "attribute value";
                const above = Option.exists(charset.ceiling, (ceiling) => codePoint > ceiling);

                if (above && !reachable) {
                  c.note("unwritable");
                  assert.strictEqual(exportCharset(charset.label, doc), "UTF-8", name);

                  const refused = yield* Effect.flip(encode(doc, charset.label));

                  assert.deepStrictEqual(
                    refused._tag === "EncodeError"
                      ? Option.some([refused.codePoint, refused.threshold])
                      : Option.none(),
                    Option.map(charset.ceiling, (ceiling) => [codePoint, ceiling]),
                    name,
                  );
                  return;
                }

                c.note(above ? "written as a reference" : "kept");
                assert.strictEqual(exportCharset(charset.label, doc), charset.label, name);
                yield* encode(doc, charset.label);
              }),
          ),
        ),
      ),
  );

  it.effect("does not inspect text runs or attribute values, which a reference can carry", () =>
    Effect.sync(() => {
      const doc = document(
        "ISO-8859-1",
        element(
          "a",
          [attribute("alt", euro)],
          [
            { cdata: true, kind: "text", value: euro },
            { kind: "entityRef", name: "e" },
          ],
        ),
        {},
      );

      assert.strictEqual(exportCharset("ISO-8859-1", doc), "ISO-8859-1");
    }),
  );

  it.effect("holds US-ASCII to 0x7F and ISO-8859-1 to 0xFF", () =>
    Effect.sync(() => {
      const accented = document("US-ASCII", element("a", [], []), { prolog: [comment("café")] });
      const astral = document("ISO-8859-1", element("a", [], []), {
        prolog: [comment("\u{1F600}")],
      });

      assert.strictEqual(exportCharset("US-ASCII", accented), "UTF-8");
      assert.strictEqual(exportCharset("ISO-8859-1", accented), "ISO-8859-1");
      assert.strictEqual(exportCharset("ISO-8859-1", astral), "UTF-8");

      const reference = document(
        "US-ASCII",
        element("a", [], [{ kind: "entityRef", name: "é" }]),
        {},
      );

      assert.strictEqual(exportCharset("US-ASCII", reference), "UTF-8");
      assert.strictEqual(exportCharset("ISO-8859-1", reference), "ISO-8859-1");
    }),
  );
});
