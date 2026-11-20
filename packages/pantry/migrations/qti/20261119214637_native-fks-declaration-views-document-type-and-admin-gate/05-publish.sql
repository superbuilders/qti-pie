ALTER TABLE "qti"."cn_count" ADD CONSTRAINT "__cn_count_key_package_path_start_type_gfzp5vminc" UNIQUE USING INDEX "__cn_count_key_package_path_start_type_gfzp5vminc";

ALTER TABLE "qti"."document" ADD CONSTRAINT "__document_key_package_path_assembled_rgcicnbedu" UNIQUE USING INDEX "__document_key_package_path_assembled_rgcicnbedu";

ALTER TABLE "qti"."document" ADD CONSTRAINT "__document_key_package_path_ids_idref_targets_uarcdaz2q7" UNIQUE USING INDEX "__document_key_package_path_ids_idref_targets_uarcdaz2q7";

ALTER TABLE "qti"."document" ADD CONSTRAINT "__document_key_package_path_root_kind_nlu75ekokq" UNIQUE USING INDEX "__document_key_package_path_root_kind_nlu75ekokq";

ALTER TABLE "qti"."document" ADD CONSTRAINT "__document_key_package_path_root_kind_document_type_fbvnlbnzgb" UNIQUE USING INDEX "__document_key_package_path_root_kind_document_type_fbvnlbnzgb";

ALTER TABLE "qti"."document_id" ADD CONSTRAINT "__document_id_key_package_path_start_id_owner_lcfyvj5sku" UNIQUE USING INDEX "__document_id_key_package_path_start_id_owner_lcfyvj5sku";

ALTER TABLE "qti"."expression" ADD CONSTRAINT "__expression_key_package_path_start_base_type_z3zrneogcu" UNIQUE USING INDEX "__expression_key_package_path_start_base_type_z3zrneogcu";

ALTER TABLE "qti"."instance" ADD CONSTRAINT "__instance_key_package_assembly_start_document_go7qfh4bdy" UNIQUE USING INDEX "__instance_key_package_assembly_start_document_go7qfh4bdy";

ALTER TABLE "qti"."instance" ADD CONSTRAINT "__instance_key_package_assembly_start_document_vigbcn7gg7" UNIQUE USING INDEX "__instance_key_package_assembly_start_document_vigbcn7gg7";

ALTER TABLE "qti"."math_align_scope" ADD CONSTRAINT "__math_align_scope_key_package_path_start_cell_mgyr62ewdn" UNIQUE USING INDEX "__math_align_scope_key_package_path_start_cell_mgyr62ewdn";

ALTER TABLE "qti"."node" ADD CONSTRAINT "__node_key_package_path_start_attributes_governor_ygbuqn7z2g" UNIQUE USING INDEX "__node_key_package_path_start_attributes_governor_ygbuqn7z2g";

ALTER TABLE "qti"."node" ADD CONSTRAINT "__node_key_package_path_start_children_ancestry_mhxzt3iftx" UNIQUE USING INDEX "__node_key_package_path_start_children_ancestry_mhxzt3iftx";

ALTER TABLE "qti"."node" ADD CONSTRAINT "__node_key_package_path_start_kind_governor_42fsltrsjy" UNIQUE USING INDEX "__node_key_package_path_start_kind_governor_42fsltrsjy";

ALTER TABLE "qti"."node" ADD CONSTRAINT "__node_key_package_path_start_parent_ytuzrwhg3t" UNIQUE USING INDEX "__node_key_package_path_start_parent_ytuzrwhg3t";

ALTER TABLE "qti"."node" ADD CONSTRAINT "__node_key_package_path_start_string_value_jnzgtez4u3" UNIQUE USING INDEX "__node_key_package_path_start_string_value_jnzgtez4u3";

ALTER TABLE "qti"."normal_minimum" ADD CONSTRAINT "__normal_minimum_key_package_path_start_lexical_3iikzrqj5b" UNIQUE USING INDEX "__normal_minimum_key_package_path_start_lexical_3iikzrqj5b";

ALTER TABLE "qti"."rounding_figures" ADD CONSTRAINT "__rounding_figures_key_package_path_start_figures_2dnsrgekuj" UNIQUE USING INDEX "__rounding_figures_key_package_path_start_figures_2dnsrgekuj";

ALTER TABLE "qti"."site" ADD CONSTRAINT "__site_key_package_path_start_ancestry_kind_nearest_ap2yfi7b7f" UNIQUE USING INDEX "__site_key_package_path_start_ancestry_kind_nearest_ap2yfi7b7f";

ALTER TABLE "qti"."site" ADD CONSTRAINT "__site_key_package_path_start_kind_s6ijpbztua" UNIQUE USING INDEX "__site_key_package_path_start_kind_s6ijpbztua";

ALTER TABLE "qti"."site_path" ADD CONSTRAINT "__site_path_key_package_path_start_target_s26hafrpua" UNIQUE USING INDEX "__site_path_key_package_path_start_target_s26hafrpua";

ALTER TABLE "qti"."site_target" ADD CONSTRAINT "__site_target_key_package_path_start_parent_kind_cu6n5wnlhm" UNIQUE USING INDEX "__site_target_key_package_path_start_parent_kind_cu6n5wnlhm";

ALTER TABLE "qti"."test_document" ADD CONSTRAINT "__test_document_key_package_path_instances_sites_le7ie5jsz4" UNIQUE USING INDEX "__test_document_key_package_path_instances_sites_le7ie5jsz4";

ALTER TABLE "qti"."variable_ref" ADD CONSTRAINT "__variable_ref_key_package_path_start_attribute_unvxdwrr3e" UNIQUE USING INDEX "__variable_ref_key_package_path_start_attribute_unvxdwrr3e";

ALTER TABLE "qti"."xml_lang" ADD CONSTRAINT "__xml_lang_key_package_path_start_lang_scope_po5svm23ij" UNIQUE USING INDEX "__xml_lang_key_package_path_start_lang_scope_po5svm23ij";

ALTER TABLE "qti"."attribute" ADD CONSTRAINT "__attribute_fk_package_path_start_copy_attributes_cjh7663z47" FOREIGN KEY ("package", "path", "start", "__copy_attributes_yxabddgj5r", "governor", "kind") REFERENCES "qti"."node" ("package", "path", "start", "attributes", "governor", "kind") MATCH SIMPLE ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."catalog_id" ADD CONSTRAINT "__catalog_id_fk_package_path_start_id_owner_rx2hw6nx5f" FOREIGN KEY ("package", "path", "start", "id", "owner") REFERENCES "qti"."document_id" ("package", "path", "start", "id", "owner") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."catalog_target" ADD CONSTRAINT "__catalog_target_fk_package_path_assembled_7rzo7y6fze" FOREIGN KEY ("package", "path", "assembled") REFERENCES "qti"."document" ("package", "path", "assembled") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."cell_leaf" ADD CONSTRAINT "__cell_leaf_fk_package_path_start_cell_s2bln45e52" FOREIGN KEY ("package", "path", "start", "cell") REFERENCES "qti"."math_align_scope" ("package", "path", "start", "cell") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."element_type" ADD CONSTRAINT "__element_type_fk_package_path_start_kind_governor_uciwknlvpy" FOREIGN KEY ("package", "path", "start", "kind", "governor") REFERENCES "qti"."node" ("package", "path", "start", "kind", "governor") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."expression_attribute" ADD CONSTRAINT "__expression_attribute_fk_package_path_start_base_oi7wlemrkf" FOREIGN KEY ("package", "path", "start", "base_type") REFERENCES "qti"."expression" ("package", "path", "start", "base_type") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."fragment_scope" ADD CONSTRAINT "__fragment_scope_fk_package_assembly_instance_nkb5xn3uaf" FOREIGN KEY ("package", "assembly", "instance", "document", "assembly_kind") REFERENCES "qti"."instance" ("package", "assembly", "start", "document", "assembly_kind") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."inclusion" ADD CONSTRAINT "__inclusion_fk_package_path_start_parent_kind_places_2557ifwq63" FOREIGN KEY ("package", "path", "start", "parent_kind", "places", "root", "splices") REFERENCES "qti"."site_target" ("package", "path", "start", "parent_kind", "places", "target_root", "splices") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."instance" ADD CONSTRAINT "__instance_fk_package_document_ids_idref_targets_5z7ien5yku" FOREIGN KEY ("package", "document", "ids", "idref_targets", "choices", "hottexts") REFERENCES "qti"."document" ("package", "path", "ids", "idref_targets", "choices", "hottexts") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."instance" ADD CONSTRAINT "__instance_fk_package_document_root_kind_hgvtyahpsw" FOREIGN KEY ("package", "document", "root_kind") REFERENCES "qti"."document" ("package", "path", "root_kind") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."instance" ADD CONSTRAINT "__instance_fk_package_document_copy_instances_x7aqmllqsw" FOREIGN KEY ("package", "document", "__copy_instances_r6vg2xgb33", "children") REFERENCES "qti"."test_document" ("package", "path", "instances", "sites") MATCH SIMPLE ON UPDATE CASCADE NOT VALID;

ALTER TABLE "qti"."interaction_attribute" ADD CONSTRAINT "__interaction_attribute_fk_package_path_root_kind_ottpmnv3zo" FOREIGN KEY ("package", "path", "root_kind") REFERENCES "qti"."document" ("package", "path", "root_kind") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."label_use" ADD CONSTRAINT "__label_use_fk_package_path_root_kind_5odzayuwy3" FOREIGN KEY ("package", "path", "root_kind") REFERENCES "qti"."document" ("package", "path", "root_kind") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."literal" ADD CONSTRAINT "__literal_fk_package_path_start_base_type_j2vwpqor57" FOREIGN KEY ("package", "path", "start", "base_type") REFERENCES "qti"."expression" ("package", "path", "start", "base_type") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."mastery_floor" ADD CONSTRAINT "__mastery_floor_fk_package_path_start_normal_minimum_szr5b5iyze" FOREIGN KEY ("package", "path", "start", "normal_minimum") REFERENCES "qti"."normal_minimum" ("package", "path", "start", "lexical") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."math_align_group" ADD CONSTRAINT "__math_align_group_fk_package_path_start_cell_ygnv5pqymq" FOREIGN KEY ("package", "path", "start", "cell") REFERENCES "qti"."math_align_scope" ("package", "path", "start", "cell") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."math_cn" ADD CONSTRAINT "__math_cn_fk_package_path_start_type_gfdns3v3gm" FOREIGN KEY ("package", "path", "start", "type") REFERENCES "qti"."cn_count" ("package", "path", "start", "type") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."node" ADD CONSTRAINT "__node_fk_package_path_parent_copy_children_parent_vmpszmhgxt" FOREIGN KEY ("package", "path", "parent", "__copy_children_tityo5ij5l", "parent_ancestry", "parent_governor", "parent_kind", "parent_nearest", "parent_nearest_kind", "parent_nearest_path", "parent_parent_kind") REFERENCES "qti"."node" ("package", "path", "start", "children", "ancestry", "governor", "kind", "nearest", "nearest_kind", "nearest_path", "parent_kind") MATCH SIMPLE NOT VALID;

ALTER TABLE "qti"."placed_id" ADD CONSTRAINT "__placed_id_fk_package_path_start_id_owner_26c5kasps3" FOREIGN KEY ("package", "path", "start", "id", "owner") REFERENCES "qti"."document_id" ("package", "path", "start", "id", "owner") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."placed_math_rank" ADD CONSTRAINT "__placed_math_rank_fk_package_assembly_instance_path_ne6gauiyao" FOREIGN KEY ("package", "assembly", "instance", "path") REFERENCES "qti"."instance" ("package", "assembly", "start", "document") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."placed_share_target" ADD CONSTRAINT "__placed_share_target_fk_package_assembly_instance_o7a22jy6p7" FOREIGN KEY ("package", "assembly", "instance", "path", "assembly_kind") REFERENCES "qti"."instance" ("package", "assembly", "start", "document", "assembly_kind") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."placed_share_target" ADD CONSTRAINT "__placed_share_target_fk_package_assembly_target_or2mupqns2" FOREIGN KEY ("package", "assembly", "target_instance", "target") REFERENCES "qti"."instance" ("package", "assembly", "start", "document") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."placed_variable_ref" ADD CONSTRAINT "__placed_variable_ref_fk_package_assembly_root_kind_kyz7jvyo7u" FOREIGN KEY ("package", "assembly", "root_kind") REFERENCES "qti"."document" ("package", "path", "root_kind") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."placed_variable_ref" ADD CONSTRAINT "__placed_variable_ref_fk_package_path_start_5xoznrn7wl" FOREIGN KEY ("package", "path", "start", "attribute", "identifier", "kind") REFERENCES "qti"."variable_ref" ("package", "path", "start", "attribute", "identifier", "kind") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."placed_xml_lang" ADD CONSTRAINT "__placed_xml_lang_fk_package_path_start_lang_scope_thbyc6qfwx" FOREIGN KEY ("package", "path", "start", "lang", "scope") REFERENCES "qti"."xml_lang" ("package", "path", "start", "lang", "scope") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."resource_document" ADD CONSTRAINT "__resource_document_fk_package_path_root_kind_ejo23fxacl" FOREIGN KEY ("package", "path", "root_kind", "document_type") REFERENCES "qti"."document" ("package", "path", "root_kind", "document_type") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."rounding_mode_figures" ADD CONSTRAINT "__rounding_mode_figures_fk_package_path_start_yewsl3qtgx" FOREIGN KEY ("package", "path", "start", "figures") REFERENCES "qti"."rounding_figures" ("package", "path", "start", "figures") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."share_fragment" ADD CONSTRAINT "__share_fragment_fk_package_path_assembled_vdozoufbmn" FOREIGN KEY ("package", "path", "assembled") REFERENCES "qti"."document" ("package", "path", "assembled") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."site" ADD CONSTRAINT "__site_fk_package_path_start_children_ancestry_ghdva4523n" FOREIGN KEY ("package", "path", "start", "children", "ancestry", "governor", "kind", "nearest", "nearest_kind", "nearest_path", "parent_kind") REFERENCES "qti"."node" ("package", "path", "start", "children", "ancestry", "governor", "kind", "nearest", "nearest_kind", "nearest_path", "parent_kind") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."site" ADD CONSTRAINT "__site_fk_package_path_start_parent_ixokdifhad" FOREIGN KEY ("package", "path", "start", "parent") REFERENCES "qti"."node" ("package", "path", "start", "parent") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."site_path" ADD CONSTRAINT "__site_path_fk_package_path_start_kind_molhlyyxr4" FOREIGN KEY ("package", "path", "start", "kind") REFERENCES "qti"."site" ("package", "path", "start", "kind") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."site_target" ADD CONSTRAINT "__site_target_fk_package_path_start_ancestry_kind_lpxx2rpzvs" FOREIGN KEY ("package", "path", "start", "ancestry", "kind", "nearest", "nearest_kind", "parent_kind") REFERENCES "qti"."site" ("package", "path", "start", "ancestry", "kind", "nearest", "nearest_kind", "parent_kind") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."site_target" ADD CONSTRAINT "__site_target_fk_package_path_start_target_pozbyanaff" FOREIGN KEY ("package", "path", "start", "target") REFERENCES "qti"."site_path" ("package", "path", "start", "target") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."table_header" ADD CONSTRAINT "__table_header_fk_package_path_start_id_owner_f2pyrytcjb" FOREIGN KEY ("package", "path", "start", "id", "owner") REFERENCES "qti"."document_id" ("package", "path", "start", "id", "owner") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."usage_value" ADD CONSTRAINT "__usage_value_fk_package_path_start_text_gskextes7g" FOREIGN KEY ("package", "path", "start", "text") REFERENCES "qti"."node" ("package", "path", "start", "string_value") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."usage_value_base_type" ADD CONSTRAINT "__usage_value_base_type_fk_package_path_start_text_jwjcamzvvt" FOREIGN KEY ("package", "path", "start", "text") REFERENCES "qti"."node" ("package", "path", "start", "string_value") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."test_document" DROP CONSTRAINT "__test_document_fk_package_path_pred_names_74krpwzapf";

ALTER TABLE "qti"."template_ref_declaration" DROP CONSTRAINT "__template_ref_declaration_fk_package_path_start_wzxqjvyprs";

ALTER TABLE "qti"."printed_variable_ref_declaration" DROP CONSTRAINT "__printed_variable_ref_declaration_fk_package_path_omip4epyzh";

ALTER TABLE "qti"."open_attribute_entity" DROP CONSTRAINT "__open_attribute_entity_fk_package_path_start_uri_kgi55b7edu";

ALTER TABLE "qti"."open_attribute_entity" DROP CONSTRAINT "__open_attribute_entity_fk_package_path_start_uri_bzquqooq3s";

ALTER TABLE "qti"."open_attribute" DROP CONSTRAINT "__open_attribute_fk_package_path_start_uri_local_twjsrwvvaw";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_fk_package_path_start_pred_namespaces_hajwsxr6ys";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_fk_package_path_parent_copy_children_parent_udrokmuxvd";

ALTER TABLE "qti"."namespace" DROP CONSTRAINT "__namespace_fk_package_path_start_predecessor_tl3tmgg3ov";

ALTER TABLE "qti"."namespace" DROP CONSTRAINT "__namespace_fk_package_path_start_copy_namespaces_srp7aeg3fk";

ALTER TABLE "qti"."named" DROP CONSTRAINT "__named_fk_package_path_predecessor_names_eaolis4k6m";

ALTER TABLE "qti"."named" DROP CONSTRAINT "__named_fk_package_path_copy_names_o3lmd6xu5s";

ALTER TABLE "qti"."instance" DROP CONSTRAINT "__instance_fk_package_document_copy_instances_root_e6zn3essoh";

ALTER TABLE "qti"."fragment_template_ref_declaration" DROP CONSTRAINT "__fragment_template_ref_declaration_fk_package_p3jvanz3fl";

ALTER TABLE "qti"."fragment_printed_ref_declaration" DROP CONSTRAINT "__fragment_printed_ref_declaration_fk_package_7ipw3r3n5u";

ALTER TABLE "qti"."fragment_feedback_ref_declaration" DROP CONSTRAINT "__fragment_feedback_ref_declaration_fk_package_mibic3bfkf";

ALTER TABLE "qti"."fragment_context_ref_declaration" DROP CONSTRAINT "__fragment_context_ref_declaration_fk_package_ghow6fre6a";

ALTER TABLE "qti"."feedback_ref_declaration" DROP CONSTRAINT "__feedback_ref_declaration_fk_package_path_start_4t4r2qin7a";

ALTER TABLE "qti"."context_ref_declaration" DROP CONSTRAINT "__context_ref_declaration_fk_package_path_start_dfxvmjwwwn";

ALTER TABLE "qti"."attribute_entity" DROP CONSTRAINT "__attribute_entity_fk_package_path_start_name_h56qakk5y2";

ALTER TABLE "qti"."attribute_entity" DROP CONSTRAINT "__attribute_entity_fk_package_path_start_name_copy_j3a6umxww7";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_lexical_6ui2bppnck";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_v3d2slfl6u";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_copy_attributes_76he4zjyw7";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_name_pred_entities_3zfsp3hjsl";

ALTER TABLE "qti"."variable_ref_table" DROP CONSTRAINT "__variable_ref_table_check_variable_ref_table_in_tljkvgeb4m";

ALTER TABLE "qti"."variable_ref_declaration" DROP CONSTRAINT "__variable_ref_declaration_check_variable_ref_fdftec6y6c";

ALTER TABLE "qti"."variable_ref_declaration" DROP CONSTRAINT "template_reads";

ALTER TABLE "qti"."variable_ref_declaration" DROP CONSTRAINT "reference_type";

ALTER TABLE "qti"."variable_ref_declaration" DROP CONSTRAINT "mapped_response";

ALTER TABLE "qti"."variable_ref_declaration" DROP CONSTRAINT "e_1_derived";

ALTER TABLE "qti"."template_ref_declaration" DROP CONSTRAINT "__template_ref_declaration_check_template_ref_bwdob3csso";

