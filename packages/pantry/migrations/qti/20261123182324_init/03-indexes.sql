CREATE INDEX "__assembled_catalog_ix_package_path_owner_yng35odexo" ON "qti"."assembled_catalog" USING btree ("package", "path", "owner");

CREATE INDEX "__attribute_ix_package_a_4_p_2_u_7_pv_6_l_path_start_2cajllfvyt" ON "qti"."attribute" USING btree ("__package_a4p2u7pv6l", "path", "start", "name");

CREATE INDEX "__attribute_ix_package_kind_name_start_path_jmvc4xtkis" ON "qti"."attribute" USING btree ("package", "kind", "name", "start", "path");

CREATE INDEX "__attribute_ix_package_name_path_start_2urjynczwy" ON "qti"."attribute" USING btree ("package", "name", "path", "start");

CREATE INDEX "__attribute_ix_package_path_name_kind_value_digest_nuvl7i75vd" ON "qti"."attribute" USING btree ("package", "path", "name", "kind", "value_digest");

CREATE INDEX "__attribute_ix_package_path_start_kind_name_dh3aepikkd" ON "qti"."attribute" USING btree ("package", "path", "start", "kind", "name");

CREATE INDEX "__bound_variable_ix_package_pyofn_3_cand_path_start_msbzzspyze" ON "qti"."bound_variable" USING btree ("__package_pyofn3cand", "path", "start");

CREATE INDEX "__bound_variable_ix_package_attribute_path_ej2y7oq7v2" ON "qti"."bound_variable" USING btree ("package", "attribute", "path");

CREATE INDEX "__bound_variable_ix_package_path_adaptive_khkcbwhnkh" ON "qti"."bound_variable" USING btree ("package", "path", "adaptive");

CREATE INDEX "__bound_variable_ix_package_path_attribute_ophjg3fmft" ON "qti"."bound_variable" USING btree ("package", "path", "attribute");

CREATE INDEX "__candidate_path_ix_package_target_6vqzdz37df" ON "qti"."candidate_path" USING btree ("package", "target");

CREATE INDEX "__choice_ix_package_path_identifier_start_v4shno6kmh" ON "qti"."choice" USING btree ("package", "path", "identifier", "start");

CREATE INDEX "__data_ssml_property_ix_package_path_start_member_i4quh7scqt" ON "qti"."data_ssml_property" USING btree ("package", "path", "start", "member", "member_name_digest");

CREATE INDEX "__data_ssml_property_ix_package_path_start_member_22jp6hx6so" ON "qti"."data_ssml_property" USING btree ("package", "path", "start", "member", "name_digest");

CREATE INDEX "__document_ix_package_assembled_path_6hx6cticyt" ON "qti"."document" USING btree ("package", "assembled", "path");

CREATE INDEX "__document_id_ix_package_path_admitted_owner_jp55imcxjo" ON "qti"."document_id" USING btree ("package", "path", "admitted", "owner");

CREATE INDEX "__file_outside_ix_package_path_target_digest_s7syn3lct6" ON "qti"."file_outside" USING btree ("package", "path", "target_digest");

CREATE INDEX "__file_path_ix_package_path_target_km6qcynmsz" ON "qti"."file_path" USING btree ("package", "path", "target");

CREATE INDEX "__file_path_ix_package_target_path_el6yhgey5m" ON "qti"."file_path" USING btree ("package", "target", "path");

CREATE INDEX "__fragment_context_ref_ix_package_path_start_nmvpv5crfw" ON "qti"."fragment_context_ref" USING btree ("package", "path", "start", "attribute", "kind", "identifier");

CREATE INDEX "__fragment_feedback_ref_ix_package_path_start_eodgr2j77q" ON "qti"."fragment_feedback_ref" USING btree ("package", "path", "start", "attribute", "kind", "identifier");

CREATE INDEX "__fragment_printed_ref_ix_package_path_start_icd2lzsmbv" ON "qti"."fragment_printed_ref" USING btree ("package", "path", "start", "attribute", "kind", "identifier");

CREATE INDEX "__fragment_scope_ix_package_document_feedbacks_txlrykzdtc" ON "qti"."fragment_scope" USING btree ("package", "document", "feedbacks", "prints", "templates", "contexts");

