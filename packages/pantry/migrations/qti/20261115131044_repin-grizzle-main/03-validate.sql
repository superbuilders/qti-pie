ALTER TABLE "qti"."node" ADD CONSTRAINT "__node_key_package_path_start_xbt3uns5vk" UNIQUE USING INDEX "__node_key_package_path_start_xbt3uns5vk";

ALTER TABLE "qti"."node" ADD CONSTRAINT "__node_key_package_path_start_p7dgtztd7i" UNIQUE USING INDEX "__node_key_package_path_start_p7dgtztd7i";

ALTER TABLE "qti"."node" ADD CONSTRAINT "__node_key_package_path_start_qsc577puxs" UNIQUE USING INDEX "__node_key_package_path_start_qsc577puxs";

ALTER TABLE "qti"."node" ADD CONSTRAINT "__node_key_package_path_start_jqx3qg3hnv" UNIQUE USING INDEX "__node_key_package_path_start_jqx3qg3hnv";

ALTER TABLE "qti"."node" ADD CONSTRAINT "__node_key_package_path_start_lsygytabkz" UNIQUE USING INDEX "__node_key_package_path_start_lsygytabkz";

ALTER TABLE "qti"."node" ADD CONSTRAINT "__node_key_package_path_start_djhifcsuz5" UNIQUE USING INDEX "__node_key_package_path_start_djhifcsuz5";

ALTER TABLE "qti"."node" ADD CONSTRAINT "__node_key_package_path_start_rw6udtp6ut" UNIQUE USING INDEX "__node_key_package_path_start_rw6udtp6ut";

ALTER TABLE "qti"."node" ADD CONSTRAINT "__node_key_package_path_start_jukxdlwfdo" UNIQUE USING INDEX "__node_key_package_path_start_jukxdlwfdo";

ALTER TABLE "qti"."node" ADD CONSTRAINT "__node_key_package_path_start_ni5cgapvup" UNIQUE USING INDEX "__node_key_package_path_start_ni5cgapvup";

ALTER TABLE "qti"."node" ADD CONSTRAINT "__node_key_package_path_start_etxhmvshaj" UNIQUE USING INDEX "__node_key_package_path_start_etxhmvshaj";

ALTER TABLE "qti"."node" ADD CONSTRAINT "__node_key_package_path_start_anri74dtrh" UNIQUE USING INDEX "__node_key_package_path_start_anri74dtrh";

ALTER TABLE "qti"."area_mapping" ADD CONSTRAINT "__area_mapping_fk_package_path_start_jex6vfqym2" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("__package_e4zzfr7wzj", "__path_66y5xj7axb", "__start_42afebohfb") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."area_mapping" VALIDATE CONSTRAINT "__area_mapping_fk_package_path_start_jex6vfqym2";

ALTER TABLE "qti"."comment" ADD CONSTRAINT "__comment_fk_package_path_start_566brxnca7" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("__package_sjuyq4n4ie", "__path_w5i2umbteb", "__start_hmwloncnlr") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."comment" VALIDATE CONSTRAINT "__comment_fk_package_path_start_566brxnca7";

ALTER TABLE "qti"."doctype" ADD CONSTRAINT "__doctype_fk_package_path_start_237uua676y" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("__package_vqnwpi5wh4", "__path_oarsrg5x22", "__start_2gva6u6cmq") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."doctype" VALIDATE CONSTRAINT "__doctype_fk_package_path_start_237uua676y";

ALTER TABLE "qti"."math_action" ADD CONSTRAINT "__math_action_fk_package_path_start_fdzoetiypr" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("__package_ck5ku6e4hr", "__path_wogcolyaps", "__start_jip64i2soq") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."math_action" VALIDATE CONSTRAINT "__math_action_fk_package_path_start_fdzoetiypr";

ALTER TABLE "qti"."math_align_scope" ADD CONSTRAINT "__math_align_scope_fk_package_path_start_fjaadia36p" FOREIGN KEY ("__package_6t5jp72vgm", "__path_nrlhg2ytdy", "__start_vretwkwxg4") REFERENCES "qti"."node" ("__package_6t5jp72vgm", "__path_nrlhg2ytdy", "__start_vretwkwxg4") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."math_align_scope" VALIDATE CONSTRAINT "__math_align_scope_fk_package_path_start_fjaadia36p";

ALTER TABLE "qti"."math_cell" ADD CONSTRAINT "__math_cell_fk_package_path_start_3lexcfbcnc" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("__package_6t5jp72vgm", "__path_nrlhg2ytdy", "__start_vretwkwxg4") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."math_cell" VALIDATE CONSTRAINT "__math_cell_fk_package_path_start_3lexcfbcnc";

ALTER TABLE "qti"."pi" ADD CONSTRAINT "__pi_fk_package_path_start_tugkncudqo" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("__package_2w6sziybrg", "__path_dn6abyl6iz", "__start_4tq2iufeiz") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."pi" VALIDATE CONSTRAINT "__pi_fk_package_path_start_tugkncudqo";

ALTER TABLE "qti"."quotation" ADD CONSTRAINT "__quotation_fk_package_path_start_6diakup5jy" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("__package_2o6qk6if7u", "__path_3qiiozyy3b", "__start_22baqtenkm") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."quotation" VALIDATE CONSTRAINT "__quotation_fk_package_path_start_6diakup5jy";

ALTER TABLE "qti"."section" ADD CONSTRAINT "__section_fk_package_path_start_4lop7i4ab3" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("__package_ga6d5w32n4", "__path_4vxcj6ldng", "__start_ifqdoy7nkr") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."section" VALIDATE CONSTRAINT "__section_fk_package_path_start_4lop7i4ab3";

ALTER TABLE "qti"."section_ordering" ADD CONSTRAINT "__section_ordering_fk_package_path_start_2s2mjimzst" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("__package_liyej46hxe", "__path_o5v3lmgi63", "__start_t56xrln3um") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."section_ordering" VALIDATE CONSTRAINT "__section_ordering_fk_package_path_start_2s2mjimzst";

ALTER TABLE "qti"."section_selection" ADD CONSTRAINT "__section_selection_fk_package_path_start_ocziqyh45o" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("__package_nfobnuwqdt", "__path_v3v2ph3usg", "__start_ne5gg3nliq") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."section_selection" VALIDATE CONSTRAINT "__section_selection_fk_package_path_start_ocziqyh45o";

ALTER TABLE "qti"."variable_mapping" ADD CONSTRAINT "__variable_mapping_fk_package_path_start_d4y5w6i3v2" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("__package_le4clvchbl", "__path_xq5ccpcuoq", "__start_gy4idzjomf") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED NOT VALID;

ALTER TABLE "qti"."variable_mapping" VALIDATE CONSTRAINT "__variable_mapping_fk_package_path_start_d4y5w6i3v2";
