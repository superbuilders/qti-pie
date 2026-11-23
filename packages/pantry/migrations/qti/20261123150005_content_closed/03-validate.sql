CREATE OR REPLACE FUNCTION "qti"."__immutable_package_ajngq3jptc"() RETURNS "pg_catalog"."trigger"
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = "pg_catalog", "pg_temp"
AS $$
BEGIN
  IF "pg_catalog"."record_image_ne"(ROW(OLD."package"), ROW(NEW."package")) THEN RAISE EXCEPTION 'an UPDATE of an immutable relation changes its row' USING ERRCODE = 'insufficient_privilege'::"pg_catalog"."text", SCHEMA = TG_TABLE_SCHEMA, TABLE = TG_TABLE_NAME, HINT = 'declare mutable(Package) among the schema''s rules, or delete the row and insert it again'::"pg_catalog"."text"; END IF;
  RETURN NEW;
END
$$;
