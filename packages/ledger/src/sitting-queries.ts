/**
 * The sitting queries of the finish (`#ledger/finish.ts`) and of a run of a test's outcome
 * processing (`#ledger/test-run-call.ts`, `#ledger/test-run-writes.ts`): each over the call's
 * subject sittings, the `sittings` relation parameter ({@link sittingHeading}), which a rule that
 * reads one passes on to it as its own and a program binds once, to its caller's sittings
 * (`ChangeSet.bind`): an application's own query, or the sitting of the item session a call names
 * ({@link sittingOfSessionOf}).
 */
import { pg, query, uuid, v } from "@bjornpagen/grizzle";
import { EntryPath, PackageName } from "@qti-pie/pantry/qti/limits.ts";
import { LearnerId } from "#ledger/keys.ts";
import type { DeliveryLevel } from "#ledger/sitting-programs.ts";

/**
 * The ledger's subject sittings, the `sittings` relation parameter every sitting builder reads: a
 * sitting by its key, the learner and the stage that holds it (TestSession's for a test,
 * ItemSession's for an item's stage). Each application binds it once per program to its own query;
 * a write that names an item session binds it to {@link sittingOfSessionOf}.
 */
export const sittingHeading = { child: LearnerId, stage: pg.bigint } as const;

/**
 * The take's sittings, the `taken` relation parameter its writes read
 * (`#ledger/sitting-programs.ts` take): a sitting an application's decision made, by its key
 * ({@link sittingHeading}), its test, the package and the path TestSession names it by, and its
 * decision's seed, which its item sessions' seeds derive from. The application binds it once, to
 * its query of what its decision wrote, for the take and its own writes of the same sittings alike.
 */
export const takenHeading = {
  ...sittingHeading,
  package: PackageName,
  path: EntryPath,
  seed: uuid,
} as const;

/**
 * Each of the call's sittings with its standing (`SittingStanding`): `unstarted` before its first
 * candidate session, `open` in one, `suspended` between two, `ended` once its part has ended, and
 * `final` once its outcomes are (`SittingFinal`). What every sitting program reads back as
 * `standing`, after its writes, so an application maps the call's outcome in its own transaction: a
 * write that found its sitting in no state it acts on answers `unchanged` with the standing that
 * explains it.
 */
export const sittingStandingOf = (delivery: DeliveryLevel) => {
  const { SittingFinal, SittingStanding, TestEnd, TestSession, TestSuspension, TestVisit } =
    delivery.relations;

  /**
   * Each sitting's candidate session that is not suspended: its open one, or the one it ended in.
   */
  const unsuspended = query(delivery).rule((r) => {
    const { child, stage, k } = v(TestVisit, "unsuspendedVisit");

    return r
      .match(TestVisit, { child, k, stage })
      .where(r.not(TestSuspension, { child, k, stage }))
      .find({ child, stage });
  });

  return query(delivery)
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const { child, stage } = v(sittings, "unstartedSitting");

      return r
        .match(sittings, { child, stage })
        .match(TestSession, { child, stage })
        .where(r.not(TestVisit, { child, stage }))
        .find({ child, stage, standing: SittingStanding.handle("unstarted") });
    })
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const { child, stage } = v(sittings, "openSitting");

      return r
        .match(sittings, { child, stage })
        .match(unsuspended, { child, stage })
        .where(r.not(TestEnd, { child, stage }))
        .find({ child, stage, standing: SittingStanding.handle("open") });
    })
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const { child, stage } = v(sittings, "suspendedSitting");

      return r
        .match(sittings, { child, stage })
        .match(TestSuspension, { child, stage })
        .where(r.not(unsuspended, { child, stage }), r.not(TestEnd, { child, stage }))
        .find({ child, stage, standing: SittingStanding.handle("suspended") });
    })
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const { child, stage } = v(sittings, "endedSitting");

      return r
        .match(sittings, { child, stage })
        .match(TestEnd, { child, stage })
        .where(r.not(SittingFinal, { child, stage }))
        .find({ child, stage, standing: SittingStanding.handle("ended") });
    })
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const { child, stage } = v(sittings, "finalSitting");

      return r
        .match(sittings, { child, stage })
        .match(SittingFinal, { child, stage })
        .find({ child, stage, standing: SittingStanding.handle("final") });
    });
};

