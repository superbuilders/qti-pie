/**
 * The name a test stores a package under (`readPackage`'s `name`, `PackageName` of
 * `#pantry/qti/limits.ts`): its directory's or zip's base name, so two fixtures a test reads are
 * two packages, whatever manifest identifier each writes, and the same fixture read twice is one.
 */
/**
 * Name a package by the base name of the path it is read from: each character outside the ASCII
 * letters, digits, `.`, `_` and `-` an NCName may hold written as `_`, an `_` before a first
 * character no NCName starts with, so it is always a name a package can be stored under, an NCName
 * of any length.
 *
 * @param path - The package directory or `.zip` file.
 * @returns The name.
 */
export const nameOf = (path: string): string => {
  const base = path.replace(/\/+$/u, "").split("/").at(-1) ?? "";
  const written = base.replaceAll(/[^A-Za-z0-9._-]/gu, "_");

  return /^[A-Za-z_]/u.test(written) ? written : `_${written}`;
};
