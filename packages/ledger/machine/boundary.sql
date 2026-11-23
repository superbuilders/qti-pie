-- The machine's boundary to grizzle's queries: what a fused statement reads back from a run. FNNEST (grizzle) lets a
-- query read the rows(H) fields of a declared function's row(H) result as sources, and no NULL, so a run's values
-- leave the machine grouped by base type, each a value-only heading of non-null columns, mirroring the ledger's
-- typed sidecars (Snapshot<Shape><Type>): a value is its variable's rows, place by place (a multiple's singles in
-- their order, which the statement counts into its bag), a record's by field; NULL is no row. A file's filename is a
-- column of its row, as its digest and content type are: a file value is all three (QTI 3.0.1 §8.14). The one reshape from the machine's state to these is outcomes_of,
-- shared by every entry point (item response processing, template processing, test outcome processing).

create type p3.out_text as (base text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8,
  place integer, value text collate pg_catalog.pg_c_utf8);
create type p3.out_integer as (identifier text collate pg_catalog.pg_c_utf8, place integer, value numeric(825, 0));
create type p3.out_float as (base text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8,
  place integer, value float8);
create type p3.out_boolean as (identifier text collate pg_catalog.pg_c_utf8, place integer, value boolean);
create type p3.out_pair as (greatest text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8,
  least text collate pg_catalog.pg_c_utf8, place integer);
create type p3.out_directed_pair as (identifier text collate pg_catalog.pg_c_utf8, place integer,
  source text collate pg_catalog.pg_c_utf8, target text collate pg_catalog.pg_c_utf8);
create type p3.out_point as (identifier text collate pg_catalog.pg_c_utf8, place integer, x numeric(825, 0),
  y numeric(825, 0));
create type p3.out_file as (content_type text collate pg_catalog.pg_c_utf8, digest bytea,
  identifier text collate pg_catalog.pg_c_utf8, name text collate pg_catalog.pg_c_utf8, place integer);
-- A record's fields, one per name, by base type, as its relations: the same columns with the field for the place.
create type p3.out_field_text as (base text collate pg_catalog.pg_c_utf8, field text collate pg_catalog.pg_c_utf8,
  identifier text collate pg_catalog.pg_c_utf8, value text collate pg_catalog.pg_c_utf8);
create type p3.out_field_integer as (field text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8,
  value numeric(825, 0));
create type p3.out_field_float as (base text collate pg_catalog.pg_c_utf8, field text collate pg_catalog.pg_c_utf8,
  identifier text collate pg_catalog.pg_c_utf8, value float8);
create type p3.out_field_boolean as (field text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8,
  value boolean);
create type p3.out_field_pair as (field text collate pg_catalog.pg_c_utf8, greatest text collate pg_catalog.pg_c_utf8,
  identifier text collate pg_catalog.pg_c_utf8, least text collate pg_catalog.pg_c_utf8);
create type p3.out_field_directed_pair as (field text collate pg_catalog.pg_c_utf8,
  identifier text collate pg_catalog.pg_c_utf8, source text collate pg_catalog.pg_c_utf8, target text collate pg_catalog.pg_c_utf8);
create type p3.out_field_point as (field text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8,
  x numeric(825, 0), y numeric(825, 0));
create type p3.out_field_file as (content_type text collate pg_catalog.pg_c_utf8, digest bytea,
  field text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, name text collate pg_catalog.pg_c_utf8);
-- A run's values, by base type, and how it ended: a template constraint's restart never ends a run, so its flow is
-- exit or run; drawn is the draw stream's position, which a template run's next stage reads.
create type p3.out_values as (booleans p3.out_boolean[], directed_pairs p3.out_directed_pair[], drawn integer,
  field_booleans p3.out_field_boolean[], field_directed_pairs p3.out_field_directed_pair[], field_files p3.out_field_file[],
  field_floats p3.out_field_float[], field_integers p3.out_field_integer[], field_pairs p3.out_field_pair[],
  field_points p3.out_field_point[], field_texts p3.out_field_text[],
  files p3.out_file[], floats p3.out_float[], flow text collate pg_catalog.pg_c_utf8,
  integers p3.out_integer[], pairs p3.out_pair[], points p3.out_point[],
  texts p3.out_text[]);

