-- grizzle: no-transaction

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_kind_name_pmnnpfcw43";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_kind_name_pmnnpfcw43" ON "qti"."attribute" USING btree ("package", "path", "start", "kind", "name");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_nudwhzaoqw";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_nudwhzaoqw" ON "qti"."attribute" USING btree ("__package_sb4vf54qea", "__path_z4osijqpge", "__start_rr4guycxoe");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_name_djhic4jx5w";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_name_djhic4jx5w" ON "qti"."attribute" USING btree ("__package_wzhghjb5zw", "__path_blewaj5dne", "__start_zdbhp7hhmc", "__name_4yahatkdtq");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_f3hh5h37uf";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_f3hh5h37uf" ON "qti"."attribute" USING btree ("__package_yujzm7tfrq", "__path_hfdzxz3nor", "__start_krmkvl4n6k");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_lb3vztgnax";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_lb3vztgnax" ON "qti"."attribute" USING btree ("__package_ljk5bvjm3n", "__path_lobsrpzcbq", "__start_mp7bdpz2cq");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_fawptpbyvg";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_fawptpbyvg" ON "qti"."attribute" USING btree ("__package_plzx4yohio", "__path_zwvqf4qmlm", "__start_57bzovvmwe");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_gosgndugtc";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_gosgndugtc" ON "qti"."attribute" USING btree ("__package_eyglhvygxe", "__path_m4p7mwtbdk", "__start_mefnrknqzb");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_name_eil7fbgol6";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_name_eil7fbgol6" ON "qti"."attribute" USING btree ("__package_27hetzadou", "__path_7c57c2ilov", "__start_o7jfdvo6c7", "name");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_kyawhh3cuc";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_kyawhh3cuc" ON "qti"."attribute" USING btree ("__package_b6kgnl3xfs", "__path_azunhoshef", "__start_rc4nppr3ud");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_rrrgzagx3m";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_rrrgzagx3m" ON "qti"."attribute" USING btree ("__package_sipguotijl", "__path_jgc2utxb4t", "__start_o6wppzqeam");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_j2zoauzbvc";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_j2zoauzbvc" ON "qti"."attribute" USING btree ("__package_ry3b5yht7o", "__path_3c7p3tdsiy", "__start_upmdsfduqi");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_yqzafej4dc";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_yqzafej4dc" ON "qti"."attribute" USING btree ("__package_w3kfyscyq6", "__path_gtpm5parwn", "__start_agrfg4oclj");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_st5zubvnfp";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_st5zubvnfp" ON "qti"."attribute" USING btree ("__package_6p5a7xguhh", "__path_b7k5p7mxdy", "__start_u6rtfetz3j");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_bukyp5wjr3";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_bukyp5wjr3" ON "qti"."attribute" USING btree ("__package_fdmq6gnktx", "__path_rjawo2ooou", "__start_k3mzt3pezf");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_lrpz67qetv";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_lrpz67qetv" ON "qti"."attribute" USING btree ("__package_wmfpxpnzad", "__path_xl2dplvb7c", "__start_vv2olwonzr");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_6hjs6xtxtz";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_6hjs6xtxtz" ON "qti"."attribute" USING btree ("__package_cxkdwkinp4", "__path_c6nejsorpf", "__start_pxly5scdi5");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_n76b2akyme";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_n76b2akyme" ON "qti"."attribute" USING btree ("__package_silfxtdrjl", "__path_drlh7ixlo5", "__start_t4l25smhzq");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_g7f6q4f3qf";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_g7f6q4f3qf" ON "qti"."attribute" USING btree ("__package_a5yqzsnmmz", "__path_pwi747uawc", "__start_steybjtz7r");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_kufj2a7lsp";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_kufj2a7lsp" ON "qti"."attribute" USING btree ("__package_ikskfrpixe", "__path_lmjhr3jxjf", "__start_kkljqoxqjk");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_name_6en47hlyy5";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_name_6en47hlyy5" ON "qti"."attribute" USING btree ("__package_txxrr4675l", "__path_n3yp4p2vzk", "__start_xckwdag7il", "__name_vvkts6omjc");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_name_fg4ilplyeb";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_name_fg4ilplyeb" ON "qti"."attribute" USING btree ("__package_dzzhujhd2x", "__path_b622u6a4mz", "__start_pklv7fsix4", "__name_aqo4zwtrd3");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_oavaoq32mu";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_oavaoq32mu" ON "qti"."attribute" USING btree ("__package_errr4rslgl", "__path_6r25o73dfe", "__start_3yrluhvjfi");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_document_type_iblcvhpbjy";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_document_type_iblcvhpbjy" ON "qti"."attribute" USING btree ("__package_errr4rslgl", "__path_6r25o73dfe", "__start_3yrluhvjfi", "document_type", "kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_cap4e3ltvy";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_cap4e3ltvy" ON "qti"."attribute" USING btree ("__package_vhxntdyqxe", "__path_gy2savhene", "__start_gnm4qpjdy6");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_kind_w6eonr6o6n";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_kind_w6eonr6o6n" ON "qti"."attribute" USING btree ("__package_vhxntdyqxe", "__path_gy2savhene", "__start_gnm4qpjdy6", "kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_hj3w2q4og4";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_hj3w2q4og4" ON "qti"."attribute" USING btree ("__package_2uyqqvm75y", "__path_pnb7qjirkw", "__start_4nyypwlt77");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_name_aetuiohnfq";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_name_aetuiohnfq" ON "qti"."attribute" USING btree ("__package_ws3aalkwkh", "__path_7mxskdbvo3", "__start_c4sxh2tpk6", "__name_gsghyn4br6");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_name_ew2cxiroqs";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_name_ew2cxiroqs" ON "qti"."attribute" USING btree ("__package_kvhxjln7yu", "__path_bulszdqruq", "__start_2lacvkd2my", "__name_xtraugzbjr");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_2igkkx7ct2";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_2igkkx7ct2" ON "qti"."attribute" USING btree ("__package_ly6xvnlp4w", "__path_ofxw47iyns", "__start_5bmaolgqju");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_xwdy6oj2yh";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_xwdy6oj2yh" ON "qti"."attribute" USING btree ("__package_l26un5p764", "__path_23el63sekx", "__start_frsqrmqlnd");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_fuyf63mwkk";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_fuyf63mwkk" ON "qti"."attribute" USING btree ("__package_ww6m6kuwsv", "__path_7e3z4qkvcr", "__start_e4zhccl5sr");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_name_vb5sux3dyf";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_name_vb5sux3dyf" ON "qti"."attribute" USING btree ("__package_hehty6geft", "__path_dzfr64ghi4", "__start_g5q4acuj75", "__name_6tjehtvnyf");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_bxbh2qgwix";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_bxbh2qgwix" ON "qti"."attribute" USING btree ("__package_uxx7dxdziz", "__path_7psgzslyqw", "__start_cuk3ewunde");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_lpgurqc67o";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_lpgurqc67o" ON "qti"."attribute" USING btree ("__package_56f4gscd2o", "__path_n5uuozkytw", "__start_6wln6jhdhj");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_lkyjkpslhm";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_lkyjkpslhm" ON "qti"."attribute" USING btree ("__package_tkzla6ex7r", "__path_amciicl6f2");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_4p5rbjqwqo";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_4p5rbjqwqo" ON "qti"."attribute" USING btree ("__package_gw6es3z53z", "__path_vsizisc4th");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_m7je26ify2";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_m7je26ify2" ON "qti"."attribute" USING btree ("__package_ybzlg64bpx", "__path_qmeumul7w4", "__start_zy5dpzf755");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_ts6nkqoorw";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_ts6nkqoorw" ON "qti"."attribute" USING btree ("__package_zmnh43kml3", "__path_cx2r5hdmpc", "__start_xjojbpi7j5");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_key_package_path_start_mdp4bq7zbw";

CREATE UNIQUE INDEX CONCURRENTLY "__attribute_key_package_path_start_mdp4bq7zbw" ON "qti"."attribute" USING btree ("__package_ajxbl67ghu", "__path_2cevmpm5ha", "__start_zjgk6s7o2t");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__binding_cardinality_key_package_path_start_y6fg6gyfjh";

CREATE UNIQUE INDEX CONCURRENTLY "__binding_cardinality_key_package_path_start_y6fg6gyfjh" ON "qti"."binding_cardinality" USING btree ("package", "path", "start", "attribute", "declaration", "cardinality", "base_types");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__binding_declaration_key_package_path_start_lrehzhotda";

CREATE UNIQUE INDEX CONCURRENTLY "__binding_declaration_key_package_path_start_lrehzhotda" ON "qti"."binding_declaration" USING btree ("package", "path", "start", "attribute", "declaration", "base_types");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__binding_declaration_key_package_path_start_53euplx42l";

CREATE UNIQUE INDEX CONCURRENTLY "__binding_declaration_key_package_path_start_53euplx42l" ON "qti"."binding_declaration" USING btree ("package", "path", "start", "attribute", "identifier");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__binding_name_key_package_path_start_attribute_3qufdbmi7i";

CREATE UNIQUE INDEX CONCURRENTLY "__binding_name_key_package_path_start_attribute_3qufdbmi7i" ON "qti"."binding_name" USING btree ("package", "path", "start", "attribute", "identifier");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__bound_variable_key_package_path_start_attribute_nnzpz5f6yy";

CREATE UNIQUE INDEX CONCURRENTLY "__bound_variable_key_package_path_start_attribute_nnzpz5f6yy" ON "qti"."bound_variable" USING btree ("package", "path", "start", "attribute", "identifier");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__cell_headers_key_package_path_start_tokens_mdrwqv4pvh";

CREATE UNIQUE INDEX CONCURRENTLY "__cell_headers_key_package_path_start_tokens_mdrwqv4pvh" ON "qti"."cell_headers" USING btree ("package", "path", "start", "tokens");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__declaration_key_package_path_start_minimums_7bpytzlul5";

CREATE UNIQUE INDEX CONCURRENTLY "__declaration_key_package_path_start_minimums_7bpytzlul5" ON "qti"."declaration" USING btree ("package", "path", "start", "minimums");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__document_id_key_package_path_start_id_owner_lcfyvj5sku";

CREATE UNIQUE INDEX CONCURRENTLY "__document_id_key_package_path_start_id_owner_lcfyvj5sku" ON "qti"."document_id" USING btree ("package", "path", "start", "id", "owner");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__entry_key_package_path_z53dkaqxpx";

CREATE UNIQUE INDEX CONCURRENTLY "__entry_key_package_path_z53dkaqxpx" ON "qti"."entry" USING btree ("__package_pgej6nvb7i", "__path_el46gj67vc");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__entry_key_package_path_pcylbkj3bt";

CREATE UNIQUE INDEX CONCURRENTLY "__entry_key_package_path_pcylbkj3bt" ON "qti"."entry" USING btree ("__package_5elem6sky2", "__path_sjdiby6of5");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__expression_key_package_path_start_base_type_z3zrneogcu";

CREATE UNIQUE INDEX CONCURRENTLY "__expression_key_package_path_start_base_type_z3zrneogcu" ON "qti"."expression" USING btree ("package", "path", "start", "base_type");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__expression_key_package_path_start_base_type_f36dqywnzb";

CREATE UNIQUE INDEX CONCURRENTLY "__expression_key_package_path_start_base_type_f36dqywnzb" ON "qti"."expression" USING btree ("package", "path", "start", "base_type", "cardinality");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__expression_key_package_path_start_language_base_mnwsruy44d";

CREATE UNIQUE INDEX CONCURRENTLY "__expression_key_package_path_start_language_base_mnwsruy44d" ON "qti"."expression" USING btree ("package", "path", "start", "language", "base_type", "cardinality");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__expression_attribute_key_package_path_start_y7ap36b2c2";

CREATE UNIQUE INDEX CONCURRENTLY "__expression_attribute_key_package_path_start_y7ap36b2c2" ON "qti"."expression_attribute" USING btree ("package", "path", "start", "attribute", "lexical");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__least_count_key_package_path_start_least_up4t5q5u2p";

CREATE UNIQUE INDEX CONCURRENTLY "__least_count_key_package_path_start_least_up4t5q5u2p" ON "qti"."least_count" USING btree ("package", "path", "start", "least");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__lookup_value_key_package_path_start_mxezy5o74l";

CREATE UNIQUE INDEX CONCURRENTLY "__lookup_value_key_package_path_start_mxezy5o74l" ON "qti"."lookup_value" USING btree ("__package_b46jqvoml5", "__path_6fakxlvhsj", "__start_qwjp3iwixd");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__map_key_key_package_path_start_irat2n6lgi";

CREATE UNIQUE INDEX CONCURRENTLY "__map_key_key_package_path_start_irat2n6lgi" ON "qti"."map_key" USING btree ("__package_b46jqvoml5", "__path_6fakxlvhsj", "__start_qwjp3iwixd");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__mapping_key_package_path_start_xlrapjm2pc";

CREATE UNIQUE INDEX CONCURRENTLY "__mapping_key_package_path_start_xlrapjm2pc" ON "qti"."mapping" USING btree ("__package_b46jqvoml5", "__path_6fakxlvhsj", "__start_qwjp3iwixd");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__math_align_scope_key_package_path_start_state_zrr62hnvxo";

CREATE UNIQUE INDEX CONCURRENTLY "__math_align_scope_key_package_path_start_state_zrr62hnvxo" ON "qti"."math_align_scope" USING btree ("package", "path", "start", "state");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__math_cell_key_package_path_start_leaves_nhlewh35h4";

CREATE UNIQUE INDEX CONCURRENTLY "__math_cell_key_package_path_start_leaves_nhlewh35h4" ON "qti"."math_cell" USING btree ("package", "path", "start", "leaves");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__most_count_key_package_path_start_most_nu7gmrhgbe";

CREATE UNIQUE INDEX CONCURRENTLY "__most_count_key_package_path_start_most_nu7gmrhgbe" ON "qti"."most_count" USING btree ("package", "path", "start", "most");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_key_package_path_children_ancestry_document_g5nk4s6nj5";

CREATE UNIQUE INDEX CONCURRENTLY "__node_key_package_path_children_ancestry_document_g5nk4s6nj5" ON "qti"."node" USING btree ("package", "path", "children", "ancestry", "document_type", "nearest", "nearest_kind", "nearest_path", "governor", "kind", "parent_kind", "start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_key_package_path_start_attributes_document_y4dmydumvt";

CREATE UNIQUE INDEX CONCURRENTLY "__node_key_package_path_start_attributes_document_y4dmydumvt" ON "qti"."node" USING btree ("package", "path", "start", "attributes", "document_type", "governor", "kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_key_package_path_start_kind_governor_42fsltrsjy";

CREATE UNIQUE INDEX CONCURRENTLY "__node_key_package_path_start_kind_governor_42fsltrsjy" ON "qti"."node" USING btree ("package", "path", "start", "kind", "governor");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_key_package_path_start_kind_nearest_parent_z7o6acirmr";

CREATE UNIQUE INDEX CONCURRENTLY "__node_key_package_path_start_kind_nearest_parent_z7o6acirmr" ON "qti"."node" USING btree ("package", "path", "start", "kind", "nearest", "parent");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_key_package_path_start_nearest_y5k53am632";

CREATE UNIQUE INDEX CONCURRENTLY "__node_key_package_path_start_nearest_y5k53am632" ON "qti"."node" USING btree ("package", "path", "start", "nearest");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_key_package_path_start_open_attributes_nc25nroxph";

CREATE UNIQUE INDEX CONCURRENTLY "__node_key_package_path_start_open_attributes_nc25nroxph" ON "qti"."node" USING btree ("package", "path", "start", "open_attributes", "governor", "kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_key_package_path_start_string_value_jnzgtez4u3";

CREATE UNIQUE INDEX CONCURRENTLY "__node_key_package_path_start_string_value_jnzgtez4u3" ON "qti"."node" USING btree ("package", "path", "start", "string_value");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_key_package_path_parent_at_end_after_children_zzmd4pcivf";

CREATE UNIQUE INDEX CONCURRENTLY "__node_key_package_path_parent_at_end_after_children_zzmd4pcivf" ON "qti"."node" USING btree ("package", "path", "__parent_l4ckjnvwat", "at", "end", "__after_children_0_qbioc6jbat", "__after_children_0_vmaftea6hj", "elements", "chars_after", "state");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_key_package_path_parent_state_xef7iaytjz";

CREATE UNIQUE INDEX CONCURRENTLY "__node_key_package_path_parent_state_xef7iaytjz" ON "qti"."node" USING btree ("__package_3taa5kijgy", "__path_4et2r2wckb", "__parent_cuutywtabc", "__state_uxsdhqrgpz");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_key_package_path_start_tesxglwpd3";

CREATE UNIQUE INDEX CONCURRENTLY "__node_key_package_path_start_tesxglwpd3" ON "qti"."node" USING btree ("__package_744kzqyvzq", "__path_mss3eygqiy", "__start_wlwbtkgcxf");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_key_package_path_start_yygfctv45i";

CREATE UNIQUE INDEX CONCURRENTLY "__node_key_package_path_start_yygfctv45i" ON "qti"."node" USING btree ("__package_7mjar2wjii", "__path_5hn7wqu2v5", "__start_ispg63kjtz");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_key_package_path_start_ymenr5n2sm";

CREATE UNIQUE INDEX CONCURRENTLY "__node_key_package_path_start_ymenr5n2sm" ON "qti"."node" USING btree ("__package_uhsj5qcxm3", "__path_6z7ygjaop7", "__start_n767ktqknz");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_key_package_path_start_a6pktlx5sj";

CREATE UNIQUE INDEX CONCURRENTLY "__node_key_package_path_start_a6pktlx5sj" ON "qti"."node" USING btree ("__package_pzlq2bwqm3", "__path_4coi6s576w", "__start_kdua5votbj");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_key_package_path_parent_uibqy75ezp";

CREATE UNIQUE INDEX CONCURRENTLY "__node_key_package_path_parent_uibqy75ezp" ON "qti"."node" USING btree ("__package_lqgfkydq7q", "__path_ms4olijgu3", "__parent_gvsacnek5z");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_binding_cardinality_key_package_assembly_liqrs3o4bj";

CREATE UNIQUE INDEX CONCURRENTLY "__placed_binding_cardinality_key_package_assembly_liqrs3o4bj" ON "qti"."placed_binding_cardinality" USING btree ("package", "assembly", "instance", "start", "attribute", "declaration", "cardinality", "base_types");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_binding_declaration_key_package_assembly_irhrutjwqg";

CREATE UNIQUE INDEX CONCURRENTLY "__placed_binding_declaration_key_package_assembly_irhrutjwqg" ON "qti"."placed_binding_declaration" USING btree ("package", "assembly", "instance", "start", "attribute", "path", "declaration", "base_types");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_binding_declaration_key_package_assembly_hvfagf5c7x";

CREATE UNIQUE INDEX CONCURRENTLY "__placed_binding_declaration_key_package_assembly_hvfagf5c7x" ON "qti"."placed_binding_declaration" USING btree ("package", "assembly", "instance", "start", "attribute", "path", "identifier");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__site_key_package_path_start_ancestry_kind_nearest_ap2yfi7b7f";

CREATE UNIQUE INDEX CONCURRENTLY "__site_key_package_path_start_ancestry_kind_nearest_ap2yfi7b7f" ON "qti"."site" USING btree ("package", "path", "start", "ancestry", "kind", "nearest", "nearest_kind", "parent_kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__site_target_key_package_path_start_parent_kind_cu6n5wnlhm";

CREATE UNIQUE INDEX CONCURRENTLY "__site_target_key_package_path_start_parent_kind_cu6n5wnlhm" ON "qti"."site_target" USING btree ("package", "path", "start", "parent_kind", "places", "target_root", "splices");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__area_mapping_ix_package_base_types_path_7a7zf47giy";

CREATE INDEX CONCURRENTLY "__area_mapping_ix_package_base_types_path_7a7zf47giy" ON "qti"."area_mapping" USING btree ("package", "base_types", "path", "cardinalities", "declaration_kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__area_mapping_cardinality_ix_package_cardinality_7j4wqezyj5";

CREATE INDEX CONCURRENTLY "__area_mapping_cardinality_ix_package_cardinality_7j4wqezyj5" ON "qti"."area_mapping_cardinality" USING btree ("package", "cardinality", "path");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_ix_package_42_uvyk_73_lq_path_krbye_343_itnlwowrai";

CREATE INDEX CONCURRENTLY "__attribute_ix_package_42_uvyk_73_lq_path_krbye_343_itnlwowrai" ON "qti"."attribute" USING btree ("__package_42uvyk73lq", "__path_krbye343sj", "__start_d4ovnh4jes");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_ix_package_4_wmstz_4_hmo_path_aly_5_jn_6_ix5hx2utx7";

CREATE INDEX CONCURRENTLY "__attribute_ix_package_4_wmstz_4_hmo_path_aly_5_jn_6_ix5hx2utx7" ON "qti"."attribute" USING btree ("__package_4wmstz4hmo", "__path_aly5jn6d45", "__start_lwulvr3rwo");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_ix_package_6_c_6_ld_2_byqg_path_qg_6_xupsbxacga";

CREATE INDEX CONCURRENTLY "__attribute_ix_package_6_c_6_ld_2_byqg_path_qg_6_xupsbxacga" ON "qti"."attribute" USING btree ("__package_6c6ld2byqg", "__path_qg6uhkfzwt", "__start_poeznhy35n");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_ix_package_alavvtv_2_rx_path_iu_4_y_5_p_3dqqeloppg";

CREATE INDEX CONCURRENTLY "__attribute_ix_package_alavvtv_2_rx_path_iu_4_y_5_p_3dqqeloppg" ON "qti"."attribute" USING btree ("__package_alavvtv2rx", "__path_iu4y5p5ihk", "__start_sat5hujmus");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_ix_package_bjbpdp_6_xem_path_ru_66_as_7_yl2agjp6ad";

CREATE INDEX CONCURRENTLY "__attribute_ix_package_bjbpdp_6_xem_path_ru_66_as_7_yl2agjp6ad" ON "qti"."attribute" USING btree ("__package_bjbpdp6xem", "__path_ru66as7qhr", "__start_eb6sjdziei");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_ix_package_bvdgbsgon_2_path_znvt_6_oh_5_hbpogwod2y";

CREATE INDEX CONCURRENTLY "__attribute_ix_package_bvdgbsgon_2_path_znvt_6_oh_5_hbpogwod2y" ON "qti"."attribute" USING btree ("__package_bvdgbsgon2", "__path_znvt6oh5hr", "__start_wunxm7uffu");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_ix_package_cyyslsevot_path_le_3_rnunqb_5_i7sy5qyf3o";

CREATE INDEX CONCURRENTLY "__attribute_ix_package_cyyslsevot_path_le_3_rnunqb_5_i7sy5qyf3o" ON "qti"."attribute" USING btree ("__package_cyyslsevot", "__path_le3rnunqb5", "__start_x57i4oxzjc");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_ix_package_eemdstsjwd_path_6_jjwz_6_jgfn_6oajurlryf";

CREATE INDEX CONCURRENTLY "__attribute_ix_package_eemdstsjwd_path_6_jjwz_6_jgfn_6oajurlryf" ON "qti"."attribute" USING btree ("__package_eemdstsjwd", "__path_6jjwz6jgfn", "__start_md4iedwgp5");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_ix_package_gheeoujzg_3_path_qy_4_jephew_236c4p37cc";

CREATE INDEX CONCURRENTLY "__attribute_ix_package_gheeoujzg_3_path_qy_4_jephew_236c4p37cc" ON "qti"."attribute" USING btree ("__package_gheeoujzg3", "__path_qy4jephew7", "__start_rxit4nclyf");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_ix_package_jrh_4_wbrdcs_path_xrl_4_ean_az4tli67t7";

CREATE INDEX CONCURRENTLY "__attribute_ix_package_jrh_4_wbrdcs_path_xrl_4_ean_az4tli67t7" ON "qti"."attribute" USING btree ("__package_jrh4wbrdcs", "__path_xrl4ean242", "__start_v7jhneryku", "__name_olkikci4cm", "__kind_kfm5644qqo");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_ix_package_mgbz_7_f_45_gp_path_vlsjep4nc4";

CREATE INDEX CONCURRENTLY "__attribute_ix_package_mgbz_7_f_45_gp_path_vlsjep4nc4" ON "qti"."attribute" USING btree ("__package_mgbz7f45gp", "__path_ofqkijqyop", "__start_jlf55mdwoe");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_ix_package_noyti_2_cwxu_path_kfgio_5_kp_j5k7ulgoib";

CREATE INDEX CONCURRENTLY "__attribute_ix_package_noyti_2_cwxu_path_kfgio_5_kp_j5k7ulgoib" ON "qti"."attribute" USING btree ("__package_noyti2cwxu", "__path_kfgio5kp37", "__start_jx3ezk2tts");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_ix_package_nprl_7_keln_4_path_7_csc_5_p_x5gpqfkfcr";

CREATE INDEX CONCURRENTLY "__attribute_ix_package_nprl_7_keln_4_path_7_csc_5_p_x5gpqfkfcr" ON "qti"."attribute" USING btree ("__package_nprl7keln4", "__path_7csc5p77sj", "__start_tuvypeyg5x");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_ix_package_omw_3_mcextk_path_iuujvzpydd_6heyj6lqcm";

CREATE INDEX CONCURRENTLY "__attribute_ix_package_omw_3_mcextk_path_iuujvzpydd_6heyj6lqcm" ON "qti"."attribute" USING btree ("__package_omw3mcextk", "__path_iuujvzpydd", "__start_kk2ykdhsej");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_ix_package_pwbimkvewd_path_k_2_tshabbhn_py2vhwjncq";

CREATE INDEX CONCURRENTLY "__attribute_ix_package_pwbimkvewd_path_k_2_tshabbhn_py2vhwjncq" ON "qti"."attribute" USING btree ("__package_pwbimkvewd", "__path_k2tshabbhn", "__start_opjbxtdqe2");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_ix_package_wlgsv_5_oas_6_path_4_r_6_k_4_x442t25heb";

CREATE INDEX CONCURRENTLY "__attribute_ix_package_wlgsv_5_oas_6_path_4_r_6_k_4_x442t25heb" ON "qti"."attribute" USING btree ("__package_wlgsv5oas6", "__path_4r6k4uohyf", "__start_l73crm7lok");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_ix_package_wlmmq_7_zmaj_path_bstac_22_2drx4u7qbm";

CREATE INDEX CONCURRENTLY "__attribute_ix_package_wlmmq_7_zmaj_path_bstac_22_2drx4u7qbm" ON "qti"."attribute" USING btree ("__package_wlmmq7zmaj", "__path_bstac22wbh", "__start_4bbt2bslfy");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_ix_document_type_kind_name_package_xjysj7dqr3";

CREATE INDEX CONCURRENTLY "__attribute_ix_document_type_kind_name_package_xjysj7dqr3" ON "qti"."attribute" USING btree ("document_type", "kind", "name", "package");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__attribute_ix_name_package_path_upwaxs4snk";

CREATE INDEX CONCURRENTLY "__attribute_ix_name_package_path_upwaxs4snk" ON "qti"."attribute" USING btree ("name", "package", "path");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__binding_cardinality_ix_package_attribute_mcyf5gps2i";

CREATE INDEX CONCURRENTLY "__binding_cardinality_ix_package_attribute_mcyf5gps2i" ON "qti"."binding_cardinality" USING btree ("package", "attribute", "cardinality");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__card_support_ix_package_path_support_liwl2ctcmf";

CREATE INDEX CONCURRENTLY "__card_support_ix_package_path_support_liwl2ctcmf" ON "qti"."card_support" USING btree ("package", "path", "support");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__catalog_scope_ix_package_path_scope_hfhi72vpll";

CREATE INDEX CONCURRENTLY "__catalog_scope_ix_package_path_scope_hfhi72vpll" ON "qti"."catalog_scope" USING btree ("package", "path", "scope");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__choice_interaction_ix_package_interaction_dloditcwvb";

CREATE INDEX CONCURRENTLY "__choice_interaction_ix_package_interaction_dloditcwvb" ON "qti"."choice_interaction" USING btree ("package", "interaction");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__declaration_cardinality_ix_package_path_fkxmyry5c5";

CREATE INDEX CONCURRENTLY "__declaration_cardinality_ix_package_path_fkxmyry5c5" ON "qti"."declaration_cardinality" USING btree ("package", "path", "cardinality");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__dependency_ix_package_path_ref_ep76tizeax";

CREATE INDEX CONCURRENTLY "__dependency_ix_package_path_ref_ep76tizeax" ON "qti"."dependency" USING btree ("package", "path", "ref");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__document_id_ix_package_path_admitted_id_owner_b7n73pi7dm";

CREATE INDEX CONCURRENTLY "__document_id_ix_package_path_admitted_id_owner_b7n73pi7dm" ON "qti"."document_id" USING btree ("package", "path", "admitted", "id", "owner");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__expression_ix_package_path_language_as5w5gy422";

CREATE INDEX CONCURRENTLY "__expression_ix_package_path_language_as5w5gy422" ON "qti"."expression" USING btree ("package", "path", "language");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__expression_attribute_ix_package_path_start_base_p7gnpkt44g";

CREATE INDEX CONCURRENTLY "__expression_attribute_ix_package_path_start_base_p7gnpkt44g" ON "qti"."expression_attribute" USING btree ("package", "path", "start", "base_type");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__file_ix_package_scope_target_path_m3rxj4gpfz";

CREATE INDEX CONCURRENTLY "__file_ix_package_scope_target_path_m3rxj4gpfz" ON "qti"."file" USING btree ("package", "scope", "target", "path");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__header_token_ix_package_path_token_z4in3bawzn";

CREATE INDEX CONCURRENTLY "__header_token_ix_package_path_token_z4in3bawzn" ON "qti"."header_token" USING btree ("package", "path", "token");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__interaction_attribute_ix_package_a_3_twij_6_wxn_ftty554srz";

CREATE INDEX CONCURRENTLY "__interaction_attribute_ix_package_a_3_twij_6_wxn_ftty554srz" ON "qti"."interaction_attribute" USING btree ("__package_a3twij6wxn", "__path_c4phd6tfm7", "__start_ujbwqhewkw", "__name_dt6do2ts2h");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__interaction_attribute_ix_package_a_3_twij_6_wxn_zerc6l7kzr";

CREATE INDEX CONCURRENTLY "__interaction_attribute_ix_package_a_3_twij_6_wxn_zerc6l7kzr" ON "qti"."interaction_attribute" USING btree ("__package_a3twij6wxn", "__path_c4phd6tfm7", "__start_ujbwqhewkw", "__value_k6l4yrm3j2");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__interaction_attribute_ix_package_b_5_tdnw_73_p_4_ataps7ekxd";

CREATE INDEX CONCURRENTLY "__interaction_attribute_ix_package_b_5_tdnw_73_p_4_ataps7ekxd" ON "qti"."interaction_attribute" USING btree ("__package_b5tdnw73p4", "__path_v4mlziilgi", "__start_c2zxirpv3p", "__name_bd463qcqrt", "__value_4loueoylry");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__interaction_attribute_ix_package_bsckihisag_path_clmtcn34zx";

CREATE INDEX CONCURRENTLY "__interaction_attribute_ix_package_bsckihisag_path_clmtcn34zx" ON "qti"."interaction_attribute" USING btree ("__package_bsckihisag", "__path_zixwibn4iv", "__start_rzt77gh5qy", "__name_64wvduu5ig");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__interaction_attribute_ix_package_bsckihisag_path_s3rpxshegn";

CREATE INDEX CONCURRENTLY "__interaction_attribute_ix_package_bsckihisag_path_s3rpxshegn" ON "qti"."interaction_attribute" USING btree ("__package_bsckihisag", "__path_zixwibn4iv", "__start_rzt77gh5qy", "__value_cgxyakb3me");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__interaction_attribute_ix_package_m_3_aurw_5_re_6_wvv3pos7mp";

CREATE INDEX CONCURRENTLY "__interaction_attribute_ix_package_m_3_aurw_5_re_6_wvv3pos7mp" ON "qti"."interaction_attribute" USING btree ("__package_m3aurw5re6", "__path_3g6ckucdgk", "__start_oaog3vtv7w", "__name_n3b7rzkrbm", "__value_mbyo4punxj");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__interaction_attribute_ix_package_name_path_w6akuivfgk";

CREATE INDEX CONCURRENTLY "__interaction_attribute_ix_package_name_path_w6akuivfgk" ON "qti"."interaction_attribute" USING btree ("package", "name", "path");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__lookup_table_ix_package_base_types_cardinalities_pnvkm7qzey";

CREATE INDEX CONCURRENTLY "__lookup_table_ix_package_base_types_cardinalities_pnvkm7qzey" ON "qti"."lookup_table" USING btree ("package", "base_types", "cardinalities", "declaration_kind", "path");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__lookup_table_cardinality_ix_package_cardinality_ufv4zqlwl7";

CREATE INDEX CONCURRENTLY "__lookup_table_cardinality_ix_package_cardinality_ufv4zqlwl7" ON "qti"."lookup_table_cardinality" USING btree ("package", "cardinality", "path");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__lookup_value_ix_package_base_types_path_h6w6xxqgpe";

CREATE INDEX CONCURRENTLY "__lookup_value_ix_package_base_types_path_h6w6xxqgpe" ON "qti"."lookup_value" USING btree ("package", "base_types", "path");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__lookup_value_type_ix_package_path_base_type_ishfkvokyk";

CREATE INDEX CONCURRENTLY "__lookup_value_type_ix_package_path_base_type_ishfkvokyk" ON "qti"."lookup_value_type" USING btree ("package", "path", "base_type");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__map_key_ix_package_base_types_path_46b3etxhwz";

CREATE INDEX CONCURRENTLY "__map_key_ix_package_base_types_path_46b3etxhwz" ON "qti"."map_key" USING btree ("package", "base_types", "path");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__map_key_type_ix_package_base_type_path_mafohimtvv";

CREATE INDEX CONCURRENTLY "__map_key_type_ix_package_base_type_path_mafohimtvv" ON "qti"."map_key_type" USING btree ("package", "base_type", "path");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__mapping_ix_package_base_types_cardinalities_vdymrcp6q3";

CREATE INDEX CONCURRENTLY "__mapping_ix_package_base_types_cardinalities_vdymrcp6q3" ON "qti"."mapping" USING btree ("package", "base_types", "cardinalities", "declaration_kind", "path");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__mapping_base_type_ix_package_base_type_path_gj3sla5s6s";

CREATE INDEX CONCURRENTLY "__mapping_base_type_ix_package_base_type_path_gj3sla5s6s" ON "qti"."mapping_base_type" USING btree ("package", "base_type", "path");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__mapping_cardinality_ix_package_cardinality_path_ruvry5bpmh";

CREATE INDEX CONCURRENTLY "__mapping_cardinality_ix_package_cardinality_path_ruvry5bpmh" ON "qti"."mapping_cardinality" USING btree ("package", "cardinality", "path");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__math_align_scope_ix_package_cell_inherited_path_gh6uv3byv3";

CREATE INDEX CONCURRENTLY "__math_align_scope_ix_package_cell_inherited_path_gh6uv3byv3" ON "qti"."math_align_scope" USING btree ("package", "cell", "inherited", "path", "received");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__math_align_scope_ix_package_chosen_path_q3dovlpah3";

CREATE INDEX CONCURRENTLY "__math_align_scope_ix_package_chosen_path_q3dovlpah3" ON "qti"."math_align_scope" USING btree ("package", "chosen", "path");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__named_ix_package_identifier_poryqrycn2";

CREATE INDEX CONCURRENTLY "__named_ix_package_identifier_poryqrycn2" ON "qti"."named" USING btree ("package", "identifier");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_7_lwwgzz_6_aj_path_6_dz_222_hlfs_whrlojewac";

CREATE INDEX CONCURRENTLY "__node_ix_package_7_lwwgzz_6_aj_path_6_dz_222_hlfs_whrlojewac" ON "qti"."node" USING btree ("__package_7lwwgzz6aj", "__path_6dz222hlfs", "__start_6khndtm772");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_f_7_hxkhuc_5_j_path_a_4_shhdjef_6_nyt6znckbo";

CREATE INDEX CONCURRENTLY "__node_ix_package_f_7_hxkhuc_5_j_path_a_4_shhdjef_6_nyt6znckbo" ON "qti"."node" USING btree ("__package_f7hxkhuc5j", "__path_a4shhdjef6", "__start_km5zfogkmn", "__string_value_au6fy6olpt");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_ibbpxcarue_path_yv_7754_sdav_start_bzeevqgfvc";

CREATE INDEX CONCURRENTLY "__node_ix_package_ibbpxcarue_path_yv_7754_sdav_start_bzeevqgfvc" ON "qti"."node" USING btree ("__package_ibbpxcarue", "__path_yv7754sdav", "__start_fdd63w6ju2");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_qeeyuvkcon_path_7_mjzclno_6_o_kind_mnd5sfgesm";

CREATE INDEX CONCURRENTLY "__node_ix_package_qeeyuvkcon_path_7_mjzclno_6_o_kind_mnd5sfgesm" ON "qti"."node" USING btree ("__package_qeeyuvkcon", "__path_7mjzclno6o", "__kind_3zonnawsqb");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_vxzxss_64_af_path_43_azipxfum_3odgkngdqm";

CREATE INDEX CONCURRENTLY "__node_ix_package_vxzxss_64_af_path_43_azipxfum_3odgkngdqm" ON "qti"."node" USING btree ("__package_vxzxss64af", "__path_43azipxfum", "__start_ouwvlwy5ch");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_yextvrufxr_path_cmcihiv_7_as_start_yxpx6nry6m";

CREATE INDEX CONCURRENTLY "__node_ix_package_yextvrufxr_path_cmcihiv_7_as_start_yxpx6nry6m" ON "qti"."node" USING btree ("__package_yextvrufxr", "__path_cmcihiv7as", "__start_u5m22c5cjd");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_kind_parent_kind_document_type_pyxvw6rhdf";

CREATE INDEX CONCURRENTLY "__node_ix_package_kind_parent_kind_document_type_pyxvw6rhdf" ON "qti"."node" USING btree ("package", "kind", "parent_kind", "document_type", "path", "parent");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_kind_parent_kind_path_elements_lmhw45mkiz";

CREATE INDEX CONCURRENTLY "__node_ix_package_kind_parent_kind_path_elements_lmhw45mkiz" ON "qti"."node" USING btree ("package", "kind", "parent_kind", "path", "elements");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_kind_path_elements_parent_parent_iizy6sjcxb";

CREATE INDEX CONCURRENTLY "__node_ix_package_kind_path_elements_parent_parent_iizy6sjcxb" ON "qti"."node" USING btree ("package", "kind", "path", "elements", "parent", "parent_kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_nearest_nearest_kind_nearest_path_3kzdphugxg";

CREATE INDEX CONCURRENTLY "__node_ix_package_nearest_nearest_kind_nearest_path_3kzdphugxg" ON "qti"."node" USING btree ("package", "nearest", "nearest_kind", "nearest_path");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_parent_path_at_oqqth6j7fg";

CREATE INDEX CONCURRENTLY "__node_ix_package_parent_path_at_oqqth6j7fg" ON "qti"."node" USING btree ("package", "parent", "path", "at");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_parent_path_elements_parent_kind_za5pvxs5dj";

CREATE INDEX CONCURRENTLY "__node_ix_package_parent_path_elements_parent_kind_za5pvxs5dj" ON "qti"."node" USING btree ("package", "parent", "path", "elements", "parent_kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_parent_path_kind_parent_kind_qjdpdreijy";

CREATE INDEX CONCURRENTLY "__node_ix_package_parent_path_kind_parent_kind_qjdpdreijy" ON "qti"."node" USING btree ("package", "parent", "path", "kind", "parent_kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_parent_path_parent_kind_mi4qx37tbz";

CREATE INDEX CONCURRENTLY "__node_ix_package_parent_path_parent_kind_mi4qx37tbz" ON "qti"."node" USING btree ("package", "parent", "path", "parent_kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_parent_start_ujn5hnltaw";

CREATE INDEX CONCURRENTLY "__node_ix_package_parent_start_ujn5hnltaw" ON "qti"."node" USING btree ("package", "parent", "start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_path_nearest_nearest_path_qrx5tkmkpp";

CREATE INDEX CONCURRENTLY "__node_ix_package_path_nearest_nearest_path_qrx5tkmkpp" ON "qti"."node" USING btree ("package", "path", "nearest", "nearest_path");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__node_ix_package_start_kind_6cqgjghihn";

CREATE INDEX CONCURRENTLY "__node_ix_package_start_kind_6cqgjghihn" ON "qti"."node" USING btree ("package", "start", "kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__object_title_ix_package_start_l7umkaqp3u";

CREATE INDEX CONCURRENTLY "__object_title_ix_package_start_l7umkaqp3u" ON "qti"."object_title" USING btree ("package", "start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__open_attribute_ix_package_qr_6_ir_7_bi_6_e_path_6_gjojof56ot";

CREATE INDEX CONCURRENTLY "__open_attribute_ix_package_qr_6_ir_7_bi_6_e_path_6_gjojof56ot" ON "qti"."open_attribute" USING btree ("__package_qr6ir7bi6e", "__path_6lewewmqrh", "__start_6lthro5vqr", "__element_namespace_a7msmtijer");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_binding_ix_package_path_start_attribute_slwylo7lfc";

CREATE INDEX CONCURRENTLY "__placed_binding_ix_package_path_start_attribute_slwylo7lfc" ON "qti"."placed_binding" USING btree ("package", "path", "start", "attribute", "identifier");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_binding_base_type_ix_package_attribute_etvquvxhfw";

CREATE INDEX CONCURRENTLY "__placed_binding_base_type_ix_package_attribute_etvquvxhfw" ON "qti"."placed_binding_base_type" USING btree ("package", "attribute", "start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_binding_cardinality_ix_package_attribute_gc3lw7lhy7";

CREATE INDEX CONCURRENTLY "__placed_binding_cardinality_ix_package_attribute_gc3lw7lhy7" ON "qti"."placed_binding_cardinality" USING btree ("package", "attribute", "cardinality", "start", "path");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_binding_cardinality_ix_package_attribute_cr5gzjppfr";

CREATE INDEX CONCURRENTLY "__placed_binding_cardinality_ix_package_attribute_cr5gzjppfr" ON "qti"."placed_binding_cardinality" USING btree ("package", "attribute", "path", "start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_choice_ix_package_assembly_identifier_uhvul24o7s";

CREATE INDEX CONCURRENTLY "__placed_choice_ix_package_assembly_identifier_uhvul24o7s" ON "qti"."placed_choice" USING btree ("package", "assembly", "identifier");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_choice_ix_package_path_start_assembly_fkmwss6hli";

CREATE INDEX CONCURRENTLY "__placed_choice_ix_package_path_start_assembly_fkmwss6hli" ON "qti"."placed_choice" USING btree ("package", "path", "start", "assembly", "identifier");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_choice_ix_package_path_start_identifier_jk6vt35bcx";

CREATE INDEX CONCURRENTLY "__placed_choice_ix_package_path_start_identifier_jk6vt35bcx" ON "qti"."placed_choice" USING btree ("package", "path", "start", "identifier");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_id_ix_assembly_package_id_owner_path_rsmnsiephu";

CREATE INDEX CONCURRENTLY "__placed_id_ix_assembly_package_id_owner_path_rsmnsiephu" ON "qti"."placed_id" USING btree ("assembly", "package", "id", "owner", "path", "instance");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_idref_ix_assembly_id_package_zm6k77reuk";

CREATE INDEX CONCURRENTLY "__placed_idref_ix_assembly_id_package_zm6k77reuk" ON "qti"."placed_idref" USING btree ("assembly", "id", "package");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_math_rank_ix_package_start_path_kmbbodef77";

CREATE INDEX CONCURRENTLY "__placed_math_rank_ix_package_start_path_kmbbodef77" ON "qti"."placed_math_rank" USING btree ("package", "start", "path");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_share_target_ix_assembly_package_target_64xcz24di3";

CREATE INDEX CONCURRENTLY "__placed_share_target_ix_assembly_package_target_64xcz24di3" ON "qti"."placed_share_target" USING btree ("assembly", "package", "target_instance", "target_start", "id", "target");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_share_target_ix_package_assembly_target_k66b7bmx5u";

CREATE INDEX CONCURRENTLY "__placed_share_target_ix_package_assembly_target_k66b7bmx5u" ON "qti"."placed_share_target" USING btree ("package", "assembly", "target_instance", "target");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_variable_ref_declaration_ix_package_a6ev3brkvs";

CREATE INDEX CONCURRENTLY "__placed_variable_ref_declaration_ix_package_a6ev3brkvs" ON "qti"."placed_variable_ref_declaration" USING btree ("package", "assembly", "declaration", "attribute", "kind");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_xml_lang_ix_package_scope_assembly_value_yz2bw7cdy5";

CREATE INDEX CONCURRENTLY "__placed_xml_lang_ix_package_scope_assembly_value_yz2bw7cdy5" ON "qti"."placed_xml_lang" USING btree ("package", "scope", "assembly", "value");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_xml_lang_ix_package_scope_path_start_lang_hexmxaqdo6";

CREATE INDEX CONCURRENTLY "__placed_xml_lang_ix_package_scope_path_start_lang_hexmxaqdo6" ON "qti"."placed_xml_lang" USING btree ("package", "scope", "path", "start", "lang");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__placed_xml_lang_ix_package_scope_value_sfqpq4jycj";

CREATE INDEX CONCURRENTLY "__placed_xml_lang_ix_package_scope_value_sfqpq4jycj" ON "qti"."placed_xml_lang" USING btree ("package", "scope", "value");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__processing_ix_package_language_path_nwc7fn5bjn";

CREATE INDEX CONCURRENTLY "__processing_ix_package_language_path_nwc7fn5bjn" ON "qti"."processing" USING btree ("package", "language", "path");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__record_field_ix_package_path_identifier_dshu5ze6f2";

CREATE INDEX CONCURRENTLY "__record_field_ix_package_path_identifier_dshu5ze6f2" ON "qti"."record_field" USING btree ("package", "path", "identifier");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__resource_href_ix_package_target_path_scope_5f6vhm2lwl";

CREATE INDEX CONCURRENTLY "__resource_href_ix_package_target_path_scope_5f6vhm2lwl" ON "qti"."resource_href" USING btree ("package", "target", "path", "scope");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__share_target_ix_package_path_target_start_id_fdo32tapf3";

CREATE INDEX CONCURRENTLY "__share_target_ix_package_path_target_start_id_fdo32tapf3" ON "qti"."share_target" USING btree ("package", "path", "target_start", "id");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__ssml_attribute_ix_package_path_fragment_start_mu356ufw2p";

CREATE INDEX CONCURRENTLY "__ssml_attribute_ix_package_path_fragment_start_mu356ufw2p" ON "qti"."ssml_attribute" USING btree ("package", "path", "fragment", "start");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__ssml_attribute_ix_package_path_fragment_value_kind_3b7qj7l3qd";

CREATE INDEX CONCURRENTLY "__ssml_attribute_ix_package_path_fragment_value_kind_3b7qj7l3qd" ON "qti"."ssml_attribute" USING btree ("package", "path", "fragment", "value", "kind", "refers");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__ssml_attribute_ix_package_path_kind_start_value_nfzpoi6s66";

CREATE INDEX CONCURRENTLY "__ssml_attribute_ix_package_path_kind_start_value_nfzpoi6s66" ON "qti"."ssml_attribute" USING btree ("package", "path", "kind", "start", "value", "refers");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__ssml_scope_ix_package_fragment_path_62pskuikyf";

CREATE INDEX CONCURRENTLY "__ssml_scope_ix_package_fragment_path_62pskuikyf" ON "qti"."ssml_scope" USING btree ("package", "fragment", "path");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__table_header_ix_package_path_id_ppqyxxefkg";

CREATE INDEX CONCURRENTLY "__table_header_ix_package_path_id_ppqyxxefkg" ON "qti"."table_header" USING btree ("package", "path", "id");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__table_scope_ix_package_path_table_p6mmwy6mjs";

CREATE INDEX CONCURRENTLY "__table_scope_ix_package_path_table_p6mmwy6mjs" ON "qti"."table_scope" USING btree ("package", "path", "table");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__variable_ref_ix_package_bfhmg_4_km_4_s_path_4_wa4vxufyhg";

CREATE INDEX CONCURRENTLY "__variable_ref_ix_package_bfhmg_4_km_4_s_path_4_wa4vxufyhg" ON "qti"."variable_ref" USING btree ("__package_bfhmg4km4s", "__path_4yypxbmb7u", "__start_cslexr4nfw", "__language_g4fbnc6kzm", "__element_base_s2ys2dkumh", "__element_cardinality_kv7fsfl2bu");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__variable_ref_ix_package_path_attribute_kind_puul4h7gj2";

CREATE INDEX CONCURRENTLY "__variable_ref_ix_package_path_attribute_kind_puul4h7gj2" ON "qti"."variable_ref" USING btree ("package", "path", "attribute", "kind", "resolution");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__variable_ref_table_ix_package_declaration_path_lvxfhhaue5";

CREATE INDEX CONCURRENTLY "__variable_ref_table_ix_package_declaration_path_lvxfhhaue5" ON "qti"."variable_ref_table" USING btree ("package", "declaration", "path", "table");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__xml_lang_ix_package_scope_path_value_7gaygefozh";

CREATE INDEX CONCURRENTLY "__xml_lang_ix_package_scope_path_value_7gaygefozh" ON "qti"."xml_lang" USING btree ("package", "scope", "path", "value");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__xml_lang_ix_package_scope_value_wxj4gyu5fb";

CREATE INDEX CONCURRENTLY "__xml_lang_ix_package_scope_value_wxj4gyu5fb" ON "qti"."xml_lang" USING btree ("package", "scope", "value");

DROP INDEX CONCURRENTLY IF EXISTS "qti"."__xml_lang_ix_package_start_cpin64cbdd";

CREATE INDEX CONCURRENTLY "__xml_lang_ix_package_start_cpin64cbdd" ON "qti"."xml_lang" USING btree ("package", "start");
