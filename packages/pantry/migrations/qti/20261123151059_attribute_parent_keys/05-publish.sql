ALTER TABLE "qti"."attribute" ADD CONSTRAINT "__attribute_key_package_path_parent_3pbuan3ddy" UNIQUE USING INDEX "__attribute_key_package_path_parent_3pbuan3ddy";

ALTER TABLE "qti"."attribute" ADD CONSTRAINT "__attribute_key_package_path_parent_value_digest_uwesnpe757" UNIQUE USING INDEX "__attribute_key_package_path_parent_value_digest_uwesnpe757";

ALTER TABLE "qti"."attribute" ADD CONSTRAINT "__attribute_key_package_path_parent_value_digest_4jxprvi7wt" UNIQUE USING INDEX "__attribute_key_package_path_parent_value_digest_4jxprvi7wt";

ALTER TABLE "qti"."attribute" ADD CONSTRAINT "__attribute_key_package_path_parent_value_digest_4k3ay3grnz" UNIQUE USING INDEX "__attribute_key_package_path_parent_value_digest_4k3ay3grnz";

ALTER TABLE "qti"."node" ADD CONSTRAINT "__node_key_package_path_start_attributes_governor_pxds7wqnyl" UNIQUE USING INDEX "__node_key_package_path_start_attributes_governor_pxds7wqnyl";

ALTER TABLE "qti"."attribute" ADD CONSTRAINT "__attribute_fk_package_path_start_copy_attributes_piufxgjpuc" FOREIGN KEY ("package", "path", "start", "__copy_attributes_yxabddgj5r", "governor", "kind", "parent") REFERENCES "qti"."node" ("package", "path", "start", "attributes", "governor", "kind", "parent") MATCH SIMPLE ON UPDATE CASCADE NOT VALID;

ALTER TABLE "qti"."attribute" DROP CONSTRAINT "__attribute_fk_package_path_start_copy_attributes_cjh7663z47";

ALTER TABLE "qti"."node" DROP CONSTRAINT "__node_key_package_path_start_attributes_governor_ygbuqn7z2g";

GRANT EXECUTE ON FUNCTION "qti"."__row_dbnwees6vb"("qti"."governor", "qti"."attribute_name", "qti"."__text_c6iptmtj2x") TO :"qti_queries__author";

DROP FUNCTION "qti"."__judge_assembled_catalog_ygttfgd2lu"("pg_catalog"."text"[]) RESTRICT;

DROP FUNCTION "qti"."__judge_weight_name_key_package_path_ref_identifier_5c7l6hcgi5"() RESTRICT;

DROP FUNCTION "qti"."__judge_variable_mapping_key_package_path_ref_target_t5qqr2lc2e"() RESTRICT;

DROP FUNCTION "qti"."__judge_catalog_support_key_package_path_catalog_gwhaujwtyk"() RESTRICT;

DROP FUNCTION "qti"."__judge_card_default_key_package_path_card_xry4sljvwm"() RESTRICT;

DROP FUNCTION "qti"."__reader_olds_attribute_sdnzblo4cy"() RESTRICT;

DROP FUNCTION "qti"."__reader_news_attribute_f2hqcrdfie"() RESTRICT;

DROP TYPE "qti"."__row_olds_attribute_yvaynl45bq";

DROP TYPE "qti"."__row_news_attribute_pbboqsmz3q";

COMMENT ON FUNCTION "qti"."__row_dbnwees6vb"("qti"."governor", "qti"."attribute_name", "qti"."__text_c6iptmtj2x") IS 'row function 8e18a495175c0cff3a15fc883d69cdb4703826cccb8656286501728971791147';

COMMENT ON TYPE "qti"."__row_news_attribute_xhxeojvr6o" IS 'the row type of the delta of news of Attribute';

COMMENT ON TYPE "qti"."__row_olds_attribute_37t7c3skxz" IS 'the row type of the delta of olds of Attribute';

COMMENT ON CONSTRAINT "__node_key_package_path_start_attributes_governor_pxds7wqnyl" ON "qti"."node" IS 'key Node(package, path, start, attributes, governor, kind, parent)';

COMMENT ON COLUMN "qti"."attribute"."__package_c6ealb2c5z" IS 'package where Logic.in(value, ["1", "true"]) and Logic.eq(kind, "qti-card-entry") and Logic.eq(name, "default")';

COMMENT ON COLUMN "qti"."attribute"."__package_ybzlg64bpx" IS 'package where Logic.eq(kind, "qti-card") and Logic.eq(name, "support")';

COMMENT ON COLUMN "qti"."attribute"."__package_vtzt2gplfj" IS 'package where Logic.eq(kind, "qti-variable-mapping") and Logic.eq(name, "target-identifier")';

COMMENT ON COLUMN "qti"."attribute"."__package_cg3657csij" IS 'package where Logic.eq(kind, "qti-weight") and Logic.eq(name, "identifier")';

COMMENT ON CONSTRAINT "__attribute_key_package_path_parent_3pbuan3ddy" ON "qti"."attribute" IS 'key Attribute(package where Logic.in(value, ["1", "true"]) and Logic.eq(kind, "qti-card-entry") and Logic.eq(name, "default"), path, parent)';

COMMENT ON CONSTRAINT "__attribute_key_package_path_parent_value_digest_uwesnpe757" ON "qti"."attribute" IS 'key Attribute(package where Logic.eq(kind, "qti-card") and Logic.eq(name, "support"), path, parent, valueDigest)';

COMMENT ON CONSTRAINT "__attribute_key_package_path_parent_value_digest_4jxprvi7wt" ON "qti"."attribute" IS 'key Attribute(package where Logic.eq(kind, "qti-variable-mapping") and Logic.eq(name, "target-identifier"), path, parent, valueDigest)';

COMMENT ON CONSTRAINT "__attribute_key_package_path_parent_value_digest_4k3ay3grnz" ON "qti"."attribute" IS 'key Attribute(package where Logic.eq(kind, "qti-weight") and Logic.eq(name, "identifier"), path, parent, valueDigest)';

COMMENT ON CONSTRAINT "__attribute_fk_package_path_start_copy_attributes_piufxgjpuc" ON "qti"."attribute" IS 'foreign key Attribute(package, path, start, the owner''s count of the family Node.attributes, governor, kind, parent) to Node(package, path, start, attributes, governor, kind, parent)';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_wov7msmueh"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_oi2bc5f6qf"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__judge_area_mapping_base_type_check_area_mapping_vbbvt7kxjl"() IS 'the rule judge''s block of rule check AreaMapping_base_type of AreaMappingBaseType over its units';

COMMENT ON FUNCTION "qti"."__judge_area_mapping_cardinality_check_area_mapping_6gv7d26uz7"() IS 'the rule judge''s block of rule check AreaMapping_base_type of AreaMappingCardinality over its units';

COMMENT ON FUNCTION "qti"."__judge_base_type_cardinality_check_declaration_base_65zmamfgpz"() IS 'the rule judge''s block of rule check Declaration_base_type of BaseTypeCardinality over its units';

COMMENT ON FUNCTION "qti"."__judge_binding_base_type_node_check_binding_fit_dtnmhn2xu6"() IS 'the rule judge''s block of rule check BindingFit of BindingBaseTypeNode over its units';

COMMENT ON FUNCTION "qti"."__judge_binding_cardinality_node_check_binding_fit_2j7szprjdn"() IS 'the rule judge''s block of rule check BindingFit of BindingCardinalityNode over its units';

COMMENT ON FUNCTION "qti"."__judge_cell_headers_form_check_e_1_derived_gp46bjlroi"() IS 'the rule judge''s block of rule check E1_derived of CellHeadersForm over its units';

COMMENT ON FUNCTION "qti"."__judge_declaration_name_check_reserved_type_nkekxotfo3"() IS 'the rule judge''s block of rule check Reserved_type of DeclarationName over its units';

COMMENT ON FUNCTION "qti"."__judge_declared_identifier_text_check_key_text_m6seqzyjan"() IS 'the rule judge''s block of rule check Key_text_bound of DeclaredIdentifierText over its units';

COMMENT ON FUNCTION "qti"."__judge_declared_placement_check_e_1_derived_ja6uhbay62"() IS 'the rule judge''s block of rule check E1_derived of DeclaredPlacement over its units';

COMMENT ON FUNCTION "qti"."__judge_dependency_resolved_check_self_dependency_3mpep6kyfo"() IS 'the rule judge''s block of rule check Self_dependency of DependencyResolved over its units';

COMMENT ON FUNCTION "qti"."__judge_feedback_ref_base_type_check_feedback_opv6x6hwk3"() IS 'the rule judge''s block of rule check Feedback_outcome_type of FeedbackRefBaseType over its units';

COMMENT ON FUNCTION "qti"."__judge_feedback_ref_cardinality_check_feedback_ld3w3sbyqa"() IS 'the rule judge''s block of rule check Feedback_outcome_type of FeedbackRefCardinality over its units';

COMMENT ON FUNCTION "qti"."__judge_field_value_text_check_typed_value_3fonowmjdy"() IS 'the rule judge''s block of rule check Typed_value of FieldValueText over its units';

