-- Response admission (P4-ADMIT): the checks that refuse an answer before it is graded, judged by the database in the
-- statement that grades it. QTI 3.0.1 §7.19.7 (ItemSessionControl's validate-responses): "An invalid response is
-- defined to be a response which does not satisfy the constraints imposed by the interaction with which it is
-- associated ... When validate-responses is turned on (true) then the candidates are not allowed to submit the item
-- until they have provided valid responses for all interactions. When turned off (false) invalid responses may be
-- accepted by the system." Each interaction's limits are of two kinds (plate's reading `response-limits`): tier (a), a response no
-- interaction's controls let the candidate give (an identifier no presented choice carries, a choice given twice, more
-- than a nonzero max-choices, max-strings or max-associations, a pair outside a match-group, a value off a slider's
-- range or step), refused whatever validate-responses says; and tier (b), what a valid response needs (min-choices,
-- min-strings, a required gap, pattern-mask, a point off its image or stage), refused only under validate-responses.
-- Admission judges responses, never content: what an interaction declares is read as pantry stores it, and nothing
-- here refuses a document.
--
-- A statement calls admission_of with the runs it admits, each an answer to an item session by the session's key (the
-- run key, document-types.sql) with its session's validate-responses; the item's body as pantry stores it (its element
-- nodes and their attributes' values) and its declarations, by its document; and the values the machine's flat entry
-- takes, by the run key. It gives back, for each run, every reason the posted responses break, in plate's order, each a
-- code of the
-- closed roster below with its response and the attributes its words name, by form (a word, a count, a number); and the
-- responses the values in force hide, whose posted values the grade ignores. A reason names no words: the words are
-- the presentation's, which renders a code from its attributes.
--
-- The values in force are the record the attempt starts from: the outcomes after the last attempt (the declared
-- defaults before the first) and the session's template values, by which feedback and template content show or hide
-- the interactions they hold and template visibility the choices. The posted responses are the values the statement
-- typed from the form: a response left out is no row, NULL.

-- An element node of the item body, at its place in the document (pantry's Node, elements only), its kind the element's
-- name.
create type p3.body_node as ("end" bigint, kind text collate pg_catalog.pg_c_utf8,
  package text collate pg_catalog.pg_c_utf8, parent bigint, path text collate pg_catalog.pg_c_utf8, start bigint);
-- An attribute of a body node, by its name, as pantry's Attribute holds its value: the names admission reads (the
-- roster admittedAttributes of the ledger's module, generated from admission_one's reads).
create type p3.body_attribute as (name text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8,
  path text collate pg_catalog.pg_c_utf8, start bigint, value text collate pg_catalog.pg_c_utf8);
-- A run of admission: an answer to an item session, by the run key, and the session's validate-responses (QTI 3.0.1
-- §7.19.7, ItemSessionControl), a fact of the run's session control, never of the call.
create type p3.admission_run as (child text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8,
  path text collate pg_catalog.pg_c_utf8, stage bigint, validate boolean);
-- A reason: its place in plate's order (from 1), its code (the closed roster AdmissionCode's id, admission_one's
-- `codes`), the interaction it concerns (its element's place) and that interaction's response.
create type p3.admission_reason as (child text collate pg_catalog.pg_c_utf8, code smallint, interaction bigint,
  ord bigint, package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8,
  response text collate pg_catalog.pg_c_utf8, stage bigint);
-- A reason's attributes, by form: a word (an identifier, an axis; a group's members at their places from 1), a count
-- (a limit, a point's place, an image's extent) and a number (a stage's size, a slider's bound and step).
create type p3.admission_word as (child text collate pg_catalog.pg_c_utf8, name text collate pg_catalog.pg_c_utf8,
  ord bigint, package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, place bigint,
  stage bigint, value text collate pg_catalog.pg_c_utf8);
create type p3.admission_count as (child text collate pg_catalog.pg_c_utf8, name text collate pg_catalog.pg_c_utf8,
  ord bigint, package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, stage bigint,
  value numeric(825, 0));
create type p3.admission_number as (child text collate pg_catalog.pg_c_utf8, name text collate pg_catalog.pg_c_utf8,
  ord bigint, package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, stage bigint,
  value float8);
-- A response the values in force hide: every interaction that binds it is held by hidden or withheld content.
create type p3.admission_hidden as (child text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8,
  path text collate pg_catalog.pg_c_utf8, response text collate pg_catalog.pg_c_utf8, stage bigint);
-- A call's result: no reason is an admitted answer.
create type p3.admission as (counts p3.admission_count[], hidden p3.admission_hidden[], numbers p3.admission_number[],
  reasons p3.admission_reason[], words p3.admission_word[]);
-- A list attribute's members: a match-group's identifiers at their places from 1.
create type p3.admission_token as (place integer, token text collate pg_catalog.pg_c_utf8);

-- A closed roster met a member no branch handles: a defect, never a value.
create function p3.admission_defect(what text) returns boolean language plpgsql immutable as $$
begin raise exception 'admission: no branch for %', what; end $$;

-- A space-separated list's members (a match-group's IDREFS, its value collapsed), at their places from 1.
create function p3.admission_tokens(t text) returns setof p3.admission_token language sql immutable as $$
  select o::integer, x from unnest(regexp_split_to_array(trim_xml(t => t), '[ \t\n\r]+')) with ordinality u(x, o) where x <> ''
$$;

-- An image's authored dimension as plate reads it (authoredSizeOf): whole pixels above 0, JavaScript's trim around
-- them; NULL otherwise, as for an image that writes none.
create function p3.admission_pixels(t text) returns float8 language sql immutable as $$
  select case when v ~ '^[0-9]+$' then case when v::float8 > 0 then v::float8 end end from (select regexp_replace(t,
    '^[\t\n\v\f\r \u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]+|[\t\n\v\f\r \u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]+$',
    '', 'g') as v) x
$$;

-- JavaScript's Math.round: the nearest integer, a tie toward +Infinity.
create function p3.admission_round(x float8) returns float8 language sql immutable as $$
  select floor(x) + case when x - floor(x) >= 0.5 then 1 else 0 end
$$;

