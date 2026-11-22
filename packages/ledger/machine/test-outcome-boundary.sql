-- IMPL-TESTOP's half of outcome processing's flat twin (GRADING-SQL's boundary, p3/boundary.sql): what a fused
-- statement passes for a test's members, as value-only, NULL-free headings a query fills, and the one assembly of them
-- into the machine's test inputs (machine-types.sql's p3.inputs test fields, test-outcome-arms.sql). The test's content
-- per item ref is already flat: p3.member, p3.ref_section, p3.ref_category, p3.ref_weight, p3.ref_mapping and
-- p3.member_bound hold values alone and no NULL. A member's values are its item session's, each held as boundary.sql's
-- out_* headings hold a run's (a value its singles at their places from 0, a record's at its fields; NULL no row), with
-- the member's item ref first and `holds`, which of the session's values it is: its value now (`value`), its correct
-- response in force (`correct`) or its default in force (`default`). A file's name, which it may lack, is its own heading.
-- Loads after boundary.sql and test-outcome.sql.

-- Each member's variables, declared and built in, by item ref and identifier: its declaration's kind and cardinality,
-- and its base type where it has one (a record has none, Table 5.115.3, so it has no base row).
create type p3.in_member_var as (card text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, kind text collate pg_catalog.pg_c_utf8, ref text collate pg_catalog.pg_c_utf8);
create type p3.in_member_base as (base text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, ref text collate pg_catalog.pg_c_utf8);
create type p3.in_member_text as (base text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, place integer, ref text collate pg_catalog.pg_c_utf8, value text collate pg_catalog.pg_c_utf8);
create type p3.in_member_integer as (holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, place integer, ref text collate pg_catalog.pg_c_utf8, value numeric(825, 0));
create type p3.in_member_float as (base text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, place integer, ref text collate pg_catalog.pg_c_utf8, value float8);
create type p3.in_member_boolean as (holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, place integer, ref text collate pg_catalog.pg_c_utf8, value boolean);
create type p3.in_member_pair as (greatest text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, least text collate pg_catalog.pg_c_utf8, place integer, ref text collate pg_catalog.pg_c_utf8);
create type p3.in_member_directed_pair as (holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, place integer, ref text collate pg_catalog.pg_c_utf8, source text collate pg_catalog.pg_c_utf8, target text collate pg_catalog.pg_c_utf8);
create type p3.in_member_point as (holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, place integer, ref text collate pg_catalog.pg_c_utf8, x numeric(825, 0), y numeric(825, 0));
create type p3.in_member_file as (content_type text collate pg_catalog.pg_c_utf8, digest text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, place integer, ref text collate pg_catalog.pg_c_utf8);
create type p3.in_member_file_name as (holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, name text collate pg_catalog.pg_c_utf8, place integer, ref text collate pg_catalog.pg_c_utf8);
create type p3.in_member_field_text as (base text collate pg_catalog.pg_c_utf8, field text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, ref text collate pg_catalog.pg_c_utf8, value text collate pg_catalog.pg_c_utf8);
create type p3.in_member_field_integer as (field text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, ref text collate pg_catalog.pg_c_utf8, value numeric(825, 0));
create type p3.in_member_field_float as (base text collate pg_catalog.pg_c_utf8, field text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, ref text collate pg_catalog.pg_c_utf8, value float8);
create type p3.in_member_field_boolean as (field text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, ref text collate pg_catalog.pg_c_utf8, value boolean);
create type p3.in_member_field_pair as (field text collate pg_catalog.pg_c_utf8, greatest text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, least text collate pg_catalog.pg_c_utf8, ref text collate pg_catalog.pg_c_utf8);
create type p3.in_member_field_directed_pair as (field text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, ref text collate pg_catalog.pg_c_utf8, source text collate pg_catalog.pg_c_utf8, target text collate pg_catalog.pg_c_utf8);
create type p3.in_member_field_point as (field text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, ref text collate pg_catalog.pg_c_utf8, x numeric(825, 0), y numeric(825, 0));
create type p3.in_member_field_file as (content_type text collate pg_catalog.pg_c_utf8, digest text collate pg_catalog.pg_c_utf8, field text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, ref text collate pg_catalog.pg_c_utf8);
create type p3.in_member_field_file_name as (field text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, name text collate pg_catalog.pg_c_utf8, ref text collate pg_catalog.pg_c_utf8);
-- The flat members' values, by base type: one row of each heading's array, the shape boundary.sql's p3.outcomes is.
create type p3.in_members as (bases p3.in_member_base[], booleans p3.in_member_boolean[], directed_pairs p3.in_member_directed_pair[],
  field_booleans p3.in_member_field_boolean[], field_directed_pairs p3.in_member_field_directed_pair[], field_file_names p3.in_member_field_file_name[], field_files p3.in_member_field_file[],
  field_floats p3.in_member_field_float[], field_integers p3.in_member_field_integer[], field_pairs p3.in_member_field_pair[],
  field_points p3.in_member_field_point[], field_texts p3.in_member_field_text[], file_names p3.in_member_file_name[],
  files p3.in_member_file[], floats p3.in_member_float[], integers p3.in_member_integer[],
  pairs p3.in_member_pair[], points p3.in_member_point[],
  texts p3.in_member_text[], vars p3.in_member_var[]);

