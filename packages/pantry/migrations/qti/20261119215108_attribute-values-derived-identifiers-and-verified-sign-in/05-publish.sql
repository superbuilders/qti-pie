ALTER TABLE "qti"."attribute" ADD CONSTRAINT "__attribute_key_package_path_start_oavaoq32mu" UNIQUE USING INDEX "__attribute_key_package_path_start_oavaoq32mu";

ALTER TABLE "qti"."node" ADD CONSTRAINT "__node_key_package_path_start_a6pktlx5sj" UNIQUE USING INDEX "__node_key_package_path_start_a6pktlx5sj";

ALTER TABLE "qti"."variable_ref" ADD CONSTRAINT "__variable_ref_key_package_path_start_attribute_kgz4mhfwjm" UNIQUE USING INDEX "__variable_ref_key_package_path_start_attribute_kgz4mhfwjm";

ALTER TABLE "qti"."attribute" ALTER CONSTRAINT "__attribute_fk_package_path_start_copy_attributes_cjh7663z47" NOT DEFERRABLE;

ALTER TABLE "qti"."placed_variable_ref" ADD CONSTRAINT "__placed_variable_ref_fk_package_path_start_x7p53fn7ea" FOREIGN KEY ("package", "path", "start", "attribute", "identifier") REFERENCES "qti"."variable_ref" ("package", "path", "start", "attribute", "identifier") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."usage_value" ADD CONSTRAINT "__usage_value_fk_package_path_start_7ha57yumtv" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("__package_pzlq2bwqm3", "__path_4coi6s576w", "__start_kdua5votbj") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."xml_lang" DROP CONSTRAINT "__xml_lang_fk_package_path_predecessor_langs_4ibvizzhlj";

ALTER TABLE "qti"."xml_lang" DROP CONSTRAINT "__xml_lang_fk_package_path_copy_langs_w2dzasyj6v";

ALTER TABLE "qti"."xml_lang" DROP CONSTRAINT "__xml_lang_fk_package_path_start_scope_p663cbmzz6";

ALTER TABLE "qti"."usage_value" DROP CONSTRAINT "__usage_value_fk_package_path_start_base_type_da2gnubiob";

ALTER TABLE "qti"."table_header" DROP CONSTRAINT "__table_header_fk_package_path_start_tag_kind_th_axklshgm5n";

ALTER TABLE "qti"."table_header" DROP CONSTRAINT "__table_header_fk_package_path_start_id_owner_f2pyrytcjb";

ALTER TABLE "qti"."ssml_attribute" DROP CONSTRAINT "__ssml_attribute_fk_package_path_start_fragment_vindbanifm";

ALTER TABLE "qti"."share_fragment" DROP CONSTRAINT "__share_fragment_fk_package_path_start_s74wl5zaur";

ALTER TABLE "qti"."rounding_mode_figures" DROP CONSTRAINT "__rounding_mode_figures_fk_package_path_start_mode_lxpd2mpfpk";

ALTER TABLE "qti"."rounding" DROP CONSTRAINT "__rounding_fk_package_path_start_paqrdg26bu";

ALTER TABLE "qti"."placed_xml_lang" DROP CONSTRAINT "__placed_xml_lang_fk_package_path_start_lang_scope_thbyc6qfwx";

ALTER TABLE "qti"."placed_xml_lang" DROP CONSTRAINT "__placed_xml_lang_fk_package_assembly_instance_fb6ofemwnu";

ALTER TABLE "qti"."placed_xml_lang" DROP CONSTRAINT "__placed_xml_lang_fk_package_assembly_instance_copy_x7nxpppkfs";

ALTER TABLE "qti"."placed_variable_ref" DROP CONSTRAINT "__placed_variable_ref_fk_package_path_start_5xoznrn7wl";

ALTER TABLE "qti"."placed_id" DROP CONSTRAINT "__placed_id_fk_package_path_start_id_owner_26c5kasps3";

ALTER TABLE "qti"."placed_catalog_ref" DROP CONSTRAINT "__placed_catalog_ref_fk_package_path_id_predecessor_jwfpb6wl32";

ALTER TABLE "qti"."placed_catalog_ref" DROP CONSTRAINT "__placed_catalog_ref_fk_package_path_id_copy_zh2iiovxfq";

ALTER TABLE "qti"."placed_catalog_ref" DROP CONSTRAINT "__placed_catalog_ref_fk_package_assembly_instance_id_7623ni4v4s";

ALTER TABLE "qti"."placed_catalog_ref" DROP CONSTRAINT "__placed_catalog_ref_fk_package_assembly_id_ekloeln6cs";

ALTER TABLE "qti"."normal_minimum" DROP CONSTRAINT "__normal_minimum_fk_package_path_start_predecessor_czez7mfg74";

ALTER TABLE "qti"."normal_minimum" DROP CONSTRAINT "__normal_minimum_fk_package_path_start_copy_minimums_afpztdy4vr";

ALTER TABLE "qti"."normal_maximum" DROP CONSTRAINT "__normal_maximum_fk_package_path_start_predecessor_52uozsg5bh";

ALTER TABLE "qti"."normal_maximum" DROP CONSTRAINT "__normal_maximum_fk_package_path_start_copy_maximums_cbu2gmdlxq";

ALTER TABLE "qti"."mastery_value" DROP CONSTRAINT "__mastery_value_fk_package_path_start_predecessor_55zs7snuf2";

ALTER TABLE "qti"."mastery_value" DROP CONSTRAINT "__mastery_value_fk_package_path_start_copy_masteries_yhz53wspsd";

ALTER TABLE "qti"."mastery_floor" DROP CONSTRAINT "__mastery_floor_fk_package_path_start_normal_minimum_szr5b5iyze";

ALTER TABLE "qti"."mastery_floor" DROP CONSTRAINT "__mastery_floor_fk_package_path_start_mastery_value_btybmwt6gw";

ALTER TABLE "qti"."mastery_ceiling" DROP CONSTRAINT "__mastery_ceiling_fk_package_path_start_normal_64yx7tyloi";

ALTER TABLE "qti"."mastery_ceiling" DROP CONSTRAINT "__mastery_ceiling_fk_package_path_start_mastery_7hmh7lzlf2";

ALTER TABLE "qti"."instance" DROP CONSTRAINT "__instance_fk_package_assembly_start_pred_langs_hxnpcsfxba";

ALTER TABLE "qti"."expression_attribute" DROP CONSTRAINT "__expression_attribute_fk_package_path_start_base_oi7wlemrkf";

ALTER TABLE "qti"."document_id" DROP CONSTRAINT "__document_id_fk_package_path_start_kiborukimb";

ALTER TABLE "qti"."document" DROP CONSTRAINT "__document_fk_package_path_pred_langs_zx2x4l5ilf";

ALTER TABLE "qti"."default_entry" DROP CONSTRAINT "__default_entry_fk_package_path_start_2jitmu2tmi";

ALTER TABLE "qti"."declaration_identifier" DROP CONSTRAINT "__declaration_identifier_fk_package_path_start_etgsyu7jp2";

ALTER TABLE "qti"."declaration_cardinality" DROP CONSTRAINT "__declaration_cardinality_fk_package_path_start_hdwczyx5gl";

ALTER TABLE "qti"."declaration_cardinality" DROP CONSTRAINT "__declaration_cardinality_fk_package_path_start_copy_qyfsjqwwet";

ALTER TABLE "qti"."declaration_base_type" DROP CONSTRAINT "__declaration_base_type_fk_package_path_start_inlas4k3jh";

ALTER TABLE "qti"."declaration_base_type" DROP CONSTRAINT "__declaration_base_type_fk_package_path_start_copy_q3i6nnowme";

ALTER TABLE "qti"."declaration" DROP CONSTRAINT "__declaration_fk_package_path_start_pred_minimums_a3e4637sk2";

ALTER TABLE "qti"."declaration" DROP CONSTRAINT "__declaration_fk_package_path_start_pred_maximums_imoxzqwbcm";

ALTER TABLE "qti"."declaration" DROP CONSTRAINT "__declaration_fk_package_path_start_pred_masteries_2lp2ymrw5i";

ALTER TABLE "qti"."declaration" DROP CONSTRAINT "__declaration_fk_package_path_start_pred_75diyfwvrc";

ALTER TABLE "qti"."declaration" DROP CONSTRAINT "__declaration_fk_package_path_start_pred_base_types_qkvv3kktk5";

ALTER TABLE "qti"."catalog_target" DROP CONSTRAINT "__catalog_target_fk_package_path_id_pred_placements_kruse5hfzb";

ALTER TABLE "qti"."catalog_target" DROP CONSTRAINT "__catalog_target_fk_package_path_id_pred_carriers_3nhldl6hgo";

ALTER TABLE "qti"."catalog_target" DROP CONSTRAINT "__catalog_target_fk_package_path_assembled_7rzo7y6fze";

ALTER TABLE "qti"."catalog_ref" DROP CONSTRAINT "__catalog_ref_fk_package_path_token_predecessor_rl5fvuai42";

ALTER TABLE "qti"."catalog_ref" DROP CONSTRAINT "__catalog_ref_fk_package_path_token_copy_carriers_xpl3kiyzmw";

ALTER TABLE "qti"."catalog_ref" DROP CONSTRAINT "__catalog_ref_fk_package_path_start_7s5vbcew2f";

ALTER TABLE "qti"."catalog_id" DROP CONSTRAINT "__catalog_id_fk_package_path_start_id_owner_rx2hw6nx5f";

ALTER TABLE "qti"."catalog_id" DROP CONSTRAINT "__catalog_id_fk_package_path_start_bzphrymles";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_lexical_imq35kxmm7";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_z674327omr";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_fxkseqh2od";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_lexical_cdoiz46a4g";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_lexical_qq5h4ecnsy";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_lexical_rl5y2ixhww";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_lexical_2nkcnynkku";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_name_kind_lexical_s6jxnlr622";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_lexical_spf6fveeuo";

ALTER TABLE "qti"."xml_lang" DROP CONSTRAINT "__xml_lang_check_xml_lang_counted_document_langs_b67l5cimj6";

ALTER TABLE "qti"."variable_ref" DROP CONSTRAINT "variable_kind";

ALTER TABLE "qti"."variable_ref" DROP CONSTRAINT "variable_declared";

ALTER TABLE "qti"."variable_ref" DROP CONSTRAINT "template_reads";

ALTER TABLE "qti"."variable_ref" DROP CONSTRAINT "mapped_response";

ALTER TABLE "qti"."variable_ref" DROP CONSTRAINT "lookup_type";

ALTER TABLE "qti"."tolerance" DROP CONSTRAINT "e_1_derived";

ALTER TABLE "qti"."test_token" DROP CONSTRAINT "e_1_derived";

ALTER TABLE "qti"."statistic_date" DROP CONSTRAINT "__statistic_date_range_date_p4xuw4vw4e";

ALTER TABLE "qti"."statistic_date" DROP CONSTRAINT "e_1_derived";

ALTER TABLE "qti"."ssml_attribute" DROP CONSTRAINT "e_1_derived";

ALTER TABLE "qti"."srcset" DROP CONSTRAINT "e_1_derived";

ALTER TABLE "qti"."share_fragment" DROP CONSTRAINT "e_1_derived";

ALTER TABLE "qti"."record_field" DROP CONSTRAINT "e_1_derived";

ALTER TABLE "qti"."processing_template" DROP CONSTRAINT "e_1_derived";

ALTER TABLE "qti"."placed_xml_lang" DROP CONSTRAINT "__placed_xml_lang_check_placed_xml_lang_counted_fadjxlptdg";

ALTER TABLE "qti"."placed_variable_ref" DROP CONSTRAINT "variable_kind";

ALTER TABLE "qti"."placed_variable_ref" DROP CONSTRAINT "variable_declared";

ALTER TABLE "qti"."placed_variable_ref" DROP CONSTRAINT "mapped_response";

ALTER TABLE "qti"."placed_variable_ref" DROP CONSTRAINT "lookup_type";

ALTER TABLE "qti"."placed_catalog_ref" DROP CONSTRAINT "__placed_catalog_ref_check_placed_catalog_ref_4ougkbl6fg";

ALTER TABLE "qti"."object_identifier" DROP CONSTRAINT "e_1_derived";

ALTER TABLE "qti"."normal_minimum" DROP CONSTRAINT "__normal_minimum_check_normal_minimum_counted_olqcbwju76";

ALTER TABLE "qti"."normal_maximum" DROP CONSTRAINT "__normal_maximum_check_normal_maximum_counted_37cefyb6ua";

ALTER TABLE "qti"."mastery_value" DROP CONSTRAINT "__mastery_value_check_mastery_value_counted_j6n6ikaer4";

ALTER TABLE "qti"."mastery_floor" DROP CONSTRAINT "mastery_range";

ALTER TABLE "qti"."mastery_ceiling" DROP CONSTRAINT "mastery_range";

ALTER TABLE "qti"."expression_attribute" DROP CONSTRAINT "e_1_derived";

ALTER TABLE "qti"."document_id" DROP CONSTRAINT "e_1_derived";

ALTER TABLE "qti"."declaration_identifier" DROP CONSTRAINT "e_1_derived";

ALTER TABLE "qti"."declaration_identifier" DROP CONSTRAINT "declaration_not_reserved";

ALTER TABLE "qti"."declaration_cardinality" DROP CONSTRAINT "__declaration_cardinality_check_declaration_b66mvca5y5";

ALTER TABLE "qti"."declaration_base_type" DROP CONSTRAINT "__declaration_base_type_check_declaration_base_type_tgknljfvvq";

ALTER TABLE "qti"."cell_headers" DROP CONSTRAINT "e_1_derived";

ALTER TABLE "qti"."catalog_target" DROP CONSTRAINT "e_1_derived";

ALTER TABLE "qti"."catalog_ref" DROP CONSTRAINT "__catalog_ref_check_catalog_ref_counted_catalog_nr4n2szy6a";

ALTER TABLE "qti"."catalog_ref" DROP CONSTRAINT "e_1_derived";

ALTER TABLE "qti"."xml_lang" DROP CONSTRAINT "__xml_lang_key_package_path_predecessor_langs_cb7yt4psx7";

ALTER TABLE "qti"."xml_lang" DROP CONSTRAINT "__xml_lang_key_package_path_index_langs_n7tljkvxy7";

ALTER TABLE "qti"."xml_lang" DROP CONSTRAINT "__xml_lang_key_package_path_start_lang_scope_po5svm23ij";

ALTER TABLE "qti"."variable_ref" DROP CONSTRAINT "__variable_ref_key_package_path_start_attribute_kind_pw2mhkpjxs";

ALTER TABLE "qti"."variable_ref" DROP CONSTRAINT "__variable_ref_key_package_path_start_attribute_unvxdwrr3e";

ALTER TABLE "qti"."usage_base_type" DROP CONSTRAINT "__usage_base_type_key_package_path_start_lexical_tuomi34vev";

ALTER TABLE "qti"."ssml_scope" DROP CONSTRAINT "__ssml_scope_key_package_path_start_fragment_tm4te3e22o";

ALTER TABLE "qti"."share_fragment" DROP CONSTRAINT "__share_fragment_key_package_path_start_src_x24dhuyinf";

ALTER TABLE "qti"."rounding_mode" DROP CONSTRAINT "__rounding_mode_key_package_path_start_mode_uvn2qncqdv";

ALTER TABLE "qti"."resource_id" DROP CONSTRAINT "__resource_id_key_package_identifier_jieobnpe65";

ALTER TABLE "qti"."placed_xml_lang" DROP CONSTRAINT "__placed_xml_lang_key_package_assembly_instance_tev42oxjhu";

ALTER TABLE "qti"."placed_xml_lang" DROP CONSTRAINT "__placed_xml_lang_key_package_assembly_instance_7lgh7qsrdv";

ALTER TABLE "qti"."placed_idref" DROP CONSTRAINT "__placed_idref_key_package_assembly_instance_id_path_v5r4hpiyep";

ALTER TABLE "qti"."placed_catalog_ref" DROP CONSTRAINT "__placed_catalog_ref_key_package_path_id_predecessor_m3y36cdhye";

ALTER TABLE "qti"."placed_catalog_ref" DROP CONSTRAINT "__placed_catalog_ref_key_package_path_id_index_janjkbls7g";

ALTER TABLE "qti"."object_title" DROP CONSTRAINT "__object_title_key_package_path_35hgmlja5g";

ALTER TABLE "qti"."object_identifier" DROP CONSTRAINT "__object_identifier_key_package_path_nbdh4x4x4t";

ALTER TABLE "qti"."object_identifier" DROP CONSTRAINT "__object_identifier_key_package_identifier_dezqlcjgsf";

ALTER TABLE "qti"."normal_minimum" DROP CONSTRAINT "__normal_minimum_key_package_path_start_predecessor_wixsyff5va";

ALTER TABLE "qti"."normal_minimum" DROP CONSTRAINT "__normal_minimum_key_package_path_start_index_7vch3ureoz";

ALTER TABLE "qti"."normal_minimum" DROP CONSTRAINT "__normal_minimum_key_package_path_start_lexical_3iikzrqj5b";

ALTER TABLE "qti"."normal_maximum" DROP CONSTRAINT "__normal_maximum_key_package_path_start_predecessor_5uconnftav";

ALTER TABLE "qti"."normal_maximum" DROP CONSTRAINT "__normal_maximum_key_package_path_start_index_ez2cq2al57";

ALTER TABLE "qti"."normal_maximum" DROP CONSTRAINT "__normal_maximum_key_package_path_start_lexical_45nj5sln5g";

ALTER TABLE "qti"."mastery_value" DROP CONSTRAINT "__mastery_value_key_package_path_start_predecessor_4lvnspicb6";

ALTER TABLE "qti"."mastery_value" DROP CONSTRAINT "__mastery_value_key_package_path_start_index_icdc3okzc3";

ALTER TABLE "qti"."mastery_value" DROP CONSTRAINT "__mastery_value_key_package_path_start_lexical_uqskscnnqr";

ALTER TABLE "qti"."instance" DROP CONSTRAINT "__instance_key_package_assembly_start_langs_document_2ld6oatwi2";

ALTER TABLE "qti"."expression_attribute" DROP CONSTRAINT "__expression_attribute_key_package_path_start_3t52ksyo5x";

ALTER TABLE "qti"."document_id" DROP CONSTRAINT "__document_id_key_package_path_start_owner_lexical_eiwzsowfqs";

ALTER TABLE "qti"."document_id" DROP CONSTRAINT "__document_id_key_package_path_start_lexical_o3fv4lcesq";

ALTER TABLE "qti"."document_id" DROP CONSTRAINT "__document_id_key_package_path_start_id_owner_lcfyvj5sku";

ALTER TABLE "qti"."document" DROP CONSTRAINT "__document_key_package_path_langs_qaqapc6hdp";

ALTER TABLE "qti"."dependency" DROP CONSTRAINT "__dependency_key_package_path_start_lexical_hvu5vzjh2z";

ALTER TABLE "qti"."default_entry" DROP CONSTRAINT "__default_entry_key_package_path_start_lexical_aswq7xjkwc";

ALTER TABLE "qti"."declaration_identifier" DROP CONSTRAINT "__declaration_identifier_key_package_path_start_5bmvr3ekbc";

ALTER TABLE "qti"."declaration_identifier" DROP CONSTRAINT "__declaration_identifier_key_package_path_identifier_cu4zvdh25a";

