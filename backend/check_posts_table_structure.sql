-- Check the actual structure of sparkle_posts table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'sparkle_posts'
ORDER BY ordinal_position;

-- Check if the table exists
SELECT tablename FROM pg_tables WHERE tablename = 'sparkle_posts';
