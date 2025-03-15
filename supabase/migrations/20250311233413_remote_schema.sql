

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


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."chart_visibility" AS ENUM (
    'private',
    'unlisted',
    'public'
);


ALTER TYPE "public"."chart_visibility" OWNER TO "postgres";


CREATE TYPE "public"."reaction_type" AS ENUM (
    'like',
    'dislike'
);


ALTER TYPE "public"."reaction_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_gallery_charts"("p_user_id" "uuid", "p_limit" bigint, "p_offset" bigint) RETURNS TABLE("id" "uuid", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "data" "jsonb", "username" "text", "is_fav" boolean, "user_reaction" "public"."reaction_type", "likes_count" bigint, "dislikes_count" bigint, "visibility" "public"."chart_visibility")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.created_at,
        c.updated_at,
        c.data,        
        c.username,
        CASE WHEN fav.chart_id IS NOT NULL THEN true ELSE false END AS is_fav,
        r.reaction_type AS user_reaction,
        COALESCE(likes.count, 0)::bigint AS likes_count,
        COALESCE(dislikes.count, 0)::bigint AS dislikes_count,
        c.visibility
    FROM
        charts_with_usernames c
    LEFT JOIN
        user_favorites fav ON c.id = fav.chart_id AND fav.user_id = p_user_id
    LEFT JOIN
        user_chart_reactions r ON c.id = r.chart_id AND r.user_id = p_user_id
    LEFT JOIN (
        SELECT chart_id, COUNT(*) as count
        FROM user_chart_reactions
        WHERE reaction_type = 'like'
        GROUP BY chart_id
    ) likes ON c.id = likes.chart_id
    LEFT JOIN (
        SELECT chart_id, COUNT(*) as count
        FROM user_chart_reactions
        WHERE reaction_type = 'dislike'
        GROUP BY chart_id
    ) dislikes ON c.id = dislikes.chart_id
    WHERE
        c.visibility = 'public'
    ORDER BY
        c.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;


ALTER FUNCTION "public"."get_gallery_charts"("p_user_id" "uuid", "p_limit" bigint, "p_offset" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_charts"("p_user_id" "uuid", "p_limit" bigint, "p_offset" bigint, "p_filter" "text") RETURNS TABLE("id" "uuid", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "data" "jsonb", "origin" "jsonb", "username" "text", "is_fav" boolean, "user_reaction" "public"."reaction_type", "likes_count" bigint, "dislikes_count" bigint, "visibility" "public"."chart_visibility")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.created_at,
        c.updated_at,
        c.data,
        c.origin,
        c.username,
        CASE WHEN fav.chart_id IS NOT NULL THEN true ELSE false END AS is_fav,
        r.reaction_type AS user_reaction,
        COALESCE(likes.count, 0)::bigint AS likes_count,
        COALESCE(dislikes.count, 0)::bigint AS dislikes_count,
        c.visibility
    FROM
        charts_with_usernames c
    LEFT JOIN
        user_favorites fav ON c.id = fav.chart_id AND fav.user_id = p_user_id
    LEFT JOIN
        user_chart_reactions r ON c.id = r.chart_id AND r.user_id = p_user_id
    LEFT JOIN (
        SELECT chart_id, COUNT(*) as count
        FROM user_chart_reactions
        WHERE reaction_type = 'like'
        GROUP BY chart_id
    ) likes ON c.id = likes.chart_id
    LEFT JOIN (
        SELECT chart_id, COUNT(*) as count
        FROM user_chart_reactions
        WHERE reaction_type = 'dislike'
        GROUP BY chart_id
    ) dislikes ON c.id = dislikes.chart_id
    WHERE
        CASE
            WHEN p_filter = 'favorited' THEN fav.chart_id IS NOT NULL
            WHEN p_filter = 'posted' THEN c.visibility = 'public' AND c.user_id = p_user_id
            WHEN p_filter = 'public' THEN c.visibility = 'public' AND c.user_id = p_user_id
            WHEN p_filter = 'unlisted' THEN c.visibility = 'unlisted' AND c.user_id = p_user_id
            WHEN p_filter = 'liked' THEN r.reaction_type = 'like' AND r.user_id = p_user_id AND c.visibility = 'public'
            WHEN p_filter = 'all' THEN p_user_id = c.user_id
            WHEN p_filter ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 
                c.id::text = p_filter AND (c.visibility IN ('public', 'unlisted') OR c.user_id = p_user_id)
            ELSE c.user_id = p_user_id
        END
    ORDER BY
        c.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;


ALTER FUNCTION "public"."get_user_charts"("p_user_id" "uuid", "p_limit" bigint, "p_offset" bigint, "p_filter" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."charts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "data" "jsonb" NOT NULL,
    "origin" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "likes_count" bigint DEFAULT 0,
    "visibility" "public"."chart_visibility" DEFAULT 'private'::"public"."chart_visibility" NOT NULL
);


ALTER TABLE "public"."charts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "username" "text",
    "full_name" "text",
    "avatar_url" "text",
    "website" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "username_length" CHECK (("char_length"("username") >= 3))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."charts_with_usernames" WITH ("security_invoker"='on') AS
 SELECT "c"."id",
    "c"."user_id",
    "c"."created_at",
    "c"."updated_at",
    "c"."data",
    "c"."origin",
    "p"."username",
    "c"."visibility"
   FROM ("public"."charts" "c"
     JOIN "public"."profiles" "p" ON (("c"."user_id" = "p"."id")));


ALTER TABLE "public"."charts_with_usernames" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chats" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "messages" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "suggestions" "text"[],
    "usage" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL
);


