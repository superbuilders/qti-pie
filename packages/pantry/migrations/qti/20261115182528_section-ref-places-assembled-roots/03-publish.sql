SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
REVOKE USAGE ON SCHEMA "qti", "qti_queries", "qti_queries__author" FROM :"qti_queries__author";

REVOKE USAGE ON DOMAIN "qti"."__attribute_slot_bits_112_aecznthxg5", "qti"."__flag_bits_12_i4uhexylc4", "qti"."__value_base_bits_16_7t6pwwxbsh", "qti"."__value_cardinality_bits_8_mma4mwhphy", "qti"."__domain_gfw43vigph", "qti"."admission_map", "qti"."align_direction", "qti"."align_state", "qti"."attribute_model", "qti"."attribute_name", "qti"."attribute_slot", "qti"."base_type", "qti"."bound_facet", "qti"."bound_zero", "qti"."built_in", "qti"."cardinality", "qti"."cn_base", "qti"."cn_part", "qti"."cn_part_form", "qti"."cn_type", "qti"."content_model", "qti"."declaration_kind", "qti"."document_type", "qti"."domain_primitive", "qti"."flag", "qti"."follow_set", "qti"."governor", "qti"."href_scope", "qti"."identity", "qti"."include_set", "qti"."language", "qti"."node_kind", "qti"."position", "qti"."reading_form", "qti"."reading_source", "qti"."reference_form", "qti"."reference_resolution", "qti"."reference_role", "qti"."reference_spelling", "qti"."referenced_table", "qti"."resource_type", "qti"."rounding_holds", "qti"."rp_template", "qti"."schema_version", "qti"."shared_model", "qti"."symbol_set", "qti"."type_name", "qti"."use", "qti"."value_base", "qti"."value_cardinality", "qti"."value_domain", "qti"."xml_standalone", "qti"."__text_xj3zno7u3h", "qti"."__text_c6iptmtj2x", "qti"."__text_wchibbb5qm", "qti"."__text_4s4od7s5or", "qti"."__text_qswrkft5qs", "qti"."__text_76pfa5avf4", "qti"."__text_gke7uypkov", "qti"."__text_mqbstvk5ay", "qti"."__text_l7nqeazg5h", "qti"."__text_k5kwygzatl", "qti"."__text_7dfilirtp3", "qti"."__text_xisvziygi3", "qti"."__text_7j6kgluyjp", "qti"."__text_xey6ryorh5", "qti"."__text_lnwfx5ijx4", "qti"."__text_lkpwkpgaib", "qti"."__text_w7a4l3clst", "qti"."__text_psn65t7m7e", "qti"."__text_23rzixl3a2", "qti"."__text_6zspo66rxv", "qti"."__text_vrcyezm7ka", "qti"."__text_zij47sgley", "qti"."__text_b6ykamoeho", "qti"."__text_xv5q2k3cum", "qti"."__text_3dlgl63rv6", "qti"."__text_mvb6rz2wwz", "qti"."__text_aezrarw5qb", "qti"."__text_3adwbksayk" FROM :"qti_queries__author";