COMMENT ON FUNCTION "qti"."__judge_item_read_check_e_1_derived_3bv7mipop2"() IS 'the rule judge''s block of rule check E1_derived of ItemRead over its units';

COMMENT ON FUNCTION "qti"."__judge_lookup_table_cardinality_check_lookup_table_d4wyndjih6"() IS 'the rule judge''s block of rule check Lookup_table_cardinality of LookupTableCardinality over its units';

COMMENT ON FUNCTION "qti"."__judge_lookup_value_type_check_typed_attribute_f5j4ascqkt"() IS 'the rule judge''s block of rule check Typed_attribute_value of LookupValueType over its units';

COMMENT ON FUNCTION "qti"."__judge_map_key_type_check_typed_attribute_value_navjfnrwuq"() IS 'the rule judge''s block of rule check Typed_attribute_value of MapKeyType over its units';

COMMENT ON FUNCTION "qti"."__judge_mapping_cardinality_check_mappable_base_type_7gln5pnyuv"() IS 'the rule judge''s block of rule check MappableBaseType of MappingCardinality over its units';

COMMENT ON FUNCTION "qti"."__judge_mastery_ceiling_check_mastery_range_4i2qquzstz"() IS 'the rule judge''s block of rule check Mastery_range of MasteryCeiling over its units';

COMMENT ON FUNCTION "qti"."__judge_mastery_floor_check_mastery_range_s5dxz43onz"() IS 'the rule judge''s block of rule check Mastery_range of MasteryFloor over its units';

COMMENT ON FUNCTION "qti"."__judge_math_operand_check_arity_zqvhbpyc45"() IS 'the rule judge''s block of rule check Arity of MathOperand over its units';

COMMENT ON FUNCTION "qti"."__judge_named_declaration_check_reserved_type_chrs422ywy"() IS 'the rule judge''s block of rule check Reserved_type of NamedDeclaration over its units';

COMMENT ON FUNCTION "qti"."__judge_non_container_strings_check_choice_bounds_kko2styb5d"() IS 'the rule judge''s block of rule check Choice_bounds of NonContainerStrings over its units';

COMMENT ON FUNCTION "qti"."__judge_pattern_text_check_pattern_language_iqe6dtd4lp"() IS 'the rule judge''s block of rule check Pattern_language of PatternText over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_binding_base_type_node_check_binding_xvhza5ewij"() IS 'the rule judge''s block of rule check BindingFit of PlacedBindingBaseTypeNode over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_binding_cardinality_node_check_phrzpun46t"() IS 'the rule judge''s block of rule check BindingFit of PlacedBindingCardinalityNode over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_single_binding_most_check_binding_a3chetzcdj"() IS 'the rule judge''s block of rule check Binding_cardinality of PlacedSingleBindingMost over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_base_check_e_1_derived_u7ameqp2wa"() IS 'the rule judge''s block of rule check E1_derived of PlacedVariableBase over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_cardinality_check_e_1_4tqyesyob5"() IS 'the rule judge''s block of rule check E1_derived of PlacedVariableCardinality over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_ref_declaration_check_mapped_dqjqvafv3k"() IS 'the rule judge''s block of rule check Mapped_response of PlacedVariableRefDeclaration over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_ref_declaration_check_rucmcgffwr"() IS 'the rule judge''s block of rule check Reference_type of PlacedVariableRefDeclaration over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_ref_declaration_check_lkx5utf5ih"() IS 'the rule judge''s block of rule check Template_reads of PlacedVariableRefDeclaration over its units';

COMMENT ON FUNCTION "qti"."__judge_pointer_parse_check_include_parse_xjjcr3lomz"() IS 'the rule judge''s block of rule check Include_parse of PointerParse over its units';

COMMENT ON FUNCTION "qti"."__judge_printed_integer_base_type_check_printed_3gvfsj3vqr"() IS 'the rule judge''s block of rule check Printed_variable_type of PrintedIntegerBaseType over its units';

COMMENT ON FUNCTION "qti"."__judge_printed_integer_cardinality_check_printed_ir26otjqgb"() IS 'the rule judge''s block of rule check Printed_variable_type of PrintedIntegerCardinality over its units';

COMMENT ON FUNCTION "qti"."__judge_reference_lexical_check_e_1_derived_so5wjosqpr"() IS 'the rule judge''s block of rule check E1_derived of ReferenceLexical over its units';

COMMENT ON FUNCTION "qti"."__judge_rooted_declaration_check_declaration_not_2inoiyq7e7"() IS 'the rule judge''s block of rule check Declaration_not_reserved of RootedDeclaration over its units';

COMMENT ON FUNCTION "qti"."__judge_scope_duration_read_check_e_1_derived_h4wkmwixwz"() IS 'the rule judge''s block of rule check E1_derived of ScopeDurationRead over its units';

COMMENT ON FUNCTION "qti"."__judge_scoped_dir_check_e_1_derived_wqbohu3ynf"() IS 'the rule judge''s block of rule check E1_derived of ScopedDir over its units';

COMMENT ON FUNCTION "qti"."__judge_set_cardinality_check_value_cardinality_rxpjhnrtxo"() IS 'the rule judge''s block of rule check Value_cardinality of SetCardinality over its units';

COMMENT ON FUNCTION "qti"."__judge_share_fragment_value_check_e_1_derived_kaj45dolum"() IS 'the rule judge''s block of rule check E1_derived of ShareFragmentValue over its units';

COMMENT ON FUNCTION "qti"."__judge_single_binding_most_check_binding_oohj5ytx5p"() IS 'the rule judge''s block of rule check Binding_cardinality of SingleBindingMost over its units';

COMMENT ON FUNCTION "qti"."__judge_srcset_form_check_e_1_derived_ryxd5oenjl"() IS 'the rule judge''s block of rule check E1_derived of SrcsetForm over its units';

COMMENT ON FUNCTION "qti"."__judge_template_ref_base_type_check_template_glvnjm7a4w"() IS 'the rule judge''s block of rule check Template_variable_type of TemplateRefBaseType over its units';

COMMENT ON FUNCTION "qti"."__judge_template_ref_cardinality_check_template_fsupn566fi"() IS 'the rule judge''s block of rule check Template_variable_type of TemplateRefCardinality over its units';

COMMENT ON FUNCTION "qti"."__judge_test_identifier_text_check_key_text_bound_ggh323bcnn"() IS 'the rule judge''s block of rule check Key_text_bound of TestIdentifierText over its units';

COMMENT ON FUNCTION "qti"."__judge_tolerance_form_check_e_1_derived_pcfjbbbgaw"() IS 'the rule judge''s block of rule check E1_derived of ToleranceForm over its units';

COMMENT ON FUNCTION "qti"."__judge_typed_href_check_document_entry_ofo6ycelmh"() IS 'the rule judge''s block of rule check Document_entry of TypedHref over its units';

COMMENT ON FUNCTION "qti"."__judge_typed_value_text_check_typed_value_ep6cgklmod"() IS 'the rule judge''s block of rule check Typed_value of TypedValueText over its units';

COMMENT ON FUNCTION "qti"."__judge_untyped_unweighted_check_e_1_derived_fakbzrmz2e"() IS 'the rule judge''s block of rule check E1_derived of UntypedUnweighted over its units';

COMMENT ON FUNCTION "qti"."__judge_untyped_weighted_check_e_1_derived_fthuaf7tx5"() IS 'the rule judge''s block of rule check E1_derived of UntypedWeighted over its units';

COMMENT ON FUNCTION "qti"."__judge_unweighted_read_check_e_1_derived_7ydhsfsob3"() IS 'the rule judge''s block of rule check E1_derived of UnweightedRead over its units';

COMMENT ON FUNCTION "qti"."__judge_variable_mapping_check_variable_mapping_5hxii7eg44"() IS 'the rule judge''s block of rule check Variable_mapping_target of VariableMapping over its units';

COMMENT ON FUNCTION "qti"."__judge_variable_ref_node_check_e_1_derived_6khs6glxa4"() IS 'the rule judge''s block of rule check E1_derived of VariableRefNode over its units';

COMMENT ON FUNCTION "qti"."__judge_weighted_base_type_check_weighted_base_7tjxvk6ikc"() IS 'the rule judge''s block of rule check Weighted_base of WeightedBaseType over its units';

