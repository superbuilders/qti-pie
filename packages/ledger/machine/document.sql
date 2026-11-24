-- The machine's flat entry (P4): one call runs response or template processing for every document a statement names,
-- each by itself, from the document's grader tree as pantry stores it and its values as the ledger holds them, and gives
-- back every document's values after its run (document-types.sql). A statement reaches it through FNNEST's
-- Compute.rowOf: every argument rows of a heading of values, every field of its result rows, no NULL either way. The
-- readers are the oracle's (the golden gate's harness calls the same functions over its stored tree), so the program, the inputs and
-- the declared values a statement's run starts from are read exactly as the golden proof reads them. Loads after
-- machine-eval.sql, boundary.sql and test-outcome-boundary.sql.

-- XML's white space (S: space, tab, line feed, carriage return) stripped at both ends.
create function p3.trim_xml(t text) returns text language sql immutable as $$ select btrim(t, E' \t\n\r') $$;
-- A lexical form read as a single of its base type, as plate's parseLexical reads it.
create function p3.parse(base text, lexical text) returns p3.single language plpgsql immutable as $$
declare parts text[];
begin
  case base
  -- An empty text is NULL (info, isNull: "empty containers and empty strings are both treated as NULL"): no single.
  when 'identifier', 'string', 'uri' then return case when lexical = '' then null else s_text(base => base, t => lexical) end;
  when 'file' then raise exception 'a file value has no lexical form to read; it is its content''s digest';
  when 'integer' then return s_int(n => lexical::numeric);
  when 'float', 'duration' then return s_float(base => base, f => case lexical when 'INF' then 'Infinity' when '-INF' then '-Infinity' else lexical end::float8);
  when 'boolean' then return s_bool(b => lexical in ('true', '1'));
  when 'pair', 'directedPair', 'point' then
    parts := regexp_split_to_array(lexical, '[ \t\n\r]+');
    case base
    when 'pair' then return s_pair(a => parts[1], b => parts[2]);
    when 'directedPair' then return s_dpair(a => parts[1], b => parts[2]);
    when 'point' then return s_point(x => parts[1]::numeric, y => parts[2]::numeric);
    end case;
  end case;
end $$;
-- A typed lexical value: every atomic XML Schema type but string fixes whiteSpace=collapse (Part 2 §4.3.6), so a
-- non-string value is read collapsed, its XML white space stripped at both ends and each inner run one space (spec
-- reading 7 as ruled; plate's typedLexicalOf); a string keeps its text. An absent value is no single.
create function p3.xml_single(base text, txt text) returns p3.single language sql immutable as $$
  select case when txt is not null
    then parse(base => base, lexical => case when base = 'string' then txt else regexp_replace(trim_xml(t => txt), '[ \t\n\r]+', ' ', 'g') end) end
$$;
create function p3.xs_boolean(dflt boolean, t text) returns boolean language sql immutable as
$$ select case when t is null then dflt else trim_xml(t => t) in ('true', '1') end $$;
-- An area's coordinates as written (HTML's image-map rules), each numbered from 1: QTI's coords less XML white space
-- at either end, split at its commas; none where it is empty or NULL. The walk's stored qti-inside coordinates
-- (packages/ledger/src/walks.ts, WalkAreaCoord) are its rows.
create function p3.coords_of(coords text) returns setof p3.coord language sql immutable as $$
  select row(x, o::int)::coord from unnest(case when trim_xml(t => coords) = '' then '{}'::float8[]
    else regexp_split_to_array(trim_xml(t => coords), '[ \t\n\r]*,[ \t\n\r]*')::float8[] end) with ordinality u(x, o)
