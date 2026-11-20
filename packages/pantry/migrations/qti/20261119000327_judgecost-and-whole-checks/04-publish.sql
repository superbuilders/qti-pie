ALTER TABLE "qti"."count_bound" ADD CONSTRAINT "__count_bound_key_package_path_start_max_name_max_rfxpdaee75" UNIQUE USING INDEX "__count_bound_key_package_path_start_max_name_max_rfxpdaee75";

ALTER TABLE "qti"."count_bound" ADD CONSTRAINT "__count_bound_key_package_path_start_min_name_min_hq6llxrvfm" UNIQUE USING INDEX "__count_bound_key_package_path_start_min_name_min_hq6llxrvfm";

ALTER TABLE "qti"."node" ADD CONSTRAINT "__node_key_package_path_start_children_ancestry_biyk2qaqax" UNIQUE USING INDEX "__node_key_package_path_start_children_ancestry_biyk2qaqax";

ALTER TABLE "qti"."binding_name" ALTER CONSTRAINT "__binding_name_fk_package_path_copy_bindings_sb6am7l6sh" NOT DEFERRABLE;

ALTER TABLE "qti"."bound_variable" ALTER CONSTRAINT "__bound_variable_fk_package_path_adaptive_o67xwxciik" NOT DEFERRABLE;

ALTER TABLE "qti"."catalog_ref" ALTER CONSTRAINT "__catalog_ref_fk_package_path_token_copy_carriers_xpl3kiyzmw" NOT DEFERRABLE;

ALTER TABLE "qti"."choice" ALTER CONSTRAINT "__choice_fk_package_path_copy_choices_qmg62rrt4k" NOT DEFERRABLE;

ALTER TABLE "qti"."choice_interaction" ALTER CONSTRAINT "__choice_interaction_fk_package_interaction_path_ans6kwjguu" NOT DEFERRABLE;

ALTER TABLE "qti"."context_ref_declaration" ALTER CONSTRAINT "__context_ref_declaration_fk_package_path_start_dfxvmjwwwn" NOT DEFERRABLE;

ALTER TABLE "qti"."declaration_base_type" ALTER CONSTRAINT "__declaration_base_type_fk_package_path_start_copy_q3i6nnowme" NOT DEFERRABLE;

ALTER TABLE "qti"."declaration_cardinality" ALTER CONSTRAINT "__declaration_cardinality_fk_package_path_start_copy_qyfsjqwwet" NOT DEFERRABLE;

ALTER TABLE "qti"."document_id" ALTER CONSTRAINT "__document_id_fk_package_path_copy_ids_gen3ajva7g" NOT DEFERRABLE;

ALTER TABLE "qti"."feedback_ref_declaration" ALTER CONSTRAINT "__feedback_ref_declaration_fk_package_path_start_4t4r2qin7a" NOT DEFERRABLE;

ALTER TABLE "qti"."fragment_context_ref_declaration" ALTER CONSTRAINT "__fragment_context_ref_declaration_fk_package_ghow6fre6a" NOT DEFERRABLE;

ALTER TABLE "qti"."fragment_feedback_ref_declaration" ALTER CONSTRAINT "__fragment_feedback_ref_declaration_fk_package_mibic3bfkf" NOT DEFERRABLE;

ALTER TABLE "qti"."fragment_printed_ref_declaration" ALTER CONSTRAINT "__fragment_printed_ref_declaration_fk_package_7ipw3r3n5u" NOT DEFERRABLE;

ALTER TABLE "qti"."fragment_template_ref_declaration" ALTER CONSTRAINT "__fragment_template_ref_declaration_fk_package_p3jvanz3fl" NOT DEFERRABLE;

ALTER TABLE "qti"."hottext" ALTER CONSTRAINT "__hottext_fk_package_path_copy_hottexts_nqhkueuyyr" NOT DEFERRABLE;

ALTER TABLE "qti"."idref_target" ALTER CONSTRAINT "__idref_target_fk_package_path_copy_idref_targets_gqcp4g6ar3" NOT DEFERRABLE;

ALTER TABLE "qti"."interaction_attribute" ALTER CONSTRAINT "__interaction_attribute_fk_package_path_start_name_j3fb3hvztv" NOT DEFERRABLE;

ALTER TABLE "qti"."interaction_attribute" ALTER CONSTRAINT "__interaction_attribute_fk_package_path_start_name_qoj5lcylg4" NOT DEFERRABLE;

ALTER TABLE "qti"."interaction_attribute" ALTER CONSTRAINT "__interaction_attribute_fk_package_path_start_name_qf2gynwiko" NOT DEFERRABLE;

ALTER TABLE "qti"."interaction_attribute" ALTER CONSTRAINT "__interaction_attribute_fk_package_path_start_name_rstxdcgc75" NOT DEFERRABLE;

ALTER TABLE "qti"."interaction_attribute" ALTER CONSTRAINT "__interaction_attribute_fk_package_path_start_name_jgxh7cgvat" NOT DEFERRABLE;

ALTER TABLE "qti"."mastery_ceiling" ALTER CONSTRAINT "__mastery_ceiling_fk_package_path_start_mastery_7hmh7lzlf2" NOT DEFERRABLE;

ALTER TABLE "qti"."mastery_ceiling" ALTER CONSTRAINT "__mastery_ceiling_fk_package_path_start_normal_64yx7tyloi" NOT DEFERRABLE;

ALTER TABLE "qti"."mastery_floor" ALTER CONSTRAINT "__mastery_floor_fk_package_path_start_mastery_value_btybmwt6gw" NOT DEFERRABLE;

ALTER TABLE "qti"."mastery_value" ALTER CONSTRAINT "__mastery_value_fk_package_path_start_copy_masteries_yhz53wspsd" NOT DEFERRABLE;

ALTER TABLE "qti"."named" ALTER CONSTRAINT "__named_fk_package_path_copy_names_o3lmd6xu5s" NOT DEFERRABLE;

ALTER TABLE "qti"."normal_maximum" ALTER CONSTRAINT "__normal_maximum_fk_package_path_start_copy_maximums_cbu2gmdlxq" NOT DEFERRABLE;

ALTER TABLE "qti"."normal_minimum" ALTER CONSTRAINT "__normal_minimum_fk_package_path_start_copy_minimums_afpztdy4vr" NOT DEFERRABLE;

ALTER TABLE "qti"."pci_module_form" ALTER CONSTRAINT "__pci_module_form_fk_package_path_start_copy_module_keh62si5ne" NOT DEFERRABLE;

ALTER TABLE "qti"."printed_variable_ref_declaration" ALTER CONSTRAINT "__printed_variable_ref_declaration_fk_package_path_omip4epyzh" NOT DEFERRABLE;

ALTER TABLE "qti"."rounding_mode_figures" ALTER CONSTRAINT "__rounding_mode_figures_fk_package_path_start_mode_lxpd2mpfpk" NOT DEFERRABLE;

ALTER TABLE "qti"."site_target" ALTER CONSTRAINT "__site_target_fk_package_path_copy_targets_phpxprxihd" NOT DEFERRABLE;

ALTER TABLE "qti"."site_target" ALTER CONSTRAINT "__site_target_fk_package_target_copy_targeted_by_mabgadjit7" NOT DEFERRABLE;

ALTER TABLE "qti"."ssml_attribute" ALTER CONSTRAINT "__ssml_attribute_fk_package_path_start_fragment_vindbanifm" NOT DEFERRABLE;

ALTER TABLE "qti"."template_ref_declaration" ALTER CONSTRAINT "__template_ref_declaration_fk_package_path_start_wzxqjvyprs" NOT DEFERRABLE;

ALTER TABLE "qti"."usage_value" ALTER CONSTRAINT "__usage_value_fk_package_path_start_base_type_da2gnubiob" NOT DEFERRABLE;

ALTER TABLE "qti"."variable_ref" ALTER CONSTRAINT "__variable_ref_fk_package_path_copy_variables_root_34sbliitcl" NOT DEFERRABLE;

ALTER TABLE "qti"."xml_lang" ALTER CONSTRAINT "__xml_lang_fk_package_path_start_scope_p663cbmzz6" NOT DEFERRABLE;

ALTER TABLE "qti"."xml_lang" ALTER CONSTRAINT "__xml_lang_fk_package_path_copy_langs_w2dzasyj6v" NOT DEFERRABLE;

ALTER TABLE "qti"."site" DROP CONSTRAINT "__site_fk_package_path_start_children_ancestry_i2gscxgbyn";

ALTER TABLE "qti"."document" DROP CONSTRAINT "__document_fk_package_path_node_children_context_xfxlw4iwdg";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_fk_package_path_parent_copy_children_parent_udrokmuxvd";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_key_package_path_children_ancestry_document_g5nk4s6nj5";

ALTER TABLE "qti"."interaction_attribute" ADD CONSTRAINT "__interaction_attribute_fk_package_path_start_name_pg3zewqxih" FOREIGN KEY ("__package_a3twij6wxn", "__path_c4phd6tfm7", "__start_ujbwqhewkw", "__name_dt6do2ts2h", "__tag_max_written_true_6phmyjuam6") REFERENCES "qti"."count_bound" ("package", "path", "start", "max_name", "max_written") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."interaction_attribute" ADD CONSTRAINT "__interaction_attribute_fk_package_path_start_name_gyzrbsoxgk" FOREIGN KEY ("__package_bsckihisag", "__path_zixwibn4iv", "__start_rzt77gh5qy", "__name_64wvduu5ig", "__tag_min_written_true_s2qn2qby65") REFERENCES "qti"."count_bound" ("package", "path", "start", "min_name", "min_written") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."node" ADD CONSTRAINT "__node_fk_package_path_parent_copy_children_parent_udrokmuxvd" FOREIGN KEY ("package", "path", "parent", "__copy_children_tityo5ij5l", "parent_ancestry", "document_type", "parent_governor", "parent_kind", "parent_nearest", "parent_nearest_kind", "parent_nearest_path", "parent_parent_kind") REFERENCES "qti"."node" ("package", "path", "start", "children", "ancestry", "document_type", "governor", "kind", "nearest", "nearest_kind", "nearest_path", "parent_kind") MATCH SIMPLE NOT VALID;

ALTER TABLE "qti"."xml_lang" DROP CONSTRAINT "__xml_lang_fk_package_path_start_vq3zclqhcm";

ALTER TABLE "qti"."xml_decl" DROP CONSTRAINT "__xml_decl_fk_package_path_ge2web3hon";

ALTER TABLE "qti"."variable_ref_table" DROP CONSTRAINT "__variable_ref_table_fk_package_path_start_attribute_qal4bb2svs";

ALTER TABLE "qti"."variable_ref_declaration" DROP CONSTRAINT "__variable_ref_declaration_fk_package_path_start_aazfrobuhm";

ALTER TABLE "qti"."variable_ref_declaration" DROP CONSTRAINT "__variable_ref_declaration_fk_package_path_ldjghv4qio";

ALTER TABLE "qti"."variable_ref_declaration" DROP CONSTRAINT "__variable_ref_declaration_fk_package_path_start_4fcczdvwpe";

ALTER TABLE "qti"."variable_ref_declaration" DROP CONSTRAINT "__variable_ref_declaration_fk_package_path_start_deaoitpro5";

ALTER TABLE "qti"."variable_ref_declaration" DROP CONSTRAINT "__variable_ref_declaration_fk_package_path_start_p34klo3wat";

ALTER TABLE "qti"."variable_ref_declaration" DROP CONSTRAINT "__variable_ref_declaration_fk_package_path_start_wi2nzck4gj";

ALTER TABLE "qti"."variable_ref_declaration" DROP CONSTRAINT "__variable_ref_declaration_fk_package_path_xspl3xs64u";

ALTER TABLE "qti"."variable_ref_cardinality" DROP CONSTRAINT "__variable_ref_cardinality_fk_package_path_start_dq5ut2brjg";

ALTER TABLE "qti"."variable_ref_cardinality" DROP CONSTRAINT "__variable_ref_cardinality_fk_package_path_2qria6uskq";

ALTER TABLE "qti"."variable_ref" DROP CONSTRAINT "__variable_ref_fk_package_path_start_attribute_ctmnyk4g2j";

ALTER TABLE "qti"."variable_ref" DROP CONSTRAINT "__variable_ref_fk_package_path_start_language_ju3gsdne54";

ALTER TABLE "qti"."variable_ref" DROP CONSTRAINT "__variable_ref_fk_package_path_start_language_be5jtpgm7a";

ALTER TABLE "qti"."value_base_type" DROP CONSTRAINT "__value_base_type_fk_package_path_start_b7u7xcjoi6";

ALTER TABLE "qti"."usage_value_base_type" DROP CONSTRAINT "__usage_value_base_type_fk_package_path_start_text_jwjcamzvvt";

ALTER TABLE "qti"."usage_value_base_type" DROP CONSTRAINT "__usage_value_base_type_fk_package_path_start_base_k2z5yfeomj";

ALTER TABLE "qti"."usage_value" DROP CONSTRAINT "__usage_value_fk_package_path_start_base_type_aggn7modqz";

ALTER TABLE "qti"."usage_value" DROP CONSTRAINT "__usage_value_fk_package_path_start_text_gskextes7g";

ALTER TABLE "qti"."usage_base_type" DROP CONSTRAINT "__usage_base_type_fk_package_path_start_6bk67mseok";

ALTER TABLE "qti"."tolerance" DROP CONSTRAINT "__tolerance_fk_package_path_start_scta4kyium";

ALTER TABLE "qti"."text_reference_path" DROP CONSTRAINT "__text_reference_path_fk_package_target_7wuvskqxw6";

ALTER TABLE "qti"."text_reference_path" DROP CONSTRAINT "__text_reference_path_fk_package_path_start_kind_c3nydieeb4";

ALTER TABLE "qti"."text_reference" DROP CONSTRAINT "__text_reference_fk_package_path_start_kind_56ozln62rr";

ALTER TABLE "qti"."text_reference" DROP CONSTRAINT "__text_reference_fk_package_path_start_hsjjwqxfgl";

ALTER TABLE "qti"."text_idref" DROP CONSTRAINT "__text_idref_fk_package_path_token_ltwts2zlhw";

ALTER TABLE "qti"."test_token" DROP CONSTRAINT "__test_token_fk_package_path_start_bfktwakcgp";

ALTER TABLE "qti"."test_document" DROP CONSTRAINT "__test_document_fk_package_path_root_kind_5zfkf7oana";

ALTER TABLE "qti"."test_document" DROP CONSTRAINT "__test_document_fk_package_path_xu5aibdclo";

ALTER TABLE "qti"."template_ref_declaration" DROP CONSTRAINT "__template_ref_declaration_fk_package_path_start_6qvhndrxuj";

ALTER TABLE "qti"."template_ref_declaration" DROP CONSTRAINT "__template_ref_declaration_fk_package_path_rtv47ibtly";

ALTER TABLE "qti"."template_ref_declaration" DROP CONSTRAINT "__template_ref_declaration_fk_package_path_s3xww6736w";

ALTER TABLE "qti"."template_ref_cardinality" DROP CONSTRAINT "__template_ref_cardinality_fk_package_path_start_feymjrpifp";

ALTER TABLE "qti"."template_ref_cardinality" DROP CONSTRAINT "__template_ref_cardinality_fk_package_path_rr4uj6sleu";

ALTER TABLE "qti"."template_ref" DROP CONSTRAINT "__template_ref_fk_package_path_start_attribute_egweuzavo2";

ALTER TABLE "qti"."table_scope" DROP CONSTRAINT "__table_scope_fk_package_path_start_scalw6ieaw";

ALTER TABLE "qti"."table_header" DROP CONSTRAINT "__table_header_fk_package_path_start_id_owner_f2pyrytcjb";

ALTER TABLE "qti"."table_header" DROP CONSTRAINT "__table_header_fk_package_path_start_dhca6a32iq";

ALTER TABLE "qti"."stimulus_ref" DROP CONSTRAINT "__stimulus_ref_fk_package_path_start_tag_kind_qti_fefxs2a35t";

ALTER TABLE "qti"."stimulus_ref" DROP CONSTRAINT "__stimulus_ref_fk_package_path_start_identifier_5xxdguq5r2";

ALTER TABLE "qti"."statistic_date" DROP CONSTRAINT "__statistic_date_fk_package_path_start_cghb3alsu5";

ALTER TABLE "qti"."ssml_scope" DROP CONSTRAINT "__ssml_scope_fk_package_path_start_ixilycttqs";

ALTER TABLE "qti"."ssml_attribute" DROP CONSTRAINT "__ssml_attribute_fk_package_path_start_name_fhzwkfgefm";

ALTER TABLE "qti"."srcset_candidate" DROP CONSTRAINT "__srcset_candidate_fk_package_path_start_at_uwau4yrlff";

ALTER TABLE "qti"."srcset" DROP CONSTRAINT "__srcset_fk_package_path_start_name_fod2j3t5so";

ALTER TABLE "qti"."site_target" DROP CONSTRAINT "__site_target_fk_package_path_start_target_pozbyanaff";

ALTER TABLE "qti"."site_target" DROP CONSTRAINT "__site_target_fk_package_path_start_ancestry_kind_lpxx2rpzvs";

ALTER TABLE "qti"."site_target" DROP CONSTRAINT "__site_target_fk_package_path_start_an3f4rh7xg";

ALTER TABLE "qti"."site_path" DROP CONSTRAINT "__site_path_fk_package_path_start_iaqkkzgdg3";

ALTER TABLE "qti"."site_path" DROP CONSTRAINT "__site_path_fk_package_target_z3c4rez7yf";

ALTER TABLE "qti"."site_path" DROP CONSTRAINT "__site_path_fk_package_path_start_target_tag_name_66fzrobpd5";

ALTER TABLE "qti"."site_path" DROP CONSTRAINT "__site_path_fk_package_path_start_kind_molhlyyxr4";

ALTER TABLE "qti"."site" DROP CONSTRAINT "__site_fk_package_path_start_tag_name_href_tag_scope_qjcefsndyw";

ALTER TABLE "qti"."site" DROP CONSTRAINT "__site_fk_package_path_start_kind_f4xwpengkv";

ALTER TABLE "qti"."site" DROP CONSTRAINT "__site_fk_package_path_start_parent_ixokdifhad";

ALTER TABLE "qti"."share_target" DROP CONSTRAINT "__share_target_fk_package_path_target_start_lyzjcsg3y5";

ALTER TABLE "qti"."share_target" DROP CONSTRAINT "__share_target_fk_package_path_start_id_d3yuimgnfu";

ALTER TABLE "qti"."share_target" DROP CONSTRAINT "__share_target_fk_package_path_start_vut3y6yjq2";

ALTER TABLE "qti"."share_fragment" DROP CONSTRAINT "__share_fragment_fk_package_path_placements_tqpvj65big";

ALTER TABLE "qti"."share_fragment" DROP CONSTRAINT "__share_fragment_fk_package_path_start_id_wsz7onbjps";

ALTER TABLE "qti"."share_fragment" DROP CONSTRAINT "__share_fragment_fk_package_path_id_lwcavdammq";

ALTER TABLE "qti"."share_fragment" DROP CONSTRAINT "__share_fragment_fk_package_path_assembled_vdozoufbmn";

ALTER TABLE "qti"."sd_decl" DROP CONSTRAINT "__sd_decl_fk_package_path_xxx5gjp4e7";

ALTER TABLE "qti"."rounding_mode_figures" DROP CONSTRAINT "__rounding_mode_figures_fk_package_path_start_yewsl3qtgx";

ALTER TABLE "qti"."rounding_mode_figures" DROP CONSTRAINT "__rounding_mode_figures_fk_package_path_start_5deieoc77c";

ALTER TABLE "qti"."rounding_mode" DROP CONSTRAINT "__rounding_mode_fk_package_path_start_ljm5oh7yqr";

ALTER TABLE "qti"."rounding_figures" DROP CONSTRAINT "__rounding_figures_fk_package_path_start_mlcop4gfbr";

ALTER TABLE "qti"."rounding_figures" DROP CONSTRAINT "__rounding_figures_fk_package_path_start_n4qunr7tjb";

ALTER TABLE "qti"."rounding" DROP CONSTRAINT "__rounding_fk_package_path_start_vwtabuznig";

ALTER TABLE "qti"."rounding" DROP CONSTRAINT "__rounding_fk_package_path_start_fzvk62ytmi";

ALTER TABLE "qti"."rounding" DROP CONSTRAINT "__rounding_fk_package_path_start_wv2i3zpnbq";

ALTER TABLE "qti"."rounding" DROP CONSTRAINT "__rounding_fk_package_path_start_wxw5s4zahm";

ALTER TABLE "qti"."rounding" DROP CONSTRAINT "__rounding_fk_package_path_start_paqrdg26bu";

ALTER TABLE "qti"."resource_typed" DROP CONSTRAINT "__resource_typed_fk_package_path_start_tag_kind_cp_qdyijrn7oc";

ALTER TABLE "qti"."resource_id" DROP CONSTRAINT "__resource_id_fk_package_path_start_tag_kind_cp_z2iiljzmce";

ALTER TABLE "qti"."resource_id" DROP CONSTRAINT "__resource_id_fk_package_path_start_tag_document_jg25qlj7cb";

ALTER TABLE "qti"."resource_href" DROP CONSTRAINT "__resource_href_fk_package_path_start_tag_kind_cp_46qcfuukc4";

ALTER TABLE "qti"."resource_href" DROP CONSTRAINT "__resource_href_fk_package_path_start_kztzfurwao";

ALTER TABLE "qti"."resource_document" DROP CONSTRAINT "__resource_document_fk_package_path_root_kind_ejo23fxacl";

ALTER TABLE "qti"."reference_path" DROP CONSTRAINT "__reference_path_fk_package_target_tag_root_kind_qti_ionteu5iog";

ALTER TABLE "qti"."reference_path" DROP CONSTRAINT "__reference_path_fk_package_target_pch7muxr75";

ALTER TABLE "qti"."reference_path" DROP CONSTRAINT "__reference_path_fk_package_path_start_name_kind_evlqvkunbt";

ALTER TABLE "qti"."reference" DROP CONSTRAINT "__reference_fk_package_path_start_name_kind_cm6pzf3hkd";

ALTER TABLE "qti"."reference" DROP CONSTRAINT "__reference_fk_package_path_start_name_wq34q2clj2";

ALTER TABLE "qti"."record_field" DROP CONSTRAINT "__record_field_fk_package_path_start_k5forwyeek";

ALTER TABLE "qti"."record_field" DROP CONSTRAINT "__record_field_fk_package_path_start_lmlit4tiz6";

ALTER TABLE "qti"."processing" DROP CONSTRAINT "__processing_fk_package_path_start_buuyxfkq34";

ALTER TABLE "qti"."printed_variable_ref_declaration" DROP CONSTRAINT "__printed_variable_ref_declaration_fk_package_path_zycei2hkcy";

ALTER TABLE "qti"."printed_variable_ref" DROP CONSTRAINT "__printed_variable_ref_fk_package_path_start_egxgjbfzzi";

ALTER TABLE "qti"."placed_xml_lang" DROP CONSTRAINT "__placed_xml_lang_fk_package_path_start_lang_scope_thbyc6qfwx";

ALTER TABLE "qti"."placed_variable_ref_declaration" DROP CONSTRAINT "__placed_variable_ref_declaration_fk_package_7ble6ikuvt";

ALTER TABLE "qti"."placed_variable_ref_declaration" DROP CONSTRAINT "__placed_variable_ref_declaration_fk_package_4xwkmtv65t";

ALTER TABLE "qti"."placed_variable_ref_declaration" DROP CONSTRAINT "__placed_variable_ref_declaration_fk_package_gdukut7cvb";

ALTER TABLE "qti"."placed_variable_ref" DROP CONSTRAINT "__placed_variable_ref_fk_package_assembly_instance_qawpb7c5ef";

ALTER TABLE "qti"."placed_variable_ref" DROP CONSTRAINT "__placed_variable_ref_fk_package_path_start_5xoznrn7wl";

ALTER TABLE "qti"."placed_variable_ref" DROP CONSTRAINT "__placed_variable_ref_fk_package_assembly_root_kind_kyz7jvyo7u";

ALTER TABLE "qti"."placed_share_target" DROP CONSTRAINT "__placed_share_target_fk_package_assembly_target_4oz3u75j3w";

ALTER TABLE "qti"."placed_share_target" DROP CONSTRAINT "__placed_share_target_fk_package_assembly_target_or2mupqns2";

ALTER TABLE "qti"."placed_share_target" DROP CONSTRAINT "__placed_share_target_fk_package_assembly_instance_mcp6dsg3aq";

ALTER TABLE "qti"."placed_share_target" DROP CONSTRAINT "__placed_share_target_fk_package_assembly_instance_o7a22jy6p7";

ALTER TABLE "qti"."placed_math_rank" DROP CONSTRAINT "__placed_math_rank_fk_package_path_start_5kblemgm5d";

ALTER TABLE "qti"."placed_math_rank" DROP CONSTRAINT "__placed_math_rank_fk_package_assembly_instance_path_ne6gauiyao";

ALTER TABLE "qti"."placed_idref" DROP CONSTRAINT "__placed_idref_fk_package_path_id_gx6cf6dfqn";

ALTER TABLE "qti"."placed_id" DROP CONSTRAINT "__placed_id_fk_package_path_start_id_owner_26c5kasps3";

ALTER TABLE "qti"."placed_catalog_ref" DROP CONSTRAINT "__placed_catalog_ref_fk_package_assembly_id_ekloeln6cs";

ALTER TABLE "qti"."placed_binding_declaration" DROP CONSTRAINT "__placed_binding_declaration_fk_package_assembly_4rm4jbfyt3";

ALTER TABLE "qti"."placed_binding_declaration" DROP CONSTRAINT "__placed_binding_declaration_fk_package_assembly_jkmpxgc4pq";

ALTER TABLE "qti"."placed_binding_declaration" DROP CONSTRAINT "__placed_binding_declaration_fk_package_assembly_swtviguqz3";

ALTER TABLE "qti"."placed_binding_cardinality" DROP CONSTRAINT "__placed_binding_cardinality_fk_package_assembly_utnjj4qip6";

ALTER TABLE "qti"."placed_binding_cardinality" DROP CONSTRAINT "__placed_binding_cardinality_fk_package_assembly_frqbgullul";

ALTER TABLE "qti"."placed_binding_cardinality" DROP CONSTRAINT "__placed_binding_cardinality_fk_package_assembly_g3gxwyo2b7";

ALTER TABLE "qti"."placed_binding_base_type" DROP CONSTRAINT "__placed_binding_base_type_fk_package_assembly_h342o7txqs";

ALTER TABLE "qti"."placed_binding_base_type" DROP CONSTRAINT "__placed_binding_base_type_fk_package_assembly_rmweepxeg6";

ALTER TABLE "qti"."placed_binding" DROP CONSTRAINT "__placed_binding_fk_package_assembly_instance_start_bv5bfnwzjq";

ALTER TABLE "qti"."placed_binding" DROP CONSTRAINT "__placed_binding_fk_package_assembly_instance_path_7gu4k3rt5q";

ALTER TABLE "qti"."pi" DROP CONSTRAINT "__pi_fk_package_path_start_tugkncudqo";

ALTER TABLE "qti"."pci_module_form" DROP CONSTRAINT "__pci_module_form_fk_package_path_start_up5gmvvp6u";

ALTER TABLE "qti"."pci_module_form" DROP CONSTRAINT "__pci_module_form_fk_package_path_start_mrlsg6fuut";

ALTER TABLE "qti"."operand" DROP CONSTRAINT "__operand_fk_package_path_start_base_type_x5vk42nawa";

ALTER TABLE "qti"."operand" DROP CONSTRAINT "__operand_fk_package_path_operator_predecessor_32ni24juqr";

ALTER TABLE "qti"."operand" DROP CONSTRAINT "__operand_fk_package_path_operator_copy_operands_snrzo2wkuq";

ALTER TABLE "qti"."open_element_type" DROP CONSTRAINT "__open_element_type_fk_package_path_start_jjjipij4kp";

ALTER TABLE "qti"."open_element_name" DROP CONSTRAINT "__open_element_name_fk_package_path_start_dgkc2wpi7w";

ALTER TABLE "qti"."open_attribute" DROP CONSTRAINT "__open_attribute_fk_package_path_start_element_nxt6ugi4hb";

ALTER TABLE "qti"."object_title" DROP CONSTRAINT "__object_title_fk_package_path_start_o7lojghvvl";

ALTER TABLE "qti"."object_title" DROP CONSTRAINT "__object_title_fk_package_path_start_2zltwemuci";

ALTER TABLE "qti"."object_identifier" DROP CONSTRAINT "__object_identifier_fk_package_path_start_fvufr2corq";

ALTER TABLE "qti"."object_identifier" DROP CONSTRAINT "__object_identifier_fk_package_path_start_pkh6znufj2";

ALTER TABLE "qti"."normal_minimum" DROP CONSTRAINT "__normal_minimum_fk_package_path_start_of5ybanjdh";

ALTER TABLE "qti"."normal_maximum" DROP CONSTRAINT "__normal_maximum_fk_package_path_start_hj6adbkiap";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_fk_package_path_start_b7nujphp5e";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_fk_package_path_parent_vauwhh3ox4";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_fk_package_path_start_string_value_exvnttgycw";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_fk_package_path_start_wh5zvjuucg";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_fk_package_path_start_y6mrgwu5x3";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_fk_package_path_start_vo7ursvhen";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_fk_package_path_start_tsms6vudh4";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_fk_package_path_start_f22pfbi47v";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_fk_package_path_wfnbjbd4el";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_fk_package_path_start_isi54s6qv3";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_fk_package_path_start_piwnuirazq";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_fk_package_path_start_odexeaojdb";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_fk_package_path_start_osf2h64dmj";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_fk_package_path_start_kind_string_value_f2d3sbown7";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_fk_package_path_start_7zti3nwf3x";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_fk_package_path_start_d2gqksr5t5";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_fk_package_path_start_t32e2s34bw";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_fk_package_path_start_lntrw4a37i";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_fk_package_path_start_uwwok4vflk";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_fk_package_path_start_ji64ax74cx";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_fk_package_path_start_6h52d7atpa";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_fk_package_path_kind_bmnydd6tyi";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_fk_package_path_start_4h7zeclayo";

ALTER TABLE "qti"."named" DROP CONSTRAINT "__named_fk_package_path_start_identifier_6dmbwzx4jw";

ALTER TABLE "qti"."most_count" DROP CONSTRAINT "__most_count_fk_package_path_start_nmmdsz5znz";

ALTER TABLE "qti"."media" DROP CONSTRAINT "__media_fk_package_path_tbem4rpvwn";

ALTER TABLE "qti"."math_rank" DROP CONSTRAINT "__math_rank_fk_package_path_start_z7fxfctmgv";

ALTER TABLE "qti"."math_dir" DROP CONSTRAINT "__math_dir_fk_package_path_start_f377yruvpt";

ALTER TABLE "qti"."math_cn" DROP CONSTRAINT "__math_cn_fk_package_path_start_type_lexical_tag_mtuzt5aea4";

ALTER TABLE "qti"."math_cn" DROP CONSTRAINT "__math_cn_fk_package_path_start_base_lexical_tag_uniz4xgm3e";

ALTER TABLE "qti"."math_cn" DROP CONSTRAINT "__math_cn_fk_package_path_start_tag_kind_m_cn_6wzc5mku72";

ALTER TABLE "qti"."math_cn" DROP CONSTRAINT "__math_cn_fk_package_path_start_type_gfdns3v3gm";

ALTER TABLE "qti"."math_cell" DROP CONSTRAINT "__math_cell_fk_package_path_start_3lexcfbcnc";

ALTER TABLE "qti"."math_align_scope" DROP CONSTRAINT "__math_align_scope_fk_package_path_start_dir_lexical_oq2fnqio6o";

ALTER TABLE "qti"."math_align_scope" DROP CONSTRAINT "__math_align_scope_fk_package_path_start_jfr4iz7vmr";

ALTER TABLE "qti"."math_align_group" DROP CONSTRAINT "__math_align_group_fk_package_path_start_cell_ygnv5pqymq";