CREATE INDEX "__fragment_template_ref_ix_package_path_start_w5snz3je32" ON "qti"."fragment_template_ref" USING btree ("package", "path", "start", "attribute", "kind", "identifier");

CREATE INDEX "__idref_ix_package_name_path_nielih3bso" ON "qti"."idref" USING btree ("package", "name", "path");

CREATE INDEX "__idref_ix_package_path_name_ckzbix4lpw" ON "qti"."idref" USING btree ("package", "path", "name");

CREATE INDEX "__idref_ix_package_path_token_digest_32nufrmpv6" ON "qti"."idref" USING btree ("package", "path", "token_digest");

CREATE INDEX "__idref_target_ix_package_path_assembled_4j2motbov2" ON "qti"."idref_target" USING btree ("package", "path", "assembled");

CREATE INDEX "__instance_ix_assembly_assembly_kind_package_start_gnufbb5gu4" ON "qti"."instance" USING btree ("assembly", "assembly_kind", "package", "start");

CREATE INDEX "__instance_ix_package_assembly_assembly_kind_end_6c3k3mjz3l" ON "qti"."instance" USING btree ("package", "assembly", "assembly_kind", "end", "document");

CREATE INDEX "__instance_ix_package_assembly_assembly_kind_end_q7wzhnaz2c" ON "qti"."instance" USING btree ("package", "assembly", "assembly_kind", "end", "parent");

CREATE INDEX "__instance_ix_package_assembly_assembly_kind_parent_i6gt6br7ge" ON "qti"."instance" USING btree ("package", "assembly", "assembly_kind", "parent", "site", "site_document");

CREATE INDEX "__instance_ix_package_assembly_assembly_kind_parent_znncdu42ko" ON "qti"."instance" USING btree ("package", "assembly", "assembly_kind", "parent", "site_document");

CREATE INDEX "__instance_ix_package_assembly_assembly_kind_site_c7f2vpiy27" ON "qti"."instance" USING btree ("package", "assembly", "assembly_kind", "site", "site_document");

CREATE INDEX "__instance_ix_package_assembly_assembly_kind_site_65ivnxs6hw" ON "qti"."instance" USING btree ("package", "assembly", "assembly_kind", "site_document", "document", "site");

CREATE INDEX "__instance_ix_package_assembly_document_start_ggh4saptf3" ON "qti"."instance" USING btree ("package", "assembly", "document", "start");

CREATE INDEX "__instance_ix_package_assembly_kind_assembly_zz7dcr5yl2" ON "qti"."instance" USING btree ("package", "assembly_kind", "assembly", "document", "parent", "site_document", "site");

CREATE INDEX "__instance_ix_package_assembly_kind_document_apug2ak2ps" ON "qti"."instance" USING btree ("package", "assembly_kind", "document", "assembly", "start");

CREATE INDEX "__instance_ix_package_document_ids_idref_targets_3kuzxyrfyq" ON "qti"."instance" USING btree ("package", "document", "ids", "idref_targets", "choices", "hottexts");

CREATE INDEX "__instance_ix_package_document_root_kind_rubmvpymix" ON "qti"."instance" USING btree ("package", "document", "root_kind");

CREATE INDEX "__instance_ix_package_site_document_site_assembly_5ddwbrwco4" ON "qti"."instance" USING btree ("package", "site_document", "site", "assembly_kind");

CREATE INDEX "__instance_ix_package_start_document_assembly_rmwvqsnjiw" ON "qti"."instance" USING btree ("package", "start", "document", "assembly");

CREATE INDEX "__interaction_attribute_ix_package_23_kaj_6_k_72_g_gqsdbb2ba7" ON "qti"."interaction_attribute" USING btree ("__package_23kaj6k72g", "path", "start", "name", "kind", "root_kind");

CREATE INDEX "__interaction_attribute_ix_package_em_5_smlkv_7_y_lxvozf472c" ON "qti"."interaction_attribute" USING btree ("__package_em5smlkv7y", "path", "start", "name", "kind");

CREATE INDEX "__interaction_attribute_ix_package_mh_3_ihjeic_4_qt7rogj5ce" ON "qti"."interaction_attribute" USING btree ("__package_mh3ihjeic4", "path", "start", "name", "kind", "root_kind");