ALTER TABLE "qti"."template_ref_declaration" DROP CONSTRAINT "template_reference";

ALTER TABLE "qti"."template_ref_cardinality" DROP CONSTRAINT "template_variable_type";

ALTER TABLE "qti"."printed_variable_ref_declaration" DROP CONSTRAINT "__printed_variable_ref_declaration_check_printed_tfeajmrwhk";

ALTER TABLE "qti"."printed_variable_ref_declaration" DROP CONSTRAINT "printed_variable_reference";

ALTER TABLE "qti"."placed_variable_ref_declaration" DROP CONSTRAINT "__placed_variable_ref_declaration_check_placed_kqrngn7yha";

ALTER TABLE "qti"."placed_binding_declaration" DROP CONSTRAINT "binding_declared";

ALTER TABLE "qti"."placed_binding_cardinality" DROP CONSTRAINT "binding_fit";

ALTER TABLE "qti"."placed_binding_base_type" DROP CONSTRAINT "binding_fit";

ALTER TABLE "qti"."open_attribute_entity" DROP CONSTRAINT "__open_attribute_entity_check_open_attribute_entity_pktscejv47";

ALTER TABLE "qti"."node" DROP CONSTRAINT "test_structure";

ALTER TABLE "qti"."node" DROP CONSTRAINT "bank_shape";

ALTER TABLE "qti"."namespace" DROP CONSTRAINT "__namespace_check_namespace_counted_node_namespaces_hhowaepdhi";

ALTER TABLE "qti"."named" DROP CONSTRAINT "__named_check_named_counted_test_document_names_in464hw43p";

ALTER TABLE "qti"."fragment_template_ref_declaration" DROP CONSTRAINT "__fragment_template_ref_declaration_check_fragment_qahmnzshx5";

ALTER TABLE "qti"."fragment_template_ref_declaration" DROP CONSTRAINT "template_reference";

ALTER TABLE "qti"."fragment_template_ref_cardinality" DROP CONSTRAINT "template_variable_type";

ALTER TABLE "qti"."fragment_printed_ref_declaration" DROP CONSTRAINT "__fragment_printed_ref_declaration_check_fragment_wu7g5ourt3";

ALTER TABLE "qti"."fragment_printed_ref_declaration" DROP CONSTRAINT "printed_variable_reference";

ALTER TABLE "qti"."fragment_feedback_ref_declaration" DROP CONSTRAINT "__fragment_feedback_ref_declaration_check_fragment_yr5qvq57pn";

ALTER TABLE "qti"."fragment_feedback_ref_declaration" DROP CONSTRAINT "feedback_reference";

ALTER TABLE "qti"."fragment_feedback_ref_cardinality" DROP CONSTRAINT "feedback_outcome_type";

ALTER TABLE "qti"."fragment_context_ref_declaration" DROP CONSTRAINT "__fragment_context_ref_declaration_check_fragment_zaa2qhvou7";

ALTER TABLE "qti"."fragment_context_ref_declaration" DROP CONSTRAINT "context_variable_reference";

ALTER TABLE "qti"."feedback_ref_declaration" DROP CONSTRAINT "__feedback_ref_declaration_check_feedback_ref_gbtzg2buib";

ALTER TABLE "qti"."feedback_ref_declaration" DROP CONSTRAINT "feedback_reference";

ALTER TABLE "qti"."feedback_ref_cardinality" DROP CONSTRAINT "feedback_outcome_type";

ALTER TABLE "qti"."declaration_name" DROP CONSTRAINT "reserved_type";

ALTER TABLE "qti"."declaration_identifier" DROP CONSTRAINT "reserved_type";

ALTER TABLE "qti"."context_ref_declaration" DROP CONSTRAINT "__context_ref_declaration_check_context_ref_otaik5mlhp";

ALTER TABLE "qti"."context_ref_declaration" DROP CONSTRAINT "context_variable_reference";

ALTER TABLE "qti"."binding_declaration" DROP CONSTRAINT "binding_declared";

ALTER TABLE "qti"."binding_cardinality" DROP CONSTRAINT "binding_fit";

ALTER TABLE "qti"."binding_base_type" DROP CONSTRAINT "binding_fit";

ALTER TABLE "qti"."attribute_entity" DROP CONSTRAINT "__attribute_entity_check_attribute_entity_counted_t5qyyutpjf";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "bank_shape";

ALTER TABLE "qti"."test_document" DROP CONSTRAINT "__test_document_key_package_path_names_jri7ktgibn";

ALTER TABLE "qti"."test_document" DROP CONSTRAINT "__test_document_key_package_path_instances_root_kind_3jn4tzsc5m";

ALTER TABLE "qti"."open_attribute_entity" DROP CONSTRAINT "__open_attribute_entity_key_package_path_start_uri_i5g4nstrbd";

ALTER TABLE "qti"."open_attribute_entity" DROP CONSTRAINT "__open_attribute_entity_key_package_path_start_uri_iztmkk4pbh";

ALTER TABLE "qti"."open_attribute" DROP CONSTRAINT "__open_attribute_key_package_path_start_uri_local_vrtlg65bml";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_key_package_path_start_namespaces_finvexwfpb";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_key_package_path_start_children_ancestry_biyk2qaqax";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_key_package_path_start_attributes_document_y4dmydumvt";

ALTER TABLE "qti"."namespace" DROP CONSTRAINT "__namespace_key_package_path_start_predecessor_4wxpp7cmcb";

ALTER TABLE "qti"."namespace" DROP CONSTRAINT "__namespace_key_package_path_start_index_namespaces_qdk4bkgy6z";

ALTER TABLE "qti"."named" DROP CONSTRAINT "__named_key_package_path_predecessor_names_frxormruhw";

ALTER TABLE "qti"."named" DROP CONSTRAINT "__named_key_package_path_index_names_qkf6ro4ngv";

ALTER TABLE "qti"."fragment_template_ref" DROP CONSTRAINT "__fragment_template_ref_key_package_assembly_tmwnmnmqnf";

ALTER TABLE "qti"."fragment_printed_ref" DROP CONSTRAINT "__fragment_printed_ref_key_package_assembly_instance_ssjwaisqge";

ALTER TABLE "qti"."fragment_feedback_ref" DROP CONSTRAINT "__fragment_feedback_ref_key_package_assembly_s46myaxodp";

ALTER TABLE "qti"."fragment_context_ref" DROP CONSTRAINT "__fragment_context_ref_key_package_assembly_instance_efkfr5n7hp";

ALTER TABLE "qti"."attribute_entity" DROP CONSTRAINT "__attribute_entity_key_package_path_start_name_2ecscb4n7f";

ALTER TABLE "qti"."attribute_entity" DROP CONSTRAINT "__attribute_entity_key_package_path_start_name_index_7kjw6eg6gc";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_name_entities_pmjw66bx36";

ALTER TABLE "qti"."variable_ref_declaration" DROP CONSTRAINT "__variable_ref_declaration_pk_l5cmpv5rjk";

ALTER TABLE "qti"."variable_ref_cardinality" DROP CONSTRAINT "__variable_ref_cardinality_pk_zvunrslltz";

ALTER TABLE "qti"."template_ref_declaration" DROP CONSTRAINT "__template_ref_declaration_pk_nlqz6fweny";

ALTER TABLE "qti"."template_ref_cardinality" DROP CONSTRAINT "__template_ref_cardinality_pk_unarffgw2k";

ALTER TABLE "qti"."printed_variable_ref_declaration" DROP CONSTRAINT "__printed_variable_ref_declaration_pk_y6435xmww7";

ALTER TABLE "qti"."placed_variable_ref_declaration" DROP CONSTRAINT "__placed_variable_ref_declaration_pk_uqu4c6edzi";

ALTER TABLE "qti"."placed_binding_declaration" DROP CONSTRAINT "__placed_binding_declaration_pk_55r2hs74bx";

ALTER TABLE "qti"."placed_binding_cardinality" DROP CONSTRAINT "__placed_binding_cardinality_pk_wikpzavk6e";

ALTER TABLE "qti"."placed_binding_base_type" DROP CONSTRAINT "__placed_binding_base_type_pk_zyeoiwufrb";

ALTER TABLE "qti"."fragment_template_ref_declaration" DROP CONSTRAINT "__fragment_template_ref_declaration_pk_pmz33cow6l";

ALTER TABLE "qti"."fragment_template_ref_cardinality" DROP CONSTRAINT "__fragment_template_ref_cardinality_pk_p5hrda2yix";

ALTER TABLE "qti"."fragment_printed_ref_declaration" DROP CONSTRAINT "__fragment_printed_ref_declaration_pk_hbzakluapq";

ALTER TABLE "qti"."fragment_feedback_ref_declaration" DROP CONSTRAINT "__fragment_feedback_ref_declaration_pk_v5ryj7rx7y";

ALTER TABLE "qti"."fragment_feedback_ref_cardinality" DROP CONSTRAINT "__fragment_feedback_ref_cardinality_pk_zz3mswacxo";

ALTER TABLE "qti"."fragment_context_ref_declaration" DROP CONSTRAINT "__fragment_context_ref_declaration_pk_noba5rmqqk";

ALTER TABLE "qti"."feedback_ref_declaration" DROP CONSTRAINT "__feedback_ref_declaration_pk_r3pqx7fuz7";

ALTER TABLE "qti"."feedback_ref_cardinality" DROP CONSTRAINT "__feedback_ref_cardinality_pk_t5dxhqdplw";

ALTER TABLE "qti"."declaration_name" DROP CONSTRAINT "__declaration_name_pk_dn7lm6didd";

ALTER TABLE "qti"."context_ref_declaration" DROP CONSTRAINT "__context_ref_declaration_pk_7cndy4dj3t";

ALTER TABLE "qti"."binding_declaration" DROP CONSTRAINT "__binding_declaration_pk_jvfyvs6lit";

ALTER TABLE "qti"."binding_cardinality" DROP CONSTRAINT "__binding_cardinality_pk_jfz4n3ur3j";

ALTER TABLE "qti"."binding_base_type" DROP CONSTRAINT "__binding_base_type_pk_oeeru4s2zn";

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
GRANT USAGE ON SCHEMA "qti_views" TO :"qti_queries__author";

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
REVOKE ALL ON SCHEMA "qti_views" FROM PUBLIC;

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
ALTER DEFAULT PRIVILEGES IN SCHEMA "qti_views" REVOKE ALL ON TABLES FROM PUBLIC;

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
ALTER DEFAULT PRIVILEGES IN SCHEMA "qti_views" REVOKE ALL ON SEQUENCES FROM PUBLIC;

DROP TRIGGER "__capture_update" ON "qti"."xml_decl";

DROP TRIGGER "__capture_insert" ON "qti"."xml_decl";

DROP TRIGGER "__capture_delete" ON "qti"."xml_decl";

DROP TRIGGER "__capture_update" ON "qti"."variable_ref_declaration";

DROP TRIGGER "__capture_insert" ON "qti"."variable_ref_declaration";

DROP TRIGGER "__capture_delete" ON "qti"."variable_ref_declaration";

DROP TRIGGER "__capture_update" ON "qti"."variable_ref_cardinality";

DROP TRIGGER "__capture_insert" ON "qti"."variable_ref_cardinality";

DROP TRIGGER "__capture_delete" ON "qti"."variable_ref_cardinality";

DROP TRIGGER "__capture_update" ON "qti"."text_idref";

DROP TRIGGER "__capture_insert" ON "qti"."text_idref";

DROP TRIGGER "__capture_delete" ON "qti"."text_idref";

DROP TRIGGER "__capture_update" ON "qti"."template_ref_declaration";

DROP TRIGGER "__capture_insert" ON "qti"."template_ref_declaration";

DROP TRIGGER "__capture_delete" ON "qti"."template_ref_declaration";

DROP TRIGGER "__capture_update" ON "qti"."template_ref_cardinality";

DROP TRIGGER "__capture_insert" ON "qti"."template_ref_cardinality";

DROP TRIGGER "__capture_delete" ON "qti"."template_ref_cardinality";

DROP TRIGGER "__capture_update" ON "qti"."sd_decl";

DROP TRIGGER "__capture_insert" ON "qti"."sd_decl";

DROP TRIGGER "__capture_delete" ON "qti"."sd_decl";

DROP TRIGGER "__capture_update" ON "qti"."printed_variable_ref_declaration";

DROP TRIGGER "__capture_insert" ON "qti"."printed_variable_ref_declaration";

DROP TRIGGER "__capture_delete" ON "qti"."printed_variable_ref_declaration";

DROP TRIGGER "__capture_update" ON "qti"."placed_variable_ref_declaration";

DROP TRIGGER "__capture_insert" ON "qti"."placed_variable_ref_declaration";

DROP TRIGGER "__capture_delete" ON "qti"."placed_variable_ref_declaration";

DROP TRIGGER "__capture_update" ON "qti"."placed_catalog_ref";

DROP TRIGGER "__capture_insert" ON "qti"."placed_catalog_ref";

DROP TRIGGER "__capture_delete" ON "qti"."placed_catalog_ref";

DROP TRIGGER "__capture_update" ON "qti"."placed_binding_declaration";

DROP TRIGGER "__capture_insert" ON "qti"."placed_binding_declaration";

DROP TRIGGER "__capture_delete" ON "qti"."placed_binding_declaration";

DROP TRIGGER "__capture_update" ON "qti"."placed_binding_cardinality";

DROP TRIGGER "__capture_insert" ON "qti"."placed_binding_cardinality";

DROP TRIGGER "__capture_delete" ON "qti"."placed_binding_cardinality";

DROP TRIGGER "__capture_update" ON "qti"."placed_binding_base_type";

DROP TRIGGER "__capture_insert" ON "qti"."placed_binding_base_type";

DROP TRIGGER "__capture_delete" ON "qti"."placed_binding_base_type";

DROP TRIGGER "__capture_insert" ON "qti"."math_align_group";

DROP TRIGGER "__capture_insert" ON "qti"."mastery_floor";

DROP TRIGGER "__capture_insert" ON "qti"."literal";

DROP TRIGGER "__capture_update" ON "qti"."inclusion";

DROP TRIGGER "__capture_insert" ON "qti"."inclusion";

DROP TRIGGER "__capture_delete" ON "qti"."inclusion";

DROP TRIGGER "__capture_update" ON "qti"."idref";

DROP TRIGGER "__capture_insert" ON "qti"."idref";

DROP TRIGGER "__capture_delete" ON "qti"."idref";

DROP TRIGGER "__capture_update" ON "qti"."fragment_template_ref_declaration";

DROP TRIGGER "__capture_insert" ON "qti"."fragment_template_ref_declaration";

DROP TRIGGER "__capture_delete" ON "qti"."fragment_template_ref_declaration";

DROP TRIGGER "__capture_update" ON "qti"."fragment_template_ref_cardinality";

DROP TRIGGER "__capture_insert" ON "qti"."fragment_template_ref_cardinality";

DROP TRIGGER "__capture_delete" ON "qti"."fragment_template_ref_cardinality";

DROP TRIGGER "__capture_insert" ON "qti"."fragment_scope";

DROP TRIGGER "__capture_update" ON "qti"."fragment_printed_ref_declaration";

DROP TRIGGER "__capture_insert" ON "qti"."fragment_printed_ref_declaration";

DROP TRIGGER "__capture_delete" ON "qti"."fragment_printed_ref_declaration";

DROP TRIGGER "__capture_update" ON "qti"."fragment_feedback_ref_declaration";

DROP TRIGGER "__capture_insert" ON "qti"."fragment_feedback_ref_declaration";

DROP TRIGGER "__capture_delete" ON "qti"."fragment_feedback_ref_declaration";

DROP TRIGGER "__capture_update" ON "qti"."fragment_feedback_ref_cardinality";

DROP TRIGGER "__capture_insert" ON "qti"."fragment_feedback_ref_cardinality";

DROP TRIGGER "__capture_delete" ON "qti"."fragment_feedback_ref_cardinality";

DROP TRIGGER "__capture_update" ON "qti"."fragment_context_ref_declaration";

DROP TRIGGER "__capture_insert" ON "qti"."fragment_context_ref_declaration";

DROP TRIGGER "__capture_delete" ON "qti"."fragment_context_ref_declaration";

DROP TRIGGER "__capture_update" ON "qti"."feedback_ref_declaration";

DROP TRIGGER "__capture_insert" ON "qti"."feedback_ref_declaration";

DROP TRIGGER "__capture_delete" ON "qti"."feedback_ref_declaration";

DROP TRIGGER "__capture_update" ON "qti"."feedback_ref_cardinality";

DROP TRIGGER "__capture_insert" ON "qti"."feedback_ref_cardinality";

DROP TRIGGER "__capture_delete" ON "qti"."feedback_ref_cardinality";

DROP TRIGGER "__capture_update" ON "qti"."encoding_decl";

DROP TRIGGER "__capture_insert" ON "qti"."encoding_decl";

DROP TRIGGER "__capture_delete" ON "qti"."encoding_decl";

DROP TRIGGER "__capture_insert" ON "qti"."element_type";

DROP TRIGGER "__capture_update" ON "qti"."declaration_name";

DROP TRIGGER "__capture_insert" ON "qti"."declaration_name";

DROP TRIGGER "__capture_delete" ON "qti"."declaration_name";

DROP TRIGGER "__capture_update" ON "qti"."context_ref_declaration";

DROP TRIGGER "__capture_insert" ON "qti"."context_ref_declaration";

DROP TRIGGER "__capture_delete" ON "qti"."context_ref_declaration";

DROP TRIGGER "__capture_insert" ON "qti"."catalog_id";

DROP TRIGGER "__capture_update" ON "qti"."binding_declaration";

DROP TRIGGER "__capture_insert" ON "qti"."binding_declaration";

DROP TRIGGER "__capture_delete" ON "qti"."binding_declaration";

DROP TRIGGER "__capture_update" ON "qti"."binding_cardinality";

DROP TRIGGER "__capture_insert" ON "qti"."binding_cardinality";

DROP TRIGGER "__capture_delete" ON "qti"."binding_cardinality";

DROP TRIGGER "__capture_update" ON "qti"."binding_base_type";

DROP TRIGGER "__capture_insert" ON "qti"."binding_base_type";

DROP TRIGGER "__capture_delete" ON "qti"."binding_base_type";

DROP TRIGGER "__isolation" ON "qti"."variable_ref_declaration";

DROP TRIGGER "__isolation" ON "qti"."variable_ref_cardinality";

DROP TRIGGER "__isolation" ON "qti"."template_ref_declaration";

DROP TRIGGER "__isolation" ON "qti"."template_ref_cardinality";

DROP TRIGGER "__isolation" ON "qti"."printed_variable_ref_declaration";

DROP TRIGGER "__isolation" ON "qti"."placed_variable_ref_declaration";

DROP TRIGGER "__isolation" ON "qti"."placed_binding_declaration";

DROP TRIGGER "__isolation" ON "qti"."placed_binding_cardinality";

DROP TRIGGER "__isolation" ON "qti"."placed_binding_base_type";

DROP TRIGGER "__isolation" ON "qti"."fragment_template_ref_declaration";

DROP TRIGGER "__isolation" ON "qti"."fragment_template_ref_cardinality";

DROP TRIGGER "__isolation" ON "qti"."fragment_printed_ref_declaration";

DROP TRIGGER "__isolation" ON "qti"."fragment_feedback_ref_declaration";

DROP TRIGGER "__isolation" ON "qti"."fragment_feedback_ref_cardinality";

DROP TRIGGER "__isolation" ON "qti"."fragment_context_ref_declaration";

DROP TRIGGER "__isolation" ON "qti"."feedback_ref_declaration";

DROP TRIGGER "__isolation" ON "qti"."feedback_ref_cardinality";

DROP TRIGGER "__isolation" ON "qti"."declaration_name";

DROP TRIGGER "__isolation" ON "qti"."context_ref_declaration";

DROP TRIGGER "__isolation" ON "qti"."binding_declaration";

