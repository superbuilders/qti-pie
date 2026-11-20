-- grizzle: no-transaction

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_ix_package_document_type_kind_name_path_i5auyek7i3";

CREATE INDEX CONCURRENTLY "__attribute_ix_package_document_type_kind_name_path_i5auyek7i3" ON "qti"."attribute" USING btree ("package", "document_type", "kind", "name", "path", "start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_ix_package_path_name_kind_start_jj2dexdmnt";

CREATE INDEX CONCURRENTLY "__attribute_ix_package_path_name_kind_start_jj2dexdmnt" ON "qti"."attribute" USING btree ("package", "path", "name", "kind", "start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__binding_cardinality_ix_package_attribute_4zvtryuec5";

CREATE INDEX CONCURRENTLY "__binding_cardinality_ix_package_attribute_4zvtryuec5" ON "qti"."binding_cardinality" USING btree ("package", "attribute", "cardinality", "path", "start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__choice_ix_package_path_identifier_start_v4shno6kmh";

CREATE INDEX CONCURRENTLY "__choice_ix_package_path_identifier_start_v4shno6kmh" ON "qti"."choice" USING btree ("package", "path", "identifier", "start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__declaration_cardinality_ix_package_path_lxnodpf6jc";

CREATE INDEX CONCURRENTLY "__declaration_cardinality_ix_package_path_lxnodpf6jc" ON "qti"."declaration_cardinality" USING btree ("package", "path", "cardinality", "start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__document_ix_package_assembled_path_6hx6cticyt";

CREATE INDEX CONCURRENTLY "__document_ix_package_assembled_path_6hx6cticyt" ON "qti"."document" USING btree ("package", "assembled", "path");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__expression_ix_package_path_base_type_start_tun2l55ql4";

CREATE INDEX CONCURRENTLY "__expression_ix_package_path_base_type_start_tun2l55ql4" ON "qti"."expression" USING btree ("package", "path", "base_type", "start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__file_ix_package_scope_target_path_m3rxj4gpfz";

CREATE INDEX CONCURRENTLY "__file_ix_package_scope_target_path_m3rxj4gpfz" ON "qti"."file" USING btree ("package", "scope", "target", "path");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__instance_ix_package_assembly_kind_assembly_start_vtst2tcdoj";

CREATE INDEX CONCURRENTLY "__instance_ix_package_assembly_kind_assembly_start_vtst2tcdoj" ON "qti"."instance" USING btree ("package", "assembly_kind", "assembly", "start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__instance_ix_package_start_document_assembly_rmwvqsnjiw";

CREATE INDEX CONCURRENTLY "__instance_ix_package_start_document_assembly_rmwvqsnjiw" ON "qti"."instance" USING btree ("package", "start", "document", "assembly");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__interaction_attribute_ix_package_path_name_kind_xtjkb3ejt7";

CREATE INDEX CONCURRENTLY "__interaction_attribute_ix_package_path_name_kind_xtjkb3ejt7" ON "qti"."interaction_attribute" USING btree ("package", "path", "name", "kind", "value", "start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_kind_parent_kind_document_type_rpll2cectd";

CREATE INDEX CONCURRENTLY "__node_ix_package_kind_parent_kind_document_type_rpll2cectd" ON "qti"."node" USING btree ("package", "kind", "parent_kind", "document_type", "path", "start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_kind_start_path_nkmezovkhh";

CREATE INDEX CONCURRENTLY "__node_ix_package_kind_start_path_nkmezovkhh" ON "qti"."node" USING btree ("package", "kind", "start", "path");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_nearest_kind_path_start_ltmuyqocc3";

CREATE INDEX CONCURRENTLY "__node_ix_package_nearest_kind_path_start_ltmuyqocc3" ON "qti"."node" USING btree ("package", "nearest_kind", "path", "start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_parent_path_start_eqxlicox6v";

CREATE INDEX CONCURRENTLY "__node_ix_package_parent_path_start_eqxlicox6v" ON "qti"."node" USING btree ("package", "parent", "path", "start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_path_parent_kind_kind_document_yztpammugz";

CREATE INDEX CONCURRENTLY "__node_ix_package_path_parent_kind_kind_document_yztpammugz" ON "qti"."node" USING btree ("package", "path", "parent_kind", "kind", "document_type", "start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__object_title_ix_package_start_path_keqoaxyfjh";

CREATE INDEX CONCURRENTLY "__object_title_ix_package_start_path_keqoaxyfjh" ON "qti"."object_title" USING btree ("package", "start", "path");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__pci_module_form_ix_package_path_element_start_j6pwi6afuc";

CREATE INDEX CONCURRENTLY "__pci_module_form_ix_package_path_element_start_j6pwi6afuc" ON "qti"."pci_module_form" USING btree ("package", "path", "element", "start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_binding_cardinality_ix_package_attribute_pnvr4e3kuf";

CREATE INDEX CONCURRENTLY "__placed_binding_cardinality_ix_package_attribute_pnvr4e3kuf" ON "qti"."placed_binding_cardinality" USING btree ("package", "attribute", "cardinality", "assembly", "instance", "start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_variable_ref_ix_package_assembly_identifier_x35b72r5wh";

CREATE INDEX CONCURRENTLY "__placed_variable_ref_ix_package_assembly_identifier_x35b72r5wh" ON "qti"."placed_variable_ref" USING btree ("package", "assembly", "identifier", "instance", "path", "start", "attribute");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_variable_ref_declaration_ix_package_path_tuyhxorydg";

CREATE INDEX CONCURRENTLY "__placed_variable_ref_declaration_ix_package_path_tuyhxorydg" ON "qti"."placed_variable_ref_declaration" USING btree ("package", "path", "start", "assembly", "instance", "attribute");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__reference_path_ix_package_kind_path_start_name_e7vdmapt7o";

CREATE INDEX CONCURRENTLY "__reference_path_ix_package_kind_path_start_name_e7vdmapt7o" ON "qti"."reference_path" USING btree ("package", "kind", "path", "start", "name");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__share_fragment_ix_package_path_assembled_start_njqql36dxw";

CREATE INDEX CONCURRENTLY "__share_fragment_ix_package_path_assembled_start_njqql36dxw" ON "qti"."share_fragment" USING btree ("package", "path", "assembled", "start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__site_path_ix_package_entry_path_start_lzli5pxkzl";

CREATE INDEX CONCURRENTLY "__site_path_ix_package_entry_path_start_lzli5pxkzl" ON "qti"."site_path" USING btree ("package", "entry", "path", "start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__variable_ref_ix_package_path_identifier_start_cm5zcnok6q";

CREATE INDEX CONCURRENTLY "__variable_ref_ix_package_path_identifier_start_cm5zcnok6q" ON "qti"."variable_ref" USING btree ("package", "path", "identifier", "start", "attribute");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__variable_ref_ix_package_path_start_kind_attribute_soxvwpwniy";

CREATE INDEX CONCURRENTLY "__variable_ref_ix_package_path_start_kind_attribute_soxvwpwniy" ON "qti"."variable_ref" USING btree ("package", "path", "start", "kind", "attribute");