/**
 * The sitting of the item session a call names by its key, `child`, `package`, `path` and `n`: the
 * stage ItemSession holds it at. What a write over one attempt binds `sittings` to (an
 * evaluation, a person's value, an assertion), so it settles that attempt's sitting with no stage
 * parameter.
 */
export const sittingOfSessionOf = (delivery: DeliveryLevel) => {
  const { Attempt, ItemSession } = delivery.relations;

  return query(delivery).rule((r) => {
    const { child, stage } = v(ItemSession, "session");

    return r
      .match(ItemSession, {
        child,
        n: r.param("n", Attempt.fields.n),
        package: r.param("package", Attempt.fields.package),
        path: r.param("path", Attempt.fields.path),
        stage,
      })
      .where(r.eq(child, r.param("child", LearnerId)))
      .find({ child, stage });
  });
};

/**
 * Each sitting that has not ended, by its key, with its test: a test session with no end. What a
 * take of a test is guarded by, matched at the child and the test the call names, in the state
 * before each of its strata (`r.not`): a take while the child's sitting of that test stands
 * unended writes nothing, so two concurrent takes, which both read none, conflict under
 * SERIALIZABLE, where one is refused and its retry writes nothing; and what the take reads back,
 * the sitting it made or the one that stood. The twin of an answer's guard on its session open.
 */
export const unendedSittingsOf = (delivery: DeliveryLevel) => {
  const { UnendedSitting } = delivery.relations;

  return query(delivery).rule((r) => {
    const { child, stage, package: pkg, path } = v(UnendedSitting, "unendedSitting");

    return r
      .match(UnendedSitting, { child, package: pkg, path, stage })
      .find({ child, package: pkg, path, stage });
  });
};

/**
 * Each of the call's sittings once it has ended: its key, its test, and its end's instant.
 */
export const endedSittingOf = (delivery: DeliveryLevel) => {
  const { TestEnd, TestSession } = delivery.relations;

  return query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const { child, stage } = v(sittings, "endedSitting");
    const { package: pkg, path } = v(TestSession, "ended");
    const { at } = v(TestEnd, "end");

    return r
      .match(sittings, { child, stage })
      .match(TestSession, { child, package: pkg, path, stage })
      .match(TestEnd, { at, child, stage })
      .find({ at, child, package: pkg, path, stage });
  });
};

/**
 * Each item session of the call's sittings that has a save, with its latest save's instant.
 */
export const latestSavesOf = (delivery: DeliveryLevel) => {
  const { ItemSession, Save } = delivery.relations;

  return query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const { child, stage } = v(sittings, "savedSitting");
    const { package: pkg, path, n } = v(ItemSession, "savedSession");
    const { at } = v(Save, "save");

    return r
      .match(sittings, { child, stage })
      .match(ItemSession, { child, n, package: pkg, path, stage })
      .match(Save, { at, child, n, package: pkg, path })
      .find({ at: r.max(at), child, n, package: pkg, path });
  });
};

/**
 * The latest saves of the call's sittings ({@link latestSavesOf}), the one value every read of a
 * close shares.
 */
type LatestSaves = ReturnType<typeof latestSavesOf>;

/**
 * The instant of each of the call's sittings' latest presentation.
 */
const lastShownOf = (delivery: DeliveryLevel) => {
  const { TestPresented } = delivery.relations;

  return query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const { child, stage } = v(sittings, "shownSitting");
    const { at } = v(TestPresented, "shown");

    return r
      .match(sittings, { child, stage })
      .match(TestPresented, { at, child, stage })
      .find({ at: r.max(at), child, stage });
  });
};

/**
 * The member on screen in each of the call's sittings, the item of its latest presentation: what
 * a resumption presents again, and the member a linear part's end submits.
 */
