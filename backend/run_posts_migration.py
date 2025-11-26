#!/usr/bin/env python3
"""
Quick script to fix sparkle_posts table permissions
Disables RLS and grants permissions for Phase 1 mock auth
"""
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    print("❌ Error: SUPABASE_URL and SUPABASE_KEY must be set in .env")
    exit(1)

supabase: Client = create_client(supabase_url, supabase_key)

print("=" * 70)
print("FIX SPARKLE_POSTS PERMISSIONS")
print("=" * 70)
print()

# Read the migration file
migration_file = "migrations/05_fix_posts_permissions.sql"
if not os.path.exists(migration_file):
    print(f"❌ Error: {migration_file} not found")
    exit(1)

with open(migration_file, 'r') as f:
    sql_content = f.read()

print(f"📄 Migration file loaded: {migration_file}")
print()

# Split SQL into individual statements (remove diagnostic SELECT queries)
sql_statements = [
    "ALTER TABLE public.sparkle_posts DISABLE ROW LEVEL SECURITY;",
    "DROP POLICY IF EXISTS posts_policy ON public.sparkle_posts;",
    "DROP POLICY IF EXISTS user_own_posts ON public.sparkle_posts;",
    "GRANT ALL ON public.sparkle_posts TO service_role;",
    "GRANT ALL ON public.sparkle_posts TO authenticated;",
    "GRANT ALL ON public.sparkle_posts TO anon;",
]

print("⚠️  To apply this migration, you need to:")
print()
print("1. Go to Supabase Dashboard: https://app.supabase.com")
print("2. Select your project: lwgzhsohwqgijajawrhk")
print("3. Navigate to: SQL Editor")
print("4. Create a new query and paste the following SQL:")
print()
print("=" * 70)
print(sql_content)
print("=" * 70)
print()
print("5. Click 'Run' to execute")
print()
print("Alternatively, run these commands one by one:")
print()
for i, stmt in enumerate(sql_statements, 1):
    print(f"{i}. {stmt}")
print()
print("=" * 70)
print("After running the migration, restart your mobile app to test.")
print("=" * 70)
