CREATE INDEX "__assembled_catalog_ix_image_package_image_assembly_vko2g4jyoz" ON "qti"."assembled_catalog" USING btree (("pg_catalog"."md5"("package")), ("pg_catalog"."md5"("assembly")), ("pg_catalog"."md5"("id")));

CREATE INDEX "__assembled_catalog_ix_package_path_owner_yng35odexo" ON "qti"."assembled_catalog" USING btree ("package", "path", "owner");

CREATE INDEX "__attribute_ix_image_package_x_4_j_5_zex_3_fr_image_mallpmfxza" ON "qti"."attribute" USING btree ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "name", "__pred_idrefs_2kinxrebfw");

CREATE INDEX "__attribute_ix_package_a_4_p_2_u_7_pv_6_l_path_start_2cajllfvyt" ON "qti"."attribute" USING btree ("__package_a4p2u7pv6l", "path", "start", "name");

CREATE INDEX "__attribute_ix_image_package_image_path_image_value_czo5r26w2r" ON "qti"."attribute" USING btree (("pg_catalog"."md5"("package")), ("pg_catalog"."md5"("path")), ("pg_catalog"."md5"("value")), "name", "start");

CREATE INDEX "__attribute_ix_image_package_image_path_name_kind_dutwtapsk3" ON "qti"."attribute" USING btree (("pg_catalog"."md5"("package")), ("pg_catalog"."md5"("path")), "name", "kind", ("pg_catalog"."md5"("value")), "start");

CREATE INDEX "__attribute_ix_image_package_image_path_start_image_xdis6ifuer" ON "qti"."attribute" USING btree (("pg_catalog"."md5"("package")), ("pg_catalog"."md5"("path")), "start", ("pg_catalog"."md5"("value")));

CREATE INDEX "__attribute_ix_image_package_name_image_value_kind_gmpafhkkqi" ON "qti"."attribute" USING btree (("pg_catalog"."md5"("package")), "name", ("pg_catalog"."md5"("value")), "kind", ("pg_catalog"."md5"("path")), "start");

CREATE INDEX "__attribute_ix_image_package_name_kind_start_image_6hn2mprhfl" ON "qti"."attribute" USING btree (("pg_catalog"."md5"("package")), "name", "kind", "start", ("pg_catalog"."md5"("value")), ("pg_catalog"."md5"("path")));

CREATE INDEX "__attribute_ix_package_path_start_kind_name_zgakbm2bpc" ON "qti"."attribute" USING btree ("package", "path", "start", "kind", "name");

CREATE INDEX "__bound_variable_ix_package_pyofn_3_cand_path_start_msbzzspyze" ON "qti"."bound_variable" USING btree ("__package_pyofn3cand", "path", "start");

CREATE INDEX "__bound_variable_ix_image_package_image_path_image_hbj6q5i26o" ON "qti"."bound_variable" USING btree (("pg_catalog"."md5"("package")), ("pg_catalog"."md5"("path")), ("pg_catalog"."md5"("identifier")));

CREATE INDEX "__bound_variable_ix_package_attribute_path_ej2y7oq7v2" ON "qti"."bound_variable" USING btree ("package", "attribute", "path");

CREATE INDEX "__bound_variable_ix_package_path_adaptive_khkcbwhnkh" ON "qti"."bound_variable" USING btree ("package", "path", "adaptive");

CREATE INDEX "__bound_variable_ix_package_path_attribute_ophjg3fmft" ON "qti"."bound_variable" USING btree ("package", "path", "attribute");

CREATE INDEX "__candidate_path_ix_package_target_6vqzdz37df" ON "qti"."candidate_path" USING btree ("package", "target");

CREATE INDEX "__catalog_id_ix_image_package_image_path_image_id_qdfecuuspz" ON "qti"."catalog_id" USING btree (("pg_catalog"."md5"("package")), ("pg_catalog"."md5"("path")), ("pg_catalog"."md5"("id")));

CREATE INDEX "__cell_headers_ix_image_package_x_4_j_5_zex_3_fr_3xok7jezqu" ON "qti"."cell_headers" USING btree ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__pred_tokens_ip7mlgrtju");

CREATE INDEX "__choice_ix_image_package_image_path_image_42ih2cal6v" ON "qti"."choice" USING btree (("pg_catalog"."md5"("package")), ("pg_catalog"."md5"("path")), ("pg_catalog"."md5"("identifier")), "start");