COMMENT ON FUNCTION "qti"."__judge_weighted_read_check_e_1_derived_ydfdxp5t7y"() IS 'the rule judge''s block of rule check E1_derived of WeightedRead over its units';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_label_use_rje6oedm3s"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.in(kind, ["a", "abbr", "acronym", "address", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blockquote", "br", "caption", "cite", "code", "col", "colgroup", "dd", "details", "dfn", "div", "dl", "dt", "em", "figcaption", "figure", "footer", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr", "i", "img", "kbd", "label", "li", "nav", "object", "ol", "p", "picture", "pre", "q", "qti-assessment-item", "qti-associable-hotspot", "qti-associate-interaction", "qti-choice-interaction", "qti-custom-interaction", "qti-drawing-interaction", "qti-end-attempt-interaction", "qti-extended-text-interaction", "qti-feedback-block", "qti-feedback-block.template", "qti-feedback-inline", "qti-gap", "qti-gap-img", "qti-gap-match-interaction", "qti-gap-text", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-choice", "qti-hotspot-interaction", "qti-hottext", "qti-hottext-interaction", "qti-inline-choice", "qti-inline-choice-interaction", "qti-item-body", "qti-label", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-portable-custom-interaction", "qti-position-object-interaction", "qti-prompt", "qti-rubric-block", "qti-rubric-block.test", "qti-select-point-interaction", "qti-simple-associable-choice", "qti-simple-choice", "qti-slider-interaction", "qti-stimulus-body", "qti-template-block", "qti-template-block.rubric", "qti-template-inline", "qti-template-inline.rubric", "qti-text-entry-interaction", "qti-upload-interaction", "rb", "rp", "rt", "rtc", "ruby", "samp", "section", "small", "source", "span", "strong", "sub", "summary", "sup", "table", "tbody", "td", "tfoot", "th", "thead", "tr", "track", "tt", "ul", "var", "video"]) and Logic.eq(name, "label") in LabelUse(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_cell_headers_6rj74kepmr"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.in(kind, ["td", "th"]) and Logic.eq(name, "headers") in CellHeaders(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_attribute_lexical_kind_name_in_tolerance_v2hwhqrufg"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.in(lexical, ["absolute", "relative"]) and Logic.eq(kind, "qti-equal") and Logic.eq(name, "tolerance-mode") in Tolerance(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_lookup_value_ojilykz3xu"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.or(Logic.and(Logic.in(kind, ["qti-interpolation-table", "qti-match-table"]), Logic.eq(name, "default-value")), Logic.and(Logic.in(kind, ["qti-interpolation-table-entry", "qti-match-table-entry"]), Logic.eq(name, "target-value"))) in LookupValue(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_attribute_governor_kind_name_in_document_id_ifixnc7g7g"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.or(Logic.and(ValueIdentity.has(AttributeGrammar.at("domain", AttributeModelOf.at("model", governor), name)), Logic.eq(ValueIdentity.at("identity", AttributeGrammar.at("domain", AttributeModelOf.at("model", governor), name)), "ID")), Logic.and(Logic.eq(kind, "qti-context-declaration"), Logic.eq(name, "identifier"))) in DocumentId(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_ssml_scope_rw4l7s63tp"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.or(Logic.and(Logic.eq(kind, "ssml:lexicon"), Logic.eq(name, "xml:id")), Logic.and(Logic.eq(kind, "ssml:lookup"), Logic.eq(name, "ref")), Logic.and(Logic.eq(kind, "ssml:mark"), Logic.eq(name, "name")), Logic.and(Logic.eq(kind, "ssml:speak"), Logic.eq(name, "endmark")), Logic.and(Logic.eq(kind, "ssml:speak"), Logic.eq(name, "startmark"))) in SsmlScope(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_path_in_file_kqlxqwz3ex"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.eq(kind, "cp:file") and Logic.eq(name, "href") and Logic.eq(path, "imsmanifest.xml") in File(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_path_in_resource_href_lgp7s5robb"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.eq(kind, "cp:resource") and Logic.eq(name, "href") and Logic.eq(path, "imsmanifest.xml") in ResourceHref(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_stimulus_ref_einmgedfg3"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.eq(kind, "qti-assessment-stimulus-ref") and Logic.eq(name, "identifier") in StimulusRef(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_catalog_id_gzqjekduef"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.eq(kind, "qti-catalog") and Logic.eq(name, "id") in CatalogId(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_tolerance_niyhs3uhtw"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.eq(kind, "qti-equal") and Logic.eq(name, "tolerance") in Tolerance(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_map_key_dnl4rnpbte"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.eq(kind, "qti-map-entry") and Logic.eq(name, "map-key") in MapKey(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_pci_module_form_s2odm7jpxt"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.eq(kind, "qti-portable-custom-interaction") and Logic.eq(name, "module") in PciModuleForm(package, path, start) where Logic.eq(element, false) over its units';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_srcset_kc3ibi3dk5"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.eq(kind, "source") and Logic.eq(name, "srcset") in Srcset(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_table_header_6m5t5fabf5"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.eq(kind, "th") and Logic.eq(name, "id") in TableHeader(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_lexical_name_in_attribute_2kmanlylvo"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.eq(kind, "track") and Logic.eq(lexical, "subtitles") and Logic.eq(name, "kind") in Attribute(package, path, start) where Logic.eq(kind, "track") and Logic.eq(name, "srclang") over its units';

COMMENT ON FUNCTION "qti"."__judge_attribute_name_in_data_ssml_zfwrzzwctd"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.eq(name, "data-ssml") in DataSsml(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_attribute_name_in_catalog_scope_5bupg3cpf3"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.eq(name, "xml:lang") in CatalogScope(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_rounding_figures_hzws5jvlf3"() IS 'the rule judge''s block of rule Attribute(package, path, start, lexicalDigest) where Logic.in(kind, ["qti-equal-rounded", "qti-round-to"]) and Logic.eq(name, "figures") in RoundingFigures(package, path, start, figuresLexicalDigest) over its units';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_math_action_4bzlfcfrau"() IS 'the rule judge''s block of rule Attribute(package, path, start, lexicalDigest) where Logic.eq(kind, "m:maction") and Logic.eq(name, "selection") in MathAction(package, path, start, selectionLexicalDigest) where Logic.eq(selectionWritten, true) over its units';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_reference_x6575ljsdh"() IS 'the rule judge''s block of rule Attribute(package, path, start, name, kind) where Logic.in(ReferenceAttribute.at("form", kind, name), ["module", "package", "uri"]) in Reference(package, path, start, name, kind) over its units';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_interaction_attribute_kyvi2a2y3m"() IS 'the rule judge''s block of rule Attribute(package, path, start, name, kind, lexicalDigest) where Logic.or(Logic.in(name, ["aria-valuemax", "aria-valuemin"]), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-context-variable", "qti-gap", "qti-gap-img", "qti-gap-text", "qti-hotspot-choice", "qti-hottext", "qti-inline-choice", "qti-printed-variable", "qti-simple-associable-choice", "qti-simple-choice"]), Logic.eq(name, "identifier")), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-gap", "qti-gap-img", "qti-gap-text", "qti-hotspot-choice", "qti-hottext", "qti-inline-choice", "qti-simple-associable-choice", "qti-simple-choice", "qti-template-block", "qti-template-block.rubric", "qti-template-inline", "qti-template-inline.rubric", "qti-template-variable"]), Logic.eq(name, "template-identifier")), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-gap-img", "qti-gap-text", "qti-simple-associable-choice"]), Logic.eq(name, "match-max")), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-gap-img", "qti-gap-text", "qti-simple-associable-choice"]), Logic.eq(name, "match-min")), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-hotspot-choice"]), Logic.eq(name, "shape")), Logic.and(Logic.in(kind, ["qti-associate-interaction", "qti-choice-interaction", "qti-custom-interaction", "qti-drawing-interaction", "qti-end-attempt-interaction", "qti-extended-text-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-inline-choice-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-portable-custom-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-slider-interaction", "qti-text-entry-interaction", "qti-upload-interaction"]), Logic.eq(name, "response-identifier")), Logic.and(Logic.in(kind, ["qti-associate-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-match-interaction"]), Logic.eq(name, "max-associations")), Logic.and(Logic.in(kind, ["qti-associate-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-match-interaction"]), Logic.eq(name, "min-associations")), Logic.and(Logic.in(kind, ["qti-choice-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-order-interaction", "qti-position-object-interaction", "qti-select-point-interaction"]), Logic.eq(name, "max-choices")), Logic.and(Logic.in(kind, ["qti-choice-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-order-interaction", "qti-position-object-interaction", "qti-select-point-interaction"]), Logic.eq(name, "min-choices")), Logic.and(Logic.in(kind, ["qti-extended-text-interaction", "qti-text-entry-interaction"]), Logic.eq(name, "string-identifier")), Logic.and(Logic.in(kind, ["qti-feedback-block", "qti-feedback-block.template", "qti-feedback-inline", "qti-modal-feedback", "qti-test-feedback"]), Logic.eq(name, "outcome-identifier")), Logic.and(Logic.eq(kind, "qti-assessment-item"), Logic.eq(name, "adaptive")), Logic.and(Logic.eq(kind, "qti-extended-text-interaction"), Logic.eq(name, "max-strings")), Logic.and(Logic.eq(kind, "qti-extended-text-interaction"), Logic.eq(name, "min-strings")), Logic.and(Logic.eq(kind, "qti-media-interaction"), Logic.eq(name, "max-plays")), Logic.and(Logic.eq(kind, "qti-media-interaction"), Logic.eq(name, "min-plays")), Logic.and(Logic.eq(kind, "qti-printed-variable"), Logic.eq(name, "base")), Logic.and(Logic.eq(kind, "qti-printed-variable"), Logic.eq(name, "index")), Logic.and(Logic.eq(kind, "qti-slider-interaction"), Logic.eq(name, "lower-bound")), Logic.and(Logic.eq(kind, "qti-slider-interaction"), Logic.eq(name, "upper-bound"))) in InteractionAttribute(package, path, start, name, kind, lexicalDigest) over its units';

