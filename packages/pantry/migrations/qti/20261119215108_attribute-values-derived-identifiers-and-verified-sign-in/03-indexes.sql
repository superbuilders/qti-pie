-- grizzle: no-transaction

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_oavaoq32mu";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_oavaoq32mu" ON "qti"."attribute" USING btree ("__package_errr4rslgl", "__path_6r25o73dfe", "__start_3yrluhvjfi");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_key_package_path_start_a6pktlx5sj";

CREATE UNIQUE INDEX CONCURRENTLY "__node_key_package_path_start_a6pktlx5sj" ON "qti"."node" USING btree ("__package_pzlq2bwqm3", "__path_4coi6s576w", "__start_kdua5votbj");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__variable_ref_key_package_path_start_attribute_kgz4mhfwjm";

CREATE UNIQUE INDEX CONCURRENTLY "__variable_ref_key_package_path_start_attribute_kgz4mhfwjm" ON "qti"."variable_ref" USING btree ("package", "path", "start", "attribute", "identifier");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_ix_package_jrh_4_wbrdcs_path_xrl_4_ean_n4qqbbunzf";

CREATE INDEX CONCURRENTLY "__attribute_ix_package_jrh_4_wbrdcs_path_xrl_4_ean_n4qqbbunzf" ON "qti"."attribute" USING btree ("__package_jrh4wbrdcs", "__path_xrl4ean242", "__start_v7jhneryku", "__name_olkikci4cm");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_ix_package_name_kind_image_value_path_4gc7q6filp";

CREATE INDEX CONCURRENTLY "__attribute_ix_package_name_kind_image_value_path_4gc7q6filp" ON "qti"."attribute" USING btree ("package", "name", "kind", ("pg_catalog"."md5"("value")), "path", "start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_ix_package_name_kind_start_path_vpieosiivb";

CREATE INDEX CONCURRENTLY "__attribute_ix_package_name_kind_start_path_vpieosiivb" ON "qti"."attribute" USING btree ("package", "name", "kind", "start", "path");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_ix_package_path_name_kind_image_value_bysppk4y4d";

CREATE INDEX CONCURRENTLY "__attribute_ix_package_path_name_kind_image_value_bysppk4y4d" ON "qti"."attribute" USING btree ("package", "path", "name", "kind", ("pg_catalog"."md5"("value")), "start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__document_id_ix_package_path_admitted_owner_jp55imcxjo";

CREATE INDEX CONCURRENTLY "__document_id_ix_package_path_admitted_owner_jp55imcxjo" ON "qti"."document_id" USING btree ("package", "path", "admitted", "owner");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__fragment_printed_ref_ix_package_assembly_attribute_zjvkoqjqfo";

CREATE INDEX CONCURRENTLY "__fragment_printed_ref_ix_package_assembly_attribute_zjvkoqjqfo" ON "qti"."fragment_printed_ref" USING btree ("package", "assembly", "attribute", "kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__fragment_printed_ref_ix_package_assembly_ycu2amkeef";

CREATE INDEX CONCURRENTLY "__fragment_printed_ref_ix_package_assembly_ycu2amkeef" ON "qti"."fragment_printed_ref" USING btree ("package", "assembly", "identifier");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__idref_ix_package_path_name_ckzbix4lpw";

CREATE INDEX CONCURRENTLY "__idref_ix_package_path_name_ckzbix4lpw" ON "qti"."idref" USING btree ("package", "path", "name");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_path_element_children_kind_parent_st7tbj3vpb";

CREATE INDEX CONCURRENTLY "__node_ix_package_path_element_children_kind_parent_st7tbj3vpb" ON "qti"."node" USING btree ("package", "path", "element_children", "kind", "parent_kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_variable_ref_ix_package_assembly_resolution_ymsbodsibl";

CREATE INDEX CONCURRENTLY "__placed_variable_ref_ix_package_assembly_resolution_ymsbodsibl" ON "qti"."placed_variable_ref" USING btree ("package", "assembly", "resolution", "attribute", "identifier");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_variable_ref_ix_package_path_start_vancfqqmxp";

CREATE INDEX CONCURRENTLY "__placed_variable_ref_ix_package_path_start_vancfqqmxp" ON "qti"."placed_variable_ref" USING btree ("package", "path", "start", "attribute", "identifier");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_variable_ref_ix_package_resolution_dgkqzkehhp";

CREATE INDEX CONCURRENTLY "__placed_variable_ref_ix_package_resolution_dgkqzkehhp" ON "qti"."placed_variable_ref" USING btree ("package", "resolution", "attribute", "path", "start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__printed_variable_ref_ix_package_path_attribute_6csxkflr5e";

CREATE INDEX CONCURRENTLY "__printed_variable_ref_ix_package_path_attribute_6csxkflr5e" ON "qti"."printed_variable_ref" USING btree ("package", "path", "attribute", "kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__printed_variable_ref_ix_package_path_identifier_utzunspzz6";

CREATE INDEX CONCURRENTLY "__printed_variable_ref_ix_package_path_identifier_utzunspzz6" ON "qti"."printed_variable_ref" USING btree ("package", "path", "identifier");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__ssml_scope_ix_package_path_fragment_eypvysdzvg";

CREATE INDEX CONCURRENTLY "__ssml_scope_ix_package_path_fragment_eypvysdzvg" ON "qti"."ssml_scope" USING btree ("package", "path", "fragment");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__variable_ref_ix_package_path_identifier_wkkut3gdit";

CREATE INDEX CONCURRENTLY "__variable_ref_ix_package_path_identifier_wkkut3gdit" ON "qti"."variable_ref" USING btree ("package", "path", "identifier");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__variable_ref_ix_package_path_resolution_attribute_ufgtzeln7m";

CREATE INDEX CONCURRENTLY "__variable_ref_ix_package_path_resolution_attribute_ufgtzeln7m" ON "qti"."variable_ref" USING btree ("package", "path", "resolution", "attribute", "identifier");