CREATE INDEX "__data_ssml_property_ix_image_package_x_4_j_5_zex_3_xvrr6kf5ah" ON "qti"."data_ssml_property" USING btree ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "member", "__image_member_name_qqbvqrei53");

CREATE INDEX "__data_ssml_property_ix_image_package_image_path_eq53fxd7ev" ON "qti"."data_ssml_property" USING btree (("pg_catalog"."md5"("package")), ("pg_catalog"."md5"("path")), "start", "member", ("pg_catalog"."md5"("name")));

CREATE INDEX "__document_ix_package_assembled_path_6hx6cticyt" ON "qti"."document" USING btree ("package", "assembled", "path");

CREATE INDEX "__document_id_ix_package_path_admitted_owner_jp55imcxjo" ON "qti"."document_id" USING btree ("package", "path", "admitted", "owner");

CREATE INDEX "__expression_ix_package_path_base_type_start_tun2l55ql4" ON "qti"."expression" USING btree ("package", "path", "base_type", "start");

CREATE INDEX "__file_ix_image_package_image_path_scope_image_xiashzph6u" ON "qti"."file" USING btree (("pg_catalog"."md5"("package")), ("pg_catalog"."md5"("path")), "scope", ("pg_catalog"."md5"("target")));

CREATE INDEX "__file_ix_image_package_scope_image_target_image_eagljjolgi" ON "qti"."file" USING btree (("pg_catalog"."md5"("package")), "scope", ("pg_catalog"."md5"("target")), ("pg_catalog"."md5"("path")));

CREATE INDEX "__fragment_context_ref_ix_image_package_x_4_j_5_zex_erekzljbvi" ON "qti"."fragment_context_ref" USING btree ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "kind", "__image_identifier_sp263ko24n");

CREATE INDEX "__fragment_feedback_ref_ix_image_package_x_4_j_5_zex_3dodziwwlo" ON "qti"."fragment_feedback_ref" USING btree ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "kind", "__image_identifier_sp263ko24n");

CREATE INDEX "__fragment_printed_ref_ix_image_package_x_4_j_5_zex_vdm2bacpw7" ON "qti"."fragment_printed_ref" USING btree ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "kind", "__image_identifier_sp263ko24n");

CREATE INDEX "__fragment_scope_ix_package_document_feedbacks_txlrykzdtc" ON "qti"."fragment_scope" USING btree ("package", "document", "feedbacks", "prints", "templates", "contexts");

CREATE INDEX "__fragment_template_ref_ix_image_package_x_4_j_5_zex_rlpzvisham" ON "qti"."fragment_template_ref" USING btree ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "kind", "__image_identifier_sp263ko24n");

CREATE INDEX "__header_token_ix_image_package_x_4_j_5_zex_3_fr_nkboycyl3v" ON "qti"."header_token" USING btree ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__pred_at_xktcobhsti");

CREATE INDEX "__hottext_ix_image_package_image_path_image_vcziazdj36" ON "qti"."hottext" USING btree (("pg_catalog"."md5"("package")), ("pg_catalog"."md5"("path")), ("pg_catalog"."md5"("identifier")), "start");

CREATE INDEX "__identity_text_ix_image_package_x_4_j_5_zex_3_fr_eox7lzaxub" ON "qti"."identity_text" USING btree ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__pred_tokens_ip7mlgrtju");

CREATE INDEX "__idref_ix_image_package_x_4_j_5_zex_3_fr_image_path_o4ttxmfqsc" ON "qti"."idref" USING btree ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "__image_token_arko66iuth");

CREATE INDEX "__idref_ix_image_package_x_4_j_5_zex_3_fr_image_path_w6jwcsdgbn" ON "qti"."idref" USING btree ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "name", "__pred_at_xktcobhsti");

CREATE INDEX "__idref_ix_package_path_name_ckzbix4lpw" ON "qti"."idref" USING btree ("package", "path", "name");

CREATE INDEX "__idref_target_ix_package_path_assembled_4j2motbov2" ON "qti"."idref_target" USING btree ("package", "path", "assembled");

CREATE INDEX "__instance_ix_package_assembly_kind_assembly_zz7dcr5yl2" ON "qti"."instance" USING btree ("package", "assembly_kind", "assembly", "document", "parent", "site_document", "site");

