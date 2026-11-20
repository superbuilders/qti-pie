ALTER TABLE "qti"."mapping_cardinality" DROP CONSTRAINT "mappable_base_type";

ALTER TABLE "qti"."mapping_base_type" DROP CONSTRAINT "__mapping_base_type_check_mapping_base_type_in_2qd5udjjeg";

ALTER TABLE "qti"."map_key_type" DROP CONSTRAINT "typed_attribute_value";

ALTER TABLE "qti"."lookup_value_type" DROP CONSTRAINT "typed_attribute_value";

ALTER TABLE "qti"."lookup_table_cardinality" DROP CONSTRAINT "lookup_table_cardinality";

ALTER TABLE "qti"."area_mapping_cardinality" DROP CONSTRAINT "area_mapping_base_type";

ALTER TABLE "qti"."mapping_cardinality" DROP CONSTRAINT "__mapping_cardinality_pk_7krdnbe2aj";

ALTER TABLE "qti"."mapping_base_type" DROP CONSTRAINT "__mapping_base_type_pk_uyugwvfl57";

ALTER TABLE "qti"."mapping" DROP CONSTRAINT "__mapping_pk_lichj2blf4";

ALTER TABLE "qti"."map_key_type" DROP CONSTRAINT "__map_key_type_pk_pcrwxus7sl";

ALTER TABLE "qti"."lookup_value_type" DROP CONSTRAINT "__lookup_value_type_pk_4ajhvbos26";

ALTER TABLE "qti"."lookup_table_cardinality" DROP CONSTRAINT "__lookup_table_cardinality_pk_josbnabgwg";

ALTER TABLE "qti"."lookup_table" DROP CONSTRAINT "__lookup_table_pk_l3h5i7omge";

ALTER TABLE "qti"."area_mapping_cardinality" DROP CONSTRAINT "__area_mapping_cardinality_pk_wuvj7avoc2";

ALTER TABLE "qti"."area_mapping" DROP CONSTRAINT "__area_mapping_pk_5ntlzf6y73";

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
REVOKE USAGE ON SCHEMA "qti", "qti_queries", "qti_queries__author" FROM :"qti_queries__author";

REVOKE USAGE ON DOMAIN "qti"."__attribute_slot_bits_112_aecznthxg5", "qti"."__flag_bits_12_i4uhexylc4", "qti"."__value_base_bits_16_7t6pwwxbsh", "qti"."__value_cardinality_bits_8_mma4mwhphy", "qti"."__domain_gfw43vigph", "qti"."admission_map", "qti"."align_direction", "qti"."align_state", "qti"."attribute_model", "qti"."attribute_name", "qti"."attribute_slot", "qti"."base_type", "qti"."bound_facet", "qti"."bound_zero", "qti"."built_in", "qti"."cardinality", "qti"."cn_base", "qti"."cn_part", "qti"."cn_part_form", "qti"."cn_type", "qti"."content_model", "qti"."declaration_kind", "qti"."document_type", "qti"."domain_primitive", "qti"."entry_kind", "qti"."flag", "qti"."follow_set", "qti"."governor", "qti"."href_scope", "qti"."identity", "qti"."include_set", "qti"."language", "qti"."node_kind", "qti"."position", "qti"."reference_form", "qti"."reference_resolution", "qti"."reference_spelling", "qti"."referenced_table", "qti"."resource_type", "qti"."rounding_holds", "qti"."rp_template", "qti"."shared_model", "qti"."symbol_set", "qti"."type_name", "qti"."use", "qti"."value_base", "qti"."value_cardinality", "qti"."value_domain", "qti"."xml_standalone", "qti"."__text_xj3zno7u3h", "qti"."__text_c6iptmtj2x", "qti"."__text_wchibbb5qm", "qti"."__text_4s4od7s5or", "qti"."__text_qswrkft5qs", "qti"."__text_76pfa5avf4", "qti"."__text_gke7uypkov", "qti"."__text_l7nqeazg5h", "qti"."__text_k5kwygzatl", "qti"."__text_7dfilirtp3", "qti"."__text_7j6kgluyjp", "qti"."__text_xey6ryorh5", "qti"."__text_lnwfx5ijx4", "qti"."__text_lkpwkpgaib", "qti"."__text_w7a4l3clst", "qti"."__text_psn65t7m7e", "qti"."__text_23rzixl3a2", "qti"."__text_6zspo66rxv", "qti"."__text_vrcyezm7ka", "qti"."__text_7cbjao7rjc", "qti"."__text_zij47sgley", "qti"."__text_b6ykamoeho", "qti"."__text_xv5q2k3cum", "qti"."__text_3dlgl63rv6", "qti"."__text_mvb6rz2wwz", "qti"."__text_aezrarw5qb", "qti"."__text_3adwbksayk" FROM :"qti_queries__author";

