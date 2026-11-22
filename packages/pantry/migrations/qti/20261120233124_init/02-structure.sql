CREATE TABLE "qti"."assembled_catalog" (
  "assembly" "qti"."__text_6zspo66rxv" NOT NULL,
  "id" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "owner" "qti"."__domain_gfw43vigph" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL
);

CREATE TABLE "qti"."assembled_document" (
  "instances" "qti"."__domain_gfw43vigph" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "sites" "qti"."__domain_gfw43vigph" NOT NULL,
  "targets" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__assembled_document_pk_j6e4uusicb" PRIMARY KEY ("package", "path"),
  CONSTRAINT "__assembled_document_check_assembled_document_vj2hynzxez" CHECK (("targets" > 0::bigint OR "sites" = 0::bigint) IS TRUE),
  CONSTRAINT "__assembled_document_key_package_path_instances_4de72j5vky" UNIQUE NULLS DISTINCT ("package", "path", "instances", "sites"),
  CONSTRAINT "__assembled_document_key_package_path_targets_hgo4adwiy5" UNIQUE NULLS DISTINCT ("package", "path", "targets")
);

CREATE TABLE "qti"."attribute" (
  "governor" "qti"."governor" NOT NULL,
  "idref_text" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "idrefs" "qti"."__domain_gfw43vigph" NOT NULL,
  "kind" "qti"."node_kind" NOT NULL,
  "lexical" "qti"."__text_c6iptmtj2x" NOT NULL,
  "name" "qti"."attribute_name" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "prefix" "qti"."__text_wchibbb5qm" NOT NULL,
  "slot" "qti"."__attribute_slot_bits_112_aecznthxg5" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "value" "qti"."__text_c6iptmtj2x" GENERATED ALWAYS AS ("qti"."__row_vsugw3arbl"("governor", "name", "lexical")) STORED NOT NULL,
  CONSTRAINT "__attribute_pk_7dwyp2j4rn" PRIMARY KEY ("package", "path", "start", "name"),
  CONSTRAINT "__attribute_check_attribute_idrefs_concat_fold_cxmpxccwch" CHECK (("idrefs" > 0::bigint OR "idref_text" = ''::"pg_catalog"."text") IS TRUE),
  CONSTRAINT "al_1_admission" CHECK (("qti"."__row_o6s6wr4ho7"("governor", "name")) IS TRUE),
  CONSTRAINT "attribute_prefix" CHECK ((NOT "name" IN (18::smallint, 15::smallint, 20::smallint, 13::smallint, 19::smallint, 14::smallint, 17::smallint, 16::smallint, 21::smallint, 12::smallint, 10::smallint, 11::smallint, 8::smallint, 9::smallint, 6::smallint, 7::smallint, 4::smallint, 5::smallint) AND "prefix" = ''::"pg_catalog"."text" OR NOT "prefix" IN (''::"pg_catalog"."text", 'xml'::"pg_catalog"."text", 'xmlns'::"pg_catalog"."text") AND "name" IN (18::smallint, 15::smallint, 20::smallint, 13::smallint, 19::smallint, 14::smallint, 17::smallint, 16::smallint, 21::smallint, 12::smallint, 6::smallint, 7::smallint, 4::smallint, 5::smallint) OR "name" IN (10::smallint, 11::smallint, 8::smallint, 9::smallint) AND "prefix" = 'xml'::"pg_catalog"."text") IS TRUE),
  CONSTRAINT "double_bound" CHECK (("qti"."__row_44g6vpyjsw"("governor", "name", "lexical")) IS TRUE),
  CONSTRAINT "e_1_derived" CHECK (("qti"."__row_il5jbfjsr7"("governor", "name", "idrefs", "idref_text", "lexical", "slot")) IS TRUE),
  CONSTRAINT "value_domain" CHECK (("qti"."__row_fwroytfsuc"("governor", "name", "lexical")) IS TRUE),
  CONSTRAINT "__attribute_key_package_path_start_name_idrefs_nrfiwbgcvt" UNIQUE NULLS DISTINCT ("package", "path", "start", "name", "idrefs"),
  CONSTRAINT "__attribute_subset_name_fign53y6fa" CHECK (("name" IN (4::smallint, 5::smallint, 6::smallint, 7::smallint, 8::smallint, 9::smallint, 10::smallint, 11::smallint, 12::smallint, 13::smallint, 14::smallint, 15::smallint, 16::smallint, 17::smallint, 18::smallint, 19::smallint, 20::smallint, 21::smallint, 22::smallint, 23::smallint, 24::smallint, 25::smallint, 26::smallint, 27::smallint, 28::smallint, 29::smallint, 30::smallint, 31::smallint, 32::smallint, 33::smallint, 34::smallint, 35::smallint, 36::smallint, 37::smallint, 38::smallint, 39::smallint, 40::smallint, 41::smallint, 42::smallint, 43::smallint, 44::smallint, 45::smallint, 46::smallint, 47::smallint, 48::smallint, 49::smallint, 50::smallint, 51::smallint, 52::smallint, 53::smallint, 54::smallint, 55::smallint, 56::smallint, 57::smallint, 58::smallint, 59::smallint, 60::smallint, 61::smallint, 62::smallint, 63::smallint, 64::smallint, 65::smallint, 66::smallint, 67::smallint, 68::smallint, 69::smallint, 70::smallint, 71::smallint, 72::smallint, 73::smallint, 74::smallint, 75::smallint, 76::smallint, 77::smallint, 78::smallint, 79::smallint, 80::smallint, 81::smallint, 82::smallint, 83::smallint, 84::smallint, 85::smallint, 86::smallint, 87::smallint, 88::smallint, 89::smallint, 90::smallint, 91::smallint, 92::smallint, 93::smallint, 94::smallint, 95::smallint, 96::smallint, 97::smallint, 98::smallint, 99::smallint, 100::smallint, 101::smallint, 102::smallint, 103::smallint, 104::smallint, 105::smallint, 106::smallint, 107::smallint, 108::smallint, 109::smallint, 110::smallint, 111::smallint, 112::smallint, 113::smallint, 114::smallint, 115::smallint, 116::smallint, 117::smallint, 118::smallint, 119::smallint, 120::smallint, 121::smallint, 122::smallint, 123::smallint, 124::smallint, 125::smallint, 126::smallint, 127::smallint, 128::smallint, 129::smallint, 130::smallint, 131::smallint, 132::smallint, 133::smallint, 134::smallint, 135::smallint, 136::smallint, 137::smallint, 138::smallint, 139::smallint, 140::smallint, 141::smallint, 142::smallint, 143::smallint, 144::smallint, 145::smallint, 146::smallint, 147::smallint, 148::smallint, 149::smallint, 150::smallint, 151::smallint, 152::smallint, 153::smallint, 154::smallint, 155::smallint, 156::smallint, 157::smallint, 158::smallint, 159::smallint, 160::smallint, 161::smallint, 162::smallint, 163::smallint, 164::smallint, 165::smallint, 166::smallint, 167::smallint, 168::smallint, 169::smallint, 170::smallint, 171::smallint, 172::smallint, 173::smallint, 174::smallint, 175::smallint, 176::smallint, 177::smallint, 178::smallint, 179::smallint, 180::smallint, 181::smallint, 182::smallint, 183::smallint, 184::smallint, 185::smallint, 186::smallint, 187::smallint, 188::smallint, 189::smallint, 190::smallint, 191::smallint, 192::smallint, 193::smallint, 194::smallint, 195::smallint, 196::smallint, 197::smallint, 198::smallint, 199::smallint, 200::smallint, 201::smallint, 202::smallint, 203::smallint, 204::smallint, 205::smallint, 206::smallint, 207::smallint, 208::smallint, 209::smallint, 210::smallint, 211::smallint, 212::smallint, 213::smallint, 214::smallint, 215::smallint, 216::smallint, 217::smallint, 218::smallint, 219::smallint, 220::smallint, 221::smallint, 222::smallint, 223::smallint, 224::smallint, 225::smallint, 226::smallint, 227::smallint, 228::smallint, 229::smallint, 230::smallint, 231::smallint, 232::smallint, 233::smallint, 234::smallint, 235::smallint, 236::smallint, 237::smallint, 238::smallint, 239::smallint, 240::smallint, 241::smallint, 242::smallint, 243::smallint, 244::smallint, 245::smallint, 246::smallint, 247::smallint, 248::smallint, 249::smallint, 250::smallint, 251::smallint, 252::smallint, 253::smallint, 254::smallint, 255::smallint, 256::smallint, 257::smallint, 258::smallint, 259::smallint, 260::smallint, 261::smallint, 262::smallint, 263::smallint, 264::smallint, 265::smallint, 266::smallint, 267::smallint, 268::smallint, 269::smallint, 270::smallint, 271::smallint, 272::smallint, 273::smallint, 274::smallint, 275::smallint, 276::smallint, 277::smallint, 278::smallint, 279::smallint, 280::smallint, 281::smallint, 282::smallint, 283::smallint, 284::smallint, 285::smallint, 286::smallint, 287::smallint, 288::smallint, 289::smallint, 290::smallint, 291::smallint, 292::smallint, 293::smallint, 294::smallint, 295::smallint, 296::smallint, 297::smallint, 298::smallint, 299::smallint, 300::smallint, 301::smallint, 302::smallint, 303::smallint, 304::smallint, 305::smallint, 306::smallint, 307::smallint, 308::smallint, 309::smallint, 310::smallint, 311::smallint, 312::smallint, 313::smallint, 314::smallint, 315::smallint, 316::smallint, 317::smallint, 318::smallint, 319::smallint, 320::smallint, 321::smallint, 322::smallint, 323::smallint, 324::smallint, 325::smallint, 326::smallint, 327::smallint, 328::smallint, 329::smallint, 330::smallint, 331::smallint, 332::smallint, 333::smallint, 334::smallint, 335::smallint, 336::smallint, 337::smallint, 338::smallint, 339::smallint, 340::smallint, 341::smallint, 342::smallint, 343::smallint, 344::smallint, 345::smallint, 346::smallint, 347::smallint, 348::smallint, 349::smallint, 350::smallint, 351::smallint, 352::smallint, 353::smallint, 354::smallint, 355::smallint, 356::smallint, 357::smallint, 358::smallint, 359::smallint, 360::smallint, 361::smallint, 362::smallint, 363::smallint, 364::smallint, 365::smallint, 366::smallint, 367::smallint, 368::smallint, 369::smallint, 370::smallint, 371::smallint, 372::smallint, 373::smallint, 374::smallint, 375::smallint, 376::smallint, 377::smallint, 378::smallint, 379::smallint, 380::smallint, 381::smallint, 382::smallint, 383::smallint, 384::smallint, 385::smallint, 386::smallint, 387::smallint, 388::smallint, 389::smallint, 390::smallint, 391::smallint, 392::smallint, 393::smallint, 394::smallint, 395::smallint, 396::smallint, 397::smallint, 398::smallint, 399::smallint, 400::smallint, 401::smallint, 402::smallint, 403::smallint, 404::smallint, 405::smallint, 406::smallint, 407::smallint, 408::smallint, 409::smallint, 410::smallint, 411::smallint, 412::smallint)) IS TRUE)
);

CREATE TABLE "qti"."attribute_entity" (
  "entity" "qti"."__text_xj3zno7u3h" NOT NULL,
  "name" "qti"."attribute_name" NOT NULL,
  "offset" "qti"."__domain_gfw43vigph" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__attribute_entity_pk_yb5ruqtiyk" PRIMARY KEY ("package", "path", "start", "name", "offset")
);

CREATE TABLE "qti"."binding_name" (
  "attribute" "qti"."attribute_name" NOT NULL,
  "identifier" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__binding_name_pk_k6l2t2abun" PRIMARY KEY ("package", "path", "start", "attribute")
);

CREATE TABLE "qti"."bound_variable" (
  "adaptive" boolean NOT NULL,
  "attribute" "qti"."attribute_name" NOT NULL,
  "identifier" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__bound_variable_pk_iz45qegzkf" PRIMARY KEY ("package", "path", "start", "attribute")
);

CREATE TABLE "qti"."candidate_path" (
  "at" "qti"."__domain_gfw43vigph" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "target" "qti"."__text_6zspo66rxv" NOT NULL,
  CONSTRAINT "__candidate_path_pk_2oe4ezpmrf" PRIMARY KEY ("package", "path", "start", "at"),
  CONSTRAINT "e_1_derived" CHECK (("qti"."__row_i4fvlc2bb6"("target")) IS TRUE)
);

CREATE TABLE "qti"."catalog_id" (
  "id" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "owner" "qti"."__domain_gfw43vigph" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__catalog_id_pk_6linalpnqr" PRIMARY KEY ("package", "path", "start"),
  CONSTRAINT "e_1_derived" CHECK (("owner" = "start") IS TRUE)
);

CREATE TABLE "qti"."catalog_scope" (
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "scope" "qti"."__domain_gfw43vigph" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__catalog_scope_pk_kb6w3u5zbp" PRIMARY KEY ("package", "path", "start")
);

CREATE TABLE "qti"."cell_headers" (
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "token_text" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "tokens" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__cell_headers_pk_kjevq3pul6" PRIMARY KEY ("package", "path", "start"),
  CONSTRAINT "__cell_headers_check_cell_headers_tokens_concat_fold_rt7moipp6s" CHECK (("tokens" > 0::bigint OR "token_text" = ''::"pg_catalog"."text") IS TRUE),
  CONSTRAINT "__cell_headers_key_package_path_start_tokens_mdrwqv4pvh" UNIQUE NULLS DISTINCT ("package", "path", "start", "tokens")
);

CREATE TABLE "qti"."cell_leaf" (
  "at" "qti"."__domain_gfw43vigph" NOT NULL,
  "cell" "qti"."__domain_gfw43vigph" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "start_after" "qti"."__domain_gfw43vigph" NOT NULL,
  "start_was" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__cell_leaf_pk_kwsf55gwhy" PRIMARY KEY ("package", "path", "cell", "at"),
  CONSTRAINT "__cell_leaf_key_package_path_start_36lwd4ckkb" UNIQUE NULLS DISTINCT ("package", "path", "start"),
  CONSTRAINT "__cell_leaf_key_package_path_cell_at_start_after_6spurwpz6m" UNIQUE NULLS DISTINCT ("package", "path", "cell", "at", "start_after"),
  CONSTRAINT "__cell_leaf_check_math_cell_leaves_max_fold_luu2g66k3z" CHECK ((("at" > 0::bigint OR "start_was" = 0::bigint) AND "start_after" = GREATEST("start_was", "start")) IS TRUE),
  CONSTRAINT "e_1_derived" CHECK (("start_was" < "start") IS TRUE)
);

CREATE TABLE "qti"."choice" (
  "identifier" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__choice_pk_lpz37hc34u" PRIMARY KEY ("package", "path", "start")
);

CREATE TABLE "qti"."choice_interaction" (
  "interaction" "qti"."__domain_gfw43vigph" NOT NULL,
  "interaction_path" "qti"."__text_6zspo66rxv" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__choice_interaction_pk_dxmiqmyvgh" PRIMARY KEY ("package", "path", "start")
);

CREATE TABLE "qti"."cn_attribute" (
  "lexical" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "name" "qti"."attribute_name" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__cn_attribute_pk_uahvc6us4g" PRIMARY KEY ("package", "path", "start", "name")
);

CREATE TABLE "qti"."cn_count" (
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "parts" "qti"."__domain_gfw43vigph" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "type" "qti"."cn_type" NOT NULL,
  "type_lexical" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  CONSTRAINT "__cn_count_pk_5n2ubteh2s" PRIMARY KEY ("package", "path", "start"),
  CONSTRAINT "e_1_derived" CHECK (("type" = 7::smallint AND "type_lexical" = ''::"pg_catalog"."text" OR "qti"."__row_fieb2dvdh7"("type_lexical", "type")) IS TRUE),
  CONSTRAINT "__cn_count_check_cn_count_in_cn_parts_cwyirxrado" CHECK (("qti"."__row_xpekqjl2mx"("type", "parts")) IS TRUE),
  CONSTRAINT "__cn_count_key_package_path_start_parts_type_7wasizqrkb" UNIQUE NULLS DISTINCT ("package", "path", "start", "parts", "type"),
  CONSTRAINT "__cn_count_key_package_path_start_type_gfzp5vminc" UNIQUE NULLS DISTINCT ("package", "path", "start", "type")
);

CREATE TABLE "qti"."cn_part_text" (
  "base" "qti"."cn_base" NOT NULL,
  "form" "qti"."cn_part_form" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "part" "qti"."cn_part" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "text" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "type" "qti"."cn_type" NOT NULL,
  CONSTRAINT "__cn_part_text_pk_2mlmvkaywv" PRIMARY KEY ("package", "path", "start", "part"),
  CONSTRAINT "math_ml_cn_form" CHECK (("qti"."__row_et5rveakei"("text", "form", "base")) IS TRUE),
  CONSTRAINT "__cn_part_text_check_cn_part_text_in_cn_form_skp5v7ovmz" CHECK (("qti"."__row_6j7cairl4a"("part", "type", "form")) IS TRUE)
);

CREATE TABLE "qti"."cn_slot" (
  "form" "qti"."cn_part_form" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "part" "qti"."cn_part" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "type" "qti"."cn_type" NOT NULL,
  CONSTRAINT "__cn_slot_pk_tkl6mzsgtu" PRIMARY KEY ("package", "path", "start", "part"),
  CONSTRAINT "__cn_slot_check_cn_slot_in_cn_form_sx4ohhn6rj" CHECK (("qti"."__row_6j7cairl4a"("part", "type", "form")) IS TRUE)
);

CREATE TABLE "qti"."comment" (
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "value" "qti"."__text_7j6kgluyjp" NOT NULL,
  CONSTRAINT "__comment_pk_zalmloung6" PRIMARY KEY ("package", "path", "start")
);

CREATE TABLE "qti"."context_ref" (
  "assembly_kind" "qti"."node_kind" NOT NULL,
  "attribute" "qti"."attribute_name" NOT NULL,
  "identifier" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "kind" "qti"."node_kind" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__context_ref_pk_wtoqozrkb7" PRIMARY KEY ("package", "path", "start", "attribute"),
  CONSTRAINT "context_variable_reference" CHECK (("kind" IN (115::smallint, 209::smallint, 14::smallint, 97::smallint, 113::smallint) AND "assembly_kind" = 299::smallint AND "attribute" = 96::smallint AND "identifier" = 'completionStatus'::"pg_catalog"."text" OR "qti"."__row_zzy4tf2m2u"("kind", "assembly_kind", "attribute", "identifier")) IS TRUE)
);

CREATE TABLE "qti"."count_bound" (
  "max_name" "qti"."attribute_name" NOT NULL,
  "max_written" boolean NOT NULL,
  "min_name" "qti"."attribute_name" NOT NULL,
  "min_written" boolean NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__count_bound_pk_uzay2pj3by" PRIMARY KEY ("package", "path", "start")
);

CREATE TABLE "qti"."data_ssml" (
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__data_ssml_pk_gzjsvobgct" PRIMARY KEY ("package", "path", "start")
);

CREATE TABLE "qti"."data_ssml_member" (
  "at" "qti"."__domain_gfw43vigph" NOT NULL,
  "member" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__data_ssml_member_pk_u4vziygyer" PRIMARY KEY ("package", "path", "start", "at"),
  CONSTRAINT "data_ssml" CHECK (("qti"."__row_kbbc56kuh5"("member")) IS TRUE)
);

CREATE TABLE "qti"."data_ssml_property" (
  "at" "qti"."__domain_gfw43vigph" NOT NULL,
  "member" "qti"."__domain_gfw43vigph" NOT NULL,
  "member_name" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "name" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "value" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  CONSTRAINT "__data_ssml_property_pk_4jbru3xmzc" PRIMARY KEY ("package", "path", "start", "member", "at"),
  CONSTRAINT "data_ssml" CHECK (("qti"."__row_unvebr7ujb"("value", "member_name", "name")) IS TRUE)
);

CREATE TABLE "qti"."doctype" (
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "value" "qti"."__text_l7nqeazg5h" NOT NULL,
  CONSTRAINT "__doctype_pk_5h245mv7ym" PRIMARY KEY ("package", "path", "start")
);

CREATE TABLE "qti"."document" (
  "assembled" boolean NOT NULL,
  "bindings" "qti"."__domain_gfw43vigph" NOT NULL,
  "charset" "qti"."__text_xey6ryorh5" NOT NULL,
  "choices" "qti"."__domain_gfw43vigph" NOT NULL,
  "context" "qti"."__flag_bits_16_llpdtzgaon" NOT NULL,
  "context_nearest" "qti"."__domain_gfw43vigph" NOT NULL,
  "context_nearest_kind" "qti"."node_kind" NOT NULL,
  "context_path" "qti"."__text_6zspo66rxv" NOT NULL,
  "document_type" "qti"."document_type" NOT NULL,
  "export_charset" "qti"."__text_xey6ryorh5" NOT NULL,
  "hottexts" "qti"."__domain_gfw43vigph" NOT NULL,
  "idref_targets" "qti"."__domain_gfw43vigph" NOT NULL,
  "ids" "qti"."__domain_gfw43vigph" NOT NULL,
  "node_children" "qti"."__domain_gfw43vigph" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "root_kind" "qti"."node_kind" NOT NULL,
  "targeted_by" "qti"."__domain_gfw43vigph" NOT NULL,
  "variables" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__document_pk_4kx3ps5ktb" PRIMARY KEY ("package", "path"),
  CONSTRAINT "__document_check_document_targeted_by_or_fold_dpxrkvcaqz" CHECK (("targeted_by" > 0::bigint OR "context" = X'0000'::"qti"."__flag_bits_16_llpdtzgaon") IS TRUE),
  CONSTRAINT "e_1_derived" CHECK (("context_nearest_kind" IN (133::smallint, 127::smallint, 18::smallint, 118::smallint, 17::smallint, 131::smallint, 119::smallint, 125::smallint, 121::smallint, 123::smallint, 122::smallint, 129::smallint, 16::smallint, 120::smallint, 128::smallint, 130::smallint, 117::smallint, 187::smallint, 124::smallint, 126::smallint, 10::smallint, 132::smallint) AND "targeted_by" > 0::bigint OR "context_nearest" = 0::bigint AND "context_nearest_kind" = 0::smallint AND "context_path" = "path") IS TRUE),
  CONSTRAINT "root_of_type" CHECK (("document_type" = 15::smallint AND "path" = 'imsmanifest.xml'::"pg_catalog"."text" OR "qti"."__row_cqo2oblkvo"("document_type", "path")) IS TRUE),
  CONSTRAINT "__document_key_package_path_idref_targets_assembled_pqtexnr4ef" UNIQUE NULLS DISTINCT ("package", "path", "idref_targets", "assembled"),
  CONSTRAINT "__document_key_package_path_ids_idref_targets_uarcdaz2q7" UNIQUE NULLS DISTINCT ("package", "path", "ids", "idref_targets", "choices", "hottexts"),
  CONSTRAINT "__document_key_package_path_root_kind_nlu75ekokq" UNIQUE NULLS DISTINCT ("package", "path", "root_kind"),
  CONSTRAINT "__document_key_package_path_root_kind_document_type_fbvnlbnzgb" UNIQUE NULLS DISTINCT ("package", "path", "root_kind", "document_type"),
  CONSTRAINT "__document_key_package_path_assembled_rgcicnbedu" UNIQUE NULLS DISTINCT ("package", "path", "assembled"),
  CONSTRAINT "__document_key_package_path_targeted_by_context_ecojuiifmt" UNIQUE NULLS DISTINCT ("package", "path", "targeted_by", "context_nearest", "context_nearest_kind", "context_path", "root_kind"),
  CONSTRAINT "__document_key_package_path_variables_root_kind_xlc74hwvik" UNIQUE NULLS DISTINCT ("package", "path", "variables", "root_kind"),
  CONSTRAINT "__document_key_package_path_bindings_i4mvwqzwgt" UNIQUE NULLS DISTINCT ("package", "path", "bindings"),
  CONSTRAINT "__document_key_package_path_choices_4giytroxnf" UNIQUE NULLS DISTINCT ("package", "path", "choices"),
  CONSTRAINT "__document_key_package_path_ids_mtswnxnvwc" UNIQUE NULLS DISTINCT ("package", "path", "ids"),
  CONSTRAINT "__document_key_package_path_hottexts_64ahki5hq2" UNIQUE NULLS DISTINCT ("package", "path", "hottexts")
);

CREATE TABLE "qti"."document_id" (
  "admitted" boolean NOT NULL,
  "owner" "qti"."__domain_gfw43vigph" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__document_id_pk_x7sxopulh7" PRIMARY KEY ("package", "path", "start")
);

CREATE TABLE "qti"."element_type" (
  "governor" "qti"."governor" NOT NULL,
  "kind" "qti"."node_kind" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "type" "qti"."type_name" NOT NULL,
  CONSTRAINT "__element_type_pk_eut565g4zr" PRIMARY KEY ("package", "path", "start"),
  CONSTRAINT "e_1_derived" CHECK (("qti"."__row_vua74sfnuq"("governor", "kind", "type")) IS TRUE),
  CONSTRAINT "__element_type_check_element_type_in_xsi_type_7rogblrpa2" CHECK (("qti"."__row_rqvhy674p4"("kind", "type")) IS TRUE)
);

CREATE TABLE "qti"."encoding_decl" (
  "encoding" "qti"."__text_xey6ryorh5" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  CONSTRAINT "__encoding_decl_pk_7o6qyrzn2p" PRIMARY KEY ("package", "path")
);

CREATE TABLE "qti"."entry" (
  "kind" "qti"."entry_kind" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  CONSTRAINT "__entry_pk_pft7stbhq7" PRIMARY KEY ("package", "path")
);

CREATE TABLE "qti"."expression" (
  "base_type" "qti"."value_base" NOT NULL,
  "cardinality" "qti"."value_cardinality" NOT NULL,
  "language" "qti"."language" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "base_type_bit" "qti"."__value_base_bits_16_7t6pwwxbsh" GENERATED ALWAYS AS ("qti"."__row_vv7aysnmh3"("base_type")) STORED NOT NULL,
  "cardinality_bit" "qti"."__value_cardinality_bits_8_mma4mwhphy" GENERATED ALWAYS AS ("qti"."__row_dai7p7nf6j"("cardinality")) STORED NOT NULL,
  CONSTRAINT "__expression_pk_djkytcc7ot" PRIMARY KEY ("package", "path", "start"),
  CONSTRAINT "__expression_key_package_path_start_base_type_z3zrneogcu" UNIQUE NULLS DISTINCT ("package", "path", "start", "base_type")
);

CREATE TABLE "qti"."feedback_ref" (
  "assembly_kind" "qti"."node_kind" NOT NULL,
  "attribute" "qti"."attribute_name" NOT NULL,
  "identifier" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "kind" "qti"."node_kind" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__feedback_ref_pk_h56q5t5kv4" PRIMARY KEY ("package", "path", "start", "attribute"),
  CONSTRAINT "feedback_reference" CHECK (("kind" IN (115::smallint, 209::smallint, 14::smallint, 97::smallint, 113::smallint) AND "assembly_kind" = 299::smallint AND "attribute" = 96::smallint AND "identifier" = 'completionStatus'::"pg_catalog"."text" OR "qti"."__row_zzy4tf2m2u"("kind", "assembly_kind", "attribute", "identifier")) IS TRUE)
);

CREATE TABLE "qti"."file" (
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "scope" "qti"."href_scope" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "target" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  CONSTRAINT "__file_pk_i2bjocdyi2" PRIMARY KEY ("package", "path", "start"),
  CONSTRAINT "e_1_derived" CHECK (("scope" <> 0::smallint OR "qti"."__row_to7qnnmz2p"("target")) IS TRUE),
  CONSTRAINT "href_form" CHECK (("scope" <> 3::smallint) IS TRUE)
);

CREATE TABLE "qti"."fragment_context_name" (
  "attribute" "qti"."attribute_name" NOT NULL,
  "identifier" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "kind" "qti"."node_kind" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__fragment_context_name_pk_267rnimwff" PRIMARY KEY ("package", "path", "start", "attribute")
);

CREATE TABLE "qti"."fragment_context_ref" (
  "assembly" "qti"."__text_6zspo66rxv" NOT NULL,
  "assembly_kind" "qti"."node_kind" NOT NULL,
  "attribute" "qti"."attribute_name" NOT NULL,
  "identifier" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "instance" "qti"."__domain_gfw43vigph" NOT NULL,
  "kind" "qti"."node_kind" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__fragment_context_ref_pk_2f7bkzpv3i" PRIMARY KEY ("package", "assembly", "instance", "start", "attribute"),
  CONSTRAINT "context_variable_reference" CHECK (("kind" IN (115::smallint, 209::smallint, 14::smallint, 97::smallint, 113::smallint) AND "assembly_kind" = 299::smallint AND "attribute" = 96::smallint AND "identifier" = 'completionStatus'::"pg_catalog"."text" OR "qti"."__row_zzy4tf2m2u"("kind", "assembly_kind", "attribute", "identifier")) IS TRUE)
);

CREATE TABLE "qti"."fragment_feedback_name" (
  "attribute" "qti"."attribute_name" NOT NULL,
  "identifier" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "kind" "qti"."node_kind" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__fragment_feedback_name_pk_ejmdti7lg3" PRIMARY KEY ("package", "path", "start", "attribute")
);

CREATE TABLE "qti"."fragment_feedback_ref" (
  "assembly" "qti"."__text_6zspo66rxv" NOT NULL,
  "assembly_kind" "qti"."node_kind" NOT NULL,
  "attribute" "qti"."attribute_name" NOT NULL,
  "identifier" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "instance" "qti"."__domain_gfw43vigph" NOT NULL,
  "kind" "qti"."node_kind" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__fragment_feedback_ref_pk_ynbqfxu6rf" PRIMARY KEY ("package", "assembly", "instance", "start", "attribute"),
  CONSTRAINT "feedback_reference" CHECK (("kind" IN (115::smallint, 209::smallint, 14::smallint, 97::smallint, 113::smallint) AND "assembly_kind" = 299::smallint AND "attribute" = 96::smallint AND "identifier" = 'completionStatus'::"pg_catalog"."text" OR "qti"."__row_zzy4tf2m2u"("kind", "assembly_kind", "attribute", "identifier")) IS TRUE)
);

CREATE TABLE "qti"."fragment_printed_name" (
  "attribute" "qti"."attribute_name" NOT NULL,
  "identifier" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "kind" "qti"."node_kind" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__fragment_printed_name_pk_5zdeta42lu" PRIMARY KEY ("package", "path", "start", "attribute")
);