CREATE INDEX "__instance_ix_package_assembly_kind_assembly_end_v3qlf6dvmo" ON "qti"."instance" USING btree ("package", "assembly_kind", "assembly", "end", "document");

CREATE INDEX "__instance_ix_package_assembly_kind_assembly_end_7f7duawmit" ON "qti"."instance" USING btree ("package", "assembly_kind", "assembly", "end", "parent");

CREATE INDEX "__instance_ix_package_assembly_kind_assembly_parent_myoodornlp" ON "qti"."instance" USING btree ("package", "assembly_kind", "assembly", "parent", "site", "site_document");

CREATE INDEX "__instance_ix_package_assembly_kind_assembly_parent_rrroul6xqw" ON "qti"."instance" USING btree ("package", "assembly_kind", "assembly", "parent", "site_document");

CREATE INDEX "__instance_ix_package_assembly_kind_assembly_site_seisqygrho" ON "qti"."instance" USING btree ("package", "assembly_kind", "assembly", "site", "site_document");

CREATE INDEX "__instance_ix_package_assembly_kind_assembly_site_ejmmvqaw55" ON "qti"."instance" USING btree ("package", "assembly_kind", "assembly", "site_document", "document", "site");

CREATE INDEX "__instance_ix_package_assembly_kind_document_start_gmzy7vbo64" ON "qti"."instance" USING btree ("package", "assembly_kind", "document", "start", "assembly");

CREATE INDEX "__instance_ix_package_assembly_kind_parent_site_45cjl4twgd" ON "qti"."instance" USING btree ("package", "assembly_kind", "parent", "site");

CREATE INDEX "__instance_ix_package_document_ids_idref_targets_3kuzxyrfyq" ON "qti"."instance" USING btree ("package", "document", "ids", "idref_targets", "choices", "hottexts");

CREATE INDEX "__instance_ix_package_document_root_kind_rubmvpymix" ON "qti"."instance" USING btree ("package", "document", "root_kind");

CREATE INDEX "__instance_ix_package_site_site_document_assembly_4dyuszlqmg" ON "qti"."instance" USING btree ("package", "site", "site_document", "assembly_kind", "start");

CREATE INDEX "__instance_ix_package_start_document_assembly_rmwvqsnjiw" ON "qti"."instance" USING btree ("package", "start", "document", "assembly");

CREATE INDEX "__interaction_attribute_ix_image_package_5_bjgttgjue_jrjdeo7ss5" ON "qti"."interaction_attribute" USING btree ("__image_package_5bjgttgjue", "__image_path_ff7ysgcuo3", "start", "name", "__image_value_dmndzoe5g5");

CREATE INDEX "__interaction_attribute_ix_image_package_7_tsrkngiba_lqlkuxmjh4" ON "qti"."interaction_attribute" USING btree ("__image_package_7tsrkngiba", "__image_path_ff7ysgcuo3", "start", "name", "kind", "root_kind", "__image_value_dmndzoe5g5");

CREATE INDEX "__interaction_attribute_ix_image_package_exckv_5_uowkyttgdm" ON "qti"."interaction_attribute" USING btree ("__image_package_exckv5jfmt", "__image_path_ff7ysgcuo3", "start", "name", "kind", "__image_value_dmndzoe5g5");

CREATE INDEX "__interaction_attribute_ix_image_package_ibdsk_7_rpbs74jweu" ON "qti"."interaction_attribute" USING btree ("__image_package_ibdsk7qumz", "__image_path_ff7ysgcuo3", "start", "name", "kind", "root_kind", "__image_value_dmndzoe5g5");

CREATE INDEX "__interaction_attribute_ix_image_package_jpnodyqj_4_3z5hx4zi7h" ON "qti"."interaction_attribute" USING btree ("__image_package_jpnodyqj4e", "__image_path_ff7ysgcuo3", "start", "name", "kind", "__image_value_dmndzoe5g5");

CREATE INDEX "__interaction_attribute_ix_image_package_k_2_gcvxo_2_hsksfhoele" ON "qti"."interaction_attribute" USING btree ("__image_package_k2gcvxo2zg", "__image_path_ff7ysgcuo3", "start", "name", "kind", "root_kind", "__image_value_dmndzoe5g5");

