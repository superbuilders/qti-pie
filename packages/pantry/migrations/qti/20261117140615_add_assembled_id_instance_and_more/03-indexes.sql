-- grizzle: no-transaction

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__assembled_id_key_package_assembly_id_path_owner_giicdcsowk";

CREATE UNIQUE INDEX CONCURRENTLY "__assembled_id_key_package_assembly_id_path_owner_giicdcsowk" ON "qti"."assembled_id" USING btree ("package", "assembly", "id", "path", "owner", "instance", "carriers");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_lb3vztgnax";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_lb3vztgnax" ON "qti"."attribute" USING btree ("__package_ljk5bvjm3n", "__path_lobsrpzcbq", "__start_mp7bdpz2cq");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_fawptpbyvg";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_fawptpbyvg" ON "qti"."attribute" USING btree ("__package_plzx4yohio", "__path_zwvqf4qmlm", "__start_57bzovvmwe");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_gosgndugtc";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_gosgndugtc" ON "qti"."attribute" USING btree ("__package_eyglhvygxe", "__path_m4p7mwtbdk", "__start_mefnrknqzb");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__instance_key_package_assembly_start_children_ce6pyigrjj";

CREATE UNIQUE INDEX CONCURRENTLY "__instance_key_package_assembly_start_children_ce6pyigrjj" ON "qti"."instance" USING btree ("package", "assembly", "start", "children", "assembly_kind", "document");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__named_key_package_identifier_z5auwjrdf4";

CREATE UNIQUE INDEX CONCURRENTLY "__named_key_package_identifier_z5auwjrdf4" ON "qti"."named" USING btree ("__package_w6u7fcuhnu", "__identifier_h5ldkjgyev");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_id_key_package_assembly_id_path_owner_khgoth5pkk";

CREATE UNIQUE INDEX CONCURRENTLY "__placed_id_key_package_assembly_id_path_owner_khgoth5pkk" ON "qti"."placed_id" USING btree ("package", "assembly", "id", "path", "owner", "instance", "__index_carriers_dn2nonsied");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_id_key_package_assembly_id_path_owner_jwtbfypvr7";

CREATE UNIQUE INDEX CONCURRENTLY "__placed_id_key_package_assembly_id_path_owner_jwtbfypvr7" ON "qti"."placed_id" USING btree ("package", "assembly", "id", "path", "owner", "instance", "__predecessor_carriers_epirqkv2qe");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_ix_package_42_uvyk_73_lq_path_krbye_343_itnlwowrai";

CREATE INDEX CONCURRENTLY "__attribute_ix_package_42_uvyk_73_lq_path_krbye_343_itnlwowrai" ON "qti"."attribute" USING btree ("__package_42uvyk73lq", "__path_krbye343sj", "__start_d4ovnh4jes");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_ix_package_bn_4_dy_7_hpix_path_62_msjq_7_pm6lnoqh53";

CREATE INDEX CONCURRENTLY "__attribute_ix_package_bn_4_dy_7_hpix_path_62_msjq_7_pm6lnoqh53" ON "qti"."attribute" USING btree ("__package_bn4dy7hpix", "__path_62msjq7pud", "__start_flkm4vizz5");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__document_ix_package_oebzp_3_e_6_ge_path_br_2_mxspxsjfup";

CREATE INDEX CONCURRENTLY "__document_ix_package_oebzp_3_e_6_ge_path_br_2_mxspxsjfup" ON "qti"."document" USING btree ("__package_oebzp3e6ge", "__path_br2kedtzyc");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__instance_ix_package_7_oco_2_iiu_3_c_assembly_xbjfg_slptdquoby";

CREATE INDEX CONCURRENTLY "__instance_ix_package_7_oco_2_iiu_3_c_assembly_xbjfg_slptdquoby" ON "qti"."instance" USING btree ("__package_7oco2iiu3c", "__assembly_xbjfg5nhun", "__start_4yv3jc6ban", "__document_e2oi7uag64", "__assembly_kind_ltwc3ijey6");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__interaction_attribute_ix_package_2_tlea_5_zoii_xkrimuqplw";

CREATE INDEX CONCURRENTLY "__interaction_attribute_ix_package_2_tlea_5_zoii_xkrimuqplw" ON "qti"."interaction_attribute" USING btree ("__package_2tlea5zoii", "__path_rblckxw7ts", "__start_jls42k2hen", "__name_rg43rgieyj", "__kind_b45cblbqjw", "__root_kind_kda3mcmuud", "__value_uzge7k3xnl");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__interaction_attribute_ix_package_akwu_5_v_44_hr_6md5sqpihs";

