


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";



CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";



CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";



CREATE EXTENSION IF NOT EXISTS "unaccent" WITH SCHEMA "public";



CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";



CREATE TYPE "public"."ad_status" AS ENUM (
    'active',
    'expired',
    'banned',
    'inactive',
    'archived',
    'deleted'
);


ALTER TYPE "public"."ad_status" OWNER TO "postgres";


CREATE TYPE "public"."ad_type" AS ENUM (
    'offer',
    'search'
);


ALTER TYPE "public"."ad_type" OWNER TO "postgres";


CREATE TYPE "public"."transaction_status" AS ENUM (
    'pending',
    'completed',
    'failed'
);


ALTER TYPE "public"."transaction_status" OWNER TO "postgres";


CREATE TYPE "public"."transaction_type" AS ENUM (
    'activation',
    'extension',
    'bump'
);


ALTER TYPE "public"."transaction_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ads_fts_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.fts := to_tsvector('polish', 
    COALESCE(NEW.title, '') || ' ' || 
    COALESCE(NEW.description, '') || ' ' || 
    COALESCE(NEW.subject, '')
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."ads_fts_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."complete_payment"("p_transaction_id" "uuid", "p_payment_id" "text" DEFAULT NULL::"text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_ad_id UUID;
    v_tx_type TEXT;
    v_current_status TEXT;