$$;
-- An area's kind from QTI's shape and coords (HTML's image-map rules): the shape's, or nowhere where too few
-- coordinates, a radius of zero or less or fewer than three vertices hold no point; a default shape reads no
-- coordinate. The walk's stored qti-inside kind (WalkArea) is its value.
create function p3.area_kind_of(coords text, kind text) returns text language plpgsql immutable as $$
declare c float8[];
begin
  if trim_xml(t => kind) = 'default' then return 'everywhere'; end if;
  c := array(select x.c from coords_of(coords => coords) x order by x.place);
  case trim_xml(t => kind)
  when 'rect' then return case when cardinality(c) < 4 then 'nowhere' else 'rect' end;
  when 'circle' then return case when cardinality(c) < 3 or c[3] <= 0 then 'nowhere' else 'circle' end;
  when 'ellipse' then return case when cardinality(c) < 4 or c[3] <= 0 or c[4] <= 0 then 'nowhere' else 'ellipse' end;
  when 'poly' then return case when cardinality(c) / 2 < 3 then 'nowhere' else 'poly' end;
  end case;
end $$;

-- A program's walk from its stored rows (WalkNode and its sidecars, keyed by the nodes' stored starts in the run's
-- document): its nodes in document order, each numbered by its place (its start's rank among the program's), its end
-- the place past its last descendant, its parent's place (0 for the root), its kids the places of the nodes whose
-- parent it is, and each parameter at its node's place, a node of each kind given its kind's parameters, QTI's
-- documented defaults applied where its document omits them (the stored rows'): an IntegerOrVariableRef or
-- FloatOrVariableRef its literal row or its reference row, neither where it has no row; an equal's tolerance token
-- NULL where the tolerance has no 1 or 2 tokens; a base value's literal its typed row. Every row of the program, its
-- nodes', its kids' (keyed by the parent's start) and each parameter's, is one tagged row of one grouping by start, so
-- the walk is read in one pass whatever the rows' counts.
create function p3.walk_from(areas p3.doc_walk_area[], categories p3.doc_walk_category[], coords p3.doc_walk_coord[], customs p3.doc_walk_custom[], equals p3.doc_walk_equal[], filters p3.doc_walk_filter[], floats p3.doc_walk_float[], idents p3.doc_walk_ident[], integers p3.doc_walk_integer[], literal_booleans p3.doc_walk_literal_boolean[], literal_directed_pairs p3.doc_walk_literal_directed_pair[], literal_floats p3.doc_walk_literal_float[], literal_integers p3.doc_walk_literal_integer[], literal_pairs p3.doc_walk_literal_pair[], literal_points p3.doc_walk_literal_point[], literal_texts p3.doc_walk_literal_text[], names p3.doc_walk_name[], nodes p3.program_node[], package text, path text, patterns p3.doc_walk_pattern[], refs p3.doc_walk_ref[], rounds p3.doc_walk_round[], texts p3.doc_walk_text[]) returns p3.walk language sql immutable as $$
  with x as (select y.* from unnest(nodes) y where y.package = walk_from.package and y.path = walk_from.path),
  o as (select array_agg(x.start order by x.start) as starts from x),
  t as (
    select x.start, 'node' as tag, x.kind, x."end" as e, x.parent as par, null::int_ref as ir, null::float_ref as fr, null::text as v,
      null::boolean as b1, null::boolean as b2, null::single as lit, null::float8 as c, null::bigint as o, null::text as v2 from x
    union all select x.parent, 'kid', null, null, null, null, null, null, null, null, null, null, width_bucket(x.start, (select o.starts from o)), null from x
    union all select y.start, 'i:' || y.field, null, null, null, row(y.value, null)::int_ref, null, null, null, null, null, null, null, null
      from unnest(integers) y where y.package = walk_from.package and y.path = walk_from.path
    union all select y.start, 'f:' || y.field, null, null, null, null, row(y.value, null)::float_ref, null, null, null, null, null, null, null
      from unnest(floats) y where y.package = walk_from.package and y.path = walk_from.path
    union all select y.start, case when y.field = 'pattern' then 'ref:pattern' when y.field in ('equal.t0', 'equal.t1', 'frange.hi', 'frange.lo')
        then 'f:' || y.field else 'i:' || y.field end, null, null, null,
      case when y.field not in ('pattern', 'equal.t0', 'equal.t1', 'frange.hi', 'frange.lo') then row(null, y.ref)::int_ref end,
      case when y.field in ('equal.t0', 'equal.t1', 'frange.hi', 'frange.lo') then row(null, y.ref)::float_ref end, y.ref, null, null, null, null, null, null
      from unnest(refs) y where y.package = walk_from.package and y.path = walk_from.path
    union all select y.start, 'n:' || y.field, null, null, null, null, null, y.value, null, null, null, null, null, null
      from unnest(names) y where y.package = walk_from.package and y.path = walk_from.path
    union all select y.start, 'equal', null, null, null, null, null, y.mode, y.lower_in, y.upper_in, null, null, null, null
      from unnest(equals) y where y.package = walk_from.package and y.path = walk_from.path
    union all select y.start, 'round', null, null, null, null, null, y.mode, null, null, null, null, null, null
      from unnest(rounds) y where y.package = walk_from.package and y.path = walk_from.path
    union all select y.start, 'text', null, null, null, null, null, null, y.case_sensitive, y.substring, null, null, null, null
      from unnest(texts) y where y.package = walk_from.package and y.path = walk_from.path
    union all select y.start, 'ident', null, null, null, null, null, y.identifier, null, null, null, null, null, null
      from unnest(idents) y where y.package = walk_from.package and y.path = walk_from.path
    union all select y.start, 'custom', null, null, null, null, null, y.class, null, null, null, null, null, null
      from unnest(customs) y where y.package = walk_from.package and y.path = walk_from.path
    union all select y.start, 'program', null, null, null, null, null, y.program, null, null, null, null, null, null
      from unnest(patterns) y where y.package = walk_from.package and y.path = walk_from.path
    union all select y.start, 'area', null, null, null, null, null, y.kind, null, null, null, null, null, null
      from unnest(areas) y where y.package = walk_from.package and y.path = walk_from.path
    union all select y.start, 'coord', null, null, null, null, null, null, null, null, null, y.c, y.place, null
      from unnest(coords) y where y.package = walk_from.package and y.path = walk_from.path
    union all select y.start, 'category', null, null, null, null, null, y.category, null, null, null, null, y.place, y.filter
      from unnest(categories) y where y.package = walk_from.package and y.path = walk_from.path
    union all select y.start, 'filter', null, null, null, null, null, y.filter, null, null, null, null, null, null
      from unnest(filters) y where y.package = walk_from.package and y.path = walk_from.path
    union all select y.start, 'literal', null, null, null, null, null, null, null, null, s_text(base => y.base, t => y.value), null, null, null
      from unnest(literal_texts) y where y.package = walk_from.package and y.path = walk_from.path
    union all select y.start, 'literal', null, null, null, null, null, null, null, null, s_int(n => y.value), null, null, null
      from unnest(literal_integers) y where y.package = walk_from.package and y.path = walk_from.path
    union all select y.start, 'literal', null, null, null, null, null, null, null, null, s_float(base => y.base, f => y.value), null, null, null
      from unnest(literal_floats) y where y.package = walk_from.package and y.path = walk_from.path
    union all select y.start, 'literal', null, null, null, null, null, null, null, null, s_bool(b => y.value), null, null, null
      from unnest(literal_booleans) y where y.package = walk_from.package and y.path = walk_from.path
    union all select y.start, 'literal', null, null, null, null, null, null, null, null, s_pair(a => y.least, b => y.greatest), null, null, null
      from unnest(literal_pairs) y where y.package = walk_from.package and y.path = walk_from.path
    union all select y.start, 'literal', null, null, null, null, null, null, null, null, s_dpair(a => y.source, b => y.target), null, null, null
      from unnest(literal_directed_pairs) y where y.package = walk_from.package and y.path = walk_from.path
    union all select y.start, 'literal', null, null, null, null, null, null, null, null, s_point(x => y.x, y => y.y), null, null, null
      from unnest(literal_points) y where y.package = walk_from.package and y.path = walk_from.path
  ),
  g as (
    select t.start, max(t.kind) filter (where t.tag = 'node') as kind, max(t.e) filter (where t.tag = 'node') as e,
      max(t.par) filter (where t.tag = 'node') as par, array_agg(row(t.o::int)::child order by t.o) filter (where t.tag = 'kid') as kids,
      (array_agg(t.ir) filter (where t.tag = 'i:any_n.max'))[1] as amax, (array_agg(t.ir) filter (where t.tag = 'i:any_n.min'))[1] as amin,
      (array_agg(t.ir) filter (where t.tag = 'i:int.value'))[1] as ival, (array_agg(t.ir) filter (where t.tag = 'i:range.hi'))[1] as rhi,
      (array_agg(t.ir) filter (where t.tag = 'i:range.lo'))[1] as rlo, (array_agg(t.ir) filter (where t.tag = 'i:range.step'))[1] as rst,
      (array_agg(t.ir) filter (where t.tag = 'i:round.figures'))[1] as rfi,
      (array_agg(t.fr) filter (where t.tag = 'f:equal.t0'))[1] as t0, (array_agg(t.fr) filter (where t.tag = 'f:equal.t1'))[1] as t1,
      (array_agg(t.fr) filter (where t.tag = 'f:frange.hi'))[1] as fhi, (array_agg(t.fr) filter (where t.tag = 'f:frange.lo'))[1] as flo,
      max(t.v) filter (where t.tag = 'ref:pattern') as pref, max(t.v) filter (where t.tag = 'n:base') as nbase,
      max(t.v) filter (where t.tag = 'n:constant') as nconstant, max(t.v) filter (where t.tag = 'n:field') as nfield,
      max(t.v) filter (where t.tag = 'n:math') as nmath, max(t.v) filter (where t.tag = 'n:section') as nsection,
      max(t.v) filter (where t.tag = 'n:stat') as nstat, max(t.v) filter (where t.tag = 'n:weight') as nweight,
      bool_or(t.tag = 'equal') as has_equal, max(t.v) filter (where t.tag = 'equal') as eq_mode,
      bool_or(t.b1) filter (where t.tag = 'equal') as eq_lower, bool_or(t.b2) filter (where t.tag = 'equal') as eq_upper,
      max(t.v) filter (where t.tag = 'round') as round_mode,
      bool_or(t.b1) filter (where t.tag = 'text') as case_sensitive, bool_or(t.b2) filter (where t.tag = 'text') as substring,
      max(t.v) filter (where t.tag = 'ident') as ident, max(t.v) filter (where t.tag = 'custom') as class,
      max(t.v) filter (where t.tag = 'program') as program, max(t.v) filter (where t.tag = 'area') as area_kind,
      array_agg(row(t.c, t.o::int)::coord order by t.o) filter (where t.tag = 'coord') as coords,
      array_agg(t.v order by t.v2 = 'exclude', t.o) filter (where t.tag = 'category') as cat_names,
      array_agg(t.v2 order by t.v2 = 'exclude', t.o) filter (where t.tag = 'category') as cat_filters,
      array_agg(t.v order by t.v = 'exclude') filter (where t.tag = 'filter') as filter_names,
      (array_agg(t.lit) filter (where t.tag = 'literal'))[1] as lit, bool_or(t.tag = 'literal') as has_lit
    from t group by t.start having bool_or(t.tag = 'node')
  ),
  p as (
    select g.*, width_bucket(g.start, (select o.starts from o))::int as place, (width_bucket(g.e - 1, (select o.starts from o)) + 1)::int as pe,
      width_bucket(g.par, (select o.starts from o))::int as pp
    from g
  )
  select row(array(select row(
      case when p.kind = 'qti-any-n' then array[row(coalesce(p.amax, row(null, null)::int_ref), coalesce(p.amin, row(null, null)::int_ref), p.place)::p_any_n] else '{}' end,
      case when p.kind = 'qti-inside' then array[row(row(coalesce(p.coords, '{}'), p.area_kind)::area, p.place)::p_area] else '{}' end,
      case when p.kind = 'qti-test-variables' and p.nbase is not null then array[row(p.nbase, p.place)::p_base] else '{}' end,
      case when p.kind in ('qti-number-correct', 'qti-number-incorrect', 'qti-number-presented', 'qti-number-responded', 'qti-number-selected',
          'qti-outcome-minimum', 'qti-outcome-maximum', 'qti-test-variables') and p.cat_names is not null
        then array(select row(cn, cf, p.place)::p_category from unnest(p.cat_names, p.cat_filters) z(cn, cf)) else '{}' end,
      case when p.kind = 'qti-math-constant' then array[row(p.nconstant, p.place)::p_constant] else '{}' end,
      case when p.kind = 'qti-custom-operator' and p.class is not null then array[row(p.class, p.place)::p_custom] else '{}' end,
      p.pe,
      case when p.kind = 'qti-equal' then array[row(p.eq_lower, p.eq_mode, p.place, p.t0, p.t1, p.eq_upper)::p_equal] else '{}' end,
      case when p.kind = 'qti-field-value' then array[row(p.nfield, p.place)::p_field] else '{}' end,
      case when p.kind in ('qti-number-correct', 'qti-number-incorrect', 'qti-number-presented', 'qti-number-responded', 'qti-number-selected',
          'qti-outcome-minimum', 'qti-outcome-maximum', 'qti-test-variables') and p.filter_names is not null
        then array(select row(z, p.place)::p_filter from unnest(p.filter_names) z) else '{}' end,
      case when p.kind = 'qti-random-float' then array[row(coalesce(p.fhi, row(null, null)::float_ref), coalesce(p.flo, row(null, null)::float_ref), p.place)::p_frange] else '{}' end,
      case when p.kind in ('qti-variable', 'qti-correct', 'qti-default', 'qti-map-response', 'qti-map-response-point', 'qti-set-outcome-value',
          'qti-lookup-outcome-value', 'qti-set-template-value', 'qti-set-correct-response', 'qti-set-default-value',
          'qti-test-variables', 'qti-outcome-minimum', 'qti-outcome-maximum')
        then array[row(p.ident, p.place)::p_ident] else '{}' end,
      case when p.kind in ('qti-index', 'qti-repeat') then array[row(p.place, coalesce(p.ival, row(null, null)::int_ref))::p_int] else '{}' end,
      coalesce(p.kids, '{}'),
      p.kind,
      case when p.kind = 'qti-base-value' and p.has_lit then array[row(p.place, p.lit)::p_literal] else '{}' end,
      case when p.kind = 'qti-math-operator' then array[row(p.nmath, p.place)::p_math] else '{}' end,
      p.pp,
      case when p.kind = 'qti-pattern-match' then array[row(case when p.pref is null then p.program end, p.pref, p.place)::p_pattern] else '{}' end,
      case when p.kind = 'qti-random-integer'
        then array[row(coalesce(p.rhi, row(null, null)::int_ref), coalesce(p.rlo, row(null, null)::int_ref), p.place, coalesce(p.rst, row(null, null)::int_ref))::p_range] else '{}' end,
      case when p.kind in ('qti-equal-rounded', 'qti-round-to') then array[row(coalesce(p.rfi, row(null, null)::int_ref), p.round_mode, p.place)::p_round] else '{}' end,
      case when p.nsection is not null and p.kind in ('qti-number-correct', 'qti-number-incorrect', 'qti-number-presented',
          'qti-number-responded', 'qti-number-selected', 'qti-outcome-minimum', 'qti-outcome-maximum', 'qti-test-variables')
        then array[row(p.nsection, p.place)::p_section] else '{}' end,
      p.place,
      case when p.kind = 'qti-stats-operator' then array[row(p.nstat, p.place)::p_stat] else '{}' end,
      case when p.kind in ('qti-string-match', 'qti-substring') then array[row(p.case_sensitive, p.place, p.kind = 'qti-string-match' and p.substring)::p_text] else '{}' end,
      case when p.nweight is not null and p.kind in ('qti-variable', 'qti-outcome-minimum', 'qti-outcome-maximum', 'qti-test-variables')
        then array[row(p.place, p.nweight)::p_weight] else '{}' end)::walk_node
    from p order by p.place))::walk
$$;



-- A document's values of its declarations' base types, each at the start of the element that holds it (a map entry's
-- key, a table entry's target, a table's default), from their stored rows, typed by their base type at the package's
-- publication (packages/ledger/src/stored-content.ts, the DeclaredValue relations): one single each.
create type p3.node_value as (start bigint, value p3.single);
create function p3.node_values(package text, path text, value_booleans p3.doc_value_boolean[],
  value_directed_pairs p3.doc_value_directed_pair[], value_floats p3.doc_value_float[], value_integers p3.doc_value_integer[],
  value_pairs p3.doc_value_pair[], value_points p3.doc_value_point[], value_texts p3.doc_value_text[])
returns setof p3.node_value language sql immutable as $$
  select z.start, s_text(base => z.base, t => z.value) from unnest(value_texts) z where (z.package, z.path) = (node_values.package, node_values.path)
  union all select z.start, s_int(n => z.value) from unnest(value_integers) z where (z.package, z.path) = (node_values.package, node_values.path)
  union all select z.start, s_float(base => z.base, f => z.value) from unnest(value_floats) z where (z.package, z.path) = (node_values.package, node_values.path)
  union all select z.start, s_bool(b => z.value) from unnest(value_booleans) z where (z.package, z.path) = (node_values.package, node_values.path)
  union all select z.start, s_pair(a => z.least, b => z.greatest) from unnest(value_pairs) z where (z.package, z.path) = (node_values.package, node_values.path)
  union all select z.start, s_dpair(a => z.source, b => z.target) from unnest(value_directed_pairs) z
    where (z.package, z.path) = (node_values.package, node_values.path)
  union all select z.start, s_point(x => z.x, y => z.y) from unnest(value_points) z where (z.package, z.path) = (node_values.package, node_values.path)
$$;
-- A document's area map entries from their stored rows: each its area, its stored kind and coordinates in order, at its
-- place among its declaration's entries (its start's rank).
create function p3.area_entries_of(area_coords p3.doc_area_coord[], area_entries p3.doc_area_entry[], package text, path text)
returns setof p3.area_entry language sql immutable as $$
  select row(array(select row(c.c, c.place)::coord from unnest(area_coords) c where (c.package, c.path, c.start) = (e.package, e.path, e.start)
      order by c.place), e.kind)::area,
    e.identifier, row_number() over (partition by e.identifier order by e.start)::int, e.value
  from unnest(area_entries) e where (e.package, e.path) = (area_entries_of.package, area_entries_of.path)
$$;
-- A document's mappings, area mappings and lookup tables, the machine's inputs, from their stored rows, keyed by the
-- document (doc_mapping and its siblings, document-types.sql): every entry at its place among its declaration's (its
-- start's rank), a map entry with no key and a table entry with no target, and a table with no default, as the value
-- at its start gives them.
create function p3.inputs_of(area_coords p3.doc_area_coord[], area_entries p3.doc_area_entry[], area_mappings p3.doc_mapping[],
  interpolation_entries p3.doc_interpolation_entry[], lookups p3.doc_lookup[], map_entries p3.doc_map_entry[], mappings p3.doc_mapping[],
  match_entries p3.doc_match_entry[], package text, path text, value_booleans p3.doc_value_boolean[],
  value_directed_pairs p3.doc_value_directed_pair[], value_floats p3.doc_value_float[], value_integers p3.doc_value_integer[],
  value_pairs p3.doc_value_pair[], value_points p3.doc_value_point[], value_texts p3.doc_value_text[])
returns p3.inputs language sql immutable as $$
  with v as materialized (
    select x.* from node_values(package => inputs_of.package, path => inputs_of.path, value_booleans => value_booleans,
      value_directed_pairs => value_directed_pairs, value_floats => value_floats, value_integers => value_integers,
      value_pairs => value_pairs, value_points => value_points, value_texts => value_texts) x
  )
  select row(
    array(select a from area_entries_of(area_coords => area_coords, area_entries => area_entries, package => inputs_of.package, path => inputs_of.path) a
      order by a.identifier, a.place),
    array(select row(m.dflt, m.identifier, m.lower, m.upper)::mapping from unnest(area_mappings) m
      where (m.package, m.path) = (inputs_of.package, inputs_of.path) order by m.identifier),
    -- The registry's rows, and an attempt's evaluated applications and replies, are the flat entry's to add (with_registry).
    '{}'::table_binding[], '{}'::application[], '{}'::human_value[],
    array(select row(e.boundary, e.identifier, e.place, e.source, array(select v.value from v where v.start = e.start))::interp_entry
      from (select y.*, row_number() over (partition by y.identifier order by y.start)::int as place from unnest(interpolation_entries) y
        where (y.package, y.path) = (inputs_of.package, inputs_of.path)) e order by e.identifier, e.place),
    array(select row(array(select v.value from v where v.start = t.start), t.identifier, t.kind)::lookup_table from unnest(lookups) t
      where (t.package, t.path) = (inputs_of.package, inputs_of.path) order by t.identifier),
    array(select row(e.case_sensitive, e.identifier, v.value, e.place, e.value)::map_entry
      from (select y.*, row_number() over (partition by y.identifier order by y.start)::int as place from unnest(map_entries) y
        where (y.package, y.path) = (inputs_of.package, inputs_of.path)) e join v on v.start = e.start order by e.identifier, e.place),
    array(select row(m.dflt, m.identifier, m.lower, m.upper)::mapping from unnest(mappings) m
      where (m.package, m.path) = (inputs_of.package, inputs_of.path) order by m.identifier),
    array(select row(e.identifier, e.place, e.source, array(select v.value from v where v.start = e.start))::match_entry
      from (select y.*, row_number() over (partition by y.identifier order by y.start)::int as place from unnest(match_entries) y
        where (y.package, y.path) = (inputs_of.package, inputs_of.path)) e order by e.identifier, e.place),
    -- An item's run holds no test field; a test's run adds them (test-document.sql's test_outcome_processing_of).
    '{}'::member_bound[], '{}'::member_var[], '{}'::member_var[], '{}'::member_var[], '{}'::member[],
    '{}'::ref_category[], '{}'::ref_mapping[], '{}'::ref_section[], '{}'::ref_weight[],
    '{}'::reply[], '{}'::table_entry[], '{}'::table_value[]
  )::inputs
$$;

-- A document's declarations of one kind, as the machine's variables: each with its declared type and its value at a
-- child element of the declaration (qti-default-value or qti-correct-response), empty where it has none. A qti-value is
-- xs:normalizedString (ValueDType): its TAB, LF and CR read as spaces, nothing trimmed, as pantry stores it
-- (SV-VALUE-01). A record's values each name their field and are read in their own base type (Table 5.115.3: a record
-- has none of its own).
create function p3.declared(attributes p3.document_attribute[], declarations p3.declaration_node[], holder text,
  kind text, texts p3.document_text[])
returns setof p3.var language sql immutable as $$
  with a as (
    select y.start,
      max(y.value) filter (where y.name = 'identifier') as identifier,
      max(y.value) filter (where y.name = 'base-type') as base_type,
      max(y.value) filter (where y.name = 'cardinality') as cardinality,
      max(y.value) filter (where y.name = 'field-identifier') as field_identifier
    from unnest(attributes) y group by y.start
  ), d as (
    select x.start, trim_xml(t => a.identifier) as id, trim_xml(t => a.base_type) as base, trim_xml(t => a.cardinality) as card
    from unnest(declarations) x join a on a.start = x.start where x.kind = declared.kind
  ), v as materialized (
    select d.start as decl, w.start, case when d.card = 'record'
        then s_field(s => xml_single(base => trim_xml(t => wa.base_type), txt => translate(t.text, E'\t\n\r', '   ')), field => trim_xml(t => wa.field_identifier))
        else xml_single(base => d.base, txt => translate(t.text, E'\t\n\r', '   ')) end as x
    from d join unnest(declarations) h on h.parent = d.start and h.kind = declared.holder
      join unnest(declarations) w on w.parent = h.start and w.kind = 'qti-value'
      join unnest(texts) t on t.start = w.start left join a wa on wa.start = w.start
  )
  select d.base, d.card, d.id,
    coalesce((select array_agg(v.x order by v.start) from v where v.decl = d.start and (v.x).base is not null), '{}')
  from d
$$;

-- QTI's built-in context record, QTI_CONTEXT: the host gives no context, so it is the NULL record.
create function p3.qti_context() returns p3.var language sql immutable as $$ select row(null, 'record', 'QTI_CONTEXT', '{}')::var $$;
-- QTI's built-in session variables, as the typed rows a declaration would give them (QTI 3.0.1 §2.2.2.2: "two built-in
-- response variables: 'numAttempts' and 'duration'", §2.2.2.3 the built-in outcome 'completionStatus').
create function p3.builtin_responses() returns setof p3.var language sql immutable as $$
  select * from (values ('integer'::text, 'single'::text, 'numAttempts'::text, '{}'::single[]), ('float', 'single', 'duration', '{}')) b
$$;
create function p3.builtin_outcomes() returns setof p3.var language sql immutable as $$
  select 'identifier'::text, 'single'::text, 'completionStatus'::text, '{}'::single[]
$$;
-- Each variable a document's run holds and the kind of declaration it is of, a built-in under its own kind's: the
-- document's stored kinds (doc_var_kind: an item's the ledger's SessionVariableName, its declared variables and its
-- built-in session variables; a test's its declarations' and its built-ins'), and QTI_CONTEXT, the built-in context
-- record (qti_context).
create type p3.var_kind as (identifier text collate pg_catalog.pg_c_utf8, kind text collate pg_catalog.pg_c_utf8);
create function p3.kinds_of(kinds p3.doc_var_kind[], package text, path text) returns setof p3.var_kind language sql immutable as $$
  select k.identifier, k.kind from unnest(kinds) k where (k.package, k.path) = (kinds_of.package, kinds_of.path)
  union all select (qti_context()).identifier, 'context'
$$;
-- Variables with those of them given replaced by the given ones of the same identifier, then every given one no
-- declared one names.
create function p3.overridden(declared p3.var[], given p3.var[]) returns setof p3.var language sql immutable as $$
  select (coalesce((select g from unnest(given) g where g.identifier = d.identifier), d)).* from unnest(declared) d
  union all select g.* from unnest(given) g where not exists (select 1 from unnest(declared) d where d.identifier = g.identifier)
$$;

create type p3.var_type as (base text collate pg_catalog.pg_c_utf8, card text collate pg_catalog.pg_c_utf8,
  identifier text collate pg_catalog.pg_c_utf8, kind text collate pg_catalog.pg_c_utf8);
-- Each variable a document's run may hold, by its declaration (its base type, none for a record's, its cardinality and
-- the kind of declaration it is of), and the built-ins, by QTI's (builtin_responses, builtin_outcomes, qti_context).
create function p3.var_types(attributes p3.document_attribute[], declarations p3.declaration_node[]) returns setof p3.var_type
language sql immutable as $$
  with a as (
    select y.start, max(y.value) filter (where y.name = 'identifier') as identifier, max(y.value) filter (where y.name = 'base-type') as base_type,
      max(y.value) filter (where y.name = 'cardinality') as cardinality
    from unnest(attributes) y group by y.start
  )
  select trim_xml(t => a.base_type), trim_xml(t => a.cardinality), trim_xml(t => a.identifier), case d.kind when 'qti-response-declaration' then 'response'
      when 'qti-outcome-declaration' then 'outcome' when 'qti-template-declaration' then 'template' when 'qti-context-declaration' then 'context' end
  from unnest(declarations) d join a on a.start = d.start
  where d.kind in ('qti-response-declaration', 'qti-outcome-declaration', 'qti-template-declaration', 'qti-context-declaration')
  union all select b.base, b.card, b.identifier, 'response' from builtin_responses() b
  union all select b.base, b.card, b.identifier, 'outcome' from builtin_outcomes() b
  union all select q.base, q.card, q.identifier, 'context' from (select (qti_context()).*) q
