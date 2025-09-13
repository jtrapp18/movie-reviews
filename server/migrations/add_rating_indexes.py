#!/usr/bin/env python3
"""
Database migration to add indexes for optimized rating queries.
Run this script to add performance indexes to the database.
"""

from sqlalchemy import create_engine, text
from lib.config import db
from app import app

def add_rating_indexes():
    """Add database indexes for optimized rating queries."""
    
    with app.app_context():
        # Create indexes for better query performance
        indexes_to_create = [
            # Index on reviews.movie_id for faster joins
            "CREATE INDEX IF NOT EXISTS idx_reviews_movie_id ON reviews(movie_id);",
            
            # Index on movies.external_id for faster external movie lookups
            "CREATE INDEX IF NOT EXISTS idx_movies_external_id ON movies(external_id);",
            
            # Composite index for the most common rating query pattern
            "CREATE INDEX IF NOT EXISTS idx_movies_external_id_reviews ON movies(external_id) WHERE external_id IS NOT NULL;",
            
            # Index on reviews.rating for faster rating-based queries
            "CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating) WHERE rating IS NOT NULL;",
        ]
        
        try:
            for index_sql in indexes_to_create:
                print(f"Creating index: {index_sql}")
                db.engine.execute(text(index_sql))
            
            print("✅ All indexes created successfully!")
            
        except Exception as e:
            print(f"❌ Error creating indexes: {e}")
            return False
            
        return True

if __name__ == "__main__":
    print("🔧 Adding database indexes for rating performance...")
    success = add_rating_indexes()
    
    if success:
        print("🎉 Database optimization complete!")
    else:
        print("💥 Database optimization failed!")
