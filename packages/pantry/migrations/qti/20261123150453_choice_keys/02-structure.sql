DROP VIEW "qti_queries__author"."placed_choice";

DROP VIEW "qti_queries__author"."choice";

ALTER TABLE "qti"."choice" ADD COLUMN "kind" "qti"."node_kind" DEFAULT 143 NOT NULL;
ALTER TABLE "qti"."choice" ALTER COLUMN "kind" DROP DEFAULT;

ALTER TABLE "qti"."placed_choice" ADD COLUMN "kind" "qti"."node_kind" DEFAULT 143 NOT NULL;
ALTER TABLE "qti"."placed_choice" ALTER COLUMN "kind" DROP DEFAULT;

DROP TRIGGER "__immutable" ON "qti"."assembled_catalog";

DROP TRIGGER "__immutable" ON "qti"."assembled_document";

DROP TRIGGER "__immutable" ON "qti"."attribute";

DROP TRIGGER "__immutable" ON "qti"."attribute_entity";

DROP TRIGGER "__immutable" ON "qti"."binding_name";

DROP TRIGGER "__immutable" ON "qti"."bound_variable";

DROP TRIGGER "__immutable" ON "qti"."candidate_path";

DROP TRIGGER "__immutable" ON "qti"."catalog_id";

DROP TRIGGER "__immutable" ON "qti"."catalog_scope";

DROP TRIGGER "__immutable" ON "qti"."cell_headers";

DROP TRIGGER "__immutable" ON "qti"."cell_leaf";

DROP TRIGGER "__immutable" ON "qti"."choice";

DROP TRIGGER "__immutable" ON "qti"."choice_interaction";

DROP TRIGGER "__immutable" ON "qti"."cn_attribute";

DROP TRIGGER "__immutable" ON "qti"."cn_count";

DROP TRIGGER "__immutable" ON "qti"."cn_part_text";

DROP TRIGGER "__immutable" ON "qti"."cn_slot";

DROP TRIGGER "__immutable" ON "qti"."comment";

DROP TRIGGER "__immutable" ON "qti"."context_ref";

DROP TRIGGER "__immutable" ON "qti"."count_bound";

DROP TRIGGER "__immutable" ON "qti"."data_ssml";

DROP TRIGGER "__immutable" ON "qti"."data_ssml_member";

DROP TRIGGER "__immutable" ON "qti"."data_ssml_property";

DROP TRIGGER "__immutable" ON "qti"."doctype";

DROP TRIGGER "__immutable" ON "qti"."document";

DROP TRIGGER "__immutable" ON "qti"."document_id";

DROP TRIGGER "__immutable" ON "qti"."element_type";

DROP TRIGGER "__immutable" ON "qti"."encoding_decl";

DROP TRIGGER "__immutable" ON "qti"."entry";

DROP TRIGGER "__immutable" ON "qti"."expression";

DROP TRIGGER "__immutable" ON "qti"."feedback_ref";

DROP TRIGGER "__immutable" ON "qti"."file";

DROP TRIGGER "__immutable" ON "qti"."file_outside";

DROP TRIGGER "__immutable" ON "qti"."file_path";

DROP TRIGGER "__immutable" ON "qti"."fragment_context_name";

DROP TRIGGER "__immutable" ON "qti"."fragment_context_ref";

DROP TRIGGER "__immutable" ON "qti"."fragment_feedback_name";

DROP TRIGGER "__immutable" ON "qti"."fragment_feedback_ref";

DROP TRIGGER "__immutable" ON "qti"."fragment_printed_name";

DROP TRIGGER "__immutable" ON "qti"."fragment_printed_ref";

DROP TRIGGER "__immutable" ON "qti"."fragment_scope";

DROP TRIGGER "__immutable" ON "qti"."fragment_template_name";

DROP TRIGGER "__immutable" ON "qti"."fragment_template_ref";

DROP TRIGGER "__immutable" ON "qti"."header_token";

DROP TRIGGER "__immutable" ON "qti"."hottext";

DROP TRIGGER "__immutable" ON "qti"."identity_text";

DROP TRIGGER "__immutable" ON "qti"."idref";

DROP TRIGGER "__immutable" ON "qti"."idref_target";

DROP TRIGGER "__immutable" ON "qti"."inclusion";

DROP TRIGGER "__immutable" ON "qti"."instance";

DROP TRIGGER "__immutable" ON "qti"."interaction";

DROP TRIGGER "__immutable" ON "qti"."interaction_attribute";

DROP TRIGGER "__immutable" ON "qti"."item_mode";

DROP TRIGGER "__immutable" ON "qti"."item_ref_document";

DROP TRIGGER "__immutable" ON "qti"."item_ref_href";

