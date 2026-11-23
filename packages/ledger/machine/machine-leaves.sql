-- P3's machine: QTI 3.0.1's response and template processing as declared functions, over the typed program and inputs
-- (machine-types.sql). Each function reads only its arguments: no table, no text to re-parse. Ported from the proven
-- prototype g3 to what a grizzle declared function admits: every argument and result a value of a base type or a
-- heading's row type (one row, or rows as an array), no scalar array, no bytes but a SHA-256's 32 (grizzle's sha256: a
-- file's content digest, a processing seed), no geometric type, and its body naming row types and functions
-- unqualified. Written callees first. The installation makes each SECURITY DEFINER under a NOLOGIN owner with no table
-- privilege and pins its search_path, as grizzle installs a declared function.

-- Singles, one constructor per base type, the only way a single is made: each sets exactly the columns its base type
-- names and raises on a value missing, so no single holds a column another base type's, or lacks its own.
-- An empty text is no single: "empty containers and empty strings are both treated as NULL" (info, isNull), so a
-- value holding one is the empty value, which the boundary writes as no row.
create function p3.s_text(base text, t text) returns p3.single language plpgsql immutable as $$
begin
  if base not in ('identifier', 'string', 'uri') or t is null or t = '' then raise exception 'no % single of text %', base, t; end if;
  return row(null, base, null, null, null, null, null, t, null, null)::single;
end $$;
create function p3.s_int(n numeric) returns p3.single language plpgsql immutable as $$
begin
  if n is null or n <> trunc(n) then raise exception 'no integer single of %', n; end if;
  return row(null, 'integer', null, null, null, null, n, null, null, null)::single;
end $$;
create function p3.s_float(base text, f float8) returns p3.single language plpgsql immutable as $$
begin
  if base not in ('float', 'duration') or f is null then raise exception 'no % single of %', base, f; end if;
  return row(null, base, null, f, null, null, null, null, null, null)::single;
end $$;
create function p3.s_bool(b boolean) returns p3.single language plpgsql immutable as $$
begin
  if b is null then raise exception 'no boolean single of NULL'; end if;
  return row(b, 'boolean', null, null, null, null, null, null, null, null)::single;
end $$;
-- A pair as (least, greatest), so "either order" is the coordinate, not a comparison.
create function p3.s_pair(a text, b text) returns p3.single language plpgsql immutable as $$
begin
  if a is null or b is null then raise exception 'no pair single of % %', a, b; end if;
  return row(null, 'pair', null, null, null, null, null, least(a, b), greatest(a, b), null)::single;
end $$;
create function p3.s_dpair(a text, b text) returns p3.single language plpgsql immutable as $$
begin
  if a is null or b is null then raise exception 'no directedPair single of % %', a, b; end if;
  return row(null, 'directedPair', null, null, null, null, null, a, b, null)::single;
end $$;
-- A file: its SHA-256 content digest, 32 raw bytes, its content type and its filename, the three its identity (QTI 3.0.1
-- §8.14: "any sequence of octets (bytes) qualified by a content-type and an optional filename"). Every file the machine
-- holds is a stored row's, since no content states a file value and delivery names every upload, so its name is
-- required here, as its digest and content type are.
create function p3.s_file(content_type text, digest bytea, filename text) returns p3.single language plpgsql immutable as $$
begin
  if digest is null or content_type is null or filename is null then raise exception 'no file single of % % %', digest, content_type, filename; end if;
  return row(null, 'file', digest, null, null, null, null, null, content_type, filename)::single;
end $$;
create function p3.s_point(x numeric, y numeric) returns p3.single language plpgsql immutable as $$
begin
  if x is null or y is null or x <> trunc(x) or y <> trunc(y) then raise exception 'no point single of % %', x, y; end if;
  return row(null, 'point', null, null, null, y, x, null, null, null)::single;
end $$;
-- A record's field: a single named by it, and the same single read out of its record, its field gone.
create function p3.s_field(field text, s p3.single) returns p3.single language plpgsql immutable as $$
begin
  if field is null then raise exception 'no record field of NULL'; end if;
  s.field := field;
  return s;
end $$;
create function p3.unfielded(s p3.single) returns p3.single language plpgsql immutable as $$
begin
  s.field := null;
  return s;
end $$;

create function p3.v_single(s p3.single) returns p3.val language sql immutable as
$$ select row('single', array[s])::val $$;
create function p3.v_null() returns p3.val language sql immutable as $$ select row('single', '{}')::val $$;
create function p3.v_bool(b boolean) returns p3.val language sql immutable as
$$ select row('single', case when b is null then '{}'::single[] else array[s_bool(b => b)] end)::val $$;
create function p3.is_null(v p3.val) returns boolean language sql immutable as $$ select cardinality(v.vals) = 0 $$;
-- A value's truth, as plate's truthOf reads an operand of a logical operator or a condition: a single boolean's own;
-- NULL for NULL and for any other value.
create function p3.truth(v p3.val) returns boolean language sql immutable as $$
  select case when v.card = 'single' and cardinality(v.vals) = 1 and (v.vals[1]).base = 'boolean' then (v.vals[1]).b end
$$;

-- A finite double as the dyadic rational it is, read from its IEEE 754 bits: its sign and 52-bit fraction as the
-- significand (with the hidden bit for a normal number), its biased exponent less 1075 as the binary exponent; a
-- subnormal's exponent is the least normal's. The one decoder of a double's value.
create function p3.dyadic_of(f float8) returns p3.dyadic language plpgsql immutable as $$
declare b bytea := float8send(f); bits bigint := 0; k int; e int; m bigint;
begin
  if f = 'Infinity' or f = '-Infinity' or f = 'NaN' then raise exception 'no dyadic rational is %', f; end if;
  for k in 0 .. 7 loop bits := (bits << 8) | get_byte(b, k); end loop;
  e := ((bits >> 52) & 2047)::int;
  m := bits & 4503599627370495;
  if e = 0 then e := 1; else m := m + 4503599627370496; end if;
  return row(e - 1075, case when bits < 0 then -m else m end)::dyadic;
end $$;
-- The exact value of a float, as numeric: its dyadic rational written out with no rounding, an infinity or NaN as
-- numeric's own. A negative power of two is written as a power of five over a power of ten, the decimal point placed
-- by numeric input, never by division, which rounds to a scale of its own.
create function p3.exact(f float8) returns numeric language plpgsql immutable as $$
declare d dyadic;
begin
  if f = 'Infinity' or f = '-Infinity' or f = 'NaN' then return f::numeric; end if;
  d := dyadic_of(f => f);
  if d.exponent >= 0 then return d.significand * fdlibm_ipow(b => 2, e => d.exponent); end if;
  return ((d.significand * fdlibm_ipow(b => 5, e => -d.exponent))::text || 'e' || d.exponent)::numeric;
end $$;
-- A number as the float JavaScript's Number reads it: the nearest double, an infinity of its sign past the greatest
-- finite one (2^1024 - 2^970 rounds to 2^1024, Infinity) and a zero of its sign below the least subnormal, where
-- PostgreSQL's cast raises on either.
create function p3.ieee(x numeric) returns float8 language sql immutable as $$
  select case
    when x = 'Infinity' or x = '-Infinity' or x = 'NaN' then x::float8
    when abs(x) >= 179769313486231580793728971405303415079934132710037826936173778980444968292764750946649017977587207096330286416692887910946555547851940402630657488671505820681908902000708383676273854845817711531764475730270069855571366959622842914819860834936475292719074168444365510704342711559699508093042880177904174497792 then sign(x) * 'Infinity'::float8
    -- At or below half the least subnormal, 2^-1075, the nearest double is the zero of x's sign (a tie goes to the
    -- even zero), where PostgreSQL's cast raises on the underflow.
    when x <> 0 and abs(x) * fdlibm_ipow(b => 2, e => 1075) <= 1 then case when x < 0 then '-0'::float8 else 0::float8 end
    else x::float8 end