REVOKE SELECT ON TABLE "qti_queries__author"."area_mapping", "qti_queries__author"."area_mapping_cardinality", "qti_queries__author"."aria_element", "qti_queries__author"."aria_range", "qti_queries__author"."aria_value", "qti_queries__author"."assembled_catalog", "qti_queries__author"."assembled_id", "qti_queries__author"."assembled_lang", "qti_queries__author"."assembled_name", "qti_queries__author"."assembled_reference", "qti_queries__author"."assessment_object", "qti_queries__author"."attribute", "qti_queries__author"."attribute_entity", "qti_queries__author"."binding", "qti_queries__author"."binding_base_type", "qti_queries__author"."binding_cardinality", "qti_queries__author"."binding_declaration", "qti_queries__author"."binding_name", "qti_queries__author"."body_xml_lang", "qti_queries__author"."bound_variable", "qti_queries__author"."branch_resolution", "qti_queries__author"."branch_rule", "qti_queries__author"."branch_shuffle", "qti_queries__author"."branch_target", "qti_queries__author"."candidate_path", "qti_queries__author"."card_support", "qti_queries__author"."catalog_id", "qti_queries__author"."catalog_ref", "qti_queries__author"."catalog_scope", "qti_queries__author"."catalog_target", "qti_queries__author"."cell_headers", "qti_queries__author"."cell_leaf", "qti_queries__author"."choice", "qti_queries__author"."choice_interaction", "qti_queries__author"."cn_attribute", "qti_queries__author"."cn_count", "qti_queries__author"."cn_part_text", "qti_queries__author"."cn_slot", "qti_queries__author"."comment", "qti_queries__author"."context_ref", "qti_queries__author"."context_ref_declaration", "qti_queries__author"."count_bound", "qti_queries__author"."count_range", "qti_queries__author"."data_ssml", "qti_queries__author"."data_ssml_member", "qti_queries__author"."data_ssml_property", "qti_queries__author"."declaration", "qti_queries__author"."declaration_base_type", "qti_queries__author"."declaration_cardinality", "qti_queries__author"."declaration_identifier", "qti_queries__author"."declaration_name", "qti_queries__author"."default_entry", "qti_queries__author"."dependency", "qti_queries__author"."dependency_target", "qti_queries__author"."doctype", "qti_queries__author"."document", "qti_queries__author"."document_id", "qti_queries__author"."document_lang", "qti_queries__author"."element_type", "qti_queries__author"."encoding_decl", "qti_queries__author"."entry", "qti_queries__author"."expression", "qti_queries__author"."expression_attribute", "qti_queries__author"."feedback_ref", "qti_queries__author"."feedback_ref_cardinality", "qti_queries__author"."feedback_ref_declaration", "qti_queries__author"."field_value", "qti_queries__author"."file", "qti_queries__author"."file_href", "qti_queries__author"."fragment_value", "qti_queries__author"."gap_interaction", "qti_queries__author"."header_token", "qti_queries__author"."hotspot", "qti_queries__author"."hottext", "qti_queries__author"."id_binding", "qti_queries__author"."identity_text", "qti_queries__author"."idref", "qti_queries__author"."idref_target", "qti_queries__author"."inclusion", "qti_queries__author"."instance", "qti_queries__author"."instance_name", "qti_queries__author"."interaction", "qti_queries__author"."interaction_attribute", "qti_queries__author"."item_mode", "qti_queries__author"."item_ref_document", "qti_queries__author"."item_ref_href", "qti_queries__author"."label_use", "qti_queries__author"."least_count", "qti_queries__author"."literal", "qti_queries__author"."literal_typed", "qti_queries__author"."lom_entry", "qti_queries__author"."lom_general", "qti_queries__author"."lom_language", "qti_queries__author"."lom_record", "qti_queries__author"."lom_resource_type", "qti_queries__author"."lom_resource_type_source", "qti_queries__author"."lom_string", "qti_queries__author"."lom_string_language", "qti_queries__author"."lom_title", "qti_queries__author"."lom_title_string", "qti_queries__author"."lookup_table", "qti_queries__author"."lookup_table_cardinality", "qti_queries__author"."lookup_value", "qti_queries__author"."lookup_value_type", "qti_queries__author"."manifest_id", "qti_queries__author"."map_key", "qti_queries__author"."map_key_type", "qti_queries__author"."mapping", "qti_queries__author"."mapping_base_type", "qti_queries__author"."mapping_cardinality", "qti_queries__author"."mapping_item_ref", "qti_queries__author"."mapping_item_ref_type", "qti_queries__author"."mapping_source_declaration", "qti_queries__author"."mastery_ceiling", "qti_queries__author"."mastery_floor", "qti_queries__author"."mastery_value", "qti_queries__author"."math_action", "qti_queries__author"."math_align_group", "qti_queries__author"."math_align_scope", "qti_queries__author"."math_apply", "qti_queries__author"."math_argument", "qti_queries__author"."math_cell", "qti_queries__author"."math_cn", "qti_queries__author"."math_dir", "qti_queries__author"."math_qualifier", "qti_queries__author"."math_rank", "qti_queries__author"."most_count", "qti_queries__author"."named", "qti_queries__author"."namespace", "qti_queries__author"."node", "qti_queries__author"."normal_maximum", "qti_queries__author"."normal_minimum", "qti_queries__author"."object_identifier", "qti_queries__author"."object_lang", "qti_queries__author"."object_title", "qti_queries__author"."open_attribute", "qti_queries__author"."open_attribute_entity", "qti_queries__author"."open_element_name", "qti_queries__author"."open_element_type", "qti_queries__author"."operand", "qti_queries__author"."package", "qti_queries__author"."pci_module_form", "qti_queries__author"."pi", "qti_queries__author"."placed_binding", "qti_queries__author"."placed_binding_base_type", "qti_queries__author"."placed_binding_cardinality", "qti_queries__author"."placed_binding_declaration", "qti_queries__author"."placed_body_xml_lang", "qti_queries__author"."placed_catalog_ref", "qti_queries__author"."placed_choice", "qti_queries__author"."placed_document", "qti_queries__author"."placed_hottext", "qti_queries__author"."placed_id", "qti_queries__author"."placed_idref", "qti_queries__author"."placed_math_rank", "qti_queries__author"."placed_reference", "qti_queries__author"."placed_share_target", "qti_queries__author"."placed_variable_ref", "qti_queries__author"."placed_variable_ref_declaration", "qti_queries__author"."placed_xml_lang", "qti_queries__author"."printed_variable_ref", "qti_queries__author"."printed_variable_ref_declaration", "qti_queries__author"."processing", "qti_queries__author"."processing_template", "qti_queries__author"."quotation", "qti_queries__author"."reading", "qti_queries__author"."reading_cardinality", "qti_queries__author"."reading_declaration", "qti_queries__author"."record_field", "qti_queries__author"."record_field_name", "qti_queries__author"."reference", "qti_queries__author"."reference_document", "qti_queries__author"."reference_path", "qti_queries__author"."reference_segment", "qti_queries__author"."referring_document", "qti_queries__author"."resource", "qti_queries__author"."resource_document", "qti_queries__author"."resource_file", "qti_queries__author"."resource_href", "qti_queries__author"."resource_id", "qti_queries__author"."resource_lom_language_set", "qti_queries__author"."resource_typed", "qti_queries__author"."rounding", "qti_queries__author"."rounding_figures", "qti_queries__author"."rounding_mode", "qti_queries__author"."rounding_mode_figures", "qti_queries__author"."sd_decl", "qti_queries__author"."section", "qti_queries__author"."section_context_name", "qti_queries__author"."section_context_ref", "qti_queries__author"."section_context_ref_declaration", "qti_queries__author"."section_feedback_name", "qti_queries__author"."section_feedback_ref", "qti_queries__author"."section_feedback_ref_cardinality", "qti_queries__author"."section_feedback_ref_declaration", "qti_queries__author"."section_identifier", "qti_queries__author"."section_member", "qti_queries__author"."section_ordering", "qti_queries__author"."section_printed_name", "qti_queries__author"."section_printed_ref", "qti_queries__author"."section_printed_ref_declaration", "qti_queries__author"."section_scope", "qti_queries__author"."section_selection", "qti_queries__author"."section_template_name", "qti_queries__author"."section_template_ref", "qti_queries__author"."section_template_ref_cardinality", "qti_queries__author"."section_template_ref_declaration", "qti_queries__author"."share_fragment", "qti_queries__author"."share_target", "qti_queries__author"."site", "qti_queries__author"."site_path", "qti_queries__author"."slider", "qti_queries__author"."srcset", "qti_queries__author"."srcset_candidate", "qti_queries__author"."ssml_attribute", "qti_queries__author"."ssml_scope", "qti_queries__author"."statistic_date", "qti_queries__author"."stimulus_ref", "qti_queries__author"."table_header", "qti_queries__author"."table_scope", "qti_queries__author"."template_default", "qti_queries__author"."template_default_cardinality", "qti_queries__author"."template_default_target", "qti_queries__author"."template_ref", "qti_queries__author"."template_ref_cardinality", "qti_queries__author"."template_ref_declaration", "qti_queries__author"."test_document", "qti_queries__author"."test_flag", "qti_queries__author"."test_reference", "qti_queries__author"."test_token", "qti_queries__author"."text_idref", "qti_queries__author"."text_reference", "qti_queries__author"."text_reference_path", "qti_queries__author"."tolerance", "qti_queries__author"."tolerance_token", "qti_queries__author"."typed_value", "qti_queries__author"."usage_base_type", "qti_queries__author"."usage_value", "qti_queries__author"."usage_value_base_type", "qti_queries__author"."value", "qti_queries__author"."value_base_type", "qti_queries__author"."value_set", "qti_queries__author"."value_set_cardinality", "qti_queries__author"."variable_mapping", "qti_queries__author"."variable_ref", "qti_queries__author"."variable_ref_cardinality", "qti_queries__author"."variable_ref_declaration", "qti_queries__author"."variable_ref_table", "qti_queries__author"."xml_decl", "qti_queries__author"."xml_lang" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."area_mapping" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."area_mapping_cardinality" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."aria_element" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."aria_range" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."aria_value" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."assembled_catalog" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."assembled_id" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."assembled_lang" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."assembled_name" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."assembled_reference" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."assessment_object" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."attribute" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."attribute_entity" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."binding" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."binding_base_type" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."binding_cardinality" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."binding_declaration" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."binding_name" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."body_xml_lang" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."bound_variable" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."branch_resolution" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."branch_rule" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."branch_shuffle" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."branch_target" FROM :"qti_queries__author";

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

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."count_range" FROM :"qti_queries__author";

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

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."dependency_target" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."doctype" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."document" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."document_id" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."document_lang" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."element_type" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."encoding_decl" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."entry" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."expression" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."expression_attribute" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."feedback_ref" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."feedback_ref_cardinality" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."feedback_ref_declaration" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."field_value" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."file" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."file_href" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."fragment_value" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."gap_interaction" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."header_token" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."hotspot" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."hottext" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."id_binding" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."identity_text" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."idref" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."idref_target" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."inclusion" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."instance" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."instance_name" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."interaction" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."interaction_attribute" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."item_mode" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."item_ref_document" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."item_ref_href" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."label_use" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."least_count" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."literal" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."literal_typed" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."lom_entry" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."lom_general" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."lom_language" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."lom_record" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."lom_resource_type" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."lom_resource_type_source" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."lom_string" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."lom_string_language" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."lom_title" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."lom_title_string" FROM :"qti_queries__author";

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

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."mapping_item_ref" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."mapping_item_ref_type" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."mapping_source_declaration" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."mastery_ceiling" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."mastery_floor" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."mastery_value" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."math_action" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."math_align_group" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."math_align_scope" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."math_apply" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."math_argument" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."math_cell" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."math_cn" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."math_dir" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."math_qualifier" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."math_rank" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."most_count" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."named" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."namespace" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."node" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."normal_maximum" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."normal_minimum" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."object_identifier" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."object_lang" FROM :"qti_queries__author";

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

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."placed_body_xml_lang" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."placed_catalog_ref" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."placed_choice" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."placed_document" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."placed_hottext" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."placed_id" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."placed_idref" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."placed_math_rank" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."placed_reference" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."placed_share_target" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."placed_variable_ref" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."placed_variable_ref_declaration" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."placed_xml_lang" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."printed_variable_ref" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."printed_variable_ref_declaration" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."processing" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."processing_template" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."quotation" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."reading" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."reading_cardinality" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."reading_declaration" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."record_field" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."record_field_name" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."reference" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."reference_document" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."reference_path" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."reference_segment" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."referring_document" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."resource" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."resource_document" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."resource_file" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."resource_href" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."resource_id" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."resource_lom_language_set" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."resource_typed" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."rounding" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."rounding_figures" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."rounding_mode" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."rounding_mode_figures" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."sd_decl" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."section" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."section_context_name" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."section_context_ref" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."section_context_ref_declaration" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."section_feedback_name" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."section_feedback_ref" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."section_feedback_ref_cardinality" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."section_feedback_ref_declaration" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."section_identifier" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."section_member" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."section_ordering" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."section_printed_name" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."section_printed_ref" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."section_printed_ref_declaration" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."section_scope" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."section_selection" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."section_template_name" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."section_template_ref" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."section_template_ref_cardinality" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."section_template_ref_declaration" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."share_fragment" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."share_target" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."site" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."site_path" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."site_target" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."slider" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."srcset" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."srcset_candidate" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."ssml_attribute" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."ssml_scope" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."statistic_date" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."stimulus_ref" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."table_header" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."table_scope" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."template_default" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."template_default_cardinality" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."template_default_target" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."template_ref" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."template_ref_cardinality" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."template_ref_declaration" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."test_document" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."test_flag" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."test_reference" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."test_token" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."text_idref" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."text_reference" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."text_reference_path" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."tolerance" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."tolerance_token" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."typed_value" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."usage_base_type" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."usage_value" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."usage_value_base_type" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."value" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."value_base_type" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."value_set" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."value_set_cardinality" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."variable_mapping" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."variable_ref" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."variable_ref_cardinality" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."variable_ref_declaration" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."variable_ref_table" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."xml_decl" FROM :"qti_queries__author";

