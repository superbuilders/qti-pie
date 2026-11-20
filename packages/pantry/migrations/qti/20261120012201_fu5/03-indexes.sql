-- grizzle: no-transaction

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_key_package_path_parent_state_xef7iaytjz";

CREATE UNIQUE INDEX CONCURRENTLY "__node_key_package_path_parent_state_xef7iaytjz" ON "qti"."node" USING btree ("__package_3taa5kijgy", "__path_4et2r2wckb", "__parent_cuutywtabc", "__state_uxsdhqrgpz");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_key_package_path_parent_uibqy75ezp";

CREATE UNIQUE INDEX CONCURRENTLY "__node_key_package_path_parent_uibqy75ezp" ON "qti"."node" USING btree ("__package_lqgfkydq7q", "__path_ms4olijgu3", "__parent_gvsacnek5z");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_ix_package_name_kind_path_start_fp4zfdf3ca";

CREATE INDEX CONCURRENTLY "__attribute_ix_package_name_kind_path_start_fp4zfdf3ca" ON "qti"."attribute" USING btree ("package", "name", "kind", "path", "start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_ix_package_path_image_value_start_j4tigsedyx";

CREATE INDEX CONCURRENTLY "__attribute_ix_package_path_image_value_start_j4tigsedyx" ON "qti"."attribute" USING btree ("package", "path", ("pg_catalog"."md5"("value")), "start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_path_kind_parent_elements_d5l24r3p2o";

CREATE INDEX CONCURRENTLY "__node_ix_package_path_kind_parent_elements_d5l24r3p2o" ON "qti"."node" USING btree ("package", "path", "kind", "parent", "elements");