ALTER TABLE "qti"."math_action" DROP CONSTRAINT "__math_action_fk_package_path_start_dhobiuq3fa";

ALTER TABLE "qti"."math_action" DROP CONSTRAINT "__math_action_fk_package_path_start_fdzoetiypr";

ALTER TABLE "qti"."mastery_value" DROP CONSTRAINT "__mastery_value_fk_package_path_start_dp37mhbf6d";

ALTER TABLE "qti"."mastery_floor" DROP CONSTRAINT "__mastery_floor_fk_package_path_start_normal_minimum_szr5b5iyze";

ALTER TABLE "qti"."mapping_cardinality" DROP CONSTRAINT "__mapping_cardinality_fk_package_path_start_55i7g5ubvh";

ALTER TABLE "qti"."mapping_base_type" DROP CONSTRAINT "__mapping_base_type_fk_package_path_start_3xygsx54tu";

ALTER TABLE "qti"."mapping" DROP CONSTRAINT "__mapping_fk_package_path_start_hgvp5cipsv";

ALTER TABLE "qti"."mapping" DROP CONSTRAINT "__mapping_fk_package_path_start_it67fpz46j";

ALTER TABLE "qti"."mapping" DROP CONSTRAINT "__mapping_fk_package_path_start_tag_kind_qti_mapping_yg7rfkls2b";

ALTER TABLE "qti"."map_key_type" DROP CONSTRAINT "__map_key_type_fk_package_path_start_cnlxcfg7yq";

ALTER TABLE "qti"."map_key" DROP CONSTRAINT "__map_key_fk_package_path_start_b4bqt4d3vv";

ALTER TABLE "qti"."map_key" DROP CONSTRAINT "__map_key_fk_package_path_start_tag_kind_qti_map_pvvfg7txj6";

ALTER TABLE "qti"."manifest_id" DROP CONSTRAINT "__manifest_id_fk_package_path_start_tag_kind_cp_cofzlc4aod";

ALTER TABLE "qti"."manifest_id" DROP CONSTRAINT "__manifest_id_fk_package_path_start_tag_document_ydtwhk42c4";

ALTER TABLE "qti"."lookup_value_type" DROP CONSTRAINT "__lookup_value_type_fk_package_path_start_jofwgn3ja4";

ALTER TABLE "qti"."lookup_value" DROP CONSTRAINT "__lookup_value_fk_package_path_start_gzqui33aa7";

ALTER TABLE "qti"."lookup_value" DROP CONSTRAINT "__lookup_value_fk_package_path_start_4gxrjc7lbo";

ALTER TABLE "qti"."lookup_table_cardinality" DROP CONSTRAINT "__lookup_table_cardinality_fk_package_path_start_6hn4opxtg3";

ALTER TABLE "qti"."lookup_table" DROP CONSTRAINT "__lookup_table_fk_package_path_start_emtkcvnqar";

ALTER TABLE "qti"."lookup_table" DROP CONSTRAINT "__lookup_table_fk_package_path_start_nmqtuiy4bw";

ALTER TABLE "qti"."literal" DROP CONSTRAINT "__literal_fk_package_path_start_base_type_j2vwpqor57";

ALTER TABLE "qti"."least_count" DROP CONSTRAINT "__least_count_fk_package_path_start_vgly2zkjt2";

ALTER TABLE "qti"."label_use" DROP CONSTRAINT "__label_use_fk_package_path_sd2gdhilur";

ALTER TABLE "qti"."label_use" DROP CONSTRAINT "__label_use_fk_package_path_z6oodjuvak";

ALTER TABLE "qti"."label_use" DROP CONSTRAINT "__label_use_fk_package_path_start_rel7uimjan";

ALTER TABLE "qti"."label_use" DROP CONSTRAINT "__label_use_fk_package_path_root_kind_5odzayuwy3";

ALTER TABLE "qti"."item_ref_href" DROP CONSTRAINT "__item_ref_href_fk_package_path_start_tag_kind_qti_zc7woqt4af";

ALTER TABLE "qti"."item_ref_href" DROP CONSTRAINT "__item_ref_href_fk_package_path_start_target_tag_3mpooarmba";

ALTER TABLE "qti"."item_ref_document" DROP CONSTRAINT "__item_ref_document_fk_package_target_tag_root_kind_sa52q6wwjq";

ALTER TABLE "qti"."item_mode" DROP CONSTRAINT "__item_mode_fk_package_path_yyu4g6k5xr";

ALTER TABLE "qti"."interaction_attribute" DROP CONSTRAINT "__interaction_attribute_fk_package_path_isj6dzz5ma";

ALTER TABLE "qti"."interaction_attribute" DROP CONSTRAINT "__interaction_attribute_fk_package_path_start_value_roqlgtevpb";

ALTER TABLE "qti"."interaction_attribute" DROP CONSTRAINT "__interaction_attribute_fk_package_path_start_hgrmsht25h";

ALTER TABLE "qti"."interaction_attribute" DROP CONSTRAINT "__interaction_attribute_fk_package_path_start_value_4mpncldbdk";

ALTER TABLE "qti"."interaction_attribute" DROP CONSTRAINT "__interaction_attribute_fk_package_path_start_name_qwonxf3vm5";

ALTER TABLE "qti"."interaction_attribute" DROP CONSTRAINT "__interaction_attribute_fk_package_path_start_name_apmvg3s2hh";

ALTER TABLE "qti"."interaction_attribute" DROP CONSTRAINT "__interaction_attribute_fk_package_path_start_name_66wxeus75n";

ALTER TABLE "qti"."interaction_attribute" DROP CONSTRAINT "__interaction_attribute_fk_package_path_start_name_q55u7q5qwc";

ALTER TABLE "qti"."interaction_attribute" DROP CONSTRAINT "__interaction_attribute_fk_package_path_start_name_brtxiduoga";

ALTER TABLE "qti"."interaction_attribute" DROP CONSTRAINT "__interaction_attribute_fk_package_path_root_kind_ottpmnv3zo";

ALTER TABLE "qti"."interaction" DROP CONSTRAINT "__interaction_fk_package_path_start_wpfpdpxf37";

ALTER TABLE "qti"."instance" DROP CONSTRAINT "__instance_fk_package_site_document_site_document_7nrpj74xxt";

ALTER TABLE "qti"."instance" DROP CONSTRAINT "__instance_fk_package_document_bindings_langs_6zu6crzyab";

ALTER TABLE "qti"."instance" DROP CONSTRAINT "__instance_fk_package_assembly_start_document_ad664v7tnj";

ALTER TABLE "qti"."instance" DROP CONSTRAINT "__instance_fk_package_document_ids_idref_targets_5z7ien5yku";

ALTER TABLE "qti"."inclusion" DROP CONSTRAINT "__inclusion_fk_package_path_start_parent_kind_places_2557ifwq63";

ALTER TABLE "qti"."idref" DROP CONSTRAINT "__idref_fk_package_path_token_vc7e2dybao";

ALTER TABLE "qti"."identity_text" DROP CONSTRAINT "__identity_text_fk_package_path_start_vymux7o4os";

ALTER TABLE "qti"."hottext" DROP CONSTRAINT "__hottext_fk_package_path_start_tag_kind_qti_hottext_gbapnxewxb";

ALTER TABLE "qti"."fragment_template_ref_declaration" DROP CONSTRAINT "__fragment_template_ref_declaration_fk_package_ravkplni4m";

ALTER TABLE "qti"."fragment_template_ref_declaration" DROP CONSTRAINT "__fragment_template_ref_declaration_fk_package_cc2qez46ft";

ALTER TABLE "qti"."fragment_template_ref_declaration" DROP CONSTRAINT "__fragment_template_ref_declaration_fk_package_gkkhq2wu4s";

ALTER TABLE "qti"."fragment_template_ref_cardinality" DROP CONSTRAINT "__fragment_template_ref_cardinality_fk_package_qfigyw6j3d";

ALTER TABLE "qti"."fragment_template_ref_cardinality" DROP CONSTRAINT "__fragment_template_ref_cardinality_fk_package_khhlfqkjxs";

ALTER TABLE "qti"."fragment_template_ref" DROP CONSTRAINT "__fragment_template_ref_fk_package_assembly_instance_sqgiqbejft";

ALTER TABLE "qti"."fragment_scope" DROP CONSTRAINT "__fragment_scope_fk_package_assembly_instance_nkb5xn3uaf";

ALTER TABLE "qti"."fragment_printed_ref_declaration" DROP CONSTRAINT "__fragment_printed_ref_declaration_fk_package_s2q7vwn5kn";

ALTER TABLE "qti"."fragment_printed_ref" DROP CONSTRAINT "__fragment_printed_ref_fk_package_assembly_instance_3cny6p6g5j";

ALTER TABLE "qti"."fragment_feedback_ref_declaration" DROP CONSTRAINT "__fragment_feedback_ref_declaration_fk_package_pjzn3w4gco";

ALTER TABLE "qti"."fragment_feedback_ref_declaration" DROP CONSTRAINT "__fragment_feedback_ref_declaration_fk_package_e7nysmvhal";

ALTER TABLE "qti"."fragment_feedback_ref_declaration" DROP CONSTRAINT "__fragment_feedback_ref_declaration_fk_package_vzwbtnfsy6";

ALTER TABLE "qti"."fragment_feedback_ref_cardinality" DROP CONSTRAINT "__fragment_feedback_ref_cardinality_fk_package_a6f5ajd735";

ALTER TABLE "qti"."fragment_feedback_ref_cardinality" DROP CONSTRAINT "__fragment_feedback_ref_cardinality_fk_package_6zrzbelv7w";

ALTER TABLE "qti"."fragment_feedback_ref" DROP CONSTRAINT "__fragment_feedback_ref_fk_package_assembly_instance_76etbh5cwt";

ALTER TABLE "qti"."fragment_context_ref_declaration" DROP CONSTRAINT "__fragment_context_ref_declaration_fk_package_vun7g5ncxs";

ALTER TABLE "qti"."fragment_context_ref" DROP CONSTRAINT "__fragment_context_ref_fk_package_assembly_instance_7qsey6zlxa";

ALTER TABLE "qti"."file" DROP CONSTRAINT "__file_fk_package_target_nnehkvkc2o";

ALTER TABLE "qti"."file" DROP CONSTRAINT "__file_fk_package_path_start_tag_kind_cp_file_kogxoeacdj";

ALTER TABLE "qti"."feedback_ref_declaration" DROP CONSTRAINT "__feedback_ref_declaration_fk_package_path_start_7s3bxrmo7z";

ALTER TABLE "qti"."feedback_ref_declaration" DROP CONSTRAINT "__feedback_ref_declaration_fk_package_path_kcxnefeu7f";

ALTER TABLE "qti"."feedback_ref_declaration" DROP CONSTRAINT "__feedback_ref_declaration_fk_package_path_psz25evkua";

ALTER TABLE "qti"."feedback_ref_cardinality" DROP CONSTRAINT "__feedback_ref_cardinality_fk_package_path_start_3mrl2fsehu";

ALTER TABLE "qti"."feedback_ref_cardinality" DROP CONSTRAINT "__feedback_ref_cardinality_fk_package_path_la7zaminjw";

ALTER TABLE "qti"."feedback_ref" DROP CONSTRAINT "__feedback_ref_fk_package_path_start_attribute_ahreefjyd4";

ALTER TABLE "qti"."expression_attribute" DROP CONSTRAINT "__expression_attribute_fk_package_path_start_base_oi7wlemrkf";

ALTER TABLE "qti"."expression_attribute" DROP CONSTRAINT "__expression_attribute_fk_package_path_start_y4zqa5ytwz";

ALTER TABLE "qti"."expression" DROP CONSTRAINT "__expression_fk_package_path_start_pred_operands_aag7pjwlo6";

ALTER TABLE "qti"."expression" DROP CONSTRAINT "__expression_fk_package_path_start_f6hwlqhv67";

ALTER TABLE "qti"."entry" DROP CONSTRAINT "__entry_fk_package_path_ev462vhzrf";

ALTER TABLE "qti"."entry" DROP CONSTRAINT "__entry_fk_package_path_gehjopk3re";

ALTER TABLE "qti"."encoding_decl" DROP CONSTRAINT "__encoding_decl_fk_package_path_u5grbt7fag";

ALTER TABLE "qti"."element_type" DROP CONSTRAINT "__element_type_fk_package_path_start_kind_governor_uciwknlvpy";

ALTER TABLE "qti"."document_id" DROP CONSTRAINT "__document_id_fk_package_path_start_bojt3rg2ka";

ALTER TABLE "qti"."document_id" DROP CONSTRAINT "__document_id_fk_package_path_start_6u6vt6gznc";

ALTER TABLE "qti"."document" DROP CONSTRAINT "__document_fk_package_path_76o4c3h7sy";

ALTER TABLE "qti"."document" DROP CONSTRAINT "__document_fk_package_path_47dlspohac";

ALTER TABLE "qti"."document" DROP CONSTRAINT "__document_fk_package_path_eiz3wrbs4a";

ALTER TABLE "qti"."document" DROP CONSTRAINT "__document_fk_package_path_tag_kind_document_tag_qyf5s2femp";

ALTER TABLE "qti"."document" DROP CONSTRAINT "__document_fk_package_path_j4fjfh73q5";

ALTER TABLE "qti"."doctype" DROP CONSTRAINT "__doctype_fk_package_path_start_237uua676y";

ALTER TABLE "qti"."dependency" DROP CONSTRAINT "__dependency_fk_package_path_start_tag_kind_cp_tvxsbsx7nt";

ALTER TABLE "qti"."declaration_name" DROP CONSTRAINT "__declaration_name_fk_package_path_start_identifier_7v5aqs5r5m";

ALTER TABLE "qti"."declaration_name" DROP CONSTRAINT "__declaration_name_fk_package_path_start_cardinality_r2oxdfll25";

ALTER TABLE "qti"."declaration_identifier" DROP CONSTRAINT "__declaration_identifier_fk_package_path_start_egkgtkwtl3";

ALTER TABLE "qti"."declaration_identifier" DROP CONSTRAINT "__declaration_identifier_fk_package_path_start_tag_zxao474wgj";

ALTER TABLE "qti"."declaration_identifier" DROP CONSTRAINT "__declaration_identifier_fk_package_path_start_tag_i4ui5w7kpy";

ALTER TABLE "qti"."declaration_identifier" DROP CONSTRAINT "__declaration_identifier_fk_package_path_start_tag_hdk2t4iivv";

ALTER TABLE "qti"."declaration_identifier" DROP CONSTRAINT "__declaration_identifier_fk_package_path_start_uqxwax5eep";

ALTER TABLE "qti"."declaration_cardinality" DROP CONSTRAINT "__declaration_cardinality_fk_package_path_start_tag_7oo2o6v265";

ALTER TABLE "qti"."declaration_cardinality" DROP CONSTRAINT "__declaration_cardinality_fk_package_path_start_tag_xcbptxnxbu";

ALTER TABLE "qti"."declaration_cardinality" DROP CONSTRAINT "__declaration_cardinality_fk_package_path_start_tag_qfpukhlaxc";

ALTER TABLE "qti"."declaration_base_type" DROP CONSTRAINT "__declaration_base_type_fk_package_path_start_tag_h45aumykqo";

ALTER TABLE "qti"."declaration" DROP CONSTRAINT "__declaration_fk_package_path_start_yuesht3i7n";

ALTER TABLE "qti"."declaration" DROP CONSTRAINT "__declaration_fk_package_path_start_7z53klb7lc";

ALTER TABLE "qti"."declaration" DROP CONSTRAINT "__declaration_fk_package_path_start_qe7rxhxo5g";

ALTER TABLE "qti"."data_ssml" DROP CONSTRAINT "__data_ssml_fk_package_path_start_n5y5o3gjj5";

ALTER TABLE "qti"."count_bound" DROP CONSTRAINT "__count_bound_fk_package_path_start_min_name_bqcc4rokk5";

ALTER TABLE "qti"."count_bound" DROP CONSTRAINT "__count_bound_fk_package_path_start_max_name_kxii4fechs";

ALTER TABLE "qti"."count_bound" DROP CONSTRAINT "__count_bound_fk_package_path_start_t5pqtfs3rz";

ALTER TABLE "qti"."context_ref_declaration" DROP CONSTRAINT "__context_ref_declaration_fk_package_path_glqgxklduk";

ALTER TABLE "qti"."context_ref" DROP CONSTRAINT "__context_ref_fk_package_path_start_attribute_oxv6ygfdzf";

ALTER TABLE "qti"."comment" DROP CONSTRAINT "__comment_fk_package_path_start_566brxnca7";

ALTER TABLE "qti"."cn_count" DROP CONSTRAINT "__cn_count_fk_package_path_start_type_lexical_tag_izgwd7sohp";

ALTER TABLE "qti"."cn_count" DROP CONSTRAINT "__cn_count_fk_package_path_start_tag_kind_m_cn_ib532etexf";

ALTER TABLE "qti"."cn_attribute" DROP CONSTRAINT "__cn_attribute_fk_package_path_start_name_x75ctotxkc";

ALTER TABLE "qti"."choice_interaction" DROP CONSTRAINT "__choice_interaction_fk_package_path_interaction_nocdpuxmj5";

ALTER TABLE "qti"."choice" DROP CONSTRAINT "__choice_fk_package_path_start_hjjl442vss";

ALTER TABLE "qti"."cell_leaf" DROP CONSTRAINT "__cell_leaf_fk_package_path_start_cell_s2bln45e52";

ALTER TABLE "qti"."cell_headers" DROP CONSTRAINT "__cell_headers_fk_package_path_start_5bbvstgdmm";

ALTER TABLE "qti"."cell_headers" DROP CONSTRAINT "__cell_headers_fk_package_path_start_ukszicfs3v";

ALTER TABLE "qti"."catalog_target" DROP CONSTRAINT "__catalog_target_fk_package_path_placements_vw7hdrkrkk";

ALTER TABLE "qti"."catalog_target" DROP CONSTRAINT "__catalog_target_fk_package_path_id_hl63cybuvg";

ALTER TABLE "qti"."catalog_target" DROP CONSTRAINT "__catalog_target_fk_package_path_assembled_7rzo7y6fze";

ALTER TABLE "qti"."catalog_scope" DROP CONSTRAINT "__catalog_scope_fk_package_path_start_naheth2be3";

ALTER TABLE "qti"."catalog_id" DROP CONSTRAINT "__catalog_id_fk_package_path_start_id_owner_rx2hw6nx5f";

ALTER TABLE "qti"."card_support" DROP CONSTRAINT "__card_support_fk_package_path_start_ewja35jdih";

ALTER TABLE "qti"."candidate_path" DROP CONSTRAINT "__candidate_path_fk_package_target_aynqp2vyvf";

ALTER TABLE "qti"."candidate_path" DROP CONSTRAINT "__candidate_path_fk_package_path_start_at_wmvyy7dssn";

ALTER TABLE "qti"."bound_variable" DROP CONSTRAINT "__bound_variable_fk_package_path_start_attribute_xbuybcngfl";

ALTER TABLE "qti"."bound_variable" DROP CONSTRAINT "__bound_variable_fk_package_path_start_dh5zcugvn6";

ALTER TABLE "qti"."binding_name" DROP CONSTRAINT "__binding_name_fk_package_path_start_pblb3cffix";

ALTER TABLE "qti"."binding_declaration" DROP CONSTRAINT "__binding_declaration_fk_package_path_start_rpymvdrjou";

ALTER TABLE "qti"."binding_declaration" DROP CONSTRAINT "__binding_declaration_fk_package_path_start_ylu2d4xsgx";

ALTER TABLE "qti"."binding_declaration" DROP CONSTRAINT "__binding_declaration_fk_package_path_declaration_2erbukzhkm";

ALTER TABLE "qti"."binding_cardinality" DROP CONSTRAINT "__binding_cardinality_fk_package_path_start_kumkyiy3x4";

ALTER TABLE "qti"."binding_cardinality" DROP CONSTRAINT "__binding_cardinality_fk_package_path_start_dvppmlcq66";

ALTER TABLE "qti"."binding_cardinality" DROP CONSTRAINT "__binding_cardinality_fk_package_path_declaration_xrh5vymhaq";

ALTER TABLE "qti"."binding_base_type" DROP CONSTRAINT "__binding_base_type_fk_package_path_start_attribute_cosh3c3mib";

ALTER TABLE "qti"."binding_base_type" DROP CONSTRAINT "__binding_base_type_fk_package_path_declaration_base_3aofsvk5e6";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_lexical_mabguaklg7";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_lexical_x2bgit2elm";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_f5vj74mto6";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_tag_kind_track_tag_p5gvtdhd37";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_lexical_ntxjeyssaj";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_mdgsso44tc";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_t2eu7lloyb";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_lexical_sgyzrihdfk";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_lexical_xpels2sueq";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_lexical_2mwdkpsopp";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_lexical_rzox4ui3o3";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_lexical_vdwohfadec";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_lexical_eztsd435fp";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_lexical_4brysqjsas";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_name_lexical_kind_m342dveaot";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_name_kind_lexical_dmrzu2wpou";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_name_lexical_q3kgagod5m";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_idixl6qluw";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_name_kind_lexical_2ol6tthf5f";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_name_lexical_quhyijxnhh";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_lexical_ewhrfqs65m";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_lexical_7hrd2nifbx";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_urdgmjkxrv";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_lexical_fbwbbewfsa";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_lexical_kdtbezex6i";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_lexical_dfk53refxd";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_lexical_2gavsfcbyu";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_lexical_icxiiumeg7";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_lexical_bze5kkexvu";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_lexical_kdoyddqi7y";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_lexical_yowvx3le2y";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_lexical_nmkojqvdmz";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_tvhrf2fzx3";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_lexical_rmucn4f3lm";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_lexical_opsuzdqjzx";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_lexical_7jrqindmjf";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_4rlvq674wf";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_x2oy5uqbrw";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_name_lexical_sv2ydnwokf";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_lexical_gpcxrtxblc";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_lexical_aqckyseamc";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_hvkwzoa2sr";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_name_kind_hi6nsne4ik";

ALTER TABLE "qti"."assessment_object" DROP CONSTRAINT "__assessment_object_fk_package_path_start_kind_rquryksyni";

ALTER TABLE "qti"."assembled_catalog" DROP CONSTRAINT "__assembled_catalog_fk_package_path_owner_cwkxri6hfw";

ALTER TABLE "qti"."area_mapping_cardinality" DROP CONSTRAINT "__area_mapping_cardinality_fk_package_path_start_cxxfr2m752";

ALTER TABLE "qti"."area_mapping" DROP CONSTRAINT "__area_mapping_fk_package_path_start_csbgixs5ww";

ALTER TABLE "qti"."area_mapping" DROP CONSTRAINT "__area_mapping_fk_package_path_start_jex6vfqym2";

ALTER TABLE "qti"."operand" DROP CONSTRAINT "__operand_check_expression_operands_or_fold_qvork26xlm";

ALTER TABLE "qti"."operand" DROP CONSTRAINT "__operand_check_expression_operands_or_fold_a7tfxem24z";

ALTER TABLE "qti"."operand" DROP CONSTRAINT "__operand_check_expression_operands_or_fold_gw6sqdl245";

ALTER TABLE "qti"."operand" DROP CONSTRAINT "__operand_check_expression_operands_or_fold_45cengo564";

ALTER TABLE "qti"."operand" DROP CONSTRAINT "__operand_check_expression_operands_or_fold_6bbgyaet4b";

ALTER TABLE "qti"."operand" DROP CONSTRAINT "__operand_check_operand_counted_expression_operands_uhaz57si7g";

ALTER TABLE "qti"."expression" DROP CONSTRAINT "__expression_check_expression_operands_or_fold_e2oeyea3xk";

ALTER TABLE "qti"."expression" DROP CONSTRAINT "__expression_check_expression_operands_or_fold_34y37i2omf";

ALTER TABLE "qti"."expression" DROP CONSTRAINT "__expression_check_expression_operands_or_fold_xgl2dv3f55";

ALTER TABLE "qti"."expression" DROP CONSTRAINT "__expression_check_expression_operands_or_fold_5ztxnp5yf5";

ALTER TABLE "qti"."expression" DROP CONSTRAINT "__expression_check_expression_operands_or_fold_ym3dewylev";

ALTER TABLE "qti"."xml_lang" DROP CONSTRAINT "__xml_lang_key_package_path_start_lang_scope_po5svm23ij";

ALTER TABLE "qti"."xml_lang" DROP CONSTRAINT "__xml_lang_key_package_path_start_lang_nlkbzwjftw";

ALTER TABLE "qti"."variable_ref_declaration" DROP CONSTRAINT "__variable_ref_declaration_key_package_path_start_hprwm3u63t";

ALTER TABLE "qti"."variable_ref_declaration" DROP CONSTRAINT "__variable_ref_declaration_key_package_path_start_fzew2lgpsq";

ALTER TABLE "qti"."variable_ref" DROP CONSTRAINT "__variable_ref_key_package_path_start_attribute_jhvkc4hnc3";

ALTER TABLE "qti"."variable_ref" DROP CONSTRAINT "__variable_ref_key_package_path_start_attribute_unvxdwrr3e";

ALTER TABLE "qti"."variable_ref" DROP CONSTRAINT "__variable_ref_key_package_path_start_attribute_base_agqamr46po";

ALTER TABLE "qti"."value_base_type" DROP CONSTRAINT "__value_base_type_key_package_path_start_base_type_eqzcl6a2ti";

ALTER TABLE "qti"."usage_value_base_type" DROP CONSTRAINT "__usage_value_base_type_key_package_path_start_base_r6nzwpgaua";

ALTER TABLE "qti"."usage_value" DROP CONSTRAINT "__usage_value_key_package_path_start_base_type_zjtio3ed5p";

ALTER TABLE "qti"."tolerance" DROP CONSTRAINT "__tolerance_key_package_path_start_lexical_qejqjclxpn";

ALTER TABLE "qti"."text_reference_path" DROP CONSTRAINT "__text_reference_path_key_package_path_start_kind_rihyjyt6py";

ALTER TABLE "qti"."text_reference" DROP CONSTRAINT "__text_reference_key_package_path_start_kind_5kbsnbrcet";

ALTER TABLE "qti"."text_reference" DROP CONSTRAINT "__text_reference_key_package_path_start_kind_lexical_xzonqmsro5";

ALTER TABLE "qti"."test_token" DROP CONSTRAINT "__test_token_key_package_path_start_value_xctnwlogz4";

ALTER TABLE "qti"."test_token" DROP CONSTRAINT "__test_token_key_package_path_start_name_lexical_u3onwtbev3";

ALTER TABLE "qti"."test_document" DROP CONSTRAINT "__test_document_key_package_path_instances_bo7k4ohr23";

ALTER TABLE "qti"."template_ref_declaration" DROP CONSTRAINT "__template_ref_declaration_key_package_path_start_i5lbunow3v";

ALTER TABLE "qti"."statistic_date" DROP CONSTRAINT "__statistic_date_key_package_path_start_lexical_eu4nz2cnmz";

ALTER TABLE "qti"."ssml_attribute" DROP CONSTRAINT "__ssml_attribute_key_package_path_start_name_kind_2uplutxn2b";

ALTER TABLE "qti"."srcset_candidate" DROP CONSTRAINT "__srcset_candidate_key_package_path_start_at_arfbctoemw";

ALTER TABLE "qti"."srcset" DROP CONSTRAINT "__srcset_key_package_path_start_name_lexical_kind_ivll3afrru";

ALTER TABLE "qti"."site_target" DROP CONSTRAINT "__site_target_key_package_path_start_target_places_hocq2rnxsi";

ALTER TABLE "qti"."site_target" DROP CONSTRAINT "__site_target_key_package_path_start_parent_kind_cu6n5wnlhm";

ALTER TABLE "qti"."site_path" DROP CONSTRAINT "__site_path_key_package_path_start_target_s26hafrpua";

ALTER TABLE "qti"."site_path" DROP CONSTRAINT "__site_path_key_package_path_start_kind_7pwz5ijino";

ALTER TABLE "qti"."site" DROP CONSTRAINT "__site_key_package_path_start_kind_s6ijpbztua";

ALTER TABLE "qti"."site" DROP CONSTRAINT "__site_key_package_path_start_ancestry_kind_nearest_ap2yfi7b7f";

ALTER TABLE "qti"."share_target" DROP CONSTRAINT "__share_target_key_package_path_start_id_zoztstb4f2";

ALTER TABLE "qti"."share_fragment" DROP CONSTRAINT "__share_fragment_key_package_path_start_id_eyncpvd22l";

ALTER TABLE "qti"."rounding_figures" DROP CONSTRAINT "__rounding_figures_key_package_path_start_figures_ct4bd7buco";

ALTER TABLE "qti"."rounding_figures" DROP CONSTRAINT "__rounding_figures_key_package_path_start_figures_2dnsrgekuj";

ALTER TABLE "qti"."rounding" DROP CONSTRAINT "__rounding_key_package_path_start_msqig3opuc";

ALTER TABLE "qti"."rounding" DROP CONSTRAINT "__rounding_key_package_path_start_qgjigsmb72";

ALTER TABLE "qti"."rounding" DROP CONSTRAINT "__rounding_key_package_path_start_4pt3bt5q42";

ALTER TABLE "qti"."rounding" DROP CONSTRAINT "__rounding_key_package_path_start_j43o4uvfum";

ALTER TABLE "qti"."resource_typed" DROP CONSTRAINT "__resource_typed_key_package_path_start_type_lexical_7k3etxtt34";

ALTER TABLE "qti"."resource_id" DROP CONSTRAINT "__resource_id_key_package_path_start_lexical_3dqbbc66cc";

ALTER TABLE "qti"."resource_href" DROP CONSTRAINT "__resource_href_key_package_path_start_href_4bxijdm3nk";

ALTER TABLE "qti"."reference_path" DROP CONSTRAINT "__reference_path_key_package_path_start_target_name_2cyaokbpyg";

ALTER TABLE "qti"."reference_path" DROP CONSTRAINT "__reference_path_key_package_path_start_name_kind_qeqtvhahaa";

ALTER TABLE "qti"."reference" DROP CONSTRAINT "__reference_key_package_path_start_name_kind_tkt6nushad";

ALTER TABLE "qti"."reference" DROP CONSTRAINT "__reference_key_package_path_start_name_scope_j5l2jvzcls";

ALTER TABLE "qti"."reference" DROP CONSTRAINT "__reference_key_package_path_start_name_kind_bmydfi3krv";

ALTER TABLE "qti"."record_field" DROP CONSTRAINT "__record_field_key_package_path_start_identifier_33zg2kmvoj";

ALTER TABLE "qti"."record_field" DROP CONSTRAINT "__record_field_key_package_path_start_base_type_wdvpkygfjo";

ALTER TABLE "qti"."processing_template" DROP CONSTRAINT "__processing_template_key_package_path_start_uri_yjygonjagq";

ALTER TABLE "qti"."processing" DROP CONSTRAINT "__processing_key_package_path_start_language_di264qlbjx";

ALTER TABLE "qti"."placed_variable_ref" DROP CONSTRAINT "__placed_variable_ref_key_package_assembly_instance_vzqutiyyyc";

ALTER TABLE "qti"."placed_variable_ref" DROP CONSTRAINT "__placed_variable_ref_key_package_assembly_instance_izudj7mgrv";

ALTER TABLE "qti"."placed_binding_declaration" DROP CONSTRAINT "__placed_binding_declaration_key_package_assembly_hvfagf5c7x";

ALTER TABLE "qti"."placed_binding_declaration" DROP CONSTRAINT "__placed_binding_declaration_key_package_assembly_irhrutjwqg";

ALTER TABLE "qti"."placed_binding_cardinality" DROP CONSTRAINT "__placed_binding_cardinality_key_package_assembly_liqrs3o4bj";

ALTER TABLE "qti"."pci_module_form" DROP CONSTRAINT "__pci_module_form_key_package_path_start_7ic6d4t5fo";

ALTER TABLE "qti"."pci_module_form" DROP CONSTRAINT "__pci_module_form_key_package_path_start_acwe5ltwvo";