REVOKE SELECT, INSERT, DELETE ON TABLE "qti"."xml_lang" FROM :"qti_queries__author";

REVOKE EXECUTE ON FUNCTION "qti"."__refuse"("pg_catalog"."text", "pg_catalog"."text", "pg_catalog"."text") FROM :"qti_queries__author";

REVOKE EXECUTE ON FUNCTION "qti"."__constant_y3upkg42xe"(), "qti"."__constant_uij2fonltq"(), "qti"."__constant_bkqh2friwv"(), "qti"."__constant_jyn4uc7zt6"(), "qti"."__constant_sx2lr4try3"(), "qti"."__constant_u7eltifwnk"(), "qti"."__constant_nhyhb5mvr7"(), "qti"."__constant_ibiapjhixk"(), "qti"."__constant_rqwqzvpydz"(), "qti"."__constant_cc6vlqxc5e"(), "qti"."__constant_cjtc2ddtha"(), "qti"."__constant_milnmhezry"(), "qti"."__constant_caimmsgsgb"(), "qti"."__constant_hfmlcmj6m4"(), "qti"."__constant_hmibfx5gyk"(), "qti"."__constant_j4ofs3gxv5"(), "qti"."__constant_ncvuf24xxr"(), "qti"."__constant_ykvwltiwpp"(), "qti"."__constant_ibciimd7k5"(), "qti"."__constant_wzcsm5lgek"(), "qti"."__constant_npu4wt2fbp"(), "qti"."__constant_is5wq7ypst"(), "qti"."__constant_c5eectki2v"(), "qti"."__constant_yegly32ojt"(), "qti"."__constant_gnajygigus"(), "qti"."__constant_5kz6ofzblb"(), "qti"."__constant_ct2vnrdq7e"(), "qti"."__constant_eqtu3e3bf7"(), "qti"."__constant_4okg7vcxht"(), "qti"."__constant_kagon643nx"(), "qti"."__constant_vbr4yguujg"(), "qti"."__constant_rtojrvferk"(), "qti"."__constant_vv2aahv5fj"(), "qti"."__constant_cvrzwozguy"(), "qti"."__constant_ciuqwbhuta"(), "qti"."__constant_whaydjeagy"(), "qti"."__constant_lt7r7r6eus"(), "qti"."__constant_iiomoobndf"(), "qti"."__constant_sqmzlmgx7q"(), "qti"."__constant_u6qipu43gw"(), "qti"."__constant_zxblrnsej2"(), "qti"."__constant_ldx6j6cflr"(), "qti"."__constant_ndtmde27tx"(), "qti"."__constant_kdgtnxocc6"(), "qti"."__constant_kpxfwusb6s"(), "qti"."__constant_sj4gtqwjvu"(), "qti"."__constant_inwmcukoes"(), "qti"."__constant_3fgeygq5w3"(), "qti"."__constant_qlb2jx4hhv"(), "qti"."__constant_3e2fnl7lx2"(), "qti"."__constant_kbqndjyeid"(), "qti"."__constant_2p24sg5e4t"(), "qti"."__constant_exnqxdg5si"(), "qti"."__constant_wrlwssqvsp"(), "qti"."__constant_b6ph5734n4"(), "qti"."__constant_5vczbwx7y7"(), "qti"."__constant_p5oxaznp4j"(), "qti"."__constant_samvsv5x3m"(), "qti"."__constant_ibvgt6pxwh"(), "qti"."__constant_6pgyw625sv"(), "qti"."__constant_l2ycukia2e"(), "qti"."__constant_sh5ixq44oe"(), "qti"."__constant_ee5ou72hft"(), "qti"."__constant_3uo3ixnz45"(), "qti"."__constant_jsry7yx5wr"(), "qti"."__constant_3diwsllipu"(), "qti"."__constant_ab562yacjn"(), "qti"."__constant_wvtqnkiky3"(), "qti"."__constant_47ksumromp"(), "qti"."__constant_5pcz6dyjzi"(), "qti"."__constant_3zq77hs2za"(), "qti"."__constant_5w6ioztupb"(), "qti"."__constant_6f44bj6f5z"(), "qti"."__constant_5hroyzn7i6"(), "qti"."__constant_ftz6h5paqe"(), "qti"."__constant_yzav37j3jv"(), "qti"."__constant_przq27rlwm"(), "qti"."__constant_qrfq2g4hkz"(), "qti"."__constant_2spvsmpumv"(), "qti"."__constant_5r3at22xvz"(), "qti"."__constant_ellk4zorxq"(), "qti"."__constant_6bibvar5ap"(), "qti"."__constant_zqmhcyzcur"(), "qti"."__constant_aprps52eby"(), "qti"."__constant_d6a3lyuj7v"(), "qti"."__constant_ahddjwrhv5"(), "qti"."__constant_k3fjlwxuwn"(), "qti"."__constant_wxfnisv4kj"(), "qti"."__constant_iz4l44v4pt"(), "qti"."__constant_xvmgsamjvy"(), "qti"."__constant_r7m6yukmzl"(), "qti"."__constant_dyvla5m4mo"(), "qti"."__constant_lliww2nzpo"(), "qti"."__constant_dqbnkda3gg"(), "qti"."__constant_nszjhgow72"(), "qti"."__constant_gf6he576t3"(), "qti"."__constant_iksi4cbdex"(), "qti"."__constant_74uvt6ok2v"(), "qti"."__constant_zgknnwrg6p"(), "qti"."__constant_62dwoqukhs"(), "qti"."__constant_jgtq6vvihi"(), "qti"."__constant_fsmfviu65m"(), "qti"."__constant_kb2tdexlqu"(), "qti"."__constant_wvuca46fcu"(), "qti"."__constant_ho6c7gpjo3"(), "qti"."__constant_ejkw66w2je"(), "qti"."__constant_zllzdbnkqh"(), "qti"."__constant_wnswxzyccu"(), "qti"."__constant_sl65lnozn2"(), "qti"."__constant_66i4fjuv6n"(), "qti"."__constant_wm7weop42i"(), "qti"."__constant_otpfpakmgn"(), "qti"."__constant_pe42df565f"(), "qti"."__constant_p2xwmlesaa"(), "qti"."__constant_eizgu7rgqp"(), "qti"."__constant_fccrluys3c"(), "qti"."__constant_7rkjmglcw6"(), "qti"."__constant_hh7nvhrixk"(), "qti"."__constant_j6uos7o7iw"(), "qti"."__constant_24trt7i5oc"(), "qti"."__constant_gazfxeallk"(), "qti"."__constant_hltqi7xvbx"(), "qti"."__constant_7puc5uc6kh"(), "qti"."__constant_wekhard5xm"(), "qti"."__constant_ajahbtka65"(), "qti"."__constant_6iey4mkmde"(), "qti"."__constant_ab5qkascpx"(), "qti"."__constant_3fecx3moff"(), "qti"."__constant_n42l2hiqge"(), "qti"."__constant_fc5jbymvbm"(), "qti"."__constant_fe4yby2lv5"(), "qti"."__constant_wozychch32"(), "qti"."__constant_7s64uc2x4z"(), "qti"."__constant_w7hnvtob66"(), "qti"."__constant_g43gzaakcc"(), "qti"."__constant_axl72j6gkk"(), "qti"."__constant_6l2ttocydo"(), "qti"."__constant_y75rhchi3d"(), "qti"."__constant_6ioyfvymul"(), "qti"."__constant_sn5ucr2eat"(), "qti"."__constant_dtz4lgxf7y"(), "qti"."__constant_uynctp5wdx"(), "qti"."__constant_sjctib2m6a"(), "qti"."__constant_diad23iigw"(), "qti"."__constant_ophcod5hkq"(), "qti"."__constant_lxku7l7lok"(), "qti"."__constant_rwijlqnagg"(), "qti"."__constant_aiwrmlshlf"(), "qti"."__constant_ioawzxl5py"(), "qti"."__admission_map_names_4fr2dlhoj4"(), "qti"."__align_direction_names_vluq7iazdg"(), "qti"."__align_state_names_ffk37slxn3"(), "qti"."__attribute_model_names_rf6h6rq4bw"(), "qti"."__attribute_name_names_q6tmzcty4e"(), "qti"."__attribute_slot_names_4r5l4mp24z"(), "qti"."__base_type_names_ok3nu5nck4"(), "qti"."__bound_facet_names_b7dbsbn4iu"(), "qti"."__bound_zero_names_2iyjgurtgw"(), "qti"."__built_in_names_qkzs4cgupe"(), "qti"."__cardinality_names_kqiairsoqa"(), "qti"."__cn_base_names_2wtzhyubck"(), "qti"."__cn_part_names_6db2fcgfhy"(), "qti"."__cn_part_form_names_te7u7jycdu"(), "qti"."__cn_type_names_wmjelllvhg"(), "qti"."__content_model_names_b6tbyheoog"(), "qti"."__declaration_kind_names_o62wpad2p7"(), "qti"."__document_type_names_b6nphfgptk"(), "qti"."__domain_primitive_names_2yihitx2to"(), "qti"."__flag_names_dttyznb5cw"(), "qti"."__follow_set_names_tyqahfjnmm"(), "qti"."__governor_names_d7jfyla3na"(), "qti"."__href_scope_names_y4pbuo4f5q"(), "qti"."__identity_names_rrxxe77wjj"(), "qti"."__include_set_names_6bs2sxuszz"(), "qti"."__language_names_pvmtywwssv"(), "qti"."__node_kind_names_ulbko553n7"(), "qti"."__position_names_sglcn7ygpg"(), "qti"."__reading_form_names_tbdimwd3yh"(), "qti"."__reading_source_names_6r6sgc6pfk"(), "qti"."__reference_form_names_gm6ro5a5jp"(), "qti"."__reference_resolution_names_3knvypuotm"(), "qti"."__reference_role_names_ce5jhrrzsl"(), "qti"."__reference_spelling_names_gocqpuf7tl"(), "qti"."__referenced_table_names_qrpsijquzz"(), "qti"."__resource_type_names_4wps2tgde3"(), "qti"."__rounding_holds_names_6j2zaayymp"(), "qti"."__rp_template_names_tkkjkmwhuf"(), "qti"."__schema_version_names_p2hfvbhu24"(), "qti"."__shared_model_names_5s5lwnfjh3"(), "qti"."__symbol_set_names_7wklvi4qhu"(), "qti"."__type_name_names_vi2zj5deol"(), "qti"."__use_names_vmbq6fav2t"(), "qti"."__value_base_names_pjzlcpdwvv"(), "qti"."__value_cardinality_names_wzwznoycgf"(), "qti"."__value_domain_names_2e6ub7q3q7"(), "qti"."__xml_standalone_names_psf7bszcug"(), "qti"."__attribute_name_live_7ot3c4gfh5"(), "qti"."__attribute_slot_live_g5haf24jp3"(), "qti"."__flag_live_egdpt3c4t6"(), "qti"."__node_kind_live_rds6vphboo"(), "qti"."__position_live_uvhnssun3f"(), "qti"."__value_base_live_trk5bm7ra5"(), "qti"."__value_cardinality_live_qbccqbzssx"() FROM :"qti_queries__author";

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
REVOKE TEMPORARY ON DATABASE :"DBNAME" FROM :"qti_queries__author";

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
GRANT USAGE ON SCHEMA "qti", "qti_queries", "qti_queries__author" TO :"qti_queries__author";