REVOKE SELECT ON TABLE "qti_queries__author"."assembled_catalog", "qti_queries__author"."assessment_object", "qti_queries__author"."attribute", "qti_queries__author"."attribute_entity", "qti_queries__author"."binding_base_type", "qti_queries__author"."binding_cardinality", "qti_queries__author"."binding_declaration", "qti_queries__author"."binding_name", "qti_queries__author"."bound_variable", "qti_queries__author"."candidate_path", "qti_queries__author"."card_support", "qti_queries__author"."catalog_id", "qti_queries__author"."catalog_ref", "qti_queries__author"."catalog_scope", "qti_queries__author"."catalog_target", "qti_queries__author"."cell_headers", "qti_queries__author"."cell_leaf", "qti_queries__author"."choice", "qti_queries__author"."choice_interaction", "qti_queries__author"."cn_attribute", "qti_queries__author"."cn_count", "qti_queries__author"."cn_part_text", "qti_queries__author"."cn_slot", "qti_queries__author"."comment", "qti_queries__author"."context_ref", "qti_queries__author"."context_ref_declaration", "qti_queries__author"."count_bound", "qti_queries__author"."data_ssml", "qti_queries__author"."data_ssml_member", "qti_queries__author"."data_ssml_property", "qti_queries__author"."declaration", "qti_queries__author"."declaration_base_type", "qti_queries__author"."declaration_cardinality", "qti_queries__author"."declaration_identifier", "qti_queries__author"."declaration_name", "qti_queries__author"."default_entry", "qti_queries__author"."dependency", "qti_queries__author"."doctype", "qti_queries__author"."document", "qti_queries__author"."document_id", "qti_queries__author"."element_type", "qti_queries__author"."encoding_decl", "qti_queries__author"."entry", "qti_queries__author"."expression", "qti_queries__author"."expression_attribute", "qti_queries__author"."feedback_ref", "qti_queries__author"."feedback_ref_cardinality", "qti_queries__author"."feedback_ref_declaration", "qti_queries__author"."file", "qti_queries__author"."fragment_context_name", "qti_queries__author"."fragment_context_ref", "qti_queries__author"."fragment_context_ref_declaration", "qti_queries__author"."fragment_feedback_name", "qti_queries__author"."fragment_feedback_ref", "qti_queries__author"."fragment_feedback_ref_cardinality", "qti_queries__author"."fragment_feedback_ref_declaration", "qti_queries__author"."fragment_printed_name", "qti_queries__author"."fragment_printed_ref", "qti_queries__author"."fragment_printed_ref_declaration", "qti_queries__author"."fragment_scope", "qti_queries__author"."fragment_template_name", "qti_queries__author"."fragment_template_ref", "qti_queries__author"."fragment_template_ref_cardinality", "qti_queries__author"."fragment_template_ref_declaration", "qti_queries__author"."header_token", "qti_queries__author"."hottext", "qti_queries__author"."idref_target", "qti_queries__author"."inclusion", "qti_queries__author"."instance", "qti_queries__author"."interaction", "qti_queries__author"."interaction_attribute", "qti_queries__author"."item_mode", "qti_queries__author"."item_ref_document", "qti_queries__author"."item_ref_href", "qti_queries__author"."label_use", "qti_queries__author"."least_count", "qti_queries__author"."literal", "qti_queries__author"."literal_typed", "qti_queries__author"."manifest_id", "qti_queries__author"."mastery_ceiling", "qti_queries__author"."mastery_floor", "qti_queries__author"."mastery_value", "qti_queries__author"."math_action", "qti_queries__author"."math_align_group", "qti_queries__author"."math_align_scope", "qti_queries__author"."math_cell", "qti_queries__author"."math_cn", "qti_queries__author"."math_dir", "qti_queries__author"."math_rank", "qti_queries__author"."media", "qti_queries__author"."most_count", "qti_queries__author"."named", "qti_queries__author"."namespace", "qti_queries__author"."node", "qti_queries__author"."normal_maximum", "qti_queries__author"."normal_minimum", "qti_queries__author"."object_identifier", "qti_queries__author"."object_title", "qti_queries__author"."open_attribute", "qti_queries__author"."open_attribute_entity", "qti_queries__author"."open_element_name", "qti_queries__author"."open_element_type", "qti_queries__author"."package", "qti_queries__author"."pci_module_form", "qti_queries__author"."pi", "qti_queries__author"."placed_binding", "qti_queries__author"."placed_binding_base_type", "qti_queries__author"."placed_binding_cardinality", "qti_queries__author"."placed_binding_declaration", "qti_queries__author"."placed_catalog_ref", "qti_queries__author"."placed_choice", "qti_queries__author"."placed_hottext", "qti_queries__author"."placed_id", "qti_queries__author"."placed_idref", "qti_queries__author"."placed_math_rank", "qti_queries__author"."placed_share_target", "qti_queries__author"."placed_variable_ref", "qti_queries__author"."placed_variable_ref_declaration", "qti_queries__author"."placed_xml_lang", "qti_queries__author"."printed_variable_ref", "qti_queries__author"."printed_variable_ref_declaration", "qti_queries__author"."processing", "qti_queries__author"."processing_template", "qti_queries__author"."record_field", "qti_queries__author"."reference", "qti_queries__author"."reference_path", "qti_queries__author"."referring_document", "qti_queries__author"."resource_document", "qti_queries__author"."resource_href", "qti_queries__author"."resource_id", "qti_queries__author"."resource_typed", "qti_queries__author"."rounding", "qti_queries__author"."rounding_figures", "qti_queries__author"."rounding_mode", "qti_queries__author"."rounding_mode_figures", "qti_queries__author"."sd_decl", "qti_queries__author"."share_fragment", "qti_queries__author"."share_target", "qti_queries__author"."site", "qti_queries__author"."site_path", "qti_queries__author"."site_target", "qti_queries__author"."srcset_candidate", "qti_queries__author"."ssml_attribute", "qti_queries__author"."ssml_scope", "qti_queries__author"."statistic_date", "qti_queries__author"."stimulus_ref", "qti_queries__author"."table_header", "qti_queries__author"."table_scope", "qti_queries__author"."template_ref", "qti_queries__author"."template_ref_cardinality", "qti_queries__author"."template_ref_declaration", "qti_queries__author"."test_document", "qti_queries__author"."test_token", "qti_queries__author"."text_idref", "qti_queries__author"."text_reference", "qti_queries__author"."text_reference_path", "qti_queries__author"."tolerance", "qti_queries__author"."tolerance_token", "qti_queries__author"."usage_base_type", "qti_queries__author"."usage_value", "qti_queries__author"."usage_value_base_type", "qti_queries__author"."value_base_type", "qti_queries__author"."variable_ref", "qti_queries__author"."variable_ref_cardinality", "qti_queries__author"."variable_ref_declaration", "qti_queries__author"."variable_ref_table", "qti_queries__author"."xml_decl", "qti_queries__author"."xml_lang" FROM :"qti_queries__author";

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

