/**
 * The export's reads of a stored attribute's name handle as the closed name it is, and of a
 * stored open attribute's class as the open class it is: the two places the export trusts a law
 * grizzle's column types do not state. They sit apart from the export's scan so that the lint
 * exception for their casts covers them alone (`oxlint.config.ts`); both go when the schema types
 * `Attribute.name` and `OpenAttribute.class` by their closed and open rosters.
 */
import type { ClosedName, OpenClass, XdmVocabulary } from "#pantry/model/xdm.ts";

/**
 * Read a stored attribute's name handle as the closed name it is.
 *
 * SAFETY: the law "AL4 open names" (`#pantry/qti/attributes.ts`) holds every `Attribute` row's
 * `name` to no open class, and the database refused every write that broke it, so a stored handle
 * is a closed name. grizzle types the field as its roster, `AttributeName`, whose handles the open
 * classes are too.
 *
 * @param name - The handle an `Attribute` row holds.
 * @returns The handle, as a closed name.
 */
export const closedNameOf = <V extends XdmVocabulary>(name: V["name"]): ClosedName<V> =>
  name as ClosedName<V>;

/**
 * Read a stored open attribute's class as the open class it is.
 *
 * SAFETY: the law "AL4 open names" (`#pantry/qti/attributes.ts`) holds every `OpenAttribute` row's
 * `class` to an open class, and the database refused every write that broke it. grizzle types the
 * field as its roster, `AttributeName`, whose handles the closed names are too.
 *
 * @param name - The handle an `OpenAttribute` row holds as its class.
 * @returns The handle, as an open class.
 */
export const openClassOf = (name: XdmVocabulary["name"]): OpenClass => name as OpenClass;
