DROP VIEW "qti_queries__author"."object_identifier";

CREATE VIEW "qti_queries__author"."object_identifier" ("lexical", "package", "path", "start", "identifier") AS
SELECT "r1"."lexical", "r1"."package", "r1"."path", "r1"."start", "r1"."identifier"
FROM "qti"."object_identifier" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."object_identifier" TO :"qti_queries__author";