GRANT USAGE ON DOMAIN "qti"."__attribute_slot_bits_112_aecznthxg5", "qti"."__flag_bits_12_i4uhexylc4", "qti"."__value_base_bits_16_7t6pwwxbsh", "qti"."__value_cardinality_bits_8_mma4mwhphy", "qti"."__domain_gfw43vigph", "qti"."admission_map", "qti"."align_direction", "qti"."align_state", "qti"."attribute_model", "qti"."attribute_name", "qti"."attribute_slot", "qti"."base_type", "qti"."bound_facet", "qti"."bound_zero", "qti"."built_in", "qti"."cardinality", "qti"."cn_base", "qti"."cn_part", "qti"."cn_part_form", "qti"."cn_type", "qti"."content_model", "qti"."declaration_kind", "qti"."document_type", "qti"."domain_primitive", "qti"."entry_kind", "qti"."flag", "qti"."follow_set", "qti"."governor", "qti"."href_scope", "qti"."identity", "qti"."include_set", "qti"."language", "qti"."node_kind", "qti"."position", "qti"."reference_form", "qti"."reference_resolution", "qti"."reference_spelling", "qti"."referenced_table", "qti"."resource_type", "qti"."rounding_holds", "qti"."rp_template", "qti"."shared_model", "qti"."symbol_set", "qti"."type_name", "qti"."use", "qti"."value_base", "qti"."value_cardinality", "qti"."value_domain", "qti"."xml_standalone", "qti"."__text_xj3zno7u3h", "qti"."__text_c6iptmtj2x", "qti"."__text_wchibbb5qm", "qti"."__text_4s4od7s5or", "qti"."__text_qswrkft5qs", "qti"."__text_76pfa5avf4", "qti"."__text_gke7uypkov", "qti"."__text_l7nqeazg5h", "qti"."__text_k5kwygzatl", "qti"."__text_7dfilirtp3", "qti"."__text_7j6kgluyjp", "qti"."__text_xey6ryorh5", "qti"."__text_oq3spimary", "qti"."__text_lnwfx5ijx4", "qti"."__text_lkpwkpgaib", "qti"."__text_w7a4l3clst", "qti"."__text_psn65t7m7e", "qti"."__text_23rzixl3a2", "qti"."__text_6zspo66rxv", "qti"."__text_vrcyezm7ka", "qti"."__text_7cbjao7rjc", "qti"."__text_zij47sgley", "qti"."__text_b6ykamoeho", "qti"."__text_xv5q2k3cum", "qti"."__text_3dlgl63rv6", "qti"."__text_mvb6rz2wwz", "qti"."__text_aezrarw5qb", "qti"."__text_3adwbksayk" TO :"qti_queries__author";

