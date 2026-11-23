-- The registered custom operators of the Registry level, as P3 machine functions: composable-operators.md §2's ten
-- value-returning primitives (normalize-space, tex-normal, numeral-normal, read-number, tokenize, translate,
-- math-canonical, quantity, unit-near, phrase-distance) and rubric-score (a recorded reply), dispatched by custom_value.
-- Install after machine-leaves.sql, fold.sql and xsd.sql, before machine-eval.sql; its types are in machine-types.sql.
-- The text primitives (composable-operators.md §2.1): normalize-space, numeral-normal, read-number, tokenize and
-- translate, and the numeral serialiser math-canonical shares. \t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000 is Unicode's White_Space property, written out; no
-- pattern here uses `\s`, `\d`, `\w`, `\y` or the `i` flag, whose sets PostgreSQL takes from the
-- provider, and none names a collation. Each function is NULL for a NULL text, and an empty result is NULL (QTI 3.0.1
-- info:5780, "empty containers and empty strings are both treated as NULL"): the dispatch writes NULL as no single.

-- P1 normalize-space: XPath F&O 3.1 fn:normalize-space over Unicode's White_Space, its leading and trailing runs
-- removed and each inner run one U+0020.
create function p3.normalize_space(t text) returns text language sql immutable strict as $$
  select nullif(regexp_replace(regexp_replace(t, '^[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+|[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+$', '', 'g'), '[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+', ' ', 'g'), '')
$$;

