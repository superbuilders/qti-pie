/**
 * Admission: a document judged alone by the database, as a one-document package. The package holds
 * the document at its own path, every file it names as pantry's reader resolves its references
 * (`readPackage`'s `referenced`), copied from the document's own package where that holds it and a
 * placeholder of the file's kind where it does not, and the manifest that lists them; so a document
 * is judged by the laws over it, never refused for a test or a document it sits beside. The
 * admission run (`scripts/admit.ts`) and qti-pie's specimen database suite admit documents so.
 *
 * A placeholder knows nothing of the file it stands for but its kind: an XML file a document names
 * and its package lacks is a stimulus. So a document whose `xi:include` names a fragment is
 * admitted with the fragment beside it where its href resolves, as pantry's `valid/response.xml`
 * names `shared-rules.xml`, kept beside it in `valid/`.
 *
 * @module
 */
import { availableParallelism } from "node:os";
import { Effect, FileSystem, Option, Path, Schema, Semaphore } from "effect";
import { readXml } from "@qti-pie/crust/read.ts";
import { vocabularyFacets } from "#pantry/grammar/facets.ts";
import { fragmentType } from "#pantry/grammar/include.ts";
import { importPackage } from "#pantry/import/package.ts";
import { readPackage } from "#pantry/import/read.ts";

/**
 * The QTI 3.0.1 ASI namespace, the namespace of every root an admission package lists.
 */
const asi = "http://www.imsglobal.org/xsd/imsqtiasi_v3p0";

/**
 * The roots plate opens, an item, a section and a stimulus: the documents an admission run admits.
 * A test is none (plate leaves one unchecked, and pantry stores none).
 */
export const openedRoots: ReadonlySet<string> = new Set([
  "qti-assessment-item",
  "qti-assessment-section",
  "qti-assessment-stimulus",
]);

/**
 * The resource type the content-packaging profile lists a document of each ASI root under: the ASI
 * vocabulary's package roots (`#pantry/grammar/facets.ts`), each root's first. A root the schema
 * types more than one way (a `qti-response-processing`, both `imsqti_rptemplate_xmlv3p0` and
 * `imsqti_resprocessing_xmlv3p0`) is admitted under either, so the first is taken.
 */
const rootTypes: ReadonlyMap<string, string> = new Map(
  vocabularyFacets.asi.package.roots.toReversed().map(({ root, type }) => [root, type]),
);

/**
 * The root element of a document in the ASI namespace, as crust's reader reads it.
 *
 * @param bytes The document's bytes.
 * @returns Its root's local name; none for a document that does not read, or whose root is in
 *   another namespace.
 */
export const asiRootOf = (bytes: Uint8Array): Effect.Effect<Option.Option<string>> =>
  Effect.match(readXml(bytes), {
    onFailure: () => Option.none(),
    onSuccess: ({ root }) => (root.namespace === asi ? Option.some(root.local) : Option.none()),
  });

/**
 * The resource type a document is listed under, by its ASI root: its package root's type, or, for
 * any other ASI root, an included fragment's (`fragmentType`).
 *
 * @param bytes The document's bytes.
 * @returns Its resource type; none for a document of another namespace, which is listed as a file.
 */
export const resourceTypeOf = (bytes: Uint8Array): Effect.Effect<Option.Option<string>> =>
  Effect.map(
    asiRootOf(bytes),
    Option.map((local) => rootTypes.get(local) ?? fragmentType),
  );

/**
 * Encode a text as UTF-8.
 *
 * @param text The text.
 * @returns Its bytes.
 */
const encode = (text: string): Uint8Array => new TextEncoder().encode(text);

/**
 * A manifest's listing of one file of a resource.
 *
 * @param file The file's path.
 * @returns The `file` element.
 */
const fileOf = (file: string): string => `<file href="${file}"/>`;

/**
 * A one-pixel PNG, the placeholder of a picture no package holds.
 */
const png = Uint8Array.from(
  Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAwS2OUAAAAABJRU5ErkJggg==",
    "base64",
  ),
);

/**
 * The placeholder of a file no package holds, by its extension: a picture of its kind, an empty
 * SVG, a stimulus, and one line of text for any other.
 *
 * @param file The file's path.
 * @returns The placeholder's bytes.
 */