GRANT SELECT ON TABLE "qti_queries__author"."assembled_catalog", "qti_queries__author"."assessment_object", "qti_queries__author"."attribute", "qti_queries__author"."attribute_entity", "qti_queries__author"."binding_base_type", "qti_queries__author"."binding_cardinality", "qti_queries__author"."binding_declaration", "qti_queries__author"."binding_name", "qti_queries__author"."bound_variable", "qti_queries__author"."candidate_path", "qti_queries__author"."card_support", "qti_queries__author"."catalog_id", "qti_queries__author"."catalog_ref", "qti_queries__author"."catalog_scope", "qti_queries__author"."catalog_target", "qti_queries__author"."cell_headers", "qti_queries__author"."cell_leaf", "qti_queries__author"."choice", "qti_queries__author"."choice_interaction", "qti_queries__author"."cn_attribute", "qti_queries__author"."cn_count", "qti_queries__author"."cn_part_text", "qti_queries__author"."cn_slot", "qti_queries__author"."comment", "qti_queries__author"."context_ref", "qti_queries__author"."context_ref_declaration", "qti_queries__author"."count_bound", "qti_queries__author"."data_ssml", "qti_queries__author"."data_ssml_member", "qti_queries__author"."data_ssml_property", "qti_queries__author"."declaration", "qti_queries__author"."declaration_base_type", "qti_queries__author"."declaration_cardinality", "qti_queries__author"."declaration_identifier", "qti_queries__author"."declaration_name", "qti_queries__author"."default_entry", "qti_queries__author"."dependency", "qti_queries__author"."doctype", "qti_queries__author"."document", "qti_queries__author"."document_id", "qti_queries__author"."element_type", "qti_queries__author"."encoding_decl", "qti_queries__author"."entry", "qti_queries__author"."expression", "qti_queries__author"."expression_attribute", "qti_queries__author"."feedback_ref", "qti_queries__author"."feedback_ref_cardinality", "qti_queries__author"."feedback_ref_declaration", "qti_queries__author"."file", "qti_queries__author"."fragment_context_name", "qti_queries__author"."fragment_context_ref", "qti_queries__author"."fragment_context_ref_declaration", "qti_queries__author"."fragment_feedback_name", "qti_queries__author"."fragment_feedback_ref", "qti_queries__author"."fragment_feedback_ref_cardinality", "qti_queries__author"."fragment_feedback_ref_declaration", "qti_queries__author"."fragment_printed_name", "qti_queries__author"."fragment_printed_ref", "qti_queries__author"."fragment_printed_ref_declaration", "qti_queries__author"."fragment_scope", "qti_queries__author"."fragment_template_name", "qti_queries__author"."fragment_template_ref", "qti_queries__author"."fragment_template_ref_cardinality", "qti_queries__author"."fragment_template_ref_declaration", "qti_queries__author"."header_token", "qti_queries__author"."hottext", "qti_queries__author"."identity_text", "qti_queries__author"."idref", "qti_queries__author"."idref_target", "qti_queries__author"."inclusion", "qti_queries__author"."instance", "qti_queries__author"."interaction", "qti_queries__author"."interaction_attribute", "qti_queries__author"."item_mode", "qti_queries__author"."item_ref_document", "qti_queries__author"."item_ref_href", "qti_queries__author"."label_use", "qti_queries__author"."least_count", "qti_queries__author"."literal", "qti_queries__author"."literal_typed", "qti_queries__author"."lookup_value", "qti_queries__author"."manifest_id", "qti_queries__author"."map_key", "qti_queries__author"."mastery_ceiling", "qti_queries__author"."mastery_floor", "qti_queries__author"."mastery_value", "qti_queries__author"."math_action", "qti_queries__author"."math_align_group", "qti_queries__author"."math_align_scope", "qti_queries__author"."math_cell", "qti_queries__author"."math_cn", "qti_queries__author"."math_dir", "qti_queries__author"."math_rank", "qti_queries__author"."media", "qti_queries__author"."most_count", "qti_queries__author"."named", "qti_queries__author"."namespace", "qti_queries__author"."node", "qti_queries__author"."normal_maximum", "qti_queries__author"."normal_minimum", "qti_queries__author"."object_identifier", "qti_queries__author"."object_title", "qti_queries__author"."open_attribute", "qti_queries__author"."open_attribute_entity", "qti_queries__author"."open_element_name", "qti_queries__author"."open_element_type", "qti_queries__author"."package", "qti_queries__author"."pci_module_form", "qti_queries__author"."pi", "qti_queries__author"."placed_binding", "qti_queries__author"."placed_binding_base_type", "qti_queries__author"."placed_binding_cardinality", "qti_queries__author"."placed_binding_declaration", "qti_queries__author"."placed_catalog_ref", "qti_queries__author"."placed_choice", "qti_queries__author"."placed_hottext", "qti_queries__author"."placed_id", "qti_queries__author"."placed_idref", "qti_queries__author"."placed_math_rank", "qti_queries__author"."placed_share_target", "qti_queries__author"."placed_variable_ref", "qti_queries__author"."placed_variable_ref_declaration", "qti_queries__author"."placed_xml_lang", "qti_queries__author"."printed_variable_ref", "qti_queries__author"."printed_variable_ref_declaration", "qti_queries__author"."processing", "qti_queries__author"."processing_template", "qti_queries__author"."record_field", "qti_queries__author"."reference", "qti_queries__author"."reference_path", "qti_queries__author"."referring_document", "qti_queries__author"."resource_document", "qti_queries__author"."resource_href", "qti_queries__author"."resource_id", "qti_queries__author"."resource_typed", "qti_queries__author"."rounding", "qti_queries__author"."rounding_figures", "qti_queries__author"."rounding_mode", "qti_queries__author"."rounding_mode_figures", "qti_queries__author"."sd_decl", "qti_queries__author"."share_fragment", "qti_queries__author"."share_target", "qti_queries__author"."site", "qti_queries__author"."site_path", "qti_queries__author"."site_target", "qti_queries__author"."srcset", "qti_queries__author"."srcset_candidate", "qti_queries__author"."ssml_attribute", "qti_queries__author"."ssml_scope", "qti_queries__author"."statistic_date", "qti_queries__author"."stimulus_ref", "qti_queries__author"."table_header", "qti_queries__author"."table_scope", "qti_queries__author"."template_ref", "qti_queries__author"."template_ref_cardinality", "qti_queries__author"."template_ref_declaration", "qti_queries__author"."test_document", "qti_queries__author"."test_token", "qti_queries__author"."text_idref", "qti_queries__author"."text_reference", "qti_queries__author"."text_reference_path", "qti_queries__author"."tolerance", "qti_queries__author"."tolerance_token", "qti_queries__author"."usage_base_type", "qti_queries__author"."usage_value", "qti_queries__author"."usage_value_base_type", "qti_queries__author"."value_base_type", "qti_queries__author"."variable_ref", "qti_queries__author"."variable_ref_cardinality", "qti_queries__author"."variable_ref_declaration", "qti_queries__author"."variable_ref_table", "qti_queries__author"."xml_decl", "qti_queries__author"."xml_lang" TO :"qti_queries__author";

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

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."lookup_value" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."manifest_id" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."map_key" TO :"qti_queries__author";

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