-- A member's variables of one holds, as the machine's member_var rows: each declared one with its singles in place order,
-- a record's each named by its field, in field order; a variable with no single row is NULL. One single at a place, one
-- field of a name: the twin's statement fills each heading from the ledger's sidecars, keyed so.
create function p3.member_vars_of(h text, m p3.in_members) returns setof p3.member_var language sql immutable as $$
  with placed as (
    select v.ref, v.identifier, v.place, s_text(base => v.base, t => v.value) as x from unnest(m.texts) v where v.holds = h
    union all
    select v.ref, v.identifier, v.place, s_int(n => v.value) as x from unnest(m.integers) v where v.holds = h
    union all
    select v.ref, v.identifier, v.place, s_float(base => v.base, f => v.value) as x from unnest(m.floats) v where v.holds = h
    union all
    select v.ref, v.identifier, v.place, s_bool(b => v.value) as x from unnest(m.booleans) v where v.holds = h
    union all
    select v.ref, v.identifier, v.place, s_pair(a => v.least, b => v.greatest) as x from unnest(m.pairs) v where v.holds = h
    union all
    select v.ref, v.identifier, v.place, s_dpair(a => v.source, b => v.target) as x from unnest(m.directed_pairs) v where v.holds = h
    union all
    select v.ref, v.identifier, v.place, s_point(x => v.x, y => v.y) as x from unnest(m.points) v where v.holds = h
    union all
    select v.ref, v.identifier, v.place, s_file(digest => v.digest, content_type => v.content_type, filename => (select f.name from unnest(m.file_names) f
      where f.ref = v.ref and f.holds = h and f.identifier = v.identifier and f.place = v.place)) from unnest(m.files) v where v.holds = h
  ), fielded as (
    select v.ref, v.identifier, v.field, s_text(base => v.base, t => v.value) as x from unnest(m.field_texts) v where v.holds = h
    union all
    select v.ref, v.identifier, v.field, s_int(n => v.value) as x from unnest(m.field_integers) v where v.holds = h
    union all
    select v.ref, v.identifier, v.field, s_float(base => v.base, f => v.value) as x from unnest(m.field_floats) v where v.holds = h
    union all
    select v.ref, v.identifier, v.field, s_bool(b => v.value) as x from unnest(m.field_booleans) v where v.holds = h
    union all
    select v.ref, v.identifier, v.field, s_pair(a => v.least, b => v.greatest) as x from unnest(m.field_pairs) v where v.holds = h
    union all
    select v.ref, v.identifier, v.field, s_dpair(a => v.source, b => v.target) as x from unnest(m.field_directed_pairs) v where v.holds = h
    union all
    select v.ref, v.identifier, v.field, s_point(x => v.x, y => v.y) as x from unnest(m.field_points) v where v.holds = h
    union all
    select v.ref, v.identifier, v.field, s_file(digest => v.digest, content_type => v.content_type, filename => (select f.name from unnest(m.field_file_names) f
      where f.ref = v.ref and f.holds = h and f.identifier = v.identifier and f.field = v.field)) from unnest(m.field_files) v where v.holds = h
  )
  select (select b.base from unnest(m.bases) b where b.ref = d.ref and b.identifier = d.identifier), d.card, d.identifier, d.kind,
    d.ref, case when d.card = 'record'
      then array(select s_field(s => f.x, field => f.field) from fielded f where f.ref = d.ref and f.identifier = d.identifier order by f.field)
      else array(select p.x from placed p where p.ref = d.ref and p.identifier = d.identifier order by p.place) end
  from unnest(m.vars) d where d.holds = h
$$;