DROP TRIGGER "__isolation" ON "qti"."binding_cardinality";

DROP TRIGGER "__isolation" ON "qti"."binding_base_type";

DROP INDEX "qti"."__xml_lang_ix_package_scope_path_hebtyuoe5n";

DROP INDEX "qti"."__variable_ref_declaration_ix_package_path_decl_base_4gu7osen7t";

DROP INDEX "qti"."__variable_ref_ix_package_path_start_kind_attribute_soxvwpwniy";

DROP INDEX "qti"."__variable_ref_ix_package_path_identifier_start_cm5zcnok6q";

DROP INDEX "qti"."__template_ref_declaration_ix_package_path_base_7gpg4lskg7";

DROP INDEX "qti"."__table_scope_ix_package_path_table_p6mmwy6mjs";

DROP INDEX "qti"."__ssml_attribute_ix_package_path_kind_start_value_nfzpoi6s66";

DROP INDEX "qti"."__ssml_attribute_ix_package_path_fragment_value_kind_gntxnros3z";

DROP INDEX "qti"."__record_field_ix_package_path_identifier_dshu5ze6f2";

DROP INDEX "qti"."__placed_xml_lang_ix_package_scope_assembly_sk3xhdtnin";

DROP INDEX "qti"."__placed_variable_ref_declaration_ix_package_path_tuyhxorydg";

DROP INDEX "qti"."__placed_variable_ref_declaration_ix_package_7mkh24nrzp";

DROP INDEX "qti"."__placed_variable_ref_declaration_ix_package_a2444ke6rk";

DROP INDEX "qti"."__placed_variable_ref_ix_package_assembly_identifier_x35b72r5wh";

DROP INDEX "qti"."__placed_math_rank_ix_package_start_path_kmbbodef77";

DROP INDEX "qti"."__placed_choice_ix_package_path_start_identifier_mjcmeodoex";

DROP INDEX "qti"."__placed_binding_cardinality_ix_package_attribute_73tvrb5xkc";

DROP INDEX "qti"."__placed_binding_cardinality_ix_package_attribute_pnvr4e3kuf";

DROP INDEX "qti"."__placed_binding_ix_package_path_start_attribute_slwylo7lfc";

DROP INDEX "qti"."__node_ix_package_path_parent_kind_kind_document_yztpammugz";

DROP INDEX "qti"."__node_ix_package_path_parent_parent_kind_elements_t5ez2qiv7v";

DROP INDEX "qti"."__node_ix_package_path_parent_elements_kind_parent_gs7vwuiwx2";

DROP INDEX "qti"."__node_ix_package_path_kind_parent_parent_kind_duehtvexdz";

DROP INDEX "qti"."__node_ix_package_path_at_parent_rafmcwol76";

DROP INDEX "qti"."__node_ix_package_parent_path_start_eqxlicox6v";

DROP INDEX "qti"."__node_ix_package_nearest_kind_path_start_ltmuyqocc3";

DROP INDEX "qti"."__node_ix_package_kind_start_path_nkmezovkhh";

DROP INDEX "qti"."__node_ix_package_kind_parent_kind_document_type_rpll2cectd";

DROP INDEX "qti"."__named_ix_package_identifier_poryqrycn2";

DROP INDEX "qti"."__fragment_template_ref_declaration_ix_package_ttbnvlppo7";

DROP INDEX "qti"."__fragment_feedback_ref_declaration_ix_package_ulq6rusnbb";

DROP INDEX "qti"."__feedback_ref_declaration_ix_package_path_base_iygriydvtu";

DROP INDEX "qti"."__dependency_ix_package_path_ref_ep76tizeax";

DROP INDEX "qti"."__choice_interaction_ix_package_interaction_dloditcwvb";

DROP INDEX "qti"."__card_support_ix_package_path_support_liwl2ctcmf";

DROP INDEX "qti"."__binding_cardinality_ix_package_attribute_4zvtryuec5";

DROP INDEX "qti"."__attribute_ix_package_path_start_document_type_kind_wxircjibhw";

DROP INDEX "qti"."__attribute_ix_package_document_type_kind_name_path_i5auyek7i3";

DROP INDEX "qti"."__attribute_ix_package_6_c_6_ld_2_byqg_path_qg_6_xupsbxacga";

DROP INDEX "qti"."__attribute_ix_package_42_uvyk_73_lq_path_krbye_343_itnlwowrai";

DROP FUNCTION "qti"."__capture_xml_decl_zmstruv6h7"() RESTRICT;

DROP FUNCTION "qti"."__capture_variable_ref_declaration_2sripmwnbi"() RESTRICT;

DROP FUNCTION "qti"."__capture_variable_ref_cardinality_e7jbndmxlq"() RESTRICT;

DROP FUNCTION "qti"."__capture_text_idref_7ya44gwlpj"() RESTRICT;

DROP FUNCTION "qti"."__capture_template_ref_declaration_hloorm3mbi"() RESTRICT;

DROP FUNCTION "qti"."__capture_template_ref_cardinality_p5ekxjpxky"() RESTRICT;

DROP FUNCTION "qti"."__capture_sd_decl_udvgc2qcdq"() RESTRICT;

DROP FUNCTION "qti"."__capture_printed_variable_ref_declaration_krv4cqx36k"() RESTRICT;

DROP FUNCTION "qti"."__capture_placed_variable_ref_declaration_nj7k4ptc2n"() RESTRICT;

DROP FUNCTION "qti"."__capture_placed_catalog_ref_daiefykipu"() RESTRICT;

DROP FUNCTION "qti"."__capture_placed_binding_declaration_vacioi7bzb"() RESTRICT;

DROP FUNCTION "qti"."__capture_placed_binding_cardinality_k6tkijwsxb"() RESTRICT;

DROP FUNCTION "qti"."__capture_placed_binding_base_type_3sxjbs5wot"() RESTRICT;

DROP FUNCTION "qti"."__capture_inclusion_56gcj75lja"() RESTRICT;

DROP FUNCTION "qti"."__capture_idref_4rhkrmfh4c"() RESTRICT;

DROP FUNCTION "qti"."__capture_fragment_template_ref_declaration_o5rl2klfp6"() RESTRICT;

DROP FUNCTION "qti"."__capture_fragment_template_ref_cardinality_vkyxkzxkxm"() RESTRICT;

DROP FUNCTION "qti"."__capture_fragment_printed_ref_declaration_5avrdfl5xm"() RESTRICT;

DROP FUNCTION "qti"."__capture_fragment_feedback_ref_declaration_sqh2l5uiwc"() RESTRICT;

DROP FUNCTION "qti"."__capture_fragment_feedback_ref_cardinality_wy4lpos45s"() RESTRICT;

DROP FUNCTION "qti"."__capture_fragment_context_ref_declaration_466md3x7aa"() RESTRICT;

DROP FUNCTION "qti"."__capture_feedback_ref_declaration_6qqtd4qsie"() RESTRICT;

DROP FUNCTION "qti"."__capture_feedback_ref_cardinality_bhulablx63"() RESTRICT;

DROP FUNCTION "qti"."__capture_encoding_decl_uvz4xrwrii"() RESTRICT;

DROP FUNCTION "qti"."__capture_declaration_name_6ibepnxyjg"() RESTRICT;

DROP FUNCTION "qti"."__capture_context_ref_declaration_zsw3valubj"() RESTRICT;

DROP FUNCTION "qti"."__capture_binding_declaration_jew3uchuwp"() RESTRICT;

DROP FUNCTION "qti"."__capture_binding_cardinality_3cjo5d2wfq"() RESTRICT;

DROP FUNCTION "qti"."__capture_binding_base_type_n376gpzlf2"() RESTRICT;

DROP FUNCTION "qti"."__judge_printed_variable_ref_3nic7wo72s"("pg_catalog"."text"[]) RESTRICT;

DROP FUNCTION "qti"."__judge_placed_catalog_ref_fxq73z2i76"("pg_catalog"."text"[]) RESTRICT;

DROP FUNCTION "qti"."__judge_fragment_printed_ref_vzjonln2xp"("pg_catalog"."text"[]) RESTRICT;

DROP FUNCTION "qti"."__judge_fragment_context_ref_5ythgx5veq"("pg_catalog"."text"[]) RESTRICT;

DROP FUNCTION "qti"."__judge_encoding_decl_kbiydf2cw3"("pg_catalog"."text"[]) RESTRICT;

DROP FUNCTION "qti"."__judge_context_ref_bm3wjv3u6q"("pg_catalog"."text"[]) RESTRICT;

DROP FUNCTION "qti"."__judge_assembled_catalog_2z6htcifcm"("pg_catalog"."text"[]) RESTRICT;

ALTER TABLE "qti"."test_document" DROP COLUMN "__pred_names_bbnnt7wrn7";

ALTER TABLE "qti"."open_attribute_entity" DROP COLUMN "__predecessor_entities_74a6fuyhxk";

ALTER TABLE "qti"."open_attribute_entity" DROP COLUMN "__index_entities_44xfk3d5zn";

ALTER TABLE "qti"."open_attribute_entity" DROP COLUMN "__copy_entities_jslyserrum";

ALTER TABLE "qti"."open_attribute" DROP COLUMN "__pred_entities_nvm5iwtucq";

ALTER TABLE "qti"."node" DROP COLUMN "__pred_namespaces_feftb6bqtj";

ALTER TABLE "qti"."namespace" DROP COLUMN "__predecessor_namespaces_ryieegvbm3";

ALTER TABLE "qti"."namespace" DROP COLUMN "__index_namespaces_z7gs3muwau";

ALTER TABLE "qti"."namespace" DROP COLUMN "__copy_namespaces_u4sj3oyus6";

ALTER TABLE "qti"."named" DROP COLUMN "__predecessor_names_y7v4c6w4yg";

ALTER TABLE "qti"."named" DROP COLUMN "__index_names_rmjcupkvtp";

ALTER TABLE "qti"."named" DROP COLUMN "__copy_names_h4cv4lntw6";

ALTER TABLE "qti"."attribute_entity" DROP COLUMN "__predecessor_entities_sojikyeccm";

ALTER TABLE "qti"."attribute_entity" DROP COLUMN "__index_entities_53p25xpy2i";

ALTER TABLE "qti"."attribute_entity" DROP COLUMN "__copy_entities_lhqfioejni";

ALTER TABLE "qti"."attribute" DROP COLUMN "__pred_entities_nvm5iwtucq";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_poeznhy35n";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_d4ovnh4jes";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_qg6uhkfzwt";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_krbye343sj";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_6c6ld2byqg";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_42uvyk73lq";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_xzr3nwawbz";

ALTER TABLE "qti"."variable_ref_table" DROP COLUMN "declaration";

ALTER TABLE "qti"."variable_ref_table" DROP COLUMN "kind";

ALTER TABLE "qti"."test_document" DROP COLUMN "names";

ALTER TABLE "qti"."test_document" DROP COLUMN "root_kind";

ALTER TABLE "qti"."site" DROP COLUMN "document_type";

ALTER TABLE "qti"."open_attribute" DROP COLUMN "entities";

ALTER TABLE "qti"."node" DROP COLUMN "document_type";

ALTER TABLE "qti"."node" DROP COLUMN "namespaces";

ALTER TABLE "qti"."declaration_identifier" DROP COLUMN "base_types";

ALTER TABLE "qti"."declaration_identifier" DROP COLUMN "cardinalities";

ALTER TABLE "qti"."declaration_identifier" DROP COLUMN "declaration_kind";

ALTER TABLE "qti"."declaration" DROP COLUMN "declaration_kind";

ALTER TABLE "qti"."attribute" DROP COLUMN "document_type";

ALTER TABLE "qti"."attribute" DROP COLUMN "entities";

DROP TABLE "qti"."variable_ref_declaration";

DROP TABLE "qti"."variable_ref_cardinality";

DROP TABLE "qti"."template_ref_declaration";

DROP TABLE "qti"."template_ref_cardinality";

DROP TABLE "qti"."printed_variable_ref_declaration";

DROP TABLE "qti"."placed_variable_ref_declaration";

DROP TABLE "qti"."placed_binding_declaration";

DROP TABLE "qti"."placed_binding_cardinality";

DROP TABLE "qti"."placed_binding_base_type";

DROP TABLE "qti"."fragment_template_ref_declaration";

DROP TABLE "qti"."fragment_template_ref_cardinality";

DROP TABLE "qti"."fragment_printed_ref_declaration";

DROP TABLE "qti"."fragment_feedback_ref_declaration";

DROP TABLE "qti"."fragment_feedback_ref_cardinality";

DROP TABLE "qti"."fragment_context_ref_declaration";

DROP TABLE "qti"."feedback_ref_declaration";

DROP TABLE "qti"."feedback_ref_cardinality";

DROP TABLE "qti"."declaration_name";

DROP TABLE "qti"."context_ref_declaration";

DROP TABLE "qti"."binding_declaration";

DROP TABLE "qti"."binding_cardinality";

DROP TABLE "qti"."binding_base_type";

COMMENT ON CONSTRAINT "__cn_count_key_package_path_start_type_gfzp5vminc" ON "qti"."cn_count" IS 'key CnCount(package, path, start, type)';

COMMENT ON CONSTRAINT "__document_key_package_path_assembled_rgcicnbedu" ON "qti"."document" IS 'key Document(package, path, assembled)';

COMMENT ON CONSTRAINT "__document_key_package_path_ids_idref_targets_uarcdaz2q7" ON "qti"."document" IS 'key Document(package, path, ids, idrefTargets, choices, hottexts)';

COMMENT ON CONSTRAINT "__document_key_package_path_root_kind_nlu75ekokq" ON "qti"."document" IS 'key Document(package, path, rootKind)';

COMMENT ON CONSTRAINT "__document_key_package_path_root_kind_document_type_fbvnlbnzgb" ON "qti"."document" IS 'key Document(package, path, rootKind, documentType)';

COMMENT ON CONSTRAINT "__document_id_key_package_path_start_id_owner_lcfyvj5sku" ON "qti"."document_id" IS 'key DocumentId(package, path, start, id, owner)';

COMMENT ON CONSTRAINT "__expression_key_package_path_start_base_type_z3zrneogcu" ON "qti"."expression" IS 'key Expression(package, path, start, baseType)';

COMMENT ON CONSTRAINT "__instance_key_package_assembly_start_document_vigbcn7gg7" ON "qti"."instance" IS 'key Instance(package, assembly, start, document, assemblyKind)';

COMMENT ON CONSTRAINT "__instance_key_package_assembly_start_document_go7qfh4bdy" ON "qti"."instance" IS 'key Instance(package, assembly, start, document)';

COMMENT ON CONSTRAINT "__math_align_scope_key_package_path_start_cell_mgyr62ewdn" ON "qti"."math_align_scope" IS 'key MathAlignScope(package, path, start, cell)';

COMMENT ON CONSTRAINT "__node_key_package_path_start_attributes_governor_ygbuqn7z2g" ON "qti"."node" IS 'key Node(package, path, start, attributes, governor, kind)';

COMMENT ON CONSTRAINT "__node_key_package_path_start_kind_governor_42fsltrsjy" ON "qti"."node" IS 'key Node(package, path, start, kind, governor)';

COMMENT ON CONSTRAINT "__node_key_package_path_start_children_ancestry_mhxzt3iftx" ON "qti"."node" IS 'key Node(package, path, start, children, ancestry, governor, kind, nearest, nearestKind, nearestPath, parentKind)';

COMMENT ON CONSTRAINT "__node_key_package_path_start_parent_ytuzrwhg3t" ON "qti"."node" IS 'key Node(package, path, start, parent)';

COMMENT ON CONSTRAINT "__node_key_package_path_start_string_value_jnzgtez4u3" ON "qti"."node" IS 'key Node(package, path, start, stringValue)';

COMMENT ON CONSTRAINT "__normal_minimum_key_package_path_start_lexical_3iikzrqj5b" ON "qti"."normal_minimum" IS 'key NormalMinimum(package, path, start, lexical)';

COMMENT ON CONSTRAINT "__rounding_figures_key_package_path_start_figures_2dnsrgekuj" ON "qti"."rounding_figures" IS 'key RoundingFigures(package, path, start, figures)';

COMMENT ON CONSTRAINT "__site_key_package_path_start_kind_s6ijpbztua" ON "qti"."site" IS 'key Site(package, path, start, kind)';

COMMENT ON CONSTRAINT "__site_key_package_path_start_ancestry_kind_nearest_ap2yfi7b7f" ON "qti"."site" IS 'key Site(package, path, start, ancestry, kind, nearest, nearestKind, parentKind)';

COMMENT ON CONSTRAINT "__site_path_key_package_path_start_target_s26hafrpua" ON "qti"."site_path" IS 'key SitePath(package, path, start, target)';

COMMENT ON CONSTRAINT "__site_target_key_package_path_start_parent_kind_cu6n5wnlhm" ON "qti"."site_target" IS 'key SiteTarget(package, path, start, parentKind, places, targetRoot, splices)';

COMMENT ON CONSTRAINT "__test_document_key_package_path_instances_sites_le7ie5jsz4" ON "qti"."test_document" IS 'key TestDocument(package, path, instances, sites)';

COMMENT ON CONSTRAINT "__variable_ref_key_package_path_start_attribute_unvxdwrr3e" ON "qti"."variable_ref" IS 'key VariableRef(package, path, start, attribute, identifier, kind)';

COMMENT ON CONSTRAINT "__xml_lang_key_package_path_start_lang_scope_po5svm23ij" ON "qti"."xml_lang" IS 'key XmlLang(package, path, start, lang, scope)';