$$;
-- One session's values, as boundary.sql's in_values: the rows of its key, (child, package, path, stage): a run's, or a
-- test member's item session in the run's sitting. Each value row is its count's copies, at places from its own; each
-- variable given is a doc_given row, every declared response (held `value`, NULL where no row holds a value of it) but
-- in a run submitted at its defaults, or numAttempts where an integer row holds it; each typed by its document's
-- declaration (var_types).
create function p3.values_of(booleans p3.doc_boolean[], child text, declaration_attributes p3.document_attribute[],
  declarations p3.declaration_node[], defaulted boolean, directed_pairs p3.doc_directed_pair[], field_booleans p3.doc_field_boolean[], field_directed_pairs p3.doc_field_directed_pair[],
  field_files p3.doc_field_file[], field_floats p3.doc_field_float[], field_integers p3.doc_field_integer[],
  field_pairs p3.doc_field_pair[], field_points p3.doc_field_point[], field_texts p3.doc_field_text[],
  files p3.doc_file[], floats p3.doc_float[], integers p3.doc_integer[],
  package text, pairs p3.doc_pair[], path text,
  points p3.doc_point[], stage bigint, texts p3.doc_text[], vars p3.doc_given[])
returns p3.in_values language sql immutable as $$
  with t as (select x.* from var_types(attributes => declaration_attributes, declarations => declarations) x),
  given as (
    select x.holds, x.identifier from unnest(vars) x where (x.child, x.package, x.path, x.stage) = (values_of.child, values_of.package, values_of.path, values_of.stage)
    union select 'value', t.identifier from t where not defaulted and t.kind = 'response' and t.identifier not in (select b.identifier from builtin_responses() b)
    union select 'value', 'numAttempts' where exists (select 1 from unnest(integers) x
      where (x.child, x.package, x.path, x.stage) = (values_of.child, values_of.package, values_of.path, values_of.stage) and x.holds = 'value' and x.identifier = 'numAttempts')
  )
  select row(
    array(select row(t.base, t.identifier)::in_base from t where t.base is not null),
    array(select row(x.holds, x.identifier, x.at + c, x.value)::in_boolean from (select y.*, (sum(y.count) over (partition by y.holds, y.identifier order by y.place, y.value rows between unbounded preceding and current row) - y.count)::integer as at
      from unnest(booleans) y where (y.child, y.package, y.path, y.stage) = (values_of.child, values_of.package, values_of.path, values_of.stage)) x, generate_series(0, x.count - 1) c),
    array(select row(x.holds, x.identifier, x.at + c, x.source, x.target)::in_directed_pair from (select y.*, (sum(y.count) over (partition by y.holds, y.identifier order by y.place, y.source, y.target rows between unbounded preceding and current row) - y.count)::integer as at
      from unnest(directed_pairs) y where (y.child, y.package, y.path, y.stage) = (values_of.child, values_of.package, values_of.path, values_of.stage)) x, generate_series(0, x.count - 1) c),
    array(select row(x.field, x.holds, x.identifier, x.value)::in_field_boolean from unnest(field_booleans) x where (x.child, x.package, x.path, x.stage) = (values_of.child, values_of.package, values_of.path, values_of.stage)),
    array(select row(x.field, x.holds, x.identifier, x.source, x.target)::in_field_directed_pair from unnest(field_directed_pairs) x where (x.child, x.package, x.path, x.stage) = (values_of.child, values_of.package, values_of.path, values_of.stage)),
    array(select row(x.content_type, x.digest, x.field, x.holds, x.identifier, x.name)::in_field_file from unnest(field_files) x where (x.child, x.package, x.path, x.stage) = (values_of.child, values_of.package, values_of.path, values_of.stage)),
    array(select row(x.base, x.field, x.holds, x.identifier, x.value)::in_field_float from unnest(field_floats) x where (x.child, x.package, x.path, x.stage) = (values_of.child, values_of.package, values_of.path, values_of.stage)),
    array(select row(x.field, x.holds, x.identifier, x.value)::in_field_integer from unnest(field_integers) x where (x.child, x.package, x.path, x.stage) = (values_of.child, values_of.package, values_of.path, values_of.stage)),
    array(select row(x.field, x.greatest, x.holds, x.identifier, x.least)::in_field_pair from unnest(field_pairs) x where (x.child, x.package, x.path, x.stage) = (values_of.child, values_of.package, values_of.path, values_of.stage)),
    array(select row(x.field, x.holds, x.identifier, x.x, x.y)::in_field_point from unnest(field_points) x where (x.child, x.package, x.path, x.stage) = (values_of.child, values_of.package, values_of.path, values_of.stage)),
    array(select row(x.base, x.field, x.holds, x.identifier, x.value)::in_field_text from unnest(field_texts) x where (x.child, x.package, x.path, x.stage) = (values_of.child, values_of.package, values_of.path, values_of.stage)),
    array(select row(x.content_type, x.digest, x.holds, x.identifier, x.name, x.at + c)::in_file from (select y.*, (sum(y.count) over (partition by y.holds, y.identifier order by y.place, y.digest, y.content_type, y.name rows between unbounded preceding and current row) - y.count)::integer as at
      from unnest(files) y where (y.child, y.package, y.path, y.stage) = (values_of.child, values_of.package, values_of.path, values_of.stage)) x, generate_series(0, x.count - 1) c),
    array(select row(x.base, x.holds, x.identifier, x.at + c, x.value)::in_float from (select y.*, (sum(y.count) over (partition by y.holds, y.identifier order by y.place, y.base, y.value rows between unbounded preceding and current row) - y.count)::integer as at
      from unnest(floats) y where (y.child, y.package, y.path, y.stage) = (values_of.child, values_of.package, values_of.path, values_of.stage)) x, generate_series(0, x.count - 1) c),
    array(select row(x.holds, x.identifier, x.at + c, x.value)::in_integer from (select y.*, (sum(y.count) over (partition by y.holds, y.identifier order by y.place, y.value rows between unbounded preceding and current row) - y.count)::integer as at
      from unnest(integers) y where (y.child, y.package, y.path, y.stage) = (values_of.child, values_of.package, values_of.path, values_of.stage)) x, generate_series(0, x.count - 1) c),
    array(select row(x.greatest, x.holds, x.identifier, x.least, x.at + c)::in_pair from (select y.*, (sum(y.count) over (partition by y.holds, y.identifier order by y.place, y.least, y.greatest rows between unbounded preceding and current row) - y.count)::integer as at
      from unnest(pairs) y where (y.child, y.package, y.path, y.stage) = (values_of.child, values_of.package, values_of.path, values_of.stage)) x, generate_series(0, x.count - 1) c),
    array(select row(x.holds, x.identifier, x.at + c, x.x, x.y)::in_point from (select y.*, (sum(y.count) over (partition by y.holds, y.identifier order by y.place, y.x, y.y rows between unbounded preceding and current row) - y.count)::integer as at
      from unnest(points) y where (y.child, y.package, y.path, y.stage) = (values_of.child, values_of.package, values_of.path, values_of.stage)) x, generate_series(0, x.count - 1) c),
    array(select row(x.base, x.holds, x.identifier, x.at + c, x.value)::in_text from (select y.*, (sum(y.count) over (partition by y.holds, y.identifier order by y.place, y.base, y.value rows between unbounded preceding and current row) - y.count)::integer as at
      from unnest(texts) y where (y.child, y.package, y.path, y.stage) = (values_of.child, values_of.package, values_of.path, values_of.stage)) x, generate_series(0, x.count - 1) c),
    array(select row(t.card, g.holds, g.identifier)::in_var from given g left join t on t.identifier = g.identifier)
  )::in_values
