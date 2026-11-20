-- grizzle: no-transaction

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__object_identifier_key_package_identifier_dezqlcjgsf";

CREATE UNIQUE INDEX CONCURRENTLY "__object_identifier_key_package_identifier_dezqlcjgsf" ON "qti"."object_identifier" USING btree ("package", "identifier");
