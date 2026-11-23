DROP VIEW "qti_queries__author"."package";

CREATE VIEW "qti_queries__author"."package" ("package") AS
SELECT "r1"."package"
FROM "qti"."package" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."package" TO :"qti_queries__author";