ALTER TABLE "qti"."declaration_cardinality" DROP CONSTRAINT "__declaration_cardinality_key_package_path_start_swibrkvzh3";

ALTER TABLE "qti"."declaration_cardinality" DROP CONSTRAINT "__declaration_cardinality_key_package_path_start_7h6u5f57fr";

ALTER TABLE "qti"."declaration_base_type" DROP CONSTRAINT "__declaration_base_type_key_package_path_start_znbfgyvcjl";

ALTER TABLE "qti"."declaration_base_type" DROP CONSTRAINT "__declaration_base_type_key_package_path_start_index_ittxbknekk";

ALTER TABLE "qti"."declaration" DROP CONSTRAINT "__declaration_key_package_path_start_minimums_7bpytzlul5";

ALTER TABLE "qti"."declaration" DROP CONSTRAINT "__declaration_key_package_path_start_maximums_moavesnjzv";

ALTER TABLE "qti"."declaration" DROP CONSTRAINT "__declaration_key_package_path_start_masteries_zi4hl2wfln";

ALTER TABLE "qti"."declaration" DROP CONSTRAINT "__declaration_key_package_path_start_cardinalities_l5ctmlrvtm";

ALTER TABLE "qti"."declaration" DROP CONSTRAINT "__declaration_key_package_path_start_base_types_363ey5aick";

ALTER TABLE "qti"."catalog_target" DROP CONSTRAINT "__catalog_target_key_package_path_id_placements_zhvgaloumx";

ALTER TABLE "qti"."catalog_target" DROP CONSTRAINT "__catalog_target_key_package_path_id_carriers_onczov3mh4";

ALTER TABLE "qti"."catalog_scope" DROP CONSTRAINT "__catalog_scope_key_package_path_start_scope_rg5jasghqx";

ALTER TABLE "qti"."catalog_ref" DROP CONSTRAINT "__catalog_ref_key_package_path_token_predecessor_3pp5x6stso";

ALTER TABLE "qti"."catalog_ref" DROP CONSTRAINT "__catalog_ref_key_package_path_token_index_carriers_rtm72hz7wq";

ALTER TABLE "qti"."catalog_ref" DROP CONSTRAINT "__catalog_ref_key_package_path_start_lexical_nrwk72r6ff";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_fuyf63mwkk";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_xwdy6oj2yh";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_2igkkx7ct2";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_kind_w6eonr6o6n";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_cap4e3ltvy";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_kyawhh3cuc";

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_key_package_path_start_nudwhzaoqw";

ALTER TABLE "qti"."xml_lang" DROP CONSTRAINT "__xml_lang_pk_s4ras7seo3";

ALTER TABLE "qti"."value_base_type" DROP CONSTRAINT "__value_base_type_pk_a6f4ovj3d4";

ALTER TABLE "qti"."usage_base_type" DROP CONSTRAINT "__usage_base_type_pk_jljhyurjfg";

ALTER TABLE "qti"."test_token" DROP CONSTRAINT "__test_token_pk_iq46t3wn7h";

ALTER TABLE "qti"."statistic_date" DROP CONSTRAINT "__statistic_date_pk_3dgmy4ney3";

ALTER TABLE "qti"."ssml_attribute" DROP CONSTRAINT "__ssml_attribute_pk_j5zwdqvfvr";

ALTER TABLE "qti"."rounding_mode" DROP CONSTRAINT "__rounding_mode_pk_mcmnwa7im4";

ALTER TABLE "qti"."resource_typed" DROP CONSTRAINT "__resource_typed_pk_bi7ndodb24";

ALTER TABLE "qti"."resource_id" DROP CONSTRAINT "__resource_id_pk_fb7hb5dq52";

ALTER TABLE "qti"."record_field" DROP CONSTRAINT "__record_field_pk_qhg6nv6lbn";

ALTER TABLE "qti"."processing_template" DROP CONSTRAINT "__processing_template_pk_rtwy6lzg2y";

ALTER TABLE "qti"."placed_xml_lang" DROP CONSTRAINT "__placed_xml_lang_pk_4qybdb3rzq";

ALTER TABLE "qti"."placed_catalog_ref" DROP CONSTRAINT "__placed_catalog_ref_pk_xglkpi7dzd";

ALTER TABLE "qti"."object_title" DROP CONSTRAINT "__object_title_pk_wdd53aqkrq";

ALTER TABLE "qti"."object_identifier" DROP CONSTRAINT "__object_identifier_pk_birmvcnbd2";

ALTER TABLE "qti"."math_dir" DROP CONSTRAINT "__math_dir_pk_6awysd6ztt";

ALTER TABLE "qti"."mastery_floor" DROP CONSTRAINT "__mastery_floor_pk_a6sq2yjlac";

ALTER TABLE "qti"."mastery_ceiling" DROP CONSTRAINT "__mastery_ceiling_pk_isqv66lzs2";

ALTER TABLE "qti"."manifest_id" DROP CONSTRAINT "__manifest_id_pk_qzrdp24pyf";

ALTER TABLE "qti"."expression_attribute" DROP CONSTRAINT "__expression_attribute_pk_2qhwgzzpna";

ALTER TABLE "qti"."dependency" DROP CONSTRAINT "__dependency_pk_d6a6ko4xiy";

ALTER TABLE "qti"."default_entry" DROP CONSTRAINT "__default_entry_pk_r6qigbitbp";

ALTER TABLE "qti"."declaration_identifier" DROP CONSTRAINT "__declaration_identifier_pk_dnzhiylis7";

ALTER TABLE "qti"."declaration_cardinality" DROP CONSTRAINT "__declaration_cardinality_pk_sd6salmacv";

ALTER TABLE "qti"."declaration_base_type" DROP CONSTRAINT "__declaration_base_type_pk_wrsxfbvsfh";

ALTER TABLE "qti"."declaration" DROP CONSTRAINT "__declaration_pk_kfs3bogieg";

ALTER TABLE "qti"."catalog_target" DROP CONSTRAINT "__catalog_target_pk_bismj7atmk";

ALTER TABLE "qti"."catalog_ref" DROP CONSTRAINT "__catalog_ref_pk_dpc3bm7nzq";

ALTER TABLE "qti"."card_support" DROP CONSTRAINT "__card_support_pk_lcsvtp6qes";

GRANT USAGE ON DOMAIN "qti"."white_space" TO :"qti_queries__author";

GRANT EXECUTE ON FUNCTION "qti"."__constant_gfmvxmmovs"(), "qti"."__constant_lhuobzyqrw"(), "qti"."__constant_xbotdqqvgh"(), "qti"."__constant_7uzkqxflry"(), "qti"."__constant_7sx4k5dafp"(), "qti"."__constant_ix6q53nxc4"(), "qti"."__constant_d7vlhgq74m"(), "qti"."__constant_mna7ji24ts"(), "qti"."__constant_c6phdaxexj"(), "qti"."__constant_exumc3pw4l"(), "qti"."__constant_dpxdrxs5tb"(), "qti"."__constant_pfv7soskue"(), "qti"."__constant_f6yex76eag"(), "qti"."__constant_cqcjajq6je"(), "qti"."__constant_7deqif5h6e"(), "qti"."__constant_2g7hkewoxo"(), "qti"."__constant_6hgmj2jjmn"(), "qti"."__constant_hfl2x6vm4u"(), "qti"."__constant_c5ai5aqj4d"(), "qti"."__constant_cpugolffqw"(), "qti"."__constant_ow4c7w37ca"(), "qti"."__constant_7ekt6odd7z"(), "qti"."__constant_dfrrdgnp27"(), "qti"."__constant_6bp542xzll"(), "qti"."__constant_5wbcqzraq7"(), "qti"."__constant_ruenmcn2n3"(), "qti"."__constant_a2ijxsudoi"(), "qti"."__constant_37bevpwcmb"(), "qti"."__constant_spbjaqrk2u"(), "qti"."__constant_rkhphuoaln"(), "qti"."__constant_2radsdtcug"(), "qti"."__constant_5r5tigljkc"(), "qti"."__constant_i7ai66pv6h"(), "qti"."__constant_bm26bue3c5"(), "qti"."__constant_zpree6ehyd"(), "qti"."__constant_hygd7nfdcf"(), "qti"."__admission_map_names_h6yggblpz7"(), "qti"."__attribute_model_names_nr3flmvd6s"(), "qti"."__content_model_names_4ibhq646ah"(), "qti"."__follow_set_names_bdlylvzlhh"(), "qti"."__value_domain_names_vlau35f2nu"(), "qti"."__white_space_names_i54twzbo55"() TO :"qti_queries__author";

REVOKE ALL ON DOMAIN "qti"."white_space" FROM PUBLIC;

DROP TRIGGER "__capture_update" ON "qti"."xml_lang";

DROP TRIGGER "__capture_insert" ON "qti"."xml_lang";

DROP TRIGGER "__capture_delete" ON "qti"."xml_lang";

DROP TRIGGER "__capture_update" ON "qti"."value_base_type";

DROP TRIGGER "__capture_insert" ON "qti"."value_base_type";

DROP TRIGGER "__capture_delete" ON "qti"."value_base_type";

DROP TRIGGER "__capture_update" ON "qti"."usage_base_type";

DROP TRIGGER "__capture_insert" ON "qti"."usage_base_type";

DROP TRIGGER "__capture_delete" ON "qti"."usage_base_type";

DROP TRIGGER "__capture_update" ON "qti"."test_token";

DROP TRIGGER "__capture_insert" ON "qti"."test_token";

DROP TRIGGER "__capture_delete" ON "qti"."test_token";

DROP TRIGGER "__capture_update" ON "qti"."statistic_date";

DROP TRIGGER "__capture_insert" ON "qti"."statistic_date";

DROP TRIGGER "__capture_delete" ON "qti"."statistic_date";

DROP TRIGGER "__capture_update" ON "qti"."ssml_attribute";

DROP TRIGGER "__capture_insert" ON "qti"."ssml_attribute";

DROP TRIGGER "__capture_delete" ON "qti"."ssml_attribute";

DROP TRIGGER "__capture_update" ON "qti"."rounding_mode";

DROP TRIGGER "__capture_insert" ON "qti"."rounding_mode";

DROP TRIGGER "__capture_delete" ON "qti"."rounding_mode";

DROP TRIGGER "__capture_update" ON "qti"."resource_typed";

DROP TRIGGER "__capture_insert" ON "qti"."resource_typed";

DROP TRIGGER "__capture_delete" ON "qti"."resource_typed";

DROP TRIGGER "__capture_update" ON "qti"."resource_id";

DROP TRIGGER "__capture_insert" ON "qti"."resource_id";

DROP TRIGGER "__capture_delete" ON "qti"."resource_id";

DROP TRIGGER "__capture_update" ON "qti"."record_field";

DROP TRIGGER "__capture_insert" ON "qti"."record_field";

DROP TRIGGER "__capture_delete" ON "qti"."record_field";

DROP TRIGGER "__capture_update" ON "qti"."processing_template";

DROP TRIGGER "__capture_delete" ON "qti"."processing_template";

DROP TRIGGER "__capture_update" ON "qti"."placed_xml_lang";

DROP TRIGGER "__capture_insert" ON "qti"."placed_xml_lang";

DROP TRIGGER "__capture_delete" ON "qti"."placed_xml_lang";

DROP TRIGGER "__capture_update" ON "qti"."object_title";

DROP TRIGGER "__capture_insert" ON "qti"."object_title";

DROP TRIGGER "__capture_delete" ON "qti"."object_title";

DROP TRIGGER "__capture_update" ON "qti"."object_identifier";

DROP TRIGGER "__capture_insert" ON "qti"."object_identifier";

DROP TRIGGER "__capture_delete" ON "qti"."object_identifier";

DROP TRIGGER "__capture_update" ON "qti"."math_dir";

DROP TRIGGER "__capture_insert" ON "qti"."math_dir";

DROP TRIGGER "__capture_delete" ON "qti"."math_dir";

DROP TRIGGER "__capture_update" ON "qti"."mastery_floor";

DROP TRIGGER "__capture_delete" ON "qti"."mastery_floor";

DROP TRIGGER "__capture_update" ON "qti"."mastery_ceiling";

DROP TRIGGER "__capture_delete" ON "qti"."mastery_ceiling";

DROP TRIGGER "__capture_update" ON "qti"."manifest_id";

DROP TRIGGER "__capture_insert" ON "qti"."manifest_id";

DROP TRIGGER "__capture_delete" ON "qti"."manifest_id";

DROP TRIGGER "__capture_update" ON "qti"."expression_attribute";

DROP TRIGGER "__capture_insert" ON "qti"."expression_attribute";

DROP TRIGGER "__capture_delete" ON "qti"."expression_attribute";

DROP TRIGGER "__capture_update" ON "qti"."dependency";

DROP TRIGGER "__capture_insert" ON "qti"."dependency";

DROP TRIGGER "__capture_delete" ON "qti"."dependency";

DROP TRIGGER "__capture_update" ON "qti"."default_entry";

DROP TRIGGER "__capture_insert" ON "qti"."default_entry";

DROP TRIGGER "__capture_delete" ON "qti"."default_entry";

DROP TRIGGER "__capture_update" ON "qti"."declaration_identifier";

DROP TRIGGER "__capture_insert" ON "qti"."declaration_identifier";

DROP TRIGGER "__capture_delete" ON "qti"."declaration_identifier";

DROP TRIGGER "__capture_update" ON "qti"."declaration_cardinality";

DROP TRIGGER "__capture_insert" ON "qti"."declaration_cardinality";

DROP TRIGGER "__capture_delete" ON "qti"."declaration_cardinality";

DROP TRIGGER "__capture_update" ON "qti"."declaration_base_type";

DROP TRIGGER "__capture_insert" ON "qti"."declaration_base_type";

DROP TRIGGER "__capture_delete" ON "qti"."declaration_base_type";

DROP TRIGGER "__capture_update" ON "qti"."declaration";

DROP TRIGGER "__capture_insert" ON "qti"."declaration";

DROP TRIGGER "__capture_delete" ON "qti"."declaration";

DROP TRIGGER "__capture_update" ON "qti"."catalog_target";

DROP TRIGGER "__capture_insert" ON "qti"."catalog_target";

DROP TRIGGER "__capture_delete" ON "qti"."catalog_target";

DROP TRIGGER "__capture_update" ON "qti"."card_support";

DROP TRIGGER "__capture_insert" ON "qti"."card_support";

DROP TRIGGER "__capture_delete" ON "qti"."card_support";

DROP TRIGGER "__isolation" ON "qti"."xml_lang";

DROP TRIGGER "__isolation" ON "qti"."value_base_type";

DROP TRIGGER "__isolation" ON "qti"."usage_base_type";

DROP TRIGGER "__isolation" ON "qti"."test_token";

DROP TRIGGER "__isolation" ON "qti"."statistic_date";

DROP TRIGGER "__isolation" ON "qti"."ssml_attribute";

DROP TRIGGER "__isolation" ON "qti"."rounding_mode";

DROP TRIGGER "__isolation" ON "qti"."resource_typed";

DROP TRIGGER "__isolation" ON "qti"."resource_id";

DROP TRIGGER "__isolation" ON "qti"."record_field";

DROP TRIGGER "__isolation" ON "qti"."processing_template";

DROP TRIGGER "__isolation" ON "qti"."placed_xml_lang";

DROP TRIGGER "__isolation" ON "qti"."placed_catalog_ref";

DROP TRIGGER "__isolation" ON "qti"."object_title";

DROP TRIGGER "__isolation" ON "qti"."object_identifier";

DROP TRIGGER "__isolation" ON "qti"."math_dir";

DROP TRIGGER "__isolation" ON "qti"."mastery_floor";

DROP TRIGGER "__isolation" ON "qti"."mastery_ceiling";

DROP TRIGGER "__isolation" ON "qti"."manifest_id";

DROP TRIGGER "__isolation" ON "qti"."expression_attribute";

DROP TRIGGER "__isolation" ON "qti"."dependency";

DROP TRIGGER "__isolation" ON "qti"."default_entry";

DROP TRIGGER "__isolation" ON "qti"."declaration_identifier";

DROP TRIGGER "__isolation" ON "qti"."declaration_cardinality";

DROP TRIGGER "__isolation" ON "qti"."declaration_base_type";

DROP TRIGGER "__isolation" ON "qti"."declaration";

DROP TRIGGER "__isolation" ON "qti"."catalog_target";

DROP TRIGGER "__isolation" ON "qti"."catalog_ref";

DROP TRIGGER "__isolation" ON "qti"."card_support";

DROP INDEX "qti"."__xml_lang_ix_package_scope_om564zz2j4";

DROP INDEX "qti"."__variable_ref_ix_package_path_start_kind_cneek4rjka";

DROP INDEX "qti"."__variable_ref_ix_package_path_resolution_start_4nq2w3y2z5";

DROP INDEX "qti"."__variable_ref_ix_package_path_identifier_attribute_gyojyhppiq";

DROP INDEX "qti"."__variable_ref_ix_package_path_attribute_kind_puul4h7gj2";

DROP INDEX "qti"."__test_token_ix_package_path_name_start_bvn3bvxmfx";

DROP INDEX "qti"."__ssml_attribute_ix_package_path_start_fragment_oypdwsqovg";

DROP INDEX "qti"."__ssml_attribute_ix_package_path_kind_refers_start_ydwxciifk5";

DROP INDEX "qti"."__ssml_attribute_ix_package_path_kind_fragment_value_t6adfhbqvu";

DROP INDEX "qti"."__resource_typed_ix_package_type_path_t3hsvdgldu";

DROP INDEX "qti"."__placed_xml_lang_ix_package_scope_path_start_lang_hexmxaqdo6";

DROP INDEX "qti"."__placed_variable_ref_ix_package_resolution_assembly_zzk4vby5a7";

DROP INDEX "qti"."__placed_variable_ref_ix_package_path_start_2q3l4iq6bv";

DROP INDEX "qti"."__placed_variable_ref_ix_package_assembly_resolution_em2t6oiztr";

DROP INDEX "qti"."__placed_variable_ref_ix_assembly_package_resolution_65pde67kdy";

DROP INDEX "qti"."__placed_id_ix_package_path_start_id_owner_2mw5p3hbhz";

DROP INDEX "qti"."__placed_catalog_ref_ix_package_assembly_id_kdjgjrfc3x";

DROP INDEX "qti"."__object_title_ix_package_start_path_keqoaxyfjh";

DROP INDEX "qti"."__node_ix_package_path_element_children_7nzzqbvcpo";

DROP INDEX "qti"."__node_ix_kind_path_package_start_a4z4zafh2t";

DROP INDEX "qti"."__expression_attribute_ix_package_path_start_base_p7gnpkt44g";

DROP INDEX "qti"."__document_id_ix_package_path_admitted_id_owner_b7n73pi7dm";

DROP INDEX "qti"."__document_id_ix_package_g_5_t_3_qs_22_xj_path_gtds36clsc";

DROP INDEX "qti"."__document_id_ix_package_3_skzd_7_oggn_path_54_a_2_yinwnsr22s";

DROP INDEX "qti"."__declaration_cardinality_ix_package_path_lxnodpf6jc";

DROP INDEX "qti"."__declaration_cardinality_ix_package_cardinality_ds3iz44lte";