-- ECMAScript's Number::toString of a double (§6.1.6.1.20): the canonical lexical form a numeric Text Entry's value is
-- matched against its pattern-mask in (plate's `format`). Its digits are the fewest k whose decimal reads back as the
-- double, of the k-digit decimals the closest to it (the even one of two), found from the double's exact value: the
-- two k-digit decimals beside it are the only ones that can read back, so no session setting is read.
create function p3.float_text(f float8) returns text language plpgsql immutable as $$
declare x numeric; e int; k int; m numeric; lo numeric; hi numeric; s numeric; unit numeric; lo_ok boolean; hi_ok boolean;
  digits text; n int; t text;
begin
  if f = 'NaN'::float8 then return 'NaN'; end if;
  if f = 'Infinity'::float8 then return 'Infinity'; end if;
  if f = '-Infinity'::float8 then return '-Infinity'; end if;
  if f = 0 then return '0'; end if;
  x := exact(f => abs(f));
  e := magnitude(x => x);
  for k_ in 1 .. 17 loop
    k := k_;
    unit := power(10::numeric, e + 1 - k);
    m := x / unit;
    lo := floor(m); hi := ceil(m);
    lo_ok := (lo * unit)::float8 = abs(f);
    hi_ok := (hi * unit)::float8 = abs(f);
    if lo_ok or hi_ok then
      s := case when lo_ok and hi_ok then case when m - lo < hi - m then lo when hi - m < m - lo then hi
                                                when mod(lo, 2) = 0 then lo else hi end
                when lo_ok then lo else hi end;
      exit;
    end if;
  end loop;
  n := length(trunc(s)::text) + e + 1 - k;
  digits := rtrim(trunc(s)::text, '0');
  k := length(digits);
  if k <= n and n <= 21 then t := digits || repeat('0', n - k);
  elsif 0 < n and n <= 21 then t := left(digits, n) || '.' || substr(digits, n + 1);
  elsif -6 < n and n <= 0 then t := '0.' || repeat('0', -n) || digits;
  else
    t := left(digits, 1) || case when k = 1 then '' else '.' || substr(digits, 2) end
      || 'e' || case when n - 1 >= 0 then '+' else '-' end || abs(n - 1)::text;
  end if;
  return case when f < 0 then '-' || t else t end;
end $$;

-- A character reference of an xhtml value, read as plate reads one (`resolved` in plate's interactions/xhtml-text.ts):
-- `&#x` and hex digits or `&#` and decimal digits as the code point it names, where that is at most U+10FFFF and one
-- PostgreSQL's text holds (neither U+0000 nor a surrogate, which no XML value holds either); `&amp;`, `&lt;`, `&gt;`,
-- `&quot;`, `&apos;` and `&nbsp;` as what each stands for; any other as written.
create function p3.xhtml_reference(r text) returns text language sql immutable as $$
  select case
    when r !~ '^&#' then case r when '&amp;' then '&' when '&lt;' then '<' when '&gt;' then '>' when '&quot;' then '"'
      when '&apos;' then '''' when '&nbsp;' then chr(160) else r end
    when c between 1 and 1114111 and c not between 55296 and 57343 then chr(c)
    else r end
  from (select case when d = '' then 0 when hex and length(d) <= 6 then ('x' || lpad(d, 8, '0'))::bit(32)::integer
      when not hex and length(d) <= 7 then d::integer end as c
    from (select r ~ '^&#x' as hex, ltrim(substring(r from '^&#x?([0-9A-Fa-f]*);$'), '0') as d) h) n
$$;

-- What a run of block tags reads as (p3.xhtml_blocks): a blank line for each paragraph boundary it is made of alone,
-- once the value's own first paragraph start (where the run opens the value) and last paragraph end (where it closes
-- it) are set aside, so a value plate wrote reads back exactly; nothing where it opens or closes the value; one line
-- feed anywhere else (plate's runText, interactions/xhtml-text.ts).
create function p3.xhtml_run(closes boolean, opens boolean, r text) returns text language sql immutable as $$
  select case
    when i = '' then ''
    when i ~* '^(?:[\t\n\v\f\r \u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*</p[\t\n\v\f\r \u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*>[\t\n\v\f\r \u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*<p(?:[\t\n\v\f\r \u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF][^>]*)?>)+[\t\n\v\f\r \u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*$' then repeat(E'\n\n', regexp_count(i, '</p', 1, 'i'))
    when opens or closes then ''
    else E'\n' end
  from (select case when closes then regexp_replace(a, '</p[\t\n\v\f\r \u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*>$', '', 'i') else a end as i
    from (select case when opens then regexp_replace(r, '^<p(?:[\t\n\v\f\r \u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF][^>]*)?>', '', 'i') else r end as a) o) c
$$;

-- The block boundaries of an xhtml value, its br already line feeds: each run of start and end tags of the block
-- elements (QTI 3.0.1's BlockContentModel, info §6.3, and the structural children those blocks contain, whatever its
-- case: plate's blockElements, interactions/xhtml-text.ts, the one list, which the ledger's xhtml-blocks test holds
-- this one to) read by p3.xhtml_run, so words in separate blocks are separate words; every other character as
-- written. White space belongs to a run only after an end tag and before the next block tag, where it stands between
-- two elements; after a start tag it is the block's own text. The value is read as runs and the pieces between them,
-- in order, so the first piece is the value's start and the last its end. White space is JavaScript's `\s`, as plate's
-- expressions read it (plate's blockRun).
create function p3.xhtml_blocks(y text) returns text language sql immutable as $$
  select coalesce(string_agg(case
      when t.m[1] is null then t.m[2]
      else xhtml_run(r => t.m[1], opens => t.o = 1, closes => t.o = t.n) end, '' order by t.o), '')
  from (select r.m, r.o, count(*) over () as n
    from regexp_matches(y, '((?:<(?:pre|h1|h2|h3|h4|h5|h6|p|address|dl|ol|ul|hr|blockquote|table|div|article|aside|audio|figure|footer|header|nav|section|video|li|dt|dd|caption|thead|tbody|tfoot|tr|th|td|figcaption)(?:[\t\n\v\f\r \u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF][^>]*)?/?>|</(?:pre|h1|h2|h3|h4|h5|h6|p|address|dl|ol|ul|hr|blockquote|table|div|article|aside|audio|figure|footer|header|nav|section|video|li|dt|dd|caption|thead|tbody|tfoot|tr|th|td|figcaption)(?:[\t\n\v\f\r \u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF][^>]*)?>(?:[\t\n\v\f\r \u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]+(?=<(?:pre|h1|h2|h3|h4|h5|h6|p|address|dl|ol|ul|hr|blockquote|table|div|article|aside|audio|figure|footer|header|nav|section|video|li|dt|dd|caption|thead|tbody|tfoot|tr|th|td|figcaption)(?:[\t\n\v\f\r \u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF][^>]*)?/?>|</(?:pre|h1|h2|h3|h4|h5|h6|p|address|dl|ol|ul|hr|blockquote|table|div|article|aside|audio|figure|footer|header|nav|section|video|li|dt|dd|caption|thead|tbody|tfoot|tr|th|td|figcaption)(?:[\t\n\v\f\r \u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF][^>]*)?>))?)+)|([^<]+|<)', 'gi') with ordinality r(m, o)) t
$$;

-- The text of an xhtml Extended Text's value, the text its box shows, as plate reads a value (`textOfXhtml` in plate's
-- interactions/xhtml-text.ts; reading `xhtml-pattern-mask-text`): each `br` a line feed, each block boundary read by p3.xhtml_blocks (a blank
-- line between two paragraphs, a line feed between other blocks), every other tag removed, then each character
-- reference resolved in one pass (p3.xhtml_reference), so `&amp;lt;` reads `&lt;`. White space inside a tag is
-- JavaScript's `\s`, as plate's expressions read it. A value plate wrote reads back exactly as the text typed. An xhtml
-- Extended Text's pattern-mask is matched against this text, never the markup.
create function p3.xhtml_text(x text) returns text language sql immutable as $$
  select coalesce(string_agg(case when m[1] is null then m[2] else xhtml_reference(r => m[1]) end, '' order by o), '')
  from regexp_matches(
    regexp_replace(
      xhtml_blocks(y => regexp_replace(x, '<br[\t\n\v\f\r \u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*/?>', E'\n', 'gi')),
      '<[^>]*>', '', 'g'),
    '(&#x[0-9A-Fa-f]+;|&#[0-9]+;|&[A-Za-z]+;)|([^&]+|&)', 'g') with ordinality t(m, o)
$$;

-- One run's admission: its document's body's element nodes and their attributes, its responses as posted (each
-- declared response a variable, NULL where it has no single), the outcome and template values in force, and the run,
-- whose key every row it gives back is keyed by and whose validate-responses it judges under.
create function p3.admission_one(attributes p3.body_attribute[], body p3.body_node[], held p3.var[], responses p3.var[],
  run p3.admission_run)
returns p3.admission language sql immutable as $$
  with n as materialized (select b.start, b."end", b.parent, b.kind from unnest(body) b),
  -- Each element with the attributes admission reads, parsed once where a check reads them; QTI's defaults are each
  -- check's own, stated where it reads the element.
  el as materialized (
    select n.start, n."end", n.parent, n.kind,
      max(a.value) filter (where a.name = 'response-identifier') as response,
      max(a.value) filter (where a.name = 'identifier') as identifier,
      max(a.value) filter (where a.name = 'max-choices') as max_choices,
      max(a.value) filter (where a.name = 'min-choices') as min_choices,
      max(a.value) filter (where a.name = 'max-associations') as max_associations,
      max(a.value) filter (where a.name = 'min-associations') as min_associations,
      max(a.value) filter (where a.name = 'match-max') as match_max,
      max(a.value) filter (where a.name = 'match-min') as match_min,
      max(a.value) filter (where a.name = 'match-group') as match_group,
      max(a.value) filter (where a.name = 'required') as required,
      max(a.value) filter (where a.name = 'template-identifier') as template_identifier,
      max(a.value) filter (where a.name = 'outcome-identifier') as outcome_identifier,
      max(a.value) filter (where a.name = 'show-hide') as show_hide,
      max(a.value) filter (where a.name = 'hotspot-label') as hotspot_label,
      max(a.value) filter (where a.name = 'aria-label') as aria_label,
      max(a.value) filter (where a.name = 'width') as width,
      max(a.value) filter (where a.name = 'height') as height,
      max(a.value) filter (where a.name = 'center-point') as center_point,
      max(a.value) filter (where a.name = 'lower-bound') as lower_bound,
      max(a.value) filter (where a.name = 'upper-bound') as upper_bound,
      max(a.value) filter (where a.name = 'step') as step,
      max(a.value) filter (where a.name = 'max-plays') as max_plays,
      max(a.value) filter (where a.name = 'min-plays') as min_plays,
      max(a.value) filter (where a.name = 'max-strings') as max_strings,
      max(a.value) filter (where a.name = 'min-strings') as min_strings,
      max(a.value) filter (where a.name = 'pattern-mask') as pattern_mask,
      max(a.value) filter (where a.name = 'format') as format
    from n left join unnest(attributes) a on a.start = n.start
    group by n.start, n."end", n.parent, n.kind
  ),
  -- The interaction modules (plate's moduleKinds) and the responses each takes (its binding): a declaration whose
  -- cardinality the module lists, then, unless it is a record, whose base type it lists. Portable Custom takes any;
  -- Text Entry and Extended Text also take a record.
  module(kind, cards, bases) as (values
    ('qti-associate-interaction', array['single', 'multiple'], array['pair']),
    ('qti-choice-interaction', array['single', 'multiple'], array['identifier']),
    ('qti-end-attempt-interaction', array['single'], array['boolean']),
    ('qti-extended-text-interaction', array['single', 'multiple', 'ordered', 'record'], array['string', 'integer', 'float']),
    ('qti-gap-match-interaction', array['single', 'multiple'], array['directedPair']),
    ('qti-graphic-associate-interaction', array['single', 'multiple'], array['pair']),
    ('qti-graphic-gap-match-interaction', array['multiple'], array['directedPair']),
    ('qti-graphic-order-interaction', array['ordered'], array['identifier']),
    ('qti-hotspot-interaction', array['single', 'multiple'], array['identifier']),
    ('qti-hottext-interaction', array['single', 'multiple'], array['identifier']),
    ('qti-inline-choice-interaction', array['single'], array['identifier']),
    ('qti-match-interaction', array['single', 'multiple'], array['directedPair']),
    ('qti-media-interaction', array['single'], array['integer']),
    ('qti-order-interaction', array['ordered'], array['identifier']),
    ('qti-portable-custom-interaction', array['single', 'multiple', 'ordered', 'record'],
      array['identifier', 'boolean', 'integer', 'float', 'string', 'point', 'pair', 'directedPair', 'duration', 'file', 'uri']),
    ('qti-position-object-interaction', array['multiple', 'single'], array['point']),
    ('qti-select-point-interaction', array['multiple', 'single'], array['point']),
    ('qti-slider-interaction', array['single'], array['integer', 'float']),
    ('qti-text-entry-interaction', array['single', 'record'], array['string', 'integer', 'float'])
  ),
  -- The choices each interaction presents, by the element its choices are: what a post may name.
  choice_kind(kind, choice) as (values
    ('qti-choice-interaction', 'qti-simple-choice'), ('qti-hottext-interaction', 'qti-hottext'),
    ('qti-hotspot-interaction', 'qti-hotspot-choice'), ('qti-inline-choice-interaction', 'qti-inline-choice'),
    ('qti-order-interaction', 'qti-simple-choice'), ('qti-match-interaction', 'qti-simple-associable-choice'),
    ('qti-gap-match-interaction', 'qti-gap-text'), ('qti-gap-match-interaction', 'qti-gap-img'),
    ('qti-gap-match-interaction', 'qti-gap')
  ),
  -- The parts of the interactions whose choices and areas plate reads whatever their template visibility, by role.
  part_kind(kind, role, part) as (values
    ('qti-associate-interaction', 'choice', 'qti-simple-associable-choice'),
    ('qti-graphic-associate-interaction', 'area', 'qti-associable-hotspot'),
    ('qti-graphic-gap-match-interaction', 'choice', 'qti-gap-text'), ('qti-graphic-gap-match-interaction', 'choice', 'qti-gap-img'),
    ('qti-graphic-gap-match-interaction', 'area', 'qti-associable-hotspot'),
    ('qti-graphic-order-interaction', 'area', 'qti-hotspot-choice')
  ),
  -- The content that shows by a variable's values (feedback by an outcome's, template content by a template's), by the
  -- attribute that names the variable.
  gate_kind(kind) as (values ('qti-feedback-block'), ('qti-feedback-inline'), ('qti-template-block'), ('qti-template-inline')),
  decl as (select r.identifier, r.base, r.card from unnest(responses) r),
  -- An element's image: its first child img, picture or object; and its authored size where it writes both (a
  -- picture's first img child carries it, every other image itself).
  image as (
    select distinct on (c.parent) c.parent as owner, c.start, c.kind from el c
    where c.kind in ('img', 'picture', 'object') order by c.parent, c.start
  ),
  image_size as (
    select i.owner, admission_pixels(t => c.width) as width, admission_pixels(t => c.height) as height
    from image i join el c on c.start = case when i.kind = 'picture'
        then (select min(x.start) from el x where x.parent = i.start and x.kind = 'img') else i.start end
    where admission_pixels(t => c.width) is not null and admission_pixels(t => c.height) is not null
  ),
  -- The interactions plate models: a module's element bound to a declaration its binding takes, that no notice of its
  -- module replaces. A module's notices: a format outside the three (Extended Text), no image (Graphic Gap Match, Select Point, Position Object), an image
  -- without both dimensions (Select Point), an infinite bound or step (Slider), a Position Object outside a stage or
  -- with no centre; and a stage whose first element is no image of both dimensions, or that holds no Position Object.
  bound as materialized (
    select i.start, i."end", i.kind, i.parent, i.response, d.card, d.base
    from el i join module m on m.kind = i.kind join decl d on d.identifier = i.response
    where d.card = any (m.cards) and (d.card = 'record' or d.base = any (m.bases))
  ),
  modelled as (
    select b.* from bound b join el i on i.start = b.start
    where case b.kind
      when 'qti-text-entry-interaction' then true
      -- format's default, plain, is QTI's
      when 'qti-extended-text-interaction' then coalesce(trim_xml(t => i.format), 'plain') in ('plain', 'preformatted', 'xhtml')
      when 'qti-graphic-gap-match-interaction' then exists (select 1 from image m where m.owner = b.start)
      when 'qti-select-point-interaction' then exists (select 1 from image_size z where z.owner = b.start)
      when 'qti-slider-interaction' then trim_xml(t => i.lower_bound)::float8 not in ('Infinity', '-Infinity', 'NaN')
        and trim_xml(t => i.upper_bound)::float8 not in ('Infinity', '-Infinity', 'NaN')
        and (i.step is null or trim_xml(t => i.step)::float8 not in ('Infinity', '-Infinity', 'NaN'))
      when 'qti-position-object-interaction' then
        exists (select 1 from el st where st.start = b.parent and st.kind = 'qti-position-object-stage')
        and exists (select 1 from image m where m.owner = b.start
          and (i.center_point is not null or exists (select 1 from image_size z where z.owner = b.start)))
      when 'qti-associate-interaction' then true
      when 'qti-choice-interaction' then true
      when 'qti-end-attempt-interaction' then true
      when 'qti-gap-match-interaction' then true
      when 'qti-graphic-associate-interaction' then true
      when 'qti-graphic-order-interaction' then true
      when 'qti-hotspot-interaction' then true
      when 'qti-hottext-interaction' then true
      when 'qti-inline-choice-interaction' then true
      when 'qti-match-interaction' then true
      when 'qti-media-interaction' then true
      when 'qti-order-interaction' then true
      when 'qti-portable-custom-interaction' then true
      else admission_defect(what => b.kind) end
  ),
  stage as (
    select st.start, z.width, z.height from el st
    join lateral (select min(f.start) as first from el f where f.parent = st.start) f on true
    join el fi on fi.start = f.first and fi.kind in ('img', 'picture', 'object')
    join image_size z on z.owner = st.start and exists (select 1 from image m where m.owner = st.start and m.start = fi.start)
    where st.kind = 'qti-position-object-stage'
      and exists (select 1 from modelled m where m.parent = st.start and m.kind = 'qti-position-object-interaction')
  ),
  interactions as materialized (
    select m.* from modelled m
    where m.kind <> 'qti-position-object-interaction' or m.parent in (select stage.start from stage)
  ),
  -- The identifier values in force, by variable: an outcome's after the last attempt, a template variable's in the
  -- session.
  held_value as (select h.identifier, (s).t as value from unnest(held) h, unnest(h.vals) s where h.base = 'identifier'),
  -- The elements that show by a variable's values: feedback and template content, which hold what they gate, and a
  -- choice with a template-identifier, which gates itself. Each shows when its identifier is among its variable's
  -- values, or is not where show-hide is hide (QTI's default is show). Those the values in force close.
  closed as materialized (
    select g.start, g."end" from (
      select c.start, c."end", coalesce(c.outcome_identifier, c.template_identifier) as variable, c.identifier, c.show_hide
      from el c join gate_kind k on k.kind = c.kind
      union all
      select c.start, c.start + 1, c.template_identifier, c.identifier, c.show_hide
      from el c where c.template_identifier is not null and c.kind in (select choice from choice_kind)
    ) g
    where exists (select 1 from held_value h where h.identifier = g.variable and h.value = g.identifier)
      = (coalesce(trim_xml(t => g.show_hide), 'show') = 'hide')
  ),
  shown as materialized (
    select i.* from interactions i where not exists (select 1 from closed c where c.start < i.start and i.start < c."end")
  ),
  hidden as (select response from interactions except select response from shown),
  -- The choices each shown interaction presents: its choice kinds inside it that no closed gate of their own hides.
  presented as materialized (
    select i.start as istart, d.start, d.identifier, d.kind, d.parent
    from shown i join choice_kind k on k.kind = i.kind
    join el d on d.start > i.start and d.start < i."end" and d.kind = k.choice
    where not exists (select 1 from closed c where c.start = d.start)
  ),
  -- The choices or areas of one of an interaction's child kinds, in document order, whatever their template visibility
  -- (Associate and the graphic interactions only mark it): each with its match-max (which QTI requires) and its
  -- match-min (QTI's default 0).
  parts as materialized (
    select i.start as istart, k.role, c.start, c.identifier, trim_xml(t => c.match_max)::numeric as match_max,
      coalesce(trim_xml(t => c.match_min)::numeric, 0) as match_min, c.match_group
    from shown i join part_kind k on k.kind = i.kind join el c on c.parent = i.start and c.kind = k.part
  ),
  -- The posted values, each at its place from 1 (a multiple's in the order its rows give them, a record's
  -- stringValue alone): an identifier's or a string's text, a numeric Text Entry's canonical form, a pair's or a
  -- directed pair's two identifiers, a number, an integer, a point.
  posted as materialized (
    select r.identifier as response, x.ordinality::integer as place, r.base, r.vals[x.ordinality] as s
    from unnest(responses) r cross join lateral unnest(r.vals) with ordinality x where r.card <> 'record'
    union all
    select r.identifier, 1, 'string', s from unnest(responses) r cross join lateral unnest(r.vals) s
    where r.card = 'record' and (s).field = 'stringValue'
  ),
  p as (
    select response, place, case base when 'integer' then (s).n::text when 'float' then float_text(f => (s).f) else (s).t end as value
    from posted
  ),
  p_pair as (select response, place, (s).t as a, (s).u as b from posted where base in ('pair', 'directedPair')),
  p_number as (select response, place, case base when 'integer' then (s).n::float8 else (s).f end as number
    from posted where base in ('integer', 'float')),
  p_whole as (select response, place, (s).n as whole from posted where base = 'integer'),
  p_point as (select response, place, (s).n as x, (s).m as y from posted where base = 'point'),
  given as (select response, count(*) as n from p group by response),
  -- Choice, Hottext and Hotspot: picks from the presented choices, at most max-choices (QTI's default 1), at least
  -- min-choices (default 0).
  picks as (
    select i.start, i.response, coalesce(trim_xml(t => e.max_choices)::numeric, 1) as most,
      coalesce(trim_xml(t => e.min_choices)::numeric, 0) as least, coalesce(g.n, 0) as n
    from shown i join el e on e.start = i.start left join given g on g.response = i.response
    where i.kind in ('qti-choice-interaction', 'qti-hottext-interaction', 'qti-hotspot-interaction')
  ),
  -- Inline Choice: one of its presented choices, at least min-choices (default 0), or 1 where it is required (default
  -- false).
  inline as (
    select i.start, i.response,
      greatest(coalesce(trim_xml(t => e.min_choices)::numeric, 0), case when xs_boolean(t => e.required, dflt => false) then 1 else 0 end) as least,
      coalesce(g.n, 0) as n
    from shown i join el e on e.start = i.start left join given g on g.response = i.response
    where i.kind = 'qti-inline-choice-interaction'
  ),
  -- Match and Gap Match: at most max-associations (default 1), at least min-associations (default 0); their choices by
  -- side (a Match's last set the targets and its others the sources; a Gap Match's texts and images the sources and its
  -- gaps the targets).
  match_sets as (
    select i.start, i.response, i.kind, coalesce(trim_xml(t => e.max_associations)::numeric, 1) as most,
      coalesce(trim_xml(t => e.min_associations)::numeric, 0) as least
    from shown i join el e on e.start = i.start where i.kind in ('qti-match-interaction', 'qti-gap-match-interaction')
  ),
  sides as (
    select ms.start as istart, ms.kind as ikind, c.start, c.identifier,
      case ms.kind
        when 'qti-gap-match-interaction' then case c.kind when 'qti-gap' then 'target' when 'qti-gap-text' then 'source'
          when 'qti-gap-img' then 'source' else case when admission_defect(what => c.kind) then '' end end
        when 'qti-match-interaction' then case when c.parent = (select max(m.start) from el m
          where m.parent = ms.start and m.kind = 'qti-simple-match-set') then 'target' else 'source' end
        else case when admission_defect(what => ms.kind) then '' end
      end as side
    from match_sets ms join presented c on c.istart = ms.start
  ),
  -- Which sides' choices carry match limits: both of a Match, a Gap Match's sources alone (its gaps hold one choice
  -- each, gapMatchGapFull). Each limited choice with match-max (QTI requires it), match-min (default 0) and its uses.
  limited as (
    select d.*, trim_xml(t => e.match_max)::numeric as match_max, coalesce(trim_xml(t => e.match_min)::numeric, 0) as match_min,
      (select count(*) from match_sets ms join p_pair q on q.response = ms.response
       where ms.start = d.istart and case d.side when 'source' then q.a else q.b end = d.identifier) as uses
    from sides d join el e on e.start = d.start
    where d.ikind = 'qti-match-interaction' or d.side = 'source'
  ),
  pairs as (
    select ms.start as istart, ms.response, ms.kind, q.place, q.a, q.b from match_sets ms join p_pair q on q.response = ms.response
  ),
  groups as (
    select d.istart, d.side, d.identifier, t.place as ord, t.token as allowed
    from sides d join el e on e.start = d.start cross join lateral admission_tokens(t => e.match_group) t
  ),
  outside as (
    select q.istart, q.response, q.kind, q.a, q.b, min(q.place) as place,
      case when exists (select 1 from groups g where g.istart = q.istart and g.side = 'source' and g.identifier = q.a)
            and not exists (select 1 from groups g where g.istart = q.istart and g.side = 'source' and g.identifier = q.a and g.allowed = q.b)
           then 'source' else 'target' end as holder
    from pairs q
    -- only a pair of a source and a target the interaction presents is judged against their groups
    where exists (select 1 from sides d where d.istart = q.istart and d.side = 'source' and d.identifier = q.a)
      and exists (select 1 from sides d where d.istart = q.istart and d.side = 'target' and d.identifier = q.b)
      and ((exists (select 1 from groups g where g.istart = q.istart and g.side = 'source' and g.identifier = q.a)
           and not exists (select 1 from groups g where g.istart = q.istart and g.side = 'source' and g.identifier = q.a and g.allowed = q.b))
       or (exists (select 1 from groups g where g.istart = q.istart and g.side = 'target' and g.identifier = q.b)
           and not exists (select 1 from groups g where g.istart = q.istart and g.side = 'target' and g.identifier = q.b and g.allowed = q.a)))
    group by q.istart, q.response, q.kind, q.a, q.b
  ),
  -- Order: its presented choices; with min-choices written, at least that many and at most max-choices (default all);
  -- without it, all of them.
  orders as (
    select i.start, i.response, e.min_choices is not null as bounded, trim_xml(t => e.min_choices)::numeric as min_choices,
      trim_xml(t => e.max_choices)::numeric as max_choices, (select count(*) from presented c where c.istart = i.start) as total
    from shown i join el e on e.start = i.start where i.kind = 'qti-order-interaction'
  ),
  order_bounds as (
    select o.*, b.lo, greatest(b.lo, case when o.bounded then least(coalesce(o.max_choices, o.total), o.total) else o.total end) as most,
      (select count(distinct q.value) from p q join presented c on c.istart = o.start and c.identifier = q.value
       where q.response = o.response) as placed
    from orders o cross join lateral (select case when o.bounded then least(o.min_choices, o.total) else o.total end as lo) b
  ),
  -- Associate: at most max-associations (default 1), at least min-associations (default 0); the pairs given, each
  -- counted once in either order (its first, as given), and the choices.
  assoc as (
    select i.start, i.response, coalesce(trim_xml(t => e.max_associations)::numeric, 1) as most,
      coalesce(trim_xml(t => e.min_associations)::numeric, 0) as least
    from shown i join el e on e.start = i.start where i.kind = 'qti-associate-interaction'
  ),
  assoc_choice as (select c.* from parts c join assoc a on a.start = c.istart where c.role = 'choice'),
  assoc_group as (
    select c.istart, c.identifier, t.place as ord, t.token as allowed
    from (select distinct on (istart, identifier) * from assoc_choice order by istart, identifier, start desc) c
      cross join lateral admission_tokens(t => c.match_group) t
  ),
  assoc_given as (
    select a.start as istart, a.response, q.place, q.a, q.b, least(q.a, q.b) as lo, greatest(q.a, q.b) as hi
    from assoc a join p_pair q on q.response = a.response
  ),
  assoc_pair as (
    select g.istart, g.response, f.place, g.a, g.b, f.times,
      exists (select 1 from assoc_choice c where c.istart = g.istart and c.identifier = g.a)
        and exists (select 1 from assoc_choice c where c.istart = g.istart and c.identifier = g.b) as known
    from (select istart, lo, hi, min(place) as place, count(*) as times from assoc_given group by istart, lo, hi) f
    join assoc_given g on g.istart = f.istart and g.place = f.place
  ),
  assoc_usable as (select * from assoc_pair where known and a <> b),
  assoc_outside as (
    select u.*, case when exists (select 1 from assoc_group g where g.istart = u.istart and g.identifier = u.a)
                      and not exists (select 1 from assoc_group g where g.istart = u.istart and g.identifier = u.a and g.allowed = u.b)
                     then u.a else u.b end as holder
    from assoc_usable u
    where (exists (select 1 from assoc_group g where g.istart = u.istart and g.identifier = u.a)
           and not exists (select 1 from assoc_group g where g.istart = u.istart and g.identifier = u.a and g.allowed = u.b))
       or (exists (select 1 from assoc_group g where g.istart = u.istart and g.identifier = u.b)
           and not exists (select 1 from assoc_group g where g.istart = u.istart and g.identifier = u.b and g.allowed = u.a))
  ),
  assoc_count as (select a.*, (select count(*) from assoc_pair q where q.istart = a.start) as pairs from assoc a),
  assoc_per_choice as (
    select c.*, (select count(*) from assoc_usable u where u.istart = c.istart and (u.a = c.identifier or u.b = c.identifier)) as used
    from assoc_choice c
  ),
  -- Graphic Associate: at most max-associations (default 1), at least min-associations (default 0); every pair given,
  -- and the areas (the last of an identifier's areas stands for it).
  ga as (
    select i.start, i.response, coalesce(trim_xml(t => e.max_associations)::numeric, 1) as most,
      coalesce(trim_xml(t => e.min_associations)::numeric, 0) as least
    from shown i join el e on e.start = i.start where i.kind = 'qti-graphic-associate-interaction'
  ),
  ga_spot as (select c.* from parts c join ga g on g.start = c.istart where c.role = 'area'),
  ga_last as (select distinct on (istart, identifier) * from ga_spot order by istart, identifier, start desc),
  ga_group as (
    select l.istart, l.identifier, t.place as ord, t.token as allowed from ga_last l cross join lateral admission_tokens(t => l.match_group) t
  ),
  ga_pair as (
    select g.start as istart, g.response, q.place, q.a, q.b,
      na.identifier is not null and nb.identifier is not null as known,
      row_number() over (partition by g.start, least(q.a, q.b), greatest(q.a, q.b) order by q.place) as nth
    from ga g join p_pair q on q.response = g.response
    left join ga_last na on na.istart = g.start and na.identifier = q.a
    left join ga_last nb on nb.istart = g.start and nb.identifier = q.b
  ),
  ga_count as (select g.*, (select count(*) from ga_pair q where q.istart = g.start) as pairs from ga g),
  ga_per_spot as (
    select c.*,
      (select count(*) filter (where q.a = c.identifier) + count(*) filter (where q.b = c.identifier) from ga_pair q where q.istart = c.istart) as used
    from ga_spot c
  ),
  ga_outside as (
    select q.*, case when exists (select 1 from ga_group g where g.istart = q.istart and g.identifier = q.a)
                      and not exists (select 1 from ga_group g where g.istart = q.istart and g.identifier = q.a and g.allowed = q.b)
                     then 'a' else 'b' end as holder
    from ga_pair q
    where q.a <> q.b and (
      (exists (select 1 from ga_group g where g.istart = q.istart and g.identifier = q.a)
       and not exists (select 1 from ga_group g where g.istart = q.istart and g.identifier = q.a and g.allowed = q.b))
      or (exists (select 1 from ga_group g where g.istart = q.istart and g.identifier = q.b)
          and not exists (select 1 from ga_group g where g.istart = q.istart and g.identifier = q.b and g.allowed = q.a)))
  ),
  -- Graphic Gap Match: at most max-associations (default 1), at least min-associations (default 0); every pair given,
  -- its choices and its areas.
  ggm as (
    select i.start, i.response, coalesce(trim_xml(t => e.max_associations)::numeric, 1) as most,
      coalesce(trim_xml(t => e.min_associations)::numeric, 0) as least
    from shown i join el e on e.start = i.start where i.kind = 'qti-graphic-gap-match-interaction'
  ),
  ggm_choice as (select c.* from parts c join ggm g on g.start = c.istart where c.role = 'choice'),
  ggm_spot as (select c.* from parts c join ggm g on g.start = c.istart where c.role = 'area'),
  ggm_pair as (select g.start as istart, g.response, q.place, q.a, q.b from ggm g join p_pair q on q.response = g.response),
  ggm_count as (select g.*, (select count(*) from ggm_pair q where q.istart = g.start) as pairs from ggm g),
  ggm_group as (
    select c.istart, 'choice' as side, c.identifier, t.place as ord, t.token as allowed
    from (select distinct on (istart, identifier) * from ggm_choice order by istart, identifier, start desc) c
      cross join lateral admission_tokens(t => c.match_group) t
    union all
    select h.istart, 'area', h.identifier, t.place, t.token
    from (select distinct on (istart, identifier) * from ggm_spot order by istart, identifier, start desc) h
      cross join lateral admission_tokens(t => h.match_group) t
  ),
  ggm_outside as (
    select f.*, case when exists (select 1 from ggm_group g where g.istart = f.istart and g.side = 'choice' and g.identifier = f.a)
                      and not exists (select 1 from ggm_group g where g.istart = f.istart and g.side = 'choice' and g.identifier = f.a and g.allowed = f.b)
                     then 'choice' else 'area' end as holder
    from (select istart, response, a, b, min(place) as place from ggm_pair group by istart, response, a, b) f
    where (exists (select 1 from ggm_group g where g.istart = f.istart and g.side = 'choice' and g.identifier = f.a)
           and not exists (select 1 from ggm_group g where g.istart = f.istart and g.side = 'choice' and g.identifier = f.a and g.allowed = f.b))
       or (exists (select 1 from ggm_group g where g.istart = f.istart and g.side = 'area' and g.identifier = f.b)
           and not exists (select 1 from ggm_group g where g.istart = f.istart and g.side = 'area' and g.identifier = f.b and g.allowed = f.a))
  ),
  -- Graphic Order: the areas, and the bounds min- and max-choices give as Order's do.
  gor as (
    select i.start, i.response, e.min_choices is not null as bounded, trim_xml(t => e.min_choices)::numeric as min_choices,
      trim_xml(t => e.max_choices)::numeric as max_choices,
      (select count(*) from el h where h.parent = i.start and h.kind = 'qti-hotspot-choice') as total
    from shown i join el e on e.start = i.start where i.kind = 'qti-graphic-order-interaction'
  ),
  gor_bounds as (
    select g.*, b.lo, greatest(b.lo, case when g.bounded then least(coalesce(g.max_choices, g.total), g.total) else g.total end) as most,
      coalesce(n.n, 0) as n
    from gor g left join given n on n.response = g.response
      cross join lateral (select case when g.bounded then least(g.min_choices, g.total) else g.total end as lo) b
  ),
  gor_spot as (
    select distinct on (c.istart, c.identifier) c.istart, c.identifier
    from parts c join gor g on g.start = c.istart where c.role = 'area' order by c.istart, c.identifier, c.start desc
  ),
  gor_chosen as (
    select g.start as istart, g.response, q.place, q.value, n.identifier is not null as known,
      row_number() over (partition by g.start, q.value order by q.place) as nth
    from gor g join p q on q.response = g.response left join gor_spot n on n.istart = g.start and n.identifier = q.value
  ),
  -- Position Object: at most max-choices (default 1), at least min-choices (default 0), on its stage.
  po as (
    select i.start, i.response, st.width, st.height, coalesce(trim_xml(t => e.max_choices)::numeric, 1) as most,
      coalesce(trim_xml(t => e.min_choices)::numeric, 0) as least, coalesce(g.n, 0) as n
    from shown i join el e on e.start = i.start join stage st on st.start = i.parent left join given g on g.response = i.response
    where i.kind = 'qti-position-object-interaction'
  ),
  -- Select Point: at most one for a single response, else max-choices where it is above 0 (QTI's default 0 is no
  -- limit); at least min-choices where it is above 0 (default 0); on its image.
  sp as (
    select i.start, i.response, i.card, z.width, z.height, coalesce(trim_xml(t => e.max_choices)::numeric, 0) as max_choices,
      coalesce(trim_xml(t => e.min_choices)::numeric, 0) as least, coalesce(g.n, 0) as n
    from shown i join el e on e.start = i.start join image_size z on z.owner = i.start
    left join given g on g.response = i.response
    where i.kind = 'qti-select-point-interaction'
  ),
  sp_most as (
    select sp.*, 1 as most from sp where card = 'single'
    union all
    select sp.*, max_choices from sp where card <> 'single' and max_choices > 0
  ),
  -- Slider: the range its base type gives (an integer slider's bounds outward to whole numbers, its step 1 where it
  -- writes none), a float slider's step only where it writes one above 0.
  slider as (
    select i.start, i.response,
      case i.base when 'integer' then floor(trim_xml(t => e.lower_bound)::float8) when 'float' then trim_xml(t => e.lower_bound)::float8
        else case when admission_defect(what => i.base) then 0 end end as lo,
      case i.base when 'integer' then ceil(trim_xml(t => e.upper_bound)::float8) when 'float' then trim_xml(t => e.upper_bound)::float8
        else case when admission_defect(what => i.base) then 0 end end as hi,
      coalesce(case when trim_xml(t => e.step)::float8 > 0 then trim_xml(t => e.step)::float8 end,
        case when i.base = 'integer' then 1 end) as step
    from shown i join el e on e.start = i.start where i.kind = 'qti-slider-interaction'
  ),
  slider_value as (
    select l.*, q.place, q.number as v from slider l join p_number q on q.response = l.response where q.number <> 'NaN'::float8
  ),
  -- Media: the plays given (the first value; none given is 0), at most max-plays where above 0 (QTI's default 0 is no
  -- limit), at least min-plays (default 0).
  media as (
    select i.start, i.response, coalesce((select q.whole from p_whole q where q.response = i.response order by q.place limit 1), 0) as plays,
      coalesce(trim_xml(t => e.max_plays)::numeric, 0) as most, coalesce(trim_xml(t => e.min_plays)::numeric, 0) as least
    from shown i join el e on e.start = i.start where i.kind = 'qti-media-interaction'
  ),
  -- Extended Text: at most max-strings where it writes one above 0, at least min-strings (default 0), "the minimum
  -- number separate (non-empty) strings required from the candidate to form a valid response" (§5.48.7), whatever
  -- a renderer draws; Text Entry and Extended Text: a pattern-mask every string matches, by XML Schema's regular
  -- expressions (QTI 3.0.1 §5.48.4, Appendix F of XML Schema Part 2), by the machine's matcher; a mask that is no
  -- Appendix F expression compiles to NULL and matches as NULL: no reason, as QTI gives such a mask no meaning. An
  -- xhtml Extended Text's strings are matched on their text (p3.xhtml_text, reading `xhtml-pattern-mask-text`), every other as posted.
  texts as (
    select i.start, i.response, i.kind, coalesce(g.n, 0) as n, trim_xml(t => e.max_strings)::numeric as most,
      coalesce(trim_xml(t => e.min_strings)::numeric, 0) as least, e.pattern_mask,
      i.kind = 'qti-extended-text-interaction' and coalesce(trim_xml(t => e.format), 'plain') = 'xhtml' as xhtml
    from shown i join el e on e.start = i.start left join given g on g.response = i.response
    where i.kind in ('qti-text-entry-interaction', 'qti-extended-text-interaction')
  ),
  -- Every reason the posted responses break, whatever validate-responses says: `judged` keeps the tiers the stage
  -- applies, so no check is gated by the argument and one plan serves every call. (interaction, rank of the check in
  -- plate's order, order within the check) identifies a reason and `code` names it. A reason is rows: one naming it
  -- alone (name ''), and one per attribute its words name, a word or a count as its text (a count is an integer, whose
  -- text is exact) or a number.
  reasons(istart, rank, sub, code, response, name, place, word, number) as materialized (
    -- picks
    select i.start, 1, 0, 'unknownChoice', i.response, a.name, a.place, a.word, a.number
    from picks i
      cross join lateral (values ('', 0, null::text, null::float8)) a(name, place, word, number)
    where exists (select 1 from p where p.response = i.response
      and not exists (select 1 from presented c where c.istart = i.start and c.identifier = p.value))
      or (select count(distinct value) from p where p.response = i.response) < i.n
    union all
    select i.start, 2, 0, 'atMost', i.response, a.name, a.place, a.word, a.number
    from picks i
      cross join lateral (values ('', 0, null::text, null::float8), ('n', 1, i.most::text, null)) a(name, place, word, number)
    where i.most > 0 and i.n > i.most
    union all
    select i.start, 3, 0, 'atLeast', i.response, a.name, a.place, a.word, a.number
    from picks i
      cross join lateral (values ('', 0, null::text, null::float8), ('n', 1, i.least::text, null)) a(name, place, word, number)
    where i.n < i.least
    -- inline choice
    union all
    select i.start, 1, 0, 'unknownChoice', i.response, a.name, a.place, a.word, a.number
    from inline i
      cross join lateral (values ('', 0, null::text, null::float8)) a(name, place, word, number)
    where exists (select 1 from p where p.response = i.response
      and not exists (select 1 from presented c where c.istart = i.start and c.identifier = p.value))
    union all
    select i.start, 2, 0, 'atLeast', i.response, a.name, a.place, a.word, a.number
    from inline i
      cross join lateral (values ('', 0, null::text, null::float8), ('n', 1, i.least::text, null)) a(name, place, word, number)
    where i.n < i.least
    -- match and gap match: a pair naming no source or no target
    union all
    select ms.start, 1, 0, 'unknownChoice', ms.response, a.name, a.place, a.word, a.number
    from match_sets ms
      cross join lateral (values ('', 0, null::text, null::float8)) a(name, place, word, number)
    where exists (select 1 from pairs q where q.istart = ms.start and (
      not exists (select 1 from sides d where d.istart = ms.start and d.side = 'source' and d.identifier = q.a)
      or not exists (select 1 from sides d where d.istart = ms.start and d.side = 'target' and d.identifier = q.b)))
    -- match: a pair given twice, in the order it first repeats
    union all
    select q.istart, 2, q.place, 'matchRepeated', q.response, a.name, a.place, a.word, a.number
    from (select istart, response, a, b, min(place)::int as place from pairs where kind = 'qti-match-interaction'
      group by istart, response, a, b having count(*) > 1) q
      cross join lateral (values ('', 0, null::text, null::float8), ('subject', 1, q.a, null), ('other', 1, q.b, null)) a(name, place, word, number)
    -- gap match: a gap given twice, in the order its first pair came
    union all
    select q.istart, 2, q.place, 'gapMatchGapFull', q.response, a.name, a.place, a.word, a.number
    from (select istart, response, b, min(place)::int as place from pairs where kind = 'qti-gap-match-interaction'
      group by istart, response, b having count(*) > 1) q
      cross join lateral (values ('', 0, null::text, null::float8), ('subject', 1, q.b, null)) a(name, place, word, number)
    -- each limited choice's match-max, in document order
    union all
    select d.istart, 3, d.start, case d.ikind when 'qti-match-interaction' then 'matchChoiceAtMost' else 'gapMatchChoiceAtMost' end,
      ms.response, a.name, a.place, a.word, a.number
    from limited d join match_sets ms on ms.start = d.istart
      cross join lateral (values ('', 0, null::text, null::float8), ('subject', 1, d.identifier, null), ('n', 1, d.match_max::text, null)) a(name, place, word, number)
    where d.match_max > 0 and d.uses > d.match_max
    -- match groups: each pair outside a group, once, in the order it first came
    union all
    select o.istart, 4, o.place::int,
      case o.kind when 'qti-match-interaction' then case o.holder when 'source' then 'matchNotInSourceGroup' else 'matchNotInTargetGroup' end
        else case o.holder when 'source' then 'gapMatchNotInChoiceGroup' else 'gapMatchNotInGapGroup' end end,
      o.response, a.name, a.place, a.word, a.number
    from outside o
      cross join lateral (select * from (values ('', 0, null::text, null::float8), ('subject', 1, o.a, null), ('other', 1, o.b, null)) v(name, place, word, number) union all select 'group', g.ord, g.allowed, null from groups g where g.istart = o.istart and g.side = o.holder and g.identifier = case o.holder when 'source' then o.a else o.b end) a(name, place, word, number)
    -- max-associations
    union all
    select ms.start, 5, 0, 'atMost', ms.response, a.name, a.place, a.word, a.number
    from match_sets ms
      cross join lateral (values ('', 0, null::text, null::float8), ('n', 1, ms.most::text, null)) a(name, place, word, number)
    where ms.most > 0 and (select count(*) from pairs q where q.istart = ms.start) > ms.most
    -- tier (b): min-associations, required gaps (QTI's default not required), each limited choice's match-min
    union all
    select ms.start, 6, 0, 'atLeast', ms.response, a.name, a.place, a.word, a.number
    from match_sets ms
      cross join lateral (values ('', 0, null::text, null::float8), ('n', 1, ms.least::text, null)) a(name, place, word, number)
    where (select count(*) from pairs q where q.istart = ms.start) < ms.least
    union all
    select d.istart, 7, d.start, 'gapMatchGapRequired', ms.response, a.name, a.place, a.word, a.number
    from sides d join match_sets ms on ms.start = d.istart join el e on e.start = d.start
      cross join lateral (values ('', 0, null::text, null::float8), ('subject', 1, d.identifier, null)) a(name, place, word, number)
    where ms.kind = 'qti-gap-match-interaction' and d.side = 'target' and xs_boolean(t => e.required, dflt => false)
      and not exists (select 1 from pairs q where q.istart = d.istart and q.b = d.identifier)
    union all
    select d.istart, 8, d.start, case d.ikind when 'qti-match-interaction' then 'matchChoiceAtLeast' else 'gapMatchChoiceAtLeast' end,
      ms.response, a.name, a.place, a.word, a.number
    from limited d join match_sets ms on ms.start = d.istart
      cross join lateral (values ('', 0, null::text, null::float8), ('subject', 1, d.identifier, null), ('n', 1, d.match_min::text, null)) a(name, place, word, number)
    where d.uses < d.match_min
    -- order
    union all
    select o.start, 1, 0, 'unknownChoice', o.response, a.name, a.place, a.word, a.number
    from order_bounds o
      cross join lateral (values ('', 0, null::text, null::float8)) a(name, place, word, number)
    where exists (select 1 from p where p.response = o.response
      and not exists (select 1 from presented c where c.istart = o.start and c.identifier = p.value))
    union all
    select q.istart, 2, q.place, 'orderRepeated', q.response, a.name, a.place, a.word, a.number
    from (select o.start as istart, o.response, t.value, min(t.place) as place from order_bounds o join p t on t.response = o.response
       where t.place > (select min(t2.place) from p t2 where t2.response = o.response and t2.value = t.value)
       group by o.start, o.response, t.value) q
      cross join lateral (values ('', 0, null::text, null::float8), ('subject', 1, q.value, null)) a(name, place, word, number)
    union all
    select o.start, 3, 0, 'orderAtMost', o.response, a.name, a.place, a.word, a.number
    from order_bounds o
      cross join lateral (values ('', 0, null::text, null::float8), ('n', 1, o.most::text, null)) a(name, place, word, number)
    where o.placed > o.most
    union all
    select o.start, 4, 0, case when o.bounded then 'orderAtLeast' else 'orderAll' end, o.response, a.name, a.place, a.word, a.number
    from order_bounds o
      cross join lateral (values ('', 0, null::text, null::float8), ('n', 1, o.lo::text, null)) a(name, place, word, number)
    where o.placed < o.lo
    -- associate: tier (a) unknown, itself, repeated, each choice's match-max, groups, max-associations
    union all
    select q.istart, 1, 0, 'associateUnknown', q.response, a.name, a.place, a.word, a.number
    from (select istart, response from assoc_pair group by istart, response having bool_or(not known)) q
      cross join lateral (values ('', 0, null::text, null::float8)) a(name, place, word, number)
    union all
    select q.istart, 2, q.place, 'associateItself', q.response, a.name, a.place, a.word, a.number
    from assoc_pair q
      cross join lateral (values ('', 0, null::text, null::float8), ('subject', 1, q.a, null)) a(name, place, word, number)
    where q.a = q.b
    union all
    select q.istart, 3, q.place, 'associateRepeated', q.response, a.name, a.place, a.word, a.number
    from assoc_pair q
      cross join lateral (values ('', 0, null::text, null::float8), ('subject', 1, q.a, null), ('other', 1, q.b, null)) a(name, place, word, number)
    where q.times > 1
    union all
    select c.istart, 4, c.start, 'associateChoiceAtMost', x.response, a.name, a.place, a.word, a.number
    from assoc_per_choice c join assoc x on x.start = c.istart
      cross join lateral (values ('', 0, null::text, null::float8), ('subject', 1, c.identifier, null), ('n', 1, c.match_max::text, null)) a(name, place, word, number)
    where c.match_max > 0 and c.used > c.match_max
    union all
    select o.istart, 5, o.place, 'associateOutsideGroup', o.response, a.name, a.place, a.word, a.number
    from assoc_outside o
      cross join lateral (select * from (values ('', 0, null::text, null::float8), ('subject', 1, o.holder, null), ('other', 1, case when o.holder = o.a then o.b else o.a end, null)) v(name, place, word, number) union all select 'group', g.ord, g.allowed, null from assoc_group g where g.istart = o.istart and g.identifier = o.holder) a(name, place, word, number)
    union all
    select x.start, 6, 0, 'associateAtMost', x.response, a.name, a.place, a.word, a.number
    from assoc_count x
      cross join lateral (values ('', 0, null::text, null::float8), ('n', 1, x.most::text, null)) a(name, place, word, number)
    where x.most > 0 and x.pairs > x.most
    -- associate: tier (b) min-associations, each choice's match-min
    union all
    select x.start, 7, 0, 'associateAtLeast', x.response, a.name, a.place, a.word, a.number
    from assoc_count x
      cross join lateral (values ('', 0, null::text, null::float8), ('n', 1, x.least::text, null)) a(name, place, word, number)
    where x.pairs < x.least
    union all
    select c.istart, 8, c.start, 'associateChoiceAtLeast', x.response, a.name, a.place, a.word, a.number
    from assoc_per_choice c join assoc x on x.start = c.istart
      cross join lateral (values ('', 0, null::text, null::float8), ('subject', 1, c.identifier, null), ('n', 1, c.match_min::text, null)) a(name, place, word, number)
    where c.used < c.match_min
    -- graphic associate: tier (a) unknown, self, twice (at the repeat), each area's match-max, groups, max-associations;
    -- an area is named by its identifier, which the words resolve to the area's name
    union all
    select q.istart, 1, 0, 'graphicAssociateUnknown', q.response, a.name, a.place, a.word, a.number
    from (select istart, response from ga_pair group by istart, response having bool_or(not known)) q
      cross join lateral (values ('', 0, null::text, null::float8)) a(name, place, word, number)
    union all
    select q.istart, 2, q.place, 'graphicAssociateSelf', q.response, a.name, a.place, a.word, a.number
    from (select istart, response, a, min(place)::int as place from ga_pair where a = b group by istart, response, a) q
      cross join lateral (values ('', 0, null::text, null::float8), ('subject', 1, q.a, null)) a(name, place, word, number)
    union all
    select q.istart, 3, q.place, 'graphicAssociateTwice', q.response, a.name, a.place, a.word, a.number
    from ga_pair q
      cross join lateral (values ('', 0, null::text, null::float8), ('subject', 1, q.a, null), ('other', 1, q.b, null)) a(name, place, word, number)
    where q.nth = 2
    union all
    select c.istart, 4, c.start, 'graphicAssociateMatchMax', g.response, a.name, a.place, a.word, a.number
    from ga_per_spot c join ga g on g.start = c.istart
      cross join lateral (values ('', 0, null::text, null::float8), ('subject', 1, c.identifier, null), ('n', 1, c.match_max::text, null)) a(name, place, word, number)
    where c.match_max > 0 and c.used > c.match_max
    union all
    select o.istart, 5, o.place, 'graphicAssociateOutside', o.response, a.name, a.place, a.word, a.number
    from ga_outside o
      cross join lateral (select * from (values ('', 0, null::text, null::float8), ('subject', 1, case o.holder when 'a' then o.a else o.b end, null), ('other', 1, case o.holder when 'a' then o.b else o.a end, null)) v(name, place, word, number) union all select 'group', g.ord, g.allowed, null from ga_group g where g.istart = o.istart and g.identifier = case o.holder when 'a' then o.a else o.b end) a(name, place, word, number)
    union all
    select x.start, 6, 0, 'graphicAssociateAtMost', x.response, a.name, a.place, a.word, a.number
    from ga_count x
      cross join lateral (values ('', 0, null::text, null::float8), ('n', 1, x.most::text, null)) a(name, place, word, number)
    where x.most > 0 and x.pairs > x.most
    -- graphic associate: tier (b) min-associations, each area's match-min
    union all
    select x.start, 7, 0, 'graphicAssociateAtLeast', x.response, a.name, a.place, a.word, a.number
    from ga_count x
      cross join lateral (values ('', 0, null::text, null::float8), ('n', 1, x.least::text, null)) a(name, place, word, number)
    where x.pairs < x.least
    union all
    select c.istart, 8, c.start, 'graphicAssociateMatchMin', g.response, a.name, a.place, a.word, a.number
    from ga_per_spot c join ga g on g.start = c.istart
      cross join lateral (values ('', 0, null::text, null::float8), ('subject', 1, c.identifier, null), ('n', 1, c.match_min::text, null)) a(name, place, word, number)
    where c.used < c.match_min
    -- graphic gap match: tier (a) unknown, each area's then each choice's match-max, groups, max-associations
    union all
    select x.start, 1, 0, 'unknownChoice', x.response, a.name, a.place, a.word, a.number
    from ggm x
      cross join lateral (values ('', 0, null::text, null::float8)) a(name, place, word, number)
    where exists (select 1 from ggm_pair q where q.istart = x.start
      and (not exists (select 1 from ggm_choice c where c.istart = q.istart and c.identifier = q.a)
           or not exists (select 1 from ggm_spot h where h.istart = q.istart and h.identifier = q.b)))
    union all
    select h.istart, 2, h.start, 'graphicGapMatchAreaAtMost', g.response, a.name, a.place, a.word, a.number
    from ggm_spot h join ggm g on g.start = h.istart
      cross join lateral (values ('', 0, null::text, null::float8), ('subject', 1, h.identifier, null), ('n', 1, h.match_max::text, null)) a(name, place, word, number)
    where h.match_max > 0 and (select count(*) from ggm_pair q where q.istart = h.istart and q.b = h.identifier) > h.match_max
    union all
    select c.istart, 3, c.start, 'graphicGapMatchChoiceAtMost', g.response, a.name, a.place, a.word, a.number
    from ggm_choice c join ggm g on g.start = c.istart
      cross join lateral (values ('', 0, null::text, null::float8), ('subject', 1, c.identifier, null), ('n', 1, c.match_max::text, null)) a(name, place, word, number)
    where c.match_max > 0 and (select count(*) from ggm_pair q where q.istart = c.istart and q.a = c.identifier) > c.match_max
    union all
    select o.istart, 4, o.place::int,
      case o.holder when 'choice' then 'graphicGapMatchNotInChoiceGroup' else 'graphicGapMatchNotInAreaGroup' end, o.response, a.name, a.place, a.word, a.number
    from ggm_outside o
      cross join lateral (select * from (values ('', 0, null::text, null::float8), ('subject', 1, o.a, null), ('other', 1, o.b, null)) v(name, place, word, number) union all select 'group', g.ord, g.allowed, null from ggm_group g where g.istart = o.istart and g.side = o.holder and g.identifier = case o.holder when 'choice' then o.a else o.b end) a(name, place, word, number)
    union all
    select x.start, 5, 0, 'atMost', x.response, a.name, a.place, a.word, a.number
    from ggm_count x
      cross join lateral (values ('', 0, null::text, null::float8), ('n', 1, x.most::text, null)) a(name, place, word, number)
    where x.most > 0 and x.pairs > x.most
    -- graphic gap match: tier (b) min-associations, each area's then each choice's match-min
    union all
    select x.start, 6, 0, 'atLeast', x.response, a.name, a.place, a.word, a.number
    from ggm_count x
      cross join lateral (values ('', 0, null::text, null::float8), ('n', 1, x.least::text, null)) a(name, place, word, number)
    where x.pairs < x.least
    union all
    select h.istart, 7, h.start, 'graphicGapMatchAreaAtLeast', g.response, a.name, a.place, a.word, a.number
    from ggm_spot h join ggm g on g.start = h.istart
      cross join lateral (values ('', 0, null::text, null::float8), ('subject', 1, h.identifier, null), ('n', 1, h.match_min::text, null)) a(name, place, word, number)
    where (select count(*) from ggm_pair q where q.istart = h.istart and q.b = h.identifier) < h.match_min
    union all
    select c.istart, 8, c.start, 'graphicGapMatchChoiceAtLeast', g.response, a.name, a.place, a.word, a.number
    from ggm_choice c join ggm g on g.start = c.istart
      cross join lateral (values ('', 0, null::text, null::float8), ('subject', 1, c.identifier, null), ('n', 1, c.match_min::text, null)) a(name, place, word, number)
    where (select count(*) from ggm_pair q where q.istart = c.istart and q.a = c.identifier) < c.match_min
    -- graphic order: tier (a) unknown, twice (each known area at its first repeat), max; tier (b) min
    union all
    select q.istart, 1, 0, 'graphicOrderUnknown', q.response, a.name, a.place, a.word, a.number
    from (select istart, response from gor_chosen group by istart, response having bool_or(not known)) q
      cross join lateral (values ('', 0, null::text, null::float8)) a(name, place, word, number)
    union all
    select q.istart, 2, q.place, 'graphicOrderTwice', q.response, a.name, a.place, a.word, a.number
    from gor_chosen q
      cross join lateral (values ('', 0, null::text, null::float8), ('subject', 1, q.value, null)) a(name, place, word, number)
    where q.nth = 2 and q.known
    union all
    select b.start, 3, 0, 'graphicOrderAtMost', b.response, a.name, a.place, a.word, a.number
    from gor_bounds b
      cross join lateral (values ('', 0, null::text, null::float8), ('n', 1, b.most::text, null)) a(name, place, word, number)
    where b.n > b.most
    union all
    select b.start, 4, 0, 'graphicOrderAtLeast', b.response, a.name, a.place, a.word, a.number
    from gor_bounds b
      cross join lateral (values ('', 0, null::text, null::float8), ('n', 1, b.lo::text, null)) a(name, place, word, number)
    where b.n < b.lo
    -- position object: tier (a) max-choices; tier (b) off the stage, min-choices
    union all
    select o.start, 1, 0, 'positionObjectAtMost', o.response, a.name, a.place, a.word, a.number
    from po o
      cross join lateral (values ('', 0, null::text, null::float8), ('n', 1, o.most::text, null)) a(name, place, word, number)
    where o.most > 0 and o.n > o.most
    union all
    select o.start, 2, 0, 'positionObjectOffStage', o.response, a.name, a.place, a.word, a.number
    from po o
      cross join lateral (values ('', 0, null::text, null::float8), ('width', 1, null, o.width), ('height', 1, null, o.height)) a(name, place, word, number)
    where exists (select 1 from p_point q where q.response = o.response
      and (q.x < 0 or q.y < 0 or q.x > o.width::numeric or q.y > o.height::numeric))
    union all
    select o.start, 3, 0, 'positionObjectAtLeast', o.response, a.name, a.place, a.word, a.number
    from po o
      cross join lateral (values ('', 0, null::text, null::float8), ('n', 1, o.least::text, null)) a(name, place, word, number)
    where o.n < o.least
    -- select point: each point's x then y below 0 (a) or past the image (b); at most (a), at least (b)
    union all
    select x.istart, 1, x.sub, case when x.c < 0 then 'selectPointBelowZero' else 'selectPointBeyond' end, x.response, a.name, a.place, a.word, a.number
    from (select sp.start as istart, sp.response, q.place, q.place * 2 + c.k as sub, c.axis, c.c, c.extent
       from sp join p_point q on q.response = sp.response
         cross join lateral (values (0, 'x', q.x, sp.width), (1, 'y', q.y, sp.height)) c(k, axis, c, extent)) x
      cross join lateral (values ('', 0, null::text, null::float8), ('at', 1, x.place::text, null), ('axis', 1, x.axis, null), ('extent', 1, x.extent::numeric::text, null)) a(name, place, word, number)
    where x.c < 0 or x.c > x.extent::numeric
    union all
    select m.start, 2, 0, 'selectPointAtMost', m.response, a.name, a.place, a.word, a.number
    from sp_most m
      cross join lateral (values ('', 0, null::text, null::float8), ('n', 1, m.most::text, null)) a(name, place, word, number)
    where m.n > m.most
    union all
    select x.start, 3, 0, 'selectPointAtLeast', x.response, a.name, a.place, a.word, a.number
    from sp x
      cross join lateral (values ('', 0, null::text, null::float8), ('n', 1, x.least::text, null)) a(name, place, word, number)
    where x.least > 0 and x.n < x.least
    -- slider: each value below, above, or off its step
    union all
    select v.start, 1, v.place, 'sliderBelow', v.response, a.name, a.place, a.word, a.number
    from slider_value v
      cross join lateral (values ('', 0, null::text, null::float8), ('bound', 1, null, v.lo)) a(name, place, word, number)
    where v.v < v.lo
    union all
    select v.start, 1, v.place, 'sliderAbove', v.response, a.name, a.place, a.word, a.number
    from slider_value v
      cross join lateral (values ('', 0, null::text, null::float8), ('bound', 1, null, v.hi)) a(name, place, word, number)
    where v.v > v.hi and not v.v < v.lo
    union all
    select v.start, 1, v.place, 'sliderOffStep', v.response, a.name, a.place, a.word, a.number
    from slider_value v
      cross join lateral (values ('', 0, null::text, null::float8), ('step', 1, null, v.step), ('bound', 1, null, v.lo)) a(name, place, word, number)
    where v.step is not null and not v.v < v.lo and not v.v > v.hi
      and abs((v.v - v.lo) / v.step - admission_round(x => (v.v - v.lo) / v.step)) > 1e-9 * greatest(1, abs((v.v - v.lo) / v.step))
    -- media: a negative count alone (a); max-plays (a), min-plays (b)
    union all
    select m.start, 1, 0, 'mediaNegative', m.response, a.name, a.place, a.word, a.number
    from media m
      cross join lateral (values ('', 0, null::text, null::float8)) a(name, place, word, number)
    where m.plays < 0
    union all
    select m.start, 2, 0, 'mediaAtMost', m.response, a.name, a.place, a.word, a.number
    from media m
      cross join lateral (values ('', 0, null::text, null::float8), ('n', 1, m.most::text, null)) a(name, place, word, number)
    where m.plays >= 0 and m.most > 0 and m.plays > m.most
    union all
    select m.start, 3, 0, 'mediaAtLeast', m.response, a.name, a.place, a.word, a.number
    from media m
      cross join lateral (values ('', 0, null::text, null::float8), ('n', 1, m.least::text, null)) a(name, place, word, number)
    where m.plays >= 0 and m.plays < m.least
    -- extended text: max-strings (a), min-strings (b); text entry and extended text:
    -- pattern-mask (b)
    union all
    select t.start, 1, 0, 'atMostStrings', t.response, a.name, a.place, a.word, a.number
    from texts t
      cross join lateral (values ('', 0, null::text, null::float8), ('n', 1, t.most::text, null)) a(name, place, word, number)
    where t.kind = 'qti-extended-text-interaction' and t.most > 0 and t.n > t.most
    union all
    select t.start, 2, 0, 'atLeastStrings', t.response, a.name, a.place, a.word, a.number
    from texts t
      cross join lateral (values ('', 0, null::text, null::float8), ('n', 1, t.least::text, null)) a(name, place, word, number)
    where t.kind = 'qti-extended-text-interaction' and t.n < t.least
    union all
    select t.start, 3, 0, 'patternMismatch', t.response, a.name, a.place, a.word, a.number
    from texts t
      cross join lateral (values ('', 0, null::text, null::float8)) a(name, place, word, number)
    where t.pattern_mask is not null
      and exists (select 1 from p where p.response = t.response
        and xsd_run(program => xsd_compile(p => t.pattern_mask), v => case when t.xhtml then xhtml_text(x => p.value) else p.value end) is false)
  ),
  -- The closed roster AdmissionCode: each reason code once, its id its place from 0 across the two lists, tier (a)'s,
  -- refused whatever validate-responses says, then tier (b)'s, refused only under it. The ledger's generator builds
  -- the roster from these lists in this order (tools/gen/grading/machine.ts), so an id here and its handle there are
  -- one fact, and it refuses a reason whose code neither lists.
  codes as (
    select c.handle, (c.o - 1)::smallint as id, c.o <= cardinality(l.a) as always
    from (values (array[
      'unknownChoice', 'atMost', 'atMostStrings', 'matchRepeated', 'matchChoiceAtMost', 'matchNotInSourceGroup',
      'matchNotInTargetGroup', 'gapMatchGapFull', 'gapMatchChoiceAtMost', 'gapMatchNotInChoiceGroup',
      'gapMatchNotInGapGroup', 'orderRepeated', 'orderAtMost', 'associateUnknown', 'associateItself',
      'associateRepeated', 'associateChoiceAtMost', 'associateOutsideGroup', 'associateAtMost',
      'graphicAssociateUnknown', 'graphicAssociateSelf', 'graphicAssociateTwice', 'graphicAssociateMatchMax',
      'graphicAssociateOutside', 'graphicAssociateAtMost', 'graphicGapMatchAreaAtMost',
      'graphicGapMatchChoiceAtMost', 'graphicGapMatchNotInChoiceGroup', 'graphicGapMatchNotInAreaGroup',
      'graphicOrderUnknown', 'graphicOrderTwice', 'graphicOrderAtMost', 'positionObjectAtMost',
      'selectPointBelowZero', 'selectPointAtMost', 'sliderBelow', 'sliderAbove', 'sliderOffStep', 'mediaNegative',
      'mediaAtMost']::text[],
      array[
      'atLeast', 'patternMismatch', 'atLeastStrings', 'matchChoiceAtLeast', 'gapMatchChoiceAtLeast',
      'gapMatchGapRequired', 'orderAll', 'orderAtLeast', 'associateAtLeast', 'associateChoiceAtLeast',
      'graphicAssociateAtLeast', 'graphicAssociateMatchMin', 'graphicGapMatchAreaAtLeast',
      'graphicGapMatchChoiceAtLeast', 'graphicOrderAtLeast', 'positionObjectOffStage', 'positionObjectAtLeast',
      'selectPointBeyond', 'selectPointAtLeast', 'mediaAtLeast']::text[])) l(a, b)
      cross join lateral unnest(l.a || l.b) with ordinality c(handle, o)
  ),
  -- The reasons in force, numbered in plate's order: tier (b)'s only under validate-responses. Each reason is its rows,
  -- one naming it alone (name '') and one per attribute its words name.
  judged as materialized (
    select r.*, c.id, dense_rank() over (order by r.istart, r.rank, r.sub) as ord
    from reasons r join codes c on c.handle = r.code where (run).validate or c.always
  )
  select row(
    array(select row((run).child, j.name, j.ord, (run).package, (run).path, (run).stage, j.word::numeric)::admission_count
      from judged j where j.name in ('n', 'at', 'extent') order by j.ord, j.name),
    array(select row((run).child, (run).package, (run).path, h.response, (run).stage)::admission_hidden from hidden h order by h.response),
    array(select row((run).child, j.name, j.ord, (run).package, (run).path, (run).stage, j.number)::admission_number
      from judged j where j.name in ('width', 'height', 'bound', 'step') order by j.ord, j.name),
    array(select row((run).child, j.id, j.istart, j.ord, (run).package, (run).path, j.response, (run).stage)::admission_reason
      from judged j where j.name = '' order by j.ord),
    array(select row((run).child, j.name, j.ord, (run).package, (run).path, j.place, (run).stage, j.word)::admission_word
      from judged j where j.name in ('subject', 'other', 'group', 'axis') order by j.ord, j.name, j.place)
  )::admission
$$;

-- The flat entry: every run a statement admits, each by itself, from its document's body as pantry stores it and its
-- declarations, as its package's publication stores them, and its variables' kinds (kinds_of), its values the machine's
-- flat entry takes by its key (the posted responses, and the values in force: the outcomes after the last attempt and
-- the session's template values, each declared default where none is given) and its session's validate-responses.
create function p3.admission_of(body p3.body_node[],
  body_attributes p3.body_attribute[], booleans p3.doc_boolean[], declaration_attributes p3.document_attribute[],
  declaration_texts p3.document_text[], declarations p3.declaration_node[], directed_pairs p3.doc_directed_pair[], field_booleans p3.doc_field_boolean[], field_directed_pairs p3.doc_field_directed_pair[],
  field_files p3.doc_field_file[], field_floats p3.doc_field_float[], field_integers p3.doc_field_integer[],
  field_pairs p3.doc_field_pair[], field_points p3.doc_field_point[], field_texts p3.doc_field_text[],
  files p3.doc_file[], floats p3.doc_float[], integers p3.doc_integer[], kinds p3.doc_var_kind[],
  pairs p3.doc_pair[], points p3.doc_point[], runs p3.admission_run[], texts p3.doc_text[],
  vars p3.doc_given[])
returns p3.admission language sql immutable as $$
  with one as (
    select admission_one(run => r,
      body => array(select b from unnest(body) b where b.package = r.package and b.path = r.path),
      attributes => array(select a from unnest(body_attributes) a where a.package = r.package and a.path = r.path),
      responses => array(select v from vars_in(i => g.given, h => 'value') v where v.identifier in (select k.identifier from kinds_of(
        kinds => kinds, package => r.package, path => r.path) k where k.kind = 'response') order by v.identifier),
      held => array(select v from start_of(
        declarations => array(select x from unnest(declarations) x where x.package = r.package and x.path = r.path),
        attributes => array(select x from unnest(declaration_attributes) x where x.package = r.package and x.path = r.path),
        texts => array(select x from unnest(declaration_texts) x where x.package = r.package and x.path = r.path),
        given => g.given) v order by v.identifier)) as x
    from unnest(runs) r cross join lateral (select values_of(child => r.child, package => r.package, path => r.path, stage => r.stage, vars => vars, defaulted => false,
      declarations => array(select x from unnest(declarations) x where x.package = r.package and x.path = r.path),
      declaration_attributes => array(select x from unnest(declaration_attributes) x where x.package = r.package and x.path = r.path), texts => texts, integers => integers, floats => floats, booleans => booleans, pairs => pairs,
      directed_pairs => directed_pairs, points => points, files => files, field_texts => field_texts, field_integers => field_integers, field_floats => field_floats, field_booleans => field_booleans, field_pairs => field_pairs,
      field_directed_pairs => field_directed_pairs, field_points => field_points, field_files => field_files) as given) g
  )
  select row(
    array(select r from one, unnest((one.x).counts) r),
    array(select r from one, unnest((one.x).hidden) r),
    array(select r from one, unnest((one.x).numbers) r),
    array(select r from one, unnest((one.x).reasons) r),
    array(select r from one, unnest((one.x).words) r)
  )::admission
$$;