CREATE INDEX "__interaction_attribute_ix_package_ml_42_oesjn_5_6erdbwhr2b" ON "qti"."interaction_attribute" USING btree ("__package_ml42oesjn5", "path", "start", "name", "kind");

CREATE INDEX "__interaction_attribute_ix_package_ph_3_lmj_2_a_3_i_yxarmm2vwu" ON "qti"."interaction_attribute" USING btree ("__package_ph3lmj2a3i", "path", "start", "name", "kind");

CREATE INDEX "__interaction_attribute_ix_package_py_2_hqgnzbf_path_3n54sjiys5" ON "qti"."interaction_attribute" USING btree ("__package_py2hqgnzbf", "path", "start", "name");

CREATE INDEX "__interaction_attribute_ix_package_sl_6_clonewv_path_qbpieanhqd" ON "qti"."interaction_attribute" USING btree ("__package_sl6clonewv", "path", "start", "name", "kind");

CREATE INDEX "__interaction_attribute_ix_package_u_66_bjij_63_r_ehfdjvoodq" ON "qti"."interaction_attribute" USING btree ("__package_u66bjij63r", "path", "start", "name", "kind", "root_kind");

CREATE INDEX "__interaction_attribute_ix_package_u_7_v_2_jd_53_lp_d7oa422xem" ON "qti"."interaction_attribute" USING btree ("__package_u7v2jd53lp", "path", "start", "name");

CREATE INDEX "__interaction_attribute_ix_package_vavgyyjccm_path_4e6557ihz4" ON "qti"."interaction_attribute" USING btree ("__package_vavgyyjccm", "path", "start", "name", "kind", "root_kind");

CREATE INDEX "__interaction_attribute_ix_package_path_name_kind_xlbfjajq5d" ON "qti"."interaction_attribute" USING btree ("package", "path", "name", "kind", "start");

CREATE INDEX "__interaction_attribute_ix_package_path_root_kind_tqpqhhqjmc" ON "qti"."interaction_attribute" USING btree ("package", "path", "root_kind");

CREATE INDEX "__item_ref_document_ix_package_target_x3gzopozhy" ON "qti"."item_ref_document" USING btree ("package", "target");

CREATE INDEX "__item_ref_href_ix_package_target_6kwzgt4wre" ON "qti"."item_ref_href" USING btree ("package", "target");

CREATE INDEX "__label_use_ix_package_path_root_kind_gkglyfua6p" ON "qti"."label_use" USING btree ("package", "path", "root_kind");

CREATE INDEX "__named_ix_package_identifier_poryqrycn2" ON "qti"."named" USING btree ("package", "identifier");

CREATE INDEX "__node_ix_package_kind_parent_kind_element_children_adichcjcn5" ON "qti"."node" USING btree ("package", "kind", "parent_kind", "element_children", "path");

CREATE INDEX "__node_ix_package_parent_kind_path_start_6zgfzdfjgw" ON "qti"."node" USING btree ("package", "parent_kind", "path", "start");

CREATE INDEX "__node_ix_package_path_element_children_kind_parent_st7tbj3vpb" ON "qti"."node" USING btree ("package", "path", "element_children", "kind", "parent_kind");

CREATE INDEX "__node_ix_package_path_end_kind_parent_gyibajsdba" ON "qti"."node" USING btree ("package", "path", "end", "kind", "parent");

CREATE INDEX "__node_ix_package_path_kind_parent_elements_d5l24r3p2o" ON "qti"."node" USING btree ("package", "path", "kind", "parent", "elements");

CREATE INDEX "__node_ix_package_path_kind_parent_kind_elements_joehbu4lt4" ON "qti"."node" USING btree ("package", "path", "kind", "parent_kind", "elements");

CREATE INDEX "__node_ix_package_path_parent_at_3js7ucei5d" ON "qti"."node" USING btree ("package", "path", "parent", "at");

CREATE INDEX "__node_ix_package_path_parent_elements_eiswbbzaxd" ON "qti"."node" USING btree ("package", "path", "parent", "elements");

CREATE INDEX "__node_ix_package_path_parent_parent_kind_p6opm4cre4" ON "qti"."node" USING btree ("package", "path", "parent", "parent_kind");

CREATE INDEX "__node_ix_package_path_parent_kind_kind_parent_h6snizktuj" ON "qti"."node" USING btree ("package", "path", "parent_kind", "kind", "parent");