DROP INDEX "qti"."__catalog_target_ix_package_path_assembled_33irlqxsqz";

DROP INDEX "qti"."__attribute_ix_package_path_name_kind_start_jj2dexdmnt";

DROP INDEX "qti"."__attribute_ix_package_mgbz_7_f_45_gp_path_vlsjep4nc4";

DROP INDEX "qti"."__attribute_ix_package_jrh_4_wbrdcs_path_xrl_4_ean_az4tli67t7";

DROP INDEX "qti"."__attribute_ix_package_cl_3_pk_5_vj_2_u_path_ohpc_6_erni4pmgra";

DROP FUNCTION "qti"."__capture_xml_lang_t7y5zrpmlb"() RESTRICT;

DROP FUNCTION "qti"."__capture_value_base_type_m6wrxnvk7g"() RESTRICT;

DROP FUNCTION "qti"."__capture_usage_base_type_k5ry5x37sv"() RESTRICT;

DROP FUNCTION "qti"."__capture_test_token_zop3xhfahh"() RESTRICT;

DROP FUNCTION "qti"."__capture_statistic_date_r2idhxrsbt"() RESTRICT;

DROP FUNCTION "qti"."__capture_ssml_attribute_rqpsgk5ayv"() RESTRICT;

DROP FUNCTION "qti"."__capture_rounding_mode_uck4re5kua"() RESTRICT;

DROP FUNCTION "qti"."__capture_resource_typed_7ohciq2fbr"() RESTRICT;

DROP FUNCTION "qti"."__capture_resource_id_uesq6jkkyk"() RESTRICT;

DROP FUNCTION "qti"."__capture_record_field_s7d4mmfw4a"() RESTRICT;

DROP FUNCTION "qti"."__capture_processing_template_zpolpgtfcq"() RESTRICT;

DROP FUNCTION "qti"."__capture_placed_xml_lang_ra6bvxw7sn"() RESTRICT;

DROP FUNCTION "qti"."__capture_object_title_zq43jeggqt"() RESTRICT;

DROP FUNCTION "qti"."__capture_object_identifier_ls422uihva"() RESTRICT;

DROP FUNCTION "qti"."__capture_math_dir_wpqchc2pwi"() RESTRICT;

DROP FUNCTION "qti"."__capture_mastery_floor_spdmfcjkcz"() RESTRICT;

DROP FUNCTION "qti"."__capture_mastery_ceiling_jshk67teuh"() RESTRICT;

DROP FUNCTION "qti"."__capture_manifest_id_hhvsbuvofn"() RESTRICT;

DROP FUNCTION "qti"."__capture_expression_attribute_rkcc5rpnyr"() RESTRICT;

DROP FUNCTION "qti"."__capture_dependency_tvovto6fc3"() RESTRICT;

DROP FUNCTION "qti"."__capture_default_entry_lshycmbax4"() RESTRICT;

DROP FUNCTION "qti"."__capture_declaration_identifier_dw2ya4o7fc"() RESTRICT;

DROP FUNCTION "qti"."__capture_declaration_cardinality_kudafbvv6l"() RESTRICT;

DROP FUNCTION "qti"."__capture_declaration_base_type_r4wvqxday5"() RESTRICT;

DROP FUNCTION "qti"."__capture_declaration_26d6p5bgk4"() RESTRICT;

DROP FUNCTION "qti"."__capture_catalog_target_euiym5lfwg"() RESTRICT;

DROP FUNCTION "qti"."__capture_card_support_3a5zrpu2cg"() RESTRICT;

DROP FUNCTION "qti"."__judge_usage_value_csf5n37al4"("pg_catalog"."text"[]) RESTRICT;

DROP FUNCTION "qti"."__judge_assembled_catalog_7q3v274en6"("pg_catalog"."text"[]) RESTRICT;

ALTER TABLE "qti"."xml_lang" DROP COLUMN "__predecessor_langs_53avmna55b";

ALTER TABLE "qti"."xml_lang" DROP COLUMN "__index_langs_u3mkdvlfzy";

ALTER TABLE "qti"."xml_lang" DROP COLUMN "__copy_langs_dihu5ppg2z";

ALTER TABLE "qti"."table_header" DROP COLUMN "__tag_kind_th_xngqtwe4yz";

ALTER TABLE "qti"."placed_xml_lang" DROP COLUMN "__predecessor_langs_qhumxzosck";

ALTER TABLE "qti"."placed_xml_lang" DROP COLUMN "__index_langs_ytjbctqh27";

ALTER TABLE "qti"."placed_xml_lang" DROP COLUMN "__copy_langs_z2u2njcfbe";

ALTER TABLE "qti"."placed_catalog_ref" DROP COLUMN "__predecessor_placements_c2fqnwv44p";

ALTER TABLE "qti"."placed_catalog_ref" DROP COLUMN "__index_placements_d2wxprh2dm";

ALTER TABLE "qti"."placed_catalog_ref" DROP COLUMN "__copy_placements_t3ks3hyo75";

ALTER TABLE "qti"."normal_minimum" DROP COLUMN "__predecessor_minimums_mm2ip3wxht";

ALTER TABLE "qti"."normal_minimum" DROP COLUMN "__index_minimums_o7i7g7jmrr";

ALTER TABLE "qti"."normal_minimum" DROP COLUMN "__copy_minimums_lahfl32huj";

ALTER TABLE "qti"."normal_maximum" DROP COLUMN "__predecessor_maximums_f2ahozibez";

ALTER TABLE "qti"."normal_maximum" DROP COLUMN "__index_maximums_343fnrzlel";

ALTER TABLE "qti"."normal_maximum" DROP COLUMN "__copy_maximums_7gaevec3kc";

ALTER TABLE "qti"."node" DROP COLUMN "__string_value_cu46ee4zpr";

ALTER TABLE "qti"."node" DROP COLUMN "__start_wlwbtkgcxf";

ALTER TABLE "qti"."node" DROP COLUMN "__path_mss3eygqiy";

ALTER TABLE "qti"."node" DROP COLUMN "__parent_be27blz6so";

ALTER TABLE "qti"."node" DROP COLUMN "__package_744kzqyvzq";

ALTER TABLE "qti"."mastery_value" DROP COLUMN "__predecessor_masteries_2z2vccqcgc";

ALTER TABLE "qti"."mastery_value" DROP COLUMN "__index_masteries_2canycxzww";

ALTER TABLE "qti"."mastery_value" DROP COLUMN "__copy_masteries_ak3dyeyqml";

ALTER TABLE "qti"."instance" DROP COLUMN "__pred_langs_yw2uicm4pt";

ALTER TABLE "qti"."expression_attribute" DROP COLUMN "__start_n3lj5slgo2";

ALTER TABLE "qti"."expression_attribute" DROP COLUMN "__path_zxzmtqtuwi";

ALTER TABLE "qti"."expression_attribute" DROP COLUMN "__package_bzfnqgau4z";

ALTER TABLE "qti"."document_id" DROP COLUMN "__start_gbt6xoloim";

ALTER TABLE "qti"."document_id" DROP COLUMN "__start_cuhnourovl";

ALTER TABLE "qti"."document_id" DROP COLUMN "__path_54a2yuvngj";

ALTER TABLE "qti"."document_id" DROP COLUMN "__path_gavmtoa5r4";

ALTER TABLE "qti"."document_id" DROP COLUMN "__package_3skzd7oggn";

ALTER TABLE "qti"."document_id" DROP COLUMN "__package_g5t3qs22xj";

ALTER TABLE "qti"."document" DROP COLUMN "__pred_langs_yw2uicm4pt";

ALTER TABLE "qti"."declaration_cardinality" DROP COLUMN "__predecessor_cardinalities_fi6uzgoejj";

ALTER TABLE "qti"."declaration_cardinality" DROP COLUMN "__index_cardinalities_qklnqrg2l7";

ALTER TABLE "qti"."declaration_cardinality" DROP COLUMN "__copy_cardinalities_n77nf7aktz";

ALTER TABLE "qti"."declaration_base_type" DROP COLUMN "__predecessor_base_types_cv64rsiiv7";

ALTER TABLE "qti"."declaration_base_type" DROP COLUMN "__index_base_types_nszfdko4cf";

ALTER TABLE "qti"."declaration_base_type" DROP COLUMN "__copy_base_types_vvkb7xqgxa";

ALTER TABLE "qti"."declaration" DROP COLUMN "__pred_minimums_4oaqcj6ux5";

ALTER TABLE "qti"."declaration" DROP COLUMN "__pred_maximums_m7gp2vvdjh";

ALTER TABLE "qti"."declaration" DROP COLUMN "__pred_masteries_kjnae25ayb";

ALTER TABLE "qti"."declaration" DROP COLUMN "__pred_cardinalities_ekhsnan2xd";

ALTER TABLE "qti"."declaration" DROP COLUMN "__pred_base_types_jqcun7b56g";

ALTER TABLE "qti"."catalog_target" DROP COLUMN "__pred_placements_wtijf47h4h";

ALTER TABLE "qti"."catalog_target" DROP COLUMN "__pred_carriers_5eaxdkd6g3";

ALTER TABLE "qti"."catalog_ref" DROP COLUMN "__predecessor_carriers_5c5zqm5lvk";

ALTER TABLE "qti"."catalog_ref" DROP COLUMN "__index_carriers_xvh5q75w5v";

ALTER TABLE "qti"."catalog_ref" DROP COLUMN "__copy_carriers_uro7enydey";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_e4zhccl5sr";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_jlf55mdwoe";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_frsqrmqlnd";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_7c7wkvj7tg";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_5bmaolgqju";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_gnm4qpjdy6";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_rc4nppr3ud";

ALTER TABLE "qti"."attribute" DROP COLUMN "__start_rr4guycxoe";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_7e3z4qkvcr";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_ofqkijqyop";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_23el63sekx";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_ohpc6sozn2";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_ofxw47iyns";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_gy2savhene";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_azunhoshef";

ALTER TABLE "qti"."attribute" DROP COLUMN "__path_z4osijqpge";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_ww6m6kuwsv";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_mgbz7f45gp";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_l26un5p764";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_cl3pk5vj2u";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_ly6xvnlp4w";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_vhxntdyqxe";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_b6kgnl3xfs";

ALTER TABLE "qti"."attribute" DROP COLUMN "__package_sb4vf54qea";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_lhmbaka5ng";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_5jffbis46p";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_cunus2zs73";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_pflyfaba35";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_iq5qbrz5aw";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_apioa7nvbq";

ALTER TABLE "qti"."attribute" DROP COLUMN "__lexical_gzsofzukbe";

ALTER TABLE "qti"."attribute" DROP COLUMN "__kind_kfm5644qqo";

ALTER TABLE "qti"."variable_ref" DROP COLUMN "kind";

ALTER TABLE "qti"."variable_ref" DROP COLUMN "lexical";

ALTER TABLE "qti"."tolerance" DROP COLUMN "lexical";

ALTER TABLE "qti"."srcset" DROP COLUMN "kind";

ALTER TABLE "qti"."srcset" DROP COLUMN "lexical";

ALTER TABLE "qti"."srcset" DROP COLUMN "name";

ALTER TABLE "qti"."share_fragment" DROP COLUMN "src";

ALTER TABLE "qti"."rounding" DROP COLUMN "mode_written";

ALTER TABLE "qti"."resource_href" DROP COLUMN "href";

ALTER TABLE "qti"."placed_variable_ref" DROP COLUMN "kind";

ALTER TABLE "qti"."math_align_scope" DROP COLUMN "dir_lexical";

ALTER TABLE "qti"."instance" DROP COLUMN "langs";

ALTER TABLE "qti"."file" DROP COLUMN "href";

ALTER TABLE "qti"."document_id" DROP COLUMN "id";

ALTER TABLE "qti"."document_id" DROP COLUMN "lexical";

ALTER TABLE "qti"."document" DROP COLUMN "langs";

ALTER TABLE "qti"."cell_headers" DROP COLUMN "lexical";

DROP TABLE "qti"."xml_lang";

DROP TABLE "qti"."value_base_type";

DROP TABLE "qti"."usage_base_type";

DROP TABLE "qti"."test_token";

DROP TABLE "qti"."statistic_date";

DROP TABLE "qti"."ssml_attribute";

DROP TABLE "qti"."rounding_mode";

DROP TABLE "qti"."resource_typed";

DROP TABLE "qti"."resource_id";

DROP TABLE "qti"."record_field";

DROP TABLE "qti"."processing_template";

DROP TABLE "qti"."placed_xml_lang";

DROP TABLE "qti"."placed_catalog_ref";

DROP TABLE "qti"."object_title";

DROP TABLE "qti"."object_identifier";

DROP TABLE "qti"."math_dir";

DROP TABLE "qti"."mastery_floor";

DROP TABLE "qti"."mastery_ceiling";

DROP TABLE "qti"."manifest_id";

DROP TABLE "qti"."expression_attribute";

DROP TABLE "qti"."dependency";

DROP TABLE "qti"."default_entry";

DROP TABLE "qti"."declaration_identifier";

DROP TABLE "qti"."declaration_cardinality";

DROP TABLE "qti"."declaration_base_type";

DROP TABLE "qti"."declaration";

DROP TABLE "qti"."catalog_target";

DROP TABLE "qti"."catalog_ref";

DROP TABLE "qti"."card_support";

DROP DOMAIN "qti"."__text_psn65t7m7e";

DROP DOMAIN "qti"."rp_template";

DROP FUNCTION "qti"."__value_domain_names_iuifu35b3z"() RESTRICT;

DROP FUNCTION "qti"."__rp_template_names_tkkjkmwhuf"() RESTRICT;

DROP FUNCTION "qti"."__follow_set_names_hjehsydj6w"() RESTRICT;

DROP FUNCTION "qti"."__content_model_names_mtfi4p233t"() RESTRICT;

DROP FUNCTION "qti"."__attribute_model_names_nxe2p5tkgj"() RESTRICT;

DROP FUNCTION "qti"."__admission_map_names_pguqjlp5mf"() RESTRICT;

DROP FUNCTION "qti"."__constant_w6q5m4enxi"() RESTRICT;

DROP FUNCTION "qti"."__constant_asc2ypkhox"() RESTRICT;

DROP FUNCTION "qti"."__constant_vyp2frjbbo"() RESTRICT;

DROP FUNCTION "qti"."__constant_uu3dawwe5n"() RESTRICT;

DROP FUNCTION "qti"."__constant_6g3eprpflt"() RESTRICT;

DROP FUNCTION "qti"."__constant_s2clitxmd5"() RESTRICT;

DROP FUNCTION "qti"."__constant_v34rx6nskb"() RESTRICT;

DROP FUNCTION "qti"."__constant_fp3wpqejee"() RESTRICT;

DROP FUNCTION "qti"."__constant_gazfxeallk"() RESTRICT;

DROP FUNCTION "qti"."__constant_kb4fdckstq"() RESTRICT;

DROP FUNCTION "qti"."__constant_hh7nvhrixk"() RESTRICT;

DROP FUNCTION "qti"."__constant_cls5rvcu3r"() RESTRICT;

DROP FUNCTION "qti"."__constant_66i4fjuv6n"() RESTRICT;

DROP FUNCTION "qti"."__constant_co5t72rjej"() RESTRICT;

DROP FUNCTION "qti"."__constant_iksi4cbdex"() RESTRICT;

DROP FUNCTION "qti"."__constant_qtgq7e2fzq"() RESTRICT;

DROP FUNCTION "qti"."__constant_hvwnko24pe"() RESTRICT;

DROP FUNCTION "qti"."__constant_wqg37rggb2"() RESTRICT;

DROP FUNCTION "qti"."__constant_yzav37j3jv"() RESTRICT;

DROP FUNCTION "qti"."__constant_wekllvzqqv"() RESTRICT;

DROP FUNCTION "qti"."__constant_syl7spvwkk"() RESTRICT;

DROP FUNCTION "qti"."__constant_47ksumromp"() RESTRICT;

DROP FUNCTION "qti"."__constant_qav2thqv4e"() RESTRICT;

DROP FUNCTION "qti"."__constant_w7ajqoatpc"() RESTRICT;

DROP FUNCTION "qti"."__constant_55zhzij6ga"() RESTRICT;

DROP FUNCTION "qti"."__constant_iiomoobndf"() RESTRICT;

DROP FUNCTION "qti"."__constant_i6uilxd3jo"() RESTRICT;

DROP FUNCTION "qti"."__constant_cj5uk4wta2"() RESTRICT;

DROP FUNCTION "qti"."__constant_mqruo3kqrm"() RESTRICT;

DROP FUNCTION "qti"."__constant_ibciimd7k5"() RESTRICT;

DROP FUNCTION "qti"."__constant_l73fpgyu4v"() RESTRICT;

DROP FUNCTION "qti"."__constant_zkeuho6kw7"() RESTRICT;

DROP FUNCTION "qti"."__constant_rqwqzvpydz"() RESTRICT;

DROP FUNCTION "qti"."__constant_q37pzav2s5"() RESTRICT;

DROP FUNCTION "qti"."__constant_y3upkg42xe"() RESTRICT;

ALTER DOMAIN "qti"."admission_map" VALIDATE CONSTRAINT "check";

ALTER DOMAIN "qti"."attribute_model" VALIDATE CONSTRAINT "check";

ALTER DOMAIN "qti"."content_model" VALIDATE CONSTRAINT "check";

ALTER DOMAIN "qti"."follow_set" VALIDATE CONSTRAINT "check";

ALTER DOMAIN "qti"."value_domain" VALIDATE CONSTRAINT "check";

COMMENT ON FUNCTION "qti"."__constant_gfmvxmmovs"() IS 'closed constant 04ef942c4e6b217ba4f0802e7444d847359893e9582f06b9409020db97317e28';

COMMENT ON FUNCTION "qti"."__constant_lhuobzyqrw"() IS 'closed constant 1f7a837df97c3911470281a891bb4d0fa69ac9dcfbbb63bdd42fa93d14ca5204';

COMMENT ON FUNCTION "qti"."__constant_xbotdqqvgh"() IS 'closed constant 2be791abe5d766fce5fb43c746ad7d670e43304d4717a3c4d41d7afaa9d6f838';

COMMENT ON FUNCTION "qti"."__constant_7uzkqxflry"() IS 'closed constant 305647f91405fee551c654b37f2a8ec47068919e3133592106ce7e97d4154644';

COMMENT ON FUNCTION "qti"."__constant_7sx4k5dafp"() IS 'closed constant 33358071921fbbf20238504a74ac23db82aa46696530a6b209d643705583b9d3';

COMMENT ON FUNCTION "qti"."__constant_ix6q53nxc4"() IS 'closed constant 36e6a4d256806731ec0215bc662aea10f3f45bcb79fa27e5b4303453a540bc0c';

COMMENT ON FUNCTION "qti"."__constant_d7vlhgq74m"() IS 'closed constant 37c3d31c4ffb71618b72a0309a1571458de0e3024a44be7cd5cf6d7c1e05b0ed';

COMMENT ON FUNCTION "qti"."__constant_mna7ji24ts"() IS 'closed constant 4328db97850410d61b51e2b6860943d914f630b853e7ca46d461bd3587164a87';

COMMENT ON FUNCTION "qti"."__constant_c6phdaxexj"() IS 'closed constant 446e692b12af301623fa5164ab3d47d2f2c4970dd95b97d1e0c797ed2cb4e23a';

