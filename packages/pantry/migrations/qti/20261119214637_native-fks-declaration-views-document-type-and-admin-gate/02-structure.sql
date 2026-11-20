DROP VIEW "qti_queries__author"."xml_lang";

DROP VIEW "qti_queries__author"."xml_decl";

DROP VIEW "qti_queries__author"."variable_ref_table";

DROP VIEW "qti_queries__author"."variable_ref_declaration";

DROP VIEW "qti_queries__author"."variable_ref_cardinality";

DROP VIEW "qti_queries__author"."variable_ref";

DROP VIEW "qti_queries__author"."usage_value_base_type";

DROP VIEW "qti_queries__author"."usage_value";

DROP VIEW "qti_queries__author"."text_reference_path";

DROP VIEW "qti_queries__author"."text_idref";

DROP VIEW "qti_queries__author"."test_document";

DROP VIEW "qti_queries__author"."template_ref_declaration";

DROP VIEW "qti_queries__author"."template_ref_cardinality";

DROP VIEW "qti_queries__author"."template_ref";

DROP VIEW "qti_queries__author"."table_scope";

DROP VIEW "qti_queries__author"."table_header";

DROP VIEW "qti_queries__author"."ssml_scope";

DROP VIEW "qti_queries__author"."site_target";

DROP VIEW "qti_queries__author"."site_path";

DROP VIEW "qti_queries__author"."site";

DROP VIEW "qti_queries__author"."share_target";

DROP VIEW "qti_queries__author"."share_fragment";

DROP VIEW "qti_queries__author"."sd_decl";

DROP VIEW "qti_queries__author"."rounding_mode_figures";

DROP VIEW "qti_queries__author"."rounding_figures";

DROP VIEW "qti_queries__author"."rounding";

DROP VIEW "qti_queries__author"."resource_document";

DROP VIEW "qti_queries__author"."reference_path";

DROP VIEW "qti_queries__author"."processing";

DROP VIEW "qti_queries__author"."printed_variable_ref_declaration";

DROP VIEW "qti_queries__author"."printed_variable_ref";

DROP VIEW "qti_queries__author"."placed_xml_lang";

DROP VIEW "qti_queries__author"."placed_variable_ref_declaration";

DROP VIEW "qti_queries__author"."placed_variable_ref";

DROP VIEW "qti_queries__author"."placed_share_target";

DROP VIEW "qti_queries__author"."placed_math_rank";

DROP VIEW "qti_queries__author"."placed_idref";

DROP VIEW "qti_queries__author"."placed_id";

DROP VIEW "qti_queries__author"."placed_catalog_ref";

DROP VIEW "qti_queries__author"."placed_binding_declaration";

DROP VIEW "qti_queries__author"."placed_binding_cardinality";

DROP VIEW "qti_queries__author"."placed_binding_base_type";

DROP VIEW "qti_queries__author"."open_element_type";

DROP VIEW "qti_queries__author"."open_element_name";

DROP VIEW "qti_queries__author"."open_attribute_entity";

DROP VIEW "qti_queries__author"."open_attribute";

DROP VIEW "qti_queries__author"."normal_minimum";

DROP VIEW "qti_queries__author"."node";

DROP VIEW "qti_queries__author"."namespace";

DROP VIEW "qti_queries__author"."named";

DROP VIEW "qti_queries__author"."most_count";

DROP VIEW "qti_queries__author"."math_rank";

DROP VIEW "qti_queries__author"."math_cn";

DROP VIEW "qti_queries__author"."math_align_scope";

DROP VIEW "qti_queries__author"."math_align_group";

DROP VIEW "qti_queries__author"."mastery_floor";

DROP VIEW "qti_queries__author"."literal";

DROP VIEW "qti_queries__author"."least_count";

DROP VIEW "qti_queries__author"."label_use";

DROP VIEW "qti_queries__author"."interaction_attribute";

DROP VIEW "qti_queries__author"."interaction";

DROP VIEW "qti_queries__author"."instance";

DROP VIEW "qti_queries__author"."inclusion";

DROP VIEW "qti_queries__author"."idref_target";

DROP VIEW "qti_queries__author"."idref";

DROP VIEW "qti_queries__author"."identity_text";

DROP VIEW "qti_queries__author"."fragment_template_ref_declaration";

DROP VIEW "qti_queries__author"."fragment_template_ref_cardinality";

DROP VIEW "qti_queries__author"."fragment_template_ref";

DROP VIEW "qti_queries__author"."fragment_scope";

DROP VIEW "qti_queries__author"."fragment_printed_ref_declaration";

DROP VIEW "qti_queries__author"."fragment_printed_ref";

DROP VIEW "qti_queries__author"."fragment_feedback_ref_declaration";

DROP VIEW "qti_queries__author"."fragment_feedback_ref_cardinality";

DROP VIEW "qti_queries__author"."fragment_feedback_ref";

DROP VIEW "qti_queries__author"."fragment_context_ref_declaration";

DROP VIEW "qti_queries__author"."fragment_context_ref";

DROP VIEW "qti_queries__author"."feedback_ref_declaration";

DROP VIEW "qti_queries__author"."feedback_ref_cardinality";

DROP VIEW "qti_queries__author"."feedback_ref";

DROP VIEW "qti_queries__author"."expression_attribute";

DROP VIEW "qti_queries__author"."expression";

DROP VIEW "qti_queries__author"."entry";

DROP VIEW "qti_queries__author"."encoding_decl";

DROP VIEW "qti_queries__author"."element_type";

DROP VIEW "qti_queries__author"."document_id";

DROP VIEW "qti_queries__author"."document";

DROP VIEW "qti_queries__author"."dependency";

DROP VIEW "qti_queries__author"."declaration_name";

DROP VIEW "qti_queries__author"."declaration_identifier";

DROP VIEW "qti_queries__author"."declaration";

DROP VIEW "qti_queries__author"."count_bound";

DROP VIEW "qti_queries__author"."context_ref_declaration";

DROP VIEW "qti_queries__author"."context_ref";

DROP VIEW "qti_queries__author"."cn_count";

DROP VIEW "qti_queries__author"."choice_interaction";

DROP VIEW "qti_queries__author"."choice";

DROP VIEW "qti_queries__author"."cell_leaf";

DROP VIEW "qti_queries__author"."cell_headers";

DROP VIEW "qti_queries__author"."catalog_target";

DROP VIEW "qti_queries__author"."catalog_scope";

DROP VIEW "qti_queries__author"."catalog_id";

DROP VIEW "qti_queries__author"."candidate_path";

DROP VIEW "qti_queries__author"."binding_declaration";

DROP VIEW "qti_queries__author"."binding_cardinality";

DROP VIEW "qti_queries__author"."binding_base_type";

DROP VIEW "qti_queries__author"."attribute_entity";

DROP VIEW "qti_queries__author"."attribute";

DROP VIEW "qti_queries__author"."assembled_catalog";