CREATE TABLE "qti"."fragment_printed_ref" (
  "assembly" "qti"."__text_6zspo66rxv" NOT NULL,
  "assembly_kind" "qti"."node_kind" NOT NULL,
  "attribute" "qti"."attribute_name" NOT NULL,
  "identifier" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "instance" "qti"."__domain_gfw43vigph" NOT NULL,
  "kind" "qti"."node_kind" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__fragment_printed_ref_pk_hxbuzmlrz2" PRIMARY KEY ("package", "assembly", "instance", "start", "attribute"),
  CONSTRAINT "printed_variable_reference" CHECK (("kind" IN (115::smallint, 209::smallint, 14::smallint, 97::smallint, 113::smallint) AND "assembly_kind" = 299::smallint AND "attribute" = 96::smallint AND "identifier" = 'completionStatus'::"pg_catalog"."text" OR "qti"."__row_zzy4tf2m2u"("kind", "assembly_kind", "attribute", "identifier")) IS TRUE)
);

CREATE TABLE "qti"."fragment_scope" (
  "assembly" "qti"."__text_6zspo66rxv" NOT NULL,
  "assembly_kind" "qti"."node_kind" NOT NULL,
  "contexts" "qti"."__domain_gfw43vigph" NOT NULL,
  "document" "qti"."__text_6zspo66rxv" NOT NULL,
  "feedbacks" "qti"."__domain_gfw43vigph" NOT NULL,
  "instance" "qti"."__domain_gfw43vigph" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "prints" "qti"."__domain_gfw43vigph" NOT NULL,
  "templates" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__fragment_scope_pk_sgzw7myypj" PRIMARY KEY ("package", "assembly", "instance"),
  CONSTRAINT "__fragment_scope_key_package_assembly_instance_byyh3dpbgf" UNIQUE NULLS DISTINCT ("package", "assembly", "instance", "contexts", "assembly_kind", "document"),
  CONSTRAINT "__fragment_scope_key_package_assembly_instance_jcirqd44oa" UNIQUE NULLS DISTINCT ("package", "assembly", "instance", "feedbacks", "assembly_kind", "document"),
  CONSTRAINT "__fragment_scope_key_package_assembly_instance_agjvofijij" UNIQUE NULLS DISTINCT ("package", "assembly", "instance", "prints", "assembly_kind", "document"),
  CONSTRAINT "__fragment_scope_key_package_assembly_instance_ixkimyvxqa" UNIQUE NULLS DISTINCT ("package", "assembly", "instance", "templates", "assembly_kind", "document")
);

CREATE TABLE "qti"."fragment_template_name" (
  "attribute" "qti"."attribute_name" NOT NULL,
  "identifier" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "kind" "qti"."node_kind" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__fragment_template_name_pk_jq3jwmzjws" PRIMARY KEY ("package", "path", "start", "attribute")
);

CREATE TABLE "qti"."fragment_template_ref" (
  "assembly" "qti"."__text_6zspo66rxv" NOT NULL,
  "assembly_kind" "qti"."node_kind" NOT NULL,
  "attribute" "qti"."attribute_name" NOT NULL,
  "identifier" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "instance" "qti"."__domain_gfw43vigph" NOT NULL,
  "kind" "qti"."node_kind" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__fragment_template_ref_pk_fozvbajq3p" PRIMARY KEY ("package", "assembly", "instance", "start", "attribute"),
  CONSTRAINT "template_reference" CHECK (("kind" IN (115::smallint, 209::smallint, 14::smallint, 97::smallint, 113::smallint) AND "assembly_kind" = 299::smallint AND "attribute" = 96::smallint AND "identifier" = 'completionStatus'::"pg_catalog"."text" OR "qti"."__row_zzy4tf2m2u"("kind", "assembly_kind", "attribute", "identifier")) IS TRUE)
);

CREATE TABLE "qti"."header_token" (
  "after" "qti"."__text_7dfilirtp3" NOT NULL,
  "at" "qti"."__domain_gfw43vigph" NOT NULL,
  "before" "qti"."__text_7dfilirtp3" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "pieces_after" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "pieces_was" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "token" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "piece" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" GENERATED ALWAYS AS ("before" || "token" || "after") STORED NOT NULL,
  CONSTRAINT "__header_token_pk_ybyt5ap6zk" PRIMARY KEY ("package", "path", "start", "at"),
  CONSTRAINT "__header_token_check_cell_headers_tokens_concat_fold_z5p7yt7ha7" CHECK ((("at" > 0::bigint OR "pieces_was" = ''::"pg_catalog"."text") AND ("pg_catalog"."char_length"("pieces_after") = "pg_catalog"."char_length"("pieces_was")::bigint + "pg_catalog"."char_length"("piece")::bigint AND ("pg_catalog"."starts_with"("pieces_after", "pieces_was") AND "pg_catalog"."right"("pieces_after", "pg_catalog"."char_length"("piece")) = "piece"))) IS TRUE),
  CONSTRAINT "e_1_derived" CHECK ((("at" = 0::bigint OR "before" <> ''::"pg_catalog"."text") AND "qti"."__row_fqcrog6dfl"("token")) IS TRUE)
);

CREATE TABLE "qti"."hottext" (
  "identifier" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__hottext_pk_g57caygl5o" PRIMARY KEY ("package", "path", "start")
);

CREATE TABLE "qti"."identity_text" (
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "token_text" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "tokens" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__identity_text_pk_aaeve62thy" PRIMARY KEY ("package", "path", "start"),
  CONSTRAINT "__identity_text_check_identity_text_tokens_concat_qc2rvb6wft" CHECK (("tokens" > 0::bigint OR "token_text" = ''::"pg_catalog"."text") IS TRUE),
  CONSTRAINT "__identity_text_key_package_path_start_tokens_5pavpyeu7f" UNIQUE NULLS DISTINCT ("package", "path", "start", "tokens")
);

CREATE TABLE "qti"."idref" (
  "after" "qti"."__text_7dfilirtp3" NOT NULL,
  "at" "qti"."__domain_gfw43vigph" NOT NULL,
  "before" "qti"."__text_7dfilirtp3" NOT NULL,
  "name" "qti"."attribute_name" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "pieces_after" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "pieces_was" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "token" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "piece" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" GENERATED ALWAYS AS ("before" || "token" || "after") STORED NOT NULL,
  CONSTRAINT "__idref_pk_xqrlmnw437" PRIMARY KEY ("package", "path", "start", "name", "at"),
  CONSTRAINT "__idref_check_attribute_idrefs_concat_fold_n6pe7kedc5" CHECK ((("at" > 0::bigint OR "pieces_was" = ''::"pg_catalog"."text") AND ("pg_catalog"."char_length"("pieces_after") = "pg_catalog"."char_length"("pieces_was")::bigint + "pg_catalog"."char_length"("piece")::bigint AND ("pg_catalog"."starts_with"("pieces_after", "pieces_was") AND "pg_catalog"."right"("pieces_after", "pg_catalog"."char_length"("piece")) = "piece"))) IS TRUE),
  CONSTRAINT "e_1_derived" CHECK ((("at" = 0::bigint OR "before" <> ''::"pg_catalog"."text") AND "qti"."__row_fqcrog6dfl"("token")) IS TRUE)
);

CREATE TABLE "qti"."idref_target" (
  "assembled" boolean NOT NULL,
  "id" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL
);

CREATE TABLE "qti"."inclusion" (
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "parent_kind" "qti"."node_kind" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "places" boolean NOT NULL,
  "root" "qti"."node_kind" NOT NULL,
  "splices" boolean NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__inclusion_pk_niaddoqk3f" PRIMARY KEY ("package", "path", "start"),
  CONSTRAINT "e_1_derived" CHECK (("qti"."__row_56t7mprg5a"("parent_kind", "root", "places", "splices")) IS TRUE),
  CONSTRAINT "include_root" CHECK (("qti"."__row_4lefqkcprs"("parent_kind", "root")) IS TRUE)
);

CREATE TABLE "qti"."instance" (
  "assembly" "qti"."__text_6zspo66rxv" NOT NULL,
  "assembly_kind" "qti"."node_kind" NOT NULL,
  "at" "qti"."__domain_gfw43vigph" NOT NULL,
  "bindings" "qti"."__domain_gfw43vigph" NOT NULL,
  "children" "qti"."__domain_gfw43vigph" NOT NULL,
  "choices" "qti"."__domain_gfw43vigph" NOT NULL,
  "document" "qti"."__text_6zspo66rxv" NOT NULL,
  "end" "qti"."__domain_gfw43vigph" NOT NULL,
  "hottexts" "qti"."__domain_gfw43vigph" NOT NULL,
  "idref_targets" "qti"."__domain_gfw43vigph" NOT NULL,
  "ids" "qti"."__domain_gfw43vigph" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "parent" "qti"."__domain_gfw43vigph" NOT NULL,
  "root_kind" "qti"."node_kind" NOT NULL,
  "site" "qti"."__domain_gfw43vigph" NOT NULL,
  "site_document" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "variables" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__instance_pk_prybopoegp" PRIMARY KEY ("package", "assembly", "start"),
  CONSTRAINT "e_1_derived" CHECK ((("assembly" = "document" AND "assembly_kind" = "root_kind" AND "document" = "site_document" AND "site" = 0::bigint AND "start" = 0::bigint OR "start" > 0::bigint) AND ("bindings" = 0::bigint AND "variables" = 0::bigint OR "assembly_kind" = 299::smallint)) IS TRUE),
  CONSTRAINT "__instance_key_package_assembly_start_document_vigbcn7gg7" UNIQUE NULLS DISTINCT ("package", "assembly", "start", "document", "assembly_kind"),
  CONSTRAINT "__instance_key_package_assembly_start_children_ce6pyigrjj" UNIQUE NULLS DISTINCT ("package", "assembly", "start", "children", "assembly_kind", "document"),
  CONSTRAINT "__instance_key_package_assembly_start_choices_3brw3vjmom" UNIQUE NULLS DISTINCT ("package", "assembly", "start", "choices", "document"),
  CONSTRAINT "__instance_key_package_assembly_start_hottexts_dlfe4bt7mk" UNIQUE NULLS DISTINCT ("package", "assembly", "start", "hottexts", "document"),
  CONSTRAINT "__instance_key_package_assembly_start_ids_assembly_5cetgpnmjn" UNIQUE NULLS DISTINCT ("package", "assembly", "start", "ids", "assembly_kind", "document"),
  CONSTRAINT "__instance_key_package_assembly_start_idref_targets_4b3dwuaxhp" UNIQUE NULLS DISTINCT ("package", "assembly", "start", "idref_targets", "document"),
  CONSTRAINT "__instance_key_package_assembly_start_document_go7qfh4bdy" UNIQUE NULLS DISTINCT ("package", "assembly", "start", "document"),
  CONSTRAINT "__instance_key_package_assembly_start_variables_zh4krblqmh" UNIQUE NULLS DISTINCT ("package", "assembly", "start", "variables", "document"),
  CONSTRAINT "__instance_key_package_assembly_start_bindings_xhnecgjaqk" UNIQUE NULLS DISTINCT ("package", "assembly", "start", "bindings")
);

CREATE TABLE "qti"."interaction" (
  "choices" "qti"."__domain_gfw43vigph" NOT NULL,
  "module_forms" "qti"."__domain_gfw43vigph" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__interaction_pk_6gsxu3brgo" PRIMARY KEY ("package", "path", "start"),
  CONSTRAINT "__interaction_key_package_path_start_choices_qc5tgh5tjv" UNIQUE NULLS DISTINCT ("package", "path", "start", "choices"),
  CONSTRAINT "__interaction_key_package_path_start_module_forms_hc7hrrv7q3" UNIQUE NULLS DISTINCT ("package", "path", "start", "module_forms")
);

CREATE TABLE "qti"."interaction_attribute" (
  "kind" "qti"."node_kind" NOT NULL,
  "lexical" "qti"."__text_4snhn63tn4" NOT NULL,
  "name" "qti"."attribute_name" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "root_kind" "qti"."node_kind" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "value" "qti"."__text_4snhn63tn4" GENERATED ALWAYS AS ("pg_catalog"."btrim"("pg_catalog"."replace"("pg_catalog"."replace"("pg_catalog"."replace"("pg_catalog"."replace"("pg_catalog"."replace"("pg_catalog"."replace"("lexical", E'\t'::"pg_catalog"."text", ' '::"pg_catalog"."text"), E'\n'::"pg_catalog"."text", ' '::"pg_catalog"."text"), E'\r'::"pg_catalog"."text", ' '::"pg_catalog"."text"), '  '::"pg_catalog"."text", E' \t'::"pg_catalog"."text"), E'\t '::"pg_catalog"."text", E'\t\t'::"pg_catalog"."text"), E'\t'::"pg_catalog"."text", ''::"pg_catalog"."text"))) STORED NOT NULL,
  CONSTRAINT "__interaction_attribute_pk_sbz3kmx43v" PRIMARY KEY ("package", "path", "start", "name")
);

CREATE TABLE "qti"."item_mode" (
  "adaptive" boolean NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  CONSTRAINT "__item_mode_pk_rmbrjefggb" PRIMARY KEY ("package", "path"),
  CONSTRAINT "__item_mode_key_package_path_adaptive_jyslhwwydx" UNIQUE NULLS DISTINCT ("package", "path", "adaptive")
);

CREATE TABLE "qti"."item_ref_document" (
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "target" "qti"."__text_6zspo66rxv" NOT NULL,
  CONSTRAINT "__item_ref_document_pk_ylsc7bhhax" PRIMARY KEY ("package", "path", "start")
);

CREATE TABLE "qti"."item_ref_href" (
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "target" "qti"."__text_6zspo66rxv" NOT NULL,
  CONSTRAINT "__item_ref_href_pk_gic6tz4yai" PRIMARY KEY ("package", "path", "start")
);

CREATE TABLE "qti"."label_use" (
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "root_kind" "qti"."node_kind" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__label_use_pk_mebvop4w36" PRIMARY KEY ("package", "path", "start")
);

CREATE TABLE "qti"."least_count" (
  "least" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "least_value" bigint NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__least_count_pk_gmz3yk64c7" PRIMARY KEY ("package", "path", "start"),
  CONSTRAINT "e_1_derived" CHECK (("qti"."__row_fdmkwfomtb"("least", "least_value")) IS TRUE)
);

CREATE TABLE "qti"."link_reading" (
  "assembly" "qti"."__text_6zspo66rxv" NOT NULL,
  "attribute" "qti"."attribute_name" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "scope" "qti"."__domain_gfw43vigph" NOT NULL,
  "scope_instance" "qti"."__domain_gfw43vigph" NOT NULL,
  "scope_path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "variable" "qti"."__text_oq3spimary" NOT NULL,
  CONSTRAINT "__link_reading_pk_2khphl5lxa" PRIMARY KEY ("package", "assembly", "path", "start", "attribute", "scope_instance", "scope"),
  CONSTRAINT "e_1_derived" CHECK (("qti"."__row_bdiry5fm57"("variable")) IS TRUE)
);

CREATE TABLE "qti"."literal" (
  "base_type" "qti"."value_base" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "text" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  CONSTRAINT "__literal_pk_aelubxdbzj" PRIMARY KEY ("package", "path", "start")
);

CREATE TABLE "qti"."literal_typed" (
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "text" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "type_code" "qti"."base_type" NOT NULL,
  "base_type" "qti"."value_base" GENERATED ALWAYS AS ("qti"."__row_sjn7ztb5fk"("type_code")) STORED NOT NULL,
  CONSTRAINT "__literal_typed_pk_uqez5pzkc2" PRIMARY KEY ("package", "path", "start"),
  CONSTRAINT "literal_lexical" CHECK (("qti"."__row_47rwmcck7h"("text", "type_code")) IS TRUE)
);

CREATE TABLE "qti"."lookup_value" (
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "value" "qti"."__text_oq3spimary" NOT NULL,
  CONSTRAINT "__lookup_value_pk_dtzddogytm" PRIMARY KEY ("package", "path", "start")
);

CREATE TABLE "qti"."map_key" (
  "key" "qti"."__text_oq3spimary" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__map_key_pk_vv52s26trb" PRIMARY KEY ("package", "path", "start")
);

CREATE TABLE "qti"."mastery_value" (
  "lexical" "qti"."__text_oq3spimary" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__mastery_value_pk_io4smtjq6v" PRIMARY KEY ("package", "path", "start")
);

CREATE TABLE "qti"."math_action" (
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "selection_lexical" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "selection_written" boolean NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "selection" "qti"."__domain_gfw43vigph" GENERATED ALWAYS AS ("qti"."__row_6rhtzxaia4"("selection_written", "selection_lexical")) STORED NOT NULL,
  CONSTRAINT "__math_action_pk_4jdvklv2ii" PRIMARY KEY ("package", "path", "start"),
  CONSTRAINT "e_1_derived" CHECK (("selection_lexical" = ''::"pg_catalog"."text" OR "selection_written" = true) IS TRUE)
);

CREATE TABLE "qti"."math_align_group" (
  "cell" "qti"."__domain_gfw43vigph" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__math_align_group_pk_tgvbkr7qje" PRIMARY KEY ("package", "path", "start")
);

CREATE TABLE "qti"."math_align_scope" (
  "cell" "qti"."__domain_gfw43vigph" NOT NULL,
  "chosen" "qti"."__domain_gfw43vigph" NOT NULL,
  "inherited" "qti"."align_direction" NOT NULL,
  "own" "qti"."align_direction" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "passes" "qti"."align_state" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "received" "qti"."align_state" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "state" "qti"."align_state" NOT NULL,
  CONSTRAINT "__math_align_scope_pk_sxnaufx3ho" PRIMARY KEY ("package", "path", "start"),
  CONSTRAINT "__math_align_scope_key_package_path_start_cell_mgyr62ewdn" UNIQUE NULLS DISTINCT ("package", "path", "start", "cell"),
  CONSTRAINT "__math_align_scope_key_package_path_start_state_zrr62hnvxo" UNIQUE NULLS DISTINCT ("package", "path", "start", "state")
);

CREATE TABLE "qti"."math_cell" (
  "groups" "qti"."__domain_gfw43vigph" NOT NULL,
  "last_start" "qti"."__domain_gfw43vigph" NOT NULL,
  "leaves" "qti"."__domain_gfw43vigph" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__math_cell_pk_flybwottgz" PRIMARY KEY ("package", "path", "start"),
  CONSTRAINT "__math_cell_check_math_cell_leaves_max_fold_p4tuczms44" CHECK (("leaves" > 0::bigint OR "last_start" = 0::bigint) IS TRUE),
  CONSTRAINT "__math_cell_key_package_path_start_leaves_nhlewh35h4" UNIQUE NULLS DISTINCT ("package", "path", "start", "leaves"),
  CONSTRAINT "__math_cell_key_package_path_start_groups_nlvtbk2yer" UNIQUE NULLS DISTINCT ("package", "path", "start", "groups")
);

CREATE TABLE "qti"."math_cn" (
  "base" "qti"."cn_base" NOT NULL,
  "base_lexical" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "parts" "qti"."__domain_gfw43vigph" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "type" "qti"."cn_type" NOT NULL,
  "type_lexical" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  CONSTRAINT "__math_cn_pk_3nrusqjv2o" PRIMARY KEY ("package", "path", "start"),
  CONSTRAINT "e_1_derived" CHECK (("qti"."__row_qws4baa74i"("base_lexical", "base", "type_lexical", "type")) IS TRUE),
  CONSTRAINT "__math_cn_key_package_path_start_parts_base_type_k7rpbytgms" UNIQUE NULLS DISTINCT ("package", "path", "start", "parts", "base", "type"),
  CONSTRAINT "__math_cn_check_math_cn_in_cn_parts_ela4pkxt26" CHECK (("qti"."__row_xpekqjl2mx"("type", "parts")) IS TRUE)
);

CREATE TABLE "qti"."math_rank" (
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "rank" "qti"."__domain_gfw43vigph" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__math_rank_pk_bu6eyoohob" PRIMARY KEY ("package", "path", "start")
);

CREATE TABLE "qti"."media" (
  "digest" "qti"."__text_vrcyezm7ka" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  CONSTRAINT "__media_pk_scp4yymok4" PRIMARY KEY ("package", "path")
);

CREATE TABLE "qti"."most_count" (
  "most" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "most_value" bigint NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__most_count_pk_dueqkg2jsm" PRIMARY KEY ("package", "path", "start"),
  CONSTRAINT "e_1_derived" CHECK (("qti"."__row_7ebkly7ayy"("most", "most_value")) IS TRUE)
);

CREATE TABLE "qti"."named" (
  "identifier" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__named_pk_7cwq6zir4x" PRIMARY KEY ("package", "path", "start")
);

CREATE TABLE "qti"."namespace" (
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "prefix" "qti"."__text_wchibbb5qm" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "uri" "qti"."__text_zij47sgley" NOT NULL,
  CONSTRAINT "__namespace_pk_bossyr4mgg" PRIMARY KEY ("package", "path", "start", "prefix")
);

CREATE TABLE "qti"."node" (
  "ancestry" "qti"."__flag_bits_16_llpdtzgaon" NOT NULL,
  "at" "qti"."__domain_gfw43vigph" NOT NULL,
  "attributes" "qti"."__domain_gfw43vigph" NOT NULL,
  "attrs" "qti"."__attribute_slot_bits_112_aecznthxg5" NOT NULL,
  "barred_children" "qti"."__domain_gfw43vigph" NOT NULL,
  "chars" "qti"."__text_c6iptmtj2x" NOT NULL,
  "chars_after" "qti"."__text_oq3spimary" NOT NULL,
  "chars_was" "qti"."__text_oq3spimary" NOT NULL,
  "children" "qti"."__domain_gfw43vigph" NOT NULL,
  "counted_children" "qti"."__domain_gfw43vigph" NOT NULL,
  "element_children" "qti"."__domain_gfw43vigph" NOT NULL,
  "elements" "qti"."__domain_gfw43vigph" NOT NULL,
  "elements_was" "qti"."__domain_gfw43vigph" NOT NULL,
  "end" "qti"."__domain_gfw43vigph" NOT NULL,
  "first" "qti"."__text_gke7uypkov" NOT NULL,
  "governor" "qti"."governor" NOT NULL,
  "kind" "qti"."node_kind" NOT NULL,
  "last" "qti"."__text_gke7uypkov" NOT NULL,
  "last_state" "qti"."position" NOT NULL,
  "nearest" "qti"."__domain_gfw43vigph" NOT NULL,
  "nearest_kind" "qti"."node_kind" NOT NULL,
  "nearest_path" "qti"."__text_6zspo66rxv" NOT NULL,
  "open_attributes" "qti"."__domain_gfw43vigph" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "parent" "qti"."__domain_gfw43vigph" NOT NULL,
  "parent_ancestry" "qti"."__flag_bits_16_llpdtzgaon" NOT NULL,
  "parent_governor" "qti"."governor" NOT NULL,
  "parent_kind" "qti"."node_kind" NOT NULL,
  "parent_nearest" "qti"."__domain_gfw43vigph" NOT NULL,
  "parent_nearest_kind" "qti"."node_kind" NOT NULL,
  "parent_nearest_path" "qti"."__text_6zspo66rxv" NOT NULL,
  "parent_parent_kind" "qti"."node_kind" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "prefix" "qti"."__text_76pfa5avf4" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "state" "qti"."position" NOT NULL,
  "string_value" "qti"."__text_oq3spimary" NOT NULL,
  "was" "qti"."position" NOT NULL,
  CONSTRAINT "__node_pk_3sd4cqvxbf" PRIMARY KEY ("package", "path", "start"),
  CONSTRAINT "__node_check_node_attributes_or_fold_mleeahtwkj" CHECK (("attributes" > 0::bigint OR "attrs" = X'0000000000000000000000000000'::"qti"."__attribute_slot_bits_112_aecznthxg5") IS TRUE),
  CONSTRAINT "__node_check_node_children_count_fold_hsxqdt3sdl" CHECK ((("at" > 0::bigint OR "elements_was" = 0::bigint) AND ("children" > 0::bigint OR "element_children" = 0::bigint) AND CASE WHEN NOT "kind" IN (7::smallint, 1::smallint, 0::smallint, 9::smallint, 8::smallint, 5::smallint, 6::smallint) AND "start" > 0::bigint THEN "elements"::numeric = "elements_was"::numeric + (1::bigint)::numeric ELSE "elements" = "elements_was" END) IS TRUE),
  CONSTRAINT "__node_check_node_children_concat_fold_2qfkeydkpv" CHECK ((("at" > 0::bigint OR "chars_was" = ''::"pg_catalog"."text") AND ("children" > 0::bigint OR "string_value" = ''::"pg_catalog"."text") AND "qti"."__row_l3skqw25vw"("parent_kind", "parent_parent_kind", "parent_governor", "start", "chars_after", "chars_was", "chars")) IS TRUE),
  CONSTRAINT "al_3_required" CHECK (("qti"."__row_dpnoe4rv6h"("governor", "attrs")) IS TRUE),
  CONSTRAINT "al_5_attribute_count" CHECK (("qti"."__row_kaddqdvwod"("governor", "attrs")) IS TRUE),
  CONSTRAINT "double_bound" CHECK (("qti"."__row_5skakdnhjl"("governor", "string_value")) IS TRUE),
  CONSTRAINT "e_1_derived" CHECK ((("kind" IN (9::smallint, 5::smallint, 6::smallint) OR "chars" = ''::"pg_catalog"."text") AND "qti"."__row_topiedmeph"("kind", "governor", "chars", "first", "last", "parent_ancestry", "ancestry")) IS TRUE),
  CONSTRAINT "foreign_element_class" CHECK (("kind" <> 3::smallint OR "prefix" = ''::"pg_catalog"."text") IS TRUE),
  CONSTRAINT "foreign_simple_content" CHECK ((NOT NOT "governor" IN (2::smallint, 3::smallint, 4::smallint) OR NOT "kind" IN (2::smallint, 3::smallint, 4::smallint) OR "element_children" = 0::bigint) IS TRUE),
  CONSTRAINT "media_source_src" CHECK ((NOT "parent_kind" IN (229::smallint, 298::smallint) OR "kind" <> 280::smallint OR "qti"."__row_cdpcrvbl2a"("attrs", "governor")) IS TRUE),
  CONSTRAINT "n_1_sentinel" CHECK (("governor" = 0::smallint AND "kind" = 0::smallint AND "parent" = "start" AND "start" = 0::bigint AND "state" = 0::smallint OR "kind" <> 0::smallint AND "start" > 0::bigint) IS TRUE),
  CONSTRAINT "n_5_follow" CHECK ((NOT "start" > 0::bigint OR "qti"."__row_i5hqpho2vw"("kind", "parent_kind", "was", "state")) IS TRUE),
  CONSTRAINT "n_5_admitted" CHECK (("start" = 0::bigint OR "qti"."__row_cagame6b6t"("kind", "parent_kind", "state", "was")) IS TRUE),
  CONSTRAINT "n_6_ancestry" CHECK (("qti"."__row_3vyqydin2g"("kind", "parent_ancestry")) IS TRUE),
  CONSTRAINT "n_7_counted" CHECK ((NOT (NOT "kind" IN (7::smallint, 1::smallint, 0::smallint, 9::smallint, 8::smallint, 5::smallint, 6::smallint) OR "kind" = 0::smallint) OR "qti"."__row_dds762ix6o"("kind", "counted_children")) IS TRUE),
  CONSTRAINT "n_7_last" CHECK ((NOT (NOT "kind" IN (7::smallint, 1::smallint, 0::smallint, 9::smallint, 8::smallint, 5::smallint, 6::smallint) OR "kind" = 0::smallint) OR "qti"."__row_h55qs3ddi4"("last_state", "kind")) IS TRUE),
  CONSTRAINT "n_7_barred_by" CHECK ((NOT (NOT "kind" IN (7::smallint, 1::smallint, 0::smallint, 9::smallint, 8::smallint, 5::smallint, 6::smallint) OR "kind" = 0::smallint) OR "barred_children" = 0::bigint OR "qti"."__row_mvlazibe6j"("kind", "attrs")) IS TRUE),
  CONSTRAINT "n_8_nearest" CHECK ((CASE WHEN "parent_kind" IN (133::smallint, 127::smallint, 18::smallint, 118::smallint, 17::smallint, 131::smallint, 119::smallint, 125::smallint, 121::smallint, 123::smallint, 122::smallint, 129::smallint, 16::smallint, 120::smallint, 128::smallint, 130::smallint, 117::smallint, 187::smallint, 124::smallint, 126::smallint, 10::smallint, 132::smallint) THEN false OR true AND "nearest" = "parent" AND "nearest_kind" = "parent_kind" AND "nearest_path" = "path" OR "start" = 0::bigint ELSE true AND "nearest" = "parent_nearest" AND "nearest_kind" = "parent_nearest_kind" AND "nearest_path" = "parent_nearest_path" OR false OR "start" = 0::bigint END) IS TRUE),
  CONSTRAINT "picture_source_srcset" CHECK (("kind" <> 280::smallint OR "parent_kind" <> 268::smallint OR "qti"."__row_b5mgylvrip"("attrs", "governor")) IS TRUE),
  CONSTRAINT "text_domain" CHECK (("qti"."__row_bx7m6665wc"("governor", "string_value")) IS TRUE),
  CONSTRAINT "track_srclang" CHECK (("kind" <> 294::smallint OR "qti"."__row_oypzlmjlum"("attrs", "governor")) IS TRUE),
  CONSTRAINT "entity_ref_arm" CHECK (("kind" <> 9::smallint OR "qti"."__row_rcj6itvj2w"("chars")) IS TRUE),
  CONSTRAINT "text_arm" CHECK (("kind" <> 5::smallint OR "qti"."__row_3qgkwnovoe"("chars")) IS TRUE),
  CONSTRAINT "ws_arm" CHECK (("kind" <> 6::smallint OR "qti"."__row_2jqjgtinlf"("chars")) IS TRUE),
  CONSTRAINT "__node_key_package_path_start_attributes_governor_ygbuqn7z2g" UNIQUE NULLS DISTINCT ("package", "path", "start", "attributes", "governor", "kind"),
  CONSTRAINT "__node_key_package_path_start_nearest_y5k53am632" UNIQUE NULLS DISTINCT ("package", "path", "start", "nearest"),
  CONSTRAINT "__node_key_package_path_start_kind_governor_42fsltrsjy" UNIQUE NULLS DISTINCT ("package", "path", "start", "kind", "governor"),
  CONSTRAINT "__node_key_package_path_start_kind_ooglyqab5z" UNIQUE NULLS DISTINCT ("package", "path", "start", "kind"),
  CONSTRAINT "__node_check_node_in_node_z2rpbmauvt" CHECK (("children" > 0::bigint OR "last_state" = 0::smallint) IS TRUE),
  CONSTRAINT "__node_check_node_start_in_node_kuuvkytm3l" CHECK (("at" > 0::bigint OR "was" = 0::smallint) IS TRUE),
  CONSTRAINT "__node_key_package_path_start_children_ancestry_mhxzt3iftx" UNIQUE NULLS DISTINCT ("package", "path", "start", "children", "ancestry", "governor", "kind", "nearest", "nearest_kind", "nearest_path", "parent_kind"),
  CONSTRAINT "__node_check_node_start_in_node_dqrlgxt5zm" CHECK (("start" > 0::bigint OR "parent_ancestry" = X'0000'::"qti"."__flag_bits_16_llpdtzgaon" AND "parent_governor" = 0::smallint AND "parent_kind" = 0::smallint AND "parent_nearest" = 0::bigint AND "parent_nearest_kind" = 0::smallint AND "parent_nearest_path" = 'imsmanifest.xml'::"pg_catalog"."text" AND "parent_parent_kind" = 0::smallint) IS TRUE),
  CONSTRAINT "__node_key_package_path_start_open_attributes_nc25nroxph" UNIQUE NULLS DISTINCT ("package", "path", "start", "open_attributes", "governor", "kind"),
  CONSTRAINT "__node_key_package_path_start_parent_ytuzrwhg3t" UNIQUE NULLS DISTINCT ("package", "path", "start", "parent")
);

