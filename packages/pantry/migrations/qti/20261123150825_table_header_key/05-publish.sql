ALTER TABLE "qti"."table_header" ADD CONSTRAINT "__table_header_key_package_path_table_id_digest_hp2zy2cco6" UNIQUE USING INDEX "__table_header_key_package_path_table_id_digest_hp2zy2cco6";

ALTER TABLE "qti"."table_scope" ADD CONSTRAINT "__table_scope_key_package_path_start_table_k6mhb5efs3" UNIQUE USING INDEX "__table_scope_key_package_path_start_table_k6mhb5efs3";

ALTER TABLE "qti"."table_header" ADD CONSTRAINT "__table_header_fk_package_path_start_table_iy2pcs7mtk" FOREIGN KEY ("package", "path", "start", "table") REFERENCES "qti"."table_scope" ("package", "path", "start", "table") MATCH SIMPLE NOT VALID;

ALTER TABLE "qti"."table_header" DROP CONSTRAINT "__table_header_fk_package_path_start_dhca6a32iq";

DROP INDEX "qti"."__table_scope_ix_package_path_table_p6mmwy6mjs";

DROP FUNCTION "qti"."__judge_assembled_catalog_4uqgu4yp6a"("pg_catalog"."text"[]) RESTRICT;

DROP FUNCTION "qti"."__judge_tabled_header_key_package_path_table_id_lopc6f73jb"() RESTRICT;

DROP FUNCTION "qti"."__judge_cell_token_in_tabled_header_jdl2jwfjls"() RESTRICT;

DROP FUNCTION "qti"."__reader_olds_table_header_dhqyg2krej"() RESTRICT;

DROP FUNCTION "qti"."__reader_news_table_header_wo4cx2cpcr"() RESTRICT;

DROP TYPE "qti"."__row_olds_table_header_kabrb3hctb";

DROP TYPE "qti"."__row_news_table_header_5qtlrzvkis";

COMMENT ON TYPE "qti"."__row_news_table_header_5dhoaz3zbc" IS 'the row type of the delta of news of TableHeader';

COMMENT ON TYPE "qti"."__row_olds_table_header_rvmqzvrhof" IS 'the row type of the delta of olds of TableHeader';

COMMENT ON CONSTRAINT "__table_scope_key_package_path_start_table_k6mhb5efs3" ON "qti"."table_scope" IS 'key TableScope(package, path, start, table)';

COMMENT ON COLUMN "qti"."table_header"."__package_ccgb34afwq" IS 'package where Logic.ne(table, 0n)';

COMMENT ON CONSTRAINT "__table_header_key_package_path_table_id_digest_hp2zy2cco6" ON "qti"."table_header" IS 'key TableHeader(package where Logic.ne(table, 0n), path, table, idDigest)';

COMMENT ON CONSTRAINT "__table_header_fk_package_path_start_table_iy2pcs7mtk" ON "qti"."table_header" IS 'foreign key TableHeader(package, path, start, table) to TableScope(package, path, start, table)';

COMMENT ON INDEX "qti"."__table_header_ix_package_path_table_nl5r7jdshk" IS 'btree index TableHeader(package, path, table), id filtered beside it, not indexed: no byte bound fits the entry';

COMMENT ON FUNCTION "qti"."__reader_news_table_header_fmgvdidlha"() IS 'the reader of the delta of news of TableHeader';

COMMENT ON FUNCTION "qti"."__reader_olds_table_header_flhlkrq63c"() IS 'the reader of the delta of olds of TableHeader';

COMMENT ON FUNCTION "qti"."__judge_attribute_kind_name_in_table_header_6m5t5fabf5"() IS 'the rule judge''s block of rule Attribute(package, path, start) where Logic.eq(kind, "th") and Logic.eq(name, "id") in TableHeader(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_cell_token_in_table_header_r63ctqjkv5"() IS 'the rule judge''s block of rule CellToken(package, path, table, token) in TableHeader(package, path, table, id) where Logic.ne(table, 0n) over its units';

COMMENT ON FUNCTION "qti"."__judge_table_header_in_attribute_7nkosldt6r"() IS 'the rule judge''s block of rule TableHeader(package, path, start) in Attribute(package, path, start) where Logic.or(Logic.and(ValueIdentity.has(AttributeGrammar.at("domain", AttributeModelOf.at("model", governor), name)), Logic.eq(ValueIdentity.at("identity", AttributeGrammar.at("domain", AttributeModelOf.at("model", governor), name)), "ID")), Logic.and(Logic.eq(kind, "qti-context-declaration"), Logic.eq(name, "identifier"))) and Logic.eq(kind, "th") over its units';

COMMENT ON FUNCTION "qti"."__judge_table_header_in_id_value_fssakiz6q3"() IS 'the rule judge''s block of rule TableHeader(package, path, start, id, owner) in IdValue(package, path, start, id, owner) over its units';

COMMENT ON FUNCTION "qti"."__judge_assembled_catalog_ygttfgd2lu"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of AssembledCatalog and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__capture_table_header_tkmxq7wtew"() IS 'rule capture of TableHeader';

COMMENT ON FUNCTION "qti"."__immutable_table_header_w5wnjatoej"() IS 'immutability guard of TableHeader';
