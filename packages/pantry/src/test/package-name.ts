/**
 * The name a test stores a package under (`readPackage`'s `name`, `PackageName` of
 * `#pantry/qti/limits.ts`): its directory's or zip's base name, so two fixtures a test reads are
 * two packages, whatever manifest identifier each writes, and the same fixture read twice is one.
 */
import { regex } from "arkregex";
import { nameMaxBytes } from "#pantry/qti/limits.ts";

/**
 * Name a package by the base name of the path it is read from: each character outside the ASCII
 * letters, digits, `.`, `_` and `-` an NCName may hold written as `_`, an `_` before a first
 * character no NCName starts with, and its first {@link nameMaxBytes} characters kept, each one
 * byte, so it is always a name a package can be stored under.
 *
 * @param path - The package directory or `.zip` file.
 * @returns The name.
 */
export const nameOf = (path: string): string => {
  const base = path.replace(regex("/+$", "u"), "").split("/").at(-1) ?? "";
  const written = base.replaceAll(regex("[^A-Za-z0-9._-]", "gu"), "_");

  return (regex("^[A-Za-z_]", "u").exec(written) === null ? `_${written}` : written).slice(
    0,
    nameMaxBytes,
  );
};