ALTER TABLE "public"."chats" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."chat_summary" WITH ("security_invoker"='on') AS
 SELECT "c"."id" AS "chat_id",
    "c"."title",
    "c"."updated_at",
    "c"."user_id",
    "jsonb_array_length"("c"."messages") AS "message_count"
   FROM "public"."chats" "c"
  ORDER BY "c"."updated_at" DESC;


ALTER TABLE "public"."chat_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_chart_forks" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "chart_id" "uuid"
);


ALTER TABLE "public"."user_chart_forks" OWNER TO "postgres";


ALTER TABLE "public"."user_chart_forks" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_chart_forks_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_chart_reactions" (
    "user_id" "uuid" NOT NULL,
    "chart_id" "uuid" NOT NULL,
    "reaction_type" "public"."reaction_type",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."user_chart_reactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_favorites" (
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "chart_id" "uuid" NOT NULL
);


ALTER TABLE "public"."user_favorites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_feedback" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "feedback" "jsonb" NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL
);


ALTER TABLE "public"."user_feedback" OWNER TO "postgres";


ALTER TABLE "public"."user_feedback" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_feedback_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."waitlist" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "email" character varying NOT NULL,
    "is_invited" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."waitlist" OWNER TO "postgres";


ALTER TABLE "public"."waitlist" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."waitlist_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."charts"
    ADD CONSTRAINT "charts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chats"
    ADD CONSTRAINT "chats_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."user_chart_forks"
    ADD CONSTRAINT "user_chart_forks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_favorites"
    ADD CONSTRAINT "user_favorites_pkey" PRIMARY KEY ("user_id", "chart_id");



ALTER TABLE ONLY "public"."user_feedback"
    ADD CONSTRAINT "user_feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_chart_reactions"
    ADD CONSTRAINT "user_likes_dislikes_pkey" PRIMARY KEY ("user_id", "chart_id");



ALTER TABLE ONLY "public"."waitlist"
    ADD CONSTRAINT "waitlist_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."waitlist"
    ADD CONSTRAINT "waitlist_pkey" PRIMARY KEY ("id");



CREATE INDEX "charts_visibility_idx" ON "public"."charts" USING "btree" ("visibility");



ALTER TABLE ONLY "public"."chats"
    ADD CONSTRAINT "charts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."charts"
    ADD CONSTRAINT "charts_user_id_fkey1" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE RESTRICT ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_chart_forks"
    ADD CONSTRAINT "user_chart_forks_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "public"."charts"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_chart_forks"
    ADD CONSTRAINT "user_chart_forks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_favorites"
    ADD CONSTRAINT "user_favorites_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "public"."charts"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_favorites"
    ADD CONSTRAINT "user_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_feedback"
    ADD CONSTRAINT "user_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_chart_reactions"
    ADD CONSTRAINT "user_likes_dislikes_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "public"."charts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_chart_reactions"
    ADD CONSTRAINT "user_likes_dislikes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "CRUD based on user_id" ON "public"."user_chart_reactions" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "CRUD for users for their user_id" ON "public"."user_favorites" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable CRUD for users based on user_id" ON "public"."charts" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable insert for users based on user_id" ON "public"."user_chart_forks" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable insert for users based on user_id" ON "public"."user_feedback" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable public inserts" ON "public"."waitlist" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Enable read access for unlisted and public charts" ON "public"."charts" FOR SELECT USING (("visibility" = ANY (ARRAY['unlisted'::"public"."chart_visibility", 'public'::"public"."chart_visibility"])));