-- The machine's state as its values by base type: every variable's singles, each at its place in the value (from 0),
-- a record's at its field; the one reshape every entry point's result goes through.
create function p3.outcomes_of(st p3.run_state) returns p3.out_values language sql immutable as $$
  with s as (
    select v.identifier, v.card, k - 1 as place, v.vals[k] as x
    from unnest(st.vars) v, generate_subscripts(v.vals, 1) k
  )
  select row(
    array(select row(identifier, place, (x).b)::out_boolean from s where card <> 'record' and (x).base = 'boolean' order by identifier, place),
    array(select row(identifier, place, (x).t, (x).u)::out_directed_pair from s where card <> 'record' and (x).base = 'directedPair' order by identifier, place),
    st.drawn,
    array(select row((x).field, identifier, (x).b)::out_field_boolean from s where card = 'record' and (x).base = 'boolean' order by identifier, (x).field),
    array(select row((x).field, identifier, (x).t, (x).u)::out_field_directed_pair from s where card = 'record' and (x).base = 'directedPair' order by identifier, (x).field),
    array(select row((x).u, (x).d, (x).field, identifier, (x).w)::out_field_file from s where card = 'record' and (x).base = 'file' order by identifier, (x).field),
    array(select row((x).base, (x).field, identifier, (x).f)::out_field_float from s where card = 'record' and (x).base in ('float', 'duration') order by identifier, (x).field),
    array(select row((x).field, identifier, (x).n)::out_field_integer from s where card = 'record' and (x).base = 'integer' order by identifier, (x).field),
    array(select row((x).field, (x).u, identifier, (x).t)::out_field_pair from s where card = 'record' and (x).base = 'pair' order by identifier, (x).field),
    array(select row((x).field, identifier, (x).n, (x).m)::out_field_point from s where card = 'record' and (x).base = 'point' order by identifier, (x).field),
    array(select row((x).base, (x).field, identifier, (x).t)::out_field_text from s where card = 'record' and (x).base in ('identifier', 'string', 'uri') order by identifier, (x).field),
    array(select row((x).u, (x).d, identifier, (x).w, place)::out_file from s where card <> 'record' and (x).base = 'file' order by identifier, place),
    array(select row((x).base, identifier, place, (x).f)::out_float from s where card <> 'record' and (x).base in ('float', 'duration') order by identifier, place),
    st.flow,
    array(select row(identifier, place, (x).n)::out_integer from s where card <> 'record' and (x).base = 'integer' order by identifier, place),
    array(select row((x).u, identifier, (x).t, place)::out_pair from s where card <> 'record' and (x).base = 'pair' order by identifier, place),
    array(select row(identifier, place, (x).n, (x).m)::out_point from s where card <> 'record' and (x).base = 'point' order by identifier, place), array(select row((x).base, identifier, place, (x).t)::out_text from s where card <> 'record' and (x).base in ('identifier', 'string', 'uri') order by identifier, place)
  )::out_values from (select 1) one
$$;

-- The machine's boundary from grizzle's queries: what a fused statement passes in as an item's variables, the mirror of
-- outcomes_of's headings with `holds` first, which of the attempt's values a row is: its value now (`value`), its
-- correct response in force (`correct`) or its default in force (`default`). A declared variable is its in_var row,
-- whatever it holds, so a variable with no single row is NULL; its base type is its own heading, which a record lacks
-- (Table 5.115.3). One single at a place, one field of a name: the statement fills each heading from the ledger's
-- sidecars, keyed so. IMPL-TESTOP's in_member_* headings are these with the member's item ref first.
create type p3.in_var as (card text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8);
create type p3.in_base as (base text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8);
create type p3.in_text as (base text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, place integer, value text collate pg_catalog.pg_c_utf8);
create type p3.in_integer as (holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, place integer, value numeric(825, 0));
create type p3.in_float as (base text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, place integer, value float8);
create type p3.in_boolean as (holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, place integer, value boolean);
create type p3.in_pair as (greatest text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, least text collate pg_catalog.pg_c_utf8, place integer);
create type p3.in_directed_pair as (holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, place integer, source text collate pg_catalog.pg_c_utf8, target text collate pg_catalog.pg_c_utf8);
create type p3.in_point as (holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, place integer, x numeric(825, 0), y numeric(825, 0));
create type p3.in_file as (content_type text collate pg_catalog.pg_c_utf8, digest bytea, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, name text collate pg_catalog.pg_c_utf8, place integer);
create type p3.in_field_text as (base text collate pg_catalog.pg_c_utf8, field text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, value text collate pg_catalog.pg_c_utf8);
create type p3.in_field_integer as (field text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, value numeric(825, 0));
create type p3.in_field_float as (base text collate pg_catalog.pg_c_utf8, field text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, value float8);
create type p3.in_field_boolean as (field text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, value boolean);
create type p3.in_field_pair as (field text collate pg_catalog.pg_c_utf8, greatest text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, least text collate pg_catalog.pg_c_utf8);
create type p3.in_field_directed_pair as (field text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, source text collate pg_catalog.pg_c_utf8, target text collate pg_catalog.pg_c_utf8);
create type p3.in_field_point as (field text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, x numeric(825, 0), y numeric(825, 0));
create type p3.in_field_file as (content_type text collate pg_catalog.pg_c_utf8, digest bytea, field text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, name text collate pg_catalog.pg_c_utf8);
-- An item's variables, flat, by base type: one row of each heading's array, the shape p3.out_values is.
create type p3.in_values as (bases p3.in_base[], booleans p3.in_boolean[], directed_pairs p3.in_directed_pair[], field_booleans p3.in_field_boolean[], field_directed_pairs p3.in_field_directed_pair[], field_files p3.in_field_file[], field_floats p3.in_field_float[], field_integers p3.in_field_integer[], field_pairs p3.in_field_pair[], field_points p3.in_field_point[], field_texts p3.in_field_text[], files p3.in_file[], floats p3.in_float[], integers p3.in_integer[], pairs p3.in_pair[], points p3.in_point[], texts p3.in_text[], vars p3.in_var[]);

