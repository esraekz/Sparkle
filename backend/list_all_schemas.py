#!/usr/bin/env python3
"""
Script to list all schemas and tables in the Supabase database
"""
from database import supabase
from supabase import PostgrestAPIError

def list_all_schemas_and_tables():
    """
    List all schemas and tables in the Supabase database
    """
    print("=" * 80)
    print("SUPABASE DATABASE - ALL SCHEMAS AND TABLES")
    print("=" * 80)
    print()

    # Common schemas in Supabase
    schemas_to_check = [
        'public',           # User tables
        'Sparklie',        # Custom Sparklie schema
        'auth',            # Supabase Auth tables
        'storage',         # Supabase Storage tables
        'extensions',      # PostgreSQL extensions
        'realtime',        # Supabase Realtime
        'supabase_functions', # Edge Functions
        'graphql',         # GraphQL
        'graphql_public',  # GraphQL Public
        'net',             # Network functions
        'vault',           # Supabase Vault
        'information_schema', # PostgreSQL metadata
        'pg_catalog'       # PostgreSQL catalog
    ]

    # Extended list of common table names across all schemas
    common_tables = {
        'public': [
            'users', 'profiles', 'accounts',
            'brand_blueprints', 'brands', 'blueprints',
            'posts', 'articles', 'content',
            'post_embeddings', 'embeddings', 'vectors',
            'comments', 'likes', 'follows',
            'sessions', 'tokens'
        ],
        'Sparklie': [
            'users', 'profiles', 'accounts',
            'brand_blueprints', 'brands', 'blueprints',
            'posts', 'articles', 'content',
            'post_embeddings', 'embeddings', 'vectors',
            'comments', 'likes', 'follows',
            'sessions', 'tokens'
        ],
        'auth': [
            'users', 'identities', 'sessions', 'refresh_tokens',
            'instances', 'audit_log_entries', 'schema_migrations',
            'mfa_factors', 'mfa_challenges', 'mfa_amr_claims',
            'sso_providers', 'sso_domains', 'saml_providers',
            'saml_relay_states', 'flow_state'
        ],
        'storage': [
            'buckets', 'objects', 'migrations'
        ],
        'extensions': [
            'pg_stat_statements', 'pg_stat_statements_info'
        ],
        'realtime': [
            'schema_migrations', 'subscription', 'messages'
        ],
        'vault': [
            'secrets'
        ]
    }

    all_found_tables = {}

    for schema_name in schemas_to_check:
        print(f"\n{'─' * 80}")
        print(f"📁 SCHEMA: {schema_name}")
        print(f"{'─' * 80}")

        schema_tables = []

        # Get table list for this schema
        tables_to_check = common_tables.get(schema_name, [])

        if not tables_to_check:
            # For schemas we don't have a predefined list, try a few generic names
            tables_to_check = ['migrations', 'config', 'settings']

        for table_name in tables_to_check:
            try:
                # Try to access the table
                result = supabase.schema(schema_name).table(table_name).select('*').limit(0).execute()
                schema_tables.append(table_name)
                print(f"  ✓ {table_name}")
            except Exception as e:
                # Table doesn't exist or we don't have permission
                pass

        if schema_tables:
            all_found_tables[schema_name] = schema_tables
            print(f"\n  Total tables found in {schema_name}: {len(schema_tables)}")
        else:
            print(f"  No accessible tables found in {schema_name}")

    # Summary
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)

    total_tables = sum(len(tables) for tables in all_found_tables.values())

    if all_found_tables:
        for schema_name, tables in all_found_tables.items():
            print(f"\n{schema_name} ({len(tables)} tables):")
            for table in sorted(tables):
                print(f"  • {table}")
    else:
        print("\nNo tables found or insufficient permissions to query schemas.")

    print(f"\n{'─' * 80}")
    print(f"Total schemas with tables: {len(all_found_tables)}")
    print(f"Total tables found: {total_tables}")
    print(f"{'─' * 80}")

    return all_found_tables

if __name__ == "__main__":
    try:
        list_all_schemas_and_tables()
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