export const shownMemberOf = (delivery: DeliveryLevel) => {
  const { TestPresented } = delivery.relations;
  const lastShown = lastShownOf(delivery);

  return query(delivery).rule((r) => {
    const lastShownAt = lastShown.bind({ sittings: r.relation("sittings", sittingHeading) });
    const { child, stage, at } = v(lastShownAt, "lastShown");
    const { package: pkg, path } = v(TestPresented, "onScreen");

    return r
      .match(lastShownAt, { at, child, stage })
      .match(TestPresented, { at, child, package: pkg, path, stage })
      .find({ child, package: pkg, path, stage });
  });
};

/**
 * The member on screen in each of the call's sittings ({@link shownMemberOf}), by its item
 * session, with the instant of that session's latest save, where it has one.
 */
const shownSaveOf = (delivery: DeliveryLevel, saves: LatestSaves) => {
  const shown = shownMemberOf(delivery);

  return query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const shownAt = shown.bind({ sittings });
    const savesAt = saves.bind({ sittings });
    const { child, stage, package: pkg, path } = v(shownAt, "shown");
    const { n, at } = v(savesAt, "shownSave");

    return r
      .match(shownAt, { child, package: pkg, path, stage })
      .match(savesAt, { at, child, n, package: pkg, path })
      .find({ at, child, n, package: pkg, path, stage });
  });
};

/**
 * The member on screen with its latest save ({@link shownSaveOf}).
 */
type ShownSaves = ReturnType<typeof shownSaveOf>;

/**
 * The member on screen in each of the call's sittings ({@link shownSaveOf}), by its item session,
 * where its latest save holds a value: a row of any of the save's value sidecars at the save's key,
 * a record's field header among them. A save with none is an answer the candidate cleared. One rule
 * per sidecar, since grizzle's types admit no helper generic over a relation's heading, each bound
 * to the call's sittings through the member on screen before it reads its sidecar, so it reads that
 * save's rows alone.
 */