REVOKE ALL ON TABLE "qti"."assembled_catalog", "qti"."assessment_object", "qti"."attribute", "qti"."attribute_entity", "qti"."binding_base_type", "qti"."binding_cardinality", "qti"."binding_declaration", "qti"."binding_name", "qti"."bound_variable", "qti"."candidate_path", "qti"."card_support", "qti"."catalog_id", "qti"."catalog_ref", "qti"."catalog_scope", "qti"."catalog_target", "qti"."cell_headers", "qti"."cell_leaf", "qti"."choice", "qti"."choice_interaction", "qti"."cn_attribute", "qti"."cn_count", "qti"."cn_part_text", "qti"."cn_slot", "qti"."comment", "qti"."context_ref", "qti"."context_ref_declaration", "qti"."count_bound", "qti"."data_ssml", "qti"."data_ssml_member", "qti"."data_ssml_property", "qti"."declaration", "qti"."declaration_base_type", "qti"."declaration_cardinality", "qti"."declaration_identifier", "qti"."declaration_name", "qti"."default_entry", "qti"."dependency", "qti"."doctype", "qti"."document", "qti"."document_id", "qti"."element_type", "qti"."encoding_decl", "qti"."entry", "qti"."expression", "qti"."expression_attribute", "qti"."feedback_ref", "qti"."feedback_ref_cardinality", "qti"."feedback_ref_declaration", "qti"."file", "qti"."fragment_context_name", "qti"."fragment_context_ref", "qti"."fragment_context_ref_declaration", "qti"."fragment_feedback_name", "qti"."fragment_feedback_ref", "qti"."fragment_feedback_ref_cardinality", "qti"."fragment_feedback_ref_declaration", "qti"."fragment_printed_name", "qti"."fragment_printed_ref", "qti"."fragment_printed_ref_declaration", "qti"."fragment_scope", "qti"."fragment_template_name", "qti"."fragment_template_ref", "qti"."fragment_template_ref_cardinality", "qti"."fragment_template_ref_declaration", "qti"."header_token", "qti"."hottext", "qti"."identity_text", "qti"."idref", "qti"."idref_target", "qti"."inclusion", "qti"."instance", "qti"."interaction", "qti"."interaction_attribute", "qti"."item_mode", "qti"."item_ref_document", "qti"."item_ref_href", "qti"."label_use", "qti"."least_count", "qti"."literal", "qti"."literal_typed", "qti"."lookup_value", "qti"."manifest_id", "qti"."map_key", "qti"."mastery_ceiling", "qti"."mastery_floor", "qti"."mastery_value", "qti"."math_action", "qti"."math_align_group", "qti"."math_align_scope", "qti"."math_cell", "qti"."math_cn", "qti"."math_dir", "qti"."math_rank", "qti"."media", "qti"."most_count", "qti"."named", "qti"."namespace", "qti"."node", "qti"."normal_maximum", "qti"."normal_minimum", "qti"."object_identifier", "qti"."object_title", "qti"."open_attribute", "qti"."open_attribute_entity", "qti"."open_element_name", "qti"."open_element_type", "qti"."package", "qti"."pci_module_form", "qti"."pi", "qti"."placed_binding", "qti"."placed_binding_base_type", "qti"."placed_binding_cardinality", "qti"."placed_binding_declaration", "qti"."placed_catalog_ref", "qti"."placed_choice", "qti"."placed_hottext", "qti"."placed_id", "qti"."placed_idref", "qti"."placed_math_rank", "qti"."placed_share_target", "qti"."placed_variable_ref", "qti"."placed_variable_ref_declaration", "qti"."placed_xml_lang", "qti"."printed_variable_ref", "qti"."printed_variable_ref_declaration", "qti"."processing", "qti"."processing_template", "qti"."record_field", "qti"."reference", "qti"."reference_path", "qti"."referring_document", "qti"."resource_document", "qti"."resource_href", "qti"."resource_id", "qti"."resource_typed", "qti"."rounding", "qti"."rounding_figures", "qti"."rounding_mode", "qti"."rounding_mode_figures", "qti"."sd_decl", "qti"."share_fragment", "qti"."share_target", "qti"."site", "qti"."site_path", "qti"."site_target", "qti"."srcset", "qti"."srcset_candidate", "qti"."ssml_attribute", "qti"."ssml_scope", "qti"."statistic_date", "qti"."stimulus_ref", "qti"."table_header", "qti"."table_scope", "qti"."template_ref", "qti"."template_ref_cardinality", "qti"."template_ref_declaration", "qti"."test_document", "qti"."test_token", "qti"."text_idref", "qti"."text_reference", "qti"."text_reference_path", "qti"."tolerance", "qti"."tolerance_token", "qti"."usage_base_type", "qti"."usage_value", "qti"."usage_value_base_type", "qti"."value_base_type", "qti"."variable_ref", "qti"."variable_ref_cardinality", "qti"."variable_ref_declaration", "qti"."variable_ref_table", "qti"."xml_decl", "qti"."xml_lang", "qti_queries__author"."assembled_catalog", "qti_queries__author"."assessment_object", "qti_queries__author"."attribute", "qti_queries__author"."attribute_entity", "qti_queries__author"."binding_base_type", "qti_queries__author"."binding_cardinality", "qti_queries__author"."binding_declaration", "qti_queries__author"."binding_name", "qti_queries__author"."bound_variable", "qti_queries__author"."candidate_path", "qti_queries__author"."card_support", "qti_queries__author"."catalog_id", "qti_queries__author"."catalog_ref", "qti_queries__author"."catalog_scope", "qti_queries__author"."catalog_target", "qti_queries__author"."cell_headers", "qti_queries__author"."cell_leaf", "qti_queries__author"."choice", "qti_queries__author"."choice_interaction", "qti_queries__author"."cn_attribute", "qti_queries__author"."cn_count", "qti_queries__author"."cn_part_text", "qti_queries__author"."cn_slot", "qti_queries__author"."comment", "qti_queries__author"."context_ref", "qti_queries__author"."context_ref_declaration", "qti_queries__author"."count_bound", "qti_queries__author"."data_ssml", "qti_queries__author"."data_ssml_member", "qti_queries__author"."data_ssml_property", "qti_queries__author"."declaration", "qti_queries__author"."declaration_base_type", "qti_queries__author"."declaration_cardinality", "qti_queries__author"."declaration_identifier", "qti_queries__author"."declaration_name", "qti_queries__author"."default_entry", "qti_queries__author"."dependency", "qti_queries__author"."doctype", "qti_queries__author"."document", "qti_queries__author"."document_id", "qti_queries__author"."element_type", "qti_queries__author"."encoding_decl", "qti_queries__author"."entry", "qti_queries__author"."expression", "qti_queries__author"."expression_attribute", "qti_queries__author"."feedback_ref", "qti_queries__author"."feedback_ref_cardinality", "qti_queries__author"."feedback_ref_declaration", "qti_queries__author"."file", "qti_queries__author"."fragment_context_name", "qti_queries__author"."fragment_context_ref", "qti_queries__author"."fragment_context_ref_declaration", "qti_queries__author"."fragment_feedback_name", "qti_queries__author"."fragment_feedback_ref", "qti_queries__author"."fragment_feedback_ref_cardinality", "qti_queries__author"."fragment_feedback_ref_declaration", "qti_queries__author"."fragment_printed_name", "qti_queries__author"."fragment_printed_ref", "qti_queries__author"."fragment_printed_ref_declaration", "qti_queries__author"."fragment_scope", "qti_queries__author"."fragment_template_name", "qti_queries__author"."fragment_template_ref", "qti_queries__author"."fragment_template_ref_cardinality", "qti_queries__author"."fragment_template_ref_declaration", "qti_queries__author"."header_token", "qti_queries__author"."hottext", "qti_queries__author"."identity_text", "qti_queries__author"."idref", "qti_queries__author"."idref_target", "qti_queries__author"."inclusion", "qti_queries__author"."instance", "qti_queries__author"."interaction", "qti_queries__author"."interaction_attribute", "qti_queries__author"."item_mode", "qti_queries__author"."item_ref_document", "qti_queries__author"."item_ref_href", "qti_queries__author"."label_use", "qti_queries__author"."least_count", "qti_queries__author"."literal", "qti_queries__author"."literal_typed", "qti_queries__author"."lookup_value", "qti_queries__author"."manifest_id", "qti_queries__author"."map_key", "qti_queries__author"."mastery_ceiling", "qti_queries__author"."mastery_floor", "qti_queries__author"."mastery_value", "qti_queries__author"."math_action", "qti_queries__author"."math_align_group", "qti_queries__author"."math_align_scope", "qti_queries__author"."math_cell", "qti_queries__author"."math_cn", "qti_queries__author"."math_dir", "qti_queries__author"."math_rank", "qti_queries__author"."media", "qti_queries__author"."most_count", "qti_queries__author"."named", "qti_queries__author"."namespace", "qti_queries__author"."node", "qti_queries__author"."normal_maximum", "qti_queries__author"."normal_minimum", "qti_queries__author"."object_identifier", "qti_queries__author"."object_title", "qti_queries__author"."open_attribute", "qti_queries__author"."open_attribute_entity", "qti_queries__author"."open_element_name", "qti_queries__author"."open_element_type", "qti_queries__author"."package", "qti_queries__author"."pci_module_form", "qti_queries__author"."pi", "qti_queries__author"."placed_binding", "qti_queries__author"."placed_binding_base_type", "qti_queries__author"."placed_binding_cardinality", "qti_queries__author"."placed_binding_declaration", "qti_queries__author"."placed_catalog_ref", "qti_queries__author"."placed_choice", "qti_queries__author"."placed_hottext", "qti_queries__author"."placed_id", "qti_queries__author"."placed_idref", "qti_queries__author"."placed_math_rank", "qti_queries__author"."placed_share_target", "qti_queries__author"."placed_variable_ref", "qti_queries__author"."placed_variable_ref_declaration", "qti_queries__author"."placed_xml_lang", "qti_queries__author"."printed_variable_ref", "qti_queries__author"."printed_variable_ref_declaration", "qti_queries__author"."processing", "qti_queries__author"."processing_template", "qti_queries__author"."record_field", "qti_queries__author"."reference", "qti_queries__author"."reference_path", "qti_queries__author"."referring_document", "qti_queries__author"."resource_document", "qti_queries__author"."resource_href", "qti_queries__author"."resource_id", "qti_queries__author"."resource_typed", "qti_queries__author"."rounding", "qti_queries__author"."rounding_figures", "qti_queries__author"."rounding_mode", "qti_queries__author"."rounding_mode_figures", "qti_queries__author"."sd_decl", "qti_queries__author"."share_fragment", "qti_queries__author"."share_target", "qti_queries__author"."site", "qti_queries__author"."site_path", "qti_queries__author"."site_target", "qti_queries__author"."srcset", "qti_queries__author"."srcset_candidate", "qti_queries__author"."ssml_attribute", "qti_queries__author"."ssml_scope", "qti_queries__author"."statistic_date", "qti_queries__author"."stimulus_ref", "qti_queries__author"."table_header", "qti_queries__author"."table_scope", "qti_queries__author"."template_ref", "qti_queries__author"."template_ref_cardinality", "qti_queries__author"."template_ref_declaration", "qti_queries__author"."test_document", "qti_queries__author"."test_token", "qti_queries__author"."text_idref", "qti_queries__author"."text_reference", "qti_queries__author"."text_reference_path", "qti_queries__author"."tolerance", "qti_queries__author"."tolerance_token", "qti_queries__author"."usage_base_type", "qti_queries__author"."usage_value", "qti_queries__author"."usage_value_base_type", "qti_queries__author"."value_base_type", "qti_queries__author"."variable_ref", "qti_queries__author"."variable_ref_cardinality", "qti_queries__author"."variable_ref_declaration", "qti_queries__author"."variable_ref_table", "qti_queries__author"."xml_decl", "qti_queries__author"."xml_lang" FROM PUBLIC;

