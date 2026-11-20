DROP VIEW "qti_queries__author"."site_target";

ALTER TABLE "qti"."site_target"
  DROP CONSTRAINT "e_1_derived",
  ADD CONSTRAINT "e_1_derived" CHECK (((NOT "target_root" IN (300::smallint, 302::smallint) AND "places" = false OR "target_root" IN (300::smallint, 302::smallint) AND "places" = true) AND "splices" = false OR "kind" = 642::smallint) IS TRUE) NOT VALID;

CREATE VIEW "qti_queries__author"."site_target" ("ancestry", "kind", "kind_name", "nearest", "nearest_kind", "nearest_kind_name", "package", "parent_kind", "parent_kind_name", "path", "places", "splices", "start", "target", "target_nearest", "target_nearest_kind", "target_nearest_kind_name", "target_nearest_path", "target_root", "target_root_name", "version", "version_name") AS
SELECT "r1"."ancestry", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."nearest", "r1"."nearest_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."nearest_kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."parent_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."parent_kind" + 1]::"pg_catalog"."text", "r1"."path", "r1"."places", "r1"."splices", "r1"."start", "r1"."target", "r1"."target_nearest", "r1"."target_nearest_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."target_nearest_kind" + 1]::"pg_catalog"."text", "r1"."target_nearest_path", "r1"."target_root", ("qti"."__node_kind_names_ulbko553n7"())["r1"."target_root" + 1]::"pg_catalog"."text", "r1"."version", ("qti"."__schema_version_names_p2hfvbhu24"())["r1"."version" + 1]::"pg_catalog"."text"
FROM "qti"."site_target" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."site_target" TO :"qti_queries__author";