COMMENT ON COLUMN "qti"."attribute"."__lexical_5jffbis46p" IS 'lexical where {"args":[{"field":"lexical","kind":"field"},{"kind":"literal","value":"^[\\t\\n\\r ]*(?:[A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u0131\\u0134-\\u013E\\u0141-\\u0148\\u014A-\\u017E\\u0180-\\u01C3\\u01CD-\\u01F0\\u01F4\\u01F5\\u01FA-\\u0217\\u0250-\\u02A8\\u02BB-\\u02C1\\u0386\\u0388-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03CE\\u03D0-\\u03D6\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2-\\u03F3\\u0401-\\u040C\\u040E-\\u044F\\u0451-\\u045C\\u045E-\\u0481\\u0490-\\u04C4\\u04C7\\u04C8\\u04CB\\u04CC\\u04D0-\\u04EB\\u04EE-\\u04F5\\u04F8\\u04F9\\u0531-\\u0556\\u0559\\u0561-\\u0586\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u063A\\u0641-\\u064A\\u0671-\\u06B7\\u06BA-\\u06BE\\u06C0-\\u06CE\\u06D0-\\u06D3\\u06D5\\u06E5\\u06E6\\u0905-\\u0939\\u093D\\u0958-\\u0961\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09DC\\u09DD\\u09DF-\\u09E1\\u09F0\\u09F1\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74\\u0A85-\\u0A8B\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AE0\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B36-\\u0B39\\u0B3D\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB5\\u0BB7-\\u0BB9\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C60\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CDE\\u0CE0\\u0CE1\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D60\\u0D61\\u0E01-\\u0E2E\\u0E30\\u0E32\\u0E33\\u0E40-\\u0E45\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD\\u0EAE\\u0EB0\\u0EB2\\u0EB3\\u0EBD\\u0EC0-\\u0EC4\\u0F40-\\u0F47\\u0F49-\\u0F69\\u10A0-\\u10C5\\u10D0-\\u10F6\\u1100\\u1102\\u1103\\u1105-\\u1107\\u1109\\u110B\\u110C\\u110E-\\u1112\\u113C\\u113E\\u1140\\u114C\\u114E\\u1150\\u1154\\u1155\\u1159\\u115F-\\u1161\\u1163\\u1165\\u1167\\u1169\\u116D\\u116E\\u1172\\u1173\\u1175\\u119E\\u11A8\\u11AB\\u11AE\\u11AF\\u11B7\\u11B8\\u11BA\\u11BC-\\u11C2\\u11EB\\u11F0\\u11F9\\u1E00-\\u1E9B\\u1EA0-\\u1EF9\\u1F00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u2126\\u212A\\u212B\\u212E\\u2180-\\u2182\\u3007\\u3021-\\u3029\\u3041-\\u3094\\u30A1-\\u30FA\\u3105-\\u312C\\u4E00-\\u9FA5\\uAC00-\\uD7A3][\\-.0-9A-Z_a-z\\u00B7\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u0131\\u0134-\\u013E\\u0141-\\u0148\\u014A-\\u017E\\u0180-\\u01C3\\u01CD-\\u01F0\\u01F4\\u01F5\\u01FA-\\u0217\\u0250-\\u02A8\\u02BB-\\u02C1\\u02D0\\u02D1\\u0300-\\u0345\\u0360\\u0361\\u0386-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03CE\\u03D0-\\u03D6\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2-\\u03F3\\u0401-\\u040C\\u040E-\\u044F\\u0451-\\u045C\\u045E-\\u0481\\u0483-\\u0486\\u0490-\\u04C4\\u04C7\\u04C8\\u04CB\\u04CC\\u04D0-\\u04EB\\u04EE-\\u04F5\\u04F8\\u04F9\\u0531-\\u0556\\u0559\\u0561-\\u0586\\u0591-\\u05A1\\u05A3-\\u05B9\\u05BB-\\u05BD\\u05BF\\u05C1\\u05C2\\u05C4\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u063A\\u0640-\\u0652\\u0660-\\u0669\\u0670-\\u06B7\\u06BA-\\u06BE\\u06C0-\\u06CE\\u06D0-\\u06D3\\u06D5-\\u06E8\\u06EA-\\u06ED\\u06F0-\\u06F9\\u0901-\\u0903\\u0905-\\u0939\\u093C-\\u094D\\u0951-\\u0954\\u0958-\\u0963\\u0966-\\u096F\\u0981-\\u0983\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BC\\u09BE-\\u09C4\\u09C7\\u09C8\\u09CB-\\u09CD\\u09D7\\u09DC\\u09DD\\u09DF-\\u09E3\\u09E6-\\u09F1\\u0A02\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A3C\\u0A3E-\\u0A42\\u0A47\\u0A48\\u0A4B-\\u0A4D\\u0A59-\\u0A5C\\u0A5E\\u0A66-\\u0A74\\u0A81-\\u0A83\\u0A85-\\u0A8B\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABC-\\u0AC5\\u0AC7-\\u0AC9\\u0ACB-\\u0ACD\\u0AE0\\u0AE6-\\u0AEF\\u0B01-\\u0B03\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B36-\\u0B39\\u0B3C-\\u0B43\\u0B47\\u0B48\\u0B4B-\\u0B4D\\u0B56\\u0B57\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B66-\\u0B6F\\u0B82\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB5\\u0BB7-\\u0BB9\\u0BBE-\\u0BC2\\u0BC6-\\u0BC8\\u0BCA-\\u0BCD\\u0BD7\\u0BE7-\\u0BEF\\u0C01-\\u0C03\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3E-\\u0C44\\u0C46-\\u0C48\\u0C4A-\\u0C4D\\u0C55\\u0C56\\u0C60\\u0C61\\u0C66-\\u0C6F\\u0C82\\u0C83\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBE-\\u0CC4\\u0CC6-\\u0CC8\\u0CCA-\\u0CCD\\u0CD5\\u0CD6\\u0CDE\\u0CE0\\u0CE1\\u0CE6-\\u0CEF\\u0D02\\u0D03\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D3E-\\u0D43\\u0D46-\\u0D48\\u0D4A-\\u0D4D\\u0D57\\u0D60\\u0D61\\u0D66-\\u0D6F\\u0E01-\\u0E2E\\u0E30-\\u0E3A\\u0E40-\\u0E4E\\u0E50-\\u0E59\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD\\u0EAE\\u0EB0-\\u0EB9\\u0EBB-\\u0EBD\\u0EC0-\\u0EC4\\u0EC6\\u0EC8-\\u0ECD\\u0ED0-\\u0ED9\\u0F18\\u0F19\\u0F20-\\u0F29\\u0F35\\u0F37\\u0F39\\u0F3E-\\u0F47\\u0F49-\\u0F69\\u0F71-\\u0F84\\u0F86-\\u0F8B\\u0F90-\\u0F95\\u0F97\\u0F99-\\u0FAD\\u0FB1-\\u0FB7\\u0FB9\\u10A0-\\u10C5\\u10D0-\\u10F6\\u1100\\u1102\\u1103\\u1105-\\u1107\\u1109\\u110B\\u110C\\u110E-\\u1112\\u113C\\u113E\\u1140\\u114C\\u114E\\u1150\\u1154\\u1155\\u1159\\u115F-\\u1161\\u1163\\u1165\\u1167\\u1169\\u116D\\u116E\\u1172\\u1173\\u1175\\u119E\\u11A8\\u11AB\\u11AE\\u11AF\\u11B7\\u11B8\\u11BA\\u11BC-\\u11C2\\u11EB\\u11F0\\u11F9\\u1E00-\\u1E9B\\u1EA0-\\u1EF9\\u1F00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u20D0-\\u20DC\\u20E1\\u2126\\u212A\\u212B\\u212E\\u2180-\\u2182\\u3005\\u3007\\u3021-\\u302F\\u3031-\\u3035\\u3041-\\u3094\\u3099\\u309A\\u309D\\u309E\\u30A1-\\u30FA\\u30FC-\\u30FE\\u3105-\\u312C\\u4E00-\\u9FA5\\uAC00-\\uD7A3]*)[\\t\\n\\r ]*$"}],"fn":"matches","kind":"compute"} and {"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"cp:dependency"}} and {"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"identifierref"}} and {"kind":"compare","left":{"field":"path","kind":"field"},"op":"eq","right":{"kind":"literal","value":"imsmanifest.xml"}}';

COMMENT ON COLUMN "qti"."attribute"."__package_cl3pk5vj2u" IS 'package where {"args":[{"field":"lexical","kind":"field"},{"kind":"literal","value":"^[\\t\\n\\r ]*(?:[A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u0131\\u0134-\\u013E\\u0141-\\u0148\\u014A-\\u017E\\u0180-\\u01C3\\u01CD-\\u01F0\\u01F4\\u01F5\\u01FA-\\u0217\\u0250-\\u02A8\\u02BB-\\u02C1\\u0386\\u0388-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03CE\\u03D0-\\u03D6\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2-\\u03F3\\u0401-\\u040C\\u040E-\\u044F\\u0451-\\u045C\\u045E-\\u0481\\u0490-\\u04C4\\u04C7\\u04C8\\u04CB\\u04CC\\u04D0-\\u04EB\\u04EE-\\u04F5\\u04F8\\u04F9\\u0531-\\u0556\\u0559\\u0561-\\u0586\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u063A\\u0641-\\u064A\\u0671-\\u06B7\\u06BA-\\u06BE\\u06C0-\\u06CE\\u06D0-\\u06D3\\u06D5\\u06E5\\u06E6\\u0905-\\u0939\\u093D\\u0958-\\u0961\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09DC\\u09DD\\u09DF-\\u09E1\\u09F0\\u09F1\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74\\u0A85-\\u0A8B\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AE0\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B36-\\u0B39\\u0B3D\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB5\\u0BB7-\\u0BB9\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C60\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CDE\\u0CE0\\u0CE1\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D60\\u0D61\\u0E01-\\u0E2E\\u0E30\\u0E32\\u0E33\\u0E40-\\u0E45\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD\\u0EAE\\u0EB0\\u0EB2\\u0EB3\\u0EBD\\u0EC0-\\u0EC4\\u0F40-\\u0F47\\u0F49-\\u0F69\\u10A0-\\u10C5\\u10D0-\\u10F6\\u1100\\u1102\\u1103\\u1105-\\u1107\\u1109\\u110B\\u110C\\u110E-\\u1112\\u113C\\u113E\\u1140\\u114C\\u114E\\u1150\\u1154\\u1155\\u1159\\u115F-\\u1161\\u1163\\u1165\\u1167\\u1169\\u116D\\u116E\\u1172\\u1173\\u1175\\u119E\\u11A8\\u11AB\\u11AE\\u11AF\\u11B7\\u11B8\\u11BA\\u11BC-\\u11C2\\u11EB\\u11F0\\u11F9\\u1E00-\\u1E9B\\u1EA0-\\u1EF9\\u1F00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u2126\\u212A\\u212B\\u212E\\u2180-\\u2182\\u3007\\u3021-\\u3029\\u3041-\\u3094\\u30A1-\\u30FA\\u3105-\\u312C\\u4E00-\\u9FA5\\uAC00-\\uD7A3][\\-.0-9A-Z_a-z\\u00B7\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u0131\\u0134-\\u013E\\u0141-\\u0148\\u014A-\\u017E\\u0180-\\u01C3\\u01CD-\\u01F0\\u01F4\\u01F5\\u01FA-\\u0217\\u0250-\\u02A8\\u02BB-\\u02C1\\u02D0\\u02D1\\u0300-\\u0345\\u0360\\u0361\\u0386-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03CE\\u03D0-\\u03D6\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2-\\u03F3\\u0401-\\u040C\\u040E-\\u044F\\u0451-\\u045C\\u045E-\\u0481\\u0483-\\u0486\\u0490-\\u04C4\\u04C7\\u04C8\\u04CB\\u04CC\\u04D0-\\u04EB\\u04EE-\\u04F5\\u04F8\\u04F9\\u0531-\\u0556\\u0559\\u0561-\\u0586\\u0591-\\u05A1\\u05A3-\\u05B9\\u05BB-\\u05BD\\u05BF\\u05C1\\u05C2\\u05C4\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u063A\\u0640-\\u0652\\u0660-\\u0669\\u0670-\\u06B7\\u06BA-\\u06BE\\u06C0-\\u06CE\\u06D0-\\u06D3\\u06D5-\\u06E8\\u06EA-\\u06ED\\u06F0-\\u06F9\\u0901-\\u0903\\u0905-\\u0939\\u093C-\\u094D\\u0951-\\u0954\\u0958-\\u0963\\u0966-\\u096F\\u0981-\\u0983\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BC\\u09BE-\\u09C4\\u09C7\\u09C8\\u09CB-\\u09CD\\u09D7\\u09DC\\u09DD\\u09DF-\\u09E3\\u09E6-\\u09F1\\u0A02\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A3C\\u0A3E-\\u0A42\\u0A47\\u0A48\\u0A4B-\\u0A4D\\u0A59-\\u0A5C\\u0A5E\\u0A66-\\u0A74\\u0A81-\\u0A83\\u0A85-\\u0A8B\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABC-\\u0AC5\\u0AC7-\\u0AC9\\u0ACB-\\u0ACD\\u0AE0\\u0AE6-\\u0AEF\\u0B01-\\u0B03\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B36-\\u0B39\\u0B3C-\\u0B43\\u0B47\\u0B48\\u0B4B-\\u0B4D\\u0B56\\u0B57\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B66-\\u0B6F\\u0B82\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB5\\u0BB7-\\u0BB9\\u0BBE-\\u0BC2\\u0BC6-\\u0BC8\\u0BCA-\\u0BCD\\u0BD7\\u0BE7-\\u0BEF\\u0C01-\\u0C03\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3E-\\u0C44\\u0C46-\\u0C48\\u0C4A-\\u0C4D\\u0C55\\u0C56\\u0C60\\u0C61\\u0C66-\\u0C6F\\u0C82\\u0C83\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBE-\\u0CC4\\u0CC6-\\u0CC8\\u0CCA-\\u0CCD\\u0CD5\\u0CD6\\u0CDE\\u0CE0\\u0CE1\\u0CE6-\\u0CEF\\u0D02\\u0D03\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D3E-\\u0D43\\u0D46-\\u0D48\\u0D4A-\\u0D4D\\u0D57\\u0D60\\u0D61\\u0D66-\\u0D6F\\u0E01-\\u0E2E\\u0E30-\\u0E3A\\u0E40-\\u0E4E\\u0E50-\\u0E59\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD\\u0EAE\\u0EB0-\\u0EB9\\u0EBB-\\u0EBD\\u0EC0-\\u0EC4\\u0EC6\\u0EC8-\\u0ECD\\u0ED0-\\u0ED9\\u0F18\\u0F19\\u0F20-\\u0F29\\u0F35\\u0F37\\u0F39\\u0F3E-\\u0F47\\u0F49-\\u0F69\\u0F71-\\u0F84\\u0F86-\\u0F8B\\u0F90-\\u0F95\\u0F97\\u0F99-\\u0FAD\\u0FB1-\\u0FB7\\u0FB9\\u10A0-\\u10C5\\u10D0-\\u10F6\\u1100\\u1102\\u1103\\u1105-\\u1107\\u1109\\u110B\\u110C\\u110E-\\u1112\\u113C\\u113E\\u1140\\u114C\\u114E\\u1150\\u1154\\u1155\\u1159\\u115F-\\u1161\\u1163\\u1165\\u1167\\u1169\\u116D\\u116E\\u1172\\u1173\\u1175\\u119E\\u11A8\\u11AB\\u11AE\\u11AF\\u11B7\\u11B8\\u11BA\\u11BC-\\u11C2\\u11EB\\u11F0\\u11F9\\u1E00-\\u1E9B\\u1EA0-\\u1EF9\\u1F00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u20D0-\\u20DC\\u20E1\\u2126\\u212A\\u212B\\u212E\\u2180-\\u2182\\u3005\\u3007\\u3021-\\u302F\\u3031-\\u3035\\u3041-\\u3094\\u3099\\u309A\\u309D\\u309E\\u30A1-\\u30FA\\u30FC-\\u30FE\\u3105-\\u312C\\u4E00-\\u9FA5\\uAC00-\\uD7A3]*)[\\t\\n\\r ]*$"}],"fn":"matches","kind":"compute"} and {"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"cp:dependency"}} and {"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"identifierref"}} and {"kind":"compare","left":{"field":"path","kind":"field"},"op":"eq","right":{"kind":"literal","value":"imsmanifest.xml"}}';

COMMENT ON COLUMN "qti"."attribute"."__path_ohpc6sozn2" IS 'path where {"args":[{"field":"lexical","kind":"field"},{"kind":"literal","value":"^[\\t\\n\\r ]*(?:[A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u0131\\u0134-\\u013E\\u0141-\\u0148\\u014A-\\u017E\\u0180-\\u01C3\\u01CD-\\u01F0\\u01F4\\u01F5\\u01FA-\\u0217\\u0250-\\u02A8\\u02BB-\\u02C1\\u0386\\u0388-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03CE\\u03D0-\\u03D6\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2-\\u03F3\\u0401-\\u040C\\u040E-\\u044F\\u0451-\\u045C\\u045E-\\u0481\\u0490-\\u04C4\\u04C7\\u04C8\\u04CB\\u04CC\\u04D0-\\u04EB\\u04EE-\\u04F5\\u04F8\\u04F9\\u0531-\\u0556\\u0559\\u0561-\\u0586\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u063A\\u0641-\\u064A\\u0671-\\u06B7\\u06BA-\\u06BE\\u06C0-\\u06CE\\u06D0-\\u06D3\\u06D5\\u06E5\\u06E6\\u0905-\\u0939\\u093D\\u0958-\\u0961\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09DC\\u09DD\\u09DF-\\u09E1\\u09F0\\u09F1\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74\\u0A85-\\u0A8B\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AE0\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B36-\\u0B39\\u0B3D\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB5\\u0BB7-\\u0BB9\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C60\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CDE\\u0CE0\\u0CE1\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D60\\u0D61\\u0E01-\\u0E2E\\u0E30\\u0E32\\u0E33\\u0E40-\\u0E45\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD\\u0EAE\\u0EB0\\u0EB2\\u0EB3\\u0EBD\\u0EC0-\\u0EC4\\u0F40-\\u0F47\\u0F49-\\u0F69\\u10A0-\\u10C5\\u10D0-\\u10F6\\u1100\\u1102\\u1103\\u1105-\\u1107\\u1109\\u110B\\u110C\\u110E-\\u1112\\u113C\\u113E\\u1140\\u114C\\u114E\\u1150\\u1154\\u1155\\u1159\\u115F-\\u1161\\u1163\\u1165\\u1167\\u1169\\u116D\\u116E\\u1172\\u1173\\u1175\\u119E\\u11A8\\u11AB\\u11AE\\u11AF\\u11B7\\u11B8\\u11BA\\u11BC-\\u11C2\\u11EB\\u11F0\\u11F9\\u1E00-\\u1E9B\\u1EA0-\\u1EF9\\u1F00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u2126\\u212A\\u212B\\u212E\\u2180-\\u2182\\u3007\\u3021-\\u3029\\u3041-\\u3094\\u30A1-\\u30FA\\u3105-\\u312C\\u4E00-\\u9FA5\\uAC00-\\uD7A3][\\-.0-9A-Z_a-z\\u00B7\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u0131\\u0134-\\u013E\\u0141-\\u0148\\u014A-\\u017E\\u0180-\\u01C3\\u01CD-\\u01F0\\u01F4\\u01F5\\u01FA-\\u0217\\u0250-\\u02A8\\u02BB-\\u02C1\\u02D0\\u02D1\\u0300-\\u0345\\u0360\\u0361\\u0386-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03CE\\u03D0-\\u03D6\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2-\\u03F3\\u0401-\\u040C\\u040E-\\u044F\\u0451-\\u045C\\u045E-\\u0481\\u0483-\\u0486\\u0490-\\u04C4\\u04C7\\u04C8\\u04CB\\u04CC\\u04D0-\\u04EB\\u04EE-\\u04F5\\u04F8\\u04F9\\u0531-\\u0556\\u0559\\u0561-\\u0586\\u0591-\\u05A1\\u05A3-\\u05B9\\u05BB-\\u05BD\\u05BF\\u05C1\\u05C2\\u05C4\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u063A\\u0640-\\u0652\\u0660-\\u0669\\u0670-\\u06B7\\u06BA-\\u06BE\\u06C0-\\u06CE\\u06D0-\\u06D3\\u06D5-\\u06E8\\u06EA-\\u06ED\\u06F0-\\u06F9\\u0901-\\u0903\\u0905-\\u0939\\u093C-\\u094D\\u0951-\\u0954\\u0958-\\u0963\\u0966-\\u096F\\u0981-\\u0983\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BC\\u09BE-\\u09C4\\u09C7\\u09C8\\u09CB-\\u09CD\\u09D7\\u09DC\\u09DD\\u09DF-\\u09E3\\u09E6-\\u09F1\\u0A02\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A3C\\u0A3E-\\u0A42\\u0A47\\u0A48\\u0A4B-\\u0A4D\\u0A59-\\u0A5C\\u0A5E\\u0A66-\\u0A74\\u0A81-\\u0A83\\u0A85-\\u0A8B\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABC-\\u0AC5\\u0AC7-\\u0AC9\\u0ACB-\\u0ACD\\u0AE0\\u0AE6-\\u0AEF\\u0B01-\\u0B03\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B36-\\u0B39\\u0B3C-\\u0B43\\u0B47\\u0B48\\u0B4B-\\u0B4D\\u0B56\\u0B57\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B66-\\u0B6F\\u0B82\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB5\\u0BB7-\\u0BB9\\u0BBE-\\u0BC2\\u0BC6-\\u0BC8\\u0BCA-\\u0BCD\\u0BD7\\u0BE7-\\u0BEF\\u0C01-\\u0C03\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3E-\\u0C44\\u0C46-\\u0C48\\u0C4A-\\u0C4D\\u0C55\\u0C56\\u0C60\\u0C61\\u0C66-\\u0C6F\\u0C82\\u0C83\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBE-\\u0CC4\\u0CC6-\\u0CC8\\u0CCA-\\u0CCD\\u0CD5\\u0CD6\\u0CDE\\u0CE0\\u0CE1\\u0CE6-\\u0CEF\\u0D02\\u0D03\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D3E-\\u0D43\\u0D46-\\u0D48\\u0D4A-\\u0D4D\\u0D57\\u0D60\\u0D61\\u0D66-\\u0D6F\\u0E01-\\u0E2E\\u0E30-\\u0E3A\\u0E40-\\u0E4E\\u0E50-\\u0E59\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD\\u0EAE\\u0EB0-\\u0EB9\\u0EBB-\\u0EBD\\u0EC0-\\u0EC4\\u0EC6\\u0EC8-\\u0ECD\\u0ED0-\\u0ED9\\u0F18\\u0F19\\u0F20-\\u0F29\\u0F35\\u0F37\\u0F39\\u0F3E-\\u0F47\\u0F49-\\u0F69\\u0F71-\\u0F84\\u0F86-\\u0F8B\\u0F90-\\u0F95\\u0F97\\u0F99-\\u0FAD\\u0FB1-\\u0FB7\\u0FB9\\u10A0-\\u10C5\\u10D0-\\u10F6\\u1100\\u1102\\u1103\\u1105-\\u1107\\u1109\\u110B\\u110C\\u110E-\\u1112\\u113C\\u113E\\u1140\\u114C\\u114E\\u1150\\u1154\\u1155\\u1159\\u115F-\\u1161\\u1163\\u1165\\u1167\\u1169\\u116D\\u116E\\u1172\\u1173\\u1175\\u119E\\u11A8\\u11AB\\u11AE\\u11AF\\u11B7\\u11B8\\u11BA\\u11BC-\\u11C2\\u11EB\\u11F0\\u11F9\\u1E00-\\u1E9B\\u1EA0-\\u1EF9\\u1F00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u20D0-\\u20DC\\u20E1\\u2126\\u212A\\u212B\\u212E\\u2180-\\u2182\\u3005\\u3007\\u3021-\\u302F\\u3031-\\u3035\\u3041-\\u3094\\u3099\\u309A\\u309D\\u309E\\u30A1-\\u30FA\\u30FC-\\u30FE\\u3105-\\u312C\\u4E00-\\u9FA5\\uAC00-\\uD7A3]*)[\\t\\n\\r ]*$"}],"fn":"matches","kind":"compute"} and {"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"cp:dependency"}} and {"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"identifierref"}} and {"kind":"compare","left":{"field":"path","kind":"field"},"op":"eq","right":{"kind":"literal","value":"imsmanifest.xml"}}';