CREATE INDEX "__interaction_attribute_ix_image_package_lr_7_h53dsj6bxn" ON "qti"."interaction_attribute" USING btree ("__image_package_lr7wlxhost", "__image_path_ff7ysgcuo3", "start", "name", "__image_value_dmndzoe5g5");

CREATE INDEX "__interaction_attribute_ix_image_package_nyr_6_a2dcdznjy2" ON "qti"."interaction_attribute" USING btree ("__image_package_nyr6mqgwus", "__image_path_ff7ysgcuo3", "start", "name", "kind", "__image_value_dmndzoe5g5");

CREATE INDEX "__interaction_attribute_ix_image_package_ty_3_sdt6tgpttr" ON "qti"."interaction_attribute" USING btree ("__image_package_ty3wsixbgo", "__image_path_ff7ysgcuo3", "start", "name", "kind", "__image_value_dmndzoe5g5");

CREATE INDEX "__interaction_attribute_ix_image_package_uxpxcua_7_vjyy56d3of" ON "qti"."interaction_attribute" USING btree ("__image_package_uxpxcua7wm", "__image_path_ff7ysgcuo3", "start", "name", "kind", "root_kind", "__image_value_dmndzoe5g5");

CREATE INDEX "__interaction_attribute_ix_image_package_image_path_ynrjoksedr" ON "qti"."interaction_attribute" USING btree (("pg_catalog"."md5"("package")), ("pg_catalog"."md5"("path")), "name", "kind", ("pg_catalog"."md5"("value")), "start");

CREATE INDEX "__interaction_attribute_ix_package_path_root_kind_tqpqhhqjmc" ON "qti"."interaction_attribute" USING btree ("package", "path", "root_kind");

CREATE INDEX "__item_ref_document_ix_package_target_x3gzopozhy" ON "qti"."item_ref_document" USING btree ("package", "target");

CREATE INDEX "__item_ref_href_ix_package_target_6kwzgt4wre" ON "qti"."item_ref_href" USING btree ("package", "target");

CREATE INDEX "__label_use_ix_package_path_root_kind_gkglyfua6p" ON "qti"."label_use" USING btree ("package", "path", "root_kind");

CREATE INDEX "__link_reading_ix_package_attribute_path_start_ybt62rlyn6" ON "qti"."link_reading" USING btree ("package", "attribute", "path", "start");

CREATE INDEX "__literal_typed_ix_image_package_x_4_j_5_zex_3_fr_bhwdj3us7u" ON "qti"."literal_typed" USING btree ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__image_text_nik2jnknxc", "base_type");

CREATE INDEX "__named_ix_image_package_image_identifier_image_path_slgy72oqww" ON "qti"."named" USING btree (("pg_catalog"."md5"("package")), ("pg_catalog"."md5"("identifier")), ("pg_catalog"."md5"("path")));

CREATE INDEX "__node_ix_image_package_x_4_j_5_zex_3_fr_image_path_xbijfoie3n" ON "qti"."node" USING btree ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "__parent_l4ckjnvwat", "__pred_at_xktcobhsti");

CREATE INDEX "__node_ix_image_package_x_4_j_5_zex_3_fr_image_path_ecwpsmqrd6" ON "qti"."node" USING btree ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__pred_children_nrfpkqcaen");

CREATE INDEX "__node_ix_package_kind_parent_kind_element_children_adichcjcn5" ON "qti"."node" USING btree ("package", "kind", "parent_kind", "element_children", "path");

CREATE INDEX "__node_ix_package_parent_kind_path_start_6zgfzdfjgw" ON "qti"."node" USING btree ("package", "parent_kind", "path", "start");

CREATE INDEX "__node_ix_package_path_element_children_7nzzqbvcpo" ON "qti"."node" USING btree ("package", "path", "element_children");

CREATE INDEX "__node_ix_package_path_end_kind_parent_gyibajsdba" ON "qti"."node" USING btree ("package", "path", "end", "kind", "parent");

CREATE INDEX "__node_ix_package_path_kind_parent_kind_element_4i3tlpu47i" ON "qti"."node" USING btree ("package", "path", "kind", "parent_kind", "element_children");

CREATE INDEX "__node_ix_package_path_kind_parent_kind_elements_joehbu4lt4" ON "qti"."node" USING btree ("package", "path", "kind", "parent_kind", "elements");

CREATE INDEX "__node_ix_package_path_parent_at_3js7ucei5d" ON "qti"."node" USING btree ("package", "path", "parent", "at");