$$;
-- A single number's exact value, as plate's numberOf reads one; NULL for a single that is no number.
create function p3.number(s p3.single) returns numeric language sql immutable as $$
  select case s.base when 'integer' then s.n when 'float' then exact(f => s.f) when 'duration' then exact(f => s.f) end
$$;
-- A single number as a float, as plate's floatOf converts one.
create function p3.float_of(s p3.single) returns float8 language sql immutable as $$
  select case s.base when 'integer' then ieee(x => s.n) when 'float' then s.f when 'duration' then s.f end
$$;
-- The decimal exponent of a non-zero number's first significant digit, floor(log10 |x|), read exactly from its digits.
create function p3.magnitude(x numeric) returns int language sql immutable as $$
  select case when abs(x) >= 1 then length(split_part(abs(trunc(x))::text, '.', 1)) - 1
    else -(length(substring(split_part(abs(x)::text, '.', 2) from '^0*')) + 1) end
$$;
-- Whether two singles are the same, as plate's sameSingle compares them: of one base type and equal, a float by
-- value (so NaN is no float's same, and -0 is 0's).
create function p3.same(a p3.single, b p3.single) returns boolean language sql immutable as $$
  select a.base = b.base and case a.base
    when 'float' then a.f = b.f and a.f <> 'NaN'
    when 'duration' then a.f = b.f and a.f <> 'NaN'
    when 'integer' then a.n = b.n
    when 'point' then a.n = b.n and a.m = b.m
    when 'boolean' then a.b = b.b
    when 'pair' then a.t = b.t and a.u = b.u
    when 'directedPair' then a.t = b.t and a.u = b.u
    when 'identifier' then a.t = b.t
    when 'string' then a.t = b.t
    when 'uri' then a.t = b.t
    when 'file' then a.d = b.d and a.u = b.u and a.w is not distinct from b.w end