COMMENT ON COLUMN "qti"."attribute"."__start_7c7wkvj7tg" IS 'start where {"args":[{"field":"lexical","kind":"field"},{"kind":"literal","value":"^[\\t\\n\\r ]*(?:[A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u0131\\u0134-\\u013E\\u0141-\\u0148\\u014A-\\u017E\\u0180-\\u01C3\\u01CD-\\u01F0\\u01F4\\u01F5\\u01FA-\\u0217\\u0250-\\u02A8\\u02BB-\\u02C1\\u0386\\u0388-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03CE\\u03D0-\\u03D6\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2-\\u03F3\\u0401-\\u040C\\u040E-\\u044F\\u0451-\\u045C\\u045E-\\u0481\\u0490-\\u04C4\\u04C7\\u04C8\\u04CB\\u04CC\\u04D0-\\u04EB\\u04EE-\\u04F5\\u04F8\\u04F9\\u0531-\\u0556\\u0559\\u0561-\\u0586\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u063A\\u0641-\\u064A\\u0671-\\u06B7\\u06BA-\\u06BE\\u06C0-\\u06CE\\u06D0-\\u06D3\\u06D5\\u06E5\\u06E6\\u0905-\\u0939\\u093D\\u0958-\\u0961\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09DC\\u09DD\\u09DF-\\u09E1\\u09F0\\u09F1\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74\\u0A85-\\u0A8B\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AE0\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B36-\\u0B39\\u0B3D\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB5\\u0BB7-\\u0BB9\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C60\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CDE\\u0CE0\\u0CE1\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D60\\u0D61\\u0E01-\\u0E2E\\u0E30\\u0E32\\u0E33\\u0E40-\\u0E45\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD\\u0EAE\\u0EB0\\u0EB2\\u0EB3\\u0EBD\\u0EC0-\\u0EC4\\u0F40-\\u0F47\\u0F49-\\u0F69\\u10A0-\\u10C5\\u10D0-\\u10F6\\u1100\\u1102\\u1103\\u1105-\\u1107\\u1109\\u110B\\u110C\\u110E-\\u1112\\u113C\\u113E\\u1140\\u114C\\u114E\\u1150\\u1154\\u1155\\u1159\\u115F-\\u1161\\u1163\\u1165\\u1167\\u1169\\u116D\\u116E\\u1172\\u1173\\u1175\\u119E\\u11A8\\u11AB\\u11AE\\u11AF\\u11B7\\u11B8\\u11BA\\u11BC-\\u11C2\\u11EB\\u11F0\\u11F9\\u1E00-\\u1E9B\\u1EA0-\\u1EF9\\u1F00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u2126\\u212A\\u212B\\u212E\\u2180-\\u2182\\u3007\\u3021-\\u3029\\u3041-\\u3094\\u30A1-\\u30FA\\u3105-\\u312C\\u4E00-\\u9FA5\\uAC00-\\uD7A3][\\-.0-9A-Z_a-z\\u00B7\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u0131\\u0134-\\u013E\\u0141-\\u0148\\u014A-\\u017E\\u0180-\\u01C3\\u01CD-\\u01F0\\u01F4\\u01F5\\u01FA-\\u0217\\u0250-\\u02A8\\u02BB-\\u02C1\\u02D0\\u02D1\\u0300-\\u0345\\u0360\\u0361\\u0386-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03CE\\u03D0-\\u03D6\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2-\\u03F3\\u0401-\\u040C\\u040E-\\u044F\\u0451-\\u045C\\u045E-\\u0481\\u0483-\\u0486\\u0490-\\u04C4\\u04C7\\u04C8\\u04CB\\u04CC\\u04D0-\\u04EB\\u04EE-\\u04F5\\u04F8\\u04F9\\u0531-\\u0556\\u0559\\u0561-\\u0586\\u0591-\\u05A1\\u05A3-\\u05B9\\u05BB-\\u05BD\\u05BF\\u05C1\\u05C2\\u05C4\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u063A\\u0640-\\u0652\\u0660-\\u0669\\u0670-\\u06B7\\u06BA-\\u06BE\\u06C0-\\u06CE\\u06D0-\\u06D3\\u06D5-\\u06E8\\u06EA-\\u06ED\\u06F0-\\u06F9\\u0901-\\u0903\\u0905-\\u0939\\u093C-\\u094D\\u0951-\\u0954\\u0958-\\u0963\\u0966-\\u096F\\u0981-\\u0983\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BC\\u09BE-\\u09C4\\u09C7\\u09C8\\u09CB-\\u09CD\\u09D7\\u09DC\\u09DD\\u09DF-\\u09E3\\u09E6-\\u09F1\\u0A02\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A3C\\u0A3E-\\u0A42\\u0A47\\u0A48\\u0A4B-\\u0A4D\\u0A59-\\u0A5C\\u0A5E\\u0A66-\\u0A74\\u0A81-\\u0A83\\u0A85-\\u0A8B\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABC-\\u0AC5\\u0AC7-\\u0AC9\\u0ACB-\\u0ACD\\u0AE0\\u0AE6-\\u0AEF\\u0B01-\\u0B03\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B36-\\u0B39\\u0B3C-\\u0B43\\u0B47\\u0B48\\u0B4B-\\u0B4D\\u0B56\\u0B57\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B66-\\u0B6F\\u0B82\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB5\\u0BB7-\\u0BB9\\u0BBE-\\u0BC2\\u0BC6-\\u0BC8\\u0BCA-\\u0BCD\\u0BD7\\u0BE7-\\u0BEF\\u0C01-\\u0C03\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3E-\\u0C44\\u0C46-\\u0C48\\u0C4A-\\u0C4D\\u0C55\\u0C56\\u0C60\\u0C61\\u0C66-\\u0C6F\\u0C82\\u0C83\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBE-\\u0CC4\\u0CC6-\\u0CC8\\u0CCA-\\u0CCD\\u0CD5\\u0CD6\\u0CDE\\u0CE0\\u0CE1\\u0CE6-\\u0CEF\\u0D02\\u0D03\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D3E-\\u0D43\\u0D46-\\u0D48\\u0D4A-\\u0D4D\\u0D57\\u0D60\\u0D61\\u0D66-\\u0D6F\\u0E01-\\u0E2E\\u0E30-\\u0E3A\\u0E40-\\u0E4E\\u0E50-\\u0E59\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD\\u0EAE\\u0EB0-\\u0EB9\\u0EBB-\\u0EBD\\u0EC0-\\u0EC4\\u0EC6\\u0EC8-\\u0ECD\\u0ED0-\\u0ED9\\u0F18\\u0F19\\u0F20-\\u0F29\\u0F35\\u0F37\\u0F39\\u0F3E-\\u0F47\\u0F49-\\u0F69\\u0F71-\\u0F84\\u0F86-\\u0F8B\\u0F90-\\u0F95\\u0F97\\u0F99-\\u0FAD\\u0FB1-\\u0FB7\\u0FB9\\u10A0-\\u10C5\\u10D0-\\u10F6\\u1100\\u1102\\u1103\\u1105-\\u1107\\u1109\\u110B\\u110C\\u110E-\\u1112\\u113C\\u113E\\u1140\\u114C\\u114E\\u1150\\u1154\\u1155\\u1159\\u115F-\\u1161\\u1163\\u1165\\u1167\\u1169\\u116D\\u116E\\u1172\\u1173\\u1175\\u119E\\u11A8\\u11AB\\u11AE\\u11AF\\u11B7\\u11B8\\u11BA\\u11BC-\\u11C2\\u11EB\\u11F0\\u11F9\\u1E00-\\u1E9B\\u1EA0-\\u1EF9\\u1F00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u20D0-\\u20DC\\u20E1\\u2126\\u212A\\u212B\\u212E\\u2180-\\u2182\\u3005\\u3007\\u3021-\\u302F\\u3031-\\u3035\\u3041-\\u3094\\u3099\\u309A\\u309D\\u309E\\u30A1-\\u30FA\\u30FC-\\u30FE\\u3105-\\u312C\\u4E00-\\u9FA5\\uAC00-\\uD7A3]*)[\\t\\n\\r ]*$"}],"fn":"matches","kind":"compute"} and {"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"cp:dependency"}} and {"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"identifierref"}} and {"kind":"compare","left":{"field":"path","kind":"field"},"op":"eq","right":{"kind":"literal","value":"imsmanifest.xml"}}';

COMMENT ON CONSTRAINT "__assembled_catalog_fk_package_path_owner_cwkxri6hfw" ON "qti"."assembled_catalog" IS 'foreign key AssembledCatalog(package, path, owner) to CatalogId(package, path, start)';

COMMENT ON CONSTRAINT "__attribute_fk_package_path_start_copy_attributes_cjh7663z47" ON "qti"."attribute" IS 'foreign key Attribute(package, path, start, the owner''s count of the family Node.attributes, governor, kind) to Node(package, path, start, attributes, governor, kind)';