CREATE TABLE "qti"."normal_maximum" (
  "lexical" "qti"."__text_oq3spimary" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__normal_maximum_pk_zlhcz2bseu" PRIMARY KEY ("package", "path", "start")
);

CREATE TABLE "qti"."normal_minimum" (
  "lexical" "qti"."__text_oq3spimary" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "written" boolean NOT NULL,
  CONSTRAINT "__normal_minimum_pk_po6gjnvo47" PRIMARY KEY ("package", "path", "start"),
  CONSTRAINT "e_1_derived" CHECK (("lexical" = '0.0'::"pg_catalog"."text" OR "written" = true) IS TRUE)
);

CREATE TABLE "qti"."numbered_reading" (
  "assembly" "qti"."__text_6zspo66rxv" NOT NULL,
  "attribute" "qti"."attribute_name" NOT NULL,
  "number" "qti"."__text_oq3spimary" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "scope" "qti"."__domain_gfw43vigph" NOT NULL,
  "scope_instance" "qti"."__domain_gfw43vigph" NOT NULL,
  "scope_path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "variable" "qti"."__text_oq3spimary" NOT NULL
);

CREATE TABLE "qti"."open_attribute" (
  "class" "qti"."attribute_name" NOT NULL,
  "element_namespace" "qti"."__text_mvb6rz2wwz" NOT NULL,
  "governor" "qti"."governor" NOT NULL,
  "kind" "qti"."node_kind" NOT NULL,
  "lexical" "qti"."__text_c6iptmtj2x" NOT NULL,
  "local" "qti"."__text_qswrkft5qs" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "prefix" "qti"."__text_wchibbb5qm" NOT NULL,
  "slot" "qti"."__attribute_slot_bits_112_aecznthxg5" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "uri" "qti"."__text_mvb6rz2wwz" NOT NULL,
  CONSTRAINT "__open_attribute_pk_6mb2hbuotd" PRIMARY KEY ("package", "path", "start", "uri", "local"),
  CONSTRAINT "al_1_admission" CHECK (("qti"."__row_kv5rkzmio2"("governor", "class")) IS TRUE),
  CONSTRAINT "al_4_data_name" CHECK (("qti"."__row_3t2pmfpjno"("kind", "local", "class")) IS TRUE),
  CONSTRAINT "al_4_declared_data_name" CHECK (("class" <> 0::smallint OR "qti"."__row_jepjc2ekks"("governor", "local")) IS TRUE),
  CONSTRAINT "attribute_prefix" CHECK ((CASE WHEN "class" IN (1::smallint, 3::smallint) THEN NOT "prefix" IN (''::"pg_catalog"."text", 'xml'::"pg_catalog"."text", 'xmlns'::"pg_catalog"."text") ELSE "prefix" = ''::"pg_catalog"."text" END) IS TRUE),
  CONSTRAINT "double_bound" CHECK (("qti"."__row_2ya6cjdips"("governor", "class", "lexical")) IS TRUE),
  CONSTRAINT "e_1_derived" CHECK (("qti"."__row_4g6tduxftl"("governor", "class", "slot")) IS TRUE),
  CONSTRAINT "foreign_attribute_class" CHECK (("qti"."__row_3o3ow6nbmz"("kind", "element_namespace", "class", "uri")) IS TRUE),
  CONSTRAINT "value_domain" CHECK (("qti"."__row_onczbmwqpm"("governor", "class", "lexical")) IS TRUE),
  CONSTRAINT "__open_attribute_subset_class_vzmcv3d7ri" CHECK (("class" IN (0::smallint, 1::smallint, 2::smallint, 3::smallint)) IS TRUE)
);

CREATE TABLE "qti"."open_attribute_entity" (
  "entity" "qti"."__text_xj3zno7u3h" NOT NULL,
  "local" "qti"."__text_qswrkft5qs" NOT NULL,
  "offset" "qti"."__domain_gfw43vigph" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "uri" "qti"."__text_mvb6rz2wwz" NOT NULL,
  CONSTRAINT "__open_attribute_entity_pk_u75ia7rdtp" PRIMARY KEY ("package", "path", "start", "uri", "local", "offset")
);

CREATE TABLE "qti"."open_element_name" (
  "local" "qti"."__text_qswrkft5qs" NOT NULL,
  "namespace" "qti"."__text_w7a4l3clst" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "expanded" "qti"."__text_7cbjao7rjc" GENERATED ALWAYS AS ("namespace" || '}'::"pg_catalog"."text" || "local") STORED NOT NULL,
  CONSTRAINT "__open_element_name_pk_tvf7l2rxcw" PRIMARY KEY ("package", "path", "start"),
  CONSTRAINT "math_ml_foreign_element" CHECK (("qti"."__row_4lllbffefr"("namespace")) IS TRUE)
);

CREATE TABLE "qti"."open_element_type" (
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "type" "qti"."type_name" NOT NULL,
  CONSTRAINT "__open_element_type_pk_osb6ag24xx" PRIMARY KEY ("package", "path", "start")
);

CREATE TABLE "qti"."package" (
  "name" "qti"."__text_xv5q2k3cum" NOT NULL,
  CONSTRAINT "__package_pk_sg2cyzxgtm" PRIMARY KEY ("name")
);

CREATE TABLE "qti"."pci_module_form" (
  "element" boolean NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__pci_module_form_pk_jb4ydiyesl" PRIMARY KEY ("package", "path", "start", "element")
);

CREATE TABLE "qti"."pi" (
  "data" "qti"."__text_23rzixl3a2" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "target" "qti"."__text_3adwbksayk" NOT NULL,
  CONSTRAINT "__pi_pk_vqm3tcomg6" PRIMARY KEY ("package", "path", "start")
);

CREATE TABLE "qti"."placed_binding" (
  "adaptive" boolean NOT NULL,
  "assembly" "qti"."__text_6zspo66rxv" NOT NULL,
  "attribute" "qti"."attribute_name" NOT NULL,
  "identifier" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "instance" "qti"."__domain_gfw43vigph" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__placed_binding_pk_kvet6cuoq5" PRIMARY KEY ("package", "assembly", "instance", "start", "attribute")
);

CREATE TABLE "qti"."placed_choice" (
  "assembly" "qti"."__text_6zspo66rxv" NOT NULL,
  "identifier" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "instance" "qti"."__domain_gfw43vigph" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__placed_choice_pk_dok6mu6xso" PRIMARY KEY ("package", "assembly", "instance", "start")
);

CREATE TABLE "qti"."placed_hottext" (
  "assembly" "qti"."__text_6zspo66rxv" NOT NULL,
  "identifier" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "instance" "qti"."__domain_gfw43vigph" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__placed_hottext_pk_6ecbggsuft" PRIMARY KEY ("package", "assembly", "instance", "start")
);

CREATE TABLE "qti"."placed_id" (
  "assembly" "qti"."__text_6zspo66rxv" NOT NULL,
  "assembly_kind" "qti"."node_kind" NOT NULL,
  "id" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "instance" "qti"."__domain_gfw43vigph" NOT NULL,
  "owner" "qti"."__domain_gfw43vigph" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__placed_id_pk_qlkpea6rki" PRIMARY KEY ("package", "assembly", "instance", "start")
);

CREATE TABLE "qti"."placed_idref" (
  "assembly" "qti"."__text_6zspo66rxv" NOT NULL,
  "id" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "instance" "qti"."__domain_gfw43vigph" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL
);

CREATE TABLE "qti"."placed_math_rank" (
  "assembly" "qti"."__text_6zspo66rxv" NOT NULL,
  "instance" "qti"."__domain_gfw43vigph" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "rank" "qti"."__domain_gfw43vigph" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__placed_math_rank_pk_w247vuqyov" PRIMARY KEY ("package", "assembly", "instance", "start")
);

CREATE TABLE "qti"."placed_share_target" (
  "assembly" "qti"."__text_6zspo66rxv" NOT NULL,
  "assembly_kind" "qti"."node_kind" NOT NULL,
  "id" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "instance" "qti"."__domain_gfw43vigph" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "target" "qti"."__text_6zspo66rxv" NOT NULL,
  "target_instance" "qti"."__domain_gfw43vigph" NOT NULL,
  "target_start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__placed_share_target_pk_r6i6tlbske" PRIMARY KEY ("package", "assembly", "instance", "start")
);

CREATE TABLE "qti"."placed_variable_ref" (
  "assembly" "qti"."__text_6zspo66rxv" NOT NULL,
  "attribute" "qti"."attribute_name" NOT NULL,
  "identifier" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "instance" "qti"."__domain_gfw43vigph" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "resolution" "qti"."reference_resolution" NOT NULL,
  "root_kind" "qti"."node_kind" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__placed_variable_ref_pk_raoqh7fl2q" PRIMARY KEY ("package", "assembly", "instance", "path", "start", "attribute"),
  CONSTRAINT "e_1_derived" CHECK (("resolution" = 0::smallint OR "qti"."__row_eqcec5telp"("identifier", "root_kind", "resolution")) IS TRUE)
);

CREATE TABLE "qti"."printed_variable_ref" (
  "assembly_kind" "qti"."node_kind" NOT NULL,
  "attribute" "qti"."attribute_name" NOT NULL,
  "identifier" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "kind" "qti"."node_kind" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__printed_variable_ref_pk_4a3jyykasc" PRIMARY KEY ("package", "path", "start", "attribute"),
  CONSTRAINT "printed_variable_reference" CHECK (("kind" IN (115::smallint, 209::smallint, 14::smallint, 97::smallint, 113::smallint) AND "assembly_kind" = 299::smallint AND "attribute" = 96::smallint AND "identifier" = 'completionStatus'::"pg_catalog"."text" OR "qti"."__row_zzy4tf2m2u"("kind", "assembly_kind", "attribute", "identifier")) IS TRUE)
);

CREATE TABLE "qti"."processing" (
  "language" "qti"."language" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__processing_pk_gy3aspswav" PRIMARY KEY ("package", "path", "start")
);

CREATE TABLE "qti"."reference" (
  "kind" "qti"."node_kind" NOT NULL,
  "lead" "qti"."__text_7dfilirtp3" NOT NULL,
  "name" "qti"."attribute_name" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "params" "qti"."__text_k5kwygzatl" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "scope" "qti"."href_scope" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "target" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "trail" "qti"."__text_7dfilirtp3" NOT NULL,
  CONSTRAINT "__reference_pk_2o4vr3munh" PRIMARY KEY ("package", "path", "start", "name"),
  CONSTRAINT "e_1_derived" CHECK ((("scope" <> 2::smallint OR "target" = ''::"pg_catalog"."text") AND "qti"."__row_yhjz272c7n"("target", "scope")) IS TRUE),
  CONSTRAINT "href_form" CHECK (("scope" <> 3::smallint) IS TRUE),
  CONSTRAINT "include_fragment_identifier" CHECK (("kind" <> 642::smallint OR "qti"."__row_kd7mqptoiv"("params")) IS TRUE)
);

CREATE TABLE "qti"."reference_path" (
  "kind" "qti"."node_kind" NOT NULL,
  "name" "qti"."attribute_name" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "target" "qti"."__text_6zspo66rxv" NOT NULL,
  CONSTRAINT "__reference_path_pk_p3zpayjgij" PRIMARY KEY ("package", "path", "start", "name"),
  CONSTRAINT "e_1_derived" CHECK (("qti"."__row_i4fvlc2bb6"("target")) IS TRUE)
);

CREATE TABLE "qti"."referring_document" (
  "contexts" "qti"."__domain_gfw43vigph" NOT NULL,
  "feedbacks" "qti"."__domain_gfw43vigph" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "prints" "qti"."__domain_gfw43vigph" NOT NULL,
  "templates" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__referring_document_pk_tdpnvmehb4" PRIMARY KEY ("package", "path"),
  CONSTRAINT "__referring_document_key_package_path_feedbacks_cvhrnks7yx" UNIQUE NULLS DISTINCT ("package", "path", "feedbacks", "prints", "templates", "contexts"),
  CONSTRAINT "__referring_document_key_package_path_contexts_ywpuklr6qa" UNIQUE NULLS DISTINCT ("package", "path", "contexts"),
  CONSTRAINT "__referring_document_key_package_path_feedbacks_4p7kezdq2l" UNIQUE NULLS DISTINCT ("package", "path", "feedbacks"),
  CONSTRAINT "__referring_document_key_package_path_prints_v72l4cixxs" UNIQUE NULLS DISTINCT ("package", "path", "prints"),
  CONSTRAINT "__referring_document_key_package_path_templates_je6u6axji4" UNIQUE NULLS DISTINCT ("package", "path", "templates")
);

CREATE TABLE "qti"."resource_document" (
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "root_kind" "qti"."node_kind" NOT NULL,
  "type" "qti"."resource_type" NOT NULL,
  "document_type" "qti"."document_type" GENERATED ALWAYS AS ("qti"."__row_e7h7hkejv4"("type")) STORED NOT NULL,
  CONSTRAINT "__resource_document_pk_rxwn2mdki3" PRIMARY KEY ("package", "path"),
  CONSTRAINT "__resource_document_check_resource_document_in_root_mkbnfbuuvd" CHECK (("qti"."__row_awivwlafyr"("type", "root_kind")) IS TRUE)
);

CREATE TABLE "qti"."resource_href" (
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "scope" "qti"."href_scope" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "target" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  CONSTRAINT "__resource_href_pk_fzjlywz4ma" PRIMARY KEY ("package", "path", "start"),
  CONSTRAINT "e_1_derived" CHECK (("scope" <> 0::smallint OR "qti"."__row_to7qnnmz2p"("target")) IS TRUE),
  CONSTRAINT "href_form" CHECK (("scope" <> 3::smallint) IS TRUE)
);

CREATE TABLE "qti"."rounding" (
  "holds" "qti"."rounding_holds" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__rounding_pk_p5ba7td7t4" PRIMARY KEY ("package", "path", "start")
);

CREATE TABLE "qti"."rounding_figures" (
  "figures_lexical" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "figures" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" GENERATED ALWAYS AS ("pg_catalog"."btrim"("pg_catalog"."replace"("pg_catalog"."replace"("pg_catalog"."replace"("pg_catalog"."replace"("pg_catalog"."replace"("pg_catalog"."replace"("figures_lexical", E'\t'::"pg_catalog"."text", ' '::"pg_catalog"."text"), E'\n'::"pg_catalog"."text", ' '::"pg_catalog"."text"), E'\r'::"pg_catalog"."text", ' '::"pg_catalog"."text"), '  '::"pg_catalog"."text", E' \t'::"pg_catalog"."text"), E'\t '::"pg_catalog"."text", E'\t\t'::"pg_catalog"."text"), E'\t'::"pg_catalog"."text", ''::"pg_catalog"."text"))) STORED NOT NULL,
  CONSTRAINT "__rounding_figures_pk_wwvjzzaivg" PRIMARY KEY ("package", "path", "start")
);

CREATE TABLE "qti"."rounding_mode_figures" (
  "figures" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "mode" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__rounding_mode_figures_pk_32ue4ztm6s" PRIMARY KEY ("package", "path", "start"),
  CONSTRAINT "rounding_figures" CHECK (("qti"."__row_7j4cj3ujio"("figures", "mode")) IS TRUE)
);

CREATE TABLE "qti"."sd_decl" (
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "standalone" "qti"."xml_standalone" NOT NULL,
  CONSTRAINT "__sd_decl_pk_do2xlu7vc3" PRIMARY KEY ("package", "path")
);

CREATE TABLE "qti"."share_fragment" (
  "assembled" boolean NOT NULL,
  "id" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "placements" "qti"."__domain_gfw43vigph" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__share_fragment_pk_w7lv43thb6" PRIMARY KEY ("package", "path", "start")
);

CREATE TABLE "qti"."share_target" (
  "id" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "target_start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__share_target_pk_tap2cz4xh5" PRIMARY KEY ("package", "path", "start")
);

CREATE TABLE "qti"."site" (
  "ancestry" "qti"."__flag_bits_16_llpdtzgaon" NOT NULL,
  "children" "qti"."__domain_gfw43vigph" NOT NULL,
  "external" boolean NOT NULL,
  "governor" "qti"."governor" NOT NULL,
  "kind" "qti"."node_kind" NOT NULL,
  "nearest" "qti"."__domain_gfw43vigph" NOT NULL,
  "nearest_kind" "qti"."node_kind" NOT NULL,
  "nearest_path" "qti"."__text_6zspo66rxv" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "parent" "qti"."__domain_gfw43vigph" NOT NULL,
  "parent_kind" "qti"."node_kind" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__site_pk_j2vhpivheb" PRIMARY KEY ("package", "path", "start"),
  CONSTRAINT "e_1_derived" CHECK (("parent_kind" IN (223::smallint, 224::smallint, 225::smallint, 226::smallint, 227::smallint, 228::smallint, 230::smallint, 233::smallint, 236::smallint, 237::smallint, 238::smallint, 241::smallint, 243::smallint, 244::smallint, 246::smallint, 247::smallint, 248::smallint, 250::smallint, 251::smallint, 252::smallint, 253::smallint, 254::smallint, 255::smallint, 256::smallint, 257::smallint, 259::smallint, 261::smallint, 262::smallint, 263::smallint, 264::smallint, 265::smallint, 267::smallint, 269::smallint, 270::smallint, 300::smallint, 152::smallint, 171::smallint, 199::smallint, 202::smallint, 208::smallint, 219::smallint, 220::smallint, 14::smallint, 119::smallint, 153::smallint, 11::smallint, 129::smallint, 162::smallint, 184::smallint, 95::smallint, 161::smallint, 175::smallint, 174::smallint, 173::smallint, 271::smallint, 179::smallint, 134::smallint, 192::smallint, 191::smallint, 190::smallint, 304::smallint, 197::smallint, 114::smallint, 143::smallint, 111::smallint, 15::smallint, 201::smallint, 277::smallint, 278::smallint, 279::smallint, 281::smallint, 282::smallint, 283::smallint, 285::smallint, 288::smallint, 291::smallint, 295::smallint, 297::smallint) AND "kind" = 642::smallint OR "kind" = 110::smallint) IS TRUE),
  CONSTRAINT "__site_key_package_path_start_kind_s6ijpbztua" UNIQUE NULLS DISTINCT ("package", "path", "start", "kind"),
  CONSTRAINT "__site_key_package_path_start_ancestry_kind_nearest_ap2yfi7b7f" UNIQUE NULLS DISTINCT ("package", "path", "start", "ancestry", "kind", "nearest", "nearest_kind", "parent_kind")
);

CREATE TABLE "qti"."site_path" (
  "entry" boolean NOT NULL,
  "kind" "qti"."node_kind" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "target" "qti"."__text_6zspo66rxv" NOT NULL,
  CONSTRAINT "__site_path_pk_6ywav3eq35" PRIMARY KEY ("package", "path", "start"),
  CONSTRAINT "file_exists" CHECK (("entry" = true) IS TRUE),
  CONSTRAINT "__site_path_key_package_path_start_target_s26hafrpua" UNIQUE NULLS DISTINCT ("package", "path", "start", "target")
);

CREATE TABLE "qti"."site_target" (
  "ancestry" "qti"."__flag_bits_16_llpdtzgaon" NOT NULL,
  "kind" "qti"."node_kind" NOT NULL,
  "nearest" "qti"."__domain_gfw43vigph" NOT NULL,
  "nearest_kind" "qti"."node_kind" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "parent_kind" "qti"."node_kind" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "places" boolean NOT NULL,
  "splices" boolean NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "target" "qti"."__text_6zspo66rxv" NOT NULL,
  "target_nearest" "qti"."__domain_gfw43vigph" NOT NULL,
  "target_nearest_kind" "qti"."node_kind" NOT NULL,
  "target_nearest_path" "qti"."__text_6zspo66rxv" NOT NULL,
  "target_root" "qti"."node_kind" NOT NULL,
  CONSTRAINT "__site_target_pk_oj7kjo67zv" PRIMARY KEY ("package", "path", "start"),
  CONSTRAINT "e_1_derived" CHECK ((CASE WHEN "places" THEN "target_root" = 300::smallint ELSE "target_root" <> 300::smallint END AND "splices" = false OR "kind" <> 110::smallint) IS TRUE),
  CONSTRAINT "fragment_context" CHECK (("nearest" = "target_nearest" AND "nearest_kind" = "target_nearest_kind" AND "path" = "target_nearest_path" OR "nearest_kind" = 0::smallint AND "target_nearest_kind" = 0::smallint) IS TRUE),
  CONSTRAINT "section_ref_target" CHECK (("kind" <> 110::smallint OR "target_root" = 300::smallint) IS TRUE),
  CONSTRAINT "__site_target_key_package_path_start_parent_kind_cu6n5wnlhm" UNIQUE NULLS DISTINCT ("package", "path", "start", "parent_kind", "places", "target_root", "splices")
);

CREATE TABLE "qti"."srcset" (
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "token_text" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "tokens" "qti"."__domain_gfw43vigph" NOT NULL,
  "trail" "qti"."__text_b6ykamoeho" NOT NULL,
  CONSTRAINT "__srcset_pk_wnl6kaqxsl" PRIMARY KEY ("package", "path", "start"),
  CONSTRAINT "__srcset_check_srcset_tokens_concat_fold_7x5nzmr2a5" CHECK (("tokens" > 0::bigint OR "token_text" = ''::"pg_catalog"."text") IS TRUE),
  CONSTRAINT "__srcset_key_package_path_start_tokens_7vcwtlqzy2" UNIQUE NULLS DISTINCT ("package", "path", "start", "tokens")
);

CREATE TABLE "qti"."srcset_candidate" (
  "at" "qti"."__domain_gfw43vigph" NOT NULL,
  "descriptor" "qti"."__text_4s4od7s5or" NOT NULL,
  "lead" "qti"."__text_b6ykamoeho" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "pieces_after" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "pieces_was" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "scope" "qti"."href_scope" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "url" "qti"."__text_netnsfkgs7" NOT NULL,
  "piece" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" GENERATED ALWAYS AS ("lead" || "url" || "descriptor") STORED NOT NULL,
  CONSTRAINT "__srcset_candidate_pk_rbke535jdh" PRIMARY KEY ("package", "path", "start", "at"),
  CONSTRAINT "__srcset_candidate_check_srcset_tokens_concat_fold_jthorh3gv6" CHECK ((("at" > 0::bigint OR "pieces_was" = ''::"pg_catalog"."text") AND ("pg_catalog"."char_length"("pieces_after") = "pg_catalog"."char_length"("pieces_was")::bigint + "pg_catalog"."char_length"("piece")::bigint AND ("pg_catalog"."starts_with"("pieces_after", "pieces_was") AND "pg_catalog"."right"("pieces_after", "pg_catalog"."char_length"("piece")) = "piece"))) IS TRUE),
  CONSTRAINT "e_1_derived" CHECK (("scope" <> 2::smallint AND "qti"."__row_j4wlgwmk7l"("url", "scope", "lead", "at")) IS TRUE),
  CONSTRAINT "href_form" CHECK (("scope" <> 3::smallint) IS TRUE)
);

CREATE TABLE "qti"."ssml_scope" (
  "fragment" "qti"."__domain_gfw43vigph" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__ssml_scope_pk_swy2jq3zvy" PRIMARY KEY ("package", "path", "start")
);

CREATE TABLE "qti"."stimulus_ref" (
  "identifier" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__stimulus_ref_pk_kmzmekbnny" PRIMARY KEY ("package", "path", "start")
);

CREATE TABLE "qti"."table_header" (
  "id" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "owner" "qti"."__domain_gfw43vigph" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__table_header_pk_d7hkmir5zb" PRIMARY KEY ("package", "path", "start"),
  CONSTRAINT "e_1_derived" CHECK (("owner" = "start") IS TRUE)
);

CREATE TABLE "qti"."table_scope" (
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "table" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__table_scope_pk_ujje6dmtif" PRIMARY KEY ("package", "path", "start")
);

CREATE TABLE "qti"."template_ref" (
  "assembly_kind" "qti"."node_kind" NOT NULL,
  "attribute" "qti"."attribute_name" NOT NULL,
  "identifier" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "kind" "qti"."node_kind" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__template_ref_pk_by3fsxvspr" PRIMARY KEY ("package", "path", "start", "attribute"),
  CONSTRAINT "template_reference" CHECK (("kind" IN (115::smallint, 209::smallint, 14::smallint, 97::smallint, 113::smallint) AND "assembly_kind" = 299::smallint AND "attribute" = 96::smallint AND "identifier" = 'completionStatus'::"pg_catalog"."text" OR "qti"."__row_zzy4tf2m2u"("kind", "assembly_kind", "attribute", "identifier")) IS TRUE)
);

CREATE TABLE "qti"."text_idref" (
  "after" "qti"."__text_7dfilirtp3" NOT NULL,
  "at" "qti"."__domain_gfw43vigph" NOT NULL,
  "before" "qti"."__text_7dfilirtp3" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "pieces_after" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "pieces_was" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "token" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "piece" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" GENERATED ALWAYS AS ("before" || "token" || "after") STORED NOT NULL,
  CONSTRAINT "__text_idref_pk_7k524ffk7d" PRIMARY KEY ("package", "path", "start", "at"),
  CONSTRAINT "__text_idref_check_identity_text_tokens_concat_fold_tizgwsxdoc" CHECK ((("at" > 0::bigint OR "pieces_was" = ''::"pg_catalog"."text") AND ("pg_catalog"."char_length"("pieces_after") = "pg_catalog"."char_length"("pieces_was")::bigint + "pg_catalog"."char_length"("piece")::bigint AND ("pg_catalog"."starts_with"("pieces_after", "pieces_was") AND "pg_catalog"."right"("pieces_after", "pg_catalog"."char_length"("piece")) = "piece"))) IS TRUE),
  CONSTRAINT "e_1_derived" CHECK ((("at" = 0::bigint OR "before" <> ''::"pg_catalog"."text") AND "qti"."__row_fqcrog6dfl"("token")) IS TRUE)
);

CREATE TABLE "qti"."text_reference" (
  "kind" "qti"."node_kind" NOT NULL,
  "lead" "qti"."__text_7dfilirtp3" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "params" "qti"."__text_k5kwygzatl" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "scope" "qti"."href_scope" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "target" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "trail" "qti"."__text_7dfilirtp3" NOT NULL,
  CONSTRAINT "__text_reference_pk_47h6xjfe7g" PRIMARY KEY ("package", "path", "start"),
  CONSTRAINT "e_1_derived" CHECK ((("scope" <> 2::smallint OR "target" = ''::"pg_catalog"."text") AND "qti"."__row_yhjz272c7n"("target", "scope")) IS TRUE),
  CONSTRAINT "href_form" CHECK (("scope" <> 3::smallint) IS TRUE)
);

CREATE TABLE "qti"."text_reference_path" (
  "kind" "qti"."node_kind" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "target" "qti"."__text_6zspo66rxv" NOT NULL,
  CONSTRAINT "__text_reference_path_pk_aurefmdcbf" PRIMARY KEY ("package", "path", "start"),
  CONSTRAINT "e_1_derived" CHECK (("qti"."__row_i4fvlc2bb6"("target")) IS TRUE)
);

CREATE TABLE "qti"."tolerance" (
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "token_text" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "tokens" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__tolerance_pk_awo6y43rfn" PRIMARY KEY ("package", "path", "start"),
  CONSTRAINT "__tolerance_check_tolerance_tokens_concat_fold_2jdaujadxn" CHECK (("tokens" > 0::bigint OR "token_text" = ''::"pg_catalog"."text") IS TRUE),
  CONSTRAINT "equal_tolerance" CHECK (("tokens" IN (1::bigint, 2::bigint)) IS TRUE),
  CONSTRAINT "__tolerance_key_package_path_start_tokens_xlvepfuwuw" UNIQUE NULLS DISTINCT ("package", "path", "start", "tokens")
);

CREATE TABLE "qti"."tolerance_token" (
  "after" "qti"."__text_7dfilirtp3" NOT NULL,
  "at" "qti"."__domain_gfw43vigph" NOT NULL,
  "before" "qti"."__text_7dfilirtp3" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "pieces_after" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "pieces_was" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "token" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "piece" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" GENERATED ALWAYS AS ("before" || "token" || "after") STORED NOT NULL,
  CONSTRAINT "__tolerance_token_pk_o33pihaiia" PRIMARY KEY ("package", "path", "start", "at"),
  CONSTRAINT "__tolerance_token_check_tolerance_tokens_concat_fold_tb2xcnn6a3" CHECK ((("at" > 0::bigint OR "pieces_was" = ''::"pg_catalog"."text") AND ("pg_catalog"."char_length"("pieces_after") = "pg_catalog"."char_length"("pieces_was")::bigint + "pg_catalog"."char_length"("piece")::bigint AND ("pg_catalog"."starts_with"("pieces_after", "pieces_was") AND "pg_catalog"."right"("pieces_after", "pg_catalog"."char_length"("piece")) = "piece"))) IS TRUE),
  CONSTRAINT "e_1_derived" CHECK ((("at" = 0::bigint OR "before" <> ''::"pg_catalog"."text") AND "qti"."__row_fqcrog6dfl"("token")) IS TRUE),
  CONSTRAINT "equal_tolerance" CHECK (("qti"."__row_s52thndv2z"("token")) IS TRUE)
);

