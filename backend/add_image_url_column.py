"""
Migration script to add image_url column to sparkle_posts table
Run this once to add the column to your Supabase database
"""

from database import supabase
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def add_image_url_column():
    """Add image_url column to sparkle_posts table"""
    try:
        # We'll use Supabase's query method to execute raw SQL
        # Note: This requires the SQL Editor or direct database access

        sql_query = """
        ALTER TABLE sparkle_posts
        ADD COLUMN IF NOT EXISTS image_url TEXT;
        """

        print("📝 SQL to run in Supabase SQL Editor:")
        print(sql_query)
        print("\n✅ Please run this SQL in your Supabase dashboard:")
        print("   1. Go to https://supabase.com/dashboard")
        print("   2. Select your project")
        print("   3. Go to SQL Editor")
        print("   4. Run the SQL above")

        # For now, let's verify if we can at least read the table
        result = supabase.table('sparkle_posts').select('*').limit(1).execute()
        if result.data:
            columns = list(result.data[0].keys())
            logger.info(f"✅ Current sparkle_posts columns: {columns}")

            if 'image_url' in columns:
                logger.info("✅ image_url column already exists!")
                return True
            else:
                logger.warning("⚠️  image_url column not found. Please add it using SQL Editor.")
                return False
        else:
            logger.info("✅ Table exists but is empty")
            return False

    except Exception as e:
        logger.error(f"❌ Error: {str(e)}")
        return False


if __name__ == "__main__":
    add_image_url_column()
