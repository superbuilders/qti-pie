-- grizzle: no-transaction

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_key_package_path_start_fyqsz3y34d";

CREATE UNIQUE INDEX CONCURRENTLY "__node_key_package_path_start_fyqsz3y34d" ON "qti"."node" USING btree ("__package_wtd2w4qfji", "__path_bfqodus5d5", "__start_ywa525wws7");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_key_package_path_start_v4owemqtcl";

CREATE UNIQUE INDEX CONCURRENTLY "__node_key_package_path_start_v4owemqtcl" ON "qti"."node" USING btree ("__package_d6agk4o5jj", "__path_ugsk4ooaha", "__start_dgto3kfkfz");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__declaration_identifier_ix_package_oxpssgzkql_path_vt5av4gyzy";

CREATE INDEX CONCURRENTLY "__declaration_identifier_ix_package_oxpssgzkql_path_vt5av4gyzy" ON "qti"."declaration_identifier" USING btree ("__package_oxpssgzkql", "__path_wthkgnfegs", "__start_cda7fuvygk");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__declaration_identifier_ix_package_rjldczgxxz_path_jfhcvvr5hd";

CREATE INDEX CONCURRENTLY "__declaration_identifier_ix_package_rjldczgxxz_path_jfhcvvr5hd" ON "qti"."declaration_identifier" USING btree ("__package_rjldczgxxz", "__path_55aonqm7nv", "__start_tgrwo4gva2");
