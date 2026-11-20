ALTER TABLE "qti"."identity_text" RENAME COLUMN "idrefs" TO "__aside_idrefs_qeamwged6m";

ALTER TABLE "qti"."identity_text" RENAME COLUMN "idref_text" TO "__aside_idref_text_5ktaipcdfh";

ALTER TABLE "qti"."identity_text" RENAME COLUMN "__aside_idrefs_qeamwged6m" TO "tokens";

ALTER TABLE "qti"."identity_text" RENAME COLUMN "__aside_idref_text_5ktaipcdfh" TO "token_text";

ALTER TABLE "qti"."srcset" RENAME COLUMN "candidates" TO "__aside_candidates_s2jt7kbkqk";

ALTER TABLE "qti"."srcset" RENAME COLUMN "candidate_text" TO "__aside_candidate_text_oacs63kpo4";

ALTER TABLE "qti"."srcset" RENAME COLUMN "__aside_candidates_s2jt7kbkqk" TO "tokens";

ALTER TABLE "qti"."srcset" RENAME COLUMN "__aside_candidate_text_oacs63kpo4" TO "token_text";

ALTER TABLE "qti"."text_idref" RENAME COLUMN "__copy_idrefs_fn6tsq5erc" TO "__aside_copy_idrefs_fn_6_tsq_5_erc_tcaa6flour";

ALTER TABLE "qti"."text_idref" RENAME COLUMN "__aside_copy_idrefs_fn_6_tsq_5_erc_tcaa6flour" TO "__copy_tokens_rrsly23qzp";

ALTER TABLE "qti"."identity_text" RENAME COLUMN "__pred_idrefs_2kinxrebfw" TO "__aside_pred_idrefs_2_kinxrebfw_pqb5gveoi5";

ALTER TABLE "qti"."identity_text" RENAME COLUMN "__aside_pred_idrefs_2_kinxrebfw_pqb5gveoi5" TO "__pred_tokens_ip7mlgrtju";

ALTER TABLE "qti"."srcset_candidate" RENAME COLUMN "__copy_candidates_fvlpqydaij" TO "__aside_copy_candidates_fvlpqydaij_2rm6lyll5o";

ALTER TABLE "qti"."srcset_candidate" RENAME COLUMN "__aside_copy_candidates_fvlpqydaij_2rm6lyll5o" TO "__copy_tokens_mhv3zj45jr";

ALTER TABLE "qti"."srcset" RENAME COLUMN "__pred_candidates_52kqzn7xry" TO "__aside_pred_candidates_52_kqzn_7_xry_gi5jp3w2ep";

ALTER TABLE "qti"."srcset" RENAME COLUMN "__aside_pred_candidates_52_kqzn_7_xry_gi5jp3w2ep" TO "__pred_tokens_ip7mlgrtju";

ALTER TABLE "qti"."identity_text" RENAME CONSTRAINT "__identity_text_key_package_path_start_idrefs_5cilxz5gc3" TO "__aside_identity_text_key_package_path_start_idrefs_n7ctmr3ji4";

ALTER TABLE "qti"."identity_text" RENAME CONSTRAINT "__identity_text_check_identity_text_idrefs_concat_ue5ba77btn" TO "__aside_identity_text_check_identity_text_idrefs_jx2gzd63ez";

ALTER TABLE "qti"."identity_text" RENAME CONSTRAINT "__identity_text_fk_package_path_start_pred_idrefs_xsmsoooxor" TO "__aside_identity_text_fk_package_path_start_pred_3qct4te67s";

ALTER TABLE "qti"."srcset" RENAME CONSTRAINT "__srcset_key_package_path_start_candidates_tucaejlui4" TO "__aside_srcset_key_package_path_start_candidates_ech7ik6tmi";

ALTER TABLE "qti"."srcset" RENAME CONSTRAINT "__srcset_check_srcset_candidates_concat_fold_wly5wyvbil" TO "__aside_srcset_check_srcset_candidates_concat_fold_wxswy57qmq";

ALTER TABLE "qti"."srcset" RENAME CONSTRAINT "__srcset_fk_package_path_start_pred_candidates_xkb6tomycx" TO "__aside_srcset_fk_package_path_start_pred_candidates_gcb7oi2wnp";

ALTER TABLE "qti"."text_idref" RENAME CONSTRAINT "__text_idref_check_text_idref_ordered_identity_text_knkgl2dqjb" TO "__aside_text_idref_check_text_idref_ordered_identity_75pxokavsn";