$$;
-- The singles of a value with no field, as rows a multiset operation compares by equality: a file by its digest, content
-- type and name.
create function p3.bag(v p3.single[]) returns setof p3.bag_row language sql immutable as
$$ select s.b, s.base, s.d, s.f, s.m, s.n, s.t, s.u, s.w from unnest(v) s $$;
create function p3.has_nan(v p3.single[]) returns boolean language sql immutable as
$$ select exists (select 1 from unnest(v) s where s.f = 'NaN') $$;
-- Whether two values match, as plate's match: one cardinality and length; a multiple as a multiset, an ordered or
-- single value place by place, each of one base type; a record by its fields, the same fields in any order, each
-- field's single the other's same (plate's sameRecord), a record's fields being one per name.
create function p3.matches(a p3.val, b p3.val) returns boolean language sql immutable as $$
  select a.card = b.card and cardinality(a.vals) = cardinality(b.vals) and case a.card
    when 'record' then not exists (select 1 from generate_subscripts(a.vals, 1) i
      where not exists (select 1 from generate_subscripts(b.vals, 1) j where (b.vals[j]).field = (a.vals[i]).field and same(a => a.vals[i], b => b.vals[j])))
    when 'multiple' then (a.vals[1]).base = (b.vals[1]).base and not has_nan(v => a.vals) and not has_nan(v => b.vals)
      and not exists (select * from bag(v => a.vals) except all select * from bag(v => b.vals))
    when 'ordered' then (a.vals[1]).base = (b.vals[1]).base
      and (select bool_and(same(a => a.vals[k], b => b.vals[k])) from generate_subscripts(a.vals, 1) k)
    when 'single' then same(a => a.vals[1], b => b.vals[1]) end
$$;

-- A program as its walk reads it (walk_node): each node in the program's order, with every sidecar's rows whose start is
-- its start, each sidecar's in that sidecar's order, and its children, the nodes whose parent is its start, by their
-- places in order; one pass over each array, joined by start.
create function p3.walk_of(prog p3.program) returns p3.walk language sql immutable as $$
  select row(array(select row(coalesce(an.v, '{}'), coalesce(ar.v, '{}'), coalesce(ba.v, '{}'), coalesce(ca.v, '{}'),
      coalesce(co.v, '{}'), coalesce(cu.v, '{}'), nd."end", coalesce(eq.v, '{}'), coalesce(fi.v, '{}'),
      coalesce(fl.v, '{}'), coalesce(fr.v, '{}'), coalesce(id.v, '{}'), coalesce(it.v, '{}'), coalesce(ki.v, '{}'), nd.kind,
      coalesce(li.v, '{}'), coalesce(ma.v, '{}'), nd.parent, coalesce(pa.v, '{}'), coalesce(ra.v, '{}'),
      coalesce(ro.v, '{}'), coalesce(se.v, '{}'), nd.start, coalesce(st.v, '{}'), coalesce(te.v, '{}'),
      coalesce(we.v, '{}'))::walk_node
    from unnest(prog.nodes) with ordinality as nd("end", kind, parent, start, place)
    left join (select (s.x).start as start, array_agg(s.x order by s.o) as v
      from (select x, row_number() over () as o from unnest(prog.any_ns) x) s group by 1) an on an.start = nd.start
    left join (select (s.x).start as start, array_agg(s.x order by s.o) as v
      from (select x, row_number() over () as o from unnest(prog.areas) x) s group by 1) ar on ar.start = nd.start
    left join (select (s.x).start as start, array_agg(s.x order by s.o) as v
      from (select x, row_number() over () as o from unnest(prog.bases) x) s group by 1) ba on ba.start = nd.start
    left join (select (s.x).start as start, array_agg(s.x order by s.o) as v
      from (select x, row_number() over () as o from unnest(prog.categories) x) s group by 1) ca on ca.start = nd.start
    left join (select (s.x).start as start, array_agg(s.x order by s.o) as v
      from (select x, row_number() over () as o from unnest(prog.constants) x) s group by 1) co on co.start = nd.start
    left join (select (s.x).start as start, array_agg(s.x order by s.o) as v
      from (select x, row_number() over () as o from unnest(prog.customs) x) s group by 1) cu on cu.start = nd.start
    left join (select (s.x).start as start, array_agg(s.x order by s.o) as v
      from (select x, row_number() over () as o from unnest(prog.equals) x) s group by 1) eq on eq.start = nd.start
    left join (select (s.x).start as start, array_agg(s.x order by s.o) as v
      from (select x, row_number() over () as o from unnest(prog.fields) x) s group by 1) fi on fi.start = nd.start
    left join (select (s.x).start as start, array_agg(s.x order by s.o) as v
      from (select x, row_number() over () as o from unnest(prog.filters) x) s group by 1) fl on fl.start = nd.start
    left join (select (s.x).start as start, array_agg(s.x order by s.o) as v
      from (select x, row_number() over () as o from unnest(prog.franges) x) s group by 1) fr on fr.start = nd.start
    left join (select (s.x).start as start, array_agg(s.x order by s.o) as v
      from (select x, row_number() over () as o from unnest(prog.idents) x) s group by 1) id on id.start = nd.start
    left join (select (s.x).start as start, array_agg(s.x order by s.o) as v
      from (select x, row_number() over () as o from unnest(prog.ints) x) s group by 1) it on it.start = nd.start
    left join (select (s.x).start as start, array_agg(s.x order by s.o) as v
      from (select x, row_number() over () as o from unnest(prog.literals) x) s group by 1) li on li.start = nd.start
    left join (select (s.x).start as start, array_agg(s.x order by s.o) as v
      from (select x, row_number() over () as o from unnest(prog.maths) x) s group by 1) ma on ma.start = nd.start
    left join (select (s.x).start as start, array_agg(s.x order by s.o) as v
      from (select x, row_number() over () as o from unnest(prog.patterns) x) s group by 1) pa on pa.start = nd.start
    left join (select (s.x).start as start, array_agg(s.x order by s.o) as v
      from (select x, row_number() over () as o from unnest(prog.ranges) x) s group by 1) ra on ra.start = nd.start
    left join (select (s.x).start as start, array_agg(s.x order by s.o) as v
      from (select x, row_number() over () as o from unnest(prog.rounds) x) s group by 1) ro on ro.start = nd.start
    left join (select (s.x).start as start, array_agg(s.x order by s.o) as v
      from (select x, row_number() over () as o from unnest(prog.sections) x) s group by 1) se on se.start = nd.start
    left join (select (s.x).start as start, array_agg(s.x order by s.o) as v
      from (select x, row_number() over () as o from unnest(prog.stats) x) s group by 1) st on st.start = nd.start
    left join (select (s.x).start as start, array_agg(s.x order by s.o) as v
      from (select x, row_number() over () as o from unnest(prog.texts) x) s group by 1) te on te.start = nd.start
    left join (select (s.x).start as start, array_agg(s.x order by s.o) as v
      from (select x, row_number() over () as o from unnest(prog.weights) x) s group by 1) we on we.start = nd.start
    left join (select x.parent, array_agg(row(x.place::int)::child order by x.place) as v
      from unnest(prog.nodes) with ordinality as x("end", kind, parent, start, place) group by x.parent) ki on ki.parent = nd.start
    order by nd.place))::walk
$$;

-- Each walk node's slot in a run (slot): its identifier's places in the run's variables, correct responses and
-- defaults, each grouped once by identifier and joined, so a run finds a node's variable by its place.
create function p3.slots_of(correct p3.var[], defaults p3.var[], vars p3.var[], walk p3.walk_node[]) returns p3.slots language sql immutable as $$
  with v as (select x.identifier, array_agg(row(x.ordinality::int)::child order by x.ordinality) as at from unnest(vars) with ordinality x group by 1),
  c as (select x.identifier, array_agg(row(x.ordinality::int)::child order by x.ordinality) as at from unnest(correct) with ordinality x group by 1),
  d as (select x.identifier, array_agg(row(x.ordinality::int)::child order by x.ordinality) as at from unnest(defaults) with ordinality x group by 1)
  select row(array(select row(coalesce(c.at, '{}'), coalesce(d.at, '{}'), coalesce(v.at, '{}'))::slot
    from unnest(walk) with ordinality w
    left join v on v.identifier = (w.idents[1]).identifier left join c on c.identifier = (w.idents[1]).identifier
    left join d on d.identifier = (w.idents[1]).identifier
    order by w.ordinality))::slots
$$;

-- A variable by identifier. An identifier none declares is a defect: the program's references are resolved at import,
-- so it raises.
create function p3.lookup(id text, vars p3.var[]) returns p3.var language plpgsql immutable as $$
declare v var;
begin
  foreach v in array vars loop
    if v.identifier = id then return v; end if;
  end loop;
  raise exception 'undeclared variable %', id;
end $$;
create function p3.value_of(id text, vars p3.var[]) returns p3.val language sql immutable as $$
  select row(l.card, l.vals)::val from lookup(vars => vars, id => id) l
$$;
-- A variable set to a value: an integer set to a float variable becomes a float (setOutcomeValue).
create function p3.set_to(v p3.var, x p3.val) returns p3.var language sql immutable as $$
  select row(v.base, v.card, v.identifier, case when v.base = 'float'
    then array(select case s.base when 'integer' then s_float(base => 'float', f => ieee(x => s.n)) else s end from unnest(x.vals) s)
    else x.vals end)::var
$$;

-- A node's identifier parameter.
create function p3.ident(nd p3.walk_node) returns text language sql immutable as
$$ select (nd.idents[1]).identifier $$;
-- A variable by its places (its slot): the first's value. An identifier none declares is a defect, as lookup raises it.
create function p3.value_at(id text, places p3.child[], vars p3.var[]) returns p3.val language plpgsql immutable as $$
begin
  if cardinality(places) = 0 then raise exception 'undeclared variable %', id; end if;
  return row((vars[(places[1]).i]).card, (vars[(places[1]).i]).vals)::val;
end $$;
-- An integer attribute's value: its literal, or the single integer its variable holds (plate's referenceInteger,
-- which raises for a variable no declaration names); NULL where the variable holds none.
create function p3.resolve_int(r p3.int_ref, vars p3.var[]) returns numeric language sql immutable as $$
  select case when r.ref is null then r.lit
    else (select x.n from lookup(vars => vars, id => r.ref) l, unnest(l.vals) x where x.base = 'integer' and l.card = 'single') end