COMMENT ON FUNCTION "qti"."__judge_attribute_name_kind_in_cn_attribute_gbduvb54v4"() IS 'the rule judge''s block of rule Attribute(package, path, start, name, lexicalDigest) where Logic.in(name, ["base", "type"]) and Logic.eq(kind, "m:cn") in CnAttribute(package, path, start, name, lexicalDigest) over its units';

COMMENT ON FUNCTION "qti"."__judge_binary_math_operator_in_expression_operand_p4suu7whs6"() IS 'the rule judge''s block of rule BinaryMathOperator(package, path, start) in ExpressionOperand(package, path, operator) where Logic.eq(rank, 2n) over its units';

COMMENT ON FUNCTION "qti"."__judge_binding_base_type_node_in_binding_fit_y7mxaaewyf"() IS 'the rule judge''s block of rule BindingBaseTypeNode(baseType, cardinality, kind) where Logic.not(Logic.in(kind, ["qti-custom-interaction", "qti-order-interaction", "qti-portable-custom-interaction"])) and Logic.eq(attribute, "response-identifier") and Logic.ne(cardinality, "record") in BindingFit(baseType, cardinality, kind) over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_binding_cardinality_node_in_record_binding_iclnept6fm"() IS 'the rule judge''s block of rule BindingCardinalityNode(kind) where Logic.not(Logic.in(kind, ["qti-custom-interaction", "qti-order-interaction", "qti-portable-custom-interaction"])) and Logic.eq(attribute, "response-identifier") and Logic.eq(cardinality, "record") in RecordBindingFit(kind) over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_binding_cardinality_node_in_count_bound_qp5cv5srpi"() IS 'the rule judge''s block of rule BindingCardinalityNode(package, path, start) where Logic.in(cardinality, ["multiple", "ordered"]) and Logic.eq(attribute, "response-identifier") and Logic.eq(kind, "qti-extended-text-interaction") in CountBound(package, path, start) where Logic.eq(maxWritten, true) over its units';

COMMENT ON FUNCTION "qti"."__judge_bound_variable_in_named_declaration_6vnbbbteq4"() IS 'the rule judge''s block of rule BoundVariable(package, path, identifier) in NamedDeclaration(package, path, identifier) where Logic.eq(declarationKind, "qti-response-declaration") over its units';

COMMENT ON FUNCTION "qti"."__judge_branch_resolution_in_resolved_branch_rule_ozlq6aqbel"() IS 'the rule judge''s block of rule BranchResolution(package, assembly, instance, start) in ResolvedBranchRule(package, assembly, instance, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_catalog_id_in_attribute_pqhnv53vai"() IS 'the rule judge''s block of rule CatalogId(package, path, start) in Attribute(package, path, start) where Logic.eq(kind, "qti-catalog") and Logic.eq(name, "id") over its units';

COMMENT ON FUNCTION "qti"."__judge_catalog_id_in_id_value_7k7it37zjd"() IS 'the rule judge''s block of rule CatalogId(package, path, start, id, owner) in IdValue(package, path, start, id, owner) over its units';

COMMENT ON FUNCTION "qti"."__judge_cell_headers_in_attribute_gpr2rsg5ft"() IS 'the rule judge''s block of rule CellHeaders(package, path, start) in Attribute(package, path, start) where Logic.in(kind, ["td", "th"]) and Logic.eq(name, "headers") over its units';

COMMENT ON FUNCTION "qti"."__judge_choice_or_hottext_in_unclaimed_name_uyxncalelf"() IS 'the rule judge''s block of rule ChoiceOrHottext(package, path, identifier) in UnclaimedName(package, path, identifier) over its units';

COMMENT ON FUNCTION "qti"."__judge_cn_attribute_in_attribute_3xf3sgzpk5"() IS 'the rule judge''s block of rule CnAttribute(package, path, start, name) in Attribute(package, path, start, name) where Logic.in(name, ["base", "type"]) and Logic.eq(kind, "m:cn") over its units';

COMMENT ON FUNCTION "qti"."__judge_context_ref_in_referable_name_6jyxlcw7hc"() IS 'the rule judge''s block of rule ContextRef(package, path, identifier, kind, attribute) where Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "completionStatus", "duration", "numAttempts"])), Logic.ne(assemblyKind, "qti-assessment-item")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "completionStatus", "duration", "numAttempts"])), Logic.ne(assemblyKind, "qti-response-processing")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "duration"])), Logic.ne(assemblyKind, "qti-assessment-section")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "duration"])), Logic.ne(assemblyKind, "qti-assessment-test")) in ReferableName(package, path, identifier, kind, attribute) over its units';

COMMENT ON FUNCTION "qti"."__judge_data_ssml_in_attribute_uvw3l5spfp"() IS 'the rule judge''s block of rule DataSsml(package, path, start) in Attribute(package, path, start) where Logic.eq(name, "data-ssml") over its units';

COMMENT ON FUNCTION "qti"."__judge_declaration_cardinality_in_attribute_is6owvhjpo"() IS 'the rule judge''s block of rule DeclarationCardinality(package, path, start) where Logic.ne(code, "record") in Attribute(package, path, start) where Logic.in(kind, ["qti-context-declaration", "qti-outcome-declaration", "qti-response-declaration", "qti-template-declaration"]) and Logic.eq(name, "base-type") over its units';

COMMENT ON FUNCTION "qti"."__judge_dependency_in_dependency_resolved_vfeitpjvvg"() IS 'the rule judge''s block of rule Dependency(package, start) in DependencyResolved(package, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_described_assembled_lang_in_listed_lang_nhbllkmfq3"() IS 'the rule judge''s block of rule DescribedAssembledLang(package, path, general, value) in ListedLang(package, path, general, lang) over its units';

COMMENT ON FUNCTION "qti"."__judge_described_lang_in_listed_lang_xwyz4nje2x"() IS 'the rule judge''s block of rule DescribedLang(package, path, general, value) in ListedLang(package, path, general, lang) over its units';

COMMENT ON FUNCTION "qti"."__judge_document_id_owner_start_in_attribute_nufbfglgmt"() IS 'the rule judge''s block of rule DocumentId(package, path, start) where Logic.eq(owner, start) in Attribute(package, path, start) where Logic.or(Logic.and(ValueIdentity.has(AttributeGrammar.at("domain", AttributeModelOf.at("model", governor), name)), Logic.eq(ValueIdentity.at("identity", AttributeGrammar.at("domain", AttributeModelOf.at("model", governor), name)), "ID")), Logic.and(Logic.eq(kind, "qti-context-declaration"), Logic.eq(name, "identifier"))) over its units';

COMMENT ON FUNCTION "qti"."__judge_expression_attribute_in_placed_expression_xeyalbrfdv"() IS 'the rule judge''s block of rule ExpressionAttribute(package, assembly, instance, path, start, baseType) in PlacedExpression(package, assembly, instance, path, start, baseType) over its units';

COMMENT ON FUNCTION "qti"."__judge_feedback_ref_in_referable_name_hase3mb2yu"() IS 'the rule judge''s block of rule FeedbackRef(package, path, identifier, kind, attribute) where Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "completionStatus", "duration", "numAttempts"])), Logic.ne(assemblyKind, "qti-assessment-item")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "completionStatus", "duration", "numAttempts"])), Logic.ne(assemblyKind, "qti-response-processing")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "duration"])), Logic.ne(assemblyKind, "qti-assessment-section")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "duration"])), Logic.ne(assemblyKind, "qti-assessment-test")) in ReferableName(package, path, identifier, kind, attribute) over its units';

COMMENT ON FUNCTION "qti"."__judge_fragment_context_ref_in_referable_name_kf5sx5zq6m"() IS 'the rule judge''s block of rule FragmentContextRef(package, assembly, identifier, kind, attribute) where Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "completionStatus", "duration", "numAttempts"])), Logic.ne(assemblyKind, "qti-assessment-item")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "completionStatus", "duration", "numAttempts"])), Logic.ne(assemblyKind, "qti-response-processing")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "duration"])), Logic.ne(assemblyKind, "qti-assessment-section")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "duration"])), Logic.ne(assemblyKind, "qti-assessment-test")) in ReferableName(package, path, identifier, kind, attribute) over its units';

COMMENT ON FUNCTION "qti"."__judge_fragment_feedback_ref_in_referable_name_42k4flshr2"() IS 'the rule judge''s block of rule FragmentFeedbackRef(package, assembly, identifier, kind, attribute) where Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "completionStatus", "duration", "numAttempts"])), Logic.ne(assemblyKind, "qti-assessment-item")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "completionStatus", "duration", "numAttempts"])), Logic.ne(assemblyKind, "qti-response-processing")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "duration"])), Logic.ne(assemblyKind, "qti-assessment-section")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "duration"])), Logic.ne(assemblyKind, "qti-assessment-test")) in ReferableName(package, path, identifier, kind, attribute) over its units';

COMMENT ON FUNCTION "qti"."__judge_fragment_printed_ref_in_referable_name_i4xzia32qh"() IS 'the rule judge''s block of rule FragmentPrintedRef(package, assembly, identifier, kind, attribute) where Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "completionStatus", "duration", "numAttempts"])), Logic.ne(assemblyKind, "qti-assessment-item")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "completionStatus", "duration", "numAttempts"])), Logic.ne(assemblyKind, "qti-response-processing")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "duration"])), Logic.ne(assemblyKind, "qti-assessment-section")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "duration"])), Logic.ne(assemblyKind, "qti-assessment-test")) in ReferableName(package, path, identifier, kind, attribute) over its units';

