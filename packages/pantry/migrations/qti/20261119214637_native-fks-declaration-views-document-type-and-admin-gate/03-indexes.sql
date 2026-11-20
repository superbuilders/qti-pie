-- grizzle: no-transaction

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__cn_count_key_package_path_start_type_gfzp5vminc";

CREATE UNIQUE INDEX CONCURRENTLY "__cn_count_key_package_path_start_type_gfzp5vminc" ON "qti"."cn_count" USING btree ("package", "path", "start", "type");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__document_key_package_path_assembled_rgcicnbedu";

CREATE UNIQUE INDEX CONCURRENTLY "__document_key_package_path_assembled_rgcicnbedu" ON "qti"."document" USING btree ("package", "path", "assembled");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__document_key_package_path_ids_idref_targets_uarcdaz2q7";

CREATE UNIQUE INDEX CONCURRENTLY "__document_key_package_path_ids_idref_targets_uarcdaz2q7" ON "qti"."document" USING btree ("package", "path", "ids", "idref_targets", "choices", "hottexts");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__document_key_package_path_root_kind_nlu75ekokq";

CREATE UNIQUE INDEX CONCURRENTLY "__document_key_package_path_root_kind_nlu75ekokq" ON "qti"."document" USING btree ("package", "path", "root_kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__document_key_package_path_root_kind_document_type_fbvnlbnzgb";

CREATE UNIQUE INDEX CONCURRENTLY "__document_key_package_path_root_kind_document_type_fbvnlbnzgb" ON "qti"."document" USING btree ("package", "path", "root_kind", "document_type");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__document_id_key_package_path_start_id_owner_lcfyvj5sku";

CREATE UNIQUE INDEX CONCURRENTLY "__document_id_key_package_path_start_id_owner_lcfyvj5sku" ON "qti"."document_id" USING btree ("package", "path", "start", "id", "owner");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__expression_key_package_path_start_base_type_z3zrneogcu";

CREATE UNIQUE INDEX CONCURRENTLY "__expression_key_package_path_start_base_type_z3zrneogcu" ON "qti"."expression" USING btree ("package", "path", "start", "base_type");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__instance_key_package_assembly_start_document_go7qfh4bdy";

CREATE UNIQUE INDEX CONCURRENTLY "__instance_key_package_assembly_start_document_go7qfh4bdy" ON "qti"."instance" USING btree ("package", "assembly", "start", "document");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__instance_key_package_assembly_start_document_vigbcn7gg7";

CREATE UNIQUE INDEX CONCURRENTLY "__instance_key_package_assembly_start_document_vigbcn7gg7" ON "qti"."instance" USING btree ("package", "assembly", "start", "document", "assembly_kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__math_align_scope_key_package_path_start_cell_mgyr62ewdn";

CREATE UNIQUE INDEX CONCURRENTLY "__math_align_scope_key_package_path_start_cell_mgyr62ewdn" ON "qti"."math_align_scope" USING btree ("package", "path", "start", "cell");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_key_package_path_start_attributes_governor_ygbuqn7z2g";

CREATE UNIQUE INDEX CONCURRENTLY "__node_key_package_path_start_attributes_governor_ygbuqn7z2g" ON "qti"."node" USING btree ("package", "path", "start", "attributes", "governor", "kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_key_package_path_start_children_ancestry_mhxzt3iftx";

CREATE UNIQUE INDEX CONCURRENTLY "__node_key_package_path_start_children_ancestry_mhxzt3iftx" ON "qti"."node" USING btree ("package", "path", "start", "children", "ancestry", "governor", "kind", "nearest", "nearest_kind", "nearest_path", "parent_kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_key_package_path_start_kind_governor_42fsltrsjy";

CREATE UNIQUE INDEX CONCURRENTLY "__node_key_package_path_start_kind_governor_42fsltrsjy" ON "qti"."node" USING btree ("package", "path", "start", "kind", "governor");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_key_package_path_start_parent_ytuzrwhg3t";

CREATE UNIQUE INDEX CONCURRENTLY "__node_key_package_path_start_parent_ytuzrwhg3t" ON "qti"."node" USING btree ("package", "path", "start", "parent");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_key_package_path_start_string_value_jnzgtez4u3";

CREATE UNIQUE INDEX CONCURRENTLY "__node_key_package_path_start_string_value_jnzgtez4u3" ON "qti"."node" USING btree ("package", "path", "start", "string_value");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__normal_minimum_key_package_path_start_lexical_3iikzrqj5b";

CREATE UNIQUE INDEX CONCURRENTLY "__normal_minimum_key_package_path_start_lexical_3iikzrqj5b" ON "qti"."normal_minimum" USING btree ("package", "path", "start", "lexical");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__rounding_figures_key_package_path_start_figures_2dnsrgekuj";

CREATE UNIQUE INDEX CONCURRENTLY "__rounding_figures_key_package_path_start_figures_2dnsrgekuj" ON "qti"."rounding_figures" USING btree ("package", "path", "start", "figures");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__site_key_package_path_start_ancestry_kind_nearest_ap2yfi7b7f";

CREATE UNIQUE INDEX CONCURRENTLY "__site_key_package_path_start_ancestry_kind_nearest_ap2yfi7b7f" ON "qti"."site" USING btree ("package", "path", "start", "ancestry", "kind", "nearest", "nearest_kind", "parent_kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__site_key_package_path_start_kind_s6ijpbztua";

CREATE UNIQUE INDEX CONCURRENTLY "__site_key_package_path_start_kind_s6ijpbztua" ON "qti"."site" USING btree ("package", "path", "start", "kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__site_path_key_package_path_start_target_s26hafrpua";

CREATE UNIQUE INDEX CONCURRENTLY "__site_path_key_package_path_start_target_s26hafrpua" ON "qti"."site_path" USING btree ("package", "path", "start", "target");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__site_target_key_package_path_start_parent_kind_cu6n5wnlhm";

CREATE UNIQUE INDEX CONCURRENTLY "__site_target_key_package_path_start_parent_kind_cu6n5wnlhm" ON "qti"."site_target" USING btree ("package", "path", "start", "parent_kind", "places", "target_root", "splices");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__test_document_key_package_path_instances_sites_le7ie5jsz4";

CREATE UNIQUE INDEX CONCURRENTLY "__test_document_key_package_path_instances_sites_le7ie5jsz4" ON "qti"."test_document" USING btree ("package", "path", "instances", "sites");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__variable_ref_key_package_path_start_attribute_unvxdwrr3e";

CREATE UNIQUE INDEX CONCURRENTLY "__variable_ref_key_package_path_start_attribute_unvxdwrr3e" ON "qti"."variable_ref" USING btree ("package", "path", "start", "attribute", "identifier", "kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__xml_lang_key_package_path_start_lang_scope_po5svm23ij";

CREATE UNIQUE INDEX CONCURRENTLY "__xml_lang_key_package_path_start_lang_scope_po5svm23ij" ON "qti"."xml_lang" USING btree ("package", "path", "start", "lang", "scope");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__assembled_catalog_ix_package_path_owner_yng35odexo";

CREATE INDEX CONCURRENTLY "__assembled_catalog_ix_package_path_owner_yng35odexo" ON "qti"."assembled_catalog" USING btree ("package", "path", "owner");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_ix_package_cl_3_pk_5_vj_2_u_path_ohpc_6_erni4pmgra";

CREATE INDEX CONCURRENTLY "__attribute_ix_package_cl_3_pk_5_vj_2_u_path_ohpc_6_erni4pmgra" ON "qti"."attribute" USING btree ("__package_cl3pk5vj2u", "__path_ohpc6sozn2", "__start_7c7wkvj7tg");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_ix_package_path_start_kind_name_zgakbm2bpc";

CREATE INDEX CONCURRENTLY "__attribute_ix_package_path_start_kind_name_zgakbm2bpc" ON "qti"."attribute" USING btree ("package", "path", "start", "kind", "name");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__bound_variable_ix_package_attribute_path_ej2y7oq7v2";

CREATE INDEX CONCURRENTLY "__bound_variable_ix_package_attribute_path_ej2y7oq7v2" ON "qti"."bound_variable" USING btree ("package", "attribute", "path");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__bound_variable_ix_package_path_attribute_ophjg3fmft";

CREATE INDEX CONCURRENTLY "__bound_variable_ix_package_path_attribute_ophjg3fmft" ON "qti"."bound_variable" USING btree ("package", "path", "attribute");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__candidate_path_ix_package_target_6vqzdz37df";

CREATE INDEX CONCURRENTLY "__candidate_path_ix_package_target_6vqzdz37df" ON "qti"."candidate_path" USING btree ("package", "target");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__declaration_cardinality_ix_package_cardinality_ds3iz44lte";

CREATE INDEX CONCURRENTLY "__declaration_cardinality_ix_package_cardinality_ds3iz44lte" ON "qti"."declaration_cardinality" USING btree ("package", "cardinality", "path", "start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__document_ix_package_document_type_path_enrdo7eu7d";

CREATE INDEX CONCURRENTLY "__document_ix_package_document_type_path_enrdo7eu7d" ON "qti"."document" USING btree ("package", "document_type", "path");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__expression_attribute_ix_package_path_start_base_p7gnpkt44g";

CREATE INDEX CONCURRENTLY "__expression_attribute_ix_package_path_start_base_p7gnpkt44g" ON "qti"."expression_attribute" USING btree ("package", "path", "start", "base_type");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__feedback_ref_ix_package_path_attribute_kind_xjsiwrjdus";

CREATE INDEX CONCURRENTLY "__feedback_ref_ix_package_path_attribute_kind_xjsiwrjdus" ON "qti"."feedback_ref" USING btree ("package", "path", "attribute", "kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__feedback_ref_ix_package_path_identifier_c2637qwigu";

CREATE INDEX CONCURRENTLY "__feedback_ref_ix_package_path_identifier_c2637qwigu" ON "qti"."feedback_ref" USING btree ("package", "path", "identifier");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__fragment_feedback_ref_ix_package_assembly_a6kpacm74d";

CREATE INDEX CONCURRENTLY "__fragment_feedback_ref_ix_package_assembly_a6kpacm74d" ON "qti"."fragment_feedback_ref" USING btree ("package", "assembly", "attribute", "kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__fragment_feedback_ref_ix_package_assembly_u3mcgcxa4c";

CREATE INDEX CONCURRENTLY "__fragment_feedback_ref_ix_package_assembly_u3mcgcxa4c" ON "qti"."fragment_feedback_ref" USING btree ("package", "assembly", "identifier");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__fragment_template_ref_ix_package_assembly_abokw5buiu";

CREATE INDEX CONCURRENTLY "__fragment_template_ref_ix_package_assembly_abokw5buiu" ON "qti"."fragment_template_ref" USING btree ("package", "assembly", "attribute", "kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__fragment_template_ref_ix_package_assembly_ed4k4hydnb";

CREATE INDEX CONCURRENTLY "__fragment_template_ref_ix_package_assembly_ed4k4hydnb" ON "qti"."fragment_template_ref" USING btree ("package", "assembly", "identifier");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__idref_ix_package_path_token_6fjtwitsfm";

CREATE INDEX CONCURRENTLY "__idref_ix_package_path_token_6fjtwitsfm" ON "qti"."idref" USING btree ("package", "path", "token");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__instance_ix_package_document_ids_idref_targets_3kuzxyrfyq";

CREATE INDEX CONCURRENTLY "__instance_ix_package_document_ids_idref_targets_3kuzxyrfyq" ON "qti"."instance" USING btree ("package", "document", "ids", "idref_targets", "choices", "hottexts");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__instance_ix_package_document_root_kind_rubmvpymix";

CREATE INDEX CONCURRENTLY "__instance_ix_package_document_root_kind_rubmvpymix" ON "qti"."instance" USING btree ("package", "document", "root_kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__interaction_attribute_ix_package_path_root_kind_tqpqhhqjmc";

CREATE INDEX CONCURRENTLY "__interaction_attribute_ix_package_path_root_kind_tqpqhhqjmc" ON "qti"."interaction_attribute" USING btree ("package", "path", "root_kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_kind_path_package_start_a4z4zafh2t";

CREATE INDEX CONCURRENTLY "__node_ix_kind_path_package_start_a4z4zafh2t" ON "qti"."node" USING btree ("kind", "path", "package", "start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_kind_parent_kind_path_start_6lowqz2tk6";

CREATE INDEX CONCURRENTLY "__node_ix_package_kind_parent_kind_path_start_6lowqz2tk6" ON "qti"."node" USING btree ("package", "kind", "parent_kind", "path", "start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_path_at_zjbm4ev3cm";

CREATE INDEX CONCURRENTLY "__node_ix_package_path_at_zjbm4ev3cm" ON "qti"."node" USING btree ("package", "path", "at");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_path_kind_parent_elements_parent_gawwpxtins";

CREATE INDEX CONCURRENTLY "__node_ix_package_path_kind_parent_elements_parent_gawwpxtins" ON "qti"."node" USING btree ("package", "path", "kind", "parent", "elements", "parent_kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_path_parent_at_3js7ucei5d";

CREATE INDEX CONCURRENTLY "__node_ix_package_path_parent_at_3js7ucei5d" ON "qti"."node" USING btree ("package", "path", "parent", "at");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_path_parent_elements_eiswbbzaxd";

CREATE INDEX CONCURRENTLY "__node_ix_package_path_parent_elements_eiswbbzaxd" ON "qti"."node" USING btree ("package", "path", "parent", "elements");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_path_parent_parent_kind_p6opm4cre4";

CREATE INDEX CONCURRENTLY "__node_ix_package_path_parent_parent_kind_p6opm4cre4" ON "qti"."node" USING btree ("package", "path", "parent", "parent_kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_path_parent_kind_kind_parent_h6snizktuj";

CREATE INDEX CONCURRENTLY "__node_ix_package_path_parent_kind_kind_parent_h6snizktuj" ON "qti"."node" USING btree ("package", "path", "parent_kind", "kind", "parent");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_binding_ix_package_attribute_path_start_v2fpmoweun";

CREATE INDEX CONCURRENTLY "__placed_binding_ix_package_attribute_path_start_v2fpmoweun" ON "qti"."placed_binding" USING btree ("package", "attribute", "path", "start", "identifier");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_catalog_ref_ix_package_assembly_id_kdjgjrfc3x";

CREATE INDEX CONCURRENTLY "__placed_catalog_ref_ix_package_assembly_id_kdjgjrfc3x" ON "qti"."placed_catalog_ref" USING btree ("package", "assembly", "id");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_choice_ix_package_path_start_identifier_jk6vt35bcx";

CREATE INDEX CONCURRENTLY "__placed_choice_ix_package_path_start_identifier_jk6vt35bcx" ON "qti"."placed_choice" USING btree ("package", "path", "start", "identifier");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_id_ix_package_path_start_id_owner_2mw5p3hbhz";

CREATE INDEX CONCURRENTLY "__placed_id_ix_package_path_start_id_owner_2mw5p3hbhz" ON "qti"."placed_id" USING btree ("package", "path", "start", "id", "owner");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_idref_ix_package_path_id_oqjzqlhu4b";

CREATE INDEX CONCURRENTLY "__placed_idref_ix_package_path_id_oqjzqlhu4b" ON "qti"."placed_idref" USING btree ("package", "path", "id");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_math_rank_ix_package_assembly_instance_path_xlmxodty27";

CREATE INDEX CONCURRENTLY "__placed_math_rank_ix_package_assembly_instance_path_xlmxodty27" ON "qti"."placed_math_rank" USING btree ("package", "assembly", "instance", "path");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_math_rank_ix_package_path_start_v42fxoxi7w";

CREATE INDEX CONCURRENTLY "__placed_math_rank_ix_package_path_start_v42fxoxi7w" ON "qti"."placed_math_rank" USING btree ("package", "path", "start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_share_target_ix_package_assembly_instance_iapuqjl64s";

CREATE INDEX CONCURRENTLY "__placed_share_target_ix_package_assembly_instance_iapuqjl64s" ON "qti"."placed_share_target" USING btree ("package", "assembly", "instance", "path", "assembly_kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_share_target_ix_package_assembly_target_k66b7bmx5u";

CREATE INDEX CONCURRENTLY "__placed_share_target_ix_package_assembly_target_k66b7bmx5u" ON "qti"."placed_share_target" USING btree ("package", "assembly", "target_instance", "target");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_variable_ref_ix_assembly_package_resolution_65pde67kdy";

CREATE INDEX CONCURRENTLY "__placed_variable_ref_ix_assembly_package_resolution_65pde67kdy" ON "qti"."placed_variable_ref" USING btree ("assembly", "package", "resolution", "attribute", "identifier");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_variable_ref_ix_package_assembly_resolution_em2t6oiztr";

CREATE INDEX CONCURRENTLY "__placed_variable_ref_ix_package_assembly_resolution_em2t6oiztr" ON "qti"."placed_variable_ref" USING btree ("package", "assembly", "resolution", "attribute", "kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_variable_ref_ix_package_assembly_root_kind_ox6jmeuv4f";

CREATE INDEX CONCURRENTLY "__placed_variable_ref_ix_package_assembly_root_kind_ox6jmeuv4f" ON "qti"."placed_variable_ref" USING btree ("package", "assembly", "root_kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_variable_ref_ix_package_path_start_2q3l4iq6bv";

CREATE INDEX CONCURRENTLY "__placed_variable_ref_ix_package_path_start_2q3l4iq6bv" ON "qti"."placed_variable_ref" USING btree ("package", "path", "start", "attribute", "identifier", "kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_variable_ref_ix_package_resolution_assembly_zzk4vby5a7";

CREATE INDEX CONCURRENTLY "__placed_variable_ref_ix_package_resolution_assembly_zzk4vby5a7" ON "qti"."placed_variable_ref" USING btree ("package", "resolution", "assembly");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_xml_lang_ix_package_scope_path_start_lang_hexmxaqdo6";

CREATE INDEX CONCURRENTLY "__placed_xml_lang_ix_package_scope_path_start_lang_hexmxaqdo6" ON "qti"."placed_xml_lang" USING btree ("package", "scope", "path", "start", "lang");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__reference_path_ix_package_target_path_start_37so7ufnoh";

CREATE INDEX CONCURRENTLY "__reference_path_ix_package_target_path_start_37so7ufnoh" ON "qti"."reference_path" USING btree ("package", "target", "path", "start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__share_fragment_ix_package_path_id_start_wrbdmu3g4g";

CREATE INDEX CONCURRENTLY "__share_fragment_ix_package_path_id_start_wrbdmu3g4g" ON "qti"."share_fragment" USING btree ("package", "path", "id", "start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__ssml_attribute_ix_package_path_kind_fragment_value_t6adfhbqvu";

CREATE INDEX CONCURRENTLY "__ssml_attribute_ix_package_path_kind_fragment_value_t6adfhbqvu" ON "qti"."ssml_attribute" USING btree ("package", "path", "kind", "fragment", "value");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__ssml_attribute_ix_package_path_kind_refers_start_ydwxciifk5";

CREATE INDEX CONCURRENTLY "__ssml_attribute_ix_package_path_kind_refers_start_ydwxciifk5" ON "qti"."ssml_attribute" USING btree ("package", "path", "kind", "refers", "start", "value");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__template_ref_ix_package_path_attribute_kind_neva2z2ntp";

CREATE INDEX CONCURRENTLY "__template_ref_ix_package_path_attribute_kind_neva2z2ntp" ON "qti"."template_ref" USING btree ("package", "path", "attribute", "kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__template_ref_ix_package_path_identifier_jxx7cppbvw";

CREATE INDEX CONCURRENTLY "__template_ref_ix_package_path_identifier_jxx7cppbvw" ON "qti"."template_ref" USING btree ("package", "path", "identifier");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__test_token_ix_package_path_name_start_bvn3bvxmfx";

CREATE INDEX CONCURRENTLY "__test_token_ix_package_path_name_start_bvn3bvxmfx" ON "qti"."test_token" USING btree ("package", "path", "name", "start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__text_idref_ix_package_path_token_ktefasloce";

CREATE INDEX CONCURRENTLY "__text_idref_ix_package_path_token_ktefasloce" ON "qti"."text_idref" USING btree ("package", "path", "token");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__text_reference_path_ix_package_target_zlcnodi5ns";

CREATE INDEX CONCURRENTLY "__text_reference_path_ix_package_target_zlcnodi5ns" ON "qti"."text_reference_path" USING btree ("package", "target");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__variable_ref_ix_package_path_identifier_attribute_gyojyhppiq";

CREATE INDEX CONCURRENTLY "__variable_ref_ix_package_path_identifier_attribute_gyojyhppiq" ON "qti"."variable_ref" USING btree ("package", "path", "identifier", "attribute", "resolution");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__variable_ref_ix_package_path_resolution_start_4nq2w3y2z5";

CREATE INDEX CONCURRENTLY "__variable_ref_ix_package_path_resolution_start_4nq2w3y2z5" ON "qti"."variable_ref" USING btree ("package", "path", "resolution", "start", "attribute");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__variable_ref_ix_package_path_start_kind_cneek4rjka";

CREATE INDEX CONCURRENTLY "__variable_ref_ix_package_path_start_kind_cneek4rjka" ON "qti"."variable_ref" USING btree ("package", "path", "start", "kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__xml_lang_ix_package_scope_om564zz2j4";

CREATE INDEX CONCURRENTLY "__xml_lang_ix_package_scope_om564zz2j4" ON "qti"."xml_lang" USING btree ("package", "scope");