ALTER TABLE "qti"."operand" DROP CONSTRAINT "__operand_key_package_path_operator_predecessor_6do7bmv7c6";

ALTER TABLE "qti"."operand" DROP CONSTRAINT "__operand_key_package_path_operator_index_operands_d7vgrdksnl";

ALTER TABLE "qti"."operand" DROP CONSTRAINT "__operand_key_package_path_operator_index_operands_zdolhp7hd2";

ALTER TABLE "qti"."open_element_name" DROP CONSTRAINT "__open_element_name_key_package_path_start_namespace_dus4gx4eym";

ALTER TABLE "qti"."object_title" DROP CONSTRAINT "__object_title_key_package_path_start_title_xwo4mlo22i";

ALTER TABLE "qti"."object_identifier" DROP CONSTRAINT "__object_identifier_key_package_path_start_lexical_7zxv6x3swy";

ALTER TABLE "qti"."normal_minimum" DROP CONSTRAINT "__normal_minimum_key_package_path_start_lexical_d3pr2anzww";

ALTER TABLE "qti"."normal_minimum" DROP CONSTRAINT "__normal_minimum_key_package_path_start_lexical_3iikzrqj5b";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_key_package_path_start_rw6udtp6ut";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_key_package_path_start_lsygytabkz";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_key_package_path_start_jqx3qg3hnv";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_key_package_path_start_qsc577puxs";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_key_package_path_start_p7dgtztd7i";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_key_package_path_start_xbt3uns5vk";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_key_package_path_start_ymenr5n2sm";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_key_package_path_start_3mlyfz5553";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_key_package_path_start_ykmxfrwwgv";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_key_package_path_start_yygfctv45i";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_key_package_path_start_string_value_jnzgtez4u3";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_key_package_path_start_parent_ytuzrwhg3t";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_key_package_path_start_kind_nearest_parent_z7o6acirmr";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_key_package_path_start_kind_governor_42fsltrsjy";

ALTER TABLE "qti"."math_dir" DROP CONSTRAINT "__math_dir_key_package_path_start_lexical_ekx3qkshoj";

ALTER TABLE "qti"."math_align_scope" DROP CONSTRAINT "__math_align_scope_key_package_path_start_cell_mgyr62ewdn";

ALTER TABLE "qti"."math_action" DROP CONSTRAINT "__math_action_key_package_path_start_selection_nu7l727kyq";

ALTER TABLE "qti"."mapping" DROP CONSTRAINT "__mapping_key_package_path_start_xlrapjm2pc";

ALTER TABLE "qti"."map_key" DROP CONSTRAINT "__map_key_key_package_path_start_irat2n6lgi";

ALTER TABLE "qti"."manifest_id" DROP CONSTRAINT "__manifest_id_key_package_path_start_lexical_abxjl4ndvk";

ALTER TABLE "qti"."lookup_value" DROP CONSTRAINT "__lookup_value_key_package_path_start_mxezy5o74l";

ALTER TABLE "qti"."literal" DROP CONSTRAINT "__literal_key_package_path_start_text_gnshagwniq";

ALTER TABLE "qti"."item_mode" DROP CONSTRAINT "__item_mode_key_package_path_cti7lpugau";

ALTER TABLE "qti"."interaction_attribute" DROP CONSTRAINT "__interaction_attribute_key_package_path_start_name_rwex4x6apz";

ALTER TABLE "qti"."interaction_attribute" DROP CONSTRAINT "__interaction_attribute_key_package_path_start_name_ojj4e3aaks";

ALTER TABLE "qti"."interaction_attribute" DROP CONSTRAINT "__interaction_attribute_key_package_path_start_name_ia7ox5pgf3";

ALTER TABLE "qti"."instance" DROP CONSTRAINT "__instance_key_package_assembly_start_document_vigbcn7gg7";

ALTER TABLE "qti"."instance" DROP CONSTRAINT "__instance_key_package_assembly_start_document_go7qfh4bdy";

ALTER TABLE "qti"."fragment_template_ref_declaration" DROP CONSTRAINT "__fragment_template_ref_declaration_key_package_enhmrd3wyf";

ALTER TABLE "qti"."fragment_scope" DROP CONSTRAINT "__fragment_scope_key_package_assembly_instance_tufbe6wfrv";

ALTER TABLE "qti"."fragment_feedback_ref_declaration" DROP CONSTRAINT "__fragment_feedback_ref_declaration_key_package_66xch74kmj";

ALTER TABLE "qti"."file" DROP CONSTRAINT "__file_key_package_path_start_href_s6hzjiu6aj";

ALTER TABLE "qti"."feedback_ref_declaration" DROP CONSTRAINT "__feedback_ref_declaration_key_package_path_start_44u7yp73wm";

ALTER TABLE "qti"."expression_attribute" DROP CONSTRAINT "__expression_attribute_key_package_path_start_y7ap36b2c2";

ALTER TABLE "qti"."expression" DROP CONSTRAINT "__expression_key_package_path_start_operands_2wglrijjw5";

ALTER TABLE "qti"."expression" DROP CONSTRAINT "__expression_key_package_path_start_language_base_mnwsruy44d";

ALTER TABLE "qti"."expression" DROP CONSTRAINT "__expression_key_package_path_start_base_type_f36dqywnzb";

ALTER TABLE "qti"."expression" DROP CONSTRAINT "__expression_key_package_path_start_base_type_z3zrneogcu";

ALTER TABLE "qti"."entry" DROP CONSTRAINT "__entry_key_package_path_pcylbkj3bt";

ALTER TABLE "qti"."entry" DROP CONSTRAINT "__entry_key_package_path_z53dkaqxpx";

ALTER TABLE "qti"."document_id" DROP CONSTRAINT "__document_id_key_package_path_start_id_owner_lcfyvj5sku";

ALTER TABLE "qti"."document" DROP CONSTRAINT "__document_key_package_path_4ecoijr5wa";

ALTER TABLE "qti"."document" DROP CONSTRAINT "__document_key_package_path_root_kind_document_type_fbvnlbnzgb";

ALTER TABLE "qti"."document" DROP CONSTRAINT "__document_key_package_path_root_kind_nlu75ekokq";

ALTER TABLE "qti"."document" DROP CONSTRAINT "__document_key_package_path_ids_idref_targets_uarcdaz2q7";

ALTER TABLE "qti"."document" DROP CONSTRAINT "__document_key_package_path_context_path_context_aczamekmb5";

ALTER TABLE "qti"."document" DROP CONSTRAINT "__document_key_package_path_bindings_langs_variables_l657r4vsyj";

ALTER TABLE "qti"."document" DROP CONSTRAINT "__document_key_package_path_assembled_rgcicnbedu";

ALTER TABLE "qti"."declaration_identifier" DROP CONSTRAINT "__declaration_identifier_key_package_path_start_kiqk4mqpch";

ALTER TABLE "qti"."declaration_cardinality" DROP CONSTRAINT "__declaration_cardinality_key_package_path_start_nktiing7x3";

ALTER TABLE "qti"."declaration_cardinality" DROP CONSTRAINT "__declaration_cardinality_key_package_path_start_nm4ta7bjza";

ALTER TABLE "qti"."declaration_base_type" DROP CONSTRAINT "__declaration_base_type_key_package_path_start_value_gh3nmd35od";

ALTER TABLE "qti"."declaration_base_type" DROP CONSTRAINT "__declaration_base_type_key_package_path_start_base_ojqt445yga";

ALTER TABLE "qti"."declaration_base_type" DROP CONSTRAINT "__declaration_base_type_key_package_path_start_base_ay4nrb6dqg";

ALTER TABLE "qti"."declaration" DROP CONSTRAINT "__declaration_key_package_path_start_declaration_lnmtz2apmy";

ALTER TABLE "qti"."count_bound" DROP CONSTRAINT "__count_bound_key_package_path_start_min_name_piieijhfbt";

ALTER TABLE "qti"."count_bound" DROP CONSTRAINT "__count_bound_key_package_path_start_max_name_cbl6nrwhru";

ALTER TABLE "qti"."cn_count" DROP CONSTRAINT "__cn_count_key_package_path_start_type_gfzp5vminc";

ALTER TABLE "qti"."cn_attribute" DROP CONSTRAINT "__cn_attribute_key_package_path_start_name_lexical_rsrkdvtw7i";

ALTER TABLE "qti"."cell_headers" DROP CONSTRAINT "__cell_headers_key_package_path_start_lexical_seu4et7km3";

ALTER TABLE "qti"."card_support" DROP CONSTRAINT "__card_support_key_package_path_start_lexical_u2ik5yd6sw";

ALTER TABLE "qti"."binding_declaration" DROP CONSTRAINT "__binding_declaration_key_package_path_start_53euplx42l";

ALTER TABLE "qti"."binding_declaration" DROP CONSTRAINT "__binding_declaration_key_package_path_start_lrehzhotda";

ALTER TABLE "qti"."binding_cardinality" DROP CONSTRAINT "__binding_cardinality_key_package_path_start_y6fg6gyfjh";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_k2wy64jhuv";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_xvai2in4ey";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_poxcpuriv2";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_mdp4bq7zbw";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_ts6nkqoorw";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_m7je26ify2";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_lpgurqc67o";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_bxbh2qgwix";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_name_vb5sux3dyf";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_name_ew2cxiroqs";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_name_aetuiohnfq";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_document_type_iblcvhpbjy";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_name_fg4ilplyeb";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_name_6en47hlyy5";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_kufj2a7lsp";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_g7f6q4f3qf";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_n76b2akyme";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_6hjs6xtxtz";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_lrpz67qetv";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_bukyp5wjr3";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_st5zubvnfp";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_yqzafej4dc";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_j2zoauzbvc";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_rrrgzagx3m";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_name_eil7fbgol6";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_gosgndugtc";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_fawptpbyvg";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_lb3vztgnax";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_f3hh5h37uf";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_name_djhic4jx5w";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_kind_name_pmnnpfcw43";

ALTER TABLE "qti"."operand" DROP CONSTRAINT "__operand_pk_kv4v2shmyp";

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
REVOKE USAGE ON SCHEMA "qti", "qti_queries", "qti_queries__author" FROM :"qti_queries__author";

REVOKE USAGE ON DOMAIN "qti"."__attribute_slot_bits_112_aecznthxg5", "qti"."__flag_bits_12_i4uhexylc4", "qti"."__value_base_bits_16_7t6pwwxbsh", "qti"."__value_cardinality_bits_8_mma4mwhphy", "qti"."__domain_gfw43vigph", "qti"."admission_map", "qti"."align_direction", "qti"."align_state", "qti"."attribute_model", "qti"."attribute_name", "qti"."attribute_slot", "qti"."base_type", "qti"."bound_facet", "qti"."bound_zero", "qti"."built_in", "qti"."cardinality", "qti"."cn_base", "qti"."cn_part", "qti"."cn_part_form", "qti"."cn_type", "qti"."content_model", "qti"."declaration_kind", "qti"."document_type", "qti"."domain_primitive", "qti"."entry_kind", "qti"."flag", "qti"."follow_set", "qti"."governor", "qti"."href_scope", "qti"."identity", "qti"."include_set", "qti"."language", "qti"."node_kind", "qti"."position", "qti"."reference_form", "qti"."reference_resolution", "qti"."reference_spelling", "qti"."referenced_table", "qti"."resource_type", "qti"."rounding_holds", "qti"."rp_template", "qti"."shared_model", "qti"."symbol_set", "qti"."type_name", "qti"."use", "qti"."value_base", "qti"."value_cardinality", "qti"."value_domain", "qti"."xml_standalone", "qti"."__text_xj3zno7u3h", "qti"."__text_c6iptmtj2x", "qti"."__text_wchibbb5qm", "qti"."__text_4s4od7s5or", "qti"."__text_qswrkft5qs", "qti"."__text_76pfa5avf4", "qti"."__text_gke7uypkov", "qti"."__text_l7nqeazg5h", "qti"."__text_k5kwygzatl", "qti"."__text_7dfilirtp3", "qti"."__text_7j6kgluyjp", "qti"."__text_xey6ryorh5", "qti"."__text_lnwfx5ijx4", "qti"."__text_lkpwkpgaib", "qti"."__text_w7a4l3clst", "qti"."__text_psn65t7m7e", "qti"."__text_23rzixl3a2", "qti"."__text_6zspo66rxv", "qti"."__text_vrcyezm7ka", "qti"."__text_7cbjao7rjc", "qti"."__text_zij47sgley", "qti"."__text_b6ykamoeho", "qti"."__text_xv5q2k3cum", "qti"."__text_3dlgl63rv6", "qti"."__text_mvb6rz2wwz", "qti"."__text_aezrarw5qb", "qti"."__text_3adwbksayk" FROM :"qti_queries__author";

REVOKE SELECT ON TABLE "qti_queries__author"."attribute_entity", "qti_queries__author"."cn_part_text", "qti_queries__author"."cn_slot", "qti_queries__author"."data_ssml_member", "qti_queries__author"."data_ssml_property", "qti_queries__author"."default_entry", "qti_queries__author"."fragment_context_name", "qti_queries__author"."fragment_feedback_name", "qti_queries__author"."fragment_printed_name", "qti_queries__author"."fragment_template_name", "qti_queries__author"."header_token", "qti_queries__author"."literal_typed", "qti_queries__author"."namespace", "qti_queries__author"."open_attribute_entity", "qti_queries__author"."package", "qti_queries__author"."placed_choice", "qti_queries__author"."placed_hottext", "qti_queries__author"."referring_document", "qti_queries__author"."tolerance_token" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."area_mapping" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."area_mapping_cardinality" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."assembled_catalog" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."assessment_object" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."attribute" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."attribute_entity" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."binding_base_type" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."binding_cardinality" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."binding_declaration" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."binding_name" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."bound_variable" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."candidate_path" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."card_support" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."catalog_id" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."catalog_ref" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."catalog_scope" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."catalog_target" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."cell_headers" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."cell_leaf" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."choice" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."choice_interaction" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."cn_attribute" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."cn_count" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."cn_part_text" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."cn_slot" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."comment" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."context_ref" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."context_ref_declaration" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."count_bound" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."data_ssml" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."data_ssml_member" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."data_ssml_property" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."declaration" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."declaration_base_type" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."declaration_cardinality" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."declaration_identifier" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."declaration_name" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."default_entry" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."dependency" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."doctype" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."document" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."document_id" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."element_type" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."encoding_decl" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."entry" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."expression" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."expression_attribute" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."feedback_ref" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."feedback_ref_cardinality" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."feedback_ref_declaration" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."file" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."fragment_context_name" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."fragment_context_ref" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."fragment_context_ref_declaration" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."fragment_feedback_name" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."fragment_feedback_ref" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."fragment_feedback_ref_cardinality" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."fragment_feedback_ref_declaration" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."fragment_printed_name" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."fragment_printed_ref" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."fragment_printed_ref_declaration" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."fragment_scope" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."fragment_template_name" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."fragment_template_ref" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."fragment_template_ref_cardinality" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."fragment_template_ref_declaration" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."header_token" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."hottext" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."identity_text" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."idref" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."idref_target" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."inclusion" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."instance" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."interaction" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."interaction_attribute" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."item_mode" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."item_ref_document" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."item_ref_href" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."label_use" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."least_count" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."literal" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."literal_typed" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."lookup_table" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."lookup_table_cardinality" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."lookup_value" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."lookup_value_type" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."manifest_id" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."map_key" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."map_key_type" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."mapping" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."mapping_base_type" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."mapping_cardinality" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."mastery_ceiling" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."mastery_floor" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."mastery_value" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."math_action" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."math_align_group" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."math_align_scope" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."math_cell" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."math_cn" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."math_dir" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."math_rank" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."media" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."most_count" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."named" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."namespace" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."node" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."normal_maximum" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."normal_minimum" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."object_identifier" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."object_title" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."open_attribute" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."open_attribute_entity" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."open_element_name" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."open_element_type" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."operand" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."package" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."pci_module_form" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."pi" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."placed_binding" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."placed_binding_base_type" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."placed_binding_cardinality" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."placed_binding_declaration" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."placed_catalog_ref" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."placed_choice" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."placed_hottext" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."placed_id" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."placed_idref" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."placed_math_rank" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."placed_share_target" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."placed_variable_ref" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."placed_variable_ref_declaration" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."placed_xml_lang" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."printed_variable_ref" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."printed_variable_ref_declaration" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."processing" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."processing_template" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."record_field" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."reference" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."reference_path" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."referring_document" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."resource_document" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."resource_href" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."resource_id" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."resource_typed" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."rounding" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."rounding_figures" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."rounding_mode" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."rounding_mode_figures" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."sd_decl" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."share_fragment" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."share_target" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."site" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."site_path" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."site_target" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."srcset" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."srcset_candidate" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."ssml_attribute" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."ssml_scope" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."statistic_date" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."stimulus_ref" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."table_header" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."table_scope" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."template_ref" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."template_ref_cardinality" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."template_ref_declaration" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."test_document" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."test_token" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."text_idref" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."text_reference" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."text_reference_path" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."tolerance" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."tolerance_token" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."usage_base_type" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."usage_value" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."usage_value_base_type" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."value_base_type" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."variable_ref" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."variable_ref_cardinality" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."variable_ref_declaration" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."variable_ref_table" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."xml_decl" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."xml_lang" FROM :"qti_queries__author";

REVOKE EXECUTE ON FUNCTION "qti"."__refuse"("pg_catalog"."text", "pg_catalog"."text", "pg_catalog"."text") FROM :"qti_queries__author";

REVOKE EXECUTE ON FUNCTION "qti"."__constant_y3upkg42xe"(), "qti"."__constant_uij2fonltq"(), "qti"."__constant_bkqh2friwv"(), "qti"."__constant_n352p2ccrd"(), "qti"."__constant_7nj7hecpq2"(), "qti"."__constant_sx2lr4try3"(), "qti"."__constant_u7eltifwnk"(), "qti"."__constant_q37pzav2s5"(), "qti"."__constant_nhyhb5mvr7"(), "qti"."__constant_ibiapjhixk"(), "qti"."__constant_rqwqzvpydz"(), "qti"."__constant_o42tylpu3f"(), "qti"."__constant_zkeuho6kw7"(), "qti"."__constant_l73fpgyu4v"(), "qti"."__constant_zivpez3hny"(), "qti"."__constant_caimmsgsgb"(), "qti"."__constant_6tjsmg7qqf"(), "qti"."__constant_hmibfx5gyk"(), "qti"."__constant_j4ofs3gxv5"(), "qti"."__constant_ncvuf24xxr"(), "qti"."__constant_ykvwltiwpp"(), "qti"."__constant_ws3pydhm4h"(), "qti"."__constant_hfsih7hle2"(), "qti"."__constant_6elmo3tsbj"(), "qti"."__constant_ibciimd7k5"(), "qti"."__constant_wzcsm5lgek"(), "qti"."__constant_sxvrbj5e5g"(), "qti"."__constant_npu4wt2fbp"(), "qti"."__constant_is5wq7ypst"(), "qti"."__constant_g6dpbehgqq"(), "qti"."__constant_mqruo3kqrm"(), "qti"."__constant_gnajygigus"(), "qti"."__constant_pyzqarxq6e"(), "qti"."__constant_cj5uk4wta2"(), "qti"."__constant_5kz6ofzblb"(), "qti"."__constant_i6uilxd3jo"(), "qti"."__constant_ddolihfto7"(), "qti"."__constant_mqob2q6eth"(), "qti"."__constant_4okg7vcxht"(), "qti"."__constant_cvrzwozguy"(), "qti"."__constant_ciuqwbhuta"(), "qti"."__constant_k5xjolavcb"(), "qti"."__constant_whaydjeagy"(), "qti"."__constant_iiomoobndf"(), "qti"."__constant_u6qipu43gw"(), "qti"."__constant_55zhzij6ga"(), "qti"."__constant_j2u4rcjq6x"(), "qti"."__constant_ndtmde27tx"(), "qti"."__constant_va4x5kw3qm"(), "qti"."__constant_w7ajqoatpc"(), "qti"."__constant_kpxfwusb6s"(), "qti"."__constant_sj4gtqwjvu"(), "qti"."__constant_inwmcukoes"(), "qti"."__constant_mhzhm7i77c"(), "qti"."__constant_qav2thqv4e"(), "qti"."__constant_3e2fnl7lx2"(), "qti"."__constant_2p24sg5e4t"(), "qti"."__constant_exnqxdg5si"(), "qti"."__constant_wrlwssqvsp"(), "qti"."__constant_b6ph5734n4"(), "qti"."__constant_5vczbwx7y7"(), "qti"."__constant_samvsv5x3m"(), "qti"."__constant_ibvgt6pxwh"(), "qti"."__constant_6pgyw625sv"(), "qti"."__constant_komhqujlhe"(), "qti"."__constant_ab562yacjn"(), "qti"."__constant_wvtqnkiky3"(), "qti"."__constant_26d5zth2zv"(), "qti"."__constant_47ksumromp"(), "qti"."__constant_6ktdfd4rhr"(), "qti"."__constant_syl7spvwkk"(), "qti"."__constant_5pcz6dyjzi"(), "qti"."__constant_3zq77hs2za"(), "qti"."__constant_wekllvzqqv"(), "qti"."__constant_5w6ioztupb"(), "qti"."__constant_6f44bj6f5z"(), "qti"."__constant_nomzdv3mb7"(), "qti"."__constant_ftz6h5paqe"(), "qti"."__constant_yzav37j3jv"(), "qti"."__constant_przq27rlwm"(), "qti"."__constant_vjit3yykyx"(), "qti"."__constant_kgrumplmcg"(), "qti"."__constant_wvf3myfrte"(), "qti"."__constant_5r3at22xvz"(), "qti"."__constant_ellk4zorxq"(), "qti"."__constant_aprps52eby"(), "qti"."__constant_ahddjwrhv5"(), "qti"."__constant_k3fjlwxuwn"(), "qti"."__constant_wxfnisv4kj"(), "qti"."__constant_wqg37rggb2"(), "qti"."__constant_hvwnko24pe"(), "qti"."__constant_xvmgsamjvy"(), "qti"."__constant_qtgq7e2fzq"(), "qti"."__constant_5sqocqsf2y"(), "qti"."__constant_lliww2nzpo"(), "qti"."__constant_avnlqmggvi"(), "qti"."__constant_dqbnkda3gg"(), "qti"."__constant_gf6he576t3"(), "qti"."__constant_iksi4cbdex"(), "qti"."__constant_74uvt6ok2v"(), "qti"."__constant_zgknnwrg6p"(), "qti"."__constant_fsmfviu65m"(), "qti"."__constant_on7irbswfh"(), "qti"."__constant_wvuca46fcu"(), "qti"."__constant_7whnbuqq7w"(), "qti"."__constant_akaq3wleoz"(), "qti"."__constant_ho6c7gpjo3"(), "qti"."__constant_ejkw66w2je"(), "qti"."__constant_wnswxzyccu"(), "qti"."__constant_co5t72rjej"(), "qti"."__constant_sl65lnozn2"(), "qti"."__constant_66i4fjuv6n"(), "qti"."__constant_otpfpakmgn"(), "qti"."__constant_p2xwmlesaa"(), "qti"."__constant_fccrluys3c"(), "qti"."__constant_cls5rvcu3r"(), "qti"."__constant_7rkjmglcw6"(), "qti"."__constant_hh7nvhrixk"(), "qti"."__constant_j6uos7o7iw"(), "qti"."__constant_24trt7i5oc"(), "qti"."__constant_kb4fdckstq"(), "qti"."__constant_gazfxeallk"(), "qti"."__constant_7puc5uc6kh"(), "qti"."__constant_wekhard5xm"(), "qti"."__constant_fp3wpqejee"(), "qti"."__constant_v34rx6nskb"(), "qti"."__constant_ajahbtka65"(), "qti"."__constant_6iey4mkmde"(), "qti"."__constant_s2clitxmd5"(), "qti"."__constant_ab5qkascpx"(), "qti"."__constant_wjivf4mdvu"(), "qti"."__constant_fe4yby2lv5"(), "qti"."__constant_6g3eprpflt"(), "qti"."__constant_uu3dawwe5n"(), "qti"."__constant_w7hnvtob66"(), "qti"."__constant_y75rhchi3d"(), "qti"."__constant_i6vdhwqaoa"(), "qti"."__constant_sn5ucr2eat"(), "qti"."__constant_dtz4lgxf7y"(), "qti"."__constant_sjctib2m6a"(), "qti"."__constant_vyp2frjbbo"(), "qti"."__constant_diad23iigw"(), "qti"."__constant_rwijlqnagg"(), "qti"."__constant_asc2ypkhox"(), "qti"."__constant_aiwrmlshlf"(), "qti"."__constant_tzvpybzw74"(), "qti"."__constant_ioawzxl5py"(), "qti"."__constant_w6q5m4enxi"(), "qti"."__admission_map_names_pguqjlp5mf"(), "qti"."__align_direction_names_vluq7iazdg"(), "qti"."__align_state_names_ffk37slxn3"(), "qti"."__attribute_model_names_nxe2p5tkgj"(), "qti"."__attribute_name_names_q6tmzcty4e"(), "qti"."__attribute_slot_names_4r5l4mp24z"(), "qti"."__base_type_names_ok3nu5nck4"(), "qti"."__bound_facet_names_b7dbsbn4iu"(), "qti"."__bound_zero_names_2iyjgurtgw"(), "qti"."__built_in_names_qkzs4cgupe"(), "qti"."__cardinality_names_kqiairsoqa"(), "qti"."__cn_base_names_2wtzhyubck"(), "qti"."__cn_part_names_6db2fcgfhy"(), "qti"."__cn_part_form_names_te7u7jycdu"(), "qti"."__cn_type_names_wmjelllvhg"(), "qti"."__content_model_names_mtfi4p233t"(), "qti"."__declaration_kind_names_o62wpad2p7"(), "qti"."__document_type_names_25wlaz4cvg"(), "qti"."__domain_primitive_names_2yihitx2to"(), "qti"."__entry_kind_names_km5xejbmwu"(), "qti"."__flag_names_dttyznb5cw"(), "qti"."__follow_set_names_hjehsydj6w"(), "qti"."__governor_names_d7jfyla3na"(), "qti"."__href_scope_names_y4pbuo4f5q"(), "qti"."__identity_names_rrxxe77wjj"(), "qti"."__include_set_names_6bs2sxuszz"(), "qti"."__language_names_pvmtywwssv"(), "qti"."__node_kind_names_ulbko553n7"(), "qti"."__position_names_sglcn7ygpg"(), "qti"."__reference_form_names_gm6ro5a5jp"(), "qti"."__reference_resolution_names_3knvypuotm"(), "qti"."__reference_spelling_names_gocqpuf7tl"(), "qti"."__referenced_table_names_qrpsijquzz"(), "qti"."__resource_type_names_lit2ie7nf4"(), "qti"."__rounding_holds_names_6j2zaayymp"(), "qti"."__rp_template_names_tkkjkmwhuf"(), "qti"."__shared_model_names_5s5lwnfjh3"(), "qti"."__symbol_set_names_7wklvi4qhu"(), "qti"."__type_name_names_arumhtuxer"(), "qti"."__use_names_vmbq6fav2t"(), "qti"."__value_base_names_pjzlcpdwvv"(), "qti"."__value_cardinality_names_wzwznoycgf"(), "qti"."__value_domain_names_iuifu35b3z"(), "qti"."__xml_standalone_names_psf7bszcug"(), "qti"."__attribute_name_live_7ot3c4gfh5"(), "qti"."__attribute_slot_live_g5haf24jp3"(), "qti"."__flag_live_egdpt3c4t6"(), "qti"."__node_kind_live_rds6vphboo"(), "qti"."__position_live_uvhnssun3f"(), "qti"."__value_base_live_trk5bm7ra5"(), "qti"."__value_cardinality_live_qbccqbzssx"() FROM :"qti_queries__author";

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
REVOKE TEMPORARY ON DATABASE :"DBNAME" FROM :"qti_queries__author";

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
GRANT USAGE ON SCHEMA "qti", "qti_queries", "qti_queries__author" TO :"qti_queries__author";

GRANT USAGE ON DOMAIN "qti"."__attribute_slot_bits_112_aecznthxg5", "qti"."__flag_bits_12_i4uhexylc4", "qti"."__value_base_bits_16_7t6pwwxbsh", "qti"."__value_cardinality_bits_8_mma4mwhphy", "qti"."__domain_gfw43vigph", "qti"."admission_map", "qti"."align_direction", "qti"."align_state", "qti"."attribute_model", "qti"."attribute_name", "qti"."attribute_slot", "qti"."base_type", "qti"."bound_facet", "qti"."bound_zero", "qti"."built_in", "qti"."cardinality", "qti"."cn_base", "qti"."cn_part", "qti"."cn_part_form", "qti"."cn_type", "qti"."content_model", "qti"."declaration_kind", "qti"."document_type", "qti"."domain_primitive", "qti"."entry_kind", "qti"."flag", "qti"."follow_set", "qti"."governor", "qti"."href_scope", "qti"."identity", "qti"."include_set", "qti"."language", "qti"."node_kind", "qti"."position", "qti"."reference_form", "qti"."reference_resolution", "qti"."reference_spelling", "qti"."referenced_table", "qti"."resource_type", "qti"."rounding_holds", "qti"."rp_template", "qti"."shared_model", "qti"."symbol_set", "qti"."type_name", "qti"."use", "qti"."value_base", "qti"."value_cardinality", "qti"."value_domain", "qti"."xml_standalone", "qti"."__text_xj3zno7u3h", "qti"."__text_c6iptmtj2x", "qti"."__text_wchibbb5qm", "qti"."__text_4s4od7s5or", "qti"."__text_qswrkft5qs", "qti"."__text_76pfa5avf4", "qti"."__text_gke7uypkov", "qti"."__text_l7nqeazg5h", "qti"."__text_k5kwygzatl", "qti"."__text_7dfilirtp3", "qti"."__text_7j6kgluyjp", "qti"."__text_xey6ryorh5", "qti"."__text_lnwfx5ijx4", "qti"."__text_lkpwkpgaib", "qti"."__text_w7a4l3clst", "qti"."__text_psn65t7m7e", "qti"."__text_23rzixl3a2", "qti"."__text_6zspo66rxv", "qti"."__text_vrcyezm7ka", "qti"."__text_7cbjao7rjc", "qti"."__text_zij47sgley", "qti"."__text_b6ykamoeho", "qti"."__text_xv5q2k3cum", "qti"."__text_3dlgl63rv6", "qti"."__text_mvb6rz2wwz", "qti"."__text_aezrarw5qb", "qti"."__text_3adwbksayk" TO :"qti_queries__author";