COMMENT ON FUNCTION "qti"."__judge_fragment_template_ref_in_referable_name_cdumewvips"() IS 'the rule judge''s block of rule FragmentTemplateRef(package, assembly, identifier, kind, attribute) where Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "completionStatus", "duration", "numAttempts"])), Logic.ne(assemblyKind, "qti-assessment-item")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "completionStatus", "duration", "numAttempts"])), Logic.ne(assemblyKind, "qti-response-processing")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "duration"])), Logic.ne(assemblyKind, "qti-assessment-section")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "duration"])), Logic.ne(assemblyKind, "qti-assessment-test")) in ReferableName(package, path, identifier, kind, attribute) over its units';

COMMENT ON FUNCTION "qti"."__judge_idref_target_in_id_binding_bfejuvrwcd"() IS 'the rule judge''s block of rule IdrefTarget(package, path, id) where Logic.eq(assembled, false) in IdBinding(package, path, id) over its units';

COMMENT ON FUNCTION "qti"."__judge_interaction_attribute_in_attribute_jz3fi7myti"() IS 'the rule judge''s block of rule InteractionAttribute(package, path, start, name) in Attribute(package, path, start, name) where Logic.or(Logic.in(name, ["aria-valuemax", "aria-valuemin"]), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-context-variable", "qti-gap", "qti-gap-img", "qti-gap-text", "qti-hotspot-choice", "qti-hottext", "qti-inline-choice", "qti-printed-variable", "qti-simple-associable-choice", "qti-simple-choice"]), Logic.eq(name, "identifier")), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-gap", "qti-gap-img", "qti-gap-text", "qti-hotspot-choice", "qti-hottext", "qti-inline-choice", "qti-simple-associable-choice", "qti-simple-choice", "qti-template-block", "qti-template-block.rubric", "qti-template-inline", "qti-template-inline.rubric", "qti-template-variable"]), Logic.eq(name, "template-identifier")), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-gap-img", "qti-gap-text", "qti-simple-associable-choice"]), Logic.eq(name, "match-max")), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-gap-img", "qti-gap-text", "qti-simple-associable-choice"]), Logic.eq(name, "match-min")), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-hotspot-choice"]), Logic.eq(name, "shape")), Logic.and(Logic.in(kind, ["qti-associate-interaction", "qti-choice-interaction", "qti-custom-interaction", "qti-drawing-interaction", "qti-end-attempt-interaction", "qti-extended-text-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-inline-choice-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-portable-custom-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-slider-interaction", "qti-text-entry-interaction", "qti-upload-interaction"]), Logic.eq(name, "response-identifier")), Logic.and(Logic.in(kind, ["qti-associate-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-match-interaction"]), Logic.eq(name, "max-associations")), Logic.and(Logic.in(kind, ["qti-associate-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-match-interaction"]), Logic.eq(name, "min-associations")), Logic.and(Logic.in(kind, ["qti-choice-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-order-interaction", "qti-position-object-interaction", "qti-select-point-interaction"]), Logic.eq(name, "max-choices")), Logic.and(Logic.in(kind, ["qti-choice-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-order-interaction", "qti-position-object-interaction", "qti-select-point-interaction"]), Logic.eq(name, "min-choices")), Logic.and(Logic.in(kind, ["qti-extended-text-interaction", "qti-text-entry-interaction"]), Logic.eq(name, "string-identifier")), Logic.and(Logic.in(kind, ["qti-feedback-block", "qti-feedback-block.template", "qti-feedback-inline", "qti-modal-feedback", "qti-test-feedback"]), Logic.eq(name, "outcome-identifier")), Logic.and(Logic.eq(kind, "qti-assessment-item"), Logic.eq(name, "adaptive")), Logic.and(Logic.eq(kind, "qti-extended-text-interaction"), Logic.eq(name, "max-strings")), Logic.and(Logic.eq(kind, "qti-extended-text-interaction"), Logic.eq(name, "min-strings")), Logic.and(Logic.eq(kind, "qti-media-interaction"), Logic.eq(name, "max-plays")), Logic.and(Logic.eq(kind, "qti-media-interaction"), Logic.eq(name, "min-plays")), Logic.and(Logic.eq(kind, "qti-printed-variable"), Logic.eq(name, "base")), Logic.and(Logic.eq(kind, "qti-printed-variable"), Logic.eq(name, "index")), Logic.and(Logic.eq(kind, "qti-slider-interaction"), Logic.eq(name, "lower-bound")), Logic.and(Logic.eq(kind, "qti-slider-interaction"), Logic.eq(name, "upper-bound"))) over its units';

COMMENT ON FUNCTION "qti"."__judge_interpolated_lookup_in_declaration_table_ixycsyexgq"() IS 'the rule judge''s block of rule InterpolatedLookup(package, assembly, declaration) in DeclarationTable(package, path, declaration) where Logic.eq(kind, "qti-interpolation-table") over its units';

COMMENT ON FUNCTION "qti"."__judge_item_mapping_in_named_declaration_owdypizzmf"() IS 'the rule judge''s block of rule ItemMapping(package, item, source) in NamedDeclaration(package, path, identifier) where Logic.eq(declarationKind, "qti-outcome-declaration") over its units';

COMMENT ON FUNCTION "qti"."__judge_item_mapping_in_free_mapping_target_tenhs4ieej"() IS 'the rule judge''s block of rule ItemMapping(package, path, start) in FreeMappingTarget(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_item_ref_document_in_item_ref_target_rk6hubkxqc"() IS 'the rule judge''s block of rule ItemRefDocument(package, path, start, target) in ItemRefTarget(package, path, start, target) where Logic.eq(type, "imsqti_item_xmlv3p0") over its units';

COMMENT ON FUNCTION "qti"."__judge_item_ref_target_in_item_ref_document_ouldl2v5q6"() IS 'the rule judge''s block of rule ItemRefTarget(package, path, start, target) where Logic.eq(type, "imsqti_item_xmlv3p0") in ItemRefDocument(package, path, start, target) over its units';

COMMENT ON FUNCTION "qti"."__judge_item_template_default_in_named_declaration_bmob724qxy"() IS 'the rule judge''s block of rule ItemTemplateDefault(package, item, template) in NamedDeclaration(package, path, identifier) where Logic.eq(declarationKind, "qti-template-declaration") over its units';

COMMENT ON FUNCTION "qti"."__judge_label_use_root_kind_in_attribute_bclr5yhwul"() IS 'the rule judge''s block of rule LabelUse(package, path) where Logic.eq(rootKind, "qti-assessment-item") in Attribute(package, path) where Logic.eq(kind, "qti-assessment-item") and Logic.eq(name, "tool-name") over its units';

COMMENT ON FUNCTION "qti"."__judge_label_use_root_kind_in_attribute_sfrrvr2tfc"() IS 'the rule judge''s block of rule LabelUse(package, path) where Logic.eq(rootKind, "qti-assessment-item") in Attribute(package, path) where Logic.eq(kind, "qti-assessment-item") and Logic.eq(name, "tool-version") over its units';

COMMENT ON FUNCTION "qti"."__judge_label_use_in_attribute_wjtcctmhbe"() IS 'the rule judge''s block of rule LabelUse(package, path, start) in Attribute(package, path, start) where Logic.in(kind, ["a", "abbr", "acronym", "address", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blockquote", "br", "caption", "cite", "code", "col", "colgroup", "dd", "details", "dfn", "div", "dl", "dt", "em", "figcaption", "figure", "footer", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr", "i", "img", "kbd", "label", "li", "nav", "object", "ol", "p", "picture", "pre", "q", "qti-assessment-item", "qti-associable-hotspot", "qti-associate-interaction", "qti-choice-interaction", "qti-custom-interaction", "qti-drawing-interaction", "qti-end-attempt-interaction", "qti-extended-text-interaction", "qti-feedback-block", "qti-feedback-block.template", "qti-feedback-inline", "qti-gap", "qti-gap-img", "qti-gap-match-interaction", "qti-gap-text", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-choice", "qti-hotspot-interaction", "qti-hottext", "qti-hottext-interaction", "qti-inline-choice", "qti-inline-choice-interaction", "qti-item-body", "qti-label", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-portable-custom-interaction", "qti-position-object-interaction", "qti-prompt", "qti-rubric-block", "qti-rubric-block.test", "qti-select-point-interaction", "qti-simple-associable-choice", "qti-simple-choice", "qti-slider-interaction", "qti-stimulus-body", "qti-template-block", "qti-template-block.rubric", "qti-template-inline", "qti-template-inline.rubric", "qti-text-entry-interaction", "qti-upload-interaction", "rb", "rp", "rt", "rtc", "ruby", "samp", "section", "small", "source", "span", "strong", "sub", "summary", "sup", "table", "tbody", "td", "tfoot", "th", "thead", "tr", "track", "tt", "ul", "var", "video"]) and Logic.eq(name, "label") over its units';