REVOKE ALL ON DOMAIN "qti"."admission_map", "qti"."align_direction", "qti"."align_state", "qti"."attribute_model", "qti"."attribute_name", "qti"."__attribute_name_bits_416_thr6i6sipt", "qti"."attribute_slot", "qti"."__attribute_slot_bits_112_aecznthxg5", "qti"."base_type", "qti"."bound_facet", "qti"."bound_zero", "qti"."built_in", "qti"."cardinality", "qti"."cn_base", "qti"."cn_part", "qti"."cn_part_form", "qti"."cn_type", "qti"."content_model", "qti"."declaration_kind", "qti"."document_type", "qti"."domain_primitive", "qti"."entry_kind", "qti"."flag", "qti"."__flag_bits_12_i4uhexylc4", "qti"."follow_set", "qti"."governor", "qti"."href_scope", "qti"."identity", "qti"."include_set", "qti"."language", "qti"."node_kind", "qti"."__node_kind_bits_644_kcdmigfwqm", "qti"."position", "qti"."__position_bits_308_gsnowf36kr", "qti"."reference_form", "qti"."reference_resolution", "qti"."reference_spelling", "qti"."referenced_table", "qti"."resource_type", "qti"."rounding_holds", "qti"."rp_template", "qti"."shared_model", "qti"."symbol_set", "qti"."type_name", "qti"."use", "qti"."value_base", "qti"."__value_base_bits_16_7t6pwwxbsh", "qti"."value_cardinality", "qti"."__value_cardinality_bits_8_mma4mwhphy", "qti"."value_domain", "qti"."xml_standalone", "qti"."__text_6zspo66rxv", "qti"."__text_lnwfx5ijx4", "qti"."__text_xv5q2k3cum", "qti"."__text_c6iptmtj2x", "qti"."__text_wchibbb5qm", "qti"."__text_xj3zno7u3h", "qti"."__text_7j6kgluyjp", "qti"."__text_l7nqeazg5h", "qti"."__text_xey6ryorh5", "qti"."__text_7dfilirtp3", "qti"."__text_sac6h6c6eh", "qti"."__text_oq3spimary", "qti"."__text_vrcyezm7ka", "qti"."__text_zij47sgley", "qti"."__text_gke7uypkov", "qti"."__text_76pfa5avf4", "qti"."__text_mvb6rz2wwz", "qti"."__text_qswrkft5qs", "qti"."__text_7cbjao7rjc", "qti"."__text_w7a4l3clst", "qti"."__text_23rzixl3a2", "qti"."__text_3adwbksayk", "qti"."__text_k5kwygzatl", "qti"."__text_b6ykamoeho", "qti"."__text_4s4od7s5or", "qti"."__text_lkpwkpgaib", "qti"."__text_psn65t7m7e", "qti"."__text_3dlgl63rv6", "qti"."__text_aezrarw5qb", "qti"."__domain_gfw43vigph", "qti"."__param_package_ulo5hrttvh", "qti"."__param_path_wphbbw3r67", "qti"."__param_name_tch4oix6gh" FROM PUBLIC;

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