GRANT SELECT ON TABLE "qti_queries__author"."area_mapping", "qti_queries__author"."area_mapping_cardinality", "qti_queries__author"."assembled_catalog", "qti_queries__author"."assessment_object", "qti_queries__author"."attribute", "qti_queries__author"."attribute_entity", "qti_queries__author"."binding_base_type", "qti_queries__author"."binding_cardinality", "qti_queries__author"."binding_declaration", "qti_queries__author"."binding_name", "qti_queries__author"."bound_variable", "qti_queries__author"."candidate_path", "qti_queries__author"."card_support", "qti_queries__author"."catalog_id", "qti_queries__author"."catalog_ref", "qti_queries__author"."catalog_scope", "qti_queries__author"."catalog_target", "qti_queries__author"."cell_headers", "qti_queries__author"."cell_leaf", "qti_queries__author"."choice", "qti_queries__author"."choice_interaction", "qti_queries__author"."cn_attribute", "qti_queries__author"."cn_count", "qti_queries__author"."cn_part_text", "qti_queries__author"."cn_slot", "qti_queries__author"."comment", "qti_queries__author"."context_ref", "qti_queries__author"."context_ref_declaration", "qti_queries__author"."count_bound", "qti_queries__author"."data_ssml", "qti_queries__author"."data_ssml_member", "qti_queries__author"."data_ssml_property", "qti_queries__author"."declaration", "qti_queries__author"."declaration_base_type", "qti_queries__author"."declaration_cardinality", "qti_queries__author"."declaration_identifier", "qti_queries__author"."declaration_name", "qti_queries__author"."default_entry", "qti_queries__author"."dependency", "qti_queries__author"."doctype", "qti_queries__author"."document", "qti_queries__author"."document_id", "qti_queries__author"."element_type", "qti_queries__author"."encoding_decl", "qti_queries__author"."entry", "qti_queries__author"."expression", "qti_queries__author"."expression_attribute", "qti_queries__author"."feedback_ref", "qti_queries__author"."feedback_ref_cardinality", "qti_queries__author"."feedback_ref_declaration", "qti_queries__author"."file", "qti_queries__author"."fragment_context_name", "qti_queries__author"."fragment_context_ref", "qti_queries__author"."fragment_context_ref_declaration", "qti_queries__author"."fragment_feedback_name", "qti_queries__author"."fragment_feedback_ref", "qti_queries__author"."fragment_feedback_ref_cardinality", "qti_queries__author"."fragment_feedback_ref_declaration", "qti_queries__author"."fragment_printed_name", "qti_queries__author"."fragment_printed_ref", "qti_queries__author"."fragment_printed_ref_declaration", "qti_queries__author"."fragment_scope", "qti_queries__author"."fragment_template_name", "qti_queries__author"."fragment_template_ref", "qti_queries__author"."fragment_template_ref_cardinality", "qti_queries__author"."fragment_template_ref_declaration", "qti_queries__author"."header_token", "qti_queries__author"."hottext", "qti_queries__author"."identity_text", "qti_queries__author"."idref", "qti_queries__author"."idref_target", "qti_queries__author"."inclusion", "qti_queries__author"."instance", "qti_queries__author"."interaction", "qti_queries__author"."interaction_attribute", "qti_queries__author"."item_mode", "qti_queries__author"."item_ref_document", "qti_queries__author"."item_ref_href", "qti_queries__author"."label_use", "qti_queries__author"."least_count", "qti_queries__author"."literal", "qti_queries__author"."literal_typed", "qti_queries__author"."lookup_table", "qti_queries__author"."lookup_table_cardinality", "qti_queries__author"."lookup_value", "qti_queries__author"."lookup_value_type", "qti_queries__author"."manifest_id", "qti_queries__author"."map_key", "qti_queries__author"."map_key_type", "qti_queries__author"."mapping", "qti_queries__author"."mapping_base_type", "qti_queries__author"."mapping_cardinality", "qti_queries__author"."mastery_ceiling", "qti_queries__author"."mastery_floor", "qti_queries__author"."mastery_value", "qti_queries__author"."math_action", "qti_queries__author"."math_align_group", "qti_queries__author"."math_align_scope", "qti_queries__author"."math_cell", "qti_queries__author"."math_cn", "qti_queries__author"."math_dir", "qti_queries__author"."math_rank", "qti_queries__author"."media", "qti_queries__author"."most_count", "qti_queries__author"."named", "qti_queries__author"."namespace", "qti_queries__author"."node", "qti_queries__author"."normal_maximum", "qti_queries__author"."normal_minimum", "qti_queries__author"."object_identifier", "qti_queries__author"."object_title", "qti_queries__author"."open_attribute", "qti_queries__author"."open_attribute_entity", "qti_queries__author"."open_element_name", "qti_queries__author"."open_element_type", "qti_queries__author"."package", "qti_queries__author"."pci_module_form", "qti_queries__author"."pi", "qti_queries__author"."placed_binding", "qti_queries__author"."placed_binding_base_type", "qti_queries__author"."placed_binding_cardinality", "qti_queries__author"."placed_binding_declaration", "qti_queries__author"."placed_catalog_ref", "qti_queries__author"."placed_choice", "qti_queries__author"."placed_hottext", "qti_queries__author"."placed_id", "qti_queries__author"."placed_idref", "qti_queries__author"."placed_math_rank", "qti_queries__author"."placed_share_target", "qti_queries__author"."placed_variable_ref", "qti_queries__author"."placed_variable_ref_declaration", "qti_queries__author"."placed_xml_lang", "qti_queries__author"."printed_variable_ref", "qti_queries__author"."printed_variable_ref_declaration", "qti_queries__author"."processing", "qti_queries__author"."processing_template", "qti_queries__author"."record_field", "qti_queries__author"."reference", "qti_queries__author"."reference_path", "qti_queries__author"."referring_document", "qti_queries__author"."resource_document", "qti_queries__author"."resource_href", "qti_queries__author"."resource_id", "qti_queries__author"."resource_typed", "qti_queries__author"."rounding", "qti_queries__author"."rounding_figures", "qti_queries__author"."rounding_mode", "qti_queries__author"."rounding_mode_figures", "qti_queries__author"."sd_decl", "qti_queries__author"."share_fragment", "qti_queries__author"."share_target", "qti_queries__author"."site", "qti_queries__author"."site_path", "qti_queries__author"."site_target", "qti_queries__author"."srcset", "qti_queries__author"."srcset_candidate", "qti_queries__author"."ssml_attribute", "qti_queries__author"."ssml_scope", "qti_queries__author"."statistic_date", "qti_queries__author"."stimulus_ref", "qti_queries__author"."table_header", "qti_queries__author"."table_scope", "qti_queries__author"."template_ref", "qti_queries__author"."template_ref_cardinality", "qti_queries__author"."template_ref_declaration", "qti_queries__author"."test_document", "qti_queries__author"."test_token", "qti_queries__author"."text_idref", "qti_queries__author"."text_reference", "qti_queries__author"."text_reference_path", "qti_queries__author"."tolerance", "qti_queries__author"."tolerance_token", "qti_queries__author"."usage_base_type", "qti_queries__author"."usage_value", "qti_queries__author"."usage_value_base_type", "qti_queries__author"."value_base_type", "qti_queries__author"."variable_ref", "qti_queries__author"."variable_ref_cardinality", "qti_queries__author"."variable_ref_declaration", "qti_queries__author"."variable_ref_table", "qti_queries__author"."xml_decl", "qti_queries__author"."xml_lang" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."area_mapping" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."area_mapping_cardinality" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."assembled_catalog" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."assessment_object" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."attribute" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."attribute_entity" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."binding_base_type" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."binding_cardinality" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."binding_declaration" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."binding_name" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."bound_variable" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."candidate_path" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."card_support" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."catalog_id" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."catalog_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."catalog_scope" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."catalog_target" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."cell_headers" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."cell_leaf" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."choice" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."choice_interaction" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."cn_attribute" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."cn_count" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."cn_part_text" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."cn_slot" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."comment" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."context_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."context_ref_declaration" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."count_bound" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."data_ssml" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."data_ssml_member" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."data_ssml_property" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."declaration" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."declaration_base_type" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."declaration_cardinality" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."declaration_identifier" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."declaration_name" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."default_entry" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."dependency" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."doctype" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."document" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."document_id" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."element_type" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."encoding_decl" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."entry" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."expression" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."expression_attribute" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."feedback_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."feedback_ref_cardinality" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."feedback_ref_declaration" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."file" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."fragment_context_name" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."fragment_context_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."fragment_context_ref_declaration" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."fragment_feedback_name" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."fragment_feedback_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."fragment_feedback_ref_cardinality" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."fragment_feedback_ref_declaration" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."fragment_printed_name" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."fragment_printed_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."fragment_printed_ref_declaration" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."fragment_scope" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."fragment_template_name" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."fragment_template_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."fragment_template_ref_cardinality" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."fragment_template_ref_declaration" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."header_token" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."hottext" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."identity_text" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."idref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."idref_target" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."inclusion" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."instance" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."interaction" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."interaction_attribute" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."item_mode" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."item_ref_document" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."item_ref_href" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."label_use" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."least_count" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."literal" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."literal_typed" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."lookup_table" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."lookup_table_cardinality" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."lookup_value" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."lookup_value_type" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."manifest_id" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."map_key" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."map_key_type" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."mapping" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."mapping_base_type" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."mapping_cardinality" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."mastery_ceiling" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."mastery_floor" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."mastery_value" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."math_action" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."math_align_group" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."math_align_scope" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."math_cell" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."math_cn" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."math_dir" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."math_rank" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."media" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."most_count" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."named" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."namespace" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."node" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."normal_maximum" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."normal_minimum" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."object_identifier" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."object_title" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."open_attribute" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."open_attribute_entity" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."open_element_name" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."open_element_type" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."package" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."pci_module_form" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."pi" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_binding" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_binding_base_type" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_binding_cardinality" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_binding_declaration" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_catalog_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_choice" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_hottext" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_id" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_idref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_math_rank" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_share_target" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_variable_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_variable_ref_declaration" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_xml_lang" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."printed_variable_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."printed_variable_ref_declaration" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."processing" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."processing_template" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."record_field" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."reference" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."reference_path" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."referring_document" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."resource_document" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."resource_href" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."resource_id" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."resource_typed" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."rounding" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."rounding_figures" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."rounding_mode" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."rounding_mode_figures" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."sd_decl" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."share_fragment" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."share_target" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."site" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."site_path" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."site_target" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."srcset" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."srcset_candidate" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."ssml_attribute" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."ssml_scope" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."statistic_date" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."stimulus_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."table_header" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."table_scope" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."template_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."template_ref_cardinality" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."template_ref_declaration" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."test_document" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."test_token" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."text_idref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."text_reference" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."text_reference_path" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."tolerance" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."tolerance_token" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."usage_base_type" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."usage_value" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."usage_value_base_type" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."value_base_type" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."variable_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."variable_ref_cardinality" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."variable_ref_declaration" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."variable_ref_table" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."xml_decl" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."xml_lang" TO :"qti_queries__author";

GRANT EXECUTE ON FUNCTION "qti"."__refuse"("pg_catalog"."text", "pg_catalog"."text", "pg_catalog"."text") TO :"qti_queries__author";

GRANT EXECUTE ON FUNCTION "qti"."__constant_y3upkg42xe"(), "qti"."__constant_uij2fonltq"(), "qti"."__constant_bkqh2friwv"(), "qti"."__constant_n352p2ccrd"(), "qti"."__constant_7nj7hecpq2"(), "qti"."__constant_sx2lr4try3"(), "qti"."__constant_u7eltifwnk"(), "qti"."__constant_q37pzav2s5"(), "qti"."__constant_nhyhb5mvr7"(), "qti"."__constant_ibiapjhixk"(), "qti"."__constant_rqwqzvpydz"(), "qti"."__constant_o42tylpu3f"(), "qti"."__constant_zkeuho6kw7"(), "qti"."__constant_l73fpgyu4v"(), "qti"."__constant_zivpez3hny"(), "qti"."__constant_caimmsgsgb"(), "qti"."__constant_6tjsmg7qqf"(), "qti"."__constant_hmibfx5gyk"(), "qti"."__constant_j4ofs3gxv5"(), "qti"."__constant_ncvuf24xxr"(), "qti"."__constant_ykvwltiwpp"(), "qti"."__constant_ws3pydhm4h"(), "qti"."__constant_hfsih7hle2"(), "qti"."__constant_6elmo3tsbj"(), "qti"."__constant_ibciimd7k5"(), "qti"."__constant_wzcsm5lgek"(), "qti"."__constant_sxvrbj5e5g"(), "qti"."__constant_npu4wt2fbp"(), "qti"."__constant_is5wq7ypst"(), "qti"."__constant_g6dpbehgqq"(), "qti"."__constant_mqruo3kqrm"(), "qti"."__constant_gnajygigus"(), "qti"."__constant_pyzqarxq6e"(), "qti"."__constant_cj5uk4wta2"(), "qti"."__constant_5kz6ofzblb"(), "qti"."__constant_i6uilxd3jo"(), "qti"."__constant_ddolihfto7"(), "qti"."__constant_mqob2q6eth"(), "qti"."__constant_4okg7vcxht"(), "qti"."__constant_cvrzwozguy"(), "qti"."__constant_ciuqwbhuta"(), "qti"."__constant_k5xjolavcb"(), "qti"."__constant_whaydjeagy"(), "qti"."__constant_iiomoobndf"(), "qti"."__constant_u6qipu43gw"(), "qti"."__constant_55zhzij6ga"(), "qti"."__constant_j2u4rcjq6x"(), "qti"."__constant_ndtmde27tx"(), "qti"."__constant_va4x5kw3qm"(), "qti"."__constant_w7ajqoatpc"(), "qti"."__constant_kpxfwusb6s"(), "qti"."__constant_sj4gtqwjvu"(), "qti"."__constant_inwmcukoes"(), "qti"."__constant_mhzhm7i77c"(), "qti"."__constant_qav2thqv4e"(), "qti"."__constant_3e2fnl7lx2"(), "qti"."__constant_2p24sg5e4t"(), "qti"."__constant_exnqxdg5si"(), "qti"."__constant_wrlwssqvsp"(), "qti"."__constant_b6ph5734n4"(), "qti"."__constant_5vczbwx7y7"(), "qti"."__constant_samvsv5x3m"(), "qti"."__constant_ibvgt6pxwh"(), "qti"."__constant_6pgyw625sv"(), "qti"."__constant_komhqujlhe"(), "qti"."__constant_ab562yacjn"(), "qti"."__constant_wvtqnkiky3"(), "qti"."__constant_26d5zth2zv"(), "qti"."__constant_47ksumromp"(), "qti"."__constant_6ktdfd4rhr"(), "qti"."__constant_syl7spvwkk"(), "qti"."__constant_5pcz6dyjzi"(), "qti"."__constant_3zq77hs2za"(), "qti"."__constant_wekllvzqqv"(), "qti"."__constant_5w6ioztupb"(), "qti"."__constant_6f44bj6f5z"(), "qti"."__constant_nomzdv3mb7"(), "qti"."__constant_ftz6h5paqe"(), "qti"."__constant_yzav37j3jv"(), "qti"."__constant_przq27rlwm"(), "qti"."__constant_vjit3yykyx"(), "qti"."__constant_kgrumplmcg"(), "qti"."__constant_wvf3myfrte"(), "qti"."__constant_5r3at22xvz"(), "qti"."__constant_ellk4zorxq"(), "qti"."__constant_aprps52eby"(), "qti"."__constant_ahddjwrhv5"(), "qti"."__constant_k3fjlwxuwn"(), "qti"."__constant_wxfnisv4kj"(), "qti"."__constant_wqg37rggb2"(), "qti"."__constant_hvwnko24pe"(), "qti"."__constant_xvmgsamjvy"(), "qti"."__constant_qtgq7e2fzq"(), "qti"."__constant_5sqocqsf2y"(), "qti"."__constant_lliww2nzpo"(), "qti"."__constant_avnlqmggvi"(), "qti"."__constant_dqbnkda3gg"(), "qti"."__constant_gf6he576t3"(), "qti"."__constant_iksi4cbdex"(), "qti"."__constant_74uvt6ok2v"(), "qti"."__constant_zgknnwrg6p"(), "qti"."__constant_fsmfviu65m"(), "qti"."__constant_on7irbswfh"(), "qti"."__constant_wvuca46fcu"(), "qti"."__constant_7whnbuqq7w"(), "qti"."__constant_akaq3wleoz"(), "qti"."__constant_ho6c7gpjo3"(), "qti"."__constant_ejkw66w2je"(), "qti"."__constant_wnswxzyccu"(), "qti"."__constant_co5t72rjej"(), "qti"."__constant_sl65lnozn2"(), "qti"."__constant_66i4fjuv6n"(), "qti"."__constant_otpfpakmgn"(), "qti"."__constant_p2xwmlesaa"(), "qti"."__constant_fccrluys3c"(), "qti"."__constant_cls5rvcu3r"(), "qti"."__constant_7rkjmglcw6"(), "qti"."__constant_hh7nvhrixk"(), "qti"."__constant_j6uos7o7iw"(), "qti"."__constant_24trt7i5oc"(), "qti"."__constant_kb4fdckstq"(), "qti"."__constant_gazfxeallk"(), "qti"."__constant_7puc5uc6kh"(), "qti"."__constant_wekhard5xm"(), "qti"."__constant_fp3wpqejee"(), "qti"."__constant_v34rx6nskb"(), "qti"."__constant_ajahbtka65"(), "qti"."__constant_6iey4mkmde"(), "qti"."__constant_s2clitxmd5"(), "qti"."__constant_ab5qkascpx"(), "qti"."__constant_wjivf4mdvu"(), "qti"."__constant_fe4yby2lv5"(), "qti"."__constant_6g3eprpflt"(), "qti"."__constant_uu3dawwe5n"(), "qti"."__constant_w7hnvtob66"(), "qti"."__constant_y75rhchi3d"(), "qti"."__constant_i6vdhwqaoa"(), "qti"."__constant_sn5ucr2eat"(), "qti"."__constant_dtz4lgxf7y"(), "qti"."__constant_sjctib2m6a"(), "qti"."__constant_vyp2frjbbo"(), "qti"."__constant_diad23iigw"(), "qti"."__constant_rwijlqnagg"(), "qti"."__constant_asc2ypkhox"(), "qti"."__constant_aiwrmlshlf"(), "qti"."__constant_tzvpybzw74"(), "qti"."__constant_ioawzxl5py"(), "qti"."__constant_w6q5m4enxi"(), "qti"."__admission_map_names_pguqjlp5mf"(), "qti"."__align_direction_names_vluq7iazdg"(), "qti"."__align_state_names_ffk37slxn3"(), "qti"."__attribute_model_names_nxe2p5tkgj"(), "qti"."__attribute_name_names_q6tmzcty4e"(), "qti"."__attribute_slot_names_4r5l4mp24z"(), "qti"."__base_type_names_ok3nu5nck4"(), "qti"."__bound_facet_names_b7dbsbn4iu"(), "qti"."__bound_zero_names_2iyjgurtgw"(), "qti"."__built_in_names_qkzs4cgupe"(), "qti"."__cardinality_names_kqiairsoqa"(), "qti"."__cn_base_names_2wtzhyubck"(), "qti"."__cn_part_names_6db2fcgfhy"(), "qti"."__cn_part_form_names_te7u7jycdu"(), "qti"."__cn_type_names_wmjelllvhg"(), "qti"."__content_model_names_mtfi4p233t"(), "qti"."__declaration_kind_names_o62wpad2p7"(), "qti"."__document_type_names_25wlaz4cvg"(), "qti"."__domain_primitive_names_2yihitx2to"(), "qti"."__entry_kind_names_km5xejbmwu"(), "qti"."__flag_names_dttyznb5cw"(), "qti"."__follow_set_names_hjehsydj6w"(), "qti"."__governor_names_d7jfyla3na"(), "qti"."__href_scope_names_y4pbuo4f5q"(), "qti"."__identity_names_rrxxe77wjj"(), "qti"."__include_set_names_6bs2sxuszz"(), "qti"."__language_names_pvmtywwssv"(), "qti"."__node_kind_names_ulbko553n7"(), "qti"."__position_names_sglcn7ygpg"(), "qti"."__reference_form_names_gm6ro5a5jp"(), "qti"."__reference_resolution_names_3knvypuotm"(), "qti"."__reference_spelling_names_gocqpuf7tl"(), "qti"."__referenced_table_names_qrpsijquzz"(), "qti"."__resource_type_names_lit2ie7nf4"(), "qti"."__rounding_holds_names_6j2zaayymp"(), "qti"."__rp_template_names_tkkjkmwhuf"(), "qti"."__shared_model_names_5s5lwnfjh3"(), "qti"."__symbol_set_names_7wklvi4qhu"(), "qti"."__type_name_names_arumhtuxer"(), "qti"."__use_names_vmbq6fav2t"(), "qti"."__value_base_names_pjzlcpdwvv"(), "qti"."__value_cardinality_names_wzwznoycgf"(), "qti"."__value_domain_names_iuifu35b3z"(), "qti"."__xml_standalone_names_psf7bszcug"(), "qti"."__attribute_name_live_7ot3c4gfh5"(), "qti"."__attribute_slot_live_g5haf24jp3"(), "qti"."__flag_live_egdpt3c4t6"(), "qti"."__node_kind_live_rds6vphboo"(), "qti"."__position_live_uvhnssun3f"(), "qti"."__value_base_live_trk5bm7ra5"(), "qti"."__value_cardinality_live_qbccqbzssx"() TO :"qti_queries__author";

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
GRANT TEMPORARY ON DATABASE :"DBNAME" TO :"qti_queries__author";

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
REVOKE ALL ON SCHEMA "qti", "qti_queries", "qti_queries__author" FROM PUBLIC;

REVOKE ALL ON TABLE "qti"."area_mapping", "qti"."area_mapping_cardinality", "qti"."assembled_catalog", "qti"."assessment_object", "qti"."attribute", "qti"."attribute_entity", "qti"."binding_base_type", "qti"."binding_cardinality", "qti"."binding_declaration", "qti"."binding_name", "qti"."bound_variable", "qti"."candidate_path", "qti"."card_support", "qti"."catalog_id", "qti"."catalog_ref", "qti"."catalog_scope", "qti"."catalog_target", "qti"."cell_headers", "qti"."cell_leaf", "qti"."choice", "qti"."choice_interaction", "qti"."cn_attribute", "qti"."cn_count", "qti"."cn_part_text", "qti"."cn_slot", "qti"."comment", "qti"."context_ref", "qti"."context_ref_declaration", "qti"."count_bound", "qti"."data_ssml", "qti"."data_ssml_member", "qti"."data_ssml_property", "qti"."declaration", "qti"."declaration_base_type", "qti"."declaration_cardinality", "qti"."declaration_identifier", "qti"."declaration_name", "qti"."default_entry", "qti"."dependency", "qti"."doctype", "qti"."document", "qti"."document_id", "qti"."element_type", "qti"."encoding_decl", "qti"."entry", "qti"."expression", "qti"."expression_attribute", "qti"."feedback_ref", "qti"."feedback_ref_cardinality", "qti"."feedback_ref_declaration", "qti"."file", "qti"."fragment_context_name", "qti"."fragment_context_ref", "qti"."fragment_context_ref_declaration", "qti"."fragment_feedback_name", "qti"."fragment_feedback_ref", "qti"."fragment_feedback_ref_cardinality", "qti"."fragment_feedback_ref_declaration", "qti"."fragment_printed_name", "qti"."fragment_printed_ref", "qti"."fragment_printed_ref_declaration", "qti"."fragment_scope", "qti"."fragment_template_name", "qti"."fragment_template_ref", "qti"."fragment_template_ref_cardinality", "qti"."fragment_template_ref_declaration", "qti"."header_token", "qti"."hottext", "qti"."identity_text", "qti"."idref", "qti"."idref_target", "qti"."inclusion", "qti"."instance", "qti"."interaction", "qti"."interaction_attribute", "qti"."item_mode", "qti"."item_ref_document", "qti"."item_ref_href", "qti"."label_use", "qti"."least_count", "qti"."literal", "qti"."literal_typed", "qti"."lookup_table", "qti"."lookup_table_cardinality", "qti"."lookup_value", "qti"."lookup_value_type", "qti"."manifest_id", "qti"."map_key", "qti"."map_key_type", "qti"."mapping", "qti"."mapping_base_type", "qti"."mapping_cardinality", "qti"."mastery_ceiling", "qti"."mastery_floor", "qti"."mastery_value", "qti"."math_action", "qti"."math_align_group", "qti"."math_align_scope", "qti"."math_cell", "qti"."math_cn", "qti"."math_dir", "qti"."math_rank", "qti"."media", "qti"."most_count", "qti"."named", "qti"."namespace", "qti"."node", "qti"."normal_maximum", "qti"."normal_minimum", "qti"."object_identifier", "qti"."object_title", "qti"."open_attribute", "qti"."open_attribute_entity", "qti"."open_element_name", "qti"."open_element_type", "qti"."package", "qti"."pci_module_form", "qti"."pi", "qti"."placed_binding", "qti"."placed_binding_base_type", "qti"."placed_binding_cardinality", "qti"."placed_binding_declaration", "qti"."placed_catalog_ref", "qti"."placed_choice", "qti"."placed_hottext", "qti"."placed_id", "qti"."placed_idref", "qti"."placed_math_rank", "qti"."placed_share_target", "qti"."placed_variable_ref", "qti"."placed_variable_ref_declaration", "qti"."placed_xml_lang", "qti"."printed_variable_ref", "qti"."printed_variable_ref_declaration", "qti"."processing", "qti"."processing_template", "qti"."record_field", "qti"."reference", "qti"."reference_path", "qti"."referring_document", "qti"."resource_document", "qti"."resource_href", "qti"."resource_id", "qti"."resource_typed", "qti"."rounding", "qti"."rounding_figures", "qti"."rounding_mode", "qti"."rounding_mode_figures", "qti"."sd_decl", "qti"."share_fragment", "qti"."share_target", "qti"."site", "qti"."site_path", "qti"."site_target", "qti"."srcset", "qti"."srcset_candidate", "qti"."ssml_attribute", "qti"."ssml_scope", "qti"."statistic_date", "qti"."stimulus_ref", "qti"."table_header", "qti"."table_scope", "qti"."template_ref", "qti"."template_ref_cardinality", "qti"."template_ref_declaration", "qti"."test_document", "qti"."test_token", "qti"."text_idref", "qti"."text_reference", "qti"."text_reference_path", "qti"."tolerance", "qti"."tolerance_token", "qti"."usage_base_type", "qti"."usage_value", "qti"."usage_value_base_type", "qti"."value_base_type", "qti"."variable_ref", "qti"."variable_ref_cardinality", "qti"."variable_ref_declaration", "qti"."variable_ref_table", "qti"."xml_decl", "qti"."xml_lang", "qti_queries__author"."area_mapping", "qti_queries__author"."area_mapping_cardinality", "qti_queries__author"."assembled_catalog", "qti_queries__author"."assessment_object", "qti_queries__author"."attribute", "qti_queries__author"."attribute_entity", "qti_queries__author"."binding_base_type", "qti_queries__author"."binding_cardinality", "qti_queries__author"."binding_declaration", "qti_queries__author"."binding_name", "qti_queries__author"."bound_variable", "qti_queries__author"."candidate_path", "qti_queries__author"."card_support", "qti_queries__author"."catalog_id", "qti_queries__author"."catalog_ref", "qti_queries__author"."catalog_scope", "qti_queries__author"."catalog_target", "qti_queries__author"."cell_headers", "qti_queries__author"."cell_leaf", "qti_queries__author"."choice", "qti_queries__author"."choice_interaction", "qti_queries__author"."cn_attribute", "qti_queries__author"."cn_count", "qti_queries__author"."cn_part_text", "qti_queries__author"."cn_slot", "qti_queries__author"."comment", "qti_queries__author"."context_ref", "qti_queries__author"."context_ref_declaration", "qti_queries__author"."count_bound", "qti_queries__author"."data_ssml", "qti_queries__author"."data_ssml_member", "qti_queries__author"."data_ssml_property", "qti_queries__author"."declaration", "qti_queries__author"."declaration_base_type", "qti_queries__author"."declaration_cardinality", "qti_queries__author"."declaration_identifier", "qti_queries__author"."declaration_name", "qti_queries__author"."default_entry", "qti_queries__author"."dependency", "qti_queries__author"."doctype", "qti_queries__author"."document", "qti_queries__author"."document_id", "qti_queries__author"."element_type", "qti_queries__author"."encoding_decl", "qti_queries__author"."entry", "qti_queries__author"."expression", "qti_queries__author"."expression_attribute", "qti_queries__author"."feedback_ref", "qti_queries__author"."feedback_ref_cardinality", "qti_queries__author"."feedback_ref_declaration", "qti_queries__author"."file", "qti_queries__author"."fragment_context_name", "qti_queries__author"."fragment_context_ref", "qti_queries__author"."fragment_context_ref_declaration", "qti_queries__author"."fragment_feedback_name", "qti_queries__author"."fragment_feedback_ref", "qti_queries__author"."fragment_feedback_ref_cardinality", "qti_queries__author"."fragment_feedback_ref_declaration", "qti_queries__author"."fragment_printed_name", "qti_queries__author"."fragment_printed_ref", "qti_queries__author"."fragment_printed_ref_declaration", "qti_queries__author"."fragment_scope", "qti_queries__author"."fragment_template_name", "qti_queries__author"."fragment_template_ref", "qti_queries__author"."fragment_template_ref_cardinality", "qti_queries__author"."fragment_template_ref_declaration", "qti_queries__author"."header_token", "qti_queries__author"."hottext", "qti_queries__author"."identity_text", "qti_queries__author"."idref", "qti_queries__author"."idref_target", "qti_queries__author"."inclusion", "qti_queries__author"."instance", "qti_queries__author"."interaction", "qti_queries__author"."interaction_attribute", "qti_queries__author"."item_mode", "qti_queries__author"."item_ref_document", "qti_queries__author"."item_ref_href", "qti_queries__author"."label_use", "qti_queries__author"."least_count", "qti_queries__author"."literal", "qti_queries__author"."literal_typed", "qti_queries__author"."lookup_table", "qti_queries__author"."lookup_table_cardinality", "qti_queries__author"."lookup_value", "qti_queries__author"."lookup_value_type", "qti_queries__author"."manifest_id", "qti_queries__author"."map_key", "qti_queries__author"."map_key_type", "qti_queries__author"."mapping", "qti_queries__author"."mapping_base_type", "qti_queries__author"."mapping_cardinality", "qti_queries__author"."mastery_ceiling", "qti_queries__author"."mastery_floor", "qti_queries__author"."mastery_value", "qti_queries__author"."math_action", "qti_queries__author"."math_align_group", "qti_queries__author"."math_align_scope", "qti_queries__author"."math_cell", "qti_queries__author"."math_cn", "qti_queries__author"."math_dir", "qti_queries__author"."math_rank", "qti_queries__author"."media", "qti_queries__author"."most_count", "qti_queries__author"."named", "qti_queries__author"."namespace", "qti_queries__author"."node", "qti_queries__author"."normal_maximum", "qti_queries__author"."normal_minimum", "qti_queries__author"."object_identifier", "qti_queries__author"."object_title", "qti_queries__author"."open_attribute", "qti_queries__author"."open_attribute_entity", "qti_queries__author"."open_element_name", "qti_queries__author"."open_element_type", "qti_queries__author"."package", "qti_queries__author"."pci_module_form", "qti_queries__author"."pi", "qti_queries__author"."placed_binding", "qti_queries__author"."placed_binding_base_type", "qti_queries__author"."placed_binding_cardinality", "qti_queries__author"."placed_binding_declaration", "qti_queries__author"."placed_catalog_ref", "qti_queries__author"."placed_choice", "qti_queries__author"."placed_hottext", "qti_queries__author"."placed_id", "qti_queries__author"."placed_idref", "qti_queries__author"."placed_math_rank", "qti_queries__author"."placed_share_target", "qti_queries__author"."placed_variable_ref", "qti_queries__author"."placed_variable_ref_declaration", "qti_queries__author"."placed_xml_lang", "qti_queries__author"."printed_variable_ref", "qti_queries__author"."printed_variable_ref_declaration", "qti_queries__author"."processing", "qti_queries__author"."processing_template", "qti_queries__author"."record_field", "qti_queries__author"."reference", "qti_queries__author"."reference_path", "qti_queries__author"."referring_document", "qti_queries__author"."resource_document", "qti_queries__author"."resource_href", "qti_queries__author"."resource_id", "qti_queries__author"."resource_typed", "qti_queries__author"."rounding", "qti_queries__author"."rounding_figures", "qti_queries__author"."rounding_mode", "qti_queries__author"."rounding_mode_figures", "qti_queries__author"."sd_decl", "qti_queries__author"."share_fragment", "qti_queries__author"."share_target", "qti_queries__author"."site", "qti_queries__author"."site_path", "qti_queries__author"."site_target", "qti_queries__author"."srcset", "qti_queries__author"."srcset_candidate", "qti_queries__author"."ssml_attribute", "qti_queries__author"."ssml_scope", "qti_queries__author"."statistic_date", "qti_queries__author"."stimulus_ref", "qti_queries__author"."table_header", "qti_queries__author"."table_scope", "qti_queries__author"."template_ref", "qti_queries__author"."template_ref_cardinality", "qti_queries__author"."template_ref_declaration", "qti_queries__author"."test_document", "qti_queries__author"."test_token", "qti_queries__author"."text_idref", "qti_queries__author"."text_reference", "qti_queries__author"."text_reference_path", "qti_queries__author"."tolerance", "qti_queries__author"."tolerance_token", "qti_queries__author"."usage_base_type", "qti_queries__author"."usage_value", "qti_queries__author"."usage_value_base_type", "qti_queries__author"."value_base_type", "qti_queries__author"."variable_ref", "qti_queries__author"."variable_ref_cardinality", "qti_queries__author"."variable_ref_declaration", "qti_queries__author"."variable_ref_table", "qti_queries__author"."xml_decl", "qti_queries__author"."xml_lang" FROM PUBLIC;