COMMENT ON FUNCTION "qti"."__constant_exumc3pw4l"() IS 'closed constant 4f662cc5dcaeb2fe3c395c4a2ceb5e4e1b669cf5ba5732f31930be6930153387';

COMMENT ON FUNCTION "qti"."__constant_dpxdrxs5tb"() IS 'closed constant 5d05c49e7f095df4a1376b7a8a061ee6f3a12b46a2fa36068b6716a267e8b382';

COMMENT ON FUNCTION "qti"."__constant_pfv7soskue"() IS 'closed constant 602ba7d5cbca849bf99c1a429c39e705e8ebfd8a1f168685db31ccfd22dbad08';

COMMENT ON FUNCTION "qti"."__constant_f6yex76eag"() IS 'closed constant 64bdd731986f8b9c93c2b9b039ffcdf5a88f70e2916c3630c297c3a5423bc300';

COMMENT ON FUNCTION "qti"."__constant_cqcjajq6je"() IS 'closed constant 6d029e0fc256a3f0e22c61f9afea712e4b6d5a51b714b182432bd358062056dd';

COMMENT ON FUNCTION "qti"."__constant_7deqif5h6e"() IS 'closed constant 756a06541524a05f72bd8102b7b9a293da9f2ea38c3bb64a14d4ae94cf239ff3';

COMMENT ON FUNCTION "qti"."__constant_2g7hkewoxo"() IS 'closed constant 836846f28afee98ec0c76756e913aadb4365ea4679a46c8903089ecff655ae2a';

COMMENT ON FUNCTION "qti"."__constant_6hgmj2jjmn"() IS 'closed constant 9266593dc06e45b7f22f9ce85697465f50febb44641ec62cc3f021124ffd6b61';

COMMENT ON FUNCTION "qti"."__constant_hfl2x6vm4u"() IS 'closed constant 9ba46412843778729f22c7471f64a52022b8e403e31e6fb497ae35011fd8ceac';

COMMENT ON FUNCTION "qti"."__constant_c5ai5aqj4d"() IS 'closed constant ae80f4fb60be7d4aa45baf28b78671569c2ceb4d31cd318d7d32080ab3de0b62';

COMMENT ON FUNCTION "qti"."__constant_cpugolffqw"() IS 'closed constant b202f4491233aaff9dffed9a237544947e56f865393901714f663ed634dde275';

COMMENT ON FUNCTION "qti"."__constant_ow4c7w37ca"() IS 'closed constant b71a2845fad6eecf87038aea2b3d133cc2fb85cae4ea5db224accea62e377c01';

COMMENT ON FUNCTION "qti"."__constant_7ekt6odd7z"() IS 'closed constant bcf3aae133d078f9126d854e1579f1981914769db3150b5d6496ed63eaf27eae';

COMMENT ON FUNCTION "qti"."__constant_dfrrdgnp27"() IS 'closed constant c1c0b9a6a84345a3f1cf56d14356201919cbb8130c7becebdfdad26e334f4b8c';

COMMENT ON FUNCTION "qti"."__constant_6bp542xzll"() IS 'closed constant c27347a5990a087980a7f12ff05206dabfbdb720636b3d7fbbb20d8b91055920';

COMMENT ON FUNCTION "qti"."__constant_5wbcqzraq7"() IS 'closed constant c2d5a13b346148a485676111fdc5f056a4913ba7206b40858212048e9aaa85c0';

COMMENT ON FUNCTION "qti"."__constant_ruenmcn2n3"() IS 'closed constant c72ad12fb178e8860afda10eb8318a093acf4919059fe4979b73488a1cee4f3a';

COMMENT ON FUNCTION "qti"."__constant_a2ijxsudoi"() IS 'closed constant ca749a145784131d5b2dc90d9e9a6ce7c558ad8aea43c865c98dd8baeb1a1bcc';

COMMENT ON FUNCTION "qti"."__constant_37bevpwcmb"() IS 'closed constant cce743c1de05ff8d2110602291f019277f7aaca23326b843a056513ea2e9dbce';

COMMENT ON FUNCTION "qti"."__constant_spbjaqrk2u"() IS 'closed constant d689dbc9559469eee4276b21629447d580cd6fdf90a8ee09afe2adb1ede43c11';

COMMENT ON FUNCTION "qti"."__constant_rkhphuoaln"() IS 'closed constant de7c0e90b85d17f98eb43d6b7605c313d45272bf906530632f308d58ebaeb0fc';

COMMENT ON FUNCTION "qti"."__constant_2radsdtcug"() IS 'closed constant dea56d59e75d19e30b5144a10b74b3329f951d746cf7b9ad8df55a2446053b54';

COMMENT ON FUNCTION "qti"."__constant_5r5tigljkc"() IS 'closed constant e80e69a6b469580ecad5a035ff999d6b62679513ff9f0c8d3a3885b92a9da841';

COMMENT ON FUNCTION "qti"."__constant_i7ai66pv6h"() IS 'closed constant e85967b3cef5d19555fa61f1d253182f5b5c5bcd5a07fb8660d51720c8f4fb91';

COMMENT ON FUNCTION "qti"."__constant_bm26bue3c5"() IS 'closed constant ef377d7592a459f5b22833cd43456cc6cfc804231047bc75a8b61e43d6f0bdf9';

COMMENT ON FUNCTION "qti"."__constant_zpree6ehyd"() IS 'closed constant f248091770abc72337fff08a8a8ee9d83fad2c27ec87e900ed799d2e063a71ce';

COMMENT ON FUNCTION "qti"."__constant_hygd7nfdcf"() IS 'closed constant f8bd34ab1d78f7d63582bb8b063e461be466180b42dcd81db20836ae01adf514';

COMMENT ON FUNCTION "qti"."__admission_map_names_h6yggblpz7"() IS 'names of roster AdmissionMap (184331f998ea427e3dd40efb626161bd86915d64447c6c83781ab7ec153a794a)';

COMMENT ON FUNCTION "qti"."__attribute_model_names_nr3flmvd6s"() IS 'names of roster AttributeModel (bdc3f4daff34a20597ff75f4c2c8caecc939178c73a5301ec9e791ed5b2486d2)';

COMMENT ON FUNCTION "qti"."__content_model_names_4ibhq646ah"() IS 'names of roster ContentModel (ee6e5a7609f0635fdd54b73a89efee58893d138a837d168a4949d3ec9b82ce85)';

COMMENT ON FUNCTION "qti"."__follow_set_names_bdlylvzlhh"() IS 'names of roster FollowSet (f94d91ab6ec82e7ff184430fbbc376b5a912f4200f6b16b04b32f3b629d66a3f)';

COMMENT ON FUNCTION "qti"."__value_domain_names_vlau35f2nu"() IS 'names of roster ValueDomain (1f14150a82cdac45ad490bbd2ca9b8671b73b41c835826d484dd5da2fdeffc9e)';

COMMENT ON FUNCTION "qti"."__white_space_names_i54twzbo55"() IS 'names of roster WhiteSpace (be4a5082396853ed0ad2a833bfe105ada3da43a52a2a2f804b2ee15f41fd6ae3)';

COMMENT ON CONSTRAINT "__node_check_node_children_concat_fold_2qfkeydkpv" ON "qti"."node" IS 'check of Node for law concat fold over fin(Node, children) of Node(package, path, parent, chars, charsWas, charsAfter) where {"args":[{"arg":{"field":"parentKind","kind":"field"},"kind":"in","values":["lom:catalog","lom:entity","lom:entry","lom:id","lom:language","lom:source","lom:value","qti-base-value","qti-resource-icon","qti-value","ud:value"]},{"args":[{"arg":{"field":"parentParentKind","kind":"field"},"kind":"in","values":["lom:entry.langString","lom:source.langString","lom:title"]},{"kind":"compare","left":{"field":"parentKind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"lom:string"}}],"kind":"and"},{"args":[{"field":"parentGovernor","kind":"field"}],"kind":"closedHas","relation":"CheckedText"}],"kind":"or"} and {"kind":"compare","left":{"field":"start","kind":"field"},"op":"gt","right":{"kind":"literal","value":"~n:0"}} into Node(package, path, start, stringValue)';

COMMENT ON CONSTRAINT "__variable_ref_key_package_path_start_attribute_kgz4mhfwjm" ON "qti"."variable_ref" IS 'key VariableRef(package, path, start, attribute, identifier)';

COMMENT ON COLUMN "qti"."attribute"."__package_errr4rslgl" IS 'package where {"args":[{"args":[{"arg":{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"field":"name","kind":"field"}],"field":"domain","kind":"closedAt","relation":"AttributeGrammar"}],"field":"identity","kind":"closedAt","relation":"ValueIdentity"},"kind":"in","values":["ID"]},{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"field":"name","kind":"field"}],"field":"domain","kind":"closedAt","relation":"AttributeGrammar"}],"kind":"closedHas","relation":"ValueIdentity"}],"kind":"and"},{"args":[{"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"qti-context-declaration"}},{"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"identifier"}}],"kind":"and"}],"kind":"or"}';

COMMENT ON COLUMN "qti"."attribute"."__path_6r25o73dfe" IS 'path where {"args":[{"args":[{"arg":{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"field":"name","kind":"field"}],"field":"domain","kind":"closedAt","relation":"AttributeGrammar"}],"field":"identity","kind":"closedAt","relation":"ValueIdentity"},"kind":"in","values":["ID"]},{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"field":"name","kind":"field"}],"field":"domain","kind":"closedAt","relation":"AttributeGrammar"}],"kind":"closedHas","relation":"ValueIdentity"}],"kind":"and"},{"args":[{"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"qti-context-declaration"}},{"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"identifier"}}],"kind":"and"}],"kind":"or"}';

COMMENT ON COLUMN "qti"."attribute"."__start_3yrluhvjfi" IS 'start where {"args":[{"args":[{"arg":{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"field":"name","kind":"field"}],"field":"domain","kind":"closedAt","relation":"AttributeGrammar"}],"field":"identity","kind":"closedAt","relation":"ValueIdentity"},"kind":"in","values":["ID"]},{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"field":"name","kind":"field"}],"field":"domain","kind":"closedAt","relation":"AttributeGrammar"}],"kind":"closedHas","relation":"ValueIdentity"}],"kind":"and"},{"args":[{"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"qti-context-declaration"}},{"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"identifier"}}],"kind":"and"}],"kind":"or"}';

COMMENT ON COLUMN "qti"."node"."__package_pzlq2bwqm3" IS 'package where {"kind":"compare","left":{"args":[{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"kind":"literal","value":"baseType"}],"field":"slot","kind":"closedAt","relation":"AttributeGrammar"}],"fn":"singleton","kind":"compute"},{"field":"attrs","kind":"field"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}} and {"kind":"compare","left":{"args":[{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"kind":"literal","value":"fieldIdentifier"}],"field":"slot","kind":"closedAt","relation":"AttributeGrammar"}],"fn":"singleton","kind":"compute"},{"field":"attrs","kind":"field"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}} and {"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"ud:value"}}';

COMMENT ON COLUMN "qti"."node"."__path_4coi6s576w" IS 'path where {"kind":"compare","left":{"args":[{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"kind":"literal","value":"baseType"}],"field":"slot","kind":"closedAt","relation":"AttributeGrammar"}],"fn":"singleton","kind":"compute"},{"field":"attrs","kind":"field"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}} and {"kind":"compare","left":{"args":[{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"kind":"literal","value":"fieldIdentifier"}],"field":"slot","kind":"closedAt","relation":"AttributeGrammar"}],"fn":"singleton","kind":"compute"},{"field":"attrs","kind":"field"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}} and {"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"ud:value"}}';

COMMENT ON COLUMN "qti"."node"."__start_kdua5votbj" IS 'start where {"kind":"compare","left":{"args":[{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"kind":"literal","value":"baseType"}],"field":"slot","kind":"closedAt","relation":"AttributeGrammar"}],"fn":"singleton","kind":"compute"},{"field":"attrs","kind":"field"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}} and {"kind":"compare","left":{"args":[{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"kind":"literal","value":"fieldIdentifier"}],"field":"slot","kind":"closedAt","relation":"AttributeGrammar"}],"fn":"singleton","kind":"compute"},{"field":"attrs","kind":"field"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}} and {"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"ud:value"}}';

COMMENT ON CONSTRAINT "__attribute_key_package_path_start_oavaoq32mu" ON "qti"."attribute" IS 'key Attribute(package where {"args":[{"args":[{"arg":{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"field":"name","kind":"field"}],"field":"domain","kind":"closedAt","relation":"AttributeGrammar"}],"field":"identity","kind":"closedAt","relation":"ValueIdentity"},"kind":"in","values":["ID"]},{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"field":"name","kind":"field"}],"field":"domain","kind":"closedAt","relation":"AttributeGrammar"}],"kind":"closedHas","relation":"ValueIdentity"}],"kind":"and"},{"args":[{"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"qti-context-declaration"}},{"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"identifier"}}],"kind":"and"}],"kind":"or"}, path where {"args":[{"args":[{"arg":{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"field":"name","kind":"field"}],"field":"domain","kind":"closedAt","relation":"AttributeGrammar"}],"field":"identity","kind":"closedAt","relation":"ValueIdentity"},"kind":"in","values":["ID"]},{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"field":"name","kind":"field"}],"field":"domain","kind":"closedAt","relation":"AttributeGrammar"}],"kind":"closedHas","relation":"ValueIdentity"}],"kind":"and"},{"args":[{"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"qti-context-declaration"}},{"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"identifier"}}],"kind":"and"}],"kind":"or"}, start where {"args":[{"args":[{"arg":{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"field":"name","kind":"field"}],"field":"domain","kind":"closedAt","relation":"AttributeGrammar"}],"field":"identity","kind":"closedAt","relation":"ValueIdentity"},"kind":"in","values":["ID"]},{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"field":"name","kind":"field"}],"field":"domain","kind":"closedAt","relation":"AttributeGrammar"}],"kind":"closedHas","relation":"ValueIdentity"}],"kind":"and"},{"args":[{"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"qti-context-declaration"}},{"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"identifier"}}],"kind":"and"}],"kind":"or"})';

COMMENT ON CONSTRAINT "__node_key_package_path_start_a6pktlx5sj" ON "qti"."node" IS 'key Node(package where {"kind":"compare","left":{"args":[{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"kind":"literal","value":"baseType"}],"field":"slot","kind":"closedAt","relation":"AttributeGrammar"}],"fn":"singleton","kind":"compute"},{"field":"attrs","kind":"field"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}} and {"kind":"compare","left":{"args":[{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"kind":"literal","value":"fieldIdentifier"}],"field":"slot","kind":"closedAt","relation":"AttributeGrammar"}],"fn":"singleton","kind":"compute"},{"field":"attrs","kind":"field"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}} and {"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"ud:value"}}, path where {"kind":"compare","left":{"args":[{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"kind":"literal","value":"baseType"}],"field":"slot","kind":"closedAt","relation":"AttributeGrammar"}],"fn":"singleton","kind":"compute"},{"field":"attrs","kind":"field"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}} and {"kind":"compare","left":{"args":[{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"kind":"literal","value":"fieldIdentifier"}],"field":"slot","kind":"closedAt","relation":"AttributeGrammar"}],"fn":"singleton","kind":"compute"},{"field":"attrs","kind":"field"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}} and {"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"ud:value"}}, start where {"kind":"compare","left":{"args":[{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"kind":"literal","value":"baseType"}],"field":"slot","kind":"closedAt","relation":"AttributeGrammar"}],"fn":"singleton","kind":"compute"},{"field":"attrs","kind":"field"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}} and {"kind":"compare","left":{"args":[{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"kind":"literal","value":"fieldIdentifier"}],"field":"slot","kind":"closedAt","relation":"AttributeGrammar"}],"fn":"singleton","kind":"compute"},{"field":"attrs","kind":"field"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}} and {"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"ud:value"}})';