const placeholderOf = (file: string): Uint8Array => {
  switch (file.slice(file.lastIndexOf(".") + 1).toLowerCase()) {
    case "png":
    case "gif":
    case "jpg":
    case "jpeg": {
      return png;
    }
    case "svg": {
      return encode('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>');
    }
    case "xml": {
      return encode(
        `<qti-assessment-stimulus xmlns="${asi}" identifier="stimulus" title="stimulus"><qti-stimulus-body><p>stimulus</p></qti-stimulus-body></qti-assessment-stimulus>`,
      );
    }
    default: {
      return encode("\n");
    }
  }
};

/**
 * One file of a package being written: its path, its bytes, and the resource type it is listed
 * under where it is a document of its own.
 */
interface Entry {
  readonly bytes: Uint8Array;
  readonly file: string;
  readonly type: Option.Option<string>;
}

/**
 * Write a package's entries and the manifest that lists them: each of its documents as a resource
 * of its own, the first carrying every plain file, each later one a dependency of the first.
 *
 * @param out The package's folder.
 * @param documents The package's documents, each a resource of its own, in order.
 * @param plain The package's plain files, which the first document's resource lists.
 */
const writeEntries = Effect.fn("admission.entries")(function* writeEntries(
  out: string,
  documents: readonly [Entry, ...Entry[]],
  plain: readonly Entry[],
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const [main, ...rest] = documents;
  const resources = [
    `<resource identifier="R0" type="${Option.getOrElse(main.type, () => "imsqti_item_xmlv3p0")}" href="${main.file}">${[main, ...plain].map(({ file }) => fileOf(file)).join("")}${rest.map((_, index) => `<dependency identifierref="R${String(index + 1)}"/>`).join("")}</resource>`,
    ...rest.map(
      ({ file, type }, index) =>
        `<resource identifier="R${String(index + 1)}" type="${Option.getOrElse(type, () => "")}" href="${file}">${fileOf(file)}</resource>`,
    ),
  ];
  const manifest = `<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="M">
  <metadata><schema>QTI Package</schema><schemaversion>3.0.1</schemaversion></metadata>
  <organizations/>
  <resources>${resources.join("")}</resources>
</manifest>
`;

  yield* fs.remove(out, { force: true, recursive: true });
  yield* Effect.forEach(
    [{ bytes: encode(manifest), file: "imsmanifest.xml" }, ...documents, ...plain],
    ({ bytes, file }) =>
      Effect.andThen(
        fs.makeDirectory(path.dirname(path.join(out, file)), { recursive: true }),
        fs.writeFile(path.join(out, file), bytes),
      ),
    { discard: true },
  );
});

/**
 * One document to admit alone: its path in its package, its bytes, and the folder its package's
 * files are read from, none where the files it names are placeholders.
 */
export interface AdmissionDocument {
  readonly at: string;
  readonly bytes: Uint8Array;
  readonly folder: Option.Option<string>;
}

/**
 * Write a package of several documents, each a resource of its own, as an admission package is
 * written ({@link writeAdmissionPackage}): every document at its own path, then, round by round,
 * every file the package's documents name as pantry's reader resolves their references
 * (`readPackage`'s `referenced`), each copied from its document's own package where that holds it
 * and a placeholder of its kind where it does not, until the documents name no file the package
 * lacks. Specimen's floor package, the floor's cases the lab plays through the database, is
 * written so.
 *
 * @param out The folder the package is written to.
 * @param candidates The documents, each at a path of its own.
 */
export const writePackageOf = Effect.fn("admission.packageOf")(function* writePackageOf(
  out: string,
  candidates: readonly [AdmissionDocument, ...AdmissionDocument[]],
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const [first, ...others] = yield* Effect.forEach(candidates, (candidate) =>
    Effect.map(resourceTypeOf(candidate.bytes), (type): Entry => ({
      bytes: candidate.bytes,
      file: candidate.at,
      type,
    })),
  );
  const folders = candidates.flatMap(({ folder }) => Option.toArray(folder));
  const entryOf = Effect.fnUntraced(function* entryOf(file: string) {
    let held = Option.none<Uint8Array>();
    for (const folder of folders) {
      if (Option.isNone(held)) {
        held = yield* Effect.option(fs.readFile(path.join(folder, file)));
      }
    }
    const bytes = Option.getOrElse(held, () => placeholderOf(file));

    return { bytes, file, type: yield* resourceTypeOf(bytes) } satisfies Entry;
  });
  const documents: Entry[] = [...others];
  const plain: Entry[] = [];
  for (let more = true; more;) {
    yield* writeEntries(out, [first, ...documents], plain);

    const listed = new Set([first, ...documents, ...plain].map(({ file }) => file));
    const read = yield* Effect.option(readPackage(out, "admission"));
    const missing = Option.match(read, {
      onNone: (): readonly string[] => [],
      onSome: ({ referenced }): readonly string[] =>
        [...referenced].filter((file) => !listed.has(file)),
    });
    const added = yield* Effect.forEach(missing, (file) => entryOf(file));

    more = added.length > 0;
    for (const entry of added) {
      (Option.isSome(entry.type) ? documents : plain).push(entry);
    }
  }
});

