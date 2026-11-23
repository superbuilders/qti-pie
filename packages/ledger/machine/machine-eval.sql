-- P3's machine, continued: the text and mapping leaves, the expression evaluator and the rule machine.

-- string-match and substring: string-match compares the two strings, or with substring holds the second in the first;
-- substring holds the first in the second; each compares with case folded unless case-sensitive.
create function p3.cased(p p3.p_text, t text) returns text language sql immutable as
$$ select case when p.case_sensitive then t else fold(t => t) end $$;
create function p3.text_holds(kind text, one text, other text, p p3.p_text) returns boolean language sql immutable as $$
  select case kind
    when 'qti-string-match' then case when p.substring then strpos(cased(p => p, t => one), cased(p => p, t => other)) > 0 else cased(p => p, t => one) = cased(p => p, t => other) end
    when 'qti-substring' then strpos(cased(p => p, t => other), cased(p => p, t => one)) > 0 end
$$;

-- map-response's value (plate's mappedResponse): each distinct value once, mapped by the first entry whose key it is
-- (a string key compared with case folded where the entry is not case-sensitive), else the default, summed exactly and
-- rounded once (exact_sum); a container's sum held to the bounds.
create function p3.mapped(id text, inp p3.inputs, v p3.val) returns float8 language plpgsql immutable as $$
declare mp mapping := (select m from unnest(inp.mappings) m where m.identifier = id); es single[] := '{}'; x single; e float8;
  s float8;
begin
  if mp.identifier is null then raise exception 'response % has no mapping', id; end if;
  for x in select * from distinct_singles(v => v.vals) loop
    e := coalesce((select me.value from unnest(inp.map_entries) me
      where me.identifier = id and case when (me.key).base = 'string' and not me.case_sensitive and x.base = 'string'
        then fold(t => (me.key).t) = fold(t => x.t) else same(a => me.key, b => x) end
      order by me.place limit 1), mp.dflt);
    es := es || s_float(base => 'float', f => e);
  end loop;
  s := exact_sum(xs => es);
  return case when v.card = 'single' then s else f_min(a => mp.upper, b => f_max(a => mp.lower, b => s)) end;
end $$;
-- The area of a response's area mapping a point is in: the first entry, by place, that holds it (the area mapping
-- tests a point "against each area in turn, with those listed first taking priority in the case where areas
-- overlap", as plate's mappedPoints reads it), the point's integers read as doubles; none where no area holds it.
-- The one reading of a point's area: map-response-point's value and AttemptMark's area marks (marks.sql).
create function p3.point_area(entries p3.area_entry[], id text, x p3.single) returns setof p3.area_entry language sql immutable as $$
  select ae.* from unnest(entries) ae
  where ae.identifier = id and x.base = 'point' and holds(a => ae.area, x => ieee(x => x.n), y => ieee(x => x.m)) order by ae.place limit 1
$$;
-- map-response-point's value (plate's mappedPoints): each distinct point once, in its area (point_area), each area's
-- value counted once; a point in none takes the default; summed exactly and rounded once (exact_sum); a container's sum
-- held to the bounds.
create function p3.mapped_points(id text, inp p3.inputs, v p3.val) returns float8 language plpgsql immutable as $$
declare mp mapping := (select m from unnest(inp.area_mappings) m where m.identifier = id); es single[] := '{}'; x single;
  place int; seen int[] := '{}'; value float8; s float8;
begin
  if mp.identifier is null then raise exception 'response % has no area mapping', id; end if;
  for x in select * from distinct_singles(v => v.vals) loop
    select a.place, a.value into place, value from point_area(entries => inp.area_entries, id => id, x => x) a;
    if place is null then es := es || s_float(base => 'float', f => mp.dflt);
    elsif not place = any (seen) then seen := seen || place; es := es || s_float(base => 'float', f => value); end if;
    place := null;
  end loop;
  s := exact_sum(xs => es);
  return case when v.card = 'single' then s else f_min(a => mp.upper, b => f_max(a => mp.lower, b => s)) end;
end $$;

-- A lookup table's target for a value (plate's lookedUp): a match table's entry whose integer source is the value, an
-- interpolation table's first entry the value passes (above its source, or at it where the boundary is included),
-- else the table's default, else NULL; the value is a single number or duration.
create function p3.looked_up(id text, inp p3.inputs, x p3.val) returns p3.val language plpgsql immutable as $$
declare tb lookup_table := (select l from unnest(inp.lookups) l where l.identifier = id); s single; xv numeric;
  hit single[]; matched boolean := false;
