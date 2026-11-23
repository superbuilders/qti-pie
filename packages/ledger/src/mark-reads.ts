/**
 * The marks a review draws, read from the database (`markReadsOf`): each mark of the attempt a
 * sitting's review shows, on each part of its responses, derived in the statement that reads it and
 * never stored. One read for each shape of value a mark names, as the ledger keeps one sidecar for
 * each (`#ledger.ts`), all over one evaluation of the declared function `attemptMarksOf`
 * (`#grading.ts`, out/grading-sql/p3/marks.sql), which a statement that reads several of them
 * shares (FNNEST: a call over parameters and queries bound to them is one evaluation of its
 * statement), each bound to its rule's `sittings`, which the application binds once to its own
 * query.
 *
 * - **The attempts**: each item session of the call's sittings (the `sittings` relation parameter,
 *   `#ledger/sitting-queries.ts` sittingHeading) at its latest attempt, the one its review shows.
 * - **Each mark**, by the attempt's key `(child, package, path, n, at)`, read from the evaluation by
 *   its run's key `(child, package, path, stage)`, so two sittings' marks on one item stay apart,
 *   and the part it marks: the response (`variable`), the value's place (an ordered response's
 *   place from 0, else 0, an unordered container's members having none), the value in its shape's
 *   columns (a text's and a float's with their base type), its mark (`right` on a value the attempt
 *   gave that the correct response in force holds, `wrong` on one it does not hold, `missed` on a
 *   value of the correct response no given value took) and how many copies of the value the mark
 *   covers.
 *
 * The marks are `attemptMarksOf`'s over the arguments the grading statement's own table builds
 * (`#grade.ts` `attemptArgumentsOf`): the items' declarations, and the attempts' values (held
 * `value`) with the correct responses in force, the declarations' overridden by those the session's
 * template processing set (held `correct`), read by the grader's own readers. So a mark agrees with
 * `qti-match` by construction: a multiple and a single as a bag, an ordered value as a bag of
 * places, compared by the machine's `same`; and a point response a Select Point or a Position
 * Object binds whose declaration holds an area mapping by area, as `qti-map-response-point` counts
 * it (proposal 2026-11-18-grading-in-sql, Decision 6). A record, and a response whose correct
 * response in force is none or NULL, has no marks but by area.
 *
 * These are reads, not the Delivery level's derived relations the proposal names (`AttemptMark`): a
 * relation over every attempt would bind the grading statement's argument builders to each attempt
 * its rule matches, which takes builders generic over their input query (grizzle W4), not in the
 * pin; reads keyed by the sitting take the builders as they stand, from the same table. They become
 * the derived relations when W4 lands.
 *
 * A review that shows the solution draws every mark; one that shows the candidate's own answers
 * alone draws the `right` and `wrong` ones, and never reveals a correct response they did not give
 * (Bjorn, 2026-11-18, plate's UI suite's M2): plate draws what it is handed, by its `reveals`.
 */
import { Fn, query, v } from "@bjornpagen/grizzle";
import type { Rule } from "@bjornpagen/grizzle";
import { attemptArgumentsOf } from "#ledger/grade.ts";
import { attemptMarksOf } from "#ledger/grading.ts";
import type { DeliveryLevel } from "#ledger/sitting-programs.ts";
import { sittingHeading } from "#ledger/sitting-queries.ts";

/**
 * The interactions whose review marks a point response by area (QTI 3.0.1 information model 5.88,
 * 5.79).
 */
const areaInteractions = [
  "qti-select-point-interaction",
  "qti-position-object-interaction",
] as const;