const shownHeldOf = (delivery: DeliveryLevel, shownSave: ShownSaves) => {
  const {
    SnapshotMultipleBoolean,
    SnapshotMultipleDirectedPair,
    SnapshotMultipleDuration,
    SnapshotMultipleFile,
    SnapshotMultipleFloat,
    SnapshotMultipleIdentifier,
    SnapshotMultipleInteger,
    SnapshotMultiplePair,
    SnapshotMultiplePoint,
    SnapshotMultipleString,
    SnapshotMultipleUri,
    SnapshotOrderedBoolean,
    SnapshotOrderedDirectedPair,
    SnapshotOrderedDuration,
    SnapshotOrderedFile,
    SnapshotOrderedFloat,
    SnapshotOrderedIdentifier,
    SnapshotOrderedInteger,
    SnapshotOrderedPair,
    SnapshotOrderedPoint,
    SnapshotOrderedString,
    SnapshotOrderedUri,
    SnapshotRecord,
    SnapshotSingleBoolean,
    SnapshotSingleDirectedPair,
    SnapshotSingleDuration,
    SnapshotSingleFile,
    SnapshotSingleFloat,
    SnapshotSingleIdentifier,
    SnapshotSingleInteger,
    SnapshotSinglePair,
    SnapshotSinglePoint,
    SnapshotSingleString,
    SnapshotSingleUri,
  } = delivery.relations;

  return query(delivery)
    .rule((r) => {
      const shownAt = shownSave.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { at, child, n, package: pkg, path, stage } = v(shownAt, "heldShown");

      return r
        .match(shownAt, { at, child, n, package: pkg, path, stage })
        .match(SnapshotSingleIdentifier, { at, child, n, package: pkg, path })
        .find({ child, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const shownAt = shownSave.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { at, child, n, package: pkg, path, stage } = v(shownAt, "heldShown");

      return r
        .match(shownAt, { at, child, n, package: pkg, path, stage })
        .match(SnapshotSingleBoolean, { at, child, n, package: pkg, path })
        .find({ child, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const shownAt = shownSave.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { at, child, n, package: pkg, path, stage } = v(shownAt, "heldShown");

      return r
        .match(shownAt, { at, child, n, package: pkg, path, stage })
        .match(SnapshotSingleInteger, { at, child, n, package: pkg, path })
        .find({ child, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const shownAt = shownSave.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { at, child, n, package: pkg, path, stage } = v(shownAt, "heldShown");

      return r
        .match(shownAt, { at, child, n, package: pkg, path, stage })
        .match(SnapshotSingleFloat, { at, child, n, package: pkg, path })
        .find({ child, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const shownAt = shownSave.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { at, child, n, package: pkg, path, stage } = v(shownAt, "heldShown");

      return r
        .match(shownAt, { at, child, n, package: pkg, path, stage })
        .match(SnapshotSingleString, { at, child, n, package: pkg, path })
        .find({ child, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const shownAt = shownSave.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { at, child, n, package: pkg, path, stage } = v(shownAt, "heldShown");

      return r
        .match(shownAt, { at, child, n, package: pkg, path, stage })
        .match(SnapshotSinglePoint, { at, child, n, package: pkg, path })
        .find({ child, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const shownAt = shownSave.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { at, child, n, package: pkg, path, stage } = v(shownAt, "heldShown");

      return r
        .match(shownAt, { at, child, n, package: pkg, path, stage })
        .match(SnapshotSinglePair, { at, child, n, package: pkg, path })
        .find({ child, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const shownAt = shownSave.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { at, child, n, package: pkg, path, stage } = v(shownAt, "heldShown");

      return r
        .match(shownAt, { at, child, n, package: pkg, path, stage })
        .match(SnapshotSingleDirectedPair, { at, child, n, package: pkg, path })
        .find({ child, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const shownAt = shownSave.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { at, child, n, package: pkg, path, stage } = v(shownAt, "heldShown");

      return r
        .match(shownAt, { at, child, n, package: pkg, path, stage })
        .match(SnapshotSingleDuration, { at, child, n, package: pkg, path })
        .find({ child, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const shownAt = shownSave.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { at, child, n, package: pkg, path, stage } = v(shownAt, "heldShown");

      return r
        .match(shownAt, { at, child, n, package: pkg, path, stage })
        .match(SnapshotSingleUri, { at, child, n, package: pkg, path })
        .find({ child, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const shownAt = shownSave.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { at, child, n, package: pkg, path, stage } = v(shownAt, "heldShown");

      return r
        .match(shownAt, { at, child, n, package: pkg, path, stage })
        .match(SnapshotSingleFile, { at, child, n, package: pkg, path })
        .find({ child, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const shownAt = shownSave.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { at, child, n, package: pkg, path, stage } = v(shownAt, "heldShown");

      return r
        .match(shownAt, { at, child, n, package: pkg, path, stage })
        .match(SnapshotMultipleIdentifier, { at, child, n, package: pkg, path })
        .find({ child, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const shownAt = shownSave.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { at, child, n, package: pkg, path, stage } = v(shownAt, "heldShown");

      return r
        .match(shownAt, { at, child, n, package: pkg, path, stage })
        .match(SnapshotMultipleBoolean, { at, child, n, package: pkg, path })
        .find({ child, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const shownAt = shownSave.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { at, child, n, package: pkg, path, stage } = v(shownAt, "heldShown");

      return r
        .match(shownAt, { at, child, n, package: pkg, path, stage })
        .match(SnapshotMultipleInteger, { at, child, n, package: pkg, path })
        .find({ child, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const shownAt = shownSave.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { at, child, n, package: pkg, path, stage } = v(shownAt, "heldShown");

      return r
        .match(shownAt, { at, child, n, package: pkg, path, stage })
        .match(SnapshotMultipleFloat, { at, child, n, package: pkg, path })
        .find({ child, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const shownAt = shownSave.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { at, child, n, package: pkg, path, stage } = v(shownAt, "heldShown");

      return r
        .match(shownAt, { at, child, n, package: pkg, path, stage })
        .match(SnapshotMultipleString, { at, child, n, package: pkg, path })
        .find({ child, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const shownAt = shownSave.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { at, child, n, package: pkg, path, stage } = v(shownAt, "heldShown");

      return r
        .match(shownAt, { at, child, n, package: pkg, path, stage })
        .match(SnapshotMultiplePoint, { at, child, n, package: pkg, path })
        .find({ child, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const shownAt = shownSave.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { at, child, n, package: pkg, path, stage } = v(shownAt, "heldShown");

      return r
        .match(shownAt, { at, child, n, package: pkg, path, stage })
        .match(SnapshotMultiplePair, { at, child, n, package: pkg, path })
        .find({ child, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const shownAt = shownSave.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { at, child, n, package: pkg, path, stage } = v(shownAt, "heldShown");

      return r
        .match(shownAt, { at, child, n, package: pkg, path, stage })
        .match(SnapshotMultipleDirectedPair, { at, child, n, package: pkg, path })
        .find({ child, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const shownAt = shownSave.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { at, child, n, package: pkg, path, stage } = v(shownAt, "heldShown");

      return r
        .match(shownAt, { at, child, n, package: pkg, path, stage })
        .match(SnapshotMultipleDuration, { at, child, n, package: pkg, path })
        .find({ child, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const shownAt = shownSave.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { at, child, n, package: pkg, path, stage } = v(shownAt, "heldShown");

      return r
        .match(shownAt, { at, child, n, package: pkg, path, stage })
        .match(SnapshotMultipleUri, { at, child, n, package: pkg, path })
        .find({ child, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const shownAt = shownSave.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { at, child, n, package: pkg, path, stage } = v(shownAt, "heldShown");

      return r
        .match(shownAt, { at, child, n, package: pkg, path, stage })
        .match(SnapshotMultipleFile, { at, child, n, package: pkg, path })
        .find({ child, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const shownAt = shownSave.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { at, child, n, package: pkg, path, stage } = v(shownAt, "heldShown");

      return r
        .match(shownAt, { at, child, n, package: pkg, path, stage })
        .match(SnapshotOrderedIdentifier, { at, child, n, package: pkg, path })
        .find({ child, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const shownAt = shownSave.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { at, child, n, package: pkg, path, stage } = v(shownAt, "heldShown");

      return r
        .match(shownAt, { at, child, n, package: pkg, path, stage })
        .match(SnapshotOrderedBoolean, { at, child, n, package: pkg, path })
        .find({ child, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const shownAt = shownSave.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { at, child, n, package: pkg, path, stage } = v(shownAt, "heldShown");

      return r
        .match(shownAt, { at, child, n, package: pkg, path, stage })
        .match(SnapshotOrderedInteger, { at, child, n, package: pkg, path })
        .find({ child, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const shownAt = shownSave.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { at, child, n, package: pkg, path, stage } = v(shownAt, "heldShown");

      return r
        .match(shownAt, { at, child, n, package: pkg, path, stage })
        .match(SnapshotOrderedFloat, { at, child, n, package: pkg, path })
        .find({ child, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const shownAt = shownSave.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { at, child, n, package: pkg, path, stage } = v(shownAt, "heldShown");

      return r
        .match(shownAt, { at, child, n, package: pkg, path, stage })
        .match(SnapshotOrderedString, { at, child, n, package: pkg, path })
        .find({ child, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const shownAt = shownSave.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { at, child, n, package: pkg, path, stage } = v(shownAt, "heldShown");

      return r
        .match(shownAt, { at, child, n, package: pkg, path, stage })
        .match(SnapshotOrderedPoint, { at, child, n, package: pkg, path })
        .find({ child, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const shownAt = shownSave.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { at, child, n, package: pkg, path, stage } = v(shownAt, "heldShown");

      return r
        .match(shownAt, { at, child, n, package: pkg, path, stage })
        .match(SnapshotOrderedPair, { at, child, n, package: pkg, path })
        .find({ child, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const shownAt = shownSave.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { at, child, n, package: pkg, path, stage } = v(shownAt, "heldShown");

      return r
        .match(shownAt, { at, child, n, package: pkg, path, stage })
        .match(SnapshotOrderedDirectedPair, { at, child, n, package: pkg, path })
        .find({ child, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const shownAt = shownSave.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { at, child, n, package: pkg, path, stage } = v(shownAt, "heldShown");

      return r
        .match(shownAt, { at, child, n, package: pkg, path, stage })
        .match(SnapshotOrderedDuration, { at, child, n, package: pkg, path })
        .find({ child, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const shownAt = shownSave.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { at, child, n, package: pkg, path, stage } = v(shownAt, "heldShown");

      return r
        .match(shownAt, { at, child, n, package: pkg, path, stage })
        .match(SnapshotOrderedUri, { at, child, n, package: pkg, path })
        .find({ child, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const shownAt = shownSave.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { at, child, n, package: pkg, path, stage } = v(shownAt, "heldShown");

      return r
        .match(shownAt, { at, child, n, package: pkg, path, stage })
        .match(SnapshotOrderedFile, { at, child, n, package: pkg, path })
        .find({ child, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const shownAt = shownSave.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { at, child, n, package: pkg, path, stage } = v(shownAt, "heldShown");

      return r
        .match(shownAt, { at, child, n, package: pkg, path, stage })
        .match(SnapshotRecord, { at, child, n, package: pkg, path })
        .find({ child, n, package: pkg, path, stage });
    });
};

/**
 * The test parts the close rule tells apart, by their test's document and their place: an
 * individual linear part, whose end submits only the member on screen, and a part whose end submits
 * every presented member, an individual nonlinear part's and a simultaneous part's alike (module
 * note of `#ledger/finish.ts`).
 */
const partsOf = (delivery: DeliveryLevel) => {
  const { NavigationMode, SubmissionMode, TestPart } = delivery.relations;

  return {
    linear: query(delivery).rule((r) => {
      const { package: pkg, path, start } = v(TestPart, "linearPart");

      return r
        .match(TestPart, {
          navigation: NavigationMode.handle("linear"),
          package: pkg,
          path,
          start,
          submission: SubmissionMode.handle("individual"),
        })
        .find({ package: pkg, path, start });
    }),
    presented: query(delivery)
      .rule((r) => {
        const { package: pkg, path, start } = v(TestPart, "nonlinearPart");

        return r
          .match(TestPart, {
            navigation: NavigationMode.handle("nonlinear"),
            package: pkg,
            path,
            start,
            submission: SubmissionMode.handle("individual"),
          })
          .find({ package: pkg, path, start });
      })
      .rule((r) => {
        const { package: pkg, path, start } = v(TestPart, "simultaneousPart");

        return r
          .match(TestPart, {
            package: pkg,
            path,
            start,
            submission: SubmissionMode.handle("simultaneous"),
          })
          .find({ package: pkg, path, start });
      }),
  } as const;
};

/**
 * Each item session of the call's sittings whose attempt is in progress, what a submission ends:
 * one with no attempt, one rule; and an unlimited member's (`UnlimitedMember`, its item ref's
 * `max-attempts` 0) whose latest save is later than its every attempt, a response given since its
 * last submission, the other. A member under QTI's default `max-attempts`, 1, is closed by its one
 * attempt (Table 7.19.1, §2.2.1); an unlimited member's next attempt begins when its last ends.
 */
const inProgressOf = (delivery: DeliveryLevel, saves: LatestSaves) => {
  const { Attempt, ItemSession, TestMember, TestSession, UnlimitedMember } = delivery.relations;
  /**
   * Each item session of the call's sittings with an attempt at or after its latest save.
   */
  const attemptedSince = query(delivery).rule((r) => {
    const savesAt = saves.bind({ sittings: r.relation("sittings", sittingHeading) });
    const { child, package: pkg, path, n, at: saved } = v(savesAt, "sinceSave");
    const { at } = v(Attempt, "attemptSince");

    return r
      .match(savesAt, { at: saved, child, n, package: pkg, path })
      .match(Attempt, { at, child, n, package: pkg, path })
      .where(r.ge(at, saved))
      .find({ child, n, package: pkg, path });
  });

  return query(delivery)
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const { child, stage } = v(sittings, "unattemptedSitting");
      const { package: pkg, path, n } = v(ItemSession, "unattempted");

      return r
        .match(sittings, { child, stage })
        .match(ItemSession, { child, n, package: pkg, path, stage })
        .where(r.not(Attempt, { child, n, package: pkg, path }))
        .find({ child, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const savesAt = saves.bind({ sittings });
      const attemptedSinceAt = attemptedSince.bind({ sittings });
      const { child, stage } = v(sittings, "resavedSitting");
      const { package: pkg, path: test } = v(TestSession, "resavedTest");
      const { document, item } = v(TestMember, "resavedMember");
      const { n } = v(ItemSession, "resaved");

      return r
        .match(sittings, { child, stage })
        .match(TestSession, { child, package: pkg, path: test, stage })
        .match(TestMember, { document, item, package: pkg, path: test })
        .match(UnlimitedMember, { item, package: pkg, path: test })
        .match(ItemSession, { child, n, package: pkg, path: document, stage })
        .match(savesAt, { child, n, package: pkg, path: document })
        .where(r.not(attemptedSinceAt, { child, n, package: pkg, path: document }))
        .find({ child, n, package: pkg, path: document, stage });
    });
};

/**
 * The item sessions the end of each of the call's sittings submits, by the close rule (module note
 * of `#ledger/finish.ts`), each by its key: one rule per way a part's end submits, the part its
 * member's item ref is in (`TestMember.part`, the place of the test's one part), each a member
 * whose attempt is in progress ({@link inProgressOf}), over the close's one `saves`.
 */
const closingOf = (delivery: DeliveryLevel, saves: LatestSaves) => {
  const { TestMember, TestPresented } = delivery.relations;
  const parts = partsOf(delivery);
  const inProgress = inProgressOf(delivery, saves);
  const ended = endedSittingOf(delivery);
  const shownSave = shownSaveOf(delivery, saves);
  /**
   * The member on screen, by its item session, where its latest save holds a value.
   */
  const shownHeld = shownHeldOf(delivery, shownSave);

  return query(delivery)
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const endedAt = ended.bind({ sittings });
      const inProgressAt = inProgress.bind({ sittings });
      const { child, stage, package: pkg, path: test } = v(endedAt, "presentedSitting");
      const { path: item } = v(TestPresented, "presentedShown");
      const { part } = v(TestMember, "presentedMember");
      const { n } = v(inProgressAt, "presentedSession");

      return r
        .match(endedAt, { child, package: pkg, path: test, stage })
        .match(TestPresented, { child, package: pkg, path: item, stage })
        .match(TestMember, { document: item, package: pkg, part, path: test })
        .match(parts.presented, { package: pkg, path: test, start: part })
        .match(inProgressAt, { child, n, package: pkg, path: item, stage })
        .find({ child, n, package: pkg, path: item });
    })
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const endedAt = ended.bind({ sittings });
      const shownHeldAt = shownHeld.bind({ sittings });
      const inProgressAt = inProgress.bind({ sittings });
      const { child, stage, package: pkg, path: test } = v(endedAt, "linearSitting");
      const { path: item, n } = v(shownHeldAt, "linearShown");
      const { part } = v(TestMember, "linearMember");

      return r
        .match(endedAt, { child, package: pkg, path: test, stage })
        .match(shownHeldAt, { child, n, package: pkg, path: item, stage })
        .match(TestMember, { document: item, package: pkg, part, path: test })
        .match(parts.linear, { package: pkg, path: test, start: part })
        .match(inProgressAt, { child, n, package: pkg, path: item, stage })
        .find({ child, n, package: pkg, path: item });
    });
};

/**
 * What a close reads, each once: the latest saves of the call's sittings ({@link latestSavesOf}),
 * the one value its in-progress members, its member on screen and every copy of a save read, and
 * the members its end submits ({@link closingOf}).
 */
export const closeReadsOf = (delivery: DeliveryLevel) => {
  const saves = latestSavesOf(delivery);

  return { closing: closingOf(delivery, saves), saves } as const;
};

/**
 * A close's reads ({@link closeReadsOf}).
 */
export type CloseReads = ReturnType<typeof closeReadsOf>;