-- An item's variables of one holds, as the machine's variables: each declared one with its singles in place order, a
-- record's each named by its field, in field order.
create function p3.vars_in(h text, i p3.in_values) returns setof p3.var language sql immutable as $$
  with placed as (
    select v.identifier, v.place, s_text(base => v.base, t => v.value) as x from unnest(i.texts) v where v.holds = h
    union all
    select v.identifier, v.place, s_int(n => v.value) as x from unnest(i.integers) v where v.holds = h
    union all
    select v.identifier, v.place, s_float(base => v.base, f => v.value) as x from unnest(i.floats) v where v.holds = h
    union all
    select v.identifier, v.place, s_bool(b => v.value) as x from unnest(i.booleans) v where v.holds = h
    union all
    select v.identifier, v.place, s_pair(a => v.least, b => v.greatest) as x from unnest(i.pairs) v where v.holds = h
    union all
    select v.identifier, v.place, s_dpair(a => v.source, b => v.target) as x from unnest(i.directed_pairs) v where v.holds = h
    union all
    select v.identifier, v.place, s_point(x => v.x, y => v.y) as x from unnest(i.points) v where v.holds = h
    union all
    select v.identifier, v.place, s_file(digest => v.digest, content_type => v.content_type, filename => v.name) from unnest(i.files) v where v.holds = h
  ), fielded as (
    select v.identifier, v.field, s_text(base => v.base, t => v.value) as x from unnest(i.field_texts) v where v.holds = h
    union all
    select v.identifier, v.field, s_int(n => v.value) as x from unnest(i.field_integers) v where v.holds = h
    union all
    select v.identifier, v.field, s_float(base => v.base, f => v.value) as x from unnest(i.field_floats) v where v.holds = h
    union all
    select v.identifier, v.field, s_bool(b => v.value) as x from unnest(i.field_booleans) v where v.holds = h
    union all
    select v.identifier, v.field, s_pair(a => v.least, b => v.greatest) as x from unnest(i.field_pairs) v where v.holds = h
    union all
    select v.identifier, v.field, s_dpair(a => v.source, b => v.target) as x from unnest(i.field_directed_pairs) v where v.holds = h
    union all
    select v.identifier, v.field, s_point(x => v.x, y => v.y) as x from unnest(i.field_points) v where v.holds = h
    union all
    select v.identifier, v.field, s_file(digest => v.digest, content_type => v.content_type, filename => v.name) from unnest(i.field_files) v where v.holds = h
  )
  select (select b.base from unnest(i.bases) b where b.identifier = d.identifier), d.card, d.identifier,
    case when d.card = 'record'
      then array(select s_field(s => f.x, field => f.field) from fielded f where f.identifier = d.identifier order by f.field)
      else array(select p.x from placed p where p.identifier = d.identifier order by p.place) end
  from unnest(i.vars) d where d.holds = h
$$;
