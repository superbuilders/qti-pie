-- The machine's flat entry's headings (document.sql): what a fused statement passes a run of the machine and reads back,
-- every heading of values alone and no NULL. A run is a session's processing: an item session's (its response or
-- template processing) or a test session's (its outcome processing). Each value row, in and out, is keyed by its
-- session, the run key (child, package, path, stage): the sitting the call binds, (child, stage), and the session's
-- document in it, which names it there (the ledger's ItemSession key (child, stage, package, path); a sitting's one
-- TestSession and its test). So one call runs every session a statement grades, each by itself, whatever sittings it
-- binds: two sessions of one document, two children's or two sittings', are two run keys, and their values meet only
-- their own. A sitting's document names its session there because a delivered test refers to each item once: pantry
-- refuses two item refs to one href (QTI 3.0.1 §4.1.1), and DeliverableTest excludes a bank placed twice and a
-- selection with replacement (SESSION-REF's pantry verdicts); delivering those would put QTI's instance number in the
-- session's key, and so in the run key. The content, the document's tree, is keyed by the document, (package, path),
-- and a run reads it by its document. A statement that grades one item passes a batch of one. Loads after
-- boundary.sql, whose in_* headings these are with the run key first.
--
-- The document's grader tree crosses as pantry stores it: its nodes, each at its place in the document it is in, its
-- kind the machine's token; their attributes, each by its name's token, as pantry's Attribute holds the value; and the
-- text the machine reads, a base value's and a qti-value's. The machine reads them by the same readers the oracle runs
-- (document.sql), so the program, the inputs and the declared values are read once, in the call. A processing
-- program is its root's subtree, the document's own or the template document it names; the declarations are the
-- document's declarations and every node below them.
create type p3.program_node as ("end" bigint, kind text collate pg_catalog.pg_c_utf8,
  package text collate pg_catalog.pg_c_utf8, parent bigint, path text collate pg_catalog.pg_c_utf8, start bigint);
create type p3.declaration_node as ("end" bigint, kind text collate pg_catalog.pg_c_utf8,
  package text collate pg_catalog.pg_c_utf8, parent bigint, path text collate pg_catalog.pg_c_utf8, start bigint);
create type p3.document_attribute as (name text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8,
  path text collate pg_catalog.pg_c_utf8, start bigint, value text collate pg_catalog.pg_c_utf8);
create type p3.document_text as (package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8,
  start bigint, text text collate pg_catalog.pg_c_utf8);
-- A package's content pattern compiled (xsd_compile's program of a qti-pattern-match's `pattern`, as it is stored), by
-- the package and the pattern's text: a pattern that is no Appendix F expression has none.
create type p3.compiled_pattern as (package text collate pg_catalog.pg_c_utf8, pattern text collate pg_catalog.pg_c_utf8,
  program text collate pg_catalog.pg_c_utf8);
create type p3.pattern_program as (program text collate pg_catalog.pg_c_utf8);
-- A run: its key, whose document is its own (package, path), and the draw stream's key (an item's seed_stream_key of
-- its processing seed, a test session's sitting_seed) and label.
create type p3.document_run as (child text collate pg_catalog.pg_c_utf8, label text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, seed text collate pg_catalog.pg_c_utf8, stage bigint);
-- A session's values, in and out, by base type: boundary.sql's in_* headings with the run key first, and each
-- variable's kind of declaration (VariableKind, a built-in under its own kind's: numAttempts and duration a response's,
-- completionStatus an outcome's, QTI_CONTEXT a context's). In, each variable a run starts from is its doc_var row,
-- whatever it holds, so a variable with no single row is NULL. Out, a run's variables are the same rows.
create type p3.doc_var as (card text collate pg_catalog.pg_c_utf8, child text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, kind text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, stage bigint);
create type p3.doc_base as (base text collate pg_catalog.pg_c_utf8, child text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, stage bigint);
create type p3.doc_text as (base text collate pg_catalog.pg_c_utf8, child text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, place bigint, stage bigint, value text collate pg_catalog.pg_c_utf8);
create type p3.doc_integer as (child text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, place bigint, stage bigint, value numeric(825, 0));
create type p3.doc_float as (base text collate pg_catalog.pg_c_utf8, child text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, place bigint, stage bigint, value float8);
create type p3.doc_boolean as (child text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, place bigint, stage bigint, value boolean);
create type p3.doc_pair as (child text collate pg_catalog.pg_c_utf8, greatest text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, least text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, place bigint, stage bigint);
create type p3.doc_directed_pair as (child text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, place bigint, source text collate pg_catalog.pg_c_utf8, stage bigint, target text collate pg_catalog.pg_c_utf8);
create type p3.doc_point as (child text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, place bigint, stage bigint, x numeric(825, 0), y numeric(825, 0));
create type p3.doc_file as (child text collate pg_catalog.pg_c_utf8, content_type text collate pg_catalog.pg_c_utf8, digest bytea, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, place bigint, stage bigint);
create type p3.doc_file_name as (child text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, name text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, place bigint, stage bigint);
create type p3.doc_field_text as (base text collate pg_catalog.pg_c_utf8, child text collate pg_catalog.pg_c_utf8, field text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, stage bigint, value text collate pg_catalog.pg_c_utf8);
create type p3.doc_field_integer as (child text collate pg_catalog.pg_c_utf8, field text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, stage bigint, value numeric(825, 0));
create type p3.doc_field_float as (base text collate pg_catalog.pg_c_utf8, child text collate pg_catalog.pg_c_utf8, field text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, stage bigint, value float8);
create type p3.doc_field_boolean as (child text collate pg_catalog.pg_c_utf8, field text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, stage bigint, value boolean);
create type p3.doc_field_pair as (child text collate pg_catalog.pg_c_utf8, field text collate pg_catalog.pg_c_utf8, greatest text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, least text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, stage bigint);
create type p3.doc_field_directed_pair as (child text collate pg_catalog.pg_c_utf8, field text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, source text collate pg_catalog.pg_c_utf8, stage bigint, target text collate pg_catalog.pg_c_utf8);
create type p3.doc_field_point as (child text collate pg_catalog.pg_c_utf8, field text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, stage bigint, x numeric(825, 0), y numeric(825, 0));
create type p3.doc_field_file as (child text collate pg_catalog.pg_c_utf8, content_type text collate pg_catalog.pg_c_utf8, digest bytea, field text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, stage bigint);
create type p3.doc_field_file_name as (child text collate pg_catalog.pg_c_utf8, field text collate pg_catalog.pg_c_utf8, holds text collate pg_catalog.pg_c_utf8, identifier text collate pg_catalog.pg_c_utf8, name text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, stage bigint);
-- How a run ended: exit or run (a template constraint's restart never ends one), and the draw stream's
-- position after it.
create type p3.doc_end as (child text collate pg_catalog.pg_c_utf8, drawn integer, flow text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, stage bigint);
-- A recorded application a response processing run reached with a response and could not evaluate (rubric-score's
-- request), by its run and its operator element's start in the stored tree: a run that demands any returns its demands
-- alone, so nothing of its attempt is written and the attempt waits for their evaluations.
create type p3.doc_demand as (child text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, stage bigint, start bigint);
-- A demand's maximum: the value its application's maximum operand took in the run that demanded it (a qti-default, the
-- default in force, which response processing never sets), where it took one; a NULL maximum is no row.
create type p3.doc_demand_maximum as (child text collate pg_catalog.pg_c_utf8, maximum float8, package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, stage bigint, start bigint);
-- A rubric group whose every recorded application a response processing run reached declined, with no person's value,
-- by its run and the group's rubric: a person's to score. A run that asks a person gives its human demands alone.
create type p3.doc_human_demand as (child text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, rubric text collate pg_catalog.pg_c_utf8, stage bigint);
-- A human demand's maximum: the least value the maximum operands of the group's reached applications took, where any
-- took one; none is no row.
create type p3.doc_human_demand_maximum as (child text collate pg_catalog.pg_c_utf8, maximum float8, package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, rubric text collate pg_catalog.pg_c_utf8, stage bigint);
-- A call's result: every run's values after it, by base type, and how each run ended; a response processing run that
-- demanded recorded applications gives its demands alone, and one that asks a person its human demands alone. A field of rows alone, so a statement reads each as a source
-- (FNNEST, Compute.rowOf).
create type p3.doc_values as (bases p3.doc_base[], booleans p3.doc_boolean[], demand_maxima p3.doc_demand_maximum[], demands p3.doc_demand[], directed_pairs p3.doc_directed_pair[], ends p3.doc_end[],
  field_booleans p3.doc_field_boolean[], field_directed_pairs p3.doc_field_directed_pair[], field_file_names p3.doc_field_file_name[], field_files p3.doc_field_file[],
  field_floats p3.doc_field_float[], field_integers p3.doc_field_integer[], field_pairs p3.doc_field_pair[], field_points p3.doc_field_point[],
  field_texts p3.doc_field_text[], file_names p3.doc_file_name[], files p3.doc_file[],
  floats p3.doc_float[], human_demand_maxima p3.doc_human_demand_maximum[], human_demands p3.doc_human_demand[], integers p3.doc_integer[], pairs p3.doc_pair[],
  points p3.doc_point[], texts p3.doc_text[], vars p3.doc_var[]);
-- A copy's place among a bag's copies of one value: a multiple held as (value, count) crosses as count rows of the
-- value, each at its own place.
create type p3.copy as (place bigint);

-- A recorded operator's reply field, as the statement passes the ledger's OperatorReply rows: the run its attempt is,
-- the qti-custom-operator element's start in the stored tree, the field and its value, a float's, or a text's with its base
-- type. A recorded decline, and a request with no reply yet, have no row (the statement's gate holds the latter pending).
create type p3.doc_reply_float as (child text collate pg_catalog.pg_c_utf8, field text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, stage bigint, start bigint, value float8);
create type p3.doc_reply_text as (base text collate pg_catalog.pg_c_utf8, child text collate pg_catalog.pg_c_utf8, field text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, stage bigint, start bigint, value text collate pg_catalog.pg_c_utf8);
-- A recorded application of an attempt that has its evaluation, replied or declined (the ledger's OperatorEvaluation), by
-- the run its attempt is and its operator element's start in the stored tree: what response processing reads as the
-- run's evaluated applications, so it demands none twice and a declined one's value is NULL.
create type p3.doc_evaluation as (child text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, stage bigint, start bigint);
-- A person's value of a rubric group of an attempt (the ledger's HumanOperatorValue in force), by the run its attempt is
-- and the group's rubric: what response processing reads in place of each of the group's draws.
create type p3.doc_human as (child text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, rubric text collate pg_catalog.pg_c_utf8, score float8, stage bigint);
-- That person's feedback where they gave one (the ledger's HumanOperatorFeedback at the value's instant): no feedback
-- is no row.
create type p3.doc_human_feedback as (child text collate pg_catalog.pg_c_utf8, feedback text collate pg_catalog.pg_c_utf8, package text collate pg_catalog.pg_c_utf8, path text collate pg_catalog.pg_c_utf8, rubric text collate pg_catalog.pg_c_utf8, stage bigint);
