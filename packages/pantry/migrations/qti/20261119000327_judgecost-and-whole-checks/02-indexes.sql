-- grizzle: no-transaction

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__count_bound_key_package_path_start_max_name_max_rfxpdaee75";

CREATE UNIQUE INDEX CONCURRENTLY "__count_bound_key_package_path_start_max_name_max_rfxpdaee75" ON "qti"."count_bound" USING btree ("package", "path", "start", "max_name", "max_written");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__count_bound_key_package_path_start_min_name_min_hq6llxrvfm";

CREATE UNIQUE INDEX CONCURRENTLY "__count_bound_key_package_path_start_min_name_min_hq6llxrvfm" ON "qti"."count_bound" USING btree ("package", "path", "start", "min_name", "min_written");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_key_package_path_start_children_ancestry_biyk2qaqax";

CREATE UNIQUE INDEX CONCURRENTLY "__node_key_package_path_start_children_ancestry_biyk2qaqax" ON "qti"."node" USING btree ("package", "path", "start", "children", "ancestry", "document_type", "governor", "kind", "nearest", "nearest_kind", "nearest_path", "parent_kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__area_mapping_ix_package_path_base_types_atzmyknytx";

CREATE INDEX CONCURRENTLY "__area_mapping_ix_package_path_base_types_atzmyknytx" ON "qti"."area_mapping" USING btree ("package", "path", "base_types");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_ix_package_document_type_kind_name_6etft6ueha";

CREATE INDEX CONCURRENTLY "__attribute_ix_package_document_type_kind_name_6etft6ueha" ON "qti"."attribute" USING btree ("package", "document_type", "kind", "name");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_ix_package_path_name_kind_2nk5lyymrg";

CREATE INDEX CONCURRENTLY "__attribute_ix_package_path_name_kind_2nk5lyymrg" ON "qti"."attribute" USING btree ("package", "path", "name", "kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_ix_package_path_start_document_type_kind_wxircjibhw";

CREATE INDEX CONCURRENTLY "__attribute_ix_package_path_start_document_type_kind_wxircjibhw" ON "qti"."attribute" USING btree ("package", "path", "start", "document_type", "kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__data_ssml_property_ix_package_path_start_member_dhbk4ax4nx";

CREATE INDEX CONCURRENTLY "__data_ssml_property_ix_package_path_start_member_dhbk4ax4nx" ON "qti"."data_ssml_property" USING btree ("package", "path", "start", "member", "name");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__document_ix_package_assembled_ha7ljzwdc5";

CREATE INDEX CONCURRENTLY "__document_ix_package_assembled_ha7ljzwdc5" ON "qti"."document" USING btree ("package", "assembled");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__expression_ix_package_path_base_type_yzedaiqawc";

CREATE INDEX CONCURRENTLY "__expression_ix_package_path_base_type_yzedaiqawc" ON "qti"."expression" USING btree ("package", "path", "base_type");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__feedback_ref_declaration_ix_package_path_base_iygriydvtu";

CREATE INDEX CONCURRENTLY "__feedback_ref_declaration_ix_package_path_base_iygriydvtu" ON "qti"."feedback_ref_declaration" USING btree ("package", "path", "base_types");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__file_ix_package_path_scope_target_3fki67lujr";

CREATE INDEX CONCURRENTLY "__file_ix_package_path_scope_target_3fki67lujr" ON "qti"."file" USING btree ("package", "path", "scope", "target");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__file_ix_package_scope_target_dcyuwggcnt";

CREATE INDEX CONCURRENTLY "__file_ix_package_scope_target_dcyuwggcnt" ON "qti"."file" USING btree ("package", "scope", "target");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__fragment_feedback_ref_declaration_ix_package_ulq6rusnbb";

CREATE INDEX CONCURRENTLY "__fragment_feedback_ref_declaration_ix_package_ulq6rusnbb" ON "qti"."fragment_feedback_ref_declaration" USING btree ("package", "assembly", "base_types");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__fragment_template_ref_declaration_ix_package_ttbnvlppo7";

CREATE INDEX CONCURRENTLY "__fragment_template_ref_declaration_ix_package_ttbnvlppo7" ON "qti"."fragment_template_ref_declaration" USING btree ("package", "assembly", "base_types");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__idref_target_ix_package_path_assembled_4j2motbov2";

CREATE INDEX CONCURRENTLY "__idref_target_ix_package_path_assembled_4j2motbov2" ON "qti"."idref_target" USING btree ("package", "path", "assembled");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__instance_ix_package_assembly_kind_xyhezipank";

CREATE INDEX CONCURRENTLY "__instance_ix_package_assembly_kind_xyhezipank" ON "qti"."instance" USING btree ("package", "assembly_kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__instance_ix_package_start_document_ywontbbqhm";

CREATE INDEX CONCURRENTLY "__instance_ix_package_start_document_ywontbbqhm" ON "qti"."instance" USING btree ("package", "start", "document");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__interaction_attribute_ix_package_path_name_kind_npebwfpfli";

CREATE INDEX CONCURRENTLY "__interaction_attribute_ix_package_path_name_kind_npebwfpfli" ON "qti"."interaction_attribute" USING btree ("package", "path", "name", "kind", "value");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_kind_parent_kind_document_type_qgxkyeiukh";

CREATE INDEX CONCURRENTLY "__node_ix_package_kind_parent_kind_document_type_qgxkyeiukh" ON "qti"."node" USING btree ("package", "kind", "parent_kind", "document_type");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_kind_start_3z6dihvx43";

CREATE INDEX CONCURRENTLY "__node_ix_package_kind_start_3z6dihvx43" ON "qti"."node" USING btree ("package", "kind", "start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_nearest_kind_m7o4twcle4";

CREATE INDEX CONCURRENTLY "__node_ix_package_nearest_kind_m7o4twcle4" ON "qti"."node" USING btree ("package", "nearest_kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_parent_bao3lpk4yp";

CREATE INDEX CONCURRENTLY "__node_ix_package_parent_bao3lpk4yp" ON "qti"."node" USING btree ("package", "parent");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_path_at_parent_rafmcwol76";

CREATE INDEX CONCURRENTLY "__node_ix_package_path_at_parent_rafmcwol76" ON "qti"."node" USING btree ("package", "path", "at", "parent");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_path_element_children_7nzzqbvcpo";

CREATE INDEX CONCURRENTLY "__node_ix_package_path_element_children_7nzzqbvcpo" ON "qti"."node" USING btree ("package", "path", "element_children");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_path_kind_parent_parent_kind_duehtvexdz";

CREATE INDEX CONCURRENTLY "__node_ix_package_path_kind_parent_parent_kind_duehtvexdz" ON "qti"."node" USING btree ("package", "path", "kind", "parent", "parent_kind", "document_type");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_path_kind_parent_kind_elements_joehbu4lt4";

CREATE INDEX CONCURRENTLY "__node_ix_package_path_kind_parent_kind_elements_joehbu4lt4" ON "qti"."node" USING btree ("package", "path", "kind", "parent_kind", "elements");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_path_parent_elements_kind_parent_gs7vwuiwx2";

CREATE INDEX CONCURRENTLY "__node_ix_package_path_parent_elements_kind_parent_gs7vwuiwx2" ON "qti"."node" USING btree ("package", "path", "parent", "elements", "kind", "parent_kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_path_parent_parent_kind_elements_t5ez2qiv7v";

CREATE INDEX CONCURRENTLY "__node_ix_package_path_parent_parent_kind_elements_t5ez2qiv7v" ON "qti"."node" USING btree ("package", "path", "parent", "parent_kind", "elements");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_path_parent_kind_kind_document_v4tfcn5dmx";

CREATE INDEX CONCURRENTLY "__node_ix_package_path_parent_kind_kind_document_v4tfcn5dmx" ON "qti"."node" USING btree ("package", "path", "parent_kind", "kind", "document_type");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__open_attribute_ix_package_path_start_kind_2umcdya4be";

CREATE INDEX CONCURRENTLY "__open_attribute_ix_package_path_start_kind_2umcdya4be" ON "qti"."open_attribute" USING btree ("package", "path", "start", "kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__pci_module_form_ix_package_path_element_oufrkv7hi7";

CREATE INDEX CONCURRENTLY "__pci_module_form_ix_package_path_element_oufrkv7hi7" ON "qti"."pci_module_form" USING btree ("package", "path", "element");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_binding_cardinality_ix_package_attribute_ijpfnthorb";

CREATE INDEX CONCURRENTLY "__placed_binding_cardinality_ix_package_attribute_ijpfnthorb" ON "qti"."placed_binding_cardinality" USING btree ("package", "attribute", "cardinality");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_binding_cardinality_ix_package_attribute_73tvrb5xkc";

CREATE INDEX CONCURRENTLY "__placed_binding_cardinality_ix_package_attribute_73tvrb5xkc" ON "qti"."placed_binding_cardinality" USING btree ("package", "attribute", "path", "start", "cardinality");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_choice_ix_package_path_start_identifier_mjcmeodoex";

CREATE INDEX CONCURRENTLY "__placed_choice_ix_package_path_start_identifier_mjcmeodoex" ON "qti"."placed_choice" USING btree ("package", "path", "start", "identifier", "assembly");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_id_ix_package_assembly_id_owner_path_h6ammusr7l";

CREATE INDEX CONCURRENTLY "__placed_id_ix_package_assembly_id_owner_path_h6ammusr7l" ON "qti"."placed_id" USING btree ("package", "assembly", "id", "owner", "path", "instance");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_share_target_ix_package_assembly_target_fpl23rvteo";

CREATE INDEX CONCURRENTLY "__placed_share_target_ix_package_assembly_target_fpl23rvteo" ON "qti"."placed_share_target" USING btree ("package", "assembly", "target_instance", "target_start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_variable_ref_ix_package_assembly_identifier_sirvvdpnbh";

CREATE INDEX CONCURRENTLY "__placed_variable_ref_ix_package_assembly_identifier_sirvvdpnbh" ON "qti"."placed_variable_ref" USING btree ("package", "assembly", "identifier");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_variable_ref_declaration_ix_package_a2444ke6rk";

CREATE INDEX CONCURRENTLY "__placed_variable_ref_declaration_ix_package_a2444ke6rk" ON "qti"."placed_variable_ref_declaration" USING btree ("package", "assembly", "attribute", "kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_variable_ref_declaration_ix_package_7mkh24nrzp";

CREATE INDEX CONCURRENTLY "__placed_variable_ref_declaration_ix_package_7mkh24nrzp" ON "qti"."placed_variable_ref_declaration" USING btree ("package", "assembly", "declaration");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_variable_ref_declaration_ix_package_path_n5gbpe2535";

CREATE INDEX CONCURRENTLY "__placed_variable_ref_declaration_ix_package_path_n5gbpe2535" ON "qti"."placed_variable_ref_declaration" USING btree ("package", "path", "start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_xml_lang_ix_package_scope_assembly_sk3xhdtnin";

CREATE INDEX CONCURRENTLY "__placed_xml_lang_ix_package_scope_assembly_sk3xhdtnin" ON "qti"."placed_xml_lang" USING btree ("package", "scope", "assembly");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__reference_path_ix_package_kind_zrl5hgf62h";

CREATE INDEX CONCURRENTLY "__reference_path_ix_package_kind_zrl5hgf62h" ON "qti"."reference_path" USING btree ("package", "kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__resource_href_ix_package_target_path_e5us4iwzgf";

CREATE INDEX CONCURRENTLY "__resource_href_ix_package_target_path_e5us4iwzgf" ON "qti"."resource_href" USING btree ("package", "target", "path");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__share_target_ix_package_path_target_start_vj2n53ubgi";

CREATE INDEX CONCURRENTLY "__share_target_ix_package_path_target_start_vj2n53ubgi" ON "qti"."share_target" USING btree ("package", "path", "target_start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__site_path_ix_package_entry_xx2txel7de";

CREATE INDEX CONCURRENTLY "__site_path_ix_package_entry_xx2txel7de" ON "qti"."site_path" USING btree ("package", "entry");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__ssml_attribute_ix_package_path_fragment_value_kind_gntxnros3z";

CREATE INDEX CONCURRENTLY "__ssml_attribute_ix_package_path_fragment_value_kind_gntxnros3z" ON "qti"."ssml_attribute" USING btree ("package", "path", "fragment", "value", "kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__ssml_attribute_ix_package_path_start_fragment_oypdwsqovg";

CREATE INDEX CONCURRENTLY "__ssml_attribute_ix_package_path_start_fragment_oypdwsqovg" ON "qti"."ssml_attribute" USING btree ("package", "path", "start", "fragment");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__template_ref_declaration_ix_package_path_base_7gpg4lskg7";

CREATE INDEX CONCURRENTLY "__template_ref_declaration_ix_package_path_base_7gpg4lskg7" ON "qti"."template_ref_declaration" USING btree ("package", "path", "base_types");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__variable_ref_ix_package_path_start_kind_cneek4rjka";

CREATE INDEX CONCURRENTLY "__variable_ref_ix_package_path_start_kind_cneek4rjka" ON "qti"."variable_ref" USING btree ("package", "path", "start", "kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__variable_ref_declaration_ix_package_path_decl_base_4gu7osen7t";

CREATE INDEX CONCURRENTLY "__variable_ref_declaration_ix_package_path_decl_base_4gu7osen7t" ON "qti"."variable_ref_declaration" USING btree ("package", "path", "decl_base_types");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__variable_ref_table_ix_package_path_table_zemw44j2nk";

CREATE INDEX CONCURRENTLY "__variable_ref_table_ix_package_path_table_zemw44j2nk" ON "qti"."variable_ref_table" USING btree ("package", "path", "table");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__xml_lang_ix_package_scope_path_hebtyuoe5n";

CREATE INDEX CONCURRENTLY "__xml_lang_ix_package_scope_path_hebtyuoe5n" ON "qti"."xml_lang" USING btree ("package", "scope", "path");
