DROP VIEW "qti_queries__author"."object_identifier";

DROP VIEW "qti_queries__author"."assessment_object";

ALTER TABLE "qti"."object_identifier"
  DROP CONSTRAINT "e_1_derived",
  ADD CONSTRAINT "e_1_derived" CHECK (("identifier" ~ '\A[\u0001-\u0008\u000B\u000C\u000E-\u001F\!-\U0010FFFF]+\Z'::"pg_catalog"."text") IS TRUE) NOT VALID;

CREATE VIEW "qti_queries__author"."object_identifier" ("lexical", "package", "path", "start", "identifier") AS
SELECT "r1"."lexical", "r1"."package", "r1"."path", "r1"."start", "r1"."identifier"
FROM "qti"."object_identifier" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."object_identifier" TO :"qti_queries__author";
