-- The flat entry of a test's outcome processing (QTI 3.0.1 information model, Table 5.102, OutcomeProcessing): what a
-- fused statement passes a run of a test's outcome processing and reads back, every heading of values alone and no NULL,
-- P4's document headings (document-types.sql) and six of the test's own content, each keyed by the test's document
-- first. Loads after test-outcome.sql and document.sql, whose readers it composes: walk_from, inputs_of, declared,
-- kinds_of, values_of, start_of, correct_of, defaults_of and doc_values_of, so the test's program, its lookup tables
-- and every member's state are read by the same readers an item's response processing is.
--
-- A run is a test session, by its key (child, package, path, stage): its sitting and its test's document. The tree
-- crosses as P4's, keyed by the document: `programs` the test's qti-outcome-processing subtree, `declarations` the
-- test's own declarations and every member item's, each keyed by its own document. The values cross as P4's one
-- family, each row keyed by the session it is of: a member's values now, by its item session in the run's sitting
-- (the run's child and stage, its item's document), held `value` (an attempted member's every variable after its
-- latest attempt, its outcomes in force, and its built-ins; an unattempted one's built-ins alone), and the test's own,
-- by the run's key: each bound context and each built-in duration the test's run holds, each of the kind its declaration
-- is of (kinds_of: a context's `context`, duration a built-in `response`; the overview: "The time spent on the test is
-- recorded as if it were a built-in response variable called 'duration' declared at the test-level", info:5423).

-- Each member of a test session, by the test's document: its place in the session's sequence, its item ref's
-- identifier, and its item's document in the test's package (the ledger's MemberPackage).
create type p3.test_member as (item text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8,
  path text collate pg_catalog.pg_c_utf8, place bigint, ref text collate pg_catalog.pg_c_utf8);
-- The test's content per item ref (machine-types.sql's ref_section, ref_category, ref_weight, ref_mapping and
-- member_bound), each by the test's document first.
create type p3.test_ref_section as (package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8,
  ref text collate pg_catalog.pg_c_utf8, section text collate pg_catalog.pg_c_utf8);
create type p3.test_ref_category as (category text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8,
  path text collate pg_catalog.pg_c_utf8, ref text collate pg_catalog.pg_c_utf8);
create type p3.test_ref_weight as (identifier text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8,
  path text collate pg_catalog.pg_c_utf8, ref text collate pg_catalog.pg_c_utf8, value float8);
create type p3.test_ref_mapping as (package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8,
  ref text collate pg_catalog.pg_c_utf8, source text collate pg_catalog.pg_c_utf8, target text collate pg_catalog.pg_c_utf8);
create type p3.test_member_bound as (bound text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8,
  package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, ref text collate pg_catalog.pg_c_utf8,
  value float8);

-- The draw stream's key of a test session's outcome processing: its sitting's, the child and the stage, so each sitting
-- draws its own stream and every run of one sitting the same (plate has no test derivation; an item's is its decision's
-- seed, which the ledger does not hold).
create function p3.sitting_seed(child text, stage bigint) returns text language sql immutable as $$
  select child || chr(9247) || stage::text
$$;

-- A member's variables of one kind of state, as the machine's member_var rows: `state` its value now (its responses at
-- their declared defaults, then start_of's: its outcomes at their declared defaults, completionStatus `unknown`, the
-- start of the attempt its presentation began, its template variables at theirs, each overridden by what its item
-- session holds), its correct responses in force (correct_of) or its defaults in force (defaults_of); each with the kind
-- of declaration it is of (kinds_of, a built-in under its own kind's).
create function p3.member_state(kinds p3.var_kind[], ref text, vars p3.var[]) returns setof p3.member_var
language sql immutable as $$
  select x.base, x.card, x.identifier, (select k.kind from unnest(kinds) k where k.identifier = x.identifier), ref, x.vals
  from unnest(vars) x
$$;

-- The flat entry of a test's outcome processing: every test session a call names, each by itself, in one call; each
-- run's result the test's outcome variables after it, held `value`, of kind `outcome`, keyed by the run.
create function p3.test_outcome_processing_of(area_coords p3.doc_area_coord[], area_entries p3.doc_area_entry[],
  area_mappings p3.doc_mapping[], booleans p3.doc_boolean[],
  declaration_attributes p3.document_attribute[], declaration_texts p3.document_text[],
  declarations p3.declaration_node[], directed_pairs p3.doc_directed_pair[], field_booleans p3.doc_field_boolean[],
  field_directed_pairs p3.doc_field_directed_pair[],
  field_files p3.doc_field_file[], field_floats p3.doc_field_float[], field_integers p3.doc_field_integer[],
  field_pairs p3.doc_field_pair[], field_points p3.doc_field_point[], field_texts p3.doc_field_text[],
  files p3.doc_file[], floats p3.doc_float[], integers p3.doc_integer[],
  interpolation_entries p3.doc_interpolation_entry[], kinds p3.doc_var_kind[], lookups p3.doc_lookup[],
  map_entries p3.doc_map_entry[], mappings p3.doc_mapping[], match_entries p3.doc_match_entry[],
  member_bounds p3.test_member_bound[], members p3.test_member[], pairs p3.doc_pair[], points p3.doc_point[],
  programs p3.program_node[], ref_categories p3.test_ref_category[], ref_mappings p3.test_ref_mapping[],
  ref_sections p3.test_ref_section[], ref_weights p3.test_ref_weight[], runs p3.document_run[], texts p3.doc_text[],
  value_booleans p3.doc_value_boolean[], value_directed_pairs p3.doc_value_directed_pair[], value_floats p3.doc_value_float[],
  value_integers p3.doc_value_integer[], value_pairs p3.doc_value_pair[], value_points p3.doc_value_point[],
  value_texts p3.doc_value_text[], vars p3.doc_given[], walk_areas p3.doc_walk_area[], walk_categories p3.doc_walk_category[],
  walk_coords p3.doc_walk_coord[], walk_customs p3.doc_walk_custom[], walk_equals p3.doc_walk_equal[],
  walk_filters p3.doc_walk_filter[], walk_floats p3.doc_walk_float[], walk_idents p3.doc_walk_ident[],
  walk_integers p3.doc_walk_integer[], walk_literal_booleans p3.doc_walk_literal_boolean[],
  walk_literal_directed_pairs p3.doc_walk_literal_directed_pair[], walk_literal_floats p3.doc_walk_literal_float[],
  walk_literal_integers p3.doc_walk_literal_integer[], walk_literal_pairs p3.doc_walk_literal_pair[],
  walk_literal_points p3.doc_walk_literal_point[], walk_literal_texts p3.doc_walk_literal_text[],
  walk_names p3.doc_walk_name[], walk_patterns p3.doc_walk_pattern[], walk_refs p3.doc_walk_ref[],
  walk_rounds p3.doc_walk_round[], walk_texts p3.doc_walk_text[])
returns p3.doc_values language plpgsql immutable as $$
declare r document_run; m test_member; pn program_node[]; dn declaration_node[]; da document_attribute[]; dt document_text[];
  given in_values; mkinds var_kind[]; tkinds var_kind[]; mvars member_var[]; mcorrect member_var[]; mdefaults member_var[];
  inp inputs; outcomes var[]; st run_state; result doc_values := no_doc_values();
begin
  for r in select x.* from unnest(runs) x order by x.child, x.package, x.path, x.stage loop
    mvars := '{}'; mcorrect := '{}'; mdefaults := '{}';
    for m in select x.* from unnest(members) x where x.package = r.package and x.path = r.path order by x.place loop
      dn := array(select x from unnest(declarations) x where x.package = m.package and x.path = m.item);
      da := array(select x from unnest(declaration_attributes) x where x.package = m.package and x.path = m.item);
      dt := array(select x from unnest(declaration_texts) x where x.package = m.package and x.path = m.item);
      given := values_of(child => r.child, package => m.package, path => m.item, stage => r.stage, vars => vars, declarations => dn, declaration_attributes => da, defaulted => r.defaulted, texts => texts, integers => integers, floats => floats, booleans => booleans, pairs => pairs, directed_pairs => directed_pairs, points => points,
        files => files, field_texts => field_texts, field_integers => field_integers, field_floats => field_floats, field_booleans => field_booleans, field_pairs => field_pairs, field_directed_pairs => field_directed_pairs,
        field_points => field_points, field_files => field_files);
      mkinds := array(select k from kinds_of(kinds => kinds, package => m.package, path => m.item) k);
      -- Every declared response, NULL unless start_of gives it: a member never attempted keeps its responses NULL, "the
      -- default value is never used" (Table 5.115); start_of gives the default in force once numAttempts > 0.
      mvars := mvars || array(select s from member_state(ref => m.ref, kinds => mkinds, vars => array(select x from overridden(
        declared => array(select row(y.base, y.card, y.identifier, '{}'::single[])::var
          from declared(declarations => dn, attributes => da, texts => dt, kind => 'qti-response-declaration', holder => 'qti-default-value') y),
        given => array(select y from start_of(declarations => dn, attributes => da, texts => dt, given => given) y)) x order by x.identifier)) s);
      mcorrect := mcorrect || array(select s from member_state(ref => m.ref, kinds => mkinds, vars => array(select x from correct_of(declarations => dn, attributes => da, texts => dt, given => given) x order by x.identifier)) s);
      mdefaults := mdefaults || array(select s from member_state(ref => m.ref, kinds => mkinds, vars => array(select x from defaults_of(declarations => dn, attributes => da, texts => dt, given => given) x order by x.identifier)) s);
    end loop;
    dn := array(select x from unnest(declarations) x where x.package = r.package and x.path = r.path);
    da := array(select x from unnest(declaration_attributes) x where x.package = r.package and x.path = r.path);
    dt := array(select x from unnest(declaration_texts) x where x.package = r.package and x.path = r.path);
    given := values_of(child => r.child, package => r.package, path => r.path, stage => r.stage, vars => vars, declarations => dn, declaration_attributes => da, defaulted => r.defaulted, texts => texts, integers => integers, floats => floats, booleans => booleans, pairs => pairs, directed_pairs => directed_pairs, points => points,
      files => files, field_texts => field_texts, field_integers => field_integers, field_floats => field_floats, field_booleans => field_booleans, field_pairs => field_pairs, field_directed_pairs => field_directed_pairs,
      field_points => field_points, field_files => field_files);
    pn := array(select x from unnest(programs) x where x.package = r.package and x.path = r.path);
    tkinds := array(select k from kinds_of(kinds => kinds, package => r.package, path => r.path) k);
    inp := inputs_of(package => r.package, path => r.path, mappings => mappings, map_entries => map_entries, area_mappings => area_mappings,
      area_entries => area_entries, area_coords => area_coords, lookups => lookups, match_entries => match_entries,
      interpolation_entries => interpolation_entries, value_texts => value_texts, value_integers => value_integers, value_floats => value_floats,
      value_booleans => value_booleans, value_pairs => value_pairs, value_directed_pairs => value_directed_pairs, value_points => value_points);
    inp.members := array(select row(x.place, x.ref)::member from unnest(members) x where x.package = r.package and x.path = r.path);
    inp.ref_sections := array(select row(x.ref, x.section)::ref_section from unnest(ref_sections) x where x.package = r.package and x.path = r.path);
    inp.ref_categories := array(select row(x.category, x.ref)::ref_category from unnest(ref_categories) x where x.package = r.package and x.path = r.path);
    inp.ref_weights := array(select row(x.identifier, x.ref, x.value)::ref_weight from unnest(ref_weights) x where x.package = r.package and x.path = r.path);
    inp.ref_mappings := array(select row(x.ref, x.source, x.target)::ref_mapping from unnest(ref_mappings) x where x.package = r.package and x.path = r.path);
    inp.member_vars := mvars; inp.member_correct := mcorrect; inp.member_defaults := mdefaults;
    inp.member_bounds := array(select row(x.bound, x.identifier, x.ref, x.value)::member_bound from unnest(member_bounds) x where x.package = r.package and x.path = r.path);
    outcomes := array(select y from declared(declarations => dn, attributes => da, texts => dt, kind => 'qti-outcome-declaration', holder => 'qti-default-value') y order by y.identifier);
    -- The test's own values given: each bound context (kind `context`) and each built-in duration (kind `response`),
    -- read by their kind as the statement states it; QTI_CONTEXT, the host's NULL record, among the built-ins.
    -- A test with no outcome processing leaves its outcomes as the reset leaves them (Table 5.102).
    if cardinality(pn) = 0 then
      st.vars := array(select i from initial(declared => outcomes) i order by i.identifier); st.flow := 'run'; st.drawn := 0;
    else
    st := outcome_processing(walk => (walk_from(package => r.package, path => r.path, nodes => pn, areas => walk_areas, categories => walk_categories, coords => walk_coords, customs => walk_customs, equals => walk_equals, filters => walk_filters, floats => walk_floats, idents => walk_idents, integers => walk_integers, literal_booleans => walk_literal_booleans, literal_directed_pairs => walk_literal_directed_pairs, literal_floats => walk_literal_floats, literal_integers => walk_literal_integers, literal_pairs => walk_literal_pairs, literal_points => walk_literal_points, literal_texts => walk_literal_texts, names => walk_names, patterns => walk_patterns, refs => walk_refs, rounds => walk_rounds, texts => walk_texts)).nodes, inp => inp, outcomes => outcomes,
      contexts => array(select y from declared(declarations => dn, attributes => da, texts => dt, kind => 'qti-context-declaration', holder => 'qti-default-value') y order by y.identifier),
      bound => array(select y from vars_in(i => given, h => 'value') y where exists (select 1 from unnest(vars) z
        where (z.child, z.package, z.path, z.stage) = (r.child, r.package, r.path, r.stage) and z.holds = 'value' and z.identifier = y.identifier
          and (select v.kind from unnest(tkinds) v where v.identifier = z.identifier) = 'context')),
      builtins => array(select y from vars_in(i => given, h => 'value') y where exists (select 1 from unnest(vars) z
        where (z.child, z.package, z.path, z.stage) = (r.child, r.package, r.path, r.stage) and z.holds = 'value' and z.identifier = y.identifier
          and (select v.kind from unnest(tkinds) v where v.identifier = z.identifier) = 'response'))
        || qti_context(),
      seed => r.seed, label => r.label);
    end if;
    st.vars := array(select x from unnest(st.vars) x where exists (select 1 from unnest(outcomes) o where o.identifier = x.identifier) order by x.identifier);
    result := doc_values_joined(a => result, b => doc_values_of(run => r, st => st, kinds => tkinds, delta => false));
  end loop;
  return result;
end $$;