$$;
-- A float attribute's value: its literal, or the single number its variable holds, NULL where none does or no
-- variable has that name (plate reads a tolerance's reference unchecked).
create function p3.resolve_float(r p3.float_ref, vars p3.var[]) returns float8 language sql immutable as $$
  select case when r.ref is null then r.lit
    else (select float_of(s => x) from unnest(vars) v, unnest(v.vals) x where v.identifier = r.ref and v.card = 'single'
          and x.base in ('integer', 'float')) end
$$;

-- IEEE arithmetic as JavaScript's: PostgreSQL raises on a float result that overflows or underflows to zero, where
-- IEEE gives the infinity or the signed zero, so an operation whose operands could reach either is computed exactly
-- and rounded once.
create function p3.f_add(a float8, b float8) returns float8 language sql immutable as $$
  select case when abs(a) < 1e300 and abs(b) < 1e300 then a + b
    when a = 'NaN' or b = 'NaN' or (a = 'Infinity' and b = '-Infinity') or (a = '-Infinity' and b = 'Infinity') then 'NaN'
    when a in ('Infinity', '-Infinity') then a when b in ('Infinity', '-Infinity') then b
    else ieee(x => exact(f => a) + exact(f => b)) end
$$;
create function p3.f_sub(a float8, b float8) returns float8 language sql immutable as $$ select f_add(a => a, b => -b) $$;
create function p3.f_mul(a float8, b float8) returns float8 language plpgsql immutable as $$
begin
  return a * b;
exception when numeric_value_out_of_range then
  -- Overflow is the infinity of the product's sign; underflow is its signed zero.
  if abs(a) > 1 and abs(b) > 1 then return sign(a) * sign(b) * 'Infinity'::float8; end if;
  return case when (a < 0) <> (b < 0) then '-0'::float8 else 0::float8 end;
end $$;
-- A quotient as IEEE gives it: a non-zero over a zero is the infinity of the signs' product, the zero's sign
-- included; zero or NaN over a zero is NaN (PostgreSQL raises division_by_zero for each).
create function p3.f_div(a float8, b float8) returns float8 language plpgsql immutable as $$
begin
  if b = 0 then
    if a = 0 or a = 'NaN' then return 'NaN'; end if;
    return case when (a < 0) <> (float8send(b) = float8send('-0'::float8)) then '-Infinity'::float8 else 'Infinity'::float8 end;
  end if;
  return a / b;
exception when numeric_value_out_of_range then
  if abs(a) > abs(b) then return sign(a) * sign(b) * 'Infinity'::float8; end if;
  return case when (a < 0) <> (b < 0) then '-0'::float8 else 0::float8 end;
end $$;
-- JavaScript's Math.min and Math.max: NaN wins, and -0 is less than 0.
create function p3.f_min(a float8, b float8) returns float8 language sql immutable as $$
  select case when a = 'NaN' or b = 'NaN' then 'NaN'::float8 when a = b then case when float8send(a) = float8send('-0'::float8) then a else b end
    when a < b then a else b end
$$;
create function p3.f_max(a float8, b float8) returns float8 language sql immutable as $$
  select case when a = 'NaN' or b = 'NaN' then 'NaN'::float8 when a = b then case when float8send(a) = float8send('0'::float8) then a else b end
    when a > b then a else b end
$$;
-- A computed integer. QTI 3.0.1's integer is unbounded ("Integer - the integer data-type (this is derived from the
-- "decimal" data-type i.e. no decimal places)", information model, the data types); the ledger stores one of
-- QtiInteger's digits, derived from its key width, a resource bound.
-- Past it the grade aborts as a defect (program_limit_exceeded), so the write fails loudly and the attempt stays
-- ungraded; it is never QTI's NULL, which would score silently (SV-BOUND-01).
create function p3.bounded(n numeric) returns p3.val language plpgsql immutable as $$
begin
  return v_single(s => s_int(n => n));