COMMENT ON CONSTRAINT "__attribute_fk_package_path_start_lexical_cdoiz46a4g" ON "qti"."attribute" IS 'foreign key Attribute(package where {"args":[{"field":"lexical","kind":"field"},{"kind":"literal","value":"^[\\t\\n\\r ]*(?:[A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u0131\\u0134-\\u013E\\u0141-\\u0148\\u014A-\\u017E\\u0180-\\u01C3\\u01CD-\\u01F0\\u01F4\\u01F5\\u01FA-\\u0217\\u0250-\\u02A8\\u02BB-\\u02C1\\u0386\\u0388-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03CE\\u03D0-\\u03D6\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2-\\u03F3\\u0401-\\u040C\\u040E-\\u044F\\u0451-\\u045C\\u045E-\\u0481\\u0490-\\u04C4\\u04C7\\u04C8\\u04CB\\u04CC\\u04D0-\\u04EB\\u04EE-\\u04F5\\u04F8\\u04F9\\u0531-\\u0556\\u0559\\u0561-\\u0586\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u063A\\u0641-\\u064A\\u0671-\\u06B7\\u06BA-\\u06BE\\u06C0-\\u06CE\\u06D0-\\u06D3\\u06D5\\u06E5\\u06E6\\u0905-\\u0939\\u093D\\u0958-\\u0961\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09DC\\u09DD\\u09DF-\\u09E1\\u09F0\\u09F1\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74\\u0A85-\\u0A8B\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AE0\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B36-\\u0B39\\u0B3D\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB5\\u0BB7-\\u0BB9\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C60\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CDE\\u0CE0\\u0CE1\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D60\\u0D61\\u0E01-\\u0E2E\\u0E30\\u0E32\\u0E33\\u0E40-\\u0E45\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD\\u0EAE\\u0EB0\\u0EB2\\u0EB3\\u0EBD\\u0EC0-\\u0EC4\\u0F40-\\u0F47\\u0F49-\\u0F69\\u10A0-\\u10C5\\u10D0-\\u10F6\\u1100\\u1102\\u1103\\u1105-\\u1107\\u1109\\u110B\\u110C\\u110E-\\u1112\\u113C\\u113E\\u1140\\u114C\\u114E\\u1150\\u1154\\u1155\\u1159\\u115F-\\u1161\\u1163\\u1165\\u1167\\u1169\\u116D\\u116E\\u1172\\u1173\\u1175\\u119E\\u11A8\\u11AB\\u11AE\\u11AF\\u11B7\\u11B8\\u11BA\\u11BC-\\u11C2\\u11EB\\u11F0\\u11F9\\u1E00-\\u1E9B\\u1EA0-\\u1EF9\\u1F00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u2126\\u212A\\u212B\\u212E\\u2180-\\u2182\\u3007\\u3021-\\u3029\\u3041-\\u3094\\u30A1-\\u30FA\\u3105-\\u312C\\u4E00-\\u9FA5\\uAC00-\\uD7A3][\\-.0-9A-Z_a-z\\u00B7\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u0131\\u0134-\\u013E\\u0141-\\u0148\\u014A-\\u017E\\u0180-\\u01C3\\u01CD-\\u01F0\\u01F4\\u01F5\\u01FA-\\u0217\\u0250-\\u02A8\\u02BB-\\u02C1\\u02D0\\u02D1\\u0300-\\u0345\\u0360\\u0361\\u0386-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03CE\\u03D0-\\u03D6\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2-\\u03F3\\u0401-\\u040C\\u040E-\\u044F\\u0451-\\u045C\\u045E-\\u0481\\u0483-\\u0486\\u0490-\\u04C4\\u04C7\\u04C8\\u04CB\\u04CC\\u04D0-\\u04EB\\u04EE-\\u04F5\\u04F8\\u04F9\\u0531-\\u0556\\u0559\\u0561-\\u0586\\u0591-\\u05A1\\u05A3-\\u05B9\\u05BB-\\u05BD\\u05BF\\u05C1\\u05C2\\u05C4\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u063A\\u0640-\\u0652\\u0660-\\u0669\\u0670-\\u06B7\\u06BA-\\u06BE\\u06C0-\\u06CE\\u06D0-\\u06D3\\u06D5-\\u06E8\\u06EA-\\u06ED\\u06F0-\\u06F9\\u0901-\\u0903\\u0905-\\u0939\\u093C-\\u094D\\u0951-\\u0954\\u0958-\\u0963\\u0966-\\u096F\\u0981-\\u0983\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BC\\u09BE-\\u09C4\\u09C7\\u09C8\\u09CB-\\u09CD\\u09D7\\u09DC\\u09DD\\u09DF-\\u09E3\\u09E6-\\u09F1\\u0A02\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A3C\\u0A3E-\\u0A42\\u0A47\\u0A48\\u0A4B-\\u0A4D\\u0A59-\\u0A5C\\u0A5E\\u0A66-\\u0A74\\u0A81-\\u0A83\\u0A85-\\u0A8B\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABC-\\u0AC5\\u0AC7-\\u0AC9\\u0ACB-\\u0ACD\\u0AE0\\u0AE6-\\u0AEF\\u0B01-\\u0B03\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B36-\\u0B39\\u0B3C-\\u0B43\\u0B47\\u0B48\\u0B4B-\\u0B4D\\u0B56\\u0B57\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B66-\\u0B6F\\u0B82\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB5\\u0BB7-\\u0BB9\\u0BBE-\\u0BC2\\u0BC6-\\u0BC8\\u0BCA-\\u0BCD\\u0BD7\\u0BE7-\\u0BEF\\u0C01-\\u0C03\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3E-\\u0C44\\u0C46-\\u0C48\\u0C4A-\\u0C4D\\u0C55\\u0C56\\u0C60\\u0C61\\u0C66-\\u0C6F\\u0C82\\u0C83\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBE-\\u0CC4\\u0CC6-\\u0CC8\\u0CCA-\\u0CCD\\u0CD5\\u0CD6\\u0CDE\\u0CE0\\u0CE1\\u0CE6-\\u0CEF\\u0D02\\u0D03\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D3E-\\u0D43\\u0D46-\\u0D48\\u0D4A-\\u0D4D\\u0D57\\u0D60\\u0D61\\u0D66-\\u0D6F\\u0E01-\\u0E2E\\u0E30-\\u0E3A\\u0E40-\\u0E4E\\u0E50-\\u0E59\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD\\u0EAE\\u0EB0-\\u0EB9\\u0EBB-\\u0EBD\\u0EC0-\\u0EC4\\u0EC6\\u0EC8-\\u0ECD\\u0ED0-\\u0ED9\\u0F18\\u0F19\\u0F20-\\u0F29\\u0F35\\u0F37\\u0F39\\u0F3E-\\u0F47\\u0F49-\\u0F69\\u0F71-\\u0F84\\u0F86-\\u0F8B\\u0F90-\\u0F95\\u0F97\\u0F99-\\u0FAD\\u0FB1-\\u0FB7\\u0FB9\\u10A0-\\u10C5\\u10D0-\\u10F6\\u1100\\u1102\\u1103\\u1105-\\u1107\\u1109\\u110B\\u110C\\u110E-\\u1112\\u113C\\u113E\\u1140\\u114C\\u114E\\u1150\\u1154\\u1155\\u1159\\u115F-\\u1161\\u1163\\u1165\\u1167\\u1169\\u116D\\u116E\\u1172\\u1173\\u1175\\u119E\\u11A8\\u11AB\\u11AE\\u11AF\\u11B7\\u11B8\\u11BA\\u11BC-\\u11C2\\u11EB\\u11F0\\u11F9\\u1E00-\\u1E9B\\u1EA0-\\u1EF9\\u1F00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u20D0-\\u20DC\\u20E1\\u2126\\u212A\\u212B\\u212E\\u2180-\\u2182\\u3005\\u3007\\u3021-\\u302F\\u3031-\\u3035\\u3041-\\u3094\\u3099\\u309A\\u309D\\u309E\\u30A1-\\u30FA\\u30FC-\\u30FE\\u3105-\\u312C\\u4E00-\\u9FA5\\uAC00-\\uD7A3]*)[\\t\\n\\r ]*$"}],"fn":"matches","kind":"compute"} and {"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"cp:dependency"}} and {"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"identifierref"}} and {"kind":"compare","left":{"field":"path","kind":"field"},"op":"eq","right":{"kind":"literal","value":"imsmanifest.xml"}}, path where {"args":[{"field":"lexical","kind":"field"},{"kind":"literal","value":"^[\\t\\n\\r ]*(?:[A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u0131\\u0134-\\u013E\\u0141-\\u0148\\u014A-\\u017E\\u0180-\\u01C3\\u01CD-\\u01F0\\u01F4\\u01F5\\u01FA-\\u0217\\u0250-\\u02A8\\u02BB-\\u02C1\\u0386\\u0388-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03CE\\u03D0-\\u03D6\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2-\\u03F3\\u0401-\\u040C\\u040E-\\u044F\\u0451-\\u045C\\u045E-\\u0481\\u0490-\\u04C4\\u04C7\\u04C8\\u04CB\\u04CC\\u04D0-\\u04EB\\u04EE-\\u04F5\\u04F8\\u04F9\\u0531-\\u0556\\u0559\\u0561-\\u0586\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u063A\\u0641-\\u064A\\u0671-\\u06B7\\u06BA-\\u06BE\\u06C0-\\u06CE\\u06D0-\\u06D3\\u06D5\\u06E5\\u06E6\\u0905-\\u0939\\u093D\\u0958-\\u0961\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09DC\\u09DD\\u09DF-\\u09E1\\u09F0\\u09F1\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74\\u0A85-\\u0A8B\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AE0\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B36-\\u0B39\\u0B3D\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB5\\u0BB7-\\u0BB9\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C60\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CDE\\u0CE0\\u0CE1\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D60\\u0D61\\u0E01-\\u0E2E\\u0E30\\u0E32\\u0E33\\u0E40-\\u0E45\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD\\u0EAE\\u0EB0\\u0EB2\\u0EB3\\u0EBD\\u0EC0-\\u0EC4\\u0F40-\\u0F47\\u0F49-\\u0F69\\u10A0-\\u10C5\\u10D0-\\u10F6\\u1100\\u1102\\u1103\\u1105-\\u1107\\u1109\\u110B\\u110C\\u110E-\\u1112\\u113C\\u113E\\u1140\\u114C\\u114E\\u1150\\u1154\\u1155\\u1159\\u115F-\\u1161\\u1163\\u1165\\u1167\\u1169\\u116D\\u116E\\u1172\\u1173\\u1175\\u119E\\u11A8\\u11AB\\u11AE\\u11AF\\u11B7\\u11B8\\u11BA\\u11BC-\\u11C2\\u11EB\\u11F0\\u11F9\\u1E00-\\u1E9B\\u1EA0-\\u1EF9\\u1F00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u2126\\u212A\\u212B\\u212E\\u2180-\\u2182\\u3007\\u3021-\\u3029\\u3041-\\u3094\\u30A1-\\u30FA\\u3105-\\u312C\\u4E00-\\u9FA5\\uAC00-\\uD7A3][\\-.0-9A-Z_a-z\\u00B7\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u0131\\u0134-\\u013E\\u0141-\\u0148\\u014A-\\u017E\\u0180-\\u01C3\\u01CD-\\u01F0\\u01F4\\u01F5\\u01FA-\\u0217\\u0250-\\u02A8\\u02BB-\\u02C1\\u02D0\\u02D1\\u0300-\\u0345\\u0360\\u0361\\u0386-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03CE\\u03D0-\\u03D6\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2-\\u03F3\\u0401-\\u040C\\u040E-\\u044F\\u0451-\\u045C\\u045E-\\u0481\\u0483-\\u0486\\u0490-\\u04C4\\u04C7\\u04C8\\u04CB\\u04CC\\u04D0-\\u04EB\\u04EE-\\u04F5\\u04F8\\u04F9\\u0531-\\u0556\\u0559\\u0561-\\u0586\\u0591-\\u05A1\\u05A3-\\u05B9\\u05BB-\\u05BD\\u05BF\\u05C1\\u05C2\\u05C4\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u063A\\u0640-\\u0652\\u0660-\\u0669\\u0670-\\u06B7\\u06BA-\\u06BE\\u06C0-\\u06CE\\u06D0-\\u06D3\\u06D5-\\u06E8\\u06EA-\\u06ED\\u06F0-\\u06F9\\u0901-\\u0903\\u0905-\\u0939\\u093C-\\u094D\\u0951-\\u0954\\u0958-\\u0963\\u0966-\\u096F\\u0981-\\u0983\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BC\\u09BE-\\u09C4\\u09C7\\u09C8\\u09CB-\\u09CD\\u09D7\\u09DC\\u09DD\\u09DF-\\u09E3\\u09E6-\\u09F1\\u0A02\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A3C\\u0A3E-\\u0A42\\u0A47\\u0A48\\u0A4B-\\u0A4D\\u0A59-\\u0A5C\\u0A5E\\u0A66-\\u0A74\\u0A81-\\u0A83\\u0A85-\\u0A8B\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABC-\\u0AC5\\u0AC7-\\u0AC9\\u0ACB-\\u0ACD\\u0AE0\\u0AE6-\\u0AEF\\u0B01-\\u0B03\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B36-\\u0B39\\u0B3C-\\u0B43\\u0B47\\u0B48\\u0B4B-\\u0B4D\\u0B56\\u0B57\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B66-\\u0B6F\\u0B82\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB5\\u0BB7-\\u0BB9\\u0BBE-\\u0BC2\\u0BC6-\\u0BC8\\u0BCA-\\u0BCD\\u0BD7\\u0BE7-\\u0BEF\\u0C01-\\u0C03\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3E-\\u0C44\\u0C46-\\u0C48\\u0C4A-\\u0C4D\\u0C55\\u0C56\\u0C60\\u0C61\\u0C66-\\u0C6F\\u0C82\\u0C83\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBE-\\u0CC4\\u0CC6-\\u0CC8\\u0CCA-\\u0CCD\\u0CD5\\u0CD6\\u0CDE\\u0CE0\\u0CE1\\u0CE6-\\u0CEF\\u0D02\\u0D03\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D3E-\\u0D43\\u0D46-\\u0D48\\u0D4A-\\u0D4D\\u0D57\\u0D60\\u0D61\\u0D66-\\u0D6F\\u0E01-\\u0E2E\\u0E30-\\u0E3A\\u0E40-\\u0E4E\\u0E50-\\u0E59\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD\\u0EAE\\u0EB0-\\u0EB9\\u0EBB-\\u0EBD\\u0EC0-\\u0EC4\\u0EC6\\u0EC8-\\u0ECD\\u0ED0-\\u0ED9\\u0F18\\u0F19\\u0F20-\\u0F29\\u0F35\\u0F37\\u0F39\\u0F3E-\\u0F47\\u0F49-\\u0F69\\u0F71-\\u0F84\\u0F86-\\u0F8B\\u0F90-\\u0F95\\u0F97\\u0F99-\\u0FAD\\u0FB1-\\u0FB7\\u0FB9\\u10A0-\\u10C5\\u10D0-\\u10F6\\u1100\\u1102\\u1103\\u1105-\\u1107\\u1109\\u110B\\u110C\\u110E-\\u1112\\u113C\\u113E\\u1140\\u114C\\u114E\\u1150\\u1154\\u1155\\u1159\\u115F-\\u1161\\u1163\\u1165\\u1167\\u1169\\u116D\\u116E\\u1172\\u1173\\u1175\\u119E\\u11A8\\u11AB\\u11AE\\u11AF\\u11B7\\u11B8\\u11BA\\u11BC-\\u11C2\\u11EB\\u11F0\\u11F9\\u1E00-\\u1E9B\\u1EA0-\\u1EF9\\u1F00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u20D0-\\u20DC\\u20E1\\u2126\\u212A\\u212B\\u212E\\u2180-\\u2182\\u3005\\u3007\\u3021-\\u302F\\u3031-\\u3035\\u3041-\\u3094\\u3099\\u309A\\u309D\\u309E\\u30A1-\\u30FA\\u30FC-\\u30FE\\u3105-\\u312C\\u4E00-\\u9FA5\\uAC00-\\uD7A3]*)[\\t\\n\\r ]*$"}],"fn":"matches","kind":"compute"} and {"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"cp:dependency"}} and {"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"identifierref"}} and {"kind":"compare","left":{"field":"path","kind":"field"},"op":"eq","right":{"kind":"literal","value":"imsmanifest.xml"}}, start where {"args":[{"field":"lexical","kind":"field"},{"kind":"literal","value":"^[\\t\\n\\r ]*(?:[A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u0131\\u0134-\\u013E\\u0141-\\u0148\\u014A-\\u017E\\u0180-\\u01C3\\u01CD-\\u01F0\\u01F4\\u01F5\\u01FA-\\u0217\\u0250-\\u02A8\\u02BB-\\u02C1\\u0386\\u0388-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03CE\\u03D0-\\u03D6\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2-\\u03F3\\u0401-\\u040C\\u040E-\\u044F\\u0451-\\u045C\\u045E-\\u0481\\u0490-\\u04C4\\u04C7\\u04C8\\u04CB\\u04CC\\u04D0-\\u04EB\\u04EE-\\u04F5\\u04F8\\u04F9\\u0531-\\u0556\\u0559\\u0561-\\u0586\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u063A\\u0641-\\u064A\\u0671-\\u06B7\\u06BA-\\u06BE\\u06C0-\\u06CE\\u06D0-\\u06D3\\u06D5\\u06E5\\u06E6\\u0905-\\u0939\\u093D\\u0958-\\u0961\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09DC\\u09DD\\u09DF-\\u09E1\\u09F0\\u09F1\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74\\u0A85-\\u0A8B\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AE0\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B36-\\u0B39\\u0B3D\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB5\\u0BB7-\\u0BB9\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C60\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CDE\\u0CE0\\u0CE1\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D60\\u0D61\\u0E01-\\u0E2E\\u0E30\\u0E32\\u0E33\\u0E40-\\u0E45\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD\\u0EAE\\u0EB0\\u0EB2\\u0EB3\\u0EBD\\u0EC0-\\u0EC4\\u0F40-\\u0F47\\u0F49-\\u0F69\\u10A0-\\u10C5\\u10D0-\\u10F6\\u1100\\u1102\\u1103\\u1105-\\u1107\\u1109\\u110B\\u110C\\u110E-\\u1112\\u113C\\u113E\\u1140\\u114C\\u114E\\u1150\\u1154\\u1155\\u1159\\u115F-\\u1161\\u1163\\u1165\\u1167\\u1169\\u116D\\u116E\\u1172\\u1173\\u1175\\u119E\\u11A8\\u11AB\\u11AE\\u11AF\\u11B7\\u11B8\\u11BA\\u11BC-\\u11C2\\u11EB\\u11F0\\u11F9\\u1E00-\\u1E9B\\u1EA0-\\u1EF9\\u1F00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u2126\\u212A\\u212B\\u212E\\u2180-\\u2182\\u3007\\u3021-\\u3029\\u3041-\\u3094\\u30A1-\\u30FA\\u3105-\\u312C\\u4E00-\\u9FA5\\uAC00-\\uD7A3][\\-.0-9A-Z_a-z\\u00B7\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u0131\\u0134-\\u013E\\u0141-\\u0148\\u014A-\\u017E\\u0180-\\u01C3\\u01CD-\\u01F0\\u01F4\\u01F5\\u01FA-\\u0217\\u0250-\\u02A8\\u02BB-\\u02C1\\u02D0\\u02D1\\u0300-\\u0345\\u0360\\u0361\\u0386-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03CE\\u03D0-\\u03D6\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2-\\u03F3\\u0401-\\u040C\\u040E-\\u044F\\u0451-\\u045C\\u045E-\\u0481\\u0483-\\u0486\\u0490-\\u04C4\\u04C7\\u04C8\\u04CB\\u04CC\\u04D0-\\u04EB\\u04EE-\\u04F5\\u04F8\\u04F9\\u0531-\\u0556\\u0559\\u0561-\\u0586\\u0591-\\u05A1\\u05A3-\\u05B9\\u05BB-\\u05BD\\u05BF\\u05C1\\u05C2\\u05C4\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u063A\\u0640-\\u0652\\u0660-\\u0669\\u0670-\\u06B7\\u06BA-\\u06BE\\u06C0-\\u06CE\\u06D0-\\u06D3\\u06D5-\\u06E8\\u06EA-\\u06ED\\u06F0-\\u06F9\\u0901-\\u0903\\u0905-\\u0939\\u093C-\\u094D\\u0951-\\u0954\\u0958-\\u0963\\u0966-\\u096F\\u0981-\\u0983\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BC\\u09BE-\\u09C4\\u09C7\\u09C8\\u09CB-\\u09CD\\u09D7\\u09DC\\u09DD\\u09DF-\\u09E3\\u09E6-\\u09F1\\u0A02\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A3C\\u0A3E-\\u0A42\\u0A47\\u0A48\\u0A4B-\\u0A4D\\u0A59-\\u0A5C\\u0A5E\\u0A66-\\u0A74\\u0A81-\\u0A83\\u0A85-\\u0A8B\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABC-\\u0AC5\\u0AC7-\\u0AC9\\u0ACB-\\u0ACD\\u0AE0\\u0AE6-\\u0AEF\\u0B01-\\u0B03\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B36-\\u0B39\\u0B3C-\\u0B43\\u0B47\\u0B48\\u0B4B-\\u0B4D\\u0B56\\u0B57\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B66-\\u0B6F\\u0B82\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB5\\u0BB7-\\u0BB9\\u0BBE-\\u0BC2\\u0BC6-\\u0BC8\\u0BCA-\\u0BCD\\u0BD7\\u0BE7-\\u0BEF\\u0C01-\\u0C03\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3E-\\u0C44\\u0C46-\\u0C48\\u0C4A-\\u0C4D\\u0C55\\u0C56\\u0C60\\u0C61\\u0C66-\\u0C6F\\u0C82\\u0C83\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBE-\\u0CC4\\u0CC6-\\u0CC8\\u0CCA-\\u0CCD\\u0CD5\\u0CD6\\u0CDE\\u0CE0\\u0CE1\\u0CE6-\\u0CEF\\u0D02\\u0D03\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D3E-\\u0D43\\u0D46-\\u0D48\\u0D4A-\\u0D4D\\u0D57\\u0D60\\u0D61\\u0D66-\\u0D6F\\u0E01-\\u0E2E\\u0E30-\\u0E3A\\u0E40-\\u0E4E\\u0E50-\\u0E59\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD\\u0EAE\\u0EB0-\\u0EB9\\u0EBB-\\u0EBD\\u0EC0-\\u0EC4\\u0EC6\\u0EC8-\\u0ECD\\u0ED0-\\u0ED9\\u0F18\\u0F19\\u0F20-\\u0F29\\u0F35\\u0F37\\u0F39\\u0F3E-\\u0F47\\u0F49-\\u0F69\\u0F71-\\u0F84\\u0F86-\\u0F8B\\u0F90-\\u0F95\\u0F97\\u0F99-\\u0FAD\\u0FB1-\\u0FB7\\u0FB9\\u10A0-\\u10C5\\u10D0-\\u10F6\\u1100\\u1102\\u1103\\u1105-\\u1107\\u1109\\u110B\\u110C\\u110E-\\u1112\\u113C\\u113E\\u1140\\u114C\\u114E\\u1150\\u1154\\u1155\\u1159\\u115F-\\u1161\\u1163\\u1165\\u1167\\u1169\\u116D\\u116E\\u1172\\u1173\\u1175\\u119E\\u11A8\\u11AB\\u11AE\\u11AF\\u11B7\\u11B8\\u11BA\\u11BC-\\u11C2\\u11EB\\u11F0\\u11F9\\u1E00-\\u1E9B\\u1EA0-\\u1EF9\\u1F00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u20D0-\\u20DC\\u20E1\\u2126\\u212A\\u212B\\u212E\\u2180-\\u2182\\u3005\\u3007\\u3021-\\u302F\\u3031-\\u3035\\u3041-\\u3094\\u3099\\u309A\\u309D\\u309E\\u30A1-\\u30FA\\u30FC-\\u30FE\\u3105-\\u312C\\u4E00-\\u9FA5\\uAC00-\\uD7A3]*)[\\t\\n\\r ]*$"}],"fn":"matches","kind":"compute"} and {"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"cp:dependency"}} and {"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"identifierref"}} and {"kind":"compare","left":{"field":"path","kind":"field"},"op":"eq","right":{"kind":"literal","value":"imsmanifest.xml"}}, lexical where {"args":[{"field":"lexical","kind":"field"},{"kind":"literal","value":"^[\\t\\n\\r ]*(?:[A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u0131\\u0134-\\u013E\\u0141-\\u0148\\u014A-\\u017E\\u0180-\\u01C3\\u01CD-\\u01F0\\u01F4\\u01F5\\u01FA-\\u0217\\u0250-\\u02A8\\u02BB-\\u02C1\\u0386\\u0388-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03CE\\u03D0-\\u03D6\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2-\\u03F3\\u0401-\\u040C\\u040E-\\u044F\\u0451-\\u045C\\u045E-\\u0481\\u0490-\\u04C4\\u04C7\\u04C8\\u04CB\\u04CC\\u04D0-\\u04EB\\u04EE-\\u04F5\\u04F8\\u04F9\\u0531-\\u0556\\u0559\\u0561-\\u0586\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u063A\\u0641-\\u064A\\u0671-\\u06B7\\u06BA-\\u06BE\\u06C0-\\u06CE\\u06D0-\\u06D3\\u06D5\\u06E5\\u06E6\\u0905-\\u0939\\u093D\\u0958-\\u0961\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09DC\\u09DD\\u09DF-\\u09E1\\u09F0\\u09F1\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74\\u0A85-\\u0A8B\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AE0\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B36-\\u0B39\\u0B3D\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB5\\u0BB7-\\u0BB9\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C60\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CDE\\u0CE0\\u0CE1\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D60\\u0D61\\u0E01-\\u0E2E\\u0E30\\u0E32\\u0E33\\u0E40-\\u0E45\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD\\u0EAE\\u0EB0\\u0EB2\\u0EB3\\u0EBD\\u0EC0-\\u0EC4\\u0F40-\\u0F47\\u0F49-\\u0F69\\u10A0-\\u10C5\\u10D0-\\u10F6\\u1100\\u1102\\u1103\\u1105-\\u1107\\u1109\\u110B\\u110C\\u110E-\\u1112\\u113C\\u113E\\u1140\\u114C\\u114E\\u1150\\u1154\\u1155\\u1159\\u115F-\\u1161\\u1163\\u1165\\u1167\\u1169\\u116D\\u116E\\u1172\\u1173\\u1175\\u119E\\u11A8\\u11AB\\u11AE\\u11AF\\u11B7\\u11B8\\u11BA\\u11BC-\\u11C2\\u11EB\\u11F0\\u11F9\\u1E00-\\u1E9B\\u1EA0-\\u1EF9\\u1F00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u2126\\u212A\\u212B\\u212E\\u2180-\\u2182\\u3007\\u3021-\\u3029\\u3041-\\u3094\\u30A1-\\u30FA\\u3105-\\u312C\\u4E00-\\u9FA5\\uAC00-\\uD7A3][\\-.0-9A-Z_a-z\\u00B7\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u0131\\u0134-\\u013E\\u0141-\\u0148\\u014A-\\u017E\\u0180-\\u01C3\\u01CD-\\u01F0\\u01F4\\u01F5\\u01FA-\\u0217\\u0250-\\u02A8\\u02BB-\\u02C1\\u02D0\\u02D1\\u0300-\\u0345\\u0360\\u0361\\u0386-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03CE\\u03D0-\\u03D6\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2-\\u03F3\\u0401-\\u040C\\u040E-\\u044F\\u0451-\\u045C\\u045E-\\u0481\\u0483-\\u0486\\u0490-\\u04C4\\u04C7\\u04C8\\u04CB\\u04CC\\u04D0-\\u04EB\\u04EE-\\u04F5\\u04F8\\u04F9\\u0531-\\u0556\\u0559\\u0561-\\u0586\\u0591-\\u05A1\\u05A3-\\u05B9\\u05BB-\\u05BD\\u05BF\\u05C1\\u05C2\\u05C4\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u063A\\u0640-\\u0652\\u0660-\\u0669\\u0670-\\u06B7\\u06BA-\\u06BE\\u06C0-\\u06CE\\u06D0-\\u06D3\\u06D5-\\u06E8\\u06EA-\\u06ED\\u06F0-\\u06F9\\u0901-\\u0903\\u0905-\\u0939\\u093C-\\u094D\\u0951-\\u0954\\u0958-\\u0963\\u0966-\\u096F\\u0981-\\u0983\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BC\\u09BE-\\u09C4\\u09C7\\u09C8\\u09CB-\\u09CD\\u09D7\\u09DC\\u09DD\\u09DF-\\u09E3\\u09E6-\\u09F1\\u0A02\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A3C\\u0A3E-\\u0A42\\u0A47\\u0A48\\u0A4B-\\u0A4D\\u0A59-\\u0A5C\\u0A5E\\u0A66-\\u0A74\\u0A81-\\u0A83\\u0A85-\\u0A8B\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABC-\\u0AC5\\u0AC7-\\u0AC9\\u0ACB-\\u0ACD\\u0AE0\\u0AE6-\\u0AEF\\u0B01-\\u0B03\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B36-\\u0B39\\u0B3C-\\u0B43\\u0B47\\u0B48\\u0B4B-\\u0B4D\\u0B56\\u0B57\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B66-\\u0B6F\\u0B82\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB5\\u0BB7-\\u0BB9\\u0BBE-\\u0BC2\\u0BC6-\\u0BC8\\u0BCA-\\u0BCD\\u0BD7\\u0BE7-\\u0BEF\\u0C01-\\u0C03\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3E-\\u0C44\\u0C46-\\u0C48\\u0C4A-\\u0C4D\\u0C55\\u0C56\\u0C60\\u0C61\\u0C66-\\u0C6F\\u0C82\\u0C83\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBE-\\u0CC4\\u0CC6-\\u0CC8\\u0CCA-\\u0CCD\\u0CD5\\u0CD6\\u0CDE\\u0CE0\\u0CE1\\u0CE6-\\u0CEF\\u0D02\\u0D03\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D3E-\\u0D43\\u0D46-\\u0D48\\u0D4A-\\u0D4D\\u0D57\\u0D60\\u0D61\\u0D66-\\u0D6F\\u0E01-\\u0E2E\\u0E30-\\u0E3A\\u0E40-\\u0E4E\\u0E50-\\u0E59\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD\\u0EAE\\u0EB0-\\u0EB9\\u0EBB-\\u0EBD\\u0EC0-\\u0EC4\\u0EC6\\u0EC8-\\u0ECD\\u0ED0-\\u0ED9\\u0F18\\u0F19\\u0F20-\\u0F29\\u0F35\\u0F37\\u0F39\\u0F3E-\\u0F47\\u0F49-\\u0F69\\u0F71-\\u0F84\\u0F86-\\u0F8B\\u0F90-\\u0F95\\u0F97\\u0F99-\\u0FAD\\u0FB1-\\u0FB7\\u0FB9\\u10A0-\\u10C5\\u10D0-\\u10F6\\u1100\\u1102\\u1103\\u1105-\\u1107\\u1109\\u110B\\u110C\\u110E-\\u1112\\u113C\\u113E\\u1140\\u114C\\u114E\\u1150\\u1154\\u1155\\u1159\\u115F-\\u1161\\u1163\\u1165\\u1167\\u1169\\u116D\\u116E\\u1172\\u1173\\u1175\\u119E\\u11A8\\u11AB\\u11AE\\u11AF\\u11B7\\u11B8\\u11BA\\u11BC-\\u11C2\\u11EB\\u11F0\\u11F9\\u1E00-\\u1E9B\\u1EA0-\\u1EF9\\u1F00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u20D0-\\u20DC\\u20E1\\u2126\\u212A\\u212B\\u212E\\u2180-\\u2182\\u3005\\u3007\\u3021-\\u302F\\u3031-\\u3035\\u3041-\\u3094\\u3099\\u309A\\u309D\\u309E\\u30A1-\\u30FA\\u30FC-\\u30FE\\u3105-\\u312C\\u4E00-\\u9FA5\\uAC00-\\uD7A3]*)[\\t\\n\\r ]*$"}],"fn":"matches","kind":"compute"} and {"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"cp:dependency"}} and {"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"identifierref"}} and {"kind":"compare","left":{"field":"path","kind":"field"},"op":"eq","right":{"kind":"literal","value":"imsmanifest.xml"}}) to Dependency(package, path, start, lexical)';