ALTER TABLE "qti"."text_idref" RENAME CONSTRAINT "__text_idref_check_identity_text_idrefs_concat_fold_5gkp2pod2v" TO "__aside_text_idref_check_identity_text_idrefs_concat_m56apb3kyi";

ALTER TABLE "qti"."text_idref" RENAME CONSTRAINT "__text_idref_fk_package_path_start_copy_idrefs_ieevirsrca" TO "__aside_text_idref_fk_package_path_start_copy_idrefs_m56vpdppkb";

ALTER TABLE "qti"."srcset_candidate" RENAME CONSTRAINT "__srcset_candidate_check_srcset_candidate_ordered_c3wp3ictoc" TO "__aside_srcset_candidate_check_srcset_candidate_u7hi6m4ovm";

ALTER TABLE "qti"."srcset_candidate" RENAME CONSTRAINT "__srcset_candidate_check_srcset_candidates_concat_hrcxltidbf" TO "__aside_srcset_candidate_check_srcset_candidates_mbe6ygaje2";

ALTER TABLE "qti"."srcset_candidate" RENAME CONSTRAINT "__srcset_candidate_fk_package_path_start_copy_qfh7ebivtw" TO "__aside_srcset_candidate_fk_package_path_start_copy_inbj6ba334";

ALTER TABLE "qti"."identity_text" RENAME CONSTRAINT "__aside_identity_text_key_package_path_start_idrefs_n7ctmr3ji4" TO "__identity_text_key_package_path_start_tokens_5pavpyeu7f";

ALTER TABLE "qti"."identity_text" RENAME CONSTRAINT "__aside_identity_text_check_identity_text_idrefs_jx2gzd63ez" TO "__identity_text_check_identity_text_tokens_concat_qc2rvb6wft";

ALTER TABLE "qti"."identity_text" RENAME CONSTRAINT "__aside_identity_text_fk_package_path_start_pred_3qct4te67s" TO "__identity_text_fk_package_path_start_pred_tokens_fdvwocjp2o";

ALTER TABLE "qti"."srcset" RENAME CONSTRAINT "__aside_srcset_key_package_path_start_candidates_ech7ik6tmi" TO "__srcset_key_package_path_start_tokens_7vcwtlqzy2";

ALTER TABLE "qti"."srcset" RENAME CONSTRAINT "__aside_srcset_check_srcset_candidates_concat_fold_wxswy57qmq" TO "__srcset_check_srcset_tokens_concat_fold_7x5nzmr2a5";

ALTER TABLE "qti"."srcset" RENAME CONSTRAINT "__aside_srcset_fk_package_path_start_pred_candidates_gcb7oi2wnp" TO "__srcset_fk_package_path_start_pred_tokens_token_gxpdnzadwg";

ALTER TABLE "qti"."text_idref" RENAME CONSTRAINT "__aside_text_idref_check_text_idref_ordered_identity_75pxokavsn" TO "__text_idref_check_text_idref_ordered_identity_text_j6a2rgc35g";

ALTER TABLE "qti"."text_idref" RENAME CONSTRAINT "__aside_text_idref_check_identity_text_idrefs_concat_m56apb3kyi" TO "__text_idref_check_identity_text_tokens_concat_fold_tizgwsxdoc";

ALTER TABLE "qti"."text_idref" RENAME CONSTRAINT "__aside_text_idref_fk_package_path_start_copy_idrefs_m56vpdppkb" TO "__text_idref_fk_package_path_start_copy_tokens_hkmj36vgbn";

ALTER TABLE "qti"."srcset_candidate" RENAME CONSTRAINT "__aside_srcset_candidate_check_srcset_candidate_u7hi6m4ovm" TO "__srcset_candidate_check_srcset_candidate_ordered_muwkwohqto";

ALTER TABLE "qti"."srcset_candidate" RENAME CONSTRAINT "__aside_srcset_candidate_check_srcset_candidates_mbe6ygaje2" TO "__srcset_candidate_check_srcset_tokens_concat_fold_jthorh3gv6";

ALTER TABLE "qti"."srcset_candidate" RENAME CONSTRAINT "__aside_srcset_candidate_fk_package_path_start_copy_inbj6ba334" TO "__srcset_candidate_fk_package_path_start_copy_tokens_prty6vocql";

CREATE DOMAIN "qti"."__text_oq3spimary" AS "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" CONSTRAINT "check" CHECK (VALUE IS NULL OR ("pg_catalog"."octet_length"(VALUE) <= 268435454) IS TRUE);
