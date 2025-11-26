-- 20241128_storage_fix.sql neutralized
-- Reason: storage schema is ownership-restricted; prior attempt to create view caused permission errors.
-- Action: handle id type mismatch at application query level by casting uuid to text (e.g. buckets_analytics.id::text).
-- Safe sentinel migration to preserve version sequence without side effects.
SELECT 1;