begin
  if tb.identifier is null then raise exception 'outcome % has no lookup table', id; end if;
  if x.card = 'single' and cardinality(x.vals) = 1 then
    s := x.vals[1];
    xv := case s.base when 'integer' then s.n when 'float' then exact(f => s.f) when 'duration' then exact(f => s.f) end;
    if xv is not null and xv <> 'NaN' then
      -- The first entry the value meets gives its target, NULL where that is the empty string; no entry, the default.
      case tb.kind
      when 'match' then
        select e.target into hit from unnest(inp.match_entries) e
          where e.identifier = id and s.base = 'integer' and e.source = xv order by e.place limit 1;
        matched := found;
      when 'interpolation' then
        select e.target into hit from unnest(inp.interp_entries) e
          where e.identifier = id and (xv > exact(f => e.source) or (e.boundary and xv = exact(f => e.source))) order by e.place limit 1;
        matched := found;
      end case;
    end if;
  end if;
  return row('single', case when matched then hit else tb.dflt end)::val;
end $$;

-- An expression's value, and the draw stream's position after it: node i of the walk, read with its parameters by its
-- place (walk_node).
create function p3.evaluated(i int, inp p3.inputs, st p3.run_state, walk p3.walk_node[]) returns p3.evaluation language plpgsql immutable as $$
declare
  nd walk_node := walk[i];
  ks int[] := array(select c.i from kids_at(i => i, walk => walk) c);
  k int; r evaluation; dr drawing; v val; a val; b val; ops val[] := '{}'; mem numbers;
  f float8; n numeric; x numeric; y numeric; lo numeric; hi numeric; step numeric; idx numeric;
  acc single[];
  eq p_equal; rd p_round; tx p_text; pt p_pattern; fr p_frange; rg p_range; ar area; an p_any_n; trues int; falses int; nulls int;
  t0 float8; t1 float8; sq float8; cnt int; compiled text;