CREATE TABLE "qti"."usage_value" (
  "base_type_lexical" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "text" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  CONSTRAINT "__usage_value_pk_i2ykr2qbnf" PRIMARY KEY ("package", "path", "start")
);

CREATE TABLE "qti"."usage_value_base_type" (
  "base_type" "qti"."base_type" NOT NULL,
  "base_type_lexical" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "text" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  CONSTRAINT "__usage_value_base_type_pk_v6447uyhax" PRIMARY KEY ("package", "path", "start"),
  CONSTRAINT "e_1_derived" CHECK (("qti"."__row_qhnrzprhff"("base_type", "base_type_lexical")) IS TRUE),
  CONSTRAINT "usage_typed_value" CHECK (("base_type" IN (10::smallint, 3::smallint) OR "qti"."__row_odiicdknst"("text", "base_type")) IS TRUE)
);

CREATE TABLE "qti"."variable_ref" (
  "after" "qti"."__text_3dlgl63rv6" NOT NULL,
  "attribute" "qti"."attribute_name" NOT NULL,
  "base_type" "qti"."value_base" NOT NULL,
  "before" "qti"."__text_3dlgl63rv6" NOT NULL,
  "cardinality" "qti"."value_cardinality" NOT NULL,
  "element_base" "qti"."value_base" NOT NULL,
  "element_cardinality" "qti"."value_cardinality" NOT NULL,
  "identifier" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" NOT NULL,
  "language" "qti"."language" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "resolution" "qti"."reference_resolution" NOT NULL,
  "root_kind" "qti"."node_kind" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  CONSTRAINT "__variable_ref_pk_xysknydg4p" PRIMARY KEY ("package", "path", "start", "attribute"),
  CONSTRAINT "e_1_derived" CHECK (("qti"."__row_fbzio7ptsd"("identifier", "root_kind", "base_type", "cardinality", "resolution", "after", "before")) IS TRUE),
  CONSTRAINT "reference_type" CHECK (("attribute" IN (108::smallint, 127::smallint) AND "base_type" = 1::smallint AND "cardinality" = 0::smallint OR "attribute" = 86::smallint OR "resolution" <> 1::smallint) IS TRUE)
);

CREATE TABLE "qti"."variable_ref_table" (
  "attribute" "qti"."attribute_name" NOT NULL,
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "start" "qti"."__domain_gfw43vigph" NOT NULL,
  "table" "qti"."referenced_table" NOT NULL,
  CONSTRAINT "__variable_ref_table_pk_xy5fr2qzjl" PRIMARY KEY ("package", "path", "start", "attribute"),
  CONSTRAINT "e_1_derived" CHECK (("attribute" = 86::smallint) IS TRUE)
);

CREATE TABLE "qti"."xml_decl" (
  "package" "qti"."__text_xv5q2k3cum" NOT NULL,
  "path" "qti"."__text_6zspo66rxv" NOT NULL,
  "version" "qti"."__text_aezrarw5qb" NOT NULL,
  CONSTRAINT "__xml_decl_pk_rlecspusxn" PRIMARY KEY ("package", "path")
);

CREATE TABLE "qti"."__live_secret" ("secret") AS SELECT "pg_catalog"."sha256"("pg_catalog"."uuid_send"("pg_catalog"."gen_random_uuid"()) || "pg_catalog"."uuid_send"("pg_catalog"."gen_random_uuid"()));

REVOKE ALL ON TABLE "qti"."__live_secret" FROM PUBLIC;

ALTER TABLE "qti"."assembled_catalog"
  ADD COLUMN "__image_assembly_4bpgdwmchu" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("assembly")) STORED NOT NULL,
  ADD COLUMN "__image_id_cggscgoxcc" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("id")) STORED NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD CONSTRAINT "__assembled_catalog_pk_b5tgxmgzjo" PRIMARY KEY ("__image_package_x4j5zex3fr", "__image_assembly_4bpgdwmchu", "__image_id_cggscgoxcc");

ALTER TABLE "qti"."assembled_document"
  ADD COLUMN "__pred_instances_jnofs7e7gu" bigint GENERATED ALWAYS AS (CASE WHEN "instances" > 0::bigint THEN "instances"::numeric - (1::bigint)::numeric END) STORED,
  ADD COLUMN "__pred_targets_c5nt4iqzuc" bigint GENERATED ALWAYS AS (CASE WHEN "targets" > 0::bigint THEN "targets"::numeric - (1::bigint)::numeric END) STORED;

ALTER TABLE "qti"."attribute"
  ADD COLUMN "__after_attributes_0_4xdbd7d2wd" "qti"."__attribute_slot_bits_112_aecznthxg5" NOT NULL,
  ADD COLUMN "__before_attributes_0_7ux33ww56a" "qti"."__attribute_slot_bits_112_aecznthxg5" NOT NULL,
  ADD COLUMN "__copy_attributes_yxabddgj5r" bigint NOT NULL,
  ADD COLUMN "__image_idref_text_vbeohhw2sm" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("idref_text")) STORED NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__index_attributes_7arzckayvr" bigint NOT NULL,
  ADD COLUMN "__predecessor_attributes_wqkk3l5mnd" bigint GENERATED ALWAYS AS (CASE WHEN "__index_attributes_7arzckayvr" > 0::bigint THEN "__index_attributes_7arzckayvr"::numeric - (1::bigint)::numeric END) STORED,
  ADD COLUMN "__package_a4p2u7pv6l" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" GENERATED ALWAYS AS (CASE WHEN "kind" IN (51::smallint, 49::smallint, 50::smallint, 40::smallint, 44::smallint, 178::smallint, 69::smallint, 68::smallint, 67::smallint, 61::smallint, 60::smallint, 71::smallint, 72::smallint, 217::smallint, 216::smallint, 180::smallint, 213::smallint, 62::smallint) AND "qti"."__row_2ra54peno7"("lexical", "kind", "name") THEN "package" END) STORED,
  ADD COLUMN "__package_2uyqqvm75y" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" GENERATED ALWAYS AS (CASE WHEN "kind" IN (177::smallint, 176::smallint) AND "name" = 196::smallint OR "kind" IN (164::smallint, 170::smallint) AND "name" = 193::smallint THEN "package" END) STORED,
  ADD COLUMN "__package_zq4aso5g6f" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" GENERATED ALWAYS AS (CASE WHEN "kind" = 88::smallint AND "name" = 86::smallint OR "qti"."__row_otq4lb4uzs"("governor", "name") THEN "package" END) STORED,
  ADD COLUMN "__package_tkzla6ex7r" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" GENERATED ALWAYS AS (CASE WHEN "kind" = 299::smallint AND "name" = 229::smallint THEN "package" END) STORED,
  ADD COLUMN "__package_gw6es3z53z" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" GENERATED ALWAYS AS (CASE WHEN "kind" = 299::smallint AND "name" = 230::smallint THEN "package" END) STORED,
  ADD COLUMN "__pred_idrefs_2kinxrebfw" bigint GENERATED ALWAYS AS (CASE WHEN "idrefs" > 0::bigint THEN "idrefs"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__attribute_key_package_path_start_index_attributes_6cj6mvsxvm" UNIQUE NULLS DISTINCT ("package", "path", "start", "__index_attributes_7arzckayvr"),
  ADD CONSTRAINT "__attribute_key_package_path_start_index_attributes_7vvrfnxvf7" UNIQUE NULLS DISTINCT ("package", "path", "start", "__index_attributes_7arzckayvr", "__after_attributes_0_4xdbd7d2wd"),
  ADD CONSTRAINT "__attribute_key_package_path_start_predecessor_2x7ppgesjy" UNIQUE NULLS DISTINCT ("package", "path", "start", "__predecessor_attributes_wqkk3l5mnd"),
  ADD CONSTRAINT "__attribute_key_package_path_start_mefsvkm3fq" UNIQUE NULLS DISTINCT ("__package_2uyqqvm75y", "path", "start"),
  ADD CONSTRAINT "__attribute_key_package_path_start_54iub2w3d4" UNIQUE NULLS DISTINCT ("__package_zq4aso5g6f", "path", "start"),
  ADD CONSTRAINT "__attribute_key_package_path_ooxw5d3335" UNIQUE NULLS DISTINCT ("__package_tkzla6ex7r", "path"),
  ADD CONSTRAINT "__attribute_key_package_path_pvjib3644a" UNIQUE NULLS DISTINCT ("__package_gw6es3z53z", "path"),
  ADD CONSTRAINT "__attribute_check_attribute_counted_node_attributes_bpdqludy6t" CHECK (("__index_attributes_7arzckayvr" >= 0::bigint AND "__index_attributes_7arzckayvr" < "__copy_attributes_yxabddgj5r") IS TRUE),
  ADD CONSTRAINT "__attribute_check_node_attributes_or_fold_xtgqvby6x6" CHECK ((("__index_attributes_7arzckayvr" > 0::bigint OR "__before_attributes_0_7ux33ww56a" = X'0000000000000000000000000000'::"qti"."__attribute_slot_bits_112_aecznthxg5") AND "__after_attributes_0_4xdbd7d2wd" = "__before_attributes_0_7ux33ww56a" | "slot") IS TRUE);

ALTER TABLE "qti"."binding_name"
  ADD COLUMN "__copy_bindings_bkr36e6zer" bigint NOT NULL,
  ADD COLUMN "__image_identifier_sp263ko24n" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("identifier")) STORED NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__index_bindings_unk6tk2t53" bigint NOT NULL,
  ADD COLUMN "__predecessor_bindings_hnpwjkvxqw" bigint GENERATED ALWAYS AS (CASE WHEN "__index_bindings_unk6tk2t53" > 0::bigint THEN "__index_bindings_unk6tk2t53"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__binding_name_key_package_path_index_bindings_r6nggsduso" UNIQUE NULLS DISTINCT ("package", "path", "__index_bindings_unk6tk2t53"),
  ADD CONSTRAINT "__binding_name_key_package_path_predecessor_bindings_fxgle54zc2" UNIQUE NULLS DISTINCT ("package", "path", "__predecessor_bindings_hnpwjkvxqw"),
  ADD CONSTRAINT "__binding_name_key_image_package_image_path_start_tkesfta3ij" UNIQUE NULLS DISTINCT ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "__image_identifier_sp263ko24n"),
  ADD CONSTRAINT "__binding_name_check_binding_name_counted_document_mdflr7slfc" CHECK (("__index_bindings_unk6tk2t53" >= 0::bigint AND "__index_bindings_unk6tk2t53" < "__copy_bindings_bkr36e6zer") IS TRUE);

ALTER TABLE "qti"."bound_variable"
  ADD COLUMN "__image_identifier_sp263ko24n" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("identifier")) STORED NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__package_pyofn3cand" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" GENERATED ALWAYS AS (CASE WHEN "adaptive" = false AND "attribute" = 76::smallint THEN "package" END) STORED,
  ADD CONSTRAINT "__bound_variable_key_image_package_image_path_start_lvpqp25zsl" UNIQUE NULLS DISTINCT ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "__image_identifier_sp263ko24n"),
  ADD CONSTRAINT "__bound_variable_key_image_package_image_path_image_mrbhbeaqte" UNIQUE NULLS DISTINCT ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "__image_identifier_sp263ko24n");

ALTER TABLE "qti"."catalog_id"
  ADD COLUMN "__image_id_cggscgoxcc" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("id")) STORED NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD CONSTRAINT "__catalog_id_key_image_package_image_path_image_id_jo6pv5zzpp" UNIQUE NULLS DISTINCT ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "__image_id_cggscgoxcc");

ALTER TABLE "qti"."cell_headers"
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__image_token_text_eg2a7htxbl" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("token_text")) STORED NOT NULL,
  ADD COLUMN "__pred_tokens_ip7mlgrtju" bigint GENERATED ALWAYS AS (CASE WHEN "tokens" > 0::bigint THEN "tokens"::numeric - (1::bigint)::numeric END) STORED;

ALTER TABLE "qti"."cell_leaf"
  ADD COLUMN "__copy_leaves_zbyyqc6flc" bigint NOT NULL,
  ADD COLUMN "__pred_at_xktcobhsti" bigint GENERATED ALWAYS AS (CASE WHEN "at" > 0::bigint THEN "at"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__cell_leaf_key_package_path_cell_pred_at_ypuborqf34" UNIQUE NULLS DISTINCT ("package", "path", "cell", "__pred_at_xktcobhsti"),
  ADD CONSTRAINT "__cell_leaf_check_cell_leaf_ordered_math_cell_leaves_rtn2kiuoqf" CHECK (("at" < "__copy_leaves_zbyyqc6flc") IS TRUE);

ALTER TABLE "qti"."choice"
  ADD COLUMN "__copy_choices_6wb56hybwx" bigint NOT NULL,
  ADD COLUMN "__image_identifier_sp263ko24n" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("identifier")) STORED NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__index_choices_u7j4m5lowj" bigint NOT NULL,
  ADD COLUMN "__predecessor_choices_nfvb6gvzzs" bigint GENERATED ALWAYS AS (CASE WHEN "__index_choices_u7j4m5lowj" > 0::bigint THEN "__index_choices_u7j4m5lowj"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__choice_key_package_path_index_choices_nfi2h7amio" UNIQUE NULLS DISTINCT ("package", "path", "__index_choices_u7j4m5lowj"),
  ADD CONSTRAINT "__choice_key_package_path_predecessor_choices_sgzerm3kdb" UNIQUE NULLS DISTINCT ("package", "path", "__predecessor_choices_nfvb6gvzzs"),
  ADD CONSTRAINT "__choice_key_image_package_image_path_start_image_fzsmwth3qu" UNIQUE NULLS DISTINCT ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__image_identifier_sp263ko24n"),
  ADD CONSTRAINT "__choice_check_choice_counted_document_choices_4iujl46hmj" CHECK (("__index_choices_u7j4m5lowj" >= 0::bigint AND "__index_choices_u7j4m5lowj" < "__copy_choices_6wb56hybwx") IS TRUE);

ALTER TABLE "qti"."choice_interaction"
  ADD COLUMN "__copy_choices_trqdfrh73z" bigint NOT NULL,
  ADD COLUMN "__index_choices_5qdn655u6p" bigint NOT NULL,
  ADD COLUMN "__predecessor_choices_pw4quskqli" bigint GENERATED ALWAYS AS (CASE WHEN "__index_choices_5qdn655u6p" > 0::bigint THEN "__index_choices_5qdn655u6p"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__choice_interaction_key_package_interaction_path_lqglabumbc" UNIQUE NULLS DISTINCT ("package", "interaction_path", "interaction", "__index_choices_5qdn655u6p"),
  ADD CONSTRAINT "__choice_interaction_key_package_interaction_path_pjrwzmno7q" UNIQUE NULLS DISTINCT ("package", "interaction_path", "interaction", "__predecessor_choices_pw4quskqli"),
  ADD CONSTRAINT "__choice_interaction_check_choice_interaction_acwsevthlx" CHECK (("__index_choices_5qdn655u6p" >= 0::bigint AND "__index_choices_5qdn655u6p" < "__copy_choices_trqdfrh73z") IS TRUE);

ALTER TABLE "qti"."cn_count" ADD COLUMN "__pred_parts_32uebfen7t" bigint GENERATED ALWAYS AS (CASE WHEN "parts" > 0::bigint THEN "parts"::numeric - (1::bigint)::numeric END) STORED;

ALTER TABLE "qti"."cn_part_text"
  ADD COLUMN "__copy_parts_qitbl7wkbe" bigint NOT NULL,
  ADD COLUMN "__index_parts_jdo2fld5qx" bigint NOT NULL,
  ADD COLUMN "__predecessor_parts_yvk7rmwtkj" bigint GENERATED ALWAYS AS (CASE WHEN "__index_parts_jdo2fld5qx" > 0::bigint THEN "__index_parts_jdo2fld5qx"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__cn_part_text_key_package_path_start_index_parts_5vdus42otu" UNIQUE NULLS DISTINCT ("package", "path", "start", "__index_parts_jdo2fld5qx"),
  ADD CONSTRAINT "__cn_part_text_key_package_path_start_predecessor_sm7ycadrmu" UNIQUE NULLS DISTINCT ("package", "path", "start", "__predecessor_parts_yvk7rmwtkj"),
  ADD CONSTRAINT "__cn_part_text_check_cn_part_text_counted_math_cn_q544ypthce" CHECK (("__index_parts_jdo2fld5qx" >= 0::bigint AND "__index_parts_jdo2fld5qx" < "__copy_parts_qitbl7wkbe") IS TRUE);

ALTER TABLE "qti"."cn_slot"
  ADD COLUMN "__copy_parts_n6gcbnw7dj" bigint NOT NULL,
  ADD COLUMN "__index_parts_vspd7yk6z2" bigint NOT NULL,
  ADD COLUMN "__predecessor_parts_odfdgqim4k" bigint GENERATED ALWAYS AS (CASE WHEN "__index_parts_vspd7yk6z2" > 0::bigint THEN "__index_parts_vspd7yk6z2"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__cn_slot_key_package_path_start_index_parts_dbqcjcnaam" UNIQUE NULLS DISTINCT ("package", "path", "start", "__index_parts_vspd7yk6z2"),
  ADD CONSTRAINT "__cn_slot_key_package_path_start_predecessor_parts_6cbqntaxth" UNIQUE NULLS DISTINCT ("package", "path", "start", "__predecessor_parts_odfdgqim4k"),
  ADD CONSTRAINT "__cn_slot_check_cn_slot_counted_cn_count_parts_jk47k23d37" CHECK (("__index_parts_vspd7yk6z2" >= 0::bigint AND "__index_parts_vspd7yk6z2" < "__copy_parts_n6gcbnw7dj") IS TRUE);

ALTER TABLE "qti"."context_ref"
  ADD COLUMN "__image_identifier_sp263ko24n" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("identifier")) STORED NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD CONSTRAINT "__context_ref_key_image_package_image_path_start_fgiskttgvh" UNIQUE NULLS DISTINCT ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "kind", "assembly_kind", "__image_identifier_sp263ko24n");

ALTER TABLE "qti"."data_ssml_member"
  ADD COLUMN "__image_member_hou44p4stw" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("member")) STORED NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD CONSTRAINT "__data_ssml_member_key_image_package_image_path_azwy4ica7y" UNIQUE NULLS DISTINCT ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "at", "__image_member_hou44p4stw");

ALTER TABLE "qti"."data_ssml_property"
  ADD COLUMN "__image_member_name_qqbvqrei53" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("member_name")) STORED NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL;

ALTER TABLE "qti"."document"
  ADD COLUMN "__pred_bindings_4jwvqtioeb" bigint GENERATED ALWAYS AS (CASE WHEN "bindings" > 0::bigint THEN "bindings"::numeric - (1::bigint)::numeric END) STORED,
  ADD COLUMN "__pred_choices_w4bygwsb7b" bigint GENERATED ALWAYS AS (CASE WHEN "choices" > 0::bigint THEN "choices"::numeric - (1::bigint)::numeric END) STORED,
  ADD COLUMN "__pred_hottexts_qwkebxoneh" bigint GENERATED ALWAYS AS (CASE WHEN "hottexts" > 0::bigint THEN "hottexts"::numeric - (1::bigint)::numeric END) STORED,
  ADD COLUMN "__pred_idref_targets_2hmjkyp3ck" bigint GENERATED ALWAYS AS (CASE WHEN "idref_targets" > 0::bigint THEN "idref_targets"::numeric - (1::bigint)::numeric END) STORED,
  ADD COLUMN "__pred_ids_wdsabmqjb7" bigint GENERATED ALWAYS AS (CASE WHEN "ids" > 0::bigint THEN "ids"::numeric - (1::bigint)::numeric END) STORED,
  ADD COLUMN "__pred_targeted_by_x4imsveco5" bigint GENERATED ALWAYS AS (CASE WHEN "targeted_by" > 0::bigint THEN "targeted_by"::numeric - (1::bigint)::numeric END) STORED,
  ADD COLUMN "__pred_variables_hofq62ycc6" bigint GENERATED ALWAYS AS (CASE WHEN "variables" > 0::bigint THEN "variables"::numeric - (1::bigint)::numeric END) STORED;

ALTER TABLE "qti"."document_id"
  ADD COLUMN "__copy_ids_olm55ckphp" bigint NOT NULL,
  ADD COLUMN "__index_ids_6wzypuy7sz" bigint NOT NULL,
  ADD COLUMN "__predecessor_ids_qwo2em24bw" bigint GENERATED ALWAYS AS (CASE WHEN "__index_ids_6wzypuy7sz" > 0::bigint THEN "__index_ids_6wzypuy7sz"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__document_id_key_package_path_index_ids_sf63vjwwfz" UNIQUE NULLS DISTINCT ("package", "path", "__index_ids_6wzypuy7sz"),
  ADD CONSTRAINT "__document_id_key_package_path_predecessor_ids_sojprelbuz" UNIQUE NULLS DISTINCT ("package", "path", "__predecessor_ids_qwo2em24bw"),
  ADD CONSTRAINT "__document_id_check_document_id_counted_document_ids_i47s6vvqje" CHECK (("__index_ids_6wzypuy7sz" >= 0::bigint AND "__index_ids_6wzypuy7sz" < "__copy_ids_olm55ckphp") IS TRUE);

ALTER TABLE "qti"."feedback_ref"
  ADD COLUMN "__image_identifier_sp263ko24n" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("identifier")) STORED NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD CONSTRAINT "__feedback_ref_key_image_package_image_path_start_hxasaugwry" UNIQUE NULLS DISTINCT ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "kind", "assembly_kind", "__image_identifier_sp263ko24n");

ALTER TABLE "qti"."fragment_context_name"
  ADD COLUMN "__copy_contexts_5a2mmj6flw" bigint NOT NULL,
  ADD COLUMN "__image_identifier_sp263ko24n" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("identifier")) STORED NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__index_contexts_rurifjnewj" bigint NOT NULL,
  ADD COLUMN "__predecessor_contexts_uwyrojdgj7" bigint GENERATED ALWAYS AS (CASE WHEN "__index_contexts_rurifjnewj" > 0::bigint THEN "__index_contexts_rurifjnewj"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__fragment_context_name_key_package_path_index_vcva7sy76v" UNIQUE NULLS DISTINCT ("package", "path", "__index_contexts_rurifjnewj"),
  ADD CONSTRAINT "__fragment_context_name_key_package_path_predecessor_4ip2dcv7tx" UNIQUE NULLS DISTINCT ("package", "path", "__predecessor_contexts_uwyrojdgj7"),
  ADD CONSTRAINT "__fragment_context_name_key_image_package_image_path_3mp6wrb6ag" UNIQUE NULLS DISTINCT ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "kind", "__image_identifier_sp263ko24n"),
  ADD CONSTRAINT "__fragment_context_name_check_fragment_context_name_v73odd4tls" CHECK (("__index_contexts_rurifjnewj" >= 0::bigint AND "__index_contexts_rurifjnewj" < "__copy_contexts_5a2mmj6flw") IS TRUE);

ALTER TABLE "qti"."fragment_context_ref"
  ADD COLUMN "__copy_contexts_aa5iocscdr" bigint NOT NULL,
  ADD COLUMN "__image_identifier_sp263ko24n" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("identifier")) STORED NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__index_contexts_cmwyokypvl" bigint NOT NULL,
  ADD COLUMN "__predecessor_contexts_bio7nxkg5y" bigint GENERATED ALWAYS AS (CASE WHEN "__index_contexts_cmwyokypvl" > 0::bigint THEN "__index_contexts_cmwyokypvl"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__fragment_context_ref_key_package_assembly_instance_iwwx7fd3as" UNIQUE NULLS DISTINCT ("package", "assembly", "instance", "__index_contexts_cmwyokypvl"),
  ADD CONSTRAINT "__fragment_context_ref_key_package_assembly_instance_pj73zlykcq" UNIQUE NULLS DISTINCT ("package", "assembly", "instance", "__predecessor_contexts_bio7nxkg5y"),
  ADD CONSTRAINT "__fragment_context_ref_check_fragment_context_ref_cdoygtbdm2" CHECK (("__index_contexts_cmwyokypvl" >= 0::bigint AND "__index_contexts_cmwyokypvl" < "__copy_contexts_aa5iocscdr") IS TRUE);

ALTER TABLE "qti"."fragment_feedback_name"
  ADD COLUMN "__copy_feedbacks_db37gtjbwl" bigint NOT NULL,
  ADD COLUMN "__image_identifier_sp263ko24n" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("identifier")) STORED NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__index_feedbacks_5unk6hkdlh" bigint NOT NULL,
  ADD COLUMN "__predecessor_feedbacks_mnprabm2zf" bigint GENERATED ALWAYS AS (CASE WHEN "__index_feedbacks_5unk6hkdlh" > 0::bigint THEN "__index_feedbacks_5unk6hkdlh"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__fragment_feedback_name_key_package_path_index_ptaf4a5rcy" UNIQUE NULLS DISTINCT ("package", "path", "__index_feedbacks_5unk6hkdlh"),
  ADD CONSTRAINT "__fragment_feedback_name_key_package_path_hihn4nkoij" UNIQUE NULLS DISTINCT ("package", "path", "__predecessor_feedbacks_mnprabm2zf"),
  ADD CONSTRAINT "__fragment_feedback_name_key_image_package_image_nytmlzi4mh" UNIQUE NULLS DISTINCT ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "kind", "__image_identifier_sp263ko24n"),
  ADD CONSTRAINT "__fragment_feedback_name_check_fragment_feedback_tkbru2mbxa" CHECK (("__index_feedbacks_5unk6hkdlh" >= 0::bigint AND "__index_feedbacks_5unk6hkdlh" < "__copy_feedbacks_db37gtjbwl") IS TRUE);

ALTER TABLE "qti"."fragment_feedback_ref"
  ADD COLUMN "__copy_feedbacks_cywy2j56so" bigint NOT NULL,
  ADD COLUMN "__image_identifier_sp263ko24n" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("identifier")) STORED NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__index_feedbacks_uaqpsnapkw" bigint NOT NULL,
  ADD COLUMN "__predecessor_feedbacks_tqxnj4bnpd" bigint GENERATED ALWAYS AS (CASE WHEN "__index_feedbacks_uaqpsnapkw" > 0::bigint THEN "__index_feedbacks_uaqpsnapkw"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__fragment_feedback_ref_key_package_assembly_hzeb5vdkrv" UNIQUE NULLS DISTINCT ("package", "assembly", "instance", "__index_feedbacks_uaqpsnapkw"),
  ADD CONSTRAINT "__fragment_feedback_ref_key_package_assembly_4ricrcywdl" UNIQUE NULLS DISTINCT ("package", "assembly", "instance", "__predecessor_feedbacks_tqxnj4bnpd"),
  ADD CONSTRAINT "__fragment_feedback_ref_check_fragment_feedback_ref_nwx6de5qkd" CHECK (("__index_feedbacks_uaqpsnapkw" >= 0::bigint AND "__index_feedbacks_uaqpsnapkw" < "__copy_feedbacks_cywy2j56so") IS TRUE);

ALTER TABLE "qti"."fragment_printed_name"
  ADD COLUMN "__copy_prints_t4jfjtgc7d" bigint NOT NULL,
  ADD COLUMN "__image_identifier_sp263ko24n" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("identifier")) STORED NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__index_prints_lrn5xrcnoj" bigint NOT NULL,
  ADD COLUMN "__predecessor_prints_w5l5ryjguo" bigint GENERATED ALWAYS AS (CASE WHEN "__index_prints_lrn5xrcnoj" > 0::bigint THEN "__index_prints_lrn5xrcnoj"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__fragment_printed_name_key_package_path_index_5eg62qthun" UNIQUE NULLS DISTINCT ("package", "path", "__index_prints_lrn5xrcnoj"),
  ADD CONSTRAINT "__fragment_printed_name_key_package_path_predecessor_qtow56dwel" UNIQUE NULLS DISTINCT ("package", "path", "__predecessor_prints_w5l5ryjguo"),
  ADD CONSTRAINT "__fragment_printed_name_key_image_package_image_path_h2qw6bmfig" UNIQUE NULLS DISTINCT ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "kind", "__image_identifier_sp263ko24n"),
  ADD CONSTRAINT "__fragment_printed_name_check_fragment_printed_name_lijfcomjcm" CHECK (("__index_prints_lrn5xrcnoj" >= 0::bigint AND "__index_prints_lrn5xrcnoj" < "__copy_prints_t4jfjtgc7d") IS TRUE);

ALTER TABLE "qti"."fragment_printed_ref"
  ADD COLUMN "__copy_prints_bdawvaisob" bigint NOT NULL,
  ADD COLUMN "__image_identifier_sp263ko24n" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("identifier")) STORED NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__index_prints_4vol45drim" bigint NOT NULL,
  ADD COLUMN "__predecessor_prints_yg4v7qxrwg" bigint GENERATED ALWAYS AS (CASE WHEN "__index_prints_4vol45drim" > 0::bigint THEN "__index_prints_4vol45drim"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__fragment_printed_ref_key_package_assembly_instance_tm3cv67vqp" UNIQUE NULLS DISTINCT ("package", "assembly", "instance", "__index_prints_4vol45drim"),
  ADD CONSTRAINT "__fragment_printed_ref_key_package_assembly_instance_xutrjap2uj" UNIQUE NULLS DISTINCT ("package", "assembly", "instance", "__predecessor_prints_yg4v7qxrwg"),
  ADD CONSTRAINT "__fragment_printed_ref_check_fragment_printed_ref_abdyeetc2n" CHECK (("__index_prints_4vol45drim" >= 0::bigint AND "__index_prints_4vol45drim" < "__copy_prints_bdawvaisob") IS TRUE);

ALTER TABLE "qti"."fragment_scope"
  ADD COLUMN "__pred_contexts_leteqrd4bu" bigint GENERATED ALWAYS AS (CASE WHEN "contexts" > 0::bigint THEN "contexts"::numeric - (1::bigint)::numeric END) STORED,
  ADD COLUMN "__pred_feedbacks_c2txublcan" bigint GENERATED ALWAYS AS (CASE WHEN "feedbacks" > 0::bigint THEN "feedbacks"::numeric - (1::bigint)::numeric END) STORED,
  ADD COLUMN "__pred_prints_uwxz5ocwj4" bigint GENERATED ALWAYS AS (CASE WHEN "prints" > 0::bigint THEN "prints"::numeric - (1::bigint)::numeric END) STORED,
  ADD COLUMN "__pred_templates_5bo5q45wjw" bigint GENERATED ALWAYS AS (CASE WHEN "templates" > 0::bigint THEN "templates"::numeric - (1::bigint)::numeric END) STORED;

ALTER TABLE "qti"."fragment_template_name"
  ADD COLUMN "__copy_templates_xccyy2wmtp" bigint NOT NULL,
  ADD COLUMN "__image_identifier_sp263ko24n" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("identifier")) STORED NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__index_templates_v2kw2euldh" bigint NOT NULL,
  ADD COLUMN "__predecessor_templates_nc6jzzxv73" bigint GENERATED ALWAYS AS (CASE WHEN "__index_templates_v2kw2euldh" > 0::bigint THEN "__index_templates_v2kw2euldh"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__fragment_template_name_key_package_path_index_oudiqn53er" UNIQUE NULLS DISTINCT ("package", "path", "__index_templates_v2kw2euldh"),
  ADD CONSTRAINT "__fragment_template_name_key_package_path_7nr2kxlss4" UNIQUE NULLS DISTINCT ("package", "path", "__predecessor_templates_nc6jzzxv73"),
  ADD CONSTRAINT "__fragment_template_name_key_image_package_image_bimhd6igkd" UNIQUE NULLS DISTINCT ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "kind", "__image_identifier_sp263ko24n"),
  ADD CONSTRAINT "__fragment_template_name_check_fragment_template_55napfsrld" CHECK (("__index_templates_v2kw2euldh" >= 0::bigint AND "__index_templates_v2kw2euldh" < "__copy_templates_xccyy2wmtp") IS TRUE);