CREATE INDEX "__node_ix_package_path_parent_elements_eiswbbzaxd" ON "qti"."node" USING btree ("package", "path", "parent", "elements");

CREATE INDEX "__node_ix_package_path_parent_kind_elements_ydkakyedc3" ON "qti"."node" USING btree ("package", "path", "parent", "kind", "elements");

CREATE INDEX "__node_ix_package_path_parent_kind_parent_kind_d5hqnr55hg" ON "qti"."node" USING btree ("package", "path", "parent_kind", "parent", "kind");

CREATE INDEX "__node_ix_package_start_kind_path_wfqsgvcv6x" ON "qti"."node" USING btree ("package", "start", "kind", "path");

CREATE INDEX "__numbered_reading_ix_image_package_attribute_image_dfl3tt2u4p" ON "qti"."numbered_reading" USING btree (("pg_catalog"."md5"("package")), "attribute", ("pg_catalog"."md5"("path")), "start", ("pg_catalog"."md5"("variable")));

CREATE INDEX "__numbered_reading_ix_image_package_image_assembly_z3yteq6xbs" ON "qti"."numbered_reading" USING btree (("pg_catalog"."md5"("package")), ("pg_catalog"."md5"("assembly")), ("pg_catalog"."md5"("path")), "start", "attribute", "scope_instance", "scope", ("pg_catalog"."md5"("number")));

CREATE INDEX "__numbered_reading_ix_image_package_image_variable_7nzmwgc3jl" ON "qti"."numbered_reading" USING btree (("pg_catalog"."md5"("package")), ("pg_catalog"."md5"("variable")), ("pg_catalog"."md5"("assembly")), "scope", "scope_instance", ("pg_catalog"."md5"("scope_path")));

CREATE INDEX "__open_attribute_ix_package_path_start_kind_2umcdya4be" ON "qti"."open_attribute" USING btree ("package", "path", "start", "kind");

CREATE INDEX "__pci_module_form_ix_package_path_element_start_j6pwi6afuc" ON "qti"."pci_module_form" USING btree ("package", "path", "element", "start");

CREATE INDEX "__placed_binding_ix_image_package_x_4_j_5_zex_3_fr_rcnog6f6kb" ON "qti"."placed_binding" USING btree ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "__image_identifier_sp263ko24n");

CREATE INDEX "__placed_binding_ix_package_pyofn_3_cand_path_start_xuyitwy3ee" ON "qti"."placed_binding" USING btree ("__package_pyofn3cand", "path", "start");

CREATE INDEX "__placed_binding_ix_image_package_image_assembly_4wumvl4j45" ON "qti"."placed_binding" USING btree (("pg_catalog"."md5"("package")), ("pg_catalog"."md5"("assembly")), ("pg_catalog"."md5"("identifier")));

CREATE INDEX "__placed_binding_ix_package_assembly_adaptive_lv5atayv6x" ON "qti"."placed_binding" USING btree ("package", "assembly", "adaptive");

CREATE INDEX "__placed_binding_ix_package_attribute_path_start_x763qgcg2v" ON "qti"."placed_binding" USING btree ("package", "attribute", "path", "start");

CREATE INDEX "__placed_choice_ix_image_package_x_4_j_5_zex_3_fr_oxwhei67yw" ON "qti"."placed_choice" USING btree ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__image_identifier_sp263ko24n");

CREATE INDEX "__placed_choice_ix_image_package_image_assembly_i47d63k3a4" ON "qti"."placed_choice" USING btree (("pg_catalog"."md5"("package")), ("pg_catalog"."md5"("assembly")), ("pg_catalog"."md5"("identifier")));

CREATE INDEX "__placed_hottext_ix_image_package_x_4_j_5_zex_3_fr_gfw25ipu6w" ON "qti"."placed_hottext" USING btree ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__image_identifier_sp263ko24n");

CREATE INDEX "__placed_hottext_ix_image_package_image_assembly_qk3xccixbi" ON "qti"."placed_hottext" USING btree (("pg_catalog"."md5"("package")), ("pg_catalog"."md5"("assembly")), ("pg_catalog"."md5"("identifier")));

CREATE INDEX "__placed_id_ix_image_package_image_assembly_image_id_zt4uwgwinp" ON "qti"."placed_id" USING btree (("pg_catalog"."md5"("package")), ("pg_catalog"."md5"("assembly")), ("pg_catalog"."md5"("id")), "owner", ("pg_catalog"."md5"("path")), "instance");

