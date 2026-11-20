ALTER TABLE "qti"."assembled_id" RENAME COLUMN "copy" TO "__aside_copy_xqx3uyktr3";

ALTER TABLE "qti"."assembled_id" RENAME COLUMN "__aside_copy_xqx3uyktr3" TO "instance";

ALTER TABLE "qti"."assembled_id" RENAME CONSTRAINT "__assembled_id_key_package_assembly_id_path_owner_sfh2pqi4rn" TO "__aside_assembled_id_key_package_assembly_id_path_wfeysudgsf";

ALTER TABLE "qti"."assembled_id" RENAME CONSTRAINT "__aside_assembled_id_key_package_assembly_id_path_wfeysudgsf" TO "__assembled_id_key_package_assembly_id_path_owner_giicdcsowk";