/**
 * Write one document's admission package: its document, then, round by round, every file the
 * package's documents name as pantry's reader resolves their references (`readPackage`'s
 * `referenced`), each copied from the candidate's own package where it holds the file and a
 * placeholder of its kind where it does not, until the documents name no file the package lacks
 * ({@link writePackageOf} of the one document).
 *
 * @param out The folder the package is written to.
 * @param candidate The document.
 */
export const writeAdmissionPackage = (out: string, candidate: AdmissionDocument) =>
  writePackageOf(out, [candidate]);

/**
 * The database's verdict on one admission package: admitted, refused with the rules and the detail
 * its refusal names, or not judged, the import having failed otherwise (a package it could not
 * read, a call that failed), with the failure's message.
 */
export const AdmissionVerdict = Schema.Union([
  Schema.TaggedStruct("Admitted", { name: Schema.String }),
  Schema.TaggedStruct("Refused", {
    detail: Schema.String,
    name: Schema.String,
    rules: Schema.Array(Schema.String),
  }),
  Schema.TaggedStruct("Unjudged", { failure: Schema.String, name: Schema.String }),
]);

/**
 * Import one admission package into the database under a name, once, and give the verdict that
 * import met: `Unjudged` where it failed otherwise than by the database's refusal.
 *
 * @param workload The author role's workload (`authorDb`'s).
 * @param folder The package's folder.
 * @param name The name it is imported under.
 * @returns The verdict; it never fails.
 */
const importOnce = Effect.fn("admission.importOnce")(function* importOnce(
  workload: Parameters<typeof importPackage>[0],
  folder: string,
  name: string,
) {
  return yield* readPackage(folder, name).pipe(
    Effect.flatMap((pkg) => importPackage(workload, pkg)),
    Effect.as<typeof AdmissionVerdict.Type>({ _tag: "Admitted", name }),
    Effect.catchTag("ImportRefused", (refused) =>
      Effect.succeed<typeof AdmissionVerdict.Type>({
        _tag: "Refused",
        detail: refused.detail,
        name,
        rules: refused.rules,
      }),
    ),
    Effect.catch((error) =>
      Effect.succeed<typeof AdmissionVerdict.Type>({
        _tag: "Unjudged",
        failure: error.message,
        name,
      }),
    ),
  );
});

/**
 * The writes this process's admissions hold: one each, as many at once as the machine runs, and
 * all of them for a write judged alone.
 */
const width = availableParallelism();

/**
 * The lanes every admission of this process shares, so a write judged alone waits until no other
 * admission writes.
 */
const lanes = Semaphore.makeUnsafe(width);

/**
 * The turnstile every admission passes before it queues for a lane, and a write judged alone holds
 * for as long as it waits and writes. A semaphore lets a smaller take overtake a larger one waiting
 * (Effect's `Semaphore.take`), so without it the writes that keep arriving would hold the lanes
 * from a write judged alone until they stop; with it, that write waits only for the writes already
 * past the turnstile.
 */
const turnstile = Semaphore.makeUnsafe(1);

/**
 * Give the database's verdict on one admission package: its import at full width beside every other
 * admission of the process, and, where that import met a concurrent one (a serialization failure,
 * the lock table full) and so was not judged, its import again alone. The verdict is the package's
 * own, never its neighbours': `Admitted`, `Refused` by the database's laws, or `Unjudged` only for
 * a failure that recurs alone. The admission run and qti-pie's specimen database suite both judge
 * through it.
 *
 * @param workload The author role's workload (`authorDb`'s).
 * @param folder The package's folder.
 * @param name The name it is imported under.
 * @returns The verdict; it never fails.
 */
export const admitPackage = Effect.fn("admission.admit")(function* admitPackage(
  workload: Parameters<typeof importPackage>[0],
  folder: string,
  name: string,
) {
  yield* Semaphore.withPermit(turnstile)(Effect.void);

  const first = yield* Semaphore.withPermits(lanes, 1)(importOnce(workload, folder, name));

  return first._tag === "Unjudged"
    ? yield* Semaphore.withPermit(turnstile)(
        Semaphore.withPermits(lanes, width)(importOnce(workload, folder, name)),
      )
    : first;
});
