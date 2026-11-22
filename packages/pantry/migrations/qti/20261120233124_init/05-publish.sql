CREATE PUBLICATION "__live_lxch3umxkh"
  FOR TABLE "qti"."attribute" ("package", "path", "start", "name"), "qti"."attribute_entity" ("package", "path", "start", "name", "offset"), "qti"."comment" ("package", "path", "start"), "qti"."doctype" ("package", "path", "start"), "qti"."document" ("package", "path"), "qti"."element_type" ("package", "path", "start"), "qti"."encoding_decl" ("package", "path"), "qti"."entry" ("package", "path"), "qti"."media" ("package", "path"), "qti"."namespace" ("package", "path", "start", "prefix"), "qti"."node" ("package", "path", "start"), "qti"."open_attribute" ("package", "path", "start", "uri", "local"), "qti"."open_attribute_entity" ("package", "path", "start", "uri", "local", "offset"), "qti"."open_element_name" ("package", "path", "start"), "qti"."open_element_type" ("package", "path", "start"), "qti"."package" ("name"), "qti"."pi" ("package", "path", "start"), "qti"."sd_decl" ("package", "path"), "qti"."xml_decl" ("package", "path"), "qti"."__ledger"
  WITH (publish_generated_columns = stored);

SELECT "r1"."c1"::"qti"."__domain_gfw43vigph" AS "value"
FROM (VALUES (63::bigint), (67::bigint), (60::bigint), (62::bigint), (61::bigint), (4::bigint), (5::bigint), (7::bigint), (0::bigint), (21::bigint), (65::bigint), (18::bigint), (19::bigint), (14::bigint), (9::bigint), (17::bigint), (108::bigint), (20::bigint), (30::bigint), (25::bigint), (48::bigint), (27::bigint), (36::bigint), (110::bigint), (34::bigint), (16::bigint), (15::bigint), (3::bigint), (6::bigint), (12::bigint), (10::bigint), (11::bigint), (69::bigint), (64::bigint), (50::bigint), (73::bigint), (70::bigint), (72::bigint), (68::bigint), (71::bigint), (66::bigint), (8::bigint), (59::bigint), (13::bigint), (2::bigint), (1::bigint), (52::bigint), (96::bigint), (41::bigint), (97::bigint), (119::bigint), (56::bigint), (33::bigint), (121::bigint), (193::bigint), (306::bigint), (181::bigint), (117::bigint), (22::bigint), (92::bigint), (45::bigint), (46::bigint), (31::bigint), (75::bigint), (74::bigint), (28::bigint), (44::bigint), (29::bigint), (32::bigint)) AS "r1"("c1");

SELECT "r1"."c1"::"qti"."__text_sac6h6c6eh" AS "value"
FROM (VALUES ('http://www.imsglobal.org/xsd/imsqtiasi_v3p0'::"pg_catalog"."text"), ('http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1'::"pg_catalog"."text"), ('http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_extensionv1p2'::"pg_catalog"."text"), ('http://www.imsglobal.org/xsd/qti/qtiv3p0/imscsmd_v1p1'::"pg_catalog"."text"), ('http://www.imsglobal.org/xsd/qti/qtiv3p0/imsafa3p0drd_v1p0'::"pg_catalog"."text"), ('http://ltsc.ieee.org/xsd/LOM'::"pg_catalog"."text"), ('http://www.w3.org/1998/Math/MathML'::"pg_catalog"."text"), ('http://www.imsglobal.org/xsd/imsqti_metadata_v3p0'::"pg_catalog"."text"), ('http://www.w3.org/2001/10/synthesis'::"pg_catalog"."text"), ('http://www.imsglobal.org/xsd/imsqti_usagedata_v3p0'::"pg_catalog"."text"), ('http://www.w3.org/2001/XInclude'::"pg_catalog"."text")) AS "r1"("c1");

CREATE ROLE :"qti_queries__author" NOLOGIN;

CREATE ROLE :"qti_queries__author_app" LOGIN NOINHERIT;

CREATE ROLE :"__live_lxch3umxkh" LOGIN NOINHERIT;

CREATE SCHEMA "qti_queries__author";

CREATE VIEW "qti_queries__author"."assembled_catalog" ("assembly", "id", "owner", "package", "path") AS
SELECT "r1"."assembly", "r1"."id", "r1"."owner", "r1"."package", "r1"."path"
FROM "qti"."assembled_catalog" AS "r1";

CREATE VIEW "qti_queries__author"."assembled_document" ("instances", "package", "path", "sites", "targets") AS
SELECT "r1"."instances", "r1"."package", "r1"."path", "r1"."sites", "r1"."targets"
FROM "qti"."assembled_document" AS "r1";

CREATE VIEW "qti_queries__author"."attribute" ("governor", "governor_name", "idref_text", "idrefs", "kind", "kind_name", "lexical", "name", "name_name", "package", "path", "prefix", "slot", "start", "value") AS
SELECT "r1"."governor", ("qti"."__governor_names_d7jfyla3na"())["r1"."governor" + 1]::"pg_catalog"."text", "r1"."idref_text", "r1"."idrefs", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."lexical", "r1"."name", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."name" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."prefix", "r1"."slot", "r1"."start", "r1"."value"
FROM "qti"."attribute" AS "r1";

CREATE VIEW "qti_queries__author"."attribute_entity" ("entity", "name", "name_name", "offset", "package", "path", "start") AS
SELECT "r1"."entity", "r1"."name", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."name" + 1]::"pg_catalog"."text", "r1"."offset", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."attribute_entity" AS "r1";

CREATE VIEW "qti_queries__author"."binding_name" ("attribute", "attribute_name", "identifier", "package", "path", "start") AS
SELECT "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."binding_name" AS "r1";

CREATE VIEW "qti_queries__author"."bound_variable" ("adaptive", "attribute", "attribute_name", "identifier", "package", "path", "start") AS
SELECT "r1"."adaptive", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."bound_variable" AS "r1";

CREATE VIEW "qti_queries__author"."candidate_path" ("at", "package", "path", "start", "target") AS
SELECT "r1"."at", "r1"."package", "r1"."path", "r1"."start", "r1"."target"
FROM "qti"."candidate_path" AS "r1";

CREATE VIEW "qti_queries__author"."catalog_id" ("id", "owner", "package", "path", "start") AS
SELECT "r1"."id", "r1"."owner", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."catalog_id" AS "r1";

CREATE VIEW "qti_queries__author"."catalog_scope" ("package", "path", "scope", "start") AS
SELECT "r1"."package", "r1"."path", "r1"."scope", "r1"."start"
FROM "qti"."catalog_scope" AS "r1";

CREATE VIEW "qti_queries__author"."cell_headers" ("package", "path", "start", "token_text", "tokens") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."token_text", "r1"."tokens"
FROM "qti"."cell_headers" AS "r1";

CREATE VIEW "qti_queries__author"."cell_leaf" ("at", "cell", "package", "path", "start", "start_after", "start_was") AS
SELECT "r1"."at", "r1"."cell", "r1"."package", "r1"."path", "r1"."start", "r1"."start_after", "r1"."start_was"
FROM "qti"."cell_leaf" AS "r1";

CREATE VIEW "qti_queries__author"."choice" ("identifier", "package", "path", "start") AS
SELECT "r1"."identifier", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."choice" AS "r1";

CREATE VIEW "qti_queries__author"."choice_interaction" ("interaction", "interaction_path", "package", "path", "start") AS
SELECT "r1"."interaction", "r1"."interaction_path", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."choice_interaction" AS "r1";

CREATE VIEW "qti_queries__author"."cn_attribute" ("lexical", "name", "name_name", "package", "path", "start") AS
SELECT "r1"."lexical", "r1"."name", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."name" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."cn_attribute" AS "r1";

CREATE VIEW "qti_queries__author"."cn_count" ("package", "parts", "path", "start", "type", "type_name", "type_lexical") AS
SELECT "r1"."package", "r1"."parts", "r1"."path", "r1"."start", "r1"."type", ("qti"."__cn_type_names_wmjelllvhg"())["r1"."type" + 1]::"pg_catalog"."text", "r1"."type_lexical"
FROM "qti"."cn_count" AS "r1";

CREATE VIEW "qti_queries__author"."cn_part_text" ("base", "base_name", "form", "form_name", "package", "part", "part_name", "path", "start", "text", "type", "type_name") AS
SELECT "r1"."base", ("qti"."__cn_base_names_2wtzhyubck"())["r1"."base" + 1]::"pg_catalog"."text", "r1"."form", ("qti"."__cn_part_form_names_te7u7jycdu"())["r1"."form" + 1]::"pg_catalog"."text", "r1"."package", "r1"."part", ("qti"."__cn_part_names_6db2fcgfhy"())["r1"."part" + 1]::"pg_catalog"."text", "r1"."path", "r1"."start", "r1"."text", "r1"."type", ("qti"."__cn_type_names_wmjelllvhg"())["r1"."type" + 1]::"pg_catalog"."text"
FROM "qti"."cn_part_text" AS "r1";

CREATE VIEW "qti_queries__author"."cn_slot" ("form", "form_name", "package", "part", "part_name", "path", "start", "type", "type_name") AS
SELECT "r1"."form", ("qti"."__cn_part_form_names_te7u7jycdu"())["r1"."form" + 1]::"pg_catalog"."text", "r1"."package", "r1"."part", ("qti"."__cn_part_names_6db2fcgfhy"())["r1"."part" + 1]::"pg_catalog"."text", "r1"."path", "r1"."start", "r1"."type", ("qti"."__cn_type_names_wmjelllvhg"())["r1"."type" + 1]::"pg_catalog"."text"
FROM "qti"."cn_slot" AS "r1";

CREATE VIEW "qti_queries__author"."comment" ("package", "path", "start", "value") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."value"
FROM "qti"."comment" AS "r1";

CREATE VIEW "qti_queries__author"."context_ref" ("assembly_kind", "assembly_kind_name", "attribute", "attribute_name", "identifier", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."assembly_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."assembly_kind" + 1]::"pg_catalog"."text", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."context_ref" AS "r1";

CREATE VIEW "qti_queries__author"."count_bound" ("max_name", "max_name_name", "max_written", "min_name", "min_name_name", "min_written", "package", "path", "start") AS
SELECT "r1"."max_name", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."max_name" + 1]::"pg_catalog"."text", "r1"."max_written", "r1"."min_name", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."min_name" + 1]::"pg_catalog"."text", "r1"."min_written", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."count_bound" AS "r1";

CREATE VIEW "qti_queries__author"."data_ssml" ("package", "path", "start") AS
SELECT "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."data_ssml" AS "r1";

CREATE VIEW "qti_queries__author"."data_ssml_member" ("at", "member", "package", "path", "start") AS
SELECT "r1"."at", "r1"."member", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."data_ssml_member" AS "r1";

CREATE VIEW "qti_queries__author"."data_ssml_property" ("at", "member", "member_name", "name", "package", "path", "start", "value") AS
SELECT "r1"."at", "r1"."member", "r1"."member_name", "r1"."name", "r1"."package", "r1"."path", "r1"."start", "r1"."value"
FROM "qti"."data_ssml_property" AS "r1";

CREATE VIEW "qti_queries__author"."doctype" ("package", "path", "start", "value") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."value"
FROM "qti"."doctype" AS "r1";

CREATE VIEW "qti_queries__author"."document" ("assembled", "bindings", "charset", "choices", "context", "context_nearest", "context_nearest_kind", "context_nearest_kind_name", "context_path", "document_type", "document_type_name", "export_charset", "hottexts", "idref_targets", "ids", "node_children", "package", "path", "root_kind", "root_kind_name", "targeted_by", "variables") AS
SELECT "r1"."assembled", "r1"."bindings", "r1"."charset", "r1"."choices", "r1"."context", "r1"."context_nearest", "r1"."context_nearest_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."context_nearest_kind" + 1]::"pg_catalog"."text", "r1"."context_path", "r1"."document_type", ("qti"."__document_type_names_ot37qp5org"())["r1"."document_type" + 1]::"pg_catalog"."text", "r1"."export_charset", "r1"."hottexts", "r1"."idref_targets", "r1"."ids", "r1"."node_children", "r1"."package", "r1"."path", "r1"."root_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."root_kind" + 1]::"pg_catalog"."text", "r1"."targeted_by", "r1"."variables"
FROM "qti"."document" AS "r1";

CREATE VIEW "qti_queries__author"."document_id" ("admitted", "owner", "package", "path", "start") AS
SELECT "r1"."admitted", "r1"."owner", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."document_id" AS "r1";

CREATE VIEW "qti_queries__author"."element_type" ("governor", "governor_name", "kind", "kind_name", "package", "path", "start", "type", "type_name") AS
SELECT "r1"."governor", ("qti"."__governor_names_d7jfyla3na"())["r1"."governor" + 1]::"pg_catalog"."text", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start", "r1"."type", ("qti"."__type_name_names_ksmacbo3df"())["r1"."type" + 1]::"pg_catalog"."text"
FROM "qti"."element_type" AS "r1";

CREATE VIEW "qti_queries__author"."encoding_decl" ("encoding", "package", "path") AS
SELECT "r1"."encoding", "r1"."package", "r1"."path"
FROM "qti"."encoding_decl" AS "r1";

CREATE VIEW "qti_queries__author"."entry" ("kind", "kind_name", "package", "path") AS
SELECT "r1"."kind", ("qti"."__entry_kind_names_km5xejbmwu"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path"
FROM "qti"."entry" AS "r1";

CREATE VIEW "qti_queries__author"."expression" ("base_type", "base_type_name", "cardinality", "cardinality_name", "language", "language_name", "package", "path", "start", "base_type_bit", "cardinality_bit") AS
SELECT "r1"."base_type", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."cardinality", ("qti"."__value_cardinality_names_wzwznoycgf"())["r1"."cardinality" + 1]::"pg_catalog"."text", "r1"."language", ("qti"."__language_names_pvmtywwssv"())["r1"."language" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start", "r1"."base_type_bit", "r1"."cardinality_bit"
FROM "qti"."expression" AS "r1";

CREATE VIEW "qti_queries__author"."feedback_ref" ("assembly_kind", "assembly_kind_name", "attribute", "attribute_name", "identifier", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."assembly_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."assembly_kind" + 1]::"pg_catalog"."text", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."feedback_ref" AS "r1";

CREATE VIEW "qti_queries__author"."file" ("package", "path", "scope", "scope_name", "start", "target") AS
SELECT "r1"."package", "r1"."path", "r1"."scope", ("qti"."__href_scope_names_y4pbuo4f5q"())["r1"."scope" + 1]::"pg_catalog"."text", "r1"."start", "r1"."target"
FROM "qti"."file" AS "r1";

CREATE VIEW "qti_queries__author"."fragment_context_name" ("attribute", "attribute_name", "identifier", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."fragment_context_name" AS "r1";

CREATE VIEW "qti_queries__author"."fragment_context_ref" ("assembly", "assembly_kind", "assembly_kind_name", "attribute", "attribute_name", "identifier", "instance", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."assembly_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."assembly_kind" + 1]::"pg_catalog"."text", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."instance", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."fragment_context_ref" AS "r1";

CREATE VIEW "qti_queries__author"."fragment_feedback_name" ("attribute", "attribute_name", "identifier", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."fragment_feedback_name" AS "r1";

CREATE VIEW "qti_queries__author"."fragment_feedback_ref" ("assembly", "assembly_kind", "assembly_kind_name", "attribute", "attribute_name", "identifier", "instance", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."assembly_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."assembly_kind" + 1]::"pg_catalog"."text", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."instance", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."fragment_feedback_ref" AS "r1";

CREATE VIEW "qti_queries__author"."fragment_printed_name" ("attribute", "attribute_name", "identifier", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."fragment_printed_name" AS "r1";

CREATE VIEW "qti_queries__author"."fragment_printed_ref" ("assembly", "assembly_kind", "assembly_kind_name", "attribute", "attribute_name", "identifier", "instance", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."assembly_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."assembly_kind" + 1]::"pg_catalog"."text", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."instance", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."fragment_printed_ref" AS "r1";

CREATE VIEW "qti_queries__author"."fragment_scope" ("assembly", "assembly_kind", "assembly_kind_name", "contexts", "document", "feedbacks", "instance", "package", "prints", "templates") AS
SELECT "r1"."assembly", "r1"."assembly_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."assembly_kind" + 1]::"pg_catalog"."text", "r1"."contexts", "r1"."document", "r1"."feedbacks", "r1"."instance", "r1"."package", "r1"."prints", "r1"."templates"
FROM "qti"."fragment_scope" AS "r1";

CREATE VIEW "qti_queries__author"."fragment_template_name" ("attribute", "attribute_name", "identifier", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."fragment_template_name" AS "r1";

CREATE VIEW "qti_queries__author"."fragment_template_ref" ("assembly", "assembly_kind", "assembly_kind_name", "attribute", "attribute_name", "identifier", "instance", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."assembly_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."assembly_kind" + 1]::"pg_catalog"."text", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."instance", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."fragment_template_ref" AS "r1";

CREATE VIEW "qti_queries__author"."header_token" ("after", "at", "before", "package", "path", "pieces_after", "pieces_was", "start", "token", "piece") AS
SELECT "r1"."after", "r1"."at", "r1"."before", "r1"."package", "r1"."path", "r1"."pieces_after", "r1"."pieces_was", "r1"."start", "r1"."token", "r1"."piece"
FROM "qti"."header_token" AS "r1";

CREATE VIEW "qti_queries__author"."hottext" ("identifier", "package", "path", "start") AS
SELECT "r1"."identifier", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."hottext" AS "r1";

CREATE VIEW "qti_queries__author"."identity_text" ("package", "path", "start", "token_text", "tokens") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."token_text", "r1"."tokens"
FROM "qti"."identity_text" AS "r1";

CREATE VIEW "qti_queries__author"."idref" ("after", "at", "before", "name", "name_name", "package", "path", "pieces_after", "pieces_was", "start", "token", "piece") AS
SELECT "r1"."after", "r1"."at", "r1"."before", "r1"."name", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."name" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."pieces_after", "r1"."pieces_was", "r1"."start", "r1"."token", "r1"."piece"
FROM "qti"."idref" AS "r1";

CREATE VIEW "qti_queries__author"."idref_target" ("assembled", "id", "package", "path") AS
SELECT "r1"."assembled", "r1"."id", "r1"."package", "r1"."path"
FROM "qti"."idref_target" AS "r1";

CREATE VIEW "qti_queries__author"."inclusion" ("package", "parent_kind", "parent_kind_name", "path", "places", "root", "root_name", "splices", "start") AS
SELECT "r1"."package", "r1"."parent_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."parent_kind" + 1]::"pg_catalog"."text", "r1"."path", "r1"."places", "r1"."root", ("qti"."__node_kind_names_ulbko553n7"())["r1"."root" + 1]::"pg_catalog"."text", "r1"."splices", "r1"."start"
FROM "qti"."inclusion" AS "r1";

CREATE VIEW "qti_queries__author"."instance" ("assembly", "assembly_kind", "assembly_kind_name", "at", "bindings", "children", "choices", "document", "end", "hottexts", "idref_targets", "ids", "package", "parent", "root_kind", "root_kind_name", "site", "site_document", "start", "variables") AS
SELECT "r1"."assembly", "r1"."assembly_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."assembly_kind" + 1]::"pg_catalog"."text", "r1"."at", "r1"."bindings", "r1"."children", "r1"."choices", "r1"."document", "r1"."end", "r1"."hottexts", "r1"."idref_targets", "r1"."ids", "r1"."package", "r1"."parent", "r1"."root_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."root_kind" + 1]::"pg_catalog"."text", "r1"."site", "r1"."site_document", "r1"."start", "r1"."variables"
FROM "qti"."instance" AS "r1";

CREATE VIEW "qti_queries__author"."interaction" ("choices", "module_forms", "package", "path", "start") AS
SELECT "r1"."choices", "r1"."module_forms", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."interaction" AS "r1";

CREATE VIEW "qti_queries__author"."interaction_attribute" ("kind", "kind_name", "lexical", "name", "name_name", "package", "path", "root_kind", "root_kind_name", "start", "value") AS
SELECT "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."lexical", "r1"."name", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."name" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."root_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."root_kind" + 1]::"pg_catalog"."text", "r1"."start", "r1"."value"
FROM "qti"."interaction_attribute" AS "r1";

CREATE VIEW "qti_queries__author"."item_mode" ("adaptive", "package", "path") AS
SELECT "r1"."adaptive", "r1"."package", "r1"."path"
FROM "qti"."item_mode" AS "r1";

CREATE VIEW "qti_queries__author"."item_ref_document" ("package", "path", "start", "target") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."target"
FROM "qti"."item_ref_document" AS "r1";

CREATE VIEW "qti_queries__author"."item_ref_href" ("package", "path", "start", "target") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."target"
FROM "qti"."item_ref_href" AS "r1";

CREATE VIEW "qti_queries__author"."label_use" ("package", "path", "root_kind", "root_kind_name", "start") AS
SELECT "r1"."package", "r1"."path", "r1"."root_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."root_kind" + 1]::"pg_catalog"."text", "r1"."start"
FROM "qti"."label_use" AS "r1";

CREATE VIEW "qti_queries__author"."least_count" ("least", "least_value", "package", "path", "start") AS
SELECT "r1"."least", "r1"."least_value", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."least_count" AS "r1";

CREATE VIEW "qti_queries__author"."link_reading" ("assembly", "attribute", "attribute_name", "package", "path", "scope", "scope_instance", "scope_path", "start", "variable") AS
SELECT "r1"."assembly", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."scope", "r1"."scope_instance", "r1"."scope_path", "r1"."start", "r1"."variable"
FROM "qti"."link_reading" AS "r1";

CREATE VIEW "qti_queries__author"."literal" ("base_type", "base_type_name", "package", "path", "start", "text") AS
SELECT "r1"."base_type", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start", "r1"."text"
FROM "qti"."literal" AS "r1";

CREATE VIEW "qti_queries__author"."literal_typed" ("package", "path", "start", "text", "type_code", "type_code_name", "base_type", "base_type_name") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."text", "r1"."type_code", ("qti"."__base_type_names_ok3nu5nck4"())["r1"."type_code" + 1]::"pg_catalog"."text", "r1"."base_type", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."base_type" + 1]::"pg_catalog"."text"
FROM "qti"."literal_typed" AS "r1";

CREATE VIEW "qti_queries__author"."lookup_value" ("package", "path", "start", "value") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."value"
FROM "qti"."lookup_value" AS "r1";

CREATE VIEW "qti_queries__author"."map_key" ("key", "package", "path", "start") AS
SELECT "r1"."key", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."map_key" AS "r1";

CREATE VIEW "qti_queries__author"."mastery_value" ("lexical", "package", "path", "start") AS
SELECT "r1"."lexical", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."mastery_value" AS "r1";

CREATE VIEW "qti_queries__author"."math_action" ("package", "path", "selection_lexical", "selection_written", "start", "selection") AS
SELECT "r1"."package", "r1"."path", "r1"."selection_lexical", "r1"."selection_written", "r1"."start", "r1"."selection"
FROM "qti"."math_action" AS "r1";

CREATE VIEW "qti_queries__author"."math_align_group" ("cell", "package", "path", "start") AS
SELECT "r1"."cell", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."math_align_group" AS "r1";

CREATE VIEW "qti_queries__author"."math_align_scope" ("cell", "chosen", "inherited", "inherited_name", "own", "own_name", "package", "passes", "passes_name", "path", "received", "received_name", "start", "state", "state_name") AS
SELECT "r1"."cell", "r1"."chosen", "r1"."inherited", ("qti"."__align_direction_names_vluq7iazdg"())["r1"."inherited" + 1]::"pg_catalog"."text", "r1"."own", ("qti"."__align_direction_names_vluq7iazdg"())["r1"."own" + 1]::"pg_catalog"."text", "r1"."package", "r1"."passes", ("qti"."__align_state_names_ffk37slxn3"())["r1"."passes" + 1]::"pg_catalog"."text", "r1"."path", "r1"."received", ("qti"."__align_state_names_ffk37slxn3"())["r1"."received" + 1]::"pg_catalog"."text", "r1"."start", "r1"."state", ("qti"."__align_state_names_ffk37slxn3"())["r1"."state" + 1]::"pg_catalog"."text"
FROM "qti"."math_align_scope" AS "r1";

CREATE VIEW "qti_queries__author"."math_cell" ("groups", "last_start", "leaves", "package", "path", "start") AS
SELECT "r1"."groups", "r1"."last_start", "r1"."leaves", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."math_cell" AS "r1";

CREATE VIEW "qti_queries__author"."math_cn" ("base", "base_name", "base_lexical", "package", "parts", "path", "start", "type", "type_name", "type_lexical") AS
SELECT "r1"."base", ("qti"."__cn_base_names_2wtzhyubck"())["r1"."base" + 1]::"pg_catalog"."text", "r1"."base_lexical", "r1"."package", "r1"."parts", "r1"."path", "r1"."start", "r1"."type", ("qti"."__cn_type_names_wmjelllvhg"())["r1"."type" + 1]::"pg_catalog"."text", "r1"."type_lexical"
FROM "qti"."math_cn" AS "r1";

CREATE VIEW "qti_queries__author"."math_rank" ("package", "path", "rank", "start") AS
SELECT "r1"."package", "r1"."path", "r1"."rank", "r1"."start"
FROM "qti"."math_rank" AS "r1";

CREATE VIEW "qti_queries__author"."media" ("digest", "package", "path") AS
SELECT "r1"."digest", "r1"."package", "r1"."path"
FROM "qti"."media" AS "r1";

CREATE VIEW "qti_queries__author"."most_count" ("most", "most_value", "package", "path", "start") AS
SELECT "r1"."most", "r1"."most_value", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."most_count" AS "r1";

CREATE VIEW "qti_queries__author"."named" ("identifier", "package", "path", "start") AS
SELECT "r1"."identifier", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."named" AS "r1";

CREATE VIEW "qti_queries__author"."namespace" ("package", "path", "prefix", "start", "uri") AS
SELECT "r1"."package", "r1"."path", "r1"."prefix", "r1"."start", "r1"."uri"
FROM "qti"."namespace" AS "r1";

CREATE VIEW "qti_queries__author"."node" ("ancestry", "at", "attributes", "attrs", "barred_children", "chars", "chars_after", "chars_was", "children", "counted_children", "element_children", "elements", "elements_was", "end", "first", "governor", "governor_name", "kind", "kind_name", "last", "last_state", "last_state_name", "nearest", "nearest_kind", "nearest_kind_name", "nearest_path", "open_attributes", "package", "parent", "parent_ancestry", "parent_governor", "parent_governor_name", "parent_kind", "parent_kind_name", "parent_nearest", "parent_nearest_kind", "parent_nearest_kind_name", "parent_nearest_path", "parent_parent_kind", "parent_parent_kind_name", "path", "prefix", "start", "state", "state_name", "string_value", "was", "was_name") AS
SELECT "r1"."ancestry", "r1"."at", "r1"."attributes", "r1"."attrs", "r1"."barred_children", "r1"."chars", "r1"."chars_after", "r1"."chars_was", "r1"."children", "r1"."counted_children", "r1"."element_children", "r1"."elements", "r1"."elements_was", "r1"."end", "r1"."first", "r1"."governor", ("qti"."__governor_names_d7jfyla3na"())["r1"."governor" + 1]::"pg_catalog"."text", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."last", "r1"."last_state", ("qti"."__position_names_sglcn7ygpg"())["r1"."last_state" + 1]::"pg_catalog"."text", "r1"."nearest", "r1"."nearest_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."nearest_kind" + 1]::"pg_catalog"."text", "r1"."nearest_path", "r1"."open_attributes", "r1"."package", "r1"."parent", "r1"."parent_ancestry", "r1"."parent_governor", ("qti"."__governor_names_d7jfyla3na"())["r1"."parent_governor" + 1]::"pg_catalog"."text", "r1"."parent_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."parent_kind" + 1]::"pg_catalog"."text", "r1"."parent_nearest", "r1"."parent_nearest_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."parent_nearest_kind" + 1]::"pg_catalog"."text", "r1"."parent_nearest_path", "r1"."parent_parent_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."parent_parent_kind" + 1]::"pg_catalog"."text", "r1"."path", "r1"."prefix", "r1"."start", "r1"."state", ("qti"."__position_names_sglcn7ygpg"())["r1"."state" + 1]::"pg_catalog"."text", "r1"."string_value", "r1"."was", ("qti"."__position_names_sglcn7ygpg"())["r1"."was" + 1]::"pg_catalog"."text"
FROM "qti"."node" AS "r1";

CREATE VIEW "qti_queries__author"."normal_maximum" ("lexical", "package", "path", "start") AS
SELECT "r1"."lexical", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."normal_maximum" AS "r1";

CREATE VIEW "qti_queries__author"."normal_minimum" ("lexical", "package", "path", "start", "written") AS
SELECT "r1"."lexical", "r1"."package", "r1"."path", "r1"."start", "r1"."written"
FROM "qti"."normal_minimum" AS "r1";

CREATE VIEW "qti_queries__author"."numbered_reading" ("assembly", "attribute", "attribute_name", "number", "package", "path", "scope", "scope_instance", "scope_path", "start", "variable") AS
SELECT "r1"."assembly", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."number", "r1"."package", "r1"."path", "r1"."scope", "r1"."scope_instance", "r1"."scope_path", "r1"."start", "r1"."variable"
FROM "qti"."numbered_reading" AS "r1";

CREATE VIEW "qti_queries__author"."open_attribute" ("class", "class_name", "element_namespace", "governor", "governor_name", "kind", "kind_name", "lexical", "local", "package", "path", "prefix", "slot", "start", "uri") AS
SELECT "r1"."class", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."class" + 1]::"pg_catalog"."text", "r1"."element_namespace", "r1"."governor", ("qti"."__governor_names_d7jfyla3na"())["r1"."governor" + 1]::"pg_catalog"."text", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."lexical", "r1"."local", "r1"."package", "r1"."path", "r1"."prefix", "r1"."slot", "r1"."start", "r1"."uri"
FROM "qti"."open_attribute" AS "r1";

CREATE VIEW "qti_queries__author"."open_attribute_entity" ("entity", "local", "offset", "package", "path", "start", "uri") AS
SELECT "r1"."entity", "r1"."local", "r1"."offset", "r1"."package", "r1"."path", "r1"."start", "r1"."uri"
FROM "qti"."open_attribute_entity" AS "r1";

CREATE VIEW "qti_queries__author"."open_element_name" ("local", "namespace", "package", "path", "start", "expanded") AS
SELECT "r1"."local", "r1"."namespace", "r1"."package", "r1"."path", "r1"."start", "r1"."expanded"
FROM "qti"."open_element_name" AS "r1";

CREATE VIEW "qti_queries__author"."open_element_type" ("package", "path", "start", "type", "type_name") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."type", ("qti"."__type_name_names_ksmacbo3df"())["r1"."type" + 1]::"pg_catalog"."text"
FROM "qti"."open_element_type" AS "r1";

CREATE VIEW "qti_queries__author"."package" ("name") AS
SELECT "r1"."name"
FROM "qti"."package" AS "r1";

CREATE VIEW "qti_queries__author"."pci_module_form" ("element", "package", "path", "start") AS
SELECT "r1"."element", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."pci_module_form" AS "r1";

CREATE VIEW "qti_queries__author"."pi" ("data", "package", "path", "start", "target") AS
SELECT "r1"."data", "r1"."package", "r1"."path", "r1"."start", "r1"."target"
FROM "qti"."pi" AS "r1";

CREATE VIEW "qti_queries__author"."placed_binding" ("adaptive", "assembly", "attribute", "attribute_name", "identifier", "instance", "package", "path", "start") AS
SELECT "r1"."adaptive", "r1"."assembly", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."instance", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."placed_binding" AS "r1";

CREATE VIEW "qti_queries__author"."placed_choice" ("assembly", "identifier", "instance", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."identifier", "r1"."instance", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."placed_choice" AS "r1";

CREATE VIEW "qti_queries__author"."placed_hottext" ("assembly", "identifier", "instance", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."identifier", "r1"."instance", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."placed_hottext" AS "r1";

CREATE VIEW "qti_queries__author"."placed_id" ("assembly", "assembly_kind", "assembly_kind_name", "id", "instance", "owner", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."assembly_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."assembly_kind" + 1]::"pg_catalog"."text", "r1"."id", "r1"."instance", "r1"."owner", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."placed_id" AS "r1";

CREATE VIEW "qti_queries__author"."placed_idref" ("assembly", "id", "instance", "package", "path") AS
SELECT "r1"."assembly", "r1"."id", "r1"."instance", "r1"."package", "r1"."path"
FROM "qti"."placed_idref" AS "r1";

CREATE VIEW "qti_queries__author"."placed_math_rank" ("assembly", "instance", "package", "path", "rank", "start") AS
SELECT "r1"."assembly", "r1"."instance", "r1"."package", "r1"."path", "r1"."rank", "r1"."start"
FROM "qti"."placed_math_rank" AS "r1";

CREATE VIEW "qti_queries__author"."placed_share_target" ("assembly", "assembly_kind", "assembly_kind_name", "id", "instance", "package", "path", "start", "target", "target_instance", "target_start") AS
SELECT "r1"."assembly", "r1"."assembly_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."assembly_kind" + 1]::"pg_catalog"."text", "r1"."id", "r1"."instance", "r1"."package", "r1"."path", "r1"."start", "r1"."target", "r1"."target_instance", "r1"."target_start"
FROM "qti"."placed_share_target" AS "r1";

CREATE VIEW "qti_queries__author"."placed_variable_ref" ("assembly", "attribute", "attribute_name", "identifier", "instance", "package", "path", "resolution", "resolution_name", "root_kind", "root_kind_name", "start") AS
SELECT "r1"."assembly", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."instance", "r1"."package", "r1"."path", "r1"."resolution", ("qti"."__reference_resolution_names_e7fbwruvm2"())["r1"."resolution" + 1]::"pg_catalog"."text", "r1"."root_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."root_kind" + 1]::"pg_catalog"."text", "r1"."start"
FROM "qti"."placed_variable_ref" AS "r1";

CREATE VIEW "qti_queries__author"."printed_variable_ref" ("assembly_kind", "assembly_kind_name", "attribute", "attribute_name", "identifier", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."assembly_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."assembly_kind" + 1]::"pg_catalog"."text", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."printed_variable_ref" AS "r1";

CREATE VIEW "qti_queries__author"."processing" ("language", "language_name", "package", "path", "start") AS
SELECT "r1"."language", ("qti"."__language_names_pvmtywwssv"())["r1"."language" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."processing" AS "r1";

CREATE VIEW "qti_queries__author"."reference" ("kind", "kind_name", "lead", "name", "name_name", "package", "params", "path", "scope", "scope_name", "start", "target", "trail") AS
SELECT "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."lead", "r1"."name", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."name" + 1]::"pg_catalog"."text", "r1"."package", "r1"."params", "r1"."path", "r1"."scope", ("qti"."__href_scope_names_y4pbuo4f5q"())["r1"."scope" + 1]::"pg_catalog"."text", "r1"."start", "r1"."target", "r1"."trail"
FROM "qti"."reference" AS "r1";

CREATE VIEW "qti_queries__author"."reference_path" ("kind", "kind_name", "name", "name_name", "package", "path", "start", "target") AS
SELECT "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."name", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."name" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start", "r1"."target"
FROM "qti"."reference_path" AS "r1";

CREATE VIEW "qti_queries__author"."referring_document" ("contexts", "feedbacks", "package", "path", "prints", "templates") AS
SELECT "r1"."contexts", "r1"."feedbacks", "r1"."package", "r1"."path", "r1"."prints", "r1"."templates"
FROM "qti"."referring_document" AS "r1";

CREATE VIEW "qti_queries__author"."resource_document" ("package", "path", "root_kind", "root_kind_name", "type", "type_name", "document_type", "document_type_name") AS
SELECT "r1"."package", "r1"."path", "r1"."root_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."root_kind" + 1]::"pg_catalog"."text", "r1"."type", ("qti"."__resource_type_names_2tbbvn3ion"())["r1"."type" + 1]::"pg_catalog"."text", "r1"."document_type", ("qti"."__document_type_names_ot37qp5org"())["r1"."document_type" + 1]::"pg_catalog"."text"
FROM "qti"."resource_document" AS "r1";

CREATE VIEW "qti_queries__author"."resource_href" ("package", "path", "scope", "scope_name", "start", "target") AS
SELECT "r1"."package", "r1"."path", "r1"."scope", ("qti"."__href_scope_names_y4pbuo4f5q"())["r1"."scope" + 1]::"pg_catalog"."text", "r1"."start", "r1"."target"
FROM "qti"."resource_href" AS "r1";

CREATE VIEW "qti_queries__author"."rounding" ("holds", "holds_name", "package", "path", "start") AS
SELECT "r1"."holds", ("qti"."__rounding_holds_names_6j2zaayymp"())["r1"."holds" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."rounding" AS "r1";

CREATE VIEW "qti_queries__author"."rounding_figures" ("figures_lexical", "package", "path", "start", "figures") AS
SELECT "r1"."figures_lexical", "r1"."package", "r1"."path", "r1"."start", "r1"."figures"
FROM "qti"."rounding_figures" AS "r1";

CREATE VIEW "qti_queries__author"."rounding_mode_figures" ("figures", "mode", "package", "path", "start") AS
SELECT "r1"."figures", "r1"."mode", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."rounding_mode_figures" AS "r1";

CREATE VIEW "qti_queries__author"."sd_decl" ("package", "path", "standalone", "standalone_name") AS
SELECT "r1"."package", "r1"."path", "r1"."standalone", ("qti"."__xml_standalone_names_psf7bszcug"())["r1"."standalone" + 1]::"pg_catalog"."text"
FROM "qti"."sd_decl" AS "r1";

CREATE VIEW "qti_queries__author"."share_fragment" ("assembled", "id", "package", "path", "placements", "start") AS
SELECT "r1"."assembled", "r1"."id", "r1"."package", "r1"."path", "r1"."placements", "r1"."start"
FROM "qti"."share_fragment" AS "r1";

CREATE VIEW "qti_queries__author"."share_target" ("id", "package", "path", "start", "target_start") AS
SELECT "r1"."id", "r1"."package", "r1"."path", "r1"."start", "r1"."target_start"
FROM "qti"."share_target" AS "r1";

CREATE VIEW "qti_queries__author"."site" ("ancestry", "children", "external", "governor", "governor_name", "kind", "kind_name", "nearest", "nearest_kind", "nearest_kind_name", "nearest_path", "package", "parent", "parent_kind", "parent_kind_name", "path", "start") AS
SELECT "r1"."ancestry", "r1"."children", "r1"."external", "r1"."governor", ("qti"."__governor_names_d7jfyla3na"())["r1"."governor" + 1]::"pg_catalog"."text", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."nearest", "r1"."nearest_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."nearest_kind" + 1]::"pg_catalog"."text", "r1"."nearest_path", "r1"."package", "r1"."parent", "r1"."parent_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."parent_kind" + 1]::"pg_catalog"."text", "r1"."path", "r1"."start"
FROM "qti"."site" AS "r1";

CREATE VIEW "qti_queries__author"."site_path" ("entry", "kind", "kind_name", "package", "path", "start", "target") AS
SELECT "r1"."entry", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start", "r1"."target"
FROM "qti"."site_path" AS "r1";

CREATE VIEW "qti_queries__author"."site_target" ("ancestry", "kind", "kind_name", "nearest", "nearest_kind", "nearest_kind_name", "package", "parent_kind", "parent_kind_name", "path", "places", "splices", "start", "target", "target_nearest", "target_nearest_kind", "target_nearest_kind_name", "target_nearest_path", "target_root", "target_root_name") AS
SELECT "r1"."ancestry", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."nearest", "r1"."nearest_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."nearest_kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."parent_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."parent_kind" + 1]::"pg_catalog"."text", "r1"."path", "r1"."places", "r1"."splices", "r1"."start", "r1"."target", "r1"."target_nearest", "r1"."target_nearest_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."target_nearest_kind" + 1]::"pg_catalog"."text", "r1"."target_nearest_path", "r1"."target_root", ("qti"."__node_kind_names_ulbko553n7"())["r1"."target_root" + 1]::"pg_catalog"."text"
FROM "qti"."site_target" AS "r1";

CREATE VIEW "qti_queries__author"."srcset" ("package", "path", "start", "token_text", "tokens", "trail") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."token_text", "r1"."tokens", "r1"."trail"
FROM "qti"."srcset" AS "r1";

CREATE VIEW "qti_queries__author"."srcset_candidate" ("at", "descriptor", "lead", "package", "path", "pieces_after", "pieces_was", "scope", "scope_name", "start", "url", "piece") AS
SELECT "r1"."at", "r1"."descriptor", "r1"."lead", "r1"."package", "r1"."path", "r1"."pieces_after", "r1"."pieces_was", "r1"."scope", ("qti"."__href_scope_names_y4pbuo4f5q"())["r1"."scope" + 1]::"pg_catalog"."text", "r1"."start", "r1"."url", "r1"."piece"
FROM "qti"."srcset_candidate" AS "r1";

CREATE VIEW "qti_queries__author"."ssml_scope" ("fragment", "package", "path", "start") AS
SELECT "r1"."fragment", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."ssml_scope" AS "r1";

CREATE VIEW "qti_queries__author"."stimulus_ref" ("identifier", "package", "path", "start") AS
SELECT "r1"."identifier", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."stimulus_ref" AS "r1";

CREATE VIEW "qti_queries__author"."table_header" ("id", "owner", "package", "path", "start") AS
SELECT "r1"."id", "r1"."owner", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."table_header" AS "r1";

CREATE VIEW "qti_queries__author"."table_scope" ("package", "path", "start", "table") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."table"
FROM "qti"."table_scope" AS "r1";

CREATE VIEW "qti_queries__author"."template_ref" ("assembly_kind", "assembly_kind_name", "attribute", "attribute_name", "identifier", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."assembly_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."assembly_kind" + 1]::"pg_catalog"."text", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."template_ref" AS "r1";

CREATE VIEW "qti_queries__author"."text_idref" ("after", "at", "before", "package", "path", "pieces_after", "pieces_was", "start", "token", "piece") AS
SELECT "r1"."after", "r1"."at", "r1"."before", "r1"."package", "r1"."path", "r1"."pieces_after", "r1"."pieces_was", "r1"."start", "r1"."token", "r1"."piece"
FROM "qti"."text_idref" AS "r1";

CREATE VIEW "qti_queries__author"."text_reference" ("kind", "kind_name", "lead", "package", "params", "path", "scope", "scope_name", "start", "target", "trail") AS
SELECT "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."lead", "r1"."package", "r1"."params", "r1"."path", "r1"."scope", ("qti"."__href_scope_names_y4pbuo4f5q"())["r1"."scope" + 1]::"pg_catalog"."text", "r1"."start", "r1"."target", "r1"."trail"
FROM "qti"."text_reference" AS "r1";

CREATE VIEW "qti_queries__author"."text_reference_path" ("kind", "kind_name", "package", "path", "start", "target") AS
SELECT "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start", "r1"."target"
FROM "qti"."text_reference_path" AS "r1";

CREATE VIEW "qti_queries__author"."tolerance" ("package", "path", "start", "token_text", "tokens") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."token_text", "r1"."tokens"
FROM "qti"."tolerance" AS "r1";

CREATE VIEW "qti_queries__author"."tolerance_token" ("after", "at", "before", "package", "path", "pieces_after", "pieces_was", "start", "token", "piece") AS
SELECT "r1"."after", "r1"."at", "r1"."before", "r1"."package", "r1"."path", "r1"."pieces_after", "r1"."pieces_was", "r1"."start", "r1"."token", "r1"."piece"
FROM "qti"."tolerance_token" AS "r1";

CREATE VIEW "qti_queries__author"."usage_value" ("base_type_lexical", "package", "path", "start", "text") AS
SELECT "r1"."base_type_lexical", "r1"."package", "r1"."path", "r1"."start", "r1"."text"
FROM "qti"."usage_value" AS "r1";

CREATE VIEW "qti_queries__author"."usage_value_base_type" ("base_type", "base_type_name", "base_type_lexical", "package", "path", "start", "text") AS
SELECT "r1"."base_type", ("qti"."__base_type_names_ok3nu5nck4"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."base_type_lexical", "r1"."package", "r1"."path", "r1"."start", "r1"."text"
FROM "qti"."usage_value_base_type" AS "r1";

CREATE VIEW "qti_queries__author"."variable_ref" ("after", "attribute", "attribute_name", "base_type", "base_type_name", "before", "cardinality", "cardinality_name", "element_base", "element_base_name", "element_cardinality", "element_cardinality_name", "identifier", "language", "language_name", "package", "path", "resolution", "resolution_name", "root_kind", "root_kind_name", "start") AS
SELECT "r1"."after", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."base_type", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."before", "r1"."cardinality", ("qti"."__value_cardinality_names_wzwznoycgf"())["r1"."cardinality" + 1]::"pg_catalog"."text", "r1"."element_base", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."element_base" + 1]::"pg_catalog"."text", "r1"."element_cardinality", ("qti"."__value_cardinality_names_wzwznoycgf"())["r1"."element_cardinality" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."language", ("qti"."__language_names_pvmtywwssv"())["r1"."language" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."resolution", ("qti"."__reference_resolution_names_e7fbwruvm2"())["r1"."resolution" + 1]::"pg_catalog"."text", "r1"."root_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."root_kind" + 1]::"pg_catalog"."text", "r1"."start"
FROM "qti"."variable_ref" AS "r1";

CREATE VIEW "qti_queries__author"."variable_ref_table" ("attribute", "attribute_name", "package", "path", "start", "table", "table_name") AS
SELECT "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start", "r1"."table", ("qti"."__referenced_table_names_qrpsijquzz"())["r1"."table" + 1]::"pg_catalog"."text"
FROM "qti"."variable_ref_table" AS "r1";

CREATE VIEW "qti_queries__author"."xml_decl" ("package", "path", "version") AS
SELECT "r1"."package", "r1"."path", "r1"."version"
FROM "qti"."xml_decl" AS "r1";

GRANT :"qti_queries__author" TO :"qti_queries__author_app" WITH INHERIT FALSE, SET TRUE;

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
GRANT USAGE ON SCHEMA "qti", "qti_views", "qti_queries", "qti_queries__author" TO :"qti_queries__author";

GRANT USAGE ON DOMAIN "qti"."__attribute_slot_bits_112_aecznthxg5", "qti"."__flag_bits_16_llpdtzgaon", "qti"."__value_base_bits_16_7t6pwwxbsh", "qti"."__value_cardinality_bits_8_mma4mwhphy", "qti"."__domain_gfw43vigph", "qti"."admission_map", "qti"."align_direction", "qti"."align_state", "qti"."attribute_model", "qti"."attribute_name", "qti"."attribute_slot", "qti"."base_type", "qti"."bound_facet", "qti"."bound_zero", "qti"."built_in", "qti"."cardinality", "qti"."cn_base", "qti"."cn_part", "qti"."cn_part_form", "qti"."cn_type", "qti"."content_model", "qti"."declaration_kind", "qti"."document_type", "qti"."domain_primitive", "qti"."entry_kind", "qti"."flag", "qti"."follow_set", "qti"."governor", "qti"."href_scope", "qti"."identity", "qti"."include_set", "qti"."language", "qti"."node_kind", "qti"."position", "qti"."reference_form", "qti"."reference_resolution", "qti"."reference_spelling", "qti"."referenced_table", "qti"."resource_type", "qti"."rounding_holds", "qti"."shared_model", "qti"."symbol_set", "qti"."type_name", "qti"."use", "qti"."value_base", "qti"."value_cardinality", "qti"."value_domain", "qti"."white_space", "qti"."xml_standalone", "qti"."__text_xj3zno7u3h", "qti"."__text_4snhn63tn4", "qti"."__text_netnsfkgs7", "qti"."__text_c6iptmtj2x", "qti"."__text_wchibbb5qm", "qti"."__text_4s4od7s5or", "qti"."__text_qswrkft5qs", "qti"."__text_76pfa5avf4", "qti"."__text_gke7uypkov", "qti"."__text_l7nqeazg5h", "qti"."__text_k5kwygzatl", "qti"."__text_7dfilirtp3", "qti"."__text_7j6kgluyjp", "qti"."__text_xey6ryorh5", "qti"."__text_oq3spimary", "qti"."__text_w7a4l3clst", "qti"."__text_23rzixl3a2", "qti"."__text_6zspo66rxv", "qti"."__text_vrcyezm7ka", "qti"."__text_7cbjao7rjc", "qti"."__text_zij47sgley", "qti"."__text_b6ykamoeho", "qti"."__text_xv5q2k3cum", "qti"."__text_3dlgl63rv6", "qti"."__text_mvb6rz2wwz", "qti"."__text_aezrarw5qb", "qti"."__text_3adwbksayk" TO :"qti_queries__author";

GRANT SELECT ON TABLE "qti_queries__author"."assembled_catalog", "qti_queries__author"."assembled_document", "qti_queries__author"."attribute", "qti_queries__author"."attribute_entity", "qti_queries__author"."binding_name", "qti_queries__author"."bound_variable", "qti_queries__author"."candidate_path", "qti_queries__author"."catalog_id", "qti_queries__author"."catalog_scope", "qti_queries__author"."cell_headers", "qti_queries__author"."cell_leaf", "qti_queries__author"."choice", "qti_queries__author"."choice_interaction", "qti_queries__author"."cn_attribute", "qti_queries__author"."cn_count", "qti_queries__author"."cn_part_text", "qti_queries__author"."cn_slot", "qti_queries__author"."comment", "qti_queries__author"."context_ref", "qti_queries__author"."count_bound", "qti_queries__author"."data_ssml", "qti_queries__author"."data_ssml_member", "qti_queries__author"."data_ssml_property", "qti_queries__author"."doctype", "qti_queries__author"."document", "qti_queries__author"."document_id", "qti_queries__author"."element_type", "qti_queries__author"."encoding_decl", "qti_queries__author"."entry", "qti_queries__author"."expression", "qti_queries__author"."feedback_ref", "qti_queries__author"."file", "qti_queries__author"."fragment_context_name", "qti_queries__author"."fragment_context_ref", "qti_queries__author"."fragment_feedback_name", "qti_queries__author"."fragment_feedback_ref", "qti_queries__author"."fragment_printed_name", "qti_queries__author"."fragment_printed_ref", "qti_queries__author"."fragment_scope", "qti_queries__author"."fragment_template_name", "qti_queries__author"."fragment_template_ref", "qti_queries__author"."header_token", "qti_queries__author"."hottext", "qti_queries__author"."identity_text", "qti_queries__author"."idref", "qti_queries__author"."idref_target", "qti_queries__author"."inclusion", "qti_queries__author"."instance", "qti_queries__author"."interaction", "qti_queries__author"."interaction_attribute", "qti_queries__author"."item_mode", "qti_queries__author"."item_ref_document", "qti_queries__author"."item_ref_href", "qti_queries__author"."label_use", "qti_queries__author"."least_count", "qti_queries__author"."link_reading", "qti_queries__author"."literal", "qti_queries__author"."literal_typed", "qti_queries__author"."lookup_value", "qti_queries__author"."map_key", "qti_queries__author"."mastery_value", "qti_queries__author"."math_action", "qti_queries__author"."math_align_group", "qti_queries__author"."math_align_scope", "qti_queries__author"."math_cell", "qti_queries__author"."math_cn", "qti_queries__author"."math_rank", "qti_queries__author"."media", "qti_queries__author"."most_count", "qti_queries__author"."named", "qti_queries__author"."namespace", "qti_queries__author"."node", "qti_queries__author"."normal_maximum", "qti_queries__author"."normal_minimum", "qti_queries__author"."numbered_reading", "qti_queries__author"."open_attribute", "qti_queries__author"."open_attribute_entity", "qti_queries__author"."open_element_name", "qti_queries__author"."open_element_type", "qti_queries__author"."package", "qti_queries__author"."pci_module_form", "qti_queries__author"."pi", "qti_queries__author"."placed_binding", "qti_queries__author"."placed_choice", "qti_queries__author"."placed_hottext", "qti_queries__author"."placed_id", "qti_queries__author"."placed_idref", "qti_queries__author"."placed_math_rank", "qti_queries__author"."placed_share_target", "qti_queries__author"."placed_variable_ref", "qti_queries__author"."printed_variable_ref", "qti_queries__author"."processing", "qti_queries__author"."reference", "qti_queries__author"."reference_path", "qti_queries__author"."referring_document", "qti_queries__author"."resource_document", "qti_queries__author"."resource_href", "qti_queries__author"."rounding", "qti_queries__author"."rounding_figures", "qti_queries__author"."rounding_mode_figures", "qti_queries__author"."sd_decl", "qti_queries__author"."share_fragment", "qti_queries__author"."share_target", "qti_queries__author"."site", "qti_queries__author"."site_path", "qti_queries__author"."site_target", "qti_queries__author"."srcset", "qti_queries__author"."srcset_candidate", "qti_queries__author"."ssml_scope", "qti_queries__author"."stimulus_ref", "qti_queries__author"."table_header", "qti_queries__author"."table_scope", "qti_queries__author"."template_ref", "qti_queries__author"."text_idref", "qti_queries__author"."text_reference", "qti_queries__author"."text_reference_path", "qti_queries__author"."tolerance", "qti_queries__author"."tolerance_token", "qti_queries__author"."usage_value", "qti_queries__author"."usage_value_base_type", "qti_queries__author"."variable_ref", "qti_queries__author"."variable_ref_table", "qti_queries__author"."xml_decl" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."assembled_catalog" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."assembled_document" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."attribute" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."attribute_entity" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."binding_name" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."bound_variable" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."candidate_path" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."catalog_id" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."catalog_scope" TO :"qti_queries__author";

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

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."count_bound" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."data_ssml" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."data_ssml_member" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."data_ssml_property" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."doctype" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."document" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."document_id" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."element_type" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."encoding_decl" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."entry" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."expression" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."feedback_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."file" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."fragment_context_name" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."fragment_context_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."fragment_feedback_name" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."fragment_feedback_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."fragment_printed_name" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."fragment_printed_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."fragment_scope" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."fragment_template_name" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."fragment_template_ref" TO :"qti_queries__author";

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

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."link_reading" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."literal" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."literal_typed" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."lookup_value" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."map_key" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."mastery_value" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."math_action" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."math_align_group" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."math_align_scope" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."math_cell" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."math_cn" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."math_rank" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."media" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."most_count" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."named" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."namespace" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."node" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."normal_maximum" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."normal_minimum" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."numbered_reading" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."open_attribute" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."open_attribute_entity" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."open_element_name" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."open_element_type" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."package" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."pci_module_form" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."pi" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_binding" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_choice" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_hottext" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_id" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_idref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_math_rank" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_share_target" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."placed_variable_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."printed_variable_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."processing" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."reference" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."reference_path" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."referring_document" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."resource_document" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."resource_href" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."rounding" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."rounding_figures" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."rounding_mode_figures" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."sd_decl" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."share_fragment" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."share_target" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."site" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."site_path" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."site_target" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."srcset" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."srcset_candidate" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."ssml_scope" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."stimulus_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."table_header" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."table_scope" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."template_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."text_idref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."text_reference" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."text_reference_path" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."tolerance" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."tolerance_token" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."usage_value" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."usage_value_base_type" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."variable_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."variable_ref_table" TO :"qti_queries__author";

GRANT SELECT, INSERT, DELETE ON TABLE "qti"."xml_decl" TO :"qti_queries__author";

GRANT EXECUTE ON FUNCTION "qti"."__refuse"("pg_catalog"."text", "pg_catalog"."text", "pg_catalog"."text") TO :"qti_queries__author";

GRANT EXECUTE ON FUNCTION "qti"."__constant_uij2fonltq"(), "qti"."__constant_bkqh2friwv"(), "qti"."__constant_n352p2ccrd"(), "qti"."__constant_7nj7hecpq2"(), "qti"."__constant_25evvcytug"(), "qti"."__constant_sx2lr4try3"(), "qti"."__constant_u7eltifwnk"(), "qti"."__constant_eihc4dooua"(), "qti"."__constant_nhyhb5mvr7"(), "qti"."__constant_ibiapjhixk"(), "qti"."__constant_rqwqzvpydz"(), "qti"."__constant_o42tylpu3f"(), "qti"."__constant_34ylax76r2"(), "qti"."__constant_zivpez3hny"(), "qti"."__constant_7dwaqc4qhd"(), "qti"."__constant_6tjsmg7qqf"(), "qti"."__constant_hmibfx5gyk"(), "qti"."__constant_j4ofs3gxv5"(), "qti"."__constant_ncvuf24xxr"(), "qti"."__constant_its5nruomz"(), "qti"."__constant_ykvwltiwpp"(), "qti"."__constant_wuvnkockig"(), "qti"."__constant_pqb7w4p5hy"(), "qti"."__constant_ttedx5vn3k"(), "qti"."__constant_ygahn2lxos"(), "qti"."__constant_6elmo3tsbj"(), "qti"."__constant_zdkkfmabrr"(), "qti"."__constant_wzcsm5lgek"(), "qti"."__constant_sxvrbj5e5g"(), "qti"."__constant_npu4wt2fbp"(), "qti"."__constant_is5wq7ypst"(), "qti"."__constant_jdee42qvkw"(), "qti"."__constant_gnajygigus"(), "qti"."__constant_2dcoyzngxn"(), "qti"."__constant_pyzqarxq6e"(), "qti"."__constant_ddolihfto7"(), "qti"."__constant_mqob2q6eth"(), "qti"."__constant_kzeitfadmd"(), "qti"."__constant_7sx4k5dafp"(), "qti"."__constant_4okg7vcxht"(), "qti"."__constant_rlw4rkvi5w"(), "qti"."__constant_llc3ctzcti"(), "qti"."__constant_kwiyfmd5vb"(), "qti"."__constant_hd6fiuddlw"(), "qti"."__constant_cvrzwozguy"(), "qti"."__constant_ciuqwbhuta"(), "qti"."__constant_whaydjeagy"(), "qti"."__constant_524yb4vb32"(), "qti"."__constant_u6qipu43gw"(), "qti"."__constant_j2u4rcjq6x"(), "qti"."__constant_eufobqzn7j"(), "qti"."__constant_vxtk2vgo73"(), "qti"."__constant_qrpsoa4uqr"(), "qti"."__constant_2xctpszff4"(), "qti"."__constant_sj4gtqwjvu"(), "qti"."__constant_inwmcukoes"(), "qti"."__constant_t2f7jyjfh5"(), "qti"."__constant_mhzhm7i77c"(), "qti"."__constant_3e2fnl7lx2"(), "qti"."__constant_omoipacrlm"(), "qti"."__constant_2p24sg5e4t"(), "qti"."__constant_exnqxdg5si"(), "qti"."__constant_wrlwssqvsp"(), "qti"."__constant_k64cxi3yp3"(), "qti"."__constant_b6ph5734n4"(), "qti"."__constant_5vczbwx7y7"(), "qti"."__constant_oz2fkzit2q"(), "qti"."__constant_5lt3ujp3cm"(), "qti"."__constant_samvsv5x3m"(), "qti"."__constant_ibvgt6pxwh"(), "qti"."__constant_6pgyw625sv"(), "qti"."__constant_ab562yacjn"(), "qti"."__constant_wvtqnkiky3"(), "qti"."__constant_26d5zth2zv"(), "qti"."__constant_6ktdfd4rhr"(), "qti"."__constant_xem42aq3by"(), "qti"."__constant_5pcz6dyjzi"(), "qti"."__constant_3zq77hs2za"(), "qti"."__constant_5w6ioztupb"(), "qti"."__constant_ka4rlh4hd6"(), "qti"."__constant_be4fhhavq4"(), "qti"."__constant_bmcetcvghy"(), "qti"."__constant_w4rn4enepj"(), "qti"."__constant_6f44bj6f5z"(), "qti"."__constant_nomzdv3mb7"(), "qti"."__constant_yzav37j3jv"(), "qti"."__constant_przq27rlwm"(), "qti"."__constant_qrfq2g4hkz"(), "qti"."__constant_wvf3myfrte"(), "qti"."__constant_firw67ibkt"(), "qti"."__constant_rqidljwzm2"(), "qti"."__constant_5r3at22xvz"(), "qti"."__constant_ellk4zorxq"(), "qti"."__constant_aagz375mdd"(), "qti"."__constant_aprps52eby"(), "qti"."__constant_ahddjwrhv5"(), "qti"."__constant_k3fjlwxuwn"(), "qti"."__constant_wxfnisv4kj"(), "qti"."__constant_zei655nkpr"(), "qti"."__constant_xvmgsamjvy"(), "qti"."__constant_ugrf235wgp"(), "qti"."__constant_lliww2nzpo"(), "qti"."__constant_avnlqmggvi"(), "qti"."__constant_g3mzemfbr3"(), "qti"."__constant_qhszlaty7i"(), "qti"."__constant_dqbnkda3gg"(), "qti"."__constant_gf6he576t3"(), "qti"."__constant_74uvt6ok2v"(), "qti"."__constant_zgknnwrg6p"(), "qti"."__constant_hl533zhknx"(), "qti"."__constant_fsmfviu65m"(), "qti"."__constant_on7irbswfh"(), "qti"."__constant_ow4c7w37ca"(), "qti"."__constant_wvuca46fcu"(), "qti"."__constant_7whnbuqq7w"(), "qti"."__constant_vs2arr6h6k"(), "qti"."__constant_ho6c7gpjo3"(), "qti"."__constant_ejkw66w2je"(), "qti"."__constant_u77vjsa3nx"(), "qti"."__constant_sl65lnozn2"(), "qti"."__constant_un3x4skblz"(), "qti"."__constant_otpfpakmgn"(), "qti"."__constant_2ladvjuynk"(), "qti"."__constant_p2xwmlesaa"(), "qti"."__constant_fccrluys3c"(), "qti"."__constant_7rkjmglcw6"(), "qti"."__constant_j6uos7o7iw"(), "qti"."__constant_24trt7i5oc"(), "qti"."__constant_7puc5uc6kh"(), "qti"."__constant_wekhard5xm"(), "qti"."__constant_ajahbtka65"(), "qti"."__constant_6iey4mkmde"(), "qti"."__constant_ab5qkascpx"(), "qti"."__constant_wuqtd2dywh"(), "qti"."__constant_5rhv5nncq2"(), "qti"."__constant_fe4yby2lv5"(), "qti"."__constant_wozychch32"(), "qti"."__constant_kk3tbfzgkz"(), "qti"."__constant_w7hnvtob66"(), "qti"."__constant_ucgcmte27p"(), "qti"."__constant_cmomvytsjq"(), "qti"."__constant_i7ai66pv6h"(), "qti"."__constant_y75rhchi3d"(), "qti"."__constant_uya5skuzlx"(), "qti"."__constant_c2ob5ijsqf"(), "qti"."__constant_sn5ucr2eat"(), "qti"."__constant_taww2a5tgr"(), "qti"."__constant_dtz4lgxf7y"(), "qti"."__constant_sjctib2m6a"(), "qti"."__constant_gqyrbuxeym"(), "qti"."__constant_hygd7nfdcf"(), "qti"."__constant_gg2lrkl4ik"(), "qti"."__constant_4hs7fzokws"(), "qti"."__constant_aiwrmlshlf"(), "qti"."__constant_ab3uwhdr2q"(), "qti"."__constant_tzvpybzw74"(), "qti"."__constant_txeneneu7t"(), "qti"."__constant_ioawzxl5py"(), "qti"."__text_digest_2x5x4iwe4m"("pg_catalog"."text"), "qti"."__admission_map_names_lxcybsqkgt"(), "qti"."__align_direction_names_vluq7iazdg"(), "qti"."__align_state_names_ffk37slxn3"(), "qti"."__attribute_model_names_r2z5pcz25w"(), "qti"."__attribute_name_names_q6tmzcty4e"(), "qti"."__attribute_slot_names_4r5l4mp24z"(), "qti"."__base_type_names_ok3nu5nck4"(), "qti"."__bound_facet_names_b7dbsbn4iu"(), "qti"."__bound_zero_names_2iyjgurtgw"(), "qti"."__built_in_names_qkzs4cgupe"(), "qti"."__cardinality_names_kqiairsoqa"(), "qti"."__cn_base_names_2wtzhyubck"(), "qti"."__cn_part_names_6db2fcgfhy"(), "qti"."__cn_part_form_names_te7u7jycdu"(), "qti"."__cn_type_names_wmjelllvhg"(), "qti"."__content_model_names_ren5hwffjp"(), "qti"."__declaration_kind_names_o62wpad2p7"(), "qti"."__document_type_names_ot37qp5org"(), "qti"."__domain_primitive_names_2yihitx2to"(), "qti"."__entry_kind_names_km5xejbmwu"(), "qti"."__flag_names_dttyznb5cw"(), "qti"."__follow_set_names_wpsp2qrfoh"(), "qti"."__governor_names_d7jfyla3na"(), "qti"."__href_scope_names_y4pbuo4f5q"(), "qti"."__identity_names_rrxxe77wjj"(), "qti"."__include_set_names_6bs2sxuszz"(), "qti"."__language_names_pvmtywwssv"(), "qti"."__node_kind_names_ulbko553n7"(), "qti"."__position_names_sglcn7ygpg"(), "qti"."__reference_form_names_gm6ro5a5jp"(), "qti"."__reference_resolution_names_e7fbwruvm2"(), "qti"."__reference_spelling_names_gocqpuf7tl"(), "qti"."__referenced_table_names_qrpsijquzz"(), "qti"."__resource_type_names_2tbbvn3ion"(), "qti"."__rounding_holds_names_6j2zaayymp"(), "qti"."__shared_model_names_5s5lwnfjh3"(), "qti"."__symbol_set_names_7wklvi4qhu"(), "qti"."__type_name_names_ksmacbo3df"(), "qti"."__use_names_vmbq6fav2t"(), "qti"."__value_base_names_pjzlcpdwvv"(), "qti"."__value_cardinality_names_wzwznoycgf"(), "qti"."__value_domain_names_myda2sxpvz"(), "qti"."__white_space_names_i54twzbo55"(), "qti"."__xml_standalone_names_psf7bszcug"(), "qti"."__attribute_name_live_7ot3c4gfh5"(), "qti"."__attribute_slot_live_g5haf24jp3"(), "qti"."__flag_live_egdpt3c4t6"(), "qti"."__value_base_live_trk5bm7ra5"(), "qti"."__value_cardinality_live_qbccqbzssx"(), "qti"."__row_xpekqjl2mx"("qti"."cn_type", "qti"."__domain_gfw43vigph"), "qti"."__row_zzy4tf2m2u"("qti"."node_kind", "qti"."node_kind", "qti"."attribute_name", "pg_catalog"."text"), "qti"."__row_dpnoe4rv6h"("qti"."governor", "qti"."__attribute_slot_bits_112_aecznthxg5"), "qti"."__row_fwroytfsuc"("qti"."governor", "qti"."attribute_name", "qti"."__text_c6iptmtj2x"), "qti"."__row_kbbc56kuh5"("pg_catalog"."text"), "qti"."__row_cdpcrvbl2a"("qti"."__attribute_slot_bits_112_aecznthxg5", "qti"."governor"), "qti"."__row_dds762ix6o"("qti"."node_kind", "qti"."__domain_gfw43vigph"), "qti"."__row_zfbcuk4gtg"("qti"."node_kind", "qti"."node_kind", "qti"."position", "qti"."__domain_gfw43vigph", bigint, bigint), "qti"."__row_scighrsurf"("qti"."__text_4snhn63tn4"), "qti"."__row_fdmkwfomtb"("pg_catalog"."text", bigint), "qti"."__row_kv5rkzmio2"("qti"."governor", "qti"."attribute_name"), "qti"."__row_3o3ow6nbmz"("qti"."node_kind", "qti"."__text_mvb6rz2wwz", "qti"."attribute_name", "qti"."__text_mvb6rz2wwz"), "qti"."__row_yhjz272c7n"("pg_catalog"."text", "qti"."href_scope"), "qti"."__row_6j7cairl4a"("qti"."cn_part", "qti"."cn_type", "qti"."cn_part_form"), "qti"."__row_unvebr7ujb"("pg_catalog"."text", "pg_catalog"."text", "pg_catalog"."text"), "qti"."__row_6rhtzxaia4"(boolean, "pg_catalog"."text"), "qti"."__row_dai7p7nf6j"("qti"."value_cardinality"), "qti"."__row_2jqjgtinlf"("qti"."__text_c6iptmtj2x"), "qti"."__row_s52thndv2z"("pg_catalog"."text"), "qti"."__row_rqvhy674p4"("qti"."node_kind", "qti"."type_name"), "qti"."__row_eqcec5telp"("pg_catalog"."text", "qti"."node_kind", "qti"."reference_resolution"), "qti"."__row_vsugw3arbl"("qti"."governor", "qti"."attribute_name", "qti"."__text_c6iptmtj2x"), "qti"."__row_7j4cj3ujio"("pg_catalog"."text", "pg_catalog"."text"), "qti"."__row_topiedmeph"("qti"."node_kind", "qti"."governor", "qti"."__text_c6iptmtj2x", "qti"."__text_gke7uypkov", "qti"."__text_gke7uypkov", "qti"."__flag_bits_16_llpdtzgaon", "qti"."__flag_bits_16_llpdtzgaon"), "qti"."__row_fieb2dvdh7"("pg_catalog"."text", "qti"."cn_type"), "qti"."__row_qhnrzprhff"("qti"."base_type", "pg_catalog"."text"), "qti"."__row_mvlazibe6j"("qti"."node_kind", "qti"."__attribute_slot_bits_112_aecznthxg5"), "qti"."__row_i4fvlc2bb6"("qti"."__text_6zspo66rxv"), "qti"."__row_i5hqpho2vw"("qti"."node_kind", "qti"."node_kind", "qti"."position", "qti"."position"), "qti"."__row_2ra54peno7"("qti"."__text_c6iptmtj2x", "qti"."node_kind", "qti"."attribute_name"), "qti"."__row_h55qs3ddi4"("qti"."position", "qti"."node_kind"), "qti"."__row_bx7m6665wc"("qti"."governor", "qti"."__text_oq3spimary"), "qti"."__row_oypzlmjlum"("qti"."__attribute_slot_bits_112_aecznthxg5", "qti"."governor"), "qti"."__row_fbzio7ptsd"("pg_catalog"."text", "qti"."node_kind", "qti"."value_base", "qti"."value_cardinality", "qti"."reference_resolution", "qti"."__text_3dlgl63rv6", "qti"."__text_3dlgl63rv6"), "qti"."__row_o63nenvexz"("qti"."node_kind", "qti"."node_kind", "qti"."position", "qti"."__domain_gfw43vigph", bigint, bigint), "qti"."__row_vafhk47l2f"("qti"."node_kind", "qti"."position"), "qti"."__row_otq4lb4uzs"("qti"."governor", "qti"."attribute_name"), "qti"."__row_kd7mqptoiv"("qti"."__text_k5kwygzatl"), "qti"."__row_5skakdnhjl"("qti"."governor", "qti"."__text_oq3spimary"), "qti"."__row_b5mgylvrip"("qti"."__attribute_slot_bits_112_aecznthxg5", "qti"."governor"), "qti"."__row_o6s6wr4ho7"("qti"."governor", "qti"."attribute_name"), "qti"."__row_e7h7hkejv4"("qti"."resource_type"), "qti"."__row_fqcrog6dfl"("pg_catalog"."text"), "qti"."__row_cagame6b6t"("qti"."node_kind", "qti"."node_kind", "qti"."position", "qti"."position"), "qti"."__row_4lllbffefr"("qti"."__text_w7a4l3clst"), "qti"."__row_il5jbfjsr7"("qti"."governor", "qti"."attribute_name", "qti"."__domain_gfw43vigph", "pg_catalog"."text", "qti"."__text_c6iptmtj2x", "qti"."__attribute_slot_bits_112_aecznthxg5"), "qti"."__row_3vyqydin2g"("qti"."node_kind", "qti"."__flag_bits_16_llpdtzgaon"), "qti"."__row_vua74sfnuq"("qti"."governor", "qti"."node_kind", "qti"."type_name"), "qti"."__row_j4wlgwmk7l"("qti"."__text_netnsfkgs7", "qti"."href_scope", "qti"."__text_b6ykamoeho", "qti"."__domain_gfw43vigph"), "qti"."__row_qws4baa74i"("pg_catalog"."text", "qti"."cn_base", "pg_catalog"."text", "qti"."cn_type"), "qti"."__row_cqo2oblkvo"("qti"."document_type", "qti"."__text_6zspo66rxv"), "qti"."__row_47rwmcck7h"("pg_catalog"."text", "qti"."base_type"), "qti"."__row_4g6tduxftl"("qti"."governor", "qti"."attribute_name", "qti"."__attribute_slot_bits_112_aecznthxg5"), "qti"."__row_jepjc2ekks"("qti"."governor", "qti"."__text_qswrkft5qs"), "qti"."__row_to7qnnmz2p"("pg_catalog"."text"), "qti"."__row_sjn7ztb5fk"("qti"."base_type"), "qti"."__row_tj75r6ek3n"("qti"."__attribute_slot_bits_112_aecznthxg5", "qti"."governor"), "qti"."__row_rcj6itvj2w"("qti"."__text_c6iptmtj2x"), "qti"."__row_3t2pmfpjno"("qti"."node_kind", "qti"."__text_qswrkft5qs", "qti"."attribute_name"), "qti"."__row_onczbmwqpm"("qti"."governor", "qti"."attribute_name", "qti"."__text_c6iptmtj2x"), "qti"."__row_44g6vpyjsw"("qti"."governor", "qti"."attribute_name", "qti"."__text_c6iptmtj2x"), "qti"."__row_7ebkly7ayy"("pg_catalog"."text", bigint), "qti"."__row_56t7mprg5a"("qti"."node_kind", "qti"."node_kind", boolean, boolean), "qti"."__row_bdiry5fm57"("qti"."__text_oq3spimary"), "qti"."__row_kaddqdvwod"("qti"."governor", "qti"."__attribute_slot_bits_112_aecznthxg5"), "qti"."__row_vv7aysnmh3"("qti"."value_base"), "qti"."__row_et5rveakei"("pg_catalog"."text", "qti"."cn_part_form", "qti"."cn_base"), "qti"."__row_4lefqkcprs"("qti"."node_kind", "qti"."node_kind"), "qti"."__row_3qgkwnovoe"("qti"."__text_c6iptmtj2x"), "qti"."__row_l3skqw25vw"("qti"."node_kind", "qti"."node_kind", "qti"."governor", "qti"."__domain_gfw43vigph", "qti"."__text_oq3spimary", "qti"."__text_oq3spimary", "qti"."__text_c6iptmtj2x"), "qti"."__row_odiicdknst"("pg_catalog"."text", "qti"."base_type"), "qti"."__row_2ya6cjdips"("qti"."governor", "qti"."attribute_name", "qti"."__text_c6iptmtj2x"), "qti"."__row_awivwlafyr"("qti"."resource_type", "qti"."node_kind") TO :"qti_queries__author";

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
GRANT TEMPORARY ON DATABASE :"DBNAME" TO :"qti_queries__author";

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
GRANT USAGE ON SCHEMA "qti" TO :"qti_queries__author_app";

GRANT EXECUTE ON FUNCTION "qti"."__snapshot_guard"("pg_catalog"."text") TO :"qti_queries__author_app";

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
GRANT USAGE ON SCHEMA "qti" TO :"__live_lxch3umxkh";

GRANT SELECT ON TABLE "qti"."__live_secret" TO :"__live_lxch3umxkh";

GRANT SELECT ON TABLE "qti"."__ledger" TO :"qti_queries__author_app";

ALTER ROLE :"qti_queries__author_app" SET search_path = "pg_catalog", "pg_temp";

ALTER ROLE :"qti_queries__author_app" SET extra_float_digits = '1';

ALTER ROLE :"qti_queries__author_app" SET DateStyle = 'ISO, YMD';

ALTER ROLE :"qti_queries__author_app" SET bytea_output = 'hex';

ALTER ROLE :"qti_queries__author_app" SET lc_monetary = 'C.UTF-8';

ALTER ROLE :"qti_queries__author_app" SET lc_numeric = 'C.UTF-8';

ALTER ROLE :"qti_queries__author_app" SET lc_time = 'C.UTF-8';

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
REVOKE ALL ON SCHEMA "qti", "qti_views", "qti_queries", "qti_queries__author" FROM PUBLIC;

REVOKE ALL ON TABLE "qti"."assembled_catalog", "qti"."assembled_document", "qti"."attribute", "qti"."attribute_entity", "qti"."binding_name", "qti"."bound_variable", "qti"."candidate_path", "qti"."catalog_id", "qti"."catalog_scope", "qti"."cell_headers", "qti"."cell_leaf", "qti"."choice", "qti"."choice_interaction", "qti"."cn_attribute", "qti"."cn_count", "qti"."cn_part_text", "qti"."cn_slot", "qti"."comment", "qti"."context_ref", "qti"."count_bound", "qti"."data_ssml", "qti"."data_ssml_member", "qti"."data_ssml_property", "qti"."doctype", "qti"."document", "qti"."document_id", "qti"."element_type", "qti"."encoding_decl", "qti"."entry", "qti"."expression", "qti"."feedback_ref", "qti"."file", "qti"."fragment_context_name", "qti"."fragment_context_ref", "qti"."fragment_feedback_name", "qti"."fragment_feedback_ref", "qti"."fragment_printed_name", "qti"."fragment_printed_ref", "qti"."fragment_scope", "qti"."fragment_template_name", "qti"."fragment_template_ref", "qti"."header_token", "qti"."hottext", "qti"."identity_text", "qti"."idref", "qti"."idref_target", "qti"."inclusion", "qti"."instance", "qti"."interaction", "qti"."interaction_attribute", "qti"."item_mode", "qti"."item_ref_document", "qti"."item_ref_href", "qti"."label_use", "qti"."least_count", "qti"."link_reading", "qti"."literal", "qti"."literal_typed", "qti"."lookup_value", "qti"."map_key", "qti"."mastery_value", "qti"."math_action", "qti"."math_align_group", "qti"."math_align_scope", "qti"."math_cell", "qti"."math_cn", "qti"."math_rank", "qti"."media", "qti"."most_count", "qti"."named", "qti"."namespace", "qti"."node", "qti"."normal_maximum", "qti"."normal_minimum", "qti"."numbered_reading", "qti"."open_attribute", "qti"."open_attribute_entity", "qti"."open_element_name", "qti"."open_element_type", "qti"."package", "qti"."pci_module_form", "qti"."pi", "qti"."placed_binding", "qti"."placed_choice", "qti"."placed_hottext", "qti"."placed_id", "qti"."placed_idref", "qti"."placed_math_rank", "qti"."placed_share_target", "qti"."placed_variable_ref", "qti"."printed_variable_ref", "qti"."processing", "qti"."reference", "qti"."reference_path", "qti"."referring_document", "qti"."resource_document", "qti"."resource_href", "qti"."rounding", "qti"."rounding_figures", "qti"."rounding_mode_figures", "qti"."sd_decl", "qti"."share_fragment", "qti"."share_target", "qti"."site", "qti"."site_path", "qti"."site_target", "qti"."srcset", "qti"."srcset_candidate", "qti"."ssml_scope", "qti"."stimulus_ref", "qti"."table_header", "qti"."table_scope", "qti"."template_ref", "qti"."text_idref", "qti"."text_reference", "qti"."text_reference_path", "qti"."tolerance", "qti"."tolerance_token", "qti"."usage_value", "qti"."usage_value_base_type", "qti"."variable_ref", "qti"."variable_ref_table", "qti"."xml_decl", "qti_queries__author"."assembled_catalog", "qti_queries__author"."assembled_document", "qti_queries__author"."attribute", "qti_queries__author"."attribute_entity", "qti_queries__author"."binding_name", "qti_queries__author"."bound_variable", "qti_queries__author"."candidate_path", "qti_queries__author"."catalog_id", "qti_queries__author"."catalog_scope", "qti_queries__author"."cell_headers", "qti_queries__author"."cell_leaf", "qti_queries__author"."choice", "qti_queries__author"."choice_interaction", "qti_queries__author"."cn_attribute", "qti_queries__author"."cn_count", "qti_queries__author"."cn_part_text", "qti_queries__author"."cn_slot", "qti_queries__author"."comment", "qti_queries__author"."context_ref", "qti_queries__author"."count_bound", "qti_queries__author"."data_ssml", "qti_queries__author"."data_ssml_member", "qti_queries__author"."data_ssml_property", "qti_queries__author"."doctype", "qti_queries__author"."document", "qti_queries__author"."document_id", "qti_queries__author"."element_type", "qti_queries__author"."encoding_decl", "qti_queries__author"."entry", "qti_queries__author"."expression", "qti_queries__author"."feedback_ref", "qti_queries__author"."file", "qti_queries__author"."fragment_context_name", "qti_queries__author"."fragment_context_ref", "qti_queries__author"."fragment_feedback_name", "qti_queries__author"."fragment_feedback_ref", "qti_queries__author"."fragment_printed_name", "qti_queries__author"."fragment_printed_ref", "qti_queries__author"."fragment_scope", "qti_queries__author"."fragment_template_name", "qti_queries__author"."fragment_template_ref", "qti_queries__author"."header_token", "qti_queries__author"."hottext", "qti_queries__author"."identity_text", "qti_queries__author"."idref", "qti_queries__author"."idref_target", "qti_queries__author"."inclusion", "qti_queries__author"."instance", "qti_queries__author"."interaction", "qti_queries__author"."interaction_attribute", "qti_queries__author"."item_mode", "qti_queries__author"."item_ref_document", "qti_queries__author"."item_ref_href", "qti_queries__author"."label_use", "qti_queries__author"."least_count", "qti_queries__author"."link_reading", "qti_queries__author"."literal", "qti_queries__author"."literal_typed", "qti_queries__author"."lookup_value", "qti_queries__author"."map_key", "qti_queries__author"."mastery_value", "qti_queries__author"."math_action", "qti_queries__author"."math_align_group", "qti_queries__author"."math_align_scope", "qti_queries__author"."math_cell", "qti_queries__author"."math_cn", "qti_queries__author"."math_rank", "qti_queries__author"."media", "qti_queries__author"."most_count", "qti_queries__author"."named", "qti_queries__author"."namespace", "qti_queries__author"."node", "qti_queries__author"."normal_maximum", "qti_queries__author"."normal_minimum", "qti_queries__author"."numbered_reading", "qti_queries__author"."open_attribute", "qti_queries__author"."open_attribute_entity", "qti_queries__author"."open_element_name", "qti_queries__author"."open_element_type", "qti_queries__author"."package", "qti_queries__author"."pci_module_form", "qti_queries__author"."pi", "qti_queries__author"."placed_binding", "qti_queries__author"."placed_choice", "qti_queries__author"."placed_hottext", "qti_queries__author"."placed_id", "qti_queries__author"."placed_idref", "qti_queries__author"."placed_math_rank", "qti_queries__author"."placed_share_target", "qti_queries__author"."placed_variable_ref", "qti_queries__author"."printed_variable_ref", "qti_queries__author"."processing", "qti_queries__author"."reference", "qti_queries__author"."reference_path", "qti_queries__author"."referring_document", "qti_queries__author"."resource_document", "qti_queries__author"."resource_href", "qti_queries__author"."rounding", "qti_queries__author"."rounding_figures", "qti_queries__author"."rounding_mode_figures", "qti_queries__author"."sd_decl", "qti_queries__author"."share_fragment", "qti_queries__author"."share_target", "qti_queries__author"."site", "qti_queries__author"."site_path", "qti_queries__author"."site_target", "qti_queries__author"."srcset", "qti_queries__author"."srcset_candidate", "qti_queries__author"."ssml_scope", "qti_queries__author"."stimulus_ref", "qti_queries__author"."table_header", "qti_queries__author"."table_scope", "qti_queries__author"."template_ref", "qti_queries__author"."text_idref", "qti_queries__author"."text_reference", "qti_queries__author"."text_reference_path", "qti_queries__author"."tolerance", "qti_queries__author"."tolerance_token", "qti_queries__author"."usage_value", "qti_queries__author"."usage_value_base_type", "qti_queries__author"."variable_ref", "qti_queries__author"."variable_ref_table", "qti_queries__author"."xml_decl" FROM PUBLIC;

REVOKE ALL ON DOMAIN "qti"."admission_map", "qti"."align_direction", "qti"."align_state", "qti"."attribute_model", "qti"."attribute_name", "qti"."__attribute_name_bits_416_thr6i6sipt", "qti"."attribute_slot", "qti"."__attribute_slot_bits_112_aecznthxg5", "qti"."base_type", "qti"."bound_facet", "qti"."bound_zero", "qti"."built_in", "qti"."cardinality", "qti"."cn_base", "qti"."cn_part", "qti"."cn_part_form", "qti"."cn_type", "qti"."content_model", "qti"."declaration_kind", "qti"."document_type", "qti"."domain_primitive", "qti"."entry_kind", "qti"."flag", "qti"."__flag_bits_16_llpdtzgaon", "qti"."follow_set", "qti"."governor", "qti"."href_scope", "qti"."identity", "qti"."include_set", "qti"."language", "qti"."node_kind", "qti"."__node_kind_bits_648_lh43fw4nuo", "qti"."position", "qti"."__position_bits_312_cnr3fptmz4", "qti"."reference_form", "qti"."reference_resolution", "qti"."reference_spelling", "qti"."referenced_table", "qti"."resource_type", "qti"."rounding_holds", "qti"."shared_model", "qti"."symbol_set", "qti"."type_name", "qti"."use", "qti"."value_base", "qti"."__value_base_bits_16_7t6pwwxbsh", "qti"."value_cardinality", "qti"."__value_cardinality_bits_8_mma4mwhphy", "qti"."value_domain", "qti"."white_space", "qti"."xml_standalone", "qti"."__text_6zspo66rxv", "qti"."__text_xv5q2k3cum", "qti"."__text_c6iptmtj2x", "qti"."__text_wchibbb5qm", "qti"."__text_xj3zno7u3h", "qti"."__text_7j6kgluyjp", "qti"."__text_l7nqeazg5h", "qti"."__text_xey6ryorh5", "qti"."__text_7dfilirtp3", "qti"."__text_4snhn63tn4", "qti"."__text_sac6h6c6eh", "qti"."__text_oq3spimary", "qti"."__text_vrcyezm7ka", "qti"."__text_zij47sgley", "qti"."__text_gke7uypkov", "qti"."__text_76pfa5avf4", "qti"."__text_mvb6rz2wwz", "qti"."__text_qswrkft5qs", "qti"."__text_7cbjao7rjc", "qti"."__text_w7a4l3clst", "qti"."__text_23rzixl3a2", "qti"."__text_3adwbksayk", "qti"."__text_k5kwygzatl", "qti"."__text_b6ykamoeho", "qti"."__text_4s4od7s5or", "qti"."__text_netnsfkgs7", "qti"."__text_3dlgl63rv6", "qti"."__text_aezrarw5qb", "qti"."__domain_gfw43vigph", "qti"."__param_package_ulo5hrttvh", "qti"."__param_path_wphbbw3r67", "qti"."__param_name_tch4oix6gh" FROM PUBLIC;

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
ALTER DEFAULT PRIVILEGES IN SCHEMA "qti" REVOKE ALL ON TABLES FROM PUBLIC;

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
ALTER DEFAULT PRIVILEGES IN SCHEMA "qti" REVOKE ALL ON SEQUENCES FROM PUBLIC;

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
ALTER DEFAULT PRIVILEGES IN SCHEMA "qti_views" REVOKE ALL ON TABLES FROM PUBLIC;

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
ALTER DEFAULT PRIVILEGES IN SCHEMA "qti_views" REVOKE ALL ON SEQUENCES FROM PUBLIC;

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
ALTER DEFAULT PRIVILEGES IN SCHEMA "qti_queries" REVOKE ALL ON TABLES FROM PUBLIC;

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
ALTER DEFAULT PRIVILEGES IN SCHEMA "qti_queries" REVOKE ALL ON SEQUENCES FROM PUBLIC;

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
ALTER DEFAULT PRIVILEGES REVOKE ALL ON FUNCTIONS FROM PUBLIC;

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
ALTER DEFAULT PRIVILEGES REVOKE ALL ON TYPES FROM PUBLIC;

COMMENT ON FUNCTION "qti"."__constant_uij2fonltq"() IS 'closed constant 010ec88e3227058d7a28809e1fac974ca9b27c39b82efdbeb729b64a40b64eca';

COMMENT ON FUNCTION "qti"."__constant_bkqh2friwv"() IS 'closed constant 01c6e13663abe505d255e6bafff3b613936b9f2679eda2ea46215f6e4e4cdfea';

COMMENT ON FUNCTION "qti"."__constant_n352p2ccrd"() IS 'closed constant 07177490a402d9814e7eb73e6f293b786e1bf6ffff722eae0c580b0e944b9265';

COMMENT ON FUNCTION "qti"."__constant_7nj7hecpq2"() IS 'closed constant 09e90e3c0fcf722b0195ed0fa51722117de95ea99fbe779baebdc98986b67ec8';

COMMENT ON FUNCTION "qti"."__constant_25evvcytug"() IS 'closed constant 09f8a9806b6e6246b402ca3a3dad1722ebf1631ca7b1e148b712729126d254d1';

COMMENT ON FUNCTION "qti"."__constant_sx2lr4try3"() IS 'closed constant 0aa84b7817571419a0c8e7fdb9f546478e767dd567b63c030a2268016b77678d';

COMMENT ON FUNCTION "qti"."__constant_u7eltifwnk"() IS 'closed constant 0c05ac8da31dc1f3a39e2b452a992d76999aa9eff8f902ceec842e5c49716ef4';

COMMENT ON FUNCTION "qti"."__constant_eihc4dooua"() IS 'closed constant 0ce0ae38828a259ab49b25bdbb4655b8e5cf00e11076e3bfa77efa681454e891';

COMMENT ON FUNCTION "qti"."__constant_nhyhb5mvr7"() IS 'closed constant 10796be6d1e0bf108e936950c29b2ce16c072f892490c2d2e56a1c35e6b85a4d';

COMMENT ON FUNCTION "qti"."__constant_ibiapjhixk"() IS 'closed constant 1396646b8361a83297f299264ac7ff850b7f076edf65ea7681ce5ff7553dda82';

COMMENT ON FUNCTION "qti"."__constant_rqwqzvpydz"() IS 'closed constant 13ca4a62db0f81491f25efa5f55d91b61f94c116ab0ec8485cb44dd479309118';

COMMENT ON FUNCTION "qti"."__constant_o42tylpu3f"() IS 'closed constant 166b0f0140721b627390e22b04e27398ff9d6dd9fc327492fbadf80c0701bfe3';

COMMENT ON FUNCTION "qti"."__constant_34ylax76r2"() IS 'closed constant 17f6ea53fcbdf45a4ac7ff07b723b6d97819d393a313db247b4c0121ce7f34fa';

COMMENT ON FUNCTION "qti"."__constant_zivpez3hny"() IS 'closed constant 17fe166386301b54f354c514c5d91d207febece3dd51d5f51663fcd96f02844f';

COMMENT ON FUNCTION "qti"."__constant_7dwaqc4qhd"() IS 'closed constant 1a7d456638378c1555607f4e1f8f8701be48a64882df67019d0e5e2478d3799c';

COMMENT ON FUNCTION "qti"."__constant_6tjsmg7qqf"() IS 'closed constant 1e5bacd69ab53512f3b6f32e1ad682a9c3c3adbb9c6fea36e4cb4b90f3b849b3';

COMMENT ON FUNCTION "qti"."__constant_hmibfx5gyk"() IS 'closed constant 1fe13059f9e5b135d2e288ee4135dbe204a97f2bc65de2633ea6e943d57bcd48';

COMMENT ON FUNCTION "qti"."__constant_j4ofs3gxv5"() IS 'closed constant 203950979982597d993fd17b9004e818c2df33186e1cb8d25f902e364552055b';

COMMENT ON FUNCTION "qti"."__constant_ncvuf24xxr"() IS 'closed constant 20b96f81148f94c0b086dedb7aa13dde6e129b8f4af23e1db66ca70e5ea47d69';

COMMENT ON FUNCTION "qti"."__constant_its5nruomz"() IS 'closed constant 2179ca558911c1cddaa8db80e97fa50976618dfe502d5fca536f3bc130af5104';

COMMENT ON FUNCTION "qti"."__constant_ykvwltiwpp"() IS 'closed constant 220871b6e15e191afe9252924891dc5c6983a6702c110ebf07e2c4e033b4e99a';

COMMENT ON FUNCTION "qti"."__constant_wuvnkockig"() IS 'closed constant 22ba74bf41cc712bf501b8633990851ceb7b5752e967e7cd4ced65377022fff8';

COMMENT ON FUNCTION "qti"."__constant_pqb7w4p5hy"() IS 'closed constant 251644fcad8eb47071f8e1a345c3a378e839bf3fe1015a5fe68c1a7f08455d2c';

COMMENT ON FUNCTION "qti"."__constant_ttedx5vn3k"() IS 'closed constant 25783aecd8e4d189de992257c6f6b07dc928aec73ffb8ee65c3ae19ca879eda2';

COMMENT ON FUNCTION "qti"."__constant_ygahn2lxos"() IS 'closed constant 26027e36135ac42f78a50a79e7937276a7ed769828386c4ba131ed6404950531';

COMMENT ON FUNCTION "qti"."__constant_6elmo3tsbj"() IS 'closed constant 264b99fba1f3b91744528544becfd2f84557e46543707aefe07474fefc0c4c09';

COMMENT ON FUNCTION "qti"."__constant_zdkkfmabrr"() IS 'closed constant 2725df0b46fd65a8640ecb5f591a39b3ec18690763bc4484add386b74bd70f7f';

COMMENT ON FUNCTION "qti"."__constant_wzcsm5lgek"() IS 'closed constant 293086f028a6a3dd8e4a388718483d79353473ec3d00be18c2c25cae9ba0b339';

COMMENT ON FUNCTION "qti"."__constant_sxvrbj5e5g"() IS 'closed constant 2968101be8d09742018aec170c3479511cdda4e47ad6fc07fcdca289943aeb3f';

COMMENT ON FUNCTION "qti"."__constant_npu4wt2fbp"() IS 'closed constant 29c2dee5afed7b3d2f1de2ce17c54dcae727cbd80b332548be3e2206c0ef9ab1';

COMMENT ON FUNCTION "qti"."__constant_is5wq7ypst"() IS 'closed constant 2ba948578273214397bfdeae1c2ba45fcfbc155c38843736e69a44fcf466b307';

COMMENT ON FUNCTION "qti"."__constant_jdee42qvkw"() IS 'closed constant 2bf17c7ea99ea49d7014190619e2175adf3fd4a112d6629c9139727b346ecdd9';

COMMENT ON FUNCTION "qti"."__constant_gnajygigus"() IS 'closed constant 2dbb451297ffda0db2067df35a30795a8cb646c0d2cb76af76ce15c57a0703f4';

COMMENT ON FUNCTION "qti"."__constant_2dcoyzngxn"() IS 'closed constant 2dfddbfc203dcfece751a3e05c72dd8035a7cc9e4bd2c9e2761a9cd636fc5d38';

COMMENT ON FUNCTION "qti"."__constant_pyzqarxq6e"() IS 'closed constant 2f59ddd3ee3facd1785a2c82866d35b0f0122ad6d645ee1a18ea81464b75d161';

COMMENT ON FUNCTION "qti"."__constant_ddolihfto7"() IS 'closed constant 30182d13a007dd078162ce278e6d93f57cf6175699cbf0a5019fae213eee231a';

COMMENT ON FUNCTION "qti"."__constant_mqob2q6eth"() IS 'closed constant 30447a1c32fd567333fe2f2967476727bf5ff9dd9e45cf27de006d40dab244c4';

COMMENT ON FUNCTION "qti"."__constant_kzeitfadmd"() IS 'closed constant 30ae51315920c84d21077d4be25255b8b1d1552585a1b9f7da17e1b850cf1825';

COMMENT ON FUNCTION "qti"."__constant_7sx4k5dafp"() IS 'closed constant 33358071921fbbf20238504a74ac23db82aa46696530a6b209d643705583b9d3';

COMMENT ON FUNCTION "qti"."__constant_4okg7vcxht"() IS 'closed constant 3cf3e0a46c88d08cda9b060da44f0ad74b3053e93b93dafda637af3db2defc83';

COMMENT ON FUNCTION "qti"."__constant_rlw4rkvi5w"() IS 'closed constant 42682a569a3eb914d39a4787c0edbd911c00d59be854ddff48910bbe4b131eeb';

COMMENT ON FUNCTION "qti"."__constant_llc3ctzcti"() IS 'closed constant 42793e020895155f8d91eb5498bc20b6ee01a819ad5e861c1228fd9c2b129cbe';

COMMENT ON FUNCTION "qti"."__constant_kwiyfmd5vb"() IS 'closed constant 43ce8a398d2536aa2bda523c85f237984f5823dffe285bbdd71a75523e90ac3d';

COMMENT ON FUNCTION "qti"."__constant_hd6fiuddlw"() IS 'closed constant 446d7da601b1e8b181efa4921760e2f5edd8de2ffba0aacfb289a30785cdf0b3';

COMMENT ON FUNCTION "qti"."__constant_cvrzwozguy"() IS 'closed constant 44d605ae4dff6fd44f776534dad35e804e4cd6b865dd3e14b3cbaa763c76c3a8';

COMMENT ON FUNCTION "qti"."__constant_ciuqwbhuta"() IS 'closed constant 44eaa480767984ff0a1bad73f9be90634659bab8c0320c9c24b3b52f422b3aea';

COMMENT ON FUNCTION "qti"."__constant_whaydjeagy"() IS 'closed constant 492abc35720e0155f4d898d965c003e7e62a5639d722448fc5f82b4ca4a5e193';

COMMENT ON FUNCTION "qti"."__constant_524yb4vb32"() IS 'closed constant 4bfaa4362cfd0624531d41cfa18258f301a53c02d66ef7a73589284de9d5d86a';

COMMENT ON FUNCTION "qti"."__constant_u6qipu43gw"() IS 'closed constant 4dc083a20e9916cad9c7136e3efca49c35bf7564aad555383aeae08ba8f805e2';

COMMENT ON FUNCTION "qti"."__constant_j2u4rcjq6x"() IS 'closed constant 507723e3bee7af37a06035569c4af1bfaaf449ea5e72786ba8a8ddba6817b45e';

COMMENT ON FUNCTION "qti"."__constant_eufobqzn7j"() IS 'closed constant 532dea174bc2c07effa2aecebf61a339e178c504ecd33112ab8fbd191048430e';

COMMENT ON FUNCTION "qti"."__constant_vxtk2vgo73"() IS 'closed constant 55eba54a47ceff13fd5c3a1807a71b33a19c9651f8bb4ac6f64661ebc984835a';

COMMENT ON FUNCTION "qti"."__constant_qrpsoa4uqr"() IS 'closed constant 5625b9324fbb48a16e70e9c0285eacb064b8d7b412324828d032c828414badc9';

COMMENT ON FUNCTION "qti"."__constant_2xctpszff4"() IS 'closed constant 5b8ebf56f30f390c1b4fc602e0dab5e49a7912d03b11f95745b0709012473178';

COMMENT ON FUNCTION "qti"."__constant_sj4gtqwjvu"() IS 'closed constant 5cea40ce719a514d5c6634a87f9120b76a6a468ef5b09abbeb3914be23049abb';

COMMENT ON FUNCTION "qti"."__constant_inwmcukoes"() IS 'closed constant 5ec2aeb708816afe0dc8a8ad940667c33997453628ef1a3ebaa100f7929f5042';

COMMENT ON FUNCTION "qti"."__constant_t2f7jyjfh5"() IS 'closed constant 61f4c247e33514f7f465607c91ffde238e5063d468122c654b6ad093e8b857b5';

COMMENT ON FUNCTION "qti"."__constant_mhzhm7i77c"() IS 'closed constant 62002f4ebe246cbb414bb6a88679e85bb8be2c2caf23a88f1de8fdf7a25eaaee';

COMMENT ON FUNCTION "qti"."__constant_3e2fnl7lx2"() IS 'closed constant 67b9f65a7a2cf6bed3e2ccd91e677c935eaf36f87a9b3078256a34cc5fe563e3';

COMMENT ON FUNCTION "qti"."__constant_omoipacrlm"() IS 'closed constant 684d06e5ddb3ca7c5245581fc543663e70bc3cd20f9faf22dfa3e75124eaea2c';

COMMENT ON FUNCTION "qti"."__constant_2p24sg5e4t"() IS 'closed constant 69d2e1c2b0acb80c110d5819d8f19c0fc55a17c420d13962771db89592f1b0e7';

COMMENT ON FUNCTION "qti"."__constant_exnqxdg5si"() IS 'closed constant 6a1508736cba9b7bac7250e80e6300ebb2b59ee023e2f25718e4330e627480ef';

COMMENT ON FUNCTION "qti"."__constant_wrlwssqvsp"() IS 'closed constant 6b2c8a56f7feb5f922786a144974000d08994471031047416752aa3041e67626';

COMMENT ON FUNCTION "qti"."__constant_k64cxi3yp3"() IS 'closed constant 6c005fe674a30320f6c471f0c6fb207a6438667b11fcae034084d91677a7756c';

COMMENT ON FUNCTION "qti"."__constant_b6ph5734n4"() IS 'closed constant 6dcda7912b41759ff0bae2fd281fd48793ef9fdb039aae511c634c2bc96c2326';

COMMENT ON FUNCTION "qti"."__constant_5vczbwx7y7"() IS 'closed constant 6e35937efed8032155018853dc7f5c53cb9c96828fb662c161baa64ff1e98672';

COMMENT ON FUNCTION "qti"."__constant_oz2fkzit2q"() IS 'closed constant 6f893a71042c7212a532a1037f752e6f47b7b4c44258d94900dc49f57341e22a';

COMMENT ON FUNCTION "qti"."__constant_5lt3ujp3cm"() IS 'closed constant 6f9ee8238c2d315f2beb9cf3140ca8634959093d98da42ac9d658ecac62b0165';

COMMENT ON FUNCTION "qti"."__constant_samvsv5x3m"() IS 'closed constant 7531f75fe77ef47231b91a2f322ba10c311432b4b95eda82ff07f0c58795bc14';

COMMENT ON FUNCTION "qti"."__constant_ibvgt6pxwh"() IS 'closed constant 759f9eed5e6b987b534d90c1acc04b30f479d0e50872cf9862809a74c10dbde4';

COMMENT ON FUNCTION "qti"."__constant_6pgyw625sv"() IS 'closed constant 7751c00231f1f5eb3788e0d9ed80d9a4852472ea6cc6fc4e363b38eaef1abb3a';

COMMENT ON FUNCTION "qti"."__constant_ab562yacjn"() IS 'closed constant 801897c43858d867f7a6e54e2401e12936b8e0057c9f38e9f842f9082f9dbe5f';

COMMENT ON FUNCTION "qti"."__constant_wvtqnkiky3"() IS 'closed constant 803152adc6b78f7b248c5e6df4bfd8657b6801bb74db4e80f89ad5f068c5302a';

COMMENT ON FUNCTION "qti"."__constant_26d5zth2zv"() IS 'closed constant 80cb2dffc9eb0f647e8928cd1baed2d6772ec0ec3836695439f60698c59b5b9a';

COMMENT ON FUNCTION "qti"."__constant_6ktdfd4rhr"() IS 'closed constant 8126a4733fc15841a173e27e90d562135aeeb85ce677323575f4f5e854e71aa3';

COMMENT ON FUNCTION "qti"."__constant_xem42aq3by"() IS 'closed constant 818f98ff10d2cac1a3f04f54c47fdd7654f4d0c0476840b8007cd5f96bf6e7f8';

COMMENT ON FUNCTION "qti"."__constant_5pcz6dyjzi"() IS 'closed constant 83241b7091f032559398f00f1d9cbad2ce8d7b189976c26abecb8b7c8f903340';

COMMENT ON FUNCTION "qti"."__constant_3zq77hs2za"() IS 'closed constant 835321a37af5750f1613bc5e7a9995ec1d878e95df416892586ebe05d714a4fd';

COMMENT ON FUNCTION "qti"."__constant_5w6ioztupb"() IS 'closed constant 85715b1a25e9b4994b84254c353be80f8ecc1c7571f4ed50c8693b672e54876b';

COMMENT ON FUNCTION "qti"."__constant_ka4rlh4hd6"() IS 'closed constant 8653c5c25e147f851fc87989fa837e28270069eca403a6312ef4ba0ee28b34c4';

COMMENT ON FUNCTION "qti"."__constant_be4fhhavq4"() IS 'closed constant 86bf83806b21dc33499cd8dbad17b0ff3c0e582ebd226f8c1f352695d0b6b592';

COMMENT ON FUNCTION "qti"."__constant_bmcetcvghy"() IS 'closed constant 874f68d63549e2e716851ec7dfb57e2ce0754494eadd490b51996e9e85b00872';

COMMENT ON FUNCTION "qti"."__constant_w4rn4enepj"() IS 'closed constant 87bff181e6b2c8bd1e235546c573a37924414b4029dbf64bc36c5a3885f4685f';

COMMENT ON FUNCTION "qti"."__constant_6f44bj6f5z"() IS 'closed constant 87c472feed4d3f2910daa61bef0e22a6ea3e555d61591ba19682ee6b76af293d';

COMMENT ON FUNCTION "qti"."__constant_nomzdv3mb7"() IS 'closed constant 87f927012f7b58ad6762e84501e898668ae757d234388cd8b23e9ef550cf2f44';

COMMENT ON FUNCTION "qti"."__constant_yzav37j3jv"() IS 'closed constant 8901341535144c0469df63932b8561341c3473ce3b6d9749d20278bb04f244da';

COMMENT ON FUNCTION "qti"."__constant_przq27rlwm"() IS 'closed constant 89980182a1f432e8830aa47c7990bef5f10d02a25013207b1402b80138e76909';

COMMENT ON FUNCTION "qti"."__constant_qrfq2g4hkz"() IS 'closed constant 8a588a570d63a3e967de01486e03c246e2514dbc7a8f7ed1638834943a2132b9';

COMMENT ON FUNCTION "qti"."__constant_wvf3myfrte"() IS 'closed constant 8b9dce663219deced6c95f1780dd209004efaa91f469cebdddbf74a9a08ac76c';

COMMENT ON FUNCTION "qti"."__constant_firw67ibkt"() IS 'closed constant 8ba7db0e40e2e63bd3740b236dd025c59ea3f6771cdaa26e4501e6de76ba197d';

COMMENT ON FUNCTION "qti"."__constant_rqidljwzm2"() IS 'closed constant 904fff862d67e7c3eb617491c6ab0650d543fe49dcfbe2a2a90a0138fcdda8a3';

COMMENT ON FUNCTION "qti"."__constant_5r3at22xvz"() IS 'closed constant 92e0213f62596d0230a7dcad13ad32d59fbcc187445f4c0a21d63b9fccc1e468';

COMMENT ON FUNCTION "qti"."__constant_ellk4zorxq"() IS 'closed constant 930966924fd0b3caaa5870b54f899b1d21856efd507ac2fe69f6759e3713038d';

COMMENT ON FUNCTION "qti"."__constant_aagz375mdd"() IS 'closed constant 940d9ef37d11edee8cf27d41fd542a315f72c6937d3a3dd830d35ed8a7a105e8';

COMMENT ON FUNCTION "qti"."__constant_aprps52eby"() IS 'closed constant 94aab456abe3a57e4aef1a732e5d5374f811688807ecacc259cf20d3453c85a7';

COMMENT ON FUNCTION "qti"."__constant_ahddjwrhv5"() IS 'closed constant 9512e3484e0766c142c6c91f57c0414ec8b3544dc62d0f209f214ef5bbcb331d';

COMMENT ON FUNCTION "qti"."__constant_k3fjlwxuwn"() IS 'closed constant 973a166723f127c43908bc19f4891679c706f16a5f3c0ffa4c7a3e20292cb4b5';

COMMENT ON FUNCTION "qti"."__constant_wxfnisv4kj"() IS 'closed constant 989b32decab7bf792ac5582ca47bafb5cdb36be02e5ee84014ddb7bd14ca3080';

COMMENT ON FUNCTION "qti"."__constant_zei655nkpr"() IS 'closed constant 99d8787a581edf46cb5e201d4ab7cb37d8389b7fc226abba4a9da0e750e862da';

COMMENT ON FUNCTION "qti"."__constant_xvmgsamjvy"() IS 'closed constant a049cd42355a60d467686e3154f0e02a977cd2a25ffe478ba102b3a82a4c6ba1';

COMMENT ON FUNCTION "qti"."__constant_ugrf235wgp"() IS 'closed constant a0b4bbbd57e19dd2cc92a081d548a55c31e6d6dae5df3912d7469279d953eccd';

COMMENT ON FUNCTION "qti"."__constant_lliww2nzpo"() IS 'closed constant acc6d3b7284f2ecda21cfd95c3369643a10bef86c01c267407853a03138fd919';

COMMENT ON FUNCTION "qti"."__constant_avnlqmggvi"() IS 'closed constant ad4bffd9c8d1122a5252852689921e1d6eee940e688120dfa19dc2eff75e3550';

COMMENT ON FUNCTION "qti"."__constant_g3mzemfbr3"() IS 'closed constant ad76f88c97218913e02af4871043921bac1823d4531a88018308898b96ad2c2b';

COMMENT ON FUNCTION "qti"."__constant_qhszlaty7i"() IS 'closed constant ad82a386257d501033852c09bd44b11d8066e2ccf1dde0dfb1be852316805d12';

COMMENT ON FUNCTION "qti"."__constant_dqbnkda3gg"() IS 'closed constant b00aa773fb7f2fdee47bc523ec52d4ba2427091eb0f8028990dee66487717735';

COMMENT ON FUNCTION "qti"."__constant_gf6he576t3"() IS 'closed constant b20fa519f17c454f2168c0441930dcdb9c66623abde7ce9cf9221718cb1dc385';

COMMENT ON FUNCTION "qti"."__constant_74uvt6ok2v"() IS 'closed constant b34fce01af637e50d9831de405a463ede00b21f7ed6a6600e930734a64fea112';

COMMENT ON FUNCTION "qti"."__constant_zgknnwrg6p"() IS 'closed constant b39d858a51e0b600627a98e58319ac7fc46275a0605013f7061a6b4f566d3349';

COMMENT ON FUNCTION "qti"."__constant_hl533zhknx"() IS 'closed constant b572f7dfe39bec1b14a1e2ea3d975a43ddbf26ab77c3764bd896bcd2150c7b3f';

COMMENT ON FUNCTION "qti"."__constant_fsmfviu65m"() IS 'closed constant b5b5b6faad8ebfbef434194bbc9b29f34a0eb404d1473facac182354ccbdb42f';

COMMENT ON FUNCTION "qti"."__constant_on7irbswfh"() IS 'closed constant b6458692de17b90b46b87cbd1694a96a089fdb57655a9047dbfd45545b57929f';

COMMENT ON FUNCTION "qti"."__constant_ow4c7w37ca"() IS 'closed constant b71a2845fad6eecf87038aea2b3d133cc2fb85cae4ea5db224accea62e377c01';

COMMENT ON FUNCTION "qti"."__constant_wvuca46fcu"() IS 'closed constant b86f0300664f3712679bfd0d2602747120267bc4836df717c1a5191817133400';

COMMENT ON FUNCTION "qti"."__constant_7whnbuqq7w"() IS 'closed constant bb67be0af603e3e29b7b4e4ff22995d66ff2ddb23483f618ccdbf952ffac4a35';

COMMENT ON FUNCTION "qti"."__constant_vs2arr6h6k"() IS 'closed constant bbf09dae69847295b042f2d4d75e09ba30486f8aa75f15f16287c59851752295';

COMMENT ON FUNCTION "qti"."__constant_ho6c7gpjo3"() IS 'closed constant bca9c9e027676a57d326de6e2765cd9f7ff3cc5a0f4541294159498d30bebf75';

COMMENT ON FUNCTION "qti"."__constant_ejkw66w2je"() IS 'closed constant c0425c74dfc7eff7c10920bb9b085c2f0b3353baca0710384369fe1232e405b8';

COMMENT ON FUNCTION "qti"."__constant_u77vjsa3nx"() IS 'closed constant c2784e0ffb3d443775ab23260605c8573d2e36006a1f353b5b8668c5ca029e1f';

COMMENT ON FUNCTION "qti"."__constant_sl65lnozn2"() IS 'closed constant c33576e4f029af917f1930dc84f36bee37023e9c706289b8115328027f6efe47';

COMMENT ON FUNCTION "qti"."__constant_un3x4skblz"() IS 'closed constant c342507c0886da706eece5ec5bfa1a7d3de4a7cc98d4ae478de9cdc696183bbe';

COMMENT ON FUNCTION "qti"."__constant_otpfpakmgn"() IS 'closed constant c67472010ae41a755f6f221630a80b4f9a9012b4d12ffd14ce5ed1022d39a7c5';

COMMENT ON FUNCTION "qti"."__constant_2ladvjuynk"() IS 'closed constant c828e80838fb15a0335fca2ca83e2c8ca1625dd991390a90b67cfb5586fd393c';

COMMENT ON FUNCTION "qti"."__constant_p2xwmlesaa"() IS 'closed constant c938b4d49f7ba43e3bdaf836afc988239f51adfa4bf046dceb265b3501ac689a';

COMMENT ON FUNCTION "qti"."__constant_fccrluys3c"() IS 'closed constant cd26db6e7c2fc75da959692b5e4cb13fc3165c4c8c00a6dad92bee1c78e4a328';

COMMENT ON FUNCTION "qti"."__constant_7rkjmglcw6"() IS 'closed constant cdb6d59700e647f1e9d9eb54abadce6153092423965424146b21cfecbbd8f578';

COMMENT ON FUNCTION "qti"."__constant_j6uos7o7iw"() IS 'closed constant cf0154fad9c597440c2680e01337f5d5bfdf42c17e736ccb67f162ea9ce38773';

COMMENT ON FUNCTION "qti"."__constant_24trt7i5oc"() IS 'closed constant d0ac358dccbbf426637dfc52f1e34bd9b684b0182bb54e6d8ce27c99a08b54d3';

COMMENT ON FUNCTION "qti"."__constant_7puc5uc6kh"() IS 'closed constant d3e98b5a85b35713bc8a19baa4187661712ac5db29359f3b19baf7ba38abc184';

COMMENT ON FUNCTION "qti"."__constant_wekhard5xm"() IS 'closed constant d436129584ae194a3f0c8c220b025eee37f07c64cdbd630b51682f81e3529b51';

COMMENT ON FUNCTION "qti"."__constant_ajahbtka65"() IS 'closed constant d6dafb154532c011b30172954ed386ffc4dd3be53fe7ce530ca787c13330ff22';

COMMENT ON FUNCTION "qti"."__constant_6iey4mkmde"() IS 'closed constant d6dcd255ac3de23b8d06db9c26cde0270d94edd32b64e2aa44b64ef028652601';

COMMENT ON FUNCTION "qti"."__constant_ab5qkascpx"() IS 'closed constant d7d38b7f14a5dbb035f620623eb999891a422cf00587211382d4d00050b21efb';

COMMENT ON FUNCTION "qti"."__constant_wuqtd2dywh"() IS 'closed constant db440e986908c801d2fe3ded5166a437ad23ca769cedb8dbb7d161bd6f620cf3';

COMMENT ON FUNCTION "qti"."__constant_5rhv5nncq2"() IS 'closed constant df0204dbe58ef2f78ad45c5c59532ced5751a4433c3c7b86b3593bb30c6e3b77';

COMMENT ON FUNCTION "qti"."__constant_fe4yby2lv5"() IS 'closed constant e00a82fb5cdae58fd5cfc9c3df2a42643307f3b510b90cb77e27308f6b48e1d3';

COMMENT ON FUNCTION "qti"."__constant_wozychch32"() IS 'closed constant e055ed6cd1a2bf560a3c902e616e858eecb454fbf120b235b8e6380bde3ce0ec';

COMMENT ON FUNCTION "qti"."__constant_kk3tbfzgkz"() IS 'closed constant e2b2a58ecdc4194bb9365274491665cdf519a5fc65cfbba6925d5d0af5f5feee';

COMMENT ON FUNCTION "qti"."__constant_w7hnvtob66"() IS 'closed constant e3c9410138b8f6eae8dffef5e628210f5db287932c572632a0ba66ebbcacb164';

COMMENT ON FUNCTION "qti"."__constant_ucgcmte27p"() IS 'closed constant e552dbf299968243cfaf87054383e033a3dc85c82bc1eb48a9c56347e9647ce6';

COMMENT ON FUNCTION "qti"."__constant_cmomvytsjq"() IS 'closed constant e557f308f1c898ea45fc8bc4b103cfc6144a152ce21a862a9dd9939a030455a7';

COMMENT ON FUNCTION "qti"."__constant_i7ai66pv6h"() IS 'closed constant e85967b3cef5d19555fa61f1d253182f5b5c5bcd5a07fb8660d51720c8f4fb91';

COMMENT ON FUNCTION "qti"."__constant_y75rhchi3d"() IS 'closed constant e93237d5b9a7b5313e8c651cd5e49018d609d5dd2fb2ccbbdcd20a372e3b9407';

COMMENT ON FUNCTION "qti"."__constant_uya5skuzlx"() IS 'closed constant ea0a12f3cb3e294ca36323eede2e7cb4df618f06671d1baa0308d021d560b383';

COMMENT ON FUNCTION "qti"."__constant_c2ob5ijsqf"() IS 'closed constant ece669d4bbb1c1b7a3d11b587a4f7a90ca3deda0833988f7dcb9d3df65fee7e2';

COMMENT ON FUNCTION "qti"."__constant_sn5ucr2eat"() IS 'closed constant ed54e2792d5451d5cb268f01cec4ab76e5706d6ee3a67a58d556961dbe30bc22';

COMMENT ON FUNCTION "qti"."__constant_taww2a5tgr"() IS 'closed constant eda7fc6bf95a55c320c99e5c3646c566432acc70e74fe46914c796041f789cad';

COMMENT ON FUNCTION "qti"."__constant_dtz4lgxf7y"() IS 'closed constant ee15adbf953d87dbd651944d0d42ad201930f19b64dfca3f893ff30a6bea4708';

COMMENT ON FUNCTION "qti"."__constant_sjctib2m6a"() IS 'closed constant eea46993f62c1394c899f4c4d0d285acec228f30bc9b3feae2cf92a9ef11ddb6';

COMMENT ON FUNCTION "qti"."__constant_gqyrbuxeym"() IS 'closed constant f09b43029364b98a1d1afd2d8f421aa45be43b0a6e9d6af04ce50d4f8fd72a35';

COMMENT ON FUNCTION "qti"."__constant_hygd7nfdcf"() IS 'closed constant f8bd34ab1d78f7d63582bb8b063e461be466180b42dcd81db20836ae01adf514';

COMMENT ON FUNCTION "qti"."__constant_gg2lrkl4ik"() IS 'closed constant fa33f83a30150fab197e5d3a36ab138c6d81a4aa7491bd6360190958417ab73a';

COMMENT ON FUNCTION "qti"."__constant_4hs7fzokws"() IS 'closed constant fa5b245365a863b97c490c8a627ca6282596f0232e41715f8b493938cfac5268';

COMMENT ON FUNCTION "qti"."__constant_aiwrmlshlf"() IS 'closed constant fb348a1fa4d801d5ead2f8a6c694ac6f13fb28aa0423f3564818fc596b602fc9';

COMMENT ON FUNCTION "qti"."__constant_ab3uwhdr2q"() IS 'closed constant fb61f529700ecfeb37079a1bd332a17f15dee02be4564285afb9fc8e1eb3bb6a';

COMMENT ON FUNCTION "qti"."__constant_tzvpybzw74"() IS 'closed constant fc0b09a47ade10ea4056b1709ebd3f9d756a34c24bcf70d25cbd03f7420a2171';

COMMENT ON FUNCTION "qti"."__constant_txeneneu7t"() IS 'closed constant fd39f308563b15d1512bf7341d6852527c788a0998470c143959e9cbec623fff';

COMMENT ON FUNCTION "qti"."__constant_ioawzxl5py"() IS 'closed constant fd502f010491745bf547045cb677d3652c04ac9a3fd994a524580b4b6aedc917';

COMMENT ON FUNCTION "qti"."__text_digest_2x5x4iwe4m"("pg_catalog"."text") IS 'library function textDigest (da364432aaff69eb9ff03bb55dd710826331c1394522123ddfb92b1e3d7c5ba7)';

COMMENT ON FUNCTION "qti"."__admission_map_names_lxcybsqkgt"() IS 'names of roster AdmissionMap (eb60bbe3f4ecbc6dd8ac81f438c3971fca210195ccc04416b61b03bdf3e15aa5)';

COMMENT ON FUNCTION "qti"."__align_direction_names_vluq7iazdg"() IS 'names of roster AlignDirection (f1225cd89024c5cb863ad785334474c4ffdded7dfc588c8793a81955573ff517)';

COMMENT ON FUNCTION "qti"."__align_state_names_ffk37slxn3"() IS 'names of roster AlignState (64ba2d3e322a2e0f980c4bf6ca918acdcd69033e4e532a6f7be3f63f5494ec50)';

COMMENT ON FUNCTION "qti"."__attribute_model_names_r2z5pcz25w"() IS 'names of roster AttributeModel (79813bfeb5b2b76b7b48b327bbab017713493260c93ac7bf9dab04e64dfe9511)';

COMMENT ON FUNCTION "qti"."__attribute_name_names_q6tmzcty4e"() IS 'names of roster AttributeName (6d97b94cc5fbd462aaf577f377ec37144a2543d95b1833f5c66896cf1a72459a)';

COMMENT ON FUNCTION "qti"."__attribute_slot_names_4r5l4mp24z"() IS 'names of roster AttributeSlot (e1895f58fbf516fc3363a2e54598c9dc5fbe7dc39740c5a8a99dd2cc3a8b140c)';

COMMENT ON FUNCTION "qti"."__base_type_names_ok3nu5nck4"() IS 'names of roster BaseType (457df6cdda1176578a2334d3d55d5fa83ba311b38213e6ccbfdc825bf848f5f6)';

COMMENT ON FUNCTION "qti"."__bound_facet_names_b7dbsbn4iu"() IS 'names of roster BoundFacet (93aaab66f7ae5ada7f45ee043c8f6717ab2b3d8558d72e5cd8c1c6702fe1c6c2)';

COMMENT ON FUNCTION "qti"."__bound_zero_names_2iyjgurtgw"() IS 'names of roster BoundZero (811abd8ef83185e8ec30af57171e8d1b02c8990364b81637697e6993685c7949)';

COMMENT ON FUNCTION "qti"."__built_in_names_qkzs4cgupe"() IS 'names of roster BuiltIn (c8f43f133cee761fa47db1c117c7974dc88dc6b663cfd2691bca8b78821c7694)';

COMMENT ON FUNCTION "qti"."__cardinality_names_kqiairsoqa"() IS 'names of roster Cardinality (8272fabe55ffa1673abf31d53be7d3238ae1bb7ab0504a922db5252364aa1f8c)';

COMMENT ON FUNCTION "qti"."__cn_base_names_2wtzhyubck"() IS 'names of roster CnBase (a81912f62610358c82215ad222eba411a4324ca88cc4912ddcc2a89721228005)';

COMMENT ON FUNCTION "qti"."__cn_part_names_6db2fcgfhy"() IS 'names of roster CnPart (1147da0120ff722c37c16d517e029fd86049e095a53b00565425beb5c39f8c24)';

COMMENT ON FUNCTION "qti"."__cn_part_form_names_te7u7jycdu"() IS 'names of roster CnPartForm (909cc3d253201ff25886c704075d3cf11cc36c43493ccf592ac4e067a93f2d98)';

COMMENT ON FUNCTION "qti"."__cn_type_names_wmjelllvhg"() IS 'names of roster CnType (38d189d4b09434b6b92b62f1ac697d738a44bbdc421a4896df034c9820eaabfa)';

COMMENT ON FUNCTION "qti"."__content_model_names_ren5hwffjp"() IS 'names of roster ContentModel (8674ae7a12f2b33ca5ae496164da9e15fa82249caa0b78c826d10e9e15dd5d54)';

COMMENT ON FUNCTION "qti"."__declaration_kind_names_o62wpad2p7"() IS 'names of roster DeclarationKind (f929ea27169f97965ef6789c1d118fd50cda767ad355fb2da95e80951d8c2865)';

COMMENT ON FUNCTION "qti"."__document_type_names_ot37qp5org"() IS 'names of roster DocumentType (0759baf5c4df3e64f4c32cfe0076fd6fe77ec2ee108ec1774f9670c447a3c72a)';

COMMENT ON FUNCTION "qti"."__domain_primitive_names_2yihitx2to"() IS 'names of roster DomainPrimitive (6a30240cd8618993afd4ad72d77439e536b17e5bc9698ff89d73edee68c0a302)';

COMMENT ON FUNCTION "qti"."__entry_kind_names_km5xejbmwu"() IS 'names of roster EntryKind (edea7c56ad47b9d85d11072b09e29bd089dc1499cf0cb174db982b0ad91368f3)';

COMMENT ON FUNCTION "qti"."__flag_names_dttyznb5cw"() IS 'names of roster Flag (642b18e62ef36c85b441c2ec7ac2f1abd6a28e42d028e6f90c2427c7f89161ee)';

COMMENT ON FUNCTION "qti"."__follow_set_names_wpsp2qrfoh"() IS 'names of roster FollowSet (894ba9047e5e769077adfa4a092cc4609ab82efdfe69be5542172570fde6c3b9)';

COMMENT ON FUNCTION "qti"."__governor_names_d7jfyla3na"() IS 'names of roster Governor (f94d303f041033c8665db8889553bf52e87e222c4def1fd92b8062d9e6cbc656)';

COMMENT ON FUNCTION "qti"."__href_scope_names_y4pbuo4f5q"() IS 'names of roster HrefScope (fca41fa7d09154be86e6ea2471b797ff7e489f150c629c7cbf6380d7e8e234b6)';

COMMENT ON FUNCTION "qti"."__identity_names_rrxxe77wjj"() IS 'names of roster Identity (234dc7da7f1028cda930da376acd703669b3326f65e2ae0b5b1e51cdf14461c5)';

COMMENT ON FUNCTION "qti"."__include_set_names_6bs2sxuszz"() IS 'names of roster IncludeSet (bf7798edeed974dcfaff34443999ba19f7301398b34b8593ade4eafbb200ba58)';

COMMENT ON FUNCTION "qti"."__language_names_pvmtywwssv"() IS 'names of roster Language (8c91f2fc8bd307f1c16860106b4de444de8312c08451a9aea8f1088e95f09f3d)';

COMMENT ON FUNCTION "qti"."__node_kind_names_ulbko553n7"() IS 'names of roster NodeKind (6dea561781fc88707c0fa5169d6a20a2548594915bf7dfa0256ac50e05715acb)';

COMMENT ON FUNCTION "qti"."__position_names_sglcn7ygpg"() IS 'names of roster Position (a1a60d4aa06104360f551f05cca99ac7fe578fbc3fa7fd74a1e0fec72f2677db)';

COMMENT ON FUNCTION "qti"."__reference_form_names_gm6ro5a5jp"() IS 'names of roster ReferenceForm (d6c6a50de9096ecbc3c3119f09c6838c0b5607cb8ffe43badb4a76e0dc821f67)';

COMMENT ON FUNCTION "qti"."__reference_resolution_names_e7fbwruvm2"() IS 'names of roster ReferenceResolution (dbdb1f683d8885f134f1f3bf5db2bd70d134a5c018a7bf8a0c79cc93ef2669c0)';

COMMENT ON FUNCTION "qti"."__reference_spelling_names_gocqpuf7tl"() IS 'names of roster ReferenceSpelling (d17fe4490649b642da71426e1581a670779f42a7b20ee7c9ef28b6a9628aa0dd)';

COMMENT ON FUNCTION "qti"."__referenced_table_names_qrpsijquzz"() IS 'names of roster ReferencedTable (6e125e9a54fae2a6fa01dd9cb4e3839d8ff3aac21afe227dabf8869ea2544349)';

COMMENT ON FUNCTION "qti"."__resource_type_names_2tbbvn3ion"() IS 'names of roster ResourceType (ced5fe1564e0a8e81e6ed722e012aba7f520e83798020b38dcb9f954ec7f0282)';

COMMENT ON FUNCTION "qti"."__rounding_holds_names_6j2zaayymp"() IS 'names of roster RoundingHolds (ff0bebd47f8d5bbbf8db83174e53cbb07cf295b99d674a77d80050bb48bb1b1c)';

COMMENT ON FUNCTION "qti"."__shared_model_names_5s5lwnfjh3"() IS 'names of roster SharedModel (2bb22812fae0ee7cd348c54155c525015f6d12afe5856c6b30af95ddd60f143e)';

COMMENT ON FUNCTION "qti"."__symbol_set_names_7wklvi4qhu"() IS 'names of roster SymbolSet (5f3c364538a7246c98ef8a549dd6452a21b767f5164eb24017b420a40ef01cee)';

COMMENT ON FUNCTION "qti"."__type_name_names_ksmacbo3df"() IS 'names of roster TypeName (86a2ec787f3d5c26228c9e866eccbc74af5c465863d21e3f2dd1d0149e191ab3)';

COMMENT ON FUNCTION "qti"."__use_names_vmbq6fav2t"() IS 'names of roster Use (9a115d57aadecda9d7a7b7cc81df91be5fef70b5cafa5ec4401206fbed113e3b)';

COMMENT ON FUNCTION "qti"."__value_base_names_pjzlcpdwvv"() IS 'names of roster ValueBase (5d761cedc66f7cf75deb2567ff85de0930d527d600883d914f6486ab0734a395)';

COMMENT ON FUNCTION "qti"."__value_cardinality_names_wzwznoycgf"() IS 'names of roster ValueCardinality (ce98dc14ae9c0fe80302c657e1ae084670c344bef60bd8949b01932c73dfc180)';

COMMENT ON FUNCTION "qti"."__value_domain_names_myda2sxpvz"() IS 'names of roster ValueDomain (f193a3f8e50cb473bb721905900ab312d8544360ed383f3736279b731d50ad47)';

COMMENT ON FUNCTION "qti"."__white_space_names_i54twzbo55"() IS 'names of roster WhiteSpace (be4a5082396853ed0ad2a833bfe105ada3da43a52a2a2f804b2ee15f41fd6ae3)';

COMMENT ON FUNCTION "qti"."__xml_standalone_names_psf7bszcug"() IS 'names of roster XmlStandalone (b02a7669e6d8b37bbd7d50a593eeee33d1a7540248959baacd9c1c76e41c9bc4)';

COMMENT ON FUNCTION "qti"."__attribute_name_live_7ot3c4gfh5"() IS 'live codes of roster AttributeName (6d97b94cc5fbd462aaf577f377ec37144a2543d95b1833f5c66896cf1a72459a)';

COMMENT ON FUNCTION "qti"."__attribute_slot_live_g5haf24jp3"() IS 'live codes of roster AttributeSlot (e1895f58fbf516fc3363a2e54598c9dc5fbe7dc39740c5a8a99dd2cc3a8b140c)';

COMMENT ON FUNCTION "qti"."__flag_live_egdpt3c4t6"() IS 'live codes of roster Flag (642b18e62ef36c85b441c2ec7ac2f1abd6a28e42d028e6f90c2427c7f89161ee)';

COMMENT ON FUNCTION "qti"."__node_kind_live_rds6vphboo"() IS 'live codes of roster NodeKind (6dea561781fc88707c0fa5169d6a20a2548594915bf7dfa0256ac50e05715acb)';

COMMENT ON FUNCTION "qti"."__position_live_uvhnssun3f"() IS 'live codes of roster Position (a1a60d4aa06104360f551f05cca99ac7fe578fbc3fa7fd74a1e0fec72f2677db)';

COMMENT ON FUNCTION "qti"."__value_base_live_trk5bm7ra5"() IS 'live codes of roster ValueBase (5d761cedc66f7cf75deb2567ff85de0930d527d600883d914f6486ab0734a395)';

COMMENT ON FUNCTION "qti"."__value_cardinality_live_qbccqbzssx"() IS 'live codes of roster ValueCardinality (ce98dc14ae9c0fe80302c657e1ae084670c344bef60bd8949b01932c73dfc180)';

COMMENT ON FUNCTION "qti"."__row_kbbc56kuh5"("pg_catalog"."text") IS 'row function 0d818b512e4f584d416c2c2bf2f3a50e5690629a79020c519fd5b7551d55c968';

COMMENT ON FUNCTION "qti"."__row_fdmkwfomtb"("pg_catalog"."text", bigint) IS 'row function 2212e36a4c91188ed3e87d81d11157f2faeca119f22635a60a9ceed975d470f9';

COMMENT ON FUNCTION "qti"."__row_unvebr7ujb"("pg_catalog"."text", "pg_catalog"."text", "pg_catalog"."text") IS 'row function 36cefa6a4ea27c4436e8850045ab3e8b7a0a5cde766694f2c708b41820dee3e5';

COMMENT ON FUNCTION "qti"."__row_s52thndv2z"("pg_catalog"."text") IS 'row function 44d02f81f51cee90ca7a2cb38a16be1d128101516219bee5a019f781e404bc4a';

COMMENT ON FUNCTION "qti"."__row_7j4cj3ujio"("pg_catalog"."text", "pg_catalog"."text") IS 'row function 5153831ff1cbd23ec70c8d00c786651967dc8447b63382bc92dd4c26ecc70ae9';

COMMENT ON FUNCTION "qti"."__row_fqcrog6dfl"("pg_catalog"."text") IS 'row function b78bd1ecb3890c2ccb78476447f20a618813b687727facbb83d0513d2877696a';

COMMENT ON FUNCTION "qti"."__row_to7qnnmz2p"("pg_catalog"."text") IS 'row function d3557b9a4db2798ba48affc1f577879edc69830f1fc9dae3fca2aef0c036957f';

COMMENT ON FUNCTION "qti"."__row_7ebkly7ayy"("pg_catalog"."text", bigint) IS 'row function dee821144a8b9418e5123596a16c13ab30180ac993d589a13d5171453ab6ce0a';

COMMENT ON FUNCTION "qti"."__row_qhnrzprhff"("qti"."base_type", "pg_catalog"."text") IS 'row function 69ffc79b8a5950982cb008c87c99eaf9098a15e8085c6f72dc64dd950778b01c';

COMMENT ON FUNCTION "qti"."__row_47rwmcck7h"("pg_catalog"."text", "qti"."base_type") IS 'row function cd644123b75c40168ef5396b8018e87e060a4587945c47da9ca1a2c268b9119b';

COMMENT ON FUNCTION "qti"."__row_odiicdknst"("pg_catalog"."text", "qti"."base_type") IS 'row function f0ae95dc8eb3c4732503f6fc9b1b1265739b5da666f74f5f81f16e253cdb933c';

COMMENT ON FUNCTION "qti"."__row_et5rveakei"("pg_catalog"."text", "qti"."cn_part_form", "qti"."cn_base") IS 'row function e9c2a848f830f3cdfc42224ea403f7dcdecf715d76fec31134ab1db47c739cc9';

COMMENT ON FUNCTION "qti"."__row_6j7cairl4a"("qti"."cn_part", "qti"."cn_type", "qti"."cn_part_form") IS 'row function 3412423e296b9e3a8fe92b4585d954e5b170f56698e390c3d90feb00c002bf11';

COMMENT ON FUNCTION "qti"."__row_fieb2dvdh7"("pg_catalog"."text", "qti"."cn_type") IS 'row function 69ec74f46db396e19c85a9bba9bf6beac747b0c1365d25e27e66f13924df0c16';

COMMENT ON FUNCTION "qti"."__row_qws4baa74i"("pg_catalog"."text", "qti"."cn_base", "pg_catalog"."text", "qti"."cn_type") IS 'row function cc2ac4e1034e6d4161397ec9eda99571393472a59ce9b34b184b9b1a457b09c5';

COMMENT ON FUNCTION "qti"."__row_kv5rkzmio2"("qti"."governor", "qti"."attribute_name") IS 'row function 2406918f1ec61da82ec0681662d5fa5f154ba570e0beafa41820fae7865fbdd9';

COMMENT ON FUNCTION "qti"."__row_otq4lb4uzs"("qti"."governor", "qti"."attribute_name") IS 'row function 94336ab562daee0d49fd87a66b86ec2692d9f2a3fe9252c82c4e735bc0dce56b';

COMMENT ON FUNCTION "qti"."__row_o6s6wr4ho7"("qti"."governor", "qti"."attribute_name") IS 'row function b0b4bdf677d6a538e01f2829e8940dbd96da6bbc19028b7a3e53e7d9e2203097';

COMMENT ON FUNCTION "qti"."__row_yhjz272c7n"("pg_catalog"."text", "qti"."href_scope") IS 'row function 33ab4df6db1cdf1aceb48f62fd645141b2d2ab72aefde9584a031d6c491e75c1';

COMMENT ON FUNCTION "qti"."__row_zzy4tf2m2u"("qti"."node_kind", "qti"."node_kind", "qti"."attribute_name", "pg_catalog"."text") IS 'row function 09298b9ae358687f2366959795780950ea3e108db39fe9014c61ab4bacd62d20';

COMMENT ON FUNCTION "qti"."__row_56t7mprg5a"("qti"."node_kind", "qti"."node_kind", boolean, boolean) IS 'row function e1595e95f5cb8554d4fdeb1d5edf877329152b6d80267340d95930fc3dbcd063';

COMMENT ON FUNCTION "qti"."__row_4lefqkcprs"("qti"."node_kind", "qti"."node_kind") IS 'row function e9c38b31e303803e0897f305e3f581bd57655e4fc9f893ce5cbda5ac7d1198ca';

COMMENT ON FUNCTION "qti"."__row_i5hqpho2vw"("qti"."node_kind", "qti"."node_kind", "qti"."position", "qti"."position") IS 'row function 7640708d45e23fea9d566b49ae5d9974ef94d3341e7af5815dfbd378d770e07b';

COMMENT ON FUNCTION "qti"."__row_h55qs3ddi4"("qti"."position", "qti"."node_kind") IS 'row function 7d27126d192f284f4f74c0ad749190c0e2eb8a6024f2c280884aaf5de0a2e4c2';

COMMENT ON FUNCTION "qti"."__row_vafhk47l2f"("qti"."node_kind", "qti"."position") IS 'row function 9003fa16498cb3bb5edab32c88910f04e4988761f69a88de57fdff562fa09367';

COMMENT ON FUNCTION "qti"."__row_cagame6b6t"("qti"."node_kind", "qti"."node_kind", "qti"."position", "qti"."position") IS 'row function bcae2e8f81324868447d8feb130bb8148a3ba0233ee03b6fd5d916ea2d7fca50';

COMMENT ON FUNCTION "qti"."__row_eqcec5telp"("pg_catalog"."text", "qti"."node_kind", "qti"."reference_resolution") IS 'row function 48d6be514c27a61c2ef4f9c11a9a35cae10e54f4a08009a0973596d8eedc48b4';

COMMENT ON FUNCTION "qti"."__row_e7h7hkejv4"("qti"."resource_type") IS 'row function b2b9ef3b5551054a5b693d9d441144462ad573eecdd34c5c8d020d6f28a4fa50';

COMMENT ON FUNCTION "qti"."__row_awivwlafyr"("qti"."resource_type", "qti"."node_kind") IS 'row function fd55f7edf1fdff9f89768bb7126b2b87954172bcbf1a7ba82208cea9bb8b58f0';

COMMENT ON FUNCTION "qti"."__row_rqvhy674p4"("qti"."node_kind", "qti"."type_name") IS 'row function 4627c5739c3bf927fd8e758e074d5d3f015eb0dcfd52f2c138486d37a8abdb32';

COMMENT ON FUNCTION "qti"."__row_vua74sfnuq"("qti"."governor", "qti"."node_kind", "qti"."type_name") IS 'row function c5f963bf9e1e4e76f871c006e9edec4e3d80debe21a8baf7378b6b567996eb94';

COMMENT ON FUNCTION "qti"."__row_sjn7ztb5fk"("qti"."base_type") IS 'row function d49423c7d768d24b7f5be11ceb05db6afd904a60bef7b7a2cd05f6df2c3f7555';

COMMENT ON DOMAIN "qti"."__attribute_name_bits_416_thr6i6sipt" IS 'sets over roster AttributeName of 416 bits';

COMMENT ON DOMAIN "qti"."__attribute_slot_bits_112_aecznthxg5" IS 'sets over roster AttributeSlot of 112 bits';

COMMENT ON FUNCTION "qti"."__row_dpnoe4rv6h"("qti"."governor", "qti"."__attribute_slot_bits_112_aecznthxg5") IS 'row function 0956e99bd8041d02f5997e313713db41e2f9d61226e987556a763fdc14abf6fa';

COMMENT ON FUNCTION "qti"."__row_cdpcrvbl2a"("qti"."__attribute_slot_bits_112_aecznthxg5", "qti"."governor") IS 'row function 13d0c266fa9409c8f455ac4706407206780955694d775c2867c2c2283a012884';

COMMENT ON FUNCTION "qti"."__row_mvlazibe6j"("qti"."node_kind", "qti"."__attribute_slot_bits_112_aecznthxg5") IS 'row function 6d17786a2f5f6f72b375770d285ef6531cb880c30f43464184320788652d2817';

COMMENT ON FUNCTION "qti"."__row_oypzlmjlum"("qti"."__attribute_slot_bits_112_aecznthxg5", "qti"."governor") IS 'row function 89ba80a897df61d0f9c9e41f3a11260e409e637fad5e5f8b6a9dbb90f28cfe4e';

COMMENT ON FUNCTION "qti"."__row_b5mgylvrip"("qti"."__attribute_slot_bits_112_aecznthxg5", "qti"."governor") IS 'row function b023bdfd6a5db40c895c93af38e8d98d6db29e0f6f69121f85e6c6299a4aaed9';

COMMENT ON FUNCTION "qti"."__row_4g6tduxftl"("qti"."governor", "qti"."attribute_name", "qti"."__attribute_slot_bits_112_aecznthxg5") IS 'row function d0a93ff595460da1a002d76cdc918edbdbe8bfcedd49668da19cb54c4548fee9';

COMMENT ON FUNCTION "qti"."__row_tj75r6ek3n"("qti"."__attribute_slot_bits_112_aecznthxg5", "qti"."governor") IS 'row function d51443d259a66278225541beed1740e11653e3041fa68595c9074380b622261e';

COMMENT ON FUNCTION "qti"."__row_kaddqdvwod"("qti"."governor", "qti"."__attribute_slot_bits_112_aecznthxg5") IS 'row function e7c946c6561a6de6df8e7e28dfb71c9039f29bfa128d45462cbc6db21b395085';

COMMENT ON DOMAIN "qti"."__flag_bits_16_llpdtzgaon" IS 'sets over roster Flag of 16 bits';

COMMENT ON FUNCTION "qti"."__row_3vyqydin2g"("qti"."node_kind", "qti"."__flag_bits_16_llpdtzgaon") IS 'row function c086e7379038b06c3e695022ce1666109ae2f9fa337e7bc02b3986626a5800c7';

COMMENT ON DOMAIN "qti"."__node_kind_bits_648_lh43fw4nuo" IS 'sets over roster NodeKind of 648 bits';

COMMENT ON DOMAIN "qti"."__position_bits_312_cnr3fptmz4" IS 'sets over roster Position of 312 bits';

COMMENT ON DOMAIN "qti"."__value_base_bits_16_7t6pwwxbsh" IS 'sets over roster ValueBase of 16 bits';

COMMENT ON FUNCTION "qti"."__row_vv7aysnmh3"("qti"."value_base") IS 'row function e8f9f1cc161f8c9432e4e0ce9e08e10118cfc3e7013769afe92dd720e6822409';

COMMENT ON DOMAIN "qti"."__value_cardinality_bits_8_mma4mwhphy" IS 'sets over roster ValueCardinality of 8 bits';

COMMENT ON FUNCTION "qti"."__row_dai7p7nf6j"("qti"."value_cardinality") IS 'row function 3c007a761fe1dc0d4296a46ec080909caa5a95a36fb71ea4a17072de2fd63c0d';

COMMENT ON DOMAIN "qti"."__domain_gfw43vigph" IS 'domain of definition 39922592cedecf769d6df372d6df99e0b82206b0bf6dacd9722d0490f83cc782';

COMMENT ON FUNCTION "qti"."__row_xpekqjl2mx"("qti"."cn_type", "qti"."__domain_gfw43vigph") IS 'row function 061cd30d1f4964650e7365fc8fcd48c8288b2d6b1ed582c94fc65eeae13f52d1';

COMMENT ON FUNCTION "qti"."__row_dds762ix6o"("qti"."node_kind", "qti"."__domain_gfw43vigph") IS 'row function 1611c9f7255a8e3ac2aaf04703283a2652a771e75f11a4fe767fc03bebbecced';

COMMENT ON FUNCTION "qti"."__row_zfbcuk4gtg"("qti"."node_kind", "qti"."node_kind", "qti"."position", "qti"."__domain_gfw43vigph", bigint, bigint) IS 'row function 1ab561d017c8df736d73070f3a89cb118e636155a325e6cc82cfdf1ad954548a';

COMMENT ON FUNCTION "qti"."__row_6rhtzxaia4"(boolean, "pg_catalog"."text") IS 'row function 3b75a0f763966c900325752edc9f5023fec3ffa42b8484dda164d434dd961126';

COMMENT ON FUNCTION "qti"."__row_o63nenvexz"("qti"."node_kind", "qti"."node_kind", "qti"."position", "qti"."__domain_gfw43vigph", bigint, bigint) IS 'row function 8c448d7be432b33576e5ec931512aa5dac54dbe82394a484fd0be1ca8747b2f9';

COMMENT ON DOMAIN "qti"."__text_xj3zno7u3h" IS 'text domain of definition 07d1b4656d57d0bc0562fcffad24ee1556a8abcce1c308fdbd7953cf9ff4063b';

COMMENT ON DOMAIN "qti"."__text_4snhn63tn4" IS 'text domain of definition 0a095a541993ac1fc6fae7d586f145fea9ee7260aca3c1c9341351e8b7d0bdb5';

COMMENT ON FUNCTION "qti"."__row_scighrsurf"("qti"."__text_4snhn63tn4") IS 'row function 1b72233c2d689c7d485994afcf9bd50c3b1be3418a1d288690110badad2059a7';

COMMENT ON DOMAIN "qti"."__text_netnsfkgs7" IS 'text domain of definition 0aba2a82fe9fefde9a011f33fa307521ac470023393100289f8e2a1a6c7eef29';

COMMENT ON DOMAIN "qti"."__text_c6iptmtj2x" IS 'text domain of definition 1a67836d3b307da80f2e0d484100e3204d5ef072db811f6176933746e66c4089';

COMMENT ON FUNCTION "qti"."__row_fwroytfsuc"("qti"."governor", "qti"."attribute_name", "qti"."__text_c6iptmtj2x") IS 'row function 0c0c884bcedfaefa3673167e1234f7040a0c764880b209062b397f332f7198cb';

COMMENT ON FUNCTION "qti"."__row_2jqjgtinlf"("qti"."__text_c6iptmtj2x") IS 'row function 3e15ebea27255c8f0eb5756358ddc9f48345e3b12525545f173c5fcca28c283a';

COMMENT ON FUNCTION "qti"."__row_vsugw3arbl"("qti"."governor", "qti"."attribute_name", "qti"."__text_c6iptmtj2x") IS 'row function 4bea174279c48422501dde545d318eac9e074efb765e9e021a80252637ce1f9d';

COMMENT ON FUNCTION "qti"."__row_2ra54peno7"("qti"."__text_c6iptmtj2x", "qti"."node_kind", "qti"."attribute_name") IS 'row function 77e2044efeb86dcc5c2e06a3c835b13665e0b952cb95afd356dd6e4c505127b8';

COMMENT ON FUNCTION "qti"."__row_il5jbfjsr7"("qti"."governor", "qti"."attribute_name", "qti"."__domain_gfw43vigph", "pg_catalog"."text", "qti"."__text_c6iptmtj2x", "qti"."__attribute_slot_bits_112_aecznthxg5") IS 'row function bdecea6dcc5e82f228bdc480e6c256c759ed32c0902278d9a4deb8cff1c91f80';

COMMENT ON FUNCTION "qti"."__row_rcj6itvj2w"("qti"."__text_c6iptmtj2x") IS 'row function d6cef6ec671513b739a3e2f87ce53b93ba24e6323008a994ac648285f17390b0';

COMMENT ON FUNCTION "qti"."__row_onczbmwqpm"("qti"."governor", "qti"."attribute_name", "qti"."__text_c6iptmtj2x") IS 'row function daaf4cdae765b10334902868ddd8f4f8a6cc14c8546bd547e0f9d5ed2e9f07b8';

COMMENT ON FUNCTION "qti"."__row_44g6vpyjsw"("qti"."governor", "qti"."attribute_name", "qti"."__text_c6iptmtj2x") IS 'row function dc8e1c8863842049b43713e63708c1b511b0ecf53e79e9defabfc91db45a0f65';

COMMENT ON FUNCTION "qti"."__row_3qgkwnovoe"("qti"."__text_c6iptmtj2x") IS 'row function eba30e473ed4d8494bd88b086cc140c3cc2e70dacc73c4df31691e626662b412';

COMMENT ON FUNCTION "qti"."__row_2ya6cjdips"("qti"."governor", "qti"."attribute_name", "qti"."__text_c6iptmtj2x") IS 'row function f7e82348884da04d36d9bf95c01e7f8d143d817cc6a714e0d4563c24a3435502';

COMMENT ON DOMAIN "qti"."__text_wchibbb5qm" IS 'text domain of definition 1c92f247531095457f6aa4b11852c91c17dac7380dc0917aca5c239ca28fea00';

COMMENT ON DOMAIN "qti"."__text_4s4od7s5or" IS 'text domain of definition 25f993867c17f0de2b8d40bfc84d831eb31ae3f956a21b332d68c3cfea60ac42';

COMMENT ON DOMAIN "qti"."__text_qswrkft5qs" IS 'text domain of definition 2850c32b04e2fce641656261ed5326b4b1f1a5ec4ccfb2ca892493d3f694d2fd';

COMMENT ON FUNCTION "qti"."__row_jepjc2ekks"("qti"."governor", "qti"."__text_qswrkft5qs") IS 'row function d322a2d263e00b01f3df200f9ad3e6caac85b1c5c1c970c4184ace235f21247b';

COMMENT ON FUNCTION "qti"."__row_3t2pmfpjno"("qti"."node_kind", "qti"."__text_qswrkft5qs", "qti"."attribute_name") IS 'row function da128860db46da9b0b998f36b3d56001fe205b08d06ba402929ea29a14af5bf0';

COMMENT ON DOMAIN "qti"."__text_76pfa5avf4" IS 'text domain of definition 351b9f599fc7c6633766ab6827a3bf0dd4e259ab5891d790a1ed1ec504fc0de4';

COMMENT ON DOMAIN "qti"."__text_gke7uypkov" IS 'text domain of definition 35ca7214ecd6bc746f35ddfa585739f2eb3a3bc1cf0102776362d72f261b5d2c';

COMMENT ON FUNCTION "qti"."__row_topiedmeph"("qti"."node_kind", "qti"."governor", "qti"."__text_c6iptmtj2x", "qti"."__text_gke7uypkov", "qti"."__text_gke7uypkov", "qti"."__flag_bits_16_llpdtzgaon", "qti"."__flag_bits_16_llpdtzgaon") IS 'row function 5b0ba2aa0c0b26f1ab97fd9dbafda8ad35609e5c16558b871cc2527adc887eff';

COMMENT ON DOMAIN "qti"."__text_l7nqeazg5h" IS 'text domain of definition 3cdc918e94d35cb73d7847576b3f189044bdbbe2b32433d7e12c4aad29d1b20f';

COMMENT ON DOMAIN "qti"."__text_k5kwygzatl" IS 'text domain of definition 40d6364b587949b03c7cf6d4a4fa90f6a7824a5e81ea482245b5165ecf1a386b';

COMMENT ON FUNCTION "qti"."__row_kd7mqptoiv"("qti"."__text_k5kwygzatl") IS 'row function 9ed8c615a1c945d398ecaab8e0c3698342661b8a20deaea45757bb2990058592';

COMMENT ON DOMAIN "qti"."__text_7dfilirtp3" IS 'text domain of definition 429c2bb9ddd9c3b22c5a08acc42b1af5e4d920542a5f749183412995aecbc995';

COMMENT ON DOMAIN "qti"."__text_7j6kgluyjp" IS 'text domain of definition 44e887568cc7f9e998199d3ead04a4a7e9dc01d1b379c2777ba394ad881c4d33';

COMMENT ON DOMAIN "qti"."__text_xey6ryorh5" IS 'text domain of definition 470402304d5a2e6d5b1be3a2daeaac2900ee7e45e1edf9e56c42abea179471ed';

COMMENT ON DOMAIN "qti"."__text_oq3spimary" IS 'text domain of definition 4bedf154c7ec420e14361267e240aff7e7662e87abeb0e0e202bfb3570bda883';

COMMENT ON FUNCTION "qti"."__row_bx7m6665wc"("qti"."governor", "qti"."__text_oq3spimary") IS 'row function 86928df19d1d5cfa40cd6c0e0f9b0fbcc6c0a4f94b210eefea9b4908e63f0710';

COMMENT ON FUNCTION "qti"."__row_5skakdnhjl"("qti"."governor", "qti"."__text_oq3spimary") IS 'row function a08c58a5570bddff98b58732c0a9d29e1be92ed30e26a5efc5a8a4da686ec229';

COMMENT ON FUNCTION "qti"."__row_bdiry5fm57"("qti"."__text_oq3spimary") IS 'row function e65d234ba5bda5efbddd0adbf9738ed9c7f303a902f8b8ab65b97a9a34c6374e';

COMMENT ON FUNCTION "qti"."__row_l3skqw25vw"("qti"."node_kind", "qti"."node_kind", "qti"."governor", "qti"."__domain_gfw43vigph", "qti"."__text_oq3spimary", "qti"."__text_oq3spimary", "qti"."__text_c6iptmtj2x") IS 'row function ebc39793c816123e47817bd27af8a08639b74693d61810a870d8b11b989e3cd8';

COMMENT ON DOMAIN "qti"."__text_w7a4l3clst" IS 'text domain of definition 70715e47963bc2100f5206e239687a6b7b46c9c6ad4f842105f611022cb0170d';

COMMENT ON FUNCTION "qti"."__row_4lllbffefr"("qti"."__text_w7a4l3clst") IS 'row function bddbe76bd26a91850a6308606806f1b80408735f10fcb3e712b5b9331b0d540b';

COMMENT ON DOMAIN "qti"."__text_23rzixl3a2" IS 'text domain of definition 95eb6c1246a45f38747eda0606a0a691162091d31ec690fa874e11c549549bf6';

COMMENT ON DOMAIN "qti"."__text_6zspo66rxv" IS 'text domain of definition 9d5e8f0d5f85b882ec74649e4fddc5843b26debd0af69ef9dc7694bc42a7c1f6';

COMMENT ON FUNCTION "qti"."__row_i4fvlc2bb6"("qti"."__text_6zspo66rxv") IS 'row function 717bc749faa0aff8a753f0f96220f831900d1c1d5810b1f5a913a06ef25130c2';

COMMENT ON FUNCTION "qti"."__row_cqo2oblkvo"("qti"."document_type", "qti"."__text_6zspo66rxv") IS 'row function cc3507483b89a62b8bc73d803f580495daccad711fe1bcaa68a8af3441226566';

COMMENT ON DOMAIN "qti"."__param_path_wphbbw3r67" IS 'pattern domain of parameter path of definition cc3d20abc6519acded99a7c27021578cbd9bc2d293a3f4abc42a81f4352ba8d8';

COMMENT ON DOMAIN "qti"."__text_vrcyezm7ka" IS 'text domain of definition 9ee012fb79fcb52e1281f9b222071737e340dc146c2082aa3a4646fcd0f11d41';

COMMENT ON DOMAIN "qti"."__text_7cbjao7rjc" IS 'text domain of definition b21ad1788887ba6ded3698e2f2a542a237891cecb9696eb33b31ef9a45cc0d41';

COMMENT ON DOMAIN "qti"."__text_zij47sgley" IS 'text domain of definition be762dbadbcbdadb1b1e213742dad3ff6da1f56202cbfb8c219acc59e34371bd';

COMMENT ON DOMAIN "qti"."__text_b6ykamoeho" IS 'text domain of definition d625befb178ad492b0db0947dca6e2a06fe9265b86c9d308ff18efbca3340ffb';

COMMENT ON FUNCTION "qti"."__row_j4wlgwmk7l"("qti"."__text_netnsfkgs7", "qti"."href_scope", "qti"."__text_b6ykamoeho", "qti"."__domain_gfw43vigph") IS 'row function c64f9b238699af7770b7976eea64025734c2a9c3ab9122378ac29bb8c80c8604';

COMMENT ON DOMAIN "qti"."__text_xv5q2k3cum" IS 'text domain of definition de54cd3a4955ae805910bee805dfaeccf8237807570c18c29fd49aed3bcec49d';

COMMENT ON DOMAIN "qti"."__param_name_tch4oix6gh" IS 'pattern domain of parameter name of definition 89ef4d5d074b3ed8d33ffb6e9829dfbe4c0d9ce2c021592b703966d989f69545';

COMMENT ON DOMAIN "qti"."__param_package_ulo5hrttvh" IS 'pattern domain of parameter package of definition 89ef4d5d074b3ed8d33ffb6e9829dfbe4c0d9ce2c021592b703966d989f69545';

COMMENT ON DOMAIN "qti"."__text_sac6h6c6eh" IS 'text domain of definition e0ec65e8be57c642de548bd5d2a176e56bda67cb965b0b4efc5389004d491694';

COMMENT ON DOMAIN "qti"."__text_3dlgl63rv6" IS 'text domain of definition e39caf120392f42815c264add6a09c2febb10de3ccbae4e068ac6f976267d42b';

COMMENT ON FUNCTION "qti"."__row_fbzio7ptsd"("pg_catalog"."text", "qti"."node_kind", "qti"."value_base", "qti"."value_cardinality", "qti"."reference_resolution", "qti"."__text_3dlgl63rv6", "qti"."__text_3dlgl63rv6") IS 'row function 8c0401d849a3b3d1e5d63131d9234717297501dc9d2a1e76f980f77841ecc40c';

COMMENT ON DOMAIN "qti"."__text_mvb6rz2wwz" IS 'text domain of definition e4de5552f417d777c8d1aee111ed50461f41c0af6c3392b3fcfa3cb99ed4537b';

COMMENT ON FUNCTION "qti"."__row_3o3ow6nbmz"("qti"."node_kind", "qti"."__text_mvb6rz2wwz", "qti"."attribute_name", "qti"."__text_mvb6rz2wwz") IS 'row function 2f45fc839675b2e545093118b6492e545b544a46926370e4df0c36de254b06de';

COMMENT ON DOMAIN "qti"."__text_aezrarw5qb" IS 'text domain of definition e6e26ba2b395bc4c79a8579a6b3e3ea5894458b6f52c8210d87a3420dba2869a';

COMMENT ON DOMAIN "qti"."__text_3adwbksayk" IS 'text domain of definition fd4eadc7a8b98d8a19239d9f45b29021bcf2ec27ca3a1836b4dd45ffbad1f4d6';

COMMENT ON CONSTRAINT "__assembled_document_pk_j6e4uusicb" ON "qti"."assembled_document" IS 'primary key of AssembledDocument';

COMMENT ON CONSTRAINT "__assembled_document_check_assembled_document_vj2hynzxez" ON "qti"."assembled_document" IS 'check of AssembledDocument for law count fold over fin(AssembledDocument, targets) of SiteTarget(package, path) where {"kind":"compare","left":{"field":"places","kind":"field"},"op":"eq","right":{"kind":"literal","value":true}} into AssembledDocument(package, path, sites)';

COMMENT ON CONSTRAINT "__assembled_document_key_package_path_instances_4de72j5vky" ON "qti"."assembled_document" IS 'key AssembledDocument(package, path, instances, sites)';

COMMENT ON CONSTRAINT "__assembled_document_key_package_path_targets_hgo4adwiy5" ON "qti"."assembled_document" IS 'key AssembledDocument(package, path, targets)';

COMMENT ON CONSTRAINT "__attribute_pk_7dwyp2j4rn" ON "qti"."attribute" IS 'primary key of Attribute';

COMMENT ON CONSTRAINT "__attribute_check_attribute_idrefs_concat_fold_cxmpxccwch" ON "qti"."attribute" IS 'check of Attribute for law concat fold over fin(Attribute, idrefs) of Idref(package, path, start, name, piece, piecesWas, piecesAfter) into Attribute(package, path, start, name, idrefText)';

COMMENT ON CONSTRAINT "__attribute_key_package_path_start_name_idrefs_nrfiwbgcvt" ON "qti"."attribute" IS 'key Attribute(package, path, start, name, idrefs)';

COMMENT ON CONSTRAINT "__attribute_subset_name_fign53y6fa" ON "qti"."attribute" IS 'closed id subset check of Attribute.name';

COMMENT ON CONSTRAINT "__attribute_entity_pk_yb5ruqtiyk" ON "qti"."attribute_entity" IS 'primary key of AttributeEntity';

COMMENT ON CONSTRAINT "__binding_name_pk_k6l2t2abun" ON "qti"."binding_name" IS 'primary key of BindingName';

COMMENT ON CONSTRAINT "__bound_variable_pk_iz45qegzkf" ON "qti"."bound_variable" IS 'primary key of BoundVariable';

COMMENT ON CONSTRAINT "__candidate_path_pk_2oe4ezpmrf" ON "qti"."candidate_path" IS 'primary key of CandidatePath';

COMMENT ON CONSTRAINT "__catalog_id_pk_6linalpnqr" ON "qti"."catalog_id" IS 'primary key of CatalogId';

COMMENT ON CONSTRAINT "__catalog_scope_pk_kb6w3u5zbp" ON "qti"."catalog_scope" IS 'primary key of CatalogScope';

COMMENT ON CONSTRAINT "__cell_headers_pk_kjevq3pul6" ON "qti"."cell_headers" IS 'primary key of CellHeaders';

COMMENT ON CONSTRAINT "__cell_headers_check_cell_headers_tokens_concat_fold_rt7moipp6s" ON "qti"."cell_headers" IS 'check of CellHeaders for law concat fold over fin(CellHeaders, tokens) of HeaderToken(package, path, start, piece, piecesWas, piecesAfter) into CellHeaders(package, path, start, tokenText)';

COMMENT ON CONSTRAINT "__cell_headers_key_package_path_start_tokens_mdrwqv4pvh" ON "qti"."cell_headers" IS 'key CellHeaders(package, path, start, tokens)';

COMMENT ON CONSTRAINT "__cell_leaf_pk_kwsf55gwhy" ON "qti"."cell_leaf" IS 'primary key of CellLeaf';

COMMENT ON CONSTRAINT "__cell_leaf_key_package_path_start_36lwd4ckkb" ON "qti"."cell_leaf" IS 'key CellLeaf(package, path, start)';

COMMENT ON CONSTRAINT "__cell_leaf_key_package_path_cell_at_start_after_6spurwpz6m" ON "qti"."cell_leaf" IS 'key CellLeaf(package, path, cell, at, startAfter)';

COMMENT ON CONSTRAINT "__cell_leaf_check_math_cell_leaves_max_fold_luu2g66k3z" ON "qti"."cell_leaf" IS 'check of CellLeaf for law max fold over fin(MathCell, leaves) of CellLeaf(package, path, cell, start, startWas, startAfter) into MathCell(package, path, start, lastStart)';

COMMENT ON CONSTRAINT "__choice_pk_lpz37hc34u" ON "qti"."choice" IS 'primary key of Choice';

COMMENT ON CONSTRAINT "__choice_interaction_pk_dxmiqmyvgh" ON "qti"."choice_interaction" IS 'primary key of ChoiceInteraction';

COMMENT ON CONSTRAINT "__cn_attribute_pk_uahvc6us4g" ON "qti"."cn_attribute" IS 'primary key of CnAttribute';

COMMENT ON CONSTRAINT "__cn_count_pk_5n2ubteh2s" ON "qti"."cn_count" IS 'primary key of CnCount';

COMMENT ON CONSTRAINT "__cn_count_check_cn_count_in_cn_parts_cwyirxrado" ON "qti"."cn_count" IS 'check of CnCount for law CnCount(type, parts) in CnParts(type, parts)';

COMMENT ON CONSTRAINT "__cn_count_key_package_path_start_parts_type_7wasizqrkb" ON "qti"."cn_count" IS 'key CnCount(package, path, start, parts, type)';

COMMENT ON CONSTRAINT "__cn_count_key_package_path_start_type_gfzp5vminc" ON "qti"."cn_count" IS 'key CnCount(package, path, start, type)';

COMMENT ON CONSTRAINT "__cn_part_text_pk_2mlmvkaywv" ON "qti"."cn_part_text" IS 'primary key of CnPartText';

COMMENT ON CONSTRAINT "__cn_part_text_check_cn_part_text_in_cn_form_skp5v7ovmz" ON "qti"."cn_part_text" IS 'check of CnPartText for law CnPartText(type, part, form) in CnForm(type, part, form)';

COMMENT ON CONSTRAINT "__cn_slot_pk_tkl6mzsgtu" ON "qti"."cn_slot" IS 'primary key of CnSlot';

COMMENT ON CONSTRAINT "__cn_slot_check_cn_slot_in_cn_form_sx4ohhn6rj" ON "qti"."cn_slot" IS 'check of CnSlot for law CnSlot(type, part, form) in CnForm(type, part, form)';

COMMENT ON CONSTRAINT "__comment_pk_zalmloung6" ON "qti"."comment" IS 'primary key of Comment';

COMMENT ON CONSTRAINT "__context_ref_pk_wtoqozrkb7" ON "qti"."context_ref" IS 'primary key of ContextRef';

COMMENT ON CONSTRAINT "__count_bound_pk_uzay2pj3by" ON "qti"."count_bound" IS 'primary key of CountBound';

COMMENT ON CONSTRAINT "__data_ssml_pk_gzjsvobgct" ON "qti"."data_ssml" IS 'primary key of DataSsml';

COMMENT ON CONSTRAINT "__data_ssml_member_pk_u4vziygyer" ON "qti"."data_ssml_member" IS 'primary key of DataSsmlMember';

COMMENT ON CONSTRAINT "__data_ssml_property_pk_4jbru3xmzc" ON "qti"."data_ssml_property" IS 'primary key of DataSsmlProperty';

COMMENT ON CONSTRAINT "__doctype_pk_5h245mv7ym" ON "qti"."doctype" IS 'primary key of Doctype';

COMMENT ON CONSTRAINT "__document_pk_4kx3ps5ktb" ON "qti"."document" IS 'primary key of Document';

COMMENT ON CONSTRAINT "__document_check_document_targeted_by_or_fold_dpxrkvcaqz" ON "qti"."document" IS 'check of Document for law or fold over fin(Document, targetedBy) of SiteTarget(package, target, ancestry) into Document(package, path, context)';

COMMENT ON CONSTRAINT "__document_key_package_path_idref_targets_assembled_pqtexnr4ef" ON "qti"."document" IS 'key Document(package, path, idrefTargets, assembled)';

COMMENT ON CONSTRAINT "__document_key_package_path_ids_idref_targets_uarcdaz2q7" ON "qti"."document" IS 'key Document(package, path, ids, idrefTargets, choices, hottexts)';

COMMENT ON CONSTRAINT "__document_key_package_path_root_kind_nlu75ekokq" ON "qti"."document" IS 'key Document(package, path, rootKind)';

COMMENT ON CONSTRAINT "__document_key_package_path_root_kind_document_type_fbvnlbnzgb" ON "qti"."document" IS 'key Document(package, path, rootKind, documentType)';

COMMENT ON CONSTRAINT "__document_key_package_path_assembled_rgcicnbedu" ON "qti"."document" IS 'key Document(package, path, assembled)';

COMMENT ON CONSTRAINT "__document_key_package_path_targeted_by_context_ecojuiifmt" ON "qti"."document" IS 'key Document(package, path, targetedBy, contextNearest, contextNearestKind, contextPath, rootKind)';

COMMENT ON CONSTRAINT "__document_key_package_path_variables_root_kind_xlc74hwvik" ON "qti"."document" IS 'key Document(package, path, variables, rootKind)';

COMMENT ON CONSTRAINT "__document_key_package_path_bindings_i4mvwqzwgt" ON "qti"."document" IS 'key Document(package, path, bindings)';

COMMENT ON CONSTRAINT "__document_key_package_path_choices_4giytroxnf" ON "qti"."document" IS 'key Document(package, path, choices)';

COMMENT ON CONSTRAINT "__document_key_package_path_ids_mtswnxnvwc" ON "qti"."document" IS 'key Document(package, path, ids)';

COMMENT ON CONSTRAINT "__document_key_package_path_hottexts_64ahki5hq2" ON "qti"."document" IS 'key Document(package, path, hottexts)';

COMMENT ON CONSTRAINT "__document_id_pk_x7sxopulh7" ON "qti"."document_id" IS 'primary key of DocumentId';

COMMENT ON CONSTRAINT "__element_type_pk_eut565g4zr" ON "qti"."element_type" IS 'primary key of ElementType';

COMMENT ON CONSTRAINT "__element_type_check_element_type_in_xsi_type_7rogblrpa2" ON "qti"."element_type" IS 'check of ElementType for law ElementType(kind, type) in XsiType(kind, type)';

COMMENT ON CONSTRAINT "__encoding_decl_pk_7o6qyrzn2p" ON "qti"."encoding_decl" IS 'primary key of EncodingDecl';

COMMENT ON CONSTRAINT "__entry_pk_pft7stbhq7" ON "qti"."entry" IS 'primary key of Entry';

COMMENT ON CONSTRAINT "__expression_pk_djkytcc7ot" ON "qti"."expression" IS 'primary key of Expression';

COMMENT ON CONSTRAINT "__expression_key_package_path_start_base_type_z3zrneogcu" ON "qti"."expression" IS 'key Expression(package, path, start, baseType)';

COMMENT ON CONSTRAINT "__feedback_ref_pk_h56q5t5kv4" ON "qti"."feedback_ref" IS 'primary key of FeedbackRef';

COMMENT ON CONSTRAINT "__file_pk_i2bjocdyi2" ON "qti"."file" IS 'primary key of File';

COMMENT ON CONSTRAINT "__fragment_context_name_pk_267rnimwff" ON "qti"."fragment_context_name" IS 'primary key of FragmentContextName';

COMMENT ON CONSTRAINT "__fragment_context_ref_pk_2f7bkzpv3i" ON "qti"."fragment_context_ref" IS 'primary key of FragmentContextRef';

COMMENT ON CONSTRAINT "__fragment_feedback_name_pk_ejmdti7lg3" ON "qti"."fragment_feedback_name" IS 'primary key of FragmentFeedbackName';

COMMENT ON CONSTRAINT "__fragment_feedback_ref_pk_ynbqfxu6rf" ON "qti"."fragment_feedback_ref" IS 'primary key of FragmentFeedbackRef';

COMMENT ON CONSTRAINT "__fragment_printed_name_pk_5zdeta42lu" ON "qti"."fragment_printed_name" IS 'primary key of FragmentPrintedName';

COMMENT ON CONSTRAINT "__fragment_printed_ref_pk_hxbuzmlrz2" ON "qti"."fragment_printed_ref" IS 'primary key of FragmentPrintedRef';

COMMENT ON CONSTRAINT "__fragment_scope_pk_sgzw7myypj" ON "qti"."fragment_scope" IS 'primary key of FragmentScope';

COMMENT ON CONSTRAINT "__fragment_scope_key_package_assembly_instance_byyh3dpbgf" ON "qti"."fragment_scope" IS 'key FragmentScope(package, assembly, instance, contexts, assemblyKind, document)';

COMMENT ON CONSTRAINT "__fragment_scope_key_package_assembly_instance_jcirqd44oa" ON "qti"."fragment_scope" IS 'key FragmentScope(package, assembly, instance, feedbacks, assemblyKind, document)';

COMMENT ON CONSTRAINT "__fragment_scope_key_package_assembly_instance_agjvofijij" ON "qti"."fragment_scope" IS 'key FragmentScope(package, assembly, instance, prints, assemblyKind, document)';

COMMENT ON CONSTRAINT "__fragment_scope_key_package_assembly_instance_ixkimyvxqa" ON "qti"."fragment_scope" IS 'key FragmentScope(package, assembly, instance, templates, assemblyKind, document)';

COMMENT ON CONSTRAINT "__fragment_template_name_pk_jq3jwmzjws" ON "qti"."fragment_template_name" IS 'primary key of FragmentTemplateName';

COMMENT ON CONSTRAINT "__fragment_template_ref_pk_fozvbajq3p" ON "qti"."fragment_template_ref" IS 'primary key of FragmentTemplateRef';

COMMENT ON CONSTRAINT "__header_token_pk_ybyt5ap6zk" ON "qti"."header_token" IS 'primary key of HeaderToken';

COMMENT ON CONSTRAINT "__header_token_check_cell_headers_tokens_concat_fold_z5p7yt7ha7" ON "qti"."header_token" IS 'check of HeaderToken for law concat fold over fin(CellHeaders, tokens) of HeaderToken(package, path, start, piece, piecesWas, piecesAfter) into CellHeaders(package, path, start, tokenText)';

COMMENT ON CONSTRAINT "__hottext_pk_g57caygl5o" ON "qti"."hottext" IS 'primary key of Hottext';

COMMENT ON CONSTRAINT "__identity_text_pk_aaeve62thy" ON "qti"."identity_text" IS 'primary key of IdentityText';

COMMENT ON CONSTRAINT "__identity_text_check_identity_text_tokens_concat_qc2rvb6wft" ON "qti"."identity_text" IS 'check of IdentityText for law concat fold over fin(IdentityText, tokens) of TextIdref(package, path, start, piece, piecesWas, piecesAfter) into IdentityText(package, path, start, tokenText)';

COMMENT ON CONSTRAINT "__identity_text_key_package_path_start_tokens_5pavpyeu7f" ON "qti"."identity_text" IS 'key IdentityText(package, path, start, tokens)';

COMMENT ON CONSTRAINT "__idref_pk_xqrlmnw437" ON "qti"."idref" IS 'primary key of Idref';

COMMENT ON CONSTRAINT "__idref_check_attribute_idrefs_concat_fold_n6pe7kedc5" ON "qti"."idref" IS 'check of Idref for law concat fold over fin(Attribute, idrefs) of Idref(package, path, start, name, piece, piecesWas, piecesAfter) into Attribute(package, path, start, name, idrefText)';

COMMENT ON CONSTRAINT "__inclusion_pk_niaddoqk3f" ON "qti"."inclusion" IS 'primary key of Inclusion';

COMMENT ON CONSTRAINT "__instance_pk_prybopoegp" ON "qti"."instance" IS 'primary key of Instance';

COMMENT ON CONSTRAINT "__instance_key_package_assembly_start_document_vigbcn7gg7" ON "qti"."instance" IS 'key Instance(package, assembly, start, document, assemblyKind)';

COMMENT ON CONSTRAINT "__instance_key_package_assembly_start_children_ce6pyigrjj" ON "qti"."instance" IS 'key Instance(package, assembly, start, children, assemblyKind, document)';

COMMENT ON CONSTRAINT "__instance_key_package_assembly_start_choices_3brw3vjmom" ON "qti"."instance" IS 'key Instance(package, assembly, start, choices, document)';

COMMENT ON CONSTRAINT "__instance_key_package_assembly_start_hottexts_dlfe4bt7mk" ON "qti"."instance" IS 'key Instance(package, assembly, start, hottexts, document)';

COMMENT ON CONSTRAINT "__instance_key_package_assembly_start_ids_assembly_5cetgpnmjn" ON "qti"."instance" IS 'key Instance(package, assembly, start, ids, assemblyKind, document)';

COMMENT ON CONSTRAINT "__instance_key_package_assembly_start_idref_targets_4b3dwuaxhp" ON "qti"."instance" IS 'key Instance(package, assembly, start, idrefTargets, document)';

COMMENT ON CONSTRAINT "__instance_key_package_assembly_start_document_go7qfh4bdy" ON "qti"."instance" IS 'key Instance(package, assembly, start, document)';

COMMENT ON CONSTRAINT "__instance_key_package_assembly_start_variables_zh4krblqmh" ON "qti"."instance" IS 'key Instance(package, assembly, start, variables, document)';

COMMENT ON CONSTRAINT "__instance_key_package_assembly_start_bindings_xhnecgjaqk" ON "qti"."instance" IS 'key Instance(package, assembly, start, bindings)';

COMMENT ON CONSTRAINT "__interaction_pk_6gsxu3brgo" ON "qti"."interaction" IS 'primary key of Interaction';

COMMENT ON CONSTRAINT "__interaction_key_package_path_start_choices_qc5tgh5tjv" ON "qti"."interaction" IS 'key Interaction(package, path, start, choices)';

COMMENT ON CONSTRAINT "__interaction_key_package_path_start_module_forms_hc7hrrv7q3" ON "qti"."interaction" IS 'key Interaction(package, path, start, moduleForms)';

COMMENT ON CONSTRAINT "__interaction_attribute_pk_sbz3kmx43v" ON "qti"."interaction_attribute" IS 'primary key of InteractionAttribute';

COMMENT ON CONSTRAINT "__item_mode_pk_rmbrjefggb" ON "qti"."item_mode" IS 'primary key of ItemMode';

COMMENT ON CONSTRAINT "__item_mode_key_package_path_adaptive_jyslhwwydx" ON "qti"."item_mode" IS 'key ItemMode(package, path, adaptive)';

COMMENT ON CONSTRAINT "__item_ref_document_pk_ylsc7bhhax" ON "qti"."item_ref_document" IS 'primary key of ItemRefDocument';

COMMENT ON CONSTRAINT "__item_ref_href_pk_gic6tz4yai" ON "qti"."item_ref_href" IS 'primary key of ItemRefHref';

COMMENT ON CONSTRAINT "__label_use_pk_mebvop4w36" ON "qti"."label_use" IS 'primary key of LabelUse';

COMMENT ON CONSTRAINT "__least_count_pk_gmz3yk64c7" ON "qti"."least_count" IS 'primary key of LeastCount';

COMMENT ON CONSTRAINT "__link_reading_pk_2khphl5lxa" ON "qti"."link_reading" IS 'primary key of LinkReading';

COMMENT ON CONSTRAINT "__literal_pk_aelubxdbzj" ON "qti"."literal" IS 'primary key of Literal';

COMMENT ON CONSTRAINT "__literal_typed_pk_uqez5pzkc2" ON "qti"."literal_typed" IS 'primary key of LiteralTyped';

COMMENT ON CONSTRAINT "__lookup_value_pk_dtzddogytm" ON "qti"."lookup_value" IS 'primary key of LookupValue';

COMMENT ON CONSTRAINT "__map_key_pk_vv52s26trb" ON "qti"."map_key" IS 'primary key of MapKey';

COMMENT ON CONSTRAINT "__mastery_value_pk_io4smtjq6v" ON "qti"."mastery_value" IS 'primary key of MasteryValue';

COMMENT ON CONSTRAINT "__math_action_pk_4jdvklv2ii" ON "qti"."math_action" IS 'primary key of MathAction';

COMMENT ON CONSTRAINT "__math_align_group_pk_tgvbkr7qje" ON "qti"."math_align_group" IS 'primary key of MathAlignGroup';

COMMENT ON CONSTRAINT "__math_align_scope_pk_sxnaufx3ho" ON "qti"."math_align_scope" IS 'primary key of MathAlignScope';

COMMENT ON CONSTRAINT "__math_align_scope_key_package_path_start_cell_mgyr62ewdn" ON "qti"."math_align_scope" IS 'key MathAlignScope(package, path, start, cell)';

COMMENT ON CONSTRAINT "__math_align_scope_key_package_path_start_state_zrr62hnvxo" ON "qti"."math_align_scope" IS 'key MathAlignScope(package, path, start, state)';

COMMENT ON CONSTRAINT "__math_cell_pk_flybwottgz" ON "qti"."math_cell" IS 'primary key of MathCell';

COMMENT ON CONSTRAINT "__math_cell_check_math_cell_leaves_max_fold_p4tuczms44" ON "qti"."math_cell" IS 'check of MathCell for law max fold over fin(MathCell, leaves) of CellLeaf(package, path, cell, start, startWas, startAfter) into MathCell(package, path, start, lastStart)';

COMMENT ON CONSTRAINT "__math_cell_key_package_path_start_leaves_nhlewh35h4" ON "qti"."math_cell" IS 'key MathCell(package, path, start, leaves)';

COMMENT ON CONSTRAINT "__math_cell_key_package_path_start_groups_nlvtbk2yer" ON "qti"."math_cell" IS 'key MathCell(package, path, start, groups)';

COMMENT ON CONSTRAINT "__math_cn_pk_3nrusqjv2o" ON "qti"."math_cn" IS 'primary key of MathCn';

COMMENT ON CONSTRAINT "__math_cn_key_package_path_start_parts_base_type_k7rpbytgms" ON "qti"."math_cn" IS 'key MathCn(package, path, start, parts, base, type)';

COMMENT ON CONSTRAINT "__math_cn_check_math_cn_in_cn_parts_ela4pkxt26" ON "qti"."math_cn" IS 'check of MathCn for law MathCn(type, parts) in CnParts(type, parts)';

COMMENT ON CONSTRAINT "__math_rank_pk_bu6eyoohob" ON "qti"."math_rank" IS 'primary key of MathRank';

COMMENT ON CONSTRAINT "__media_pk_scp4yymok4" ON "qti"."media" IS 'primary key of Media';

COMMENT ON CONSTRAINT "__most_count_pk_dueqkg2jsm" ON "qti"."most_count" IS 'primary key of MostCount';

COMMENT ON CONSTRAINT "__named_pk_7cwq6zir4x" ON "qti"."named" IS 'primary key of Named';

COMMENT ON CONSTRAINT "__namespace_pk_bossyr4mgg" ON "qti"."namespace" IS 'primary key of Namespace';

COMMENT ON CONSTRAINT "__node_pk_3sd4cqvxbf" ON "qti"."node" IS 'primary key of Node';

COMMENT ON CONSTRAINT "__node_check_node_attributes_or_fold_mleeahtwkj" ON "qti"."node" IS 'check of Node for law or fold over fin(Node, attributes) of Attribute(package, path, start, slot) into Node(package, path, start, attrs)';

COMMENT ON CONSTRAINT "__node_check_node_children_count_fold_hsxqdt3sdl" ON "qti"."node" IS 'check of Node for law count fold over fin(Node, children) of Node(package, path, parent, elementsWas, elements) where {"arg":{"arg":{"field":"kind","kind":"field"},"kind":"in","values":["comment","doctype","document","entityRef","pi","text","ws"]},"kind":"not"} and {"kind":"compare","left":{"field":"start","kind":"field"},"op":"gt","right":{"kind":"literal","value":"~n:0"}} into Node(package, path, start, elementChildren)';

COMMENT ON CONSTRAINT "__node_check_node_children_concat_fold_2qfkeydkpv" ON "qti"."node" IS 'check of Node for law concat fold over fin(Node, children) of Node(package, path, parent, chars, charsWas, charsAfter) where {"args":[{"arg":{"field":"parentKind","kind":"field"},"kind":"in","values":["lom:catalog","lom:entity","lom:entry","lom:id","lom:language","lom:source","lom:value","qti-base-value","qti-resource-icon","qti-value","ud:value"]},{"args":[{"arg":{"field":"parentParentKind","kind":"field"},"kind":"in","values":["lom:entry.langString","lom:source.langString","lom:title"]},{"kind":"compare","left":{"field":"parentKind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"lom:string"}}],"kind":"and"},{"args":[{"field":"parentGovernor","kind":"field"}],"kind":"closedHas","relation":"CheckedText"}],"kind":"or"} and {"kind":"compare","left":{"field":"start","kind":"field"},"op":"gt","right":{"kind":"literal","value":"~n:0"}} into Node(package, path, start, stringValue)';

COMMENT ON CONSTRAINT "__node_key_package_path_start_attributes_governor_ygbuqn7z2g" ON "qti"."node" IS 'key Node(package, path, start, attributes, governor, kind)';

COMMENT ON CONSTRAINT "__node_key_package_path_start_nearest_y5k53am632" ON "qti"."node" IS 'key Node(package, path, start, nearest)';

COMMENT ON CONSTRAINT "__node_key_package_path_start_kind_governor_42fsltrsjy" ON "qti"."node" IS 'key Node(package, path, start, kind, governor)';

COMMENT ON CONSTRAINT "__node_key_package_path_start_kind_ooglyqab5z" ON "qti"."node" IS 'key Node(package, path, start, kind)';

COMMENT ON CONSTRAINT "__node_check_node_in_node_z2rpbmauvt" ON "qti"."node" IS 'check of Node for law Node(package, path, start, pred(children), lastState) in Node(package, path, parent, at, state) where {"kind":"compare","left":{"field":"start","kind":"field"},"op":"gt","right":{"kind":"literal","value":"~n:0"}}';

COMMENT ON CONSTRAINT "__node_check_node_start_in_node_kuuvkytm3l" ON "qti"."node" IS 'check of Node for law Node(package, path, parent, pred(at), was) where {"kind":"compare","left":{"field":"start","kind":"field"},"op":"gt","right":{"kind":"literal","value":"~n:0"}} in Node(package, path, parent, at, state) where {"kind":"compare","left":{"field":"start","kind":"field"},"op":"gt","right":{"kind":"literal","value":"~n:0"}}';

COMMENT ON CONSTRAINT "__node_key_package_path_start_children_ancestry_mhxzt3iftx" ON "qti"."node" IS 'key Node(package, path, start, children, ancestry, governor, kind, nearest, nearestKind, nearestPath, parentKind)';

COMMENT ON CONSTRAINT "__node_check_node_start_in_node_dqrlgxt5zm" ON "qti"."node" IS 'check of Node for law Node(package, path, parent, parentKind, parentGovernor, parentAncestry, parentNearest, parentNearestKind, parentNearestPath, parentParentKind) where {"kind":"compare","left":{"field":"start","kind":"field"},"op":"gt","right":{"kind":"literal","value":"~n:0"}} in Node(package, path, start, kind, governor, ancestry, nearest, nearestKind, nearestPath, parentKind)';

COMMENT ON CONSTRAINT "__node_key_package_path_start_open_attributes_nc25nroxph" ON "qti"."node" IS 'key Node(package, path, start, openAttributes, governor, kind)';

COMMENT ON CONSTRAINT "__node_key_package_path_start_parent_ytuzrwhg3t" ON "qti"."node" IS 'key Node(package, path, start, parent)';

COMMENT ON CONSTRAINT "__normal_maximum_pk_zlhcz2bseu" ON "qti"."normal_maximum" IS 'primary key of NormalMaximum';

COMMENT ON CONSTRAINT "__normal_minimum_pk_po6gjnvo47" ON "qti"."normal_minimum" IS 'primary key of NormalMinimum';

COMMENT ON CONSTRAINT "__open_attribute_pk_6mb2hbuotd" ON "qti"."open_attribute" IS 'primary key of OpenAttribute';

COMMENT ON CONSTRAINT "__open_attribute_subset_class_vzmcv3d7ri" ON "qti"."open_attribute" IS 'closed id subset check of OpenAttribute.class';

COMMENT ON CONSTRAINT "__open_attribute_entity_pk_u75ia7rdtp" ON "qti"."open_attribute_entity" IS 'primary key of OpenAttributeEntity';

COMMENT ON CONSTRAINT "__open_element_name_pk_tvf7l2rxcw" ON "qti"."open_element_name" IS 'primary key of OpenElementName';

COMMENT ON CONSTRAINT "__open_element_type_pk_osb6ag24xx" ON "qti"."open_element_type" IS 'primary key of OpenElementType';

COMMENT ON CONSTRAINT "__package_pk_sg2cyzxgtm" ON "qti"."package" IS 'primary key of Package';

COMMENT ON CONSTRAINT "__pci_module_form_pk_jb4ydiyesl" ON "qti"."pci_module_form" IS 'primary key of PciModuleForm';

COMMENT ON CONSTRAINT "__pi_pk_vqm3tcomg6" ON "qti"."pi" IS 'primary key of Pi';

COMMENT ON CONSTRAINT "__placed_binding_pk_kvet6cuoq5" ON "qti"."placed_binding" IS 'primary key of PlacedBinding';

COMMENT ON CONSTRAINT "__placed_choice_pk_dok6mu6xso" ON "qti"."placed_choice" IS 'primary key of PlacedChoice';

COMMENT ON CONSTRAINT "__placed_hottext_pk_6ecbggsuft" ON "qti"."placed_hottext" IS 'primary key of PlacedHottext';

COMMENT ON CONSTRAINT "__placed_id_pk_qlkpea6rki" ON "qti"."placed_id" IS 'primary key of PlacedId';

COMMENT ON CONSTRAINT "__placed_math_rank_pk_w247vuqyov" ON "qti"."placed_math_rank" IS 'primary key of PlacedMathRank';

COMMENT ON CONSTRAINT "__placed_share_target_pk_r6i6tlbske" ON "qti"."placed_share_target" IS 'primary key of PlacedShareTarget';

COMMENT ON CONSTRAINT "__placed_variable_ref_pk_raoqh7fl2q" ON "qti"."placed_variable_ref" IS 'primary key of PlacedVariableRef';

COMMENT ON CONSTRAINT "__printed_variable_ref_pk_4a3jyykasc" ON "qti"."printed_variable_ref" IS 'primary key of PrintedVariableRef';

COMMENT ON CONSTRAINT "__processing_pk_gy3aspswav" ON "qti"."processing" IS 'primary key of Processing';

COMMENT ON CONSTRAINT "__reference_pk_2o4vr3munh" ON "qti"."reference" IS 'primary key of Reference';

COMMENT ON CONSTRAINT "__reference_path_pk_p3zpayjgij" ON "qti"."reference_path" IS 'primary key of ReferencePath';

COMMENT ON CONSTRAINT "__referring_document_pk_tdpnvmehb4" ON "qti"."referring_document" IS 'primary key of ReferringDocument';

COMMENT ON CONSTRAINT "__referring_document_key_package_path_feedbacks_cvhrnks7yx" ON "qti"."referring_document" IS 'key ReferringDocument(package, path, feedbacks, prints, templates, contexts)';

COMMENT ON CONSTRAINT "__referring_document_key_package_path_contexts_ywpuklr6qa" ON "qti"."referring_document" IS 'key ReferringDocument(package, path, contexts)';

COMMENT ON CONSTRAINT "__referring_document_key_package_path_feedbacks_4p7kezdq2l" ON "qti"."referring_document" IS 'key ReferringDocument(package, path, feedbacks)';

COMMENT ON CONSTRAINT "__referring_document_key_package_path_prints_v72l4cixxs" ON "qti"."referring_document" IS 'key ReferringDocument(package, path, prints)';

COMMENT ON CONSTRAINT "__referring_document_key_package_path_templates_je6u6axji4" ON "qti"."referring_document" IS 'key ReferringDocument(package, path, templates)';

COMMENT ON CONSTRAINT "__resource_document_pk_rxwn2mdki3" ON "qti"."resource_document" IS 'primary key of ResourceDocument';

COMMENT ON CONSTRAINT "__resource_document_check_resource_document_in_root_mkbnfbuuvd" ON "qti"."resource_document" IS 'check of ResourceDocument for law ResourceDocument(type, rootKind) in RootOfType(type, root)';

COMMENT ON CONSTRAINT "__resource_href_pk_fzjlywz4ma" ON "qti"."resource_href" IS 'primary key of ResourceHref';

COMMENT ON CONSTRAINT "__rounding_pk_p5ba7td7t4" ON "qti"."rounding" IS 'primary key of Rounding';

COMMENT ON CONSTRAINT "__rounding_figures_pk_wwvjzzaivg" ON "qti"."rounding_figures" IS 'primary key of RoundingFigures';

COMMENT ON CONSTRAINT "__rounding_mode_figures_pk_32ue4ztm6s" ON "qti"."rounding_mode_figures" IS 'primary key of RoundingModeFigures';

COMMENT ON CONSTRAINT "__sd_decl_pk_do2xlu7vc3" ON "qti"."sd_decl" IS 'primary key of SdDecl';

COMMENT ON CONSTRAINT "__share_fragment_pk_w7lv43thb6" ON "qti"."share_fragment" IS 'primary key of ShareFragment';

COMMENT ON CONSTRAINT "__share_target_pk_tap2cz4xh5" ON "qti"."share_target" IS 'primary key of ShareTarget';

COMMENT ON CONSTRAINT "__site_pk_j2vhpivheb" ON "qti"."site" IS 'primary key of Site';

COMMENT ON CONSTRAINT "__site_key_package_path_start_kind_s6ijpbztua" ON "qti"."site" IS 'key Site(package, path, start, kind)';

COMMENT ON CONSTRAINT "__site_key_package_path_start_ancestry_kind_nearest_ap2yfi7b7f" ON "qti"."site" IS 'key Site(package, path, start, ancestry, kind, nearest, nearestKind, parentKind)';

COMMENT ON CONSTRAINT "__site_path_pk_6ywav3eq35" ON "qti"."site_path" IS 'primary key of SitePath';

COMMENT ON CONSTRAINT "__site_path_key_package_path_start_target_s26hafrpua" ON "qti"."site_path" IS 'key SitePath(package, path, start, target)';

COMMENT ON CONSTRAINT "__site_target_pk_oj7kjo67zv" ON "qti"."site_target" IS 'primary key of SiteTarget';

COMMENT ON CONSTRAINT "__site_target_key_package_path_start_parent_kind_cu6n5wnlhm" ON "qti"."site_target" IS 'key SiteTarget(package, path, start, parentKind, places, targetRoot, splices)';

COMMENT ON CONSTRAINT "__srcset_pk_wnl6kaqxsl" ON "qti"."srcset" IS 'primary key of Srcset';

COMMENT ON CONSTRAINT "__srcset_check_srcset_tokens_concat_fold_7x5nzmr2a5" ON "qti"."srcset" IS 'check of Srcset for law concat fold over fin(Srcset, tokens) of SrcsetCandidate(package, path, start, piece, piecesWas, piecesAfter) into Srcset(package, path, start, tokenText)';

COMMENT ON CONSTRAINT "__srcset_key_package_path_start_tokens_7vcwtlqzy2" ON "qti"."srcset" IS 'key Srcset(package, path, start, tokens)';

COMMENT ON CONSTRAINT "__srcset_candidate_pk_rbke535jdh" ON "qti"."srcset_candidate" IS 'primary key of SrcsetCandidate';

COMMENT ON CONSTRAINT "__srcset_candidate_check_srcset_tokens_concat_fold_jthorh3gv6" ON "qti"."srcset_candidate" IS 'check of SrcsetCandidate for law concat fold over fin(Srcset, tokens) of SrcsetCandidate(package, path, start, piece, piecesWas, piecesAfter) into Srcset(package, path, start, tokenText)';

COMMENT ON CONSTRAINT "__ssml_scope_pk_swy2jq3zvy" ON "qti"."ssml_scope" IS 'primary key of SsmlScope';

COMMENT ON CONSTRAINT "__stimulus_ref_pk_kmzmekbnny" ON "qti"."stimulus_ref" IS 'primary key of StimulusRef';

COMMENT ON CONSTRAINT "__table_header_pk_d7hkmir5zb" ON "qti"."table_header" IS 'primary key of TableHeader';

COMMENT ON CONSTRAINT "__table_scope_pk_ujje6dmtif" ON "qti"."table_scope" IS 'primary key of TableScope';

COMMENT ON CONSTRAINT "__template_ref_pk_by3fsxvspr" ON "qti"."template_ref" IS 'primary key of TemplateRef';

COMMENT ON CONSTRAINT "__text_idref_pk_7k524ffk7d" ON "qti"."text_idref" IS 'primary key of TextIdref';

COMMENT ON CONSTRAINT "__text_idref_check_identity_text_tokens_concat_fold_tizgwsxdoc" ON "qti"."text_idref" IS 'check of TextIdref for law concat fold over fin(IdentityText, tokens) of TextIdref(package, path, start, piece, piecesWas, piecesAfter) into IdentityText(package, path, start, tokenText)';

COMMENT ON CONSTRAINT "__text_reference_pk_47h6xjfe7g" ON "qti"."text_reference" IS 'primary key of TextReference';

COMMENT ON CONSTRAINT "__text_reference_path_pk_aurefmdcbf" ON "qti"."text_reference_path" IS 'primary key of TextReferencePath';

COMMENT ON CONSTRAINT "__tolerance_pk_awo6y43rfn" ON "qti"."tolerance" IS 'primary key of Tolerance';

COMMENT ON CONSTRAINT "__tolerance_check_tolerance_tokens_concat_fold_2jdaujadxn" ON "qti"."tolerance" IS 'check of Tolerance for law concat fold over fin(Tolerance, tokens) of ToleranceToken(package, path, start, piece, piecesWas, piecesAfter) into Tolerance(package, path, start, tokenText)';

COMMENT ON CONSTRAINT "__tolerance_key_package_path_start_tokens_xlvepfuwuw" ON "qti"."tolerance" IS 'key Tolerance(package, path, start, tokens)';

COMMENT ON CONSTRAINT "__tolerance_token_pk_o33pihaiia" ON "qti"."tolerance_token" IS 'primary key of ToleranceToken';

COMMENT ON CONSTRAINT "__tolerance_token_check_tolerance_tokens_concat_fold_tb2xcnn6a3" ON "qti"."tolerance_token" IS 'check of ToleranceToken for law concat fold over fin(Tolerance, tokens) of ToleranceToken(package, path, start, piece, piecesWas, piecesAfter) into Tolerance(package, path, start, tokenText)';

COMMENT ON CONSTRAINT "__usage_value_pk_i2ykr2qbnf" ON "qti"."usage_value" IS 'primary key of UsageValue';

COMMENT ON CONSTRAINT "__usage_value_base_type_pk_v6447uyhax" ON "qti"."usage_value_base_type" IS 'primary key of UsageValueBaseType';

COMMENT ON CONSTRAINT "__variable_ref_pk_xysknydg4p" ON "qti"."variable_ref" IS 'primary key of VariableRef';

COMMENT ON CONSTRAINT "__variable_ref_table_pk_xy5fr2qzjl" ON "qti"."variable_ref_table" IS 'primary key of VariableRefTable';

COMMENT ON CONSTRAINT "__xml_decl_pk_rlecspusxn" ON "qti"."xml_decl" IS 'primary key of XmlDecl';

COMMENT ON COLUMN "qti"."assembled_catalog"."__image_assembly_4bpgdwmchu" IS 'the textDigest image of assembly';

COMMENT ON COLUMN "qti"."assembled_catalog"."__image_id_cggscgoxcc" IS 'the textDigest image of id';

COMMENT ON COLUMN "qti"."assembled_catalog"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."assembled_document"."__pred_instances_jnofs7e7gu" IS 'pred(instances)';

COMMENT ON COLUMN "qti"."assembled_document"."__pred_targets_c5nt4iqzuc" IS 'pred(targets)';

COMMENT ON COLUMN "qti"."attribute"."__after_attributes_0_4xdbd7d2wd" IS 'the accumulator after plane 0 of the fold __node_attributes_or_fold_qjtccpaklg over the family Node.attributes';

COMMENT ON COLUMN "qti"."attribute"."__before_attributes_0_7ux33ww56a" IS 'the accumulator before plane 0 of the fold __node_attributes_or_fold_qjtccpaklg over the family Node.attributes';

COMMENT ON COLUMN "qti"."attribute"."__copy_attributes_yxabddgj5r" IS 'the owner''s count of the family Node.attributes';

COMMENT ON COLUMN "qti"."attribute"."__image_idref_text_vbeohhw2sm" IS 'the textDigest image of idrefText';

COMMENT ON COLUMN "qti"."attribute"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."attribute"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."attribute"."__index_attributes_7arzckayvr" IS 'the index of the family Node.attributes';

COMMENT ON COLUMN "qti"."attribute"."__predecessor_attributes_wqkk3l5mnd" IS 'the predecessor of the index of the family Node.attributes';

COMMENT ON COLUMN "qti"."attribute"."__package_a4p2u7pv6l" IS 'package where {"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-any-n","qti-correct","qti-default","qti-equal-rounded","qti-index","qti-lookup-outcome-value","qti-map-response","qti-map-response-point","qti-pattern-match","qti-random-float","qti-random-integer","qti-repeat","qti-round-to","qti-set-correct-response","qti-set-default-value","qti-set-outcome-value","qti-set-template-value","qti-variable"]} and {"args":[{"args":[{"args":[{"arg":{"args":[{"field":"lexical","kind":"field"},{"kind":"literal","value":{"pattern":"09b97c6fe613e598d9cf5ca30b8c43c11c5473e4a711d4d45e6270278a6683d0"}}],"fn":"matches","kind":"compute"},"kind":"not"},{"arg":{"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"qti-random-float"}},"kind":"not"}],"kind":"or"},{"args":[{"field":"lexical","kind":"field"},{"kind":"literal","value":{"pattern":"dbce2bac939b8d15f3f6b873394359a57b42b74412cfab08f44671682d0447ad"}}],"fn":"matches","kind":"compute"},{"kind":"compare","left":{"args":[{"field":"kind","kind":"field"},{"field":"name","kind":"field"}],"field":"spelling","kind":"closedAt","relation":"VariableReference"},"op":"eq","right":{"kind":"literal","value":"bare"}}],"kind":"and"},{"args":[{"args":[{"field":"lexical","kind":"field"},{"kind":"literal","value":{"pattern":"47716b2482bfc820077d0844275d18cfdc3c12bc3eea5af5832ffaf0ed8f0bb2"}}],"fn":"matches","kind":"compute"},{"kind":"compare","left":{"args":[{"field":"kind","kind":"field"},{"field":"name","kind":"field"}],"field":"spelling","kind":"closedAt","relation":"VariableReference"},"op":"eq","right":{"kind":"literal","value":"braced"}}],"kind":"and"}],"kind":"or"} and {"kind":"compare","left":{"args":[{"args":[{"field":"name","kind":"field"}],"fn":"singleton","kind":"compute"},{"args":[{"field":"kind","kind":"field"}],"kind":"closedRow","relation":"VariableReference"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}}';

COMMENT ON COLUMN "qti"."attribute"."__package_2uyqqvm75y" IS 'package where {"args":[{"args":[{"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-interpolation-table","qti-match-table"]},{"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"default-value"}}],"kind":"and"},{"args":[{"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-interpolation-table-entry","qti-match-table-entry"]},{"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"target-value"}}],"kind":"and"}],"kind":"or"}';

COMMENT ON COLUMN "qti"."attribute"."__package_zq4aso5g6f" IS 'package where {"args":[{"args":[{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"field":"name","kind":"field"}],"field":"domain","kind":"closedAt","relation":"AttributeGrammar"}],"kind":"closedHas","relation":"ValueIdentity"},{"kind":"compare","left":{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"field":"name","kind":"field"}],"field":"domain","kind":"closedAt","relation":"AttributeGrammar"}],"field":"identity","kind":"closedAt","relation":"ValueIdentity"},"op":"eq","right":{"kind":"literal","value":"ID"}}],"kind":"and"},{"args":[{"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"qti-context-declaration"}},{"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"identifier"}}],"kind":"and"}],"kind":"or"}';

COMMENT ON COLUMN "qti"."attribute"."__package_tkzla6ex7r" IS 'package where {"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"qti-assessment-item"}} and {"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"tool-name"}}';

COMMENT ON COLUMN "qti"."attribute"."__package_gw6es3z53z" IS 'package where {"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"qti-assessment-item"}} and {"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"tool-version"}}';

COMMENT ON COLUMN "qti"."attribute"."__pred_idrefs_2kinxrebfw" IS 'pred(idrefs)';

COMMENT ON COLUMN "qti"."binding_name"."__copy_bindings_bkr36e6zer" IS 'the owner''s count of the family Document.bindings';

COMMENT ON COLUMN "qti"."binding_name"."__image_identifier_sp263ko24n" IS 'the textDigest image of identifier';

COMMENT ON COLUMN "qti"."binding_name"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."binding_name"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."binding_name"."__index_bindings_unk6tk2t53" IS 'the index of the family Document.bindings';

COMMENT ON COLUMN "qti"."binding_name"."__predecessor_bindings_hnpwjkvxqw" IS 'the predecessor of the index of the family Document.bindings';

COMMENT ON COLUMN "qti"."bound_variable"."__image_identifier_sp263ko24n" IS 'the textDigest image of identifier';

COMMENT ON COLUMN "qti"."bound_variable"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."bound_variable"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."bound_variable"."__package_pyofn3cand" IS 'package where {"kind":"compare","left":{"field":"adaptive","kind":"field"},"op":"eq","right":{"kind":"literal","value":false}} and {"kind":"compare","left":{"field":"attribute","kind":"field"},"op":"eq","right":{"kind":"literal","value":"response-identifier"}}';

COMMENT ON COLUMN "qti"."catalog_id"."__image_id_cggscgoxcc" IS 'the textDigest image of id';

COMMENT ON COLUMN "qti"."catalog_id"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."catalog_id"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."cell_headers"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."cell_headers"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."cell_headers"."__image_token_text_eg2a7htxbl" IS 'the textDigest image of tokenText';

COMMENT ON COLUMN "qti"."cell_headers"."__pred_tokens_ip7mlgrtju" IS 'pred(tokens)';

COMMENT ON COLUMN "qti"."cell_leaf"."__copy_leaves_zbyyqc6flc" IS 'the owner''s count of the family MathCell.leaves';

COMMENT ON COLUMN "qti"."cell_leaf"."__pred_at_xktcobhsti" IS 'pred(at)';

COMMENT ON COLUMN "qti"."choice"."__copy_choices_6wb56hybwx" IS 'the owner''s count of the family Document.choices';

COMMENT ON COLUMN "qti"."choice"."__image_identifier_sp263ko24n" IS 'the textDigest image of identifier';

COMMENT ON COLUMN "qti"."choice"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."choice"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."choice"."__index_choices_u7j4m5lowj" IS 'the index of the family Document.choices';

COMMENT ON COLUMN "qti"."choice"."__predecessor_choices_nfvb6gvzzs" IS 'the predecessor of the index of the family Document.choices';

COMMENT ON COLUMN "qti"."choice_interaction"."__copy_choices_trqdfrh73z" IS 'the owner''s count of the family Interaction.choices';

COMMENT ON COLUMN "qti"."choice_interaction"."__index_choices_5qdn655u6p" IS 'the index of the family Interaction.choices';

COMMENT ON COLUMN "qti"."choice_interaction"."__predecessor_choices_pw4quskqli" IS 'the predecessor of the index of the family Interaction.choices';

COMMENT ON COLUMN "qti"."cn_count"."__pred_parts_32uebfen7t" IS 'pred(parts)';

COMMENT ON COLUMN "qti"."cn_part_text"."__copy_parts_qitbl7wkbe" IS 'the owner''s count of the family MathCn.parts';

COMMENT ON COLUMN "qti"."cn_part_text"."__index_parts_jdo2fld5qx" IS 'the index of the family MathCn.parts';

COMMENT ON COLUMN "qti"."cn_part_text"."__predecessor_parts_yvk7rmwtkj" IS 'the predecessor of the index of the family MathCn.parts';

COMMENT ON COLUMN "qti"."cn_slot"."__copy_parts_n6gcbnw7dj" IS 'the owner''s count of the family CnCount.parts';

COMMENT ON COLUMN "qti"."cn_slot"."__index_parts_vspd7yk6z2" IS 'the index of the family CnCount.parts';

COMMENT ON COLUMN "qti"."cn_slot"."__predecessor_parts_odfdgqim4k" IS 'the predecessor of the index of the family CnCount.parts';

COMMENT ON COLUMN "qti"."context_ref"."__image_identifier_sp263ko24n" IS 'the textDigest image of identifier';

COMMENT ON COLUMN "qti"."context_ref"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."context_ref"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."data_ssml_member"."__image_member_hou44p4stw" IS 'the textDigest image of member';

COMMENT ON COLUMN "qti"."data_ssml_member"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."data_ssml_member"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."data_ssml_property"."__image_member_name_qqbvqrei53" IS 'the textDigest image of memberName';

COMMENT ON COLUMN "qti"."data_ssml_property"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."data_ssml_property"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."document"."__pred_bindings_4jwvqtioeb" IS 'pred(bindings)';

COMMENT ON COLUMN "qti"."document"."__pred_choices_w4bygwsb7b" IS 'pred(choices)';

COMMENT ON COLUMN "qti"."document"."__pred_hottexts_qwkebxoneh" IS 'pred(hottexts)';

COMMENT ON COLUMN "qti"."document"."__pred_idref_targets_2hmjkyp3ck" IS 'pred(idrefTargets)';

COMMENT ON COLUMN "qti"."document"."__pred_ids_wdsabmqjb7" IS 'pred(ids)';

COMMENT ON COLUMN "qti"."document"."__pred_targeted_by_x4imsveco5" IS 'pred(targetedBy)';

COMMENT ON COLUMN "qti"."document"."__pred_variables_hofq62ycc6" IS 'pred(variables)';

COMMENT ON COLUMN "qti"."document_id"."__copy_ids_olm55ckphp" IS 'the owner''s count of the family Document.ids';

COMMENT ON COLUMN "qti"."document_id"."__index_ids_6wzypuy7sz" IS 'the index of the family Document.ids';

COMMENT ON COLUMN "qti"."document_id"."__predecessor_ids_qwo2em24bw" IS 'the predecessor of the index of the family Document.ids';

COMMENT ON COLUMN "qti"."feedback_ref"."__image_identifier_sp263ko24n" IS 'the textDigest image of identifier';

COMMENT ON COLUMN "qti"."feedback_ref"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."feedback_ref"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."fragment_context_name"."__copy_contexts_5a2mmj6flw" IS 'the owner''s count of the family ReferringDocument.contexts';

COMMENT ON COLUMN "qti"."fragment_context_name"."__image_identifier_sp263ko24n" IS 'the textDigest image of identifier';

COMMENT ON COLUMN "qti"."fragment_context_name"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."fragment_context_name"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."fragment_context_name"."__index_contexts_rurifjnewj" IS 'the index of the family ReferringDocument.contexts';

COMMENT ON COLUMN "qti"."fragment_context_name"."__predecessor_contexts_uwyrojdgj7" IS 'the predecessor of the index of the family ReferringDocument.contexts';

COMMENT ON COLUMN "qti"."fragment_context_ref"."__copy_contexts_aa5iocscdr" IS 'the owner''s count of the family FragmentScope.contexts';

COMMENT ON COLUMN "qti"."fragment_context_ref"."__image_identifier_sp263ko24n" IS 'the textDigest image of identifier';

COMMENT ON COLUMN "qti"."fragment_context_ref"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."fragment_context_ref"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."fragment_context_ref"."__index_contexts_cmwyokypvl" IS 'the index of the family FragmentScope.contexts';

COMMENT ON COLUMN "qti"."fragment_context_ref"."__predecessor_contexts_bio7nxkg5y" IS 'the predecessor of the index of the family FragmentScope.contexts';

COMMENT ON COLUMN "qti"."fragment_feedback_name"."__copy_feedbacks_db37gtjbwl" IS 'the owner''s count of the family ReferringDocument.feedbacks';

COMMENT ON COLUMN "qti"."fragment_feedback_name"."__image_identifier_sp263ko24n" IS 'the textDigest image of identifier';

COMMENT ON COLUMN "qti"."fragment_feedback_name"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."fragment_feedback_name"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."fragment_feedback_name"."__index_feedbacks_5unk6hkdlh" IS 'the index of the family ReferringDocument.feedbacks';

COMMENT ON COLUMN "qti"."fragment_feedback_name"."__predecessor_feedbacks_mnprabm2zf" IS 'the predecessor of the index of the family ReferringDocument.feedbacks';

COMMENT ON COLUMN "qti"."fragment_feedback_ref"."__copy_feedbacks_cywy2j56so" IS 'the owner''s count of the family FragmentScope.feedbacks';

COMMENT ON COLUMN "qti"."fragment_feedback_ref"."__image_identifier_sp263ko24n" IS 'the textDigest image of identifier';

COMMENT ON COLUMN "qti"."fragment_feedback_ref"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."fragment_feedback_ref"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."fragment_feedback_ref"."__index_feedbacks_uaqpsnapkw" IS 'the index of the family FragmentScope.feedbacks';

COMMENT ON COLUMN "qti"."fragment_feedback_ref"."__predecessor_feedbacks_tqxnj4bnpd" IS 'the predecessor of the index of the family FragmentScope.feedbacks';

COMMENT ON COLUMN "qti"."fragment_printed_name"."__copy_prints_t4jfjtgc7d" IS 'the owner''s count of the family ReferringDocument.prints';

COMMENT ON COLUMN "qti"."fragment_printed_name"."__image_identifier_sp263ko24n" IS 'the textDigest image of identifier';

COMMENT ON COLUMN "qti"."fragment_printed_name"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."fragment_printed_name"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."fragment_printed_name"."__index_prints_lrn5xrcnoj" IS 'the index of the family ReferringDocument.prints';

COMMENT ON COLUMN "qti"."fragment_printed_name"."__predecessor_prints_w5l5ryjguo" IS 'the predecessor of the index of the family ReferringDocument.prints';

COMMENT ON COLUMN "qti"."fragment_printed_ref"."__copy_prints_bdawvaisob" IS 'the owner''s count of the family FragmentScope.prints';

COMMENT ON COLUMN "qti"."fragment_printed_ref"."__image_identifier_sp263ko24n" IS 'the textDigest image of identifier';

COMMENT ON COLUMN "qti"."fragment_printed_ref"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."fragment_printed_ref"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."fragment_printed_ref"."__index_prints_4vol45drim" IS 'the index of the family FragmentScope.prints';

COMMENT ON COLUMN "qti"."fragment_printed_ref"."__predecessor_prints_yg4v7qxrwg" IS 'the predecessor of the index of the family FragmentScope.prints';

COMMENT ON COLUMN "qti"."fragment_scope"."__pred_contexts_leteqrd4bu" IS 'pred(contexts)';

COMMENT ON COLUMN "qti"."fragment_scope"."__pred_feedbacks_c2txublcan" IS 'pred(feedbacks)';

COMMENT ON COLUMN "qti"."fragment_scope"."__pred_prints_uwxz5ocwj4" IS 'pred(prints)';

COMMENT ON COLUMN "qti"."fragment_scope"."__pred_templates_5bo5q45wjw" IS 'pred(templates)';

COMMENT ON COLUMN "qti"."fragment_template_name"."__copy_templates_xccyy2wmtp" IS 'the owner''s count of the family ReferringDocument.templates';

COMMENT ON COLUMN "qti"."fragment_template_name"."__image_identifier_sp263ko24n" IS 'the textDigest image of identifier';

COMMENT ON COLUMN "qti"."fragment_template_name"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."fragment_template_name"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."fragment_template_name"."__index_templates_v2kw2euldh" IS 'the index of the family ReferringDocument.templates';

COMMENT ON COLUMN "qti"."fragment_template_name"."__predecessor_templates_nc6jzzxv73" IS 'the predecessor of the index of the family ReferringDocument.templates';

COMMENT ON COLUMN "qti"."fragment_template_ref"."__copy_templates_k5hlr5akya" IS 'the owner''s count of the family FragmentScope.templates';

COMMENT ON COLUMN "qti"."fragment_template_ref"."__image_identifier_sp263ko24n" IS 'the textDigest image of identifier';

COMMENT ON COLUMN "qti"."fragment_template_ref"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."fragment_template_ref"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."fragment_template_ref"."__index_templates_tyl4zqwugp" IS 'the index of the family FragmentScope.templates';

COMMENT ON COLUMN "qti"."fragment_template_ref"."__predecessor_templates_phvu6yyk7k" IS 'the predecessor of the index of the family FragmentScope.templates';

COMMENT ON COLUMN "qti"."header_token"."__copy_tokens_vmvzbmawj6" IS 'the owner''s count of the family CellHeaders.tokens';

COMMENT ON COLUMN "qti"."header_token"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."header_token"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."header_token"."__image_pieces_after_nxvecwbwoy" IS 'the textDigest image of piecesAfter';

COMMENT ON COLUMN "qti"."header_token"."__image_pieces_was_qr42vzdoqq" IS 'the textDigest image of piecesWas';

COMMENT ON COLUMN "qti"."header_token"."__image_token_arko66iuth" IS 'the textDigest image of token';

COMMENT ON COLUMN "qti"."header_token"."__pred_at_xktcobhsti" IS 'pred(at)';

COMMENT ON COLUMN "qti"."hottext"."__copy_hottexts_b24kbb6m65" IS 'the owner''s count of the family Document.hottexts';

COMMENT ON COLUMN "qti"."hottext"."__image_identifier_sp263ko24n" IS 'the textDigest image of identifier';

COMMENT ON COLUMN "qti"."hottext"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."hottext"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."hottext"."__index_hottexts_huxv2shciv" IS 'the index of the family Document.hottexts';

COMMENT ON COLUMN "qti"."hottext"."__predecessor_hottexts_imqsc5w56i" IS 'the predecessor of the index of the family Document.hottexts';

COMMENT ON COLUMN "qti"."identity_text"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."identity_text"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."identity_text"."__image_token_text_eg2a7htxbl" IS 'the textDigest image of tokenText';

COMMENT ON COLUMN "qti"."identity_text"."__pred_tokens_ip7mlgrtju" IS 'pred(tokens)';

COMMENT ON COLUMN "qti"."idref"."__copy_idrefs_tkyc3atjbb" IS 'the owner''s count of the family Attribute.idrefs';

COMMENT ON COLUMN "qti"."idref"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."idref"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."idref"."__image_pieces_after_nxvecwbwoy" IS 'the textDigest image of piecesAfter';

COMMENT ON COLUMN "qti"."idref"."__image_pieces_was_qr42vzdoqq" IS 'the textDigest image of piecesWas';

COMMENT ON COLUMN "qti"."idref"."__image_token_arko66iuth" IS 'the textDigest image of token';

COMMENT ON COLUMN "qti"."idref"."__pred_at_xktcobhsti" IS 'pred(at)';

COMMENT ON COLUMN "qti"."idref_target"."__copy_idref_targets_nn7nlmtms6" IS 'the owner''s count of the family Document.idrefTargets';

COMMENT ON COLUMN "qti"."idref_target"."__image_id_cggscgoxcc" IS 'the textDigest image of id';

COMMENT ON COLUMN "qti"."idref_target"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."idref_target"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."idref_target"."__index_idref_targets_hoxb6lgv75" IS 'the index of the family Document.idrefTargets';

COMMENT ON COLUMN "qti"."idref_target"."__predecessor_idref_targets_3a7kfrknym" IS 'the predecessor of the index of the family Document.idrefTargets';

COMMENT ON COLUMN "qti"."instance"."__copy_instances_o6jtftfowj" IS 'the owner''s count of the family AssembledDocument.instances';

COMMENT ON COLUMN "qti"."instance"."__copy_children_x6kra4he2y" IS 'the owner''s count of the family Instance.children';

COMMENT ON COLUMN "qti"."instance"."__index_instances_x7qgj6n3ho" IS 'the index of the family AssembledDocument.instances';

COMMENT ON COLUMN "qti"."instance"."__predecessor_instances_wr47uilqlc" IS 'the predecessor of the index of the family AssembledDocument.instances';

COMMENT ON COLUMN "qti"."instance"."__package_capwbknxpj" IS 'package where {"kind":"compare","left":{"field":"start","kind":"field"},"op":"eq","right":{"kind":"literal","value":"~n:0"}}';

COMMENT ON COLUMN "qti"."instance"."__package_y55am5j6k6" IS 'package where {"kind":"compare","left":{"field":"start","kind":"field"},"op":"gt","right":{"kind":"literal","value":"~n:0"}}';

COMMENT ON COLUMN "qti"."instance"."__parent_l4ckjnvwat" IS 'parent where {"kind":"compare","left":{"field":"start","kind":"field"},"op":"gt","right":{"kind":"literal","value":"~n:0"}}';

COMMENT ON COLUMN "qti"."instance"."__pred_at_xktcobhsti" IS 'pred(at)';

COMMENT ON COLUMN "qti"."instance"."__pred_bindings_4jwvqtioeb" IS 'pred(bindings)';

COMMENT ON COLUMN "qti"."instance"."__pred_children_nrfpkqcaen" IS 'pred(children)';

COMMENT ON COLUMN "qti"."instance"."__pred_choices_w4bygwsb7b" IS 'pred(choices)';

COMMENT ON COLUMN "qti"."instance"."__pred_hottexts_qwkebxoneh" IS 'pred(hottexts)';

COMMENT ON COLUMN "qti"."instance"."__pred_idref_targets_2hmjkyp3ck" IS 'pred(idrefTargets)';

COMMENT ON COLUMN "qti"."instance"."__pred_ids_wdsabmqjb7" IS 'pred(ids)';

COMMENT ON COLUMN "qti"."instance"."__pred_variables_hofq62ycc6" IS 'pred(variables)';

COMMENT ON COLUMN "qti"."interaction"."__pred_choices_w4bygwsb7b" IS 'pred(choices)';

COMMENT ON COLUMN "qti"."interaction"."__pred_module_forms_c2s5pqvqs7" IS 'pred(moduleForms)';

COMMENT ON COLUMN "qti"."interaction_attribute"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."interaction_attribute"."__image_value_dmndzoe5g5" IS 'the textDigest image of value';

COMMENT ON COLUMN "qti"."interaction_attribute"."__image_package_exckv5jfmt" IS 'the textDigest image of package where {"arg":{"arg":{"field":"rootKind","kind":"field"},"kind":"in","values":["qti-assessment-item","qti-assessment-test"]},"kind":"not"} and {"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-associable-hotspot","qti-gap","qti-gap-img","qti-gap-text","qti-hotspot-choice","qti-hottext","qti-inline-choice","qti-simple-associable-choice","qti-simple-choice","qti-template-block","qti-template-block.rubric","qti-template-inline","qti-template-inline.rubric","qti-template-variable"]} and {"args":[{"field":"value","kind":"field"},{"kind":"literal","value":{"pattern":"1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5"}}],"fn":"matches","kind":"compute"} and {"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"template-identifier"}}';

COMMENT ON COLUMN "qti"."interaction_attribute"."__image_package_ty3wsixbgo" IS 'the textDigest image of package where {"arg":{"arg":{"field":"rootKind","kind":"field"},"kind":"in","values":["qti-assessment-item","qti-assessment-test"]},"kind":"not"} and {"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-feedback-block","qti-feedback-block.template","qti-feedback-inline","qti-modal-feedback","qti-test-feedback"]} and {"args":[{"field":"value","kind":"field"},{"kind":"literal","value":{"pattern":"1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5"}}],"fn":"matches","kind":"compute"} and {"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"outcome-identifier"}}';

COMMENT ON COLUMN "qti"."interaction_attribute"."__image_package_jpnodyqj4e" IS 'the textDigest image of package where {"arg":{"arg":{"field":"rootKind","kind":"field"},"kind":"in","values":["qti-assessment-item","qti-assessment-test"]},"kind":"not"} and {"args":[{"args":[{"arg":{"field":"name","kind":"field"},"kind":"in","values":["base","index"]},{"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"qti-printed-variable"}}],"kind":"and"},{"args":[{"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"qti-printed-variable"}},{"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"identifier"}}],"kind":"and"}],"kind":"or"} and {"args":[{"field":"value","kind":"field"},{"kind":"literal","value":{"pattern":"1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5"}}],"fn":"matches","kind":"compute"}';

COMMENT ON COLUMN "qti"."interaction_attribute"."__image_package_nyr6mqgwus" IS 'the textDigest image of package where {"arg":{"arg":{"field":"rootKind","kind":"field"},"kind":"in","values":["qti-assessment-item","qti-assessment-test"]},"kind":"not"} and {"args":[{"field":"value","kind":"field"},{"kind":"literal","value":{"pattern":"1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5"}}],"fn":"matches","kind":"compute"} and {"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"qti-context-variable"}} and {"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"identifier"}}';

COMMENT ON COLUMN "qti"."interaction_attribute"."__image_package_ibdsk7qumz" IS 'the textDigest image of package where {"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-associable-hotspot","qti-gap","qti-gap-img","qti-gap-text","qti-hotspot-choice","qti-hottext","qti-inline-choice","qti-simple-associable-choice","qti-simple-choice","qti-template-block","qti-template-block.rubric","qti-template-inline","qti-template-inline.rubric","qti-template-variable"]} and {"arg":{"field":"rootKind","kind":"field"},"kind":"in","values":["qti-assessment-item","qti-assessment-test"]} and {"args":[{"field":"value","kind":"field"},{"kind":"literal","value":{"pattern":"1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5"}}],"fn":"matches","kind":"compute"} and {"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"template-identifier"}}';

COMMENT ON COLUMN "qti"."interaction_attribute"."__image_package_lr7wlxhost" IS 'the textDigest image of package where {"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-associate-interaction","qti-choice-interaction","qti-custom-interaction","qti-drawing-interaction","qti-end-attempt-interaction","qti-extended-text-interaction","qti-gap-match-interaction","qti-graphic-associate-interaction","qti-graphic-gap-match-interaction","qti-graphic-order-interaction","qti-hotspot-interaction","qti-hottext-interaction","qti-inline-choice-interaction","qti-match-interaction","qti-media-interaction","qti-order-interaction","qti-portable-custom-interaction","qti-position-object-interaction","qti-select-point-interaction","qti-slider-interaction","qti-text-entry-interaction","qti-upload-interaction"]} and {"arg":{"field":"name","kind":"field"},"kind":"in","values":["response-identifier","string-identifier"]} and {"args":[{"field":"value","kind":"field"},{"kind":"literal","value":{"pattern":"1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5"}}],"fn":"matches","kind":"compute"}';

COMMENT ON COLUMN "qti"."interaction_attribute"."__image_package_5bjgttgjue" IS 'the textDigest image of package where {"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-associate-interaction","qti-choice-interaction","qti-custom-interaction","qti-drawing-interaction","qti-end-attempt-interaction","qti-extended-text-interaction","qti-gap-match-interaction","qti-graphic-associate-interaction","qti-graphic-gap-match-interaction","qti-graphic-order-interaction","qti-hotspot-interaction","qti-hottext-interaction","qti-inline-choice-interaction","qti-match-interaction","qti-media-interaction","qti-order-interaction","qti-portable-custom-interaction","qti-position-object-interaction","qti-select-point-interaction","qti-slider-interaction","qti-text-entry-interaction","qti-upload-interaction"]} and {"arg":{"field":"name","kind":"field"},"kind":"in","values":["response-identifier","string-identifier"]} and {"args":[{"field":"value","kind":"field"},{"kind":"literal","value":{"pattern":"1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5"}}],"fn":"matches","kind":"compute"} and {"kind":"compare","left":{"field":"rootKind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"qti-assessment-item"}}';

COMMENT ON COLUMN "qti"."interaction_attribute"."__image_package_k2gcvxo2zg" IS 'the textDigest image of package where {"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-feedback-block","qti-feedback-block.template","qti-feedback-inline","qti-modal-feedback","qti-test-feedback"]} and {"arg":{"field":"rootKind","kind":"field"},"kind":"in","values":["qti-assessment-item","qti-assessment-test"]} and {"args":[{"field":"value","kind":"field"},{"kind":"literal","value":{"pattern":"1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5"}}],"fn":"matches","kind":"compute"} and {"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"outcome-identifier"}}';

COMMENT ON COLUMN "qti"."interaction_attribute"."__image_package_uxpxcua7wm" IS 'the textDigest image of package where {"arg":{"field":"rootKind","kind":"field"},"kind":"in","values":["qti-assessment-item","qti-assessment-test"]} and {"args":[{"args":[{"arg":{"field":"name","kind":"field"},"kind":"in","values":["base","index"]},{"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"qti-printed-variable"}}],"kind":"and"},{"args":[{"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"qti-printed-variable"}},{"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"identifier"}}],"kind":"and"}],"kind":"or"} and {"args":[{"field":"value","kind":"field"},{"kind":"literal","value":{"pattern":"1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5"}}],"fn":"matches","kind":"compute"}';

COMMENT ON COLUMN "qti"."interaction_attribute"."__image_package_7tsrkngiba" IS 'the textDigest image of package where {"arg":{"field":"rootKind","kind":"field"},"kind":"in","values":["qti-assessment-item","qti-assessment-test"]} and {"args":[{"field":"value","kind":"field"},{"kind":"literal","value":{"pattern":"1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5"}}],"fn":"matches","kind":"compute"} and {"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"qti-context-variable"}} and {"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"identifier"}}';

COMMENT ON COLUMN "qti"."interaction_attribute"."__package_baq2s5ijok" IS 'package where {"arg":{"field":"value","kind":"field"},"kind":"in","values":["1","true"]} and {"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"qti-assessment-item"}} and {"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"adaptive"}}';

COMMENT ON COLUMN "qti"."literal"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."literal"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."literal"."__image_text_nik2jnknxc" IS 'the textDigest image of text';

COMMENT ON COLUMN "qti"."literal_typed"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."literal_typed"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."literal_typed"."__image_text_nik2jnknxc" IS 'the textDigest image of text';

COMMENT ON COLUMN "qti"."math_align_group"."__tag_state_open_hbfhgrpnnf" IS 'tag MathAlignScope.state = open';

COMMENT ON COLUMN "qti"."math_align_group"."__tag_kind_m_maligngroup_u3ce3cx7aa" IS 'tag Node.kind = m:maligngroup';

COMMENT ON COLUMN "qti"."math_align_group"."__copy_groups_stk5ekuyip" IS 'the owner''s count of the family MathCell.groups';

COMMENT ON COLUMN "qti"."math_align_group"."__index_groups_ybwzwddeng" IS 'the index of the family MathCell.groups';

COMMENT ON COLUMN "qti"."math_align_group"."__predecessor_groups_6xj7n2r25s" IS 'the predecessor of the index of the family MathCell.groups';

COMMENT ON COLUMN "qti"."math_cell"."__pred_groups_vcil4lo3j4" IS 'pred(groups)';

COMMENT ON COLUMN "qti"."math_cell"."__pred_leaves_oeq7eporgz" IS 'pred(leaves)';

COMMENT ON COLUMN "qti"."math_cn"."__pred_parts_32uebfen7t" IS 'pred(parts)';

COMMENT ON COLUMN "qti"."named"."__image_identifier_sp263ko24n" IS 'the textDigest image of identifier';

COMMENT ON COLUMN "qti"."named"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."named"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."node"."__after_children_0_vmaftea6hj" IS 'the accumulator after plane 0 of the fold __node_children_count_fold_fmibs64zod over the family Node.children';

COMMENT ON COLUMN "qti"."node"."__after_children_0_qbioc6jbat" IS 'the accumulator after plane 0 of the fold __node_children_count_fold_mue4fqjorm over the family Node.children';

COMMENT ON COLUMN "qti"."node"."__before_children_0_qdvwmuycyh" IS 'the accumulator before plane 0 of the fold __node_children_count_fold_fmibs64zod over the family Node.children';

COMMENT ON COLUMN "qti"."node"."__before_children_0_bs3zgzsr7j" IS 'the accumulator before plane 0 of the fold __node_children_count_fold_mue4fqjorm over the family Node.children';

COMMENT ON COLUMN "qti"."node"."__copy_children_tityo5ij5l" IS 'the owner''s count of the family Node.children';

COMMENT ON COLUMN "qti"."node"."__image_chars_after_5ip2qmnum4" IS 'the textDigest image of charsAfter';

COMMENT ON COLUMN "qti"."node"."__image_chars_was_ygtd7siug2" IS 'the textDigest image of charsWas';

COMMENT ON COLUMN "qti"."node"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."node"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."node"."__image_string_value_fromrjgqg2" IS 'the textDigest image of stringValue';

COMMENT ON COLUMN "qti"."node"."__package_3taa5kijgy" IS 'package where {"arg":{"arg":{"field":"kind","kind":"field"},"kind":"in","values":["comment","doctype","document","entityRef","pi","text","ws"]},"kind":"not"} and {"kind":"compare","left":{"args":[{"args":[{"field":"state","kind":"field"}],"fn":"singleton","kind":"compute"},{"args":[{"field":"parentKind","kind":"field"}],"kind":"closedRow","relation":"Capped"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}} and {"kind":"compare","left":{"field":"start","kind":"field"},"op":"gt","right":{"kind":"literal","value":"~n:0"}}';

COMMENT ON COLUMN "qti"."node"."__package_p5yblwgnua" IS 'package where {"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-associate-interaction","qti-choice-interaction","qti-custom-interaction","qti-drawing-interaction","qti-end-attempt-interaction","qti-extended-text-interaction","qti-gap-match-interaction","qti-graphic-associate-interaction","qti-graphic-gap-match-interaction","qti-graphic-order-interaction","qti-hotspot-interaction","qti-hottext-interaction","qti-inline-choice-interaction","qti-match-interaction","qti-media-interaction","qti-order-interaction","qti-portable-custom-interaction","qti-position-object-interaction","qti-select-point-interaction","qti-slider-interaction","qti-text-entry-interaction","qti-upload-interaction"]} and {"kind":"compare","left":{"args":[{"field":"ancestry","kind":"field"},{"args":[{"kind":"literal","value":"qti-feedback-block"}],"kind":"closedRow","relation":"Enters"}],"fn":"disjoint","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}}';

COMMENT ON COLUMN "qti"."node"."__package_pzlq2bwqm3" IS 'package where {"kind":"compare","left":{"args":[{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"kind":"literal","value":"baseType"}],"field":"slot","kind":"closedAt","relation":"AttributeGrammar"}],"fn":"singleton","kind":"compute"},{"field":"attrs","kind":"field"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}} and {"kind":"compare","left":{"args":[{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"kind":"literal","value":"fieldIdentifier"}],"field":"slot","kind":"closedAt","relation":"AttributeGrammar"}],"fn":"singleton","kind":"compute"},{"field":"attrs","kind":"field"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}} and {"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"ud:value"}}';

COMMENT ON COLUMN "qti"."node"."__package_lqgfkydq7q" IS 'package where {"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"qti-interaction-modules"}} and {"kind":"compare","left":{"field":"parentKind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"qti-portable-custom-interaction"}}';

COMMENT ON COLUMN "qti"."node"."__parent_l4ckjnvwat" IS 'parent where {"kind":"compare","left":{"field":"start","kind":"field"},"op":"gt","right":{"kind":"literal","value":"~n:0"}}';

COMMENT ON COLUMN "qti"."node"."__pred_at_xktcobhsti" IS 'pred(at)';

COMMENT ON COLUMN "qti"."node"."__pred_attributes_aghx2cqr7s" IS 'pred(attributes)';

COMMENT ON COLUMN "qti"."node"."__pred_children_nrfpkqcaen" IS 'pred(children)';

COMMENT ON COLUMN "qti"."node"."__pred_open_attributes_4pd7mwzpyg" IS 'pred(openAttributes)';

COMMENT ON COLUMN "qti"."numbered_reading"."__image_assembly_4bpgdwmchu" IS 'the textDigest image of assembly';

COMMENT ON COLUMN "qti"."numbered_reading"."__image_number_6nbw63u3ji" IS 'the textDigest image of number';

COMMENT ON COLUMN "qti"."numbered_reading"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."numbered_reading"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."open_attribute"."__copy_open_attributes_fpnvcvdmpf" IS 'the owner''s count of the family Node.openAttributes';

COMMENT ON COLUMN "qti"."open_attribute"."__index_open_attributes_hgy2tjkow2" IS 'the index of the family Node.openAttributes';

COMMENT ON COLUMN "qti"."open_attribute"."__predecessor_open_attributes_rrtw7d24a5" IS 'the predecessor of the index of the family Node.openAttributes';

COMMENT ON COLUMN "qti"."pci_module_form"."__copy_module_forms_hwpic65mty" IS 'the owner''s count of the family Interaction.moduleForms';

COMMENT ON COLUMN "qti"."pci_module_form"."__index_module_forms_wydm354elh" IS 'the index of the family Interaction.moduleForms';

COMMENT ON COLUMN "qti"."pci_module_form"."__predecessor_module_forms_dauym75voc" IS 'the predecessor of the index of the family Interaction.moduleForms';

COMMENT ON COLUMN "qti"."placed_binding"."__copy_bindings_i7fid7zclc" IS 'the owner''s count of the family Instance.bindings';

COMMENT ON COLUMN "qti"."placed_binding"."__image_assembly_4bpgdwmchu" IS 'the textDigest image of assembly';

COMMENT ON COLUMN "qti"."placed_binding"."__image_identifier_sp263ko24n" IS 'the textDigest image of identifier';

COMMENT ON COLUMN "qti"."placed_binding"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."placed_binding"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."placed_binding"."__index_bindings_oyr3fiahr3" IS 'the index of the family Instance.bindings';

COMMENT ON COLUMN "qti"."placed_binding"."__predecessor_bindings_ntcwoepfst" IS 'the predecessor of the index of the family Instance.bindings';

COMMENT ON COLUMN "qti"."placed_binding"."__package_pyofn3cand" IS 'package where {"kind":"compare","left":{"field":"adaptive","kind":"field"},"op":"eq","right":{"kind":"literal","value":false}} and {"kind":"compare","left":{"field":"attribute","kind":"field"},"op":"eq","right":{"kind":"literal","value":"response-identifier"}}';

COMMENT ON COLUMN "qti"."placed_choice"."__copy_choices_wxxtuahand" IS 'the owner''s count of the family Instance.choices';

COMMENT ON COLUMN "qti"."placed_choice"."__image_identifier_sp263ko24n" IS 'the textDigest image of identifier';

COMMENT ON COLUMN "qti"."placed_choice"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."placed_choice"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."placed_choice"."__index_choices_ktdrfnqsrr" IS 'the index of the family Instance.choices';

COMMENT ON COLUMN "qti"."placed_choice"."__predecessor_choices_uwibywwdhh" IS 'the predecessor of the index of the family Instance.choices';

COMMENT ON COLUMN "qti"."placed_hottext"."__copy_hottexts_md2dcayyk4" IS 'the owner''s count of the family Instance.hottexts';

COMMENT ON COLUMN "qti"."placed_hottext"."__image_assembly_4bpgdwmchu" IS 'the textDigest image of assembly';

COMMENT ON COLUMN "qti"."placed_hottext"."__image_identifier_sp263ko24n" IS 'the textDigest image of identifier';

COMMENT ON COLUMN "qti"."placed_hottext"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."placed_hottext"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."placed_hottext"."__index_hottexts_tdyulq7odh" IS 'the index of the family Instance.hottexts';

COMMENT ON COLUMN "qti"."placed_hottext"."__predecessor_hottexts_4uwo3bx7x2" IS 'the predecessor of the index of the family Instance.hottexts';

COMMENT ON COLUMN "qti"."placed_id"."__copy_ids_tljj3gujvw" IS 'the owner''s count of the family Instance.ids';

COMMENT ON COLUMN "qti"."placed_id"."__index_ids_ojwjtnxm2y" IS 'the index of the family Instance.ids';

COMMENT ON COLUMN "qti"."placed_id"."__predecessor_ids_rtodazzhin" IS 'the predecessor of the index of the family Instance.ids';

COMMENT ON COLUMN "qti"."placed_idref"."__copy_idref_targets_cv65ds7nu7" IS 'the owner''s count of the family Instance.idrefTargets';

COMMENT ON COLUMN "qti"."placed_idref"."__image_assembly_4bpgdwmchu" IS 'the textDigest image of assembly';

COMMENT ON COLUMN "qti"."placed_idref"."__image_id_cggscgoxcc" IS 'the textDigest image of id';

COMMENT ON COLUMN "qti"."placed_idref"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."placed_idref"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."placed_idref"."__index_idref_targets_fjkkfgwwk3" IS 'the index of the family Instance.idrefTargets';

COMMENT ON COLUMN "qti"."placed_idref"."__predecessor_idref_targets_rgsj76jpds" IS 'the predecessor of the index of the family Instance.idrefTargets';

COMMENT ON COLUMN "qti"."placed_share_target"."__copy_placements_iadanzgnox" IS 'the owner''s count of the family ShareFragment.placements';

COMMENT ON COLUMN "qti"."placed_share_target"."__image_id_cggscgoxcc" IS 'the textDigest image of id';

COMMENT ON COLUMN "qti"."placed_share_target"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."placed_share_target"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."placed_share_target"."__imagecopy_id_yb43zw5kj3" IS 'the textDigest image of id the family ShareFragment.placements carries onto its members';

COMMENT ON COLUMN "qti"."placed_share_target"."__imagecopy_package_4oudcg2ick" IS 'the textDigest image of package the family ShareFragment.placements carries onto its members';

COMMENT ON COLUMN "qti"."placed_share_target"."__imagecopy_path_2uz6mcb5mg" IS 'the textDigest image of path the family ShareFragment.placements carries onto its members';

COMMENT ON COLUMN "qti"."placed_share_target"."__index_placements_n77jrjkfw2" IS 'the index of the family ShareFragment.placements';

COMMENT ON COLUMN "qti"."placed_share_target"."__predecessor_placements_ppbi3jzzws" IS 'the predecessor of the index of the family ShareFragment.placements';

COMMENT ON COLUMN "qti"."placed_variable_ref"."__copy_variables_wwybb3cjse" IS 'the owner''s count of the family Instance.variables';

COMMENT ON COLUMN "qti"."placed_variable_ref"."__image_identifier_sp263ko24n" IS 'the textDigest image of identifier';

COMMENT ON COLUMN "qti"."placed_variable_ref"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."placed_variable_ref"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."placed_variable_ref"."__index_variables_efcmle332h" IS 'the index of the family Instance.variables';

COMMENT ON COLUMN "qti"."placed_variable_ref"."__predecessor_variables_5pxq25fpsp" IS 'the predecessor of the index of the family Instance.variables';

COMMENT ON COLUMN "qti"."printed_variable_ref"."__image_identifier_sp263ko24n" IS 'the textDigest image of identifier';

COMMENT ON COLUMN "qti"."printed_variable_ref"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."printed_variable_ref"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."referring_document"."__pred_contexts_leteqrd4bu" IS 'pred(contexts)';

COMMENT ON COLUMN "qti"."referring_document"."__pred_feedbacks_c2txublcan" IS 'pred(feedbacks)';

COMMENT ON COLUMN "qti"."referring_document"."__pred_prints_uwxz5ocwj4" IS 'pred(prints)';

COMMENT ON COLUMN "qti"."referring_document"."__pred_templates_5bo5q45wjw" IS 'pred(templates)';

COMMENT ON COLUMN "qti"."rounding_figures"."__image_figures_sc25qjl32r" IS 'the textDigest image of figures';

COMMENT ON COLUMN "qti"."rounding_figures"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."rounding_figures"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."rounding_mode_figures"."__image_figures_sc25qjl32r" IS 'the textDigest image of figures';

COMMENT ON COLUMN "qti"."rounding_mode_figures"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."rounding_mode_figures"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."share_fragment"."__image_id_cggscgoxcc" IS 'the textDigest image of id';

COMMENT ON COLUMN "qti"."share_fragment"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."share_fragment"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."share_fragment"."__pred_placements_wtijf47h4h" IS 'pred(placements)';

COMMENT ON COLUMN "qti"."site_target"."__after_targets_0_nsiq3pfnvg" IS 'the accumulator after plane 0 of the fold __assembled_document_targets_count_fold_gzgl372iau over the family AssembledDocument.targets';

COMMENT ON COLUMN "qti"."site_target"."__after_targeted_by_0_rsywbgrrjw" IS 'the accumulator after plane 0 of the fold __document_targeted_by_or_fold_q6g4eocaf6 over the family Document.targetedBy';

COMMENT ON COLUMN "qti"."site_target"."__before_targets_0_lktd4cazrk" IS 'the accumulator before plane 0 of the fold __assembled_document_targets_count_fold_gzgl372iau over the family AssembledDocument.targets';

COMMENT ON COLUMN "qti"."site_target"."__before_targeted_by_0_3lfv2ygldm" IS 'the accumulator before plane 0 of the fold __document_targeted_by_or_fold_q6g4eocaf6 over the family Document.targetedBy';

COMMENT ON COLUMN "qti"."site_target"."__copy_targets_xc5togcb7o" IS 'the owner''s count of the family AssembledDocument.targets';

COMMENT ON COLUMN "qti"."site_target"."__copy_targeted_by_dnrpkr6fx2" IS 'the owner''s count of the family Document.targetedBy';

COMMENT ON COLUMN "qti"."site_target"."__index_targets_i7nnrmzfkn" IS 'the index of the family AssembledDocument.targets';

COMMENT ON COLUMN "qti"."site_target"."__index_targeted_by_zcbbdfk6qk" IS 'the index of the family Document.targetedBy';

COMMENT ON COLUMN "qti"."site_target"."__predecessor_targets_rlmzypy6bt" IS 'the predecessor of the index of the family AssembledDocument.targets';

COMMENT ON COLUMN "qti"."site_target"."__predecessor_targeted_by_xvlpywmmd3" IS 'the predecessor of the index of the family Document.targetedBy';

COMMENT ON COLUMN "qti"."srcset"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."srcset"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."srcset"."__image_token_text_eg2a7htxbl" IS 'the textDigest image of tokenText';

COMMENT ON COLUMN "qti"."srcset"."__pred_tokens_ip7mlgrtju" IS 'pred(tokens)';

COMMENT ON COLUMN "qti"."srcset_candidate"."__copy_tokens_mhv3zj45jr" IS 'the owner''s count of the family Srcset.tokens';

COMMENT ON COLUMN "qti"."srcset_candidate"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."srcset_candidate"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."srcset_candidate"."__image_pieces_after_nxvecwbwoy" IS 'the textDigest image of piecesAfter';

COMMENT ON COLUMN "qti"."srcset_candidate"."__image_pieces_was_qr42vzdoqq" IS 'the textDigest image of piecesWas';

COMMENT ON COLUMN "qti"."srcset_candidate"."__pred_at_xktcobhsti" IS 'pred(at)';

COMMENT ON COLUMN "qti"."stimulus_ref"."__image_identifier_sp263ko24n" IS 'the textDigest image of identifier';

COMMENT ON COLUMN "qti"."stimulus_ref"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."stimulus_ref"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."template_ref"."__image_identifier_sp263ko24n" IS 'the textDigest image of identifier';

COMMENT ON COLUMN "qti"."template_ref"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."template_ref"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."text_idref"."__copy_tokens_rrsly23qzp" IS 'the owner''s count of the family IdentityText.tokens';

COMMENT ON COLUMN "qti"."text_idref"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."text_idref"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."text_idref"."__image_pieces_after_nxvecwbwoy" IS 'the textDigest image of piecesAfter';

COMMENT ON COLUMN "qti"."text_idref"."__image_pieces_was_qr42vzdoqq" IS 'the textDigest image of piecesWas';

COMMENT ON COLUMN "qti"."text_idref"."__image_token_arko66iuth" IS 'the textDigest image of token';

COMMENT ON COLUMN "qti"."text_idref"."__pred_at_xktcobhsti" IS 'pred(at)';

COMMENT ON COLUMN "qti"."tolerance"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."tolerance"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."tolerance"."__image_token_text_eg2a7htxbl" IS 'the textDigest image of tokenText';

COMMENT ON COLUMN "qti"."tolerance"."__pred_tokens_ip7mlgrtju" IS 'pred(tokens)';

COMMENT ON COLUMN "qti"."tolerance_token"."__copy_tokens_zlo7jvsicr" IS 'the owner''s count of the family Tolerance.tokens';

COMMENT ON COLUMN "qti"."tolerance_token"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."tolerance_token"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."tolerance_token"."__image_pieces_after_nxvecwbwoy" IS 'the textDigest image of piecesAfter';

COMMENT ON COLUMN "qti"."tolerance_token"."__image_pieces_was_qr42vzdoqq" IS 'the textDigest image of piecesWas';

COMMENT ON COLUMN "qti"."tolerance_token"."__pred_at_xktcobhsti" IS 'pred(at)';

COMMENT ON COLUMN "qti"."usage_value"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."usage_value"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."usage_value"."__image_text_nik2jnknxc" IS 'the textDigest image of text';

COMMENT ON COLUMN "qti"."usage_value_base_type"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."usage_value_base_type"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."usage_value_base_type"."__image_text_nik2jnknxc" IS 'the textDigest image of text';

COMMENT ON COLUMN "qti"."variable_ref"."__copy_variables_7dc76fdnq4" IS 'the owner''s count of the family Document.variables';

COMMENT ON COLUMN "qti"."variable_ref"."__image_identifier_sp263ko24n" IS 'the textDigest image of identifier';

COMMENT ON COLUMN "qti"."variable_ref"."__image_package_x4j5zex3fr" IS 'the textDigest image of package';

COMMENT ON COLUMN "qti"."variable_ref"."__image_path_ff7ysgcuo3" IS 'the textDigest image of path';

COMMENT ON COLUMN "qti"."variable_ref"."__index_variables_7hpd35redf" IS 'the index of the family Document.variables';

COMMENT ON COLUMN "qti"."variable_ref"."__predecessor_variables_bn3p347xvh" IS 'the predecessor of the index of the family Document.variables';

COMMENT ON CONSTRAINT "__assembled_catalog_pk_b5tgxmgzjo" ON "qti"."assembled_catalog" IS 'primary key of AssembledCatalog';

COMMENT ON CONSTRAINT "__idref_target_pk_jsj2m7b4kd" ON "qti"."idref_target" IS 'primary key of IdrefTarget';

COMMENT ON CONSTRAINT "__numbered_reading_pk_vrnabdsgjr" ON "qti"."numbered_reading" IS 'primary key of NumberedReading';

COMMENT ON CONSTRAINT "__placed_idref_pk_457qtpabdq" ON "qti"."placed_idref" IS 'primary key of PlacedIdref';

COMMENT ON CONSTRAINT "__attribute_key_package_path_start_index_attributes_6cj6mvsxvm" ON "qti"."attribute" IS 'key Attribute(package, path, start, the index of the family Node.attributes)';

COMMENT ON CONSTRAINT "__attribute_key_package_path_start_index_attributes_7vvrfnxvf7" ON "qti"."attribute" IS 'key Attribute(package, path, start, the index of the family Node.attributes, the accumulator after plane 0 of the fold __node_attributes_or_fold_qjtccpaklg over the family Node.attributes)';

COMMENT ON CONSTRAINT "__attribute_key_package_path_start_predecessor_2x7ppgesjy" ON "qti"."attribute" IS 'key Attribute(package, path, start, the predecessor of the index of the family Node.attributes)';

COMMENT ON CONSTRAINT "__attribute_key_package_path_start_mefsvkm3fq" ON "qti"."attribute" IS 'key Attribute(package where {"args":[{"args":[{"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-interpolation-table","qti-match-table"]},{"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"default-value"}}],"kind":"and"},{"args":[{"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-interpolation-table-entry","qti-match-table-entry"]},{"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"target-value"}}],"kind":"and"}],"kind":"or"}, path, start)';

COMMENT ON CONSTRAINT "__attribute_key_package_path_start_54iub2w3d4" ON "qti"."attribute" IS 'key Attribute(package where {"args":[{"args":[{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"field":"name","kind":"field"}],"field":"domain","kind":"closedAt","relation":"AttributeGrammar"}],"kind":"closedHas","relation":"ValueIdentity"},{"kind":"compare","left":{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"field":"name","kind":"field"}],"field":"domain","kind":"closedAt","relation":"AttributeGrammar"}],"field":"identity","kind":"closedAt","relation":"ValueIdentity"},"op":"eq","right":{"kind":"literal","value":"ID"}}],"kind":"and"},{"args":[{"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"qti-context-declaration"}},{"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"identifier"}}],"kind":"and"}],"kind":"or"}, path, start)';

COMMENT ON CONSTRAINT "__attribute_key_package_path_ooxw5d3335" ON "qti"."attribute" IS 'key Attribute(package where {"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"qti-assessment-item"}} and {"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"tool-name"}}, path)';

COMMENT ON CONSTRAINT "__attribute_key_package_path_pvjib3644a" ON "qti"."attribute" IS 'key Attribute(package where {"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"qti-assessment-item"}} and {"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"tool-version"}}, path)';

COMMENT ON CONSTRAINT "__binding_name_key_package_path_index_bindings_r6nggsduso" ON "qti"."binding_name" IS 'key BindingName(package, path, the index of the family Document.bindings)';

COMMENT ON CONSTRAINT "__binding_name_key_package_path_predecessor_bindings_fxgle54zc2" ON "qti"."binding_name" IS 'key BindingName(package, path, the predecessor of the index of the family Document.bindings)';

COMMENT ON CONSTRAINT "__binding_name_key_image_package_image_path_start_tkesfta3ij" ON "qti"."binding_name" IS 'key BindingName(the textDigest image of package, the textDigest image of path, start, attribute, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__bound_variable_key_image_package_image_path_start_lvpqp25zsl" ON "qti"."bound_variable" IS 'key BoundVariable(the textDigest image of package, the textDigest image of path, start, attribute, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__bound_variable_key_image_package_image_path_image_mrbhbeaqte" ON "qti"."bound_variable" IS 'key BoundVariable(the textDigest image of package, the textDigest image of path, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__catalog_id_key_image_package_image_path_image_id_jo6pv5zzpp" ON "qti"."catalog_id" IS 'key CatalogId(the textDigest image of package, the textDigest image of path, the textDigest image of id)';

COMMENT ON CONSTRAINT "__cell_leaf_key_package_path_cell_pred_at_ypuborqf34" ON "qti"."cell_leaf" IS 'key CellLeaf(package, path, cell, pred(at))';

COMMENT ON CONSTRAINT "__choice_key_package_path_index_choices_nfi2h7amio" ON "qti"."choice" IS 'key Choice(package, path, the index of the family Document.choices)';

COMMENT ON CONSTRAINT "__choice_key_package_path_predecessor_choices_sgzerm3kdb" ON "qti"."choice" IS 'key Choice(package, path, the predecessor of the index of the family Document.choices)';

COMMENT ON CONSTRAINT "__choice_key_image_package_image_path_start_image_fzsmwth3qu" ON "qti"."choice" IS 'key Choice(the textDigest image of package, the textDigest image of path, start, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__choice_interaction_key_package_interaction_path_lqglabumbc" ON "qti"."choice_interaction" IS 'key ChoiceInteraction(package, interactionPath, interaction, the index of the family Interaction.choices)';

COMMENT ON CONSTRAINT "__choice_interaction_key_package_interaction_path_pjrwzmno7q" ON "qti"."choice_interaction" IS 'key ChoiceInteraction(package, interactionPath, interaction, the predecessor of the index of the family Interaction.choices)';

COMMENT ON CONSTRAINT "__cn_part_text_key_package_path_start_index_parts_5vdus42otu" ON "qti"."cn_part_text" IS 'key CnPartText(package, path, start, the index of the family MathCn.parts)';

COMMENT ON CONSTRAINT "__cn_part_text_key_package_path_start_predecessor_sm7ycadrmu" ON "qti"."cn_part_text" IS 'key CnPartText(package, path, start, the predecessor of the index of the family MathCn.parts)';

COMMENT ON CONSTRAINT "__cn_slot_key_package_path_start_index_parts_dbqcjcnaam" ON "qti"."cn_slot" IS 'key CnSlot(package, path, start, the index of the family CnCount.parts)';

COMMENT ON CONSTRAINT "__cn_slot_key_package_path_start_predecessor_parts_6cbqntaxth" ON "qti"."cn_slot" IS 'key CnSlot(package, path, start, the predecessor of the index of the family CnCount.parts)';

COMMENT ON CONSTRAINT "__context_ref_key_image_package_image_path_start_fgiskttgvh" ON "qti"."context_ref" IS 'key ContextRef(the textDigest image of package, the textDigest image of path, start, attribute, kind, assemblyKind, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__data_ssml_member_key_image_package_image_path_azwy4ica7y" ON "qti"."data_ssml_member" IS 'key DataSsmlMember(the textDigest image of package, the textDigest image of path, start, at, the textDigest image of member)';

COMMENT ON CONSTRAINT "__document_id_key_package_path_index_ids_sf63vjwwfz" ON "qti"."document_id" IS 'key DocumentId(package, path, the index of the family Document.ids)';

COMMENT ON CONSTRAINT "__document_id_key_package_path_predecessor_ids_sojprelbuz" ON "qti"."document_id" IS 'key DocumentId(package, path, the predecessor of the index of the family Document.ids)';

COMMENT ON CONSTRAINT "__feedback_ref_key_image_package_image_path_start_hxasaugwry" ON "qti"."feedback_ref" IS 'key FeedbackRef(the textDigest image of package, the textDigest image of path, start, attribute, kind, assemblyKind, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__fragment_context_name_key_package_path_index_vcva7sy76v" ON "qti"."fragment_context_name" IS 'key FragmentContextName(package, path, the index of the family ReferringDocument.contexts)';

COMMENT ON CONSTRAINT "__fragment_context_name_key_package_path_predecessor_4ip2dcv7tx" ON "qti"."fragment_context_name" IS 'key FragmentContextName(package, path, the predecessor of the index of the family ReferringDocument.contexts)';

COMMENT ON CONSTRAINT "__fragment_context_name_key_image_package_image_path_3mp6wrb6ag" ON "qti"."fragment_context_name" IS 'key FragmentContextName(the textDigest image of package, the textDigest image of path, start, attribute, kind, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__fragment_context_ref_key_package_assembly_instance_iwwx7fd3as" ON "qti"."fragment_context_ref" IS 'key FragmentContextRef(package, assembly, instance, the index of the family FragmentScope.contexts)';

COMMENT ON CONSTRAINT "__fragment_context_ref_key_package_assembly_instance_pj73zlykcq" ON "qti"."fragment_context_ref" IS 'key FragmentContextRef(package, assembly, instance, the predecessor of the index of the family FragmentScope.contexts)';

COMMENT ON CONSTRAINT "__fragment_feedback_name_key_package_path_index_ptaf4a5rcy" ON "qti"."fragment_feedback_name" IS 'key FragmentFeedbackName(package, path, the index of the family ReferringDocument.feedbacks)';

COMMENT ON CONSTRAINT "__fragment_feedback_name_key_package_path_hihn4nkoij" ON "qti"."fragment_feedback_name" IS 'key FragmentFeedbackName(package, path, the predecessor of the index of the family ReferringDocument.feedbacks)';

COMMENT ON CONSTRAINT "__fragment_feedback_name_key_image_package_image_nytmlzi4mh" ON "qti"."fragment_feedback_name" IS 'key FragmentFeedbackName(the textDigest image of package, the textDigest image of path, start, attribute, kind, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__fragment_feedback_ref_key_package_assembly_hzeb5vdkrv" ON "qti"."fragment_feedback_ref" IS 'key FragmentFeedbackRef(package, assembly, instance, the index of the family FragmentScope.feedbacks)';

COMMENT ON CONSTRAINT "__fragment_feedback_ref_key_package_assembly_4ricrcywdl" ON "qti"."fragment_feedback_ref" IS 'key FragmentFeedbackRef(package, assembly, instance, the predecessor of the index of the family FragmentScope.feedbacks)';

COMMENT ON CONSTRAINT "__fragment_printed_name_key_package_path_index_5eg62qthun" ON "qti"."fragment_printed_name" IS 'key FragmentPrintedName(package, path, the index of the family ReferringDocument.prints)';

COMMENT ON CONSTRAINT "__fragment_printed_name_key_package_path_predecessor_qtow56dwel" ON "qti"."fragment_printed_name" IS 'key FragmentPrintedName(package, path, the predecessor of the index of the family ReferringDocument.prints)';

COMMENT ON CONSTRAINT "__fragment_printed_name_key_image_package_image_path_h2qw6bmfig" ON "qti"."fragment_printed_name" IS 'key FragmentPrintedName(the textDigest image of package, the textDigest image of path, start, attribute, kind, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__fragment_printed_ref_key_package_assembly_instance_tm3cv67vqp" ON "qti"."fragment_printed_ref" IS 'key FragmentPrintedRef(package, assembly, instance, the index of the family FragmentScope.prints)';

COMMENT ON CONSTRAINT "__fragment_printed_ref_key_package_assembly_instance_xutrjap2uj" ON "qti"."fragment_printed_ref" IS 'key FragmentPrintedRef(package, assembly, instance, the predecessor of the index of the family FragmentScope.prints)';

COMMENT ON CONSTRAINT "__fragment_template_name_key_package_path_index_oudiqn53er" ON "qti"."fragment_template_name" IS 'key FragmentTemplateName(package, path, the index of the family ReferringDocument.templates)';

COMMENT ON CONSTRAINT "__fragment_template_name_key_package_path_7nr2kxlss4" ON "qti"."fragment_template_name" IS 'key FragmentTemplateName(package, path, the predecessor of the index of the family ReferringDocument.templates)';

COMMENT ON CONSTRAINT "__fragment_template_name_key_image_package_image_bimhd6igkd" ON "qti"."fragment_template_name" IS 'key FragmentTemplateName(the textDigest image of package, the textDigest image of path, start, attribute, kind, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__fragment_template_ref_key_package_assembly_3vtxoh5dvi" ON "qti"."fragment_template_ref" IS 'key FragmentTemplateRef(package, assembly, instance, the index of the family FragmentScope.templates)';

COMMENT ON CONSTRAINT "__fragment_template_ref_key_package_assembly_ic23um6onc" ON "qti"."fragment_template_ref" IS 'key FragmentTemplateRef(package, assembly, instance, the predecessor of the index of the family FragmentScope.templates)';

COMMENT ON CONSTRAINT "__header_token_key_package_path_start_pred_at_cd75c4zmnj" ON "qti"."header_token" IS 'key HeaderToken(package, path, start, pred(at))';

COMMENT ON CONSTRAINT "__header_token_key_image_package_image_path_start_at_4ohc6rrn6m" ON "qti"."header_token" IS 'key HeaderToken(the textDigest image of package, the textDigest image of path, start, at, the textDigest image of piecesAfter)';

COMMENT ON CONSTRAINT "__header_token_key_image_package_image_path_start_az3b6ssmxg" ON "qti"."header_token" IS 'key HeaderToken(the textDigest image of package, the textDigest image of path, start, the textDigest image of token)';

COMMENT ON CONSTRAINT "__hottext_key_package_path_index_hottexts_24tbfvbp23" ON "qti"."hottext" IS 'key Hottext(package, path, the index of the family Document.hottexts)';

COMMENT ON CONSTRAINT "__hottext_key_package_path_predecessor_hottexts_gpj2hclfyb" ON "qti"."hottext" IS 'key Hottext(package, path, the predecessor of the index of the family Document.hottexts)';

COMMENT ON CONSTRAINT "__hottext_key_image_package_image_path_start_image_xui3bxl7u5" ON "qti"."hottext" IS 'key Hottext(the textDigest image of package, the textDigest image of path, start, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__hottext_key_image_package_image_path_image_6kdtjqiwbz" ON "qti"."hottext" IS 'key Hottext(the textDigest image of package, the textDigest image of path, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__idref_key_package_path_start_name_pred_at_k2gcbywk7v" ON "qti"."idref" IS 'key Idref(package, path, start, name, pred(at))';

COMMENT ON CONSTRAINT "__idref_key_image_package_image_path_start_name_at_guizkv6zg2" ON "qti"."idref" IS 'key Idref(the textDigest image of package, the textDigest image of path, start, name, at, the textDigest image of piecesAfter)';

COMMENT ON CONSTRAINT "__idref_target_key_package_path_index_idref_targets_su7afnim7y" ON "qti"."idref_target" IS 'key IdrefTarget(package, path, the index of the family Document.idrefTargets)';

COMMENT ON CONSTRAINT "__idref_target_key_package_path_predecessor_idref_i4wnpntxzu" ON "qti"."idref_target" IS 'key IdrefTarget(package, path, the predecessor of the index of the family Document.idrefTargets)';

COMMENT ON CONSTRAINT "__instance_key_package_assembly_parent_at_rjuzwko4n2" ON "qti"."instance" IS 'key Instance(package, assembly, parent where {"kind":"compare","left":{"field":"start","kind":"field"},"op":"gt","right":{"kind":"literal","value":"~n:0"}}, at)';

COMMENT ON CONSTRAINT "__instance_key_package_assembly_parent_at_end_lmrwv23lih" ON "qti"."instance" IS 'key Instance(package, assembly, parent where {"kind":"compare","left":{"field":"start","kind":"field"},"op":"gt","right":{"kind":"literal","value":"~n:0"}}, at, end)';

COMMENT ON CONSTRAINT "__instance_key_package_assembly_parent_pred_at_4jeeswzwre" ON "qti"."instance" IS 'key Instance(package, assembly, parent where {"kind":"compare","left":{"field":"start","kind":"field"},"op":"gt","right":{"kind":"literal","value":"~n:0"}}, pred(at))';

COMMENT ON CONSTRAINT "__instance_key_package_document_index_instances_dzkenbo2iw" ON "qti"."instance" IS 'key Instance(package, document, the index of the family AssembledDocument.instances)';

COMMENT ON CONSTRAINT "__instance_key_package_document_predecessor_cq4wbc4ks4" ON "qti"."instance" IS 'key Instance(package, document, the predecessor of the index of the family AssembledDocument.instances)';

COMMENT ON CONSTRAINT "__instance_key_package_document_z4qcwojwcm" ON "qti"."instance" IS 'key Instance(package where {"kind":"compare","left":{"field":"start","kind":"field"},"op":"eq","right":{"kind":"literal","value":"~n:0"}}, document)';

COMMENT ON CONSTRAINT "__instance_key_package_assembly_parent_site_d6xanjcvct" ON "qti"."instance" IS 'key Instance(package where {"kind":"compare","left":{"field":"start","kind":"field"},"op":"gt","right":{"kind":"literal","value":"~n:0"}}, assembly, parent, site)';

COMMENT ON CONSTRAINT "__interaction_attribute_key_package_path_d3uq7hzxwt" ON "qti"."interaction_attribute" IS 'key InteractionAttribute(package where {"arg":{"field":"value","kind":"field"},"kind":"in","values":["1","true"]} and {"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"qti-assessment-item"}} and {"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"adaptive"}}, path)';

COMMENT ON CONSTRAINT "__literal_key_image_package_image_path_start_image_csua32rxru" ON "qti"."literal" IS 'key Literal(the textDigest image of package, the textDigest image of path, start, the textDigest image of text, baseType)';

COMMENT ON CONSTRAINT "__math_align_group_key_package_path_cell_index_cwl2hxhbqs" ON "qti"."math_align_group" IS 'key MathAlignGroup(package, path, cell, the index of the family MathCell.groups)';

COMMENT ON CONSTRAINT "__math_align_group_key_package_path_cell_predecessor_sv7lp335e4" ON "qti"."math_align_group" IS 'key MathAlignGroup(package, path, cell, the predecessor of the index of the family MathCell.groups)';

COMMENT ON CONSTRAINT "__named_key_image_package_image_path_image_j7g47oy6bo" ON "qti"."named" IS 'key Named(the textDigest image of package, the textDigest image of path, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__node_key_package_path_parent_at_nwdop676ro" ON "qti"."node" IS 'key Node(package, path, parent where {"kind":"compare","left":{"field":"start","kind":"field"},"op":"gt","right":{"kind":"literal","value":"~n:0"}}, at)';

COMMENT ON CONSTRAINT "__node_key_package_path_parent_pred_at_e2zyuwfurj" ON "qti"."node" IS 'key Node(package, path, parent where {"kind":"compare","left":{"field":"start","kind":"field"},"op":"gt","right":{"kind":"literal","value":"~n:0"}}, pred(at))';

COMMENT ON CONSTRAINT "__node_key_image_package_image_path_start_image_n7rkgukrvu" ON "qti"."node" IS 'key Node(the textDigest image of package, the textDigest image of path, start, the textDigest image of stringValue)';

COMMENT ON CONSTRAINT "__node_key_image_package_image_path_parent_at_end_zkr2uwgpgd" ON "qti"."node" IS 'key Node(the textDigest image of package, the textDigest image of path, parent where {"kind":"compare","left":{"field":"start","kind":"field"},"op":"gt","right":{"kind":"literal","value":"~n:0"}}, at, end, the accumulator after plane 0 of the fold __node_children_count_fold_mue4fqjorm over the family Node.children, the accumulator after plane 0 of the fold __node_children_count_fold_fmibs64zod over the family Node.children, elements, the textDigest image of charsAfter, state)';

COMMENT ON CONSTRAINT "__node_key_package_path_parent_state_djsbcozcyq" ON "qti"."node" IS 'key Node(package where {"arg":{"arg":{"field":"kind","kind":"field"},"kind":"in","values":["comment","doctype","document","entityRef","pi","text","ws"]},"kind":"not"} and {"kind":"compare","left":{"args":[{"args":[{"field":"state","kind":"field"}],"fn":"singleton","kind":"compute"},{"args":[{"field":"parentKind","kind":"field"}],"kind":"closedRow","relation":"Capped"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}} and {"kind":"compare","left":{"field":"start","kind":"field"},"op":"gt","right":{"kind":"literal","value":"~n:0"}}, path, parent, state)';

COMMENT ON CONSTRAINT "__node_key_package_path_start_dn7spvnjad" ON "qti"."node" IS 'key Node(package where {"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-associate-interaction","qti-choice-interaction","qti-custom-interaction","qti-drawing-interaction","qti-end-attempt-interaction","qti-extended-text-interaction","qti-gap-match-interaction","qti-graphic-associate-interaction","qti-graphic-gap-match-interaction","qti-graphic-order-interaction","qti-hotspot-interaction","qti-hottext-interaction","qti-inline-choice-interaction","qti-match-interaction","qti-media-interaction","qti-order-interaction","qti-portable-custom-interaction","qti-position-object-interaction","qti-select-point-interaction","qti-slider-interaction","qti-text-entry-interaction","qti-upload-interaction"]} and {"kind":"compare","left":{"args":[{"field":"ancestry","kind":"field"},{"args":[{"kind":"literal","value":"qti-feedback-block"}],"kind":"closedRow","relation":"Enters"}],"fn":"disjoint","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}}, path, start)';

COMMENT ON CONSTRAINT "__node_key_package_path_start_7m4qykmkxg" ON "qti"."node" IS 'key Node(package where {"kind":"compare","left":{"args":[{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"kind":"literal","value":"baseType"}],"field":"slot","kind":"closedAt","relation":"AttributeGrammar"}],"fn":"singleton","kind":"compute"},{"field":"attrs","kind":"field"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}} and {"kind":"compare","left":{"args":[{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"kind":"literal","value":"fieldIdentifier"}],"field":"slot","kind":"closedAt","relation":"AttributeGrammar"}],"fn":"singleton","kind":"compute"},{"field":"attrs","kind":"field"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}} and {"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"ud:value"}}, path, start)';

COMMENT ON CONSTRAINT "__node_key_package_path_parent_jhawkbuquo" ON "qti"."node" IS 'key Node(package where {"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"qti-interaction-modules"}} and {"kind":"compare","left":{"field":"parentKind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"qti-portable-custom-interaction"}}, path, parent)';

COMMENT ON CONSTRAINT "__open_attribute_key_package_path_start_index_open_z6aawsoy6g" ON "qti"."open_attribute" IS 'key OpenAttribute(package, path, start, the index of the family Node.openAttributes)';

COMMENT ON CONSTRAINT "__open_attribute_key_package_path_start_predecessor_os5w2cwpyl" ON "qti"."open_attribute" IS 'key OpenAttribute(package, path, start, the predecessor of the index of the family Node.openAttributes)';

COMMENT ON CONSTRAINT "__pci_module_form_key_package_path_start_index_jloyddgmsp" ON "qti"."pci_module_form" IS 'key PciModuleForm(package, path, start, the index of the family Interaction.moduleForms)';

COMMENT ON CONSTRAINT "__pci_module_form_key_package_path_start_predecessor_v3gzsahjpb" ON "qti"."pci_module_form" IS 'key PciModuleForm(package, path, start, the predecessor of the index of the family Interaction.moduleForms)';

COMMENT ON CONSTRAINT "__placed_binding_key_package_assembly_instance_index_rw745ssmul" ON "qti"."placed_binding" IS 'key PlacedBinding(package, assembly, instance, the index of the family Instance.bindings)';

COMMENT ON CONSTRAINT "__placed_binding_key_package_assembly_instance_prcf6gxoan" ON "qti"."placed_binding" IS 'key PlacedBinding(package, assembly, instance, the predecessor of the index of the family Instance.bindings)';

COMMENT ON CONSTRAINT "__placed_binding_key_image_package_image_assembly_dw4koa3dyn" ON "qti"."placed_binding" IS 'key PlacedBinding(the textDigest image of package, the textDigest image of assembly, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__placed_choice_key_package_assembly_instance_index_k3zshn6wrl" ON "qti"."placed_choice" IS 'key PlacedChoice(package, assembly, instance, the index of the family Instance.choices)';

COMMENT ON CONSTRAINT "__placed_choice_key_package_assembly_instance_5rxktl6n2n" ON "qti"."placed_choice" IS 'key PlacedChoice(package, assembly, instance, the predecessor of the index of the family Instance.choices)';

COMMENT ON CONSTRAINT "__placed_hottext_key_package_assembly_instance_index_6japq2avdu" ON "qti"."placed_hottext" IS 'key PlacedHottext(package, assembly, instance, the index of the family Instance.hottexts)';

COMMENT ON CONSTRAINT "__placed_hottext_key_package_assembly_instance_6nv2oy2lqi" ON "qti"."placed_hottext" IS 'key PlacedHottext(package, assembly, instance, the predecessor of the index of the family Instance.hottexts)';

COMMENT ON CONSTRAINT "__placed_hottext_key_image_package_image_assembly_pkkbf5bmdt" ON "qti"."placed_hottext" IS 'key PlacedHottext(the textDigest image of package, the textDigest image of assembly, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__placed_id_key_package_assembly_instance_index_ids_mcwlm72pbw" ON "qti"."placed_id" IS 'key PlacedId(package, assembly, instance, the index of the family Instance.ids)';

COMMENT ON CONSTRAINT "__placed_id_key_package_assembly_instance_jflttt7jot" ON "qti"."placed_id" IS 'key PlacedId(package, assembly, instance, the predecessor of the index of the family Instance.ids)';

COMMENT ON CONSTRAINT "__placed_idref_key_package_assembly_instance_index_s62mjbr4qm" ON "qti"."placed_idref" IS 'key PlacedIdref(package, assembly, instance, the index of the family Instance.idrefTargets)';

COMMENT ON CONSTRAINT "__placed_idref_key_package_assembly_instance_i65oxm7bvf" ON "qti"."placed_idref" IS 'key PlacedIdref(package, assembly, instance, the predecessor of the index of the family Instance.idrefTargets)';

COMMENT ON CONSTRAINT "__placed_share_target_key_package_path_start_index_rf42kjvj6r" ON "qti"."placed_share_target" IS 'key PlacedShareTarget(package, path, start, the index of the family ShareFragment.placements)';

COMMENT ON CONSTRAINT "__placed_share_target_key_package_path_start_s5ueouerl5" ON "qti"."placed_share_target" IS 'key PlacedShareTarget(package, path, start, the predecessor of the index of the family ShareFragment.placements)';

COMMENT ON CONSTRAINT "__placed_variable_ref_key_package_assembly_instance_52t2jfjb6a" ON "qti"."placed_variable_ref" IS 'key PlacedVariableRef(package, assembly, instance, the index of the family Instance.variables)';

COMMENT ON CONSTRAINT "__placed_variable_ref_key_package_assembly_instance_5npov272n5" ON "qti"."placed_variable_ref" IS 'key PlacedVariableRef(package, assembly, instance, the predecessor of the index of the family Instance.variables)';

COMMENT ON CONSTRAINT "__printed_variable_ref_key_image_package_image_path_qqgbbqxknt" ON "qti"."printed_variable_ref" IS 'key PrintedVariableRef(the textDigest image of package, the textDigest image of path, start, attribute, kind, assemblyKind, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__rounding_figures_key_image_package_image_path_7bukk4qsx4" ON "qti"."rounding_figures" IS 'key RoundingFigures(the textDigest image of package, the textDigest image of path, start, the textDigest image of figures)';

COMMENT ON CONSTRAINT "__share_fragment_key_image_package_image_path_start_niyy4fhrc2" ON "qti"."share_fragment" IS 'key ShareFragment(the textDigest image of package, the textDigest image of path, start, placements, the textDigest image of id)';

COMMENT ON CONSTRAINT "__site_target_key_package_path_index_targets_fuqqcc23wl" ON "qti"."site_target" IS 'key SiteTarget(package, path, the index of the family AssembledDocument.targets)';

COMMENT ON CONSTRAINT "__site_target_key_package_path_index_targets_after_kxfmsfayyz" ON "qti"."site_target" IS 'key SiteTarget(package, path, the index of the family AssembledDocument.targets, the accumulator after plane 0 of the fold __assembled_document_targets_count_fold_gzgl372iau over the family AssembledDocument.targets)';

COMMENT ON CONSTRAINT "__site_target_key_package_path_predecessor_targets_6qaxjr4qpb" ON "qti"."site_target" IS 'key SiteTarget(package, path, the predecessor of the index of the family AssembledDocument.targets)';

COMMENT ON CONSTRAINT "__site_target_key_package_target_index_targeted_by_djiurheeeu" ON "qti"."site_target" IS 'key SiteTarget(package, target, the index of the family Document.targetedBy)';

COMMENT ON CONSTRAINT "__site_target_key_package_target_index_targeted_by_cjbgdj2smu" ON "qti"."site_target" IS 'key SiteTarget(package, target, the index of the family Document.targetedBy, the accumulator after plane 0 of the fold __document_targeted_by_or_fold_q6g4eocaf6 over the family Document.targetedBy)';

COMMENT ON CONSTRAINT "__site_target_key_package_target_predecessor_du2dhelnpq" ON "qti"."site_target" IS 'key SiteTarget(package, target, the predecessor of the index of the family Document.targetedBy)';

COMMENT ON CONSTRAINT "__srcset_candidate_key_package_path_start_pred_at_jpgatxsojn" ON "qti"."srcset_candidate" IS 'key SrcsetCandidate(package, path, start, pred(at))';

COMMENT ON CONSTRAINT "__srcset_candidate_key_image_package_image_path_ot2j6nmhvh" ON "qti"."srcset_candidate" IS 'key SrcsetCandidate(the textDigest image of package, the textDigest image of path, start, at, the textDigest image of piecesAfter)';

COMMENT ON CONSTRAINT "__stimulus_ref_key_image_package_image_path_image_fzmb546llm" ON "qti"."stimulus_ref" IS 'key StimulusRef(the textDigest image of package, the textDigest image of path, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__template_ref_key_image_package_image_path_start_z7dipujcgj" ON "qti"."template_ref" IS 'key TemplateRef(the textDigest image of package, the textDigest image of path, start, attribute, kind, assemblyKind, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__text_idref_key_package_path_start_pred_at_bulfzlj2w4" ON "qti"."text_idref" IS 'key TextIdref(package, path, start, pred(at))';

COMMENT ON CONSTRAINT "__text_idref_key_image_package_image_path_start_at_qqlodcuhdx" ON "qti"."text_idref" IS 'key TextIdref(the textDigest image of package, the textDigest image of path, start, at, the textDigest image of piecesAfter)';

COMMENT ON CONSTRAINT "__tolerance_token_key_package_path_start_pred_at_mza72eqsyy" ON "qti"."tolerance_token" IS 'key ToleranceToken(package, path, start, pred(at))';

COMMENT ON CONSTRAINT "__tolerance_token_key_image_package_image_path_start_zaociyb3ck" ON "qti"."tolerance_token" IS 'key ToleranceToken(the textDigest image of package, the textDigest image of path, start, at, the textDigest image of piecesAfter)';

COMMENT ON CONSTRAINT "__variable_ref_key_package_path_index_variables_l7ahngb5zk" ON "qti"."variable_ref" IS 'key VariableRef(package, path, the index of the family Document.variables)';

COMMENT ON CONSTRAINT "__variable_ref_key_package_path_predecessor_qg2qiu7er7" ON "qti"."variable_ref" IS 'key VariableRef(package, path, the predecessor of the index of the family Document.variables)';

COMMENT ON CONSTRAINT "__variable_ref_key_image_package_image_path_start_5nh2osbvuj" ON "qti"."variable_ref" IS 'key VariableRef(the textDigest image of package, the textDigest image of path, start, attribute, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__attribute_check_attribute_counted_node_attributes_bpdqludy6t" ON "qti"."attribute" IS 'check of Attribute for law counted Attribute(package, path, start) in fin(Node, attributes)';

COMMENT ON CONSTRAINT "__attribute_check_node_attributes_or_fold_xtgqvby6x6" ON "qti"."attribute" IS 'check of Attribute for law or fold over fin(Node, attributes) of Attribute(package, path, start, slot) into Node(package, path, start, attrs)';

COMMENT ON CONSTRAINT "__binding_name_check_binding_name_counted_document_mdflr7slfc" ON "qti"."binding_name" IS 'check of BindingName for law counted BindingName(package, path) in fin(Document, bindings)';

COMMENT ON CONSTRAINT "__cell_leaf_check_cell_leaf_ordered_math_cell_leaves_rtn2kiuoqf" ON "qti"."cell_leaf" IS 'check of CellLeaf for law ordered CellLeaf(package, path, cell, at) in fin(MathCell, leaves)';

COMMENT ON CONSTRAINT "__choice_check_choice_counted_document_choices_4iujl46hmj" ON "qti"."choice" IS 'check of Choice for law counted Choice(package, path) in fin(Document, choices)';

COMMENT ON CONSTRAINT "__choice_interaction_check_choice_interaction_acwsevthlx" ON "qti"."choice_interaction" IS 'check of ChoiceInteraction for law counted ChoiceInteraction(package, interactionPath, interaction) in fin(Interaction, choices)';

COMMENT ON CONSTRAINT "__cn_part_text_check_cn_part_text_counted_math_cn_q544ypthce" ON "qti"."cn_part_text" IS 'check of CnPartText for law counted CnPartText(package, path, start) in fin(MathCn, parts)';

COMMENT ON CONSTRAINT "__cn_slot_check_cn_slot_counted_cn_count_parts_jk47k23d37" ON "qti"."cn_slot" IS 'check of CnSlot for law counted CnSlot(package, path, start) in fin(CnCount, parts)';

COMMENT ON CONSTRAINT "__document_id_check_document_id_counted_document_ids_i47s6vvqje" ON "qti"."document_id" IS 'check of DocumentId for law counted DocumentId(package, path) in fin(Document, ids)';

COMMENT ON CONSTRAINT "__fragment_context_name_check_fragment_context_name_v73odd4tls" ON "qti"."fragment_context_name" IS 'check of FragmentContextName for law counted FragmentContextName(package, path) in fin(ReferringDocument, contexts)';

COMMENT ON CONSTRAINT "__fragment_context_ref_check_fragment_context_ref_cdoygtbdm2" ON "qti"."fragment_context_ref" IS 'check of FragmentContextRef for law counted FragmentContextRef(package, assembly, instance) in fin(FragmentScope, contexts)';

COMMENT ON CONSTRAINT "__fragment_feedback_name_check_fragment_feedback_tkbru2mbxa" ON "qti"."fragment_feedback_name" IS 'check of FragmentFeedbackName for law counted FragmentFeedbackName(package, path) in fin(ReferringDocument, feedbacks)';

COMMENT ON CONSTRAINT "__fragment_feedback_ref_check_fragment_feedback_ref_nwx6de5qkd" ON "qti"."fragment_feedback_ref" IS 'check of FragmentFeedbackRef for law counted FragmentFeedbackRef(package, assembly, instance) in fin(FragmentScope, feedbacks)';

COMMENT ON CONSTRAINT "__fragment_printed_name_check_fragment_printed_name_lijfcomjcm" ON "qti"."fragment_printed_name" IS 'check of FragmentPrintedName for law counted FragmentPrintedName(package, path) in fin(ReferringDocument, prints)';

COMMENT ON CONSTRAINT "__fragment_printed_ref_check_fragment_printed_ref_abdyeetc2n" ON "qti"."fragment_printed_ref" IS 'check of FragmentPrintedRef for law counted FragmentPrintedRef(package, assembly, instance) in fin(FragmentScope, prints)';

COMMENT ON CONSTRAINT "__fragment_template_name_check_fragment_template_55napfsrld" ON "qti"."fragment_template_name" IS 'check of FragmentTemplateName for law counted FragmentTemplateName(package, path) in fin(ReferringDocument, templates)';

COMMENT ON CONSTRAINT "__fragment_template_ref_check_fragment_template_ref_atbcyakfoz" ON "qti"."fragment_template_ref" IS 'check of FragmentTemplateRef for law counted FragmentTemplateRef(package, assembly, instance) in fin(FragmentScope, templates)';

COMMENT ON CONSTRAINT "__header_token_check_header_token_ordered_cell_d6xcw4szqv" ON "qti"."header_token" IS 'check of HeaderToken for law ordered HeaderToken(package, path, start, at) in fin(CellHeaders, tokens)';

COMMENT ON CONSTRAINT "__hottext_check_hottext_counted_document_hottexts_6an6nanofo" ON "qti"."hottext" IS 'check of Hottext for law counted Hottext(package, path) in fin(Document, hottexts)';

COMMENT ON CONSTRAINT "__idref_check_idref_ordered_attribute_idrefs_dngnqz5hg2" ON "qti"."idref" IS 'check of Idref for law ordered Idref(package, path, start, name, at) in fin(Attribute, idrefs)';

COMMENT ON CONSTRAINT "__idref_target_check_idref_target_counted_document_ieoj5xme2t" ON "qti"."idref_target" IS 'check of IdrefTarget for law counted IdrefTarget(package, path) in fin(Document, idrefTargets)';

COMMENT ON CONSTRAINT "__instance_check_instance_counted_assembled_document_mm6gw32hj4" ON "qti"."instance" IS 'check of Instance for law counted Instance(package, document) in fin(AssembledDocument, instances)';

COMMENT ON CONSTRAINT "__instance_check_instance_tree_children_cuixhk4vee" ON "qti"."instance" IS 'check of Instance for law tree Instance(package, assembly, parent, at) in fin(Instance, children)';

COMMENT ON CONSTRAINT "__math_align_group_check_math_align_group_counted_z272yxux7p" ON "qti"."math_align_group" IS 'check of MathAlignGroup for law counted MathAlignGroup(package, path, cell) in fin(MathCell, groups)';

COMMENT ON CONSTRAINT "__node_check_node_children_count_fold_igxdzwlhcu" ON "qti"."node" IS 'check of Node for law count fold over fin(Node, children) of Node(package, path, parent) where {"arg":{"arg":{"field":"kind","kind":"field"},"kind":"in","values":["comment","doctype","document","entityRef","pi","text","ws"]},"kind":"not"} and {"args":[{"field":"parentKind","kind":"field"}],"kind":"closedHas","relation":"BarredOf"} and {"kind":"compare","left":{"args":[{"field":"parentKind","kind":"field"}],"field":"position","kind":"closedAt","relation":"BarredOf"},"op":"eq","right":{"field":"state","kind":"field"}} and {"kind":"compare","left":{"field":"start","kind":"field"},"op":"gt","right":{"kind":"literal","value":"~n:0"}} into Node(package, path, start, barredChildren)';

COMMENT ON CONSTRAINT "__node_check_node_children_count_fold_qmksp5dp7i" ON "qti"."node" IS 'check of Node for law count fold over fin(Node, children) of Node(package, path, parent) where {"arg":{"arg":{"field":"kind","kind":"field"},"kind":"in","values":["comment","doctype","document","entityRef","pi","text","ws"]},"kind":"not"} and {"args":[{"field":"parentKind","kind":"field"}],"kind":"closedHas","relation":"CountedOf"} and {"kind":"compare","left":{"args":[{"field":"parentKind","kind":"field"}],"field":"position","kind":"closedAt","relation":"CountedOf"},"op":"eq","right":{"field":"state","kind":"field"}} and {"kind":"compare","left":{"field":"start","kind":"field"},"op":"gt","right":{"kind":"literal","value":"~n:0"}} into Node(package, path, start, countedChildren)';

COMMENT ON CONSTRAINT "__node_check_node_tree_children_odpafljdfb" ON "qti"."node" IS 'check of Node for law tree Node(package, path, parent, at) in fin(Node, children)';

COMMENT ON CONSTRAINT "__open_attribute_check_open_attribute_counted_node_nyu4tiwgdg" ON "qti"."open_attribute" IS 'check of OpenAttribute for law counted OpenAttribute(package, path, start) in fin(Node, openAttributes)';

COMMENT ON CONSTRAINT "__pci_module_form_check_pci_module_form_counted_dvbz7vgyvn" ON "qti"."pci_module_form" IS 'check of PciModuleForm for law counted PciModuleForm(package, path, start) in fin(Interaction, moduleForms)';

COMMENT ON CONSTRAINT "__placed_binding_check_placed_binding_counted_y4bnwgxb67" ON "qti"."placed_binding" IS 'check of PlacedBinding for law counted PlacedBinding(package, assembly, instance) in fin(Instance, bindings)';

COMMENT ON CONSTRAINT "__placed_choice_check_placed_choice_counted_instance_p77ar7qzt4" ON "qti"."placed_choice" IS 'check of PlacedChoice for law counted PlacedChoice(package, assembly, instance) in fin(Instance, choices)';

COMMENT ON CONSTRAINT "__placed_hottext_check_placed_hottext_counted_76ts7bnxah" ON "qti"."placed_hottext" IS 'check of PlacedHottext for law counted PlacedHottext(package, assembly, instance) in fin(Instance, hottexts)';

COMMENT ON CONSTRAINT "__placed_id_check_placed_id_counted_instance_ids_ioh5khi7rn" ON "qti"."placed_id" IS 'check of PlacedId for law counted PlacedId(package, assembly, instance) in fin(Instance, ids)';

COMMENT ON CONSTRAINT "__placed_idref_check_placed_idref_counted_instance_klniarooko" ON "qti"."placed_idref" IS 'check of PlacedIdref for law counted PlacedIdref(package, assembly, instance) in fin(Instance, idrefTargets)';

COMMENT ON CONSTRAINT "__placed_share_target_check_placed_share_target_cwmdmabbb2" ON "qti"."placed_share_target" IS 'check of PlacedShareTarget for law counted PlacedShareTarget(package, path, start) in fin(ShareFragment, placements)';

COMMENT ON CONSTRAINT "__placed_variable_ref_check_placed_variable_ref_sjkxwovwgd" ON "qti"."placed_variable_ref" IS 'check of PlacedVariableRef for law counted PlacedVariableRef(package, assembly, instance) in fin(Instance, variables)';

COMMENT ON CONSTRAINT "__site_target_check_site_target_counted_assembled_6ojqzgtd2t" ON "qti"."site_target" IS 'check of SiteTarget for law counted SiteTarget(package, path) in fin(AssembledDocument, targets)';

COMMENT ON CONSTRAINT "__site_target_check_site_target_counted_document_kfrthg33zp" ON "qti"."site_target" IS 'check of SiteTarget for law counted SiteTarget(package, target) in fin(Document, targetedBy)';

COMMENT ON CONSTRAINT "__site_target_check_assembled_document_targets_count_rhi722csjd" ON "qti"."site_target" IS 'check of SiteTarget for law count fold over fin(AssembledDocument, targets) of SiteTarget(package, path) where {"kind":"compare","left":{"field":"places","kind":"field"},"op":"eq","right":{"kind":"literal","value":true}} into AssembledDocument(package, path, sites)';

COMMENT ON CONSTRAINT "__site_target_check_document_targeted_by_or_fold_s2xbwdcrnh" ON "qti"."site_target" IS 'check of SiteTarget for law or fold over fin(Document, targetedBy) of SiteTarget(package, target, ancestry) into Document(package, path, context)';

COMMENT ON CONSTRAINT "__srcset_candidate_check_srcset_candidate_ordered_muwkwohqto" ON "qti"."srcset_candidate" IS 'check of SrcsetCandidate for law ordered SrcsetCandidate(package, path, start, at) in fin(Srcset, tokens)';

COMMENT ON CONSTRAINT "__text_idref_check_text_idref_ordered_identity_text_j6a2rgc35g" ON "qti"."text_idref" IS 'check of TextIdref for law ordered TextIdref(package, path, start, at) in fin(IdentityText, tokens)';

COMMENT ON CONSTRAINT "__tolerance_token_check_tolerance_token_ordered_sre6vd24dn" ON "qti"."tolerance_token" IS 'check of ToleranceToken for law ordered ToleranceToken(package, path, start, at) in fin(Tolerance, tokens)';

COMMENT ON CONSTRAINT "__variable_ref_check_variable_ref_counted_document_4goctx6qkv" ON "qti"."variable_ref" IS 'check of VariableRef for law counted VariableRef(package, path) in fin(Document, variables)';

COMMENT ON CONSTRAINT "__assembled_catalog_fk_package_path_owner_cwkxri6hfw" ON "qti"."assembled_catalog" IS 'foreign key AssembledCatalog(package, path, owner) to CatalogId(package, path, start)';

COMMENT ON CONSTRAINT "__assembled_document_fk_package_path_pred_instances_opgs5mrscf" ON "qti"."assembled_document" IS 'foreign key AssembledDocument(package, path, pred(instances)) to Instance(package, document, the index of the family AssembledDocument.instances)';

COMMENT ON CONSTRAINT "__assembled_document_fk_package_path_pred_targets_excdxg6pge" ON "qti"."assembled_document" IS 'foreign key AssembledDocument(package, path, pred(targets), sites) to SiteTarget(package, path, the index of the family AssembledDocument.targets, the accumulator after plane 0 of the fold __assembled_document_targets_count_fold_gzgl372iau over the family AssembledDocument.targets)';

COMMENT ON CONSTRAINT "__attribute_fk_package_path_start_copy_attributes_cjh7663z47" ON "qti"."attribute" IS 'foreign key Attribute(package, path, start, the owner''s count of the family Node.attributes, governor, kind) to Node(package, path, start, attributes, governor, kind)';

COMMENT ON CONSTRAINT "__attribute_fk_package_path_start_predecessor_kwcw7ok3kp" ON "qti"."attribute" IS 'foreign key Attribute(package, path, start, the predecessor of the index of the family Node.attributes, the accumulator before plane 0 of the fold __node_attributes_or_fold_qjtccpaklg over the family Node.attributes) to Attribute(package, path, start, the index of the family Node.attributes, the accumulator after plane 0 of the fold __node_attributes_or_fold_qjtccpaklg over the family Node.attributes)';

COMMENT ON CONSTRAINT "__attribute_fk_image_package_image_path_start_name_pl6pe7fnds" ON "qti"."attribute" IS 'foreign key Attribute(the textDigest image of package, the textDigest image of path, start, name, pred(idrefs), the textDigest image of idrefText) to Idref(the textDigest image of package, the textDigest image of path, start, name, at, the textDigest image of piecesAfter)';

COMMENT ON CONSTRAINT "__attribute_fk_package_path_start_name_ykxtejlb7g" ON "qti"."attribute" IS 'foreign key Attribute(package where {"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-any-n","qti-correct","qti-default","qti-equal-rounded","qti-index","qti-lookup-outcome-value","qti-map-response","qti-map-response-point","qti-pattern-match","qti-random-float","qti-random-integer","qti-repeat","qti-round-to","qti-set-correct-response","qti-set-default-value","qti-set-outcome-value","qti-set-template-value","qti-variable"]} and {"args":[{"args":[{"args":[{"arg":{"args":[{"field":"lexical","kind":"field"},{"kind":"literal","value":{"pattern":"09b97c6fe613e598d9cf5ca30b8c43c11c5473e4a711d4d45e6270278a6683d0"}}],"fn":"matches","kind":"compute"},"kind":"not"},{"arg":{"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"qti-random-float"}},"kind":"not"}],"kind":"or"},{"args":[{"field":"lexical","kind":"field"},{"kind":"literal","value":{"pattern":"dbce2bac939b8d15f3f6b873394359a57b42b74412cfab08f44671682d0447ad"}}],"fn":"matches","kind":"compute"},{"kind":"compare","left":{"args":[{"field":"kind","kind":"field"},{"field":"name","kind":"field"}],"field":"spelling","kind":"closedAt","relation":"VariableReference"},"op":"eq","right":{"kind":"literal","value":"bare"}}],"kind":"and"},{"args":[{"args":[{"field":"lexical","kind":"field"},{"kind":"literal","value":{"pattern":"47716b2482bfc820077d0844275d18cfdc3c12bc3eea5af5832ffaf0ed8f0bb2"}}],"fn":"matches","kind":"compute"},{"kind":"compare","left":{"args":[{"field":"kind","kind":"field"},{"field":"name","kind":"field"}],"field":"spelling","kind":"closedAt","relation":"VariableReference"},"op":"eq","right":{"kind":"literal","value":"braced"}}],"kind":"and"}],"kind":"or"} and {"kind":"compare","left":{"args":[{"args":[{"field":"name","kind":"field"}],"fn":"singleton","kind":"compute"},{"args":[{"field":"kind","kind":"field"}],"kind":"closedRow","relation":"VariableReference"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}}, path, start, name) to VariableRef(package, path, start, attribute)';

COMMENT ON CONSTRAINT "__attribute_entity_fk_package_path_start_name_mzkbpjqrfj" ON "qti"."attribute_entity" IS 'foreign key AttributeEntity(package, path, start, name) to Attribute(package, path, start, name)';

COMMENT ON CONSTRAINT "__binding_name_fk_package_path_copy_bindings_sb6am7l6sh" ON "qti"."binding_name" IS 'foreign key BindingName(package, path, the owner''s count of the family Document.bindings) to Document(package, path, bindings)';

COMMENT ON CONSTRAINT "__binding_name_fk_package_path_predecessor_bindings_livsfb6g7c" ON "qti"."binding_name" IS 'foreign key BindingName(package, path, the predecessor of the index of the family Document.bindings) to BindingName(package, path, the index of the family Document.bindings)';

COMMENT ON CONSTRAINT "__bound_variable_fk_package_path_adaptive_o67xwxciik" ON "qti"."bound_variable" IS 'foreign key BoundVariable(package, path, adaptive) to ItemMode(package, path, adaptive)';

COMMENT ON CONSTRAINT "__bound_variable_fk_package_path_start_dl2i2rfart" ON "qti"."bound_variable" IS 'foreign key BoundVariable(package where {"kind":"compare","left":{"field":"adaptive","kind":"field"},"op":"eq","right":{"kind":"literal","value":false}} and {"kind":"compare","left":{"field":"attribute","kind":"field"},"op":"eq","right":{"kind":"literal","value":"response-identifier"}}, path, start) to Node(package where {"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-associate-interaction","qti-choice-interaction","qti-custom-interaction","qti-drawing-interaction","qti-end-attempt-interaction","qti-extended-text-interaction","qti-gap-match-interaction","qti-graphic-associate-interaction","qti-graphic-gap-match-interaction","qti-graphic-order-interaction","qti-hotspot-interaction","qti-hottext-interaction","qti-inline-choice-interaction","qti-match-interaction","qti-media-interaction","qti-order-interaction","qti-portable-custom-interaction","qti-position-object-interaction","qti-select-point-interaction","qti-slider-interaction","qti-text-entry-interaction","qti-upload-interaction"]} and {"kind":"compare","left":{"args":[{"field":"ancestry","kind":"field"},{"args":[{"kind":"literal","value":"qti-feedback-block"}],"kind":"closedRow","relation":"Enters"}],"fn":"disjoint","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}}, path, start)';

COMMENT ON CONSTRAINT "__candidate_path_fk_package_target_aynqp2vyvf" ON "qti"."candidate_path" IS 'foreign key CandidatePath(package, target) to Entry(package, path)';

COMMENT ON CONSTRAINT "__catalog_scope_fk_package_path_start_naheth2be3" ON "qti"."catalog_scope" IS 'foreign key CatalogScope(package, path, start) to Node(package, path, start)';

COMMENT ON CONSTRAINT "__cell_headers_fk_package_path_start_5bbvstgdmm" ON "qti"."cell_headers" IS 'foreign key CellHeaders(package, path, start) to TableScope(package, path, start)';

COMMENT ON CONSTRAINT "__cell_headers_fk_image_package_image_path_start_gy6nqhg3wi" ON "qti"."cell_headers" IS 'foreign key CellHeaders(the textDigest image of package, the textDigest image of path, start, pred(tokens), the textDigest image of tokenText) to HeaderToken(the textDigest image of package, the textDigest image of path, start, at, the textDigest image of piecesAfter)';

COMMENT ON CONSTRAINT "__cell_leaf_fk_package_path_cell_copy_leaves_ikzmqguvf6" ON "qti"."cell_leaf" IS 'foreign key CellLeaf(package, path, cell, the owner''s count of the family MathCell.leaves) to MathCell(package, path, start, leaves)';

COMMENT ON CONSTRAINT "__cell_leaf_fk_package_path_cell_pred_at_start_was_zhwbeepi6v" ON "qti"."cell_leaf" IS 'foreign key CellLeaf(package, path, cell, pred(at), startWas) to CellLeaf(package, path, cell, at, startAfter)';

COMMENT ON CONSTRAINT "__cell_leaf_fk_package_path_start_cell_s2bln45e52" ON "qti"."cell_leaf" IS 'foreign key CellLeaf(package, path, start, cell) to MathAlignScope(package, path, start, cell)';

COMMENT ON CONSTRAINT "__choice_fk_package_path_start_hjjl442vss" ON "qti"."choice" IS 'foreign key Choice(package, path, start) to ChoiceInteraction(package, path, start)';

COMMENT ON CONSTRAINT "__choice_fk_package_path_copy_choices_qmg62rrt4k" ON "qti"."choice" IS 'foreign key Choice(package, path, the owner''s count of the family Document.choices) to Document(package, path, choices)';

COMMENT ON CONSTRAINT "__choice_fk_package_path_predecessor_choices_jim5apebu4" ON "qti"."choice" IS 'foreign key Choice(package, path, the predecessor of the index of the family Document.choices) to Choice(package, path, the index of the family Document.choices)';

COMMENT ON CONSTRAINT "__choice_interaction_fk_package_interaction_path_ans6kwjguu" ON "qti"."choice_interaction" IS 'foreign key ChoiceInteraction(package, interactionPath, interaction, the owner''s count of the family Interaction.choices) to Interaction(package, path, start, choices)';

COMMENT ON CONSTRAINT "__choice_interaction_fk_package_interaction_path_nrneq24f23" ON "qti"."choice_interaction" IS 'foreign key ChoiceInteraction(package, interactionPath, interaction, the predecessor of the index of the family Interaction.choices) to ChoiceInteraction(package, interactionPath, interaction, the index of the family Interaction.choices)';

COMMENT ON CONSTRAINT "__choice_interaction_fk_package_path_start_ly5prg5zl7" ON "qti"."choice_interaction" IS 'foreign key ChoiceInteraction(package, path, start) to Choice(package, path, start)';

COMMENT ON CONSTRAINT "__choice_interaction_fk_package_path_start_auainzeevf" ON "qti"."choice_interaction" IS 'foreign key ChoiceInteraction(package, path, start, interaction) to Node(package, path, start, nearest)';

COMMENT ON CONSTRAINT "__cn_count_fk_package_path_start_pred_parts_nt76bkyr7u" ON "qti"."cn_count" IS 'foreign key CnCount(package, path, start, pred(parts)) to CnSlot(package, path, start, the index of the family CnCount.parts)';

COMMENT ON CONSTRAINT "__cn_part_text_fk_package_path_start_copy_parts_base_u3absd7ss6" ON "qti"."cn_part_text" IS 'foreign key CnPartText(package, path, start, the owner''s count of the family MathCn.parts, base, type) to MathCn(package, path, start, parts, base, type)';

COMMENT ON CONSTRAINT "__cn_part_text_fk_package_path_start_predecessor_n232tu7775" ON "qti"."cn_part_text" IS 'foreign key CnPartText(package, path, start, the predecessor of the index of the family MathCn.parts) to CnPartText(package, path, start, the index of the family MathCn.parts)';

COMMENT ON CONSTRAINT "__cn_slot_fk_package_path_start_copy_parts_type_nl4o4ioo5f" ON "qti"."cn_slot" IS 'foreign key CnSlot(package, path, start, the owner''s count of the family CnCount.parts, type) to CnCount(package, path, start, parts, type)';

COMMENT ON CONSTRAINT "__cn_slot_fk_package_path_start_predecessor_parts_hcel4zxkjz" ON "qti"."cn_slot" IS 'foreign key CnSlot(package, path, start, the predecessor of the index of the family CnCount.parts) to CnSlot(package, path, start, the index of the family CnCount.parts)';

COMMENT ON CONSTRAINT "__count_bound_fk_package_path_start_t5pqtfs3rz" ON "qti"."count_bound" IS 'foreign key CountBound(package, path, start) to Node(package, path, start)';

COMMENT ON CONSTRAINT "__data_ssml_member_fk_package_path_start_2dmymllh2h" ON "qti"."data_ssml_member" IS 'foreign key DataSsmlMember(package, path, start) to DataSsml(package, path, start)';

COMMENT ON CONSTRAINT "__data_ssml_property_fk_image_package_image_path_w3rvz6beek" ON "qti"."data_ssml_property" IS 'foreign key DataSsmlProperty(the textDigest image of package, the textDigest image of path, start, member, the textDigest image of memberName) to DataSsmlMember(the textDigest image of package, the textDigest image of path, start, at, the textDigest image of member)';

COMMENT ON CONSTRAINT "__document_fk_package_path_pred_bindings_fouafod5y7" ON "qti"."document" IS 'foreign key Document(package, path, pred(bindings)) to BindingName(package, path, the index of the family Document.bindings)';

COMMENT ON CONSTRAINT "__document_fk_package_path_pred_choices_yrbwq6r4hb" ON "qti"."document" IS 'foreign key Document(package, path, pred(choices)) to Choice(package, path, the index of the family Document.choices)';

COMMENT ON CONSTRAINT "__document_fk_package_path_pred_hottexts_tikqfwhnnb" ON "qti"."document" IS 'foreign key Document(package, path, pred(hottexts)) to Hottext(package, path, the index of the family Document.hottexts)';

COMMENT ON CONSTRAINT "__document_fk_package_path_pred_idref_targets_xdiawwndk2" ON "qti"."document" IS 'foreign key Document(package, path, pred(idrefTargets)) to IdrefTarget(package, path, the index of the family Document.idrefTargets)';

COMMENT ON CONSTRAINT "__document_fk_package_path_pred_ids_qkiqwhoec7" ON "qti"."document" IS 'foreign key Document(package, path, pred(ids)) to DocumentId(package, path, the index of the family Document.ids)';

COMMENT ON CONSTRAINT "__document_fk_package_path_pred_targeted_by_context_m3g2fumgub" ON "qti"."document" IS 'foreign key Document(package, path, pred(targetedBy), context) to SiteTarget(package, target, the index of the family Document.targetedBy, the accumulator after plane 0 of the fold __document_targeted_by_or_fold_q6g4eocaf6 over the family Document.targetedBy)';

COMMENT ON CONSTRAINT "__document_fk_package_path_pred_variables_2kytqy7yjt" ON "qti"."document" IS 'foreign key Document(package, path, pred(variables)) to VariableRef(package, path, the index of the family Document.variables)';

COMMENT ON CONSTRAINT "__document_id_fk_package_path_copy_ids_gen3ajva7g" ON "qti"."document_id" IS 'foreign key DocumentId(package, path, the owner''s count of the family Document.ids) to Document(package, path, ids)';

COMMENT ON CONSTRAINT "__document_id_fk_package_path_predecessor_ids_yyr2sqg3ac" ON "qti"."document_id" IS 'foreign key DocumentId(package, path, the predecessor of the index of the family Document.ids) to DocumentId(package, path, the index of the family Document.ids)';

COMMENT ON CONSTRAINT "__element_type_fk_package_path_start_kind_governor_uciwknlvpy" ON "qti"."element_type" IS 'foreign key ElementType(package, path, start, kind, governor) to Node(package, path, start, kind, governor)';

COMMENT ON CONSTRAINT "__encoding_decl_fk_package_path_u5grbt7fag" ON "qti"."encoding_decl" IS 'foreign key EncodingDecl(package, path) to XmlDecl(package, path)';

COMMENT ON CONSTRAINT "__entry_fk_package_tzyfqvwqow" ON "qti"."entry" IS 'foreign key Entry(package) to Package(name)';

COMMENT ON CONSTRAINT "__expression_fk_package_path_start_f6hwlqhv67" ON "qti"."expression" IS 'foreign key Expression(package, path, start) to Node(package, path, start)';

COMMENT ON CONSTRAINT "__fragment_context_name_fk_package_path_copy_i7tr226g4e" ON "qti"."fragment_context_name" IS 'foreign key FragmentContextName(package, path, the owner''s count of the family ReferringDocument.contexts) to ReferringDocument(package, path, contexts)';

COMMENT ON CONSTRAINT "__fragment_context_name_fk_package_path_predecessor_y4e2h4ueim" ON "qti"."fragment_context_name" IS 'foreign key FragmentContextName(package, path, the predecessor of the index of the family ReferringDocument.contexts) to FragmentContextName(package, path, the index of the family ReferringDocument.contexts)';

COMMENT ON CONSTRAINT "__fragment_context_ref_fk_package_assembly_instance_qmrvsw47a5" ON "qti"."fragment_context_ref" IS 'foreign key FragmentContextRef(package, assembly, instance, the owner''s count of the family FragmentScope.contexts, assemblyKind, path) to FragmentScope(package, assembly, instance, contexts, assemblyKind, document)';

COMMENT ON CONSTRAINT "__fragment_context_ref_fk_package_assembly_instance_4csn2nw3xk" ON "qti"."fragment_context_ref" IS 'foreign key FragmentContextRef(package, assembly, instance, the predecessor of the index of the family FragmentScope.contexts) to FragmentContextRef(package, assembly, instance, the index of the family FragmentScope.contexts)';

COMMENT ON CONSTRAINT "__fragment_context_ref_fk_image_package_image_path_rxmunrgbld" ON "qti"."fragment_context_ref" IS 'foreign key FragmentContextRef(the textDigest image of package, the textDigest image of path, start, attribute, kind, the textDigest image of identifier) to FragmentContextName(the textDigest image of package, the textDigest image of path, start, attribute, kind, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__fragment_feedback_name_fk_package_path_copy_abnu2mx63n" ON "qti"."fragment_feedback_name" IS 'foreign key FragmentFeedbackName(package, path, the owner''s count of the family ReferringDocument.feedbacks) to ReferringDocument(package, path, feedbacks)';

COMMENT ON CONSTRAINT "__fragment_feedback_name_fk_package_path_predecessor_ip2b5eqztt" ON "qti"."fragment_feedback_name" IS 'foreign key FragmentFeedbackName(package, path, the predecessor of the index of the family ReferringDocument.feedbacks) to FragmentFeedbackName(package, path, the index of the family ReferringDocument.feedbacks)';

COMMENT ON CONSTRAINT "__fragment_feedback_ref_fk_package_assembly_instance_nemmw63ril" ON "qti"."fragment_feedback_ref" IS 'foreign key FragmentFeedbackRef(package, assembly, instance, the owner''s count of the family FragmentScope.feedbacks, assemblyKind, path) to FragmentScope(package, assembly, instance, feedbacks, assemblyKind, document)';

COMMENT ON CONSTRAINT "__fragment_feedback_ref_fk_package_assembly_instance_msnpettsbl" ON "qti"."fragment_feedback_ref" IS 'foreign key FragmentFeedbackRef(package, assembly, instance, the predecessor of the index of the family FragmentScope.feedbacks) to FragmentFeedbackRef(package, assembly, instance, the index of the family FragmentScope.feedbacks)';

COMMENT ON CONSTRAINT "__fragment_feedback_ref_fk_image_package_image_path_icntjtzl5p" ON "qti"."fragment_feedback_ref" IS 'foreign key FragmentFeedbackRef(the textDigest image of package, the textDigest image of path, start, attribute, kind, the textDigest image of identifier) to FragmentFeedbackName(the textDigest image of package, the textDigest image of path, start, attribute, kind, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__fragment_printed_name_fk_package_path_copy_prints_v4qcbt44tb" ON "qti"."fragment_printed_name" IS 'foreign key FragmentPrintedName(package, path, the owner''s count of the family ReferringDocument.prints) to ReferringDocument(package, path, prints)';

COMMENT ON CONSTRAINT "__fragment_printed_name_fk_package_path_predecessor_srdzfslmhz" ON "qti"."fragment_printed_name" IS 'foreign key FragmentPrintedName(package, path, the predecessor of the index of the family ReferringDocument.prints) to FragmentPrintedName(package, path, the index of the family ReferringDocument.prints)';

COMMENT ON CONSTRAINT "__fragment_printed_ref_fk_package_assembly_instance_jwyp6pmicw" ON "qti"."fragment_printed_ref" IS 'foreign key FragmentPrintedRef(package, assembly, instance, the owner''s count of the family FragmentScope.prints, assemblyKind, path) to FragmentScope(package, assembly, instance, prints, assemblyKind, document)';

COMMENT ON CONSTRAINT "__fragment_printed_ref_fk_package_assembly_instance_aj65n7cdp2" ON "qti"."fragment_printed_ref" IS 'foreign key FragmentPrintedRef(package, assembly, instance, the predecessor of the index of the family FragmentScope.prints) to FragmentPrintedRef(package, assembly, instance, the index of the family FragmentScope.prints)';

COMMENT ON CONSTRAINT "__fragment_printed_ref_fk_image_package_image_path_65tus7xlee" ON "qti"."fragment_printed_ref" IS 'foreign key FragmentPrintedRef(the textDigest image of package, the textDigest image of path, start, attribute, kind, the textDigest image of identifier) to FragmentPrintedName(the textDigest image of package, the textDigest image of path, start, attribute, kind, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__fragment_scope_fk_package_assembly_instance_nkb5xn3uaf" ON "qti"."fragment_scope" IS 'foreign key FragmentScope(package, assembly, instance, document, assemblyKind) to Instance(package, assembly, start, document, assemblyKind)';

COMMENT ON CONSTRAINT "__fragment_scope_fk_package_assembly_instance_pred_pviwyowdol" ON "qti"."fragment_scope" IS 'foreign key FragmentScope(package, assembly, instance, pred(contexts)) to FragmentContextRef(package, assembly, instance, the index of the family FragmentScope.contexts)';

COMMENT ON CONSTRAINT "__fragment_scope_fk_package_assembly_instance_pred_kjpbyjytvk" ON "qti"."fragment_scope" IS 'foreign key FragmentScope(package, assembly, instance, pred(feedbacks)) to FragmentFeedbackRef(package, assembly, instance, the index of the family FragmentScope.feedbacks)';

COMMENT ON CONSTRAINT "__fragment_scope_fk_package_assembly_instance_pred_7gu2sj2s3k" ON "qti"."fragment_scope" IS 'foreign key FragmentScope(package, assembly, instance, pred(prints)) to FragmentPrintedRef(package, assembly, instance, the index of the family FragmentScope.prints)';

COMMENT ON CONSTRAINT "__fragment_scope_fk_package_assembly_instance_pred_sbk2wlzqzg" ON "qti"."fragment_scope" IS 'foreign key FragmentScope(package, assembly, instance, pred(templates)) to FragmentTemplateRef(package, assembly, instance, the index of the family FragmentScope.templates)';

COMMENT ON CONSTRAINT "__fragment_scope_fk_package_document_feedbacks_sqwpxtazud" ON "qti"."fragment_scope" IS 'foreign key FragmentScope(package, document, feedbacks, prints, templates, contexts) to ReferringDocument(package, path, feedbacks, prints, templates, contexts)';

COMMENT ON CONSTRAINT "__fragment_template_name_fk_package_path_copy_xs3r4om2s5" ON "qti"."fragment_template_name" IS 'foreign key FragmentTemplateName(package, path, the owner''s count of the family ReferringDocument.templates) to ReferringDocument(package, path, templates)';

COMMENT ON CONSTRAINT "__fragment_template_name_fk_package_path_predecessor_w6ni5yia5l" ON "qti"."fragment_template_name" IS 'foreign key FragmentTemplateName(package, path, the predecessor of the index of the family ReferringDocument.templates) to FragmentTemplateName(package, path, the index of the family ReferringDocument.templates)';

COMMENT ON CONSTRAINT "__fragment_template_ref_fk_package_assembly_instance_ns4u6kvl5n" ON "qti"."fragment_template_ref" IS 'foreign key FragmentTemplateRef(package, assembly, instance, the owner''s count of the family FragmentScope.templates, assemblyKind, path) to FragmentScope(package, assembly, instance, templates, assemblyKind, document)';

COMMENT ON CONSTRAINT "__fragment_template_ref_fk_package_assembly_instance_k6kjvp4vr7" ON "qti"."fragment_template_ref" IS 'foreign key FragmentTemplateRef(package, assembly, instance, the predecessor of the index of the family FragmentScope.templates) to FragmentTemplateRef(package, assembly, instance, the index of the family FragmentScope.templates)';

COMMENT ON CONSTRAINT "__fragment_template_ref_fk_image_package_image_path_s3xwfhhzti" ON "qti"."fragment_template_ref" IS 'foreign key FragmentTemplateRef(the textDigest image of package, the textDigest image of path, start, attribute, kind, the textDigest image of identifier) to FragmentTemplateName(the textDigest image of package, the textDigest image of path, start, attribute, kind, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__header_token_fk_package_path_start_copy_tokens_mukpeaaqnv" ON "qti"."header_token" IS 'foreign key HeaderToken(package, path, start, the owner''s count of the family CellHeaders.tokens) to CellHeaders(package, path, start, tokens)';

COMMENT ON CONSTRAINT "__header_token_fk_image_package_image_path_start_pfd6hvkxhk" ON "qti"."header_token" IS 'foreign key HeaderToken(the textDigest image of package, the textDigest image of path, start, pred(at), the textDigest image of piecesWas) to HeaderToken(the textDigest image of package, the textDigest image of path, start, at, the textDigest image of piecesAfter)';

COMMENT ON CONSTRAINT "__hottext_fk_package_path_copy_hottexts_nqhkueuyyr" ON "qti"."hottext" IS 'foreign key Hottext(package, path, the owner''s count of the family Document.hottexts) to Document(package, path, hottexts)';

COMMENT ON CONSTRAINT "__hottext_fk_package_path_predecessor_hottexts_a3xph2z6lt" ON "qti"."hottext" IS 'foreign key Hottext(package, path, the predecessor of the index of the family Document.hottexts) to Hottext(package, path, the index of the family Document.hottexts)';

COMMENT ON CONSTRAINT "__identity_text_fk_package_path_start_vymux7o4os" ON "qti"."identity_text" IS 'foreign key IdentityText(package, path, start) to Node(package, path, start)';

COMMENT ON CONSTRAINT "__identity_text_fk_image_package_image_path_start_ke6wzbhjct" ON "qti"."identity_text" IS 'foreign key IdentityText(the textDigest image of package, the textDigest image of path, start, pred(tokens), the textDigest image of tokenText) to TextIdref(the textDigest image of package, the textDigest image of path, start, at, the textDigest image of piecesAfter)';

COMMENT ON CONSTRAINT "__idref_fk_package_path_start_name_copy_idrefs_l3bwkzmy73" ON "qti"."idref" IS 'foreign key Idref(package, path, start, name, the owner''s count of the family Attribute.idrefs) to Attribute(package, path, start, name, idrefs)';

COMMENT ON CONSTRAINT "__idref_fk_image_package_image_path_start_name_pred_veydgbpdjl" ON "qti"."idref" IS 'foreign key Idref(the textDigest image of package, the textDigest image of path, start, name, pred(at), the textDigest image of piecesWas) to Idref(the textDigest image of package, the textDigest image of path, start, name, at, the textDigest image of piecesAfter)';

COMMENT ON CONSTRAINT "__idref_fk_image_package_image_path_image_token_d7rft2tfo7" ON "qti"."idref" IS 'foreign key Idref(the textDigest image of package, the textDigest image of path, the textDigest image of token) to IdrefTarget(the textDigest image of package, the textDigest image of path, the textDigest image of id)';

COMMENT ON CONSTRAINT "__idref_target_fk_package_path_copy_idref_targets_gqcp4g6ar3" ON "qti"."idref_target" IS 'foreign key IdrefTarget(package, path, the owner''s count of the family Document.idrefTargets, assembled) to Document(package, path, idrefTargets, assembled)';

COMMENT ON CONSTRAINT "__idref_target_fk_package_path_predecessor_idref_bun7tb7rap" ON "qti"."idref_target" IS 'foreign key IdrefTarget(package, path, the predecessor of the index of the family Document.idrefTargets) to IdrefTarget(package, path, the index of the family Document.idrefTargets)';

COMMENT ON CONSTRAINT "__inclusion_fk_package_path_start_parent_kind_places_2557ifwq63" ON "qti"."inclusion" IS 'foreign key Inclusion(package, path, start, parentKind, places, root, splices) to SiteTarget(package, path, start, parentKind, places, targetRoot, splices)';

COMMENT ON CONSTRAINT "__instance_fk_package_assembly_start_pred_bindings_nxfqdzzza2" ON "qti"."instance" IS 'foreign key Instance(package, assembly, start, pred(bindings)) to PlacedBinding(package, assembly, instance, the index of the family Instance.bindings)';

COMMENT ON CONSTRAINT "__instance_fk_package_assembly_start_pred_children_36olkmoimr" ON "qti"."instance" IS 'foreign key Instance(package, assembly, start, pred(children), end) to Instance(package, assembly, parent where {"kind":"compare","left":{"field":"start","kind":"field"},"op":"gt","right":{"kind":"literal","value":"~n:0"}}, at, end)';

COMMENT ON CONSTRAINT "__instance_fk_package_assembly_start_pred_choices_4hokoiprao" ON "qti"."instance" IS 'foreign key Instance(package, assembly, start, pred(choices)) to PlacedChoice(package, assembly, instance, the index of the family Instance.choices)';

COMMENT ON CONSTRAINT "__instance_fk_package_assembly_start_pred_hottexts_qsp2z6ey3g" ON "qti"."instance" IS 'foreign key Instance(package, assembly, start, pred(hottexts)) to PlacedHottext(package, assembly, instance, the index of the family Instance.hottexts)';

COMMENT ON CONSTRAINT "__instance_fk_package_assembly_start_pred_idref_hix6ikgvcl" ON "qti"."instance" IS 'foreign key Instance(package, assembly, start, pred(idrefTargets)) to PlacedIdref(package, assembly, instance, the index of the family Instance.idrefTargets)';

COMMENT ON CONSTRAINT "__instance_fk_package_assembly_start_pred_ids_zkgt72tuht" ON "qti"."instance" IS 'foreign key Instance(package, assembly, start, pred(ids)) to PlacedId(package, assembly, instance, the index of the family Instance.ids)';

COMMENT ON CONSTRAINT "__instance_fk_package_assembly_start_pred_variables_spvdaqjppg" ON "qti"."instance" IS 'foreign key Instance(package, assembly, start, pred(variables)) to PlacedVariableRef(package, assembly, instance, the index of the family Instance.variables)';

COMMENT ON CONSTRAINT "__instance_fk_package_assembly_parent_copy_children_crejh3tfyf" ON "qti"."instance" IS 'foreign key Instance(package, assembly, parent where {"kind":"compare","left":{"field":"start","kind":"field"},"op":"gt","right":{"kind":"literal","value":"~n:0"}}, the owner''s count of the family Instance.children, assemblyKind, siteDocument) to Instance(package, assembly, start, children, assemblyKind, document)';

COMMENT ON CONSTRAINT "__instance_fk_package_assembly_parent_pred_at_start_bmevtdvhp4" ON "qti"."instance" IS 'foreign key Instance(package, assembly, parent where {"kind":"compare","left":{"field":"start","kind":"field"},"op":"gt","right":{"kind":"literal","value":"~n:0"}}, pred(at), start) to Instance(package, assembly, parent where {"kind":"compare","left":{"field":"start","kind":"field"},"op":"gt","right":{"kind":"literal","value":"~n:0"}}, at, end)';

COMMENT ON CONSTRAINT "__instance_fk_package_document_ids_idref_targets_5z7ien5yku" ON "qti"."instance" IS 'foreign key Instance(package, document, ids, idrefTargets, choices, hottexts) to Document(package, path, ids, idrefTargets, choices, hottexts)';

COMMENT ON CONSTRAINT "__instance_fk_package_document_root_kind_hgvtyahpsw" ON "qti"."instance" IS 'foreign key Instance(package, document, rootKind) to Document(package, path, rootKind)';

COMMENT ON CONSTRAINT "__instance_fk_package_document_copy_instances_hbgbfu6nua" ON "qti"."instance" IS 'foreign key Instance(package, document, the owner''s count of the family AssembledDocument.instances, children) to AssembledDocument(package, path, instances, sites)';

COMMENT ON CONSTRAINT "__instance_fk_package_document_predecessor_instances_wdblc4jtmg" ON "qti"."instance" IS 'foreign key Instance(package, document, the predecessor of the index of the family AssembledDocument.instances) to Instance(package, document, the index of the family AssembledDocument.instances)';

COMMENT ON CONSTRAINT "__interaction_fk_package_path_start_wpfpdpxf37" ON "qti"."interaction" IS 'foreign key Interaction(package, path, start) to Node(package, path, start)';

COMMENT ON CONSTRAINT "__interaction_fk_package_path_start_pred_choices_zosgrzvvtu" ON "qti"."interaction" IS 'foreign key Interaction(package, path, start, pred(choices)) to ChoiceInteraction(package, interactionPath, interaction, the index of the family Interaction.choices)';

COMMENT ON CONSTRAINT "__interaction_fk_package_path_start_pred_module_d7kjlhcc36" ON "qti"."interaction" IS 'foreign key Interaction(package, path, start, pred(moduleForms)) to PciModuleForm(package, path, start, the index of the family Interaction.moduleForms)';

COMMENT ON CONSTRAINT "__interaction_attribute_fk_package_path_root_kind_ottpmnv3zo" ON "qti"."interaction_attribute" IS 'foreign key InteractionAttribute(package, path, rootKind) to Document(package, path, rootKind)';

COMMENT ON CONSTRAINT "__interaction_attribute_fk_image_package_image_path_l7effn3wer" ON "qti"."interaction_attribute" IS 'foreign key InteractionAttribute(the textDigest image of package where {"arg":{"arg":{"field":"rootKind","kind":"field"},"kind":"in","values":["qti-assessment-item","qti-assessment-test"]},"kind":"not"} and {"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-associable-hotspot","qti-gap","qti-gap-img","qti-gap-text","qti-hotspot-choice","qti-hottext","qti-inline-choice","qti-simple-associable-choice","qti-simple-choice","qti-template-block","qti-template-block.rubric","qti-template-inline","qti-template-inline.rubric","qti-template-variable"]} and {"args":[{"field":"value","kind":"field"},{"kind":"literal","value":{"pattern":"1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5"}}],"fn":"matches","kind":"compute"} and {"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"template-identifier"}}, the textDigest image of path, start, name, kind, the textDigest image of value) to FragmentTemplateName(the textDigest image of package, the textDigest image of path, start, attribute, kind, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__interaction_attribute_fk_image_package_image_path_v35kom2i7p" ON "qti"."interaction_attribute" IS 'foreign key InteractionAttribute(the textDigest image of package where {"arg":{"arg":{"field":"rootKind","kind":"field"},"kind":"in","values":["qti-assessment-item","qti-assessment-test"]},"kind":"not"} and {"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-feedback-block","qti-feedback-block.template","qti-feedback-inline","qti-modal-feedback","qti-test-feedback"]} and {"args":[{"field":"value","kind":"field"},{"kind":"literal","value":{"pattern":"1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5"}}],"fn":"matches","kind":"compute"} and {"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"outcome-identifier"}}, the textDigest image of path, start, name, kind, the textDigest image of value) to FragmentFeedbackName(the textDigest image of package, the textDigest image of path, start, attribute, kind, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__interaction_attribute_fk_image_package_image_path_ietozkjrzd" ON "qti"."interaction_attribute" IS 'foreign key InteractionAttribute(the textDigest image of package where {"arg":{"arg":{"field":"rootKind","kind":"field"},"kind":"in","values":["qti-assessment-item","qti-assessment-test"]},"kind":"not"} and {"args":[{"args":[{"arg":{"field":"name","kind":"field"},"kind":"in","values":["base","index"]},{"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"qti-printed-variable"}}],"kind":"and"},{"args":[{"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"qti-printed-variable"}},{"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"identifier"}}],"kind":"and"}],"kind":"or"} and {"args":[{"field":"value","kind":"field"},{"kind":"literal","value":{"pattern":"1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5"}}],"fn":"matches","kind":"compute"}, the textDigest image of path, start, name, kind, the textDigest image of value) to FragmentPrintedName(the textDigest image of package, the textDigest image of path, start, attribute, kind, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__interaction_attribute_fk_image_package_image_path_z5v3a5piuj" ON "qti"."interaction_attribute" IS 'foreign key InteractionAttribute(the textDigest image of package where {"arg":{"arg":{"field":"rootKind","kind":"field"},"kind":"in","values":["qti-assessment-item","qti-assessment-test"]},"kind":"not"} and {"args":[{"field":"value","kind":"field"},{"kind":"literal","value":{"pattern":"1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5"}}],"fn":"matches","kind":"compute"} and {"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"qti-context-variable"}} and {"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"identifier"}}, the textDigest image of path, start, name, kind, the textDigest image of value) to FragmentContextName(the textDigest image of package, the textDigest image of path, start, attribute, kind, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__interaction_attribute_fk_image_package_image_path_7qmh3ixvu3" ON "qti"."interaction_attribute" IS 'foreign key InteractionAttribute(the textDigest image of package where {"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-associable-hotspot","qti-gap","qti-gap-img","qti-gap-text","qti-hotspot-choice","qti-hottext","qti-inline-choice","qti-simple-associable-choice","qti-simple-choice","qti-template-block","qti-template-block.rubric","qti-template-inline","qti-template-inline.rubric","qti-template-variable"]} and {"arg":{"field":"rootKind","kind":"field"},"kind":"in","values":["qti-assessment-item","qti-assessment-test"]} and {"args":[{"field":"value","kind":"field"},{"kind":"literal","value":{"pattern":"1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5"}}],"fn":"matches","kind":"compute"} and {"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"template-identifier"}}, the textDigest image of path, start, name, kind, rootKind, the textDigest image of value) to TemplateRef(the textDigest image of package, the textDigest image of path, start, attribute, kind, assemblyKind, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__interaction_attribute_fk_image_package_image_path_u5n4mcdddw" ON "qti"."interaction_attribute" IS 'foreign key InteractionAttribute(the textDigest image of package where {"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-associate-interaction","qti-choice-interaction","qti-custom-interaction","qti-drawing-interaction","qti-end-attempt-interaction","qti-extended-text-interaction","qti-gap-match-interaction","qti-graphic-associate-interaction","qti-graphic-gap-match-interaction","qti-graphic-order-interaction","qti-hotspot-interaction","qti-hottext-interaction","qti-inline-choice-interaction","qti-match-interaction","qti-media-interaction","qti-order-interaction","qti-portable-custom-interaction","qti-position-object-interaction","qti-select-point-interaction","qti-slider-interaction","qti-text-entry-interaction","qti-upload-interaction"]} and {"arg":{"field":"name","kind":"field"},"kind":"in","values":["response-identifier","string-identifier"]} and {"args":[{"field":"value","kind":"field"},{"kind":"literal","value":{"pattern":"1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5"}}],"fn":"matches","kind":"compute"}, the textDigest image of path, start, name, the textDigest image of value) to BindingName(the textDigest image of package, the textDigest image of path, start, attribute, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__interaction_attribute_fk_image_package_image_path_ug7sf3yuqr" ON "qti"."interaction_attribute" IS 'foreign key InteractionAttribute(the textDigest image of package where {"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-associate-interaction","qti-choice-interaction","qti-custom-interaction","qti-drawing-interaction","qti-end-attempt-interaction","qti-extended-text-interaction","qti-gap-match-interaction","qti-graphic-associate-interaction","qti-graphic-gap-match-interaction","qti-graphic-order-interaction","qti-hotspot-interaction","qti-hottext-interaction","qti-inline-choice-interaction","qti-match-interaction","qti-media-interaction","qti-order-interaction","qti-portable-custom-interaction","qti-position-object-interaction","qti-select-point-interaction","qti-slider-interaction","qti-text-entry-interaction","qti-upload-interaction"]} and {"arg":{"field":"name","kind":"field"},"kind":"in","values":["response-identifier","string-identifier"]} and {"args":[{"field":"value","kind":"field"},{"kind":"literal","value":{"pattern":"1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5"}}],"fn":"matches","kind":"compute"} and {"kind":"compare","left":{"field":"rootKind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"qti-assessment-item"}}, the textDigest image of path, start, name, the textDigest image of value) to BoundVariable(the textDigest image of package, the textDigest image of path, start, attribute, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__interaction_attribute_fk_image_package_image_path_esdh4xbhsa" ON "qti"."interaction_attribute" IS 'foreign key InteractionAttribute(the textDigest image of package where {"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-feedback-block","qti-feedback-block.template","qti-feedback-inline","qti-modal-feedback","qti-test-feedback"]} and {"arg":{"field":"rootKind","kind":"field"},"kind":"in","values":["qti-assessment-item","qti-assessment-test"]} and {"args":[{"field":"value","kind":"field"},{"kind":"literal","value":{"pattern":"1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5"}}],"fn":"matches","kind":"compute"} and {"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"outcome-identifier"}}, the textDigest image of path, start, name, kind, rootKind, the textDigest image of value) to FeedbackRef(the textDigest image of package, the textDigest image of path, start, attribute, kind, assemblyKind, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__interaction_attribute_fk_image_package_image_path_vnsvkannto" ON "qti"."interaction_attribute" IS 'foreign key InteractionAttribute(the textDigest image of package where {"arg":{"field":"rootKind","kind":"field"},"kind":"in","values":["qti-assessment-item","qti-assessment-test"]} and {"args":[{"args":[{"arg":{"field":"name","kind":"field"},"kind":"in","values":["base","index"]},{"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"qti-printed-variable"}}],"kind":"and"},{"args":[{"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"qti-printed-variable"}},{"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"identifier"}}],"kind":"and"}],"kind":"or"} and {"args":[{"field":"value","kind":"field"},{"kind":"literal","value":{"pattern":"1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5"}}],"fn":"matches","kind":"compute"}, the textDigest image of path, start, name, kind, rootKind, the textDigest image of value) to PrintedVariableRef(the textDigest image of package, the textDigest image of path, start, attribute, kind, assemblyKind, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__interaction_attribute_fk_image_package_image_path_mdexog7g4w" ON "qti"."interaction_attribute" IS 'foreign key InteractionAttribute(the textDigest image of package where {"arg":{"field":"rootKind","kind":"field"},"kind":"in","values":["qti-assessment-item","qti-assessment-test"]} and {"args":[{"field":"value","kind":"field"},{"kind":"literal","value":{"pattern":"1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5"}}],"fn":"matches","kind":"compute"} and {"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"qti-context-variable"}} and {"kind":"compare","left":{"field":"name","kind":"field"},"op":"eq","right":{"kind":"literal","value":"identifier"}}, the textDigest image of path, start, name, kind, rootKind, the textDigest image of value) to ContextRef(the textDigest image of package, the textDigest image of path, start, attribute, kind, assemblyKind, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__label_use_fk_package_path_root_kind_5odzayuwy3" ON "qti"."label_use" IS 'foreign key LabelUse(package, path, rootKind) to Document(package, path, rootKind)';

COMMENT ON CONSTRAINT "__least_count_fk_package_path_start_vgly2zkjt2" ON "qti"."least_count" IS 'foreign key LeastCount(package, path, start) to CountBound(package, path, start)';

COMMENT ON CONSTRAINT "__literal_fk_package_path_start_base_type_j2vwpqor57" ON "qti"."literal" IS 'foreign key Literal(package, path, start, baseType) to Expression(package, path, start, baseType)';

COMMENT ON CONSTRAINT "__literal_typed_fk_image_package_image_path_start_kzgbthav7k" ON "qti"."literal_typed" IS 'foreign key LiteralTyped(the textDigest image of package, the textDigest image of path, start, the textDigest image of text, baseType) to Literal(the textDigest image of package, the textDigest image of path, start, the textDigest image of text, baseType)';

COMMENT ON CONSTRAINT "__math_align_group_fk_package_path_cell_copy_groups_hdpaxywlcb" ON "qti"."math_align_group" IS 'foreign key MathAlignGroup(package, path, cell, the owner''s count of the family MathCell.groups) to MathCell(package, path, start, groups)';

COMMENT ON CONSTRAINT "__math_align_group_fk_package_path_cell_predecessor_fnmrdmpetz" ON "qti"."math_align_group" IS 'foreign key MathAlignGroup(package, path, cell, the predecessor of the index of the family MathCell.groups) to MathAlignGroup(package, path, cell, the index of the family MathCell.groups)';

COMMENT ON CONSTRAINT "__math_align_group_fk_package_path_start_cell_ygnv5pqymq" ON "qti"."math_align_group" IS 'foreign key MathAlignGroup(package, path, start, cell) to MathAlignScope(package, path, start, cell)';

COMMENT ON CONSTRAINT "__math_align_group_fk_package_path_start_tag_state_whuyhaovjg" ON "qti"."math_align_group" IS 'foreign key MathAlignGroup(package, path, start, tag MathAlignScope.state = open) to MathAlignScope(package, path, start, state)';

COMMENT ON CONSTRAINT "__math_align_group_fk_package_path_start_tag_kind_m_iopasv7ble" ON "qti"."math_align_group" IS 'foreign key MathAlignGroup(package, path, start, tag Node.kind = m:maligngroup) to Node(package, path, start, kind)';

COMMENT ON CONSTRAINT "__math_align_scope_fk_package_path_start_jfr4iz7vmr" ON "qti"."math_align_scope" IS 'foreign key MathAlignScope(package, path, start) to Node(package, path, start)';

COMMENT ON CONSTRAINT "__math_cell_fk_package_path_start_pred_groups_3tmcxdn4gu" ON "qti"."math_cell" IS 'foreign key MathCell(package, path, start, pred(groups)) to MathAlignGroup(package, path, cell, the index of the family MathCell.groups)';

COMMENT ON CONSTRAINT "__math_cell_fk_package_path_start_pred_leaves_last_zixxwvi2km" ON "qti"."math_cell" IS 'foreign key MathCell(package, path, start, pred(leaves), lastStart) to CellLeaf(package, path, cell, at, startAfter)';

COMMENT ON CONSTRAINT "__math_cn_fk_package_path_start_type_gfdns3v3gm" ON "qti"."math_cn" IS 'foreign key MathCn(package, path, start, type) to CnCount(package, path, start, type)';

COMMENT ON CONSTRAINT "__math_cn_fk_package_path_start_pred_parts_ob77fltdsw" ON "qti"."math_cn" IS 'foreign key MathCn(package, path, start, pred(parts)) to CnPartText(package, path, start, the index of the family MathCn.parts)';

COMMENT ON CONSTRAINT "__math_rank_fk_package_path_start_z7fxfctmgv" ON "qti"."math_rank" IS 'foreign key MathRank(package, path, start) to Node(package, path, start)';

COMMENT ON CONSTRAINT "__most_count_fk_package_path_start_nmmdsz5znz" ON "qti"."most_count" IS 'foreign key MostCount(package, path, start) to CountBound(package, path, start)';

COMMENT ON CONSTRAINT "__named_fk_package_path_eca76rajwv" ON "qti"."named" IS 'foreign key Named(package, path) to AssembledDocument(package, path)';

COMMENT ON CONSTRAINT "__namespace_fk_package_path_start_4tsm66w6qo" ON "qti"."namespace" IS 'foreign key Namespace(package, path, start) to Node(package, path, start)';

COMMENT ON CONSTRAINT "__node_fk_package_path_start_pred_attributes_attrs_yuiaud4slh" ON "qti"."node" IS 'foreign key Node(package, path, start, pred(attributes), attrs) to Attribute(package, path, start, the index of the family Node.attributes, the accumulator after plane 0 of the fold __node_attributes_or_fold_qjtccpaklg over the family Node.attributes)';

COMMENT ON CONSTRAINT "__node_fk_package_path_start_pred_open_attributes_khsm76hyrz" ON "qti"."node" IS 'foreign key Node(package, path, start, pred(openAttributes)) to OpenAttribute(package, path, start, the index of the family Node.openAttributes)';

COMMENT ON CONSTRAINT "__node_fk_package_path_parent_copy_children_parent_izis7cll4b" ON "qti"."node" IS 'foreign key Node(package, path, parent where {"kind":"compare","left":{"field":"start","kind":"field"},"op":"gt","right":{"kind":"literal","value":"~n:0"}}, the owner''s count of the family Node.children, parentAncestry, parentGovernor, parentKind, parentNearest, parentNearestKind, parentNearestPath, parentParentKind) to Node(package, path, start, children, ancestry, governor, kind, nearest, nearestKind, nearestPath, parentKind)';

COMMENT ON CONSTRAINT "__node_fk_image_package_image_path_start_pred_6coiluef7c" ON "qti"."node" IS 'foreign key Node(the textDigest image of package, the textDigest image of path, start, pred(children), end, barredChildren, countedChildren, elementChildren, the textDigest image of stringValue, lastState) to Node(the textDigest image of package, the textDigest image of path, parent where {"kind":"compare","left":{"field":"start","kind":"field"},"op":"gt","right":{"kind":"literal","value":"~n:0"}}, at, end, the accumulator after plane 0 of the fold __node_children_count_fold_mue4fqjorm over the family Node.children, the accumulator after plane 0 of the fold __node_children_count_fold_fmibs64zod over the family Node.children, elements, the textDigest image of charsAfter, state)';

COMMENT ON CONSTRAINT "__node_fk_image_package_image_path_parent_pred_at_wsdpcfeczi" ON "qti"."node" IS 'foreign key Node(the textDigest image of package, the textDigest image of path, parent where {"kind":"compare","left":{"field":"start","kind":"field"},"op":"gt","right":{"kind":"literal","value":"~n:0"}}, pred(at), start, the accumulator before plane 0 of the fold __node_children_count_fold_mue4fqjorm over the family Node.children, the accumulator before plane 0 of the fold __node_children_count_fold_fmibs64zod over the family Node.children, elementsWas, the textDigest image of charsWas, was) to Node(the textDigest image of package, the textDigest image of path, parent where {"kind":"compare","left":{"field":"start","kind":"field"},"op":"gt","right":{"kind":"literal","value":"~n:0"}}, at, end, the accumulator after plane 0 of the fold __node_children_count_fold_mue4fqjorm over the family Node.children, the accumulator after plane 0 of the fold __node_children_count_fold_fmibs64zod over the family Node.children, elements, the textDigest image of charsAfter, state)';

COMMENT ON CONSTRAINT "__node_fk_package_path_start_35fr4eeug5" ON "qti"."node" IS 'foreign key Node(package where {"kind":"compare","left":{"args":[{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"kind":"literal","value":"baseType"}],"field":"slot","kind":"closedAt","relation":"AttributeGrammar"}],"fn":"singleton","kind":"compute"},{"field":"attrs","kind":"field"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}} and {"kind":"compare","left":{"args":[{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"kind":"literal","value":"fieldIdentifier"}],"field":"slot","kind":"closedAt","relation":"AttributeGrammar"}],"fn":"singleton","kind":"compute"},{"field":"attrs","kind":"field"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}} and {"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"ud:value"}}, path, start) to UsageValue(package, path, start)';

COMMENT ON CONSTRAINT "__open_attribute_fk_package_path_start_copy_open_3uvsj6ee55" ON "qti"."open_attribute" IS 'foreign key OpenAttribute(package, path, start, the owner''s count of the family Node.openAttributes, governor, kind) to Node(package, path, start, openAttributes, governor, kind)';

COMMENT ON CONSTRAINT "__open_attribute_fk_package_path_start_predecessor_6wt26reoml" ON "qti"."open_attribute" IS 'foreign key OpenAttribute(package, path, start, the predecessor of the index of the family Node.openAttributes) to OpenAttribute(package, path, start, the index of the family Node.openAttributes)';

COMMENT ON CONSTRAINT "__open_attribute_entity_fk_package_path_start_uri_ccjfi3dv74" ON "qti"."open_attribute_entity" IS 'foreign key OpenAttributeEntity(package, path, start, uri, local) to OpenAttribute(package, path, start, uri, local)';

COMMENT ON CONSTRAINT "__open_element_name_fk_package_path_start_dgkc2wpi7w" ON "qti"."open_element_name" IS 'foreign key OpenElementName(package, path, start) to Node(package, path, start)';

COMMENT ON CONSTRAINT "__open_element_type_fk_package_path_start_jjjipij4kp" ON "qti"."open_element_type" IS 'foreign key OpenElementType(package, path, start) to OpenElementName(package, path, start)';

COMMENT ON CONSTRAINT "__pci_module_form_fk_package_path_start_copy_module_keh62si5ne" ON "qti"."pci_module_form" IS 'foreign key PciModuleForm(package, path, start, the owner''s count of the family Interaction.moduleForms) to Interaction(package, path, start, moduleForms)';

COMMENT ON CONSTRAINT "__pci_module_form_fk_package_path_start_predecessor_72gwl37tcr" ON "qti"."pci_module_form" IS 'foreign key PciModuleForm(package, path, start, the predecessor of the index of the family Interaction.moduleForms) to PciModuleForm(package, path, start, the index of the family Interaction.moduleForms)';

COMMENT ON CONSTRAINT "__placed_binding_fk_package_assembly_adaptive_4vpvmxtpul" ON "qti"."placed_binding" IS 'foreign key PlacedBinding(package, assembly, adaptive) to ItemMode(package, path, adaptive)';

COMMENT ON CONSTRAINT "__placed_binding_fk_package_assembly_instance_copy_3fluktngez" ON "qti"."placed_binding" IS 'foreign key PlacedBinding(package, assembly, instance, the owner''s count of the family Instance.bindings) to Instance(package, assembly, start, bindings)';

COMMENT ON CONSTRAINT "__placed_binding_fk_package_assembly_instance_lrmdgzusck" ON "qti"."placed_binding" IS 'foreign key PlacedBinding(package, assembly, instance, the predecessor of the index of the family Instance.bindings) to PlacedBinding(package, assembly, instance, the index of the family Instance.bindings)';

COMMENT ON CONSTRAINT "__placed_binding_fk_image_package_image_path_start_kfjvclwbdd" ON "qti"."placed_binding" IS 'foreign key PlacedBinding(the textDigest image of package, the textDigest image of path, start, attribute, the textDigest image of identifier) to BindingName(the textDigest image of package, the textDigest image of path, start, attribute, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__placed_binding_fk_package_path_start_jvgrxcf4xe" ON "qti"."placed_binding" IS 'foreign key PlacedBinding(package where {"kind":"compare","left":{"field":"adaptive","kind":"field"},"op":"eq","right":{"kind":"literal","value":false}} and {"kind":"compare","left":{"field":"attribute","kind":"field"},"op":"eq","right":{"kind":"literal","value":"response-identifier"}}, path, start) to Node(package where {"arg":{"field":"kind","kind":"field"},"kind":"in","values":["qti-associate-interaction","qti-choice-interaction","qti-custom-interaction","qti-drawing-interaction","qti-end-attempt-interaction","qti-extended-text-interaction","qti-gap-match-interaction","qti-graphic-associate-interaction","qti-graphic-gap-match-interaction","qti-graphic-order-interaction","qti-hotspot-interaction","qti-hottext-interaction","qti-inline-choice-interaction","qti-match-interaction","qti-media-interaction","qti-order-interaction","qti-portable-custom-interaction","qti-position-object-interaction","qti-select-point-interaction","qti-slider-interaction","qti-text-entry-interaction","qti-upload-interaction"]} and {"kind":"compare","left":{"args":[{"field":"ancestry","kind":"field"},{"args":[{"kind":"literal","value":"qti-feedback-block"}],"kind":"closedRow","relation":"Enters"}],"fn":"disjoint","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}}, path, start)';

COMMENT ON CONSTRAINT "__placed_choice_fk_package_assembly_instance_copy_3yeakujuck" ON "qti"."placed_choice" IS 'foreign key PlacedChoice(package, assembly, instance, the owner''s count of the family Instance.choices, path) to Instance(package, assembly, start, choices, document)';

COMMENT ON CONSTRAINT "__placed_choice_fk_package_assembly_instance_cy5gpuayal" ON "qti"."placed_choice" IS 'foreign key PlacedChoice(package, assembly, instance, the predecessor of the index of the family Instance.choices) to PlacedChoice(package, assembly, instance, the index of the family Instance.choices)';

COMMENT ON CONSTRAINT "__placed_choice_fk_image_package_image_path_start_fokmayvt6a" ON "qti"."placed_choice" IS 'foreign key PlacedChoice(the textDigest image of package, the textDigest image of path, start, the textDigest image of identifier) to Choice(the textDigest image of package, the textDigest image of path, start, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__placed_hottext_fk_package_assembly_instance_copy_kcr4ogsb5x" ON "qti"."placed_hottext" IS 'foreign key PlacedHottext(package, assembly, instance, the owner''s count of the family Instance.hottexts, path) to Instance(package, assembly, start, hottexts, document)';

COMMENT ON CONSTRAINT "__placed_hottext_fk_package_assembly_instance_jnsx5y3ord" ON "qti"."placed_hottext" IS 'foreign key PlacedHottext(package, assembly, instance, the predecessor of the index of the family Instance.hottexts) to PlacedHottext(package, assembly, instance, the index of the family Instance.hottexts)';

COMMENT ON CONSTRAINT "__placed_hottext_fk_image_package_image_path_start_2hdxp6k63k" ON "qti"."placed_hottext" IS 'foreign key PlacedHottext(the textDigest image of package, the textDigest image of path, start, the textDigest image of identifier) to Hottext(the textDigest image of package, the textDigest image of path, start, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__placed_id_fk_package_assembly_instance_copy_ids_izrndy7kd4" ON "qti"."placed_id" IS 'foreign key PlacedId(package, assembly, instance, the owner''s count of the family Instance.ids, assemblyKind, path) to Instance(package, assembly, start, ids, assemblyKind, document)';

COMMENT ON CONSTRAINT "__placed_id_fk_package_assembly_instance_predecessor_atzlhmffck" ON "qti"."placed_id" IS 'foreign key PlacedId(package, assembly, instance, the predecessor of the index of the family Instance.ids) to PlacedId(package, assembly, instance, the index of the family Instance.ids)';

COMMENT ON CONSTRAINT "__placed_idref_fk_package_assembly_instance_copy_y6ekgq4pdf" ON "qti"."placed_idref" IS 'foreign key PlacedIdref(package, assembly, instance, the owner''s count of the family Instance.idrefTargets, path) to Instance(package, assembly, start, idrefTargets, document)';

COMMENT ON CONSTRAINT "__placed_idref_fk_package_assembly_instance_hz5f2hoyse" ON "qti"."placed_idref" IS 'foreign key PlacedIdref(package, assembly, instance, the predecessor of the index of the family Instance.idrefTargets) to PlacedIdref(package, assembly, instance, the index of the family Instance.idrefTargets)';

COMMENT ON CONSTRAINT "__placed_idref_fk_image_package_image_path_image_id_rlbv7doedt" ON "qti"."placed_idref" IS 'foreign key PlacedIdref(the textDigest image of package, the textDigest image of path, the textDigest image of id) to IdrefTarget(the textDigest image of package, the textDigest image of path, the textDigest image of id)';

COMMENT ON CONSTRAINT "__placed_math_rank_fk_package_assembly_instance_path_ne6gauiyao" ON "qti"."placed_math_rank" IS 'foreign key PlacedMathRank(package, assembly, instance, path) to Instance(package, assembly, start, document)';

COMMENT ON CONSTRAINT "__placed_math_rank_fk_package_path_start_5kblemgm5d" ON "qti"."placed_math_rank" IS 'foreign key PlacedMathRank(package, path, start) to Node(package, path, start)';

COMMENT ON CONSTRAINT "__placed_share_target_fk_package_assembly_instance_o7a22jy6p7" ON "qti"."placed_share_target" IS 'foreign key PlacedShareTarget(package, assembly, instance, path, assemblyKind) to Instance(package, assembly, start, document, assemblyKind)';

COMMENT ON CONSTRAINT "__placed_share_target_fk_package_assembly_instance_mcp6dsg3aq" ON "qti"."placed_share_target" IS 'foreign key PlacedShareTarget(package, assembly, instance, start) to PlacedMathRank(package, assembly, instance, start)';

COMMENT ON CONSTRAINT "__placed_share_target_fk_package_assembly_target_or2mupqns2" ON "qti"."placed_share_target" IS 'foreign key PlacedShareTarget(package, assembly, targetInstance, target) to Instance(package, assembly, start, document)';

COMMENT ON CONSTRAINT "__placed_share_target_fk_package_assembly_target_4oz3u75j3w" ON "qti"."placed_share_target" IS 'foreign key PlacedShareTarget(package, assembly, targetInstance, targetStart) to PlacedMathRank(package, assembly, instance, start)';

COMMENT ON CONSTRAINT "__placed_share_target_fk_package_path_start_vcyyao6ye2" ON "qti"."placed_share_target" IS 'foreign key PlacedShareTarget(package, path, start, the predecessor of the index of the family ShareFragment.placements) to PlacedShareTarget(package, path, start, the index of the family ShareFragment.placements)';

COMMENT ON CONSTRAINT "__placed_share_target_fk_imagecopy_package_imagecopy_fygoa7be6b" ON "qti"."placed_share_target" IS 'foreign key PlacedShareTarget(the textDigest image of package the family ShareFragment.placements carries onto its members, the textDigest image of path the family ShareFragment.placements carries onto its members, start, the owner''s count of the family ShareFragment.placements, the textDigest image of id the family ShareFragment.placements carries onto its members) to ShareFragment(the textDigest image of package, the textDigest image of path, start, placements, the textDigest image of id)';

COMMENT ON CONSTRAINT "__placed_variable_ref_fk_package_assembly_instance_dyps6psgkb" ON "qti"."placed_variable_ref" IS 'foreign key PlacedVariableRef(package, assembly, instance, the owner''s count of the family Instance.variables, path) to Instance(package, assembly, start, variables, document)';

COMMENT ON CONSTRAINT "__placed_variable_ref_fk_package_assembly_instance_4mpudl3t4u" ON "qti"."placed_variable_ref" IS 'foreign key PlacedVariableRef(package, assembly, instance, the predecessor of the index of the family Instance.variables) to PlacedVariableRef(package, assembly, instance, the index of the family Instance.variables)';

COMMENT ON CONSTRAINT "__placed_variable_ref_fk_package_assembly_root_kind_kyz7jvyo7u" ON "qti"."placed_variable_ref" IS 'foreign key PlacedVariableRef(package, assembly, rootKind) to Document(package, path, rootKind)';

COMMENT ON CONSTRAINT "__placed_variable_ref_fk_image_package_image_path_yskm3jisso" ON "qti"."placed_variable_ref" IS 'foreign key PlacedVariableRef(the textDigest image of package, the textDigest image of path, start, attribute, the textDigest image of identifier) to VariableRef(the textDigest image of package, the textDigest image of path, start, attribute, the textDigest image of identifier)';

COMMENT ON CONSTRAINT "__processing_fk_package_path_start_buuyxfkq34" ON "qti"."processing" IS 'foreign key Processing(package, path, start) to Node(package, path, start)';

COMMENT ON CONSTRAINT "__reference_path_fk_package_target_pch7muxr75" ON "qti"."reference_path" IS 'foreign key ReferencePath(package, target) to Entry(package, path)';

COMMENT ON CONSTRAINT "__referring_document_fk_package_path_pred_contexts_tekv3unp3s" ON "qti"."referring_document" IS 'foreign key ReferringDocument(package, path, pred(contexts)) to FragmentContextName(package, path, the index of the family ReferringDocument.contexts)';

COMMENT ON CONSTRAINT "__referring_document_fk_package_path_pred_feedbacks_u5un4znhy3" ON "qti"."referring_document" IS 'foreign key ReferringDocument(package, path, pred(feedbacks)) to FragmentFeedbackName(package, path, the index of the family ReferringDocument.feedbacks)';

COMMENT ON CONSTRAINT "__referring_document_fk_package_path_pred_prints_e4vmx7vqd3" ON "qti"."referring_document" IS 'foreign key ReferringDocument(package, path, pred(prints)) to FragmentPrintedName(package, path, the index of the family ReferringDocument.prints)';

COMMENT ON CONSTRAINT "__referring_document_fk_package_path_pred_templates_qu4ntcliqa" ON "qti"."referring_document" IS 'foreign key ReferringDocument(package, path, pred(templates)) to FragmentTemplateName(package, path, the index of the family ReferringDocument.templates)';

COMMENT ON CONSTRAINT "__resource_document_fk_package_path_root_kind_ejo23fxacl" ON "qti"."resource_document" IS 'foreign key ResourceDocument(package, path, rootKind, documentType) to Document(package, path, rootKind, documentType)';

COMMENT ON CONSTRAINT "__rounding_mode_figures_fk_image_package_image_path_blthitu5p3" ON "qti"."rounding_mode_figures" IS 'foreign key RoundingModeFigures(the textDigest image of package, the textDigest image of path, start, the textDigest image of figures) to RoundingFigures(the textDigest image of package, the textDigest image of path, start, the textDigest image of figures)';

COMMENT ON CONSTRAINT "__sd_decl_fk_package_path_xxx5gjp4e7" ON "qti"."sd_decl" IS 'foreign key SdDecl(package, path) to XmlDecl(package, path)';

COMMENT ON CONSTRAINT "__share_fragment_fk_package_path_assembled_vdozoufbmn" ON "qti"."share_fragment" IS 'foreign key ShareFragment(package, path, assembled) to Document(package, path, assembled)';

COMMENT ON CONSTRAINT "__share_fragment_fk_package_path_start_pred_ub5heqagwi" ON "qti"."share_fragment" IS 'foreign key ShareFragment(package, path, start, pred(placements)) to PlacedShareTarget(package, path, start, the index of the family ShareFragment.placements)';

COMMENT ON CONSTRAINT "__share_fragment_fk_image_package_image_path_image_sjifnzl47q" ON "qti"."share_fragment" IS 'foreign key ShareFragment(the textDigest image of package, the textDigest image of path, the textDigest image of id) to IdrefTarget(the textDigest image of package, the textDigest image of path, the textDigest image of id)';

COMMENT ON CONSTRAINT "__share_target_fk_package_path_start_vut3y6yjq2" ON "qti"."share_target" IS 'foreign key ShareTarget(package, path, start) to MathRank(package, path, start)';

COMMENT ON CONSTRAINT "__share_target_fk_package_path_target_start_lyzjcsg3y5" ON "qti"."share_target" IS 'foreign key ShareTarget(package, path, targetStart) to MathRank(package, path, start)';

COMMENT ON CONSTRAINT "__site_fk_package_path_start_children_ancestry_ghdva4523n" ON "qti"."site" IS 'foreign key Site(package, path, start, children, ancestry, governor, kind, nearest, nearestKind, nearestPath, parentKind) to Node(package, path, start, children, ancestry, governor, kind, nearest, nearestKind, nearestPath, parentKind)';

COMMENT ON CONSTRAINT "__site_fk_package_path_start_parent_ixokdifhad" ON "qti"."site" IS 'foreign key Site(package, path, start, parent) to Node(package, path, start, parent)';

COMMENT ON CONSTRAINT "__site_path_fk_package_path_start_kind_molhlyyxr4" ON "qti"."site_path" IS 'foreign key SitePath(package, path, start, kind) to Site(package, path, start, kind)';

COMMENT ON CONSTRAINT "__site_target_fk_package_path_start_ancestry_kind_lpxx2rpzvs" ON "qti"."site_target" IS 'foreign key SiteTarget(package, path, start, ancestry, kind, nearest, nearestKind, parentKind) to Site(package, path, start, ancestry, kind, nearest, nearestKind, parentKind)';

COMMENT ON CONSTRAINT "__site_target_fk_package_path_start_target_pozbyanaff" ON "qti"."site_target" IS 'foreign key SiteTarget(package, path, start, target) to SitePath(package, path, start, target)';

COMMENT ON CONSTRAINT "__site_target_fk_package_path_copy_targets_522i3ld5uq" ON "qti"."site_target" IS 'foreign key SiteTarget(package, path, the owner''s count of the family AssembledDocument.targets) to AssembledDocument(package, path, targets)';

COMMENT ON CONSTRAINT "__site_target_fk_package_path_predecessor_targets_sfbwqrdgbs" ON "qti"."site_target" IS 'foreign key SiteTarget(package, path, the predecessor of the index of the family AssembledDocument.targets, the accumulator before plane 0 of the fold __assembled_document_targets_count_fold_gzgl372iau over the family AssembledDocument.targets) to SiteTarget(package, path, the index of the family AssembledDocument.targets, the accumulator after plane 0 of the fold __assembled_document_targets_count_fold_gzgl372iau over the family AssembledDocument.targets)';

COMMENT ON CONSTRAINT "__site_target_fk_package_target_copy_targeted_by_mabgadjit7" ON "qti"."site_target" IS 'foreign key SiteTarget(package, target, the owner''s count of the family Document.targetedBy, targetNearest, targetNearestKind, targetNearestPath, targetRoot) to Document(package, path, targetedBy, contextNearest, contextNearestKind, contextPath, rootKind)';

COMMENT ON CONSTRAINT "__site_target_fk_package_target_predecessor_targeted_i4ioybk4ms" ON "qti"."site_target" IS 'foreign key SiteTarget(package, target, the predecessor of the index of the family Document.targetedBy, the accumulator before plane 0 of the fold __document_targeted_by_or_fold_q6g4eocaf6 over the family Document.targetedBy) to SiteTarget(package, target, the index of the family Document.targetedBy, the accumulator after plane 0 of the fold __document_targeted_by_or_fold_q6g4eocaf6 over the family Document.targetedBy)';

COMMENT ON CONSTRAINT "__srcset_fk_image_package_image_path_start_pred_f7f46urpwl" ON "qti"."srcset" IS 'foreign key Srcset(the textDigest image of package, the textDigest image of path, start, pred(tokens), the textDigest image of tokenText) to SrcsetCandidate(the textDigest image of package, the textDigest image of path, start, at, the textDigest image of piecesAfter)';

COMMENT ON CONSTRAINT "__srcset_candidate_fk_package_path_start_copy_tokens_prty6vocql" ON "qti"."srcset_candidate" IS 'foreign key SrcsetCandidate(package, path, start, the owner''s count of the family Srcset.tokens) to Srcset(package, path, start, tokens)';

COMMENT ON CONSTRAINT "__srcset_candidate_fk_image_package_image_path_start_3ffqa3l66g" ON "qti"."srcset_candidate" IS 'foreign key SrcsetCandidate(the textDigest image of package, the textDigest image of path, start, pred(at), the textDigest image of piecesWas) to SrcsetCandidate(the textDigest image of package, the textDigest image of path, start, at, the textDigest image of piecesAfter)';

COMMENT ON CONSTRAINT "__ssml_scope_fk_package_path_start_ixilycttqs" ON "qti"."ssml_scope" IS 'foreign key SsmlScope(package, path, start) to Node(package, path, start)';

COMMENT ON CONSTRAINT "__table_header_fk_package_path_start_dhca6a32iq" ON "qti"."table_header" IS 'foreign key TableHeader(package, path, start) to TableScope(package, path, start)';

COMMENT ON CONSTRAINT "__table_scope_fk_package_path_start_scalw6ieaw" ON "qti"."table_scope" IS 'foreign key TableScope(package, path, start) to Node(package, path, start)';

COMMENT ON CONSTRAINT "__text_idref_fk_package_path_start_copy_tokens_hkmj36vgbn" ON "qti"."text_idref" IS 'foreign key TextIdref(package, path, start, the owner''s count of the family IdentityText.tokens) to IdentityText(package, path, start, tokens)';

COMMENT ON CONSTRAINT "__text_idref_fk_image_package_image_path_start_pred_ffsn3dgfq5" ON "qti"."text_idref" IS 'foreign key TextIdref(the textDigest image of package, the textDigest image of path, start, pred(at), the textDigest image of piecesWas) to TextIdref(the textDigest image of package, the textDigest image of path, start, at, the textDigest image of piecesAfter)';

COMMENT ON CONSTRAINT "__text_idref_fk_image_package_image_path_image_token_4pqg6lzbza" ON "qti"."text_idref" IS 'foreign key TextIdref(the textDigest image of package, the textDigest image of path, the textDigest image of token) to IdrefTarget(the textDigest image of package, the textDigest image of path, the textDigest image of id)';

COMMENT ON CONSTRAINT "__text_reference_path_fk_package_target_7wuvskqxw6" ON "qti"."text_reference_path" IS 'foreign key TextReferencePath(package, target) to Entry(package, path)';

COMMENT ON CONSTRAINT "__tolerance_fk_image_package_image_path_start_pred_pao2kfjjm5" ON "qti"."tolerance" IS 'foreign key Tolerance(the textDigest image of package, the textDigest image of path, start, pred(tokens), the textDigest image of tokenText) to ToleranceToken(the textDigest image of package, the textDigest image of path, start, at, the textDigest image of piecesAfter)';

COMMENT ON CONSTRAINT "__tolerance_token_fk_package_path_start_copy_tokens_hgndbm6n65" ON "qti"."tolerance_token" IS 'foreign key ToleranceToken(package, path, start, the owner''s count of the family Tolerance.tokens) to Tolerance(package, path, start, tokens)';

COMMENT ON CONSTRAINT "__tolerance_token_fk_image_package_image_path_start_wyrgtstoie" ON "qti"."tolerance_token" IS 'foreign key ToleranceToken(the textDigest image of package, the textDigest image of path, start, pred(at), the textDigest image of piecesWas) to ToleranceToken(the textDigest image of package, the textDigest image of path, start, at, the textDigest image of piecesAfter)';

COMMENT ON CONSTRAINT "__usage_value_fk_package_path_start_hgeaq5bglh" ON "qti"."usage_value" IS 'foreign key UsageValue(package, path, start) to Node(package where {"kind":"compare","left":{"args":[{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"kind":"literal","value":"baseType"}],"field":"slot","kind":"closedAt","relation":"AttributeGrammar"}],"fn":"singleton","kind":"compute"},{"field":"attrs","kind":"field"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}} and {"kind":"compare","left":{"args":[{"args":[{"args":[{"args":[{"field":"governor","kind":"field"}],"field":"model","kind":"closedAt","relation":"AttributeModelOf"},{"kind":"literal","value":"fieldIdentifier"}],"field":"slot","kind":"closedAt","relation":"AttributeGrammar"}],"fn":"singleton","kind":"compute"},{"field":"attrs","kind":"field"}],"fn":"subset","kind":"compute"},"op":"eq","right":{"kind":"literal","value":true}} and {"kind":"compare","left":{"field":"kind","kind":"field"},"op":"eq","right":{"kind":"literal","value":"ud:value"}}, path, start)';

COMMENT ON CONSTRAINT "__usage_value_fk_image_package_image_path_start_isiw43fhwn" ON "qti"."usage_value" IS 'foreign key UsageValue(the textDigest image of package, the textDigest image of path, start, the textDigest image of text) to Node(the textDigest image of package, the textDigest image of path, start, the textDigest image of stringValue)';

COMMENT ON CONSTRAINT "__usage_value_base_type_fk_image_package_image_path_qrgg7olnaw" ON "qti"."usage_value_base_type" IS 'foreign key UsageValueBaseType(the textDigest image of package, the textDigest image of path, start, the textDigest image of text) to Node(the textDigest image of package, the textDigest image of path, start, the textDigest image of stringValue)';

COMMENT ON CONSTRAINT "__variable_ref_fk_package_path_start_attribute_mtdx46lozb" ON "qti"."variable_ref" IS 'foreign key VariableRef(package, path, start, attribute) to Attribute(package, path, start, name)';

COMMENT ON CONSTRAINT "__variable_ref_fk_package_path_copy_variables_root_34sbliitcl" ON "qti"."variable_ref" IS 'foreign key VariableRef(package, path, the owner''s count of the family Document.variables, rootKind) to Document(package, path, variables, rootKind)';

COMMENT ON CONSTRAINT "__variable_ref_fk_package_path_predecessor_variables_aub5ukyc33" ON "qti"."variable_ref" IS 'foreign key VariableRef(package, path, the predecessor of the index of the family Document.variables) to VariableRef(package, path, the index of the family Document.variables)';

COMMENT ON CONSTRAINT "__xml_decl_fk_package_path_ge2web3hon" ON "qti"."xml_decl" IS 'foreign key XmlDecl(package, path) to Document(package, path)';

COMMENT ON INDEX "qti"."__assembled_catalog_ix_image_package_image_assembly_vko2g4jyoz" IS 'btree index AssembledCatalog(image(package), image(assembly), image(id))';

COMMENT ON INDEX "qti"."__assembled_catalog_ix_package_path_owner_yng35odexo" IS 'btree index AssembledCatalog(package, path, owner)';

COMMENT ON INDEX "qti"."__attribute_ix_image_package_x_4_j_5_zex_3_fr_image_mallpmfxza" IS 'btree index Attribute(__image_package_x4j5zex3fr, __image_path_ff7ysgcuo3, start, name, __pred_idrefs_2kinxrebfw)';

COMMENT ON INDEX "qti"."__attribute_ix_package_a_4_p_2_u_7_pv_6_l_path_start_2cajllfvyt" IS 'btree index Attribute(__package_a4p2u7pv6l, path, start, name)';

COMMENT ON INDEX "qti"."__attribute_ix_image_package_image_path_image_value_czo5r26w2r" IS 'btree index Attribute(image(package), image(path), image(value), name, start)';

COMMENT ON INDEX "qti"."__attribute_ix_image_package_image_path_name_kind_dutwtapsk3" IS 'btree index Attribute(image(package), image(path), name, kind, image(value), start)';

COMMENT ON INDEX "qti"."__attribute_ix_image_package_image_path_start_image_xdis6ifuer" IS 'btree index Attribute(image(package), image(path), start, image(value))';

COMMENT ON INDEX "qti"."__attribute_ix_image_package_name_image_value_kind_gmpafhkkqi" IS 'btree index Attribute(image(package), name, image(value), kind, image(path), start)';

COMMENT ON INDEX "qti"."__attribute_ix_image_package_name_kind_start_image_6hn2mprhfl" IS 'btree index Attribute(image(package), name, kind, start, image(value), image(path))';

COMMENT ON INDEX "qti"."__attribute_ix_package_path_start_kind_name_zgakbm2bpc" IS 'btree index Attribute(package, path, start, kind, name)';

COMMENT ON INDEX "qti"."__bound_variable_ix_package_pyofn_3_cand_path_start_msbzzspyze" IS 'btree index BoundVariable(__package_pyofn3cand, path, start)';

COMMENT ON INDEX "qti"."__bound_variable_ix_image_package_image_path_image_hbj6q5i26o" IS 'btree index BoundVariable(image(package), image(path), image(identifier))';

COMMENT ON INDEX "qti"."__bound_variable_ix_package_attribute_path_ej2y7oq7v2" IS 'btree index BoundVariable(package, attribute, path)';

COMMENT ON INDEX "qti"."__bound_variable_ix_package_path_adaptive_khkcbwhnkh" IS 'btree index BoundVariable(package, path, adaptive)';

COMMENT ON INDEX "qti"."__bound_variable_ix_package_path_attribute_ophjg3fmft" IS 'btree index BoundVariable(package, path, attribute)';

COMMENT ON INDEX "qti"."__candidate_path_ix_package_target_6vqzdz37df" IS 'btree index CandidatePath(package, target)';

COMMENT ON INDEX "qti"."__catalog_id_ix_image_package_image_path_image_id_qdfecuuspz" IS 'btree index CatalogId(image(package), image(path), image(id))';

COMMENT ON INDEX "qti"."__cell_headers_ix_image_package_x_4_j_5_zex_3_fr_3xok7jezqu" IS 'btree index CellHeaders(__image_package_x4j5zex3fr, __image_path_ff7ysgcuo3, start, __pred_tokens_ip7mlgrtju)';

COMMENT ON INDEX "qti"."__choice_ix_image_package_image_path_image_42ih2cal6v" IS 'btree index Choice(image(package), image(path), image(identifier), start)';

COMMENT ON INDEX "qti"."__data_ssml_property_ix_image_package_x_4_j_5_zex_3_xvrr6kf5ah" IS 'btree index DataSsmlProperty(__image_package_x4j5zex3fr, __image_path_ff7ysgcuo3, start, member, __image_member_name_qqbvqrei53)';

COMMENT ON INDEX "qti"."__data_ssml_property_ix_image_package_image_path_eq53fxd7ev" IS 'btree index DataSsmlProperty(image(package), image(path), start, member, image(name))';

COMMENT ON INDEX "qti"."__document_ix_package_assembled_path_6hx6cticyt" IS 'btree index Document(package, assembled, path)';

COMMENT ON INDEX "qti"."__document_id_ix_package_path_admitted_owner_jp55imcxjo" IS 'btree index DocumentId(package, path, admitted, owner)';

COMMENT ON INDEX "qti"."__expression_ix_package_path_base_type_start_tun2l55ql4" IS 'btree index Expression(package, path, baseType, start)';

COMMENT ON INDEX "qti"."__file_ix_image_package_image_path_scope_image_xiashzph6u" IS 'btree index File(image(package), image(path), scope, image(target))';

COMMENT ON INDEX "qti"."__file_ix_image_package_scope_image_target_image_eagljjolgi" IS 'btree index File(image(package), scope, image(target), image(path))';

COMMENT ON INDEX "qti"."__fragment_context_ref_ix_image_package_x_4_j_5_zex_erekzljbvi" IS 'btree index FragmentContextRef(__image_package_x4j5zex3fr, __image_path_ff7ysgcuo3, start, attribute, kind, __image_identifier_sp263ko24n)';

COMMENT ON INDEX "qti"."__fragment_feedback_ref_ix_image_package_x_4_j_5_zex_3dodziwwlo" IS 'btree index FragmentFeedbackRef(__image_package_x4j5zex3fr, __image_path_ff7ysgcuo3, start, attribute, kind, __image_identifier_sp263ko24n)';

COMMENT ON INDEX "qti"."__fragment_printed_ref_ix_image_package_x_4_j_5_zex_vdm2bacpw7" IS 'btree index FragmentPrintedRef(__image_package_x4j5zex3fr, __image_path_ff7ysgcuo3, start, attribute, kind, __image_identifier_sp263ko24n)';

COMMENT ON INDEX "qti"."__fragment_scope_ix_package_document_feedbacks_txlrykzdtc" IS 'btree index FragmentScope(package, document, feedbacks, prints, templates, contexts)';

COMMENT ON INDEX "qti"."__fragment_template_ref_ix_image_package_x_4_j_5_zex_rlpzvisham" IS 'btree index FragmentTemplateRef(__image_package_x4j5zex3fr, __image_path_ff7ysgcuo3, start, attribute, kind, __image_identifier_sp263ko24n)';

COMMENT ON INDEX "qti"."__header_token_ix_image_package_x_4_j_5_zex_3_fr_nkboycyl3v" IS 'btree index HeaderToken(__image_package_x4j5zex3fr, __image_path_ff7ysgcuo3, start, __pred_at_xktcobhsti)';

COMMENT ON INDEX "qti"."__hottext_ix_image_package_image_path_image_vcziazdj36" IS 'btree index Hottext(image(package), image(path), image(identifier), start)';

COMMENT ON INDEX "qti"."__identity_text_ix_image_package_x_4_j_5_zex_3_fr_eox7lzaxub" IS 'btree index IdentityText(__image_package_x4j5zex3fr, __image_path_ff7ysgcuo3, start, __pred_tokens_ip7mlgrtju)';

COMMENT ON INDEX "qti"."__idref_ix_image_package_x_4_j_5_zex_3_fr_image_path_o4ttxmfqsc" IS 'btree index Idref(__image_package_x4j5zex3fr, __image_path_ff7ysgcuo3, __image_token_arko66iuth)';

COMMENT ON INDEX "qti"."__idref_ix_image_package_x_4_j_5_zex_3_fr_image_path_w6jwcsdgbn" IS 'btree index Idref(__image_package_x4j5zex3fr, __image_path_ff7ysgcuo3, start, name, __pred_at_xktcobhsti)';

COMMENT ON INDEX "qti"."__idref_ix_package_path_name_ckzbix4lpw" IS 'btree index Idref(package, path, name)';

COMMENT ON INDEX "qti"."__idref_target_ix_package_path_assembled_4j2motbov2" IS 'btree index IdrefTarget(package, path, assembled)';

COMMENT ON INDEX "qti"."__instance_ix_package_assembly_kind_assembly_zz7dcr5yl2" IS 'btree index Instance(package, assemblyKind, assembly, document, parent, siteDocument, site)';

COMMENT ON INDEX "qti"."__instance_ix_package_assembly_kind_assembly_end_v3qlf6dvmo" IS 'btree index Instance(package, assemblyKind, assembly, end, document)';

COMMENT ON INDEX "qti"."__instance_ix_package_assembly_kind_assembly_end_7f7duawmit" IS 'btree index Instance(package, assemblyKind, assembly, end, parent)';

COMMENT ON INDEX "qti"."__instance_ix_package_assembly_kind_assembly_parent_myoodornlp" IS 'btree index Instance(package, assemblyKind, assembly, parent, site, siteDocument)';

COMMENT ON INDEX "qti"."__instance_ix_package_assembly_kind_assembly_parent_rrroul6xqw" IS 'btree index Instance(package, assemblyKind, assembly, parent, siteDocument)';

COMMENT ON INDEX "qti"."__instance_ix_package_assembly_kind_assembly_site_seisqygrho" IS 'btree index Instance(package, assemblyKind, assembly, site, siteDocument)';

COMMENT ON INDEX "qti"."__instance_ix_package_assembly_kind_assembly_site_ejmmvqaw55" IS 'btree index Instance(package, assemblyKind, assembly, siteDocument, document, site)';

COMMENT ON INDEX "qti"."__instance_ix_package_assembly_kind_document_start_gmzy7vbo64" IS 'btree index Instance(package, assemblyKind, document, start, assembly)';

COMMENT ON INDEX "qti"."__instance_ix_package_assembly_kind_parent_site_45cjl4twgd" IS 'btree index Instance(package, assemblyKind, parent, site)';

COMMENT ON INDEX "qti"."__instance_ix_package_document_ids_idref_targets_3kuzxyrfyq" IS 'btree index Instance(package, document, ids, idrefTargets, choices, hottexts)';

COMMENT ON INDEX "qti"."__instance_ix_package_document_root_kind_rubmvpymix" IS 'btree index Instance(package, document, rootKind)';

COMMENT ON INDEX "qti"."__instance_ix_package_site_site_document_assembly_4dyuszlqmg" IS 'btree index Instance(package, site, siteDocument, assemblyKind, start)';

COMMENT ON INDEX "qti"."__instance_ix_package_start_document_assembly_rmwvqsnjiw" IS 'btree index Instance(package, start, document, assembly)';

COMMENT ON INDEX "qti"."__interaction_attribute_ix_image_package_5_bjgttgjue_jrjdeo7ss5" IS 'btree index InteractionAttribute(__image_package_5bjgttgjue, __image_path_ff7ysgcuo3, start, name, __image_value_dmndzoe5g5)';

COMMENT ON INDEX "qti"."__interaction_attribute_ix_image_package_7_tsrkngiba_lqlkuxmjh4" IS 'btree index InteractionAttribute(__image_package_7tsrkngiba, __image_path_ff7ysgcuo3, start, name, kind, rootKind, __image_value_dmndzoe5g5)';

COMMENT ON INDEX "qti"."__interaction_attribute_ix_image_package_exckv_5_uowkyttgdm" IS 'btree index InteractionAttribute(__image_package_exckv5jfmt, __image_path_ff7ysgcuo3, start, name, kind, __image_value_dmndzoe5g5)';

COMMENT ON INDEX "qti"."__interaction_attribute_ix_image_package_ibdsk_7_rpbs74jweu" IS 'btree index InteractionAttribute(__image_package_ibdsk7qumz, __image_path_ff7ysgcuo3, start, name, kind, rootKind, __image_value_dmndzoe5g5)';

COMMENT ON INDEX "qti"."__interaction_attribute_ix_image_package_jpnodyqj_4_3z5hx4zi7h" IS 'btree index InteractionAttribute(__image_package_jpnodyqj4e, __image_path_ff7ysgcuo3, start, name, kind, __image_value_dmndzoe5g5)';

COMMENT ON INDEX "qti"."__interaction_attribute_ix_image_package_k_2_gcvxo_2_hsksfhoele" IS 'btree index InteractionAttribute(__image_package_k2gcvxo2zg, __image_path_ff7ysgcuo3, start, name, kind, rootKind, __image_value_dmndzoe5g5)';

COMMENT ON INDEX "qti"."__interaction_attribute_ix_image_package_lr_7_h53dsj6bxn" IS 'btree index InteractionAttribute(__image_package_lr7wlxhost, __image_path_ff7ysgcuo3, start, name, __image_value_dmndzoe5g5)';

COMMENT ON INDEX "qti"."__interaction_attribute_ix_image_package_nyr_6_a2dcdznjy2" IS 'btree index InteractionAttribute(__image_package_nyr6mqgwus, __image_path_ff7ysgcuo3, start, name, kind, __image_value_dmndzoe5g5)';

COMMENT ON INDEX "qti"."__interaction_attribute_ix_image_package_ty_3_sdt6tgpttr" IS 'btree index InteractionAttribute(__image_package_ty3wsixbgo, __image_path_ff7ysgcuo3, start, name, kind, __image_value_dmndzoe5g5)';

COMMENT ON INDEX "qti"."__interaction_attribute_ix_image_package_uxpxcua_7_vjyy56d3of" IS 'btree index InteractionAttribute(__image_package_uxpxcua7wm, __image_path_ff7ysgcuo3, start, name, kind, rootKind, __image_value_dmndzoe5g5)';

COMMENT ON INDEX "qti"."__interaction_attribute_ix_image_package_image_path_ynrjoksedr" IS 'btree index InteractionAttribute(image(package), image(path), name, kind, image(value), start)';

COMMENT ON INDEX "qti"."__interaction_attribute_ix_package_path_root_kind_tqpqhhqjmc" IS 'btree index InteractionAttribute(package, path, rootKind)';

COMMENT ON INDEX "qti"."__item_ref_document_ix_package_target_x3gzopozhy" IS 'btree index ItemRefDocument(package, target)';

COMMENT ON INDEX "qti"."__item_ref_href_ix_package_target_6kwzgt4wre" IS 'btree index ItemRefHref(package, target)';

COMMENT ON INDEX "qti"."__label_use_ix_package_path_root_kind_gkglyfua6p" IS 'btree index LabelUse(package, path, rootKind)';

COMMENT ON INDEX "qti"."__link_reading_ix_package_attribute_path_start_ybt62rlyn6" IS 'btree index LinkReading(package, attribute, path, start)';

COMMENT ON INDEX "qti"."__literal_typed_ix_image_package_x_4_j_5_zex_3_fr_bhwdj3us7u" IS 'btree index LiteralTyped(__image_package_x4j5zex3fr, __image_path_ff7ysgcuo3, start, __image_text_nik2jnknxc, baseType)';

COMMENT ON INDEX "qti"."__named_ix_image_package_image_identifier_image_path_slgy72oqww" IS 'btree index Named(image(package), image(identifier), image(path))';

COMMENT ON INDEX "qti"."__node_ix_image_package_x_4_j_5_zex_3_fr_image_path_xbijfoie3n" IS 'btree index Node(__image_package_x4j5zex3fr, __image_path_ff7ysgcuo3, __parent_l4ckjnvwat, __pred_at_xktcobhsti)';

COMMENT ON INDEX "qti"."__node_ix_image_package_x_4_j_5_zex_3_fr_image_path_ecwpsmqrd6" IS 'btree index Node(__image_package_x4j5zex3fr, __image_path_ff7ysgcuo3, start, __pred_children_nrfpkqcaen)';

COMMENT ON INDEX "qti"."__node_ix_package_kind_parent_kind_element_children_adichcjcn5" IS 'btree index Node(package, kind, parentKind, elementChildren, path)';

COMMENT ON INDEX "qti"."__node_ix_package_parent_kind_path_start_6zgfzdfjgw" IS 'btree index Node(package, parentKind, path, start)';

COMMENT ON INDEX "qti"."__node_ix_package_path_element_children_7nzzqbvcpo" IS 'btree index Node(package, path, elementChildren)';

COMMENT ON INDEX "qti"."__node_ix_package_path_end_kind_parent_gyibajsdba" IS 'btree index Node(package, path, end, kind, parent)';

COMMENT ON INDEX "qti"."__node_ix_package_path_kind_parent_kind_element_4i3tlpu47i" IS 'btree index Node(package, path, kind, parentKind, elementChildren)';

COMMENT ON INDEX "qti"."__node_ix_package_path_kind_parent_kind_elements_joehbu4lt4" IS 'btree index Node(package, path, kind, parentKind, elements)';

COMMENT ON INDEX "qti"."__node_ix_package_path_parent_at_3js7ucei5d" IS 'btree index Node(package, path, parent, at)';

COMMENT ON INDEX "qti"."__node_ix_package_path_parent_elements_eiswbbzaxd" IS 'btree index Node(package, path, parent, elements)';

COMMENT ON INDEX "qti"."__node_ix_package_path_parent_kind_elements_ydkakyedc3" IS 'btree index Node(package, path, parent, kind, elements)';

COMMENT ON INDEX "qti"."__node_ix_package_path_parent_kind_parent_kind_d5hqnr55hg" IS 'btree index Node(package, path, parentKind, parent, kind)';

COMMENT ON INDEX "qti"."__node_ix_package_start_kind_path_wfqsgvcv6x" IS 'btree index Node(package, start, kind, path)';

COMMENT ON INDEX "qti"."__numbered_reading_ix_image_package_attribute_image_dfl3tt2u4p" IS 'btree index NumberedReading(image(package), attribute, image(path), start, image(variable))';

COMMENT ON INDEX "qti"."__numbered_reading_ix_image_package_image_assembly_z3yteq6xbs" IS 'btree index NumberedReading(image(package), image(assembly), image(path), start, attribute, scopeInstance, scope, image(number))';

COMMENT ON INDEX "qti"."__numbered_reading_ix_image_package_image_variable_7nzmwgc3jl" IS 'btree index NumberedReading(image(package), image(variable), image(assembly), scope, scopeInstance, image(scopePath))';

COMMENT ON INDEX "qti"."__open_attribute_ix_package_path_start_kind_2umcdya4be" IS 'btree index OpenAttribute(package, path, start, kind)';

COMMENT ON INDEX "qti"."__pci_module_form_ix_package_path_element_start_j6pwi6afuc" IS 'btree index PciModuleForm(package, path, element, start)';

COMMENT ON INDEX "qti"."__placed_binding_ix_image_package_x_4_j_5_zex_3_fr_rcnog6f6kb" IS 'btree index PlacedBinding(__image_package_x4j5zex3fr, __image_path_ff7ysgcuo3, start, attribute, __image_identifier_sp263ko24n)';

COMMENT ON INDEX "qti"."__placed_binding_ix_package_pyofn_3_cand_path_start_xuyitwy3ee" IS 'btree index PlacedBinding(__package_pyofn3cand, path, start)';

COMMENT ON INDEX "qti"."__placed_binding_ix_image_package_image_assembly_4wumvl4j45" IS 'btree index PlacedBinding(image(package), image(assembly), image(identifier))';

COMMENT ON INDEX "qti"."__placed_binding_ix_package_assembly_adaptive_lv5atayv6x" IS 'btree index PlacedBinding(package, assembly, adaptive)';

COMMENT ON INDEX "qti"."__placed_binding_ix_package_attribute_path_start_x763qgcg2v" IS 'btree index PlacedBinding(package, attribute, path, start)';

COMMENT ON INDEX "qti"."__placed_choice_ix_image_package_x_4_j_5_zex_3_fr_oxwhei67yw" IS 'btree index PlacedChoice(__image_package_x4j5zex3fr, __image_path_ff7ysgcuo3, start, __image_identifier_sp263ko24n)';

COMMENT ON INDEX "qti"."__placed_choice_ix_image_package_image_assembly_i47d63k3a4" IS 'btree index PlacedChoice(image(package), image(assembly), image(identifier))';

COMMENT ON INDEX "qti"."__placed_hottext_ix_image_package_x_4_j_5_zex_3_fr_gfw25ipu6w" IS 'btree index PlacedHottext(__image_package_x4j5zex3fr, __image_path_ff7ysgcuo3, start, __image_identifier_sp263ko24n)';

COMMENT ON INDEX "qti"."__placed_hottext_ix_image_package_image_assembly_qk3xccixbi" IS 'btree index PlacedHottext(image(package), image(assembly), image(identifier))';

COMMENT ON INDEX "qti"."__placed_id_ix_image_package_image_assembly_image_id_zt4uwgwinp" IS 'btree index PlacedId(image(package), image(assembly), image(id), owner, image(path), instance)';

COMMENT ON INDEX "qti"."__placed_idref_ix_image_package_x_4_j_5_zex_3_fr_3df556lvhm" IS 'btree index PlacedIdref(__image_package_x4j5zex3fr, __image_path_ff7ysgcuo3, __image_id_cggscgoxcc)';

COMMENT ON INDEX "qti"."__placed_math_rank_ix_package_assembly_instance_path_xlmxodty27" IS 'btree index PlacedMathRank(package, assembly, instance, path)';

COMMENT ON INDEX "qti"."__placed_math_rank_ix_package_path_start_v42fxoxi7w" IS 'btree index PlacedMathRank(package, path, start)';

COMMENT ON INDEX "qti"."__placed_share_target_ix_imagecopy_package_4_oudcg_2_qerhdzr4rs" IS 'btree index PlacedShareTarget(__imagecopy_package_4oudcg2ick, __imagecopy_path_2uz6mcb5mg, start)';

COMMENT ON INDEX "qti"."__placed_share_target_ix_package_assembly_instance_iapuqjl64s" IS 'btree index PlacedShareTarget(package, assembly, instance, path, assemblyKind)';

COMMENT ON INDEX "qti"."__placed_share_target_ix_package_assembly_target_k66b7bmx5u" IS 'btree index PlacedShareTarget(package, assembly, targetInstance, target)';

COMMENT ON INDEX "qti"."__placed_share_target_ix_package_assembly_target_fpl23rvteo" IS 'btree index PlacedShareTarget(package, assembly, targetInstance, targetStart)';

COMMENT ON INDEX "qti"."__placed_variable_ref_ix_image_package_x_4_j_5_zex_3_jtt4cdq7la" IS 'btree index PlacedVariableRef(__image_package_x4j5zex3fr, __image_path_ff7ysgcuo3, start, attribute, __image_identifier_sp263ko24n)';

COMMENT ON INDEX "qti"."__placed_variable_ref_ix_image_package_image_txql4a7puk" IS 'btree index PlacedVariableRef(image(package), image(assembly), resolution, image(identifier), attribute)';

COMMENT ON INDEX "qti"."__placed_variable_ref_ix_package_assembly_root_kind_ox6jmeuv4f" IS 'btree index PlacedVariableRef(package, assembly, rootKind)';

COMMENT ON INDEX "qti"."__placed_variable_ref_ix_package_resolution_dgkqzkehhp" IS 'btree index PlacedVariableRef(package, resolution, attribute, path, start)';

COMMENT ON INDEX "qti"."__reference_path_ix_package_kind_name_target_5jaummkw5u" IS 'btree index ReferencePath(package, kind, name, target)';

COMMENT ON INDEX "qti"."__reference_path_ix_package_target_path_start_37so7ufnoh" IS 'btree index ReferencePath(package, target, path, start)';

COMMENT ON INDEX "qti"."__resource_href_ix_image_package_image_target_image_oioasdltxr" IS 'btree index ResourceHref(image(package), image(target), image(path))';

COMMENT ON INDEX "qti"."__rounding_mode_figures_ix_image_package_x_4_j_5_zex_4wtktowaqb" IS 'btree index RoundingModeFigures(__image_package_x4j5zex3fr, __image_path_ff7ysgcuo3, start, __image_figures_sc25qjl32r)';

COMMENT ON INDEX "qti"."__share_fragment_ix_image_package_x_4_j_5_zex_3_fr_yv6ddwwmzh" IS 'btree index ShareFragment(__image_package_x4j5zex3fr, __image_path_ff7ysgcuo3, __image_id_cggscgoxcc)';

COMMENT ON INDEX "qti"."__share_fragment_ix_package_path_assembled_start_njqql36dxw" IS 'btree index ShareFragment(package, path, assembled, start)';

COMMENT ON INDEX "qti"."__share_target_ix_package_path_target_start_vj2n53ubgi" IS 'btree index ShareTarget(package, path, targetStart)';

COMMENT ON INDEX "qti"."__site_path_ix_package_entry_path_start_lzli5pxkzl" IS 'btree index SitePath(package, entry, path, start)';

COMMENT ON INDEX "qti"."__site_target_ix_package_target_splices_ufrlh7idlc" IS 'btree index SiteTarget(package, target, splices)';

COMMENT ON INDEX "qti"."__srcset_ix_image_package_x_4_j_5_zex_3_fr_image_25hujungwo" IS 'btree index Srcset(__image_package_x4j5zex3fr, __image_path_ff7ysgcuo3, start, __pred_tokens_ip7mlgrtju)';

COMMENT ON INDEX "qti"."__srcset_candidate_ix_image_package_x_4_j_5_zex_3_fr_prca27j34e" IS 'btree index SrcsetCandidate(__image_package_x4j5zex3fr, __image_path_ff7ysgcuo3, start, __pred_at_xktcobhsti)';

COMMENT ON INDEX "qti"."__table_header_ix_image_package_image_path_image_id_dgdi2cfubx" IS 'btree index TableHeader(image(package), image(path), image(id))';

COMMENT ON INDEX "qti"."__text_idref_ix_image_package_x_4_j_5_zex_3_fr_image_dkyguijg6x" IS 'btree index TextIdref(__image_package_x4j5zex3fr, __image_path_ff7ysgcuo3, __image_token_arko66iuth)';

COMMENT ON INDEX "qti"."__text_idref_ix_image_package_x_4_j_5_zex_3_fr_image_krak7rquxa" IS 'btree index TextIdref(__image_package_x4j5zex3fr, __image_path_ff7ysgcuo3, start, __pred_at_xktcobhsti)';

COMMENT ON INDEX "qti"."__text_reference_path_ix_package_target_zlcnodi5ns" IS 'btree index TextReferencePath(package, target)';

COMMENT ON INDEX "qti"."__tolerance_ix_image_package_x_4_j_5_zex_3_fr_image_ekoz6lukb2" IS 'btree index Tolerance(__image_package_x4j5zex3fr, __image_path_ff7ysgcuo3, start, __pred_tokens_ip7mlgrtju)';

COMMENT ON INDEX "qti"."__tolerance_token_ix_image_package_x_4_j_5_zex_3_fr_ndb2zlqdga" IS 'btree index ToleranceToken(__image_package_x4j5zex3fr, __image_path_ff7ysgcuo3, start, __pred_at_xktcobhsti)';

COMMENT ON INDEX "qti"."__usage_value_ix_image_package_x_4_j_5_zex_3_fr_yprxu5ceka" IS 'btree index UsageValue(__image_package_x4j5zex3fr, __image_path_ff7ysgcuo3, start, __image_text_nik2jnknxc)';

COMMENT ON INDEX "qti"."__usage_value_base_type_ix_image_package_x_4_j_5_zex_4ffcoqyiki" IS 'btree index UsageValueBaseType(__image_package_x4j5zex3fr, __image_path_ff7ysgcuo3, start, __image_text_nik2jnknxc)';

COMMENT ON INDEX "qti"."__variable_ref_ix_image_package_attribute_image_path_oxcbndli3l" IS 'btree index VariableRef(image(package), attribute, image(path), image(identifier), resolution)';

COMMENT ON INDEX "qti"."__variable_ref_ix_image_package_image_identifier_c7fg6qqhbs" IS 'btree index VariableRef(image(package), image(identifier), image(path), start)';

COMMENT ON INDEX "qti"."__variable_ref_ix_package_path_resolution_attribute_dqjwdvgtzk" IS 'btree index VariableRef(package, path, resolution, attribute, start)';

COMMENT ON INDEX "qti"."__variable_ref_ix_package_resolution_path_start_auwdsqycbn" IS 'btree index VariableRef(package, resolution, path, start, attribute)';

COMMENT ON INDEX "qti"."__variable_ref_table_ix_package_path_table_zemw44j2nk" IS 'btree index VariableRefTable(package, path, table)';

COMMENT ON STATISTICS "qti"."__attribute_stats_package_path_start_uo6glmb56i" IS 'statistics Attribute(package, path, start)';

COMMENT ON STATISTICS "qti"."__attribute_entity_stats_name_package_path_start_7caqvjbetk" IS 'statistics AttributeEntity(name, package, path, start)';

COMMENT ON STATISTICS "qti"."__namespace_stats_package_path_start_gydqlm2xgj" IS 'statistics Namespace(package, path, start)';

COMMENT ON STATISTICS "qti"."__node_stats_package_path_xnpndnqkuf" IS 'statistics Node(package, path)';

COMMENT ON STATISTICS "qti"."__open_attribute_stats_package_path_start_z3huhl5634" IS 'statistics OpenAttribute(package, path, start)';

COMMENT ON STATISTICS "qti"."__open_attribute_entity_stats_local_package_path_hbzt3b2u5g" IS 'statistics OpenAttributeEntity(local, package, path, start, uri)';

COMMENT ON FUNCTION "qti"."__judge_assembled_catalog_tuwnswikbt"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of AssembledCatalog and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_candidate_path_f6y3bhw72k"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of CandidatePath and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_data_ssml_member_4cbluyrdux"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of DataSsmlMember and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_srcset_candidate_od4qxdh6dx"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of SrcsetCandidate and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_usage_value_base_type_tpcwre6tj3"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of UsageValueBaseType and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__capture_assembled_catalog_3z2sfh4yla"() IS 'rule capture of AssembledCatalog';

COMMENT ON FUNCTION "qti"."__capture_assembled_document_kywec7er73"() IS 'rule capture of AssembledDocument';

COMMENT ON FUNCTION "qti"."__capture_attribute_itmluum5pt"() IS 'rule capture of Attribute';

COMMENT ON FUNCTION "qti"."__capture_binding_name_wylitlhovp"() IS 'rule capture of BindingName';

COMMENT ON FUNCTION "qti"."__capture_bound_variable_zkpqqr76nb"() IS 'rule capture of BoundVariable';

COMMENT ON FUNCTION "qti"."__capture_candidate_path_wlkrzbwvw3"() IS 'rule capture of CandidatePath';

COMMENT ON FUNCTION "qti"."__capture_catalog_id_jfqixfjyar"() IS 'rule capture of CatalogId';

COMMENT ON FUNCTION "qti"."__capture_catalog_scope_vqhsmtulbo"() IS 'rule capture of CatalogScope';

COMMENT ON FUNCTION "qti"."__capture_cell_headers_stlfdiqhwe"() IS 'rule capture of CellHeaders';

COMMENT ON FUNCTION "qti"."__capture_cell_leaf_tpy2oa357u"() IS 'rule capture of CellLeaf';

COMMENT ON FUNCTION "qti"."__capture_choice_neayopxxaf"() IS 'rule capture of Choice';

COMMENT ON FUNCTION "qti"."__capture_choice_interaction_67uetkh2me"() IS 'rule capture of ChoiceInteraction';

COMMENT ON FUNCTION "qti"."__capture_cn_attribute_wjtyhps5sc"() IS 'rule capture of CnAttribute';

COMMENT ON FUNCTION "qti"."__capture_cn_count_dpun7ibpty"() IS 'rule capture of CnCount';

COMMENT ON FUNCTION "qti"."__capture_comment_3fafsajrz7"() IS 'rule capture of Comment';

COMMENT ON FUNCTION "qti"."__capture_context_ref_nebkcb5eus"() IS 'rule capture of ContextRef';

COMMENT ON FUNCTION "qti"."__capture_count_bound_o4cqbs6f73"() IS 'rule capture of CountBound';

COMMENT ON FUNCTION "qti"."__capture_data_ssml_qzwoa3blrx"() IS 'rule capture of DataSsml';

COMMENT ON FUNCTION "qti"."__capture_data_ssml_member_e3kaulojj7"() IS 'rule capture of DataSsmlMember';

COMMENT ON FUNCTION "qti"."__capture_data_ssml_property_awsueqqn4k"() IS 'rule capture of DataSsmlProperty';

COMMENT ON FUNCTION "qti"."__capture_doctype_zd2y6ytcuj"() IS 'rule capture of Doctype';

COMMENT ON FUNCTION "qti"."__capture_document_h46mvgroqo"() IS 'rule capture of Document';

COMMENT ON FUNCTION "qti"."__capture_document_id_eulwoph3m7"() IS 'rule capture of DocumentId';

COMMENT ON FUNCTION "qti"."__capture_element_type_6iss5rizj2"() IS 'rule capture of ElementType';

COMMENT ON FUNCTION "qti"."__capture_entry_bqh2dphmq7"() IS 'rule capture of Entry';

COMMENT ON FUNCTION "qti"."__capture_expression_3gfbksib72"() IS 'rule capture of Expression';

COMMENT ON FUNCTION "qti"."__capture_feedback_ref_iuekmjyn2k"() IS 'rule capture of FeedbackRef';

COMMENT ON FUNCTION "qti"."__capture_file_yjq2w5356h"() IS 'rule capture of File';

COMMENT ON FUNCTION "qti"."__capture_fragment_context_ref_nuuhlshmzu"() IS 'rule capture of FragmentContextRef';

COMMENT ON FUNCTION "qti"."__capture_fragment_feedback_ref_imuuftmewc"() IS 'rule capture of FragmentFeedbackRef';

COMMENT ON FUNCTION "qti"."__capture_fragment_printed_ref_uennexi5y2"() IS 'rule capture of FragmentPrintedRef';

COMMENT ON FUNCTION "qti"."__capture_fragment_scope_iknfqtw5zm"() IS 'rule capture of FragmentScope';

COMMENT ON FUNCTION "qti"."__capture_fragment_template_ref_4a55ciye7u"() IS 'rule capture of FragmentTemplateRef';

COMMENT ON FUNCTION "qti"."__capture_header_token_xwforpimq3"() IS 'rule capture of HeaderToken';

COMMENT ON FUNCTION "qti"."__capture_hottext_lhjwhvzr4d"() IS 'rule capture of Hottext';

COMMENT ON FUNCTION "qti"."__capture_identity_text_h5x3ut4jpk"() IS 'rule capture of IdentityText';

COMMENT ON FUNCTION "qti"."__capture_idref_4rhkrmfh4c"() IS 'rule capture of Idref';

COMMENT ON FUNCTION "qti"."__capture_idref_target_svtn77efc5"() IS 'rule capture of IdrefTarget';

COMMENT ON FUNCTION "qti"."__capture_inclusion_56gcj75lja"() IS 'rule capture of Inclusion';

COMMENT ON FUNCTION "qti"."__capture_instance_ts6ly2zo5e"() IS 'rule capture of Instance';

COMMENT ON FUNCTION "qti"."__capture_interaction_74aiefebxt"() IS 'rule capture of Interaction';

COMMENT ON FUNCTION "qti"."__capture_interaction_attribute_wquigysxiz"() IS 'rule capture of InteractionAttribute';

COMMENT ON FUNCTION "qti"."__capture_item_mode_jcqh5xkp3r"() IS 'rule capture of ItemMode';

COMMENT ON FUNCTION "qti"."__capture_item_ref_document_rlun34ysrf"() IS 'rule capture of ItemRefDocument';

COMMENT ON FUNCTION "qti"."__capture_item_ref_href_njxj66f6sv"() IS 'rule capture of ItemRefHref';

COMMENT ON FUNCTION "qti"."__capture_label_use_zaf4tt25o3"() IS 'rule capture of LabelUse';

COMMENT ON FUNCTION "qti"."__capture_least_count_aijvroibqn"() IS 'rule capture of LeastCount';

COMMENT ON FUNCTION "qti"."__capture_link_reading_pp235xpir4"() IS 'rule capture of LinkReading';

COMMENT ON FUNCTION "qti"."__capture_literal_cmqvxvs66l"() IS 'rule capture of Literal';

COMMENT ON FUNCTION "qti"."__capture_literal_typed_cv5kr7fm7e"() IS 'rule capture of LiteralTyped';

COMMENT ON FUNCTION "qti"."__capture_lookup_value_f3rrvlw7j7"() IS 'rule capture of LookupValue';

COMMENT ON FUNCTION "qti"."__capture_map_key_gtfuz4lzxt"() IS 'rule capture of MapKey';

COMMENT ON FUNCTION "qti"."__capture_mastery_value_vcu35bia62"() IS 'rule capture of MasteryValue';

COMMENT ON FUNCTION "qti"."__capture_math_action_jd3vrh7mkp"() IS 'rule capture of MathAction';

COMMENT ON FUNCTION "qti"."__capture_math_align_group_rm6un5zx6m"() IS 'rule capture of MathAlignGroup';

COMMENT ON FUNCTION "qti"."__capture_math_align_scope_drfp7lejeu"() IS 'rule capture of MathAlignScope';

COMMENT ON FUNCTION "qti"."__capture_math_cell_gqufe5xqbw"() IS 'rule capture of MathCell';

COMMENT ON FUNCTION "qti"."__capture_math_cn_szq6ag5xrp"() IS 'rule capture of MathCn';

COMMENT ON FUNCTION "qti"."__capture_math_rank_pvp6tiwkcl"() IS 'rule capture of MathRank';

COMMENT ON FUNCTION "qti"."__capture_media_2hbvlgszbl"() IS 'rule capture of Media';

COMMENT ON FUNCTION "qti"."__capture_most_count_ht5osomlyy"() IS 'rule capture of MostCount';

COMMENT ON FUNCTION "qti"."__capture_named_c3oe5awrnw"() IS 'rule capture of Named';

COMMENT ON FUNCTION "qti"."__capture_node_7sghxk2dxj"() IS 'rule capture of Node';

COMMENT ON FUNCTION "qti"."__capture_normal_maximum_kyp5brbypx"() IS 'rule capture of NormalMaximum';

COMMENT ON FUNCTION "qti"."__capture_normal_minimum_juiaihzrn6"() IS 'rule capture of NormalMinimum';

COMMENT ON FUNCTION "qti"."__capture_numbered_reading_vbr7y4n7ey"() IS 'rule capture of NumberedReading';

COMMENT ON FUNCTION "qti"."__capture_open_attribute_zpjedimx7c"() IS 'rule capture of OpenAttribute';

COMMENT ON FUNCTION "qti"."__capture_open_element_name_oaq7r3tjeo"() IS 'rule capture of OpenElementName';

COMMENT ON FUNCTION "qti"."__capture_open_element_type_pdlvcktpcb"() IS 'rule capture of OpenElementType';

COMMENT ON FUNCTION "qti"."__capture_pci_module_form_rbpjgm5ck4"() IS 'rule capture of PciModuleForm';

COMMENT ON FUNCTION "qti"."__capture_pi_crqtap7l2j"() IS 'rule capture of Pi';

COMMENT ON FUNCTION "qti"."__capture_placed_binding_g6nwtylt4r"() IS 'rule capture of PlacedBinding';

COMMENT ON FUNCTION "qti"."__capture_placed_choice_ofja2rvius"() IS 'rule capture of PlacedChoice';

COMMENT ON FUNCTION "qti"."__capture_placed_hottext_jurjhgnjnv"() IS 'rule capture of PlacedHottext';

COMMENT ON FUNCTION "qti"."__capture_placed_id_azml2s6wnr"() IS 'rule capture of PlacedId';

COMMENT ON FUNCTION "qti"."__capture_placed_idref_dxsermopm3"() IS 'rule capture of PlacedIdref';

COMMENT ON FUNCTION "qti"."__capture_placed_math_rank_xssetn7pti"() IS 'rule capture of PlacedMathRank';

COMMENT ON FUNCTION "qti"."__capture_placed_share_target_jkejimypix"() IS 'rule capture of PlacedShareTarget';

COMMENT ON FUNCTION "qti"."__capture_placed_variable_ref_c73fg3d4ir"() IS 'rule capture of PlacedVariableRef';

COMMENT ON FUNCTION "qti"."__capture_printed_variable_ref_rkvjy5pcp6"() IS 'rule capture of PrintedVariableRef';

COMMENT ON FUNCTION "qti"."__capture_processing_jfdg5itrrj"() IS 'rule capture of Processing';

COMMENT ON FUNCTION "qti"."__capture_reference_d5rfnwftad"() IS 'rule capture of Reference';

COMMENT ON FUNCTION "qti"."__capture_reference_path_a7u42lsr4p"() IS 'rule capture of ReferencePath';

COMMENT ON FUNCTION "qti"."__capture_resource_document_ycparq66g5"() IS 'rule capture of ResourceDocument';

COMMENT ON FUNCTION "qti"."__capture_resource_href_a6m5gac7ix"() IS 'rule capture of ResourceHref';

COMMENT ON FUNCTION "qti"."__capture_rounding_62zjiurefn"() IS 'rule capture of Rounding';

COMMENT ON FUNCTION "qti"."__capture_rounding_figures_x67em2nz6x"() IS 'rule capture of RoundingFigures';

COMMENT ON FUNCTION "qti"."__capture_rounding_mode_figures_np5ekmxxtw"() IS 'rule capture of RoundingModeFigures';

COMMENT ON FUNCTION "qti"."__capture_share_fragment_23yyb62piz"() IS 'rule capture of ShareFragment';

COMMENT ON FUNCTION "qti"."__capture_share_target_xf6egfoz4f"() IS 'rule capture of ShareTarget';

COMMENT ON FUNCTION "qti"."__capture_site_ccrpb262b6"() IS 'rule capture of Site';

COMMENT ON FUNCTION "qti"."__capture_site_path_lod75hbzio"() IS 'rule capture of SitePath';

COMMENT ON FUNCTION "qti"."__capture_site_target_mykxfkm433"() IS 'rule capture of SiteTarget';

COMMENT ON FUNCTION "qti"."__capture_srcset_i23xwowlg4"() IS 'rule capture of Srcset';

COMMENT ON FUNCTION "qti"."__capture_srcset_candidate_ix5dzebhuu"() IS 'rule capture of SrcsetCandidate';

COMMENT ON FUNCTION "qti"."__capture_ssml_scope_bdhavhlbu2"() IS 'rule capture of SsmlScope';

COMMENT ON FUNCTION "qti"."__capture_stimulus_ref_ebosxnmexe"() IS 'rule capture of StimulusRef';

COMMENT ON FUNCTION "qti"."__capture_table_header_tkmxq7wtew"() IS 'rule capture of TableHeader';

COMMENT ON FUNCTION "qti"."__capture_table_scope_g7taf63zao"() IS 'rule capture of TableScope';

COMMENT ON FUNCTION "qti"."__capture_template_ref_dre62in37w"() IS 'rule capture of TemplateRef';

COMMENT ON FUNCTION "qti"."__capture_text_reference_4wyk6zxgqf"() IS 'rule capture of TextReference';

COMMENT ON FUNCTION "qti"."__capture_text_reference_path_znomqpm3dr"() IS 'rule capture of TextReferencePath';

COMMENT ON FUNCTION "qti"."__capture_tolerance_sfo7irkllw"() IS 'rule capture of Tolerance';

COMMENT ON FUNCTION "qti"."__capture_usage_value_d4x3vydjzt"() IS 'rule capture of UsageValue';

COMMENT ON FUNCTION "qti"."__capture_usage_value_base_type_a6p2zwmowi"() IS 'rule capture of UsageValueBaseType';

COMMENT ON FUNCTION "qti"."__capture_variable_ref_lckeobxqnf"() IS 'rule capture of VariableRef';

COMMENT ON FUNCTION "qti"."__capture_variable_ref_table_dabbjr7lvm"() IS 'rule capture of VariableRefTable';

COMMENT ON FUNCTION "qti"."__immutable_assembled_catalog_vcladehbpw"() IS 'immutability guard of AssembledCatalog';

COMMENT ON FUNCTION "qti"."__immutable_assembled_document_32zynp33dd"() IS 'immutability guard of AssembledDocument';

COMMENT ON FUNCTION "qti"."__immutable_attribute_6xb2pmx6fd"() IS 'immutability guard of Attribute';

COMMENT ON FUNCTION "qti"."__immutable_attribute_entity_ppzjeu4ah3"() IS 'immutability guard of AttributeEntity';

COMMENT ON FUNCTION "qti"."__immutable_binding_name_23k2pcie27"() IS 'immutability guard of BindingName';

COMMENT ON FUNCTION "qti"."__immutable_bound_variable_l5mva2wpev"() IS 'immutability guard of BoundVariable';

COMMENT ON FUNCTION "qti"."__immutable_candidate_path_flhwj3s6bd"() IS 'immutability guard of CandidatePath';

COMMENT ON FUNCTION "qti"."__immutable_catalog_id_bejmpqjni6"() IS 'immutability guard of CatalogId';

COMMENT ON FUNCTION "qti"."__immutable_catalog_scope_diphx2o4ow"() IS 'immutability guard of CatalogScope';

COMMENT ON FUNCTION "qti"."__immutable_cell_headers_sgvuxxx5r2"() IS 'immutability guard of CellHeaders';

COMMENT ON FUNCTION "qti"."__immutable_cell_leaf_p2ckdivqyl"() IS 'immutability guard of CellLeaf';

COMMENT ON FUNCTION "qti"."__immutable_choice_ge2mdb5sm4"() IS 'immutability guard of Choice';

COMMENT ON FUNCTION "qti"."__immutable_choice_interaction_hzj7v6euny"() IS 'immutability guard of ChoiceInteraction';

COMMENT ON FUNCTION "qti"."__immutable_cn_attribute_dqjxnuikao"() IS 'immutability guard of CnAttribute';

COMMENT ON FUNCTION "qti"."__immutable_cn_count_d5gkjhczls"() IS 'immutability guard of CnCount';

COMMENT ON FUNCTION "qti"."__immutable_cn_part_text_kx34g5xopo"() IS 'immutability guard of CnPartText';

COMMENT ON FUNCTION "qti"."__immutable_cn_slot_26fq3jw3vu"() IS 'immutability guard of CnSlot';

COMMENT ON FUNCTION "qti"."__immutable_comment_kt26p4ybay"() IS 'immutability guard of Comment';

COMMENT ON FUNCTION "qti"."__immutable_context_ref_hznufurdh6"() IS 'immutability guard of ContextRef';

COMMENT ON FUNCTION "qti"."__immutable_count_bound_ozituuo5at"() IS 'immutability guard of CountBound';

COMMENT ON FUNCTION "qti"."__immutable_data_ssml_d7gbp5e3bj"() IS 'immutability guard of DataSsml';

COMMENT ON FUNCTION "qti"."__immutable_data_ssml_member_kohfs5whun"() IS 'immutability guard of DataSsmlMember';

COMMENT ON FUNCTION "qti"."__immutable_data_ssml_property_vtgk2n4uec"() IS 'immutability guard of DataSsmlProperty';

COMMENT ON FUNCTION "qti"."__immutable_doctype_f6kqqv7lim"() IS 'immutability guard of Doctype';

COMMENT ON FUNCTION "qti"."__immutable_document_rzorfdmdmw"() IS 'immutability guard of Document';

COMMENT ON FUNCTION "qti"."__immutable_document_id_rsnstwbfg4"() IS 'immutability guard of DocumentId';

COMMENT ON FUNCTION "qti"."__immutable_element_type_6snzgndwf2"() IS 'immutability guard of ElementType';

COMMENT ON FUNCTION "qti"."__immutable_encoding_decl_bi75lcyfnn"() IS 'immutability guard of EncodingDecl';

COMMENT ON FUNCTION "qti"."__immutable_entry_hkvj5zcl53"() IS 'immutability guard of Entry';

COMMENT ON FUNCTION "qti"."__immutable_expression_vi24giusog"() IS 'immutability guard of Expression';

COMMENT ON FUNCTION "qti"."__immutable_feedback_ref_bm4dvyujjj"() IS 'immutability guard of FeedbackRef';

COMMENT ON FUNCTION "qti"."__immutable_file_hh6bkt5pfh"() IS 'immutability guard of File';

COMMENT ON FUNCTION "qti"."__immutable_fragment_context_name_4thlytcscd"() IS 'immutability guard of FragmentContextName';

COMMENT ON FUNCTION "qti"."__immutable_fragment_context_ref_dnxjwu7jjj"() IS 'immutability guard of FragmentContextRef';

COMMENT ON FUNCTION "qti"."__immutable_fragment_feedback_name_ffzmmoukqe"() IS 'immutability guard of FragmentFeedbackName';

COMMENT ON FUNCTION "qti"."__immutable_fragment_feedback_ref_7pyvlsjvu4"() IS 'immutability guard of FragmentFeedbackRef';

COMMENT ON FUNCTION "qti"."__immutable_fragment_printed_name_f67jebrp64"() IS 'immutability guard of FragmentPrintedName';

COMMENT ON FUNCTION "qti"."__immutable_fragment_printed_ref_dbnyr3esu7"() IS 'immutability guard of FragmentPrintedRef';

COMMENT ON FUNCTION "qti"."__immutable_fragment_scope_sjx7hdntnt"() IS 'immutability guard of FragmentScope';

COMMENT ON FUNCTION "qti"."__immutable_fragment_template_name_3qvolm2kb6"() IS 'immutability guard of FragmentTemplateName';

COMMENT ON FUNCTION "qti"."__immutable_fragment_template_ref_jj57ejir2o"() IS 'immutability guard of FragmentTemplateRef';

COMMENT ON FUNCTION "qti"."__immutable_header_token_cycyv7j27y"() IS 'immutability guard of HeaderToken';

COMMENT ON FUNCTION "qti"."__immutable_hottext_qr5yg3rq2q"() IS 'immutability guard of Hottext';

COMMENT ON FUNCTION "qti"."__immutable_identity_text_bm4m43fo25"() IS 'immutability guard of IdentityText';

COMMENT ON FUNCTION "qti"."__immutable_idref_xrfkgel7oq"() IS 'immutability guard of Idref';

COMMENT ON FUNCTION "qti"."__immutable_idref_target_k5fphp24zc"() IS 'immutability guard of IdrefTarget';

COMMENT ON FUNCTION "qti"."__immutable_inclusion_jb3v6gsk44"() IS 'immutability guard of Inclusion';

COMMENT ON FUNCTION "qti"."__immutable_instance_43njzfluo4"() IS 'immutability guard of Instance';

COMMENT ON FUNCTION "qti"."__immutable_interaction_vlncrmjme7"() IS 'immutability guard of Interaction';

COMMENT ON FUNCTION "qti"."__immutable_interaction_attribute_kamhumahje"() IS 'immutability guard of InteractionAttribute';

COMMENT ON FUNCTION "qti"."__immutable_item_mode_7fljqrxl6j"() IS 'immutability guard of ItemMode';

COMMENT ON FUNCTION "qti"."__immutable_item_ref_document_a4amgnqpel"() IS 'immutability guard of ItemRefDocument';

COMMENT ON FUNCTION "qti"."__immutable_item_ref_href_xkd3nd7smv"() IS 'immutability guard of ItemRefHref';

COMMENT ON FUNCTION "qti"."__immutable_label_use_tm32nskbhx"() IS 'immutability guard of LabelUse';

COMMENT ON FUNCTION "qti"."__immutable_least_count_rymntdenhr"() IS 'immutability guard of LeastCount';

COMMENT ON FUNCTION "qti"."__immutable_link_reading_gwkqs3gbmv"() IS 'immutability guard of LinkReading';

COMMENT ON FUNCTION "qti"."__immutable_literal_om5k2efgwg"() IS 'immutability guard of Literal';

COMMENT ON FUNCTION "qti"."__immutable_literal_typed_j6qnndrhxf"() IS 'immutability guard of LiteralTyped';

COMMENT ON FUNCTION "qti"."__immutable_lookup_value_zevk4rta27"() IS 'immutability guard of LookupValue';

COMMENT ON FUNCTION "qti"."__immutable_map_key_3aawy7jrgf"() IS 'immutability guard of MapKey';

COMMENT ON FUNCTION "qti"."__immutable_mastery_value_icxknacb44"() IS 'immutability guard of MasteryValue';

COMMENT ON FUNCTION "qti"."__immutable_math_action_4wc3z4cvbm"() IS 'immutability guard of MathAction';

COMMENT ON FUNCTION "qti"."__immutable_math_align_group_zalb5nju5t"() IS 'immutability guard of MathAlignGroup';

COMMENT ON FUNCTION "qti"."__immutable_math_align_scope_cqfgoijr46"() IS 'immutability guard of MathAlignScope';

COMMENT ON FUNCTION "qti"."__immutable_math_cell_kutlle7mpi"() IS 'immutability guard of MathCell';

COMMENT ON FUNCTION "qti"."__immutable_math_cn_sxgknut342"() IS 'immutability guard of MathCn';

COMMENT ON FUNCTION "qti"."__immutable_math_rank_evrbu6xzq6"() IS 'immutability guard of MathRank';

COMMENT ON FUNCTION "qti"."__immutable_media_mfd4zgeqo4"() IS 'immutability guard of Media';

COMMENT ON FUNCTION "qti"."__immutable_most_count_pnbgbyo6vx"() IS 'immutability guard of MostCount';

COMMENT ON FUNCTION "qti"."__immutable_named_fc3dyta4pi"() IS 'immutability guard of Named';

COMMENT ON FUNCTION "qti"."__immutable_namespace_kfnkwuzi6f"() IS 'immutability guard of Namespace';

COMMENT ON FUNCTION "qti"."__immutable_node_z6kbrp3cjh"() IS 'immutability guard of Node';

COMMENT ON FUNCTION "qti"."__immutable_normal_maximum_dsp427yt7f"() IS 'immutability guard of NormalMaximum';

COMMENT ON FUNCTION "qti"."__immutable_normal_minimum_7cx3wosoby"() IS 'immutability guard of NormalMinimum';

COMMENT ON FUNCTION "qti"."__immutable_numbered_reading_krckr7age2"() IS 'immutability guard of NumberedReading';

COMMENT ON FUNCTION "qti"."__immutable_open_attribute_e2eg44hjoh"() IS 'immutability guard of OpenAttribute';

COMMENT ON FUNCTION "qti"."__immutable_open_attribute_entity_us6npbcmmk"() IS 'immutability guard of OpenAttributeEntity';

COMMENT ON FUNCTION "qti"."__immutable_open_element_name_bibpy2kcd7"() IS 'immutability guard of OpenElementName';

COMMENT ON FUNCTION "qti"."__immutable_open_element_type_zejz6gqcev"() IS 'immutability guard of OpenElementType';

COMMENT ON FUNCTION "qti"."__immutable_package_ajngq3jptc"() IS 'immutability guard of Package';

COMMENT ON FUNCTION "qti"."__immutable_pci_module_form_xxsdsw6xkd"() IS 'immutability guard of PciModuleForm';

COMMENT ON FUNCTION "qti"."__immutable_pi_nwixbhoi76"() IS 'immutability guard of Pi';

COMMENT ON FUNCTION "qti"."__immutable_placed_binding_2urgxakeap"() IS 'immutability guard of PlacedBinding';

COMMENT ON FUNCTION "qti"."__immutable_placed_choice_lyke55z5zo"() IS 'immutability guard of PlacedChoice';

COMMENT ON FUNCTION "qti"."__immutable_placed_hottext_w3bq4kdmpw"() IS 'immutability guard of PlacedHottext';

COMMENT ON FUNCTION "qti"."__immutable_placed_id_na4uxn7bss"() IS 'immutability guard of PlacedId';

COMMENT ON FUNCTION "qti"."__immutable_placed_idref_3qldafkap2"() IS 'immutability guard of PlacedIdref';

COMMENT ON FUNCTION "qti"."__immutable_placed_math_rank_h7luw7qzqp"() IS 'immutability guard of PlacedMathRank';

COMMENT ON FUNCTION "qti"."__immutable_placed_share_target_z4ymdrfuyo"() IS 'immutability guard of PlacedShareTarget';

COMMENT ON FUNCTION "qti"."__immutable_placed_variable_ref_dzftbittwa"() IS 'immutability guard of PlacedVariableRef';

COMMENT ON FUNCTION "qti"."__immutable_printed_variable_ref_glbe4icptr"() IS 'immutability guard of PrintedVariableRef';

COMMENT ON FUNCTION "qti"."__immutable_processing_4xtoge45uf"() IS 'immutability guard of Processing';

COMMENT ON FUNCTION "qti"."__immutable_reference_jwjaejvd7e"() IS 'immutability guard of Reference';

COMMENT ON FUNCTION "qti"."__immutable_reference_path_wpekhqpxnx"() IS 'immutability guard of ReferencePath';

COMMENT ON FUNCTION "qti"."__immutable_referring_document_lnebuzvo3s"() IS 'immutability guard of ReferringDocument';

COMMENT ON FUNCTION "qti"."__immutable_resource_document_jqrzxzns2q"() IS 'immutability guard of ResourceDocument';

COMMENT ON FUNCTION "qti"."__immutable_resource_href_bukfnv4woh"() IS 'immutability guard of ResourceHref';

COMMENT ON FUNCTION "qti"."__immutable_rounding_nineaee63d"() IS 'immutability guard of Rounding';

COMMENT ON FUNCTION "qti"."__immutable_rounding_figures_4cuqyjt6ud"() IS 'immutability guard of RoundingFigures';

COMMENT ON FUNCTION "qti"."__immutable_rounding_mode_figures_ret6orbywb"() IS 'immutability guard of RoundingModeFigures';

COMMENT ON FUNCTION "qti"."__immutable_sd_decl_3xgbeclw67"() IS 'immutability guard of SdDecl';

COMMENT ON FUNCTION "qti"."__immutable_share_fragment_lux4lz54b4"() IS 'immutability guard of ShareFragment';

COMMENT ON FUNCTION "qti"."__immutable_share_target_rpedtkzcqq"() IS 'immutability guard of ShareTarget';

COMMENT ON FUNCTION "qti"."__immutable_site_c4aoskwybt"() IS 'immutability guard of Site';

COMMENT ON FUNCTION "qti"."__immutable_site_path_64mucficfu"() IS 'immutability guard of SitePath';

COMMENT ON FUNCTION "qti"."__immutable_site_target_ko73x62zot"() IS 'immutability guard of SiteTarget';

COMMENT ON FUNCTION "qti"."__immutable_srcset_chkghcgdgm"() IS 'immutability guard of Srcset';

COMMENT ON FUNCTION "qti"."__immutable_srcset_candidate_lhrajb62s4"() IS 'immutability guard of SrcsetCandidate';

COMMENT ON FUNCTION "qti"."__immutable_ssml_scope_gm2nztotr2"() IS 'immutability guard of SsmlScope';

COMMENT ON FUNCTION "qti"."__immutable_stimulus_ref_l5ozxdx67u"() IS 'immutability guard of StimulusRef';

COMMENT ON FUNCTION "qti"."__immutable_table_header_w5wnjatoej"() IS 'immutability guard of TableHeader';

COMMENT ON FUNCTION "qti"."__immutable_table_scope_zjt7vkc2dg"() IS 'immutability guard of TableScope';

COMMENT ON FUNCTION "qti"."__immutable_template_ref_txetw6uizh"() IS 'immutability guard of TemplateRef';

COMMENT ON FUNCTION "qti"."__immutable_text_idref_iatqcpbyrw"() IS 'immutability guard of TextIdref';

COMMENT ON FUNCTION "qti"."__immutable_text_reference_t575rjvqct"() IS 'immutability guard of TextReference';

COMMENT ON FUNCTION "qti"."__immutable_text_reference_path_rdz63xnbcm"() IS 'immutability guard of TextReferencePath';

COMMENT ON FUNCTION "qti"."__immutable_tolerance_qlqblufht2"() IS 'immutability guard of Tolerance';

COMMENT ON FUNCTION "qti"."__immutable_tolerance_token_3mam4bz3yb"() IS 'immutability guard of ToleranceToken';

COMMENT ON FUNCTION "qti"."__immutable_usage_value_jnk7ednwfy"() IS 'immutability guard of UsageValue';

COMMENT ON FUNCTION "qti"."__immutable_usage_value_base_type_r6zekdtvgx"() IS 'immutability guard of UsageValueBaseType';

COMMENT ON FUNCTION "qti"."__immutable_variable_ref_2akeo54qw2"() IS 'immutability guard of VariableRef';

COMMENT ON FUNCTION "qti"."__immutable_variable_ref_table_xbvw4weu3m"() IS 'immutability guard of VariableRefTable';

COMMENT ON FUNCTION "qti"."__immutable_xml_decl_xczaxf75t5"() IS 'immutability guard of XmlDecl';

COMMENT ON ROLE :"__live_lxch3umxkh" IS 'live source of qti';