DROP TRIGGER "__capture_update" ON "qti"."mapping_cardinality";

DROP TRIGGER "__capture_insert" ON "qti"."mapping_cardinality";

DROP TRIGGER "__capture_delete" ON "qti"."mapping_cardinality";

DROP TRIGGER "__capture_update" ON "qti"."mapping_base_type";

DROP TRIGGER "__capture_insert" ON "qti"."mapping_base_type";

DROP TRIGGER "__capture_delete" ON "qti"."mapping_base_type";

DROP TRIGGER "__capture_update" ON "qti"."mapping";

DROP TRIGGER "__capture_insert" ON "qti"."mapping";

DROP TRIGGER "__capture_delete" ON "qti"."mapping";

DROP TRIGGER "__capture_update" ON "qti"."map_key_type";

DROP TRIGGER "__capture_insert" ON "qti"."map_key_type";

DROP TRIGGER "__capture_delete" ON "qti"."map_key_type";

DROP TRIGGER "__capture_update" ON "qti"."lookup_value_type";

DROP TRIGGER "__capture_insert" ON "qti"."lookup_value_type";

DROP TRIGGER "__capture_delete" ON "qti"."lookup_value_type";

DROP TRIGGER "__capture_update" ON "qti"."lookup_table_cardinality";

DROP TRIGGER "__capture_insert" ON "qti"."lookup_table_cardinality";

DROP TRIGGER "__capture_delete" ON "qti"."lookup_table_cardinality";

DROP TRIGGER "__capture_update" ON "qti"."lookup_table";

DROP TRIGGER "__capture_insert" ON "qti"."lookup_table";

DROP TRIGGER "__capture_delete" ON "qti"."lookup_table";

DROP TRIGGER "__capture_update" ON "qti"."area_mapping_cardinality";

DROP TRIGGER "__capture_insert" ON "qti"."area_mapping_cardinality";

DROP TRIGGER "__capture_delete" ON "qti"."area_mapping_cardinality";

DROP TRIGGER "__capture_update" ON "qti"."area_mapping";

DROP TRIGGER "__capture_insert" ON "qti"."area_mapping";

DROP TRIGGER "__capture_delete" ON "qti"."area_mapping";

DROP TRIGGER "__isolation" ON "qti"."mapping_cardinality";

DROP TRIGGER "__isolation" ON "qti"."mapping_base_type";

DROP TRIGGER "__isolation" ON "qti"."mapping";

DROP TRIGGER "__isolation" ON "qti"."map_key_type";

DROP TRIGGER "__isolation" ON "qti"."lookup_value_type";

DROP TRIGGER "__isolation" ON "qti"."lookup_table_cardinality";

DROP TRIGGER "__isolation" ON "qti"."lookup_table";

DROP TRIGGER "__isolation" ON "qti"."area_mapping_cardinality";

DROP TRIGGER "__isolation" ON "qti"."area_mapping";

DROP INDEX "qti"."__area_mapping_ix_package_path_base_types_atzmyknytx";

DROP FUNCTION "qti"."__capture_mapping_cardinality_ijzqojno4x"() RESTRICT;

DROP FUNCTION "qti"."__capture_mapping_base_type_xm6qm4j53s"() RESTRICT;

DROP FUNCTION "qti"."__capture_mapping_nga6fezfhz"() RESTRICT;

DROP FUNCTION "qti"."__capture_map_key_type_td7lkzsbpe"() RESTRICT;

DROP FUNCTION "qti"."__capture_lookup_value_type_4mse35hc2w"() RESTRICT;

DROP FUNCTION "qti"."__capture_lookup_table_cardinality_xwecrfprt5"() RESTRICT;

DROP FUNCTION "qti"."__capture_lookup_table_ec2wucq7zc"() RESTRICT;