GRANT USAGE ON DOMAIN "qti"."__attribute_slot_bits_112_aecznthxg5", "qti"."__flag_bits_12_i4uhexylc4", "qti"."__value_base_bits_16_7t6pwwxbsh", "qti"."__value_cardinality_bits_8_mma4mwhphy", "qti"."__domain_gfw43vigph", "qti"."admission_map", "qti"."align_direction", "qti"."align_state", "qti"."attribute_model", "qti"."attribute_name", "qti"."attribute_slot", "qti"."base_type", "qti"."bound_facet", "qti"."bound_zero", "qti"."built_in", "qti"."cardinality", "qti"."cn_base", "qti"."cn_part", "qti"."cn_part_form", "qti"."cn_type", "qti"."content_model", "qti"."declaration_kind", "qti"."document_type", "qti"."domain_primitive", "qti"."flag", "qti"."follow_set", "qti"."governor", "qti"."href_scope", "qti"."identity", "qti"."include_set", "qti"."language", "qti"."node_kind", "qti"."position", "qti"."reading_form", "qti"."reading_source", "qti"."reference_form", "qti"."reference_resolution", "qti"."reference_role", "qti"."reference_spelling", "qti"."referenced_table", "qti"."resource_type", "qti"."rounding_holds", "qti"."rp_template", "qti"."schema_version", "qti"."shared_model", "qti"."symbol_set", "qti"."type_name", "qti"."use", "qti"."value_base", "qti"."value_cardinality", "qti"."value_domain", "qti"."xml_standalone", "qti"."__text_xj3zno7u3h", "qti"."__text_c6iptmtj2x", "qti"."__text_wchibbb5qm", "qti"."__text_4s4od7s5or", "qti"."__text_qswrkft5qs", "qti"."__text_76pfa5avf4", "qti"."__text_gke7uypkov", "qti"."__text_mqbstvk5ay", "qti"."__text_l7nqeazg5h", "qti"."__text_k5kwygzatl", "qti"."__text_7dfilirtp3", "qti"."__text_xisvziygi3", "qti"."__text_7j6kgluyjp", "qti"."__text_xey6ryorh5", "qti"."__text_lnwfx5ijx4", "qti"."__text_lkpwkpgaib", "qti"."__text_w7a4l3clst", "qti"."__text_psn65t7m7e", "qti"."__text_23rzixl3a2", "qti"."__text_6zspo66rxv", "qti"."__text_vrcyezm7ka", "qti"."__text_zij47sgley", "qti"."__text_b6ykamoeho", "qti"."__text_xv5q2k3cum", "qti"."__text_3dlgl63rv6", "qti"."__text_mvb6rz2wwz", "qti"."__text_aezrarw5qb", "qti"."__text_3adwbksayk" TO :"qti_queries__author";