CREATE POLICY "Enable read access if user is creator or chart is public/unlist" ON "public"."user_chart_forks" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."charts" "c"
  WHERE (("c"."id" = "user_chart_forks"."chart_id") AND (("c"."visibility" = ANY (ARRAY['unlisted'::"public"."chart_visibility", 'public'::"public"."chart_visibility"])) OR ("c"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Enable read for chart public or is owner" ON "public"."user_chart_reactions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."charts" "c"
  WHERE (("c"."id" = "user_chart_reactions"."chart_id") AND (("c"."visibility" = 'public'::"public"."chart_visibility") OR ("c"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Enable read for public charts in gallery" ON "public"."charts" FOR SELECT TO "authenticated" USING (("visibility" = 'public'::"public"."chart_visibility"));



CREATE POLICY "Enable read forks for public/unlisted/own charts" ON "public"."user_chart_forks" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."charts" "c"
  WHERE (("c"."id" = "user_chart_forks"."chart_id") AND (("c"."visibility" = ANY (ARRAY['unlisted'::"public"."chart_visibility", 'public'::"public"."chart_visibility"])) OR ("c"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Enable read reactions for public charts" ON "public"."user_chart_reactions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."charts" "c"
  WHERE (("c"."id" = "user_chart_reactions"."chart_id") AND ("c"."visibility" = 'public'::"public"."chart_visibility")))));



CREATE POLICY "Public profiles are viewable by everyone." ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Users can insert their own profile." ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Users can update own profile." ON "public"."profiles" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "allow users to CRUD their chats" ON "public"."chats" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."charts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chats" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_chart_forks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_chart_reactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_favorites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_feedback" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."waitlist" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






































































































































































































GRANT ALL ON FUNCTION "public"."get_gallery_charts"("p_user_id" "uuid", "p_limit" bigint, "p_offset" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_gallery_charts"("p_user_id" "uuid", "p_limit" bigint, "p_offset" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_gallery_charts"("p_user_id" "uuid", "p_limit" bigint, "p_offset" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_charts"("p_user_id" "uuid", "p_limit" bigint, "p_offset" bigint, "p_filter" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_charts"("p_user_id" "uuid", "p_limit" bigint, "p_offset" bigint, "p_filter" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_charts"("p_user_id" "uuid", "p_limit" bigint, "p_offset" bigint, "p_filter" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";





















GRANT ALL ON TABLE "public"."charts" TO "anon";
GRANT ALL ON TABLE "public"."charts" TO "authenticated";
GRANT ALL ON TABLE "public"."charts" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."charts_with_usernames" TO "anon";
GRANT ALL ON TABLE "public"."charts_with_usernames" TO "authenticated";
GRANT ALL ON TABLE "public"."charts_with_usernames" TO "service_role";



GRANT ALL ON TABLE "public"."chats" TO "anon";
GRANT ALL ON TABLE "public"."chats" TO "authenticated";
GRANT ALL ON TABLE "public"."chats" TO "service_role";



GRANT ALL ON TABLE "public"."chat_summary" TO "anon";
GRANT ALL ON TABLE "public"."chat_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_summary" TO "service_role";



GRANT ALL ON TABLE "public"."user_chart_forks" TO "anon";
GRANT ALL ON TABLE "public"."user_chart_forks" TO "authenticated";
GRANT ALL ON TABLE "public"."user_chart_forks" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_chart_forks_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_chart_forks_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_chart_forks_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_chart_reactions" TO "anon";
GRANT ALL ON TABLE "public"."user_chart_reactions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_chart_reactions" TO "service_role";



GRANT ALL ON TABLE "public"."user_favorites" TO "anon";
GRANT ALL ON TABLE "public"."user_favorites" TO "authenticated";
GRANT ALL ON TABLE "public"."user_favorites" TO "service_role";



GRANT ALL ON TABLE "public"."user_feedback" TO "anon";
GRANT ALL ON TABLE "public"."user_feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."user_feedback" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_feedback_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_feedback_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_feedback_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."waitlist" TO "anon";
GRANT ALL ON TABLE "public"."waitlist" TO "authenticated";
GRANT ALL ON TABLE "public"."waitlist" TO "service_role";



GRANT ALL ON SEQUENCE "public"."waitlist_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."waitlist_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."waitlist_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