COMMENT ON CONSTRAINT "__attribute_fk_package_path_start_name_widdrwwglz" ON "qti"."attribute" IS 'foreign key Attribute(package where {"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-any-n","qti-correct","qti-default","qti-equal-rounded","qti-index","qti-lookup-outcome-value","qti-map-response","qti-map-response-point","qti-pattern-match","qti-random-float","qti-random-integer","qti-repeat","qti-round-to","qti-set-correct-response","qti-set-default-value","qti-set-outcome-value","qti-set-template-value","qti-variable"]} and {"args":[{"args":[{"args":[{"arg":{"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-random-float"]},"kind":"not"},{"arg":{"args":[{"field":"lexical","kind":"field"},{"kind":"literal","value":"^[\\t\\n\\r ]*(?:INF|NaN)[\\t\\n\\r ]*$"}],"fn":"matches","kind":"compute"},"kind":"not"}],"kind":"or"},{"args":[{"field":"lexical","kind":"field"},{"kind":"literal","value":"^[\\t\\n\\r ]*(?:[A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u0131\\u0134-\\u013E\\u0141-\\u0148\\u014A-\\u017E\\u0180-\\u01C3\\u01CD-\\u01F0\\u01F4\\u01F5\\u01FA-\\u0217\\u0250-\\u02A8\\u02BB-\\u02C1\\u0386\\u0388-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03CE\\u03D0-\\u03D6\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2-\\u03F3\\u0401-\\u040C\\u040E-\\u044F\\u0451-\\u045C\\u045E-\\u0481\\u0490-\\u04C4\\u04C7\\u04C8\\u04CB\\u04CC\\u04D0-\\u04EB\\u04EE-\\u04F5\\u04F8\\u04F9\\u0531-\\u0556\\u0559\\u0561-\\u0586\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u063A\\u0641-\\u064A\\u0671-\\u06B7\\u06BA-\\u06BE\\u06C0-\\u06CE\\u06D0-\\u06D3\\u06D5\\u06E5\\u06E6\\u0905-\\u0939\\u093D\\u0958-\\u0961\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09DC\\u09DD\\u09DF-\\u09E1\\u09F0\\u09F1\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74\\u0A85-\\u0A8B\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AE0\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B36-\\u0B39\\u0B3D\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB5\\u0BB7-\\u0BB9\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C60\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CDE\\u0CE0\\u0CE1\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D60\\u0D61\\u0E01-\\u0E2E\\u0E30\\u0E32\\u0E33\\u0E40-\\u0E45\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD\\u0EAE\\u0EB0\\u0EB2\\u0EB3\\u0EBD\\u0EC0-\\u0EC4\\u0F40-\\u0F47\\u0F49-\\u0F69\\u10A0-\\u10C5\\u10D0-\\u10F6\\u1100\\u1102\\u1103\\u1105-\\u1107\\u1109\\u110B\\u110C\\u110E-\\u1112\\u113C\\u113E\\u1140\\u114C\\u114E\\u1150\\u1154\\u1155\\u1159\\u115F-\\u1161\\u1163\\u1165\\u1167\\u1169\\u116D\\u116E\\u1172\\u1173\\u1175\\u119E\\u11A8\\u11AB\\u11AE\\u11AF\\u11B7\\u11B8\\u11BA\\u11BC-\\u11C2\\u11EB\\u11F0\\u11F9\\u1E00-\\u1E9B\\u1EA0-\\u1EF9\\u1F00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u2126\\u212A\\u212B\\u212E\\u2180-\\u2182\\u3007\\u3021-\\u3029\\u3041-\\u3094\\u30A1-\\u30FA\\u3105-\\u312C\\u4E00-\\u9FA5\\uAC00-\\uD7A3][\\-.0-9A-Z_a-z\\u00B7\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u0131\\u0134-\\u013E\\u0141-\\u0148\\u014A-\\u017E\\u0180-\\u01C3\\u01CD-\\u01F0\\u01F4\\u01F5\\u01FA-\\u0217\\u0250-\\u02A8\\u02BB-\\u02C1\\u02D0\\u02D1\\u0300-\\u0345\\u0360\\u0361\\u0386-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03CE\\u03D0-\\u03D6\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2-\\u03F3\\u0401-\\u040C\\u040E-\\u044F\\u0451-\\u045C\\u045E-\\u0481\\u0483-\\u0486\\u0490-\\u04C4\\u04C7\\u04C8\\u04CB\\u04CC\\u04D0-\\u04EB\\u04EE-\\u04F5\\u04F8\\u04F9\\u0531-\\u0556\\u0559\\u0561-\\u0586\\u0591-\\u05A1\\u05A3-\\u05B9\\u05BB-\\u05BD\\u05BF\\u05C1\\u05C2\\u05C4\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u063A\\u0640-\\u0652\\u0660-\\u0669\\u0670-\\u06B7\\u06BA-\\u06BE\\u06C0-\\u06CE\\u06D0-\\u06D3\\u06D5-\\u06E8\\u06EA-\\u06ED\\u06F0-\\u06F9\\u0901-\\u0903\\u0905-\\u0939\\u093C-\\u094D\\u0951-\\u0954\\u0958-\\u0963\\u0966-\\u096F\\u0981-\\u0983\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BC\\u09BE-\\u09C4\\u09C7\\u09C8\\u09CB-\\u09CD\\u09D7\\u09DC\\u09DD\\u09DF-\\u09E3\\u09E6-\\u09F1\\u0A02\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A3C\\u0A3E-\\u0A42\\u0A47\\u0A48\\u0A4B-\\u0A4D\\u0A59-\\u0A5C\\u0A5E\\u0A66-\\u0A74\\u0A81-\\u0A83\\u0A85-\\u0A8B\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABC-\\u0AC5\\u0AC7-\\u0AC9\\u0ACB-\\u0ACD\\u0AE0\\u0AE6-\\u0AEF\\u0B01-\\u0B03\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B36-\\u0B39\\u0B3C-\\u0B43\\u0B47\\u0B48\\u0B4B-\\u0B4D\\u0B56\\u0B57\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B66-\\u0B6F\\u0B82\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB5\\u0BB7-\\u0BB9\\u0BBE-\\u0BC2\\u0BC6-\\u0BC8\\u0BCA-\\u0BCD\\u0BD7\\u0BE7-\\u0BEF\\u0C01-\\u0C03\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3E-\\u0C44\\u0C46-\\u0C48\\u0C4A-\\u0C4D\\u0C55\\u0C56\\u0C60\\u0C61\\u0C66-\\u0C6F\\u0C82\\u0C83\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBE-\\u0CC4\\u0CC6-\\u0CC8\\u0CCA-\\u0CCD\\u0CD5\\u0CD6\\u0CDE\\u0CE0\\u0CE1\\u0CE6-\\u0CEF\\u0D02\\u0D03\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D3E-\\u0D43\\u0D46-\\u0D48\\u0D4A-\\u0D4D\\u0D57\\u0D60\\u0D61\\u0D66-\\u0D6F\\u0E01-\\u0E2E\\u0E30-\\u0E3A\\u0E40-\\u0E4E\\u0E50-\\u0E59\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD\\u0EAE\\u0EB0-\\u0EB9\\u0EBB-\\u0EBD\\u0EC0-\\u0EC4\\u0EC6\\u0EC8-\\u0ECD\\u0ED0-\\u0ED9\\u0F18\\u0F19\\u0F20-\\u0F29\\u0F35\\u0F37\\u0F39\\u0F3E-\\u0F47\\u0F49-\\u0F69\\u0F71-\\u0F84\\u0F86-\\u0F8B\\u0F90-\\u0F95\\u0F97\\u0F99-\\u0FAD\\u0FB1-\\u0FB7\\u0FB9\\u10A0-\\u10C5\\u10D0-\\u10F6\\u1100\\u1102\\u1103\\u1105-\\u1107\\u1109\\u110B\\u110C\\u110E-\\u1112\\u113C\\u113E\\u1140\\u114C\\u114E\\u1150\\u1154\\u1155\\u1159\\u115F-\\u1161\\u1163\\u1165\\u1167\\u1169\\u116D\\u116E\\u1172\\u1173\\u1175\\u119E\\u11A8\\u11AB\\u11AE\\u11AF\\u11B7\\u11B8\\u11BA\\u11BC-\\u11C2\\u11EB\\u11F0\\u11F9\\u1E00-\\u1E9B\\u1EA0-\\u1EF9\\u1F00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u20D0-\\u20DC\\u20E1\\u2126\\u212A\\u212B\\u212E\\u2180-\\u2182\\u3005\\u3007\\u3021-\\u302F\\u3031-\\u3035\\u3041-\\u3094\\u3099\\u309A\\u309D\\u309E\\u30A1-\\u30FA\\u30FC-\\u30FE\\u3105-\\u312C\\u4E00-\\u9FA5\\uAC00-\\uD7A3]*)[\\t\\n\\r ]*$"}],"fn":"matches","kind":"compute"},{"kind":"compare","left":{"args":[{"field":"kind","kind":"field"},{"field":"name","kind":"field"}],"field":"spelling","kind":"closedAt","relation":"VariableReference"},"op":"eq","right":{"kind":"literal","value":"bare"}}],"kind":"and"},{"args":[{"args":[{"field":"lexical","kind":"field"},{"kind":"literal","value":"^\\{(?:[A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u0131\\u0134-\\u013E\\u0141-\\u0148\\u014A-\\u017E\\u0180-\\u01C3\\u01CD-\\u01F0\\u01F4\\u01F5\\u01FA-\\u0217\\u0250-\\u02A8\\u02BB-\\u02C1\\u0386\\u0388-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03CE\\u03D0-\\u03D6\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2-\\u03F3\\u0401-\\u040C\\u040E-\\u044F\\u0451-\\u045C\\u045E-\\u0481\\u0490-\\u04C4\\u04C7\\u04C8\\u04CB\\u04CC\\u04D0-\\u04EB\\u04EE-\\u04F5\\u04F8\\u04F9\\u0531-\\u0556\\u0559\\u0561-\\u0586\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u063A\\u0641-\\u064A\\u0671-\\u06B7\\u06BA-\\u06BE\\u06C0-\\u06CE\\u06D0-\\u06D3\\u06D5\\u06E5\\u06E6\\u0905-\\u0939\\u093D\\u0958-\\u0961\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09DC\\u09DD\\u09DF-\\u09E1\\u09F0\\u09F1\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74\\u0A85-\\u0A8B\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AE0\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B36-\\u0B39\\u0B3D\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB5\\u0BB7-\\u0BB9\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C60\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CDE\\u0CE0\\u0CE1\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D60\\u0D61\\u0E01-\\u0E2E\\u0E30\\u0E32\\u0E33\\u0E40-\\u0E45\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD\\u0EAE\\u0EB0\\u0EB2\\u0EB3\\u0EBD\\u0EC0-\\u0EC4\\u0F40-\\u0F47\\u0F49-\\u0F69\\u10A0-\\u10C5\\u10D0-\\u10F6\\u1100\\u1102\\u1103\\u1105-\\u1107\\u1109\\u110B\\u110C\\u110E-\\u1112\\u113C\\u113E\\u1140\\u114C\\u114E\\u1150\\u1154\\u1155\\u1159\\u115F-\\u1161\\u1163\\u1165\\u1167\\u1169\\u116D\\u116E\\u1172\\u1173\\u1175\\u119E\\u11A8\\u11AB\\u11AE\\u11AF\\u11B7\\u11B8\\u11BA\\u11BC-\\u11C2\\u11EB\\u11F0\\u11F9\\u1E00-\\u1E9B\\u1EA0-\\u1EF9\\u1F00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u2126\\u212A\\u212B\\u212E\\u2180-\\u2182\\u3007\\u3021-\\u3029\\u3041-\\u3094\\u30A1-\\u30FA\\u3105-\\u312C\\u4E00-\\u9FA5\\uAC00-\\uD7A3][\\-.0-9A-Z_a-z\\u00B7\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u0131\\u0134-\\u013E\\u0141-\\u0148\\u014A-\\u017E\\u0180-\\u01C3\\u01CD-\\u01F0\\u01F4\\u01F5\\u01FA-\\u0217\\u0250-\\u02A8\\u02BB-\\u02C1\\u02D0\\u02D1\\u0300-\\u0345\\u0360\\u0361\\u0386-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03CE\\u03D0-\\u03D6\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2-\\u03F3\\u0401-\\u040C\\u040E-\\u044F\\u0451-\\u045C\\u045E-\\u0481\\u0483-\\u0486\\u0490-\\u04C4\\u04C7\\u04C8\\u04CB\\u04CC\\u04D0-\\u04EB\\u04EE-\\u04F5\\u04F8\\u04F9\\u0531-\\u0556\\u0559\\u0561-\\u0586\\u0591-\\u05A1\\u05A3-\\u05B9\\u05BB-\\u05BD\\u05BF\\u05C1\\u05C2\\u05C4\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u063A\\u0640-\\u0652\\u0660-\\u0669\\u0670-\\u06B7\\u06BA-\\u06BE\\u06C0-\\u06CE\\u06D0-\\u06D3\\u06D5-\\u06E8\\u06EA-\\u06ED\\u06F0-\\u06F9\\u0901-\\u0903\\u0905-\\u0939\\u093C-\\u094D\\u0951-\\u0954\\u0958-\\u0963\\u0966-\\u096F\\u0981-\\u0983\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BC\\u09BE-\\u09C4\\u09C7\\u09C8\\u09CB-\\u09CD\\u09D7\\u09DC\\u09DD\\u09DF-\\u09E3\\u09E6-\\u09F1\\u0A02\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A3C\\u0A3E-\\u0A42\\u0A47\\u0A48\\u0A4B-\\u0A4D\\u0A59-\\u0A5C\\u0A5E\\u0A66-\\u0A74\\u0A81-\\u0A83\\u0A85-\\u0A8B\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABC-\\u0AC5\\u0AC7-\\u0AC9\\u0ACB-\\u0ACD\\u0AE0\\u0AE6-\\u0AEF\\u0B01-\\u0B03\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B36-\\u0B39\\u0B3C-\\u0B43\\u0B47\\u0B48\\u0B4B-\\u0B4D\\u0B56\\u0B57\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B66-\\u0B6F\\u0B82\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB5\\u0BB7-\\u0BB9\\u0BBE-\\u0BC2\\u0BC6-\\u0BC8\\u0BCA-\\u0BCD\\u0BD7\\u0BE7-\\u0BEF\\u0C01-\\u0C03\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3E-\\u0C44\\u0C46-\\u0C48\\u0C4A-\\u0C4D\\u0C55\\u0C56\\u0C60\\u0C61\\u0C66-\\u0C6F\\u0C82\\u0C83\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBE-\\u0CC4\\u0CC6-\\u0CC8\\u0CCA-\\u0CCD\\u0CD5\\u0CD6\\u0CDE\\u0CE0\\u0CE1\\u0CE6-\\u0CEF\\u0D02\\u0D03\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D3E-\\u0D43\\u0D46-\\u0D48\\u0D4A-\\u0D4D\\u0D57\\u0D60\\u0D61\\u0D66-\\u0D6F\\u0E01-\\u0E2E\\u0E30-\\u0E3A\\u0E40-\\u0E4E\\u0E50-\\u0E59\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD\\u0EAE\\u0EB0-\\u0EB9\\u0EBB-\\u0EBD\\u0EC0-\\u0EC4\\u0EC6\\u0EC8-\\u0ECD\\u0ED0-\\u0ED9\\u0F18\\u0F19\\u0F20-\\u0F29\\u0F35\\u0F37\\u0F39\\u0F3E-\\u0F47\\u0F49-\\u0F69\\u0F71-\\u0F84\\u0F86-\\u0F8B\\u0F90-\\u0F95\\u0F97\\u0F99-\\u0FAD\\u0FB1-\\u0FB7\\u0FB9\\u10A0-\\u10C5\\u10D0-\\u10F6\\u1100\\u1102\\u1103\\u1105-\\u1107\\u1109\\u110B\\u110C\\u110E-\\u1112\\u113C\\u113E\\u1140\\u114C\\u114E\\u1150\\u1154\\u1155\\u1159\\u115F-\\u1161\\u1163\\u1165\\u1167\\u1169\\u116D\\u116E\\u1172\\u1173\\u1175\\u119E\\u11A8\\u11AB\\u11AE\\u11AF\\u11B7\\u11B8\\u11BA\\u11BC-\\u11C2\\u11EB\\u11F0\\u11F9\\u1E00-\\u1E9B\\u1EA0-\\u1EF9\\u1F00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u20D0-\\u20DC\\u20E1\\u2126\\u212A\\u212B\\u212E\\u2180-\\u2182\\u3005\\u3007\\u3021-\\u302F\\u3031-\\u3035\\u3041-\\u3094\\u3099\\u309A\\u309D\\u309E\\u30A1-\\u30FA\\u30FC-\\u30FE\\u3105-\\u312C\\u4E00-\\u9FA5\\uAC00-\\uD7A3]*)\\}$"}],"fn":"matches","kind":"compute"},{"kind":"compare","left":{"args":[{"field":"kind","kind":"field"},{"field":"name","kind":"field"}],"field":"spelling","kind":"closedAt","relation":"VariableReference"},"op":"eq","right":{"kind":"literal","value":"braced"}}],"kind":"and"}],"kind":"or"} and {"kind":"compare","left":{"args":[{"args":[{"field":"name","kind":"field"}],"fn":"singleton","kind":"compute"},{"args":[{"field":"kind","kind":"field"}],"kind":"closedRow","relation":"VariableReference"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}}, path where {"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-any-n","qti-correct","qti-default","qti-equal-rounded","qti-index","qti-lookup-outcome-value","qti-map-response","qti-map-response-point","qti-pattern-match","qti-random-float","qti-random-integer","qti-repeat","qti-round-to","qti-set-correct-response","qti-set-default-value","qti-set-outcome-value","qti-set-template-value","qti-variable"]} and {"args":[{"args":[{"args":[{"arg":{"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-random-float"]},"kind":"not"},{"arg":{"args":[{"field":"lexical","kind":"field"},{"kind":"literal","value":"^[\\t\\n\\r ]*(?:INF|NaN)[\\t\\n\\r ]*$"}],"fn":"matches","kind":"compute"},"kind":"not"}],"kind":"or"},{"args":[{"field":"lexical","kind":"field"},{"kind":"literal","value":"^[\\t\\n\\r ]*(?:[A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u0131\\u0134-\\u013E\\u0141-\\u0148\\u014A-\\u017E\\u0180-\\u01C3\\u01CD-\\u01F0\\u01F4\\u01F5\\u01FA-\\u0217\\u0250-\\u02A8\\u02BB-\\u02C1\\u0386\\u0388-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03CE\\u03D0-\\u03D6\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2-\\u03F3\\u0401-\\u040C\\u040E-\\u044F\\u0451-\\u045C\\u045E-\\u0481\\u0490-\\u04C4\\u04C7\\u04C8\\u04CB\\u04CC\\u04D0-\\u04EB\\u04EE-\\u04F5\\u04F8\\u04F9\\u0531-\\u0556\\u0559\\u0561-\\u0586\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u063A\\u0641-\\u064A\\u0671-\\u06B7\\u06BA-\\u06BE\\u06C0-\\u06CE\\u06D0-\\u06D3\\u06D5\\u06E5\\u06E6\\u0905-\\u0939\\u093D\\u0958-\\u0961\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09DC\\u09DD\\u09DF-\\u09E1\\u09F0\\u09F1\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74\\u0A85-\\u0A8B\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AE0\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B36-\\u0B39\\u0B3D\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB5\\u0BB7-\\u0BB9\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C60\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CDE\\u0CE0\\u0CE1\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D60\\u0D61\\u0E01-\\u0E2E\\u0E30\\u0E32\\u0E33\\u0E40-\\u0E45\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD\\u0EAE\\u0EB0\\u0EB2\\u0EB3\\u0EBD\\u0EC0-\\u0EC4\\u0F40-\\u0F47\\u0F49-\\u0F69\\u10A0-\\u10C5\\u10D0-\\u10F6\\u1100\\u1102\\u1103\\u1105-\\u1107\\u1109\\u110B\\u110C\\u110E-\\u1112\\u113C\\u113E\\u1140\\u114C\\u114E\\u1150\\u1154\\u1155\\u1159\\u115F-\\u1161\\u1163\\u1165\\u1167\\u1169\\u116D\\u116E\\u1172\\u1173\\u1175\\u119E\\u11A8\\u11AB\\u11AE\\u11AF\\u11B7\\u11B8\\u11BA\\u11BC-\\u11C2\\u11EB\\u11F0\\u11F9\\u1E00-\\u1E9B\\u1EA0-\\u1EF9\\u1F00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u2126\\u212A\\u212B\\u212E\\u2180-\\u2182\\u3007\\u3021-\\u3029\\u3041-\\u3094\\u30A1-\\u30FA\\u3105-\\u312C\\u4E00-\\u9FA5\\uAC00-\\uD7A3][\\-.0-9A-Z_a-z\\u00B7\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u0131\\u0134-\\u013E\\u0141-\\u0148\\u014A-\\u017E\\u0180-\\u01C3\\u01CD-\\u01F0\\u01F4\\u01F5\\u01FA-\\u0217\\u0250-\\u02A8\\u02BB-\\u02C1\\u02D0\\u02D1\\u0300-\\u0345\\u0360\\u0361\\u0386-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03CE\\u03D0-\\u03D6\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2-\\u03F3\\u0401-\\u040C\\u040E-\\u044F\\u0451-\\u045C\\u045E-\\u0481\\u0483-\\u0486\\u0490-\\u04C4\\u04C7\\u04C8\\u04CB\\u04CC\\u04D0-\\u04EB\\u04EE-\\u04F5\\u04F8\\u04F9\\u0531-\\u0556\\u0559\\u0561-\\u0586\\u0591-\\u05A1\\u05A3-\\u05B9\\u05BB-\\u05BD\\u05BF\\u05C1\\u05C2\\u05C4\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u063A\\u0640-\\u0652\\u0660-\\u0669\\u0670-\\u06B7\\u06BA-\\u06BE\\u06C0-\\u06CE\\u06D0-\\u06D3\\u06D5-\\u06E8\\u06EA-\\u06ED\\u06F0-\\u06F9\\u0901-\\u0903\\u0905-\\u0939\\u093C-\\u094D\\u0951-\\u0954\\u0958-\\u0963\\u0966-\\u096F\\u0981-\\u0983\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BC\\u09BE-\\u09C4\\u09C7\\u09C8\\u09CB-\\u09CD\\u09D7\\u09DC\\u09DD\\u09DF-\\u09E3\\u09E6-\\u09F1\\u0A02\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A3C\\u0A3E-\\u0A42\\u0A47\\u0A48\\u0A4B-\\u0A4D\\u0A59-\\u0A5C\\u0A5E\\u0A66-\\u0A74\\u0A81-\\u0A83\\u0A85-\\u0A8B\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABC-\\u0AC5\\u0AC7-\\u0AC9\\u0ACB-\\u0ACD\\u0AE0\\u0AE6-\\u0AEF\\u0B01-\\u0B03\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B36-\\u0B39\\u0B3C-\\u0B43\\u0B47\\u0B48\\u0B4B-\\u0B4D\\u0B56\\u0B57\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B66-\\u0B6F\\u0B82\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB5\\u0BB7-\\u0BB9\\u0BBE-\\u0BC2\\u0BC6-\\u0BC8\\u0BCA-\\u0BCD\\u0BD7\\u0BE7-\\u0BEF\\u0C01-\\u0C03\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3E-\\u0C44\\u0C46-\\u0C48\\u0C4A-\\u0C4D\\u0C55\\u0C56\\u0C60\\u0C61\\u0C66-\\u0C6F\\u0C82\\u0C83\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBE-\\u0CC4\\u0CC6-\\u0CC8\\u0CCA-\\u0CCD\\u0CD5\\u0CD6\\u0CDE\\u0CE0\\u0CE1\\u0CE6-\\u0CEF\\u0D02\\u0D03\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D3E-\\u0D43\\u0D46-\\u0D48\\u0D4A-\\u0D4D\\u0D57\\u0D60\\u0D61\\u0D66-\\u0D6F\\u0E01-\\u0E2E\\u0E30-\\u0E3A\\u0E40-\\u0E4E\\u0E50-\\u0E59\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD\\u0EAE\\u0EB0-\\u0EB9\\u0EBB-\\u0EBD\\u0EC0-\\u0EC4\\u0EC6\\u0EC8-\\u0ECD\\u0ED0-\\u0ED9\\u0F18\\u0F19\\u0F20-\\u0F29\\u0F35\\u0F37\\u0F39\\u0F3E-\\u0F47\\u0F49-\\u0F69\\u0F71-\\u0F84\\u0F86-\\u0F8B\\u0F90-\\u0F95\\u0F97\\u0F99-\\u0FAD\\u0FB1-\\u0FB7\\u0FB9\\u10A0-\\u10C5\\u10D0-\\u10F6\\u1100\\u1102\\u1103\\u1105-\\u1107\\u1109\\u110B\\u110C\\u110E-\\u1112\\u113C\\u113E\\u1140\\u114C\\u114E\\u1150\\u1154\\u1155\\u1159\\u115F-\\u1161\\u1163\\u1165\\u1167\\u1169\\u116D\\u116E\\u1172\\u1173\\u1175\\u119E\\u11A8\\u11AB\\u11AE\\u11AF\\u11B7\\u11B8\\u11BA\\u11BC-\\u11C2\\u11EB\\u11F0\\u11F9\\u1E00-\\u1E9B\\u1EA0-\\u1EF9\\u1F00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u20D0-\\u20DC\\u20E1\\u2126\\u212A\\u212B\\u212E\\u2180-\\u2182\\u3005\\u3007\\u3021-\\u302F\\u3031-\\u3035\\u3041-\\u3094\\u3099\\u309A\\u309D\\u309E\\u30A1-\\u30FA\\u30FC-\\u30FE\\u3105-\\u312C\\u4E00-\\u9FA5\\uAC00-\\uD7A3]*)[\\t\\n\\r ]*$"}],"fn":"matches","kind":"compute"},{"kind":"compare","left":{"args":[{"field":"kind","kind":"field"},{"field":"name","kind":"field"}],"field":"spelling","kind":"closedAt","relation":"VariableReference"},"op":"eq","right":{"kind":"literal","value":"bare"}}],"kind":"and"},{"args":[{"args":[{"field":"lexical","kind":"field"},{"kind":"literal","value":"^\\{(?:[A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u0131\\u0134-\\u013E\\u0141-\\u0148\\u014A-\\u017E\\u0180-\\u01C3\\u01CD-\\u01F0\\u01F4\\u01F5\\u01FA-\\u0217\\u0250-\\u02A8\\u02BB-\\u02C1\\u0386\\u0388-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03CE\\u03D0-\\u03D6\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2-\\u03F3\\u0401-\\u040C\\u040E-\\u044F\\u0451-\\u045C\\u045E-\\u0481\\u0490-\\u04C4\\u04C7\\u04C8\\u04CB\\u04CC\\u04D0-\\u04EB\\u04EE-\\u04F5\\u04F8\\u04F9\\u0531-\\u0556\\u0559\\u0561-\\u0586\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u063A\\u0641-\\u064A\\u0671-\\u06B7\\u06BA-\\u06BE\\u06C0-\\u06CE\\u06D0-\\u06D3\\u06D5\\u06E5\\u06E6\\u0905-\\u0939\\u093D\\u0958-\\u0961\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09DC\\u09DD\\u09DF-\\u09E1\\u09F0\\u09F1\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74\\u0A85-\\u0A8B\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AE0\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B36-\\u0B39\\u0B3D\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB5\\u0BB7-\\u0BB9\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C60\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CDE\\u0CE0\\u0CE1\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D60\\u0D61\\u0E01-\\u0E2E\\u0E30\\u0E32\\u0E33\\u0E40-\\u0E45\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD\\u0EAE\\u0EB0\\u0EB2\\u0EB3\\u0EBD\\u0EC0-\\u0EC4\\u0F40-\\u0F47\\u0F49-\\u0F69\\u10A0-\\u10C5\\u10D0-\\u10F6\\u1100\\u1102\\u1103\\u1105-\\u1107\\u1109\\u110B\\u110C\\u110E-\\u1112\\u113C\\u113E\\u1140\\u114C\\u114E\\u1150\\u1154\\u1155\\u1159\\u115F-\\u1161\\u1163\\u1165\\u1167\\u1169\\u116D\\u116E\\u1172\\u1173\\u1175\\u119E\\u11A8\\u11AB\\u11AE\\u11AF\\u11B7\\u11B8\\u11BA\\u11BC-\\u11C2\\u11EB\\u11F0\\u11F9\\u1E00-\\u1E9B\\u1EA0-\\u1EF9\\u1F00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u2126\\u212A\\u212B\\u212E\\u2180-\\u2182\\u3007\\u3021-\\u3029\\u3041-\\u3094\\u30A1-\\u30FA\\u3105-\\u312C\\u4E00-\\u9FA5\\uAC00-\\uD7A3][\\-.0-9A-Z_a-z\\u00B7\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u0131\\u0134-\\u013E\\u0141-\\u0148\\u014A-\\u017E\\u0180-\\u01C3\\u01CD-\\u01F0\\u01F4\\u01F5\\u01FA-\\u0217\\u0250-\\u02A8\\u02BB-\\u02C1\\u02D0\\u02D1\\u0300-\\u0345\\u0360\\u0361\\u0386-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03CE\\u03D0-\\u03D6\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2-\\u03F3\\u0401-\\u040C\\u040E-\\u044F\\u0451-\\u045C\\u045E-\\u0481\\u0483-\\u0486\\u0490-\\u04C4\\u04C7\\u04C8\\u04CB\\u04CC\\u04D0-\\u04EB\\u04EE-\\u04F5\\u04F8\\u04F9\\u0531-\\u0556\\u0559\\u0561-\\u0586\\u0591-\\u05A1\\u05A3-\\u05B9\\u05BB-\\u05BD\\u05BF\\u05C1\\u05C2\\u05C4\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u063A\\u0640-\\u0652\\u0660-\\u0669\\u0670-\\u06B7\\u06BA-\\u06BE\\u06C0-\\u06CE\\u06D0-\\u06D3\\u06D5-\\u06E8\\u06EA-\\u06ED\\u06F0-\\u06F9\\u0901-\\u0903\\u0905-\\u0939\\u093C-\\u094D\\u0951-\\u0954\\u0958-\\u0963\\u0966-\\u096F\\u0981-\\u0983\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BC\\u09BE-\\u09C4\\u09C7\\u09C8\\u09CB-\\u09CD\\u09D7\\u09DC\\u09DD\\u09DF-\\u09E3\\u09E6-\\u09F1\\u0A02\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A3C\\u0A3E-\\u0A42\\u0A47\\u0A48\\u0A4B-\\u0A4D\\u0A59-\\u0A5C\\u0A5E\\u0A66-\\u0A74\\u0A81-\\u0A83\\u0A85-\\u0A8B\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABC-\\u0AC5\\u0AC7-\\u0AC9\\u0ACB-\\u0ACD\\u0AE0\\u0AE6-\\u0AEF\\u0B01-\\u0B03\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B36-\\u0B39\\u0B3C-\\u0B43\\u0B47\\u0B48\\u0B4B-\\u0B4D\\u0B56\\u0B57\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B66-\\u0B6F\\u0B82\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB5\\u0BB7-\\u0BB9\\u0BBE-\\u0BC2\\u0BC6-\\u0BC8\\u0BCA-\\u0BCD\\u0BD7\\u0BE7-\\u0BEF\\u0C01-\\u0C03\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3E-\\u0C44\\u0C46-\\u0C48\\u0C4A-\\u0C4D\\u0C55\\u0C56\\u0C60\\u0C61\\u0C66-\\u0C6F\\u0C82\\u0C83\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBE-\\u0CC4\\u0CC6-\\u0CC8\\u0CCA-\\u0CCD\\u0CD5\\u0CD6\\u0CDE\\u0CE0\\u0CE1\\u0CE6-\\u0CEF\\u0D02\\u0D03\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D3E-\\u0D43\\u0D46-\\u0D48\\u0D4A-\\u0D4D\\u0D57\\u0D60\\u0D61\\u0D66-\\u0D6F\\u0E01-\\u0E2E\\u0E30-\\u0E3A\\u0E40-\\u0E4E\\u0E50-\\u0E59\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD\\u0EAE\\u0EB0-\\u0EB9\\u0EBB-\\u0EBD\\u0EC0-\\u0EC4\\u0EC6\\u0EC8-\\u0ECD\\u0ED0-\\u0ED9\\u0F18\\u0F19\\u0F20-\\u0F29\\u0F35\\u0F37\\u0F39\\u0F3E-\\u0F47\\u0F49-\\u0F69\\u0F71-\\u0F84\\u0F86-\\u0F8B\\u0F90-\\u0F95\\u0F97\\u0F99-\\u0FAD\\u0FB1-\\u0FB7\\u0FB9\\u10A0-\\u10C5\\u10D0-\\u10F6\\u1100\\u1102\\u1103\\u1105-\\u1107\\u1109\\u110B\\u110C\\u110E-\\u1112\\u113C\\u113E\\u1140\\u114C\\u114E\\u1150\\u1154\\u1155\\u1159\\u115F-\\u1161\\u1163\\u1165\\u1167\\u1169\\u116D\\u116E\\u1172\\u1173\\u1175\\u119E\\u11A8\\u11AB\\u11AE\\u11AF\\u11B7\\u11B8\\u11BA\\u11BC-\\u11C2\\u11EB\\u11F0\\u11F9\\u1E00-\\u1E9B\\u1EA0-\\u1EF9\\u1F00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u20D0-\\u20DC\\u20E1\\u2126\\u212A\\u212B\\u212E\\u2180-\\u2182\\u3005\\u3007\\u3021-\\u302F\\u3031-\\u3035\\u3041-\\u3094\\u3099\\u309A\\u309D\\u309E\\u30A1-\\u30FA\\u30FC-\\u30FE\\u3105-\\u312C\\u4E00-\\u9FA5\\uAC00-\\uD7A3]*)\\}$"}],"fn":"matches","kind":"compute"},{"kind":"compare","left":{"args":[{"field":"kind","kind":"field"},{"field":"name","kind":"field"}],"field":"spelling","kind":"closedAt","relation":"VariableReference"},"op":"eq","right":{"kind":"literal","value":"braced"}}],"kind":"and"}],"kind":"or"} and {"kind":"compare","left":{"args":[{"args":[{"field":"name","kind":"field"}],"fn":"singleton","kind":"compute"},{"args":[{"field":"kind","kind":"field"}],"kind":"closedRow","relation":"VariableReference"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}}, start where {"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-any-n","qti-correct","qti-default","qti-equal-rounded","qti-index","qti-lookup-outcome-value","qti-map-response","qti-map-response-point","qti-pattern-match","qti-random-float","qti-random-integer","qti-repeat","qti-round-to","qti-set-correct-response","qti-set-default-value","qti-set-outcome-value","qti-set-template-value","qti-variable"]} and {"args":[{"args":[{"args":[{"arg":{"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-random-float"]},"kind":"not"},{"arg":{"args":[{"field":"lexical","kind":"field"},{"kind":"literal","value":"^[\\t\\n\\r ]*(?:INF|NaN)[\\t\\n\\r ]*$"}],"fn":"matches","kind":"compute"},"kind":"not"}],"kind":"or"},{"args":[{"field":"lexical","kind":"field"},{"kind":"literal","value":"^[\\t\\n\\r ]*(?:[A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u0131\\u0134-\\u013E\\u0141-\\u0148\\u014A-\\u017E\\u0180-\\u01C3\\u01CD-\\u01F0\\u01F4\\u01F5\\u01FA-\\u0217\\u0250-\\u02A8\\u02BB-\\u02C1\\u0386\\u0388-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03CE\\u03D0-\\u03D6\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2-\\u03F3\\u0401-\\u040C\\u040E-\\u044F\\u0451-\\u045C\\u045E-\\u0481\\u0490-\\u04C4\\u04C7\\u04C8\\u04CB\\u04CC\\u04D0-\\u04EB\\u04EE-\\u04F5\\u04F8\\u04F9\\u0531-\\u0556\\u0559\\u0561-\\u0586\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u063A\\u0641-\\u064A\\u0671-\\u06B7\\u06BA-\\u06BE\\u06C0-\\u06CE\\u06D0-\\u06D3\\u06D5\\u06E5\\u06E6\\u0905-\\u0939\\u093D\\u0958-\\u0961\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09DC\\u09DD\\u09DF-\\u09E1\\u09F0\\u09F1\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74\\u0A85-\\u0A8B\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AE0\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B36-\\u0B39\\u0B3D\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB5\\u0BB7-\\u0BB9\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C60\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CDE\\u0CE0\\u0CE1\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D60\\u0D61\\u0E01-\\u0E2E\\u0E30\\u0E32\\u0E33\\u0E40-\\u0E45\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD\\u0EAE\\u0EB0\\u0EB2\\u0EB3\\u0EBD\\u0EC0-\\u0EC4\\u0F40-\\u0F47\\u0F49-\\u0F69\\u10A0-\\u10C5\\u10D0-\\u10F6\\u1100\\u1102\\u1103\\u1105-\\u1107\\u1109\\u110B\\u110C\\u110E-\\u1112\\u113C\\u113E\\u1140\\u114C\\u114E\\u1150\\u1154\\u1155\\u1159\\u115F-\\u1161\\u1163\\u1165\\u1167\\u1169\\u116D\\u116E\\u1172\\u1173\\u1175\\u119E\\u11A8\\u11AB\\u11AE\\u11AF\\u11B7\\u11B8\\u11BA\\u11BC-\\u11C2\\u11EB\\u11F0\\u11F9\\u1E00-\\u1E9B\\u1EA0-\\u1EF9\\u1F00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u2126\\u212A\\u212B\\u212E\\u2180-\\u2182\\u3007\\u3021-\\u3029\\u3041-\\u3094\\u30A1-\\u30FA\\u3105-\\u312C\\u4E00-\\u9FA5\\uAC00-\\uD7A3][\\-.0-9A-Z_a-z\\u00B7\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u0131\\u0134-\\u013E\\u0141-\\u0148\\u014A-\\u017E\\u0180-\\u01C3\\u01CD-\\u01F0\\u01F4\\u01F5\\u01FA-\\u0217\\u0250-\\u02A8\\u02BB-\\u02C1\\u02D0\\u02D1\\u0300-\\u0345\\u0360\\u0361\\u0386-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03CE\\u03D0-\\u03D6\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2-\\u03F3\\u0401-\\u040C\\u040E-\\u044F\\u0451-\\u045C\\u045E-\\u0481\\u0483-\\u0486\\u0490-\\u04C4\\u04C7\\u04C8\\u04CB\\u04CC\\u04D0-\\u04EB\\u04EE-\\u04F5\\u04F8\\u04F9\\u0531-\\u0556\\u0559\\u0561-\\u0586\\u0591-\\u05A1\\u05A3-\\u05B9\\u05BB-\\u05BD\\u05BF\\u05C1\\u05C2\\u05C4\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u063A\\u0640-\\u0652\\u0660-\\u0669\\u0670-\\u06B7\\u06BA-\\u06BE\\u06C0-\\u06CE\\u06D0-\\u06D3\\u06D5-\\u06E8\\u06EA-\\u06ED\\u06F0-\\u06F9\\u0901-\\u0903\\u0905-\\u0939\\u093C-\\u094D\\u0951-\\u0954\\u0958-\\u0963\\u0966-\\u096F\\u0981-\\u0983\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BC\\u09BE-\\u09C4\\u09C7\\u09C8\\u09CB-\\u09CD\\u09D7\\u09DC\\u09DD\\u09DF-\\u09E3\\u09E6-\\u09F1\\u0A02\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A3C\\u0A3E-\\u0A42\\u0A47\\u0A48\\u0A4B-\\u0A4D\\u0A59-\\u0A5C\\u0A5E\\u0A66-\\u0A74\\u0A81-\\u0A83\\u0A85-\\u0A8B\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABC-\\u0AC5\\u0AC7-\\u0AC9\\u0ACB-\\u0ACD\\u0AE0\\u0AE6-\\u0AEF\\u0B01-\\u0B03\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B36-\\u0B39\\u0B3C-\\u0B43\\u0B47\\u0B48\\u0B4B-\\u0B4D\\u0B56\\u0B57\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B66-\\u0B6F\\u0B82\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB5\\u0BB7-\\u0BB9\\u0BBE-\\u0BC2\\u0BC6-\\u0BC8\\u0BCA-\\u0BCD\\u0BD7\\u0BE7-\\u0BEF\\u0C01-\\u0C03\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3E-\\u0C44\\u0C46-\\u0C48\\u0C4A-\\u0C4D\\u0C55\\u0C56\\u0C60\\u0C61\\u0C66-\\u0C6F\\u0C82\\u0C83\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBE-\\u0CC4\\u0CC6-\\u0CC8\\u0CCA-\\u0CCD\\u0CD5\\u0CD6\\u0CDE\\u0CE0\\u0CE1\\u0CE6-\\u0CEF\\u0D02\\u0D03\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D3E-\\u0D43\\u0D46-\\u0D48\\u0D4A-\\u0D4D\\u0D57\\u0D60\\u0D61\\u0D66-\\u0D6F\\u0E01-\\u0E2E\\u0E30-\\u0E3A\\u0E40-\\u0E4E\\u0E50-\\u0E59\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD\\u0EAE\\u0EB0-\\u0EB9\\u0EBB-\\u0EBD\\u0EC0-\\u0EC4\\u0EC6\\u0EC8-\\u0ECD\\u0ED0-\\u0ED9\\u0F18\\u0F19\\u0F20-\\u0F29\\u0F35\\u0F37\\u0F39\\u0F3E-\\u0F47\\u0F49-\\u0F69\\u0F71-\\u0F84\\u0F86-\\u0F8B\\u0F90-\\u0F95\\u0F97\\u0F99-\\u0FAD\\u0FB1-\\u0FB7\\u0FB9\\u10A0-\\u10C5\\u10D0-\\u10F6\\u1100\\u1102\\u1103\\u1105-\\u1107\\u1109\\u110B\\u110C\\u110E-\\u1112\\u113C\\u113E\\u1140\\u114C\\u114E\\u1150\\u1154\\u1155\\u1159\\u115F-\\u1161\\u1163\\u1165\\u1167\\u1169\\u116D\\u116E\\u1172\\u1173\\u1175\\u119E\\u11A8\\u11AB\\u11AE\\u11AF\\u11B7\\u11B8\\u11BA\\u11BC-\\u11C2\\u11EB\\u11F0\\u11F9\\u1E00-\\u1E9B\\u1EA0-\\u1EF9\\u1F00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u20D0-\\u20DC\\u20E1\\u2126\\u212A\\u212B\\u212E\\u2180-\\u2182\\u3005\\u3007\\u3021-\\u302F\\u3031-\\u3035\\u3041-\\u3094\\u3099\\u309A\\u309D\\u309E\\u30A1-\\u30FA\\u30FC-\\u30FE\\u3105-\\u312C\\u4E00-\\u9FA5\\uAC00-\\uD7A3]*)[\\t\\n\\r ]*$"}],"fn":"matches","kind":"compute"},{"kind":"compare","left":{"args":[{"field":"kind","kind":"field"},{"field":"name","kind":"field"}],"field":"spelling","kind":"closedAt","relation":"VariableReference"},"op":"eq","right":{"kind":"literal","value":"bare"}}],"kind":"and"},{"args":[{"args":[{"field":"lexical","kind":"field"},{"kind":"literal","value":"^\\{(?:[A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u0131\\u0134-\\u013E\\u0141-\\u0148\\u014A-\\u017E\\u0180-\\u01C3\\u01CD-\\u01F0\\u01F4\\u01F5\\u01FA-\\u0217\\u0250-\\u02A8\\u02BB-\\u02C1\\u0386\\u0388-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03CE\\u03D0-\\u03D6\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2-\\u03F3\\u0401-\\u040C\\u040E-\\u044F\\u0451-\\u045C\\u045E-\\u0481\\u0490-\\u04C4\\u04C7\\u04C8\\u04CB\\u04CC\\u04D0-\\u04EB\\u04EE-\\u04F5\\u04F8\\u04F9\\u0531-\\u0556\\u0559\\u0561-\\u0586\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u063A\\u0641-\\u064A\\u0671-\\u06B7\\u06BA-\\u06BE\\u06C0-\\u06CE\\u06D0-\\u06D3\\u06D5\\u06E5\\u06E6\\u0905-\\u0939\\u093D\\u0958-\\u0961\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09DC\\u09DD\\u09DF-\\u09E1\\u09F0\\u09F1\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74\\u0A85-\\u0A8B\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AE0\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B36-\\u0B39\\u0B3D\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB5\\u0BB7-\\u0BB9\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C60\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CDE\\u0CE0\\u0CE1\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D60\\u0D61\\u0E01-\\u0E2E\\u0E30\\u0E32\\u0E33\\u0E40-\\u0E45\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD\\u0EAE\\u0EB0\\u0EB2\\u0EB3\\u0EBD\\u0EC0-\\u0EC4\\u0F40-\\u0F47\\u0F49-\\u0F69\\u10A0-\\u10C5\\u10D0-\\u10F6\\u1100\\u1102\\u1103\\u1105-\\u1107\\u1109\\u110B\\u110C\\u110E-\\u1112\\u113C\\u113E\\u1140\\u114C\\u114E\\u1150\\u1154\\u1155\\u1159\\u115F-\\u1161\\u1163\\u1165\\u1167\\u1169\\u116D\\u116E\\u1172\\u1173\\u1175\\u119E\\u11A8\\u11AB\\u11AE\\u11AF\\u11B7\\u11B8\\u11BA\\u11BC-\\u11C2\\u11EB\\u11F0\\u11F9\\u1E00-\\u1E9B\\u1EA0-\\u1EF9\\u1F00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u2126\\u212A\\u212B\\u212E\\u2180-\\u2182\\u3007\\u3021-\\u3029\\u3041-\\u3094\\u30A1-\\u30FA\\u3105-\\u312C\\u4E00-\\u9FA5\\uAC00-\\uD7A3][\\-.0-9A-Z_a-z\\u00B7\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u0131\\u0134-\\u013E\\u0141-\\u0148\\u014A-\\u017E\\u0180-\\u01C3\\u01CD-\\u01F0\\u01F4\\u01F5\\u01FA-\\u0217\\u0250-\\u02A8\\u02BB-\\u02C1\\u02D0\\u02D1\\u0300-\\u0345\\u0360\\u0361\\u0386-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03CE\\u03D0-\\u03D6\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2-\\u03F3\\u0401-\\u040C\\u040E-\\u044F\\u0451-\\u045C\\u045E-\\u0481\\u0483-\\u0486\\u0490-\\u04C4\\u04C7\\u04C8\\u04CB\\u04CC\\u04D0-\\u04EB\\u04EE-\\u04F5\\u04F8\\u04F9\\u0531-\\u0556\\u0559\\u0561-\\u0586\\u0591-\\u05A1\\u05A3-\\u05B9\\u05BB-\\u05BD\\u05BF\\u05C1\\u05C2\\u05C4\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u063A\\u0640-\\u0652\\u0660-\\u0669\\u0670-\\u06B7\\u06BA-\\u06BE\\u06C0-\\u06CE\\u06D0-\\u06D3\\u06D5-\\u06E8\\u06EA-\\u06ED\\u06F0-\\u06F9\\u0901-\\u0903\\u0905-\\u0939\\u093C-\\u094D\\u0951-\\u0954\\u0958-\\u0963\\u0966-\\u096F\\u0981-\\u0983\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BC\\u09BE-\\u09C4\\u09C7\\u09C8\\u09CB-\\u09CD\\u09D7\\u09DC\\u09DD\\u09DF-\\u09E3\\u09E6-\\u09F1\\u0A02\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A3C\\u0A3E-\\u0A42\\u0A47\\u0A48\\u0A4B-\\u0A4D\\u0A59-\\u0A5C\\u0A5E\\u0A66-\\u0A74\\u0A81-\\u0A83\\u0A85-\\u0A8B\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABC-\\u0AC5\\u0AC7-\\u0AC9\\u0ACB-\\u0ACD\\u0AE0\\u0AE6-\\u0AEF\\u0B01-\\u0B03\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B36-\\u0B39\\u0B3C-\\u0B43\\u0B47\\u0B48\\u0B4B-\\u0B4D\\u0B56\\u0B57\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B66-\\u0B6F\\u0B82\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB5\\u0BB7-\\u0BB9\\u0BBE-\\u0BC2\\u0BC6-\\u0BC8\\u0BCA-\\u0BCD\\u0BD7\\u0BE7-\\u0BEF\\u0C01-\\u0C03\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3E-\\u0C44\\u0C46-\\u0C48\\u0C4A-\\u0C4D\\u0C55\\u0C56\\u0C60\\u0C61\\u0C66-\\u0C6F\\u0C82\\u0C83\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBE-\\u0CC4\\u0CC6-\\u0CC8\\u0CCA-\\u0CCD\\u0CD5\\u0CD6\\u0CDE\\u0CE0\\u0CE1\\u0CE6-\\u0CEF\\u0D02\\u0D03\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D3E-\\u0D43\\u0D46-\\u0D48\\u0D4A-\\u0D4D\\u0D57\\u0D60\\u0D61\\u0D66-\\u0D6F\\u0E01-\\u0E2E\\u0E30-\\u0E3A\\u0E40-\\u0E4E\\u0E50-\\u0E59\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD\\u0EAE\\u0EB0-\\u0EB9\\u0EBB-\\u0EBD\\u0EC0-\\u0EC4\\u0EC6\\u0EC8-\\u0ECD\\u0ED0-\\u0ED9\\u0F18\\u0F19\\u0F20-\\u0F29\\u0F35\\u0F37\\u0F39\\u0F3E-\\u0F47\\u0F49-\\u0F69\\u0F71-\\u0F84\\u0F86-\\u0F8B\\u0F90-\\u0F95\\u0F97\\u0F99-\\u0FAD\\u0FB1-\\u0FB7\\u0FB9\\u10A0-\\u10C5\\u10D0-\\u10F6\\u1100\\u1102\\u1103\\u1105-\\u1107\\u1109\\u110B\\u110C\\u110E-\\u1112\\u113C\\u113E\\u1140\\u114C\\u114E\\u1150\\u1154\\u1155\\u1159\\u115F-\\u1161\\u1163\\u1165\\u1167\\u1169\\u116D\\u116E\\u1172\\u1173\\u1175\\u119E\\u11A8\\u11AB\\u11AE\\u11AF\\u11B7\\u11B8\\u11BA\\u11BC-\\u11C2\\u11EB\\u11F0\\u11F9\\u1E00-\\u1E9B\\u1EA0-\\u1EF9\\u1F00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u20D0-\\u20DC\\u20E1\\u2126\\u212A\\u212B\\u212E\\u2180-\\u2182\\u3005\\u3007\\u3021-\\u302F\\u3031-\\u3035\\u3041-\\u3094\\u3099\\u309A\\u309D\\u309E\\u30A1-\\u30FA\\u30FC-\\u30FE\\u3105-\\u312C\\u4E00-\\u9FA5\\uAC00-\\uD7A3]*)\\}$"}],"fn":"matches","kind":"compute"},{"kind":"compare","left":{"args":[{"field":"kind","kind":"field"},{"field":"name","kind":"field"}],"field":"spelling","kind":"closedAt","relation":"VariableReference"},"op":"eq","right":{"kind":"literal","value":"braced"}}],"kind":"and"}],"kind":"or"} and {"kind":"compare","left":{"args":[{"args":[{"field":"name","kind":"field"}],"fn":"singleton","kind":"compute"},{"args":[{"field":"kind","kind":"field"}],"kind":"closedRow","relation":"VariableReference"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}}, name where {"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-any-n","qti-correct","qti-default","qti-equal-rounded","qti-index","qti-lookup-outcome-value","qti-map-response","qti-map-response-point","qti-pattern-match","qti-random-float","qti-random-integer","qti-repeat","qti-round-to","qti-set-correct-response","qti-set-default-value","qti-set-outcome-value","qti-set-template-value","qti-variable"]} and {"args":[{"args":[{"args":[{"arg":{"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-random-float"]},"kind":"not"},{"arg":{"args":[{"field":"lexical","kind":"field"},{"kind":"literal","value":"^[\\t\\n\\r ]*(?:INF|NaN)[\\t\\n\\r ]*$"}],"fn":"matches","kind":"compute"},"kind":"not"}],"kind":"or"},{"args":[{"field":"lexical","kind":"field"},{"kind":"literal","value":"^[\\t\\n\\r ]*(?:[A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u0131\\u0134-\\u013E\\u0141-\\u0148\\u014A-\\u017E\\u0180-\\u01C3\\u01CD-\\u01F0\\u01F4\\u01F5\\u01FA-\\u0217\\u0250-\\u02A8\\u02BB-\\u02C1\\u0386\\u0388-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03CE\\u03D0-\\u03D6\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2-\\u03F3\\u0401-\\u040C\\u040E-\\u044F\\u0451-\\u045C\\u045E-\\u0481\\u0490-\\u04C4\\u04C7\\u04C8\\u04CB\\u04CC\\u04D0-\\u04EB\\u04EE-\\u04F5\\u04F8\\u04F9\\u0531-\\u0556\\u0559\\u0561-\\u0586\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u063A\\u0641-\\u064A\\u0671-\\u06B7\\u06BA-\\u06BE\\u06C0-\\u06CE\\u06D0-\\u06D3\\u06D5\\u06E5\\u06E6\\u0905-\\u0939\\u093D\\u0958-\\u0961\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09DC\\u09DD\\u09DF-\\u09E1\\u09F0\\u09F1\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74\\u0A85-\\u0A8B\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AE0\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B36-\\u0B39\\u0B3D\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB5\\u0BB7-\\u0BB9\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C60\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CDE\\u0CE0\\u0CE1\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D60\\u0D61\\u0E01-\\u0E2E\\u0E30\\u0E32\\u0E33\\u0E40-\\u0E45\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD\\u0EAE\\u0EB0\\u0EB2\\u0EB3\\u0EBD\\u0EC0-\\u0EC4\\u0F40-\\u0F47\\u0F49-\\u0F69\\u10A0-\\u10C5\\u10D0-\\u10F6\\u1100\\u1102\\u1103\\u1105-\\u1107\\u1109\\u110B\\u110C\\u110E-\\u1112\\u113C\\u113E\\u1140\\u114C\\u114E\\u1150\\u1154\\u1155\\u1159\\u115F-\\u1161\\u1163\\u1165\\u1167\\u1169\\u116D\\u116E\\u1172\\u1173\\u1175\\u119E\\u11A8\\u11AB\\u11AE\\u11AF\\u11B7\\u11B8\\u11BA\\u11BC-\\u11C2\\u11EB\\u11F0\\u11F9\\u1E00-\\u1E9B\\u1EA0-\\u1EF9\\u1F00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u2126\\u212A\\u212B\\u212E\\u2180-\\u2182\\u3007\\u3021-\\u3029\\u3041-\\u3094\\u30A1-\\u30FA\\u3105-\\u312C\\u4E00-\\u9FA5\\uAC00-\\uD7A3][\\-.0-9A-Z_a-z\\u00B7\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u0131\\u0134-\\u013E\\u0141-\\u0148\\u014A-\\u017E\\u0180-\\u01C3\\u01CD-\\u01F0\\u01F4\\u01F5\\u01FA-\\u0217\\u0250-\\u02A8\\u02BB-\\u02C1\\u02D0\\u02D1\\u0300-\\u0345\\u0360\\u0361\\u0386-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03CE\\u03D0-\\u03D6\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2-\\u03F3\\u0401-\\u040C\\u040E-\\u044F\\u0451-\\u045C\\u045E-\\u0481\\u0483-\\u0486\\u0490-\\u04C4\\u04C7\\u04C8\\u04CB\\u04CC\\u04D0-\\u04EB\\u04EE-\\u04F5\\u04F8\\u04F9\\u0531-\\u0556\\u0559\\u0561-\\u0586\\u0591-\\u05A1\\u05A3-\\u05B9\\u05BB-\\u05BD\\u05BF\\u05C1\\u05C2\\u05C4\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u063A\\u0640-\\u0652\\u0660-\\u0669\\u0670-\\u06B7\\u06BA-\\u06BE\\u06C0-\\u06CE\\u06D0-\\u06D3\\u06D5-\\u06E8\\u06EA-\\u06ED\\u06F0-\\u06F9\\u0901-\\u0903\\u0905-\\u0939\\u093C-\\u094D\\u0951-\\u0954\\u0958-\\u0963\\u0966-\\u096F\\u0981-\\u0983\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BC\\u09BE-\\u09C4\\u09C7\\u09C8\\u09CB-\\u09CD\\u09D7\\u09DC\\u09DD\\u09DF-\\u09E3\\u09E6-\\u09F1\\u0A02\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A3C\\u0A3E-\\u0A42\\u0A47\\u0A48\\u0A4B-\\u0A4D\\u0A59-\\u0A5C\\u0A5E\\u0A66-\\u0A74\\u0A81-\\u0A83\\u0A85-\\u0A8B\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABC-\\u0AC5\\u0AC7-\\u0AC9\\u0ACB-\\u0ACD\\u0AE0\\u0AE6-\\u0AEF\\u0B01-\\u0B03\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B36-\\u0B39\\u0B3C-\\u0B43\\u0B47\\u0B48\\u0B4B-\\u0B4D\\u0B56\\u0B57\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B66-\\u0B6F\\u0B82\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB5\\u0BB7-\\u0BB9\\u0BBE-\\u0BC2\\u0BC6-\\u0BC8\\u0BCA-\\u0BCD\\u0BD7\\u0BE7-\\u0BEF\\u0C01-\\u0C03\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3E-\\u0C44\\u0C46-\\u0C48\\u0C4A-\\u0C4D\\u0C55\\u0C56\\u0C60\\u0C61\\u0C66-\\u0C6F\\u0C82\\u0C83\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBE-\\u0CC4\\u0CC6-\\u0CC8\\u0CCA-\\u0CCD\\u0CD5\\u0CD6\\u0CDE\\u0CE0\\u0CE1\\u0CE6-\\u0CEF\\u0D02\\u0D03\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D3E-\\u0D43\\u0D46-\\u0D48\\u0D4A-\\u0D4D\\u0D57\\u0D60\\u0D61\\u0D66-\\u0D6F\\u0E01-\\u0E2E\\u0E30-\\u0E3A\\u0E40-\\u0E4E\\u0E50-\\u0E59\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD\\u0EAE\\u0EB0-\\u0EB9\\u0EBB-\\u0EBD\\u0EC0-\\u0EC4\\u0EC6\\u0EC8-\\u0ECD\\u0ED0-\\u0ED9\\u0F18\\u0F19\\u0F20-\\u0F29\\u0F35\\u0F37\\u0F39\\u0F3E-\\u0F47\\u0F49-\\u0F69\\u0F71-\\u0F84\\u0F86-\\u0F8B\\u0F90-\\u0F95\\u0F97\\u0F99-\\u0FAD\\u0FB1-\\u0FB7\\u0FB9\\u10A0-\\u10C5\\u10D0-\\u10F6\\u1100\\u1102\\u1103\\u1105-\\u1107\\u1109\\u110B\\u110C\\u110E-\\u1112\\u113C\\u113E\\u1140\\u114C\\u114E\\u1150\\u1154\\u1155\\u1159\\u115F-\\u1161\\u1163\\u1165\\u1167\\u1169\\u116D\\u116E\\u1172\\u1173\\u1175\\u119E\\u11A8\\u11AB\\u11AE\\u11AF\\u11B7\\u11B8\\u11BA\\u11BC-\\u11C2\\u11EB\\u11F0\\u11F9\\u1E00-\\u1E9B\\u1EA0-\\u1EF9\\u1F00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u20D0-\\u20DC\\u20E1\\u2126\\u212A\\u212B\\u212E\\u2180-\\u2182\\u3005\\u3007\\u3021-\\u302F\\u3031-\\u3035\\u3041-\\u3094\\u3099\\u309A\\u309D\\u309E\\u30A1-\\u30FA\\u30FC-\\u30FE\\u3105-\\u312C\\u4E00-\\u9FA5\\uAC00-\\uD7A3]*)[\\t\\n\\r ]*$"}],"fn":"matches","kind":"compute"},{"kind":"compare","left":{"args":[{"field":"kind","kind":"field"},{"field":"name","kind":"field"}],"field":"spelling","kind":"closedAt","relation":"VariableReference"},"op":"eq","right":{"kind":"literal","value":"bare"}}],"kind":"and"},{"args":[{"args":[{"field":"lexical","kind":"field"},{"kind":"literal","value":"^\\{(?:[A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u0131\\u0134-\\u013E\\u0141-\\u0148\\u014A-\\u017E\\u0180-\\u01C3\\u01CD-\\u01F0\\u01F4\\u01F5\\u01FA-\\u0217\\u0250-\\u02A8\\u02BB-\\u02C1\\u0386\\u0388-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03CE\\u03D0-\\u03D6\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2-\\u03F3\\u0401-\\u040C\\u040E-\\u044F\\u0451-\\u045C\\u045E-\\u0481\\u0490-\\u04C4\\u04C7\\u04C8\\u04CB\\u04CC\\u04D0-\\u04EB\\u04EE-\\u04F5\\u04F8\\u04F9\\u0531-\\u0556\\u0559\\u0561-\\u0586\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u063A\\u0641-\\u064A\\u0671-\\u06B7\\u06BA-\\u06BE\\u06C0-\\u06CE\\u06D0-\\u06D3\\u06D5\\u06E5\\u06E6\\u0905-\\u0939\\u093D\\u0958-\\u0961\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09DC\\u09DD\\u09DF-\\u09E1\\u09F0\\u09F1\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74\\u0A85-\\u0A8B\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AE0\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B36-\\u0B39\\u0B3D\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB5\\u0BB7-\\u0BB9\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C60\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CDE\\u0CE0\\u0CE1\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D60\\u0D61\\u0E01-\\u0E2E\\u0E30\\u0E32\\u0E33\\u0E40-\\u0E45\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD\\u0EAE\\u0EB0\\u0EB2\\u0EB3\\u0EBD\\u0EC0-\\u0EC4\\u0F40-\\u0F47\\u0F49-\\u0F69\\u10A0-\\u10C5\\u10D0-\\u10F6\\u1100\\u1102\\u1103\\u1105-\\u1107\\u1109\\u110B\\u110C\\u110E-\\u1112\\u113C\\u113E\\u1140\\u114C\\u114E\\u1150\\u1154\\u1155\\u1159\\u115F-\\u1161\\u1163\\u1165\\u1167\\u1169\\u116D\\u116E\\u1172\\u1173\\u1175\\u119E\\u11A8\\u11AB\\u11AE\\u11AF\\u11B7\\u11B8\\u11BA\\u11BC-\\u11C2\\u11EB\\u11F0\\u11F9\\u1E00-\\u1E9B\\u1EA0-\\u1EF9\\u1F00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u2126\\u212A\\u212B\\u212E\\u2180-\\u2182\\u3007\\u3021-\\u3029\\u3041-\\u3094\\u30A1-\\u30FA\\u3105-\\u312C\\u4E00-\\u9FA5\\uAC00-\\uD7A3][\\-.0-9A-Z_a-z\\u00B7\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u0131\\u0134-\\u013E\\u0141-\\u0148\\u014A-\\u017E\\u0180-\\u01C3\\u01CD-\\u01F0\\u01F4\\u01F5\\u01FA-\\u0217\\u0250-\\u02A8\\u02BB-\\u02C1\\u02D0\\u02D1\\u0300-\\u0345\\u0360\\u0361\\u0386-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03CE\\u03D0-\\u03D6\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2-\\u03F3\\u0401-\\u040C\\u040E-\\u044F\\u0451-\\u045C\\u045E-\\u0481\\u0483-\\u0486\\u0490-\\u04C4\\u04C7\\u04C8\\u04CB\\u04CC\\u04D0-\\u04EB\\u04EE-\\u04F5\\u04F8\\u04F9\\u0531-\\u0556\\u0559\\u0561-\\u0586\\u0591-\\u05A1\\u05A3-\\u05B9\\u05BB-\\u05BD\\u05BF\\u05C1\\u05C2\\u05C4\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u063A\\u0640-\\u0652\\u0660-\\u0669\\u0670-\\u06B7\\u06BA-\\u06BE\\u06C0-\\u06CE\\u06D0-\\u06D3\\u06D5-\\u06E8\\u06EA-\\u06ED\\u06F0-\\u06F9\\u0901-\\u0903\\u0905-\\u0939\\u093C-\\u094D\\u0951-\\u0954\\u0958-\\u0963\\u0966-\\u096F\\u0981-\\u0983\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BC\\u09BE-\\u09C4\\u09C7\\u09C8\\u09CB-\\u09CD\\u09D7\\u09DC\\u09DD\\u09DF-\\u09E3\\u09E6-\\u09F1\\u0A02\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A3C\\u0A3E-\\u0A42\\u0A47\\u0A48\\u0A4B-\\u0A4D\\u0A59-\\u0A5C\\u0A5E\\u0A66-\\u0A74\\u0A81-\\u0A83\\u0A85-\\u0A8B\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABC-\\u0AC5\\u0AC7-\\u0AC9\\u0ACB-\\u0ACD\\u0AE0\\u0AE6-\\u0AEF\\u0B01-\\u0B03\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B36-\\u0B39\\u0B3C-\\u0B43\\u0B47\\u0B48\\u0B4B-\\u0B4D\\u0B56\\u0B57\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B66-\\u0B6F\\u0B82\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB5\\u0BB7-\\u0BB9\\u0BBE-\\u0BC2\\u0BC6-\\u0BC8\\u0BCA-\\u0BCD\\u0BD7\\u0BE7-\\u0BEF\\u0C01-\\u0C03\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3E-\\u0C44\\u0C46-\\u0C48\\u0C4A-\\u0C4D\\u0C55\\u0C56\\u0C60\\u0C61\\u0C66-\\u0C6F\\u0C82\\u0C83\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBE-\\u0CC4\\u0CC6-\\u0CC8\\u0CCA-\\u0CCD\\u0CD5\\u0CD6\\u0CDE\\u0CE0\\u0CE1\\u0CE6-\\u0CEF\\u0D02\\u0D03\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D3E-\\u0D43\\u0D46-\\u0D48\\u0D4A-\\u0D4D\\u0D57\\u0D60\\u0D61\\u0D66-\\u0D6F\\u0E01-\\u0E2E\\u0E30-\\u0E3A\\u0E40-\\u0E4E\\u0E50-\\u0E59\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD\\u0EAE\\u0EB0-\\u0EB9\\u0EBB-\\u0EBD\\u0EC0-\\u0EC4\\u0EC6\\u0EC8-\\u0ECD\\u0ED0-\\u0ED9\\u0F18\\u0F19\\u0F20-\\u0F29\\u0F35\\u0F37\\u0F39\\u0F3E-\\u0F47\\u0F49-\\u0F69\\u0F71-\\u0F84\\u0F86-\\u0F8B\\u0F90-\\u0F95\\u0F97\\u0F99-\\u0FAD\\u0FB1-\\u0FB7\\u0FB9\\u10A0-\\u10C5\\u10D0-\\u10F6\\u1100\\u1102\\u1103\\u1105-\\u1107\\u1109\\u110B\\u110C\\u110E-\\u1112\\u113C\\u113E\\u1140\\u114C\\u114E\\u1150\\u1154\\u1155\\u1159\\u115F-\\u1161\\u1163\\u1165\\u1167\\u1169\\u116D\\u116E\\u1172\\u1173\\u1175\\u119E\\u11A8\\u11AB\\u11AE\\u11AF\\u11B7\\u11B8\\u11BA\\u11BC-\\u11C2\\u11EB\\u11F0\\u11F9\\u1E00-\\u1E9B\\u1EA0-\\u1EF9\\u1F00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u20D0-\\u20DC\\u20E1\\u2126\\u212A\\u212B\\u212E\\u2180-\\u2182\\u3005\\u3007\\u3021-\\u302F\\u3031-\\u3035\\u3041-\\u3094\\u3099\\u309A\\u309D\\u309E\\u30A1-\\u30FA\\u30FC-\\u30FE\\u3105-\\u312C\\u4E00-\\u9FA5\\uAC00-\\uD7A3]*)\\}$"}],"fn":"matches","kind":"compute"},{"kind":"compare","left":{"args":[{"field":"kind","kind":"field"},{"field":"name","kind":"field"}],"field":"spelling","kind":"closedAt","relation":"VariableReference"},"op":"eq","right":{"kind":"literal","value":"braced"}}],"kind":"and"}],"kind":"or"} and {"kind":"compare","left":{"args":[{"args":[{"field":"name","kind":"field"}],"fn":"singleton","kind":"compute"},{"args":[{"field":"kind","kind":"field"}],"kind":"closedRow","relation":"VariableReference"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}}) to VariableRef(package, path, start, attribute)';