REVOKE ALL ON DOMAIN "qti"."admission_map", "qti"."align_direction", "qti"."align_state", "qti"."attribute_model", "qti"."attribute_name", "qti"."__attribute_name_bits_416_thr6i6sipt", "qti"."attribute_slot", "qti"."__attribute_slot_bits_112_aecznthxg5", "qti"."base_type", "qti"."bound_facet", "qti"."bound_zero", "qti"."built_in", "qti"."cardinality", "qti"."cn_base", "qti"."cn_part", "qti"."cn_part_form", "qti"."cn_type", "qti"."content_model", "qti"."declaration_kind", "qti"."document_type", "qti"."domain_primitive", "qti"."entry_kind", "qti"."flag", "qti"."__flag_bits_12_i4uhexylc4", "qti"."follow_set", "qti"."governor", "qti"."href_scope", "qti"."identity", "qti"."include_set", "qti"."language", "qti"."node_kind", "qti"."__node_kind_bits_644_kcdmigfwqm", "qti"."position", "qti"."__position_bits_308_gsnowf36kr", "qti"."reference_form", "qti"."reference_resolution", "qti"."reference_spelling", "qti"."referenced_table", "qti"."resource_type", "qti"."rounding_holds", "qti"."rp_template", "qti"."shared_model", "qti"."symbol_set", "qti"."type_name", "qti"."use", "qti"."value_base", "qti"."__value_base_bits_16_7t6pwwxbsh", "qti"."value_cardinality", "qti"."__value_cardinality_bits_8_mma4mwhphy", "qti"."value_domain", "qti"."xml_standalone", "qti"."__text_xv5q2k3cum", "qti"."__text_6zspo66rxv", "qti"."__text_lnwfx5ijx4", "qti"."__text_c6iptmtj2x", "qti"."__text_wchibbb5qm", "qti"."__text_xj3zno7u3h", "qti"."__text_7j6kgluyjp", "qti"."__text_l7nqeazg5h", "qti"."__text_xey6ryorh5", "qti"."__text_7dfilirtp3", "qti"."__text_sac6h6c6eh", "qti"."__text_vrcyezm7ka", "qti"."__text_zij47sgley", "qti"."__text_gke7uypkov", "qti"."__text_76pfa5avf4", "qti"."__text_mvb6rz2wwz", "qti"."__text_qswrkft5qs", "qti"."__text_7cbjao7rjc", "qti"."__text_w7a4l3clst", "qti"."__text_23rzixl3a2", "qti"."__text_3adwbksayk", "qti"."__text_k5kwygzatl", "qti"."__text_b6ykamoeho", "qti"."__text_4s4od7s5or", "qti"."__text_lkpwkpgaib", "qti"."__text_psn65t7m7e", "qti"."__text_3dlgl63rv6", "qti"."__text_aezrarw5qb", "qti"."__domain_gfw43vigph", "qti"."__param_package_ulo5hrttvh", "qti"."__param_path_wphbbw3r67", "qti"."__param_name_tch4oix6gh" FROM PUBLIC;

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
ALTER DEFAULT PRIVILEGES IN SCHEMA "qti" REVOKE ALL ON TABLES FROM PUBLIC;

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
ALTER DEFAULT PRIVILEGES IN SCHEMA "qti" REVOKE ALL ON SEQUENCES FROM PUBLIC;

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
ALTER DEFAULT PRIVILEGES IN SCHEMA "qti_queries" REVOKE ALL ON TABLES FROM PUBLIC;

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
ALTER DEFAULT PRIVILEGES IN SCHEMA "qti_queries" REVOKE ALL ON SEQUENCES FROM PUBLIC;

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
ALTER DEFAULT PRIVILEGES REVOKE ALL ON FUNCTIONS FROM PUBLIC;

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
ALTER DEFAULT PRIVILEGES REVOKE ALL ON TYPES FROM PUBLIC;

DROP TRIGGER "__capture_update" ON "qti"."operand";

DROP TRIGGER "__capture_insert" ON "qti"."operand";

DROP TRIGGER "__capture_delete" ON "qti"."operand";

DROP TRIGGER "__isolation" ON "qti"."operand";

DROP INDEX "qti"."__xml_lang_ix_package_start_cpin64cbdd";

DROP INDEX "qti"."__xml_lang_ix_package_scope_value_wxj4gyu5fb";

DROP INDEX "qti"."__xml_lang_ix_package_scope_path_value_7gaygefozh";

DROP INDEX "qti"."__variable_ref_table_ix_package_declaration_path_lvxfhhaue5";

DROP INDEX "qti"."__variable_ref_declaration_ix_package_path_sis52dtudg";

DROP INDEX "qti"."__variable_ref_declaration_ix_package_zdfv_3_cvbn_6_uagvoh6kti";

DROP INDEX "qti"."__variable_ref_declaration_ix_package_npwzyp_7_f_46_lwicpkjxdj";

DROP INDEX "qti"."__variable_ref_declaration_ix_package_nci_5_upadgg_limzszwbcb";

DROP INDEX "qti"."__variable_ref_declaration_ix_package_3_q_3_r_2_wreu_3s2ly3uiub";

DROP INDEX "qti"."__variable_ref_cardinality_ix_package_path_6iwabnlhua";

DROP INDEX "qti"."__variable_ref_ix_package_bqryib_25_qm_path_lrzjveznjm";

DROP INDEX "qti"."__variable_ref_ix_package_bfhmg_4_km_4_s_path_4_wa4vxufyhg";

DROP INDEX "qti"."__text_reference_path_ix_package_target_zlcnodi5ns";

DROP INDEX "qti"."__text_idref_ix_package_path_token_ktefasloce";

DROP INDEX "qti"."__template_ref_declaration_ix_package_path_7bwvg7q3un";

DROP INDEX "qti"."__template_ref_declaration_ix_package_nb_6_s_24_lbvy_ye6pqexwiu";

DROP INDEX "qti"."__template_ref_declaration_ix_package_hgm_5_snckn_7_csgp5j7qsn";

DROP INDEX "qti"."__template_ref_cardinality_ix_package_path_p2tfv6ayau";

DROP INDEX "qti"."__template_ref_ix_package_pxfqm_2_obm_2_path_5_apwpsaeh5h";

DROP INDEX "qti"."__ssml_scope_ix_package_fragment_path_62pskuikyf";

DROP INDEX "qti"."__ssml_attribute_ix_package_path_fragment_value_kind_3b7qj7l3qd";

DROP INDEX "qti"."__ssml_attribute_ix_package_path_fragment_start_mu356ufw2p";

DROP INDEX "qti"."__site_path_ix_package_osevq_7_lhy_5_target_2_l7yxjxb6ht";

DROP INDEX "qti"."__site_path_ix_package_o_6_h_35_i_2_ucp_path_2_25vnragwmz";

DROP INDEX "qti"."__site_ix_package_v_3_zrbvlnbj_path_tacdoa_5_nis_2wz6y35dbt";

DROP INDEX "qti"."__site_ix_package_jghisuydfk_path_5_tw_7_x_4_mfjh_zqwbodvouo";

DROP INDEX "qti"."__share_target_ix_package_path_target_start_id_fdo32tapf3";

DROP INDEX "qti"."__share_fragment_ix_package_path_id_f6dfwkahb7";

DROP INDEX "qti"."__share_fragment_ix_package_adpvq_42_kb_2_path_x_35_vmqvvvarvz";

DROP INDEX "qti"."__resource_href_ix_package_target_path_scope_5f6vhm2lwl";

DROP INDEX "qti"."__resource_document_ix_package_type_kdzavd6e7t";

DROP INDEX "qti"."__reference_path_ix_package_target_yoy7ou3ghw";

DROP INDEX "qti"."__reference_path_ix_package_7_t_2_ctw_5_cbp_target_bezykmd6su";

DROP INDEX "qti"."__processing_ix_package_language_path_nwc7fn5bjn";

DROP INDEX "qti"."__printed_variable_ref_declaration_ix_package_path_dbwhe2iehf";

DROP INDEX "qti"."__printed_variable_ref_ix_package_pxfqm_2_obm_2_path_3xg5mxs4ji";

DROP INDEX "qti"."__placed_xml_lang_ix_package_scope_value_sfqpq4jycj";

DROP INDEX "qti"."__placed_xml_lang_ix_package_scope_path_start_lang_hexmxaqdo6";

DROP INDEX "qti"."__placed_xml_lang_ix_package_scope_assembly_value_yz2bw7cdy5";

DROP INDEX "qti"."__placed_variable_ref_declaration_ix_package_path_osfcjkn5xx";

DROP INDEX "qti"."__placed_variable_ref_declaration_ix_package_7eczfygaol";

DROP INDEX "qti"."__placed_variable_ref_declaration_ix_package_a6ev3brkvs";

DROP INDEX "qti"."__placed_variable_ref_ix_package_path_start_2q3l4iq6bv";

DROP INDEX "qti"."__placed_variable_ref_ix_package_assembly_root_kind_ox6jmeuv4f";

DROP INDEX "qti"."__placed_variable_ref_ix_assembly_package_identifier_b5qct3vgya";

DROP INDEX "qti"."__placed_share_target_ix_package_assembly_target_k66b7bmx5u";

DROP INDEX "qti"."__placed_share_target_ix_package_assembly_instance_iapuqjl64s";

DROP INDEX "qti"."__placed_share_target_ix_assembly_package_target_64xcz24di3";

DROP INDEX "qti"."__placed_math_rank_ix_package_assembly_instance_path_xlmxodty27";

DROP INDEX "qti"."__placed_idref_ix_package_path_id_oqjzqlhu4b";

DROP INDEX "qti"."__placed_idref_ix_assembly_id_package_zm6k77reuk";

DROP INDEX "qti"."__placed_id_ix_package_path_start_id_owner_2mw5p3hbhz";

DROP INDEX "qti"."__placed_id_ix_assembly_package_id_owner_path_rsmnsiephu";

DROP INDEX "qti"."__placed_choice_ix_package_path_start_identifier_jk6vt35bcx";

DROP INDEX "qti"."__placed_choice_ix_package_path_start_assembly_fkmwss6hli";

DROP INDEX "qti"."__placed_catalog_ref_ix_package_assembly_id_kdjgjrfc3x";

DROP INDEX "qti"."__placed_binding_declaration_ix_package_assembly_4rbbcj52li";

DROP INDEX "qti"."__placed_binding_declaration_ix_package_nb_6_s_24_vxz4dnxagv";

DROP INDEX "qti"."__placed_binding_cardinality_ix_package_attribute_cr5gzjppfr";

DROP INDEX "qti"."__placed_binding_cardinality_ix_package_attribute_gc3lw7lhy7";

DROP INDEX "qti"."__placed_binding_cardinality_ix_package_assembly_biyser5zpw";

DROP INDEX "qti"."__placed_binding_cardinality_ix_package_b_46_jqvoml_vpw2rw2tvw";

DROP INDEX "qti"."__placed_binding_base_type_ix_package_attribute_etvquvxhfw";

DROP INDEX "qti"."__placed_binding_base_type_ix_package_assembly_ze75ocktky";

DROP INDEX "qti"."__placed_binding_ix_package_assembly_instance_path_u7y4ztcx7f";

DROP INDEX "qti"."__open_attribute_ix_package_qr_6_ir_7_bi_6_e_path_6_gjojof56ot";

DROP INDEX "qti"."__node_ix_package_start_kind_6cqgjghihn";

DROP INDEX "qti"."__node_ix_package_path_nearest_nearest_path_qrx5tkmkpp";

DROP INDEX "qti"."__node_ix_package_parent_start_ujn5hnltaw";

DROP INDEX "qti"."__node_ix_package_parent_path_parent_kind_mi4qx37tbz";

DROP INDEX "qti"."__node_ix_package_parent_path_kind_parent_kind_qjdpdreijy";

DROP INDEX "qti"."__node_ix_package_parent_path_elements_parent_kind_za5pvxs5dj";

DROP INDEX "qti"."__node_ix_package_parent_path_at_oqqth6j7fg";

DROP INDEX "qti"."__node_ix_package_nearest_nearest_kind_nearest_path_3kzdphugxg";

DROP INDEX "qti"."__node_ix_package_kind_path_elements_parent_parent_iizy6sjcxb";

DROP INDEX "qti"."__node_ix_package_kind_parent_kind_path_elements_lmhw45mkiz";

DROP INDEX "qti"."__node_ix_package_kind_parent_kind_document_type_pyxvw6rhdf";

DROP INDEX "qti"."__node_ix_package_yextvrufxr_path_cmcihiv_7_as_start_yxpx6nry6m";

DROP INDEX "qti"."__node_ix_package_vxzxss_64_af_path_43_azipxfum_3odgkngdqm";

DROP INDEX "qti"."__node_ix_package_qr_6_ir_7_bi_6_e_path_6_lewewmqrh_o3wsi3a5sx";

DROP INDEX "qti"."__node_ix_package_qeeyuvkcon_path_7_mjzclno_6_o_kind_mnd5sfgesm";

DROP INDEX "qti"."__node_ix_package_no_3_uxsy_3_vd_path_n_2_opsrpf_5_g_yzivp2hrk3";

DROP INDEX "qti"."__node_ix_package_lep_2_kfaifd_path_qfjbszr_2_eh_dhlkzni4q2";

DROP INDEX "qti"."__node_ix_package_ibbpxcarue_path_yv_7754_sdav_start_bzeevqgfvc";

DROP INDEX "qti"."__node_ix_package_flzsui_4_xks_path_7_bewh_2_d_6_q_7_64w26cqp74";

DROP INDEX "qti"."__node_ix_package_f_7_hxkhuc_5_j_path_a_4_shhdjef_6_nyt6znckbo";

DROP INDEX "qti"."__node_ix_package_bqryib_25_qm_path_paczrrwiks_start_sarupqespv";

DROP INDEX "qti"."__node_ix_package_bfhmg_4_km_4_s_path_4_yypxbmb_7_u_wbn7wsvujs";

DROP INDEX "qti"."__node_ix_package_7_lwwgzz_6_aj_path_6_dz_222_hlfs_whrlojewac";

DROP INDEX "qti"."__node_ix_package_27_hetzadou_path_7_c_57_c_2_ilov_qjg7ch7jmu";

DROP INDEX "qti"."__math_cn_ix_package_jeqf_4_zhgxp_path_aynmgwnhik_enix2j3sq5";

DROP INDEX "qti"."__math_cn_ix_package_djj_6_hmb_3_qc_path_e_6_xum_4_d_4grmtjznso";

DROP INDEX "qti"."__math_align_scope_ix_package_chosen_path_q3dovlpah3";

DROP INDEX "qti"."__math_align_scope_ix_package_cell_inherited_path_gh6uv3byv3";

DROP INDEX "qti"."__math_align_scope_ix_package_yc_7_lh_7_cte_2_path_r_3whwp6tihv";

DROP INDEX "qti"."__mapping_cardinality_ix_package_cardinality_path_ruvry5bpmh";

DROP INDEX "qti"."__mapping_base_type_ix_package_base_type_path_gj3sla5s6s";

DROP INDEX "qti"."__mapping_ix_package_base_types_cardinalities_vdymrcp6q3";

DROP INDEX "qti"."__mapping_ix_package_nb_6_s_24_lbvy_path_wibt_6_fzcm_ghc5ilh53d";

DROP INDEX "qti"."__map_key_type_ix_package_base_type_path_mafohimtvv";

DROP INDEX "qti"."__map_key_ix_package_base_types_path_46b3etxhwz";

DROP INDEX "qti"."__lookup_value_type_ix_package_path_base_type_ishfkvokyk";

DROP INDEX "qti"."__lookup_value_ix_package_base_types_path_h6w6xxqgpe";

DROP INDEX "qti"."__lookup_table_cardinality_ix_package_cardinality_ufv4zqlwl7";

DROP INDEX "qti"."__lookup_table_ix_package_base_types_cardinalities_pnvkm7qzey";

DROP INDEX "qti"."__lookup_table_ix_package_nb_6_s_24_lbvy_path_wibt_6_6nvspqcmj7";

DROP INDEX "qti"."__label_use_ix_package_qyka_5_xxbbl_path_g_3_m_4_snz_qkfwtbizwi";

DROP INDEX "qti"."__item_ref_document_ix_package_target_path_s5ukfxiq6o";

DROP INDEX "qti"."__interaction_attribute_ix_package_path_root_kind_tqpqhhqjmc";

DROP INDEX "qti"."__interaction_attribute_ix_package_name_path_w6akuivfgk";

DROP INDEX "qti"."__interaction_attribute_ix_package_dmutn_3_ue_6_b_g3yjlicm23";

DROP INDEX "qti"."__interaction_attribute_ix_package_cxiriylwpd_path_6_7minryueco";

DROP INDEX "qti"."__instance_ix_package_document_ids_idref_targets_3kuzxyrfyq";

DROP INDEX "qti"."__instance_ix_document_package_start_fma4ojvddv";

DROP INDEX "qti"."__instance_ix_package_y_55_am_5_j_6_k_6_site_lhzngzb7a7";

DROP INDEX "qti"."__instance_ix_package_gujpdockjy_document_o_6_kvqfj_rbkfuvz5vd";

DROP INDEX "qti"."__instance_ix_package_7_oco_2_iiu_3_c_assembly_xbjfg_slptdquoby";

DROP INDEX "qti"."__idref_ix_package_path_token_6fjtwitsfm";

DROP INDEX "qti"."__header_token_ix_package_path_token_z4in3bawzn";

DROP INDEX "qti"."__fragment_template_ref_declaration_ix_package_7qutwtltii";

DROP INDEX "qti"."__fragment_template_ref_declaration_ix_package_nb_6_wbd3eq6mzn";

DROP INDEX "qti"."__fragment_template_ref_declaration_ix_package_hgm_5_c52j5kroyq";

DROP INDEX "qti"."__fragment_template_ref_cardinality_ix_package_myu5bbct6r";

DROP INDEX "qti"."__fragment_template_ref_ix_package_pxfqm_2_obm_2_fezcvqp4g3";

DROP INDEX "qti"."__fragment_printed_ref_declaration_ix_package_w3r3ix2vgu";

DROP INDEX "qti"."__fragment_printed_ref_ix_package_pxfqm_2_obm_2_vpbqcdug3z";

DROP INDEX "qti"."__fragment_feedback_ref_declaration_ix_package_msufvfhwoq";

DROP INDEX "qti"."__fragment_feedback_ref_declaration_ix_package_nb_6_wkuz3v3ull";

DROP INDEX "qti"."__fragment_feedback_ref_declaration_ix_package_b_46_gnrlqfzzcb";

DROP INDEX "qti"."__fragment_feedback_ref_cardinality_ix_package_pv7tqbmskj";

DROP INDEX "qti"."__fragment_feedback_ref_ix_package_pxfqm_2_obm_2_zld6imsm6s";

DROP INDEX "qti"."__fragment_context_ref_declaration_ix_package_ya4awyg2yo";

DROP INDEX "qti"."__fragment_context_ref_ix_package_pxfqm_2_obm_2_vt5wwmmwy6";

DROP INDEX "qti"."__file_ix_package_scope_target_path_m3rxj4gpfz";

DROP INDEX "qti"."__file_ix_package_a_66_fvayvxi_target_5_pf_2_hoxngk_7lpsq677jr";

DROP INDEX "qti"."__feedback_ref_declaration_ix_package_path_mecegtv2tx";

DROP INDEX "qti"."__feedback_ref_declaration_ix_package_nb_6_s_24_lbvy_cl5jutwcgb";

DROP INDEX "qti"."__feedback_ref_declaration_ix_package_b_46_jqvoml_5_nyi43ncbbg";

DROP INDEX "qti"."__feedback_ref_cardinality_ix_package_path_ga63dbogfr";

DROP INDEX "qti"."__feedback_ref_ix_package_pxfqm_2_obm_2_path_5_qxzggngpvo";

DROP INDEX "qti"."__expression_attribute_ix_package_path_start_base_p7gnpkt44g";

DROP INDEX "qti"."__expression_ix_package_path_language_as5w5gy422";

DROP INDEX "qti"."__document_id_ix_package_bm_6_aoy_6_ldb_path_o_345_o_pfy5da4bg7";

DROP INDEX "qti"."__document_id_ix_package_73_mj_6_gdtts_path_66_nmq_gwwpgkl24h";

DROP INDEX "qti"."__document_ix_package_oebzp_3_e_6_ge_path_br_2_mxspxsjfup";

DROP INDEX "qti"."__document_ix_package_6_guspwsifd_path_w_6_kmqu_45_ezwihqi3ys";

DROP INDEX "qti"."__declaration_identifier_ix_package_rjldczgxxz_path_jfhcvvr5hd";

DROP INDEX "qti"."__declaration_identifier_ix_package_oxpssgzkql_path_vt5av4gyzy";

DROP INDEX "qti"."__declaration_identifier_ix_package_nb_6_s_24_lbvy_5br6grrs2b";

DROP INDEX "qti"."__declaration_identifier_ix_package_4_pas_4_nikhx_p6mq6bdhlv";

DROP INDEX "qti"."__declaration_cardinality_ix_package_kx_77_doqqis_ry56x3ycqo";

DROP INDEX "qti"."__declaration_cardinality_ix_package_jqydibwlno_path_tjk3qs7gmw";

DROP INDEX "qti"."__declaration_ix_package_tkvh_7_edxj_2_path_zglg_32_fcsvratln3";

DROP INDEX "qti"."__declaration_ix_package_razcibyont_path_wroybuvx_63_6krbdf4tmu";

DROP INDEX "qti"."__data_ssml_property_ix_package_member_name_path_clipt2ssbl";

DROP INDEX "qti"."__context_ref_declaration_ix_package_path_wi57r3nejf";

DROP INDEX "qti"."__context_ref_ix_package_pxfqm_2_obm_2_path_5_jkmffr_bwfk4nrzop";

DROP INDEX "qti"."__cn_count_ix_package_djj_6_hmb_3_qc_path_e_6_xum_4_ehiroj2kln";

DROP INDEX "qti"."__choice_interaction_ix_package_xcqdlnz_4_kq_path_5_4vxrfbt37q";

DROP INDEX "qti"."__catalog_target_ix_package_kiyfljdqbq_path_364_vav77acftn";

DROP INDEX "qti"."__catalog_target_ix_package_adpvq_42_kb_2_path_x_35_wvanlbl77j";

DROP INDEX "qti"."__catalog_scope_ix_package_path_scope_hfhi72vpll";

DROP INDEX "qti"."__candidate_path_ix_package_target_6vqzdz37df";

DROP INDEX "qti"."__binding_declaration_ix_package_path_declaration_wm4g5oroiu";

DROP INDEX "qti"."__binding_declaration_ix_package_nb_6_s_24_lbvy_path_iyp2y4ndkd";

DROP INDEX "qti"."__binding_cardinality_ix_package_path_declaration_e63tiqx3l7";

DROP INDEX "qti"."__binding_cardinality_ix_package_b_46_jqvoml_5_path_dbw5ba5di5";

DROP INDEX "qti"."__binding_base_type_ix_package_path_declaration_base_dsiefqo6um";

DROP INDEX "qti"."__attribute_ix_name_package_path_upwaxs4snk";

DROP INDEX "qti"."__attribute_ix_document_type_kind_name_package_xjysj7dqr3";

DROP INDEX "qti"."__attribute_ix_package_wlmmq_7_zmaj_path_bstac_22_2drx4u7qbm";

DROP INDEX "qti"."__attribute_ix_package_wlgsv_5_oas_6_path_4_r_6_k_4_x442t25heb";

DROP INDEX "qti"."__attribute_ix_package_pwbimkvewd_path_k_2_tshabbhn_py2vhwjncq";

DROP INDEX "qti"."__attribute_ix_package_omw_3_mcextk_path_iuujvzpydd_6heyj6lqcm";

DROP INDEX "qti"."__attribute_ix_package_nprl_7_keln_4_path_7_csc_5_p_x5gpqfkfcr";

DROP INDEX "qti"."__attribute_ix_package_noyti_2_cwxu_path_kfgio_5_kp_j5k7ulgoib";

DROP INDEX "qti"."__attribute_ix_package_gheeoujzg_3_path_qy_4_jephew_236c4p37cc";

DROP INDEX "qti"."__attribute_ix_package_eemdstsjwd_path_6_jjwz_6_jgfn_6oajurlryf";

DROP INDEX "qti"."__attribute_ix_package_cyyslsevot_path_le_3_rnunqb_5_i7sy5qyf3o";

DROP INDEX "qti"."__attribute_ix_package_bvdgbsgon_2_path_znvt_6_oh_5_hbpogwod2y";

DROP INDEX "qti"."__attribute_ix_package_bjbpdp_6_xem_path_ru_66_as_7_yl2agjp6ad";

DROP INDEX "qti"."__attribute_ix_package_alavvtv_2_rx_path_iu_4_y_5_p_3dqqeloppg";

DROP INDEX "qti"."__attribute_ix_package_4_wmstz_4_hmo_path_aly_5_jn_6_ix5hx2utx7";

DROP INDEX "qti"."__assembled_catalog_ix_package_path_owner_yng35odexo";

DROP INDEX "qti"."__area_mapping_cardinality_ix_package_cardinality_7j4wqezyj5";

DROP INDEX "qti"."__area_mapping_ix_package_base_types_path_7a7zf47giy";

DROP INDEX "qti"."__area_mapping_ix_package_nb_6_s_24_lbvy_path_wibt_6_jzwyaqzsj2";

DROP FUNCTION "qti"."__capture_operand_e6xkr2xbko"() RESTRICT;

ALTER TABLE "qti"."variable_ref_declaration" DROP COLUMN "__start_ictahep33o";

ALTER TABLE "qti"."variable_ref_declaration" DROP COLUMN "__start_ygmwhveswe";

ALTER TABLE "qti"."variable_ref_declaration" DROP COLUMN "__start_nwkzcnuivv";

ALTER TABLE "qti"."variable_ref_declaration" DROP COLUMN "__path_rs4djcoqzo";

ALTER TABLE "qti"."variable_ref_declaration" DROP COLUMN "__path_ktvavpzdxf";

ALTER TABLE "qti"."variable_ref_declaration" DROP COLUMN "__path_7jzuk2k2es";

ALTER TABLE "qti"."variable_ref_declaration" DROP COLUMN "__path_xci5fo6tku";

ALTER TABLE "qti"."variable_ref_declaration" DROP COLUMN "__package_nci5upadgg";

ALTER TABLE "qti"."variable_ref_declaration" DROP COLUMN "__package_npwzyp7f46";

ALTER TABLE "qti"."variable_ref_declaration" DROP COLUMN "__package_3q3r2wreu7";

ALTER TABLE "qti"."variable_ref_declaration" DROP COLUMN "__package_zdfv3cvbn6";

ALTER TABLE "qti"."variable_ref_declaration" DROP COLUMN "__declaration_6bft2h4jzn";

ALTER TABLE "qti"."variable_ref_declaration" DROP COLUMN "__base_type_py5nl74fdb";

ALTER TABLE "qti"."variable_ref_declaration" DROP COLUMN "__attribute_a67kws7zuj";

ALTER TABLE "qti"."variable_ref_declaration" DROP COLUMN "__attribute_65tahrtdal";

ALTER TABLE "qti"."variable_ref_declaration" DROP COLUMN "__attribute_tlxaefzruf";

ALTER TABLE "qti"."variable_ref" DROP COLUMN "__start_5rr5hzfh3s";

ALTER TABLE "qti"."variable_ref" DROP COLUMN "__start_sq377uc4vs";

ALTER TABLE "qti"."variable_ref" DROP COLUMN "__start_cslexr4nfw";

ALTER TABLE "qti"."variable_ref" DROP COLUMN "__path_zvibygbtwt";

ALTER TABLE "qti"."variable_ref" DROP COLUMN "__path_paczrrwiks";

ALTER TABLE "qti"."variable_ref" DROP COLUMN "__path_4yypxbmb7u";

ALTER TABLE "qti"."variable_ref" DROP COLUMN "__package_5tio7366sx";

ALTER TABLE "qti"."variable_ref" DROP COLUMN "__package_bqryib25qm";

ALTER TABLE "qti"."variable_ref" DROP COLUMN "__package_bfhmg4km4s";

ALTER TABLE "qti"."variable_ref" DROP COLUMN "__language_hdk63u5nao";

ALTER TABLE "qti"."variable_ref" DROP COLUMN "__language_g4fbnc6kzm";

ALTER TABLE "qti"."variable_ref" DROP COLUMN "__element_cardinality_kv7fsfl2bu";

ALTER TABLE "qti"."variable_ref" DROP COLUMN "__element_base_s2ys2dkumh";

ALTER TABLE "qti"."variable_ref" DROP COLUMN "__attribute_r3bfjzxqlg";

ALTER TABLE "qti"."usage_value" DROP COLUMN "__start_csxk5jxlaz";

ALTER TABLE "qti"."usage_value" DROP COLUMN "__path_vno36g6l22";

ALTER TABLE "qti"."usage_value" DROP COLUMN "__package_bvwl3qurad";

ALTER TABLE "qti"."usage_value" DROP COLUMN "__base_type_lexical_ch24no2osx";

ALTER TABLE "qti"."text_reference" DROP COLUMN "__start_afi5o7a2kh";

ALTER TABLE "qti"."text_reference" DROP COLUMN "__path_mzwjzn5rcd";

ALTER TABLE "qti"."text_reference" DROP COLUMN "__package_a66fvayvxi";

ALTER TABLE "qti"."text_reference" DROP COLUMN "__kind_3plysbbxy5";

ALTER TABLE "qti"."test_token" DROP COLUMN "__value_njvpodf45e";

ALTER TABLE "qti"."test_token" DROP COLUMN "__start_qk7oto2bl5";

ALTER TABLE "qti"."test_token" DROP COLUMN "__path_fg7gjk37qk";

ALTER TABLE "qti"."test_token" DROP COLUMN "__package_niugakkc3e";

ALTER TABLE "qti"."template_ref_declaration" DROP COLUMN "__start_knfgyygrxk";

ALTER TABLE "qti"."template_ref_declaration" DROP COLUMN "__path_wibt6fzcm4";

ALTER TABLE "qti"."template_ref_declaration" DROP COLUMN "__path_jgje2qi4d3";

ALTER TABLE "qti"."template_ref_declaration" DROP COLUMN "__package_nb6s24lbvy";

ALTER TABLE "qti"."template_ref_declaration" DROP COLUMN "__package_hgm5snckn7";

ALTER TABLE "qti"."template_ref_declaration" DROP COLUMN "__declaration_6cfggqpwok";

ALTER TABLE "qti"."template_ref_declaration" DROP COLUMN "__attribute_z7y72kybyf";

ALTER TABLE "qti"."template_ref_declaration" DROP COLUMN "__tag_base_type_identifier_344qgtpk3l";

ALTER TABLE "qti"."template_ref" DROP COLUMN "__start_nqivfsnat3";

ALTER TABLE "qti"."template_ref" DROP COLUMN "__path_5jkmffr24j";

ALTER TABLE "qti"."template_ref" DROP COLUMN "__package_pxfqm2obm2";

ALTER TABLE "qti"."template_ref" DROP COLUMN "__attribute_hfyfakg5bn";

ALTER TABLE "qti"."stimulus_ref" DROP COLUMN "__tag_kind_qti_assessment_stimulus_ref_qe7tad6rku";