export const markReadsOf = (delivery: DeliveryLevel) => {
  const { BoundVariable, ItemSession, Node } = delivery.relations;
  const args = attemptArgumentsOf(delivery);

  /**
   * The responses the sitting's items bind to a Select Point or a Position Object, by the item:
   * pantry's binding of a response by an interaction's `response-identifier` (`BoundVariable`),
   * beside its node's kind.
   */
  const areaBound = query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const { child, stage } = v(sittings, "areaSitting");
    const { package: pkg, path } = v(ItemSession, "areaSession");
    const { identifier, start } = v(BoundVariable, "areaBinding");
    const { kind } = v(Node, "areaInteraction");

    return r
      .match(sittings, { child, stage })
      .match(ItemSession, { child, package: pkg, path, stage })
      .match(BoundVariable, {
        attribute: "response-identifier",
        identifier,
        package: pkg,
        path,
        start,
      })
      .match(Node, { kind, package: pkg, path, start })
      .where(r.in(kind, areaInteractions))
      .find({ identifier, package: pkg, path });
  });

  /**
   * The rule's sittings' marks: one evaluation of `attemptMarksOf` over its `sittings`, which every
   * read of the statement shares.
   */
  const marked = (r: Rule<DeliveryLevel>) => {
    const sittings = r.relation("sittings", sittingHeading);

    return Fn.row(attemptMarksOf, {
      area_bound: areaBound.bind({ sittings }),
      booleans: args.booleans.bind({ sittings }),
      declaration_attributes: args.declaration_attributes.bind({ sittings }),
      declaration_texts: args.declaration_texts.bind({ sittings }),
      declarations: args.declarations.bind({ sittings }),
      directed_pairs: args.directed_pairs.bind({ sittings }),
      files: args.files.bind({ sittings }),
      floats: args.floats.bind({ sittings }),
      integers: args.integers.bind({ sittings }),
      pairs: args.pairs.bind({ sittings }),
      points: args.points.bind({ sittings }),
      runs: args.runs.bind({ sittings }),
      texts: args.texts.bind({ sittings }),
      vars: args.vars.bind({ sittings }),
    });
  };

  /**
   * Each mark of one shape: the attempt its review shows (`gradable`, each session's latest
   * attempt) beside the marks the evaluation gives its item.
   */
  const textMarks = query(delivery).rule((r) => {
    const latest = args.gradable.bind({ sittings: r.relation("sittings", sittingHeading) });
    const { child, package: pkg, path, n, stage, at } = v(latest, "markedText");
    const { texts } = marked(r);
    const { identifier, place, base, value, mark, copies } = v(texts, "markText");

    return r
      .match(latest, { at, child, n, package: pkg, path, stage })
      .match(texts, {
        base,
        child,
        copies,
        identifier,
        mark,
        package: pkg,
        path,
        place,
        stage,
        value,
      })
      .find({
        at,
        baseType: base,
        child,
        copies,
        mark,
        n,
        package: pkg,
        path,
        place,
        value,
        variable: identifier,
      });
  });

  const integerMarks = query(delivery).rule((r) => {
    const latest = args.gradable.bind({ sittings: r.relation("sittings", sittingHeading) });
    const { child, package: pkg, path, n, stage, at } = v(latest, "markedInteger");
    const { integers } = marked(r);
    const { identifier, place, value, mark, copies } = v(integers, "markInteger");

    return r
      .match(latest, { at, child, n, package: pkg, path, stage })
      .match(integers, { child, copies, identifier, mark, package: pkg, path, place, stage, value })
      .find({ at, child, copies, mark, n, package: pkg, path, place, value, variable: identifier });
  });

  const floatMarks = query(delivery).rule((r) => {
    const latest = args.gradable.bind({ sittings: r.relation("sittings", sittingHeading) });
    const { child, package: pkg, path, n, stage, at } = v(latest, "markedFloat");
    const { floats } = marked(r);
    const { identifier, place, base, value, mark, copies } = v(floats, "markFloat");

    return r
      .match(latest, { at, child, n, package: pkg, path, stage })
      .match(floats, {
        base,
        child,
        copies,
        identifier,
        mark,
        package: pkg,
        path,
        place,
        stage,
        value,
      })
      .find({
        at,
        baseType: base,
        child,
        copies,
        mark,
        n,
        package: pkg,
        path,
        place,
        value,
        variable: identifier,
      });
  });

  const booleanMarks = query(delivery).rule((r) => {
    const latest = args.gradable.bind({ sittings: r.relation("sittings", sittingHeading) });
    const { child, package: pkg, path, n, stage, at } = v(latest, "markedBoolean");
    const { booleans } = marked(r);
    const { identifier, place, value, mark, copies } = v(booleans, "markBoolean");

    return r
      .match(latest, { at, child, n, package: pkg, path, stage })
      .match(booleans, { child, copies, identifier, mark, package: pkg, path, place, stage, value })
      .find({ at, child, copies, mark, n, package: pkg, path, place, value, variable: identifier });
  });

  const pairMarks = query(delivery).rule((r) => {
    const latest = args.gradable.bind({ sittings: r.relation("sittings", sittingHeading) });
    const { child, package: pkg, path, n, stage, at } = v(latest, "markedPair");
    const { pairs } = marked(r);
    const { identifier, place, least, greatest, mark, copies } = v(pairs, "markPair");

    return r
      .match(latest, { at, child, n, package: pkg, path, stage })
      .match(pairs, {
        child,
        copies,
        greatest,
        identifier,
        least,
        mark,
        package: pkg,
        path,
        place,
        stage,
      })
      .find({
        at,
        child,
        copies,
        greatest,
        least,
        mark,
        n,
        package: pkg,
        path,
        place,
        variable: identifier,
      });
  });

  const directedPairMarks = query(delivery).rule((r) => {
    const latest = args.gradable.bind({ sittings: r.relation("sittings", sittingHeading) });
    const { child, package: pkg, path, n, stage, at } = v(latest, "markedDirectedPair");
    const { directed_pairs } = marked(r);
    const { identifier, place, source, target, mark, copies } = v(
      directed_pairs,
      "markDirectedPair",
    );

    return r
      .match(latest, { at, child, n, package: pkg, path, stage })
      .match(directed_pairs, {
        child,
        copies,
        identifier,
        mark,
        package: pkg,
        path,
        place,
        source,
        stage,
        target,
      })
      .find({
        at,
        child,
        copies,
        mark,
        n,
        package: pkg,
        path,
        place,
        source,
        target,
        variable: identifier,
      });
  });

  const pointMarks = query(delivery).rule((r) => {
    const latest = args.gradable.bind({ sittings: r.relation("sittings", sittingHeading) });
    const { child, package: pkg, path, n, stage, at } = v(latest, "markedPoint");
    const { points } = marked(r);
    const { identifier, place, x, y, mark, copies } = v(points, "markPoint");

    return r
      .match(latest, { at, child, n, package: pkg, path, stage })
      .match(points, { child, copies, identifier, mark, package: pkg, path, place, stage, x, y })
      .find({ at, child, copies, mark, n, package: pkg, path, place, variable: identifier, x, y });
  });

  const fileMarks = query(delivery).rule((r) => {
    const latest = args.gradable.bind({ sittings: r.relation("sittings", sittingHeading) });
    const { child, package: pkg, path, n, stage, at } = v(latest, "markedFile");
    const { files } = marked(r);
    const {
      identifier,
      place,
      digest,
      content_type: contentType,
      mark,
      copies,
    } = v(files, "markFile");

    return r
      .match(latest, { at, child, n, package: pkg, path, stage })
      .match(files, {
        child,
        content_type: contentType,
        copies,
        digest,
        identifier,
        mark,
        package: pkg,
        path,
        place,
        stage,
      })
      .find({
        at,
        child,
        contentType,
        copies,
        digest,
        mark,
        n,
        package: pkg,
        path,
        place,
        variable: identifier,
      });
  });

  return {
    boolean: booleanMarks,
    directedPair: directedPairMarks,
    file: fileMarks,
    float: floatMarks,
    integer: integerMarks,
    pair: pairMarks,
    point: pointMarks,
    text: textMarks,
  } as const;
};
