ALTER TABLE "qti"."choice" ADD CONSTRAINT "__choice_key_package_path_kind_identifier_auoyrne6k5" UNIQUE USING INDEX "__choice_key_package_path_kind_identifier_auoyrne6k5";

ALTER TABLE "qti"."placed_choice" ADD CONSTRAINT "__placed_choice_key_package_assembly_kind_identifier_qgyuv4g444" UNIQUE USING INDEX "__placed_choice_key_package_assembly_kind_identifier_qgyuv4g444";

ALTER TABLE "qti"."placed_choice" ALTER CONSTRAINT "__placed_choice_fk_package_path_start_identifier_7xehyru3mj" DEFERRABLE INITIALLY DEFERRED;

DROP FUNCTION "qti"."__judge_assembled_catalog_lguy5ulcpw"("pg_catalog"."text"[]) RESTRICT;

DROP FUNCTION "qti"."__judge_placed_choice_node_key_package_assembly_kind_id2hbr436o"() RESTRICT;

DROP FUNCTION "qti"."__judge_choice_node_key_package_path_kind_identifier_cfau2c6ydg"() RESTRICT;

DROP FUNCTION "qti"."__reader_olds_placed_choice_yiriix7aua"() RESTRICT;

DROP FUNCTION "qti"."__reader_news_placed_choice_qscdnboeyh"() RESTRICT;

DROP FUNCTION "qti"."__reader_olds_choice_en4nz2zypd"() RESTRICT;

DROP FUNCTION "qti"."__reader_news_choice_yaitirnf7w"() RESTRICT;

DROP TYPE "qti"."__row_olds_placed_choice_wohi4et65s";

DROP TYPE "qti"."__row_news_placed_choice_xkiqxyczkk";

DROP TYPE "qti"."__row_olds_choice_mwsw4icjkj";

DROP TYPE "qti"."__row_news_choice_zghxb55imp";

COMMENT ON TYPE "qti"."__row_news_choice_kqwz52ilaz" IS 'the row type of the delta of news of Choice';

COMMENT ON TYPE "qti"."__row_olds_choice_mae4wmbx54" IS 'the row type of the delta of olds of Choice';

COMMENT ON TYPE "qti"."__row_news_placed_choice_d4735rljg3" IS 'the row type of the delta of news of PlacedChoice';

COMMENT ON TYPE "qti"."__row_olds_placed_choice_uqukc4rtgy" IS 'the row type of the delta of olds of PlacedChoice';

COMMENT ON CONSTRAINT "__choice_key_package_path_kind_identifier_auoyrne6k5" ON "qti"."choice" IS 'key Choice(package, path, kind, identifier)';

COMMENT ON CONSTRAINT "__placed_choice_key_package_assembly_kind_identifier_qgyuv4g444" ON "qti"."placed_choice" IS 'key PlacedChoice(package, assembly, kind, identifier)';

COMMENT ON CONSTRAINT "__choice_fk_package_path_start_kind_wg4x5yucb4" ON "qti"."choice" IS 'foreign key Choice(package, path, start, kind) to Node(package, path, start, kind)';

COMMENT ON CONSTRAINT "__placed_choice_fk_package_path_start_kind_gph72alaqo" ON "qti"."placed_choice" IS 'foreign key PlacedChoice(package, path, start, kind) to Node(package, path, start, kind)';

COMMENT ON INDEX "qti"."__placed_choice_ix_package_path_start_kind_5miftnmzpk" IS 'btree index PlacedChoice(package, path, start, kind)';

COMMENT ON FUNCTION "qti"."__reader_news_choice_r2bhewc2aw"() IS 'the reader of the delta of news of Choice';

COMMENT ON FUNCTION "qti"."__reader_olds_choice_427cfy7ja5"() IS 'the reader of the delta of olds of Choice';

COMMENT ON FUNCTION "qti"."__reader_news_placed_choice_yinnsmlrpp"() IS 'the reader of the delta of news of PlacedChoice';

COMMENT ON FUNCTION "qti"."__reader_olds_placed_choice_3qxh6zptpd"() IS 'the reader of the delta of olds of PlacedChoice';

COMMENT ON FUNCTION "qti"."__judge_choice_node_check_e_1_derived_f2privbzko"() IS 'the rule judge''s block of rule check E1_derived of ChoiceNode over its units';

COMMENT ON FUNCTION "qti"."__judge_choice_node_in_count_bound_r57c36aziu"() IS 'the rule judge''s block of rule ChoiceNode(package, path, start) where Logic.in(kind, ["qti-associable-hotspot", "qti-associate-interaction", "qti-choice-interaction", "qti-extended-text-interaction", "qti-gap-img", "qti-gap-match-interaction", "qti-gap-text", "qti-graphic-associate-interaction", "qti-graphic-gap-match-interaction", "qti-graphic-order-interaction", "qti-hotspot-interaction", "qti-hottext-interaction", "qti-match-interaction", "qti-media-interaction", "qti-order-interaction", "qti-position-object-interaction", "qti-select-point-interaction", "qti-simple-associable-choice"]) in CountBound(package, path, start) over its units';

COMMENT ON FUNCTION "qti"."__judge_choice_or_hottext_in_unclaimed_name_uyxncalelf"() IS 'the rule judge''s block of rule ChoiceOrHottext(package, path, identifier) in UnclaimedName(package, path, identifier) over its units';

COMMENT ON FUNCTION "qti"."__judge_interaction_attribute_kind_name_in_choice_6z7off3iir"() IS 'the rule judge''s block of rule InteractionAttribute(package, path, start, value) where Logic.in(kind, ["qti-associable-hotspot", "qti-gap", "qti-gap-img", "qti-gap-text", "qti-hotspot-choice", "qti-inline-choice", "qti-simple-associable-choice", "qti-simple-choice"]) and Logic.eq(name, "identifier") in Choice(package, path, start, identifier) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_choice_or_hottext_in_unclaimed_name_dqd4nmh3tg"() IS 'the rule judge''s block of rule PlacedChoiceOrHottext(package, assembly, identifier) in UnclaimedName(package, path, identifier) over its units';

COMMENT ON FUNCTION "qti"."__judge_choice_space_name_key_package_path_5lmdv7iyyw"() IS 'the rule judge''s block of rule key ChoiceSpaceName(package, path, identifier) over its units';

COMMENT ON FUNCTION "qti"."__judge_placed_choice_space_name_key_package_wbw7msoi6e"() IS 'the rule judge''s block of rule key PlacedChoiceSpaceName(package, assembly, identifier) over its units';

COMMENT ON FUNCTION "qti"."__judge_assembled_catalog_4uqgu4yp6a"("pg_catalog"."text"[]) IS 'the rule judge of the deltas of AssembledCatalog and the relations its rules join it to';

COMMENT ON FUNCTION "qti"."__capture_choice_neayopxxaf"() IS 'rule capture of Choice';

COMMENT ON FUNCTION "qti"."__capture_node_7sghxk2dxj"() IS 'rule capture of Node';

COMMENT ON FUNCTION "qti"."__capture_placed_choice_ofja2rvius"() IS 'rule capture of PlacedChoice';

COMMENT ON FUNCTION "qti"."__immutable_choice_ge2mdb5sm4"() IS 'immutability guard of Choice';

COMMENT ON FUNCTION "qti"."__immutable_placed_choice_lyke55z5zo"() IS 'immutability guard of PlacedChoice';