GRANT SELECT ON TABLE "qti_queries__author"."area_mapping", "qti_queries__author"."area_mapping_cardinality", "qti_queries__author"."aria_element", "qti_queries__author"."aria_range", "qti_queries__author"."aria_value", "qti_queries__author"."assembled_catalog", "qti_queries__author"."assembled_id", "qti_queries__author"."assembled_lang", "qti_queries__author"."assembled_name", "qti_queries__author"."assembled_reference", "qti_queries__author"."assessment_object", "qti_queries__author"."attribute", "qti_queries__author"."attribute_entity", "qti_queries__author"."binding", "qti_queries__author"."binding_base_type", "qti_queries__author"."binding_cardinality", "qti_queries__author"."binding_declaration", "qti_queries__author"."binding_name", "qti_queries__author"."body_xml_lang", "qti_queries__author"."bound_variable", "qti_queries__author"."branch_resolution", "qti_queries__author"."branch_rule", "qti_queries__author"."branch_shuffle", "qti_queries__author"."branch_target", "qti_queries__author"."candidate_path", "qti_queries__author"."card_support", "qti_queries__author"."catalog_id", "qti_queries__author"."catalog_ref", "qti_queries__author"."catalog_scope", "qti_queries__author"."catalog_target", "qti_queries__author"."cell_headers", "qti_queries__author"."cell_leaf", "qti_queries__author"."choice", "qti_queries__author"."choice_interaction", "qti_queries__author"."cn_attribute", "qti_queries__author"."cn_count", "qti_queries__author"."cn_part_text", "qti_queries__author"."cn_slot", "qti_queries__author"."comment", "qti_queries__author"."context_ref", "qti_queries__author"."context_ref_declaration", "qti_queries__author"."count_bound", "qti_queries__author"."count_range", "qti_queries__author"."data_ssml", "qti_queries__author"."data_ssml_member", "qti_queries__author"."data_ssml_property", "qti_queries__author"."declaration", "qti_queries__author"."declaration_base_type", "qti_queries__author"."declaration_cardinality", "qti_queries__author"."declaration_identifier", "qti_queries__author"."declaration_name", "qti_queries__author"."default_entry", "qti_queries__author"."dependency", "qti_queries__author"."dependency_target", "qti_queries__author"."doctype", "qti_queries__author"."document", "qti_queries__author"."document_id", "qti_queries__author"."document_lang", "qti_queries__author"."element_type", "qti_queries__author"."encoding_decl", "qti_queries__author"."entry", "qti_queries__author"."expression", "qti_queries__author"."expression_attribute", "qti_queries__author"."feedback_ref", "qti_queries__author"."feedback_ref_cardinality", "qti_queries__author"."feedback_ref_declaration", "qti_queries__author"."field_value", "qti_queries__author"."file", "qti_queries__author"."file_href", "qti_queries__author"."fragment_value", "qti_queries__author"."gap_interaction", "qti_queries__author"."header_token", "qti_queries__author"."hotspot", "qti_queries__author"."hottext", "qti_queries__author"."id_binding", "qti_queries__author"."identity_text", "qti_queries__author"."idref", "qti_queries__author"."idref_target", "qti_queries__author"."inclusion", "qti_queries__author"."instance", "qti_queries__author"."instance_name", "qti_queries__author"."interaction", "qti_queries__author"."interaction_attribute", "qti_queries__author"."item_mode", "qti_queries__author"."item_ref_document", "qti_queries__author"."item_ref_href", "qti_queries__author"."label_use", "qti_queries__author"."least_count", "qti_queries__author"."literal", "qti_queries__author"."literal_typed", "qti_queries__author"."lom_entry", "qti_queries__author"."lom_general", "qti_queries__author"."lom_language", "qti_queries__author"."lom_record", "qti_queries__author"."lom_resource_type", "qti_queries__author"."lom_resource_type_source", "qti_queries__author"."lom_string", "qti_queries__author"."lom_string_language", "qti_queries__author"."lom_title", "qti_queries__author"."lom_title_string", "qti_queries__author"."lookup_table", "qti_queries__author"."lookup_table_cardinality", "qti_queries__author"."lookup_value", "qti_queries__author"."lookup_value_type", "qti_queries__author"."manifest_id", "qti_queries__author"."map_key", "qti_queries__author"."map_key_type", "qti_queries__author"."mapping", "qti_queries__author"."mapping_base_type", "qti_queries__author"."mapping_cardinality", "qti_queries__author"."mapping_item_ref", "qti_queries__author"."mapping_item_ref_type", "qti_queries__author"."mapping_source_declaration", "qti_queries__author"."mastery_ceiling", "qti_queries__author"."mastery_floor", "qti_queries__author"."mastery_value", "qti_queries__author"."math_action", "qti_queries__author"."math_align_group", "qti_queries__author"."math_align_scope", "qti_queries__author"."math_apply", "qti_queries__author"."math_argument", "qti_queries__author"."math_cell", "qti_queries__author"."math_cn", "qti_queries__author"."math_dir", "qti_queries__author"."math_qualifier", "qti_queries__author"."math_rank", "qti_queries__author"."most_count", "qti_queries__author"."named", "qti_queries__author"."namespace", "qti_queries__author"."node", "qti_queries__author"."normal_maximum", "qti_queries__author"."normal_minimum", "qti_queries__author"."object_identifier", "qti_queries__author"."object_lang", "qti_queries__author"."object_title", "qti_queries__author"."open_attribute", "qti_queries__author"."open_attribute_entity", "qti_queries__author"."open_element_name", "qti_queries__author"."open_element_type", "qti_queries__author"."operand", "qti_queries__author"."package", "qti_queries__author"."pci_module_form", "qti_queries__author"."pi", "qti_queries__author"."placed_binding", "qti_queries__author"."placed_binding_base_type", "qti_queries__author"."placed_binding_cardinality", "qti_queries__author"."placed_binding_declaration", "qti_queries__author"."placed_body_xml_lang", "qti_queries__author"."placed_catalog_ref", "qti_queries__author"."placed_choice", "qti_queries__author"."placed_document", "qti_queries__author"."placed_hottext", "qti_queries__author"."placed_id", "qti_queries__author"."placed_idref", "qti_queries__author"."placed_math_rank", "qti_queries__author"."placed_reference", "qti_queries__author"."placed_share_target", "qti_queries__author"."placed_variable_ref", "qti_queries__author"."placed_variable_ref_declaration", "qti_queries__author"."placed_xml_lang", "qti_queries__author"."printed_variable_ref", "qti_queries__author"."printed_variable_ref_declaration", "qti_queries__author"."processing", "qti_queries__author"."processing_template", "qti_queries__author"."quotation", "qti_queries__author"."reading", "qti_queries__author"."reading_cardinality", "qti_queries__author"."reading_declaration", "qti_queries__author"."record_field", "qti_queries__author"."record_field_name", "qti_queries__author"."reference", "qti_queries__author"."reference_document", "qti_queries__author"."reference_path", "qti_queries__author"."reference_segment", "qti_queries__author"."referring_document", "qti_queries__author"."resource", "qti_queries__author"."resource_document", "qti_queries__author"."resource_file", "qti_queries__author"."resource_href", "qti_queries__author"."resource_id", "qti_queries__author"."resource_lom_language_set", "qti_queries__author"."resource_typed", "qti_queries__author"."rounding", "qti_queries__author"."rounding_figures", "qti_queries__author"."rounding_mode", "qti_queries__author"."rounding_mode_figures", "qti_queries__author"."sd_decl", "qti_queries__author"."section", "qti_queries__author"."section_context_name", "qti_queries__author"."section_context_ref", "qti_queries__author"."section_context_ref_declaration", "qti_queries__author"."section_feedback_name", "qti_queries__author"."section_feedback_ref", "qti_queries__author"."section_feedback_ref_cardinality", "qti_queries__author"."section_feedback_ref_declaration", "qti_queries__author"."section_identifier", "qti_queries__author"."section_member", "qti_queries__author"."section_ordering", "qti_queries__author"."section_printed_name", "qti_queries__author"."section_printed_ref", "qti_queries__author"."section_printed_ref_declaration", "qti_queries__author"."section_scope", "qti_queries__author"."section_selection", "qti_queries__author"."section_template_name", "qti_queries__author"."section_template_ref", "qti_queries__author"."section_template_ref_cardinality", "qti_queries__author"."section_template_ref_declaration", "qti_queries__author"."share_fragment", "qti_queries__author"."share_target", "qti_queries__author"."site", "qti_queries__author"."site_path", "qti_queries__author"."site_target", "qti_queries__author"."slider", "qti_queries__author"."srcset", "qti_queries__author"."srcset_candidate", "qti_queries__author"."ssml_attribute", "qti_queries__author"."ssml_scope", "qti_queries__author"."statistic_date", "qti_queries__author"."stimulus_ref", "qti_queries__author"."table_header", "qti_queries__author"."table_scope", "qti_queries__author"."template_default", "qti_queries__author"."template_default_cardinality", "qti_queries__author"."template_default_target", "qti_queries__author"."template_ref", "qti_queries__author"."template_ref_cardinality", "qti_queries__author"."template_ref_declaration", "qti_queries__author"."test_document", "qti_queries__author"."test_flag", "qti_queries__author"."test_reference", "qti_queries__author"."test_token", "qti_queries__author"."text_idref", "qti_queries__author"."text_reference", "qti_queries__author"."text_reference_path", "qti_queries__author"."tolerance", "qti_queries__author"."tolerance_token", "qti_queries__author"."typed_value", "qti_queries__author"."usage_base_type", "qti_queries__author"."usage_value", "qti_queries__author"."usage_value_base_type", "qti_queries__author"."value", "qti_queries__author"."value_base_type", "qti_queries__author"."value_set", "qti_queries__author"."value_set_cardinality", "qti_queries__author"."variable_mapping", "qti_queries__author"."variable_ref", "qti_queries__author"."variable_ref_cardinality", "qti_queries__author"."variable_ref_declaration", "qti_queries__author"."variable_ref_table", "qti_queries__author"."xml_decl", "qti_queries__author"."xml_lang" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."area_mapping" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."area_mapping_cardinality" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."aria_element" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."aria_range" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."aria_value" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."assembled_catalog" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."assembled_id" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."assembled_lang" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."assembled_name" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."assembled_reference" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."assessment_object" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."attribute" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."attribute_entity" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."binding" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."binding_base_type" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."binding_cardinality" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."binding_declaration" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."binding_name" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."body_xml_lang" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."bound_variable" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."branch_resolution" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."branch_rule" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."branch_shuffle" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."branch_target" TO :"qti_queries__author";

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

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."count_range" TO :"qti_queries__author";

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

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."dependency_target" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."doctype" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."document" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."document_id" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."document_lang" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."element_type" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."encoding_decl" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."entry" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."expression" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."expression_attribute" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."feedback_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."feedback_ref_cardinality" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."feedback_ref_declaration" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."field_value" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."file" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."file_href" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."fragment_value" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."gap_interaction" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."header_token" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."hotspot" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."hottext" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."id_binding" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."identity_text" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."idref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."idref_target" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."inclusion" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."instance" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."instance_name" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."interaction" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."interaction_attribute" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."item_mode" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."item_ref_document" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."item_ref_href" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."label_use" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."least_count" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."literal" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."literal_typed" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."lom_entry" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."lom_general" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."lom_language" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."lom_record" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."lom_resource_type" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."lom_resource_type_source" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."lom_string" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."lom_string_language" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."lom_title" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."lom_title_string" TO :"qti_queries__author";

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

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."mapping_item_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."mapping_item_ref_type" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."mapping_source_declaration" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."mastery_ceiling" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."mastery_floor" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."mastery_value" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."math_action" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."math_align_group" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."math_align_scope" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."math_apply" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."math_argument" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."math_cell" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."math_cn" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."math_dir" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."math_qualifier" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."math_rank" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."most_count" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."named" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."namespace" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."node" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."normal_maximum" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."normal_minimum" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."object_identifier" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."object_lang" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."object_title" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."open_attribute" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."open_attribute_entity" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."open_element_name" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."open_element_type" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."operand" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."package" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."pci_module_form" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."pi" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_binding" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_binding_base_type" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_binding_cardinality" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_binding_declaration" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_body_xml_lang" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_catalog_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_choice" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_document" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_hottext" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_id" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_idref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_math_rank" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_reference" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_share_target" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_variable_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_variable_ref_declaration" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_xml_lang" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."printed_variable_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."printed_variable_ref_declaration" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."processing" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."processing_template" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."quotation" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."reading" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."reading_cardinality" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."reading_declaration" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."record_field" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."record_field_name" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."reference" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."reference_document" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."reference_path" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."reference_segment" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."referring_document" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."resource" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."resource_document" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."resource_file" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."resource_href" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."resource_id" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."resource_lom_language_set" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."resource_typed" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."rounding" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."rounding_figures" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."rounding_mode" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."rounding_mode_figures" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."sd_decl" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."section" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."section_context_name" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."section_context_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."section_context_ref_declaration" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."section_feedback_name" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."section_feedback_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."section_feedback_ref_cardinality" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."section_feedback_ref_declaration" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."section_identifier" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."section_member" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."section_ordering" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."section_printed_name" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."section_printed_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."section_printed_ref_declaration" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."section_scope" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."section_selection" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."section_template_name" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."section_template_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."section_template_ref_cardinality" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."section_template_ref_declaration" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."share_fragment" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."share_target" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."site" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."site_path" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."site_target" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."slider" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."srcset" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."srcset_candidate" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."ssml_attribute" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."ssml_scope" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."statistic_date" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."stimulus_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."table_header" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."table_scope" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."template_default" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."template_default_cardinality" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."template_default_target" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."template_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."template_ref_cardinality" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."template_ref_declaration" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."test_document" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."test_flag" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."test_reference" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."test_token" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."text_idref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."text_reference" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."text_reference_path" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."tolerance" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."tolerance_token" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."typed_value" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."usage_base_type" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."usage_value" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."usage_value_base_type" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."value" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."value_base_type" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."value_set" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."value_set_cardinality" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."variable_mapping" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."variable_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."variable_ref_cardinality" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."variable_ref_declaration" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."variable_ref_table" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."xml_decl" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."xml_lang" TO :"qti_queries__author";