$$;

-- Whether two values of one cardinality are one value, exactly, as the ledger holds a value: a single's fields each as
-- it is, a text by its code points, a float by its bits (every NaN one, grizzle's Num.floatBits, so -0 is not 0); a
-- multiple as a bag and a record as its fields, each once by name, in any order; an ordered value place by place. NULL,
-- no single, is one value with NULL alone. Never a comparison QTI defines (`match` compares a float by value).
create function p3.held_identical(a p3.single[], b p3.single[], card text) returns boolean language sql immutable as $$
  with x as (
    select case when card = 'ordered' then z.ordinality else 0 end as k, z.b, z.base, z.d,
      case when z.f = 'NaN' then '\x7ff8000000000000'::bytea else float8send(z.f) end as f, z.field, z.m, z.n, z.t, z.u, z.w
    from unnest(a) with ordinality z
  ), y as (
    select case when card = 'ordered' then z.ordinality else 0 end as k, z.b, z.base, z.d,
      case when z.f = 'NaN' then '\x7ff8000000000000'::bytea else float8send(z.f) end as f, z.field, z.m, z.n, z.t, z.u, z.w
    from unnest(b) with ordinality z
  )
  select cardinality(a) = cardinality(b) and not exists (select * from x except all select * from y)
$$;

-- One run's values after it, as the flat result's rows, each keyed by the run: its variables (held `value`) and, where
-- `delta`, only what the run set: each variable, correct response and default in force (held `value`, `correct` and
-- `default`) whose value is not the one the run began with (held_identical over the state's `declared`,
-- `declared_correct` and `declared_defaults`, a variable the run began without beginning NULL), so a rule that sets a
-- value to itself sets nothing, one that sets NULL over a value gives the variable with no single, and the contexts,
-- QTI_CONTEXT and the built-ins appear only where a rule set them; each variable with its kind; and how it ended. Each
-- value's singles at their places from 0, each a copy (count 1), a record's at its fields, as outcomes_of gives them.
create function p3.doc_values_of(delta boolean, kinds p3.var_kind[], run p3.document_run, st p3.run_state)
returns p3.doc_values language sql immutable as $$
  with v as (
    select 'value'::text as holds, x.identifier, x.base, x.card, x.vals from unnest(st.vars) x
    where not delta or not held_identical(a => x.vals, card => x.card,
      b => coalesce((select d.vals from unnest(st.declared) d where d.identifier = x.identifier), '{}'))
    union all select 'correct', x.identifier, x.base, x.card, x.vals from unnest(st.correct) x
    where delta and not held_identical(a => x.vals, card => x.card,
      b => coalesce((select d.vals from unnest(st.declared_correct) d where d.identifier = x.identifier), '{}'))
    union all select 'default', x.identifier, x.base, x.card, x.vals from unnest(st.defaults) x
    where delta and not held_identical(a => x.vals, card => x.card,
      b => coalesce((select d.vals from unnest(st.declared_defaults) d where d.identifier = x.identifier), '{}'))
  ), s as (
    select v.holds, v.identifier, v.card, k - 1 as place, v.vals[k] as x from v, generate_subscripts(v.vals, 1) k
  )
  select row(
    array(select d.b from (select distinct row(v.base, (run).child, v.identifier, (run).package, (run).path, (run).stage)::doc_base as b from v where v.card <> 'record') d
      order by (d.b).identifier),
    array(select row((run).child, 1, holds, identifier, (run).package, (run).path, place, (run).stage, (x).b)::doc_boolean from s where card <> 'record' and (x).base = 'boolean'),
    '{}'::doc_demand_maximum[], '{}'::doc_demand[],
    array(select row((run).child, 1, holds, identifier, (run).package, (run).path, place, (x).t, (run).stage, (x).u)::doc_directed_pair from s where card <> 'record' and (x).base = 'directedPair'),
    array[row((run).child, st.drawn, st.flow, (run).package, (run).path, (run).stage)::doc_end],
    array(select row((run).child, (x).field, holds, identifier, (run).package, (run).path, (run).stage, (x).b)::doc_field_boolean from s where card = 'record' and (x).base = 'boolean'),
    array(select row((run).child, (x).field, holds, identifier, (run).package, (run).path, (x).t, (run).stage, (x).u)::doc_field_directed_pair from s where card = 'record' and (x).base = 'directedPair'),
    array(select row((run).child, (x).u, (x).d, (x).field, holds, identifier, (x).w, (run).package, (run).path, (run).stage)::doc_field_file from s where card = 'record' and (x).base = 'file'),
    array(select row((x).base, (run).child, (x).field, holds, identifier, (run).package, (run).path, (run).stage, (x).f)::doc_field_float from s where card = 'record' and (x).base in ('float', 'duration')),
    array(select row((run).child, (x).field, holds, identifier, (run).package, (run).path, (run).stage, (x).n)::doc_field_integer from s where card = 'record' and (x).base = 'integer'),
    array(select row((run).child, (x).field, (x).u, holds, identifier, (x).t, (run).package, (run).path, (run).stage)::doc_field_pair from s where card = 'record' and (x).base = 'pair'),
    array(select row((run).child, (x).field, holds, identifier, (run).package, (run).path, (run).stage, (x).n, (x).m)::doc_field_point from s where card = 'record' and (x).base = 'point'),
    array(select row((x).base, (run).child, (x).field, holds, identifier, (run).package, (run).path, (run).stage, (x).t)::doc_field_text from s where card = 'record' and (x).base in ('identifier', 'string', 'uri')),
    array(select row((run).child, (x).u, 1, (x).d, holds, identifier, (x).w, (run).package, (run).path, place, (run).stage)::doc_file from s where card <> 'record' and (x).base = 'file'),
    array(select row((x).base, (run).child, 1, holds, identifier, (run).package, (run).path, place, (run).stage, (x).f)::doc_float from s where card <> 'record' and (x).base in ('float', 'duration')),
    '{}'::doc_human_demand_maximum[], '{}'::doc_human_demand[],
    array(select row((run).child, 1, holds, identifier, (run).package, (run).path, place, (run).stage, (x).n)::doc_integer from s where card <> 'record' and (x).base = 'integer'),
    array(select row((run).child, 1, (x).u, holds, identifier, (x).t, (run).package, (run).path, place, (run).stage)::doc_pair from s where card <> 'record' and (x).base = 'pair'),
    array(select row((run).child, 1, holds, identifier, (run).package, (run).path, place, (run).stage, (x).n, (x).m)::doc_point from s where card <> 'record' and (x).base = 'point'),
    array(select row((x).base, (run).child, 1, holds, identifier, (run).package, (run).path, place, (run).stage, (x).t)::doc_text from s where card <> 'record' and (x).base in ('identifier', 'string', 'uri')),
    array(select row(v.card, (run).child, v.holds, v.identifier, (select k.kind from unnest(kinds) k where k.identifier = v.identifier), (run).package, (run).path, (run).stage)::doc_var from v)
  )::doc_values
$$;
-- Two results as one: each field's rows, the first's then the second's.
create function p3.doc_values_joined(a p3.doc_values, b p3.doc_values) returns p3.doc_values language sql immutable as $$
  select row(a.bases || b.bases, a.booleans || b.booleans, a.demand_maxima || b.demand_maxima, a.demands || b.demands, a.directed_pairs || b.directed_pairs, a.ends || b.ends, a.field_booleans || b.field_booleans,
    a.field_directed_pairs || b.field_directed_pairs, a.field_files || b.field_files, a.field_floats || b.field_floats, a.field_integers || b.field_integers,
    a.field_pairs || b.field_pairs, a.field_points || b.field_points, a.field_texts || b.field_texts,
    a.files || b.files, a.floats || b.floats, a.human_demand_maxima || b.human_demand_maxima, a.human_demands || b.human_demands,
    a.integers || b.integers, a.pairs || b.pairs, a.points || b.points,
    a.texts || b.texts, a.vars || b.vars)::doc_values
$$;
-- No document's values.
create function p3.no_doc_values() returns p3.doc_values language sql immutable as $$
  select row('{}'::doc_base[], '{}'::doc_boolean[], '{}'::doc_demand_maximum[], '{}'::doc_demand[], '{}'::doc_directed_pair[], '{}'::doc_end[], '{}'::doc_field_boolean[], '{}'::doc_field_directed_pair[],
    '{}'::doc_field_file[], '{}'::doc_field_float[], '{}'::doc_field_integer[], '{}'::doc_field_pair[],
    '{}'::doc_field_point[], '{}'::doc_field_text[], '{}'::doc_file[],
    '{}'::doc_float[], '{}'::doc_human_demand_maximum[], '{}'::doc_human_demand[], '{}'::doc_integer[], '{}'::doc_pair[], '{}'::doc_point[],
    '{}'::doc_text[], '{}'::doc_var[])::doc_values
$$;

-- A document's defaults in force: its responses', outcomes' and template variables' declared ones and the built-ins',
-- each overridden by one given held `default` (the session's template processing set it).
create function p3.defaults_of(attributes p3.document_attribute[], declarations p3.declaration_node[], given p3.in_values,
  texts p3.document_text[])
returns setof p3.var language sql immutable as $$
  select x.* from overridden(
    declared => array(select y from declared(declarations => declarations, attributes => attributes, texts => texts, kind => 'qti-response-declaration', holder => 'qti-default-value') y)
      || array(select y from declared(declarations => declarations, attributes => attributes, texts => texts, kind => 'qti-outcome-declaration', holder => 'qti-default-value') y)
      || array(select y from declared(declarations => declarations, attributes => attributes, texts => texts, kind => 'qti-template-declaration', holder => 'qti-default-value') y)
      || array(select y from builtin_responses() y) || array(select y from builtin_outcomes() y),
    given => array(select y from vars_in(i => given, h => 'default') y)) x
$$;
-- A document's variables as a run starts from them: its outcomes at their defaults in force, the declared ones each
-- overridden by a default given held `default` (template processing's qti-set-default-value sets "the response variable
-- or outcome variable to have its default value set", Table 6.51), a numeric single with none at 0 (Table 4.5:
-- "initialized to NULL unless the outcome is of a numeric type (integer or float) in which case it is initialized to
-- 0", test-outcome.sql's `initial`), and completionStatus at
-- `unknown` (its value "at the start of the first attempt", which "remains with this value for the duration of the item
-- session unless set to a different value", info §2.2.2.3: a later attempt is given the session's), its template
-- variables at their declared defaults, its response variables at their defaults in force (defaults_of: the session's
-- template-set default, else the declared one, else NULL; "if a default value has been provided for a response
-- variable then the variable is set to this value at the start of the first attempt", info, Response Variables, so a
-- response submitted at its default, QTI 3.0.1 Table 7.19.6, is one the attempt gives no value of; a session never
-- attempted, numAttempts 0, keeps them NULL: "If the candidate never attempts the item … the response variable remains
-- NULL and the default value is never used", Table 5.115), each overridden by
-- a value given held `value` (the posted responses, the
-- session's template values, numAttempts, the session's completionStatus after its last attempt, an adaptive item's
-- outcomes after its last attempt, a test member's values now), then every given one no declaration names, then its
-- contexts at their declared defaults and QTI_CONTEXT.
create function p3.start_of(attributes p3.document_attribute[], declarations p3.declaration_node[], given p3.in_values,
  texts p3.document_text[])
returns setof p3.var language sql immutable as $$
  select x.* from overridden(
    declared => array(select y from initial(declared => array(select d from overridden(
        declared => array(select e from declared(declarations => declarations, attributes => attributes, texts => texts, kind => 'qti-outcome-declaration', holder => 'qti-default-value') e),
        given => array(select g from vars_in(i => given, h => 'default') g)) d
      where d.identifier in (select e.identifier from declared(declarations => declarations, attributes => attributes, texts => texts, kind => 'qti-outcome-declaration', holder => 'qti-default-value') e))) y)
      || row('identifier', 'single', 'completionStatus', array[s_text(base => 'identifier', t => 'unknown')])::var
      || array(select y from declared(declarations => declarations, attributes => attributes, texts => texts, kind => 'qti-template-declaration', holder => 'qti-default-value') y)
      || array(select r from defaults_of(attributes => attributes, declarations => declarations, given => given, texts => texts) r
        where r.identifier in (select e.identifier from declared(declarations => declarations, attributes => attributes, texts => texts, kind => 'qti-response-declaration', holder => 'qti-default-value') e)
          and exists (select 1 from vars_in(i => given, h => 'value') g where g.identifier = 'numAttempts' and (g.vals[1]).n > 0)),
    given => array(select y from vars_in(i => given, h => 'value') y)) x
  union all select y.* from declared(declarations => declarations, attributes => attributes, texts => texts, kind => 'qti-context-declaration', holder => 'qti-default-value') y
  union all select (qti_context()).*
$$;
-- A document's correct responses in force: its declared ones and the built-in responses', each overridden by one given
-- held `correct` (the session's template processing set it).
create function p3.correct_of(attributes p3.document_attribute[], declarations p3.declaration_node[], given p3.in_values,
  texts p3.document_text[])
returns setof p3.var language sql immutable as $$
  select x.* from overridden(
    declared => array(select y from declared(declarations => declarations, attributes => attributes, texts => texts, kind => 'qti-response-declaration', holder => 'qti-correct-response') y)
      || array(select y from builtin_responses() y),
    given => array(select y from vars_in(i => given, h => 'correct') y)) x
$$;

-- An item's response processing from the variables, correct responses and defaults it starts from. No program, no
-- run: the values stand as they start.
create function p3.response_state(attributes p3.document_attribute[], declarations p3.declaration_node[], given p3.in_values,
  inp p3.inputs, label text, seed text, texts p3.document_text[], walk p3.walk_node[])
returns p3.run_state language plpgsql immutable as $$
declare
  vars var[] := array(select x from start_of(declarations => declarations, attributes => attributes, texts => texts, given => given) x order by x.identifier);
  correct var[] := array(select x from correct_of(declarations => declarations, attributes => attributes, texts => texts, given => given) x order by x.identifier);
  defaults var[] := array(select x from defaults_of(declarations => declarations, attributes => attributes, texts => texts, given => given) x order by x.identifier);
begin
  if walk is null then
    return row(correct, vars, correct, defaults, defaults, '{}', 0, 'run', label, '{}', seed, false, vars)::run_state;
  end if;
  return response_processing(walk => walk, inp => inp, vars => vars, correct => correct, defaults => defaults, seed => seed, label => label);
end $$;

-- An item's template processing at the take: from its template variables and contexts at their declared defaults,
-- each overridden by a value given held `value`, and QTI_CONTEXT, and its correct responses and defaults in force.
create function p3.template_state(attributes p3.document_attribute[], declarations p3.declaration_node[], given p3.in_values,
  inp p3.inputs, label text, seed text, texts p3.document_text[], walk p3.walk_node[])
returns p3.run_state language plpgsql immutable as $$
declare
  vars var[] := array(select v from unnest(array(select x from overridden(
    declared => array(select y from declared(declarations => declarations, attributes => attributes, texts => texts, kind => 'qti-template-declaration', holder => 'qti-default-value') y)
      || array(select y from declared(declarations => declarations, attributes => attributes, texts => texts, kind => 'qti-context-declaration', holder => 'qti-default-value') y),
    given => array(select y from vars_in(i => given, h => 'value') y)) x) || qti_context()) v order by v.identifier);
  correct var[] := array(select x from correct_of(declarations => declarations, attributes => attributes, texts => texts, given => given) x order by x.identifier);
  defaults var[] := array(select x from defaults_of(declarations => declarations, attributes => attributes, texts => texts, given => given) x order by x.identifier);
begin
  if walk is null then
    return row(correct, vars, correct, defaults, defaults, '{}', 0, 'run', label, '{}', seed, false, vars)::run_state;
  end if;
  return template_processing(walk => walk, inp => inp, vars => vars, correct => correct, defaults => defaults, seed => seed, label => label);
end $$;

-- A run's recorded replies as the machine reads them: each keyed by its operator element's place in the program, the
-- stored start numbered as walk_from numbers the program's nodes (width_bucket over their stored starts).
create function p3.replies_of(nodes p3.program_node[], reply_floats p3.doc_reply_float[], reply_texts p3.doc_reply_text[],
  run p3.document_run)
returns setof p3.reply language sql immutable as $$
  with o as (select array_agg(x.start order by x.start) as starts from unnest(nodes) x)
  select f.field, width_bucket(f.start, (select o.starts from o)), s_float(base => 'float', f => f.value) from unnest(reply_floats) f
  where (f.child, f.package, f.path, f.stage) = ((run).child, (run).package, (run).path, (run).stage)
  union all
  select t.field, width_bucket(t.start, (select o.starts from o)), s_text(base => t.base, t => t.value) from unnest(reply_texts) t
  where (t.child, t.package, t.path, t.stage) = ((run).child, (run).package, (run).path, (run).stage)
$$;
-- A run's evaluated applications as the machine reads them: each recorded application its attempt's evaluator evaluated,
-- replied or declined, by its operator element's place in the program, the stored start numbered as replies_of numbers it.
create function p3.evaluated_of(evaluations p3.doc_evaluation[], nodes p3.program_node[], run p3.document_run)
returns setof p3.application language sql immutable as $$
  with o as (select array_agg(x.start order by x.start) as starts from unnest(nodes) x)
  select width_bucket(e.start, (select o.starts from o)) from unnest(evaluations) e
  where (e.child, e.package, e.path, e.stage) = ((run).child, (run).package, (run).path, (run).stage)
$$;
-- A run's persons' values as the machine reads them: each rubric group of its attempt a person valued, with the
-- person's feedback where they gave one.
create function p3.humans_of(human_feedbacks p3.doc_human_feedback[], humans p3.doc_human[], run p3.document_run)
returns setof p3.human_value language sql immutable as $$
  select f.feedback, h.rubric, h.score from unnest(humans) h
    left join unnest(human_feedbacks) f on (f.child, f.package, f.path, f.stage, f.rubric) = (h.child, h.package, h.path, h.stage, h.rubric)
  where (h.child, h.package, h.path, h.stage) = ((run).child, (run).package, (run).path, (run).stage)
$$;
-- The inputs with the registry's tables (its bindings, entries and map values, as the statement passes the Registry
-- level's RegistryBinding, RegistryEntry and RegistryValue) and an attempt's recorded evaluations (the applications
-- evaluated, and their replies) and persons' values, as a test's run adds its test's fields: the rows the custom
-- operators read.
create function p3.with_registry(evaluated p3.application[], humans p3.human_value[], inp p3.inputs, replies p3.reply[],
  table_bindings p3.table_binding[], table_entries p3.table_entry[], table_values p3.table_value[])
returns p3.inputs language plpgsql immutable as $$
begin
  inp.bindings := table_bindings; inp.table_entries := table_entries; inp.table_values := table_values; inp.evaluated := evaluated;
  inp.humans := humans; inp.replies := replies;
  return inp;
end $$;
-- One response processing run's result: where it demanded a recorded application (one it reached with a response and
-- could not evaluate, rubric-score's request), its demands alone, each once, by its operator element's start in the
-- stored tree, with the maximum each took where it took one, so nothing of its attempt is written and the attempt waits
-- for their evaluations; else, where some rubric group's every application it reached declined and no person has valued
-- the group (a valued group's applications are never reached: they take the person's value), its human demands alone,
-- each group once, with the least maximum its applications took where any took one, so the attempt waits for a person;
-- else its values (doc_values_of, each variable as it stands).
create function p3.response_values_of(kinds p3.var_kind[], nodes p3.program_node[], run p3.document_run, st p3.run_state)
returns p3.doc_values language plpgsql immutable as $$
declare result doc_values := no_doc_values(); starts bigint[];
begin
  starts := array(select x.start from unnest(nodes) x order by x.start);
  select coalesce(array_agg(row((run).child, (run).package, (run).path, (run).stage, starts[d.start])::doc_demand), '{}'),
    coalesce(array_agg(row((run).child, d.maximum, (run).package, (run).path, (run).stage, starts[d.start])::doc_demand_maximum)
      filter (where d.maximum is not null), '{}')
  into result.demands, result.demand_maxima
  from (select x.start, (select max(a.maximum) from unnest(st.reached) a where a.start = x.start) as maximum
    from unnest(st.demanded) x group by x.start) d;
  if cardinality(result.demands) > 0 then return result; end if;
  select coalesce(array_agg(row((run).child, (run).package, (run).path, g.rubric, (run).stage)::doc_human_demand), '{}'),
    coalesce(array_agg(row((run).child, g.maximum, (run).package, (run).path, g.rubric, (run).stage)::doc_human_demand_maximum)
      filter (where g.maximum is not null), '{}')
  into result.human_demands, result.human_demand_maxima
  from (select a.rubric, min(a.maximum) as maximum from unnest(st.reached) a group by a.rubric having bool_and(a.declined)) g;
  if cardinality(result.human_demands) > 0 then return result; end if;
  return doc_values_of(delta => false, kinds => kinds, run => run, st => st);
end $$;

-- The flat entry of response processing: every run a call names, each by itself, its program (none where its document
-- has no processing program) walked from its document's stored rows (walk_from), its inputs and its variables' kinds
-- from its document's stored rows too (inputs_of, kinds_of), and its run from its own values and recorded
-- evaluations (the applications evaluated, and their replies) and persons' values, by its key, in one call; the
-- registry's rows the same for every run. A run that demanded a recorded application gives its demands alone, and one
-- that asks a person its human demands alone (response_values_of).
create function p3.response_processing_of(area_coords p3.doc_area_coord[], area_entries p3.doc_area_entry[],
  area_mappings p3.doc_mapping[], booleans p3.doc_boolean[], declaration_attributes p3.document_attribute[],
  declaration_texts p3.document_text[], declarations p3.declaration_node[], directed_pairs p3.doc_directed_pair[],
  evaluations p3.doc_evaluation[], field_booleans p3.doc_field_boolean[], field_directed_pairs p3.doc_field_directed_pair[],
  field_files p3.doc_field_file[], field_floats p3.doc_field_float[],
  field_integers p3.doc_field_integer[], field_pairs p3.doc_field_pair[], field_points p3.doc_field_point[],
  field_texts p3.doc_field_text[], files p3.doc_file[], floats p3.doc_float[],
  human_feedbacks p3.doc_human_feedback[], humans p3.doc_human[], integers p3.doc_integer[],
  interpolation_entries p3.doc_interpolation_entry[], kinds p3.doc_var_kind[], lookups p3.doc_lookup[], map_entries p3.doc_map_entry[],
  mappings p3.doc_mapping[], match_entries p3.doc_match_entry[], pairs p3.doc_pair[],
  points p3.doc_point[], programs p3.program_node[],
  reply_floats p3.doc_reply_float[], reply_texts p3.doc_reply_text[], runs p3.document_run[],
  table_bindings p3.table_binding[], table_entries p3.table_entry[], table_values p3.table_value[],
  texts p3.doc_text[], value_booleans p3.doc_value_boolean[], value_directed_pairs p3.doc_value_directed_pair[],
  value_floats p3.doc_value_float[], value_integers p3.doc_value_integer[], value_pairs p3.doc_value_pair[],
  value_points p3.doc_value_point[], value_texts p3.doc_value_text[], vars p3.doc_given[], walk_areas p3.doc_walk_area[],
  walk_categories p3.doc_walk_category[],
  walk_coords p3.doc_walk_coord[], walk_customs p3.doc_walk_custom[], walk_equals p3.doc_walk_equal[],
  walk_filters p3.doc_walk_filter[], walk_floats p3.doc_walk_float[], walk_idents p3.doc_walk_ident[],
  walk_integers p3.doc_walk_integer[], walk_literal_booleans p3.doc_walk_literal_boolean[],
  walk_literal_directed_pairs p3.doc_walk_literal_directed_pair[], walk_literal_floats p3.doc_walk_literal_float[],
  walk_literal_integers p3.doc_walk_literal_integer[], walk_literal_pairs p3.doc_walk_literal_pair[],
  walk_literal_points p3.doc_walk_literal_point[], walk_literal_texts p3.doc_walk_literal_text[],
  walk_names p3.doc_walk_name[], walk_patterns p3.doc_walk_pattern[], walk_refs p3.doc_walk_ref[],
  walk_rounds p3.doc_walk_round[], walk_texts p3.doc_walk_text[])
returns p3.doc_values language plpgsql immutable as $$
declare r document_run; pn program_node[]; dn declaration_node[]; da document_attribute[]; dt document_text[];
  result doc_values := no_doc_values(); st run_state;
begin
  for r in select x.* from unnest(runs) x order by x.child, x.package, x.path, x.stage loop
    pn := array(select x from unnest(programs) x where x.package = r.package and x.path = r.path);
    dn := array(select x from unnest(declarations) x where x.package = r.package and x.path = r.path);
    da := array(select x from unnest(declaration_attributes) x where x.package = r.package and x.path = r.path);
    dt := array(select x from unnest(declaration_texts) x where x.package = r.package and x.path = r.path);
    st := response_state(
      walk => case when cardinality(pn) > 0 then (walk_from(package => r.package, path => r.path, nodes => pn, areas => walk_areas, categories => walk_categories, coords => walk_coords, customs => walk_customs, equals => walk_equals, filters => walk_filters, floats => walk_floats, idents => walk_idents, integers => walk_integers, literal_booleans => walk_literal_booleans, literal_directed_pairs => walk_literal_directed_pairs, literal_floats => walk_literal_floats, literal_integers => walk_literal_integers, literal_pairs => walk_literal_pairs, literal_points => walk_literal_points, literal_texts => walk_literal_texts, names => walk_names, patterns => walk_patterns, refs => walk_refs, rounds => walk_rounds, texts => walk_texts)).nodes end,
      inp => with_registry(inp => inputs_of(package => r.package, path => r.path, mappings => mappings,
        map_entries => map_entries, area_mappings => area_mappings, area_entries => area_entries, area_coords => area_coords, lookups => lookups,
        match_entries => match_entries, interpolation_entries => interpolation_entries, value_texts => value_texts, value_integers => value_integers,
        value_floats => value_floats, value_booleans => value_booleans, value_pairs => value_pairs, value_directed_pairs => value_directed_pairs,
        value_points => value_points), table_bindings => table_bindings,
        table_entries => table_entries, table_values => table_values,
        evaluated => array(select x from evaluated_of(run => r, nodes => pn, evaluations => evaluations) x),
        humans => array(select x from humans_of(run => r, humans => humans, human_feedbacks => human_feedbacks) x),
        replies => array(select x from replies_of(run => r, nodes => pn, reply_floats => reply_floats, reply_texts => reply_texts) x)),
      declarations => dn, attributes => da, texts => dt,
      given => values_of(child => r.child, package => r.package, path => r.path, stage => r.stage, vars => vars, declarations => dn, declaration_attributes => da, defaulted => r.defaulted, texts => texts, integers => integers, floats => floats, booleans => booleans, pairs => pairs, directed_pairs => directed_pairs, points => points, files => files,
        field_texts => field_texts, field_integers => field_integers, field_floats => field_floats, field_booleans => field_booleans, field_pairs => field_pairs, field_directed_pairs => field_directed_pairs, field_points => field_points,
        field_files => field_files),
      seed => r.seed, label => r.label);
    result := doc_values_joined(a => result, b => response_values_of(run => r, st => st, nodes => pn, kinds => array(select k from kinds_of(kinds => kinds, package => r.package, path => r.path) k)));
  end loop;
  return result;
end $$;

-- The flat entry of template processing at the take: as response_processing_of, what each run set given back, its
-- template values, correct responses and defaults (held `value`, `correct` and `default`) that differ from those it
-- began with (doc_values_of's `delta`): the session's facts, never the declared values, which are the item's content.
create function p3.template_processing_of(area_coords p3.doc_area_coord[], area_entries p3.doc_area_entry[],
  area_mappings p3.doc_mapping[], booleans p3.doc_boolean[], declaration_attributes p3.document_attribute[],
  declaration_texts p3.document_text[], declarations p3.declaration_node[], directed_pairs p3.doc_directed_pair[],
  field_booleans p3.doc_field_boolean[], field_directed_pairs p3.doc_field_directed_pair[],
  field_files p3.doc_field_file[], field_floats p3.doc_field_float[],
  field_integers p3.doc_field_integer[], field_pairs p3.doc_field_pair[], field_points p3.doc_field_point[],
  field_texts p3.doc_field_text[], files p3.doc_file[], floats p3.doc_float[],
  integers p3.doc_integer[], interpolation_entries p3.doc_interpolation_entry[], kinds p3.doc_var_kind[], lookups p3.doc_lookup[],
  map_entries p3.doc_map_entry[], mappings p3.doc_mapping[], match_entries p3.doc_match_entry[], pairs p3.doc_pair[],
  points p3.doc_point[], programs p3.program_node[],
  reply_floats p3.doc_reply_float[], reply_texts p3.doc_reply_text[], runs p3.document_run[],
  table_bindings p3.table_binding[], table_entries p3.table_entry[], table_values p3.table_value[],
  texts p3.doc_text[], value_booleans p3.doc_value_boolean[], value_directed_pairs p3.doc_value_directed_pair[],
  value_floats p3.doc_value_float[], value_integers p3.doc_value_integer[], value_pairs p3.doc_value_pair[],
  value_points p3.doc_value_point[], value_texts p3.doc_value_text[], vars p3.doc_given[], walk_areas p3.doc_walk_area[],
  walk_categories p3.doc_walk_category[],
  walk_coords p3.doc_walk_coord[], walk_customs p3.doc_walk_custom[], walk_equals p3.doc_walk_equal[],
  walk_filters p3.doc_walk_filter[], walk_floats p3.doc_walk_float[], walk_idents p3.doc_walk_ident[],
  walk_integers p3.doc_walk_integer[], walk_literal_booleans p3.doc_walk_literal_boolean[],
  walk_literal_directed_pairs p3.doc_walk_literal_directed_pair[], walk_literal_floats p3.doc_walk_literal_float[],
  walk_literal_integers p3.doc_walk_literal_integer[], walk_literal_pairs p3.doc_walk_literal_pair[],
  walk_literal_points p3.doc_walk_literal_point[], walk_literal_texts p3.doc_walk_literal_text[],
  walk_names p3.doc_walk_name[], walk_patterns p3.doc_walk_pattern[], walk_refs p3.doc_walk_ref[],
  walk_rounds p3.doc_walk_round[], walk_texts p3.doc_walk_text[])
returns p3.doc_values language plpgsql immutable as $$
declare r document_run; pn program_node[]; dn declaration_node[]; da document_attribute[]; dt document_text[];
  result doc_values := no_doc_values(); st run_state;
begin
  for r in select x.* from unnest(runs) x order by x.child, x.package, x.path, x.stage loop
    pn := array(select x from unnest(programs) x where x.package = r.package and x.path = r.path);
    dn := array(select x from unnest(declarations) x where x.package = r.package and x.path = r.path);
    da := array(select x from unnest(declaration_attributes) x where x.package = r.package and x.path = r.path);
    dt := array(select x from unnest(declaration_texts) x where x.package = r.package and x.path = r.path);
    st := template_state(
      walk => case when cardinality(pn) > 0 then (walk_from(package => r.package, path => r.path, nodes => pn, areas => walk_areas, categories => walk_categories, coords => walk_coords, customs => walk_customs, equals => walk_equals, filters => walk_filters, floats => walk_floats, idents => walk_idents, integers => walk_integers, literal_booleans => walk_literal_booleans, literal_directed_pairs => walk_literal_directed_pairs, literal_floats => walk_literal_floats, literal_integers => walk_literal_integers, literal_pairs => walk_literal_pairs, literal_points => walk_literal_points, literal_texts => walk_literal_texts, names => walk_names, patterns => walk_patterns, refs => walk_refs, rounds => walk_rounds, texts => walk_texts)).nodes end,
      inp => with_registry(inp => inputs_of(package => r.package, path => r.path, mappings => mappings,
        map_entries => map_entries, area_mappings => area_mappings, area_entries => area_entries, area_coords => area_coords, lookups => lookups,
        match_entries => match_entries, interpolation_entries => interpolation_entries, value_texts => value_texts, value_integers => value_integers,
        value_floats => value_floats, value_booleans => value_booleans, value_pairs => value_pairs, value_directed_pairs => value_directed_pairs,
        value_points => value_points), table_bindings => table_bindings,
        table_entries => table_entries, table_values => table_values, evaluated => '{}', humans => '{}',
        replies => array(select x from replies_of(run => r, nodes => pn, reply_floats => reply_floats, reply_texts => reply_texts) x)),
      declarations => dn, attributes => da, texts => dt,
      given => values_of(child => r.child, package => r.package, path => r.path, stage => r.stage, vars => vars, declarations => dn, declaration_attributes => da, defaulted => r.defaulted, texts => texts, integers => integers, floats => floats, booleans => booleans, pairs => pairs, directed_pairs => directed_pairs, points => points, files => files,
        field_texts => field_texts, field_integers => field_integers, field_floats => field_floats, field_booleans => field_booleans, field_pairs => field_pairs, field_directed_pairs => field_directed_pairs, field_points => field_points,
        field_files => field_files),
      seed => r.seed, label => r.label);
    result := doc_values_joined(a => result, b => doc_values_of(run => r, st => st, kinds => array(select k from kinds_of(kinds => kinds, package => r.package, path => r.path) k), delta => true));
  end loop;
  return result;
end $$;

-- A bag's copies of one value: places 0 to count - 1, so a multiple stored as (value, count) crosses as count rows.
create function p3.copies(count bigint) returns setof p3.copy language sql immutable as $$
  select k from generate_series(0::bigint, count - 1) k
$$;
-- HMAC-SHA-256 (RFC 2104) of a message under a key, both UTF-8, its 32 raw bytes: plate's keyedDigest, the hash every
-- seed a decision derives takes.
create function p3.keyed_digest(key text, message text) returns bytea language plpgsql immutable as $$
declare k bytea := convert_to(key, 'UTF8'); ipad bytea := ''; opad bytea := ''; j int;
begin
  k := case when length(k) > 64 then sha256(k) else k end;
  k := k || decode(repeat('00', 64 - length(k)), 'hex');
  for j in 0 .. 63 loop
    ipad := ipad || set_byte('\x00'::bytea, 0, get_byte(k, j) # 54);
    opad := opad || set_byte('\x00'::bytea, 0, get_byte(k, j) # 92);
  end loop;
  return sha256(opad || sha256(ipad || convert_to(message, 'UTF8')));
end $$;
-- The seed an item's template and response processing draw under, from its decision's seed, a v4 uuid in its canonical
-- lowercase text (plate's itemSeeds: keyedDigest(decision, ["processing", package, identifier]), its fields joined by
-- U+001F).
create function p3.processing_seed(decision uuid, identifier text, package text) returns bytea language sql immutable as $$
  select keyed_digest(key => decision::text, message => 'processing' || chr(31) || package || chr(31) || identifier)
$$;
-- The rank a member of a shuffling section takes in its sitting's order, from its decision's seed, a v4 uuid in its
-- canonical lowercase text, over the test's package and the item ref's identifier (keyedDigest(decision, ["ordering",
-- package, identifier]), its fields joined by U+001F): the members of a section whose qti-ordering shuffles are presented
-- in ascending rank (QTI 3.0.1 §5.98.1, "causes the order of the child elements to be randomized"), as plate presents a
-- shuffled interaction's choices in ascending keyed digest, so a sitting's order is a function of its seed alone.
create function p3.ordering_rank(decision uuid, identifier text, package text) returns bytea language sql immutable as $$
  select keyed_digest(key => decision::text, message => 'ordering' || chr(31) || package || chr(31) || identifier)
$$;
-- The key an item's draw stream is made under, from its processing seed (32 raw bytes, the ledger's SessionSeed): the
-- seed's 64 lowercase hex digits, which `word` reads as UTF-8. That text is plate's protocol, the key its itemSeeds hand
-- its draw stream, and every draw a session recorded was made under it, so it is spelled here, once, and never changes:
-- history is never drawn again under another key.
create function p3.seed_stream_key(seed bytea) returns text language sql immutable as $$
  select encode(seed, 'hex')
$$;
-- The labels an item's draws are made under (plate's labels): `served␟response␟<numAttempts>` for response processing,
-- `served␟template␟<identifier>` for template processing.
create function p3.response_label(attempts bigint) returns text language sql immutable as $$
  select 'served' || chr(31) || 'response' || chr(31) || attempts::text
$$;
create function p3.template_label(identifier text) returns text language sql immutable as $$
  select 'served' || chr(31) || 'template' || chr(31) || identifier
$$;