DROP TRIGGER "__immutable" ON "qti"."label_use";

DROP TRIGGER "__immutable" ON "qti"."least_count";

DROP TRIGGER "__immutable" ON "qti"."link_reading";

DROP TRIGGER "__immutable" ON "qti"."literal";

DROP TRIGGER "__immutable" ON "qti"."literal_typed";

DROP TRIGGER "__immutable" ON "qti"."lookup_value";

DROP TRIGGER "__immutable" ON "qti"."map_key";

DROP TRIGGER "__immutable" ON "qti"."math_action";

DROP TRIGGER "__immutable" ON "qti"."math_align_group";

DROP TRIGGER "__immutable" ON "qti"."math_align_scope";

DROP TRIGGER "__immutable" ON "qti"."math_cell";

DROP TRIGGER "__immutable" ON "qti"."math_cn";

DROP TRIGGER "__immutable" ON "qti"."math_rank";

DROP TRIGGER "__immutable" ON "qti"."media";

DROP TRIGGER "__immutable" ON "qti"."most_count";

DROP TRIGGER "__immutable" ON "qti"."named";

DROP TRIGGER "__immutable" ON "qti"."namespace";

DROP TRIGGER "__immutable" ON "qti"."node";

DROP TRIGGER "__immutable" ON "qti"."numbered_reading";

DROP TRIGGER "__immutable" ON "qti"."open_attribute";

DROP TRIGGER "__immutable" ON "qti"."open_attribute_entity";

DROP TRIGGER "__immutable" ON "qti"."open_element_name";

DROP TRIGGER "__immutable" ON "qti"."open_element_type";

DROP TRIGGER "__immutable" ON "qti"."package";

DROP TRIGGER "__immutable" ON "qti"."pci_module_form";

DROP TRIGGER "__immutable" ON "qti"."pi";

DROP TRIGGER "__immutable" ON "qti"."placed_binding";

DROP TRIGGER "__immutable" ON "qti"."placed_choice";

DROP TRIGGER "__immutable" ON "qti"."placed_expression";

DROP TRIGGER "__immutable" ON "qti"."placed_hottext";

DROP TRIGGER "__immutable" ON "qti"."placed_id";

DROP TRIGGER "__immutable" ON "qti"."placed_idref";

DROP TRIGGER "__immutable" ON "qti"."placed_math_rank";

DROP TRIGGER "__immutable" ON "qti"."placed_share_target";

DROP TRIGGER "__immutable" ON "qti"."placed_variable_ref";

DROP TRIGGER "__immutable" ON "qti"."printed_variable_ref";

DROP TRIGGER "__immutable" ON "qti"."processing";

DROP TRIGGER "__immutable" ON "qti"."reference";

DROP TRIGGER "__immutable" ON "qti"."reference_path";

DROP TRIGGER "__immutable" ON "qti"."referring_document";

DROP TRIGGER "__immutable" ON "qti"."resource_document";

DROP TRIGGER "__immutable" ON "qti"."resource_href";

DROP TRIGGER "__immutable" ON "qti"."resource_href_outside";

DROP TRIGGER "__immutable" ON "qti"."resource_href_path";

DROP TRIGGER "__immutable" ON "qti"."rounding";

DROP TRIGGER "__immutable" ON "qti"."rounding_figures";

DROP TRIGGER "__immutable" ON "qti"."rounding_mode_figures";

DROP TRIGGER "__immutable" ON "qti"."sd_decl";

DROP TRIGGER "__immutable" ON "qti"."share_fragment";

DROP TRIGGER "__immutable" ON "qti"."share_target";

DROP TRIGGER "__immutable" ON "qti"."site";

DROP TRIGGER "__immutable" ON "qti"."site_path";

DROP TRIGGER "__immutable" ON "qti"."site_target";

DROP TRIGGER "__immutable" ON "qti"."srcset";

DROP TRIGGER "__immutable" ON "qti"."srcset_candidate";

DROP TRIGGER "__immutable" ON "qti"."ssml_scope";

DROP TRIGGER "__immutable" ON "qti"."stimulus_ref";

DROP TRIGGER "__immutable" ON "qti"."table_header";

DROP TRIGGER "__immutable" ON "qti"."table_scope";

DROP TRIGGER "__immutable" ON "qti"."template_ref";

DROP TRIGGER "__immutable" ON "qti"."text_idref";

DROP TRIGGER "__immutable" ON "qti"."text_reference";

DROP TRIGGER "__immutable" ON "qti"."text_reference_path";

DROP TRIGGER "__immutable" ON "qti"."tolerance";

DROP TRIGGER "__immutable" ON "qti"."tolerance_token";

DROP TRIGGER "__immutable" ON "qti"."usage_value";