CREATE INDEX "__placed_idref_ix_image_package_x_4_j_5_zex_3_fr_3df556lvhm" ON "qti"."placed_idref" USING btree ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "__image_id_cggscgoxcc");

CREATE INDEX "__placed_math_rank_ix_package_assembly_instance_path_xlmxodty27" ON "qti"."placed_math_rank" USING btree ("package", "assembly", "instance", "path");

CREATE INDEX "__placed_math_rank_ix_package_path_start_v42fxoxi7w" ON "qti"."placed_math_rank" USING btree ("package", "path", "start");

CREATE INDEX "__placed_share_target_ix_imagecopy_package_4_oudcg_2_qerhdzr4rs" ON "qti"."placed_share_target" USING btree ("__imagecopy_package_4oudcg2ick", "__imagecopy_path_2uz6mcb5mg", "start");

CREATE INDEX "__placed_share_target_ix_package_assembly_instance_iapuqjl64s" ON "qti"."placed_share_target" USING btree ("package", "assembly", "instance", "path", "assembly_kind");

CREATE INDEX "__placed_share_target_ix_package_assembly_target_k66b7bmx5u" ON "qti"."placed_share_target" USING btree ("package", "assembly", "target_instance", "target");

CREATE INDEX "__placed_share_target_ix_package_assembly_target_fpl23rvteo" ON "qti"."placed_share_target" USING btree ("package", "assembly", "target_instance", "target_start");

CREATE INDEX "__placed_variable_ref_ix_image_package_x_4_j_5_zex_3_jtt4cdq7la" ON "qti"."placed_variable_ref" USING btree ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "__image_identifier_sp263ko24n");

CREATE INDEX "__placed_variable_ref_ix_image_package_image_txql4a7puk" ON "qti"."placed_variable_ref" USING btree (("pg_catalog"."md5"("package")), ("pg_catalog"."md5"("assembly")), "resolution", ("pg_catalog"."md5"("identifier")), "attribute");

CREATE INDEX "__placed_variable_ref_ix_package_assembly_root_kind_ox6jmeuv4f" ON "qti"."placed_variable_ref" USING btree ("package", "assembly", "root_kind");

CREATE INDEX "__placed_variable_ref_ix_package_resolution_dgkqzkehhp" ON "qti"."placed_variable_ref" USING btree ("package", "resolution", "attribute", "path", "start");

CREATE INDEX "__reference_path_ix_package_kind_name_target_5jaummkw5u" ON "qti"."reference_path" USING btree ("package", "kind", "name", "target");

CREATE INDEX "__reference_path_ix_package_target_path_start_37so7ufnoh" ON "qti"."reference_path" USING btree ("package", "target", "path", "start");

CREATE INDEX "__resource_href_ix_image_package_image_target_image_oioasdltxr" ON "qti"."resource_href" USING btree (("pg_catalog"."md5"("package")), ("pg_catalog"."md5"("target")), ("pg_catalog"."md5"("path")));

CREATE INDEX "__rounding_mode_figures_ix_image_package_x_4_j_5_zex_4wtktowaqb" ON "qti"."rounding_mode_figures" USING btree ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__image_figures_sc25qjl32r");

CREATE INDEX "__share_fragment_ix_image_package_x_4_j_5_zex_3_fr_yv6ddwwmzh" ON "qti"."share_fragment" USING btree ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "__image_id_cggscgoxcc");

CREATE INDEX "__share_fragment_ix_package_path_assembled_start_njqql36dxw" ON "qti"."share_fragment" USING btree ("package", "path", "assembled", "start");

CREATE INDEX "__share_target_ix_package_path_target_start_vj2n53ubgi" ON "qti"."share_target" USING btree ("package", "path", "target_start");

CREATE INDEX "__site_path_ix_package_entry_path_start_lzli5pxkzl" ON "qti"."site_path" USING btree ("package", "entry", "path", "start");

CREATE INDEX "__site_target_ix_package_target_splices_ufrlh7idlc" ON "qti"."site_target" USING btree ("package", "target", "splices");

CREATE INDEX "__srcset_ix_image_package_x_4_j_5_zex_3_fr_image_25hujungwo" ON "qti"."srcset" USING btree ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__pred_tokens_ip7mlgrtju");