ALTER TABLE "qti"."fragment_template_ref"
  ADD COLUMN "__copy_templates_k5hlr5akya" bigint NOT NULL,
  ADD COLUMN "__image_identifier_sp263ko24n" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("identifier")) STORED NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__index_templates_tyl4zqwugp" bigint NOT NULL,
  ADD COLUMN "__predecessor_templates_phvu6yyk7k" bigint GENERATED ALWAYS AS (CASE WHEN "__index_templates_tyl4zqwugp" > 0::bigint THEN "__index_templates_tyl4zqwugp"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__fragment_template_ref_key_package_assembly_3vtxoh5dvi" UNIQUE NULLS DISTINCT ("package", "assembly", "instance", "__index_templates_tyl4zqwugp"),
  ADD CONSTRAINT "__fragment_template_ref_key_package_assembly_ic23um6onc" UNIQUE NULLS DISTINCT ("package", "assembly", "instance", "__predecessor_templates_phvu6yyk7k"),
  ADD CONSTRAINT "__fragment_template_ref_check_fragment_template_ref_atbcyakfoz" CHECK (("__index_templates_tyl4zqwugp" >= 0::bigint AND "__index_templates_tyl4zqwugp" < "__copy_templates_k5hlr5akya") IS TRUE);

ALTER TABLE "qti"."header_token"
  ADD COLUMN "__copy_tokens_vmvzbmawj6" bigint NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__image_pieces_after_nxvecwbwoy" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("pieces_after")) STORED NOT NULL,
  ADD COLUMN "__image_pieces_was_qr42vzdoqq" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("pieces_was")) STORED NOT NULL,
  ADD COLUMN "__image_token_arko66iuth" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("token")) STORED NOT NULL,
  ADD COLUMN "__pred_at_xktcobhsti" bigint GENERATED ALWAYS AS (CASE WHEN "at" > 0::bigint THEN "at"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__header_token_key_package_path_start_pred_at_cd75c4zmnj" UNIQUE NULLS DISTINCT ("package", "path", "start", "__pred_at_xktcobhsti"),
  ADD CONSTRAINT "__header_token_key_image_package_image_path_start_at_4ohc6rrn6m" UNIQUE NULLS DISTINCT ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "at", "__image_pieces_after_nxvecwbwoy"),
  ADD CONSTRAINT "__header_token_key_image_package_image_path_start_az3b6ssmxg" UNIQUE NULLS DISTINCT ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__image_token_arko66iuth"),
  ADD CONSTRAINT "__header_token_check_header_token_ordered_cell_d6xcw4szqv" CHECK (("at" < "__copy_tokens_vmvzbmawj6") IS TRUE);

ALTER TABLE "qti"."hottext"
  ADD COLUMN "__copy_hottexts_b24kbb6m65" bigint NOT NULL,
  ADD COLUMN "__image_identifier_sp263ko24n" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("identifier")) STORED NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__index_hottexts_huxv2shciv" bigint NOT NULL,
  ADD COLUMN "__predecessor_hottexts_imqsc5w56i" bigint GENERATED ALWAYS AS (CASE WHEN "__index_hottexts_huxv2shciv" > 0::bigint THEN "__index_hottexts_huxv2shciv"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__hottext_key_package_path_index_hottexts_24tbfvbp23" UNIQUE NULLS DISTINCT ("package", "path", "__index_hottexts_huxv2shciv"),
  ADD CONSTRAINT "__hottext_key_package_path_predecessor_hottexts_gpj2hclfyb" UNIQUE NULLS DISTINCT ("package", "path", "__predecessor_hottexts_imqsc5w56i"),
  ADD CONSTRAINT "__hottext_key_image_package_image_path_start_image_xui3bxl7u5" UNIQUE NULLS DISTINCT ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__image_identifier_sp263ko24n"),
  ADD CONSTRAINT "__hottext_key_image_package_image_path_image_6kdtjqiwbz" UNIQUE NULLS DISTINCT ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "__image_identifier_sp263ko24n"),
  ADD CONSTRAINT "__hottext_check_hottext_counted_document_hottexts_6an6nanofo" CHECK (("__index_hottexts_huxv2shciv" >= 0::bigint AND "__index_hottexts_huxv2shciv" < "__copy_hottexts_b24kbb6m65") IS TRUE);

ALTER TABLE "qti"."identity_text"
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__image_token_text_eg2a7htxbl" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("token_text")) STORED NOT NULL,
  ADD COLUMN "__pred_tokens_ip7mlgrtju" bigint GENERATED ALWAYS AS (CASE WHEN "tokens" > 0::bigint THEN "tokens"::numeric - (1::bigint)::numeric END) STORED;

ALTER TABLE "qti"."idref"
  ADD COLUMN "__copy_idrefs_tkyc3atjbb" bigint NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__image_pieces_after_nxvecwbwoy" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("pieces_after")) STORED NOT NULL,
  ADD COLUMN "__image_pieces_was_qr42vzdoqq" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("pieces_was")) STORED NOT NULL,
  ADD COLUMN "__image_token_arko66iuth" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("token")) STORED NOT NULL,
  ADD COLUMN "__pred_at_xktcobhsti" bigint GENERATED ALWAYS AS (CASE WHEN "at" > 0::bigint THEN "at"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__idref_key_package_path_start_name_pred_at_k2gcbywk7v" UNIQUE NULLS DISTINCT ("package", "path", "start", "name", "__pred_at_xktcobhsti"),
  ADD CONSTRAINT "__idref_key_image_package_image_path_start_name_at_guizkv6zg2" UNIQUE NULLS DISTINCT ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "name", "at", "__image_pieces_after_nxvecwbwoy"),
  ADD CONSTRAINT "__idref_check_idref_ordered_attribute_idrefs_dngnqz5hg2" CHECK (("at" < "__copy_idrefs_tkyc3atjbb") IS TRUE);

ALTER TABLE "qti"."idref_target"
  ADD COLUMN "__copy_idref_targets_nn7nlmtms6" bigint NOT NULL,
  ADD COLUMN "__image_id_cggscgoxcc" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("id")) STORED NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__index_idref_targets_hoxb6lgv75" bigint NOT NULL,
  ADD COLUMN "__predecessor_idref_targets_3a7kfrknym" bigint GENERATED ALWAYS AS (CASE WHEN "__index_idref_targets_hoxb6lgv75" > 0::bigint THEN "__index_idref_targets_hoxb6lgv75"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__idref_target_pk_jsj2m7b4kd" PRIMARY KEY ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "__image_id_cggscgoxcc"),
  ADD CONSTRAINT "__idref_target_key_package_path_index_idref_targets_su7afnim7y" UNIQUE NULLS DISTINCT ("package", "path", "__index_idref_targets_hoxb6lgv75"),
  ADD CONSTRAINT "__idref_target_key_package_path_predecessor_idref_i4wnpntxzu" UNIQUE NULLS DISTINCT ("package", "path", "__predecessor_idref_targets_3a7kfrknym"),
  ADD CONSTRAINT "__idref_target_check_idref_target_counted_document_ieoj5xme2t" CHECK (("__index_idref_targets_hoxb6lgv75" >= 0::bigint AND "__index_idref_targets_hoxb6lgv75" < "__copy_idref_targets_nn7nlmtms6") IS TRUE);

ALTER TABLE "qti"."instance"
  ADD COLUMN "__copy_instances_o6jtftfowj" bigint NOT NULL,
  ADD COLUMN "__copy_children_x6kra4he2y" bigint NOT NULL,
  ADD COLUMN "__index_instances_x7qgj6n3ho" bigint NOT NULL,
  ADD COLUMN "__predecessor_instances_wr47uilqlc" bigint GENERATED ALWAYS AS (CASE WHEN "__index_instances_x7qgj6n3ho" > 0::bigint THEN "__index_instances_x7qgj6n3ho"::numeric - (1::bigint)::numeric END) STORED,
  ADD COLUMN "__package_capwbknxpj" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" GENERATED ALWAYS AS (CASE WHEN "start" = 0::bigint THEN "package" END) STORED,
  ADD COLUMN "__package_y55am5j6k6" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" GENERATED ALWAYS AS (CASE WHEN "start" > 0::bigint THEN "package" END) STORED,
  ADD COLUMN "__parent_l4ckjnvwat" bigint GENERATED ALWAYS AS (CASE WHEN "start" > 0::bigint THEN "parent" END) STORED,
  ADD COLUMN "__pred_at_xktcobhsti" bigint GENERATED ALWAYS AS (CASE WHEN "at" > 0::bigint THEN "at"::numeric - (1::bigint)::numeric END) STORED,
  ADD COLUMN "__pred_bindings_4jwvqtioeb" bigint GENERATED ALWAYS AS (CASE WHEN "bindings" > 0::bigint THEN "bindings"::numeric - (1::bigint)::numeric END) STORED,
  ADD COLUMN "__pred_children_nrfpkqcaen" bigint GENERATED ALWAYS AS (CASE WHEN "children" > 0::bigint THEN "children"::numeric - (1::bigint)::numeric END) STORED,
  ADD COLUMN "__pred_choices_w4bygwsb7b" bigint GENERATED ALWAYS AS (CASE WHEN "choices" > 0::bigint THEN "choices"::numeric - (1::bigint)::numeric END) STORED,
  ADD COLUMN "__pred_hottexts_qwkebxoneh" bigint GENERATED ALWAYS AS (CASE WHEN "hottexts" > 0::bigint THEN "hottexts"::numeric - (1::bigint)::numeric END) STORED,
  ADD COLUMN "__pred_idref_targets_2hmjkyp3ck" bigint GENERATED ALWAYS AS (CASE WHEN "idref_targets" > 0::bigint THEN "idref_targets"::numeric - (1::bigint)::numeric END) STORED,
  ADD COLUMN "__pred_ids_wdsabmqjb7" bigint GENERATED ALWAYS AS (CASE WHEN "ids" > 0::bigint THEN "ids"::numeric - (1::bigint)::numeric END) STORED,
  ADD COLUMN "__pred_variables_hofq62ycc6" bigint GENERATED ALWAYS AS (CASE WHEN "variables" > 0::bigint THEN "variables"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__instance_key_package_assembly_parent_at_rjuzwko4n2" UNIQUE NULLS DISTINCT ("package", "assembly", "__parent_l4ckjnvwat", "at"),
  ADD CONSTRAINT "__instance_key_package_assembly_parent_at_end_lmrwv23lih" UNIQUE NULLS DISTINCT ("package", "assembly", "__parent_l4ckjnvwat", "at", "end"),
  ADD CONSTRAINT "__instance_key_package_assembly_parent_pred_at_4jeeswzwre" UNIQUE NULLS DISTINCT ("package", "assembly", "__parent_l4ckjnvwat", "__pred_at_xktcobhsti"),
  ADD CONSTRAINT "__instance_key_package_document_index_instances_dzkenbo2iw" UNIQUE NULLS DISTINCT ("package", "document", "__index_instances_x7qgj6n3ho"),
  ADD CONSTRAINT "__instance_key_package_document_predecessor_cq4wbc4ks4" UNIQUE NULLS DISTINCT ("package", "document", "__predecessor_instances_wr47uilqlc"),
  ADD CONSTRAINT "__instance_key_package_document_z4qcwojwcm" UNIQUE NULLS DISTINCT ("__package_capwbknxpj", "document"),
  ADD CONSTRAINT "__instance_key_package_assembly_parent_site_d6xanjcvct" UNIQUE NULLS DISTINCT ("__package_y55am5j6k6", "assembly", "parent", "site"),
  ADD CONSTRAINT "__instance_check_instance_counted_assembled_document_mm6gw32hj4" CHECK (("__index_instances_x7qgj6n3ho" >= 0::bigint AND "__index_instances_x7qgj6n3ho" < "__copy_instances_o6jtftfowj") IS TRUE),
  ADD CONSTRAINT "__instance_check_instance_tree_children_cuixhk4vee" CHECK ((("start" = 0::bigint OR "at" < "__copy_children_x6kra4he2y") AND ("start" > 0::bigint OR "__copy_children_x6kra4he2y" = "children") AND ("parent" = "start" AND "start" = 0::bigint OR "parent" <> "start" AND "start" > 0::bigint) AND ("start" > 0::bigint OR "at" = 0::bigint) AND ("start" = 0::bigint OR "at" > 0::bigint OR "start"::numeric = "parent"::numeric + (1::bigint)::numeric) AND ("end" > "start" AND ("children" > 0::bigint OR "end"::numeric = "start"::numeric + (1::bigint)::numeric))) IS TRUE);

ALTER TABLE "qti"."interaction"
  ADD COLUMN "__pred_choices_w4bygwsb7b" bigint GENERATED ALWAYS AS (CASE WHEN "choices" > 0::bigint THEN "choices"::numeric - (1::bigint)::numeric END) STORED,
  ADD COLUMN "__pred_module_forms_c2s5pqvqs7" bigint GENERATED ALWAYS AS (CASE WHEN "module_forms" > 0::bigint THEN "module_forms"::numeric - (1::bigint)::numeric END) STORED;

ALTER TABLE "qti"."interaction_attribute"
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__image_value_dmndzoe5g5" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("pg_catalog"."btrim"("pg_catalog"."replace"("pg_catalog"."replace"("pg_catalog"."replace"("pg_catalog"."replace"("pg_catalog"."replace"("pg_catalog"."replace"("lexical", E'\t'::"pg_catalog"."text", ' '::"pg_catalog"."text"), E'\n'::"pg_catalog"."text", ' '::"pg_catalog"."text"), E'\r'::"pg_catalog"."text", ' '::"pg_catalog"."text"), '  '::"pg_catalog"."text", E' \t'::"pg_catalog"."text"), E'\t '::"pg_catalog"."text", E'\t\t'::"pg_catalog"."text"), E'\t'::"pg_catalog"."text", ''::"pg_catalog"."text")))) STORED NOT NULL,
  ADD COLUMN "__image_package_exckv5jfmt" "pg_catalog"."bytea" GENERATED ALWAYS AS (CASE WHEN NOT "root_kind" IN (299::smallint, 302::smallint) AND "kind" IN (155::smallint, 13::smallint, 154::smallint, 153::smallint, 156::smallint, 11::smallint, 162::smallint, 114::smallint, 143::smallint, 116::smallint, 200::smallint, 15::smallint, 201::smallint, 185::smallint) AND "name" = 87::smallint AND "qti"."__row_scighrsurf"("lexical") THEN "qti"."__text_digest_2x5x4iwe4m"("package") END) STORED,
  ADD COLUMN "__image_package_ty3wsixbgo" "pg_catalog"."bytea" GENERATED ALWAYS AS (CASE WHEN NOT "root_kind" IN (299::smallint, 302::smallint) AND "kind" IN (115::smallint, 209::smallint, 14::smallint, 97::smallint, 113::smallint) AND "name" = 96::smallint AND "qti"."__row_scighrsurf"("lexical") THEN "qti"."__text_digest_2x5x4iwe4m"("package") END) STORED,
  ADD COLUMN "__image_package_jpnodyqj4e" "pg_catalog"."bytea" GENERATED ALWAYS AS (CASE WHEN NOT "root_kind" IN (299::smallint, 302::smallint) AND ("name" IN (77::smallint, 89::smallint) AND "kind" = 12::smallint OR "kind" = 12::smallint AND "name" = 86::smallint) AND "qti"."__row_scighrsurf"("lexical") THEN "qti"."__text_digest_2x5x4iwe4m"("package") END) STORED,
  ADD COLUMN "__image_package_nyr6mqgwus" "pg_catalog"."bytea" GENERATED ALWAYS AS (CASE WHEN NOT "root_kind" IN (299::smallint, 302::smallint) AND "kind" = 186::smallint AND "name" = 86::smallint AND "qti"."__row_scighrsurf"("lexical") THEN "qti"."__text_digest_2x5x4iwe4m"("package") END) STORED,
  ADD COLUMN "__image_package_ibdsk7qumz" "pg_catalog"."bytea" GENERATED ALWAYS AS (CASE WHEN "kind" IN (155::smallint, 13::smallint, 154::smallint, 153::smallint, 156::smallint, 11::smallint, 162::smallint, 114::smallint, 143::smallint, 116::smallint, 200::smallint, 15::smallint, 201::smallint, 185::smallint) AND "root_kind" IN (299::smallint, 302::smallint) AND "name" = 87::smallint AND "qti"."__row_scighrsurf"("lexical") THEN "qti"."__text_digest_2x5x4iwe4m"("package") END) STORED,
  ADD COLUMN "__image_package_lr7wlxhost" "pg_catalog"."bytea" GENERATED ALWAYS AS (CASE WHEN "kind" IN (133::smallint, 127::smallint, 18::smallint, 118::smallint, 17::smallint, 131::smallint, 119::smallint, 125::smallint, 121::smallint, 123::smallint, 122::smallint, 129::smallint, 16::smallint, 120::smallint, 128::smallint, 130::smallint, 117::smallint, 187::smallint, 124::smallint, 126::smallint, 10::smallint, 132::smallint) AND "name" IN (76::smallint, 78::smallint) AND "qti"."__row_scighrsurf"("lexical") THEN "qti"."__text_digest_2x5x4iwe4m"("package") END) STORED,
  ADD COLUMN "__image_package_5bjgttgjue" "pg_catalog"."bytea" GENERATED ALWAYS AS (CASE WHEN "kind" IN (133::smallint, 127::smallint, 18::smallint, 118::smallint, 17::smallint, 131::smallint, 119::smallint, 125::smallint, 121::smallint, 123::smallint, 122::smallint, 129::smallint, 16::smallint, 120::smallint, 128::smallint, 130::smallint, 117::smallint, 187::smallint, 124::smallint, 126::smallint, 10::smallint, 132::smallint) AND "name" IN (76::smallint, 78::smallint) AND "root_kind" = 299::smallint AND "qti"."__row_scighrsurf"("lexical") THEN "qti"."__text_digest_2x5x4iwe4m"("package") END) STORED,
  ADD COLUMN "__image_package_k2gcvxo2zg" "pg_catalog"."bytea" GENERATED ALWAYS AS (CASE WHEN "kind" IN (115::smallint, 209::smallint, 14::smallint, 97::smallint, 113::smallint) AND "root_kind" IN (299::smallint, 302::smallint) AND "name" = 96::smallint AND "qti"."__row_scighrsurf"("lexical") THEN "qti"."__text_digest_2x5x4iwe4m"("package") END) STORED,
  ADD COLUMN "__image_package_uxpxcua7wm" "pg_catalog"."bytea" GENERATED ALWAYS AS (CASE WHEN "root_kind" IN (299::smallint, 302::smallint) AND ("name" IN (77::smallint, 89::smallint) AND "kind" = 12::smallint OR "kind" = 12::smallint AND "name" = 86::smallint) AND "qti"."__row_scighrsurf"("lexical") THEN "qti"."__text_digest_2x5x4iwe4m"("package") END) STORED,
  ADD COLUMN "__image_package_7tsrkngiba" "pg_catalog"."bytea" GENERATED ALWAYS AS (CASE WHEN "root_kind" IN (299::smallint, 302::smallint) AND "kind" = 186::smallint AND "name" = 86::smallint AND "qti"."__row_scighrsurf"("lexical") THEN "qti"."__text_digest_2x5x4iwe4m"("package") END) STORED,
  ADD COLUMN "__package_baq2s5ijok" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" GENERATED ALWAYS AS (CASE WHEN "pg_catalog"."btrim"("pg_catalog"."replace"("pg_catalog"."replace"("pg_catalog"."replace"("pg_catalog"."replace"("pg_catalog"."replace"("pg_catalog"."replace"("lexical", E'\t'::"pg_catalog"."text", ' '::"pg_catalog"."text"), E'\n'::"pg_catalog"."text", ' '::"pg_catalog"."text"), E'\r'::"pg_catalog"."text", ' '::"pg_catalog"."text"), '  '::"pg_catalog"."text", E' \t'::"pg_catalog"."text"), E'\t '::"pg_catalog"."text", E'\t\t'::"pg_catalog"."text"), E'\t'::"pg_catalog"."text", ''::"pg_catalog"."text")) IN ('1'::"pg_catalog"."text", 'true'::"pg_catalog"."text") AND "kind" = 299::smallint AND "name" = 231::smallint THEN "package" END) STORED,
  ADD CONSTRAINT "__interaction_attribute_key_package_path_d3uq7hzxwt" UNIQUE NULLS DISTINCT ("__package_baq2s5ijok", "path");

ALTER TABLE "qti"."literal"
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__image_text_nik2jnknxc" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("text")) STORED NOT NULL,
  ADD CONSTRAINT "__literal_key_image_package_image_path_start_image_csua32rxru" UNIQUE NULLS DISTINCT ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__image_text_nik2jnknxc", "base_type");

ALTER TABLE "qti"."literal_typed"
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__image_text_nik2jnknxc" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("text")) STORED NOT NULL;

ALTER TABLE "qti"."math_align_group"
  ADD COLUMN "__tag_state_open_hbfhgrpnnf" smallint GENERATED ALWAYS AS (1::smallint) STORED NOT NULL,
  ADD COLUMN "__tag_kind_m_maligngroup_u3ce3cx7aa" smallint GENERATED ALWAYS AS (568::smallint) STORED NOT NULL,
  ADD COLUMN "__copy_groups_stk5ekuyip" bigint NOT NULL,
  ADD COLUMN "__index_groups_ybwzwddeng" bigint NOT NULL,
  ADD COLUMN "__predecessor_groups_6xj7n2r25s" bigint GENERATED ALWAYS AS (CASE WHEN "__index_groups_ybwzwddeng" > 0::bigint THEN "__index_groups_ybwzwddeng"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__math_align_group_key_package_path_cell_index_cwl2hxhbqs" UNIQUE NULLS DISTINCT ("package", "path", "cell", "__index_groups_ybwzwddeng"),
  ADD CONSTRAINT "__math_align_group_key_package_path_cell_predecessor_sv7lp335e4" UNIQUE NULLS DISTINCT ("package", "path", "cell", "__predecessor_groups_6xj7n2r25s"),
  ADD CONSTRAINT "__math_align_group_check_math_align_group_counted_z272yxux7p" CHECK (("__index_groups_ybwzwddeng" >= 0::bigint AND "__index_groups_ybwzwddeng" < "__copy_groups_stk5ekuyip") IS TRUE);

ALTER TABLE "qti"."math_cell"
  ADD COLUMN "__pred_groups_vcil4lo3j4" bigint GENERATED ALWAYS AS (CASE WHEN "groups" > 0::bigint THEN "groups"::numeric - (1::bigint)::numeric END) STORED,
  ADD COLUMN "__pred_leaves_oeq7eporgz" bigint GENERATED ALWAYS AS (CASE WHEN "leaves" > 0::bigint THEN "leaves"::numeric - (1::bigint)::numeric END) STORED;

ALTER TABLE "qti"."math_cn" ADD COLUMN "__pred_parts_32uebfen7t" bigint GENERATED ALWAYS AS (CASE WHEN "parts" > 0::bigint THEN "parts"::numeric - (1::bigint)::numeric END) STORED;

ALTER TABLE "qti"."named"
  ADD COLUMN "__image_identifier_sp263ko24n" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("identifier")) STORED NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD CONSTRAINT "__named_key_image_package_image_path_image_j7g47oy6bo" UNIQUE NULLS DISTINCT ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "__image_identifier_sp263ko24n");

ALTER TABLE "qti"."node"
  ADD COLUMN "__after_children_0_vmaftea6hj" bigint NOT NULL,
  ADD COLUMN "__after_children_0_qbioc6jbat" bigint NOT NULL,
  ADD COLUMN "__before_children_0_qdvwmuycyh" bigint NOT NULL,
  ADD COLUMN "__before_children_0_bs3zgzsr7j" bigint NOT NULL,
  ADD COLUMN "__copy_children_tityo5ij5l" bigint NOT NULL,
  ADD COLUMN "__image_chars_after_5ip2qmnum4" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("chars_after")) STORED NOT NULL,
  ADD COLUMN "__image_chars_was_ygtd7siug2" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("chars_was")) STORED NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__image_string_value_fromrjgqg2" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("string_value")) STORED NOT NULL,
  ADD COLUMN "__package_3taa5kijgy" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" GENERATED ALWAYS AS (CASE WHEN NOT "kind" IN (7::smallint, 1::smallint, 0::smallint, 9::smallint, 8::smallint, 5::smallint, 6::smallint) AND "start" > 0::bigint AND "qti"."__row_vafhk47l2f"("parent_kind", "state") THEN "package" END) STORED,
  ADD COLUMN "__package_p5yblwgnua" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" GENERATED ALWAYS AS (CASE WHEN "kind" IN (133::smallint, 127::smallint, 18::smallint, 118::smallint, 17::smallint, 131::smallint, 119::smallint, 125::smallint, 121::smallint, 123::smallint, 122::smallint, 129::smallint, 16::smallint, 120::smallint, 128::smallint, 130::smallint, 117::smallint, 187::smallint, 124::smallint, 126::smallint, 10::smallint, 132::smallint) AND ("pg_catalog"."bit_count"("ancestry" & X'8000'::"qti"."__flag_bits_16_llpdtzgaon") = 0::bigint) = true THEN "package" END) STORED,
  ADD COLUMN "__package_pzlq2bwqm3" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" GENERATED ALWAYS AS (CASE WHEN "kind" = 638::smallint AND "qti"."__row_tj75r6ek3n"("attrs", "governor") THEN "package" END) STORED,
  ADD COLUMN "__package_lqgfkydq7q" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" GENERATED ALWAYS AS (CASE WHEN "kind" = 183::smallint AND "parent_kind" = 117::smallint THEN "package" END) STORED,
  ADD COLUMN "__parent_l4ckjnvwat" bigint GENERATED ALWAYS AS (CASE WHEN "start" > 0::bigint THEN "parent" END) STORED,
  ADD COLUMN "__pred_at_xktcobhsti" bigint GENERATED ALWAYS AS (CASE WHEN "at" > 0::bigint THEN "at"::numeric - (1::bigint)::numeric END) STORED,
  ADD COLUMN "__pred_attributes_aghx2cqr7s" bigint GENERATED ALWAYS AS (CASE WHEN "attributes" > 0::bigint THEN "attributes"::numeric - (1::bigint)::numeric END) STORED,
  ADD COLUMN "__pred_children_nrfpkqcaen" bigint GENERATED ALWAYS AS (CASE WHEN "children" > 0::bigint THEN "children"::numeric - (1::bigint)::numeric END) STORED,
  ADD COLUMN "__pred_open_attributes_4pd7mwzpyg" bigint GENERATED ALWAYS AS (CASE WHEN "open_attributes" > 0::bigint THEN "open_attributes"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__node_key_package_path_parent_at_nwdop676ro" UNIQUE NULLS DISTINCT ("package", "path", "__parent_l4ckjnvwat", "at"),
  ADD CONSTRAINT "__node_key_package_path_parent_pred_at_e2zyuwfurj" UNIQUE NULLS DISTINCT ("package", "path", "__parent_l4ckjnvwat", "__pred_at_xktcobhsti"),
  ADD CONSTRAINT "__node_key_image_package_image_path_start_image_n7rkgukrvu" UNIQUE NULLS DISTINCT ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__image_string_value_fromrjgqg2"),
  ADD CONSTRAINT "__node_key_image_package_image_path_parent_at_end_zkr2uwgpgd" UNIQUE NULLS DISTINCT ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "__parent_l4ckjnvwat", "at", "end", "__after_children_0_qbioc6jbat", "__after_children_0_vmaftea6hj", "elements", "__image_chars_after_5ip2qmnum4", "state"),
  ADD CONSTRAINT "__node_key_package_path_parent_state_djsbcozcyq" UNIQUE NULLS DISTINCT ("__package_3taa5kijgy", "path", "parent", "state"),
  ADD CONSTRAINT "__node_key_package_path_start_dn7spvnjad" UNIQUE NULLS DISTINCT ("__package_p5yblwgnua", "path", "start"),
  ADD CONSTRAINT "__node_key_package_path_start_7m4qykmkxg" UNIQUE NULLS DISTINCT ("__package_pzlq2bwqm3", "path", "start"),
  ADD CONSTRAINT "__node_key_package_path_parent_jhawkbuquo" UNIQUE NULLS DISTINCT ("__package_lqgfkydq7q", "path", "parent"),
  ADD CONSTRAINT "__node_check_node_children_count_fold_igxdzwlhcu" CHECK ((("at" > 0::bigint OR "__before_children_0_bs3zgzsr7j" = 0::bigint) AND ("children" > 0::bigint OR "barred_children" = 0::bigint) AND "qti"."__row_zfbcuk4gtg"("kind", "parent_kind", "state", "start", "__after_children_0_qbioc6jbat", "__before_children_0_bs3zgzsr7j")) IS TRUE),
  ADD CONSTRAINT "__node_check_node_children_count_fold_qmksp5dp7i" CHECK ((("at" > 0::bigint OR "__before_children_0_qdvwmuycyh" = 0::bigint) AND ("children" > 0::bigint OR "counted_children" = 0::bigint) AND "qti"."__row_o63nenvexz"("kind", "parent_kind", "state", "start", "__after_children_0_vmaftea6hj", "__before_children_0_qdvwmuycyh")) IS TRUE),
  ADD CONSTRAINT "__node_check_node_tree_children_odpafljdfb" CHECK ((("start" = 0::bigint OR "at" < "__copy_children_tityo5ij5l") AND ("start" > 0::bigint OR "__copy_children_tityo5ij5l" = "children") AND ("parent" = "start" AND "start" = 0::bigint OR "parent" <> "start" AND "start" > 0::bigint) AND ("start" > 0::bigint OR "at" = 0::bigint) AND ("start" = 0::bigint OR "at" > 0::bigint OR "start"::numeric = "parent"::numeric + (1::bigint)::numeric) AND ("end" > "start" AND ("children" > 0::bigint OR "end"::numeric = "start"::numeric + (1::bigint)::numeric))) IS TRUE);

