#!/usr/bin/env python3
"""
Database migration script for Sparkle app
Executes the SQL schema to create all necessary tables
"""
from database import supabase
import os

def read_sql_file(filepath):
    """Read SQL file and return its contents"""
    with open(filepath, 'r') as f:
        return f.read()

def execute_sql_migration():
    """
    Execute the database migration using Supabase
    Note: This requires creating an RPC function in Supabase to execute raw SQL
    """
    print("=" * 70)
    print("SPARKLE DATABASE MIGRATION")
    print("=" * 70)
    print()

    schema_file = os.path.join(os.path.dirname(__file__), 'schema.sql')

    if not os.path.exists(schema_file):
        print(f"❌ Error: schema.sql not found at {schema_file}")
        return False

    print(f"📄 Reading schema from: {schema_file}")
    sql_content = read_sql_file(schema_file)

    print(f"📊 SQL file loaded successfully ({len(sql_content)} characters)")
    print()

    print("⚠️  MANUAL MIGRATION REQUIRED")
    print("=" * 70)
    print("""
To apply this schema to your Supabase database, follow these steps:

1. Go to your Supabase Dashboard:
   https://app.supabase.com

2. Select your project

3. Navigate to: SQL Editor (on the left sidebar)

4. Create a new query

5. Copy the contents of schema.sql and paste it into the SQL editor

6. Click "Run" to execute the migration

Alternatively, you can use the Supabase CLI:
   supabase db reset
   supabase migration new initial_schema
   # Copy schema.sql content to the new migration file
   supabase db push
    """)

    print()
    print("=" * 70)
    print("SCHEMA OVERVIEW")
    print("=" * 70)
    print("""
The following tables will be created:

1. ✨ users
   - User authentication and profile information
   - Subscription tiers (free, pro, enterprise)
   - User preferences and metadata

2. 🎨 brand_blueprints
   - Brand voice definitions
   - Tone and style guidelines
   - Example posts for AI training
   - Platform-specific settings

3. 📝 posts
   - Social media content (drafts, scheduled, published)
   - Multi-platform support (Twitter, LinkedIn, Instagram, etc.)
   - Engagement metrics
   - Version tracking

4. 🔍 post_embeddings
   - Vector embeddings for semantic search
   - Requires pgvector extension
   - Supports similarity matching

Additional Features:
- ✅ Row Level Security (RLS) policies
- ✅ Automatic timestamp updates
- ✅ Foreign key relationships
- ✅ Indexes for performance
- ✅ Check constraints for data integrity
    """)

    print()
    print("=" * 70)
    print("NEXT STEPS")
    print("=" * 70)
    print("""
1. Enable the pgvector extension in Supabase:
   - Go to Database → Extensions
   - Search for "vector"
   - Enable the extension

2. Run the SQL migration (as described above)

3. Verify the tables were created:
   python list_tables.py

4. (Optional) Seed the database with sample data:
   python seed_database.py
    """)

    return True

if __name__ == "__main__":
    try:
        execute_sql_migration()
    except Exception as e:
        print(f"\n❌ Error during migration: {str(e)}")
        import traceback
        traceback.print_exc()