CREATE INDEX "__node_ix_package_start_kind_path_wfqsgvcv6x" ON "qti"."node" USING btree ("package", "start", "kind", "path");

CREATE INDEX "__numbered_reading_ix_package_assembly_scope_scope_3jdhtpwvdv" ON "qti"."numbered_reading" USING btree ("package", "assembly", "scope", "scope_instance", "scope_path", "variable");

CREATE INDEX "__open_attribute_ix_package_path_start_kind_2umcdya4be" ON "qti"."open_attribute" USING btree ("package", "path", "start", "kind");

CREATE INDEX "__pci_module_form_ix_package_path_element_start_j6pwi6afuc" ON "qti"."pci_module_form" USING btree ("package", "path", "element", "start");

CREATE INDEX "__placed_binding_ix_package_pyofn_3_cand_path_start_xuyitwy3ee" ON "qti"."placed_binding" USING btree ("__package_pyofn3cand", "path", "start");

CREATE INDEX "__placed_binding_ix_package_assembly_adaptive_lv5atayv6x" ON "qti"."placed_binding" USING btree ("package", "assembly", "adaptive");

CREATE INDEX "__placed_binding_ix_package_attribute_path_start_v2fpmoweun" ON "qti"."placed_binding" USING btree ("package", "attribute", "path", "start", "identifier");

CREATE INDEX "__placed_choice_ix_package_assembly_identifier_uhvul24o7s" ON "qti"."placed_choice" USING btree ("package", "assembly", "identifier");

CREATE INDEX "__placed_choice_ix_package_path_start_identifier_jk6vt35bcx" ON "qti"."placed_choice" USING btree ("package", "path", "start", "identifier");

CREATE INDEX "__placed_choice_ix_package_path_start_kind_5miftnmzpk" ON "qti"."placed_choice" USING btree ("package", "path", "start", "kind");

CREATE INDEX "__placed_expression_ix_package_base_type_assembly_qxi577w7ks" ON "qti"."placed_expression" USING btree ("package", "base_type", "assembly", "instance", "path");

CREATE INDEX "__placed_expression_ix_package_path_start_5zxaoolb7y" ON "qti"."placed_expression" USING btree ("package", "path", "start");

CREATE INDEX "__placed_hottext_ix_package_path_start_identifier_svnx5dat5y" ON "qti"."placed_hottext" USING btree ("package", "path", "start", "identifier");

CREATE INDEX "__placed_id_ix_package_assembly_owner_path_instance_c76iqalxom" ON "qti"."placed_id" USING btree ("package", "assembly", "owner", "path", "instance");

CREATE INDEX "__placed_idref_ix_package_path_id_digest_fdq5qztrv7" ON "qti"."placed_idref" USING btree ("package", "path", "id_digest");

CREATE INDEX "__placed_math_rank_ix_package_assembly_instance_path_xlmxodty27" ON "qti"."placed_math_rank" USING btree ("package", "assembly", "instance", "path");

CREATE INDEX "__placed_math_rank_ix_package_path_start_v42fxoxi7w" ON "qti"."placed_math_rank" USING btree ("package", "path", "start");

CREATE INDEX "__placed_share_target_ix_package_assembly_instance_iapuqjl64s" ON "qti"."placed_share_target" USING btree ("package", "assembly", "instance", "path", "assembly_kind");

CREATE INDEX "__placed_share_target_ix_package_assembly_target_k66b7bmx5u" ON "qti"."placed_share_target" USING btree ("package", "assembly", "target_instance", "target");

CREATE INDEX "__placed_share_target_ix_package_assembly_target_fpl23rvteo" ON "qti"."placed_share_target" USING btree ("package", "assembly", "target_instance", "target_start");

CREATE INDEX "__placed_variable_ref_ix_package_assembly_resolution_ymsbodsibl" ON "qti"."placed_variable_ref" USING btree ("package", "assembly", "resolution", "attribute", "identifier");

CREATE INDEX "__placed_variable_ref_ix_package_assembly_root_kind_ox6jmeuv4f" ON "qti"."placed_variable_ref" USING btree ("package", "assembly", "root_kind");

CREATE INDEX "__placed_variable_ref_ix_package_attribute_3vpsdcsq4l" ON "qti"."placed_variable_ref" USING btree ("package", "attribute", "resolution", "path", "start", "assembly");