DROP TRIGGER "__immutable" ON "qti"."usage_value_base_type";

DROP TRIGGER "__immutable" ON "qti"."variable_ref";

DROP TRIGGER "__immutable" ON "qti"."xml_decl";

SET CONSTRAINTS ALL IMMEDIATE;

UPDATE "qti"."choice" AS "c" SET "kind" = "n"."kind" FROM "qti"."node" AS "n" WHERE "n"."package" = "c"."package" AND "n"."path" = "c"."path" AND "n"."start" = "c"."start";

UPDATE "qti"."placed_choice" AS "c" SET "kind" = "n"."kind" FROM "qti"."node" AS "n" WHERE "n"."package" = "c"."package" AND "n"."path" = "c"."path" AND "n"."start" = "c"."start";

ALTER TABLE "qti"."choice" ADD CONSTRAINT "__choice_fk_package_path_start_kind_wg4x5yucb4" FOREIGN KEY ("package", "path", "start", "kind") REFERENCES "qti"."node" ("package", "path", "start", "kind") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."placed_choice" ADD CONSTRAINT "__placed_choice_fk_package_path_start_kind_gph72alaqo" FOREIGN KEY ("package", "path", "start", "kind") REFERENCES "qti"."node" ("package", "path", "start", "kind") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."assembled_catalog"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_assembled_catalog_vcladehbpw"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."assembled_document"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_assembled_document_32zynp33dd"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."attribute"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_attribute_6xb2pmx6fd"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."attribute_entity"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_attribute_entity_ppzjeu4ah3"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."binding_name"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_binding_name_23k2pcie27"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."bound_variable"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_bound_variable_l5mva2wpev"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."candidate_path"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_candidate_path_flhwj3s6bd"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."catalog_id"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_catalog_id_bejmpqjni6"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."catalog_scope"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_catalog_scope_diphx2o4ow"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."cell_headers"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_cell_headers_sgvuxxx5r2"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."cell_leaf"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_cell_leaf_p2ckdivqyl"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."choice"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_choice_ge2mdb5sm4"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."choice_interaction"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_choice_interaction_hzj7v6euny"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."cn_attribute"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_cn_attribute_dqjxnuikao"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."cn_count"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_cn_count_d5gkjhczls"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."cn_part_text"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_cn_part_text_kx34g5xopo"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."cn_slot"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_cn_slot_26fq3jw3vu"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."comment"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_comment_kt26p4ybay"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."context_ref"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_context_ref_hznufurdh6"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."count_bound"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_count_bound_ozituuo5at"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."data_ssml"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_data_ssml_d7gbp5e3bj"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."data_ssml_member"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_data_ssml_member_kohfs5whun"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."data_ssml_property"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_data_ssml_property_vtgk2n4uec"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."doctype"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_doctype_f6kqqv7lim"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."document"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_document_rzorfdmdmw"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."document_id"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_document_id_rsnstwbfg4"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."element_type"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_element_type_6snzgndwf2"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."encoding_decl"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_encoding_decl_bi75lcyfnn"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."entry"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_entry_hkvj5zcl53"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."expression"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_expression_vi24giusog"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."feedback_ref"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_feedback_ref_bm4dvyujjj"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."file"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_file_hh6bkt5pfh"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."file_outside"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_file_outside_vd7dcywe7d"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."file_path"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_file_path_m5zsirk5w5"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."fragment_context_name"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_fragment_context_name_4thlytcscd"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."fragment_context_ref"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_fragment_context_ref_dnxjwu7jjj"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."fragment_feedback_name"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_fragment_feedback_name_ffzmmoukqe"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."fragment_feedback_ref"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_fragment_feedback_ref_7pyvlsjvu4"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."fragment_printed_name"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_fragment_printed_name_f67jebrp64"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."fragment_printed_ref"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_fragment_printed_ref_dbnyr3esu7"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."fragment_scope"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_fragment_scope_sjx7hdntnt"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."fragment_template_name"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_fragment_template_name_3qvolm2kb6"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."fragment_template_ref"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_fragment_template_ref_jj57ejir2o"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."header_token"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_header_token_cycyv7j27y"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."hottext"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_hottext_qr5yg3rq2q"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."identity_text"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_identity_text_bm4m43fo25"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."idref"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_idref_xrfkgel7oq"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."idref_target"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_idref_target_k5fphp24zc"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."inclusion"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_inclusion_jb3v6gsk44"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."instance"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_instance_43njzfluo4"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."interaction"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_interaction_vlncrmjme7"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."interaction_attribute"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_interaction_attribute_kamhumahje"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."item_mode"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_item_mode_7fljqrxl6j"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."item_ref_document"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_item_ref_document_a4amgnqpel"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."item_ref_href"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_item_ref_href_xkd3nd7smv"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."label_use"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_label_use_tm32nskbhx"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."least_count"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_least_count_rymntdenhr"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."link_reading"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_link_reading_gwkqs3gbmv"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."literal"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_literal_om5k2efgwg"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."literal_typed"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_literal_typed_j6qnndrhxf"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."lookup_value"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_lookup_value_zevk4rta27"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."map_key"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_map_key_3aawy7jrgf"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."math_action"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_math_action_4wc3z4cvbm"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."math_align_group"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_math_align_group_zalb5nju5t"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."math_align_scope"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_math_align_scope_cqfgoijr46"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."math_cell"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_math_cell_kutlle7mpi"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."math_cn"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_math_cn_sxgknut342"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."math_rank"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_math_rank_evrbu6xzq6"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."media"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_media_mfd4zgeqo4"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."most_count"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_most_count_pnbgbyo6vx"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."named"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_named_fc3dyta4pi"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."namespace"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_namespace_kfnkwuzi6f"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."node"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_node_z6kbrp3cjh"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."numbered_reading"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_numbered_reading_krckr7age2"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."open_attribute"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_open_attribute_e2eg44hjoh"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."open_attribute_entity"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_open_attribute_entity_us6npbcmmk"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."open_element_name"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_open_element_name_bibpy2kcd7"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."open_element_type"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_open_element_type_zejz6gqcev"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."package"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_package_ajngq3jptc"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."pci_module_form"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_pci_module_form_xxsdsw6xkd"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."pi"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_pi_nwixbhoi76"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."placed_binding"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_placed_binding_2urgxakeap"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."placed_choice"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_placed_choice_lyke55z5zo"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."placed_expression"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_placed_expression_6f7ddcef53"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."placed_hottext"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_placed_hottext_w3bq4kdmpw"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."placed_id"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_placed_id_na4uxn7bss"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."placed_idref"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_placed_idref_3qldafkap2"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."placed_math_rank"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_placed_math_rank_h7luw7qzqp"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."placed_share_target"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_placed_share_target_z4ymdrfuyo"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."placed_variable_ref"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_placed_variable_ref_dzftbittwa"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."printed_variable_ref"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_printed_variable_ref_glbe4icptr"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."processing"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_processing_4xtoge45uf"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."reference"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_reference_jwjaejvd7e"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."reference_path"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_reference_path_wpekhqpxnx"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."referring_document"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_referring_document_lnebuzvo3s"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."resource_document"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_resource_document_jqrzxzns2q"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."resource_href"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_resource_href_bukfnv4woh"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."resource_href_outside"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_resource_href_outside_hhcxhput7m"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."resource_href_path"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_resource_href_path_geg2rregza"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."rounding"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_rounding_nineaee63d"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."rounding_figures"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_rounding_figures_4cuqyjt6ud"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."rounding_mode_figures"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_rounding_mode_figures_ret6orbywb"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."sd_decl"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_sd_decl_3xgbeclw67"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."share_fragment"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_share_fragment_lux4lz54b4"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."share_target"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_share_target_rpedtkzcqq"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."site"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_site_c4aoskwybt"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."site_path"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_site_path_64mucficfu"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."site_target"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_site_target_ko73x62zot"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."srcset"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_srcset_chkghcgdgm"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."srcset_candidate"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_srcset_candidate_lhrajb62s4"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."ssml_scope"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_ssml_scope_gm2nztotr2"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."stimulus_ref"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_stimulus_ref_l5ozxdx67u"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."table_header"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_table_header_w5wnjatoej"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."table_scope"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_table_scope_zjt7vkc2dg"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."template_ref"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_template_ref_txetw6uizh"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."text_idref"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_text_idref_iatqcpbyrw"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."text_reference"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_text_reference_t575rjvqct"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."text_reference_path"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_text_reference_path_rdz63xnbcm"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."tolerance"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_tolerance_qlqblufht2"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."tolerance_token"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_tolerance_token_3mam4bz3yb"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."usage_value"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_usage_value_jnk7ednwfy"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."usage_value_base_type"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_usage_value_base_type_r6zekdtvgx"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."variable_ref"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_variable_ref_2akeo54qw2"();

CREATE TRIGGER "__immutable"
  BEFORE UPDATE ON "qti"."xml_decl"
  FOR EACH ROW EXECUTE FUNCTION "qti"."__immutable_xml_decl_xczaxf75t5"();

CREATE VIEW "qti_queries__author"."choice" ("identifier", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."identifier", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."choice" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."choice" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."placed_choice" ("assembly", "identifier", "instance", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."identifier", "r1"."instance", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."placed_choice" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."placed_choice" TO :"qti_queries__author";
