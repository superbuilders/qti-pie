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

CREATE VIEW "__qti"."cn_part_text" ("base", "base_name", "form", "form_name", "package", "part", "part_name", "path", "start", "text", "type", "type_name") AS
SELECT "r1"."base", ("qti"."__cn_base_names_2wtzhyubck"())["r1"."base" + 1]::"pg_catalog"."text", "r1"."form", ("qti"."__cn_part_form_names_te7u7jycdu"())["r1"."form" + 1]::"pg_catalog"."text", "r1"."package", "r1"."part", ("qti"."__cn_part_names_6db2fcgfhy"())["r1"."part" + 1]::"pg_catalog"."text", "r1"."path", "r1"."start", "r1"."text", "r1"."type", ("qti"."__cn_type_names_wmjelllvhg"())["r1"."type" + 1]::"pg_catalog"."text"
FROM "qti"."cn_part_text" AS "r1";

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

CREATE VIEW "__qti"."variable_ref" ("after", "attribute", "attribute_name", "before", "identifier", "language", "language_name", "package", "path", "root_kind", "root_kind_name", "start") AS
SELECT "r1"."after", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."before", "r1"."identifier", "r1"."language", ("qti"."__language_names_pvmtywwssv"())["r1"."language" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."root_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."root_kind" + 1]::"pg_catalog"."text", "r1"."start"
FROM "qti"."variable_ref" AS "r1";

CREATE VIEW "__qti"."xml_decl" ("package", "path", "version") AS
SELECT "r1"."package", "r1"."path", "r1"."version"
FROM "qti"."xml_decl" AS "r1";

CREATE VIEW "__qti_queries"."anchored_id" ("anchor", "assembly", "id_digest", "instance", "owner", "package") AS
SELECT "r1"."anchor", "r1"."assembly", "r1"."id_digest", "r1"."instance", "r1"."owner", "r1"."package"
FROM "qti_queries"."anchored_id" AS "r1";

CREATE VIEW "__qti_queries"."anchored_name" ("anchor", "anchor_document", "assembly", "identifier", "instance", "package", "path", "start") AS
SELECT "r1"."anchor", "r1"."anchor_document", "r1"."assembly", "r1"."identifier", "r1"."instance", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."anchored_name" AS "r1";

CREATE VIEW "__qti_queries"."apply_argument" ("apply", "package", "path", "start") AS
SELECT "r1"."apply", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."apply_argument" AS "r1";

CREATE VIEW "__qti_queries"."apply_argument_pair" ("apply", "first", "package", "path", "second") AS
SELECT "r1"."apply", "r1"."first", "r1"."package", "r1"."path", "r1"."second"
FROM "qti_queries"."apply_argument_pair" AS "r1";

CREATE VIEW "__qti_queries"."area_mapping_base_type" ("base_type", "base_type_name", "package", "path", "start") AS
SELECT "r1"."base_type", ("qti"."__base_type_names_ok3nu5nck4"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."area_mapping_base_type" AS "r1";

CREATE VIEW "__qti_queries"."area_mapping_cardinality" ("cardinality", "cardinality_name", "package", "path", "start") AS
SELECT "r1"."cardinality", ("qti"."__cardinality_names_kqiairsoqa"())["r1"."cardinality" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."area_mapping_cardinality" AS "r1";

CREATE VIEW "__qti_queries"."aria_bounds" ("max", "min", "package", "path", "start") AS
SELECT "r1"."max", "r1"."min", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."aria_bounds" AS "r1";

CREATE VIEW "__qti_queries"."arity_floor" ("min", "package", "path", "start") AS
SELECT "r1"."min", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."arity_floor" AS "r1";

CREATE VIEW "__qti_queries"."assembled_catalog" ("assembly", "id_digest", "package") AS
SELECT "r1"."assembly", "r1"."id_digest", "r1"."package"
FROM "qti_queries"."assembled_catalog" AS "r1";

CREATE VIEW "__qti_queries"."assembled_id" ("assembly", "id_digest", "instance", "owner", "package", "path") AS
SELECT "r1"."assembly", "r1"."id_digest", "r1"."instance", "r1"."owner", "r1"."package", "r1"."path"
FROM "qti_queries"."assembled_id" AS "r1";

CREATE VIEW "__qti_queries"."assembled_name" ("anchor_document", "assembly", "identifier", "package", "path", "start") AS
SELECT "r1"."anchor_document", "r1"."assembly", "r1"."identifier", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."assembled_name" AS "r1";

CREATE VIEW "__qti_queries"."assembled_replaceable" ("assembly", "instance", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."instance", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."assembled_replaceable" AS "r1";

CREATE VIEW "__qti_queries"."bank_member" ("bank", "identifier", "item", "package") AS
SELECT "r1"."bank", "r1"."identifier", "r1"."item", "r1"."package"
FROM "qti_queries"."bank_member" AS "r1";

CREATE VIEW "__qti_queries"."base_type_cardinality" ("cardinality", "cardinality_name", "package", "path", "start") AS
SELECT "r1"."cardinality", ("qti"."__cardinality_names_kqiairsoqa"())["r1"."cardinality" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."base_type_cardinality" AS "r1";

CREATE VIEW "__qti_queries"."binary_math_operator" ("package", "path", "start") AS
SELECT "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."binary_math_operator" AS "r1";

CREATE VIEW "__qti_queries"."binding_base_type_node" ("attribute", "attribute_name", "base_type", "base_type_name", "cardinality", "cardinality_name", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."base_type", ("qti"."__base_type_names_ok3nu5nck4"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."cardinality", ("qti"."__cardinality_names_kqiairsoqa"())["r1"."cardinality" + 1]::"pg_catalog"."text", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."binding_base_type_node" AS "r1";

CREATE VIEW "__qti_queries"."binding_cardinality_node" ("attribute", "attribute_name", "cardinality", "cardinality_name", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."cardinality", ("qti"."__cardinality_names_kqiairsoqa"())["r1"."cardinality" + 1]::"pg_catalog"."text", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."binding_cardinality_node" AS "r1";

CREATE VIEW "__qti_queries"."bound_range" ("kind", "kind_name", "least_value", "min_written", "most_value", "package", "path", "start") AS
SELECT "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."least_value", "r1"."min_written", "r1"."most_value", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."bound_range" AS "r1";

CREATE VIEW "__qti_queries"."bounded_selection" ("package", "path", "section") AS
SELECT "r1"."package", "r1"."path", "r1"."section"
FROM "qti_queries"."bounded_selection" AS "r1";

CREATE VIEW "__qti_queries"."branch_resolution" ("assembly", "instance", "package", "path", "source", "source_end", "source_kind", "source_kind_name", "start", "target") AS
SELECT "r1"."assembly", "r1"."instance", "r1"."package", "r1"."path", "r1"."source", "r1"."source_end", "r1"."source_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."source_kind" + 1]::"pg_catalog"."text", "r1"."start", "r1"."target"
FROM "qti_queries"."branch_resolution" AS "r1";

CREATE VIEW "__qti_queries"."catalog_scope_node" ("kind", "kind_name", "package", "parent", "path", "scope", "start") AS
SELECT "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."parent", "r1"."path", "r1"."scope", "r1"."start"
FROM "qti_queries"."catalog_scope_node" AS "r1";

CREATE VIEW "__qti_queries"."cell_child" ("kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."cell_child" AS "r1";

CREATE VIEW "__qti_queries"."cell_leaf_node" ("at", "cell", "groups", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."at", "r1"."cell", "r1"."groups", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."cell_leaf_node" AS "r1";

CREATE VIEW "__qti_queries"."cell_token" ("package", "path", "start", "table", "token_digest") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."table", "r1"."token_digest"
FROM "qti_queries"."cell_token" AS "r1";

CREATE VIEW "__qti_queries"."choice_node" ("identifier", "kind", "kind_name", "nearest", "package", "path", "start") AS
SELECT "r1"."identifier", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."nearest", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."choice_node" AS "r1";

CREATE VIEW "__qti_queries"."choice_or_hottext" ("identifier", "package", "path", "start") AS
SELECT "r1"."identifier", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."choice_or_hottext" AS "r1";

CREATE VIEW "__qti_queries"."choice_space_name" ("identifier", "package", "path", "start") AS
SELECT "r1"."identifier", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."choice_space_name" AS "r1";

CREATE VIEW "__qti_queries"."cn_count" ("package", "path", "start", "type", "type_name", "parts") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."type", ("qti"."__cn_type_names_wmjelllvhg"())["r1"."type" + 1]::"pg_catalog"."text", "r1"."parts"
FROM "qti_queries"."cn_count" AS "r1";

CREATE VIEW "__qti_queries"."copied_id" ("anchor_document", "assembly", "id_digest", "package") AS
SELECT "r1"."anchor_document", "r1"."assembly", "r1"."id_digest", "r1"."package"
FROM "qti_queries"."copied_id" AS "r1";

CREATE VIEW "__qti_queries"."count_bound_node" ("kind", "kind_name", "max_name", "max_name_name", "max_written", "min_name", "min_name_name", "min_written", "package", "path", "start") AS
SELECT "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."max_name", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."max_name" + 1]::"pg_catalog"."text", "r1"."max_written", "r1"."min_name", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."min_name" + 1]::"pg_catalog"."text", "r1"."min_written", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."count_bound_node" AS "r1";

CREATE VIEW "__qti_queries"."declaration_table" ("declaration", "kind", "kind_name", "package", "path") AS
SELECT "r1"."declaration", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path"
FROM "qti_queries"."declaration_table" AS "r1";

CREATE VIEW "__qti_queries"."declared_placement" ("assembly", "attribute", "attribute_name", "instance", "package", "path", "resolution", "resolution_name", "start") AS
SELECT "r1"."assembly", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."instance", "r1"."package", "r1"."path", "r1"."resolution", ("qti"."__reference_resolution_names_zfbhfhou4v"())["r1"."resolution" + 1]::"pg_catalog"."text", "r1"."start"
FROM "qti_queries"."declared_placement" AS "r1";

CREATE VIEW "__qti_queries"."deliverable_test" ("package", "path", "start", "test") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."test"
FROM "qti_queries"."deliverable_test" AS "r1";

CREATE VIEW "__qti_queries"."dependency" ("package", "start", "value") AS
SELECT "r1"."package", "r1"."start", "r1"."value"
FROM "qti_queries"."dependency" AS "r1";

CREATE VIEW "__qti_queries"."dependency_resolved" ("package", "resource", "start", "target") AS
SELECT "r1"."package", "r1"."resource", "r1"."start", "r1"."target"
FROM "qti_queries"."dependency_resolved" AS "r1";

CREATE VIEW "__qti_queries"."described_assembled_lang" ("assembly", "form", "general", "instance", "package", "path", "value") AS
SELECT "r1"."assembly", "r1"."form", "r1"."general", "r1"."instance", "r1"."package", "r1"."path", "r1"."value"
FROM "qti_queries"."described_assembled_lang" AS "r1";

CREATE VIEW "__qti_queries"."described_lang" ("document", "form", "general", "package", "path", "value") AS
SELECT "r1"."document", "r1"."form", "r1"."general", "r1"."package", "r1"."path", "r1"."value"
FROM "qti_queries"."described_lang" AS "r1";

CREATE VIEW "__qti_queries"."entry_file_target" ("package", "target") AS
SELECT "r1"."package", "r1"."target"
FROM "qti_queries"."entry_file_target" AS "r1";

CREATE VIEW "__qti_queries"."expression_attribute" ("assembly", "base_type", "base_type_name", "instance", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."base_type", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."instance", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."expression_attribute" AS "r1";

CREATE VIEW "__qti_queries"."expression_node" ("kind", "kind_name", "language", "language_name", "package", "parent", "parent_kind", "parent_kind_name", "path", "start") AS
SELECT "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."language", ("qti"."__language_names_pvmtywwssv"())["r1"."language" + 1]::"pg_catalog"."text", "r1"."package", "r1"."parent", "r1"."parent_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."parent_kind" + 1]::"pg_catalog"."text", "r1"."path", "r1"."start"
FROM "qti_queries"."expression_node" AS "r1";

CREATE VIEW "__qti_queries"."expression_operand" ("operator", "operator_kind", "operator_kind_name", "package", "path", "rank", "start") AS
SELECT "r1"."operator", "r1"."operator_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."operator_kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."rank", "r1"."start"
FROM "qti_queries"."expression_operand" AS "r1";

CREATE VIEW "__qti_queries"."feedback_ref_base_type" ("attribute", "attribute_name", "base_type", "base_type_name", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."base_type", ("qti"."__base_type_names_ok3nu5nck4"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."feedback_ref_base_type" AS "r1";

CREATE VIEW "__qti_queries"."feedback_ref_cardinality" ("attribute", "attribute_name", "cardinality", "cardinality_name", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."cardinality", ("qti"."__cardinality_names_kqiairsoqa"())["r1"."cardinality" + 1]::"pg_catalog"."text", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."feedback_ref_cardinality" AS "r1";

CREATE VIEW "__qti_queries"."field_value_text" ("base_type", "base_type_name", "cardinality", "cardinality_name", "package", "path", "start", "text") AS
SELECT "r1"."base_type", ("qti"."__base_type_names_ok3nu5nck4"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."cardinality", ("qti"."__cardinality_names_kqiairsoqa"())["r1"."cardinality" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start", "r1"."text"
FROM "qti_queries"."field_value_text" AS "r1";

CREATE VIEW "__qti_queries"."filtered_section" ("assembly", "instance", "package", "path", "section", "section_path", "start") AS
SELECT "r1"."assembly", "r1"."instance", "r1"."package", "r1"."path", "r1"."section", "r1"."section_path", "r1"."start"
FROM "qti_queries"."filtered_section" AS "r1";

CREATE VIEW "__qti_queries"."forbidden_resource_type" ("package", "path", "type") AS
SELECT "r1"."package", "r1"."path", "r1"."type"
FROM "qti_queries"."forbidden_resource_type" AS "r1";

CREATE VIEW "__qti_queries"."forward_branch_rule" ("assembly", "instance", "package", "start") AS
SELECT "r1"."assembly", "r1"."instance", "r1"."package", "r1"."start"
FROM "qti_queries"."forward_branch_rule" AS "r1";

CREATE VIEW "__qti_queries"."free_mapping_target" ("package", "path", "start") AS
SELECT "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."free_mapping_target" AS "r1";

CREATE VIEW "__qti_queries"."head_document" ("package", "path") AS
SELECT "r1"."package", "r1"."path"
FROM "qti_queries"."head_document" AS "r1";

CREATE VIEW "__qti_queries"."head_qualifier_pair" ("head", "head_name", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."head", ("qti"."__node_kind_names_ulbko553n7"())["r1"."head" + 1]::"pg_catalog"."text", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."head_qualifier_pair" AS "r1";

CREATE VIEW "__qti_queries"."held_type" ("assembly", "base_type", "base_type_name", "cardinality", "cardinality_name", "held_base", "held_base_name", "held_cardinality", "held_cardinality_name", "identifier", "instance", "kind", "kind_name", "package", "path", "resolution", "resolution_name", "start") AS
SELECT "r1"."assembly", "r1"."base_type", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."cardinality", ("qti"."__value_cardinality_names_wzwznoycgf"())["r1"."cardinality" + 1]::"pg_catalog"."text", "r1"."held_base", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."held_base" + 1]::"pg_catalog"."text", "r1"."held_cardinality", ("qti"."__value_cardinality_names_wzwznoycgf"())["r1"."held_cardinality" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."instance", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."resolution", ("qti"."__reference_resolution_names_zfbhfhou4v"())["r1"."resolution" + 1]::"pg_catalog"."text", "r1"."start"
FROM "qti_queries"."held_type" AS "r1";

CREATE VIEW "__qti_queries"."hotspot_node" ("area", "elements", "kind", "kind_name", "package", "parent_element_children", "parent_kind", "parent_kind_name", "path", "start") AS
SELECT "r1"."area", "r1"."elements", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."parent_element_children", "r1"."parent_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."parent_kind" + 1]::"pg_catalog"."text", "r1"."path", "r1"."start"
FROM "qti_queries"."hotspot_node" AS "r1";

CREATE VIEW "__qti_queries"."hottext_node" ("nearest", "nearest_kind", "nearest_kind_name", "nearest_path", "package", "path", "start") AS
SELECT "r1"."nearest", "r1"."nearest_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."nearest_kind" + 1]::"pg_catalog"."text", "r1"."nearest_path", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."hottext_node" AS "r1";

CREATE VIEW "__qti_queries"."id_binding" ("id_digest", "owner", "package", "path") AS
SELECT "r1"."id_digest", "r1"."owner", "r1"."package", "r1"."path"
FROM "qti_queries"."id_binding" AS "r1";

CREATE VIEW "__qti_queries"."identity_text_node" ("governor", "governor_name", "package", "path", "start", "string_value", "token_text", "tokens") AS
SELECT "r1"."governor", ("qti"."__governor_names_d7jfyla3na"())["r1"."governor" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start", "r1"."string_value", "r1"."token_text", "r1"."tokens"
FROM "qti_queries"."identity_text_node" AS "r1";

CREATE VIEW "__qti_queries"."instance_document" ("document", "package") AS
SELECT "r1"."document", "r1"."package"
FROM "qti_queries"."instance_document" AS "r1";

CREATE VIEW "__qti_queries"."integer_aggregate" ("assembly", "instance", "operator", "operator_base", "operator_base_name", "package", "path") AS
SELECT "r1"."assembly", "r1"."instance", "r1"."operator", "r1"."operator_base", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."operator_base" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path"
FROM "qti_queries"."integer_aggregate" AS "r1";

CREATE VIEW "__qti_queries"."interaction_node" ("kind", "kind_name", "module_forms", "package", "path", "start") AS
SELECT "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."module_forms", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."interaction_node" AS "r1";

CREATE VIEW "__qti_queries"."interpolated_lookup" ("assembly", "declaration", "instance", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."declaration", "r1"."instance", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."interpolated_lookup" AS "r1";

CREATE VIEW "__qti_queries"."item_mapping" ("item", "package", "path", "ref", "source", "start", "target") AS
SELECT "r1"."item", "r1"."package", "r1"."path", "r1"."ref", "r1"."source", "r1"."start", "r1"."target"
FROM "qti_queries"."item_mapping" AS "r1";

CREATE VIEW "__qti_queries"."item_read" ("assembly", "attribute", "attribute_name", "base_type", "base_type_name", "cardinality", "cardinality_name", "instance", "package", "path", "start", "variable") AS
SELECT "r1"."assembly", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."base_type", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."cardinality", ("qti"."__value_cardinality_names_wzwznoycgf"())["r1"."cardinality" + 1]::"pg_catalog"."text", "r1"."instance", "r1"."package", "r1"."path", "r1"."start", "r1"."variable"
FROM "qti_queries"."item_read" AS "r1";

CREATE VIEW "__qti_queries"."item_ref_category" ("category", "package", "path", "start") AS
SELECT "r1"."category", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."item_ref_category" AS "r1";

CREATE VIEW "__qti_queries"."item_ref_section" ("identifier", "package", "path", "section", "start") AS
SELECT "r1"."identifier", "r1"."package", "r1"."path", "r1"."section", "r1"."start"
FROM "qti_queries"."item_ref_section" AS "r1";

CREATE VIEW "__qti_queries"."item_ref_table" ("package", "path", "start", "table", "table_name", "variable") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."table", ("qti"."__node_kind_names_ulbko553n7"())["r1"."table" + 1]::"pg_catalog"."text", "r1"."variable"
FROM "qti_queries"."item_ref_table" AS "r1";

CREATE VIEW "__qti_queries"."item_ref_target" ("package", "path", "start", "target", "type", "type_name") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."target", "r1"."type", ("qti"."__resource_type_names_2tbbvn3ion"())["r1"."type" + 1]::"pg_catalog"."text"
FROM "qti_queries"."item_ref_target" AS "r1";

CREATE VIEW "__qti_queries"."item_scoped_reading" ("assembly", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."item_scoped_reading" AS "r1";

CREATE VIEW "__qti_queries"."item_template_default" ("item", "package", "path", "ref", "start", "template") AS
SELECT "r1"."item", "r1"."package", "r1"."path", "r1"."ref", "r1"."start", "r1"."template"
FROM "qti_queries"."item_template_default" AS "r1";

CREATE VIEW "__qti_queries"."judged_placed_idref" ("assembly", "id_digest", "package") AS
SELECT "r1"."assembly", "r1"."id_digest", "r1"."package"
FROM "qti_queries"."judged_placed_idref" AS "r1";

CREATE VIEW "__qti_queries"."known_operand_base" ("assembly", "base_type", "base_type_name", "instance", "operator", "package", "path") AS
SELECT "r1"."assembly", "r1"."base_type", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."instance", "r1"."operator", "r1"."package", "r1"."path"
FROM "qti_queries"."known_operand_base" AS "r1";

CREATE VIEW "__qti_queries"."known_operand_cardinality" ("assembly", "cardinality", "cardinality_name", "instance", "operator", "package", "path") AS
SELECT "r1"."assembly", "r1"."cardinality", ("qti"."__value_cardinality_names_wzwznoycgf"())["r1"."cardinality" + 1]::"pg_catalog"."text", "r1"."instance", "r1"."operator", "r1"."package", "r1"."path"
FROM "qti_queries"."known_operand_cardinality" AS "r1";

CREATE VIEW "__qti_queries"."late_submission" ("package", "path", "scope") AS
SELECT "r1"."package", "r1"."path", "r1"."scope"
FROM "qti_queries"."late_submission" AS "r1";

CREATE VIEW "__qti_queries"."least_choice_bound" ("choices", "kind", "kind_name", "least_value", "min_written", "package", "path", "start") AS
SELECT "r1"."choices", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."least_value", "r1"."min_written", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."least_choice_bound" AS "r1";

CREATE VIEW "__qti_queries"."least_count_node" ("kind", "kind_name", "least", "least_value", "min_name", "min_name_name", "min_written", "package", "path", "start") AS
SELECT "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."least", "r1"."least_value", "r1"."min_name", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."min_name" + 1]::"pg_catalog"."text", "r1"."min_written", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."least_count_node" AS "r1";

CREATE VIEW "__qti_queries"."least_one_apply" ("apply", "package", "path") AS
SELECT "r1"."apply", "r1"."package", "r1"."path"
FROM "qti_queries"."least_one_apply" AS "r1";

CREATE VIEW "__qti_queries"."least_two_apply" ("apply", "package", "path") AS
SELECT "r1"."apply", "r1"."package", "r1"."path"
FROM "qti_queries"."least_two_apply" AS "r1";

CREATE VIEW "__qti_queries"."link_scope" ("assembly", "identifier", "instance", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."identifier", "r1"."instance", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."link_scope" AS "r1";

CREATE VIEW "__qti_queries"."link_spelling" ("assembly", "attribute", "attribute_name", "identifier", "package", "path", "scope", "scope_instance", "scope_name", "scope_path", "start", "variable") AS
SELECT "r1"."assembly", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."package", "r1"."path", "r1"."scope", "r1"."scope_instance", "r1"."scope_name", "r1"."scope_path", "r1"."start", "r1"."variable"
FROM "qti_queries"."link_spelling" AS "r1";

CREATE VIEW "__qti_queries"."listed_identifier" ("package", "path", "record") AS
SELECT "r1"."package", "r1"."path", "r1"."record"
FROM "qti_queries"."listed_identifier" AS "r1";

CREATE VIEW "__qti_queries"."listed_lang" ("general", "lang", "package", "path") AS
SELECT "r1"."general", "r1"."lang", "r1"."package", "r1"."path"
FROM "qti_queries"."listed_lang" AS "r1";

CREATE VIEW "__qti_queries"."listed_title" ("package", "path", "record") AS
SELECT "r1"."package", "r1"."path", "r1"."record"
FROM "qti_queries"."listed_title" AS "r1";

CREATE VIEW "__qti_queries"."lookup_table_cardinality" ("cardinality", "cardinality_name", "package", "path", "start") AS
SELECT "r1"."cardinality", ("qti"."__cardinality_names_kqiairsoqa"())["r1"."cardinality" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."lookup_table_cardinality" AS "r1";

CREATE VIEW "__qti_queries"."lookup_value_type" ("base_type", "base_type_name", "package", "path", "start", "value") AS
SELECT "r1"."base_type", ("qti"."__base_type_names_ok3nu5nck4"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start", "r1"."value"
FROM "qti_queries"."lookup_value_type" AS "r1";

CREATE VIEW "__qti_queries"."map_key_type" ("base_type", "base_type_name", "key", "package", "path", "start") AS
SELECT "r1"."base_type", ("qti"."__base_type_names_ok3nu5nck4"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."key", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."map_key_type" AS "r1";

CREATE VIEW "__qti_queries"."mapped_response_declaration" ("package", "path") AS
SELECT "r1"."package", "r1"."path"
FROM "qti_queries"."mapped_response_declaration" AS "r1";

CREATE VIEW "__qti_queries"."mapping_base_type" ("base_type", "base_type_name", "package", "path", "start") AS
SELECT "r1"."base_type", ("qti"."__base_type_names_ok3nu5nck4"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."mapping_base_type" AS "r1";

CREATE VIEW "__qti_queries"."mapping_cardinality" ("cardinality", "cardinality_name", "package", "path", "start") AS
SELECT "r1"."cardinality", ("qti"."__cardinality_names_kqiairsoqa"())["r1"."cardinality" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."mapping_cardinality" AS "r1";

CREATE VIEW "__qti_queries"."mastery_ceiling" ("mastery_value", "normal_maximum", "package", "path", "start") AS
SELECT "r1"."mastery_value", "r1"."normal_maximum", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."mastery_ceiling" AS "r1";

CREATE VIEW "__qti_queries"."mastery_floor" ("mastery_value", "normal_minimum", "package", "path", "start") AS
SELECT "r1"."mastery_value", "r1"."normal_minimum", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."mastery_floor" AS "r1";

CREATE VIEW "__qti_queries"."matched_identifier" ("package", "path", "record") AS
SELECT "r1"."package", "r1"."path", "r1"."record"
FROM "qti_queries"."matched_identifier" AS "r1";

CREATE VIEW "__qti_queries"."matched_title" ("package", "path", "record") AS
SELECT "r1"."package", "r1"."path", "r1"."record"
FROM "qti_queries"."matched_title" AS "r1";

CREATE VIEW "__qti_queries"."math_action_node" ("element_children", "package", "path", "selection", "start") AS
SELECT "r1"."element_children", "r1"."package", "r1"."path", "r1"."selection", "r1"."start"
FROM "qti_queries"."math_action_node" AS "r1";

CREATE VIEW "__qti_queries"."math_operand" ("name", "operator", "package", "path", "rank") AS
SELECT "r1"."name", "r1"."operator", "r1"."package", "r1"."path", "r1"."rank"
FROM "qti_queries"."math_operand" AS "r1";

CREATE VIEW "__qti_queries"."math_rank_node" ("kind", "kind_name", "package", "parent", "path", "rank", "start") AS
SELECT "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."parent", "r1"."path", "r1"."rank", "r1"."start"
FROM "qti_queries"."math_rank_node" AS "r1";

CREATE VIEW "__qti_queries"."math_rank_step" ("kind", "kind_name", "package", "parent", "parent_rank", "path", "rank", "start") AS
SELECT "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."parent", "r1"."parent_rank", "r1"."path", "r1"."rank", "r1"."start"
FROM "qti_queries"."math_rank_step" AS "r1";

CREATE VIEW "__qti_queries"."max_attempts" ("attempts", "package", "path", "scope") AS
SELECT "r1"."attempts", "r1"."package", "r1"."path", "r1"."scope"
FROM "qti_queries"."max_attempts" AS "r1";

CREATE VIEW "__qti_queries"."max_time" ("package", "path", "scope", "seconds") AS
SELECT "r1"."package", "r1"."path", "r1"."scope", "r1"."seconds"
FROM "qti_queries"."max_time" AS "r1";

CREATE VIEW "__qti_queries"."min_time" ("package", "path", "scope", "seconds") AS
SELECT "r1"."package", "r1"."path", "r1"."scope", "r1"."seconds"
FROM "qti_queries"."min_time" AS "r1";

CREATE VIEW "__qti_queries"."most_choice_bound" ("choices", "kind", "kind_name", "min_written", "most_value", "package", "path", "start") AS
SELECT "r1"."choices", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."min_written", "r1"."most_value", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."most_choice_bound" AS "r1";

CREATE VIEW "__qti_queries"."most_count_node" ("kind", "kind_name", "max_name", "max_name_name", "max_written", "min_written", "most", "most_value", "package", "path", "start") AS
SELECT "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."max_name", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."max_name" + 1]::"pg_catalog"."text", "r1"."max_written", "r1"."min_written", "r1"."most", "r1"."most_value", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."most_count_node" AS "r1";

CREATE VIEW "__qti_queries"."most_one_argument" ("apply", "package", "path", "start") AS
SELECT "r1"."apply", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."most_one_argument" AS "r1";

CREATE VIEW "__qti_queries"."most_two_argument_pair" ("apply", "first", "package", "path", "second") AS
SELECT "r1"."apply", "r1"."first", "r1"."package", "r1"."path", "r1"."second"
FROM "qti_queries"."most_two_argument_pair" AS "r1";

CREATE VIEW "__qti_queries"."named_item_ref" ("identifier", "item", "package", "path", "start") AS
SELECT "r1"."identifier", "r1"."item", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."named_item_ref" AS "r1";

CREATE VIEW "__qti_queries"."non_container_strings" ("least_value", "package", "path", "start") AS
SELECT "r1"."least_value", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."non_container_strings" AS "r1";

CREATE VIEW "__qti_queries"."numbered_spelling" ("assembly", "attribute", "attribute_name", "identifier", "number", "package", "path", "scope", "scope_instance", "scope_name", "scope_path", "start", "variable") AS
SELECT "r1"."assembly", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."number", "r1"."package", "r1"."path", "r1"."scope", "r1"."scope_instance", "r1"."scope_name", "r1"."scope_path", "r1"."start", "r1"."variable"
FROM "qti_queries"."numbered_spelling" AS "r1";

CREATE VIEW "__qti_queries"."numbered_target" ("assembly", "package", "scope", "scope_instance", "scope_path", "variable") AS
SELECT "r1"."assembly", "r1"."package", "r1"."scope", "r1"."scope_instance", "r1"."scope_path", "r1"."variable"
FROM "qti_queries"."numbered_target" AS "r1";

CREATE VIEW "__qti_queries"."object_identifier" ("kind", "kind_name", "package", "path", "start", "value", "value_digest") AS
SELECT "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start", "r1"."value", "r1"."value_digest"
FROM "qti_queries"."object_identifier" AS "r1";

CREATE VIEW "__qti_queries"."one_tail_cardinality" ("assembly", "cardinality", "cardinality_name", "instance", "operator", "package", "path") AS
SELECT "r1"."assembly", "r1"."cardinality", ("qti"."__value_cardinality_names_wzwznoycgf"())["r1"."cardinality" + 1]::"pg_catalog"."text", "r1"."instance", "r1"."operator", "r1"."package", "r1"."path"
FROM "qti_queries"."one_tail_cardinality" AS "r1";

CREATE VIEW "__qti_queries"."open_name_node" ("expanded", "kind", "kind_name", "namespace", "package", "parent", "parent_kind", "parent_kind_name", "path", "start") AS
SELECT "r1"."expanded", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."namespace", "r1"."package", "r1"."parent", "r1"."parent_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."parent_kind" + 1]::"pg_catalog"."text", "r1"."path", "r1"."start"
FROM "qti_queries"."open_name_node" AS "r1";

CREATE VIEW "__qti_queries"."open_name_under_foreign" ("kind", "kind_name", "namespace", "package", "parent_namespace", "path", "start") AS
SELECT "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."namespace", "r1"."package", "r1"."parent_namespace", "r1"."path", "r1"."start"
FROM "qti_queries"."open_name_under_foreign" AS "r1";

CREATE VIEW "__qti_queries"."open_type_node" ("governor", "governor_name", "kind", "kind_name", "package", "parent_kind", "parent_kind_name", "path", "start", "type", "type_name") AS
SELECT "r1"."governor", ("qti"."__governor_names_d7jfyla3na"())["r1"."governor" + 1]::"pg_catalog"."text", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."parent_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."parent_kind" + 1]::"pg_catalog"."text", "r1"."path", "r1"."start", "r1"."type", ("qti"."__type_name_names_ksmacbo3df"())["r1"."type" + 1]::"pg_catalog"."text"
FROM "qti_queries"."open_type_node" AS "r1";

CREATE VIEW "__qti_queries"."open_type_under_foreign" ("package", "parent_namespace", "path", "start", "type", "type_name") AS
SELECT "r1"."package", "r1"."parent_namespace", "r1"."path", "r1"."start", "r1"."type", ("qti"."__type_name_names_ksmacbo3df"())["r1"."type" + 1]::"pg_catalog"."text"
FROM "qti_queries"."open_type_under_foreign" AS "r1";

CREATE VIEW "__qti_queries"."operand_of" ("assembly", "base_type", "base_type_name", "base_type_bit", "cardinality", "cardinality_name", "cardinality_bit", "instance", "operator", "operator_base", "operator_base_name", "operator_cardinality", "operator_cardinality_name", "operator_kind", "operator_kind_name", "package", "path", "rank", "start") AS
SELECT "r1"."assembly", "r1"."base_type", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."base_type_bit", "r1"."cardinality", ("qti"."__value_cardinality_names_wzwznoycgf"())["r1"."cardinality" + 1]::"pg_catalog"."text", "r1"."cardinality_bit", "r1"."instance", "r1"."operator", "r1"."operator_base", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."operator_base" + 1]::"pg_catalog"."text", "r1"."operator_cardinality", ("qti"."__value_cardinality_names_wzwznoycgf"())["r1"."operator_cardinality" + 1]::"pg_catalog"."text", "r1"."operator_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."operator_kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."rank", "r1"."start"
FROM "qti_queries"."operand_of" AS "r1";

CREATE VIEW "__qti_queries"."other_vocabulary_type" ("package", "path", "type") AS
SELECT "r1"."package", "r1"."path", "r1"."type"
FROM "qti_queries"."other_vocabulary_type" AS "r1";

CREATE VIEW "__qti_queries"."packaged_template_default" ("package", "path", "ref", "start") AS
SELECT "r1"."package", "r1"."path", "r1"."ref", "r1"."start"
FROM "qti_queries"."packaged_template_default" AS "r1";

CREATE VIEW "__qti_queries"."pattern_text" ("package", "path", "pattern", "start") AS
SELECT "r1"."package", "r1"."path", "r1"."pattern", "r1"."start"
FROM "qti_queries"."pattern_text" AS "r1";

CREATE VIEW "__qti_queries"."placed_binding_base_type_node" ("assembly", "attribute", "attribute_name", "base_type", "base_type_name", "cardinality", "cardinality_name", "instance", "kind", "kind_name", "package", "start") AS
SELECT "r1"."assembly", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."base_type", ("qti"."__base_type_names_ok3nu5nck4"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."cardinality", ("qti"."__cardinality_names_kqiairsoqa"())["r1"."cardinality" + 1]::"pg_catalog"."text", "r1"."instance", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."start"
FROM "qti_queries"."placed_binding_base_type_node" AS "r1";

CREATE VIEW "__qti_queries"."placed_binding_cardinality_node" ("assembly", "attribute", "attribute_name", "cardinality", "cardinality_name", "instance", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."cardinality", ("qti"."__cardinality_names_kqiairsoqa"())["r1"."cardinality" + 1]::"pg_catalog"."text", "r1"."instance", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."placed_binding_cardinality_node" AS "r1";

CREATE VIEW "__qti_queries"."placed_choice_or_hottext" ("assembly", "identifier", "instance", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."identifier", "r1"."instance", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."placed_choice_or_hottext" AS "r1";

CREATE VIEW "__qti_queries"."placed_choice_space_name" ("assembly", "identifier", "instance", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."identifier", "r1"."instance", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."placed_choice_space_name" AS "r1";

CREATE VIEW "__qti_queries"."placed_expression_node" ("assembly", "base_type", "base_type_name", "cardinality", "cardinality_name", "instance", "kind", "kind_name", "package", "parent", "parent_kind", "parent_kind_name", "path", "start") AS
SELECT "r1"."assembly", "r1"."base_type", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."cardinality", ("qti"."__value_cardinality_names_wzwznoycgf"())["r1"."cardinality" + 1]::"pg_catalog"."text", "r1"."instance", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."parent", "r1"."parent_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."parent_kind" + 1]::"pg_catalog"."text", "r1"."path", "r1"."start"
FROM "qti_queries"."placed_expression_node" AS "r1";

CREATE VIEW "__qti_queries"."placed_expression_site" ("assembly", "instance", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."instance", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."placed_expression_site" AS "r1";

CREATE VIEW "__qti_queries"."placed_filter" ("assembly", "package", "path", "start", "value", "value_digest") AS
SELECT "r1"."assembly", "r1"."package", "r1"."path", "r1"."start", "r1"."value", "r1"."value_digest"
FROM "qti_queries"."placed_filter" AS "r1";

CREATE VIEW "__qti_queries"."placed_include_path" ("package", "path", "start") AS
SELECT "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."placed_include_path" AS "r1";

CREATE VIEW "__qti_queries"."placed_math_rank_node" ("assembly", "instance", "kind", "kind_name", "package", "parent", "path", "start") AS
SELECT "r1"."assembly", "r1"."instance", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."parent", "r1"."path", "r1"."start"
FROM "qti_queries"."placed_math_rank_node" AS "r1";

CREATE VIEW "__qti_queries"."placed_math_rank_step" ("assembly", "instance", "kind", "kind_name", "package", "parent", "parent_rank", "rank", "start") AS
SELECT "r1"."assembly", "r1"."instance", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."parent", "r1"."parent_rank", "r1"."rank", "r1"."start"
FROM "qti_queries"."placed_math_rank_step" AS "r1";

CREATE VIEW "__qti_queries"."placed_reference" ("assembly", "instance", "package", "start", "token_digest") AS
SELECT "r1"."assembly", "r1"."instance", "r1"."package", "r1"."start", "r1"."token_digest"
FROM "qti_queries"."placed_reference" AS "r1";

CREATE VIEW "__qti_queries"."placed_reference_site" ("assembly", "attribute", "attribute_name", "identifier", "instance", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."instance", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."placed_reference_site" AS "r1";

CREATE VIEW "__qti_queries"."placed_share_ranks" ("assembly", "instance", "package", "share_rank", "start", "target_rank") AS
SELECT "r1"."assembly", "r1"."instance", "r1"."package", "r1"."share_rank", "r1"."start", "r1"."target_rank"
FROM "qti_queries"."placed_share_ranks" AS "r1";

CREATE VIEW "__qti_queries"."placed_single_binding_most" ("assembly", "attribute", "attribute_name", "instance", "most_value", "package", "start") AS
SELECT "r1"."assembly", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."instance", "r1"."most_value", "r1"."package", "r1"."start"
FROM "qti_queries"."placed_single_binding_most" AS "r1";

CREATE VIEW "__qti_queries"."placed_single_response_gap" ("assembly", "gap", "gap_path", "instance", "package", "start") AS
SELECT "r1"."assembly", "r1"."gap", "r1"."gap_path", "r1"."instance", "r1"."package", "r1"."start"
FROM "qti_queries"."placed_single_response_gap" AS "r1";

CREATE VIEW "__qti_queries"."placed_test_reference" ("assembly", "attribute", "attribute_name", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."placed_test_reference" AS "r1";

CREATE VIEW "__qti_queries"."placed_variable_base" ("assembly", "attribute", "attribute_name", "base_type", "base_type_name", "instance", "package", "path", "start", "value_base", "value_base_name") AS
SELECT "r1"."assembly", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."base_type", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."instance", "r1"."package", "r1"."path", "r1"."start", "r1"."value_base", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."value_base" + 1]::"pg_catalog"."text"
FROM "qti_queries"."placed_variable_base" AS "r1";

CREATE VIEW "__qti_queries"."placed_variable_cardinality" ("assembly", "attribute", "attribute_name", "cardinality", "cardinality_name", "decl_cardinality", "decl_cardinality_name", "instance", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."cardinality", ("qti"."__value_cardinality_names_wzwznoycgf"())["r1"."cardinality" + 1]::"pg_catalog"."text", "r1"."decl_cardinality", ("qti"."__cardinality_names_kqiairsoqa"())["r1"."decl_cardinality" + 1]::"pg_catalog"."text", "r1"."instance", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."placed_variable_cardinality" AS "r1";

CREATE VIEW "__qti_queries"."placed_variable_declaration" ("base_type", "base_type_name", "decl_path", "decl_start", "package") AS
SELECT "r1"."base_type", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."decl_path", "r1"."decl_start", "r1"."package"
FROM "qti_queries"."placed_variable_declaration" AS "r1";

CREATE VIEW "__qti_queries"."placed_variable_ref_declaration" ("assembly", "attribute", "attribute_name", "base_type", "base_type_name", "cardinality", "cardinality_name", "declaration", "declaration_kind", "declaration_kind_name", "identifier", "instance", "kind", "kind_name", "language", "language_name", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."base_type", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."cardinality", ("qti"."__value_cardinality_names_wzwznoycgf"())["r1"."cardinality" + 1]::"pg_catalog"."text", "r1"."declaration", "r1"."declaration_kind", ("qti"."__declaration_kind_names_o62wpad2p7"())["r1"."declaration_kind" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."instance", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."language", ("qti"."__language_names_pvmtywwssv"())["r1"."language" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."placed_variable_ref_declaration" AS "r1";

CREATE VIEW "__qti_queries"."placed_weighted_variable" ("assembly", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."placed_weighted_variable" AS "r1";

CREATE VIEW "__qti_queries"."pointer_parse" ("package", "path", "start", "value", "value_digest") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."value", "r1"."value_digest"
FROM "qti_queries"."pointer_parse" AS "r1";

CREATE VIEW "__qti_queries"."prefixed_declaration" ("assembly", "attribute", "attribute_name", "declaration_kind", "declaration_kind_name", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."declaration_kind", ("qti"."__declaration_kind_names_o62wpad2p7"())["r1"."declaration_kind" + 1]::"pg_catalog"."text", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."prefixed_declaration" AS "r1";

CREATE VIEW "__qti_queries"."prefixed_map_response" ("package", "scope", "scope_path", "variable") AS
SELECT "r1"."package", "r1"."scope", "r1"."scope_path", "r1"."variable"
FROM "qti_queries"."prefixed_map_response" AS "r1";

CREATE VIEW "__qti_queries"."prefixed_map_response_point" ("package", "scope", "scope_path", "variable") AS
SELECT "r1"."package", "r1"."scope", "r1"."scope_path", "r1"."variable"
FROM "qti_queries"."prefixed_map_response_point" AS "r1";

CREATE VIEW "__qti_queries"."printed_integer_base_type" ("attribute", "attribute_name", "base_type", "base_type_name", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."base_type", ("qti"."__base_type_names_ok3nu5nck4"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."printed_integer_base_type" AS "r1";

CREATE VIEW "__qti_queries"."printed_integer_cardinality" ("attribute", "attribute_name", "cardinality", "cardinality_name", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."cardinality", ("qti"."__cardinality_names_kqiairsoqa"())["r1"."cardinality" + 1]::"pg_catalog"."text", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."printed_integer_cardinality" AS "r1";

CREATE VIEW "__qti_queries"."processing_node" ("kind", "kind_name", "language", "language_name", "package", "parent", "parent_kind", "parent_kind_name", "path", "start") AS
SELECT "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."language", ("qti"."__language_names_pvmtywwssv"())["r1"."language" + 1]::"pg_catalog"."text", "r1"."package", "r1"."parent", "r1"."parent_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."parent_kind" + 1]::"pg_catalog"."text", "r1"."path", "r1"."start"
FROM "qti_queries"."processing_node" AS "r1";

CREATE VIEW "__qti_queries"."quotation_end" ("end", "package", "path", "start") AS
SELECT "r1"."end", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."quotation_end" AS "r1";

CREATE VIEW "__qti_queries"."read_include" ("package", "path", "start") AS
SELECT "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."read_include" AS "r1";

CREATE VIEW "__qti_queries"."record_set_value" ("package", "path", "start") AS
SELECT "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."record_set_value" AS "r1";

CREATE VIEW "__qti_queries"."referable_name" ("attribute", "attribute_name", "identifier", "kind", "kind_name", "package", "path") AS
SELECT "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path"
FROM "qti_queries"."referable_name" AS "r1";

CREATE VIEW "__qti_queries"."reference_lexical" ("lead", "lexical", "name", "name_name", "package", "params", "path", "start", "target", "trail") AS
SELECT "r1"."lead", "r1"."lexical", "r1"."name", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."name" + 1]::"pg_catalog"."text", "r1"."package", "r1"."params", "r1"."path", "r1"."start", "r1"."target", "r1"."trail"
FROM "qti_queries"."reference_lexical" AS "r1";

CREATE VIEW "__qti_queries"."required_parts" ("package", "path", "section", "select", "required") AS
SELECT "r1"."package", "r1"."path", "r1"."section", "r1"."select", "r1"."required"
FROM "qti_queries"."required_parts" AS "r1";

CREATE VIEW "__qti_queries"."required_ssml_property" ("member", "name_digest", "package", "path", "start") AS
SELECT "r1"."member", "r1"."name_digest", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."required_ssml_property" AS "r1";

CREATE VIEW "__qti_queries"."requirement_met" ("package", "path", "section") AS
SELECT "r1"."package", "r1"."path", "r1"."section"
FROM "qti_queries"."requirement_met" AS "r1";

CREATE VIEW "__qti_queries"."resolved_branch_rule" ("assembly", "instance", "package", "start") AS
SELECT "r1"."assembly", "r1"."instance", "r1"."package", "r1"."start"
FROM "qti_queries"."resolved_branch_rule" AS "r1";

CREATE VIEW "__qti_queries"."resource_file_document" ("package", "path", "resource") AS
SELECT "r1"."package", "r1"."path", "r1"."resource"
FROM "qti_queries"."resource_file_document" AS "r1";

CREATE VIEW "__qti_queries"."resource_file_outside" ("package", "path", "resource", "target_digest") AS
SELECT "r1"."package", "r1"."path", "r1"."resource", "r1"."target_digest"
FROM "qti_queries"."resource_file_outside" AS "r1";

CREATE VIEW "__qti_queries"."resource_file_path" ("package", "path", "resource", "target") AS
SELECT "r1"."package", "r1"."path", "r1"."resource", "r1"."target"
FROM "qti_queries"."resource_file_path" AS "r1";

CREATE VIEW "__qti_queries"."rooted_declaration" ("declaration_kind", "declaration_kind_name", "identifier", "package", "path", "root_kind", "root_kind_name", "start") AS
SELECT "r1"."declaration_kind", ("qti"."__declaration_kind_names_o62wpad2p7"())["r1"."declaration_kind" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."package", "r1"."path", "r1"."root_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."root_kind" + 1]::"pg_catalog"."text", "r1"."start"
FROM "qti_queries"."rooted_declaration" AS "r1";

CREATE VIEW "__qti_queries"."scope_duration_read" ("assembly", "attribute", "attribute_name", "base_type", "base_type_name", "cardinality", "cardinality_name", "instance", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."base_type", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."cardinality", ("qti"."__value_cardinality_names_wzwznoycgf"())["r1"."cardinality" + 1]::"pg_catalog"."text", "r1"."instance", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."scope_duration_read" AS "r1";

CREATE VIEW "__qti_queries"."scope_node" ("cell", "chosen", "element_children", "elements", "inherited", "inherited_name", "kind", "kind_name", "own", "own_name", "package", "parent", "parent_kind", "parent_kind_name", "passes", "passes_name", "path", "received", "received_name", "start", "state", "state_name") AS
SELECT "r1"."cell", "r1"."chosen", "r1"."element_children", "r1"."elements", "r1"."inherited", ("qti"."__align_direction_names_vluq7iazdg"())["r1"."inherited" + 1]::"pg_catalog"."text", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."own", ("qti"."__align_direction_names_vluq7iazdg"())["r1"."own" + 1]::"pg_catalog"."text", "r1"."package", "r1"."parent", "r1"."parent_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."parent_kind" + 1]::"pg_catalog"."text", "r1"."passes", ("qti"."__align_state_names_ffk37slxn3"())["r1"."passes" + 1]::"pg_catalog"."text", "r1"."path", "r1"."received", ("qti"."__align_state_names_ffk37slxn3"())["r1"."received" + 1]::"pg_catalog"."text", "r1"."start", "r1"."state", ("qti"."__align_state_names_ffk37slxn3"())["r1"."state" + 1]::"pg_catalog"."text"
FROM "qti_queries"."scope_node" AS "r1";

CREATE VIEW "__qti_queries"."scoped_dir" ("direction", "direction_name", "own", "own_name", "package", "path", "start") AS
SELECT "r1"."direction", ("qti"."__align_direction_names_vluq7iazdg"())["r1"."direction" + 1]::"pg_catalog"."text", "r1"."own", ("qti"."__align_direction_names_vluq7iazdg"())["r1"."own" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."scoped_dir" AS "r1";

CREATE VIEW "__qti_queries"."section_replacement" ("package", "path", "section") AS
SELECT "r1"."package", "r1"."path", "r1"."section"
FROM "qti_queries"."section_replacement" AS "r1";

CREATE VIEW "__qti_queries"."section_selection" ("package", "path", "section", "select") AS
SELECT "r1"."package", "r1"."path", "r1"."section", "r1"."select"
FROM "qti_queries"."section_selection" AS "r1";

CREATE VIEW "__qti_queries"."section_shuffle" ("package", "path", "section") AS
SELECT "r1"."package", "r1"."path", "r1"."section"
FROM "qti_queries"."section_shuffle" AS "r1";

CREATE VIEW "__qti_queries"."selection_without_replacement" ("package", "path", "section") AS
SELECT "r1"."package", "r1"."path", "r1"."section"
FROM "qti_queries"."selection_without_replacement" AS "r1";

CREATE VIEW "__qti_queries"."session_control" ("package", "path", "scope", "setting", "setting_name", "value") AS
SELECT "r1"."package", "r1"."path", "r1"."scope", "r1"."setting", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."setting" + 1]::"pg_catalog"."text", "r1"."value"
FROM "qti_queries"."session_control" AS "r1";

CREATE VIEW "__qti_queries"."set_cardinality" ("cardinality", "cardinality_name", "element_children", "package", "path", "start") AS
SELECT "r1"."cardinality", ("qti"."__cardinality_names_kqiairsoqa"())["r1"."cardinality" + 1]::"pg_catalog"."text", "r1"."element_children", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."set_cardinality" AS "r1";

CREATE VIEW "__qti_queries"."set_field_name" ("identifier", "package", "path", "set", "start") AS
SELECT "r1"."identifier", "r1"."package", "r1"."path", "r1"."set", "r1"."start"
FROM "qti_queries"."set_field_name" AS "r1";

CREATE VIEW "__qti_queries"."share_fragment_value" ("id", "package", "path", "start", "value", "value_digest") AS
SELECT "r1"."id", "r1"."package", "r1"."path", "r1"."start", "r1"."value", "r1"."value_digest"
FROM "qti_queries"."share_fragment_value" AS "r1";

CREATE VIEW "__qti_queries"."share_ranks" ("package", "path", "share_rank", "start", "target_rank") AS
SELECT "r1"."package", "r1"."path", "r1"."share_rank", "r1"."start", "r1"."target_rank"
FROM "qti_queries"."share_ranks" AS "r1";

CREATE VIEW "__qti_queries"."share_source" ("package", "path", "start", "value", "value_digest") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."value", "r1"."value_digest"
FROM "qti_queries"."share_source" AS "r1";

CREATE VIEW "__qti_queries"."single_binding_most" ("attribute", "attribute_name", "most_value", "package", "path", "start") AS
SELECT "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."most_value", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."single_binding_most" AS "r1";

CREATE VIEW "__qti_queries"."single_response_gap" ("gap", "gap_path", "package", "path", "start") AS
SELECT "r1"."gap", "r1"."gap_path", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."single_response_gap" AS "r1";

CREATE VIEW "__qti_queries"."slider_bounds" ("lower", "package", "path", "start", "upper") AS
SELECT "r1"."lower", "r1"."package", "r1"."path", "r1"."start", "r1"."upper"
FROM "qti_queries"."slider_bounds" AS "r1";

CREATE VIEW "__qti_queries"."sole_reading" ("assembly", "attribute", "attribute_name", "instance", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."instance", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."sole_reading" AS "r1";

CREATE VIEW "__qti_queries"."srcset_form" ("kind", "kind_name", "lexical", "name", "name_name", "package", "path", "start", "token_text", "trail") AS
SELECT "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."lexical", "r1"."name", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."name" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start", "r1"."token_text", "r1"."trail"
FROM "qti_queries"."srcset_form" AS "r1";

CREATE VIEW "__qti_queries"."ssml_scope_node" ("fragment", "kind", "kind_name", "package", "parent", "path", "start") AS
SELECT "r1"."fragment", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."parent", "r1"."path", "r1"."start"
FROM "qti_queries"."ssml_scope_node" AS "r1";

CREATE VIEW "__qti_queries"."structure_naming" ("package", "path", "start") AS
SELECT "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."structure_naming" AS "r1";

CREATE VIEW "__qti_queries"."structure_node" ("end", "identifier", "kind", "kind_name", "package", "parent", "path", "start") AS
SELECT "r1"."end", "r1"."identifier", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."parent", "r1"."path", "r1"."start"
FROM "qti_queries"."structure_node" AS "r1";

CREATE VIEW "__qti_queries"."table_header" ("id", "id_digest", "package", "path", "start", "table") AS
SELECT "r1"."id", "r1"."id_digest", "r1"."package", "r1"."path", "r1"."start", "r1"."table"
FROM "qti_queries"."table_header" AS "r1";

CREATE VIEW "__qti_queries"."template_processing" ("package", "path", "value") AS
SELECT "r1"."package", "r1"."path", "r1"."value"
FROM "qti_queries"."template_processing" AS "r1";

CREATE VIEW "__qti_queries"."template_ref_base_type" ("attribute", "attribute_name", "base_type", "base_type_name", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."base_type", ("qti"."__base_type_names_ok3nu5nck4"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."template_ref_base_type" AS "r1";

CREATE VIEW "__qti_queries"."template_ref_cardinality" ("attribute", "attribute_name", "cardinality", "cardinality_name", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."cardinality", ("qti"."__cardinality_names_kqiairsoqa"())["r1"."cardinality" + 1]::"pg_catalog"."text", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."template_ref_cardinality" AS "r1";

CREATE VIEW "__qti_queries"."test_identifier" ("kind", "kind_name", "package", "path", "start", "value", "value_digest") AS
SELECT "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start", "r1"."value", "r1"."value_digest"
FROM "qti_queries"."test_identifier" AS "r1";

CREATE VIEW "__qti_queries"."test_identifier_bytes" ("bytes", "package", "path", "start") AS
SELECT "r1"."bytes", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."test_identifier_bytes" AS "r1";

CREATE VIEW "__qti_queries"."test_member" ("document", "item", "package", "part", "path", "section", "start", "test") AS
SELECT "r1"."document", "r1"."item", "r1"."package", "r1"."part", "r1"."path", "r1"."section", "r1"."start", "r1"."test"
FROM "qti_queries"."test_member" AS "r1";

CREATE VIEW "__qti_queries"."test_part" ("navigation", "navigation_name", "package", "part", "path", "start", "submission", "submission_name", "test") AS
SELECT "r1"."navigation", ("qti"."__navigation_mode_names_uhf5rddglr"())["r1"."navigation" + 1]::"pg_catalog"."text", "r1"."package", "r1"."part", "r1"."path", "r1"."start", "r1"."submission", ("qti"."__submission_mode_names_ihmg3iyv22"())["r1"."submission" + 1]::"pg_catalog"."text", "r1"."test"
FROM "qti_queries"."test_part" AS "r1";

CREATE VIEW "__qti_queries"."test_reading" ("assembly", "attribute", "attribute_name", "package", "path", "scope", "scope_instance", "start", "variable") AS
SELECT "r1"."assembly", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."scope", "r1"."scope_instance", "r1"."start", "r1"."variable"
FROM "qti_queries"."test_reading" AS "r1";

CREATE VIEW "__qti_queries"."test_root" ("package", "path", "start", "test") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."test"
FROM "qti_queries"."test_root" AS "r1";

CREATE VIEW "__qti_queries"."text_reference_string_value" ("lead", "package", "params", "path", "start", "string_value", "target", "trail") AS
SELECT "r1"."lead", "r1"."package", "r1"."params", "r1"."path", "r1"."start", "r1"."string_value", "r1"."target", "r1"."trail"
FROM "qti_queries"."text_reference_string_value" AS "r1";

CREATE VIEW "__qti_queries"."tolerance_token" ("at", "package", "path", "start", "token") AS
SELECT "r1"."at", "r1"."package", "r1"."path", "r1"."start", "r1"."token"
FROM "qti_queries"."tolerance_token" AS "r1";

CREATE VIEW "__qti_queries"."trimmed_mark" ("fragment", "package", "path", "start", "value_digest") AS
SELECT "r1"."fragment", "r1"."package", "r1"."path", "r1"."start", "r1"."value_digest"
FROM "qti_queries"."trimmed_mark" AS "r1";

CREATE VIEW "__qti_queries"."typed_href" ("package", "path", "scope", "scope_name", "start", "type", "type_name") AS
SELECT "r1"."package", "r1"."path", "r1"."scope", ("qti"."__href_scope_names_y4pbuo4f5q"())["r1"."scope" + 1]::"pg_catalog"."text", "r1"."start", "r1"."type", ("qti"."__resource_type_names_2tbbvn3ion"())["r1"."type" + 1]::"pg_catalog"."text"
FROM "qti_queries"."typed_href" AS "r1";

CREATE VIEW "__qti_queries"."typed_path" ("package", "path", "start", "target", "type", "type_name") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."target", "r1"."type", ("qti"."__resource_type_names_2tbbvn3ion"())["r1"."type" + 1]::"pg_catalog"."text"
FROM "qti_queries"."typed_path" AS "r1";

CREATE VIEW "__qti_queries"."typed_value_text" ("base_type", "base_type_name", "cardinality", "cardinality_name", "package", "path", "start", "text") AS
SELECT "r1"."base_type", ("qti"."__base_type_names_ok3nu5nck4"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."cardinality", ("qti"."__cardinality_names_kqiairsoqa"())["r1"."cardinality" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start", "r1"."text"
FROM "qti_queries"."typed_value_text" AS "r1";

CREATE VIEW "__qti_queries"."unassembled_reference" ("package", "path", "token_digest") AS
SELECT "r1"."package", "r1"."path", "r1"."token_digest"
FROM "qti_queries"."unassembled_reference" AS "r1";

CREATE VIEW "__qti_queries"."unclaimed_name" ("identifier", "package", "path") AS
SELECT "r1"."identifier", "r1"."package", "r1"."path"
FROM "qti_queries"."unclaimed_name" AS "r1";

CREATE VIEW "__qti_queries"."unknown_operand_base" ("assembly", "instance", "operator", "package", "path") AS
SELECT "r1"."assembly", "r1"."instance", "r1"."operator", "r1"."package", "r1"."path"
FROM "qti_queries"."unknown_operand_base" AS "r1";

CREATE VIEW "__qti_queries"."unknown_tail_base" ("assembly", "instance", "operator", "package", "path") AS
SELECT "r1"."assembly", "r1"."instance", "r1"."operator", "r1"."package", "r1"."path"
FROM "qti_queries"."unknown_tail_base" AS "r1";

CREATE VIEW "__qti_queries"."unplaced_include" ("cause", "cause_name", "package", "path", "start") AS
SELECT "r1"."cause", ("qti"."__unplaced_cause_names_p5tit5zgq3"())["r1"."cause" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."unplaced_include" AS "r1";

CREATE VIEW "__qti_queries"."unread_type_href" ("package", "path", "start", "target") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."target"
FROM "qti_queries"."unread_type_href" AS "r1";

CREATE VIEW "__qti_queries"."untargeted_item_ref" ("package", "path", "start", "target") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."target"
FROM "qti_queries"."untargeted_item_ref" AS "r1";

CREATE VIEW "__qti_queries"."untyped_unweighted" ("assembly", "base_type", "base_type_name", "instance", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."base_type", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."instance", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."untyped_unweighted" AS "r1";

CREATE VIEW "__qti_queries"."untyped_weighted" ("assembly", "base_type", "base_type_name", "instance", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."base_type", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."instance", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."untyped_weighted" AS "r1";

CREATE VIEW "__qti_queries"."unweighted_read" ("assembly", "base_type", "base_type_name", "cardinality", "cardinality_name", "element_base", "element_base_name", "element_cardinality", "element_cardinality_name", "instance", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."base_type", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."cardinality", ("qti"."__value_cardinality_names_wzwznoycgf"())["r1"."cardinality" + 1]::"pg_catalog"."text", "r1"."element_base", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."element_base" + 1]::"pg_catalog"."text", "r1"."element_cardinality", ("qti"."__value_cardinality_names_wzwznoycgf"())["r1"."element_cardinality" + 1]::"pg_catalog"."text", "r1"."instance", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."unweighted_read" AS "r1";

CREATE VIEW "__qti_queries"."usage_value_base_type" ("base_type", "base_type_name", "package", "path", "start", "text") AS
SELECT "r1"."base_type", ("qti"."__base_type_names_ok3nu5nck4"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start", "r1"."text"
FROM "qti_queries"."usage_value_base_type" AS "r1";

CREATE VIEW "__qti_queries"."variable_mapping" ("package", "path", "ref", "source", "start", "target") AS
SELECT "r1"."package", "r1"."path", "r1"."ref", "r1"."source", "r1"."start", "r1"."target"
FROM "qti_queries"."variable_mapping" AS "r1";

CREATE VIEW "__qti_queries"."weight_value" ("identifier", "package", "path", "ref", "start", "value") AS
SELECT "r1"."identifier", "r1"."package", "r1"."path", "r1"."ref", "r1"."start", "r1"."value"
FROM "qti_queries"."weight_value" AS "r1";

CREATE VIEW "__qti_queries"."weighted_base_type" ("package", "path", "start", "value", "value_digest") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."value", "r1"."value_digest"
FROM "qti_queries"."weighted_base_type" AS "r1";

CREATE VIEW "__qti_queries"."weighted_read" ("assembly", "base_type", "base_type_name", "cardinality", "cardinality_name", "element_base", "element_base_name", "element_cardinality", "element_cardinality_name", "instance", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."base_type", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."cardinality", ("qti"."__value_cardinality_names_wzwznoycgf"())["r1"."cardinality" + 1]::"pg_catalog"."text", "r1"."element_base", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."element_base" + 1]::"pg_catalog"."text", "r1"."element_cardinality", ("qti"."__value_cardinality_names_wzwznoycgf"())["r1"."element_cardinality" + 1]::"pg_catalog"."text", "r1"."instance", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."weighted_read" AS "r1";

CREATE VIEW "__qti_queries"."weighted_variable" ("package", "path", "start") AS
SELECT "r1"."package", "r1"."path", "r1"."start"
FROM "qti_queries"."weighted_variable" AS "r1";

CREATE VIEW "__qti_views"."catalog_id" ("id", "id_digest", "package", "path", "start") AS
SELECT "r1"."id", "r1"."id_digest", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_views"."catalog_id" AS "r1";

CREATE VIEW "__qti_views"."cell_table" ("package", "path", "start", "table") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."table"
FROM "qti_views"."cell_table" AS "r1";

CREATE VIEW "__qti_views"."declaration_base_type" ("code", "code_name", "kind", "kind_name", "package", "path", "start", "value_base", "value_base_name") AS
SELECT "r1"."code", ("qti"."__base_type_names_ok3nu5nck4"())["r1"."code" + 1]::"pg_catalog"."text", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start", "r1"."value_base", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."value_base" + 1]::"pg_catalog"."text"
FROM "qti_views"."declaration_base_type" AS "r1";

CREATE VIEW "__qti_views"."declaration_cardinality" ("code", "code_name", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."code", ("qti"."__cardinality_names_kqiairsoqa"())["r1"."code" + 1]::"pg_catalog"."text", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_views"."declaration_cardinality" AS "r1";

CREATE VIEW "__qti_views"."declaration_name" ("cardinality", "cardinality_name", "declaration_kind", "declaration_kind_name", "identifier", "package", "path", "start") AS
SELECT "r1"."cardinality", ("qti"."__cardinality_names_kqiairsoqa"())["r1"."cardinality" + 1]::"pg_catalog"."text", "r1"."declaration_kind", ("qti"."__declaration_kind_names_o62wpad2p7"())["r1"."declaration_kind" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_views"."declaration_name" AS "r1";

CREATE VIEW "__qti_views"."declared_identifier_text" ("package", "path", "start", "text") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."text"
FROM "qti_views"."declared_identifier_text" AS "r1";

CREATE VIEW "__qti_views"."header_token" ("at", "package", "path", "start", "token", "token_digest") AS
SELECT "r1"."at", "r1"."package", "r1"."path", "r1"."start", "r1"."token", "r1"."token_digest"
FROM "qti_views"."header_token" AS "r1";

CREATE VIEW "__qti_views"."id_value" ("admitted", "id_digest", "owner", "package", "path", "start") AS
SELECT "r1"."admitted", "r1"."id_digest", "r1"."owner", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_views"."id_value" AS "r1";

CREATE VIEW "__qti_views"."lang_value" ("package", "path", "scope", "start", "value") AS
SELECT "r1"."package", "r1"."path", "r1"."scope", "r1"."start", "r1"."value"
FROM "qti_views"."lang_value" AS "r1";

CREATE VIEW "__qti_views"."located_template" ("package", "path", "template") AS
SELECT "r1"."package", "r1"."path", "r1"."template"
FROM "qti_views"."located_template" AS "r1";

CREATE VIEW "__qti_views"."lookup_value" ("name", "name_name", "package", "path", "start", "value") AS
SELECT "r1"."name", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."name" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start", "r1"."value"
FROM "qti_views"."lookup_value" AS "r1";

CREATE VIEW "__qti_views"."map_key" ("key", "package", "path", "start") AS
SELECT "r1"."key", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_views"."map_key" AS "r1";

CREATE VIEW "__qti_views"."mastery_value" ("package", "path", "start", "value") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."value"
FROM "qti_views"."mastery_value" AS "r1";

CREATE VIEW "__qti_views"."named_declaration" ("declaration_kind", "declaration_kind_name", "identifier", "package", "path", "start") AS
SELECT "r1"."declaration_kind", ("qti"."__declaration_kind_names_o62wpad2p7"())["r1"."declaration_kind" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."package", "r1"."path", "r1"."start"
FROM "qti_views"."named_declaration" AS "r1";

CREATE VIEW "__qti_views"."normal_maximum" ("package", "path", "start", "value") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."value"
FROM "qti_views"."normal_maximum" AS "r1";

CREATE VIEW "__qti_views"."normal_minimum" ("package", "path", "start", "value") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."value"
FROM "qti_views"."normal_minimum" AS "r1";

CREATE VIEW "__qti_views"."placed_variable_ref_node" ("assembly", "attribute", "attribute_name", "base_type", "base_type_name", "cardinality", "cardinality_name", "identifier", "instance", "kind", "kind_name", "language", "language_name", "package", "path", "resolution", "resolution_name", "root_kind", "root_kind_name", "start") AS
SELECT "r1"."assembly", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."base_type", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."cardinality", ("qti"."__value_cardinality_names_wzwznoycgf"())["r1"."cardinality" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."instance", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."language", ("qti"."__language_names_pvmtywwssv"())["r1"."language" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."resolution", ("qti"."__reference_resolution_names_zfbhfhou4v"())["r1"."resolution" + 1]::"pg_catalog"."text", "r1"."root_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."root_kind" + 1]::"pg_catalog"."text", "r1"."start"
FROM "qti_views"."placed_variable_ref_node" AS "r1";

CREATE VIEW "__qti_views"."record_node" ("kind", "kind_name", "package", "parent", "parent_kind", "parent_kind_name", "path", "start", "string_value") AS
SELECT "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."parent", "r1"."parent_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."parent_kind" + 1]::"pg_catalog"."text", "r1"."path", "r1"."start", "r1"."string_value"
FROM "qti_views"."record_node" AS "r1";

CREATE VIEW "__qti_views"."ssml_value" ("fragment", "kind", "kind_name", "package", "path", "start", "value_digest") AS
SELECT "r1"."fragment", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start", "r1"."value_digest"
FROM "qti_views"."ssml_value" AS "r1";

CREATE VIEW "__qti_views"."typed_declaration_name" ("base_type", "base_type_name", "declaration_kind", "declaration_kind_name", "identifier", "package", "path", "start", "value_base", "value_base_name") AS
SELECT "r1"."base_type", ("qti"."__base_type_names_ok3nu5nck4"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."declaration_kind", ("qti"."__declaration_kind_names_o62wpad2p7"())["r1"."declaration_kind" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."package", "r1"."path", "r1"."start", "r1"."value_base", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."value_base" + 1]::"pg_catalog"."text"
FROM "qti_views"."typed_declaration_name" AS "r1";

CREATE VIEW "__qti_views"."variable_ref_node" ("after", "attribute", "attribute_name", "before", "identifier", "kind", "kind_name", "language", "language_name", "lexical", "package", "path", "root_kind", "root_kind_name", "start") AS
SELECT "r1"."after", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."before", "r1"."identifier", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."language", ("qti"."__language_names_pvmtywwssv"())["r1"."language" + 1]::"pg_catalog"."text", "r1"."lexical", "r1"."package", "r1"."path", "r1"."root_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."root_kind" + 1]::"pg_catalog"."text", "r1"."start"
FROM "qti_views"."variable_ref_node" AS "r1";

GRANT :"qti_queries__author" TO :"qti_queries__author_app" WITH INHERIT FALSE, SET TRUE;

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
GRANT USAGE ON SCHEMA "qti", "qti_views", "qti_queries", "__qti_queries", "__qti", "__qti_views" TO :"qti_queries__author";

GRANT SELECT ON TABLE "__qti_queries"."anchored_id", "__qti_queries"."anchored_name", "__qti_queries"."apply_argument", "__qti_queries"."apply_argument_pair", "__qti_queries"."area_mapping_base_type", "__qti_queries"."area_mapping_cardinality", "__qti_queries"."aria_bounds", "__qti_queries"."arity_floor", "__qti_queries"."assembled_catalog", "__qti"."assembled_document", "__qti_queries"."assembled_id", "__qti_queries"."assembled_name", "__qti_queries"."assembled_replaceable", "__qti"."attribute", "__qti"."attribute_entity", "__qti_queries"."bank_member", "__qti_queries"."base_type_cardinality", "__qti_queries"."binary_math_operator", "__qti_queries"."binding_base_type_node", "__qti_queries"."binding_cardinality_node", "__qti"."binding_name", "__qti_queries"."bound_range", "__qti"."bound_variable", "__qti_queries"."bounded_selection", "__qti_queries"."branch_resolution", "__qti"."candidate_path", "__qti_views"."catalog_id", "__qti"."catalog_scope", "__qti_queries"."catalog_scope_node", "__qti_queries"."cell_child", "__qti"."cell_leaf", "__qti_queries"."cell_leaf_node", "__qti_views"."cell_table", "__qti_queries"."cell_token", "__qti"."choice", "__qti"."choice_interaction", "__qti_queries"."choice_node", "__qti_queries"."choice_or_hottext", "__qti_queries"."choice_space_name", "__qti_queries"."cn_count", "__qti"."cn_part_text", "__qti"."comment", "__qti"."context_ref", "__qti_queries"."copied_id", "__qti"."count_bound", "__qti_queries"."count_bound_node", "__qti"."data_ssml", "__qti"."data_ssml_member", "__qti"."data_ssml_property", "__qti_views"."declaration_base_type", "__qti_views"."declaration_cardinality", "__qti_views"."declaration_name", "__qti_queries"."declaration_table", "__qti_views"."declared_identifier_text", "__qti_queries"."declared_placement", "__qti_queries"."deliverable_test", "__qti_queries"."dependency", "__qti_queries"."dependency_resolved", "__qti_queries"."described_assembled_lang", "__qti_queries"."described_lang", "__qti"."doctype", "__qti"."document", "__qti"."document_id", "__qti"."element_type", "__qti"."encoding_decl", "__qti"."entry", "__qti_queries"."entry_file_target", "__qti"."expression", "__qti_queries"."expression_attribute", "__qti_queries"."expression_node", "__qti_queries"."expression_operand", "__qti"."feedback_ref", "__qti_queries"."feedback_ref_base_type", "__qti_queries"."feedback_ref_cardinality", "__qti_queries"."field_value_text", "__qti"."file", "__qti"."file_outside", "__qti"."file_path", "__qti_queries"."filtered_section", "__qti_queries"."forbidden_resource_type", "__qti_queries"."forward_branch_rule", "__qti"."fragment_context_name", "__qti"."fragment_context_ref", "__qti"."fragment_feedback_name", "__qti"."fragment_feedback_ref", "__qti"."fragment_printed_name", "__qti"."fragment_printed_ref", "__qti"."fragment_scope", "__qti"."fragment_template_name", "__qti"."fragment_template_ref", "__qti_queries"."free_mapping_target", "__qti_queries"."head_document", "__qti_queries"."head_qualifier_pair", "__qti_views"."header_token", "__qti_queries"."held_type", "__qti_queries"."hotspot_node", "__qti"."hottext", "__qti_queries"."hottext_node", "__qti_queries"."id_binding", "__qti_views"."id_value", "__qti"."identity_text", "__qti_queries"."identity_text_node", "__qti"."idref", "__qti"."idref_target", "__qti"."inclusion", "__qti"."instance", "__qti_queries"."instance_document", "__qti_queries"."integer_aggregate", "__qti"."interaction", "__qti"."interaction_attribute", "__qti_queries"."interaction_node", "__qti_queries"."interpolated_lookup", "__qti_queries"."item_mapping", "__qti"."item_mode", "__qti_queries"."item_read", "__qti_queries"."item_ref_category", "__qti"."item_ref_document", "__qti"."item_ref_href", "__qti_queries"."item_ref_section", "__qti_queries"."item_ref_table", "__qti_queries"."item_ref_target", "__qti_queries"."item_scoped_reading", "__qti_queries"."item_template_default", "__qti_queries"."judged_placed_idref", "__qti_queries"."known_operand_base", "__qti_queries"."known_operand_cardinality", "__qti"."label_use", "__qti_views"."lang_value", "__qti_queries"."late_submission", "__qti_queries"."least_choice_bound", "__qti"."least_count", "__qti_queries"."least_count_node", "__qti_queries"."least_one_apply", "__qti_queries"."least_two_apply", "__qti"."link_reading", "__qti_queries"."link_scope", "__qti_queries"."link_spelling", "__qti_queries"."listed_identifier", "__qti_queries"."listed_lang", "__qti_queries"."listed_title", "__qti"."literal", "__qti"."literal_typed", "__qti_views"."located_template", "__qti_queries"."lookup_table_cardinality", "__qti_views"."lookup_value", "__qti_queries"."lookup_value_type", "__qti_views"."map_key", "__qti_queries"."map_key_type", "__qti_queries"."mapped_response_declaration", "__qti_queries"."mapping_base_type", "__qti_queries"."mapping_cardinality", "__qti_queries"."mastery_ceiling", "__qti_queries"."mastery_floor", "__qti_views"."mastery_value", "__qti_queries"."matched_identifier", "__qti_queries"."matched_title", "__qti"."math_action", "__qti_queries"."math_action_node", "__qti"."math_align_group", "__qti"."math_align_scope", "__qti"."math_cell", "__qti"."math_cn", "__qti_queries"."math_operand", "__qti"."math_rank", "__qti_queries"."math_rank_node", "__qti_queries"."math_rank_step", "__qti_queries"."max_attempts", "__qti_queries"."max_time", "__qti"."media", "__qti_queries"."min_time", "__qti_queries"."most_choice_bound", "__qti"."most_count", "__qti_queries"."most_count_node", "__qti_queries"."most_one_argument", "__qti_queries"."most_two_argument_pair", "__qti"."named", "__qti_views"."named_declaration", "__qti_queries"."named_item_ref", "__qti"."namespace", "__qti"."node", "__qti_queries"."non_container_strings", "__qti_views"."normal_maximum", "__qti_views"."normal_minimum", "__qti"."numbered_reading", "__qti_queries"."numbered_spelling", "__qti_queries"."numbered_target", "__qti_queries"."object_identifier", "__qti_queries"."one_tail_cardinality", "__qti"."open_attribute", "__qti"."open_attribute_entity", "__qti"."open_element_name", "__qti"."open_element_type", "__qti_queries"."open_name_node", "__qti_queries"."open_name_under_foreign", "__qti_queries"."open_type_node", "__qti_queries"."open_type_under_foreign", "__qti_queries"."operand_of", "__qti_queries"."other_vocabulary_type", "__qti"."package", "__qti_queries"."packaged_template_default", "__qti_queries"."pattern_text", "__qti"."pci_module_form", "__qti"."pi", "__qti"."placed_binding", "__qti_queries"."placed_binding_base_type_node", "__qti_queries"."placed_binding_cardinality_node", "__qti"."placed_choice", "__qti_queries"."placed_choice_or_hottext", "__qti_queries"."placed_choice_space_name", "__qti"."placed_expression", "__qti_queries"."placed_expression_node", "__qti_queries"."placed_expression_site", "__qti_queries"."placed_filter", "__qti"."placed_hottext", "__qti"."placed_id", "__qti"."placed_idref", "__qti_queries"."placed_include_path", "__qti"."placed_math_rank", "__qti_queries"."placed_math_rank_node", "__qti_queries"."placed_math_rank_step", "__qti_queries"."placed_reference", "__qti_queries"."placed_reference_site", "__qti_queries"."placed_share_ranks", "__qti"."placed_share_target", "__qti_queries"."placed_single_binding_most", "__qti_queries"."placed_single_response_gap", "__qti_queries"."placed_test_reference", "__qti_queries"."placed_variable_base", "__qti_queries"."placed_variable_cardinality", "__qti_queries"."placed_variable_declaration", "__qti"."placed_variable_ref", "__qti_queries"."placed_variable_ref_declaration", "__qti_views"."placed_variable_ref_node", "__qti_queries"."placed_weighted_variable", "__qti_queries"."pointer_parse", "__qti_queries"."prefixed_declaration", "__qti_queries"."prefixed_map_response", "__qti_queries"."prefixed_map_response_point", "__qti_queries"."printed_integer_base_type", "__qti_queries"."printed_integer_cardinality", "__qti"."printed_variable_ref", "__qti"."processing", "__qti_queries"."processing_node", "__qti_queries"."quotation_end", "__qti_queries"."read_include", "__qti_views"."record_node", "__qti_queries"."record_set_value", "__qti_queries"."referable_name", "__qti"."reference", "__qti_queries"."reference_lexical", "__qti"."reference_path", "__qti"."referring_document", "__qti_queries"."required_parts", "__qti_queries"."required_ssml_property", "__qti_queries"."requirement_met", "__qti_queries"."resolved_branch_rule", "__qti"."resource_document", "__qti_queries"."resource_file_document", "__qti_queries"."resource_file_outside", "__qti_queries"."resource_file_path", "__qti"."resource_href", "__qti"."resource_href_outside", "__qti"."resource_href_path", "__qti_queries"."rooted_declaration", "__qti_queries"."scope_duration_read", "__qti_queries"."scope_node", "__qti_queries"."scoped_dir", "__qti"."sd_decl", "__qti_queries"."section_replacement", "__qti_queries"."section_selection", "__qti_queries"."section_shuffle", "__qti_queries"."selection_without_replacement", "__qti_queries"."session_control", "__qti_queries"."set_cardinality", "__qti_queries"."set_field_name", "__qti"."share_fragment", "__qti_queries"."share_fragment_value", "__qti_queries"."share_ranks", "__qti_queries"."share_source", "__qti"."share_target", "__qti_queries"."single_binding_most", "__qti_queries"."single_response_gap", "__qti"."site", "__qti"."site_path", "__qti"."site_target", "__qti_queries"."slider_bounds", "__qti_queries"."sole_reading", "__qti"."srcset", "__qti"."srcset_candidate", "__qti_queries"."srcset_form", "__qti"."ssml_scope", "__qti_queries"."ssml_scope_node", "__qti_views"."ssml_value", "__qti"."stimulus_ref", "__qti_queries"."structure_naming", "__qti_queries"."structure_node", "__qti_queries"."table_header", "__qti_queries"."template_processing", "__qti"."template_ref", "__qti_queries"."template_ref_base_type", "__qti_queries"."template_ref_cardinality", "__qti_queries"."test_identifier", "__qti_queries"."test_identifier_bytes", "__qti_queries"."test_member", "__qti_queries"."test_part", "__qti_queries"."test_reading", "__qti_queries"."test_root", "__qti"."text_idref", "__qti"."text_reference", "__qti"."text_reference_path", "__qti_queries"."text_reference_string_value", "__qti_queries"."tolerance_token", "__qti_queries"."trimmed_mark", "__qti_views"."typed_declaration_name", "__qti_queries"."typed_href", "__qti_queries"."typed_path", "__qti_queries"."typed_value_text", "__qti_queries"."unassembled_reference", "__qti_queries"."unclaimed_name", "__qti_queries"."unknown_operand_base", "__qti_queries"."unknown_tail_base", "__qti_queries"."unplaced_include", "__qti_queries"."unread_type_href", "__qti_queries"."untargeted_item_ref", "__qti_queries"."untyped_unweighted", "__qti_queries"."untyped_weighted", "__qti_queries"."unweighted_read", "__qti_queries"."usage_value_base_type", "__qti_queries"."variable_mapping", "__qti"."variable_ref", "__qti_views"."variable_ref_node", "__qti_queries"."weight_value", "__qti_queries"."weighted_base_type", "__qti_queries"."weighted_read", "__qti_queries"."weighted_variable", "__qti"."xml_decl" TO :"qti_queries__author";

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

GRANT SELECT, INSERT ON TABLE "qti"."cn_part_text" TO :"qti_queries__author";

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

GRANT SELECT, INSERT ON TABLE "qti"."variable_ref" TO :"qti_queries__author";

GRANT SELECT, INSERT ON TABLE "qti"."xml_decl" TO :"qti_queries__author";

GRANT EXECUTE ON FUNCTION "qti"."__refuse"("pg_catalog"."text", "pg_catalog"."text", "pg_catalog"."text") TO :"qti_queries__author";

GRANT EXECUTE ON FUNCTION "qti"."__borrow"(bigint[], boolean[]) TO :"qti_queries__author";

GRANT EXECUTE ON FUNCTION "qti"."__constant_6tq4po7nw6"(), "qti"."__constant_gycrnsqroh"(), "qti"."__constant_6zxej4abb2"(), "qti"."__constant_ypukpkuwst"(), "qti"."__constant_cwrnerdt7h"(), "qti"."__constant_a25vjoggqy"(), "qti"."__constant_ibiapjhixk"(), "qti"."__constant_pt2nlf5tfe"(), "qti"."__constant_ehpdwuazfp"(), "qti"."__constant_ilsmlrv4rn"(), "qti"."__constant_lt5gyzu2ie"(), "qti"."__constant_bxnkl4gomg"(), "qti"."__constant_dfraxxfmoi"(), "qti"."__constant_25xukdesgx"(), "qti"."__constant_bdwwwf3twj"(), "qti"."__constant_hmibfx5gyk"(), "qti"."__constant_fdpedxdpft"(), "qti"."__constant_hzkon4sbpv"(), "qti"."__constant_oveviyqvht"(), "qti"."__constant_ttedx5vn3k"(), "qti"."__constant_o22zavrrtl"(), "qti"."__constant_6elmo3tsbj"(), "qti"."__constant_ryr7pz77db"(), "qti"."__constant_oqkq7bbbtf"(), "qti"."__constant_6a44geeoht"(), "qti"."__constant_2dcoyzngxn"(), "qti"."__constant_kzeitfadmd"(), "qti"."__constant_jcrhrb7n2a"(), "qti"."__constant_6q2e63bhto"(), "qti"."__constant_g6oyyfttzw"(), "qti"."__constant_gpsojklyfc"(), "qti"."__constant_wfzm5kdfvy"(), "qti"."__constant_pcgb5latkm"(), "qti"."__constant_w2xzlqaryb"(), "qti"."__constant_csx3c5jera"(), "qti"."__constant_buwj6qbmap"(), "qti"."__constant_3irab4cub2"(), "qti"."__constant_qnicfbtyhh"(), "qti"."__constant_cvrzwozguy"(), "qti"."__constant_ciuqwbhuta"(), "qti"."__constant_arhuab2szk"(), "qti"."__constant_cz5a2jxuz5"(), "qti"."__constant_454uuzhqfx"(), "qti"."__constant_oqtke4h5mu"(), "qti"."__constant_2qqn5wzl7u"(), "qti"."__constant_m4hpl7rh2v"(), "qti"."__constant_tq43p2kwpb"(), "qti"."__constant_rxqruxgxt6"(), "qti"."__constant_eufobqzn7j"(), "qti"."__constant_ctookwgtko"(), "qti"."__constant_yg6vkuovwv"(), "qti"."__constant_4rkhabvc5a"(), "qti"."__constant_qrpsoa4uqr"(), "qti"."__constant_ibjzqrmu43"(), "qti"."__constant_kxfbda5drm"(), "qti"."__constant_2xctpszff4"(), "qti"."__constant_kclguiw7tp"(), "qti"."__constant_zkoyt4vrk5"(), "qti"."__constant_sywdwb244e"(), "qti"."__constant_bqoq27hf4b"(), "qti"."__constant_dzjfphbnei"(), "qti"."__constant_2vjqk3ym75"(), "qti"."__constant_rnitcynfss"(), "qti"."__constant_jliv5ybd5f"(), "qti"."__constant_omoipacrlm"(), "qti"."__constant_wrlwssqvsp"(), "qti"."__constant_5vczbwx7y7"(), "qti"."__constant_ou2t6op6bu"(), "qti"."__constant_l2aceonlkt"(), "qti"."__constant_e66hiikbrr"(), "qti"."__constant_evyd7rljhw"(), "qti"."__constant_o5olztrwj3"(), "qti"."__constant_drya55lgvi"(), "qti"."__constant_ctyalchk7x"(), "qti"."__constant_6ywqvozu2t"(), "qti"."__constant_clkl2ozih5"(), "qti"."__constant_62agn6ra2l"(), "qti"."__constant_xsnkv3y3un"(), "qti"."__constant_hceanuyjz4"(), "qti"."__constant_2q2jviefor"(), "qti"."__constant_gkrzvuqpdw"(), "qti"."__constant_wlajmt22p5"(), "qti"."__constant_iogyvkhbbn"(), "qti"."__constant_xem42aq3by"(), "qti"."__constant_b7gaby5cp5"(), "qti"."__constant_hnm2zjjqct"(), "qti"."__constant_kfdglmgwkg"(), "qti"."__constant_iuohhkid6z"(), "qti"."__constant_yzjewq3gl4"(), "qti"."__constant_ck6xbijk2a"(), "qti"."__constant_f2peqlhxow"(), "qti"."__constant_msdavlzjqv"(), "qti"."__constant_7tung7crtg"(), "qti"."__constant_u74ar6arnc"(), "qti"."__constant_zei655nkpr"(), "qti"."__constant_tviujcq2wb"(), "qti"."__constant_fhvqv42slo"(), "qti"."__constant_5g4tvuqimr"(), "qti"."__constant_ekoivjlftu"(), "qti"."__constant_74s5vidd2f"(), "qti"."__constant_zld7kjwz77"(), "qti"."__constant_tjbel3wcju"(), "qti"."__constant_lix7a2qgpc"(), "qti"."__constant_gj4ty3mmm6"(), "qti"."__constant_qdsptpwpdn"(), "qti"."__constant_k66yk4eyrd"(), "qti"."__constant_vynzho76eo"(), "qti"."__constant_dqbnkda3gg"(), "qti"."__constant_idqixm5mfr"(), "qti"."__constant_ki7x6htob4"(), "qti"."__constant_vmztpnm7jl"(), "qti"."__constant_knqq7teaua"(), "qti"."__constant_on7irbswfh"(), "qti"."__constant_expkozj4sr"(), "qti"."__constant_wvuca46fcu"(), "qti"."__constant_e4ftofy4tw"(), "qti"."__constant_5rxec3s5g5"(), "qti"."__constant_l6v6mdqq6b"(), "qti"."__constant_7n2gpfboh6"(), "qti"."__constant_ejkw66w2je"(), "qti"."__constant_ougbyryzef"(), "qti"."__constant_syf46bbkfx"(), "qti"."__constant_w6ooxfv4ym"(), "qti"."__constant_ro353pncb2"(), "qti"."__constant_nugza34qyx"(), "qti"."__constant_yuqao2rftg"(), "qti"."__constant_isjwka4zqg"(), "qti"."__constant_2kq4algrsr"(), "qti"."__constant_zycshrf7wo"(), "qti"."__constant_6bq3qwxfoa"(), "qti"."__constant_zyvz7ew5kw"(), "qti"."__constant_abnivfsahd"(), "qti"."__constant_k6jwhkzeju"(), "qti"."__constant_jjczpizw62"(), "qti"."__constant_luys6mkawb"(), "qti"."__constant_tjrh4tk22y"(), "qti"."__constant_wuqtd2dywh"(), "qti"."__constant_ihq7f766ro"(), "qti"."__constant_okfqkrtnqs"(), "qti"."__constant_nauygyylpv"(), "qti"."__constant_hczbxpm5lv"(), "qti"."__constant_omna7jx3ps"(), "qti"."__constant_6dinz7u2yi"(), "qti"."__constant_kk3tbfzgkz"(), "qti"."__constant_3ja5lqhbu3"(), "qti"."__constant_eltdht6njd"(), "qti"."__constant_74sws3a536"(), "qti"."__constant_cmomvytsjq"(), "qti"."__constant_xqtuffyay5"(), "qti"."__constant_eh2p6pjltu"(), "qti"."__constant_obvdrq3725"(), "qti"."__constant_akedz6pilr"(), "qti"."__constant_taww2a5tgr"(), "qti"."__constant_gqyrbuxeym"(), "qti"."__constant_sgpkb6hk7w"(), "qti"."__constant_t7fktrlslv"(), "qti"."__constant_j3cmb4thc2"(), "qti"."__constant_hygd7nfdcf"(), "qti"."__constant_4hs7fzokws"(), "qti"."__constant_tzvpybzw74"(), "qti"."__closed_row_cq3qq2e2aa"(bigint[], bigint, bigint, bit varying), "qti"."__is_xsd_pattern_epnlukuxgp"("pg_catalog"."text"), "qti"."__text_digest_2x5x4iwe4m"("pg_catalog"."text"), "qti"."__align_direction_names_vluq7iazdg"(), "qti"."__align_state_names_ffk37slxn3"(), "qti"."__attribute_name_names_q6tmzcty4e"(), "qti"."__base_type_names_ok3nu5nck4"(), "qti"."__cardinality_names_kqiairsoqa"(), "qti"."__cn_base_names_2wtzhyubck"(), "qti"."__cn_part_names_6db2fcgfhy"(), "qti"."__cn_part_form_names_te7u7jycdu"(), "qti"."__cn_type_names_wmjelllvhg"(), "qti"."__declaration_kind_names_o62wpad2p7"(), "qti"."__document_type_names_ot37qp5org"(), "qti"."__entry_kind_names_km5xejbmwu"(), "qti"."__governor_names_d7jfyla3na"(), "qti"."__href_scope_names_y4pbuo4f5q"(), "qti"."__language_names_pvmtywwssv"(), "qti"."__navigation_mode_names_uhf5rddglr"(), "qti"."__node_kind_names_ulbko553n7"(), "qti"."__position_names_sglcn7ygpg"(), "qti"."__reference_resolution_names_zfbhfhou4v"(), "qti"."__resource_type_names_2tbbvn3ion"(), "qti"."__submission_mode_names_ihmg3iyv22"(), "qti"."__type_name_names_ksmacbo3df"(), "qti"."__unplaced_cause_names_p5tit5zgq3"(), "qti"."__value_base_names_pjzlcpdwvv"(), "qti"."__value_cardinality_names_wzwznoycgf"(), "qti"."__xml_standalone_names_psf7bszcug"(), "qti"."__admission_map_live_xrc2h3fveq"(), "qti"."__align_direction_live_2lezvj35h2"(), "qti"."__align_state_live_lhmmdyh7ap"(), "qti"."__attribute_model_live_4rpyw2wqfh"(), "qti"."__attribute_name_live_mghzolknn3"(), "qti"."__attribute_slot_live_3plwjx3sjc"(), "qti"."__base_type_live_y3pmvhj7zb"(), "qti"."__bound_facet_live_kux6fr53gv"(), "qti"."__bound_zero_live_5rlfzns3wq"(), "qti"."__built_in_live_f6bja7a4kg"(), "qti"."__cardinality_live_qwvqhyiu3t"(), "qti"."__cn_base_live_46ek53retw"(), "qti"."__cn_part_live_d7vk6cnszc"(), "qti"."__cn_part_form_live_hivm5ovjjn"(), "qti"."__cn_type_live_mftnyibli4"(), "qti"."__content_model_live_36z72epzkf"(), "qti"."__declaration_kind_live_uyajfwbwph"(), "qti"."__document_type_live_5oxlw6me3c"(), "qti"."__domain_primitive_live_7z4e7dri7p"(), "qti"."__entry_kind_live_iwotf6s2yf"(), "qti"."__flag_live_skpa5hsl6r"(), "qti"."__follow_set_live_ym66qqil5n"(), "qti"."__governor_live_gktrkb66r6"(), "qti"."__href_scope_live_zgj2x26s76"(), "qti"."__identity_live_z64zgxl2uo"(), "qti"."__include_set_live_mtgrllg3lw"(), "qti"."__language_live_y2rauuuzos"(), "qti"."__navigation_mode_live_6xkdepk5cz"(), "qti"."__node_kind_live_b7rifmc6m4"(), "qti"."__position_live_pi53civw33"(), "qti"."__reference_form_live_sckdmazr47"(), "qti"."__reference_resolution_live_6hzgo5pknw"(), "qti"."__reference_spelling_live_ke2xl66eo4"(), "qti"."__resource_type_live_m5qnrkbzgq"(), "qti"."__shared_model_live_37zbpyitfj"(), "qti"."__submission_mode_live_zjnwusihdh"(), "qti"."__symbol_set_live_3wo3lzfzqb"(), "qti"."__type_name_live_dizeay3gzc"(), "qti"."__unplaced_cause_live_7eeinprrjn"(), "qti"."__use_live_qqc6fbn3jc"(), "qti"."__value_base_live_pesuextzp2"(), "qti"."__value_cardinality_live_img3c6yzn6"(), "qti"."__value_domain_live_fpcln73bij"(), "qti"."__white_space_live_ywok3yue3q"(), "qti"."__xml_standalone_live_ql62ubmw6y"(), "qti"."__row_aw25pqvtpa"("qti"."__text_tfkvgtjblt"), "qti"."__row_nd6jocdab7"("pg_catalog"."text", "qti"."cn_base", "qti"."cn_type", "pg_catalog"."text"), "qti"."__row_mt4s3rmjwa"("qti"."__text_c6iptmtj2x", "qti"."node_kind", "qti"."attribute_name"), "qti"."__row_budsd6lx3f"("qti"."resource_type", "qti"."node_kind"), "qti"."__row_mjocgtt3c3"("qti"."governor", "qti"."__text_tfkvgtjblt"), "qti"."__row_mf5tbjlvzq"("qti"."__text_c6iptmtj2x"), "qti"."__row_bwtlabtuhh"("qti"."__text_c6iptmtj2x"), "qti"."__row_zelh2sd7nh"("qti"."__text_r2monji6i2"), "qti"."__row_a35tnn67mt"("qti"."__text_tfkvgtjblt"), "qti"."__row_dlooifa33s"("qti"."node_kind", "qti"."__text_xj3zno7u3h", "qti"."attribute_name"), "qti"."__row_lhaguf6fdy"("qti"."governor", "qti"."node_kind", "qti"."type_name"), "qti"."__row_rpz66ebjgw"("qti"."__attribute_slot_bits_112_aecznthxg5", "qti"."governor"), "qti"."__row_daqe3iivcx"("pg_catalog"."text", "qti"."cn_part_form", "qti"."cn_base"), "qti"."__row_fblgl67sgl"("qti"."node_kind", "qti"."__flag_bits_16_llpdtzgaon"), "qti"."__row_govjmx34hj"("qti"."governor", "qti"."__text_tfkvgtjblt"), "qti"."__row_uq7s4scxr7"("qti"."node_kind", "qti"."node_kind", "qti"."governor", "qti"."__domain_gfw43vigph", "qti"."__text_tfkvgtjblt", "qti"."__text_tfkvgtjblt", "qti"."__text_c6iptmtj2x"), "qti"."__row_jufhya6ohq"("qti"."governor", "qti"."attribute_name"), "qti"."__row_wczkl5jgfh"("qti"."document_type", "qti"."__text_tn2inwix7f"), "qti"."__row_zun4m4fg4n"(boolean, "qti"."__text_tfkvgtjblt"), "qti"."__row_atcormr3u4"("qti"."node_kind", "qti"."node_kind", "qti"."attribute_name", "qti"."__text_r2monji6i2"), "qti"."__row_xshfiwaotx"("qti"."cn_part", "qti"."cn_type", "qti"."cn_part_form"), "qti"."__row_ubxkzqopf2"("qti"."__text_nhrekaddjj", "qti"."base_type"), "qti"."__row_wbcfqyplew"("qti"."governor", "qti"."__attribute_slot_bits_112_aecznthxg5"), "qti"."__row_h6vjucvz3t"("qti"."__text_kgtzfmq7x6"), "qti"."__row_z6apnjaxe4"("qti"."node_kind", "qti"."type_name"), "qti"."__row_whdasjrjsa"("pg_catalog"."text", "qti"."href_scope"), "qti"."__row_k6acbzbnax"("qti"."node_kind", "qti"."__attribute_slot_bits_112_aecznthxg5"), "qti"."__row_h27dbn7u5w"("qti"."node_kind", "qti"."node_kind", "qti"."position", "qti"."__domain_gfw43vigph", bigint, bigint), "qti"."__row_ui4lrahf52"("qti"."governor", "qti"."attribute_name", "qti"."__text_c6iptmtj2x"), "qti"."__row_fy74txqgtz"("qti"."governor", "qti"."attribute_name", "qti"."__domain_gfw43vigph", "pg_catalog"."text", "qti"."__text_c6iptmtj2x", "qti"."__attribute_slot_bits_112_aecznthxg5"), "qti"."__row_whrjsvpqlv"("qti"."governor", "qti"."attribute_name", "qti"."__text_c6iptmtj2x"), "qti"."__row_cphscp5lzn"("qti"."governor", "qti"."attribute_name"), "qti"."__row_lryxyr4c6w"("qti"."resource_type"), "qti"."__row_jmlc7ncyzs"("qti"."node_kind", "qti"."node_kind", boolean, boolean), "qti"."__row_4gzkek3omc"("qti"."value_base"), "qti"."__row_ubecu46dj5"("qti"."node_kind", "qti"."__text_dtweupoh47", "qti"."attribute_name", "qti"."__text_c6iptmtj2x"), "qti"."__row_7b7kgqz54i"("qti"."__text_tfkvgtjblt"), "qti"."__row_zowi3yosa3"("pg_catalog"."text", "qti"."__text_c6iptmtj2x", "qti"."__text_c6iptmtj2x"), "qti"."__row_rlmxw6tihw"("qti"."__text_c6iptmtj2x"), "qti"."__row_mis3yqyzxq"("qti"."__text_tn2inwix7f"), "qti"."__row_atwyv7vmnv"("qti"."__attribute_slot_bits_112_aecznthxg5", "qti"."governor"), "qti"."__row_eilsstqyjd"("qti"."node_kind", "qti"."position"), "qti"."__row_6kzci666ft"("qti"."governor", "qti"."attribute_name", "qti"."__text_c6iptmtj2x"), "qti"."__row_c47fsjaxws"("qti"."__text_3dlgl63rv6", "qti"."__text_3dlgl63rv6", "qti"."__text_r2monji6i2"), "qti"."__row_qqd72edapd"("qti"."__text_k5kwygzatl"), "qti"."__row_k2jasr26qa"("qti"."governor", "qti"."attribute_name", "qti"."__text_c6iptmtj2x"), "qti"."__row_mnvtoctuvm"("qti"."__attribute_slot_bits_112_aecznthxg5", "qti"."governor"), "qti"."__row_f633qllcrb"("qti"."node_kind", "qti"."node_kind"), "qti"."__row_repvasr7mb"("qti"."node_kind", "qti"."governor", "qti"."__text_c6iptmtj2x", "qti"."__text_gke7uypkov", "qti"."__text_gke7uypkov", "qti"."__flag_bits_16_llpdtzgaon", "qti"."__flag_bits_16_llpdtzgaon", "qti"."__domain_gfw43vigph"), "qti"."__row_sqzhxeibj4"("qti"."__text_netnsfkgs7", "qti"."href_scope", "qti"."__text_b6ykamoeho", "qti"."__domain_gfw43vigph"), "qti"."__row_w2gdubljff"("qti"."__text_c6iptmtj2x"), "qti"."__row_44dtlrt4fb"("qti"."governor", "qti"."__attribute_slot_bits_112_aecznthxg5"), "qti"."__row_tcceykpijd"("qti"."governor", "qti"."attribute_name", "qti"."__text_c6iptmtj2x"), "qti"."__row_osqjk7nnh2"("qti"."node_kind", "qti"."node_kind", "qti"."position", "qti"."__domain_gfw43vigph", bigint, bigint), "qti"."__row_oa2ad3ae5z"("qti"."node_kind", "qti"."node_kind", "qti"."position", "qti"."position"), "qti"."__row_b5wnhkqk7l"("qti"."governor", "qti"."__text_xj3zno7u3h"), "qti"."__row_tkhdy7thpe"("qti"."node_kind", "qti"."__domain_gfw43vigph"), "qti"."__row_4bpx7xcjar"("qti"."__text_r2monji6i2", "qti"."node_kind", "qti"."value_base", "qti"."value_cardinality", "qti"."reference_resolution"), "qti"."__row_rqknubyw5p"("qti"."cn_type", "qti"."__domain_gfw43vigph"), "qti"."__row_ud4ftg3q7k"("qti"."base_type"), "qti"."__row_tj2g3klipi"("qti"."value_cardinality"), "qti"."__row_4vybx43xpe"("qti"."position", "qti"."node_kind"), "qti"."__row_ukt5skmgw4"("pg_catalog"."text", bigint), "qti"."__row_5qzzsze2bv"("qti"."governor", "qti"."attribute_name", "qti"."__attribute_slot_bits_112_aecznthxg5"), "qti"."__row_uskzq3eryy"("qti"."node_kind", "qti"."node_kind", "qti"."position", "qti"."position") TO :"qti_queries__author";

SELECT "pg_catalog"."pg_advisory_xact_lock"(5448515225636816524::bigint);
GRANT TEMPORARY ON DATABASE :"DBNAME" TO :"qti_queries__author";

GRANT EXECUTE ON FUNCTION "qti"."__stand_assembled_document_hwwdv6cnpm"(), "qti"."__stand_attribute_ibvutlmrai"(), "qti"."__stand_binding_name_ye63gc6vro"(), "qti"."__stand_bound_variable_7vtgjbh6hv"(), "qti"."__stand_candidate_path_qhg7xli4wt"(), "qti"."__stand_catalog_scope_vudqbkxslz"(), "qti"."__stand_cell_leaf_ptjwgogbl7"(), "qti"."__stand_choice_xzzdvjuvsd"(), "qti"."__stand_choice_interaction_c645kfugmv"(), "qti"."__stand_comment_3l7okcxyxf"(), "qti"."__stand_context_ref_ujo5dooa7f"(), "qti"."__stand_count_bound_2z6orlcix6"(), "qti"."__stand_data_ssml_k52kzmf2vn"(), "qti"."__stand_data_ssml_member_2xkysqbugo"(), "qti"."__stand_data_ssml_property_6yi5in6iis"(), "qti"."__stand_doctype_gj2wct2uyg"(), "qti"."__stand_document_pondgr3rqo"(), "qti"."__stand_document_id_633p5hpydz"(), "qti"."__stand_element_type_7tgopoucgl"(), "qti"."__stand_entry_pmmpk3imf3"(), "qti"."__stand_expression_u7lcjyvsn7"(), "qti"."__stand_feedback_ref_d7224uniti"(), "qti"."__stand_file_tcw2ukyhyi"(), "qti"."__stand_file_outside_lhyrdnu5ai"(), "qti"."__stand_file_path_7r6oexjmsr"(), "qti"."__stand_fragment_context_ref_h4natgpneo"(), "qti"."__stand_fragment_feedback_ref_gojudisgmf"(), "qti"."__stand_fragment_printed_ref_g5dbleutzc"(), "qti"."__stand_fragment_scope_2oggx422cm"(), "qti"."__stand_fragment_template_ref_mqrpgto2fj"(), "qti"."__stand_hottext_apulsizq3w"(), "qti"."__stand_identity_text_b52n3op6xe"(), "qti"."__stand_idref_aho5h2elqy"(), "qti"."__stand_idref_target_jjhutks3nm"(), "qti"."__stand_inclusion_km3rxqqunr"(), "qti"."__stand_instance_fxskpasuzx"(), "qti"."__stand_interaction_3potcpsocf"(), "qti"."__stand_interaction_attribute_wmzckdz5tm"(), "qti"."__stand_item_ref_document_i66s3vh6ga"(), "qti"."__stand_item_ref_href_jrjueitx27"(), "qti"."__stand_label_use_o4brmrb7aq"(), "qti"."__stand_least_count_ya6wrr6a3v"(), "qti"."__stand_link_reading_uenjcz5dvs"(), "qti"."__stand_literal_tiziliumbt"(), "qti"."__stand_literal_typed_2ilx4mlegz"(), "qti"."__stand_math_action_f5wwzdrvm5"(), "qti"."__stand_math_align_group_6xltg6lxo2"(), "qti"."__stand_math_align_scope_u2bech2ml5"(), "qti"."__stand_math_cell_7pwv53nkxm"(), "qti"."__stand_math_cn_d6ecu3zp5g"(), "qti"."__stand_math_rank_nqeqnb4u7t"(), "qti"."__stand_media_5bf42f2xah"(), "qti"."__stand_most_count_2kgjd3owwn"(), "qti"."__stand_named_rt75iqktd4"(), "qti"."__stand_node_ufvsoeyzmq"(), "qti"."__stand_numbered_reading_em4eroit7v"(), "qti"."__stand_open_attribute_kus4ehgwz4"(), "qti"."__stand_open_element_name_yc423a5h3x"(), "qti"."__stand_open_element_type_ntz3lqtaqc"(), "qti"."__stand_pci_module_form_yzlgznmelb"(), "qti"."__stand_pi_xg74jk6xwy"(), "qti"."__stand_placed_binding_rbegxbfbcg"(), "qti"."__stand_placed_choice_54ymy46b3e"(), "qti"."__stand_placed_expression_eajdtujnrh"(), "qti"."__stand_placed_hottext_donabbhxss"(), "qti"."__stand_placed_id_kbkipg3veh"(), "qti"."__stand_placed_idref_64inmhwtyc"(), "qti"."__stand_placed_math_rank_5572svkpcq"(), "qti"."__stand_placed_share_target_bt6g4coqwv"(), "qti"."__stand_placed_variable_ref_m4ro6tg5kc"(), "qti"."__stand_printed_variable_ref_e7jd2rdh3z"(), "qti"."__stand_processing_fc2mn4yln3"(), "qti"."__stand_reference_5zvivb5s2f"(), "qti"."__stand_reference_path_wo5g5edty7"(), "qti"."__stand_resource_document_j6gjtwm5zs"(), "qti"."__stand_resource_href_m3jxi2ub6r"(), "qti"."__stand_resource_href_outside_h5ayb4ywy5"(), "qti"."__stand_resource_href_path_cetda5wlcb"(), "qti"."__stand_share_fragment_vlshgysorq"(), "qti"."__stand_share_target_uodbsrbtr7"(), "qti"."__stand_site_tjfl6cjoct"(), "qti"."__stand_site_path_5texh73t5e"(), "qti"."__stand_site_target_7dcfpspkwp"(), "qti"."__stand_srcset_rftu4ffapo"(), "qti"."__stand_srcset_candidate_rjuo7n5ahk"(), "qti"."__stand_ssml_scope_qlkcnlkody"(), "qti"."__stand_stimulus_ref_3r7jqd3al5"(), "qti"."__stand_template_ref_5rw7gnm6ga"(), "qti"."__stand_text_reference_xbgifadnt4"(), "qti"."__stand_text_reference_path_ijtliptx3w"(), "qti"."__stand_variable_ref_htgoqewgip"() TO :"qti_queries__author";

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

REVOKE ALL ON TABLE "qti"."assembled_document", "qti"."attribute", "qti"."attribute_entity", "qti"."binding_name", "qti"."bound_variable", "qti"."candidate_path", "qti"."catalog_scope", "qti"."cell_leaf", "qti"."choice", "qti"."choice_interaction", "qti"."cn_part_text", "qti"."comment", "qti"."context_ref", "qti"."count_bound", "qti"."data_ssml", "qti"."data_ssml_member", "qti"."data_ssml_property", "qti"."doctype", "qti"."document", "qti"."document_id", "qti"."element_type", "qti"."encoding_decl", "qti"."entry", "qti"."expression", "qti"."feedback_ref", "qti"."file", "qti"."file_outside", "qti"."file_path", "qti"."fragment_context_name", "qti"."fragment_context_ref", "qti"."fragment_feedback_name", "qti"."fragment_feedback_ref", "qti"."fragment_printed_name", "qti"."fragment_printed_ref", "qti"."fragment_scope", "qti"."fragment_template_name", "qti"."fragment_template_ref", "qti"."hottext", "qti"."identity_text", "qti"."idref", "qti"."idref_target", "qti"."inclusion", "qti"."instance", "qti"."interaction", "qti"."interaction_attribute", "qti"."item_mode", "qti"."item_ref_document", "qti"."item_ref_href", "qti"."label_use", "qti"."least_count", "qti"."link_reading", "qti"."literal", "qti"."literal_typed", "qti"."math_action", "qti"."math_align_group", "qti"."math_align_scope", "qti"."math_cell", "qti"."math_cn", "qti"."math_rank", "qti"."media", "qti"."most_count", "qti"."named", "qti"."namespace", "qti"."node", "qti"."numbered_reading", "qti"."open_attribute", "qti"."open_attribute_entity", "qti"."open_element_name", "qti"."open_element_type", "qti"."package", "qti"."pci_module_form", "qti"."pi", "qti"."placed_binding", "qti"."placed_choice", "qti"."placed_expression", "qti"."placed_hottext", "qti"."placed_id", "qti"."placed_idref", "qti"."placed_math_rank", "qti"."placed_share_target", "qti"."placed_variable_ref", "qti"."printed_variable_ref", "qti"."processing", "qti"."reference", "qti"."reference_path", "qti"."referring_document", "qti"."resource_document", "qti"."resource_href", "qti"."resource_href_outside", "qti"."resource_href_path", "qti"."sd_decl", "qti"."share_fragment", "qti"."share_target", "qti"."site", "qti"."site_path", "qti"."site_target", "qti"."srcset", "qti"."srcset_candidate", "qti"."ssml_scope", "qti"."stimulus_ref", "qti"."template_ref", "qti"."text_idref", "qti"."text_reference", "qti"."text_reference_path", "qti"."variable_ref", "qti"."xml_decl", "__qti_queries"."anchored_id", "__qti_queries"."anchored_name", "__qti_queries"."apply_argument", "__qti_queries"."apply_argument_pair", "__qti_queries"."area_mapping_base_type", "__qti_queries"."area_mapping_cardinality", "__qti_queries"."aria_bounds", "__qti_queries"."arity_floor", "__qti_queries"."assembled_catalog", "__qti"."assembled_document", "__qti_queries"."assembled_id", "__qti_queries"."assembled_name", "__qti_queries"."assembled_replaceable", "__qti"."attribute", "__qti"."attribute_entity", "__qti_queries"."bank_member", "__qti_queries"."base_type_cardinality", "__qti_queries"."binary_math_operator", "__qti_queries"."binding_base_type_node", "__qti_queries"."binding_cardinality_node", "__qti"."binding_name", "__qti_queries"."bound_range", "__qti"."bound_variable", "__qti_queries"."bounded_selection", "__qti_queries"."branch_resolution", "__qti"."candidate_path", "__qti_views"."catalog_id", "__qti"."catalog_scope", "__qti_queries"."catalog_scope_node", "__qti_queries"."cell_child", "__qti"."cell_leaf", "__qti_queries"."cell_leaf_node", "__qti_views"."cell_table", "__qti_queries"."cell_token", "__qti"."choice", "__qti"."choice_interaction", "__qti_queries"."choice_node", "__qti_queries"."choice_or_hottext", "__qti_queries"."choice_space_name", "__qti_queries"."cn_count", "__qti"."cn_part_text", "__qti"."comment", "__qti"."context_ref", "__qti_queries"."copied_id", "__qti"."count_bound", "__qti_queries"."count_bound_node", "__qti"."data_ssml", "__qti"."data_ssml_member", "__qti"."data_ssml_property", "__qti_views"."declaration_base_type", "__qti_views"."declaration_cardinality", "__qti_views"."declaration_name", "__qti_queries"."declaration_table", "__qti_views"."declared_identifier_text", "__qti_queries"."declared_placement", "__qti_queries"."deliverable_test", "__qti_queries"."dependency", "__qti_queries"."dependency_resolved", "__qti_queries"."described_assembled_lang", "__qti_queries"."described_lang", "__qti"."doctype", "__qti"."document", "__qti"."document_id", "__qti"."element_type", "__qti"."encoding_decl", "__qti"."entry", "__qti_queries"."entry_file_target", "__qti"."expression", "__qti_queries"."expression_attribute", "__qti_queries"."expression_node", "__qti_queries"."expression_operand", "__qti"."feedback_ref", "__qti_queries"."feedback_ref_base_type", "__qti_queries"."feedback_ref_cardinality", "__qti_queries"."field_value_text", "__qti"."file", "__qti"."file_outside", "__qti"."file_path", "__qti_queries"."filtered_section", "__qti_queries"."forbidden_resource_type", "__qti_queries"."forward_branch_rule", "__qti"."fragment_context_name", "__qti"."fragment_context_ref", "__qti"."fragment_feedback_name", "__qti"."fragment_feedback_ref", "__qti"."fragment_printed_name", "__qti"."fragment_printed_ref", "__qti"."fragment_scope", "__qti"."fragment_template_name", "__qti"."fragment_template_ref", "__qti_queries"."free_mapping_target", "__qti_queries"."head_document", "__qti_queries"."head_qualifier_pair", "__qti_views"."header_token", "__qti_queries"."held_type", "__qti_queries"."hotspot_node", "__qti"."hottext", "__qti_queries"."hottext_node", "__qti_queries"."id_binding", "__qti_views"."id_value", "__qti"."identity_text", "__qti_queries"."identity_text_node", "__qti"."idref", "__qti"."idref_target", "__qti"."inclusion", "__qti"."instance", "__qti_queries"."instance_document", "__qti_queries"."integer_aggregate", "__qti"."interaction", "__qti"."interaction_attribute", "__qti_queries"."interaction_node", "__qti_queries"."interpolated_lookup", "__qti_queries"."item_mapping", "__qti"."item_mode", "__qti_queries"."item_read", "__qti_queries"."item_ref_category", "__qti"."item_ref_document", "__qti"."item_ref_href", "__qti_queries"."item_ref_section", "__qti_queries"."item_ref_table", "__qti_queries"."item_ref_target", "__qti_queries"."item_scoped_reading", "__qti_queries"."item_template_default", "__qti_queries"."judged_placed_idref", "__qti_queries"."known_operand_base", "__qti_queries"."known_operand_cardinality", "__qti"."label_use", "__qti_views"."lang_value", "__qti_queries"."late_submission", "__qti_queries"."least_choice_bound", "__qti"."least_count", "__qti_queries"."least_count_node", "__qti_queries"."least_one_apply", "__qti_queries"."least_two_apply", "__qti"."link_reading", "__qti_queries"."link_scope", "__qti_queries"."link_spelling", "__qti_queries"."listed_identifier", "__qti_queries"."listed_lang", "__qti_queries"."listed_title", "__qti"."literal", "__qti"."literal_typed", "__qti_views"."located_template", "__qti_queries"."lookup_table_cardinality", "__qti_views"."lookup_value", "__qti_queries"."lookup_value_type", "__qti_views"."map_key", "__qti_queries"."map_key_type", "__qti_queries"."mapped_response_declaration", "__qti_queries"."mapping_base_type", "__qti_queries"."mapping_cardinality", "__qti_queries"."mastery_ceiling", "__qti_queries"."mastery_floor", "__qti_views"."mastery_value", "__qti_queries"."matched_identifier", "__qti_queries"."matched_title", "__qti"."math_action", "__qti_queries"."math_action_node", "__qti"."math_align_group", "__qti"."math_align_scope", "__qti"."math_cell", "__qti"."math_cn", "__qti_queries"."math_operand", "__qti"."math_rank", "__qti_queries"."math_rank_node", "__qti_queries"."math_rank_step", "__qti_queries"."max_attempts", "__qti_queries"."max_time", "__qti"."media", "__qti_queries"."min_time", "__qti_queries"."most_choice_bound", "__qti"."most_count", "__qti_queries"."most_count_node", "__qti_queries"."most_one_argument", "__qti_queries"."most_two_argument_pair", "__qti"."named", "__qti_views"."named_declaration", "__qti_queries"."named_item_ref", "__qti"."namespace", "__qti"."node", "__qti_queries"."non_container_strings", "__qti_views"."normal_maximum", "__qti_views"."normal_minimum", "__qti"."numbered_reading", "__qti_queries"."numbered_spelling", "__qti_queries"."numbered_target", "__qti_queries"."object_identifier", "__qti_queries"."one_tail_cardinality", "__qti"."open_attribute", "__qti"."open_attribute_entity", "__qti"."open_element_name", "__qti"."open_element_type", "__qti_queries"."open_name_node", "__qti_queries"."open_name_under_foreign", "__qti_queries"."open_type_node", "__qti_queries"."open_type_under_foreign", "__qti_queries"."operand_of", "__qti_queries"."other_vocabulary_type", "__qti"."package", "__qti_queries"."packaged_template_default", "__qti_queries"."pattern_text", "__qti"."pci_module_form", "__qti"."pi", "__qti"."placed_binding", "__qti_queries"."placed_binding_base_type_node", "__qti_queries"."placed_binding_cardinality_node", "__qti"."placed_choice", "__qti_queries"."placed_choice_or_hottext", "__qti_queries"."placed_choice_space_name", "__qti"."placed_expression", "__qti_queries"."placed_expression_node", "__qti_queries"."placed_expression_site", "__qti_queries"."placed_filter", "__qti"."placed_hottext", "__qti"."placed_id", "__qti"."placed_idref", "__qti_queries"."placed_include_path", "__qti"."placed_math_rank", "__qti_queries"."placed_math_rank_node", "__qti_queries"."placed_math_rank_step", "__qti_queries"."placed_reference", "__qti_queries"."placed_reference_site", "__qti_queries"."placed_share_ranks", "__qti"."placed_share_target", "__qti_queries"."placed_single_binding_most", "__qti_queries"."placed_single_response_gap", "__qti_queries"."placed_test_reference", "__qti_queries"."placed_variable_base", "__qti_queries"."placed_variable_cardinality", "__qti_queries"."placed_variable_declaration", "__qti"."placed_variable_ref", "__qti_queries"."placed_variable_ref_declaration", "__qti_views"."placed_variable_ref_node", "__qti_queries"."placed_weighted_variable", "__qti_queries"."pointer_parse", "__qti_queries"."prefixed_declaration", "__qti_queries"."prefixed_map_response", "__qti_queries"."prefixed_map_response_point", "__qti_queries"."printed_integer_base_type", "__qti_queries"."printed_integer_cardinality", "__qti"."printed_variable_ref", "__qti"."processing", "__qti_queries"."processing_node", "__qti_queries"."quotation_end", "__qti_queries"."read_include", "__qti_views"."record_node", "__qti_queries"."record_set_value", "__qti_queries"."referable_name", "__qti"."reference", "__qti_queries"."reference_lexical", "__qti"."reference_path", "__qti"."referring_document", "__qti_queries"."required_parts", "__qti_queries"."required_ssml_property", "__qti_queries"."requirement_met", "__qti_queries"."resolved_branch_rule", "__qti"."resource_document", "__qti_queries"."resource_file_document", "__qti_queries"."resource_file_outside", "__qti_queries"."resource_file_path", "__qti"."resource_href", "__qti"."resource_href_outside", "__qti"."resource_href_path", "__qti_queries"."rooted_declaration", "__qti_queries"."scope_duration_read", "__qti_queries"."scope_node", "__qti_queries"."scoped_dir", "__qti"."sd_decl", "__qti_queries"."section_replacement", "__qti_queries"."section_selection", "__qti_queries"."section_shuffle", "__qti_queries"."selection_without_replacement", "__qti_queries"."session_control", "__qti_queries"."set_cardinality", "__qti_queries"."set_field_name", "__qti"."share_fragment", "__qti_queries"."share_fragment_value", "__qti_queries"."share_ranks", "__qti_queries"."share_source", "__qti"."share_target", "__qti_queries"."single_binding_most", "__qti_queries"."single_response_gap", "__qti"."site", "__qti"."site_path", "__qti"."site_target", "__qti_queries"."slider_bounds", "__qti_queries"."sole_reading", "__qti"."srcset", "__qti"."srcset_candidate", "__qti_queries"."srcset_form", "__qti"."ssml_scope", "__qti_queries"."ssml_scope_node", "__qti_views"."ssml_value", "__qti"."stimulus_ref", "__qti_queries"."structure_naming", "__qti_queries"."structure_node", "__qti_queries"."table_header", "__qti_queries"."template_processing", "__qti"."template_ref", "__qti_queries"."template_ref_base_type", "__qti_queries"."template_ref_cardinality", "__qti_queries"."test_identifier", "__qti_queries"."test_identifier_bytes", "__qti_queries"."test_member", "__qti_queries"."test_part", "__qti_queries"."test_reading", "__qti_queries"."test_root", "__qti"."text_idref", "__qti"."text_reference", "__qti"."text_reference_path", "__qti_queries"."text_reference_string_value", "__qti_queries"."tolerance_token", "__qti_queries"."trimmed_mark", "__qti_views"."typed_declaration_name", "__qti_queries"."typed_href", "__qti_queries"."typed_path", "__qti_queries"."typed_value_text", "__qti_queries"."unassembled_reference", "__qti_queries"."unclaimed_name", "__qti_queries"."unknown_operand_base", "__qti_queries"."unknown_tail_base", "__qti_queries"."unplaced_include", "__qti_queries"."unread_type_href", "__qti_queries"."untargeted_item_ref", "__qti_queries"."untyped_unweighted", "__qti_queries"."untyped_weighted", "__qti_queries"."unweighted_read", "__qti_queries"."usage_value_base_type", "__qti_queries"."variable_mapping", "__qti"."variable_ref", "__qti_views"."variable_ref_node", "__qti_queries"."weight_value", "__qti_queries"."weighted_base_type", "__qti_queries"."weighted_read", "__qti_queries"."weighted_variable", "__qti"."xml_decl" FROM PUBLIC;

REVOKE ALL ON DOMAIN "qti"."__sha256", "qti"."admission_map", "qti"."align_direction", "qti"."align_state", "qti"."attribute_model", "qti"."attribute_name", "qti"."__attribute_name_bits_416_thr6i6sipt", "qti"."attribute_slot", "qti"."__attribute_slot_bits_112_aecznthxg5", "qti"."base_type", "qti"."bound_facet", "qti"."bound_zero", "qti"."built_in", "qti"."cardinality", "qti"."cn_base", "qti"."cn_part", "qti"."cn_part_form", "qti"."cn_type", "qti"."content_model", "qti"."declaration_kind", "qti"."document_type", "qti"."domain_primitive", "qti"."entry_kind", "qti"."flag", "qti"."__flag_bits_16_llpdtzgaon", "qti"."follow_set", "qti"."governor", "qti"."href_scope", "qti"."identity", "qti"."include_set", "qti"."language", "qti"."navigation_mode", "qti"."node_kind", "qti"."__node_kind_bits_648_lh43fw4nuo", "qti"."position", "qti"."__position_bits_312_cnr3fptmz4", "qti"."reference_form", "qti"."reference_resolution", "qti"."reference_spelling", "qti"."resource_type", "qti"."shared_model", "qti"."submission_mode", "qti"."symbol_set", "qti"."type_name", "qti"."unplaced_cause", "qti"."use", "qti"."value_base", "qti"."__value_base_bits_16_7t6pwwxbsh", "qti"."value_cardinality", "qti"."__value_cardinality_bits_8_mma4mwhphy", "qti"."value_domain", "qti"."white_space", "qti"."xml_standalone", "qti"."__text_aqc6inemva", "qti"."__text_tn2inwix7f", "qti"."__text_c6iptmtj2x", "qti"."__text_phcitidkqs", "qti"."__text_xj3zno7u3h", "qti"."__text_r2monji6i2", "qti"."__text_7j6kgluyjp", "qti"."__text_l7nqeazg5h", "qti"."__text_xey6ryorh5", "qti"."__text_7dfilirtp3", "qti"."__text_tfkvgtjblt", "qti"."__text_sac6h6c6eh", "qti"."__text_nhrekaddjj", "qti"."__text_zij47sgley", "qti"."__text_gke7uypkov", "qti"."__text_gysgx5gkhi", "qti"."__text_dtweupoh47", "qti"."__text_lecej62lgl", "qti"."__text_iyotu5swho", "qti"."__text_kgtzfmq7x6", "qti"."__text_23rzixl3a2", "qti"."__text_3adwbksayk", "qti"."__text_k5kwygzatl", "qti"."__text_b6ykamoeho", "qti"."__text_4s4od7s5or", "qti"."__text_netnsfkgs7", "qti"."__text_3dlgl63rv6", "qti"."__text_aezrarw5qb", "qti"."__text_mzulxrnk4x", "qti"."__text_7nkeqry66t", "qti"."__text_3yyv7z62gr", "qti"."__text_r2kdc4r77d", "qti"."__text_i4qty2ywff", "qti"."__domain_gfw43vigph", "qti"."__param_package_5kbmtohnug", "qti"."__param_path_bcrdrv5any" FROM PUBLIC;

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

COMMENT ON FUNCTION "qti"."__constant_6tq4po7nw6"() IS 'closed constant 0009c9cc2feaaf9198188d40d6648fe8025c3cf1fe378e6277d93df0a3591d6e';

COMMENT ON FUNCTION "qti"."__constant_gycrnsqroh"() IS 'closed constant 05aa4287e079d549db1d209a26df39b72d289793b68f765da7566ef8edb59ec2';

COMMENT ON FUNCTION "qti"."__constant_6zxej4abb2"() IS 'closed constant 08a377b37ebc50fdcaa35b79934191e591e01746374de3620456608749943e1c';

COMMENT ON FUNCTION "qti"."__constant_ypukpkuwst"() IS 'closed constant 0ae345f0ed47e0a4c20b92668c4dc3e218915e82444cec80eeb3dcb0f46553e6';

COMMENT ON FUNCTION "qti"."__constant_cwrnerdt7h"() IS 'closed constant 0d7041e3db425319023cd45570c5052fe22168b99914e13e7fe584cc331e9f7e';

COMMENT ON FUNCTION "qti"."__constant_a25vjoggqy"() IS 'closed constant 0de196c2010de1a8636095038cec560e7634e2dd9b801e491230b51e14147911';

COMMENT ON FUNCTION "qti"."__constant_ibiapjhixk"() IS 'closed constant 1396646b8361a83297f299264ac7ff850b7f076edf65ea7681ce5ff7553dda82';

COMMENT ON FUNCTION "qti"."__constant_pt2nlf5tfe"() IS 'closed constant 13cd68c5ddfa216380b400ed073f6a109dc6ef60c059946cf7bfe34d9ac08081';

COMMENT ON FUNCTION "qti"."__constant_ehpdwuazfp"() IS 'closed constant 14b5b4897df7d0a8bac7d55db1498b01878cca71f4dd1e5207f906516b0bfc6b';

COMMENT ON FUNCTION "qti"."__constant_ilsmlrv4rn"() IS 'closed constant 15a79a1876c06569b3d5ecb143132b61d1347d159bc46fa1dbbdfd174f628f8d';

COMMENT ON FUNCTION "qti"."__constant_lt5gyzu2ie"() IS 'closed constant 17f1aa4b109c06827ee6741e63272a2bdb82009bb0de8fcfc382bc1d448a40ee';

COMMENT ON FUNCTION "qti"."__constant_bxnkl4gomg"() IS 'closed constant 19a2c9bead313d907305329e7b8b03801ed163fdd64c2091c7c35e75b01ba040';

COMMENT ON FUNCTION "qti"."__constant_dfraxxfmoi"() IS 'closed constant 1a5975ea2ecc22a0e60c324cdca9b67ae48dd00927ad40041f41fed2ebb69b6b';

COMMENT ON FUNCTION "qti"."__constant_25xukdesgx"() IS 'closed constant 1bc113e00367a14f4a7fa654f1dd65dec1ee66b56d2fc69df705bc24d7635219';

COMMENT ON FUNCTION "qti"."__constant_bdwwwf3twj"() IS 'closed constant 1f0c4b34513e71ba68b1417044233b586b97762d9af25b9be491f5cd60de8f1f';

COMMENT ON FUNCTION "qti"."__constant_hmibfx5gyk"() IS 'closed constant 1fe13059f9e5b135d2e288ee4135dbe204a97f2bc65de2633ea6e943d57bcd48';

COMMENT ON FUNCTION "qti"."__constant_fdpedxdpft"() IS 'closed constant 2140a819770dcd91951843e3c7110eb0809d9380caac6f4f713481b8261851bf';

COMMENT ON FUNCTION "qti"."__constant_hzkon4sbpv"() IS 'closed constant 22aed9315fe13c5193de012f607880625f9e0c4f554d711d89b48ed2a9ce93da';

COMMENT ON FUNCTION "qti"."__constant_oveviyqvht"() IS 'closed constant 2538efd4c6e8207755033b53ca33e5814bf79271e4a1d7921d0bf7cf758bb8bd';

COMMENT ON FUNCTION "qti"."__constant_ttedx5vn3k"() IS 'closed constant 25783aecd8e4d189de992257c6f6b07dc928aec73ffb8ee65c3ae19ca879eda2';

COMMENT ON FUNCTION "qti"."__constant_o22zavrrtl"() IS 'closed constant 2648284985a737cc57aec773cc50f175ee1ed4fbc90ccc8e8730db1720e1044a';

COMMENT ON FUNCTION "qti"."__constant_6elmo3tsbj"() IS 'closed constant 264b99fba1f3b91744528544becfd2f84557e46543707aefe07474fefc0c4c09';

COMMENT ON FUNCTION "qti"."__constant_ryr7pz77db"() IS 'closed constant 29760dc72259e807c417fa3bb18d43e0d320e517e79f9ec7c70c102203bc0110';

COMMENT ON FUNCTION "qti"."__constant_oqkq7bbbtf"() IS 'closed constant 297a4f99869c4d707fef0657c7176bd4c2ca906931bfe3fc4961240b023b4c47';

COMMENT ON FUNCTION "qti"."__constant_6a44geeoht"() IS 'closed constant 29fddf570a6abdc1339ae5c9328279c0ddaa4d63f278212612c91a3f42f78ed2';

COMMENT ON FUNCTION "qti"."__constant_2dcoyzngxn"() IS 'closed constant 2dfddbfc203dcfece751a3e05c72dd8035a7cc9e4bd2c9e2761a9cd636fc5d38';

COMMENT ON FUNCTION "qti"."__constant_kzeitfadmd"() IS 'closed constant 30ae51315920c84d21077d4be25255b8b1d1552585a1b9f7da17e1b850cf1825';

COMMENT ON FUNCTION "qti"."__constant_jcrhrb7n2a"() IS 'closed constant 3153c08d576b0c96dad4f4cf2824849f2c2adb662d6c998f86381a9528965fe7';

COMMENT ON FUNCTION "qti"."__constant_6q2e63bhto"() IS 'closed constant 3200391b20851afd25976424ea6e18c52dc10ce142c4f09e00d19aee72915d20';

COMMENT ON FUNCTION "qti"."__constant_g6oyyfttzw"() IS 'closed constant 323a4812a928fccb9fce1e470482909ac38e2eeb78d3e926f26f580dcb6a6653';

COMMENT ON FUNCTION "qti"."__constant_gpsojklyfc"() IS 'closed constant 33a90f89d05a01db74e4df7c46b384227a6ad825f3cbc8696a0fe8d5d815c46b';

COMMENT ON FUNCTION "qti"."__constant_wfzm5kdfvy"() IS 'closed constant 365b553ae76ce076fe629333bd2ccb01441961b5c0ca7a83c0494d9fcbbe1b00';

COMMENT ON FUNCTION "qti"."__constant_pcgb5latkm"() IS 'closed constant 36eba75b645a94bd44baffd1eab9259b481af5ea3352a0265135eb97aba7b577';

COMMENT ON FUNCTION "qti"."__constant_w2xzlqaryb"() IS 'closed constant 39be8d60e0256d9d61fee6feaafaaed92295a14ff512221bef5833df7ca646e8';

COMMENT ON FUNCTION "qti"."__constant_csx3c5jera"() IS 'closed constant 3fa429f52aca14c0f2730aaf6f101647e33d7201aa2dd2b2585abbde756d878a';

COMMENT ON FUNCTION "qti"."__constant_buwj6qbmap"() IS 'closed constant 3fdd5474c402f352a84c667ee2b8337d03129f3b4d7f3a5d213d95a607d560af';

COMMENT ON FUNCTION "qti"."__constant_3irab4cub2"() IS 'closed constant 4010de84d2d2150e949596cac5eb5d27cc02845e133ec48f7a17451bb904362f';

COMMENT ON FUNCTION "qti"."__constant_qnicfbtyhh"() IS 'closed constant 4311ad3b6e28445ff0b0a595e6a35f0910fbe8a06cd75b3c0ff098902dcef89e';

COMMENT ON FUNCTION "qti"."__constant_cvrzwozguy"() IS 'closed constant 44d605ae4dff6fd44f776534dad35e804e4cd6b865dd3e14b3cbaa763c76c3a8';

COMMENT ON FUNCTION "qti"."__constant_ciuqwbhuta"() IS 'closed constant 44eaa480767984ff0a1bad73f9be90634659bab8c0320c9c24b3b52f422b3aea';

COMMENT ON FUNCTION "qti"."__constant_arhuab2szk"() IS 'closed constant 4b267993c5d0ca71e031d6aee76b196c4b5069960a9c7a2a8fb8d755782613cf';

COMMENT ON FUNCTION "qti"."__constant_cz5a2jxuz5"() IS 'closed constant 4c12d6cb50c4e1a78c1c875eb1f2e0734179c88025605b3bfe6fee491e6e31cb';

COMMENT ON FUNCTION "qti"."__constant_454uuzhqfx"() IS 'closed constant 4ddb30eb2878f7c01d0377d59d8f5f3b36e8f671301cb97aa8671d748bdaefd0';

COMMENT ON FUNCTION "qti"."__constant_oqtke4h5mu"() IS 'closed constant 4df7cca56ccf0b7cb32cd64de0b323ab79d1a3f99b75dc2d1cce0057bd7ccd0b';

COMMENT ON FUNCTION "qti"."__constant_2qqn5wzl7u"() IS 'closed constant 5184ff4324fcb4c6b5449493c3b2a8ec303eb0b335611f8622cacf72a9a03f50';

COMMENT ON FUNCTION "qti"."__constant_m4hpl7rh2v"() IS 'closed constant 5204895525e7776e042f93592535f9f5f1d35b865baeef8b277bc6f162dbf512';

COMMENT ON FUNCTION "qti"."__constant_tq43p2kwpb"() IS 'closed constant 5275cce3490b6648eefc3fc33898efb2079e4aa08dd2b65c44d26fb8d888526b';

COMMENT ON FUNCTION "qti"."__constant_rxqruxgxt6"() IS 'closed constant 52ea8474a274755e063a6e639e7d90f151535c45f547349517ad12e625204b8c';

COMMENT ON FUNCTION "qti"."__constant_eufobqzn7j"() IS 'closed constant 532dea174bc2c07effa2aecebf61a339e178c504ecd33112ab8fbd191048430e';

COMMENT ON FUNCTION "qti"."__constant_ctookwgtko"() IS 'closed constant 53d9a7361fc0c1020591582d2c6e6b2898c64265325ad69fb732a895b599f7fb';

COMMENT ON FUNCTION "qti"."__constant_yg6vkuovwv"() IS 'closed constant 54d15ebf31176f6e522240057ba7faeb042ff01de3a0a8269c494490dcbc899d';

COMMENT ON FUNCTION "qti"."__constant_4rkhabvc5a"() IS 'closed constant 5617802091f71cc3f1b40900c3b9a1510774eaf8e0d33a4adecc53d5e063c780';

COMMENT ON FUNCTION "qti"."__constant_qrpsoa4uqr"() IS 'closed constant 5625b9324fbb48a16e70e9c0285eacb064b8d7b412324828d032c828414badc9';

COMMENT ON FUNCTION "qti"."__constant_ibjzqrmu43"() IS 'closed constant 5829709cecad31f4e28af91f89273ef372893097aa5e49f038e468655d3e63fb';

COMMENT ON FUNCTION "qti"."__constant_kxfbda5drm"() IS 'closed constant 5a5ddd7ecfb33df1de516db95e26b41321e1c523f7db019c753b85eabe0641c0';

COMMENT ON FUNCTION "qti"."__constant_2xctpszff4"() IS 'closed constant 5b8ebf56f30f390c1b4fc602e0dab5e49a7912d03b11f95745b0709012473178';

COMMENT ON FUNCTION "qti"."__constant_kclguiw7tp"() IS 'closed constant 600ff0cb4340a28466c006d2420e7722c1bc6b78b1ea48ee8c4655625ff78356';

COMMENT ON FUNCTION "qti"."__constant_zkoyt4vrk5"() IS 'closed constant 615da76ba7a41b0a1b9f88be0278d4eb5576b48e16c55b0219097375c3b9f3c1';

COMMENT ON FUNCTION "qti"."__constant_sywdwb244e"() IS 'closed constant 6255a2f5024c9684b123b133fc05e404a8fddef64803e6ae989c421fcdd74a6f';

COMMENT ON FUNCTION "qti"."__constant_bqoq27hf4b"() IS 'closed constant 63373557e444e9fad935fb060c5ce1ee0428645c6c1b6cf92f66e12283b9b1f0';

COMMENT ON FUNCTION "qti"."__constant_dzjfphbnei"() IS 'closed constant 6397e6ca8aa80f8b22fca36c7e921607a98f7b451361581b52efe41887ac704f';

COMMENT ON FUNCTION "qti"."__constant_2vjqk3ym75"() IS 'closed constant 63bba0a9afc72d5d3bb2dd399f0ddf29f5770c40663b92e0d3dca486aaa6317a';

COMMENT ON FUNCTION "qti"."__constant_rnitcynfss"() IS 'closed constant 649d0db28240d0f6b1e9da396aadbe04104e2599dd9d17eee6c8d477e6ab1abc';

COMMENT ON FUNCTION "qti"."__constant_jliv5ybd5f"() IS 'closed constant 64cb613aeb28fc9035d21bf9c42424a121d1f208a70e56e35ee622d694a123f6';

COMMENT ON FUNCTION "qti"."__constant_omoipacrlm"() IS 'closed constant 684d06e5ddb3ca7c5245581fc543663e70bc3cd20f9faf22dfa3e75124eaea2c';

COMMENT ON FUNCTION "qti"."__constant_wrlwssqvsp"() IS 'closed constant 6b2c8a56f7feb5f922786a144974000d08994471031047416752aa3041e67626';

COMMENT ON FUNCTION "qti"."__constant_5vczbwx7y7"() IS 'closed constant 6e35937efed8032155018853dc7f5c53cb9c96828fb662c161baa64ff1e98672';

COMMENT ON FUNCTION "qti"."__constant_ou2t6op6bu"() IS 'closed constant 6f349da10878674cce4ea38ef5a4b51b29cb52ae4b8b6e2556cba2a9fd77e060';

COMMENT ON FUNCTION "qti"."__constant_l2aceonlkt"() IS 'closed constant 70bf0b3728c12845780547cf14c99129e109d1b627091bac32abbc9b72acebec';

COMMENT ON FUNCTION "qti"."__constant_e66hiikbrr"() IS 'closed constant 7204ab8c581e5513288410e476b37633d00fccbbf5a09ade5c33f879a05da1ae';

COMMENT ON FUNCTION "qti"."__constant_evyd7rljhw"() IS 'closed constant 722a19c22098b16e34941575c050b99b9bc523f8254823e61390036b22d83c49';

COMMENT ON FUNCTION "qti"."__constant_o5olztrwj3"() IS 'closed constant 72d2490f1af30e395f37e6964cb9ca1894c3ef49e8f2f58434d923bcf0570a6f';

COMMENT ON FUNCTION "qti"."__constant_drya55lgvi"() IS 'closed constant 739b51cb2d859ff1659ddae059782ac29bf34f34b2a8253c38e18337a11a3a24';

COMMENT ON FUNCTION "qti"."__constant_ctyalchk7x"() IS 'closed constant 747135f553b39716dfbcf7c47cb6633f18450171763b206fdee99ebddf20edcd';

COMMENT ON FUNCTION "qti"."__constant_6ywqvozu2t"() IS 'closed constant 74a0067af541f512d67ac181a5c90b725f339c3130609e6b0813207242a296e2';

COMMENT ON FUNCTION "qti"."__constant_clkl2ozih5"() IS 'closed constant 755c82455892c600a5a8a2d93931c0942bdfbd079cef77b8551b36f005aa673a';

COMMENT ON FUNCTION "qti"."__constant_62agn6ra2l"() IS 'closed constant 77e52fc26d9e744f4ed42bea1e1d6c7d5af6f9623a486c949d56354cd5a40102';

COMMENT ON FUNCTION "qti"."__constant_xsnkv3y3un"() IS 'closed constant 7954f698a65c7de77be75a436a4de61b60296e846395dcd2ec4af02516e17880';

COMMENT ON FUNCTION "qti"."__constant_hceanuyjz4"() IS 'closed constant 79d29a58de18df654e6f20137451e867712d6ca676307458b7491876a9e6a36c';

COMMENT ON FUNCTION "qti"."__constant_2q2jviefor"() IS 'closed constant 7ccc4ade8c664828b18450344ea2d500289b8b9c9b7c60a5f18cf92a963513f4';

COMMENT ON FUNCTION "qti"."__constant_gkrzvuqpdw"() IS 'closed constant 801cb4b106c8ca170abe242e186ed0c9bb65ee330f5371c7fa0efc37f3edb7e1';

COMMENT ON FUNCTION "qti"."__constant_wlajmt22p5"() IS 'closed constant 806a3fd10e7196b525336bdf030352051f7971c3ca933839f4dc88855ca8941d';

COMMENT ON FUNCTION "qti"."__constant_iogyvkhbbn"() IS 'closed constant 80ac69385ec58731a9893c46daed0d8725695e0351b69a5f1093c21185e389b9';

COMMENT ON FUNCTION "qti"."__constant_xem42aq3by"() IS 'closed constant 818f98ff10d2cac1a3f04f54c47fdd7654f4d0c0476840b8007cd5f96bf6e7f8';

COMMENT ON FUNCTION "qti"."__constant_b7gaby5cp5"() IS 'closed constant 826fca8b28e7e7e20b0bedb9b1b258de352cb299169afbf44636f0f02817d7c6';

COMMENT ON FUNCTION "qti"."__constant_hnm2zjjqct"() IS 'closed constant 873714a651dda9293e13dfadb6418cb9cc63cc097391d1d505d98822dba15aa5';

COMMENT ON FUNCTION "qti"."__constant_kfdglmgwkg"() IS 'closed constant 8c386599c69a6c55ad9ed75a5f2860fdd74b3848fda469bfd0630ed26cc0cd27';

COMMENT ON FUNCTION "qti"."__constant_iuohhkid6z"() IS 'closed constant 8cbbc53651548dfd7543d8d660524f0f59157291e0b24a2161928be24b6f4f94';

COMMENT ON FUNCTION "qti"."__constant_yzjewq3gl4"() IS 'closed constant 8de145cc7af268596b3166d6ecb797b36c85e4fb1c61fd128c50357795e5bcc6';

COMMENT ON FUNCTION "qti"."__constant_ck6xbijk2a"() IS 'closed constant 8e4dced79badd17eb92e9c6e973dec2166b314879f68585f5d566e74174ad2a1';

COMMENT ON FUNCTION "qti"."__constant_f2peqlhxow"() IS 'closed constant 8f21750904822d38572067712a4866effe88d58e2324dcbf6c2aa271b206c9a6';

COMMENT ON FUNCTION "qti"."__constant_msdavlzjqv"() IS 'closed constant 92285b1331b4411c5366519295554c8030c478ec5b82becb3acec14768fb97e2';

COMMENT ON FUNCTION "qti"."__constant_7tung7crtg"() IS 'closed constant 94767fb3bf9c2dfd1f714d7729a8832e9479073e20347e4a7741baf6d6ed401e';

COMMENT ON FUNCTION "qti"."__constant_u74ar6arnc"() IS 'closed constant 978653090eab930b6a871924ba435aa9f6386c54810df29d09c214d110a1cc74';

COMMENT ON FUNCTION "qti"."__constant_zei655nkpr"() IS 'closed constant 99d8787a581edf46cb5e201d4ab7cb37d8389b7fc226abba4a9da0e750e862da';

COMMENT ON FUNCTION "qti"."__constant_tviujcq2wb"() IS 'closed constant 9bec9b99e6ec4013de758b9d394b0a7a1852e738eb286060265c269d9b063fed';

COMMENT ON FUNCTION "qti"."__constant_fhvqv42slo"() IS 'closed constant 9bf432f042066bd6fd34aa085aea79567203c41ffb18fb615314eac315064028';

COMMENT ON FUNCTION "qti"."__constant_5g4tvuqimr"() IS 'closed constant 9eb6e19c9d99763bcec12165ef467c0afe7f8c3036fdf49599c2b99a5aee854c';

COMMENT ON FUNCTION "qti"."__constant_ekoivjlftu"() IS 'closed constant 9ecbf49b1e32aaf7f13b303357047bc4a4789695984ec42874069e013f105627';

COMMENT ON FUNCTION "qti"."__constant_74s5vidd2f"() IS 'closed constant a28a5798c3e2ab0d01a8ee96e671e22866326ac8d9e80f1e9d372a7550185886';

COMMENT ON FUNCTION "qti"."__constant_zld7kjwz77"() IS 'closed constant a29629597a360289dc2b8f2a4b27351737fb798638d3be7983bb4c3fe3e805fa';

COMMENT ON FUNCTION "qti"."__constant_tjbel3wcju"() IS 'closed constant a479cf289b260f867432ec05339efc78dce6d41b7d2cbe8ee66b3d2f9b0424f2';

COMMENT ON FUNCTION "qti"."__constant_lix7a2qgpc"() IS 'closed constant a6f4c7e6d0cbc1e4186fbae365f899899cdee515ee68368ac5a40351fc4cb49c';

COMMENT ON FUNCTION "qti"."__constant_gj4ty3mmm6"() IS 'closed constant a81aff005a84dda9939a904fea0debe7fbdf0529f83d226aaaf8d8a211d81103';

COMMENT ON FUNCTION "qti"."__constant_qdsptpwpdn"() IS 'closed constant a82518a0fd70d0edd08778ffc360533821b30ba530d597221a2223fd1e1f39c7';

COMMENT ON FUNCTION "qti"."__constant_k66yk4eyrd"() IS 'closed constant a8bb97c1f1626706eee003e1a1b248a5f68d18bfed385b90dde67119b8b48b83';

COMMENT ON FUNCTION "qti"."__constant_vynzho76eo"() IS 'closed constant ad5ff3b906d16d731492b8b4eba649d4614151d4568f769415ffcb23990ad52d';

COMMENT ON FUNCTION "qti"."__constant_dqbnkda3gg"() IS 'closed constant b00aa773fb7f2fdee47bc523ec52d4ba2427091eb0f8028990dee66487717735';

COMMENT ON FUNCTION "qti"."__constant_idqixm5mfr"() IS 'closed constant b31b7f16ca68627d9de5b8797a6c5db838f688d7b72b5c4f65319740cb2827e7';

COMMENT ON FUNCTION "qti"."__constant_ki7x6htob4"() IS 'closed constant b36778a6f0a20abe8f3d7f189be1e9e1af8fb1e71a852f7ba60c0642117ab2b8';

COMMENT ON FUNCTION "qti"."__constant_vmztpnm7jl"() IS 'closed constant b410fb1af8c90bf95fc06c2001faa62e2ae682c1b25ffe4a6a54dafe896d153c';

COMMENT ON FUNCTION "qti"."__constant_knqq7teaua"() IS 'closed constant b5ce13ae4d5cc9356edee43270fe4607933024b2d47c5bceeff77acd07fb4272';

COMMENT ON FUNCTION "qti"."__constant_on7irbswfh"() IS 'closed constant b6458692de17b90b46b87cbd1694a96a089fdb57655a9047dbfd45545b57929f';

COMMENT ON FUNCTION "qti"."__constant_expkozj4sr"() IS 'closed constant b6a6c617a83e512668af2685aa34bdc461969055b9300862d15e8695e218efb6';

COMMENT ON FUNCTION "qti"."__constant_wvuca46fcu"() IS 'closed constant b86f0300664f3712679bfd0d2602747120267bc4836df717c1a5191817133400';

COMMENT ON FUNCTION "qti"."__constant_e4ftofy4tw"() IS 'closed constant ba8a3be20aad123df5bdf9c2923cf996730f66f8adaba583b3f838944b3ee137';

COMMENT ON FUNCTION "qti"."__constant_5rxec3s5g5"() IS 'closed constant bbe36ed8d192bd3186cee47c8094acab1ceebf07cf0eab4118684d3d86647238';

COMMENT ON FUNCTION "qti"."__constant_l6v6mdqq6b"() IS 'closed constant bc324761f334c5ae150dc20d7ebe8c91d99c7c833b8475d554f74c5b5f62482b';

COMMENT ON FUNCTION "qti"."__constant_7n2gpfboh6"() IS 'closed constant be92a62dca1aa6b8f7346c7e851f723756520842ec76986890af1db4c3e7a9db';

COMMENT ON FUNCTION "qti"."__constant_ejkw66w2je"() IS 'closed constant c0425c74dfc7eff7c10920bb9b085c2f0b3353baca0710384369fe1232e405b8';

COMMENT ON FUNCTION "qti"."__constant_ougbyryzef"() IS 'closed constant c526ba31c5661ca80324332f512e6dac01e8761315388018b0dc38d3060e7d87';

COMMENT ON FUNCTION "qti"."__constant_syf46bbkfx"() IS 'closed constant c5da3f0c7facbefed54bef4b9fb9d2906ba096c2ea3c0aea4c405aba88cfa68f';

COMMENT ON FUNCTION "qti"."__constant_w6ooxfv4ym"() IS 'closed constant c609d30df87519717000f283a4f989f474d6d5f9ca6dd54692123b69b569be1c';

COMMENT ON FUNCTION "qti"."__constant_ro353pncb2"() IS 'closed constant c622c8c89d5b6b45ee18654d211a53c8e261e10791227fa08b45e55f0a016128';

COMMENT ON FUNCTION "qti"."__constant_nugza34qyx"() IS 'closed constant c713a837a7dd6a288d7cd84ecd4b6c2474fab28f5c1aed56ed8decdc359da710';

COMMENT ON FUNCTION "qti"."__constant_yuqao2rftg"() IS 'closed constant c88fa374098e1a2b767ed8433c2dd630dba233303b3d3f30f05a4726c527e88e';

COMMENT ON FUNCTION "qti"."__constant_isjwka4zqg"() IS 'closed constant cbdd903381b0e8e10ed6acd03d2b0da1a3b3878fbe61598397f6734851a61322';

COMMENT ON FUNCTION "qti"."__constant_2kq4algrsr"() IS 'closed constant ce388f9e686ef5d395a9f4412fb7d103b31aa5ec7d40d863055b6ac65a0e6ed3';

COMMENT ON FUNCTION "qti"."__constant_zycshrf7wo"() IS 'closed constant d002c2638d6ec6f6aa98d5093dc061694b79f72ae07a2424d97ab2213c47be73';

COMMENT ON FUNCTION "qti"."__constant_6bq3qwxfoa"() IS 'closed constant d12819b004bd60363f7bc784df0306013ba3e9890a939ff44c3918f3575d0620';

COMMENT ON FUNCTION "qti"."__constant_zyvz7ew5kw"() IS 'closed constant d13954cdce6c56ab21163a2c28622d7db6425b95b9912d21d4ce972ff4157c54';

COMMENT ON FUNCTION "qti"."__constant_abnivfsahd"() IS 'closed constant d144b0684017ec383bd0472976bf8b54e5bc9678642495e760eb2d94b9ced03a';

COMMENT ON FUNCTION "qti"."__constant_k6jwhkzeju"() IS 'closed constant d147731bf3602eea47c0fb68102dd7037cd1027d71c18ec5ca87c9a4b7ef1da4';

COMMENT ON FUNCTION "qti"."__constant_jjczpizw62"() IS 'closed constant d318f29c9384f27ec7428b76168e81305df7b4a7a8c0b2ec28d71dc7936c553f';

COMMENT ON FUNCTION "qti"."__constant_luys6mkawb"() IS 'closed constant d6014364a7052dc289eeb3016cab35899e9ac95f89a5329e4cd7dcdf1e413658';

COMMENT ON FUNCTION "qti"."__constant_tjrh4tk22y"() IS 'closed constant d6cfabdbb0ac0c9cdf41bf28a32673dbe362ac137abae5125551cebed7ee1b4e';

COMMENT ON FUNCTION "qti"."__constant_wuqtd2dywh"() IS 'closed constant db440e986908c801d2fe3ded5166a437ad23ca769cedb8dbb7d161bd6f620cf3';

COMMENT ON FUNCTION "qti"."__constant_ihq7f766ro"() IS 'closed constant dc81b58e43ec134c5ba6054d6f2b56fc1756e144e2bda6b28682d92b91117d45';

COMMENT ON FUNCTION "qti"."__constant_okfqkrtnqs"() IS 'closed constant de0bba0f3b41761ee2979534603050aa06d91cf60bce2e0d6d6f7da7af26904e';

COMMENT ON FUNCTION "qti"."__constant_nauygyylpv"() IS 'closed constant df78c5a077242a1df9ae93149dea05e2e625e5988c83e959d1c943c4614f207e';

COMMENT ON FUNCTION "qti"."__constant_hczbxpm5lv"() IS 'closed constant e036ae0f32a48f0103617774f8b8f7004ceca3bd80e06a6fe14c688c7d4905bc';

COMMENT ON FUNCTION "qti"."__constant_omna7jx3ps"() IS 'closed constant e0bbc51ec3ab209806d3d9dedac8da2371e22769d84658cc727e6acd2d805e05';

COMMENT ON FUNCTION "qti"."__constant_6dinz7u2yi"() IS 'closed constant e1e919097c7da947968606c9731bf4fe598c4f1456933fba93c4bca2c06d65c9';

COMMENT ON FUNCTION "qti"."__constant_kk3tbfzgkz"() IS 'closed constant e2b2a58ecdc4194bb9365274491665cdf519a5fc65cfbba6925d5d0af5f5feee';

COMMENT ON FUNCTION "qti"."__constant_3ja5lqhbu3"() IS 'closed constant e3103109ec5a39c6350695ea1335380e24b8c853caffc06dc38c65b16815e726';

COMMENT ON FUNCTION "qti"."__constant_eltdht6njd"() IS 'closed constant e3504d4594824cbca4b16c142dc611f33286cbdc706868e37365bbf0256eb7e0';

COMMENT ON FUNCTION "qti"."__constant_74sws3a536"() IS 'closed constant e4bb6c6962cf5efd04a33bbe4fd19e6fb3fcfe7d6005811f15436416fb71467f';

COMMENT ON FUNCTION "qti"."__constant_cmomvytsjq"() IS 'closed constant e557f308f1c898ea45fc8bc4b103cfc6144a152ce21a862a9dd9939a030455a7';

COMMENT ON FUNCTION "qti"."__constant_xqtuffyay5"() IS 'closed constant eac800bd5cced6c473d2d9acf3bc2e27371724da7aab3bf7138dca0ed6b53030';

COMMENT ON FUNCTION "qti"."__constant_eh2p6pjltu"() IS 'closed constant ecd840ed652b0c508d5465357c0de2fdfe8abf8f15d0f4d844a7f16964169e9b';

COMMENT ON FUNCTION "qti"."__constant_obvdrq3725"() IS 'closed constant ed42853178a4fd29dfe965e4b1d912f5d20de1e8d87015b0274c81b452b15c5b';

COMMENT ON FUNCTION "qti"."__constant_akedz6pilr"() IS 'closed constant ed835955eba69c74c816f3fee191eaabe828635c381ee05f97ff49bf84d4a712';

COMMENT ON FUNCTION "qti"."__constant_taww2a5tgr"() IS 'closed constant eda7fc6bf95a55c320c99e5c3646c566432acc70e74fe46914c796041f789cad';

COMMENT ON FUNCTION "qti"."__constant_gqyrbuxeym"() IS 'closed constant f09b43029364b98a1d1afd2d8f421aa45be43b0a6e9d6af04ce50d4f8fd72a35';

COMMENT ON FUNCTION "qti"."__constant_sgpkb6hk7w"() IS 'closed constant f23d97fbb5ebcb8fc710944f8216af8acf3503bb4c7ff7f5daae54dd50d6abb8';

COMMENT ON FUNCTION "qti"."__constant_t7fktrlslv"() IS 'closed constant f2aba0c193ff382e8ef6cc3def6946597718b3295d7f566e43f66856d98f9502';

COMMENT ON FUNCTION "qti"."__constant_j3cmb4thc2"() IS 'closed constant f75a0fe4dfb0bf89a6a3f30c432ff678627753d786276590510759cab326317c';

COMMENT ON FUNCTION "qti"."__constant_hygd7nfdcf"() IS 'closed constant f8bd34ab1d78f7d63582bb8b063e461be466180b42dcd81db20836ae01adf514';

COMMENT ON FUNCTION "qti"."__constant_4hs7fzokws"() IS 'closed constant fa5b245365a863b97c490c8a627ca6282596f0232e41715f8b493938cfac5268';

COMMENT ON FUNCTION "qti"."__constant_tzvpybzw74"() IS 'closed constant fc0b09a47ade10ea4056b1709ebd3f9d756a34c24bcf70d25cbd03f7420a2171';

COMMENT ON FUNCTION "qti"."__closed_row_cq3qq2e2aa"(bigint[], bigint, bigint, bit varying) IS 'library function closedRow (e0d05052ca72a16365ada509200b41a96287f5bf7828be0f6a8a8fea8f8bfa0d)';

COMMENT ON FUNCTION "qti"."__is_xsd_pattern_epnlukuxgp"("pg_catalog"."text") IS 'library function isXsdPattern (810535f179013563ee11f1eca86d3d6ea53fc9e96489237df9f075c2297bbf09)';

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

COMMENT ON FUNCTION "qti"."__navigation_mode_names_uhf5rddglr"() IS 'names of roster NavigationMode (212a6dff903123f392491c2f3ec3a31e72ad1c9ff480b4d16acd060b414c19f0)';

COMMENT ON FUNCTION "qti"."__node_kind_names_ulbko553n7"() IS 'names of roster NodeKind (6dea561781fc88707c0fa5169d6a20a2548594915bf7dfa0256ac50e05715acb)';

COMMENT ON FUNCTION "qti"."__position_names_sglcn7ygpg"() IS 'names of roster Position (a1a60d4aa06104360f551f05cca99ac7fe578fbc3fa7fd74a1e0fec72f2677db)';

COMMENT ON FUNCTION "qti"."__reference_form_names_gm6ro5a5jp"() IS 'names of roster ReferenceForm (d6c6a50de9096ecbc3c3119f09c6838c0b5607cb8ffe43badb4a76e0dc821f67)';

COMMENT ON FUNCTION "qti"."__reference_resolution_names_zfbhfhou4v"() IS 'names of roster ReferenceResolution (9b407eb7cd8883dc46e44c7fd0bc3cf93de68527bb8efaeda9dfbfe42839716a)';

COMMENT ON FUNCTION "qti"."__reference_spelling_names_gocqpuf7tl"() IS 'names of roster ReferenceSpelling (d17fe4490649b642da71426e1581a670779f42a7b20ee7c9ef28b6a9628aa0dd)';

COMMENT ON FUNCTION "qti"."__resource_type_names_2tbbvn3ion"() IS 'names of roster ResourceType (ced5fe1564e0a8e81e6ed722e012aba7f520e83798020b38dcb9f954ec7f0282)';

COMMENT ON FUNCTION "qti"."__shared_model_names_5s5lwnfjh3"() IS 'names of roster SharedModel (2bb22812fae0ee7cd348c54155c525015f6d12afe5856c6b30af95ddd60f143e)';

COMMENT ON FUNCTION "qti"."__submission_mode_names_ihmg3iyv22"() IS 'names of roster SubmissionMode (055cb5dcf6ded4650f9f9e0bebd108d2a7135890205ed2890477351fafbdedf0)';

COMMENT ON FUNCTION "qti"."__symbol_set_names_7wklvi4qhu"() IS 'names of roster SymbolSet (5f3c364538a7246c98ef8a549dd6452a21b767f5164eb24017b420a40ef01cee)';

COMMENT ON FUNCTION "qti"."__type_name_names_ksmacbo3df"() IS 'names of roster TypeName (86a2ec787f3d5c26228c9e866eccbc74af5c465863d21e3f2dd1d0149e191ab3)';

COMMENT ON FUNCTION "qti"."__unplaced_cause_names_p5tit5zgq3"() IS 'names of roster UnplacedCause (e3150d3ad4e7ad590b56215b77ab8cbb7766fc206ece30036f6c6b4ffb6674fc)';

COMMENT ON FUNCTION "qti"."__use_names_vmbq6fav2t"() IS 'names of roster Use (9a115d57aadecda9d7a7b7cc81df91be5fef70b5cafa5ec4401206fbed113e3b)';

COMMENT ON FUNCTION "qti"."__value_base_names_pjzlcpdwvv"() IS 'names of roster ValueBase (5d761cedc66f7cf75deb2567ff85de0930d527d600883d914f6486ab0734a395)';

COMMENT ON FUNCTION "qti"."__value_cardinality_names_wzwznoycgf"() IS 'names of roster ValueCardinality (ce98dc14ae9c0fe80302c657e1ae084670c344bef60bd8949b01932c73dfc180)';

COMMENT ON FUNCTION "qti"."__value_domain_names_oytpyotwgr"() IS 'names of roster ValueDomain (298c35a8dddf0633e291036fd715c237f658c31ed0383d1b409890adddcac8ed)';

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

COMMENT ON FUNCTION "qti"."__navigation_mode_live_6xkdepk5cz"() IS 'live codes of roster NavigationMode (f80b6953419f9aa8ea93323a6d5e3f06182c57018d537842383ceca681622491)';

COMMENT ON FUNCTION "qti"."__node_kind_live_b7rifmc6m4"() IS 'live codes of roster NodeKind (92ba7ed1baa5c9a5e3c0ea3e565d329aef095a286aea862ae450f27635ef2522)';

COMMENT ON FUNCTION "qti"."__position_live_pi53civw33"() IS 'live codes of roster Position (8c8eea92756004abcf3132e4af65300cd345d89f80253e7878a54114ab53ed5d)';

COMMENT ON FUNCTION "qti"."__reference_form_live_sckdmazr47"() IS 'live codes of roster ReferenceForm (b74579d3b64ecff081cab2731adb2464f839e99b2eed45d65b3c1547c74f2de1)';

COMMENT ON FUNCTION "qti"."__reference_resolution_live_6hzgo5pknw"() IS 'live codes of roster ReferenceResolution (b74579d3b64ecff081cab2731adb2464f839e99b2eed45d65b3c1547c74f2de1)';

COMMENT ON FUNCTION "qti"."__reference_spelling_live_ke2xl66eo4"() IS 'live codes of roster ReferenceSpelling (f80b6953419f9aa8ea93323a6d5e3f06182c57018d537842383ceca681622491)';

COMMENT ON FUNCTION "qti"."__resource_type_live_m5qnrkbzgq"() IS 'live codes of roster ResourceType (567d64af3e5bd0ad1534623c63ed4513027cb6c852ad3f72501186407adbd2d6)';

COMMENT ON FUNCTION "qti"."__shared_model_live_37zbpyitfj"() IS 'live codes of roster SharedModel (47d64fec5c90141889bd1894c36b38a3a7d21e0cf05af630bec3a4665d8f6e48)';

COMMENT ON FUNCTION "qti"."__submission_mode_live_zjnwusihdh"() IS 'live codes of roster SubmissionMode (f80b6953419f9aa8ea93323a6d5e3f06182c57018d537842383ceca681622491)';

COMMENT ON FUNCTION "qti"."__symbol_set_live_3wo3lzfzqb"() IS 'live codes of roster SymbolSet (cb19412c22874ab5b38ef81f7e57b02fd7f1cc0f424b0af30c98b4bba33fb971)';

COMMENT ON FUNCTION "qti"."__type_name_live_dizeay3gzc"() IS 'live codes of roster TypeName (d534270d3ab0314eabee0a2e69d975ad37c9880558d25e962e6d701385ad9b0d)';

COMMENT ON FUNCTION "qti"."__unplaced_cause_live_7eeinprrjn"() IS 'live codes of roster UnplacedCause (b74579d3b64ecff081cab2731adb2464f839e99b2eed45d65b3c1547c74f2de1)';

COMMENT ON FUNCTION "qti"."__use_live_qqc6fbn3jc"() IS 'live codes of roster Use (f80b6953419f9aa8ea93323a6d5e3f06182c57018d537842383ceca681622491)';

COMMENT ON FUNCTION "qti"."__value_base_live_pesuextzp2"() IS 'live codes of roster ValueBase (e79bfce2f47606d52f27e502d6c35b0c7b3674a75f45a4bd15d681032e76277f)';

COMMENT ON FUNCTION "qti"."__value_cardinality_live_img3c6yzn6"() IS 'live codes of roster ValueCardinality (591ae590686ec68aa03e699030fe62fdeae06b893d263428aab7d66397d0f1fe)';

COMMENT ON FUNCTION "qti"."__value_domain_live_fpcln73bij"() IS 'live codes of roster ValueDomain (0dbc329cc488045517aa2349ff3ad66f185360040cf747079aca739f61633651)';

COMMENT ON FUNCTION "qti"."__white_space_live_ywok3yue3q"() IS 'live codes of roster WhiteSpace (172efd8b2eef24193d3dce248edca3d8416daad89c20bd6348c3a5d0e86d4d5b)';

COMMENT ON FUNCTION "qti"."__xml_standalone_live_ql62ubmw6y"() IS 'live codes of roster XmlStandalone (f80b6953419f9aa8ea93323a6d5e3f06182c57018d537842383ceca681622491)';

COMMENT ON FUNCTION "qti"."__row_ukt5skmgw4"("pg_catalog"."text", bigint) IS 'row function f308866a43e2b93e7cdc45d0a55cb94617aee1bd740423bc268898b1b9447812';

COMMENT ON FUNCTION "qti"."__row_daqe3iivcx"("pg_catalog"."text", "qti"."cn_part_form", "qti"."cn_base") IS 'row function 2c69a0b2138512eae1b286808dafc83fc7356d91d3061ef861ca75ecef498b52';

COMMENT ON FUNCTION "qti"."__row_nd6jocdab7"("pg_catalog"."text", "qti"."cn_base", "qti"."cn_type", "pg_catalog"."text") IS 'row function 0201e89659a6cf221c765ecfc7b0a772659bcbb8d29d64763f049507c449812e';

COMMENT ON FUNCTION "qti"."__row_xshfiwaotx"("qti"."cn_part", "qti"."cn_type", "qti"."cn_part_form") IS 'row function 42f442ca5eec53ea8ea08e4c7da29d78c4ce7cbda4ab86e787ff75254d764b13';

COMMENT ON FUNCTION "qti"."__row_jufhya6ohq"("qti"."governor", "qti"."attribute_name") IS 'row function 3c5d3dc0c63976ed623ee36954de83587d7e95ec89c6c2a082fc579559bb4dc0';

COMMENT ON FUNCTION "qti"."__row_cphscp5lzn"("qti"."governor", "qti"."attribute_name") IS 'row function 61376e34a814f9e8d51edf471455fb0f22cc188e8601cbee4e072ce4a3110693';

COMMENT ON FUNCTION "qti"."__row_whdasjrjsa"("pg_catalog"."text", "qti"."href_scope") IS 'row function 4f8d27ae50070c538832846422ceda590adff69038a3004f8a7013da3f2a4db9';

COMMENT ON FUNCTION "qti"."__row_n5rrjr54f5"(bigint, bigint, boolean, "qti"."node_kind") IS 'row function 3217a8e4e070435b48e3036a8ed679faf058bc07f8cda1a4d8114f53be455f32';

COMMENT ON FUNCTION "qti"."__row_htcdz4ij3p"("qti"."node_kind", "qti"."attribute_name") IS 'row function 4d23f9589bed3d7452d4a39747a79bbfbf5df9c5fe8aaceca2f8e310ec5bff8c';

COMMENT ON FUNCTION "qti"."__row_jmlc7ncyzs"("qti"."node_kind", "qti"."node_kind", boolean, boolean) IS 'row function 63f2391592da0cc21387fb05dd4efc91e110acee708dc1a63f2045c674c0a593';

COMMENT ON FUNCTION "qti"."__row_f633qllcrb"("qti"."node_kind", "qti"."node_kind") IS 'row function a636efec161f04d10bc4c99cb42b7f2ecf28ee1d0ffdb3b6b304a5fd9e990e39';

COMMENT ON FUNCTION "qti"."__row_l2prtbcl2b"("qti"."node_kind", "qti"."attribute_name", "qti"."attribute_name") IS 'row function fe869351dca8fa237eb92f52120a79d6252556cea4cc9682da6c8c819e56957d';

COMMENT ON FUNCTION "qti"."__row_eilsstqyjd"("qti"."node_kind", "qti"."position") IS 'row function 9243fbf09fbb0d784dba614e7b1cfb895026073c929dc7c2e33cf3c9e581ceae';

COMMENT ON FUNCTION "qti"."__row_oa2ad3ae5z"("qti"."node_kind", "qti"."node_kind", "qti"."position", "qti"."position") IS 'row function ce93be48a0855a2b02bba1be79b10c30de1bcad5b4c3fcd93f7dd738ff935c66';

COMMENT ON FUNCTION "qti"."__row_4vybx43xpe"("qti"."position", "qti"."node_kind") IS 'row function ec359226304ccc034412412faa5ef85987ffd8b001852220fc8e888a6069284d';

COMMENT ON FUNCTION "qti"."__row_uskzq3eryy"("qti"."node_kind", "qti"."node_kind", "qti"."position", "qti"."position") IS 'row function fc86909f2adb3ffdedbba53563e4428248dffaccd9bef00d1f61159a151d2d0b';

COMMENT ON FUNCTION "qti"."__row_budsd6lx3f"("qti"."resource_type", "qti"."node_kind") IS 'row function 09b5088d6e01f3b9bd2986a0d712cceea5a27f906acb8ec6e99efd2709e89a19';

COMMENT ON FUNCTION "qti"."__row_lryxyr4c6w"("qti"."resource_type") IS 'row function 63cb7d702a46f269177a4b70551588637c67273dfe596569971278f3b81d02b1';

COMMENT ON FUNCTION "qti"."__row_lhaguf6fdy"("qti"."governor", "qti"."node_kind", "qti"."type_name") IS 'row function 26e4e0fa4cf33cb08f4002e386bf6db21e92dde420bdb59ead7986658802b864';

COMMENT ON FUNCTION "qti"."__row_z6apnjaxe4"("qti"."node_kind", "qti"."type_name") IS 'row function 4df2c57146ab52431e2c5b783d07bc099aa51d0171f9310e5534bda80e733c07';

COMMENT ON FUNCTION "qti"."__row_4g646qzwej"("qti"."node_kind", "qti"."type_name") IS 'row function 5010402c848ee735480f84196a5bda7d81a9d7bdf15022b848ba1a35b52ee2ad';

COMMENT ON FUNCTION "qti"."__row_ud4ftg3q7k"("qti"."base_type") IS 'row function e6e92bcd7c4c0d43218a6b971d0cd76b9e871f52dd3ef0b75413351a5fc0fbb4';

COMMENT ON FUNCTION "qti"."__row_l6436mx3u7"("qti"."value_cardinality", "qti"."value_base", "qti"."node_kind", "qti"."attribute_name", "qti"."declaration_kind") IS 'row function 56efc68f571f1a0e9d2297b67d37a5f085880e93cb10dee95536ba94e2770fbd';

COMMENT ON FUNCTION "qti"."__row_6cwula5hlg"("qti"."cardinality", "qti"."value_cardinality") IS 'row function 98f406d8500e2b167f823434d9d92a3e2574850eb8bdfa15a1eb48703f2f21d9';

COMMENT ON DOMAIN "qti"."__attribute_name_bits_416_thr6i6sipt" IS 'sets over roster AttributeName of 416 bits';

COMMENT ON DOMAIN "qti"."__attribute_slot_bits_112_aecznthxg5" IS 'sets over roster AttributeSlot of 112 bits';

COMMENT ON FUNCTION "qti"."__row_rpz66ebjgw"("qti"."__attribute_slot_bits_112_aecznthxg5", "qti"."governor") IS 'row function 29b170cc9fea15eb6d26ba89dde3a0be517fbfdf73b5c9e2761a48ee8a1f550c';

COMMENT ON FUNCTION "qti"."__row_wbcfqyplew"("qti"."governor", "qti"."__attribute_slot_bits_112_aecznthxg5") IS 'row function 4bc28812951c6e2eb176df0c068d26a169e431f34250a877ff03a4f0156060a0';

COMMENT ON FUNCTION "qti"."__row_k6acbzbnax"("qti"."node_kind", "qti"."__attribute_slot_bits_112_aecznthxg5") IS 'row function 4fd178aaa3b0d366ad22fb236f9c445ac6ac15c1f656b2aaec067c4bbd7425c0';

COMMENT ON FUNCTION "qti"."__row_atwyv7vmnv"("qti"."__attribute_slot_bits_112_aecznthxg5", "qti"."governor") IS 'row function 91bf3bc61621bfb3290fdca5f73de25ca69ea58406fb95819baf9ba5bf1fd111';

COMMENT ON FUNCTION "qti"."__row_mnvtoctuvm"("qti"."__attribute_slot_bits_112_aecznthxg5", "qti"."governor") IS 'row function 9ad52e0af89f4dc43e6c72a66363154f2e56b60eca8db5b049359ad34def9586';

COMMENT ON FUNCTION "qti"."__row_44dtlrt4fb"("qti"."governor", "qti"."__attribute_slot_bits_112_aecznthxg5") IS 'row function b093228a9126c415a54fc3e662bd616b08e028dbd3d472d165e2c2b7b89eaba8';

COMMENT ON FUNCTION "qti"."__row_5qzzsze2bv"("qti"."governor", "qti"."attribute_name", "qti"."__attribute_slot_bits_112_aecznthxg5") IS 'row function f33aafe01476371c299723d557d3c7325a5b3fe6866d6dce843420b437831c94';

COMMENT ON DOMAIN "qti"."__flag_bits_16_llpdtzgaon" IS 'sets over roster Flag of 16 bits';

COMMENT ON FUNCTION "qti"."__row_fblgl67sgl"("qti"."node_kind", "qti"."__flag_bits_16_llpdtzgaon") IS 'row function 353268cdff3915fc11445b76dcf1ea1ee66f298cdbed362aae897d0a40da4446';

COMMENT ON DOMAIN "qti"."__node_kind_bits_648_lh43fw4nuo" IS 'sets over roster NodeKind of 648 bits';

COMMENT ON DOMAIN "qti"."__position_bits_312_cnr3fptmz4" IS 'sets over roster Position of 312 bits';

COMMENT ON DOMAIN "qti"."__value_base_bits_16_7t6pwwxbsh" IS 'sets over roster ValueBase of 16 bits';

COMMENT ON FUNCTION "qti"."__row_4gzkek3omc"("qti"."value_base") IS 'row function 76abeaee16adfb0fce7faa234a0b6e4859e080491b8d9cf58f4a475d6493cc12';

COMMENT ON DOMAIN "qti"."__value_cardinality_bits_8_mma4mwhphy" IS 'sets over roster ValueCardinality of 8 bits';

COMMENT ON FUNCTION "qti"."__row_tj2g3klipi"("qti"."value_cardinality") IS 'row function e77f6729a1a88f0d4ba9a887ccc2a13e465a38d517a06c8c534107a64fdd4f62';

COMMENT ON DOMAIN "qti"."__domain_gfw43vigph" IS 'domain of definition 39922592cedecf769d6df372d6df99e0b82206b0bf6dacd9722d0490f83cc782';

COMMENT ON FUNCTION "qti"."__row_fpg36ynyx4"("qti"."__value_cardinality_bits_8_mma4mwhphy", "qti"."node_kind", "qti"."__domain_gfw43vigph", "qti"."__value_base_bits_16_7t6pwwxbsh") IS 'row function 1c9f3766c019d4982b63ea7e5a101969026c31c3246eb7c42c220ac06d0f1fde';

COMMENT ON FUNCTION "qti"."__row_h27dbn7u5w"("qti"."node_kind", "qti"."node_kind", "qti"."position", "qti"."__domain_gfw43vigph", bigint, bigint) IS 'row function 5245cd5ff80196fc74b1a70d4ce45ef46d883b288c8b52a1d3de51c969ceb32e';

COMMENT ON FUNCTION "qti"."__row_ixjem3avhs"("qti"."node_kind", bigint, "qti"."__domain_gfw43vigph") IS 'row function 70dff01a81196d5a9ede5b20325db78bc486ca641b19ff96587e5e6d4f09b83b';

COMMENT ON FUNCTION "qti"."__row_3jggtz4hfz"("qti"."node_kind", "qti"."__domain_gfw43vigph") IS 'row function 7a5f248d7a6aa32d960ce9152e062f714e6e68899c8380e214ade7196e57efcc';

COMMENT ON FUNCTION "qti"."__row_osqjk7nnh2"("qti"."node_kind", "qti"."node_kind", "qti"."position", "qti"."__domain_gfw43vigph", bigint, bigint) IS 'row function be7d84693bf42c2e03f7dad7fef23488d01088c16686fc1a8b2549822141423b';

COMMENT ON FUNCTION "qti"."__row_tkhdy7thpe"("qti"."node_kind", "qti"."__domain_gfw43vigph") IS 'row function d9a1a5e04add6b1871d6be2f441b9ece8af46aebad20ac509b82aeb217fe0795';

COMMENT ON FUNCTION "qti"."__row_rqknubyw5p"("qti"."cn_type", "qti"."__domain_gfw43vigph") IS 'row function e01f385586f0b2d226260791168cb73b0a53dc935bbaf332be8ad6d6e9c2f76d';

COMMENT ON DOMAIN "qti"."__text_xj3zno7u3h" IS 'text domain of definition 07d1b4656d57d0bc0562fcffad24ee1556a8abcce1c308fdbd7953cf9ff4063b';

COMMENT ON FUNCTION "qti"."__row_dlooifa33s"("qti"."node_kind", "qti"."__text_xj3zno7u3h", "qti"."attribute_name") IS 'row function 255e8b99e39fd25fe088b781129b443117df67ebc5d5feb42c20c0f5997f3656';

COMMENT ON FUNCTION "qti"."__row_b5wnhkqk7l"("qti"."governor", "qti"."__text_xj3zno7u3h") IS 'row function d981894fadb799fa8943c4fb6cc391cc730a3441c295c49b5fa5892927890217';

COMMENT ON DOMAIN "qti"."__text_phcitidkqs" IS 'text domain of definition 09ffac9a9a1ca83dd6bd4c35d466e2a7121f867303a9e1b3c37d74f21aea2dbe';

COMMENT ON DOMAIN "qti"."__text_netnsfkgs7" IS 'text domain of definition 0aba2a82fe9fefde9a011f33fa307521ac470023393100289f8e2a1a6c7eef29';

COMMENT ON DOMAIN "qti"."__text_7nkeqry66t" IS 'text domain of definition 11e6a9745bcc70f9372e3f60f6170fac989cb51cb9a361ec7e535c1f0adf0c75';

COMMENT ON FUNCTION "qti"."__row_4jfxnlfpvc"("qti"."__text_7nkeqry66t") IS 'row function 98b272eed7a77daf45c54412b2604626c7aa08ea5a0ff8b38e1cf6b778920784';

COMMENT ON DOMAIN "qti"."__text_c6iptmtj2x" IS 'text domain of definition 1a67836d3b307da80f2e0d484100e3204d5ef072db811f6176933746e66c4089';

COMMENT ON FUNCTION "qti"."__row_mt4s3rmjwa"("qti"."__text_c6iptmtj2x", "qti"."node_kind", "qti"."attribute_name") IS 'row function 091652fb73991073be2e0680e0d220d78080ae4c9197a2fdda9e8399febaad04';

COMMENT ON FUNCTION "qti"."__row_mf5tbjlvzq"("qti"."__text_c6iptmtj2x") IS 'row function 14c312ba1433102fef9e00954da29db497b07d684b791bdf8b85caa0be4b474a';

COMMENT ON FUNCTION "qti"."__row_bwtlabtuhh"("qti"."__text_c6iptmtj2x") IS 'row function 14dc2896bb757ba79ebd047d44f4b9c65e1616f9a6f1f25162f0984dc056ca97';

COMMENT ON FUNCTION "qti"."__row_ui4lrahf52"("qti"."governor", "qti"."attribute_name", "qti"."__text_c6iptmtj2x") IS 'row function 54394ec5c6b8e7ae599fbc0d2cbe1800c27d69898948fd46b167af1cb67d76a5';

COMMENT ON FUNCTION "qti"."__row_fy74txqgtz"("qti"."governor", "qti"."attribute_name", "qti"."__domain_gfw43vigph", "pg_catalog"."text", "qti"."__text_c6iptmtj2x", "qti"."__attribute_slot_bits_112_aecznthxg5") IS 'row function 5dd85626b038e467c657483036ea5edc36dffa5c49556f67d422d417ddbb7405';

COMMENT ON FUNCTION "qti"."__row_whrjsvpqlv"("qti"."governor", "qti"."attribute_name", "qti"."__text_c6iptmtj2x") IS 'row function 5f1c53542207a5eb03bd2785dcb035b83ddb664f24b9bc2267b2a002b206e8cc';

COMMENT ON FUNCTION "qti"."__row_zowi3yosa3"("pg_catalog"."text", "qti"."__text_c6iptmtj2x", "qti"."__text_c6iptmtj2x") IS 'row function 84273dc842c75ad5b968efe61465fc66cc71912776519684abded9a04322e7b9';

COMMENT ON FUNCTION "qti"."__row_rlmxw6tihw"("qti"."__text_c6iptmtj2x") IS 'row function 8a17ffd2b29685b5daed4f47887a5c75a72432fe89a4dd770f12a3633c2be149';

COMMENT ON FUNCTION "qti"."__row_6kzci666ft"("qti"."governor", "qti"."attribute_name", "qti"."__text_c6iptmtj2x") IS 'row function 94d895a8eed961f9647abeb8cc1fd3eeca3d83334a5c8fef438498b8abcd9c0d';

COMMENT ON FUNCTION "qti"."__row_k2jasr26qa"("qti"."governor", "qti"."attribute_name", "qti"."__text_c6iptmtj2x") IS 'row function 99e60ea70f617e0b88565e90e7ea7b6ea75112e3df0962378b16423c76eb0f20';

COMMENT ON FUNCTION "qti"."__row_w2gdubljff"("qti"."__text_c6iptmtj2x") IS 'row function afc9426b0c94f9eab34c4916936abfb316ec6a08b2b6a7a77bf084d8adbf42ab';

COMMENT ON FUNCTION "qti"."__row_tcceykpijd"("qti"."governor", "qti"."attribute_name", "qti"."__text_c6iptmtj2x") IS 'row function b26c8f4aeda3a821294034b574707ef7094dfcf4700553e88875b070a8a57610';

COMMENT ON FUNCTION "qti"."__row_7ubwneqiib"("qti"."__text_c6iptmtj2x") IS 'row function fa1543b2fd16a9496cee6083646c7930726123ca1b48ccc023a6bcb9bdf0a6a2';

COMMENT ON DOMAIN "qti"."__text_mzulxrnk4x" IS 'text domain of definition 1f711524b1e0978f43c5d6ca74d69f689eeeba4e7680ccd4d8b114ce9cc6b094';

COMMENT ON DOMAIN "qti"."__text_4s4od7s5or" IS 'text domain of definition 25f993867c17f0de2b8d40bfc84d831eb31ae3f956a21b332d68c3cfea60ac42';

COMMENT ON DOMAIN "qti"."__text_iyotu5swho" IS 'text domain of definition 2635b0e5de7f34b015cf3665ec22fc8b656379442aa348f3a7f82f7640b00cd9';

COMMENT ON DOMAIN "qti"."__text_gke7uypkov" IS 'text domain of definition 35ca7214ecd6bc746f35ddfa585739f2eb3a3bc1cf0102776362d72f261b5d2c';

COMMENT ON FUNCTION "qti"."__row_repvasr7mb"("qti"."node_kind", "qti"."governor", "qti"."__text_c6iptmtj2x", "qti"."__text_gke7uypkov", "qti"."__text_gke7uypkov", "qti"."__flag_bits_16_llpdtzgaon", "qti"."__flag_bits_16_llpdtzgaon", "qti"."__domain_gfw43vigph") IS 'row function a8934dcc7eb9700acaa4ded636b9288652bef3bb7de07fac2142e1609d428f05';

COMMENT ON FUNCTION "qti"."__row_5ny2xgku5g"("qti"."__text_gke7uypkov") IS 'row function e1ce1fbea1e167ddf3bcaa1492411a31d28e1b57bda805c5afe53262f8da797e';

COMMENT ON DOMAIN "qti"."__text_i4qty2ywff" IS 'text domain of definition 3cd53cc0df2c42f1b44a53e1d672bc47fed1067e25cfaf7059cdd1021552f469';

COMMENT ON DOMAIN "qti"."__text_l7nqeazg5h" IS 'text domain of definition 3cdc918e94d35cb73d7847576b3f189044bdbbe2b32433d7e12c4aad29d1b20f';

COMMENT ON DOMAIN "qti"."__text_r2monji6i2" IS 'text domain of definition 3f76df607210d83cd70883edd48f3becbb7bea5d9472ce408573800be152a18b';

COMMENT ON FUNCTION "qti"."__row_guzptzkryd"("qti"."node_kind", "qti"."__text_r2monji6i2", "qti"."node_kind") IS 'row function 049fb4b8389fe4362e6b8ae835a0d12833abe79bbcb974c1ebbdc3351fd79696';

COMMENT ON FUNCTION "qti"."__row_zelh2sd7nh"("qti"."__text_r2monji6i2") IS 'row function 166f957adbae985d78ce5c0385367387adc27e694dfef5e2f3ee1b584ac7ca98';

COMMENT ON FUNCTION "qti"."__row_y4e44kbw47"("qti"."__text_r2monji6i2", "qti"."__text_r2monji6i2", "qti"."__text_r2monji6i2", "qti"."__text_r2monji6i2") IS 'row function 378666ea7abb84ffe91276bf69c08ebb8e3249b4d826d528c1f219c9ac702d95';

COMMENT ON FUNCTION "qti"."__row_atcormr3u4"("qti"."node_kind", "qti"."node_kind", "qti"."attribute_name", "qti"."__text_r2monji6i2") IS 'row function 42881d061bc0b849e341fde6f8c61fb24594b79ed6dad23b11949865e26bf26f';

COMMENT ON FUNCTION "qti"."__row_q6ug7pxit7"("qti"."__text_r2monji6i2", "qti"."node_kind") IS 'row function 69cb3b25c6a4fc7199f96df858483b947c71f231245a8e4ff5b4be2076a85c39';

COMMENT ON FUNCTION "qti"."__row_wns5llqgg2"("qti"."value_base", "qti"."value_cardinality", "qti"."__text_r2monji6i2") IS 'row function 8094bf21674019385b7c9de286559bf45da5c4d0ace70b06ace1e3e8104e696c';

COMMENT ON FUNCTION "qti"."__row_4bpx7xcjar"("qti"."__text_r2monji6i2", "qti"."node_kind", "qti"."value_base", "qti"."value_cardinality", "qti"."reference_resolution") IS 'row function df74c476a2f54b02216237b2e22aef0fc0278a20d80a448837be25963b44899b';

COMMENT ON FUNCTION "qti"."__row_gwyb4oiled"("qti"."__text_r2monji6i2", "qti"."node_kind") IS 'row function f85021aaea1d758740f737bb0f6ce5fecdb9f2a017ddaabd517f15b65f8e8a23';

COMMENT ON DOMAIN "qti"."__text_k5kwygzatl" IS 'text domain of definition 40d6364b587949b03c7cf6d4a4fa90f6a7824a5e81ea482245b5165ecf1a386b';

COMMENT ON FUNCTION "qti"."__row_qqd72edapd"("qti"."__text_k5kwygzatl") IS 'row function 997eed473b52dec6907dabde980a307a27375c1800a9e81c7b298b2cb85e70fe';

COMMENT ON DOMAIN "qti"."__text_7dfilirtp3" IS 'text domain of definition 429c2bb9ddd9c3b22c5a08acc42b1af5e4d920542a5f749183412995aecbc995';

COMMENT ON DOMAIN "qti"."__text_7j6kgluyjp" IS 'text domain of definition 44e887568cc7f9e998199d3ead04a4a7e9dc01d1b379c2777ba394ad881c4d33';

COMMENT ON DOMAIN "qti"."__text_xey6ryorh5" IS 'text domain of definition 470402304d5a2e6d5b1be3a2daeaac2900ee7e45e1edf9e56c42abea179471ed';

COMMENT ON DOMAIN "qti"."__text_lecej62lgl" IS 'text domain of definition 5c14dfcbf02e85cd9c3e4607e5f8aac88e4c4aae96d4daa62cc514568c88c768';

COMMENT ON FUNCTION "qti"."__row_k4uf4yguhs"("qti"."__text_lecej62lgl", "qti"."node_kind") IS 'row function ecbc127f5f361d2ce04939b15d33748aa4164fac231b54977c8d7dd3be81884a';

COMMENT ON DOMAIN "qti"."__text_tn2inwix7f" IS 'text domain of definition 9589922d993d2438cfa83e25407980d911f652efbb0f65aea8fe21c49cf0033e';

COMMENT ON FUNCTION "qti"."__row_wczkl5jgfh"("qti"."document_type", "qti"."__text_tn2inwix7f") IS 'row function 3cc4a82e139c999ae66c7429c7103cf22bc896f468067e681a46f3987314dfa5';

COMMENT ON FUNCTION "qti"."__row_mis3yqyzxq"("qti"."__text_tn2inwix7f") IS 'row function 8ee5b03eec4a6157c1473e6a1a3a86e36f69aacddb52d83fd073a44626850897';

COMMENT ON DOMAIN "qti"."__param_path_bcrdrv5any" IS 'pattern domain of parameter path of definition eb69b666185020e0715f913aa0abaca0a41e5932703c38d9be01a51e5ca11635';

COMMENT ON DOMAIN "qti"."__text_23rzixl3a2" IS 'text domain of definition 95eb6c1246a45f38747eda0606a0a691162091d31ec690fa874e11c549549bf6';

COMMENT ON DOMAIN "qti"."__text_aqc6inemva" IS 'text domain of definition 9728da00b6bfe42b1889214d47c25a591495821a78feafc851ec65d6f721baf9';

COMMENT ON DOMAIN "qti"."__param_package_5kbmtohnug" IS 'pattern domain of parameter package of definition 460405267d99076ae2922762a38a5828fccf2572576b3755591089ddc59fee71';

COMMENT ON DOMAIN "qti"."__text_dtweupoh47" IS 'text domain of definition a991d8b6f2f1ea31587a9ec59860d224194b1cb848eb9090a2a8ce477caa7fb8';

COMMENT ON FUNCTION "qti"."__row_ubecu46dj5"("qti"."node_kind", "qti"."__text_dtweupoh47", "qti"."attribute_name", "qti"."__text_c6iptmtj2x") IS 'row function 79d04ce9c33a2bc9da19f9cd856d030a3556ffdffaf5eeeed52480079927641f';

COMMENT ON DOMAIN "qti"."__text_3yyv7z62gr" IS 'text domain of definition b436cedf5c1da16fab5e77b25ada0e432ac03837869f1d0b282a49ff18f4b987';

COMMENT ON DOMAIN "qti"."__text_nhrekaddjj" IS 'text domain of definition bd0ef5fae91ae1e3759436621ca78cdc662aa71cda3d91e37abc2aabdf9b1329';

COMMENT ON FUNCTION "qti"."__row_jgykq5gtlc"("qti"."__text_nhrekaddjj", "qti"."base_type") IS 'row function 447fdff1862ce800e997d20369086eb22ad65746c2223e0932b6f78f5e4a8615';

COMMENT ON FUNCTION "qti"."__row_ubxkzqopf2"("qti"."__text_nhrekaddjj", "qti"."base_type") IS 'row function 4aec0655b2294e207481e26862143f8f4fd9c6cc33cf8c239c5fd46f8082c9db';

COMMENT ON DOMAIN "qti"."__text_kgtzfmq7x6" IS 'text domain of definition bdb146b36f88067e4043d730ba593e02db53c73bdac540390b2ebb7e67476fda';

COMMENT ON FUNCTION "qti"."__row_23p2ptmgqo"("qti"."node_kind", "qti"."__text_kgtzfmq7x6", "qti"."node_kind") IS 'row function 2a64fb3771ce656a5e1f3fc34d0adceb0e9e1a0e2adc3c2552e10883f711cd21';

COMMENT ON FUNCTION "qti"."__row_peawrayxyu"("qti"."__text_kgtzfmq7x6", "qti"."type_name") IS 'row function 4bc571861ed524cd7163b0edc156cebe580526d1629fd5f519dc8d0c584c6038';

COMMENT ON FUNCTION "qti"."__row_h6vjucvz3t"("qti"."__text_kgtzfmq7x6") IS 'row function 4cf34540bffa699850ffc89ac4f8132c4ae8dc800e264278f6016fc1aaf1e070';

COMMENT ON DOMAIN "qti"."__text_zij47sgley" IS 'text domain of definition be762dbadbcbdadb1b1e213742dad3ff6da1f56202cbfb8c219acc59e34371bd';

COMMENT ON DOMAIN "qti"."__text_gysgx5gkhi" IS 'text domain of definition c7e7a2638ef511b9e40659038ea502578725e45e7cfe8c8a495c60ace2c3085a';

COMMENT ON DOMAIN "qti"."__text_tfkvgtjblt" IS 'text domain of definition d2ecf22f0a0241e29c41342e6e35593308d53ba1698ca8807afbd811407ad122';

COMMENT ON FUNCTION "qti"."__row_74m4ew47s5"("qti"."__text_tfkvgtjblt", "qti"."__text_tfkvgtjblt") IS 'row function 005df96ccadc68937f93346e31e5a7be7c2a5dd92a0f9daa2f7d1abb7821e7ef';

COMMENT ON FUNCTION "qti"."__row_aw25pqvtpa"("qti"."__text_tfkvgtjblt") IS 'row function 0116bcddf50e1405aac948dae46f5f7622d2aef0825367df9a29c2bc302a97bd';

COMMENT ON FUNCTION "qti"."__row_mjocgtt3c3"("qti"."governor", "qti"."__text_tfkvgtjblt") IS 'row function 0d07774fcdbacea1d24fe12a008b01972f5a15958edacfad21873ffc849b8cd5';

COMMENT ON FUNCTION "qti"."__row_a35tnn67mt"("qti"."__text_tfkvgtjblt") IS 'row function 17c426f1f2d57d2606e4259472d28d8fbe42f7e4070b4df1de5a56d96a681a47';

COMMENT ON FUNCTION "qti"."__row_govjmx34hj"("qti"."governor", "qti"."__text_tfkvgtjblt") IS 'row function 37f78ff2ed6084d069571a72362afef96025c9b1dd18d18f85f506ea6f257bed';

COMMENT ON FUNCTION "qti"."__row_uq7s4scxr7"("qti"."node_kind", "qti"."node_kind", "qti"."governor", "qti"."__domain_gfw43vigph", "qti"."__text_tfkvgtjblt", "qti"."__text_tfkvgtjblt", "qti"."__text_c6iptmtj2x") IS 'row function 3a04865b6243f4bf9b54a58d949cd7b65a0be1284e6884b849797d2f5170adf1';

COMMENT ON FUNCTION "qti"."__row_zun4m4fg4n"(boolean, "qti"."__text_tfkvgtjblt") IS 'row function 41594d3e735d03eabd9be807a39c319abe9f613b3e99d685a87bd2e8b5663d3e';

COMMENT ON FUNCTION "qti"."__row_hdmciptf5s"("qti"."__text_tfkvgtjblt", "qti"."__text_tfkvgtjblt") IS 'row function 4cb6d74cb8b70c3b7d1a5dae41319d4c9f11d1811631cf682df51a3b7a70b422';

COMMENT ON FUNCTION "qti"."__row_7b7kgqz54i"("qti"."__text_tfkvgtjblt") IS 'row function 83eb375d02d293dcf291db347ff9b549e5e96349c046ef7789f9ef0db9cdd22d';

COMMENT ON FUNCTION "qti"."__row_tejmmv7gu7"("qti"."governor", "qti"."__text_tfkvgtjblt", "pg_catalog"."text", "qti"."__domain_gfw43vigph") IS 'row function 89aed1d710687ca176ba5f06445625a07cb42923a603235d26c882d68e2e1321';

COMMENT ON FUNCTION "qti"."__row_3tzz7jezip"("qti"."__text_tfkvgtjblt", "qti"."base_type") IS 'row function ce37dd46d491574ef5fd5e493506fadb323116d5a9283ab1fb0c78ae4d7f3011';

COMMENT ON FUNCTION "qti"."__row_imtuakdkbq"("qti"."__text_tfkvgtjblt", "qti"."__text_tfkvgtjblt") IS 'row function f71575ea814fe5606ab2885762f9a500a206449b1b050b96f29133f2ce183dc3';

COMMENT ON DOMAIN "qti"."__text_b6ykamoeho" IS 'text domain of definition d625befb178ad492b0db0947dca6e2a06fe9265b86c9d308ff18efbca3340ffb';

COMMENT ON FUNCTION "qti"."__row_sqzhxeibj4"("qti"."__text_netnsfkgs7", "qti"."href_scope", "qti"."__text_b6ykamoeho", "qti"."__domain_gfw43vigph") IS 'row function aaf688c685c32a5d24ae9b0e868878b12ec8354f2fda6d63575c73eea5e3f432';

COMMENT ON DOMAIN "qti"."__text_r2kdc4r77d" IS 'text domain of definition dad6bc67f0b98b4fc3426dcb5892de0cb0e1ec07963abfa1ba18635cef348fef';

COMMENT ON DOMAIN "qti"."__text_sac6h6c6eh" IS 'text domain of definition e0ec65e8be57c642de548bd5d2a176e56bda67cb965b0b4efc5389004d491694';

COMMENT ON DOMAIN "qti"."__text_3dlgl63rv6" IS 'text domain of definition e39caf120392f42815c264add6a09c2febb10de3ccbae4e068ac6f976267d42b';

COMMENT ON FUNCTION "qti"."__row_c47fsjaxws"("qti"."__text_3dlgl63rv6", "qti"."__text_3dlgl63rv6", "qti"."__text_r2monji6i2") IS 'row function 9564ad32ab28874e2c43beafa15e6f27a6fa43378b546247accc5073bcc7467a';

COMMENT ON FUNCTION "qti"."__row_opj5vv463g"("qti"."node_kind", "qti"."attribute_name", "qti"."__text_3dlgl63rv6", "qti"."__text_c6iptmtj2x", "qti"."__text_r2monji6i2", "qti"."__text_3dlgl63rv6") IS 'row function b433762137fd568a583db5f8f19e94429f8e734e2e8475023416788a674c0d72';

COMMENT ON DOMAIN "qti"."__text_aezrarw5qb" IS 'text domain of definition e6e26ba2b395bc4c79a8579a6b3e3ea5894458b6f52c8210d87a3420dba2869a';

COMMENT ON DOMAIN "qti"."__text_3adwbksayk" IS 'text domain of definition fd4eadc7a8b98d8a19239d9f45b29021bcf2ec27ca3a1836b4dd45ffbad1f4d6';

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

COMMENT ON CONSTRAINT "__cn_part_text_pk_2mlmvkaywv" ON "qti"."cn_part_text" IS 'primary key of CnPartText';

COMMENT ON CONSTRAINT "__cn_part_text_check_cn_part_text_in_cn_form_skp5v7ovmz" ON "qti"."cn_part_text" IS 'check of CnPartText for law CnPartText(type, part, form) in CnForm(type, part, form)';

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

COMMENT ON CONSTRAINT "__node_key_package_path_start_kind_governor_42fsltrsjy" ON "qti"."node" IS 'key Node(package, path, start, kind, governor)';

COMMENT ON CONSTRAINT "__node_check_node_start_in_node_kuuvkytm3l" ON "qti"."node" IS 'check of Node for law Node(package, path, parent, pred(at), was) where Logic.gt(start, 0n) in Node(package, path, parent, at, state) where Logic.gt(start, 0n)';

COMMENT ON CONSTRAINT "__node_key_package_path_start_open_attributes_nc25nroxph" ON "qti"."node" IS 'key Node(package, path, start, openAttributes, governor, kind)';

COMMENT ON CONSTRAINT "__node_key_package_path_start_children_ancestry_mhxzt3iftx" ON "qti"."node" IS 'key Node(package, path, start, children, ancestry, governor, kind, nearest, nearestKind, nearestPath, parentKind)';

COMMENT ON CONSTRAINT "__node_key_package_path_start_kind_ooglyqab5z" ON "qti"."node" IS 'key Node(package, path, start, kind)';

COMMENT ON CONSTRAINT "__node_check_node_children_concat_fold_e4hr3jf5ig" ON "qti"."node" IS 'check of Node for law concat fold over fin(Node, children) of Node(package, path, parent, chars, charsWasDigest, charsAfterDigest) where Logic.or(Logic.in(parentKind, ["lom:catalog", "lom:entity", "lom:entry", "lom:id", "lom:language", "lom:source", "lom:value", "qti-base-value", "qti-resource-icon", "qti-value", "ud:value"]), Logic.and(Logic.in(parentParentKind, ["lom:entry.langString", "lom:source.langString", "lom:title"]), Logic.eq(parentKind, "lom:string")), CheckedText.has(parentGovernor)) and Logic.gt(start, 0n) into Node(package, path, start, stringValueDigest)';

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

COMMENT ON COLUMN "qti"."cn_part_text"."__copy_parts_qitbl7wkbe" IS 'the owner''s count of the family MathCn.parts';

COMMENT ON COLUMN "qti"."cn_part_text"."__index_parts_jdo2fld5qx" IS 'the index of the family MathCn.parts';

COMMENT ON COLUMN "qti"."cn_part_text"."__predecessor_parts_yvk7rmwtkj" IS 'the predecessor of the index of the family MathCn.parts';

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

COMMENT ON CONSTRAINT "__attribute_check_attribute_counted_node_attributes_bpdqludy6t" ON "qti"."attribute" IS 'check of Attribute for law counted Attribute(package, path, start) in fin(Node, attributes)';

COMMENT ON CONSTRAINT "__attribute_check_node_attributes_or_fold_xtgqvby6x6" ON "qti"."attribute" IS 'check of Attribute for law or fold over fin(Node, attributes) of Attribute(package, path, start, slot) into Node(package, path, start, attrs)';

COMMENT ON CONSTRAINT "__binding_name_check_binding_name_counted_document_mdflr7slfc" ON "qti"."binding_name" IS 'check of BindingName for law counted BindingName(package, path) in fin(Document, bindings)';

COMMENT ON CONSTRAINT "__cell_leaf_check_cell_leaf_ordered_math_cell_leaves_rtn2kiuoqf" ON "qti"."cell_leaf" IS 'check of CellLeaf for law ordered CellLeaf(package, path, cell, at) in fin(MathCell, leaves)';

COMMENT ON CONSTRAINT "__choice_check_choice_counted_document_choices_4iujl46hmj" ON "qti"."choice" IS 'check of Choice for law counted Choice(package, path) in fin(Document, choices)';

COMMENT ON CONSTRAINT "__choice_interaction_check_choice_interaction_acwsevthlx" ON "qti"."choice_interaction" IS 'check of ChoiceInteraction for law counted ChoiceInteraction(package, interactionPath, interaction) in fin(Interaction, choices)';

COMMENT ON CONSTRAINT "__cn_part_text_check_cn_part_text_counted_math_cn_q544ypthce" ON "qti"."cn_part_text" IS 'check of CnPartText for law counted CnPartText(package, path, start) in fin(MathCn, parts)';

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

COMMENT ON CONSTRAINT "__cn_part_text_fk_package_path_start_copy_parts_base_u3absd7ss6" ON "qti"."cn_part_text" IS 'foreign key CnPartText(package, path, start, the owner''s count of the family MathCn.parts, base, type) to MathCn(package, path, start, parts, base, type)';

COMMENT ON CONSTRAINT "__cn_part_text_fk_package_path_start_predecessor_n232tu7775" ON "qti"."cn_part_text" IS 'foreign key CnPartText(package, path, start, the predecessor of the index of the family MathCn.parts) to CnPartText(package, path, start, the index of the family MathCn.parts)';

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

COMMENT ON CONSTRAINT "__math_align_scope_fk_package_path_start_jfr4iz7vmr" ON "qti"."math_align_scope" IS 'foreign key MathAlignScope(package, path, start) to Node(package, path, start)';

COMMENT ON CONSTRAINT "__math_cell_fk_package_path_start_pred_groups_3tmcxdn4gu" ON "qti"."math_cell" IS 'foreign key MathCell(package, path, start, pred(groups)) to MathAlignGroup(package, path, cell, the index of the family MathCell.groups)';

COMMENT ON CONSTRAINT "__math_cell_fk_package_path_start_pred_leaves_last_zixxwvi2km" ON "qti"."math_cell" IS 'foreign key MathCell(package, path, start, pred(leaves), lastStart) to CellLeaf(package, path, cell, at, startAfter)';

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

COMMENT ON CONSTRAINT "__variable_ref_fk_package_path_root_kind_o6lbp6ercl" ON "qti"."variable_ref" IS 'foreign key VariableRef(package, path, rootKind) to Document(package, path, rootKind)';

COMMENT ON CONSTRAINT "__variable_ref_fk_package_path_start_attribute_mtdx46lozb" ON "qti"."variable_ref" IS 'foreign key VariableRef(package, path, start, attribute) to Attribute(package, path, start, name)';

COMMENT ON CONSTRAINT "__xml_decl_fk_package_path_ge2web3hon" ON "qti"."xml_decl" IS 'foreign key XmlDecl(package, path) to Document(package, path)';

COMMENT ON CONSTRAINT "__anchored_id_key_anchor_assembly_id_digest_instance_nguzv6uv3d" ON "qti_queries"."anchored_id" IS 'key AnchoredId(anchor, assembly, idDigest, instance, owner, package)';

COMMENT ON CONSTRAINT "__anchored_name_key_anchor_anchor_document_assembly_wypl534kgx" ON "qti_queries"."anchored_name" IS 'key AnchoredName(anchor, anchorDocument, assembly, identifier, instance, package)';

COMMENT ON CONSTRAINT "__apply_argument_key_package_path_start_y725l5db53" ON "qti_queries"."apply_argument" IS 'key ApplyArgument(package, path, start)';

COMMENT ON CONSTRAINT "__apply_argument_pair_key_first_package_path_second_q5hic3n4qo" ON "qti_queries"."apply_argument_pair" IS 'key ApplyArgumentPair(first, package, path, second)';

COMMENT ON CONSTRAINT "__aria_bounds_key_package_path_start_7fqcaw7msr" ON "qti_queries"."aria_bounds" IS 'key AriaBounds(package, path, start)';

COMMENT ON CONSTRAINT "__arity_floor_key_package_path_start_hmgcyfpder" ON "qti_queries"."arity_floor" IS 'key ArityFloor(package, path, start)';

COMMENT ON CONSTRAINT "__assembled_id_key_assembly_id_digest_instance_owner_tpxgjcu3f3" ON "qti_queries"."assembled_id" IS 'key AssembledId(assembly, idDigest, instance, owner, package, path)';

COMMENT ON CONSTRAINT "__assembled_name_key_anchor_document_assembly_mgrc5r46uk" ON "qti_queries"."assembled_name" IS 'key AssembledName(anchorDocument, assembly, package, path, start)';

COMMENT ON CONSTRAINT "__assembled_replaceable_key_assembly_instance_5kejusruuh" ON "qti_queries"."assembled_replaceable" IS 'key AssembledReplaceable(assembly, instance, package, path, start)';

COMMENT ON CONSTRAINT "__bank_member_key_bank_identifier_package_wg674ilask" ON "qti_queries"."bank_member" IS 'key BankMember(bank, identifier, package)';

COMMENT ON CONSTRAINT "__binary_math_operator_key_package_path_start_k6loqxoxig" ON "qti_queries"."binary_math_operator" IS 'key BinaryMathOperator(package, path, start)';

COMMENT ON CONSTRAINT "__bound_range_key_package_path_start_tumbvhg47i" ON "qti_queries"."bound_range" IS 'key BoundRange(package, path, start)';

COMMENT ON CONSTRAINT "__bounded_selection_key_package_path_section_npa5ac4yif" ON "qti_queries"."bounded_selection" IS 'key BoundedSelection(package, path, section)';

COMMENT ON CONSTRAINT "__branch_resolution_key_assembly_instance_package_atd6t5p3xh" ON "qti_queries"."branch_resolution" IS 'key BranchResolution(assembly, instance, package, start)';

COMMENT ON CONSTRAINT "__catalog_scope_node_key_package_path_start_e5cysokbz3" ON "qti_queries"."catalog_scope_node" IS 'key CatalogScopeNode(package, path, start)';

COMMENT ON CONSTRAINT "__cell_child_key_package_path_start_eev2pc22ja" ON "qti_queries"."cell_child" IS 'key CellChild(package, path, start)';

COMMENT ON CONSTRAINT "__cell_leaf_node_key_package_path_start_b2nexp2sgi" ON "qti_queries"."cell_leaf_node" IS 'key CellLeafNode(package, path, start)';

COMMENT ON CONSTRAINT "__choice_node_key_package_path_start_zrugmeekwn" ON "qti_queries"."choice_node" IS 'key ChoiceNode(package, path, start)';

COMMENT ON CONSTRAINT "__choice_or_hottext_key_identifier_package_path_md4hrlmslm" ON "qti_queries"."choice_or_hottext" IS 'key ChoiceOrHottext(identifier, package, path, start)';

COMMENT ON CONSTRAINT "__choice_space_name_key_identifier_package_path_i6ezkfdcae" ON "qti_queries"."choice_space_name" IS 'key ChoiceSpaceName(identifier, package, path, start)';

COMMENT ON CONSTRAINT "__cn_count_key_package_path_start_type_ndro6ajt3s" ON "qti_queries"."cn_count" IS 'key CnCount(package, path, start, type)';

COMMENT ON CONSTRAINT "__copied_id_key_anchor_document_assembly_id_digest_6qx4ccmfgf" ON "qti_queries"."copied_id" IS 'key CopiedId(anchorDocument, assembly, idDigest, package)';

COMMENT ON CONSTRAINT "__count_bound_node_key_package_path_start_ydn6c5y2b2" ON "qti_queries"."count_bound_node" IS 'key CountBoundNode(package, path, start)';

COMMENT ON CONSTRAINT "__declaration_table_key_declaration_kind_package_ff6urmuhck" ON "qti_queries"."declaration_table" IS 'key DeclarationTable(declaration, kind, package, path)';

COMMENT ON CONSTRAINT "__deliverable_test_key_package_path_start_b4uv7iy6h7" ON "qti_queries"."deliverable_test" IS 'key DeliverableTest(package, path, start)';

COMMENT ON CONSTRAINT "__dependency_key_package_start_ouuq4nw7zd" ON "qti_queries"."dependency" IS 'key Dependency(package, start)';

COMMENT ON CONSTRAINT "__dependency_resolved_key_package_start_target_4uwb4nb2ou" ON "qti_queries"."dependency_resolved" IS 'key DependencyResolved(package, start, target)';

COMMENT ON CONSTRAINT "__entry_file_target_key_package_target_ogivwrnm6u" ON "qti_queries"."entry_file_target" IS 'key EntryFileTarget(package, target)';

COMMENT ON CONSTRAINT "__expression_node_key_package_path_start_cu66dviubk" ON "qti_queries"."expression_node" IS 'key ExpressionNode(package, path, start)';

COMMENT ON CONSTRAINT "__expression_operand_key_package_path_start_3fr7qp3usv" ON "qti_queries"."expression_operand" IS 'key ExpressionOperand(package, path, start)';

COMMENT ON CONSTRAINT "__filtered_section_key_assembly_instance_package_nwc7er2lsl" ON "qti_queries"."filtered_section" IS 'key FilteredSection(assembly, instance, package, path, start)';

COMMENT ON CONSTRAINT "__forward_branch_rule_key_assembly_instance_package_rabxe6px4z" ON "qti_queries"."forward_branch_rule" IS 'key ForwardBranchRule(assembly, instance, package, start)';

COMMENT ON CONSTRAINT "__head_document_key_package_path_b7zpp2j6lw" ON "qti_queries"."head_document" IS 'key HeadDocument(package, path)';

COMMENT ON CONSTRAINT "__head_qualifier_pair_key_head_package_path_start_bai5s3zofl" ON "qti_queries"."head_qualifier_pair" IS 'key HeadQualifierPair(head, package, path, start)';

COMMENT ON CONSTRAINT "__hotspot_node_key_package_path_start_5i7jogq6ol" ON "qti_queries"."hotspot_node" IS 'key HotspotNode(package, path, start)';

COMMENT ON CONSTRAINT "__hottext_node_key_package_path_start_7ebpv6khiw" ON "qti_queries"."hottext_node" IS 'key HottextNode(package, path, start)';

COMMENT ON CONSTRAINT "__identity_text_node_key_package_path_start_ltnh7j4itq" ON "qti_queries"."identity_text_node" IS 'key IdentityTextNode(package, path, start)';

COMMENT ON CONSTRAINT "__instance_document_key_document_package_7mllddmhwh" ON "qti_queries"."instance_document" IS 'key InstanceDocument(document, package)';

COMMENT ON CONSTRAINT "__integer_aggregate_key_assembly_instance_operator_vhjdomsd2k" ON "qti_queries"."integer_aggregate" IS 'key IntegerAggregate(assembly, instance, operator, package, path)';

COMMENT ON CONSTRAINT "__interaction_node_key_package_path_start_uxisyi4rfp" ON "qti_queries"."interaction_node" IS 'key InteractionNode(package, path, start)';

COMMENT ON CONSTRAINT "__item_mapping_key_package_path_start_u7acwynx4o" ON "qti_queries"."item_mapping" IS 'key ItemMapping(package, path, start)';

COMMENT ON CONSTRAINT "__item_ref_category_key_category_package_path_start_e7norjoh2t" ON "qti_queries"."item_ref_category" IS 'key ItemRefCategory(category, package, path, start)';

COMMENT ON CONSTRAINT "__item_ref_section_key_identifier_package_path_start_hcsz3oauez" ON "qti_queries"."item_ref_section" IS 'key ItemRefSection(identifier, package, path, start)';

COMMENT ON CONSTRAINT "__item_ref_target_key_package_path_start_target_type_gwu2piyafu" ON "qti_queries"."item_ref_target" IS 'key ItemRefTarget(package, path, start, target, type)';

COMMENT ON CONSTRAINT "__item_template_default_key_package_path_start_ikiqqwadi3" ON "qti_queries"."item_template_default" IS 'key ItemTemplateDefault(package, path, start)';

COMMENT ON CONSTRAINT "__judged_placed_idref_key_assembly_id_digest_package_t34c3y3igg" ON "qti_queries"."judged_placed_idref" IS 'key JudgedPlacedIdref(assembly, idDigest, package)';

COMMENT ON CONSTRAINT "__known_operand_base_key_assembly_base_type_instance_5xox4dqaol" ON "qti_queries"."known_operand_base" IS 'key KnownOperandBase(assembly, baseType, instance, operator, package, path)';

COMMENT ON CONSTRAINT "__known_operand_cardinality_key_assembly_cardinality_dsiggrhdau" ON "qti_queries"."known_operand_cardinality" IS 'key KnownOperandCardinality(assembly, cardinality, instance, operator, package, path)';

COMMENT ON CONSTRAINT "__late_submission_key_package_path_scope_a5yn6z5i5r" ON "qti_queries"."late_submission" IS 'key LateSubmission(package, path, scope)';

COMMENT ON CONSTRAINT "__least_choice_bound_key_package_path_start_ybf7cdpayc" ON "qti_queries"."least_choice_bound" IS 'key LeastChoiceBound(package, path, start)';

COMMENT ON CONSTRAINT "__least_count_node_key_package_path_start_fxwm2qb5gy" ON "qti_queries"."least_count_node" IS 'key LeastCountNode(package, path, start)';

COMMENT ON CONSTRAINT "__least_one_apply_key_apply_package_path_hg2ygg6vob" ON "qti_queries"."least_one_apply" IS 'key LeastOneApply(apply, package, path)';

COMMENT ON CONSTRAINT "__least_two_apply_key_apply_package_path_fxsk7ssaiw" ON "qti_queries"."least_two_apply" IS 'key LeastTwoApply(apply, package, path)';

COMMENT ON CONSTRAINT "__link_scope_key_assembly_identifier_instance_ldhzqojp63" ON "qti_queries"."link_scope" IS 'key LinkScope(assembly, identifier, instance, package)';

COMMENT ON CONSTRAINT "__link_spelling_key_assembly_attribute_package_path_ahfuzmjbgt" ON "qti_queries"."link_spelling" IS 'key LinkSpelling(assembly, attribute, package, path, scope, scopeInstance, start)';

COMMENT ON CONSTRAINT "__math_action_node_key_package_path_start_2j4wbwvkmy" ON "qti_queries"."math_action_node" IS 'key MathActionNode(package, path, start)';

COMMENT ON CONSTRAINT "__math_operand_key_operator_package_path_rank_7zvvskvamh" ON "qti_queries"."math_operand" IS 'key MathOperand(operator, package, path, rank)';

COMMENT ON CONSTRAINT "__math_rank_node_key_package_path_start_5qykeylogx" ON "qti_queries"."math_rank_node" IS 'key MathRankNode(package, path, start)';

COMMENT ON CONSTRAINT "__math_rank_step_key_package_path_start_6kskzw7pm5" ON "qti_queries"."math_rank_step" IS 'key MathRankStep(package, path, start)';

COMMENT ON CONSTRAINT "__max_attempts_key_attempts_package_path_scope_g26n3auhtq" ON "qti_queries"."max_attempts" IS 'key MaxAttempts(attempts, package, path, scope)';

COMMENT ON CONSTRAINT "__max_time_key_package_path_scope_seconds_d6gjhe26f2" ON "qti_queries"."max_time" IS 'key MaxTime(package, path, scope, seconds)';

COMMENT ON CONSTRAINT "__min_time_key_package_path_scope_seconds_bosb7i75lf" ON "qti_queries"."min_time" IS 'key MinTime(package, path, scope, seconds)';

COMMENT ON CONSTRAINT "__most_choice_bound_key_package_path_start_2lev7jnwir" ON "qti_queries"."most_choice_bound" IS 'key MostChoiceBound(package, path, start)';

COMMENT ON CONSTRAINT "__most_count_node_key_package_path_start_cneaysbpij" ON "qti_queries"."most_count_node" IS 'key MostCountNode(package, path, start)';

COMMENT ON CONSTRAINT "__most_one_argument_key_package_path_start_yspnq5ijzi" ON "qti_queries"."most_one_argument" IS 'key MostOneArgument(package, path, start)';

COMMENT ON CONSTRAINT "__most_two_argument_pair_key_first_package_path_qotmqqrgvh" ON "qti_queries"."most_two_argument_pair" IS 'key MostTwoArgumentPair(first, package, path, second)';

COMMENT ON CONSTRAINT "__named_item_ref_key_package_path_start_rpsvhtzzq6" ON "qti_queries"."named_item_ref" IS 'key NamedItemRef(package, path, start)';

COMMENT ON CONSTRAINT "__numbered_spelling_key_assembly_attribute_number_o3qzda5s44" ON "qti_queries"."numbered_spelling" IS 'key NumberedSpelling(assembly, attribute, number, package, path, scope, scopeInstance, start)';

COMMENT ON CONSTRAINT "__object_identifier_key_package_path_start_henf6i67nu" ON "qti_queries"."object_identifier" IS 'key ObjectIdentifier(package, path, start)';

COMMENT ON CONSTRAINT "__one_tail_cardinality_key_assembly_instance_zlxnjdf2ah" ON "qti_queries"."one_tail_cardinality" IS 'key OneTailCardinality(assembly, instance, operator, package, path)';

COMMENT ON CONSTRAINT "__open_name_node_key_package_path_start_6lq2k24fcn" ON "qti_queries"."open_name_node" IS 'key OpenNameNode(package, path, start)';

COMMENT ON CONSTRAINT "__open_name_under_foreign_key_package_path_start_5qkgojqddu" ON "qti_queries"."open_name_under_foreign" IS 'key OpenNameUnderForeign(package, path, start)';

COMMENT ON CONSTRAINT "__open_type_node_key_package_path_start_tcq6fds3fa" ON "qti_queries"."open_type_node" IS 'key OpenTypeNode(package, path, start)';

COMMENT ON CONSTRAINT "__open_type_under_foreign_key_package_path_start_55lldpxluw" ON "qti_queries"."open_type_under_foreign" IS 'key OpenTypeUnderForeign(package, path, start)';

COMMENT ON CONSTRAINT "__operand_of_key_assembly_instance_package_path_s7ecf66ese" ON "qti_queries"."operand_of" IS 'key OperandOf(assembly, instance, package, path, start)';

COMMENT ON CONSTRAINT "__packaged_template_default_key_package_path_start_bdqotbziot" ON "qti_queries"."packaged_template_default" IS 'key PackagedTemplateDefault(package, path, start)';

COMMENT ON CONSTRAINT "__pattern_text_key_package_path_pattern_start_2ftyijn2dg" ON "qti_queries"."pattern_text" IS 'key PatternText(package, path, pattern, start)';

COMMENT ON CONSTRAINT "__placed_choice_or_hottext_key_assembly_identifier_i25x4chx3b" ON "qti_queries"."placed_choice_or_hottext" IS 'key PlacedChoiceOrHottext(assembly, identifier, instance, package, path, start)';

COMMENT ON CONSTRAINT "__placed_choice_space_name_key_assembly_identifier_vq3vjrukig" ON "qti_queries"."placed_choice_space_name" IS 'key PlacedChoiceSpaceName(assembly, identifier, instance, package, path, start)';

COMMENT ON CONSTRAINT "__placed_expression_node_key_assembly_instance_5xzv3nbxpo" ON "qti_queries"."placed_expression_node" IS 'key PlacedExpressionNode(assembly, instance, package, path, start)';

COMMENT ON CONSTRAINT "__placed_filter_key_assembly_package_path_start_yb6r5cwkwy" ON "qti_queries"."placed_filter" IS 'key PlacedFilter(assembly, package, path, start)';

COMMENT ON CONSTRAINT "__placed_include_path_key_package_path_start_qepxufl46z" ON "qti_queries"."placed_include_path" IS 'key PlacedIncludePath(package, path, start)';

COMMENT ON CONSTRAINT "__placed_math_rank_node_key_assembly_instance_et5fdli3jg" ON "qti_queries"."placed_math_rank_node" IS 'key PlacedMathRankNode(assembly, instance, package, start)';

COMMENT ON CONSTRAINT "__placed_math_rank_step_key_assembly_instance_fioufkjkty" ON "qti_queries"."placed_math_rank_step" IS 'key PlacedMathRankStep(assembly, instance, package, start)';

COMMENT ON CONSTRAINT "__placed_reference_key_assembly_instance_package_fv5s77oiyn" ON "qti_queries"."placed_reference" IS 'key PlacedReference(assembly, instance, package, start, tokenDigest)';

COMMENT ON CONSTRAINT "__placed_share_ranks_key_assembly_instance_package_dio3amk5m2" ON "qti_queries"."placed_share_ranks" IS 'key PlacedShareRanks(assembly, instance, package, start)';

COMMENT ON CONSTRAINT "__placed_test_reference_key_assembly_attribute_vpqt4xcjix" ON "qti_queries"."placed_test_reference" IS 'key PlacedTestReference(assembly, attribute, package, path, start)';

COMMENT ON CONSTRAINT "__placed_weighted_variable_key_assembly_package_path_ibhucq56sy" ON "qti_queries"."placed_weighted_variable" IS 'key PlacedWeightedVariable(assembly, package, path, start)';

COMMENT ON CONSTRAINT "__pointer_parse_key_package_path_start_6mfkdriimi" ON "qti_queries"."pointer_parse" IS 'key PointerParse(package, path, start)';

COMMENT ON CONSTRAINT "__processing_node_key_package_path_start_u6dldn4d4q" ON "qti_queries"."processing_node" IS 'key ProcessingNode(package, path, start)';

COMMENT ON CONSTRAINT "__quotation_end_key_end_package_path_start_icfa7ve3ct" ON "qti_queries"."quotation_end" IS 'key QuotationEnd(end, package, path, start)';

COMMENT ON CONSTRAINT "__read_include_key_package_path_start_qwqwt6kbcf" ON "qti_queries"."read_include" IS 'key ReadInclude(package, path, start)';

COMMENT ON CONSTRAINT "__reference_lexical_key_name_package_path_start_pac6xcoosa" ON "qti_queries"."reference_lexical" IS 'key ReferenceLexical(name, package, path, start)';

COMMENT ON CONSTRAINT "__required_parts_key_package_path_section_select_j4u4aee4ed" ON "qti_queries"."required_parts" IS 'key RequiredParts(package, path, section, select)';

COMMENT ON CONSTRAINT "__required_ssml_property_key_member_name_digest_ca46pewxry" ON "qti_queries"."required_ssml_property" IS 'key RequiredSsmlProperty(member, nameDigest, package, path, start)';

COMMENT ON CONSTRAINT "__requirement_met_key_package_path_section_jkqtbmuxol" ON "qti_queries"."requirement_met" IS 'key RequirementMet(package, path, section)';

COMMENT ON CONSTRAINT "__resolved_branch_rule_key_assembly_instance_package_r7kb5tayrm" ON "qti_queries"."resolved_branch_rule" IS 'key ResolvedBranchRule(assembly, instance, package, start)';

COMMENT ON CONSTRAINT "__resource_file_document_key_package_path_resource_sifef2q654" ON "qti_queries"."resource_file_document" IS 'key ResourceFileDocument(package, path, resource)';

COMMENT ON CONSTRAINT "__resource_file_outside_key_package_path_resource_jcdwyo4ssc" ON "qti_queries"."resource_file_outside" IS 'key ResourceFileOutside(package, path, resource, targetDigest)';

COMMENT ON CONSTRAINT "__resource_file_path_key_package_path_resource_xrav47fywz" ON "qti_queries"."resource_file_path" IS 'key ResourceFilePath(package, path, resource, target)';

COMMENT ON CONSTRAINT "__scope_node_key_package_path_start_d4npa6zd7p" ON "qti_queries"."scope_node" IS 'key ScopeNode(package, path, start)';

COMMENT ON CONSTRAINT "__scoped_dir_key_package_path_start_7yjwxf443p" ON "qti_queries"."scoped_dir" IS 'key ScopedDir(package, path, start)';

COMMENT ON CONSTRAINT "__section_replacement_key_package_path_section_hvfwzo5asi" ON "qti_queries"."section_replacement" IS 'key SectionReplacement(package, path, section)';

COMMENT ON CONSTRAINT "__section_selection_key_package_path_section_select_dmq6zaycst" ON "qti_queries"."section_selection" IS 'key SectionSelection(package, path, section, select)';

COMMENT ON CONSTRAINT "__section_shuffle_key_package_path_section_upfyseqlrc" ON "qti_queries"."section_shuffle" IS 'key SectionShuffle(package, path, section)';

COMMENT ON CONSTRAINT "__selection_without_replacement_key_package_path_w7g74rtvaj" ON "qti_queries"."selection_without_replacement" IS 'key SelectionWithoutReplacement(package, path, section)';

COMMENT ON CONSTRAINT "__session_control_key_package_path_scope_setting_mj5mka4vjx" ON "qti_queries"."session_control" IS 'key SessionControl(package, path, scope, setting, value)';

COMMENT ON CONSTRAINT "__share_fragment_value_key_package_path_start_mcbsh4tm7y" ON "qti_queries"."share_fragment_value" IS 'key ShareFragmentValue(package, path, start)';

COMMENT ON CONSTRAINT "__share_ranks_key_package_path_start_5iotsedaut" ON "qti_queries"."share_ranks" IS 'key ShareRanks(package, path, start)';

COMMENT ON CONSTRAINT "__share_source_key_package_path_start_arc77cvmim" ON "qti_queries"."share_source" IS 'key ShareSource(package, path, start)';

COMMENT ON CONSTRAINT "__slider_bounds_key_package_path_start_3mtdj2hjce" ON "qti_queries"."slider_bounds" IS 'key SliderBounds(package, path, start)';

COMMENT ON CONSTRAINT "__srcset_form_key_name_package_path_start_2ofpf7atot" ON "qti_queries"."srcset_form" IS 'key SrcsetForm(name, package, path, start)';

COMMENT ON CONSTRAINT "__ssml_scope_node_key_package_path_start_3i6utbm3sg" ON "qti_queries"."ssml_scope_node" IS 'key SsmlScopeNode(package, path, start)';

COMMENT ON CONSTRAINT "__structure_naming_key_package_path_start_epsihmqqdp" ON "qti_queries"."structure_naming" IS 'key StructureNaming(package, path, start)';

COMMENT ON CONSTRAINT "__structure_node_key_package_path_start_a32nvrdxyp" ON "qti_queries"."structure_node" IS 'key StructureNode(package, path, start)';

COMMENT ON CONSTRAINT "__template_processing_key_package_path_value_j74ifurlje" ON "qti_queries"."template_processing" IS 'key TemplateProcessing(package, path, value)';

COMMENT ON CONSTRAINT "__test_identifier_key_package_path_start_q4bvjcpuk7" ON "qti_queries"."test_identifier" IS 'key TestIdentifier(package, path, start)';

COMMENT ON CONSTRAINT "__test_identifier_bytes_key_bytes_package_path_start_tf67is3ylc" ON "qti_queries"."test_identifier_bytes" IS 'key TestIdentifierBytes(bytes, package, path, start)';

COMMENT ON CONSTRAINT "__test_member_key_item_package_part_path_test_i7o2tlxcvu" ON "qti_queries"."test_member" IS 'key TestMember(item, package, part, path, test)';

COMMENT ON CONSTRAINT "__test_part_key_package_part_path_test_uhgegnzdvp" ON "qti_queries"."test_part" IS 'key TestPart(package, part, path, test)';

COMMENT ON CONSTRAINT "__test_root_key_package_path_start_zzwg2is3f2" ON "qti_queries"."test_root" IS 'key TestRoot(package, path, start)';

COMMENT ON CONSTRAINT "__text_reference_string_value_key_package_path_start_vckgxlndpg" ON "qti_queries"."text_reference_string_value" IS 'key TextReferenceStringValue(package, path, start)';

COMMENT ON CONSTRAINT "__tolerance_token_key_at_package_path_start_obp2kjaalv" ON "qti_queries"."tolerance_token" IS 'key ToleranceToken(at, package, path, start)';

COMMENT ON CONSTRAINT "__typed_href_key_package_path_start_hedpn7vudj" ON "qti_queries"."typed_href" IS 'key TypedHref(package, path, start)';

COMMENT ON CONSTRAINT "__typed_path_key_package_path_start_52tasgh2qp" ON "qti_queries"."typed_path" IS 'key TypedPath(package, path, start)';

COMMENT ON CONSTRAINT "__unassembled_reference_key_package_path_token_mcbkx6horm" ON "qti_queries"."unassembled_reference" IS 'key UnassembledReference(package, path, tokenDigest)';

COMMENT ON CONSTRAINT "__unknown_operand_base_key_assembly_instance_vjxafax6i4" ON "qti_queries"."unknown_operand_base" IS 'key UnknownOperandBase(assembly, instance, operator, package, path)';

COMMENT ON CONSTRAINT "__unknown_tail_base_key_assembly_instance_operator_o3kqeuqthl" ON "qti_queries"."unknown_tail_base" IS 'key UnknownTailBase(assembly, instance, operator, package, path)';

COMMENT ON CONSTRAINT "__unplaced_include_key_cause_package_path_start_3yf42ettwq" ON "qti_queries"."unplaced_include" IS 'key UnplacedInclude(cause, package, path, start)';

COMMENT ON CONSTRAINT "__unread_type_href_key_package_path_start_rw2gravkyf" ON "qti_queries"."unread_type_href" IS 'key UnreadTypeHref(package, path, start)';

COMMENT ON CONSTRAINT "__untargeted_item_ref_key_package_path_start_xlyrjzawor" ON "qti_queries"."untargeted_item_ref" IS 'key UntargetedItemRef(package, path, start)';

COMMENT ON CONSTRAINT "__untyped_unweighted_key_assembly_instance_package_lld6djdmjb" ON "qti_queries"."untyped_unweighted" IS 'key UntypedUnweighted(assembly, instance, package, path, start)';

COMMENT ON CONSTRAINT "__untyped_weighted_key_assembly_instance_package_j3vcxwjm5n" ON "qti_queries"."untyped_weighted" IS 'key UntypedWeighted(assembly, instance, package, path, start)';

COMMENT ON CONSTRAINT "__usage_value_base_type_key_package_path_start_vchhwwqsog" ON "qti_queries"."usage_value_base_type" IS 'key UsageValueBaseType(package, path, start)';

COMMENT ON CONSTRAINT "__variable_mapping_key_package_path_start_ijnrqew35i" ON "qti_queries"."variable_mapping" IS 'key VariableMapping(package, path, start)';

COMMENT ON CONSTRAINT "__weight_value_key_package_path_start_inuavmx6fu" ON "qti_queries"."weight_value" IS 'key WeightValue(package, path, start)';

COMMENT ON CONSTRAINT "__weighted_base_type_key_package_path_start_ehagchm43r" ON "qti_queries"."weighted_base_type" IS 'key WeightedBaseType(package, path, start)';

COMMENT ON CONSTRAINT "__weighted_variable_key_package_path_start_6c2ke6y7t5" ON "qti_queries"."weighted_variable" IS 'key WeightedVariable(package, path, start)';

COMMENT ON CONSTRAINT "__catalog_id_key_package_path_start_xmcdisxi2k" ON "qti_views"."catalog_id" IS 'key CatalogId(package, path, start)';

COMMENT ON CONSTRAINT "__assembled_catalog_key_assembly_id_digest_package_nlao5vwurp" ON "qti_queries"."assembled_catalog" IS 'key AssembledCatalog(assembly, idDigest, package)';

COMMENT ON CONSTRAINT "__cell_table_key_package_path_start_table_fpxritt234" ON "qti_views"."cell_table" IS 'key CellTable(package, path, start, table)';

COMMENT ON CONSTRAINT "__table_header_key_package_path_start_table_5brsrb45gl" ON "qti_queries"."table_header" IS 'key TableHeader(package, path, start, table)';

COMMENT ON CONSTRAINT "__declaration_base_type_key_package_path_start_sxw5bj6qhc" ON "qti_views"."declaration_base_type" IS 'key DeclarationBaseType(package, path, start)';

COMMENT ON CONSTRAINT "__area_mapping_base_type_key_package_path_start_3mmlnwouis" ON "qti_queries"."area_mapping_base_type" IS 'key AreaMappingBaseType(package, path, start)';

COMMENT ON CONSTRAINT "__mapping_base_type_key_package_path_start_ila4rdgol3" ON "qti_queries"."mapping_base_type" IS 'key MappingBaseType(package, path, start)';

COMMENT ON CONSTRAINT "__declaration_cardinality_key_package_path_start_6j7v26rd35" ON "qti_views"."declaration_cardinality" IS 'key DeclarationCardinality(package, path, start)';

COMMENT ON CONSTRAINT "__area_mapping_cardinality_key_package_path_start_bjbnxy75dc" ON "qti_queries"."area_mapping_cardinality" IS 'key AreaMappingCardinality(package, path, start)';

COMMENT ON CONSTRAINT "__base_type_cardinality_key_package_path_start_hvuchzk44y" ON "qti_queries"."base_type_cardinality" IS 'key BaseTypeCardinality(package, path, start)';

COMMENT ON CONSTRAINT "__field_value_text_key_package_path_start_rg6z2lje7w" ON "qti_queries"."field_value_text" IS 'key FieldValueText(package, path, start)';

COMMENT ON CONSTRAINT "__lookup_table_cardinality_key_package_path_start_k3uvsinwfs" ON "qti_queries"."lookup_table_cardinality" IS 'key LookupTableCardinality(package, path, start)';

COMMENT ON CONSTRAINT "__mapping_cardinality_key_package_path_start_jkorhv3elw" ON "qti_queries"."mapping_cardinality" IS 'key MappingCardinality(package, path, start)';

COMMENT ON CONSTRAINT "__record_set_value_key_package_path_start_o35rtlj6in" ON "qti_queries"."record_set_value" IS 'key RecordSetValue(package, path, start)';

COMMENT ON CONSTRAINT "__set_cardinality_key_package_path_start_2bmqhzpgqq" ON "qti_queries"."set_cardinality" IS 'key SetCardinality(package, path, start)';

COMMENT ON CONSTRAINT "__set_field_name_key_package_path_start_n5d7uvzfhw" ON "qti_queries"."set_field_name" IS 'key SetFieldName(package, path, start)';

COMMENT ON CONSTRAINT "__typed_value_text_key_package_path_start_a3zou7qpiw" ON "qti_queries"."typed_value_text" IS 'key TypedValueText(package, path, start)';

COMMENT ON CONSTRAINT "__declaration_name_key_package_path_start_3sxdpmpfh4" ON "qti_views"."declaration_name" IS 'key DeclarationName(package, path, start)';

COMMENT ON CONSTRAINT "__binding_cardinality_node_key_attribute_cardinality_e3ieryi27d" ON "qti_queries"."binding_cardinality_node" IS 'key BindingCardinalityNode(attribute, cardinality, package, path, start)';

COMMENT ON CONSTRAINT "__feedback_ref_cardinality_key_attribute_cardinality_tl3zf5u2nq" ON "qti_queries"."feedback_ref_cardinality" IS 'key FeedbackRefCardinality(attribute, cardinality, kind, package, path, start)';

COMMENT ON CONSTRAINT "__non_container_strings_key_least_value_package_path_lfig3isxn4" ON "qti_queries"."non_container_strings" IS 'key NonContainerStrings(leastValue, package, path, start)';

COMMENT ON CONSTRAINT "__placed_binding_cardinality_node_key_assembly_fntlpktyql" ON "qti_queries"."placed_binding_cardinality_node" IS 'key PlacedBindingCardinalityNode(assembly, attribute, cardinality, instance, package, start)';

COMMENT ON CONSTRAINT "__placed_single_binding_most_key_assembly_instance_vcdg3fyq5d" ON "qti_queries"."placed_single_binding_most" IS 'key PlacedSingleBindingMost(assembly, instance, package, start)';

COMMENT ON CONSTRAINT "__placed_single_response_gap_key_assembly_gap_gap_xbhadvjoqt" ON "qti_queries"."placed_single_response_gap" IS 'key PlacedSingleResponseGap(assembly, gap, gapPath, instance, package)';

COMMENT ON CONSTRAINT "__printed_integer_cardinality_key_attribute_lzgsx2z4pl" ON "qti_queries"."printed_integer_cardinality" IS 'key PrintedIntegerCardinality(attribute, cardinality, kind, package, path, start)';

COMMENT ON CONSTRAINT "__single_binding_most_key_package_path_start_g2h4skik3l" ON "qti_queries"."single_binding_most" IS 'key SingleBindingMost(package, path, start)';

COMMENT ON CONSTRAINT "__single_response_gap_key_gap_gap_path_package_z35gjmaasr" ON "qti_queries"."single_response_gap" IS 'key SingleResponseGap(gap, gapPath, package)';

COMMENT ON CONSTRAINT "__template_ref_cardinality_key_attribute_cardinality_rpxx2vit3m" ON "qti_queries"."template_ref_cardinality" IS 'key TemplateRefCardinality(attribute, cardinality, kind, package, path, start)';

COMMENT ON CONSTRAINT "__declared_identifier_text_key_package_path_start_hjjyt74kgm" ON "qti_views"."declared_identifier_text" IS 'key DeclaredIdentifierText(package, path, start)';

COMMENT ON CONSTRAINT "__header_token_key_at_package_path_start_sk7i7uyonf" ON "qti_views"."header_token" IS 'key HeaderToken(at, package, path, start)';

COMMENT ON CONSTRAINT "__cell_token_key_package_path_start_table_token_n3oiycyiey" ON "qti_queries"."cell_token" IS 'key CellToken(package, path, start, table, tokenDigest)';

COMMENT ON CONSTRAINT "__id_value_key_admitted_id_digest_owner_package_path_c6f35n4iya" ON "qti_views"."id_value" IS 'key IdValue(admitted, idDigest, owner, package, path, start)';

COMMENT ON CONSTRAINT "__id_binding_key_id_digest_owner_package_path_n75zwtmdsw" ON "qti_queries"."id_binding" IS 'key IdBinding(idDigest, owner, package, path)';

COMMENT ON CONSTRAINT "__lang_value_key_package_path_start_qm7q4vldtd" ON "qti_views"."lang_value" IS 'key LangValue(package, path, start)';

COMMENT ON CONSTRAINT "__located_template_key_package_path_template_o7xucmihcr" ON "qti_views"."located_template" IS 'key LocatedTemplate(package, path, template)';

COMMENT ON CONSTRAINT "__expression_attribute_key_assembly_base_type_hvfj3vq3fu" ON "qti_queries"."expression_attribute" IS 'key ExpressionAttribute(assembly, baseType, instance, package, path, start)';

COMMENT ON CONSTRAINT "__placed_expression_site_key_assembly_instance_h24c66zaty" ON "qti_queries"."placed_expression_site" IS 'key PlacedExpressionSite(assembly, instance, package, path, start)';

COMMENT ON CONSTRAINT "__placed_reference_site_key_assembly_attribute_tfnxl2bebp" ON "qti_queries"."placed_reference_site" IS 'key PlacedReferenceSite(assembly, attribute, instance, package, path, start)';

COMMENT ON CONSTRAINT "__lookup_value_key_name_package_path_start_7z6wncue2i" ON "qti_views"."lookup_value" IS 'key LookupValue(name, package, path, start)';

COMMENT ON CONSTRAINT "__lookup_value_type_key_base_type_package_path_start_oon5o7z6fk" ON "qti_queries"."lookup_value_type" IS 'key LookupValueType(baseType, package, path, start, value)';

COMMENT ON CONSTRAINT "__map_key_key_package_path_start_4oetgjnq4e" ON "qti_views"."map_key" IS 'key MapKey(package, path, start)';

COMMENT ON CONSTRAINT "__map_key_type_key_package_path_start_xl4m6mhlvc" ON "qti_queries"."map_key_type" IS 'key MapKeyType(package, path, start)';

COMMENT ON CONSTRAINT "__mastery_value_key_package_path_start_s6nkmjsn2v" ON "qti_views"."mastery_value" IS 'key MasteryValue(package, path, start)';

COMMENT ON CONSTRAINT "__named_declaration_key_package_path_start_lk5522fmne" ON "qti_views"."named_declaration" IS 'key NamedDeclaration(package, path, start)';

COMMENT ON CONSTRAINT "__declared_placement_key_assembly_attribute_instance_pw7wqjd6ae" ON "qti_queries"."declared_placement" IS 'key DeclaredPlacement(assembly, attribute, instance, package, path, start)';

COMMENT ON CONSTRAINT "__free_mapping_target_key_package_path_start_sl46g5cpkl" ON "qti_queries"."free_mapping_target" IS 'key FreeMappingTarget(package, path, start)';

COMMENT ON CONSTRAINT "__item_read_key_assembly_attribute_instance_package_d2m7wsupoi" ON "qti_queries"."item_read" IS 'key ItemRead(assembly, attribute, instance, package, path, start, variable)';

COMMENT ON CONSTRAINT "__item_ref_table_key_package_path_start_table_f2wtafi32m" ON "qti_queries"."item_ref_table" IS 'key ItemRefTable(package, path, start, table, variable)';

COMMENT ON CONSTRAINT "__item_scoped_reading_key_assembly_package_path_rirf323xmb" ON "qti_queries"."item_scoped_reading" IS 'key ItemScopedReading(assembly, package, path, start)';

COMMENT ON CONSTRAINT "__mapped_response_declaration_key_package_path_m6hftwuxwb" ON "qti_queries"."mapped_response_declaration" IS 'key MappedResponseDeclaration(package, path)';

COMMENT ON CONSTRAINT "__numbered_target_key_assembly_package_scope_scope_dgdnb2r25f" ON "qti_queries"."numbered_target" IS 'key NumberedTarget(assembly, package, scope, scopeInstance, scopePath, variable)';

COMMENT ON CONSTRAINT "__prefixed_declaration_key_assembly_declaration_kind_abmvdh47x3" ON "qti_queries"."prefixed_declaration" IS 'key PrefixedDeclaration(assembly, declarationKind, kind, package, path, start)';

COMMENT ON CONSTRAINT "__prefixed_map_response_key_package_scope_scope_path_sidjduba3v" ON "qti_queries"."prefixed_map_response" IS 'key PrefixedMapResponse(package, scope, scopePath, variable)';

COMMENT ON CONSTRAINT "__prefixed_map_response_point_key_package_scope_6fg6d6jicb" ON "qti_queries"."prefixed_map_response_point" IS 'key PrefixedMapResponsePoint(package, scope, scopePath, variable)';

COMMENT ON CONSTRAINT "__referable_name_key_attribute_identifier_kind_w7ohl4uahp" ON "qti_queries"."referable_name" IS 'key ReferableName(attribute, identifier, kind, package, path)';

COMMENT ON CONSTRAINT "__rooted_declaration_key_package_path_start_2zlcgsrn7k" ON "qti_queries"."rooted_declaration" IS 'key RootedDeclaration(package, path, start)';

COMMENT ON CONSTRAINT "__scope_duration_read_key_assembly_attribute_6p52zon42p" ON "qti_queries"."scope_duration_read" IS 'key ScopeDurationRead(assembly, attribute, instance, package, path, start)';

COMMENT ON CONSTRAINT "__sole_reading_key_assembly_attribute_instance_qwhimz6mxn" ON "qti_queries"."sole_reading" IS 'key SoleReading(assembly, attribute, instance, package, path, start)';

COMMENT ON CONSTRAINT "__test_reading_key_assembly_attribute_package_path_rx2253qjk4" ON "qti_queries"."test_reading" IS 'key TestReading(assembly, attribute, package, path, scope, scopeInstance, start, variable)';

COMMENT ON CONSTRAINT "__unclaimed_name_key_identifier_package_path_s4gaozl7e4" ON "qti_queries"."unclaimed_name" IS 'key UnclaimedName(identifier, package, path)';

COMMENT ON CONSTRAINT "__normal_maximum_key_package_path_start_3sqyzp5rxm" ON "qti_views"."normal_maximum" IS 'key NormalMaximum(package, path, start)';

COMMENT ON CONSTRAINT "__mastery_ceiling_key_package_path_start_b6eabqkyhh" ON "qti_queries"."mastery_ceiling" IS 'key MasteryCeiling(package, path, start)';

COMMENT ON CONSTRAINT "__normal_minimum_key_package_path_start_value_sqnhvp5qxi" ON "qti_views"."normal_minimum" IS 'key NormalMinimum(package, path, start, value)';

COMMENT ON CONSTRAINT "__mastery_floor_key_normal_minimum_package_path_ktvpvkuzpi" ON "qti_queries"."mastery_floor" IS 'key MasteryFloor(normalMinimum, package, path, start)';

COMMENT ON CONSTRAINT "__placed_variable_ref_node_key_assembly_attribute_nohygv6xvs" ON "qti_views"."placed_variable_ref_node" IS 'key PlacedVariableRefNode(assembly, attribute, instance, package, path, start)';

COMMENT ON CONSTRAINT "__held_type_key_assembly_held_base_held_cardinality_ctof3krbrw" ON "qti_queries"."held_type" IS 'key HeldType(assembly, heldBase, heldCardinality, instance, package, path, start)';

COMMENT ON CONSTRAINT "__interpolated_lookup_key_assembly_declaration_wy5cuxbuaf" ON "qti_queries"."interpolated_lookup" IS 'key InterpolatedLookup(assembly, declaration, instance, package, path, start)';

COMMENT ON CONSTRAINT "__placed_variable_cardinality_key_assembly_attribute_pmwnnjmp6r" ON "qti_queries"."placed_variable_cardinality" IS 'key PlacedVariableCardinality(assembly, attribute, cardinality, declCardinality, instance, package, path, start)';

COMMENT ON CONSTRAINT "__placed_variable_declaration_key_base_type_decl_2hzd2b5ni6" ON "qti_queries"."placed_variable_declaration" IS 'key PlacedVariableDeclaration(baseType, declPath, declStart, package)';

COMMENT ON CONSTRAINT "__placed_variable_ref_declaration_key_assembly_hz2ptotbj5" ON "qti_queries"."placed_variable_ref_declaration" IS 'key PlacedVariableRefDeclaration(assembly, attribute, declaration, instance, package, path, start)';

COMMENT ON CONSTRAINT "__unweighted_read_key_assembly_instance_package_path_5frf5f2pbb" ON "qti_queries"."unweighted_read" IS 'key UnweightedRead(assembly, instance, package, path, start)';

COMMENT ON CONSTRAINT "__weighted_read_key_assembly_instance_package_path_zzzoln6ktb" ON "qti_queries"."weighted_read" IS 'key WeightedRead(assembly, instance, package, path, start)';

COMMENT ON CONSTRAINT "__record_node_key_package_path_start_x2a5pznqdf" ON "qti_views"."record_node" IS 'key RecordNode(package, path, start)';

COMMENT ON CONSTRAINT "__described_assembled_lang_key_form_general_instance_c7yy5up43t" ON "qti_queries"."described_assembled_lang" IS 'key DescribedAssembledLang(form, general, instance, package, path)';

COMMENT ON CONSTRAINT "__described_lang_key_form_general_package_path_juppavslea" ON "qti_queries"."described_lang" IS 'key DescribedLang(form, general, package, path)';

COMMENT ON CONSTRAINT "__forbidden_resource_type_key_package_path_type_jxu54nomx6" ON "qti_queries"."forbidden_resource_type" IS 'key ForbiddenResourceType(package, path, type)';

COMMENT ON CONSTRAINT "__listed_identifier_key_package_path_record_ysrn4ulmtb" ON "qti_queries"."listed_identifier" IS 'key ListedIdentifier(package, path, record)';

COMMENT ON CONSTRAINT "__listed_lang_key_general_lang_package_path_cwg4nkor7p" ON "qti_queries"."listed_lang" IS 'key ListedLang(general, lang, package, path)';

COMMENT ON CONSTRAINT "__listed_title_key_package_path_record_z5di5ccebw" ON "qti_queries"."listed_title" IS 'key ListedTitle(package, path, record)';

COMMENT ON CONSTRAINT "__matched_identifier_key_package_path_record_q3zee654xa" ON "qti_queries"."matched_identifier" IS 'key MatchedIdentifier(package, path, record)';

COMMENT ON CONSTRAINT "__matched_title_key_package_path_record_ux5wlcuefg" ON "qti_queries"."matched_title" IS 'key MatchedTitle(package, path, record)';

COMMENT ON CONSTRAINT "__other_vocabulary_type_key_package_path_type_hcqu77dqtf" ON "qti_queries"."other_vocabulary_type" IS 'key OtherVocabularyType(package, path, type)';

COMMENT ON CONSTRAINT "__ssml_value_key_kind_package_path_start_value_hmz7closen" ON "qti_views"."ssml_value" IS 'key SsmlValue(kind, package, path, start, valueDigest)';

COMMENT ON CONSTRAINT "__trimmed_mark_key_package_path_start_value_digest_zfia7ln6ox" ON "qti_queries"."trimmed_mark" IS 'key TrimmedMark(package, path, start, valueDigest)';

COMMENT ON CONSTRAINT "__typed_declaration_name_key_package_path_start_qipikrgqb2" ON "qti_views"."typed_declaration_name" IS 'key TypedDeclarationName(package, path, start)';

COMMENT ON CONSTRAINT "__binding_base_type_node_key_attribute_base_type_5sibdz5a2v" ON "qti_queries"."binding_base_type_node" IS 'key BindingBaseTypeNode(attribute, baseType, cardinality, package, path, start)';

COMMENT ON CONSTRAINT "__feedback_ref_base_type_key_attribute_base_type_eg6o5hiuyv" ON "qti_queries"."feedback_ref_base_type" IS 'key FeedbackRefBaseType(attribute, baseType, kind, package, path, start)';

COMMENT ON CONSTRAINT "__placed_binding_base_type_node_key_assembly_v24fbwcjjj" ON "qti_queries"."placed_binding_base_type_node" IS 'key PlacedBindingBaseTypeNode(assembly, attribute, baseType, cardinality, instance, package, start)';

COMMENT ON CONSTRAINT "__placed_variable_base_key_assembly_attribute_base_q5i4ytwgzp" ON "qti_queries"."placed_variable_base" IS 'key PlacedVariableBase(assembly, attribute, baseType, instance, package, path, start, valueBase)';

COMMENT ON CONSTRAINT "__printed_integer_base_type_key_attribute_base_type_xrq5jnwsf4" ON "qti_queries"."printed_integer_base_type" IS 'key PrintedIntegerBaseType(attribute, baseType, kind, package, path, start)';

COMMENT ON CONSTRAINT "__template_ref_base_type_key_attribute_base_type_yntfprkc4c" ON "qti_queries"."template_ref_base_type" IS 'key TemplateRefBaseType(attribute, baseType, kind, package, path, start)';

COMMENT ON CONSTRAINT "__variable_ref_node_key_attribute_package_path_start_mi3vxa5s2g" ON "qti_views"."variable_ref_node" IS 'key VariableRefNode(attribute, package, path, start)';

COMMENT ON INDEX "qti_queries"."__anchored_name_key_anchor_anchor_document_assembly_5dyoy25avn" IS 'key AnchoredName(anchor, anchorDocument, assembly, instance, package, start)';

COMMENT ON INDEX "qti_queries"."__cell_leaf_node_key_at_cell_package_path_whape5yurb" IS 'key CellLeafNode(at, cell, package, path)';

COMMENT ON INDEX "qti_queries"."__item_ref_section_key_package_path_section_start_huuztaszsy" IS 'key ItemRefSection(package, path, section, start)';

COMMENT ON INDEX "qti_queries"."__link_scope_key_assembly_instance_package_start_4xwco3vulq" IS 'key LinkScope(assembly, instance, package, start)';

COMMENT ON INDEX "qti_queries"."__named_item_ref_key_identifier_package_path_cjipyypodh" IS 'key NamedItemRef(identifier, package, path)';

COMMENT ON INDEX "qti_queries"."__structure_node_key_identifier_package_path_h6erkakzcn" IS 'key StructureNode(identifier, package, path)';

COMMENT ON INDEX "qti_queries"."__test_member_key_package_part_path_start_test_6ylsojpor3" IS 'key TestMember(package, part, path, start, test)';

COMMENT ON INDEX "qti_queries"."__test_part_key_package_path_start_test_yibfhzajwv" IS 'key TestPart(package, path, start, test)';

COMMENT ON INDEX "qti_queries"."__anchored_id_key_package_assembly_anchor_id_digest_ovxililkp7" IS 'key AnchoredId(package, assembly, anchor, idDigest)';

COMMENT ON INDEX "qti_queries"."__anchored_name_key_package_assembly_anchor_75b3sgftbe" IS 'key AnchoredName(package, assembly, anchor, identifier)';

COMMENT ON INDEX "qti_queries"."__assembled_name_key_package_assembly_identifier_i5w45wdzfe" IS 'key AssembledName(package, assembly, identifier)';

COMMENT ON INDEX "qti_queries"."__choice_space_name_key_package_path_identifier_je57dmqa3s" IS 'key ChoiceSpaceName(package, path, identifier)';

COMMENT ON INDEX "qti_queries"."__copied_id_key_package_assembly_id_digest_2uzj33d6a3" IS 'key CopiedId(package, assembly, idDigest)';

COMMENT ON INDEX "qti_queries"."__filtered_section_key_package_assembly_path_start_k474ec3hxw" IS 'key FilteredSection(package, assembly, path, start)';

COMMENT ON INDEX "qti_queries"."__id_binding_key_package_path_id_digest_3sljrxo4f7" IS 'key IdBinding(package, path, idDigest)';

COMMENT ON INDEX "qti_queries"."__known_operand_base_key_package_assembly_instance_vl6osrfgvs" IS 'key KnownOperandBase(package, assembly, instance, path, operator)';

COMMENT ON INDEX "qti_queries"."__known_operand_cardinality_key_package_assembly_cwegbcqnc3" IS 'key KnownOperandCardinality(package, assembly, instance, path, operator)';

COMMENT ON INDEX "qti_queries"."__most_one_argument_key_package_path_apply_4kx4kzif6g" IS 'key MostOneArgument(package, path, apply)';

COMMENT ON INDEX "qti_queries"."__most_two_argument_pair_key_package_path_apply_hwcxt7n3hr" IS 'key MostTwoArgumentPair(package, path, apply)';

COMMENT ON INDEX "qti_queries"."__placed_choice_space_name_key_package_assembly_mvkk3vga2a" IS 'key PlacedChoiceSpaceName(package, assembly, identifier)';

COMMENT ON INDEX "qti_queries"."__placed_single_response_gap_key_package_assembly_gpbmkjxrmh" IS 'key PlacedSingleResponseGap(package, assembly, instance, start)';

COMMENT ON INDEX "qti_queries"."__set_field_name_key_package_path_set_identifier_t6ccnb7lt6" IS 'key SetFieldName(package, path, set, identifier)';

COMMENT ON INDEX "qti_queries"."__single_response_gap_key_package_path_start_kinr3pw232" IS 'key SingleResponseGap(package, path, start)';

COMMENT ON INDEX "qti_queries"."__table_header_key_package_path_table_id_digest_ll7spl6q4s" IS 'key TableHeader(package, path, table, idDigest)';

COMMENT ON INDEX "qti_queries"."__test_reading_key_package_assembly_path_start_gp4kji7wmm" IS 'key TestReading(package, assembly, path, start, attribute)';

COMMENT ON INDEX "qti_queries"."__trimmed_mark_key_package_path_fragment_value_ph5yyec5ja" IS 'key TrimmedMark(package, path, fragment, valueDigest)';

COMMENT ON INDEX "qti_views"."__catalog_id_key_package_path_id_digest_mciepy4knc" IS 'key CatalogId(package, path, idDigest)';

COMMENT ON INDEX "qti_views"."__header_token_key_package_path_start_token_digest_t2bfemyied" IS 'key HeaderToken(package, path, start, tokenDigest)';

COMMENT ON INDEX "qti_views"."__named_declaration_key_package_path_identifier_yrrnrduedy" IS 'key NamedDeclaration(package, path, identifier)';

COMMENT ON TABLE "qti"."__package_founding_uhrajutine" IS 'founding of unit Package';

COMMENT ON CONSTRAINT "__package_founding_pk_bsmr6ynr7m" ON "qti"."__package_founding_uhrajutine" IS 'key of the founding of unit Package';

COMMENT ON INDEX "qti"."__attribute_ix_name_path_start_package_a_4_p_2_u_7_hk4lma32u7" IS 'btree index Attribute(name, path, start, __package_a4p2u7pv6l)';

COMMENT ON INDEX "qti"."__attribute_ix_package_kind_name_start_value_digest_w5stqim4oh" IS 'btree index Attribute(package, kind, name, start, valueDigest, path), value filtered beside it, not indexed: no byte bound fits the entry';

COMMENT ON INDEX "qti"."__attribute_ix_package_name_value_digest_kind_path_4s3els6lve" IS 'btree index Attribute(package, name, valueDigest, kind, path, start), value filtered beside it, not indexed: no byte bound fits the entry';

COMMENT ON INDEX "qti"."__attribute_ix_package_path_kind_name_start_jthzickiic" IS 'btree index Attribute(package, path, kind, name, start)';

COMMENT ON INDEX "qti"."__attribute_ix_package_path_name_value_digest_kind_lfjsj5svsz" IS 'btree index Attribute(package, path, name, valueDigest, kind, start), value filtered beside it, not indexed: no byte bound fits the entry';

COMMENT ON INDEX "qti"."__bound_variable_ix_adaptive_package_path_vykdhcnses" IS 'btree index BoundVariable(adaptive, package, path)';

COMMENT ON INDEX "qti"."__bound_variable_ix_package_attribute_path_ej2y7oq7v2" IS 'btree index BoundVariable(package, attribute, path)';

COMMENT ON INDEX "qti"."__bound_variable_ix_path_start_package_pyofn_3_cand_ggzllvtzhh" IS 'btree index BoundVariable(path, start, __package_pyofn3cand)';

COMMENT ON INDEX "qti"."__candidate_path_ix_package_target_6vqzdz37df" IS 'btree index CandidatePath(package, target)';

COMMENT ON INDEX "qti"."__choice_ix_package_path_identifier_gja2ztdp2y" IS 'btree index Choice(package, path, identifier)';

COMMENT ON INDEX "qti"."__choice_interaction_ix_interaction_interaction_path_eltlb3fxvv" IS 'btree index ChoiceInteraction(interaction, interactionPath, package, path)';

COMMENT ON INDEX "qti"."__data_ssml_property_ix_member_package_path_start_yctyt4mr3r" IS 'btree index DataSsmlProperty(member, package, path, start, memberNameDigest)';

COMMENT ON INDEX "qti"."__data_ssml_property_ix_member_package_path_start_3ibi7dhxxr" IS 'btree index DataSsmlProperty(member, package, path, start, nameDigest)';

COMMENT ON INDEX "qti"."__document_ix_package_assembled_path_6hx6cticyt" IS 'btree index Document(package, assembled, path)';

COMMENT ON INDEX "qti"."__file_ix_package_path_scope_7xmywfgdth" IS 'btree index File(package, path, scope)';

COMMENT ON INDEX "qti"."__file_path_ix_package_target_bcslhqdpz7" IS 'btree index FilePath(package, target)';

COMMENT ON INDEX "qti"."__fragment_context_ref_ix_attribute_identifier_kind_pwcxnr27km" IS 'btree index FragmentContextRef(attribute, identifier, kind, package, path, start)';

COMMENT ON INDEX "qti"."__fragment_feedback_ref_ix_attribute_identifier_kind_seb6fwpevd" IS 'btree index FragmentFeedbackRef(attribute, identifier, kind, package, path, start)';

COMMENT ON INDEX "qti"."__fragment_printed_ref_ix_attribute_identifier_kind_rvyu6hyn5x" IS 'btree index FragmentPrintedRef(attribute, identifier, kind, package, path, start)';

COMMENT ON INDEX "qti"."__fragment_scope_ix_contexts_document_feedbacks_7o6ndg23f4" IS 'btree index FragmentScope(contexts, document, feedbacks, package, prints, templates)';

COMMENT ON INDEX "qti"."__fragment_template_ref_ix_attribute_identifier_kind_ypbawdd6ec" IS 'btree index FragmentTemplateRef(attribute, identifier, kind, package, path, start)';

COMMENT ON INDEX "qti"."__idref_ix_package_name_path_nielih3bso" IS 'btree index Idref(package, name, path)';

COMMENT ON INDEX "qti"."__idref_ix_package_path_name_ckzbix4lpw" IS 'btree index Idref(package, path, name)';

COMMENT ON INDEX "qti"."__idref_ix_package_path_token_digest_32nufrmpv6" IS 'btree index Idref(package, path, tokenDigest)';

COMMENT ON INDEX "qti"."__inclusion_ix_package_path_places_spgyieuctf" IS 'btree index Inclusion(package, path, places)';

COMMENT ON INDEX "qti"."__instance_ix_choices_document_hottexts_idref_5im6kvrdif" IS 'btree index Instance(choices, document, hottexts, idrefTargets, ids, package)';

COMMENT ON INDEX "qti"."__instance_ix_document_package_root_kind_nkgaklmucx" IS 'btree index Instance(document, package, rootKind)';

COMMENT ON INDEX "qti"."__instance_ix_package_assembly_assembly_kind_2zcrpjyhyp" IS 'btree index Instance(package, assembly, assemblyKind, document, parent)';

COMMENT ON INDEX "qti"."__instance_ix_package_assembly_assembly_kind_end_q7wzhnaz2c" IS 'btree index Instance(package, assembly, assemblyKind, end, parent)';

COMMENT ON INDEX "qti"."__instance_ix_package_assembly_assembly_kind_parent_iosfbagjuc" IS 'btree index Instance(package, assembly, assemblyKind, parent, siteDocument, document)';

COMMENT ON INDEX "qti"."__instance_ix_package_assembly_assembly_kind_site_xl4wk5cyg3" IS 'btree index Instance(package, assembly, assemblyKind, site, parent, siteDocument)';

COMMENT ON INDEX "qti"."__instance_ix_package_assembly_assembly_kind_site_ud6zrlsye4" IS 'btree index Instance(package, assembly, assemblyKind, siteDocument, document)';

COMMENT ON INDEX "qti"."__instance_ix_package_assembly_document_assembly_7ihxhlx23c" IS 'btree index Instance(package, assembly, document, assemblyKind, end)';

COMMENT ON INDEX "qti"."__instance_ix_package_assembly_kind_document_fqoo34oqex" IS 'btree index Instance(package, assemblyKind, document, bindings)';

COMMENT ON INDEX "qti"."__instance_ix_package_assembly_kind_site_site_sl2jophonf" IS 'btree index Instance(package, assemblyKind, site, siteDocument, assembly)';

COMMENT ON INDEX "qti"."__instance_ix_package_site_site_document_document_w4pi7om2g3" IS 'btree index Instance(package, site, siteDocument, document, assembly, assemblyKind, parent)';

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

COMMENT ON INDEX "qti"."__item_ref_document_ix_package_target_path_start_ib4pwlpych" IS 'btree index ItemRefDocument(package, target, path, start)';

COMMENT ON INDEX "qti"."__label_use_ix_package_path_root_kind_gkglyfua6p" IS 'btree index LabelUse(package, path, rootKind)';

COMMENT ON INDEX "qti"."__named_ix_package_identifier_start_wc6xxyiksv" IS 'btree index Named(package, identifier, start)';

COMMENT ON INDEX "qti"."__named_ix_package_start_path_7f3qws5tbb" IS 'btree index Named(package, start, path)';

COMMENT ON INDEX "qti"."__node_ix_package_end_path_kind_parent_j4wpst3jjn" IS 'btree index Node(package, end, path, kind, parent)';

COMMENT ON INDEX "qti"."__node_ix_package_kind_start_parent_edwlyi4oks" IS 'btree index Node(package, kind, start, parent)';

COMMENT ON INDEX "qti"."__node_ix_package_parent_kind_kind_element_children_ilct6rhmkh" IS 'btree index Node(package, parentKind, kind, elementChildren, path)';

COMMENT ON INDEX "qti"."__node_ix_package_path_elements_parent_kind_tnqealhfrg" IS 'btree index Node(package, path, elements, parent, kind)';

COMMENT ON INDEX "qti"."__node_ix_package_path_kind_elements_parent_kind_pulmkzqhiy" IS 'btree index Node(package, path, kind, elements, parentKind)';

COMMENT ON INDEX "qti"."__node_ix_package_path_kind_parent_parent_kind_rg5l3fmim3" IS 'btree index Node(package, path, kind, parent, parentKind)';

COMMENT ON INDEX "qti"."__node_ix_package_path_parent_at_3js7ucei5d" IS 'btree index Node(package, path, parent, at)';

COMMENT ON INDEX "qti"."__node_ix_package_path_parent_kind_kind_element_j4bvncolbi" IS 'btree index Node(package, path, parentKind, kind, elementChildren)';

COMMENT ON INDEX "qti"."__node_ix_package_start_parent_kind_path_6fvamsy2ua" IS 'btree index Node(package, start, parentKind, path)';

COMMENT ON INDEX "qti"."__numbered_reading_ix_package_assembly_scope_scope_7yycpnglom" IS 'btree index NumberedReading(package, assembly, scope, scopeInstance, variable)';

COMMENT ON INDEX "qti"."__numbered_reading_ix_package_assembly_scope_bnbqdanqao" IS 'btree index NumberedReading(package, assembly, scopeInstance, scopePath, variable)';

COMMENT ON INDEX "qti"."__open_attribute_ix_element_namespace_kind_package_miiko3525k" IS 'btree index OpenAttribute(elementNamespace, kind, package, path, start)';

COMMENT ON INDEX "qti"."__placed_binding_ix_adaptive_assembly_package_7gm4mjnnud" IS 'btree index PlacedBinding(adaptive, assembly, package)';

COMMENT ON INDEX "qti"."__placed_binding_ix_assembly_instance_package_path_lpkwyl5gz4" IS 'btree index PlacedBinding(assembly, instance, package, path)';

COMMENT ON INDEX "qti"."__placed_binding_ix_package_attribute_identifier_j5spedbipc" IS 'btree index PlacedBinding(package, attribute, identifier, path, start)';

COMMENT ON INDEX "qti"."__placed_binding_ix_path_start_package_pyofn_3_cand_2mhddflj74" IS 'btree index PlacedBinding(path, start, __package_pyofn3cand)';

COMMENT ON INDEX "qti"."__placed_choice_ix_identifier_package_path_start_b4qfx73qw3" IS 'btree index PlacedChoice(identifier, package, path, start)';

COMMENT ON INDEX "qti"."__placed_choice_ix_kind_package_path_start_mldz5gffdb" IS 'btree index PlacedChoice(kind, package, path, start)';

COMMENT ON INDEX "qti"."__placed_choice_ix_package_assembly_identifier_uhvul24o7s" IS 'btree index PlacedChoice(package, assembly, identifier)';

COMMENT ON INDEX "qti"."__placed_expression_ix_package_base_type_assembly_ew46jpbkh3" IS 'btree index PlacedExpression(package, baseType, assembly)';

COMMENT ON INDEX "qti"."__placed_expression_ix_package_path_start_assembly_js2cxw5c7t" IS 'btree index PlacedExpression(package, path, start, assembly, instance)';

COMMENT ON INDEX "qti"."__placed_hottext_ix_identifier_package_path_start_6mrbhc7y7h" IS 'btree index PlacedHottext(identifier, package, path, start)';

COMMENT ON INDEX "qti"."__placed_idref_ix_id_digest_package_path_ru3szdlp65" IS 'btree index PlacedIdref(idDigest, package, path)';

COMMENT ON INDEX "qti"."__placed_math_rank_ix_assembly_instance_package_path_sbwh2q74x2" IS 'btree index PlacedMathRank(assembly, instance, package, path)';

COMMENT ON INDEX "qti"."__placed_math_rank_ix_package_path_start_v42fxoxi7w" IS 'btree index PlacedMathRank(package, path, start)';

COMMENT ON INDEX "qti"."__placed_share_target_ix_assembly_assembly_kind_aq6uuxrfxp" IS 'btree index PlacedShareTarget(assembly, assemblyKind, instance, package, path)';

COMMENT ON INDEX "qti"."__placed_share_target_ix_assembly_package_target_l6gfxbsrsm" IS 'btree index PlacedShareTarget(assembly, package, target, targetInstance)';

COMMENT ON INDEX "qti"."__placed_share_target_ix_assembly_package_target_2xc2tepmfu" IS 'btree index PlacedShareTarget(assembly, package, targetInstance, targetStart)';

COMMENT ON INDEX "qti"."__placed_variable_ref_ix_assembly_package_root_kind_56g44g5h5b" IS 'btree index PlacedVariableRef(assembly, package, rootKind)';

COMMENT ON INDEX "qti"."__placed_variable_ref_ix_package_assembly_resolution_ftelzmq36e" IS 'btree index PlacedVariableRef(package, assembly, resolution, attribute, path, start)';

COMMENT ON INDEX "qti"."__reference_path_ix_package_target_kind_yqvqc7r6ck" IS 'btree index ReferencePath(package, target, kind)';

COMMENT ON INDEX "qti"."__resource_href_path_ix_package_target_w6il6mi33e" IS 'btree index ResourceHrefPath(package, target)';

COMMENT ON INDEX "qti"."__share_fragment_ix_assembled_package_path_nqr4ku73uk" IS 'btree index ShareFragment(assembled, package, path, placements)';

COMMENT ON INDEX "qti"."__share_fragment_ix_id_digest_package_path_jpajpi2hz2" IS 'btree index ShareFragment(idDigest, package, path)';

COMMENT ON INDEX "qti"."__share_target_ix_package_path_target_start_vj2n53ubgi" IS 'btree index ShareTarget(package, path, targetStart)';

COMMENT ON INDEX "qti"."__site_ix_package_path_external_kind_5ng7m7ogjx" IS 'btree index Site(package, path, external, kind)';

COMMENT ON INDEX "qti"."__site_path_ix_entry_package_target_wrj5ssqldp" IS 'btree index SitePath(entry, package, target)';

COMMENT ON INDEX "qti"."__site_path_ix_package_path_entry_kind_cw75fb42kr" IS 'btree index SitePath(package, path, entry, kind)';

COMMENT ON INDEX "qti"."__site_target_ix_package_splices_target_24yg3jerix" IS 'btree index SiteTarget(package, splices, target)';

COMMENT ON INDEX "qti"."__text_idref_ix_package_path_token_digest_6rnu6d6nqb" IS 'btree index TextIdref(package, path, tokenDigest)';

COMMENT ON INDEX "qti"."__text_reference_path_ix_package_target_zlcnodi5ns" IS 'btree index TextReferencePath(package, target)';

COMMENT ON INDEX "qti"."__variable_ref_ix_package_attribute_path_identifier_tqkcbmxekv" IS 'btree index VariableRef(package, attribute, path, identifier)';

COMMENT ON INDEX "qti"."__variable_ref_ix_package_identifier_path_d6gyopiavl" IS 'btree index VariableRef(package, identifier, path)';

COMMENT ON INDEX "qti"."__variable_ref_ix_package_path_root_kind_merm4oeh73" IS 'btree index VariableRef(package, path, rootKind)';

COMMENT ON STATISTICS "qti_queries"."__anchored_name_dep_package_anchor_abe7k44tqa" IS 'dependencies AnchoredName(package, anchor)';

COMMENT ON STATISTICS "qti_queries"."__link_scope_dep_package_assembly_55fsw5zrkr" IS 'dependencies LinkScope(package, assembly)';

COMMENT ON FUNCTION "qti"."__reader_olds_apply_argument_4c24qjkfws"() IS 'the reader of the delta of olds of ApplyArgument';

COMMENT ON FUNCTION "qti"."__reader_olds_apply_argument_pair_ogmwc5lqg3"() IS 'the reader of the delta of olds of ApplyArgumentPair';

COMMENT ON FUNCTION "qti"."__reader_news_arity_floor_xgdhtuqsca"() IS 'the reader of the delta of news of ArityFloor';

COMMENT ON FUNCTION "qti"."__reader_olds_assembled_catalog_qim7ebbjd7"() IS 'the reader of the delta of olds of AssembledCatalog';

COMMENT ON FUNCTION "qti"."__reader_news_assembled_document_koz5se5v5l"() IS 'the reader of the delta of news of AssembledDocument';

COMMENT ON FUNCTION "qti"."__reader_olds_assembled_document_62lj7pfbk2"() IS 'the reader of the delta of olds of AssembledDocument';

COMMENT ON FUNCTION "qti"."__reader_olds_assembled_document_et5zs2axyb"() IS 'the reader of the delta of olds of AssembledDocument';

COMMENT ON FUNCTION "qti"."__reader_olds_assembled_id_bk3qjq6ihh"() IS 'the reader of the delta of olds of AssembledId';

COMMENT ON FUNCTION "qti"."__reader_olds_assembled_replaceable_cj776i6kmu"() IS 'the reader of the delta of olds of AssembledReplaceable';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_3u2lkhu22u"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_stt6xm5y22"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_wsgdkqqpln"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_qjeh7uxpfd"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_qxqwg7jwg3"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_mipyni7ya6"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_qoafepgjdf"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_b4e2ksidis"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_xrfphiap7g"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_2onaw42c2t"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_ropmjtdpnq"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_nensvb4d66"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_jexhcuma55"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_i4uvysyd5c"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_s3dov5suvh"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_7gi4wm4shg"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_6t4gc27z3f"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_36agnwvghb"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_ucug3cdn56"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_6u44gervfe"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_qkz7to2o7w"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_fkuzbvr6g5"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_z2d3s5vqs4"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_6e4xmsnkwq"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_rvqbrmh53s"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_odc53yxsu5"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_i43inonaun"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_t76wbztyok"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_ssr744dqxz"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_37l3nhgg7q"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_aichqluars"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_rsap7ddplr"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_6kltpic7gz"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_sxn23mbden"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_l6z3r5p3tu"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_etcfe7byyu"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_zyvqbjqy6a"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_tj2vx2uejx"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_ccjm3qcedh"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_gprlv5q3qq"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_u4yhdndzzl"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_pstg7bbakz"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_pg3zast2sc"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_6ak64smq6o"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_r4cmwmsovd"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_sjmko3rsm4"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_es3c7m6ojo"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_4ao5whb32f"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_4yak54st3x"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_6bcyajvobi"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_7jrdxxl3nu"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_mbtxr6v5m2"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_7defj2wvdg"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_tm434kpcsj"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_u6lycwqr6d"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_oeyizdyt2e"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_hzog2axf2t"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_ob2skhwqmv"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_c2z5j5j2gl"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_co5iqiyajn"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_feqdaihj5d"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_xmmirqrjcr"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_sbrgeq43lj"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_qwqvk2lwua"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_dehy4go36c"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_2tn4jf56t3"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_d2ew6i2x5k"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_tq65cmhbq4"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_rbcoiopmwt"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_7cbmtliaqf"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_apbunej4d6"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_ccbx3uvnmu"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_ygdlzspgey"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_w2brdlibuz"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_gl3cfgkkpv"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_klejh2r5qi"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_7wg3hrsmot"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_2wlf5i4cpt"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_vktduodeod"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_h2pi4o22nf"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_7226qdt36g"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_kodbwfnvuh"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_ugtxe77jcq"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_pmppmhq7k6"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_y4z7sj3nke"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_t6zjxlm52j"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_dryklxz4tb"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_6z7cezzgiv"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_45ckqsca3l"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_ihkt2pdmem"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_kpgudv7h5v"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_zzwr674cvv"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_3nn7546ctx"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_4fw5tnkctv"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_yk6t7relzb"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_slojl3r3pg"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_sz4owish45"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_7bgd2q3mij"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_ye7q2hhzcq"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_bd4zqz3v6m"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_uwuockcksq"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_kh3px3b56o"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_qazpxemo2d"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_54jjxrmxg3"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_attribute_idi54xg7pb"() IS 'the reader of the delta of news of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_rendmyqc2v"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_iqqtcf7bo6"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_rahli2ww42"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_k5fb2laa25"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_lx7rnmk446"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_mezgvaleeq"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_6qnacmeoe5"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_gs76iljk7u"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_f7nqiggyen"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_y2amnqx7ps"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_7ahpyp4sbs"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_2bgu6epes2"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_4lphps7ifz"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_y2y2f7iqsu"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_kgngzb5v6e"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_bkdwf5paha"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_xdyiso6zrf"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_ufltx2x7g4"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_z4hcaiqi73"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_6l6tky5kdf"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_mubqyvs5qp"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_hd7mrr3qz2"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_auj7i67x4p"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_7hjsjgqo7p"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_cqsjtpsibe"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_3ky7crl47p"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_h5kbg2m4u3"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_rrrgpjkszv"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_nz5fby6oer"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_g4ymuxk4tm"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_swy5mcrydk"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_zowdyo6map"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_2b6b5zfgvr"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_q5rxhemq6v"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_dkqnmmtgcx"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_rl43yfs56t"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_3zcpf7siwo"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_f2kcdn6ptj"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_hzmluppawr"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_x5tsb5nxsn"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_gohrjhh4f6"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_drpbn7a3tx"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_iaujoxxekz"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_ww3dygammp"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_rkhfvwjtrq"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_sgdqn5e6u2"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_zefjdysqh3"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_uc72uqaef6"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_cjxkxsubg6"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_svaykv4v3p"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_sfibumtyep"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_lrpput4odl"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_2zugzlcfrp"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_6z2pgccvw6"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_yennyfnglg"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_mis2rq7rhr"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_k2cakguxjt"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_rguqb43fxt"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_dku3iggh4s"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_lenrx5nlan"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_6d6gumoyoo"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_g75mt6522o"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_baqnld3o5m"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_fe2si7wkks"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_lpd7mrlyfi"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_d52ggfssoj"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_hp2ew5qdpb"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_4kj4bhpjfe"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_rwftyofolk"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_qgxozw4yob"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_by3k5iilfa"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_achovsc326"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_ismzkqe6tx"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_c67ivyyc7p"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_oldtre2ncn"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_3wc42hkigj"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_fvow67djv2"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_vfhpvtiqgw"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_v5tpj47nos"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_fswpomjsga"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_fpeomqg75d"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_r2u6dpuysl"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_4chzzkmdxj"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_b2c2apuq4x"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_veykdfdqd5"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_zqbq7hgizp"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_thkvqiknv3"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_bp5mdjdryc"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_on4z3zlzm4"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_5hnbdmfnc5"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_xn553ryrds"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_oalrcukayo"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_xqifuuya2f"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_playbdvfh5"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_kcu352js5y"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_nbuds52cfn"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_znnznyk6u7"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_vqxegoilit"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_ex2c52ehbm"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_4cgosdxxjk"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_p4nyrf4dwv"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_cecdygzmbc"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_e7ubotuvs2"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_nuaumdsphj"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_olds_attribute_z64vydi3rb"() IS 'the reader of the delta of olds of Attribute';

COMMENT ON FUNCTION "qti"."__reader_news_binary_math_operator_iyydtrcuvi"() IS 'the reader of the delta of news of BinaryMathOperator';

COMMENT ON FUNCTION "qti"."__reader_news_binding_base_type_node_jmc2k2huzu"() IS 'the reader of the delta of news of BindingBaseTypeNode';

COMMENT ON FUNCTION "qti"."__reader_news_binding_cardinality_node_xgdgt4fx4o"() IS 'the reader of the delta of news of BindingCardinalityNode';

COMMENT ON FUNCTION "qti"."__reader_news_binding_cardinality_node_65zj4xnonk"() IS 'the reader of the delta of news of BindingCardinalityNode';

COMMENT ON FUNCTION "qti"."__reader_news_binding_name_3guddpcux2"() IS 'the reader of the delta of news of BindingName';

COMMENT ON FUNCTION "qti"."__reader_news_bound_variable_3goqxuqzuq"() IS 'the reader of the delta of news of BoundVariable';

COMMENT ON FUNCTION "qti"."__reader_news_bound_variable_tvkgcilt56"() IS 'the reader of the delta of news of BoundVariable';

COMMENT ON FUNCTION "qti"."__reader_news_bound_variable_dkwkhvynub"() IS 'the reader of the delta of news of BoundVariable';

COMMENT ON FUNCTION "qti"."__reader_news_bound_variable_hoo6dueemr"() IS 'the reader of the delta of news of BoundVariable';

COMMENT ON FUNCTION "qti"."__reader_olds_bound_variable_w2tp7kkfm6"() IS 'the reader of the delta of olds of BoundVariable';

COMMENT ON FUNCTION "qti"."__reader_olds_bound_variable_lqda4sfi7w"() IS 'the reader of the delta of olds of BoundVariable';

COMMENT ON FUNCTION "qti"."__reader_olds_bound_variable_ku42cuizn4"() IS 'the reader of the delta of olds of BoundVariable';

COMMENT ON FUNCTION "qti"."__reader_olds_bounded_selection_vvzjaxsbcs"() IS 'the reader of the delta of olds of BoundedSelection';

COMMENT ON FUNCTION "qti"."__reader_news_branch_resolution_6eft7wfps5"() IS 'the reader of the delta of news of BranchResolution';

COMMENT ON FUNCTION "qti"."__reader_news_candidate_path_pbaimfnkrc"() IS 'the reader of the delta of news of CandidatePath';

COMMENT ON FUNCTION "qti"."__reader_olds_candidate_path_45lhcpk3bc"() IS 'the reader of the delta of olds of CandidatePath';

COMMENT ON FUNCTION "qti"."__reader_news_catalog_id_mubxvf4h72"() IS 'the reader of the delta of news of CatalogId';

COMMENT ON FUNCTION "qti"."__reader_olds_catalog_id_pa4zmb65o3"() IS 'the reader of the delta of olds of CatalogId';

COMMENT ON FUNCTION "qti"."__reader_olds_catalog_id_gwnl5m5i7x"() IS 'the reader of the delta of olds of CatalogId';

COMMENT ON FUNCTION "qti"."__reader_news_catalog_scope_wstgcjnbqo"() IS 'the reader of the delta of news of CatalogScope';

COMMENT ON FUNCTION "qti"."__reader_olds_catalog_scope_x7vibqcoii"() IS 'the reader of the delta of olds of CatalogScope';

COMMENT ON FUNCTION "qti"."__reader_olds_catalog_scope_jqprygokp5"() IS 'the reader of the delta of olds of CatalogScope';

COMMENT ON FUNCTION "qti"."__reader_news_catalog_scope_node_ewpcmknbqj"() IS 'the reader of the delta of news of CatalogScopeNode';

COMMENT ON FUNCTION "qti"."__reader_news_cell_child_5qm2pvurpg"() IS 'the reader of the delta of news of CellChild';

COMMENT ON FUNCTION "qti"."__reader_news_cell_leaf_xinldul2z5"() IS 'the reader of the delta of news of CellLeaf';

COMMENT ON FUNCTION "qti"."__reader_olds_cell_leaf_eclvnoh3at"() IS 'the reader of the delta of olds of CellLeaf';

COMMENT ON FUNCTION "qti"."__reader_news_cell_table_at2h3rjt5r"() IS 'the reader of the delta of news of CellTable';

COMMENT ON FUNCTION "qti"."__reader_news_cell_table_2f7o4rq6p5"() IS 'the reader of the delta of news of CellTable';

COMMENT ON FUNCTION "qti"."__reader_olds_cell_table_dzeeqc26uh"() IS 'the reader of the delta of olds of CellTable';

COMMENT ON FUNCTION "qti"."__reader_olds_cell_table_ffcc2gx22o"() IS 'the reader of the delta of olds of CellTable';

COMMENT ON FUNCTION "qti"."__reader_news_cell_token_ghhhryvaje"() IS 'the reader of the delta of news of CellToken';

COMMENT ON FUNCTION "qti"."__reader_news_choice_pkzj5p5qwb"() IS 'the reader of the delta of news of Choice';

COMMENT ON FUNCTION "qti"."__reader_news_choice_25ktcsljhn"() IS 'the reader of the delta of news of Choice';

COMMENT ON FUNCTION "qti"."__reader_olds_choice_45lxmsr44n"() IS 'the reader of the delta of olds of Choice';

COMMENT ON FUNCTION "qti"."__reader_olds_choice_dcnhiz6il6"() IS 'the reader of the delta of olds of Choice';

COMMENT ON FUNCTION "qti"."__reader_olds_choice_5u73p66z4h"() IS 'the reader of the delta of olds of Choice';

COMMENT ON FUNCTION "qti"."__reader_news_choice_interaction_xvto7uexoj"() IS 'the reader of the delta of news of ChoiceInteraction';

COMMENT ON FUNCTION "qti"."__reader_news_choice_interaction_jnksnaicar"() IS 'the reader of the delta of news of ChoiceInteraction';

COMMENT ON FUNCTION "qti"."__reader_news_choice_interaction_zx5riukbnx"() IS 'the reader of the delta of news of ChoiceInteraction';

COMMENT ON FUNCTION "qti"."__reader_olds_choice_interaction_24o7b5fxkb"() IS 'the reader of the delta of olds of ChoiceInteraction';

COMMENT ON FUNCTION "qti"."__reader_news_choice_node_xbprdovgpz"() IS 'the reader of the delta of news of ChoiceNode';

COMMENT ON FUNCTION "qti"."__reader_olds_choice_node_mtyztplndm"() IS 'the reader of the delta of olds of ChoiceNode';

COMMENT ON FUNCTION "qti"."__reader_news_choice_or_hottext_socmgluq4b"() IS 'the reader of the delta of news of ChoiceOrHottext';

COMMENT ON FUNCTION "qti"."__reader_news_cn_count_etfcw2aiir"() IS 'the reader of the delta of news of CnCount';

COMMENT ON FUNCTION "qti"."__reader_olds_cn_count_svk5w53qe6"() IS 'the reader of the delta of olds of CnCount';

COMMENT ON FUNCTION "qti"."__reader_news_comment_lhvytgyqnn"() IS 'the reader of the delta of news of Comment';

COMMENT ON FUNCTION "qti"."__reader_olds_comment_z2bej2ghlm"() IS 'the reader of the delta of olds of Comment';

COMMENT ON FUNCTION "qti"."__reader_news_context_ref_yushpd4usi"() IS 'the reader of the delta of news of ContextRef';

COMMENT ON FUNCTION "qti"."__reader_news_count_bound_tsrqqrdnh6"() IS 'the reader of the delta of news of CountBound';

COMMENT ON FUNCTION "qti"."__reader_news_count_bound_tjw22zp4k5"() IS 'the reader of the delta of news of CountBound';

COMMENT ON FUNCTION "qti"."__reader_news_count_bound_vphaptncro"() IS 'the reader of the delta of news of CountBound';

COMMENT ON FUNCTION "qti"."__reader_olds_count_bound_pameq4jyx5"() IS 'the reader of the delta of olds of CountBound';

COMMENT ON FUNCTION "qti"."__reader_olds_count_bound_6gktjow6vb"() IS 'the reader of the delta of olds of CountBound';

COMMENT ON FUNCTION "qti"."__reader_olds_count_bound_s72qv73rgo"() IS 'the reader of the delta of olds of CountBound';

COMMENT ON FUNCTION "qti"."__reader_olds_count_bound_cyskc6fdqu"() IS 'the reader of the delta of olds of CountBound';

COMMENT ON FUNCTION "qti"."__reader_olds_count_bound_m4uvapdqyj"() IS 'the reader of the delta of olds of CountBound';

COMMENT ON FUNCTION "qti"."__reader_news_count_bound_node_67lqxcg2ek"() IS 'the reader of the delta of news of CountBoundNode';

COMMENT ON FUNCTION "qti"."__reader_news_count_bound_node_dwc66qxx7r"() IS 'the reader of the delta of news of CountBoundNode';

COMMENT ON FUNCTION "qti"."__reader_news_data_ssml_3itvektu4d"() IS 'the reader of the delta of news of DataSsml';

COMMENT ON FUNCTION "qti"."__reader_olds_data_ssml_xch4zzyma4"() IS 'the reader of the delta of olds of DataSsml';

COMMENT ON FUNCTION "qti"."__reader_news_data_ssml_member_xb7hw5rcla"() IS 'the reader of the delta of news of DataSsmlMember';

COMMENT ON FUNCTION "qti"."__reader_news_data_ssml_member_w4o42paasm"() IS 'the reader of the delta of news of DataSsmlMember';

COMMENT ON FUNCTION "qti"."__reader_news_data_ssml_member_453vigc7u6"() IS 'the reader of the delta of news of DataSsmlMember';

COMMENT ON FUNCTION "qti"."__reader_olds_data_ssml_member_pbsql3z436"() IS 'the reader of the delta of olds of DataSsmlMember';

COMMENT ON FUNCTION "qti"."__reader_olds_data_ssml_member_mb6uglhifc"() IS 'the reader of the delta of olds of DataSsmlMember';

COMMENT ON FUNCTION "qti"."__reader_olds_data_ssml_member_uftmz355o7"() IS 'the reader of the delta of olds of DataSsmlMember';

COMMENT ON FUNCTION "qti"."__reader_olds_data_ssml_property_ahjac24dng"() IS 'the reader of the delta of olds of DataSsmlProperty';

COMMENT ON FUNCTION "qti"."__reader_news_declaration_base_type_mo2ftu4eqa"() IS 'the reader of the delta of news of DeclarationBaseType';

COMMENT ON FUNCTION "qti"."__reader_news_declaration_base_type_jndqynkm3p"() IS 'the reader of the delta of news of DeclarationBaseType';

COMMENT ON FUNCTION "qti"."__reader_olds_declaration_base_type_4q4qdbzqqw"() IS 'the reader of the delta of olds of DeclarationBaseType';

COMMENT ON FUNCTION "qti"."__reader_olds_declaration_base_type_pk2svhsag6"() IS 'the reader of the delta of olds of DeclarationBaseType';

COMMENT ON FUNCTION "qti"."__reader_news_declaration_cardinality_3yeln7iqzf"() IS 'the reader of the delta of news of DeclarationCardinality';

COMMENT ON FUNCTION "qti"."__reader_news_declaration_cardinality_texdhaunzv"() IS 'the reader of the delta of news of DeclarationCardinality';

COMMENT ON FUNCTION "qti"."__reader_news_declaration_cardinality_36nq65vbek"() IS 'the reader of the delta of news of DeclarationCardinality';

COMMENT ON FUNCTION "qti"."__reader_news_declaration_cardinality_v5ap2a5yc7"() IS 'the reader of the delta of news of DeclarationCardinality';

COMMENT ON FUNCTION "qti"."__reader_olds_declaration_cardinality_pdfqtw7cnf"() IS 'the reader of the delta of olds of DeclarationCardinality';

COMMENT ON FUNCTION "qti"."__reader_olds_declaration_cardinality_2jxthqitds"() IS 'the reader of the delta of olds of DeclarationCardinality';

COMMENT ON FUNCTION "qti"."__reader_olds_declaration_cardinality_vwckoxk4qe"() IS 'the reader of the delta of olds of DeclarationCardinality';

COMMENT ON FUNCTION "qti"."__reader_news_declaration_name_j2dk7glats"() IS 'the reader of the delta of news of DeclarationName';

COMMENT ON FUNCTION "qti"."__reader_news_declaration_name_xkc3ztz7zl"() IS 'the reader of the delta of news of DeclarationName';

COMMENT ON FUNCTION "qti"."__reader_news_declaration_name_zvsbkmcezm"() IS 'the reader of the delta of news of DeclarationName';

COMMENT ON FUNCTION "qti"."__reader_news_declaration_name_g2mafjx4sv"() IS 'the reader of the delta of news of DeclarationName';

COMMENT ON FUNCTION "qti"."__reader_news_declaration_name_clrjediwpg"() IS 'the reader of the delta of news of DeclarationName';

COMMENT ON FUNCTION "qti"."__reader_news_declaration_name_gmhfmp7km2"() IS 'the reader of the delta of news of DeclarationName';

COMMENT ON FUNCTION "qti"."__reader_olds_declaration_name_xqp7y3usba"() IS 'the reader of the delta of olds of DeclarationName';

COMMENT ON FUNCTION "qti"."__reader_olds_declaration_name_jgi5n2srxh"() IS 'the reader of the delta of olds of DeclarationName';

COMMENT ON FUNCTION "qti"."__reader_olds_declaration_name_cdg3wbqkzu"() IS 'the reader of the delta of olds of DeclarationName';

COMMENT ON FUNCTION "qti"."__reader_olds_declaration_name_dn2t6dy4i6"() IS 'the reader of the delta of olds of DeclarationName';

COMMENT ON FUNCTION "qti"."__reader_olds_declaration_name_ud4c2przzq"() IS 'the reader of the delta of olds of DeclarationName';

COMMENT ON FUNCTION "qti"."__reader_olds_declaration_name_kruvrbqavz"() IS 'the reader of the delta of olds of DeclarationName';

COMMENT ON FUNCTION "qti"."__reader_olds_declaration_table_4odkx4txe2"() IS 'the reader of the delta of olds of DeclarationTable';

COMMENT ON FUNCTION "qti"."__reader_olds_declaration_table_njp2jtbsn3"() IS 'the reader of the delta of olds of DeclarationTable';

COMMENT ON FUNCTION "qti"."__reader_olds_declaration_table_qwhqwymhn3"() IS 'the reader of the delta of olds of DeclarationTable';

COMMENT ON FUNCTION "qti"."__reader_olds_declaration_table_k5frmscfry"() IS 'the reader of the delta of olds of DeclarationTable';

COMMENT ON FUNCTION "qti"."__reader_news_dependency_az7buf4vy6"() IS 'the reader of the delta of news of Dependency';

COMMENT ON FUNCTION "qti"."__reader_olds_dependency_resolved_37eefbu2al"() IS 'the reader of the delta of olds of DependencyResolved';

COMMENT ON FUNCTION "qti"."__reader_news_described_assembled_lang_lt72g4zouj"() IS 'the reader of the delta of news of DescribedAssembledLang';

COMMENT ON FUNCTION "qti"."__reader_news_described_lang_n7lm7uy3tp"() IS 'the reader of the delta of news of DescribedLang';

COMMENT ON FUNCTION "qti"."__reader_news_doctype_5pchhc2abt"() IS 'the reader of the delta of news of Doctype';

COMMENT ON FUNCTION "qti"."__reader_olds_doctype_l7hgz366tl"() IS 'the reader of the delta of olds of Doctype';

COMMENT ON FUNCTION "qti"."__reader_news_document_oqqs6wrj2s"() IS 'the reader of the delta of news of Document';

COMMENT ON FUNCTION "qti"."__reader_news_document_sqw5lqvbxy"() IS 'the reader of the delta of news of Document';

COMMENT ON FUNCTION "qti"."__reader_news_document_iw5urpoiki"() IS 'the reader of the delta of news of Document';

COMMENT ON FUNCTION "qti"."__reader_news_document_mfqvnwtyli"() IS 'the reader of the delta of news of Document';

COMMENT ON FUNCTION "qti"."__reader_news_document_4g6wjqqj3c"() IS 'the reader of the delta of news of Document';

COMMENT ON FUNCTION "qti"."__reader_news_document_ue5mwnxzpu"() IS 'the reader of the delta of news of Document';

COMMENT ON FUNCTION "qti"."__reader_news_document_pjwo3lew2y"() IS 'the reader of the delta of news of Document';

COMMENT ON FUNCTION "qti"."__reader_news_document_yfk2vdwvud"() IS 'the reader of the delta of news of Document';

COMMENT ON FUNCTION "qti"."__reader_news_document_vqmahhvuha"() IS 'the reader of the delta of news of Document';

COMMENT ON FUNCTION "qti"."__reader_news_document_iubfupxin3"() IS 'the reader of the delta of news of Document';

COMMENT ON FUNCTION "qti"."__reader_news_document_qlvwvlhdp4"() IS 'the reader of the delta of news of Document';

COMMENT ON FUNCTION "qti"."__reader_olds_document_4gnsr34rib"() IS 'the reader of the delta of olds of Document';

COMMENT ON FUNCTION "qti"."__reader_olds_document_cq6h4qmyi3"() IS 'the reader of the delta of olds of Document';

COMMENT ON FUNCTION "qti"."__reader_olds_document_43axxlnsgd"() IS 'the reader of the delta of olds of Document';

COMMENT ON FUNCTION "qti"."__reader_olds_document_rpqbbwns6w"() IS 'the reader of the delta of olds of Document';

COMMENT ON FUNCTION "qti"."__reader_olds_document_sw5cvfyysw"() IS 'the reader of the delta of olds of Document';

COMMENT ON FUNCTION "qti"."__reader_olds_document_7dvji2d76e"() IS 'the reader of the delta of olds of Document';

COMMENT ON FUNCTION "qti"."__reader_olds_document_geamnnllg5"() IS 'the reader of the delta of olds of Document';

COMMENT ON FUNCTION "qti"."__reader_olds_document_uvrnuceh3n"() IS 'the reader of the delta of olds of Document';

COMMENT ON FUNCTION "qti"."__reader_olds_document_neoapvzsks"() IS 'the reader of the delta of olds of Document';

COMMENT ON FUNCTION "qti"."__reader_olds_document_r5t4towib6"() IS 'the reader of the delta of olds of Document';

COMMENT ON FUNCTION "qti"."__reader_olds_document_tvrc4hvzdl"() IS 'the reader of the delta of olds of Document';

COMMENT ON FUNCTION "qti"."__reader_olds_document_tcqje35anp"() IS 'the reader of the delta of olds of Document';

COMMENT ON FUNCTION "qti"."__reader_olds_document_yr7ni2yecc"() IS 'the reader of the delta of olds of Document';

COMMENT ON FUNCTION "qti"."__reader_news_document_id_yq7valk4yv"() IS 'the reader of the delta of news of DocumentId';

COMMENT ON FUNCTION "qti"."__reader_news_document_id_gc45lufzvx"() IS 'the reader of the delta of news of DocumentId';

COMMENT ON FUNCTION "qti"."__reader_news_document_id_er2274gn4w"() IS 'the reader of the delta of news of DocumentId';

COMMENT ON FUNCTION "qti"."__reader_news_document_id_62ite4awwm"() IS 'the reader of the delta of news of DocumentId';

COMMENT ON FUNCTION "qti"."__reader_news_document_id_2ur6ja3vzz"() IS 'the reader of the delta of news of DocumentId';

COMMENT ON FUNCTION "qti"."__reader_news_document_id_chwlmuvb76"() IS 'the reader of the delta of news of DocumentId';

COMMENT ON FUNCTION "qti"."__reader_olds_document_id_5qeyeym73d"() IS 'the reader of the delta of olds of DocumentId';

COMMENT ON FUNCTION "qti"."__reader_olds_document_id_ibxddct2mj"() IS 'the reader of the delta of olds of DocumentId';

COMMENT ON FUNCTION "qti"."__reader_olds_document_id_lck7pxpy74"() IS 'the reader of the delta of olds of DocumentId';

COMMENT ON FUNCTION "qti"."__reader_olds_document_id_gl7nkdnrs7"() IS 'the reader of the delta of olds of DocumentId';

COMMENT ON FUNCTION "qti"."__reader_olds_element_type_ggqswhq4rw"() IS 'the reader of the delta of olds of ElementType';

COMMENT ON FUNCTION "qti"."__reader_news_entry_a443fif5aq"() IS 'the reader of the delta of news of Entry';

COMMENT ON FUNCTION "qti"."__reader_news_entry_xupdu3oimq"() IS 'the reader of the delta of news of Entry';

COMMENT ON FUNCTION "qti"."__reader_news_entry_jurvktqqw7"() IS 'the reader of the delta of news of Entry';

COMMENT ON FUNCTION "qti"."__reader_olds_entry_nyvg4np2zu"() IS 'the reader of the delta of olds of Entry';

COMMENT ON FUNCTION "qti"."__reader_olds_entry_mezmcq6ru6"() IS 'the reader of the delta of olds of Entry';

COMMENT ON FUNCTION "qti"."__reader_olds_entry_srhyf7ircq"() IS 'the reader of the delta of olds of Entry';

COMMENT ON FUNCTION "qti"."__reader_olds_entry_file_target_nppoolewwv"() IS 'the reader of the delta of olds of EntryFileTarget';

COMMENT ON FUNCTION "qti"."__reader_news_expression_pznvk4cg4q"() IS 'the reader of the delta of news of Expression';

COMMENT ON FUNCTION "qti"."__reader_news_expression_ne3cb25vae"() IS 'the reader of the delta of news of Expression';

COMMENT ON FUNCTION "qti"."__reader_news_expression_sssf6g6kji"() IS 'the reader of the delta of news of Expression';

COMMENT ON FUNCTION "qti"."__reader_olds_expression_siuzx2rm2m"() IS 'the reader of the delta of olds of Expression';

COMMENT ON FUNCTION "qti"."__reader_olds_expression_2gfrx57qbb"() IS 'the reader of the delta of olds of Expression';

COMMENT ON FUNCTION "qti"."__reader_olds_expression_2m76bxawxm"() IS 'the reader of the delta of olds of Expression';

COMMENT ON FUNCTION "qti"."__reader_olds_expression_itnt5hzl3d"() IS 'the reader of the delta of olds of Expression';

COMMENT ON FUNCTION "qti"."__reader_news_expression_attribute_c6tw3loizy"() IS 'the reader of the delta of news of ExpressionAttribute';

COMMENT ON FUNCTION "qti"."__reader_news_expression_node_fhpwursxbz"() IS 'the reader of the delta of news of ExpressionNode';

COMMENT ON FUNCTION "qti"."__reader_news_expression_node_qb7igrf5od"() IS 'the reader of the delta of news of ExpressionNode';

COMMENT ON FUNCTION "qti"."__reader_olds_expression_operand_qxprhsaq5o"() IS 'the reader of the delta of olds of ExpressionOperand';

COMMENT ON FUNCTION "qti"."__reader_olds_expression_operand_x5lbcn3vzs"() IS 'the reader of the delta of olds of ExpressionOperand';

COMMENT ON FUNCTION "qti"."__reader_news_feedback_ref_zmjqvp3uby"() IS 'the reader of the delta of news of FeedbackRef';

COMMENT ON FUNCTION "qti"."__reader_news_feedback_ref_hfgpido4pj"() IS 'the reader of the delta of news of FeedbackRef';

COMMENT ON FUNCTION "qti"."__reader_olds_feedback_ref_wzr3m7bay4"() IS 'the reader of the delta of olds of FeedbackRef';

COMMENT ON FUNCTION "qti"."__reader_news_file_rfrstyoqvn"() IS 'the reader of the delta of news of File';

COMMENT ON FUNCTION "qti"."__reader_news_file_y4uhjrtk5k"() IS 'the reader of the delta of news of File';

COMMENT ON FUNCTION "qti"."__reader_news_file_fxhwmjzh3f"() IS 'the reader of the delta of news of File';

COMMENT ON FUNCTION "qti"."__reader_news_file_wk2iq6wugl"() IS 'the reader of the delta of news of File';

COMMENT ON FUNCTION "qti"."__reader_olds_file_pq4vd2gjha"() IS 'the reader of the delta of olds of File';

COMMENT ON FUNCTION "qti"."__reader_olds_file_rsi7w2fprm"() IS 'the reader of the delta of olds of File';

COMMENT ON FUNCTION "qti"."__reader_olds_file_af5cabe5mv"() IS 'the reader of the delta of olds of File';

COMMENT ON FUNCTION "qti"."__reader_olds_file_byn3swp4xx"() IS 'the reader of the delta of olds of File';

COMMENT ON FUNCTION "qti"."__reader_news_file_outside_yrges5dqr5"() IS 'the reader of the delta of news of FileOutside';

COMMENT ON FUNCTION "qti"."__reader_news_file_outside_qbpxqtsmt6"() IS 'the reader of the delta of news of FileOutside';

COMMENT ON FUNCTION "qti"."__reader_olds_file_outside_exujufltb7"() IS 'the reader of the delta of olds of FileOutside';

COMMENT ON FUNCTION "qti"."__reader_olds_file_outside_p5b55jc6jp"() IS 'the reader of the delta of olds of FileOutside';

COMMENT ON FUNCTION "qti"."__reader_news_file_path_ehmw5bw3sl"() IS 'the reader of the delta of news of FilePath';

COMMENT ON FUNCTION "qti"."__reader_news_file_path_upftw4gkp4"() IS 'the reader of the delta of news of FilePath';

COMMENT ON FUNCTION "qti"."__reader_news_file_path_x3lpd3upln"() IS 'the reader of the delta of news of FilePath';

COMMENT ON FUNCTION "qti"."__reader_olds_file_path_5rqgv4qlat"() IS 'the reader of the delta of olds of FilePath';

COMMENT ON FUNCTION "qti"."__reader_olds_file_path_bxmmo4keu2"() IS 'the reader of the delta of olds of FilePath';

COMMENT ON FUNCTION "qti"."__reader_olds_file_path_upzxr2z322"() IS 'the reader of the delta of olds of FilePath';

COMMENT ON FUNCTION "qti"."__reader_olds_filtered_section_djlguxp3lm"() IS 'the reader of the delta of olds of FilteredSection';

COMMENT ON FUNCTION "qti"."__reader_news_forbidden_resource_type_ygwomyzmjd"() IS 'the reader of the delta of news of ForbiddenResourceType';

COMMENT ON FUNCTION "qti"."__reader_olds_forward_branch_rule_ujj46hssh3"() IS 'the reader of the delta of olds of ForwardBranchRule';

COMMENT ON FUNCTION "qti"."__reader_news_fragment_context_ref_353nzeantj"() IS 'the reader of the delta of news of FragmentContextRef';

COMMENT ON FUNCTION "qti"."__reader_news_fragment_feedback_ref_d6jsleynjd"() IS 'the reader of the delta of news of FragmentFeedbackRef';

COMMENT ON FUNCTION "qti"."__reader_news_fragment_feedback_ref_t4zos54yof"() IS 'the reader of the delta of news of FragmentFeedbackRef';

COMMENT ON FUNCTION "qti"."__reader_olds_fragment_feedback_ref_cth6vxcs4g"() IS 'the reader of the delta of olds of FragmentFeedbackRef';

COMMENT ON FUNCTION "qti"."__reader_news_fragment_printed_ref_avbhwt6qag"() IS 'the reader of the delta of news of FragmentPrintedRef';

COMMENT ON FUNCTION "qti"."__reader_news_fragment_printed_ref_w2cbejtjhr"() IS 'the reader of the delta of news of FragmentPrintedRef';

COMMENT ON FUNCTION "qti"."__reader_olds_fragment_printed_ref_7epaki6vgc"() IS 'the reader of the delta of olds of FragmentPrintedRef';

COMMENT ON FUNCTION "qti"."__reader_olds_fragment_scope_yxfeuvwwbi"() IS 'the reader of the delta of olds of FragmentScope';

COMMENT ON FUNCTION "qti"."__reader_news_fragment_template_ref_2pad5kwzmc"() IS 'the reader of the delta of news of FragmentTemplateRef';

COMMENT ON FUNCTION "qti"."__reader_news_fragment_template_ref_wknxwlgcua"() IS 'the reader of the delta of news of FragmentTemplateRef';

COMMENT ON FUNCTION "qti"."__reader_olds_fragment_template_ref_shhbnknrjx"() IS 'the reader of the delta of olds of FragmentTemplateRef';

COMMENT ON FUNCTION "qti"."__reader_olds_free_mapping_target_ph3yuiqfox"() IS 'the reader of the delta of olds of FreeMappingTarget';

COMMENT ON FUNCTION "qti"."__reader_news_head_document_we7sfsuzjx"() IS 'the reader of the delta of news of HeadDocument';

COMMENT ON FUNCTION "qti"."__reader_olds_head_document_k6in26stwo"() IS 'the reader of the delta of olds of HeadDocument';

COMMENT ON FUNCTION "qti"."__reader_news_head_qualifier_pair_umotokgiwu"() IS 'the reader of the delta of news of HeadQualifierPair';

COMMENT ON FUNCTION "qti"."__reader_news_header_token_z44it76zmn"() IS 'the reader of the delta of news of HeaderToken';

COMMENT ON FUNCTION "qti"."__reader_olds_header_token_rr2uw3oscs"() IS 'the reader of the delta of olds of HeaderToken';

COMMENT ON FUNCTION "qti"."__reader_news_hottext_us7yy65gs6"() IS 'the reader of the delta of news of Hottext';

COMMENT ON FUNCTION "qti"."__reader_news_hottext_35cbz5d5la"() IS 'the reader of the delta of news of Hottext';

COMMENT ON FUNCTION "qti"."__reader_olds_hottext_5mqwvmndrr"() IS 'the reader of the delta of olds of Hottext';

COMMENT ON FUNCTION "qti"."__reader_olds_hottext_qblkand5cv"() IS 'the reader of the delta of olds of Hottext';

COMMENT ON FUNCTION "qti"."__reader_olds_hottext_p2hhudypxu"() IS 'the reader of the delta of olds of Hottext';

COMMENT ON FUNCTION "qti"."__reader_news_hottext_node_iokfd3zxgf"() IS 'the reader of the delta of news of HottextNode';

COMMENT ON FUNCTION "qti"."__reader_news_hottext_node_al2lrdg2y6"() IS 'the reader of the delta of news of HottextNode';

COMMENT ON FUNCTION "qti"."__reader_olds_id_binding_tw3dyjhtor"() IS 'the reader of the delta of olds of IdBinding';

COMMENT ON FUNCTION "qti"."__reader_olds_id_binding_skbquq672r"() IS 'the reader of the delta of olds of IdBinding';

COMMENT ON FUNCTION "qti"."__reader_news_id_value_dja42y5xyi"() IS 'the reader of the delta of news of IdValue';

COMMENT ON FUNCTION "qti"."__reader_olds_id_value_nsfw5nt3mz"() IS 'the reader of the delta of olds of IdValue';

COMMENT ON FUNCTION "qti"."__reader_olds_id_value_qfqzlozslv"() IS 'the reader of the delta of olds of IdValue';

COMMENT ON FUNCTION "qti"."__reader_news_identity_text_6neny4n5dv"() IS 'the reader of the delta of news of IdentityText';

COMMENT ON FUNCTION "qti"."__reader_olds_identity_text_rpmrnp3njb"() IS 'the reader of the delta of olds of IdentityText';

COMMENT ON FUNCTION "qti"."__reader_news_idref_yunmxj5d2i"() IS 'the reader of the delta of news of Idref';

COMMENT ON FUNCTION "qti"."__reader_news_idref_kmq7ohytn3"() IS 'the reader of the delta of news of Idref';

COMMENT ON FUNCTION "qti"."__reader_olds_idref_wpiyqcexx3"() IS 'the reader of the delta of olds of Idref';

COMMENT ON FUNCTION "qti"."__reader_olds_idref_naccgiram7"() IS 'the reader of the delta of olds of Idref';

COMMENT ON FUNCTION "qti"."__reader_news_idref_target_asnri3icwf"() IS 'the reader of the delta of news of IdrefTarget';

COMMENT ON FUNCTION "qti"."__reader_news_inclusion_ka4uuvmthk"() IS 'the reader of the delta of news of Inclusion';

COMMENT ON FUNCTION "qti"."__reader_olds_inclusion_5wfncl2m7w"() IS 'the reader of the delta of olds of Inclusion';

COMMENT ON FUNCTION "qti"."__reader_olds_inclusion_a2vhjg572x"() IS 'the reader of the delta of olds of Inclusion';

COMMENT ON FUNCTION "qti"."__reader_news_instance_flisunzrc3"() IS 'the reader of the delta of news of Instance';

COMMENT ON FUNCTION "qti"."__reader_news_instance_srjmcijesj"() IS 'the reader of the delta of news of Instance';

COMMENT ON FUNCTION "qti"."__reader_news_instance_c7zpsyxdmx"() IS 'the reader of the delta of news of Instance';

COMMENT ON FUNCTION "qti"."__reader_news_instance_kiybjf3a6r"() IS 'the reader of the delta of news of Instance';

COMMENT ON FUNCTION "qti"."__reader_news_instance_5ivsb4xdih"() IS 'the reader of the delta of news of Instance';

COMMENT ON FUNCTION "qti"."__reader_news_instance_e75vlrnunp"() IS 'the reader of the delta of news of Instance';

COMMENT ON FUNCTION "qti"."__reader_news_instance_rlkqrdpuux"() IS 'the reader of the delta of news of Instance';

COMMENT ON FUNCTION "qti"."__reader_news_instance_3ulnatdbrz"() IS 'the reader of the delta of news of Instance';

COMMENT ON FUNCTION "qti"."__reader_news_instance_ro3loejvzk"() IS 'the reader of the delta of news of Instance';

COMMENT ON FUNCTION "qti"."__reader_news_instance_552brxua6o"() IS 'the reader of the delta of news of Instance';

COMMENT ON FUNCTION "qti"."__reader_news_instance_kxs4gslk2i"() IS 'the reader of the delta of news of Instance';

COMMENT ON FUNCTION "qti"."__reader_olds_instance_ccl2e3np2y"() IS 'the reader of the delta of olds of Instance';

COMMENT ON FUNCTION "qti"."__reader_olds_instance_srbs54wmed"() IS 'the reader of the delta of olds of Instance';

COMMENT ON FUNCTION "qti"."__reader_olds_instance_z42rxeez6y"() IS 'the reader of the delta of olds of Instance';

COMMENT ON FUNCTION "qti"."__reader_olds_instance_yweryshn7r"() IS 'the reader of the delta of olds of Instance';

COMMENT ON FUNCTION "qti"."__reader_olds_instance_uibuxi5sog"() IS 'the reader of the delta of olds of Instance';

COMMENT ON FUNCTION "qti"."__reader_olds_instance_pfjqnmj4nc"() IS 'the reader of the delta of olds of Instance';

COMMENT ON FUNCTION "qti"."__reader_olds_instance_itj3bov3uq"() IS 'the reader of the delta of olds of Instance';

COMMENT ON FUNCTION "qti"."__reader_olds_instance_mdxx66eq6p"() IS 'the reader of the delta of olds of Instance';

COMMENT ON FUNCTION "qti"."__reader_olds_instance_uyoukazqkv"() IS 'the reader of the delta of olds of Instance';

COMMENT ON FUNCTION "qti"."__reader_olds_instance_document_ch7xzdtije"() IS 'the reader of the delta of olds of InstanceDocument';

COMMENT ON FUNCTION "qti"."__reader_news_interaction_gx7ibvqubs"() IS 'the reader of the delta of news of Interaction';

COMMENT ON FUNCTION "qti"."__reader_olds_interaction_gqxuspyoca"() IS 'the reader of the delta of olds of Interaction';

COMMENT ON FUNCTION "qti"."__reader_news_interaction_attribute_so2beelrew"() IS 'the reader of the delta of news of InteractionAttribute';

COMMENT ON FUNCTION "qti"."__reader_news_interaction_attribute_t4iccyoy5p"() IS 'the reader of the delta of news of InteractionAttribute';

COMMENT ON FUNCTION "qti"."__reader_news_interaction_attribute_2g263j74bi"() IS 'the reader of the delta of news of InteractionAttribute';

COMMENT ON FUNCTION "qti"."__reader_news_interaction_attribute_lmux5xodti"() IS 'the reader of the delta of news of InteractionAttribute';

COMMENT ON FUNCTION "qti"."__reader_news_interaction_attribute_vlukshxhtz"() IS 'the reader of the delta of news of InteractionAttribute';

COMMENT ON FUNCTION "qti"."__reader_news_interaction_attribute_2gxehtrzve"() IS 'the reader of the delta of news of InteractionAttribute';

COMMENT ON FUNCTION "qti"."__reader_news_interaction_attribute_jruynaqtqh"() IS 'the reader of the delta of news of InteractionAttribute';

COMMENT ON FUNCTION "qti"."__reader_news_interaction_attribute_wszekeyngq"() IS 'the reader of the delta of news of InteractionAttribute';

COMMENT ON FUNCTION "qti"."__reader_news_interaction_attribute_av7xe5zizv"() IS 'the reader of the delta of news of InteractionAttribute';

COMMENT ON FUNCTION "qti"."__reader_news_interaction_attribute_zczxcv4tok"() IS 'the reader of the delta of news of InteractionAttribute';

COMMENT ON FUNCTION "qti"."__reader_news_interaction_attribute_lvethevtlf"() IS 'the reader of the delta of news of InteractionAttribute';

COMMENT ON FUNCTION "qti"."__reader_news_interaction_attribute_m4v5n6mg56"() IS 'the reader of the delta of news of InteractionAttribute';

COMMENT ON FUNCTION "qti"."__reader_news_interaction_attribute_5x3h2wg4tx"() IS 'the reader of the delta of news of InteractionAttribute';

COMMENT ON FUNCTION "qti"."__reader_olds_interaction_attribute_cqbopn7gwl"() IS 'the reader of the delta of olds of InteractionAttribute';

COMMENT ON FUNCTION "qti"."__reader_olds_interaction_attribute_haly37bg2r"() IS 'the reader of the delta of olds of InteractionAttribute';

COMMENT ON FUNCTION "qti"."__reader_olds_interaction_attribute_nzskbudh2o"() IS 'the reader of the delta of olds of InteractionAttribute';

COMMENT ON FUNCTION "qti"."__reader_olds_interaction_attribute_3p6cxwla3p"() IS 'the reader of the delta of olds of InteractionAttribute';

COMMENT ON FUNCTION "qti"."__reader_olds_interaction_attribute_jffvzcuyfw"() IS 'the reader of the delta of olds of InteractionAttribute';

COMMENT ON FUNCTION "qti"."__reader_olds_interaction_attribute_nwmu6qfmap"() IS 'the reader of the delta of olds of InteractionAttribute';

COMMENT ON FUNCTION "qti"."__reader_olds_interaction_attribute_7lm3i3iey6"() IS 'the reader of the delta of olds of InteractionAttribute';

COMMENT ON FUNCTION "qti"."__reader_olds_interaction_attribute_wdb7jylouh"() IS 'the reader of the delta of olds of InteractionAttribute';

COMMENT ON FUNCTION "qti"."__reader_olds_interaction_attribute_x3ni543jbu"() IS 'the reader of the delta of olds of InteractionAttribute';

COMMENT ON FUNCTION "qti"."__reader_olds_interaction_attribute_oz7vmmyayr"() IS 'the reader of the delta of olds of InteractionAttribute';

COMMENT ON FUNCTION "qti"."__reader_olds_interaction_attribute_wn35tpealf"() IS 'the reader of the delta of olds of InteractionAttribute';

COMMENT ON FUNCTION "qti"."__reader_news_interaction_node_7cyn3bcovw"() IS 'the reader of the delta of news of InteractionNode';

COMMENT ON FUNCTION "qti"."__reader_olds_interaction_node_ls5wace2wc"() IS 'the reader of the delta of olds of InteractionNode';

COMMENT ON FUNCTION "qti"."__reader_news_interpolated_lookup_a4lkvybegw"() IS 'the reader of the delta of news of InterpolatedLookup';

COMMENT ON FUNCTION "qti"."__reader_news_item_mapping_4zrwd7n2ku"() IS 'the reader of the delta of news of ItemMapping';

COMMENT ON FUNCTION "qti"."__reader_news_item_mapping_p2pesd7vzz"() IS 'the reader of the delta of news of ItemMapping';

COMMENT ON FUNCTION "qti"."__reader_news_item_ref_document_ccmwrqwpqr"() IS 'the reader of the delta of news of ItemRefDocument';

COMMENT ON FUNCTION "qti"."__reader_news_item_ref_document_pzayhgr23k"() IS 'the reader of the delta of news of ItemRefDocument';

COMMENT ON FUNCTION "qti"."__reader_news_item_ref_document_mwqz7kbbrd"() IS 'the reader of the delta of news of ItemRefDocument';

COMMENT ON FUNCTION "qti"."__reader_news_item_ref_document_73ajg6svn3"() IS 'the reader of the delta of news of ItemRefDocument';

COMMENT ON FUNCTION "qti"."__reader_olds_item_ref_document_72n5roy5fk"() IS 'the reader of the delta of olds of ItemRefDocument';

COMMENT ON FUNCTION "qti"."__reader_olds_item_ref_document_fukajwr7f2"() IS 'the reader of the delta of olds of ItemRefDocument';

COMMENT ON FUNCTION "qti"."__reader_olds_item_ref_document_qo26vnu3bw"() IS 'the reader of the delta of olds of ItemRefDocument';

COMMENT ON FUNCTION "qti"."__reader_news_item_ref_href_ovm4jgm4gk"() IS 'the reader of the delta of news of ItemRefHref';

COMMENT ON FUNCTION "qti"."__reader_news_item_ref_href_grsm5vpbaj"() IS 'the reader of the delta of news of ItemRefHref';

COMMENT ON FUNCTION "qti"."__reader_news_item_ref_href_atagsxcytp"() IS 'the reader of the delta of news of ItemRefHref';

COMMENT ON FUNCTION "qti"."__reader_news_item_ref_href_t6aban7y64"() IS 'the reader of the delta of news of ItemRefHref';

COMMENT ON FUNCTION "qti"."__reader_olds_item_ref_href_f6ecqw7cb6"() IS 'the reader of the delta of olds of ItemRefHref';

COMMENT ON FUNCTION "qti"."__reader_olds_item_ref_href_bijpszjg6a"() IS 'the reader of the delta of olds of ItemRefHref';

COMMENT ON FUNCTION "qti"."__reader_olds_item_ref_href_jvsqrfocu2"() IS 'the reader of the delta of olds of ItemRefHref';

COMMENT ON FUNCTION "qti"."__reader_olds_item_ref_table_axi7gtch2i"() IS 'the reader of the delta of olds of ItemRefTable';

COMMENT ON FUNCTION "qti"."__reader_olds_item_ref_table_dhtlbeb44g"() IS 'the reader of the delta of olds of ItemRefTable';

COMMENT ON FUNCTION "qti"."__reader_news_item_ref_target_luimohpimk"() IS 'the reader of the delta of news of ItemRefTarget';

COMMENT ON FUNCTION "qti"."__reader_olds_item_ref_target_ldoamg7imm"() IS 'the reader of the delta of olds of ItemRefTarget';

COMMENT ON FUNCTION "qti"."__reader_olds_item_scoped_reading_iiw3izlwwk"() IS 'the reader of the delta of olds of ItemScopedReading';

COMMENT ON FUNCTION "qti"."__reader_news_item_template_default_hg7ij6ru2f"() IS 'the reader of the delta of news of ItemTemplateDefault';

COMMENT ON FUNCTION "qti"."__reader_news_judged_placed_idref_ubqg4pwbg7"() IS 'the reader of the delta of news of JudgedPlacedIdref';

COMMENT ON FUNCTION "qti"."__reader_news_label_use_prastnraj5"() IS 'the reader of the delta of news of LabelUse';

COMMENT ON FUNCTION "qti"."__reader_news_label_use_6335ze55ah"() IS 'the reader of the delta of news of LabelUse';

COMMENT ON FUNCTION "qti"."__reader_olds_label_use_3wczfalajh"() IS 'the reader of the delta of olds of LabelUse';

COMMENT ON FUNCTION "qti"."__reader_news_lang_value_slgrhb6cqu"() IS 'the reader of the delta of news of LangValue';

COMMENT ON FUNCTION "qti"."__reader_news_lang_value_skz7bef7nm"() IS 'the reader of the delta of news of LangValue';

COMMENT ON FUNCTION "qti"."__reader_olds_lang_value_rckvwly6tr"() IS 'the reader of the delta of olds of LangValue';

COMMENT ON FUNCTION "qti"."__reader_olds_lang_value_wfmn2hzapy"() IS 'the reader of the delta of olds of LangValue';

COMMENT ON FUNCTION "qti"."__reader_news_least_count_mpsi5uq6jw"() IS 'the reader of the delta of news of LeastCount';

COMMENT ON FUNCTION "qti"."__reader_news_least_count_sqtpqlq7dt"() IS 'the reader of the delta of news of LeastCount';

COMMENT ON FUNCTION "qti"."__reader_olds_least_count_fuxj6nfgl2"() IS 'the reader of the delta of olds of LeastCount';

COMMENT ON FUNCTION "qti"."__reader_olds_least_count_dvwnqez3no"() IS 'the reader of the delta of olds of LeastCount';

COMMENT ON FUNCTION "qti"."__reader_news_least_count_node_7s63gggfeg"() IS 'the reader of the delta of news of LeastCountNode';

COMMENT ON FUNCTION "qti"."__reader_olds_least_count_node_fshz6ey3rv"() IS 'the reader of the delta of olds of LeastCountNode';

COMMENT ON FUNCTION "qti"."__reader_news_least_one_apply_lpgj7sybx4"() IS 'the reader of the delta of news of LeastOneApply';

COMMENT ON FUNCTION "qti"."__reader_news_least_two_apply_suoijgjw7k"() IS 'the reader of the delta of news of LeastTwoApply';

COMMENT ON FUNCTION "qti"."__reader_news_link_reading_lajw42w3bg"() IS 'the reader of the delta of news of LinkReading';

COMMENT ON FUNCTION "qti"."__reader_news_link_reading_sh6irpretf"() IS 'the reader of the delta of news of LinkReading';

COMMENT ON FUNCTION "qti"."__reader_olds_link_reading_lpjtpudll4"() IS 'the reader of the delta of olds of LinkReading';

COMMENT ON FUNCTION "qti"."__reader_olds_link_scope_3m5j6ylajt"() IS 'the reader of the delta of olds of LinkScope';

COMMENT ON FUNCTION "qti"."__reader_news_listed_identifier_xghon4cm34"() IS 'the reader of the delta of news of ListedIdentifier';

COMMENT ON FUNCTION "qti"."__reader_olds_listed_lang_ye76f43wu2"() IS 'the reader of the delta of olds of ListedLang';

COMMENT ON FUNCTION "qti"."__reader_news_listed_title_fabecj5qhn"() IS 'the reader of the delta of news of ListedTitle';

COMMENT ON FUNCTION "qti"."__reader_olds_literal_lflzs6oyje"() IS 'the reader of the delta of olds of Literal';

COMMENT ON FUNCTION "qti"."__reader_olds_literal_ckultuiywf"() IS 'the reader of the delta of olds of Literal';

COMMENT ON FUNCTION "qti"."__reader_olds_literal_typed_5dustirr5j"() IS 'the reader of the delta of olds of LiteralTyped';

COMMENT ON FUNCTION "qti"."__reader_news_located_template_g5ntgjjixx"() IS 'the reader of the delta of news of LocatedTemplate';

COMMENT ON FUNCTION "qti"."__reader_olds_located_template_xarvrhujhd"() IS 'the reader of the delta of olds of LocatedTemplate';

COMMENT ON FUNCTION "qti"."__reader_news_lookup_value_hzycbudcjb"() IS 'the reader of the delta of news of LookupValue';

COMMENT ON FUNCTION "qti"."__reader_olds_lookup_value_xbnexbmk6i"() IS 'the reader of the delta of olds of LookupValue';

COMMENT ON FUNCTION "qti"."__reader_news_map_key_ljbfnyykwx"() IS 'the reader of the delta of news of MapKey';

COMMENT ON FUNCTION "qti"."__reader_olds_map_key_icsexbtwbv"() IS 'the reader of the delta of olds of MapKey';

COMMENT ON FUNCTION "qti"."__reader_olds_mapped_response_declaration_7ma52oxpbf"() IS 'the reader of the delta of olds of MappedResponseDeclaration';

COMMENT ON FUNCTION "qti"."__reader_news_mapping_base_type_tnkh4jdipp"() IS 'the reader of the delta of news of MappingBaseType';

COMMENT ON FUNCTION "qti"."__reader_news_mastery_value_msip3mpjav"() IS 'the reader of the delta of news of MasteryValue';

COMMENT ON FUNCTION "qti"."__reader_olds_mastery_value_z2ldoqllnq"() IS 'the reader of the delta of olds of MasteryValue';

COMMENT ON FUNCTION "qti"."__reader_olds_matched_identifier_hgoswbssg3"() IS 'the reader of the delta of olds of MatchedIdentifier';

COMMENT ON FUNCTION "qti"."__reader_olds_matched_title_gmuwvzue72"() IS 'the reader of the delta of olds of MatchedTitle';

COMMENT ON FUNCTION "qti"."__reader_news_math_action_bnkm6rdtl6"() IS 'the reader of the delta of news of MathAction';

COMMENT ON FUNCTION "qti"."__reader_news_math_action_6gqvazv3cu"() IS 'the reader of the delta of news of MathAction';

COMMENT ON FUNCTION "qti"."__reader_olds_math_action_bmc3zrzamq"() IS 'the reader of the delta of olds of MathAction';

COMMENT ON FUNCTION "qti"."__reader_olds_math_action_3wehv3mrbj"() IS 'the reader of the delta of olds of MathAction';

COMMENT ON FUNCTION "qti"."__reader_olds_math_action_j2sdpx37wp"() IS 'the reader of the delta of olds of MathAction';

COMMENT ON FUNCTION "qti"."__reader_news_math_align_group_7sfqryuquf"() IS 'the reader of the delta of news of MathAlignGroup';

COMMENT ON FUNCTION "qti"."__reader_olds_math_align_group_mlpy7zpjny"() IS 'the reader of the delta of olds of MathAlignGroup';

COMMENT ON FUNCTION "qti"."__reader_news_math_align_scope_uolh2bnyj3"() IS 'the reader of the delta of news of MathAlignScope';

COMMENT ON FUNCTION "qti"."__reader_news_math_align_scope_77olat7t7g"() IS 'the reader of the delta of news of MathAlignScope';

COMMENT ON FUNCTION "qti"."__reader_news_math_align_scope_rcxp7flcxv"() IS 'the reader of the delta of news of MathAlignScope';

COMMENT ON FUNCTION "qti"."__reader_olds_math_align_scope_gzig2u3hma"() IS 'the reader of the delta of olds of MathAlignScope';

COMMENT ON FUNCTION "qti"."__reader_olds_math_align_scope_ypsu6emopd"() IS 'the reader of the delta of olds of MathAlignScope';

COMMENT ON FUNCTION "qti"."__reader_news_math_cell_ft6mnsn5ib"() IS 'the reader of the delta of news of MathCell';

COMMENT ON FUNCTION "qti"."__reader_news_math_cell_dbzdx2ppq5"() IS 'the reader of the delta of news of MathCell';

COMMENT ON FUNCTION "qti"."__reader_olds_math_cell_colfakbqt3"() IS 'the reader of the delta of olds of MathCell';

COMMENT ON FUNCTION "qti"."__reader_olds_math_cell_yvvlhwtkwu"() IS 'the reader of the delta of olds of MathCell';

COMMENT ON FUNCTION "qti"."__reader_news_math_cn_3ijyisndgu"() IS 'the reader of the delta of news of MathCn';

COMMENT ON FUNCTION "qti"."__reader_news_math_cn_xuuwurtgrh"() IS 'the reader of the delta of news of MathCn';

COMMENT ON FUNCTION "qti"."__reader_news_math_cn_5f3jxzpnvm"() IS 'the reader of the delta of news of MathCn';

COMMENT ON FUNCTION "qti"."__reader_news_math_rank_zeultwncv5"() IS 'the reader of the delta of news of MathRank';

COMMENT ON FUNCTION "qti"."__reader_news_math_rank_qokowccdyj"() IS 'the reader of the delta of news of MathRank';

COMMENT ON FUNCTION "qti"."__reader_olds_math_rank_h437b2vf6z"() IS 'the reader of the delta of olds of MathRank';

COMMENT ON FUNCTION "qti"."__reader_olds_math_rank_syqpnb5anp"() IS 'the reader of the delta of olds of MathRank';

COMMENT ON FUNCTION "qti"."__reader_news_math_rank_node_zbg6vvcgo6"() IS 'the reader of the delta of news of MathRankNode';

COMMENT ON FUNCTION "qti"."__reader_news_media_eu3egewipw"() IS 'the reader of the delta of news of Media';

COMMENT ON FUNCTION "qti"."__reader_olds_media_m3m63obrar"() IS 'the reader of the delta of olds of Media';

COMMENT ON FUNCTION "qti"."__reader_news_most_count_mhimmdll4t"() IS 'the reader of the delta of news of MostCount';

COMMENT ON FUNCTION "qti"."__reader_news_most_count_og2i5o4i7c"() IS 'the reader of the delta of news of MostCount';

COMMENT ON FUNCTION "qti"."__reader_news_most_count_gggmqbsmoj"() IS 'the reader of the delta of news of MostCount';

COMMENT ON FUNCTION "qti"."__reader_olds_most_count_xe2ckk3b4e"() IS 'the reader of the delta of olds of MostCount';

COMMENT ON FUNCTION "qti"."__reader_olds_most_count_beqafvirgg"() IS 'the reader of the delta of olds of MostCount';

COMMENT ON FUNCTION "qti"."__reader_olds_most_count_lnobw5xali"() IS 'the reader of the delta of olds of MostCount';

COMMENT ON FUNCTION "qti"."__reader_news_most_count_node_i3tnnq2iot"() IS 'the reader of the delta of news of MostCountNode';

COMMENT ON FUNCTION "qti"."__reader_olds_most_count_node_244f6dxov5"() IS 'the reader of the delta of olds of MostCountNode';

COMMENT ON FUNCTION "qti"."__reader_news_named_aqb4fmthcf"() IS 'the reader of the delta of news of Named';

COMMENT ON FUNCTION "qti"."__reader_news_named_6jryinuuwi"() IS 'the reader of the delta of news of Named';

COMMENT ON FUNCTION "qti"."__reader_news_named_dxmkirjakb"() IS 'the reader of the delta of news of Named';

COMMENT ON FUNCTION "qti"."__reader_olds_named_tearo7t22q"() IS 'the reader of the delta of olds of Named';

COMMENT ON FUNCTION "qti"."__reader_olds_named_gac5cdpsi7"() IS 'the reader of the delta of olds of Named';

COMMENT ON FUNCTION "qti"."__reader_olds_named_jais7zr6ws"() IS 'the reader of the delta of olds of Named';

COMMENT ON FUNCTION "qti"."__reader_news_named_declaration_spueizxrfb"() IS 'the reader of the delta of news of NamedDeclaration';

COMMENT ON FUNCTION "qti"."__reader_news_named_declaration_tlcatigafm"() IS 'the reader of the delta of news of NamedDeclaration';

COMMENT ON FUNCTION "qti"."__reader_news_named_declaration_nmgomthwxa"() IS 'the reader of the delta of news of NamedDeclaration';

COMMENT ON FUNCTION "qti"."__reader_olds_named_declaration_wz2kbjfcnh"() IS 'the reader of the delta of olds of NamedDeclaration';

COMMENT ON FUNCTION "qti"."__reader_olds_named_declaration_bpdbpgbi5g"() IS 'the reader of the delta of olds of NamedDeclaration';

COMMENT ON FUNCTION "qti"."__reader_olds_named_declaration_bxafvxqgrz"() IS 'the reader of the delta of olds of NamedDeclaration';

COMMENT ON FUNCTION "qti"."__reader_olds_named_declaration_pkjl7q6msg"() IS 'the reader of the delta of olds of NamedDeclaration';

COMMENT ON FUNCTION "qti"."__reader_olds_named_declaration_4matvrci35"() IS 'the reader of the delta of olds of NamedDeclaration';

COMMENT ON FUNCTION "qti"."__reader_olds_named_declaration_wngdyhnv5y"() IS 'the reader of the delta of olds of NamedDeclaration';

COMMENT ON FUNCTION "qti"."__reader_olds_named_declaration_wwogegxivu"() IS 'the reader of the delta of olds of NamedDeclaration';

COMMENT ON FUNCTION "qti"."__reader_olds_named_declaration_dce5kzceu3"() IS 'the reader of the delta of olds of NamedDeclaration';

COMMENT ON FUNCTION "qti"."__reader_olds_named_declaration_kvuiqs4z2u"() IS 'the reader of the delta of olds of NamedDeclaration';

COMMENT ON FUNCTION "qti"."__reader_olds_named_declaration_kc3qc4yh2u"() IS 'the reader of the delta of olds of NamedDeclaration';

COMMENT ON FUNCTION "qti"."__reader_news_named_item_ref_6p7nogktab"() IS 'the reader of the delta of news of NamedItemRef';

COMMENT ON FUNCTION "qti"."__reader_news_node_cq653l3qdc"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_abywhd3m4v"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_whzrgou5yz"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_wggsxuk6w3"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_bw6j25a6d4"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_k4i6n6gvjv"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_j3s7sxu5zn"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_2m62fsqdc3"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_x4g7ckxm6f"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_uy3texmpqa"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_qk4wt64euh"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_cyiifs5hyh"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_2sve566y7u"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_ozshvpy4qo"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_t2wsyw6ybt"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_fad5o7jpjs"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_cz3beaewlw"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_7hfxeeodvw"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_vwubnvxvij"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_7dw64avck5"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_llyzopjkgh"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_5egtsvsqht"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_ztpmjvzkst"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_tp7bkqos2e"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_jlygitaup4"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_ijptutkijp"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_x6af53nbpd"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_n7r3owv374"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_f5paaci2qs"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_xrzpxd7nki"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_ky6efs7yhq"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_ndgqnfnr65"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_4u5oovgaxh"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_i53ahiuofg"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_7b7yukmorq"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_dy7o7xb3pa"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_sfycxtn56f"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_7rync7cqjo"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_rt5zuwd253"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_t6362x7wwc"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_z2ik6blh2o"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_ahpw3tcn5b"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_7stkborq64"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_ejbpemxiz4"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_oav4qss75h"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_iaew3wwcnm"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_wxlbl6uyfl"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_lmlpx6mmtt"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_mwhiq7jdmb"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_ynk2o64zgk"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_v7rvwyezdi"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_ublo243ojl"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_g5upsk2iqz"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_kw67b7ejyz"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_nx75lxw4mt"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_ssvfdmxjra"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_abvohb6guf"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_76654x7k2e"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_tkv5dxz5f4"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_qki6qm7mmz"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_5gvzdwfebs"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_mjmbr3qwll"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_7w2xaowzao"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_sqmf6kfl2c"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_kbtiyhz4ed"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_svkz5cezap"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_jjzx647754"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_fna64a6xk3"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_k2as22rfds"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_z4fqianm4r"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_km7m5dae2q"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_himtfncaju"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_zzbno643pd"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_e4x64xbyls"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_5rfnujvdkt"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_yvw7zcqic5"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_ng6ki3ydvj"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_orlt7cpe2u"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_yqyhdbllkl"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_3gl2noqg7a"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_ggxjxd6k3f"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_ozquwhhbi4"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_zja2qz4q7v"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_iouunxxsag"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_usqwtdhn3f"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_dcw6nrj376"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_ncxoh52zoh"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_3otv4chkuk"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_ys3xuk6evc"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_i6rtrqwo4p"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_qvsesx3k53"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_2rnhfvbnqv"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_xqpguz5zzu"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_3ksrjsfquk"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_4bbecgandi"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_hjw6ba5na5"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_7pg6q6oszn"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_e6pqpr73yx"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_vw7556oazg"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_ihd5em5tje"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_m5kg6iby6n"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_isq62awctl"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_j4vioyvkbx"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_6gh3rkzndh"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_news_node_lzcte27bzd"() IS 'the reader of the delta of news of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_b32sziojii"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_v2z3muhvqx"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_l5dske3ffi"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_zh5c5e2avb"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_ukqvupxsxk"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_2paca4hkel"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_pjajbzjdze"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_5u576ukn4m"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_zfzhpmbo75"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_vqb5nkcny3"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_jvicbszps7"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_darzvd5tzx"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_epp4w24xrn"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_3cp3xvg3as"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_b6gkfqpmz5"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_piochvtcat"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_wfjwcv7awi"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_7ejfnjfo3p"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_wmwtgqwqit"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_gypw7gkhbf"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_rzaedhad5w"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_hejbudfte2"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_m73gzxzzmz"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_kkzmj76k56"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_jypmtsvwyr"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_pzbtxnfoqa"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_ar4xjo2uqi"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_d3jaohyu5c"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_uc33tvc2vd"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_uhl4zma6kg"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_i5esavjuwt"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_g3vekws2at"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_fpxdtwdzgm"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_sej7jmaizj"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_pboqqelywb"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_sc3kq7i5st"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_p5zjcon5yp"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_iqyperduob"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_weytndcgfv"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_vjwq2o23ye"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_raarjedwlr"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_zpfcu6oxuo"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_lzspsgxcvd"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_igrn36otg7"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_mf5to6n4uu"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_h7kmjinq4t"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_gfkb3ql5zj"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_falhbw3hl5"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_sbebexbkxl"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_mfkptayugi"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_troaiep6fo"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_kniwcsnkp7"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_45ckera6wh"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_3mkg3lplb2"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_2sfcms4nby"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_3n7lhs3uyc"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_qfdxx45wxl"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_fbko5j5znp"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_kot6jcur5t"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_s3b7pjatlu"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_rpsw5npvqc"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_7xewrdixtd"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_adrqcbhj6p"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_vgitjq4swp"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_jtjkcu6etw"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_g5obtcjq64"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_etpgmr4q5l"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_m4keog47ae"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_ec5chnybwx"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_g2jgely7ak"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_hpdc54wijg"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_5sbcucfivj"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_m225sapn33"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_6ylah77qzd"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_mwf24f4jd6"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_vsdz7s43bt"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_barzaklotx"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_zssgnca2rw"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_dsrpoqdhx7"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_qhjernhtr6"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_ija2iemrdc"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_yw6avboirx"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_ogbofgf6u3"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_agclqea6c3"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_vmhs5uvlto"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_uu52hin2mi"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_6nzej7koyi"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_ixu4zlz22c"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_eotw5wimys"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_pvmcdkhxxn"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_5hn6guvdm5"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_v3webyormp"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_dzmv5aqym6"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_owcf6y5tk6"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_shs2zumbuu"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_fwl7glllcn"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_jveiwn4qzt"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_6kgc6k2vld"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_2utmtzpfv5"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_3zolqu6qsd"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_phpmtt7ous"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_nygy3j34q5"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_itcx5dre2t"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_olds_node_hxggyy624w"() IS 'the reader of the delta of olds of Node';

COMMENT ON FUNCTION "qti"."__reader_news_normal_maximum_22x2t7nl7b"() IS 'the reader of the delta of news of NormalMaximum';

COMMENT ON FUNCTION "qti"."__reader_olds_normal_maximum_m6jbrocc2l"() IS 'the reader of the delta of olds of NormalMaximum';

COMMENT ON FUNCTION "qti"."__reader_news_normal_minimum_6mdzteub3r"() IS 'the reader of the delta of news of NormalMinimum';

COMMENT ON FUNCTION "qti"."__reader_olds_normal_minimum_w5fhl7jdir"() IS 'the reader of the delta of olds of NormalMinimum';

COMMENT ON FUNCTION "qti"."__reader_news_numbered_reading_hgkmgigdw7"() IS 'the reader of the delta of news of NumberedReading';

COMMENT ON FUNCTION "qti"."__reader_news_numbered_reading_7c42bap25l"() IS 'the reader of the delta of news of NumberedReading';

COMMENT ON FUNCTION "qti"."__reader_news_numbered_reading_zcbet72n6r"() IS 'the reader of the delta of news of NumberedReading';

COMMENT ON FUNCTION "qti"."__reader_olds_numbered_reading_a5b2c4dp5i"() IS 'the reader of the delta of olds of NumberedReading';

COMMENT ON FUNCTION "qti"."__reader_olds_numbered_reading_7q5r3bgkxb"() IS 'the reader of the delta of olds of NumberedReading';

COMMENT ON FUNCTION "qti"."__reader_olds_numbered_target_xlb4ignwbz"() IS 'the reader of the delta of olds of NumberedTarget';

COMMENT ON FUNCTION "qti"."__reader_olds_object_identifier_5hvf7rz352"() IS 'the reader of the delta of olds of ObjectIdentifier';

COMMENT ON FUNCTION "qti"."__reader_news_open_attribute_ba73qxsihu"() IS 'the reader of the delta of news of OpenAttribute';

COMMENT ON FUNCTION "qti"."__reader_news_open_element_name_ge4kp4if3y"() IS 'the reader of the delta of news of OpenElementName';

COMMENT ON FUNCTION "qti"."__reader_news_open_element_name_avzodos6sw"() IS 'the reader of the delta of news of OpenElementName';

COMMENT ON FUNCTION "qti"."__reader_olds_open_element_name_xp5x3hnogj"() IS 'the reader of the delta of olds of OpenElementName';

COMMENT ON FUNCTION "qti"."__reader_olds_open_element_name_cg4l3lnv5k"() IS 'the reader of the delta of olds of OpenElementName';

COMMENT ON FUNCTION "qti"."__reader_olds_open_element_name_pu4n4nnhip"() IS 'the reader of the delta of olds of OpenElementName';

COMMENT ON FUNCTION "qti"."__reader_news_open_element_type_ppst3byehe"() IS 'the reader of the delta of news of OpenElementType';

COMMENT ON FUNCTION "qti"."__reader_news_open_element_type_i7s5bo4j4y"() IS 'the reader of the delta of news of OpenElementType';

COMMENT ON FUNCTION "qti"."__reader_olds_open_element_type_qk3ovvnqea"() IS 'the reader of the delta of olds of OpenElementType';

COMMENT ON FUNCTION "qti"."__reader_olds_open_element_type_dijtaifiwv"() IS 'the reader of the delta of olds of OpenElementType';

COMMENT ON FUNCTION "qti"."__reader_news_open_name_node_db7727khm3"() IS 'the reader of the delta of news of OpenNameNode';

COMMENT ON FUNCTION "qti"."__reader_olds_operand_of_rg4dzx36kj"() IS 'the reader of the delta of olds of OperandOf';

COMMENT ON FUNCTION "qti"."__reader_olds_operand_of_5vh47zbrxy"() IS 'the reader of the delta of olds of OperandOf';

COMMENT ON FUNCTION "qti"."__reader_olds_operand_of_o4zktleb52"() IS 'the reader of the delta of olds of OperandOf';

COMMENT ON FUNCTION "qti"."__reader_olds_operand_of_f4gtr2iuqi"() IS 'the reader of the delta of olds of OperandOf';

COMMENT ON FUNCTION "qti"."__reader_olds_operand_of_rsvbk5wee5"() IS 'the reader of the delta of olds of OperandOf';

COMMENT ON FUNCTION "qti"."__reader_olds_other_vocabulary_type_wzr43fynzi"() IS 'the reader of the delta of olds of OtherVocabularyType';

COMMENT ON FUNCTION "qti"."__reader_news_packaged_template_default_bnt6katr2c"() IS 'the reader of the delta of news of PackagedTemplateDefault';

COMMENT ON FUNCTION "qti"."__reader_news_pci_module_form_fz3pkzco3c"() IS 'the reader of the delta of news of PciModuleForm';

COMMENT ON FUNCTION "qti"."__reader_news_pci_module_form_x45fwsylzt"() IS 'the reader of the delta of news of PciModuleForm';

COMMENT ON FUNCTION "qti"."__reader_olds_pci_module_form_jvjll2yozw"() IS 'the reader of the delta of olds of PciModuleForm';

COMMENT ON FUNCTION "qti"."__reader_olds_pci_module_form_aybvonkfdf"() IS 'the reader of the delta of olds of PciModuleForm';

COMMENT ON FUNCTION "qti"."__reader_news_pi_ghhk7lqsqt"() IS 'the reader of the delta of news of Pi';

COMMENT ON FUNCTION "qti"."__reader_olds_pi_wwqc6drhs6"() IS 'the reader of the delta of olds of Pi';

COMMENT ON FUNCTION "qti"."__reader_news_placed_binding_cbkmdzpuzu"() IS 'the reader of the delta of news of PlacedBinding';

COMMENT ON FUNCTION "qti"."__reader_news_placed_binding_bbebqhvzn7"() IS 'the reader of the delta of news of PlacedBinding';

COMMENT ON FUNCTION "qti"."__reader_news_placed_binding_gmvcfati6i"() IS 'the reader of the delta of news of PlacedBinding';

COMMENT ON FUNCTION "qti"."__reader_news_placed_binding_brcjchxamp"() IS 'the reader of the delta of news of PlacedBinding';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_binding_xevqcx25vs"() IS 'the reader of the delta of olds of PlacedBinding';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_binding_tyoixb57sn"() IS 'the reader of the delta of olds of PlacedBinding';

COMMENT ON FUNCTION "qti"."__reader_news_placed_binding_base_type_node_hih43nujwr"() IS 'the reader of the delta of news of PlacedBindingBaseTypeNode';

COMMENT ON FUNCTION "qti"."__reader_news_placed_binding_cardinality_node_rl4b3oivqi"() IS 'the reader of the delta of news of PlacedBindingCardinalityNode';

COMMENT ON FUNCTION "qti"."__reader_news_placed_binding_cardinality_node_tqkkvcevtk"() IS 'the reader of the delta of news of PlacedBindingCardinalityNode';

COMMENT ON FUNCTION "qti"."__reader_news_placed_choice_s3krvudyij"() IS 'the reader of the delta of news of PlacedChoice';

COMMENT ON FUNCTION "qti"."__reader_news_placed_choice_mh3kfpnjc3"() IS 'the reader of the delta of news of PlacedChoice';

COMMENT ON FUNCTION "qti"."__reader_news_placed_choice_akv33cywq7"() IS 'the reader of the delta of news of PlacedChoice';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_choice_oe2wdr5trh"() IS 'the reader of the delta of olds of PlacedChoice';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_choice_jcwpo2a3db"() IS 'the reader of the delta of olds of PlacedChoice';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_choice_cr2nfva4qr"() IS 'the reader of the delta of olds of PlacedChoice';

COMMENT ON FUNCTION "qti"."__reader_news_placed_choice_or_hottext_3bi5ftlj57"() IS 'the reader of the delta of news of PlacedChoiceOrHottext';

COMMENT ON FUNCTION "qti"."__reader_news_placed_expression_srfdat2ibl"() IS 'the reader of the delta of news of PlacedExpression';

COMMENT ON FUNCTION "qti"."__reader_news_placed_expression_a57gqss5iz"() IS 'the reader of the delta of news of PlacedExpression';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_expression_cujdo5qtdt"() IS 'the reader of the delta of olds of PlacedExpression';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_expression_apvsuuxage"() IS 'the reader of the delta of olds of PlacedExpression';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_expression_tgp7rb2nhd"() IS 'the reader of the delta of olds of PlacedExpression';

COMMENT ON FUNCTION "qti"."__reader_news_placed_expression_node_ldk2kekr3g"() IS 'the reader of the delta of news of PlacedExpressionNode';

COMMENT ON FUNCTION "qti"."__reader_news_placed_expression_node_cltzqnewaw"() IS 'the reader of the delta of news of PlacedExpressionNode';

COMMENT ON FUNCTION "qti"."__reader_news_placed_expression_node_xrioyrlyjb"() IS 'the reader of the delta of news of PlacedExpressionNode';

COMMENT ON FUNCTION "qti"."__reader_news_placed_expression_node_yfhd2xhur3"() IS 'the reader of the delta of news of PlacedExpressionNode';

COMMENT ON FUNCTION "qti"."__reader_news_placed_expression_node_64ys5dwqne"() IS 'the reader of the delta of news of PlacedExpressionNode';

COMMENT ON FUNCTION "qti"."__reader_news_placed_expression_node_lzdbt5rccb"() IS 'the reader of the delta of news of PlacedExpressionNode';

COMMENT ON FUNCTION "qti"."__reader_news_placed_expression_node_f5n6ttwaem"() IS 'the reader of the delta of news of PlacedExpressionNode';

COMMENT ON FUNCTION "qti"."__reader_news_placed_expression_node_7lq25inhtp"() IS 'the reader of the delta of news of PlacedExpressionNode';

COMMENT ON FUNCTION "qti"."__reader_news_placed_expression_node_tudihwzafy"() IS 'the reader of the delta of news of PlacedExpressionNode';

COMMENT ON FUNCTION "qti"."__reader_news_placed_expression_node_y6ttraj2ek"() IS 'the reader of the delta of news of PlacedExpressionNode';

COMMENT ON FUNCTION "qti"."__reader_news_placed_expression_node_hqepfzrqq5"() IS 'the reader of the delta of news of PlacedExpressionNode';

COMMENT ON FUNCTION "qti"."__reader_news_placed_expression_site_z24qa7lqrq"() IS 'the reader of the delta of news of PlacedExpressionSite';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_expression_site_47akj4ppis"() IS 'the reader of the delta of olds of PlacedExpressionSite';

COMMENT ON FUNCTION "qti"."__reader_news_placed_filter_i73htddndz"() IS 'the reader of the delta of news of PlacedFilter';

COMMENT ON FUNCTION "qti"."__reader_news_placed_hottext_2zcigcej72"() IS 'the reader of the delta of news of PlacedHottext';

COMMENT ON FUNCTION "qti"."__reader_news_placed_hottext_q47ykuawjd"() IS 'the reader of the delta of news of PlacedHottext';

COMMENT ON FUNCTION "qti"."__reader_news_placed_hottext_r2brhh2rzy"() IS 'the reader of the delta of news of PlacedHottext';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_hottext_fpidtr3tgi"() IS 'the reader of the delta of olds of PlacedHottext';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_hottext_u3gvjf5ssk"() IS 'the reader of the delta of olds of PlacedHottext';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_hottext_r77g4omivb"() IS 'the reader of the delta of olds of PlacedHottext';

COMMENT ON FUNCTION "qti"."__reader_news_placed_id_os35gsehgf"() IS 'the reader of the delta of news of PlacedId';

COMMENT ON FUNCTION "qti"."__reader_news_placed_id_ju76abzp7s"() IS 'the reader of the delta of news of PlacedId';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_id_rw7mj37dqq"() IS 'the reader of the delta of olds of PlacedId';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_id_3gwbgpvdvp"() IS 'the reader of the delta of olds of PlacedId';

COMMENT ON FUNCTION "qti"."__reader_news_placed_idref_xmx66u7mpu"() IS 'the reader of the delta of news of PlacedIdref';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_idref_5um65m5jtr"() IS 'the reader of the delta of olds of PlacedIdref';

COMMENT ON FUNCTION "qti"."__reader_news_placed_include_path_6hiq5m2l4a"() IS 'the reader of the delta of news of PlacedIncludePath';

COMMENT ON FUNCTION "qti"."__reader_news_placed_math_rank_lrtstacbsa"() IS 'the reader of the delta of news of PlacedMathRank';

COMMENT ON FUNCTION "qti"."__reader_news_placed_math_rank_xwlvptxopa"() IS 'the reader of the delta of news of PlacedMathRank';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_math_rank_jzf5rqksha"() IS 'the reader of the delta of olds of PlacedMathRank';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_math_rank_c5mabdckit"() IS 'the reader of the delta of olds of PlacedMathRank';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_math_rank_r7c5a3onxk"() IS 'the reader of the delta of olds of PlacedMathRank';

COMMENT ON FUNCTION "qti"."__reader_news_placed_math_rank_node_yeejiiqgf7"() IS 'the reader of the delta of news of PlacedMathRankNode';

COMMENT ON FUNCTION "qti"."__reader_news_placed_reference_u7wu3u6oyn"() IS 'the reader of the delta of news of PlacedReference';

COMMENT ON FUNCTION "qti"."__reader_news_placed_reference_site_7l4j77hn7z"() IS 'the reader of the delta of news of PlacedReferenceSite';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_reference_site_luqjjmhnqw"() IS 'the reader of the delta of olds of PlacedReferenceSite';

COMMENT ON FUNCTION "qti"."__reader_news_placed_share_target_nvfqrky72x"() IS 'the reader of the delta of news of PlacedShareTarget';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_share_target_izxyljymys"() IS 'the reader of the delta of olds of PlacedShareTarget';

COMMENT ON FUNCTION "qti"."__reader_news_placed_test_reference_3kkukde4nu"() IS 'the reader of the delta of news of PlacedTestReference';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_test_reference_py5py2ydoz"() IS 'the reader of the delta of olds of PlacedTestReference';

COMMENT ON FUNCTION "qti"."__reader_news_placed_variable_declaration_bbov5lc6gr"() IS 'the reader of the delta of news of PlacedVariableDeclaration';

COMMENT ON FUNCTION "qti"."__reader_news_placed_variable_ref_qqevimbale"() IS 'the reader of the delta of news of PlacedVariableRef';

COMMENT ON FUNCTION "qti"."__reader_news_placed_variable_ref_3ymxujg3y4"() IS 'the reader of the delta of news of PlacedVariableRef';

COMMENT ON FUNCTION "qti"."__reader_news_placed_variable_ref_vr3dig257x"() IS 'the reader of the delta of news of PlacedVariableRef';

COMMENT ON FUNCTION "qti"."__reader_news_placed_variable_ref_fdknsqiqji"() IS 'the reader of the delta of news of PlacedVariableRef';

COMMENT ON FUNCTION "qti"."__reader_news_placed_variable_ref_gyifatje4o"() IS 'the reader of the delta of news of PlacedVariableRef';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_variable_ref_rgam54r57k"() IS 'the reader of the delta of olds of PlacedVariableRef';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_variable_ref_j2brw7bijr"() IS 'the reader of the delta of olds of PlacedVariableRef';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_variable_ref_filospbkut"() IS 'the reader of the delta of olds of PlacedVariableRef';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_variable_ref_55frmldrlu"() IS 'the reader of the delta of olds of PlacedVariableRef';

COMMENT ON FUNCTION "qti"."__reader_news_placed_variable_ref_declaration_iu65g46a2h"() IS 'the reader of the delta of news of PlacedVariableRefDeclaration';

COMMENT ON FUNCTION "qti"."__reader_news_placed_variable_ref_declaration_f6ylnq4rzb"() IS 'the reader of the delta of news of PlacedVariableRefDeclaration';

COMMENT ON FUNCTION "qti"."__reader_news_placed_variable_ref_declaration_qgiw7butt7"() IS 'the reader of the delta of news of PlacedVariableRefDeclaration';

COMMENT ON FUNCTION "qti"."__reader_news_placed_variable_ref_declaration_obw4vfma7s"() IS 'the reader of the delta of news of PlacedVariableRefDeclaration';

COMMENT ON FUNCTION "qti"."__reader_news_placed_variable_ref_node_wlswuhj6tw"() IS 'the reader of the delta of news of PlacedVariableRefNode';

COMMENT ON FUNCTION "qti"."__reader_news_placed_variable_ref_node_33etbaeekb"() IS 'the reader of the delta of news of PlacedVariableRefNode';

COMMENT ON FUNCTION "qti"."__reader_news_placed_variable_ref_node_dctnvrm2mu"() IS 'the reader of the delta of news of PlacedVariableRefNode';

COMMENT ON FUNCTION "qti"."__reader_news_placed_variable_ref_node_johqkeft66"() IS 'the reader of the delta of news of PlacedVariableRefNode';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_variable_ref_node_65iu2mmqh6"() IS 'the reader of the delta of olds of PlacedVariableRefNode';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_variable_ref_node_4n7vvbbf5p"() IS 'the reader of the delta of olds of PlacedVariableRefNode';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_variable_ref_node_nmhr7lyrfy"() IS 'the reader of the delta of olds of PlacedVariableRefNode';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_variable_ref_node_3npiyy4vej"() IS 'the reader of the delta of olds of PlacedVariableRefNode';

COMMENT ON FUNCTION "qti"."__reader_news_placed_weighted_variable_7e4xdpeugp"() IS 'the reader of the delta of news of PlacedWeightedVariable';

COMMENT ON FUNCTION "qti"."__reader_news_prefixed_declaration_xy4x6ikmhj"() IS 'the reader of the delta of news of PrefixedDeclaration';

COMMENT ON FUNCTION "qti"."__reader_news_prefixed_map_response_tablorb45s"() IS 'the reader of the delta of news of PrefixedMapResponse';

COMMENT ON FUNCTION "qti"."__reader_news_prefixed_map_response_point_j6ybykwkph"() IS 'the reader of the delta of news of PrefixedMapResponsePoint';

COMMENT ON FUNCTION "qti"."__reader_news_printed_variable_ref_kcz55n3qtc"() IS 'the reader of the delta of news of PrintedVariableRef';

COMMENT ON FUNCTION "qti"."__reader_news_printed_variable_ref_wqp2jc4qpz"() IS 'the reader of the delta of news of PrintedVariableRef';

COMMENT ON FUNCTION "qti"."__reader_olds_printed_variable_ref_wg22r2nz4m"() IS 'the reader of the delta of olds of PrintedVariableRef';

COMMENT ON FUNCTION "qti"."__reader_news_processing_fluve2mvj4"() IS 'the reader of the delta of news of Processing';

COMMENT ON FUNCTION "qti"."__reader_olds_processing_otxddmetvj"() IS 'the reader of the delta of olds of Processing';

COMMENT ON FUNCTION "qti"."__reader_olds_processing_6eijuspckr"() IS 'the reader of the delta of olds of Processing';

COMMENT ON FUNCTION "qti"."__reader_news_processing_node_4crh4vly62"() IS 'the reader of the delta of news of ProcessingNode';

COMMENT ON FUNCTION "qti"."__reader_news_read_include_bh7vrqpt35"() IS 'the reader of the delta of news of ReadInclude';

COMMENT ON FUNCTION "qti"."__reader_olds_read_include_dniscy4udn"() IS 'the reader of the delta of olds of ReadInclude';

COMMENT ON FUNCTION "qti"."__reader_news_record_node_ibqexbavlz"() IS 'the reader of the delta of news of RecordNode';

COMMENT ON FUNCTION "qti"."__reader_news_record_node_flaxozd6gz"() IS 'the reader of the delta of news of RecordNode';

COMMENT ON FUNCTION "qti"."__reader_news_record_node_pus2c2565h"() IS 'the reader of the delta of news of RecordNode';

COMMENT ON FUNCTION "qti"."__reader_news_record_node_hymtqgdlrj"() IS 'the reader of the delta of news of RecordNode';

COMMENT ON FUNCTION "qti"."__reader_olds_record_node_euoikgai7u"() IS 'the reader of the delta of olds of RecordNode';

COMMENT ON FUNCTION "qti"."__reader_olds_record_node_gje3ebqna4"() IS 'the reader of the delta of olds of RecordNode';

COMMENT ON FUNCTION "qti"."__reader_olds_record_node_qfwmhfjs4m"() IS 'the reader of the delta of olds of RecordNode';

COMMENT ON FUNCTION "qti"."__reader_olds_record_node_pdjnkrawfn"() IS 'the reader of the delta of olds of RecordNode';

COMMENT ON FUNCTION "qti"."__reader_news_record_set_value_pqo3c27yp3"() IS 'the reader of the delta of news of RecordSetValue';

COMMENT ON FUNCTION "qti"."__reader_olds_referable_name_esvtjsfp2i"() IS 'the reader of the delta of olds of ReferableName';

COMMENT ON FUNCTION "qti"."__reader_news_reference_t5dzqbigfi"() IS 'the reader of the delta of news of Reference';

COMMENT ON FUNCTION "qti"."__reader_news_reference_7insf7ussh"() IS 'the reader of the delta of news of Reference';

COMMENT ON FUNCTION "qti"."__reader_news_reference_fodbyyurrr"() IS 'the reader of the delta of news of Reference';

COMMENT ON FUNCTION "qti"."__reader_news_reference_vlur6dugvh"() IS 'the reader of the delta of news of Reference';

COMMENT ON FUNCTION "qti"."__reader_olds_reference_la3be344nl"() IS 'the reader of the delta of olds of Reference';

COMMENT ON FUNCTION "qti"."__reader_olds_reference_y34gersids"() IS 'the reader of the delta of olds of Reference';

COMMENT ON FUNCTION "qti"."__reader_olds_reference_46itsmnh6r"() IS 'the reader of the delta of olds of Reference';

COMMENT ON FUNCTION "qti"."__reader_olds_reference_bch3rsnev2"() IS 'the reader of the delta of olds of Reference';

COMMENT ON FUNCTION "qti"."__reader_news_reference_path_gbvd3dljoh"() IS 'the reader of the delta of news of ReferencePath';

COMMENT ON FUNCTION "qti"."__reader_news_reference_path_pitpw2birl"() IS 'the reader of the delta of news of ReferencePath';

COMMENT ON FUNCTION "qti"."__reader_news_reference_path_x4ecs3yrte"() IS 'the reader of the delta of news of ReferencePath';

COMMENT ON FUNCTION "qti"."__reader_olds_reference_path_3zpdounqz6"() IS 'the reader of the delta of olds of ReferencePath';

COMMENT ON FUNCTION "qti"."__reader_olds_reference_path_k7yu6ovvlb"() IS 'the reader of the delta of olds of ReferencePath';

COMMENT ON FUNCTION "qti"."__reader_olds_reference_path_pbj3fzepd6"() IS 'the reader of the delta of olds of ReferencePath';

COMMENT ON FUNCTION "qti"."__reader_news_required_parts_falnszebh7"() IS 'the reader of the delta of news of RequiredParts';

COMMENT ON FUNCTION "qti"."__reader_news_required_ssml_property_qlbzknwa3n"() IS 'the reader of the delta of news of RequiredSsmlProperty';

COMMENT ON FUNCTION "qti"."__reader_olds_requirement_met_65zlmk2nff"() IS 'the reader of the delta of olds of RequirementMet';

COMMENT ON FUNCTION "qti"."__reader_news_resolved_branch_rule_gdbas2f3d2"() IS 'the reader of the delta of news of ResolvedBranchRule';

COMMENT ON FUNCTION "qti"."__reader_olds_resolved_branch_rule_2k4pvtxsha"() IS 'the reader of the delta of olds of ResolvedBranchRule';

COMMENT ON FUNCTION "qti"."__reader_news_resource_document_7ihkarm2qh"() IS 'the reader of the delta of news of ResourceDocument';

COMMENT ON FUNCTION "qti"."__reader_olds_resource_document_xnedad2jev"() IS 'the reader of the delta of olds of ResourceDocument';

COMMENT ON FUNCTION "qti"."__reader_olds_resource_document_gsetht2stg"() IS 'the reader of the delta of olds of ResourceDocument';

COMMENT ON FUNCTION "qti"."__reader_olds_resource_file_document_nybjxdjnew"() IS 'the reader of the delta of olds of ResourceFileDocument';

COMMENT ON FUNCTION "qti"."__reader_olds_resource_file_outside_24boshu4fp"() IS 'the reader of the delta of olds of ResourceFileOutside';

COMMENT ON FUNCTION "qti"."__reader_olds_resource_file_path_ghqtbvn7fi"() IS 'the reader of the delta of olds of ResourceFilePath';

COMMENT ON FUNCTION "qti"."__reader_news_resource_href_haywzpiqg4"() IS 'the reader of the delta of news of ResourceHref';

COMMENT ON FUNCTION "qti"."__reader_news_resource_href_ydxsf6qtmk"() IS 'the reader of the delta of news of ResourceHref';

COMMENT ON FUNCTION "qti"."__reader_news_resource_href_tapiw2dhnw"() IS 'the reader of the delta of news of ResourceHref';

COMMENT ON FUNCTION "qti"."__reader_news_resource_href_agkrctu67z"() IS 'the reader of the delta of news of ResourceHref';

COMMENT ON FUNCTION "qti"."__reader_olds_resource_href_sv4jnoltin"() IS 'the reader of the delta of olds of ResourceHref';

COMMENT ON FUNCTION "qti"."__reader_olds_resource_href_sd5eyruged"() IS 'the reader of the delta of olds of ResourceHref';

COMMENT ON FUNCTION "qti"."__reader_olds_resource_href_mxu2vidbqc"() IS 'the reader of the delta of olds of ResourceHref';

COMMENT ON FUNCTION "qti"."__reader_news_resource_href_outside_fnx5br2ycc"() IS 'the reader of the delta of news of ResourceHrefOutside';

COMMENT ON FUNCTION "qti"."__reader_olds_resource_href_outside_mm36q3eybl"() IS 'the reader of the delta of olds of ResourceHrefOutside';

COMMENT ON FUNCTION "qti"."__reader_news_resource_href_path_mwdbwavcar"() IS 'the reader of the delta of news of ResourceHrefPath';

COMMENT ON FUNCTION "qti"."__reader_news_resource_href_path_acuf7aruvg"() IS 'the reader of the delta of news of ResourceHrefPath';

COMMENT ON FUNCTION "qti"."__reader_olds_resource_href_path_esb6sirukr"() IS 'the reader of the delta of olds of ResourceHrefPath';

COMMENT ON FUNCTION "qti"."__reader_olds_resource_href_path_awuuwr4su7"() IS 'the reader of the delta of olds of ResourceHrefPath';

COMMENT ON FUNCTION "qti"."__reader_news_scope_node_irhe3bn4ga"() IS 'the reader of the delta of news of ScopeNode';

COMMENT ON FUNCTION "qti"."__reader_news_scope_node_ryfnswvej5"() IS 'the reader of the delta of news of ScopeNode';

COMMENT ON FUNCTION "qti"."__reader_news_scope_node_7a4vqm5o7b"() IS 'the reader of the delta of news of ScopeNode';

COMMENT ON FUNCTION "qti"."__reader_news_scope_node_af46whp27p"() IS 'the reader of the delta of news of ScopeNode';

COMMENT ON FUNCTION "qti"."__reader_olds_scope_node_old72uq6qa"() IS 'the reader of the delta of olds of ScopeNode';

COMMENT ON FUNCTION "qti"."__reader_olds_scope_node_hqjnmbkph4"() IS 'the reader of the delta of olds of ScopeNode';

COMMENT ON FUNCTION "qti"."__reader_olds_scoped_dir_6jc3zqedel"() IS 'the reader of the delta of olds of ScopedDir';

COMMENT ON FUNCTION "qti"."__reader_news_selection_without_replacement_pcz4x2zma4"() IS 'the reader of the delta of news of SelectionWithoutReplacement';

COMMENT ON FUNCTION "qti"."__reader_news_share_fragment_56yidru6mm"() IS 'the reader of the delta of news of ShareFragment';

COMMENT ON FUNCTION "qti"."__reader_news_share_fragment_ifw4haq7nj"() IS 'the reader of the delta of news of ShareFragment';

COMMENT ON FUNCTION "qti"."__reader_news_share_fragment_xyyq6i3j4h"() IS 'the reader of the delta of news of ShareFragment';

COMMENT ON FUNCTION "qti"."__reader_olds_share_fragment_yhh5vcgao4"() IS 'the reader of the delta of olds of ShareFragment';

COMMENT ON FUNCTION "qti"."__reader_olds_share_fragment_w2uey7tofj"() IS 'the reader of the delta of olds of ShareFragment';

COMMENT ON FUNCTION "qti"."__reader_news_share_source_irhmx7xpll"() IS 'the reader of the delta of news of ShareSource';

COMMENT ON FUNCTION "qti"."__reader_olds_share_source_ajcejoghog"() IS 'the reader of the delta of olds of ShareSource';

COMMENT ON FUNCTION "qti"."__reader_news_share_target_4n7kdex7hi"() IS 'the reader of the delta of news of ShareTarget';

COMMENT ON FUNCTION "qti"."__reader_news_share_target_5i2vfc22da"() IS 'the reader of the delta of news of ShareTarget';

COMMENT ON FUNCTION "qti"."__reader_olds_share_target_hu7fqzwhvn"() IS 'the reader of the delta of olds of ShareTarget';

COMMENT ON FUNCTION "qti"."__reader_olds_share_target_fks64sclh6"() IS 'the reader of the delta of olds of ShareTarget';

COMMENT ON FUNCTION "qti"."__reader_news_site_i5h6hbx3ed"() IS 'the reader of the delta of news of Site';

COMMENT ON FUNCTION "qti"."__reader_news_site_7hjibimfvd"() IS 'the reader of the delta of news of Site';

COMMENT ON FUNCTION "qti"."__reader_news_site_7gl3k5p2vm"() IS 'the reader of the delta of news of Site';

COMMENT ON FUNCTION "qti"."__reader_news_site_3gfr3pauz2"() IS 'the reader of the delta of news of Site';

COMMENT ON FUNCTION "qti"."__reader_news_site_eijdqx4tvs"() IS 'the reader of the delta of news of Site';

COMMENT ON FUNCTION "qti"."__reader_news_site_4jui5i4yee"() IS 'the reader of the delta of news of Site';

COMMENT ON FUNCTION "qti"."__reader_olds_site_jwgahyglmn"() IS 'the reader of the delta of olds of Site';

COMMENT ON FUNCTION "qti"."__reader_olds_site_75pvcn6ssn"() IS 'the reader of the delta of olds of Site';

COMMENT ON FUNCTION "qti"."__reader_olds_site_nria4qfeoq"() IS 'the reader of the delta of olds of Site';

COMMENT ON FUNCTION "qti"."__reader_news_site_path_i24dxbeoka"() IS 'the reader of the delta of news of SitePath';

COMMENT ON FUNCTION "qti"."__reader_news_site_path_4mm7hz77iv"() IS 'the reader of the delta of news of SitePath';

COMMENT ON FUNCTION "qti"."__reader_news_site_path_t2ayhjcryd"() IS 'the reader of the delta of news of SitePath';

COMMENT ON FUNCTION "qti"."__reader_news_site_path_haxxaciwsg"() IS 'the reader of the delta of news of SitePath';

COMMENT ON FUNCTION "qti"."__reader_olds_site_path_a5quvnj5bc"() IS 'the reader of the delta of olds of SitePath';

COMMENT ON FUNCTION "qti"."__reader_olds_site_path_mns7z7atuf"() IS 'the reader of the delta of olds of SitePath';

COMMENT ON FUNCTION "qti"."__reader_news_site_target_t4xc4wtwyi"() IS 'the reader of the delta of news of SiteTarget';

COMMENT ON FUNCTION "qti"."__reader_news_site_target_abuhk23wlr"() IS 'the reader of the delta of news of SiteTarget';

COMMENT ON FUNCTION "qti"."__reader_news_site_target_wflwxbgngi"() IS 'the reader of the delta of news of SiteTarget';

COMMENT ON FUNCTION "qti"."__reader_news_site_target_7y5suixbk3"() IS 'the reader of the delta of news of SiteTarget';

COMMENT ON FUNCTION "qti"."__reader_olds_site_target_3pxc4yaqms"() IS 'the reader of the delta of olds of SiteTarget';

COMMENT ON FUNCTION "qti"."__reader_olds_site_target_raqpov2uza"() IS 'the reader of the delta of olds of SiteTarget';

COMMENT ON FUNCTION "qti"."__reader_olds_site_target_gfafsjxlsp"() IS 'the reader of the delta of olds of SiteTarget';

COMMENT ON FUNCTION "qti"."__reader_olds_site_target_3a5grs7oaq"() IS 'the reader of the delta of olds of SiteTarget';

COMMENT ON FUNCTION "qti"."__reader_olds_site_target_ofxl3ntqsa"() IS 'the reader of the delta of olds of SiteTarget';

COMMENT ON FUNCTION "qti"."__reader_news_sole_reading_li2facvtbt"() IS 'the reader of the delta of news of SoleReading';

COMMENT ON FUNCTION "qti"."__reader_olds_sole_reading_3jxgws4tyl"() IS 'the reader of the delta of olds of SoleReading';

COMMENT ON FUNCTION "qti"."__reader_news_srcset_kwiwd4n2c4"() IS 'the reader of the delta of news of Srcset';

COMMENT ON FUNCTION "qti"."__reader_olds_srcset_sbuebqr2gj"() IS 'the reader of the delta of olds of Srcset';

COMMENT ON FUNCTION "qti"."__reader_news_srcset_candidate_zwh2xed6rs"() IS 'the reader of the delta of news of SrcsetCandidate';

COMMENT ON FUNCTION "qti"."__reader_olds_srcset_candidate_vr7rwn4uh3"() IS 'the reader of the delta of olds of SrcsetCandidate';

COMMENT ON FUNCTION "qti"."__reader_news_ssml_scope_szhe73wqyn"() IS 'the reader of the delta of news of SsmlScope';

COMMENT ON FUNCTION "qti"."__reader_olds_ssml_scope_g6fusewq7a"() IS 'the reader of the delta of olds of SsmlScope';

COMMENT ON FUNCTION "qti"."__reader_olds_ssml_scope_3mzynpnuje"() IS 'the reader of the delta of olds of SsmlScope';

COMMENT ON FUNCTION "qti"."__reader_news_ssml_scope_node_umxffcs5ki"() IS 'the reader of the delta of news of SsmlScopeNode';

COMMENT ON FUNCTION "qti"."__reader_news_ssml_value_daqtwk777q"() IS 'the reader of the delta of news of SsmlValue';

COMMENT ON FUNCTION "qti"."__reader_news_ssml_value_f3uv556skh"() IS 'the reader of the delta of news of SsmlValue';

COMMENT ON FUNCTION "qti"."__reader_news_ssml_value_kbiwkps7ox"() IS 'the reader of the delta of news of SsmlValue';

COMMENT ON FUNCTION "qti"."__reader_olds_ssml_value_lzwj6h7hyz"() IS 'the reader of the delta of olds of SsmlValue';

COMMENT ON FUNCTION "qti"."__reader_olds_ssml_value_r4gnt2qmtq"() IS 'the reader of the delta of olds of SsmlValue';

COMMENT ON FUNCTION "qti"."__reader_olds_ssml_value_yqhxzsygnp"() IS 'the reader of the delta of olds of SsmlValue';

COMMENT ON FUNCTION "qti"."__reader_news_stimulus_ref_olzjajktzb"() IS 'the reader of the delta of news of StimulusRef';

COMMENT ON FUNCTION "qti"."__reader_olds_stimulus_ref_frysvlpywm"() IS 'the reader of the delta of olds of StimulusRef';

COMMENT ON FUNCTION "qti"."__reader_news_structure_naming_y53srzxtio"() IS 'the reader of the delta of news of StructureNaming';

COMMENT ON FUNCTION "qti"."__reader_olds_table_header_gwmayggnvk"() IS 'the reader of the delta of olds of TableHeader';

COMMENT ON FUNCTION "qti"."__reader_news_template_processing_brfriqkb7i"() IS 'the reader of the delta of news of TemplateProcessing';

COMMENT ON FUNCTION "qti"."__reader_news_template_processing_ci3a42ij7n"() IS 'the reader of the delta of news of TemplateProcessing';

COMMENT ON FUNCTION "qti"."__reader_news_template_processing_fxmkt2eev3"() IS 'the reader of the delta of news of TemplateProcessing';

COMMENT ON FUNCTION "qti"."__reader_news_template_processing_ureloyu5id"() IS 'the reader of the delta of news of TemplateProcessing';

COMMENT ON FUNCTION "qti"."__reader_news_template_processing_pywgyksbo2"() IS 'the reader of the delta of news of TemplateProcessing';

COMMENT ON FUNCTION "qti"."__reader_news_template_ref_nvdte55k3d"() IS 'the reader of the delta of news of TemplateRef';

COMMENT ON FUNCTION "qti"."__reader_news_template_ref_t75uidk5yp"() IS 'the reader of the delta of news of TemplateRef';

COMMENT ON FUNCTION "qti"."__reader_olds_template_ref_kyi7yn6lun"() IS 'the reader of the delta of olds of TemplateRef';

COMMENT ON FUNCTION "qti"."__reader_olds_test_identifier_icggnjif7u"() IS 'the reader of the delta of olds of TestIdentifier';

COMMENT ON FUNCTION "qti"."__reader_olds_test_reading_olva4fe6em"() IS 'the reader of the delta of olds of TestReading';

COMMENT ON FUNCTION "qti"."__reader_news_text_reference_vdhcra6f7q"() IS 'the reader of the delta of news of TextReference';

COMMENT ON FUNCTION "qti"."__reader_news_text_reference_x6jjgwm2ee"() IS 'the reader of the delta of news of TextReference';

COMMENT ON FUNCTION "qti"."__reader_olds_text_reference_jlaqjqnb3c"() IS 'the reader of the delta of olds of TextReference';

COMMENT ON FUNCTION "qti"."__reader_olds_text_reference_vehdajfn2y"() IS 'the reader of the delta of olds of TextReference';

COMMENT ON FUNCTION "qti"."__reader_olds_text_reference_bmy4lxk62s"() IS 'the reader of the delta of olds of TextReference';

COMMENT ON FUNCTION "qti"."__reader_news_text_reference_path_76suju5a7o"() IS 'the reader of the delta of news of TextReferencePath';

COMMENT ON FUNCTION "qti"."__reader_olds_text_reference_path_4gnl3not5t"() IS 'the reader of the delta of olds of TextReferencePath';

COMMENT ON FUNCTION "qti"."__reader_olds_tolerance_token_eo23gaoscy"() IS 'the reader of the delta of olds of ToleranceToken';

COMMENT ON FUNCTION "qti"."__reader_olds_trimmed_mark_zjbuobj4lb"() IS 'the reader of the delta of olds of TrimmedMark';

COMMENT ON FUNCTION "qti"."__reader_news_typed_declaration_name_dhei33qaia"() IS 'the reader of the delta of news of TypedDeclarationName';

COMMENT ON FUNCTION "qti"."__reader_news_typed_declaration_name_dxmvikseet"() IS 'the reader of the delta of news of TypedDeclarationName';

COMMENT ON FUNCTION "qti"."__reader_olds_typed_declaration_name_7vgcbikrl3"() IS 'the reader of the delta of olds of TypedDeclarationName';

COMMENT ON FUNCTION "qti"."__reader_olds_typed_declaration_name_cpr4uqsqzu"() IS 'the reader of the delta of olds of TypedDeclarationName';

COMMENT ON FUNCTION "qti"."__reader_news_typed_path_rmmgkrufyb"() IS 'the reader of the delta of news of TypedPath';

COMMENT ON FUNCTION "qti"."__reader_olds_typed_path_xvnrf7lsyr"() IS 'the reader of the delta of olds of TypedPath';

COMMENT ON FUNCTION "qti"."__reader_news_unassembled_reference_sb7coef3c4"() IS 'the reader of the delta of news of UnassembledReference';

COMMENT ON FUNCTION "qti"."__reader_olds_unclaimed_name_7kc5hayake"() IS 'the reader of the delta of olds of UnclaimedName';

COMMENT ON FUNCTION "qti"."__reader_olds_unknown_operand_base_maoy6cepve"() IS 'the reader of the delta of olds of UnknownOperandBase';

COMMENT ON FUNCTION "qti"."__reader_olds_unknown_tail_base_6z26fhck2z"() IS 'the reader of the delta of olds of UnknownTailBase';

COMMENT ON FUNCTION "qti"."__reader_olds_unread_type_href_hsb57w62dw"() IS 'the reader of the delta of olds of UnreadTypeHref';

COMMENT ON FUNCTION "qti"."__reader_news_untargeted_item_ref_cpinqmd6yr"() IS 'the reader of the delta of news of UntargetedItemRef';

COMMENT ON FUNCTION "qti"."__reader_news_variable_ref_4fclvpiw2v"() IS 'the reader of the delta of news of VariableRef';

COMMENT ON FUNCTION "qti"."__reader_news_variable_ref_63m6kgqf7g"() IS 'the reader of the delta of news of VariableRef';

COMMENT ON FUNCTION "qti"."__reader_news_variable_ref_goyy3ppnor"() IS 'the reader of the delta of news of VariableRef';

COMMENT ON FUNCTION "qti"."__reader_olds_variable_ref_xz4n6whflg"() IS 'the reader of the delta of olds of VariableRef';

COMMENT ON FUNCTION "qti"."__reader_olds_variable_ref_7emsoqyi3m"() IS 'the reader of the delta of olds of VariableRef';

COMMENT ON FUNCTION "qti"."__reader_olds_variable_ref_6u7misx2qz"() IS 'the reader of the delta of olds of VariableRef';

COMMENT ON FUNCTION "qti"."__reader_news_variable_ref_node_gkc3slg43r"() IS 'the reader of the delta of news of VariableRefNode';

COMMENT ON FUNCTION "qti"."__reader_news_variable_ref_node_3n6lnhm4yg"() IS 'the reader of the delta of news of VariableRefNode';

COMMENT ON FUNCTION "qti"."__reader_news_weighted_variable_3lturaukw3"() IS 'the reader of the delta of news of WeightedVariable';

COMMENT ON FUNCTION "qti"."__judge_pattern_key_text_check_key_text_bound_zx3w4czbwu"() IS 'the rule judge''s block of rule check Key_text_bound of PatternKeyText over its units';

COMMENT ON FUNCTION "qti"."__judge_rounding_mode_figures_check_rounding_figures_5kytx3lifj"() IS 'the rule judge''s block of rule check Rounding_figures of RoundingModeFigures over its units';

COMMENT ON FUNCTION "qti"."__judge_table_key_text_check_key_text_bound_rphnxpmtzt"() IS 'the rule judge''s block of rule check Key_text_bound of TableKeyText over its units';

COMMENT ON FUNCTION "qti"."__judge_arity_floor_in_expression_operand_7uj7tkdxnn"() IS 'the rule judge''s block of rule ArityFloor(package, path, start, min) in ExpressionOperand(package, path, operator, rank) over its units';

COMMENT ON FUNCTION "qti"."__judge_assembled_document_in_document_s4ejk6f67k"() IS 'the rule judge''s block of rule AssembledDocument(package, path) in Document(package, path) where Logic.eq(assembled, true) over the rows a write adds to AssembledDocument';

COMMENT ON FUNCTION "qti"."__judge_assembled_document_in_document_lr74ktyss2"() IS 'the rule judge''s block of rule AssembledDocument(package, path) in Document(package, path) where Logic.eq(assembled, true) over the rows a write removes from Document';

COMMENT ON FUNCTION "qti"."__judge_assembled_document_in_instance_document_oncsn3m2jk"() IS 'the rule judge''s block of rule AssembledDocument(package, path) in InstanceDocument(package, document) over its units';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_label_use_pvrbgrtag3"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.in(kind, ["a", "abbr", "acronym", "address", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blockquote", "br", "caption", "cite", "code", "col", "colgroup", "dd", "details", "dfn", "div", "dl", "dt", "em", "figcaption", "figure", "footer", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr", "i", "img", "kbd", "label", "li", "nav", "object", "ol", "p", "picture", "pre", "q", "qti-assessment-item", "qti-associable-hotspot", "qti-associate-interaction", "qti-choice-interaction", "qti-custom-interaction", "qti-drawing-interaction", "qti-end-attempt-interaction", "qti-extended-text-interaction", "qti-feedback-block", "qti-feedback-block.template", "qti-feedback-inline", "qti-gap", "qti-gap-img", "qti-gap-match-interaction", "qti-gap-text", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-choice", "qti-hotspot-interaction", "qti-hottext", "qti-hottext-interaction", "qti-inline-choice", "qti-inline-choice-interaction", "qti-item-body", "qti-label", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-portable-custom-interaction", "qti-position-object-interaction", "qti-prompt", "qti-rubric-block", "qti-rubric-block.test", "qti-select-point-interaction", "qti-simple-associable-choice", "qti-simple-choice", "qti-slider-interaction", "qti-stimulus-body", "qti-template-block", "qti-template-block.rubric", "qti-template-inline", "qti-template-inline.rubric", "qti-text-entry-interaction", "qti-upload-interaction", "rb", "rp", "rt", "rtc", "ruby", "samp", "section", "small", "source", "span", "strong", "sub", "summary", "sup", "table", "tbody", "td", "tfoot", "th", "thead", "tr", "track", "tt", "ul", "var", "video"]) and Logic.eq(name, "label") in LabelUse(package, path, start) over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_label_use_4c464bmztk"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.in(kind, ["a", "abbr", "acronym", "address", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blockquote", "br", "caption", "cite", "code", "col", "colgroup", "dd", "details", "dfn", "div", "dl", "dt", "em", "figcaption", "figure", "footer", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr", "i", "img", "kbd", "label", "li", "nav", "object", "ol", "p", "picture", "pre", "q", "qti-assessment-item", "qti-associable-hotspot", "qti-associate-interaction", "qti-choice-interaction", "qti-custom-interaction", "qti-drawing-interaction", "qti-end-attempt-interaction", "qti-extended-text-interaction", "qti-feedback-block", "qti-feedback-block.template", "qti-feedback-inline", "qti-gap", "qti-gap-img", "qti-gap-match-interaction", "qti-gap-text", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-choice", "qti-hotspot-interaction", "qti-hottext", "qti-hottext-interaction", "qti-inline-choice", "qti-inline-choice-interaction", "qti-item-body", "qti-label", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-portable-custom-interaction", "qti-position-object-interaction", "qti-prompt", "qti-rubric-block", "qti-rubric-block.test", "qti-select-point-interaction", "qti-simple-associable-choice", "qti-simple-choice", "qti-slider-interaction", "qti-stimulus-body", "qti-template-block", "qti-template-block.rubric", "qti-template-inline", "qti-template-inline.rubric", "qti-text-entry-interaction", "qti-upload-interaction", "rb", "rp", "rt", "rtc", "ruby", "samp", "section", "small", "source", "span", "strong", "sub", "summary", "sup", "table", "tbody", "td", "tfoot", "th", "thead", "tr", "track", "tt", "ul", "var", "video"]) and Logic.eq(name, "label") in LabelUse(package, path, start) over the rows a write removes from LabelUse';

COMMENT ON FUNCTION "qti"."__judge_attribute_lexical_kind_name_in_attribute_vrp5tgvtdu"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.in(lexical, ["absolute", "relative"]) and Logic.eq(kind, "qti-equal") and Logic.eq(name, "tolerance-mode") in Attribute(package, path, start) where Logic.eq(kind, "qti-equal") and Logic.eq(name, "tolerance") over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_attribute_lexical_kind_name_in_attribute_hgiunwbyds"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.in(lexical, ["absolute", "relative"]) and Logic.eq(kind, "qti-equal") and Logic.eq(name, "tolerance-mode") in Attribute(package, path, start) where Logic.eq(kind, "qti-equal") and Logic.eq(name, "tolerance") over the rows a write removes from Attribute';

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

COMMENT ON FUNCTION "qti"."__judge_attribute_in_tolerance_token_56oa46mawv"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.eq(kind, "qti-equal") and Logic.eq(name, "tolerance") in ToleranceToken(package, path, start) where Logic.eq(at, 0n) over its units';

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

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_math_action_pi5kawylw7"() IS 'the rule judge''s block of rule Attribute(package, path, start, lexicalDigest) where Logic.eq(kind, "m:maction") and Logic.eq(name, "selection") in MathAction(package, path, start, selectionLexicalDigest) where Logic.eq(selectionWritten, true) over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_math_action_z4ukxdfjlo"() IS 'the rule judge''s block of rule Attribute(package, path, start, lexicalDigest) where Logic.eq(kind, "m:maction") and Logic.eq(name, "selection") in MathAction(package, path, start, selectionLexicalDigest) where Logic.eq(selectionWritten, true) over the rows a write removes from MathAction';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_reference_vm3zio74rn"() IS 'the rule judge''s block of rule Attribute(package, path, start, name, kind) where Logic.in(ReferenceAttribute.at("form", kind, name), ["module", "package", "uri"]) in Reference(package, path, start, name, kind) over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_reference_b27ug5yqcy"() IS 'the rule judge''s block of rule Attribute(package, path, start, name, kind) where Logic.in(ReferenceAttribute.at("form", kind, name), ["module", "package", "uri"]) in Reference(package, path, start, name, kind) over the rows a write removes from Reference';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_interaction_attribute_vlbassbzx3"() IS 'the rule judge''s block of rule Attribute(package, path, start, name, kind, lexicalDigest) where Logic.or(Logic.in(name, ["aria-valuemax", "aria-valuemin"]), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-context-variable", "qti-gap", "qti-gap-img", "qti-gap-text", "qti-hotspot-choice", "qti-hottext", "qti-inline-choice", "qti-printed-variable", "qti-simple-associable-choice", "qti-simple-choice"]), Logic.eq(name, "identifier")), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-gap", "qti-gap-img", "qti-gap-text", "qti-hotspot-choice", "qti-hottext", "qti-inline-choice", "qti-simple-associable-choice", "qti-simple-choice", "qti-template-block", "qti-template-block.rubric", "qti-template-inline", "qti-template-inline.rubric", "qti-template-variable"]), Logic.eq(name, "template-identifier")), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-gap-img", "qti-gap-text", "qti-simple-associable-choice"]), Logic.eq(name, "match-max")), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-gap-img", "qti-gap-text", "qti-simple-associable-choice"]), Logic.eq(name, "match-min")), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-hotspot-choice"]), Logic.eq(name, "shape")), Logic.and(Logic.in(kind, ["qti-associate-interaction", "qti-choice-interaction", "qti-custom-interaction", "qti-drawing-interaction", "qti-end-attempt-interaction", "qti-extended-text-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-inline-choice-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-portable-custom-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-slider-interaction", "qti-text-entry-interaction", "qti-upload-interaction"]), Logic.eq(name, "response-identifier")), Logic.and(Logic.in(kind, ["qti-associate-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-match-interaction"]), Logic.eq(name, "max-associations")), Logic.and(Logic.in(kind, ["qti-associate-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-match-interaction"]), Logic.eq(name, "min-associations")), Logic.and(Logic.in(kind, ["qti-choice-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-order-interaction", "qti-position-object-interaction", "qti-select-point-interaction"]), Logic.eq(name, "max-choices")), Logic.and(Logic.in(kind, ["qti-choice-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-order-interaction", "qti-position-object-interaction", "qti-select-point-interaction"]), Logic.eq(name, "min-choices")), Logic.and(Logic.in(kind, ["qti-extended-text-interaction", "qti-text-entry-interaction"]), Logic.eq(name, "string-identifier")), Logic.and(Logic.in(kind, ["qti-feedback-block", "qti-feedback-block.template", "qti-feedback-inline", "qti-modal-feedback", "qti-test-feedback"]), Logic.eq(name, "outcome-identifier")), Logic.and(Logic.eq(kind, "qti-assessment-item"), Logic.eq(name, "adaptive")), Logic.and(Logic.eq(kind, "qti-extended-text-interaction"), Logic.eq(name, "max-strings")), Logic.and(Logic.eq(kind, "qti-extended-text-interaction"), Logic.eq(name, "min-strings")), Logic.and(Logic.eq(kind, "qti-media-interaction"), Logic.eq(name, "max-plays")), Logic.and(Logic.eq(kind, "qti-media-interaction"), Logic.eq(name, "min-plays")), Logic.and(Logic.eq(kind, "qti-printed-variable"), Logic.eq(name, "base")), Logic.and(Logic.eq(kind, "qti-printed-variable"), Logic.eq(name, "index")), Logic.and(Logic.eq(kind, "qti-slider-interaction"), Logic.eq(name, "lower-bound")), Logic.and(Logic.eq(kind, "qti-slider-interaction"), Logic.eq(name, "upper-bound"))) in InteractionAttribute(package, path, start, name, kind, lexicalDigest) over the rows a write adds to Attribute';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_interaction_attribute_iexjqtvmzh"() IS 'the rule judge''s block of rule Attribute(package, path, start, name, kind, lexicalDigest) where Logic.or(Logic.in(name, ["aria-valuemax", "aria-valuemin"]), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-context-variable", "qti-gap", "qti-gap-img", "qti-gap-text", "qti-hotspot-choice", "qti-hottext", "qti-inline-choice", "qti-printed-variable", "qti-simple-associable-choice", "qti-simple-choice"]), Logic.eq(name, "identifier")), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-gap", "qti-gap-img", "qti-gap-text", "qti-hotspot-choice", "qti-hottext", "qti-inline-choice", "qti-simple-associable-choice", "qti-simple-choice", "qti-template-block", "qti-template-block.rubric", "qti-template-inline", "qti-template-inline.rubric", "qti-template-variable"]), Logic.eq(name, "template-identifier")), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-gap-img", "qti-gap-text", "qti-simple-associable-choice"]), Logic.eq(name, "match-max")), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-gap-img", "qti-gap-text", "qti-simple-associable-choice"]), Logic.eq(name, "match-min")), Logic.and(Logic.in(kind, ["qti-associable-hotspot", "qti-hotspot-choice"]), Logic.eq(name, "shape")), Logic.and(Logic.in(kind, ["qti-associate-interaction", "qti-choice-interaction", "qti-custom-interaction", "qti-drawing-interaction", "qti-end-attempt-interaction", "qti-extended-text-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-inline-choice-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-portable-custom-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-slider-interaction", "qti-text-entry-interaction", "qti-upload-interaction"]), Logic.eq(name, "response-identifier")), Logic.and(Logic.in(kind, ["qti-associate-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-match-interaction"]), Logic.eq(name, "max-associations")), Logic.and(Logic.in(kind, ["qti-associate-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-match-interaction"]), Logic.eq(name, "min-associations")), Logic.and(Logic.in(kind, ["qti-choice-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-order-interaction", "qti-position-object-interaction", "qti-select-point-interaction"]), Logic.eq(name, "max-choices")), Logic.and(Logic.in(kind, ["qti-choice-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-order-interaction", "qti-position-object-interaction", "qti-select-point-interaction"]), Logic.eq(name, "min-choices")), Logic.and(Logic.in(kind, ["qti-extended-text-interaction", "qti-text-entry-interaction"]), Logic.eq(name, "string-identifier")), Logic.and(Logic.in(kind, ["qti-feedback-block", "qti-feedback-block.template", "qti-feedback-inline", "qti-modal-feedback", "qti-test-feedback"]), Logic.eq(name, "outcome-identifier")), Logic.and(Logic.eq(kind, "qti-assessment-item"), Logic.eq(name, "adaptive")), Logic.and(Logic.eq(kind, "qti-extended-text-interaction"), Logic.eq(name, "max-strings")), Logic.and(Logic.eq(kind, "qti-extended-text-interaction"), Logic.eq(name, "min-strings")), Logic.and(Logic.eq(kind, "qti-media-interaction"), Logic.eq(name, "max-plays")), Logic.and(Logic.eq(kind, "qti-media-interaction"), Logic.eq(name, "min-plays")), Logic.and(Logic.eq(kind, "qti-printed-variable"), Logic.eq(name, "base")), Logic.and(Logic.eq(kind, "qti-printed-variable"), Logic.eq(name, "index")), Logic.and(Logic.eq(kind, "qti-slider-interaction"), Logic.eq(name, "lower-bound")), Logic.and(Logic.eq(kind, "qti-slider-interaction"), Logic.eq(name, "upper-bound"))) in InteractionAttribute(package, path, start, name, kind, lexicalDigest) over the rows a write removes from InteractionAttribute';

COMMENT ON FUNCTION "qti"."__judge_binary_math_operator_in_expression_operand_p4suu7whs6"() IS 'the rule judge''s block of rule BinaryMathOperator(package, path, start) in ExpressionOperand(package, path, operator) where Logic.eq(rank, 2n) over its units';

COMMENT ON FUNCTION "qti"."__judge_binding_base_type_node_in_binding_fit_kxxy2h5z32"() IS 'the rule judge''s block of rule BindingBaseTypeNode(baseType, cardinality, kind) where Logic.not(Logic.in(kind, ["qti-custom-interaction", "qti-order-interaction", "qti-portable-custom-interaction"])) and Logic.eq(attribute, "response-identifier") and Logic.ne(cardinality, "record") in BindingFit(baseType, cardinality, kind) over the rows a write adds to BindingBaseTypeNode';

COMMENT ON FUNCTION "qti"."__judge_binding_cardinality_node_in_record_binding_ejnm6wvt75"() IS 'the rule judge''s block of rule BindingCardinalityNode(kind) where Logic.not(Logic.in(kind, ["qti-custom-interaction", "qti-order-interaction", "qti-portable-custom-interaction"])) and Logic.eq(attribute, "response-identifier") and Logic.eq(cardinality, "record") in RecordBindingFit(kind) over the rows a write adds to BindingCardinalityNode';

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

COMMENT ON FUNCTION "qti"."__judge_cell_token_in_table_header_3e66qdgh3j"() IS 'the rule judge''s block of rule CellToken(package, path, table, tokenDigest) in TableHeader(package, path, table, idDigest) over its units';

COMMENT ON FUNCTION "qti"."__judge_choice_interaction_interaction_path_path_in_ksu4ntntp4"() IS 'the rule judge''s block of rule ChoiceInteraction(package, path, interactionPath, interaction) where Logic.ne(interactionPath, path) in Document(package, path, contextPath, contextNearest) over the rows a write adds to ChoiceInteraction';

COMMENT ON FUNCTION "qti"."__judge_choice_interaction_interaction_path_path_in_7bd365ysfm"() IS 'the rule judge''s block of rule ChoiceInteraction(package, path, interactionPath, interaction) where Logic.ne(interactionPath, path) in Document(package, path, contextPath, contextNearest) over the rows a write removes from Document';

COMMENT ON FUNCTION "qti"."__judge_choice_interaction_in_choice_node_g6fibgb65p"() IS 'the rule judge''s block of rule ChoiceInteraction(package, path, start, interaction) in ChoiceNode(package, path, start, nearest) over its units';

COMMENT ON FUNCTION "qti"."__judge_choice_node_in_count_bound_r57c36aziu"() IS 'the rule judge''s block of rule ChoiceNode(package, path, start) where Logic.in(kind, ["qti-associable-hotspot", "qti-associate-interaction", "qti-choice-interaction", "qti-extended-text-interaction", "qti-gap-img", "qti-gap-match-interaction", "qti-gap-text", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-simple-associable-choice"]) in CountBound(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_choice_or_hottext_in_unclaimed_name_uyxncalelf"() IS 'the rule judge''s block of rule ChoiceOrHottext(package, path, identifier) in UnclaimedName(package, path, identifier) over its units';

COMMENT ON FUNCTION "qti"."__judge_cn_count_in_cn_parts_wpwd4wy67v"() IS 'the rule judge''s block of rule CnCount(type, parts) in CnParts(type, parts) over the rows a write adds to CnCount';

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

COMMENT ON FUNCTION "qti"."__judge_head_qualifier_pair_in_head_qualifier_6o4c2ol7xw"() IS 'the rule judge''s block of rule HeadQualifierPair(head, kind) in HeadQualifier(head, qualifier) over the rows a write adds to HeadQualifierPair';

COMMENT ON FUNCTION "qti"."__judge_hottext_in_node_4brh7b5kyu"() IS 'the rule judge''s block of rule Hottext(package, path, start) in Node(package, path, start) where Logic.eq(kind, "qti-hottext") over the rows a write adds to Hottext';

COMMENT ON FUNCTION "qti"."__judge_hottext_in_node_vre3mbwmuc"() IS 'the rule judge''s block of rule Hottext(package, path, start) in Node(package, path, start) where Logic.eq(kind, "qti-hottext") over the rows a write removes from Node';

COMMENT ON FUNCTION "qti"."__judge_hottext_node_in_interaction_node_basx24omht"() IS 'the rule judge''s block of rule HottextNode(package, nearestPath, nearest, nearestKind) where Logic.in(nearestKind, ["qti-associate-interaction", "qti-choice-interaction", "qti-custom-interaction", "qti-drawing-interaction", "qti-end-attempt-interaction", "qti-extended-text-interaction", "qti-gap-match-interaction", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-inline-choice-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-portable-custom-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-slider-interaction", "qti-text-entry-interaction", "qti-upload-interaction"]) in InteractionNode(package, path, start, kind) over its units';

COMMENT ON FUNCTION "qti"."__judge_hottext_node_in_document_f4d2jdjlct"() IS 'the rule judge''s block of rule HottextNode(package, path, nearestPath, nearest) where Logic.ne(nearestPath, path) in Document(package, path, contextPath, contextNearest) over its units';

COMMENT ON FUNCTION "qti"."__judge_idref_target_in_id_binding_mxhwglocjm"() IS 'the rule judge''s block of rule IdrefTarget(package, path, idDigest) where Logic.eq(assembled, false) in IdBinding(package, path, idDigest) over its units';

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

COMMENT ON FUNCTION "qti"."__judge_mapping_base_type_in_mappable_base_type_hulfn6hiz6"() IS 'the rule judge''s block of rule MappingBaseType(baseType) in MappableBaseType(baseType) over the rows a write adds to MappingBaseType';

COMMENT ON FUNCTION "qti"."__judge_math_action_in_node_qwhx5nmpvn"() IS 'the rule judge''s block of rule MathAction(package, path, start) in Node(package, path, start) where Logic.eq(kind, "m:maction") over the rows a write adds to MathAction';

COMMENT ON FUNCTION "qti"."__judge_math_action_in_node_lh3miyd7vn"() IS 'the rule judge''s block of rule MathAction(package, path, start) in Node(package, path, start) where Logic.eq(kind, "m:maction") over the rows a write removes from Node';

COMMENT ON FUNCTION "qti"."__judge_math_action_selection_written_in_attribute_dmev5yfy6d"() IS 'the rule judge''s block of rule MathAction(package, path, start) where Logic.eq(selectionWritten, true) in Attribute(package, path, start) where Logic.eq(kind, "m:maction") and Logic.eq(name, "selection") over the rows a write removes from Attribute';

COMMENT ON FUNCTION "qti"."__judge_math_action_selection_written_in_attribute_73wyoen5hx"() IS 'the rule judge''s block of rule MathAction(package, path, start) where Logic.eq(selectionWritten, true) in Attribute(package, path, start) where Logic.eq(kind, "m:maction") and Logic.eq(name, "selection") over the rows a write adds to MathAction';

COMMENT ON FUNCTION "qti"."__judge_math_align_group_in_scope_node_77oqjx5yf6"() IS 'the rule judge''s block of rule MathAlignGroup(package, path, start) in ScopeNode(package, path, start) where Logic.eq(kind, "m:maligngroup") and Logic.eq(state, "open") over its units';

COMMENT ON FUNCTION "qti"."__judge_math_align_scope_in_scoped_dir_fq3qe27snp"() IS 'the rule judge''s block of rule MathAlignScope(package, path, start, own) where Logic.ne(inherited, own) in ScopedDir(package, path, start, direction) over its units';

COMMENT ON FUNCTION "qti"."__judge_math_cell_in_node_u5m3rontek"() IS 'the rule judge''s block of rule MathCell(package, path, start) in Node(package, path, start) where Logic.eq(kind, "m:mtd") over the rows a write adds to MathCell';

COMMENT ON FUNCTION "qti"."__judge_math_cell_in_node_nfojgk5pze"() IS 'the rule judge''s block of rule MathCell(package, path, start) in Node(package, path, start) where Logic.eq(kind, "m:mtd") over the rows a write removes from Node';

COMMENT ON FUNCTION "qti"."__judge_math_cn_in_node_tagdr7vhlf"() IS 'the rule judge''s block of rule MathCn(package, path, start) in Node(package, path, start) where Logic.eq(kind, "m:cn") over the rows a write adds to MathCn';

COMMENT ON FUNCTION "qti"."__judge_math_cn_in_node_gq7mj4blic"() IS 'the rule judge''s block of rule MathCn(package, path, start) in Node(package, path, start) where Logic.eq(kind, "m:cn") over the rows a write removes from Node';

COMMENT ON FUNCTION "qti"."__judge_math_cn_base_lexical_in_attribute_hbbvsolbpa"() IS 'the rule judge''s block of rule MathCn(package, path, start, baseLexicalDigest) where Logic.ne(baseLexical, "") in Attribute(package, path, start, lexicalDigest) where Logic.eq(kind, "m:cn") and Logic.eq(name, "base") over the rows a write removes from Attribute';

COMMENT ON FUNCTION "qti"."__judge_math_cn_base_lexical_in_attribute_vhtsddckq7"() IS 'the rule judge''s block of rule MathCn(package, path, start, baseLexicalDigest) where Logic.ne(baseLexical, "") in Attribute(package, path, start, lexicalDigest) where Logic.eq(kind, "m:cn") and Logic.eq(name, "base") over the rows a write adds to MathCn';

COMMENT ON FUNCTION "qti"."__judge_math_cn_in_cn_count_y6ouawywre"() IS 'the rule judge''s block of rule MathCn(package, path, start, type) in CnCount(package, path, start, type) over its units';

COMMENT ON FUNCTION "qti"."__judge_math_cn_type_lexical_in_attribute_evcw7lnhqb"() IS 'the rule judge''s block of rule MathCn(package, path, start, typeLexicalDigest) where Logic.ne(typeLexical, "") in Attribute(package, path, start, lexicalDigest) where Logic.eq(kind, "m:cn") and Logic.eq(name, "type") over the rows a write removes from Attribute';

COMMENT ON FUNCTION "qti"."__judge_math_cn_type_lexical_in_attribute_nbfedqnzey"() IS 'the rule judge''s block of rule MathCn(package, path, start, typeLexicalDigest) where Logic.ne(typeLexical, "") in Attribute(package, path, start, lexicalDigest) where Logic.eq(kind, "m:cn") and Logic.eq(name, "type") over the rows a write adds to MathCn';

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

COMMENT ON FUNCTION "qti"."__judge_placed_binding_base_type_node_in_binding_fit_coiystj73h"() IS 'the rule judge''s block of rule PlacedBindingBaseTypeNode(baseType, cardinality, kind) where Logic.not(Logic.in(kind, ["qti-custom-interaction", "qti-order-interaction", "qti-portable-custom-interaction"])) and Logic.eq(attribute, "response-identifier") and Logic.ne(cardinality, "record") in BindingFit(baseType, cardinality, kind) over the rows a write adds to PlacedBindingBaseTypeNode';

COMMENT ON FUNCTION "qti"."__judge_placed_binding_cardinality_node_in_record_fe7qj2k4lf"() IS 'the rule judge''s block of rule PlacedBindingCardinalityNode(kind) where Logic.not(Logic.in(kind, ["qti-custom-interaction", "qti-order-interaction", "qti-portable-custom-interaction"])) and Logic.eq(attribute, "response-identifier") and Logic.eq(cardinality, "record") in RecordBindingFit(kind) over the rows a write adds to PlacedBindingCardinalityNode';

COMMENT ON FUNCTION "qti"."__judge_placed_binding_cardinality_node_in_count_l23umml5ll"() IS 'the rule judge''s block of rule PlacedBindingCardinalityNode(package, path, start) where Logic.in(cardinality, ["multiple", "ordered"]) and Logic.eq(attribute, "response-identifier") and Logic.eq(kind, "qti-extended-text-interaction") in CountBound(package, path, start) where Logic.eq(maxWritten, true) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_choice_or_hottext_in_unclaimed_name_dqd4nmh3tg"() IS 'the rule judge''s block of rule PlacedChoiceOrHottext(package, assembly, identifier) in UnclaimedName(package, path, identifier) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_expression_in_placed_expression_site_c6a4sqoxzi"() IS 'the rule judge''s block of rule PlacedExpression(package, assembly, instance, path, start) in PlacedExpressionSite(package, assembly, instance, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_expression_node_in_result_base_r7hdygacvz"() IS 'the rule judge''s block of rule PlacedExpressionNode(kind, baseType) where Logic.or(Logic.not(Logic.in(kind, ["qti-base-value", "qti-math-operator", "qti-test-variables"])), Logic.ne(baseType, "unknown")) in ResultBase(kind, base) over the rows a write adds to PlacedExpressionNode';

COMMENT ON FUNCTION "qti"."__judge_placed_expression_node_in_result_cardinality_u2czglnqnt"() IS 'the rule judge''s block of rule PlacedExpressionNode(kind, cardinality) in ResultCardinality(kind, cardinality) over the rows a write adds to PlacedExpressionNode';

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

COMMENT ON FUNCTION "qti"."__judge_placed_id_in_id_value_cwkm52j2jl"() IS 'the rule judge''s block of rule PlacedId(package, path, start, idDigest, owner) in IdValue(package, path, start, idDigest, owner) over its units';

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

COMMENT ON FUNCTION "qti"."__judge_placed_variable_ref_declaration_in_reference_q2yez47kbr"() IS 'the rule judge''s block of rule PlacedVariableRefDeclaration(kind, attribute, declarationKind) where Logic.eq(attribute, "identifier") in ReferenceDeclaration(kind, attribute, declaration) over the rows a write adds to PlacedVariableRefDeclaration';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_ref_declaration_in_3la5v6erpg"() IS 'the rule judge''s block of rule PlacedVariableRefDeclaration(package, assembly, declaration) where Logic.eq(attribute, "identifier") and Logic.eq(kind, "qti-lookup-outcome-value") in DeclarationTable(package, path, declaration) where Logic.in(kind, ["qti-interpolation-table", "qti-match-table"]) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_ref_declaration_in_xo34jozlnj"() IS 'the rule judge''s block of rule PlacedVariableRefDeclaration(package, assembly, declaration) where Logic.eq(attribute, "identifier") and Logic.eq(kind, "qti-map-response") in DeclarationTable(package, path, declaration) where Logic.eq(kind, "qti-mapping") over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_ref_declaration_in_nawbh4uthe"() IS 'the rule judge''s block of rule PlacedVariableRefDeclaration(package, assembly, declaration) where Logic.eq(attribute, "identifier") and Logic.eq(kind, "qti-map-response-point") in DeclarationTable(package, path, declaration) where Logic.eq(kind, "qti-area-mapping") over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_weighted_variable_in_item_scoped_5nc7mpyg7v"() IS 'the rule judge''s block of rule PlacedWeightedVariable(package, assembly, path, start) in ItemScopedReading(package, assembly, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_prefixed_declaration_in_reference_wgy5y3yfv2"() IS 'the rule judge''s block of rule PrefixedDeclaration(kind, attribute, declarationKind) in ReferenceDeclaration(kind, attribute, declaration) over the rows a write adds to PrefixedDeclaration';

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

COMMENT ON FUNCTION "qti"."__judge_resolved_branch_rule_in_forward_branch_rule_bnrl7pyla4"() IS 'the rule judge''s block of rule ResolvedBranchRule(package, assembly, instance, start) in ForwardBranchRule(package, assembly, instance, start) over its units';

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

COMMENT ON FUNCTION "qti"."__judge_resource_href_outside_in_resource_file_wgdhp7fj7t"() IS 'the rule judge''s block of rule ResourceHrefOutside(package, path, start, targetDigest) in ResourceFileOutside(package, path, resource, targetDigest) over its units';

COMMENT ON FUNCTION "qti"."__judge_resource_href_path_in_resource_href_lqtit4z4j2"() IS 'the rule judge''s block of rule ResourceHrefPath(package, path, start) in ResourceHref(package, path, start) where Logic.eq(scope, "entry") over the rows a write removes from ResourceHref';

COMMENT ON FUNCTION "qti"."__judge_resource_href_path_in_resource_href_gue657k2ny"() IS 'the rule judge''s block of rule ResourceHrefPath(package, path, start) in ResourceHref(package, path, start) where Logic.eq(scope, "entry") over the rows a write adds to ResourceHrefPath';

COMMENT ON FUNCTION "qti"."__judge_resource_href_path_in_resource_file_path_4fdzdqmxmd"() IS 'the rule judge''s block of rule ResourceHrefPath(package, path, start, target) in ResourceFilePath(package, path, resource, target) over its units';

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

COMMENT ON FUNCTION "qti"."__judge_share_target_in_id_binding_66fspiqbgo"() IS 'the rule judge''s block of rule ShareTarget(package, path, idDigest, targetStart) in IdBinding(package, path, idDigest, owner) over its units';

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

COMMENT ON FUNCTION "qti"."__judge_ssml_value_in_ssml_value_swhdtslqux"() IS 'the rule judge''s block of rule SsmlValue(package, path, fragment, valueDigest) where Logic.eq(kind, "ssml:lookup") in SsmlValue(package, path, fragment, valueDigest) where Logic.eq(kind, "ssml:lexicon") over its units';

COMMENT ON FUNCTION "qti"."__judge_ssml_value_in_trimmed_mark_cvhak5ppld"() IS 'the rule judge''s block of rule SsmlValue(package, path, start, valueDigest) where Logic.eq(kind, "ssml:speak") in TrimmedMark(package, path, fragment, valueDigest) over its units';

COMMENT ON FUNCTION "qti"."__judge_stimulus_ref_in_node_poqx5ecim2"() IS 'the rule judge''s block of rule StimulusRef(package, path, start) in Node(package, path, start) where Logic.eq(kind, "qti-assessment-stimulus-ref") over the rows a write removes from Node';

COMMENT ON FUNCTION "qti"."__judge_stimulus_ref_in_node_jsez6mfieg"() IS 'the rule judge''s block of rule StimulusRef(package, path, start) in Node(package, path, start) where Logic.eq(kind, "qti-assessment-stimulus-ref") over the rows a write adds to StimulusRef';

COMMENT ON FUNCTION "qti"."__judge_stimulus_ref_in_test_identifier_qu6fc3vcub"() IS 'the rule judge''s block of rule StimulusRef(package, path, start, identifier) in TestIdentifier(package, path, start, value) over its units';

COMMENT ON FUNCTION "qti"."__judge_structure_naming_in_named_i7g7ynxwbq"() IS 'the rule judge''s block of rule StructureNaming(package, path, start) in Named(package, path, start) over its units';

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

COMMENT ON FUNCTION "qti"."__judge_typed_path_in_resource_document_k5nhgvc4ub"() IS 'the rule judge''s block of rule TypedPath(package, target, type) where Logic.in(type, ["imsqti_fragment_xmlv3p0", "imsqti_item_xmlv3p0", "imsqti_outcomes_xmlv3p0", "imsqti_resprocessing_xmlv3p0", "imsqti_rptemplate_xmlv3p0", "imsqti_section_xmlv3p0", "imsqti_stimulus_xmlv3p0", "imsqti_test_xmlv3p0", "qtiusagedata/xml", "resourcemetadata/xml"]) in ResourceDocument(package, path, type) over its units';

COMMENT ON FUNCTION "qti"."__judge_unassembled_reference_in_catalog_id_qlplza6aff"() IS 'the rule judge''s block of rule UnassembledReference(package, path, tokenDigest) in CatalogId(package, path, idDigest) over its units';

COMMENT ON FUNCTION "qti"."__judge_untargeted_item_ref_in_unread_type_href_7b4c53lcjo"() IS 'the rule judge''s block of rule UntargetedItemRef(package, target) in UnreadTypeHref(package, target) over its units';

COMMENT ON FUNCTION "qti"."__judge_variable_ref_node_in_expression_2jiipu6mjc"() IS 'the rule judge''s block of rule VariableRefNode(package, path, start, language) where Logic.in(kind, ["qti-and", "qti-any-n", "qti-base-value", "qti-container-size", "qti-contains", "qti-correct", "qti-custom-operator", "qti-default", "qti-delete", "qti-divide", "qti-duration-gte", "qti-duration-lt", "qti-equal", "qti-equal-rounded", "qti-field-value", "qti-gcd", "qti-gt", "qti-gte", "qti-index", "qti-inside", "qti-integer-divide", "qti-integer-modulus", "qti-integer-to-float", "qti-is-null", "qti-lcm", "qti-lt", "qti-lte", "qti-map-response", "qti-map-response-point", "qti-match", "qti-math-constant", "qti-math-operator", "qti-max", "qti-member", "qti-min", "qti-multiple", "qti-not", "qti-null", "qti-number-correct", "qti-number-incorrect", "qti-number-presented", "qti-number-responded", "qti-number-selected", "qti-or", "qti-ordered", "qti-outcome-maximum", "qti-outcome-minimum", "qti-pattern-match", "qti-power", "qti-product", "qti-random", "qti-random-float", "qti-random-integer", "qti-repeat", "qti-round", "qti-round-to", "qti-stats-operator", "qti-string-match", "qti-substring", "qti-subtract", "qti-sum", "qti-test-variables", "qti-truncate", "qti-variable"]) in Expression(package, path, start, language) over its units';

COMMENT ON FUNCTION "qti"."__judge_variable_ref_node_in_processing_3423tnwmxm"() IS 'the rule judge''s block of rule VariableRefNode(package, path, start, language) where Logic.in(kind, ["qti-exit-response", "qti-exit-template", "qti-exit-test", "qti-lookup-outcome-value", "qti-outcome-condition", "qti-outcome-else", "qti-outcome-else-if", "qti-outcome-if", "qti-outcome-processing", "qti-outcome-processing-fragment", "qti-response-condition", "qti-response-else", "qti-response-else-if", "qti-response-if", "qti-response-processing", "qti-response-processing-fragment", "qti-set-correct-response", "qti-set-default-value", "qti-set-outcome-value", "qti-set-template-value", "qti-template-condition", "qti-template-constraint", "qti-template-else", "qti-template-else-if", "qti-template-if", "qti-template-processing"]) in Processing(package, path, start, language) over its units';

COMMENT ON FUNCTION "qti"."__judge_weighted_variable_in_expression_x6bof2cubn"() IS 'the rule judge''s block of rule WeightedVariable(package, path, start) in Expression(package, path, start) where Logic.eq(language, "outcome") over its units';

COMMENT ON FUNCTION "qti"."__judge_arity_floor_doglpvgcmf"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of ArityFloor and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_assembled_document_wbfwcw2fm5"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of AssembledDocument and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_assembled_document_4u6x2mwpnm"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of AssembledDocument and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_attribute_moyfwojqwx"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Attribute and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_binding_base_type_node_yswlvmwl7v"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of BindingBaseTypeNode and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_binding_cardinality_node_tnsdkagbw3"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of BindingCardinalityNode and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_binding_name_gemsksmiq7"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of BindingName and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_bound_variable_zxm42nrp7s"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of BoundVariable and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_branch_resolution_yavob32y2p"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of BranchResolution and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_candidate_path_6psahny56j"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of CandidatePath and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_candidate_path_am2d75nch3"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of CandidatePath and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_catalog_scope_node_itreeodnp3"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of CatalogScopeNode and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_cell_child_hwjes4amiu"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of CellChild and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_cell_leaf_poszuxeivg"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of CellLeaf and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_cell_token_adblwyjgte"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of CellToken and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_choice_nisbwvsh7r"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Choice and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_choice_interaction_ekipa4f6m5"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of ChoiceInteraction and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_choice_or_hottext_b3eowo5l2w"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of ChoiceOrHottext and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_cn_count_23pwwxcmqm"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of CnCount and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_comment_trfw3pfsui"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Comment and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_comment_buwejyelbw"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Comment and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_context_ref_kvj4qxtn7r"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of ContextRef and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_count_bound_k4vtjktwzp"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of CountBound and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_count_bound_node_6yvlg4qf6g"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of CountBoundNode and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_data_ssml_6gszispnmq"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of DataSsml and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_data_ssml_nwrnj3vksd"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of DataSsml and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_dependency_zpk2eyiyar"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Dependency and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_described_assembled_lang_amjqccaa4x"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of DescribedAssembledLang and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_doctype_o3ckpdftex"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Doctype and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_doctype_hrsgiwq7zp"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Doctype and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_document_aoqbnnlpfd"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Document and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_document_id_4v56yc32at"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of DocumentId and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_document_id_mqevfolpk6"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of DocumentId and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_element_type_clxdpe7f4u"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of ElementType and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_entry_ymyafdvyai"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Entry and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_entry_o6nexgoa6n"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Entry and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_expression_attribute_3epdtgybeb"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of ExpressionAttribute and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_expression_node_ncu3jivjfv"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of ExpressionNode and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_file_bfqdpdagia"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of File and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_file_udvvld4wnt"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of File and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_file_outside_r27ookop5f"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of FileOutside and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_file_outside_im2xnrrlhf"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of FileOutside and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_file_path_m55e3dz3zb"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of FilePath and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_file_path_dvhilkh4a4"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of FilePath and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_forbidden_resource_type_2w77wpkp74"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of ForbiddenResourceType and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_fragment_scope_rahqr2afgn"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of FragmentScope and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_head_document_bohq7tghv7"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of HeadDocument and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_head_qualifier_pair_p6m2gdjuy4"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of HeadQualifierPair and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_hottext_hr3z5kcep4"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Hottext and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_hottext_3lpxcd4bpp"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Hottext and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_hottext_node_sne3nju2xt"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of HottextNode and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_identity_text_edtg3qnnen"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of IdentityText and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_idref_target_iijd7tvsfu"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of IdrefTarget and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_inclusion_g7lfw4jzbs"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Inclusion and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_instance_nwwgm5wifg"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Instance and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_interaction_ypu6gvtis5"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Interaction and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_interaction_attribute_27fplodbsi"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of InteractionAttribute and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_interpolated_lookup_5h3364dzyg"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of InterpolatedLookup and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_item_ref_document_diazbr6kr7"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of ItemRefDocument and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_item_ref_href_y6vu5zglaw"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of ItemRefHref and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_item_ref_href_5owozw4p3b"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of ItemRefHref and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_item_ref_target_qfpxsre3oh"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of ItemRefTarget and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_judged_placed_idref_s63g2ivjh7"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of JudgedPlacedIdref and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_label_use_ptej2oklny"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of LabelUse and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_label_use_cfjrl77akc"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of LabelUse and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_least_count_node_plvwlydgx4"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of LeastCountNode and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_least_one_apply_zvivkyf65i"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of LeastOneApply and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_least_two_apply_7tdqtdriqi"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of LeastTwoApply and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_link_reading_43ca43psco"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of LinkReading and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_listed_identifier_e6tdbtsydb"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of ListedIdentifier and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_listed_title_6qdujrsmh7"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of ListedTitle and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_mapping_base_type_5gksq6xyhp"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of MappingBaseType and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_math_action_i5xlj6scga"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of MathAction and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_math_align_scope_keb27yav7a"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of MathAlignScope and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_math_cell_oojoofvdxq"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of MathCell and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_math_cell_az6gobqb6e"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of MathCell and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_math_cn_ru54qeahfo"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of MathCn and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_math_rank_node_cqoxpqbsfy"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of MathRankNode and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_media_k7nuqbh2qv"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Media and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_media_y34gnxkhjp"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Media and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_named_m6wfz42dmz"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Named and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_named_item_ref_bhqjfbtax2"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of NamedItemRef and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_node_hbjvmcsmt4"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Node and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_node_7tgwfualgh"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Node and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_open_attribute_gzw76ltxgv"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of OpenAttribute and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_open_element_name_rwryoianel"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of OpenElementName and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_open_name_node_7fogxkti5b"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of OpenNameNode and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_pci_module_form_756anblqje"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of PciModuleForm and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_pci_module_form_pgh72d3ug6"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of PciModuleForm and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_pi_rfv5w2guki"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Pi and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_pi_ztggxw3qd5"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Pi and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_placed_binding_base_type_node_x5rssnghfx"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of PlacedBindingBaseTypeNode and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_placed_expression_w47ivsfs6d"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of PlacedExpression and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_placed_expression_node_a6rfrz2k4i"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of PlacedExpressionNode and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_placed_filter_xhcj2xtxkz"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of PlacedFilter and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_placed_id_c2uufkxhrw"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of PlacedId and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_placed_include_path_gwliciq7zk"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of PlacedIncludePath and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_placed_math_rank_node_m5o3znky3g"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of PlacedMathRankNode and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_placed_reference_vkjd6aywbt"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of PlacedReference and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_placed_reference_site_a3ra2nbbbr"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of PlacedReferenceSite and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_placed_test_reference_f5c3ltqwhl"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of PlacedTestReference and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_placed_variable_declaration_aslrklkhnl"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of PlacedVariableDeclaration and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_placed_weighted_variable_btz5j3xv3p"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of PlacedWeightedVariable and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_prefixed_declaration_jtga56khjq"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of PrefixedDeclaration and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_prefixed_map_response_nzjazuh6uy"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of PrefixedMapResponse and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_read_include_peugdeuyv2"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of ReadInclude and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_reference_wtp64ukddl"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Reference and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_reference_xh3cst2bxr"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Reference and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_reference_path_as2fb3dzko"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of ReferencePath and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_reference_path_dxjtp25zsb"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of ReferencePath and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_required_parts_fvfdsrd5kg"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of RequiredParts and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_required_ssml_property_bfx4ktqtdw"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of RequiredSsmlProperty and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_resolved_branch_rule_cuyut7acii"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of ResolvedBranchRule and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_resource_document_zf6habkcok"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of ResourceDocument and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_resource_href_2m6u3hqhgn"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of ResourceHref and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_resource_href_lwllourm5u"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of ResourceHref and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_resource_href_outside_rtaogt5ypt"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of ResourceHrefOutside and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_resource_href_outside_puyn3bghgt"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of ResourceHrefOutside and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_resource_href_path_px2wcnlwgo"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of ResourceHrefPath and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_resource_href_path_3ysbpwt6re"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of ResourceHrefPath and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_selection_without_replacement_kjkyty3nt6"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of SelectionWithoutReplacement and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_share_fragment_cjnsf4ql3r"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of ShareFragment and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_share_source_chl5wun7am"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of ShareSource and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_share_target_bm5dyz6buk"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of ShareTarget and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_site_ect3rb7jjf"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Site and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_site_path_3fr7p6njvc"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of SitePath and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_site_path_g7o4ekld2u"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of SitePath and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_site_target_swlyegyfiw"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of SiteTarget and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_srcset_lh5i4axxmr"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Srcset and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_srcset_xykb3yckmz"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of Srcset and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_srcset_candidate_lsg5oflsio"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of SrcsetCandidate and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_srcset_candidate_5kuns5ivoz"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of SrcsetCandidate and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_ssml_scope_node_wtm4tc2m3c"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of SsmlScopeNode and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_ssml_value_w5mfmrpgnk"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of SsmlValue and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_stimulus_ref_v26y2brjed"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of StimulusRef and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_structure_naming_7gobiqocta"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of StructureNaming and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_text_reference_ecxb2bxncg"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of TextReference and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_text_reference_ayzonoljhk"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of TextReference and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_text_reference_path_ajucpwxch4"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of TextReferencePath and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_text_reference_path_irf73jwdgt"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of TextReferencePath and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_typed_path_yj4ni6l5bz"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of TypedPath and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_unassembled_reference_j5e6et2uwd"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of UnassembledReference and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__judge_untargeted_item_ref_lq6zxgvfuf"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of UntargetedItemRef and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__sealed_assembled_document_5vm3i7wjyg"() IS 'seal guard of AssembledDocument under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_attribute_hhtohs3rgz"() IS 'seal guard of Attribute under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_attribute_entity_l3c47ylq3i"() IS 'seal guard of AttributeEntity under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_binding_name_i3sqhyl4gd"() IS 'seal guard of BindingName under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_bound_variable_bzrzj6hg3l"() IS 'seal guard of BoundVariable under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_candidate_path_3m3kwki5xz"() IS 'seal guard of CandidatePath under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_catalog_scope_wek4dfugtv"() IS 'seal guard of CatalogScope under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_cell_leaf_yoytyk3wcr"() IS 'seal guard of CellLeaf under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_choice_z37ptomsgz"() IS 'seal guard of Choice under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_choice_interaction_bijqqloc74"() IS 'seal guard of ChoiceInteraction under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_cn_part_text_umtyhqwf77"() IS 'seal guard of CnPartText under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_comment_6efmvwlix3"() IS 'seal guard of Comment under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_context_ref_mz7hv6abqh"() IS 'seal guard of ContextRef under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_count_bound_gg664uo4az"() IS 'seal guard of CountBound under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_data_ssml_jyzwpazui4"() IS 'seal guard of DataSsml under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_data_ssml_member_kk2n5cogya"() IS 'seal guard of DataSsmlMember under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_data_ssml_property_nrmqaxnf6p"() IS 'seal guard of DataSsmlProperty under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_doctype_qscyylqvnr"() IS 'seal guard of Doctype under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_document_vhkwz2yjp4"() IS 'seal guard of Document under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_document_id_jwusihk2qf"() IS 'seal guard of DocumentId under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_element_type_kl7sxgxveu"() IS 'seal guard of ElementType under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_encoding_decl_udkrf2rlo6"() IS 'seal guard of EncodingDecl under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_entry_pblz6jl6s3"() IS 'seal guard of Entry under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_expression_njnh5zdkco"() IS 'seal guard of Expression under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_feedback_ref_7b72d2hbku"() IS 'seal guard of FeedbackRef under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_file_tkjsjjabym"() IS 'seal guard of File under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_file_outside_xl7cmumwbn"() IS 'seal guard of FileOutside under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_file_path_weu6y65pdg"() IS 'seal guard of FilePath under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_fragment_context_name_rc4tlp3dfn"() IS 'seal guard of FragmentContextName under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_fragment_context_ref_nqsd3prcud"() IS 'seal guard of FragmentContextRef under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_fragment_feedback_name_bitj5qaw2e"() IS 'seal guard of FragmentFeedbackName under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_fragment_feedback_ref_obcj7ky6fe"() IS 'seal guard of FragmentFeedbackRef under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_fragment_printed_name_wnufcr2gfa"() IS 'seal guard of FragmentPrintedName under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_fragment_printed_ref_7ptgl7wcvc"() IS 'seal guard of FragmentPrintedRef under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_fragment_scope_temfh5dhit"() IS 'seal guard of FragmentScope under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_fragment_template_name_74eabbirja"() IS 'seal guard of FragmentTemplateName under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_fragment_template_ref_gizlhw6dvf"() IS 'seal guard of FragmentTemplateRef under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_hottext_t255ubqhhs"() IS 'seal guard of Hottext under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_identity_text_ztrwmiqpp4"() IS 'seal guard of IdentityText under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_idref_uaai4a4c3w"() IS 'seal guard of Idref under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_idref_target_jpivs7x2ck"() IS 'seal guard of IdrefTarget under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_inclusion_qvevoo5jix"() IS 'seal guard of Inclusion under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_instance_z6x7j2jzyw"() IS 'seal guard of Instance under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_interaction_2c47po7eyb"() IS 'seal guard of Interaction under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_interaction_attribute_zyvdtkj2m7"() IS 'seal guard of InteractionAttribute under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_item_mode_4mj3rmwt3v"() IS 'seal guard of ItemMode under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_item_ref_document_xhnbtgbolt"() IS 'seal guard of ItemRefDocument under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_item_ref_href_bwmt7xufwb"() IS 'seal guard of ItemRefHref under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_label_use_nqy2crr42l"() IS 'seal guard of LabelUse under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_least_count_7pdzwq4uiz"() IS 'seal guard of LeastCount under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_link_reading_jk2spghepn"() IS 'seal guard of LinkReading under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_literal_bnqwkftney"() IS 'seal guard of Literal under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_literal_typed_fwtgwhfeiz"() IS 'seal guard of LiteralTyped under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_math_action_p442mi5aum"() IS 'seal guard of MathAction under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_math_align_group_icxyehrqrc"() IS 'seal guard of MathAlignGroup under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_math_align_scope_36z3h6ackp"() IS 'seal guard of MathAlignScope under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_math_cell_vpqecdmor6"() IS 'seal guard of MathCell under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_math_cn_b3hstjsrrl"() IS 'seal guard of MathCn under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_math_rank_skhvkbtryh"() IS 'seal guard of MathRank under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_media_sby2i2ou7s"() IS 'seal guard of Media under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_most_count_qo2f3nhkah"() IS 'seal guard of MostCount under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_named_jrrltfvfff"() IS 'seal guard of Named under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_namespace_j4ppngrae6"() IS 'seal guard of Namespace under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_node_jkox6puyzv"() IS 'seal guard of Node under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_numbered_reading_3iv7dvronu"() IS 'seal guard of NumberedReading under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_open_attribute_yazhyix4mv"() IS 'seal guard of OpenAttribute under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_open_attribute_entity_5vhss4tj35"() IS 'seal guard of OpenAttributeEntity under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_open_element_name_kr4obytx6f"() IS 'seal guard of OpenElementName under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_open_element_type_6nlkbyk7ex"() IS 'seal guard of OpenElementType under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_package_xrwvwh75cj"() IS 'seal guard of Package under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_pci_module_form_myt4cjfuj4"() IS 'seal guard of PciModuleForm under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_pi_ll2umirsaw"() IS 'seal guard of Pi under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_placed_binding_asbyvvvyqc"() IS 'seal guard of PlacedBinding under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_placed_choice_5j4w3u75rp"() IS 'seal guard of PlacedChoice under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_placed_expression_kdq7or2kqi"() IS 'seal guard of PlacedExpression under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_placed_hottext_hgusp4bgln"() IS 'seal guard of PlacedHottext under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_placed_id_rhwdr5g2o4"() IS 'seal guard of PlacedId under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_placed_idref_e2vqf4lryz"() IS 'seal guard of PlacedIdref under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_placed_math_rank_pjvl4fdsxf"() IS 'seal guard of PlacedMathRank under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_placed_share_target_uovzxnavbx"() IS 'seal guard of PlacedShareTarget under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_placed_variable_ref_xiezoplh7d"() IS 'seal guard of PlacedVariableRef under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_printed_variable_ref_nywqtwczqu"() IS 'seal guard of PrintedVariableRef under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_processing_vmyiqx6zw6"() IS 'seal guard of Processing under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_reference_sjbbfqqmeb"() IS 'seal guard of Reference under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_reference_path_lb5zcmswuw"() IS 'seal guard of ReferencePath under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_referring_document_75ywvpiwz4"() IS 'seal guard of ReferringDocument under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_resource_document_xv46tehvpp"() IS 'seal guard of ResourceDocument under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_resource_href_h73txvfj7o"() IS 'seal guard of ResourceHref under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_resource_href_outside_u6xpkqlmnb"() IS 'seal guard of ResourceHrefOutside under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_resource_href_path_rmowgp2se6"() IS 'seal guard of ResourceHrefPath under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_sd_decl_chhtyyvdzo"() IS 'seal guard of SdDecl under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_share_fragment_x5vpyf3pmo"() IS 'seal guard of ShareFragment under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_share_target_evdfbj7nke"() IS 'seal guard of ShareTarget under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_site_adj7hpfyrc"() IS 'seal guard of Site under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_site_path_pjy6i5aehs"() IS 'seal guard of SitePath under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_site_target_agegnftmen"() IS 'seal guard of SiteTarget under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_srcset_tv2c6xz7m2"() IS 'seal guard of Srcset under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_srcset_candidate_7c7a7pyhdu"() IS 'seal guard of SrcsetCandidate under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_ssml_scope_hsebupdiso"() IS 'seal guard of SsmlScope under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_stimulus_ref_3co743o3dl"() IS 'seal guard of StimulusRef under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_template_ref_6ydkgivfuv"() IS 'seal guard of TemplateRef under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_text_idref_aw3plkv2pf"() IS 'seal guard of TextIdref under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_text_reference_dyor7mriki"() IS 'seal guard of TextReference under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_text_reference_path_rcwk7zv7jh"() IS 'seal guard of TextReferencePath under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_variable_ref_4p2ka2foyk"() IS 'seal guard of VariableRef under unit Package';

COMMENT ON FUNCTION "qti"."__sealed_xml_decl_vftet4cgcp"() IS 'seal guard of XmlDecl under unit Package';

COMMENT ON FUNCTION "qti"."__upkeep_anchored_id_dgmcvcjz6k"() IS 'the rule judge''s upkeep of stored relation AnchoredId';

COMMENT ON FUNCTION "qti"."__upkeep_anchored_name_zqga6xvscv"() IS 'the rule judge''s upkeep of stored relation AnchoredName';

COMMENT ON FUNCTION "qti"."__upkeep_apply_argument_hotdcdn27e"() IS 'the rule judge''s upkeep of stored relation ApplyArgument';

COMMENT ON FUNCTION "qti"."__upkeep_apply_argument_pair_ifwmo75bsc"() IS 'the rule judge''s upkeep of stored relation ApplyArgumentPair';

COMMENT ON FUNCTION "qti"."__upkeep_area_mapping_base_type_ltjy2tpxhf"() IS 'the rule judge''s upkeep of stored relation AreaMappingBaseType';

COMMENT ON FUNCTION "qti"."__upkeep_area_mapping_cardinality_3kil3wap6r"() IS 'the rule judge''s upkeep of stored relation AreaMappingCardinality';

COMMENT ON FUNCTION "qti"."__upkeep_aria_bounds_r74k267cnp"() IS 'the rule judge''s upkeep of stored relation AriaBounds';

COMMENT ON FUNCTION "qti"."__upkeep_arity_floor_iucuw3noid"() IS 'the rule judge''s upkeep of stored relation ArityFloor';

COMMENT ON FUNCTION "qti"."__upkeep_assembled_catalog_adoubyawsw"() IS 'the rule judge''s upkeep of stored relation AssembledCatalog';

COMMENT ON FUNCTION "qti"."__judge_catalog_id_75t4kfupri"("pg_catalog"."text"[]) IS 'the upkeep of the stored relations over the deltas of CatalogId and the relations they read beside it';

COMMENT ON FUNCTION "qti"."__upkeep_assembled_id_bb3fnz3p5y"() IS 'the rule judge''s upkeep of stored relation AssembledId';

COMMENT ON FUNCTION "qti"."__upkeep_assembled_name_3cvebcmo6y"() IS 'the rule judge''s upkeep of stored relation AssembledName';

COMMENT ON FUNCTION "qti"."__upkeep_assembled_replaceable_idwbt54nin"() IS 'the rule judge''s upkeep of stored relation AssembledReplaceable';

COMMENT ON FUNCTION "qti"."__upkeep_bank_member_v7kqnnucmf"() IS 'the rule judge''s upkeep of stored relation BankMember';

COMMENT ON FUNCTION "qti"."__upkeep_base_type_cardinality_jbfneco2uo"() IS 'the rule judge''s upkeep of stored relation BaseTypeCardinality';

COMMENT ON FUNCTION "qti"."__upkeep_binary_math_operator_ncgl2digzh"() IS 'the rule judge''s upkeep of stored relation BinaryMathOperator';

COMMENT ON FUNCTION "qti"."__upkeep_binding_base_type_node_pkltun7bea"() IS 'the rule judge''s upkeep of stored relation BindingBaseTypeNode';

COMMENT ON FUNCTION "qti"."__upkeep_binding_cardinality_node_yom5i7uzhn"() IS 'the rule judge''s upkeep of stored relation BindingCardinalityNode';

COMMENT ON FUNCTION "qti"."__upkeep_bound_range_abumo445es"() IS 'the rule judge''s upkeep of stored relation BoundRange';

COMMENT ON FUNCTION "qti"."__upkeep_bounded_selection_54c3jy6o2g"() IS 'the rule judge''s upkeep of stored relation BoundedSelection';

COMMENT ON FUNCTION "qti"."__upkeep_branch_resolution_p477koxejn"() IS 'the rule judge''s upkeep of stored relation BranchResolution';

COMMENT ON FUNCTION "qti"."__upkeep_catalog_id_mg7yelk5qj"() IS 'the rule judge''s upkeep of stored relation CatalogId';

COMMENT ON FUNCTION "qti"."__upkeep_catalog_scope_node_2ak3drocl6"() IS 'the rule judge''s upkeep of stored relation CatalogScopeNode';

COMMENT ON FUNCTION "qti"."__upkeep_cell_child_cezqrjqpta"() IS 'the rule judge''s upkeep of stored relation CellChild';

COMMENT ON FUNCTION "qti"."__upkeep_cell_leaf_node_exnm237xb5"() IS 'the rule judge''s upkeep of stored relation CellLeafNode';

COMMENT ON FUNCTION "qti"."__upkeep_cell_table_znmpup4j4g"() IS 'the rule judge''s upkeep of stored relation CellTable';

COMMENT ON FUNCTION "qti"."__upkeep_cell_token_e3odu2wkmy"() IS 'the rule judge''s upkeep of stored relation CellToken';

COMMENT ON FUNCTION "qti"."__upkeep_choice_node_j2g7gbqchu"() IS 'the rule judge''s upkeep of stored relation ChoiceNode';

COMMENT ON FUNCTION "qti"."__upkeep_choice_or_hottext_qxtncztlr4"() IS 'the rule judge''s upkeep of stored relation ChoiceOrHottext';

COMMENT ON FUNCTION "qti"."__upkeep_choice_space_name_zwhgugnw7i"() IS 'the rule judge''s upkeep of stored relation ChoiceSpaceName';

COMMENT ON FUNCTION "qti"."__upkeep_cn_count_c5mv32btxc"() IS 'the rule judge''s upkeep of stored relation CnCount';

COMMENT ON FUNCTION "qti"."__upkeep_copied_id_i47lvpiebz"() IS 'the rule judge''s upkeep of stored relation CopiedId';

COMMENT ON FUNCTION "qti"."__upkeep_count_bound_node_5sc2q7r7bi"() IS 'the rule judge''s upkeep of stored relation CountBoundNode';

COMMENT ON FUNCTION "qti"."__upkeep_declaration_base_type_j62z54xj7b"() IS 'the rule judge''s upkeep of stored relation DeclarationBaseType';

COMMENT ON FUNCTION "qti"."__upkeep_declaration_cardinality_4ikt4z3drr"() IS 'the rule judge''s upkeep of stored relation DeclarationCardinality';

COMMENT ON FUNCTION "qti"."__upkeep_declaration_name_i5umwy3va3"() IS 'the rule judge''s upkeep of stored relation DeclarationName';

COMMENT ON FUNCTION "qti"."__upkeep_declaration_table_w5mmkhe6r5"() IS 'the rule judge''s upkeep of stored relation DeclarationTable';

COMMENT ON FUNCTION "qti"."__upkeep_declared_identifier_text_ii52ruiix7"() IS 'the rule judge''s upkeep of stored relation DeclaredIdentifierText';

COMMENT ON FUNCTION "qti"."__upkeep_declared_placement_3xgpon7vl3"() IS 'the rule judge''s upkeep of stored relation DeclaredPlacement';

COMMENT ON FUNCTION "qti"."__upkeep_deliverable_test_njxf7thcfc"() IS 'the rule judge''s upkeep of stored relation DeliverableTest';

COMMENT ON FUNCTION "qti"."__upkeep_dependency_3i2sxexxxj"() IS 'the rule judge''s upkeep of stored relation Dependency';

COMMENT ON FUNCTION "qti"."__upkeep_dependency_resolved_ucy2owoqnn"() IS 'the rule judge''s upkeep of stored relation DependencyResolved';

COMMENT ON FUNCTION "qti"."__upkeep_described_assembled_lang_mq7nmioub7"() IS 'the rule judge''s upkeep of stored relation DescribedAssembledLang';

COMMENT ON FUNCTION "qti"."__upkeep_described_lang_ftwvkm2csd"() IS 'the rule judge''s upkeep of stored relation DescribedLang';

COMMENT ON FUNCTION "qti"."__upkeep_entry_file_target_dtb3uiex5f"() IS 'the rule judge''s upkeep of stored relation EntryFileTarget';

COMMENT ON FUNCTION "qti"."__upkeep_expression_attribute_3xdvzecvka"() IS 'the rule judge''s upkeep of stored relation ExpressionAttribute';

COMMENT ON FUNCTION "qti"."__upkeep_expression_node_mqf4f5l3k3"() IS 'the rule judge''s upkeep of stored relation ExpressionNode';

COMMENT ON FUNCTION "qti"."__upkeep_expression_operand_ywycvuteyw"() IS 'the rule judge''s upkeep of stored relation ExpressionOperand';

COMMENT ON FUNCTION "qti"."__upkeep_feedback_ref_base_type_moacidelyg"() IS 'the rule judge''s upkeep of stored relation FeedbackRefBaseType';

COMMENT ON FUNCTION "qti"."__upkeep_feedback_ref_cardinality_cy6ymwunjm"() IS 'the rule judge''s upkeep of stored relation FeedbackRefCardinality';

COMMENT ON FUNCTION "qti"."__upkeep_field_value_text_kz4jhfh4o4"() IS 'the rule judge''s upkeep of stored relation FieldValueText';

COMMENT ON FUNCTION "qti"."__upkeep_filtered_section_rzgs7a6iix"() IS 'the rule judge''s upkeep of stored relation FilteredSection';

COMMENT ON FUNCTION "qti"."__upkeep_forbidden_resource_type_5z2yayalbo"() IS 'the rule judge''s upkeep of stored relation ForbiddenResourceType';

COMMENT ON FUNCTION "qti"."__upkeep_forward_branch_rule_v22lerhpom"() IS 'the rule judge''s upkeep of stored relation ForwardBranchRule';

COMMENT ON FUNCTION "qti"."__upkeep_free_mapping_target_yzb3kwkg6w"() IS 'the rule judge''s upkeep of stored relation FreeMappingTarget';

COMMENT ON FUNCTION "qti"."__upkeep_head_document_loo5dgvhco"() IS 'the rule judge''s upkeep of stored relation HeadDocument';

COMMENT ON FUNCTION "qti"."__upkeep_head_qualifier_pair_xdchtzyoct"() IS 'the rule judge''s upkeep of stored relation HeadQualifierPair';

COMMENT ON FUNCTION "qti"."__upkeep_header_token_xgrioqwbze"() IS 'the rule judge''s upkeep of stored relation HeaderToken';

COMMENT ON FUNCTION "qti"."__upkeep_held_type_y2fy2kfeng"() IS 'the rule judge''s upkeep of stored relation HeldType';

COMMENT ON FUNCTION "qti"."__upkeep_hotspot_node_updfm4ect2"() IS 'the rule judge''s upkeep of stored relation HotspotNode';

COMMENT ON FUNCTION "qti"."__upkeep_hottext_node_mt47u475zz"() IS 'the rule judge''s upkeep of stored relation HottextNode';

COMMENT ON FUNCTION "qti"."__upkeep_id_binding_trzx7l7ig5"() IS 'the rule judge''s upkeep of stored relation IdBinding';

COMMENT ON FUNCTION "qti"."__judge_id_value_sl7yxdpus5"("pg_catalog"."text"[]) IS 'the upkeep of the stored relations over the deltas of IdValue and the relations they read beside it';

COMMENT ON FUNCTION "qti"."__upkeep_id_value_3v3apkmojf"() IS 'the rule judge''s upkeep of stored relation IdValue';

COMMENT ON FUNCTION "qti"."__upkeep_identity_text_node_ucrsv6mgef"() IS 'the rule judge''s upkeep of stored relation IdentityTextNode';

COMMENT ON FUNCTION "qti"."__upkeep_instance_document_imfh24ejca"() IS 'the rule judge''s upkeep of stored relation InstanceDocument';

COMMENT ON FUNCTION "qti"."__upkeep_integer_aggregate_7nzzhnmvgq"() IS 'the rule judge''s upkeep of stored relation IntegerAggregate';

COMMENT ON FUNCTION "qti"."__upkeep_interaction_node_ngxwy2ysvq"() IS 'the rule judge''s upkeep of stored relation InteractionNode';

COMMENT ON FUNCTION "qti"."__upkeep_interpolated_lookup_uhebiqk2ui"() IS 'the rule judge''s upkeep of stored relation InterpolatedLookup';

COMMENT ON FUNCTION "qti"."__upkeep_item_mapping_3uc6qayscf"() IS 'the rule judge''s upkeep of stored relation ItemMapping';

COMMENT ON FUNCTION "qti"."__upkeep_item_read_h5wuw65f4q"() IS 'the rule judge''s upkeep of stored relation ItemRead';

COMMENT ON FUNCTION "qti"."__upkeep_item_ref_category_ucrukbjjrv"() IS 'the rule judge''s upkeep of stored relation ItemRefCategory';

COMMENT ON FUNCTION "qti"."__upkeep_item_ref_section_b3mjgpv6ee"() IS 'the rule judge''s upkeep of stored relation ItemRefSection';

COMMENT ON FUNCTION "qti"."__upkeep_item_ref_table_znxqic4c3n"() IS 'the rule judge''s upkeep of stored relation ItemRefTable';

COMMENT ON FUNCTION "qti"."__upkeep_item_ref_target_fjw7nlq4a7"() IS 'the rule judge''s upkeep of stored relation ItemRefTarget';

COMMENT ON FUNCTION "qti"."__upkeep_item_scoped_reading_2zxmvhgis5"() IS 'the rule judge''s upkeep of stored relation ItemScopedReading';

COMMENT ON FUNCTION "qti"."__upkeep_item_template_default_oc3upptrh7"() IS 'the rule judge''s upkeep of stored relation ItemTemplateDefault';

COMMENT ON FUNCTION "qti"."__upkeep_judged_placed_idref_3njphoyhge"() IS 'the rule judge''s upkeep of stored relation JudgedPlacedIdref';

COMMENT ON FUNCTION "qti"."__upkeep_known_operand_base_g7abynne54"() IS 'the rule judge''s upkeep of stored relation KnownOperandBase';

COMMENT ON FUNCTION "qti"."__upkeep_known_operand_cardinality_xgdbghowld"() IS 'the rule judge''s upkeep of stored relation KnownOperandCardinality';

COMMENT ON FUNCTION "qti"."__upkeep_lang_value_s65zgb3dhx"() IS 'the rule judge''s upkeep of stored relation LangValue';

COMMENT ON FUNCTION "qti"."__upkeep_late_submission_or4xxpqdtd"() IS 'the rule judge''s upkeep of stored relation LateSubmission';

COMMENT ON FUNCTION "qti"."__upkeep_least_choice_bound_jzmxv7xvlr"() IS 'the rule judge''s upkeep of stored relation LeastChoiceBound';

COMMENT ON FUNCTION "qti"."__upkeep_least_count_node_qbl76nq6ku"() IS 'the rule judge''s upkeep of stored relation LeastCountNode';

COMMENT ON FUNCTION "qti"."__upkeep_least_one_apply_mdrny3wcxu"() IS 'the rule judge''s upkeep of stored relation LeastOneApply';

COMMENT ON FUNCTION "qti"."__upkeep_least_two_apply_q5ysy3res6"() IS 'the rule judge''s upkeep of stored relation LeastTwoApply';

COMMENT ON FUNCTION "qti"."__upkeep_link_scope_gmpoia4run"() IS 'the rule judge''s upkeep of stored relation LinkScope';

COMMENT ON FUNCTION "qti"."__upkeep_link_spelling_jjx45sy5dz"() IS 'the rule judge''s upkeep of stored relation LinkSpelling';

COMMENT ON FUNCTION "qti"."__upkeep_listed_identifier_yk4kqfpkvm"() IS 'the rule judge''s upkeep of stored relation ListedIdentifier';

COMMENT ON FUNCTION "qti"."__upkeep_listed_lang_bge5k3rm22"() IS 'the rule judge''s upkeep of stored relation ListedLang';

COMMENT ON FUNCTION "qti"."__upkeep_listed_title_3d5hnwiw5n"() IS 'the rule judge''s upkeep of stored relation ListedTitle';

COMMENT ON FUNCTION "qti"."__upkeep_located_template_eufqgrucbi"() IS 'the rule judge''s upkeep of stored relation LocatedTemplate';

COMMENT ON FUNCTION "qti"."__upkeep_lookup_table_cardinality_ee2hkb5sds"() IS 'the rule judge''s upkeep of stored relation LookupTableCardinality';

COMMENT ON FUNCTION "qti"."__upkeep_lookup_value_ymqqobvkod"() IS 'the rule judge''s upkeep of stored relation LookupValue';

COMMENT ON FUNCTION "qti"."__upkeep_lookup_value_type_45n737bc74"() IS 'the rule judge''s upkeep of stored relation LookupValueType';

COMMENT ON FUNCTION "qti"."__upkeep_map_key_hrxugqwdhq"() IS 'the rule judge''s upkeep of stored relation MapKey';

COMMENT ON FUNCTION "qti"."__upkeep_map_key_type_n7juprukzi"() IS 'the rule judge''s upkeep of stored relation MapKeyType';

COMMENT ON FUNCTION "qti"."__upkeep_mapped_response_declaration_qjtfsqgrdj"() IS 'the rule judge''s upkeep of stored relation MappedResponseDeclaration';

COMMENT ON FUNCTION "qti"."__upkeep_mapping_base_type_5svmcwwmhj"() IS 'the rule judge''s upkeep of stored relation MappingBaseType';

COMMENT ON FUNCTION "qti"."__upkeep_mapping_cardinality_2r7gesnw6x"() IS 'the rule judge''s upkeep of stored relation MappingCardinality';

COMMENT ON FUNCTION "qti"."__upkeep_mastery_ceiling_l6dx3w3bkf"() IS 'the rule judge''s upkeep of stored relation MasteryCeiling';

COMMENT ON FUNCTION "qti"."__upkeep_mastery_floor_wxofdakx73"() IS 'the rule judge''s upkeep of stored relation MasteryFloor';

COMMENT ON FUNCTION "qti"."__judge_mastery_value_dtuvt4fbee"("pg_catalog"."text"[]) IS 'the upkeep of the stored relations over the deltas of MasteryValue and the relations they read beside it';

COMMENT ON FUNCTION "qti"."__upkeep_mastery_value_zjjxnkf4xm"() IS 'the rule judge''s upkeep of stored relation MasteryValue';

COMMENT ON FUNCTION "qti"."__upkeep_matched_identifier_clh3ypmaqp"() IS 'the rule judge''s upkeep of stored relation MatchedIdentifier';

COMMENT ON FUNCTION "qti"."__upkeep_matched_title_gsca3je3kp"() IS 'the rule judge''s upkeep of stored relation MatchedTitle';

COMMENT ON FUNCTION "qti"."__upkeep_math_action_node_yolnpfyzjn"() IS 'the rule judge''s upkeep of stored relation MathActionNode';

COMMENT ON FUNCTION "qti"."__upkeep_math_operand_tseboa5ekj"() IS 'the rule judge''s upkeep of stored relation MathOperand';

COMMENT ON FUNCTION "qti"."__upkeep_math_rank_node_6p23337yez"() IS 'the rule judge''s upkeep of stored relation MathRankNode';

COMMENT ON FUNCTION "qti"."__upkeep_math_rank_step_gdr2qn5s5w"() IS 'the rule judge''s upkeep of stored relation MathRankStep';

COMMENT ON FUNCTION "qti"."__upkeep_max_attempts_klpnnrvy4q"() IS 'the rule judge''s upkeep of stored relation MaxAttempts';

COMMENT ON FUNCTION "qti"."__upkeep_max_time_uhjn7rhr3q"() IS 'the rule judge''s upkeep of stored relation MaxTime';

COMMENT ON FUNCTION "qti"."__upkeep_min_time_whonsdonje"() IS 'the rule judge''s upkeep of stored relation MinTime';

COMMENT ON FUNCTION "qti"."__upkeep_most_choice_bound_zeigpfmfoz"() IS 'the rule judge''s upkeep of stored relation MostChoiceBound';

COMMENT ON FUNCTION "qti"."__upkeep_most_count_node_2jf7ypa2lg"() IS 'the rule judge''s upkeep of stored relation MostCountNode';

COMMENT ON FUNCTION "qti"."__upkeep_most_one_argument_wwafyxz6gr"() IS 'the rule judge''s upkeep of stored relation MostOneArgument';

COMMENT ON FUNCTION "qti"."__upkeep_most_two_argument_pair_wspxw7aut2"() IS 'the rule judge''s upkeep of stored relation MostTwoArgumentPair';

COMMENT ON FUNCTION "qti"."__upkeep_named_declaration_dk2yfh3u6s"() IS 'the rule judge''s upkeep of stored relation NamedDeclaration';

COMMENT ON FUNCTION "qti"."__upkeep_named_item_ref_6flthqy4kr"() IS 'the rule judge''s upkeep of stored relation NamedItemRef';

COMMENT ON FUNCTION "qti"."__upkeep_non_container_strings_ei6ufbm7ft"() IS 'the rule judge''s upkeep of stored relation NonContainerStrings';

COMMENT ON FUNCTION "qti"."__upkeep_normal_maximum_pfreeuvtde"() IS 'the rule judge''s upkeep of stored relation NormalMaximum';

COMMENT ON FUNCTION "qti"."__upkeep_normal_minimum_o5nv7qivbf"() IS 'the rule judge''s upkeep of stored relation NormalMinimum';

COMMENT ON FUNCTION "qti"."__upkeep_numbered_spelling_vlnlocqour"() IS 'the rule judge''s upkeep of stored relation NumberedSpelling';

COMMENT ON FUNCTION "qti"."__upkeep_numbered_target_numhfupcev"() IS 'the rule judge''s upkeep of stored relation NumberedTarget';

COMMENT ON FUNCTION "qti"."__upkeep_object_identifier_q5jaihrdcb"() IS 'the rule judge''s upkeep of stored relation ObjectIdentifier';

COMMENT ON FUNCTION "qti"."__upkeep_one_tail_cardinality_hhkw624zd4"() IS 'the rule judge''s upkeep of stored relation OneTailCardinality';

COMMENT ON FUNCTION "qti"."__upkeep_open_name_node_j4xwhwiax3"() IS 'the rule judge''s upkeep of stored relation OpenNameNode';

COMMENT ON FUNCTION "qti"."__upkeep_open_name_under_foreign_x3z45vluei"() IS 'the rule judge''s upkeep of stored relation OpenNameUnderForeign';

COMMENT ON FUNCTION "qti"."__upkeep_open_type_node_hvwoskyn7g"() IS 'the rule judge''s upkeep of stored relation OpenTypeNode';

COMMENT ON FUNCTION "qti"."__upkeep_open_type_under_foreign_idjzyja2z5"() IS 'the rule judge''s upkeep of stored relation OpenTypeUnderForeign';

COMMENT ON FUNCTION "qti"."__upkeep_operand_of_s3bexjayu6"() IS 'the rule judge''s upkeep of stored relation OperandOf';

COMMENT ON FUNCTION "qti"."__upkeep_other_vocabulary_type_vmuqu67gor"() IS 'the rule judge''s upkeep of stored relation OtherVocabularyType';

COMMENT ON FUNCTION "qti"."__upkeep_packaged_template_default_5vyt3itxoj"() IS 'the rule judge''s upkeep of stored relation PackagedTemplateDefault';

COMMENT ON FUNCTION "qti"."__upkeep_pattern_text_nhmx2o57co"() IS 'the rule judge''s upkeep of stored relation PatternText';

COMMENT ON FUNCTION "qti"."__upkeep_placed_binding_base_type_node_cad7mwjpgb"() IS 'the rule judge''s upkeep of stored relation PlacedBindingBaseTypeNode';

COMMENT ON FUNCTION "qti"."__upkeep_placed_binding_cardinality_node_rvlqyraf6k"() IS 'the rule judge''s upkeep of stored relation PlacedBindingCardinalityNode';

COMMENT ON FUNCTION "qti"."__upkeep_placed_choice_or_hottext_udmlndrgyw"() IS 'the rule judge''s upkeep of stored relation PlacedChoiceOrHottext';

COMMENT ON FUNCTION "qti"."__upkeep_placed_choice_space_name_v2jamp47d4"() IS 'the rule judge''s upkeep of stored relation PlacedChoiceSpaceName';

COMMENT ON FUNCTION "qti"."__upkeep_placed_expression_node_olslnelwp2"() IS 'the rule judge''s upkeep of stored relation PlacedExpressionNode';

COMMENT ON FUNCTION "qti"."__upkeep_placed_expression_site_3sfbs5t3yw"() IS 'the rule judge''s upkeep of stored relation PlacedExpressionSite';

COMMENT ON FUNCTION "qti"."__upkeep_placed_filter_fy5ifffh3b"() IS 'the rule judge''s upkeep of stored relation PlacedFilter';

COMMENT ON FUNCTION "qti"."__upkeep_placed_include_path_ajbm4wpprb"() IS 'the rule judge''s upkeep of stored relation PlacedIncludePath';

COMMENT ON FUNCTION "qti"."__upkeep_placed_math_rank_node_od2k6fsfwq"() IS 'the rule judge''s upkeep of stored relation PlacedMathRankNode';

COMMENT ON FUNCTION "qti"."__upkeep_placed_math_rank_step_aqeusrnpi7"() IS 'the rule judge''s upkeep of stored relation PlacedMathRankStep';

COMMENT ON FUNCTION "qti"."__upkeep_placed_reference_shgjltp6y5"() IS 'the rule judge''s upkeep of stored relation PlacedReference';

COMMENT ON FUNCTION "qti"."__upkeep_placed_reference_site_h4v7kjwmde"() IS 'the rule judge''s upkeep of stored relation PlacedReferenceSite';

COMMENT ON FUNCTION "qti"."__upkeep_placed_share_ranks_weuerac3wd"() IS 'the rule judge''s upkeep of stored relation PlacedShareRanks';

COMMENT ON FUNCTION "qti"."__upkeep_placed_single_binding_most_d5lycofj55"() IS 'the rule judge''s upkeep of stored relation PlacedSingleBindingMost';

COMMENT ON FUNCTION "qti"."__upkeep_placed_single_response_gap_demaw4u3jp"() IS 'the rule judge''s upkeep of stored relation PlacedSingleResponseGap';

COMMENT ON FUNCTION "qti"."__upkeep_placed_test_reference_sz6ugichon"() IS 'the rule judge''s upkeep of stored relation PlacedTestReference';

COMMENT ON FUNCTION "qti"."__upkeep_placed_variable_base_t5fswvkjis"() IS 'the rule judge''s upkeep of stored relation PlacedVariableBase';

COMMENT ON FUNCTION "qti"."__upkeep_placed_variable_cardinality_6mbvwpv5n6"() IS 'the rule judge''s upkeep of stored relation PlacedVariableCardinality';

COMMENT ON FUNCTION "qti"."__upkeep_placed_variable_declaration_y65lpov3uj"() IS 'the rule judge''s upkeep of stored relation PlacedVariableDeclaration';

COMMENT ON FUNCTION "qti"."__upkeep_placed_variable_ref_declaration_dcisxq3flo"() IS 'the rule judge''s upkeep of stored relation PlacedVariableRefDeclaration';

COMMENT ON FUNCTION "qti"."__upkeep_placed_variable_ref_node_hqdi36di5s"() IS 'the rule judge''s upkeep of stored relation PlacedVariableRefNode';

COMMENT ON FUNCTION "qti"."__upkeep_placed_weighted_variable_r2othrmsov"() IS 'the rule judge''s upkeep of stored relation PlacedWeightedVariable';

COMMENT ON FUNCTION "qti"."__upkeep_pointer_parse_egecxsy3h5"() IS 'the rule judge''s upkeep of stored relation PointerParse';

COMMENT ON FUNCTION "qti"."__upkeep_prefixed_declaration_lrk573bfyz"() IS 'the rule judge''s upkeep of stored relation PrefixedDeclaration';

COMMENT ON FUNCTION "qti"."__upkeep_prefixed_map_response_jjmizvx5lg"() IS 'the rule judge''s upkeep of stored relation PrefixedMapResponse';

COMMENT ON FUNCTION "qti"."__upkeep_prefixed_map_response_point_jdxiamlxqb"() IS 'the rule judge''s upkeep of stored relation PrefixedMapResponsePoint';

COMMENT ON FUNCTION "qti"."__upkeep_printed_integer_base_type_bb277rakbd"() IS 'the rule judge''s upkeep of stored relation PrintedIntegerBaseType';

COMMENT ON FUNCTION "qti"."__upkeep_printed_integer_cardinality_i6425ocfkt"() IS 'the rule judge''s upkeep of stored relation PrintedIntegerCardinality';

COMMENT ON FUNCTION "qti"."__upkeep_processing_node_bdpef5t2yd"() IS 'the rule judge''s upkeep of stored relation ProcessingNode';

COMMENT ON FUNCTION "qti"."__upkeep_quotation_end_25g7s3eqad"() IS 'the rule judge''s upkeep of stored relation QuotationEnd';

COMMENT ON FUNCTION "qti"."__upkeep_read_include_znyihwwijs"() IS 'the rule judge''s upkeep of stored relation ReadInclude';

COMMENT ON FUNCTION "qti"."__upkeep_record_node_b2wx7b6vcq"() IS 'the rule judge''s upkeep of stored relation RecordNode';

COMMENT ON FUNCTION "qti"."__upkeep_record_set_value_5xden7omjo"() IS 'the rule judge''s upkeep of stored relation RecordSetValue';

COMMENT ON FUNCTION "qti"."__upkeep_referable_name_ybgjs5qp6m"() IS 'the rule judge''s upkeep of stored relation ReferableName';

COMMENT ON FUNCTION "qti"."__upkeep_reference_lexical_kh6grwudgf"() IS 'the rule judge''s upkeep of stored relation ReferenceLexical';

COMMENT ON FUNCTION "qti"."__upkeep_required_parts_2tlihrlv5u"() IS 'the rule judge''s upkeep of stored relation RequiredParts';

COMMENT ON FUNCTION "qti"."__upkeep_required_ssml_property_fjgezfslam"() IS 'the rule judge''s upkeep of stored relation RequiredSsmlProperty';

COMMENT ON FUNCTION "qti"."__judge_data_ssml_member_pb7f4hv5wr"("pg_catalog"."text"[]) IS 'the upkeep of the stored relations over the deltas of DataSsmlMember and the relations they read beside it';

COMMENT ON FUNCTION "qti"."__upkeep_requirement_met_ob2u65dt4r"() IS 'the rule judge''s upkeep of stored relation RequirementMet';

COMMENT ON FUNCTION "qti"."__upkeep_resolved_branch_rule_x4suiqw6b3"() IS 'the rule judge''s upkeep of stored relation ResolvedBranchRule';

COMMENT ON FUNCTION "qti"."__upkeep_resource_file_document_us67yw76uz"() IS 'the rule judge''s upkeep of stored relation ResourceFileDocument';

COMMENT ON FUNCTION "qti"."__upkeep_resource_file_outside_3emfd2cqzm"() IS 'the rule judge''s upkeep of stored relation ResourceFileOutside';

COMMENT ON FUNCTION "qti"."__upkeep_resource_file_path_mrz4culrpf"() IS 'the rule judge''s upkeep of stored relation ResourceFilePath';

COMMENT ON FUNCTION "qti"."__upkeep_rooted_declaration_brggi7jah6"() IS 'the rule judge''s upkeep of stored relation RootedDeclaration';

COMMENT ON FUNCTION "qti"."__upkeep_scope_duration_read_jchsy3lg3b"() IS 'the rule judge''s upkeep of stored relation ScopeDurationRead';

COMMENT ON FUNCTION "qti"."__upkeep_scope_node_g7mpoxbj3i"() IS 'the rule judge''s upkeep of stored relation ScopeNode';

COMMENT ON FUNCTION "qti"."__upkeep_scoped_dir_hta5o2zf2r"() IS 'the rule judge''s upkeep of stored relation ScopedDir';

COMMENT ON FUNCTION "qti"."__upkeep_section_replacement_3pxhmq53p6"() IS 'the rule judge''s upkeep of stored relation SectionReplacement';

COMMENT ON FUNCTION "qti"."__upkeep_section_selection_v6ys644ig6"() IS 'the rule judge''s upkeep of stored relation SectionSelection';

COMMENT ON FUNCTION "qti"."__upkeep_section_shuffle_ozcy2jiflf"() IS 'the rule judge''s upkeep of stored relation SectionShuffle';

COMMENT ON FUNCTION "qti"."__upkeep_selection_without_replacement_zigi5fkvwd"() IS 'the rule judge''s upkeep of stored relation SelectionWithoutReplacement';

COMMENT ON FUNCTION "qti"."__upkeep_session_control_ruxcs5ynyi"() IS 'the rule judge''s upkeep of stored relation SessionControl';

COMMENT ON FUNCTION "qti"."__upkeep_set_cardinality_4ecllywod2"() IS 'the rule judge''s upkeep of stored relation SetCardinality';

COMMENT ON FUNCTION "qti"."__upkeep_set_field_name_fkke7wsqnz"() IS 'the rule judge''s upkeep of stored relation SetFieldName';

COMMENT ON FUNCTION "qti"."__upkeep_share_fragment_value_2duttm3ynp"() IS 'the rule judge''s upkeep of stored relation ShareFragmentValue';

COMMENT ON FUNCTION "qti"."__upkeep_share_ranks_tl3xjrdvrw"() IS 'the rule judge''s upkeep of stored relation ShareRanks';

COMMENT ON FUNCTION "qti"."__upkeep_share_source_urcqrvf3bn"() IS 'the rule judge''s upkeep of stored relation ShareSource';

COMMENT ON FUNCTION "qti"."__upkeep_single_binding_most_mcwhkp3pzf"() IS 'the rule judge''s upkeep of stored relation SingleBindingMost';

COMMENT ON FUNCTION "qti"."__upkeep_single_response_gap_mgkctg4tjr"() IS 'the rule judge''s upkeep of stored relation SingleResponseGap';

COMMENT ON FUNCTION "qti"."__upkeep_slider_bounds_46akffhh3a"() IS 'the rule judge''s upkeep of stored relation SliderBounds';

COMMENT ON FUNCTION "qti"."__upkeep_sole_reading_epiwhwasdy"() IS 'the rule judge''s upkeep of stored relation SoleReading';

COMMENT ON FUNCTION "qti"."__upkeep_srcset_form_zyrnz2dadu"() IS 'the rule judge''s upkeep of stored relation SrcsetForm';

COMMENT ON FUNCTION "qti"."__upkeep_ssml_scope_node_wjsiyc2yn2"() IS 'the rule judge''s upkeep of stored relation SsmlScopeNode';

COMMENT ON FUNCTION "qti"."__upkeep_ssml_value_o3r7rbnlmz"() IS 'the rule judge''s upkeep of stored relation SsmlValue';

COMMENT ON FUNCTION "qti"."__upkeep_structure_naming_ufjj7xqjup"() IS 'the rule judge''s upkeep of stored relation StructureNaming';

COMMENT ON FUNCTION "qti"."__upkeep_structure_node_isww7ylxts"() IS 'the rule judge''s upkeep of stored relation StructureNode';

COMMENT ON FUNCTION "qti"."__upkeep_table_header_r3jscew7xb"() IS 'the rule judge''s upkeep of stored relation TableHeader';

COMMENT ON FUNCTION "qti"."__upkeep_template_processing_bfum5424ne"() IS 'the rule judge''s upkeep of stored relation TemplateProcessing';

COMMENT ON FUNCTION "qti"."__upkeep_template_ref_base_type_drmznxxlax"() IS 'the rule judge''s upkeep of stored relation TemplateRefBaseType';

COMMENT ON FUNCTION "qti"."__upkeep_template_ref_cardinality_io6bnw65is"() IS 'the rule judge''s upkeep of stored relation TemplateRefCardinality';

COMMENT ON FUNCTION "qti"."__upkeep_test_identifier_xfxgbw2m7c"() IS 'the rule judge''s upkeep of stored relation TestIdentifier';

COMMENT ON FUNCTION "qti"."__upkeep_test_identifier_bytes_aoxltju37m"() IS 'the rule judge''s upkeep of stored relation TestIdentifierBytes';

COMMENT ON FUNCTION "qti"."__upkeep_test_member_b7cvrdjasx"() IS 'the rule judge''s upkeep of stored relation TestMember';

COMMENT ON FUNCTION "qti"."__upkeep_test_part_evngtcw52w"() IS 'the rule judge''s upkeep of stored relation TestPart';

COMMENT ON FUNCTION "qti"."__upkeep_test_reading_tfj55lsadf"() IS 'the rule judge''s upkeep of stored relation TestReading';

COMMENT ON FUNCTION "qti"."__upkeep_test_root_aprjn4qug3"() IS 'the rule judge''s upkeep of stored relation TestRoot';

COMMENT ON FUNCTION "qti"."__upkeep_text_reference_string_value_73ffdkz43y"() IS 'the rule judge''s upkeep of stored relation TextReferenceStringValue';

COMMENT ON FUNCTION "qti"."__upkeep_tolerance_token_3ympo3cn6i"() IS 'the rule judge''s upkeep of stored relation ToleranceToken';

COMMENT ON FUNCTION "qti"."__upkeep_trimmed_mark_kpjxupu7hg"() IS 'the rule judge''s upkeep of stored relation TrimmedMark';

COMMENT ON FUNCTION "qti"."__judge_ssml_value_w5zdum5qkf"("pg_catalog"."text"[]) IS 'the upkeep of the stored relations over the deltas of SsmlValue and the relations they read beside it';

COMMENT ON FUNCTION "qti"."__upkeep_typed_declaration_name_3kfyweru64"() IS 'the rule judge''s upkeep of stored relation TypedDeclarationName';

COMMENT ON FUNCTION "qti"."__upkeep_typed_href_stbqurq6kx"() IS 'the rule judge''s upkeep of stored relation TypedHref';

COMMENT ON FUNCTION "qti"."__upkeep_typed_path_nrvfot4n3b"() IS 'the rule judge''s upkeep of stored relation TypedPath';

COMMENT ON FUNCTION "qti"."__upkeep_typed_value_text_kjdi3lking"() IS 'the rule judge''s upkeep of stored relation TypedValueText';

COMMENT ON FUNCTION "qti"."__upkeep_unassembled_reference_6oolry4ad7"() IS 'the rule judge''s upkeep of stored relation UnassembledReference';

COMMENT ON FUNCTION "qti"."__upkeep_unclaimed_name_a3f44uuj6h"() IS 'the rule judge''s upkeep of stored relation UnclaimedName';

COMMENT ON FUNCTION "qti"."__upkeep_unknown_operand_base_dgljquo562"() IS 'the rule judge''s upkeep of stored relation UnknownOperandBase';

COMMENT ON FUNCTION "qti"."__upkeep_unknown_tail_base_l2fzxyitrx"() IS 'the rule judge''s upkeep of stored relation UnknownTailBase';

COMMENT ON FUNCTION "qti"."__upkeep_unplaced_include_ideiz63npz"() IS 'the rule judge''s upkeep of stored relation UnplacedInclude';

COMMENT ON FUNCTION "qti"."__upkeep_unread_type_href_6vauockzaq"() IS 'the rule judge''s upkeep of stored relation UnreadTypeHref';

COMMENT ON FUNCTION "qti"."__upkeep_untargeted_item_ref_m5ddghkp5u"() IS 'the rule judge''s upkeep of stored relation UntargetedItemRef';

COMMENT ON FUNCTION "qti"."__upkeep_untyped_unweighted_lmdby6e3sc"() IS 'the rule judge''s upkeep of stored relation UntypedUnweighted';

COMMENT ON FUNCTION "qti"."__upkeep_untyped_weighted_7xa6getjky"() IS 'the rule judge''s upkeep of stored relation UntypedWeighted';

COMMENT ON FUNCTION "qti"."__upkeep_unweighted_read_kxc5bnpdjx"() IS 'the rule judge''s upkeep of stored relation UnweightedRead';

COMMENT ON FUNCTION "qti"."__upkeep_usage_value_base_type_hyqv3fomjw"() IS 'the rule judge''s upkeep of stored relation UsageValueBaseType';

COMMENT ON FUNCTION "qti"."__upkeep_variable_mapping_rg7uybmqtr"() IS 'the rule judge''s upkeep of stored relation VariableMapping';

COMMENT ON FUNCTION "qti"."__upkeep_variable_ref_node_cm7emk4jiy"() IS 'the rule judge''s upkeep of stored relation VariableRefNode';

COMMENT ON FUNCTION "qti"."__upkeep_weight_value_a25hwtvmen"() IS 'the rule judge''s upkeep of stored relation WeightValue';

COMMENT ON FUNCTION "qti"."__upkeep_weighted_base_type_kvc62v7tqx"() IS 'the rule judge''s upkeep of stored relation WeightedBaseType';

COMMENT ON FUNCTION "qti"."__upkeep_weighted_read_uwhsx7qvcr"() IS 'the rule judge''s upkeep of stored relation WeightedRead';

COMMENT ON FUNCTION "qti"."__judge_attribute_vzmvvaghsz"("pg_catalog"."text"[]) IS 'the upkeep of the stored relations over the deltas of Attribute and the relations they read beside it';

COMMENT ON FUNCTION "qti"."__upkeep_weighted_variable_k7dltya2ih"() IS 'the rule judge''s upkeep of stored relation WeightedVariable';

COMMENT ON FUNCTION "qti"."__judge_assembled_document_y4eccdpmxv"("pg_catalog"."text"[]) IS 'the upkeep of the stored relations over the deltas of AssembledDocument and the relations they read beside it';

COMMENT ON FUNCTION "qti"."__capture_apply_argument_ezp3gy6zxb"() IS 'rule capture of ApplyArgument';

COMMENT ON FUNCTION "qti"."__capture_apply_argument_pair_aapyoaqcwj"() IS 'rule capture of ApplyArgumentPair';

COMMENT ON FUNCTION "qti"."__capture_arity_floor_3362d736hb"() IS 'rule capture of ArityFloor';

COMMENT ON FUNCTION "qti"."__capture_assembled_catalog_3z2sfh4yla"() IS 'rule capture of AssembledCatalog';

COMMENT ON FUNCTION "qti"."__capture_assembled_document_kywec7er73"() IS 'rule capture of AssembledDocument';

COMMENT ON FUNCTION "qti"."__capture_assembled_id_jqey7ok3se"() IS 'rule capture of AssembledId';

COMMENT ON FUNCTION "qti"."__capture_assembled_replaceable_6cfuiugrvx"() IS 'rule capture of AssembledReplaceable';

COMMENT ON FUNCTION "qti"."__capture_attribute_itmluum5pt"() IS 'rule capture of Attribute';

COMMENT ON FUNCTION "qti"."__capture_binary_math_operator_os7j7fr4v6"() IS 'rule capture of BinaryMathOperator';

COMMENT ON FUNCTION "qti"."__capture_binding_base_type_node_pvojkomn42"() IS 'rule capture of BindingBaseTypeNode';

COMMENT ON FUNCTION "qti"."__capture_binding_cardinality_node_x6s3xdopta"() IS 'rule capture of BindingCardinalityNode';

COMMENT ON FUNCTION "qti"."__capture_binding_name_wylitlhovp"() IS 'rule capture of BindingName';

COMMENT ON FUNCTION "qti"."__capture_bound_variable_zkpqqr76nb"() IS 'rule capture of BoundVariable';

COMMENT ON FUNCTION "qti"."__capture_bounded_selection_6gw3wojyrn"() IS 'rule capture of BoundedSelection';

COMMENT ON FUNCTION "qti"."__capture_branch_resolution_y36gesfydl"() IS 'rule capture of BranchResolution';

COMMENT ON FUNCTION "qti"."__capture_candidate_path_wlkrzbwvw3"() IS 'rule capture of CandidatePath';

COMMENT ON FUNCTION "qti"."__capture_catalog_id_jfqixfjyar"() IS 'rule capture of CatalogId';

COMMENT ON FUNCTION "qti"."__capture_catalog_scope_vqhsmtulbo"() IS 'rule capture of CatalogScope';

COMMENT ON FUNCTION "qti"."__capture_catalog_scope_node_6svtbxj54q"() IS 'rule capture of CatalogScopeNode';

COMMENT ON FUNCTION "qti"."__capture_cell_child_2j4si7it47"() IS 'rule capture of CellChild';

COMMENT ON FUNCTION "qti"."__capture_cell_leaf_tpy2oa357u"() IS 'rule capture of CellLeaf';

COMMENT ON FUNCTION "qti"."__capture_cell_table_irc3pkoo53"() IS 'rule capture of CellTable';

COMMENT ON FUNCTION "qti"."__capture_cell_token_bu3mvk7gzk"() IS 'rule capture of CellToken';

COMMENT ON FUNCTION "qti"."__capture_choice_neayopxxaf"() IS 'rule capture of Choice';

COMMENT ON FUNCTION "qti"."__capture_choice_interaction_67uetkh2me"() IS 'rule capture of ChoiceInteraction';

COMMENT ON FUNCTION "qti"."__capture_choice_node_krda6kgts2"() IS 'rule capture of ChoiceNode';

COMMENT ON FUNCTION "qti"."__capture_choice_or_hottext_gt22qnsced"() IS 'rule capture of ChoiceOrHottext';

COMMENT ON FUNCTION "qti"."__capture_cn_count_dpun7ibpty"() IS 'rule capture of CnCount';

COMMENT ON FUNCTION "qti"."__capture_comment_3fafsajrz7"() IS 'rule capture of Comment';

COMMENT ON FUNCTION "qti"."__capture_context_ref_nebkcb5eus"() IS 'rule capture of ContextRef';

COMMENT ON FUNCTION "qti"."__capture_count_bound_o4cqbs6f73"() IS 'rule capture of CountBound';

COMMENT ON FUNCTION "qti"."__capture_count_bound_node_rnxawkzm72"() IS 'rule capture of CountBoundNode';

COMMENT ON FUNCTION "qti"."__capture_data_ssml_qzwoa3blrx"() IS 'rule capture of DataSsml';

COMMENT ON FUNCTION "qti"."__capture_data_ssml_member_e3kaulojj7"() IS 'rule capture of DataSsmlMember';

COMMENT ON FUNCTION "qti"."__capture_data_ssml_property_awsueqqn4k"() IS 'rule capture of DataSsmlProperty';

COMMENT ON FUNCTION "qti"."__capture_declaration_base_type_r4wvqxday5"() IS 'rule capture of DeclarationBaseType';

COMMENT ON FUNCTION "qti"."__capture_declaration_cardinality_kudafbvv6l"() IS 'rule capture of DeclarationCardinality';

COMMENT ON FUNCTION "qti"."__capture_declaration_name_6ibepnxyjg"() IS 'rule capture of DeclarationName';

COMMENT ON FUNCTION "qti"."__capture_declaration_table_lo7jv35mks"() IS 'rule capture of DeclarationTable';

COMMENT ON FUNCTION "qti"."__capture_dependency_tvovto6fc3"() IS 'rule capture of Dependency';

COMMENT ON FUNCTION "qti"."__capture_dependency_resolved_ho3flhkgga"() IS 'rule capture of DependencyResolved';

COMMENT ON FUNCTION "qti"."__capture_described_assembled_lang_vuu6a6rfbg"() IS 'rule capture of DescribedAssembledLang';

COMMENT ON FUNCTION "qti"."__capture_described_lang_3buvc5hqha"() IS 'rule capture of DescribedLang';

COMMENT ON FUNCTION "qti"."__capture_doctype_zd2y6ytcuj"() IS 'rule capture of Doctype';

COMMENT ON FUNCTION "qti"."__capture_document_h46mvgroqo"() IS 'rule capture of Document';

COMMENT ON FUNCTION "qti"."__capture_document_id_eulwoph3m7"() IS 'rule capture of DocumentId';

COMMENT ON FUNCTION "qti"."__capture_element_type_6iss5rizj2"() IS 'rule capture of ElementType';

COMMENT ON FUNCTION "qti"."__capture_entry_bqh2dphmq7"() IS 'rule capture of Entry';

COMMENT ON FUNCTION "qti"."__capture_entry_file_target_hny4jqdugc"() IS 'rule capture of EntryFileTarget';

COMMENT ON FUNCTION "qti"."__capture_expression_3gfbksib72"() IS 'rule capture of Expression';

COMMENT ON FUNCTION "qti"."__capture_expression_attribute_rkcc5rpnyr"() IS 'rule capture of ExpressionAttribute';

COMMENT ON FUNCTION "qti"."__capture_expression_node_msjmrc7xgm"() IS 'rule capture of ExpressionNode';

COMMENT ON FUNCTION "qti"."__capture_expression_operand_icwj7qspln"() IS 'rule capture of ExpressionOperand';

COMMENT ON FUNCTION "qti"."__capture_feedback_ref_iuekmjyn2k"() IS 'rule capture of FeedbackRef';

COMMENT ON FUNCTION "qti"."__capture_file_yjq2w5356h"() IS 'rule capture of File';

COMMENT ON FUNCTION "qti"."__capture_file_outside_3e7wcs37xq"() IS 'rule capture of FileOutside';

COMMENT ON FUNCTION "qti"."__capture_file_path_fjyfymzkgk"() IS 'rule capture of FilePath';

COMMENT ON FUNCTION "qti"."__capture_filtered_section_ykmiosgefh"() IS 'rule capture of FilteredSection';

COMMENT ON FUNCTION "qti"."__capture_forbidden_resource_type_yivqnqz3np"() IS 'rule capture of ForbiddenResourceType';

COMMENT ON FUNCTION "qti"."__capture_forward_branch_rule_ndjvzm6fqe"() IS 'rule capture of ForwardBranchRule';

COMMENT ON FUNCTION "qti"."__capture_fragment_context_ref_nuuhlshmzu"() IS 'rule capture of FragmentContextRef';

COMMENT ON FUNCTION "qti"."__capture_fragment_feedback_ref_imuuftmewc"() IS 'rule capture of FragmentFeedbackRef';

COMMENT ON FUNCTION "qti"."__capture_fragment_printed_ref_uennexi5y2"() IS 'rule capture of FragmentPrintedRef';

COMMENT ON FUNCTION "qti"."__capture_fragment_scope_iknfqtw5zm"() IS 'rule capture of FragmentScope';

COMMENT ON FUNCTION "qti"."__capture_fragment_template_ref_4a55ciye7u"() IS 'rule capture of FragmentTemplateRef';

COMMENT ON FUNCTION "qti"."__capture_free_mapping_target_5hn77hd5yy"() IS 'rule capture of FreeMappingTarget';

COMMENT ON FUNCTION "qti"."__capture_head_document_6q5kgn3iub"() IS 'rule capture of HeadDocument';

COMMENT ON FUNCTION "qti"."__capture_head_qualifier_pair_7k4b62unbz"() IS 'rule capture of HeadQualifierPair';

COMMENT ON FUNCTION "qti"."__capture_header_token_xwforpimq3"() IS 'rule capture of HeaderToken';

COMMENT ON FUNCTION "qti"."__capture_hottext_lhjwhvzr4d"() IS 'rule capture of Hottext';

COMMENT ON FUNCTION "qti"."__capture_hottext_node_53dawpg4ai"() IS 'rule capture of HottextNode';

COMMENT ON FUNCTION "qti"."__capture_id_binding_77eh5hy256"() IS 'rule capture of IdBinding';

COMMENT ON FUNCTION "qti"."__capture_id_value_mc6zlbx4ju"() IS 'rule capture of IdValue';

COMMENT ON FUNCTION "qti"."__capture_identity_text_h5x3ut4jpk"() IS 'rule capture of IdentityText';

COMMENT ON FUNCTION "qti"."__capture_idref_4rhkrmfh4c"() IS 'rule capture of Idref';

COMMENT ON FUNCTION "qti"."__capture_idref_target_svtn77efc5"() IS 'rule capture of IdrefTarget';

COMMENT ON FUNCTION "qti"."__capture_inclusion_56gcj75lja"() IS 'rule capture of Inclusion';

COMMENT ON FUNCTION "qti"."__capture_instance_ts6ly2zo5e"() IS 'rule capture of Instance';

COMMENT ON FUNCTION "qti"."__capture_instance_document_ioqfoa3crb"() IS 'rule capture of InstanceDocument';

COMMENT ON FUNCTION "qti"."__capture_interaction_74aiefebxt"() IS 'rule capture of Interaction';

COMMENT ON FUNCTION "qti"."__capture_interaction_attribute_wquigysxiz"() IS 'rule capture of InteractionAttribute';

COMMENT ON FUNCTION "qti"."__capture_interaction_node_dhodh4hq5g"() IS 'rule capture of InteractionNode';

COMMENT ON FUNCTION "qti"."__capture_interpolated_lookup_ewkbgadycl"() IS 'rule capture of InterpolatedLookup';

COMMENT ON FUNCTION "qti"."__capture_item_mapping_sta4uizgno"() IS 'rule capture of ItemMapping';

COMMENT ON FUNCTION "qti"."__capture_item_ref_document_rlun34ysrf"() IS 'rule capture of ItemRefDocument';

COMMENT ON FUNCTION "qti"."__capture_item_ref_href_njxj66f6sv"() IS 'rule capture of ItemRefHref';

COMMENT ON FUNCTION "qti"."__capture_item_ref_table_zhdcj35lja"() IS 'rule capture of ItemRefTable';

COMMENT ON FUNCTION "qti"."__capture_item_ref_target_lppf4uysf7"() IS 'rule capture of ItemRefTarget';

COMMENT ON FUNCTION "qti"."__capture_item_scoped_reading_y7btcyp7z3"() IS 'rule capture of ItemScopedReading';

COMMENT ON FUNCTION "qti"."__capture_item_template_default_b3odk35anz"() IS 'rule capture of ItemTemplateDefault';

COMMENT ON FUNCTION "qti"."__capture_judged_placed_idref_jefkeiqsd4"() IS 'rule capture of JudgedPlacedIdref';

COMMENT ON FUNCTION "qti"."__capture_label_use_zaf4tt25o3"() IS 'rule capture of LabelUse';

COMMENT ON FUNCTION "qti"."__capture_lang_value_5esesyfvnd"() IS 'rule capture of LangValue';

COMMENT ON FUNCTION "qti"."__capture_least_count_aijvroibqn"() IS 'rule capture of LeastCount';

COMMENT ON FUNCTION "qti"."__capture_least_count_node_bd5ohzrokd"() IS 'rule capture of LeastCountNode';

COMMENT ON FUNCTION "qti"."__capture_least_one_apply_qioo3rhf3f"() IS 'rule capture of LeastOneApply';

COMMENT ON FUNCTION "qti"."__capture_least_two_apply_sulndhd7ws"() IS 'rule capture of LeastTwoApply';

COMMENT ON FUNCTION "qti"."__capture_link_reading_pp235xpir4"() IS 'rule capture of LinkReading';

COMMENT ON FUNCTION "qti"."__capture_link_scope_aycesopfcy"() IS 'rule capture of LinkScope';

COMMENT ON FUNCTION "qti"."__capture_listed_identifier_je4bienmea"() IS 'rule capture of ListedIdentifier';

COMMENT ON FUNCTION "qti"."__capture_listed_lang_qxh5qqwlzr"() IS 'rule capture of ListedLang';

COMMENT ON FUNCTION "qti"."__capture_listed_title_domchue6x5"() IS 'rule capture of ListedTitle';

COMMENT ON FUNCTION "qti"."__capture_literal_cmqvxvs66l"() IS 'rule capture of Literal';

COMMENT ON FUNCTION "qti"."__capture_literal_typed_cv5kr7fm7e"() IS 'rule capture of LiteralTyped';

COMMENT ON FUNCTION "qti"."__capture_located_template_3jfcgmhsqy"() IS 'rule capture of LocatedTemplate';

COMMENT ON FUNCTION "qti"."__capture_lookup_value_f3rrvlw7j7"() IS 'rule capture of LookupValue';

COMMENT ON FUNCTION "qti"."__capture_map_key_gtfuz4lzxt"() IS 'rule capture of MapKey';

COMMENT ON FUNCTION "qti"."__capture_mapped_response_declaration_2sk63dtcfz"() IS 'rule capture of MappedResponseDeclaration';

COMMENT ON FUNCTION "qti"."__capture_mapping_base_type_xm6qm4j53s"() IS 'rule capture of MappingBaseType';

COMMENT ON FUNCTION "qti"."__capture_mastery_value_vcu35bia62"() IS 'rule capture of MasteryValue';

COMMENT ON FUNCTION "qti"."__capture_matched_identifier_qvdqgdowal"() IS 'rule capture of MatchedIdentifier';

COMMENT ON FUNCTION "qti"."__capture_matched_title_hqegmvvxsp"() IS 'rule capture of MatchedTitle';

COMMENT ON FUNCTION "qti"."__capture_math_action_jd3vrh7mkp"() IS 'rule capture of MathAction';

COMMENT ON FUNCTION "qti"."__capture_math_align_group_rm6un5zx6m"() IS 'rule capture of MathAlignGroup';

COMMENT ON FUNCTION "qti"."__capture_math_align_scope_drfp7lejeu"() IS 'rule capture of MathAlignScope';

COMMENT ON FUNCTION "qti"."__capture_math_cell_gqufe5xqbw"() IS 'rule capture of MathCell';

COMMENT ON FUNCTION "qti"."__capture_math_cn_szq6ag5xrp"() IS 'rule capture of MathCn';

COMMENT ON FUNCTION "qti"."__capture_math_rank_pvp6tiwkcl"() IS 'rule capture of MathRank';

COMMENT ON FUNCTION "qti"."__capture_math_rank_node_iqizlfzwhm"() IS 'rule capture of MathRankNode';

COMMENT ON FUNCTION "qti"."__capture_media_2hbvlgszbl"() IS 'rule capture of Media';

COMMENT ON FUNCTION "qti"."__capture_most_count_ht5osomlyy"() IS 'rule capture of MostCount';

COMMENT ON FUNCTION "qti"."__capture_most_count_node_6s6kthvte7"() IS 'rule capture of MostCountNode';

COMMENT ON FUNCTION "qti"."__capture_named_c3oe5awrnw"() IS 'rule capture of Named';

COMMENT ON FUNCTION "qti"."__capture_named_declaration_3sgu235ug2"() IS 'rule capture of NamedDeclaration';

COMMENT ON FUNCTION "qti"."__capture_named_item_ref_fazofuq7au"() IS 'rule capture of NamedItemRef';

COMMENT ON FUNCTION "qti"."__capture_node_7sghxk2dxj"() IS 'rule capture of Node';

COMMENT ON FUNCTION "qti"."__capture_normal_maximum_kyp5brbypx"() IS 'rule capture of NormalMaximum';

COMMENT ON FUNCTION "qti"."__capture_normal_minimum_juiaihzrn6"() IS 'rule capture of NormalMinimum';

COMMENT ON FUNCTION "qti"."__capture_numbered_reading_vbr7y4n7ey"() IS 'rule capture of NumberedReading';

COMMENT ON FUNCTION "qti"."__capture_numbered_target_vb5r3sfj7z"() IS 'rule capture of NumberedTarget';

COMMENT ON FUNCTION "qti"."__capture_object_identifier_ls422uihva"() IS 'rule capture of ObjectIdentifier';

COMMENT ON FUNCTION "qti"."__capture_open_attribute_zpjedimx7c"() IS 'rule capture of OpenAttribute';

COMMENT ON FUNCTION "qti"."__capture_open_element_name_oaq7r3tjeo"() IS 'rule capture of OpenElementName';

COMMENT ON FUNCTION "qti"."__capture_open_element_type_pdlvcktpcb"() IS 'rule capture of OpenElementType';

COMMENT ON FUNCTION "qti"."__capture_open_name_node_wzkdpqmncp"() IS 'rule capture of OpenNameNode';

COMMENT ON FUNCTION "qti"."__capture_operand_of_4hqrshzjo5"() IS 'rule capture of OperandOf';

COMMENT ON FUNCTION "qti"."__capture_other_vocabulary_type_lk3tlecwo7"() IS 'rule capture of OtherVocabularyType';

COMMENT ON FUNCTION "qti"."__capture_packaged_template_default_46xznkpmlp"() IS 'rule capture of PackagedTemplateDefault';

COMMENT ON FUNCTION "qti"."__capture_pci_module_form_rbpjgm5ck4"() IS 'rule capture of PciModuleForm';

COMMENT ON FUNCTION "qti"."__capture_pi_crqtap7l2j"() IS 'rule capture of Pi';

COMMENT ON FUNCTION "qti"."__capture_placed_binding_g6nwtylt4r"() IS 'rule capture of PlacedBinding';

COMMENT ON FUNCTION "qti"."__capture_placed_binding_base_type_node_gy3xsaudfi"() IS 'rule capture of PlacedBindingBaseTypeNode';

COMMENT ON FUNCTION "qti"."__capture_placed_binding_cardinality_node_gntfq46aql"() IS 'rule capture of PlacedBindingCardinalityNode';

COMMENT ON FUNCTION "qti"."__capture_placed_choice_ofja2rvius"() IS 'rule capture of PlacedChoice';

COMMENT ON FUNCTION "qti"."__capture_placed_choice_or_hottext_ltkhcnzuqe"() IS 'rule capture of PlacedChoiceOrHottext';

COMMENT ON FUNCTION "qti"."__capture_placed_expression_aicufbicvo"() IS 'rule capture of PlacedExpression';

COMMENT ON FUNCTION "qti"."__capture_placed_expression_node_2vmn4idb7g"() IS 'rule capture of PlacedExpressionNode';

COMMENT ON FUNCTION "qti"."__capture_placed_expression_site_hazfuqo5gi"() IS 'rule capture of PlacedExpressionSite';

COMMENT ON FUNCTION "qti"."__capture_placed_filter_zes53tqtnr"() IS 'rule capture of PlacedFilter';

COMMENT ON FUNCTION "qti"."__capture_placed_hottext_jurjhgnjnv"() IS 'rule capture of PlacedHottext';

COMMENT ON FUNCTION "qti"."__capture_placed_id_azml2s6wnr"() IS 'rule capture of PlacedId';

COMMENT ON FUNCTION "qti"."__capture_placed_idref_dxsermopm3"() IS 'rule capture of PlacedIdref';

COMMENT ON FUNCTION "qti"."__capture_placed_include_path_eg3r7eswcq"() IS 'rule capture of PlacedIncludePath';

COMMENT ON FUNCTION "qti"."__capture_placed_math_rank_xssetn7pti"() IS 'rule capture of PlacedMathRank';

COMMENT ON FUNCTION "qti"."__capture_placed_math_rank_node_kl4fgyht2z"() IS 'rule capture of PlacedMathRankNode';

COMMENT ON FUNCTION "qti"."__capture_placed_reference_xkzaz6772b"() IS 'rule capture of PlacedReference';

COMMENT ON FUNCTION "qti"."__capture_placed_reference_site_t2nsrn3cf6"() IS 'rule capture of PlacedReferenceSite';

COMMENT ON FUNCTION "qti"."__capture_placed_share_target_jkejimypix"() IS 'rule capture of PlacedShareTarget';

COMMENT ON FUNCTION "qti"."__capture_placed_test_reference_6at4mdhlnq"() IS 'rule capture of PlacedTestReference';

COMMENT ON FUNCTION "qti"."__capture_placed_variable_declaration_n3mypn3tod"() IS 'rule capture of PlacedVariableDeclaration';

COMMENT ON FUNCTION "qti"."__capture_placed_variable_ref_c73fg3d4ir"() IS 'rule capture of PlacedVariableRef';

COMMENT ON FUNCTION "qti"."__capture_placed_variable_ref_declaration_nj7k4ptc2n"() IS 'rule capture of PlacedVariableRefDeclaration';

COMMENT ON FUNCTION "qti"."__capture_placed_variable_ref_node_7fky4mjekl"() IS 'rule capture of PlacedVariableRefNode';

COMMENT ON FUNCTION "qti"."__capture_placed_weighted_variable_g3dis5if2r"() IS 'rule capture of PlacedWeightedVariable';

COMMENT ON FUNCTION "qti"."__capture_prefixed_declaration_wlfmtoh7kq"() IS 'rule capture of PrefixedDeclaration';

COMMENT ON FUNCTION "qti"."__capture_prefixed_map_response_zqfvv5xz2k"() IS 'rule capture of PrefixedMapResponse';

COMMENT ON FUNCTION "qti"."__capture_prefixed_map_response_point_mjav4nisjq"() IS 'rule capture of PrefixedMapResponsePoint';

COMMENT ON FUNCTION "qti"."__capture_printed_variable_ref_rkvjy5pcp6"() IS 'rule capture of PrintedVariableRef';

COMMENT ON FUNCTION "qti"."__capture_processing_jfdg5itrrj"() IS 'rule capture of Processing';

COMMENT ON FUNCTION "qti"."__capture_processing_node_nn4avvhbib"() IS 'rule capture of ProcessingNode';

COMMENT ON FUNCTION "qti"."__capture_read_include_lfg2mwhqqj"() IS 'rule capture of ReadInclude';

COMMENT ON FUNCTION "qti"."__capture_record_node_cbrjs7u6rm"() IS 'rule capture of RecordNode';

COMMENT ON FUNCTION "qti"."__capture_record_set_value_3cbhbmjvp6"() IS 'rule capture of RecordSetValue';

COMMENT ON FUNCTION "qti"."__capture_referable_name_57kx6wlbp7"() IS 'rule capture of ReferableName';

COMMENT ON FUNCTION "qti"."__capture_reference_d5rfnwftad"() IS 'rule capture of Reference';

COMMENT ON FUNCTION "qti"."__capture_reference_path_a7u42lsr4p"() IS 'rule capture of ReferencePath';

COMMENT ON FUNCTION "qti"."__capture_required_parts_bcl63grhdv"() IS 'rule capture of RequiredParts';

COMMENT ON FUNCTION "qti"."__capture_required_ssml_property_wyo5pqvjvq"() IS 'rule capture of RequiredSsmlProperty';

COMMENT ON FUNCTION "qti"."__capture_requirement_met_gtp2r6y4lh"() IS 'rule capture of RequirementMet';

COMMENT ON FUNCTION "qti"."__capture_resolved_branch_rule_2vuzjirxds"() IS 'rule capture of ResolvedBranchRule';

COMMENT ON FUNCTION "qti"."__capture_resource_document_ycparq66g5"() IS 'rule capture of ResourceDocument';

COMMENT ON FUNCTION "qti"."__capture_resource_file_document_vigcoxbk6t"() IS 'rule capture of ResourceFileDocument';

COMMENT ON FUNCTION "qti"."__capture_resource_file_outside_q3ygekj57o"() IS 'rule capture of ResourceFileOutside';

COMMENT ON FUNCTION "qti"."__capture_resource_file_path_zcnfcycsf2"() IS 'rule capture of ResourceFilePath';

COMMENT ON FUNCTION "qti"."__capture_resource_href_a6m5gac7ix"() IS 'rule capture of ResourceHref';

COMMENT ON FUNCTION "qti"."__capture_resource_href_outside_sflje2hh5z"() IS 'rule capture of ResourceHrefOutside';

COMMENT ON FUNCTION "qti"."__capture_resource_href_path_hikvay3rfe"() IS 'rule capture of ResourceHrefPath';

COMMENT ON FUNCTION "qti"."__capture_scope_node_qf4o4gcd2j"() IS 'rule capture of ScopeNode';

COMMENT ON FUNCTION "qti"."__capture_scoped_dir_66jq6bfczl"() IS 'rule capture of ScopedDir';

COMMENT ON FUNCTION "qti"."__capture_selection_without_replacement_65y42dvbuk"() IS 'rule capture of SelectionWithoutReplacement';

COMMENT ON FUNCTION "qti"."__capture_share_fragment_23yyb62piz"() IS 'rule capture of ShareFragment';

COMMENT ON FUNCTION "qti"."__capture_share_source_ybuosrppo2"() IS 'rule capture of ShareSource';

COMMENT ON FUNCTION "qti"."__capture_share_target_xf6egfoz4f"() IS 'rule capture of ShareTarget';

COMMENT ON FUNCTION "qti"."__capture_site_ccrpb262b6"() IS 'rule capture of Site';

COMMENT ON FUNCTION "qti"."__capture_site_path_lod75hbzio"() IS 'rule capture of SitePath';

COMMENT ON FUNCTION "qti"."__capture_site_target_mykxfkm433"() IS 'rule capture of SiteTarget';

COMMENT ON FUNCTION "qti"."__capture_sole_reading_lfvy5rmn67"() IS 'rule capture of SoleReading';

COMMENT ON FUNCTION "qti"."__capture_srcset_i23xwowlg4"() IS 'rule capture of Srcset';

COMMENT ON FUNCTION "qti"."__capture_srcset_candidate_ix5dzebhuu"() IS 'rule capture of SrcsetCandidate';

COMMENT ON FUNCTION "qti"."__capture_ssml_scope_bdhavhlbu2"() IS 'rule capture of SsmlScope';

COMMENT ON FUNCTION "qti"."__capture_ssml_scope_node_lv2uo24trn"() IS 'rule capture of SsmlScopeNode';

COMMENT ON FUNCTION "qti"."__capture_ssml_value_g2g5o4eicz"() IS 'rule capture of SsmlValue';

COMMENT ON FUNCTION "qti"."__capture_stimulus_ref_ebosxnmexe"() IS 'rule capture of StimulusRef';

COMMENT ON FUNCTION "qti"."__capture_structure_naming_ehfz6gfrtm"() IS 'rule capture of StructureNaming';

COMMENT ON FUNCTION "qti"."__capture_table_header_tkmxq7wtew"() IS 'rule capture of TableHeader';

COMMENT ON FUNCTION "qti"."__capture_template_processing_7nktduqzbw"() IS 'rule capture of TemplateProcessing';

COMMENT ON FUNCTION "qti"."__capture_template_ref_dre62in37w"() IS 'rule capture of TemplateRef';

COMMENT ON FUNCTION "qti"."__capture_test_identifier_75ccafnmns"() IS 'rule capture of TestIdentifier';

COMMENT ON FUNCTION "qti"."__capture_test_reading_reh4vrs2hx"() IS 'rule capture of TestReading';

COMMENT ON FUNCTION "qti"."__capture_text_reference_4wyk6zxgqf"() IS 'rule capture of TextReference';

COMMENT ON FUNCTION "qti"."__capture_text_reference_path_znomqpm3dr"() IS 'rule capture of TextReferencePath';

COMMENT ON FUNCTION "qti"."__capture_tolerance_token_knra7apxy6"() IS 'rule capture of ToleranceToken';

COMMENT ON FUNCTION "qti"."__capture_trimmed_mark_tmhe2tvpe4"() IS 'rule capture of TrimmedMark';

COMMENT ON FUNCTION "qti"."__capture_typed_declaration_name_xnhwa6z2ud"() IS 'rule capture of TypedDeclarationName';

COMMENT ON FUNCTION "qti"."__capture_typed_path_hpwrj5ngit"() IS 'rule capture of TypedPath';

COMMENT ON FUNCTION "qti"."__capture_unassembled_reference_cp3xwowgvl"() IS 'rule capture of UnassembledReference';

COMMENT ON FUNCTION "qti"."__capture_unclaimed_name_fq3dsaxunh"() IS 'rule capture of UnclaimedName';

COMMENT ON FUNCTION "qti"."__capture_unknown_operand_base_iukn2duces"() IS 'rule capture of UnknownOperandBase';

COMMENT ON FUNCTION "qti"."__capture_unknown_tail_base_4bsbn5m7u4"() IS 'rule capture of UnknownTailBase';

COMMENT ON FUNCTION "qti"."__capture_unread_type_href_6zakaehwci"() IS 'rule capture of UnreadTypeHref';

COMMENT ON FUNCTION "qti"."__capture_untargeted_item_ref_6r3gxi4vck"() IS 'rule capture of UntargetedItemRef';

COMMENT ON FUNCTION "qti"."__capture_variable_ref_lckeobxqnf"() IS 'rule capture of VariableRef';

COMMENT ON FUNCTION "qti"."__capture_variable_ref_node_voqq6667t7"() IS 'rule capture of VariableRefNode';

COMMENT ON FUNCTION "qti"."__capture_weighted_variable_bsowzq465v"() IS 'rule capture of WeightedVariable';

COMMENT ON FUNCTION "qti"."__stand_apply_argument_bfpcmqkcr2"() IS 'the stand-up of the rule judge''s session tables a write of ApplyArgument needs';

COMMENT ON FUNCTION "qti"."__stand_apply_argument_pair_agjtbg6jaj"() IS 'the stand-up of the rule judge''s session tables a write of ApplyArgumentPair needs';

COMMENT ON FUNCTION "qti"."__stand_arity_floor_s37znds6tj"() IS 'the stand-up of the rule judge''s session tables a write of ArityFloor needs';

COMMENT ON FUNCTION "qti"."__stand_assembled_catalog_555anehjhj"() IS 'the stand-up of the rule judge''s session tables a write of AssembledCatalog needs';

COMMENT ON FUNCTION "qti"."__stand_assembled_document_hwwdv6cnpm"() IS 'the stand-up of the rule judge''s session tables a write of AssembledDocument needs';

COMMENT ON FUNCTION "qti"."__stand_assembled_id_4ytm24poe5"() IS 'the stand-up of the rule judge''s session tables a write of AssembledId needs';

COMMENT ON FUNCTION "qti"."__stand_assembled_replaceable_c2rhtmsgpc"() IS 'the stand-up of the rule judge''s session tables a write of AssembledReplaceable needs';

COMMENT ON FUNCTION "qti"."__stand_attribute_ibvutlmrai"() IS 'the stand-up of the rule judge''s session tables a write of Attribute needs';

COMMENT ON FUNCTION "qti"."__stand_binary_math_operator_mf54s2hokq"() IS 'the stand-up of the rule judge''s session tables a write of BinaryMathOperator needs';

COMMENT ON FUNCTION "qti"."__stand_binding_base_type_node_7swd3ivtpj"() IS 'the stand-up of the rule judge''s session tables a write of BindingBaseTypeNode needs';

COMMENT ON FUNCTION "qti"."__stand_binding_cardinality_node_khtn36rqgn"() IS 'the stand-up of the rule judge''s session tables a write of BindingCardinalityNode needs';

COMMENT ON FUNCTION "qti"."__stand_binding_name_ye63gc6vro"() IS 'the stand-up of the rule judge''s session tables a write of BindingName needs';

COMMENT ON FUNCTION "qti"."__stand_bound_variable_7vtgjbh6hv"() IS 'the stand-up of the rule judge''s session tables a write of BoundVariable needs';

COMMENT ON FUNCTION "qti"."__stand_bounded_selection_r7pnxz2kcb"() IS 'the stand-up of the rule judge''s session tables a write of BoundedSelection needs';

COMMENT ON FUNCTION "qti"."__stand_branch_resolution_iyzkrwh7lt"() IS 'the stand-up of the rule judge''s session tables a write of BranchResolution needs';

COMMENT ON FUNCTION "qti"."__stand_candidate_path_qhg7xli4wt"() IS 'the stand-up of the rule judge''s session tables a write of CandidatePath needs';

COMMENT ON FUNCTION "qti"."__stand_catalog_id_zitsqacyrp"() IS 'the stand-up of the rule judge''s session tables a write of CatalogId needs';

COMMENT ON FUNCTION "qti"."__stand_catalog_scope_vudqbkxslz"() IS 'the stand-up of the rule judge''s session tables a write of CatalogScope needs';

COMMENT ON FUNCTION "qti"."__stand_catalog_scope_node_jiz5riwmxe"() IS 'the stand-up of the rule judge''s session tables a write of CatalogScopeNode needs';

COMMENT ON FUNCTION "qti"."__stand_cell_child_yb7l337ys5"() IS 'the stand-up of the rule judge''s session tables a write of CellChild needs';

COMMENT ON FUNCTION "qti"."__stand_cell_leaf_ptjwgogbl7"() IS 'the stand-up of the rule judge''s session tables a write of CellLeaf needs';

COMMENT ON FUNCTION "qti"."__stand_cell_table_4vz4z33ng6"() IS 'the stand-up of the rule judge''s session tables a write of CellTable needs';

COMMENT ON FUNCTION "qti"."__stand_cell_token_ibxm2pnftq"() IS 'the stand-up of the rule judge''s session tables a write of CellToken needs';

COMMENT ON FUNCTION "qti"."__stand_choice_xzzdvjuvsd"() IS 'the stand-up of the rule judge''s session tables a write of Choice needs';

COMMENT ON FUNCTION "qti"."__stand_choice_interaction_c645kfugmv"() IS 'the stand-up of the rule judge''s session tables a write of ChoiceInteraction needs';

COMMENT ON FUNCTION "qti"."__stand_choice_node_xymybj7olh"() IS 'the stand-up of the rule judge''s session tables a write of ChoiceNode needs';

COMMENT ON FUNCTION "qti"."__stand_choice_or_hottext_tzf4ol3hfx"() IS 'the stand-up of the rule judge''s session tables a write of ChoiceOrHottext needs';

COMMENT ON FUNCTION "qti"."__stand_cn_count_eejhcf4izw"() IS 'the stand-up of the rule judge''s session tables a write of CnCount needs';

COMMENT ON FUNCTION "qti"."__stand_comment_3l7okcxyxf"() IS 'the stand-up of the rule judge''s session tables a write of Comment needs';

COMMENT ON FUNCTION "qti"."__stand_context_ref_ujo5dooa7f"() IS 'the stand-up of the rule judge''s session tables a write of ContextRef needs';

COMMENT ON FUNCTION "qti"."__stand_count_bound_2z6orlcix6"() IS 'the stand-up of the rule judge''s session tables a write of CountBound needs';

COMMENT ON FUNCTION "qti"."__stand_count_bound_node_3jv2bdgk34"() IS 'the stand-up of the rule judge''s session tables a write of CountBoundNode needs';

COMMENT ON FUNCTION "qti"."__stand_data_ssml_k52kzmf2vn"() IS 'the stand-up of the rule judge''s session tables a write of DataSsml needs';

COMMENT ON FUNCTION "qti"."__stand_data_ssml_member_2xkysqbugo"() IS 'the stand-up of the rule judge''s session tables a write of DataSsmlMember needs';

COMMENT ON FUNCTION "qti"."__stand_data_ssml_property_6yi5in6iis"() IS 'the stand-up of the rule judge''s session tables a write of DataSsmlProperty needs';

COMMENT ON FUNCTION "qti"."__stand_declaration_base_type_t44am47xww"() IS 'the stand-up of the rule judge''s session tables a write of DeclarationBaseType needs';

COMMENT ON FUNCTION "qti"."__stand_declaration_cardinality_ow7hgwo3zc"() IS 'the stand-up of the rule judge''s session tables a write of DeclarationCardinality needs';

COMMENT ON FUNCTION "qti"."__stand_declaration_name_mw6ofe2k2r"() IS 'the stand-up of the rule judge''s session tables a write of DeclarationName needs';

COMMENT ON FUNCTION "qti"."__stand_declaration_table_syofiehxhy"() IS 'the stand-up of the rule judge''s session tables a write of DeclarationTable needs';

COMMENT ON FUNCTION "qti"."__stand_dependency_64gum4yxcr"() IS 'the stand-up of the rule judge''s session tables a write of Dependency needs';

COMMENT ON FUNCTION "qti"."__stand_dependency_resolved_ezpsh2zc2l"() IS 'the stand-up of the rule judge''s session tables a write of DependencyResolved needs';

COMMENT ON FUNCTION "qti"."__stand_described_assembled_lang_gkmmvea3uj"() IS 'the stand-up of the rule judge''s session tables a write of DescribedAssembledLang needs';

COMMENT ON FUNCTION "qti"."__stand_described_lang_cnjos7i6l2"() IS 'the stand-up of the rule judge''s session tables a write of DescribedLang needs';

COMMENT ON FUNCTION "qti"."__stand_doctype_gj2wct2uyg"() IS 'the stand-up of the rule judge''s session tables a write of Doctype needs';

COMMENT ON FUNCTION "qti"."__stand_document_pondgr3rqo"() IS 'the stand-up of the rule judge''s session tables a write of Document needs';

COMMENT ON FUNCTION "qti"."__stand_document_id_633p5hpydz"() IS 'the stand-up of the rule judge''s session tables a write of DocumentId needs';

COMMENT ON FUNCTION "qti"."__stand_element_type_7tgopoucgl"() IS 'the stand-up of the rule judge''s session tables a write of ElementType needs';

COMMENT ON FUNCTION "qti"."__stand_entry_pmmpk3imf3"() IS 'the stand-up of the rule judge''s session tables a write of Entry needs';

COMMENT ON FUNCTION "qti"."__stand_entry_file_target_zqb5swaokh"() IS 'the stand-up of the rule judge''s session tables a write of EntryFileTarget needs';

COMMENT ON FUNCTION "qti"."__stand_expression_u7lcjyvsn7"() IS 'the stand-up of the rule judge''s session tables a write of Expression needs';

COMMENT ON FUNCTION "qti"."__stand_expression_attribute_cgej3aak55"() IS 'the stand-up of the rule judge''s session tables a write of ExpressionAttribute needs';

COMMENT ON FUNCTION "qti"."__stand_expression_node_iuppcqnv4p"() IS 'the stand-up of the rule judge''s session tables a write of ExpressionNode needs';

COMMENT ON FUNCTION "qti"."__stand_expression_operand_4g6xwxrhbg"() IS 'the stand-up of the rule judge''s session tables a write of ExpressionOperand needs';

COMMENT ON FUNCTION "qti"."__stand_feedback_ref_d7224uniti"() IS 'the stand-up of the rule judge''s session tables a write of FeedbackRef needs';

COMMENT ON FUNCTION "qti"."__stand_file_tcw2ukyhyi"() IS 'the stand-up of the rule judge''s session tables a write of File needs';

COMMENT ON FUNCTION "qti"."__stand_file_outside_lhyrdnu5ai"() IS 'the stand-up of the rule judge''s session tables a write of FileOutside needs';

COMMENT ON FUNCTION "qti"."__stand_file_path_7r6oexjmsr"() IS 'the stand-up of the rule judge''s session tables a write of FilePath needs';

COMMENT ON FUNCTION "qti"."__stand_filtered_section_jdccrjadip"() IS 'the stand-up of the rule judge''s session tables a write of FilteredSection needs';

COMMENT ON FUNCTION "qti"."__stand_forbidden_resource_type_4rajpipvld"() IS 'the stand-up of the rule judge''s session tables a write of ForbiddenResourceType needs';

COMMENT ON FUNCTION "qti"."__stand_forward_branch_rule_5luyxvacjm"() IS 'the stand-up of the rule judge''s session tables a write of ForwardBranchRule needs';

COMMENT ON FUNCTION "qti"."__stand_fragment_context_ref_h4natgpneo"() IS 'the stand-up of the rule judge''s session tables a write of FragmentContextRef needs';

COMMENT ON FUNCTION "qti"."__stand_fragment_feedback_ref_gojudisgmf"() IS 'the stand-up of the rule judge''s session tables a write of FragmentFeedbackRef needs';

COMMENT ON FUNCTION "qti"."__stand_fragment_printed_ref_g5dbleutzc"() IS 'the stand-up of the rule judge''s session tables a write of FragmentPrintedRef needs';

COMMENT ON FUNCTION "qti"."__stand_fragment_scope_2oggx422cm"() IS 'the stand-up of the rule judge''s session tables a write of FragmentScope needs';

COMMENT ON FUNCTION "qti"."__stand_fragment_template_ref_mqrpgto2fj"() IS 'the stand-up of the rule judge''s session tables a write of FragmentTemplateRef needs';

COMMENT ON FUNCTION "qti"."__stand_free_mapping_target_pky6azqx4u"() IS 'the stand-up of the rule judge''s session tables a write of FreeMappingTarget needs';

COMMENT ON FUNCTION "qti"."__stand_head_document_r2fhul6ari"() IS 'the stand-up of the rule judge''s session tables a write of HeadDocument needs';

COMMENT ON FUNCTION "qti"."__stand_head_qualifier_pair_sutbkqdttc"() IS 'the stand-up of the rule judge''s session tables a write of HeadQualifierPair needs';

COMMENT ON FUNCTION "qti"."__stand_header_token_6sdnbemvum"() IS 'the stand-up of the rule judge''s session tables a write of HeaderToken needs';

COMMENT ON FUNCTION "qti"."__stand_hottext_apulsizq3w"() IS 'the stand-up of the rule judge''s session tables a write of Hottext needs';

COMMENT ON FUNCTION "qti"."__stand_hottext_node_uecyorqudr"() IS 'the stand-up of the rule judge''s session tables a write of HottextNode needs';

COMMENT ON FUNCTION "qti"."__stand_id_binding_i7w473odsr"() IS 'the stand-up of the rule judge''s session tables a write of IdBinding needs';

COMMENT ON FUNCTION "qti"."__stand_id_value_g2qcwwixjf"() IS 'the stand-up of the rule judge''s session tables a write of IdValue needs';

COMMENT ON FUNCTION "qti"."__stand_identity_text_b52n3op6xe"() IS 'the stand-up of the rule judge''s session tables a write of IdentityText needs';

COMMENT ON FUNCTION "qti"."__stand_idref_aho5h2elqy"() IS 'the stand-up of the rule judge''s session tables a write of Idref needs';

COMMENT ON FUNCTION "qti"."__stand_idref_target_jjhutks3nm"() IS 'the stand-up of the rule judge''s session tables a write of IdrefTarget needs';

COMMENT ON FUNCTION "qti"."__stand_inclusion_km3rxqqunr"() IS 'the stand-up of the rule judge''s session tables a write of Inclusion needs';

COMMENT ON FUNCTION "qti"."__stand_instance_fxskpasuzx"() IS 'the stand-up of the rule judge''s session tables a write of Instance needs';

COMMENT ON FUNCTION "qti"."__stand_instance_document_cz2bieazo3"() IS 'the stand-up of the rule judge''s session tables a write of InstanceDocument needs';

COMMENT ON FUNCTION "qti"."__stand_interaction_3potcpsocf"() IS 'the stand-up of the rule judge''s session tables a write of Interaction needs';

COMMENT ON FUNCTION "qti"."__stand_interaction_attribute_wmzckdz5tm"() IS 'the stand-up of the rule judge''s session tables a write of InteractionAttribute needs';

COMMENT ON FUNCTION "qti"."__stand_interaction_node_hdu2h6vpui"() IS 'the stand-up of the rule judge''s session tables a write of InteractionNode needs';

COMMENT ON FUNCTION "qti"."__stand_interpolated_lookup_otm7uzz7gx"() IS 'the stand-up of the rule judge''s session tables a write of InterpolatedLookup needs';

COMMENT ON FUNCTION "qti"."__stand_item_mapping_3zevmytdvb"() IS 'the stand-up of the rule judge''s session tables a write of ItemMapping needs';

COMMENT ON FUNCTION "qti"."__stand_item_ref_document_i66s3vh6ga"() IS 'the stand-up of the rule judge''s session tables a write of ItemRefDocument needs';

COMMENT ON FUNCTION "qti"."__stand_item_ref_href_jrjueitx27"() IS 'the stand-up of the rule judge''s session tables a write of ItemRefHref needs';

COMMENT ON FUNCTION "qti"."__stand_item_ref_table_vpiz7h564h"() IS 'the stand-up of the rule judge''s session tables a write of ItemRefTable needs';

COMMENT ON FUNCTION "qti"."__stand_item_ref_target_fueursqfqo"() IS 'the stand-up of the rule judge''s session tables a write of ItemRefTarget needs';

COMMENT ON FUNCTION "qti"."__stand_item_scoped_reading_2ml3fyjj7f"() IS 'the stand-up of the rule judge''s session tables a write of ItemScopedReading needs';

COMMENT ON FUNCTION "qti"."__stand_item_template_default_kvo6mnmhzp"() IS 'the stand-up of the rule judge''s session tables a write of ItemTemplateDefault needs';

COMMENT ON FUNCTION "qti"."__stand_judged_placed_idref_3affy7unyi"() IS 'the stand-up of the rule judge''s session tables a write of JudgedPlacedIdref needs';

COMMENT ON FUNCTION "qti"."__stand_label_use_o4brmrb7aq"() IS 'the stand-up of the rule judge''s session tables a write of LabelUse needs';

COMMENT ON FUNCTION "qti"."__stand_lang_value_kd7jpxedfz"() IS 'the stand-up of the rule judge''s session tables a write of LangValue needs';

COMMENT ON FUNCTION "qti"."__stand_least_count_ya6wrr6a3v"() IS 'the stand-up of the rule judge''s session tables a write of LeastCount needs';

COMMENT ON FUNCTION "qti"."__stand_least_count_node_v3ggjdighr"() IS 'the stand-up of the rule judge''s session tables a write of LeastCountNode needs';

COMMENT ON FUNCTION "qti"."__stand_least_one_apply_j7fqgzulo5"() IS 'the stand-up of the rule judge''s session tables a write of LeastOneApply needs';

COMMENT ON FUNCTION "qti"."__stand_least_two_apply_jl4mjnzet2"() IS 'the stand-up of the rule judge''s session tables a write of LeastTwoApply needs';

COMMENT ON FUNCTION "qti"."__stand_link_reading_uenjcz5dvs"() IS 'the stand-up of the rule judge''s session tables a write of LinkReading needs';

COMMENT ON FUNCTION "qti"."__stand_link_scope_fdavwvy5cb"() IS 'the stand-up of the rule judge''s session tables a write of LinkScope needs';

COMMENT ON FUNCTION "qti"."__stand_listed_identifier_w3jpqgxdus"() IS 'the stand-up of the rule judge''s session tables a write of ListedIdentifier needs';

COMMENT ON FUNCTION "qti"."__stand_listed_lang_wzvidjeeq3"() IS 'the stand-up of the rule judge''s session tables a write of ListedLang needs';

COMMENT ON FUNCTION "qti"."__stand_listed_title_7k2ffbiel7"() IS 'the stand-up of the rule judge''s session tables a write of ListedTitle needs';

COMMENT ON FUNCTION "qti"."__stand_literal_tiziliumbt"() IS 'the stand-up of the rule judge''s session tables a write of Literal needs';

COMMENT ON FUNCTION "qti"."__stand_literal_typed_2ilx4mlegz"() IS 'the stand-up of the rule judge''s session tables a write of LiteralTyped needs';

COMMENT ON FUNCTION "qti"."__stand_located_template_i5xm24flfv"() IS 'the stand-up of the rule judge''s session tables a write of LocatedTemplate needs';

COMMENT ON FUNCTION "qti"."__stand_lookup_value_hx7624x4iw"() IS 'the stand-up of the rule judge''s session tables a write of LookupValue needs';

COMMENT ON FUNCTION "qti"."__stand_map_key_4gd3dvrew7"() IS 'the stand-up of the rule judge''s session tables a write of MapKey needs';

COMMENT ON FUNCTION "qti"."__stand_mapped_response_declaration_ax463fcvim"() IS 'the stand-up of the rule judge''s session tables a write of MappedResponseDeclaration needs';

COMMENT ON FUNCTION "qti"."__stand_mapping_base_type_nla6qf4roe"() IS 'the stand-up of the rule judge''s session tables a write of MappingBaseType needs';

COMMENT ON FUNCTION "qti"."__stand_mastery_value_7purucmckn"() IS 'the stand-up of the rule judge''s session tables a write of MasteryValue needs';

COMMENT ON FUNCTION "qti"."__stand_matched_identifier_xuqfo2twc2"() IS 'the stand-up of the rule judge''s session tables a write of MatchedIdentifier needs';

COMMENT ON FUNCTION "qti"."__stand_matched_title_5nl6ctajs6"() IS 'the stand-up of the rule judge''s session tables a write of MatchedTitle needs';

COMMENT ON FUNCTION "qti"."__stand_math_action_f5wwzdrvm5"() IS 'the stand-up of the rule judge''s session tables a write of MathAction needs';

COMMENT ON FUNCTION "qti"."__stand_math_align_group_6xltg6lxo2"() IS 'the stand-up of the rule judge''s session tables a write of MathAlignGroup needs';

COMMENT ON FUNCTION "qti"."__stand_math_align_scope_u2bech2ml5"() IS 'the stand-up of the rule judge''s session tables a write of MathAlignScope needs';

COMMENT ON FUNCTION "qti"."__stand_math_cell_7pwv53nkxm"() IS 'the stand-up of the rule judge''s session tables a write of MathCell needs';

COMMENT ON FUNCTION "qti"."__stand_math_cn_d6ecu3zp5g"() IS 'the stand-up of the rule judge''s session tables a write of MathCn needs';

COMMENT ON FUNCTION "qti"."__stand_math_rank_nqeqnb4u7t"() IS 'the stand-up of the rule judge''s session tables a write of MathRank needs';

COMMENT ON FUNCTION "qti"."__stand_math_rank_node_dkutdee63g"() IS 'the stand-up of the rule judge''s session tables a write of MathRankNode needs';

COMMENT ON FUNCTION "qti"."__stand_media_5bf42f2xah"() IS 'the stand-up of the rule judge''s session tables a write of Media needs';

COMMENT ON FUNCTION "qti"."__stand_most_count_2kgjd3owwn"() IS 'the stand-up of the rule judge''s session tables a write of MostCount needs';

COMMENT ON FUNCTION "qti"."__stand_most_count_node_drfuysyv37"() IS 'the stand-up of the rule judge''s session tables a write of MostCountNode needs';

COMMENT ON FUNCTION "qti"."__stand_named_rt75iqktd4"() IS 'the stand-up of the rule judge''s session tables a write of Named needs';

COMMENT ON FUNCTION "qti"."__stand_named_declaration_zrl744e344"() IS 'the stand-up of the rule judge''s session tables a write of NamedDeclaration needs';

COMMENT ON FUNCTION "qti"."__stand_named_item_ref_eygbgzwhfp"() IS 'the stand-up of the rule judge''s session tables a write of NamedItemRef needs';

COMMENT ON FUNCTION "qti"."__stand_node_ufvsoeyzmq"() IS 'the stand-up of the rule judge''s session tables a write of Node needs';

COMMENT ON FUNCTION "qti"."__stand_normal_maximum_dzhr5xvmil"() IS 'the stand-up of the rule judge''s session tables a write of NormalMaximum needs';

COMMENT ON FUNCTION "qti"."__stand_normal_minimum_5mlwffgh5h"() IS 'the stand-up of the rule judge''s session tables a write of NormalMinimum needs';

COMMENT ON FUNCTION "qti"."__stand_numbered_reading_em4eroit7v"() IS 'the stand-up of the rule judge''s session tables a write of NumberedReading needs';

COMMENT ON FUNCTION "qti"."__stand_numbered_target_jhgzx2hchj"() IS 'the stand-up of the rule judge''s session tables a write of NumberedTarget needs';

COMMENT ON FUNCTION "qti"."__stand_object_identifier_x7yc2sapum"() IS 'the stand-up of the rule judge''s session tables a write of ObjectIdentifier needs';

COMMENT ON FUNCTION "qti"."__stand_open_attribute_kus4ehgwz4"() IS 'the stand-up of the rule judge''s session tables a write of OpenAttribute needs';

COMMENT ON FUNCTION "qti"."__stand_open_element_name_yc423a5h3x"() IS 'the stand-up of the rule judge''s session tables a write of OpenElementName needs';

COMMENT ON FUNCTION "qti"."__stand_open_element_type_ntz3lqtaqc"() IS 'the stand-up of the rule judge''s session tables a write of OpenElementType needs';

COMMENT ON FUNCTION "qti"."__stand_open_name_node_6yvpltfaaj"() IS 'the stand-up of the rule judge''s session tables a write of OpenNameNode needs';

COMMENT ON FUNCTION "qti"."__stand_operand_of_zjym6l3zyx"() IS 'the stand-up of the rule judge''s session tables a write of OperandOf needs';

COMMENT ON FUNCTION "qti"."__stand_other_vocabulary_type_h3f35rh6cp"() IS 'the stand-up of the rule judge''s session tables a write of OtherVocabularyType needs';

COMMENT ON FUNCTION "qti"."__stand_packaged_template_default_o5sqntp3fu"() IS 'the stand-up of the rule judge''s session tables a write of PackagedTemplateDefault needs';

COMMENT ON FUNCTION "qti"."__stand_pci_module_form_yzlgznmelb"() IS 'the stand-up of the rule judge''s session tables a write of PciModuleForm needs';

COMMENT ON FUNCTION "qti"."__stand_pi_xg74jk6xwy"() IS 'the stand-up of the rule judge''s session tables a write of Pi needs';

COMMENT ON FUNCTION "qti"."__stand_placed_binding_rbegxbfbcg"() IS 'the stand-up of the rule judge''s session tables a write of PlacedBinding needs';

COMMENT ON FUNCTION "qti"."__stand_placed_binding_base_type_node_xzw3alwgto"() IS 'the stand-up of the rule judge''s session tables a write of PlacedBindingBaseTypeNode needs';

COMMENT ON FUNCTION "qti"."__stand_placed_binding_cardinality_node_vbsxohzqha"() IS 'the stand-up of the rule judge''s session tables a write of PlacedBindingCardinalityNode needs';

COMMENT ON FUNCTION "qti"."__stand_placed_choice_54ymy46b3e"() IS 'the stand-up of the rule judge''s session tables a write of PlacedChoice needs';

COMMENT ON FUNCTION "qti"."__stand_placed_choice_or_hottext_rvcef5ftdn"() IS 'the stand-up of the rule judge''s session tables a write of PlacedChoiceOrHottext needs';

COMMENT ON FUNCTION "qti"."__stand_placed_expression_eajdtujnrh"() IS 'the stand-up of the rule judge''s session tables a write of PlacedExpression needs';

COMMENT ON FUNCTION "qti"."__stand_placed_expression_node_264vxpopgc"() IS 'the stand-up of the rule judge''s session tables a write of PlacedExpressionNode needs';

COMMENT ON FUNCTION "qti"."__stand_placed_expression_site_vu53kspxum"() IS 'the stand-up of the rule judge''s session tables a write of PlacedExpressionSite needs';

COMMENT ON FUNCTION "qti"."__stand_placed_filter_w4dyutptkr"() IS 'the stand-up of the rule judge''s session tables a write of PlacedFilter needs';

COMMENT ON FUNCTION "qti"."__stand_placed_hottext_donabbhxss"() IS 'the stand-up of the rule judge''s session tables a write of PlacedHottext needs';

COMMENT ON FUNCTION "qti"."__stand_placed_id_kbkipg3veh"() IS 'the stand-up of the rule judge''s session tables a write of PlacedId needs';

COMMENT ON FUNCTION "qti"."__stand_placed_idref_64inmhwtyc"() IS 'the stand-up of the rule judge''s session tables a write of PlacedIdref needs';

COMMENT ON FUNCTION "qti"."__stand_placed_include_path_stu35qu2ss"() IS 'the stand-up of the rule judge''s session tables a write of PlacedIncludePath needs';

COMMENT ON FUNCTION "qti"."__stand_placed_math_rank_5572svkpcq"() IS 'the stand-up of the rule judge''s session tables a write of PlacedMathRank needs';

COMMENT ON FUNCTION "qti"."__stand_placed_math_rank_node_l5br3bf42w"() IS 'the stand-up of the rule judge''s session tables a write of PlacedMathRankNode needs';

COMMENT ON FUNCTION "qti"."__stand_placed_reference_csv5hi2rgt"() IS 'the stand-up of the rule judge''s session tables a write of PlacedReference needs';

COMMENT ON FUNCTION "qti"."__stand_placed_reference_site_7qtoik42vw"() IS 'the stand-up of the rule judge''s session tables a write of PlacedReferenceSite needs';

COMMENT ON FUNCTION "qti"."__stand_placed_share_target_bt6g4coqwv"() IS 'the stand-up of the rule judge''s session tables a write of PlacedShareTarget needs';

COMMENT ON FUNCTION "qti"."__stand_placed_test_reference_gvrejeidzj"() IS 'the stand-up of the rule judge''s session tables a write of PlacedTestReference needs';

COMMENT ON FUNCTION "qti"."__stand_placed_variable_declaration_6t4k2crz5i"() IS 'the stand-up of the rule judge''s session tables a write of PlacedVariableDeclaration needs';

COMMENT ON FUNCTION "qti"."__stand_placed_variable_ref_m4ro6tg5kc"() IS 'the stand-up of the rule judge''s session tables a write of PlacedVariableRef needs';

COMMENT ON FUNCTION "qti"."__stand_placed_variable_ref_declaration_bxnwvmzeep"() IS 'the stand-up of the rule judge''s session tables a write of PlacedVariableRefDeclaration needs';

COMMENT ON FUNCTION "qti"."__stand_placed_variable_ref_node_2yoglynako"() IS 'the stand-up of the rule judge''s session tables a write of PlacedVariableRefNode needs';

COMMENT ON FUNCTION "qti"."__stand_placed_weighted_variable_4v4mi3o3cw"() IS 'the stand-up of the rule judge''s session tables a write of PlacedWeightedVariable needs';

COMMENT ON FUNCTION "qti"."__stand_prefixed_declaration_ujpmqgcbjq"() IS 'the stand-up of the rule judge''s session tables a write of PrefixedDeclaration needs';

COMMENT ON FUNCTION "qti"."__stand_prefixed_map_response_2urcxvag6y"() IS 'the stand-up of the rule judge''s session tables a write of PrefixedMapResponse needs';

COMMENT ON FUNCTION "qti"."__stand_prefixed_map_response_point_hiqh5cp7kt"() IS 'the stand-up of the rule judge''s session tables a write of PrefixedMapResponsePoint needs';

COMMENT ON FUNCTION "qti"."__stand_printed_variable_ref_e7jd2rdh3z"() IS 'the stand-up of the rule judge''s session tables a write of PrintedVariableRef needs';

COMMENT ON FUNCTION "qti"."__stand_processing_fc2mn4yln3"() IS 'the stand-up of the rule judge''s session tables a write of Processing needs';

COMMENT ON FUNCTION "qti"."__stand_processing_node_c5c2luld2m"() IS 'the stand-up of the rule judge''s session tables a write of ProcessingNode needs';

COMMENT ON FUNCTION "qti"."__stand_read_include_sniyf5hfmk"() IS 'the stand-up of the rule judge''s session tables a write of ReadInclude needs';

COMMENT ON FUNCTION "qti"."__stand_record_node_m6xd53ee4s"() IS 'the stand-up of the rule judge''s session tables a write of RecordNode needs';

COMMENT ON FUNCTION "qti"."__stand_record_set_value_cue4v3q3z6"() IS 'the stand-up of the rule judge''s session tables a write of RecordSetValue needs';

COMMENT ON FUNCTION "qti"."__stand_referable_name_aa3nuuhvgk"() IS 'the stand-up of the rule judge''s session tables a write of ReferableName needs';

COMMENT ON FUNCTION "qti"."__stand_reference_5zvivb5s2f"() IS 'the stand-up of the rule judge''s session tables a write of Reference needs';

COMMENT ON FUNCTION "qti"."__stand_reference_path_wo5g5edty7"() IS 'the stand-up of the rule judge''s session tables a write of ReferencePath needs';

COMMENT ON FUNCTION "qti"."__stand_required_parts_his5j6owp4"() IS 'the stand-up of the rule judge''s session tables a write of RequiredParts needs';

COMMENT ON FUNCTION "qti"."__stand_required_ssml_property_sw4vknftkh"() IS 'the stand-up of the rule judge''s session tables a write of RequiredSsmlProperty needs';

COMMENT ON FUNCTION "qti"."__stand_requirement_met_rwib76ueet"() IS 'the stand-up of the rule judge''s session tables a write of RequirementMet needs';

COMMENT ON FUNCTION "qti"."__stand_resolved_branch_rule_ircy4dxvd6"() IS 'the stand-up of the rule judge''s session tables a write of ResolvedBranchRule needs';

COMMENT ON FUNCTION "qti"."__stand_resource_document_j6gjtwm5zs"() IS 'the stand-up of the rule judge''s session tables a write of ResourceDocument needs';

COMMENT ON FUNCTION "qti"."__stand_resource_file_document_jary3rdpdp"() IS 'the stand-up of the rule judge''s session tables a write of ResourceFileDocument needs';

COMMENT ON FUNCTION "qti"."__stand_resource_file_outside_mykcfxseab"() IS 'the stand-up of the rule judge''s session tables a write of ResourceFileOutside needs';

COMMENT ON FUNCTION "qti"."__stand_resource_file_path_xdkzddetri"() IS 'the stand-up of the rule judge''s session tables a write of ResourceFilePath needs';

COMMENT ON FUNCTION "qti"."__stand_resource_href_m3jxi2ub6r"() IS 'the stand-up of the rule judge''s session tables a write of ResourceHref needs';

COMMENT ON FUNCTION "qti"."__stand_resource_href_outside_h5ayb4ywy5"() IS 'the stand-up of the rule judge''s session tables a write of ResourceHrefOutside needs';

COMMENT ON FUNCTION "qti"."__stand_resource_href_path_cetda5wlcb"() IS 'the stand-up of the rule judge''s session tables a write of ResourceHrefPath needs';

COMMENT ON FUNCTION "qti"."__stand_scope_node_7ojwhbfg7y"() IS 'the stand-up of the rule judge''s session tables a write of ScopeNode needs';

COMMENT ON FUNCTION "qti"."__stand_scoped_dir_hecd42mem2"() IS 'the stand-up of the rule judge''s session tables a write of ScopedDir needs';

COMMENT ON FUNCTION "qti"."__stand_selection_without_replacement_nbc57eklnp"() IS 'the stand-up of the rule judge''s session tables a write of SelectionWithoutReplacement needs';

COMMENT ON FUNCTION "qti"."__stand_share_fragment_vlshgysorq"() IS 'the stand-up of the rule judge''s session tables a write of ShareFragment needs';

COMMENT ON FUNCTION "qti"."__stand_share_source_mll2lfaclp"() IS 'the stand-up of the rule judge''s session tables a write of ShareSource needs';

COMMENT ON FUNCTION "qti"."__stand_share_target_uodbsrbtr7"() IS 'the stand-up of the rule judge''s session tables a write of ShareTarget needs';

COMMENT ON FUNCTION "qti"."__stand_site_tjfl6cjoct"() IS 'the stand-up of the rule judge''s session tables a write of Site needs';

COMMENT ON FUNCTION "qti"."__stand_site_path_5texh73t5e"() IS 'the stand-up of the rule judge''s session tables a write of SitePath needs';

COMMENT ON FUNCTION "qti"."__stand_site_target_7dcfpspkwp"() IS 'the stand-up of the rule judge''s session tables a write of SiteTarget needs';

COMMENT ON FUNCTION "qti"."__stand_sole_reading_d4pcf352ns"() IS 'the stand-up of the rule judge''s session tables a write of SoleReading needs';

COMMENT ON FUNCTION "qti"."__stand_srcset_rftu4ffapo"() IS 'the stand-up of the rule judge''s session tables a write of Srcset needs';

COMMENT ON FUNCTION "qti"."__stand_srcset_candidate_rjuo7n5ahk"() IS 'the stand-up of the rule judge''s session tables a write of SrcsetCandidate needs';

COMMENT ON FUNCTION "qti"."__stand_ssml_scope_qlkcnlkody"() IS 'the stand-up of the rule judge''s session tables a write of SsmlScope needs';

COMMENT ON FUNCTION "qti"."__stand_ssml_scope_node_spqh3dx6jh"() IS 'the stand-up of the rule judge''s session tables a write of SsmlScopeNode needs';

COMMENT ON FUNCTION "qti"."__stand_ssml_value_rehjllqdrn"() IS 'the stand-up of the rule judge''s session tables a write of SsmlValue needs';

COMMENT ON FUNCTION "qti"."__stand_stimulus_ref_3r7jqd3al5"() IS 'the stand-up of the rule judge''s session tables a write of StimulusRef needs';

COMMENT ON FUNCTION "qti"."__stand_structure_naming_e7qblltrz5"() IS 'the stand-up of the rule judge''s session tables a write of StructureNaming needs';

COMMENT ON FUNCTION "qti"."__stand_table_header_yxurhvfvyx"() IS 'the stand-up of the rule judge''s session tables a write of TableHeader needs';

COMMENT ON FUNCTION "qti"."__stand_template_processing_wyrpnafgc7"() IS 'the stand-up of the rule judge''s session tables a write of TemplateProcessing needs';

COMMENT ON FUNCTION "qti"."__stand_template_ref_5rw7gnm6ga"() IS 'the stand-up of the rule judge''s session tables a write of TemplateRef needs';

COMMENT ON FUNCTION "qti"."__stand_test_identifier_coa5bjtdf5"() IS 'the stand-up of the rule judge''s session tables a write of TestIdentifier needs';

COMMENT ON FUNCTION "qti"."__stand_test_reading_kgnjtxa5dx"() IS 'the stand-up of the rule judge''s session tables a write of TestReading needs';

COMMENT ON FUNCTION "qti"."__stand_text_reference_xbgifadnt4"() IS 'the stand-up of the rule judge''s session tables a write of TextReference needs';

COMMENT ON FUNCTION "qti"."__stand_text_reference_path_ijtliptx3w"() IS 'the stand-up of the rule judge''s session tables a write of TextReferencePath needs';

COMMENT ON FUNCTION "qti"."__stand_tolerance_token_zselyet75b"() IS 'the stand-up of the rule judge''s session tables a write of ToleranceToken needs';

COMMENT ON FUNCTION "qti"."__stand_trimmed_mark_4q4m52hwse"() IS 'the stand-up of the rule judge''s session tables a write of TrimmedMark needs';

COMMENT ON FUNCTION "qti"."__stand_typed_declaration_name_lprzo6ct7y"() IS 'the stand-up of the rule judge''s session tables a write of TypedDeclarationName needs';

COMMENT ON FUNCTION "qti"."__stand_typed_path_cdcmrc26w6"() IS 'the stand-up of the rule judge''s session tables a write of TypedPath needs';

COMMENT ON FUNCTION "qti"."__stand_unassembled_reference_mhlh2qp7lg"() IS 'the stand-up of the rule judge''s session tables a write of UnassembledReference needs';

COMMENT ON FUNCTION "qti"."__stand_unclaimed_name_hm3yqfiuix"() IS 'the stand-up of the rule judge''s session tables a write of UnclaimedName needs';

COMMENT ON FUNCTION "qti"."__stand_unknown_operand_base_zwgpmwhbpr"() IS 'the stand-up of the rule judge''s session tables a write of UnknownOperandBase needs';

COMMENT ON FUNCTION "qti"."__stand_unknown_tail_base_wr3vjuwroz"() IS 'the stand-up of the rule judge''s session tables a write of UnknownTailBase needs';

COMMENT ON FUNCTION "qti"."__stand_unread_type_href_fq7qkz4trs"() IS 'the stand-up of the rule judge''s session tables a write of UnreadTypeHref needs';

COMMENT ON FUNCTION "qti"."__stand_untargeted_item_ref_iauasvvcd5"() IS 'the stand-up of the rule judge''s session tables a write of UntargetedItemRef needs';

COMMENT ON FUNCTION "qti"."__stand_variable_ref_htgoqewgip"() IS 'the stand-up of the rule judge''s session tables a write of VariableRef needs';

COMMENT ON FUNCTION "qti"."__stand_variable_ref_node_msrvyls2eg"() IS 'the stand-up of the rule judge''s session tables a write of VariableRefNode needs';

COMMENT ON FUNCTION "qti"."__stand_weighted_variable_n5g7qowd6p"() IS 'the stand-up of the rule judge''s session tables a write of WeightedVariable needs';

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

COMMENT ON FUNCTION "qti"."__immutable_cn_part_text_kx34g5xopo"() IS 'immutability guard of CnPartText';

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

COMMENT ON FUNCTION "qti"."__immutable_variable_ref_2akeo54qw2"() IS 'immutability guard of VariableRef';

COMMENT ON FUNCTION "qti"."__immutable_xml_decl_xczaxf75t5"() IS 'immutability guard of XmlDecl';

COMMENT ON ROLE :"__live_lxch3umxkh" IS 'live source of qti';