ALTER TABLE "qti"."srcset_candidate" DROP COLUMN "__start_afi5o7a2kh";

ALTER TABLE "qti"."srcset_candidate" DROP COLUMN "__path_mzwjzn5rcd";

ALTER TABLE "qti"."srcset_candidate" DROP COLUMN "__package_a66fvayvxi";

ALTER TABLE "qti"."srcset_candidate" DROP COLUMN "__at_qadnvnctnl";

ALTER TABLE "qti"."site_path" DROP COLUMN "__target_2ezbhprc3h";

ALTER TABLE "qti"."site_path" DROP COLUMN "__start_s4pmfajotm";

ALTER TABLE "qti"."site_path" DROP COLUMN "__path_2sjovsws2h";

ALTER TABLE "qti"."site_path" DROP COLUMN "__package_o6h35i2ucp";

ALTER TABLE "qti"."site_path" DROP COLUMN "__package_osevq7lhy5";

ALTER TABLE "qti"."site_path" DROP COLUMN "__tag_name_href_uly3pfxknv";

ALTER TABLE "qti"."site" DROP COLUMN "__start_d7sxoaa62i";

ALTER TABLE "qti"."site" DROP COLUMN "__start_wyd3yvjznt";

ALTER TABLE "qti"."site" DROP COLUMN "__path_5tw7x4mfjh";

ALTER TABLE "qti"."site" DROP COLUMN "__path_tacdoa5nis";

ALTER TABLE "qti"."site" DROP COLUMN "__package_jghisuydfk";

ALTER TABLE "qti"."site" DROP COLUMN "__package_v3zrbvlnbj";

ALTER TABLE "qti"."site" DROP COLUMN "__kind_xumnxfryga";

ALTER TABLE "qti"."site" DROP COLUMN "__tag_scope_external_4ewa3hwoox";

ALTER TABLE "qti"."site" DROP COLUMN "__tag_name_href_rc6np66dc4";

ALTER TABLE "qti"."share_fragment" DROP COLUMN "__start_lugeasuam6";

ALTER TABLE "qti"."share_fragment" DROP COLUMN "__placements_umab3ec74p";

ALTER TABLE "qti"."share_fragment" DROP COLUMN "__path_x35ldty6jq";

ALTER TABLE "qti"."share_fragment" DROP COLUMN "__path_364vfbami2";

ALTER TABLE "qti"."share_fragment" DROP COLUMN "__package_adpvq42kb2";

ALTER TABLE "qti"."share_fragment" DROP COLUMN "__package_kiyfljdqbq";

ALTER TABLE "qti"."share_fragment" DROP COLUMN "__id_chqpn6jlrw";

ALTER TABLE "qti"."rounding" DROP COLUMN "__start_uxx3dxau2y";

ALTER TABLE "qti"."rounding" DROP COLUMN "__start_jdfpd5aaxj";

ALTER TABLE "qti"."rounding" DROP COLUMN "__start_hljkfrgjjt";

ALTER TABLE "qti"."rounding" DROP COLUMN "__start_dm343fnwxo";

ALTER TABLE "qti"."rounding" DROP COLUMN "__path_zg4pi2f57a";

ALTER TABLE "qti"."rounding" DROP COLUMN "__path_au3s3jymel";

ALTER TABLE "qti"."rounding" DROP COLUMN "__path_mzge6sbaxt";

ALTER TABLE "qti"."rounding" DROP COLUMN "__path_b5u7wmzrgj";

ALTER TABLE "qti"."rounding" DROP COLUMN "__package_2h4mr37ott";

ALTER TABLE "qti"."rounding" DROP COLUMN "__package_ddhmedtbc3";

ALTER TABLE "qti"."rounding" DROP COLUMN "__package_emh34hw4ts";

ALTER TABLE "qti"."rounding" DROP COLUMN "__package_vvlhls2ens";

ALTER TABLE "qti"."resource_typed" DROP COLUMN "__tag_kind_cp_resource_d4vxcw6kik";

ALTER TABLE "qti"."resource_id" DROP COLUMN "__tag_kind_cp_resource_d4vxcw6kik";

ALTER TABLE "qti"."resource_id" DROP COLUMN "__tag_kind_cp_resource_2dx6aajhjw";

ALTER TABLE "qti"."resource_id" DROP COLUMN "__tag_document_type_manifest_xf3a5pjxvr";

ALTER TABLE "qti"."resource_href" DROP COLUMN "__tag_kind_cp_resource_d4vxcw6kik";

ALTER TABLE "qti"."reference_path" DROP COLUMN "__target_wflv3vj52m";

ALTER TABLE "qti"."reference_path" DROP COLUMN "__package_7t2ctw5cbp";

ALTER TABLE "qti"."reference_path" DROP COLUMN "__tag_root_kind_qti_assessment_stimulus_2vbuhphhzu";

ALTER TABLE "qti"."reference" DROP COLUMN "__start_afi5o7a2kh";

ALTER TABLE "qti"."reference" DROP COLUMN "__path_mzwjzn5rcd";

ALTER TABLE "qti"."reference" DROP COLUMN "__package_a66fvayvxi";

ALTER TABLE "qti"."reference" DROP COLUMN "__name_55zdbs4rpu";

ALTER TABLE "qti"."reference" DROP COLUMN "__kind_3plysbbxy5";

ALTER TABLE "qti"."printed_variable_ref" DROP COLUMN "__start_nqivfsnat3";

ALTER TABLE "qti"."printed_variable_ref" DROP COLUMN "__path_5jkmffr24j";

ALTER TABLE "qti"."printed_variable_ref" DROP COLUMN "__package_pxfqm2obm2";

ALTER TABLE "qti"."printed_variable_ref" DROP COLUMN "__attribute_hfyfakg5bn";

ALTER TABLE "qti"."placed_variable_ref" DROP COLUMN "__start_5rr5hzfh3s";

ALTER TABLE "qti"."placed_variable_ref" DROP COLUMN "__path_zvibygbtwt";

ALTER TABLE "qti"."placed_variable_ref" DROP COLUMN "__package_5tio7366sx";

ALTER TABLE "qti"."placed_variable_ref" DROP COLUMN "__instance_n5ohc4oypz";

ALTER TABLE "qti"."placed_variable_ref" DROP COLUMN "__attribute_r3bfjzxqlg";

ALTER TABLE "qti"."placed_variable_ref" DROP COLUMN "__assembly_zrqriy6rho";

ALTER TABLE "qti"."placed_binding_declaration" DROP COLUMN "__start_knfgyygrxk";

ALTER TABLE "qti"."placed_binding_declaration" DROP COLUMN "__package_nb6s24lbvy";

ALTER TABLE "qti"."placed_binding_declaration" DROP COLUMN "__instance_o2mj6jp54p";

ALTER TABLE "qti"."placed_binding_declaration" DROP COLUMN "__attribute_z7y72kybyf";

ALTER TABLE "qti"."placed_binding_declaration" DROP COLUMN "__assembly_wyqqk4lwsm";

ALTER TABLE "qti"."placed_binding_cardinality" DROP COLUMN "__start_qwjp3iwixd";

ALTER TABLE "qti"."placed_binding_cardinality" DROP COLUMN "__package_b46jqvoml5";

ALTER TABLE "qti"."placed_binding_cardinality" DROP COLUMN "__instance_43ypvsngtt";

ALTER TABLE "qti"."placed_binding_cardinality" DROP COLUMN "__attribute_cy3lzlyym2";

ALTER TABLE "qti"."placed_binding_cardinality" DROP COLUMN "__assembly_tsos3givud";

ALTER TABLE "qti"."placed_binding_base_type" DROP COLUMN "__tag_base_types_1_v2q3o6pgx3";

ALTER TABLE "qti"."placed_binding" DROP COLUMN "__tag_assembly_kind_qti_assessment_item_qf7qyzopnq";

ALTER TABLE "qti"."pci_module_form" DROP COLUMN "__start_ff343nnrf3";

ALTER TABLE "qti"."pci_module_form" DROP COLUMN "__start_vsqhmaearc";

ALTER TABLE "qti"."pci_module_form" DROP COLUMN "__path_me7skvhifh";

ALTER TABLE "qti"."pci_module_form" DROP COLUMN "__path_kwsxpf6lre";

ALTER TABLE "qti"."pci_module_form" DROP COLUMN "__package_27llftvqhq";

ALTER TABLE "qti"."pci_module_form" DROP COLUMN "__package_ei52f4xffw";

ALTER TABLE "qti"."operand" DROP COLUMN "__predecessor_operands_6b425ivpbx";

ALTER TABLE "qti"."operand" DROP COLUMN "__index_operands_u3kpyckdhi";

ALTER TABLE "qti"."operand" DROP COLUMN "__copy_operands_womz6mspm6";

ALTER TABLE "qti"."operand" DROP COLUMN "__before_operands_0_6blfahqrh6";

ALTER TABLE "qti"."operand" DROP COLUMN "__before_operands_0_txjnh35hav";

ALTER TABLE "qti"."operand" DROP COLUMN "__before_operands_0_uf7lzvtpez";

ALTER TABLE "qti"."operand" DROP COLUMN "__before_operands_0_nrlcr2rs3e";

ALTER TABLE "qti"."operand" DROP COLUMN "__before_operands_0_rtfjtbbukn";

ALTER TABLE "qti"."operand" DROP COLUMN "__after_operands_0_o2j5w46rxp";

ALTER TABLE "qti"."operand" DROP COLUMN "__after_operands_0_5loccfa4ja";

ALTER TABLE "qti"."operand" DROP COLUMN "__after_operands_0_pm3ectnxud";

ALTER TABLE "qti"."operand" DROP COLUMN "__after_operands_0_yrav2vxoid";

ALTER TABLE "qti"."operand" DROP COLUMN "__after_operands_0_jtheaskpsz";

ALTER TABLE "qti"."open_attribute" DROP COLUMN "__start_6lthro5vqr";

ALTER TABLE "qti"."open_attribute" DROP COLUMN "__path_6lewewmqrh";

ALTER TABLE "qti"."open_attribute" DROP COLUMN "__package_qr6ir7bi6e";

ALTER TABLE "qti"."open_attribute" DROP COLUMN "__element_namespace_a7msmtijer";

ALTER TABLE "qti"."normal_minimum" DROP COLUMN "__start_bqrcsvkfsc";

ALTER TABLE "qti"."normal_minimum" DROP COLUMN "__path_wmkyjbvgw3";

ALTER TABLE "qti"."normal_minimum" DROP COLUMN "__package_fbilah5kqm";

ALTER TABLE "qti"."normal_minimum" DROP COLUMN "__lexical_27n7ajvgxq";

ALTER TABLE "qti"."node" DROP COLUMN "__string_value_au6fy6olpt";

ALTER TABLE "qti"."node" DROP COLUMN "__string_value_x4ajhh2wfo";

ALTER TABLE "qti"."node" DROP COLUMN "__start_ouwvlwy5ch";

ALTER TABLE "qti"."node" DROP COLUMN "__start_km5zfogkmn";

ALTER TABLE "qti"."node" DROP COLUMN "__start_42afebohfb";

ALTER TABLE "qti"."node" DROP COLUMN "__start_4tq2iufeiz";

ALTER TABLE "qti"."node" DROP COLUMN "__start_vretwkwxg4";

ALTER TABLE "qti"."node" DROP COLUMN "__start_jip64i2soq";

ALTER TABLE "qti"."node" DROP COLUMN "__start_2gva6u6cmq";

ALTER TABLE "qti"."node" DROP COLUMN "__start_hmwloncnlr";

ALTER TABLE "qti"."node" DROP COLUMN "__start_n767ktqknz";

ALTER TABLE "qti"."node" DROP COLUMN "__start_fdd63w6ju2";

ALTER TABLE "qti"."node" DROP COLUMN "__start_odlzmoypjp";

ALTER TABLE "qti"."node" DROP COLUMN "__start_3npodhmtk6";

ALTER TABLE "qti"."node" DROP COLUMN "__start_sq377uc4vs";

ALTER TABLE "qti"."node" DROP COLUMN "__start_l22idu7y57";

ALTER TABLE "qti"."node" DROP COLUMN "__start_o7jfdvo6c7";

ALTER TABLE "qti"."node" DROP COLUMN "__start_cslexr4nfw";

ALTER TABLE "qti"."node" DROP COLUMN "__start_4vnuhxwdbo";

ALTER TABLE "qti"."node" DROP COLUMN "__start_6lthro5vqr";

ALTER TABLE "qti"."node" DROP COLUMN "__start_ispg63kjtz";

ALTER TABLE "qti"."node" DROP COLUMN "__start_u5m22c5cjd";

ALTER TABLE "qti"."node" DROP COLUMN "__start_6khndtm772";

ALTER TABLE "qti"."node" DROP COLUMN "__path_43azipxfum";

ALTER TABLE "qti"."node" DROP COLUMN "__path_a4shhdjef6";

ALTER TABLE "qti"."node" DROP COLUMN "__path_66y5xj7axb";

ALTER TABLE "qti"."node" DROP COLUMN "__path_dn6abyl6iz";

ALTER TABLE "qti"."node" DROP COLUMN "__path_nrlhg2ytdy";

ALTER TABLE "qti"."node" DROP COLUMN "__path_wogcolyaps";

ALTER TABLE "qti"."node" DROP COLUMN "__path_7bewh2d6q7";

ALTER TABLE "qti"."node" DROP COLUMN "__path_oarsrg5x22";

ALTER TABLE "qti"."node" DROP COLUMN "__path_w5i2umbteb";

ALTER TABLE "qti"."node" DROP COLUMN "__path_6z7ygjaop7";

ALTER TABLE "qti"."node" DROP COLUMN "__path_yv7754sdav";

ALTER TABLE "qti"."node" DROP COLUMN "__path_ayh57sq7hj";

ALTER TABLE "qti"."node" DROP COLUMN "__path_z5hily2nnr";

ALTER TABLE "qti"."node" DROP COLUMN "__path_paczrrwiks";

ALTER TABLE "qti"."node" DROP COLUMN "__path_n2opsrpf5g";

ALTER TABLE "qti"."node" DROP COLUMN "__path_7c57c2ilov";

ALTER TABLE "qti"."node" DROP COLUMN "__path_4yypxbmb7u";

ALTER TABLE "qti"."node" DROP COLUMN "__path_qfjbszr2eh";

ALTER TABLE "qti"."node" DROP COLUMN "__path_6lewewmqrh";

ALTER TABLE "qti"."node" DROP COLUMN "__path_5hn7wqu2v5";

ALTER TABLE "qti"."node" DROP COLUMN "__path_cmcihiv7as";

ALTER TABLE "qti"."node" DROP COLUMN "__path_7mjzclno6o";

ALTER TABLE "qti"."node" DROP COLUMN "__path_6dz222hlfs";

ALTER TABLE "qti"."node" DROP COLUMN "__package_vxzxss64af";

ALTER TABLE "qti"."node" DROP COLUMN "__package_f7hxkhuc5j";

ALTER TABLE "qti"."node" DROP COLUMN "__package_e4zzfr7wzj";

ALTER TABLE "qti"."node" DROP COLUMN "__package_2w6sziybrg";

ALTER TABLE "qti"."node" DROP COLUMN "__package_6t5jp72vgm";

ALTER TABLE "qti"."node" DROP COLUMN "__package_ck5ku6e4hr";

ALTER TABLE "qti"."node" DROP COLUMN "__package_flzsui4xks";

ALTER TABLE "qti"."node" DROP COLUMN "__package_vqnwpi5wh4";

ALTER TABLE "qti"."node" DROP COLUMN "__package_sjuyq4n4ie";

ALTER TABLE "qti"."node" DROP COLUMN "__package_uhsj5qcxm3";

ALTER TABLE "qti"."node" DROP COLUMN "__package_ibbpxcarue";

ALTER TABLE "qti"."node" DROP COLUMN "__package_vxgdk7px6i";

ALTER TABLE "qti"."node" DROP COLUMN "__package_qsovf7j322";

ALTER TABLE "qti"."node" DROP COLUMN "__package_bqryib25qm";

ALTER TABLE "qti"."node" DROP COLUMN "__package_no3uxsy3vd";

ALTER TABLE "qti"."node" DROP COLUMN "__package_27hetzadou";

ALTER TABLE "qti"."node" DROP COLUMN "__package_bfhmg4km4s";

ALTER TABLE "qti"."node" DROP COLUMN "__package_lep2kfaifd";

ALTER TABLE "qti"."node" DROP COLUMN "__package_qr6ir7bi6e";

ALTER TABLE "qti"."node" DROP COLUMN "__package_7mjar2wjii";

ALTER TABLE "qti"."node" DROP COLUMN "__package_yextvrufxr";

ALTER TABLE "qti"."node" DROP COLUMN "__package_qeeyuvkcon";

ALTER TABLE "qti"."node" DROP COLUMN "__package_7lwwgzz6aj";

ALTER TABLE "qti"."node" DROP COLUMN "__kind_7plboq7zdr";

ALTER TABLE "qti"."node" DROP COLUMN "__kind_3zonnawsqb";

ALTER TABLE "qti"."math_cn" DROP COLUMN "__type_lexical_mw5gnzkqdv";

ALTER TABLE "qti"."math_cn" DROP COLUMN "__start_khzjsnykwz";

ALTER TABLE "qti"."math_cn" DROP COLUMN "__start_w2iplra4we";

ALTER TABLE "qti"."math_cn" DROP COLUMN "__path_e6xum4d6xe";

ALTER TABLE "qti"."math_cn" DROP COLUMN "__path_aynmgwnhik";

ALTER TABLE "qti"."math_cn" DROP COLUMN "__package_djj6hmb3qc";

ALTER TABLE "qti"."math_cn" DROP COLUMN "__package_jeqf4zhgxp";

ALTER TABLE "qti"."math_cn" DROP COLUMN "__base_lexical_dhzsou5d52";

ALTER TABLE "qti"."math_cn" DROP COLUMN "__tag_kind_m_cn_vaaa4rk3mj";

ALTER TABLE "qti"."math_cn" DROP COLUMN "__tag_name_type_hg2ugkuqxm";

ALTER TABLE "qti"."math_cn" DROP COLUMN "__tag_name_base_waay562dod";

ALTER TABLE "qti"."math_align_scope" DROP COLUMN "__start_piylajheuo";

ALTER TABLE "qti"."math_align_scope" DROP COLUMN "__path_r32liutwvp";

ALTER TABLE "qti"."math_align_scope" DROP COLUMN "__package_yc7lh7cte2";

ALTER TABLE "qti"."math_align_scope" DROP COLUMN "__dir_lexical_h6z4ucsu6w";

ALTER TABLE "qti"."math_action" DROP COLUMN "__start_jii3d25dvg";

ALTER TABLE "qti"."math_action" DROP COLUMN "__selection_lexical_unwrxmx7dj";

ALTER TABLE "qti"."math_action" DROP COLUMN "__path_c7u7tmg65e";

ALTER TABLE "qti"."math_action" DROP COLUMN "__package_qbqe3pdjnn";

ALTER TABLE "qti"."mapping" DROP COLUMN "__start_knfgyygrxk";

ALTER TABLE "qti"."mapping" DROP COLUMN "__start_qwjp3iwixd";

ALTER TABLE "qti"."mapping" DROP COLUMN "__path_wibt6fzcm4";

ALTER TABLE "qti"."mapping" DROP COLUMN "__path_6fakxlvhsj";

ALTER TABLE "qti"."mapping" DROP COLUMN "__package_nb6s24lbvy";

ALTER TABLE "qti"."mapping" DROP COLUMN "__package_b46jqvoml5";

ALTER TABLE "qti"."mapping" DROP COLUMN "__tag_kind_qti_mapping_ircufmby53";

ALTER TABLE "qti"."map_key" DROP COLUMN "__start_qwjp3iwixd";

ALTER TABLE "qti"."map_key" DROP COLUMN "__path_6fakxlvhsj";

ALTER TABLE "qti"."map_key" DROP COLUMN "__package_b46jqvoml5";

ALTER TABLE "qti"."map_key" DROP COLUMN "__tag_kind_qti_map_entry_encogh5pzb";

ALTER TABLE "qti"."manifest_id" DROP COLUMN "__tag_kind_cp_manifest_5ceu2f7cj4";

ALTER TABLE "qti"."manifest_id" DROP COLUMN "__tag_kind_cp_manifest_qkjmtgjag7";

ALTER TABLE "qti"."manifest_id" DROP COLUMN "__tag_document_type_manifest_xf3a5pjxvr";

ALTER TABLE "qti"."lookup_value" DROP COLUMN "__start_qwjp3iwixd";

ALTER TABLE "qti"."lookup_value" DROP COLUMN "__path_6fakxlvhsj";

ALTER TABLE "qti"."lookup_value" DROP COLUMN "__package_b46jqvoml5";

ALTER TABLE "qti"."lookup_table" DROP COLUMN "__start_knfgyygrxk";

ALTER TABLE "qti"."lookup_table" DROP COLUMN "__path_wibt6fzcm4";

ALTER TABLE "qti"."lookup_table" DROP COLUMN "__package_nb6s24lbvy";

ALTER TABLE "qti"."label_use" DROP COLUMN "__path_g3m4snz37n";

ALTER TABLE "qti"."label_use" DROP COLUMN "__package_qyka5xxbbl";

ALTER TABLE "qti"."item_ref_href" DROP COLUMN "__tag_name_href_uly3pfxknv";

ALTER TABLE "qti"."item_ref_href" DROP COLUMN "__tag_kind_qti_assessment_item_ref_7dgpuznkbf";

ALTER TABLE "qti"."item_ref_document" DROP COLUMN "__tag_root_kind_qti_assessment_item_3w5s6t5tqt";

ALTER TABLE "qti"."item_mode" DROP COLUMN "__path_6mrw72dh5f";

ALTER TABLE "qti"."item_mode" DROP COLUMN "__package_bvmctmknpe";

ALTER TABLE "qti"."interaction_attribute" DROP COLUMN "__value_bxzxkt6uvs";

ALTER TABLE "qti"."interaction_attribute" DROP COLUMN "__value_efvhlmam3z";

ALTER TABLE "qti"."interaction_attribute" DROP COLUMN "__start_7t6qgev2u7";

ALTER TABLE "qti"."interaction_attribute" DROP COLUMN "__start_a6kjxnkkdd";

ALTER TABLE "qti"."interaction_attribute" DROP COLUMN "__start_argo2b7rln";

ALTER TABLE "qti"."interaction_attribute" DROP COLUMN "__start_prlu3xavkq";

ALTER TABLE "qti"."interaction_attribute" DROP COLUMN "__path_6y7sabbisc";

ALTER TABLE "qti"."interaction_attribute" DROP COLUMN "__path_7p7pbdrrmj";

ALTER TABLE "qti"."interaction_attribute" DROP COLUMN "__path_cjtx4l5cy4";

ALTER TABLE "qti"."interaction_attribute" DROP COLUMN "__path_iiczfrqwfp";

ALTER TABLE "qti"."interaction_attribute" DROP COLUMN "__package_cxiriylwpd";

ALTER TABLE "qti"."interaction_attribute" DROP COLUMN "__package_dmutn3ue6b";

ALTER TABLE "qti"."interaction_attribute" DROP COLUMN "__package_q5trwo4kzd";

ALTER TABLE "qti"."interaction_attribute" DROP COLUMN "__package_vbixi3tkj6";

ALTER TABLE "qti"."interaction_attribute" DROP COLUMN "__name_wcfyv5h4rd";

ALTER TABLE "qti"."interaction_attribute" DROP COLUMN "__name_eku76hg6cu";

ALTER TABLE "qti"."instance" DROP COLUMN "__variables_yieglk3t57";

ALTER TABLE "qti"."instance" DROP COLUMN "__start_4yv3jc6ban";

ALTER TABLE "qti"."instance" DROP COLUMN "__site_document_f35rgatsnb";

ALTER TABLE "qti"."instance" DROP COLUMN "__package_gujpdockjy";

ALTER TABLE "qti"."instance" DROP COLUMN "__package_7oco2iiu3c";

ALTER TABLE "qti"."instance" DROP COLUMN "__langs_sby525kjel";

ALTER TABLE "qti"."instance" DROP COLUMN "__document_iu7n6ahln3";

ALTER TABLE "qti"."instance" DROP COLUMN "__document_o6kvqfj3ih";

ALTER TABLE "qti"."instance" DROP COLUMN "__document_e2oi7uag64";

ALTER TABLE "qti"."instance" DROP COLUMN "__bindings_5fgw5mpsmp";

ALTER TABLE "qti"."instance" DROP COLUMN "__assembly_kind_ltwc3ijey6";

ALTER TABLE "qti"."instance" DROP COLUMN "__assembly_xbjfg5nhun";

ALTER TABLE "qti"."instance" DROP COLUMN "__tag_places_true_fsuzemt64t";

ALTER TABLE "qti"."hottext" DROP COLUMN "__tag_kind_qti_hottext_dkmo44lo7n";

ALTER TABLE "qti"."fragment_template_ref_declaration" DROP COLUMN "__start_knfgyygrxk";

ALTER TABLE "qti"."fragment_template_ref_declaration" DROP COLUMN "__package_nb6s24lbvy";

ALTER TABLE "qti"."fragment_template_ref_declaration" DROP COLUMN "__package_hgm5snckn7";

ALTER TABLE "qti"."fragment_template_ref_declaration" DROP COLUMN "__instance_o2mj6jp54p";

ALTER TABLE "qti"."fragment_template_ref_declaration" DROP COLUMN "__declaration_6cfggqpwok";

ALTER TABLE "qti"."fragment_template_ref_declaration" DROP COLUMN "__attribute_z7y72kybyf";

ALTER TABLE "qti"."fragment_template_ref_declaration" DROP COLUMN "__assembly_wyqqk4lwsm";

ALTER TABLE "qti"."fragment_template_ref_declaration" DROP COLUMN "__assembly_ewy5dn66m4";

ALTER TABLE "qti"."fragment_template_ref_declaration" DROP COLUMN "__tag_base_type_identifier_344qgtpk3l";

ALTER TABLE "qti"."fragment_template_ref" DROP COLUMN "__start_nqivfsnat3";

ALTER TABLE "qti"."fragment_template_ref" DROP COLUMN "__package_pxfqm2obm2";

ALTER TABLE "qti"."fragment_template_ref" DROP COLUMN "__instance_qrmqdmq4b2";

ALTER TABLE "qti"."fragment_template_ref" DROP COLUMN "__attribute_hfyfakg5bn";

ALTER TABLE "qti"."fragment_template_ref" DROP COLUMN "__assembly_rww7o2kdv3";

ALTER TABLE "qti"."fragment_printed_ref" DROP COLUMN "__start_nqivfsnat3";

ALTER TABLE "qti"."fragment_printed_ref" DROP COLUMN "__package_pxfqm2obm2";

ALTER TABLE "qti"."fragment_printed_ref" DROP COLUMN "__instance_qrmqdmq4b2";

ALTER TABLE "qti"."fragment_printed_ref" DROP COLUMN "__attribute_hfyfakg5bn";

ALTER TABLE "qti"."fragment_printed_ref" DROP COLUMN "__assembly_rww7o2kdv3";

ALTER TABLE "qti"."fragment_feedback_ref_declaration" DROP COLUMN "__start_knfgyygrxk";

ALTER TABLE "qti"."fragment_feedback_ref_declaration" DROP COLUMN "__package_nb6s24lbvy";

ALTER TABLE "qti"."fragment_feedback_ref_declaration" DROP COLUMN "__package_b46jqvoml5";

ALTER TABLE "qti"."fragment_feedback_ref_declaration" DROP COLUMN "__instance_o2mj6jp54p";

ALTER TABLE "qti"."fragment_feedback_ref_declaration" DROP COLUMN "__declaration_oxp5hcydih";

ALTER TABLE "qti"."fragment_feedback_ref_declaration" DROP COLUMN "__attribute_z7y72kybyf";

ALTER TABLE "qti"."fragment_feedback_ref_declaration" DROP COLUMN "__assembly_wyqqk4lwsm";

ALTER TABLE "qti"."fragment_feedback_ref_declaration" DROP COLUMN "__assembly_tsos3givud";

ALTER TABLE "qti"."fragment_feedback_ref_declaration" DROP COLUMN "__tag_base_type_identifier_344qgtpk3l";

ALTER TABLE "qti"."fragment_feedback_ref" DROP COLUMN "__start_nqivfsnat3";

ALTER TABLE "qti"."fragment_feedback_ref" DROP COLUMN "__package_pxfqm2obm2";

ALTER TABLE "qti"."fragment_feedback_ref" DROP COLUMN "__instance_qrmqdmq4b2";

ALTER TABLE "qti"."fragment_feedback_ref" DROP COLUMN "__attribute_hfyfakg5bn";

ALTER TABLE "qti"."fragment_feedback_ref" DROP COLUMN "__assembly_rww7o2kdv3";

ALTER TABLE "qti"."fragment_context_ref" DROP COLUMN "__start_nqivfsnat3";

ALTER TABLE "qti"."fragment_context_ref" DROP COLUMN "__package_pxfqm2obm2";

ALTER TABLE "qti"."fragment_context_ref" DROP COLUMN "__instance_qrmqdmq4b2";

ALTER TABLE "qti"."fragment_context_ref" DROP COLUMN "__attribute_hfyfakg5bn";

ALTER TABLE "qti"."fragment_context_ref" DROP COLUMN "__assembly_rww7o2kdv3";

ALTER TABLE "qti"."file" DROP COLUMN "__target_5pf2hoxngk";

ALTER TABLE "qti"."file" DROP COLUMN "__package_a66fvayvxi";

ALTER TABLE "qti"."file" DROP COLUMN "__tag_kind_cp_file_uppcto4nmf";

ALTER TABLE "qti"."feedback_ref_declaration" DROP COLUMN "__start_knfgyygrxk";

ALTER TABLE "qti"."feedback_ref_declaration" DROP COLUMN "__path_wibt6fzcm4";

ALTER TABLE "qti"."feedback_ref_declaration" DROP COLUMN "__path_6fakxlvhsj";

ALTER TABLE "qti"."feedback_ref_declaration" DROP COLUMN "__package_nb6s24lbvy";

ALTER TABLE "qti"."feedback_ref_declaration" DROP COLUMN "__package_b46jqvoml5";

ALTER TABLE "qti"."feedback_ref_declaration" DROP COLUMN "__declaration_oxp5hcydih";

ALTER TABLE "qti"."feedback_ref_declaration" DROP COLUMN "__attribute_z7y72kybyf";

ALTER TABLE "qti"."feedback_ref_declaration" DROP COLUMN "__tag_base_type_identifier_344qgtpk3l";

ALTER TABLE "qti"."feedback_ref" DROP COLUMN "__start_nqivfsnat3";

ALTER TABLE "qti"."feedback_ref" DROP COLUMN "__path_5jkmffr24j";

ALTER TABLE "qti"."feedback_ref" DROP COLUMN "__package_pxfqm2obm2";

ALTER TABLE "qti"."feedback_ref" DROP COLUMN "__attribute_hfyfakg5bn";

ALTER TABLE "qti"."expression" DROP COLUMN "__pred_operands_svlbl4xaya";

ALTER TABLE "qti"."entry" DROP COLUMN "__path_sjdiby6of5";

ALTER TABLE "qti"."entry" DROP COLUMN "__path_el46gj67vc";

ALTER TABLE "qti"."entry" DROP COLUMN "__package_5elem6sky2";

ALTER TABLE "qti"."entry" DROP COLUMN "__package_pgej6nvb7i";

ALTER TABLE "qti"."document_id" DROP COLUMN "__start_ckofhmpsuf";

ALTER TABLE "qti"."document_id" DROP COLUMN "__start_4p76xrn3nc";

ALTER TABLE "qti"."document_id" DROP COLUMN "__path_66nmq3552h";

ALTER TABLE "qti"."document_id" DROP COLUMN "__path_o345o7nbpg";

ALTER TABLE "qti"."document_id" DROP COLUMN "__package_73mj6gdtts";

