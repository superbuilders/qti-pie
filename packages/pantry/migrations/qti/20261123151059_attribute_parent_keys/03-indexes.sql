-- grizzle: no-transaction

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_parent_3pbuan3ddy";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_parent_3pbuan3ddy" ON "qti"."attribute" USING btree ("__package_c6ealb2c5z", "path", "parent");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_parent_value_digest_uwesnpe757";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_parent_value_digest_uwesnpe757" ON "qti"."attribute" USING btree ("__package_ybzlg64bpx", "path", "parent", "value_digest");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_parent_value_digest_4jxprvi7wt";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_parent_value_digest_4jxprvi7wt" ON "qti"."attribute" USING btree ("__package_vtzt2gplfj", "path", "parent", "value_digest");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_parent_value_digest_4k3ay3grnz";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_parent_value_digest_4k3ay3grnz" ON "qti"."attribute" USING btree ("__package_cg3657csij", "path", "parent", "value_digest");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_key_package_path_start_attributes_governor_pxds7wqnyl";

CREATE UNIQUE INDEX CONCURRENTLY "__node_key_package_path_start_attributes_governor_pxds7wqnyl" ON "qti"."node" USING btree ("package", "path", "start", "attributes", "governor", "kind", "parent");