CREATE INDEX CONCURRENTLY "__interaction_attribute_ix_package_akwu_5_v_44_hr_6md5sqpihs" ON "qti"."interaction_attribute" USING btree ("__package_akwu5v44hr", "__path_zxlwtmoms4", "__start_nbjcgynd2r", "__name_fe3noosmdn", "__kind_6jfwtgpmau", "__value_7uta5xpei4");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__interaction_attribute_ix_package_edgj_7_nodrx_path_vqlfsjtelc";

CREATE INDEX CONCURRENTLY "__interaction_attribute_ix_package_edgj_7_nodrx_path_vqlfsjtelc" ON "qti"."interaction_attribute" USING btree ("__package_edgj7nodrx", "__path_nslytxaolo", "__start_d3q5tjvl25", "__name_j75bjdq6cu", "__kind_vpxci2fugb", "__value_v76rxxho75");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__interaction_attribute_ix_package_igeojkfluj_path_urehestfam";

CREATE INDEX CONCURRENTLY "__interaction_attribute_ix_package_igeojkfluj_path_urehestfam" ON "qti"."interaction_attribute" USING btree ("__package_igeojkfluj", "__path_tvgav637o4", "__start_jzq42yk23s", "__name_obwmdxklsq", "__kind_nrckdj3scm", "__root_kind_dhqsdvadnv", "__value_nfg36bfcs4");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__interaction_attribute_ix_package_mqpj_5_t_4_xzf_4uqnfvyt6u";

CREATE INDEX CONCURRENTLY "__interaction_attribute_ix_package_mqpj_5_t_4_xzf_4uqnfvyt6u" ON "qti"."interaction_attribute" USING btree ("__package_mqpj5t4xzf", "__path_depshxm2mt", "__start_z3oi4txv4a", "__name_wmh45fjrkk", "__kind_tlmkhkfxub", "__value_hkthngi7yn");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__interaction_attribute_ix_package_picvdrsqt_5_path_wweqd3d7bo";

CREATE INDEX CONCURRENTLY "__interaction_attribute_ix_package_picvdrsqt_5_path_wweqd3d7bo" ON "qti"."interaction_attribute" USING btree ("__package_picvdrsqt5", "__path_73ssakxmvn", "__start_cmwuh7pfen", "__name_7mzyqidfrb", "__kind_zobl3bwt47", "__root_kind_pubvsee2wb", "__value_vtfbxatunf");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__interaction_attribute_ix_package_to_3_y_7_vnyov_6ddicq6jbc";

CREATE INDEX CONCURRENTLY "__interaction_attribute_ix_package_to_3_y_7_vnyov_6ddicq6jbc" ON "qti"."interaction_attribute" USING btree ("__package_to3y7vnyov", "__path_b34ynidvnr", "__start_oxuntcwnkt", "__name_553v67wnrk", "__kind_ceaxd7a4wm", "__value_mpwgp3ak6b");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__interaction_attribute_ix_package_utxko_4_msfd_path_hd5zzkfs7i";

CREATE INDEX CONCURRENTLY "__interaction_attribute_ix_package_utxko_4_msfd_path_hd5zzkfs7i" ON "qti"."interaction_attribute" USING btree ("__package_utxko4msfd", "__path_2oqobavsdo", "__start_hykrzdgow7", "__name_yr3i4n7gmn", "__kind_oac3iql54k", "__root_kind_ss7si3dgtu", "__value_ubhvhfkhaq");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__item_ref_document_ix_package_target_path_s5ukfxiq6o";

CREATE INDEX CONCURRENTLY "__item_ref_document_ix_package_target_path_s5ukfxiq6o" ON "qti"."item_ref_document" USING btree ("package", "target", "path");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__named_ix_identifier_kind_package_b7s764ykxl";

CREATE INDEX CONCURRENTLY "__named_ix_identifier_kind_package_b7s764ykxl" ON "qti"."named" USING btree ("identifier", "kind", "package");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__named_ix_kind_package_parent_kind_path_epuvnwfbke";

CREATE INDEX CONCURRENTLY "__named_ix_kind_package_parent_kind_path_epuvnwfbke" ON "qti"."named" USING btree ("kind", "package", "parent_kind", "path");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__named_ix_package_path_kind_parent_3utx3esfhz";

CREATE INDEX CONCURRENTLY "__named_ix_package_path_kind_parent_3utx3esfhz" ON "qti"."named" USING btree ("package", "path", "kind", "parent");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_share_target_ix_package_assembly_target_bykwlaxlf2";

CREATE INDEX CONCURRENTLY "__placed_share_target_ix_package_assembly_target_bykwlaxlf2" ON "qti"."placed_share_target" USING btree ("package", "assembly", "target", "target_instance", "id", "target_start");
