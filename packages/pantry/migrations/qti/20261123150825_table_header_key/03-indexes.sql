-- grizzle: no-transaction

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__table_header_key_package_path_table_id_digest_hp2zy2cco6";

CREATE UNIQUE INDEX CONCURRENTLY "__table_header_key_package_path_table_id_digest_hp2zy2cco6" ON "qti"."table_header" USING btree ("__package_ccgb34afwq", "path", "table", "id_digest");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__table_scope_key_package_path_start_table_k6mhb5efs3";

CREATE UNIQUE INDEX CONCURRENTLY "__table_scope_key_package_path_start_table_k6mhb5efs3" ON "qti"."table_scope" USING btree ("package", "path", "start", "table");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__table_header_ix_package_path_table_nl5r7jdshk";

CREATE INDEX CONCURRENTLY "__table_header_ix_package_path_table_nl5r7jdshk" ON "qti"."table_header" USING btree ("package", "path", "table");