CREATE INDEX "__srcset_candidate_ix_image_package_x_4_j_5_zex_3_fr_prca27j34e" ON "qti"."srcset_candidate" USING btree ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__pred_at_xktcobhsti");

CREATE INDEX "__table_header_ix_image_package_image_path_image_id_dgdi2cfubx" ON "qti"."table_header" USING btree (("pg_catalog"."md5"("package")), ("pg_catalog"."md5"("path")), ("pg_catalog"."md5"("id")));

CREATE INDEX "__text_idref_ix_image_package_x_4_j_5_zex_3_fr_image_dkyguijg6x" ON "qti"."text_idref" USING btree ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "__image_token_arko66iuth");

CREATE INDEX "__text_idref_ix_image_package_x_4_j_5_zex_3_fr_image_krak7rquxa" ON "qti"."text_idref" USING btree ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__pred_at_xktcobhsti");

CREATE INDEX "__text_reference_path_ix_package_target_zlcnodi5ns" ON "qti"."text_reference_path" USING btree ("package", "target");

CREATE INDEX "__tolerance_ix_image_package_x_4_j_5_zex_3_fr_image_ekoz6lukb2" ON "qti"."tolerance" USING btree ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__pred_tokens_ip7mlgrtju");

CREATE INDEX "__tolerance_token_ix_image_package_x_4_j_5_zex_3_fr_ndb2zlqdga" ON "qti"."tolerance_token" USING btree ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__pred_at_xktcobhsti");

CREATE INDEX "__usage_value_ix_image_package_x_4_j_5_zex_3_fr_yprxu5ceka" ON "qti"."usage_value" USING btree ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__image_text_nik2jnknxc");

CREATE INDEX "__usage_value_base_type_ix_image_package_x_4_j_5_zex_4ffcoqyiki" ON "qti"."usage_value_base_type" USING btree ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__image_text_nik2jnknxc");

CREATE INDEX "__variable_ref_ix_image_package_attribute_image_path_oxcbndli3l" ON "qti"."variable_ref" USING btree (("pg_catalog"."md5"("package")), "attribute", ("pg_catalog"."md5"("path")), ("pg_catalog"."md5"("identifier")), "resolution");

CREATE INDEX "__variable_ref_ix_image_package_image_identifier_c7fg6qqhbs" ON "qti"."variable_ref" USING btree (("pg_catalog"."md5"("package")), ("pg_catalog"."md5"("identifier")), ("pg_catalog"."md5"("path")), "start");

CREATE INDEX "__variable_ref_ix_package_path_resolution_attribute_dqjwdvgtzk" ON "qti"."variable_ref" USING btree ("package", "path", "resolution", "attribute", "start");

CREATE INDEX "__variable_ref_ix_package_resolution_path_start_auwdsqycbn" ON "qti"."variable_ref" USING btree ("package", "resolution", "path", "start", "attribute");

CREATE INDEX "__variable_ref_table_ix_package_path_table_zemw44j2nk" ON "qti"."variable_ref_table" USING btree ("package", "path", "table");

CREATE STATISTICS "qti"."__attribute_stats_package_path_start_uo6glmb56i" (ndistinct, dependencies, mcv) ON "package", "path", "start" FROM "qti"."attribute";

CREATE STATISTICS "qti"."__attribute_entity_stats_name_package_path_start_7caqvjbetk" (ndistinct, dependencies, mcv) ON "name", "package", "path", "start" FROM "qti"."attribute_entity";

CREATE STATISTICS "qti"."__namespace_stats_package_path_start_gydqlm2xgj" (ndistinct, dependencies, mcv) ON "package", "path", "start" FROM "qti"."namespace";

CREATE STATISTICS "qti"."__node_stats_package_path_xnpndnqkuf" (ndistinct, dependencies, mcv) ON "package", "path" FROM "qti"."node";

CREATE STATISTICS "qti"."__open_attribute_stats_package_path_start_z3huhl5634" (ndistinct, dependencies, mcv) ON "package", "path", "start" FROM "qti"."open_attribute";

CREATE STATISTICS "qti"."__open_attribute_entity_stats_local_package_path_hbzt3b2u5g" (ndistinct, dependencies, mcv) ON "local", "package", "path", "start", "uri" FROM "qti"."open_attribute_entity";