COMMENT ON FUNCTION "qti"."__judge_listed_identifier_in_matched_identifier_jjfezvshvn"() IS 'the rule judge''s block of rule ListedIdentifier(package, path, record) in MatchedIdentifier(package, path, record) over its units';

COMMENT ON FUNCTION "qti"."__judge_listed_title_in_matched_title_kgmlfutjrq"() IS 'the rule judge''s block of rule ListedTitle(package, path, record) in MatchedTitle(package, path, record) over its units';

COMMENT ON FUNCTION "qti"."__judge_lookup_value_in_attribute_nbja5pznlf"() IS 'the rule judge''s block of rule LookupValue(package, path, start) in Attribute(package, path, start) where Logic.or(Logic.and(Logic.in(kind, ["qti-interpolation-table", "qti-match-table"]), Logic.eq(name, "default-value")), Logic.and(Logic.in(kind, ["qti-interpolation-table-entry", "qti-match-table-entry"]), Logic.eq(name, "target-value"))) over its units';

COMMENT ON FUNCTION "qti"."__judge_lookup_value_in_lookup_attribute_text_c7hhudf667"() IS 'the rule judge''s block of rule LookupValue(package, path, start, value) in LookupAttributeText(package, path, start, lexical) over its units';

COMMENT ON FUNCTION "qti"."__judge_map_key_in_map_key_attribute_text_m7gkjtn7xu"() IS 'the rule judge''s block of rule MapKey(package, path, start, key) in MapKeyAttributeText(package, path, start, value) over its units';

COMMENT ON FUNCTION "qti"."__judge_mapping_base_type_in_mappable_base_type_vmi22ubulw"() IS 'the rule judge''s block of rule MappingBaseType(baseType) in MappableBaseType(baseType) over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_math_action_selection_written_in_attribute_g4vou3atrw"() IS 'the rule judge''s block of rule MathAction(package, path, start) where Logic.eq(selectionWritten, true) in Attribute(package, path, start) where Logic.eq(kind, "m:maction") and Logic.eq(name, "selection") over its units';

COMMENT ON FUNCTION "qti"."__judge_math_align_scope_in_scoped_dir_fq3qe27snp"() IS 'the rule judge''s block of rule MathAlignScope(package, path, start, own) where Logic.ne(inherited, own) in ScopedDir(package, path, start, direction) over its units';

COMMENT ON FUNCTION "qti"."__judge_named_in_test_identifier_syehmpldfc"() IS 'the rule judge''s block of rule Named(package, path, start, identifier) in TestIdentifier(package, path, start, value) over its units';

COMMENT ON FUNCTION "qti"."__judge_named_item_ref_in_object_identifier_62wj7qla5o"() IS 'the rule judge''s block of rule NamedItemRef(package, item, identifier) in ObjectIdentifier(package, path, value) over its units';

COMMENT ON FUNCTION "qti"."__judge_numbered_reading_in_numbered_target_dsbi3oxtg2"() IS 'the rule judge''s block of rule NumberedReading(package, assembly, scope, scopeInstance, scopePath, variable) in NumberedTarget(package, assembly, scope, scopeInstance, scopePath, variable) over its units';