begin
  case nd.kind
  -- References and literals.
  when 'qti-base-value' then
    v := row('single', array(select l.value from unnest(nd.literals) l))::val;
  -- A variable, a correct response or a default: the run's own of the name, else, in a test's run, an item's through its
  -- item ref (Tables 7.47, 7.10 and 7.12; test-outcome.sql `read_variable`). An item's run holds no member, so it reads its
  -- own, and an undeclared one raises.
  when 'qti-variable' then v := read_variable(nd => nd, inp => inp, vars => st.vars, held => inp.member_vars);
  when 'qti-correct' then v := read_variable(nd => nd, inp => inp, vars => st.correct, held => inp.member_correct);
  when 'qti-default' then v := read_variable(nd => nd, inp => inp, vars => st.defaults, held => inp.member_defaults);
  when 'qti-null' then v := v_null();
  when 'qti-custom-operator' then
    if not exists (select from unnest(nd.customs) p) then v := v_null();
    else
      foreach k in array ks loop
        r := evaluated(walk => walk, inp => inp, i => k, st => st); st.drawn := r.drawn; ops := ops || row(r.card, r.vals)::val;
      end loop;
      v := custom_value(operator_class => (select p.class from unnest(nd.customs) p), ops => ops, inp => inp, start => nd.start);
    end if;
  -- Logic, three-valued.
  when 'qti-is-null' then
    r := evaluated(walk => walk, inp => inp, i => ks[1], st => st); st.drawn := r.drawn; v := v_bool(b => cardinality(r.vals) = 0);
  when 'qti-not' then
    r := evaluated(walk => walk, inp => inp, i => ks[1], st => st); st.drawn := r.drawn;
    v := v_bool(b => not truth(v => row(r.card, r.vals)::val));
  when 'qti-and', 'qti-or', 'qti-any-n' then
    trues := 0; falses := 0; nulls := 0;
    if nd.kind = 'qti-any-n' then
      -- The bounds are read first, min then max, as plate's walk visits them before the operands.
      an := (select p from unnest(nd.any_ns) p);
      lo := resolve_int(vars => st.vars, r => an.min); hi := resolve_int(vars => st.vars, r => an.max);
    end if;
    foreach k in array ks loop
      r := evaluated(walk => walk, inp => inp, i => k, st => st); st.drawn := r.drawn;
      case truth(v => row(r.card, r.vals)::val) when true then trues := trues + 1; when false then falses := falses + 1; else nulls := nulls + 1; end case;
    end loop;
    v := case nd.kind
      when 'qti-and' then v_bool(b => case when falses > 0 then false when nulls > 0 then null else true end)
      when 'qti-or' then v_bool(b => case when trues > 0 then true when nulls > 0 then null else false end)
      -- any-n by the information model's three-valued rule over t true, f false and u NULL of n operands: false when
      -- f > n - min or t > max, true when t >= min and t + u <= max, else NULL; NULL when a bound holds NULL.
      when 'qti-any-n' then v_bool(b => case when lo is null or hi is null then null
        when falses > trues + falses + nulls - lo or trues > hi then false
        when trues >= lo and trues + nulls <= hi then true end) end;
  -- Containers.
  when 'qti-match' then
    r := evaluated(walk => walk, inp => inp, i => ks[1], st => st); st.drawn := r.drawn; a := row(r.card, r.vals)::val;
    r := evaluated(walk => walk, inp => inp, i => ks[2], st => st); st.drawn := r.drawn; b := row(r.card, r.vals)::val;
    v := v_bool(b => case when is_null(v => a) or is_null(v => b) then null else matches(a => a, b => b) end);
  when 'qti-member' then
    r := evaluated(walk => walk, inp => inp, i => ks[1], st => st); st.drawn := r.drawn; a := row(r.card, r.vals)::val;
    r := evaluated(walk => walk, inp => inp, i => ks[2], st => st); st.drawn := r.drawn; b := row(r.card, r.vals)::val;
    v := v_bool(b => case when is_null(v => a) or is_null(v => b) then null
      else exists (select 1 from generate_subscripts(b.vals, 1) ix where same(a => unfielded(s => b.vals[ix]), b => a.vals[1])) end);
  when 'qti-contains' then
    r := evaluated(walk => walk, inp => inp, i => ks[1], st => st); st.drawn := r.drawn; a := row(r.card, r.vals)::val;
    r := evaluated(walk => walk, inp => inp, i => ks[2], st => st); st.drawn := r.drawn; b := row(r.card, r.vals)::val;
    v := v_bool(b => case when is_null(v => a) or is_null(v => b) then null
      when a.card = 'ordered' then exists (
        select 1 from generate_series(0, cardinality(a.vals) - cardinality(b.vals)) o
        where (select bool_and(same(a => a.vals[o + j], b => b.vals[j])) from generate_subscripts(b.vals, 1) j))
      else not has_nan(v => b.vals) and not exists (select * from bag(v => b.vals) except all select * from bag(v => a.vals)) end);
  when 'qti-multiple', 'qti-ordered' then
    acc := '{}';
    foreach k in array ks loop
      r := evaluated(walk => walk, inp => inp, i => k, st => st); st.drawn := r.drawn; acc := acc || r.vals;
    end loop;
    v := row(case nd.kind when 'qti-multiple' then 'multiple' when 'qti-ordered' then 'ordered' end, acc)::val;
  when 'qti-delete' then
    r := evaluated(walk => walk, inp => inp, i => ks[1], st => st); st.drawn := r.drawn; a := row(r.card, r.vals)::val;
    r := evaluated(walk => walk, inp => inp, i => ks[2], st => st); st.drawn := r.drawn; b := row(r.card, r.vals)::val;
    v := row(b.card, case when is_null(v => a) then '{}'::single[]
      else array(select b.vals[pos] from generate_subscripts(b.vals, 1) pos where not matches(a => a, b => v_single(s => b.vals[pos])) order by pos) end)::val;
  when 'qti-index' then
    idx := resolve_int(vars => st.vars, r => (select p.value from unnest(nd.ints) p));
    r := evaluated(walk => walk, inp => inp, i => ks[1], st => st); st.drawn := r.drawn;
    v := case when idx is null or idx < 1 or idx > cardinality(r.vals) then v_null() else v_single(s => r.vals[idx::int]) end;
  when 'qti-container-size' then
    r := evaluated(walk => walk, inp => inp, i => ks[1], st => st); st.drawn := r.drawn;
    v := v_single(s => s_int(n => cardinality(r.vals)));
  when 'qti-random' then
    r := evaluated(walk => walk, inp => inp, i => ks[1], st => st); st.drawn := r.drawn;
    if cardinality(r.vals) = 0 then v := v_null();
    else dr := draw_below(seed => st.seed, label => st.label, drawn => st.drawn, count => cardinality(r.vals)); st.drawn := dr.drawn; v := v_single(s => r.vals[dr.result::int + 1]); end if;
  when 'qti-repeat' then
    acc := '{}';
    n := coalesce(resolve_int(vars => st.vars, r => (select p.value from unnest(nd.ints) p)), 0);
    -- A count past what a loop counts is a resource bound exhausted: the grade aborts, never wraps (SV-SQL-06).
    if n > 2147483647 then raise exception 'a repeat of % copies passes what the grader counts; the grade aborts', n using errcode = 'program_limit_exceeded'; end if;
    for k in 1 .. n loop
      foreach cnt in array ks loop
        r := evaluated(walk => walk, inp => inp, i => cnt, st => st); st.drawn := r.drawn; acc := acc || r.vals;
      end loop;
    end loop;
    v := row('ordered', acc)::val;
  when 'qti-field-value' then
    r := evaluated(walk => walk, inp => inp, i => ks[1], st => st); st.drawn := r.drawn;
    v := row('single', array(select unfielded(s => r.vals[ix]) from generate_subscripts(r.vals, 1) ix
      where (r.vals[ix]).field = (select p.field from unnest(nd.fields) p) order by ix))::val;
  -- Arithmetic.
  when 'qti-sum', 'qti-product', 'qti-subtract', 'qti-min', 'qti-max' then
    foreach k in array ks loop
      r := evaluated(walk => walk, inp => inp, i => k, st => st); st.drawn := r.drawn; ops := ops || row(r.card, r.vals)::val;
    end loop;
    mem := (select m from members_of(vs => ops) m);
    if mem.integers is null or (nd.kind = 'qti-subtract' and exists (select 1 from unnest(ops) o where o.card <> 'single')) then v := v_null();
    elsif mem.integers then
      v := case nd.kind
        when 'qti-sum' then bounded(n => (select sum(z.n) from unnest(mem.vals) z))
        when 'qti-product' then case when exists (select 1 from unnest(mem.vals) z where z.n = 0) then v_single(s => s_int(n => 0))
          else bounded(n => product_of(z => mem.vals)) end
        when 'qti-subtract' then bounded(n => (mem.vals[1]).n - (mem.vals[2]).n)
        when 'qti-min' then v_single(s => s_int(n => (select min(z.n) from unnest(mem.vals) z)))
        when 'qti-max' then v_single(s => s_int(n => (select max(z.n) from unnest(mem.vals) z))) end;
    -- min and max over a NaN are NULL: a NaN is no numerical value (info, min and max: "If any of the
    -- sub-expressions is not a numerical value, then the result is NULL"; SV-EXPR-04).
    elsif nd.kind in ('qti-min', 'qti-max') and exists (select 1 from unnest(mem.vals) z where z.f = 'NaN') then v := v_null();
    -- An operation mixing floats with an integer past the double range runs on the exact values, rounded once
    -- (SV-EXPR-01); min and max choose by exact value.
    elsif past_double(vs => ops) then
      acc := array(select (ops[oi]).vals[oj] from generate_subscripts(ops, 1) oi, generate_subscripts((ops[oi]).vals, 1) oj order by oi, oj);
      x := number(s => acc[1]);
      for k in 2 .. cardinality(acc) loop
        y := number(s => acc[k]);
        x := case nd.kind when 'qti-sum' then x + y when 'qti-product' then x * y when 'qti-subtract' then x - y
          when 'qti-min' then least(x, y) when 'qti-max' then greatest(x, y) end;
      end loop;
      v := float_result(x => x);
    else
      -- A sum is one exact total rounded once (exact_sum); the others fold in order.
      f := case when nd.kind = 'qti-sum' then exact_sum(xs => mem.vals) else (mem.vals[1]).f end;
      for k in 2 .. case when nd.kind = 'qti-sum' then 1 else cardinality(mem.vals) end loop
        f := case nd.kind
          when 'qti-product' then f_mul(a => f, b => (mem.vals[k]).f)
          when 'qti-subtract' then f_sub(a => f, b => (mem.vals[k]).f)
          when 'qti-min' then f_min(a => f, b => (mem.vals[k]).f)
          when 'qti-max' then f_max(a => f, b => (mem.vals[k]).f) end;
      end loop;
      v := v_single(s => s_float(base => 'float', f => f));
    end if;
  when 'qti-divide' then
    r := evaluated(walk => walk, inp => inp, i => ks[1], st => st); st.drawn := r.drawn; a := row(r.card, r.vals)::val;
    r := evaluated(walk => walk, inp => inp, i => ks[2], st => st); st.drawn := r.drawn; b := row(r.card, r.vals)::val;
    a := numbered(v => a); b := numbered(v => b);
    if is_null(v => a) or is_null(v => b) or number(s => b.vals[1]) = 0 then v := v_null();
    -- An integer past the double range divides exactly, the quotient carried to a thousand places (never an infinity's
    -- quotient), then rounded once (SV-EXPR-01).
    elsif past_double(vs => array[a, b]) then v := float_result(x => round(number(s => a.vals[1]), 1000) / number(s => b.vals[1]));
    else
      f := f_div(a => float_of(s => a.vals[1]), b => float_of(s => b.vals[1]));
      v := case when f in ('Infinity', '-Infinity', 'NaN') then v_null() else v_single(s => s_float(base => 'float', f => f)) end;
    end if;
  when 'qti-integer-divide', 'qti-integer-modulus' then
    r := evaluated(walk => walk, inp => inp, i => ks[1], st => st); st.drawn := r.drawn; a := row(r.card, r.vals)::val;
    r := evaluated(walk => walk, inp => inp, i => ks[2], st => st); st.drawn := r.drawn; b := row(r.card, r.vals)::val;
    x := integer_of(v => a); y := integer_of(v => b);
    if x is null or y is null or y = 0 then v := v_null();
    -- integer-divide and integer-modulus round the quotient toward negative infinity (plate's floored division),
    -- computed exactly: div truncates, and a remainder of the other sign moves the quotient down one.
    else n := div(x, y) - case when mod(x, y) <> 0 and (x < 0) <> (y < 0) then 1 else 0 end;
      v := v_single(s => s_int(n => case nd.kind when 'qti-integer-divide' then n when 'qti-integer-modulus' then x - n * y end)); end if;
  when 'qti-gcd', 'qti-lcm' then
    foreach k in array ks loop
      r := evaluated(walk => walk, inp => inp, i => k, st => st); st.drawn := r.drawn; ops := ops || row(r.card, r.vals)::val;
    end loop;
    mem := (select m from members_of(vs => ops) m);
    if mem.integers is null or not mem.integers then v := v_null();
    else v := case nd.kind
      when 'qti-gcd' then v_single(s => s_int(n => gcd_of(z => mem.vals)))
      when 'qti-lcm' then case when exists (select 1 from unnest(mem.vals) z where z.n = 0) then v_single(s => s_int(n => 0)) else bounded(n => lcm_of(z => mem.vals)) end end;
    end if;
  when 'qti-power' then
    r := evaluated(walk => walk, inp => inp, i => ks[1], st => st); st.drawn := r.drawn; a := row(r.card, r.vals)::val;
    r := evaluated(walk => walk, inp => inp, i => ks[2], st => st); st.drawn := r.drawn; b := row(r.card, r.vals)::val;
    a := numbered(v => a); b := numbered(v => b);
    if is_null(v => a) or is_null(v => b) then v := v_null();
    -- An integer past the double range raises exactly, to a thousand places (SV-EXPR-01); a negative base to a
    -- fractional power, which has no real value, is NULL.
    elsif past_double(vs => array[a, b]) then
      begin
        v := float_result(x => power(round(number(s => a.vals[1]), 1000), number(s => b.vals[1])));
      exception when invalid_argument_for_power_function or numeric_value_out_of_range then v := v_null();
      end;
    else
      f := js_pow(x => float_of(s => a.vals[1]), y => float_of(s => b.vals[1]));
      v := case when f in ('Infinity', '-Infinity', 'NaN') then v_null() else v_single(s => s_float(base => 'float', f => f)) end;
    end if;
  when 'qti-round', 'qti-truncate' then
    r := evaluated(walk => walk, inp => inp, i => ks[1], st => st); st.drawn := r.drawn; a := numbered(v => row(r.card, r.vals)::val);
    x := case when is_null(v => a) then null when (a.vals[1]).base = 'integer' then (a.vals[1]).n
      when (a.vals[1]).f not in ('Infinity', '-Infinity', 'NaN') then exact(f => (a.vals[1]).f) end;
    v := case when x is null then v_null()
      else v_single(s => s_int(n => case nd.kind when 'qti-round' then floor(x + 0.5) when 'qti-truncate' then trunc(x) end)) end;
  when 'qti-integer-to-float' then
    r := evaluated(walk => walk, inp => inp, i => ks[1], st => st); st.drawn := r.drawn; x := integer_of(v => row(r.card, r.vals)::val);
    v := case when x is null then v_null() else v_single(s => s_float(base => 'float', f => ieee(x => x))) end;
  when 'qti-math-constant' then
    -- JavaScript's Math.PI and Math.E, the doubles nearest π and e, read from their shortest decimals: no libm.
    v := v_single(s => s_float(base => 'float', f => case (select p.c from unnest(nd.constants) p)
      when 'pi' then 3.141592653589793::float8 when 'e' then 2.718281828459045::float8 end));
  when 'qti-math-operator' then
    foreach k in array ks loop
      r := evaluated(walk => walk, inp => inp, i => k, st => st); st.drawn := r.drawn; ops := ops || row(r.card, r.vals)::val;
    end loop;
    v := math_value(op => (select p.op from unnest(nd.maths) p), ops => ops);
  when 'qti-stats-operator' then
    r := evaluated(walk => walk, inp => inp, i => ks[1], st => st); st.drawn := r.drawn;
    mem := case when r.card = 'single' then null else (select m from members_of(vs => array[row(r.card, r.vals)::val]) m) end;
    v := case when mem.integers is null then v_null()
      else stat_value(op => (select p.op from unnest(nd.stats) p), members => mem.vals) end;
  -- Comparison.
  when 'qti-gt', 'qti-lt', 'qti-gte', 'qti-lte' then
    r := evaluated(walk => walk, inp => inp, i => ks[1], st => st); st.drawn := r.drawn; a := row(r.card, r.vals)::val;
    r := evaluated(walk => walk, inp => inp, i => ks[2], st => st); st.drawn := r.drawn; b := row(r.card, r.vals)::val;
    if is_null(v => a) or is_null(v => b) then v := v_bool(b => null);
    else
      a := numbered(v => a); b := numbered(v => b);
      x := case when not is_null(v => a) then number(s => a.vals[1]) end; y := case when not is_null(v => b) then number(s => b.vals[1]) end;
      v := v_bool(b => case when x is null or y is null or x = 'NaN' or y = 'NaN' then false else case nd.kind
        when 'qti-gt' then x > y when 'qti-lt' then x < y when 'qti-gte' then x >= y when 'qti-lte' then x <= y end end);
    end if;
  -- duration-lt and duration-gte (plate's comparingDurations): the seconds compared exactly as the doubles they are, a
  -- NaN neither shorter nor as long as anything; NULL when either is NULL; an operand that is no single duration, false.
  when 'qti-duration-lt', 'qti-duration-gte' then
    r := evaluated(walk => walk, inp => inp, i => ks[1], st => st); st.drawn := r.drawn; a := row(r.card, r.vals)::val;
    r := evaluated(walk => walk, inp => inp, i => ks[2], st => st); st.drawn := r.drawn; b := row(r.card, r.vals)::val;
    if is_null(v => a) or is_null(v => b) then v := v_bool(b => null);
    else
      t0 := case when a.card = 'single' and cardinality(a.vals) = 1 and (a.vals[1]).base = 'duration' then (a.vals[1]).f end;
      t1 := case when b.card = 'single' and cardinality(b.vals) = 1 and (b.vals[1]).base = 'duration' then (b.vals[1]).f end;
      v := v_bool(b => case when t0 is null or t1 is null or t0 = 'NaN' or t1 = 'NaN' then false else case nd.kind
        when 'qti-duration-lt' then t0 < t1 when 'qti-duration-gte' then t0 >= t1 end end);
    end if;
  when 'qti-equal' then
    eq := (select p from unnest(nd.equals) p);
    t0 := resolve_float(vars => st.vars, r => eq.t0); t1 := resolve_float(vars => st.vars, r => eq.t1);
    r := evaluated(walk => walk, inp => inp, i => ks[1], st => st); st.drawn := r.drawn; a := row(r.card, r.vals)::val;
    r := evaluated(walk => walk, inp => inp, i => ks[2], st => st); st.drawn := r.drawn; b := row(r.card, r.vals)::val;
    v := case when is_null(v => a) or is_null(v => b) then v_bool(b => null)
      else equal_value(eq => eq, x => numbered(v => a), y => numbered(v => b), t0 => t0, t1 => t1) end;
  when 'qti-equal-rounded' then
    rd := (select p from unnest(nd.rounds) p);
    n := resolve_int(vars => st.vars, r => rd.figures);
    r := evaluated(walk => walk, inp => inp, i => ks[1], st => st); st.drawn := r.drawn; a := row(r.card, r.vals)::val;
    r := evaluated(walk => walk, inp => inp, i => ks[2], st => st); st.drawn := r.drawn; b := row(r.card, r.vals)::val;
    x := rounded(v => numbered(v => a), mode => rd.mode, figures => n); y := rounded(v => numbered(v => b), mode => rd.mode, figures => n);
    v := v_bool(b => case when x is null or y is null then null else x = y end);
  when 'qti-round-to' then
    rd := (select p from unnest(nd.rounds) p);
    n := resolve_int(vars => st.vars, r => rd.figures);
    r := evaluated(walk => walk, inp => inp, i => ks[1], st => st); st.drawn := r.drawn;
    x := rounded(v => numbered(v => row(r.card, r.vals)::val), mode => rd.mode, figures => n);
    v := case when x is null then v_null() else v_single(s => s_float(base => 'float', f => ieee(x => x))) end;
  -- Text.
  when 'qti-string-match', 'qti-substring' then
    tx := (select p from unnest(nd.texts) p);
    r := evaluated(walk => walk, inp => inp, i => ks[1], st => st); st.drawn := r.drawn; a := row(r.card, r.vals)::val;
    r := evaluated(walk => walk, inp => inp, i => ks[2], st => st); st.drawn := r.drawn; b := row(r.card, r.vals)::val;
    v := case when is_null(v => a) or is_null(v => b) then v_bool(b => null)
      else v_bool(b => text_holds(kind => nd.kind, p => tx, one => (a.vals[1]).t, other => (b.vals[1]).t)) end;
  -- pattern-match: the pattern resolved first, a variable's single string compiled as XML Schema's Appendix F, then
  -- the operand; xsd_run of no program is NULL, so a NULL variable, a non-string value and a variable holding no
  -- Appendix F expression (QTI's NULL for an undefined result) give NULL with no branch of their own.
  when 'qti-pattern-match' then
    pt := (select p from unnest(nd.patterns) p);
    if pt.ref is null then compiled := pt.program;
    else
      a := value_of(vars => st.vars, id => pt.ref);
      compiled := case when a.card = 'single' and cardinality(a.vals) = 1 and (a.vals[1]).base = 'string'
        then xsd_compile(p => (a.vals[1]).t) end;
    end if;
    r := evaluated(walk => walk, inp => inp, i => ks[1], st => st); st.drawn := r.drawn;
    v := v_bool(b => case when r.card = 'single' and cardinality(r.vals) = 1 and (r.vals[1]).base = 'string'
      then xsd_run(program => compiled, v => (r.vals[1]).t) end);
  -- Mapping and areas.
  when 'qti-map-response' then
    a := value_of(vars => st.vars, id => ident(nd => nd));
    v := v_single(s => s_float(base => 'float', f => mapped(inp => inp, id => ident(nd => nd), v => a)));
  when 'qti-map-response-point' then
    a := value_of(vars => st.vars, id => ident(nd => nd));
    v := v_single(s => s_float(base => 'float', f => mapped_points(inp => inp, id => ident(nd => nd), v => a)));
  when 'qti-inside' then
    r := evaluated(walk => walk, inp => inp, i => ks[1], st => st); st.drawn := r.drawn;
    ar := (select p.area from unnest(nd.areas) p);
    v := v_bool(b => case when cardinality(r.vals) = 0 then null
      else exists (select 1 from unnest(r.vals) s where s.base = 'point' and holds(a => ar, x => ieee(x => s.n), y => ieee(x => s.m))) end);
  -- Draws.
  when 'qti-random-integer' then
    rg := (select p from unnest(nd.ranges) p);
    lo := resolve_int(vars => st.vars, r => rg.lo); hi := resolve_int(vars => st.vars, r => rg.hi); step := resolve_int(vars => st.vars, r => rg.step);
    if lo is null or hi is null or step is null or hi < lo or step <= 0 then v := v_null();
    else dr := draw_below(seed => st.seed, label => st.label, drawn => st.drawn, count => div(hi - lo, step) + 1); st.drawn := dr.drawn;
      v := v_single(s => s_int(n => lo + step * dr.result)); end if;
  when 'qti-random-float' then
    fr := (select p from unnest(nd.franges) p);
    t0 := resolve_float(vars => st.vars, r => fr.lo); t1 := resolve_float(vars => st.vars, r => fr.hi);
    if t0 is null or t1 is null or t0 in ('Infinity', '-Infinity', 'NaN') or t1 in ('Infinity', '-Infinity', 'NaN') or t1 < t0 then v := v_null();
    else
      -- drawFloat: 27 high bits, then 26, over 2^53; then min + u * (max - min), held inside [min, max].
      f := ((word(seed => st.seed, label => st.label, n => st.drawn) >> 5)::float8 * 67108864 + (word(seed => st.seed, label => st.label, n => st.drawn + 1) >> 6)::float8) / 9007199254740992::float8;
      st.drawn := st.drawn + 2;
      sq := f_sub(a => t1, b => t0);
      f := case when sq in ('Infinity', '-Infinity') then f_add(a => f_mul(a => t0, b => 1 - f), b => f_mul(a => t1, b => f)) else f_add(a => t0, b => f_mul(a => f, b => sq)) end;
      v := v_single(s => s_float(base => 'float', f => case when f < t0 then t0 when f > t1 then t1 else f end));
    end if;
  -- Outcome processing only (Tables 6.9.41 and 6.9.58 to 6.9.64; test-outcome.sql): a test's counts, outcome bounds and test variables, read from
  -- the inputs' test fields, which no item's run holds.
  when 'qti-number-correct', 'qti-number-incorrect', 'qti-number-presented', 'qti-number-responded', 'qti-number-selected' then
    v := counted(kind => nd.kind, nd => nd, inp => inp);
  when 'qti-outcome-minimum', 'qti-outcome-maximum' then v := outcome_bounds(kind => nd.kind, nd => nd, inp => inp);
  when 'qti-test-variables' then v := test_variables(nd => nd, inp => inp);
  end case;
  return row(v.card, st.drawn, v.vals)::evaluation;
end $$;

-- The rules that are node i's element children from the from-th on, in order, until the run exits or restarts: each a
-- rule set's assignment, a condition's first true branch (whose rules this runs again from its second child, after
-- the condition, or from its first for an else), a fragment's rules, an exit or a template constraint.
create function p3.run_rules(from_kid int, i int, inp p3.inputs, st p3.run_state, walk p3.walk_node[]) returns p3.run_state language plpgsql immutable as $$
declare ks int[] := array(select c.i from kids_at(i => i, walk => walk) c); place int; k int; nd walk_node; rks int[]; b int; taken boolean;
  rr evaluation; id text;
begin
  for place in from_kid .. cardinality(ks) loop
    k := ks[place]; nd := walk[k]; rks := array(select c.i from kids_at(i => k, walk => walk) c); id := ident(nd => nd);
    case nd.kind
    when 'qti-set-outcome-value', 'qti-set-template-value' then
      rr := evaluated(walk => walk, inp => inp, i => rks[1], st => st); st.drawn := rr.drawn;
      st.vars := array(select a from assign(vars => st.vars, id => id, x => row(rr.card, rr.vals)::val) a);
    when 'qti-set-correct-response' then
      rr := evaluated(walk => walk, inp => inp, i => rks[1], st => st); st.drawn := rr.drawn;
      st.correct := array(select a from assign(vars => st.correct, id => id, x => row(rr.card, rr.vals)::val) a);
    when 'qti-set-default-value' then
      rr := evaluated(walk => walk, inp => inp, i => rks[1], st => st); st.drawn := rr.drawn;
      st.defaults := array(select a from assign(vars => st.defaults, id => id, x => row(rr.card, rr.vals)::val) a);
    when 'qti-lookup-outcome-value' then
      rr := evaluated(walk => walk, inp => inp, i => rks[1], st => st); st.drawn := rr.drawn;
      st.vars := array(select a from assign(vars => st.vars, id => id, x => looked_up(inp => inp, id => id, x => row(rr.card, rr.vals)::val)) a);
    when 'qti-response-condition', 'qti-template-condition', 'qti-outcome-condition' then
      taken := false;
      foreach b in array rks loop
        exit when taken;
        case walk[b].kind
        when 'qti-response-if', 'qti-response-else-if', 'qti-template-if', 'qti-template-else-if', 'qti-outcome-if', 'qti-outcome-else-if' then
          rr := evaluated(walk => walk, inp => inp, i => (select c.i from kids_at(i => b, walk => walk) c limit 1), st => st); st.drawn := rr.drawn;
          if coalesce(truth(v => row(rr.card, rr.vals)::val), false) then st := run_rules(walk => walk, inp => inp, i => b, from_kid => 2, st => st); taken := true; end if;
        when 'qti-response-else', 'qti-template-else', 'qti-outcome-else' then
          st := run_rules(walk => walk, inp => inp, i => b, from_kid => 1, st => st); taken := true;
        end case;
        if st.flow <> 'run' then return st; end if;
      end loop;
    when 'qti-response-processing-fragment', 'qti-outcome-processing-fragment' then st := run_rules(walk => walk, inp => inp, i => k, from_kid => 1, st => st);
    -- qti-exit-test: "The exit outcome rule terminates outcomes processing immediately (for this invocation)" (Table
    -- 6.32.5), as qti-exit-response ends response processing.
    when 'qti-exit-response', 'qti-exit-template', 'qti-exit-test' then st.flow := 'exit';
    when 'qti-template-constraint' then
      rr := evaluated(walk => walk, inp => inp, i => rks[1], st => st); st.drawn := rr.drawn;
      if not coalesce(truth(v => row(rr.card, rr.vals)::val), false) then
        if st.spent then st.vars := st.declared; st.correct := st.declared_correct; st.defaults := st.declared_defaults;
        else st.flow := 'restart'; end if;
      end if;
    end case;
    if st.flow <> 'run' then return st; end if;
  end loop;
  return st;
end $$;

-- Response processing: the rules in order, from the variables, correct responses and defaults the attempt starts from.
create function p3.response_processing(correct p3.var[], defaults p3.var[], inp p3.inputs, label text, prog p3.program, seed text, vars p3.var[])
returns p3.run_state language sql immutable as $$
  select run_rules(walk => (walk_of(prog => prog)).nodes, inp => inp, i => 1, from_kid => 1, st => row(correct, vars, correct, defaults, defaults, 0, 'run', label, seed, false, vars)::run_state)
$$;
-- Template processing: the rules from the declared state, restarted from it while a constraint fails, the restarts
-- sharing one budget of 100 and the stream never reset.
create function p3.template_processing(correct p3.var[], defaults p3.var[], inp p3.inputs, label text, prog p3.program, seed text, vars p3.var[])
returns p3.run_state language plpgsql immutable as $$
declare state run_state; restarts int := 0; drawn int := 0; walk walk_node[] := (walk_of(prog => prog)).nodes;
begin
  loop
    state := run_rules(walk => walk, inp => inp, i => 1, from_kid => 1, st => row(correct, vars, correct, defaults, defaults, drawn, 'run', label, seed, restarts >= 100, vars)::run_state);
    exit when state.flow <> 'restart';
    restarts := restarts + 1; drawn := state.drawn;
  end loop;
  return state;
end $$;