ALTER TABLE "qti"."attribute"
  ADD COLUMN "__lexical_5jffbis46p" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" GENERATED ALWAYS AS (CASE WHEN "lexical" ~ '\A[\u0009\u000A\u000D ]*[A-Z\_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u0131\u0134-\u013E\u0141-\u0148\u014A-\u017E\u0180-\u01C3\u01CD-\u01F0\u01F4\u01F5\u01FA-\u0217\u0250-\u02A8\u02BB-\u02C1\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03CE\u03D0-\u03D6\u03DA\u03DC\u03DE\u03E0\u03E2-\u03F3\u0401-\u040C\u040E-\u044F\u0451-\u045C\u045E-\u0481\u0490-\u04C4\u04C7\u04C8\u04CB\u04CC\u04D0-\u04EB\u04EE-\u04F5\u04F8\u04F9\u0531-\u0556\u0559\u0561-\u0586\u05D0-\u05EA\u05F0-\u05F2\u0621-\u063A\u0641-\u064A\u0671-\u06B7\u06BA-\u06BE\u06C0-\u06CE\u06D0-\u06D3\u06D5\u06E5\u06E6\u0905-\u0939\u093D\u0958-\u0961\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8B\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AE0\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B36-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB5\u0BB7-\u0BB9\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CDE\u0CE0\u0CE1\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D28\u0D2A-\u0D39\u0D60\u0D61\u0E01-\u0E2E\u0E30\u0E32\u0E33\u0E40-\u0E45\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD\u0EAE\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0F40-\u0F47\u0F49-\u0F69\u10A0-\u10C5\u10D0-\u10F6\u1100\u1102\u1103\u1105-\u1107\u1109\u110B\u110C\u110E-\u1112\u113C\u113E\u1140\u114C\u114E\u1150\u1154\u1155\u1159\u115F-\u1161\u1163\u1165\u1167\u1169\u116D\u116E\u1172\u1173\u1175\u119E\u11A8\u11AB\u11AE\u11AF\u11B7\u11B8\u11BA\u11BC-\u11C2\u11EB\u11F0\u11F9\u1E00-\u1E9B\u1EA0-\u1EF9\u1F00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2126\u212A\u212B\u212E\u2180-\u2182\u3007\u3021-\u3029\u3041-\u3094\u30A1-\u30FA\u3105-\u312C\u4E00-\u9FA5\uAC00-\uD7A3][\-\.0-9A-Z\_a-z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u0131\u0134-\u013E\u0141-\u0148\u014A-\u017E\u0180-\u01C3\u01CD-\u01F0\u01F4\u01F5\u01FA-\u0217\u0250-\u02A8\u02BB-\u02C1\u02D0\u02D1\u0300-\u0345\u0360\u0361\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03CE\u03D0-\u03D6\u03DA\u03DC\u03DE\u03E0\u03E2-\u03F3\u0401-\u040C\u040E-\u044F\u0451-\u045C\u045E-\u0481\u0483-\u0486\u0490-\u04C4\u04C7\u04C8\u04CB\u04CC\u04D0-\u04EB\u04EE-\u04F5\u04F8\u04F9\u0531-\u0556\u0559\u0561-\u0586\u0591-\u05A1\u05A3-\u05B9\u05BB-\u05BD\u05BF\u05C1\u05C2\u05C4\u05D0-\u05EA\u05F0-\u05F2\u0621-\u063A\u0640-\u0652\u0660-\u0669\u0670-\u06B7\u06BA-\u06BE\u06C0-\u06CE\u06D0-\u06D3\u06D5-\u06E8\u06EA-\u06ED\u06F0-\u06F9\u0901-\u0903\u0905-\u0939\u093C-\u094D\u0951-\u0954\u0958-\u0963\u0966-\u096F\u0981-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A02\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A59-\u0A5C\u0A5E\u0A66-\u0A74\u0A81-\u0A83\u0A85-\u0A8B\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE0\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B36-\u0B39\u0B3C-\u0B43\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B61\u0B66-\u0B6F\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB5\u0BB7-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0BE7-\u0BEF\u0C01-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C60\u0C61\u0C66-\u0C6F\u0C82\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0\u0CE1\u0CE6-\u0CEF\u0D02\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D28\u0D2A-\u0D39\u0D3E-\u0D43\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D60\u0D61\u0D66-\u0D6F\u0E01-\u0E2E\u0E30-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD\u0EAE\u0EB0-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F69\u0F71-\u0F84\u0F86-\u0F8B\u0F90-\u0F95\u0F97\u0F99-\u0FAD\u0FB1-\u0FB7\u0FB9\u10A0-\u10C5\u10D0-\u10F6\u1100\u1102\u1103\u1105-\u1107\u1109\u110B\u110C\u110E-\u1112\u113C\u113E\u1140\u114C\u114E\u1150\u1154\u1155\u1159\u115F-\u1161\u1163\u1165\u1167\u1169\u116D\u116E\u1172\u1173\u1175\u119E\u11A8\u11AB\u11AE\u11AF\u11B7\u11B8\u11BA\u11BC-\u11C2\u11EB\u11F0\u11F9\u1E00-\u1E9B\u1EA0-\u1EF9\u1F00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u20D0-\u20DC\u20E1\u2126\u212A\u212B\u212E\u2180-\u2182\u3005\u3007\u3021-\u302F\u3031-\u3035\u3041-\u3094\u3099\u309A\u309D\u309E\u30A1-\u30FA\u30FC-\u30FE\u3105-\u312C\u4E00-\u9FA5\uAC00-\uD7A3]*[\u0009\u000A\u000D ]*\Z'::"pg_catalog"."text" AND "kind" = 313::smallint AND "name" = 243::smallint AND "path" = 'imsmanifest.xml'::"pg_catalog"."text" THEN "lexical" END) STORED,
  ADD COLUMN "__package_cl3pk5vj2u" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" GENERATED ALWAYS AS (CASE WHEN "lexical" ~ '\A[\u0009\u000A\u000D ]*[A-Z\_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u0131\u0134-\u013E\u0141-\u0148\u014A-\u017E\u0180-\u01C3\u01CD-\u01F0\u01F4\u01F5\u01FA-\u0217\u0250-\u02A8\u02BB-\u02C1\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03CE\u03D0-\u03D6\u03DA\u03DC\u03DE\u03E0\u03E2-\u03F3\u0401-\u040C\u040E-\u044F\u0451-\u045C\u045E-\u0481\u0490-\u04C4\u04C7\u04C8\u04CB\u04CC\u04D0-\u04EB\u04EE-\u04F5\u04F8\u04F9\u0531-\u0556\u0559\u0561-\u0586\u05D0-\u05EA\u05F0-\u05F2\u0621-\u063A\u0641-\u064A\u0671-\u06B7\u06BA-\u06BE\u06C0-\u06CE\u06D0-\u06D3\u06D5\u06E5\u06E6\u0905-\u0939\u093D\u0958-\u0961\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8B\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AE0\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B36-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB5\u0BB7-\u0BB9\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CDE\u0CE0\u0CE1\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D28\u0D2A-\u0D39\u0D60\u0D61\u0E01-\u0E2E\u0E30\u0E32\u0E33\u0E40-\u0E45\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD\u0EAE\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0F40-\u0F47\u0F49-\u0F69\u10A0-\u10C5\u10D0-\u10F6\u1100\u1102\u1103\u1105-\u1107\u1109\u110B\u110C\u110E-\u1112\u113C\u113E\u1140\u114C\u114E\u1150\u1154\u1155\u1159\u115F-\u1161\u1163\u1165\u1167\u1169\u116D\u116E\u1172\u1173\u1175\u119E\u11A8\u11AB\u11AE\u11AF\u11B7\u11B8\u11BA\u11BC-\u11C2\u11EB\u11F0\u11F9\u1E00-\u1E9B\u1EA0-\u1EF9\u1F00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2126\u212A\u212B\u212E\u2180-\u2182\u3007\u3021-\u3029\u3041-\u3094\u30A1-\u30FA\u3105-\u312C\u4E00-\u9FA5\uAC00-\uD7A3][\-\.0-9A-Z\_a-z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u0131\u0134-\u013E\u0141-\u0148\u014A-\u017E\u0180-\u01C3\u01CD-\u01F0\u01F4\u01F5\u01FA-\u0217\u0250-\u02A8\u02BB-\u02C1\u02D0\u02D1\u0300-\u0345\u0360\u0361\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03CE\u03D0-\u03D6\u03DA\u03DC\u03DE\u03E0\u03E2-\u03F3\u0401-\u040C\u040E-\u044F\u0451-\u045C\u045E-\u0481\u0483-\u0486\u0490-\u04C4\u04C7\u04C8\u04CB\u04CC\u04D0-\u04EB\u04EE-\u04F5\u04F8\u04F9\u0531-\u0556\u0559\u0561-\u0586\u0591-\u05A1\u05A3-\u05B9\u05BB-\u05BD\u05BF\u05C1\u05C2\u05C4\u05D0-\u05EA\u05F0-\u05F2\u0621-\u063A\u0640-\u0652\u0660-\u0669\u0670-\u06B7\u06BA-\u06BE\u06C0-\u06CE\u06D0-\u06D3\u06D5-\u06E8\u06EA-\u06ED\u06F0-\u06F9\u0901-\u0903\u0905-\u0939\u093C-\u094D\u0951-\u0954\u0958-\u0963\u0966-\u096F\u0981-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A02\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A59-\u0A5C\u0A5E\u0A66-\u0A74\u0A81-\u0A83\u0A85-\u0A8B\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE0\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B36-\u0B39\u0B3C-\u0B43\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B61\u0B66-\u0B6F\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB5\u0BB7-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0BE7-\u0BEF\u0C01-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C60\u0C61\u0C66-\u0C6F\u0C82\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0\u0CE1\u0CE6-\u0CEF\u0D02\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D28\u0D2A-\u0D39\u0D3E-\u0D43\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D60\u0D61\u0D66-\u0D6F\u0E01-\u0E2E\u0E30-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD\u0EAE\u0EB0-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F69\u0F71-\u0F84\u0F86-\u0F8B\u0F90-\u0F95\u0F97\u0F99-\u0FAD\u0FB1-\u0FB7\u0FB9\u10A0-\u10C5\u10D0-\u10F6\u1100\u1102\u1103\u1105-\u1107\u1109\u110B\u110C\u110E-\u1112\u113C\u113E\u1140\u114C\u114E\u1150\u1154\u1155\u1159\u115F-\u1161\u1163\u1165\u1167\u1169\u116D\u116E\u1172\u1173\u1175\u119E\u11A8\u11AB\u11AE\u11AF\u11B7\u11B8\u11BA\u11BC-\u11C2\u11EB\u11F0\u11F9\u1E00-\u1E9B\u1EA0-\u1EF9\u1F00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u20D0-\u20DC\u20E1\u2126\u212A\u212B\u212E\u2180-\u2182\u3005\u3007\u3021-\u302F\u3031-\u3035\u3041-\u3094\u3099\u309A\u309D\u309E\u30A1-\u30FA\u30FC-\u30FE\u3105-\u312C\u4E00-\u9FA5\uAC00-\uD7A3]*[\u0009\u000A\u000D ]*\Z'::"pg_catalog"."text" AND "kind" = 313::smallint AND "name" = 243::smallint AND "path" = 'imsmanifest.xml'::"pg_catalog"."text" THEN "package" END) STORED,
  ADD COLUMN "__path_ohpc6sozn2" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" GENERATED ALWAYS AS (CASE WHEN "lexical" ~ '\A[\u0009\u000A\u000D ]*[A-Z\_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u0131\u0134-\u013E\u0141-\u0148\u014A-\u017E\u0180-\u01C3\u01CD-\u01F0\u01F4\u01F5\u01FA-\u0217\u0250-\u02A8\u02BB-\u02C1\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03CE\u03D0-\u03D6\u03DA\u03DC\u03DE\u03E0\u03E2-\u03F3\u0401-\u040C\u040E-\u044F\u0451-\u045C\u045E-\u0481\u0490-\u04C4\u04C7\u04C8\u04CB\u04CC\u04D0-\u04EB\u04EE-\u04F5\u04F8\u04F9\u0531-\u0556\u0559\u0561-\u0586\u05D0-\u05EA\u05F0-\u05F2\u0621-\u063A\u0641-\u064A\u0671-\u06B7\u06BA-\u06BE\u06C0-\u06CE\u06D0-\u06D3\u06D5\u06E5\u06E6\u0905-\u0939\u093D\u0958-\u0961\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8B\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AE0\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B36-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB5\u0BB7-\u0BB9\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CDE\u0CE0\u0CE1\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D28\u0D2A-\u0D39\u0D60\u0D61\u0E01-\u0E2E\u0E30\u0E32\u0E33\u0E40-\u0E45\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD\u0EAE\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0F40-\u0F47\u0F49-\u0F69\u10A0-\u10C5\u10D0-\u10F6\u1100\u1102\u1103\u1105-\u1107\u1109\u110B\u110C\u110E-\u1112\u113C\u113E\u1140\u114C\u114E\u1150\u1154\u1155\u1159\u115F-\u1161\u1163\u1165\u1167\u1169\u116D\u116E\u1172\u1173\u1175\u119E\u11A8\u11AB\u11AE\u11AF\u11B7\u11B8\u11BA\u11BC-\u11C2\u11EB\u11F0\u11F9\u1E00-\u1E9B\u1EA0-\u1EF9\u1F00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2126\u212A\u212B\u212E\u2180-\u2182\u3007\u3021-\u3029\u3041-\u3094\u30A1-\u30FA\u3105-\u312C\u4E00-\u9FA5\uAC00-\uD7A3][\-\.0-9A-Z\_a-z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u0131\u0134-\u013E\u0141-\u0148\u014A-\u017E\u0180-\u01C3\u01CD-\u01F0\u01F4\u01F5\u01FA-\u0217\u0250-\u02A8\u02BB-\u02C1\u02D0\u02D1\u0300-\u0345\u0360\u0361\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03CE\u03D0-\u03D6\u03DA\u03DC\u03DE\u03E0\u03E2-\u03F3\u0401-\u040C\u040E-\u044F\u0451-\u045C\u045E-\u0481\u0483-\u0486\u0490-\u04C4\u04C7\u04C8\u04CB\u04CC\u04D0-\u04EB\u04EE-\u04F5\u04F8\u04F9\u0531-\u0556\u0559\u0561-\u0586\u0591-\u05A1\u05A3-\u05B9\u05BB-\u05BD\u05BF\u05C1\u05C2\u05C4\u05D0-\u05EA\u05F0-\u05F2\u0621-\u063A\u0640-\u0652\u0660-\u0669\u0670-\u06B7\u06BA-\u06BE\u06C0-\u06CE\u06D0-\u06D3\u06D5-\u06E8\u06EA-\u06ED\u06F0-\u06F9\u0901-\u0903\u0905-\u0939\u093C-\u094D\u0951-\u0954\u0958-\u0963\u0966-\u096F\u0981-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A02\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A59-\u0A5C\u0A5E\u0A66-\u0A74\u0A81-\u0A83\u0A85-\u0A8B\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE0\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B36-\u0B39\u0B3C-\u0B43\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B61\u0B66-\u0B6F\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB5\u0BB7-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0BE7-\u0BEF\u0C01-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C60\u0C61\u0C66-\u0C6F\u0C82\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0\u0CE1\u0CE6-\u0CEF\u0D02\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D28\u0D2A-\u0D39\u0D3E-\u0D43\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D60\u0D61\u0D66-\u0D6F\u0E01-\u0E2E\u0E30-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD\u0EAE\u0EB0-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F69\u0F71-\u0F84\u0F86-\u0F8B\u0F90-\u0F95\u0F97\u0F99-\u0FAD\u0FB1-\u0FB7\u0FB9\u10A0-\u10C5\u10D0-\u10F6\u1100\u1102\u1103\u1105-\u1107\u1109\u110B\u110C\u110E-\u1112\u113C\u113E\u1140\u114C\u114E\u1150\u1154\u1155\u1159\u115F-\u1161\u1163\u1165\u1167\u1169\u116D\u116E\u1172\u1173\u1175\u119E\u11A8\u11AB\u11AE\u11AF\u11B7\u11B8\u11BA\u11BC-\u11C2\u11EB\u11F0\u11F9\u1E00-\u1E9B\u1EA0-\u1EF9\u1F00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u20D0-\u20DC\u20E1\u2126\u212A\u212B\u212E\u2180-\u2182\u3005\u3007\u3021-\u302F\u3031-\u3035\u3041-\u3094\u3099\u309A\u309D\u309E\u30A1-\u30FA\u30FC-\u30FE\u3105-\u312C\u4E00-\u9FA5\uAC00-\uD7A3]*[\u0009\u000A\u000D ]*\Z'::"pg_catalog"."text" AND "kind" = 313::smallint AND "name" = 243::smallint AND "path" = 'imsmanifest.xml'::"pg_catalog"."text" THEN "path" END) STORED,
  ADD COLUMN "__start_7c7wkvj7tg" bigint GENERATED ALWAYS AS (CASE WHEN "lexical" ~ '\A[\u0009\u000A\u000D ]*[A-Z\_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u0131\u0134-\u013E\u0141-\u0148\u014A-\u017E\u0180-\u01C3\u01CD-\u01F0\u01F4\u01F5\u01FA-\u0217\u0250-\u02A8\u02BB-\u02C1\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03CE\u03D0-\u03D6\u03DA\u03DC\u03DE\u03E0\u03E2-\u03F3\u0401-\u040C\u040E-\u044F\u0451-\u045C\u045E-\u0481\u0490-\u04C4\u04C7\u04C8\u04CB\u04CC\u04D0-\u04EB\u04EE-\u04F5\u04F8\u04F9\u0531-\u0556\u0559\u0561-\u0586\u05D0-\u05EA\u05F0-\u05F2\u0621-\u063A\u0641-\u064A\u0671-\u06B7\u06BA-\u06BE\u06C0-\u06CE\u06D0-\u06D3\u06D5\u06E5\u06E6\u0905-\u0939\u093D\u0958-\u0961\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8B\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AE0\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B36-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB5\u0BB7-\u0BB9\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CDE\u0CE0\u0CE1\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D28\u0D2A-\u0D39\u0D60\u0D61\u0E01-\u0E2E\u0E30\u0E32\u0E33\u0E40-\u0E45\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD\u0EAE\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0F40-\u0F47\u0F49-\u0F69\u10A0-\u10C5\u10D0-\u10F6\u1100\u1102\u1103\u1105-\u1107\u1109\u110B\u110C\u110E-\u1112\u113C\u113E\u1140\u114C\u114E\u1150\u1154\u1155\u1159\u115F-\u1161\u1163\u1165\u1167\u1169\u116D\u116E\u1172\u1173\u1175\u119E\u11A8\u11AB\u11AE\u11AF\u11B7\u11B8\u11BA\u11BC-\u11C2\u11EB\u11F0\u11F9\u1E00-\u1E9B\u1EA0-\u1EF9\u1F00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2126\u212A\u212B\u212E\u2180-\u2182\u3007\u3021-\u3029\u3041-\u3094\u30A1-\u30FA\u3105-\u312C\u4E00-\u9FA5\uAC00-\uD7A3][\-\.0-9A-Z\_a-z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u0131\u0134-\u013E\u0141-\u0148\u014A-\u017E\u0180-\u01C3\u01CD-\u01F0\u01F4\u01F5\u01FA-\u0217\u0250-\u02A8\u02BB-\u02C1\u02D0\u02D1\u0300-\u0345\u0360\u0361\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03CE\u03D0-\u03D6\u03DA\u03DC\u03DE\u03E0\u03E2-\u03F3\u0401-\u040C\u040E-\u044F\u0451-\u045C\u045E-\u0481\u0483-\u0486\u0490-\u04C4\u04C7\u04C8\u04CB\u04CC\u04D0-\u04EB\u04EE-\u04F5\u04F8\u04F9\u0531-\u0556\u0559\u0561-\u0586\u0591-\u05A1\u05A3-\u05B9\u05BB-\u05BD\u05BF\u05C1\u05C2\u05C4\u05D0-\u05EA\u05F0-\u05F2\u0621-\u063A\u0640-\u0652\u0660-\u0669\u0670-\u06B7\u06BA-\u06BE\u06C0-\u06CE\u06D0-\u06D3\u06D5-\u06E8\u06EA-\u06ED\u06F0-\u06F9\u0901-\u0903\u0905-\u0939\u093C-\u094D\u0951-\u0954\u0958-\u0963\u0966-\u096F\u0981-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A02\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A59-\u0A5C\u0A5E\u0A66-\u0A74\u0A81-\u0A83\u0A85-\u0A8B\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE0\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B36-\u0B39\u0B3C-\u0B43\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B61\u0B66-\u0B6F\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB5\u0BB7-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0BE7-\u0BEF\u0C01-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C60\u0C61\u0C66-\u0C6F\u0C82\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0\u0CE1\u0CE6-\u0CEF\u0D02\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D28\u0D2A-\u0D39\u0D3E-\u0D43\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D60\u0D61\u0D66-\u0D6F\u0E01-\u0E2E\u0E30-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD\u0EAE\u0EB0-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F69\u0F71-\u0F84\u0F86-\u0F8B\u0F90-\u0F95\u0F97\u0F99-\u0FAD\u0FB1-\u0FB7\u0FB9\u10A0-\u10C5\u10D0-\u10F6\u1100\u1102\u1103\u1105-\u1107\u1109\u110B\u110C\u110E-\u1112\u113C\u113E\u1140\u114C\u114E\u1150\u1154\u1155\u1159\u115F-\u1161\u1163\u1165\u1167\u1169\u116D\u116E\u1172\u1173\u1175\u119E\u11A8\u11AB\u11AE\u11AF\u11B7\u11B8\u11BA\u11BC-\u11C2\u11EB\u11F0\u11F9\u1E00-\u1E9B\u1EA0-\u1EF9\u1F00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u20D0-\u20DC\u20E1\u2126\u212A\u212B\u212E\u2180-\u2182\u3005\u3007\u3021-\u302F\u3031-\u3035\u3041-\u3094\u3099\u309A\u309D\u309E\u30A1-\u30FA\u30FC-\u30FE\u3105-\u312C\u4E00-\u9FA5\uAC00-\uD7A3]*[\u0009\u000A\u000D ]*\Z'::"pg_catalog"."text" AND "kind" = 313::smallint AND "name" = 243::smallint AND "path" = 'imsmanifest.xml'::"pg_catalog"."text" THEN "start" END) STORED;

