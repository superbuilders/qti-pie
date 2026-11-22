/**
 * What the runner (`#tools/gen/main.ts`) hands a generator: qti-pie's formatter and linter, each
 * one pass over a stage file where qti-pie's configs apply as they do to the target itself.
 */
export interface GeneratorTools {
  /**
   * One pass of qti-pie's oxfmt (`.oxfmtrc.json`) over the text, as the target's file.
   */
  readonly format: (text: string) => Promise<string>;
  /**
   * One pass of qti-pie's oxlint (`oxlint.config.ts`) over the text, as the target's file, with
   * its fixes and suggestions applied: what it only reports is left as it is.
   */
  readonly lintFix: (text: string) => Promise<string>;
}

/**
 * A generated file of the ledger package: its path from the package's directory, the files its
 * generator reads, and the generator of its whole text, which the runner writes there or compares
 * with what is there.
 *
 * The runner orders the generators by `reads`: a generator that reads another's target runs once
 * that target is written in the same run, and the rest run at once. A generator reads what it
 * depends on when `generate` runs, through the file system or a dynamic import inside it, never
 * through a static import of a generated file, which loads before the first generator runs.
 */
export interface Generator {
  readonly generate: (tools: GeneratorTools) => Promise<string>;
  /**
   * The files the generator reads, each a path from the ledger package's directory as `target`
   * is; a path that ends in "/" names a directory and every file under it.
   */
  readonly reads: readonly string[];
  readonly target: string;
}