ALTER TABLE "qti"."numbered_reading"
  ADD COLUMN "__image_assembly_4bpgdwmchu" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("assembly")) STORED NOT NULL,
  ADD COLUMN "__image_number_6nbw63u3ji" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("number")) STORED NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD CONSTRAINT "__numbered_reading_pk_vrnabdsgjr" PRIMARY KEY ("__image_package_x4j5zex3fr", "__image_assembly_4bpgdwmchu", "__image_path_ff7ysgcuo3", "start", "attribute", "scope_instance", "scope", "__image_number_6nbw63u3ji");

ALTER TABLE "qti"."open_attribute"
  ADD COLUMN "__copy_open_attributes_fpnvcvdmpf" bigint NOT NULL,
  ADD COLUMN "__index_open_attributes_hgy2tjkow2" bigint NOT NULL,
  ADD COLUMN "__predecessor_open_attributes_rrtw7d24a5" bigint GENERATED ALWAYS AS (CASE WHEN "__index_open_attributes_hgy2tjkow2" > 0::bigint THEN "__index_open_attributes_hgy2tjkow2"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__open_attribute_key_package_path_start_index_open_z6aawsoy6g" UNIQUE NULLS DISTINCT ("package", "path", "start", "__index_open_attributes_hgy2tjkow2"),
  ADD CONSTRAINT "__open_attribute_key_package_path_start_predecessor_os5w2cwpyl" UNIQUE NULLS DISTINCT ("package", "path", "start", "__predecessor_open_attributes_rrtw7d24a5"),
  ADD CONSTRAINT "__open_attribute_check_open_attribute_counted_node_nyu4tiwgdg" CHECK (("__index_open_attributes_hgy2tjkow2" >= 0::bigint AND "__index_open_attributes_hgy2tjkow2" < "__copy_open_attributes_fpnvcvdmpf") IS TRUE);

ALTER TABLE "qti"."pci_module_form"
  ADD COLUMN "__copy_module_forms_hwpic65mty" bigint NOT NULL,
  ADD COLUMN "__index_module_forms_wydm354elh" bigint NOT NULL,
  ADD COLUMN "__predecessor_module_forms_dauym75voc" bigint GENERATED ALWAYS AS (CASE WHEN "__index_module_forms_wydm354elh" > 0::bigint THEN "__index_module_forms_wydm354elh"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__pci_module_form_key_package_path_start_index_jloyddgmsp" UNIQUE NULLS DISTINCT ("package", "path", "start", "__index_module_forms_wydm354elh"),
  ADD CONSTRAINT "__pci_module_form_key_package_path_start_predecessor_v3gzsahjpb" UNIQUE NULLS DISTINCT ("package", "path", "start", "__predecessor_module_forms_dauym75voc"),
  ADD CONSTRAINT "__pci_module_form_check_pci_module_form_counted_dvbz7vgyvn" CHECK (("__index_module_forms_wydm354elh" >= 0::bigint AND "__index_module_forms_wydm354elh" < "__copy_module_forms_hwpic65mty") IS TRUE);

ALTER TABLE "qti"."placed_binding"
  ADD COLUMN "__copy_bindings_i7fid7zclc" bigint NOT NULL,
  ADD COLUMN "__image_assembly_4bpgdwmchu" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("assembly")) STORED NOT NULL,
  ADD COLUMN "__image_identifier_sp263ko24n" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("identifier")) STORED NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__index_bindings_oyr3fiahr3" bigint NOT NULL,
  ADD COLUMN "__predecessor_bindings_ntcwoepfst" bigint GENERATED ALWAYS AS (CASE WHEN "__index_bindings_oyr3fiahr3" > 0::bigint THEN "__index_bindings_oyr3fiahr3"::numeric - (1::bigint)::numeric END) STORED,
  ADD COLUMN "__package_pyofn3cand" "pg_catalog"."text" COLLATE "pg_catalog"."pg_c_utf8" GENERATED ALWAYS AS (CASE WHEN "adaptive" = false AND "attribute" = 76::smallint THEN "package" END) STORED,
  ADD CONSTRAINT "__placed_binding_key_package_assembly_instance_index_rw745ssmul" UNIQUE NULLS DISTINCT ("package", "assembly", "instance", "__index_bindings_oyr3fiahr3"),
  ADD CONSTRAINT "__placed_binding_key_package_assembly_instance_prcf6gxoan" UNIQUE NULLS DISTINCT ("package", "assembly", "instance", "__predecessor_bindings_ntcwoepfst"),
  ADD CONSTRAINT "__placed_binding_key_image_package_image_assembly_dw4koa3dyn" UNIQUE NULLS DISTINCT ("__image_package_x4j5zex3fr", "__image_assembly_4bpgdwmchu", "__image_identifier_sp263ko24n"),
  ADD CONSTRAINT "__placed_binding_check_placed_binding_counted_y4bnwgxb67" CHECK (("__index_bindings_oyr3fiahr3" >= 0::bigint AND "__index_bindings_oyr3fiahr3" < "__copy_bindings_i7fid7zclc") IS TRUE);

ALTER TABLE "qti"."placed_choice"
  ADD COLUMN "__copy_choices_wxxtuahand" bigint NOT NULL,
  ADD COLUMN "__image_identifier_sp263ko24n" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("identifier")) STORED NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__index_choices_ktdrfnqsrr" bigint NOT NULL,
  ADD COLUMN "__predecessor_choices_uwibywwdhh" bigint GENERATED ALWAYS AS (CASE WHEN "__index_choices_ktdrfnqsrr" > 0::bigint THEN "__index_choices_ktdrfnqsrr"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__placed_choice_key_package_assembly_instance_index_k3zshn6wrl" UNIQUE NULLS DISTINCT ("package", "assembly", "instance", "__index_choices_ktdrfnqsrr"),
  ADD CONSTRAINT "__placed_choice_key_package_assembly_instance_5rxktl6n2n" UNIQUE NULLS DISTINCT ("package", "assembly", "instance", "__predecessor_choices_uwibywwdhh"),
  ADD CONSTRAINT "__placed_choice_check_placed_choice_counted_instance_p77ar7qzt4" CHECK (("__index_choices_ktdrfnqsrr" >= 0::bigint AND "__index_choices_ktdrfnqsrr" < "__copy_choices_wxxtuahand") IS TRUE);

ALTER TABLE "qti"."placed_hottext"
  ADD COLUMN "__copy_hottexts_md2dcayyk4" bigint NOT NULL,
  ADD COLUMN "__image_assembly_4bpgdwmchu" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("assembly")) STORED NOT NULL,
  ADD COLUMN "__image_identifier_sp263ko24n" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("identifier")) STORED NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__index_hottexts_tdyulq7odh" bigint NOT NULL,
  ADD COLUMN "__predecessor_hottexts_4uwo3bx7x2" bigint GENERATED ALWAYS AS (CASE WHEN "__index_hottexts_tdyulq7odh" > 0::bigint THEN "__index_hottexts_tdyulq7odh"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__placed_hottext_key_package_assembly_instance_index_6japq2avdu" UNIQUE NULLS DISTINCT ("package", "assembly", "instance", "__index_hottexts_tdyulq7odh"),
  ADD CONSTRAINT "__placed_hottext_key_package_assembly_instance_6nv2oy2lqi" UNIQUE NULLS DISTINCT ("package", "assembly", "instance", "__predecessor_hottexts_4uwo3bx7x2"),
  ADD CONSTRAINT "__placed_hottext_key_image_package_image_assembly_pkkbf5bmdt" UNIQUE NULLS DISTINCT ("__image_package_x4j5zex3fr", "__image_assembly_4bpgdwmchu", "__image_identifier_sp263ko24n"),
  ADD CONSTRAINT "__placed_hottext_check_placed_hottext_counted_76ts7bnxah" CHECK (("__index_hottexts_tdyulq7odh" >= 0::bigint AND "__index_hottexts_tdyulq7odh" < "__copy_hottexts_md2dcayyk4") IS TRUE);

ALTER TABLE "qti"."placed_id"
  ADD COLUMN "__copy_ids_tljj3gujvw" bigint NOT NULL,
  ADD COLUMN "__index_ids_ojwjtnxm2y" bigint NOT NULL,
  ADD COLUMN "__predecessor_ids_rtodazzhin" bigint GENERATED ALWAYS AS (CASE WHEN "__index_ids_ojwjtnxm2y" > 0::bigint THEN "__index_ids_ojwjtnxm2y"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__placed_id_key_package_assembly_instance_index_ids_mcwlm72pbw" UNIQUE NULLS DISTINCT ("package", "assembly", "instance", "__index_ids_ojwjtnxm2y"),
  ADD CONSTRAINT "__placed_id_key_package_assembly_instance_jflttt7jot" UNIQUE NULLS DISTINCT ("package", "assembly", "instance", "__predecessor_ids_rtodazzhin"),
  ADD CONSTRAINT "__placed_id_check_placed_id_counted_instance_ids_ioh5khi7rn" CHECK (("__index_ids_ojwjtnxm2y" >= 0::bigint AND "__index_ids_ojwjtnxm2y" < "__copy_ids_tljj3gujvw") IS TRUE);

ALTER TABLE "qti"."placed_idref"
  ADD COLUMN "__copy_idref_targets_cv65ds7nu7" bigint NOT NULL,
  ADD COLUMN "__image_assembly_4bpgdwmchu" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("assembly")) STORED NOT NULL,
  ADD COLUMN "__image_id_cggscgoxcc" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("id")) STORED NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__index_idref_targets_fjkkfgwwk3" bigint NOT NULL,
  ADD COLUMN "__predecessor_idref_targets_rgsj76jpds" bigint GENERATED ALWAYS AS (CASE WHEN "__index_idref_targets_fjkkfgwwk3" > 0::bigint THEN "__index_idref_targets_fjkkfgwwk3"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__placed_idref_pk_457qtpabdq" PRIMARY KEY ("__image_package_x4j5zex3fr", "__image_assembly_4bpgdwmchu", "instance", "__image_id_cggscgoxcc"),
  ADD CONSTRAINT "__placed_idref_key_package_assembly_instance_index_s62mjbr4qm" UNIQUE NULLS DISTINCT ("package", "assembly", "instance", "__index_idref_targets_fjkkfgwwk3"),
  ADD CONSTRAINT "__placed_idref_key_package_assembly_instance_i65oxm7bvf" UNIQUE NULLS DISTINCT ("package", "assembly", "instance", "__predecessor_idref_targets_rgsj76jpds"),
  ADD CONSTRAINT "__placed_idref_check_placed_idref_counted_instance_klniarooko" CHECK (("__index_idref_targets_fjkkfgwwk3" >= 0::bigint AND "__index_idref_targets_fjkkfgwwk3" < "__copy_idref_targets_cv65ds7nu7") IS TRUE);

ALTER TABLE "qti"."placed_share_target"
  ADD COLUMN "__copy_placements_iadanzgnox" bigint NOT NULL,
  ADD COLUMN "__image_id_cggscgoxcc" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("id")) STORED NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__imagecopy_id_yb43zw5kj3" "pg_catalog"."bytea" NOT NULL,
  ADD COLUMN "__imagecopy_package_4oudcg2ick" "pg_catalog"."bytea" NOT NULL,
  ADD COLUMN "__imagecopy_path_2uz6mcb5mg" "pg_catalog"."bytea" NOT NULL,
  ADD COLUMN "__index_placements_n77jrjkfw2" bigint NOT NULL,
  ADD COLUMN "__predecessor_placements_ppbi3jzzws" bigint GENERATED ALWAYS AS (CASE WHEN "__index_placements_n77jrjkfw2" > 0::bigint THEN "__index_placements_n77jrjkfw2"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__placed_share_target_key_package_path_start_index_rf42kjvj6r" UNIQUE NULLS DISTINCT ("package", "path", "start", "__index_placements_n77jrjkfw2"),
  ADD CONSTRAINT "__placed_share_target_key_package_path_start_s5ueouerl5" UNIQUE NULLS DISTINCT ("package", "path", "start", "__predecessor_placements_ppbi3jzzws"),
  ADD CONSTRAINT "__placed_share_target_check_placed_share_target_cwmdmabbb2" CHECK ((("__index_placements_n77jrjkfw2" >= 0::bigint AND "__index_placements_n77jrjkfw2" < "__copy_placements_iadanzgnox") AND "__imagecopy_package_4oudcg2ick" = "__image_package_x4j5zex3fr" AND "__imagecopy_path_2uz6mcb5mg" = "__image_path_ff7ysgcuo3" AND "__imagecopy_id_yb43zw5kj3" = "__image_id_cggscgoxcc") IS TRUE);

ALTER TABLE "qti"."placed_variable_ref"
  ADD COLUMN "__copy_variables_wwybb3cjse" bigint NOT NULL,
  ADD COLUMN "__image_identifier_sp263ko24n" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("identifier")) STORED NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__index_variables_efcmle332h" bigint NOT NULL,
  ADD COLUMN "__predecessor_variables_5pxq25fpsp" bigint GENERATED ALWAYS AS (CASE WHEN "__index_variables_efcmle332h" > 0::bigint THEN "__index_variables_efcmle332h"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__placed_variable_ref_key_package_assembly_instance_52t2jfjb6a" UNIQUE NULLS DISTINCT ("package", "assembly", "instance", "__index_variables_efcmle332h"),
  ADD CONSTRAINT "__placed_variable_ref_key_package_assembly_instance_5npov272n5" UNIQUE NULLS DISTINCT ("package", "assembly", "instance", "__predecessor_variables_5pxq25fpsp"),
  ADD CONSTRAINT "__placed_variable_ref_check_placed_variable_ref_sjkxwovwgd" CHECK (("__index_variables_efcmle332h" >= 0::bigint AND "__index_variables_efcmle332h" < "__copy_variables_wwybb3cjse") IS TRUE);

ALTER TABLE "qti"."printed_variable_ref"
  ADD COLUMN "__image_identifier_sp263ko24n" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("identifier")) STORED NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD CONSTRAINT "__printed_variable_ref_key_image_package_image_path_qqgbbqxknt" UNIQUE NULLS DISTINCT ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "kind", "assembly_kind", "__image_identifier_sp263ko24n");

ALTER TABLE "qti"."referring_document"
  ADD COLUMN "__pred_contexts_leteqrd4bu" bigint GENERATED ALWAYS AS (CASE WHEN "contexts" > 0::bigint THEN "contexts"::numeric - (1::bigint)::numeric END) STORED,
  ADD COLUMN "__pred_feedbacks_c2txublcan" bigint GENERATED ALWAYS AS (CASE WHEN "feedbacks" > 0::bigint THEN "feedbacks"::numeric - (1::bigint)::numeric END) STORED,
  ADD COLUMN "__pred_prints_uwxz5ocwj4" bigint GENERATED ALWAYS AS (CASE WHEN "prints" > 0::bigint THEN "prints"::numeric - (1::bigint)::numeric END) STORED,
  ADD COLUMN "__pred_templates_5bo5q45wjw" bigint GENERATED ALWAYS AS (CASE WHEN "templates" > 0::bigint THEN "templates"::numeric - (1::bigint)::numeric END) STORED;

ALTER TABLE "qti"."rounding_figures"
  ADD COLUMN "__image_figures_sc25qjl32r" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("pg_catalog"."btrim"("pg_catalog"."replace"("pg_catalog"."replace"("pg_catalog"."replace"("pg_catalog"."replace"("pg_catalog"."replace"("pg_catalog"."replace"("figures_lexical", E'\t'::"pg_catalog"."text", ' '::"pg_catalog"."text"), E'\n'::"pg_catalog"."text", ' '::"pg_catalog"."text"), E'\r'::"pg_catalog"."text", ' '::"pg_catalog"."text"), '  '::"pg_catalog"."text", E' \t'::"pg_catalog"."text"), E'\t '::"pg_catalog"."text", E'\t\t'::"pg_catalog"."text"), E'\t'::"pg_catalog"."text", ''::"pg_catalog"."text")))) STORED NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD CONSTRAINT "__rounding_figures_key_image_package_image_path_7bukk4qsx4" UNIQUE NULLS DISTINCT ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__image_figures_sc25qjl32r");

ALTER TABLE "qti"."rounding_mode_figures"
  ADD COLUMN "__image_figures_sc25qjl32r" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("figures")) STORED NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL;

ALTER TABLE "qti"."share_fragment"
  ADD COLUMN "__image_id_cggscgoxcc" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("id")) STORED NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__pred_placements_wtijf47h4h" bigint GENERATED ALWAYS AS (CASE WHEN "placements" > 0::bigint THEN "placements"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__share_fragment_key_image_package_image_path_start_niyy4fhrc2" UNIQUE NULLS DISTINCT ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "placements", "__image_id_cggscgoxcc");

ALTER TABLE "qti"."site_target"
  ADD COLUMN "__after_targets_0_nsiq3pfnvg" bigint NOT NULL,
  ADD COLUMN "__after_targeted_by_0_rsywbgrrjw" "qti"."__flag_bits_16_llpdtzgaon" NOT NULL,
  ADD COLUMN "__before_targets_0_lktd4cazrk" bigint NOT NULL,
  ADD COLUMN "__before_targeted_by_0_3lfv2ygldm" "qti"."__flag_bits_16_llpdtzgaon" NOT NULL,
  ADD COLUMN "__copy_targets_xc5togcb7o" bigint NOT NULL,
  ADD COLUMN "__copy_targeted_by_dnrpkr6fx2" bigint NOT NULL,
  ADD COLUMN "__index_targets_i7nnrmzfkn" bigint NOT NULL,
  ADD COLUMN "__index_targeted_by_zcbbdfk6qk" bigint NOT NULL,
  ADD COLUMN "__predecessor_targets_rlmzypy6bt" bigint GENERATED ALWAYS AS (CASE WHEN "__index_targets_i7nnrmzfkn" > 0::bigint THEN "__index_targets_i7nnrmzfkn"::numeric - (1::bigint)::numeric END) STORED,
  ADD COLUMN "__predecessor_targeted_by_xvlpywmmd3" bigint GENERATED ALWAYS AS (CASE WHEN "__index_targeted_by_zcbbdfk6qk" > 0::bigint THEN "__index_targeted_by_zcbbdfk6qk"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__site_target_key_package_path_index_targets_fuqqcc23wl" UNIQUE NULLS DISTINCT ("package", "path", "__index_targets_i7nnrmzfkn"),
  ADD CONSTRAINT "__site_target_key_package_path_index_targets_after_kxfmsfayyz" UNIQUE NULLS DISTINCT ("package", "path", "__index_targets_i7nnrmzfkn", "__after_targets_0_nsiq3pfnvg"),
  ADD CONSTRAINT "__site_target_key_package_path_predecessor_targets_6qaxjr4qpb" UNIQUE NULLS DISTINCT ("package", "path", "__predecessor_targets_rlmzypy6bt"),
  ADD CONSTRAINT "__site_target_key_package_target_index_targeted_by_djiurheeeu" UNIQUE NULLS DISTINCT ("package", "target", "__index_targeted_by_zcbbdfk6qk"),
  ADD CONSTRAINT "__site_target_key_package_target_index_targeted_by_cjbgdj2smu" UNIQUE NULLS DISTINCT ("package", "target", "__index_targeted_by_zcbbdfk6qk", "__after_targeted_by_0_rsywbgrrjw"),
  ADD CONSTRAINT "__site_target_key_package_target_predecessor_du2dhelnpq" UNIQUE NULLS DISTINCT ("package", "target", "__predecessor_targeted_by_xvlpywmmd3"),
  ADD CONSTRAINT "__site_target_check_site_target_counted_assembled_6ojqzgtd2t" CHECK (("__index_targets_i7nnrmzfkn" >= 0::bigint AND "__index_targets_i7nnrmzfkn" < "__copy_targets_xc5togcb7o") IS TRUE),
  ADD CONSTRAINT "__site_target_check_site_target_counted_document_kfrthg33zp" CHECK (("__index_targeted_by_zcbbdfk6qk" >= 0::bigint AND "__index_targeted_by_zcbbdfk6qk" < "__copy_targeted_by_dnrpkr6fx2") IS TRUE),
  ADD CONSTRAINT "__site_target_check_assembled_document_targets_count_rhi722csjd" CHECK ((("__index_targets_i7nnrmzfkn" > 0::bigint OR "__before_targets_0_lktd4cazrk" = 0::bigint) AND CASE WHEN "places" = true THEN "__after_targets_0_nsiq3pfnvg"::numeric = "__before_targets_0_lktd4cazrk"::numeric + (1::bigint)::numeric ELSE "__after_targets_0_nsiq3pfnvg" = "__before_targets_0_lktd4cazrk" END) IS TRUE),
  ADD CONSTRAINT "__site_target_check_document_targeted_by_or_fold_s2xbwdcrnh" CHECK ((("__index_targeted_by_zcbbdfk6qk" > 0::bigint OR "__before_targeted_by_0_3lfv2ygldm" = X'0000'::"qti"."__flag_bits_16_llpdtzgaon") AND "__after_targeted_by_0_rsywbgrrjw" = "__before_targeted_by_0_3lfv2ygldm" | "ancestry") IS TRUE);

ALTER TABLE "qti"."srcset"
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__image_token_text_eg2a7htxbl" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("token_text")) STORED NOT NULL,
  ADD COLUMN "__pred_tokens_ip7mlgrtju" bigint GENERATED ALWAYS AS (CASE WHEN "tokens" > 0::bigint THEN "tokens"::numeric - (1::bigint)::numeric END) STORED;

ALTER TABLE "qti"."srcset_candidate"
  ADD COLUMN "__copy_tokens_mhv3zj45jr" bigint NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__image_pieces_after_nxvecwbwoy" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("pieces_after")) STORED NOT NULL,
  ADD COLUMN "__image_pieces_was_qr42vzdoqq" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("pieces_was")) STORED NOT NULL,
  ADD COLUMN "__pred_at_xktcobhsti" bigint GENERATED ALWAYS AS (CASE WHEN "at" > 0::bigint THEN "at"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__srcset_candidate_key_package_path_start_pred_at_jpgatxsojn" UNIQUE NULLS DISTINCT ("package", "path", "start", "__pred_at_xktcobhsti"),
  ADD CONSTRAINT "__srcset_candidate_key_image_package_image_path_ot2j6nmhvh" UNIQUE NULLS DISTINCT ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "at", "__image_pieces_after_nxvecwbwoy"),
  ADD CONSTRAINT "__srcset_candidate_check_srcset_candidate_ordered_muwkwohqto" CHECK (("at" < "__copy_tokens_mhv3zj45jr") IS TRUE);

ALTER TABLE "qti"."stimulus_ref"
  ADD COLUMN "__image_identifier_sp263ko24n" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("identifier")) STORED NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD CONSTRAINT "__stimulus_ref_key_image_package_image_path_image_fzmb546llm" UNIQUE NULLS DISTINCT ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "__image_identifier_sp263ko24n");

ALTER TABLE "qti"."template_ref"
  ADD COLUMN "__image_identifier_sp263ko24n" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("identifier")) STORED NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD CONSTRAINT "__template_ref_key_image_package_image_path_start_z7dipujcgj" UNIQUE NULLS DISTINCT ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "kind", "assembly_kind", "__image_identifier_sp263ko24n");

ALTER TABLE "qti"."text_idref"
  ADD COLUMN "__copy_tokens_rrsly23qzp" bigint NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__image_pieces_after_nxvecwbwoy" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("pieces_after")) STORED NOT NULL,
  ADD COLUMN "__image_pieces_was_qr42vzdoqq" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("pieces_was")) STORED NOT NULL,
  ADD COLUMN "__image_token_arko66iuth" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("token")) STORED NOT NULL,
  ADD COLUMN "__pred_at_xktcobhsti" bigint GENERATED ALWAYS AS (CASE WHEN "at" > 0::bigint THEN "at"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__text_idref_key_package_path_start_pred_at_bulfzlj2w4" UNIQUE NULLS DISTINCT ("package", "path", "start", "__pred_at_xktcobhsti"),
  ADD CONSTRAINT "__text_idref_key_image_package_image_path_start_at_qqlodcuhdx" UNIQUE NULLS DISTINCT ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "at", "__image_pieces_after_nxvecwbwoy"),
  ADD CONSTRAINT "__text_idref_check_text_idref_ordered_identity_text_j6a2rgc35g" CHECK (("at" < "__copy_tokens_rrsly23qzp") IS TRUE);

ALTER TABLE "qti"."tolerance"
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__image_token_text_eg2a7htxbl" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("token_text")) STORED NOT NULL,
  ADD COLUMN "__pred_tokens_ip7mlgrtju" bigint GENERATED ALWAYS AS (CASE WHEN "tokens" > 0::bigint THEN "tokens"::numeric - (1::bigint)::numeric END) STORED;

ALTER TABLE "qti"."tolerance_token"
  ADD COLUMN "__copy_tokens_zlo7jvsicr" bigint NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__image_pieces_after_nxvecwbwoy" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("pieces_after")) STORED NOT NULL,
  ADD COLUMN "__image_pieces_was_qr42vzdoqq" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("pieces_was")) STORED NOT NULL,
  ADD COLUMN "__pred_at_xktcobhsti" bigint GENERATED ALWAYS AS (CASE WHEN "at" > 0::bigint THEN "at"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__tolerance_token_key_package_path_start_pred_at_mza72eqsyy" UNIQUE NULLS DISTINCT ("package", "path", "start", "__pred_at_xktcobhsti"),
  ADD CONSTRAINT "__tolerance_token_key_image_package_image_path_start_zaociyb3ck" UNIQUE NULLS DISTINCT ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "at", "__image_pieces_after_nxvecwbwoy"),
  ADD CONSTRAINT "__tolerance_token_check_tolerance_token_ordered_sre6vd24dn" CHECK (("at" < "__copy_tokens_zlo7jvsicr") IS TRUE);

ALTER TABLE "qti"."usage_value"
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__image_text_nik2jnknxc" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("text")) STORED NOT NULL;

ALTER TABLE "qti"."usage_value_base_type"
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__image_text_nik2jnknxc" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("text")) STORED NOT NULL;

ALTER TABLE "qti"."variable_ref"
  ADD COLUMN "__copy_variables_7dc76fdnq4" bigint NOT NULL,
  ADD COLUMN "__image_identifier_sp263ko24n" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("identifier")) STORED NOT NULL,
  ADD COLUMN "__image_package_x4j5zex3fr" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("package")) STORED NOT NULL,
  ADD COLUMN "__image_path_ff7ysgcuo3" "pg_catalog"."bytea" GENERATED ALWAYS AS ("qti"."__text_digest_2x5x4iwe4m"("path")) STORED NOT NULL,
  ADD COLUMN "__index_variables_7hpd35redf" bigint NOT NULL,
  ADD COLUMN "__predecessor_variables_bn3p347xvh" bigint GENERATED ALWAYS AS (CASE WHEN "__index_variables_7hpd35redf" > 0::bigint THEN "__index_variables_7hpd35redf"::numeric - (1::bigint)::numeric END) STORED,
  ADD CONSTRAINT "__variable_ref_key_package_path_index_variables_l7ahngb5zk" UNIQUE NULLS DISTINCT ("package", "path", "__index_variables_7hpd35redf"),
  ADD CONSTRAINT "__variable_ref_key_package_path_predecessor_qg2qiu7er7" UNIQUE NULLS DISTINCT ("package", "path", "__predecessor_variables_bn3p347xvh"),
  ADD CONSTRAINT "__variable_ref_key_image_package_image_path_start_5nh2osbvuj" UNIQUE NULLS DISTINCT ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "__image_identifier_sp263ko24n"),
  ADD CONSTRAINT "__variable_ref_check_variable_ref_counted_document_4goctx6qkv" CHECK (("__index_variables_7hpd35redf" >= 0::bigint AND "__index_variables_7hpd35redf" < "__copy_variables_7dc76fdnq4") IS TRUE);

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."assembled_catalog"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."assembled_document"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."attribute"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."attribute_entity"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."binding_name"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."bound_variable"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."candidate_path"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."catalog_id"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."catalog_scope"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."cell_headers"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."cell_leaf"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."choice"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."choice_interaction"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."cn_attribute"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."cn_count"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."cn_part_text"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."cn_slot"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."comment"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."context_ref"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."count_bound"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."data_ssml"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."data_ssml_member"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."data_ssml_property"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."doctype"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."document"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."document_id"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."element_type"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."encoding_decl"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."entry"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."expression"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."feedback_ref"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."file"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."fragment_context_name"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."fragment_context_ref"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."fragment_feedback_name"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."fragment_feedback_ref"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."fragment_printed_name"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."fragment_printed_ref"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."fragment_scope"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."fragment_template_name"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."fragment_template_ref"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."header_token"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."hottext"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."identity_text"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."idref"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."idref_target"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."inclusion"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."instance"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."interaction"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."interaction_attribute"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."item_mode"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."item_ref_document"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."item_ref_href"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."label_use"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."least_count"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."link_reading"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."literal"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."literal_typed"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."lookup_value"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."map_key"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."mastery_value"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."math_action"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."math_align_group"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."math_align_scope"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."math_cell"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."math_cn"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."math_rank"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."media"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."most_count"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."named"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."namespace"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."node"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."normal_maximum"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."normal_minimum"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."numbered_reading"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."open_attribute"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."open_attribute_entity"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."open_element_name"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."open_element_type"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."package"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."pci_module_form"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."pi"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."placed_binding"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."placed_choice"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."placed_hottext"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."placed_id"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."placed_idref"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."placed_math_rank"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."placed_share_target"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."placed_variable_ref"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."printed_variable_ref"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."processing"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."reference"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."reference_path"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."referring_document"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."resource_document"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."resource_href"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."rounding"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."rounding_figures"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."rounding_mode_figures"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."sd_decl"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."share_fragment"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."share_target"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."site"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."site_path"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."site_target"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."srcset"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."srcset_candidate"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."ssml_scope"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."stimulus_ref"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."table_header"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."table_scope"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."template_ref"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."text_idref"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."text_reference"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."text_reference_path"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."tolerance"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."tolerance_token"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."usage_value"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."usage_value_base_type"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."variable_ref"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."variable_ref_table"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