ALTER TABLE "qti"."document"
  DROP CONSTRAINT "root_of_type",
  ADD CONSTRAINT "root_of_type" CHECK (("document_type" = 0::smallint AND "path" = 'imsmanifest.xml'::"pg_catalog"."text" OR "document_type" <> 0::smallint AND "path" <> 'imsmanifest.xml'::"pg_catalog"."text") IS TRUE) NOT VALID;

ALTER TABLE "qti"."assembled_catalog" ADD CONSTRAINT "__assembled_catalog_fk_package_path_owner_cwkxri6hfw" FOREIGN KEY ("package", "path", "owner") REFERENCES "qti"."catalog_id" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."attribute" ADD CONSTRAINT "__attribute_fk_package_path_start_lexical_cdoiz46a4g" FOREIGN KEY ("__package_cl3pk5vj2u", "__path_ohpc6sozn2", "__start_7c7wkvj7tg", "__lexical_5jffbis46p") REFERENCES "qti"."dependency" ("package", "path", "start", "lexical") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."attribute_entity" ADD CONSTRAINT "__attribute_entity_fk_package_path_start_name_mzkbpjqrfj" FOREIGN KEY ("package", "path", "start", "name") REFERENCES "qti"."attribute" ("package", "path", "start", "name") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."candidate_path" ADD CONSTRAINT "__candidate_path_fk_package_target_aynqp2vyvf" FOREIGN KEY ("package", "target") REFERENCES "qti"."entry" ("package", "path") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."catalog_scope" ADD CONSTRAINT "__catalog_scope_fk_package_path_start_naheth2be3" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."cell_headers" ADD CONSTRAINT "__cell_headers_fk_package_path_start_5bbvstgdmm" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."table_scope" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."choice" ADD CONSTRAINT "__choice_fk_package_path_start_hjjl442vss" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."choice_interaction" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."count_bound" ADD CONSTRAINT "__count_bound_fk_package_path_start_t5pqtfs3rz" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."encoding_decl" ADD CONSTRAINT "__encoding_decl_fk_package_path_u5grbt7fag" FOREIGN KEY ("package", "path") REFERENCES "qti"."xml_decl" ("package", "path") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."expression" ADD CONSTRAINT "__expression_fk_package_path_start_f6hwlqhv67" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."identity_text" ADD CONSTRAINT "__identity_text_fk_package_path_start_vymux7o4os" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."idref" ADD CONSTRAINT "__idref_fk_package_path_token_vc7e2dybao" FOREIGN KEY ("package", "path", "token") REFERENCES "qti"."idref_target" ("package", "path", "id") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."interaction" ADD CONSTRAINT "__interaction_fk_package_path_start_wpfpdpxf37" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."least_count" ADD CONSTRAINT "__least_count_fk_package_path_start_vgly2zkjt2" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."count_bound" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."math_align_scope" ADD CONSTRAINT "__math_align_scope_fk_package_path_start_jfr4iz7vmr" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."math_rank" ADD CONSTRAINT "__math_rank_fk_package_path_start_z7fxfctmgv" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."most_count" ADD CONSTRAINT "__most_count_fk_package_path_start_nmmdsz5znz" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."count_bound" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."named" ADD CONSTRAINT "__named_fk_package_path_jmclgjz4so" FOREIGN KEY ("package", "path") REFERENCES "qti"."test_document" ("package", "path") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."namespace" ADD CONSTRAINT "__namespace_fk_package_path_start_4tsm66w6qo" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."open_attribute_entity" ADD CONSTRAINT "__open_attribute_entity_fk_package_path_start_uri_ccjfi3dv74" FOREIGN KEY ("package", "path", "start", "uri", "local") REFERENCES "qti"."open_attribute" ("package", "path", "start", "uri", "local") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."open_element_name" ADD CONSTRAINT "__open_element_name_fk_package_path_start_dgkc2wpi7w" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."open_element_type" ADD CONSTRAINT "__open_element_type_fk_package_path_start_jjjipij4kp" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."open_element_name" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."placed_catalog_ref" ADD CONSTRAINT "__placed_catalog_ref_fk_package_assembly_id_ekloeln6cs" FOREIGN KEY ("package", "assembly", "id") REFERENCES "qti"."assembled_catalog" ("package", "assembly", "id") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."placed_idref" ADD CONSTRAINT "__placed_idref_fk_package_path_id_gx6cf6dfqn" FOREIGN KEY ("package", "path", "id") REFERENCES "qti"."idref_target" ("package", "path", "id") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."placed_math_rank" ADD CONSTRAINT "__placed_math_rank_fk_package_path_start_5kblemgm5d" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."placed_share_target"
  ADD CONSTRAINT "__placed_share_target_fk_package_assembly_instance_mcp6dsg3aq" FOREIGN KEY ("package", "assembly", "instance", "start") REFERENCES "qti"."placed_math_rank" ("package", "assembly", "instance", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID,
  ADD CONSTRAINT "__placed_share_target_fk_package_assembly_target_4oz3u75j3w" FOREIGN KEY ("package", "assembly", "target_instance", "target_start") REFERENCES "qti"."placed_math_rank" ("package", "assembly", "instance", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."processing" ADD CONSTRAINT "__processing_fk_package_path_start_buuyxfkq34" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."reference_path" ADD CONSTRAINT "__reference_path_fk_package_target_pch7muxr75" FOREIGN KEY ("package", "target") REFERENCES "qti"."entry" ("package", "path") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."rounding" ADD CONSTRAINT "__rounding_fk_package_path_start_paqrdg26bu" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."sd_decl" ADD CONSTRAINT "__sd_decl_fk_package_path_xxx5gjp4e7" FOREIGN KEY ("package", "path") REFERENCES "qti"."xml_decl" ("package", "path") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."share_fragment" ADD CONSTRAINT "__share_fragment_fk_package_path_id_lwcavdammq" FOREIGN KEY ("package", "path", "id") REFERENCES "qti"."idref_target" ("package", "path", "id") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."share_target"
  ADD CONSTRAINT "__share_target_fk_package_path_start_vut3y6yjq2" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."math_rank" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID,
  ADD CONSTRAINT "__share_target_fk_package_path_target_start_lyzjcsg3y5" FOREIGN KEY ("package", "path", "target_start") REFERENCES "qti"."math_rank" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."site_target" ADD CONSTRAINT "__site_target_fk_package_path_start_an3f4rh7xg" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."inclusion" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."ssml_scope" ADD CONSTRAINT "__ssml_scope_fk_package_path_start_ixilycttqs" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."table_header" ADD CONSTRAINT "__table_header_fk_package_path_start_dhca6a32iq" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."table_scope" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."table_scope" ADD CONSTRAINT "__table_scope_fk_package_path_start_scalw6ieaw" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."text_idref" ADD CONSTRAINT "__text_idref_fk_package_path_token_ltwts2zlhw" FOREIGN KEY ("package", "path", "token") REFERENCES "qti"."idref_target" ("package", "path", "id") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."text_reference_path" ADD CONSTRAINT "__text_reference_path_fk_package_target_7wuvskqxw6" FOREIGN KEY ("package", "target") REFERENCES "qti"."entry" ("package", "path") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."xml_decl" ADD CONSTRAINT "__xml_decl_fk_package_path_ge2web3hon" FOREIGN KEY ("package", "path") REFERENCES "qti"."document" ("package", "path") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

CREATE VIEW "qti_queries__author"."assembled_catalog" ("assembly", "id", "owner", "package", "path") AS
SELECT "r1"."assembly", "r1"."id", "r1"."owner", "r1"."package", "r1"."path"
FROM "qti"."assembled_catalog" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."assembled_catalog" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."attribute" ("governor", "governor_name", "idref_text", "idrefs", "kind", "kind_name", "lexical", "name", "name_name", "package", "path", "prefix", "slot", "start") AS
SELECT "r1"."governor", ("qti"."__governor_names_d7jfyla3na"())["r1"."governor" + 1]::"pg_catalog"."text", "r1"."idref_text", "r1"."idrefs", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."lexical", "r1"."name", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."name" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."prefix", "r1"."slot", "r1"."start"
FROM "qti"."attribute" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."attribute" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."attribute_entity" ("entity", "name", "name_name", "offset", "package", "path", "start") AS
SELECT "r1"."entity", "r1"."name", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."name" + 1]::"pg_catalog"."text", "r1"."offset", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."attribute_entity" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."attribute_entity" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."candidate_path" ("at", "package", "path", "start", "target") AS
SELECT "r1"."at", "r1"."package", "r1"."path", "r1"."start", "r1"."target"
FROM "qti"."candidate_path" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."candidate_path" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."catalog_id" ("id", "owner", "package", "path", "start") AS
SELECT "r1"."id", "r1"."owner", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."catalog_id" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."catalog_id" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."catalog_scope" ("package", "path", "scope", "start") AS
SELECT "r1"."package", "r1"."path", "r1"."scope", "r1"."start"
FROM "qti"."catalog_scope" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."catalog_scope" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."catalog_target" ("assembled", "carriers", "id", "package", "path", "placements") AS
SELECT "r1"."assembled", "r1"."carriers", "r1"."id", "r1"."package", "r1"."path", "r1"."placements"
FROM "qti"."catalog_target" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."catalog_target" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."cell_headers" ("lexical", "package", "path", "start", "token_text", "tokens") AS
SELECT "r1"."lexical", "r1"."package", "r1"."path", "r1"."start", "r1"."token_text", "r1"."tokens"
FROM "qti"."cell_headers" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."cell_headers" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."cell_leaf" ("at", "cell", "package", "path", "start", "start_after", "start_was") AS
SELECT "r1"."at", "r1"."cell", "r1"."package", "r1"."path", "r1"."start", "r1"."start_after", "r1"."start_was"
FROM "qti"."cell_leaf" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."cell_leaf" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."choice" ("identifier", "package", "path", "start") AS
SELECT "r1"."identifier", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."choice" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."choice" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."choice_interaction" ("interaction", "interaction_path", "package", "path", "start") AS
SELECT "r1"."interaction", "r1"."interaction_path", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."choice_interaction" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."choice_interaction" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."cn_count" ("package", "parts", "path", "start", "type", "type_name", "type_lexical") AS
SELECT "r1"."package", "r1"."parts", "r1"."path", "r1"."start", "r1"."type", ("qti"."__cn_type_names_wmjelllvhg"())["r1"."type" + 1]::"pg_catalog"."text", "r1"."type_lexical"
FROM "qti"."cn_count" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."cn_count" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."context_ref" ("assembly_kind", "assembly_kind_name", "attribute", "attribute_name", "identifier", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."assembly_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."assembly_kind" + 1]::"pg_catalog"."text", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."context_ref" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."context_ref" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."count_bound" ("max_name", "max_name_name", "max_written", "min_name", "min_name_name", "min_written", "package", "path", "start") AS
SELECT "r1"."max_name", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."max_name" + 1]::"pg_catalog"."text", "r1"."max_written", "r1"."min_name", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."min_name" + 1]::"pg_catalog"."text", "r1"."min_written", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."count_bound" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."count_bound" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."declaration" ("base_types", "cardinalities", "masteries", "maximums", "minimums", "package", "path", "start") AS
SELECT "r1"."base_types", "r1"."cardinalities", "r1"."masteries", "r1"."maximums", "r1"."minimums", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."declaration" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."declaration" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."declaration_identifier" ("identifier_lexical", "package", "path", "start", "identifier") AS
SELECT "r1"."identifier_lexical", "r1"."package", "r1"."path", "r1"."start", "r1"."identifier"
FROM "qti"."declaration_identifier" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."declaration_identifier" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."dependency" ("lexical", "package", "path", "start", "ref") AS
SELECT "r1"."lexical", "r1"."package", "r1"."path", "r1"."start", "r1"."ref"
FROM "qti"."dependency" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."dependency" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."document" ("assembled", "bindings", "charset", "choices", "context", "context_nearest", "context_nearest_kind", "context_nearest_kind_name", "context_path", "document_type", "document_type_name", "export_charset", "hottexts", "idref_targets", "ids", "langs", "node_children", "package", "path", "root_kind", "root_kind_name", "targeted_by", "variables") AS
SELECT "r1"."assembled", "r1"."bindings", "r1"."charset", "r1"."choices", "r1"."context", "r1"."context_nearest", "r1"."context_nearest_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."context_nearest_kind" + 1]::"pg_catalog"."text", "r1"."context_path", "r1"."document_type", ("qti"."__document_type_names_25wlaz4cvg"())["r1"."document_type" + 1]::"pg_catalog"."text", "r1"."export_charset", "r1"."hottexts", "r1"."idref_targets", "r1"."ids", "r1"."langs", "r1"."node_children", "r1"."package", "r1"."path", "r1"."root_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."root_kind" + 1]::"pg_catalog"."text", "r1"."targeted_by", "r1"."variables"
FROM "qti"."document" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."document" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."document_id" ("admitted", "lexical", "owner", "package", "path", "start", "id") AS
SELECT "r1"."admitted", "r1"."lexical", "r1"."owner", "r1"."package", "r1"."path", "r1"."start", "r1"."id"
FROM "qti"."document_id" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."document_id" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."element_type" ("governor", "governor_name", "kind", "kind_name", "package", "path", "start", "type", "type_name") AS
SELECT "r1"."governor", ("qti"."__governor_names_d7jfyla3na"())["r1"."governor" + 1]::"pg_catalog"."text", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start", "r1"."type", ("qti"."__type_name_names_arumhtuxer"())["r1"."type" + 1]::"pg_catalog"."text"
FROM "qti"."element_type" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."element_type" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."encoding_decl" ("encoding", "package", "path") AS
SELECT "r1"."encoding", "r1"."package", "r1"."path"
FROM "qti"."encoding_decl" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."encoding_decl" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."entry" ("kind", "kind_name", "package", "path") AS
SELECT "r1"."kind", ("qti"."__entry_kind_names_km5xejbmwu"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path"
FROM "qti"."entry" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."entry" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."expression" ("base_type", "base_type_name", "cardinality", "cardinality_name", "language", "language_name", "package", "path", "start", "base_type_bit", "cardinality_bit") AS
SELECT "r1"."base_type", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."cardinality", ("qti"."__value_cardinality_names_wzwznoycgf"())["r1"."cardinality" + 1]::"pg_catalog"."text", "r1"."language", ("qti"."__language_names_pvmtywwssv"())["r1"."language" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start", "r1"."base_type_bit", "r1"."cardinality_bit"
FROM "qti"."expression" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."expression" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."expression_attribute" ("attribute", "attribute_name", "base_type", "base_type_name", "lexical", "package", "path", "start") AS
SELECT "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."base_type", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."lexical", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."expression_attribute" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."expression_attribute" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."feedback_ref" ("assembly_kind", "assembly_kind_name", "attribute", "attribute_name", "identifier", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."assembly_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."assembly_kind" + 1]::"pg_catalog"."text", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."feedback_ref" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."feedback_ref" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."fragment_context_ref" ("assembly", "assembly_kind", "assembly_kind_name", "attribute", "attribute_name", "identifier", "instance", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."assembly_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."assembly_kind" + 1]::"pg_catalog"."text", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."instance", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."fragment_context_ref" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."fragment_context_ref" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."fragment_feedback_ref" ("assembly", "assembly_kind", "assembly_kind_name", "attribute", "attribute_name", "identifier", "instance", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."assembly_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."assembly_kind" + 1]::"pg_catalog"."text", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."instance", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."fragment_feedback_ref" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."fragment_feedback_ref" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."fragment_printed_ref" ("assembly", "assembly_kind", "assembly_kind_name", "attribute", "attribute_name", "identifier", "instance", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."assembly_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."assembly_kind" + 1]::"pg_catalog"."text", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."instance", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."fragment_printed_ref" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."fragment_printed_ref" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."fragment_scope" ("assembly", "assembly_kind", "assembly_kind_name", "contexts", "document", "feedbacks", "instance", "package", "prints", "templates") AS
SELECT "r1"."assembly", "r1"."assembly_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."assembly_kind" + 1]::"pg_catalog"."text", "r1"."contexts", "r1"."document", "r1"."feedbacks", "r1"."instance", "r1"."package", "r1"."prints", "r1"."templates"
FROM "qti"."fragment_scope" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."fragment_scope" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."fragment_template_ref" ("assembly", "assembly_kind", "assembly_kind_name", "attribute", "attribute_name", "identifier", "instance", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."assembly_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."assembly_kind" + 1]::"pg_catalog"."text", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."instance", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."fragment_template_ref" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."fragment_template_ref" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."identity_text" ("package", "path", "start", "token_text", "tokens") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."token_text", "r1"."tokens"
FROM "qti"."identity_text" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."identity_text" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."idref" ("after", "at", "before", "name", "name_name", "package", "path", "pieces_after", "pieces_was", "start", "token", "piece") AS
SELECT "r1"."after", "r1"."at", "r1"."before", "r1"."name", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."name" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."pieces_after", "r1"."pieces_was", "r1"."start", "r1"."token", "r1"."piece"
FROM "qti"."idref" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."idref" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."idref_target" ("assembled", "id", "package", "path") AS
SELECT "r1"."assembled", "r1"."id", "r1"."package", "r1"."path"
FROM "qti"."idref_target" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."idref_target" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."inclusion" ("package", "parent_kind", "parent_kind_name", "path", "places", "root", "root_name", "splices", "start") AS
SELECT "r1"."package", "r1"."parent_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."parent_kind" + 1]::"pg_catalog"."text", "r1"."path", "r1"."places", "r1"."root", ("qti"."__node_kind_names_ulbko553n7"())["r1"."root" + 1]::"pg_catalog"."text", "r1"."splices", "r1"."start"
FROM "qti"."inclusion" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."inclusion" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."instance" ("assembly", "assembly_kind", "assembly_kind_name", "at", "bindings", "children", "choices", "document", "end", "hottexts", "idref_targets", "ids", "langs", "package", "parent", "root_kind", "root_kind_name", "site", "site_document", "start", "variables") AS
SELECT "r1"."assembly", "r1"."assembly_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."assembly_kind" + 1]::"pg_catalog"."text", "r1"."at", "r1"."bindings", "r1"."children", "r1"."choices", "r1"."document", "r1"."end", "r1"."hottexts", "r1"."idref_targets", "r1"."ids", "r1"."langs", "r1"."package", "r1"."parent", "r1"."root_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."root_kind" + 1]::"pg_catalog"."text", "r1"."site", "r1"."site_document", "r1"."start", "r1"."variables"
FROM "qti"."instance" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."instance" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."interaction" ("choices", "module_forms", "package", "path", "start") AS
SELECT "r1"."choices", "r1"."module_forms", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."interaction" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."interaction" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."interaction_attribute" ("kind", "kind_name", "lexical", "name", "name_name", "package", "path", "root_kind", "root_kind_name", "start", "value") AS
SELECT "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."lexical", "r1"."name", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."name" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."root_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."root_kind" + 1]::"pg_catalog"."text", "r1"."start", "r1"."value"
FROM "qti"."interaction_attribute" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."interaction_attribute" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."label_use" ("package", "path", "root_kind", "root_kind_name", "start") AS
SELECT "r1"."package", "r1"."path", "r1"."root_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."root_kind" + 1]::"pg_catalog"."text", "r1"."start"
FROM "qti"."label_use" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."label_use" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."least_count" ("least", "least_value", "package", "path", "start") AS
SELECT "r1"."least", "r1"."least_value", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."least_count" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."least_count" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."literal" ("base_type", "base_type_name", "package", "path", "start", "text") AS
SELECT "r1"."base_type", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start", "r1"."text"
FROM "qti"."literal" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."literal" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."mastery_floor" ("mastery_value", "normal_minimum", "package", "path", "start") AS
SELECT "r1"."mastery_value", "r1"."normal_minimum", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."mastery_floor" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."mastery_floor" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."math_align_group" ("cell", "package", "path", "start") AS
SELECT "r1"."cell", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."math_align_group" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."math_align_group" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."math_align_scope" ("cell", "chosen", "dir_lexical", "inherited", "inherited_name", "own", "own_name", "package", "passes", "passes_name", "path", "received", "received_name", "start", "state", "state_name") AS
SELECT "r1"."cell", "r1"."chosen", "r1"."dir_lexical", "r1"."inherited", ("qti"."__align_direction_names_vluq7iazdg"())["r1"."inherited" + 1]::"pg_catalog"."text", "r1"."own", ("qti"."__align_direction_names_vluq7iazdg"())["r1"."own" + 1]::"pg_catalog"."text", "r1"."package", "r1"."passes", ("qti"."__align_state_names_ffk37slxn3"())["r1"."passes" + 1]::"pg_catalog"."text", "r1"."path", "r1"."received", ("qti"."__align_state_names_ffk37slxn3"())["r1"."received" + 1]::"pg_catalog"."text", "r1"."start", "r1"."state", ("qti"."__align_state_names_ffk37slxn3"())["r1"."state" + 1]::"pg_catalog"."text"
FROM "qti"."math_align_scope" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."math_align_scope" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."math_cn" ("base", "base_name", "base_lexical", "package", "parts", "path", "start", "type", "type_name", "type_lexical") AS
SELECT "r1"."base", ("qti"."__cn_base_names_2wtzhyubck"())["r1"."base" + 1]::"pg_catalog"."text", "r1"."base_lexical", "r1"."package", "r1"."parts", "r1"."path", "r1"."start", "r1"."type", ("qti"."__cn_type_names_wmjelllvhg"())["r1"."type" + 1]::"pg_catalog"."text", "r1"."type_lexical"
FROM "qti"."math_cn" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."math_cn" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."math_rank" ("package", "path", "rank", "start") AS
SELECT "r1"."package", "r1"."path", "r1"."rank", "r1"."start"
FROM "qti"."math_rank" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."math_rank" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."most_count" ("most", "most_value", "package", "path", "start") AS
SELECT "r1"."most", "r1"."most_value", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."most_count" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."most_count" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."named" ("identifier", "package", "path", "start") AS
SELECT "r1"."identifier", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."named" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."named" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."namespace" ("package", "path", "prefix", "start", "uri") AS
SELECT "r1"."package", "r1"."path", "r1"."prefix", "r1"."start", "r1"."uri"
FROM "qti"."namespace" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."namespace" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."node" ("ancestry", "at", "attributes", "attrs", "barred_children", "chars", "chars_after", "chars_was", "children", "counted_children", "element_children", "elements", "elements_was", "end", "first", "governor", "governor_name", "kind", "kind_name", "last", "last_state", "last_state_name", "nearest", "nearest_kind", "nearest_kind_name", "nearest_path", "open_attributes", "package", "parent", "parent_ancestry", "parent_governor", "parent_governor_name", "parent_kind", "parent_kind_name", "parent_nearest", "parent_nearest_kind", "parent_nearest_kind_name", "parent_nearest_path", "parent_parent_kind", "parent_parent_kind_name", "path", "prefix", "start", "state", "state_name", "string_value", "was", "was_name") AS
SELECT "r1"."ancestry", "r1"."at", "r1"."attributes", "r1"."attrs", "r1"."barred_children", "r1"."chars", "r1"."chars_after", "r1"."chars_was", "r1"."children", "r1"."counted_children", "r1"."element_children", "r1"."elements", "r1"."elements_was", "r1"."end", "r1"."first", "r1"."governor", ("qti"."__governor_names_d7jfyla3na"())["r1"."governor" + 1]::"pg_catalog"."text", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."last", "r1"."last_state", ("qti"."__position_names_sglcn7ygpg"())["r1"."last_state" + 1]::"pg_catalog"."text", "r1"."nearest", "r1"."nearest_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."nearest_kind" + 1]::"pg_catalog"."text", "r1"."nearest_path", "r1"."open_attributes", "r1"."package", "r1"."parent", "r1"."parent_ancestry", "r1"."parent_governor", ("qti"."__governor_names_d7jfyla3na"())["r1"."parent_governor" + 1]::"pg_catalog"."text", "r1"."parent_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."parent_kind" + 1]::"pg_catalog"."text", "r1"."parent_nearest", "r1"."parent_nearest_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."parent_nearest_kind" + 1]::"pg_catalog"."text", "r1"."parent_nearest_path", "r1"."parent_parent_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."parent_parent_kind" + 1]::"pg_catalog"."text", "r1"."path", "r1"."prefix", "r1"."start", "r1"."state", ("qti"."__position_names_sglcn7ygpg"())["r1"."state" + 1]::"pg_catalog"."text", "r1"."string_value", "r1"."was", ("qti"."__position_names_sglcn7ygpg"())["r1"."was" + 1]::"pg_catalog"."text"
FROM "qti"."node" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."node" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."normal_minimum" ("lexical", "package", "path", "start", "written") AS
SELECT "r1"."lexical", "r1"."package", "r1"."path", "r1"."start", "r1"."written"
FROM "qti"."normal_minimum" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."normal_minimum" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."open_attribute" ("class", "class_name", "element_namespace", "governor", "governor_name", "kind", "kind_name", "lexical", "local", "package", "path", "prefix", "slot", "start", "uri") AS
SELECT "r1"."class", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."class" + 1]::"pg_catalog"."text", "r1"."element_namespace", "r1"."governor", ("qti"."__governor_names_d7jfyla3na"())["r1"."governor" + 1]::"pg_catalog"."text", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."lexical", "r1"."local", "r1"."package", "r1"."path", "r1"."prefix", "r1"."slot", "r1"."start", "r1"."uri"
FROM "qti"."open_attribute" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."open_attribute" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."open_attribute_entity" ("entity", "local", "offset", "package", "path", "start", "uri") AS
SELECT "r1"."entity", "r1"."local", "r1"."offset", "r1"."package", "r1"."path", "r1"."start", "r1"."uri"
FROM "qti"."open_attribute_entity" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."open_attribute_entity" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."open_element_name" ("local", "namespace", "package", "path", "start", "expanded") AS
SELECT "r1"."local", "r1"."namespace", "r1"."package", "r1"."path", "r1"."start", "r1"."expanded"
FROM "qti"."open_element_name" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."open_element_name" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."open_element_type" ("package", "path", "start", "type", "type_name") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."type", ("qti"."__type_name_names_arumhtuxer"())["r1"."type" + 1]::"pg_catalog"."text"
FROM "qti"."open_element_type" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."open_element_type" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."placed_catalog_ref" ("assembly", "id", "instance", "package", "path") AS
SELECT "r1"."assembly", "r1"."id", "r1"."instance", "r1"."package", "r1"."path"
FROM "qti"."placed_catalog_ref" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."placed_catalog_ref" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."placed_id" ("assembly", "assembly_kind", "assembly_kind_name", "id", "instance", "owner", "package", "path", "start") AS
SELECT "r1"."assembly", "r1"."assembly_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."assembly_kind" + 1]::"pg_catalog"."text", "r1"."id", "r1"."instance", "r1"."owner", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."placed_id" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."placed_id" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."placed_idref" ("assembly", "id", "instance", "package", "path") AS
SELECT "r1"."assembly", "r1"."id", "r1"."instance", "r1"."package", "r1"."path"
FROM "qti"."placed_idref" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."placed_idref" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."placed_math_rank" ("assembly", "instance", "package", "path", "rank", "start") AS
SELECT "r1"."assembly", "r1"."instance", "r1"."package", "r1"."path", "r1"."rank", "r1"."start"
FROM "qti"."placed_math_rank" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."placed_math_rank" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."placed_share_target" ("assembly", "assembly_kind", "assembly_kind_name", "id", "instance", "package", "path", "start", "target", "target_instance", "target_start") AS
SELECT "r1"."assembly", "r1"."assembly_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."assembly_kind" + 1]::"pg_catalog"."text", "r1"."id", "r1"."instance", "r1"."package", "r1"."path", "r1"."start", "r1"."target", "r1"."target_instance", "r1"."target_start"
FROM "qti"."placed_share_target" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."placed_share_target" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."placed_variable_ref" ("assembly", "attribute", "attribute_name", "identifier", "instance", "kind", "kind_name", "package", "path", "resolution", "resolution_name", "root_kind", "root_kind_name", "start") AS
SELECT "r1"."assembly", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."instance", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."resolution", ("qti"."__reference_resolution_names_3knvypuotm"())["r1"."resolution" + 1]::"pg_catalog"."text", "r1"."root_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."root_kind" + 1]::"pg_catalog"."text", "r1"."start"
FROM "qti"."placed_variable_ref" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."placed_variable_ref" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."placed_xml_lang" ("assembly", "instance", "lang", "package", "path", "scope", "start", "value") AS
SELECT "r1"."assembly", "r1"."instance", "r1"."lang", "r1"."package", "r1"."path", "r1"."scope", "r1"."start", "r1"."value"
FROM "qti"."placed_xml_lang" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."placed_xml_lang" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."printed_variable_ref" ("assembly_kind", "assembly_kind_name", "attribute", "attribute_name", "identifier", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."assembly_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."assembly_kind" + 1]::"pg_catalog"."text", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."printed_variable_ref" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."printed_variable_ref" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."processing" ("language", "language_name", "package", "path", "start") AS
SELECT "r1"."language", ("qti"."__language_names_pvmtywwssv"())["r1"."language" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."processing" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."processing" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."reference_path" ("kind", "kind_name", "name", "name_name", "package", "path", "start", "target") AS
SELECT "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."name", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."name" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start", "r1"."target"
FROM "qti"."reference_path" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."reference_path" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."resource_document" ("package", "path", "root_kind", "root_kind_name", "type", "type_name", "document_type", "document_type_name") AS
SELECT "r1"."package", "r1"."path", "r1"."root_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."root_kind" + 1]::"pg_catalog"."text", "r1"."type", ("qti"."__resource_type_names_lit2ie7nf4"())["r1"."type" + 1]::"pg_catalog"."text", "r1"."document_type", ("qti"."__document_type_names_25wlaz4cvg"())["r1"."document_type" + 1]::"pg_catalog"."text"
FROM "qti"."resource_document" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."resource_document" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."rounding" ("holds", "holds_name", "mode_written", "package", "path", "start") AS
SELECT "r1"."holds", ("qti"."__rounding_holds_names_6j2zaayymp"())["r1"."holds" + 1]::"pg_catalog"."text", "r1"."mode_written", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."rounding" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."rounding" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."rounding_figures" ("figures_lexical", "package", "path", "start", "figures") AS
SELECT "r1"."figures_lexical", "r1"."package", "r1"."path", "r1"."start", "r1"."figures"
FROM "qti"."rounding_figures" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."rounding_figures" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."rounding_mode_figures" ("figures", "mode", "package", "path", "start") AS
SELECT "r1"."figures", "r1"."mode", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."rounding_mode_figures" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."rounding_mode_figures" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."sd_decl" ("package", "path", "standalone", "standalone_name") AS
SELECT "r1"."package", "r1"."path", "r1"."standalone", ("qti"."__xml_standalone_names_psf7bszcug"())["r1"."standalone" + 1]::"pg_catalog"."text"
FROM "qti"."sd_decl" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."sd_decl" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."share_fragment" ("assembled", "id", "package", "path", "placements", "src", "start") AS
SELECT "r1"."assembled", "r1"."id", "r1"."package", "r1"."path", "r1"."placements", "r1"."src", "r1"."start"
FROM "qti"."share_fragment" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."share_fragment" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."share_target" ("id", "package", "path", "start", "target_start") AS
SELECT "r1"."id", "r1"."package", "r1"."path", "r1"."start", "r1"."target_start"
FROM "qti"."share_target" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."share_target" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."site" ("ancestry", "children", "external", "governor", "governor_name", "kind", "kind_name", "nearest", "nearest_kind", "nearest_kind_name", "nearest_path", "package", "parent", "parent_kind", "parent_kind_name", "path", "start") AS
SELECT "r1"."ancestry", "r1"."children", "r1"."external", "r1"."governor", ("qti"."__governor_names_d7jfyla3na"())["r1"."governor" + 1]::"pg_catalog"."text", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."nearest", "r1"."nearest_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."nearest_kind" + 1]::"pg_catalog"."text", "r1"."nearest_path", "r1"."package", "r1"."parent", "r1"."parent_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."parent_kind" + 1]::"pg_catalog"."text", "r1"."path", "r1"."start"
FROM "qti"."site" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."site" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."site_path" ("entry", "kind", "kind_name", "package", "path", "start", "target") AS
SELECT "r1"."entry", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start", "r1"."target"
FROM "qti"."site_path" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."site_path" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."site_target" ("ancestry", "kind", "kind_name", "nearest", "nearest_kind", "nearest_kind_name", "package", "parent_kind", "parent_kind_name", "path", "places", "splices", "start", "target", "target_nearest", "target_nearest_kind", "target_nearest_kind_name", "target_nearest_path", "target_root", "target_root_name") AS
SELECT "r1"."ancestry", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."nearest", "r1"."nearest_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."nearest_kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."parent_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."parent_kind" + 1]::"pg_catalog"."text", "r1"."path", "r1"."places", "r1"."splices", "r1"."start", "r1"."target", "r1"."target_nearest", "r1"."target_nearest_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."target_nearest_kind" + 1]::"pg_catalog"."text", "r1"."target_nearest_path", "r1"."target_root", ("qti"."__node_kind_names_ulbko553n7"())["r1"."target_root" + 1]::"pg_catalog"."text"
FROM "qti"."site_target" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."site_target" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."ssml_scope" ("fragment", "package", "path", "start") AS
SELECT "r1"."fragment", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."ssml_scope" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."ssml_scope" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."table_header" ("id", "owner", "package", "path", "start") AS
SELECT "r1"."id", "r1"."owner", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."table_header" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."table_header" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."table_scope" ("package", "path", "start", "table") AS
SELECT "r1"."package", "r1"."path", "r1"."start", "r1"."table"
FROM "qti"."table_scope" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."table_scope" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."template_ref" ("assembly_kind", "assembly_kind_name", "attribute", "attribute_name", "identifier", "kind", "kind_name", "package", "path", "start") AS
SELECT "r1"."assembly_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."assembly_kind" + 1]::"pg_catalog"."text", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start"
FROM "qti"."template_ref" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."template_ref" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."test_document" ("instances", "package", "path", "sites", "targets") AS
SELECT "r1"."instances", "r1"."package", "r1"."path", "r1"."sites", "r1"."targets"
FROM "qti"."test_document" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."test_document" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."text_idref" ("after", "at", "before", "package", "path", "pieces_after", "pieces_was", "start", "token", "piece") AS
SELECT "r1"."after", "r1"."at", "r1"."before", "r1"."package", "r1"."path", "r1"."pieces_after", "r1"."pieces_was", "r1"."start", "r1"."token", "r1"."piece"
FROM "qti"."text_idref" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."text_idref" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."text_reference_path" ("kind", "kind_name", "package", "path", "start", "target") AS
SELECT "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start", "r1"."target"
FROM "qti"."text_reference_path" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."text_reference_path" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."usage_value" ("base_type_lexical", "package", "path", "start", "text") AS
SELECT "r1"."base_type_lexical", "r1"."package", "r1"."path", "r1"."start", "r1"."text"
FROM "qti"."usage_value" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."usage_value" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."usage_value_base_type" ("base_type", "base_type_name", "base_type_lexical", "package", "path", "start", "text") AS
SELECT "r1"."base_type", ("qti"."__base_type_names_ok3nu5nck4"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."base_type_lexical", "r1"."package", "r1"."path", "r1"."start", "r1"."text"
FROM "qti"."usage_value_base_type" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."usage_value_base_type" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."variable_ref" ("after", "attribute", "attribute_name", "base_type", "base_type_name", "before", "cardinality", "cardinality_name", "element_base", "element_base_name", "element_cardinality", "element_cardinality_name", "identifier", "kind", "kind_name", "language", "language_name", "lexical", "package", "path", "resolution", "resolution_name", "root_kind", "root_kind_name", "start") AS
SELECT "r1"."after", "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."base_type", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."base_type" + 1]::"pg_catalog"."text", "r1"."before", "r1"."cardinality", ("qti"."__value_cardinality_names_wzwznoycgf"())["r1"."cardinality" + 1]::"pg_catalog"."text", "r1"."element_base", ("qti"."__value_base_names_pjzlcpdwvv"())["r1"."element_base" + 1]::"pg_catalog"."text", "r1"."element_cardinality", ("qti"."__value_cardinality_names_wzwznoycgf"())["r1"."element_cardinality" + 1]::"pg_catalog"."text", "r1"."identifier", "r1"."kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."kind" + 1]::"pg_catalog"."text", "r1"."language", ("qti"."__language_names_pvmtywwssv"())["r1"."language" + 1]::"pg_catalog"."text", "r1"."lexical", "r1"."package", "r1"."path", "r1"."resolution", ("qti"."__reference_resolution_names_3knvypuotm"())["r1"."resolution" + 1]::"pg_catalog"."text", "r1"."root_kind", ("qti"."__node_kind_names_ulbko553n7"())["r1"."root_kind" + 1]::"pg_catalog"."text", "r1"."start"
FROM "qti"."variable_ref" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."variable_ref" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."variable_ref_table" ("attribute", "attribute_name", "package", "path", "start", "table", "table_name") AS
SELECT "r1"."attribute", ("qti"."__attribute_name_names_q6tmzcty4e"())["r1"."attribute" + 1]::"pg_catalog"."text", "r1"."package", "r1"."path", "r1"."start", "r1"."table", ("qti"."__referenced_table_names_qrpsijquzz"())["r1"."table" + 1]::"pg_catalog"."text"
FROM "qti"."variable_ref_table" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."variable_ref_table" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."xml_decl" ("package", "path", "version") AS
SELECT "r1"."package", "r1"."path", "r1"."version"
FROM "qti"."xml_decl" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."xml_decl" TO :"qti_queries__author";

CREATE VIEW "qti_queries__author"."xml_lang" ("lang", "package", "path", "scope", "start", "value") AS
SELECT "r1"."lang", "r1"."package", "r1"."path", "r1"."scope", "r1"."start", "r1"."value"
FROM "qti"."xml_lang" AS "r1";

GRANT SELECT ON TABLE "qti_queries__author"."xml_lang" TO :"qti_queries__author";