ALTER TABLE "qti"."document_id" DROP COLUMN "__package_bm6aoy6ldb";

ALTER TABLE "qti"."document" DROP COLUMN "__path_w6kmqu45ai";

ALTER TABLE "qti"."document" DROP COLUMN "__path_x35ldty6jq";

ALTER TABLE "qti"."document" DROP COLUMN "__path_br2kedtzyc";

ALTER TABLE "qti"."document" DROP COLUMN "__package_6guspwsifd";

ALTER TABLE "qti"."document" DROP COLUMN "__package_adpvq42kb2";

ALTER TABLE "qti"."document" DROP COLUMN "__package_oebzp3e6ge";

ALTER TABLE "qti"."document" DROP COLUMN "__tag_start_0_al5mmf4zuu";

ALTER TABLE "qti"."document" DROP COLUMN "__tag_parent_kind_document_4mw7zagigh";

ALTER TABLE "qti"."document" DROP COLUMN "__tag_kind_document_dbsst7xqb4";

ALTER TABLE "qti"."document" DROP COLUMN "__tag_governor_document_neflbf6gem";

ALTER TABLE "qti"."dependency" DROP COLUMN "__tag_kind_cp_dependency_lofonk6n6z";

ALTER TABLE "qti"."declaration_name" DROP COLUMN "__tag_cardinalities_1_6kweaxdavh";

ALTER TABLE "qti"."declaration_identifier" DROP COLUMN "__start_knfgyygrxk";

ALTER TABLE "qti"."declaration_identifier" DROP COLUMN "__start_tgrwo4gva2";

ALTER TABLE "qti"."declaration_identifier" DROP COLUMN "__start_tahlsh72eb";

ALTER TABLE "qti"."declaration_identifier" DROP COLUMN "__start_cda7fuvygk";

ALTER TABLE "qti"."declaration_identifier" DROP COLUMN "__path_wibt6fzcm4";

ALTER TABLE "qti"."declaration_identifier" DROP COLUMN "__path_55aonqm7nv";

ALTER TABLE "qti"."declaration_identifier" DROP COLUMN "__path_u7z7qv6qw2";

ALTER TABLE "qti"."declaration_identifier" DROP COLUMN "__path_wthkgnfegs";

ALTER TABLE "qti"."declaration_identifier" DROP COLUMN "__package_nb6s24lbvy";

ALTER TABLE "qti"."declaration_identifier" DROP COLUMN "__package_rjldczgxxz";

ALTER TABLE "qti"."declaration_identifier" DROP COLUMN "__package_4pas4nikhx";

ALTER TABLE "qti"."declaration_identifier" DROP COLUMN "__package_oxpssgzkql";

ALTER TABLE "qti"."declaration_identifier" DROP COLUMN "__tag_base_type_float_r43nrhidpr";

ALTER TABLE "qti"."declaration_identifier" DROP COLUMN "__tag_base_type_boolean_t7f3wgkxaa";

ALTER TABLE "qti"."declaration_cardinality" DROP COLUMN "__start_d33gsabyx7";

ALTER TABLE "qti"."declaration_cardinality" DROP COLUMN "__start_6vfkpfb3r6";

ALTER TABLE "qti"."declaration_cardinality" DROP COLUMN "__path_odpb2tz3vy";

ALTER TABLE "qti"."declaration_cardinality" DROP COLUMN "__path_l4osx6xlvc";

ALTER TABLE "qti"."declaration_cardinality" DROP COLUMN "__package_jqydibwlno";

ALTER TABLE "qti"."declaration_cardinality" DROP COLUMN "__package_kx77doqqis";

ALTER TABLE "qti"."declaration_cardinality" DROP COLUMN "__tag_base_types_0_e5qzimoyls";

ALTER TABLE "qti"."declaration_cardinality" DROP COLUMN "__tag_name_cardinality_ewa5dyeu4w";

ALTER TABLE "qti"."declaration_cardinality" DROP COLUMN "__tag_name_base_type_ypfankhxaz";

ALTER TABLE "qti"."declaration_base_type" DROP COLUMN "__tag_name_base_type_ypfankhxaz";

ALTER TABLE "qti"."declaration" DROP COLUMN "__start_nqmyocrmzk";

ALTER TABLE "qti"."declaration" DROP COLUMN "__start_ieukfqpxn5";

ALTER TABLE "qti"."declaration" DROP COLUMN "__path_zglg32bk7m";

ALTER TABLE "qti"."declaration" DROP COLUMN "__path_wroybuvx63";

ALTER TABLE "qti"."declaration" DROP COLUMN "__package_tkvh7edxj2";

ALTER TABLE "qti"."declaration" DROP COLUMN "__package_razcibyont";

ALTER TABLE "qti"."count_bound" DROP COLUMN "__start_gx6tnfjqap";

ALTER TABLE "qti"."count_bound" DROP COLUMN "__start_a65hmuebdg";

ALTER TABLE "qti"."count_bound" DROP COLUMN "__path_q62k2mxsl5";

ALTER TABLE "qti"."count_bound" DROP COLUMN "__path_odh4mp6dj2";

ALTER TABLE "qti"."count_bound" DROP COLUMN "__package_t4q2p3vtgf";

ALTER TABLE "qti"."count_bound" DROP COLUMN "__package_p6dgh4u7i6";

ALTER TABLE "qti"."count_bound" DROP COLUMN "__min_name_pq4iyemtqh";

ALTER TABLE "qti"."count_bound" DROP COLUMN "__max_name_perr4lpmuf";

ALTER TABLE "qti"."context_ref" DROP COLUMN "__start_nqivfsnat3";

ALTER TABLE "qti"."context_ref" DROP COLUMN "__path_5jkmffr24j";

ALTER TABLE "qti"."context_ref" DROP COLUMN "__package_pxfqm2obm2";

ALTER TABLE "qti"."context_ref" DROP COLUMN "__attribute_hfyfakg5bn";

ALTER TABLE "qti"."cn_count" DROP COLUMN "__type_lexical_mw5gnzkqdv";

ALTER TABLE "qti"."cn_count" DROP COLUMN "__start_khzjsnykwz";

ALTER TABLE "qti"."cn_count" DROP COLUMN "__path_e6xum4d6xe";

ALTER TABLE "qti"."cn_count" DROP COLUMN "__package_djj6hmb3qc";

ALTER TABLE "qti"."cn_count" DROP COLUMN "__tag_kind_m_cn_vaaa4rk3mj";

ALTER TABLE "qti"."cn_count" DROP COLUMN "__tag_name_type_hg2ugkuqxm";

ALTER TABLE "qti"."choice_interaction" DROP COLUMN "__path_5qbg7wwg6i";

ALTER TABLE "qti"."choice_interaction" DROP COLUMN "__package_xcqdlnz4kq";

ALTER TABLE "qti"."choice_interaction" DROP COLUMN "__interaction_path_qysoay4yh7";

ALTER TABLE "qti"."choice_interaction" DROP COLUMN "__interaction_s6v3t7s3ug";

ALTER TABLE "qti"."catalog_target" DROP COLUMN "__placements_umab3ec74p";

ALTER TABLE "qti"."catalog_target" DROP COLUMN "__path_x35ldty6jq";

ALTER TABLE "qti"."catalog_target" DROP COLUMN "__path_364vfbami2";

ALTER TABLE "qti"."catalog_target" DROP COLUMN "__package_adpvq42kb2";

ALTER TABLE "qti"."catalog_target" DROP COLUMN "__package_kiyfljdqbq";

ALTER TABLE "qti"."catalog_target" DROP COLUMN "__id_chqpn6jlrw";

ALTER TABLE "qti"."binding_declaration" DROP COLUMN "__start_knfgyygrxk";

ALTER TABLE "qti"."binding_declaration" DROP COLUMN "__path_wibt6fzcm4";

ALTER TABLE "qti"."binding_declaration" DROP COLUMN "__package_nb6s24lbvy";

ALTER TABLE "qti"."binding_declaration" DROP COLUMN "__attribute_z7y72kybyf";

ALTER TABLE "qti"."binding_cardinality" DROP COLUMN "__start_qwjp3iwixd";

ALTER TABLE "qti"."binding_cardinality" DROP COLUMN "__path_6fakxlvhsj";

ALTER TABLE "qti"."binding_cardinality" DROP COLUMN "__package_b46jqvoml5";

ALTER TABLE "qti"."binding_cardinality" DROP COLUMN "__attribute_cy3lzlyym2";

ALTER TABLE "qti"."binding_base_type" DROP COLUMN "__tag_base_types_1_qzhsgg5lle";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_slxusuxqzl";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_ggyecoqrpu";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_4bq4kqqjb4";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_eb6sjdziei";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_kk2ykdhsej";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_zjgk6s7o2t";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_tuvypeyg5x";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_xjojbpi7j5";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_zy5dpzf755";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_6wln6jhdhj";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_md4iedwgp5";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_cuk3ewunde";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_rxit4nclyf";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_opjbxtdqe2";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_g5q4acuj75";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_2lacvkd2my";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_c4sxh2tpk6";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_pklv7fsix4";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_xckwdag7il";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_l73crm7lok";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_sat5hujmus";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_x57i4oxzjc";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_kkljqoxqjk";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_steybjtz7r";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_t4l25smhzq";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_pxly5scdi5";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_vv2olwonzr";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_k3mzt3pezf";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_u6rtfetz3j";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_agrfg4oclj";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_upmdsfduqi";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_o6wppzqeam";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_wunxm7uffu";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_lwulvr3rwo";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_o7jfdvo6c7";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_jx3ezk2tts";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_4bbt2bslfy";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_mefnrknqzb";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_57bzovvmwe";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_mp7bdpz2cq";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_krmkvl4n6k";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_zdbhp7hhmc";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_wsz7bwy2sn";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_3ycaw52pa4";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_n7ybbnxyal";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_ru66as7qhr";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_iuujvzpydd";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_2cevmpm5ha";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_7csc5p77sj";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_cx2r5hdmpc";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_qmeumul7w4";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_n5uuozkytw";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_6jjwz6jgfn";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_7psgzslyqw";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_qy4jephew7";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_k2tshabbhn";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_dzfr64ghi4";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_bulszdqruq";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_7mxskdbvo3";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_b622u6a4mz";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_n3yp4p2vzk";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_4r6k4uohyf";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_iu4y5p5ihk";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_le3rnunqb5";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_lmjhr3jxjf";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_pwi747uawc";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_drlh7ixlo5";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_c6nejsorpf";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_xl2dplvb7c";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_rjawo2ooou";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_b7k5p7mxdy";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_gtpm5parwn";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_3c7p3tdsiy";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_jgc2utxb4t";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_znvt6oh5hr";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_aly5jn6d45";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_7c57c2ilov";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_kfgio5kp37";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_bstac22wbh";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_m4p7mwtbdk";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_zwvqf4qmlm";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_lobsrpzcbq";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_hfdzxz3nor";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_blewaj5dne";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_mqbzqkaz4o";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_cqb7vplzmf";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_7bqwvgmisw";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_bjbpdp6xem";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_omw3mcextk";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_ajxbl67ghu";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_nprl7keln4";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_zmnh43kml3";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_ybzlg64bpx";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_56f4gscd2o";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_eemdstsjwd";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_uxx7dxdziz";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_gheeoujzg3";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_pwbimkvewd";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_hehty6geft";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_kvhxjln7yu";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_ws3aalkwkh";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_dzzhujhd2x";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_txxrr4675l";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_wlgsv5oas6";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_alavvtv2rx";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_cyyslsevot";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_ikskfrpixe";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_a5yqzsnmmz";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_silfxtdrjl";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_cxkdwkinp4";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_wmfpxpnzad";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_fdmq6gnktx";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_6p5a7xguhh";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_w3kfyscyq6";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_ry3b5yht7o";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_sipguotijl";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_bvdgbsgon2";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_4wmstz4hmo";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_27hetzadou";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_noyti2cwxu";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_wlmmq7zmaj";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_eyglhvygxe";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_plzx4yohio";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_ljk5bvjm3n";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_yujzm7tfrq";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_wzhghjb5zw";

ALTER TABLE "qti"."attribute" DROP COLUMN "__name_6tjehtvnyf";

ALTER TABLE "qti"."attribute" DROP COLUMN "__name_xtraugzbjr";

ALTER TABLE "qti"."attribute" DROP COLUMN "__name_gsghyn4br6";

ALTER TABLE "qti"."attribute" DROP COLUMN "__name_aqo4zwtrd3";

ALTER TABLE "qti"."attribute" DROP COLUMN "__name_vvkts6omjc";

ALTER TABLE "qti"."attribute" DROP COLUMN "__name_yceeqsv2hg";

ALTER TABLE "qti"."attribute" DROP COLUMN "__name_4yahatkdtq";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_y7dqaeab5q";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_wjwjuhdzyz";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_sjrxuynxcw";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_4cgjpk2lbk";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_f4h2j36v7n";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_xdw2o32cnm";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_hqdjvryd6b";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_fnbgf2cryx";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_zlwkkmd2va";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_2wfeqkwfqn";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_xwbs57jtxo";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_lktkxizjfc";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_csg7iijtqx";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_kljmr72u2v";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_2stynqcvvt";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_4kdu55tzvk";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_7nw7yr2g57";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_re7iphd5q7";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_x66c6o6qqc";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_7mfadwl6d4";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_rnrysbg3yb";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_uwj4msdqj3";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_rhp3hiiz4i";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_prluaqupln";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_syq55lmnfj";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_c4xn7x2yea";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_hccg54hs5u";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_6jbpo6rmms";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_5b4shnui5u";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_dpkxtmqpon";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_c34le3wqmo";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_znt2om2y32";

ALTER TABLE "qti"."attribute" DROP COLUMN "__kind_uiqldkyp5d";

ALTER TABLE "qti"."attribute" DROP COLUMN "__kind_qufy76qjfp";

ALTER TABLE "qti"."attribute" DROP COLUMN "__kind_lkqgueftmc";

ALTER TABLE "qti"."attribute" DROP COLUMN "__kind_xemp2mcgxh";

ALTER TABLE "qti"."attribute" DROP COLUMN "__tag_name_srclang_dcbl7x7lov";

ALTER TABLE "qti"."attribute" DROP COLUMN "__tag_kind_track_wiip2dvfgk";

ALTER TABLE "qti"."area_mapping" DROP COLUMN "__start_knfgyygrxk";

ALTER TABLE "qti"."area_mapping" DROP COLUMN "__path_wibt6fzcm4";

ALTER TABLE "qti"."area_mapping" DROP COLUMN "__package_nb6s24lbvy";

ALTER TABLE "qti"."expression" DROP COLUMN "lead_cardinalities";

ALTER TABLE "qti"."expression" DROP COLUMN "operand_base_types";

ALTER TABLE "qti"."expression" DROP COLUMN "operand_cardinalities";

ALTER TABLE "qti"."expression" DROP COLUMN "operands";

ALTER TABLE "qti"."expression" DROP COLUMN "tail_base_types";

ALTER TABLE "qti"."expression" DROP COLUMN "tail_cardinalities";

DROP TABLE "qti"."operand";

COMMENT ON CONSTRAINT "__count_bound_key_package_path_start_max_name_max_rfxpdaee75" ON "qti"."count_bound" IS 'key CountBound(package, path, start, maxName, maxWritten)';

COMMENT ON CONSTRAINT "__count_bound_key_package_path_start_min_name_min_hq6llxrvfm" ON "qti"."count_bound" IS 'key CountBound(package, path, start, minName, minWritten)';

COMMENT ON CONSTRAINT "__node_key_package_path_start_children_ancestry_biyk2qaqax" ON "qti"."node" IS 'key Node(package, path, start, children, ancestry, documentType, governor, kind, nearest, nearestKind, nearestPath, parentKind)';

COMMENT ON COLUMN "qti"."interaction_attribute"."__tag_max_written_true_6phmyjuam6" IS 'tag CountBound.maxWritten = true';

COMMENT ON COLUMN "qti"."interaction_attribute"."__tag_min_written_true_s2qn2qby65" IS 'tag CountBound.minWritten = true';

COMMENT ON CONSTRAINT "__interaction_attribute_fk_package_path_start_name_pg3zewqxih" ON "qti"."interaction_attribute" IS 'foreign key InteractionAttribute(package where {"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-associable-hotspot","qti-associate-interaction","qti-choice-interaction","qti-extended-text-interaction","qti-gap-img","qti-gap-match-interaction","qti-gap-text","qti-graphic-associate-interaction","qti-graphic-gap-match-interaction","qti-graphic-order-interaction","qti-hotspot-interaction","qti-hottext-interaction","qti-match-interaction","qti-media-interaction","qti-order-interaction","qti-position-object-interaction","qti-select-point-interaction","qti-simple-associable-choice"]} and {"arg":{"field":"name","kind":"field"},"kind":"in","values":["match-max","max-associations","max-choices","max-plays","max-strings"]} and {"args":[{"field":"value","kind":"field"},{"kind":"literal","value":"^(?:[^-]|-0+$)"}],"fn":"matches","kind":"compute"} and {"args":[{"field":"value","kind":"field"},{"kind":"literal","value":"^(?:\\+?0*(?:0|[1-9][0-9]{0,17}|[1-8][0-9]{18}|9[0-1][0-9]{17}|92[0-1][0-9]{16}|922[0-2][0-9]{15}|9223[0-2][0-9]{14}|92233[0-6][0-9]{13}|922337[0-1][0-9]{12}|92233720[0-2][0-9]{10}|922337203[0-5][0-9]{9}|9223372036[0-7][0-9]{8}|92233720368[0-4][0-9]{7}|922337203685[0-3][0-9]{6}|9223372036854[0-6][0-9]{5}|92233720368547[0-6][0-9]{4}|922337203685477[0-4][0-9]{3}|9223372036854775[0-7][0-9]{2}|922337203685477580[0-6]|9223372036854775807)|-0*(?:0|[1-9][0-9]{0,17}|[1-8][0-9]{18}|9[0-1][0-9]{17}|92[0-1][0-9]{16}|922[0-2][0-9]{15}|9223[0-2][0-9]{14}|92233[0-6][0-9]{13}|922337[0-1][0-9]{12}|92233720[0-2][0-9]{10}|922337203[0-5][0-9]{9}|9223372036[0-7][0-9]{8}|92233720368[0-4][0-9]{7}|922337203685[0-3][0-9]{6}|9223372036854[0-6][0-9]{5}|92233720368547[0-6][0-9]{4}|922337203685477[0-4][0-9]{3}|9223372036854775[0-7][0-9]{2}|922337203685477580[0-7]|9223372036854775808))$"}],"fn":"matches","kind":"compute"}, path where {"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-associable-hotspot","qti-associate-interaction","qti-choice-interaction","qti-extended-text-interaction","qti-gap-img","qti-gap-match-interaction","qti-gap-text","qti-graphic-associate-interaction","qti-graphic-gap-match-interaction","qti-graphic-order-interaction","qti-hotspot-interaction","qti-hottext-interaction","qti-match-interaction","qti-media-interaction","qti-order-interaction","qti-position-object-interaction","qti-select-point-interaction","qti-simple-associable-choice"]} and {"arg":{"field":"name","kind":"field"},"kind":"in","values":["match-max","max-associations","max-choices","max-plays","max-strings"]} and {"args":[{"field":"value","kind":"field"},{"kind":"literal","value":"^(?:[^-]|-0+$)"}],"fn":"matches","kind":"compute"} and {"args":[{"field":"value","kind":"field"},{"kind":"literal","value":"^(?:\\+?0*(?:0|[1-9][0-9]{0,17}|[1-8][0-9]{18}|9[0-1][0-9]{17}|92[0-1][0-9]{16}|922[0-2][0-9]{15}|9223[0-2][0-9]{14}|92233[0-6][0-9]{13}|922337[0-1][0-9]{12}|92233720[0-2][0-9]{10}|922337203[0-5][0-9]{9}|9223372036[0-7][0-9]{8}|92233720368[0-4][0-9]{7}|922337203685[0-3][0-9]{6}|9223372036854[0-6][0-9]{5}|92233720368547[0-6][0-9]{4}|922337203685477[0-4][0-9]{3}|9223372036854775[0-7][0-9]{2}|922337203685477580[0-6]|9223372036854775807)|-0*(?:0|[1-9][0-9]{0,17}|[1-8][0-9]{18}|9[0-1][0-9]{17}|92[0-1][0-9]{16}|922[0-2][0-9]{15}|9223[0-2][0-9]{14}|92233[0-6][0-9]{13}|922337[0-1][0-9]{12}|92233720[0-2][0-9]{10}|922337203[0-5][0-9]{9}|9223372036[0-7][0-9]{8}|92233720368[0-4][0-9]{7}|922337203685[0-3][0-9]{6}|9223372036854[0-6][0-9]{5}|92233720368547[0-6][0-9]{4}|922337203685477[0-4][0-9]{3}|9223372036854775[0-7][0-9]{2}|922337203685477580[0-7]|9223372036854775808))$"}],"fn":"matches","kind":"compute"}, start where {"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-associable-hotspot","qti-associate-interaction","qti-choice-interaction","qti-extended-text-interaction","qti-gap-img","qti-gap-match-interaction","qti-gap-text","qti-graphic-associate-interaction","qti-graphic-gap-match-interaction","qti-graphic-order-interaction","qti-hotspot-interaction","qti-hottext-interaction","qti-match-interaction","qti-media-interaction","qti-order-interaction","qti-position-object-interaction","qti-select-point-interaction","qti-simple-associable-choice"]} and {"arg":{"field":"name","kind":"field"},"kind":"in","values":["match-max","max-associations","max-choices","max-plays","max-strings"]} and {"args":[{"field":"value","kind":"field"},{"kind":"literal","value":"^(?:[^-]|-0+$)"}],"fn":"matches","kind":"compute"} and {"args":[{"field":"value","kind":"field"},{"kind":"literal","value":"^(?:\\+?0*(?:0|[1-9][0-9]{0,17}|[1-8][0-9]{18}|9[0-1][0-9]{17}|92[0-1][0-9]{16}|922[0-2][0-9]{15}|9223[0-2][0-9]{14}|92233[0-6][0-9]{13}|922337[0-1][0-9]{12}|92233720[0-2][0-9]{10}|922337203[0-5][0-9]{9}|9223372036[0-7][0-9]{8}|92233720368[0-4][0-9]{7}|922337203685[0-3][0-9]{6}|9223372036854[0-6][0-9]{5}|92233720368547[0-6][0-9]{4}|922337203685477[0-4][0-9]{3}|9223372036854775[0-7][0-9]{2}|922337203685477580[0-6]|9223372036854775807)|-0*(?:0|[1-9][0-9]{0,17}|[1-8][0-9]{18}|9[0-1][0-9]{17}|92[0-1][0-9]{16}|922[0-2][0-9]{15}|9223[0-2][0-9]{14}|92233[0-6][0-9]{13}|922337[0-1][0-9]{12}|92233720[0-2][0-9]{10}|922337203[0-5][0-9]{9}|9223372036[0-7][0-9]{8}|92233720368[0-4][0-9]{7}|922337203685[0-3][0-9]{6}|9223372036854[0-6][0-9]{5}|92233720368547[0-6][0-9]{4}|922337203685477[0-4][0-9]{3}|9223372036854775[0-7][0-9]{2}|922337203685477580[0-7]|9223372036854775808))$"}],"fn":"matches","kind":"compute"}, name where {"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-associable-hotspot","qti-associate-interaction","qti-choice-interaction","qti-extended-text-interaction","qti-gap-img","qti-gap-match-interaction","qti-gap-text","qti-graphic-associate-interaction","qti-graphic-gap-match-interaction","qti-graphic-order-interaction","qti-hotspot-interaction","qti-hottext-interaction","qti-match-interaction","qti-media-interaction","qti-order-interaction","qti-position-object-interaction","qti-select-point-interaction","qti-simple-associable-choice"]} and {"arg":{"field":"name","kind":"field"},"kind":"in","values":["match-max","max-associations","max-choices","max-plays","max-strings"]} and {"args":[{"field":"value","kind":"field"},{"kind":"literal","value":"^(?:[^-]|-0+$)"}],"fn":"matches","kind":"compute"} and {"args":[{"field":"value","kind":"field"},{"kind":"literal","value":"^(?:\\+?0*(?:0|[1-9][0-9]{0,17}|[1-8][0-9]{18}|9[0-1][0-9]{17}|92[0-1][0-9]{16}|922[0-2][0-9]{15}|9223[0-2][0-9]{14}|92233[0-6][0-9]{13}|922337[0-1][0-9]{12}|92233720[0-2][0-9]{10}|922337203[0-5][0-9]{9}|9223372036[0-7][0-9]{8}|92233720368[0-4][0-9]{7}|922337203685[0-3][0-9]{6}|9223372036854[0-6][0-9]{5}|92233720368547[0-6][0-9]{4}|922337203685477[0-4][0-9]{3}|9223372036854775[0-7][0-9]{2}|922337203685477580[0-6]|9223372036854775807)|-0*(?:0|[1-9][0-9]{0,17}|[1-8][0-9]{18}|9[0-1][0-9]{17}|92[0-1][0-9]{16}|922[0-2][0-9]{15}|9223[0-2][0-9]{14}|92233[0-6][0-9]{13}|922337[0-1][0-9]{12}|92233720[0-2][0-9]{10}|922337203[0-5][0-9]{9}|9223372036[0-7][0-9]{8}|92233720368[0-4][0-9]{7}|922337203685[0-3][0-9]{6}|9223372036854[0-6][0-9]{5}|92233720368547[0-6][0-9]{4}|922337203685477[0-4][0-9]{3}|9223372036854775[0-7][0-9]{2}|922337203685477580[0-7]|9223372036854775808))$"}],"fn":"matches","kind":"compute"}, tag CountBound.maxWritten = true) to CountBound(package, path, start, maxName, maxWritten)';

COMMENT ON CONSTRAINT "__interaction_attribute_fk_package_path_start_name_gyzrbsoxgk" ON "qti"."interaction_attribute" IS 'foreign key InteractionAttribute(package where {"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-associable-hotspot","qti-associate-interaction","qti-choice-interaction","qti-extended-text-interaction","qti-gap-img","qti-gap-match-interaction","qti-gap-text","qti-graphic-associate-interaction","qti-graphic-gap-match-interaction","qti-graphic-order-interaction","qti-hotspot-interaction","qti-hottext-interaction","qti-match-interaction","qti-media-interaction","qti-order-interaction","qti-position-object-interaction","qti-select-point-interaction","qti-simple-associable-choice"]} and {"arg":{"field":"name","kind":"field"},"kind":"in","values":["match-min","min-associations","min-choices","min-plays","min-strings"]} and {"args":[{"field":"value","kind":"field"},{"kind":"literal","value":"^(?:[^-]|-0+$)"}],"fn":"matches","kind":"compute"} and {"args":[{"field":"value","kind":"field"},{"kind":"literal","value":"^(?:\\+?0*(?:0|[1-9][0-9]{0,17}|[1-8][0-9]{18}|9[0-1][0-9]{17}|92[0-1][0-9]{16}|922[0-2][0-9]{15}|9223[0-2][0-9]{14}|92233[0-6][0-9]{13}|922337[0-1][0-9]{12}|92233720[0-2][0-9]{10}|922337203[0-5][0-9]{9}|9223372036[0-7][0-9]{8}|92233720368[0-4][0-9]{7}|922337203685[0-3][0-9]{6}|9223372036854[0-6][0-9]{5}|92233720368547[0-6][0-9]{4}|922337203685477[0-4][0-9]{3}|9223372036854775[0-7][0-9]{2}|922337203685477580[0-6]|9223372036854775807)|-0*(?:0|[1-9][0-9]{0,17}|[1-8][0-9]{18}|9[0-1][0-9]{17}|92[0-1][0-9]{16}|922[0-2][0-9]{15}|9223[0-2][0-9]{14}|92233[0-6][0-9]{13}|922337[0-1][0-9]{12}|92233720[0-2][0-9]{10}|922337203[0-5][0-9]{9}|9223372036[0-7][0-9]{8}|92233720368[0-4][0-9]{7}|922337203685[0-3][0-9]{6}|9223372036854[0-6][0-9]{5}|92233720368547[0-6][0-9]{4}|922337203685477[0-4][0-9]{3}|9223372036854775[0-7][0-9]{2}|922337203685477580[0-7]|9223372036854775808))$"}],"fn":"matches","kind":"compute"}, path where {"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-associable-hotspot","qti-associate-interaction","qti-choice-interaction","qti-extended-text-interaction","qti-gap-img","qti-gap-match-interaction","qti-gap-text","qti-graphic-associate-interaction","qti-graphic-gap-match-interaction","qti-graphic-order-interaction","qti-hotspot-interaction","qti-hottext-interaction","qti-match-interaction","qti-media-interaction","qti-order-interaction","qti-position-object-interaction","qti-select-point-interaction","qti-simple-associable-choice"]} and {"arg":{"field":"name","kind":"field"},"kind":"in","values":["match-min","min-associations","min-choices","min-plays","min-strings"]} and {"args":[{"field":"value","kind":"field"},{"kind":"literal","value":"^(?:[^-]|-0+$)"}],"fn":"matches","kind":"compute"} and {"args":[{"field":"value","kind":"field"},{"kind":"literal","value":"^(?:\\+?0*(?:0|[1-9][0-9]{0,17}|[1-8][0-9]{18}|9[0-1][0-9]{17}|92[0-1][0-9]{16}|922[0-2][0-9]{15}|9223[0-2][0-9]{14}|92233[0-6][0-9]{13}|922337[0-1][0-9]{12}|92233720[0-2][0-9]{10}|922337203[0-5][0-9]{9}|9223372036[0-7][0-9]{8}|92233720368[0-4][0-9]{7}|922337203685[0-3][0-9]{6}|9223372036854[0-6][0-9]{5}|92233720368547[0-6][0-9]{4}|922337203685477[0-4][0-9]{3}|9223372036854775[0-7][0-9]{2}|922337203685477580[0-6]|9223372036854775807)|-0*(?:0|[1-9][0-9]{0,17}|[1-8][0-9]{18}|9[0-1][0-9]{17}|92[0-1][0-9]{16}|922[0-2][0-9]{15}|9223[0-2][0-9]{14}|92233[0-6][0-9]{13}|922337[0-1][0-9]{12}|92233720[0-2][0-9]{10}|922337203[0-5][0-9]{9}|9223372036[0-7][0-9]{8}|92233720368[0-4][0-9]{7}|922337203685[0-3][0-9]{6}|9223372036854[0-6][0-9]{5}|92233720368547[0-6][0-9]{4}|922337203685477[0-4][0-9]{3}|9223372036854775[0-7][0-9]{2}|922337203685477580[0-7]|9223372036854775808))$"}],"fn":"matches","kind":"compute"}, start where {"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-associable-hotspot","qti-associate-interaction","qti-choice-interaction","qti-extended-text-interaction","qti-gap-img","qti-gap-match-interaction","qti-gap-text","qti-graphic-associate-interaction","qti-graphic-gap-match-interaction","qti-graphic-order-interaction","qti-hotspot-interaction","qti-hottext-interaction","qti-match-interaction","qti-media-interaction","qti-order-interaction","qti-position-object-interaction","qti-select-point-interaction","qti-simple-associable-choice"]} and {"arg":{"field":"name","kind":"field"},"kind":"in","values":["match-min","min-associations","min-choices","min-plays","min-strings"]} and {"args":[{"field":"value","kind":"field"},{"kind":"literal","value":"^(?:[^-]|-0+$)"}],"fn":"matches","kind":"compute"} and {"args":[{"field":"value","kind":"field"},{"kind":"literal","value":"^(?:\\+?0*(?:0|[1-9][0-9]{0,17}|[1-8][0-9]{18}|9[0-1][0-9]{17}|92[0-1][0-9]{16}|922[0-2][0-9]{15}|9223[0-2][0-9]{14}|92233[0-6][0-9]{13}|922337[0-1][0-9]{12}|92233720[0-2][0-9]{10}|922337203[0-5][0-9]{9}|9223372036[0-7][0-9]{8}|92233720368[0-4][0-9]{7}|922337203685[0-3][0-9]{6}|9223372036854[0-6][0-9]{5}|92233720368547[0-6][0-9]{4}|922337203685477[0-4][0-9]{3}|9223372036854775[0-7][0-9]{2}|922337203685477580[0-6]|9223372036854775807)|-0*(?:0|[1-9][0-9]{0,17}|[1-8][0-9]{18}|9[0-1][0-9]{17}|92[0-1][0-9]{16}|922[0-2][0-9]{15}|9223[0-2][0-9]{14}|92233[0-6][0-9]{13}|922337[0-1][0-9]{12}|92233720[0-2][0-9]{10}|922337203[0-5][0-9]{9}|9223372036[0-7][0-9]{8}|92233720368[0-4][0-9]{7}|922337203685[0-3][0-9]{6}|9223372036854[0-6][0-9]{5}|92233720368547[0-6][0-9]{4}|922337203685477[0-4][0-9]{3}|9223372036854775[0-7][0-9]{2}|922337203685477580[0-7]|9223372036854775808))$"}],"fn":"matches","kind":"compute"}, name where {"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-associable-hotspot","qti-associate-interaction","qti-choice-interaction","qti-extended-text-interaction","qti-gap-img","qti-gap-match-interaction","qti-gap-text","qti-graphic-associate-interaction","qti-graphic-gap-match-interaction","qti-graphic-order-interaction","qti-hotspot-interaction","qti-hottext-interaction","qti-match-interaction","qti-media-interaction","qti-order-interaction","qti-position-object-interaction","qti-select-point-interaction","qti-simple-associable-choice"]} and {"arg":{"field":"name","kind":"field"},"kind":"in","values":["match-min","min-associations","min-choices","min-plays","min-strings"]} and {"args":[{"field":"value","kind":"field"},{"kind":"literal","value":"^(?:[^-]|-0+$)"}],"fn":"matches","kind":"compute"} and {"args":[{"field":"value","kind":"field"},{"kind":"literal","value":"^(?:\\+?0*(?:0|[1-9][0-9]{0,17}|[1-8][0-9]{18}|9[0-1][0-9]{17}|92[0-1][0-9]{16}|922[0-2][0-9]{15}|9223[0-2][0-9]{14}|92233[0-6][0-9]{13}|922337[0-1][0-9]{12}|92233720[0-2][0-9]{10}|922337203[0-5][0-9]{9}|9223372036[0-7][0-9]{8}|92233720368[0-4][0-9]{7}|922337203685[0-3][0-9]{6}|9223372036854[0-6][0-9]{5}|92233720368547[0-6][0-9]{4}|922337203685477[0-4][0-9]{3}|9223372036854775[0-7][0-9]{2}|922337203685477580[0-6]|9223372036854775807)|-0*(?:0|[1-9][0-9]{0,17}|[1-8][0-9]{18}|9[0-1][0-9]{17}|92[0-1][0-9]{16}|922[0-2][0-9]{15}|9223[0-2][0-9]{14}|92233[0-6][0-9]{13}|922337[0-1][0-9]{12}|92233720[0-2][0-9]{10}|922337203[0-5][0-9]{9}|9223372036[0-7][0-9]{8}|92233720368[0-4][0-9]{7}|922337203685[0-3][0-9]{6}|9223372036854[0-6][0-9]{5}|92233720368547[0-6][0-9]{4}|922337203685477[0-4][0-9]{3}|9223372036854775[0-7][0-9]{2}|922337203685477580[0-7]|9223372036854775808))$"}],"fn":"matches","kind":"compute"}, tag CountBound.minWritten = true) to CountBound(package, path, start, minName, minWritten)';

