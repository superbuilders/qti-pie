CREATE PUBLICATION "__live_lxch3umxkh"
  FOR TABLE "qti"."attribute" ("package", "path", "start", "name"), "qti"."attribute_entity" ("package", "path", "start", "name", "offset"), "qti"."comment" ("package", "path", "start"), "qti"."doctype" ("package", "path", "start"), "qti"."document" ("package", "path"), "qti"."element_type" ("package", "path", "start"), "qti"."encoding_decl" ("package", "path"), "qti"."entry" ("package", "path"), "qti"."media" ("package", "path"), "qti"."namespace" ("package", "path", "start", "at"), "qti"."node" ("package", "path", "start"), "qti"."open_attribute" ("package", "path", "start", "at"), "qti"."open_attribute_entity" ("package", "path", "start", "at", "offset"), "qti"."open_element_name" ("package", "path", "start"), "qti"."open_element_type" ("package", "path", "start"), "qti"."package" ("package"), "qti"."pi" ("package", "path", "start"), "qti"."sd_decl" ("package", "path"), "qti"."xml_decl" ("package", "path"), "qti"."__ledger"
  WITH (publish_generated_columns = stored);

SELECT "r1"."c1"::"qti"."__domain_gfw43vigph" AS "value"
FROM (VALUES (63::bigint), (67::bigint), (60::bigint), (62::bigint), (61::bigint), (4::bigint), (5::bigint), (7::bigint), (0::bigint), (21::bigint), (65::bigint), (18::bigint), (19::bigint), (14::bigint), (9::bigint), (17::bigint), (108::bigint), (20::bigint), (30::bigint), (25::bigint), (48::bigint), (27::bigint), (36::bigint), (110::bigint), (34::bigint), (16::bigint), (15::bigint), (3::bigint), (6::bigint), (12::bigint), (10::bigint), (11::bigint), (69::bigint), (64::bigint), (50::bigint), (73::bigint), (70::bigint), (72::bigint), (68::bigint), (71::bigint), (66::bigint), (8::bigint), (59::bigint), (13::bigint), (2::bigint), (1::bigint), (52::bigint), (96::bigint), (41::bigint), (97::bigint), (119::bigint), (56::bigint), (33::bigint), (121::bigint), (193::bigint), (306::bigint), (181::bigint), (117::bigint), (22::bigint), (92::bigint), (45::bigint), (46::bigint), (31::bigint), (75::bigint), (74::bigint), (28::bigint), (44::bigint), (29::bigint), (32::bigint)) AS "r1"("c1");

SELECT "r1"."c1"::"qti"."__text_sac6h6c6eh" AS "value"
FROM (VALUES ('http://www.imsglobal.org/xsd/imsqtiasi_v3p0'::"pg_catalog"."text"), ('http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1'::"pg_catalog"."text"), ('http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_extensionv1p2'::"pg_catalog"."text"), ('http://www.imsglobal.org/xsd/qti/qtiv3p0/imscsmd_v1p1'::"pg_catalog"."text"), ('http://www.imsglobal.org/xsd/qti/qtiv3p0/imsafa3p0drd_v1p0'::"pg_catalog"."text"), ('http://ltsc.ieee.org/xsd/LOM'::"pg_catalog"."text"), ('http://www.w3.org/1998/Math/MathML'::"pg_catalog"."text"), ('http://www.imsglobal.org/xsd/imsqti_metadata_v3p0'::"pg_catalog"."text"), ('http://www.w3.org/2001/10/synthesis'::"pg_catalog"."text"), ('http://www.imsglobal.org/xsd/imsqti_usagedata_v3p0'::"pg_catalog"."text"), ('http://www.w3.org/2001/XInclude'::"pg_catalog"."text")) AS "r1"("c1");

CREATE ROLE :"qti_queries__author" NOLOGIN;

CREATE ROLE :"qti_queries__author_app" LOGIN NOINHERIT;

CREATE ROLE :"__live_lxch3umxkh" LOGIN NOINHERIT;

CREATE SCHEMA "__qti";

CREATE SCHEMA "__qti_queries";

CREATE SCHEMA "__qti_views";

CREATE VIEW "__qti"."assembled_document" ("instances", "package", "path", "sites", "targets") AS
SELECT "r1"."instances", "r1"."package", "r1"."path", "r1"."sites", "r1"."targets"
FROM "qti"."assembled_document" AS "r1";

CREATE VIEW "__qti"."attribute" ("governor", "governor_name", "idref_text", "idrefs", "kind", "kind_name", "lexical", "name", "name_name", "package", "parent", "path", "prefix", "slot", "start", "idref_text_digest", "lexical_digest", "value", "value_digest") AS
SELECT "r1"."governor", ("qti"."__governor_names_d7jfyla3na"())["r1"."governor" + 1]::"pg_catalog"."text", "r1"."idref_text", "r1"."idrefs", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."lexical", "r1"."name", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."name" + 1]::"pg_catalog"."text", "r1"."package", "r1"."parent", "r1"."path", "r1"."prefix", "r1"."slot", "r1"."start", "r1"."idref_text_digest", "r1"."lexical_digest", "r1"."value", "r1"."value_digest"
FROM "qti"."attribute" AS "r1";

CREATE VIEW "__qti"."attribute_entity" ("entity", "name", "name_name", "offset", "package", "path", "start") AS
SELECT "r1"."entity", "r1"."name", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."name" + 1]::"pg_catalog"."text", "r1"."offset", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."attribute_entity" AS "r1";

CREATE VIEW "__qti"."binding_name" ("attribute", "attribute_name", "identifier", "package", "path", "start") AS
SELECT "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."binding_name" AS "r1";

CREATE VIEW "__qti"."bound_variable" ("adaptive", "attribute", "attribute_name", "identifier", "package", "path", "start") AS
SELECT "r1"."adaptive", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."bound_variable" AS "r1";

CREATE VIEW "__qti"."candidate_path" ("at", "package", "path", "start", "target") AS
SELECT "r1"."at", "r1"."package", "r1"."path", "r1"."start", "r1"."target"
FROM "qti"."candidate_path" AS "r1";

CREATE VIEW "__qti"."catalog_scope" ("package", "path", "scope", "start") AS
SELECT "r1"."package", "r1"."path", "r1"."scope", "r1"."start"
FROM "qti"."catalog_scope" AS "r1";

CREATE VIEW "__qti"."cell_leaf" ("at", "cell", "package", "path", "start", "start_after", "start_was") AS
SELECT "r1"."at", "r1"."cell", "r1"."package", "r1"."path", "r1"."start", "r1"."start_after", "r1"."start_was"
FROM "qti"."cell_leaf" AS "r1";

CREATE VIEW "__qti"."choice" ("identifier", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."identifier", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."choice" AS "r1";

CREATE VIEW "__qti"."choice_interaction" ("interaction", "interaction_path", "package", "path", "start") AS
SELECT "r1"."interaction", "r1"."interaction_path", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."choice_interaction" AS "r1";

CREATE VIEW "__qti"."cn_attribute" ("lexical", "name", "name_name", "package", "path", "start", "lexical_digest") AS
SELECT "r1"."lexical", "r1"."name", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."name" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start", "r1"."lexical_digest"
FROM "qti"."cn_attribute" AS "r1";

CREATE VIEW "__qti"."cn_count" ("package", "parts", "path", "start", "type", "type_name", "type_lexical", "type_lexical_digest") AS
SELECT "r1"."package", "r1"."parts", "r1"."path", "r1"."start", "r1"."type", ("qti"."__cn_type_names_wmjelllvhg"())["r1"."type" + 1]::"pg_catalog"."text", "r1"."type_lexical", "r1"."type_lexical_digest"
FROM "qti"."cn_count" AS "r1";

CREATE VIEW "__qti"."cn_part_text" ("base", "base_name", "form", "form_name", "package", "part", "part_name", "path", "start", "text", "type", "type_name") AS
SELECT "r1"."base", ("qti"."__cn_base_names_2wtzhyubck"())["r1"."base" + 1]::"pg_catalog"."text", "r1"."form", ("qti"."__cn_part_form_names_te7u7jycdu"())["r1"."form" + 1]::"pg_catalog"."text", "r1"."package", "r1"."part", ("qti"."__cn_part_names_6db2fcgfhy"())["r1"."part" + 1]::"pg_catalog"."text", "r1"."path", "r1"."start", "r1"."text", "r1"."type", ("qti"."__cn_type_names_wmjelllvhg"())["r1"."type" + 1]::"pg_catalog"."text"
FROM "qti"."cn_part_text" AS "r1";

CREATE VIEW "__qti"."cn_slot" ("form", "form_name", "package", "part", "part_name", "path", "start", "type", "type_name") AS
SELECT "r1"."form", ("qti"."__cn_part_form_names_te7u7jycdu"())["r1"."form" + 1]::"pg_catalog"."text", "r1"."package", "r1"."part", ("qti"."__cn_part_names_6db2fcgfhy"())["r1"."part" + 1]::"pg_catalog"."text", "r1"."path", "r1"."start", "r1"."type", ("qti"."__cn_type_names_wmjelllvhg"())["r1"."type" + 1]::"pg_catalog"."text"
FROM "qti"."cn_slot" AS "r1";

CREATE VIEW "__qti"."comment" ("package", "path", "start", "value") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."value"
FROM "qti"."comment" AS "r1";

CREATE VIEW "__qti"."context_ref" ("assembly_kind", "assembly_kind_name", "attribute", "attribute_name", "identifier", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."assembly_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."assembly_kind" + 1]::"pg_catalog"."text", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."context_ref" AS "r1";

CREATE VIEW "__qti"."count_bound" ("max_name", "max_name_name", "max_written", "min_name", "min_name_name", "min_written", "package", "path", "start") AS
SELECT "r1"."max_name", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."max_name" + 1]::"pg_catalog"."text", "r1"."max_written", "r1"."min_name", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."min_name" + 1]::"pg_catalog"."text", "r1"."min_written", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."count_bound" AS "r1";

CREATE VIEW "__qti"."data_ssml" ("package", "path", "start") AS
SELECT "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."data_ssml" AS "r1";

CREATE VIEW "__qti"."data_ssml_member" ("at", "member", "package", "path", "start", "member_digest") AS
SELECT "r1"."at", "r1"."member", "r1"."package", "r1"."path", "r1"."start", "r1"."member_digest"
FROM "qti"."data_ssml_member" AS "r1";

CREATE VIEW "__qti"."data_ssml_property" ("at", "member", "member_name", "name", "package", "path", "start", "value", "member_name_digest", "name_digest") AS
SELECT "r1"."at", "r1"."member", "r1"."member_name", "r1"."name", "r1"."package", "r1"."path", "r1"."start", "r1"."value", "r1"."member_name_digest", "r1"."name_digest"
FROM "qti"."data_ssml_property" AS "r1";

CREATE VIEW "__qti"."doctype" ("package", "path", "start", "value") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."value"
FROM "qti"."doctype" AS "r1";

CREATE VIEW "__qti"."document" ("assembled", "bindings", "charset", "choices", "context", "context_nearest", "context_nearest_kind", "context_nearest_kind_name", "context_path", "document_type", "document_type_name", "export_charset", "hottexts", "idref_targets", "ids", "node_children", "package", "path", "root_kind", "root_kind_name", "targeted_by") AS
SELECT "r1"."assembled", "r1"."bindings", "r1"."charset", "r1"."choices", "r1"."context", "r1"."context_nearest", "r1"."context_nearest_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."context_nearest_kind" + 1]::"pg_catalog"."text", "r1"."context_path", "r1"."document_type", ("qti"."__document_type_names_ot37qp5org"())["r1"."document_type" + 1]::"pg_catalog"."text", "r1"."export_charset", "r1"."hottexts", "r1"."idref_targets", "r1"."ids", "r1"."node_children", "r1"."package", "r1"."path", "r1"."root_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."root_kind" + 1]::"pg_catalog"."text", "r1"."targeted_by"
FROM "qti"."document" AS "r1";

CREATE VIEW "__qti"."document_id" ("admitted", "owner", "package", "path", "start") AS
SELECT "r1"."admitted", "r1"."owner", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."document_id" AS "r1";

CREATE VIEW "__qti"."element_type" ("governor", "governor_name", "kind", "kind_name", "package", "path", "start", "type", "type_name") AS
SELECT "r1"."governor", ("qti"."__governor_names_d7jfyla3na"())["r1"."governor" + 1]::"pg_catalog"."text", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start", "r1"."type", ("qti"."__type_name_names_ksmacbo3df"())["r1"."type" + 1]::"pg_catalog"."text"
FROM "qti"."element_type" AS "r1";

CREATE VIEW "__qti"."encoding_decl" ("encoding", "package", "path") AS
SELECT "r1"."encoding", "r1"."package", "r1"."path"
FROM "qti"."encoding_decl" AS "r1";

CREATE VIEW "__qti"."entry" ("kind", "kind_name", "package", "path") AS
SELECT "r1"."kind", ("qti"."__entry_kind_names_km5xejbmwu"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path"
FROM "qti"."entry" AS "r1";

CREATE VIEW "__qti"."expression" ("language", "language_name", "package", "path", "start") AS
SELECT "r1"."language", ("qti"."__language_names_pvmtywwssv"())["r1"."language" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."expression" AS "r1";

CREATE VIEW "__qti"."feedback_ref" ("assembly_kind", "assembly_kind_name", "attribute", "attribute_name", "identifier", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."assembly_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."assembly_kind" + 1]::"pg_catalog"."text", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."feedback_ref" AS "r1";

CREATE VIEW "__qti"."file" ("package", "path", "scope", "scope_name", "start") AS
SELECT "r1"."package", "r1"."path", "r1"."scope", ("qti"."__href_scope_names_y4pbuo4f5q"())["r1"."scope" + 1]::"pg_catalog"."text", "r1"."start"
FROM "qti"."file" AS "r1";

CREATE VIEW "__qti"."file_outside" ("package", "path", "start", "target", "target_digest") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."target", "r1"."target_digest"
FROM "qti"."file_outside" AS "r1";

CREATE VIEW "__qti"."file_path" ("package", "path", "start", "target") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."target"
FROM "qti"."file_path" AS "r1";

CREATE VIEW "__qti"."fragment_context_name" ("attribute", "attribute_name", "identifier", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."fragment_context_name" AS "r1";

CREATE VIEW "__qti"."fragment_context_ref" ("assembly", "assembly_kind", "assembly_kind_name", "attribute", "attribute_name", "identifier", "instance", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."assembly_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."assembly_kind" + 1]::"pg_catalog"."text", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."instance", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."fragment_context_ref" AS "r1";

CREATE VIEW "__qti"."fragment_feedback_name" ("attribute", "attribute_name", "identifier", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."fragment_feedback_name" AS "r1";

CREATE VIEW "__qti"."fragment_feedback_ref" ("assembly", "assembly_kind", "assembly_kind_name", "attribute", "attribute_name", "identifier", "instance", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."assembly_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."assembly_kind" + 1]::"pg_catalog"."text", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."instance", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."fragment_feedback_ref" AS "r1";

CREATE VIEW "__qti"."fragment_printed_name" ("attribute", "attribute_name", "identifier", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."fragment_printed_name" AS "r1";

CREATE VIEW "__qti"."fragment_printed_ref" ("assembly", "assembly_kind", "assembly_kind_name", "attribute", "attribute_name", "identifier", "instance", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."assembly_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."assembly_kind" + 1]::"pg_catalog"."text", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."instance", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."fragment_printed_ref" AS "r1";

CREATE VIEW "__qti"."fragment_scope" ("assembly", "assembly_kind", "assembly_kind_name", "contexts", "document", "feedbacks", "instance", "package", "prints", "templates") AS
SELECT "r1"."assembly", "r1"."assembly_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."assembly_kind" + 1]::"pg_catalog"."text", "r1"."contexts", "r1"."document", "r1"."feedbacks", "r1"."instance", "r1"."package", "r1"."prints", "r1"."templates"
FROM "qti"."fragment_scope" AS "r1";

CREATE VIEW "__qti"."fragment_template_name" ("attribute", "attribute_name", "identifier", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."fragment_template_name" AS "r1";

CREATE VIEW "__qti"."fragment_template_ref" ("assembly", "assembly_kind", "assembly_kind_name", "attribute", "attribute_name", "identifier", "instance", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."assembly_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."assembly_kind" + 1]::"pg_catalog"."text", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."instance", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."fragment_template_ref" AS "r1";

CREATE VIEW "__qti"."hottext" ("identifier", "package", "path", "start") AS
SELECT "r1"."identifier", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."hottext" AS "r1";

CREATE VIEW "__qti"."identity_text" ("package", "path", "start", "token_text", "tokens", "token_text_digest") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."token_text", "r1"."tokens", "r1"."token_text_digest"
FROM "qti"."identity_text" AS "r1";

CREATE VIEW "__qti"."idref" ("after", "at", "before", "name", "name_name", "package", "path", "pieces_after", "pieces_was", "start", "token", "piece", "pieces_after_digest", "pieces_was_digest", "token_digest") AS
SELECT "r1"."after", "r1"."at", "r1"."before", "r1"."name", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."name" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."pieces_after", "r1"."pieces_was", "r1"."start", "r1"."token", "r1"."piece", "r1"."pieces_after_digest", "r1"."pieces_was_digest", "r1"."token_digest"
FROM "qti"."idref" AS "r1";

CREATE VIEW "__qti"."idref_target" ("assembled", "id", "id_digest", "package", "path") AS
SELECT "r1"."assembled", "r1"."id", "r1"."id_digest", "r1"."package", "r1"."path"
FROM "qti"."idref_target" AS "r1";

CREATE VIEW "__qti"."inclusion" ("package", "parent_kind", "parent_kind_name", "path", "places", "root", "root_name", "splices", "start") AS
SELECT "r1"."package", "r1"."parent_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."parent_kind" + 1]::"pg_catalog"."text", "r1"."path", "r1"."places", "r1"."root", ("qti"."__node_kind_names_ulbko553n7"())["r1"."root" + 1]::"pg_catalog"."text", "r1"."splices", "r1"."start"
FROM "qti"."inclusion" AS "r1";

CREATE VIEW "__qti"."instance" ("assembly", "assembly_kind", "assembly_kind_name", "at", "bindings", "children", "choices", "document", "end", "hottexts", "idref_targets", "ids", "package", "parent", "root_kind", "root_kind_name", "site", "site_document", "start") AS
SELECT "r1"."assembly", "r1"."assembly_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."assembly_kind" + 1]::"pg_catalog"."text", "r1"."at", "r1"."bindings", "r1"."children", "r1"."choices", "r1"."document", "r1"."end", "r1"."hottexts", "r1"."idref_targets", "r1"."ids", "r1"."package", "r1"."parent", "r1"."root_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."root_kind" + 1]::"pg_catalog"."text", "r1"."site", "r1"."site_document", "r1"."start"
FROM "qti"."instance" AS "r1";

CREATE VIEW "__qti"."interaction" ("choices", "module_forms", "package", "path", "start") AS
SELECT "r1"."choices", "r1"."module_forms", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."interaction" AS "r1";

CREATE VIEW "__qti"."interaction_attribute" ("kind", "kind_name", "lexical", "name", "name_name", "package", "path", "root_kind", "root_kind_name", "start", "lexical_digest", "value", "value_digest") AS
SELECT "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."lexical", "r1"."name", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."name" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."root_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."root_kind" + 1]::"pg_catalog"."text", "r1"."start", "r1"."lexical_digest", "r1"."value", "r1"."value_digest"
FROM "qti"."interaction_attribute" AS "r1";

CREATE VIEW "__qti"."item_mode" ("adaptive", "package", "path") AS
SELECT "r1"."adaptive", "r1"."package", "r1"."path"
FROM "qti"."item_mode" AS "r1";

CREATE VIEW "__qti"."item_ref_document" ("package", "path", "start", "target") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."target"
FROM "qti"."item_ref_document" AS "r1";

CREATE VIEW "__qti"."item_ref_href" ("package", "path", "start", "target") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."target"
FROM "qti"."item_ref_href" AS "r1";

CREATE VIEW "__qti"."label_use" ("package", "path", "root_kind", "root_kind_name", "start") AS
SELECT "r1"."package", "r1"."path", "r1"."root_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."root_kind" + 1]::"pg_catalog"."text", "r1"."start"
FROM "qti"."label_use" AS "r1";

CREATE VIEW "__qti"."least_count" ("least", "least_value", "package", "path", "start") AS
SELECT "r1"."least", "r1"."least_value", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."least_count" AS "r1";

CREATE VIEW "__qti"."link_reading" ("assembly", "attribute", "attribute_name", "package", "path", "scope", "scope_instance", "scope_path", "start", "variable") AS
SELECT "r1"."assembly", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."scope", "r1"."scope_instance", "r1"."scope_path", "r1"."start", "r1"."variable"
FROM "qti"."link_reading" AS "r1";

CREATE VIEW "__qti"."literal" ("base_type", "base_type_name", "package", "path", "start", "text") AS
SELECT "r1"."base_type", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start", "r1"."text"
FROM "qti"."literal" AS "r1";

CREATE VIEW "__qti"."literal_typed" ("package", "path", "start", "text", "type_code", "type_code_name", "base_type", "base_type_name") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."text", "r1"."type_code", ("qti"."__base_type_names_ok3nu5nck4"())["r1"."type_code" + 1]::"pg_catalog"."text", "r1"."base_type", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."base_type" + 1]::"pg_catalog"."text"
FROM "qti"."literal_typed" AS "r1";

CREATE VIEW "__qti"."math_action" ("package", "path", "selection_lexical", "selection_written", "start", "selection", "selection_lexical_digest") AS
SELECT "r1"."package", "r1"."path", "r1"."selection_lexical", "r1"."selection_written", "r1"."start", "r1"."selection", "r1"."selection_lexical_digest"
FROM "qti"."math_action" AS "r1";

CREATE VIEW "__qti"."math_align_group" ("cell", "package", "path", "start") AS
SELECT "r1"."cell", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."math_align_group" AS "r1";

CREATE VIEW "__qti"."math_align_scope" ("cell", "chosen", "inherited", "inherited_name", "own", "own_name", "package", "passes", "passes_name", "path", "received", "received_name", "start", "state", "state_name") AS
SELECT "r1"."cell", "r1"."chosen", "r1"."inherited", ("qti"."__align_direction_names_vluq7iazdg"())["r1"."inherited" + 1]::"pg_catalog"."text", "r1"."own", ("qti"."__align_direction_names_vluq7iazdg"())["r1"."own" + 1]::"pg_catalog"."text", "r1"."package", "r1"."passes", ("qti"."__align_state_names_ffk37slxn3"())["r1"."passes" + 1]::"pg_catalog"."text", "r1"."path", "r1"."received", ("qti"."__align_state_names_ffk37slxn3"())["r1"."received" + 1]::"pg_catalog"."text", "r1"."start", "r1"."state", ("qti"."__align_state_names_ffk37slxn3"())["r1"."state" + 1]::"pg_catalog"."text"
FROM "qti"."math_align_scope" AS "r1";

CREATE VIEW "__qti"."math_cell" ("groups", "last_start", "leaves", "package", "path", "start") AS
SELECT "r1"."groups", "r1"."last_start", "r1"."leaves", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."math_cell" AS "r1";

CREATE VIEW "__qti"."math_cn" ("base", "base_name", "base_lexical", "package", "parts", "path", "start", "type", "type_name", "type_lexical", "base_lexical_digest", "type_lexical_digest") AS
SELECT "r1"."base", ("qti"."__cn_base_names_2wtzhyubck"())["r1"."base" + 1]::"pg_catalog"."text", "r1"."base_lexical", "r1"."package", "r1"."parts", "r1"."path", "r1"."start", "r1"."type", ("qti"."__cn_type_names_wmjelllvhg"())["r1"."type" + 1]::"pg_catalog"."text", "r1"."type_lexical", "r1"."base_lexical_digest", "r1"."type_lexical_digest"
FROM "qti"."math_cn" AS "r1";

CREATE VIEW "__qti"."math_rank" ("package", "path", "rank", "start") AS
SELECT "r1"."package", "r1"."path", "r1"."rank", "r1"."start"
FROM "qti"."math_rank" AS "r1";

CREATE VIEW "__qti"."media" ("digest", "package", "path") AS
SELECT "r1"."digest", "r1"."package", "r1"."path"
FROM "qti"."media" AS "r1";

CREATE VIEW "__qti"."most_count" ("most", "most_value", "package", "path", "start") AS
SELECT "r1"."most", "r1"."most_value", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."most_count" AS "r1";

CREATE VIEW "__qti"."named" ("identifier", "package", "path", "start") AS
SELECT "r1"."identifier", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."named" AS "r1";

CREATE VIEW "__qti"."namespace" ("at", "package", "path", "prefix", "start", "uri", "prefix_digest") AS
SELECT "r1"."at", "r1"."package", "r1"."path", "r1"."prefix", "r1"."start", "r1"."uri", "r1"."prefix_digest"
FROM "qti"."namespace" AS "r1";

CREATE VIEW "__qti"."node" ("ancestry", "at", "attributes", "attrs", "barred_children", "chars", "chars_after", "chars_was", "children", "counted_children", "element_children", "elements", "elements_was", "end", "first", "governor", "governor_name", "kind", "kind_name", "last", "last_state", "last_state_name", "nearest", "nearest_kind", "nearest_kind_name", "nearest_path", "open_attributes", "package", "parent", "parent_ancestry", "parent_governor", "parent_governor_name", "parent_kind", "parent_kind_name", "parent_nearest", "parent_nearest_kind", "parent_nearest_kind_name", "parent_nearest_path", "parent_parent_kind", "parent_parent_kind_name", "path", "prefix", "start", "state", "state_name", "string_value", "was", "was_name", "chars_after_digest", "chars_was_digest", "string_value_digest") AS
SELECT "r1"."ancestry", "r1"."at", "r1"."attributes", "r1"."attrs", "r1"."barred_children", "r1"."chars", "r1"."chars_after", "r1"."chars_was", "r1"."children", "r1"."counted_children", "r1"."element_children", "r1"."elements", "r1"."elements_was", "r1"."end", "r1"."first", "r1"."governor", ("qti"."__governor_names_d7jfyla3na"())["r1"."governor" + 1]::"pg_catalog"."text", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."last", "r1"."last_state", ("qti"."__position_names_sglcn7ygpg"())["r1"."last_state" + 1]::"pg_catalog"."text", "r1"."nearest", "r1"."nearest_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."nearest_kind" + 1]::"pg_catalog"."text", "r1"."nearest_path", "r1"."open_attributes", "r1"."package", "r1"."parent", "r1"."parent_ancestry", "r1"."parent_governor", ("qti"."__governor_names_d7jfyla3na"())["r1"."parent_governor" + 1]::"pg_catalog"."text", "r1"."parent_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."parent_kind" + 1]::"pg_catalog"."text", "r1"."parent_nearest", "r1"."parent_nearest_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."parent_nearest_kind" + 1]::"pg_catalog"."text", "r1"."parent_nearest_path", "r1"."parent_parent_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."parent_parent_kind" + 1]::"pg_catalog"."text", "r1"."path", "r1"."prefix", "r1"."start", "r1"."state", ("qti"."__position_names_sglcn7ygpg"())["r1"."state" + 1]::"pg_catalog"."text", "r1"."string_value", "r1"."was", ("qti"."__position_names_sglcn7ygpg"())["r1"."was" + 1]::"pg_catalog"."text", "r1"."chars_after_digest", "r1"."chars_was_digest", "r1"."string_value_digest"
FROM "qti"."node" AS "r1";

CREATE VIEW "__qti"."numbered_reading" ("assembly", "attribute", "attribute_name", "number", "package", "path", "scope", "scope_instance", "scope_path", "start", "variable") AS
SELECT "r1"."assembly", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."number", "r1"."package", "r1"."path", "r1"."scope", "r1"."scope_instance", "r1"."scope_path", "r1"."start", "r1"."variable"
FROM "qti"."numbered_reading" AS "r1";

CREATE VIEW "__qti"."open_attribute" ("at", "class", "class_name", "element_namespace", "governor", "governor_name", "kind", "kind_name", "lexical", "local", "package", "path", "prefix", "slot", "start", "uri", "local_digest", "uri_digest") AS
SELECT "r1"."at", "r1"."class", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."class" + 1]::"pg_catalog"."text", "r1"."element_namespace", "r1"."governor", ("qti"."__governor_names_d7jfyla3na"())["r1"."governor" + 1]::"pg_catalog"."text", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."lexical", "r1"."local", "r1"."package", "r1"."path", "r1"."prefix", "r1"."slot", "r1"."start", "r1"."uri", "r1"."local_digest", "r1"."uri_digest"
FROM "qti"."open_attribute" AS "r1";

CREATE VIEW "__qti"."open_attribute_entity" ("at", "entity", "offset", "package", "path", "start") AS
SELECT "r1"."at", "r1"."entity", "r1"."offset", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."open_attribute_entity" AS "r1";

CREATE VIEW "__qti"."open_element_name" ("local", "namespace", "package", "path", "start", "expanded") AS
SELECT "r1"."local", "r1"."namespace", "r1"."package", "r1"."path", "r1"."start", "r1"."expanded"
FROM "qti"."open_element_name" AS "r1";

CREATE VIEW "__qti"."open_element_type" ("package", "path", "start", "type", "type_name") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."type", ("qti"."__type_name_names_ksmacbo3df"())["r1"."type" + 1]::"pg_catalog"."text"
FROM "qti"."open_element_type" AS "r1";

CREATE VIEW "__qti"."package" ("package") AS
SELECT "r1"."package"
FROM "qti"."package" AS "r1";

CREATE VIEW "__qti"."pci_module_form" ("element", "package", "path", "start") AS
SELECT "r1"."element", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."pci_module_form" AS "r1";

CREATE VIEW "__qti"."pi" ("data", "package", "path", "start", "target") AS
SELECT "r1"."data", "r1"."package", "r1"."path", "r1"."start", "r1"."target"
FROM "qti"."pi" AS "r1";

CREATE VIEW "__qti"."placed_binding" ("adaptive", "assembly", "attribute", "attribute_name", "identifier", "instance", "package", "path", "start") AS
SELECT "r1"."adaptive", "r1"."assembly", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."instance", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."placed_binding" AS "r1";

CREATE VIEW "__qti"."placed_choice" ("assembly", "identifier", "instance", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."identifier", "r1"."instance", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."placed_choice" AS "r1";

CREATE VIEW "__qti"."placed_expression" ("assembly", "base_type", "base_type_name", "cardinality", "cardinality_name", "instance", "package", "path", "start", "base_type_bit", "cardinality_bit") AS
SELECT "r1"."assembly", "r1"."base_type", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."cardinality", ("qti"."__value_cardinality_names_wzwznoycgf"())["r1"."cardinality" + 1]::"pg_catalog"."text", "r1"."instance", "r1"."package", "r1"."path", "r1"."start", "r1"."base_type_bit", "r1"."cardinality_bit"
FROM "qti"."placed_expression" AS "r1";

CREATE VIEW "__qti"."placed_hottext" ("assembly", "identifier", "instance", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."identifier", "r1"."instance", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."placed_hottext" AS "r1";

CREATE VIEW "__qti"."placed_id" ("assembly", "assembly_kind", "assembly_kind_name", "id", "instance", "owner", "package", "path", "start", "id_digest") AS
SELECT "r1"."assembly", "r1"."assembly_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."assembly_kind" + 1]::"pg_catalog"."text", "r1"."id", "r1"."instance", "r1"."owner", "r1"."package", "r1"."path", "r1"."start", "r1"."id_digest"
FROM "qti"."placed_id" AS "r1";

CREATE VIEW "__qti"."placed_idref" ("assembly", "id", "id_digest", "instance", "package", "path") AS
SELECT "r1"."assembly", "r1"."id", "r1"."id_digest", "r1"."instance", "r1"."package", "r1"."path"
FROM "qti"."placed_idref" AS "r1";

CREATE VIEW "__qti"."placed_math_rank" ("assembly", "instance", "package", "path", "rank", "start") AS
SELECT "r1"."assembly", "r1"."instance", "r1"."package", "r1"."path", "r1"."rank", "r1"."start"
FROM "qti"."placed_math_rank" AS "r1";

CREATE VIEW "__qti"."placed_share_target" ("assembly", "assembly_kind", "assembly_kind_name", "id", "id_digest", "instance", "package", "path", "start", "target", "target_instance", "target_start") AS
SELECT "r1"."assembly", "r1"."assembly_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."assembly_kind" + 1]::"pg_catalog"."text", "r1"."id", "r1"."id_digest", "r1"."instance", "r1"."package", "r1"."path", "r1"."start", "r1"."target", "r1"."target_instance", "r1"."target_start"
FROM "qti"."placed_share_target" AS "r1";

CREATE VIEW "__qti"."placed_variable_ref" ("assembly", "attribute", "attribute_name", "base_type", "base_type_name", "cardinality", "cardinality_name", "identifier", "instance", "package", "path", "resolution", "resolution_name", "root_kind", "root_kind_name", "start") AS
SELECT "r1"."assembly", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."base_type", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."cardinality", ("qti"."__value_cardinality_names_wzwznoycgf"())["r1"."cardinality" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."instance", "r1"."package", "r1"."path", "r1"."resolution", ("qti"."__reference_resolution_names_zfbhfhou4v"())["r1"."resolution" + 1]::"pg_catalog"."text", "r1"."root_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."root_kind" + 1]::"pg_catalog"."text", "r1"."start"
FROM "qti"."placed_variable_ref" AS "r1";

CREATE VIEW "__qti"."printed_variable_ref" ("assembly_kind", "assembly_kind_name", "attribute", "attribute_name", "identifier", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."assembly_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."assembly_kind" + 1]::"pg_catalog"."text", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."printed_variable_ref" AS "r1";

CREATE VIEW "__qti"."processing" ("language", "language_name", "package", "path", "start") AS
SELECT "r1"."language", ("qti"."__language_names_pvmtywwssv"())["r1"."language" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."processing" AS "r1";

CREATE VIEW "__qti"."reference" ("kind", "kind_name", "lead", "name", "name_name", "package", "params", "path", "scope", "scope_name", "start", "target", "trail") AS
SELECT "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."lead", "r1"."name", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."name" + 1]::"pg_catalog"."text", "r1"."package", "r1"."params", "r1"."path", "r1"."scope", ("qti"."__href_scope_names_y4pbuo4f5q"())["r1"."scope" + 1]::"pg_catalog"."text", "r1"."start", "r1"."target", "r1"."trail"
FROM "qti"."reference" AS "r1";

CREATE VIEW "__qti"."reference_path" ("kind", "kind_name", "name", "name_name", "package", "path", "start", "target") AS
SELECT "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."name", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."name" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start", "r1"."target"
FROM "qti"."reference_path" AS "r1";

CREATE VIEW "__qti"."referring_document" ("contexts", "feedbacks", "package", "path", "prints", "templates") AS
SELECT "r1"."contexts", "r1"."feedbacks", "r1"."package", "r1"."path", "r1"."prints", "r1"."templates"
FROM "qti"."referring_document" AS "r1";

CREATE VIEW "__qti"."resource_document" ("package", "path", "root_kind", "root_kind_name", "type", "type_name", "document_type", "document_type_name") AS
SELECT "r1"."package", "r1"."path", "r1"."root_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."root_kind" + 1]::"pg_catalog"."text", "r1"."type", ("qti"."__resource_type_names_2tbbvn3ion"())["r1"."type" + 1]::"pg_catalog"."text", "r1"."document_type", ("qti"."__document_type_names_ot37qp5org"())["r1"."document_type" + 1]::"pg_catalog"."text"
FROM "qti"."resource_document" AS "r1";

CREATE VIEW "__qti"."resource_href" ("package", "path", "scope", "scope_name", "start") AS
SELECT "r1"."package", "r1"."path", "r1"."scope", ("qti"."__href_scope_names_y4pbuo4f5q"())["r1"."scope" + 1]::"pg_catalog"."text", "r1"."start"
FROM "qti"."resource_href" AS "r1";

CREATE VIEW "__qti"."resource_href_outside" ("package", "path", "start", "target", "target_digest") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."target", "r1"."target_digest"
FROM "qti"."resource_href_outside" AS "r1";

CREATE VIEW "__qti"."resource_href_path" ("package", "path", "start", "target") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."target"
FROM "qti"."resource_href_path" AS "r1";

CREATE VIEW "__qti"."rounding" ("holds", "holds_name", "package", "path", "start") AS
SELECT "r1"."holds", ("qti"."__rounding_holds_names_6j2zaayymp"())["r1"."holds" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."rounding" AS "r1";

CREATE VIEW "__qti"."rounding_figures" ("figures_lexical", "package", "path", "start", "figures", "figures_digest", "figures_lexical_digest") AS
SELECT "r1"."figures_lexical", "r1"."package", "r1"."path", "r1"."start", "r1"."figures", "r1"."figures_digest", "r1"."figures_lexical_digest"
FROM "qti"."rounding_figures" AS "r1";

CREATE VIEW "__qti"."rounding_mode_figures" ("figures", "mode", "package", "path", "start", "figures_digest") AS
SELECT "r1"."figures", "r1"."mode", "r1"."package", "r1"."path", "r1"."start", "r1"."figures_digest"
FROM "qti"."rounding_mode_figures" AS "r1";

CREATE VIEW "__qti"."sd_decl" ("package", "path", "standalone", "standalone_name") AS
SELECT "r1"."package", "r1"."path", "r1"."standalone", ("qti"."__xml_standalone_names_psf7bszcug"())["r1"."standalone" + 1]::"pg_catalog"."text"
FROM "qti"."sd_decl" AS "r1";

CREATE VIEW "__qti"."share_fragment" ("assembled", "id", "id_digest", "package", "path", "placements", "start") AS
SELECT "r1"."assembled", "r1"."id", "r1"."id_digest", "r1"."package", "r1"."path", "r1"."placements", "r1"."start"
FROM "qti"."share_fragment" AS "r1";

CREATE VIEW "__qti"."share_target" ("id", "package", "path", "start", "target_start", "id_digest") AS
SELECT "r1"."id", "r1"."package", "r1"."path", "r1"."start", "r1"."target_start", "r1"."id_digest"
FROM "qti"."share_target" AS "r1";

CREATE VIEW "__qti"."site" ("ancestry", "children", "external", "governor", "governor_name", "kind", "kind_name", "nearest", "nearest_kind", "nearest_kind_name", "nearest_path", "package", "parent", "parent_kind", "parent_kind_name", "path", "start") AS
SELECT "r1"."ancestry", "r1"."children", "r1"."external", "r1"."governor", ("qti"."__governor_names_d7jfyla3na"())["r1"."governor" + 1]::"pg_catalog"."text", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."nearest", "r1"."nearest_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."nearest_kind" + 1]::"pg_catalog"."text", "r1"."nearest_path", "r1"."package", "r1"."parent", "r1"."parent_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."parent_kind" + 1]::"pg_catalog"."text", "r1"."path", "r1"."start"
FROM "qti"."site" AS "r1";

CREATE VIEW "__qti"."site_path" ("entry", "kind", "kind_name", "package", "path", "start", "target") AS
SELECT "r1"."entry", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start", "r1"."target"
FROM "qti"."site_path" AS "r1";

CREATE VIEW "__qti"."site_target" ("ancestry", "kind", "kind_name", "nearest", "nearest_kind", "nearest_kind_name", "package", "parent_kind", "parent_kind_name", "path", "places", "splices", "start", "target", "target_nearest", "target_nearest_kind", "target_nearest_kind_name", "target_nearest_path", "target_root", "target_root_name") AS
SELECT "r1"."ancestry", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."nearest", "r1"."nearest_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."nearest_kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."parent_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."parent_kind" + 1]::"pg_catalog"."text", "r1"."path", "r1"."places", "r1"."splices", "r1"."start", "r1"."target", "r1"."target_nearest", "r1"."target_nearest_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."target_nearest_kind" + 1]::"pg_catalog"."text", "r1"."target_nearest_path", "r1"."target_root", ("qti"."__node_kind_names_ulbko553n7"())["r1"."target_root" + 1]::"pg_catalog"."text"
FROM "qti"."site_target" AS "r1";

CREATE VIEW "__qti"."srcset" ("package", "path", "start", "token_text", "tokens", "trail", "token_text_digest") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."token_text", "r1"."tokens", "r1"."trail", "r1"."token_text_digest"
FROM "qti"."srcset" AS "r1";

CREATE VIEW "__qti"."srcset_candidate" ("at", "descriptor", "lead", "package", "path", "pieces_after", "pieces_was", "scope", "scope_name", "start", "url", "piece", "pieces_after_digest", "pieces_was_digest") AS
SELECT "r1"."at", "r1"."descriptor", "r1"."lead", "r1"."package", "r1"."path", "r1"."pieces_after", "r1"."pieces_was", "r1"."scope", ("qti"."__href_scope_names_y4pbuo4f5q"())["r1"."scope" + 1]::"pg_catalog"."text", "r1"."start", "r1"."url", "r1"."piece", "r1"."pieces_after_digest", "r1"."pieces_was_digest"
FROM "qti"."srcset_candidate" AS "r1";

CREATE VIEW "__qti"."ssml_scope" ("fragment", "package", "path", "start") AS
SELECT "r1"."fragment", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."ssml_scope" AS "r1";

CREATE VIEW "__qti"."stimulus_ref" ("identifier", "package", "path", "start") AS
SELECT "r1"."identifier", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."stimulus_ref" AS "r1";

CREATE VIEW "__qti"."template_ref" ("assembly_kind", "assembly_kind_name", "attribute", "attribute_name", "identifier", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."assembly_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."assembly_kind" + 1]::"pg_catalog"."text", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."template_ref" AS "r1";

CREATE VIEW "__qti"."text_idref" ("after", "at", "before", "package", "path", "pieces_after", "pieces_was", "start", "token", "piece", "pieces_after_digest", "pieces_was_digest", "token_digest") AS
SELECT "r1"."after", "r1"."at", "r1"."before", "r1"."package", "r1"."path", "r1"."pieces_after", "r1"."pieces_was", "r1"."start", "r1"."token", "r1"."piece", "r1"."pieces_after_digest", "r1"."pieces_was_digest", "r1"."token_digest"
FROM "qti"."text_idref" AS "r1";

CREATE VIEW "__qti"."text_reference" ("kind", "kind_name", "lead", "package", "params", "path", "scope", "scope_name", "start", "target", "trail") AS
SELECT "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."lead", "r1"."package", "r1"."params", "r1"."path", "r1"."scope", ("qti"."__href_scope_names_y4pbuo4f5q"())["r1"."scope" + 1]::"pg_catalog"."text", "r1"."start", "r1"."target", "r1"."trail"
FROM "qti"."text_reference" AS "r1";

CREATE VIEW "__qti"."text_reference_path" ("kind", "kind_name", "package", "path", "start", "target") AS
SELECT "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start", "r1"."target"
FROM "qti"."text_reference_path" AS "r1";

CREATE VIEW "__qti"."tolerance" ("package", "path", "start", "token_text", "tokens", "token_text_digest") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."token_text", "r1"."tokens", "r1"."token_text_digest"
FROM "qti"."tolerance" AS "r1";

CREATE VIEW "__qti"."tolerance_token" ("after", "at", "before", "package", "path", "pieces_after", "pieces_was", "start", "token", "piece", "pieces_after_digest", "pieces_was_digest", "token_digest") AS
SELECT "r1"."after", "r1"."at", "r1"."before", "r1"."package", "r1"."path", "r1"."pieces_after", "r1"."pieces_was", "r1"."start", "r1"."token", "r1"."piece", "r1"."pieces_after_digest", "r1"."pieces_was_digest", "r1"."token_digest"
FROM "qti"."tolerance_token" AS "r1";

CREATE VIEW "__qti"."usage_value" ("base_type_lexical", "package", "path", "start", "text", "base_type_lexical_digest", "text_digest") AS
SELECT "r1"."base_type_lexical", "r1"."package", "r1"."path", "r1"."start", "r1"."text", "r1"."base_type_lexical_digest", "r1"."text_digest"
FROM "qti"."usage_value" AS "r1";

CREATE VIEW "__qti"."usage_value_base_type" ("base_type", "base_type_name", "base_type_lexical", "package", "path", "start", "text", "base_type_lexical_digest", "text_digest") AS
SELECT "r1"."base_type", ("qti"."__base_type_names_ok3nu5nck4"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."base_type_lexical", "r1"."package", "r1"."path", "r1"."start", "r1"."text", "r1"."base_type_lexical_digest", "r1"."text_digest"
FROM "qti"."usage_value_base_type" AS "r1";

CREATE VIEW "__qti"."variable_ref" ("after", "attribute", "attribute_name", "before", "identifier", "language", "language_name", "package", "path", "root_kind", "root_kind_name", "start") AS
SELECT "r1"."after", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."before", "r1"."identifier", "r1"."language", ("qti"."__language_names_pvmtywwssv"())["r1"."language" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."root_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."root_kind" + 1]::"pg_catalog"."text", "r1"."start"
FROM "qti"."variable_ref" AS "r1";

CREATE VIEW "__qti"."xml_decl" ("package", "path", "version") AS
SELECT "r1"."package", "r1"."path", "r1"."version"
FROM "qti"."xml_decl" AS "r1";

CREATE VIEW "__qti_queries"."assembled_catalog" ("assembly", "id_digest", "package") AS
SELECT "r1"."assembly", "r1"."id_digest", "r1"."package"
FROM "qti_queries"."assembled_catalog" AS "r1";

CREATE VIEW "__qti_queries"."table_header" ("id", "id_digest", "package", "path", "start", "table") AS
SELECT "r1"."id", "r1"."id_digest", "r1"."package", "r1"."path", "r1"."start", "r1"."table"
FROM "qti_queries"."table_header" AS "r1";

CREATE VIEW "__qti_views"."catalog_id" ("id", "id_digest", "package", "path", "start") AS
SELECT "r1"."id", "r1"."id_digest", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_views"."catalog_id" AS "r1";

CREATE VIEW "__qti_views"."cell_table" ("package", "path", "start", "table") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."table"
FROM "qti_views"."cell_table" AS "r1";

CREATE VIEW "__qti_views"."header_token" ("at", "package", "path", "start", "token", "token_digest") AS
SELECT "r1"."at", "r1"."package", "r1"."path", "r1"."start", "r1"."token", "r1"."token_digest"
FROM "qti_views"."header_token" AS "r1";

CREATE VIEW "__qti_views"."lookup_value" ("name", "name_name", "package", "path", "start", "value") AS
SELECT "r1"."name", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."name" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start", "r1"."value"
FROM "qti_views"."lookup_value" AS "r1";

CREATE VIEW "__qti_views"."map_key" ("key", "package", "path", "start") AS
SELECT "r1"."key", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_views"."map_key" AS "r1";

GRANT :"qti_queries__author" TO :"qti_queries__author_app" WITH INHERIT FALSE, SET TRUE;

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
GRANT USAGE ON SCHEMA "qti", "qti_views", "qti_queries", "__qti_queries", "__qti", "__qti_views" TO :"qti_queries__author";

GRANT SELECT ON TABLE "__qti_queries"."assembled_catalog", "__qti"."assembled_document", "__qti"."attribute", "__qti"."attribute_entity", "__qti"."binding_name", "__qti"."bound_variable", "__qti"."candidate_path", "__qti_views"."catalog_id", "__qti"."catalog_scope", "__qti"."cell_leaf", "__qti_views"."cell_table", "__qti"."choice", "__qti"."choice_interaction", "__qti"."cn_attribute", "__qti"."cn_count", "__qti"."cn_part_text", "__qti"."cn_slot", "__qti"."comment", "__qti"."context_ref", "__qti"."count_bound", "__qti"."data_ssml", "__qti"."data_ssml_member", "__qti"."data_ssml_property", "__qti"."doctype", "__qti"."document", "__qti"."document_id", "__qti"."element_type", "__qti"."encoding_decl", "__qti"."entry", "__qti"."expression", "__qti"."feedback_ref", "__qti"."file", "__qti"."file_outside", "__qti"."file_path", "__qti"."fragment_context_name", "__qti"."fragment_context_ref", "__qti"."fragment_feedback_name", "__qti"."fragment_feedback_ref", "__qti"."fragment_printed_name", "__qti"."fragment_printed_ref", "__qti"."fragment_scope", "__qti"."fragment_template_name", "__qti"."fragment_template_ref", "__qti_views"."header_token", "__qti"."hottext", "__qti"."identity_text", "__qti"."idref", "__qti"."idref_target", "__qti"."inclusion", "__qti"."instance", "__qti"."interaction", "__qti"."interaction_attribute", "__qti"."item_mode", "__qti"."item_ref_document", "__qti"."item_ref_href", "__qti"."label_use", "__qti"."least_count", "__qti"."link_reading", "__qti"."literal", "__qti"."literal_typed", "__qti_views"."lookup_value", "__qti_views"."map_key", "__qti"."math_action", "__qti"."math_align_group", "__qti"."math_align_scope", "__qti"."math_cell", "__qti"."math_cn", "__qti"."math_rank", "__qti"."media", "__qti"."most_count", "__qti"."named", "__qti"."namespace", "__qti"."node", "__qti"."numbered_reading", "__qti"."open_attribute", "__qti"."open_attribute_entity", "__qti"."open_element_name", "__qti"."open_element_type", "__qti"."package", "__qti"."pci_module_form", "__qti"."pi", "__qti"."placed_binding", "__qti"."placed_choice", "__qti"."placed_expression", "__qti"."placed_hottext", "__qti"."placed_id", "__qti"."placed_idref", "__qti"."placed_math_rank", "__qti"."placed_share_target", "__qti"."placed_variable_ref", "__qti"."printed_variable_ref", "__qti"."processing", "__qti"."reference", "__qti"."reference_path", "__qti"."referring_document", "__qti"."resource_document", "__qti"."resource_href", "__qti"."resource_href_outside", "__qti"."resource_href_path", "__qti"."rounding", "__qti"."rounding_figures", "__qti"."rounding_mode_figures", "__qti"."sd_decl", "__qti"."share_fragment", "__qti"."share_target", "__qti"."site", "__qti"."site_path", "__qti"."site_target", "__qti"."srcset", "__qti"."srcset_candidate", "__qti"."ssml_scope", "__qti"."stimulus_ref", "__qti_queries"."table_header", "__qti"."template_ref", "__qti"."text_idref", "__qti"."text_reference", "__qti"."text_reference_path", "__qti"."tolerance", "__qti"."tolerance_token", "__qti"."usage_value", "__qti"."usage_value_base_type", "__qti"."variable_ref", "__qti"."xml_decl" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."assembled_document" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."attribute" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."attribute_entity" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."binding_name" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."bound_variable" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."candidate_path" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."catalog_scope" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."cell_leaf" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."choice" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."choice_interaction" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."cn_attribute" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."cn_count" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."cn_part_text" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."cn_slot" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."comment" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."context_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."count_bound" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."data_ssml" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."data_ssml_member" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."data_ssml_property" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."doctype" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."document" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."document_id" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."element_type" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."encoding_decl" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."entry" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."expression" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."feedback_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."file" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."file_outside" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."file_path" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."fragment_context_name" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."fragment_context_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."fragment_feedback_name" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."fragment_feedback_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."fragment_printed_name" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."fragment_printed_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."fragment_scope" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."fragment_template_name" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."fragment_template_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."hottext" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."identity_text" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."idref" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."idref_target" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."inclusion" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."instance" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."interaction" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."interaction_attribute" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."item_mode" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."item_ref_document" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."item_ref_href" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."label_use" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."least_count" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."link_reading" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."literal" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."literal_typed" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."math_action" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."math_align_group" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."math_align_scope" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."math_cell" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."math_cn" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."math_rank" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."media" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."most_count" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."named" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."namespace" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."node" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."numbered_reading" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."open_attribute" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."open_attribute_entity" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."open_element_name" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."open_element_type" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."package" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."pci_module_form" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."pi" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."placed_binding" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."placed_choice" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."placed_expression" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."placed_hottext" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."placed_id" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."placed_idref" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."placed_math_rank" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."placed_share_target" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."placed_variable_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."printed_variable_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."processing" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."reference" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."reference_path" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."referring_document" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."resource_document" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."resource_href" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."resource_href_outside" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."resource_href_path" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."rounding" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."rounding_figures" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."rounding_mode_figures" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."sd_decl" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."share_fragment" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."share_target" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."site" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."site_path" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."site_target" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."srcset" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."srcset_candidate" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."ssml_scope" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."stimulus_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."template_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."text_idref" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."text_reference" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."text_reference_path" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."tolerance" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."tolerance_token" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."usage_value" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."usage_value_base_type" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."variable_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."xml_decl" TO :"qti_queries__author";

GRANT EXECUTE ON FUNCTION "qti"."__refuse"("pg_catalog"."text", "pg_catalog"."text", "pg_catalog"."text") TO :"qti_queries__author";

GRANT EXECUTE ON FUNCTION "qti"."__borrow"(bigint[], boolean[]) TO :"qti_queries__author";

GRANT EXECUTE ON FUNCTION "qti"."__constant_uij2fonltq"(), "qti"."__constant_bkqh2friwv"(), "qti"."__constant_n352p2ccrd"(), "qti"."__constant_7nj7hecpq2"(), "qti"."__constant_25evvcytug"(), "qti"."__constant_sx2lr4try3"(), "qti"."__constant_u7eltifwnk"(), "qti"."__constant_eihc4dooua"(), "qti"."__constant_nhyhb5mvr7"(), "qti"."__constant_ibiapjhixk"(), "qti"."__constant_rqwqzvpydz"(), "qti"."__constant_ved73rklss"(), "qti"."__constant_o42tylpu3f"(), "qti"."__constant_34ylax76r2"(), "qti"."__constant_zivpez3hny"(), "qti"."__constant_6tjsmg7qqf"(), "qti"."__constant_hmibfx5gyk"(), "qti"."__constant_j4ofs3gxv5"(), "qti"."__constant_ncvuf24xxr"(), "qti"."__constant_its5nruomz"(), "qti"."__constant_ykvwltiwpp"(), "qti"."__constant_wuvnkockig"(), "qti"."__constant_pqb7w4p5hy"(), "qti"."__constant_ttedx5vn3k"(), "qti"."__constant_ygahn2lxos"(), "qti"."__constant_6elmo3tsbj"(), "qti"."__constant_zdkkfmabrr"(), "qti"."__constant_wzcsm5lgek"(), "qti"."__constant_sxvrbj5e5g"(), "qti"."__constant_npu4wt2fbp"(), "qti"."__constant_is5wq7ypst"(), "qti"."__constant_jdee42qvkw"(), "qti"."__constant_gnajygigus"(), "qti"."__constant_2dcoyzngxn"(), "qti"."__constant_pyzqarxq6e"(), "qti"."__constant_ddolihfto7"(), "qti"."__constant_mqob2q6eth"(), "qti"."__constant_kzeitfadmd"(), "qti"."__constant_7sx4k5dafp"(), "qti"."__constant_4okg7vcxht"(), "qti"."__constant_llc3ctzcti"(), "qti"."__constant_kwiyfmd5vb"(), "qti"."__constant_tfs6lrbcyd"(), "qti"."__constant_hd6fiuddlw"(), "qti"."__constant_cvrzwozguy"(), "qti"."__constant_ciuqwbhuta"(), "qti"."__constant_whaydjeagy"(), "qti"."__constant_524yb4vb32"(), "qti"."__constant_u6qipu43gw"(), "qti"."__constant_j2u4rcjq6x"(), "qti"."__constant_eufobqzn7j"(), "qti"."__constant_vxtk2vgo73"(), "qti"."__constant_qrpsoa4uqr"(), "qti"."__constant_2xctpszff4"(), "qti"."__constant_ehp27av5sv"(), "qti"."__constant_sj4gtqwjvu"(), "qti"."__constant_inwmcukoes"(), "qti"."__constant_mhzhm7i77c"(), "qti"."__constant_omoipacrlm"(), "qti"."__constant_ypvumnh5zz"(), "qti"."__constant_2p24sg5e4t"(), "qti"."__constant_exnqxdg5si"(), "qti"."__constant_wrlwssqvsp"(), "qti"."__constant_k64cxi3yp3"(), "qti"."__constant_b6ph5734n4"(), "qti"."__constant_5vczbwx7y7"(), "qti"."__constant_oz2fkzit2q"(), "qti"."__constant_5lt3ujp3cm"(), "qti"."__constant_samvsv5x3m"(), "qti"."__constant_ibvgt6pxwh"(), "qti"."__constant_6pgyw625sv"(), "qti"."__constant_ab562yacjn"(), "qti"."__constant_wvtqnkiky3"(), "qti"."__constant_26d5zth2zv"(), "qti"."__constant_6ktdfd4rhr"(), "qti"."__constant_xem42aq3by"(), "qti"."__constant_5pcz6dyjzi"(), "qti"."__constant_3zq77hs2za"(), "qti"."__constant_5w6ioztupb"(), "qti"."__constant_be4fhhavq4"(), "qti"."__constant_bmcetcvghy"(), "qti"."__constant_w4rn4enepj"(), "qti"."__constant_6f44bj6f5z"(), "qti"."__constant_nomzdv3mb7"(), "qti"."__constant_yzav37j3jv"(), "qti"."__constant_przq27rlwm"(), "qti"."__constant_qrfq2g4hkz"(), "qti"."__constant_wvf3myfrte"(), "qti"."__constant_firw67ibkt"(), "qti"."__constant_zm6rziqkms"(), "qti"."__constant_rqidljwzm2"(), "qti"."__constant_5r3at22xvz"(), "qti"."__constant_ellk4zorxq"(), "qti"."__constant_aagz375mdd"(), "qti"."__constant_aprps52eby"(), "qti"."__constant_ahddjwrhv5"(), "qti"."__constant_ea7dd7ctff"(), "qti"."__constant_k3fjlwxuwn"(), "qti"."__constant_wxfnisv4kj"(), "qti"."__constant_zei655nkpr"(), "qti"."__constant_fhvqv42slo"(), "qti"."__constant_xvmgsamjvy"(), "qti"."__constant_ugrf235wgp"(), "qti"."__constant_lliww2nzpo"(), "qti"."__constant_avnlqmggvi"(), "qti"."__constant_g3mzemfbr3"(), "qti"."__constant_qhszlaty7i"(), "qti"."__constant_dqbnkda3gg"(), "qti"."__constant_gf6he576t3"(), "qti"."__constant_zgknnwrg6p"(), "qti"."__constant_hl533zhknx"(), "qti"."__constant_fsmfviu65m"(), "qti"."__constant_on7irbswfh"(), "qti"."__constant_ow4c7w37ca"(), "qti"."__constant_wvuca46fcu"(), "qti"."__constant_7whnbuqq7w"(), "qti"."__constant_vs2arr6h6k"(), "qti"."__constant_ho6c7gpjo3"(), "qti"."__constant_ejkw66w2je"(), "qti"."__constant_u77vjsa3nx"(), "qti"."__constant_sl65lnozn2"(), "qti"."__constant_un3x4skblz"(), "qti"."__constant_otpfpakmgn"(), "qti"."__constant_2ladvjuynk"(), "qti"."__constant_p2xwmlesaa"(), "qti"."__constant_fpzoryswx7"(), "qti"."__constant_fccrluys3c"(), "qti"."__constant_7rkjmglcw6"(), "qti"."__constant_j6uos7o7iw"(), "qti"."__constant_7puc5uc6kh"(), "qti"."__constant_wekhard5xm"(), "qti"."__constant_ajahbtka65"(), "qti"."__constant_6iey4mkmde"(), "qti"."__constant_ab5qkascpx"(), "qti"."__constant_wuqtd2dywh"(), "qti"."__constant_5rhv5nncq2"(), "qti"."__constant_fe4yby2lv5"(), "qti"."__constant_wozychch32"(), "qti"."__constant_kk3tbfzgkz"(), "qti"."__constant_w7hnvtob66"(), "qti"."__constant_ucgcmte27p"(), "qti"."__constant_cmomvytsjq"(), "qti"."__constant_i7ai66pv6h"(), "qti"."__constant_y75rhchi3d"(), "qti"."__constant_uya5skuzlx"(), "qti"."__constant_obvdrq3725"(), "qti"."__constant_sn5ucr2eat"(), "qti"."__constant_taww2a5tgr"(), "qti"."__constant_dtz4lgxf7y"(), "qti"."__constant_sjctib2m6a"(), "qti"."__constant_gqyrbuxeym"(), "qti"."__constant_hygd7nfdcf"(), "qti"."__constant_gg2lrkl4ik"(), "qti"."__constant_4hs7fzokws"(), "qti"."__constant_aiwrmlshlf"(), "qti"."__constant_ab3uwhdr2q"(), "qti"."__constant_tzvpybzw74"(), "qti"."__constant_txeneneu7t"(), "qti"."__constant_ioawzxl5py"(), "qti"."__is_xsd_pattern_p2kcfw56ul"("pg_catalog"."text"), "qti"."__text_digest_2x5x4iwe4m"("pg_catalog"."text"), "qti"."__align_direction_names_vluq7iazdg"(), "qti"."__align_state_names_ffk37slxn3"(), "qti"."__attribute_name_names_q6tmzcty4e"(), "qti"."__base_type_names_ok3nu5nck4"(), "qti"."__cn_base_names_2wtzhyubck"(), "qti"."__cn_part_names_6db2fcgfhy"(), "qti"."__cn_part_form_names_te7u7jycdu"(), "qti"."__cn_type_names_wmjelllvhg"(), "qti"."__document_type_names_ot37qp5org"(), "qti"."__entry_kind_names_km5xejbmwu"(), "qti"."__governor_names_d7jfyla3na"(), "qti"."__href_scope_names_y4pbuo4f5q"(), "qti"."__language_names_pvmtywwssv"(), "qti"."__node_kind_names_ulbko553n7"(), "qti"."__position_names_sglcn7ygpg"(), "qti"."__reference_resolution_names_zfbhfhou4v"(), "qti"."__resource_type_names_2tbbvn3ion"(), "qti"."__rounding_holds_names_6j2zaayymp"(), "qti"."__type_name_names_ksmacbo3df"(), "qti"."__value_base_names_pjzlcpdwvv"(), "qti"."__value_cardinality_names_wzwznoycgf"(), "qti"."__xml_standalone_names_psf7bszcug"(), "qti"."__admission_map_live_xrc2h3fveq"(), "qti"."__align_direction_live_2lezvj35h2"(), "qti"."__align_state_live_lhmmdyh7ap"(), "qti"."__attribute_model_live_4rpyw2wqfh"(), "qti"."__attribute_name_live_mghzolknn3"(), "qti"."__attribute_slot_live_3plwjx3sjc"(), "qti"."__base_type_live_y3pmvhj7zb"(), "qti"."__bound_facet_live_kux6fr53gv"(), "qti"."__bound_zero_live_5rlfzns3wq"(), "qti"."__built_in_live_f6bja7a4kg"(), "qti"."__cardinality_live_qwvqhyiu3t"(), "qti"."__cn_base_live_46ek53retw"(), "qti"."__cn_part_live_d7vk6cnszc"(), "qti"."__cn_part_form_live_hivm5ovjjn"(), "qti"."__cn_type_live_mftnyibli4"(), "qti"."__content_model_live_36z72epzkf"(), "qti"."__declaration_kind_live_uyajfwbwph"(), "qti"."__document_type_live_5oxlw6me3c"(), "qti"."__domain_primitive_live_7z4e7dri7p"(), "qti"."__entry_kind_live_iwotf6s2yf"(), "qti"."__flag_live_skpa5hsl6r"(), "qti"."__follow_set_live_ym66qqil5n"(), "qti"."__governor_live_gktrkb66r6"(), "qti"."__href_scope_live_zgj2x26s76"(), "qti"."__identity_live_z64zgxl2uo"(), "qti"."__include_set_live_mtgrllg3lw"(), "qti"."__language_live_y2rauuuzos"(), "qti"."__node_kind_live_b7rifmc6m4"(), "qti"."__position_live_pi53civw33"(), "qti"."__reference_form_live_sckdmazr47"(), "qti"."__reference_resolution_live_6hzgo5pknw"(), "qti"."__reference_spelling_live_ke2xl66eo4"(), "qti"."__resource_type_live_m5qnrkbzgq"(), "qti"."__rounding_holds_live_7xm6dvdabq"(), "qti"."__shared_model_live_37zbpyitfj"(), "qti"."__symbol_set_live_3wo3lzfzqb"(), "qti"."__type_name_live_dizeay3gzc"(), "qti"."__unplaced_cause_live_7eeinprrjn"(), "qti"."__use_live_qqc6fbn3jc"(), "qti"."__value_base_live_pesuextzp2"(), "qti"."__value_cardinality_live_img3c6yzn6"(), "qti"."__value_domain_live_fpcln73bij"(), "qti"."__white_space_live_ywok3yue3q"(), "qti"."__xml_standalone_live_ql62ubmw6y"(), "qti"."__row_ha5uesvxf5"("qti"."governor", "qti"."__text_tfkvgtjblt"), "qti"."__row_j5e7cdd5yv"("pg_catalog"."text", "qti"."cn_type"), "qti"."__row_ifjiso3sae"("qti"."node_kind", "qti"."__attribute_slot_bits_112_aecznthxg5"), "qti"."__row_fzgnnk5id3"("qti"."node_kind", "qti"."type_name"), "qti"."__row_zmo46cd6nh"("qti"."node_kind", "qti"."node_kind", "qti"."position", "qti"."__domain_gfw43vigph", bigint, bigint), "qti"."__row_mf5tbjlvzq"("qti"."__text_c6iptmtj2x"), "qti"."__row_wpa4xaxg6g"("qti"."governor", "qti"."attribute_name", "qti"."__text_c6iptmtj2x"), "qti"."__row_7xtkdeeinf"("qti"."__text_3dlgl63rv6", "qti"."__text_3dlgl63rv6", "qti"."__text_r2monji6i2"), "qti"."__row_tpgnuuvn6t"("qti"."__text_tfkvgtjblt", "pg_catalog"."text"), "qti"."__row_nvjvmcz2l5"("pg_catalog"."text", "qti"."href_scope"), "qti"."__row_6re7khxabv"("pg_catalog"."text", "qti"."__text_c6iptmtj2x", "qti"."__text_c6iptmtj2x"), "qti"."__row_rbnmyazhde"("qti"."__text_c6iptmtj2x"), "qti"."__row_uaeh72ufm7"("pg_catalog"."text", "qti"."cn_base", "pg_catalog"."text", "qti"."cn_type"), "qti"."__row_6f23azrfdw"("qti"."governor", "qti"."__attribute_slot_bits_112_aecznthxg5"), "qti"."__row_y3yv7uwbvr"("qti"."__text_tfkvgtjblt"), "qti"."__row_xzj6pczrns"("qti"."node_kind", "qti"."node_kind"), "qti"."__row_e6blhtroc2"("qti"."node_kind", "qti"."__domain_gfw43vigph"), "qti"."__row_bzjfc2f4h5"("qti"."__text_k5kwygzatl"), "qti"."__row_6rfxzdle5g"("qti"."node_kind", "qti"."node_kind", "qti"."position", "qti"."__domain_gfw43vigph", bigint, bigint), "qti"."__row_wczkl5jgfh"("qti"."document_type", "qti"."__text_tn2inwix7f"), "qti"."__row_atcormr3u4"("qti"."node_kind", "qti"."node_kind", "qti"."attribute_name", "qti"."__text_r2monji6i2"), "qti"."__row_e5z245apmv"("qti"."node_kind", "qti"."position"), "qti"."__row_76bhwjyl6b"("qti"."governor", "qti"."attribute_name"), "qti"."__row_3k3gj4kfgc"("qti"."__attribute_slot_bits_112_aecznthxg5", "qti"."governor"), "qti"."__row_sigxbapf7z"("qti"."node_kind", "qti"."governor", "qti"."__text_c6iptmtj2x", "qti"."__text_gke7uypkov", "qti"."__text_gke7uypkov", "qti"."__flag_bits_16_llpdtzgaon", "qti"."__flag_bits_16_llpdtzgaon", "qti"."__domain_gfw43vigph"), "qti"."__row_h6vjucvz3t"("qti"."__text_kgtzfmq7x6"), "qti"."__row_ha47wb6n3x"("qti"."governor", "qti"."attribute_name", "qti"."__text_c6iptmtj2x"), "qti"."__row_xkataczrlc"("qti"."__text_nhrekaddjj", "qti"."base_type"), "qti"."__row_cdxyb64h3n"("qti"."base_type"), "qti"."__row_qyxmls2nib"("qti"."governor", "qti"."node_kind", "qti"."type_name"), "qti"."__row_sk5tugqwcr"("qti"."__attribute_slot_bits_112_aecznthxg5", "qti"."governor"), "qti"."__row_f3arllrhkz"("qti"."governor", "qti"."__attribute_slot_bits_112_aecznthxg5"), "qti"."__row_ll5avkvuxu"("qti"."node_kind", "qti"."node_kind", "qti"."governor", "qti"."__domain_gfw43vigph", "qti"."__text_tfkvgtjblt", "qti"."__text_tfkvgtjblt", "qti"."__text_c6iptmtj2x"), "qti"."__row_vsmud4oyxc"("qti"."__text_c6iptmtj2x"), "qti"."__row_5g45nfefn7"("qti"."__attribute_slot_bits_112_aecznthxg5", "qti"."governor"), "qti"."__row_mwacvs3yet"("qti"."cn_part", "qti"."cn_type", "qti"."cn_part_form"), "qti"."__row_nqba7rulo6"("qti"."value_cardinality"), "qti"."__row_agackuopn5"("qti"."__text_netnsfkgs7", "qti"."href_scope", "qti"."__text_b6ykamoeho", "qti"."__domain_gfw43vigph"), "qti"."__row_v4qtibeah3"("pg_catalog"."text", bigint), "qti"."__row_avobhiw5hj"("pg_catalog"."text", "qti"."cn_part_form", "qti"."cn_base"), "qti"."__row_xemajpyaox"("qti"."node_kind", "qti"."__flag_bits_16_llpdtzgaon"), "qti"."__row_cxffogbiju"("qti"."node_kind", "qti"."node_kind", "qti"."position", "qti"."position"), "qti"."__row_xynmxpup7x"("qti"."cn_type", "qti"."__domain_gfw43vigph"), "qti"."__row_v5mox6r536"("qti"."node_kind", "qti"."__text_xj3zno7u3h", "qti"."attribute_name"), "qti"."__row_tulgtjaryp"("qti"."resource_type", "qti"."node_kind"), "qti"."__row_l37o3qzyb2"("qti"."governor", "qti"."attribute_name", "qti"."__text_c6iptmtj2x"), "qti"."__row_dbnwees6vb"("qti"."governor", "qti"."attribute_name", "qti"."__text_c6iptmtj2x"), "qti"."__row_dfvu25q4di"("pg_catalog"."text", "qti"."base_type"), "qti"."__row_qx3rdjvde7"("qti"."__text_c6iptmtj2x", "qti"."node_kind", "qti"."attribute_name"), "qti"."__row_xjnskhk2gh"("qti"."__text_tn2inwix7f"), "qti"."__row_ek5jzsyr3n"("qti"."__text_tfkvgtjblt"), "qti"."__row_e62lbw2mpq"("qti"."__text_tfkvgtjblt"), "qti"."__row_nsihlhzcac"("qti"."__text_c6iptmtj2x"), "qti"."__row_wzgwunci5v"("qti"."node_kind", "qti"."__text_dtweupoh47", "qti"."attribute_name", "qti"."__text_c6iptmtj2x"), "qti"."__row_u4q6galdn4"("qti"."__attribute_slot_bits_112_aecznthxg5", "qti"."governor"), "qti"."__row_oi5loc5v4f"("qti"."node_kind", "qti"."node_kind", "qti"."position", "qti"."position"), "qti"."__row_qjfz5sto5w"("qti"."resource_type"), "qti"."__row_xtuinpowgy"("qti"."base_type", "qti"."__text_tfkvgtjblt"), "qti"."__row_p7ja3xelgj"("qti"."governor", "qti"."attribute_name", "qti"."__domain_gfw43vigph", "pg_catalog"."text", "qti"."__text_c6iptmtj2x", "qti"."__attribute_slot_bits_112_aecznthxg5"), "qti"."__row_gvj4sjfiv5"("qti"."__text_tfkvgtjblt"), "qti"."__row_irvtzupi4u"("qti"."governor", "qti"."__text_tfkvgtjblt"), "qti"."__row_dt2v4eplpv"("qti"."node_kind", "qti"."node_kind", boolean, boolean), "qti"."__row_4bpx7xcjar"("qti"."__text_r2monji6i2", "qti"."node_kind", "qti"."value_base", "qti"."value_cardinality", "qti"."reference_resolution"), "qti"."__row_jovam53rzt"("qti"."value_base"), "qti"."__row_x5xfev4ul5"("qti"."position", "qti"."node_kind"), "qti"."__row_i3ibdsoyj4"("qti"."governor", "qti"."attribute_name", "qti"."__attribute_slot_bits_112_aecznthxg5"), "qti"."__row_djwisegva5"("qti"."governor", "qti"."attribute_name"), "qti"."__row_i5mf4eas2d"("qti"."governor", "qti"."__text_xj3zno7u3h"), "qti"."__row_pqxt7rruix"("qti"."governor", "qti"."attribute_name", "qti"."__text_c6iptmtj2x"), "qti"."__row_cnipjrlkta"(boolean, "qti"."__text_tfkvgtjblt"), "qti"."__row_fqjmjbfjgp"("qti"."__text_r2monji6i2") TO :"qti_queries__author";

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
GRANT TEMPORARY ON DATABASE :"DBNAME" TO :"qti_queries__author";

GRANT EXECUTE ON FUNCTION "qti"."__stand_assembled_document_hwwdv6cnpm"(), "qti"."__stand_attribute_ibvutlmrai"(), "qti"."__stand_binding_name_ye63gc6vro"(), "qti"."__stand_bound_variable_7vtgjbh6hv"(), "qti"."__stand_candidate_path_qhg7xli4wt"(), "qti"."__stand_catalog_scope_vudqbkxslz"(), "qti"."__stand_cell_leaf_ptjwgogbl7"(), "qti"."__stand_choice_xzzdvjuvsd"(), "qti"."__stand_choice_interaction_c645kfugmv"(), "qti"."__stand_cn_attribute_63nfyqksr3"(), "qti"."__stand_cn_count_eejhcf4izw"(), "qti"."__stand_comment_3l7okcxyxf"(), "qti"."__stand_context_ref_ujo5dooa7f"(), "qti"."__stand_count_bound_2z6orlcix6"(), "qti"."__stand_data_ssml_k52kzmf2vn"(), "qti"."__stand_data_ssml_member_2xkysqbugo"(), "qti"."__stand_data_ssml_property_6yi5in6iis"(), "qti"."__stand_doctype_gj2wct2uyg"(), "qti"."__stand_document_pondgr3rqo"(), "qti"."__stand_document_id_633p5hpydz"(), "qti"."__stand_element_type_7tgopoucgl"(), "qti"."__stand_entry_pmmpk3imf3"(), "qti"."__stand_expression_u7lcjyvsn7"(), "qti"."__stand_feedback_ref_d7224uniti"(), "qti"."__stand_file_tcw2ukyhyi"(), "qti"."__stand_file_outside_lhyrdnu5ai"(), "qti"."__stand_file_path_7r6oexjmsr"(), "qti"."__stand_fragment_context_ref_h4natgpneo"(), "qti"."__stand_fragment_feedback_ref_gojudisgmf"(), "qti"."__stand_fragment_printed_ref_g5dbleutzc"(), "qti"."__stand_fragment_scope_2oggx422cm"(), "qti"."__stand_fragment_template_ref_mqrpgto2fj"(), "qti"."__stand_hottext_apulsizq3w"(), "qti"."__stand_identity_text_b52n3op6xe"(), "qti"."__stand_idref_aho5h2elqy"(), "qti"."__stand_idref_target_jjhutks3nm"(), "qti"."__stand_inclusion_km3rxqqunr"(), "qti"."__stand_instance_fxskpasuzx"(), "qti"."__stand_interaction_3potcpsocf"(), "qti"."__stand_interaction_attribute_wmzckdz5tm"(), "qti"."__stand_item_ref_document_i66s3vh6ga"(), "qti"."__stand_item_ref_href_jrjueitx27"(), "qti"."__stand_label_use_o4brmrb7aq"(), "qti"."__stand_least_count_ya6wrr6a3v"(), "qti"."__stand_link_reading_uenjcz5dvs"(), "qti"."__stand_literal_tiziliumbt"(), "qti"."__stand_literal_typed_2ilx4mlegz"(), "qti"."__stand_math_action_f5wwzdrvm5"(), "qti"."__stand_math_align_group_6xltg6lxo2"(), "qti"."__stand_math_align_scope_u2bech2ml5"(), "qti"."__stand_math_cell_7pwv53nkxm"(), "qti"."__stand_math_cn_d6ecu3zp5g"(), "qti"."__stand_math_rank_nqeqnb4u7t"(), "qti"."__stand_media_5bf42f2xah"(), "qti"."__stand_most_count_2kgjd3owwn"(), "qti"."__stand_named_rt75iqktd4"(), "qti"."__stand_node_ufvsoeyzmq"(), "qti"."__stand_numbered_reading_em4eroit7v"(), "qti"."__stand_open_attribute_kus4ehgwz4"(), "qti"."__stand_open_element_name_yc423a5h3x"(), "qti"."__stand_open_element_type_ntz3lqtaqc"(), "qti"."__stand_pci_module_form_yzlgznmelb"(), "qti"."__stand_pi_xg74jk6xwy"(), "qti"."__stand_placed_binding_rbegxbfbcg"(), "qti"."__stand_placed_choice_54ymy46b3e"(), "qti"."__stand_placed_expression_eajdtujnrh"(), "qti"."__stand_placed_hottext_donabbhxss"(), "qti"."__stand_placed_id_kbkipg3veh"(), "qti"."__stand_placed_idref_64inmhwtyc"(), "qti"."__stand_placed_math_rank_5572svkpcq"(), "qti"."__stand_placed_share_target_bt6g4coqwv"(), "qti"."__stand_placed_variable_ref_m4ro6tg5kc"(), "qti"."__stand_printed_variable_ref_e7jd2rdh3z"(), "qti"."__stand_processing_fc2mn4yln3"(), "qti"."__stand_reference_5zvivb5s2f"(), "qti"."__stand_reference_path_wo5g5edty7"(), "qti"."__stand_resource_document_j6gjtwm5zs"(), "qti"."__stand_resource_href_m3jxi2ub6r"(), "qti"."__stand_resource_href_outside_h5ayb4ywy5"(), "qti"."__stand_resource_href_path_cetda5wlcb"(), "qti"."__stand_rounding_c2ifmdme7j"(), "qti"."__stand_rounding_figures_lqklyjsczn"(), "qti"."__stand_rounding_mode_figures_xtki3xbmlh"(), "qti"."__stand_share_fragment_vlshgysorq"(), "qti"."__stand_share_target_uodbsrbtr7"(), "qti"."__stand_site_tjfl6cjoct"(), "qti"."__stand_site_path_5texh73t5e"(), "qti"."__stand_site_target_7dcfpspkwp"(), "qti"."__stand_srcset_rftu4ffapo"(), "qti"."__stand_srcset_candidate_rjuo7n5ahk"(), "qti"."__stand_ssml_scope_qlkcnlkody"(), "qti"."__stand_stimulus_ref_3r7jqd3al5"(), "qti"."__stand_template_ref_5rw7gnm6ga"(), "qti"."__stand_text_reference_xbgifadnt4"(), "qti"."__stand_text_reference_path_ijtliptx3w"(), "qti"."__stand_tolerance_j3naktmm3s"(), "qti"."__stand_usage_value_jbqmhc66yy"(), "qti"."__stand_usage_value_base_type_ss7bxv4pjb"(), "qti"."__stand_variable_ref_htgoqewgip"() TO :"qti_queries__author";

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

ALTER ROLE :"qti_queries__author_app" SET plan_cache_mode = 'force_generic_plan';

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
REVOKE ALL ON SCHEMA "qti", "qti_views", "qti_queries", "__qti_queries", "__qti", "__qti_views" FROM PUBLIC;

REVOKE ALL ON TABLE "qti"."assembled_document", "qti"."attribute", "qti"."attribute_entity", "qti"."binding_name", "qti"."bound_variable", "qti"."candidate_path", "qti"."catalog_scope", "qti"."cell_leaf", "qti"."choice", "qti"."choice_interaction", "qti"."cn_attribute", "qti"."cn_count", "qti"."cn_part_text", "qti"."cn_slot", "qti"."comment", "qti"."context_ref", "qti"."count_bound", "qti"."data_ssml", "qti"."data_ssml_member", "qti"."data_ssml_property", "qti"."doctype", "qti"."document", "qti"."document_id", "qti"."element_type", "qti"."encoding_decl", "qti"."entry", "qti"."expression", "qti"."feedback_ref", "qti"."file", "qti"."file_outside", "qti"."file_path", "qti"."fragment_context_name", "qti"."fragment_context_ref", "qti"."fragment_feedback_name", "qti"."fragment_feedback_ref", "qti"."fragment_printed_name", "qti"."fragment_printed_ref", "qti"."fragment_scope", "qti"."fragment_template_name", "qti"."fragment_template_ref", "qti"."hottext", "qti"."identity_text", "qti"."idref", "qti"."idref_target", "qti"."inclusion", "qti"."instance", "qti"."interaction", "qti"."interaction_attribute", "qti"."item_mode", "qti"."item_ref_document", "qti"."item_ref_href", "qti"."label_use", "qti"."least_count", "qti"."link_reading", "qti"."literal", "qti"."literal_typed", "qti"."math_action", "qti"."math_align_group", "qti"."math_align_scope", "qti"."math_cell", "qti"."math_cn", "qti"."math_rank", "qti"."media", "qti"."most_count", "qti"."named", "qti"."namespace", "qti"."node", "qti"."numbered_reading", "qti"."open_attribute", "qti"."open_attribute_entity", "qti"."open_element_name", "qti"."open_element_type", "qti"."package", "qti"."pci_module_form", "qti"."pi", "qti"."placed_binding", "qti"."placed_choice", "qti"."placed_expression", "qti"."placed_hottext", "qti"."placed_id", "qti"."placed_idref", "qti"."placed_math_rank", "qti"."placed_share_target", "qti"."placed_variable_ref", "qti"."printed_variable_ref", "qti"."processing", "qti"."reference", "qti"."reference_path", "qti"."referring_document", "qti"."resource_document", "qti"."resource_href", "qti"."resource_href_outside", "qti"."resource_href_path", "qti"."rounding", "qti"."rounding_figures", "qti"."rounding_mode_figures", "qti"."sd_decl", "qti"."share_fragment", "qti"."share_target", "qti"."site", "qti"."site_path", "qti"."site_target", "qti"."srcset", "qti"."srcset_candidate", "qti"."ssml_scope", "qti"."stimulus_ref", "qti"."template_ref", "qti"."text_idref", "qti"."text_reference", "qti"."text_reference_path", "qti"."tolerance", "qti"."tolerance_token", "qti"."usage_value", "qti"."usage_value_base_type", "qti"."variable_ref", "qti"."xml_decl", "__qti_queries"."assembled_catalog", "__qti"."assembled_document", "__qti"."attribute", "__qti"."attribute_entity", "__qti"."binding_name", "__qti"."bound_variable", "__qti"."candidate_path", "__qti_views"."catalog_id", "__qti"."catalog_scope", "__qti"."cell_leaf", "__qti_views"."cell_table", "__qti"."choice", "__qti"."choice_interaction", "__qti"."cn_attribute", "__qti"."cn_count", "__qti"."cn_part_text", "__qti"."cn_slot", "__qti"."comment", "__qti"."context_ref", "__qti"."count_bound", "__qti"."data_ssml", "__qti"."data_ssml_member", "__qti"."data_ssml_property", "__qti"."doctype", "__qti"."document", "__qti"."document_id", "__qti"."element_type", "__qti"."encoding_decl", "__qti"."entry", "__qti"."expression", "__qti"."feedback_ref", "__qti"."file", "__qti"."file_outside", "__qti"."file_path", "__qti"."fragment_context_name", "__qti"."fragment_context_ref", "__qti"."fragment_feedback_name", "__qti"."fragment_feedback_ref", "__qti"."fragment_printed_name", "__qti"."fragment_printed_ref", "__qti"."fragment_scope", "__qti"."fragment_template_name", "__qti"."fragment_template_ref", "__qti_views"."header_token", "__qti"."hottext", "__qti"."identity_text", "__qti"."idref", "__qti"."idref_target", "__qti"."inclusion", "__qti"."instance", "__qti"."interaction", "__qti"."interaction_attribute", "__qti"."item_mode", "__qti"."item_ref_document", "__qti"."item_ref_href", "__qti"."label_use", "__qti"."least_count", "__qti"."link_reading", "__qti"."literal", "__qti"."literal_typed", "__qti_views"."lookup_value", "__qti_views"."map_key", "__qti"."math_action", "__qti"."math_align_group", "__qti"."math_align_scope", "__qti"."math_cell", "__qti"."math_cn", "__qti"."math_rank", "__qti"."media", "__qti"."most_count", "__qti"."named", "__qti"."namespace", "__qti"."node", "__qti"."numbered_reading", "__qti"."open_attribute", "__qti"."open_attribute_entity", "__qti"."open_element_name", "__qti"."open_element_type", "__qti"."package", "__qti"."pci_module_form", "__qti"."pi", "__qti"."placed_binding", "__qti"."placed_choice", "__qti"."placed_expression", "__qti"."placed_hottext", "__qti"."placed_id", "__qti"."placed_idref", "__qti"."placed_math_rank", "__qti"."placed_share_target", "__qti"."placed_variable_ref", "__qti"."printed_variable_ref", "__qti"."processing", "__qti"."reference", "__qti"."reference_path", "__qti"."referring_document", "__qti"."resource_document", "__qti"."resource_href", "__qti"."resource_href_outside", "__qti"."resource_href_path", "__qti"."rounding", "__qti"."rounding_figures", "__qti"."rounding_mode_figures", "__qti"."sd_decl", "__qti"."share_fragment", "__qti"."share_target", "__qti"."site", "__qti"."site_path", "__qti"."site_target", "__qti"."srcset", "__qti"."srcset_candidate", "__qti"."ssml_scope", "__qti"."stimulus_ref", "__qti_queries"."table_header", "__qti"."template_ref", "__qti"."text_idref", "__qti"."text_reference", "__qti"."text_reference_path", "__qti"."tolerance", "__qti"."tolerance_token", "__qti"."usage_value", "__qti"."usage_value_base_type", "__qti"."variable_ref", "__qti"."xml_decl" FROM PUBLIC;

REVOKE ALL ON DOMAIN "qti"."__sha256", "qti"."admission_map", "qti"."align_direction", "qti"."align_state", "qti"."attribute_model", "qti"."attribute_name", "qti"."__attribute_name_bits_416_thr6i6sipt", "qti"."attribute_slot", "qti"."__attribute_slot_bits_112_aecznthxg5", "qti"."base_type", "qti"."bound_facet", "qti"."bound_zero", "qti"."built_in", "qti"."cardinality", "qti"."cn_base", "qti"."cn_part", "qti"."cn_part_form", "qti"."cn_type", "qti"."content_model", "qti"."declaration_kind", "qti"."document_type", "qti"."domain_primitive", "qti"."entry_kind", "qti"."flag", "qti"."__flag_bits_16_llpdtzgaon", "qti"."follow_set", "qti"."governor", "qti"."href_scope", "qti"."identity", "qti"."include_set", "qti"."language", "qti"."node_kind", "qti"."__node_kind_bits_648_lh43fw4nuo", "qti"."position", "qti"."__position_bits_312_cnr3fptmz4", "qti"."reference_form", "qti"."reference_resolution", "qti"."reference_spelling", "qti"."resource_type", "qti"."rounding_holds", "qti"."shared_model", "qti"."symbol_set", "qti"."type_name", "qti"."unplaced_cause", "qti"."use", "qti"."value_base", "qti"."__value_base_bits_16_7t6pwwxbsh", "qti"."value_cardinality", "qti"."__value_cardinality_bits_8_mma4mwhphy", "qti"."value_domain", "qti"."white_space", "qti"."xml_standalone", "qti"."__text_aqc6inemva", "qti"."__text_tn2inwix7f", "qti"."__text_c6iptmtj2x", "qti"."__text_phcitidkqs", "qti"."__text_xj3zno7u3h", "qti"."__text_r2monji6i2", "qti"."__text_tfkvgtjblt", "qti"."__text_7j6kgluyjp", "qti"."__text_l7nqeazg5h", "qti"."__text_xey6ryorh5", "qti"."__text_7dfilirtp3", "qti"."__text_sac6h6c6eh", "qti"."__text_nhrekaddjj", "qti"."__text_zij47sgley", "qti"."__text_gke7uypkov", "qti"."__text_gysgx5gkhi", "qti"."__text_dtweupoh47", "qti"."__text_lecej62lgl", "qti"."__text_iyotu5swho", "qti"."__text_kgtzfmq7x6", "qti"."__text_23rzixl3a2", "qti"."__text_3adwbksayk", "qti"."__text_k5kwygzatl", "qti"."__text_b6ykamoeho", "qti"."__text_4s4od7s5or", "qti"."__text_netnsfkgs7", "qti"."__text_3dlgl63rv6", "qti"."__text_aezrarw5qb", "qti"."__text_7nkeqry66t", "qti"."__text_iqz277k5xr", "qti"."__text_r2kdc4r77d", "qti"."__text_i4qty2ywff", "qti"."__domain_gfw43vigph", "qti"."__param_package_5kbmtohnug", "qti"."__param_path_bcrdrv5any" FROM PUBLIC;

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

COMMENT ON FUNCTION "qti"."__constant_ved73rklss"() IS 'closed constant 1496b5563ce33d2cf7e7ae02f157d7b99a8fce31d7383a6fa669b16a57170ce4';

COMMENT ON FUNCTION "qti"."__constant_o42tylpu3f"() IS 'closed constant 166b0f0140721b627390e22b04e27398ff9d6dd9fc327492fbadf80c0701bfe3';

COMMENT ON FUNCTION "qti"."__constant_34ylax76r2"() IS 'closed constant 17f6ea53fcbdf45a4ac7ff07b723b6d97819d393a313db247b4c0121ce7f34fa';

COMMENT ON FUNCTION "qti"."__constant_zivpez3hny"() IS 'closed constant 17fe166386301b54f354c514c5d91d207febece3dd51d5f51663fcd96f02844f';

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

COMMENT ON FUNCTION "qti"."__constant_llc3ctzcti"() IS 'closed constant 42793e020895155f8d91eb5498bc20b6ee01a819ad5e861c1228fd9c2b129cbe';

COMMENT ON FUNCTION "qti"."__constant_kwiyfmd5vb"() IS 'closed constant 43ce8a398d2536aa2bda523c85f237984f5823dffe285bbdd71a75523e90ac3d';

COMMENT ON FUNCTION "qti"."__constant_tfs6lrbcyd"() IS 'closed constant 445bd03f74e47ace97f56cde2865a735acc1e3844f6373beaa4a2d194aadcc45';

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

COMMENT ON FUNCTION "qti"."__constant_ehp27av5sv"() IS 'closed constant 5bd18359ffa58fbffee6bb343a9cfebb8ef4f44151a8ed4204b0e424ff101a0f';

COMMENT ON FUNCTION "qti"."__constant_sj4gtqwjvu"() IS 'closed constant 5cea40ce719a514d5c6634a87f9120b76a6a468ef5b09abbeb3914be23049abb';

COMMENT ON FUNCTION "qti"."__constant_inwmcukoes"() IS 'closed constant 5ec2aeb708816afe0dc8a8ad940667c33997453628ef1a3ebaa100f7929f5042';

COMMENT ON FUNCTION "qti"."__constant_mhzhm7i77c"() IS 'closed constant 62002f4ebe246cbb414bb6a88679e85bb8be2c2caf23a88f1de8fdf7a25eaaee';

COMMENT ON FUNCTION "qti"."__constant_omoipacrlm"() IS 'closed constant 684d06e5ddb3ca7c5245581fc543663e70bc3cd20f9faf22dfa3e75124eaea2c';

COMMENT ON FUNCTION "qti"."__constant_ypvumnh5zz"() IS 'closed constant 69c7794e09229b22878d2288074d862e9becb04f743a5598e827a2f077516729';

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

COMMENT ON FUNCTION "qti"."__constant_zm6rziqkms"() IS 'closed constant 8f73ceeff3662ce0cc63425a1856a0a7877b85de06577ee3c701b4946311aa4a';

COMMENT ON FUNCTION "qti"."__constant_rqidljwzm2"() IS 'closed constant 904fff862d67e7c3eb617491c6ab0650d543fe49dcfbe2a2a90a0138fcdda8a3';

COMMENT ON FUNCTION "qti"."__constant_5r3at22xvz"() IS 'closed constant 92e0213f62596d0230a7dcad13ad32d59fbcc187445f4c0a21d63b9fccc1e468';

COMMENT ON FUNCTION "qti"."__constant_ellk4zorxq"() IS 'closed constant 930966924fd0b3caaa5870b54f899b1d21856efd507ac2fe69f6759e3713038d';

COMMENT ON FUNCTION "qti"."__constant_aagz375mdd"() IS 'closed constant 940d9ef37d11edee8cf27d41fd542a315f72c6937d3a3dd830d35ed8a7a105e8';

COMMENT ON FUNCTION "qti"."__constant_aprps52eby"() IS 'closed constant 94aab456abe3a57e4aef1a732e5d5374f811688807ecacc259cf20d3453c85a7';

COMMENT ON FUNCTION "qti"."__constant_ahddjwrhv5"() IS 'closed constant 9512e3484e0766c142c6c91f57c0414ec8b3544dc62d0f209f214ef5bbcb331d';

COMMENT ON FUNCTION "qti"."__constant_ea7dd7ctff"() IS 'closed constant 95826c1cb7e72455eee758c49df8a6e3059486f81d3cdaaa7f7efd245cb36279';

COMMENT ON FUNCTION "qti"."__constant_k3fjlwxuwn"() IS 'closed constant 973a166723f127c43908bc19f4891679c706f16a5f3c0ffa4c7a3e20292cb4b5';

COMMENT ON FUNCTION "qti"."__constant_wxfnisv4kj"() IS 'closed constant 989b32decab7bf792ac5582ca47bafb5cdb36be02e5ee84014ddb7bd14ca3080';

COMMENT ON FUNCTION "qti"."__constant_zei655nkpr"() IS 'closed constant 99d8787a581edf46cb5e201d4ab7cb37d8389b7fc226abba4a9da0e750e862da';

COMMENT ON FUNCTION "qti"."__constant_fhvqv42slo"() IS 'closed constant 9bf432f042066bd6fd34aa085aea79567203c41ffb18fb615314eac315064028';

COMMENT ON FUNCTION "qti"."__constant_xvmgsamjvy"() IS 'closed constant a049cd42355a60d467686e3154f0e02a977cd2a25ffe478ba102b3a82a4c6ba1';

COMMENT ON FUNCTION "qti"."__constant_ugrf235wgp"() IS 'closed constant a0b4bbbd57e19dd2cc92a081d548a55c31e6d6dae5df3912d7469279d953eccd';

COMMENT ON FUNCTION "qti"."__constant_lliww2nzpo"() IS 'closed constant acc6d3b7284f2ecda21cfd95c3369643a10bef86c01c267407853a03138fd919';

COMMENT ON FUNCTION "qti"."__constant_avnlqmggvi"() IS 'closed constant ad4bffd9c8d1122a5252852689921e1d6eee940e688120dfa19dc2eff75e3550';

COMMENT ON FUNCTION "qti"."__constant_g3mzemfbr3"() IS 'closed constant ad76f88c97218913e02af4871043921bac1823d4531a88018308898b96ad2c2b';

COMMENT ON FUNCTION "qti"."__constant_qhszlaty7i"() IS 'closed constant ad82a386257d501033852c09bd44b11d8066e2ccf1dde0dfb1be852316805d12';

COMMENT ON FUNCTION "qti"."__constant_dqbnkda3gg"() IS 'closed constant b00aa773fb7f2fdee47bc523ec52d4ba2427091eb0f8028990dee66487717735';

COMMENT ON FUNCTION "qti"."__constant_gf6he576t3"() IS 'closed constant b20fa519f17c454f2168c0441930dcdb9c66623abde7ce9cf9221718cb1dc385';

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

COMMENT ON FUNCTION "qti"."__constant_fpzoryswx7"() IS 'closed constant c9fb1370118cd5b3e0d926b86606350e6d0139e2d9c091bbcf55c34c90177c64';

COMMENT ON FUNCTION "qti"."__constant_fccrluys3c"() IS 'closed constant cd26db6e7c2fc75da959692b5e4cb13fc3165c4c8c00a6dad92bee1c78e4a328';

COMMENT ON FUNCTION "qti"."__constant_7rkjmglcw6"() IS 'closed constant cdb6d59700e647f1e9d9eb54abadce6153092423965424146b21cfecbbd8f578';

COMMENT ON FUNCTION "qti"."__constant_j6uos7o7iw"() IS 'closed constant cf0154fad9c597440c2680e01337f5d5bfdf42c17e736ccb67f162ea9ce38773';

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

COMMENT ON FUNCTION "qti"."__constant_obvdrq3725"() IS 'closed constant ed42853178a4fd29dfe965e4b1d912f5d20de1e8d87015b0274c81b452b15c5b';

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

COMMENT ON FUNCTION "qti"."__is_xsd_pattern_p2kcfw56ul"("pg_catalog"."text") IS 'library function isXsdPattern (34bbcf9e69106cf9ca48eda27ec8f5aae0be5c64742dbd083e65d5d2a8db73a4)';

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

COMMENT ON FUNCTION "qti"."__reference_resolution_names_zfbhfhou4v"() IS 'names of roster ReferenceResolution (9b407eb7cd8883dc46e44c7fd0bc3cf93de68527bb8efaeda9dfbfe42839716a)';

COMMENT ON FUNCTION "qti"."__reference_spelling_names_gocqpuf7tl"() IS 'names of roster ReferenceSpelling (d17fe4490649b642da71426e1581a670779f42a7b20ee7c9ef28b6a9628aa0dd)';

COMMENT ON FUNCTION "qti"."__resource_type_names_2tbbvn3ion"() IS 'names of roster ResourceType (ced5fe1564e0a8e81e6ed722e012aba7f520e83798020b38dcb9f954ec7f0282)';

COMMENT ON FUNCTION "qti"."__rounding_holds_names_6j2zaayymp"() IS 'names of roster RoundingHolds (ff0bebd47f8d5bbbf8db83174e53cbb07cf295b99d674a77d80050bb48bb1b1c)';

COMMENT ON FUNCTION "qti"."__shared_model_names_5s5lwnfjh3"() IS 'names of roster SharedModel (2bb22812fae0ee7cd348c54155c525015f6d12afe5856c6b30af95ddd60f143e)';

COMMENT ON FUNCTION "qti"."__symbol_set_names_7wklvi4qhu"() IS 'names of roster SymbolSet (5f3c364538a7246c98ef8a549dd6452a21b767f5164eb24017b420a40ef01cee)';

COMMENT ON FUNCTION "qti"."__type_name_names_ksmacbo3df"() IS 'names of roster TypeName (86a2ec787f3d5c26228c9e866eccbc74af5c465863d21e3f2dd1d0149e191ab3)';

COMMENT ON FUNCTION "qti"."__unplaced_cause_names_p5tit5zgq3"() IS 'names of roster UnplacedCause (e3150d3ad4e7ad590b56215b77ab8cbb7766fc206ece30036f6c6b4ffb6674fc)';

COMMENT ON FUNCTION "qti"."__use_names_vmbq6fav2t"() IS 'names of roster Use (9a115d57aadecda9d7a7b7cc81df91be5fef70b5cafa5ec4401206fbed113e3b)';

COMMENT ON FUNCTION "qti"."__value_base_names_pjzlcpdwvv"() IS 'names of roster ValueBase (5d761cedc66f7cf75deb2567ff85de0930d527d600883d914f6486ab0734a395)';

COMMENT ON FUNCTION "qti"."__value_cardinality_names_wzwznoycgf"() IS 'names of roster ValueCardinality (ce98dc14ae9c0fe80302c657e1ae084670c344bef60bd8949b01932c73dfc180)';

COMMENT ON FUNCTION "qti"."__value_domain_names_myda2sxpvz"() IS 'names of roster ValueDomain (f193a3f8e50cb473bb721905900ab312d8544360ed383f3736279b731d50ad47)';

COMMENT ON FUNCTION "qti"."__white_space_names_i54twzbo55"() IS 'names of roster WhiteSpace (be4a5082396853ed0ad2a833bfe105ada3da43a52a2a2f804b2ee15f41fd6ae3)';

COMMENT ON FUNCTION "qti"."__xml_standalone_names_psf7bszcug"() IS 'names of roster XmlStandalone (b02a7669e6d8b37bbd7d50a593eeee33d1a7540248959baacd9c1c76e41c9bc4)';

COMMENT ON FUNCTION "qti"."__admission_map_live_xrc2h3fveq"() IS 'live codes of roster AdmissionMap (51d3b9acb054ee2ffa3016403e44e97aacc9b4502546fc98bc650e89ecfb4d6e)';

COMMENT ON FUNCTION "qti"."__align_direction_live_2lezvj35h2"() IS 'live codes of roster AlignDirection (f80b6953419f9aa8ea93323a6d5e3f06182c57018d537842383ceca681622491)';

COMMENT ON FUNCTION "qti"."__align_state_live_lhmmdyh7ap"() IS 'live codes of roster AlignState (172efd8b2eef24193d3dce248edca3d8416daad89c20bd6348c3a5d0e86d4d5b)';

COMMENT ON FUNCTION "qti"."__attribute_model_live_4rpyw2wqfh"() IS 'live codes of roster AttributeModel (5bf7f727b7062c420d41cacc6a79a2f98a2a011b3844355b87354f90102493d9)';

COMMENT ON FUNCTION "qti"."__attribute_name_live_mghzolknn3"() IS 'live codes of roster AttributeName (1044f5de2a11623b5840e0cf92d5285c564efc3c396fed17d86e32d6d6df9735)';

COMMENT ON FUNCTION "qti"."__attribute_slot_live_3plwjx3sjc"() IS 'live codes of roster AttributeSlot (8f55e9a1974d5a36b72e1f0fcf34f856040f884384126c3cf856c0cb28cb2352)';

COMMENT ON FUNCTION "qti"."__base_type_live_y3pmvhj7zb"() IS 'live codes of roster BaseType (617f7de81d947f0a4ce972c4fa31e07b38a66854077c4b89f41efde98eae2e66)';

COMMENT ON FUNCTION "qti"."__bound_facet_live_kux6fr53gv"() IS 'live codes of roster BoundFacet (f80b6953419f9aa8ea93323a6d5e3f06182c57018d537842383ceca681622491)';

COMMENT ON FUNCTION "qti"."__bound_zero_live_5rlfzns3wq"() IS 'live codes of roster BoundZero (f80b6953419f9aa8ea93323a6d5e3f06182c57018d537842383ceca681622491)';

COMMENT ON FUNCTION "qti"."__built_in_live_f6bja7a4kg"() IS 'live codes of roster BuiltIn (b74579d3b64ecff081cab2731adb2464f839e99b2eed45d65b3c1547c74f2de1)';

COMMENT ON FUNCTION "qti"."__cardinality_live_qwvqhyiu3t"() IS 'live codes of roster Cardinality (b74579d3b64ecff081cab2731adb2464f839e99b2eed45d65b3c1547c74f2de1)';

COMMENT ON FUNCTION "qti"."__cn_base_live_46ek53retw"() IS 'live codes of roster CnBase (7e07fa8069ae5232224a88ee24f9359afee78ff736da31bebd882b5681641e60)';

COMMENT ON FUNCTION "qti"."__cn_part_live_d7vk6cnszc"() IS 'live codes of roster CnPart (172efd8b2eef24193d3dce248edca3d8416daad89c20bd6348c3a5d0e86d4d5b)';

COMMENT ON FUNCTION "qti"."__cn_part_form_live_hivm5ovjjn"() IS 'live codes of roster CnPartForm (b74579d3b64ecff081cab2731adb2464f839e99b2eed45d65b3c1547c74f2de1)';

COMMENT ON FUNCTION "qti"."__cn_type_live_mftnyibli4"() IS 'live codes of roster CnType (7dd596b97005ae20bb8ec7fbea313a0bc4875fee3c75d7ebac992fdb4bbb43d4)';

COMMENT ON FUNCTION "qti"."__content_model_live_36z72epzkf"() IS 'live codes of roster ContentModel (b4e186978c43262ca7b5a6f7a83a092404e4fb31fe6a8b3fcf82405dc076f788)';

COMMENT ON FUNCTION "qti"."__declaration_kind_live_uyajfwbwph"() IS 'live codes of roster DeclarationKind (b74579d3b64ecff081cab2731adb2464f839e99b2eed45d65b3c1547c74f2de1)';

COMMENT ON FUNCTION "qti"."__document_type_live_5oxlw6me3c"() IS 'live codes of roster DocumentType (9063954a1e315578485e7198609f54ea19cfbef13ceada9459d749bde4d0edba)';

COMMENT ON FUNCTION "qti"."__domain_primitive_live_7z4e7dri7p"() IS 'live codes of roster DomainPrimitive (353c22dba0760a976c37482500f5a91050d05025dbb5573e519b977038984be1)';

COMMENT ON FUNCTION "qti"."__entry_kind_live_iwotf6s2yf"() IS 'live codes of roster EntryKind (f80b6953419f9aa8ea93323a6d5e3f06182c57018d537842383ceca681622491)';

COMMENT ON FUNCTION "qti"."__flag_live_skpa5hsl6r"() IS 'live codes of roster Flag (ac46a66f328c8da01df4ef6d55194be10d3194ef62b83a3e0a1d8680e49e1503)';

COMMENT ON FUNCTION "qti"."__follow_set_live_ym66qqil5n"() IS 'live codes of roster FollowSet (e5fe0070887364a5ba76e185d0092c70e95c98b23123e3ad1043e9d727a6c0fc)';

COMMENT ON FUNCTION "qti"."__governor_live_gktrkb66r6"() IS 'live codes of roster Governor (372668dbcee8e2fc5e9f403a0ba42ecefe021776649b1263a45fc5ae25493b38)';

COMMENT ON FUNCTION "qti"."__href_scope_live_zgj2x26s76"() IS 'live codes of roster HrefScope (b74579d3b64ecff081cab2731adb2464f839e99b2eed45d65b3c1547c74f2de1)';

COMMENT ON FUNCTION "qti"."__identity_live_z64zgxl2uo"() IS 'live codes of roster Identity (172efd8b2eef24193d3dce248edca3d8416daad89c20bd6348c3a5d0e86d4d5b)';

COMMENT ON FUNCTION "qti"."__include_set_live_mtgrllg3lw"() IS 'live codes of roster IncludeSet (9063954a1e315578485e7198609f54ea19cfbef13ceada9459d749bde4d0edba)';

COMMENT ON FUNCTION "qti"."__language_live_y2rauuuzos"() IS 'live codes of roster Language (b74579d3b64ecff081cab2731adb2464f839e99b2eed45d65b3c1547c74f2de1)';

COMMENT ON FUNCTION "qti"."__node_kind_live_b7rifmc6m4"() IS 'live codes of roster NodeKind (92ba7ed1baa5c9a5e3c0ea3e565d329aef095a286aea862ae450f27635ef2522)';

COMMENT ON FUNCTION "qti"."__position_live_pi53civw33"() IS 'live codes of roster Position (8c8eea92756004abcf3132e4af65300cd345d89f80253e7878a54114ab53ed5d)';

COMMENT ON FUNCTION "qti"."__reference_form_live_sckdmazr47"() IS 'live codes of roster ReferenceForm (b74579d3b64ecff081cab2731adb2464f839e99b2eed45d65b3c1547c74f2de1)';

COMMENT ON FUNCTION "qti"."__reference_resolution_live_6hzgo5pknw"() IS 'live codes of roster ReferenceResolution (b74579d3b64ecff081cab2731adb2464f839e99b2eed45d65b3c1547c74f2de1)';

COMMENT ON FUNCTION "qti"."__reference_spelling_live_ke2xl66eo4"() IS 'live codes of roster ReferenceSpelling (f80b6953419f9aa8ea93323a6d5e3f06182c57018d537842383ceca681622491)';

COMMENT ON FUNCTION "qti"."__resource_type_live_m5qnrkbzgq"() IS 'live codes of roster ResourceType (567d64af3e5bd0ad1534623c63ed4513027cb6c852ad3f72501186407adbd2d6)';

COMMENT ON FUNCTION "qti"."__rounding_holds_live_7xm6dvdabq"() IS 'live codes of roster RoundingHolds (b74579d3b64ecff081cab2731adb2464f839e99b2eed45d65b3c1547c74f2de1)';

COMMENT ON FUNCTION "qti"."__shared_model_live_37zbpyitfj"() IS 'live codes of roster SharedModel (47d64fec5c90141889bd1894c36b38a3a7d21e0cf05af630bec3a4665d8f6e48)';

COMMENT ON FUNCTION "qti"."__symbol_set_live_3wo3lzfzqb"() IS 'live codes of roster SymbolSet (cb19412c22874ab5b38ef81f7e57b02fd7f1cc0f424b0af30c98b4bba33fb971)';

COMMENT ON FUNCTION "qti"."__type_name_live_dizeay3gzc"() IS 'live codes of roster TypeName (d534270d3ab0314eabee0a2e69d975ad37c9880558d25e962e6d701385ad9b0d)';

COMMENT ON FUNCTION "qti"."__unplaced_cause_live_7eeinprrjn"() IS 'live codes of roster UnplacedCause (b74579d3b64ecff081cab2731adb2464f839e99b2eed45d65b3c1547c74f2de1)';

COMMENT ON FUNCTION "qti"."__use_live_qqc6fbn3jc"() IS 'live codes of roster Use (f80b6953419f9aa8ea93323a6d5e3f06182c57018d537842383ceca681622491)';

COMMENT ON FUNCTION "qti"."__value_base_live_pesuextzp2"() IS 'live codes of roster ValueBase (e79bfce2f47606d52f27e502d6c35b0c7b3674a75f45a4bd15d681032e76277f)';

COMMENT ON FUNCTION "qti"."__value_cardinality_live_img3c6yzn6"() IS 'live codes of roster ValueCardinality (591ae590686ec68aa03e699030fe62fdeae06b893d263428aab7d66397d0f1fe)';

COMMENT ON FUNCTION "qti"."__value_domain_live_fpcln73bij"() IS 'live codes of roster ValueDomain (0dbc329cc488045517aa2349ff3ad66f185360040cf747079aca739f61633651)';

COMMENT ON FUNCTION "qti"."__white_space_live_ywok3yue3q"() IS 'live codes of roster WhiteSpace (172efd8b2eef24193d3dce248edca3d8416daad89c20bd6348c3a5d0e86d4d5b)';

COMMENT ON FUNCTION "qti"."__xml_standalone_live_ql62ubmw6y"() IS 'live codes of roster XmlStandalone (f80b6953419f9aa8ea93323a6d5e3f06182c57018d537842383ceca681622491)';

COMMENT ON FUNCTION "qti"."__row_v4qtibeah3"("pg_catalog"."text", bigint) IS 'row function 7bf3f959d151720514fdef17815ea1780d4a5f3939621c54989e31f71612e6cc';

COMMENT ON FUNCTION "qti"."__row_dfvu25q4di"("pg_catalog"."text", "qti"."base_type") IS 'row function 963793b00421930fe783fcdf1739348518fed47c4682fe4cdbd97e7cb2ea10bd';

COMMENT ON FUNCTION "qti"."__row_avobhiw5hj"("pg_catalog"."text", "qti"."cn_part_form", "qti"."cn_base") IS 'row function 7e66bed7223dd4ef776fee58bc35c434ee7824a90e9826389c9c66a5fa6daf31';

COMMENT ON FUNCTION "qti"."__row_j5e7cdd5yv"("pg_catalog"."text", "qti"."cn_type") IS 'row function 087e08847d0a5282f4509ca2379fb07b821889fe0603e60fa840b7997a7a047b';

COMMENT ON FUNCTION "qti"."__row_uaeh72ufm7"("pg_catalog"."text", "qti"."cn_base", "pg_catalog"."text", "qti"."cn_type") IS 'row function 298c2ad27f4bf616a5e2df6d1b2dcbe2d979ea732325497087ddbdf6d0e1ac4e';

COMMENT ON FUNCTION "qti"."__row_mwacvs3yet"("qti"."cn_part", "qti"."cn_type", "qti"."cn_part_form") IS 'row function 6cd9d18075d8abc8fa02ff9825155637387e2bb4221be569e0bbfc1ac167f53c';

COMMENT ON FUNCTION "qti"."__row_76bhwjyl6b"("qti"."governor", "qti"."attribute_name") IS 'row function 45aba72e7d665d15f75a2ae40660acd9c9d092f1a782f56d3cd466d4c6fadedd';

COMMENT ON FUNCTION "qti"."__row_djwisegva5"("qti"."governor", "qti"."attribute_name") IS 'row function e3f93f79505b41b7b69b594a3f5bfe7229a67784d959d6e03353e7ab7c45de56';

COMMENT ON FUNCTION "qti"."__row_nvjvmcz2l5"("pg_catalog"."text", "qti"."href_scope") IS 'row function 1fa5aa06649faac2cd5fda972b1986aef3dca2dbfe8745f695f07a4752cec7e2';

COMMENT ON FUNCTION "qti"."__row_xzj6pczrns"("qti"."node_kind", "qti"."node_kind") IS 'row function 2de597e4f28783541041e3f9b7a0b89dd60992e0ada1699e561bc9223879f503';

COMMENT ON FUNCTION "qti"."__row_dt2v4eplpv"("qti"."node_kind", "qti"."node_kind", boolean, boolean) IS 'row function d96cf973b516c71fcaf55fef12faa18e2223a830ef79b3527670a0b01f348d1e';

COMMENT ON FUNCTION "qti"."__row_e5z245apmv"("qti"."node_kind", "qti"."position") IS 'row function 437e0fba4a76ea5b9a826e072c74eaf191a1f3823b10fca1a70db43cedfc00da';

COMMENT ON FUNCTION "qti"."__row_cxffogbiju"("qti"."node_kind", "qti"."node_kind", "qti"."position", "qti"."position") IS 'row function 84262a2cb674cf550d1597aad82f19e6c1fff024d00b8c5b49926a5d6f33b53e';

COMMENT ON FUNCTION "qti"."__row_oi5loc5v4f"("qti"."node_kind", "qti"."node_kind", "qti"."position", "qti"."position") IS 'row function b27a1735a54fb0a4a42b588de1484acb81d56a2e2728e1d2ddf969ba476c75ab';

COMMENT ON FUNCTION "qti"."__row_x5xfev4ul5"("qti"."position", "qti"."node_kind") IS 'row function e23e2c002e112b150d0c4588d2eb924b289912e967e49e1763f364bfdb88271e';

COMMENT ON FUNCTION "qti"."__row_tulgtjaryp"("qti"."resource_type", "qti"."node_kind") IS 'row function 8a97491ec832a5d09829d1bf4b147fbb93cf48ca7a140cae44387ad173751d68';

COMMENT ON FUNCTION "qti"."__row_qjfz5sto5w"("qti"."resource_type") IS 'row function b6a63b21c5cdb14635b4b6942412242da7c834729a02ff49938f78e9c9f21476';

COMMENT ON FUNCTION "qti"."__row_fzgnnk5id3"("qti"."node_kind", "qti"."type_name") IS 'row function 0c33e748ef6331a6c99da5bf6e6a04b70f10c948e3aef33be3966b99e0c1cf35';

COMMENT ON FUNCTION "qti"."__row_qyxmls2nib"("qti"."governor", "qti"."node_kind", "qti"."type_name") IS 'row function 523256481c0721bed828fde7abdab840d518a782a1649e3e1e0abcf418b9485d';

COMMENT ON FUNCTION "qti"."__row_cdxyb64h3n"("qti"."base_type") IS 'row function 515f3047640f41c4af752d799433eb949c9200a03654e13f2952cea160310a53';

COMMENT ON DOMAIN "qti"."__attribute_name_bits_416_thr6i6sipt" IS 'sets over roster AttributeName of 416 bits';

COMMENT ON DOMAIN "qti"."__attribute_slot_bits_112_aecznthxg5" IS 'sets over roster AttributeSlot of 112 bits';

COMMENT ON FUNCTION "qti"."__row_ifjiso3sae"("qti"."node_kind", "qti"."__attribute_slot_bits_112_aecznthxg5") IS 'row function 0a2dd68ef5af939b1f1462ab476f970d6c12e99a32070d33258f20b3913fc944';

COMMENT ON FUNCTION "qti"."__row_6f23azrfdw"("qti"."governor", "qti"."__attribute_slot_bits_112_aecznthxg5") IS 'row function 2b273c963e2a95953658d9937808f2de9f7b9a37d403b002f284c124fdc85286';

COMMENT ON FUNCTION "qti"."__row_3k3gj4kfgc"("qti"."__attribute_slot_bits_112_aecznthxg5", "qti"."governor") IS 'row function 462bcc300a552bed017ac41f54cca50352ff931ac60669431eed5ee4b9eb1a65';

COMMENT ON FUNCTION "qti"."__row_sk5tugqwcr"("qti"."__attribute_slot_bits_112_aecznthxg5", "qti"."governor") IS 'row function 54df82dc5f74fcd9ad86ab60898c89ec1a875a8eba5ef97343f9803fcbb8880b';

COMMENT ON FUNCTION "qti"."__row_f3arllrhkz"("qti"."governor", "qti"."__attribute_slot_bits_112_aecznthxg5") IS 'row function 5c301984fce4cc0f557482635641cb23bd3d7bcca3128f88ce51f59668b5a544';

COMMENT ON FUNCTION "qti"."__row_5g45nfefn7"("qti"."__attribute_slot_bits_112_aecznthxg5", "qti"."governor") IS 'row function 6b28c2b77d339466377ef77c30fb6f5fa1ca1f2649ea49b728f8434dcabd175b';

COMMENT ON FUNCTION "qti"."__row_u4q6galdn4"("qti"."__attribute_slot_bits_112_aecznthxg5", "qti"."governor") IS 'row function b09a1aac7e47aca64ba1b0d732b3e1ced02c8f6679d4f32cc5236f5643480c1b';

COMMENT ON FUNCTION "qti"."__row_i3ibdsoyj4"("qti"."governor", "qti"."attribute_name", "qti"."__attribute_slot_bits_112_aecznthxg5") IS 'row function e2b8b84846eaf869ad257adaab679904e15877c76854051eae535ef68f2e61d6';

COMMENT ON DOMAIN "qti"."__flag_bits_16_llpdtzgaon" IS 'sets over roster Flag of 16 bits';

COMMENT ON FUNCTION "qti"."__row_xemajpyaox"("qti"."node_kind", "qti"."__flag_bits_16_llpdtzgaon") IS 'row function 7e6848a551d53c9aa7c26503ae9f1a94aa4d76e03ef3a7d813be0a0577e6ddcf';

COMMENT ON DOMAIN "qti"."__node_kind_bits_648_lh43fw4nuo" IS 'sets over roster NodeKind of 648 bits';

COMMENT ON DOMAIN "qti"."__position_bits_312_cnr3fptmz4" IS 'sets over roster Position of 312 bits';

COMMENT ON DOMAIN "qti"."__value_base_bits_16_7t6pwwxbsh" IS 'sets over roster ValueBase of 16 bits';

COMMENT ON FUNCTION "qti"."__row_jovam53rzt"("qti"."value_base") IS 'row function e13d275cb722fa1fa07b9655f3eae609de819854cd20fcdb519507c43404a413';

COMMENT ON DOMAIN "qti"."__value_cardinality_bits_8_mma4mwhphy" IS 'sets over roster ValueCardinality of 8 bits';

COMMENT ON FUNCTION "qti"."__row_nqba7rulo6"("qti"."value_cardinality") IS 'row function 704c830b9c6ba9c91917b69a41edd5654ff41d4fe59902f3fa27b433cc3c8ee1';

COMMENT ON DOMAIN "qti"."__domain_gfw43vigph" IS 'domain of definition 39922592cedecf769d6df372d6df99e0b82206b0bf6dacd9722d0490f83cc782';

COMMENT ON FUNCTION "qti"."__row_zmo46cd6nh"("qti"."node_kind", "qti"."node_kind", "qti"."position", "qti"."__domain_gfw43vigph", bigint, bigint) IS 'row function 13f0294fccbc7a5885a5a569d1867645d5bfc6c604568e8960d27153752a9eb6';

COMMENT ON FUNCTION "qti"."__row_e6blhtroc2"("qti"."node_kind", "qti"."__domain_gfw43vigph") IS 'row function 2f906fa1b2e71530af85c1d53ba500ca7a5d43e8d02e2be9b25b0c7052be4f2c';

COMMENT ON FUNCTION "qti"."__row_6rfxzdle5g"("qti"."node_kind", "qti"."node_kind", "qti"."position", "qti"."__domain_gfw43vigph", bigint, bigint) IS 'row function 3558de7467da36a7aa2bee1d1f32c362705027bd44c27c27c09d20f3b7a85ebf';

COMMENT ON FUNCTION "qti"."__row_xynmxpup7x"("qti"."cn_type", "qti"."__domain_gfw43vigph") IS 'row function 847904ab17b301e5116fe896d56ecbcc31fa8613e06eab58c468ae2122361c43';

COMMENT ON DOMAIN "qti"."__text_xj3zno7u3h" IS 'text domain of definition 07d1b4656d57d0bc0562fcffad24ee1556a8abcce1c308fdbd7953cf9ff4063b';

COMMENT ON FUNCTION "qti"."__row_v5mox6r536"("qti"."node_kind", "qti"."__text_xj3zno7u3h", "qti"."attribute_name") IS 'row function 85f65197cc00e0113b4b9783e70af63df2200d6155c33fa28d0c34cc74179939';

COMMENT ON FUNCTION "qti"."__row_i5mf4eas2d"("qti"."governor", "qti"."__text_xj3zno7u3h") IS 'row function f6149ba2fdef4edfb9e15525b1c1ee356c7b3d14026d000bf4a4d4fe15756816';

COMMENT ON DOMAIN "qti"."__text_phcitidkqs" IS 'text domain of definition 09ffac9a9a1ca83dd6bd4c35d466e2a7121f867303a9e1b3c37d74f21aea2dbe';

COMMENT ON DOMAIN "qti"."__text_netnsfkgs7" IS 'text domain of definition 0aba2a82fe9fefde9a011f33fa307521ac470023393100289f8e2a1a6c7eef29';

COMMENT ON DOMAIN "qti"."__text_7nkeqry66t" IS 'text domain of definition 11e6a9745bcc70f9372e3f60f6170fac989cb51cb9a361ec7e535c1f0adf0c75';

COMMENT ON DOMAIN "qti"."__text_c6iptmtj2x" IS 'text domain of definition 1a67836d3b307da80f2e0d484100e3204d5ef072db811f6176933746e66c4089';

COMMENT ON FUNCTION "qti"."__row_mf5tbjlvzq"("qti"."__text_c6iptmtj2x") IS 'row function 14c312ba1433102fef9e00954da29db497b07d684b791bdf8b85caa0be4b474a';

COMMENT ON FUNCTION "qti"."__row_wpa4xaxg6g"("qti"."governor", "qti"."attribute_name", "qti"."__text_c6iptmtj2x") IS 'row function 17f8b7b1b9b9b5aa6830c136b7165d4df9005964a3b8a235f29ec0f7531cd7da';

COMMENT ON FUNCTION "qti"."__row_6re7khxabv"("pg_catalog"."text", "qti"."__text_c6iptmtj2x", "qti"."__text_c6iptmtj2x") IS 'row function 24c084c54dc45f27421b0ed51c6fd76accd30a6a1e090de22aad1dc4b25e4d99';

COMMENT ON FUNCTION "qti"."__row_rbnmyazhde"("qti"."__text_c6iptmtj2x") IS 'row function 275e55041d4b1d677d8703c48edd8ca8b94e02bc62d368aeb92627f1a84da799';

COMMENT ON FUNCTION "qti"."__row_ha47wb6n3x"("qti"."governor", "qti"."attribute_name", "qti"."__text_c6iptmtj2x") IS 'row function 4ec54ddee2c2f6ba42fba51bf5d47f9d3ba94f63ec2553958e5dd45c1d7d6d60';

COMMENT ON FUNCTION "qti"."__row_vsmud4oyxc"("qti"."__text_c6iptmtj2x") IS 'row function 684caec3eedfa9c17626886de18424967a45a4b5b5f2cc4ede739c10733d9ad9';

COMMENT ON FUNCTION "qti"."__row_l37o3qzyb2"("qti"."governor", "qti"."attribute_name", "qti"."__text_c6iptmtj2x") IS 'row function 8d5a437a07761ea9965ab48f48203d1839580787ce56429da36ce6155a48cdd2';

COMMENT ON FUNCTION "qti"."__row_dbnwees6vb"("qti"."governor", "qti"."attribute_name", "qti"."__text_c6iptmtj2x") IS 'row function 8e18a495175c0cff3a15fc883d69cdb4703826cccb8656286501728971791147';

COMMENT ON FUNCTION "qti"."__row_qx3rdjvde7"("qti"."__text_c6iptmtj2x", "qti"."node_kind", "qti"."attribute_name") IS 'row function a645ed25efbed5b5d762fa5c02f0f45d3988e6486ade7c6406a277c1e6839f14';

COMMENT ON FUNCTION "qti"."__row_nsihlhzcac"("qti"."__text_c6iptmtj2x") IS 'row function ac2d173b3b41edaed726bb1a370020da2ad393b90a55df8a2271d705b079bb8b';

COMMENT ON FUNCTION "qti"."__row_p7ja3xelgj"("qti"."governor", "qti"."attribute_name", "qti"."__domain_gfw43vigph", "pg_catalog"."text", "qti"."__text_c6iptmtj2x", "qti"."__attribute_slot_bits_112_aecznthxg5") IS 'row function ce1ddf7a01ff67bfdccde54a29aac5b4ba9d97dd2589d564fd6b1d3595096a73';

COMMENT ON FUNCTION "qti"."__row_pqxt7rruix"("qti"."governor", "qti"."attribute_name", "qti"."__text_c6iptmtj2x") IS 'row function f91ef14e76deeeeaa222d301253dc391756ee31d95c3d395e7754c7eaf449b29';

COMMENT ON DOMAIN "qti"."__text_4s4od7s5or" IS 'text domain of definition 25f993867c17f0de2b8d40bfc84d831eb31ae3f956a21b332d68c3cfea60ac42';

COMMENT ON DOMAIN "qti"."__text_iyotu5swho" IS 'text domain of definition 2635b0e5de7f34b015cf3665ec22fc8b656379442aa348f3a7f82f7640b00cd9';

COMMENT ON DOMAIN "qti"."__text_gke7uypkov" IS 'text domain of definition 35ca7214ecd6bc746f35ddfa585739f2eb3a3bc1cf0102776362d72f261b5d2c';

COMMENT ON FUNCTION "qti"."__row_sigxbapf7z"("qti"."node_kind", "qti"."governor", "qti"."__text_c6iptmtj2x", "qti"."__text_gke7uypkov", "qti"."__text_gke7uypkov", "qti"."__flag_bits_16_llpdtzgaon", "qti"."__flag_bits_16_llpdtzgaon", "qti"."__domain_gfw43vigph") IS 'row function 49aa2a00472ef8e7993dcf3b04427731e5e51e6414b34711ccf87f1cc461e8b8';

COMMENT ON DOMAIN "qti"."__text_i4qty2ywff" IS 'text domain of definition 3cd53cc0df2c42f1b44a53e1d672bc47fed1067e25cfaf7059cdd1021552f469';

COMMENT ON DOMAIN "qti"."__text_l7nqeazg5h" IS 'text domain of definition 3cdc918e94d35cb73d7847576b3f189044bdbbe2b32433d7e12c4aad29d1b20f';

COMMENT ON DOMAIN "qti"."__text_r2monji6i2" IS 'text domain of definition 3f76df607210d83cd70883edd48f3becbb7bea5d9472ce408573800be152a18b';

COMMENT ON FUNCTION "qti"."__row_atcormr3u4"("qti"."node_kind", "qti"."node_kind", "qti"."attribute_name", "qti"."__text_r2monji6i2") IS 'row function 42881d061bc0b849e341fde6f8c61fb24594b79ed6dad23b11949865e26bf26f';

COMMENT ON FUNCTION "qti"."__row_4bpx7xcjar"("qti"."__text_r2monji6i2", "qti"."node_kind", "qti"."value_base", "qti"."value_cardinality", "qti"."reference_resolution") IS 'row function df74c476a2f54b02216237b2e22aef0fc0278a20d80a448837be25963b44899b';

COMMENT ON FUNCTION "qti"."__row_fqjmjbfjgp"("qti"."__text_r2monji6i2") IS 'row function fe5a55d8c98fde1d72debb1eccc852579e6eb184de9f7f8b4fb088be28141def';

COMMENT ON DOMAIN "qti"."__text_k5kwygzatl" IS 'text domain of definition 40d6364b587949b03c7cf6d4a4fa90f6a7824a5e81ea482245b5165ecf1a386b';

COMMENT ON FUNCTION "qti"."__row_bzjfc2f4h5"("qti"."__text_k5kwygzatl") IS 'row function 351aaa147732a7ed2f3c89c27430d4e1b23922cbae15cdf6866cb6b6150cd59b';

COMMENT ON DOMAIN "qti"."__text_7dfilirtp3" IS 'text domain of definition 429c2bb9ddd9c3b22c5a08acc42b1af5e4d920542a5f749183412995aecbc995';

COMMENT ON DOMAIN "qti"."__text_7j6kgluyjp" IS 'text domain of definition 44e887568cc7f9e998199d3ead04a4a7e9dc01d1b379c2777ba394ad881c4d33';

COMMENT ON DOMAIN "qti"."__text_xey6ryorh5" IS 'text domain of definition 470402304d5a2e6d5b1be3a2daeaac2900ee7e45e1edf9e56c42abea179471ed';

COMMENT ON DOMAIN "qti"."__text_lecej62lgl" IS 'text domain of definition 5c14dfcbf02e85cd9c3e4607e5f8aac88e4c4aae96d4daa62cc514568c88c768';

COMMENT ON DOMAIN "qti"."__text_iqz277k5xr" IS 'text domain of definition 7804e28edb82486535d23dc2b795ac4d2ea5f5f293d39c5d6993596c384f570a';

COMMENT ON DOMAIN "qti"."__text_tn2inwix7f" IS 'text domain of definition 9589922d993d2438cfa83e25407980d911f652efbb0f65aea8fe21c49cf0033e';

COMMENT ON FUNCTION "qti"."__row_wczkl5jgfh"("qti"."document_type", "qti"."__text_tn2inwix7f") IS 'row function 3cc4a82e139c999ae66c7429c7103cf22bc896f468067e681a46f3987314dfa5';

COMMENT ON FUNCTION "qti"."__row_xjnskhk2gh"("qti"."__text_tn2inwix7f") IS 'row function a6c2b646c0f57e7568b2c238c4954eae496832039c2ecd1cd7725b8734445d32';

COMMENT ON DOMAIN "qti"."__param_path_bcrdrv5any" IS 'pattern domain of parameter path of definition eb69b666185020e0715f913aa0abaca0a41e5932703c38d9be01a51e5ca11635';

COMMENT ON DOMAIN "qti"."__text_23rzixl3a2" IS 'text domain of definition 95eb6c1246a45f38747eda0606a0a691162091d31ec690fa874e11c549549bf6';

COMMENT ON DOMAIN "qti"."__text_aqc6inemva" IS 'text domain of definition 9728da00b6bfe42b1889214d47c25a591495821a78feafc851ec65d6f721baf9';

COMMENT ON DOMAIN "qti"."__param_package_5kbmtohnug" IS 'pattern domain of parameter package of definition 460405267d99076ae2922762a38a5828fccf2572576b3755591089ddc59fee71';

COMMENT ON DOMAIN "qti"."__text_dtweupoh47" IS 'text domain of definition a991d8b6f2f1ea31587a9ec59860d224194b1cb848eb9090a2a8ce477caa7fb8';

COMMENT ON FUNCTION "qti"."__row_wzgwunci5v"("qti"."node_kind", "qti"."__text_dtweupoh47", "qti"."attribute_name", "qti"."__text_c6iptmtj2x") IS 'row function ace729d5454d17de93a52bfd5a90fc34a03b275eaba0244fc2db76593aa95cfc';

COMMENT ON DOMAIN "qti"."__text_nhrekaddjj" IS 'text domain of definition bd0ef5fae91ae1e3759436621ca78cdc662aa71cda3d91e37abc2aabdf9b1329';

COMMENT ON FUNCTION "qti"."__row_xkataczrlc"("qti"."__text_nhrekaddjj", "qti"."base_type") IS 'row function 5089306da1aa8eb9e43f673e8efa62c740e3f2d52920a24e2d010467588b25a2';

COMMENT ON DOMAIN "qti"."__text_kgtzfmq7x6" IS 'text domain of definition bdb146b36f88067e4043d730ba593e02db53c73bdac540390b2ebb7e67476fda';

COMMENT ON FUNCTION "qti"."__row_h6vjucvz3t"("qti"."__text_kgtzfmq7x6") IS 'row function 4cf34540bffa699850ffc89ac4f8132c4ae8dc800e264278f6016fc1aaf1e070';

COMMENT ON DOMAIN "qti"."__text_zij47sgley" IS 'text domain of definition be762dbadbcbdadb1b1e213742dad3ff6da1f56202cbfb8c219acc59e34371bd';

COMMENT ON DOMAIN "qti"."__text_gysgx5gkhi" IS 'text domain of definition c7e7a2638ef511b9e40659038ea502578725e45e7cfe8c8a495c60ace2c3085a';

COMMENT ON DOMAIN "qti"."__text_tfkvgtjblt" IS 'text domain of definition d2ecf22f0a0241e29c41342e6e35593308d53ba1698ca8807afbd811407ad122';

COMMENT ON FUNCTION "qti"."__row_ha5uesvxf5"("qti"."governor", "qti"."__text_tfkvgtjblt") IS 'row function 0497016ef7907e4c393fc37b0ac984b1c631a4f0b473af0061946bf6bdf6fdf8';

COMMENT ON FUNCTION "qti"."__row_tpgnuuvn6t"("qti"."__text_tfkvgtjblt", "pg_catalog"."text") IS 'row function 1dd71c3ce7edddd4b32dd5fd09111a714d77e919993ecce1b7b106f7bc7c7009';

COMMENT ON FUNCTION "qti"."__row_y3yv7uwbvr"("qti"."__text_tfkvgtjblt") IS 'row function 2b7044f87c0cde7ad60b24741b95a338cedc350fef81c198c26576bfee97f2d3';

COMMENT ON FUNCTION "qti"."__row_ll5avkvuxu"("qti"."node_kind", "qti"."node_kind", "qti"."governor", "qti"."__domain_gfw43vigph", "qti"."__text_tfkvgtjblt", "qti"."__text_tfkvgtjblt", "qti"."__text_c6iptmtj2x") IS 'row function 65138844c0ec7163abc6ab73f9a119a2d4097b468cee240940fd57fbf973bb48';

COMMENT ON FUNCTION "qti"."__row_ek5jzsyr3n"("qti"."__text_tfkvgtjblt") IS 'row function a85c65d25f607b2155c092fdf3234a40ed219f4593cfbc93dff7c5e0bbc6c27c';

COMMENT ON FUNCTION "qti"."__row_e62lbw2mpq"("qti"."__text_tfkvgtjblt") IS 'row function a92f12fc9005b5b0b156b812b65a044be7348d7adef56d4703098d94dc4d7168';

COMMENT ON FUNCTION "qti"."__row_xtuinpowgy"("qti"."base_type", "qti"."__text_tfkvgtjblt") IS 'row function ca5d38b4e082c720282de72ead472cdc8d80e4885b9e5ca7e3497372851a1161';

COMMENT ON FUNCTION "qti"."__row_gvj4sjfiv5"("qti"."__text_tfkvgtjblt") IS 'row function d158c3f1e1b1f2dc8728ab09b1d5a28572f8f16eb09915ec72d8caf58cd97328';

COMMENT ON FUNCTION "qti"."__row_irvtzupi4u"("qti"."governor", "qti"."__text_tfkvgtjblt") IS 'row function d5c5acd6afba0a7aab297caa1b5dfbcfe51748344040403d477fbf1edfec88ef';

COMMENT ON FUNCTION "qti"."__row_cnipjrlkta"(boolean, "qti"."__text_tfkvgtjblt") IS 'row function fd1db6287396a45366fb6d1e9ba50028f0741fe696ed0c3db95d4a43b5da40a1';

COMMENT ON DOMAIN "qti"."__text_b6ykamoeho" IS 'text domain of definition d625befb178ad492b0db0947dca6e2a06fe9265b86c9d308ff18efbca3340ffb';

COMMENT ON FUNCTION "qti"."__row_agackuopn5"("qti"."__text_netnsfkgs7", "qti"."href_scope", "qti"."__text_b6ykamoeho", "qti"."__domain_gfw43vigph") IS 'row function 790690cb1de32fc201fe180777c4db72aa381fddea69d064c08dfbc1d0e462f0';

COMMENT ON DOMAIN "qti"."__text_r2kdc4r77d" IS 'text domain of definition dad6bc67f0b98b4fc3426dcb5892de0cb0e1ec07963abfa1ba18635cef348fef';

COMMENT ON DOMAIN "qti"."__text_sac6h6c6eh" IS 'text domain of definition e0ec65e8be57c642de548bd5d2a176e56bda67cb965b0b4efc5389004d491694';

COMMENT ON DOMAIN "qti"."__text_3dlgl63rv6" IS 'text domain of definition e39caf120392f42815c264add6a09c2febb10de3ccbae4e068ac6f976267d42b';

COMMENT ON FUNCTION "qti"."__row_7xtkdeeinf"("qti"."__text_3dlgl63rv6", "qti"."__text_3dlgl63rv6", "qti"."__text_r2monji6i2") IS 'row function 1b753083d2bfd3d02f7aa6ff3b2bcf038a751de1bcfecf19731de35272f8dbc8';

COMMENT ON DOMAIN "qti"."__text_aezrarw5qb" IS 'text domain of definition e6e26ba2b395bc4c79a8579a6b3e3ea5894458b6f52c8210d87a3420dba2869a';

COMMENT ON DOMAIN "qti"."__text_3adwbksayk" IS 'text domain of definition fd4eadc7a8b98d8a19239d9f45b29021bcf2ec27ca3a1836b4dd45ffbad1f4d6';

COMMENT ON TYPE "qti"."__row_olds_assembled_catalog_ssgtwjezlz" IS 'the row type of the delta of olds of AssembledCatalog';

COMMENT ON TYPE "qti"."__row_news_assembled_document_4waj2i2okj" IS 'the row type of the delta of news of AssembledDocument';

COMMENT ON TYPE "qti"."__row_olds_assembled_document_qwbvnwhx3x" IS 'the row type of the delta of olds of AssembledDocument';

COMMENT ON TYPE "qti"."__row_news_attribute_r7tty75nde" IS 'the row type of the delta of news of Attribute';

COMMENT ON TYPE "qti"."__row_olds_attribute_qvwoava6zu" IS 'the row type of the delta of olds of Attribute';

COMMENT ON TYPE "qti"."__row_news_binding_name_uoz3c2uauk" IS 'the row type of the delta of news of BindingName';

COMMENT ON TYPE "qti"."__row_news_bound_variable_obmvuk5yhb" IS 'the row type of the delta of news of BoundVariable';

COMMENT ON TYPE "qti"."__row_olds_bound_variable_w3aqdwrmu6" IS 'the row type of the delta of olds of BoundVariable';

COMMENT ON TYPE "qti"."__row_news_candidate_path_i2oiddvfr2" IS 'the row type of the delta of news of CandidatePath';

COMMENT ON TYPE "qti"."__row_olds_candidate_path_lckjc3gnmm" IS 'the row type of the delta of olds of CandidatePath';

COMMENT ON TYPE "qti"."__row_news_catalog_id_w4vbcph7fc" IS 'the row type of the delta of news of CatalogId';

COMMENT ON TYPE "qti"."__row_olds_catalog_id_5yh226wx5a" IS 'the row type of the delta of olds of CatalogId';

COMMENT ON TYPE "qti"."__row_news_catalog_scope_pjojxeyx34" IS 'the row type of the delta of news of CatalogScope';

COMMENT ON TYPE "qti"."__row_olds_catalog_scope_o3hp2dmfkf" IS 'the row type of the delta of olds of CatalogScope';

COMMENT ON TYPE "qti"."__row_news_cell_leaf_c7nhnilth7" IS 'the row type of the delta of news of CellLeaf';

COMMENT ON TYPE "qti"."__row_olds_cell_leaf_lij62iyost" IS 'the row type of the delta of olds of CellLeaf';

COMMENT ON TYPE "qti"."__row_news_cell_table_l2zbat5wzr" IS 'the row type of the delta of news of CellTable';

COMMENT ON TYPE "qti"."__row_olds_cell_table_xbt4zmvqmu" IS 'the row type of the delta of olds of CellTable';

COMMENT ON TYPE "qti"."__row_news_choice_kqwz52ilaz" IS 'the row type of the delta of news of Choice';

COMMENT ON TYPE "qti"."__row_olds_choice_mae4wmbx54" IS 'the row type of the delta of olds of Choice';

COMMENT ON TYPE "qti"."__row_news_choice_interaction_v3arxpxhuk" IS 'the row type of the delta of news of ChoiceInteraction';

COMMENT ON TYPE "qti"."__row_olds_choice_interaction_dipn2pvbs2" IS 'the row type of the delta of olds of ChoiceInteraction';

COMMENT ON TYPE "qti"."__row_news_cn_attribute_7hcrpulwo6" IS 'the row type of the delta of news of CnAttribute';

COMMENT ON TYPE "qti"."__row_olds_cn_attribute_mudyxonht6" IS 'the row type of the delta of olds of CnAttribute';

COMMENT ON TYPE "qti"."__row_news_cn_count_fplfgjvjpc" IS 'the row type of the delta of news of CnCount';

COMMENT ON TYPE "qti"."__row_news_comment_s4fb46uoan" IS 'the row type of the delta of news of Comment';

COMMENT ON TYPE "qti"."__row_olds_comment_u34bq3kx7b" IS 'the row type of the delta of olds of Comment';

COMMENT ON TYPE "qti"."__row_news_context_ref_4m7r6micjy" IS 'the row type of the delta of news of ContextRef';

COMMENT ON TYPE "qti"."__row_news_count_bound_qun6ngsybd" IS 'the row type of the delta of news of CountBound';

COMMENT ON TYPE "qti"."__row_olds_count_bound_67eknpuc6a" IS 'the row type of the delta of olds of CountBound';

COMMENT ON TYPE "qti"."__row_news_data_ssml_hrnob2svky" IS 'the row type of the delta of news of DataSsml';

COMMENT ON TYPE "qti"."__row_olds_data_ssml_5jfijdmawe" IS 'the row type of the delta of olds of DataSsml';

COMMENT ON TYPE "qti"."__row_news_data_ssml_member_fywlo7yitu" IS 'the row type of the delta of news of DataSsmlMember';

COMMENT ON TYPE "qti"."__row_olds_data_ssml_property_lnuserws3p" IS 'the row type of the delta of olds of DataSsmlProperty';

COMMENT ON TYPE "qti"."__row_news_doctype_4jkrj63b7g" IS 'the row type of the delta of news of Doctype';

COMMENT ON TYPE "qti"."__row_olds_doctype_wuvzyqbcje" IS 'the row type of the delta of olds of Doctype';

COMMENT ON TYPE "qti"."__row_news_document_xxbe6bp5cf" IS 'the row type of the delta of news of Document';

COMMENT ON TYPE "qti"."__row_olds_document_s57nhjv2nt" IS 'the row type of the delta of olds of Document';

COMMENT ON TYPE "qti"."__row_news_document_id_b5gnhjoaes" IS 'the row type of the delta of news of DocumentId';

COMMENT ON TYPE "qti"."__row_olds_document_id_amx4sb2ytf" IS 'the row type of the delta of olds of DocumentId';

COMMENT ON TYPE "qti"."__row_olds_element_type_o3uct7j3jo" IS 'the row type of the delta of olds of ElementType';

COMMENT ON TYPE "qti"."__row_news_entry_fx276tde2k" IS 'the row type of the delta of news of Entry';

COMMENT ON TYPE "qti"."__row_olds_entry_anpz5aegfu" IS 'the row type of the delta of olds of Entry';

COMMENT ON TYPE "qti"."__row_news_expression_d347p422z2" IS 'the row type of the delta of news of Expression';

COMMENT ON TYPE "qti"."__row_olds_expression_txguzdqbzl" IS 'the row type of the delta of olds of Expression';

COMMENT ON TYPE "qti"."__row_news_feedback_ref_nssta2nbj2" IS 'the row type of the delta of news of FeedbackRef';

COMMENT ON TYPE "qti"."__row_news_file_bnbkvths4l" IS 'the row type of the delta of news of File';

COMMENT ON TYPE "qti"."__row_olds_file_clfdzguhfd" IS 'the row type of the delta of olds of File';

COMMENT ON TYPE "qti"."__row_news_file_outside_xtwk3hndzj" IS 'the row type of the delta of news of FileOutside';

COMMENT ON TYPE "qti"."__row_olds_file_outside_2j22fd2bam" IS 'the row type of the delta of olds of FileOutside';

COMMENT ON TYPE "qti"."__row_news_file_path_adjj6l7rju" IS 'the row type of the delta of news of FilePath';

COMMENT ON TYPE "qti"."__row_olds_file_path_ts4g6iebmk" IS 'the row type of the delta of olds of FilePath';

COMMENT ON TYPE "qti"."__row_news_fragment_context_ref_haxkiqorxy" IS 'the row type of the delta of news of FragmentContextRef';

COMMENT ON TYPE "qti"."__row_news_fragment_feedback_ref_uveoopp6ef" IS 'the row type of the delta of news of FragmentFeedbackRef';

COMMENT ON TYPE "qti"."__row_news_fragment_printed_ref_dkiqisw2ny" IS 'the row type of the delta of news of FragmentPrintedRef';

COMMENT ON TYPE "qti"."__row_olds_fragment_scope_pbfi2pii7b" IS 'the row type of the delta of olds of FragmentScope';

COMMENT ON TYPE "qti"."__row_news_fragment_template_ref_76js52a724" IS 'the row type of the delta of news of FragmentTemplateRef';

COMMENT ON TYPE "qti"."__row_news_hottext_saxfk42pjz" IS 'the row type of the delta of news of Hottext';

COMMENT ON TYPE "qti"."__row_olds_hottext_vzyluiur34" IS 'the row type of the delta of olds of Hottext';

COMMENT ON TYPE "qti"."__row_news_identity_text_ib2i5cfhlw" IS 'the row type of the delta of news of IdentityText';

COMMENT ON TYPE "qti"."__row_olds_identity_text_dlwaj4ut77" IS 'the row type of the delta of olds of IdentityText';

COMMENT ON TYPE "qti"."__row_news_idref_myrrwwcyd3" IS 'the row type of the delta of news of Idref';

COMMENT ON TYPE "qti"."__row_news_idref_target_imgfrhhcmc" IS 'the row type of the delta of news of IdrefTarget';

COMMENT ON TYPE "qti"."__row_olds_inclusion_jstkhiwukm" IS 'the row type of the delta of olds of Inclusion';

COMMENT ON TYPE "qti"."__row_news_instance_znog2v4oeg" IS 'the row type of the delta of news of Instance';

COMMENT ON TYPE "qti"."__row_olds_instance_loddkqg633" IS 'the row type of the delta of olds of Instance';

COMMENT ON TYPE "qti"."__row_news_interaction_v35vuk6asj" IS 'the row type of the delta of news of Interaction';

COMMENT ON TYPE "qti"."__row_olds_interaction_vwd6cvclpq" IS 'the row type of the delta of olds of Interaction';

COMMENT ON TYPE "qti"."__row_news_interaction_attribute_vuysneq7th" IS 'the row type of the delta of news of InteractionAttribute';

COMMENT ON TYPE "qti"."__row_olds_interaction_attribute_ib7buqc6lu" IS 'the row type of the delta of olds of InteractionAttribute';

COMMENT ON TYPE "qti"."__row_news_item_ref_document_knfrfdeqmn" IS 'the row type of the delta of news of ItemRefDocument';

COMMENT ON TYPE "qti"."__row_olds_item_ref_document_vjfyfobuiy" IS 'the row type of the delta of olds of ItemRefDocument';

COMMENT ON TYPE "qti"."__row_news_item_ref_href_5r3hx5ma7x" IS 'the row type of the delta of news of ItemRefHref';

COMMENT ON TYPE "qti"."__row_olds_item_ref_href_lzuvjkzmuh" IS 'the row type of the delta of olds of ItemRefHref';

COMMENT ON TYPE "qti"."__row_news_label_use_tgilfo2od6" IS 'the row type of the delta of news of LabelUse';

COMMENT ON TYPE "qti"."__row_olds_label_use_euin3g4aod" IS 'the row type of the delta of olds of LabelUse';

COMMENT ON TYPE "qti"."__row_news_least_count_rtlpjdphuy" IS 'the row type of the delta of news of LeastCount';

COMMENT ON TYPE "qti"."__row_olds_least_count_jsg552ifbv" IS 'the row type of the delta of olds of LeastCount';

COMMENT ON TYPE "qti"."__row_news_link_reading_ighwm3pc3b" IS 'the row type of the delta of news of LinkReading';

COMMENT ON TYPE "qti"."__row_olds_link_reading_t7ofa2ihf4" IS 'the row type of the delta of olds of LinkReading';

COMMENT ON TYPE "qti"."__row_olds_literal_bktwnqk4m2" IS 'the row type of the delta of olds of Literal';

COMMENT ON TYPE "qti"."__row_olds_literal_typed_kgpvrii4gs" IS 'the row type of the delta of olds of LiteralTyped';

COMMENT ON TYPE "qti"."__row_news_lookup_value_xufg7clhy2" IS 'the row type of the delta of news of LookupValue';

COMMENT ON TYPE "qti"."__row_news_map_key_cr65pyynnv" IS 'the row type of the delta of news of MapKey';

COMMENT ON TYPE "qti"."__row_news_math_action_44a25dssuk" IS 'the row type of the delta of news of MathAction';

COMMENT ON TYPE "qti"."__row_olds_math_action_w6lu7ctly7" IS 'the row type of the delta of olds of MathAction';

COMMENT ON TYPE "qti"."__row_olds_math_align_group_zy7erdusqd" IS 'the row type of the delta of olds of MathAlignGroup';

COMMENT ON TYPE "qti"."__row_news_math_align_scope_wgdquuinmm" IS 'the row type of the delta of news of MathAlignScope';

COMMENT ON TYPE "qti"."__row_olds_math_align_scope_aoz3ayj2cl" IS 'the row type of the delta of olds of MathAlignScope';

COMMENT ON TYPE "qti"."__row_news_math_cell_4fayxoc6kz" IS 'the row type of the delta of news of MathCell';

COMMENT ON TYPE "qti"."__row_olds_math_cell_7wmhkjtenf" IS 'the row type of the delta of olds of MathCell';

COMMENT ON TYPE "qti"."__row_news_math_cn_6ehjnnsl66" IS 'the row type of the delta of news of MathCn';

COMMENT ON TYPE "qti"."__row_news_math_rank_7gj2sd762g" IS 'the row type of the delta of news of MathRank';

COMMENT ON TYPE "qti"."__row_olds_math_rank_t4yzhaoiuz" IS 'the row type of the delta of olds of MathRank';

COMMENT ON TYPE "qti"."__row_news_media_rrwhkhgzmg" IS 'the row type of the delta of news of Media';

COMMENT ON TYPE "qti"."__row_olds_media_air5eb6xyz" IS 'the row type of the delta of olds of Media';

COMMENT ON TYPE "qti"."__row_news_most_count_bbopetdw6h" IS 'the row type of the delta of news of MostCount';

COMMENT ON TYPE "qti"."__row_olds_most_count_mtilvdsmxi" IS 'the row type of the delta of olds of MostCount';

COMMENT ON TYPE "qti"."__row_news_named_4bzny7q5zb" IS 'the row type of the delta of news of Named';

COMMENT ON TYPE "qti"."__row_olds_named_io53u6lyoj" IS 'the row type of the delta of olds of Named';

COMMENT ON TYPE "qti"."__row_news_node_sq5ktt54ec" IS 'the row type of the delta of news of Node';

COMMENT ON TYPE "qti"."__row_olds_node_w4luks6idx" IS 'the row type of the delta of olds of Node';

COMMENT ON TYPE "qti"."__row_news_numbered_reading_o24ojffayb" IS 'the row type of the delta of news of NumberedReading';

COMMENT ON TYPE "qti"."__row_olds_numbered_reading_fhapu4fwfl" IS 'the row type of the delta of olds of NumberedReading';

COMMENT ON TYPE "qti"."__row_news_open_attribute_g2624hmizp" IS 'the row type of the delta of news of OpenAttribute';

COMMENT ON TYPE "qti"."__row_news_open_element_name_xbfltrgqxf" IS 'the row type of the delta of news of OpenElementName';

COMMENT ON TYPE "qti"."__row_olds_open_element_name_6u27pb5shl" IS 'the row type of the delta of olds of OpenElementName';

COMMENT ON TYPE "qti"."__row_news_open_element_type_jld242metg" IS 'the row type of the delta of news of OpenElementType';

COMMENT ON TYPE "qti"."__row_olds_open_element_type_hbuy6mrjn6" IS 'the row type of the delta of olds of OpenElementType';

COMMENT ON TYPE "qti"."__row_news_pci_module_form_iwq46h5ilu" IS 'the row type of the delta of news of PciModuleForm';

COMMENT ON TYPE "qti"."__row_olds_pci_module_form_por4lv4wlu" IS 'the row type of the delta of olds of PciModuleForm';

COMMENT ON TYPE "qti"."__row_news_pi_eb5r5g4umu" IS 'the row type of the delta of news of Pi';

COMMENT ON TYPE "qti"."__row_olds_pi_smgqmc3xkr" IS 'the row type of the delta of olds of Pi';

COMMENT ON TYPE "qti"."__row_news_placed_binding_5moxgudfs5" IS 'the row type of the delta of news of PlacedBinding';

COMMENT ON TYPE "qti"."__row_olds_placed_binding_qmiaaunqml" IS 'the row type of the delta of olds of PlacedBinding';

COMMENT ON TYPE "qti"."__row_news_placed_choice_d4735rljg3" IS 'the row type of the delta of news of PlacedChoice';

COMMENT ON TYPE "qti"."__row_olds_placed_choice_uqukc4rtgy" IS 'the row type of the delta of olds of PlacedChoice';

COMMENT ON TYPE "qti"."__row_news_placed_expression_liuyc6fuyd" IS 'the row type of the delta of news of PlacedExpression';

COMMENT ON TYPE "qti"."__row_olds_placed_expression_zb4apsrevs" IS 'the row type of the delta of olds of PlacedExpression';

COMMENT ON TYPE "qti"."__row_news_placed_hottext_ermemztp4d" IS 'the row type of the delta of news of PlacedHottext';

COMMENT ON TYPE "qti"."__row_olds_placed_hottext_ypqv6jhuof" IS 'the row type of the delta of olds of PlacedHottext';

COMMENT ON TYPE "qti"."__row_news_placed_id_ztedp67bae" IS 'the row type of the delta of news of PlacedId';

COMMENT ON TYPE "qti"."__row_olds_placed_id_swe5jdvh3f" IS 'the row type of the delta of olds of PlacedId';

COMMENT ON TYPE "qti"."__row_news_placed_idref_vmn5uhxuvb" IS 'the row type of the delta of news of PlacedIdref';

COMMENT ON TYPE "qti"."__row_news_placed_math_rank_jfq5dykbzg" IS 'the row type of the delta of news of PlacedMathRank';

COMMENT ON TYPE "qti"."__row_olds_placed_math_rank_f2kseag2pr" IS 'the row type of the delta of olds of PlacedMathRank';

COMMENT ON TYPE "qti"."__row_news_placed_share_target_552dd6r4hg" IS 'the row type of the delta of news of PlacedShareTarget';

COMMENT ON TYPE "qti"."__row_news_placed_variable_ref_krpu7qvqmc" IS 'the row type of the delta of news of PlacedVariableRef';

COMMENT ON TYPE "qti"."__row_olds_placed_variable_ref_nv5yfa23lr" IS 'the row type of the delta of olds of PlacedVariableRef';

COMMENT ON TYPE "qti"."__row_news_printed_variable_ref_f6irfkgqfx" IS 'the row type of the delta of news of PrintedVariableRef';

COMMENT ON TYPE "qti"."__row_news_processing_c7hfrlvoa6" IS 'the row type of the delta of news of Processing';

COMMENT ON TYPE "qti"."__row_olds_processing_lpjacgc5fr" IS 'the row type of the delta of olds of Processing';

COMMENT ON TYPE "qti"."__row_news_reference_v3axwj44zf" IS 'the row type of the delta of news of Reference';

COMMENT ON TYPE "qti"."__row_olds_reference_yw676e3ecw" IS 'the row type of the delta of olds of Reference';

COMMENT ON TYPE "qti"."__row_news_reference_path_4dnv7tw6dp" IS 'the row type of the delta of news of ReferencePath';

COMMENT ON TYPE "qti"."__row_olds_reference_path_f66xetpa5s" IS 'the row type of the delta of olds of ReferencePath';

COMMENT ON TYPE "qti"."__row_news_resource_document_kjwecozg4j" IS 'the row type of the delta of news of ResourceDocument';

COMMENT ON TYPE "qti"."__row_olds_resource_document_tmu6n2735n" IS 'the row type of the delta of olds of ResourceDocument';

COMMENT ON TYPE "qti"."__row_news_resource_href_v7ev4hdxek" IS 'the row type of the delta of news of ResourceHref';

COMMENT ON TYPE "qti"."__row_olds_resource_href_kvy54hs56h" IS 'the row type of the delta of olds of ResourceHref';

COMMENT ON TYPE "qti"."__row_news_resource_href_outside_knkfcm2s56" IS 'the row type of the delta of news of ResourceHrefOutside';

COMMENT ON TYPE "qti"."__row_olds_resource_href_outside_witcqpwdyk" IS 'the row type of the delta of olds of ResourceHrefOutside';

COMMENT ON TYPE "qti"."__row_news_resource_href_path_5jlqnvzjw4" IS 'the row type of the delta of news of ResourceHrefPath';

COMMENT ON TYPE "qti"."__row_olds_resource_href_path_ryiz4pd2x6" IS 'the row type of the delta of olds of ResourceHrefPath';

COMMENT ON TYPE "qti"."__row_news_rounding_wht6d4p3ec" IS 'the row type of the delta of news of Rounding';

COMMENT ON TYPE "qti"."__row_olds_rounding_rodl2gqnfk" IS 'the row type of the delta of olds of Rounding';

COMMENT ON TYPE "qti"."__row_news_rounding_figures_u3xetapo24" IS 'the row type of the delta of news of RoundingFigures';

COMMENT ON TYPE "qti"."__row_olds_rounding_figures_t3soaj56y7" IS 'the row type of the delta of olds of RoundingFigures';

COMMENT ON TYPE "qti"."__row_news_rounding_mode_figures_4dto2s3h6p" IS 'the row type of the delta of news of RoundingModeFigures';

COMMENT ON TYPE "qti"."__row_olds_rounding_mode_figures_aefqrvzknf" IS 'the row type of the delta of olds of RoundingModeFigures';

COMMENT ON TYPE "qti"."__row_news_share_fragment_gnfhrg2wac" IS 'the row type of the delta of news of ShareFragment';

COMMENT ON TYPE "qti"."__row_olds_share_fragment_nekgaxhqyu" IS 'the row type of the delta of olds of ShareFragment';

COMMENT ON TYPE "qti"."__row_news_share_target_iynfbk3xlv" IS 'the row type of the delta of news of ShareTarget';

COMMENT ON TYPE "qti"."__row_olds_share_target_2q5afkovdu" IS 'the row type of the delta of olds of ShareTarget';

COMMENT ON TYPE "qti"."__row_news_site_ccniqd5yfs" IS 'the row type of the delta of news of Site';

COMMENT ON TYPE "qti"."__row_olds_site_sqgjmsfl3h" IS 'the row type of the delta of olds of Site';

COMMENT ON TYPE "qti"."__row_news_site_path_v6xssr3rsf" IS 'the row type of the delta of news of SitePath';

COMMENT ON TYPE "qti"."__row_olds_site_path_ejfwr4dayi" IS 'the row type of the delta of olds of SitePath';

COMMENT ON TYPE "qti"."__row_news_site_target_yg23jxxoij" IS 'the row type of the delta of news of SiteTarget';

COMMENT ON TYPE "qti"."__row_olds_site_target_bqg73i5pff" IS 'the row type of the delta of olds of SiteTarget';

COMMENT ON TYPE "qti"."__row_news_srcset_ugswjhqap4" IS 'the row type of the delta of news of Srcset';

COMMENT ON TYPE "qti"."__row_olds_srcset_im5ldewfb2" IS 'the row type of the delta of olds of Srcset';

COMMENT ON TYPE "qti"."__row_news_srcset_candidate_z64cosul6j" IS 'the row type of the delta of news of SrcsetCandidate';

COMMENT ON TYPE "qti"."__row_olds_srcset_candidate_gotplrkdur" IS 'the row type of the delta of olds of SrcsetCandidate';

COMMENT ON TYPE "qti"."__row_news_ssml_scope_qxgqkjej6x" IS 'the row type of the delta of news of SsmlScope';

COMMENT ON TYPE "qti"."__row_olds_ssml_scope_me4tcjxvcr" IS 'the row type of the delta of olds of SsmlScope';

COMMENT ON TYPE "qti"."__row_news_stimulus_ref_l24b3sqslb" IS 'the row type of the delta of news of StimulusRef';

COMMENT ON TYPE "qti"."__row_olds_stimulus_ref_36d27ppvxa" IS 'the row type of the delta of olds of StimulusRef';

COMMENT ON TYPE "qti"."__row_news_template_ref_wskhib2cad" IS 'the row type of the delta of news of TemplateRef';

COMMENT ON TYPE "qti"."__row_news_text_reference_fchgfo2mns" IS 'the row type of the delta of news of TextReference';

COMMENT ON TYPE "qti"."__row_olds_text_reference_7licrm4ltv" IS 'the row type of the delta of olds of TextReference';

COMMENT ON TYPE "qti"."__row_news_text_reference_path_e35rofuhle" IS 'the row type of the delta of news of TextReferencePath';

COMMENT ON TYPE "qti"."__row_olds_text_reference_path_2rhninp5ig" IS 'the row type of the delta of olds of TextReferencePath';

COMMENT ON TYPE "qti"."__row_news_tolerance_rruu6vv4jd" IS 'the row type of the delta of news of Tolerance';

COMMENT ON TYPE "qti"."__row_olds_tolerance_n4cyvclaoo" IS 'the row type of the delta of olds of Tolerance';

COMMENT ON TYPE "qti"."__row_news_usage_value_rgazx5svef" IS 'the row type of the delta of news of UsageValue';

COMMENT ON TYPE "qti"."__row_olds_usage_value_lx4bqfccvb" IS 'the row type of the delta of olds of UsageValue';

COMMENT ON TYPE "qti"."__row_news_usage_value_base_type_crue77ur5f" IS 'the row type of the delta of news of UsageValueBaseType';

COMMENT ON TYPE "qti"."__row_olds_usage_value_base_type_wqsvslnpou" IS 'the row type of the delta of olds of UsageValueBaseType';

COMMENT ON TYPE "qti"."__row_news_variable_ref_jq6apyyzyz" IS 'the row type of the delta of news of VariableRef';

COMMENT ON TYPE "qti"."__row_olds_variable_ref_pwvajmvrii" IS 'the row type of the delta of olds of VariableRef';

COMMENT ON CONSTRAINT "__assembled_document_pk_j6e4uusicb" ON "qti"."assembled_document" IS 'primary key of AssembledDocument';

COMMENT ON CONSTRAINT "__assembled_document_check_assembled_document_vj2hynzxez" ON "qti"."assembled_document" IS 'check of AssembledDocument for law count fold over fin(AssembledDocument, targets) of SiteTarget(package, path) where Logic.eq(places, true) into AssembledDocument(package, path, sites)';

COMMENT ON CONSTRAINT "__assembled_document_key_package_path_instances_4de72j5vky" ON "qti"."assembled_document" IS 'key AssembledDocument(package, path, instances, sites)';

COMMENT ON CONSTRAINT "__assembled_document_key_package_path_targets_hgo4adwiy5" ON "qti"."assembled_document" IS 'key AssembledDocument(package, path, targets)';

COMMENT ON CONSTRAINT "__attribute_pk_7dwyp2j4rn" ON "qti"."attribute" IS 'primary key of Attribute';

COMMENT ON CONSTRAINT "__attribute_key_package_path_start_name_idrefs_nrfiwbgcvt" ON "qti"."attribute" IS 'key Attribute(package, path, start, name, idrefs)';

COMMENT ON CONSTRAINT "__attribute_check_attribute_idrefs_concat_fold_44423a7pnd" ON "qti"."attribute" IS 'check of Attribute for law concat fold over fin(Attribute, idrefs) of Idref(package, path, start, name, piece, piecesWasDigest, piecesAfterDigest) into Attribute(package, path, start, name, idrefTextDigest)';

COMMENT ON CONSTRAINT "__attribute_subset_name_fign53y6fa" ON "qti"."attribute" IS 'closed id subset check of Attribute.name';

COMMENT ON CONSTRAINT "__attribute_entity_pk_yb5ruqtiyk" ON "qti"."attribute_entity" IS 'primary key of AttributeEntity';

COMMENT ON CONSTRAINT "__binding_name_pk_k6l2t2abun" ON "qti"."binding_name" IS 'primary key of BindingName';

COMMENT ON CONSTRAINT "__binding_name_key_package_path_start_attribute_3qufdbmi7i" ON "qti"."binding_name" IS 'key BindingName(package, path, start, attribute, identifier)';

COMMENT ON CONSTRAINT "__bound_variable_pk_iz45qegzkf" ON "qti"."bound_variable" IS 'primary key of BoundVariable';

COMMENT ON CONSTRAINT "__bound_variable_key_package_path_identifier_ngvq53wpd3" ON "qti"."bound_variable" IS 'key BoundVariable(package, path, identifier)';

COMMENT ON CONSTRAINT "__bound_variable_key_package_path_start_attribute_nnzpz5f6yy" ON "qti"."bound_variable" IS 'key BoundVariable(package, path, start, attribute, identifier)';

COMMENT ON CONSTRAINT "__candidate_path_pk_2oe4ezpmrf" ON "qti"."candidate_path" IS 'primary key of CandidatePath';

COMMENT ON CONSTRAINT "__catalog_scope_pk_kb6w3u5zbp" ON "qti"."catalog_scope" IS 'primary key of CatalogScope';

COMMENT ON CONSTRAINT "__cell_leaf_pk_kwsf55gwhy" ON "qti"."cell_leaf" IS 'primary key of CellLeaf';

COMMENT ON CONSTRAINT "__cell_leaf_key_package_path_start_36lwd4ckkb" ON "qti"."cell_leaf" IS 'key CellLeaf(package, path, start)';

COMMENT ON CONSTRAINT "__cell_leaf_key_package_path_cell_at_start_after_6spurwpz6m" ON "qti"."cell_leaf" IS 'key CellLeaf(package, path, cell, at, startAfter)';

COMMENT ON CONSTRAINT "__cell_leaf_check_math_cell_leaves_max_fold_luu2g66k3z" ON "qti"."cell_leaf" IS 'check of CellLeaf for law max fold over fin(MathCell, leaves) of CellLeaf(package, path, cell, start, startWas, startAfter) into MathCell(package, path, start, lastStart)';

COMMENT ON CONSTRAINT "__choice_pk_lpz37hc34u" ON "qti"."choice" IS 'primary key of Choice';

COMMENT ON CONSTRAINT "__choice_key_package_path_kind_identifier_auoyrne6k5" ON "qti"."choice" IS 'key Choice(package, path, kind, identifier)';

COMMENT ON CONSTRAINT "__choice_key_package_path_start_identifier_cqceszylta" ON "qti"."choice" IS 'key Choice(package, path, start, identifier)';

COMMENT ON CONSTRAINT "__choice_interaction_pk_dxmiqmyvgh" ON "qti"."choice_interaction" IS 'primary key of ChoiceInteraction';

COMMENT ON CONSTRAINT "__cn_attribute_pk_uahvc6us4g" ON "qti"."cn_attribute" IS 'primary key of CnAttribute';

COMMENT ON CONSTRAINT "__cn_count_pk_5n2ubteh2s" ON "qti"."cn_count" IS 'primary key of CnCount';

COMMENT ON CONSTRAINT "__cn_count_key_package_path_start_type_gfzp5vminc" ON "qti"."cn_count" IS 'key CnCount(package, path, start, type)';

COMMENT ON CONSTRAINT "__cn_count_key_package_path_start_parts_type_7wasizqrkb" ON "qti"."cn_count" IS 'key CnCount(package, path, start, parts, type)';

COMMENT ON CONSTRAINT "__cn_count_check_cn_count_in_cn_parts_cwyirxrado" ON "qti"."cn_count" IS 'check of CnCount for law CnCount(type, parts) in CnParts(type, parts)';

COMMENT ON CONSTRAINT "__cn_part_text_pk_2mlmvkaywv" ON "qti"."cn_part_text" IS 'primary key of CnPartText';

COMMENT ON CONSTRAINT "__cn_part_text_check_cn_part_text_in_cn_form_skp5v7ovmz" ON "qti"."cn_part_text" IS 'check of CnPartText for law CnPartText(type, part, form) in CnForm(type, part, form)';

COMMENT ON CONSTRAINT "__cn_slot_pk_tkl6mzsgtu" ON "qti"."cn_slot" IS 'primary key of CnSlot';

COMMENT ON CONSTRAINT "__cn_slot_check_cn_slot_in_cn_form_sx4ohhn6rj" ON "qti"."cn_slot" IS 'check of CnSlot for law CnSlot(type, part, form) in CnForm(type, part, form)';

COMMENT ON CONSTRAINT "__comment_pk_zalmloung6" ON "qti"."comment" IS 'primary key of Comment';

COMMENT ON CONSTRAINT "__context_ref_pk_wtoqozrkb7" ON "qti"."context_ref" IS 'primary key of ContextRef';

COMMENT ON CONSTRAINT "__context_ref_key_package_path_start_attribute_kind_lwutnzkqew" ON "qti"."context_ref" IS 'key ContextRef(package, path, start, attribute, kind, assemblyKind, identifier)';

COMMENT ON CONSTRAINT "__count_bound_pk_uzay2pj3by" ON "qti"."count_bound" IS 'primary key of CountBound';

COMMENT ON CONSTRAINT "__data_ssml_pk_gzjsvobgct" ON "qti"."data_ssml" IS 'primary key of DataSsml';

COMMENT ON CONSTRAINT "__data_ssml_member_pk_u4vziygyer" ON "qti"."data_ssml_member" IS 'primary key of DataSsmlMember';

COMMENT ON CONSTRAINT "__data_ssml_member_key_package_path_start_at_member_v6lhslcuku" ON "qti"."data_ssml_member" IS 'key DataSsmlMember(package, path, start, at, memberDigest)';

COMMENT ON CONSTRAINT "__data_ssml_property_pk_4jbru3xmzc" ON "qti"."data_ssml_property" IS 'primary key of DataSsmlProperty';

COMMENT ON CONSTRAINT "__doctype_pk_5h245mv7ym" ON "qti"."doctype" IS 'primary key of Doctype';

COMMENT ON CONSTRAINT "__document_pk_4kx3ps5ktb" ON "qti"."document" IS 'primary key of Document';

COMMENT ON CONSTRAINT "__document_key_package_path_ids_idref_targets_uarcdaz2q7" ON "qti"."document" IS 'key Document(package, path, ids, idrefTargets, choices, hottexts)';

COMMENT ON CONSTRAINT "__document_key_package_path_choices_4giytroxnf" ON "qti"."document" IS 'key Document(package, path, choices)';

COMMENT ON CONSTRAINT "__document_key_package_path_root_kind_document_type_fbvnlbnzgb" ON "qti"."document" IS 'key Document(package, path, rootKind, documentType)';

COMMENT ON CONSTRAINT "__document_key_package_path_hottexts_64ahki5hq2" ON "qti"."document" IS 'key Document(package, path, hottexts)';

COMMENT ON CONSTRAINT "__document_key_package_path_root_kind_nlu75ekokq" ON "qti"."document" IS 'key Document(package, path, rootKind)';

COMMENT ON CONSTRAINT "__document_key_package_path_idref_targets_assembled_pqtexnr4ef" ON "qti"."document" IS 'key Document(package, path, idrefTargets, assembled)';

COMMENT ON CONSTRAINT "__document_key_package_path_targeted_by_context_ecojuiifmt" ON "qti"."document" IS 'key Document(package, path, targetedBy, contextNearest, contextNearestKind, contextPath, rootKind)';

COMMENT ON CONSTRAINT "__document_key_package_path_bindings_i4mvwqzwgt" ON "qti"."document" IS 'key Document(package, path, bindings)';

COMMENT ON CONSTRAINT "__document_key_package_path_assembled_rgcicnbedu" ON "qti"."document" IS 'key Document(package, path, assembled)';

COMMENT ON CONSTRAINT "__document_key_package_path_ids_mtswnxnvwc" ON "qti"."document" IS 'key Document(package, path, ids)';

COMMENT ON CONSTRAINT "__document_check_document_targeted_by_or_fold_dpxrkvcaqz" ON "qti"."document" IS 'check of Document for law or fold over fin(Document, targetedBy) of SiteTarget(package, target, ancestry) into Document(package, path, context)';

COMMENT ON CONSTRAINT "__document_id_pk_x7sxopulh7" ON "qti"."document_id" IS 'primary key of DocumentId';

COMMENT ON CONSTRAINT "__element_type_pk_eut565g4zr" ON "qti"."element_type" IS 'primary key of ElementType';

COMMENT ON CONSTRAINT "__element_type_check_element_type_in_xsi_type_7rogblrpa2" ON "qti"."element_type" IS 'check of ElementType for law ElementType(kind, type) in XsiType(kind, type)';

COMMENT ON CONSTRAINT "__encoding_decl_pk_7o6qyrzn2p" ON "qti"."encoding_decl" IS 'primary key of EncodingDecl';

COMMENT ON CONSTRAINT "__entry_pk_pft7stbhq7" ON "qti"."entry" IS 'primary key of Entry';

COMMENT ON CONSTRAINT "__expression_pk_djkytcc7ot" ON "qti"."expression" IS 'primary key of Expression';

COMMENT ON CONSTRAINT "__feedback_ref_pk_h56q5t5kv4" ON "qti"."feedback_ref" IS 'primary key of FeedbackRef';

COMMENT ON CONSTRAINT "__feedback_ref_key_package_path_start_attribute_kind_b222qol62s" ON "qti"."feedback_ref" IS 'key FeedbackRef(package, path, start, attribute, kind, assemblyKind, identifier)';

COMMENT ON CONSTRAINT "__file_pk_i2bjocdyi2" ON "qti"."file" IS 'primary key of File';

COMMENT ON CONSTRAINT "__file_outside_pk_fqeyqsc5ql" ON "qti"."file_outside" IS 'primary key of FileOutside';

COMMENT ON CONSTRAINT "__file_path_pk_3vonxidxst" ON "qti"."file_path" IS 'primary key of FilePath';

COMMENT ON CONSTRAINT "__fragment_context_name_pk_267rnimwff" ON "qti"."fragment_context_name" IS 'primary key of FragmentContextName';

COMMENT ON CONSTRAINT "__fragment_context_name_key_package_path_start_zmrbs4elqr" ON "qti"."fragment_context_name" IS 'key FragmentContextName(package, path, start, attribute, kind, identifier)';

COMMENT ON CONSTRAINT "__fragment_context_ref_pk_2f7bkzpv3i" ON "qti"."fragment_context_ref" IS 'primary key of FragmentContextRef';

COMMENT ON CONSTRAINT "__fragment_feedback_name_pk_ejmdti7lg3" ON "qti"."fragment_feedback_name" IS 'primary key of FragmentFeedbackName';

COMMENT ON CONSTRAINT "__fragment_feedback_name_key_package_path_start_exu3fvjnqk" ON "qti"."fragment_feedback_name" IS 'key FragmentFeedbackName(package, path, start, attribute, kind, identifier)';

COMMENT ON CONSTRAINT "__fragment_feedback_ref_pk_ynbqfxu6rf" ON "qti"."fragment_feedback_ref" IS 'primary key of FragmentFeedbackRef';

COMMENT ON CONSTRAINT "__fragment_printed_name_pk_5zdeta42lu" ON "qti"."fragment_printed_name" IS 'primary key of FragmentPrintedName';

COMMENT ON CONSTRAINT "__fragment_printed_name_key_package_path_start_7s4gjvpj7j" ON "qti"."fragment_printed_name" IS 'key FragmentPrintedName(package, path, start, attribute, kind, identifier)';

COMMENT ON CONSTRAINT "__fragment_printed_ref_pk_hxbuzmlrz2" ON "qti"."fragment_printed_ref" IS 'primary key of FragmentPrintedRef';

COMMENT ON CONSTRAINT "__fragment_scope_pk_sgzw7myypj" ON "qti"."fragment_scope" IS 'primary key of FragmentScope';

COMMENT ON CONSTRAINT "__fragment_scope_key_package_assembly_instance_byyh3dpbgf" ON "qti"."fragment_scope" IS 'key FragmentScope(package, assembly, instance, contexts, assemblyKind, document)';

COMMENT ON CONSTRAINT "__fragment_scope_key_package_assembly_instance_agjvofijij" ON "qti"."fragment_scope" IS 'key FragmentScope(package, assembly, instance, prints, assemblyKind, document)';

COMMENT ON CONSTRAINT "__fragment_scope_key_package_assembly_instance_ixkimyvxqa" ON "qti"."fragment_scope" IS 'key FragmentScope(package, assembly, instance, templates, assemblyKind, document)';

COMMENT ON CONSTRAINT "__fragment_scope_key_package_assembly_instance_jcirqd44oa" ON "qti"."fragment_scope" IS 'key FragmentScope(package, assembly, instance, feedbacks, assemblyKind, document)';

COMMENT ON CONSTRAINT "__fragment_template_name_pk_jq3jwmzjws" ON "qti"."fragment_template_name" IS 'primary key of FragmentTemplateName';

COMMENT ON CONSTRAINT "__fragment_template_name_key_package_path_start_v4b7iks3vq" ON "qti"."fragment_template_name" IS 'key FragmentTemplateName(package, path, start, attribute, kind, identifier)';

COMMENT ON CONSTRAINT "__fragment_template_ref_pk_fozvbajq3p" ON "qti"."fragment_template_ref" IS 'primary key of FragmentTemplateRef';

COMMENT ON CONSTRAINT "__hottext_pk_g57caygl5o" ON "qti"."hottext" IS 'primary key of Hottext';

COMMENT ON CONSTRAINT "__hottext_key_package_path_identifier_deg7ldwv3f" ON "qti"."hottext" IS 'key Hottext(package, path, identifier)';

COMMENT ON CONSTRAINT "__hottext_key_package_path_start_identifier_tjylrajmak" ON "qti"."hottext" IS 'key Hottext(package, path, start, identifier)';

COMMENT ON CONSTRAINT "__identity_text_pk_aaeve62thy" ON "qti"."identity_text" IS 'primary key of IdentityText';

COMMENT ON CONSTRAINT "__identity_text_key_package_path_start_tokens_5pavpyeu7f" ON "qti"."identity_text" IS 'key IdentityText(package, path, start, tokens)';

COMMENT ON CONSTRAINT "__identity_text_check_identity_text_tokens_concat_ittljgri2r" ON "qti"."identity_text" IS 'check of IdentityText for law concat fold over fin(IdentityText, tokens) of TextIdref(package, path, start, piece, piecesWasDigest, piecesAfterDigest) into IdentityText(package, path, start, tokenTextDigest)';

COMMENT ON CONSTRAINT "__idref_pk_xqrlmnw437" ON "qti"."idref" IS 'primary key of Idref';

COMMENT ON CONSTRAINT "__idref_key_package_path_start_name_at_pieces_after_4xfoe7gkuu" ON "qti"."idref" IS 'key Idref(package, path, start, name, at, piecesAfterDigest)';

COMMENT ON CONSTRAINT "__idref_check_attribute_idrefs_concat_fold_tnhetunhdq" ON "qti"."idref" IS 'check of Idref for law concat fold over fin(Attribute, idrefs) of Idref(package, path, start, name, piece, piecesWasDigest, piecesAfterDigest) into Attribute(package, path, start, name, idrefTextDigest)';

COMMENT ON CONSTRAINT "__idref_target_pk_jsj2m7b4kd" ON "qti"."idref_target" IS 'primary key of IdrefTarget';

COMMENT ON CONSTRAINT "__inclusion_pk_niaddoqk3f" ON "qti"."inclusion" IS 'primary key of Inclusion';

COMMENT ON CONSTRAINT "__instance_pk_prybopoegp" ON "qti"."instance" IS 'primary key of Instance';

COMMENT ON CONSTRAINT "__instance_key_package_assembly_start_ids_assembly_5cetgpnmjn" ON "qti"."instance" IS 'key Instance(package, assembly, start, ids, assemblyKind, document)';

COMMENT ON CONSTRAINT "__instance_key_package_assembly_start_document_vigbcn7gg7" ON "qti"."instance" IS 'key Instance(package, assembly, start, document, assemblyKind)';

COMMENT ON CONSTRAINT "__instance_key_package_assembly_start_hottexts_dlfe4bt7mk" ON "qti"."instance" IS 'key Instance(package, assembly, start, hottexts, document)';

COMMENT ON CONSTRAINT "__instance_key_package_assembly_start_children_ce6pyigrjj" ON "qti"."instance" IS 'key Instance(package, assembly, start, children, assemblyKind, document)';

COMMENT ON CONSTRAINT "__instance_key_package_assembly_start_idref_targets_4b3dwuaxhp" ON "qti"."instance" IS 'key Instance(package, assembly, start, idrefTargets, document)';

COMMENT ON CONSTRAINT "__instance_key_package_assembly_start_document_go7qfh4bdy" ON "qti"."instance" IS 'key Instance(package, assembly, start, document)';

COMMENT ON CONSTRAINT "__instance_key_package_assembly_start_choices_3brw3vjmom" ON "qti"."instance" IS 'key Instance(package, assembly, start, choices, document)';

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

COMMENT ON CONSTRAINT "__literal_key_package_path_start_text_base_type_ypayt3hdup" ON "qti"."literal" IS 'key Literal(package, path, start, text, baseType)';

COMMENT ON CONSTRAINT "__literal_typed_pk_uqez5pzkc2" ON "qti"."literal_typed" IS 'primary key of LiteralTyped';

COMMENT ON CONSTRAINT "__math_action_pk_4jdvklv2ii" ON "qti"."math_action" IS 'primary key of MathAction';

COMMENT ON CONSTRAINT "__math_align_group_pk_tgvbkr7qje" ON "qti"."math_align_group" IS 'primary key of MathAlignGroup';

COMMENT ON CONSTRAINT "__math_align_scope_pk_sxnaufx3ho" ON "qti"."math_align_scope" IS 'primary key of MathAlignScope';

COMMENT ON CONSTRAINT "__math_align_scope_key_package_path_start_cell_mgyr62ewdn" ON "qti"."math_align_scope" IS 'key MathAlignScope(package, path, start, cell)';

COMMENT ON CONSTRAINT "__math_align_scope_key_package_path_start_state_zrr62hnvxo" ON "qti"."math_align_scope" IS 'key MathAlignScope(package, path, start, state)';

COMMENT ON CONSTRAINT "__math_cell_pk_flybwottgz" ON "qti"."math_cell" IS 'primary key of MathCell';

COMMENT ON CONSTRAINT "__math_cell_key_package_path_start_leaves_nhlewh35h4" ON "qti"."math_cell" IS 'key MathCell(package, path, start, leaves)';

COMMENT ON CONSTRAINT "__math_cell_check_math_cell_leaves_max_fold_p4tuczms44" ON "qti"."math_cell" IS 'check of MathCell for law max fold over fin(MathCell, leaves) of CellLeaf(package, path, cell, start, startWas, startAfter) into MathCell(package, path, start, lastStart)';

COMMENT ON CONSTRAINT "__math_cell_key_package_path_start_groups_nlvtbk2yer" ON "qti"."math_cell" IS 'key MathCell(package, path, start, groups)';

COMMENT ON CONSTRAINT "__math_cn_pk_3nrusqjv2o" ON "qti"."math_cn" IS 'primary key of MathCn';

COMMENT ON CONSTRAINT "__math_cn_check_math_cn_in_cn_parts_ela4pkxt26" ON "qti"."math_cn" IS 'check of MathCn for law MathCn(type, parts) in CnParts(type, parts)';

COMMENT ON CONSTRAINT "__math_cn_key_package_path_start_parts_base_type_k7rpbytgms" ON "qti"."math_cn" IS 'key MathCn(package, path, start, parts, base, type)';

COMMENT ON CONSTRAINT "__math_rank_pk_bu6eyoohob" ON "qti"."math_rank" IS 'primary key of MathRank';

COMMENT ON CONSTRAINT "__media_pk_scp4yymok4" ON "qti"."media" IS 'primary key of Media';

COMMENT ON CONSTRAINT "__most_count_pk_dueqkg2jsm" ON "qti"."most_count" IS 'primary key of MostCount';

COMMENT ON CONSTRAINT "__named_pk_7cwq6zir4x" ON "qti"."named" IS 'primary key of Named';

COMMENT ON CONSTRAINT "__named_key_package_path_identifier_sqdhzpunew" ON "qti"."named" IS 'key Named(package, path, identifier)';

COMMENT ON CONSTRAINT "__namespace_pk_bossyr4mgg" ON "qti"."namespace" IS 'primary key of Namespace';

COMMENT ON CONSTRAINT "__namespace_key_package_path_start_prefix_digest_yfyt5tqgoi" ON "qti"."namespace" IS 'key Namespace(package, path, start, prefixDigest)';

COMMENT ON CONSTRAINT "__node_pk_3sd4cqvxbf" ON "qti"."node" IS 'primary key of Node';

COMMENT ON CONSTRAINT "__node_key_package_path_start_attributes_governor_pxds7wqnyl" ON "qti"."node" IS 'key Node(package, path, start, attributes, governor, kind, parent)';

COMMENT ON CONSTRAINT "__node_key_package_path_start_parent_ytuzrwhg3t" ON "qti"."node" IS 'key Node(package, path, start, parent)';

COMMENT ON CONSTRAINT "__node_key_package_path_start_string_value_digest_hx6nn5eqk5" ON "qti"."node" IS 'key Node(package, path, start, stringValueDigest)';

COMMENT ON CONSTRAINT "__node_key_package_path_start_kind_governor_42fsltrsjy" ON "qti"."node" IS 'key Node(package, path, start, kind, governor)';

COMMENT ON CONSTRAINT "__node_key_package_path_start_kind_ooglyqab5z" ON "qti"."node" IS 'key Node(package, path, start, kind)';

COMMENT ON CONSTRAINT "__node_check_node_start_in_node_kuuvkytm3l" ON "qti"."node" IS 'check of Node for law Node(package, path, parent, pred(at), was) where Logic.gt(start, 0n) in Node(package, path, parent, at, state) where Logic.gt(start, 0n)';

COMMENT ON CONSTRAINT "__node_key_package_path_start_open_attributes_nc25nroxph" ON "qti"."node" IS 'key Node(package, path, start, openAttributes, governor, kind)';

COMMENT ON CONSTRAINT "__node_key_package_path_start_children_ancestry_mhxzt3iftx" ON "qti"."node" IS 'key Node(package, path, start, children, ancestry, governor, kind, nearest, nearestKind, nearestPath, parentKind)';

COMMENT ON CONSTRAINT "__node_check_node_children_concat_fold_e4hr3jf5ig" ON "qti"."node" IS 'check of Node for law concat fold over fin(Node, children) of Node(package, path, parent, chars, charsWasDigest, charsAfterDigest) where Logic.or(Logic.in(parentKind, ["lom:catalog", "lom:entity", "lom:entry", "lom:id", "lom:language", "lom:source", "lom:value", "qti-base-value", "qti-resource-icon", "qti-value", "ud:value"]), Logic.and(Logic.in(parentParentKind, ["lom:entry.langString", "lom:source.langString", "lom:title"]), Logic.eq(parentKind, "lom:string")), CheckedText.has(parentGovernor)) and Logic.gt(start, 0n) into Node(package, path, start, stringValueDigest)';

COMMENT ON CONSTRAINT "__node_key_package_path_start_nearest_y5k53am632" ON "qti"."node" IS 'key Node(package, path, start, nearest)';

COMMENT ON CONSTRAINT "__node_check_node_start_in_node_dqrlgxt5zm" ON "qti"."node" IS 'check of Node for law Node(package, path, parent, parentKind, parentGovernor, parentAncestry, parentNearest, parentNearestKind, parentNearestPath, parentParentKind) where Logic.gt(start, 0n) in Node(package, path, start, kind, governor, ancestry, nearest, nearestKind, nearestPath, parentKind)';

COMMENT ON CONSTRAINT "__node_check_node_attributes_or_fold_mleeahtwkj" ON "qti"."node" IS 'check of Node for law or fold over fin(Node, attributes) of Attribute(package, path, start, slot) into Node(package, path, start, attrs)';

COMMENT ON CONSTRAINT "__node_check_node_children_count_fold_hsxqdt3sdl" ON "qti"."node" IS 'check of Node for law count fold over fin(Node, children) of Node(package, path, parent, elementsWas, elements) where Logic.not(Logic.in(kind, ["comment", "doctype", "document", "entityRef", "pi", "text", "ws"])) and Logic.gt(start, 0n) into Node(package, path, start, elementChildren)';

COMMENT ON CONSTRAINT "__node_check_node_in_node_z2rpbmauvt" ON "qti"."node" IS 'check of Node for law Node(package, path, start, pred(children), lastState) in Node(package, path, parent, at, state) where Logic.gt(start, 0n)';

COMMENT ON CONSTRAINT "__numbered_reading_pk_vrnabdsgjr" ON "qti"."numbered_reading" IS 'primary key of NumberedReading';

COMMENT ON CONSTRAINT "__open_attribute_pk_6mb2hbuotd" ON "qti"."open_attribute" IS 'primary key of OpenAttribute';

COMMENT ON CONSTRAINT "__open_attribute_key_package_path_start_uri_digest_xc7rtmnj53" ON "qti"."open_attribute" IS 'key OpenAttribute(package, path, start, uriDigest, localDigest)';

COMMENT ON CONSTRAINT "__open_attribute_subset_class_vzmcv3d7ri" ON "qti"."open_attribute" IS 'closed id subset check of OpenAttribute.class';

COMMENT ON CONSTRAINT "__open_attribute_entity_pk_u75ia7rdtp" ON "qti"."open_attribute_entity" IS 'primary key of OpenAttributeEntity';

COMMENT ON CONSTRAINT "__open_element_name_pk_tvf7l2rxcw" ON "qti"."open_element_name" IS 'primary key of OpenElementName';

COMMENT ON CONSTRAINT "__open_element_type_pk_osb6ag24xx" ON "qti"."open_element_type" IS 'primary key of OpenElementType';

COMMENT ON CONSTRAINT "__package_pk_sg2cyzxgtm" ON "qti"."package" IS 'primary key of Package';

COMMENT ON CONSTRAINT "__pci_module_form_pk_jb4ydiyesl" ON "qti"."pci_module_form" IS 'primary key of PciModuleForm';

COMMENT ON CONSTRAINT "__pi_pk_vqm3tcomg6" ON "qti"."pi" IS 'primary key of Pi';

COMMENT ON CONSTRAINT "__placed_binding_pk_kvet6cuoq5" ON "qti"."placed_binding" IS 'primary key of PlacedBinding';

COMMENT ON CONSTRAINT "__placed_binding_key_package_assembly_identifier_ms3jnkda2n" ON "qti"."placed_binding" IS 'key PlacedBinding(package, assembly, identifier)';

COMMENT ON CONSTRAINT "__placed_choice_pk_dok6mu6xso" ON "qti"."placed_choice" IS 'primary key of PlacedChoice';

COMMENT ON CONSTRAINT "__placed_choice_key_package_assembly_kind_identifier_qgyuv4g444" ON "qti"."placed_choice" IS 'key PlacedChoice(package, assembly, kind, identifier)';

COMMENT ON CONSTRAINT "__placed_expression_pk_22dfh4b4gx" ON "qti"."placed_expression" IS 'primary key of PlacedExpression';

COMMENT ON CONSTRAINT "__placed_hottext_pk_6ecbggsuft" ON "qti"."placed_hottext" IS 'primary key of PlacedHottext';

COMMENT ON CONSTRAINT "__placed_hottext_key_package_assembly_identifier_6xhnnjovga" ON "qti"."placed_hottext" IS 'key PlacedHottext(package, assembly, identifier)';

COMMENT ON CONSTRAINT "__placed_id_pk_qlkpea6rki" ON "qti"."placed_id" IS 'primary key of PlacedId';

COMMENT ON CONSTRAINT "__placed_idref_pk_457qtpabdq" ON "qti"."placed_idref" IS 'primary key of PlacedIdref';

COMMENT ON CONSTRAINT "__placed_math_rank_pk_w247vuqyov" ON "qti"."placed_math_rank" IS 'primary key of PlacedMathRank';

COMMENT ON CONSTRAINT "__placed_share_target_pk_r6i6tlbske" ON "qti"."placed_share_target" IS 'primary key of PlacedShareTarget';

COMMENT ON CONSTRAINT "__placed_variable_ref_pk_raoqh7fl2q" ON "qti"."placed_variable_ref" IS 'primary key of PlacedVariableRef';

COMMENT ON CONSTRAINT "__printed_variable_ref_pk_4a3jyykasc" ON "qti"."printed_variable_ref" IS 'primary key of PrintedVariableRef';

COMMENT ON CONSTRAINT "__printed_variable_ref_key_package_path_start_odxtr6f34w" ON "qti"."printed_variable_ref" IS 'key PrintedVariableRef(package, path, start, attribute, kind, assemblyKind, identifier)';

COMMENT ON CONSTRAINT "__processing_pk_gy3aspswav" ON "qti"."processing" IS 'primary key of Processing';

COMMENT ON CONSTRAINT "__reference_pk_2o4vr3munh" ON "qti"."reference" IS 'primary key of Reference';

COMMENT ON CONSTRAINT "__reference_path_pk_p3zpayjgij" ON "qti"."reference_path" IS 'primary key of ReferencePath';

COMMENT ON CONSTRAINT "__referring_document_pk_tdpnvmehb4" ON "qti"."referring_document" IS 'primary key of ReferringDocument';

COMMENT ON CONSTRAINT "__referring_document_key_package_path_templates_je6u6axji4" ON "qti"."referring_document" IS 'key ReferringDocument(package, path, templates)';

COMMENT ON CONSTRAINT "__referring_document_key_package_path_feedbacks_cvhrnks7yx" ON "qti"."referring_document" IS 'key ReferringDocument(package, path, feedbacks, prints, templates, contexts)';

COMMENT ON CONSTRAINT "__referring_document_key_package_path_feedbacks_4p7kezdq2l" ON "qti"."referring_document" IS 'key ReferringDocument(package, path, feedbacks)';

COMMENT ON CONSTRAINT "__referring_document_key_package_path_prints_v72l4cixxs" ON "qti"."referring_document" IS 'key ReferringDocument(package, path, prints)';

COMMENT ON CONSTRAINT "__referring_document_key_package_path_contexts_ywpuklr6qa" ON "qti"."referring_document" IS 'key ReferringDocument(package, path, contexts)';

COMMENT ON CONSTRAINT "__resource_document_pk_rxwn2mdki3" ON "qti"."resource_document" IS 'primary key of ResourceDocument';

COMMENT ON CONSTRAINT "__resource_document_check_resource_document_in_root_mkbnfbuuvd" ON "qti"."resource_document" IS 'check of ResourceDocument for law ResourceDocument(type, rootKind) in RootOfType(type, root)';

COMMENT ON CONSTRAINT "__resource_href_pk_fzjlywz4ma" ON "qti"."resource_href" IS 'primary key of ResourceHref';

COMMENT ON CONSTRAINT "__resource_href_outside_pk_wc2au5t3zn" ON "qti"."resource_href_outside" IS 'primary key of ResourceHrefOutside';

COMMENT ON CONSTRAINT "__resource_href_path_pk_qwafest54w" ON "qti"."resource_href_path" IS 'primary key of ResourceHrefPath';

COMMENT ON CONSTRAINT "__rounding_pk_p5ba7td7t4" ON "qti"."rounding" IS 'primary key of Rounding';

COMMENT ON CONSTRAINT "__rounding_figures_pk_wwvjzzaivg" ON "qti"."rounding_figures" IS 'primary key of RoundingFigures';

COMMENT ON CONSTRAINT "__rounding_figures_key_package_path_start_figures_lvcs4z6khn" ON "qti"."rounding_figures" IS 'key RoundingFigures(package, path, start, figuresDigest)';

COMMENT ON CONSTRAINT "__rounding_mode_figures_pk_32ue4ztm6s" ON "qti"."rounding_mode_figures" IS 'primary key of RoundingModeFigures';

COMMENT ON CONSTRAINT "__sd_decl_pk_do2xlu7vc3" ON "qti"."sd_decl" IS 'primary key of SdDecl';

COMMENT ON CONSTRAINT "__share_fragment_pk_w7lv43thb6" ON "qti"."share_fragment" IS 'primary key of ShareFragment';

COMMENT ON CONSTRAINT "__share_fragment_key_package_path_start_placements_zritxscvdf" ON "qti"."share_fragment" IS 'key ShareFragment(package, path, start, placements, idDigest)';

COMMENT ON CONSTRAINT "__share_target_pk_tap2cz4xh5" ON "qti"."share_target" IS 'primary key of ShareTarget';

COMMENT ON CONSTRAINT "__site_pk_j2vhpivheb" ON "qti"."site" IS 'primary key of Site';

COMMENT ON CONSTRAINT "__site_key_package_path_start_ancestry_kind_nearest_ap2yfi7b7f" ON "qti"."site" IS 'key Site(package, path, start, ancestry, kind, nearest, nearestKind, parentKind)';

COMMENT ON CONSTRAINT "__site_key_package_path_start_kind_s6ijpbztua" ON "qti"."site" IS 'key Site(package, path, start, kind)';

COMMENT ON CONSTRAINT "__site_path_pk_6ywav3eq35" ON "qti"."site_path" IS 'primary key of SitePath';

COMMENT ON CONSTRAINT "__site_path_key_package_path_start_target_s26hafrpua" ON "qti"."site_path" IS 'key SitePath(package, path, start, target)';

COMMENT ON CONSTRAINT "__site_target_pk_oj7kjo67zv" ON "qti"."site_target" IS 'primary key of SiteTarget';

COMMENT ON CONSTRAINT "__site_target_key_package_path_start_parent_kind_cu6n5wnlhm" ON "qti"."site_target" IS 'key SiteTarget(package, path, start, parentKind, places, targetRoot, splices)';

COMMENT ON CONSTRAINT "__srcset_pk_wnl6kaqxsl" ON "qti"."srcset" IS 'primary key of Srcset';

COMMENT ON CONSTRAINT "__srcset_check_srcset_tokens_concat_fold_nr3pgajp5m" ON "qti"."srcset" IS 'check of Srcset for law concat fold over fin(Srcset, tokens) of SrcsetCandidate(package, path, start, piece, piecesWasDigest, piecesAfterDigest) into Srcset(package, path, start, tokenTextDigest)';

COMMENT ON CONSTRAINT "__srcset_key_package_path_start_tokens_7vcwtlqzy2" ON "qti"."srcset" IS 'key Srcset(package, path, start, tokens)';

COMMENT ON CONSTRAINT "__srcset_candidate_pk_rbke535jdh" ON "qti"."srcset_candidate" IS 'primary key of SrcsetCandidate';

COMMENT ON CONSTRAINT "__srcset_candidate_key_package_path_start_at_pieces_pchzuqeu6g" ON "qti"."srcset_candidate" IS 'key SrcsetCandidate(package, path, start, at, piecesAfterDigest)';

COMMENT ON CONSTRAINT "__srcset_candidate_check_srcset_tokens_concat_fold_2rycw2f5op" ON "qti"."srcset_candidate" IS 'check of SrcsetCandidate for law concat fold over fin(Srcset, tokens) of SrcsetCandidate(package, path, start, piece, piecesWasDigest, piecesAfterDigest) into Srcset(package, path, start, tokenTextDigest)';

COMMENT ON CONSTRAINT "__ssml_scope_pk_swy2jq3zvy" ON "qti"."ssml_scope" IS 'primary key of SsmlScope';

COMMENT ON CONSTRAINT "__stimulus_ref_pk_kmzmekbnny" ON "qti"."stimulus_ref" IS 'primary key of StimulusRef';

COMMENT ON CONSTRAINT "__stimulus_ref_key_package_path_identifier_vhtin76k3a" ON "qti"."stimulus_ref" IS 'key StimulusRef(package, path, identifier)';

COMMENT ON CONSTRAINT "__template_ref_pk_by3fsxvspr" ON "qti"."template_ref" IS 'primary key of TemplateRef';

COMMENT ON CONSTRAINT "__template_ref_key_package_path_start_attribute_kind_whis3c7dsj" ON "qti"."template_ref" IS 'key TemplateRef(package, path, start, attribute, kind, assemblyKind, identifier)';

COMMENT ON CONSTRAINT "__text_idref_pk_7k524ffk7d" ON "qti"."text_idref" IS 'primary key of TextIdref';

COMMENT ON CONSTRAINT "__text_idref_key_package_path_start_at_pieces_after_hx4i6xd3jt" ON "qti"."text_idref" IS 'key TextIdref(package, path, start, at, piecesAfterDigest)';

COMMENT ON CONSTRAINT "__text_idref_check_identity_text_tokens_concat_fold_mjsgm2mts4" ON "qti"."text_idref" IS 'check of TextIdref for law concat fold over fin(IdentityText, tokens) of TextIdref(package, path, start, piece, piecesWasDigest, piecesAfterDigest) into IdentityText(package, path, start, tokenTextDigest)';

COMMENT ON CONSTRAINT "__text_reference_pk_47h6xjfe7g" ON "qti"."text_reference" IS 'primary key of TextReference';

COMMENT ON CONSTRAINT "__text_reference_path_pk_aurefmdcbf" ON "qti"."text_reference_path" IS 'primary key of TextReferencePath';

COMMENT ON CONSTRAINT "__tolerance_pk_awo6y43rfn" ON "qti"."tolerance" IS 'primary key of Tolerance';

COMMENT ON CONSTRAINT "__tolerance_check_tolerance_tokens_concat_fold_yijvagdcgq" ON "qti"."tolerance" IS 'check of Tolerance for law concat fold over fin(Tolerance, tokens) of ToleranceToken(package, path, start, piece, piecesWasDigest, piecesAfterDigest) into Tolerance(package, path, start, tokenTextDigest)';

COMMENT ON CONSTRAINT "__tolerance_key_package_path_start_tokens_xlvepfuwuw" ON "qti"."tolerance" IS 'key Tolerance(package, path, start, tokens)';

COMMENT ON CONSTRAINT "__tolerance_token_pk_o33pihaiia" ON "qti"."tolerance_token" IS 'primary key of ToleranceToken';

COMMENT ON CONSTRAINT "__tolerance_token_key_package_path_start_at_pieces_drqanhhmxs" ON "qti"."tolerance_token" IS 'key ToleranceToken(package, path, start, at, piecesAfterDigest)';

COMMENT ON CONSTRAINT "__tolerance_token_check_tolerance_tokens_concat_fold_lik6fcbzk5" ON "qti"."tolerance_token" IS 'check of ToleranceToken for law concat fold over fin(Tolerance, tokens) of ToleranceToken(package, path, start, piece, piecesWasDigest, piecesAfterDigest) into Tolerance(package, path, start, tokenTextDigest)';

COMMENT ON CONSTRAINT "__usage_value_pk_i2ykr2qbnf" ON "qti"."usage_value" IS 'primary key of UsageValue';

COMMENT ON CONSTRAINT "__usage_value_base_type_pk_v6447uyhax" ON "qti"."usage_value_base_type" IS 'primary key of UsageValueBaseType';

COMMENT ON CONSTRAINT "__variable_ref_pk_xysknydg4p" ON "qti"."variable_ref" IS 'primary key of VariableRef';

COMMENT ON CONSTRAINT "__xml_decl_pk_rlecspusxn" ON "qti"."xml_decl" IS 'primary key of XmlDecl';

COMMENT ON COLUMN "qti"."assembled_document"."__pred_instances_jnofs7e7gu" IS 'pred(instances)';

COMMENT ON COLUMN "qti"."assembled_document"."__pred_targets_c5nt4iqzuc" IS 'pred(targets)';

COMMENT ON COLUMN "qti"."attribute"."__after_attributes_0_4xdbd7d2wd" IS 'the accumulator after plane 0 of the fold __node_attributes_or_fold_qjtccpaklg over the family Node.attributes';

COMMENT ON COLUMN "qti"."attribute"."__before_attributes_0_7ux33ww56a" IS 'the accumulator before plane 0 of the fold __node_attributes_or_fold_qjtccpaklg over the family Node.attributes';

COMMENT ON COLUMN "qti"."attribute"."__copy_attributes_yxabddgj5r" IS 'the owner''s count of the family Node.attributes';

COMMENT ON COLUMN "qti"."attribute"."__index_attributes_7arzckayvr" IS 'the index of the family Node.attributes';

COMMENT ON COLUMN "qti"."attribute"."__predecessor_attributes_wqkk3l5mnd" IS 'the predecessor of the index of the family Node.attributes';

COMMENT ON COLUMN "qti"."attribute"."__package_a4p2u7pv6l" IS 'package where Logic.in(kind, ["qti-any-n", "qti-correct", "qti-default", "qti-equal-rounded", "qti-index", "qti-lookup-outcome-value", "qti-map-response", "qti-map-response-point", "qti-pattern-match", "qti-random-float", "qti-random-integer", "qti-repeat", "qti-round-to", "qti-set-correct-response", "qti-set-default-value", "qti-set-outcome-value", "qti-set-template-value", "qti-variable"]) and Logic.or(Logic.and(Logic.or(Logic.not(Text.matches(lexical, Text.pattern(<language 09b97c6fe613e598d9cf5ca30b8c43c11c5473e4a711d4d45e6270278a6683d0>))), Logic.not(Logic.eq(kind, "qti-random-float"))), Text.matches(lexical, Text.pattern(<language dbce2bac939b8d15f3f6b873394359a57b42b74412cfab08f44671682d0447ad>)), Logic.eq(VariableReference.at("spelling", kind, name), "bare")), Logic.and(Text.matches(lexical, Text.pattern(<language 47716b2482bfc820077d0844275d18cfdc3c12bc3eea5af5832ffaf0ed8f0bb2>)), Logic.eq(VariableReference.at("spelling", kind, name), "braced"))) and Logic.eq(Bits.subset(Bits.singleton(name), VariableReference.row(kind)), true)';

COMMENT ON COLUMN "qti"."attribute"."__package_c6ealb2c5z" IS 'package where Logic.in(value, ["1", "true"]) and Logic.eq(kind, "qti-card-entry") and Logic.eq(name, "default")';

COMMENT ON COLUMN "qti"."attribute"."__package_zq4aso5g6f" IS 'package where Logic.or(Logic.and(ValueIdentity.has(AttributeGrammar.at("domain", AttributeModelOf.at("model", governor), name)), Logic.eq(ValueIdentity.at("identity", AttributeGrammar.at("domain", AttributeModelOf.at("model", governor), name)), "ID")), Logic.and(Logic.eq(kind, "qti-context-declaration"), Logic.eq(name, "identifier")))';

COMMENT ON COLUMN "qti"."attribute"."__package_tkzla6ex7r" IS 'package where Logic.eq(kind, "qti-assessment-item") and Logic.eq(name, "tool-name")';

COMMENT ON COLUMN "qti"."attribute"."__package_gw6es3z53z" IS 'package where Logic.eq(kind, "qti-assessment-item") and Logic.eq(name, "tool-version")';

COMMENT ON COLUMN "qti"."attribute"."__package_ybzlg64bpx" IS 'package where Logic.eq(kind, "qti-card") and Logic.eq(name, "support")';

COMMENT ON COLUMN "qti"."attribute"."__package_vtzt2gplfj" IS 'package where Logic.eq(kind, "qti-variable-mapping") and Logic.eq(name, "target-identifier")';

COMMENT ON COLUMN "qti"."attribute"."__package_cg3657csij" IS 'package where Logic.eq(kind, "qti-weight") and Logic.eq(name, "identifier")';

COMMENT ON COLUMN "qti"."attribute"."__pred_idrefs_2kinxrebfw" IS 'pred(idrefs)';

COMMENT ON COLUMN "qti"."binding_name"."__copy_bindings_bkr36e6zer" IS 'the owner''s count of the family Document.bindings';

COMMENT ON COLUMN "qti"."binding_name"."__index_bindings_unk6tk2t53" IS 'the index of the family Document.bindings';

COMMENT ON COLUMN "qti"."binding_name"."__predecessor_bindings_hnpwjkvxqw" IS 'the predecessor of the index of the family Document.bindings';

COMMENT ON COLUMN "qti"."bound_variable"."__package_pyofn3cand" IS 'package where Logic.eq(adaptive, false) and Logic.eq(attribute, "response-identifier")';

COMMENT ON COLUMN "qti"."cell_leaf"."__copy_leaves_zbyyqc6flc" IS 'the owner''s count of the family MathCell.leaves';

COMMENT ON COLUMN "qti"."cell_leaf"."__pred_at_xktcobhsti" IS 'pred(at)';

COMMENT ON COLUMN "qti"."choice"."__copy_choices_6wb56hybwx" IS 'the owner''s count of the family Document.choices';

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

COMMENT ON COLUMN "qti"."document"."__pred_bindings_4jwvqtioeb" IS 'pred(bindings)';

COMMENT ON COLUMN "qti"."document"."__pred_choices_w4bygwsb7b" IS 'pred(choices)';

COMMENT ON COLUMN "qti"."document"."__pred_hottexts_qwkebxoneh" IS 'pred(hottexts)';

COMMENT ON COLUMN "qti"."document"."__pred_idref_targets_2hmjkyp3ck" IS 'pred(idrefTargets)';

COMMENT ON COLUMN "qti"."document"."__pred_ids_wdsabmqjb7" IS 'pred(ids)';

COMMENT ON COLUMN "qti"."document"."__pred_targeted_by_x4imsveco5" IS 'pred(targetedBy)';

COMMENT ON COLUMN "qti"."document_id"."__copy_ids_olm55ckphp" IS 'the owner''s count of the family Document.ids';

COMMENT ON COLUMN "qti"."document_id"."__index_ids_6wzypuy7sz" IS 'the index of the family Document.ids';

COMMENT ON COLUMN "qti"."document_id"."__predecessor_ids_qwo2em24bw" IS 'the predecessor of the index of the family Document.ids';

COMMENT ON COLUMN "qti"."fragment_context_name"."__copy_contexts_5a2mmj6flw" IS 'the owner''s count of the family ReferringDocument.contexts';

COMMENT ON COLUMN "qti"."fragment_context_name"."__index_contexts_rurifjnewj" IS 'the index of the family ReferringDocument.contexts';

COMMENT ON COLUMN "qti"."fragment_context_name"."__predecessor_contexts_uwyrojdgj7" IS 'the predecessor of the index of the family ReferringDocument.contexts';

COMMENT ON COLUMN "qti"."fragment_context_ref"."__copy_contexts_aa5iocscdr" IS 'the owner''s count of the family FragmentScope.contexts';

COMMENT ON COLUMN "qti"."fragment_context_ref"."__index_contexts_cmwyokypvl" IS 'the index of the family FragmentScope.contexts';

COMMENT ON COLUMN "qti"."fragment_context_ref"."__predecessor_contexts_bio7nxkg5y" IS 'the predecessor of the index of the family FragmentScope.contexts';

COMMENT ON COLUMN "qti"."fragment_feedback_name"."__copy_feedbacks_db37gtjbwl" IS 'the owner''s count of the family ReferringDocument.feedbacks';

COMMENT ON COLUMN "qti"."fragment_feedback_name"."__index_feedbacks_5unk6hkdlh" IS 'the index of the family ReferringDocument.feedbacks';

COMMENT ON COLUMN "qti"."fragment_feedback_name"."__predecessor_feedbacks_mnprabm2zf" IS 'the predecessor of the index of the family ReferringDocument.feedbacks';

COMMENT ON COLUMN "qti"."fragment_feedback_ref"."__copy_feedbacks_cywy2j56so" IS 'the owner''s count of the family FragmentScope.feedbacks';

COMMENT ON COLUMN "qti"."fragment_feedback_ref"."__index_feedbacks_uaqpsnapkw" IS 'the index of the family FragmentScope.feedbacks';

COMMENT ON COLUMN "qti"."fragment_feedback_ref"."__predecessor_feedbacks_tqxnj4bnpd" IS 'the predecessor of the index of the family FragmentScope.feedbacks';

COMMENT ON COLUMN "qti"."fragment_printed_name"."__copy_prints_t4jfjtgc7d" IS 'the owner''s count of the family ReferringDocument.prints';

COMMENT ON COLUMN "qti"."fragment_printed_name"."__index_prints_lrn5xrcnoj" IS 'the index of the family ReferringDocument.prints';

COMMENT ON COLUMN "qti"."fragment_printed_name"."__predecessor_prints_w5l5ryjguo" IS 'the predecessor of the index of the family ReferringDocument.prints';

COMMENT ON COLUMN "qti"."fragment_printed_ref"."__copy_prints_bdawvaisob" IS 'the owner''s count of the family FragmentScope.prints';

COMMENT ON COLUMN "qti"."fragment_printed_ref"."__index_prints_4vol45drim" IS 'the index of the family FragmentScope.prints';

COMMENT ON COLUMN "qti"."fragment_printed_ref"."__predecessor_prints_yg4v7qxrwg" IS 'the predecessor of the index of the family FragmentScope.prints';

COMMENT ON COLUMN "qti"."fragment_scope"."__pred_contexts_leteqrd4bu" IS 'pred(contexts)';

COMMENT ON COLUMN "qti"."fragment_scope"."__pred_feedbacks_c2txublcan" IS 'pred(feedbacks)';

COMMENT ON COLUMN "qti"."fragment_scope"."__pred_prints_uwxz5ocwj4" IS 'pred(prints)';

COMMENT ON COLUMN "qti"."fragment_scope"."__pred_templates_5bo5q45wjw" IS 'pred(templates)';

COMMENT ON COLUMN "qti"."fragment_template_name"."__copy_templates_xccyy2wmtp" IS 'the owner''s count of the family ReferringDocument.templates';

COMMENT ON COLUMN "qti"."fragment_template_name"."__index_templates_v2kw2euldh" IS 'the index of the family ReferringDocument.templates';

COMMENT ON COLUMN "qti"."fragment_template_name"."__predecessor_templates_nc6jzzxv73" IS 'the predecessor of the index of the family ReferringDocument.templates';

COMMENT ON COLUMN "qti"."fragment_template_ref"."__copy_templates_k5hlr5akya" IS 'the owner''s count of the family FragmentScope.templates';

COMMENT ON COLUMN "qti"."fragment_template_ref"."__index_templates_tyl4zqwugp" IS 'the index of the family FragmentScope.templates';

COMMENT ON COLUMN "qti"."fragment_template_ref"."__predecessor_templates_phvu6yyk7k" IS 'the predecessor of the index of the family FragmentScope.templates';

COMMENT ON COLUMN "qti"."hottext"."__copy_hottexts_b24kbb6m65" IS 'the owner''s count of the family Document.hottexts';

COMMENT ON COLUMN "qti"."hottext"."__index_hottexts_huxv2shciv" IS 'the index of the family Document.hottexts';

COMMENT ON COLUMN "qti"."hottext"."__predecessor_hottexts_imqsc5w56i" IS 'the predecessor of the index of the family Document.hottexts';

COMMENT ON COLUMN "qti"."identity_text"."__pred_tokens_ip7mlgrtju" IS 'pred(tokens)';

COMMENT ON COLUMN "qti"."idref"."__copy_idrefs_tkyc3atjbb" IS 'the owner''s count of the family Attribute.idrefs';

COMMENT ON COLUMN "qti"."idref"."__pred_at_xktcobhsti" IS 'pred(at)';

COMMENT ON COLUMN "qti"."idref_target"."__copy_idref_targets_nn7nlmtms6" IS 'the owner''s count of the family Document.idrefTargets';

COMMENT ON COLUMN "qti"."idref_target"."__index_idref_targets_hoxb6lgv75" IS 'the index of the family Document.idrefTargets';

COMMENT ON COLUMN "qti"."idref_target"."__predecessor_idref_targets_3a7kfrknym" IS 'the predecessor of the index of the family Document.idrefTargets';

COMMENT ON COLUMN "qti"."instance"."__copy_instances_o6jtftfowj" IS 'the owner''s count of the family AssembledDocument.instances';

COMMENT ON COLUMN "qti"."instance"."__copy_children_x6kra4he2y" IS 'the owner''s count of the family Instance.children';

COMMENT ON COLUMN "qti"."instance"."__index_instances_x7qgj6n3ho" IS 'the index of the family AssembledDocument.instances';

COMMENT ON COLUMN "qti"."instance"."__predecessor_instances_wr47uilqlc" IS 'the predecessor of the index of the family AssembledDocument.instances';

COMMENT ON COLUMN "qti"."instance"."__package_capwbknxpj" IS 'package where Logic.eq(start, 0n)';

COMMENT ON COLUMN "qti"."instance"."__package_y55am5j6k6" IS 'package where Logic.gt(start, 0n)';

COMMENT ON COLUMN "qti"."instance"."__parent_l4ckjnvwat" IS 'parent where Logic.gt(start, 0n)';

COMMENT ON COLUMN "qti"."instance"."__pred_at_xktcobhsti" IS 'pred(at)';

COMMENT ON COLUMN "qti"."instance"."__pred_bindings_4jwvqtioeb" IS 'pred(bindings)';

COMMENT ON COLUMN "qti"."instance"."__pred_children_nrfpkqcaen" IS 'pred(children)';

COMMENT ON COLUMN "qti"."instance"."__pred_choices_w4bygwsb7b" IS 'pred(choices)';

COMMENT ON COLUMN "qti"."instance"."__pred_hottexts_qwkebxoneh" IS 'pred(hottexts)';

COMMENT ON COLUMN "qti"."instance"."__pred_idref_targets_2hmjkyp3ck" IS 'pred(idrefTargets)';

COMMENT ON COLUMN "qti"."instance"."__pred_ids_wdsabmqjb7" IS 'pred(ids)';

COMMENT ON COLUMN "qti"."interaction"."__pred_choices_w4bygwsb7b" IS 'pred(choices)';

COMMENT ON COLUMN "qti"."interaction"."__pred_module_forms_c2s5pqvqs7" IS 'pred(moduleForms)';

COMMENT ON COLUMN "qti"."interaction_attribute"."__package_em5smlkv7y" IS 'package where Logic.not(Logic.in(rootKind, ["qti-assessment-item", "qti-assessment-test"])) and Logic.in(kind, ["qti-associable-hotspot", "qti-gap", "qti-gap-img", "qti-gap-text", "qti-hotspot-choice", "qti-hottext", "qti-inline-choice", "qti-simple-associable-choice", "qti-simple-choice", "qti-template-block", "qti-template-block.rubric", "qti-template-inline", "qti-template-inline.rubric", "qti-template-variable"]) and Text.matches(value, Text.pattern(<language 1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5>)) and Logic.eq(name, "template-identifier")';

COMMENT ON COLUMN "qti"."interaction_attribute"."__package_ph3lmj2a3i" IS 'package where Logic.not(Logic.in(rootKind, ["qti-assessment-item", "qti-assessment-test"])) and Logic.in(kind, ["qti-feedback-block", "qti-feedback-block.template", "qti-feedback-inline", "qti-modal-feedback", "qti-test-feedback"]) and Text.matches(value, Text.pattern(<language 1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5>)) and Logic.eq(name, "outcome-identifier")';

COMMENT ON COLUMN "qti"."interaction_attribute"."__package_sl6clonewv" IS 'package where Logic.not(Logic.in(rootKind, ["qti-assessment-item", "qti-assessment-test"])) and Logic.or(Logic.and(Logic.in(name, ["base", "index"]), Logic.eq(kind, "qti-printed-variable")), Logic.and(Logic.eq(kind, "qti-printed-variable"), Logic.eq(name, "identifier"))) and Text.matches(value, Text.pattern(<language 1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5>))';

COMMENT ON COLUMN "qti"."interaction_attribute"."__package_ml42oesjn5" IS 'package where Logic.not(Logic.in(rootKind, ["qti-assessment-item", "qti-assessment-test"])) and Text.matches(value, Text.pattern(<language 1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5>)) and Logic.eq(kind, "qti-context-variable") and Logic.eq(name, "identifier")';

COMMENT ON COLUMN "qti"."interaction_attribute"."__package_mh3ihjeic4" IS 'package where Logic.in(kind, ["qti-associable-hotspot", "qti-gap", "qti-gap-img", "qti-gap-text", "qti-hotspot-choice", "qti-hottext", "qti-inline-choice", "qti-simple-associable-choice", "qti-simple-choice", "qti-template-block", "qti-template-block.rubric", "qti-template-inline", "qti-template-inline.rubric", "qti-template-variable"]) and Logic.in(rootKind, ["qti-assessment-item", "qti-assessment-test"]) and Text.matches(value, Text.pattern(<language 1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5>)) and Logic.eq(name, "template-identifier")';

COMMENT ON COLUMN "qti"."interaction_attribute"."__package_py2hqgnzbf" IS 'package where Logic.in(kind, ["qti-associate-interaction", "qti-choice-interaction", "qti-custom-interaction", "qti-drawing-interaction", "qti-end-attempt-interaction", "qti-extended-text-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-inline-choice-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-portable-custom-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-slider-interaction", "qti-text-entry-interaction", "qti-upload-interaction"]) and Logic.in(name, ["response-identifier", "string-identifier"]) and Text.matches(value, Text.pattern(<language 1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5>))';

COMMENT ON COLUMN "qti"."interaction_attribute"."__package_u7v2jd53lp" IS 'package where Logic.in(kind, ["qti-associate-interaction", "qti-choice-interaction", "qti-custom-interaction", "qti-drawing-interaction", "qti-end-attempt-interaction", "qti-extended-text-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-inline-choice-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-portable-custom-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-slider-interaction", "qti-text-entry-interaction", "qti-upload-interaction"]) and Logic.in(name, ["response-identifier", "string-identifier"]) and Text.matches(value, Text.pattern(<language 1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5>)) and Logic.eq(rootKind, "qti-assessment-item")';

COMMENT ON COLUMN "qti"."interaction_attribute"."__package_u66bjij63r" IS 'package where Logic.in(kind, ["qti-feedback-block", "qti-feedback-block.template", "qti-feedback-inline", "qti-modal-feedback", "qti-test-feedback"]) and Logic.in(rootKind, ["qti-assessment-item", "qti-assessment-test"]) and Text.matches(value, Text.pattern(<language 1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5>)) and Logic.eq(name, "outcome-identifier")';

COMMENT ON COLUMN "qti"."interaction_attribute"."__package_23kaj6k72g" IS 'package where Logic.in(rootKind, ["qti-assessment-item", "qti-assessment-test"]) and Logic.or(Logic.and(Logic.in(name, ["base", "index"]), Logic.eq(kind, "qti-printed-variable")), Logic.and(Logic.eq(kind, "qti-printed-variable"), Logic.eq(name, "identifier"))) and Text.matches(value, Text.pattern(<language 1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5>))';

COMMENT ON COLUMN "qti"."interaction_attribute"."__package_vavgyyjccm" IS 'package where Logic.in(rootKind, ["qti-assessment-item", "qti-assessment-test"]) and Text.matches(value, Text.pattern(<language 1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5>)) and Logic.eq(kind, "qti-context-variable") and Logic.eq(name, "identifier")';

COMMENT ON COLUMN "qti"."interaction_attribute"."__package_lccfor32hz" IS 'package where Logic.or(Logic.eq(Crypto.sha256("1"), valueDigest), Logic.eq(Crypto.sha256("true"), valueDigest)) and Logic.eq(kind, "qti-assessment-item") and Logic.eq(name, "adaptive")';

COMMENT ON COLUMN "qti"."item_mode"."__package_bvmctmknpe" IS 'package where Logic.eq(adaptive, true)';

COMMENT ON COLUMN "qti"."math_align_group"."__tag_state_open_hbfhgrpnnf" IS 'tag MathAlignScope.state = open';

COMMENT ON COLUMN "qti"."math_align_group"."__tag_kind_m_maligngroup_u3ce3cx7aa" IS 'tag Node.kind = m:maligngroup';

COMMENT ON COLUMN "qti"."math_align_group"."__copy_groups_stk5ekuyip" IS 'the owner''s count of the family MathCell.groups';

COMMENT ON COLUMN "qti"."math_align_group"."__index_groups_ybwzwddeng" IS 'the index of the family MathCell.groups';

COMMENT ON COLUMN "qti"."math_align_group"."__predecessor_groups_6xj7n2r25s" IS 'the predecessor of the index of the family MathCell.groups';

COMMENT ON COLUMN "qti"."math_cell"."__pred_groups_vcil4lo3j4" IS 'pred(groups)';

COMMENT ON COLUMN "qti"."math_cell"."__pred_leaves_oeq7eporgz" IS 'pred(leaves)';

COMMENT ON COLUMN "qti"."math_cn"."__pred_parts_32uebfen7t" IS 'pred(parts)';

COMMENT ON COLUMN "qti"."node"."__after_children_0_vmaftea6hj" IS 'the accumulator after plane 0 of the fold __node_children_count_fold_fmibs64zod over the family Node.children';

COMMENT ON COLUMN "qti"."node"."__after_children_0_qbioc6jbat" IS 'the accumulator after plane 0 of the fold __node_children_count_fold_mue4fqjorm over the family Node.children';

COMMENT ON COLUMN "qti"."node"."__before_children_0_qdvwmuycyh" IS 'the accumulator before plane 0 of the fold __node_children_count_fold_fmibs64zod over the family Node.children';

COMMENT ON COLUMN "qti"."node"."__before_children_0_bs3zgzsr7j" IS 'the accumulator before plane 0 of the fold __node_children_count_fold_mue4fqjorm over the family Node.children';

COMMENT ON COLUMN "qti"."node"."__copy_children_tityo5ij5l" IS 'the owner''s count of the family Node.children';

COMMENT ON COLUMN "qti"."node"."__package_3taa5kijgy" IS 'package where Logic.not(Logic.in(kind, ["comment", "doctype", "document", "entityRef", "pi", "text", "ws"])) and Logic.eq(Bits.subset(Bits.singleton(state), Capped.row(parentKind)), true) and Logic.gt(start, 0n)';

COMMENT ON COLUMN "qti"."node"."__package_p5yblwgnua" IS 'package where Logic.in(kind, ["qti-associate-interaction", "qti-choice-interaction", "qti-custom-interaction", "qti-drawing-interaction", "qti-end-attempt-interaction", "qti-extended-text-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-inline-choice-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-portable-custom-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-slider-interaction", "qti-text-entry-interaction", "qti-upload-interaction"]) and Logic.eq(Bits.disjoint(ancestry, Enters.row("qti-feedback-block")), true)';

COMMENT ON COLUMN "qti"."node"."__package_pzlq2bwqm3" IS 'package where Logic.eq(Bits.subset(Bits.singleton(AttributeGrammar.at("slot", AttributeModelOf.at("model", governor), "baseType")), attrs), true) and Logic.eq(Bits.subset(Bits.singleton(AttributeGrammar.at("slot", AttributeModelOf.at("model", governor), "fieldIdentifier")), attrs), true) and Logic.eq(kind, "ud:value")';

COMMENT ON COLUMN "qti"."node"."__package_lqgfkydq7q" IS 'package where Logic.eq(kind, "qti-interaction-modules") and Logic.eq(parentKind, "qti-portable-custom-interaction")';

COMMENT ON COLUMN "qti"."node"."__parent_l4ckjnvwat" IS 'parent where Logic.gt(start, 0n)';

COMMENT ON COLUMN "qti"."node"."__pred_at_xktcobhsti" IS 'pred(at)';

COMMENT ON COLUMN "qti"."node"."__pred_attributes_aghx2cqr7s" IS 'pred(attributes)';

COMMENT ON COLUMN "qti"."node"."__pred_children_nrfpkqcaen" IS 'pred(children)';

COMMENT ON COLUMN "qti"."node"."__pred_open_attributes_4pd7mwzpyg" IS 'pred(openAttributes)';

COMMENT ON COLUMN "qti"."open_attribute"."__copy_open_attributes_fpnvcvdmpf" IS 'the owner''s count of the family Node.openAttributes';

COMMENT ON COLUMN "qti"."open_attribute"."__index_open_attributes_hgy2tjkow2" IS 'the index of the family Node.openAttributes';

COMMENT ON COLUMN "qti"."open_attribute"."__predecessor_open_attributes_rrtw7d24a5" IS 'the predecessor of the index of the family Node.openAttributes';

COMMENT ON COLUMN "qti"."pci_module_form"."__copy_module_forms_hwpic65mty" IS 'the owner''s count of the family Interaction.moduleForms';

COMMENT ON COLUMN "qti"."pci_module_form"."__index_module_forms_wydm354elh" IS 'the index of the family Interaction.moduleForms';

COMMENT ON COLUMN "qti"."pci_module_form"."__predecessor_module_forms_dauym75voc" IS 'the predecessor of the index of the family Interaction.moduleForms';

COMMENT ON COLUMN "qti"."placed_binding"."__copy_bindings_i7fid7zclc" IS 'the owner''s count of the family Instance.bindings';

COMMENT ON COLUMN "qti"."placed_binding"."__index_bindings_oyr3fiahr3" IS 'the index of the family Instance.bindings';

COMMENT ON COLUMN "qti"."placed_binding"."__predecessor_bindings_ntcwoepfst" IS 'the predecessor of the index of the family Instance.bindings';

COMMENT ON COLUMN "qti"."placed_binding"."__package_pyofn3cand" IS 'package where Logic.eq(adaptive, false) and Logic.eq(attribute, "response-identifier")';

COMMENT ON COLUMN "qti"."placed_choice"."__copy_choices_wxxtuahand" IS 'the owner''s count of the family Instance.choices';

COMMENT ON COLUMN "qti"."placed_choice"."__index_choices_ktdrfnqsrr" IS 'the index of the family Instance.choices';

COMMENT ON COLUMN "qti"."placed_choice"."__predecessor_choices_uwibywwdhh" IS 'the predecessor of the index of the family Instance.choices';

COMMENT ON COLUMN "qti"."placed_hottext"."__copy_hottexts_md2dcayyk4" IS 'the owner''s count of the family Instance.hottexts';

COMMENT ON COLUMN "qti"."placed_hottext"."__index_hottexts_tdyulq7odh" IS 'the index of the family Instance.hottexts';

COMMENT ON COLUMN "qti"."placed_hottext"."__predecessor_hottexts_4uwo3bx7x2" IS 'the predecessor of the index of the family Instance.hottexts';

COMMENT ON COLUMN "qti"."placed_id"."__copy_ids_tljj3gujvw" IS 'the owner''s count of the family Instance.ids';

COMMENT ON COLUMN "qti"."placed_id"."__index_ids_ojwjtnxm2y" IS 'the index of the family Instance.ids';

COMMENT ON COLUMN "qti"."placed_id"."__predecessor_ids_rtodazzhin" IS 'the predecessor of the index of the family Instance.ids';

COMMENT ON COLUMN "qti"."placed_idref"."__copy_idref_targets_cv65ds7nu7" IS 'the owner''s count of the family Instance.idrefTargets';

COMMENT ON COLUMN "qti"."placed_idref"."__index_idref_targets_fjkkfgwwk3" IS 'the index of the family Instance.idrefTargets';

COMMENT ON COLUMN "qti"."placed_idref"."__predecessor_idref_targets_rgsj76jpds" IS 'the predecessor of the index of the family Instance.idrefTargets';

COMMENT ON COLUMN "qti"."placed_share_target"."__copy_placements_iadanzgnox" IS 'the owner''s count of the family ShareFragment.placements';

COMMENT ON COLUMN "qti"."placed_share_target"."__index_placements_n77jrjkfw2" IS 'the index of the family ShareFragment.placements';

COMMENT ON COLUMN "qti"."placed_share_target"."__predecessor_placements_ppbi3jzzws" IS 'the predecessor of the index of the family ShareFragment.placements';

COMMENT ON COLUMN "qti"."referring_document"."__pred_contexts_leteqrd4bu" IS 'pred(contexts)';

COMMENT ON COLUMN "qti"."referring_document"."__pred_feedbacks_c2txublcan" IS 'pred(feedbacks)';

COMMENT ON COLUMN "qti"."referring_document"."__pred_prints_uwxz5ocwj4" IS 'pred(prints)';

COMMENT ON COLUMN "qti"."referring_document"."__pred_templates_5bo5q45wjw" IS 'pred(templates)';

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

COMMENT ON COLUMN "qti"."srcset"."__pred_tokens_ip7mlgrtju" IS 'pred(tokens)';

COMMENT ON COLUMN "qti"."srcset_candidate"."__copy_tokens_mhv3zj45jr" IS 'the owner''s count of the family Srcset.tokens';

COMMENT ON COLUMN "qti"."srcset_candidate"."__pred_at_xktcobhsti" IS 'pred(at)';

COMMENT ON COLUMN "qti"."text_idref"."__copy_tokens_rrsly23qzp" IS 'the owner''s count of the family IdentityText.tokens';

COMMENT ON COLUMN "qti"."text_idref"."__pred_at_xktcobhsti" IS 'pred(at)';

COMMENT ON COLUMN "qti"."tolerance"."__pred_tokens_ip7mlgrtju" IS 'pred(tokens)';

COMMENT ON COLUMN "qti"."tolerance_token"."__copy_tokens_zlo7jvsicr" IS 'the owner''s count of the family Tolerance.tokens';

COMMENT ON COLUMN "qti"."tolerance_token"."__pred_at_xktcobhsti" IS 'pred(at)';

COMMENT ON CONSTRAINT "__attribute_key_package_path_start_index_attributes_6cj6mvsxvm" ON "qti"."attribute" IS 'key Attribute(package, path, start, the index of the family Node.attributes)';

COMMENT ON CONSTRAINT "__attribute_key_package_path_start_index_attributes_7vvrfnxvf7" ON "qti"."attribute" IS 'key Attribute(package, path, start, the index of the family Node.attributes, the accumulator after plane 0 of the fold __node_attributes_or_fold_qjtccpaklg over the family Node.attributes)';

COMMENT ON CONSTRAINT "__attribute_key_package_path_start_predecessor_2x7ppgesjy" ON "qti"."attribute" IS 'key Attribute(package, path, start, the predecessor of the index of the family Node.attributes)';

COMMENT ON CONSTRAINT "__attribute_key_package_path_parent_3pbuan3ddy" ON "qti"."attribute" IS 'key Attribute(package where Logic.in(value, ["1", "true"]) and Logic.eq(kind, "qti-card-entry") and Logic.eq(name, "default"), path, parent)';

COMMENT ON CONSTRAINT "__attribute_key_package_path_start_54iub2w3d4" ON "qti"."attribute" IS 'key Attribute(package where Logic.or(Logic.and(ValueIdentity.has(AttributeGrammar.at("domain", AttributeModelOf.at("model", governor), name)), Logic.eq(ValueIdentity.at("identity", AttributeGrammar.at("domain", AttributeModelOf.at("model", governor), name)), "ID")), Logic.and(Logic.eq(kind, "qti-context-declaration"), Logic.eq(name, "identifier"))), path, start)';

COMMENT ON CONSTRAINT "__attribute_key_package_path_ooxw5d3335" ON "qti"."attribute" IS 'key Attribute(package where Logic.eq(kind, "qti-assessment-item") and Logic.eq(name, "tool-name"), path)';

COMMENT ON CONSTRAINT "__attribute_key_package_path_pvjib3644a" ON "qti"."attribute" IS 'key Attribute(package where Logic.eq(kind, "qti-assessment-item") and Logic.eq(name, "tool-version"), path)';

COMMENT ON CONSTRAINT "__attribute_key_package_path_parent_value_digest_uwesnpe757" ON "qti"."attribute" IS 'key Attribute(package where Logic.eq(kind, "qti-card") and Logic.eq(name, "support"), path, parent, valueDigest)';

COMMENT ON CONSTRAINT "__attribute_key_package_path_parent_value_digest_4jxprvi7wt" ON "qti"."attribute" IS 'key Attribute(package where Logic.eq(kind, "qti-variable-mapping") and Logic.eq(name, "target-identifier"), path, parent, valueDigest)';

COMMENT ON CONSTRAINT "__attribute_key_package_path_parent_value_digest_4k3ay3grnz" ON "qti"."attribute" IS 'key Attribute(package where Logic.eq(kind, "qti-weight") and Logic.eq(name, "identifier"), path, parent, valueDigest)';

COMMENT ON CONSTRAINT "__binding_name_key_package_path_index_bindings_r6nggsduso" ON "qti"."binding_name" IS 'key BindingName(package, path, the index of the family Document.bindings)';

COMMENT ON CONSTRAINT "__binding_name_key_package_path_predecessor_bindings_fxgle54zc2" ON "qti"."binding_name" IS 'key BindingName(package, path, the predecessor of the index of the family Document.bindings)';

COMMENT ON CONSTRAINT "__cell_leaf_key_package_path_cell_pred_at_ypuborqf34" ON "qti"."cell_leaf" IS 'key CellLeaf(package, path, cell, pred(at))';

COMMENT ON CONSTRAINT "__choice_key_package_path_index_choices_nfi2h7amio" ON "qti"."choice" IS 'key Choice(package, path, the index of the family Document.choices)';

COMMENT ON CONSTRAINT "__choice_key_package_path_predecessor_choices_sgzerm3kdb" ON "qti"."choice" IS 'key Choice(package, path, the predecessor of the index of the family Document.choices)';

COMMENT ON CONSTRAINT "__choice_interaction_key_package_interaction_path_lqglabumbc" ON "qti"."choice_interaction" IS 'key ChoiceInteraction(package, interactionPath, interaction, the index of the family Interaction.choices)';

COMMENT ON CONSTRAINT "__choice_interaction_key_package_interaction_path_pjrwzmno7q" ON "qti"."choice_interaction" IS 'key ChoiceInteraction(package, interactionPath, interaction, the predecessor of the index of the family Interaction.choices)';

COMMENT ON CONSTRAINT "__cn_part_text_key_package_path_start_index_parts_5vdus42otu" ON "qti"."cn_part_text" IS 'key CnPartText(package, path, start, the index of the family MathCn.parts)';

COMMENT ON CONSTRAINT "__cn_part_text_key_package_path_start_predecessor_sm7ycadrmu" ON "qti"."cn_part_text" IS 'key CnPartText(package, path, start, the predecessor of the index of the family MathCn.parts)';

COMMENT ON CONSTRAINT "__cn_slot_key_package_path_start_index_parts_dbqcjcnaam" ON "qti"."cn_slot" IS 'key CnSlot(package, path, start, the index of the family CnCount.parts)';

COMMENT ON CONSTRAINT "__cn_slot_key_package_path_start_predecessor_parts_6cbqntaxth" ON "qti"."cn_slot" IS 'key CnSlot(package, path, start, the predecessor of the index of the family CnCount.parts)';

COMMENT ON CONSTRAINT "__document_id_key_package_path_index_ids_sf63vjwwfz" ON "qti"."document_id" IS 'key DocumentId(package, path, the index of the family Document.ids)';

COMMENT ON CONSTRAINT "__document_id_key_package_path_predecessor_ids_sojprelbuz" ON "qti"."document_id" IS 'key DocumentId(package, path, the predecessor of the index of the family Document.ids)';

COMMENT ON CONSTRAINT "__fragment_context_name_key_package_path_index_vcva7sy76v" ON "qti"."fragment_context_name" IS 'key FragmentContextName(package, path, the index of the family ReferringDocument.contexts)';

COMMENT ON CONSTRAINT "__fragment_context_name_key_package_path_predecessor_4ip2dcv7tx" ON "qti"."fragment_context_name" IS 'key FragmentContextName(package, path, the predecessor of the index of the family ReferringDocument.contexts)';

COMMENT ON CONSTRAINT "__fragment_context_ref_key_package_assembly_instance_iwwx7fd3as" ON "qti"."fragment_context_ref" IS 'key FragmentContextRef(package, assembly, instance, the index of the family FragmentScope.contexts)';

COMMENT ON CONSTRAINT "__fragment_context_ref_key_package_assembly_instance_pj73zlykcq" ON "qti"."fragment_context_ref" IS 'key FragmentContextRef(package, assembly, instance, the predecessor of the index of the family FragmentScope.contexts)';

COMMENT ON CONSTRAINT "__fragment_feedback_name_key_package_path_index_ptaf4a5rcy" ON "qti"."fragment_feedback_name" IS 'key FragmentFeedbackName(package, path, the index of the family ReferringDocument.feedbacks)';

COMMENT ON CONSTRAINT "__fragment_feedback_name_key_package_path_hihn4nkoij" ON "qti"."fragment_feedback_name" IS 'key FragmentFeedbackName(package, path, the predecessor of the index of the family ReferringDocument.feedbacks)';

COMMENT ON CONSTRAINT "__fragment_feedback_ref_key_package_assembly_hzeb5vdkrv" ON "qti"."fragment_feedback_ref" IS 'key FragmentFeedbackRef(package, assembly, instance, the index of the family FragmentScope.feedbacks)';

COMMENT ON CONSTRAINT "__fragment_feedback_ref_key_package_assembly_4ricrcywdl" ON "qti"."fragment_feedback_ref" IS 'key FragmentFeedbackRef(package, assembly, instance, the predecessor of the index of the family FragmentScope.feedbacks)';

COMMENT ON CONSTRAINT "__fragment_printed_name_key_package_path_index_5eg62qthun" ON "qti"."fragment_printed_name" IS 'key FragmentPrintedName(package, path, the index of the family ReferringDocument.prints)';

COMMENT ON CONSTRAINT "__fragment_printed_name_key_package_path_predecessor_qtow56dwel" ON "qti"."fragment_printed_name" IS 'key FragmentPrintedName(package, path, the predecessor of the index of the family ReferringDocument.prints)';

COMMENT ON CONSTRAINT "__fragment_printed_ref_key_package_assembly_instance_tm3cv67vqp" ON "qti"."fragment_printed_ref" IS 'key FragmentPrintedRef(package, assembly, instance, the index of the family FragmentScope.prints)';

COMMENT ON CONSTRAINT "__fragment_printed_ref_key_package_assembly_instance_xutrjap2uj" ON "qti"."fragment_printed_ref" IS 'key FragmentPrintedRef(package, assembly, instance, the predecessor of the index of the family FragmentScope.prints)';

COMMENT ON CONSTRAINT "__fragment_template_name_key_package_path_index_oudiqn53er" ON "qti"."fragment_template_name" IS 'key FragmentTemplateName(package, path, the index of the family ReferringDocument.templates)';

COMMENT ON CONSTRAINT "__fragment_template_name_key_package_path_7nr2kxlss4" ON "qti"."fragment_template_name" IS 'key FragmentTemplateName(package, path, the predecessor of the index of the family ReferringDocument.templates)';

COMMENT ON CONSTRAINT "__fragment_template_ref_key_package_assembly_3vtxoh5dvi" ON "qti"."fragment_template_ref" IS 'key FragmentTemplateRef(package, assembly, instance, the index of the family FragmentScope.templates)';

COMMENT ON CONSTRAINT "__fragment_template_ref_key_package_assembly_ic23um6onc" ON "qti"."fragment_template_ref" IS 'key FragmentTemplateRef(package, assembly, instance, the predecessor of the index of the family FragmentScope.templates)';

COMMENT ON CONSTRAINT "__hottext_key_package_path_index_hottexts_24tbfvbp23" ON "qti"."hottext" IS 'key Hottext(package, path, the index of the family Document.hottexts)';

COMMENT ON CONSTRAINT "__hottext_key_package_path_predecessor_hottexts_gpj2hclfyb" ON "qti"."hottext" IS 'key Hottext(package, path, the predecessor of the index of the family Document.hottexts)';

COMMENT ON CONSTRAINT "__idref_key_package_path_start_name_pred_at_k2gcbywk7v" ON "qti"."idref" IS 'key Idref(package, path, start, name, pred(at))';

COMMENT ON CONSTRAINT "__idref_target_key_package_path_index_idref_targets_su7afnim7y" ON "qti"."idref_target" IS 'key IdrefTarget(package, path, the index of the family Document.idrefTargets)';

COMMENT ON CONSTRAINT "__idref_target_key_package_path_predecessor_idref_i4wnpntxzu" ON "qti"."idref_target" IS 'key IdrefTarget(package, path, the predecessor of the index of the family Document.idrefTargets)';

COMMENT ON CONSTRAINT "__instance_key_package_assembly_parent_at_rjuzwko4n2" ON "qti"."instance" IS 'key Instance(package, assembly, parent where Logic.gt(start, 0n), at)';

COMMENT ON CONSTRAINT "__instance_key_package_assembly_parent_at_end_lmrwv23lih" ON "qti"."instance" IS 'key Instance(package, assembly, parent where Logic.gt(start, 0n), at, end)';

COMMENT ON CONSTRAINT "__instance_key_package_assembly_parent_pred_at_4jeeswzwre" ON "qti"."instance" IS 'key Instance(package, assembly, parent where Logic.gt(start, 0n), pred(at))';

COMMENT ON CONSTRAINT "__instance_key_package_document_index_instances_dzkenbo2iw" ON "qti"."instance" IS 'key Instance(package, document, the index of the family AssembledDocument.instances)';

COMMENT ON CONSTRAINT "__instance_key_package_document_predecessor_cq4wbc4ks4" ON "qti"."instance" IS 'key Instance(package, document, the predecessor of the index of the family AssembledDocument.instances)';

COMMENT ON CONSTRAINT "__instance_key_package_document_z4qcwojwcm" ON "qti"."instance" IS 'key Instance(package where Logic.eq(start, 0n), document)';

COMMENT ON CONSTRAINT "__instance_key_package_assembly_parent_site_d6xanjcvct" ON "qti"."instance" IS 'key Instance(package where Logic.gt(start, 0n), assembly, parent, site)';

COMMENT ON CONSTRAINT "__interaction_attribute_key_package_path_d24yaqymgd" ON "qti"."interaction_attribute" IS 'key InteractionAttribute(package where Logic.or(Logic.eq(Crypto.sha256("1"), valueDigest), Logic.eq(Crypto.sha256("true"), valueDigest)) and Logic.eq(kind, "qti-assessment-item") and Logic.eq(name, "adaptive"), path)';

COMMENT ON CONSTRAINT "__item_mode_key_package_path_jm5fxkgpbj" ON "qti"."item_mode" IS 'key ItemMode(package where Logic.eq(adaptive, true), path)';

COMMENT ON CONSTRAINT "__math_align_group_key_package_path_cell_index_cwl2hxhbqs" ON "qti"."math_align_group" IS 'key MathAlignGroup(package, path, cell, the index of the family MathCell.groups)';

COMMENT ON CONSTRAINT "__math_align_group_key_package_path_cell_predecessor_sv7lp335e4" ON "qti"."math_align_group" IS 'key MathAlignGroup(package, path, cell, the predecessor of the index of the family MathCell.groups)';

COMMENT ON CONSTRAINT "__node_key_package_path_parent_at_nwdop676ro" ON "qti"."node" IS 'key Node(package, path, parent where Logic.gt(start, 0n), at)';

COMMENT ON CONSTRAINT "__node_key_package_path_parent_at_end_after_children_p32ki7wnc6" ON "qti"."node" IS 'key Node(package, path, parent where Logic.gt(start, 0n), at, end, the accumulator after plane 0 of the fold __node_children_count_fold_mue4fqjorm over the family Node.children, the accumulator after plane 0 of the fold __node_children_count_fold_fmibs64zod over the family Node.children, elements, charsAfterDigest, state)';

COMMENT ON CONSTRAINT "__node_key_package_path_parent_pred_at_e2zyuwfurj" ON "qti"."node" IS 'key Node(package, path, parent where Logic.gt(start, 0n), pred(at))';

COMMENT ON CONSTRAINT "__node_key_package_path_parent_state_djsbcozcyq" ON "qti"."node" IS 'key Node(package where Logic.not(Logic.in(kind, ["comment", "doctype", "document", "entityRef", "pi", "text", "ws"])) and Logic.eq(Bits.subset(Bits.singleton(state), Capped.row(parentKind)), true) and Logic.gt(start, 0n), path, parent, state)';

COMMENT ON CONSTRAINT "__node_key_package_path_start_dn7spvnjad" ON "qti"."node" IS 'key Node(package where Logic.in(kind, ["qti-associate-interaction", "qti-choice-interaction", "qti-custom-interaction", "qti-drawing-interaction", "qti-end-attempt-interaction", "qti-extended-text-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-inline-choice-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-portable-custom-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-slider-interaction", "qti-text-entry-interaction", "qti-upload-interaction"]) and Logic.eq(Bits.disjoint(ancestry, Enters.row("qti-feedback-block")), true), path, start)';

COMMENT ON CONSTRAINT "__node_key_package_path_start_7m4qykmkxg" ON "qti"."node" IS 'key Node(package where Logic.eq(Bits.subset(Bits.singleton(AttributeGrammar.at("slot", AttributeModelOf.at("model", governor), "baseType")), attrs), true) and Logic.eq(Bits.subset(Bits.singleton(AttributeGrammar.at("slot", AttributeModelOf.at("model", governor), "fieldIdentifier")), attrs), true) and Logic.eq(kind, "ud:value"), path, start)';

COMMENT ON CONSTRAINT "__node_key_package_path_parent_jhawkbuquo" ON "qti"."node" IS 'key Node(package where Logic.eq(kind, "qti-interaction-modules") and Logic.eq(parentKind, "qti-portable-custom-interaction"), path, parent)';

COMMENT ON CONSTRAINT "__open_attribute_key_package_path_start_index_open_z6aawsoy6g" ON "qti"."open_attribute" IS 'key OpenAttribute(package, path, start, the index of the family Node.openAttributes)';

COMMENT ON CONSTRAINT "__open_attribute_key_package_path_start_predecessor_os5w2cwpyl" ON "qti"."open_attribute" IS 'key OpenAttribute(package, path, start, the predecessor of the index of the family Node.openAttributes)';

COMMENT ON CONSTRAINT "__pci_module_form_key_package_path_start_index_jloyddgmsp" ON "qti"."pci_module_form" IS 'key PciModuleForm(package, path, start, the index of the family Interaction.moduleForms)';

COMMENT ON CONSTRAINT "__pci_module_form_key_package_path_start_predecessor_v3gzsahjpb" ON "qti"."pci_module_form" IS 'key PciModuleForm(package, path, start, the predecessor of the index of the family Interaction.moduleForms)';

COMMENT ON CONSTRAINT "__placed_binding_key_package_assembly_instance_index_rw745ssmul" ON "qti"."placed_binding" IS 'key PlacedBinding(package, assembly, instance, the index of the family Instance.bindings)';

COMMENT ON CONSTRAINT "__placed_binding_key_package_assembly_instance_prcf6gxoan" ON "qti"."placed_binding" IS 'key PlacedBinding(package, assembly, instance, the predecessor of the index of the family Instance.bindings)';

COMMENT ON CONSTRAINT "__placed_choice_key_package_assembly_instance_index_k3zshn6wrl" ON "qti"."placed_choice" IS 'key PlacedChoice(package, assembly, instance, the index of the family Instance.choices)';

COMMENT ON CONSTRAINT "__placed_choice_key_package_assembly_instance_5rxktl6n2n" ON "qti"."placed_choice" IS 'key PlacedChoice(package, assembly, instance, the predecessor of the index of the family Instance.choices)';

COMMENT ON CONSTRAINT "__placed_hottext_key_package_assembly_instance_index_6japq2avdu" ON "qti"."placed_hottext" IS 'key PlacedHottext(package, assembly, instance, the index of the family Instance.hottexts)';

COMMENT ON CONSTRAINT "__placed_hottext_key_package_assembly_instance_6nv2oy2lqi" ON "qti"."placed_hottext" IS 'key PlacedHottext(package, assembly, instance, the predecessor of the index of the family Instance.hottexts)';

COMMENT ON CONSTRAINT "__placed_id_key_package_assembly_instance_index_ids_mcwlm72pbw" ON "qti"."placed_id" IS 'key PlacedId(package, assembly, instance, the index of the family Instance.ids)';

COMMENT ON CONSTRAINT "__placed_id_key_package_assembly_instance_jflttt7jot" ON "qti"."placed_id" IS 'key PlacedId(package, assembly, instance, the predecessor of the index of the family Instance.ids)';

COMMENT ON CONSTRAINT "__placed_idref_key_package_assembly_instance_index_s62mjbr4qm" ON "qti"."placed_idref" IS 'key PlacedIdref(package, assembly, instance, the index of the family Instance.idrefTargets)';

COMMENT ON CONSTRAINT "__placed_idref_key_package_assembly_instance_i65oxm7bvf" ON "qti"."placed_idref" IS 'key PlacedIdref(package, assembly, instance, the predecessor of the index of the family Instance.idrefTargets)';

COMMENT ON CONSTRAINT "__placed_share_target_key_package_path_start_index_rf42kjvj6r" ON "qti"."placed_share_target" IS 'key PlacedShareTarget(package, path, start, the index of the family ShareFragment.placements)';

COMMENT ON CONSTRAINT "__placed_share_target_key_package_path_start_s5ueouerl5" ON "qti"."placed_share_target" IS 'key PlacedShareTarget(package, path, start, the predecessor of the index of the family ShareFragment.placements)';

COMMENT ON CONSTRAINT "__site_target_key_package_path_index_targets_fuqqcc23wl" ON "qti"."site_target" IS 'key SiteTarget(package, path, the index of the family AssembledDocument.targets)';

COMMENT ON CONSTRAINT "__site_target_key_package_path_index_targets_after_kxfmsfayyz" ON "qti"."site_target" IS 'key SiteTarget(package, path, the index of the family AssembledDocument.targets, the accumulator after plane 0 of the fold __assembled_document_targets_count_fold_gzgl372iau over the family AssembledDocument.targets)';

COMMENT ON CONSTRAINT "__site_target_key_package_path_predecessor_targets_6qaxjr4qpb" ON "qti"."site_target" IS 'key SiteTarget(package, path, the predecessor of the index of the family AssembledDocument.targets)';

COMMENT ON CONSTRAINT "__site_target_key_package_target_index_targeted_by_djiurheeeu" ON "qti"."site_target" IS 'key SiteTarget(package, target, the index of the family Document.targetedBy)';

COMMENT ON CONSTRAINT "__site_target_key_package_target_index_targeted_by_cjbgdj2smu" ON "qti"."site_target" IS 'key SiteTarget(package, target, the index of the family Document.targetedBy, the accumulator after plane 0 of the fold __document_targeted_by_or_fold_q6g4eocaf6 over the family Document.targetedBy)';

COMMENT ON CONSTRAINT "__site_target_key_package_target_predecessor_du2dhelnpq" ON "qti"."site_target" IS 'key SiteTarget(package, target, the predecessor of the index of the family Document.targetedBy)';

COMMENT ON CONSTRAINT "__srcset_candidate_key_package_path_start_pred_at_jpgatxsojn" ON "qti"."srcset_candidate" IS 'key SrcsetCandidate(package, path, start, pred(at))';

COMMENT ON CONSTRAINT "__text_idref_key_package_path_start_pred_at_bulfzlj2w4" ON "qti"."text_idref" IS 'key TextIdref(package, path, start, pred(at))';

COMMENT ON CONSTRAINT "__tolerance_token_key_package_path_start_pred_at_mza72eqsyy" ON "qti"."tolerance_token" IS 'key ToleranceToken(package, path, start, pred(at))';

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

COMMENT ON CONSTRAINT "__hottext_check_hottext_counted_document_hottexts_6an6nanofo" ON "qti"."hottext" IS 'check of Hottext for law counted Hottext(package, path) in fin(Document, hottexts)';

COMMENT ON CONSTRAINT "__idref_check_idref_ordered_attribute_idrefs_dngnqz5hg2" ON "qti"."idref" IS 'check of Idref for law ordered Idref(package, path, start, name, at) in fin(Attribute, idrefs)';

COMMENT ON CONSTRAINT "__idref_target_check_idref_target_counted_document_ieoj5xme2t" ON "qti"."idref_target" IS 'check of IdrefTarget for law counted IdrefTarget(package, path) in fin(Document, idrefTargets)';

COMMENT ON CONSTRAINT "__instance_check_instance_counted_assembled_document_mm6gw32hj4" ON "qti"."instance" IS 'check of Instance for law counted Instance(package, document) in fin(AssembledDocument, instances)';

COMMENT ON CONSTRAINT "__instance_check_instance_tree_children_cuixhk4vee" ON "qti"."instance" IS 'check of Instance for law tree Instance(package, assembly, parent, at) in fin(Instance, children)';

COMMENT ON CONSTRAINT "__math_align_group_check_math_align_group_counted_z272yxux7p" ON "qti"."math_align_group" IS 'check of MathAlignGroup for law counted MathAlignGroup(package, path, cell) in fin(MathCell, groups)';

COMMENT ON CONSTRAINT "__node_check_node_children_count_fold_igxdzwlhcu" ON "qti"."node" IS 'check of Node for law count fold over fin(Node, children) of Node(package, path, parent) where Logic.not(Logic.in(kind, ["comment", "doctype", "document", "entityRef", "pi", "text", "ws"])) and BarredOf.has(parentKind) and Logic.eq(BarredOf.at("position", parentKind), state) and Logic.gt(start, 0n) into Node(package, path, start, barredChildren)';

COMMENT ON CONSTRAINT "__node_check_node_children_count_fold_qmksp5dp7i" ON "qti"."node" IS 'check of Node for law count fold over fin(Node, children) of Node(package, path, parent) where Logic.not(Logic.in(kind, ["comment", "doctype", "document", "entityRef", "pi", "text", "ws"])) and CountedOf.has(parentKind) and Logic.eq(CountedOf.at("position", parentKind), state) and Logic.gt(start, 0n) into Node(package, path, start, countedChildren)';

COMMENT ON CONSTRAINT "__node_check_node_tree_children_odpafljdfb" ON "qti"."node" IS 'check of Node for law tree Node(package, path, parent, at) in fin(Node, children)';

COMMENT ON CONSTRAINT "__open_attribute_check_open_attribute_counted_node_nyu4tiwgdg" ON "qti"."open_attribute" IS 'check of OpenAttribute for law counted OpenAttribute(package, path, start) in fin(Node, openAttributes)';

COMMENT ON CONSTRAINT "__pci_module_form_check_pci_module_form_counted_dvbz7vgyvn" ON "qti"."pci_module_form" IS 'check of PciModuleForm for law counted PciModuleForm(package, path, start) in fin(Interaction, moduleForms)';

COMMENT ON CONSTRAINT "__placed_binding_check_placed_binding_counted_y4bnwgxb67" ON "qti"."placed_binding" IS 'check of PlacedBinding for law counted PlacedBinding(package, assembly, instance) in fin(Instance, bindings)';

COMMENT ON CONSTRAINT "__placed_choice_check_placed_choice_counted_instance_p77ar7qzt4" ON "qti"."placed_choice" IS 'check of PlacedChoice for law counted PlacedChoice(package, assembly, instance) in fin(Instance, choices)';

COMMENT ON CONSTRAINT "__placed_hottext_check_placed_hottext_counted_76ts7bnxah" ON "qti"."placed_hottext" IS 'check of PlacedHottext for law counted PlacedHottext(package, assembly, instance) in fin(Instance, hottexts)';

COMMENT ON CONSTRAINT "__placed_id_check_placed_id_counted_instance_ids_ioh5khi7rn" ON "qti"."placed_id" IS 'check of PlacedId for law counted PlacedId(package, assembly, instance) in fin(Instance, ids)';

COMMENT ON CONSTRAINT "__placed_idref_check_placed_idref_counted_instance_klniarooko" ON "qti"."placed_idref" IS 'check of PlacedIdref for law counted PlacedIdref(package, assembly, instance) in fin(Instance, idrefTargets)';

COMMENT ON CONSTRAINT "__placed_share_target_check_placed_share_target_cwmdmabbb2" ON "qti"."placed_share_target" IS 'check of PlacedShareTarget for law counted PlacedShareTarget(package, path, start) in fin(ShareFragment, placements)';

COMMENT ON CONSTRAINT "__site_target_check_site_target_counted_assembled_6ojqzgtd2t" ON "qti"."site_target" IS 'check of SiteTarget for law counted SiteTarget(package, path) in fin(AssembledDocument, targets)';

COMMENT ON CONSTRAINT "__site_target_check_site_target_counted_document_kfrthg33zp" ON "qti"."site_target" IS 'check of SiteTarget for law counted SiteTarget(package, target) in fin(Document, targetedBy)';

COMMENT ON CONSTRAINT "__site_target_check_assembled_document_targets_count_rhi722csjd" ON "qti"."site_target" IS 'check of SiteTarget for law count fold over fin(AssembledDocument, targets) of SiteTarget(package, path) where Logic.eq(places, true) into AssembledDocument(package, path, sites)';

COMMENT ON CONSTRAINT "__site_target_check_document_targeted_by_or_fold_s2xbwdcrnh" ON "qti"."site_target" IS 'check of SiteTarget for law or fold over fin(Document, targetedBy) of SiteTarget(package, target, ancestry) into Document(package, path, context)';

COMMENT ON CONSTRAINT "__srcset_candidate_check_srcset_candidate_ordered_muwkwohqto" ON "qti"."srcset_candidate" IS 'check of SrcsetCandidate for law ordered SrcsetCandidate(package, path, start, at) in fin(Srcset, tokens)';

COMMENT ON CONSTRAINT "__text_idref_check_text_idref_ordered_identity_text_j6a2rgc35g" ON "qti"."text_idref" IS 'check of TextIdref for law ordered TextIdref(package, path, start, at) in fin(IdentityText, tokens)';

COMMENT ON CONSTRAINT "__tolerance_token_check_tolerance_token_ordered_sre6vd24dn" ON "qti"."tolerance_token" IS 'check of ToleranceToken for law ordered ToleranceToken(package, path, start, at) in fin(Tolerance, tokens)';

COMMENT ON CONSTRAINT "__assembled_document_fk_package_path_pred_instances_opgs5mrscf" ON "qti"."assembled_document" IS 'foreign key AssembledDocument(package, path, pred(instances)) to Instance(package, document, the index of the family AssembledDocument.instances)';

COMMENT ON CONSTRAINT "__assembled_document_fk_package_path_pred_targets_excdxg6pge" ON "qti"."assembled_document" IS 'foreign key AssembledDocument(package, path, pred(targets), sites) to SiteTarget(package, path, the index of the family AssembledDocument.targets, the accumulator after plane 0 of the fold __assembled_document_targets_count_fold_gzgl372iau over the family AssembledDocument.targets)';

COMMENT ON CONSTRAINT "__attribute_fk_package_path_start_name_pred_idrefs_xpy7rwj32j" ON "qti"."attribute" IS 'foreign key Attribute(package, path, start, name, pred(idrefs), idrefTextDigest) to Idref(package, path, start, name, at, piecesAfterDigest)';

COMMENT ON CONSTRAINT "__attribute_fk_package_path_start_copy_attributes_piufxgjpuc" ON "qti"."attribute" IS 'foreign key Attribute(package, path, start, the owner''s count of the family Node.attributes, governor, kind, parent) to Node(package, path, start, attributes, governor, kind, parent)';

COMMENT ON CONSTRAINT "__attribute_fk_package_path_start_predecessor_kwcw7ok3kp" ON "qti"."attribute" IS 'foreign key Attribute(package, path, start, the predecessor of the index of the family Node.attributes, the accumulator before plane 0 of the fold __node_attributes_or_fold_qjtccpaklg over the family Node.attributes) to Attribute(package, path, start, the index of the family Node.attributes, the accumulator after plane 0 of the fold __node_attributes_or_fold_qjtccpaklg over the family Node.attributes)';

COMMENT ON CONSTRAINT "__attribute_fk_package_path_start_name_ykxtejlb7g" ON "qti"."attribute" IS 'foreign key Attribute(package where Logic.in(kind, ["qti-any-n", "qti-correct", "qti-default", "qti-equal-rounded", "qti-index", "qti-lookup-outcome-value", "qti-map-response", "qti-map-response-point", "qti-pattern-match", "qti-random-float", "qti-random-integer", "qti-repeat", "qti-round-to", "qti-set-correct-response", "qti-set-default-value", "qti-set-outcome-value", "qti-set-template-value", "qti-variable"]) and Logic.or(Logic.and(Logic.or(Logic.not(Text.matches(lexical, Text.pattern(<language 09b97c6fe613e598d9cf5ca30b8c43c11c5473e4a711d4d45e6270278a6683d0>))), Logic.not(Logic.eq(kind, "qti-random-float"))), Text.matches(lexical, Text.pattern(<language dbce2bac939b8d15f3f6b873394359a57b42b74412cfab08f44671682d0447ad>)), Logic.eq(VariableReference.at("spelling", kind, name), "bare")), Logic.and(Text.matches(lexical, Text.pattern(<language 47716b2482bfc820077d0844275d18cfdc3c12bc3eea5af5832ffaf0ed8f0bb2>)), Logic.eq(VariableReference.at("spelling", kind, name), "braced"))) and Logic.eq(Bits.subset(Bits.singleton(name), VariableReference.row(kind)), true), path, start, name) to VariableRef(package, path, start, attribute)';

COMMENT ON CONSTRAINT "__attribute_entity_fk_package_path_start_name_mzkbpjqrfj" ON "qti"."attribute_entity" IS 'foreign key AttributeEntity(package, path, start, name) to Attribute(package, path, start, name)';

COMMENT ON CONSTRAINT "__binding_name_fk_package_path_copy_bindings_sb6am7l6sh" ON "qti"."binding_name" IS 'foreign key BindingName(package, path, the owner''s count of the family Document.bindings) to Document(package, path, bindings)';

COMMENT ON CONSTRAINT "__binding_name_fk_package_path_predecessor_bindings_livsfb6g7c" ON "qti"."binding_name" IS 'foreign key BindingName(package, path, the predecessor of the index of the family Document.bindings) to BindingName(package, path, the index of the family Document.bindings)';

COMMENT ON CONSTRAINT "__bound_variable_fk_package_path_adaptive_o67xwxciik" ON "qti"."bound_variable" IS 'foreign key BoundVariable(package, path, adaptive) to ItemMode(package, path, adaptive)';

COMMENT ON CONSTRAINT "__bound_variable_fk_package_path_start_dl2i2rfart" ON "qti"."bound_variable" IS 'foreign key BoundVariable(package where Logic.eq(adaptive, false) and Logic.eq(attribute, "response-identifier"), path, start) to Node(package where Logic.in(kind, ["qti-associate-interaction", "qti-choice-interaction", "qti-custom-interaction", "qti-drawing-interaction", "qti-end-attempt-interaction", "qti-extended-text-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-inline-choice-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-portable-custom-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-slider-interaction", "qti-text-entry-interaction", "qti-upload-interaction"]) and Logic.eq(Bits.disjoint(ancestry, Enters.row("qti-feedback-block")), true), path, start)';

COMMENT ON CONSTRAINT "__candidate_path_fk_package_target_aynqp2vyvf" ON "qti"."candidate_path" IS 'foreign key CandidatePath(package, target) to Entry(package, path)';

COMMENT ON CONSTRAINT "__catalog_scope_fk_package_path_start_naheth2be3" ON "qti"."catalog_scope" IS 'foreign key CatalogScope(package, path, start) to Node(package, path, start)';

COMMENT ON CONSTRAINT "__cell_leaf_fk_package_path_cell_copy_leaves_ikzmqguvf6" ON "qti"."cell_leaf" IS 'foreign key CellLeaf(package, path, cell, the owner''s count of the family MathCell.leaves) to MathCell(package, path, start, leaves)';

COMMENT ON CONSTRAINT "__cell_leaf_fk_package_path_cell_pred_at_start_was_zhwbeepi6v" ON "qti"."cell_leaf" IS 'foreign key CellLeaf(package, path, cell, pred(at), startWas) to CellLeaf(package, path, cell, at, startAfter)';

COMMENT ON CONSTRAINT "__cell_leaf_fk_package_path_start_cell_s2bln45e52" ON "qti"."cell_leaf" IS 'foreign key CellLeaf(package, path, start, cell) to MathAlignScope(package, path, start, cell)';

COMMENT ON CONSTRAINT "__choice_fk_package_path_start_hjjl442vss" ON "qti"."choice" IS 'foreign key Choice(package, path, start) to ChoiceInteraction(package, path, start)';

COMMENT ON CONSTRAINT "__choice_fk_package_path_start_kind_wg4x5yucb4" ON "qti"."choice" IS 'foreign key Choice(package, path, start, kind) to Node(package, path, start, kind)';

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

COMMENT ON CONSTRAINT "__data_ssml_property_fk_package_path_start_member_dzuml2d45r" ON "qti"."data_ssml_property" IS 'foreign key DataSsmlProperty(package, path, start, member, memberNameDigest) to DataSsmlMember(package, path, start, at, memberDigest)';

COMMENT ON CONSTRAINT "__document_fk_package_path_pred_bindings_fouafod5y7" ON "qti"."document" IS 'foreign key Document(package, path, pred(bindings)) to BindingName(package, path, the index of the family Document.bindings)';

COMMENT ON CONSTRAINT "__document_fk_package_path_pred_choices_yrbwq6r4hb" ON "qti"."document" IS 'foreign key Document(package, path, pred(choices)) to Choice(package, path, the index of the family Document.choices)';

COMMENT ON CONSTRAINT "__document_fk_package_path_pred_hottexts_tikqfwhnnb" ON "qti"."document" IS 'foreign key Document(package, path, pred(hottexts)) to Hottext(package, path, the index of the family Document.hottexts)';

COMMENT ON CONSTRAINT "__document_fk_package_path_pred_idref_targets_xdiawwndk2" ON "qti"."document" IS 'foreign key Document(package, path, pred(idrefTargets)) to IdrefTarget(package, path, the index of the family Document.idrefTargets)';

COMMENT ON CONSTRAINT "__document_fk_package_path_pred_ids_qkiqwhoec7" ON "qti"."document" IS 'foreign key Document(package, path, pred(ids)) to DocumentId(package, path, the index of the family Document.ids)';

COMMENT ON CONSTRAINT "__document_fk_package_path_pred_targeted_by_context_m3g2fumgub" ON "qti"."document" IS 'foreign key Document(package, path, pred(targetedBy), context) to SiteTarget(package, target, the index of the family Document.targetedBy, the accumulator after plane 0 of the fold __document_targeted_by_or_fold_q6g4eocaf6 over the family Document.targetedBy)';

COMMENT ON CONSTRAINT "__document_id_fk_package_path_copy_ids_gen3ajva7g" ON "qti"."document_id" IS 'foreign key DocumentId(package, path, the owner''s count of the family Document.ids) to Document(package, path, ids)';

COMMENT ON CONSTRAINT "__document_id_fk_package_path_predecessor_ids_yyr2sqg3ac" ON "qti"."document_id" IS 'foreign key DocumentId(package, path, the predecessor of the index of the family Document.ids) to DocumentId(package, path, the index of the family Document.ids)';

COMMENT ON CONSTRAINT "__element_type_fk_package_path_start_kind_governor_uciwknlvpy" ON "qti"."element_type" IS 'foreign key ElementType(package, path, start, kind, governor) to Node(package, path, start, kind, governor)';

COMMENT ON CONSTRAINT "__encoding_decl_fk_package_path_u5grbt7fag" ON "qti"."encoding_decl" IS 'foreign key EncodingDecl(package, path) to XmlDecl(package, path)';

COMMENT ON CONSTRAINT "__entry_fk_package_xbbjcsgg4p" ON "qti"."entry" IS 'foreign key Entry(package) to Package(package)';

COMMENT ON CONSTRAINT "__expression_fk_package_path_start_f6hwlqhv67" ON "qti"."expression" IS 'foreign key Expression(package, path, start) to Node(package, path, start)';

COMMENT ON CONSTRAINT "__file_path_fk_package_target_hhxwhmydt7" ON "qti"."file_path" IS 'foreign key FilePath(package, target) to Entry(package, path)';

COMMENT ON CONSTRAINT "__fragment_context_name_fk_package_path_copy_i7tr226g4e" ON "qti"."fragment_context_name" IS 'foreign key FragmentContextName(package, path, the owner''s count of the family ReferringDocument.contexts) to ReferringDocument(package, path, contexts)';

COMMENT ON CONSTRAINT "__fragment_context_name_fk_package_path_predecessor_y4e2h4ueim" ON "qti"."fragment_context_name" IS 'foreign key FragmentContextName(package, path, the predecessor of the index of the family ReferringDocument.contexts) to FragmentContextName(package, path, the index of the family ReferringDocument.contexts)';

COMMENT ON CONSTRAINT "__fragment_context_ref_fk_package_assembly_instance_qmrvsw47a5" ON "qti"."fragment_context_ref" IS 'foreign key FragmentContextRef(package, assembly, instance, the owner''s count of the family FragmentScope.contexts, assemblyKind, path) to FragmentScope(package, assembly, instance, contexts, assemblyKind, document)';

COMMENT ON CONSTRAINT "__fragment_context_ref_fk_package_assembly_instance_4csn2nw3xk" ON "qti"."fragment_context_ref" IS 'foreign key FragmentContextRef(package, assembly, instance, the predecessor of the index of the family FragmentScope.contexts) to FragmentContextRef(package, assembly, instance, the index of the family FragmentScope.contexts)';

COMMENT ON CONSTRAINT "__fragment_context_ref_fk_package_path_start_7gg77fag7i" ON "qti"."fragment_context_ref" IS 'foreign key FragmentContextRef(package, path, start, attribute, kind, identifier) to FragmentContextName(package, path, start, attribute, kind, identifier)';

COMMENT ON CONSTRAINT "__fragment_feedback_name_fk_package_path_copy_abnu2mx63n" ON "qti"."fragment_feedback_name" IS 'foreign key FragmentFeedbackName(package, path, the owner''s count of the family ReferringDocument.feedbacks) to ReferringDocument(package, path, feedbacks)';

COMMENT ON CONSTRAINT "__fragment_feedback_name_fk_package_path_predecessor_ip2b5eqztt" ON "qti"."fragment_feedback_name" IS 'foreign key FragmentFeedbackName(package, path, the predecessor of the index of the family ReferringDocument.feedbacks) to FragmentFeedbackName(package, path, the index of the family ReferringDocument.feedbacks)';

COMMENT ON CONSTRAINT "__fragment_feedback_ref_fk_package_assembly_instance_nemmw63ril" ON "qti"."fragment_feedback_ref" IS 'foreign key FragmentFeedbackRef(package, assembly, instance, the owner''s count of the family FragmentScope.feedbacks, assemblyKind, path) to FragmentScope(package, assembly, instance, feedbacks, assemblyKind, document)';

COMMENT ON CONSTRAINT "__fragment_feedback_ref_fk_package_assembly_instance_msnpettsbl" ON "qti"."fragment_feedback_ref" IS 'foreign key FragmentFeedbackRef(package, assembly, instance, the predecessor of the index of the family FragmentScope.feedbacks) to FragmentFeedbackRef(package, assembly, instance, the index of the family FragmentScope.feedbacks)';

COMMENT ON CONSTRAINT "__fragment_feedback_ref_fk_package_path_start_zqzhu4uuhv" ON "qti"."fragment_feedback_ref" IS 'foreign key FragmentFeedbackRef(package, path, start, attribute, kind, identifier) to FragmentFeedbackName(package, path, start, attribute, kind, identifier)';

COMMENT ON CONSTRAINT "__fragment_printed_name_fk_package_path_copy_prints_v4qcbt44tb" ON "qti"."fragment_printed_name" IS 'foreign key FragmentPrintedName(package, path, the owner''s count of the family ReferringDocument.prints) to ReferringDocument(package, path, prints)';

COMMENT ON CONSTRAINT "__fragment_printed_name_fk_package_path_predecessor_srdzfslmhz" ON "qti"."fragment_printed_name" IS 'foreign key FragmentPrintedName(package, path, the predecessor of the index of the family ReferringDocument.prints) to FragmentPrintedName(package, path, the index of the family ReferringDocument.prints)';

COMMENT ON CONSTRAINT "__fragment_printed_ref_fk_package_assembly_instance_jwyp6pmicw" ON "qti"."fragment_printed_ref" IS 'foreign key FragmentPrintedRef(package, assembly, instance, the owner''s count of the family FragmentScope.prints, assemblyKind, path) to FragmentScope(package, assembly, instance, prints, assemblyKind, document)';

COMMENT ON CONSTRAINT "__fragment_printed_ref_fk_package_assembly_instance_aj65n7cdp2" ON "qti"."fragment_printed_ref" IS 'foreign key FragmentPrintedRef(package, assembly, instance, the predecessor of the index of the family FragmentScope.prints) to FragmentPrintedRef(package, assembly, instance, the index of the family FragmentScope.prints)';

COMMENT ON CONSTRAINT "__fragment_printed_ref_fk_package_path_start_6dmostd3ly" ON "qti"."fragment_printed_ref" IS 'foreign key FragmentPrintedRef(package, path, start, attribute, kind, identifier) to FragmentPrintedName(package, path, start, attribute, kind, identifier)';

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

COMMENT ON CONSTRAINT "__fragment_template_ref_fk_package_path_start_4qkjshzcvx" ON "qti"."fragment_template_ref" IS 'foreign key FragmentTemplateRef(package, path, start, attribute, kind, identifier) to FragmentTemplateName(package, path, start, attribute, kind, identifier)';

COMMENT ON CONSTRAINT "__hottext_fk_package_path_copy_hottexts_nqhkueuyyr" ON "qti"."hottext" IS 'foreign key Hottext(package, path, the owner''s count of the family Document.hottexts) to Document(package, path, hottexts)';

COMMENT ON CONSTRAINT "__hottext_fk_package_path_predecessor_hottexts_a3xph2z6lt" ON "qti"."hottext" IS 'foreign key Hottext(package, path, the predecessor of the index of the family Document.hottexts) to Hottext(package, path, the index of the family Document.hottexts)';

COMMENT ON CONSTRAINT "__identity_text_fk_package_path_start_vymux7o4os" ON "qti"."identity_text" IS 'foreign key IdentityText(package, path, start) to Node(package, path, start)';

COMMENT ON CONSTRAINT "__identity_text_fk_package_path_start_pred_tokens_hh4sfzdyuq" ON "qti"."identity_text" IS 'foreign key IdentityText(package, path, start, pred(tokens), tokenTextDigest) to TextIdref(package, path, start, at, piecesAfterDigest)';

COMMENT ON CONSTRAINT "__idref_fk_package_path_start_name_copy_idrefs_l3bwkzmy73" ON "qti"."idref" IS 'foreign key Idref(package, path, start, name, the owner''s count of the family Attribute.idrefs) to Attribute(package, path, start, name, idrefs)';

COMMENT ON CONSTRAINT "__idref_fk_package_path_start_name_pred_at_pieces_lq6twq4wvg" ON "qti"."idref" IS 'foreign key Idref(package, path, start, name, pred(at), piecesWasDigest) to Idref(package, path, start, name, at, piecesAfterDigest)';

COMMENT ON CONSTRAINT "__idref_fk_package_path_token_digest_qcgaf6b6v6" ON "qti"."idref" IS 'foreign key Idref(package, path, tokenDigest) to IdrefTarget(package, path, idDigest)';

COMMENT ON CONSTRAINT "__idref_target_fk_package_path_copy_idref_targets_gqcp4g6ar3" ON "qti"."idref_target" IS 'foreign key IdrefTarget(package, path, the owner''s count of the family Document.idrefTargets, assembled) to Document(package, path, idrefTargets, assembled)';

COMMENT ON CONSTRAINT "__idref_target_fk_package_path_predecessor_idref_bun7tb7rap" ON "qti"."idref_target" IS 'foreign key IdrefTarget(package, path, the predecessor of the index of the family Document.idrefTargets) to IdrefTarget(package, path, the index of the family Document.idrefTargets)';

COMMENT ON CONSTRAINT "__inclusion_fk_package_path_start_parent_kind_places_2557ifwq63" ON "qti"."inclusion" IS 'foreign key Inclusion(package, path, start, parentKind, places, root, splices) to SiteTarget(package, path, start, parentKind, places, targetRoot, splices)';

COMMENT ON CONSTRAINT "__instance_fk_package_assembly_start_pred_bindings_nxfqdzzza2" ON "qti"."instance" IS 'foreign key Instance(package, assembly, start, pred(bindings)) to PlacedBinding(package, assembly, instance, the index of the family Instance.bindings)';

COMMENT ON CONSTRAINT "__instance_fk_package_assembly_start_pred_children_36olkmoimr" ON "qti"."instance" IS 'foreign key Instance(package, assembly, start, pred(children), end) to Instance(package, assembly, parent where Logic.gt(start, 0n), at, end)';

COMMENT ON CONSTRAINT "__instance_fk_package_assembly_start_pred_choices_4hokoiprao" ON "qti"."instance" IS 'foreign key Instance(package, assembly, start, pred(choices)) to PlacedChoice(package, assembly, instance, the index of the family Instance.choices)';

COMMENT ON CONSTRAINT "__instance_fk_package_assembly_start_pred_hottexts_qsp2z6ey3g" ON "qti"."instance" IS 'foreign key Instance(package, assembly, start, pred(hottexts)) to PlacedHottext(package, assembly, instance, the index of the family Instance.hottexts)';

COMMENT ON CONSTRAINT "__instance_fk_package_assembly_start_pred_idref_hix6ikgvcl" ON "qti"."instance" IS 'foreign key Instance(package, assembly, start, pred(idrefTargets)) to PlacedIdref(package, assembly, instance, the index of the family Instance.idrefTargets)';

COMMENT ON CONSTRAINT "__instance_fk_package_assembly_start_pred_ids_zkgt72tuht" ON "qti"."instance" IS 'foreign key Instance(package, assembly, start, pred(ids)) to PlacedId(package, assembly, instance, the index of the family Instance.ids)';

COMMENT ON CONSTRAINT "__instance_fk_package_assembly_parent_copy_children_crejh3tfyf" ON "qti"."instance" IS 'foreign key Instance(package, assembly, parent where Logic.gt(start, 0n), the owner''s count of the family Instance.children, assemblyKind, siteDocument) to Instance(package, assembly, start, children, assemblyKind, document)';

COMMENT ON CONSTRAINT "__instance_fk_package_assembly_parent_pred_at_start_bmevtdvhp4" ON "qti"."instance" IS 'foreign key Instance(package, assembly, parent where Logic.gt(start, 0n), pred(at), start) to Instance(package, assembly, parent where Logic.gt(start, 0n), at, end)';

COMMENT ON CONSTRAINT "__instance_fk_package_document_ids_idref_targets_5z7ien5yku" ON "qti"."instance" IS 'foreign key Instance(package, document, ids, idrefTargets, choices, hottexts) to Document(package, path, ids, idrefTargets, choices, hottexts)';

COMMENT ON CONSTRAINT "__instance_fk_package_document_root_kind_hgvtyahpsw" ON "qti"."instance" IS 'foreign key Instance(package, document, rootKind) to Document(package, path, rootKind)';

COMMENT ON CONSTRAINT "__instance_fk_package_document_copy_instances_hbgbfu6nua" ON "qti"."instance" IS 'foreign key Instance(package, document, the owner''s count of the family AssembledDocument.instances, children) to AssembledDocument(package, path, instances, sites)';

COMMENT ON CONSTRAINT "__instance_fk_package_document_predecessor_instances_wdblc4jtmg" ON "qti"."instance" IS 'foreign key Instance(package, document, the predecessor of the index of the family AssembledDocument.instances) to Instance(package, document, the index of the family AssembledDocument.instances)';

COMMENT ON CONSTRAINT "__interaction_fk_package_path_start_wpfpdpxf37" ON "qti"."interaction" IS 'foreign key Interaction(package, path, start) to Node(package, path, start)';

COMMENT ON CONSTRAINT "__interaction_fk_package_path_start_pred_choices_zosgrzvvtu" ON "qti"."interaction" IS 'foreign key Interaction(package, path, start, pred(choices)) to ChoiceInteraction(package, interactionPath, interaction, the index of the family Interaction.choices)';

COMMENT ON CONSTRAINT "__interaction_fk_package_path_start_pred_module_d7kjlhcc36" ON "qti"."interaction" IS 'foreign key Interaction(package, path, start, pred(moduleForms)) to PciModuleForm(package, path, start, the index of the family Interaction.moduleForms)';

COMMENT ON CONSTRAINT "__interaction_attribute_fk_package_path_root_kind_ottpmnv3zo" ON "qti"."interaction_attribute" IS 'foreign key InteractionAttribute(package, path, rootKind) to Document(package, path, rootKind)';

COMMENT ON CONSTRAINT "__interaction_attribute_fk_package_path_start_name_o3m67tgbxx" ON "qti"."interaction_attribute" IS 'foreign key InteractionAttribute(package where Logic.not(Logic.in(rootKind, ["qti-assessment-item", "qti-assessment-test"])) and Logic.in(kind, ["qti-associable-hotspot", "qti-gap", "qti-gap-img", "qti-gap-text", "qti-hotspot-choice", "qti-hottext", "qti-inline-choice", "qti-simple-associable-choice", "qti-simple-choice", "qti-template-block", "qti-template-block.rubric", "qti-template-inline", "qti-template-inline.rubric", "qti-template-variable"]) and Text.matches(value, Text.pattern(<language 1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5>)) and Logic.eq(name, "template-identifier"), path, start, name, kind, value) to FragmentTemplateName(package, path, start, attribute, kind, identifier)';

COMMENT ON CONSTRAINT "__interaction_attribute_fk_package_path_start_name_odj7ajvoa3" ON "qti"."interaction_attribute" IS 'foreign key InteractionAttribute(package where Logic.not(Logic.in(rootKind, ["qti-assessment-item", "qti-assessment-test"])) and Logic.in(kind, ["qti-feedback-block", "qti-feedback-block.template", "qti-feedback-inline", "qti-modal-feedback", "qti-test-feedback"]) and Text.matches(value, Text.pattern(<language 1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5>)) and Logic.eq(name, "outcome-identifier"), path, start, name, kind, value) to FragmentFeedbackName(package, path, start, attribute, kind, identifier)';

COMMENT ON CONSTRAINT "__interaction_attribute_fk_package_path_start_name_nefkeuj36v" ON "qti"."interaction_attribute" IS 'foreign key InteractionAttribute(package where Logic.not(Logic.in(rootKind, ["qti-assessment-item", "qti-assessment-test"])) and Logic.or(Logic.and(Logic.in(name, ["base", "index"]), Logic.eq(kind, "qti-printed-variable")), Logic.and(Logic.eq(kind, "qti-printed-variable"), Logic.eq(name, "identifier"))) and Text.matches(value, Text.pattern(<language 1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5>)), path, start, name, kind, value) to FragmentPrintedName(package, path, start, attribute, kind, identifier)';

COMMENT ON CONSTRAINT "__interaction_attribute_fk_package_path_start_name_y34gihxvg3" ON "qti"."interaction_attribute" IS 'foreign key InteractionAttribute(package where Logic.not(Logic.in(rootKind, ["qti-assessment-item", "qti-assessment-test"])) and Text.matches(value, Text.pattern(<language 1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5>)) and Logic.eq(kind, "qti-context-variable") and Logic.eq(name, "identifier"), path, start, name, kind, value) to FragmentContextName(package, path, start, attribute, kind, identifier)';

COMMENT ON CONSTRAINT "__interaction_attribute_fk_package_path_start_name_aq6g74vnmy" ON "qti"."interaction_attribute" IS 'foreign key InteractionAttribute(package where Logic.in(kind, ["qti-associable-hotspot", "qti-gap", "qti-gap-img", "qti-gap-text", "qti-hotspot-choice", "qti-hottext", "qti-inline-choice", "qti-simple-associable-choice", "qti-simple-choice", "qti-template-block", "qti-template-block.rubric", "qti-template-inline", "qti-template-inline.rubric", "qti-template-variable"]) and Logic.in(rootKind, ["qti-assessment-item", "qti-assessment-test"]) and Text.matches(value, Text.pattern(<language 1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5>)) and Logic.eq(name, "template-identifier"), path, start, name, kind, rootKind, value) to TemplateRef(package, path, start, attribute, kind, assemblyKind, identifier)';

COMMENT ON CONSTRAINT "__interaction_attribute_fk_package_path_start_name_qs737qk6oz" ON "qti"."interaction_attribute" IS 'foreign key InteractionAttribute(package where Logic.in(kind, ["qti-associate-interaction", "qti-choice-interaction", "qti-custom-interaction", "qti-drawing-interaction", "qti-end-attempt-interaction", "qti-extended-text-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-inline-choice-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-portable-custom-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-slider-interaction", "qti-text-entry-interaction", "qti-upload-interaction"]) and Logic.in(name, ["response-identifier", "string-identifier"]) and Text.matches(value, Text.pattern(<language 1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5>)), path, start, name, value) to BindingName(package, path, start, attribute, identifier)';

COMMENT ON CONSTRAINT "__interaction_attribute_fk_package_path_start_name_llk67yupum" ON "qti"."interaction_attribute" IS 'foreign key InteractionAttribute(package where Logic.in(kind, ["qti-associate-interaction", "qti-choice-interaction", "qti-custom-interaction", "qti-drawing-interaction", "qti-end-attempt-interaction", "qti-extended-text-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-inline-choice-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-portable-custom-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-slider-interaction", "qti-text-entry-interaction", "qti-upload-interaction"]) and Logic.in(name, ["response-identifier", "string-identifier"]) and Text.matches(value, Text.pattern(<language 1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5>)) and Logic.eq(rootKind, "qti-assessment-item"), path, start, name, value) to BoundVariable(package, path, start, attribute, identifier)';

COMMENT ON CONSTRAINT "__interaction_attribute_fk_package_path_start_name_ervei6ym3k" ON "qti"."interaction_attribute" IS 'foreign key InteractionAttribute(package where Logic.in(kind, ["qti-feedback-block", "qti-feedback-block.template", "qti-feedback-inline", "qti-modal-feedback", "qti-test-feedback"]) and Logic.in(rootKind, ["qti-assessment-item", "qti-assessment-test"]) and Text.matches(value, Text.pattern(<language 1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5>)) and Logic.eq(name, "outcome-identifier"), path, start, name, kind, rootKind, value) to FeedbackRef(package, path, start, attribute, kind, assemblyKind, identifier)';

COMMENT ON CONSTRAINT "__interaction_attribute_fk_package_path_start_name_mlmmcfwe3t" ON "qti"."interaction_attribute" IS 'foreign key InteractionAttribute(package where Logic.in(rootKind, ["qti-assessment-item", "qti-assessment-test"]) and Logic.or(Logic.and(Logic.in(name, ["base", "index"]), Logic.eq(kind, "qti-printed-variable")), Logic.and(Logic.eq(kind, "qti-printed-variable"), Logic.eq(name, "identifier"))) and Text.matches(value, Text.pattern(<language 1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5>)), path, start, name, kind, rootKind, value) to PrintedVariableRef(package, path, start, attribute, kind, assemblyKind, identifier)';

COMMENT ON CONSTRAINT "__interaction_attribute_fk_package_path_start_name_rvobaq2zub" ON "qti"."interaction_attribute" IS 'foreign key InteractionAttribute(package where Logic.in(rootKind, ["qti-assessment-item", "qti-assessment-test"]) and Text.matches(value, Text.pattern(<language 1f335ef2a0b10539bafc696e614634ca0519a3abf062148ec047166baa617cb5>)) and Logic.eq(kind, "qti-context-variable") and Logic.eq(name, "identifier"), path, start, name, kind, rootKind, value) to ContextRef(package, path, start, attribute, kind, assemblyKind, identifier)';

COMMENT ON CONSTRAINT "__interaction_attribute_fk_package_path_nnor4wfvfx" ON "qti"."interaction_attribute" IS 'foreign key InteractionAttribute(package where Logic.or(Logic.eq(Crypto.sha256("1"), valueDigest), Logic.eq(Crypto.sha256("true"), valueDigest)) and Logic.eq(kind, "qti-assessment-item") and Logic.eq(name, "adaptive"), path) to ItemMode(package where Logic.eq(adaptive, true), path)';

COMMENT ON CONSTRAINT "__item_mode_fk_package_path_ho3tnecemv" ON "qti"."item_mode" IS 'foreign key ItemMode(package where Logic.eq(adaptive, true), path) to InteractionAttribute(package where Logic.or(Logic.eq(Crypto.sha256("1"), valueDigest), Logic.eq(Crypto.sha256("true"), valueDigest)) and Logic.eq(kind, "qti-assessment-item") and Logic.eq(name, "adaptive"), path)';

COMMENT ON CONSTRAINT "__label_use_fk_package_path_root_kind_5odzayuwy3" ON "qti"."label_use" IS 'foreign key LabelUse(package, path, rootKind) to Document(package, path, rootKind)';

COMMENT ON CONSTRAINT "__least_count_fk_package_path_start_vgly2zkjt2" ON "qti"."least_count" IS 'foreign key LeastCount(package, path, start) to CountBound(package, path, start)';

COMMENT ON CONSTRAINT "__literal_typed_fk_package_path_start_text_base_type_ovjb7lcxq5" ON "qti"."literal_typed" IS 'foreign key LiteralTyped(package, path, start, text, baseType) to Literal(package, path, start, text, baseType)';

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

COMMENT ON CONSTRAINT "__node_fk_package_path_start_pred_children_end_cnmpat5j2m" ON "qti"."node" IS 'foreign key Node(package, path, start, pred(children), end, barredChildren, countedChildren, elementChildren, stringValueDigest, lastState) to Node(package, path, parent where Logic.gt(start, 0n), at, end, the accumulator after plane 0 of the fold __node_children_count_fold_mue4fqjorm over the family Node.children, the accumulator after plane 0 of the fold __node_children_count_fold_fmibs64zod over the family Node.children, elements, charsAfterDigest, state)';

COMMENT ON CONSTRAINT "__node_fk_package_path_start_pred_open_attributes_khsm76hyrz" ON "qti"."node" IS 'foreign key Node(package, path, start, pred(openAttributes)) to OpenAttribute(package, path, start, the index of the family Node.openAttributes)';

COMMENT ON CONSTRAINT "__node_fk_package_path_parent_copy_children_parent_izis7cll4b" ON "qti"."node" IS 'foreign key Node(package, path, parent where Logic.gt(start, 0n), the owner''s count of the family Node.children, parentAncestry, parentGovernor, parentKind, parentNearest, parentNearestKind, parentNearestPath, parentParentKind) to Node(package, path, start, children, ancestry, governor, kind, nearest, nearestKind, nearestPath, parentKind)';

COMMENT ON CONSTRAINT "__node_fk_package_path_parent_pred_at_start_before_6abd6cvvat" ON "qti"."node" IS 'foreign key Node(package, path, parent where Logic.gt(start, 0n), pred(at), start, the accumulator before plane 0 of the fold __node_children_count_fold_mue4fqjorm over the family Node.children, the accumulator before plane 0 of the fold __node_children_count_fold_fmibs64zod over the family Node.children, elementsWas, charsWasDigest, was) to Node(package, path, parent where Logic.gt(start, 0n), at, end, the accumulator after plane 0 of the fold __node_children_count_fold_mue4fqjorm over the family Node.children, the accumulator after plane 0 of the fold __node_children_count_fold_fmibs64zod over the family Node.children, elements, charsAfterDigest, state)';

COMMENT ON CONSTRAINT "__node_fk_package_path_start_35fr4eeug5" ON "qti"."node" IS 'foreign key Node(package where Logic.eq(Bits.subset(Bits.singleton(AttributeGrammar.at("slot", AttributeModelOf.at("model", governor), "baseType")), attrs), true) and Logic.eq(Bits.subset(Bits.singleton(AttributeGrammar.at("slot", AttributeModelOf.at("model", governor), "fieldIdentifier")), attrs), true) and Logic.eq(kind, "ud:value"), path, start) to UsageValue(package, path, start)';

COMMENT ON CONSTRAINT "__open_attribute_fk_package_path_start_copy_open_3uvsj6ee55" ON "qti"."open_attribute" IS 'foreign key OpenAttribute(package, path, start, the owner''s count of the family Node.openAttributes, governor, kind) to Node(package, path, start, openAttributes, governor, kind)';

COMMENT ON CONSTRAINT "__open_attribute_fk_package_path_start_predecessor_6wt26reoml" ON "qti"."open_attribute" IS 'foreign key OpenAttribute(package, path, start, the predecessor of the index of the family Node.openAttributes) to OpenAttribute(package, path, start, the index of the family Node.openAttributes)';

COMMENT ON CONSTRAINT "__open_attribute_entity_fk_package_path_start_at_bftdgrmhu4" ON "qti"."open_attribute_entity" IS 'foreign key OpenAttributeEntity(package, path, start, at) to OpenAttribute(package, path, start, at)';

COMMENT ON CONSTRAINT "__open_element_name_fk_package_path_start_dgkc2wpi7w" ON "qti"."open_element_name" IS 'foreign key OpenElementName(package, path, start) to Node(package, path, start)';

COMMENT ON CONSTRAINT "__open_element_type_fk_package_path_start_jjjipij4kp" ON "qti"."open_element_type" IS 'foreign key OpenElementType(package, path, start) to OpenElementName(package, path, start)';

COMMENT ON CONSTRAINT "__pci_module_form_fk_package_path_start_copy_module_keh62si5ne" ON "qti"."pci_module_form" IS 'foreign key PciModuleForm(package, path, start, the owner''s count of the family Interaction.moduleForms) to Interaction(package, path, start, moduleForms)';

COMMENT ON CONSTRAINT "__pci_module_form_fk_package_path_start_predecessor_72gwl37tcr" ON "qti"."pci_module_form" IS 'foreign key PciModuleForm(package, path, start, the predecessor of the index of the family Interaction.moduleForms) to PciModuleForm(package, path, start, the index of the family Interaction.moduleForms)';

COMMENT ON CONSTRAINT "__placed_binding_fk_package_assembly_adaptive_4vpvmxtpul" ON "qti"."placed_binding" IS 'foreign key PlacedBinding(package, assembly, adaptive) to ItemMode(package, path, adaptive)';

COMMENT ON CONSTRAINT "__placed_binding_fk_package_assembly_instance_copy_3fluktngez" ON "qti"."placed_binding" IS 'foreign key PlacedBinding(package, assembly, instance, the owner''s count of the family Instance.bindings) to Instance(package, assembly, start, bindings)';

COMMENT ON CONSTRAINT "__placed_binding_fk_package_assembly_instance_lrmdgzusck" ON "qti"."placed_binding" IS 'foreign key PlacedBinding(package, assembly, instance, the predecessor of the index of the family Instance.bindings) to PlacedBinding(package, assembly, instance, the index of the family Instance.bindings)';

COMMENT ON CONSTRAINT "__placed_binding_fk_package_path_start_attribute_ynt36vjait" ON "qti"."placed_binding" IS 'foreign key PlacedBinding(package, path, start, attribute, identifier) to BindingName(package, path, start, attribute, identifier)';

COMMENT ON CONSTRAINT "__placed_binding_fk_package_path_start_jvgrxcf4xe" ON "qti"."placed_binding" IS 'foreign key PlacedBinding(package where Logic.eq(adaptive, false) and Logic.eq(attribute, "response-identifier"), path, start) to Node(package where Logic.in(kind, ["qti-associate-interaction", "qti-choice-interaction", "qti-custom-interaction", "qti-drawing-interaction", "qti-end-attempt-interaction", "qti-extended-text-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-inline-choice-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-portable-custom-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-slider-interaction", "qti-text-entry-interaction", "qti-upload-interaction"]) and Logic.eq(Bits.disjoint(ancestry, Enters.row("qti-feedback-block")), true), path, start)';

COMMENT ON CONSTRAINT "__placed_choice_fk_package_assembly_instance_copy_3yeakujuck" ON "qti"."placed_choice" IS 'foreign key PlacedChoice(package, assembly, instance, the owner''s count of the family Instance.choices, path) to Instance(package, assembly, start, choices, document)';

COMMENT ON CONSTRAINT "__placed_choice_fk_package_assembly_instance_cy5gpuayal" ON "qti"."placed_choice" IS 'foreign key PlacedChoice(package, assembly, instance, the predecessor of the index of the family Instance.choices) to PlacedChoice(package, assembly, instance, the index of the family Instance.choices)';

COMMENT ON CONSTRAINT "__placed_choice_fk_package_path_start_identifier_7xehyru3mj" ON "qti"."placed_choice" IS 'foreign key PlacedChoice(package, path, start, identifier) to Choice(package, path, start, identifier)';

COMMENT ON CONSTRAINT "__placed_choice_fk_package_path_start_kind_gph72alaqo" ON "qti"."placed_choice" IS 'foreign key PlacedChoice(package, path, start, kind) to Node(package, path, start, kind)';

COMMENT ON CONSTRAINT "__placed_hottext_fk_package_assembly_instance_copy_kcr4ogsb5x" ON "qti"."placed_hottext" IS 'foreign key PlacedHottext(package, assembly, instance, the owner''s count of the family Instance.hottexts, path) to Instance(package, assembly, start, hottexts, document)';

COMMENT ON CONSTRAINT "__placed_hottext_fk_package_assembly_instance_jnsx5y3ord" ON "qti"."placed_hottext" IS 'foreign key PlacedHottext(package, assembly, instance, the predecessor of the index of the family Instance.hottexts) to PlacedHottext(package, assembly, instance, the index of the family Instance.hottexts)';

COMMENT ON CONSTRAINT "__placed_hottext_fk_package_path_start_identifier_6pzfxnmqq2" ON "qti"."placed_hottext" IS 'foreign key PlacedHottext(package, path, start, identifier) to Hottext(package, path, start, identifier)';

COMMENT ON CONSTRAINT "__placed_id_fk_package_assembly_instance_copy_ids_izrndy7kd4" ON "qti"."placed_id" IS 'foreign key PlacedId(package, assembly, instance, the owner''s count of the family Instance.ids, assemblyKind, path) to Instance(package, assembly, start, ids, assemblyKind, document)';

COMMENT ON CONSTRAINT "__placed_id_fk_package_assembly_instance_predecessor_atzlhmffck" ON "qti"."placed_id" IS 'foreign key PlacedId(package, assembly, instance, the predecessor of the index of the family Instance.ids) to PlacedId(package, assembly, instance, the index of the family Instance.ids)';

COMMENT ON CONSTRAINT "__placed_idref_fk_package_assembly_instance_copy_y6ekgq4pdf" ON "qti"."placed_idref" IS 'foreign key PlacedIdref(package, assembly, instance, the owner''s count of the family Instance.idrefTargets, path) to Instance(package, assembly, start, idrefTargets, document)';

COMMENT ON CONSTRAINT "__placed_idref_fk_package_assembly_instance_hz5f2hoyse" ON "qti"."placed_idref" IS 'foreign key PlacedIdref(package, assembly, instance, the predecessor of the index of the family Instance.idrefTargets) to PlacedIdref(package, assembly, instance, the index of the family Instance.idrefTargets)';

COMMENT ON CONSTRAINT "__placed_idref_fk_package_path_id_digest_ux2x5fpxcb" ON "qti"."placed_idref" IS 'foreign key PlacedIdref(package, path, idDigest) to IdrefTarget(package, path, idDigest)';

COMMENT ON CONSTRAINT "__placed_math_rank_fk_package_assembly_instance_path_ne6gauiyao" ON "qti"."placed_math_rank" IS 'foreign key PlacedMathRank(package, assembly, instance, path) to Instance(package, assembly, start, document)';

COMMENT ON CONSTRAINT "__placed_math_rank_fk_package_path_start_5kblemgm5d" ON "qti"."placed_math_rank" IS 'foreign key PlacedMathRank(package, path, start) to Node(package, path, start)';

COMMENT ON CONSTRAINT "__placed_share_target_fk_package_assembly_instance_o7a22jy6p7" ON "qti"."placed_share_target" IS 'foreign key PlacedShareTarget(package, assembly, instance, path, assemblyKind) to Instance(package, assembly, start, document, assemblyKind)';

COMMENT ON CONSTRAINT "__placed_share_target_fk_package_assembly_instance_mcp6dsg3aq" ON "qti"."placed_share_target" IS 'foreign key PlacedShareTarget(package, assembly, instance, start) to PlacedMathRank(package, assembly, instance, start)';

COMMENT ON CONSTRAINT "__placed_share_target_fk_package_assembly_target_or2mupqns2" ON "qti"."placed_share_target" IS 'foreign key PlacedShareTarget(package, assembly, targetInstance, target) to Instance(package, assembly, start, document)';

COMMENT ON CONSTRAINT "__placed_share_target_fk_package_assembly_target_4oz3u75j3w" ON "qti"."placed_share_target" IS 'foreign key PlacedShareTarget(package, assembly, targetInstance, targetStart) to PlacedMathRank(package, assembly, instance, start)';

COMMENT ON CONSTRAINT "__placed_share_target_fk_package_path_start_copy_cxtzlkfnwz" ON "qti"."placed_share_target" IS 'foreign key PlacedShareTarget(package, path, start, the owner''s count of the family ShareFragment.placements, idDigest) to ShareFragment(package, path, start, placements, idDigest)';

COMMENT ON CONSTRAINT "__placed_share_target_fk_package_path_start_vcyyao6ye2" ON "qti"."placed_share_target" IS 'foreign key PlacedShareTarget(package, path, start, the predecessor of the index of the family ShareFragment.placements) to PlacedShareTarget(package, path, start, the index of the family ShareFragment.placements)';

COMMENT ON CONSTRAINT "__placed_variable_ref_fk_package_assembly_root_kind_kyz7jvyo7u" ON "qti"."placed_variable_ref" IS 'foreign key PlacedVariableRef(package, assembly, rootKind) to Document(package, path, rootKind)';

COMMENT ON CONSTRAINT "__processing_fk_package_path_start_buuyxfkq34" ON "qti"."processing" IS 'foreign key Processing(package, path, start) to Node(package, path, start)';

COMMENT ON CONSTRAINT "__reference_path_fk_package_target_pch7muxr75" ON "qti"."reference_path" IS 'foreign key ReferencePath(package, target) to Entry(package, path)';

COMMENT ON CONSTRAINT "__referring_document_fk_package_path_pred_contexts_tekv3unp3s" ON "qti"."referring_document" IS 'foreign key ReferringDocument(package, path, pred(contexts)) to FragmentContextName(package, path, the index of the family ReferringDocument.contexts)';

COMMENT ON CONSTRAINT "__referring_document_fk_package_path_pred_feedbacks_u5un4znhy3" ON "qti"."referring_document" IS 'foreign key ReferringDocument(package, path, pred(feedbacks)) to FragmentFeedbackName(package, path, the index of the family ReferringDocument.feedbacks)';

COMMENT ON CONSTRAINT "__referring_document_fk_package_path_pred_prints_e4vmx7vqd3" ON "qti"."referring_document" IS 'foreign key ReferringDocument(package, path, pred(prints)) to FragmentPrintedName(package, path, the index of the family ReferringDocument.prints)';

COMMENT ON CONSTRAINT "__referring_document_fk_package_path_pred_templates_qu4ntcliqa" ON "qti"."referring_document" IS 'foreign key ReferringDocument(package, path, pred(templates)) to FragmentTemplateName(package, path, the index of the family ReferringDocument.templates)';

COMMENT ON CONSTRAINT "__resource_document_fk_package_path_root_kind_ejo23fxacl" ON "qti"."resource_document" IS 'foreign key ResourceDocument(package, path, rootKind, documentType) to Document(package, path, rootKind, documentType)';

COMMENT ON CONSTRAINT "__rounding_mode_figures_fk_package_path_start_ybcfejqokw" ON "qti"."rounding_mode_figures" IS 'foreign key RoundingModeFigures(package, path, start, figuresDigest) to RoundingFigures(package, path, start, figuresDigest)';

COMMENT ON CONSTRAINT "__sd_decl_fk_package_path_xxx5gjp4e7" ON "qti"."sd_decl" IS 'foreign key SdDecl(package, path) to XmlDecl(package, path)';

COMMENT ON CONSTRAINT "__share_fragment_fk_package_path_assembled_vdozoufbmn" ON "qti"."share_fragment" IS 'foreign key ShareFragment(package, path, assembled) to Document(package, path, assembled)';

COMMENT ON CONSTRAINT "__share_fragment_fk_package_path_id_digest_ygyfy25djc" ON "qti"."share_fragment" IS 'foreign key ShareFragment(package, path, idDigest) to IdrefTarget(package, path, idDigest)';

COMMENT ON CONSTRAINT "__share_fragment_fk_package_path_start_pred_ub5heqagwi" ON "qti"."share_fragment" IS 'foreign key ShareFragment(package, path, start, pred(placements)) to PlacedShareTarget(package, path, start, the index of the family ShareFragment.placements)';

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

COMMENT ON CONSTRAINT "__srcset_fk_package_path_start_pred_tokens_token_umocscfsrd" ON "qti"."srcset" IS 'foreign key Srcset(package, path, start, pred(tokens), tokenTextDigest) to SrcsetCandidate(package, path, start, at, piecesAfterDigest)';

COMMENT ON CONSTRAINT "__srcset_candidate_fk_package_path_start_copy_tokens_prty6vocql" ON "qti"."srcset_candidate" IS 'foreign key SrcsetCandidate(package, path, start, the owner''s count of the family Srcset.tokens) to Srcset(package, path, start, tokens)';

COMMENT ON CONSTRAINT "__srcset_candidate_fk_package_path_start_pred_at_vspikv6tay" ON "qti"."srcset_candidate" IS 'foreign key SrcsetCandidate(package, path, start, pred(at), piecesWasDigest) to SrcsetCandidate(package, path, start, at, piecesAfterDigest)';

COMMENT ON CONSTRAINT "__ssml_scope_fk_package_path_start_ixilycttqs" ON "qti"."ssml_scope" IS 'foreign key SsmlScope(package, path, start) to Node(package, path, start)';

COMMENT ON CONSTRAINT "__text_idref_fk_package_path_start_copy_tokens_hkmj36vgbn" ON "qti"."text_idref" IS 'foreign key TextIdref(package, path, start, the owner''s count of the family IdentityText.tokens) to IdentityText(package, path, start, tokens)';

COMMENT ON CONSTRAINT "__text_idref_fk_package_path_start_pred_at_pieces_mtpacspjhh" ON "qti"."text_idref" IS 'foreign key TextIdref(package, path, start, pred(at), piecesWasDigest) to TextIdref(package, path, start, at, piecesAfterDigest)';

COMMENT ON CONSTRAINT "__text_idref_fk_package_path_token_digest_jiqu7y6gxe" ON "qti"."text_idref" IS 'foreign key TextIdref(package, path, tokenDigest) to IdrefTarget(package, path, idDigest)';

COMMENT ON CONSTRAINT "__text_reference_path_fk_package_target_7wuvskqxw6" ON "qti"."text_reference_path" IS 'foreign key TextReferencePath(package, target) to Entry(package, path)';

COMMENT ON CONSTRAINT "__tolerance_fk_package_path_start_pred_tokens_token_h3v5wokq5r" ON "qti"."tolerance" IS 'foreign key Tolerance(package, path, start, pred(tokens), tokenTextDigest) to ToleranceToken(package, path, start, at, piecesAfterDigest)';

COMMENT ON CONSTRAINT "__tolerance_token_fk_package_path_start_copy_tokens_hgndbm6n65" ON "qti"."tolerance_token" IS 'foreign key ToleranceToken(package, path, start, the owner''s count of the family Tolerance.tokens) to Tolerance(package, path, start, tokens)';

COMMENT ON CONSTRAINT "__tolerance_token_fk_package_path_start_pred_at_4nmbesdvnj" ON "qti"."tolerance_token" IS 'foreign key ToleranceToken(package, path, start, pred(at), piecesWasDigest) to ToleranceToken(package, path, start, at, piecesAfterDigest)';

COMMENT ON CONSTRAINT "__usage_value_fk_package_path_start_hgeaq5bglh" ON "qti"."usage_value" IS 'foreign key UsageValue(package, path, start) to Node(package where Logic.eq(Bits.subset(Bits.singleton(AttributeGrammar.at("slot", AttributeModelOf.at("model", governor), "baseType")), attrs), true) and Logic.eq(Bits.subset(Bits.singleton(AttributeGrammar.at("slot", AttributeModelOf.at("model", governor), "fieldIdentifier")), attrs), true) and Logic.eq(kind, "ud:value"), path, start)';

COMMENT ON CONSTRAINT "__usage_value_fk_package_path_start_text_digest_jp2cxdgoag" ON "qti"."usage_value" IS 'foreign key UsageValue(package, path, start, textDigest) to Node(package, path, start, stringValueDigest)';

COMMENT ON CONSTRAINT "__usage_value_base_type_fk_package_path_start_text_yqq5jyywar" ON "qti"."usage_value_base_type" IS 'foreign key UsageValueBaseType(package, path, start, textDigest) to Node(package, path, start, stringValueDigest)';

COMMENT ON CONSTRAINT "__variable_ref_fk_package_path_root_kind_o6lbp6ercl" ON "qti"."variable_ref" IS 'foreign key VariableRef(package, path, rootKind) to Document(package, path, rootKind)';

COMMENT ON CONSTRAINT "__variable_ref_fk_package_path_start_attribute_mtdx46lozb" ON "qti"."variable_ref" IS 'foreign key VariableRef(package, path, start, attribute) to Attribute(package, path, start, name)';

COMMENT ON CONSTRAINT "__xml_decl_fk_package_path_ge2web3hon" ON "qti"."xml_decl" IS 'foreign key XmlDecl(package, path) to Document(package, path)';

COMMENT ON CONSTRAINT "__catalog_id_key_package_path_start_xmcdisxi2k" ON "qti_views"."catalog_id" IS 'key CatalogId(package, path, start)';

COMMENT ON CONSTRAINT "__assembled_catalog_key_assembly_id_digest_package_nlao5vwurp" ON "qti_queries"."assembled_catalog" IS 'key AssembledCatalog(assembly, idDigest, package)';

COMMENT ON CONSTRAINT "__cell_table_key_package_path_start_table_fpxritt234" ON "qti_views"."cell_table" IS 'key CellTable(package, path, start, table)';

COMMENT ON CONSTRAINT "__table_header_key_package_path_start_table_5brsrb45gl" ON "qti_queries"."table_header" IS 'key TableHeader(package, path, start, table)';

COMMENT ON CONSTRAINT "__header_token_key_at_package_path_start_sk7i7uyonf" ON "qti_views"."header_token" IS 'key HeaderToken(at, package, path, start)';

COMMENT ON CONSTRAINT "__lookup_value_key_name_package_path_start_7z6wncue2i" ON "qti_views"."lookup_value" IS 'key LookupValue(name, package, path, start)';

COMMENT ON CONSTRAINT "__map_key_key_package_path_start_4oetgjnq4e" ON "qti_views"."map_key" IS 'key MapKey(package, path, start)';

COMMENT ON INDEX "qti_queries"."__table_header_key_package_path_table_id_digest_ll7spl6q4s" IS 'key TableHeader(package, path, table, idDigest)';

COMMENT ON INDEX "qti_views"."__catalog_id_key_package_path_id_digest_mciepy4knc" IS 'key CatalogId(package, path, idDigest)';

COMMENT ON INDEX "qti_views"."__header_token_key_package_path_start_token_digest_t2bfemyied" IS 'key HeaderToken(package, path, start, tokenDigest)';

COMMENT ON INDEX "qti"."__attribute_ix_name_path_start_package_a_4_p_2_u_7_hk4lma32u7" IS 'btree index Attribute(name, path, start, __package_a4p2u7pv6l)';

COMMENT ON INDEX "qti"."__attribute_ix_package_kind_name_start_path_jmvc4xtkis" IS 'btree index Attribute(package, kind, name, start, path), value filtered beside it, not indexed: no byte bound fits the entry';

COMMENT ON INDEX "qti"."__attribute_ix_package_name_path_start_2urjynczwy" IS 'btree index Attribute(package, name, path, start), value filtered beside it, not indexed: no byte bound fits the entry';

COMMENT ON INDEX "qti"."__attribute_ix_package_path_name_kind_value_digest_nuvl7i75vd" IS 'btree index Attribute(package, path, name, kind, valueDigest), value filtered beside it, not indexed: no byte bound fits the entry';

COMMENT ON INDEX "qti"."__bound_variable_ix_package_attribute_path_ej2y7oq7v2" IS 'btree index BoundVariable(package, attribute, path)';

COMMENT ON INDEX "qti"."__bound_variable_ix_package_path_adaptive_khkcbwhnkh" IS 'btree index BoundVariable(package, path, adaptive)';

COMMENT ON INDEX "qti"."__bound_variable_ix_package_path_attribute_ophjg3fmft" IS 'btree index BoundVariable(package, path, attribute)';

COMMENT ON INDEX "qti"."__bound_variable_ix_path_start_package_pyofn_3_cand_ggzllvtzhh" IS 'btree index BoundVariable(path, start, __package_pyofn3cand)';

COMMENT ON INDEX "qti"."__candidate_path_ix_package_target_6vqzdz37df" IS 'btree index CandidatePath(package, target)';

COMMENT ON INDEX "qti"."__choice_ix_package_path_identifier_gja2ztdp2y" IS 'btree index Choice(package, path, identifier)';

COMMENT ON INDEX "qti"."__choice_interaction_ix_package_interaction_k6iqlgrqib" IS 'btree index ChoiceInteraction(package, interaction, interactionPath, path)';

COMMENT ON INDEX "qti"."__data_ssml_property_ix_member_package_path_start_yctyt4mr3r" IS 'btree index DataSsmlProperty(member, package, path, start, memberNameDigest)';

COMMENT ON INDEX "qti"."__data_ssml_property_ix_member_package_path_start_3ibi7dhxxr" IS 'btree index DataSsmlProperty(member, package, path, start, nameDigest)';

COMMENT ON INDEX "qti"."__document_ix_package_assembled_path_6hx6cticyt" IS 'btree index Document(package, assembled, path)';

COMMENT ON INDEX "qti"."__document_id_ix_package_path_admitted_owner_jp55imcxjo" IS 'btree index DocumentId(package, path, admitted, owner)';

COMMENT ON INDEX "qti"."__file_outside_ix_package_path_target_digest_s7syn3lct6" IS 'btree index FileOutside(package, path, targetDigest), target filtered beside it, not indexed: no byte bound fits the entry';

COMMENT ON INDEX "qti"."__file_path_ix_package_path_target_km6qcynmsz" IS 'btree index FilePath(package, path, target)';

COMMENT ON INDEX "qti"."__file_path_ix_package_target_path_el6yhgey5m" IS 'btree index FilePath(package, target, path)';

COMMENT ON INDEX "qti"."__fragment_context_ref_ix_attribute_identifier_kind_pwcxnr27km" IS 'btree index FragmentContextRef(attribute, identifier, kind, package, path, start)';

COMMENT ON INDEX "qti"."__fragment_feedback_ref_ix_attribute_identifier_kind_seb6fwpevd" IS 'btree index FragmentFeedbackRef(attribute, identifier, kind, package, path, start)';

COMMENT ON INDEX "qti"."__fragment_printed_ref_ix_attribute_identifier_kind_rvyu6hyn5x" IS 'btree index FragmentPrintedRef(attribute, identifier, kind, package, path, start)';

COMMENT ON INDEX "qti"."__fragment_scope_ix_contexts_document_feedbacks_7o6ndg23f4" IS 'btree index FragmentScope(contexts, document, feedbacks, package, prints, templates)';

COMMENT ON INDEX "qti"."__fragment_template_ref_ix_attribute_identifier_kind_ypbawdd6ec" IS 'btree index FragmentTemplateRef(attribute, identifier, kind, package, path, start)';

COMMENT ON INDEX "qti"."__idref_ix_package_name_path_nielih3bso" IS 'btree index Idref(package, name, path)';

COMMENT ON INDEX "qti"."__idref_ix_package_path_name_ckzbix4lpw" IS 'btree index Idref(package, path, name)';

COMMENT ON INDEX "qti"."__idref_ix_package_path_token_digest_32nufrmpv6" IS 'btree index Idref(package, path, tokenDigest)';

COMMENT ON INDEX "qti"."__idref_target_ix_package_path_assembled_4j2motbov2" IS 'btree index IdrefTarget(package, path, assembled)';

COMMENT ON INDEX "qti"."__instance_ix_assembly_assembly_kind_package_gx4vwly74d" IS 'btree index Instance(assembly, assemblyKind, package)';

COMMENT ON INDEX "qti"."__instance_ix_package_assembly_assembly_kind_end_6c3k3mjz3l" IS 'btree index Instance(package, assembly, assemblyKind, end, document)';

COMMENT ON INDEX "qti"."__instance_ix_package_assembly_assembly_kind_end_q7wzhnaz2c" IS 'btree index Instance(package, assembly, assemblyKind, end, parent)';

COMMENT ON INDEX "qti"."__instance_ix_package_assembly_assembly_kind_parent_i6gt6br7ge" IS 'btree index Instance(package, assembly, assemblyKind, parent, site, siteDocument)';

COMMENT ON INDEX "qti"."__instance_ix_package_assembly_assembly_kind_parent_znncdu42ko" IS 'btree index Instance(package, assembly, assemblyKind, parent, siteDocument)';

COMMENT ON INDEX "qti"."__instance_ix_package_assembly_assembly_kind_site_c7f2vpiy27" IS 'btree index Instance(package, assembly, assemblyKind, site, siteDocument)';

COMMENT ON INDEX "qti"."__instance_ix_package_assembly_assembly_kind_site_65ivnxs6hw" IS 'btree index Instance(package, assembly, assemblyKind, siteDocument, document, site)';

COMMENT ON INDEX "qti"."__instance_ix_package_assembly_document_athumb4mf5" IS 'btree index Instance(package, assembly, document)';

COMMENT ON INDEX "qti"."__instance_ix_package_assembly_kind_assembly_zz7dcr5yl2" IS 'btree index Instance(package, assemblyKind, assembly, document, parent, siteDocument, site)';

COMMENT ON INDEX "qti"."__instance_ix_package_assembly_kind_document_fqoo34oqex" IS 'btree index Instance(package, assemblyKind, document, bindings)';

COMMENT ON INDEX "qti"."__instance_ix_package_document_choices_hottexts_qlg6xqawz7" IS 'btree index Instance(package, document, choices, hottexts, idrefTargets, ids)';

COMMENT ON INDEX "qti"."__instance_ix_package_document_root_kind_rubmvpymix" IS 'btree index Instance(package, document, rootKind)';

COMMENT ON INDEX "qti"."__instance_ix_package_site_site_document_assembly_qbsms3vpvp" IS 'btree index Instance(package, site, siteDocument, assemblyKind)';

COMMENT ON INDEX "qti"."__instance_ix_package_site_site_document_document_bjipxfrcbk" IS 'btree index Instance(package, site, siteDocument, document)';

COMMENT ON INDEX "qti"."__instance_ix_package_start_document_ywontbbqhm" IS 'btree index Instance(package, start, document)';

COMMENT ON INDEX "qti"."__interaction_attribute_ix_kind_name_path_root_kind_vikix6lasa" IS 'btree index InteractionAttribute(kind, name, path, rootKind, start, __package_23kaj6k72g)';

COMMENT ON INDEX "qti"."__interaction_attribute_ix_kind_name_path_root_kind_ekx7mv2pwx" IS 'btree index InteractionAttribute(kind, name, path, rootKind, start, __package_mh3ihjeic4)';

COMMENT ON INDEX "qti"."__interaction_attribute_ix_kind_name_path_root_kind_s2cghdj5s6" IS 'btree index InteractionAttribute(kind, name, path, rootKind, start, __package_u66bjij63r)';

COMMENT ON INDEX "qti"."__interaction_attribute_ix_kind_name_path_root_kind_o3a4plelvq" IS 'btree index InteractionAttribute(kind, name, path, rootKind, start, __package_vavgyyjccm)';

COMMENT ON INDEX "qti"."__interaction_attribute_ix_kind_name_path_start_l2s7ywszoy" IS 'btree index InteractionAttribute(kind, name, path, start, __package_em5smlkv7y)';

COMMENT ON INDEX "qti"."__interaction_attribute_ix_kind_name_path_start_7udfl4bz3c" IS 'btree index InteractionAttribute(kind, name, path, start, __package_ml42oesjn5)';

COMMENT ON INDEX "qti"."__interaction_attribute_ix_kind_name_path_start_v22vf6pmu6" IS 'btree index InteractionAttribute(kind, name, path, start, __package_ph3lmj2a3i)';

COMMENT ON INDEX "qti"."__interaction_attribute_ix_kind_name_path_start_6ekwrewu4j" IS 'btree index InteractionAttribute(kind, name, path, start, __package_sl6clonewv)';

COMMENT ON INDEX "qti"."__interaction_attribute_ix_name_path_start_package_4kzzuik4c4" IS 'btree index InteractionAttribute(name, path, start, __package_py2hqgnzbf)';

COMMENT ON INDEX "qti"."__interaction_attribute_ix_name_path_start_package_u_h45ljcxfzp" IS 'btree index InteractionAttribute(name, path, start, __package_u7v2jd53lp)';

COMMENT ON INDEX "qti"."__interaction_attribute_ix_package_path_name_start_utwa5pk7qt" IS 'btree index InteractionAttribute(package, path, name, start)';

COMMENT ON INDEX "qti"."__interaction_attribute_ix_package_path_root_kind_tqpqhhqjmc" IS 'btree index InteractionAttribute(package, path, rootKind)';

COMMENT ON INDEX "qti"."__item_ref_document_ix_package_target_x3gzopozhy" IS 'btree index ItemRefDocument(package, target)';

COMMENT ON INDEX "qti"."__item_ref_href_ix_package_target_6kwzgt4wre" IS 'btree index ItemRefHref(package, target)';

COMMENT ON INDEX "qti"."__label_use_ix_package_path_root_kind_gkglyfua6p" IS 'btree index LabelUse(package, path, rootKind)';

COMMENT ON INDEX "qti"."__named_ix_package_identifier_poryqrycn2" IS 'btree index Named(package, identifier)';

COMMENT ON INDEX "qti"."__node_ix_package_kind_parent_kind_element_children_adichcjcn5" IS 'btree index Node(package, kind, parentKind, elementChildren, path)';

COMMENT ON INDEX "qti"."__node_ix_package_parent_kind_path_start_6zgfzdfjgw" IS 'btree index Node(package, parentKind, path, start)';

COMMENT ON INDEX "qti"."__node_ix_package_path_element_children_kind_parent_st7tbj3vpb" IS 'btree index Node(package, path, elementChildren, kind, parentKind)';

COMMENT ON INDEX "qti"."__node_ix_package_path_end_kind_parent_gyibajsdba" IS 'btree index Node(package, path, end, kind, parent)';

COMMENT ON INDEX "qti"."__node_ix_package_path_kind_parent_elements_d5l24r3p2o" IS 'btree index Node(package, path, kind, parent, elements)';

COMMENT ON INDEX "qti"."__node_ix_package_path_kind_parent_kind_elements_joehbu4lt4" IS 'btree index Node(package, path, kind, parentKind, elements)';

COMMENT ON INDEX "qti"."__node_ix_package_path_parent_at_3js7ucei5d" IS 'btree index Node(package, path, parent, at)';

COMMENT ON INDEX "qti"."__node_ix_package_path_parent_elements_eiswbbzaxd" IS 'btree index Node(package, path, parent, elements)';

COMMENT ON INDEX "qti"."__node_ix_package_path_parent_parent_kind_p6opm4cre4" IS 'btree index Node(package, path, parent, parentKind)';

COMMENT ON INDEX "qti"."__node_ix_package_path_parent_kind_kind_parent_h6snizktuj" IS 'btree index Node(package, path, parentKind, kind, parent)';

COMMENT ON INDEX "qti"."__node_ix_package_start_kind_path_wfqsgvcv6x" IS 'btree index Node(package, start, kind, path)';

COMMENT ON INDEX "qti"."__numbered_reading_ix_package_assembly_scope_scope_3jdhtpwvdv" IS 'btree index NumberedReading(package, assembly, scope, scopeInstance, scopePath, variable)';

COMMENT ON INDEX "qti"."__open_attribute_ix_package_path_start_element_e42jbn5dtd" IS 'btree index OpenAttribute(package, path, start, elementNamespace, kind)';

COMMENT ON INDEX "qti"."__placed_binding_ix_package_assembly_adaptive_lv5atayv6x" IS 'btree index PlacedBinding(package, assembly, adaptive)';

COMMENT ON INDEX "qti"."__placed_binding_ix_package_assembly_instance_path_u7y4ztcx7f" IS 'btree index PlacedBinding(package, assembly, instance, path)';

COMMENT ON INDEX "qti"."__placed_binding_ix_package_attribute_path_start_v2fpmoweun" IS 'btree index PlacedBinding(package, attribute, path, start, identifier)';

COMMENT ON INDEX "qti"."__placed_binding_ix_path_start_package_pyofn_3_cand_2mhddflj74" IS 'btree index PlacedBinding(path, start, __package_pyofn3cand)';

COMMENT ON INDEX "qti"."__placed_choice_ix_package_assembly_identifier_uhvul24o7s" IS 'btree index PlacedChoice(package, assembly, identifier)';

COMMENT ON INDEX "qti"."__placed_choice_ix_package_identifier_path_start_4ff4uctojl" IS 'btree index PlacedChoice(package, identifier, path, start)';

COMMENT ON INDEX "qti"."__placed_choice_ix_package_kind_path_start_6u6xdpvxrk" IS 'btree index PlacedChoice(package, kind, path, start)';

COMMENT ON INDEX "qti"."__placed_expression_ix_package_base_type_assembly_qxi577w7ks" IS 'btree index PlacedExpression(package, baseType, assembly, instance, path)';

COMMENT ON INDEX "qti"."__placed_expression_ix_package_path_start_5zxaoolb7y" IS 'btree index PlacedExpression(package, path, start)';

COMMENT ON INDEX "qti"."__placed_hottext_ix_package_identifier_path_start_hz2kbnxvhq" IS 'btree index PlacedHottext(package, identifier, path, start)';

COMMENT ON INDEX "qti"."__placed_id_ix_package_assembly_id_digest_instance_33p6wamnaw" IS 'btree index PlacedId(package, assembly, idDigest, instance, owner, path)';

COMMENT ON INDEX "qti"."__placed_idref_ix_package_id_digest_path_whg3pktib3" IS 'btree index PlacedIdref(package, idDigest, path)';

COMMENT ON INDEX "qti"."__placed_math_rank_ix_package_assembly_instance_path_xlmxodty27" IS 'btree index PlacedMathRank(package, assembly, instance, path)';

COMMENT ON INDEX "qti"."__placed_math_rank_ix_package_path_start_v42fxoxi7w" IS 'btree index PlacedMathRank(package, path, start)';

COMMENT ON INDEX "qti"."__placed_share_target_ix_assembly_package_assembly_gtvlyfppdi" IS 'btree index PlacedShareTarget(assembly, package, assemblyKind, instance, path)';

COMMENT ON INDEX "qti"."__placed_share_target_ix_assembly_package_target_l6gfxbsrsm" IS 'btree index PlacedShareTarget(assembly, package, target, targetInstance)';

COMMENT ON INDEX "qti"."__placed_share_target_ix_assembly_package_target_2xc2tepmfu" IS 'btree index PlacedShareTarget(assembly, package, targetInstance, targetStart)';

COMMENT ON INDEX "qti"."__placed_variable_ref_ix_package_assembly_resolution_ymsbodsibl" IS 'btree index PlacedVariableRef(package, assembly, resolution, attribute, identifier)';

COMMENT ON INDEX "qti"."__placed_variable_ref_ix_package_assembly_root_kind_ox6jmeuv4f" IS 'btree index PlacedVariableRef(package, assembly, rootKind)';

COMMENT ON INDEX "qti"."__placed_variable_ref_ix_package_attribute_3vpsdcsq4l" IS 'btree index PlacedVariableRef(package, attribute, resolution, path, start, assembly)';

COMMENT ON INDEX "qti"."__placed_variable_ref_ix_package_resolution_assembly_zzk4vby5a7" IS 'btree index PlacedVariableRef(package, resolution, assembly)';

COMMENT ON INDEX "qti"."__reference_path_ix_package_target_kind_name_path_nc25mlby5o" IS 'btree index ReferencePath(package, target, kind, name, path)';

COMMENT ON INDEX "qti"."__resource_href_ix_package_path_scope_qkrp53ev3n" IS 'btree index ResourceHref(package, path, scope)';

COMMENT ON INDEX "qti"."__resource_href_path_ix_package_target_w6il6mi33e" IS 'btree index ResourceHrefPath(package, target)';

COMMENT ON INDEX "qti"."__share_fragment_ix_assembled_package_path_nqr4ku73uk" IS 'btree index ShareFragment(assembled, package, path, placements)';

COMMENT ON INDEX "qti"."__share_fragment_ix_id_digest_package_path_jpajpi2hz2" IS 'btree index ShareFragment(idDigest, package, path)';

COMMENT ON INDEX "qti"."__share_target_ix_package_path_target_start_vj2n53ubgi" IS 'btree index ShareTarget(package, path, targetStart)';

COMMENT ON INDEX "qti"."__site_ix_package_external_kind_path_lntm7cebfg" IS 'btree index Site(package, external, kind, path)';

COMMENT ON INDEX "qti"."__site_path_ix_entry_package_target_wrj5ssqldp" IS 'btree index SitePath(entry, package, target)';

COMMENT ON INDEX "qti"."__site_path_ix_package_path_entry_kind_cw75fb42kr" IS 'btree index SitePath(package, path, entry, kind)';

COMMENT ON INDEX "qti"."__site_target_ix_package_target_splices_ufrlh7idlc" IS 'btree index SiteTarget(package, target, splices)';

COMMENT ON INDEX "qti"."__text_idref_ix_package_path_token_digest_6rnu6d6nqb" IS 'btree index TextIdref(package, path, tokenDigest)';

COMMENT ON INDEX "qti"."__text_reference_path_ix_package_target_zlcnodi5ns" IS 'btree index TextReferencePath(package, target)';

COMMENT ON INDEX "qti"."__variable_ref_ix_package_path_attribute_identifier_fhzai5nn5j" IS 'btree index VariableRef(package, path, attribute, identifier)';

COMMENT ON INDEX "qti"."__variable_ref_ix_package_path_identifier_start_xf557pdhpw" IS 'btree index VariableRef(package, path, identifier, start)';

COMMENT ON INDEX "qti"."__variable_ref_ix_package_path_root_kind_merm4oeh73" IS 'btree index VariableRef(package, path, rootKind)';

COMMENT ON FUNCTION "qti"."__reader_olds_assembled_catalog_ebmxrkpcnb"() IS 'the reader of the delta of olds of AssembledCatalog';

COMMENT ON FUNCTION "qti"."__reader_news_assembled_document_6uia4xcajl"() IS 'the reader of the delta of news of AssembledDocument';

COMMENT ON FUNCTION "qti"."__reader_olds_assembled_document_hw6qsevoql"() IS 'the reader of the delta of olds of AssembledDocument';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_6khon4bwwl"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_4bshbuu52i"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_binding_name_gxtl45ye3k"() IS 'the reader of the delta of news of BindingName';

COMMENT ON FUNCTION "qti"."__reader_news_bound_variable_h3r42nun5d"() IS 'the reader of the delta of news of BoundVariable';

COMMENT ON FUNCTION "qti"."__reader_olds_bound_variable_262twswcch"() IS 'the reader of the delta of olds of BoundVariable';

COMMENT ON FUNCTION "qti"."__reader_news_candidate_path_4vdrg624u2"() IS 'the reader of the delta of news of CandidatePath';

COMMENT ON FUNCTION "qti"."__reader_olds_candidate_path_5bhv3luysh"() IS 'the reader of the delta of olds of CandidatePath';

COMMENT ON FUNCTION "qti"."__reader_news_catalog_id_pxt4ubbuag"() IS 'the reader of the delta of news of CatalogId';

COMMENT ON FUNCTION "qti"."__reader_olds_catalog_id_pfafit4k3i"() IS 'the reader of the delta of olds of CatalogId';

COMMENT ON FUNCTION "qti"."__reader_news_catalog_scope_vh54uabtv6"() IS 'the reader of the delta of news of CatalogScope';

COMMENT ON FUNCTION "qti"."__reader_olds_catalog_scope_2xcn6z6xi3"() IS 'the reader of the delta of olds of CatalogScope';

COMMENT ON FUNCTION "qti"."__reader_news_cell_leaf_xx7ihsy4yc"() IS 'the reader of the delta of news of CellLeaf';

COMMENT ON FUNCTION "qti"."__reader_olds_cell_leaf_sqodrfux43"() IS 'the reader of the delta of olds of CellLeaf';

COMMENT ON FUNCTION "qti"."__reader_news_cell_table_xdupzfnyuo"() IS 'the reader of the delta of news of CellTable';

COMMENT ON FUNCTION "qti"."__reader_olds_cell_table_ncgo7uw5pn"() IS 'the reader of the delta of olds of CellTable';

COMMENT ON FUNCTION "qti"."__reader_news_choice_r2bhewc2aw"() IS 'the reader of the delta of news of Choice';

COMMENT ON FUNCTION "qti"."__reader_olds_choice_427cfy7ja5"() IS 'the reader of the delta of olds of Choice';

COMMENT ON FUNCTION "qti"."__reader_news_choice_interaction_ujac7c34hg"() IS 'the reader of the delta of news of ChoiceInteraction';

COMMENT ON FUNCTION "qti"."__reader_olds_choice_interaction_crptzssfuw"() IS 'the reader of the delta of olds of ChoiceInteraction';

COMMENT ON FUNCTION "qti"."__reader_news_cn_attribute_4bcniq7h7q"() IS 'the reader of the delta of news of CnAttribute';

COMMENT ON FUNCTION "qti"."__reader_olds_cn_attribute_hj7jxpqh5h"() IS 'the reader of the delta of olds of CnAttribute';

COMMENT ON FUNCTION "qti"."__reader_news_cn_count_u6l2mrjnco"() IS 'the reader of the delta of news of CnCount';

COMMENT ON FUNCTION "qti"."__reader_news_comment_kkykl6u6fp"() IS 'the reader of the delta of news of Comment';

COMMENT ON FUNCTION "qti"."__reader_olds_comment_cy3f44qdbp"() IS 'the reader of the delta of olds of Comment';

COMMENT ON FUNCTION "qti"."__reader_news_context_ref_dul6toz33e"() IS 'the reader of the delta of news of ContextRef';

COMMENT ON FUNCTION "qti"."__reader_news_count_bound_m4xg2hrxga"() IS 'the reader of the delta of news of CountBound';

COMMENT ON FUNCTION "qti"."__reader_olds_count_bound_f2ow3vm4ks"() IS 'the reader of the delta of olds of CountBound';

COMMENT ON FUNCTION "qti"."__reader_news_data_ssml_gtutkkflto"() IS 'the reader of the delta of news of DataSsml';

COMMENT ON FUNCTION "qti"."__reader_olds_data_ssml_f6aycnsqgu"() IS 'the reader of the delta of olds of DataSsml';

COMMENT ON FUNCTION "qti"."__reader_news_data_ssml_member_liqs5krwmg"() IS 'the reader of the delta of news of DataSsmlMember';

COMMENT ON FUNCTION "qti"."__reader_olds_data_ssml_property_wwrjzlal6g"() IS 'the reader of the delta of olds of DataSsmlProperty';

COMMENT ON FUNCTION "qti"."__reader_news_doctype_r2i3ziokxs"() IS 'the reader of the delta of news of Doctype';

COMMENT ON FUNCTION "qti"."__reader_olds_doctype_3cqihzyxyf"() IS 'the reader of the delta of olds of Doctype';

COMMENT ON FUNCTION "qti"."__reader_news_document_pelygifh5a"() IS 'the reader of the delta of news of Document';

COMMENT ON FUNCTION "qti"."__reader_olds_document_acmx44ders"() IS 'the reader of the delta of olds of Document';

COMMENT ON FUNCTION "qti"."__reader_news_document_id_dhhnmn5jzh"() IS 'the reader of the delta of news of DocumentId';

COMMENT ON FUNCTION "qti"."__reader_olds_document_id_wbiukhgtox"() IS 'the reader of the delta of olds of DocumentId';

COMMENT ON FUNCTION "qti"."__reader_olds_element_type_km2vzm6yoy"() IS 'the reader of the delta of olds of ElementType';

COMMENT ON FUNCTION "qti"."__reader_news_entry_wtglkeqo66"() IS 'the reader of the delta of news of Entry';

COMMENT ON FUNCTION "qti"."__reader_olds_entry_sa5knswku6"() IS 'the reader of the delta of olds of Entry';

COMMENT ON FUNCTION "qti"."__reader_news_expression_5kdfzsj2ai"() IS 'the reader of the delta of news of Expression';

COMMENT ON FUNCTION "qti"."__reader_olds_expression_4jricmplbf"() IS 'the reader of the delta of olds of Expression';

COMMENT ON FUNCTION "qti"."__reader_news_feedback_ref_jfytalyimg"() IS 'the reader of the delta of news of FeedbackRef';

COMMENT ON FUNCTION "qti"."__reader_news_file_od4cjshdm5"() IS 'the reader of the delta of news of File';

COMMENT ON FUNCTION "qti"."__reader_olds_file_ip4hikvfqd"() IS 'the reader of the delta of olds of File';

COMMENT ON FUNCTION "qti"."__reader_news_file_outside_jow2opme5r"() IS 'the reader of the delta of news of FileOutside';

COMMENT ON FUNCTION "qti"."__reader_olds_file_outside_tljueldmrf"() IS 'the reader of the delta of olds of FileOutside';

COMMENT ON FUNCTION "qti"."__reader_news_file_path_7dj6hk66hn"() IS 'the reader of the delta of news of FilePath';

COMMENT ON FUNCTION "qti"."__reader_olds_file_path_lxndmkfbfj"() IS 'the reader of the delta of olds of FilePath';

COMMENT ON FUNCTION "qti"."__reader_news_fragment_context_ref_dhaxig44iq"() IS 'the reader of the delta of news of FragmentContextRef';

COMMENT ON FUNCTION "qti"."__reader_news_fragment_feedback_ref_7imhd4dvkc"() IS 'the reader of the delta of news of FragmentFeedbackRef';

COMMENT ON FUNCTION "qti"."__reader_news_fragment_printed_ref_5txud456rr"() IS 'the reader of the delta of news of FragmentPrintedRef';

COMMENT ON FUNCTION "qti"."__reader_olds_fragment_scope_ilhbtrczzf"() IS 'the reader of the delta of olds of FragmentScope';

COMMENT ON FUNCTION "qti"."__reader_news_fragment_template_ref_2zqmu5pu5o"() IS 'the reader of the delta of news of FragmentTemplateRef';

COMMENT ON FUNCTION "qti"."__reader_news_hottext_7s7fbqvouh"() IS 'the reader of the delta of news of Hottext';

COMMENT ON FUNCTION "qti"."__reader_olds_hottext_no27fmagnk"() IS 'the reader of the delta of olds of Hottext';

COMMENT ON FUNCTION "qti"."__reader_news_identity_text_xt257bexgl"() IS 'the reader of the delta of news of IdentityText';

COMMENT ON FUNCTION "qti"."__reader_olds_identity_text_vqfsngpqzk"() IS 'the reader of the delta of olds of IdentityText';

COMMENT ON FUNCTION "qti"."__reader_news_idref_grzl6kjqam"() IS 'the reader of the delta of news of Idref';

COMMENT ON FUNCTION "qti"."__reader_news_idref_target_tuxqjr2kgp"() IS 'the reader of the delta of news of IdrefTarget';

COMMENT ON FUNCTION "qti"."__reader_olds_inclusion_yrh5xw47p3"() IS 'the reader of the delta of olds of Inclusion';

COMMENT ON FUNCTION "qti"."__reader_news_instance_r6xjn4pgt3"() IS 'the reader of the delta of news of Instance';

COMMENT ON FUNCTION "qti"."__reader_olds_instance_dosajpfnme"() IS 'the reader of the delta of olds of Instance';

COMMENT ON FUNCTION "qti"."__reader_news_interaction_dopqjs72p3"() IS 'the reader of the delta of news of Interaction';

COMMENT ON FUNCTION "qti"."__reader_olds_interaction_lmrfzqjqyw"() IS 'the reader of the delta of olds of Interaction';

COMMENT ON FUNCTION "qti"."__reader_news_interaction_attribute_jnzewzkmbs"() IS 'the reader of the delta of news of InteractionAttribute';

COMMENT ON FUNCTION "qti"."__reader_olds_interaction_attribute_5nrcv6dpqm"() IS 'the reader of the delta of olds of InteractionAttribute';

COMMENT ON FUNCTION "qti"."__reader_news_item_ref_document_z6a3f3syen"() IS 'the reader of the delta of news of ItemRefDocument';

COMMENT ON FUNCTION "qti"."__reader_olds_item_ref_document_aiwx233fyu"() IS 'the reader of the delta of olds of ItemRefDocument';

COMMENT ON FUNCTION "qti"."__reader_news_item_ref_href_ymsqhfwbo7"() IS 'the reader of the delta of news of ItemRefHref';

COMMENT ON FUNCTION "qti"."__reader_olds_item_ref_href_tbyp3zbyx6"() IS 'the reader of the delta of olds of ItemRefHref';

COMMENT ON FUNCTION "qti"."__reader_news_label_use_fvhrxqhhac"() IS 'the reader of the delta of news of LabelUse';

COMMENT ON FUNCTION "qti"."__reader_olds_label_use_jea7xoraqh"() IS 'the reader of the delta of olds of LabelUse';

COMMENT ON FUNCTION "qti"."__reader_news_least_count_g4syavjvcl"() IS 'the reader of the delta of news of LeastCount';

COMMENT ON FUNCTION "qti"."__reader_olds_least_count_moowkdvaam"() IS 'the reader of the delta of olds of LeastCount';

COMMENT ON FUNCTION "qti"."__reader_news_link_reading_h3vppkk7m6"() IS 'the reader of the delta of news of LinkReading';

COMMENT ON FUNCTION "qti"."__reader_olds_link_reading_3ytdn6tz7r"() IS 'the reader of the delta of olds of LinkReading';

COMMENT ON FUNCTION "qti"."__reader_olds_literal_4v4eedvc6d"() IS 'the reader of the delta of olds of Literal';

COMMENT ON FUNCTION "qti"."__reader_olds_literal_typed_czdg5lxrkk"() IS 'the reader of the delta of olds of LiteralTyped';

COMMENT ON FUNCTION "qti"."__reader_news_lookup_value_jiamdqb77h"() IS 'the reader of the delta of news of LookupValue';

COMMENT ON FUNCTION "qti"."__reader_news_map_key_ht72hy4vfi"() IS 'the reader of the delta of news of MapKey';

COMMENT ON FUNCTION "qti"."__reader_news_math_action_wxdku3okqx"() IS 'the reader of the delta of news of MathAction';

COMMENT ON FUNCTION "qti"."__reader_olds_math_action_k2o75zlqqu"() IS 'the reader of the delta of olds of MathAction';

COMMENT ON FUNCTION "qti"."__reader_olds_math_align_group_6cyh425a4l"() IS 'the reader of the delta of olds of MathAlignGroup';

COMMENT ON FUNCTION "qti"."__reader_news_math_align_scope_h7qwluaslv"() IS 'the reader of the delta of news of MathAlignScope';

COMMENT ON FUNCTION "qti"."__reader_olds_math_align_scope_sv72hwjqap"() IS 'the reader of the delta of olds of MathAlignScope';

COMMENT ON FUNCTION "qti"."__reader_news_math_cell_shj2dqepwi"() IS 'the reader of the delta of news of MathCell';

COMMENT ON FUNCTION "qti"."__reader_olds_math_cell_xjrwrxksm2"() IS 'the reader of the delta of olds of MathCell';

COMMENT ON FUNCTION "qti"."__reader_news_math_cn_7mrjzz7uuo"() IS 'the reader of the delta of news of MathCn';

COMMENT ON FUNCTION "qti"."__reader_news_math_rank_zai3tgofmy"() IS 'the reader of the delta of news of MathRank';

COMMENT ON FUNCTION "qti"."__reader_olds_math_rank_vmm2emi63a"() IS 'the reader of the delta of olds of MathRank';

COMMENT ON FUNCTION "qti"."__reader_news_media_j7g2jn2tpl"() IS 'the reader of the delta of news of Media';

COMMENT ON FUNCTION "qti"."__reader_olds_media_ogso2wjimn"() IS 'the reader of the delta of olds of Media';

COMMENT ON FUNCTION "qti"."__reader_news_most_count_pbfx4ab5pi"() IS 'the reader of the delta of news of MostCount';

COMMENT ON FUNCTION "qti"."__reader_olds_most_count_fodnb7ca2j"() IS 'the reader of the delta of olds of MostCount';

COMMENT ON FUNCTION "qti"."__reader_news_named_e4zczmqimn"() IS 'the reader of the delta of news of Named';

COMMENT ON FUNCTION "qti"."__reader_olds_named_4yazsptd7c"() IS 'the reader of the delta of olds of Named';

COMMENT ON FUNCTION "qti"."__reader_news_node_st5fwmhhxd"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_6ifx6gx7bv"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_news_numbered_reading_eeh447z3mg"() IS 'the reader of the delta of news of NumberedReading';

COMMENT ON FUNCTION "qti"."__reader_olds_numbered_reading_2snsonzla5"() IS 'the reader of the delta of olds of NumberedReading';

COMMENT ON FUNCTION "qti"."__reader_news_open_attribute_fwd43d4uig"() IS 'the reader of the delta of news of OpenAttribute';

COMMENT ON FUNCTION "qti"."__reader_news_open_element_name_quwyu43la4"() IS 'the reader of the delta of news of OpenElementName';

COMMENT ON FUNCTION "qti"."__reader_olds_open_element_name_jz25txm7ww"() IS 'the reader of the delta of olds of OpenElementName';

COMMENT ON FUNCTION "qti"."__reader_news_open_element_type_lqqzi5n6gt"() IS 'the reader of the delta of news of OpenElementType';

COMMENT ON FUNCTION "qti"."__reader_olds_open_element_type_cg2c6tnfcq"() IS 'the reader of the delta of olds of OpenElementType';

COMMENT ON FUNCTION "qti"."__reader_news_pci_module_form_jxb53vcrl2"() IS 'the reader of the delta of news of PciModuleForm';

COMMENT ON FUNCTION "qti"."__reader_olds_pci_module_form_yu35zasrmc"() IS 'the reader of the delta of olds of PciModuleForm';

COMMENT ON FUNCTION "qti"."__reader_news_pi_hggp3ctnqa"() IS 'the reader of the delta of news of Pi';

COMMENT ON FUNCTION "qti"."__reader_olds_pi_vq6mwc6h2g"() IS 'the reader of the delta of olds of Pi';

COMMENT ON FUNCTION "qti"."__reader_news_placed_binding_fwob4xa76a"() IS 'the reader of the delta of news of PlacedBinding';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_binding_uvb4tsvkcb"() IS 'the reader of the delta of olds of PlacedBinding';

COMMENT ON FUNCTION "qti"."__reader_news_placed_choice_yinnsmlrpp"() IS 'the reader of the delta of news of PlacedChoice';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_choice_3qxh6zptpd"() IS 'the reader of the delta of olds of PlacedChoice';

COMMENT ON FUNCTION "qti"."__reader_news_placed_expression_dagjmbqofl"() IS 'the reader of the delta of news of PlacedExpression';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_expression_3swg7yha3g"() IS 'the reader of the delta of olds of PlacedExpression';

COMMENT ON FUNCTION "qti"."__reader_news_placed_hottext_a2nawf5rsm"() IS 'the reader of the delta of news of PlacedHottext';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_hottext_yxceq7nqd5"() IS 'the reader of the delta of olds of PlacedHottext';

COMMENT ON FUNCTION "qti"."__reader_news_placed_id_kltbul7bzu"() IS 'the reader of the delta of news of PlacedId';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_id_jy3oem3ydr"() IS 'the reader of the delta of olds of PlacedId';

COMMENT ON FUNCTION "qti"."__reader_news_placed_idref_yqvsjvnhpx"() IS 'the reader of the delta of news of PlacedIdref';

COMMENT ON FUNCTION "qti"."__reader_news_placed_math_rank_7e3g73vwgk"() IS 'the reader of the delta of news of PlacedMathRank';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_math_rank_sadsu7ieob"() IS 'the reader of the delta of olds of PlacedMathRank';

COMMENT ON FUNCTION "qti"."__reader_news_placed_share_target_nocoiebhmu"() IS 'the reader of the delta of news of PlacedShareTarget';

COMMENT ON FUNCTION "qti"."__reader_news_placed_variable_ref_5e3iemfk5x"() IS 'the reader of the delta of news of PlacedVariableRef';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_variable_ref_dn2glrd3lt"() IS 'the reader of the delta of olds of PlacedVariableRef';

COMMENT ON FUNCTION "qti"."__reader_news_printed_variable_ref_ubk5ihnmec"() IS 'the reader of the delta of news of PrintedVariableRef';

COMMENT ON FUNCTION "qti"."__reader_news_processing_ukrbdmugqf"() IS 'the reader of the delta of news of Processing';

COMMENT ON FUNCTION "qti"."__reader_olds_processing_e6ojt57liq"() IS 'the reader of the delta of olds of Processing';

COMMENT ON FUNCTION "qti"."__reader_news_reference_yl52yhdu2y"() IS 'the reader of the delta of news of Reference';

COMMENT ON FUNCTION "qti"."__reader_olds_reference_y6dy7rxtrr"() IS 'the reader of the delta of olds of Reference';

COMMENT ON FUNCTION "qti"."__reader_news_reference_path_fggyz5vrtd"() IS 'the reader of the delta of news of ReferencePath';

COMMENT ON FUNCTION "qti"."__reader_olds_reference_path_zxh5cexbjs"() IS 'the reader of the delta of olds of ReferencePath';

COMMENT ON FUNCTION "qti"."__reader_news_resource_document_tqxpbq6sfs"() IS 'the reader of the delta of news of ResourceDocument';

COMMENT ON FUNCTION "qti"."__reader_olds_resource_document_f55lqbsujw"() IS 'the reader of the delta of olds of ResourceDocument';

COMMENT ON FUNCTION "qti"."__reader_news_resource_href_vsg6df7oe4"() IS 'the reader of the delta of news of ResourceHref';

COMMENT ON FUNCTION "qti"."__reader_olds_resource_href_cfbutdrgsp"() IS 'the reader of the delta of olds of ResourceHref';

COMMENT ON FUNCTION "qti"."__reader_news_resource_href_outside_wxigucqskt"() IS 'the reader of the delta of news of ResourceHrefOutside';

COMMENT ON FUNCTION "qti"."__reader_olds_resource_href_outside_kevcofdnuw"() IS 'the reader of the delta of olds of ResourceHrefOutside';

COMMENT ON FUNCTION "qti"."__reader_news_resource_href_path_3v6u2nzztp"() IS 'the reader of the delta of news of ResourceHrefPath';

COMMENT ON FUNCTION "qti"."__reader_olds_resource_href_path_p75iaa3qwz"() IS 'the reader of the delta of olds of ResourceHrefPath';

COMMENT ON FUNCTION "qti"."__reader_news_rounding_kyigekxom2"() IS 'the reader of the delta of news of Rounding';

COMMENT ON FUNCTION "qti"."__reader_olds_rounding_c3xfz6vjgg"() IS 'the reader of the delta of olds of Rounding';

COMMENT ON FUNCTION "qti"."__reader_news_rounding_figures_6tzdykdolc"() IS 'the reader of the delta of news of RoundingFigures';

COMMENT ON FUNCTION "qti"."__reader_olds_rounding_figures_xmjid2fhmc"() IS 'the reader of the delta of olds of RoundingFigures';

COMMENT ON FUNCTION "qti"."__reader_news_rounding_mode_figures_dhlctgerv6"() IS 'the reader of the delta of news of RoundingModeFigures';

COMMENT ON FUNCTION "qti"."__reader_olds_rounding_mode_figures_exlaqenlsg"() IS 'the reader of the delta of olds of RoundingModeFigures';

COMMENT ON FUNCTION "qti"."__reader_news_share_fragment_kygoq7js5f"() IS 'the reader of the delta of news of ShareFragment';

COMMENT ON FUNCTION "qti"."__reader_olds_share_fragment_jovhlpjdca"() IS 'the reader of the delta of olds of ShareFragment';

COMMENT ON FUNCTION "qti"."__reader_news_share_target_ve2tr7xdpn"() IS 'the reader of the delta of news of ShareTarget';

COMMENT ON FUNCTION "qti"."__reader_olds_share_target_afnj3xp7ln"() IS 'the reader of the delta of olds of ShareTarget';

COMMENT ON FUNCTION "qti"."__reader_news_site_dohvl7ns4y"() IS 'the reader of the delta of news of Site';

COMMENT ON FUNCTION "qti"."__reader_olds_site_t2suo7tne3"() IS 'the reader of the delta of olds of Site';

COMMENT ON FUNCTION "qti"."__reader_news_site_path_vx555dvhzt"() IS 'the reader of the delta of news of SitePath';

COMMENT ON FUNCTION "qti"."__reader_olds_site_path_wral7atudy"() IS 'the reader of the delta of olds of SitePath';

COMMENT ON FUNCTION "qti"."__reader_news_site_target_kgcy3ugc2u"() IS 'the reader of the delta of news of SiteTarget';

COMMENT ON FUNCTION "qti"."__reader_olds_site_target_aywdiveo47"() IS 'the reader of the delta of olds of SiteTarget';

COMMENT ON FUNCTION "qti"."__reader_news_srcset_oxqzkt3tbf"() IS 'the reader of the delta of news of Srcset';

COMMENT ON FUNCTION "qti"."__reader_olds_srcset_z3dfrfqjo7"() IS 'the reader of the delta of olds of Srcset';

COMMENT ON FUNCTION "qti"."__reader_news_srcset_candidate_vv4kfykyiq"() IS 'the reader of the delta of news of SrcsetCandidate';

COMMENT ON FUNCTION "qti"."__reader_olds_srcset_candidate_nlpj5le2ah"() IS 'the reader of the delta of olds of SrcsetCandidate';

COMMENT ON FUNCTION "qti"."__reader_news_ssml_scope_ovhd6uzegr"() IS 'the reader of the delta of news of SsmlScope';

COMMENT ON FUNCTION "qti"."__reader_olds_ssml_scope_ktpqteh3mw"() IS 'the reader of the delta of olds of SsmlScope';

COMMENT ON FUNCTION "qti"."__reader_news_stimulus_ref_ifcbds6byo"() IS 'the reader of the delta of news of StimulusRef';

COMMENT ON FUNCTION "qti"."__reader_olds_stimulus_ref_wnn2jyzbyc"() IS 'the reader of the delta of olds of StimulusRef';

COMMENT ON FUNCTION "qti"."__reader_news_template_ref_cfq5rgfr6a"() IS 'the reader of the delta of news of TemplateRef';

COMMENT ON FUNCTION "qti"."__reader_news_text_reference_6vcght4z7s"() IS 'the reader of the delta of news of TextReference';

COMMENT ON FUNCTION "qti"."__reader_olds_text_reference_qmflznk6pt"() IS 'the reader of the delta of olds of TextReference';

COMMENT ON FUNCTION "qti"."__reader_news_text_reference_path_pmvejjwegm"() IS 'the reader of the delta of news of TextReferencePath';

COMMENT ON FUNCTION "qti"."__reader_olds_text_reference_path_xbp6hkt6oi"() IS 'the reader of the delta of olds of TextReferencePath';

COMMENT ON FUNCTION "qti"."__reader_news_tolerance_7i2onti3o6"() IS 'the reader of the delta of news of Tolerance';

COMMENT ON FUNCTION "qti"."__reader_olds_tolerance_yqe5covazd"() IS 'the reader of the delta of olds of Tolerance';

COMMENT ON FUNCTION "qti"."__reader_news_usage_value_gwhiuyasi2"() IS 'the reader of the delta of news of UsageValue';

COMMENT ON FUNCTION "qti"."__reader_olds_usage_value_pfsutilcil"() IS 'the reader of the delta of olds of UsageValue';

COMMENT ON FUNCTION "qti"."__reader_news_usage_value_base_type_yghmxcczvi"() IS 'the reader of the delta of news of UsageValueBaseType';

COMMENT ON FUNCTION "qti"."__reader_olds_usage_value_base_type_repbt65dz5"() IS 'the reader of the delta of olds of UsageValueBaseType';

COMMENT ON FUNCTION "qti"."__reader_news_variable_ref_ovyfyafjwi"() IS 'the reader of the delta of news of VariableRef';

COMMENT ON FUNCTION "qti"."__reader_olds_variable_ref_g7sqkzw5qu"() IS 'the reader of the delta of olds of VariableRef';

COMMENT ON FUNCTION "qti"."__judge_area_mapping_base_type_check_area_mapping_vbbvt7kxjl"() IS 'the rule judge''s block of rule check AreaMapping_base_type of AreaMappingBaseType over its units';

COMMENT ON FUNCTION "qti"."__judge_area_mapping_cardinality_check_area_mapping_6gv7d26uz7"() IS 'the rule judge''s block of rule check AreaMapping_base_type of AreaMappingCardinality over its units';

COMMENT ON FUNCTION "qti"."__judge_aria_bounds_check_aria_value_range_hmwtcdgss2"() IS 'the rule judge''s block of rule check Aria_value_range of AriaBounds over its units';

COMMENT ON FUNCTION "qti"."__judge_aria_bounds_check_key_text_bound_7ahvc35o6n"() IS 'the rule judge''s block of rule check Key_text_bound of AriaBounds over its units';

COMMENT ON FUNCTION "qti"."__judge_base_type_cardinality_check_declaration_base_65zmamfgpz"() IS 'the rule judge''s block of rule check Declaration_base_type of BaseTypeCardinality over its units';

COMMENT ON FUNCTION "qti"."__judge_binding_base_type_node_check_binding_fit_dtnmhn2xu6"() IS 'the rule judge''s block of rule check BindingFit of BindingBaseTypeNode over its units';

COMMENT ON FUNCTION "qti"."__judge_binding_cardinality_node_check_binding_fit_2j7szprjdn"() IS 'the rule judge''s block of rule check BindingFit of BindingCardinalityNode over its units';

COMMENT ON FUNCTION "qti"."__judge_bound_range_check_choice_bounds_4du7jw63of"() IS 'the rule judge''s block of rule check Choice_bounds of BoundRange over its units';

COMMENT ON FUNCTION "qti"."__judge_catalog_scope_node_check_e_1_derived_t635cl6ulf"() IS 'the rule judge''s block of rule check E1_derived of CatalogScopeNode over its units';

COMMENT ON FUNCTION "qti"."__judge_cell_leaf_node_check_math_ml_align_first_f3gw4umj4x"() IS 'the rule judge''s block of rule check MathML_align_first of CellLeafNode over its units';

COMMENT ON FUNCTION "qti"."__judge_choice_node_check_e_1_derived_f2privbzko"() IS 'the rule judge''s block of rule check E1_derived of ChoiceNode over its units';

COMMENT ON FUNCTION "qti"."__judge_count_bound_node_check_e_1_derived_qk6a3qud4t"() IS 'the rule judge''s block of rule check E1_derived of CountBoundNode over its units';

COMMENT ON FUNCTION "qti"."__judge_declaration_name_check_reserved_type_nkekxotfo3"() IS 'the rule judge''s block of rule check Reserved_type of DeclarationName over its units';

COMMENT ON FUNCTION "qti"."__judge_declared_identifier_text_check_key_text_m6seqzyjan"() IS 'the rule judge''s block of rule check Key_text_bound of DeclaredIdentifierText over its units';

COMMENT ON FUNCTION "qti"."__judge_declared_placement_check_e_1_derived_ja6uhbay62"() IS 'the rule judge''s block of rule check E1_derived of DeclaredPlacement over its units';

COMMENT ON FUNCTION "qti"."__judge_dependency_resolved_check_self_dependency_3mpep6kyfo"() IS 'the rule judge''s block of rule check Self_dependency of DependencyResolved over its units';

COMMENT ON FUNCTION "qti"."__judge_expression_node_check_e_1_derived_vjgpwbwxp5"() IS 'the rule judge''s block of rule check E1_derived of ExpressionNode over its units';

COMMENT ON FUNCTION "qti"."__judge_expression_node_check_outcome_only_mf4ajqclua"() IS 'the rule judge''s block of rule check Outcome_only of ExpressionNode over its units';

COMMENT ON FUNCTION "qti"."__judge_expression_operand_check_arity_h3fpaucurm"() IS 'the rule judge''s block of rule check Arity of ExpressionOperand over its units';

COMMENT ON FUNCTION "qti"."__judge_feedback_ref_base_type_check_feedback_opv6x6hwk3"() IS 'the rule judge''s block of rule check Feedback_outcome_type of FeedbackRefBaseType over its units';

COMMENT ON FUNCTION "qti"."__judge_feedback_ref_cardinality_check_feedback_ld3w3sbyqa"() IS 'the rule judge''s block of rule check Feedback_outcome_type of FeedbackRefCardinality over its units';

COMMENT ON FUNCTION "qti"."__judge_field_value_text_check_typed_value_3fonowmjdy"() IS 'the rule judge''s block of rule check Typed_value of FieldValueText over its units';

COMMENT ON FUNCTION "qti"."__judge_held_type_check_lookup_type_eeyboguwmv"() IS 'the rule judge''s block of rule check Lookup_type of HeldType over its units';

COMMENT ON FUNCTION "qti"."__judge_held_type_check_set_type_iv775doths"() IS 'the rule judge''s block of rule check Set_type of HeldType over its units';

COMMENT ON FUNCTION "qti"."__judge_hotspot_node_check_graphic_gap_match_default_useo4a2ki7"() IS 'the rule judge''s block of rule check Graphic_gap_match_default_hotspot of HotspotNode over its units';

COMMENT ON FUNCTION "qti"."__judge_hotspot_node_check_default_hotspot_last_slot_sful3zbomb"() IS 'the rule judge''s block of rule check default_hotspot_last_slot of HotspotNode over its units';

COMMENT ON FUNCTION "qti"."__judge_hottext_node_check_e_1_derived_wrvhgypgpu"() IS 'the rule judge''s block of rule check E1_derived of HottextNode over its units';

COMMENT ON FUNCTION "qti"."__judge_identity_text_node_check_e_1_derived_tzgze4koz4"() IS 'the rule judge''s block of rule check E1_derived of IdentityTextNode over its units';

COMMENT ON FUNCTION "qti"."__judge_integer_aggregate_check_e_1_derived_nm5w2xi4qv"() IS 'the rule judge''s block of rule check E1_derived of IntegerAggregate over its units';

COMMENT ON FUNCTION "qti"."__judge_interaction_node_check_e_1_derived_gsg3uyj6r6"() IS 'the rule judge''s block of rule check E1_derived of InteractionNode over its units';

COMMENT ON FUNCTION "qti"."__judge_interaction_node_check_pci_module_source_sxhev27aby"() IS 'the rule judge''s block of rule check PCI_module_source of InteractionNode over its units';

COMMENT ON FUNCTION "qti"."__judge_item_read_check_e_1_derived_3bv7mipop2"() IS 'the rule judge''s block of rule check E1_derived of ItemRead over its units';

COMMENT ON FUNCTION "qti"."__judge_least_choice_bound_check_choice_bounds_2f2s5bi4n6"() IS 'the rule judge''s block of rule check Choice_bounds of LeastChoiceBound over its units';

COMMENT ON FUNCTION "qti"."__judge_least_count_node_check_e_1_derived_e3h3g2puhg"() IS 'the rule judge''s block of rule check E1_derived of LeastCountNode over its units';

COMMENT ON FUNCTION "qti"."__judge_link_spelling_check_e_1_derived_phocyuud2q"() IS 'the rule judge''s block of rule check E1_derived of LinkSpelling over its units';

COMMENT ON FUNCTION "qti"."__judge_lookup_table_cardinality_check_lookup_table_d4wyndjih6"() IS 'the rule judge''s block of rule check Lookup_table_cardinality of LookupTableCardinality over its units';

COMMENT ON FUNCTION "qti"."__judge_lookup_value_type_check_typed_attribute_f5j4ascqkt"() IS 'the rule judge''s block of rule check Typed_attribute_value of LookupValueType over its units';

COMMENT ON FUNCTION "qti"."__judge_map_key_type_check_typed_attribute_value_navjfnrwuq"() IS 'the rule judge''s block of rule check Typed_attribute_value of MapKeyType over its units';

COMMENT ON FUNCTION "qti"."__judge_mapping_cardinality_check_mappable_base_type_7gln5pnyuv"() IS 'the rule judge''s block of rule check MappableBaseType of MappingCardinality over its units';

COMMENT ON FUNCTION "qti"."__judge_mastery_ceiling_check_mastery_range_4i2qquzstz"() IS 'the rule judge''s block of rule check Mastery_range of MasteryCeiling over its units';

COMMENT ON FUNCTION "qti"."__judge_mastery_floor_check_mastery_range_s5dxz43onz"() IS 'the rule judge''s block of rule check Mastery_range of MasteryFloor over its units';

COMMENT ON FUNCTION "qti"."__judge_math_action_node_check_math_ml_maction_6gm4fxi4jn"() IS 'the rule judge''s block of rule check MathML_maction_selection of MathActionNode over its units';

COMMENT ON FUNCTION "qti"."__judge_math_operand_check_arity_zqvhbpyc45"() IS 'the rule judge''s block of rule check Arity of MathOperand over its units';

COMMENT ON FUNCTION "qti"."__judge_math_rank_step_check_e_1_derived_lg5rfykqw3"() IS 'the rule judge''s block of rule check E1_derived of MathRankStep over its units';

COMMENT ON FUNCTION "qti"."__judge_most_choice_bound_check_choice_bounds_dtq5yf2obh"() IS 'the rule judge''s block of rule check Choice_bounds of MostChoiceBound over its units';

COMMENT ON FUNCTION "qti"."__judge_most_count_node_check_e_1_derived_k6c523eg7j"() IS 'the rule judge''s block of rule check E1_derived of MostCountNode over its units';

COMMENT ON FUNCTION "qti"."__judge_named_declaration_check_reserved_type_chrs422ywy"() IS 'the rule judge''s block of rule check Reserved_type of NamedDeclaration over its units';

COMMENT ON FUNCTION "qti"."__judge_non_container_strings_check_choice_bounds_kko2styb5d"() IS 'the rule judge''s block of rule check Choice_bounds of NonContainerStrings over its units';

COMMENT ON FUNCTION "qti"."__judge_numbered_spelling_check_e_1_derived_7mahzvdfti"() IS 'the rule judge''s block of rule check E1_derived of NumberedSpelling over its units';

COMMENT ON FUNCTION "qti"."__judge_one_tail_cardinality_check_e_1_derived_clhhfdqycd"() IS 'the rule judge''s block of rule check E1_derived of OneTailCardinality over its units';

COMMENT ON FUNCTION "qti"."__judge_open_name_node_check_foreign_element_class_j2r66vmdbu"() IS 'the rule judge''s block of rule check Foreign_element_class of OpenNameNode over its units';

COMMENT ON FUNCTION "qti"."__judge_open_name_node_check_open_element_name_s54scc7n7x"() IS 'the rule judge''s block of rule check OpenElementName_canonical of OpenNameNode over its units';

COMMENT ON FUNCTION "qti"."__judge_open_name_under_foreign_check_foreign_xhbzejenir"() IS 'the rule judge''s block of rule check Foreign_element_class of OpenNameUnderForeign over its units';

COMMENT ON FUNCTION "qti"."__judge_open_type_node_check_e_1_derived_dly4j6sqja"() IS 'the rule judge''s block of rule check E1_derived of OpenTypeNode over its units';

COMMENT ON FUNCTION "qti"."__judge_open_type_node_check_xsi_type_available_464iem2qwm"() IS 'the rule judge''s block of rule check XsiType_available of OpenTypeNode over its units';

COMMENT ON FUNCTION "qti"."__judge_open_type_under_foreign_check_xsi_type_rxp2ma2qer"() IS 'the rule judge''s block of rule check XsiType_available of OpenTypeUnderForeign over its units';

COMMENT ON FUNCTION "qti"."__judge_operand_of_check_e_1_derived_nb3w4o7j2b"() IS 'the rule judge''s block of rule check E1_derived of OperandOf over its units';

COMMENT ON FUNCTION "qti"."__judge_operand_of_check_operand_fit_d6gd7fav4n"() IS 'the rule judge''s block of rule check Operand_fit of OperandOf over its units';

COMMENT ON FUNCTION "qti"."__judge_pattern_text_check_pattern_language_iqe6dtd4lp"() IS 'the rule judge''s block of rule check Pattern_language of PatternText over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_binding_base_type_node_check_binding_xvhza5ewij"() IS 'the rule judge''s block of rule check BindingFit of PlacedBindingBaseTypeNode over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_binding_cardinality_node_check_phrzpun46t"() IS 'the rule judge''s block of rule check BindingFit of PlacedBindingCardinalityNode over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_expression_node_check_condition_type_3bunwkqcbd"() IS 'the rule judge''s block of rule check Condition_type of PlacedExpressionNode over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_math_rank_step_check_e_1_derived_44qtccx425"() IS 'the rule judge''s block of rule check E1_derived of PlacedMathRankStep over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_share_ranks_check_math_ml_share_cycle_jp44afedbw"() IS 'the rule judge''s block of rule check MathML_share_cycle of PlacedShareRanks over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_single_binding_most_check_binding_a3chetzcdj"() IS 'the rule judge''s block of rule check Binding_cardinality of PlacedSingleBindingMost over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_base_check_e_1_derived_u7ameqp2wa"() IS 'the rule judge''s block of rule check E1_derived of PlacedVariableBase over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_cardinality_check_e_1_4tqyesyob5"() IS 'the rule judge''s block of rule check E1_derived of PlacedVariableCardinality over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_ref_declaration_check_mapped_dqjqvafv3k"() IS 'the rule judge''s block of rule check Mapped_response of PlacedVariableRefDeclaration over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_ref_declaration_check_rucmcgffwr"() IS 'the rule judge''s block of rule check Reference_type of PlacedVariableRefDeclaration over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_ref_declaration_check_lkx5utf5ih"() IS 'the rule judge''s block of rule check Template_reads of PlacedVariableRefDeclaration over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_ref_node_check_lookup_type_tk44wd5u3g"() IS 'the rule judge''s block of rule check Lookup_type of PlacedVariableRefNode over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_ref_node_check_mapped_jl6t6uelc6"() IS 'the rule judge''s block of rule check Mapped_response of PlacedVariableRefNode over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_ref_node_check_template_ov2shdxu27"() IS 'the rule judge''s block of rule check Template_reads of PlacedVariableRefNode over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_ref_node_check_variable_iq4iejaqqi"() IS 'the rule judge''s block of rule check Variable_declared of PlacedVariableRefNode over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_ref_node_check_variable_kind_5pls5xgmjy"() IS 'the rule judge''s block of rule check Variable_kind of PlacedVariableRefNode over its units';

COMMENT ON FUNCTION "qti"."__judge_pointer_parse_check_include_parse_xjjcr3lomz"() IS 'the rule judge''s block of rule check Include_parse of PointerParse over its units';

COMMENT ON FUNCTION "qti"."__judge_printed_integer_base_type_check_printed_3gvfsj3vqr"() IS 'the rule judge''s block of rule check Printed_variable_type of PrintedIntegerBaseType over its units';

COMMENT ON FUNCTION "qti"."__judge_printed_integer_cardinality_check_printed_ir26otjqgb"() IS 'the rule judge''s block of rule check Printed_variable_type of PrintedIntegerCardinality over its units';

COMMENT ON FUNCTION "qti"."__judge_processing_node_check_e_1_derived_wu433y4myj"() IS 'the rule judge''s block of rule check E1_derived of ProcessingNode over its units';

COMMENT ON FUNCTION "qti"."__judge_quotation_end_check_quotation_punctuation_cwkcvvg47q"() IS 'the rule judge''s block of rule check Quotation_punctuation of QuotationEnd over its units';

COMMENT ON FUNCTION "qti"."__judge_reference_lexical_check_e_1_derived_so5wjosqpr"() IS 'the rule judge''s block of rule check E1_derived of ReferenceLexical over its units';

COMMENT ON FUNCTION "qti"."__judge_rooted_declaration_check_declaration_not_2inoiyq7e7"() IS 'the rule judge''s block of rule check Declaration_not_reserved of RootedDeclaration over its units';

COMMENT ON FUNCTION "qti"."__judge_scope_duration_read_check_e_1_derived_h4wkmwixwz"() IS 'the rule judge''s block of rule check E1_derived of ScopeDurationRead over its units';

COMMENT ON FUNCTION "qti"."__judge_scope_node_check_e_1_derived_3dad34kfvh"() IS 'the rule judge''s block of rule check E1_derived of ScopeNode over its units';

COMMENT ON FUNCTION "qti"."__judge_scope_node_check_math_ml_align_placement_hdcsqb4fxp"() IS 'the rule judge''s block of rule check MathML_align_placement of ScopeNode over its units';

COMMENT ON FUNCTION "qti"."__judge_scoped_dir_check_e_1_derived_wqbohu3ynf"() IS 'the rule judge''s block of rule check E1_derived of ScopedDir over its units';

COMMENT ON FUNCTION "qti"."__judge_set_cardinality_check_value_cardinality_rxpjhnrtxo"() IS 'the rule judge''s block of rule check Value_cardinality of SetCardinality over its units';

COMMENT ON FUNCTION "qti"."__judge_share_fragment_value_check_e_1_derived_kaj45dolum"() IS 'the rule judge''s block of rule check E1_derived of ShareFragmentValue over its units';

COMMENT ON FUNCTION "qti"."__judge_share_ranks_check_math_ml_share_cycle_emd6d3su7u"() IS 'the rule judge''s block of rule check MathML_share_cycle of ShareRanks over its units';

COMMENT ON FUNCTION "qti"."__judge_single_binding_most_check_binding_oohj5ytx5p"() IS 'the rule judge''s block of rule check Binding_cardinality of SingleBindingMost over its units';

COMMENT ON FUNCTION "qti"."__judge_slider_bounds_check_slider_bounds_kgdtbytjgi"() IS 'the rule judge''s block of rule check Slider_bounds of SliderBounds over its units';

COMMENT ON FUNCTION "qti"."__judge_srcset_form_check_e_1_derived_ryxd5oenjl"() IS 'the rule judge''s block of rule check E1_derived of SrcsetForm over its units';

COMMENT ON FUNCTION "qti"."__judge_ssml_scope_node_check_e_1_derived_xxmdva6ob4"() IS 'the rule judge''s block of rule check E1_derived of SsmlScopeNode over its units';

COMMENT ON FUNCTION "qti"."__judge_structure_node_check_e_1_derived_ah2xofzgc2"() IS 'the rule judge''s block of rule check E1_derived of StructureNode over its units';

COMMENT ON FUNCTION "qti"."__judge_template_ref_base_type_check_template_glvnjm7a4w"() IS 'the rule judge''s block of rule check Template_variable_type of TemplateRefBaseType over its units';

COMMENT ON FUNCTION "qti"."__judge_template_ref_cardinality_check_template_fsupn566fi"() IS 'the rule judge''s block of rule check Template_variable_type of TemplateRefCardinality over its units';

COMMENT ON FUNCTION "qti"."__judge_test_identifier_text_check_key_text_bound_ggh323bcnn"() IS 'the rule judge''s block of rule check Key_text_bound of TestIdentifierText over its units';

COMMENT ON FUNCTION "qti"."__judge_text_reference_string_value_check_e_1_ykri7ikuz3"() IS 'the rule judge''s block of rule check E1_derived of TextReferenceStringValue over its units';

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

COMMENT ON FUNCTION "qti"."__judge_arity_floor_in_expression_operand_7uj7tkdxnn"() IS 'the rule judge''s block of rule ArityFloor(package, path, start, min) in ExpressionOperand(package, path, operator, rank) over its units';

COMMENT ON FUNCTION "qti"."__judge_assembled_document_in_document_s4ejk6f67k"() IS 'the rule judge''s block of rule AssembledDocument(package, path) in Document(package, path) where Logic.eq(assembled, true) over the rows a write adds to AssembledDocument';

COMMENT ON FUNCTION "qti"."__judge_assembled_document_in_document_lr74ktyss2"() IS 'the rule judge''s block of rule AssembledDocument(package, path) in Document(package, path) where Logic.eq(assembled, true) over the rows a write removes from Document';

COMMENT ON FUNCTION "qti"."__judge_assembled_document_in_instance_document_oncsn3m2jk"() IS 'the rule judge''s block of rule AssembledDocument(package, path) in InstanceDocument(package, document) over its units';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_label_use_pvrbgrtag3"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.in(kind, ["a", "abbr", "acronym", "address", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blockquote", "br", "caption", "cite", "code", "col", "colgroup", "dd", "details", "dfn", "div", "dl", "dt", "em", "figcaption", "figure", "footer", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr", "i", "img", "kbd", "label", "li", "nav", "object", "ol", "p", "picture", "pre", "q", "qti-assessment-item", "qti-associable-hotspot", "qti-associate-interaction", "qti-choice-interaction", "qti-custom-interaction", "qti-drawing-interaction", "qti-end-attempt-interaction", "qti-extended-text-interaction", "qti-feedback-block", "qti-feedback-block.template", "qti-feedback-inline", "qti-gap", "qti-gap-img", "qti-gap-match-interaction", "qti-gap-text", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-choice", "qti-hotspot-interaction", "qti-hottext", "qti-hottext-interaction", "qti-inline-choice", "qti-inline-choice-interaction", "qti-item-body", "qti-label", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-portable-custom-interaction", "qti-position-object-interaction", "qti-prompt", "qti-rubric-block", "qti-rubric-block.test", "qti-select-point-interaction", "qti-simple-associable-choice", "qti-simple-choice", "qti-slider-interaction", "qti-stimulus-body", "qti-template-block", "qti-template-block.rubric", "qti-template-inline", "qti-template-inline.rubric", "qti-text-entry-interaction", "qti-upload-interaction", "rb", "rp", "rt", "rtc", "ruby", "samp", "section", "small", "source", "span", "strong", "sub", "summary", "sup", "table", "tbody", "td", "tfoot", "th", "thead", "tr", "track", "tt", "ul", "var", "video"]) and Logic.eq(name, "label") in LabelUse(package, path, start) over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_label_use_4c464bmztk"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.in(kind, ["a", "abbr", "acronym", "address", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blockquote", "br", "caption", "cite", "code", "col", "colgroup", "dd", "details", "dfn", "div", "dl", "dt", "em", "figcaption", "figure", "footer", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr", "i", "img", "kbd", "label", "li", "nav", "object", "ol", "p", "picture", "pre", "q", "qti-assessment-item", "qti-associable-hotspot", "qti-associate-interaction", "qti-choice-interaction", "qti-custom-interaction", "qti-drawing-interaction", "qti-end-attempt-interaction", "qti-extended-text-interaction", "qti-feedback-block", "qti-feedback-block.template", "qti-feedback-inline", "qti-gap", "qti-gap-img", "qti-gap-match-interaction", "qti-gap-text", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-choice", "qti-hotspot-interaction", "qti-hottext", "qti-hottext-interaction", "qti-inline-choice", "qti-inline-choice-interaction", "qti-item-body", "qti-label", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-portable-custom-interaction", "qti-position-object-interaction", "qti-prompt", "qti-rubric-block", "qti-rubric-block.test", "qti-select-point-interaction", "qti-simple-associable-choice", "qti-simple-choice", "qti-slider-interaction", "qti-stimulus-body", "qti-template-block", "qti-template-block.rubric", "qti-template-inline", "qti-template-inline.rubric", "qti-text-entry-interaction", "qti-upload-interaction", "rb", "rp", "rt", "rtc", "ruby", "samp", "section", "small", "source", "span", "strong", "sub", "summary", "sup", "table", "tbody", "td", "tfoot", "th", "thead", "tr", "track", "tt", "ul", "var", "video"]) and Logic.eq(name, "label") in LabelUse(package, path, start) over the rows a write removes from LabelUse';

COMMENT ON FUNCTION "qti"."__judge_attribute_lexical_kind_name_in_tolerance_bldm4hsw4e"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.in(lexical, ["absolute", "relative"]) and Logic.eq(kind, "qti-equal") and Logic.eq(name, "tolerance-mode") in Tolerance(package, path, start) over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_attribute_lexical_kind_name_in_tolerance_jdzwic5flb"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.in(lexical, ["absolute", "relative"]) and Logic.eq(kind, "qti-equal") and Logic.eq(name, "tolerance-mode") in Tolerance(package, path, start) over the rows a write removes from Tolerance';

COMMENT ON FUNCTION "qti"."__judge_attribute_governor_kind_name_in_document_id_zrggbqqifb"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.or(Logic.and(ValueIdentity.has(AttributeGrammar.at("domain", AttributeModelOf.at("model", governor), name)), Logic.eq(ValueIdentity.at("identity", AttributeGrammar.at("domain", AttributeModelOf.at("model", governor), name)), "ID")), Logic.and(Logic.eq(kind, "qti-context-declaration"), Logic.eq(name, "identifier"))) in DocumentId(package, path, start) over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_attribute_governor_kind_name_in_document_id_4ge5qfvlgh"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.or(Logic.and(ValueIdentity.has(AttributeGrammar.at("domain", AttributeModelOf.at("model", governor), name)), Logic.eq(ValueIdentity.at("identity", AttributeGrammar.at("domain", AttributeModelOf.at("model", governor), name)), "ID")), Logic.and(Logic.eq(kind, "qti-context-declaration"), Logic.eq(name, "identifier"))) in DocumentId(package, path, start) over the rows a write removes from DocumentId';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_ssml_scope_5p6664y56j"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.or(Logic.and(Logic.eq(kind, "ssml:lexicon"), Logic.eq(name, "xml:id")), Logic.and(Logic.eq(kind, "ssml:lookup"), Logic.eq(name, "ref")), Logic.and(Logic.eq(kind, "ssml:mark"), Logic.eq(name, "name")), Logic.and(Logic.eq(kind, "ssml:speak"), Logic.eq(name, "endmark")), Logic.and(Logic.eq(kind, "ssml:speak"), Logic.eq(name, "startmark"))) in SsmlScope(package, path, start) over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_ssml_scope_jftenhjgwk"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.or(Logic.and(Logic.eq(kind, "ssml:lexicon"), Logic.eq(name, "xml:id")), Logic.and(Logic.eq(kind, "ssml:lookup"), Logic.eq(name, "ref")), Logic.and(Logic.eq(kind, "ssml:mark"), Logic.eq(name, "name")), Logic.and(Logic.eq(kind, "ssml:speak"), Logic.eq(name, "endmark")), Logic.and(Logic.eq(kind, "ssml:speak"), Logic.eq(name, "startmark"))) in SsmlScope(package, path, start) over the rows a write removes from SsmlScope';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_path_in_file_jqkfs7vycs"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.eq(kind, "cp:file") and Logic.eq(name, "href") and Logic.eq(path, "imsmanifest.xml") in File(package, path, start) over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_path_in_file_3fiybeq3yt"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.eq(kind, "cp:file") and Logic.eq(name, "href") and Logic.eq(path, "imsmanifest.xml") in File(package, path, start) over the rows a write removes from File';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_path_in_resource_href_lqpsglpydj"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.eq(kind, "cp:resource") and Logic.eq(name, "href") and Logic.eq(path, "imsmanifest.xml") in ResourceHref(package, path, start) over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_path_in_resource_href_ds55o7lpdg"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.eq(kind, "cp:resource") and Logic.eq(name, "href") and Logic.eq(path, "imsmanifest.xml") in ResourceHref(package, path, start) over the rows a write removes from ResourceHref';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_stimulus_ref_xw3wcg5tnr"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.eq(kind, "qti-assessment-stimulus-ref") and Logic.eq(name, "identifier") in StimulusRef(package, path, start) over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_stimulus_ref_gcbbze5ima"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.eq(kind, "qti-assessment-stimulus-ref") and Logic.eq(name, "identifier") in StimulusRef(package, path, start) over the rows a write removes from StimulusRef';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_tolerance_2ub2yr6o5n"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.eq(kind, "qti-equal") and Logic.eq(name, "tolerance") in Tolerance(package, path, start) over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_tolerance_xdhohhppto"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.eq(kind, "qti-equal") and Logic.eq(name, "tolerance") in Tolerance(package, path, start) over the rows a write removes from Tolerance';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_pci_module_form_7xexnu4ber"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.eq(kind, "qti-portable-custom-interaction") and Logic.eq(name, "module") in PciModuleForm(package, path, start) where Logic.eq(element, false) over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_pci_module_form_buwozzctmc"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.eq(kind, "qti-portable-custom-interaction") and Logic.eq(name, "module") in PciModuleForm(package, path, start) where Logic.eq(element, false) over the rows a write removes from PciModuleForm';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_srcset_fngqelvgvl"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.eq(kind, "source") and Logic.eq(name, "srcset") in Srcset(package, path, start) over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_srcset_vrztobcjsu"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.eq(kind, "source") and Logic.eq(name, "srcset") in Srcset(package, path, start) over the rows a write removes from Srcset';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_lexical_name_in_attribute_m2xch452xb"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.eq(kind, "track") and Logic.eq(lexical, "subtitles") and Logic.eq(name, "kind") in Attribute(package, path, start) where Logic.eq(kind, "track") and Logic.eq(name, "srclang") over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_lexical_name_in_attribute_unluqpy2xw"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.eq(kind, "track") and Logic.eq(lexical, "subtitles") and Logic.eq(name, "kind") in Attribute(package, path, start) where Logic.eq(kind, "track") and Logic.eq(name, "srclang") over the rows a write removes from Attribute';

COMMENT ON FUNCTION "qti"."__judge_attribute_name_in_data_ssml_2jlpes45rm"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.eq(name, "data-ssml") in DataSsml(package, path, start) over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_attribute_name_in_data_ssml_wfvwlhstvy"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.eq(name, "data-ssml") in DataSsml(package, path, start) over the rows a write removes from DataSsml';

COMMENT ON FUNCTION "qti"."__judge_attribute_name_in_catalog_scope_3pxsrlwkrh"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.eq(name, "xml:lang") in CatalogScope(package, path, start) over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_attribute_name_in_catalog_scope_jovrqlkfz4"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.eq(name, "xml:lang") in CatalogScope(package, path, start) over the rows a write removes from CatalogScope';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_rounding_figures_73fwx6kbb4"() IS 'the rule judge''s block of rule Attribute(package, path, start, lexicalDigest) where Logic.in(kind, ["qti-equal-rounded", "qti-round-to"]) and Logic.eq(name, "figures") in RoundingFigures(package, path, start, figuresLexicalDigest) over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_rounding_figures_udayk7yfmf"() IS 'the rule judge''s block of rule Attribute(package, path, start, lexicalDigest) where Logic.in(kind, ["qti-equal-rounded", "qti-round-to"]) and Logic.eq(name, "figures") in RoundingFigures(package, path, start, figuresLexicalDigest) over the rows a write removes from RoundingFigures';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_math_action_pi5kawylw7"() IS 'the rule judge''s block of rule Attribute(package, path, start, lexicalDigest) where Logic.eq(kind, "m:maction") and Logic.eq(name, "selection") in MathAction(package, path, start, selectionLexicalDigest) where Logic.eq(selectionWritten, true) over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_math_action_z4ukxdfjlo"() IS 'the rule judge''s block of rule Attribute(package, path, start, lexicalDigest) where Logic.eq(kind, "m:maction") and Logic.eq(name, "selection") in MathAction(package, path, start, selectionLexicalDigest) where Logic.eq(selectionWritten, true) over the rows a write removes from MathAction';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_reference_vm3zio74rn"() IS 'the rule judge''s block of rule Attribute(package, path, start, name, kind) where Logic.in(ReferenceAttribute.at("form", kind, name), ["module", "package", "uri"]) in Reference(package, path, start, name, kind) over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_reference_b27ug5yqcy"() IS 'the rule judge''s block of rule Attribute(package, path, start, name, kind) where Logic.in(ReferenceAttribute.at("form", kind, name), ["module", "package", "uri"]) in Reference(package, path, start, name, kind) over the rows a write removes from Reference';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_interaction_attribute_vlbassbzx3"() IS 'the rule judge''s block of rule Attribute(package, path, start, name, kind, lexicalDigest) where Logic.or(Logic.in(name, ["aria-valuemax", "aria-valuemin"]), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-context-variable", "qti-gap", "qti-gap-img", "qti-gap-text", "qti-hotspot-choice", "qti-hottext", "qti-inline-choice", "qti-printed-variable", "qti-simple-associable-choice", "qti-simple-choice"]), Logic.eq(name, "identifier")), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-gap", "qti-gap-img", "qti-gap-text", "qti-hotspot-choice", "qti-hottext", "qti-inline-choice", "qti-simple-associable-choice", "qti-simple-choice", "qti-template-block", "qti-template-block.rubric", "qti-template-inline", "qti-template-inline.rubric", "qti-template-variable"]), Logic.eq(name, "template-identifier")), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-gap-img", "qti-gap-text", "qti-simple-associable-choice"]), Logic.eq(name, "match-max")), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-gap-img", "qti-gap-text", "qti-simple-associable-choice"]), Logic.eq(name, "match-min")), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-hotspot-choice"]), Logic.eq(name, "shape")), Logic.and(Logic.in(kind, ["qti-associate-interaction", "qti-choice-interaction", "qti-custom-interaction", "qti-drawing-interaction", "qti-end-attempt-interaction", "qti-extended-text-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-inline-choice-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-portable-custom-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-slider-interaction", "qti-text-entry-interaction", "qti-upload-interaction"]), Logic.eq(name, "response-identifier")), Logic.and(Logic.in(kind, ["qti-associate-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-match-interaction"]), Logic.eq(name, "max-associations")), Logic.and(Logic.in(kind, ["qti-associate-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-match-interaction"]), Logic.eq(name, "min-associations")), Logic.and(Logic.in(kind, ["qti-choice-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-order-interaction", "qti-position-object-interaction", "qti-select-point-interaction"]), Logic.eq(name, "max-choices")), Logic.and(Logic.in(kind, ["qti-choice-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-order-interaction", "qti-position-object-interaction", "qti-select-point-interaction"]), Logic.eq(name, "min-choices")), Logic.and(Logic.in(kind, ["qti-extended-text-interaction", "qti-text-entry-interaction"]), Logic.eq(name, "string-identifier")), Logic.and(Logic.in(kind, ["qti-feedback-block", "qti-feedback-block.template", "qti-feedback-inline", "qti-modal-feedback", "qti-test-feedback"]), Logic.eq(name, "outcome-identifier")), Logic.and(Logic.eq(kind, "qti-assessment-item"), Logic.eq(name, "adaptive")), Logic.and(Logic.eq(kind, "qti-extended-text-interaction"), Logic.eq(name, "max-strings")), Logic.and(Logic.eq(kind, "qti-extended-text-interaction"), Logic.eq(name, "min-strings")), Logic.and(Logic.eq(kind, "qti-media-interaction"), Logic.eq(name, "max-plays")), Logic.and(Logic.eq(kind, "qti-media-interaction"), Logic.eq(name, "min-plays")), Logic.and(Logic.eq(kind, "qti-printed-variable"), Logic.eq(name, "base")), Logic.and(Logic.eq(kind, "qti-printed-variable"), Logic.eq(name, "index")), Logic.and(Logic.eq(kind, "qti-slider-interaction"), Logic.eq(name, "lower-bound")), Logic.and(Logic.eq(kind, "qti-slider-interaction"), Logic.eq(name, "upper-bound"))) in InteractionAttribute(package, path, start, name, kind, lexicalDigest) over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_interaction_attribute_iexjqtvmzh"() IS 'the rule judge''s block of rule Attribute(package, path, start, name, kind, lexicalDigest) where Logic.or(Logic.in(name, ["aria-valuemax", "aria-valuemin"]), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-context-variable", "qti-gap", "qti-gap-img", "qti-gap-text", "qti-hotspot-choice", "qti-hottext", "qti-inline-choice", "qti-printed-variable", "qti-simple-associable-choice", "qti-simple-choice"]), Logic.eq(name, "identifier")), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-gap", "qti-gap-img", "qti-gap-text", "qti-hotspot-choice", "qti-hottext", "qti-inline-choice", "qti-simple-associable-choice", "qti-simple-choice", "qti-template-block", "qti-template-block.rubric", "qti-template-inline", "qti-template-inline.rubric", "qti-template-variable"]), Logic.eq(name, "template-identifier")), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-gap-img", "qti-gap-text", "qti-simple-associable-choice"]), Logic.eq(name, "match-max")), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-gap-img", "qti-gap-text", "qti-simple-associable-choice"]), Logic.eq(name, "match-min")), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-hotspot-choice"]), Logic.eq(name, "shape")), Logic.and(Logic.in(kind, ["qti-associate-interaction", "qti-choice-interaction", "qti-custom-interaction", "qti-drawing-interaction", "qti-end-attempt-interaction", "qti-extended-text-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-inline-choice-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-portable-custom-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-slider-interaction", "qti-text-entry-interaction", "qti-upload-interaction"]), Logic.eq(name, "response-identifier")), Logic.and(Logic.in(kind, ["qti-associate-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-match-interaction"]), Logic.eq(name, "max-associations")), Logic.and(Logic.in(kind, ["qti-associate-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-match-interaction"]), Logic.eq(name, "min-associations")), Logic.and(Logic.in(kind, ["qti-choice-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-order-interaction", "qti-position-object-interaction", "qti-select-point-interaction"]), Logic.eq(name, "max-choices")), Logic.and(Logic.in(kind, ["qti-choice-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-order-interaction", "qti-position-object-interaction", "qti-select-point-interaction"]), Logic.eq(name, "min-choices")), Logic.and(Logic.in(kind, ["qti-extended-text-interaction", "qti-text-entry-interaction"]), Logic.eq(name, "string-identifier")), Logic.and(Logic.in(kind, ["qti-feedback-block", "qti-feedback-block.template", "qti-feedback-inline", "qti-modal-feedback", "qti-test-feedback"]), Logic.eq(name, "outcome-identifier")), Logic.and(Logic.eq(kind, "qti-assessment-item"), Logic.eq(name, "adaptive")), Logic.and(Logic.eq(kind, "qti-extended-text-interaction"), Logic.eq(name, "max-strings")), Logic.and(Logic.eq(kind, "qti-extended-text-interaction"), Logic.eq(name, "min-strings")), Logic.and(Logic.eq(kind, "qti-media-interaction"), Logic.eq(name, "max-plays")), Logic.and(Logic.eq(kind, "qti-media-interaction"), Logic.eq(name, "min-plays")), Logic.and(Logic.eq(kind, "qti-printed-variable"), Logic.eq(name, "base")), Logic.and(Logic.eq(kind, "qti-printed-variable"), Logic.eq(name, "index")), Logic.and(Logic.eq(kind, "qti-slider-interaction"), Logic.eq(name, "lower-bound")), Logic.and(Logic.eq(kind, "qti-slider-interaction"), Logic.eq(name, "upper-bound"))) in InteractionAttribute(package, path, start, name, kind, lexicalDigest) over the rows a write removes from InteractionAttribute';

COMMENT ON FUNCTION "qti"."__judge_attribute_name_kind_in_cn_attribute_qicmsaveer"() IS 'the rule judge''s block of rule Attribute(package, path, start, name, lexicalDigest) where Logic.in(name, ["base", "type"]) and Logic.eq(kind, "m:cn") in CnAttribute(package, path, start, name, lexicalDigest) over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_attribute_name_kind_in_cn_attribute_fxwkzqewuu"() IS 'the rule judge''s block of rule Attribute(package, path, start, name, lexicalDigest) where Logic.in(name, ["base", "type"]) and Logic.eq(kind, "m:cn") in CnAttribute(package, path, start, name, lexicalDigest) over the rows a write removes from CnAttribute';

COMMENT ON FUNCTION "qti"."__judge_binary_math_operator_in_expression_operand_p4suu7whs6"() IS 'the rule judge''s block of rule BinaryMathOperator(package, path, start) in ExpressionOperand(package, path, operator) where Logic.eq(rank, 2n) over its units';

COMMENT ON FUNCTION "qti"."__judge_binding_base_type_node_in_binding_fit_y7mxaaewyf"() IS 'the rule judge''s block of rule BindingBaseTypeNode(baseType, cardinality, kind) where Logic.not(Logic.in(kind, ["qti-custom-interaction", "qti-order-interaction", "qti-portable-custom-interaction"])) and Logic.eq(attribute, "response-identifier") and Logic.ne(cardinality, "record") in BindingFit(baseType, cardinality, kind) over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_binding_base_type_node_in_binding_fit_7fv2su4ryf"() IS 'the rule judge''s block of rule BindingBaseTypeNode(baseType, cardinality, kind) where Logic.not(Logic.in(kind, ["qti-custom-interaction", "qti-order-interaction", "qti-portable-custom-interaction"])) and Logic.eq(attribute, "response-identifier") and Logic.ne(cardinality, "record") in BindingFit(baseType, cardinality, kind) over the rows a write adds to BoundVariable';

COMMENT ON FUNCTION "qti"."__judge_binding_base_type_node_in_binding_fit_ju5hrdnval"() IS 'the rule judge''s block of rule BindingBaseTypeNode(baseType, cardinality, kind) where Logic.not(Logic.in(kind, ["qti-custom-interaction", "qti-order-interaction", "qti-portable-custom-interaction"])) and Logic.eq(attribute, "response-identifier") and Logic.ne(cardinality, "record") in BindingFit(baseType, cardinality, kind) over the rows a write adds to Node';

COMMENT ON FUNCTION "qti"."__judge_binding_cardinality_node_in_record_binding_iclnept6fm"() IS 'the rule judge''s block of rule BindingCardinalityNode(kind) where Logic.not(Logic.in(kind, ["qti-custom-interaction", "qti-order-interaction", "qti-portable-custom-interaction"])) and Logic.eq(attribute, "response-identifier") and Logic.eq(cardinality, "record") in RecordBindingFit(kind) over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_binding_cardinality_node_in_record_binding_p42scyojqz"() IS 'the rule judge''s block of rule BindingCardinalityNode(kind) where Logic.not(Logic.in(kind, ["qti-custom-interaction", "qti-order-interaction", "qti-portable-custom-interaction"])) and Logic.eq(attribute, "response-identifier") and Logic.eq(cardinality, "record") in RecordBindingFit(kind) over the rows a write adds to BoundVariable';

COMMENT ON FUNCTION "qti"."__judge_binding_cardinality_node_in_record_binding_gvyhf35nko"() IS 'the rule judge''s block of rule BindingCardinalityNode(kind) where Logic.not(Logic.in(kind, ["qti-custom-interaction", "qti-order-interaction", "qti-portable-custom-interaction"])) and Logic.eq(attribute, "response-identifier") and Logic.eq(cardinality, "record") in RecordBindingFit(kind) over the rows a write adds to Node';

COMMENT ON FUNCTION "qti"."__judge_binding_cardinality_node_in_count_bound_qp5cv5srpi"() IS 'the rule judge''s block of rule BindingCardinalityNode(package, path, start) where Logic.in(cardinality, ["multiple", "ordered"]) and Logic.eq(attribute, "response-identifier") and Logic.eq(kind, "qti-extended-text-interaction") in CountBound(package, path, start) where Logic.eq(maxWritten, true) over its units';

COMMENT ON FUNCTION "qti"."__judge_binding_name_in_interaction_attribute_qsamkcqom7"() IS 'the rule judge''s block of rule BindingName(package, path, start) in InteractionAttribute(package, path, start) where Logic.in(kind, ["qti-associate-interaction", "qti-choice-interaction", "qti-custom-interaction", "qti-drawing-interaction", "qti-end-attempt-interaction", "qti-extended-text-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-inline-choice-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-portable-custom-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-slider-interaction", "qti-text-entry-interaction", "qti-upload-interaction"]) and Logic.eq(name, "response-identifier") over the rows a write adds to BindingName';

COMMENT ON FUNCTION "qti"."__judge_binding_name_in_interaction_attribute_6wg2sisfdy"() IS 'the rule judge''s block of rule BindingName(package, path, start) in InteractionAttribute(package, path, start) where Logic.in(kind, ["qti-associate-interaction", "qti-choice-interaction", "qti-custom-interaction", "qti-drawing-interaction", "qti-end-attempt-interaction", "qti-extended-text-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-inline-choice-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-portable-custom-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-slider-interaction", "qti-text-entry-interaction", "qti-upload-interaction"]) and Logic.eq(name, "response-identifier") over the rows a write removes from InteractionAttribute';

COMMENT ON FUNCTION "qti"."__judge_bound_variable_in_named_declaration_6vnbbbteq4"() IS 'the rule judge''s block of rule BoundVariable(package, path, identifier) in NamedDeclaration(package, path, identifier) where Logic.eq(declarationKind, "qti-response-declaration") over its units';

COMMENT ON FUNCTION "qti"."__judge_bound_variable_in_interaction_attribute_hutoawl3p4"() IS 'the rule judge''s block of rule BoundVariable(package, path, start) in InteractionAttribute(package, path, start) where Logic.in(kind, ["qti-associate-interaction", "qti-choice-interaction", "qti-custom-interaction", "qti-drawing-interaction", "qti-end-attempt-interaction", "qti-extended-text-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-inline-choice-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-portable-custom-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-slider-interaction", "qti-text-entry-interaction", "qti-upload-interaction"]) and Logic.eq(name, "response-identifier") over the rows a write adds to BoundVariable';

COMMENT ON FUNCTION "qti"."__judge_bound_variable_in_interaction_attribute_w6knhinxmu"() IS 'the rule judge''s block of rule BoundVariable(package, path, start) in InteractionAttribute(package, path, start) where Logic.in(kind, ["qti-associate-interaction", "qti-choice-interaction", "qti-custom-interaction", "qti-drawing-interaction", "qti-end-attempt-interaction", "qti-extended-text-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-inline-choice-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-portable-custom-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-slider-interaction", "qti-text-entry-interaction", "qti-upload-interaction"]) and Logic.eq(name, "response-identifier") over the rows a write removes from InteractionAttribute';

COMMENT ON FUNCTION "qti"."__judge_branch_resolution_in_resolved_branch_rule_ozlq6aqbel"() IS 'the rule judge''s block of rule BranchResolution(package, assembly, instance, start) in ResolvedBranchRule(package, assembly, instance, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_candidate_path_in_srcset_candidate_qlbfzkjh6h"() IS 'the rule judge''s block of rule CandidatePath(package, path, start, at) in SrcsetCandidate(package, path, start, at) where Logic.eq(scope, "entry") over the rows a write adds to CandidatePath';

COMMENT ON FUNCTION "qti"."__judge_candidate_path_in_srcset_candidate_jvbfsnojbf"() IS 'the rule judge''s block of rule CandidatePath(package, path, start, at) in SrcsetCandidate(package, path, start, at) where Logic.eq(scope, "entry") over the rows a write removes from SrcsetCandidate';

COMMENT ON FUNCTION "qti"."__judge_catalog_scope_node_in_catalog_scope_siyoaubusp"() IS 'the rule judge''s block of rule CatalogScopeNode(package, path, parent, scope) where Logic.ne(kind, "qti-catalog-info") and Logic.ne(parent, 0n) in CatalogScope(package, path, start, scope) over its units';

COMMENT ON FUNCTION "qti"."__judge_cell_child_in_math_align_scope_y6fielkgrs"() IS 'the rule judge''s block of rule CellChild(package, path, start) where Logic.not(Logic.in(kind, ["comment", "doctype", "document", "entityRef", "pi", "text", "ws"])) in MathAlignScope(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_cell_leaf_in_scope_node_mk36zy4u3d"() IS 'the rule judge''s block of rule CellLeaf(package, path, start) in ScopeNode(package, path, start) where Logic.eq(elementChildren, 0n) and Logic.ne(kind, "m:mtd") over its units';

COMMENT ON FUNCTION "qti"."__judge_choice_interaction_interaction_path_path_in_ksu4ntntp4"() IS 'the rule judge''s block of rule ChoiceInteraction(package, path, interactionPath, interaction) where Logic.ne(interactionPath, path) in Document(package, path, contextPath, contextNearest) over the rows a write adds to ChoiceInteraction';

COMMENT ON FUNCTION "qti"."__judge_choice_interaction_interaction_path_path_in_7bd365ysfm"() IS 'the rule judge''s block of rule ChoiceInteraction(package, path, interactionPath, interaction) where Logic.ne(interactionPath, path) in Document(package, path, contextPath, contextNearest) over the rows a write removes from Document';

COMMENT ON FUNCTION "qti"."__judge_choice_node_in_count_bound_r57c36aziu"() IS 'the rule judge''s block of rule ChoiceNode(package, path, start) where Logic.in(kind, ["qti-associable-hotspot", "qti-associate-interaction", "qti-choice-interaction", "qti-extended-text-interaction", "qti-gap-img", "qti-gap-match-interaction", "qti-gap-text", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-simple-associable-choice"]) in CountBound(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_choice_or_hottext_in_unclaimed_name_uyxncalelf"() IS 'the rule judge''s block of rule ChoiceOrHottext(package, path, identifier) in UnclaimedName(package, path, identifier) over its units';

COMMENT ON FUNCTION "qti"."__judge_cn_attribute_in_attribute_itlm5fhjzb"() IS 'the rule judge''s block of rule CnAttribute(package, path, start, name) in Attribute(package, path, start, name) where Logic.in(name, ["base", "type"]) and Logic.eq(kind, "m:cn") over the rows a write removes from Attribute';

COMMENT ON FUNCTION "qti"."__judge_cn_attribute_in_attribute_gqimheyevo"() IS 'the rule judge''s block of rule CnAttribute(package, path, start, name) in Attribute(package, path, start, name) where Logic.in(name, ["base", "type"]) and Logic.eq(kind, "m:cn") over the rows a write adds to CnAttribute';

COMMENT ON FUNCTION "qti"."__judge_cn_count_in_node_ikvut5dwb7"() IS 'the rule judge''s block of rule CnCount(package, path, start) in Node(package, path, start) where Logic.eq(kind, "m:cn") over the rows a write adds to CnCount';

COMMENT ON FUNCTION "qti"."__judge_cn_count_in_node_hgpzinikyj"() IS 'the rule judge''s block of rule CnCount(package, path, start) in Node(package, path, start) where Logic.eq(kind, "m:cn") over the rows a write removes from Node';

COMMENT ON FUNCTION "qti"."__judge_cn_count_type_lexical_in_cn_attribute_ueevxz4g7e"() IS 'the rule judge''s block of rule CnCount(package, path, start, typeLexicalDigest) where Logic.ne(typeLexical, "") in CnAttribute(package, path, start, lexicalDigest) where Logic.eq(name, "type") over the rows a write removes from CnAttribute';

COMMENT ON FUNCTION "qti"."__judge_cn_count_type_lexical_in_cn_attribute_pvt37oqsnt"() IS 'the rule judge''s block of rule CnCount(package, path, start, typeLexicalDigest) where Logic.ne(typeLexical, "") in CnAttribute(package, path, start, lexicalDigest) where Logic.eq(name, "type") over the rows a write adds to CnCount';

COMMENT ON FUNCTION "qti"."__judge_comment_in_node_y3d6b4h64m"() IS 'the rule judge''s block of rule Comment(package, path, start) in Node(package, path, start) where Logic.eq(kind, "comment") over the rows a write adds to Comment';

COMMENT ON FUNCTION "qti"."__judge_comment_in_node_pnihdlw4oe"() IS 'the rule judge''s block of rule Comment(package, path, start) in Node(package, path, start) where Logic.eq(kind, "comment") over the rows a write removes from Node';

COMMENT ON FUNCTION "qti"."__judge_context_ref_in_referable_name_6jyxlcw7hc"() IS 'the rule judge''s block of rule ContextRef(package, path, identifier, kind, attribute) where Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "completionStatus", "duration", "numAttempts"])), Logic.ne(assemblyKind, "qti-assessment-item")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "completionStatus", "duration", "numAttempts"])), Logic.ne(assemblyKind, "qti-response-processing")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "duration"])), Logic.ne(assemblyKind, "qti-assessment-section")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "duration"])), Logic.ne(assemblyKind, "qti-assessment-test")) in ReferableName(package, path, identifier, kind, attribute) over its units';

COMMENT ON FUNCTION "qti"."__judge_count_bound_max_written_in_interaction_ynewhg65ih"() IS 'the rule judge''s block of rule CountBound(package, path, start, maxName) where Logic.eq(maxWritten, true) in InteractionAttribute(package, path, start, name) where Logic.in(kind, ["qti-associable-hotspot", "qti-associate-interaction", "qti-choice-interaction", "qti-extended-text-interaction", "qti-gap-img", "qti-gap-match-interaction", "qti-gap-text", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-simple-associable-choice"]) and Logic.in(name, ["match-max", "max-associations", "max-choices", "max-plays", "max-strings"]) over the rows a write adds to CountBound';

COMMENT ON FUNCTION "qti"."__judge_count_bound_max_written_in_interaction_h76ovx6wwg"() IS 'the rule judge''s block of rule CountBound(package, path, start, maxName) where Logic.eq(maxWritten, true) in InteractionAttribute(package, path, start, name) where Logic.in(kind, ["qti-associable-hotspot", "qti-associate-interaction", "qti-choice-interaction", "qti-extended-text-interaction", "qti-gap-img", "qti-gap-match-interaction", "qti-gap-text", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-simple-associable-choice"]) and Logic.in(name, ["match-max", "max-associations", "max-choices", "max-plays", "max-strings"]) over the rows a write removes from InteractionAttribute';

COMMENT ON FUNCTION "qti"."__judge_count_bound_min_written_in_interaction_u5eerzgux3"() IS 'the rule judge''s block of rule CountBound(package, path, start, minName) where Logic.eq(minWritten, true) in InteractionAttribute(package, path, start, name) where Logic.in(kind, ["qti-associable-hotspot", "qti-associate-interaction", "qti-choice-interaction", "qti-extended-text-interaction", "qti-gap-img", "qti-gap-match-interaction", "qti-gap-text", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-simple-associable-choice"]) and Logic.in(name, ["match-min", "min-associations", "min-choices", "min-plays", "min-strings"]) over the rows a write adds to CountBound';

COMMENT ON FUNCTION "qti"."__judge_count_bound_min_written_in_interaction_be4an44hay"() IS 'the rule judge''s block of rule CountBound(package, path, start, minName) where Logic.eq(minWritten, true) in InteractionAttribute(package, path, start, name) where Logic.in(kind, ["qti-associable-hotspot", "qti-associate-interaction", "qti-choice-interaction", "qti-extended-text-interaction", "qti-gap-img", "qti-gap-match-interaction", "qti-gap-text", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-simple-associable-choice"]) and Logic.in(name, ["match-min", "min-associations", "min-choices", "min-plays", "min-strings"]) over the rows a write removes from InteractionAttribute';

COMMENT ON FUNCTION "qti"."__judge_count_bound_node_in_least_count_c72avmgnm2"() IS 'the rule judge''s block of rule CountBoundNode(package, path, start) where Logic.in(kind, ["qti-associable-hotspot", "qti-associate-interaction", "qti-choice-interaction", "qti-extended-text-interaction", "qti-gap-img", "qti-gap-text", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-match-interaction", "qti-media-interaction", "qti-select-point-interaction", "qti-simple-associable-choice"]) and Logic.eq(minWritten, false) in LeastCount(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_count_bound_node_in_most_count_snojg3c3w3"() IS 'the rule judge''s block of rule CountBoundNode(package, path, start) where Logic.or(Logic.in(kind, ["qti-associate-interaction", "qti-choice-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-match-interaction", "qti-position-object-interaction"]), Logic.in(kind, ["qti-media-interaction", "qti-select-point-interaction"])) and Logic.eq(maxWritten, false) in MostCount(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_data_ssml_in_attribute_5sbn7nx45f"() IS 'the rule judge''s block of rule DataSsml(package, path, start) in Attribute(package, path, start) where Logic.eq(name, "data-ssml") over the rows a write removes from Attribute';

COMMENT ON FUNCTION "qti"."__judge_data_ssml_in_attribute_rkkugcswca"() IS 'the rule judge''s block of rule DataSsml(package, path, start) in Attribute(package, path, start) where Logic.eq(name, "data-ssml") over the rows a write adds to DataSsml';

COMMENT ON FUNCTION "qti"."__judge_declaration_cardinality_in_attribute_is6owvhjpo"() IS 'the rule judge''s block of rule DeclarationCardinality(package, path, start) where Logic.ne(code, "record") in Attribute(package, path, start) where Logic.in(kind, ["qti-context-declaration", "qti-outcome-declaration", "qti-response-declaration", "qti-template-declaration"]) and Logic.eq(name, "base-type") over its units';

COMMENT ON FUNCTION "qti"."__judge_dependency_in_dependency_resolved_vfeitpjvvg"() IS 'the rule judge''s block of rule Dependency(package, start) in DependencyResolved(package, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_described_assembled_lang_in_listed_lang_nhbllkmfq3"() IS 'the rule judge''s block of rule DescribedAssembledLang(package, path, general, value) in ListedLang(package, path, general, lang) over its units';

COMMENT ON FUNCTION "qti"."__judge_described_lang_in_listed_lang_xwyz4nje2x"() IS 'the rule judge''s block of rule DescribedLang(package, path, general, value) in ListedLang(package, path, general, lang) over its units';

COMMENT ON FUNCTION "qti"."__judge_doctype_in_node_xpvcvzwbkn"() IS 'the rule judge''s block of rule Doctype(package, path, start) in Node(package, path, start) where Logic.eq(kind, "doctype") over the rows a write adds to Doctype';

COMMENT ON FUNCTION "qti"."__judge_doctype_in_node_6bpy3l5spi"() IS 'the rule judge''s block of rule Doctype(package, path, start) in Node(package, path, start) where Logic.eq(kind, "doctype") over the rows a write removes from Node';

COMMENT ON FUNCTION "qti"."__judge_document_in_entry_sjapsggrlf"() IS 'the rule judge''s block of rule Document(package, path) in Entry(package, path) where Logic.eq(kind, "document") over the rows a write adds to Document';

COMMENT ON FUNCTION "qti"."__judge_document_in_entry_uhiedw3bac"() IS 'the rule judge''s block of rule Document(package, path) in Entry(package, path) where Logic.eq(kind, "document") over the rows a write removes from Entry';

COMMENT ON FUNCTION "qti"."__judge_document_in_node_bnnn2algs5"() IS 'the rule judge''s block of rule Document(package, path) in Node(package, path) where Logic.eq(kind, "document") and Logic.eq(start, 0n) over the rows a write adds to Document';

COMMENT ON FUNCTION "qti"."__judge_document_in_node_4wxya2yssh"() IS 'the rule judge''s block of rule Document(package, path) in Node(package, path) where Logic.eq(kind, "document") and Logic.eq(start, 0n) over the rows a write removes from Node';

COMMENT ON FUNCTION "qti"."__judge_document_root_kind_in_assembled_document_rhbun5dywe"() IS 'the rule judge''s block of rule Document(package, path) where Logic.in(rootKind, ["qti-assessment-section", "qti-assessment-test"]) in AssembledDocument(package, path) over the rows a write removes from AssembledDocument';

COMMENT ON FUNCTION "qti"."__judge_document_root_kind_in_assembled_document_vjyb66cn7y"() IS 'the rule judge''s block of rule Document(package, path) where Logic.in(rootKind, ["qti-assessment-section", "qti-assessment-test"]) in AssembledDocument(package, path) over the rows a write adds to Document';

COMMENT ON FUNCTION "qti"."__judge_document_assembled_in_assembled_document_fcmhwklsat"() IS 'the rule judge''s block of rule Document(package, path) where Logic.eq(assembled, true) in AssembledDocument(package, path) over the rows a write removes from AssembledDocument';

COMMENT ON FUNCTION "qti"."__judge_document_assembled_in_assembled_document_5ti73cc46n"() IS 'the rule judge''s block of rule Document(package, path) where Logic.eq(assembled, true) in AssembledDocument(package, path) over the rows a write adds to Document';

COMMENT ON FUNCTION "qti"."__judge_document_document_type_in_resource_document_fpvjwkioup"() IS 'the rule judge''s block of rule Document(package, path) where Logic.ne(documentType, "manifest") in ResourceDocument(package, path) over the rows a write adds to Document';

COMMENT ON FUNCTION "qti"."__judge_document_document_type_in_resource_document_lqqhjrb5mf"() IS 'the rule judge''s block of rule Document(package, path) where Logic.ne(documentType, "manifest") in ResourceDocument(package, path) over the rows a write removes from ResourceDocument';

COMMENT ON FUNCTION "qti"."__judge_document_in_node_pghsppcojb"() IS 'the rule judge''s block of rule Document(package, path, nodeChildren, context, contextNearest, contextNearestKind, contextPath) in Node(package, path, children, ancestry, nearest, nearestKind, nearestPath) where Logic.eq(governor, "document") and Logic.eq(kind, "document") and Logic.eq(parentKind, "document") and Logic.eq(start, 0n) over the rows a write adds to Document';

COMMENT ON FUNCTION "qti"."__judge_document_in_node_b7p7prticc"() IS 'the rule judge''s block of rule Document(package, path, nodeChildren, context, contextNearest, contextNearestKind, contextPath) in Node(package, path, children, ancestry, nearest, nearestKind, nearestPath) where Logic.eq(governor, "document") and Logic.eq(kind, "document") and Logic.eq(parentKind, "document") and Logic.eq(start, 0n) over the rows a write removes from Node';

COMMENT ON FUNCTION "qti"."__judge_document_id_admitted_in_node_k32knprq46"() IS 'the rule judge''s block of rule DocumentId(package, path, start) where Logic.eq(admitted, false) in Node(package, path, start) where Logic.not(AdmissionIn.has(ContentModelOf.at("admission", parentKind), kind)) over the rows a write adds to DocumentId';

COMMENT ON FUNCTION "qti"."__judge_document_id_admitted_in_node_ptyjuw7ypr"() IS 'the rule judge''s block of rule DocumentId(package, path, start) where Logic.eq(admitted, false) in Node(package, path, start) where Logic.not(AdmissionIn.has(ContentModelOf.at("admission", parentKind), kind)) over the rows a write removes from Node';

COMMENT ON FUNCTION "qti"."__judge_document_id_admitted_in_node_dqm3bdpu3s"() IS 'the rule judge''s block of rule DocumentId(package, path, start) where Logic.eq(admitted, true) in Node(package, path, start) where AdmissionIn.has(ContentModelOf.at("admission", parentKind), kind) over the rows a write adds to DocumentId';

COMMENT ON FUNCTION "qti"."__judge_document_id_admitted_in_node_o36ne25x3j"() IS 'the rule judge''s block of rule DocumentId(package, path, start) where Logic.eq(admitted, true) in Node(package, path, start) where AdmissionIn.has(ContentModelOf.at("admission", parentKind), kind) over the rows a write removes from Node';

COMMENT ON FUNCTION "qti"."__judge_document_id_owner_start_in_attribute_3t56skfs2a"() IS 'the rule judge''s block of rule DocumentId(package, path, start) where Logic.eq(owner, start) in Attribute(package, path, start) where Logic.or(Logic.and(ValueIdentity.has(AttributeGrammar.at("domain", AttributeModelOf.at("model", governor), name)), Logic.eq(ValueIdentity.at("identity", AttributeGrammar.at("domain", AttributeModelOf.at("model", governor), name)), "ID")), Logic.and(Logic.eq(kind, "qti-context-declaration"), Logic.eq(name, "identifier"))) over the rows a write removes from Attribute';

COMMENT ON FUNCTION "qti"."__judge_document_id_owner_start_in_attribute_3jel3escbo"() IS 'the rule judge''s block of rule DocumentId(package, path, start) where Logic.eq(owner, start) in Attribute(package, path, start) where Logic.or(Logic.and(ValueIdentity.has(AttributeGrammar.at("domain", AttributeModelOf.at("model", governor), name)), Logic.eq(ValueIdentity.at("identity", AttributeGrammar.at("domain", AttributeModelOf.at("model", governor), name)), "ID")), Logic.and(Logic.eq(kind, "qti-context-declaration"), Logic.eq(name, "identifier"))) over the rows a write adds to DocumentId';

COMMENT ON FUNCTION "qti"."__judge_document_id_owner_start_in_node_nuytw5q5cw"() IS 'the rule judge''s block of rule DocumentId(package, path, start) where Logic.ne(owner, start) in Node(package, path, start) where Logic.eq(ValueIdentity.at("identity", TextDomain.at("domain", governor)), "ID") over the rows a write adds to DocumentId';

COMMENT ON FUNCTION "qti"."__judge_document_id_owner_start_in_node_t2goigrbd4"() IS 'the rule judge''s block of rule DocumentId(package, path, start) where Logic.ne(owner, start) in Node(package, path, start) where Logic.eq(ValueIdentity.at("identity", TextDomain.at("domain", governor)), "ID") over the rows a write removes from Node';

COMMENT ON FUNCTION "qti"."__judge_entry_kind_in_document_6t5p6z6n6j"() IS 'the rule judge''s block of rule Entry(package, path) where Logic.eq(kind, "document") in Document(package, path) over the rows a write removes from Document';

COMMENT ON FUNCTION "qti"."__judge_entry_kind_in_document_rxn26b7rmd"() IS 'the rule judge''s block of rule Entry(package, path) where Logic.eq(kind, "document") in Document(package, path) over the rows a write adds to Entry';

COMMENT ON FUNCTION "qti"."__judge_entry_kind_in_media_4jr6pvnnir"() IS 'the rule judge''s block of rule Entry(package, path) where Logic.eq(kind, "media") in Media(package, path) over the rows a write adds to Entry';

COMMENT ON FUNCTION "qti"."__judge_entry_kind_in_media_uyki4q5msm"() IS 'the rule judge''s block of rule Entry(package, path) where Logic.eq(kind, "media") in Media(package, path) over the rows a write removes from Media';

COMMENT ON FUNCTION "qti"."__judge_entry_in_entry_file_target_w6i34ovtz7"() IS 'the rule judge''s block of rule Entry(package, path) where Logic.ne(path, "imsmanifest.xml") in EntryFileTarget(package, target) over its units';

COMMENT ON FUNCTION "qti"."__judge_expression_attribute_in_placed_expression_xeyalbrfdv"() IS 'the rule judge''s block of rule ExpressionAttribute(package, assembly, instance, path, start, baseType) in PlacedExpression(package, assembly, instance, path, start, baseType) over its units';

COMMENT ON FUNCTION "qti"."__judge_expression_node_in_expression_gystyuhwha"() IS 'the rule judge''s block of rule ExpressionNode(package, path, parent, language) where Logic.in(parentKind, ["qti-and", "qti-any-n", "qti-base-value", "qti-container-size", "qti-contains", "qti-correct", "qti-custom-operator", "qti-default", "qti-delete", "qti-divide", "qti-duration-gte", "qti-duration-lt", "qti-equal", "qti-equal-rounded", "qti-field-value", "qti-gcd", "qti-gt", "qti-gte", "qti-index", "qti-inside", "qti-integer-divide", "qti-integer-modulus", "qti-integer-to-float", "qti-is-null", "qti-lcm", "qti-lt", "qti-lte", "qti-map-response", "qti-map-response-point", "qti-match", "qti-math-constant", "qti-math-operator", "qti-max", "qti-member", "qti-min", "qti-multiple", "qti-not", "qti-null", "qti-number-correct", "qti-number-incorrect", "qti-number-presented", "qti-number-responded", "qti-number-selected", "qti-or", "qti-ordered", "qti-outcome-maximum", "qti-outcome-minimum", "qti-pattern-match", "qti-power", "qti-product", "qti-random", "qti-random-float", "qti-random-integer", "qti-repeat", "qti-round", "qti-round-to", "qti-stats-operator", "qti-string-match", "qti-substring", "qti-subtract", "qti-sum", "qti-test-variables", "qti-truncate", "qti-variable"]) in Expression(package, path, start, language) over its units';

COMMENT ON FUNCTION "qti"."__judge_expression_node_in_processing_zzmowumv5s"() IS 'the rule judge''s block of rule ExpressionNode(package, path, parent, language) where Logic.in(parentKind, ["qti-exit-response", "qti-exit-template", "qti-exit-test", "qti-lookup-outcome-value", "qti-outcome-condition", "qti-outcome-else", "qti-outcome-else-if", "qti-outcome-if", "qti-outcome-processing", "qti-outcome-processing-fragment", "qti-response-condition", "qti-response-else", "qti-response-else-if", "qti-response-if", "qti-response-processing", "qti-response-processing-fragment", "qti-set-correct-response", "qti-set-default-value", "qti-set-outcome-value", "qti-set-template-value", "qti-template-condition", "qti-template-constraint", "qti-template-else", "qti-template-else-if", "qti-template-if", "qti-template-processing"]) in Processing(package, path, start, language) over its units';

COMMENT ON FUNCTION "qti"."__judge_feedback_ref_in_referable_name_hase3mb2yu"() IS 'the rule judge''s block of rule FeedbackRef(package, path, identifier, kind, attribute) where Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "completionStatus", "duration", "numAttempts"])), Logic.ne(assemblyKind, "qti-assessment-item")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "completionStatus", "duration", "numAttempts"])), Logic.ne(assemblyKind, "qti-response-processing")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "duration"])), Logic.ne(assemblyKind, "qti-assessment-section")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "duration"])), Logic.ne(assemblyKind, "qti-assessment-test")) in ReferableName(package, path, identifier, kind, attribute) over its units';

COMMENT ON FUNCTION "qti"."__judge_file_in_node_dowc57kcbn"() IS 'the rule judge''s block of rule File(package, path, start) in Node(package, path, start) where Logic.eq(kind, "cp:file") over the rows a write adds to File';

COMMENT ON FUNCTION "qti"."__judge_file_in_node_gorh63lbls"() IS 'the rule judge''s block of rule File(package, path, start) in Node(package, path, start) where Logic.eq(kind, "cp:file") over the rows a write removes from Node';

COMMENT ON FUNCTION "qti"."__judge_file_scope_in_file_path_jeflxqr43u"() IS 'the rule judge''s block of rule File(package, path, start) where Logic.eq(scope, "entry") in FilePath(package, path, start) over the rows a write adds to File';

COMMENT ON FUNCTION "qti"."__judge_file_scope_in_file_path_jgborkhirf"() IS 'the rule judge''s block of rule File(package, path, start) where Logic.eq(scope, "entry") in FilePath(package, path, start) over the rows a write removes from FilePath';

COMMENT ON FUNCTION "qti"."__judge_file_scope_in_file_outside_ntggn6rkfa"() IS 'the rule judge''s block of rule File(package, path, start) where Logic.eq(scope, "external") in FileOutside(package, path, start) over the rows a write adds to File';

COMMENT ON FUNCTION "qti"."__judge_file_scope_in_file_outside_6bbbh4r2ok"() IS 'the rule judge''s block of rule File(package, path, start) where Logic.eq(scope, "external") in FileOutside(package, path, start) over the rows a write removes from FileOutside';

COMMENT ON FUNCTION "qti"."__judge_file_outside_in_file_vde7sxdsil"() IS 'the rule judge''s block of rule FileOutside(package, path, start) in File(package, path, start) where Logic.eq(scope, "external") over the rows a write removes from File';

COMMENT ON FUNCTION "qti"."__judge_file_outside_in_file_db772nn3rr"() IS 'the rule judge''s block of rule FileOutside(package, path, start) in File(package, path, start) where Logic.eq(scope, "external") over the rows a write adds to FileOutside';

COMMENT ON FUNCTION "qti"."__judge_file_path_in_file_2etontbxjx"() IS 'the rule judge''s block of rule FilePath(package, path, start) in File(package, path, start) where Logic.eq(scope, "entry") over the rows a write removes from File';

COMMENT ON FUNCTION "qti"."__judge_file_path_in_file_zj5fltgb7j"() IS 'the rule judge''s block of rule FilePath(package, path, start) in File(package, path, start) where Logic.eq(scope, "entry") over the rows a write adds to FilePath';

COMMENT ON FUNCTION "qti"."__judge_forbidden_resource_type_in_other_vocabulary_c3f4mcio3c"() IS 'the rule judge''s block of rule ForbiddenResourceType(package, path, type) in OtherVocabularyType(package, path, type) over its units';

COMMENT ON FUNCTION "qti"."__judge_fragment_context_ref_in_referable_name_kf5sx5zq6m"() IS 'the rule judge''s block of rule FragmentContextRef(package, assembly, identifier, kind, attribute) where Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "completionStatus", "duration", "numAttempts"])), Logic.ne(assemblyKind, "qti-assessment-item")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "completionStatus", "duration", "numAttempts"])), Logic.ne(assemblyKind, "qti-response-processing")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "duration"])), Logic.ne(assemblyKind, "qti-assessment-section")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "duration"])), Logic.ne(assemblyKind, "qti-assessment-test")) in ReferableName(package, path, identifier, kind, attribute) over its units';

COMMENT ON FUNCTION "qti"."__judge_fragment_feedback_ref_in_referable_name_42k4flshr2"() IS 'the rule judge''s block of rule FragmentFeedbackRef(package, assembly, identifier, kind, attribute) where Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "completionStatus", "duration", "numAttempts"])), Logic.ne(assemblyKind, "qti-assessment-item")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "completionStatus", "duration", "numAttempts"])), Logic.ne(assemblyKind, "qti-response-processing")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "duration"])), Logic.ne(assemblyKind, "qti-assessment-section")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "duration"])), Logic.ne(assemblyKind, "qti-assessment-test")) in ReferableName(package, path, identifier, kind, attribute) over its units';

COMMENT ON FUNCTION "qti"."__judge_fragment_printed_ref_in_referable_name_i4xzia32qh"() IS 'the rule judge''s block of rule FragmentPrintedRef(package, assembly, identifier, kind, attribute) where Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "completionStatus", "duration", "numAttempts"])), Logic.ne(assemblyKind, "qti-assessment-item")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "completionStatus", "duration", "numAttempts"])), Logic.ne(assemblyKind, "qti-response-processing")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "duration"])), Logic.ne(assemblyKind, "qti-assessment-section")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "duration"])), Logic.ne(assemblyKind, "qti-assessment-test")) in ReferableName(package, path, identifier, kind, attribute) over its units';

COMMENT ON FUNCTION "qti"."__judge_fragment_template_ref_in_referable_name_cdumewvips"() IS 'the rule judge''s block of rule FragmentTemplateRef(package, assembly, identifier, kind, attribute) where Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "completionStatus", "duration", "numAttempts"])), Logic.ne(assemblyKind, "qti-assessment-item")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "completionStatus", "duration", "numAttempts"])), Logic.ne(assemblyKind, "qti-response-processing")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "duration"])), Logic.ne(assemblyKind, "qti-assessment-section")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "duration"])), Logic.ne(assemblyKind, "qti-assessment-test")) in ReferableName(package, path, identifier, kind, attribute) over its units';

COMMENT ON FUNCTION "qti"."__judge_head_document_in_instance_xv7rhhzvrn"() IS 'the rule judge''s block of rule HeadDocument(package, path) in Instance(package, document) where Logic.eq(start, 0n) over its units';

COMMENT ON FUNCTION "qti"."__judge_head_qualifier_pair_in_head_qualifier_hzoxoa7jfg"() IS 'the rule judge''s block of rule HeadQualifierPair(head, kind) in HeadQualifier(head, qualifier) over the rows a write adds to Node';

COMMENT ON FUNCTION "qti"."__judge_hottext_in_node_4brh7b5kyu"() IS 'the rule judge''s block of rule Hottext(package, path, start) in Node(package, path, start) where Logic.eq(kind, "qti-hottext") over the rows a write adds to Hottext';

COMMENT ON FUNCTION "qti"."__judge_hottext_in_node_vre3mbwmuc"() IS 'the rule judge''s block of rule Hottext(package, path, start) in Node(package, path, start) where Logic.eq(kind, "qti-hottext") over the rows a write removes from Node';

COMMENT ON FUNCTION "qti"."__judge_hottext_node_in_interaction_node_basx24omht"() IS 'the rule judge''s block of rule HottextNode(package, nearestPath, nearest, nearestKind) where Logic.in(nearestKind, ["qti-associate-interaction", "qti-choice-interaction", "qti-custom-interaction", "qti-drawing-interaction", "qti-end-attempt-interaction", "qti-extended-text-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-inline-choice-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-portable-custom-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-slider-interaction", "qti-text-entry-interaction", "qti-upload-interaction"]) in InteractionNode(package, path, start, kind) over its units';

COMMENT ON FUNCTION "qti"."__judge_hottext_node_in_document_f4d2jdjlct"() IS 'the rule judge''s block of rule HottextNode(package, path, nearestPath, nearest) where Logic.ne(nearestPath, path) in Document(package, path, contextPath, contextNearest) over its units';

COMMENT ON FUNCTION "qti"."__judge_idref_target_in_id_binding_bfejuvrwcd"() IS 'the rule judge''s block of rule IdrefTarget(package, path, id) where Logic.eq(assembled, false) in IdBinding(package, path, id) over its units';

COMMENT ON FUNCTION "qti"."__judge_instance_root_kind_assembly_kind_in_fragment_7ju5cjlocv"() IS 'the rule judge''s block of rule Instance(package, assembly, start, document, assemblyKind) where Logic.not(Logic.in(rootKind, ["qti-assessment-item", "qti-assessment-test"])) and Logic.in(assemblyKind, ["qti-assessment-item", "qti-assessment-test"]) in FragmentScope(package, assembly, instance, document, assemblyKind) over the rows a write removes from FragmentScope';

COMMENT ON FUNCTION "qti"."__judge_instance_root_kind_assembly_kind_in_fragment_33gudehumy"() IS 'the rule judge''s block of rule Instance(package, assembly, start, document, assemblyKind) where Logic.not(Logic.in(rootKind, ["qti-assessment-item", "qti-assessment-test"])) and Logic.in(assemblyKind, ["qti-assessment-item", "qti-assessment-test"]) in FragmentScope(package, assembly, instance, document, assemblyKind) over the rows a write adds to Instance';

COMMENT ON FUNCTION "qti"."__judge_instance_in_head_document_p5odsgngt5"() IS 'the rule judge''s block of rule Instance(package, document) where Logic.eq(start, 0n) in HeadDocument(package, path) over its units';

COMMENT ON FUNCTION "qti"."__judge_instance_assembly_kind_in_document_lejswbcsvd"() IS 'the rule judge''s block of rule Instance(package, document, bindings) where Logic.eq(assemblyKind, "qti-assessment-item") in Document(package, path, bindings) over the rows a write removes from Document';

COMMENT ON FUNCTION "qti"."__judge_instance_assembly_kind_in_document_r62w6rdr5m"() IS 'the rule judge''s block of rule Instance(package, document, bindings) where Logic.eq(assemblyKind, "qti-assessment-item") in Document(package, path, bindings) over the rows a write adds to Instance';

COMMENT ON FUNCTION "qti"."__judge_instance_start_in_site_target_3ztdllhalz"() IS 'the rule judge''s block of rule Instance(package, siteDocument, site, document) where Logic.gt(start, 0n) in SiteTarget(package, path, start, target) where Logic.eq(places, true) over the rows a write adds to Instance';

COMMENT ON FUNCTION "qti"."__judge_instance_start_in_site_target_4o5tk5s2k2"() IS 'the rule judge''s block of rule Instance(package, siteDocument, site, document) where Logic.gt(start, 0n) in SiteTarget(package, path, start, target) where Logic.eq(places, true) over the rows a write removes from SiteTarget';

COMMENT ON FUNCTION "qti"."__judge_interaction_attribute_kind_name_in_4aebosbkg4"() IS 'the rule judge''s block of rule InteractionAttribute(package, path, start) where Logic.in(kind, ["qti-associate-interaction", "qti-choice-interaction", "qti-custom-interaction", "qti-drawing-interaction", "qti-end-attempt-interaction", "qti-extended-text-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-inline-choice-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-portable-custom-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-slider-interaction", "qti-text-entry-interaction", "qti-upload-interaction"]) and Logic.eq(name, "response-identifier") in Interaction(package, path, start) over the rows a write removes from Interaction';

COMMENT ON FUNCTION "qti"."__judge_interaction_attribute_kind_name_in_36mwe7k6t2"() IS 'the rule judge''s block of rule InteractionAttribute(package, path, start) where Logic.in(kind, ["qti-associate-interaction", "qti-choice-interaction", "qti-custom-interaction", "qti-drawing-interaction", "qti-end-attempt-interaction", "qti-extended-text-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-inline-choice-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-portable-custom-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-slider-interaction", "qti-text-entry-interaction", "qti-upload-interaction"]) and Logic.eq(name, "response-identifier") in Interaction(package, path, start) over the rows a write adds to InteractionAttribute';

COMMENT ON FUNCTION "qti"."__judge_interaction_attribute_in_attribute_df6smytnjm"() IS 'the rule judge''s block of rule InteractionAttribute(package, path, start, name) in Attribute(package, path, start, name) where Logic.or(Logic.in(name, ["aria-valuemax", "aria-valuemin"]), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-context-variable", "qti-gap", "qti-gap-img", "qti-gap-text", "qti-hotspot-choice", "qti-hottext", "qti-inline-choice", "qti-printed-variable", "qti-simple-associable-choice", "qti-simple-choice"]), Logic.eq(name, "identifier")), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-gap", "qti-gap-img", "qti-gap-text", "qti-hotspot-choice", "qti-hottext", "qti-inline-choice", "qti-simple-associable-choice", "qti-simple-choice", "qti-template-block", "qti-template-block.rubric", "qti-template-inline", "qti-template-inline.rubric", "qti-template-variable"]), Logic.eq(name, "template-identifier")), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-gap-img", "qti-gap-text", "qti-simple-associable-choice"]), Logic.eq(name, "match-max")), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-gap-img", "qti-gap-text", "qti-simple-associable-choice"]), Logic.eq(name, "match-min")), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-hotspot-choice"]), Logic.eq(name, "shape")), Logic.and(Logic.in(kind, ["qti-associate-interaction", "qti-choice-interaction", "qti-custom-interaction", "qti-drawing-interaction", "qti-end-attempt-interaction", "qti-extended-text-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-inline-choice-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-portable-custom-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-slider-interaction", "qti-text-entry-interaction", "qti-upload-interaction"]), Logic.eq(name, "response-identifier")), Logic.and(Logic.in(kind, ["qti-associate-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-match-interaction"]), Logic.eq(name, "max-associations")), Logic.and(Logic.in(kind, ["qti-associate-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-match-interaction"]), Logic.eq(name, "min-associations")), Logic.and(Logic.in(kind, ["qti-choice-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-order-interaction", "qti-position-object-interaction", "qti-select-point-interaction"]), Logic.eq(name, "max-choices")), Logic.and(Logic.in(kind, ["qti-choice-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-order-interaction", "qti-position-object-interaction", "qti-select-point-interaction"]), Logic.eq(name, "min-choices")), Logic.and(Logic.in(kind, ["qti-extended-text-interaction", "qti-text-entry-interaction"]), Logic.eq(name, "string-identifier")), Logic.and(Logic.in(kind, ["qti-feedback-block", "qti-feedback-block.template", "qti-feedback-inline", "qti-modal-feedback", "qti-test-feedback"]), Logic.eq(name, "outcome-identifier")), Logic.and(Logic.eq(kind, "qti-assessment-item"), Logic.eq(name, "adaptive")), Logic.and(Logic.eq(kind, "qti-extended-text-interaction"), Logic.eq(name, "max-strings")), Logic.and(Logic.eq(kind, "qti-extended-text-interaction"), Logic.eq(name, "min-strings")), Logic.and(Logic.eq(kind, "qti-media-interaction"), Logic.eq(name, "max-plays")), Logic.and(Logic.eq(kind, "qti-media-interaction"), Logic.eq(name, "min-plays")), Logic.and(Logic.eq(kind, "qti-printed-variable"), Logic.eq(name, "base")), Logic.and(Logic.eq(kind, "qti-printed-variable"), Logic.eq(name, "index")), Logic.and(Logic.eq(kind, "qti-slider-interaction"), Logic.eq(name, "lower-bound")), Logic.and(Logic.eq(kind, "qti-slider-interaction"), Logic.eq(name, "upper-bound"))) over the rows a write removes from Attribute';

COMMENT ON FUNCTION "qti"."__judge_interaction_attribute_in_attribute_vld5tjhklx"() IS 'the rule judge''s block of rule InteractionAttribute(package, path, start, name) in Attribute(package, path, start, name) where Logic.or(Logic.in(name, ["aria-valuemax", "aria-valuemin"]), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-context-variable", "qti-gap", "qti-gap-img", "qti-gap-text", "qti-hotspot-choice", "qti-hottext", "qti-inline-choice", "qti-printed-variable", "qti-simple-associable-choice", "qti-simple-choice"]), Logic.eq(name, "identifier")), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-gap", "qti-gap-img", "qti-gap-text", "qti-hotspot-choice", "qti-hottext", "qti-inline-choice", "qti-simple-associable-choice", "qti-simple-choice", "qti-template-block", "qti-template-block.rubric", "qti-template-inline", "qti-template-inline.rubric", "qti-template-variable"]), Logic.eq(name, "template-identifier")), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-gap-img", "qti-gap-text", "qti-simple-associable-choice"]), Logic.eq(name, "match-max")), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-gap-img", "qti-gap-text", "qti-simple-associable-choice"]), Logic.eq(name, "match-min")), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-hotspot-choice"]), Logic.eq(name, "shape")), Logic.and(Logic.in(kind, ["qti-associate-interaction", "qti-choice-interaction", "qti-custom-interaction", "qti-drawing-interaction", "qti-end-attempt-interaction", "qti-extended-text-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-inline-choice-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-portable-custom-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-slider-interaction", "qti-text-entry-interaction", "qti-upload-interaction"]), Logic.eq(name, "response-identifier")), Logic.and(Logic.in(kind, ["qti-associate-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-match-interaction"]), Logic.eq(name, "max-associations")), Logic.and(Logic.in(kind, ["qti-associate-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-match-interaction"]), Logic.eq(name, "min-associations")), Logic.and(Logic.in(kind, ["qti-choice-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-order-interaction", "qti-position-object-interaction", "qti-select-point-interaction"]), Logic.eq(name, "max-choices")), Logic.and(Logic.in(kind, ["qti-choice-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-order-interaction", "qti-position-object-interaction", "qti-select-point-interaction"]), Logic.eq(name, "min-choices")), Logic.and(Logic.in(kind, ["qti-extended-text-interaction", "qti-text-entry-interaction"]), Logic.eq(name, "string-identifier")), Logic.and(Logic.in(kind, ["qti-feedback-block", "qti-feedback-block.template", "qti-feedback-inline", "qti-modal-feedback", "qti-test-feedback"]), Logic.eq(name, "outcome-identifier")), Logic.and(Logic.eq(kind, "qti-assessment-item"), Logic.eq(name, "adaptive")), Logic.and(Logic.eq(kind, "qti-extended-text-interaction"), Logic.eq(name, "max-strings")), Logic.and(Logic.eq(kind, "qti-extended-text-interaction"), Logic.eq(name, "min-strings")), Logic.and(Logic.eq(kind, "qti-media-interaction"), Logic.eq(name, "max-plays")), Logic.and(Logic.eq(kind, "qti-media-interaction"), Logic.eq(name, "min-plays")), Logic.and(Logic.eq(kind, "qti-printed-variable"), Logic.eq(name, "base")), Logic.and(Logic.eq(kind, "qti-printed-variable"), Logic.eq(name, "index")), Logic.and(Logic.eq(kind, "qti-slider-interaction"), Logic.eq(name, "lower-bound")), Logic.and(Logic.eq(kind, "qti-slider-interaction"), Logic.eq(name, "upper-bound"))) over the rows a write adds to InteractionAttribute';

COMMENT ON FUNCTION "qti"."__judge_interaction_attribute_kind_name_in_count_bbqzpz3ijw"() IS 'the rule judge''s block of rule InteractionAttribute(package, path, start, name) where Logic.in(kind, ["qti-associable-hotspot", "qti-associate-interaction", "qti-choice-interaction", "qti-extended-text-interaction", "qti-gap-img", "qti-gap-match-interaction", "qti-gap-text", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-simple-associable-choice"]) and Logic.in(name, ["match-max", "max-associations", "max-choices", "max-plays", "max-strings"]) in CountBound(package, path, start, maxName) where Logic.eq(maxWritten, true) over the rows a write removes from CountBound';

COMMENT ON FUNCTION "qti"."__judge_interaction_attribute_kind_name_in_count_otzibsd7zx"() IS 'the rule judge''s block of rule InteractionAttribute(package, path, start, name) where Logic.in(kind, ["qti-associable-hotspot", "qti-associate-interaction", "qti-choice-interaction", "qti-extended-text-interaction", "qti-gap-img", "qti-gap-match-interaction", "qti-gap-text", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-simple-associable-choice"]) and Logic.in(name, ["match-max", "max-associations", "max-choices", "max-plays", "max-strings"]) in CountBound(package, path, start, maxName) where Logic.eq(maxWritten, true) over the rows a write adds to InteractionAttribute';

COMMENT ON FUNCTION "qti"."__judge_interaction_attribute_kind_name_in_count_gns7l5r3bd"() IS 'the rule judge''s block of rule InteractionAttribute(package, path, start, name) where Logic.in(kind, ["qti-associable-hotspot", "qti-associate-interaction", "qti-choice-interaction", "qti-extended-text-interaction", "qti-gap-img", "qti-gap-match-interaction", "qti-gap-text", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-simple-associable-choice"]) and Logic.in(name, ["match-min", "min-associations", "min-choices", "min-plays", "min-strings"]) in CountBound(package, path, start, minName) where Logic.eq(minWritten, true) over the rows a write removes from CountBound';

COMMENT ON FUNCTION "qti"."__judge_interaction_attribute_kind_name_in_count_363lkrf7vv"() IS 'the rule judge''s block of rule InteractionAttribute(package, path, start, name) where Logic.in(kind, ["qti-associable-hotspot", "qti-associate-interaction", "qti-choice-interaction", "qti-extended-text-interaction", "qti-gap-img", "qti-gap-match-interaction", "qti-gap-text", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-simple-associable-choice"]) and Logic.in(name, ["match-min", "min-associations", "min-choices", "min-plays", "min-strings"]) in CountBound(package, path, start, minName) where Logic.eq(minWritten, true) over the rows a write adds to InteractionAttribute';

COMMENT ON FUNCTION "qti"."__judge_interaction_attribute_in_most_count_node_x67otjhwhy"() IS 'the rule judge''s block of rule InteractionAttribute(package, path, start, name, value) where Logic.in(kind, ["qti-associable-hotspot", "qti-associate-interaction", "qti-choice-interaction", "qti-extended-text-interaction", "qti-gap-img", "qti-gap-match-interaction", "qti-gap-text", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-simple-associable-choice"]) and Logic.in(name, ["match-max", "max-associations", "max-choices", "max-plays", "max-strings"]) and Text.matches(value, Text.pattern(<language 5c9151c4e7e65fb8eb6a78468f4f1ac0a2aabe15b78b4265f0d3a3d9dede18b9>)) and Text.matches(value, Text.pattern(<language 7340417c049b8caba4cdc443c0a5a8c4b06b93ed6e1a6c08bfc55f6d4f36f88d>)) in MostCountNode(package, path, start, maxName, most) where Logic.eq(maxWritten, true) over its units';

COMMENT ON FUNCTION "qti"."__judge_interaction_attribute_in_least_count_node_wzhhxqvx6l"() IS 'the rule judge''s block of rule InteractionAttribute(package, path, start, name, value) where Logic.in(kind, ["qti-associable-hotspot", "qti-associate-interaction", "qti-choice-interaction", "qti-extended-text-interaction", "qti-gap-img", "qti-gap-match-interaction", "qti-gap-text", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-simple-associable-choice"]) and Logic.in(name, ["match-min", "min-associations", "min-choices", "min-plays", "min-strings"]) and Text.matches(value, Text.pattern(<language 5c9151c4e7e65fb8eb6a78468f4f1ac0a2aabe15b78b4265f0d3a3d9dede18b9>)) and Text.matches(value, Text.pattern(<language 7340417c049b8caba4cdc443c0a5a8c4b06b93ed6e1a6c08bfc55f6d4f36f88d>)) in LeastCountNode(package, path, start, minName, least) where Logic.eq(minWritten, true) over its units';

COMMENT ON FUNCTION "qti"."__judge_interaction_attribute_kind_name_in_choice_da2sr3uz4a"() IS 'the rule judge''s block of rule InteractionAttribute(package, path, start, value) where Logic.in(kind, ["qti-associable-hotspot", "qti-gap", "qti-gap-img", "qti-gap-text", "qti-hotspot-choice", "qti-inline-choice", "qti-simple-associable-choice", "qti-simple-choice"]) and Logic.eq(name, "identifier") in Choice(package, path, start, identifier) over the rows a write removes from Choice';

COMMENT ON FUNCTION "qti"."__judge_interaction_attribute_kind_name_in_choice_5lpwwdurvi"() IS 'the rule judge''s block of rule InteractionAttribute(package, path, start, value) where Logic.in(kind, ["qti-associable-hotspot", "qti-gap", "qti-gap-img", "qti-gap-text", "qti-hotspot-choice", "qti-inline-choice", "qti-simple-associable-choice", "qti-simple-choice"]) and Logic.eq(name, "identifier") in Choice(package, path, start, identifier) over the rows a write adds to InteractionAttribute';

COMMENT ON FUNCTION "qti"."__judge_interaction_attribute_kind_name_in_hottext_os45tbydae"() IS 'the rule judge''s block of rule InteractionAttribute(package, path, start, value) where Logic.eq(kind, "qti-hottext") and Logic.eq(name, "identifier") in Hottext(package, path, start, identifier) over the rows a write removes from Hottext';

COMMENT ON FUNCTION "qti"."__judge_interaction_attribute_kind_name_in_hottext_6mwydoyegb"() IS 'the rule judge''s block of rule InteractionAttribute(package, path, start, value) where Logic.eq(kind, "qti-hottext") and Logic.eq(name, "identifier") in Hottext(package, path, start, identifier) over the rows a write adds to InteractionAttribute';

COMMENT ON FUNCTION "qti"."__judge_interaction_node_in_count_bound_372prpjjg2"() IS 'the rule judge''s block of rule InteractionNode(package, path, start) where Logic.in(kind, ["qti-associable-hotspot", "qti-associate-interaction", "qti-choice-interaction", "qti-extended-text-interaction", "qti-gap-img", "qti-gap-match-interaction", "qti-gap-text", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-simple-associable-choice"]) in CountBound(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_interpolated_lookup_in_declaration_table_ixycsyexgq"() IS 'the rule judge''s block of rule InterpolatedLookup(package, assembly, declaration) in DeclarationTable(package, path, declaration) where Logic.eq(kind, "qti-interpolation-table") over its units';

COMMENT ON FUNCTION "qti"."__judge_item_mapping_in_named_declaration_owdypizzmf"() IS 'the rule judge''s block of rule ItemMapping(package, item, source) in NamedDeclaration(package, path, identifier) where Logic.eq(declarationKind, "qti-outcome-declaration") over its units';

COMMENT ON FUNCTION "qti"."__judge_item_mapping_in_free_mapping_target_tenhs4ieej"() IS 'the rule judge''s block of rule ItemMapping(package, path, start) in FreeMappingTarget(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_item_ref_document_in_item_ref_target_rk6hubkxqc"() IS 'the rule judge''s block of rule ItemRefDocument(package, path, start, target) in ItemRefTarget(package, path, start, target) where Logic.eq(type, "imsqti_item_xmlv3p0") over its units';

COMMENT ON FUNCTION "qti"."__judge_item_ref_document_in_document_fultyrmk6y"() IS 'the rule judge''s block of rule ItemRefDocument(package, target) in Document(package, path) where Logic.eq(rootKind, "qti-assessment-item") over the rows a write removes from Document';

COMMENT ON FUNCTION "qti"."__judge_item_ref_document_in_document_qq6benaalc"() IS 'the rule judge''s block of rule ItemRefDocument(package, target) in Document(package, path) where Logic.eq(rootKind, "qti-assessment-item") over the rows a write adds to ItemRefDocument';

COMMENT ON FUNCTION "qti"."__judge_item_ref_href_in_node_wfmzwqhltt"() IS 'the rule judge''s block of rule ItemRefHref(package, path, start) in Node(package, path, start) where Logic.eq(kind, "qti-assessment-item-ref") over the rows a write adds to ItemRefHref';

COMMENT ON FUNCTION "qti"."__judge_item_ref_href_in_node_lhgnai6vtb"() IS 'the rule judge''s block of rule ItemRefHref(package, path, start) in Node(package, path, start) where Logic.eq(kind, "qti-assessment-item-ref") over the rows a write removes from Node';

COMMENT ON FUNCTION "qti"."__judge_item_ref_href_in_reference_path_r2wysozm4l"() IS 'the rule judge''s block of rule ItemRefHref(package, path, start, target) in ReferencePath(package, path, start, target) where Logic.eq(name, "href") over the rows a write adds to ItemRefHref';

COMMENT ON FUNCTION "qti"."__judge_item_ref_href_in_reference_path_ndgij3ns7j"() IS 'the rule judge''s block of rule ItemRefHref(package, path, start, target) in ReferencePath(package, path, start, target) where Logic.eq(name, "href") over the rows a write removes from ReferencePath';

COMMENT ON FUNCTION "qti"."__judge_item_ref_target_in_item_ref_document_ouldl2v5q6"() IS 'the rule judge''s block of rule ItemRefTarget(package, path, start, target) where Logic.eq(type, "imsqti_item_xmlv3p0") in ItemRefDocument(package, path, start, target) over its units';

COMMENT ON FUNCTION "qti"."__judge_item_template_default_in_named_declaration_bmob724qxy"() IS 'the rule judge''s block of rule ItemTemplateDefault(package, item, template) in NamedDeclaration(package, path, identifier) where Logic.eq(declarationKind, "qti-template-declaration") over its units';

COMMENT ON FUNCTION "qti"."__judge_judged_placed_idref_in_assembled_id_fbyitaxge6"() IS 'the rule judge''s block of rule JudgedPlacedIdref(package, assembly, idDigest) in AssembledId(package, assembly, idDigest) over its units';

COMMENT ON FUNCTION "qti"."__judge_label_use_root_kind_in_attribute_sxl6rz232b"() IS 'the rule judge''s block of rule LabelUse(package, path) where Logic.eq(rootKind, "qti-assessment-item") in Attribute(package, path) where Logic.eq(kind, "qti-assessment-item") and Logic.eq(name, "tool-name") over the rows a write removes from Attribute';

COMMENT ON FUNCTION "qti"."__judge_label_use_root_kind_in_attribute_3opdgb773q"() IS 'the rule judge''s block of rule LabelUse(package, path) where Logic.eq(rootKind, "qti-assessment-item") in Attribute(package, path) where Logic.eq(kind, "qti-assessment-item") and Logic.eq(name, "tool-name") over the rows a write adds to LabelUse';

COMMENT ON FUNCTION "qti"."__judge_label_use_root_kind_in_attribute_3eyz5vbfvw"() IS 'the rule judge''s block of rule LabelUse(package, path) where Logic.eq(rootKind, "qti-assessment-item") in Attribute(package, path) where Logic.eq(kind, "qti-assessment-item") and Logic.eq(name, "tool-version") over the rows a write removes from Attribute';

COMMENT ON FUNCTION "qti"."__judge_label_use_root_kind_in_attribute_zip26i3xdl"() IS 'the rule judge''s block of rule LabelUse(package, path) where Logic.eq(rootKind, "qti-assessment-item") in Attribute(package, path) where Logic.eq(kind, "qti-assessment-item") and Logic.eq(name, "tool-version") over the rows a write adds to LabelUse';

COMMENT ON FUNCTION "qti"."__judge_label_use_in_attribute_klcdcvh5qa"() IS 'the rule judge''s block of rule LabelUse(package, path, start) in Attribute(package, path, start) where Logic.in(kind, ["a", "abbr", "acronym", "address", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blockquote", "br", "caption", "cite", "code", "col", "colgroup", "dd", "details", "dfn", "div", "dl", "dt", "em", "figcaption", "figure", "footer", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr", "i", "img", "kbd", "label", "li", "nav", "object", "ol", "p", "picture", "pre", "q", "qti-assessment-item", "qti-associable-hotspot", "qti-associate-interaction", "qti-choice-interaction", "qti-custom-interaction", "qti-drawing-interaction", "qti-end-attempt-interaction", "qti-extended-text-interaction", "qti-feedback-block", "qti-feedback-block.template", "qti-feedback-inline", "qti-gap", "qti-gap-img", "qti-gap-match-interaction", "qti-gap-text", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-choice", "qti-hotspot-interaction", "qti-hottext", "qti-hottext-interaction", "qti-inline-choice", "qti-inline-choice-interaction", "qti-item-body", "qti-label", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-portable-custom-interaction", "qti-position-object-interaction", "qti-prompt", "qti-rubric-block", "qti-rubric-block.test", "qti-select-point-interaction", "qti-simple-associable-choice", "qti-simple-choice", "qti-slider-interaction", "qti-stimulus-body", "qti-template-block", "qti-template-block.rubric", "qti-template-inline", "qti-template-inline.rubric", "qti-text-entry-interaction", "qti-upload-interaction", "rb", "rp", "rt", "rtc", "ruby", "samp", "section", "small", "source", "span", "strong", "sub", "summary", "sup", "table", "tbody", "td", "tfoot", "th", "thead", "tr", "track", "tt", "ul", "var", "video"]) and Logic.eq(name, "label") over the rows a write removes from Attribute';

COMMENT ON FUNCTION "qti"."__judge_label_use_in_attribute_bmr4iy634l"() IS 'the rule judge''s block of rule LabelUse(package, path, start) in Attribute(package, path, start) where Logic.in(kind, ["a", "abbr", "acronym", "address", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blockquote", "br", "caption", "cite", "code", "col", "colgroup", "dd", "details", "dfn", "div", "dl", "dt", "em", "figcaption", "figure", "footer", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr", "i", "img", "kbd", "label", "li", "nav", "object", "ol", "p", "picture", "pre", "q", "qti-assessment-item", "qti-associable-hotspot", "qti-associate-interaction", "qti-choice-interaction", "qti-custom-interaction", "qti-drawing-interaction", "qti-end-attempt-interaction", "qti-extended-text-interaction", "qti-feedback-block", "qti-feedback-block.template", "qti-feedback-inline", "qti-gap", "qti-gap-img", "qti-gap-match-interaction", "qti-gap-text", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-choice", "qti-hotspot-interaction", "qti-hottext", "qti-hottext-interaction", "qti-inline-choice", "qti-inline-choice-interaction", "qti-item-body", "qti-label", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-portable-custom-interaction", "qti-position-object-interaction", "qti-prompt", "qti-rubric-block", "qti-rubric-block.test", "qti-select-point-interaction", "qti-simple-associable-choice", "qti-simple-choice", "qti-slider-interaction", "qti-stimulus-body", "qti-template-block", "qti-template-block.rubric", "qti-template-inline", "qti-template-inline.rubric", "qti-text-entry-interaction", "qti-upload-interaction", "rb", "rp", "rt", "rtc", "ruby", "samp", "section", "small", "source", "span", "strong", "sub", "summary", "sup", "table", "tbody", "td", "tfoot", "th", "thead", "tr", "track", "tt", "ul", "var", "video"]) and Logic.eq(name, "label") over the rows a write adds to LabelUse';

COMMENT ON FUNCTION "qti"."__judge_least_count_node_in_interaction_attribute_l6vh5ejg6k"() IS 'the rule judge''s block of rule LeastCountNode(package, path, start, minName, least) where Logic.eq(minWritten, true) in InteractionAttribute(package, path, start, name, value) where Logic.in(kind, ["qti-associable-hotspot", "qti-associate-interaction", "qti-choice-interaction", "qti-extended-text-interaction", "qti-gap-img", "qti-gap-match-interaction", "qti-gap-text", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-simple-associable-choice"]) and Logic.in(name, ["match-min", "min-associations", "min-choices", "min-plays", "min-strings"]) and Text.matches(value, Text.pattern(<language 5c9151c4e7e65fb8eb6a78468f4f1ac0a2aabe15b78b4265f0d3a3d9dede18b9>)) and Text.matches(value, Text.pattern(<language 7340417c049b8caba4cdc443c0a5a8c4b06b93ed6e1a6c08bfc55f6d4f36f88d>)) over its units';

COMMENT ON FUNCTION "qti"."__judge_least_one_apply_in_apply_argument_2d7xihrpfm"() IS 'the rule judge''s block of rule LeastOneApply(package, path, apply) in ApplyArgument(package, path, apply) over its units';

COMMENT ON FUNCTION "qti"."__judge_least_two_apply_in_apply_argument_pair_zyqztxyd3f"() IS 'the rule judge''s block of rule LeastTwoApply(package, path, apply) in ApplyArgumentPair(package, path, apply) over its units';

COMMENT ON FUNCTION "qti"."__judge_link_reading_in_placed_test_reference_wtknwvm73s"() IS 'the rule judge''s block of rule LinkReading(package, assembly, path, start, attribute) in PlacedTestReference(package, assembly, path, start, attribute) over its units';

COMMENT ON FUNCTION "qti"."__judge_link_reading_in_link_scope_q5hmbqiqyf"() IS 'the rule judge''s block of rule LinkReading(package, assembly, scopeInstance, scopePath, scope) in LinkScope(package, assembly, instance, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_listed_identifier_in_matched_identifier_jjfezvshvn"() IS 'the rule judge''s block of rule ListedIdentifier(package, path, record) in MatchedIdentifier(package, path, record) over its units';

COMMENT ON FUNCTION "qti"."__judge_listed_title_in_matched_title_kgmlfutjrq"() IS 'the rule judge''s block of rule ListedTitle(package, path, record) in MatchedTitle(package, path, record) over its units';

COMMENT ON FUNCTION "qti"."__judge_mapping_base_type_in_mappable_base_type_vmi22ubulw"() IS 'the rule judge''s block of rule MappingBaseType(baseType) in MappableBaseType(baseType) over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_mapping_base_type_in_mappable_base_type_7gxvjsv3ni"() IS 'the rule judge''s block of rule MappingBaseType(baseType) in MappableBaseType(baseType) over the rows a write adds to Node';

COMMENT ON FUNCTION "qti"."__judge_math_action_in_node_qwhx5nmpvn"() IS 'the rule judge''s block of rule MathAction(package, path, start) in Node(package, path, start) where Logic.eq(kind, "m:maction") over the rows a write adds to MathAction';

COMMENT ON FUNCTION "qti"."__judge_math_action_in_node_lh3miyd7vn"() IS 'the rule judge''s block of rule MathAction(package, path, start) in Node(package, path, start) where Logic.eq(kind, "m:maction") over the rows a write removes from Node';

COMMENT ON FUNCTION "qti"."__judge_math_action_selection_written_in_attribute_dmev5yfy6d"() IS 'the rule judge''s block of rule MathAction(package, path, start) where Logic.eq(selectionWritten, true) in Attribute(package, path, start) where Logic.eq(kind, "m:maction") and Logic.eq(name, "selection") over the rows a write removes from Attribute';

COMMENT ON FUNCTION "qti"."__judge_math_action_selection_written_in_attribute_73wyoen5hx"() IS 'the rule judge''s block of rule MathAction(package, path, start) where Logic.eq(selectionWritten, true) in Attribute(package, path, start) where Logic.eq(kind, "m:maction") and Logic.eq(name, "selection") over the rows a write adds to MathAction';

COMMENT ON FUNCTION "qti"."__judge_math_align_scope_in_scoped_dir_fq3qe27snp"() IS 'the rule judge''s block of rule MathAlignScope(package, path, start, own) where Logic.ne(inherited, own) in ScopedDir(package, path, start, direction) over its units';

COMMENT ON FUNCTION "qti"."__judge_math_cell_in_node_u5m3rontek"() IS 'the rule judge''s block of rule MathCell(package, path, start) in Node(package, path, start) where Logic.eq(kind, "m:mtd") over the rows a write adds to MathCell';

COMMENT ON FUNCTION "qti"."__judge_math_cell_in_node_nfojgk5pze"() IS 'the rule judge''s block of rule MathCell(package, path, start) in Node(package, path, start) where Logic.eq(kind, "m:mtd") over the rows a write removes from Node';

COMMENT ON FUNCTION "qti"."__judge_math_cn_in_node_tagdr7vhlf"() IS 'the rule judge''s block of rule MathCn(package, path, start) in Node(package, path, start) where Logic.eq(kind, "m:cn") over the rows a write adds to MathCn';

COMMENT ON FUNCTION "qti"."__judge_math_cn_in_node_gq7mj4blic"() IS 'the rule judge''s block of rule MathCn(package, path, start) in Node(package, path, start) where Logic.eq(kind, "m:cn") over the rows a write removes from Node';

COMMENT ON FUNCTION "qti"."__judge_math_cn_base_lexical_in_cn_attribute_t2mbv5ax7o"() IS 'the rule judge''s block of rule MathCn(package, path, start, baseLexicalDigest) where Logic.ne(baseLexical, "") in CnAttribute(package, path, start, lexicalDigest) where Logic.eq(name, "base") over the rows a write removes from CnAttribute';

COMMENT ON FUNCTION "qti"."__judge_math_cn_base_lexical_in_cn_attribute_zianth7glo"() IS 'the rule judge''s block of rule MathCn(package, path, start, baseLexicalDigest) where Logic.ne(baseLexical, "") in CnAttribute(package, path, start, lexicalDigest) where Logic.eq(name, "base") over the rows a write adds to MathCn';

COMMENT ON FUNCTION "qti"."__judge_math_cn_type_lexical_in_cn_attribute_s6xpqmiquk"() IS 'the rule judge''s block of rule MathCn(package, path, start, typeLexicalDigest) where Logic.ne(typeLexical, "") in CnAttribute(package, path, start, lexicalDigest) where Logic.eq(name, "type") over the rows a write removes from CnAttribute';

COMMENT ON FUNCTION "qti"."__judge_math_cn_type_lexical_in_cn_attribute_pfgzjqjc2b"() IS 'the rule judge''s block of rule MathCn(package, path, start, typeLexicalDigest) where Logic.ne(typeLexical, "") in CnAttribute(package, path, start, lexicalDigest) where Logic.eq(name, "type") over the rows a write adds to MathCn';

COMMENT ON FUNCTION "qti"."__judge_math_rank_node_in_math_rank_sd66a7za5w"() IS 'the rule judge''s block of rule MathRankNode(package, path, parent) where Logic.ne(kind, "m:math") and Logic.ne(parent, start) in MathRank(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_media_in_entry_quqrddwivu"() IS 'the rule judge''s block of rule Media(package, path) in Entry(package, path) where Logic.eq(kind, "media") over the rows a write removes from Entry';

COMMENT ON FUNCTION "qti"."__judge_media_in_entry_dzlxu3kyqq"() IS 'the rule judge''s block of rule Media(package, path) in Entry(package, path) where Logic.eq(kind, "media") over the rows a write adds to Media';

COMMENT ON FUNCTION "qti"."__judge_most_count_node_in_interaction_attribute_pbdlblsprx"() IS 'the rule judge''s block of rule MostCountNode(package, path, start, maxName, most) where Logic.eq(maxWritten, true) in InteractionAttribute(package, path, start, name, value) where Logic.in(kind, ["qti-associable-hotspot", "qti-associate-interaction", "qti-choice-interaction", "qti-extended-text-interaction", "qti-gap-img", "qti-gap-match-interaction", "qti-gap-text", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-simple-associable-choice"]) and Logic.in(name, ["match-max", "max-associations", "max-choices", "max-plays", "max-strings"]) and Text.matches(value, Text.pattern(<language 5c9151c4e7e65fb8eb6a78468f4f1ac0a2aabe15b78b4265f0d3a3d9dede18b9>)) and Text.matches(value, Text.pattern(<language 7340417c049b8caba4cdc443c0a5a8c4b06b93ed6e1a6c08bfc55f6d4f36f88d>)) over its units';

COMMENT ON FUNCTION "qti"."__judge_named_in_test_identifier_syehmpldfc"() IS 'the rule judge''s block of rule Named(package, path, start, identifier) in TestIdentifier(package, path, start, value) over its units';

COMMENT ON FUNCTION "qti"."__judge_named_item_ref_in_object_identifier_62wj7qla5o"() IS 'the rule judge''s block of rule NamedItemRef(package, item, identifier) in ObjectIdentifier(package, path, value) over its units';

COMMENT ON FUNCTION "qti"."__judge_node_kind_start_in_document_k6k5wpme62"() IS 'the rule judge''s block of rule Node(package, path) where Logic.eq(kind, "document") and Logic.eq(start, 0n) in Document(package, path) over the rows a write removes from Document';

COMMENT ON FUNCTION "qti"."__judge_node_kind_start_in_document_f7unhma5xc"() IS 'the rule judge''s block of rule Node(package, path) where Logic.eq(kind, "document") and Logic.eq(start, 0n) in Document(package, path) over the rows a write adds to Node';

COMMENT ON FUNCTION "qti"."__judge_node_kind_parent_kind_in_document_m6m55zy7hu"() IS 'the rule judge''s block of rule Node(package, path, kind) where Logic.not(Logic.in(kind, ["comment", "doctype", "document", "entityRef", "pi", "text", "ws"])) and Logic.eq(parentKind, "document") in Document(package, path, rootKind) over the rows a write removes from Document';

COMMENT ON FUNCTION "qti"."__judge_node_kind_parent_kind_in_document_key7lmqiqe"() IS 'the rule judge''s block of rule Node(package, path, kind) where Logic.not(Logic.in(kind, ["comment", "doctype", "document", "entityRef", "pi", "text", "ws"])) and Logic.eq(parentKind, "document") in Document(package, path, rootKind) over the rows a write adds to Node';

COMMENT ON FUNCTION "qti"."__judge_node_kind_parent_kind_in_pci_module_form_ve5tbo7ntk"() IS 'the rule judge''s block of rule Node(package, path, parent) where Logic.eq(kind, "qti-interaction-modules") and Logic.eq(parentKind, "qti-portable-custom-interaction") in PciModuleForm(package, path, start) where Logic.eq(element, true) over the rows a write adds to Node';

COMMENT ON FUNCTION "qti"."__judge_node_kind_parent_kind_in_pci_module_form_wylhun6gga"() IS 'the rule judge''s block of rule Node(package, path, parent) where Logic.eq(kind, "qti-interaction-modules") and Logic.eq(parentKind, "qti-portable-custom-interaction") in PciModuleForm(package, path, start) where Logic.eq(element, true) over the rows a write removes from PciModuleForm';

COMMENT ON FUNCTION "qti"."__judge_node_kind_kind_kind_in_element_type_5l52x6yiko"() IS 'the rule judge''s block of rule Node(package, path, start) where Logic.not(Logic.in(kind, ["comment", "doctype", "document", "entityRef", "pi", "text", "ws"])) and Logic.not(Logic.in(kind, ["foreign-element", "no-namespace-element", "own-namespace-element"])) and Logic.not(AnonymousType.has(kind)) in ElementType(package, path, start) over the rows a write removes from ElementType';

COMMENT ON FUNCTION "qti"."__judge_node_kind_kind_kind_in_element_type_wle3mcdmor"() IS 'the rule judge''s block of rule Node(package, path, start) where Logic.not(Logic.in(kind, ["comment", "doctype", "document", "entityRef", "pi", "text", "ws"])) and Logic.not(Logic.in(kind, ["foreign-element", "no-namespace-element", "own-namespace-element"])) and Logic.not(AnonymousType.has(kind)) in ElementType(package, path, start) over the rows a write adds to Node';

COMMENT ON FUNCTION "qti"."__judge_node_governor_in_identity_text_s3wity7c4d"() IS 'the rule judge''s block of rule Node(package, path, start) where Logic.in(ValueIdentity.at("identity", TextDomain.at("domain", governor)), ["ID", "IDREF", "IDREFS"]) in IdentityText(package, path, start) over the rows a write removes from IdentityText';

COMMENT ON FUNCTION "qti"."__judge_node_governor_in_identity_text_7umxr33yk7"() IS 'the rule judge''s block of rule Node(package, path, start) where Logic.in(ValueIdentity.at("identity", TextDomain.at("domain", governor)), ["ID", "IDREF", "IDREFS"]) in IdentityText(package, path, start) over the rows a write adds to Node';

COMMENT ON FUNCTION "qti"."__judge_node_kind_in_open_element_name_bpp6rkn6t5"() IS 'the rule judge''s block of rule Node(package, path, start) where Logic.in(kind, ["foreign-element", "no-namespace-element", "own-namespace-element"]) in OpenElementName(package, path, start) over the rows a write adds to Node';

COMMENT ON FUNCTION "qti"."__judge_node_kind_in_open_element_name_n7pmvma4ij"() IS 'the rule judge''s block of rule Node(package, path, start) where Logic.in(kind, ["foreign-element", "no-namespace-element", "own-namespace-element"]) in OpenElementName(package, path, start) over the rows a write removes from OpenElementName';

COMMENT ON FUNCTION "qti"."__judge_node_kind_governor_kind_in_open_element_type_hcu4hwk534"() IS 'the rule judge''s block of rule Node(package, path, start) where Logic.in(kind, ["foreign-element", "no-namespace-element", "own-namespace-element"]) and Logic.ne(KindGovernor.at("governor", kind), governor) in OpenElementType(package, path, start) over the rows a write adds to Node';

COMMENT ON FUNCTION "qti"."__judge_node_kind_governor_kind_in_open_element_type_bg2n3mg46d"() IS 'the rule judge''s block of rule Node(package, path, start) where Logic.in(kind, ["foreign-element", "no-namespace-element", "own-namespace-element"]) and Logic.ne(KindGovernor.at("governor", kind), governor) in OpenElementType(package, path, start) over the rows a write removes from OpenElementType';

COMMENT ON FUNCTION "qti"."__judge_node_kind_in_expression_oxp552kpkh"() IS 'the rule judge''s block of rule Node(package, path, start) where Logic.in(kind, ["qti-and", "qti-any-n", "qti-base-value", "qti-container-size", "qti-contains", "qti-correct", "qti-custom-operator", "qti-default", "qti-delete", "qti-divide", "qti-duration-gte", "qti-duration-lt", "qti-equal", "qti-equal-rounded", "qti-field-value", "qti-gcd", "qti-gt", "qti-gte", "qti-index", "qti-inside", "qti-integer-divide", "qti-integer-modulus", "qti-integer-to-float", "qti-is-null", "qti-lcm", "qti-lt", "qti-lte", "qti-map-response", "qti-map-response-point", "qti-match", "qti-math-constant", "qti-math-operator", "qti-max", "qti-member", "qti-min", "qti-multiple", "qti-not", "qti-null", "qti-number-correct", "qti-number-incorrect", "qti-number-presented", "qti-number-responded", "qti-number-selected", "qti-or", "qti-ordered", "qti-outcome-maximum", "qti-outcome-minimum", "qti-pattern-match", "qti-power", "qti-product", "qti-random", "qti-random-float", "qti-random-integer", "qti-repeat", "qti-round", "qti-round-to", "qti-stats-operator", "qti-string-match", "qti-substring", "qti-subtract", "qti-sum", "qti-test-variables", "qti-truncate", "qti-variable"]) in Expression(package, path, start) over the rows a write removes from Expression';

COMMENT ON FUNCTION "qti"."__judge_node_kind_in_expression_sdwby4w55o"() IS 'the rule judge''s block of rule Node(package, path, start) where Logic.in(kind, ["qti-and", "qti-any-n", "qti-base-value", "qti-container-size", "qti-contains", "qti-correct", "qti-custom-operator", "qti-default", "qti-delete", "qti-divide", "qti-duration-gte", "qti-duration-lt", "qti-equal", "qti-equal-rounded", "qti-field-value", "qti-gcd", "qti-gt", "qti-gte", "qti-index", "qti-inside", "qti-integer-divide", "qti-integer-modulus", "qti-integer-to-float", "qti-is-null", "qti-lcm", "qti-lt", "qti-lte", "qti-map-response", "qti-map-response-point", "qti-match", "qti-math-constant", "qti-math-operator", "qti-max", "qti-member", "qti-min", "qti-multiple", "qti-not", "qti-null", "qti-number-correct", "qti-number-incorrect", "qti-number-presented", "qti-number-responded", "qti-number-selected", "qti-or", "qti-ordered", "qti-outcome-maximum", "qti-outcome-minimum", "qti-pattern-match", "qti-power", "qti-product", "qti-random", "qti-random-float", "qti-random-integer", "qti-repeat", "qti-round", "qti-round-to", "qti-stats-operator", "qti-string-match", "qti-substring", "qti-subtract", "qti-sum", "qti-test-variables", "qti-truncate", "qti-variable"]) in Expression(package, path, start) over the rows a write adds to Node';

COMMENT ON FUNCTION "qti"."__judge_node_kind_in_rounding_2rz32ccb5d"() IS 'the rule judge''s block of rule Node(package, path, start) where Logic.in(kind, ["qti-equal-rounded", "qti-round-to"]) in Rounding(package, path, start) over the rows a write adds to Node';

COMMENT ON FUNCTION "qti"."__judge_node_kind_in_rounding_jtqqxvwby6"() IS 'the rule judge''s block of rule Node(package, path, start) where Logic.in(kind, ["qti-equal-rounded", "qti-round-to"]) in Rounding(package, path, start) over the rows a write removes from Rounding';

COMMENT ON FUNCTION "qti"."__judge_node_kind_in_processing_g66n3h275c"() IS 'the rule judge''s block of rule Node(package, path, start) where Logic.in(kind, ["qti-exit-response", "qti-exit-template", "qti-exit-test", "qti-lookup-outcome-value", "qti-outcome-condition", "qti-outcome-else", "qti-outcome-else-if", "qti-outcome-if", "qti-outcome-processing", "qti-outcome-processing-fragment", "qti-response-condition", "qti-response-else", "qti-response-else-if", "qti-response-if", "qti-response-processing", "qti-response-processing-fragment", "qti-set-correct-response", "qti-set-default-value", "qti-set-outcome-value", "qti-set-template-value", "qti-template-condition", "qti-template-constraint", "qti-template-else", "qti-template-else-if", "qti-template-if", "qti-template-processing"]) in Processing(package, path, start) over the rows a write adds to Node';

COMMENT ON FUNCTION "qti"."__judge_node_kind_in_processing_jsf3pyrqrs"() IS 'the rule judge''s block of rule Node(package, path, start) where Logic.in(kind, ["qti-exit-response", "qti-exit-template", "qti-exit-test", "qti-lookup-outcome-value", "qti-outcome-condition", "qti-outcome-else", "qti-outcome-else-if", "qti-outcome-if", "qti-outcome-processing", "qti-outcome-processing-fragment", "qti-response-condition", "qti-response-else", "qti-response-else-if", "qti-response-if", "qti-response-processing", "qti-response-processing-fragment", "qti-set-correct-response", "qti-set-default-value", "qti-set-outcome-value", "qti-set-template-value", "qti-template-condition", "qti-template-constraint", "qti-template-else", "qti-template-else-if", "qti-template-if", "qti-template-processing"]) in Processing(package, path, start) over the rows a write removes from Processing';

COMMENT ON FUNCTION "qti"."__judge_node_kind_in_comment_w2s2sntlpq"() IS 'the rule judge''s block of rule Node(package, path, start) where Logic.eq(kind, "comment") in Comment(package, path, start) over the rows a write removes from Comment';

COMMENT ON FUNCTION "qti"."__judge_node_kind_in_comment_ab57m5aehp"() IS 'the rule judge''s block of rule Node(package, path, start) where Logic.eq(kind, "comment") in Comment(package, path, start) over the rows a write adds to Node';

COMMENT ON FUNCTION "qti"."__judge_node_kind_in_doctype_qvmphc7s7f"() IS 'the rule judge''s block of rule Node(package, path, start) where Logic.eq(kind, "doctype") in Doctype(package, path, start) over the rows a write removes from Doctype';

COMMENT ON FUNCTION "qti"."__judge_node_kind_in_doctype_bo644gxc5x"() IS 'the rule judge''s block of rule Node(package, path, start) where Logic.eq(kind, "doctype") in Doctype(package, path, start) over the rows a write adds to Node';

COMMENT ON FUNCTION "qti"."__judge_node_kind_in_math_action_yo74segxzc"() IS 'the rule judge''s block of rule Node(package, path, start) where Logic.eq(kind, "m:maction") in MathAction(package, path, start) over the rows a write removes from MathAction';

COMMENT ON FUNCTION "qti"."__judge_node_kind_in_math_action_r6ko5fub7s"() IS 'the rule judge''s block of rule Node(package, path, start) where Logic.eq(kind, "m:maction") in MathAction(package, path, start) over the rows a write adds to Node';

COMMENT ON FUNCTION "qti"."__judge_node_kind_in_math_align_scope_5zywsqegwn"() IS 'the rule judge''s block of rule Node(package, path, start) where Logic.eq(kind, "m:mtd") in MathAlignScope(package, path, start) over the rows a write removes from MathAlignScope';

COMMENT ON FUNCTION "qti"."__judge_node_kind_in_math_align_scope_jy2ww5r7qp"() IS 'the rule judge''s block of rule Node(package, path, start) where Logic.eq(kind, "m:mtd") in MathAlignScope(package, path, start) over the rows a write adds to Node';

COMMENT ON FUNCTION "qti"."__judge_node_kind_in_math_cell_u2guuwiykd"() IS 'the rule judge''s block of rule Node(package, path, start) where Logic.eq(kind, "m:mtd") in MathCell(package, path, start) over the rows a write removes from MathCell';

COMMENT ON FUNCTION "qti"."__judge_node_kind_in_math_cell_twue42lrlt"() IS 'the rule judge''s block of rule Node(package, path, start) where Logic.eq(kind, "m:mtd") in MathCell(package, path, start) over the rows a write adds to Node';

COMMENT ON FUNCTION "qti"."__judge_node_kind_in_pi_q7jdefxzmj"() IS 'the rule judge''s block of rule Node(package, path, start) where Logic.eq(kind, "pi") in Pi(package, path, start) over the rows a write adds to Node';

COMMENT ON FUNCTION "qti"."__judge_node_kind_in_pi_rpflacykid"() IS 'the rule judge''s block of rule Node(package, path, start) where Logic.eq(kind, "pi") in Pi(package, path, start) over the rows a write removes from Pi';

COMMENT ON FUNCTION "qti"."__judge_node_kind_in_site_gmyuwfo4pt"() IS 'the rule judge''s block of rule Node(package, path, start) where Logic.eq(kind, "qti-assessment-section-ref") in Site(package, path, start) over the rows a write adds to Node';

COMMENT ON FUNCTION "qti"."__judge_node_kind_in_site_kxwlimydrh"() IS 'the rule judge''s block of rule Node(package, path, start) where Logic.eq(kind, "qti-assessment-section-ref") in Site(package, path, start) over the rows a write removes from Site';

COMMENT ON FUNCTION "qti"."__judge_node_kind_in_text_reference_ds2q2v44va"() IS 'the rule judge''s block of rule Node(package, path, start, kind) where Logic.in(kind, ["qti-file-href", "qti-file-href.card", "qti-resource-icon"]) in TextReference(package, path, start, kind) over the rows a write adds to Node';

COMMENT ON FUNCTION "qti"."__judge_node_kind_in_text_reference_3j4p2wxich"() IS 'the rule judge''s block of rule Node(package, path, start, kind) where Logic.in(kind, ["qti-file-href", "qti-file-href.card", "qti-resource-icon"]) in TextReference(package, path, start, kind) over the rows a write removes from TextReference';

COMMENT ON FUNCTION "qti"."__judge_node_governor_in_document_id_t72riq5vgr"() IS 'the rule judge''s block of rule Node(package, path, start, parent) where Logic.eq(ValueIdentity.at("identity", TextDomain.at("domain", governor)), "ID") in DocumentId(package, path, start, owner) over the rows a write removes from DocumentId';

COMMENT ON FUNCTION "qti"."__judge_node_governor_in_document_id_2fc734h47u"() IS 'the rule judge''s block of rule Node(package, path, start, parent) where Logic.eq(ValueIdentity.at("identity", TextDomain.at("domain", governor)), "ID") in DocumentId(package, path, start, owner) over the rows a write adds to Node';

COMMENT ON FUNCTION "qti"."__judge_node_kind_in_literal_e5lmjutrkq"() IS 'the rule judge''s block of rule Node(package, path, start, stringValue) where Logic.eq(kind, "qti-base-value") in Literal(package, path, start, text) over the rows a write removes from Literal';

COMMENT ON FUNCTION "qti"."__judge_node_kind_in_literal_jrwqu4miuy"() IS 'the rule judge''s block of rule Node(package, path, start, stringValue) where Logic.eq(kind, "qti-base-value") in Literal(package, path, start, text) over the rows a write adds to Node';

COMMENT ON FUNCTION "qti"."__judge_numbered_reading_in_placed_test_reference_zafni3vczq"() IS 'the rule judge''s block of rule NumberedReading(package, assembly, path, start, attribute) in PlacedTestReference(package, assembly, path, start, attribute) over its units';

COMMENT ON FUNCTION "qti"."__judge_numbered_reading_in_numbered_target_dsbi3oxtg2"() IS 'the rule judge''s block of rule NumberedReading(package, assembly, scope, scopeInstance, scopePath, variable) in NumberedTarget(package, assembly, scope, scopeInstance, scopePath, variable) over its units';

COMMENT ON FUNCTION "qti"."__judge_numbered_reading_in_assembled_replaceable_ijilkt3uhd"() IS 'the rule judge''s block of rule NumberedReading(package, assembly, scopeInstance, scopePath, scope) in AssembledReplaceable(package, assembly, instance, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_open_attribute_kind_in_open_element_name_xw54mdoffj"() IS 'the rule judge''s block of rule OpenAttribute(package, path, start, elementNamespace) where Logic.in(kind, ["foreign-element", "no-namespace-element", "own-namespace-element"]) in OpenElementName(package, path, start, namespace) over the rows a write adds to OpenAttribute';

COMMENT ON FUNCTION "qti"."__judge_open_attribute_kind_in_open_element_name_lryukbia3l"() IS 'the rule judge''s block of rule OpenAttribute(package, path, start, elementNamespace) where Logic.in(kind, ["foreign-element", "no-namespace-element", "own-namespace-element"]) in OpenElementName(package, path, start, namespace) over the rows a write removes from OpenElementName';

COMMENT ON FUNCTION "qti"."__judge_open_name_node_in_open_element_type_fcsyhf2l5y"() IS 'the rule judge''s block of rule OpenNameNode(package, path, start) where Logic.not(Text.matches(expanded, HeldRootsUnder.at("names", parentKind))) and Logic.or(Logic.and(Logic.eq(Bits.disjoint(StrictlyHeld.row(parentKind), ["foreign-element"]), false), Logic.eq(kind, "foreign-element")), Logic.and(Logic.eq(Bits.disjoint(StrictlyHeld.row(parentKind), ["no-namespace-element"]), false), Logic.eq(kind, "no-namespace-element")), Logic.and(Logic.eq(Bits.disjoint(StrictlyHeld.row(parentKind), ["own-namespace-element"]), false), Logic.eq(kind, "own-namespace-element"))) in OpenElementType(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_packaged_template_default_in_item_ref_33osfbsdkp"() IS 'the rule judge''s block of rule PackagedTemplateDefault(package, path, ref) in ItemRefDocument(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_pci_module_form_element_in_attribute_od6262tvqk"() IS 'the rule judge''s block of rule PciModuleForm(package, path, start) where Logic.eq(element, false) in Attribute(package, path, start) where Logic.eq(kind, "qti-portable-custom-interaction") and Logic.eq(name, "module") over the rows a write removes from Attribute';

COMMENT ON FUNCTION "qti"."__judge_pci_module_form_element_in_attribute_z7pl7tbygw"() IS 'the rule judge''s block of rule PciModuleForm(package, path, start) where Logic.eq(element, false) in Attribute(package, path, start) where Logic.eq(kind, "qti-portable-custom-interaction") and Logic.eq(name, "module") over the rows a write adds to PciModuleForm';

COMMENT ON FUNCTION "qti"."__judge_pci_module_form_element_in_node_tcgihyv3xz"() IS 'the rule judge''s block of rule PciModuleForm(package, path, start) where Logic.eq(element, true) in Node(package, path, parent) where Logic.eq(kind, "qti-interaction-modules") and Logic.eq(parentKind, "qti-portable-custom-interaction") over the rows a write removes from Node';

COMMENT ON FUNCTION "qti"."__judge_pci_module_form_element_in_node_6rhlpgac52"() IS 'the rule judge''s block of rule PciModuleForm(package, path, start) where Logic.eq(element, true) in Node(package, path, parent) where Logic.eq(kind, "qti-interaction-modules") and Logic.eq(parentKind, "qti-portable-custom-interaction") over the rows a write adds to PciModuleForm';

COMMENT ON FUNCTION "qti"."__judge_pi_in_node_z6azvvbpxq"() IS 'the rule judge''s block of rule Pi(package, path, start) in Node(package, path, start) where Logic.eq(kind, "pi") over the rows a write removes from Node';

COMMENT ON FUNCTION "qti"."__judge_pi_in_node_2p5xbgivdf"() IS 'the rule judge''s block of rule Pi(package, path, start) in Node(package, path, start) where Logic.eq(kind, "pi") over the rows a write adds to Pi';

COMMENT ON FUNCTION "qti"."__judge_placed_binding_in_named_declaration_laa4jy7plq"() IS 'the rule judge''s block of rule PlacedBinding(package, assembly, identifier) in NamedDeclaration(package, path, identifier) where Logic.eq(declarationKind, "qti-response-declaration") over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_binding_in_instance_i4qehlkf52"() IS 'the rule judge''s block of rule PlacedBinding(package, assembly, instance, path) in Instance(package, assembly, start, document) where Logic.eq(assemblyKind, "qti-assessment-item") over the rows a write removes from Instance';

COMMENT ON FUNCTION "qti"."__judge_placed_binding_in_instance_epjux4k27a"() IS 'the rule judge''s block of rule PlacedBinding(package, assembly, instance, path) in Instance(package, assembly, start, document) where Logic.eq(assemblyKind, "qti-assessment-item") over the rows a write adds to PlacedBinding';

COMMENT ON FUNCTION "qti"."__judge_placed_binding_base_type_node_in_binding_fit_jq37ljyvup"() IS 'the rule judge''s block of rule PlacedBindingBaseTypeNode(baseType, cardinality, kind) where Logic.not(Logic.in(kind, ["qti-custom-interaction", "qti-order-interaction", "qti-portable-custom-interaction"])) and Logic.eq(attribute, "response-identifier") and Logic.ne(cardinality, "record") in BindingFit(baseType, cardinality, kind) over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_placed_binding_base_type_node_in_binding_fit_2vwwsmpk4j"() IS 'the rule judge''s block of rule PlacedBindingBaseTypeNode(baseType, cardinality, kind) where Logic.not(Logic.in(kind, ["qti-custom-interaction", "qti-order-interaction", "qti-portable-custom-interaction"])) and Logic.eq(attribute, "response-identifier") and Logic.ne(cardinality, "record") in BindingFit(baseType, cardinality, kind) over the rows a write adds to Node';

COMMENT ON FUNCTION "qti"."__judge_placed_binding_base_type_node_in_binding_fit_4iyuycimyl"() IS 'the rule judge''s block of rule PlacedBindingBaseTypeNode(baseType, cardinality, kind) where Logic.not(Logic.in(kind, ["qti-custom-interaction", "qti-order-interaction", "qti-portable-custom-interaction"])) and Logic.eq(attribute, "response-identifier") and Logic.ne(cardinality, "record") in BindingFit(baseType, cardinality, kind) over the rows a write adds to PlacedBinding';

COMMENT ON FUNCTION "qti"."__judge_placed_binding_cardinality_node_in_record_cwvy6luker"() IS 'the rule judge''s block of rule PlacedBindingCardinalityNode(kind) where Logic.not(Logic.in(kind, ["qti-custom-interaction", "qti-order-interaction", "qti-portable-custom-interaction"])) and Logic.eq(attribute, "response-identifier") and Logic.eq(cardinality, "record") in RecordBindingFit(kind) over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_placed_binding_cardinality_node_in_record_3ew7mz55jn"() IS 'the rule judge''s block of rule PlacedBindingCardinalityNode(kind) where Logic.not(Logic.in(kind, ["qti-custom-interaction", "qti-order-interaction", "qti-portable-custom-interaction"])) and Logic.eq(attribute, "response-identifier") and Logic.eq(cardinality, "record") in RecordBindingFit(kind) over the rows a write adds to Node';

COMMENT ON FUNCTION "qti"."__judge_placed_binding_cardinality_node_in_record_gg37lxtbok"() IS 'the rule judge''s block of rule PlacedBindingCardinalityNode(kind) where Logic.not(Logic.in(kind, ["qti-custom-interaction", "qti-order-interaction", "qti-portable-custom-interaction"])) and Logic.eq(attribute, "response-identifier") and Logic.eq(cardinality, "record") in RecordBindingFit(kind) over the rows a write adds to PlacedBinding';

COMMENT ON FUNCTION "qti"."__judge_placed_binding_cardinality_node_in_count_l23umml5ll"() IS 'the rule judge''s block of rule PlacedBindingCardinalityNode(package, path, start) where Logic.in(cardinality, ["multiple", "ordered"]) and Logic.eq(attribute, "response-identifier") and Logic.eq(kind, "qti-extended-text-interaction") in CountBound(package, path, start) where Logic.eq(maxWritten, true) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_choice_or_hottext_in_unclaimed_name_dqd4nmh3tg"() IS 'the rule judge''s block of rule PlacedChoiceOrHottext(package, assembly, identifier) in UnclaimedName(package, path, identifier) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_expression_in_placed_expression_site_c6a4sqoxzi"() IS 'the rule judge''s block of rule PlacedExpression(package, assembly, instance, path, start) in PlacedExpressionSite(package, assembly, instance, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_expression_node_in_result_base_52yvevrvha"() IS 'the rule judge''s block of rule PlacedExpressionNode(kind, baseType) where Logic.or(Logic.not(Logic.in(kind, ["qti-base-value", "qti-math-operator", "qti-test-variables"])), Logic.ne(baseType, "unknown")) in ResultBase(kind, base) over the rows a write adds to Node';

COMMENT ON FUNCTION "qti"."__judge_placed_expression_node_in_result_base_f2jcwyccwc"() IS 'the rule judge''s block of rule PlacedExpressionNode(kind, baseType) where Logic.or(Logic.not(Logic.in(kind, ["qti-base-value", "qti-math-operator", "qti-test-variables"])), Logic.ne(baseType, "unknown")) in ResultBase(kind, base) over the rows a write adds to PlacedExpression';

COMMENT ON FUNCTION "qti"."__judge_placed_expression_node_in_result_cardinality_fg5v7mwjmk"() IS 'the rule judge''s block of rule PlacedExpressionNode(kind, cardinality) in ResultCardinality(kind, cardinality) over the rows a write adds to Node';

COMMENT ON FUNCTION "qti"."__judge_placed_expression_node_in_result_cardinality_h7knww2j3x"() IS 'the rule judge''s block of rule PlacedExpressionNode(kind, cardinality) in ResultCardinality(kind, cardinality) over the rows a write adds to PlacedExpression';

COMMENT ON FUNCTION "qti"."__judge_placed_expression_node_in_unknown_operand_4jfoz4enon"() IS 'the rule judge''s block of rule PlacedExpressionNode(package, assembly, instance, path, start) where Logic.in(kind, ["qti-index", "qti-multiple", "qti-ordered", "qti-random", "qti-repeat"]) and Logic.eq(baseType, "unknown") in UnknownOperandBase(package, assembly, instance, path, operator) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_expression_node_in_operand_of_ibrrwiwkp3"() IS 'the rule judge''s block of rule PlacedExpressionNode(package, assembly, instance, path, start) where Logic.in(kind, ["qti-index", "qti-multiple", "qti-ordered", "qti-random", "qti-repeat"]) and Logic.ne(baseType, "any") in OperandOf(package, assembly, instance, path, operator) where Logic.ne(baseType, "any") over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_expression_node_in_operand_of_gaxj4la5gl"() IS 'the rule judge''s block of rule PlacedExpressionNode(package, assembly, instance, path, start) where Logic.in(kind, ["qti-max", "qti-min", "qti-product", "qti-subtract", "qti-sum"]) and Logic.eq(baseType, "integer") in OperandOf(package, assembly, instance, path, operator) where Logic.eq(baseType, "integer") over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_expression_node_in_operand_of_4fxyo5746y"() IS 'the rule judge''s block of rule PlacedExpressionNode(package, assembly, instance, path, start) where Logic.in(kind, ["qti-max", "qti-min", "qti-product", "qti-subtract", "qti-sum"]) and Logic.eq(baseType, "unknown") in OperandOf(package, assembly, instance, path, operator) where Logic.eq(baseType, "unknown") over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_expression_node_in_unknown_tail_base_ycrhwf4vtp"() IS 'the rule judge''s block of rule PlacedExpressionNode(package, assembly, instance, path, start) where Logic.eq(baseType, "unknown") and Logic.eq(kind, "qti-delete") in UnknownTailBase(package, assembly, instance, path, operator) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_expression_node_in_operand_of_ifnaqwffo5"() IS 'the rule judge''s block of rule PlacedExpressionNode(package, assembly, instance, path, start) where Logic.ne(baseType, "any") and Logic.eq(kind, "qti-delete") in OperandOf(package, assembly, instance, path, operator) where Logic.ne(baseType, "any") and Logic.gt(rank, 1n) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_expression_node_in_operand_of_37elyafujz"() IS 'the rule judge''s block of rule PlacedExpressionNode(package, assembly, instance, path, start) where Logic.ne(cardinality, "unknown") and Logic.eq(kind, "qti-delete") in OperandOf(package, assembly, instance, path, operator) where Logic.ne(cardinality, "unknown") and Logic.gt(rank, 1n) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_expression_node_in_literal_typed_pfzmypwa4j"() IS 'the rule judge''s block of rule PlacedExpressionNode(package, path, start) where Logic.ne(baseType, "unknown") and Logic.eq(kind, "qti-base-value") in LiteralTyped(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_expression_node_in_literal_6vnigmtln5"() IS 'the rule judge''s block of rule PlacedExpressionNode(package, path, start, baseType) where Logic.eq(kind, "qti-base-value") in Literal(package, path, start, baseType) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_expression_site_in_placed_expression_xxvjz7jkff"() IS 'the rule judge''s block of rule PlacedExpressionSite(package, assembly, instance, path, start) in PlacedExpression(package, assembly, instance, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_filter_in_filtered_section_f5dn7wucxk"() IS 'the rule judge''s block of rule PlacedFilter(package, assembly, path, start) in FilteredSection(package, assembly, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_id_in_id_value_ome55phaff"() IS 'the rule judge''s block of rule PlacedId(package, path, start, id, owner) in IdValue(package, path, start, id, owner) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_include_path_in_site_target_mm5ngb7w4o"() IS 'the rule judge''s block of rule PlacedIncludePath(package, path, start) in SiteTarget(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_math_rank_node_in_placed_math_rank_zzuuujgsvi"() IS 'the rule judge''s block of rule PlacedMathRankNode(package, assembly, instance, parent) where Logic.ne(kind, "m:math") and Logic.ne(parent, start) in PlacedMathRank(package, assembly, instance, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_reference_in_assembled_catalog_j6bcnwfhka"() IS 'the rule judge''s block of rule PlacedReference(package, assembly, tokenDigest) in AssembledCatalog(package, assembly, idDigest) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_reference_site_in_placed_variable_ref_vuvtx5sfhd"() IS 'the rule judge''s block of rule PlacedReferenceSite(package, assembly, instance, path, start, attribute, identifier) in PlacedVariableRef(package, assembly, instance, path, start, attribute, identifier) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_share_target_in_assembled_id_scw7xk6dyw"() IS 'the rule judge''s block of rule PlacedShareTarget(package, assembly, idDigest, target, targetStart, targetInstance) in AssembledId(package, assembly, idDigest, path, owner, instance) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_test_reference_in_test_reading_t2qjsabvhp"() IS 'the rule judge''s block of rule PlacedTestReference(package, assembly, path, start, attribute) in TestReading(package, assembly, path, start, attribute) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_declaration_in_typed_3vj5q5cetd"() IS 'the rule judge''s block of rule PlacedVariableDeclaration(package, declPath, declStart) where Logic.ne(baseType, "unknown") in TypedDeclarationName(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_ref_in_named_declaration_lqohxzzyqo"() IS 'the rule judge''s block of rule PlacedVariableRef(package, assembly, identifier) where Logic.eq(resolution, "declared") in NamedDeclaration(package, path, identifier) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_ref_in_sole_reading_jagikyuxss"() IS 'the rule judge''s block of rule PlacedVariableRef(package, assembly, instance, path, start, attribute) where Logic.eq(resolution, "read") in SoleReading(package, assembly, instance, path, start, attribute) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_ref_in_placed_reference_site_5ewlmg7v6r"() IS 'the rule judge''s block of rule PlacedVariableRef(package, assembly, instance, path, start, attribute, identifier) in PlacedReferenceSite(package, assembly, instance, path, start, attribute, identifier) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_ref_declaration_in_reference_reyey4lu3w"() IS 'the rule judge''s block of rule PlacedVariableRefDeclaration(kind, attribute, declarationKind) where Logic.eq(attribute, "identifier") in ReferenceDeclaration(kind, attribute, declaration) over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_ref_declaration_in_reference_vst4hxfkrw"() IS 'the rule judge''s block of rule PlacedVariableRefDeclaration(kind, attribute, declarationKind) where Logic.eq(attribute, "identifier") in ReferenceDeclaration(kind, attribute, declaration) over the rows a write adds to Node';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_ref_declaration_in_reference_aldyfzi7tc"() IS 'the rule judge''s block of rule PlacedVariableRefDeclaration(kind, attribute, declarationKind) where Logic.eq(attribute, "identifier") in ReferenceDeclaration(kind, attribute, declaration) over the rows a write adds to PlacedVariableRef';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_ref_declaration_in_reference_nksn7gkcyu"() IS 'the rule judge''s block of rule PlacedVariableRefDeclaration(kind, attribute, declarationKind) where Logic.eq(attribute, "identifier") in ReferenceDeclaration(kind, attribute, declaration) over the rows a write adds to VariableRef';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_ref_declaration_in_3la5v6erpg"() IS 'the rule judge''s block of rule PlacedVariableRefDeclaration(package, assembly, declaration) where Logic.eq(attribute, "identifier") and Logic.eq(kind, "qti-lookup-outcome-value") in DeclarationTable(package, path, declaration) where Logic.in(kind, ["qti-interpolation-table", "qti-match-table"]) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_ref_declaration_in_xo34jozlnj"() IS 'the rule judge''s block of rule PlacedVariableRefDeclaration(package, assembly, declaration) where Logic.eq(attribute, "identifier") and Logic.eq(kind, "qti-map-response") in DeclarationTable(package, path, declaration) where Logic.eq(kind, "qti-mapping") over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_ref_declaration_in_nawbh4uthe"() IS 'the rule judge''s block of rule PlacedVariableRefDeclaration(package, assembly, declaration) where Logic.eq(attribute, "identifier") and Logic.eq(kind, "qti-map-response-point") in DeclarationTable(package, path, declaration) where Logic.eq(kind, "qti-area-mapping") over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_weighted_variable_in_item_scoped_5nc7mpyg7v"() IS 'the rule judge''s block of rule PlacedWeightedVariable(package, assembly, path, start) in ItemScopedReading(package, assembly, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_prefixed_declaration_in_reference_gqrpbyy3ks"() IS 'the rule judge''s block of rule PrefixedDeclaration(kind, attribute, declarationKind) in ReferenceDeclaration(kind, attribute, declaration) over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_prefixed_declaration_in_reference_osqrqcl6sf"() IS 'the rule judge''s block of rule PrefixedDeclaration(kind, attribute, declarationKind) in ReferenceDeclaration(kind, attribute, declaration) over the rows a write adds to Instance';

COMMENT ON FUNCTION "qti"."__judge_prefixed_declaration_in_reference_325y3hayes"() IS 'the rule judge''s block of rule PrefixedDeclaration(kind, attribute, declarationKind) in ReferenceDeclaration(kind, attribute, declaration) over the rows a write adds to ItemRefDocument';

COMMENT ON FUNCTION "qti"."__judge_prefixed_declaration_in_reference_5sfly4jy2i"() IS 'the rule judge''s block of rule PrefixedDeclaration(kind, attribute, declarationKind) in ReferenceDeclaration(kind, attribute, declaration) over the rows a write adds to Named';

COMMENT ON FUNCTION "qti"."__judge_prefixed_declaration_in_reference_xbm2pkzlyg"() IS 'the rule judge''s block of rule PrefixedDeclaration(kind, attribute, declarationKind) in ReferenceDeclaration(kind, attribute, declaration) over the rows a write adds to Node';

COMMENT ON FUNCTION "qti"."__judge_prefixed_declaration_in_reference_ztl6qpgumy"() IS 'the rule judge''s block of rule PrefixedDeclaration(kind, attribute, declarationKind) in ReferenceDeclaration(kind, attribute, declaration) over the rows a write adds to VariableRef';

COMMENT ON FUNCTION "qti"."__judge_prefixed_map_response_in_item_ref_table_drfjtnkj7w"() IS 'the rule judge''s block of rule PrefixedMapResponse(package, scopePath, scope, variable) in ItemRefTable(package, path, start, variable) where Logic.eq(table, "qti-mapping") over its units';

COMMENT ON FUNCTION "qti"."__judge_prefixed_map_response_point_in_item_ref_qugmtxiwgf"() IS 'the rule judge''s block of rule PrefixedMapResponsePoint(package, scopePath, scope, variable) in ItemRefTable(package, path, start, variable) where Logic.eq(table, "qti-area-mapping") over its units';

COMMENT ON FUNCTION "qti"."__judge_printed_variable_ref_in_referable_name_kth7oea7g2"() IS 'the rule judge''s block of rule PrintedVariableRef(package, path, identifier, kind, attribute) where Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "completionStatus", "duration", "numAttempts"])), Logic.ne(assemblyKind, "qti-assessment-item")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "completionStatus", "duration", "numAttempts"])), Logic.ne(assemblyKind, "qti-response-processing")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "duration"])), Logic.ne(assemblyKind, "qti-assessment-section")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "duration"])), Logic.ne(assemblyKind, "qti-assessment-test")) in ReferableName(package, path, identifier, kind, attribute) over its units';

COMMENT ON FUNCTION "qti"."__judge_processing_node_in_processing_7cf6ge7r3n"() IS 'the rule judge''s block of rule ProcessingNode(package, path, parent, language) where Logic.not(Logic.in(kind, ["qti-outcome-processing", "qti-response-processing", "qti-template-processing"])) and Logic.in(parentKind, ["qti-exit-response", "qti-exit-template", "qti-exit-test", "qti-lookup-outcome-value", "qti-outcome-condition", "qti-outcome-else", "qti-outcome-else-if", "qti-outcome-if", "qti-outcome-processing", "qti-outcome-processing-fragment", "qti-response-condition", "qti-response-else", "qti-response-else-if", "qti-response-if", "qti-response-processing", "qti-response-processing-fragment", "qti-set-correct-response", "qti-set-default-value", "qti-set-outcome-value", "qti-set-template-value", "qti-template-condition", "qti-template-constraint", "qti-template-else", "qti-template-else-if", "qti-template-if", "qti-template-processing"]) in Processing(package, path, start, language) over its units';

COMMENT ON FUNCTION "qti"."__judge_read_include_in_site_fcdzu2tgyv"() IS 'the rule judge''s block of rule ReadInclude(package, path, start) in Site(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_record_set_value_in_attribute_pamcgaegai"() IS 'the rule judge''s block of rule RecordSetValue(package, path, start) in Attribute(package, path, start) where Logic.eq(kind, "qti-value") and Logic.eq(name, "base-type") over its units';

COMMENT ON FUNCTION "qti"."__judge_record_set_value_in_attribute_syg2uc77ur"() IS 'the rule judge''s block of rule RecordSetValue(package, path, start) in Attribute(package, path, start) where Logic.eq(kind, "qti-value") and Logic.eq(name, "field-identifier") over its units';

COMMENT ON FUNCTION "qti"."__judge_reference_kind_name_scope_in_item_ref_href_vf3ybnmgws"() IS 'the rule judge''s block of rule Reference(package, path, start) where Logic.eq(kind, "qti-assessment-item-ref") and Logic.eq(name, "href") and Logic.ne(scope, "external") in ItemRefHref(package, path, start) over the rows a write removes from ItemRefHref';

COMMENT ON FUNCTION "qti"."__judge_reference_kind_name_scope_in_item_ref_href_db5wjzokoe"() IS 'the rule judge''s block of rule Reference(package, path, start) where Logic.eq(kind, "qti-assessment-item-ref") and Logic.eq(name, "href") and Logic.ne(scope, "external") in ItemRefHref(package, path, start) over the rows a write adds to Reference';

COMMENT ON FUNCTION "qti"."__judge_reference_in_attribute_nvr4gqu7qw"() IS 'the rule judge''s block of rule Reference(package, path, start, name) in Attribute(package, path, start, name) where Logic.in(ReferenceAttribute.at("form", kind, name), ["module", "package", "uri"]) over the rows a write removes from Attribute';

COMMENT ON FUNCTION "qti"."__judge_reference_in_attribute_tdu2bini5i"() IS 'the rule judge''s block of rule Reference(package, path, start, name) in Attribute(package, path, start, name) where Logic.in(ReferenceAttribute.at("form", kind, name), ["module", "package", "uri"]) over the rows a write adds to Reference';

COMMENT ON FUNCTION "qti"."__judge_reference_scope_in_reference_path_xqbzw4ifdt"() IS 'the rule judge''s block of rule Reference(package, path, start, name, kind) where Logic.eq(scope, "entry") in ReferencePath(package, path, start, name, kind) over the rows a write adds to Reference';

COMMENT ON FUNCTION "qti"."__judge_reference_scope_in_reference_path_jp74s2kug2"() IS 'the rule judge''s block of rule Reference(package, path, start, name, kind) where Logic.eq(scope, "entry") in ReferencePath(package, path, start, name, kind) over the rows a write removes from ReferencePath';

COMMENT ON FUNCTION "qti"."__judge_reference_path_in_reference_3ezrqqsnlj"() IS 'the rule judge''s block of rule ReferencePath(package, path, start, name, kind) in Reference(package, path, start, name, kind) where Logic.eq(scope, "entry") over the rows a write removes from Reference';

COMMENT ON FUNCTION "qti"."__judge_reference_path_in_reference_t472wjwnof"() IS 'the rule judge''s block of rule ReferencePath(package, path, start, name, kind) in Reference(package, path, start, name, kind) where Logic.eq(scope, "entry") over the rows a write adds to ReferencePath';

COMMENT ON FUNCTION "qti"."__judge_reference_path_kind_in_document_dxcifqjxh7"() IS 'the rule judge''s block of rule ReferencePath(package, target) where Logic.eq(kind, "qti-assessment-stimulus-ref") in Document(package, path) where Logic.eq(rootKind, "qti-assessment-stimulus") over the rows a write removes from Document';

COMMENT ON FUNCTION "qti"."__judge_reference_path_kind_in_document_3ofg4tjcaf"() IS 'the rule judge''s block of rule ReferencePath(package, target) where Logic.eq(kind, "qti-assessment-stimulus-ref") in Document(package, path) where Logic.eq(rootKind, "qti-assessment-stimulus") over the rows a write adds to ReferencePath';

COMMENT ON FUNCTION "qti"."__judge_required_parts_in_requirement_met_pfkli5s36z"() IS 'the rule judge''s block of rule RequiredParts(package, path, section) in RequirementMet(package, path, section) over its units';

COMMENT ON FUNCTION "qti"."__judge_required_ssml_property_in_data_ssml_property_4wrzttmwkr"() IS 'the rule judge''s block of rule RequiredSsmlProperty(package, path, start, member, nameDigest) in DataSsmlProperty(package, path, start, member, nameDigest) over its units';

COMMENT ON FUNCTION "qti"."__judge_resource_document_in_typed_path_imht7jyi3v"() IS 'the rule judge''s block of rule ResourceDocument(package, path, type) in TypedPath(package, target, type) over its units';

COMMENT ON FUNCTION "qti"."__judge_resource_href_in_attribute_5xliax2lru"() IS 'the rule judge''s block of rule ResourceHref(package, path, start) in Attribute(package, path, start) where Logic.eq(kind, "cp:resource") and Logic.eq(name, "href") and Logic.eq(path, "imsmanifest.xml") over the rows a write removes from Attribute';

COMMENT ON FUNCTION "qti"."__judge_resource_href_in_attribute_v6mjq6no6g"() IS 'the rule judge''s block of rule ResourceHref(package, path, start) in Attribute(package, path, start) where Logic.eq(kind, "cp:resource") and Logic.eq(name, "href") and Logic.eq(path, "imsmanifest.xml") over the rows a write adds to ResourceHref';

COMMENT ON FUNCTION "qti"."__judge_resource_href_in_node_n6af4twa63"() IS 'the rule judge''s block of rule ResourceHref(package, path, start) in Node(package, path, start) where Logic.eq(kind, "cp:resource") over the rows a write removes from Node';

COMMENT ON FUNCTION "qti"."__judge_resource_href_in_node_bzqub2kh3v"() IS 'the rule judge''s block of rule ResourceHref(package, path, start) in Node(package, path, start) where Logic.eq(kind, "cp:resource") over the rows a write adds to ResourceHref';

COMMENT ON FUNCTION "qti"."__judge_resource_href_in_resource_file_document_qn7rsras4g"() IS 'the rule judge''s block of rule ResourceHref(package, path, start) where Logic.eq(scope, "document") in ResourceFileDocument(package, path, resource) over its units';

COMMENT ON FUNCTION "qti"."__judge_resource_href_scope_in_resource_href_path_5a2ic5xgkp"() IS 'the rule judge''s block of rule ResourceHref(package, path, start) where Logic.eq(scope, "entry") in ResourceHrefPath(package, path, start) over the rows a write adds to ResourceHref';

COMMENT ON FUNCTION "qti"."__judge_resource_href_scope_in_resource_href_path_zfrtbtb2cj"() IS 'the rule judge''s block of rule ResourceHref(package, path, start) where Logic.eq(scope, "entry") in ResourceHrefPath(package, path, start) over the rows a write removes from ResourceHrefPath';

COMMENT ON FUNCTION "qti"."__judge_resource_href_scope_in_resource_href_outside_2banlt6fza"() IS 'the rule judge''s block of rule ResourceHref(package, path, start) where Logic.eq(scope, "external") in ResourceHrefOutside(package, path, start) over the rows a write adds to ResourceHref';

COMMENT ON FUNCTION "qti"."__judge_resource_href_scope_in_resource_href_outside_ym3n2dgrny"() IS 'the rule judge''s block of rule ResourceHref(package, path, start) where Logic.eq(scope, "external") in ResourceHrefOutside(package, path, start) over the rows a write removes from ResourceHrefOutside';

COMMENT ON FUNCTION "qti"."__judge_resource_href_outside_in_resource_href_njkg7tduy3"() IS 'the rule judge''s block of rule ResourceHrefOutside(package, path, start) in ResourceHref(package, path, start) where Logic.eq(scope, "external") over the rows a write removes from ResourceHref';

COMMENT ON FUNCTION "qti"."__judge_resource_href_outside_in_resource_href_rxgozvdgsd"() IS 'the rule judge''s block of rule ResourceHrefOutside(package, path, start) in ResourceHref(package, path, start) where Logic.eq(scope, "external") over the rows a write adds to ResourceHrefOutside';

COMMENT ON FUNCTION "qti"."__judge_resource_href_outside_in_resource_file_iqunqhzsrf"() IS 'the rule judge''s block of rule ResourceHrefOutside(package, path, start, targetDigest, target) in ResourceFileOutside(package, path, resource, targetDigest, target) over its units';

COMMENT ON FUNCTION "qti"."__judge_resource_href_path_in_resource_href_lqtit4z4j2"() IS 'the rule judge''s block of rule ResourceHrefPath(package, path, start) in ResourceHref(package, path, start) where Logic.eq(scope, "entry") over the rows a write removes from ResourceHref';

COMMENT ON FUNCTION "qti"."__judge_resource_href_path_in_resource_href_gue657k2ny"() IS 'the rule judge''s block of rule ResourceHrefPath(package, path, start) in ResourceHref(package, path, start) where Logic.eq(scope, "entry") over the rows a write adds to ResourceHrefPath';

COMMENT ON FUNCTION "qti"."__judge_resource_href_path_in_resource_file_path_4fdzdqmxmd"() IS 'the rule judge''s block of rule ResourceHrefPath(package, path, start, target) in ResourceFilePath(package, path, resource, target) over its units';

COMMENT ON FUNCTION "qti"."__judge_rounding_in_node_vdkfqeprwq"() IS 'the rule judge''s block of rule Rounding(package, path, start) in Node(package, path, start) where Logic.in(kind, ["qti-equal-rounded", "qti-round-to"]) over the rows a write removes from Node';

COMMENT ON FUNCTION "qti"."__judge_rounding_in_node_mpmhhwop5o"() IS 'the rule judge''s block of rule Rounding(package, path, start) in Node(package, path, start) where Logic.in(kind, ["qti-equal-rounded", "qti-round-to"]) over the rows a write adds to Rounding';

COMMENT ON FUNCTION "qti"."__judge_rounding_holds_in_rounding_figures_j2lu5p222q"() IS 'the rule judge''s block of rule Rounding(package, path, start) where Logic.in(holds, ["both", "figures"]) in RoundingFigures(package, path, start) over the rows a write adds to Rounding';

COMMENT ON FUNCTION "qti"."__judge_rounding_holds_in_rounding_figures_f2j7yg3sat"() IS 'the rule judge''s block of rule Rounding(package, path, start) where Logic.in(holds, ["both", "figures"]) in RoundingFigures(package, path, start) over the rows a write removes from RoundingFigures';

COMMENT ON FUNCTION "qti"."__judge_rounding_in_rounding_mode_6geuz5667c"() IS 'the rule judge''s block of rule Rounding(package, path, start) where Logic.in(holds, ["both", "mode"]) in RoundingMode(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_rounding_holds_in_rounding_mode_figures_wpsvhqnozr"() IS 'the rule judge''s block of rule Rounding(package, path, start) where Logic.eq(holds, "both") in RoundingModeFigures(package, path, start) over the rows a write adds to Rounding';

COMMENT ON FUNCTION "qti"."__judge_rounding_holds_in_rounding_mode_figures_u3fqnzn2gx"() IS 'the rule judge''s block of rule Rounding(package, path, start) where Logic.eq(holds, "both") in RoundingModeFigures(package, path, start) over the rows a write removes from RoundingModeFigures';

COMMENT ON FUNCTION "qti"."__judge_rounding_figures_in_attribute_gfknrqmveq"() IS 'the rule judge''s block of rule RoundingFigures(package, path, start) in Attribute(package, path, start) where Logic.in(kind, ["qti-equal-rounded", "qti-round-to"]) and Logic.eq(name, "figures") over the rows a write removes from Attribute';

COMMENT ON FUNCTION "qti"."__judge_rounding_figures_in_attribute_bky2cxagfl"() IS 'the rule judge''s block of rule RoundingFigures(package, path, start) in Attribute(package, path, start) where Logic.in(kind, ["qti-equal-rounded", "qti-round-to"]) and Logic.eq(name, "figures") over the rows a write adds to RoundingFigures';

COMMENT ON FUNCTION "qti"."__judge_rounding_figures_in_rounding_b7bus5gte7"() IS 'the rule judge''s block of rule RoundingFigures(package, path, start) in Rounding(package, path, start) where Logic.in(holds, ["both", "figures"]) over the rows a write removes from Rounding';

COMMENT ON FUNCTION "qti"."__judge_rounding_figures_in_rounding_ibbjba64hh"() IS 'the rule judge''s block of rule RoundingFigures(package, path, start) in Rounding(package, path, start) where Logic.in(holds, ["both", "figures"]) over the rows a write adds to RoundingFigures';

COMMENT ON FUNCTION "qti"."__judge_rounding_mode_in_rounding_esbh5hi542"() IS 'the rule judge''s block of rule RoundingMode(package, path, start) in Rounding(package, path, start) where Logic.in(holds, ["both", "mode"]) over its units';

COMMENT ON FUNCTION "qti"."__judge_rounding_mode_figures_in_rounding_zzxbeas5p4"() IS 'the rule judge''s block of rule RoundingModeFigures(package, path, start) in Rounding(package, path, start) where Logic.eq(holds, "both") over the rows a write removes from Rounding';

COMMENT ON FUNCTION "qti"."__judge_rounding_mode_figures_in_rounding_2uw6nmafpv"() IS 'the rule judge''s block of rule RoundingModeFigures(package, path, start) in Rounding(package, path, start) where Logic.eq(holds, "both") over the rows a write adds to RoundingModeFigures';

COMMENT ON FUNCTION "qti"."__judge_rounding_mode_figures_in_rounding_mode_5zudd4zspn"() IS 'the rule judge''s block of rule RoundingModeFigures(package, path, start, mode) in RoundingMode(package, path, start, mode) over its units';

COMMENT ON FUNCTION "qti"."__judge_scope_node_in_math_align_scope_eydczxjui3"() IS 'the rule judge''s block of rule ScopeNode(package, path, parent, cell, received, inherited) where Logic.ne(kind, "m:mtd") in MathAlignScope(package, path, start, cell, passes, own) over its units';

COMMENT ON FUNCTION "qti"."__judge_scope_node_in_math_action_twlrriudbq"() IS 'the rule judge''s block of rule ScopeNode(package, path, parent, chosen) where Logic.ne(kind, "m:mtd") and Logic.eq(parentKind, "m:maction") in MathAction(package, path, start, selection) over its units';

COMMENT ON FUNCTION "qti"."__judge_scope_node_in_cell_leaf_k2tkxijueq"() IS 'the rule judge''s block of rule ScopeNode(package, path, start) where Logic.eq(elementChildren, 0n) and Logic.ne(kind, "m:mtd") in CellLeaf(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_scope_node_in_math_align_group_37gc2we3rj"() IS 'the rule judge''s block of rule ScopeNode(package, path, start, cell) where Logic.eq(kind, "m:maligngroup") and Logic.eq(state, "open") in MathAlignGroup(package, path, start, cell) over its units';

COMMENT ON FUNCTION "qti"."__judge_selection_without_replacement_in_bounded_rq3pwixcla"() IS 'the rule judge''s block of rule SelectionWithoutReplacement(package, path, section) in BoundedSelection(package, path, section) over its units';

COMMENT ON FUNCTION "qti"."__judge_share_fragment_assembled_in_assembled_myf3dn7vdb"() IS 'the rule judge''s block of rule ShareFragment(package, path, placements) where Logic.eq(assembled, true) in AssembledDocument(package, path, instances) over the rows a write removes from AssembledDocument';

COMMENT ON FUNCTION "qti"."__judge_share_fragment_assembled_in_assembled_vbgxkigxwi"() IS 'the rule judge''s block of rule ShareFragment(package, path, placements) where Logic.eq(assembled, true) in AssembledDocument(package, path, instances) over the rows a write adds to ShareFragment';

COMMENT ON FUNCTION "qti"."__judge_share_fragment_in_share_source_pz2yiw3tyu"() IS 'the rule judge''s block of rule ShareFragment(package, path, start) in ShareSource(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_share_fragment_assembled_in_share_target_tiszl67tly"() IS 'the rule judge''s block of rule ShareFragment(package, path, start, idDigest) where Logic.eq(assembled, false) in ShareTarget(package, path, start, idDigest) over the rows a write adds to ShareFragment';

COMMENT ON FUNCTION "qti"."__judge_share_fragment_assembled_in_share_target_ngqlvr64ut"() IS 'the rule judge''s block of rule ShareFragment(package, path, start, idDigest) where Logic.eq(assembled, false) in ShareTarget(package, path, start, idDigest) over the rows a write removes from ShareTarget';

COMMENT ON FUNCTION "qti"."__judge_share_source_in_share_fragment_fmvo4kaezi"() IS 'the rule judge''s block of rule ShareSource(package, path, start) in ShareFragment(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_share_target_in_id_binding_4uxmpjdwt7"() IS 'the rule judge''s block of rule ShareTarget(package, path, id, targetStart) in IdBinding(package, path, id, owner) over its units';

COMMENT ON FUNCTION "qti"."__judge_share_target_in_share_fragment_k632fooma6"() IS 'the rule judge''s block of rule ShareTarget(package, path, start, id) in ShareFragment(package, path, start, id) where Logic.eq(assembled, false) over the rows a write removes from ShareFragment';

COMMENT ON FUNCTION "qti"."__judge_share_target_in_share_fragment_3jzk2seq2h"() IS 'the rule judge''s block of rule ShareTarget(package, path, start, id) in ShareFragment(package, path, start, id) where Logic.eq(assembled, false) over the rows a write adds to ShareTarget';

COMMENT ON FUNCTION "qti"."__judge_site_external_in_reference_nz47ettjyg"() IS 'the rule judge''s block of rule Site(package, path, start) where Logic.eq(external, true) in Reference(package, path, start) where Logic.eq(name, "href") and Logic.eq(scope, "external") over the rows a write removes from Reference';

COMMENT ON FUNCTION "qti"."__judge_site_external_in_reference_f7wnqweo4s"() IS 'the rule judge''s block of rule Site(package, path, start) where Logic.eq(external, true) in Reference(package, path, start) where Logic.eq(name, "href") and Logic.eq(scope, "external") over the rows a write adds to Site';

COMMENT ON FUNCTION "qti"."__judge_site_in_read_include_edxuzxblcr"() IS 'the rule judge''s block of rule Site(package, path, start) where Logic.eq(kind, "xi:include") in ReadInclude(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_site_external_kind_in_site_path_k35b4pbcbn"() IS 'the rule judge''s block of rule Site(package, path, start, kind) where Logic.eq(external, false) and Logic.eq(kind, "qti-assessment-section-ref") in SitePath(package, path, start, kind) over the rows a write adds to Site';

COMMENT ON FUNCTION "qti"."__judge_site_external_kind_in_site_path_haxaeun2ju"() IS 'the rule judge''s block of rule Site(package, path, start, kind) where Logic.eq(external, false) and Logic.eq(kind, "qti-assessment-section-ref") in SitePath(package, path, start, kind) over the rows a write removes from SitePath';

COMMENT ON FUNCTION "qti"."__judge_site_external_kind_in_site_path_bszep42hpg"() IS 'the rule judge''s block of rule Site(package, path, start, kind) where Logic.eq(external, false) and Logic.eq(kind, "xi:include") in SitePath(package, path, start, kind) over the rows a write adds to Site';

COMMENT ON FUNCTION "qti"."__judge_site_external_kind_in_site_path_fpo3qnyrxd"() IS 'the rule judge''s block of rule Site(package, path, start, kind) where Logic.eq(external, false) and Logic.eq(kind, "xi:include") in SitePath(package, path, start, kind) over the rows a write removes from SitePath';

COMMENT ON FUNCTION "qti"."__judge_site_path_entry_kind_in_site_target_j6s7emnkmr"() IS 'the rule judge''s block of rule SitePath(package, path, start) where Logic.eq(entry, true) and Logic.eq(kind, "qti-assessment-section-ref") in SiteTarget(package, path, start) over the rows a write adds to SitePath';

COMMENT ON FUNCTION "qti"."__judge_site_path_entry_kind_in_site_target_s3vyrx6jae"() IS 'the rule judge''s block of rule SitePath(package, path, start) where Logic.eq(entry, true) and Logic.eq(kind, "qti-assessment-section-ref") in SiteTarget(package, path, start) over the rows a write removes from SiteTarget';

COMMENT ON FUNCTION "qti"."__judge_site_path_in_reference_path_tkta3m2bqp"() IS 'the rule judge''s block of rule SitePath(package, path, start, target) in ReferencePath(package, path, start, target) where Logic.eq(name, "href") over the rows a write removes from ReferencePath';

COMMENT ON FUNCTION "qti"."__judge_site_path_in_reference_path_zm5zuh5osc"() IS 'the rule judge''s block of rule SitePath(package, path, start, target) in ReferencePath(package, path, start, target) where Logic.eq(name, "href") over the rows a write adds to SitePath';

COMMENT ON FUNCTION "qti"."__judge_site_path_entry_in_entry_zb72qyoxxe"() IS 'the rule judge''s block of rule SitePath(package, target) where Logic.eq(entry, true) in Entry(package, path) over the rows a write removes from Entry';

COMMENT ON FUNCTION "qti"."__judge_site_path_entry_in_entry_cyx4opydyq"() IS 'the rule judge''s block of rule SitePath(package, target) where Logic.eq(entry, true) in Entry(package, path) over the rows a write adds to SitePath';

COMMENT ON FUNCTION "qti"."__judge_site_target_kind_in_inclusion_2ubiapt3wt"() IS 'the rule judge''s block of rule SiteTarget(package, path, start) where Logic.eq(kind, "xi:include") in Inclusion(package, path, start) over the rows a write removes from Inclusion';

COMMENT ON FUNCTION "qti"."__judge_site_target_kind_in_inclusion_grsvyxbmzk"() IS 'the rule judge''s block of rule SiteTarget(package, path, start) where Logic.eq(kind, "xi:include") in Inclusion(package, path, start) over the rows a write adds to SiteTarget';

COMMENT ON FUNCTION "qti"."__judge_sole_reading_in_placed_variable_ref_inw76664fp"() IS 'the rule judge''s block of rule SoleReading(package, assembly, instance, path, start, attribute) in PlacedVariableRef(package, assembly, instance, path, start, attribute) where Logic.eq(resolution, "read") over its units';

COMMENT ON FUNCTION "qti"."__judge_srcset_in_attribute_6oem3jmqro"() IS 'the rule judge''s block of rule Srcset(package, path, start) in Attribute(package, path, start) where Logic.eq(kind, "source") and Logic.eq(name, "srcset") over the rows a write removes from Attribute';

COMMENT ON FUNCTION "qti"."__judge_srcset_in_attribute_tnmle4lok5"() IS 'the rule judge''s block of rule Srcset(package, path, start) in Attribute(package, path, start) where Logic.eq(kind, "source") and Logic.eq(name, "srcset") over the rows a write adds to Srcset';

COMMENT ON FUNCTION "qti"."__judge_srcset_candidate_scope_in_candidate_path_t5ehszemhe"() IS 'the rule judge''s block of rule SrcsetCandidate(package, path, start, at) where Logic.eq(scope, "entry") in CandidatePath(package, path, start, at) over the rows a write removes from CandidatePath';

COMMENT ON FUNCTION "qti"."__judge_srcset_candidate_scope_in_candidate_path_6blf5yyxfp"() IS 'the rule judge''s block of rule SrcsetCandidate(package, path, start, at) where Logic.eq(scope, "entry") in CandidatePath(package, path, start, at) over the rows a write adds to SrcsetCandidate';

COMMENT ON FUNCTION "qti"."__judge_ssml_scope_node_in_ssml_scope_mk4lvybzot"() IS 'the rule judge''s block of rule SsmlScopeNode(package, path, parent, fragment) where Logic.ne(kind, "ssml:speak") and Logic.ne(parent, 0n) in SsmlScope(package, path, start, fragment) over its units';

COMMENT ON FUNCTION "qti"."__judge_ssml_value_in_ssml_value_fuse53jjeg"() IS 'the rule judge''s block of rule SsmlValue(package, path, fragment, value) where Logic.eq(kind, "ssml:lookup") in SsmlValue(package, path, fragment, value) where Logic.eq(kind, "ssml:lexicon") over its units';

COMMENT ON FUNCTION "qti"."__judge_ssml_value_in_trimmed_mark_yt7rwpsw22"() IS 'the rule judge''s block of rule SsmlValue(package, path, start, value) where Logic.eq(kind, "ssml:speak") in TrimmedMark(package, path, fragment, value) over its units';

COMMENT ON FUNCTION "qti"."__judge_stimulus_ref_in_node_poqx5ecim2"() IS 'the rule judge''s block of rule StimulusRef(package, path, start) in Node(package, path, start) where Logic.eq(kind, "qti-assessment-stimulus-ref") over the rows a write removes from Node';

COMMENT ON FUNCTION "qti"."__judge_stimulus_ref_in_node_jsez6mfieg"() IS 'the rule judge''s block of rule StimulusRef(package, path, start) in Node(package, path, start) where Logic.eq(kind, "qti-assessment-stimulus-ref") over the rows a write adds to StimulusRef';

COMMENT ON FUNCTION "qti"."__judge_stimulus_ref_in_test_identifier_qu6fc3vcub"() IS 'the rule judge''s block of rule StimulusRef(package, path, start, identifier) in TestIdentifier(package, path, start, value) over its units';

COMMENT ON FUNCTION "qti"."__judge_structure_naming_in_named_i7g7ynxwbq"() IS 'the rule judge''s block of rule StructureNaming(package, path, start) in Named(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_targeted_branch_rule_in_forward_branch_rule_rn4jsry4rd"() IS 'the rule judge''s block of rule TargetedBranchRule(package, assembly, instance, start) in ForwardBranchRule(package, assembly, instance, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_template_processing_in_named_declaration_krafx4vntd"() IS 'the rule judge''s block of rule TemplateProcessing(package, path) where Logic.in(value, ["https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_map_response", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_map_response.xml", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_match", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_match.xml", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_match_basic", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_match_basic.xml", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/map_response", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/map_response.xml", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/map_response_point", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/map_response_point.xml", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct.xml", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_map_response", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_map_response.xml", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_match", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_match.xml", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_match_basic", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_match_basic.xml", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/map_response", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/map_response.xml", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/map_response_point", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/map_response_point.xml", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/match_correct", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/match_correct.xml"]) in NamedDeclaration(package, path) where Logic.eq(declarationKind, "qti-outcome-declaration") and Logic.eq(identifier, "SCORE") over its units';

COMMENT ON FUNCTION "qti"."__judge_template_processing_in_named_declaration_ebldx6qrsv"() IS 'the rule judge''s block of rule TemplateProcessing(package, path) where Logic.in(value, ["https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_map_response", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_map_response.xml", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_match", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_match.xml", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_match_basic", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_match_basic.xml", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/map_response", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/map_response.xml", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/map_response_point", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/map_response_point.xml", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct.xml", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_map_response", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_map_response.xml", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_match", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_match.xml", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_match_basic", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_match_basic.xml", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/map_response", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/map_response.xml", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/map_response_point", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/map_response_point.xml", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/match_correct", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/match_correct.xml"]) in NamedDeclaration(package, path) where Logic.eq(declarationKind, "qti-response-declaration") and Logic.eq(identifier, "RESPONSE") over its units';

COMMENT ON FUNCTION "qti"."__judge_template_processing_in_named_declaration_zhds5lyjvx"() IS 'the rule judge''s block of rule TemplateProcessing(package, path) where Logic.in(value, ["https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_map_response", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_map_response.xml", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_match_basic", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_match_basic.xml", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_map_response", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_map_response.xml", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_match_basic", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_match_basic.xml"]) in NamedDeclaration(package, path) where Logic.in(declarationKind, ["qti-outcome-declaration", "qti-response-declaration", "qti-template-declaration"]) and Logic.eq(identifier, "MAXSCORE") over its units';

COMMENT ON FUNCTION "qti"."__judge_template_processing_in_mapped_response_4nbxhkabiy"() IS 'the rule judge''s block of rule TemplateProcessing(package, path) where Logic.in(value, ["https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_map_response", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_map_response.xml", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/map_response", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/map_response.xml", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_map_response", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_map_response.xml", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/map_response", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/map_response.xml"]) in MappedResponseDeclaration(package, path) over its units';

COMMENT ON FUNCTION "qti"."__judge_template_processing_in_named_declaration_lrli4h3uef"() IS 'the rule judge''s block of rule TemplateProcessing(package, path) where Logic.in(value, ["https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_map_response", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_map_response.xml", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_map_response", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_map_response.xml"]) in NamedDeclaration(package, path) where Logic.eq(declarationKind, "qti-outcome-declaration") and Logic.eq(identifier, "FEEDBACK") over its units';

COMMENT ON FUNCTION "qti"."__judge_template_processing_in_named_declaration_rm7fsk3y4d"() IS 'the rule judge''s block of rule TemplateProcessing(package, path) where Logic.in(value, ["https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_match_basic", "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/CC2_match_basic.xml", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_match_basic", "https://www.imsglobal.org/question/qti_v3p0/rptemplates/CC2_match_basic.xml"]) in NamedDeclaration(package, path) where Logic.eq(declarationKind, "qti-outcome-declaration") and Logic.eq(identifier, "FEEDBACKBASIC") over its units';

COMMENT ON FUNCTION "qti"."__judge_template_ref_in_referable_name_ukivozws2i"() IS 'the rule judge''s block of rule TemplateRef(package, path, identifier, kind, attribute) where Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "completionStatus", "duration", "numAttempts"])), Logic.ne(assemblyKind, "qti-assessment-item")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "completionStatus", "duration", "numAttempts"])), Logic.ne(assemblyKind, "qti-response-processing")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "duration"])), Logic.ne(assemblyKind, "qti-assessment-section")) and Logic.or(Logic.not(Logic.in(identifier, ["QTI_CONTEXT", "duration"])), Logic.ne(assemblyKind, "qti-assessment-test")) in ReferableName(package, path, identifier, kind, attribute) over its units';

COMMENT ON FUNCTION "qti"."__judge_text_reference_in_node_75qxuaxcuf"() IS 'the rule judge''s block of rule TextReference(package, path, start) in Node(package, path, start) where Logic.in(kind, ["qti-file-href", "qti-file-href.card", "qti-resource-icon"]) over the rows a write removes from Node';

COMMENT ON FUNCTION "qti"."__judge_text_reference_in_node_evtdxodxzr"() IS 'the rule judge''s block of rule TextReference(package, path, start) in Node(package, path, start) where Logic.in(kind, ["qti-file-href", "qti-file-href.card", "qti-resource-icon"]) over the rows a write adds to TextReference';

COMMENT ON FUNCTION "qti"."__judge_text_reference_scope_in_text_reference_path_7xyy2odgom"() IS 'the rule judge''s block of rule TextReference(package, path, start, kind) where Logic.eq(scope, "entry") in TextReferencePath(package, path, start, kind) over the rows a write adds to TextReference';

COMMENT ON FUNCTION "qti"."__judge_text_reference_scope_in_text_reference_path_g3kb45f2uz"() IS 'the rule judge''s block of rule TextReference(package, path, start, kind) where Logic.eq(scope, "entry") in TextReferencePath(package, path, start, kind) over the rows a write removes from TextReferencePath';

COMMENT ON FUNCTION "qti"."__judge_text_reference_path_in_text_reference_6iyxmkief6"() IS 'the rule judge''s block of rule TextReferencePath(package, path, start, kind) in TextReference(package, path, start, kind) where Logic.eq(scope, "entry") over the rows a write removes from TextReference';

COMMENT ON FUNCTION "qti"."__judge_text_reference_path_in_text_reference_7k7swwgynq"() IS 'the rule judge''s block of rule TextReferencePath(package, path, start, kind) in TextReference(package, path, start, kind) where Logic.eq(scope, "entry") over the rows a write adds to TextReferencePath';

COMMENT ON FUNCTION "qti"."__judge_tolerance_in_attribute_zbufixqgxp"() IS 'the rule judge''s block of rule Tolerance(package, path, start) in Attribute(package, path, start) where Logic.eq(kind, "qti-equal") and Logic.eq(name, "tolerance") over the rows a write removes from Attribute';

COMMENT ON FUNCTION "qti"."__judge_tolerance_in_attribute_duyccra5c5"() IS 'the rule judge''s block of rule Tolerance(package, path, start) in Attribute(package, path, start) where Logic.eq(kind, "qti-equal") and Logic.eq(name, "tolerance") over the rows a write adds to Tolerance';

COMMENT ON FUNCTION "qti"."__judge_typed_path_in_resource_document_k5nhgvc4ub"() IS 'the rule judge''s block of rule TypedPath(package, target, type) where Logic.in(type, ["imsqti_fragment_xmlv3p0", "imsqti_item_xmlv3p0", "imsqti_outcomes_xmlv3p0", "imsqti_resprocessing_xmlv3p0", "imsqti_rptemplate_xmlv3p0", "imsqti_section_xmlv3p0", "imsqti_stimulus_xmlv3p0", "imsqti_test_xmlv3p0", "qtiusagedata/xml", "resourcemetadata/xml"]) in ResourceDocument(package, path, type) over its units';

COMMENT ON FUNCTION "qti"."__judge_unassembled_reference_in_catalog_id_qlplza6aff"() IS 'the rule judge''s block of rule UnassembledReference(package, path, tokenDigest) in CatalogId(package, path, idDigest) over its units';

COMMENT ON FUNCTION "qti"."__judge_untargeted_item_ref_in_unread_type_href_7b4c53lcjo"() IS 'the rule judge''s block of rule UntargetedItemRef(package, target) in UnreadTypeHref(package, target) over its units';

COMMENT ON FUNCTION "qti"."__judge_usage_value_in_usage_base_type_nwm76d7aw5"() IS 'the rule judge''s block of rule UsageValue(package, path, start, baseTypeLexical) in UsageBaseType(package, path, start, value) over its units';

COMMENT ON FUNCTION "qti"."__judge_usage_value_base_type_lexical_in_usage_value_rvhbvv7ozx"() IS 'the rule judge''s block of rule UsageValue(package, path, start, baseTypeLexicalDigest) where Logic.in(baseTypeLexical, ["boolean", "directedPair", "duration", "file", "float", "identifier", "integer", "pair", "point", "string", "uri"]) in UsageValueBaseType(package, path, start, baseTypeLexicalDigest) over the rows a write adds to UsageValue';

COMMENT ON FUNCTION "qti"."__judge_usage_value_base_type_lexical_in_usage_value_en4myfmbls"() IS 'the rule judge''s block of rule UsageValue(package, path, start, baseTypeLexicalDigest) where Logic.in(baseTypeLexical, ["boolean", "directedPair", "duration", "file", "float", "identifier", "integer", "pair", "point", "string", "uri"]) in UsageValueBaseType(package, path, start, baseTypeLexicalDigest) over the rows a write removes from UsageValueBaseType';

COMMENT ON FUNCTION "qti"."__judge_usage_value_base_type_in_usage_value_bspiumxxhx"() IS 'the rule judge''s block of rule UsageValueBaseType(package, path, start, baseTypeLexicalDigest) in UsageValue(package, path, start, baseTypeLexicalDigest) where Logic.in(baseTypeLexical, ["boolean", "directedPair", "duration", "file", "float", "identifier", "integer", "pair", "point", "string", "uri"]) over the rows a write removes from UsageValue';

COMMENT ON FUNCTION "qti"."__judge_usage_value_base_type_in_usage_value_gz7b6ecdmn"() IS 'the rule judge''s block of rule UsageValueBaseType(package, path, start, baseTypeLexicalDigest) in UsageValue(package, path, start, baseTypeLexicalDigest) where Logic.in(baseTypeLexical, ["boolean", "directedPair", "duration", "file", "float", "identifier", "integer", "pair", "point", "string", "uri"]) over the rows a write adds to UsageValueBaseType';

COMMENT ON FUNCTION "qti"."__judge_variable_ref_node_in_expression_2jiipu6mjc"() IS 'the rule judge''s block of rule VariableRefNode(package, path, start, language) where Logic.in(kind, ["qti-and", "qti-any-n", "qti-base-value", "qti-container-size", "qti-contains", "qti-correct", "qti-custom-operator", "qti-default", "qti-delete", "qti-divide", "qti-duration-gte", "qti-duration-lt", "qti-equal", "qti-equal-rounded", "qti-field-value", "qti-gcd", "qti-gt", "qti-gte", "qti-index", "qti-inside", "qti-integer-divide", "qti-integer-modulus", "qti-integer-to-float", "qti-is-null", "qti-lcm", "qti-lt", "qti-lte", "qti-map-response", "qti-map-response-point", "qti-match", "qti-math-constant", "qti-math-operator", "qti-max", "qti-member", "qti-min", "qti-multiple", "qti-not", "qti-null", "qti-number-correct", "qti-number-incorrect", "qti-number-presented", "qti-number-responded", "qti-number-selected", "qti-or", "qti-ordered", "qti-outcome-maximum", "qti-outcome-minimum", "qti-pattern-match", "qti-power", "qti-product", "qti-random", "qti-random-float", "qti-random-integer", "qti-repeat", "qti-round", "qti-round-to", "qti-stats-operator", "qti-string-match", "qti-substring", "qti-subtract", "qti-sum", "qti-test-variables", "qti-truncate", "qti-variable"]) in Expression(package, path, start, language) over its units';

COMMENT ON FUNCTION "qti"."__judge_variable_ref_node_in_processing_3423tnwmxm"() IS 'the rule judge''s block of rule VariableRefNode(package, path, start, language) where Logic.in(kind, ["qti-exit-response", "qti-exit-template", "qti-exit-test", "qti-lookup-outcome-value", "qti-outcome-condition", "qti-outcome-else", "qti-outcome-else-if", "qti-outcome-if", "qti-outcome-processing", "qti-outcome-processing-fragment", "qti-response-condition", "qti-response-else", "qti-response-else-if", "qti-response-if", "qti-response-processing", "qti-response-processing-fragment", "qti-set-correct-response", "qti-set-default-value", "qti-set-outcome-value", "qti-set-template-value", "qti-template-condition", "qti-template-constraint", "qti-template-else", "qti-template-else-if", "qti-template-if", "qti-template-processing"]) in Processing(package, path, start, language) over its units';

COMMENT ON FUNCTION "qti"."__judge_weighted_variable_in_expression_x6bof2cubn"() IS 'the rule judge''s block of rule WeightedVariable(package, path, start) in Expression(package, path, start) where Logic.eq(language, "outcome") over its units';

COMMENT ON FUNCTION "qti"."__judge_anchored_id_key_package_assembly_anchor_id_sajj6icsyx"() IS 'the rule judge''s block of rule key AnchoredId(package, assembly, anchor, idDigest) over its units';

COMMENT ON FUNCTION "qti"."__judge_anchored_name_key_package_assembly_anchor_tal6uxdc7z"() IS 'the rule judge''s block of rule key AnchoredName(package, assembly, anchor, identifier) over its units';

COMMENT ON FUNCTION "qti"."__judge_assembled_name_key_package_assembly_by3dc6a57l"() IS 'the rule judge''s block of rule key AssembledName(package, assembly, identifier) over its units';

COMMENT ON FUNCTION "qti"."__judge_choice_space_name_key_package_path_5lmdv7iyyw"() IS 'the rule judge''s block of rule key ChoiceSpaceName(package, path, identifier) over its units';

COMMENT ON FUNCTION "qti"."__judge_copied_id_key_package_assembly_id_digest_p5fw4qldl3"() IS 'the rule judge''s block of rule key CopiedId(package, assembly, idDigest) over its units';

COMMENT ON FUNCTION "qti"."__judge_filtered_section_key_package_assembly_path_4z3biulu5b"() IS 'the rule judge''s block of rule key FilteredSection(package, assembly, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_id_binding_key_package_path_id_6fw6vseb5g"() IS 'the rule judge''s block of rule key IdBinding(package, path, id) over its units';

COMMENT ON FUNCTION "qti"."__judge_known_operand_base_key_package_assembly_yo6y5urhog"() IS 'the rule judge''s block of rule key KnownOperandBase(package, assembly, instance, path, operator) over its units';

COMMENT ON FUNCTION "qti"."__judge_known_operand_cardinality_key_package_ycqdhnwznv"() IS 'the rule judge''s block of rule key KnownOperandCardinality(package, assembly, instance, path, operator) over its units';

COMMENT ON FUNCTION "qti"."__judge_most_one_argument_key_package_path_apply_xd5ep2crxk"() IS 'the rule judge''s block of rule key MostOneArgument(package, path, apply) over its units';

COMMENT ON FUNCTION "qti"."__judge_most_two_argument_pair_key_package_path_fqelb3fkv6"() IS 'the rule judge''s block of rule key MostTwoArgumentPair(package, path, apply) over its units';

COMMENT ON FUNCTION "qti"."__judge_named_declaration_key_package_path_yf4gp6tz5k"() IS 'the rule judge''s block of rule key NamedDeclaration(package, path, identifier) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_choice_space_name_key_package_wbw7msoi6e"() IS 'the rule judge''s block of rule key PlacedChoiceSpaceName(package, assembly, identifier) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_single_response_gap_key_package_5ednbmrl4c"() IS 'the rule judge''s block of rule key PlacedSingleResponseGap(package, assembly, instance, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_set_field_name_key_package_path_set_fcflnc3ssu"() IS 'the rule judge''s block of rule key SetFieldName(package, path, set, identifier) over its units';

COMMENT ON FUNCTION "qti"."__judge_single_response_gap_key_package_path_start_sifun2dm3r"() IS 'the rule judge''s block of rule key SingleResponseGap(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_test_reading_key_package_assembly_path_start_n33nn3cpov"() IS 'the rule judge''s block of rule key TestReading(package, assembly, path, start, attribute) over its units';

COMMENT ON FUNCTION "qti"."__judge_trimmed_mark_key_package_path_fragment_value_t7jxdfhmxy"() IS 'the rule judge''s block of rule key TrimmedMark(package, path, fragment, value) over its units';

COMMENT ON FUNCTION "qti"."__judge_assembled_document_n5cmjplr5w"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of AssembledDocument and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_assembled_document_4u6x2mwpnm"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of AssembledDocument and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_binding_name_gemsksmiq7"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of BindingName and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_candidate_path_6psahny56j"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of CandidatePath and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_candidate_path_am2d75nch3"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of CandidatePath and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_cn_attribute_sbgxds2pat"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of CnAttribute and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_cn_attribute_hp7mafegkn"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of CnAttribute and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_cn_count_36f3w437ok"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of CnCount and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_comment_trfw3pfsui"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Comment and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_comment_buwejyelbw"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Comment and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_data_ssml_6gszispnmq"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of DataSsml and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_data_ssml_nwrnj3vksd"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of DataSsml and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_data_ssml_member_wamg5k5f5q"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of DataSsmlMember and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_doctype_o3ckpdftex"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Doctype and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_doctype_hrsgiwq7zp"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Doctype and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_element_type_clxdpe7f4u"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of ElementType and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_entry_o6nexgoa6n"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Entry and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_file_bfqdpdagia"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of File and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_file_outside_r27ookop5f"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of FileOutside and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_file_path_m55e3dz3zb"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of FilePath and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_fragment_scope_rahqr2afgn"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of FragmentScope and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_identity_text_edtg3qnnen"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of IdentityText and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_inclusion_g7lfw4jzbs"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Inclusion and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_label_use_ptej2oklny"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of LabelUse and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_label_use_cfjrl77akc"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of LabelUse and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_math_cn_4aujddi7fl"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of MathCn and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_media_k7nuqbh2qv"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Media and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_media_y34gnxkhjp"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Media and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_open_attribute_gzw76ltxgv"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of OpenAttribute and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_open_element_name_rwryoianel"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of OpenElementName and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_pci_module_form_756anblqje"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of PciModuleForm and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_pci_module_form_pgh72d3ug6"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of PciModuleForm and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_pi_rfv5w2guki"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Pi and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_pi_ztggxw3qd5"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Pi and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_reference_xh3cst2bxr"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Reference and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_resource_href_lwllourm5u"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of ResourceHref and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_resource_href_outside_puyn3bghgt"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of ResourceHrefOutside and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_rounding_figures_ejzeve7kkr"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of RoundingFigures and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_rounding_figures_apuhzaslid"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of RoundingFigures and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_rounding_mode_figures_zxt2jfduhv"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of RoundingModeFigures and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_share_target_bm5dyz6buk"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of ShareTarget and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_site_path_g7o4ekld2u"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of SitePath and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_srcset_xykb3yckmz"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Srcset and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_srcset_candidate_lsg5oflsio"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of SrcsetCandidate and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_srcset_candidate_5kuns5ivoz"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of SrcsetCandidate and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_stimulus_ref_v26y2brjed"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of StimulusRef and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_text_reference_ayzonoljhk"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of TextReference and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_text_reference_path_ajucpwxch4"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of TextReferencePath and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_text_reference_path_irf73jwdgt"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of TextReferencePath and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_tolerance_qrfzm6r5dn"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Tolerance and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_usage_value_aopaid42o2"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of UsageValue and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_usage_value_base_type_irq5krczu4"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of UsageValueBaseType and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_usage_value_base_type_wuuyvbajaw"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of UsageValueBaseType and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__upkeep_assembled_catalog_adoubyawsw"() IS 'the rule judge''s upkeep of stored relation AssembledCatalog';

COMMENT ON FUNCTION "qti"."__judge_catalog_id_75t4kfupri"("pg_catalog"."text"[]) IS 'the upkeep of the stored relations over the deltas of CatalogId and the relations they read beside it';

COMMENT ON FUNCTION "qti"."__upkeep_catalog_id_mg7yelk5qj"() IS 'the rule judge''s upkeep of stored relation CatalogId';

COMMENT ON FUNCTION "qti"."__upkeep_cell_table_znmpup4j4g"() IS 'the rule judge''s upkeep of stored relation CellTable';

COMMENT ON FUNCTION "qti"."__judge_node_xrm2v54h3k"("pg_catalog"."text"[]) IS 'the upkeep of the stored relations over the deltas of Node and the relations they read beside it';

COMMENT ON FUNCTION "qti"."__upkeep_header_token_xgrioqwbze"() IS 'the rule judge''s upkeep of stored relation HeaderToken';

COMMENT ON FUNCTION "qti"."__upkeep_lookup_value_ymqqobvkod"() IS 'the rule judge''s upkeep of stored relation LookupValue';

COMMENT ON FUNCTION "qti"."__upkeep_map_key_hrxugqwdhq"() IS 'the rule judge''s upkeep of stored relation MapKey';

COMMENT ON FUNCTION "qti"."__judge_attribute_his7hbatxm"("pg_catalog"."text"[]) IS 'the upkeep of the stored relations over the deltas of Attribute and the relations they read beside it';

COMMENT ON FUNCTION "qti"."__upkeep_table_header_r3jscew7xb"() IS 'the rule judge''s upkeep of stored relation TableHeader';

COMMENT ON FUNCTION "qti"."__judge_attribute_k4q4rmedh5"("pg_catalog"."text"[]) IS 'the upkeep of the stored relations over the deltas of Attribute and the relations they read beside it';

COMMENT ON FUNCTION "qti"."__capture_assembled_catalog_3z2sfh4yla"() IS 'rule capture of AssembledCatalog';

COMMENT ON FUNCTION "qti"."__capture_assembled_document_kywec7er73"() IS 'rule capture of AssembledDocument';

COMMENT ON FUNCTION "qti"."__capture_attribute_itmluum5pt"() IS 'rule capture of Attribute';

COMMENT ON FUNCTION "qti"."__capture_binding_name_wylitlhovp"() IS 'rule capture of BindingName';

COMMENT ON FUNCTION "qti"."__capture_bound_variable_zkpqqr76nb"() IS 'rule capture of BoundVariable';

COMMENT ON FUNCTION "qti"."__capture_candidate_path_wlkrzbwvw3"() IS 'rule capture of CandidatePath';

COMMENT ON FUNCTION "qti"."__capture_catalog_id_jfqixfjyar"() IS 'rule capture of CatalogId';

COMMENT ON FUNCTION "qti"."__capture_catalog_scope_vqhsmtulbo"() IS 'rule capture of CatalogScope';

COMMENT ON FUNCTION "qti"."__capture_cell_leaf_tpy2oa357u"() IS 'rule capture of CellLeaf';

COMMENT ON FUNCTION "qti"."__capture_cell_table_irc3pkoo53"() IS 'rule capture of CellTable';

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

COMMENT ON FUNCTION "qti"."__capture_file_outside_3e7wcs37xq"() IS 'rule capture of FileOutside';

COMMENT ON FUNCTION "qti"."__capture_file_path_fjyfymzkgk"() IS 'rule capture of FilePath';

COMMENT ON FUNCTION "qti"."__capture_fragment_context_ref_nuuhlshmzu"() IS 'rule capture of FragmentContextRef';

COMMENT ON FUNCTION "qti"."__capture_fragment_feedback_ref_imuuftmewc"() IS 'rule capture of FragmentFeedbackRef';

COMMENT ON FUNCTION "qti"."__capture_fragment_printed_ref_uennexi5y2"() IS 'rule capture of FragmentPrintedRef';

COMMENT ON FUNCTION "qti"."__capture_fragment_scope_iknfqtw5zm"() IS 'rule capture of FragmentScope';

COMMENT ON FUNCTION "qti"."__capture_fragment_template_ref_4a55ciye7u"() IS 'rule capture of FragmentTemplateRef';

COMMENT ON FUNCTION "qti"."__capture_hottext_lhjwhvzr4d"() IS 'rule capture of Hottext';

COMMENT ON FUNCTION "qti"."__capture_identity_text_h5x3ut4jpk"() IS 'rule capture of IdentityText';

COMMENT ON FUNCTION "qti"."__capture_idref_4rhkrmfh4c"() IS 'rule capture of Idref';

COMMENT ON FUNCTION "qti"."__capture_idref_target_svtn77efc5"() IS 'rule capture of IdrefTarget';

COMMENT ON FUNCTION "qti"."__capture_inclusion_56gcj75lja"() IS 'rule capture of Inclusion';

COMMENT ON FUNCTION "qti"."__capture_instance_ts6ly2zo5e"() IS 'rule capture of Instance';

COMMENT ON FUNCTION "qti"."__capture_interaction_74aiefebxt"() IS 'rule capture of Interaction';

COMMENT ON FUNCTION "qti"."__capture_interaction_attribute_wquigysxiz"() IS 'rule capture of InteractionAttribute';

COMMENT ON FUNCTION "qti"."__capture_item_ref_document_rlun34ysrf"() IS 'rule capture of ItemRefDocument';

COMMENT ON FUNCTION "qti"."__capture_item_ref_href_njxj66f6sv"() IS 'rule capture of ItemRefHref';

COMMENT ON FUNCTION "qti"."__capture_label_use_zaf4tt25o3"() IS 'rule capture of LabelUse';

COMMENT ON FUNCTION "qti"."__capture_least_count_aijvroibqn"() IS 'rule capture of LeastCount';

COMMENT ON FUNCTION "qti"."__capture_link_reading_pp235xpir4"() IS 'rule capture of LinkReading';

COMMENT ON FUNCTION "qti"."__capture_literal_cmqvxvs66l"() IS 'rule capture of Literal';

COMMENT ON FUNCTION "qti"."__capture_literal_typed_cv5kr7fm7e"() IS 'rule capture of LiteralTyped';

COMMENT ON FUNCTION "qti"."__capture_lookup_value_f3rrvlw7j7"() IS 'rule capture of LookupValue';

COMMENT ON FUNCTION "qti"."__capture_map_key_gtfuz4lzxt"() IS 'rule capture of MapKey';

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

COMMENT ON FUNCTION "qti"."__capture_numbered_reading_vbr7y4n7ey"() IS 'rule capture of NumberedReading';

COMMENT ON FUNCTION "qti"."__capture_open_attribute_zpjedimx7c"() IS 'rule capture of OpenAttribute';

COMMENT ON FUNCTION "qti"."__capture_open_element_name_oaq7r3tjeo"() IS 'rule capture of OpenElementName';

COMMENT ON FUNCTION "qti"."__capture_open_element_type_pdlvcktpcb"() IS 'rule capture of OpenElementType';

COMMENT ON FUNCTION "qti"."__capture_pci_module_form_rbpjgm5ck4"() IS 'rule capture of PciModuleForm';

COMMENT ON FUNCTION "qti"."__capture_pi_crqtap7l2j"() IS 'rule capture of Pi';

COMMENT ON FUNCTION "qti"."__capture_placed_binding_g6nwtylt4r"() IS 'rule capture of PlacedBinding';

COMMENT ON FUNCTION "qti"."__capture_placed_choice_ofja2rvius"() IS 'rule capture of PlacedChoice';

COMMENT ON FUNCTION "qti"."__capture_placed_expression_aicufbicvo"() IS 'rule capture of PlacedExpression';

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

COMMENT ON FUNCTION "qti"."__capture_resource_href_outside_sflje2hh5z"() IS 'rule capture of ResourceHrefOutside';

COMMENT ON FUNCTION "qti"."__capture_resource_href_path_hikvay3rfe"() IS 'rule capture of ResourceHrefPath';

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

COMMENT ON FUNCTION "qti"."__capture_template_ref_dre62in37w"() IS 'rule capture of TemplateRef';

COMMENT ON FUNCTION "qti"."__capture_text_reference_4wyk6zxgqf"() IS 'rule capture of TextReference';

COMMENT ON FUNCTION "qti"."__capture_text_reference_path_znomqpm3dr"() IS 'rule capture of TextReferencePath';

COMMENT ON FUNCTION "qti"."__capture_tolerance_sfo7irkllw"() IS 'rule capture of Tolerance';

COMMENT ON FUNCTION "qti"."__capture_usage_value_d4x3vydjzt"() IS 'rule capture of UsageValue';

COMMENT ON FUNCTION "qti"."__capture_usage_value_base_type_a6p2zwmowi"() IS 'rule capture of UsageValueBaseType';

COMMENT ON FUNCTION "qti"."__capture_variable_ref_lckeobxqnf"() IS 'rule capture of VariableRef';

COMMENT ON FUNCTION "qti"."__stand_assembled_catalog_555anehjhj"() IS 'the stand-up of the rule judge''s session tables a write of AssembledCatalog needs';

COMMENT ON FUNCTION "qti"."__stand_assembled_document_hwwdv6cnpm"() IS 'the stand-up of the rule judge''s session tables a write of AssembledDocument needs';

COMMENT ON FUNCTION "qti"."__stand_attribute_ibvutlmrai"() IS 'the stand-up of the rule judge''s session tables a write of Attribute needs';

COMMENT ON FUNCTION "qti"."__stand_binding_name_ye63gc6vro"() IS 'the stand-up of the rule judge''s session tables a write of BindingName needs';

COMMENT ON FUNCTION "qti"."__stand_bound_variable_7vtgjbh6hv"() IS 'the stand-up of the rule judge''s session tables a write of BoundVariable needs';

COMMENT ON FUNCTION "qti"."__stand_candidate_path_qhg7xli4wt"() IS 'the stand-up of the rule judge''s session tables a write of CandidatePath needs';

COMMENT ON FUNCTION "qti"."__stand_catalog_id_zitsqacyrp"() IS 'the stand-up of the rule judge''s session tables a write of CatalogId needs';

COMMENT ON FUNCTION "qti"."__stand_catalog_scope_vudqbkxslz"() IS 'the stand-up of the rule judge''s session tables a write of CatalogScope needs';

COMMENT ON FUNCTION "qti"."__stand_cell_leaf_ptjwgogbl7"() IS 'the stand-up of the rule judge''s session tables a write of CellLeaf needs';

COMMENT ON FUNCTION "qti"."__stand_cell_table_4vz4z33ng6"() IS 'the stand-up of the rule judge''s session tables a write of CellTable needs';

COMMENT ON FUNCTION "qti"."__stand_choice_xzzdvjuvsd"() IS 'the stand-up of the rule judge''s session tables a write of Choice needs';

COMMENT ON FUNCTION "qti"."__stand_choice_interaction_c645kfugmv"() IS 'the stand-up of the rule judge''s session tables a write of ChoiceInteraction needs';

COMMENT ON FUNCTION "qti"."__stand_cn_attribute_63nfyqksr3"() IS 'the stand-up of the rule judge''s session tables a write of CnAttribute needs';

COMMENT ON FUNCTION "qti"."__stand_cn_count_eejhcf4izw"() IS 'the stand-up of the rule judge''s session tables a write of CnCount needs';

COMMENT ON FUNCTION "qti"."__stand_comment_3l7okcxyxf"() IS 'the stand-up of the rule judge''s session tables a write of Comment needs';

COMMENT ON FUNCTION "qti"."__stand_context_ref_ujo5dooa7f"() IS 'the stand-up of the rule judge''s session tables a write of ContextRef needs';

COMMENT ON FUNCTION "qti"."__stand_count_bound_2z6orlcix6"() IS 'the stand-up of the rule judge''s session tables a write of CountBound needs';

COMMENT ON FUNCTION "qti"."__stand_data_ssml_k52kzmf2vn"() IS 'the stand-up of the rule judge''s session tables a write of DataSsml needs';

COMMENT ON FUNCTION "qti"."__stand_data_ssml_member_2xkysqbugo"() IS 'the stand-up of the rule judge''s session tables a write of DataSsmlMember needs';

COMMENT ON FUNCTION "qti"."__stand_data_ssml_property_6yi5in6iis"() IS 'the stand-up of the rule judge''s session tables a write of DataSsmlProperty needs';

COMMENT ON FUNCTION "qti"."__stand_doctype_gj2wct2uyg"() IS 'the stand-up of the rule judge''s session tables a write of Doctype needs';

COMMENT ON FUNCTION "qti"."__stand_document_pondgr3rqo"() IS 'the stand-up of the rule judge''s session tables a write of Document needs';

COMMENT ON FUNCTION "qti"."__stand_document_id_633p5hpydz"() IS 'the stand-up of the rule judge''s session tables a write of DocumentId needs';

COMMENT ON FUNCTION "qti"."__stand_element_type_7tgopoucgl"() IS 'the stand-up of the rule judge''s session tables a write of ElementType needs';

COMMENT ON FUNCTION "qti"."__stand_entry_pmmpk3imf3"() IS 'the stand-up of the rule judge''s session tables a write of Entry needs';

COMMENT ON FUNCTION "qti"."__stand_expression_u7lcjyvsn7"() IS 'the stand-up of the rule judge''s session tables a write of Expression needs';

COMMENT ON FUNCTION "qti"."__stand_feedback_ref_d7224uniti"() IS 'the stand-up of the rule judge''s session tables a write of FeedbackRef needs';

COMMENT ON FUNCTION "qti"."__stand_file_tcw2ukyhyi"() IS 'the stand-up of the rule judge''s session tables a write of File needs';

COMMENT ON FUNCTION "qti"."__stand_file_outside_lhyrdnu5ai"() IS 'the stand-up of the rule judge''s session tables a write of FileOutside needs';

COMMENT ON FUNCTION "qti"."__stand_file_path_7r6oexjmsr"() IS 'the stand-up of the rule judge''s session tables a write of FilePath needs';

COMMENT ON FUNCTION "qti"."__stand_fragment_context_ref_h4natgpneo"() IS 'the stand-up of the rule judge''s session tables a write of FragmentContextRef needs';

COMMENT ON FUNCTION "qti"."__stand_fragment_feedback_ref_gojudisgmf"() IS 'the stand-up of the rule judge''s session tables a write of FragmentFeedbackRef needs';

COMMENT ON FUNCTION "qti"."__stand_fragment_printed_ref_g5dbleutzc"() IS 'the stand-up of the rule judge''s session tables a write of FragmentPrintedRef needs';

COMMENT ON FUNCTION "qti"."__stand_fragment_scope_2oggx422cm"() IS 'the stand-up of the rule judge''s session tables a write of FragmentScope needs';

COMMENT ON FUNCTION "qti"."__stand_fragment_template_ref_mqrpgto2fj"() IS 'the stand-up of the rule judge''s session tables a write of FragmentTemplateRef needs';

COMMENT ON FUNCTION "qti"."__stand_hottext_apulsizq3w"() IS 'the stand-up of the rule judge''s session tables a write of Hottext needs';

COMMENT ON FUNCTION "qti"."__stand_identity_text_b52n3op6xe"() IS 'the stand-up of the rule judge''s session tables a write of IdentityText needs';

COMMENT ON FUNCTION "qti"."__stand_idref_aho5h2elqy"() IS 'the stand-up of the rule judge''s session tables a write of Idref needs';

COMMENT ON FUNCTION "qti"."__stand_idref_target_jjhutks3nm"() IS 'the stand-up of the rule judge''s session tables a write of IdrefTarget needs';

COMMENT ON FUNCTION "qti"."__stand_inclusion_km3rxqqunr"() IS 'the stand-up of the rule judge''s session tables a write of Inclusion needs';

COMMENT ON FUNCTION "qti"."__stand_instance_fxskpasuzx"() IS 'the stand-up of the rule judge''s session tables a write of Instance needs';

COMMENT ON FUNCTION "qti"."__stand_interaction_3potcpsocf"() IS 'the stand-up of the rule judge''s session tables a write of Interaction needs';

COMMENT ON FUNCTION "qti"."__stand_interaction_attribute_wmzckdz5tm"() IS 'the stand-up of the rule judge''s session tables a write of InteractionAttribute needs';

COMMENT ON FUNCTION "qti"."__stand_item_ref_document_i66s3vh6ga"() IS 'the stand-up of the rule judge''s session tables a write of ItemRefDocument needs';

COMMENT ON FUNCTION "qti"."__stand_item_ref_href_jrjueitx27"() IS 'the stand-up of the rule judge''s session tables a write of ItemRefHref needs';

COMMENT ON FUNCTION "qti"."__stand_label_use_o4brmrb7aq"() IS 'the stand-up of the rule judge''s session tables a write of LabelUse needs';

COMMENT ON FUNCTION "qti"."__stand_least_count_ya6wrr6a3v"() IS 'the stand-up of the rule judge''s session tables a write of LeastCount needs';

COMMENT ON FUNCTION "qti"."__stand_link_reading_uenjcz5dvs"() IS 'the stand-up of the rule judge''s session tables a write of LinkReading needs';

COMMENT ON FUNCTION "qti"."__stand_literal_tiziliumbt"() IS 'the stand-up of the rule judge''s session tables a write of Literal needs';

COMMENT ON FUNCTION "qti"."__stand_literal_typed_2ilx4mlegz"() IS 'the stand-up of the rule judge''s session tables a write of LiteralTyped needs';

COMMENT ON FUNCTION "qti"."__stand_lookup_value_hx7624x4iw"() IS 'the stand-up of the rule judge''s session tables a write of LookupValue needs';

COMMENT ON FUNCTION "qti"."__stand_map_key_4gd3dvrew7"() IS 'the stand-up of the rule judge''s session tables a write of MapKey needs';

COMMENT ON FUNCTION "qti"."__stand_math_action_f5wwzdrvm5"() IS 'the stand-up of the rule judge''s session tables a write of MathAction needs';

COMMENT ON FUNCTION "qti"."__stand_math_align_group_6xltg6lxo2"() IS 'the stand-up of the rule judge''s session tables a write of MathAlignGroup needs';

COMMENT ON FUNCTION "qti"."__stand_math_align_scope_u2bech2ml5"() IS 'the stand-up of the rule judge''s session tables a write of MathAlignScope needs';

COMMENT ON FUNCTION "qti"."__stand_math_cell_7pwv53nkxm"() IS 'the stand-up of the rule judge''s session tables a write of MathCell needs';

COMMENT ON FUNCTION "qti"."__stand_math_cn_d6ecu3zp5g"() IS 'the stand-up of the rule judge''s session tables a write of MathCn needs';

COMMENT ON FUNCTION "qti"."__stand_math_rank_nqeqnb4u7t"() IS 'the stand-up of the rule judge''s session tables a write of MathRank needs';

COMMENT ON FUNCTION "qti"."__stand_media_5bf42f2xah"() IS 'the stand-up of the rule judge''s session tables a write of Media needs';

COMMENT ON FUNCTION "qti"."__stand_most_count_2kgjd3owwn"() IS 'the stand-up of the rule judge''s session tables a write of MostCount needs';

COMMENT ON FUNCTION "qti"."__stand_named_rt75iqktd4"() IS 'the stand-up of the rule judge''s session tables a write of Named needs';

COMMENT ON FUNCTION "qti"."__stand_node_ufvsoeyzmq"() IS 'the stand-up of the rule judge''s session tables a write of Node needs';

COMMENT ON FUNCTION "qti"."__stand_numbered_reading_em4eroit7v"() IS 'the stand-up of the rule judge''s session tables a write of NumberedReading needs';

COMMENT ON FUNCTION "qti"."__stand_open_attribute_kus4ehgwz4"() IS 'the stand-up of the rule judge''s session tables a write of OpenAttribute needs';

COMMENT ON FUNCTION "qti"."__stand_open_element_name_yc423a5h3x"() IS 'the stand-up of the rule judge''s session tables a write of OpenElementName needs';

COMMENT ON FUNCTION "qti"."__stand_open_element_type_ntz3lqtaqc"() IS 'the stand-up of the rule judge''s session tables a write of OpenElementType needs';

COMMENT ON FUNCTION "qti"."__stand_pci_module_form_yzlgznmelb"() IS 'the stand-up of the rule judge''s session tables a write of PciModuleForm needs';

COMMENT ON FUNCTION "qti"."__stand_pi_xg74jk6xwy"() IS 'the stand-up of the rule judge''s session tables a write of Pi needs';

COMMENT ON FUNCTION "qti"."__stand_placed_binding_rbegxbfbcg"() IS 'the stand-up of the rule judge''s session tables a write of PlacedBinding needs';

COMMENT ON FUNCTION "qti"."__stand_placed_choice_54ymy46b3e"() IS 'the stand-up of the rule judge''s session tables a write of PlacedChoice needs';

COMMENT ON FUNCTION "qti"."__stand_placed_expression_eajdtujnrh"() IS 'the stand-up of the rule judge''s session tables a write of PlacedExpression needs';

COMMENT ON FUNCTION "qti"."__stand_placed_hottext_donabbhxss"() IS 'the stand-up of the rule judge''s session tables a write of PlacedHottext needs';

COMMENT ON FUNCTION "qti"."__stand_placed_id_kbkipg3veh"() IS 'the stand-up of the rule judge''s session tables a write of PlacedId needs';

COMMENT ON FUNCTION "qti"."__stand_placed_idref_64inmhwtyc"() IS 'the stand-up of the rule judge''s session tables a write of PlacedIdref needs';

COMMENT ON FUNCTION "qti"."__stand_placed_math_rank_5572svkpcq"() IS 'the stand-up of the rule judge''s session tables a write of PlacedMathRank needs';

COMMENT ON FUNCTION "qti"."__stand_placed_share_target_bt6g4coqwv"() IS 'the stand-up of the rule judge''s session tables a write of PlacedShareTarget needs';

COMMENT ON FUNCTION "qti"."__stand_placed_variable_ref_m4ro6tg5kc"() IS 'the stand-up of the rule judge''s session tables a write of PlacedVariableRef needs';

COMMENT ON FUNCTION "qti"."__stand_printed_variable_ref_e7jd2rdh3z"() IS 'the stand-up of the rule judge''s session tables a write of PrintedVariableRef needs';

COMMENT ON FUNCTION "qti"."__stand_processing_fc2mn4yln3"() IS 'the stand-up of the rule judge''s session tables a write of Processing needs';

COMMENT ON FUNCTION "qti"."__stand_reference_5zvivb5s2f"() IS 'the stand-up of the rule judge''s session tables a write of Reference needs';

COMMENT ON FUNCTION "qti"."__stand_reference_path_wo5g5edty7"() IS 'the stand-up of the rule judge''s session tables a write of ReferencePath needs';

COMMENT ON FUNCTION "qti"."__stand_resource_document_j6gjtwm5zs"() IS 'the stand-up of the rule judge''s session tables a write of ResourceDocument needs';

COMMENT ON FUNCTION "qti"."__stand_resource_href_m3jxi2ub6r"() IS 'the stand-up of the rule judge''s session tables a write of ResourceHref needs';

COMMENT ON FUNCTION "qti"."__stand_resource_href_outside_h5ayb4ywy5"() IS 'the stand-up of the rule judge''s session tables a write of ResourceHrefOutside needs';

COMMENT ON FUNCTION "qti"."__stand_resource_href_path_cetda5wlcb"() IS 'the stand-up of the rule judge''s session tables a write of ResourceHrefPath needs';

COMMENT ON FUNCTION "qti"."__stand_rounding_c2ifmdme7j"() IS 'the stand-up of the rule judge''s session tables a write of Rounding needs';

COMMENT ON FUNCTION "qti"."__stand_rounding_figures_lqklyjsczn"() IS 'the stand-up of the rule judge''s session tables a write of RoundingFigures needs';

COMMENT ON FUNCTION "qti"."__stand_rounding_mode_figures_xtki3xbmlh"() IS 'the stand-up of the rule judge''s session tables a write of RoundingModeFigures needs';

COMMENT ON FUNCTION "qti"."__stand_share_fragment_vlshgysorq"() IS 'the stand-up of the rule judge''s session tables a write of ShareFragment needs';

COMMENT ON FUNCTION "qti"."__stand_share_target_uodbsrbtr7"() IS 'the stand-up of the rule judge''s session tables a write of ShareTarget needs';

COMMENT ON FUNCTION "qti"."__stand_site_tjfl6cjoct"() IS 'the stand-up of the rule judge''s session tables a write of Site needs';

COMMENT ON FUNCTION "qti"."__stand_site_path_5texh73t5e"() IS 'the stand-up of the rule judge''s session tables a write of SitePath needs';

COMMENT ON FUNCTION "qti"."__stand_site_target_7dcfpspkwp"() IS 'the stand-up of the rule judge''s session tables a write of SiteTarget needs';

COMMENT ON FUNCTION "qti"."__stand_srcset_rftu4ffapo"() IS 'the stand-up of the rule judge''s session tables a write of Srcset needs';

COMMENT ON FUNCTION "qti"."__stand_srcset_candidate_rjuo7n5ahk"() IS 'the stand-up of the rule judge''s session tables a write of SrcsetCandidate needs';

COMMENT ON FUNCTION "qti"."__stand_ssml_scope_qlkcnlkody"() IS 'the stand-up of the rule judge''s session tables a write of SsmlScope needs';

COMMENT ON FUNCTION "qti"."__stand_stimulus_ref_3r7jqd3al5"() IS 'the stand-up of the rule judge''s session tables a write of StimulusRef needs';

COMMENT ON FUNCTION "qti"."__stand_template_ref_5rw7gnm6ga"() IS 'the stand-up of the rule judge''s session tables a write of TemplateRef needs';

COMMENT ON FUNCTION "qti"."__stand_text_reference_xbgifadnt4"() IS 'the stand-up of the rule judge''s session tables a write of TextReference needs';

COMMENT ON FUNCTION "qti"."__stand_text_reference_path_ijtliptx3w"() IS 'the stand-up of the rule judge''s session tables a write of TextReferencePath needs';

COMMENT ON FUNCTION "qti"."__stand_tolerance_j3naktmm3s"() IS 'the stand-up of the rule judge''s session tables a write of Tolerance needs';

COMMENT ON FUNCTION "qti"."__stand_usage_value_jbqmhc66yy"() IS 'the stand-up of the rule judge''s session tables a write of UsageValue needs';

COMMENT ON FUNCTION "qti"."__stand_usage_value_base_type_ss7bxv4pjb"() IS 'the stand-up of the rule judge''s session tables a write of UsageValueBaseType needs';

COMMENT ON FUNCTION "qti"."__stand_variable_ref_htgoqewgip"() IS 'the stand-up of the rule judge''s session tables a write of VariableRef needs';

COMMENT ON FUNCTION "qti"."__immutable_assembled_document_32zynp33dd"() IS 'immutability guard of AssembledDocument';

COMMENT ON FUNCTION "qti"."__immutable_attribute_6xb2pmx6fd"() IS 'immutability guard of Attribute';

COMMENT ON FUNCTION "qti"."__immutable_attribute_entity_ppzjeu4ah3"() IS 'immutability guard of AttributeEntity';

COMMENT ON FUNCTION "qti"."__immutable_binding_name_23k2pcie27"() IS 'immutability guard of BindingName';

COMMENT ON FUNCTION "qti"."__immutable_bound_variable_l5mva2wpev"() IS 'immutability guard of BoundVariable';

COMMENT ON FUNCTION "qti"."__immutable_candidate_path_flhwj3s6bd"() IS 'immutability guard of CandidatePath';

COMMENT ON FUNCTION "qti"."__immutable_catalog_scope_diphx2o4ow"() IS 'immutability guard of CatalogScope';

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

COMMENT ON FUNCTION "qti"."__immutable_file_outside_vd7dcywe7d"() IS 'immutability guard of FileOutside';

COMMENT ON FUNCTION "qti"."__immutable_file_path_m5zsirk5w5"() IS 'immutability guard of FilePath';

COMMENT ON FUNCTION "qti"."__immutable_fragment_context_name_4thlytcscd"() IS 'immutability guard of FragmentContextName';

COMMENT ON FUNCTION "qti"."__immutable_fragment_context_ref_dnxjwu7jjj"() IS 'immutability guard of FragmentContextRef';

COMMENT ON FUNCTION "qti"."__immutable_fragment_feedback_name_ffzmmoukqe"() IS 'immutability guard of FragmentFeedbackName';

COMMENT ON FUNCTION "qti"."__immutable_fragment_feedback_ref_7pyvlsjvu4"() IS 'immutability guard of FragmentFeedbackRef';

COMMENT ON FUNCTION "qti"."__immutable_fragment_printed_name_f67jebrp64"() IS 'immutability guard of FragmentPrintedName';

COMMENT ON FUNCTION "qti"."__immutable_fragment_printed_ref_dbnyr3esu7"() IS 'immutability guard of FragmentPrintedRef';

COMMENT ON FUNCTION "qti"."__immutable_fragment_scope_sjx7hdntnt"() IS 'immutability guard of FragmentScope';

COMMENT ON FUNCTION "qti"."__immutable_fragment_template_name_3qvolm2kb6"() IS 'immutability guard of FragmentTemplateName';

COMMENT ON FUNCTION "qti"."__immutable_fragment_template_ref_jj57ejir2o"() IS 'immutability guard of FragmentTemplateRef';

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

COMMENT ON FUNCTION "qti"."__immutable_placed_expression_6f7ddcef53"() IS 'immutability guard of PlacedExpression';

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

COMMENT ON FUNCTION "qti"."__immutable_resource_href_outside_hhcxhput7m"() IS 'immutability guard of ResourceHrefOutside';

COMMENT ON FUNCTION "qti"."__immutable_resource_href_path_geg2rregza"() IS 'immutability guard of ResourceHrefPath';

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

COMMENT ON FUNCTION "qti"."__immutable_template_ref_txetw6uizh"() IS 'immutability guard of TemplateRef';

COMMENT ON FUNCTION "qti"."__immutable_text_idref_iatqcpbyrw"() IS 'immutability guard of TextIdref';

COMMENT ON FUNCTION "qti"."__immutable_text_reference_t575rjvqct"() IS 'immutability guard of TextReference';

COMMENT ON FUNCTION "qti"."__immutable_text_reference_path_rdz63xnbcm"() IS 'immutability guard of TextReferencePath';

COMMENT ON FUNCTION "qti"."__immutable_tolerance_qlqblufht2"() IS 'immutability guard of Tolerance';

COMMENT ON FUNCTION "qti"."__immutable_tolerance_token_3mam4bz3yb"() IS 'immutability guard of ToleranceToken';

COMMENT ON FUNCTION "qti"."__immutable_usage_value_jnk7ednwfy"() IS 'immutability guard of UsageValue';

COMMENT ON FUNCTION "qti"."__immutable_usage_value_base_type_r6zekdtvgx"() IS 'immutability guard of UsageValueBaseType';

COMMENT ON FUNCTION "qti"."__immutable_variable_ref_2akeo54qw2"() IS 'immutability guard of VariableRef';

COMMENT ON FUNCTION "qti"."__immutable_xml_decl_xczaxf75t5"() IS 'immutability guard of XmlDecl';

COMMENT ON ROLE :"__live_lxch3umxkh" IS 'live source of qti';
