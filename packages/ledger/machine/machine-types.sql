-- P3's machine types: each a grizzle heading (rows({...})) the declared functions take or return, standing in here,
-- on a scratch database, for the row types grizzle installs as __rows_<digest> (FNROWS A names them in a body, B lets
-- a field hold rows of another heading, C passes and returns one row of a heading). Each attribute is its field's base
-- type, text under pg_c_utf8 as every grizzle row type's text is. Every closed vocabulary is a text token whose field
-- is the roster's names as a refined text; every dispatch over one is a CASE with no ELSE, so a token no arm handles
-- raises CASE_NOT_FOUND. QTI's NULL is an empty container, never SQL NULL.
drop schema if exists p3 cascade;
create schema p3;

-- One QTI single, typed. SQL has no sum type, so each base type's own columns hold it and the rest are NULL; one
-- constructor per base type is the only way one is made. identifier, string, uri: t. pair: (t, u) as (least,
-- greatest), so "either order" is the coordinate, not a comparison. directedPair: (t, u). integer: n (exact). point:
-- (n, m). float, duration: f. boolean: b. file: d its SHA-256 content digest, 32 raw bytes, its identity, u its content
-- type, w its filename where it has one. A record's single also names its field.
create type p3.single as (b boolean, base text collate pg_catalog.pg_c_utf8, d bytea,
  f float8, field text collate pg_catalog.pg_c_utf8, m numeric(825, 0),
  n numeric(825, 0), t text collate pg_catalog.pg_c_utf8, u text collate pg_catalog.pg_c_utf8, w text collate pg_catalog.pg_c_utf8);
-- A value: its cardinality and its singles. NULL is no single, at any cardinality.
create type p3.val as (card text collate pg_catalog.pg_c_utf8, vals p3.single[]);
-- A declared variable: its identifier, its declared type (a record has no base type) and its value.
create type p3.var as (base text collate pg_catalog.pg_c_utf8, card text collate pg_catalog.pg_c_utf8,
  identifier text collate pg_catalog.pg_c_utf8, vals p3.single[]);