DROP FUNCTION "qti"."__capture_area_mapping_cardinality_i5opxkf6do"() RESTRICT;

DROP FUNCTION "qti"."__capture_area_mapping_axqnzlexgs"() RESTRICT;

ALTER TABLE "qti"."map_key" DROP COLUMN "base_types";

ALTER TABLE "qti"."lookup_value" DROP COLUMN "base_types";

DROP TABLE "qti"."mapping_cardinality";

DROP TABLE "qti"."mapping_base_type";

DROP TABLE "qti"."mapping";

DROP TABLE "qti"."map_key_type";

DROP TABLE "qti"."lookup_value_type";

DROP TABLE "qti"."lookup_table_cardinality";

DROP TABLE "qti"."lookup_table";

DROP TABLE "qti"."area_mapping_cardinality";

DROP TABLE "qti"."area_mapping";

COMMENT ON DOMAIN "qti"."__text_oq3spimary" IS 'text domain of definition 4bedf154c7ec420e14361267e240aff7e7662e87abeb0e0e202bfb3570bda883';

COMMENT ON CONSTRAINT "__identity_text_check_identity_text_tokens_concat_qc2rvb6wft" ON "qti"."identity_text" IS 'check of IdentityText for law concat fold over fin(IdentityText, tokens) of TextIdref(package, path, start, piece, piecesWas, piecesAfter) into IdentityText(package, path, start, tokenText)';

COMMENT ON CONSTRAINT "__identity_text_key_package_path_start_tokens_5pavpyeu7f" ON "qti"."identity_text" IS 'key IdentityText(package, path, start, tokens)';

COMMENT ON CONSTRAINT "__srcset_check_srcset_tokens_concat_fold_7x5nzmr2a5" ON "qti"."srcset" IS 'check of Srcset for law concat fold over fin(Srcset, tokens) of SrcsetCandidate(package, path, start, piece, piecesWas, piecesAfter) into Srcset(package, path, start, tokenText)';

COMMENT ON CONSTRAINT "__srcset_key_package_path_start_tokens_7vcwtlqzy2" ON "qti"."srcset" IS 'key Srcset(package, path, start, tokens)';

COMMENT ON CONSTRAINT "__srcset_candidate_check_srcset_tokens_concat_fold_jthorh3gv6" ON "qti"."srcset_candidate" IS 'check of SrcsetCandidate for law concat fold over fin(Srcset, tokens) of SrcsetCandidate(package, path, start, piece, piecesWas, piecesAfter) into Srcset(package, path, start, tokenText)';

COMMENT ON CONSTRAINT "__text_idref_check_identity_text_tokens_concat_fold_tizgwsxdoc" ON "qti"."text_idref" IS 'check of TextIdref for law concat fold over fin(IdentityText, tokens) of TextIdref(package, path, start, piece, piecesWas, piecesAfter) into IdentityText(package, path, start, tokenText)';

COMMENT ON COLUMN "qti"."identity_text"."__pred_tokens_ip7mlgrtju" IS 'pred(tokens)';

COMMENT ON COLUMN "qti"."srcset"."__pred_tokens_ip7mlgrtju" IS 'pred(tokens)';

COMMENT ON COLUMN "qti"."srcset_candidate"."__copy_tokens_mhv3zj45jr" IS 'the owner''s count of the family Srcset.tokens';

COMMENT ON COLUMN "qti"."text_idref"."__copy_tokens_rrsly23qzp" IS 'the owner''s count of the family IdentityText.tokens';

COMMENT ON CONSTRAINT "__srcset_candidate_check_srcset_candidate_ordered_muwkwohqto" ON "qti"."srcset_candidate" IS 'check of SrcsetCandidate for law ordered SrcsetCandidate(package, path, start, at) in fin(Srcset, tokens)';

COMMENT ON CONSTRAINT "__text_idref_check_text_idref_ordered_identity_text_j6a2rgc35g" ON "qti"."text_idref" IS 'check of TextIdref for law ordered TextIdref(package, path, start, at) in fin(IdentityText, tokens)';

COMMENT ON CONSTRAINT "__identity_text_fk_package_path_start_pred_tokens_fdvwocjp2o" ON "qti"."identity_text" IS 'foreign key IdentityText(package, path, start, pred(tokens), tokenText) to TextIdref(package, path, start, at, piecesAfter)';

COMMENT ON CONSTRAINT "__srcset_fk_package_path_start_pred_tokens_token_gxpdnzadwg" ON "qti"."srcset" IS 'foreign key Srcset(package, path, start, pred(tokens), tokenText) to SrcsetCandidate(package, path, start, at, piecesAfter)';

COMMENT ON CONSTRAINT "__srcset_candidate_fk_package_path_start_copy_tokens_prty6vocql" ON "qti"."srcset_candidate" IS 'foreign key SrcsetCandidate(package, path, start, the owner''s count of the family Srcset.tokens) to Srcset(package, path, start, tokens)';

COMMENT ON CONSTRAINT "__text_idref_fk_package_path_start_copy_tokens_hkmj36vgbn" ON "qti"."text_idref" IS 'foreign key TextIdref(package, path, start, the owner''s count of the family IdentityText.tokens) to IdentityText(package, path, start, tokens)';

COMMENT ON FUNCTION "qti"."__capture_identity_text_h5x3ut4jpk"() IS 'rule capture of IdentityText';

COMMENT ON FUNCTION "qti"."__capture_lookup_value_f3rrvlw7j7"() IS 'rule capture of LookupValue';

COMMENT ON FUNCTION "qti"."__capture_map_key_gtfuz4lzxt"() IS 'rule capture of MapKey';

COMMENT ON FUNCTION "qti"."__capture_node_7sghxk2dxj"() IS 'rule capture of Node';

COMMENT ON FUNCTION "qti"."__capture_srcset_i23xwowlg4"() IS 'rule capture of Srcset';
