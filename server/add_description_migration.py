#!/usr/bin/env python3
"""
Migration script to add description field to reviews table.
"""

import os
import sys

# Add the server directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, db
from sqlalchemy import text

def add_description_column():
    """Add description column to reviews table."""
    with app.app_context():
        try:
            # Check if column already exists
            result = db.session.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='reviews' AND column_name='description'
            """))
            
            if result.fetchone():
                print("✅ Description column already exists!")
                return
            
            # Add the column
            db.session.execute(text("""
                ALTER TABLE reviews 
                ADD COLUMN description TEXT
            """))
            
            db.session.commit()
            print("✅ Successfully added description column to reviews table!")
            
        except Exception as e:
            print(f"❌ Error adding description column: {e}")
            db.session.rollback()

if __name__ == '__main__':
    add_description_column()
