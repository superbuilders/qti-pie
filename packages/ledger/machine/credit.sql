-- Design 1's numeric credit (GRADING-SQL's AlphaTest design 01), in the machine's style
-- (machine-types.sql, machine-leaves.sql): declared functions that read only their arguments, written callees first,
-- after machine-leaves.sql.
-- The owner's rule (proposal 2026-11-18-grading-in-sql, Decision 3) as arithmetic, once: an attempt's SCORE against
-- its maximum gives the exact pair (earned, maximum) and its category; a report rounds once, on the wire, by the
-- machine's one round-to (round_to_places, machine-leaves.sql) over the binary quotient (GRADING-CLASS 4.2). Nothing
-- here reads a declaration: which maximum applies is the ledger's content relations' (MaximumOutcome, MaximumNormal),
-- and which SCORE is in force is OutcomeInForce's.

-- An attempt's credit: what it earned of its maximum and the category of the pair. `kind` is the CreditKind roster's
-- code, the ledger's `closed.ordered("CreditKind", ["none", "partial", "full"])`, which grizzle numbers from 0 in its
-- declared order and never renumbers (a removed handle leaves its code unused, a reorder is refused): none 0, partial 1,
-- full 2.
create type p3.credit_value as (earned float8, kind smallint, maximum float8);

-- An attempt's credit: SCORE against the maximum (MAXSCORE, or else SCORE's normal-maximum, the content relations'
-- choice), as the owner's rule reads them: none at or below 0, full at or above the maximum, partial between, and
-- what it earned is the score clamped to [0, maximum] at the same points, so the category and the fraction are one arm
-- of one table and cannot disagree. One row, or none where the scores cannot say: a SCORE that is no finite number, or
-- a maximum that is none or not above 0.
--
-- QTI states the two outcomes and never clamps either: "Items that declare a numeric outcome variable representing the
-- candidate's overall performance on the item should use the outcome name 'SCORE' for the variable. SCORE MUST be a
-- float. Items that declare a maximum score (in multiple response choice interactions, for example) should do so by
-- declaring the 'MAXSCORE' variable. MAXSCORE MUST be a float." (QTI 3.0.1 information model, §2.2.2.3); "The
-- normalMaximum characteristic optionally defines the maximum magnitude of numeric outcome variables, it must be a
-- positive value. ... normalMaximum has no affect on responseProcessing or the values that the outcome variable itself
-- can take." (Table 4.5.7). So the clamp is the credit's alone, never a rewrite of SCORE, and the outcome's value stays
-- as response processing or its assertion set it. The rule is the owner's, not QTI's normalized score "(outcome value
-- - normalMinimum) / (normalMaximum - normalMinimum)" truncated to [-1.0, 1.0] (Tables 4.5.7, 4.5.8), which design 1's
-- D2 leaves unread. PostgreSQL orders NaN above every number, so finiteness is tested first, by the bounds: NaN is
-- below no infinity. -0 is at or below 0, so it earns +0, none.
create function p3.credit(maximum float8, score float8) returns setof p3.credit_value language sql immutable as $$
  select arm.earned, arm.kind, maximum
  from (values (0::float8, 0::smallint, score <= 0),
               (score, 1::smallint, score > 0 and score < maximum),
               (maximum, 2::smallint, score >= maximum)) as arm(earned, kind, holds)
  where arm.holds and score > '-Infinity' and score < 'Infinity' and maximum > 0 and maximum < 'Infinity'
$$;