COMMENT ON CONSTRAINT "__node_fk_package_path_start_xoajsvqhdh" ON "qti"."node" IS 'foreign key Node(package where {"kind":"compare","left":{"args":[{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"kind":"literal","value":"baseType"}],"field":"slot","kind":"closedAt","relation":"AttributeGrammar"}],"fn":"singleton","kind":"compute"},{"field":"attrs","kind":"field"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}} and {"kind":"compare","left":{"args":[{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"kind":"literal","value":"fieldIdentifier"}],"field":"slot","kind":"closedAt","relation":"AttributeGrammar"}],"fn":"singleton","kind":"compute"},{"field":"attrs","kind":"field"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}} and {"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"ud:value"}}, path where {"kind":"compare","left":{"args":[{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"kind":"literal","value":"baseType"}],"field":"slot","kind":"closedAt","relation":"AttributeGrammar"}],"fn":"singleton","kind":"compute"},{"field":"attrs","kind":"field"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}} and {"kind":"compare","left":{"args":[{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"kind":"literal","value":"fieldIdentifier"}],"field":"slot","kind":"closedAt","relation":"AttributeGrammar"}],"fn":"singleton","kind":"compute"},{"field":"attrs","kind":"field"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}} and {"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"ud:value"}}, start where {"kind":"compare","left":{"args":[{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"kind":"literal","value":"baseType"}],"field":"slot","kind":"closedAt","relation":"AttributeGrammar"}],"fn":"singleton","kind":"compute"},{"field":"attrs","kind":"field"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}} and {"kind":"compare","left":{"args":[{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"kind":"literal","value":"fieldIdentifier"}],"field":"slot","kind":"closedAt","relation":"AttributeGrammar"}],"fn":"singleton","kind":"compute"},{"field":"attrs","kind":"field"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}} and {"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"ud:value"}}) to UsageValue(package, path, start)';

