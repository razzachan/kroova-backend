-- 20241129_storage_view.sql
-- Persist public view workaround for bucket listing without triggering Supabase storage internal UNION uuid/text error.
-- Idempotent: only creates view if absent; view casts analytics id UUID to text.
CREATE OR REPLACE VIEW public.storage_all_buckets AS
  SELECT b.id,
         b.name,
         b.public,
         b.owner,
         b.created_at,
         b.updated_at,
         b.file_size_limit,
         b.allowed_mime_types,
         b.type::text AS type
    FROM storage.buckets b
  UNION ALL
  SELECT a.id::text       AS id,
         a.id::text       AS name,
         NULL::boolean    AS public,
         NULL::uuid       AS owner,
         a.created_at,
         a.updated_at,
         NULL::bigint     AS file_size_limit,
         NULL::text[]     AS allowed_mime_types,
         a.type::text     AS type
    FROM storage.buckets_analytics a;

-- Insert migration record (pattern consistent with prior sentinel style)
-- (Removed manual sentinel insert; Supabase CLI tracks this file automatically.)