COMMENT ON FUNCTION "qti"."__judge_numbered_reading_in_assembled_replaceable_ijilkt3uhd"() IS 'the rule judge''s block of rule NumberedReading(package, assembly, scopeInstance, scopePath, scope) in AssembledReplaceable(package, assembly, instance, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_packaged_template_default_in_item_ref_33osfbsdkp"() IS 'the rule judge''s block of rule PackagedTemplateDefault(package, path, ref) in ItemRefDocument(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_pci_module_form_element_in_attribute_oedywbf57n"() IS 'the rule judge''s block of rule PciModuleForm(package, path, start) where Logic.eq(element, false) in Attribute(package, path, start) where Logic.eq(kind, "qti-portable-custom-interaction") and Logic.eq(name, "module") over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_binding_in_named_declaration_laa4jy7plq"() IS 'the rule judge''s block of rule PlacedBinding(package, assembly, identifier) in NamedDeclaration(package, path, identifier) where Logic.eq(declarationKind, "qti-response-declaration") over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_binding_base_type_node_in_binding_fit_jq37ljyvup"() IS 'the rule judge''s block of rule PlacedBindingBaseTypeNode(baseType, cardinality, kind) where Logic.not(Logic.in(kind, ["qti-custom-interaction", "qti-order-interaction", "qti-portable-custom-interaction"])) and Logic.eq(attribute, "response-identifier") and Logic.ne(cardinality, "record") in BindingFit(baseType, cardinality, kind) over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_placed_binding_cardinality_node_in_record_cwvy6luker"() IS 'the rule judge''s block of rule PlacedBindingCardinalityNode(kind) where Logic.not(Logic.in(kind, ["qti-custom-interaction", "qti-order-interaction", "qti-portable-custom-interaction"])) and Logic.eq(attribute, "response-identifier") and Logic.eq(cardinality, "record") in RecordBindingFit(kind) over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_placed_binding_cardinality_node_in_count_l23umml5ll"() IS 'the rule judge''s block of rule PlacedBindingCardinalityNode(package, path, start) where Logic.in(cardinality, ["multiple", "ordered"]) and Logic.eq(attribute, "response-identifier") and Logic.eq(kind, "qti-extended-text-interaction") in CountBound(package, path, start) where Logic.eq(maxWritten, true) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_choice_or_hottext_in_unclaimed_name_dqd4nmh3tg"() IS 'the rule judge''s block of rule PlacedChoiceOrHottext(package, assembly, identifier) in UnclaimedName(package, path, identifier) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_expression_in_placed_expression_site_c6a4sqoxzi"() IS 'the rule judge''s block of rule PlacedExpression(package, assembly, instance, path, start) in PlacedExpressionSite(package, assembly, instance, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_expression_site_in_placed_expression_xxvjz7jkff"() IS 'the rule judge''s block of rule PlacedExpressionSite(package, assembly, instance, path, start) in PlacedExpression(package, assembly, instance, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_filter_in_filtered_section_f5dn7wucxk"() IS 'the rule judge''s block of rule PlacedFilter(package, assembly, path, start) in FilteredSection(package, assembly, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_id_in_id_value_ome55phaff"() IS 'the rule judge''s block of rule PlacedId(package, path, start, id, owner) in IdValue(package, path, start, id, owner) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_reference_site_in_placed_variable_ref_vuvtx5sfhd"() IS 'the rule judge''s block of rule PlacedReferenceSite(package, assembly, instance, path, start, attribute, identifier) in PlacedVariableRef(package, assembly, instance, path, start, attribute, identifier) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_test_reference_in_test_reading_t2qjsabvhp"() IS 'the rule judge''s block of rule PlacedTestReference(package, assembly, path, start, attribute) in TestReading(package, assembly, path, start, attribute) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_declaration_in_typed_3vj5q5cetd"() IS 'the rule judge''s block of rule PlacedVariableDeclaration(package, declPath, declStart) where Logic.ne(baseType, "unknown") in TypedDeclarationName(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_ref_in_named_declaration_lqohxzzyqo"() IS 'the rule judge''s block of rule PlacedVariableRef(package, assembly, identifier) where Logic.eq(resolution, "declared") in NamedDeclaration(package, path, identifier) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_ref_in_sole_reading_jagikyuxss"() IS 'the rule judge''s block of rule PlacedVariableRef(package, assembly, instance, path, start, attribute) where Logic.eq(resolution, "read") in SoleReading(package, assembly, instance, path, start, attribute) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_ref_in_placed_reference_site_5ewlmg7v6r"() IS 'the rule judge''s block of rule PlacedVariableRef(package, assembly, instance, path, start, attribute, identifier) in PlacedReferenceSite(package, assembly, instance, path, start, attribute, identifier) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_ref_declaration_in_reference_reyey4lu3w"() IS 'the rule judge''s block of rule PlacedVariableRefDeclaration(kind, attribute, declarationKind) where Logic.eq(attribute, "identifier") in ReferenceDeclaration(kind, attribute, declaration) over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_ref_declaration_in_3la5v6erpg"() IS 'the rule judge''s block of rule PlacedVariableRefDeclaration(package, assembly, declaration) where Logic.eq(attribute, "identifier") and Logic.eq(kind, "qti-lookup-outcome-value") in DeclarationTable(package, path, declaration) where Logic.in(kind, ["qti-interpolation-table", "qti-match-table"]) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_ref_declaration_in_xo34jozlnj"() IS 'the rule judge''s block of rule PlacedVariableRefDeclaration(package, assembly, declaration) where Logic.eq(attribute, "identifier") and Logic.eq(kind, "qti-map-response") in DeclarationTable(package, path, declaration) where Logic.eq(kind, "qti-mapping") over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_ref_declaration_in_nawbh4uthe"() IS 'the rule judge''s block of rule PlacedVariableRefDeclaration(package, assembly, declaration) where Logic.eq(attribute, "identifier") and Logic.eq(kind, "qti-map-response-point") in DeclarationTable(package, path, declaration) where Logic.eq(kind, "qti-area-mapping") over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_weighted_variable_in_item_scoped_5nc7mpyg7v"() IS 'the rule judge''s block of rule PlacedWeightedVariable(package, assembly, path, start) in ItemScopedReading(package, assembly, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_prefixed_declaration_in_reference_gqrpbyy3ks"() IS 'the rule judge''s block of rule PrefixedDeclaration(kind, attribute, declarationKind) in ReferenceDeclaration(kind, attribute, declaration) over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_prefixed_map_response_in_item_ref_table_drfjtnkj7w"() IS 'the rule judge''s block of rule PrefixedMapResponse(package, scopePath, scope, variable) in ItemRefTable(package, path, start, variable) where Logic.eq(table, "qti-mapping") over its units';

COMMENT ON FUNCTION "qti"."__judge_prefixed_map_response_point_in_item_ref_qugmtxiwgf"() IS 'the rule judge''s block of rule PrefixedMapResponsePoint(package, scopePath, scope, variable) in ItemRefTable(package, path, start, variable) where Logic.eq(table, "qti-area-mapping") over its units';

COMMENT ON FUNCTION "qti"."__judge_printed_variable_ref_in_referable_name_kth7oea7g2"() IS 'the rule judge''s block of rule PrintedVariableRef(package, path, identifier, kind, attribute) where Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "completionStatus", "duration", "numAttempts"])), Logic.ne(assemblyKind, "qti-assessment-item")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "completionStatus", "duration", "numAttempts"])), Logic.ne(assemblyKind, "qti-response-processing")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "duration"])), Logic.ne(assemblyKind, "qti-assessment-section")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "duration"])), Logic.ne(assemblyKind, "qti-assessment-test")) in ReferableName(package, path, identifier, kind, attribute) over its units';

COMMENT ON FUNCTION "qti"."__judge_read_include_in_site_fcdzu2tgyv"() IS 'the rule judge''s block of rule ReadInclude(package, path, start) in Site(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_record_set_value_in_attribute_pamcgaegai"() IS 'the rule judge''s block of rule RecordSetValue(package, path, start) in Attribute(package, path, start) where Logic.eq(kind, "qti-value") and Logic.eq(name, "base-type") over its units';

COMMENT ON FUNCTION "qti"."__judge_record_set_value_in_attribute_syg2uc77ur"() IS 'the rule judge''s block of rule RecordSetValue(package, path, start) in Attribute(package, path, start) where Logic.eq(kind, "qti-value") and Logic.eq(name, "field-identifier") over its units';

COMMENT ON FUNCTION "qti"."__judge_reference_in_attribute_bfpwsn2hml"() IS 'the rule judge''s block of rule Reference(package, path, start, name) in Attribute(package, path, start, name) where Logic.in(ReferenceAttribute.at("form", kind, name), ["module", "package", "uri"]) over its units';

COMMENT ON FUNCTION "qti"."__judge_required_parts_in_requirement_met_pfkli5s36z"() IS 'the rule judge''s block of rule RequiredParts(package, path, section) in RequirementMet(package, path, section) over its units';

COMMENT ON FUNCTION "qti"."__judge_resource_document_in_typed_path_imht7jyi3v"() IS 'the rule judge''s block of rule ResourceDocument(package, path, type) in TypedPath(package, target, type) over its units';

COMMENT ON FUNCTION "qti"."__judge_resource_href_in_attribute_gnyao4wi75"() IS 'the rule judge''s block of rule ResourceHref(package, path, start) in Attribute(package, path, start) where Logic.eq(kind, "cp:resource") and Logic.eq(name, "href") and Logic.eq(path, "imsmanifest.xml") over its units';

COMMENT ON FUNCTION "qti"."__judge_rounding_in_rounding_mode_6geuz5667c"() IS 'the rule judge''s block of rule Rounding(package, path, start) where Logic.in(holds, ["both", "mode"]) in RoundingMode(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_rounding_figures_in_attribute_jlrjkodwew"() IS 'the rule judge''s block of rule RoundingFigures(package, path, start) in Attribute(package, path, start) where Logic.in(kind, ["qti-equal-rounded", "qti-round-to"]) and Logic.eq(name, "figures") over its units';

COMMENT ON FUNCTION "qti"."__judge_rounding_mode_in_rounding_esbh5hi542"() IS 'the rule judge''s block of rule RoundingMode(package, path, start) in Rounding(package, path, start) where Logic.in(holds, ["both", "mode"]) over its units';

COMMENT ON FUNCTION "qti"."__judge_rounding_mode_figures_in_rounding_mode_5zudd4zspn"() IS 'the rule judge''s block of rule RoundingModeFigures(package, path, start, mode) in RoundingMode(package, path, start, mode) over its units';

COMMENT ON FUNCTION "qti"."__judge_selection_without_replacement_in_bounded_rq3pwixcla"() IS 'the rule judge''s block of rule SelectionWithoutReplacement(package, path, section) in BoundedSelection(package, path, section) over its units';

COMMENT ON FUNCTION "qti"."__judge_share_fragment_in_share_source_pz2yiw3tyu"() IS 'the rule judge''s block of rule ShareFragment(package, path, start) in ShareSource(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_share_source_in_share_fragment_fmvo4kaezi"() IS 'the rule judge''s block of rule ShareSource(package, path, start) in ShareFragment(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_share_target_in_id_binding_4uxmpjdwt7"() IS 'the rule judge''s block of rule ShareTarget(package, path, id, targetStart) in IdBinding(package, path, id, owner) over its units';

COMMENT ON FUNCTION "qti"."__judge_site_in_read_include_edxuzxblcr"() IS 'the rule judge''s block of rule Site(package, path, start) where Logic.eq(kind, "xi:include") in ReadInclude(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_sole_reading_in_placed_variable_ref_inw76664fp"() IS 'the rule judge''s block of rule SoleReading(package, assembly, instance, path, start, attribute) in PlacedVariableRef(package, assembly, instance, path, start, attribute) where Logic.eq(resolution, "read") over its units';

COMMENT ON FUNCTION "qti"."__judge_srcset_in_attribute_ppgtiuubvn"() IS 'the rule judge''s block of rule Srcset(package, path, start) in Attribute(package, path, start) where Logic.eq(kind, "source") and Logic.eq(name, "srcset") over its units';

COMMENT ON FUNCTION "qti"."__judge_ssml_value_in_ssml_value_fuse53jjeg"() IS 'the rule judge''s block of rule SsmlValue(package, path, fragment, value) where Logic.eq(kind, "ssml:lookup") in SsmlValue(package, path, fragment, value) where Logic.eq(kind, "ssml:lexicon") over its units';

COMMENT ON FUNCTION "qti"."__judge_ssml_value_in_trimmed_mark_yt7rwpsw22"() IS 'the rule judge''s block of rule SsmlValue(package, path, start, value) where Logic.eq(kind, "ssml:speak") in TrimmedMark(package, path, fragment, value) over its units';

COMMENT ON FUNCTION "qti"."__judge_stimulus_ref_in_test_identifier_qu6fc3vcub"() IS 'the rule judge''s block of rule StimulusRef(package, path, start, identifier) in TestIdentifier(package, path, start, value) over its units';

COMMENT ON FUNCTION "qti"."__judge_structure_naming_in_named_i7g7ynxwbq"() IS 'the rule judge''s block of rule StructureNaming(package, path, start) in Named(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_table_header_in_attribute_7nkosldt6r"() IS 'the rule judge''s block of rule TableHeader(package, path, start) in Attribute(package, path, start) where Logic.or(Logic.and(ValueIdentity.has(AttributeGrammar.at("domain", AttributeModelOf.at("model", governor), name)), Logic.eq(ValueIdentity.at("identity", AttributeGrammar.at("domain", AttributeModelOf.at("model", governor), name)), "ID")), Logic.and(Logic.eq(kind, "qti-context-declaration"), Logic.eq(name, "identifier"))) and Logic.eq(kind, "th") over its units';

COMMENT ON FUNCTION "qti"."__judge_table_header_in_id_value_fssakiz6q3"() IS 'the rule judge''s block of rule TableHeader(package, path, start, id, owner) in IdValue(package, path, start, id, owner) over its units';

COMMENT ON FUNCTION "qti"."__judge_targeted_branch_rule_in_forward_branch_rule_rn4jsry4rd"() IS 'the rule judge''s block of rule TargetedBranchRule(package, assembly, instance, start) in ForwardBranchRule(package, assembly, instance, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_template_processing_in_named_declaration_krafx4vntd"() IS 'the rule judge''s block of rule TemplateProcessing(package, path) where Logic.in(value, ["https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_map_response", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_map_response.xml", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_match", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_match.xml", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_match_basic", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_match_basic.xml", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/map_response", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/map_response.xml", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/map_response_point", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/map_response_point.xml", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct.xml", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_map_response", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_map_response.xml", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_match", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_match.xml", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_match_basic", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_match_basic.xml", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/map_response", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/map_response.xml", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/map_response_point", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/map_response_point.xml", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/match_correct", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/match_correct.xml"]) in NamedDeclaration(package, path) where Logic.eq(declarationKind, "qti-outcome-declaration") and Logic.eq(identifier, "SCORE") over its units';

COMMENT ON FUNCTION "qti"."__judge_template_processing_in_named_declaration_ebldx6qrsv"() IS 'the rule judge''s block of rule TemplateProcessing(package, path) where Logic.in(value, ["https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_map_response", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_map_response.xml", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_match", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_match.xml", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_match_basic", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_match_basic.xml", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/map_response", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/map_response.xml", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/map_response_point", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/map_response_point.xml", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct.xml", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_map_response", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_map_response.xml", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_match", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_match.xml", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_match_basic", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_match_basic.xml", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/map_response", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/map_response.xml", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/map_response_point", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/map_response_point.xml", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/match_correct", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/match_correct.xml"]) in NamedDeclaration(package, path) where Logic.eq(declarationKind, "qti-response-declaration") and Logic.eq(identifier, "RESPONSE") over its units';

COMMENT ON FUNCTION "qti"."__judge_template_processing_in_named_declaration_zhds5lyjvx"() IS 'the rule judge''s block of rule TemplateProcessing(package, path) where Logic.in(value, ["https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_map_response", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_map_response.xml", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_match_basic", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_match_basic.xml", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_map_response", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_map_response.xml", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_match_basic", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_match_basic.xml"]) in NamedDeclaration(package, path) where Logic.in(declarationKind, ["qti-outcome-declaration", "qti-response-declaration", "qti-template-declaration"]) and Logic.eq(identifier, "MAXSCORE") over its units';

COMMENT ON FUNCTION "qti"."__judge_template_processing_in_mapped_response_4nbxhkabiy"() IS 'the rule judge''s block of rule TemplateProcessing(package, path) where Logic.in(value, ["https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_map_response", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_map_response.xml", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/map_response", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/map_response.xml", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_map_response", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_map_response.xml", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/map_response", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/map_response.xml"]) in MappedResponseDeclaration(package, path) over its units';

COMMENT ON FUNCTION "qti"."__judge_template_processing_in_named_declaration_lrli4h3uef"() IS 'the rule judge''s block of rule TemplateProcessing(package, path) where Logic.in(value, ["https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_map_response", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_map_response.xml", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_map_response", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_map_response.xml"]) in NamedDeclaration(package, path) where Logic.eq(declarationKind, "qti-outcome-declaration") and Logic.eq(identifier, "FEEDBACK") over its units';

COMMENT ON FUNCTION "qti"."__judge_template_processing_in_named_declaration_rm7fsk3y4d"() IS 'the rule judge''s block of rule TemplateProcessing(package, path) where Logic.in(value, ["https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_match_basic", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_match_basic.xml", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_match_basic", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_match_basic.xml"]) in NamedDeclaration(package, path) where Logic.eq(declarationKind, "qti-outcome-declaration") and Logic.eq(identifier, "FEEDBACKBASIC") over its units';

COMMENT ON FUNCTION "qti"."__judge_template_ref_in_referable_name_ukivozws2i"() IS 'the rule judge''s block of rule TemplateRef(package, path, identifier, kind, attribute) where Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "completionStatus", "duration", "numAttempts"])), Logic.ne(assemblyKind, "qti-assessment-item")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "completionStatus", "duration", "numAttempts"])), Logic.ne(assemblyKind, "qti-response-processing")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "duration"])), Logic.ne(assemblyKind, "qti-assessment-section")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "duration"])), Logic.ne(assemblyKind, "qti-assessment-test")) in ReferableName(package, path, identifier, kind, attribute) over its units';

COMMENT ON FUNCTION "qti"."__judge_tolerance_in_attribute_xprs2ln2ad"() IS 'the rule judge''s block of rule Tolerance(package, path, start) in Attribute(package, path, start) where Logic.eq(kind, "qti-equal") and Logic.eq(name, "tolerance") over its units';

COMMENT ON FUNCTION "qti"."__judge_typed_path_in_resource_document_k5nhgvc4ub"() IS 'the rule judge''s block of rule TypedPath(package, target, type) where Logic.in(type, ["imsqti_fragment_xmlv3p0", "imsqti_item_xmlv3p0", "imsqti_outcomes_xmlv3p0", "imsqti_resprocessing_xmlv3p0", "imsqti_rptemplate_xmlv3p0", "imsqti_section_xmlv3p0", "imsqti_stimulus_xmlv3p0", "imsqti_test_xmlv3p0", "qtiusagedata/xml", "resourcemetadata/xml"]) in ResourceDocument(package, path, type) over its units';

COMMENT ON FUNCTION "qti"."__judge_untargeted_item_ref_in_unread_type_href_7b4c53lcjo"() IS 'the rule judge''s block of rule UntargetedItemRef(package, target) in UnreadTypeHref(package, target) over its units';

COMMENT ON FUNCTION "qti"."__judge_usage_value_in_usage_base_type_nwm76d7aw5"() IS 'the rule judge''s block of rule UsageValue(package, path, start, baseTypeLexical) in UsageBaseType(package, path, start, value) over its units';

COMMENT ON FUNCTION "qti"."__judge_variable_ref_node_in_expression_2jiipu6mjc"() IS 'the rule judge''s block of rule VariableRefNode(package, path, start, language) where Logic.in(kind, ["qti-and", "qti-any-n", "qti-base-value", "qti-container-size", "qti-contains", "qti-correct", "qti-custom-operator", "qti-default", "qti-delete", "qti-divide", "qti-duration-gte", "qti-duration-lt", "qti-equal", "qti-equal-rounded", "qti-field-value", "qti-gcd", "qti-gt", "qti-gte", "qti-index", "qti-inside", "qti-integer-divide", "qti-integer-modulus", "qti-integer-to-float", "qti-is-null", "qti-lcm", "qti-lt", "qti-lte", "qti-map-response", "qti-map-response-point", "qti-match", "qti-math-constant", "qti-math-operator", "qti-max", "qti-member", "qti-min", "qti-multiple", "qti-not", "qti-null", "qti-number-correct", "qti-number-incorrect", "qti-number-presented", "qti-number-responded", "qti-number-selected", "qti-or", "qti-ordered", "qti-outcome-maximum", "qti-outcome-minimum", "qti-pattern-match", "qti-power", "qti-product", "qti-random", "qti-random-float", "qti-random-integer", "qti-repeat", "qti-round", "qti-round-to", "qti-stats-operator", "qti-string-match", "qti-substring", "qti-subtract", "qti-sum", "qti-test-variables", "qti-truncate", "qti-variable"]) in Expression(package, path, start, language) over its units';

COMMENT ON FUNCTION "qti"."__judge_variable_ref_node_in_processing_3423tnwmxm"() IS 'the rule judge''s block of rule VariableRefNode(package, path, start, language) where Logic.in(kind, ["qti-exit-response", "qti-exit-template", "qti-exit-test", "qti-lookup-outcome-value", "qti-outcome-condition", "qti-outcome-else", "qti-outcome-else-if", "qti-outcome-if", "qti-outcome-processing", "qti-outcome-processing-fragment", "qti-response-condition", "qti-response-else", "qti-response-else-if", "qti-response-if", "qti-response-processing", "qti-response-processing-fragment", "qti-set-correct-response", "qti-set-default-value", "qti-set-outcome-value", "qti-set-template-value", "qti-template-condition", "qti-template-constraint", "qti-template-else", "qti-template-else-if", "qti-template-if", "qti-template-processing"]) in Processing(package, path, start, language) over its units';

COMMENT ON FUNCTION "qti"."__judge_weighted_variable_in_expression_x6bof2cubn"() IS 'the rule judge''s block of rule WeightedVariable(package, path, start) in Expression(package, path, start) where Logic.eq(language, "outcome") over its units';

COMMENT ON FUNCTION "qti"."__judge_filtered_section_key_package_assembly_path_4z3biulu5b"() IS 'the rule judge''s block of rule key FilteredSection(package, assembly, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_id_binding_key_package_path_id_6fw6vseb5g"() IS 'the rule judge''s block of rule key IdBinding(package, path, id) over its units';

COMMENT ON FUNCTION "qti"."__judge_named_declaration_key_package_path_yf4gp6tz5k"() IS 'the rule judge''s block of rule key NamedDeclaration(package, path, identifier) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_single_response_gap_key_package_5ednbmrl4c"() IS 'the rule judge''s block of rule key PlacedSingleResponseGap(package, assembly, instance, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_set_field_name_key_package_path_set_fcflnc3ssu"() IS 'the rule judge''s block of rule key SetFieldName(package, path, set, identifier) over its units';

COMMENT ON FUNCTION "qti"."__judge_single_response_gap_key_package_path_start_sifun2dm3r"() IS 'the rule judge''s block of rule key SingleResponseGap(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_test_reading_key_package_assembly_path_start_n33nn3cpov"() IS 'the rule judge''s block of rule key TestReading(package, assembly, path, start, attribute) over its units';

COMMENT ON FUNCTION "qti"."__judge_trimmed_mark_key_package_path_fragment_value_t7jxdfhmxy"() IS 'the rule judge''s block of rule key TrimmedMark(package, path, fragment, value) over its units';

COMMENT ON FUNCTION "qti"."__judge_assembled_catalog_dbrsealp32"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of AssembledCatalog and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__capture_attribute_itmluum5pt"() IS 'rule capture of Attribute';

COMMENT ON FUNCTION "qti"."__immutable_attribute_6xb2pmx6fd"() IS 'immutability guard of Attribute';