COMMENT ON CONSTRAINT "__node_fk_package_path_parent_copy_children_parent_udrokmuxvd" ON "qti"."node" IS 'foreign key Node(package, path, parent, the owner''s count of the family Node.children, parentAncestry, documentType, parentGovernor, parentKind, parentNearest, parentNearestKind, parentNearestPath, parentParentKind) to Node(package, path, start, children, ancestry, documentType, governor, kind, nearest, nearestKind, nearestPath, parentKind)';

COMMENT ON INDEX "qti"."__area_mapping_ix_package_path_base_types_atzmyknytx" IS 'btree index AreaMapping(package, path, baseTypes)';

COMMENT ON INDEX "qti"."__attribute_ix_package_document_type_kind_name_6etft6ueha" IS 'btree index Attribute(package, documentType, kind, name)';

COMMENT ON INDEX "qti"."__attribute_ix_package_path_name_kind_2nk5lyymrg" IS 'btree index Attribute(package, path, name, kind)';

COMMENT ON INDEX "qti"."__attribute_ix_package_path_start_document_type_kind_wxircjibhw" IS 'btree index Attribute(package, path, start, documentType, kind)';

COMMENT ON INDEX "qti"."__data_ssml_property_ix_package_path_start_member_dhbk4ax4nx" IS 'btree index DataSsmlProperty(package, path, start, member, name)';

COMMENT ON INDEX "qti"."__document_ix_package_assembled_ha7ljzwdc5" IS 'btree index Document(package, assembled)';

COMMENT ON INDEX "qti"."__expression_ix_package_path_base_type_yzedaiqawc" IS 'btree index Expression(package, path, baseType)';

COMMENT ON INDEX "qti"."__feedback_ref_declaration_ix_package_path_base_iygriydvtu" IS 'btree index FeedbackRefDeclaration(package, path, baseTypes)';

COMMENT ON INDEX "qti"."__file_ix_package_path_scope_target_3fki67lujr" IS 'btree index File(package, path, scope, target)';

COMMENT ON INDEX "qti"."__file_ix_package_scope_target_dcyuwggcnt" IS 'btree index File(package, scope, target)';

COMMENT ON INDEX "qti"."__fragment_feedback_ref_declaration_ix_package_ulq6rusnbb" IS 'btree index FragmentFeedbackRefDeclaration(package, assembly, baseTypes)';

COMMENT ON INDEX "qti"."__fragment_template_ref_declaration_ix_package_ttbnvlppo7" IS 'btree index FragmentTemplateRefDeclaration(package, assembly, baseTypes)';

COMMENT ON INDEX "qti"."__idref_target_ix_package_path_assembled_4j2motbov2" IS 'btree index IdrefTarget(package, path, assembled)';

COMMENT ON INDEX "qti"."__instance_ix_package_assembly_kind_xyhezipank" IS 'btree index Instance(package, assemblyKind)';

COMMENT ON INDEX "qti"."__instance_ix_package_start_document_ywontbbqhm" IS 'btree index Instance(package, start, document)';

COMMENT ON INDEX "qti"."__interaction_attribute_ix_package_path_name_kind_npebwfpfli" IS 'btree index InteractionAttribute(package, path, name, kind, value)';

COMMENT ON INDEX "qti"."__node_ix_package_kind_parent_kind_document_type_qgxkyeiukh" IS 'btree index Node(package, kind, parentKind, documentType)';

COMMENT ON INDEX "qti"."__node_ix_package_kind_start_3z6dihvx43" IS 'btree index Node(package, kind, start)';

COMMENT ON INDEX "qti"."__node_ix_package_nearest_kind_m7o4twcle4" IS 'btree index Node(package, nearestKind)';

COMMENT ON INDEX "qti"."__node_ix_package_parent_bao3lpk4yp" IS 'btree index Node(package, parent)';

COMMENT ON INDEX "qti"."__node_ix_package_path_at_parent_rafmcwol76" IS 'btree index Node(package, path, at, parent)';

COMMENT ON INDEX "qti"."__node_ix_package_path_element_children_7nzzqbvcpo" IS 'btree index Node(package, path, elementChildren)';

COMMENT ON INDEX "qti"."__node_ix_package_path_kind_parent_parent_kind_duehtvexdz" IS 'btree index Node(package, path, kind, parent, parentKind, documentType)';

COMMENT ON INDEX "qti"."__node_ix_package_path_kind_parent_kind_elements_joehbu4lt4" IS 'btree index Node(package, path, kind, parentKind, elements)';

COMMENT ON INDEX "qti"."__node_ix_package_path_parent_elements_kind_parent_gs7vwuiwx2" IS 'btree index Node(package, path, parent, elements, kind, parentKind)';

COMMENT ON INDEX "qti"."__node_ix_package_path_parent_parent_kind_elements_t5ez2qiv7v" IS 'btree index Node(package, path, parent, parentKind, elements)';

COMMENT ON INDEX "qti"."__node_ix_package_path_parent_kind_kind_document_v4tfcn5dmx" IS 'btree index Node(package, path, parentKind, kind, documentType)';

COMMENT ON INDEX "qti"."__open_attribute_ix_package_path_start_kind_2umcdya4be" IS 'btree index OpenAttribute(package, path, start, kind)';

COMMENT ON INDEX "qti"."__pci_module_form_ix_package_path_element_oufrkv7hi7" IS 'btree index PciModuleForm(package, path, element)';

COMMENT ON INDEX "qti"."__placed_binding_cardinality_ix_package_attribute_ijpfnthorb" IS 'btree index PlacedBindingCardinality(package, attribute, cardinality)';

COMMENT ON INDEX "qti"."__placed_binding_cardinality_ix_package_attribute_73tvrb5xkc" IS 'btree index PlacedBindingCardinality(package, attribute, path, start, cardinality)';

COMMENT ON INDEX "qti"."__placed_choice_ix_package_path_start_identifier_mjcmeodoex" IS 'btree index PlacedChoice(package, path, start, identifier, assembly)';

COMMENT ON INDEX "qti"."__placed_id_ix_package_assembly_id_owner_path_h6ammusr7l" IS 'btree index PlacedId(package, assembly, id, owner, path, instance)';

COMMENT ON INDEX "qti"."__placed_share_target_ix_package_assembly_target_fpl23rvteo" IS 'btree index PlacedShareTarget(package, assembly, targetInstance, targetStart)';

COMMENT ON INDEX "qti"."__placed_variable_ref_ix_package_assembly_identifier_sirvvdpnbh" IS 'btree index PlacedVariableRef(package, assembly, identifier)';

COMMENT ON INDEX "qti"."__placed_variable_ref_declaration_ix_package_a2444ke6rk" IS 'btree index PlacedVariableRefDeclaration(package, assembly, attribute, kind)';

COMMENT ON INDEX "qti"."__placed_variable_ref_declaration_ix_package_7mkh24nrzp" IS 'btree index PlacedVariableRefDeclaration(package, assembly, declaration)';

COMMENT ON INDEX "qti"."__placed_variable_ref_declaration_ix_package_path_n5gbpe2535" IS 'btree index PlacedVariableRefDeclaration(package, path, start)';

COMMENT ON INDEX "qti"."__placed_xml_lang_ix_package_scope_assembly_sk3xhdtnin" IS 'btree index PlacedXmlLang(package, scope, assembly)';

COMMENT ON INDEX "qti"."__reference_path_ix_package_kind_zrl5hgf62h" IS 'btree index ReferencePath(package, kind)';

COMMENT ON INDEX "qti"."__resource_href_ix_package_target_path_e5us4iwzgf" IS 'btree index ResourceHref(package, target, path)';

COMMENT ON INDEX "qti"."__share_target_ix_package_path_target_start_vj2n53ubgi" IS 'btree index ShareTarget(package, path, targetStart)';

COMMENT ON INDEX "qti"."__site_path_ix_package_entry_xx2txel7de" IS 'btree index SitePath(package, entry)';

COMMENT ON INDEX "qti"."__ssml_attribute_ix_package_path_fragment_value_kind_gntxnros3z" IS 'btree index SsmlAttribute(package, path, fragment, value, kind)';

COMMENT ON INDEX "qti"."__ssml_attribute_ix_package_path_start_fragment_oypdwsqovg" IS 'btree index SsmlAttribute(package, path, start, fragment)';

COMMENT ON INDEX "qti"."__template_ref_declaration_ix_package_path_base_7gpg4lskg7" IS 'btree index TemplateRefDeclaration(package, path, baseTypes)';

COMMENT ON INDEX "qti"."__variable_ref_ix_package_path_start_kind_cneek4rjka" IS 'btree index VariableRef(package, path, start, kind)';

COMMENT ON INDEX "qti"."__variable_ref_declaration_ix_package_path_decl_base_4gu7osen7t" IS 'btree index VariableRefDeclaration(package, path, declBaseTypes)';

COMMENT ON INDEX "qti"."__variable_ref_table_ix_package_path_table_zemw44j2nk" IS 'btree index VariableRefTable(package, path, table)';

COMMENT ON INDEX "qti"."__xml_lang_ix_package_scope_path_hebtyuoe5n" IS 'btree index XmlLang(package, scope, path)';

COMMENT ON FUNCTION "qti"."__capture_area_mapping_axqnzlexgs"() IS 'rule capture of AreaMapping';

COMMENT ON FUNCTION "qti"."__capture_area_mapping_cardinality_i5opxkf6do"() IS 'rule capture of AreaMappingCardinality';

COMMENT ON FUNCTION "qti"."__capture_assembled_catalog_3z2sfh4yla"() IS 'rule capture of AssembledCatalog';

COMMENT ON FUNCTION "qti"."__capture_assessment_object_4gfmvq3x2z"() IS 'rule capture of AssessmentObject';

COMMENT ON FUNCTION "qti"."__capture_attribute_itmluum5pt"() IS 'rule capture of Attribute';

COMMENT ON FUNCTION "qti"."__capture_binding_base_type_n376gpzlf2"() IS 'rule capture of BindingBaseType';

COMMENT ON FUNCTION "qti"."__capture_binding_cardinality_3cjo5d2wfq"() IS 'rule capture of BindingCardinality';

COMMENT ON FUNCTION "qti"."__capture_binding_declaration_jew3uchuwp"() IS 'rule capture of BindingDeclaration';

COMMENT ON FUNCTION "qti"."__capture_binding_name_wylitlhovp"() IS 'rule capture of BindingName';

COMMENT ON FUNCTION "qti"."__capture_bound_variable_zkpqqr76nb"() IS 'rule capture of BoundVariable';

COMMENT ON FUNCTION "qti"."__capture_candidate_path_wlkrzbwvw3"() IS 'rule capture of CandidatePath';

COMMENT ON FUNCTION "qti"."__capture_card_support_3a5zrpu2cg"() IS 'rule capture of CardSupport';

COMMENT ON FUNCTION "qti"."__capture_catalog_id_jfqixfjyar"() IS 'rule capture of CatalogId';

COMMENT ON FUNCTION "qti"."__capture_catalog_target_euiym5lfwg"() IS 'rule capture of CatalogTarget';

COMMENT ON FUNCTION "qti"."__capture_cell_headers_stlfdiqhwe"() IS 'rule capture of CellHeaders';

COMMENT ON FUNCTION "qti"."__capture_choice_interaction_67uetkh2me"() IS 'rule capture of ChoiceInteraction';

COMMENT ON FUNCTION "qti"."__capture_cn_attribute_wjtyhps5sc"() IS 'rule capture of CnAttribute';

COMMENT ON FUNCTION "qti"."__capture_cn_count_dpun7ibpty"() IS 'rule capture of CnCount';

COMMENT ON FUNCTION "qti"."__capture_comment_3fafsajrz7"() IS 'rule capture of Comment';

COMMENT ON FUNCTION "qti"."__capture_context_ref_nebkcb5eus"() IS 'rule capture of ContextRef';

COMMENT ON FUNCTION "qti"."__capture_context_ref_declaration_zsw3valubj"() IS 'rule capture of ContextRefDeclaration';

COMMENT ON FUNCTION "qti"."__capture_count_bound_o4cqbs6f73"() IS 'rule capture of CountBound';

COMMENT ON FUNCTION "qti"."__capture_data_ssml_qzwoa3blrx"() IS 'rule capture of DataSsml';

COMMENT ON FUNCTION "qti"."__capture_declaration_26d6p5bgk4"() IS 'rule capture of Declaration';

COMMENT ON FUNCTION "qti"."__capture_declaration_base_type_r4wvqxday5"() IS 'rule capture of DeclarationBaseType';

COMMENT ON FUNCTION "qti"."__capture_declaration_cardinality_kudafbvv6l"() IS 'rule capture of DeclarationCardinality';

COMMENT ON FUNCTION "qti"."__capture_declaration_identifier_dw2ya4o7fc"() IS 'rule capture of DeclarationIdentifier';

COMMENT ON FUNCTION "qti"."__capture_declaration_name_6ibepnxyjg"() IS 'rule capture of DeclarationName';

COMMENT ON FUNCTION "qti"."__capture_doctype_zd2y6ytcuj"() IS 'rule capture of Doctype';

COMMENT ON FUNCTION "qti"."__capture_document_h46mvgroqo"() IS 'rule capture of Document';

COMMENT ON FUNCTION "qti"."__capture_document_id_eulwoph3m7"() IS 'rule capture of DocumentId';

COMMENT ON FUNCTION "qti"."__capture_element_type_6iss5rizj2"() IS 'rule capture of ElementType';

COMMENT ON FUNCTION "qti"."__capture_encoding_decl_uvz4xrwrii"() IS 'rule capture of EncodingDecl';

COMMENT ON FUNCTION "qti"."__capture_entry_bqh2dphmq7"() IS 'rule capture of Entry';

COMMENT ON FUNCTION "qti"."__capture_expression_3gfbksib72"() IS 'rule capture of Expression';

COMMENT ON FUNCTION "qti"."__capture_expression_attribute_rkcc5rpnyr"() IS 'rule capture of ExpressionAttribute';

COMMENT ON FUNCTION "qti"."__capture_feedback_ref_iuekmjyn2k"() IS 'rule capture of FeedbackRef';

COMMENT ON FUNCTION "qti"."__capture_feedback_ref_cardinality_bhulablx63"() IS 'rule capture of FeedbackRefCardinality';

COMMENT ON FUNCTION "qti"."__capture_feedback_ref_declaration_6qqtd4qsie"() IS 'rule capture of FeedbackRefDeclaration';

COMMENT ON FUNCTION "qti"."__capture_file_yjq2w5356h"() IS 'rule capture of File';

COMMENT ON FUNCTION "qti"."__capture_fragment_context_ref_nuuhlshmzu"() IS 'rule capture of FragmentContextRef';

COMMENT ON FUNCTION "qti"."__capture_fragment_context_ref_declaration_466md3x7aa"() IS 'rule capture of FragmentContextRefDeclaration';

COMMENT ON FUNCTION "qti"."__capture_fragment_feedback_ref_imuuftmewc"() IS 'rule capture of FragmentFeedbackRef';

COMMENT ON FUNCTION "qti"."__capture_fragment_feedback_ref_cardinality_wy4lpos45s"() IS 'rule capture of FragmentFeedbackRefCardinality';

COMMENT ON FUNCTION "qti"."__capture_fragment_feedback_ref_declaration_sqh2l5uiwc"() IS 'rule capture of FragmentFeedbackRefDeclaration';

COMMENT ON FUNCTION "qti"."__capture_fragment_printed_ref_uennexi5y2"() IS 'rule capture of FragmentPrintedRef';

COMMENT ON FUNCTION "qti"."__capture_fragment_printed_ref_declaration_5avrdfl5xm"() IS 'rule capture of FragmentPrintedRefDeclaration';

COMMENT ON FUNCTION "qti"."__capture_fragment_scope_iknfqtw5zm"() IS 'rule capture of FragmentScope';

COMMENT ON FUNCTION "qti"."__capture_fragment_template_ref_4a55ciye7u"() IS 'rule capture of FragmentTemplateRef';

COMMENT ON FUNCTION "qti"."__capture_fragment_template_ref_cardinality_vkyxkzxkxm"() IS 'rule capture of FragmentTemplateRefCardinality';

COMMENT ON FUNCTION "qti"."__capture_fragment_template_ref_declaration_o5rl2klfp6"() IS 'rule capture of FragmentTemplateRefDeclaration';

COMMENT ON FUNCTION "qti"."__capture_identity_text_h5x3ut4jpk"() IS 'rule capture of IdentityText';

COMMENT ON FUNCTION "qti"."__capture_idref_4rhkrmfh4c"() IS 'rule capture of Idref';

COMMENT ON FUNCTION "qti"."__capture_idref_target_svtn77efc5"() IS 'rule capture of IdrefTarget';

COMMENT ON FUNCTION "qti"."__capture_inclusion_56gcj75lja"() IS 'rule capture of Inclusion';

COMMENT ON FUNCTION "qti"."__capture_instance_ts6ly2zo5e"() IS 'rule capture of Instance';

COMMENT ON FUNCTION "qti"."__capture_interaction_attribute_wquigysxiz"() IS 'rule capture of InteractionAttribute';

COMMENT ON FUNCTION "qti"."__capture_item_mode_jcqh5xkp3r"() IS 'rule capture of ItemMode';

COMMENT ON FUNCTION "qti"."__capture_label_use_zaf4tt25o3"() IS 'rule capture of LabelUse';

COMMENT ON FUNCTION "qti"."__capture_literal_cmqvxvs66l"() IS 'rule capture of Literal';

COMMENT ON FUNCTION "qti"."__capture_lookup_table_cardinality_xwecrfprt5"() IS 'rule capture of LookupTableCardinality';

COMMENT ON FUNCTION "qti"."__capture_lookup_value_f3rrvlw7j7"() IS 'rule capture of LookupValue';

COMMENT ON FUNCTION "qti"."__capture_lookup_value_type_4mse35hc2w"() IS 'rule capture of LookupValueType';

COMMENT ON FUNCTION "qti"."__capture_manifest_id_hhvsbuvofn"() IS 'rule capture of ManifestId';

COMMENT ON FUNCTION "qti"."__capture_map_key_gtfuz4lzxt"() IS 'rule capture of MapKey';

COMMENT ON FUNCTION "qti"."__capture_map_key_type_td7lkzsbpe"() IS 'rule capture of MapKeyType';

COMMENT ON FUNCTION "qti"."__capture_mapping_cardinality_ijzqojno4x"() IS 'rule capture of MappingCardinality';

COMMENT ON FUNCTION "qti"."__capture_mastery_ceiling_jshk67teuh"() IS 'rule capture of MasteryCeiling';

COMMENT ON FUNCTION "qti"."__capture_mastery_floor_spdmfcjkcz"() IS 'rule capture of MasteryFloor';

COMMENT ON FUNCTION "qti"."__capture_mastery_value_vcu35bia62"() IS 'rule capture of MasteryValue';

COMMENT ON FUNCTION "qti"."__capture_math_action_jd3vrh7mkp"() IS 'rule capture of MathAction';

COMMENT ON FUNCTION "qti"."__capture_math_align_group_rm6un5zx6m"() IS 'rule capture of MathAlignGroup';

COMMENT ON FUNCTION "qti"."__capture_math_align_scope_drfp7lejeu"() IS 'rule capture of MathAlignScope';

COMMENT ON FUNCTION "qti"."__capture_math_cell_gqufe5xqbw"() IS 'rule capture of MathCell';

COMMENT ON FUNCTION "qti"."__capture_math_cn_szq6ag5xrp"() IS 'rule capture of MathCn';

COMMENT ON FUNCTION "qti"."__capture_math_dir_wpqchc2pwi"() IS 'rule capture of MathDir';

COMMENT ON FUNCTION "qti"."__capture_media_2hbvlgszbl"() IS 'rule capture of Media';

COMMENT ON FUNCTION "qti"."__capture_node_7sghxk2dxj"() IS 'rule capture of Node';

COMMENT ON FUNCTION "qti"."__capture_normal_maximum_kyp5brbypx"() IS 'rule capture of NormalMaximum';

COMMENT ON FUNCTION "qti"."__capture_normal_minimum_juiaihzrn6"() IS 'rule capture of NormalMinimum';

COMMENT ON FUNCTION "qti"."__capture_object_identifier_ls422uihva"() IS 'rule capture of ObjectIdentifier';

COMMENT ON FUNCTION "qti"."__capture_object_title_zq43jeggqt"() IS 'rule capture of ObjectTitle';

COMMENT ON FUNCTION "qti"."__capture_open_attribute_zpjedimx7c"() IS 'rule capture of OpenAttribute';

COMMENT ON FUNCTION "qti"."__capture_open_element_name_oaq7r3tjeo"() IS 'rule capture of OpenElementName';

COMMENT ON FUNCTION "qti"."__capture_pci_module_form_rbpjgm5ck4"() IS 'rule capture of PciModuleForm';

COMMENT ON FUNCTION "qti"."__capture_pi_crqtap7l2j"() IS 'rule capture of Pi';

COMMENT ON FUNCTION "qti"."__capture_placed_binding_g6nwtylt4r"() IS 'rule capture of PlacedBinding';

COMMENT ON FUNCTION "qti"."__capture_placed_binding_base_type_3sxjbs5wot"() IS 'rule capture of PlacedBindingBaseType';

COMMENT ON FUNCTION "qti"."__capture_placed_binding_cardinality_k6tkijwsxb"() IS 'rule capture of PlacedBindingCardinality';

COMMENT ON FUNCTION "qti"."__capture_placed_binding_declaration_vacioi7bzb"() IS 'rule capture of PlacedBindingDeclaration';

COMMENT ON FUNCTION "qti"."__capture_placed_catalog_ref_daiefykipu"() IS 'rule capture of PlacedCatalogRef';

COMMENT ON FUNCTION "qti"."__capture_placed_idref_dxsermopm3"() IS 'rule capture of PlacedIdref';

COMMENT ON FUNCTION "qti"."__capture_placed_share_target_jkejimypix"() IS 'rule capture of PlacedShareTarget';

COMMENT ON FUNCTION "qti"."__capture_placed_variable_ref_c73fg3d4ir"() IS 'rule capture of PlacedVariableRef';

COMMENT ON FUNCTION "qti"."__capture_placed_variable_ref_declaration_nj7k4ptc2n"() IS 'rule capture of PlacedVariableRefDeclaration';

COMMENT ON FUNCTION "qti"."__capture_placed_xml_lang_ra6bvxw7sn"() IS 'rule capture of PlacedXmlLang';

COMMENT ON FUNCTION "qti"."__capture_printed_variable_ref_rkvjy5pcp6"() IS 'rule capture of PrintedVariableRef';

COMMENT ON FUNCTION "qti"."__capture_printed_variable_ref_declaration_krv4cqx36k"() IS 'rule capture of PrintedVariableRefDeclaration';

COMMENT ON FUNCTION "qti"."__capture_processing_template_zpolpgtfcq"() IS 'rule capture of ProcessingTemplate';

COMMENT ON FUNCTION "qti"."__capture_record_field_s7d4mmfw4a"() IS 'rule capture of RecordField';

COMMENT ON FUNCTION "qti"."__capture_reference_d5rfnwftad"() IS 'rule capture of Reference';

COMMENT ON FUNCTION "qti"."__capture_reference_path_a7u42lsr4p"() IS 'rule capture of ReferencePath';

COMMENT ON FUNCTION "qti"."__capture_resource_document_ycparq66g5"() IS 'rule capture of ResourceDocument';

COMMENT ON FUNCTION "qti"."__capture_resource_href_a6m5gac7ix"() IS 'rule capture of ResourceHref';

COMMENT ON FUNCTION "qti"."__capture_resource_id_uesq6jkkyk"() IS 'rule capture of ResourceId';

COMMENT ON FUNCTION "qti"."__capture_resource_typed_7ohciq2fbr"() IS 'rule capture of ResourceTyped';

COMMENT ON FUNCTION "qti"."__capture_rounding_62zjiurefn"() IS 'rule capture of Rounding';

COMMENT ON FUNCTION "qti"."__capture_rounding_figures_x67em2nz6x"() IS 'rule capture of RoundingFigures';

COMMENT ON FUNCTION "qti"."__capture_rounding_mode_uck4re5kua"() IS 'rule capture of RoundingMode';

COMMENT ON FUNCTION "qti"."__capture_rounding_mode_figures_np5ekmxxtw"() IS 'rule capture of RoundingModeFigures';

COMMENT ON FUNCTION "qti"."__capture_sd_decl_udvgc2qcdq"() IS 'rule capture of SdDecl';

COMMENT ON FUNCTION "qti"."__capture_share_fragment_23yyb62piz"() IS 'rule capture of ShareFragment';

COMMENT ON FUNCTION "qti"."__capture_share_target_xf6egfoz4f"() IS 'rule capture of ShareTarget';

COMMENT ON FUNCTION "qti"."__capture_site_ccrpb262b6"() IS 'rule capture of Site';

COMMENT ON FUNCTION "qti"."__capture_site_path_lod75hbzio"() IS 'rule capture of SitePath';

COMMENT ON FUNCTION "qti"."__capture_site_target_mykxfkm433"() IS 'rule capture of SiteTarget';

COMMENT ON FUNCTION "qti"."__capture_srcset_i23xwowlg4"() IS 'rule capture of Srcset';

COMMENT ON FUNCTION "qti"."__capture_srcset_candidate_ix5dzebhuu"() IS 'rule capture of SrcsetCandidate';

COMMENT ON FUNCTION "qti"."__capture_ssml_attribute_rqpsgk5ayv"() IS 'rule capture of SsmlAttribute';

COMMENT ON FUNCTION "qti"."__capture_statistic_date_r2idhxrsbt"() IS 'rule capture of StatisticDate';

COMMENT ON FUNCTION "qti"."__capture_stimulus_ref_ebosxnmexe"() IS 'rule capture of StimulusRef';

COMMENT ON FUNCTION "qti"."__capture_table_header_tkmxq7wtew"() IS 'rule capture of TableHeader';

COMMENT ON FUNCTION "qti"."__capture_template_ref_dre62in37w"() IS 'rule capture of TemplateRef';

COMMENT ON FUNCTION "qti"."__capture_template_ref_cardinality_p5ekxjpxky"() IS 'rule capture of TemplateRefCardinality';

COMMENT ON FUNCTION "qti"."__capture_template_ref_declaration_hloorm3mbi"() IS 'rule capture of TemplateRefDeclaration';

COMMENT ON FUNCTION "qti"."__capture_test_document_vecxfoybw2"() IS 'rule capture of TestDocument';

COMMENT ON FUNCTION "qti"."__capture_test_token_zop3xhfahh"() IS 'rule capture of TestToken';

COMMENT ON FUNCTION "qti"."__capture_text_idref_7ya44gwlpj"() IS 'rule capture of TextIdref';

COMMENT ON FUNCTION "qti"."__capture_text_reference_4wyk6zxgqf"() IS 'rule capture of TextReference';

COMMENT ON FUNCTION "qti"."__capture_text_reference_path_znomqpm3dr"() IS 'rule capture of TextReferencePath';

COMMENT ON FUNCTION "qti"."__capture_tolerance_sfo7irkllw"() IS 'rule capture of Tolerance';

COMMENT ON FUNCTION "qti"."__capture_usage_base_type_k5ry5x37sv"() IS 'rule capture of UsageBaseType';

COMMENT ON FUNCTION "qti"."__capture_usage_value_d4x3vydjzt"() IS 'rule capture of UsageValue';

COMMENT ON FUNCTION "qti"."__capture_usage_value_base_type_a6p2zwmowi"() IS 'rule capture of UsageValueBaseType';

COMMENT ON FUNCTION "qti"."__capture_value_base_type_m6wrxnvk7g"() IS 'rule capture of ValueBaseType';

COMMENT ON FUNCTION "qti"."__capture_variable_ref_lckeobxqnf"() IS 'rule capture of VariableRef';

COMMENT ON FUNCTION "qti"."__capture_variable_ref_cardinality_e7jbndmxlq"() IS 'rule capture of VariableRefCardinality';

COMMENT ON FUNCTION "qti"."__capture_variable_ref_declaration_2sripmwnbi"() IS 'rule capture of VariableRefDeclaration';

COMMENT ON FUNCTION "qti"."__capture_variable_ref_table_dabbjr7lvm"() IS 'rule capture of VariableRefTable';

COMMENT ON FUNCTION "qti"."__capture_xml_decl_zmstruv6h7"() IS 'rule capture of XmlDecl';

COMMENT ON FUNCTION "qti"."__capture_xml_lang_t7y5zrpmlb"() IS 'rule capture of XmlLang';
