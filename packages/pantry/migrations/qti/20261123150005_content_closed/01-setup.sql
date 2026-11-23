ALTER TABLE "qti"."package" RENAME COLUMN "name" TO "__aside_name_fpryeegvjd";

ALTER TABLE "qti"."package" RENAME COLUMN "__aside_name_fpryeegvjd" TO "package";

ALTER TABLE "qti"."entry" RENAME CONSTRAINT "__entry_fk_package_tzyfqvwqow" TO "__aside_entry_fk_package_tzyfqvwqow_sztqej66rb";

ALTER TABLE "qti"."entry" RENAME CONSTRAINT "__aside_entry_fk_package_tzyfqvwqow_sztqej66rb" TO "__entry_fk_package_xbbjcsgg4p";