COMMENT ON CONSTRAINT "__attribute_entity_fk_package_path_start_name_mzkbpjqrfj" ON "qti"."attribute_entity" IS 'foreign key AttributeEntity(package, path, start, name) to Attribute(package, path, start, name)';

COMMENT ON CONSTRAINT "__candidate_path_fk_package_target_aynqp2vyvf" ON "qti"."candidate_path" IS 'foreign key CandidatePath(package, target) to Entry(package, path)';

COMMENT ON CONSTRAINT "__catalog_id_fk_package_path_start_id_owner_rx2hw6nx5f" ON "qti"."catalog_id" IS 'foreign key CatalogId(package, path, start, id, owner) to DocumentId(package, path, start, id, owner)';

COMMENT ON CONSTRAINT "__catalog_scope_fk_package_path_start_naheth2be3" ON "qti"."catalog_scope" IS 'foreign key CatalogScope(package, path, start) to Node(package, path, start)';

COMMENT ON CONSTRAINT "__catalog_target_fk_package_path_assembled_7rzo7y6fze" ON "qti"."catalog_target" IS 'foreign key CatalogTarget(package, path, assembled) to Document(package, path, assembled)';

COMMENT ON CONSTRAINT "__cell_headers_fk_package_path_start_5bbvstgdmm" ON "qti"."cell_headers" IS 'foreign key CellHeaders(package, path, start) to TableScope(package, path, start)';

COMMENT ON CONSTRAINT "__cell_leaf_fk_package_path_start_cell_s2bln45e52" ON "qti"."cell_leaf" IS 'foreign key CellLeaf(package, path, start, cell) to MathAlignScope(package, path, start, cell)';

COMMENT ON CONSTRAINT "__choice_fk_package_path_start_hjjl442vss" ON "qti"."choice" IS 'foreign key Choice(package, path, start) to ChoiceInteraction(package, path, start)';

COMMENT ON CONSTRAINT "__count_bound_fk_package_path_start_t5pqtfs3rz" ON "qti"."count_bound" IS 'foreign key CountBound(package, path, start) to Node(package, path, start)';

COMMENT ON CONSTRAINT "__element_type_fk_package_path_start_kind_governor_uciwknlvpy" ON "qti"."element_type" IS 'foreign key ElementType(package, path, start, kind, governor) to Node(package, path, start, kind, governor)';

COMMENT ON CONSTRAINT "__encoding_decl_fk_package_path_u5grbt7fag" ON "qti"."encoding_decl" IS 'foreign key EncodingDecl(package, path) to XmlDecl(package, path)';

COMMENT ON CONSTRAINT "__expression_fk_package_path_start_f6hwlqhv67" ON "qti"."expression" IS 'foreign key Expression(package, path, start) to Node(package, path, start)';

COMMENT ON CONSTRAINT "__expression_attribute_fk_package_path_start_base_oi7wlemrkf" ON "qti"."expression_attribute" IS 'foreign key ExpressionAttribute(package, path, start, baseType) to Expression(package, path, start, baseType)';

COMMENT ON CONSTRAINT "__fragment_scope_fk_package_assembly_instance_nkb5xn3uaf" ON "qti"."fragment_scope" IS 'foreign key FragmentScope(package, assembly, instance, document, assemblyKind) to Instance(package, assembly, start, document, assemblyKind)';

COMMENT ON CONSTRAINT "__identity_text_fk_package_path_start_vymux7o4os" ON "qti"."identity_text" IS 'foreign key IdentityText(package, path, start) to Node(package, path, start)';

COMMENT ON CONSTRAINT "__idref_fk_package_path_token_vc7e2dybao" ON "qti"."idref" IS 'foreign key Idref(package, path, token) to IdrefTarget(package, path, id)';

COMMENT ON CONSTRAINT "__inclusion_fk_package_path_start_parent_kind_places_2557ifwq63" ON "qti"."inclusion" IS 'foreign key Inclusion(package, path, start, parentKind, places, root, splices) to SiteTarget(package, path, start, parentKind, places, targetRoot, splices)';

COMMENT ON CONSTRAINT "__instance_fk_package_document_ids_idref_targets_5z7ien5yku" ON "qti"."instance" IS 'foreign key Instance(package, document, ids, idrefTargets, choices, hottexts) to Document(package, path, ids, idrefTargets, choices, hottexts)';

COMMENT ON CONSTRAINT "__instance_fk_package_document_root_kind_hgvtyahpsw" ON "qti"."instance" IS 'foreign key Instance(package, document, rootKind) to Document(package, path, rootKind)';

COMMENT ON CONSTRAINT "__instance_fk_package_document_copy_instances_x7aqmllqsw" ON "qti"."instance" IS 'foreign key Instance(package, document, the owner''s count of the family TestDocument.instances, children) to TestDocument(package, path, instances, sites)';

COMMENT ON CONSTRAINT "__interaction_fk_package_path_start_wpfpdpxf37" ON "qti"."interaction" IS 'foreign key Interaction(package, path, start) to Node(package, path, start)';

COMMENT ON CONSTRAINT "__interaction_attribute_fk_package_path_root_kind_ottpmnv3zo" ON "qti"."interaction_attribute" IS 'foreign key InteractionAttribute(package, path, rootKind) to Document(package, path, rootKind)';

COMMENT ON CONSTRAINT "__label_use_fk_package_path_root_kind_5odzayuwy3" ON "qti"."label_use" IS 'foreign key LabelUse(package, path, rootKind) to Document(package, path, rootKind)';

COMMENT ON CONSTRAINT "__least_count_fk_package_path_start_vgly2zkjt2" ON "qti"."least_count" IS 'foreign key LeastCount(package, path, start) to CountBound(package, path, start)';

COMMENT ON CONSTRAINT "__literal_fk_package_path_start_base_type_j2vwpqor57" ON "qti"."literal" IS 'foreign key Literal(package, path, start, baseType) to Expression(package, path, start, baseType)';

COMMENT ON CONSTRAINT "__mastery_floor_fk_package_path_start_normal_minimum_szr5b5iyze" ON "qti"."mastery_floor" IS 'foreign key MasteryFloor(package, path, start, normalMinimum) to NormalMinimum(package, path, start, lexical)';

COMMENT ON CONSTRAINT "__math_align_group_fk_package_path_start_cell_ygnv5pqymq" ON "qti"."math_align_group" IS 'foreign key MathAlignGroup(package, path, start, cell) to MathAlignScope(package, path, start, cell)';

COMMENT ON CONSTRAINT "__math_align_scope_fk_package_path_start_jfr4iz7vmr" ON "qti"."math_align_scope" IS 'foreign key MathAlignScope(package, path, start) to Node(package, path, start)';

COMMENT ON CONSTRAINT "__math_cn_fk_package_path_start_type_gfdns3v3gm" ON "qti"."math_cn" IS 'foreign key MathCn(package, path, start, type) to CnCount(package, path, start, type)';

COMMENT ON CONSTRAINT "__math_rank_fk_package_path_start_z7fxfctmgv" ON "qti"."math_rank" IS 'foreign key MathRank(package, path, start) to Node(package, path, start)';

COMMENT ON CONSTRAINT "__most_count_fk_package_path_start_nmmdsz5znz" ON "qti"."most_count" IS 'foreign key MostCount(package, path, start) to CountBound(package, path, start)';

COMMENT ON CONSTRAINT "__named_fk_package_path_jmclgjz4so" ON "qti"."named" IS 'foreign key Named(package, path) to TestDocument(package, path)';

COMMENT ON CONSTRAINT "__namespace_fk_package_path_start_4tsm66w6qo" ON "qti"."namespace" IS 'foreign key Namespace(package, path, start) to Node(package, path, start)';

COMMENT ON CONSTRAINT "__node_fk_package_path_parent_copy_children_parent_vmpszmhgxt" ON "qti"."node" IS 'foreign key Node(package, path, parent, the owner''s count of the family Node.children, parentAncestry, parentGovernor, parentKind, parentNearest, parentNearestKind, parentNearestPath, parentParentKind) to Node(package, path, start, children, ancestry, governor, kind, nearest, nearestKind, nearestPath, parentKind)';

COMMENT ON CONSTRAINT "__open_attribute_entity_fk_package_path_start_uri_ccjfi3dv74" ON "qti"."open_attribute_entity" IS 'foreign key OpenAttributeEntity(package, path, start, uri, local) to OpenAttribute(package, path, start, uri, local)';

COMMENT ON CONSTRAINT "__open_element_name_fk_package_path_start_dgkc2wpi7w" ON "qti"."open_element_name" IS 'foreign key OpenElementName(package, path, start) to Node(package, path, start)';

COMMENT ON CONSTRAINT "__open_element_type_fk_package_path_start_jjjipij4kp" ON "qti"."open_element_type" IS 'foreign key OpenElementType(package, path, start) to OpenElementName(package, path, start)';

COMMENT ON CONSTRAINT "__placed_catalog_ref_fk_package_assembly_id_ekloeln6cs" ON "qti"."placed_catalog_ref" IS 'foreign key PlacedCatalogRef(package, assembly, id) to AssembledCatalog(package, assembly, id)';

COMMENT ON CONSTRAINT "__placed_id_fk_package_path_start_id_owner_26c5kasps3" ON "qti"."placed_id" IS 'foreign key PlacedId(package, path, start, id, owner) to DocumentId(package, path, start, id, owner)';

COMMENT ON CONSTRAINT "__placed_idref_fk_package_path_id_gx6cf6dfqn" ON "qti"."placed_idref" IS 'foreign key PlacedIdref(package, path, id) to IdrefTarget(package, path, id)';

COMMENT ON CONSTRAINT "__placed_math_rank_fk_package_assembly_instance_path_ne6gauiyao" ON "qti"."placed_math_rank" IS 'foreign key PlacedMathRank(package, assembly, instance, path) to Instance(package, assembly, start, document)';

COMMENT ON CONSTRAINT "__placed_math_rank_fk_package_path_start_5kblemgm5d" ON "qti"."placed_math_rank" IS 'foreign key PlacedMathRank(package, path, start) to Node(package, path, start)';

COMMENT ON CONSTRAINT "__placed_share_target_fk_package_assembly_instance_o7a22jy6p7" ON "qti"."placed_share_target" IS 'foreign key PlacedShareTarget(package, assembly, instance, path, assemblyKind) to Instance(package, assembly, start, document, assemblyKind)';

COMMENT ON CONSTRAINT "__placed_share_target_fk_package_assembly_instance_mcp6dsg3aq" ON "qti"."placed_share_target" IS 'foreign key PlacedShareTarget(package, assembly, instance, start) to PlacedMathRank(package, assembly, instance, start)';

COMMENT ON CONSTRAINT "__placed_share_target_fk_package_assembly_target_or2mupqns2" ON "qti"."placed_share_target" IS 'foreign key PlacedShareTarget(package, assembly, targetInstance, target) to Instance(package, assembly, start, document)';

COMMENT ON CONSTRAINT "__placed_share_target_fk_package_assembly_target_4oz3u75j3w" ON "qti"."placed_share_target" IS 'foreign key PlacedShareTarget(package, assembly, targetInstance, targetStart) to PlacedMathRank(package, assembly, instance, start)';

COMMENT ON CONSTRAINT "__placed_variable_ref_fk_package_assembly_root_kind_kyz7jvyo7u" ON "qti"."placed_variable_ref" IS 'foreign key PlacedVariableRef(package, assembly, rootKind) to Document(package, path, rootKind)';

COMMENT ON CONSTRAINT "__placed_variable_ref_fk_package_path_start_5xoznrn7wl" ON "qti"."placed_variable_ref" IS 'foreign key PlacedVariableRef(package, path, start, attribute, identifier, kind) to VariableRef(package, path, start, attribute, identifier, kind)';

COMMENT ON CONSTRAINT "__placed_xml_lang_fk_package_path_start_lang_scope_thbyc6qfwx" ON "qti"."placed_xml_lang" IS 'foreign key PlacedXmlLang(package, path, start, lang, scope) to XmlLang(package, path, start, lang, scope)';

COMMENT ON CONSTRAINT "__processing_fk_package_path_start_buuyxfkq34" ON "qti"."processing" IS 'foreign key Processing(package, path, start) to Node(package, path, start)';

COMMENT ON CONSTRAINT "__reference_path_fk_package_target_pch7muxr75" ON "qti"."reference_path" IS 'foreign key ReferencePath(package, target) to Entry(package, path)';

COMMENT ON CONSTRAINT "__resource_document_fk_package_path_root_kind_ejo23fxacl" ON "qti"."resource_document" IS 'foreign key ResourceDocument(package, path, rootKind, documentType) to Document(package, path, rootKind, documentType)';

COMMENT ON CONSTRAINT "__rounding_fk_package_path_start_paqrdg26bu" ON "qti"."rounding" IS 'foreign key Rounding(package, path, start) to Node(package, path, start)';

COMMENT ON CONSTRAINT "__rounding_mode_figures_fk_package_path_start_yewsl3qtgx" ON "qti"."rounding_mode_figures" IS 'foreign key RoundingModeFigures(package, path, start, figures) to RoundingFigures(package, path, start, figures)';

COMMENT ON CONSTRAINT "__sd_decl_fk_package_path_xxx5gjp4e7" ON "qti"."sd_decl" IS 'foreign key SdDecl(package, path) to XmlDecl(package, path)';

COMMENT ON CONSTRAINT "__share_fragment_fk_package_path_assembled_vdozoufbmn" ON "qti"."share_fragment" IS 'foreign key ShareFragment(package, path, assembled) to Document(package, path, assembled)';

COMMENT ON CONSTRAINT "__share_fragment_fk_package_path_id_lwcavdammq" ON "qti"."share_fragment" IS 'foreign key ShareFragment(package, path, id) to IdrefTarget(package, path, id)';

COMMENT ON CONSTRAINT "__share_target_fk_package_path_start_vut3y6yjq2" ON "qti"."share_target" IS 'foreign key ShareTarget(package, path, start) to MathRank(package, path, start)';

COMMENT ON CONSTRAINT "__share_target_fk_package_path_target_start_lyzjcsg3y5" ON "qti"."share_target" IS 'foreign key ShareTarget(package, path, targetStart) to MathRank(package, path, start)';

COMMENT ON CONSTRAINT "__site_fk_package_path_start_children_ancestry_ghdva4523n" ON "qti"."site" IS 'foreign key Site(package, path, start, children, ancestry, governor, kind, nearest, nearestKind, nearestPath, parentKind) to Node(package, path, start, children, ancestry, governor, kind, nearest, nearestKind, nearestPath, parentKind)';

COMMENT ON CONSTRAINT "__site_fk_package_path_start_parent_ixokdifhad" ON "qti"."site" IS 'foreign key Site(package, path, start, parent) to Node(package, path, start, parent)';

COMMENT ON CONSTRAINT "__site_path_fk_package_path_start_kind_molhlyyxr4" ON "qti"."site_path" IS 'foreign key SitePath(package, path, start, kind) to Site(package, path, start, kind)';

COMMENT ON CONSTRAINT "__site_target_fk_package_path_start_an3f4rh7xg" ON "qti"."site_target" IS 'foreign key SiteTarget(package, path, start) to Inclusion(package, path, start)';

COMMENT ON CONSTRAINT "__site_target_fk_package_path_start_ancestry_kind_lpxx2rpzvs" ON "qti"."site_target" IS 'foreign key SiteTarget(package, path, start, ancestry, kind, nearest, nearestKind, parentKind) to Site(package, path, start, ancestry, kind, nearest, nearestKind, parentKind)';

COMMENT ON CONSTRAINT "__site_target_fk_package_path_start_target_pozbyanaff" ON "qti"."site_target" IS 'foreign key SiteTarget(package, path, start, target) to SitePath(package, path, start, target)';

COMMENT ON CONSTRAINT "__ssml_scope_fk_package_path_start_ixilycttqs" ON "qti"."ssml_scope" IS 'foreign key SsmlScope(package, path, start) to Node(package, path, start)';