CREATE INDEX "__placed_variable_ref_ix_package_resolution_assembly_zzk4vby5a7" ON "qti"."placed_variable_ref" USING btree ("package", "resolution", "assembly");

CREATE INDEX "__reference_path_ix_package_kind_name_path_target_xuquekdgd7" ON "qti"."reference_path" USING btree ("package", "kind", "name", "path", "target");

CREATE INDEX "__reference_path_ix_package_target_path_start_37so7ufnoh" ON "qti"."reference_path" USING btree ("package", "target", "path", "start");

CREATE INDEX "__resource_href_ix_package_path_scope_start_rkpqugj43q" ON "qti"."resource_href" USING btree ("package", "path", "scope", "start");

CREATE INDEX "__resource_href_path_ix_package_target_w6il6mi33e" ON "qti"."resource_href_path" USING btree ("package", "target");

CREATE INDEX "__share_fragment_ix_package_path_assembled_start_njqql36dxw" ON "qti"."share_fragment" USING btree ("package", "path", "assembled", "start");

CREATE INDEX "__share_fragment_ix_package_path_id_digest_nauvwqgz7q" ON "qti"."share_fragment" USING btree ("package", "path", "id_digest");

CREATE INDEX "__share_target_ix_package_path_target_start_vj2n53ubgi" ON "qti"."share_target" USING btree ("package", "path", "target_start");

CREATE INDEX "__site_ix_package_external_kind_path_start_z6n3kpl2eq" ON "qti"."site" USING btree ("package", "external", "kind", "path", "start");

CREATE INDEX "__site_path_ix_package_entry_path_start_lzli5pxkzl" ON "qti"."site_path" USING btree ("package", "entry", "path", "start");

CREATE INDEX "__site_path_ix_package_path_entry_kind_start_qbgtz4urvv" ON "qti"."site_path" USING btree ("package", "path", "entry", "kind", "start");

CREATE INDEX "__site_target_ix_package_target_splices_ufrlh7idlc" ON "qti"."site_target" USING btree ("package", "target", "splices");

CREATE INDEX "__table_header_ix_package_path_table_nl5r7jdshk" ON "qti"."table_header" USING btree ("package", "path", "table");

CREATE INDEX "__text_idref_ix_package_path_token_digest_6rnu6d6nqb" ON "qti"."text_idref" USING btree ("package", "path", "token_digest");

CREATE INDEX "__text_reference_path_ix_package_target_zlcnodi5ns" ON "qti"."text_reference_path" USING btree ("package", "target");

CREATE INDEX "__variable_ref_ix_package_path_attribute_identifier_fhzai5nn5j" ON "qti"."variable_ref" USING btree ("package", "path", "attribute", "identifier");

CREATE INDEX "__variable_ref_ix_package_path_identifier_start_xf557pdhpw" ON "qti"."variable_ref" USING btree ("package", "path", "identifier", "start");

CREATE INDEX "__variable_ref_ix_package_path_root_kind_merm4oeh73" ON "qti"."variable_ref" USING btree ("package", "path", "root_kind");

CREATE STATISTICS "qti"."__attribute_stats_package_path_start_uo6glmb56i" (ndistinct, dependencies, mcv) ON "package", "path", "start" FROM "qti"."attribute";

CREATE STATISTICS "qti"."__attribute_entity_stats_name_package_path_start_7caqvjbetk" (ndistinct, dependencies, mcv) ON "name", "package", "path", "start" FROM "qti"."attribute_entity";

CREATE STATISTICS "qti"."__namespace_stats_package_path_start_gydqlm2xgj" (ndistinct, dependencies, mcv) ON "package", "path", "start" FROM "qti"."namespace";

CREATE STATISTICS "qti"."__node_stats_package_path_xnpndnqkuf" (ndistinct, dependencies, mcv) ON "package", "path" FROM "qti"."node";

CREATE STATISTICS "qti"."__open_attribute_stats_package_path_start_z3huhl5634" (ndistinct, dependencies, mcv) ON "package", "path", "start" FROM "qti"."open_attribute";

CREATE STATISTICS "qti"."__open_attribute_entity_stats_at_package_path_start_lyjoz6crlz" (ndistinct, dependencies, mcv) ON "at", "package", "path", "start" FROM "qti"."open_attribute_entity";
