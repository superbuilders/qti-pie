-- P3's machine, continued: a test's outcome processing (QTI 3.0.1 information model, Table 5.102, OutcomeProcessing) and
-- the expressions only it evaluates (Tables 6.9.41 and 6.9.58 to 6.9.64, and the classes Number, OutcomeMinMax and
-- TestVariables, Tables 7.27, 7.28 and 7.39): the test-level counts, the outcome bounds, the test variables, and an
-- item's variable read through its item ref (Table 7.47, Variable). Each rule cites a class text, the information
-- model's normative part; its section 2 is "NOT NORMATIVE" (info:4599) and is cited only where it alone explains. It
-- loads after machine-eval.sql, whose `evaluate` and `run_rules` reach these functions through the arms of
-- test-outcome-arms.sql; nothing here calls `evaluate`.
--
-- What a test's run reads beyond an item's is its inputs' test fields (machine-types.sql, as test-outcome-arms.sql
-- states them), each immutable while the run runs, so every function here is a set operation over typed rows:
--   - `members`: the test session's items, each its item ref's identifier (its item's, Table 4.1.1: "When an Item is
--     referenced using a 'qti-assesasment-item-ref' the values of the two 'identifier' characteristics MUST be the
--     same") at its place in the session's sequence, the order the candidate meets them;
--   - `ref_sections`, `ref_categories`, `ref_weights`, `ref_mappings`: the test's content per item ref, each section
--     that holds it at any depth, each name of its `category`, each `qti-weight` and each `qti-variable-mapping`;
--   - `member_vars`: each member's item variables as its item session holds them now, every one its item declares and
--     its built-ins, "completionStatus, numAttempts and duration" (Table 4.5.1, info:8959), each with its
--     declaration's kind;
--   - `member_correct`, `member_defaults`: each member's declared responses' correct responses in force, and its
--     declared responses' and outcomes' defaults in force (the declared ones, or those its template processing set),
--     each empty where none is;
--   - `member_bounds`: each member's outcome declarations' `normal-minimum`, which every one has ("It is set to 0 by
--     default", Table 4.5.8; pantry's NormalMinimum, spec reading 149), and `normal-maximum`, where written (Table
--     4.5.7 states no default).
-- An item's own processing holds every one of them empty, and "Outcome only" (pantry, spec reading 23) keeps every
-- kind below out of it, so an item's run never reaches one. A test whose processing the machine cannot grade exactly to
-- the information model (GRADING-SQL's "gradable", the delivered test's limit) never reaches it; one that does and
-- breaks a contract here raises, as a defect.

-- The members a test-level expression reads (Tables 7.27, 7.28 and 7.39, the same three characteristics for each), in
-- the session's sequence:
--   - its `section-identifier`'s: "If specified, only variables from items in the qti-assessment-section with matching
--     identifier are matched. Items in sub-sections are included in this definition" (7.39.1, info:82637); one that
--     names no section of the test holds no member;
--   - then its `include-category`'s: "If specified, only variables from items with a matching category are included"
--     (7.39.2, info:82674); one shared category includes a member, and a list written empty, a valid xs:list, includes
--     none;
--   - then its `exclude-category`'s: "If specified, only variables from items with no matching category are included"
--     (7.39.3, info:82711); one shared category excludes a member.
-- An absent characteristic keeps every member (spec reading 216.4, plate's `keptItems`, restated here).
create function p3.kept(inp p3.inputs, nd p3.walk_node) returns setof p3.member language sql immutable as $$
  select m.place, m.ref from unnest(inp.members) m
  where (not exists (select 1 from unnest(nd.sections) p)
      or exists (select 1 from unnest(nd.sections) p, unnest(inp.ref_sections) h
        where h.ref = m.ref and h.section = p.section))
    and (not exists (select 1 from unnest(nd.filters) f where f.filter = 'include')
      or exists (select 1 from unnest(nd.categories) c, unnest(inp.ref_categories) h
        where c.filter = 'include' and h.ref = m.ref and h.category = c.category))
    and not exists (select 1 from unnest(nd.categories) c, unnest(inp.ref_categories) h
      where c.filter = 'exclude' and h.ref = m.ref and h.category = c.category)
  order by m.place
$$;

-- The variable a name names in a member's item, among `held` (its values, its correct responses or its defaults): the
-- outcome its item ref's variable mapping renames to the name, "Variable mappings allow outcome variables declared with
-- the name source-identifier in the corresponding item to be treated as if they were declared with the name
-- target-identifier during outcome processing" (Table 7.48, info:83735); else the variable of that name, a built-in
-- among them. No row where it names nothing. An item declares a name once and its built-ins are reserved (pantry's
-- Declaration key and Declaration not reserved), so `held` holds at most one row of a member and a name; two mappings
-- of one item ref onto one name would declare two variables of it, a broken input, and raise.
create function p3.named(held p3.member_var[], inp p3.inputs, nm text, r text) returns setof p3.member_var language plpgsql immutable as $$
declare hits member_var[];
begin
  hits := array(select mv from unnest(inp.ref_mappings) mp, unnest(held) mv
    where mp.ref = r and mp.target = nm and mv.ref = r and mv.identifier = mp.source and mv.kind = 'outcome');
  if cardinality(hits) = 0 then hits := array(select mv from unnest(held) mv where mv.ref = r and mv.identifier = nm); end if;
  if cardinality(hits) > 1 then raise exception 'name % names % variables of item ref %', nm, cardinality(hits), r; end if;
  return query select * from unnest(hits);
end $$;

-- A member's started attempts, its built-in `numAttempts` (reserved, Table 4.5.1; the overview explains it: "a single
-- integer that records the number of attempts at each item the candidate has taken. The value defaults to '0'
-- initially and then increases by '1' at the start of each attempt", info:4702): "attempted (at least once)" (Table
-- 6.9.60, info:57674) is numAttempts above 0. Every item session holds it, so a member without it is a broken input,
-- and raises.
create function p3.attempts(inp p3.inputs, r text) returns numeric language plpgsql immutable as $$
declare started numeric;
begin
  select (mv.vals[1]).n into started from unnest(inp.member_vars) mv
    where mv.ref = r and mv.identifier = 'numAttempts' and mv.card = 'single' and cardinality(mv.vals) = 1;
  if started is null then raise exception 'member % holds no numAttempts', r; end if;
  return started;
end $$;

-- A member's declared responses: its response variables but the built-ins `numAttempts` and `duration`, whose
-- "identifiers ... are reserved" (Table 5.115.1, info:39932), so no response declaration declares one; each with its
-- value now, by identifier.
create function p3.declared_responses(inp p3.inputs, r text) returns setof p3.member_var language sql immutable as $$
  select mv.* from unnest(inp.member_vars) mv
  where mv.ref = r and mv.kind = 'response' and mv.identifier not in ('numAttempts', 'duration')
$$;

-- Whether a member was responded to: "items for which at least one declared response has a value that differs from its
-- declared default (typically NULL)" (Table 6.9.61, info:57715), the default its template processing set where it set one
-- (`member_defaults`); a value and a default differ unless both are NULL or they match as qti-match compares them, a
-- record by its fields (spec reading 216's `respondedTo`).
create function p3.responded(inp p3.inputs, r text) returns boolean language sql immutable as $$
  select exists (
    select 1 from declared_responses(inp => inp, r => r) mv
    left join unnest(inp.member_defaults) d on d.ref = r and d.identifier = mv.identifier
    where not (cardinality(mv.vals) = 0 and cardinality(coalesce(d.vals, '{}')) = 0
      or cardinality(mv.vals) > 0 and cardinality(coalesce(d.vals, '{}')) > 0
        and matches(a => row(mv.card, mv.vals)::val, b => row(d.card, d.vals)::val)))
$$;

-- A member judged against its correct responses, as qti-number-correct and qti-number-incorrect read it: NULL where it
-- is not considered, "Only items for which all declared response variables have correct responses defined are
-- considered" (Table 6.9.58, info:57592), each the correct response in force (`member_correct`), and an item that declares
-- no response is not considered either (spec reading 216.5: "An item that declares none has no response to judge correct
-- or incorrect, so it is not considered, rather than counted correct by an empty 'all'"); else whether every declared
-- response matches its correct response as qti-match compares them, a NULL response matching none.
create function p3.judged(inp p3.inputs, r text) returns boolean language sql immutable as $$
  select case
    when not exists (select 1 from declared_responses(inp => inp, r => r)) then null
    when exists (select 1 from declared_responses(inp => inp, r => r) mv where not exists (
      select 1 from unnest(inp.member_correct) c where c.ref = r and c.identifier = mv.identifier and cardinality(c.vals) > 0)) then null
    else not exists (select 1 from declared_responses(inp => inp, r => r) mv, unnest(inp.member_correct) c
      where c.ref = r and c.identifier = mv.identifier
        and not (cardinality(mv.vals) > 0 and matches(a => row(mv.card, mv.vals)::val, b => row(c.card, c.vals)::val))) end
$$;

-- Whether a member counts toward a test-level count (Tables 6.9.58 to 6.9.62), each "an integer with single
-- cardinality":
--   - qti-number-selected: every member, the items "selected for presentation to the candidate, regardless of whether
--     the candidate has attempted them or not" (Table 6.9.62, info:57756);
--   - qti-number-presented: a member "attempted (at least once). In other words, items with which the user has
--     interacted, whether or not they provided a response" (Table 6.9.60, info:57674), its numAttempts above 0;
--   - qti-number-responded: an attempted member "for which a response was given" (Table 6.9.61, info:57715);
--   - qti-number-correct: a member considered whose every declared response matches its correct response (Table
--     6.9.58, info:57592), `judged`; it asks no attempt, and an unattempted member's NULL responses match none;
--   - qti-number-incorrect: an attempted member considered "for which at least one of the defined response variables
--     does not match its associated qti-correct-response. Only items for which all declared response variables have
--     correct responses defined and have been attempted at least once are considered" (Table 6.9.59, info:57633).
create function p3.counts(inp p3.inputs, kind text, r text) returns boolean language plpgsql immutable as $$
begin
  case kind
  when 'qti-number-selected' then return true;
  when 'qti-number-presented' then return attempts(inp => inp, r => r) > 0;
  when 'qti-number-responded' then return attempts(inp => inp, r => r) > 0 and responded(inp => inp, r => r);
  when 'qti-number-correct' then return coalesce(judged(inp => inp, r => r), false);
  when 'qti-number-incorrect' then return attempts(inp => inp, r => r) > 0 and not coalesce(judged(inp => inp, r => r), true);
  end case;
end $$;

-- A test-level count: the members its subset keeps that count, a single integer.
create function p3.counted(inp p3.inputs, kind text, nd p3.walk_node) returns p3.val language sql immutable as $$
  select v_single(s => s_int(n => (select count(*) from kept(nd => nd, inp => inp) m where counts(kind => kind, inp => inp, r => m.ref))))
$$;

-- The weight an item ref gives a weight identifier: its qti-weight of that identifier, "If no matching definition is
-- found the weight is assumed to be 1.0" (Table 7.47.2, info:83672). An item ref names a weight once (Table 7.50.1:
-- "An item can have any number of weights, each one is given an identifier").
create function p3.weight_of(inp p3.inputs, r text, w text) returns float8 language sql immutable as $$
  select coalesce((select x.value from unnest(inp.ref_weights) x where x.ref = r and x.identifier = w), 1::float8)
$$;

-- A number weighted: "All weights are treated as having base-type float and the resulting value is obtained by
-- multiplying the variable's value by the associated weight. When applying a weight to the value of a variable with
-- base-type integer the value is subject to type promotion and the result of the expression has base-type float"
-- (Table 7.47.2, info:83672), the product IEEE's (f_mul).
create function p3.weighted(w float8, x p3.single) returns p3.single language sql immutable as $$
  select s_float(base => 'float', f => f_mul(a => float_of(s => x), b => w))
$$;

-- qti-outcome-minimum and qti-outcome-maximum (Tables 6.9.63, 6.9.64 and 7.28): over the members the subset
-- keeps, each one's `normal-minimum` or `normal-maximum` of the outcome its `outcome-identifier` names in its item, "As
-- per the 'qti-variable-identifier' attribute of 'qti-test-variables'" (7.28.4), so through its item ref's mappings,
-- weighted "As per the 'weight-identifier' characteristic of 'qti-test-variables'" (7.28.5). "Only variables with single
-- cardinality are considered" (info:57797): a member whose item names a variable of another cardinality is passed over.
-- "Items with no declared minimum are ignored" (Table 6.9.63, info:57797); "If any of the items within the given subset
-- have no declared maximum the result is NULL, otherwise the result has cardinality multiple and base-type float"
-- (Table 6.9.64, info:57838). Every outcome declaration has a minimum, its default 0 where it writes none (Table 4.5.8: "It is set to 0
-- by default"), so the minimum ignores only a member whose name names no outcome of its item: nothing, or a response, a
-- template variable or a built-in, none of which declares a bound (spec reading 216.6). The bounds in the session's
-- sequence; none is NULL.
create function p3.outcome_bounds(inp p3.inputs, kind text, nd p3.walk_node) returns p3.val language plpgsql immutable as $$
declare m member; mv member_var; x float8; acc single[] := '{}';
  nm text := ident(nd => nd);
  w text := (nd.weights[1]).weight;
  b text := case kind when 'qti-outcome-minimum' then 'minimum' when 'qti-outcome-maximum' then 'maximum' end;
begin
  for m in select km.* from kept(nd => nd, inp => inp) km order by km.place loop
    mv := null;
    select n.* into mv from named(inp => inp, held => inp.member_vars, r => m.ref, nm => nm) n;
    continue when mv.identifier is not null and mv.card <> 'single';
    x := (select mb.value from unnest(inp.member_bounds) mb
      where mv.kind = 'outcome' and mb.ref = m.ref and mb.identifier = mv.identifier and mb.bound = b);
    if x is null then
      if b = 'maximum' then return row('multiple', '{}'::single[])::val; end if;
      continue;
    end if;
    acc := acc || case when w is null then s_float(base => 'float', f => x) else s_float(base => 'float', f => f_mul(a => x, b => weight_of(inp => inp, r => m.ref, w => w))) end;
  end loop;
  return row('multiple', acc)::val;
end $$;

-- qti-test-variables (Tables 6.9.41 and 7.39): "simultaneously looks up the value of an item variable in a sub-set of
-- the items referred to in a test. Only variables with single cardinality are considered, all NULL values are ignored.
-- The result has cardinality multiple" (info:82600), over the members the subset keeps, in the session's sequence, so a
-- float sum over it is one order's.
--   - The variable is the one `variable-identifier` names in each member's item, through its item ref's mappings:
--     "Items with no matching variable are ignored" (7.39.4, info:82748).
--   - `base-type`: "If specified, matches only variables declared with this base-type. This also becomes the
--     base-type of the result (subject to type promotion through weighting, as described below). If omitted,
--     variables declared with base-type integer or float are matched. The base-type of the result is integer if all
--     matching values have base-type integer, otherwise it is float and integer values are subject to type
--     promotion" (7.39.6, info:82822). The values decide, as the text says, not the declarations.
--   - `weight-identifier`: "the defined weight is applied to each variable as described in the definition of
--     weight-identifier for a single variable ... When a weighting is specified the result of the expression always
--     has base-type float. Note that this option is incomptable with base-type integer" (7.39.5, info:82785), whose
--     first words bound it: "The behaviour of this characterisic is only defined if the base-type attribute is float or
--     omitted". A weight beside any other `base-type` has no defined value, so such content is admitted and not graded
--     (GRADING-SQL's "gradable"), and the run raises if it is ever reached.
create function p3.test_variables(inp p3.inputs, nd p3.walk_node) returns p3.val language plpgsql immutable as $$
declare m member; mv member_var; acc single[] := '{}'; refs text[] := '{}';
  nm text := ident(nd => nd);
  w text := (nd.weights[1]).weight;
  written text := (nd.bases[1]).base;
  result_base text;
begin
  if w is not null and written is not null and written <> 'float' then
    raise exception 'qti-test-variables at % weights a base-type %, whose behaviour Table 7.39.5 leaves undefined', nd.start, written;
  end if;
  for m in select km.* from kept(nd => nd, inp => inp) km order by km.place loop
    mv := null;
    select n.* into mv from named(inp => inp, held => inp.member_vars, r => m.ref, nm => nm) n;
    continue when mv.identifier is null or mv.card <> 'single' or cardinality(mv.vals) = 0;
    continue when not (case when written is null then mv.base in ('integer', 'float') else mv.base = written end);
    acc := acc || mv.vals[1];
    refs := refs || m.ref;
  end loop;
  result_base := case
    when written is not null and written not in ('integer', 'float') then written
    when w is not null or written = 'float' or exists (select 1 from unnest(acc) y where y.base = 'float') then 'float'
    else 'integer' end;
  if result_base <> 'float' then return row('multiple', acc)::val; end if;
  return row('multiple', array(select case when w is null then s_float(base => 'float', f => float_of(s => acc[k])) else weighted(x => acc[k], w => weight_of(inp => inp, r => refs[k], w => w)) end
    from generate_subscripts(acc, 1) k order by k))::val;
end $$;

-- A dotted name read through an item ref (Table 7.47, Variable, info:83598): "During outcomes processing, values taken
-- from an individual item session can be looked up by prefixing the name of the item variable with the identifier
-- assigned to the item in the qti-assessment-item-ref, separated by a period character", and for qti-correct and
-- qti-default "item identifier prefixing (see variable) may be used" (Tables 7.10 and 7.12, info:78132, info:78355). A
-- name has
-- one reading for each dot it splits at, the item ref before it and the variable after it, through the ref's
-- mappings; exactly one must resolve (plate's spec reading 48: "a dotted reference is accepted when exactly one reading
-- names a real item ref, test part or section and its variable"), else the reference, which the import resolves, is a
-- defect, and raises. A numbered reading, `REF.N.VAR`, names occurrence N of an item ref "allowed to be replaced (i.e.
-- that have the with-replacement attribute set to 'true')" (Table 7.47) and nothing else (plate's spec reading 88); a
-- test session's members are one item session per item ref, since the ledger keys an item session by its stage and
-- item and the delivered test's stated limit (IMPL-TESTPLAYER's DeliveredTest) refuses a selection, so no member
-- repeats and a numbered reading resolves through none: it is never read as a variable `N.VAR`, which no identifier
-- is.
create function p3.prefixed(held p3.member_var[], id text, inp p3.inputs) returns p3.member_var language plpgsql immutable as $$
declare hits member_var[] := '{}'; d int; mv member_var; rest text;
begin
  for d in select p from generate_series(1, length(id)) p where substr(id, p, 1) = '.' loop
    rest := substr(id, d + 1);
    continue when rest ~ '^[0-9]+[.]';
    for mv in select n.* from unnest(inp.members) m, named(inp => inp, held => held, r => m.ref, nm => rest) n where m.ref = left(id, d - 1) loop
      hits := hits || mv;
    end loop;
  end loop;
  if cardinality(hits) <> 1 then raise exception 'variable % resolves % ways in the test''s processing', id, cardinality(hits); end if;
  return hits[1];
end $$;

-- What qti-variable, qti-correct and qti-default read (Tables 7.47, 7.10 and 7.12): the run's own variable of the name,
-- "an item variable that has been declared in a corresponding variable declaration or is one of the built-in
-- variables" (info:83598), read whole and never split (a test's outcomes and contexts, QTI_CONTEXT, and its built-in
-- durations, each a variable of the run named so: the test's `duration` and a part's or a section's `ID.duration`,
-- whose time Table 7.40 states, "the durations of all the item sessions plus any other time spent navigating that part
-- of the test", info:82889, and whose names the overview gives, "The time spent on the test is recorded as if it were a
-- built-in response variable called 'duration' declared at the test-level ... by using the variable name duration
-- prefixed with the identifier of the part or section followed by the period character", info:5423); else, in a
-- test's run, an item's through its item ref (`prefixed`). An item's run holds no member, so it reads its own variable,
-- and an undeclared one raises, as before.
--   A qti-variable's `weight-identifier` weights an integer or float item variable read through its item ref: "Weights
--   are defined only in the test context (and hence only in outcomes processing) and only when the item identifier
--   prefixing technique (see above) is being used to look up the value of an item variable ... Weights only apply to
--   item variables with base-types integer and float. If the item variable is of any other type the weight is ignored"
--   (Table 7.47.2, info:83672), each value of a container weighted, NULL staying NULL. The result "has the base-type and
--   cardinality declared for the variable subject to the type promotion of weighted outcomes" (info:83598).
create function p3.read_variable(held p3.member_var[], inps p3.inputs[], nd p3.walk_node, places p3.child[], vars p3.var[]) returns p3.val language plpgsql immutable as $$
declare id text := ident(nd => nd); w text := (nd.weights[1]).weight; mv member_var;
begin
  if cardinality((inps[1]).members) = 0 or cardinality(places) > 0 then return value_at(id => id, places => places, vars => vars); end if;
  mv := prefixed(inp => inps[1], held => held, id => id);
  if w is null or mv.base not in ('integer', 'float') then return row(mv.card, mv.vals)::val; end if;
  return row(mv.card, array(select weighted(x => mv.vals[k], w => weight_of(inp => inps[1], r => mv.ref, w => w)) from generate_subscripts(mv.vals, 1) k order by k))::val;
end $$;

-- The run's starting values of the test's outcomes (Table 4.5, OutcomeDeclaration, info:8922): "If no default value is given in the declaration
-- then the outcome variable is initialized to NULL unless the outcome is of a numeric type (integer or float) in which
-- case it is initialized to 0", the 0 a single of the declared numeric type; a container holds no single of its own,
-- so its NULL is empty.
create function p3.initial(declared p3.var[]) returns setof p3.var language sql immutable as $$
  select d.base, d.card, d.identifier, case
    when cardinality(d.vals) > 0 or d.card <> 'single' then d.vals
    when d.base = 'integer' then array[s_int(n => 0)]
    when d.base = 'float' then array[s_float(base => 'float', f => 0)]
    else d.vals end
  from unnest(declared) d
$$;

-- The run's context variables (Table 5.34, ContextDeclaration, info:21181: "Context variables are typically used to
-- inject the 'context' under which an item or test session is operating"): each the value the delivery engine binds
-- for the session where it binds one, a NULL among them (an unlimited time grant binds no time), else its declared
-- default. A bound name no context declaration declares is a broken input, and raises.
create function p3.bound_contexts(bound p3.var[], contexts p3.var[]) returns setof p3.var language plpgsql immutable as $$
declare b var;
begin
  foreach b in array bound loop
    if not exists (select 1 from unnest(contexts) c where c.identifier = b.identifier) then
      raise exception 'context % is bound but not declared', b.identifier;
    end if;
  end loop;
  return query select c.base, c.card, c.identifier, coalesce((select x.vals from unnest(bound) x where x.identifier = c.identifier), c.vals)
    from unnest(contexts) c;
end $$;

-- Outcome processing (Table 5.102, OutcomeProcessing, info:37242): "Outcome processing takes place each time the
-- candidate submits the responses for an item (when in individual submission mode) or a group of items (when in
-- simultaneous submission mode). It happens after any (item level) response processing triggered by the submission.
-- The values of the test's outcome variables are always reset to their defaults prior to carrying out the instructions
-- described by the outcomeRules ... The structure of outcome processing is similar to that or responseProcessing." So
-- the rules run in order, as an item's do (`run_rules`), from:
--   - `outcomes`, the test's outcome declarations, each holding its declared default, reset to their starting values
--     (`initial`: a single integer or float with no default starts at 0, Table 4.5, so `qti-is-null` of one is never
--     true; a test that needs "no value" declares no numeric outcome for it, or tests a value);
--   - `contexts`, its context declarations, each holding its declared default, with `bound`, the values the delivery
--     engine binds for this session (`bound_contexts`); no outcome rule sets one (qti-set-outcome-value and
--     qti-lookup-outcome-value name outcome variables, Table 6.32);
--   - `builtins`, the run's built-in variables: QTI_CONTEXT, which the delivery engine sets ("any references within an
--     item or an assessment to the QTI_CONTEXT variable ... must succeed", info:4693), and the test's `duration` and
--     each part's and section's `ID.duration`.
-- What qti-default reads of a test variable is its declaration's default, "the associated default value or NULL if no
-- default value was declared" (Table 7.12, info:78355): the outcomes' and contexts' as declared, never a bound value.
-- When a run takes place is the caller's: Table 5.102's "after any (item level) response processing", once more when a
-- part closes, and whenever an item outcome it reads changes; a test's outcomes are read from its item sessions'
-- outcomes in force, never stored by a closing statement, and every run is the same function of that state, since the
-- outcomes are reset before each. A test declares no response, so its own correct responses are none. The item
-- sessions it reads are the inputs' test fields; the draw stream's seed and label are the caller's.
create function p3.outcome_processing(bound p3.var[], builtins p3.var[], contexts p3.var[], inp p3.inputs, label text,
  outcomes p3.var[], prog p3.program, seed text)
returns p3.run_state language sql immutable as $$
  select run_rules(walk => (walk_of(prog => prog)).nodes, inp => inp, i => 1, from_kid => 1, st => row(
    '{}'::var[], array(select v from unnest(array(select i from initial(declared => outcomes) i) || array(select c from bound_contexts(contexts => contexts, bound => bound) c) || builtins) v order by v.identifier),
    '{}'::var[], array(select v from unnest(outcomes || contexts) v order by v.identifier), array(select v from unnest(outcomes || contexts) v order by v.identifier), '{}', 0, 'run', label, '{}',
    seed,
    false, array(select v from unnest(array(select i from initial(declared => outcomes) i) || array(select c from bound_contexts(contexts => contexts, bound => bound) c) || builtins) v order by v.identifier))::run_state)
$$;
