#!/usr/bin/env python3
"""
Script to list all tables in the Supabase database
"""
from database import supabase
from supabase import PostgrestAPIError

def list_all_tables():
    """
    List all tables in the public schema of the Supabase database
    """
    print("Fetching all tables from Supabase...\n")

    try:
        # Method 1: Try to use PostgREST API to query information_schema
        # Note: This requires the information_schema.tables view to be exposed
        result = supabase.table('information_schema.tables').select('table_name').eq('table_schema', 'public').execute()

        if result.data:
            print(f"Found {len(result.data)} tables:\n")
            for table in result.data:
                print(f"  - {table['table_name']}")
            return result.data
    except Exception as e:
        print(f"Method 1 failed: {str(e)}\n")

    # Method 2: Try common table names
    print("Trying to detect tables by probing common names...\n")

    common_tables = [
        'users', 'profiles', 'accounts',
        'brand_blueprints', 'brands', 'blueprints',
        'posts', 'articles', 'content',
        'post_embeddings', 'embeddings', 'vectors',
        'comments', 'likes', 'follows',
        'sessions', 'tokens', 'auth'
    ]

    existing_tables = []

    for table_name in common_tables:
        try:
            # Try to select 0 rows from the table - if it exists, this will succeed
            supabase.table(table_name).select('*').limit(0).execute()
            existing_tables.append(table_name)
            print(f"  ✓ Found: {table_name}")
        except PostgrestAPIError as e:
            # Table doesn't exist or we don't have permission
            pass
        except Exception as e:
            # Other error
            pass

    if existing_tables:
        print(f"\nTotal tables found: {len(existing_tables)}")
        return existing_tables
    else:
        print("\nNo tables found. The database might be empty or tables are not accessible.")
        print("\nNote: If you haven't created any tables yet, this is expected!")
        return []

if __name__ == "__main__":
    print("=" * 60)
    print("SUPABASE DATABASE TABLE LISTING")
    print("=" * 60)
    print()

    tables = list_all_tables()

    print("\n" + "=" * 60)
    print("NEXT STEPS:")
    print("=" * 60)
    if not tables:
        print("""
You can now create the Sparkle database schema with these tables:
  1. users - User authentication and profile data
  2. brand_blueprints - Brand voice and style definitions
  3. posts - Social media posts and content
  4. post_embeddings - Vector embeddings for semantic search
        """)
    else:
        print("""
To create the complete Sparkle schema, run the migration script.
        """)