COMMENT ON CONSTRAINT "__placed_variable_ref_fk_package_path_start_x7p53fn7ea" ON "qti"."placed_variable_ref" IS 'foreign key PlacedVariableRef(package, path, start, attribute, identifier) to VariableRef(package, path, start, attribute, identifier)';

COMMENT ON CONSTRAINT "__usage_value_fk_package_path_start_7ha57yumtv" ON "qti"."usage_value" IS 'foreign key UsageValue(package, path, start) to Node(package where {"kind":"compare","left":{"args":[{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"kind":"literal","value":"baseType"}],"field":"slot","kind":"closedAt","relation":"AttributeGrammar"}],"fn":"singleton","kind":"compute"},{"field":"attrs","kind":"field"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}} and {"kind":"compare","left":{"args":[{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"kind":"literal","value":"fieldIdentifier"}],"field":"slot","kind":"closedAt","relation":"AttributeGrammar"}],"fn":"singleton","kind":"compute"},{"field":"attrs","kind":"field"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}} and {"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"ud:value"}}, path where {"kind":"compare","left":{"args":[{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"kind":"literal","value":"baseType"}],"field":"slot","kind":"closedAt","relation":"AttributeGrammar"}],"fn":"singleton","kind":"compute"},{"field":"attrs","kind":"field"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}} and {"kind":"compare","left":{"args":[{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"kind":"literal","value":"fieldIdentifier"}],"field":"slot","kind":"closedAt","relation":"AttributeGrammar"}],"fn":"singleton","kind":"compute"},{"field":"attrs","kind":"field"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}} and {"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"ud:value"}}, start where {"kind":"compare","left":{"args":[{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"kind":"literal","value":"baseType"}],"field":"slot","kind":"closedAt","relation":"AttributeGrammar"}],"fn":"singleton","kind":"compute"},{"field":"attrs","kind":"field"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}} and {"kind":"compare","left":{"args":[{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"kind":"literal","value":"fieldIdentifier"}],"field":"slot","kind":"closedAt","relation":"AttributeGrammar"}],"fn":"singleton","kind":"compute"},{"field":"attrs","kind":"field"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}} and {"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"ud:value"}})';