CREATE TRIGGER "__isolation"
  BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON "qti"."xml_decl"
  FOR EACH STATEMENT EXECUTE FUNCTION "qti"."__require_serializable"();

ALTER TABLE "qti"."assembled_catalog" ADD CONSTRAINT "__assembled_catalog_fk_package_path_owner_cwkxri6hfw" FOREIGN KEY ("package", "path", "owner") REFERENCES "qti"."catalog_id" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."assembled_document"
  ADD CONSTRAINT "__assembled_document_fk_package_path_pred_instances_opgs5mrscf" FOREIGN KEY ("package", "path", "__pred_instances_jnofs7e7gu") REFERENCES "qti"."instance" ("package", "document", "__index_instances_x7qgj6n3ho") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__assembled_document_fk_package_path_pred_targets_excdxg6pge" FOREIGN KEY ("package", "path", "__pred_targets_c5nt4iqzuc", "sites") REFERENCES "qti"."site_target" ("package", "path", "__index_targets_i7nnrmzfkn", "__after_targets_0_nsiq3pfnvg") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."attribute"
  ADD CONSTRAINT "__attribute_fk_package_path_start_copy_attributes_cjh7663z47" FOREIGN KEY ("package", "path", "start", "__copy_attributes_yxabddgj5r", "governor", "kind") REFERENCES "qti"."node" ("package", "path", "start", "attributes", "governor", "kind") MATCH SIMPLE ON UPDATE CASCADE,
  ADD CONSTRAINT "__attribute_fk_package_path_start_predecessor_kwcw7ok3kp" FOREIGN KEY ("package", "path", "start", "__predecessor_attributes_wqkk3l5mnd", "__before_attributes_0_7ux33ww56a") REFERENCES "qti"."attribute" ("package", "path", "start", "__index_attributes_7arzckayvr", "__after_attributes_0_4xdbd7d2wd") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__attribute_fk_image_package_image_path_start_name_pl6pe7fnds" FOREIGN KEY ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "name", "__pred_idrefs_2kinxrebfw", "__image_idref_text_vbeohhw2sm") REFERENCES "qti"."idref" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "name", "at", "__image_pieces_after_nxvecwbwoy") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__attribute_fk_package_path_start_name_ykxtejlb7g" FOREIGN KEY ("__package_a4p2u7pv6l", "path", "start", "name") REFERENCES "qti"."variable_ref" ("package", "path", "start", "attribute") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."attribute_entity" ADD CONSTRAINT "__attribute_entity_fk_package_path_start_name_mzkbpjqrfj" FOREIGN KEY ("package", "path", "start", "name") REFERENCES "qti"."attribute" ("package", "path", "start", "name") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."binding_name"
  ADD CONSTRAINT "__binding_name_fk_package_path_copy_bindings_sb6am7l6sh" FOREIGN KEY ("package", "path", "__copy_bindings_bkr36e6zer") REFERENCES "qti"."document" ("package", "path", "bindings") MATCH SIMPLE ON UPDATE CASCADE,
  ADD CONSTRAINT "__binding_name_fk_package_path_predecessor_bindings_livsfb6g7c" FOREIGN KEY ("package", "path", "__predecessor_bindings_hnpwjkvxqw") REFERENCES "qti"."binding_name" ("package", "path", "__index_bindings_unk6tk2t53") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."bound_variable"
  ADD CONSTRAINT "__bound_variable_fk_package_path_adaptive_o67xwxciik" FOREIGN KEY ("package", "path", "adaptive") REFERENCES "qti"."item_mode" ("package", "path", "adaptive") MATCH SIMPLE,
  ADD CONSTRAINT "__bound_variable_fk_package_path_start_dl2i2rfart" FOREIGN KEY ("__package_pyofn3cand", "path", "start") REFERENCES "qti"."node" ("__package_p5yblwgnua", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."candidate_path" ADD CONSTRAINT "__candidate_path_fk_package_target_aynqp2vyvf" FOREIGN KEY ("package", "target") REFERENCES "qti"."entry" ("package", "path") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."catalog_scope" ADD CONSTRAINT "__catalog_scope_fk_package_path_start_naheth2be3" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."cell_headers"
  ADD CONSTRAINT "__cell_headers_fk_package_path_start_5bbvstgdmm" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."table_scope" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__cell_headers_fk_image_package_image_path_start_gy6nqhg3wi" FOREIGN KEY ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__pred_tokens_ip7mlgrtju", "__image_token_text_eg2a7htxbl") REFERENCES "qti"."header_token" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "at", "__image_pieces_after_nxvecwbwoy") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."cell_leaf"
  ADD CONSTRAINT "__cell_leaf_fk_package_path_cell_copy_leaves_ikzmqguvf6" FOREIGN KEY ("package", "path", "cell", "__copy_leaves_zbyyqc6flc") REFERENCES "qti"."math_cell" ("package", "path", "start", "leaves") MATCH SIMPLE ON UPDATE CASCADE,
  ADD CONSTRAINT "__cell_leaf_fk_package_path_cell_pred_at_start_was_zhwbeepi6v" FOREIGN KEY ("package", "path", "cell", "__pred_at_xktcobhsti", "start_was") REFERENCES "qti"."cell_leaf" ("package", "path", "cell", "at", "start_after") MATCH SIMPLE,
  ADD CONSTRAINT "__cell_leaf_fk_package_path_start_cell_s2bln45e52" FOREIGN KEY ("package", "path", "start", "cell") REFERENCES "qti"."math_align_scope" ("package", "path", "start", "cell") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."choice"
  ADD CONSTRAINT "__choice_fk_package_path_start_hjjl442vss" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."choice_interaction" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__choice_fk_package_path_copy_choices_qmg62rrt4k" FOREIGN KEY ("package", "path", "__copy_choices_6wb56hybwx") REFERENCES "qti"."document" ("package", "path", "choices") MATCH SIMPLE ON UPDATE CASCADE,
  ADD CONSTRAINT "__choice_fk_package_path_predecessor_choices_jim5apebu4" FOREIGN KEY ("package", "path", "__predecessor_choices_nfvb6gvzzs") REFERENCES "qti"."choice" ("package", "path", "__index_choices_u7j4m5lowj") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."choice_interaction"
  ADD CONSTRAINT "__choice_interaction_fk_package_interaction_path_ans6kwjguu" FOREIGN KEY ("package", "interaction_path", "interaction", "__copy_choices_trqdfrh73z") REFERENCES "qti"."interaction" ("package", "path", "start", "choices") MATCH SIMPLE ON UPDATE CASCADE,
  ADD CONSTRAINT "__choice_interaction_fk_package_interaction_path_nrneq24f23" FOREIGN KEY ("package", "interaction_path", "interaction", "__predecessor_choices_pw4quskqli") REFERENCES "qti"."choice_interaction" ("package", "interaction_path", "interaction", "__index_choices_5qdn655u6p") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__choice_interaction_fk_package_path_start_ly5prg5zl7" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."choice" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__choice_interaction_fk_package_path_start_auainzeevf" FOREIGN KEY ("package", "path", "start", "interaction") REFERENCES "qti"."node" ("package", "path", "start", "nearest") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."cn_count" ADD CONSTRAINT "__cn_count_fk_package_path_start_pred_parts_nt76bkyr7u" FOREIGN KEY ("package", "path", "start", "__pred_parts_32uebfen7t") REFERENCES "qti"."cn_slot" ("package", "path", "start", "__index_parts_vspd7yk6z2") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."cn_part_text"
  ADD CONSTRAINT "__cn_part_text_fk_package_path_start_copy_parts_base_u3absd7ss6" FOREIGN KEY ("package", "path", "start", "__copy_parts_qitbl7wkbe", "base", "type") REFERENCES "qti"."math_cn" ("package", "path", "start", "parts", "base", "type") MATCH SIMPLE ON UPDATE CASCADE,
  ADD CONSTRAINT "__cn_part_text_fk_package_path_start_predecessor_n232tu7775" FOREIGN KEY ("package", "path", "start", "__predecessor_parts_yvk7rmwtkj") REFERENCES "qti"."cn_part_text" ("package", "path", "start", "__index_parts_jdo2fld5qx") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."cn_slot"
  ADD CONSTRAINT "__cn_slot_fk_package_path_start_copy_parts_type_nl4o4ioo5f" FOREIGN KEY ("package", "path", "start", "__copy_parts_n6gcbnw7dj", "type") REFERENCES "qti"."cn_count" ("package", "path", "start", "parts", "type") MATCH SIMPLE ON UPDATE CASCADE,
  ADD CONSTRAINT "__cn_slot_fk_package_path_start_predecessor_parts_hcel4zxkjz" FOREIGN KEY ("package", "path", "start", "__predecessor_parts_odfdgqim4k") REFERENCES "qti"."cn_slot" ("package", "path", "start", "__index_parts_vspd7yk6z2") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."count_bound" ADD CONSTRAINT "__count_bound_fk_package_path_start_t5pqtfs3rz" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."data_ssml_member" ADD CONSTRAINT "__data_ssml_member_fk_package_path_start_2dmymllh2h" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."data_ssml" ("package", "path", "start") MATCH SIMPLE;

ALTER TABLE "qti"."data_ssml_property" ADD CONSTRAINT "__data_ssml_property_fk_image_package_image_path_w3rvz6beek" FOREIGN KEY ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "member", "__image_member_name_qqbvqrei53") REFERENCES "qti"."data_ssml_member" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "at", "__image_member_hou44p4stw") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."document"
  ADD CONSTRAINT "__document_fk_package_path_pred_bindings_fouafod5y7" FOREIGN KEY ("package", "path", "__pred_bindings_4jwvqtioeb") REFERENCES "qti"."binding_name" ("package", "path", "__index_bindings_unk6tk2t53") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__document_fk_package_path_pred_choices_yrbwq6r4hb" FOREIGN KEY ("package", "path", "__pred_choices_w4bygwsb7b") REFERENCES "qti"."choice" ("package", "path", "__index_choices_u7j4m5lowj") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__document_fk_package_path_pred_hottexts_tikqfwhnnb" FOREIGN KEY ("package", "path", "__pred_hottexts_qwkebxoneh") REFERENCES "qti"."hottext" ("package", "path", "__index_hottexts_huxv2shciv") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__document_fk_package_path_pred_idref_targets_xdiawwndk2" FOREIGN KEY ("package", "path", "__pred_idref_targets_2hmjkyp3ck") REFERENCES "qti"."idref_target" ("package", "path", "__index_idref_targets_hoxb6lgv75") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__document_fk_package_path_pred_ids_qkiqwhoec7" FOREIGN KEY ("package", "path", "__pred_ids_wdsabmqjb7") REFERENCES "qti"."document_id" ("package", "path", "__index_ids_6wzypuy7sz") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__document_fk_package_path_pred_targeted_by_context_m3g2fumgub" FOREIGN KEY ("package", "path", "__pred_targeted_by_x4imsveco5", "context") REFERENCES "qti"."site_target" ("package", "target", "__index_targeted_by_zcbbdfk6qk", "__after_targeted_by_0_rsywbgrrjw") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__document_fk_package_path_pred_variables_2kytqy7yjt" FOREIGN KEY ("package", "path", "__pred_variables_hofq62ycc6") REFERENCES "qti"."variable_ref" ("package", "path", "__index_variables_7hpd35redf") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."document_id"
  ADD CONSTRAINT "__document_id_fk_package_path_copy_ids_gen3ajva7g" FOREIGN KEY ("package", "path", "__copy_ids_olm55ckphp") REFERENCES "qti"."document" ("package", "path", "ids") MATCH SIMPLE ON UPDATE CASCADE,
  ADD CONSTRAINT "__document_id_fk_package_path_predecessor_ids_yyr2sqg3ac" FOREIGN KEY ("package", "path", "__predecessor_ids_qwo2em24bw") REFERENCES "qti"."document_id" ("package", "path", "__index_ids_6wzypuy7sz") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."element_type" ADD CONSTRAINT "__element_type_fk_package_path_start_kind_governor_uciwknlvpy" FOREIGN KEY ("package", "path", "start", "kind", "governor") REFERENCES "qti"."node" ("package", "path", "start", "kind", "governor") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."encoding_decl" ADD CONSTRAINT "__encoding_decl_fk_package_path_u5grbt7fag" FOREIGN KEY ("package", "path") REFERENCES "qti"."xml_decl" ("package", "path") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."entry" ADD CONSTRAINT "__entry_fk_package_tzyfqvwqow" FOREIGN KEY ("package") REFERENCES "qti"."package" ("name") MATCH SIMPLE;

ALTER TABLE "qti"."expression" ADD CONSTRAINT "__expression_fk_package_path_start_f6hwlqhv67" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."fragment_context_name"
  ADD CONSTRAINT "__fragment_context_name_fk_package_path_copy_i7tr226g4e" FOREIGN KEY ("package", "path", "__copy_contexts_5a2mmj6flw") REFERENCES "qti"."referring_document" ("package", "path", "contexts") MATCH SIMPLE ON UPDATE CASCADE,
  ADD CONSTRAINT "__fragment_context_name_fk_package_path_predecessor_y4e2h4ueim" FOREIGN KEY ("package", "path", "__predecessor_contexts_uwyrojdgj7") REFERENCES "qti"."fragment_context_name" ("package", "path", "__index_contexts_rurifjnewj") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."fragment_context_ref"
  ADD CONSTRAINT "__fragment_context_ref_fk_package_assembly_instance_qmrvsw47a5" FOREIGN KEY ("package", "assembly", "instance", "__copy_contexts_aa5iocscdr", "assembly_kind", "path") REFERENCES "qti"."fragment_scope" ("package", "assembly", "instance", "contexts", "assembly_kind", "document") MATCH SIMPLE ON UPDATE CASCADE,
  ADD CONSTRAINT "__fragment_context_ref_fk_package_assembly_instance_4csn2nw3xk" FOREIGN KEY ("package", "assembly", "instance", "__predecessor_contexts_bio7nxkg5y") REFERENCES "qti"."fragment_context_ref" ("package", "assembly", "instance", "__index_contexts_cmwyokypvl") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__fragment_context_ref_fk_image_package_image_path_rxmunrgbld" FOREIGN KEY ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "kind", "__image_identifier_sp263ko24n") REFERENCES "qti"."fragment_context_name" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "kind", "__image_identifier_sp263ko24n") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."fragment_feedback_name"
  ADD CONSTRAINT "__fragment_feedback_name_fk_package_path_copy_abnu2mx63n" FOREIGN KEY ("package", "path", "__copy_feedbacks_db37gtjbwl") REFERENCES "qti"."referring_document" ("package", "path", "feedbacks") MATCH SIMPLE ON UPDATE CASCADE,
  ADD CONSTRAINT "__fragment_feedback_name_fk_package_path_predecessor_ip2b5eqztt" FOREIGN KEY ("package", "path", "__predecessor_feedbacks_mnprabm2zf") REFERENCES "qti"."fragment_feedback_name" ("package", "path", "__index_feedbacks_5unk6hkdlh") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."fragment_feedback_ref"
  ADD CONSTRAINT "__fragment_feedback_ref_fk_package_assembly_instance_nemmw63ril" FOREIGN KEY ("package", "assembly", "instance", "__copy_feedbacks_cywy2j56so", "assembly_kind", "path") REFERENCES "qti"."fragment_scope" ("package", "assembly", "instance", "feedbacks", "assembly_kind", "document") MATCH SIMPLE ON UPDATE CASCADE,
  ADD CONSTRAINT "__fragment_feedback_ref_fk_package_assembly_instance_msnpettsbl" FOREIGN KEY ("package", "assembly", "instance", "__predecessor_feedbacks_tqxnj4bnpd") REFERENCES "qti"."fragment_feedback_ref" ("package", "assembly", "instance", "__index_feedbacks_uaqpsnapkw") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__fragment_feedback_ref_fk_image_package_image_path_icntjtzl5p" FOREIGN KEY ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "kind", "__image_identifier_sp263ko24n") REFERENCES "qti"."fragment_feedback_name" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "kind", "__image_identifier_sp263ko24n") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."fragment_printed_name"
  ADD CONSTRAINT "__fragment_printed_name_fk_package_path_copy_prints_v4qcbt44tb" FOREIGN KEY ("package", "path", "__copy_prints_t4jfjtgc7d") REFERENCES "qti"."referring_document" ("package", "path", "prints") MATCH SIMPLE ON UPDATE CASCADE,
  ADD CONSTRAINT "__fragment_printed_name_fk_package_path_predecessor_srdzfslmhz" FOREIGN KEY ("package", "path", "__predecessor_prints_w5l5ryjguo") REFERENCES "qti"."fragment_printed_name" ("package", "path", "__index_prints_lrn5xrcnoj") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."fragment_printed_ref"
  ADD CONSTRAINT "__fragment_printed_ref_fk_package_assembly_instance_jwyp6pmicw" FOREIGN KEY ("package", "assembly", "instance", "__copy_prints_bdawvaisob", "assembly_kind", "path") REFERENCES "qti"."fragment_scope" ("package", "assembly", "instance", "prints", "assembly_kind", "document") MATCH SIMPLE ON UPDATE CASCADE,
  ADD CONSTRAINT "__fragment_printed_ref_fk_package_assembly_instance_aj65n7cdp2" FOREIGN KEY ("package", "assembly", "instance", "__predecessor_prints_yg4v7qxrwg") REFERENCES "qti"."fragment_printed_ref" ("package", "assembly", "instance", "__index_prints_4vol45drim") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__fragment_printed_ref_fk_image_package_image_path_65tus7xlee" FOREIGN KEY ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "kind", "__image_identifier_sp263ko24n") REFERENCES "qti"."fragment_printed_name" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "kind", "__image_identifier_sp263ko24n") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."fragment_scope"
  ADD CONSTRAINT "__fragment_scope_fk_package_assembly_instance_nkb5xn3uaf" FOREIGN KEY ("package", "assembly", "instance", "document", "assembly_kind") REFERENCES "qti"."instance" ("package", "assembly", "start", "document", "assembly_kind") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__fragment_scope_fk_package_assembly_instance_pred_pviwyowdol" FOREIGN KEY ("package", "assembly", "instance", "__pred_contexts_leteqrd4bu") REFERENCES "qti"."fragment_context_ref" ("package", "assembly", "instance", "__index_contexts_cmwyokypvl") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__fragment_scope_fk_package_assembly_instance_pred_kjpbyjytvk" FOREIGN KEY ("package", "assembly", "instance", "__pred_feedbacks_c2txublcan") REFERENCES "qti"."fragment_feedback_ref" ("package", "assembly", "instance", "__index_feedbacks_uaqpsnapkw") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__fragment_scope_fk_package_assembly_instance_pred_7gu2sj2s3k" FOREIGN KEY ("package", "assembly", "instance", "__pred_prints_uwxz5ocwj4") REFERENCES "qti"."fragment_printed_ref" ("package", "assembly", "instance", "__index_prints_4vol45drim") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__fragment_scope_fk_package_assembly_instance_pred_sbk2wlzqzg" FOREIGN KEY ("package", "assembly", "instance", "__pred_templates_5bo5q45wjw") REFERENCES "qti"."fragment_template_ref" ("package", "assembly", "instance", "__index_templates_tyl4zqwugp") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__fragment_scope_fk_package_document_feedbacks_sqwpxtazud" FOREIGN KEY ("package", "document", "feedbacks", "prints", "templates", "contexts") REFERENCES "qti"."referring_document" ("package", "path", "feedbacks", "prints", "templates", "contexts") MATCH SIMPLE;

ALTER TABLE "qti"."fragment_template_name"
  ADD CONSTRAINT "__fragment_template_name_fk_package_path_copy_xs3r4om2s5" FOREIGN KEY ("package", "path", "__copy_templates_xccyy2wmtp") REFERENCES "qti"."referring_document" ("package", "path", "templates") MATCH SIMPLE ON UPDATE CASCADE,
  ADD CONSTRAINT "__fragment_template_name_fk_package_path_predecessor_w6ni5yia5l" FOREIGN KEY ("package", "path", "__predecessor_templates_nc6jzzxv73") REFERENCES "qti"."fragment_template_name" ("package", "path", "__index_templates_v2kw2euldh") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."fragment_template_ref"
  ADD CONSTRAINT "__fragment_template_ref_fk_package_assembly_instance_ns4u6kvl5n" FOREIGN KEY ("package", "assembly", "instance", "__copy_templates_k5hlr5akya", "assembly_kind", "path") REFERENCES "qti"."fragment_scope" ("package", "assembly", "instance", "templates", "assembly_kind", "document") MATCH SIMPLE ON UPDATE CASCADE,
  ADD CONSTRAINT "__fragment_template_ref_fk_package_assembly_instance_k6kjvp4vr7" FOREIGN KEY ("package", "assembly", "instance", "__predecessor_templates_phvu6yyk7k") REFERENCES "qti"."fragment_template_ref" ("package", "assembly", "instance", "__index_templates_tyl4zqwugp") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__fragment_template_ref_fk_image_package_image_path_s3xwfhhzti" FOREIGN KEY ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "kind", "__image_identifier_sp263ko24n") REFERENCES "qti"."fragment_template_name" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "kind", "__image_identifier_sp263ko24n") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."header_token"
  ADD CONSTRAINT "__header_token_fk_package_path_start_copy_tokens_mukpeaaqnv" FOREIGN KEY ("package", "path", "start", "__copy_tokens_vmvzbmawj6") REFERENCES "qti"."cell_headers" ("package", "path", "start", "tokens") MATCH SIMPLE ON UPDATE CASCADE,
  ADD CONSTRAINT "__header_token_fk_image_package_image_path_start_pfd6hvkxhk" FOREIGN KEY ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__pred_at_xktcobhsti", "__image_pieces_was_qr42vzdoqq") REFERENCES "qti"."header_token" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "at", "__image_pieces_after_nxvecwbwoy") MATCH SIMPLE;

