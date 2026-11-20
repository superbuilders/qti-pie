DROP VIEW "qti_queries__author"."variable_mapping";

DROP VIEW "qti_queries__author"."section_selection";

DROP VIEW "qti_queries__author"."section_ordering";

DROP VIEW "qti_queries__author"."section";

DROP VIEW "qti_queries__author"."quotation";

DROP VIEW "qti_queries__author"."pi";

DROP VIEW "qti_queries__author"."node";

DROP VIEW "qti_queries__author"."math_cell";

DROP VIEW "qti_queries__author"."math_align_scope";

DROP VIEW "qti_queries__author"."math_action";

DROP VIEW "qti_queries__author"."doctype";

DROP VIEW "qti_queries__author"."comment";

DROP VIEW "qti_queries__author"."area_mapping";

CREATE VIEW "qti_queries__author"."area_mapping" ("base_types", "cardinalities", "declaration", "declaration_kind", "declaration_kind_name", "kind", "kind_name", "nearest", "package", "path", "start", "version", "version_name") AS
SELECT "r1"."base_types", "r1"."cardinalities", "r1"."declaration", "r1"."declaration_kind", ("qti"."__declaration_kind_names_o62wpad2p7"())["r1"."declaration_kind" + 1]::"pg_catalog"."text", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."nearest", "r1"."package", "r1"."path", "r1"."start", "r1"."version", ("qti"."__schema_version_names_p2hfvbhu24"())["r1"."version" + 1]::"pg_catalog"."text"
FROM "qti"."area_mapping" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."area_mapping" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."comment" ("package", "path", "start", "value") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."value"
FROM "qti"."comment" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."comment" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."doctype" ("package", "path", "start", "value") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."value"
FROM "qti"."doctype" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."doctype" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."math_action" ("element_children", "elements", "package", "path", "selection_lexical", "selection_written", "start", "selection") AS
SELECT "r1"."element_children", "r1"."elements", "r1"."package", "r1"."path", "r1"."selection_lexical", "r1"."selection_written", "r1"."start", "r1"."selection"
FROM "qti"."math_action" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."math_action" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."math_align_scope" ("cell", "chosen", "dir_lexical", "element_children", "elements", "inherited", "inherited_name", "kind", "kind_name", "nearest", "own", "own_name", "package", "parent", "parent_kind", "parent_kind_name", "passes", "passes_name", "path", "received", "received_name", "start", "state", "state_name", "version", "version_name") AS
SELECT "r1"."cell", "r1"."chosen", "r1"."dir_lexical", "r1"."element_children", "r1"."elements", "r1"."inherited", ("qti"."__align_direction_names_vluq7iazdg"())["r1"."inherited" + 1]::"pg_catalog"."text", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."nearest", "r1"."own", ("qti"."__align_direction_names_vluq7iazdg"())["r1"."own" + 1]::"pg_catalog"."text", "r1"."package", "r1"."parent", "r1"."parent_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."parent_kind" + 1]::"pg_catalog"."text", "r1"."passes", ("qti"."__align_state_names_ffk37slxn3"())["r1"."passes" + 1]::"pg_catalog"."text", "r1"."path", "r1"."received", ("qti"."__align_state_names_ffk37slxn3"())["r1"."received" + 1]::"pg_catalog"."text", "r1"."start", "r1"."state", ("qti"."__align_state_names_ffk37slxn3"())["r1"."state" + 1]::"pg_catalog"."text", "r1"."version", ("qti"."__schema_version_names_p2hfvbhu24"())["r1"."version" + 1]::"pg_catalog"."text"
FROM "qti"."math_align_scope" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."math_align_scope" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."math_cell" ("groups", "last_start", "leaves", "package", "path", "start") AS
SELECT "r1"."groups", "r1"."last_start", "r1"."leaves", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."math_cell" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."math_cell" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."node" ("ancestry", "at", "attributes", "attrs", "barred_children", "chars", "chars_after", "chars_was", "children", "counted_children", "document_type", "document_type_name", "element_children", "elements", "elements_was", "end", "first", "governor", "governor_name", "kind", "kind_name", "last", "last_state", "last_state_name", "namespaces", "nearest", "nearest_kind", "nearest_kind_name", "nearest_path", "open_attributes", "package", "parent", "parent_ancestry", "parent_governor", "parent_governor_name", "parent_kind", "parent_kind_name", "parent_nearest", "parent_nearest_kind", "parent_nearest_kind_name", "parent_nearest_path", "parent_parent_kind", "parent_parent_kind_name", "path", "prefix", "start", "state", "state_name", "string_value", "version", "version_name", "was", "was_name") AS
SELECT "r1"."ancestry", "r1"."at", "r1"."attributes", "r1"."attrs", "r1"."barred_children", "r1"."chars", "r1"."chars_after", "r1"."chars_was", "r1"."children", "r1"."counted_children", "r1"."document_type", ("qti"."__document_type_names_b6nphfgptk"())["r1"."document_type" + 1]::"pg_catalog"."text", "r1"."element_children", "r1"."elements", "r1"."elements_was", "r1"."end", "r1"."first", "r1"."governor", ("qti"."__governor_names_d7jfyla3na"())["r1"."governor" + 1]::"pg_catalog"."text", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."last", "r1"."last_state", ("qti"."__position_names_sglcn7ygpg"())["r1"."last_state" + 1]::"pg_catalog"."text", "r1"."namespaces", "r1"."nearest", "r1"."nearest_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."nearest_kind" + 1]::"pg_catalog"."text", "r1"."nearest_path", "r1"."open_attributes", "r1"."package", "r1"."parent", "r1"."parent_ancestry", "r1"."parent_governor", ("qti"."__governor_names_d7jfyla3na"())["r1"."parent_governor" + 1]::"pg_catalog"."text", "r1"."parent_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."parent_kind" + 1]::"pg_catalog"."text", "r1"."parent_nearest", "r1"."parent_nearest_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."parent_nearest_kind" + 1]::"pg_catalog"."text", "r1"."parent_nearest_path", "r1"."parent_parent_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."parent_parent_kind" + 1]::"pg_catalog"."text", "r1"."path", "r1"."prefix", "r1"."start", "r1"."state", ("qti"."__position_names_sglcn7ygpg"())["r1"."state" + 1]::"pg_catalog"."text", "r1"."string_value", "r1"."version", ("qti"."__schema_version_names_p2hfvbhu24"())["r1"."version" + 1]::"pg_catalog"."text", "r1"."was", ("qti"."__position_names_sglcn7ygpg"())["r1"."was" + 1]::"pg_catalog"."text"
FROM "qti"."node" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."node" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."pi" ("data", "package", "path", "start", "target") AS
SELECT "r1"."data", "r1"."package", "r1"."path", "r1"."start", "r1"."target"
FROM "qti"."pi" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."pi" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."quotation" ("after", "at", "before", "children", "first", "first_at", "kind", "kind_name", "last", "nearest", "next_at", "package", "parent", "parent_at", "path", "siblings", "start", "version", "version_name") AS
SELECT "r1"."after", "r1"."at", "r1"."before", "r1"."children", "r1"."first", "r1"."first_at", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."last", "r1"."nearest", "r1"."next_at", "r1"."package", "r1"."parent", "r1"."parent_at", "r1"."path", "r1"."siblings", "r1"."start", "r1"."version", ("qti"."__schema_version_names_p2hfvbhu24"())["r1"."version" + 1]::"pg_catalog"."text"
FROM "qti"."quotation" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."quotation" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."section" ("keep_together", "kind", "kind_name", "loose", "loose_chain", "members", "mixes", "nearest", "package", "parent", "parent_kind", "parent_kind_name", "parent_loose_chain", "parent_mixes", "part", "path", "replaced", "replacing", "required", "shuffle", "start", "version", "version_name", "with_replacement") AS
SELECT "r1"."keep_together", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."loose", "r1"."loose_chain", "r1"."members", "r1"."mixes", "r1"."nearest", "r1"."package", "r1"."parent", "r1"."parent_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."parent_kind" + 1]::"pg_catalog"."text", "r1"."parent_loose_chain", "r1"."parent_mixes", "r1"."part", "r1"."path", "r1"."replaced", "r1"."replacing", "r1"."required", "r1"."shuffle", "r1"."start", "r1"."version", ("qti"."__schema_version_names_p2hfvbhu24"())["r1"."version" + 1]::"pg_catalog"."text", "r1"."with_replacement"
FROM "qti"."section" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."section" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."section_ordering" ("kind", "kind_name", "nearest", "package", "parent", "path", "shuffle", "start", "version", "version_name") AS
SELECT "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."nearest", "r1"."package", "r1"."parent", "r1"."path", "r1"."shuffle", "r1"."start", "r1"."version", ("qti"."__schema_version_names_p2hfvbhu24"())["r1"."version" + 1]::"pg_catalog"."text"
FROM "qti"."section_ordering" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."section_ordering" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."section_selection" ("kind", "kind_name", "members", "nearest", "package", "parent", "path", "required", "select_form", "select_lead", "select_lexical", "select_trail", "start", "version", "version_name", "with_replacement", "select") AS
SELECT "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."members", "r1"."nearest", "r1"."package", "r1"."parent", "r1"."path", "r1"."required", "r1"."select_form", "r1"."select_lead", "r1"."select_lexical", "r1"."select_trail", "r1"."start", "r1"."version", ("qti"."__schema_version_names_p2hfvbhu24"())["r1"."version" + 1]::"pg_catalog"."text", "r1"."with_replacement", "r1"."select"
FROM "qti"."section_selection" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."section_selection" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."variable_mapping" ("kind", "kind_name", "nearest", "package", "parent", "path", "source", "start", "target", "version", "version_name") AS
SELECT "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."nearest", "r1"."package", "r1"."parent", "r1"."path", "r1"."source", "r1"."start", "r1"."target", "r1"."version", ("qti"."__schema_version_names_p2hfvbhu24"())["r1"."version" + 1]::"pg_catalog"."text"
FROM "qti"."variable_mapping" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."variable_mapping" TO :"qti_queries__author";