exception when numeric_value_out_of_range then
  raise exception 'an integer of % digits passes the integer the ledger stores (QtiInteger); the grade aborts', length(trunc(abs(n))::text)
    using errcode = 'program_limit_exceeded';
end $$;

-- A value as one single number (plate's numberOf): itself where it is a single integer or float, else NULL, the
-- empty value.
create function p3.numbered(v p3.val) returns p3.val language sql immutable as $$
  select case when v.card = 'single' and cardinality(v.vals) = 1 and (v.vals[1]).base in ('integer', 'float') then v else v_null() end
$$;
create function p3.integer_of(v p3.val) returns numeric language sql immutable as $$
  select case when v.card = 'single' and cardinality(v.vals) = 1 and (v.vals[1]).base = 'integer' then (v.vals[1]).n end
$$;
-- A number rounded as round-to and equal-rounded round it: QTI's deciding digit (information model 2.11.3.43, "If the
-- deciding digit is 5 or greater, the nth digit is increased by 1"), read from an integer's digits or a float's exact
-- binary value (spec readings 209 and 235), so 0.175, whose double lies below it, rounds to 0.17 at 2 places and 0.125
-- to 0.13; to significant figures or decimal places; NULL for a value that is no single number (numbered gives it
-- empty), for NaN, or for figures below the mode's least (1 significant figure, 0 decimal places).
create function p3.rounded(figures numeric, mode text, v p3.val) returns numeric language plpgsql immutable as $$
declare s single; x numeric; fewest int := case mode when 'significantFigures' then 1 when 'decimalPlaces' then 0 end;
begin
  if cardinality(v.vals) = 0 or figures is null then return null; end if;
  s := v.vals[1];
  if s.base = 'float' and s.f = 'NaN' then return null; end if;
  if figures < fewest then return null; end if;
  if s.base = 'float' and s.f in ('Infinity', '-Infinity') then return s.f::numeric; end if;
  x := case s.base when 'integer' then s.n when 'float' then exact(f => s.f) end;
  if x = 0 then return 0; end if;
  -- Figures past every digit the number has leave it as it is, exactly; no figures count is cut to fit an int.
  if mode = 'decimalPlaces' and figures >= scale(x) then return x; end if;
  if mode = 'significantFigures' and figures - 1 - magnitude(x => x) >= scale(x) then return x; end if;
  return case mode
    when 'decimalPlaces' then round(x, figures::int)
    when 'significantFigures' then round(x, (figures - 1 - magnitude(x => x))::int) end;
end $$;
-- A double rounded to decimal places as round-to rounds it, its decimal exactly: what a report states of a credit or a
-- percent (the one round-to, on the wire to Timeback; GRADING-CLASS 4.2), callable from a query, which passes no value.
create function p3.round_to_places(places integer, x float8) returns numeric language sql immutable as $$
  select rounded(v => v_single(s => s_float(base => 'float', f => x)), mode => 'decimalPlaces', figures => places)
$$;

-- The n-th 32-bit word, from 0, of plate's draw stream under a seed and a label: the n / 8-th block of HMAC-SHA-256
-- (RFC 2104, a 64-byte block, over sha256()) keyed by the seed, over the label and the block's 4-byte index.
create function p3.word(label text, n int, seed text) returns bigint language plpgsql immutable as $$
declare key bytea := convert_to(seed, 'UTF8'); k bytea; ipad bytea := ''; opad bytea := ''; tag bytea; j int; o int := (n % 8) * 4;
begin
  k := case when length(key) > 64 then sha256(key) else key end;
  k := k || decode(repeat('00', 64 - length(k)), 'hex');
  for j in 0 .. 63 loop
    ipad := ipad || set_byte('\x00'::bytea, 0, get_byte(k, j) # 54);
    opad := opad || set_byte('\x00'::bytea, 0, get_byte(k, j) # 92);
  end loop;
  tag := sha256(opad || sha256(ipad || convert_to(label, 'UTF8') || int4send(n / 8)));
  return (get_byte(tag, o)::bigint << 24) | (get_byte(tag, o + 1) << 16) | (get_byte(tag, o + 2) << 8) | get_byte(tag, o + 3);
end $$;
-- Draw a whole number below count from the stream at a position (plate's drawBelow): the fewest words that hold
-- count - 1's bits, reduced to them, redrawn while it is count or more; and the position after it. The draw is a
-- rejection loop with no bound of its own (each round keeps its word with probability over a half), so its working
-- values are declared NOT NULL: the largest whole number it may keep, count - 1, and each word sum. A NULL count, or a
-- NULL seed, label or position where a word is read, is a broken contract: evaluate never draws below a NULL (it gives
-- v_null() for an empty container or a NULL bound), and the assignment raises rather than the loop never ending.
create function p3.draw_below(count numeric, drawn int, label text, seed text) returns p3.drawing language plpgsql immutable as $$
declare largest numeric not null := count - 1; bits int := 0; whole numeric not null := 0; k int; result numeric not null := 0;
  span numeric := 1;
begin
  if largest <= 0 then return row(drawn, 0)::drawing; end if;
  -- The bit length of count - 1, exactly: the least bits with 2^bits > count - 1.
  while span <= largest loop span := span * 2; bits := bits + 1; end loop;
  loop
    whole := 0;
    for k in 1 .. (bits + 31) / 32 loop
      whole := whole * 4294967296 + word(seed => seed, label => label, n => drawn);
      drawn := drawn + 1;
    end loop;
    result := mod(whole, fdlibm_ipow(b => 2, e => bits));
    exit when result <= largest;
  end loop;
  return row(drawn, result)::drawing;
end $$;

-- A polygon's edges, each from the vertex before to its own, the first from the last: its coordinates read in pairs.
create function p3.edges(coords p3.coord[]) returns setof p3.edge language sql immutable as $$
  with v as (select (row_number() over (order by c.place))::int as k, c.c from unnest(coords) c),
  pt as (select (a.k + 1) / 2 as k, a.c as x, b.c as y from v a join v b on b.k = a.k + 1 where a.k % 2 = 1),
  n as (select count(*)::int as n from pt)
  select p.x, q.x, p.y, q.y from pt q, pt p, n where p.k = case when q.k = 1 then n.n else q.k - 1 end
$$;
-- Whether an area holds a point, its boundary included, exactly: every coordinate is a float's rational value, and
-- circle, ellipse and polygon compare products, never a quotient (plate's areaHolds, with HTML's image-map rules: a
-- rect's corners in either order). A polygon holds a point on an edge, or inside it by the even-odd rule.
create function p3.holds(a p3.area, x float8, y float8) returns boolean language plpgsql immutable as $$
declare c numeric[]; px numeric; py numeric; cx numeric; cy numeric; rx numeric; ry numeric;
begin
  if a.kind = 'everywhere' then return true; end if;
  if x in ('Infinity', '-Infinity', 'NaN') or y in ('Infinity', '-Infinity', 'NaN') then return false; end if;
  px := exact(f => x); py := exact(f => y);
  c := array(select exact(f => k.c) from unnest(a.coords) k order by k.place);
  case a.kind
  when 'everywhere' then return true;
  when 'nowhere' then return false;
  when 'rect' then
    return least(c[1], c[3]) <= px and px <= greatest(c[1], c[3]) and least(c[2], c[4]) <= py and py <= greatest(c[2], c[4]);
  when 'circle' then
    return (px - c[1]) ^ 2 + (py - c[2]) ^ 2 <= c[3] ^ 2;
  when 'ellipse' then
    cx := c[1]; cy := c[2]; rx := c[3]; ry := c[4];
    return ((px - cx) * ry) ^ 2 + ((py - cy) * rx) ^ 2 <= (rx * ry) ^ 2;
  when 'poly' then
    return exists (
        select 1 from (select exact(f => e.x1) x1, exact(f => e.y1) y1, exact(f => e.x2) x2, exact(f => e.y2) y2 from edges(coords => a.coords) e) e
        where (e.x2 - e.x1) * (py - e.y1) = (e.y2 - e.y1) * (px - e.x1)
          and px between least(e.x1, e.x2) and greatest(e.x1, e.x2) and py between least(e.y1, e.y2) and greatest(e.y1, e.y2))
      or (select count(*) from (select exact(f => e.x1) x1, exact(f => e.y1) y1, exact(f => e.x2) x2, exact(f => e.y2) y2 from edges(coords => a.coords) e) e
          where (e.y1 > py) <> (e.y2 > py)
            and case when e.y2 > e.y1 then (e.x2 - e.x1) * (py - e.y1) - (px - e.x1) * (e.y2 - e.y1) > 0
                     else (e.x2 - e.x1) * (py - e.y1) - (px - e.x1) * (e.y2 - e.y1) < 0 end) % 2 = 1;
  end case;
end $$;

-- plate's reciprocal: NaN for 0, else 1 / x.
create function p3.reciprocal(x float8) returns float8 language sql immutable as $$
  select case when x = 0 then 'NaN'::float8 else f_div(a => 1, b => x) end
$$;
-- JavaScript's Math functions over floats, as plate's math-operator applies them: V8's own, bit for bit on any
-- server, through the fdlibm port (fdlibm-functions.sql), IEEE's special values included.
create function p3.js_math(op text, x float8, y float8) returns float8 language plpgsql immutable as $$
begin
  if x = 'NaN' or y = 'NaN' then return 'NaN'; end if;
  case op
  when 'abs' then return abs(x);
  when 'sin' then return fdlibm_sin(x => x);
  when 'cos' then return fdlibm_cos(x => x);
  when 'tan' then return fdlibm_tan(x => x);
  when 'asin' then return fdlibm_asin(x => x);
  when 'acos' then return fdlibm_acos(x => x);
  when 'atan' then return fdlibm_atan(x => x);
  -- Math.atan2(y, x): the first operand is y.
  when 'atan2' then return fdlibm_atan2(y => x, x => y);
  when 'acot' then return fdlibm_atan(x => f_div(a => 1, b => x));
  when 'acsc' then return fdlibm_asin(x => f_div(a => 1, b => x));
  when 'asec' then return fdlibm_acos(x => f_div(a => 1, b => x));
  when 'sinh' then return fdlibm_sinh(x => x);
  when 'cosh' then return fdlibm_cosh(x => x);
  when 'tanh' then return fdlibm_tanh(x => x);
  when 'exp' then return fdlibm_exp(x => x);
  when 'ln' then return fdlibm_log(x => x);
  when 'log' then return fdlibm_log10(x => x);
  when 'sec' then return reciprocal(x => fdlibm_cos(x => x));
  when 'csc' then return reciprocal(x => fdlibm_sin(x => x));
  when 'cot' then return reciprocal(x => fdlibm_tan(x => x));
  when 'coth' then return reciprocal(x => fdlibm_tanh(x => x));
  when 'sech' then return reciprocal(x => fdlibm_cosh(x => x));
  when 'csch' then return reciprocal(x => fdlibm_sinh(x => x));
  when 'toDegrees' then return f_mul(a => x, b => 57.29577951308232::float8);
  when 'toRadians' then return f_mul(a => x, b => 0.017453292519943295::float8);
  when 'ceil', 'floor', 'signum' then raise exception 'math-operator % is integral', op;
  end case;
end $$;
-- JavaScript's base ** exponent (plate's qti-power): V8's math::pow, through the port.
create function p3.js_pow(x float8, y float8) returns float8 language sql immutable as $$ select fdlibm_pow(x => x, y => y) $$;

-- The numbers of a value's singles, as plate's arithmetic reads its operands (membersOf): all integers, or all
-- integers and floats read as floats; no row when an operand is NULL or holds another base type.
create function p3.members_of(vs p3.val[]) returns setof p3.numbers language sql immutable as $$
  select true, array(select (vs[i]).vals[k] from generate_subscripts(vs, 1) i, generate_subscripts((vs[i]).vals, 1) k order by i, k)
    where not exists (select 1 from unnest(vs) v where cardinality(v.vals) = 0)
      and not exists (select 1 from unnest(vs) v, unnest(v.vals) s where s.base <> 'integer')
  union all
  select false, array(select s_float(base => 'float', f => float_of(s => (vs[i]).vals[k])) from generate_subscripts(vs, 1) i, generate_subscripts((vs[i]).vals, 1) k order by i, k)
    where not exists (select 1 from unnest(vs) v where cardinality(v.vals) = 0)
      and exists (select 1 from unnest(vs) v, unnest(v.vals) s where s.base <> 'integer')
      and not exists (select 1 from unnest(vs) v, unnest(v.vals) s where s.base not in ('integer', 'float'))
$$;

-- A value's singles that differ, each first occurrence in order, as plate's distinct keeps them: equal singles are one
-- (-0 is 0), and a NaN is never another's equal.
create function p3.distinct_singles(v p3.single[]) returns setof p3.single language sql immutable as $$
  select unfielded(s => v[d.k])
  from (select k, row_number() over (partition by (v[k]).base, (v[k]).d, (v[k]).t, (v[k]).u, (v[k]).w,
          (v[k]).n, (v[k]).m, (v[k]).f, (v[k]).b order by k) as first
        from generate_subscripts(v, 1) k) d
  where d.first = 1 or (v[d.k]).f = 'NaN'
  order by d.k
$$;

-- Whether a value holds an integer no double holds, one past the greatest finite double (it would read as an
-- infinity): an operation over it is computed on the exact values, never on the infinity (SV-EXPR-01).
create function p3.past_double(vs p3.val[]) returns boolean language sql immutable as $$
  select exists (select 1 from unnest(vs) v, unnest(v.vals) x where x.base = 'integer' and ieee(x => x.n) in ('Infinity', '-Infinity'))
$$;
-- The sum of float singles as one exact total rounded once (the lead's ruling, 2026-11-20: exact sums, never an in-order fold
-- that rounds at every step): each double's exact value summed (exact, the machine's one decoder), then ieee. A NaN, or
-- infinities of both signs, give NaN; an infinity gives itself; a zero total is -0 only where every addend is -0, as
-- IEEE's sum of zeros is. An empty sum is +0.
create function p3.exact_sum(xs p3.single[]) returns float8 language sql immutable as $$
  select case
    when exists (select 1 from unnest(xs) x where x.f = 'NaN')
      or (exists (select 1 from unnest(xs) x where x.f = 'Infinity') and exists (select 1 from unnest(xs) x where x.f = '-Infinity'))
      then 'NaN'::float8
    when exists (select 1 from unnest(xs) x where x.f = 'Infinity') then 'Infinity'::float8
    when exists (select 1 from unnest(xs) x where x.f = '-Infinity') then '-Infinity'::float8
    else (select case when t = 0 and cardinality(xs) > 0 and not exists (select 1 from unnest(xs) x where float8send(x.f) <> float8send('-0'::float8))
      then '-0'::float8 else ieee(x => t) end
      from (select coalesce(sum(exact(f => x.f)), 0) as t from unnest(xs) x) z) end
$$;
-- A number's float, or NULL where it is outside the value set float defines (an infinity or NaN): what divide, power and
-- an operation mixing floats with an integer past the double range result in (info, divide and power: "if ... the
-- resulting value is outside the value set defined by float (not including positive and negative infinity) then the
-- operator shall result in NULL").
create function p3.float_result(x numeric) returns p3.val language sql immutable as $$
  select case when ieee(x => x) in ('Infinity', '-Infinity', 'NaN') then v_null() else v_single(s => s_float(base => 'float', f => ieee(x => x))) end
$$;
-- The product, greatest common divisor and least common multiple of integer singles, exactly.
-- The product of integer singles, exactly. Its magnitude never falls once a factor is non-zero (zero is the caller's
-- case), so a running product past what the ledger stores (QtiInteger, read back through the single it would be)
-- already aborts the grade, before numeric's own range could.
create function p3.product_of(z p3.single[]) returns numeric language plpgsql immutable as $$
declare p numeric := 1; e single;
begin
  foreach e in array z loop p := p * e.n; perform bounded(n => p); end loop;
  return p;
end $$;
create function p3.gcd_of(z p3.single[]) returns numeric language plpgsql immutable as $$
declare g numeric := 0; e single;
begin
  foreach e in array z loop g := gcd(g, e.n); end loop;
  return abs(g);
end $$;
create function p3.lcm_of(z p3.single[]) returns numeric language plpgsql immutable as $$
declare l numeric := 1; e single;
begin
  foreach e in array z loop l := lcm(l, e.n); perform bounded(n => l); end loop;
  return abs(l);
end $$;

-- math-operator's value: the operands must be single numbers; ceil, floor and signum give integers, the rest floats,
-- NaN being NULL (plate's floatOrNull).
create function p3.math_value(op text, ops p3.val[]) returns p3.val language plpgsql immutable as $$
declare xv val := numbered(v => ops[1]); yv val := case when cardinality(ops) > 1 then numbered(v => ops[2]) else v_null() end;
  xs single; r float8;
begin
  if is_null(v => xv) or (op = 'atan2' and is_null(v => yv)) then return v_null(); end if;
  xs := xv.vals[1];
  case op
  when 'ceil', 'floor' then
    if xs.base = 'integer' then return v_single(s => s_int(n => xs.n)); end if;
    if xs.f in ('Infinity', '-Infinity', 'NaN') then return v_null(); end if;
    return v_single(s => s_int(n => case op when 'ceil' then ceil(exact(f => xs.f)) when 'floor' then floor(exact(f => xs.f)) end));
  when 'signum' then
    if xs.base = 'integer' then return v_single(s => s_int(n => sign(xs.n))); end if;
    if xs.f = 'NaN' then return v_null(); end if;
    return v_single(s => s_int(n => sign(xs.f)::numeric));
  when 'abs', 'acos', 'acot', 'acsc', 'asec', 'asin', 'atan', 'atan2', 'cos', 'cosh', 'cot', 'coth', 'csc', 'csch', 'exp', 'ln',
       'log', 'sec', 'sech', 'sin', 'sinh', 'tan', 'tanh', 'toDegrees', 'toRadians' then
    r := js_math(op => op, x => float_of(s => xs), y => case when is_null(v => yv) then null else float_of(s => yv.vals[1]) end);
    return case when r = 'NaN' then v_null() else v_single(s => s_float(base => 'float', f => r)) end;
  end case;
end $$;

-- stats-operator's value, as plate's statisticOf, over the members' floats: members scaled by 2^-530 when any passes
-- 2^494 so no square overflows, summed in order; the deviations need two members; NaN is NULL.
create function p3.stat_value(members p3.single[], op text) returns p3.val language plpgsql immutable as $$
declare z float8[] := array(select float_of(s => members[k]) from generate_subscripts(members, 1) k order by k);
  scale float8 := 1; e float8; s float8 := 0; mean float8; sq float8 := 0; d float8; n int := cardinality(z); r float8;
begin
  foreach e in array z loop if abs(e) > 2::float8 ^ 494 then scale := 2::float8 ^ -530; end if; end loop;
  foreach e in array z loop s := f_add(a => s, b => f_mul(a => e, b => scale)); end loop;
  mean := f_div(a => s, b => n);
  if op = 'mean' then r := f_div(a => mean, b => scale);
  elsif n < 2 then r := 'NaN';
  else
    foreach e in array z loop d := f_sub(a => f_mul(a => e, b => scale), b => mean); sq := f_add(a => sq, b => f_mul(a => d, b => d)); end loop;
    r := case op
      when 'popSD' then f_div(a => sqrt(f_div(a => sq, b => n)), b => scale)
      when 'popVariance' then f_div(a => f_div(a => f_div(a => sq, b => n), b => scale), b => scale)
      when 'sampleSD' then f_div(a => sqrt(f_div(a => sq, b => n - 1)), b => scale)
      when 'sampleVariance' then f_div(a => f_div(a => f_div(a => sq, b => n - 1), b => scale), b => scale)
      when 'mean' then mean end;
  end if;
  return case when r = 'NaN' then v_null() else v_single(s => s_float(base => 'float', f => r)) end;
end $$;

-- y's order against one bound of x's band: -1, 0 or 1; NULL when unordered (a NaN).
-- The tolerance band is read on the exact values, the doubles as the dyadic rationals they are (the literal QTI
-- semantics: the operands are the doubles), so no band is decided by a decimal reading of a binary value.
create function p3.bound_order(mode text, side text, t float8, xs p3.single, ys p3.single) returns int language plpgsql immutable as $$
declare x numeric := number(s => xs); y numeric := number(s => ys); tt numeric; bound float8; fx float8 := float_of(s => xs);
begin
  if x in ('Infinity', '-Infinity', 'NaN') or t in ('Infinity', '-Infinity', 'NaN') then
    bound := case mode
      when 'absolute' then case side when 'lower' then f_sub(a => fx, b => t) else f_add(a => fx, b => t) end
      when 'relative' then case when (side = 'lower') = (fx >= 0) then f_mul(a => fx, b => f_sub(a => 1, b => f_div(a => t, b => 100))) else f_mul(a => fx, b => f_add(a => 1, b => f_div(a => t, b => 100))) end
      when 'exact' then null end;
    if y = 'NaN' or bound = 'NaN' then return null; end if;
    return case when y > bound::numeric then 1 when y < bound::numeric then -1 else 0 end;
  end if;
  if y in ('Infinity', '-Infinity', 'NaN') then
    return case when y = 'NaN' then null else sign(y)::int end;
  end if;
  tt := exact(f => t);
  return case mode
    when 'absolute' then sign((y - x) - case side when 'lower' then -tt else tt end)::int
    when 'relative' then sign(100 * (y - x) - abs(x) * case side when 'lower' then -tt else tt end)::int
    when 'exact' then null end;
end $$;
-- equal's value (plate's evaluateEqual): exact mode compares the numbers exactly; a tolerance mode holds y in x's
-- band, absolute or relative to |x|, each bound included as its attribute says, computed on exact rationals where x
-- and the tolerance are finite, else on floats; no usable tolerance is NULL; a value that is no single number (numbered
-- gives it empty), false.
create function p3.equal_value(eq p3.p_equal, t0 float8, t1 float8, x p3.val, y p3.val) returns p3.val language plpgsql immutable as $$
declare xs single; ys single;
begin
  if eq.mode = 'exact' then
    return v_bool(b => not is_null(v => x) and not is_null(v => y) and number(s => x.vals[1]) = number(s => y.vals[1]) and number(s => x.vals[1]) <> 'NaN');
  end if;
  if t0 is null or t1 is null then return v_bool(b => null); end if;
  if is_null(v => x) or is_null(v => y) then return v_bool(b => false); end if;
  xs := x.vals[1]; ys := y.vals[1];
  return v_bool(
    b => coalesce(bound_order(mode => eq.mode, xs => xs, ys => ys, t => t0, side => 'lower') >= case when eq.lower_in then 0 else 1 end, false)
    and coalesce(bound_order(mode => eq.mode, xs => xs, ys => ys, t => t1, side => 'upper') <= case when eq.upper_in then 0 else -1 end, false));
end $$;
