-- grizzle: no-transaction

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__choice_key_package_path_kind_identifier_auoyrne6k5";

CREATE UNIQUE INDEX CONCURRENTLY "__choice_key_package_path_kind_identifier_auoyrne6k5" ON "qti"."choice" USING btree ("package", "path", "kind", "identifier");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_choice_key_package_assembly_kind_identifier_qgyuv4g444";

CREATE UNIQUE INDEX CONCURRENTLY "__placed_choice_key_package_assembly_kind_identifier_qgyuv4g444" ON "qti"."placed_choice" USING btree ("package", "assembly", "kind", "identifier");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_choice_ix_package_path_start_kind_5miftnmzpk";

CREATE INDEX CONCURRENTLY "__placed_choice_ix_package_path_start_kind_5miftnmzpk" ON "qti"."placed_choice" USING btree ("package", "path", "start", "kind");