BEGIN
    -- Lock the transaction row to prevent race conditions
    SELECT ad_id, type, status
    INTO v_ad_id, v_tx_type, v_current_status
    FROM transactions
    WHERE id = p_transaction_id
    FOR UPDATE;

    -- Check if transaction exists
    IF v_ad_id IS NULL THEN
        RAISE EXCEPTION 'Transaction not found: %', p_transaction_id;
    END IF;

    -- Idempotency check: if already completed, return false (no action needed)
    IF v_current_status = 'completed' THEN
        RETURN FALSE;
    END IF;

    -- Update transaction to completed
    UPDATE transactions
    SET
        status = 'completed',
        payment_id = p_payment_id
    WHERE id = p_transaction_id;

    -- Update ad based on transaction type
    IF v_tx_type = 'activation' THEN
        -- Activation: set active, set expiry to 30 days, set visible_at to now
        UPDATE ads
        SET
            status = 'active',
            expires_at = NOW() + INTERVAL '30 days',
            visible_at = NOW()
        WHERE id = v_ad_id;

    ELSIF v_tx_type = 'extension' THEN
        -- Extension: extend expiry by 30 days from current expiry or now, reset warning
        UPDATE ads
        SET
            status = 'active',
            expires_at = GREATEST(COALESCE(expires_at, NOW()), NOW()) + INTERVAL '30 days',
            expiring_warning_sent_at = NULL
        WHERE id = v_ad_id;

    ELSIF v_tx_type = 'bump' THEN
        -- Bump: update visible_at to push to top of listings
        UPDATE ads
        SET
            visible_at = NOW()
        WHERE id = v_ad_id;
    END IF;

    RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."complete_payment"("p_transaction_id" "uuid", "p_payment_id" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."complete_payment"("p_transaction_id" "uuid", "p_payment_id" "text") IS 'Atomically completes a payment transaction and updates the associated ad. Handles activation, extension, and bump transaction types.';



CREATE OR REPLACE FUNCTION "public"."increment_ad_view"("ad_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  update ads
  set views_count = coalesce(views_count, 0) + 1
  where id = ad_id;
end;
$$;


ALTER FUNCTION "public"."increment_ad_view"("ad_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_contact_count"("ad_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE ads
  SET contact_count = COALESCE(contact_count, 0) + 1
  WHERE id = ad_id;
END;
$$;


ALTER FUNCTION "public"."increment_contact_count"("ad_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_visible_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.visible_at IS NULL THEN
    NEW.visible_at := NOW();
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_visible_at"() OWNER TO "postgres";


CREATE TEXT SEARCH CONFIGURATION "public"."polish" (
    PARSER = "pg_catalog"."default" );

ALTER TEXT SEARCH CONFIGURATION "public"."polish"
    ADD MAPPING FOR "asciiword" WITH "public"."unaccent", "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."polish"
    ADD MAPPING FOR "word" WITH "public"."unaccent", "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."polish"
    ADD MAPPING FOR "numword" WITH "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."polish"
    ADD MAPPING FOR "email" WITH "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."polish"
    ADD MAPPING FOR "url" WITH "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."polish"
    ADD MAPPING FOR "host" WITH "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."polish"
    ADD MAPPING FOR "sfloat" WITH "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."polish"
    ADD MAPPING FOR "version" WITH "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."polish"
    ADD MAPPING FOR "hword_numpart" WITH "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."polish"
    ADD MAPPING FOR "hword_part" WITH "public"."unaccent", "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."polish"
    ADD MAPPING FOR "hword_asciipart" WITH "public"."unaccent", "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."polish"
    ADD MAPPING FOR "numhword" WITH "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."polish"
    ADD MAPPING FOR "asciihword" WITH "public"."unaccent", "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."polish"
    ADD MAPPING FOR "hword" WITH "public"."unaccent", "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."polish"
    ADD MAPPING FOR "url_path" WITH "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."polish"
    ADD MAPPING FOR "file" WITH "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."polish"
    ADD MAPPING FOR "float" WITH "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."polish"
    ADD MAPPING FOR "int" WITH "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."polish"
    ADD MAPPING FOR "uint" WITH "simple";


ALTER TEXT SEARCH CONFIGURATION "public"."polish" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."ads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "type" "public"."ad_type" DEFAULT 'offer'::"public"."ad_type" NOT NULL,
    "status" "public"."ad_status" DEFAULT 'active'::"public"."ad_status" NOT NULL,
    "management_token" "uuid" DEFAULT "gen_random_uuid"(),
    "email" "text" NOT NULL,
    "phone_contact" "text" NOT NULL,
    "phone_hash" "text" DEFAULT 'NULL'::"text",
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "subject" "text" NOT NULL,
    "location" "text" NOT NULL,
    "education_level" "text"[] DEFAULT '{}'::"text"[],
    "tutor_gender" "text" DEFAULT 'nie chcę podawać'::"text",
    "price_amount" numeric(10,2),
    "price_unit" "text" DEFAULT '60 min'::"text",
    "visible_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone DEFAULT ("now"() + '30 days'::interval),
    "views_count" integer DEFAULT 0,
    "expiring_warning_sent_at" timestamp with time zone,
    "fts" "tsvector",
    "contact_count" integer DEFAULT 0,
    "is_featured" boolean DEFAULT false NOT NULL,
    "subjects" "text"[] DEFAULT '{}'::"text"[]
);


ALTER TABLE "public"."ads" OWNER TO "postgres";


COMMENT ON COLUMN "public"."ads"."visible_at" IS 'Timestamp used for listing order - updated when ad is promoted';



COMMENT ON COLUMN "public"."ads"."fts" IS 'Full-text search tsvector for Polish language search';



COMMENT ON COLUMN "public"."ads"."contact_count" IS 'Number of times users clicked to reveal/call the phone number';



CREATE TABLE IF NOT EXISTS "public"."phone_hashes" (
    "phone_hash" "text" NOT NULL,
    "deleted_at" timestamp without time zone
);


ALTER TABLE "public"."phone_hashes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "ad_id" "uuid",
    "payment_id" "text",
    "amount" integer NOT NULL,
    "status" "public"."transaction_status" DEFAULT 'pending'::"public"."transaction_status",
    "type" "public"."transaction_type" NOT NULL,
    "payment_provider" "text",
    "payment_session_id" "text",
    "webhook_received_at" timestamp with time zone,
    "error_message" "text",
    CONSTRAINT "transactions_payment_provider_check" CHECK (("payment_provider" = ANY (ARRAY['p24'::"text", 'stripe'::"text"])))
);


ALTER TABLE "public"."transactions" OWNER TO "postgres";


COMMENT ON COLUMN "public"."transactions"."payment_provider" IS 'Payment gateway used: p24, tpay, or manual';



COMMENT ON COLUMN "public"."transactions"."payment_session_id" IS 'External payment session ID for webhook correlation';



COMMENT ON COLUMN "public"."transactions"."webhook_received_at" IS 'Timestamp when payment confirmation webhook was received';



COMMENT ON COLUMN "public"."transactions"."error_message" IS 'Error details for failed transactions';



ALTER TABLE ONLY "public"."ads"
    ADD CONSTRAINT "ads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."phone_hashes"
    ADD CONSTRAINT "phone_hashes_pkey" PRIMARY KEY ("phone_hash");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("id");



CREATE INDEX "ads_management_token_idx" ON "public"."ads" USING "btree" ("management_token");



CREATE INDEX "ads_phone_hash_idx" ON "public"."ads" USING "btree" ("phone_hash");



CREATE INDEX "ads_visible_at_idx" ON "public"."ads" USING "btree" ("visible_at" DESC);



CREATE INDEX "idx_ads_expires_at" ON "public"."ads" USING "btree" ("expires_at") WHERE ("status" = 'active'::"public"."ad_status");



CREATE INDEX "idx_ads_expiring_warning" ON "public"."ads" USING "btree" ("expiring_warning_sent_at") WHERE ("expiring_warning_sent_at" IS NULL);



CREATE INDEX "idx_ads_fts" ON "public"."ads" USING "gin" ("fts");



CREATE INDEX "idx_ads_listing" ON "public"."ads" USING "btree" ("status", "type", "visible_at" DESC);



CREATE INDEX "idx_ads_management_token" ON "public"."ads" USING "btree" ("management_token");



CREATE INDEX "idx_ads_phone_hash" ON "public"."ads" USING "btree" ("phone_hash");



CREATE INDEX "idx_ads_status" ON "public"."ads" USING "btree" ("status");



CREATE INDEX "idx_ads_type" ON "public"."ads" USING "btree" ("type");



CREATE INDEX "idx_phone_hashes_phone_hash" ON "public"."phone_hashes" USING "btree" ("phone_hash");



CREATE INDEX "idx_transactions_session" ON "public"."transactions" USING "btree" ("payment_session_id");



CREATE INDEX "idx_transactions_status" ON "public"."transactions" USING "btree" ("status");



CREATE OR REPLACE TRIGGER "ads_fts_trigger" BEFORE INSERT OR UPDATE OF "title", "description", "subject" ON "public"."ads" FOR EACH ROW EXECUTE FUNCTION "public"."ads_fts_update"();



CREATE OR REPLACE TRIGGER "ads_set_visible_at" BEFORE INSERT ON "public"."ads" FOR EACH ROW EXECUTE FUNCTION "public"."set_visible_at"();



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_ad_id_fkey" FOREIGN KEY ("ad_id") REFERENCES "public"."ads"("id") ON DELETE SET NULL;



CREATE POLICY "Public ads are viewable by everyone" ON "public"."ads" FOR SELECT USING (("status" = 'active'::"public"."ad_status"));



ALTER TABLE "public"."ads" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."phone_hashes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transactions" ENABLE ROW LEVEL SECURITY;



ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."ads_fts_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."ads_fts_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ads_fts_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."complete_payment"("p_transaction_id" "uuid", "p_payment_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."complete_payment"("p_transaction_id" "uuid", "p_payment_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."complete_payment"("p_transaction_id" "uuid", "p_payment_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_ad_view"("ad_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_ad_view"("ad_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_ad_view"("ad_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_contact_count"("ad_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_contact_count"("ad_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_contact_count"("ad_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_visible_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_visible_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_visible_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."unaccent"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."unaccent"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."unaccent"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unaccent"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."unaccent"("regdictionary", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."unaccent"("regdictionary", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."unaccent"("regdictionary", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unaccent"("regdictionary", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."unaccent_init"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."unaccent_init"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."unaccent_init"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unaccent_init"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."unaccent_lexize"("internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."unaccent_lexize"("internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."unaccent_lexize"("internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unaccent_lexize"("internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON TABLE "public"."ads" TO "anon";
GRANT ALL ON TABLE "public"."ads" TO "authenticated";
GRANT ALL ON TABLE "public"."ads" TO "service_role";



GRANT ALL ON TABLE "public"."phone_hashes" TO "anon";
GRANT ALL ON TABLE "public"."phone_hashes" TO "authenticated";
GRANT ALL ON TABLE "public"."phone_hashes" TO "service_role";



GRANT ALL ON TABLE "public"."transactions" TO "anon";
GRANT ALL ON TABLE "public"."transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."transactions" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";