-- markup-text: a text with its markup removed, AlphaTest's stripHtmlAndCleanText (gradebook.service.ts:6931) as the
-- lead ruled it: every `<…>` tag deleted, then exactly five entities decoded, in this order: &quot; &apos; &lt; &gt;
-- &amp; (so `&amp;lt;` is `&lt;`); `&nbsp;` is not decoded. The converter writes an essay's operand as
-- normalize-space(markup-text(RESPONSE)), so an answer of markup alone is NULL: no request, SCORE 0.
create function p3.markup_text(t text) returns text language sql immutable strict as $$
  select nullif(replace(replace(replace(replace(replace(regexp_replace(t, '<[^>]*>', '', 'g'), '&quot;', '"'), '&apos;', ''''),
    '&lt;', '<'), '&gt;', '>'), '&amp;', '&'), '')
$$;

-- P13 when-present(probe, value): `value` unchanged where `probe` is not NULL, and NULL where it is (an empty string or
-- an empty container probe is NULL, info:5780); the result has `value`'s cardinality and base type (OP-4 checks them).
-- The converter writes an essay's operand as when-present(normalize-space(markup-text(RESPONSE)), RESPONSE): the raw
-- answer, or NULL where it is markup and white space alone (the lead's final empty-essay form).
create function p3.when_present(probe p3.val, value p3.val) returns p3.val language sql immutable as $$
  select case when cardinality(probe.vals) = 0 then row(value.card, '{}'::single[])::val else value end
$$;

-- P4 read-number: the binary64 value of a finite xs:double lexical (XML Schema 1.0: a decimal with an optional
-- exponent), after xs:double's white-space collapse (XML white space at either end; inside, none is in the lexical
-- space), or NULL for any other text, INF, -INF and NaN among it: it is a text-entry record's floatValue, which plate
-- builds from the finite lexicals alone (GRADING-CLASS's ruling, composable-operators.md §2.1 P4). It is plate's
-- readIeeeDouble (model/values.ts), the reading a text-entry record's floatValue is given: the nearest double, ties to even, as XML Schema 1.1's
-- doubleLexicalMap; past the greatest finite double an infinity of the sign, below half the least subnormal a zero of
-- the sign. The value is placed by numeric input, never by a power of ten that rounds, and the machine's p3.ieee takes
-- it to the nearest double. The first 800 significant digits and a sticky digit for any non-zero one past them decide
-- the rounding exactly (no decimal a double's rounding turns on has more than 767), and a leading digit past 10^309 or
-- below 10^-400 is an infinity or a zero, so numeric's own range is never reached.
create function p3.read_number(t text) returns float8 language plpgsql immutable strict as $$
declare s text := btrim(t, E' \t\n\r'); m text[]; digits text; e numeric; lead numeric; neg boolean;
begin
  m := regexp_match(s, '^([+-]?)([0-9]*)(?:[.]([0-9]*))?(?:[Ee]([+-]?[0-9]+))?$');
  if m is null or (m[2] = '' and coalesce(m[3], '') = '') then return null; end if;
  neg := m[1] = '-';
  digits := ltrim(m[2] || coalesce(m[3], ''), '0');
  if digits = '' then return case when neg then '-0'::float8 else 0::float8 end; end if;
  e := coalesce(m[4], '0')::numeric - char_length(coalesce(m[3], ''));
  lead := e + char_length(digits) - 1;
  if lead > 309 then return case when neg then '-Infinity'::float8 else 'Infinity'::float8 end; end if;
  if lead < -400 then return case when neg then '-0'::float8 else 0::float8 end; end if;
  if char_length(digits) > 800 then
    digits := left(digits, 800) || case when substr(digits, 801) ~ '[1-9]' then '1' else '' end;
    e := lead - char_length(digits) + 1;
  end if;
  return ieee(x => ((case when neg then '-' else '' end) || digits || 'e' || e::text)::numeric);
end $$;

-- A finite double's shortest round-trip decimal, as ECMAScript's Number::toString chooses its digits (§6.1.6.1.20):
-- the fewest significant digits k whose decimal reads back as the double, the one nearest its exact value where two
-- do, the even one where both are as near. Its digits and the decimal exponent n of the point (the value is
-- 0.digits × 10^n), from the double's exact value (p3.exact) and the machine's reader (p3.ieee); no float arithmetic.
create function p3.shortest_digits(f float8) returns p3.segment language plpgsql immutable strict as $$
declare x numeric := abs(exact(f => f)); e int; d int; scale int; lo numeric; hi numeric; lo_ok boolean; hi_ok boolean; step numeric;
  chosen numeric; ds text;
begin
  e := magnitude(x => x);
  for d in 1 .. 17 loop
    -- The candidates are floor(x · 10^scale) and one more, at 10^-scale each: powers of ten as numeric input, no
    -- division.
    scale := d - 1 - e;
    step := ('1e' || -scale)::numeric;
    lo := floor(x * ('1e' || scale)::numeric) * step;
    hi := lo + step;
    lo_ok := lo <> 0 and ieee(x => lo) = abs(f);
    hi_ok := ieee(x => hi) = abs(f);
    chosen := case when lo_ok and hi_ok then
        case when x - lo < hi - x then lo when hi - x < x - lo then hi
          when mod(floor(x * ('1e' || scale)::numeric), 2) = 0 then lo else hi end
      when lo_ok then lo when hi_ok then hi end;
    if chosen is not null then
      -- hi may carry into one more digit (9.99… to 10): its digits are then one fewer, the exponent one more.
      ds := rtrim(replace(trim_scale(chosen * ('1e' || scale)::numeric)::text, '.', ''), '0');
      return row(magnitude(x => chosen) + 1, ds)::segment;
    end if;
  end loop;
  raise exception 'no decimal of 17 significant digits reads back as %', f;
end $$;
-- A double as ECMAScript's Number::toString writes it (String(x)): NaN, Infinity and -Infinity by name, a zero of
-- either sign as 0, else the shortest digits: as an integer with zeros where the point lies at 21 or fewer places, as
-- a decimal from 10^-6, else as d.ddde±n.
create function p3.numeral_text(f float8) returns text language plpgsql immutable strict as $$
declare sd segment; k int; n int; sign text := case when f < 0 then '-' else '' end;
begin
  if f = 'NaN' then return 'NaN'; elsif f = 'Infinity' then return 'Infinity'; elsif f = '-Infinity' then return '-Infinity';
  elsif f = 0 then return '0'; end if;
  sd := shortest_digits(f => f); k := char_length(sd.t); n := sd.place;
  if k <= n and n <= 21 then return sign || sd.t || repeat('0', n - k); end if;
  if 0 < n and n <= 21 then return sign || left(sd.t, n) || '.' || substr(sd.t, n + 1); end if;
  if -6 < n and n <= 0 then return sign || '0.' || repeat('0', -n) || sd.t; end if;
  return sign || left(sd.t, 1) || case when k > 1 then '.' || substr(sd.t, 2) else '' end
    || 'e' || case when n - 1 < 0 then '-' else '+' end || abs(n - 1)::text;
end $$;

-- P3 numeral-normal, its three steps in order. Step 1, every decimal numeral without its trailing fractional zeros, and its point where none is
-- left: the pattern (?<![\d.])(\d+)\.(\d*?)0+(?![\d.]) read as each maximal run of digits and points that is digits,
-- one point and digits ending in 0 (6.50t is 6.5t, 3.00 is 3; 10.05, .50 and 8.0.09 stay).
create function p3.without_trailing_zeros(t text) returns text language sql immutable strict as $$
  select coalesce(string_agg(case when r[1] ~ '^[0-9]+[.][0-9]*0$'
      then split_part(r[1], '.', 1) || coalesce(nullif('.' || rtrim(split_part(r[1], '.', 2), '0'), '.'), '')
      else r[1] end, '' order by o), '')
  from regexp_matches(t, '[0-9.]+|[^0-9.]+', 'g') with ordinality x(r, o)
$$;
-- Step 2: parentheses holding exactly one fraction n/m, n and m each one numeral ([0-9]+(.[0-9]+)?) or one letter
-- (\p{L}, read by the machine's XSD matcher), white space allowed inside, are deleted unless a digit, `/`, `÷`, `^`,
-- `_`, `!` or `%` touches them on the outside, white space skipped; repeated, so a fraction wrapped twice loses both.
-- Each round judges every such pair on the text as it stood at the round's start, as T-6 wrote it for G and A2 and A3
-- read it back (`x*(1/2)` is `x*1/2`; `(1/2)/3`, `2(1/2)` and `(1/2)^2` keep theirs).
create function p3.lone_fractions_unwrapped(input text) returns text language plpgsql immutable strict as $$
declare s text := input; nxt text; part text := '([0-9]+(?:[.][0-9]+)?|[^\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000/])'; letter text := xsd_compile(p => '\p{L}');
begin
  if strpos(s, '/') = 0 or strpos(s, '(') = 0 then return s; end if;
  loop
    -- The text as its pieces: runs without `(`, innermost pairs of parentheses, and lone `(`. A pair that holds a lone
    -- fraction is judged by the last character before it and the first after it, white space skipped: the nearest
    -- piece before and after it that has one, found by two growing windows, so a round is linear in the text.
    nxt := (with pieces as (
        select z.o, z.m[1] as piece, right(regexp_replace(z.m[1], '[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+$', ''), 1) as last_char,
          left(regexp_replace(z.m[1], '^[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+', ''), 1) as first_char,
          case when z.m[1] ~ '^[(].' then regexp_match(z.m[1], '^\([\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]*' || part || '[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]*/[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]*' || part || '[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]*\)$') end as inner_parts
        from regexp_matches(s, '[^(]+|[(][^()]*[)]|[(]', 'g') with ordinality z(m, o)),
      placed as (
        select p.*, max(case when p.last_char <> '' then p.o end) over (order by p.o rows between unbounded preceding and 1 preceding) as before_at,
          min(case when p.first_char <> '' then p.o end) over (order by p.o desc rows between unbounded preceding and 1 preceding) as after_at
        from pieces p)
      select string_agg(case when x.inner_parts is null
          or (x.inner_parts[1] !~ '^[0-9]' and not xsd_run(program => letter, v => x.inner_parts[1]))
          or (x.inner_parts[2] !~ '^[0-9]' and not xsd_run(program => letter, v => x.inner_parts[2]))
          or coalesce(b.last_char ~ '^[0-9/÷^_!%]$', false) or coalesce(f.first_char ~ '^[0-9/÷^_!%]$', false) then x.piece
        else substr(x.piece, 2, char_length(x.piece) - 2) end, '' order by x.o)
      from placed x left join pieces b on b.o = x.before_at left join pieces f on f.o = x.after_at);
    exit when nxt = s;
    s := nxt;
  end loop;
  return s;
end $$;
-- Step 3, only for numeric-ish text (a decimal digit, no letter (\p{L}, read by the machine's XSD matcher) and no `[` or
-- `]`), in order: a comma between a digit and exactly three digits that end the text or precede a non-digit is
-- deleted; `$` is deleted; every white space run is deleted, but for G's mixed number's one space: a run between an
-- integer numeral (digits after the text's start or a character no digit or point) and a fraction of digits whose
-- numerator is not zero, the pattern (?<=(^|[^0-9.])[0-9]+)\s+(?=0*[1-9][0-9]*/[0-9]) (V-24: 2 1/2 is not 21/2; `1 0 1/2`
-- is `10 1/2`, `1 0/3` is `10/3`, `1.5 1/2` is `1.51/2`: composable-operators.md b0c29ba3, COMP's bucket (c)); a pair of
-- parentheses enclosing the whole text, with none inside, is deleted, repeatedly.
create function p3.numeral_normal(input text) returns text language plpgsql immutable strict as $$
declare t text := lone_fractions_unwrapped(input => without_trailing_zeros(t => input));
begin
  if t ~ '[0-9]' and not xsd_run(program => xsd_compile(p => '[\s\S]*\p{L}[\s\S]*'), v => t) and t !~ '[][]' then
    t := regexp_replace(t, '(?<=[0-9]),(?=[0-9]{3}([^0-9]|$))', '', 'g');
    t := replace(t, '$', '');
    t := (select coalesce(string_agg(piece, '' order by o), '') from (
      select o, case when r[1] !~ '^[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]' then r[1] when coalesce(lag(r[1]) over (order by o), '') ~ '(^|[^0-9.])[0-9]+$'
          and coalesce(lead(r[1]) over (order by o), '') ~ '^0*[1-9][0-9]*/[0-9]' then ' ' else '' end as piece
      from regexp_matches(t, '[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+|[^\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+', 'g') with ordinality x(r, o)) y);
    while t ~ '^\([^()]*\)$' loop t := substr(t, 2, char_length(t) - 2); end loop;
  end if;
  return nullif(t, '');
end $$;

-- P5 tokenize: XPath F&O 3.1 fn:tokenize($input, $pattern) with no flags, the pattern an XSD regular expression
-- (Appendix F) read by the machine's own matcher (xsd.sql, qti-pattern-match's). Its separators are xsd_separators'
-- in one reading of the text: left to right, without overlap, each the match F&O chooses at the leftmost position
-- where one begins, the first of two alternatives that both match there, quantifiers greedy (composable-operators.md
-- §2.1 P5, GRADING-CLASS's ruling), as start,end pairs of code-point offsets. The pieces between them in order; none
-- where any piece is empty, since an ordered container holds no NULL. A separator that matches the empty string is
-- refused at admission (F&O FORX0003): meeting one is a defect, which aborts.
create function p3.tokenized(separator text, t text) returns setof p3.segment language plpgsql immutable strict as $$
declare program text := xsd_compile(p => separator); spans integer[]; pieces text[] := '{}'; at integer := 0; k integer := 1;
begin
  if xsd_run(program => program, v => '') then
    raise exception 'tokenize: separator % matches the empty string (FORX0003), which admission refuses', separator;
  end if;
  spans := string_to_array(nullif(xsd_separators(program => program, v => t), ''), ',')::integer[];
  while k <= coalesce(cardinality(spans), 0) loop
    pieces := pieces || substr(t, at + 1, spans[k] - at);
    at := spans[k + 1]; k := k + 2;
  end loop;
  pieces := pieces || substr(t, at + 1);
  if exists (select from unnest(pieces) p where p = '') then return; end if;
  return query select o::integer, p from unnest(pieces) with ordinality u(p, o);
end $$;

-- P6 translate: XPath F&O 3.1 fn:translate, each code point of `from` mapped to the code point at its first position's
-- place in `to`, or deleted where `to` is shorter: PostgreSQL's translate, which is exactly that on code points. A
-- NULL literal is the empty string: no code point is mapped, or every one of `from` deleted.
create function p3.translated(from_points text, t text, to_points text) returns text language sql immutable as $$
  select nullif(translate(t, coalesce(from_points, ''), coalesce(to_points, '')), '')
$$;

-- P2 tex-normal (composable-operators.md §2.1): the presentation normal form of typed math and TeX, rewritten to a
-- fixpoint, innermost first; it never reorders, evaluates or drops a grouping that carries meaning. Each pass applies
-- T-1, T-2, T-3, T-4, T-9, T-5, T-7, T-6 and T-8 in that order (empty templates before arguments are braced; spacing
-- before fractions, so "one numeral" never depends on the order rules happened to run in), the reference's
-- (PRIM's tex.ts) choices exactly: a command is a control word, a backslash and a maximal run of ASCII letters, so
-- `\left` never matches `\leftarrow`; an unbraced argument is one TeX token after optional spaces (one digit, one
-- ASCII letter, one Greek letter or one Greek command), and T-6's "one numeral or one name" also a numeral
-- [0-9]+(\.[0-9]+)?; every rule, T-8 included, runs inside the fixpoint.

-- One TeX token, as G reads an unbraced argument: one digit, one ASCII letter, one Greek letter (Α-Ρ, Σ-Ω, α-ω and
-- the variants ϑ ϕ ϖ ϱ ϵ) or one Greek command (T-5).
create function p3.tex_one_token(t text) returns boolean language sql immutable strict as $$
  select t ~ '^[0-9]$' or t ~ '^[A-Za-z]$' or t ~ '^[\u0391-\u03a1\u03a3-\u03a9\u03b1-\u03c9\u03d1\u03d5\u03d6\u03f1\u03f5]$'
    or t ~ '^\\(alpha|beta|gamma|delta|epsilon|varepsilon|zeta|eta|theta|vartheta|iota|kappa|lambda|mu|nu|xi|omicron|pi|varpi|rho|varrho|sigma|varsigma|tau|upsilon|phi|varphi|chi|psi|omega|Gamma|Delta|Theta|Lambda|Xi|Pi|Sigma|Upsilon|Phi|Psi|Omega)$'
$$;
-- One numeral or one name (T-6): a numeral may run to several digits, since `/` delimits it, and carry a sign, a
-- signed numeral being one numeral (`\frac{-37}{2}` is `-37/2`).
create function p3.tex_one_name(t text) returns boolean language sql immutable strict as $$
  select t ~ '^-?[0-9]+([.][0-9]+)?$' or tex_one_token(t => t)
$$;
-- TeX's reading of one macro argument from `i`: white space skipped, then a balanced brace group (a backslash escaping
-- the character after it), or a control word or symbol, or one character. Where it ends (the place after it) and its
-- content (a group's without its braces) and whether it is a group; no row at the end of the text, before a `}`, or
-- for an unbalanced group.
create function p3.tex_argument(i integer, s text) returns p3.argument language plpgsql immutable as $$
declare n integer := char_length(s); j integer := i; k integer; depth integer := 0; c text; m text;
begin
  while j <= n and substr(s, j, 1) ~ '^[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]$' loop j := j + 1; end loop;
  if j > n then return null; end if;
  c := substr(s, j, 1);
  if c = '{' then
    k := j;
    while k <= n loop
      c := substr(s, k, 1);
      if c = '\' then k := k + 2; continue; end if;
      if c = '{' then depth := depth + 1;
      elsif c = '}' then
        depth := depth - 1;
        if depth = 0 then return row(true, substr(s, j + 1, k - j - 1), k + 1)::argument; end if;
      end if;
      k := k + 1;
    end loop;
    return null;
  end if;
  if c = '}' then return null; end if;
  if c = '\' then
    m := (regexp_match(substr(s, j), '^\\(?:[A-Za-z]+|.)'))[1];
    if m is null then return null; end if;
    return row(false, m, j + char_length(m))::argument;
  end if;
  return row(false, c, j + 1)::argument;
end $$;
-- T-5's argument bracing: the first `\frac` or `\sqrt` (an index `[n]` kept) whose arguments are not written braced
-- and side by side, so written; the spaces between them dropped. One rewrite a pass.
create function p3.tex_braced(s text) returns text language plpgsql immutable strict as $$
declare pos integer; nth integer := 1; a argument; b argument; canonical text; idx text; j integer; k integer; closing integer;
begin
  loop
    pos := regexp_instr(s, '\\frac(?![A-Za-z])', 1, nth);
    exit when pos = 0;
    a := tex_argument(s => s, i => pos + 5);
    if a.ends_at is not null then
      b := tex_argument(s => s, i => a.ends_at);
      if b.ends_at is not null then
        canonical := '\frac{' || a.content || '}{' || b.content || '}';
        if substr(s, pos, b.ends_at - pos) <> canonical then return left(s, pos - 1) || canonical || substr(s, b.ends_at); end if;
      end if;
    end if;
    nth := nth + 1;
  end loop;
  nth := 1;
  loop
    pos := regexp_instr(s, '\\sqrt(?![A-Za-z])', 1, nth);
    exit when pos = 0;
    nth := nth + 1;
    j := pos + 5; k := j; idx := '';
    while k <= char_length(s) and substr(s, k, 1) ~ '^[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]$' loop k := k + 1; end loop;
    if substr(s, k, 1) = '[' then
      closing := strpos(substr(s, k), ']');
      continue when closing = 0;
      idx := substr(s, k, closing);
      j := k + closing;
    end if;
    a := tex_argument(s => s, i => j);
    continue when a.ends_at is null;
    canonical := '\sqrt' || idx || '{' || a.content || '}';
    if substr(s, pos, a.ends_at - pos) <> canonical then return left(s, pos - 1) || canonical || substr(s, a.ends_at); end if;
  end loop;
  return s;
end $$;
-- T-5's unwrapping: each `^{t}` and `_{t}` of one token t becomes `^t`, `_t`, unless a letter after a command would
-- extend it.
create function p3.tex_scripts(s text) returns text language plpgsql immutable as $$
declare pieces text[] := regexp_split_to_array(s, '[\^_]\{[^{}]*\}'); ops text[]; toks text[]; built text;
begin
  select array_agg(m[1] order by o), array_agg(m[2] order by o) into ops, toks
  from regexp_matches(s, '([\^_])\{([^{}]*)\}', 'g') with ordinality x(m, o);
  if ops is null then return s; end if;
  -- The text as written: each piece, then its match as T-5 leaves it, the character after a match being the next
  -- piece's first, or the next match's.
  built := pieces[1] || (select string_agg(case when tex_one_token(t => toks[k]) and not (left(toks[k], 1) = '\' and
        (case when pieces[k + 1] <> '' then left(pieces[k + 1], 1) when k < cardinality(ops) then ops[k + 1] else '' end) ~ '^[A-Za-z]$')
      then ops[k] || toks[k] else ops[k] || '{' || toks[k] || '}' end || pieces[k + 1], '' order by k) from generate_subscripts(ops, 1) k);
  return built;
end $$;
-- T-9 empty templates: `\frac{}{}`, then `\sqrt{}` and `\sqrt[]{}`, then `^{}` and `_{}` are deleted; then any other
-- `{}` unless it follows `\`, `^` or `_`, or is a brace argument of a `\frac` or `\sqrt` (deleted only with its
-- command).
create function p3.tex_empty(input text) returns text language plpgsql immutable strict as $$
declare s text := regexp_replace(regexp_replace(replace(input, '\frac{}{}', ''), '\\sqrt(?:\[\])?\{\}', '', 'g'), '[\^_]\{\}', '', 'g');
  keep integer[] := '{}'; pos integer; nth integer; a argument; b argument; j integer; closing integer; built text; cs text[];
begin
  if strpos(s, '{}') = 0 then return s; end if;
  nth := 1;
  loop
    pos := regexp_instr(s, '\\frac(?![A-Za-z])', 1, nth);
    exit when pos = 0;
    nth := nth + 1;
    a := tex_argument(s => s, i => pos + 5);
    continue when a.ends_at is null;
    if a.braced then keep := keep || (a.ends_at - char_length(a.content) - 2); end if;
    b := tex_argument(s => s, i => a.ends_at);
    if b.braced then keep := keep || (b.ends_at - char_length(b.content) - 2); end if;
  end loop;
  nth := 1;
  loop
    pos := regexp_instr(s, '\\sqrt(?![A-Za-z])', 1, nth);
    exit when pos = 0;
    nth := nth + 1;
    j := pos + 5;
    if substr(s, j, 1) = '[' then
      closing := strpos(substr(s, j), ']');
      if closing > 0 then j := j + closing; end if;
    end if;
    a := tex_argument(s => s, i => j);
    if a.braced then keep := keep || (a.ends_at - char_length(a.content) - 2); end if;
  end loop;
  -- A `{}` goes where the character before it is none of `\`, `^` and `_` and it is no kept argument: one pass over
  -- the text as its code points, deleting both braces of each such pair (two such pairs never overlap).
  cs := regexp_split_to_array(s, '');
  built := (select string_agg(x.c, '' order by x.o) from unnest(cs) with ordinality x(c, o)
    where not (x.c = '{' and coalesce(cs[x.o + 1] = '}', false) and not (x.o > 1 and cs[x.o - 1] in ('\', '^', '_')) and not (x.o::integer = any (keep)))
      and not (x.c = '}' and x.o > 1 and cs[x.o - 1] = '{' and not (x.o > 2 and cs[x.o - 2] in ('\', '^', '_')) and not ((x.o - 1)::integer = any (keep))));
  return coalesce(built, '');
end $$;
-- A fraction's part as T-6 writes it: its content less white space at either end, parenthesised unless it is one
-- numeral or one name.
create function p3.tex_part(t text) returns text language sql immutable strict as $$
  select case when tex_one_name(t => x) then x else '(' || x || ')' end
  from (select regexp_replace(t, '^[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+|[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+$', '', 'g') as x) y
$$;
-- Whether a term may start at `at` (the place of its first character), judged on the text before it, white space
-- skipped: the text's start, an opening bracket, `+`, `-`, `±`, `=`, a relation (a sign, or P2's `\le`, `\ge`, `\ne`) or
-- `,`. T-6's mixed number and G's take this one condition (composable-operators.md 1ec56b1b, COMP's bucket (c)).
create function p3.term_starts_at(at integer, s text) returns boolean language sql immutable strict as $$
  select b = '' or b ~ '[([{+\-±=<>≤≥≠,]$' or b ~ '\\(?:le|ge|ne)$'
  from (select regexp_replace(left(s, at - 1), '[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+$', '') as b) x
$$;
-- The place of the first character of the integer numeral whose last character is at `last`, as G's lexer reads
-- numerals left to right (digits, then each `,ddd` group no digit follows; a stray comma skipped), white space between
-- two of its digits inside it (composable-operators.md b0c29ba3: `1 0` is the numeral 10, starting at `1`), or NULL
-- where the digits there are no such numeral's end, or a decimal's fraction (a `.` before the numeral). `1,000` is one
-- numeral; `3,2` is `3`, a list comma, then `2`; `1 ,000` is `1`, white space, `,000`. Read over the maximal run of
-- digits, commas and white space that ends at `last` and the few characters after it, so its cost is the run's.
create function p3.integer_numeral_start(last integer, s text) returns integer language plpgsql immutable strict as $$
declare tail text := substring(left(s, last) from '[0-9,\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]*$'); cs text[]; n integer; masked boolean[]; i integer;
  j integer; r integer; w text[]; wm boolean[]; after text := substr(s, last + 1, 5); stop integer; pos integer := 1;
  q integer; first_place integer;
begin
  cs := regexp_split_to_array(tail, '');
  n := cardinality(cs);
  -- White space inside the numeral: a run of it between two digits.
  masked := array_fill(false, array[n]);
  i := 1;
  while i <= n loop
    if cs[i] ~ '^[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]$' then
      j := i;
      while j <= n and cs[j] ~ '^[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]$' loop j := j + 1; end loop;
      if i > 1 and cs[i - 1] ~ '^[0-9]$' and j <= n and cs[j] ~ '^[0-9]$' then
        for k in i .. j - 1 loop masked[k] := true; end loop;
      end if;
      i := j;
    else
      i := i + 1;
    end if;
  end loop;
  -- The run of digits, commas and white space inside the numeral that ends at `last`, then the characters after it.
  r := n + 1;
  while r > 1 and (cs[r - 1] ~ '^[0-9,]$' or masked[r - 1]) loop r := r - 1; end loop;
  w := cs[r:n] || case when after = '' then '{}'::text[] else regexp_split_to_array(after, '') end;
  wm := masked[r:n] || array_fill(false, array[char_length(after)]);
  stop := n - r + 2;
  while pos < stop loop
    if w[pos] = ',' then pos := pos + 1; continue; end if;
    q := pos;
    while q <= cardinality(w) and (w[q] ~ '^[0-9]$' or coalesce(wm[q], false)) loop q := q + 1; end loop;
    while w[q] = ',' and (w[q + 1] || w[q + 2] || w[q + 3]) ~ '^[0-9]{3}$' and coalesce(w[q + 4], '') !~ '^[0-9]$' loop q := q + 4; end loop;
    if q = stop then
      first_place := last - n + r - 1 + pos;
      return case when first_place > 1 and substr(s, first_place - 1, 1) = '.' then null else first_place end;
    end if;
    if q > stop then return null; end if;
    pos := q;
  end loop;
  return null;
end $$;
-- T-6's placing of a fraction a/b that replaces the text from `pos` to before `ends_at`, judged on the text around it,
-- white space skipped: (1) directly after an integer numeral that starts a term (integer_numeral_start, term_starts_at),
-- one space before it, a mixed number (`2\frac12` and `2 ½` are `2 1/2`); (2) wrapped as (a/b) wherever left-to-right
-- reading would regroup it, after a letter (\p{L}, read by the machine's XSD matcher; a command's last letter among
-- them), any other digit (`1.50\frac12X` is `1.50(1/2)X`, `A2\frac12` is `A2(1/2)`), a closing bracket, `*`, `/`, `÷`,
-- `^`, `_`, `!` or `%`, or before a digit, `^`, `_`, `!` or `%` (`x*\frac12` is `x*(1/2)`, `\frac12 3` is `(1/2) 3`);
-- (3) otherwise a/b. Rule (1)'s condition is G's mixed number's (composable-operators.md 1ec56b1b).
create function p3.tex_place(ends_at integer, fraction text, pos integer, s text) returns text language plpgsql immutable strict as $$
declare head text := left(s, pos - 1); tail text := substr(s, ends_at); kept text := regexp_replace(head, '[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+$', '');
  before text := right(kept, 1); after text := left(regexp_replace(tail, '^[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+', ''), 1); numeral integer;
begin
  -- A mixed number's fraction is unsigned: a signed one after a digit is parenthesised whole, below.
  if before ~ '^[0-9]$' and left(fraction, 1) <> '-' then
    numeral := integer_numeral_start(last => char_length(kept), s => s);
    if numeral is not null and term_starts_at(at => numeral, s => s) then return kept || ' ' || fraction || tail; end if;
  end if;
  if strpos(U&')]}*/\00F7^_!%', before) > 0 and before <> '' or before ~ '^[0-9]$' or after ~ '^[0-9^_!%]$'
      or before <> '' and xsd_run(program => xsd_compile(p => '\p{L}'), v => before) then
    return head || '(' || fraction || ')' || tail;
  end if;
  return head || fraction || tail;
end $$;
-- T-6: the first innermost `\frac{a}{b}` (written braced, as T-5 writes it, and holding no `\frac`) as a/b, a
-- compound part parenthesised, placed by tex_place. One rewrite a pass.
create function p3.tex_fractions(s text) returns text language plpgsql immutable strict as $$
declare pos integer; nth integer := 1; a argument; b argument;
begin
  loop
    pos := regexp_instr(s, '\\frac(?![A-Za-z])', 1, nth);
    exit when pos = 0;
    nth := nth + 1;
    a := tex_argument(s => s, i => pos + 5);
    continue when a.ends_at is null;
    b := tex_argument(s => s, i => a.ends_at);
    continue when b.ends_at is null or substr(s, pos, b.ends_at - pos) <> '\frac{' || a.content || '}{' || b.content || '}';
    continue when strpos(a.content, '\frac') > 0 or strpos(b.content, '\frac') > 0;
    return tex_place(s => s, pos => pos, ends_at => b.ends_at, fraction => tex_part(t => a.content) || '/' || tex_part(t => b.content));
  end loop;
  return s;
end $$;
-- T-3's relation commands: `\ge`, `\le` and `\ne` with no white space around them, and one space after where the
-- text after the white space starts with a letter.
create function p3.tex_relations(s text) returns text language plpgsql immutable as $$
declare pieces text[] := regexp_split_to_array(s, '[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]*\\(?:ge|le|ne)(?![A-Za-z])[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]*'); cmds text[];
begin
  select array_agg(m[1] order by o) into cmds from regexp_matches(s, '[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]*\\(ge|le|ne)(?![A-Za-z])[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]*', 'g') with ordinality x(m, o);
  if cmds is null then return s; end if;
  -- The character after a match is the next piece's first, or a next match's (white space or `\`, never a letter).
  return pieces[1] || (select string_agg('\' || cmds[k] || case when left(pieces[k + 1], 1) ~ '^[A-Za-z]$' then ' ' else '' end
    || pieces[k + 1], '' order by k) from generate_subscripts(cmds, 1) k);
end $$;
-- T-6's vulgar fractions: each of U+00BC-U+00BE and U+2150-U+215E as a/b, left to right, each placed by tex_place on
-- the text as it stands at its turn.
create function p3.tex_vulgar(input text) returns text language plpgsql immutable strict as $$
declare s text := input; pos integer;
begin
  loop
    pos := regexp_instr(s, '[\u00bc-\u00be\u2150-\u215e]');
    exit when pos = 0;
    s := tex_place(s => s, pos => pos, ends_at => pos + 1, fraction => (select v.fraction from (values (U&'\00BC', '1/4'), (U&'\00BD', '1/2'), (U&'\00BE', '3/4'), (U&'\2150', '1/7'), (U&'\2151', '1/9'), (U&'\2152', '1/10'), (U&'\2153', '1/3'), (U&'\2154', '2/3'), (U&'\2155', '1/5'), (U&'\2156', '2/5'), (U&'\2157', '3/5'), (U&'\2158', '4/5'), (U&'\2159', '1/6'), (U&'\215A', '5/6'), (U&'\215B', '1/8'), (U&'\215C', '3/8'), (U&'\215D', '5/8'), (U&'\215E', '7/8')) v(c, fraction) where v.c = substr(s, pos, 1)));
  end loop;
  return s;
end $$;
-- T-10 edge junk (V-28): the longest leading and trailing runs outside the math alphabet are deleted, and the white space
-- they leave at the edge. The alphabet: letters (\p{L}), combining marks (\p{M}, so `i̇` keeps its dot) and numbers
-- (\p{N}), read by the machine's XSD matcher, White_Space, `+-*/÷=<>^_!%|±.,:;'′"″°$€£¢`, a
-- `\` before an ASCII letter, and paired brackets, which pair by nesting whatever their kinds (`[1,6)` pairs; the `]` of
-- `10]` does not).
create function p3.tex_edges(s text) returns text language plpgsql immutable strict as $$
declare cs text[] := regexp_split_to_array(s, ''); n integer := cardinality(cs); paired boolean[]; stack integer[] := '{}'; sp integer := 0;
  lo integer := 1; hi integer; kept text; letter_or_number text := xsd_compile(p => '[\p{L}\p{M}\p{N}]');
begin
  if n = 0 then return s; end if;
  paired := array_fill(false, array[n]);
  for i in 1 .. n loop
    if cs[i] in ('(', '[', '{') then sp := sp + 1; stack[sp] := i;
    elsif cs[i] in (')', ']', '}') and sp > 0 then paired[i] := true; paired[stack[sp]] := true; sp := sp - 1;
    end if;
  end loop;
  while lo <= n and not (paired[lo] or xsd_run(program => letter_or_number, v => cs[lo]) or cs[lo] ~ '^[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]$'
      or strpos(U&'+-*/\00F7=<>^_!%|\00B1.,:;''\2032"\2033\00B0$\20AC\00A3\00A2', cs[lo]) > 0 or (cs[lo] = '\' and coalesce(cs[lo + 1] ~ '^[A-Za-z]$', false))) loop
    lo := lo + 1;
  end loop;
  hi := n;
  while hi >= lo and not (paired[hi] or xsd_run(program => letter_or_number, v => cs[hi]) or cs[hi] ~ '^[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]$'
      or strpos(U&'+-*/\00F7=<>^_!%|\00B1.,:;''\2032"\2033\00B0$\20AC\00A3\00A2', cs[hi]) > 0 or (cs[hi] = '\' and coalesce(cs[hi + 1] ~ '^[A-Za-z]$', false))) loop
    hi := hi - 1;
  end loop;
  if lo = 1 and hi = n then return s; end if;
  kept := array_to_string(cs[lo:hi], '');
  if lo > 1 then kept := regexp_replace(kept, '^[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+', ''); end if;
  if hi < n then kept := regexp_replace(kept, '[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+$', ''); end if;
  return kept;
end $$;
-- One pass: T-1 escapes; T-2 presentation commands (\left and \right with the white space after them, \, \: \; \!
-- deleted but for a run of them right after a command and before a letter, one space, since a space terminates a
-- control word (`\times\,c` is `\times c`, never the command `\timesc`); \quad, \qquad, `\ ` and `~` a space; the
-- zero-width characters U+200B-U+200D, U+2060, U+FEFF deleted); T-3
-- synonyms (⋅ and ∙ as `*`, √ as `\sqrt`, `=>` `=<` `\gt` `\lt`, the relation, π, ², ³, degree and prime symbols among
-- them); T-4 unwrapping (\textrm, \operatorname and \mbox among them), innermost first; T-9 empty templates; T-5
-- arguments; T-7 spacing; T-6 fractions (the vulgar fraction characters first), placed by tex_place; T-8 answer
-- punctuation (V-25: a leading `=`, an `e.g.` frame, a final `.`, `,` or `;`); T-10 edge junk (V-28). GRADING-CLASS's
-- rulings of composable-operators.md 215a88ee §5 item 7 among them.
create function p3.tex_pass(s text) returns text language plpgsql immutable strict as $$
declare t text := s;
begin
  t := replace(replace(replace(t, '\\', '\'), '\%', '%'), '\$', '$');
  t := regexp_replace(t, '\\(?:left|right)(?![A-Za-z])[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]*', '', 'g');
  t := regexp_replace(regexp_replace(t, '(\\[A-Za-z]+)(?:\\[,:;!])+(?=[A-Za-z])', '\1 ', 'g'), '\\[,:;!]', '', 'g');
  t := replace(replace(regexp_replace(t, '\\(?:qquad|quad)(?![A-Za-z])', ' ', 'g'), '\ ', ' '), '~', ' ');
  t := regexp_replace(t, '[\u200b-\u200d\u2060\ufeff]', '', 'g');
  t := regexp_replace(t, '\\(?:dfrac|tfrac)(?![A-Za-z])', '\\frac', 'g');
  t := regexp_replace(regexp_replace(t, '\\(?:cdot|times)(?![A-Za-z])', '*', 'g'), '[\u00d7\u00b7\u22c5\u2219]', '*', 'g');
  -- `√` is `\sqrt` and a space, as AlphaTest's ascii writes it (math-expression.util.ts:734): T-5 then braces its argument.
  t := replace(t, U&'\221A', '\sqrt ');
  t := regexp_replace(t, '\\div(?![A-Za-z])', U&'\00F7', 'g');
  t := regexp_replace(t, '\\(?:geqslant|geq)(?![A-Za-z])', '\\ge', 'g');
  t := regexp_replace(t, '\\(?:leqslant|leq)(?![A-Za-z])', '\\le', 'g');
  t := regexp_replace(t, '\\neq(?![A-Za-z])', '\\ne', 'g');
  t := regexp_replace(regexp_replace(t, '\\lbrack(?![A-Za-z])', '[', 'g'), '\\rbrack(?![A-Za-z])', ']', 'g');
  t := regexp_replace(t, '[\u2212\u2010-\u2014\ufe63\uff0d]', '-', 'g');
  -- The relations written as symbols, as commands with no space around them and one space after before a letter (so
  -- `\ge x` never reads as the command `\gex`).
  -- The symbol becomes its command, never glued to a letter after it (`3≤x` is `3\le x`, not the command `\lex`).
  -- AlphaTest's RELATION (math-expression.util.ts:647): `=>` and `=<` before `>=` and `<=`, `\gt` and `\lt` as the signs.
  t := regexp_replace(regexp_replace(t, '=>(?=[A-Za-z])', '\\ge ', 'g'), '=>', '\\ge', 'g');
  t := regexp_replace(regexp_replace(t, '=<(?=[A-Za-z])', '\\le ', 'g'), '=<', '\\le', 'g');
  t := regexp_replace(regexp_replace(t, '\\gt(?![A-Za-z])', '>', 'g'), '\\lt(?![A-Za-z])', '<', 'g');
  t := regexp_replace(regexp_replace(t, '(?:\u2265|>=)(?=[A-Za-z])', '\\ge ', 'g'), '\u2265|>=', '\\ge', 'g');
  t := regexp_replace(regexp_replace(t, '(?:\u2264|<=)(?=[A-Za-z])', '\\le ', 'g'), '\u2264|<=', '\\le', 'g');
  t := regexp_replace(regexp_replace(t, '(?:\u2260|!=)(?=[A-Za-z])', '\\ne ', 'g'), '\u2260|!=', '\\ne', 'g');
  t := tex_relations(s => t);
  t := regexp_replace(regexp_replace(t, '\u03c0(?=[A-Za-z])', '\\pi ', 'g'), '\u03c0', '\\pi', 'g');
  t := regexp_replace(regexp_replace(t, '\u00b2', '^2', 'g'), '\u00b3', '^3', 'g');
  t := regexp_replace(t, '\^\{\\circ\}|\^\\circ(?![A-Za-z])|\\circ(?![A-Za-z])|\\degree(?![A-Za-z])|\u00ba', U&'\00B0', 'g');
  t := regexp_replace(t, '\^\{\\prime\\prime\}|\^\\prime\\prime(?![A-Za-z])|\\prime\\prime(?![A-Za-z])|''''|\u201d', U&'\2033', 'g');
  t := regexp_replace(t, '\^\{\\prime\}|\^\\prime(?![A-Za-z])|\\prime(?![A-Za-z])|\u2019|''', U&'\2032', 'g');
  t := regexp_replace(t, '\\(?:text|textrm|mathrm|mathbf|mathit|operatorname|mbox)(?![A-Za-z])[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]*\{([^{}]*)\}', '\1', 'g');
  t := tex_empty(input => t);
  t := tex_scripts(s => tex_braced(s => t));
  t := regexp_replace(t, '[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]*([-+*/=<>\u00f7])[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]*', '\1', 'g');
  t := regexp_replace(regexp_replace(t, '([([{])[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+', '\1', 'g'), '[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+([])}])', '\1', 'g');
  t := tex_fractions(s => tex_vulgar(input => t));
  t := regexp_replace(t, '^=', '');
  t := regexp_replace(regexp_replace(t, '^\(e[.]g[.],?[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]*(.*)\)$', '\1'), '^e[.]g[.],?[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]*(.*)$', '\1');
  return tex_edges(s => regexp_replace(t, '[.,;]$', ''));
end $$;
-- P2 tex-normal: the passes' fixpoint; NULL for an empty result.
create function p3.tex_normal(input text) returns text language plpgsql immutable strict as $$
declare t text := input; nxt text;
begin
  loop
    nxt := tex_pass(s => t);
    exit when nxt = t;
    t := nxt;
  end loop;
  return nullif(t, '');
end $$;

-- P7 math-canonical (composable-operators.md §2.2; grading-classification.md §3.1's G and C, as revised 2026-11-20):
-- the canonical form of the expression the text writes, serialised as a prefix S-expression (PRIM's golden README, §6),
-- or NULL when the text does not parse. G reads tex-normal's output (tex-normal is idempotent, so P7 over T0S is G
-- alone). The reference's (PRIM's math.ts) choices exactly: numerals with thousands commas; one precedence for `*`,
-- `/`, `÷` and juxtaposition, left to right; a leading sign over the whole product; an unbraced `^` or `_` argument is
-- one TeX token (`x^23` is x²·3), and `^` is right-associative; a `.` that is no decimal point is `*`; functions;
-- `(`/`[` tuples; a relation inside a group; clauses joined by and/or, or by "," between two relations; any other top-level "," separates the members of an ordered list. Nothing is evaluated: sums and
-- products are n-ary, flattened and sorted by the code points of their operands' prints, a numeral prints as
-- ECMAScript's String of its binary64 value (-0 as -0).

-- TeX's Greek letter commands, as the letter each writes (a variant as the letter it varies); NULL for any other.
create function p3.greek_letter(command text) returns text language sql immutable as $$
  select v.letter from (values ('alpha', U&'\03B1'), ('beta', U&'\03B2'), ('gamma', U&'\03B3'), ('delta', U&'\03B4'), ('epsilon', U&'\03B5'), ('varepsilon', U&'\03B5'), ('zeta', U&'\03B6'), ('eta', U&'\03B7'), ('theta', U&'\03B8'), ('vartheta', U&'\03B8'), ('iota', U&'\03B9'), ('kappa', U&'\03BA'), ('lambda', U&'\03BB'), ('mu', U&'\03BC'), ('nu', U&'\03BD'), ('xi', U&'\03BE'), ('omicron', U&'\03BF'), ('pi', U&'\03C0'), ('varpi', U&'\03C0'), ('rho', U&'\03C1'), ('varrho', U&'\03C1'), ('sigma', U&'\03C3'), ('varsigma', U&'\03C2'), ('tau', U&'\03C4'), ('upsilon', U&'\03C5'), ('phi', U&'\03C6'), ('varphi', U&'\03C6'), ('chi', U&'\03C7'), ('psi', U&'\03C8'), ('omega', U&'\03C9'), ('Gamma', U&'\0393'), ('Delta', U&'\0394'), ('Theta', U&'\0398'), ('Lambda', U&'\039B'), ('Xi', U&'\039E'), ('Pi', U&'\03A0'), ('Sigma', U&'\03A3'), ('Upsilon', U&'\03A5'), ('Phi', U&'\03A6'), ('Psi', U&'\03A8'), ('Omega', U&'\03A9')) v(command, letter) where v.command = greek_letter.command
$$;
-- A numeral as a canonical form prints it: ECMAScript's String(x), but -0 as -0.
create function p3.math_numeral(f float8) returns text language sql immutable strict as $$
  select case when f = 0 and float8send(f) <> float8send(0::float8) then '-0' else numeral_text(f => f) end
$$;
-- G's numerals (composable-operators.md 1ec56b1b, COMP's bucket (c)): white space inside a numeral is a slip (V-24
-- extended to expressions), so a run of it between two digits, a digit and a decimal point, or a decimal point and a
-- digit is deleted; two numerals are never juxtaposed. The one run kept is G's mixed number's: after an integer numeral
-- that starts a term (integer_numeral_start, term_starts_at: white space between its digits is inside it), before a
-- fraction of two integer numerals whose numerator is not zero and with nothing bound after it (b0c29ba3: `1 0 1/2` is
-- 10½, `1 0/3` is 10/3). Each run is judged on the text as written; a run between two points stays.
create function p3.numeral_spaces(t text) returns text language sql immutable strict as $$
  select case when t !~ '[0-9.][\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+[0-9.]' then t else (
    select string_agg(case when x.piece !~ '^[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]' or x.before_char !~ '^[0-9.]$' or x.after_char !~ '^[0-9.]$'
        or (x.before_char = '.' and x.after_char = '.') then x.piece
      when x.before_char ~ '^[0-9]$'
        and coalesce(term_starts_at(at => integer_numeral_start(last => x.ends_at - char_length(x.piece) - 1, s => t), s => t), false)
        and substr(t, x.ends_at) ~ '^(?=[0-9,]*[1-9])[0-9]+(?:,[0-9]{3})*[/÷][0-9]+(?:,[0-9]{3})*(?![0-9.]|[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]*[\^_!%])' then x.piece
      else '' end, '' order by x.o)
    from (select y.o, y.piece, (1 + sum(char_length(y.piece)) over (order by y.o rows unbounded preceding))::integer as ends_at,
        right(lag(y.piece) over (order by y.o), 1) as before_char, left(lead(y.piece) over (order by y.o), 1) as after_char
      from (select z.o, z.m[1] as piece from regexp_matches(t, '[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+|[^\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+', 'g') with ordinality z(m, o)) y) x) end
$$;
-- G's decimal points: a `.` is one only when a digit follows it and the character before it, if any, is not a letter
-- (\p{L}, read by the machine's XSD matcher), a closing bracket or `.`; every other `.` is `*`, which G admits only
-- between two operands (`t.4` is t·4, as AlphaTest reads it). Each `.` is judged on the text as written; an ASCII
-- character is a letter exactly when it is one of [A-Za-z], so only another is read by the XSD matcher.
create function p3.math_points(t text) returns text language sql immutable strict as $$
  select case when strpos(t, '.') = 0 then t else (
    select string_agg(case when x.c = '.' and not (coalesce(a.cs[x.o + 1] ~ '^[0-9]$', false)
        and not (x.o > 1 and (strpos(')]}.', a.cs[x.o - 1]) > 0 or a.cs[x.o - 1] ~ '^[A-Za-z]$'
          or (ascii(a.cs[x.o - 1]) > 127 and xsd_run(program => xsd_compile(p => '\p{L}'), v => a.cs[x.o - 1]))))) then '*' else x.c end, '' order by x.o)
    from (select regexp_split_to_array(t, '') as cs) a, unnest(a.cs) with ordinality x(c, o)) end
$$;
-- G's tokens, or NULL where the text holds a character or command G does not read. The text is read as its lexemes,
-- each the longest at its place, its `.`s read first (math_points): white space; a numeral (digits, then every `,ddd`
-- not followed by a digit, thousands, then a decimal fraction; or a decimal fraction alone; its value text has no
-- commas); a run of ASCII letters (the joiner and/or in any case, a
-- plain function name sin cos tan log ln, or one name per letter); `\` with letters (a Greek letter's command, \sqrt,
-- a function, a relation command, or a sizing command, skipped) or `\ ` (skipped); any other single character (a
-- Greek letter, a relation, an operator). Right after `^` or `_`, a numeral is one TeX token, its first digit, and the
-- rest of it is read again on its own after it.
create function p3.math_tokens(t text) returns p3.math_token_list language plpgsql immutable strict as $$
declare lx text; kinds text[] := '{}'; vs text[] := '{}'; raws text[] := '{}'; after_script boolean := false; nm text; tail math_token_list;
begin
  for lx in select x.m[1] from regexp_matches(math_points(t => t),
      '[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+|[0-9]+(?:,[0-9]{3}(?![0-9]))*(?:[.][0-9]+)?|[.][0-9]+|[A-Za-z]+|\\[A-Za-z]+|\\ |.', 'g') with ordinality x(m, o) order by x.o loop
    if lx ~ '^[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]' then continue; end if;
    if lx ~ '^[0-9.]' then
      if after_script and lx ~ '^[0-9]' then
        kinds := kinds || 'num'::text; vs := vs || left(lx, 1); raws := raws || left(lx, 1); after_script := false;
        if char_length(lx) > 1 then
          tail := math_tokens(t => substr(lx, 2));
          if tail is null then return null; end if;
          for k in 1 .. cardinality(tail.tokens) loop
            kinds := kinds || tail.tokens[k].kind; vs := vs || tail.tokens[k].v; raws := raws || tail.tokens[k].raw;
          end loop;
        end if;
        continue;
      end if;
      if replace(lx, ',', '') !~ '^([0-9]+([.][0-9]*)?|[.][0-9]+)$' then return null; end if;
      kinds := kinds || 'num'::text; vs := vs || replace(lx, ',', ''); raws := raws || lx;
    elsif lx ~ '^[A-Za-z]' then
      if lower(lx) in ('and', 'or') then kinds := kinds || 'joiner'::text; vs := vs || lower(lx); raws := raws || lower(lx);
      elsif lx in ('sin', 'cos', 'tan', 'log', 'ln') then kinds := kinds || 'fn'::text; vs := vs || lx; raws := raws || lx;
      else
        foreach nm in array regexp_split_to_array(lx, '') loop kinds := kinds || 'name'::text; vs := vs || nm; raws := raws || nm; end loop;
      end if;
    elsif lx ~ '^[\u0391-\u03a1\u03a3-\u03a9\u03b1-\u03c9\u03d1\u03d5\u03d6\u03f1\u03f5]$' then
      nm := translate(lx, U&'\03D1\03D5\03D6\03F1\03F5', U&'\03B8\03C6\03C0\03C1\03B5');
      kinds := kinds || 'name'::text; vs := vs || nm; raws := raws || nm;
    elsif left(lx, 1) = '\' then
      nm := substr(lx, 2);
      if nm = ' ' then continue; end if;
      if greek_letter(command => nm) is not null then kinds := kinds || 'name'::text; vs := vs || greek_letter(command => nm); raws := raws || greek_letter(command => nm);
      elsif nm = 'sqrt' then kinds := kinds || 'sqrt'::text; vs := vs || nm; raws := raws || nm;
      elsif nm in ('sin', 'cos', 'tan', 'sec', 'csc', 'cot', 'arcsin', 'arccos', 'arctan', 'log', 'ln', 'exp') then
        kinds := kinds || 'fn'::text; vs := vs || nm; raws := raws || nm;
      elsif nm in ('ne', 'neq') then kinds := kinds || 'rel'::text; vs := vs || U&'\2260'::text; raws := raws || U&'\2260'::text;
      elsif nm in ('le', 'leq', 'leqslant') then kinds := kinds || 'rel'::text; vs := vs || U&'\2264'::text; raws := raws || U&'\2264'::text;
      elsif nm in ('ge', 'geq', 'geqslant') then kinds := kinds || 'rel'::text; vs := vs || U&'\2265'::text; raws := raws || U&'\2265'::text;
      elsif nm in ('big', 'Big', 'bigg', 'Bigg', 'bigl', 'bigr', 'Bigl', 'Bigr', 'biggl', 'biggr', 'Biggl', 'Biggr', 'middle') then continue;
      else return null;
      end if;
    elsif lx in ('=', '<', '>', U&'\2260', U&'\2264', U&'\2265') then kinds := kinds || 'rel'::text; vs := vs || lx; raws := raws || lx;
    elsif strpos(U&'+-*/\00F7^_%!|()[]{},', lx) > 0 then
      kinds := kinds || 'op'::text; vs := vs || lx; raws := raws || lx; after_script := lx in ('^', '_'); continue;
    else
      return null;
    end if;
    after_script := false;
  end loop;
  return row(array(select row(x.k, x.r, x.v)::math_token from unnest(kinds, vs, raws) with ordinality x(k, v, r, o) order by x.o))::math_token_list;
end $$;
-- C6 (V-27, as Bjorn's card 10 a amends it): a rational's print. A fraction and a mixed number each reduce within
-- their own form, and the two never meet. With reduce, a fraction as (q p q), its reduced p/q (q > 0, gcd 1) with its
-- sign in p, and a mixed number as its own node, (mixed w p q) or (mixed -w p q), the sign over the whole and p/q
-- reduced; without, each as written: (/ a b), and (mixed w a b) or (mixed -w a b).
create function p3.math_rational(denominator numeric, kind text, negative boolean, numerator numeric, reduce boolean, whole_part numeric) returns text language sql immutable as $$
  select case when kind = 'frac' and reduce then '(q ' || div(r.p, gcd(r.p, r.q))::text || ' ' || div(r.q, gcd(r.p, r.q))::text || ')'
    when kind = 'frac' then '(/ ' || numerator::text || ' ' || denominator::text || ')'
    else '(mixed ' || case when negative then '-' else '' end || whole_part::text || ' ' || case when reduce
      then div(numerator, gcd(numerator, denominator))::text || ' ' || div(denominator, gcd(numerator, denominator))::text
      else numerator::text || ' ' || denominator::text end || ')' end
  from (select numerator * sign(denominator) as p, abs(denominator) as q) r
$$;
-- A sign applied to a term: a numeral takes it into its value, a fraction into its numerator, a mixed number whole;
-- anything else is negated whole.
create function p3.math_signed(e p3.math_node, negative boolean, reduce boolean) returns p3.math_node language sql immutable as $$
  select case when not negative then e
    when e.kind = 'num' then row(e.ends_at, 'num', null, -e.num, null, null, null, math_numeral(f => -e.num), -e.whole)::math_node
    when e.kind = 'frac' then row(e.ends_at, 'frac', null, null, null, -e.p, e.q, math_rational(kind => 'frac', whole_part => null, numerator => -e.p, denominator => e.q, negative => false, reduce => reduce), null)::math_node
    when e.kind = 'mixed' then row(e.ends_at, 'mixed', not e.neg, null, null, e.p, e.q, math_rational(kind => 'mixed', whole_part => e.whole, numerator => e.p, denominator => e.q, negative => not e.neg, reduce => reduce), e.whole)::math_node
    else row(e.ends_at, 'neg', null, null, null, null, null, '(- ' || e.ser || ')', null)::math_node end
$$;
-- A sum's or product's operands, flattened (an operand of the same kind is its operands), as the n-ary node prints
-- them: sorted by their prints' code points, once, when the node is complete.
create function p3.math_flat(ends_at integer, op_kind text, ops p3.segment[]) returns p3.math_node language sql immutable as $$
  select row(ends_at, op_kind, null, null, ops, null, null, '(' || case op_kind when 'sum' then '+' else '*' end || ' '
    || (select string_agg(x.t, ' ' order by x.t) from unnest(ops) x) || ')', null)::math_node
$$;
-- `^`'s argument when it is one TeX token: a digit (the lexer's first digit) or a letter or Greek letter; no row for
-- anything else (a group is read by the caller).
create function p3.math_script_token(j integer, tk p3.math_token) returns p3.math_node language sql immutable as $$
  select case when tk.kind = 'num' and tk.raw ~ '^[0-9]' then row(j + 1, 'num', null, read_number(t => left(tk.raw, 1)),
      null, null, null, math_numeral(f => read_number(t => left(tk.raw, 1))), left(tk.raw, 1)::numeric)::math_node
    when tk.kind = 'name' then row(j + 1, 'name', null, null, null, null, null, tk.v, null)::math_node end
$$;
-- A clause's print, from its sides' prints and its relations in written order: a relation mirrored where it reads
-- only < and ≤ (as > and ≥); one = or ≠ with its sides sorted, a chain of = all of them; any other chain in written
-- order; no relation, the one side.
create function p3.math_clause(rels p3.segment[], sides p3.segment[]) returns text language plpgsql immutable as $$
declare ss text[] := array(select x.t from unnest(sides) x order by x.place); rs text[] := array(select x.t from unnest(rels) x order by x.place);
begin
  if cardinality(rs) = 0 then return ss[1]; end if;
  if not exists (select from unnest(rs) r where r not in ('<', U&'\2264')) then
    ss := array(select x from unnest(ss) with ordinality u(x, o) order by o desc);
    rs := array(select case r when '<' then '>' else U&'\2265' end from unnest(rs) with ordinality u(r, o) order by o desc);
  end if;
  if cardinality(rs) = 1 then
    return case when rs[1] in ('=', U&'\2260') then '(' || rs[1] || ' ' || least(ss[1], ss[2]) || ' ' || greatest(ss[1], ss[2]) || ')'
      else '(' || rs[1] || ' ' || ss[1] || ' ' || ss[2] || ')' end;
  end if;
  if not exists (select from unnest(rs) r where r <> '=') then
    return '(= ' || (select string_agg(x, ' ' order by x) from unnest(ss) x) || ')';
  end if;
  return '(chain ' || ss[1] || (select string_agg(' ' || rs[k] || ' ' || ss[k + 1], '' order by k) from generate_subscripts(rs, 1) k) || ')';
end $$;
-- G's reading from token `i`, each node canonical and printed as it is made: where it ends and its print, or no row
-- where the tokens do not parse. `mode` is `sum` (signed terms of factors joined by `*`, `/`, `÷` and juxtaposition),
-- `factor` (one primary and its postfix `%`, `!` and one `^`, right-associative: a function's argument) or `group`
-- (a bracketed clause, a relation inside it a relation node; a `(` or `[` holding top-level commas a tuple). The one
-- recursion is into a nested construct (a group, an absolute value, a function's argument, a relation's side), so a
-- text's nesting depth is the recursion's. `abs_depth` counts the open absolute values a bar may close; a group's
-- content starts with none open.
create function p3.math_expr(abs_depth integer, i integer, mode text, reduce boolean, toks p3.math_token[]) returns p3.math_node language plpgsql immutable as $$
declare j integer := i; tk math_token; opening text; closing text; items text[] := '{}'; first_item math_node; total math_node; total_first boolean;
  term math_node; term_first boolean; op text; neg_term boolean; neg_factor boolean; any_sign boolean; f math_node; g math_node;
  pw math_node; has_pw boolean; powered boolean; sub text; term_ops text[]; total_ops text[]; nx math_token; nx2 math_token;
  nx3 math_token; exponents text[]; sides segment[]; rels segment[];
begin
  if mode = 'group' then
    tk := toks[j];
    if not coalesce(tk.kind = 'op' and tk.v in ('(', '[', '{'), false) then return null; end if;
    opening := tk.v; closing := case tk.v when '(' then ')' when '[' then ']' else '}' end;
    j := j + 1; abs_depth := 0;
  end if;
  <<members>> loop
    total_first := true;
    <<terms>> loop
      -- A run of signs composes by product, negative for an odd count of minus signs, and signs the whole term.
      neg_term := false; any_sign := false;
      if mode <> 'factor' then
        loop
          tk := toks[j];
          exit when not coalesce(tk.kind = 'op' and tk.v in ('+', '-'), false);
          if tk.v = '-' then neg_term := not neg_term; end if;
          any_sign := true; j := j + 1;
        end loop;
        exit terms when not total_first and not any_sign;
      end if;
      term_first := true; op := null; neg_factor := false; term_ops := null;
      <<factors>> loop
        -- A primary.
        tk := toks[j];
        if tk.kind is null then return null;
        elsif tk.kind = 'num' then
          f := row(j + 1, 'num', null, read_number(t => tk.v), null,
            null, null, math_numeral(f => read_number(t => tk.v)), case when tk.raw ~ '^[0-9,]+$' then replace(tk.raw, ',', '')::numeric end)::math_node;
          j := j + 1;
        elsif tk.kind = 'name' then
          -- A name: one letter, with a `_` subscript of one token (a digit, a letter) or a group of letters and digits.
          j := j + 1; nx := toks[j];
          if coalesce(nx.kind = 'op' and nx.v = '_', false) then
            j := j + 1; nx := toks[j];
            if coalesce(nx.kind = 'num', false) then
              if nx.raw !~ '^[0-9]' then return null; end if;
              f := row(j + 1, 'name', null, null, null, null, null, tk.v || '_' || left(nx.raw, 1), null)::math_node; j := j + 1;
            elsif coalesce(nx.kind = 'name', false) then
              f := row(j + 1, 'name', null, null, null, null, null, tk.v || '_' || nx.v, null)::math_node; j := j + 1;
            elsif coalesce(nx.kind = 'op' and nx.v = '{', false) then
              j := j + 1; sub := '';
              loop
                nx := toks[j];
                exit when not coalesce(nx.kind in ('num', 'name'), false);
                sub := sub || case when nx.kind = 'num' then nx.raw else nx.v end; j := j + 1;
              end loop;
              if sub = '' or not coalesce(nx.kind = 'op' and nx.v = '}', false) then return null; end if;
              f := row(j + 1, 'name', null, null, null, null, null, tk.v || '_{' || sub || '}', null)::math_node; j := j + 1;
            else
              return null;
            end if;
          else
            f := row(j, 'name', null, null, null, null, null, tk.v, null)::math_node;
          end if;
        elsif tk.kind = 'fn' then
          -- A function applies to the following factor; `\sin^2 x` is (sin x)².
          j := j + 1; has_pw := false; nx := toks[j];
          if coalesce(nx.kind = 'op' and nx.v = '^', false) then
            nx := toks[j + 1];
            pw := case when coalesce(nx.kind = 'op' and nx.v in ('(', '[', '{'), false)
              then math_expr(toks => toks, i => j + 1, mode => 'group', abs_depth => abs_depth, reduce => reduce) else math_script_token(tk => nx, j => j + 1) end;
            if pw.ends_at is null then return null; end if;
            has_pw := true; j := pw.ends_at;
          end if;
          g := math_expr(toks => toks, i => j, mode => 'factor', abs_depth => abs_depth, reduce => reduce);
          if g.ends_at is null then return null; end if;
          j := g.ends_at;
          f := row(j, 'fn', null, null, null, null, null, '(' || tk.v || ' ' || g.ser || ')', null)::math_node;
          if has_pw then f := row(j, 'pow', null, null, null, null, null, '(^ ' || f.ser || ' ' || pw.ser || ')', null)::math_node; end if;
        elsif tk.kind = 'sqrt' then
          j := j + 1; has_pw := false; nx := toks[j];
          if coalesce(nx.kind = 'op' and nx.v = '[', false) then
            pw := math_expr(toks => toks, i => j, mode => 'group', abs_depth => abs_depth, reduce => reduce);
            if pw.ends_at is null then return null; end if;
            has_pw := true; j := pw.ends_at;
          end if;
          nx := toks[j];
          if not coalesce(nx.kind = 'op' and nx.v = '{', false) then return null; end if;
          g := math_expr(toks => toks, i => j, mode => 'group', abs_depth => abs_depth, reduce => reduce);
          if g.ends_at is null then return null; end if;
          j := g.ends_at;
          f := row(j, 'root', null, null, null, null, null, '(' || U&'\221A' || ' ' || case when has_pw then pw.ser || ' ' else '' end || g.ser || ')', null)::math_node;
        elsif tk.kind = 'op' and tk.v in ('(', '[', '{') then
          f := math_expr(toks => toks, i => j, mode => 'group', abs_depth => abs_depth, reduce => reduce);
          if f.ends_at is null then return null; end if;
          j := f.ends_at;
        elsif tk.kind = 'op' and tk.v = '|' then
          g := math_expr(toks => toks, i => j + 1, mode => 'sum', abs_depth => abs_depth + 1, reduce => reduce);
          if g.ends_at is null then return null; end if;
          nx := toks[g.ends_at];
          if not coalesce(nx.kind = 'op' and nx.v = '|', false) then return null; end if;
          j := g.ends_at + 1;
          f := row(j, 'abs', null, null, null, null, null, '(| ' || g.ser || ')', null)::math_node;
        else
          return null;
        end if;
        -- Its postfix `%` and `!`, and one `^` taking a group or one TeX token, right-associative: `^ e1 ^ e2` is
        -- pow(f, pow(e1, e2)).
        powered := false;
        loop
          tk := toks[j];
          if coalesce(tk.kind = 'op' and tk.v = '%', false) then j := j + 1; f := row(j, 'pct', null, null, null, null, null, '(% ' || f.ser || ')', null)::math_node;
          elsif coalesce(tk.kind = 'op' and tk.v = '!', false) then j := j + 1; f := row(j, 'fact', null, null, null, null, null, '(! ' || f.ser || ')', null)::math_node;
          elsif coalesce(tk.kind = 'op' and tk.v = '^', false) then
            if powered then return null; end if;
            powered := true; exponents := '{}';
            loop
              nx := toks[j + 1];
              pw := case when coalesce(nx.kind = 'op' and nx.v in ('(', '[', '{'), false)
                then math_expr(toks => toks, i => j + 1, mode => 'group', abs_depth => abs_depth, reduce => reduce) else math_script_token(tk => nx, j => j + 1) end;
              if pw.ends_at is null then return null; end if;
              exponents := exponents || pw.ser; j := pw.ends_at; tk := toks[j];
              exit when not coalesce(tk.kind = 'op' and tk.v = '^', false);
            end loop;
            f := row(j, 'pow', null, null, null, null, null, '(^ ' || f.ser || ' ' || coalesce((select string_agg('(^ ' || x || ' ', '' order by o) from unnest(exponents)
                with ordinality u(x, o) where o < cardinality(exponents)), '') || exponents[cardinality(exponents)]
              || repeat(')', cardinality(exponents)), null)::math_node;
          else
            exit;
          end if;
        end loop;
        if mode = 'factor' then f.ends_at := j; return f; end if;
        -- A mixed number: a term's first factor a non-negative integer numeral, then an integer numeral, `/` or `÷`,
        -- and an integer numeral not 0, with no `^ ! % _` after it (C6).
        if term_first and f.kind = 'num' and f.whole >= 0 then
          tk := toks[j]; nx := toks[j + 1]; nx2 := toks[j + 2]; nx3 := toks[j + 3];
          if coalesce(tk.kind = 'num' and tk.raw ~ '^[0-9,]+$' and nx.kind = 'op' and nx.v in ('/', U&'\00F7')
              and nx2.kind = 'num' and nx2.raw ~ '^[0-9,]+$', false) and replace(nx2.raw, ',', '')::numeric <> 0
              and not coalesce(nx3.kind = 'op' and nx3.v in ('^', '!', '%', '_'), false) then
            nx := nx2;
            f := row(j + 3, 'mixed', false,
              null, null, replace(tk.raw, ',', '')::numeric, replace(nx.raw, ',', '')::numeric, math_rational(kind => 'mixed', whole_part => f.whole, numerator => replace(tk.raw, ',', '')::numeric, denominator => replace(nx.raw, ',', '')::numeric, negative => false, reduce => reduce), f.whole)::math_node;
            j := j + 3;
          end if;
        end if;
        -- The term: `*`, `/`, `÷` and juxtaposition share one precedence, left to right; a sign after `*` or `/` signs
        -- the factor after it.
        -- A product's operands gather, flattened, until the term ends or a division takes the product whole.
        f := math_signed(negative => neg_factor, e => f, reduce => reduce);
        if term_first then term := f;
        elsif op in ('/', U&'\00F7') then
          if term_ops is not null then term := math_flat(op_kind => 'prod', ops => array(select row(o::integer, x)::segment from unnest(term_ops) with ordinality u(x, o)), ends_at => j); term_ops := null; end if;
          -- A division of two integer numerals with a divisor not 0 is a fraction (C6), its sign in the numerator;
          -- any other division stands, unreordered.
          if term.kind = 'num' and f.kind = 'num' and term.whole is not null and f.whole is not null and f.whole <> 0 then
            term := row(j, 'frac', null, null, null, term.whole * sign(f.whole),
              abs(f.whole), math_rational(kind => 'frac', whole_part => null, numerator => term.whole * sign(f.whole), denominator => abs(f.whole), negative => false, reduce => reduce), null)::math_node;
          else
            term := row(j, 'div', null, null, null, null, null, '(' || U&'\00F7' || ' ' || term.ser || ' ' || f.ser || ')', null)::math_node;
          end if;
        else
          if term_ops is null then
            term_ops := case when term.kind = 'prod' then array(select x.t from unnest(term.operands) x) else array[term.ser] end;
          end if;
          if f.kind = 'prod' then term_ops := term_ops || array(select x.t from unnest(f.operands) x); else term_ops := term_ops || f.ser; end if;
        end if;
        term_first := false; neg_factor := false;
        tk := toks[j];
        if coalesce(tk.kind = 'op' and tk.v in ('*', '/', U&'\00F7'), false) then
          op := tk.v; j := j + 1;
          loop
            nx := toks[j];
            exit when not coalesce(nx.kind = 'op' and nx.v in ('+', '-'), false);
            if nx.v = '-' then neg_factor := not neg_factor; end if;
            j := j + 1;
          end loop;
        -- Juxtaposition: an operand that starts a primary; a bar starts one only where no absolute value is open.
        elsif coalesce(tk.kind in ('num', 'name', 'sqrt', 'fn') or (tk.kind = 'op' and tk.v in ('(', '[', '{'))
            or (tk.kind = 'op' and tk.v = '|' and abs_depth = 0), false) then
          op := '*';
        else
          exit factors;
        end if;
      end loop;
      if term_ops is not null then term := math_flat(op_kind => 'prod', ops => array(select row(o::integer, x)::segment from unnest(term_ops) with ordinality u(x, o)), ends_at => j); end if;
      term := math_signed(negative => neg_term, e => term, reduce => reduce);
      -- A sum's terms gather, flattened, likewise.
      if total_first then total := term; total_ops := null;
      else
        if total_ops is null then
          total_ops := case when total.kind = 'sum' then array(select x.t from unnest(total.operands) x) else array[total.ser] end;
        end if;
        if term.kind = 'sum' then total_ops := total_ops || array(select x.t from unnest(term.operands) x); else total_ops := total_ops || term.ser; end if;
      end if;
      total_first := false;
    end loop;
    if total_ops is not null then total := math_flat(op_kind => 'sum', ops => array(select row(o::integer, x)::segment from unnest(total_ops) with ordinality u(x, o)), ends_at => j); end if;
    total.ends_at := j;
    if mode <> 'group' then return total; end if;
    -- A relation may stand inside a group (`P(X>3)=0.25`): the member is then a clause, a relation node printed as a
    -- top-level clause is.
    tk := toks[j];
    if coalesce(tk.kind = 'rel', false) then
      sides := array[row(1, total.ser)::segment]; rels := '{}';
      loop
        tk := toks[j];
        exit when not coalesce(tk.kind = 'rel', false);
        rels := rels || row(cardinality(rels) + 1, tk.v)::segment;
        g := math_expr(toks => toks, i => j + 1, mode => 'sum', abs_depth => 0, reduce => reduce);
        if g.ends_at is null then return null; end if;
        sides := sides || row(cardinality(sides) + 1, g.ser)::segment; j := g.ends_at;
      end loop;
      total := row(j, 'rel', null, null, null, null, null, math_clause(sides => sides, rels => rels), null)::math_node;
    end if;
    items := items || total.ser;
    if cardinality(items) = 1 then first_item := total; end if;
    nx := toks[j];
    if closing <> '}' and coalesce(nx.kind = 'op' and nx.v = ',', false) then j := j + 1; continue members; end if;
    -- One member closes with its own bracket; a tuple with `)` or `]`, its two kinds kept (p a parenthesis, b a bracket).
    if cardinality(items) = 1 then
      if not coalesce(nx.kind = 'op' and nx.v = closing, false) then return null; end if;
      first_item.ends_at := j + 1;
      return first_item;
    end if;
    if not coalesce(nx.kind = 'op' and nx.v in (')', ']'), false) then return null; end if;
    return row(j + 1, 'tuple', null, null, null, null, null, '(tuple ' || case opening when '(' then 'p' else 'b' end || case nx.v when ')' then 'p' else 'b' end || ' '
      || array_to_string(items, ' ') || ')', null)::math_node;
  end loop;
end $$;
-- G's text: clauses, each a sum or a chain of relations between sums (printed by math_clause), joined by and/or, or by
-- "," between two relations; any other top-level "," separates the members of an ordered list. Its print, or NULL
-- where the tokens do not parse. Joined clauses print as a sorted set.
create function p3.math_text(reduce boolean, toks p3.math_token[]) returns text language plpgsql immutable as $$
declare n integer := cardinality(toks); j integer := 1; a math_node; sides text[]; rels text[]; ser text; sers text[] := '{}';
  is_rel boolean[] := '{}'; seps text[] := '{}'; sep text; joins text[]; printed text[] := '{}'; members integer[]; tk math_token;
begin
  if n = 0 then return null; end if;
  loop
    a := math_expr(toks => toks, i => j, mode => 'sum', abs_depth => 0, reduce => reduce);
    if a.ends_at is null then return null; end if;
    sides := array[a.ser]; rels := '{}'; j := a.ends_at;
    loop
      tk := toks[j];
      exit when not coalesce(tk.kind = 'rel', false);
      rels := rels || tk.v;
      a := math_expr(toks => toks, i => j + 1, mode => 'sum', abs_depth => 0, reduce => reduce);
      if a.ends_at is null then return null; end if;
      sides := sides || a.ser; j := a.ends_at;
    end loop;
    ser := math_clause(sides => array(select row(o::integer, x)::segment from unnest(sides) with ordinality u(x, o)),
      rels => array(select row(o::integer, x)::segment from unnest(rels) with ordinality u(x, o)));
    sers := sers || ser; is_rel := is_rel || (cardinality(rels) > 0);
    exit when j > n;
    tk := toks[j];
    sep := case when tk.kind = 'joiner' then tk.v when tk.kind = 'op' and tk.v = ',' then ',' end;
    if sep is null then return null; end if;
    seps := seps || sep; j := j + 1;
  end loop;
  -- A comma joins clauses when the parts on both sides are relations; any other comma separates list members. The
  -- groups are runs, printed as each ends.
  members := array[1];
  for k in 1 .. cardinality(seps) + 1 loop
    if k <= cardinality(seps) and not (seps[k] = ',' and not (is_rel[k] and is_rel[k + 1])) then
      members := members || (k + 1);
      joins := coalesce(joins, '{}') || case when seps[k] = ',' then 'and' else seps[k] end;
      continue;
    end if;
    if cardinality(members) = 1 then printed := printed || sers[members[1]];
    else
      if exists (select from unnest(members) m where not is_rel[m]) then return null; end if;
      if (select count(distinct x) from unnest(joins) x) > 1 then return null; end if;
      printed := printed || ('(' || joins[1] || ' ' || (select string_agg(distinct sers[m], ' ' order by sers[m]) from unnest(members) m) || ')');
    end if;
    members := array[k + 1]; joins := null;
  end loop;
  return case when cardinality(printed) = 1 then printed[1] else '(list ' || array_to_string(printed, ' ') || ')' end;
end $$;
-- G's `$` at an edge (composable-operators.md b0c29ba3): a `$` at the start of the text after white space and one
-- optional sign, and a `$` at its end before white space and one optional sign, are read as nothing (`$(x^2+1)` is
-- `(x^2+1)`, `-$5x` is −5x), as AlphaTest's parser skipped them. A `$` inside stays, and G reads no expression with it.
create function p3.dollar_edges(t text) returns text language sql immutable strict as $$
  select regexp_replace(regexp_replace(t, '^([\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]*[+-]?[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]*)[$]', '\1'), '[$]([\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]*[+-]?[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]*)$', '\1')
$$;
-- G's dangling sign (composable-operators.md §2.2 P7): the run of `+` and `-` at the end, white space skipped, is
-- deleted, as AlphaTest's parser read it (`2-` is 2, `(x+2)-` is x+2, `2--` and `2-+` are 2). It is G's and not P2's,
-- so a text box keeps it (`A-`, `A--`, `Na+`); a leading sign is never touched, and an empty group `()` stays
-- significant.
create function p3.dangling_sign(t text) returns text language sql immutable strict as $$
  select regexp_replace(t, '(?:[+-][\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]*)+$', '')
$$;
-- P7 math-canonical(text, reduce): G and C over tex-normal of the text, NULL where it does not parse; `reduce` is C6's
-- switch (the box's literal, true where the item asks for no form). G prepares the text in this order before it reads
-- it (composable-operators.md 14cf8cd5 §2.2 P7): its edge `$` (dollar_edges), a dangling sign (dangling_sign), its
-- numerals' white space (numeral_spaces), then P3's step 1, the one body (without_trailing_zeros), so `x^2.0` is x²,
-- `v_0.0` is v₀ and `2 .0` is 2.
create function p3.math_canonical(input text, reduce boolean) returns text language sql immutable strict as $$
  select math_text(toks => (x.l).tokens, reduce => reduce)
  from (select math_tokens(t => without_trailing_zeros(t => numeral_spaces(t => dangling_sign(t => dollar_edges(t => tex_normal(input => input)))))) as l) x
  where x.l is not null
$$;

-- The quantity and word primitives (composable-operators.md §2.3): quantity, unit-near and phrase-distance, and the
-- roster's one typo policy, typo(w, t), which unit-near and phrase-distance share. The tables they read (a unit table,
-- typo targets, competitor and glue words, plurals) are the registry's data, never p3's: each arrives as rows of
-- p3.inputs, as mappings do (p3.table_entry, p3.table_value), bound to the class and the role it plays by the registry
-- entry (p3.table_binding), and the dispatch hands each primitive the rows of its roles, in the role's order: a map
-- table's as p3.pair, a list table's as p3.segment. Case folding is QTI's own fold
-- (p3.fold, the one qti-string-match case-sensitive="false" applies); a spelling a table keys is folded (the registry's
-- law).

-- Optimal string alignment distance (Damerau-Levenshtein restricted to adjacent swaps, each one change): `bound` + 1
-- once past `bound`.
create function p3.edit_distance(a text, b text, bound integer) returns integer language plpgsql immutable strict as $$
declare la integer := char_length(a); lb integer := char_length(b); prev2 integer[] := '{}'; prev integer[];
  cur integer[]; best integer; v integer;
begin
  if abs(la - lb) > bound then return bound + 1; end if;
  prev := array(select generate_series(0, lb));
  for i in 1 .. la loop
    cur := array[i]; best := i;
    for j in 1 .. lb loop
      v := least(prev[j + 1] + 1, cur[j] + 1, prev[j] + case when substr(a, i, 1) = substr(b, j, 1) then 0 else 1 end);
      if i > 1 and j > 1 and substr(a, i, 1) = substr(b, j - 1, 1) and substr(a, i - 1, 1) = substr(b, j, 1) then
        v := least(v, prev2[j - 1] + 1);
      end if;
      cur := cur || v; best := least(best, v);
    end loop;
    if best > bound then return bound + 1; end if;
    prev2 := prev; prev := cur;
  end loop;
  return prev[lb + 1];
end $$;
-- typo(w, t), the roster's one typo policy: NULL where w has fewer than 3 letters or another first letter than t;
-- the allowance is 0 below 4 letters of t, 1 for 4 to 8 and 2 for 9 or more; NULL where the OSA distance passes it,
-- or where t has 4 letters and w is no permutation of t; else the distance.
create function p3.typo_distance(target text, typed text) returns integer language sql immutable strict as $$
  select case when char_length(typed) < 3 or left(typed, 1) <> left(target, 1) then null
    when d > allowance then null
    when char_length(target) = 4 and not (char_length(typed) = char_length(target)
      and (select string_agg(c, '' order by c) from regexp_split_to_table(typed, '') c)
        = (select string_agg(c, '' order by c) from regexp_split_to_table(target, '') c)) then null
    else d end
  from (select allowance, edit_distance(a => typed, b => target, bound => allowance) as d
    from (select case when char_length(target) < 4 then 0 when char_length(target) <= 8 then 1 else 2 end as allowance) a) x
$$;

-- The value a map table gives a key: its first row's, in the table's order; NULL for none.
create function p3.pair_value(k text, pairs p3.pair[]) returns text language sql immutable as $$
  select p.value from unnest(pairs) p where p.key = k order by p.place limit 1
$$;
-- The unit a written unit names: the unit table's (`spellings`) identifier for the text folded, spaces around `^`
-- removed and a final `.` ignored; else the letter unit table's (`letters`) for a one-letter text; NULL for none.
create function p3.unit_of(letters p3.pair[], spellings p3.pair[], written text) returns text language sql immutable as $$
  select coalesce(pair_value(k => s, pairs => spellings), pair_value(k => regexp_replace(s, '[.]$', ''), pairs => spellings),
    case when char_length(written) = 1 then pair_value(k => s, pairs => letters) end)
  from (select regexp_replace(fold(t => written), '[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]*\^[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]*', '^', 'g') as s) x
$$;
-- P8 quantity: AlphaTest's NUMBER_THEN_REST (number-with-unit.util.ts:104), white space allowed between its parts: an
-- optional `$`, an optional sign, an optional `$`, then the numeral, digits with optional comma grouping by threes and
-- an optional decimal fraction, or a decimal fraction alone (`.5`), with an optional exponent, then the rest (GRADING-
-- CLASS's rulings). `value` the numeral's binary64 value, commas removed (read-number's reading); `rest` normalize-space
-- of what follows with the white space after a `°` deleted (`° F` is `°F`), NULL for nothing; `unit` the unit `rest`
-- names (unit_of), else `usd` where a `$` was written and nothing follows (`$` is the dollar, ISO 4217's USD, by §2's
-- definition). No row where no numeral leads, or where a `$` is written and `rest` is neither NULL nor a usd spelling,
-- whatever its unit (`$15 cents`, `$5X`: a `$` before algebra is no quantity; composable-operators.md 1ec56b1b, COMP's
-- bucket (c)). Each part's reach is the
-- reference's: the numeral is the longest at its place, which is the one its ordered alternatives take.
create function p3.quantity_of(letters p3.pair[], spellings p3.pair[], t text) returns p3.quantity language plpgsql immutable as $$
declare m text[] := regexp_match(t, '^([$]?)[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]*([+-]?)[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]*([$]?)[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]*((?:(?:[0-9]{1,3}(?:,[0-9]{3})+|[0-9]+)(?:[.][0-9]+)?|[.][0-9]+)(?:[eE][-+]?[0-9]+)?)(.*)$');
  dollar boolean; rest text; u text;
begin
  if m is null then return null; end if;
  dollar := m[1] = '$' or m[3] = '$';
  rest := normalize_space(t => regexp_replace(m[5], '\u00b0[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+', U&'\00B0', 'g'));
  u := case when rest is null then case when dollar then 'usd' end else unit_of(written => rest, spellings => spellings, letters => letters) end;
  if dollar and rest is not null and u is distinct from 'usd' then return null; end if;
  return row(rest, u, read_number(t => case when m[2] = '-' then '-' else '' end || replace(m[4], ',', '')))::quantity;
end $$;

-- Whether a run of letters is a unit glued to another unit or to a glue word (of, in, per, ...): a unit spelling or
-- glue word, then another, at least one of the two a unit.
create function p3.glued(glue p3.segment[], joined text, spellings p3.pair[]) returns boolean language sql immutable as $$
  with piece as (select p.key as w, true as named from unnest(spellings) p union all select g.t, false from unnest(glue) g)
  select exists (select from piece a join piece b on b.w = substr(joined, char_length(a.w) + 1)
    where char_length(a.w) < char_length(joined) and left(joined, char_length(a.w)) = a.w and (a.named or b.named))
$$;
-- P9 unit-near: the unit a mistyped unit phrase most nearly spells. The text, folded, is one or two words of three or
-- more letters, a final `.` ignored; no row otherwise, or where it is a unit glued to another unit or to a glue word,
-- or where no typo target of its word count is near it word by word (each word 0 if equal, 1 if equal less a final
-- `es`/`s` of the typed word and a final `s` of the target's, else typo(w, t); D the greatest). `distance` is the least
-- D, `unit` its first candidate's in the targets' order; `unit` is NULL where a competitor of another unit (the
-- `competitors` rows: the unit words, the place-value and fraction words, squared and cubed; and `words`) equals the
-- text or shares its first letter at OSA distance ≤ `distance`.
create function p3.unit_near(competitors p3.segment[], glue p3.segment[], spellings p3.pair[], t text, targets p3.segment[],
  words p3.segment[]) returns p3.near language plpgsql immutable as $$
declare typed text := regexp_replace(fold(t => t), '[.]$', ''); best text; best_unit text; best_distance integer;
begin
  if typed !~ '^[a-z]{3,}( [a-z]{3,})?$' then return null; end if;
  if glued(joined => replace(typed, ' ', ''), spellings => spellings, glue => glue) then return null; end if;
  -- A target whose first word starts with another letter is near by none of the three scores (each keeps the first
  -- letter of a word of three letters or more), so only targets of the typed first letter are weighed.
  select c.t, c.d into best, best_distance from (
    select g.place, g.t, (select case when bool_and(s.d is not null) then max(s.d) end from (
        select case when w.word = z.target then 0
          when regexp_replace(w.word, 'e?s$', '') = regexp_replace(z.target, 's$', '') then 1
          else typo_distance(typed => w.word, target => z.target) end as d
        from unnest(string_to_array(typed, ' ')) with ordinality w(word, o)
        join unnest(string_to_array(g.t, ' ')) with ordinality z(target, o) on z.o = w.o) s) as d
    from unnest(targets) g
    where left(g.t, 1) = left(typed, 1) and cardinality(string_to_array(g.t, ' ')) = cardinality(string_to_array(typed, ' '))) c
  where c.d is not null
  order by c.d, c.place limit 1;
  if best_distance is null then return null; end if;
  best_unit := pair_value(k => best, pairs => spellings);
  if exists (select from (select x.t from unnest(competitors) x union all select fold(t => x.t) from unnest(words) x) c
      where case when c.t = typed or (left(c.t, 1) = left(typed, 1) and edit_distance(a => typed, b => c.t, bound => best_distance) <= best_distance)
        then pair_value(k => c.t, pairs => spellings) is distinct from best_unit else false end) then
    return row(best_distance, null)::near;
  end if;
  return row(best_distance, best_unit)::near;
end $$;

-- The English singular of a folded word, by the registry's tables: `plurals`' singular for it, then `ies` to `y`
-- unless it is one of `ie_plurals`, then `(ch|sh|x|ss)es` to the stem, then a final `s` dropped unless it is one of
-- `never_plural` or ends in `ss`.
create function p3.noun_singular(ie_plurals p3.segment[], never_plural p3.segment[], plurals p3.pair[], w text) returns text language sql immutable as $$
  select coalesce(pair_value(k => w, pairs => plurals), case
    when w ~ 'ies$' and not exists (select from unnest(ie_plurals) x where x.t = w) then regexp_replace(w, 'ies$', 'y')
    when w ~ '(ch|sh|x|ss)es$' then regexp_replace(w, '(ch|sh|x|ss)es$', '\1')
    when w ~ 's$' and w !~ 'ss$' and not exists (select from unnest(never_plural) x where x.t = w) then left(w, -1)
    else w end)
$$;
-- A phrase's words, each folded, in order: a measure (digits with an optional fraction, one hyphen, letters: 5-pound)
-- is one word, every other word a maximal run of ASCII letters, white space and hyphens separating them; none where the
-- phrase holds anything else, a digit outside a measure among it.
create function p3.phrase_words(t text) returns setof p3.segment language sql immutable strict as $$
  with lexeme as (select x.m[1] as w, x.o from regexp_matches(t, '[0-9]+(?:[.][0-9]+)?-[A-Za-z]+|[A-Za-z]+|[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000-]+|.', 'g') with ordinality x(m, o))
  select (row_number() over (order by l.o))::integer, fold(t => l.w) from lexeme l
  where l.w ~ '^[0-9A-Za-z]' and not exists (select from lexeme e where e.w !~ '^([0-9]+([.][0-9]+)?-[A-Za-z]+|[A-Za-z]+|[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000-]+)$')
$$;
-- Whether a word is one of an accepted word's own spellings: the same English singular, or, where the accepted word
-- spells a unit, a spelling of that unit (`one` and `unit` are the accepted word's singular and unit).
create function p3.noun_own(ie_plurals p3.segment[], never_plural p3.segment[], one text, plurals p3.pair[], spellings p3.pair[], unit text,
  w text) returns boolean language sql immutable as $$
  select noun_singular(w => w, plurals => plurals, ie_plurals => ie_plurals, never_plural => never_plural) = one or (unit is not null and pair_value(k => w, pairs => spellings) = unit)
$$;
-- A noun typo of an accepted word (P10, as GRADING-CLASS ruled it; AlphaTest's isTypoOf and headVariant's glue test):
-- typo(typed, target) of the roster's one typo policy, both folded as typed, unless
--   - typed exactly: the typed word is a unit spelling, a place-value or fraction word (`contrast`) or an operation
--     word (squared, cubed), and none of the target's own spellings ("3 tenths" for tents, "6 squared" for squares);
--   - a competitor, other than the target's own spellings, equals the typed word or shares its first letter at OSA
--     distance at most the typo's: the question's words and the operation words, and the place-value and fraction words
--     and the unit words each when one of their list is the target's own or one of the question's words;
--   - glued: the typed word splits into two non-empty parts, one the target's own spelling and the other an extra word
--     (a stop word, a verb, a unit spelling, or one of the question's words of three or more letters), in either order
--     (`caterpillarsto`, `kgkilograms`).
create function p3.noun_typo(contrast p3.segment[], ie_plurals p3.segment[], never_plural p3.segment[], operation p3.segment[], plurals p3.pair[],
  spellings p3.pair[], stop_words p3.segment[], target text, typed text, unit_words p3.segment[],
  verbs p3.segment[], words p3.segment[]) returns integer language plpgsql immutable as $$
declare d integer := typo_distance(typed => typed, target => target); one text; unit text; asked text[];
begin
  if d is null then return null; end if;
  one := noun_singular(w => target, plurals => plurals, ie_plurals => ie_plurals, never_plural => never_plural);
  unit := pair_value(k => target, pairs => spellings);
  if (pair_value(k => typed, pairs => spellings) is not null or exists (select from unnest(contrast) x where x.t = typed)
      or exists (select from unnest(operation) x where x.t = typed))
      and not noun_own(w => typed, one => one, unit => unit, plurals => plurals, ie_plurals => ie_plurals, never_plural => never_plural, spellings => spellings) then
    return null;
  end if;
  asked := array(select fold(t => x.t) from unnest(words) x);
  if exists (select from (
        select o from unnest(asked) o
        union all select x.t from unnest(operation) x
        union all select x.t from unnest(contrast) x where exists (select from unnest(contrast) y
          where y.t = any (asked) or noun_own(w => y.t, one => one, unit => unit, plurals => plurals, ie_plurals => ie_plurals, never_plural => never_plural, spellings => spellings))
        union all select x.t from unnest(unit_words) x where exists (select from unnest(unit_words) y
          where y.t = any (asked) or noun_own(w => y.t, one => one, unit => unit, plurals => plurals, ie_plurals => ie_plurals, never_plural => never_plural, spellings => spellings))) c(o)
      where (c.o = typed or (left(c.o, 1) = left(typed, 1) and edit_distance(a => typed, b => c.o, bound => d) <= d))
        and not noun_own(w => c.o, one => one, unit => unit, plurals => plurals, ie_plurals => ie_plurals, never_plural => never_plural, spellings => spellings)) then
    return null;
  end if;
  if exists (select from generate_series(1, char_length(typed) - 1) n, lateral (select left(typed, n) as a, substr(typed, n + 1) as b) x
      where (noun_own(w => x.a, one => one, unit => unit, plurals => plurals, ie_plurals => ie_plurals, never_plural => never_plural, spellings => spellings)
          and (exists (select from unnest(stop_words) y where y.t = x.b) or exists (select from unnest(verbs) y where y.t = x.b)
            or pair_value(k => x.b, pairs => spellings) is not null or (char_length(x.b) >= 3 and x.b = any (asked))))
        or (noun_own(w => x.b, one => one, unit => unit, plurals => plurals, ie_plurals => ie_plurals, never_plural => never_plural, spellings => spellings)
          and (exists (select from unnest(stop_words) y where y.t = x.a) or exists (select from unnest(verbs) y where y.t = x.a)
            or pair_value(k => x.a, pairs => spellings) is not null or (char_length(x.a) >= 3 and x.a = any (asked))))) then
    return null;
  end if;
  return d;
end $$;
-- P10 phrase-distance(text, phrases, words): how far a typed phrase is from the nearest accepted phrase, by AlphaTest's
-- noun rule. Per phrase of as many words as the text: each typed word equal to the phrase's, both singularised (a
-- measure is folded only), or, where the phrase's word is its head or one plain word of the question's (`words`), a
-- noun typo of it (folded as typed); the value is the greatest typo distance used, 0 for none, and no value where a
-- word is neither. Else 0 where the text is one word that is the phrase's words run together (`peachtrees`). The least
-- value over the phrases, NULL for none; NULL where the text holds a character outside its words.
create function p3.phrase_distance(contrast p3.segment[], ie_plurals p3.segment[], never_plural p3.segment[], operation p3.segment[], phrases p3.segment[],
  plurals p3.pair[], spellings p3.pair[], stop_words p3.segment[], t text, unit_words p3.segment[],
  verbs p3.segment[], words p3.segment[]) returns integer language plpgsql immutable as $$
declare tw text[]; tn text[]; pw text[]; pn text[]; ph text; v integer; d integer; best integer; asked text[];
begin
  tw := array(select w.t from phrase_words(t => t) w order by w.place);
  if cardinality(tw) = 0 then return null; end if;
  tn := array(select case when x ~ '^[0-9]' then x else noun_singular(w => x, plurals => plurals, ie_plurals => ie_plurals, never_plural => never_plural) end
    from unnest(tw) with ordinality u(x, o) order by o);
  asked := array(select fold(t => x.t) from unnest(words) x);
  for ph in select p.t from unnest(phrases) p order by p.place loop
    pw := array(select w.t from phrase_words(t => ph) w order by w.place);
    continue when cardinality(pw) = 0;
    pn := array(select case when x ~ '^[0-9]' then x else noun_singular(w => x, plurals => plurals, ie_plurals => ie_plurals, never_plural => never_plural) end
      from unnest(pw) with ordinality u(x, o) order by o);
    v := null;
    if cardinality(tw) = cardinality(pw) then
      v := 0;
      for i in 1 .. cardinality(tw) loop
        continue when tn[i] = pn[i];
        d := case when pw[i] !~ '^[0-9]' and (i = cardinality(pw) or pw[i] = any (asked)) then noun_typo(typed => tw[i], target => pw[i], words => words, plurals => plurals,
          ie_plurals => ie_plurals, never_plural => never_plural, spellings => spellings, unit_words => unit_words, contrast => contrast, operation => operation, stop_words => stop_words, verbs => verbs) end;
        if d is null then v := null; exit; end if;
        v := greatest(v, d);
      end loop;
    end if;
    if v is null and cardinality(tw) = 1 and tn[1] = array_to_string(pn, '') then v := 0; end if;
    if v is not null and (best is null or v < best) then best := v; end if;
  end loop;
  return best;
end $$;

-- The custom operators' dispatch: the value of a bound qti-custom-operator from its class and its operands' values,
-- evaluated left to right by the arm (machine-eval.sql), so a draw inside one advances the stream as for any operator.
--
-- QTI 3.0.1, information model Table 5.37 (info:21690-21746): "The custom operator provides an extension mechanism for
-- defining operations not currently supported by this specification." Table 5.37.1, class: "allows simple
-- sub-classes to be named. The definition of a sub-class is tool specific"; Table 5.37.2, definition: "A URI that
-- identifies the definition of the custom operator in the global namespace"; Table 5.37.4, logic: "the entry of any
-- number of QTI expressions to form the basis of the functional capability of the custom operator". XSD
-- CustomOperatorDType: a choice of expressions, minOccurs 0, maxOccurs unbounded, then grpLax.any; `class`
-- IdentifierDType, `definition` xs:anyURI. An operator is bound to its class by its definition URI at admission
-- (tag:superbuilders.school,2026:qti/custom-operator/<class>), and its class, arity, operand types and literal forms
-- are the registry's laws there (OP-1 to OP-5, composable-operators.md §4), so no arm checks them again. An operator
-- the registry does not define has no binding; the arm gives it NULL and never calls this function.
--
-- The roster is composable-operators.md §2's classes: the value-returning primitives (markup-text and when-present
-- among them, the lead's rulings) and rubric-score. Each is
-- NULL iff its value operand, the first, is NULL; an empty string result is NULL (info:5780), and so is an empty
-- container. A NULL literal is the empty string (translate's from and to), the empty set (unit-near's words,
-- phrase-distance's phrases and words) or true (math-canonical's reduce, C6's default). Records return their non-NULL fields, which qti-field-value reads (info:84870: the record
-- type is "provided to enable ... customOperators to return more complex values"). The registry's tables a class reads
-- arrive in the inputs, bound by role (bound_pairs, bound_words): quantity's unit-spellings and letter-units;
-- unit-near's unit-spellings, typo-targets, competitors and glue-words; phrase-distance's plurals, ie-plurals,
-- never-plural, unit-spellings, unit-words, contrast-words, operation-words, stop-words and verbs.

-- A text as a string value: NULL, and the empty string, are no single.
create function p3.string_val(t text) returns p3.val language sql immutable as $$
  select row('single', case when t is null or t = '' then '{}'::single[] else array[s_text(base => 'string', t => t)] end)::val
$$;
-- The rows of the tables bound to a class in a role (the registry entry's binding), as the inputs carry them: a map
-- table's with their values, a list table's words, each in the role's order (binding place, then entry place).
create function p3.bound_pairs(inp p3.inputs, operator_class text, table_role text) returns setof p3.pair language sql immutable as $$
  select e.key, (row_number() over (order by b.place, e.place))::integer, v.value
  from unnest(inp.bindings) b join unnest(inp.table_entries) e on e.identifier = b.identifier
    join unnest(inp.table_values) v on v.identifier = e.identifier and v.key = e.key
  where b.class = operator_class and b.role = table_role
$$;
create function p3.bound_words(inp p3.inputs, operator_class text, table_role text) returns setof p3.segment language sql immutable as $$
  select (row_number() over (order by b.place, e.place))::integer, e.key
  from unnest(inp.bindings) b join unnest(inp.table_entries) e on e.identifier = b.identifier
  where b.class = operator_class and b.role = table_role
$$;
-- A literal operand's strings, in order, as parts.
create function p3.literal_parts(v p3.val) returns setof p3.segment language sql immutable as $$
  select i::integer, (v.vals[i]).t from generate_subscripts(v.vals, 1) i
$$;
create function p3.custom_value(drawn integer, inp p3.inputs, operator_class text, ops p3.val[], start integer) returns p3.evaluation language plpgsql immutable as $$
declare t text := case when cardinality((ops[1]).vals) = 0 then null else ((ops[1]).vals[1]).t end;
  q quantity; nr near; f float8; d integer; acc single[]; v val; demanded application[] := '{}';
  reached reached_application[] := '{}'; h human_value; evaluated boolean;
begin
  if cardinality((ops[1]).vals) = 0 then v := v_null();
  else
    case operator_class
    when 'normalize-space' then v := string_val(t => normalize_space(t => t));
    when 'markup-text' then v := string_val(t => markup_text(t => t));
    when 'when-present' then v := when_present(probe => ops[1], value => ops[2]);
    when 'tex-normal' then v := string_val(t => tex_normal(input => t));
    when 'numeral-normal' then v := string_val(t => numeral_normal(input => t));
    when 'read-number' then
      f := read_number(t => t);
      v := row('single', case when f is null then '{}'::single[] else array[s_float(base => 'float', f => f)] end)::val;
    when 'tokenize' then
      v := row('ordered', array(select s_text(base => 'string', t => p.t) from tokenized(t => t, separator => ((ops[2]).vals[1]).t) p order by p.place))::val;
    when 'translate' then v := string_val(t => translated(t => t, from_points => ((ops[2]).vals[1]).t, to_points => ((ops[3]).vals[1]).t));
    when 'math-canonical' then v := string_val(t => math_canonical(input => t, reduce => coalesce(((ops[2]).vals[1]).b, true)));
    when 'quantity' then
      q := quantity_of(t => t, spellings => array(select p from bound_pairs(inp => inp, operator_class => operator_class, table_role => 'unit-spellings') p),
        letters => array(select p from bound_pairs(inp => inp, operator_class => operator_class, table_role => 'letter-units') p));
      v := case when q is null then v_null()
        else row('record', array[s_field(s => s_float(base => 'float', f => q.value), field => 'value')]
          || case when q.unit is null then '{}'::single[] else array[s_field(s => s_text(base => 'identifier', t => q.unit), field => 'unit')] end
          || case when q.rest is null then '{}'::single[] else array[s_field(s => s_text(base => 'string', t => q.rest), field => 'rest')] end)::val end;
    when 'unit-near' then
      nr := unit_near(t => t, words => array(select p from literal_parts(v => ops[2]) p), spellings => array(select p from bound_pairs(inp => inp, operator_class => operator_class, table_role => 'unit-spellings') p),
        targets => array(select w from bound_words(inp => inp, operator_class => operator_class, table_role => 'typo-targets') w), competitors => array(select w from bound_words(inp => inp, operator_class => operator_class, table_role => 'competitors') w),
        glue => array(select w from bound_words(inp => inp, operator_class => operator_class, table_role => 'glue-words') w));
      v := case when nr is null then v_null()
        else row('record', case when nr.unit is null then '{}'::single[] else array[s_field(s => s_text(base => 'identifier', t => nr.unit), field => 'unit')] end
          || array[s_field(s => s_int(n => nr.distance), field => 'distance')])::val end;
    when 'phrase-distance' then
      d := phrase_distance(t => t, phrases => array(select p from literal_parts(v => ops[2]) p), words => array(select p from literal_parts(v => ops[3]) p),
        plurals => array(select p from bound_pairs(inp => inp, operator_class => operator_class, table_role => 'plurals') p), ie_plurals => array(select w from bound_words(inp => inp, operator_class => operator_class, table_role => 'ie-plurals') w),
        never_plural => array(select w from bound_words(inp => inp, operator_class => operator_class, table_role => 'never-plural') w), spellings => array(select p from bound_pairs(inp => inp, operator_class => operator_class, table_role => 'unit-spellings') p),
        unit_words => array(select w from bound_words(inp => inp, operator_class => operator_class, table_role => 'unit-words') w), contrast => array(select w from bound_words(inp => inp, operator_class => operator_class, table_role => 'contrast-words') w),
        operation => array(select w from bound_words(inp => inp, operator_class => operator_class, table_role => 'operation-words') w), stop_words => array(select w from bound_words(inp => inp, operator_class => operator_class, table_role => 'stop-words') w),
        verbs => array(select w from bound_words(inp => inp, operator_class => operator_class, table_role => 'verbs') w));
      v := row('single', case when d is null then '{}'::single[] else array[s_int(n => d)] end)::val;
    -- rubric-score (spec/custom-operators.md §3.3-§5), the one place a recorded application is recognized. Where a
    -- person has valued its group (the inputs' `humans`, by its rubric operand's text), that value, as a reply's record:
    -- every application of the group takes it, in place of its draws. Else it is reached, declined where it is evaluated
    -- with no reply; where the attempt's evaluator has evaluated it (the inputs' `evaluated`, the ledger's
    -- OperatorEvaluation), its recorded reply, read from the inputs (the ledger's OperatorReply rows for the attempt,
    -- keyed by the operator's start), NULL for a decline, which has none; where it has not, its request: the run demands
    -- it, and its value is NULL until a later run reads its evaluation. A NULL response makes no request (above).
    when 'rubric-score' then
      h := (select x from unnest(inp.humans) x where x.rubric = ((ops[2]).vals[1]).t);
      if h.rubric is not null then
        v := row('record', case when h.feedback is null then '{}'::single[] else array[s_field(s => s_text(base => 'string', t => h.feedback), field => 'feedback')] end
          || array[s_field(s => s_float(base => 'float', f => h.score), field => 'score')])::val;
      else
        evaluated := exists (select from unnest(inp.evaluated) e where e.start = custom_value.start);
        acc := array(select s_field(s => r.value, field => r.field) from unnest(inp.replies) r where r.start = custom_value.start order by r.field);
        reached := array[row(evaluated and cardinality(acc) = 0, ((ops[2]).vals[1]).t, custom_value.start)::reached_application];
        if not evaluated then demanded := array[row(custom_value.start)::application]; end if;
        v := case when cardinality(acc) = 0 then v_null() else row('record', acc)::val end;
      end if;
    end case;
  end if;
  return row(v.card, demanded, drawn, reached, v.vals)::evaluation;
end $$;