COMMENT ON CONSTRAINT "__variable_ref_fk_package_path_start_attribute_mtdx46lozb" ON "qti"."variable_ref" IS 'foreign key VariableRef(package, path, start, attribute) to Attribute(package, path, start, name)';

COMMENT ON INDEX "qti"."__attribute_ix_package_jrh_4_wbrdcs_path_xrl_4_ean_n4qqbbunzf" IS 'btree index Attribute(__package_jrh4wbrdcs, __path_xrl4ean242, __start_v7jhneryku, __name_olkikci4cm)';

COMMENT ON INDEX "qti"."__attribute_ix_package_name_kind_image_value_path_4gc7q6filp" IS 'btree index Attribute(package, name, kind, image(value), path, start)';

COMMENT ON INDEX "qti"."__attribute_ix_package_name_kind_start_path_vpieosiivb" IS 'btree index Attribute(package, name, kind, start, path)';

COMMENT ON INDEX "qti"."__attribute_ix_package_path_name_kind_image_value_bysppk4y4d" IS 'btree index Attribute(package, path, name, kind, image(value), start)';

COMMENT ON INDEX "qti"."__document_id_ix_package_path_admitted_owner_jp55imcxjo" IS 'btree index DocumentId(package, path, admitted, owner)';

COMMENT ON INDEX "qti"."__fragment_printed_ref_ix_package_assembly_attribute_zjvkoqjqfo" IS 'btree index FragmentPrintedRef(package, assembly, attribute, kind)';

COMMENT ON INDEX "qti"."__fragment_printed_ref_ix_package_assembly_ycu2amkeef" IS 'btree index FragmentPrintedRef(package, assembly, identifier)';

COMMENT ON INDEX "qti"."__idref_ix_package_path_name_ckzbix4lpw" IS 'btree index Idref(package, path, name)';

COMMENT ON INDEX "qti"."__node_ix_package_path_element_children_kind_parent_st7tbj3vpb" IS 'btree index Node(package, path, elementChildren, kind, parentKind)';

COMMENT ON INDEX "qti"."__placed_variable_ref_ix_package_assembly_resolution_ymsbodsibl" IS 'btree index PlacedVariableRef(package, assembly, resolution, attribute, identifier)';

COMMENT ON INDEX "qti"."__placed_variable_ref_ix_package_path_start_vancfqqmxp" IS 'btree index PlacedVariableRef(package, path, start, attribute, identifier)';

COMMENT ON INDEX "qti"."__placed_variable_ref_ix_package_resolution_dgkqzkehhp" IS 'btree index PlacedVariableRef(package, resolution, attribute, path, start)';

COMMENT ON INDEX "qti"."__printed_variable_ref_ix_package_path_attribute_6csxkflr5e" IS 'btree index PrintedVariableRef(package, path, attribute, kind)';

COMMENT ON INDEX "qti"."__printed_variable_ref_ix_package_path_identifier_utzunspzz6" IS 'btree index PrintedVariableRef(package, path, identifier)';

COMMENT ON INDEX "qti"."__ssml_scope_ix_package_path_fragment_eypvysdzvg" IS 'btree index SsmlScope(package, path, fragment)';

COMMENT ON INDEX "qti"."__variable_ref_ix_package_path_identifier_wkkut3gdit" IS 'btree index VariableRef(package, path, identifier)';

COMMENT ON INDEX "qti"."__variable_ref_ix_package_path_resolution_attribute_ufgtzeln7m" IS 'btree index VariableRef(package, path, resolution, attribute, identifier)';

COMMENT ON FUNCTION "qti"."__judge_assembled_catalog_63x22ym7aw"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of AssembledCatalog and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_candidate_path_yjce52zus2"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of CandidatePath and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_data_ssml_member_57754qfqmz"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of DataSsmlMember and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_srcset_candidate_pf5nnml5oe"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of SrcsetCandidate and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_usage_value_base_type_b3cye3njhq"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of UsageValueBaseType and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__capture_assembled_catalog_3z2sfh4yla"() IS 'rule capture of AssembledCatalog';

COMMENT ON FUNCTION "qti"."__capture_attribute_itmluum5pt"() IS 'rule capture of Attribute';

COMMENT ON FUNCTION "qti"."__capture_catalog_id_jfqixfjyar"() IS 'rule capture of CatalogId';

COMMENT ON FUNCTION "qti"."__capture_cell_headers_stlfdiqhwe"() IS 'rule capture of CellHeaders';

COMMENT ON FUNCTION "qti"."__capture_document_h46mvgroqo"() IS 'rule capture of Document';

COMMENT ON FUNCTION "qti"."__capture_document_id_eulwoph3m7"() IS 'rule capture of DocumentId';

COMMENT ON FUNCTION "qti"."__capture_file_yjq2w5356h"() IS 'rule capture of File';

COMMENT ON FUNCTION "qti"."__capture_fragment_printed_ref_uennexi5y2"() IS 'rule capture of FragmentPrintedRef';

COMMENT ON FUNCTION "qti"."__capture_idref_4rhkrmfh4c"() IS 'rule capture of Idref';

COMMENT ON FUNCTION "qti"."__capture_instance_ts6ly2zo5e"() IS 'rule capture of Instance';

COMMENT ON FUNCTION "qti"."__capture_mastery_value_vcu35bia62"() IS 'rule capture of MasteryValue';

COMMENT ON FUNCTION "qti"."__capture_math_align_scope_drfp7lejeu"() IS 'rule capture of MathAlignScope';

COMMENT ON FUNCTION "qti"."__capture_node_7sghxk2dxj"() IS 'rule capture of Node';

COMMENT ON FUNCTION "qti"."__capture_normal_maximum_kyp5brbypx"() IS 'rule capture of NormalMaximum';

COMMENT ON FUNCTION "qti"."__capture_normal_minimum_juiaihzrn6"() IS 'rule capture of NormalMinimum';

COMMENT ON FUNCTION "qti"."__capture_placed_variable_ref_c73fg3d4ir"() IS 'rule capture of PlacedVariableRef';

COMMENT ON FUNCTION "qti"."__capture_printed_variable_ref_rkvjy5pcp6"() IS 'rule capture of PrintedVariableRef';

COMMENT ON FUNCTION "qti"."__capture_resource_href_a6m5gac7ix"() IS 'rule capture of ResourceHref';

COMMENT ON FUNCTION "qti"."__capture_rounding_62zjiurefn"() IS 'rule capture of Rounding';

COMMENT ON FUNCTION "qti"."__capture_rounding_mode_figures_np5ekmxxtw"() IS 'rule capture of RoundingModeFigures';

COMMENT ON FUNCTION "qti"."__capture_share_fragment_23yyb62piz"() IS 'rule capture of ShareFragment';

COMMENT ON FUNCTION "qti"."__capture_srcset_i23xwowlg4"() IS 'rule capture of Srcset';

COMMENT ON FUNCTION "qti"."__capture_table_header_tkmxq7wtew"() IS 'rule capture of TableHeader';

COMMENT ON FUNCTION "qti"."__capture_tolerance_sfo7irkllw"() IS 'rule capture of Tolerance';

COMMENT ON FUNCTION "qti"."__capture_variable_ref_lckeobxqnf"() IS 'rule capture of VariableRef';
