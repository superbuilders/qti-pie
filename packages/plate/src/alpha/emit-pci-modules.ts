/**
 * Emit the module file of each of Alpha's PCI modules: `pci-modules/<id>.js`, its typed source
 * `pci-modules/<id>.ts` with the types stripped by the machine's Node (`stripTypeScriptTypes`,
 * strip mode), as `#plate/alpha/pci-modules.ts` says why. It prints each file's SHA-256 as its pin
 * in `#plate/alpha/pci-modules.test.ts` is written, so a file whose bytes changed has its new pin
 * to hand.
 *
 * Run from plate's directory: `pnpm run emit:alpha-pci-modules`.
 *
 * @module
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import path from "node:path";

/**
 * Each module source, by its path in `alpha/`: the entries of `alpha/` in `pci-modules/` that are
 * TypeScript, so a folder that holds no module yet emits nothing.
 */
const sources = readdirSync(import.meta.dirname, { recursive: true })
  .map(String)
  .filter((entry) => path.dirname(entry) === "pci-modules" && path.extname(entry) === ".ts")
  .toSorted();

for (const source of sources) {
  const script = stripTypeScriptTypes(
    readFileSync(path.join(import.meta.dirname, source), "utf-8"),
  );

  writeFileSync(path.join(import.meta.dirname, source.replace(/\.ts$/u, ".js")), script);
  process.stdout.write(
    `${path.basename(source, ".ts")}: sha256-${createHash("sha256").update(script).digest("base64")}\n`,
  );
}