ALTER TABLE "qti"."hottext"
  ADD CONSTRAINT "__hottext_fk_package_path_copy_hottexts_nqhkueuyyr" FOREIGN KEY ("package", "path", "__copy_hottexts_b24kbb6m65") REFERENCES "qti"."document" ("package", "path", "hottexts") MATCH SIMPLE ON UPDATE CASCADE,
  ADD CONSTRAINT "__hottext_fk_package_path_predecessor_hottexts_a3xph2z6lt" FOREIGN KEY ("package", "path", "__predecessor_hottexts_imqsc5w56i") REFERENCES "qti"."hottext" ("package", "path", "__index_hottexts_huxv2shciv") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."identity_text"
  ADD CONSTRAINT "__identity_text_fk_package_path_start_vymux7o4os" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__identity_text_fk_image_package_image_path_start_ke6wzbhjct" FOREIGN KEY ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__pred_tokens_ip7mlgrtju", "__image_token_text_eg2a7htxbl") REFERENCES "qti"."text_idref" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "at", "__image_pieces_after_nxvecwbwoy") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."idref"
  ADD CONSTRAINT "__idref_fk_package_path_start_name_copy_idrefs_l3bwkzmy73" FOREIGN KEY ("package", "path", "start", "name", "__copy_idrefs_tkyc3atjbb") REFERENCES "qti"."attribute" ("package", "path", "start", "name", "idrefs") MATCH SIMPLE ON UPDATE CASCADE,
  ADD CONSTRAINT "__idref_fk_image_package_image_path_start_name_pred_veydgbpdjl" FOREIGN KEY ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "name", "__pred_at_xktcobhsti", "__image_pieces_was_qr42vzdoqq") REFERENCES "qti"."idref" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "name", "at", "__image_pieces_after_nxvecwbwoy") MATCH SIMPLE,
  ADD CONSTRAINT "__idref_fk_image_package_image_path_image_token_d7rft2tfo7" FOREIGN KEY ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "__image_token_arko66iuth") REFERENCES "qti"."idref_target" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "__image_id_cggscgoxcc") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."idref_target"
  ADD CONSTRAINT "__idref_target_fk_package_path_copy_idref_targets_gqcp4g6ar3" FOREIGN KEY ("package", "path", "__copy_idref_targets_nn7nlmtms6", "assembled") REFERENCES "qti"."document" ("package", "path", "idref_targets", "assembled") MATCH SIMPLE ON UPDATE CASCADE,
  ADD CONSTRAINT "__idref_target_fk_package_path_predecessor_idref_bun7tb7rap" FOREIGN KEY ("package", "path", "__predecessor_idref_targets_3a7kfrknym") REFERENCES "qti"."idref_target" ("package", "path", "__index_idref_targets_hoxb6lgv75") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."inclusion" ADD CONSTRAINT "__inclusion_fk_package_path_start_parent_kind_places_2557ifwq63" FOREIGN KEY ("package", "path", "start", "parent_kind", "places", "root", "splices") REFERENCES "qti"."site_target" ("package", "path", "start", "parent_kind", "places", "target_root", "splices") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."instance"
  ADD CONSTRAINT "__instance_fk_package_assembly_start_pred_bindings_nxfqdzzza2" FOREIGN KEY ("package", "assembly", "start", "__pred_bindings_4jwvqtioeb") REFERENCES "qti"."placed_binding" ("package", "assembly", "instance", "__index_bindings_oyr3fiahr3") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__instance_fk_package_assembly_start_pred_children_36olkmoimr" FOREIGN KEY ("package", "assembly", "start", "__pred_children_nrfpkqcaen", "end") REFERENCES "qti"."instance" ("package", "assembly", "__parent_l4ckjnvwat", "at", "end") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__instance_fk_package_assembly_start_pred_choices_4hokoiprao" FOREIGN KEY ("package", "assembly", "start", "__pred_choices_w4bygwsb7b") REFERENCES "qti"."placed_choice" ("package", "assembly", "instance", "__index_choices_ktdrfnqsrr") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__instance_fk_package_assembly_start_pred_hottexts_qsp2z6ey3g" FOREIGN KEY ("package", "assembly", "start", "__pred_hottexts_qwkebxoneh") REFERENCES "qti"."placed_hottext" ("package", "assembly", "instance", "__index_hottexts_tdyulq7odh") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__instance_fk_package_assembly_start_pred_idref_hix6ikgvcl" FOREIGN KEY ("package", "assembly", "start", "__pred_idref_targets_2hmjkyp3ck") REFERENCES "qti"."placed_idref" ("package", "assembly", "instance", "__index_idref_targets_fjkkfgwwk3") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__instance_fk_package_assembly_start_pred_ids_zkgt72tuht" FOREIGN KEY ("package", "assembly", "start", "__pred_ids_wdsabmqjb7") REFERENCES "qti"."placed_id" ("package", "assembly", "instance", "__index_ids_ojwjtnxm2y") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__instance_fk_package_assembly_start_pred_variables_spvdaqjppg" FOREIGN KEY ("package", "assembly", "start", "__pred_variables_hofq62ycc6") REFERENCES "qti"."placed_variable_ref" ("package", "assembly", "instance", "__index_variables_efcmle332h") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__instance_fk_package_assembly_parent_copy_children_crejh3tfyf" FOREIGN KEY ("package", "assembly", "__parent_l4ckjnvwat", "__copy_children_x6kra4he2y", "assembly_kind", "site_document") REFERENCES "qti"."instance" ("package", "assembly", "start", "children", "assembly_kind", "document") MATCH SIMPLE,
  ADD CONSTRAINT "__instance_fk_package_assembly_parent_pred_at_start_bmevtdvhp4" FOREIGN KEY ("package", "assembly", "__parent_l4ckjnvwat", "__pred_at_xktcobhsti", "start") REFERENCES "qti"."instance" ("package", "assembly", "__parent_l4ckjnvwat", "at", "end") MATCH SIMPLE,
  ADD CONSTRAINT "__instance_fk_package_document_ids_idref_targets_5z7ien5yku" FOREIGN KEY ("package", "document", "ids", "idref_targets", "choices", "hottexts") REFERENCES "qti"."document" ("package", "path", "ids", "idref_targets", "choices", "hottexts") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__instance_fk_package_document_root_kind_hgvtyahpsw" FOREIGN KEY ("package", "document", "root_kind") REFERENCES "qti"."document" ("package", "path", "root_kind") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__instance_fk_package_document_copy_instances_hbgbfu6nua" FOREIGN KEY ("package", "document", "__copy_instances_o6jtftfowj", "children") REFERENCES "qti"."assembled_document" ("package", "path", "instances", "sites") MATCH SIMPLE ON UPDATE CASCADE,
  ADD CONSTRAINT "__instance_fk_package_document_predecessor_instances_wdblc4jtmg" FOREIGN KEY ("package", "document", "__predecessor_instances_wr47uilqlc") REFERENCES "qti"."instance" ("package", "document", "__index_instances_x7qgj6n3ho") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."interaction"
  ADD CONSTRAINT "__interaction_fk_package_path_start_wpfpdpxf37" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__interaction_fk_package_path_start_pred_choices_zosgrzvvtu" FOREIGN KEY ("package", "path", "start", "__pred_choices_w4bygwsb7b") REFERENCES "qti"."choice_interaction" ("package", "interaction_path", "interaction", "__index_choices_5qdn655u6p") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__interaction_fk_package_path_start_pred_module_d7kjlhcc36" FOREIGN KEY ("package", "path", "start", "__pred_module_forms_c2s5pqvqs7") REFERENCES "qti"."pci_module_form" ("package", "path", "start", "__index_module_forms_wydm354elh") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."interaction_attribute"
  ADD CONSTRAINT "__interaction_attribute_fk_package_path_root_kind_ottpmnv3zo" FOREIGN KEY ("package", "path", "root_kind") REFERENCES "qti"."document" ("package", "path", "root_kind") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__interaction_attribute_fk_image_package_image_path_l7effn3wer" FOREIGN KEY ("__image_package_exckv5jfmt", "__image_path_ff7ysgcuo3", "start", "name", "kind", "__image_value_dmndzoe5g5") REFERENCES "qti"."fragment_template_name" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "kind", "__image_identifier_sp263ko24n") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__interaction_attribute_fk_image_package_image_path_v35kom2i7p" FOREIGN KEY ("__image_package_ty3wsixbgo", "__image_path_ff7ysgcuo3", "start", "name", "kind", "__image_value_dmndzoe5g5") REFERENCES "qti"."fragment_feedback_name" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "kind", "__image_identifier_sp263ko24n") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__interaction_attribute_fk_image_package_image_path_ietozkjrzd" FOREIGN KEY ("__image_package_jpnodyqj4e", "__image_path_ff7ysgcuo3", "start", "name", "kind", "__image_value_dmndzoe5g5") REFERENCES "qti"."fragment_printed_name" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "kind", "__image_identifier_sp263ko24n") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__interaction_attribute_fk_image_package_image_path_z5v3a5piuj" FOREIGN KEY ("__image_package_nyr6mqgwus", "__image_path_ff7ysgcuo3", "start", "name", "kind", "__image_value_dmndzoe5g5") REFERENCES "qti"."fragment_context_name" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "kind", "__image_identifier_sp263ko24n") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__interaction_attribute_fk_image_package_image_path_7qmh3ixvu3" FOREIGN KEY ("__image_package_ibdsk7qumz", "__image_path_ff7ysgcuo3", "start", "name", "kind", "root_kind", "__image_value_dmndzoe5g5") REFERENCES "qti"."template_ref" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "kind", "assembly_kind", "__image_identifier_sp263ko24n") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__interaction_attribute_fk_image_package_image_path_u5n4mcdddw" FOREIGN KEY ("__image_package_lr7wlxhost", "__image_path_ff7ysgcuo3", "start", "name", "__image_value_dmndzoe5g5") REFERENCES "qti"."binding_name" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "__image_identifier_sp263ko24n") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__interaction_attribute_fk_image_package_image_path_ug7sf3yuqr" FOREIGN KEY ("__image_package_5bjgttgjue", "__image_path_ff7ysgcuo3", "start", "name", "__image_value_dmndzoe5g5") REFERENCES "qti"."bound_variable" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "__image_identifier_sp263ko24n") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__interaction_attribute_fk_image_package_image_path_esdh4xbhsa" FOREIGN KEY ("__image_package_k2gcvxo2zg", "__image_path_ff7ysgcuo3", "start", "name", "kind", "root_kind", "__image_value_dmndzoe5g5") REFERENCES "qti"."feedback_ref" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "kind", "assembly_kind", "__image_identifier_sp263ko24n") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__interaction_attribute_fk_image_package_image_path_vnsvkannto" FOREIGN KEY ("__image_package_uxpxcua7wm", "__image_path_ff7ysgcuo3", "start", "name", "kind", "root_kind", "__image_value_dmndzoe5g5") REFERENCES "qti"."printed_variable_ref" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "kind", "assembly_kind", "__image_identifier_sp263ko24n") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__interaction_attribute_fk_image_package_image_path_mdexog7g4w" FOREIGN KEY ("__image_package_7tsrkngiba", "__image_path_ff7ysgcuo3", "start", "name", "kind", "root_kind", "__image_value_dmndzoe5g5") REFERENCES "qti"."context_ref" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "kind", "assembly_kind", "__image_identifier_sp263ko24n") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."label_use" ADD CONSTRAINT "__label_use_fk_package_path_root_kind_5odzayuwy3" FOREIGN KEY ("package", "path", "root_kind") REFERENCES "qti"."document" ("package", "path", "root_kind") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."least_count" ADD CONSTRAINT "__least_count_fk_package_path_start_vgly2zkjt2" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."count_bound" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."literal" ADD CONSTRAINT "__literal_fk_package_path_start_base_type_j2vwpqor57" FOREIGN KEY ("package", "path", "start", "base_type") REFERENCES "qti"."expression" ("package", "path", "start", "base_type") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."literal_typed" ADD CONSTRAINT "__literal_typed_fk_image_package_image_path_start_kzgbthav7k" FOREIGN KEY ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__image_text_nik2jnknxc", "base_type") REFERENCES "qti"."literal" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__image_text_nik2jnknxc", "base_type") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."math_align_group"
  ADD CONSTRAINT "__math_align_group_fk_package_path_cell_copy_groups_hdpaxywlcb" FOREIGN KEY ("package", "path", "cell", "__copy_groups_stk5ekuyip") REFERENCES "qti"."math_cell" ("package", "path", "start", "groups") MATCH SIMPLE ON UPDATE CASCADE,
  ADD CONSTRAINT "__math_align_group_fk_package_path_cell_predecessor_fnmrdmpetz" FOREIGN KEY ("package", "path", "cell", "__predecessor_groups_6xj7n2r25s") REFERENCES "qti"."math_align_group" ("package", "path", "cell", "__index_groups_ybwzwddeng") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__math_align_group_fk_package_path_start_cell_ygnv5pqymq" FOREIGN KEY ("package", "path", "start", "cell") REFERENCES "qti"."math_align_scope" ("package", "path", "start", "cell") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__math_align_group_fk_package_path_start_tag_state_whuyhaovjg" FOREIGN KEY ("package", "path", "start", "__tag_state_open_hbfhgrpnnf") REFERENCES "qti"."math_align_scope" ("package", "path", "start", "state") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__math_align_group_fk_package_path_start_tag_kind_m_iopasv7ble" FOREIGN KEY ("package", "path", "start", "__tag_kind_m_maligngroup_u3ce3cx7aa") REFERENCES "qti"."node" ("package", "path", "start", "kind") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."math_align_scope" ADD CONSTRAINT "__math_align_scope_fk_package_path_start_jfr4iz7vmr" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."math_cell"
  ADD CONSTRAINT "__math_cell_fk_package_path_start_pred_groups_3tmcxdn4gu" FOREIGN KEY ("package", "path", "start", "__pred_groups_vcil4lo3j4") REFERENCES "qti"."math_align_group" ("package", "path", "cell", "__index_groups_ybwzwddeng") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__math_cell_fk_package_path_start_pred_leaves_last_zixxwvi2km" FOREIGN KEY ("package", "path", "start", "__pred_leaves_oeq7eporgz", "last_start") REFERENCES "qti"."cell_leaf" ("package", "path", "cell", "at", "start_after") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."math_cn"
  ADD CONSTRAINT "__math_cn_fk_package_path_start_type_gfdns3v3gm" FOREIGN KEY ("package", "path", "start", "type") REFERENCES "qti"."cn_count" ("package", "path", "start", "type") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__math_cn_fk_package_path_start_pred_parts_ob77fltdsw" FOREIGN KEY ("package", "path", "start", "__pred_parts_32uebfen7t") REFERENCES "qti"."cn_part_text" ("package", "path", "start", "__index_parts_jdo2fld5qx") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."math_rank" ADD CONSTRAINT "__math_rank_fk_package_path_start_z7fxfctmgv" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."most_count" ADD CONSTRAINT "__most_count_fk_package_path_start_nmmdsz5znz" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."count_bound" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."named" ADD CONSTRAINT "__named_fk_package_path_eca76rajwv" FOREIGN KEY ("package", "path") REFERENCES "qti"."assembled_document" ("package", "path") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."namespace" ADD CONSTRAINT "__namespace_fk_package_path_start_4tsm66w6qo" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."node"
  ADD CONSTRAINT "__node_fk_package_path_start_pred_attributes_attrs_yuiaud4slh" FOREIGN KEY ("package", "path", "start", "__pred_attributes_aghx2cqr7s", "attrs") REFERENCES "qti"."attribute" ("package", "path", "start", "__index_attributes_7arzckayvr", "__after_attributes_0_4xdbd7d2wd") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__node_fk_package_path_start_pred_open_attributes_khsm76hyrz" FOREIGN KEY ("package", "path", "start", "__pred_open_attributes_4pd7mwzpyg") REFERENCES "qti"."open_attribute" ("package", "path", "start", "__index_open_attributes_hgy2tjkow2") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__node_fk_package_path_parent_copy_children_parent_izis7cll4b" FOREIGN KEY ("package", "path", "__parent_l4ckjnvwat", "__copy_children_tityo5ij5l", "parent_ancestry", "parent_governor", "parent_kind", "parent_nearest", "parent_nearest_kind", "parent_nearest_path", "parent_parent_kind") REFERENCES "qti"."node" ("package", "path", "start", "children", "ancestry", "governor", "kind", "nearest", "nearest_kind", "nearest_path", "parent_kind") MATCH SIMPLE,
  ADD CONSTRAINT "__node_fk_image_package_image_path_start_pred_6coiluef7c" FOREIGN KEY ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__pred_children_nrfpkqcaen", "end", "barred_children", "counted_children", "element_children", "__image_string_value_fromrjgqg2", "last_state") REFERENCES "qti"."node" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "__parent_l4ckjnvwat", "at", "end", "__after_children_0_qbioc6jbat", "__after_children_0_vmaftea6hj", "elements", "__image_chars_after_5ip2qmnum4", "state") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__node_fk_image_package_image_path_parent_pred_at_wsdpcfeczi" FOREIGN KEY ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "__parent_l4ckjnvwat", "__pred_at_xktcobhsti", "start", "__before_children_0_bs3zgzsr7j", "__before_children_0_qdvwmuycyh", "elements_was", "__image_chars_was_ygtd7siug2", "was") REFERENCES "qti"."node" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "__parent_l4ckjnvwat", "at", "end", "__after_children_0_qbioc6jbat", "__after_children_0_vmaftea6hj", "elements", "__image_chars_after_5ip2qmnum4", "state") MATCH SIMPLE,
  ADD CONSTRAINT "__node_fk_package_path_start_35fr4eeug5" FOREIGN KEY ("__package_pzlq2bwqm3", "path", "start") REFERENCES "qti"."usage_value" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."open_attribute"
  ADD CONSTRAINT "__open_attribute_fk_package_path_start_copy_open_3uvsj6ee55" FOREIGN KEY ("package", "path", "start", "__copy_open_attributes_fpnvcvdmpf", "governor", "kind") REFERENCES "qti"."node" ("package", "path", "start", "open_attributes", "governor", "kind") MATCH SIMPLE ON UPDATE CASCADE,
  ADD CONSTRAINT "__open_attribute_fk_package_path_start_predecessor_6wt26reoml" FOREIGN KEY ("package", "path", "start", "__predecessor_open_attributes_rrtw7d24a5") REFERENCES "qti"."open_attribute" ("package", "path", "start", "__index_open_attributes_hgy2tjkow2") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."open_attribute_entity" ADD CONSTRAINT "__open_attribute_entity_fk_package_path_start_uri_ccjfi3dv74" FOREIGN KEY ("package", "path", "start", "uri", "local") REFERENCES "qti"."open_attribute" ("package", "path", "start", "uri", "local") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."open_element_name" ADD CONSTRAINT "__open_element_name_fk_package_path_start_dgkc2wpi7w" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."open_element_type" ADD CONSTRAINT "__open_element_type_fk_package_path_start_jjjipij4kp" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."open_element_name" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."pci_module_form"
  ADD CONSTRAINT "__pci_module_form_fk_package_path_start_copy_module_keh62si5ne" FOREIGN KEY ("package", "path", "start", "__copy_module_forms_hwpic65mty") REFERENCES "qti"."interaction" ("package", "path", "start", "module_forms") MATCH SIMPLE ON UPDATE CASCADE,
  ADD CONSTRAINT "__pci_module_form_fk_package_path_start_predecessor_72gwl37tcr" FOREIGN KEY ("package", "path", "start", "__predecessor_module_forms_dauym75voc") REFERENCES "qti"."pci_module_form" ("package", "path", "start", "__index_module_forms_wydm354elh") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."placed_binding"
  ADD CONSTRAINT "__placed_binding_fk_package_assembly_adaptive_4vpvmxtpul" FOREIGN KEY ("package", "assembly", "adaptive") REFERENCES "qti"."item_mode" ("package", "path", "adaptive") MATCH SIMPLE,
  ADD CONSTRAINT "__placed_binding_fk_package_assembly_instance_copy_3fluktngez" FOREIGN KEY ("package", "assembly", "instance", "__copy_bindings_i7fid7zclc") REFERENCES "qti"."instance" ("package", "assembly", "start", "bindings") MATCH SIMPLE ON UPDATE CASCADE,
  ADD CONSTRAINT "__placed_binding_fk_package_assembly_instance_lrmdgzusck" FOREIGN KEY ("package", "assembly", "instance", "__predecessor_bindings_ntcwoepfst") REFERENCES "qti"."placed_binding" ("package", "assembly", "instance", "__index_bindings_oyr3fiahr3") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__placed_binding_fk_image_package_image_path_start_kfjvclwbdd" FOREIGN KEY ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "__image_identifier_sp263ko24n") REFERENCES "qti"."binding_name" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "__image_identifier_sp263ko24n") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__placed_binding_fk_package_path_start_jvgrxcf4xe" FOREIGN KEY ("__package_pyofn3cand", "path", "start") REFERENCES "qti"."node" ("__package_p5yblwgnua", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."placed_choice"
  ADD CONSTRAINT "__placed_choice_fk_package_assembly_instance_copy_3yeakujuck" FOREIGN KEY ("package", "assembly", "instance", "__copy_choices_wxxtuahand", "path") REFERENCES "qti"."instance" ("package", "assembly", "start", "choices", "document") MATCH SIMPLE ON UPDATE CASCADE,
  ADD CONSTRAINT "__placed_choice_fk_package_assembly_instance_cy5gpuayal" FOREIGN KEY ("package", "assembly", "instance", "__predecessor_choices_uwibywwdhh") REFERENCES "qti"."placed_choice" ("package", "assembly", "instance", "__index_choices_ktdrfnqsrr") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__placed_choice_fk_image_package_image_path_start_fokmayvt6a" FOREIGN KEY ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__image_identifier_sp263ko24n") REFERENCES "qti"."choice" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__image_identifier_sp263ko24n") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."placed_hottext"
  ADD CONSTRAINT "__placed_hottext_fk_package_assembly_instance_copy_kcr4ogsb5x" FOREIGN KEY ("package", "assembly", "instance", "__copy_hottexts_md2dcayyk4", "path") REFERENCES "qti"."instance" ("package", "assembly", "start", "hottexts", "document") MATCH SIMPLE ON UPDATE CASCADE,
  ADD CONSTRAINT "__placed_hottext_fk_package_assembly_instance_jnsx5y3ord" FOREIGN KEY ("package", "assembly", "instance", "__predecessor_hottexts_4uwo3bx7x2") REFERENCES "qti"."placed_hottext" ("package", "assembly", "instance", "__index_hottexts_tdyulq7odh") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__placed_hottext_fk_image_package_image_path_start_2hdxp6k63k" FOREIGN KEY ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__image_identifier_sp263ko24n") REFERENCES "qti"."hottext" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__image_identifier_sp263ko24n") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."placed_id"
  ADD CONSTRAINT "__placed_id_fk_package_assembly_instance_copy_ids_izrndy7kd4" FOREIGN KEY ("package", "assembly", "instance", "__copy_ids_tljj3gujvw", "assembly_kind", "path") REFERENCES "qti"."instance" ("package", "assembly", "start", "ids", "assembly_kind", "document") MATCH SIMPLE ON UPDATE CASCADE,
  ADD CONSTRAINT "__placed_id_fk_package_assembly_instance_predecessor_atzlhmffck" FOREIGN KEY ("package", "assembly", "instance", "__predecessor_ids_rtodazzhin") REFERENCES "qti"."placed_id" ("package", "assembly", "instance", "__index_ids_ojwjtnxm2y") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."placed_idref"
  ADD CONSTRAINT "__placed_idref_fk_package_assembly_instance_copy_y6ekgq4pdf" FOREIGN KEY ("package", "assembly", "instance", "__copy_idref_targets_cv65ds7nu7", "path") REFERENCES "qti"."instance" ("package", "assembly", "start", "idref_targets", "document") MATCH SIMPLE ON UPDATE CASCADE,
  ADD CONSTRAINT "__placed_idref_fk_package_assembly_instance_hz5f2hoyse" FOREIGN KEY ("package", "assembly", "instance", "__predecessor_idref_targets_rgsj76jpds") REFERENCES "qti"."placed_idref" ("package", "assembly", "instance", "__index_idref_targets_fjkkfgwwk3") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__placed_idref_fk_image_package_image_path_image_id_rlbv7doedt" FOREIGN KEY ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "__image_id_cggscgoxcc") REFERENCES "qti"."idref_target" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "__image_id_cggscgoxcc") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."placed_math_rank"
  ADD CONSTRAINT "__placed_math_rank_fk_package_assembly_instance_path_ne6gauiyao" FOREIGN KEY ("package", "assembly", "instance", "path") REFERENCES "qti"."instance" ("package", "assembly", "start", "document") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__placed_math_rank_fk_package_path_start_5kblemgm5d" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."placed_share_target"
  ADD CONSTRAINT "__placed_share_target_fk_package_assembly_instance_o7a22jy6p7" FOREIGN KEY ("package", "assembly", "instance", "path", "assembly_kind") REFERENCES "qti"."instance" ("package", "assembly", "start", "document", "assembly_kind") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__placed_share_target_fk_package_assembly_instance_mcp6dsg3aq" FOREIGN KEY ("package", "assembly", "instance", "start") REFERENCES "qti"."placed_math_rank" ("package", "assembly", "instance", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__placed_share_target_fk_package_assembly_target_or2mupqns2" FOREIGN KEY ("package", "assembly", "target_instance", "target") REFERENCES "qti"."instance" ("package", "assembly", "start", "document") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__placed_share_target_fk_package_assembly_target_4oz3u75j3w" FOREIGN KEY ("package", "assembly", "target_instance", "target_start") REFERENCES "qti"."placed_math_rank" ("package", "assembly", "instance", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__placed_share_target_fk_package_path_start_vcyyao6ye2" FOREIGN KEY ("package", "path", "start", "__predecessor_placements_ppbi3jzzws") REFERENCES "qti"."placed_share_target" ("package", "path", "start", "__index_placements_n77jrjkfw2") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__placed_share_target_fk_imagecopy_package_imagecopy_fygoa7be6b" FOREIGN KEY ("__imagecopy_package_4oudcg2ick", "__imagecopy_path_2uz6mcb5mg", "start", "__copy_placements_iadanzgnox", "__imagecopy_id_yb43zw5kj3") REFERENCES "qti"."share_fragment" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "placements", "__image_id_cggscgoxcc") MATCH SIMPLE ON UPDATE CASCADE;

ALTER TABLE "qti"."placed_variable_ref"
  ADD CONSTRAINT "__placed_variable_ref_fk_package_assembly_instance_dyps6psgkb" FOREIGN KEY ("package", "assembly", "instance", "__copy_variables_wwybb3cjse", "path") REFERENCES "qti"."instance" ("package", "assembly", "start", "variables", "document") MATCH SIMPLE ON UPDATE CASCADE,
  ADD CONSTRAINT "__placed_variable_ref_fk_package_assembly_instance_4mpudl3t4u" FOREIGN KEY ("package", "assembly", "instance", "__predecessor_variables_5pxq25fpsp") REFERENCES "qti"."placed_variable_ref" ("package", "assembly", "instance", "__index_variables_efcmle332h") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__placed_variable_ref_fk_package_assembly_root_kind_kyz7jvyo7u" FOREIGN KEY ("package", "assembly", "root_kind") REFERENCES "qti"."document" ("package", "path", "root_kind") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__placed_variable_ref_fk_image_package_image_path_yskm3jisso" FOREIGN KEY ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "__image_identifier_sp263ko24n") REFERENCES "qti"."variable_ref" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "attribute", "__image_identifier_sp263ko24n") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."processing" ADD CONSTRAINT "__processing_fk_package_path_start_buuyxfkq34" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."reference_path" ADD CONSTRAINT "__reference_path_fk_package_target_pch7muxr75" FOREIGN KEY ("package", "target") REFERENCES "qti"."entry" ("package", "path") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."referring_document"
  ADD CONSTRAINT "__referring_document_fk_package_path_pred_contexts_tekv3unp3s" FOREIGN KEY ("package", "path", "__pred_contexts_leteqrd4bu") REFERENCES "qti"."fragment_context_name" ("package", "path", "__index_contexts_rurifjnewj") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__referring_document_fk_package_path_pred_feedbacks_u5un4znhy3" FOREIGN KEY ("package", "path", "__pred_feedbacks_c2txublcan") REFERENCES "qti"."fragment_feedback_name" ("package", "path", "__index_feedbacks_5unk6hkdlh") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__referring_document_fk_package_path_pred_prints_e4vmx7vqd3" FOREIGN KEY ("package", "path", "__pred_prints_uwxz5ocwj4") REFERENCES "qti"."fragment_printed_name" ("package", "path", "__index_prints_lrn5xrcnoj") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__referring_document_fk_package_path_pred_templates_qu4ntcliqa" FOREIGN KEY ("package", "path", "__pred_templates_5bo5q45wjw") REFERENCES "qti"."fragment_template_name" ("package", "path", "__index_templates_v2kw2euldh") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."resource_document" ADD CONSTRAINT "__resource_document_fk_package_path_root_kind_ejo23fxacl" FOREIGN KEY ("package", "path", "root_kind", "document_type") REFERENCES "qti"."document" ("package", "path", "root_kind", "document_type") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."rounding_mode_figures" ADD CONSTRAINT "__rounding_mode_figures_fk_image_package_image_path_blthitu5p3" FOREIGN KEY ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__image_figures_sc25qjl32r") REFERENCES "qti"."rounding_figures" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__image_figures_sc25qjl32r") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."sd_decl" ADD CONSTRAINT "__sd_decl_fk_package_path_xxx5gjp4e7" FOREIGN KEY ("package", "path") REFERENCES "qti"."xml_decl" ("package", "path") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."share_fragment"
  ADD CONSTRAINT "__share_fragment_fk_package_path_assembled_vdozoufbmn" FOREIGN KEY ("package", "path", "assembled") REFERENCES "qti"."document" ("package", "path", "assembled") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__share_fragment_fk_package_path_start_pred_ub5heqagwi" FOREIGN KEY ("package", "path", "start", "__pred_placements_wtijf47h4h") REFERENCES "qti"."placed_share_target" ("package", "path", "start", "__index_placements_n77jrjkfw2") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__share_fragment_fk_image_package_image_path_image_sjifnzl47q" FOREIGN KEY ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "__image_id_cggscgoxcc") REFERENCES "qti"."idref_target" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "__image_id_cggscgoxcc") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."share_target"
  ADD CONSTRAINT "__share_target_fk_package_path_start_vut3y6yjq2" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."math_rank" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__share_target_fk_package_path_target_start_lyzjcsg3y5" FOREIGN KEY ("package", "path", "target_start") REFERENCES "qti"."math_rank" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."site"
  ADD CONSTRAINT "__site_fk_package_path_start_children_ancestry_ghdva4523n" FOREIGN KEY ("package", "path", "start", "children", "ancestry", "governor", "kind", "nearest", "nearest_kind", "nearest_path", "parent_kind") REFERENCES "qti"."node" ("package", "path", "start", "children", "ancestry", "governor", "kind", "nearest", "nearest_kind", "nearest_path", "parent_kind") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__site_fk_package_path_start_parent_ixokdifhad" FOREIGN KEY ("package", "path", "start", "parent") REFERENCES "qti"."node" ("package", "path", "start", "parent") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."site_path" ADD CONSTRAINT "__site_path_fk_package_path_start_kind_molhlyyxr4" FOREIGN KEY ("package", "path", "start", "kind") REFERENCES "qti"."site" ("package", "path", "start", "kind") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."site_target"
  ADD CONSTRAINT "__site_target_fk_package_path_start_ancestry_kind_lpxx2rpzvs" FOREIGN KEY ("package", "path", "start", "ancestry", "kind", "nearest", "nearest_kind", "parent_kind") REFERENCES "qti"."site" ("package", "path", "start", "ancestry", "kind", "nearest", "nearest_kind", "parent_kind") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__site_target_fk_package_path_start_target_pozbyanaff" FOREIGN KEY ("package", "path", "start", "target") REFERENCES "qti"."site_path" ("package", "path", "start", "target") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__site_target_fk_package_path_copy_targets_522i3ld5uq" FOREIGN KEY ("package", "path", "__copy_targets_xc5togcb7o") REFERENCES "qti"."assembled_document" ("package", "path", "targets") MATCH SIMPLE ON UPDATE CASCADE,
  ADD CONSTRAINT "__site_target_fk_package_path_predecessor_targets_sfbwqrdgbs" FOREIGN KEY ("package", "path", "__predecessor_targets_rlmzypy6bt", "__before_targets_0_lktd4cazrk") REFERENCES "qti"."site_target" ("package", "path", "__index_targets_i7nnrmzfkn", "__after_targets_0_nsiq3pfnvg") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__site_target_fk_package_target_copy_targeted_by_mabgadjit7" FOREIGN KEY ("package", "target", "__copy_targeted_by_dnrpkr6fx2", "target_nearest", "target_nearest_kind", "target_nearest_path", "target_root") REFERENCES "qti"."document" ("package", "path", "targeted_by", "context_nearest", "context_nearest_kind", "context_path", "root_kind") MATCH SIMPLE ON UPDATE CASCADE,
  ADD CONSTRAINT "__site_target_fk_package_target_predecessor_targeted_i4ioybk4ms" FOREIGN KEY ("package", "target", "__predecessor_targeted_by_xvlpywmmd3", "__before_targeted_by_0_3lfv2ygldm") REFERENCES "qti"."site_target" ("package", "target", "__index_targeted_by_zcbbdfk6qk", "__after_targeted_by_0_rsywbgrrjw") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."srcset" ADD CONSTRAINT "__srcset_fk_image_package_image_path_start_pred_f7f46urpwl" FOREIGN KEY ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__pred_tokens_ip7mlgrtju", "__image_token_text_eg2a7htxbl") REFERENCES "qti"."srcset_candidate" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "at", "__image_pieces_after_nxvecwbwoy") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."srcset_candidate"
  ADD CONSTRAINT "__srcset_candidate_fk_package_path_start_copy_tokens_prty6vocql" FOREIGN KEY ("package", "path", "start", "__copy_tokens_mhv3zj45jr") REFERENCES "qti"."srcset" ("package", "path", "start", "tokens") MATCH SIMPLE ON UPDATE CASCADE,
  ADD CONSTRAINT "__srcset_candidate_fk_image_package_image_path_start_3ffqa3l66g" FOREIGN KEY ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__pred_at_xktcobhsti", "__image_pieces_was_qr42vzdoqq") REFERENCES "qti"."srcset_candidate" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "at", "__image_pieces_after_nxvecwbwoy") MATCH SIMPLE;

ALTER TABLE "qti"."ssml_scope" ADD CONSTRAINT "__ssml_scope_fk_package_path_start_ixilycttqs" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."table_header" ADD CONSTRAINT "__table_header_fk_package_path_start_dhca6a32iq" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."table_scope" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."table_scope" ADD CONSTRAINT "__table_scope_fk_package_path_start_scalw6ieaw" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("package", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."text_idref"
  ADD CONSTRAINT "__text_idref_fk_package_path_start_copy_tokens_hkmj36vgbn" FOREIGN KEY ("package", "path", "start", "__copy_tokens_rrsly23qzp") REFERENCES "qti"."identity_text" ("package", "path", "start", "tokens") MATCH SIMPLE ON UPDATE CASCADE,
  ADD CONSTRAINT "__text_idref_fk_image_package_image_path_start_pred_ffsn3dgfq5" FOREIGN KEY ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__pred_at_xktcobhsti", "__image_pieces_was_qr42vzdoqq") REFERENCES "qti"."text_idref" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "at", "__image_pieces_after_nxvecwbwoy") MATCH SIMPLE,
  ADD CONSTRAINT "__text_idref_fk_image_package_image_path_image_token_4pqg6lzbza" FOREIGN KEY ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "__image_token_arko66iuth") REFERENCES "qti"."idref_target" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "__image_id_cggscgoxcc") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."text_reference_path" ADD CONSTRAINT "__text_reference_path_fk_package_target_7wuvskqxw6" FOREIGN KEY ("package", "target") REFERENCES "qti"."entry" ("package", "path") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."tolerance" ADD CONSTRAINT "__tolerance_fk_image_package_image_path_start_pred_pao2kfjjm5" FOREIGN KEY ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__pred_tokens_ip7mlgrtju", "__image_token_text_eg2a7htxbl") REFERENCES "qti"."tolerance_token" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "at", "__image_pieces_after_nxvecwbwoy") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."tolerance_token"
  ADD CONSTRAINT "__tolerance_token_fk_package_path_start_copy_tokens_hgndbm6n65" FOREIGN KEY ("package", "path", "start", "__copy_tokens_zlo7jvsicr") REFERENCES "qti"."tolerance" ("package", "path", "start", "tokens") MATCH SIMPLE ON UPDATE CASCADE,
  ADD CONSTRAINT "__tolerance_token_fk_image_package_image_path_start_wyrgtstoie" FOREIGN KEY ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__pred_at_xktcobhsti", "__image_pieces_was_qr42vzdoqq") REFERENCES "qti"."tolerance_token" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "at", "__image_pieces_after_nxvecwbwoy") MATCH SIMPLE;

ALTER TABLE "qti"."usage_value"
  ADD CONSTRAINT "__usage_value_fk_package_path_start_hgeaq5bglh" FOREIGN KEY ("package", "path", "start") REFERENCES "qti"."node" ("__package_pzlq2bwqm3", "path", "start") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__usage_value_fk_image_package_image_path_start_isiw43fhwn" FOREIGN KEY ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__image_text_nik2jnknxc") REFERENCES "qti"."node" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__image_string_value_fromrjgqg2") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."usage_value_base_type" ADD CONSTRAINT "__usage_value_base_type_fk_image_package_image_path_qrgg7olnaw" FOREIGN KEY ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__image_text_nik2jnknxc") REFERENCES "qti"."node" ("__image_package_x4j5zex3fr", "__image_path_ff7ysgcuo3", "start", "__image_string_value_fromrjgqg2") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."variable_ref"
  ADD CONSTRAINT "__variable_ref_fk_package_path_start_attribute_mtdx46lozb" FOREIGN KEY ("package", "path", "start", "attribute") REFERENCES "qti"."attribute" ("package", "path", "start", "name") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT "__variable_ref_fk_package_path_copy_variables_root_34sbliitcl" FOREIGN KEY ("package", "path", "__copy_variables_7dc76fdnq4", "root_kind") REFERENCES "qti"."document" ("package", "path", "variables", "root_kind") MATCH SIMPLE ON UPDATE CASCADE,
  ADD CONSTRAINT "__variable_ref_fk_package_path_predecessor_variables_aub5ukyc33" FOREIGN KEY ("package", "path", "__predecessor_variables_bn3p347xvh") REFERENCES "qti"."variable_ref" ("package", "path", "__index_variables_7hpd35redf") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "qti"."xml_decl" ADD CONSTRAINT "__xml_decl_fk_package_path_ge2web3hon" FOREIGN KEY ("package", "path") REFERENCES "qti"."document" ("package", "path") MATCH SIMPLE DEFERRABLE INITIALLY DEFERRED;