-- The program: the processing subtree's nodes in document order, each with its kind, and each kind's parameters as
-- its own typed sidecar keyed by the node's start. An attribute that is an integer or a float or a variable's name
-- (QTI's IntegerOrVariableRef, FloatOrVariableRef) is its literal or its reference, exactly one of the two set.
create type p3.node as ("end" integer, kind text collate pg_catalog.pg_c_utf8, parent integer, start integer);
create type p3.child as (i integer);
create type p3.int_ref as (lit numeric(825, 0), ref text collate pg_catalog.pg_c_utf8);
create type p3.float_ref as (lit float8, ref text collate pg_catalog.pg_c_utf8);
create type p3.p_ident as (identifier text collate pg_catalog.pg_c_utf8, start integer);
create type p3.p_literal as (start integer, value p3.single);
create type p3.p_equal as (lower_in boolean, mode text collate pg_catalog.pg_c_utf8, start integer, t0 p3.float_ref, t1 p3.float_ref, upper_in boolean);
create type p3.p_round as (figures p3.int_ref, mode text collate pg_catalog.pg_c_utf8, start integer);
create type p3.p_text as (case_sensitive boolean, start integer, substring boolean);
create type p3.p_pattern as (program text collate pg_catalog.pg_c_utf8, ref text collate pg_catalog.pg_c_utf8, start integer);
create type p3.p_int as (start integer, value p3.int_ref);
create type p3.p_range as (hi p3.int_ref, lo p3.int_ref, start integer, step p3.int_ref);
create type p3.p_frange as (hi p3.float_ref, lo p3.float_ref, start integer);
create type p3.p_any_n as (max p3.int_ref, min p3.int_ref, start integer);
create type p3.p_math as (op text collate pg_catalog.pg_c_utf8, start integer);
create type p3.p_constant as (c text collate pg_catalog.pg_c_utf8, start integer);
create type p3.p_stat as (op text collate pg_catalog.pg_c_utf8, start integer);
create type p3.p_field as (field text collate pg_catalog.pg_c_utf8, start integer);
-- An area: its kind (circle, ellipse, everywhere, nowhere, poly, rect) and its coordinates in order, floats as QTI's
-- coords are read. `nowhere` is an area whose coordinates hold no point (too few of them, a radius of zero or less, a
-- polygon of fewer than three vertices), as HTML's image-map rules read such an area. The containment test is exact
-- on the coordinates' rational values.
create type p3.coord as (c float8, place integer);
create type p3.area as (coords p3.coord[], kind text collate pg_catalog.pg_c_utf8);
create type p3.p_area as (area p3.area, start integer);
-- A test-level expression's characteristics (QTI 3.0.1 information model, Tables 7.27, 7.28 and 7.39), each a sidecar
-- of its node where the node writes it: its `section-identifier`; each of `include-category` and `exclude-category` it
-- writes, as written, since a list may be written empty (a valid xs:list, which includes no item), and each name of the
-- list, by its filter; its `weight-identifier`, and a qti-variable's (Table 7.47.2); and a qti-test-variables'
-- `base-type`. Its `variable-identifier` or `outcome-identifier` is its node's identifier (`idents`).
create type p3.p_section as (section text collate pg_catalog.pg_c_utf8, start integer);
create type p3.p_filter as (filter text collate pg_catalog.pg_c_utf8, start integer);
create type p3.p_category as (category text collate pg_catalog.pg_c_utf8, filter text collate pg_catalog.pg_c_utf8, start integer);
create type p3.p_weight as (start integer, weight text collate pg_catalog.pg_c_utf8);
create type p3.p_base as (base text collate pg_catalog.pg_c_utf8, start integer);
-- One piece of a text a primitive splits or a closed relation lists (a token, a word, a spelling), at its place in order;
-- for a shortest decimal, its digits and the place of its point.
create type p3.segment as (place integer, t text collate pg_catalog.pg_c_utf8);
-- A row of a map table as a primitive reads it: its place in the role's order, its key and the value it maps it to.
create type p3.pair as (key text collate pg_catalog.pg_c_utf8, place integer, value text collate pg_catalog.pg_c_utf8);
-- The registry's tables, as rows the grading statement passes in from the registry's relations, as p3.inputs carries
-- mappings: every row of a table (its key and its place in the table's order, which decides ties), and a map table's
-- value for a key. A binding is the registry entry's: the registered class reads the table in the role, one of the
-- primitive's own table parameters, at its place among the role's tables; a role reads the union of its tables, by
-- binding place then entry place, the first row of a key deciding. p3 names no table: only the registry's data does.
-- Both places are bigint, as the registry's relations hold them (naturals, as a document row's place is), so the
-- statement passes them in as they are.
create type p3.table_entry as (identifier text collate pg_catalog.pg_c_utf8, key text collate pg_catalog.pg_c_utf8, place bigint);
create type p3.table_value as (identifier text collate pg_catalog.pg_c_utf8, key text collate pg_catalog.pg_c_utf8,
  value text collate pg_catalog.pg_c_utf8);
create type p3.table_binding as (class text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, place bigint,
  role text collate pg_catalog.pg_c_utf8);
-- A macro argument as TeX reads one (tex-normal): the place after it, its content, and whether it is a brace group.
create type p3.argument as (braced boolean, content text collate pg_catalog.pg_c_utf8, ends_at integer);
-- A token of math-canonical's reading: its kind (num, name, op, rel, sqrt, fn, joiner), its value (a numeral without
-- its commas, a letter, a symbol, a name) and its text as written.
create type p3.math_token as (kind text collate pg_catalog.pg_c_utf8, raw text collate pg_catalog.pg_c_utf8, v text collate pg_catalog.pg_c_utf8);
-- A text's tokens, in the order they are read (math_tokens' result): one row whose field holds the rows, as a declared
-- function returns several (grizzle's one row; rows returned bare are a set, SETOF, in no order).
create type p3.math_token_list as (tokens p3.math_token[]);
-- A canonical expression as the parser makes it: where it ends, its kind, its print, a sum's or product's operands'
-- prints (flattened), a numeral's value and, for an integer numeral, its exact integer; a fraction's numerator and
-- denominator, a mixed number's whole, numerator, denominator and sign (C6).
create type p3.math_node as (ends_at integer, kind text collate pg_catalog.pg_c_utf8, neg boolean,
  num float8, operands p3.segment[], p numeric, q numeric, ser text collate pg_catalog.pg_c_utf8, whole numeric);
-- quantity's record: the numeral's value, the unit its rest names (NULL for none) and its rest (NULL for nothing).
create type p3.quantity as (rest text collate pg_catalog.pg_c_utf8, unit text collate pg_catalog.pg_c_utf8, value float8);
-- unit-near's record: the unit a mistyped phrase most nearly spells (NULL where a competitor vetoes it) and how near.
create type p3.near as (distance integer, unit text collate pg_catalog.pg_c_utf8);
-- A bound custom operator (the program's sidecar): the qti-custom-operator element at `start` names the registered
-- class `class`, bound by its definition URI at admission.
create type p3.p_custom as (class text collate pg_catalog.pg_c_utf8, start integer);
-- A recorded operator's reply field (the ledger's OperatorReply<Base>): the operator element's start, the field, and
-- its typed value. A recorded operator with no reply (none yet, or a decline) has no row.
create type p3.reply as (field text collate pg_catalog.pg_c_utf8, start integer, value p3.single);

create type p3.program as (any_ns p3.p_any_n[], areas p3.p_area[], bases p3.p_base[], categories p3.p_category[],
  constants p3.p_constant[], customs p3.p_custom[], equals p3.p_equal[], fields p3.p_field[], filters p3.p_filter[], franges p3.p_frange[],
  idents p3.p_ident[], ints p3.p_int[], literals p3.p_literal[], maths p3.p_math[], nodes p3.node[],
  patterns p3.p_pattern[], ranges p3.p_range[], rounds p3.p_round[], sections p3.p_section[], stats p3.p_stat[],
  texts p3.p_text[], weights p3.p_weight[]);
-- A program as the machine's walk reads it (walk_of): one per node, in the program's order, the node and each sidecar's
-- rows at its start. The walk holds the whole array as one value it passes on, so a node and its parameters are read
-- by the node's place, never by searching the program; a call is handed the walk, never a copy of the program.
create type p3.walk_node as (any_ns p3.p_any_n[], areas p3.p_area[], bases p3.p_base[], categories p3.p_category[],
  constants p3.p_constant[], customs p3.p_custom[], "end" integer, equals p3.p_equal[], fields p3.p_field[], filters p3.p_filter[],
  franges p3.p_frange[], idents p3.p_ident[], ints p3.p_int[], kind text collate pg_catalog.pg_c_utf8, literals p3.p_literal[],
  maths p3.p_math[], parent integer, patterns p3.p_pattern[], ranges p3.p_range[], rounds p3.p_round[], sections p3.p_section[],
  start integer, stats p3.p_stat[], texts p3.p_text[], weights p3.p_weight[]);
create type p3.walk as (nodes p3.walk_node[]);

-- The item's immutable inputs the expressions read: mappings, area mappings and lookup tables. An absent bound is the
-- bound's identity, -Infinity or Infinity, so a clamp has no special case. A map key and a table's target are
-- singles of their declaration's base type; a table's default, and an entry's target that is the empty string (NULL),
-- are no row.
create type p3.mapping as (dflt float8, identifier text collate pg_catalog.pg_c_utf8, lower float8, upper float8);
create type p3.map_entry as (case_sensitive boolean, identifier text collate pg_catalog.pg_c_utf8, key p3.single, place integer, value float8);
create type p3.area_entry as (area p3.area, identifier text collate pg_catalog.pg_c_utf8, place integer, value float8);
create type p3.lookup_table as (dflt p3.single[], identifier text collate pg_catalog.pg_c_utf8, kind text collate pg_catalog.pg_c_utf8);
create type p3.match_entry as (identifier text collate pg_catalog.pg_c_utf8, place integer, source numeric(825, 0), target p3.single[]);
create type p3.interp_entry as (boundary boolean, identifier text collate pg_catalog.pg_c_utf8, place integer, source float8, target p3.single[]);
-- A test's immutable inputs its outcome processing reads (test-outcome.sql), each empty in an item's run:
--   - the test session's members, each its item ref's identifier (its item's, §4.1.1) at its place in the session's
--     sequence;
--   - each item ref's sections at any depth, the names of its `category`, its weights (Table 7.50) and its variable
--     mappings (Table 7.48);
--   - each member's item variables as its session holds them now, its declared responses' correct responses and its
--     responses' and outcomes' defaults in force, each by its declaration's kind (`response`, `outcome`, `template`,
--     `context`, a built-in under its own kind's) and declared type, NULL no single;
--   - each member's outcomes' declared `normal-minimum` and `normal-maximum`.
create type p3.member as (place integer, ref text collate pg_catalog.pg_c_utf8);
create type p3.ref_section as (ref text collate pg_catalog.pg_c_utf8, section text collate pg_catalog.pg_c_utf8);
create type p3.ref_category as (category text collate pg_catalog.pg_c_utf8, ref text collate pg_catalog.pg_c_utf8);
create type p3.ref_weight as (identifier text collate pg_catalog.pg_c_utf8, ref text collate pg_catalog.pg_c_utf8, value float8);
create type p3.ref_mapping as (ref text collate pg_catalog.pg_c_utf8, source text collate pg_catalog.pg_c_utf8,
  target text collate pg_catalog.pg_c_utf8);
create type p3.member_var as (base text collate pg_catalog.pg_c_utf8, card text collate pg_catalog.pg_c_utf8,
  identifier text collate pg_catalog.pg_c_utf8, kind text collate pg_catalog.pg_c_utf8, ref text collate pg_catalog.pg_c_utf8,
  vals p3.single[]);
create type p3.member_bound as (bound text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8,
  ref text collate pg_catalog.pg_c_utf8, value float8);
create type p3.inputs as (area_entries p3.area_entry[], area_mappings p3.mapping[], bindings p3.table_binding[], interp_entries p3.interp_entry[],
  lookups p3.lookup_table[], map_entries p3.map_entry[], mappings p3.mapping[],
  match_entries p3.match_entry[], member_bounds p3.member_bound[], member_correct p3.member_var[], member_defaults p3.member_var[],
  member_vars p3.member_var[], members p3.member[], ref_categories p3.ref_category[], ref_mappings p3.ref_mapping[],
  ref_sections p3.ref_section[], ref_weights p3.ref_weight[], replies p3.reply[], table_entries p3.table_entry[],
  table_values p3.table_value[]);

-- The machine's state: the variables, the correct responses and defaults in force (template processing may set
-- either), the draw stream's key, label and position, how the run goes on (exit, restart or run), whether the
-- template restarts are spent, and the declared state a spent constraint resets to.
create type p3.run_state as (correct p3.var[], declared p3.var[], declared_correct p3.var[], declared_defaults p3.var[],
  defaults p3.var[], drawn integer, flow text collate pg_catalog.pg_c_utf8, label text collate pg_catalog.pg_c_utf8,
  seed text collate pg_catalog.pg_c_utf8, spent boolean, vars p3.var[]);
-- An expression's result: the draw stream's position after it, the one fact of the state an expression changes, and
-- its value.
create type p3.evaluation as (card text collate pg_catalog.pg_c_utf8, drawn integer, vals p3.single[]);
-- A draw's result: the stream's position after it and the whole number drawn.
create type p3.drawing as (drawn integer, result numeric(825, 0));
-- The numbers of an operation's operands (plate's membersOf): all integers, or all integers and floats read as floats.
create type p3.numbers as (integers boolean, vals p3.single[]);
-- A single as a multiset operation compares it: by equality of its columns, a file by its digest.
create type p3.bag_row as (b boolean, base text collate pg_catalog.pg_c_utf8, d bytea,
  f float8, m numeric(825, 0), n numeric(825, 0), t text collate pg_catalog.pg_c_utf8, u text collate pg_catalog.pg_c_utf8);
-- A finite double as the dyadic rational it is: significand · 2^exponent, the significand an integer of at most 53
-- bits with the double's sign, so every comparison and sum of doubles is integer arithmetic (IEEE 754 §3.4).
create type p3.dyadic as (exponent integer, significand bigint);
-- A polygon's edge, from the vertex before to its own.
create type p3.edge as (x1 float8, x2 float8, y1 float8, y2 float8);
