DROP VIEW "qti_queries__author"."srcset";

DROP VIEW "qti_queries__author"."mapping_cardinality";

DROP VIEW "qti_queries__author"."mapping_base_type";

DROP VIEW "qti_queries__author"."mapping";

DROP VIEW "qti_queries__author"."map_key_type";

DROP VIEW "qti_queries__author"."map_key";

DROP VIEW "qti_queries__author"."lookup_value_type";

DROP VIEW "qti_queries__author"."lookup_value";

DROP VIEW "qti_queries__author"."lookup_table_cardinality";

DROP VIEW "qti_queries__author"."lookup_table";

DROP VIEW "qti_queries__author"."idref";

DROP VIEW "qti_queries__author"."identity_text";

DROP VIEW "qti_queries__author"."area_mapping_cardinality";

DROP VIEW "qti_queries__author"."area_mapping";

ALTER TABLE "qti"."lookup_value" ALTER COLUMN "value" TYPE "qti"."__text_oq3spimary" USING "value"::"qti"."__text_oq3spimary";

ALTER TABLE "qti"."map_key" ALTER COLUMN "key" TYPE "qti"."__text_oq3spimary" USING "key"::"qti"."__text_oq3spimary";

ALTER TABLE "qti"."idref"
  DROP CONSTRAINT "e_1_derived",
  ADD CONSTRAINT "e_1_derived" CHECK (("token" ~ '\A[\u0001-\u0008\u000B\u000C\u000E-\u001F\!-\U0010FFFF]+\Z'::"pg_catalog"."text" AND ("at" = 0::bigint OR "before" <> ''::"pg_catalog"."text")) IS TRUE) NOT VALID;

CREATE VIEW "qti_queries__author"."identity_text" ("package", "path", "start", "token_text", "tokens") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."token_text", "r1"."tokens"
FROM "qti"."identity_text" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."identity_text" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."idref" ("after", "at", "before", "name", "name_name", "package", "path", "pieces_after", "pieces_was", "start", "token", "piece") AS
SELECT "r1"."after", "r1"."at", "r1"."before", "r1"."name", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."name" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."pieces_after", "r1"."pieces_was", "r1"."start", "r1"."token", "r1"."piece"
FROM "qti"."idref" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."idref" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."lookup_value" ("package", "path", "start", "value") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."value"
FROM "qti"."lookup_value" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."lookup_value" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."map_key" ("key", "package", "path", "start") AS
SELECT "r1"."key", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."map_key" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."map_key" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."srcset" ("kind", "kind_name", "lexical", "name", "name_name", "package", "path", "start", "token_text", "tokens", "trail") AS
SELECT "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."lexical", "r1"."name", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."name" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start", "r1"."token_text", "r1"."tokens", "r1"."trail"
FROM "qti"."srcset" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."srcset" TO :"qti_queries__author";