COMMENT ON CONSTRAINT "__table_header_fk_package_path_start_dhca6a32iq" ON "qti"."table_header" IS 'foreign key TableHeader(package, path, start) to TableScope(package, path, start)';

COMMENT ON CONSTRAINT "__table_header_fk_package_path_start_id_owner_f2pyrytcjb" ON "qti"."table_header" IS 'foreign key TableHeader(package, path, start, id, owner) to DocumentId(package, path, start, id, owner)';

COMMENT ON CONSTRAINT "__table_scope_fk_package_path_start_scalw6ieaw" ON "qti"."table_scope" IS 'foreign key TableScope(package, path, start) to Node(package, path, start)';

COMMENT ON CONSTRAINT "__text_idref_fk_package_path_token_ltwts2zlhw" ON "qti"."text_idref" IS 'foreign key TextIdref(package, path, token) to IdrefTarget(package, path, id)';

COMMENT ON CONSTRAINT "__text_reference_path_fk_package_target_7wuvskqxw6" ON "qti"."text_reference_path" IS 'foreign key TextReferencePath(package, target) to Entry(package, path)';

COMMENT ON CONSTRAINT "__usage_value_fk_package_path_start_text_gskextes7g" ON "qti"."usage_value" IS 'foreign key UsageValue(package, path, start, text) to Node(package, path, start, stringValue)';

COMMENT ON CONSTRAINT "__usage_value_base_type_fk_package_path_start_text_jwjcamzvvt" ON "qti"."usage_value_base_type" IS 'foreign key UsageValueBaseType(package, path, start, text) to Node(package, path, start, stringValue)';

COMMENT ON CONSTRAINT "__xml_decl_fk_package_path_ge2web3hon" ON "qti"."xml_decl" IS 'foreign key XmlDecl(package, path) to Document(package, path)';

COMMENT ON INDEX "qti"."__assembled_catalog_ix_package_path_owner_yng35odexo" IS 'btree index AssembledCatalog(package, path, owner)';

COMMENT ON INDEX "qti"."__attribute_ix_package_cl_3_pk_5_vj_2_u_path_ohpc_6_erni4pmgra" IS 'btree index Attribute(__package_cl3pk5vj2u, __path_ohpc6sozn2, __start_7c7wkvj7tg)';

COMMENT ON INDEX "qti"."__attribute_ix_package_path_start_kind_name_zgakbm2bpc" IS 'btree index Attribute(package, path, start, kind, name)';

COMMENT ON INDEX "qti"."__bound_variable_ix_package_attribute_path_ej2y7oq7v2" IS 'btree index BoundVariable(package, attribute, path)';

COMMENT ON INDEX "qti"."__bound_variable_ix_package_path_attribute_ophjg3fmft" IS 'btree index BoundVariable(package, path, attribute)';

COMMENT ON INDEX "qti"."__candidate_path_ix_package_target_6vqzdz37df" IS 'btree index CandidatePath(package, target)';

COMMENT ON INDEX "qti"."__declaration_cardinality_ix_package_cardinality_ds3iz44lte" IS 'btree index DeclarationCardinality(package, cardinality, path, start)';

COMMENT ON INDEX "qti"."__document_ix_package_document_type_path_enrdo7eu7d" IS 'btree index Document(package, documentType, path)';

COMMENT ON INDEX "qti"."__expression_attribute_ix_package_path_start_base_p7gnpkt44g" IS 'btree index ExpressionAttribute(package, path, start, baseType)';

COMMENT ON INDEX "qti"."__feedback_ref_ix_package_path_attribute_kind_xjsiwrjdus" IS 'btree index FeedbackRef(package, path, attribute, kind)';

COMMENT ON INDEX "qti"."__feedback_ref_ix_package_path_identifier_c2637qwigu" IS 'btree index FeedbackRef(package, path, identifier)';

COMMENT ON INDEX "qti"."__fragment_feedback_ref_ix_package_assembly_a6kpacm74d" IS 'btree index FragmentFeedbackRef(package, assembly, attribute, kind)';

COMMENT ON INDEX "qti"."__fragment_feedback_ref_ix_package_assembly_u3mcgcxa4c" IS 'btree index FragmentFeedbackRef(package, assembly, identifier)';

COMMENT ON INDEX "qti"."__fragment_template_ref_ix_package_assembly_abokw5buiu" IS 'btree index FragmentTemplateRef(package, assembly, attribute, kind)';

COMMENT ON INDEX "qti"."__fragment_template_ref_ix_package_assembly_ed4k4hydnb" IS 'btree index FragmentTemplateRef(package, assembly, identifier)';

COMMENT ON INDEX "qti"."__idref_ix_package_path_token_6fjtwitsfm" IS 'btree index Idref(package, path, token)';

COMMENT ON INDEX "qti"."__instance_ix_package_document_ids_idref_targets_3kuzxyrfyq" IS 'btree index Instance(package, document, ids, idrefTargets, choices, hottexts)';

COMMENT ON INDEX "qti"."__instance_ix_package_document_root_kind_rubmvpymix" IS 'btree index Instance(package, document, rootKind)';

COMMENT ON INDEX "qti"."__interaction_attribute_ix_package_path_root_kind_tqpqhhqjmc" IS 'btree index InteractionAttribute(package, path, rootKind)';

COMMENT ON INDEX "qti"."__node_ix_kind_path_package_start_a4z4zafh2t" IS 'btree index Node(kind, path, package, start)';

COMMENT ON INDEX "qti"."__node_ix_package_kind_parent_kind_path_start_6lowqz2tk6" IS 'btree index Node(package, kind, parentKind, path, start)';

COMMENT ON INDEX "qti"."__node_ix_package_path_at_zjbm4ev3cm" IS 'btree index Node(package, path, at)';

COMMENT ON INDEX "qti"."__node_ix_package_path_kind_parent_elements_parent_gawwpxtins" IS 'btree index Node(package, path, kind, parent, elements, parentKind)';

COMMENT ON INDEX "qti"."__node_ix_package_path_parent_at_3js7ucei5d" IS 'btree index Node(package, path, parent, at)';

COMMENT ON INDEX "qti"."__node_ix_package_path_parent_elements_eiswbbzaxd" IS 'btree index Node(package, path, parent, elements)';

COMMENT ON INDEX "qti"."__node_ix_package_path_parent_parent_kind_p6opm4cre4" IS 'btree index Node(package, path, parent, parentKind)';

COMMENT ON INDEX "qti"."__node_ix_package_path_parent_kind_kind_parent_h6snizktuj" IS 'btree index Node(package, path, parentKind, kind, parent)';

COMMENT ON INDEX "qti"."__placed_binding_ix_package_attribute_path_start_v2fpmoweun" IS 'btree index PlacedBinding(package, attribute, path, start, identifier)';

COMMENT ON INDEX "qti"."__placed_catalog_ref_ix_package_assembly_id_kdjgjrfc3x" IS 'btree index PlacedCatalogRef(package, assembly, id)';

COMMENT ON INDEX "qti"."__placed_choice_ix_package_path_start_identifier_jk6vt35bcx" IS 'btree index PlacedChoice(package, path, start, identifier)';

COMMENT ON INDEX "qti"."__placed_id_ix_package_path_start_id_owner_2mw5p3hbhz" IS 'btree index PlacedId(package, path, start, id, owner)';

COMMENT ON INDEX "qti"."__placed_idref_ix_package_path_id_oqjzqlhu4b" IS 'btree index PlacedIdref(package, path, id)';

COMMENT ON INDEX "qti"."__placed_math_rank_ix_package_assembly_instance_path_xlmxodty27" IS 'btree index PlacedMathRank(package, assembly, instance, path)';

COMMENT ON INDEX "qti"."__placed_math_rank_ix_package_path_start_v42fxoxi7w" IS 'btree index PlacedMathRank(package, path, start)';

COMMENT ON INDEX "qti"."__placed_share_target_ix_package_assembly_instance_iapuqjl64s" IS 'btree index PlacedShareTarget(package, assembly, instance, path, assemblyKind)';

COMMENT ON INDEX "qti"."__placed_share_target_ix_package_assembly_target_k66b7bmx5u" IS 'btree index PlacedShareTarget(package, assembly, targetInstance, target)';

COMMENT ON INDEX "qti"."__placed_variable_ref_ix_assembly_package_resolution_65pde67kdy" IS 'btree index PlacedVariableRef(assembly, package, resolution, attribute, identifier)';

COMMENT ON INDEX "qti"."__placed_variable_ref_ix_package_assembly_resolution_em2t6oiztr" IS 'btree index PlacedVariableRef(package, assembly, resolution, attribute, kind)';

COMMENT ON INDEX "qti"."__placed_variable_ref_ix_package_assembly_root_kind_ox6jmeuv4f" IS 'btree index PlacedVariableRef(package, assembly, rootKind)';

COMMENT ON INDEX "qti"."__placed_variable_ref_ix_package_path_start_2q3l4iq6bv" IS 'btree index PlacedVariableRef(package, path, start, attribute, identifier, kind)';

COMMENT ON INDEX "qti"."__placed_variable_ref_ix_package_resolution_assembly_zzk4vby5a7" IS 'btree index PlacedVariableRef(package, resolution, assembly)';

COMMENT ON INDEX "qti"."__placed_xml_lang_ix_package_scope_path_start_lang_hexmxaqdo6" IS 'btree index PlacedXmlLang(package, scope, path, start, lang)';

COMMENT ON INDEX "qti"."__reference_path_ix_package_target_path_start_37so7ufnoh" IS 'btree index ReferencePath(package, target, path, start)';

COMMENT ON INDEX "qti"."__share_fragment_ix_package_path_id_start_wrbdmu3g4g" IS 'btree index ShareFragment(package, path, id, start)';

COMMENT ON INDEX "qti"."__ssml_attribute_ix_package_path_kind_fragment_value_t6adfhbqvu" IS 'btree index SsmlAttribute(package, path, kind, fragment, value)';

COMMENT ON INDEX "qti"."__ssml_attribute_ix_package_path_kind_refers_start_ydwxciifk5" IS 'btree index SsmlAttribute(package, path, kind, refers, start, value)';

COMMENT ON INDEX "qti"."__template_ref_ix_package_path_attribute_kind_neva2z2ntp" IS 'btree index TemplateRef(package, path, attribute, kind)';

COMMENT ON INDEX "qti"."__template_ref_ix_package_path_identifier_jxx7cppbvw" IS 'btree index TemplateRef(package, path, identifier)';

COMMENT ON INDEX "qti"."__test_token_ix_package_path_name_start_bvn3bvxmfx" IS 'btree index TestToken(package, path, name, start)';

COMMENT ON INDEX "qti"."__text_idref_ix_package_path_token_ktefasloce" IS 'btree index TextIdref(package, path, token)';

COMMENT ON INDEX "qti"."__text_reference_path_ix_package_target_zlcnodi5ns" IS 'btree index TextReferencePath(package, target)';

COMMENT ON INDEX "qti"."__variable_ref_ix_package_path_identifier_attribute_gyojyhppiq" IS 'btree index VariableRef(package, path, identifier, attribute, resolution)';

COMMENT ON INDEX "qti"."__variable_ref_ix_package_path_resolution_start_4nq2w3y2z5" IS 'btree index VariableRef(package, path, resolution, start, attribute)';

COMMENT ON INDEX "qti"."__variable_ref_ix_package_path_start_kind_cneek4rjka" IS 'btree index VariableRef(package, path, start, kind)';

COMMENT ON INDEX "qti"."__xml_lang_ix_package_scope_om564zz2j4" IS 'btree index XmlLang(package, scope)';

COMMENT ON FUNCTION "qti"."__judge_assembled_catalog_7q3v274en6"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of AssembledCatalog and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_candidate_path_yjce52zus2"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of CandidatePath and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_data_ssml_member_57754qfqmz"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of DataSsmlMember and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_srcset_candidate_pf5nnml5oe"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of SrcsetCandidate and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_usage_value_csf5n37al4"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of UsageValue and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_usage_value_base_type_b3cye3njhq"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of UsageValueBaseType and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__capture_assembled_catalog_3z2sfh4yla"() IS 'rule capture of AssembledCatalog';

COMMENT ON FUNCTION "qti"."__capture_attribute_itmluum5pt"() IS 'rule capture of Attribute';

COMMENT ON FUNCTION "qti"."__capture_bound_variable_zkpqqr76nb"() IS 'rule capture of BoundVariable';

COMMENT ON FUNCTION "qti"."__capture_candidate_path_wlkrzbwvw3"() IS 'rule capture of CandidatePath';

COMMENT ON FUNCTION "qti"."__capture_card_support_3a5zrpu2cg"() IS 'rule capture of CardSupport';

COMMENT ON FUNCTION "qti"."__capture_catalog_id_jfqixfjyar"() IS 'rule capture of CatalogId';

COMMENT ON FUNCTION "qti"."__capture_choice_interaction_67uetkh2me"() IS 'rule capture of ChoiceInteraction';

COMMENT ON FUNCTION "qti"."__capture_cn_count_dpun7ibpty"() IS 'rule capture of CnCount';

COMMENT ON FUNCTION "qti"."__capture_context_ref_nebkcb5eus"() IS 'rule capture of ContextRef';

COMMENT ON FUNCTION "qti"."__capture_declaration_26d6p5bgk4"() IS 'rule capture of Declaration';

COMMENT ON FUNCTION "qti"."__capture_declaration_base_type_r4wvqxday5"() IS 'rule capture of DeclarationBaseType';

COMMENT ON FUNCTION "qti"."__capture_declaration_identifier_dw2ya4o7fc"() IS 'rule capture of DeclarationIdentifier';

COMMENT ON FUNCTION "qti"."__capture_default_entry_lshycmbax4"() IS 'rule capture of DefaultEntry';

COMMENT ON FUNCTION "qti"."__capture_document_h46mvgroqo"() IS 'rule capture of Document';

COMMENT ON FUNCTION "qti"."__capture_document_id_eulwoph3m7"() IS 'rule capture of DocumentId';

COMMENT ON FUNCTION "qti"."__capture_element_type_6iss5rizj2"() IS 'rule capture of ElementType';

COMMENT ON FUNCTION "qti"."__capture_expression_attribute_rkcc5rpnyr"() IS 'rule capture of ExpressionAttribute';

COMMENT ON FUNCTION "qti"."__capture_feedback_ref_iuekmjyn2k"() IS 'rule capture of FeedbackRef';

COMMENT ON FUNCTION "qti"."__capture_fragment_context_ref_nuuhlshmzu"() IS 'rule capture of FragmentContextRef';

COMMENT ON FUNCTION "qti"."__capture_fragment_feedback_ref_imuuftmewc"() IS 'rule capture of FragmentFeedbackRef';

COMMENT ON FUNCTION "qti"."__capture_fragment_printed_ref_uennexi5y2"() IS 'rule capture of FragmentPrintedRef';

COMMENT ON FUNCTION "qti"."__capture_fragment_scope_iknfqtw5zm"() IS 'rule capture of FragmentScope';

COMMENT ON FUNCTION "qti"."__capture_fragment_template_ref_4a55ciye7u"() IS 'rule capture of FragmentTemplateRef';

COMMENT ON FUNCTION "qti"."__capture_idref_target_svtn77efc5"() IS 'rule capture of IdrefTarget';

COMMENT ON FUNCTION "qti"."__capture_instance_ts6ly2zo5e"() IS 'rule capture of Instance';

COMMENT ON FUNCTION "qti"."__capture_interaction_attribute_wquigysxiz"() IS 'rule capture of InteractionAttribute';

COMMENT ON FUNCTION "qti"."__capture_literal_cmqvxvs66l"() IS 'rule capture of Literal';

COMMENT ON FUNCTION "qti"."__capture_manifest_id_hhvsbuvofn"() IS 'rule capture of ManifestId';

COMMENT ON FUNCTION "qti"."__capture_mastery_floor_spdmfcjkcz"() IS 'rule capture of MasteryFloor';

COMMENT ON FUNCTION "qti"."__capture_math_align_group_rm6un5zx6m"() IS 'rule capture of MathAlignGroup';

COMMENT ON FUNCTION "qti"."__capture_math_cn_szq6ag5xrp"() IS 'rule capture of MathCn';

COMMENT ON FUNCTION "qti"."__capture_named_c3oe5awrnw"() IS 'rule capture of Named';

COMMENT ON FUNCTION "qti"."__capture_node_7sghxk2dxj"() IS 'rule capture of Node';

COMMENT ON FUNCTION "qti"."__capture_open_attribute_zpjedimx7c"() IS 'rule capture of OpenAttribute';

COMMENT ON FUNCTION "qti"."__capture_placed_binding_g6nwtylt4r"() IS 'rule capture of PlacedBinding';

COMMENT ON FUNCTION "qti"."__capture_placed_idref_dxsermopm3"() IS 'rule capture of PlacedIdref';

COMMENT ON FUNCTION "qti"."__capture_placed_share_target_jkejimypix"() IS 'rule capture of PlacedShareTarget';

COMMENT ON FUNCTION "qti"."__capture_placed_variable_ref_c73fg3d4ir"() IS 'rule capture of PlacedVariableRef';

COMMENT ON FUNCTION "qti"."__capture_placed_xml_lang_ra6bvxw7sn"() IS 'rule capture of PlacedXmlLang';

COMMENT ON FUNCTION "qti"."__capture_printed_variable_ref_rkvjy5pcp6"() IS 'rule capture of PrintedVariableRef';

COMMENT ON FUNCTION "qti"."__capture_record_field_s7d4mmfw4a"() IS 'rule capture of RecordField';

COMMENT ON FUNCTION "qti"."__capture_reference_path_a7u42lsr4p"() IS 'rule capture of ReferencePath';

COMMENT ON FUNCTION "qti"."__capture_resource_document_ycparq66g5"() IS 'rule capture of ResourceDocument';

COMMENT ON FUNCTION "qti"."__capture_rounding_figures_x67em2nz6x"() IS 'rule capture of RoundingFigures';

COMMENT ON FUNCTION "qti"."__capture_rounding_mode_figures_np5ekmxxtw"() IS 'rule capture of RoundingModeFigures';

COMMENT ON FUNCTION "qti"."__capture_site_ccrpb262b6"() IS 'rule capture of Site';

COMMENT ON FUNCTION "qti"."__capture_site_path_lod75hbzio"() IS 'rule capture of SitePath';

COMMENT ON FUNCTION "qti"."__capture_site_target_mykxfkm433"() IS 'rule capture of SiteTarget';

COMMENT ON FUNCTION "qti"."__capture_ssml_attribute_rqpsgk5ayv"() IS 'rule capture of SsmlAttribute';

COMMENT ON FUNCTION "qti"."__capture_table_header_tkmxq7wtew"() IS 'rule capture of TableHeader';

COMMENT ON FUNCTION "qti"."__capture_template_ref_dre62in37w"() IS 'rule capture of TemplateRef';

COMMENT ON FUNCTION "qti"."__capture_test_document_vecxfoybw2"() IS 'rule capture of TestDocument';

COMMENT ON FUNCTION "qti"."__capture_test_token_zop3xhfahh"() IS 'rule capture of TestToken';

COMMENT ON FUNCTION "qti"."__capture_text_reference_path_znomqpm3dr"() IS 'rule capture of TextReferencePath';

COMMENT ON FUNCTION "qti"."__capture_usage_value_d4x3vydjzt"() IS 'rule capture of UsageValue';

COMMENT ON FUNCTION "qti"."__capture_usage_value_base_type_a6p2zwmowi"() IS 'rule capture of UsageValueBaseType';

COMMENT ON FUNCTION "qti"."__capture_variable_ref_lckeobxqnf"() IS 'rule capture of VariableRef';

COMMENT ON FUNCTION "qti"."__capture_variable_ref_table_dabbjr7lvm"() IS 'rule capture of VariableRefTable';

COMMENT ON FUNCTION "qti"."__capture_xml_lang_t7y5zrpmlb"() IS 'rule capture of XmlLang';
