-- AttemptMark's machine (P4-MARKS): the marks a review draws on each part of an attempt's responses, against the
-- correct response in force, as declared functions that read only their arguments (machine-types.sql). Loads after
-- document.sql, whose readers give the declared correct responses (declared), the area mappings (inputs_of) and the
-- attempt's values (values_of, vars_in), so each is read once, as the grader reads it.
--
-- A mark is `right` on a value the response gives that the correct response holds, `wrong` on one it does not hold,
-- and `missed` on a value of the correct response no given value took (plate's UI suite's M1, the owner's restatement
-- of 2026-11-18). Every response's marks are one shape, a bag: each value the marks name, at its place, with its mark
-- and how many copies of it the mark covers. Two singles are the same as the machine's `same` compares them, the one
-- comparison `qti-match` reads (an unordered pair in either order, a float by value and never NaN, a file by its
-- digest), so a mark agrees with `match` by construction.
--
-- - A multiple is a bag of values (QTI 3.0.1 information model, Cardinality: "multiple ... an unordered container"):
--   a given value is right while the correct bag still holds a copy the same as it that no copy before it took, else
--   wrong, and each copy of the correct bag no given copy took is missed; its values stand at place 0, an unordered
--   container's members having no place.
-- - A single is a multiple of at most one value: right or wrong, and its correct value missed where it is not given.
-- - An ordered value is a bag of (place, value): the value given at a place is right where the correct value at that
--   place is the same, else wrong, and the correct value at a place no same value was given at is missed there, so a
--   place shows its given value wrong beside the correct one missed, or the correct one alone.
-- - A point response a Select Point or a Position Object binds, whose declaration holds an area mapping, is marked by
--   area (proposal 2026-11-18-grading-in-sql, Decision 6), as qti-map-response-point counts it: a point is in the first
--   area, by place, that holds it (point_area, the machine's own reading); it is right where that area is mapped above
--   0 and no point before it reached that area, since each area counts once, else wrong; each area mapped above 0 that
--   no point reached is missed at its first correct point. A multiple's points are a bag, so "before" is the bag's
--   canonical order, the least point first by (x, y) (lead, 2026-11-20), and so is "first correct point".
-- - A record, and a response with no correct response in force or a NULL one, has no marks but by area: there is
--   nothing `match` compares it against (QTI 3.0.1 information model 6.9.25, match: "...must not be used with record
--   containers").
--
-- The review that shows the solution draws every mark; the one that shows the candidate's own answers alone draws
-- `right` and `wrong` only (Bjorn, 2026-11-18, plate's UI suite's M2: it "never reveals a correct response").

-- A response a document's body binds to an interaction whose review marks it by area: a Select Point or a Position
-- Object (QTI 3.0.1 information model 5.88 and 5.79, each binding a single or multiple point response).
create type p3.document_response as (identifier text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8,
  path text collate pg_catalog.pg_c_utf8);
-- One mark of an attempt's response, by base type as the boundary's values are (document-types.sql): the response,
-- the place of the value (an ordered value's place from 0, else 0), the value, its mark (`missed`, `right` or `wrong`)
-- and how many of its copies the mark covers, at least one.
create type p3.mark_text as (base text collate pg_catalog.pg_c_utf8, child text collate pg_catalog.pg_c_utf8,
  copies bigint, identifier text collate pg_catalog.pg_c_utf8, mark text collate pg_catalog.pg_c_utf8,
  package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, place bigint, stage bigint,
  value text collate pg_catalog.pg_c_utf8);
create type p3.mark_integer as (child text collate pg_catalog.pg_c_utf8, copies bigint,
  identifier text collate pg_catalog.pg_c_utf8, mark text collate pg_catalog.pg_c_utf8,
  package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, place bigint, stage bigint,
  value numeric(825, 0));
create type p3.mark_float as (base text collate pg_catalog.pg_c_utf8, child text collate pg_catalog.pg_c_utf8,
  copies bigint, identifier text collate pg_catalog.pg_c_utf8, mark text collate pg_catalog.pg_c_utf8,
  package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, place bigint, stage bigint,
  value float8);
create type p3.mark_boolean as (child text collate pg_catalog.pg_c_utf8, copies bigint,
  identifier text collate pg_catalog.pg_c_utf8, mark text collate pg_catalog.pg_c_utf8,
  package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, place bigint, stage bigint,
  value boolean);
create type p3.mark_pair as (child text collate pg_catalog.pg_c_utf8, copies bigint,
  greatest text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8,
  least text collate pg_catalog.pg_c_utf8, mark text collate pg_catalog.pg_c_utf8,
  package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, place bigint, stage bigint);
create type p3.mark_directed_pair as (child text collate pg_catalog.pg_c_utf8, copies bigint,
  identifier text collate pg_catalog.pg_c_utf8, mark text collate pg_catalog.pg_c_utf8,
  package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, place bigint,
  source text collate pg_catalog.pg_c_utf8, stage bigint, target text collate pg_catalog.pg_c_utf8);
create type p3.mark_point as (child text collate pg_catalog.pg_c_utf8, copies bigint,
  identifier text collate pg_catalog.pg_c_utf8, mark text collate pg_catalog.pg_c_utf8,
  package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, place bigint, stage bigint,
  x numeric(825, 0), y numeric(825, 0));
create type p3.mark_file as (child text collate pg_catalog.pg_c_utf8, content_type text collate pg_catalog.pg_c_utf8,
  copies bigint, digest bytea, identifier text collate pg_catalog.pg_c_utf8,
  mark text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8,
  path text collate pg_catalog.pg_c_utf8, place bigint, stage bigint);
-- Every mark of a call's attempts, by base type: a field of rows alone, so a statement reads each as a source (FNNEST,
-- Compute.rowOf).
create type p3.mark_values as (booleans p3.mark_boolean[], directed_pairs p3.mark_directed_pair[], files p3.mark_file[],
  floats p3.mark_float[], integers p3.mark_integer[], pairs p3.mark_pair[], points p3.mark_point[],
  texts p3.mark_text[]);
-- One mark, typed: the single it names, at its place, with its mark and copies; the machine's own row, which
-- attempt_marks_of's reshape writes into the boundary's headings.
create type p3.marked as (copies bigint, identifier text collate pg_catalog.pg_c_utf8, mark text collate pg_catalog.pg_c_utf8,
  place bigint, value p3.single);

-- The marks of one response by `match`'s reading: its given singles against the correct response's, a single or a
-- multiple as a bag, an ordered value as a bag of places. Each given copy is numbered among the given copies with its
-- multiset image (the machine's `bag`, as `match` compares a multiple), and is right while its number is within the
-- correct copies the same as it; each correct copy is numbered likewise among the correct ones, and the copies past
-- those the given took are missed. Grouped back into marks, each value once per mark.
create function p3.bag_marks(card text, correct p3.single[], given p3.single[], id text) returns setof p3.marked
language sql immutable as $$
  with g as (
    select k, given[k] as x, case when card = 'ordered' then k - 1 else 0 end::bigint as place from generate_subscripts(given, 1) k
  ), c as (
    select k, correct[k] as x, case when card = 'ordered' then k - 1 else 0 end::bigint as place from generate_subscripts(correct, 1) k
  ), gn as (
    select g.*, row_number() over (partition by g.place, b.base, b.d, b.t, b.u, b.n, b.m, b.f, b.b order by g.k) as nth,
      (select count(*) from c where c.place = g.place and same(a => c.x, b => g.x)) as held
    from g, lateral bag(v => array[g.x]) b
  ), cn as (
    select c.*, row_number() over (partition by c.place, b.base, b.d, b.t, b.u, b.n, b.m, b.f, b.b order by c.k) as nth,
      (select count(*) from c o where o.place = c.place and same(a => o.x, b => c.x)) as held,
      (select count(*) from g where g.place = c.place and same(a => g.x, b => c.x)) as taken
    from c, lateral bag(v => array[c.x]) b
  ), m as (
    select gn.place, gn.x, case when gn.nth <= gn.held then 'right' else 'wrong' end as mark, gn.k from gn
    union all
    select cn.place, cn.x, 'missed', cn.k from cn where cn.nth > least(cn.taken, cn.held)
  )
  select count(*), id, m.mark, m.place, (array_agg(m.x order by m.k))[1]
  from m, lateral bag(v => array[m.x]) b
  group by m.place, m.mark, b.base, b.d, b.t, b.u, b.n, b.m, b.f, b.b
$$;

-- The marks of one point response by area (Decision 6): each distinct point, least first, in its area (point_area);
-- the first point to reach an area mapped above 0 right, every other copy wrong; each area mapped above 0 that no
-- point reached missed at its least correct point.
create function p3.area_marks(correct p3.single[], entries p3.area_entry[], given p3.single[], id text) returns setof p3.marked
language sql immutable as $$
  with g as (
    select x, count(*) as copies from unnest(given) x group by x
  ), ga as (
    select g.x, g.copies, a.place as region, a.value as mapped from g left join lateral point_area(entries => entries, id => id, x => g.x) a on true
  ), gr as (
    select ga.*, row_number() over (partition by ga.region order by (ga.x).n, (ga.x).m) as nth from ga
  ), m as (
    select gr.x, 'right' as mark, 1::bigint as copies from gr where gr.region is not null and gr.mapped > 0 and gr.nth = 1
    union all
    select gr.x, 'wrong', gr.copies - case when gr.region is not null and gr.mapped > 0 and gr.nth = 1 then 1 else 0 end
    from gr
  ), missed as (
    select distinct on (a.place) x
    from unnest(correct) x, lateral point_area(entries => entries, id => id, x => x) a
    where a.value > 0 and not exists (select 1 from ga where ga.region = a.place)
    order by a.place, x.n, x.m
  )
  select m.copies, id, m.mark, 0::bigint, m.x from m where m.copies > 0
  union all
  select 1::bigint, id, 'missed', 0::bigint, missed.x from missed
$$;

-- Every mark of each run a call names, an attempt of an item session (one attempt a session, as AttemptMark calls it),
-- each by itself: its responses' values (held `value`) against the correct responses in force, the declared ones
-- overridden by those the session's template processing set (held `correct`), as the grader starts from them, each read
-- by the run's key; and by area, the responses `area_bound` names whose declaration holds an area mapping, read with the
-- declarations by the run's document. The one reshape into the boundary's headings, by base type, each mark keyed by
-- its run.
create function p3.attempt_marks_of(area_bound p3.document_response[], bases p3.doc_base[],
  booleans p3.doc_boolean[], declaration_attributes p3.document_attribute[], declaration_texts p3.document_text[], declarations p3.declaration_node[],
  directed_pairs p3.doc_directed_pair[], file_names p3.doc_file_name[], files p3.doc_file[], floats p3.doc_float[], integers p3.doc_integer[],
  pairs p3.doc_pair[], points p3.doc_point[], runs p3.document_run[], texts p3.doc_text[], vars p3.doc_var[])
returns p3.mark_values language sql immutable as $$
  with parts as (
    select r.child, r.package, r.path, r.stage, t.ds, t.das, t.dts, inputs_of(declarations => t.ds, attributes => t.das, texts => t.dts) as inp,
      values_of(child => r.child, package => r.package, path => r.path, stage => r.stage, vars => vars, bases => bases, texts => texts, integers => integers, floats => floats, booleans => booleans, pairs => pairs, directed_pairs => directed_pairs, points => points, files => files,
        file_names => file_names, field_texts => '{}', field_integers => '{}', field_floats => '{}', field_booleans => '{}', field_pairs => '{}', field_directed_pairs => '{}', field_points => '{}', field_files => '{}', field_file_names => '{}') as iv
    from unnest(runs) r cross join lateral (select
      array(select d from unnest(declarations) d where (d.package, d.path) = (r.package, r.path)) as ds,
      array(select a from unnest(declaration_attributes) a where (a.package, a.path) = (r.package, r.path)) as das,
      array(select x from unnest(declaration_texts) x where (x.package, x.path) = (r.package, r.path)) as dts) t
  ), responses as (
    select parts.child, parts.package, parts.path, parts.stage, d.identifier, d.card, coalesce(g.vals, '{}') as given, c.vals as correct,
      (parts.inp).area_entries as entries,
      exists (select 1 from unnest(area_bound) b where (b.package, b.path, b.identifier) = (parts.package, parts.path, d.identifier))
        and exists (select 1 from unnest((parts.inp).area_mappings) am where am.identifier = d.identifier) as by_area
    from parts
    cross join lateral declared(declarations => parts.ds, attributes => parts.das, texts => parts.dts, kind => 'qti-response-declaration', holder => 'qti-correct-response') d
    left join lateral (select x.vals from vars_in(i => parts.iv, h => 'value') x where x.identifier = d.identifier) g on true
    cross join lateral (select o.vals from overridden(declared => array[d], given => array(select x from vars_in(i => parts.iv, h => 'correct') x)) o
      where o.identifier = d.identifier) c
    where d.card <> 'record'
  ), m as (
    select r.child, r.package, r.path, r.stage, k.* from responses r, lateral area_marks(entries => r.entries, id => r.identifier, given => r.given, correct => r.correct) k where r.by_area
    union all
    select r.child, r.package, r.path, r.stage, k.* from responses r, lateral bag_marks(id => r.identifier, card => r.card, given => r.given, correct => r.correct) k
    where not r.by_area and cardinality(r.correct) > 0
  )
  select row(
    array(select row(m.child, m.copies, m.identifier, m.mark, m.package, m.path, m.place, m.stage, (m.value).b)::mark_boolean
      from m where (m.value).base = 'boolean'),
    array(select row(m.child, m.copies, m.identifier, m.mark, m.package, m.path, m.place, (m.value).t, m.stage, (m.value).u)::mark_directed_pair
      from m where (m.value).base = 'directedPair'),
    array(select row(m.child, (m.value).u, m.copies, (m.value).d, m.identifier, m.mark, m.package, m.path, m.place, m.stage)::mark_file
      from m where (m.value).base = 'file'),
    array(select row((m.value).base, m.child, m.copies, m.identifier, m.mark, m.package, m.path, m.place, m.stage, (m.value).f)::mark_float
      from m where (m.value).base in ('float', 'duration')),
    array(select row(m.child, m.copies, m.identifier, m.mark, m.package, m.path, m.place, m.stage, (m.value).n)::mark_integer
      from m where (m.value).base = 'integer'),
    array(select row(m.child, m.copies, (m.value).u, m.identifier, (m.value).t, m.mark, m.package, m.path, m.place, m.stage)::mark_pair
      from m where (m.value).base = 'pair'),
    array(select row(m.child, m.copies, m.identifier, m.mark, m.package, m.path, m.place, m.stage, (m.value).n, (m.value).m)::mark_point
      from m where (m.value).base = 'point'),
    array(select row((m.value).base, m.child, m.copies, m.identifier, m.mark, m.package, m.path, m.place, m.stage, (m.value).t)::mark_text
      from m where (m.value).base in ('identifier', 'string', 'uri'))
  )::mark_values
$$;
