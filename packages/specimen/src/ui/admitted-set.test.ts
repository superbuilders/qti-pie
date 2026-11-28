/**
 * The admitted set holds every document specimen's free suites can open, checked from the
 * documents alone: no database, no browser, in a second.
 *
 * A free suite opens a document only by its digest in plate's admitted set
 * (`@qti-pie/plate/test/admitted`), so a change to a document's bytes that the admission run has
 * not judged fails that suite, and before this test only the browser suites saw it, after their
 * whole run. The documents the suites can open are enumerable, so the set is held to them here:
 *
 * - Every item of the floor (`#specimen/floor.ts`), all of them, since a run's draws reach some and
 *   another seed's reach others;
 * - Every synthetic item of an Alpha module's fixture, `fixtures/alpha/<module>/<name>.xml`, which
 *   the hosted PCI suites open (`#specimen/alpha/hosted-pci.ts`,
 *   `#specimen/alpha/build-with-blocks.ts`);
 * - The read-aloud suites' synthetic documents (`#specimen/ui/read-aloud-items.ts`).
 *
 * A document missing from the set names what to do: run the admission (pantry's
 * `scripts/admit.ts`) over it.
 *
 * @module
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { isAdmitted } from "@qti-pie/plate/test/admitted";
import { describe, expect, it } from "vitest";
import { floorItems } from "#specimen/floor.ts";
import { graph, line, media, passage, said } from "#specimen/ui/read-aloud-items.ts";

/**
 * The folder of the Alpha modules' fixtures.
 */
const alphaFixtures = path.join(import.meta.dirname, "..", "..", "fixtures", "alpha");

/**
 * Every synthetic item of an Alpha module's fixture: each `<name>.xml` directly in a module's
 * folder, the files the hosted suites read.
 *
 * @returns Each item's place and bytes.
 */
const alphaItems = (): readonly { readonly place: string; readonly bytes: Uint8Array }[] =>
  readdirSync(alphaFixtures, { withFileTypes: true })
    .filter((module) => module.isDirectory())
    .flatMap((module) =>
      readdirSync(path.join(alphaFixtures, module.name), { withFileTypes: true })
        .filter((file) => file.isFile() && file.name.endsWith(".xml"))
        .map((file) => {
          const place = path.join(alphaFixtures, module.name, file.name);

          return { bytes: readFileSync(place), place };
        }),
    );

/**
 * Every document the free suites can open, by where it comes from.
 *
 * @returns Each document's place and bytes.
 */
const openable = (): readonly { readonly place: string; readonly bytes: Uint8Array }[] => {
  const encoder = new TextEncoder();

  return [
    ...floorItems.map((item) => ({
      bytes: encoder.encode(item.xml),
      place: `specimen floor ${item.path}`,
    })),
    ...alphaItems(),
    ...[said, line, media, passage, graph].map((document) => ({
      bytes: encoder.encode(document.xml),
      place: `read-aloud ${document.location}`,
    })),
  ];
};

describe("the admitted set", () => {
  it("holds every document specimen's free suites can open: the whole floor, the Alpha fixtures and the read-aloud documents", () => {
    const documents = openable();
    const missing = documents
      .filter((document) => !isAdmitted(document.bytes))
      .map((document) => document.place);

    expect(documents.length).toBeGreaterThan(floorItems.length);
    expect(
      missing,
      "not in plate's admitted set: run the admission over them (packages/pantry/scripts/admit.ts, as its header says)",
    ).toStrictEqual([]);
  });
});
