-- The admission run's row export (scripts/admit.ts): the Node, OpenAttribute, Reference and Srcset rows of every
-- package it imported (a Srcset row with its element's kind, from the element's Node row),
-- the one-document packages named a-<digest> and the packages imported whole named s-<folder>, each closed value
-- (a node's kind, an attribute's name and class, a reference's scope) by its roster's name, through the database's
-- own name functions. Run by psql as the installation's owner after `admit.ts import`, with
-- `-v out=<the run's directory>`; `admit.ts write` reads the files it writes there. It sets its own output, unaligned
-- rows with no header or footer, so the files hold one JSON object a line whatever flags psql is run with.
\set QUIET on
\pset format unaligned
\pset tuples_only on
select proname as node_kind_names from pg_proc where proname like '\_\_node\_kind\_names\_%' limit 1 \gset
select proname as attribute_name_names from pg_proc where proname like '\_\_attribute\_name\_names\_%' limit 1 \gset
\set nodes :out '/nodes.raw.jsonl'
\set attributes :out '/open-attributes.raw.jsonl'
\o :nodes
select json_build_object('package', package, 'path', path, 'start', start, 'kind', ("qti".:"node_kind_names"())[kind + 1])::text
from "qti"."node"
where package like 'a-%' or package like 's-%'
order by package, path, start;
\o :attributes
select json_build_object('package', package, 'path', path, 'start', start, 'uri', uri, 'local', local, 'class', ("qti".:"attribute_name_names"())[class + 1])::text
from "qti"."open_attribute"
where package like 'a-%' or package like 's-%'
order by package, path, start, uri, local;
\o
select proname as href_scope_names from pg_proc where proname like '\_\_href\_scope\_names\_%' limit 1 \gset
\set references :out '/references.raw.jsonl'
\set srcsets :out '/srcsets.raw.jsonl'
\o :references
select json_build_object('package', package, 'path', path, 'start', start, 'name', ("qti".:"attribute_name_names"())[name + 1], 'kind', ("qti".:"node_kind_names"())[kind + 1], 'scope', ("qti".:"href_scope_names"())[scope + 1])::text
from "qti"."reference"
where package like 'a-%' or package like 's-%'
order by package, path, start, name;
\o :srcsets
select json_build_object('package', package, 'path', path, 'start', start, 'kind', ("qti".:"node_kind_names"())[kind + 1])::text
from "qti"."srcset" join "qti"."node" using (package, path, start)
where package like 'a-%' or package like 's-%'
order by package, path, start;
\o
