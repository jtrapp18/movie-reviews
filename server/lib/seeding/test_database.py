#!/usr/bin/env python3
"""
Test script to verify database seeding results.
"""

import os
import sys

# Add the server directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from app import app, db
from lib.models import Review, Tag


def test_database_content():
    """Test and display the current database content."""
    with app.app_context():
        print("🔍 Testing database content...\n")
        
        # Count articles
        article_count = Review.query.count()
        print(f"📊 Total articles in database: {article_count}")
        
        if article_count == 0:
            print("❌ No articles found in database!")
            return
        
        # Count tags
        tag_count = Tag.query.count()
        print(f"🏷️  Total tags in database: {tag_count}")
        
        print("\n📄 Articles:")
        print("-" * 50)
        
        articles = Review.query.all()
        for article in articles:
            print(f"ID: {article.id}")
            print(f"Title: {article.title}")
            print(f"Content Type: {article.content_type}")
            print(f"Has Document: {article.has_document}")
            print(f"Document Filename: {article.document_filename}")
            print(f"Document Type: {article.document_type}")
            print(f"Date Added: {article.date_added}")
            print(f"Review Text Length: {len(article.review_text) if article.review_text else 0} characters")
            
            # Show tags
            if article.tags:
                tag_names = [tag.name for tag in article.tags]
                print(f"Tags: {', '.join(tag_names)}")
            else:
                print("Tags: None")
            
            # Show first 100 characters of content
            if article.review_text:
                preview = article.review_text[:100].replace('\n', ' ')
                print(f"Content Preview: {preview}...")
            
            print("-" * 50)
        
        print(f"\n🏷️  All Tags:")
        print("-" * 30)
        tags = Tag.query.all()
        for tag in tags:
            article_count = len(tag.reviews)
            print(f"{tag.name} ({article_count} articles)")
        
        print(f"\n✅ Database test complete!")
        print(f"📊 Summary: {article_count} articles, {tag_count} tags")


if __name__ == '__main__':
    test_database_content()