GRANT EXECUTE ON FUNCTION "qti"."__refuse"("pg_catalog"."text", "pg_catalog"."text", "pg_catalog"."text") TO :"qti_queries__author";

GRANT EXECUTE ON FUNCTION "qti"."__constant_y3upkg42xe"(), "qti"."__constant_uij2fonltq"(), "qti"."__constant_bkqh2friwv"(), "qti"."__constant_jyn4uc7zt6"(), "qti"."__constant_sx2lr4try3"(), "qti"."__constant_u7eltifwnk"(), "qti"."__constant_nhyhb5mvr7"(), "qti"."__constant_ibiapjhixk"(), "qti"."__constant_rqwqzvpydz"(), "qti"."__constant_cc6vlqxc5e"(), "qti"."__constant_cjtc2ddtha"(), "qti"."__constant_milnmhezry"(), "qti"."__constant_caimmsgsgb"(), "qti"."__constant_hfmlcmj6m4"(), "qti"."__constant_hmibfx5gyk"(), "qti"."__constant_j4ofs3gxv5"(), "qti"."__constant_ncvuf24xxr"(), "qti"."__constant_ykvwltiwpp"(), "qti"."__constant_ibciimd7k5"(), "qti"."__constant_wzcsm5lgek"(), "qti"."__constant_npu4wt2fbp"(), "qti"."__constant_is5wq7ypst"(), "qti"."__constant_c5eectki2v"(), "qti"."__constant_yegly32ojt"(), "qti"."__constant_gnajygigus"(), "qti"."__constant_5kz6ofzblb"(), "qti"."__constant_ct2vnrdq7e"(), "qti"."__constant_eqtu3e3bf7"(), "qti"."__constant_4okg7vcxht"(), "qti"."__constant_kagon643nx"(), "qti"."__constant_vbr4yguujg"(), "qti"."__constant_rtojrvferk"(), "qti"."__constant_vv2aahv5fj"(), "qti"."__constant_cvrzwozguy"(), "qti"."__constant_ciuqwbhuta"(), "qti"."__constant_whaydjeagy"(), "qti"."__constant_lt7r7r6eus"(), "qti"."__constant_iiomoobndf"(), "qti"."__constant_sqmzlmgx7q"(), "qti"."__constant_u6qipu43gw"(), "qti"."__constant_zxblrnsej2"(), "qti"."__constant_ldx6j6cflr"(), "qti"."__constant_ndtmde27tx"(), "qti"."__constant_kdgtnxocc6"(), "qti"."__constant_kpxfwusb6s"(), "qti"."__constant_sj4gtqwjvu"(), "qti"."__constant_inwmcukoes"(), "qti"."__constant_3fgeygq5w3"(), "qti"."__constant_qlb2jx4hhv"(), "qti"."__constant_3e2fnl7lx2"(), "qti"."__constant_kbqndjyeid"(), "qti"."__constant_2p24sg5e4t"(), "qti"."__constant_exnqxdg5si"(), "qti"."__constant_wrlwssqvsp"(), "qti"."__constant_b6ph5734n4"(), "qti"."__constant_5vczbwx7y7"(), "qti"."__constant_p5oxaznp4j"(), "qti"."__constant_samvsv5x3m"(), "qti"."__constant_ibvgt6pxwh"(), "qti"."__constant_6pgyw625sv"(), "qti"."__constant_l2ycukia2e"(), "qti"."__constant_sh5ixq44oe"(), "qti"."__constant_ee5ou72hft"(), "qti"."__constant_3uo3ixnz45"(), "qti"."__constant_jsry7yx5wr"(), "qti"."__constant_3diwsllipu"(), "qti"."__constant_ab562yacjn"(), "qti"."__constant_wvtqnkiky3"(), "qti"."__constant_47ksumromp"(), "qti"."__constant_5pcz6dyjzi"(), "qti"."__constant_3zq77hs2za"(), "qti"."__constant_5w6ioztupb"(), "qti"."__constant_6f44bj6f5z"(), "qti"."__constant_5hroyzn7i6"(), "qti"."__constant_ftz6h5paqe"(), "qti"."__constant_yzav37j3jv"(), "qti"."__constant_przq27rlwm"(), "qti"."__constant_qrfq2g4hkz"(), "qti"."__constant_2spvsmpumv"(), "qti"."__constant_5r3at22xvz"(), "qti"."__constant_ellk4zorxq"(), "qti"."__constant_6bibvar5ap"(), "qti"."__constant_zqmhcyzcur"(), "qti"."__constant_aprps52eby"(), "qti"."__constant_d6a3lyuj7v"(), "qti"."__constant_ahddjwrhv5"(), "qti"."__constant_k3fjlwxuwn"(), "qti"."__constant_wxfnisv4kj"(), "qti"."__constant_iz4l44v4pt"(), "qti"."__constant_xvmgsamjvy"(), "qti"."__constant_r7m6yukmzl"(), "qti"."__constant_dyvla5m4mo"(), "qti"."__constant_lliww2nzpo"(), "qti"."__constant_dqbnkda3gg"(), "qti"."__constant_nszjhgow72"(), "qti"."__constant_gf6he576t3"(), "qti"."__constant_iksi4cbdex"(), "qti"."__constant_74uvt6ok2v"(), "qti"."__constant_zgknnwrg6p"(), "qti"."__constant_62dwoqukhs"(), "qti"."__constant_jgtq6vvihi"(), "qti"."__constant_fsmfviu65m"(), "qti"."__constant_kb2tdexlqu"(), "qti"."__constant_wvuca46fcu"(), "qti"."__constant_ho6c7gpjo3"(), "qti"."__constant_ejkw66w2je"(), "qti"."__constant_zllzdbnkqh"(), "qti"."__constant_wnswxzyccu"(), "qti"."__constant_sl65lnozn2"(), "qti"."__constant_66i4fjuv6n"(), "qti"."__constant_wm7weop42i"(), "qti"."__constant_otpfpakmgn"(), "qti"."__constant_pe42df565f"(), "qti"."__constant_p2xwmlesaa"(), "qti"."__constant_eizgu7rgqp"(), "qti"."__constant_fccrluys3c"(), "qti"."__constant_7rkjmglcw6"(), "qti"."__constant_hh7nvhrixk"(), "qti"."__constant_j6uos7o7iw"(), "qti"."__constant_24trt7i5oc"(), "qti"."__constant_gazfxeallk"(), "qti"."__constant_hltqi7xvbx"(), "qti"."__constant_7puc5uc6kh"(), "qti"."__constant_wekhard5xm"(), "qti"."__constant_ajahbtka65"(), "qti"."__constant_6iey4mkmde"(), "qti"."__constant_ab5qkascpx"(), "qti"."__constant_3fecx3moff"(), "qti"."__constant_n42l2hiqge"(), "qti"."__constant_fc5jbymvbm"(), "qti"."__constant_fe4yby2lv5"(), "qti"."__constant_wozychch32"(), "qti"."__constant_7s64uc2x4z"(), "qti"."__constant_w7hnvtob66"(), "qti"."__constant_g43gzaakcc"(), "qti"."__constant_axl72j6gkk"(), "qti"."__constant_6l2ttocydo"(), "qti"."__constant_y75rhchi3d"(), "qti"."__constant_6ioyfvymul"(), "qti"."__constant_sn5ucr2eat"(), "qti"."__constant_dtz4lgxf7y"(), "qti"."__constant_uynctp5wdx"(), "qti"."__constant_sjctib2m6a"(), "qti"."__constant_diad23iigw"(), "qti"."__constant_ophcod5hkq"(), "qti"."__constant_lxku7l7lok"(), "qti"."__constant_rwijlqnagg"(), "qti"."__constant_aiwrmlshlf"(), "qti"."__constant_ioawzxl5py"(), "qti"."__admission_map_names_4fr2dlhoj4"(), "qti"."__align_direction_names_vluq7iazdg"(), "qti"."__align_state_names_ffk37slxn3"(), "qti"."__attribute_model_names_rf6h6rq4bw"(), "qti"."__attribute_name_names_q6tmzcty4e"(), "qti"."__attribute_slot_names_4r5l4mp24z"(), "qti"."__base_type_names_ok3nu5nck4"(), "qti"."__bound_facet_names_b7dbsbn4iu"(), "qti"."__bound_zero_names_2iyjgurtgw"(), "qti"."__built_in_names_qkzs4cgupe"(), "qti"."__cardinality_names_kqiairsoqa"(), "qti"."__cn_base_names_2wtzhyubck"(), "qti"."__cn_part_names_6db2fcgfhy"(), "qti"."__cn_part_form_names_te7u7jycdu"(), "qti"."__cn_type_names_wmjelllvhg"(), "qti"."__content_model_names_b6tbyheoog"(), "qti"."__declaration_kind_names_o62wpad2p7"(), "qti"."__document_type_names_b6nphfgptk"(), "qti"."__domain_primitive_names_2yihitx2to"(), "qti"."__flag_names_dttyznb5cw"(), "qti"."__follow_set_names_tyqahfjnmm"(), "qti"."__governor_names_d7jfyla3na"(), "qti"."__href_scope_names_y4pbuo4f5q"(), "qti"."__identity_names_rrxxe77wjj"(), "qti"."__include_set_names_6bs2sxuszz"(), "qti"."__language_names_pvmtywwssv"(), "qti"."__node_kind_names_ulbko553n7"(), "qti"."__position_names_sglcn7ygpg"(), "qti"."__reading_form_names_tbdimwd3yh"(), "qti"."__reading_source_names_6r6sgc6pfk"(), "qti"."__reference_form_names_gm6ro5a5jp"(), "qti"."__reference_resolution_names_3knvypuotm"(), "qti"."__reference_role_names_ce5jhrrzsl"(), "qti"."__reference_spelling_names_gocqpuf7tl"(), "qti"."__referenced_table_names_qrpsijquzz"(), "qti"."__resource_type_names_4wps2tgde3"(), "qti"."__rounding_holds_names_6j2zaayymp"(), "qti"."__rp_template_names_tkkjkmwhuf"(), "qti"."__schema_version_names_p2hfvbhu24"(), "qti"."__shared_model_names_5s5lwnfjh3"(), "qti"."__symbol_set_names_7wklvi4qhu"(), "qti"."__type_name_names_vi2zj5deol"(), "qti"."__use_names_vmbq6fav2t"(), "qti"."__value_base_names_pjzlcpdwvv"(), "qti"."__value_cardinality_names_wzwznoycgf"(), "qti"."__value_domain_names_2e6ub7q3q7"(), "qti"."__xml_standalone_names_psf7bszcug"(), "qti"."__attribute_name_live_7ot3c4gfh5"(), "qti"."__attribute_slot_live_g5haf24jp3"(), "qti"."__flag_live_egdpt3c4t6"(), "qti"."__node_kind_live_rds6vphboo"(), "qti"."__position_live_uvhnssun3f"(), "qti"."__value_base_live_trk5bm7ra5"(), "qti"."__value_cardinality_live_qbccqbzssx"() TO :"qti_queries__author";

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
GRANT TEMPORARY ON DATABASE :"DBNAME" TO :"qti_queries__author";
