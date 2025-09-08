#!/usr/bin/env python3
"""
Database Population Script for Movie Reviews

This script clears the existing database and populates it with articles
from PDF documents in the data/documents directory.

Usage:
    python populate_database.py [--clear-only] [--dry-run]
    
Options:
    --clear-only    Only clear the database, don't populate
    --dry-run       Show what would be done without making changes
"""

import os
import sys
import argparse
import re
import shutil
from datetime import datetime
from pathlib import Path

# Add the server directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from app import app, db
from lib.models import Review, Tag
from sqlalchemy import text
import PyPDF2


def clear_database():
    """Clear all existing data from the database."""
    print("🗑️  Clearing existing database...")
    
    # Delete all review-tag associations first (to avoid foreign key constraint)
    db.session.execute(text("DELETE FROM review_tags"))
    
    # Then delete all reviews and tags
    Review.query.delete()
    Tag.query.delete()
    
    # Reset auto-increment counters
    db.session.execute(text("ALTER SEQUENCE IF EXISTS review_id_seq RESTART WITH 1"))
    db.session.execute(text("ALTER SEQUENCE IF EXISTS tag_id_seq RESTART WITH 1"))
    
    db.session.commit()
    print("✅ Database cleared successfully!")


def extract_title_from_filename(filename):
    """Extract a readable title from the filename."""
    # Remove file extension
    name = Path(filename).stem
    
    # Replace hyphens and underscores with spaces
    title = re.sub(r'[-_]', ' ', name)
    
    # Capitalize words
    title = ' '.join(word.capitalize() for word in title.split())
    
    return title


def extract_content_from_pdf(file_path):
    """Extract text content from a PDF document."""
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            content = []
            
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text = page.extract_text()
                if text.strip():
                    content.append(text.strip())
            
            return '\n\n'.join(content)
    except Exception as e:
        print(f"❌ Error reading {file_path}: {e}")
        return None


def create_description_from_content(content, title):
    """Create a short description from document content."""
    if not content:
        return f"An analysis of {title.lower()}"
    
    # Clean up the content
    cleaned = content.replace('\n', ' ').replace('\r', ' ')
    cleaned = ' '.join(cleaned.split())  # Remove extra whitespace
    
    # Try to find the first substantial sentence
    sentences = cleaned.split('. ')
    for sentence in sentences:
        # Skip very short sentences and author lines
        if (len(sentence) > 30 and 
            not sentence.lower().startswith('by ') and 
            'jamie trapp' not in sentence.lower() and
            not sentence.lower().startswith('the following')):
            return sentence[:150] + ('...' if len(sentence) > 150 else '')
    
    # Fallback: use first 150 characters
    return cleaned[:150] + ('...' if len(cleaned) > 150 else '')


def infer_tags_from_content(content, title):
    """Infer tags from document content and title."""
    tags = set()
    
    # Common film-related keywords
    film_keywords = {
        'cinema': 'cinema',
        'film': 'film',
        'movie': 'movie',
        'director': 'director',
        'actor': 'actor',
        'actress': 'actress',
        'screenplay': 'screenplay',
        'cinematography': 'cinematography',
        'editing': 'editing',
        'sound': 'sound',
        'music': 'music',
        'horror': 'horror',
        'drama': 'drama',
        'comedy': 'comedy',
        'thriller': 'thriller',
        'action': 'action',
        'romance': 'romance',
        'sci-fi': 'sci-fi',
        'fantasy': 'fantasy',
        'documentary': 'documentary',
        'animation': 'animation',
        'classic': 'classic',
        'modern': 'modern',
        'indie': 'indie',
        'blockbuster': 'blockbuster'
    }
    
    # Check content for keywords
    content_lower = content.lower()
    title_lower = title.lower()
    
    for keyword, tag in film_keywords.items():
        if keyword in content_lower or keyword in title_lower:
            tags.add(tag)
    
    # Add some default tags
    tags.add('review')
    tags.add('analysis')
    
    return list(tags)


def process_documents(documents_dir, dry_run=False):
    """Process all PDF documents in the documents directory."""
    documents_path = Path(documents_dir)
    
    if not documents_path.exists():
        print(f"❌ Documents directory not found: {documents_path}")
        return
    
    # Find all PDF documents
    doc_files = list(documents_path.glob("*.pdf"))
    
    if not doc_files:
        print(f"❌ No PDF documents found in {documents_path}")
        return
    
    print(f"📄 Found {len(doc_files)} documents to process...")
    
    for doc_file in doc_files:
        print(f"\n📖 Processing: {doc_file.name}")
        
        # Extract title from filename
        title = extract_title_from_filename(doc_file.name)
        print(f"   Title: {title}")
        
        if dry_run:
            print(f"   [DRY RUN] Would create article: {title}")
            continue
        
        # Create description from filename (no text extraction needed)
        description = f"An analysis of {title.lower()}"
        print(f"   Description: {description}")
        
        # Infer basic tags from title
        tags = infer_tags_from_content("", title)  # Empty content, just use title
        print(f"   Tags: {', '.join(tags)}")
        
        # Copy PDF file to uploads/documents directory (same as frontend upload)
        uploads_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'uploads', 'documents')
        uploads_dir = os.path.abspath(uploads_dir)  # Make absolute path
        os.makedirs(uploads_dir, exist_ok=True)
        
        # Use original filename (no UUID for seeded files)
        destination_path = os.path.join(uploads_dir, doc_file.name)
        destination_path = os.path.abspath(destination_path)  # Make absolute path
        
        if not dry_run:
            shutil.copy2(doc_file, destination_path)
            print(f"   📁 Copied to uploads/documents: {doc_file.name}")
        
        # Create the review
        review = Review(
            title=title,
            review_text="",  # Empty - content is in the PDF document
            description=description,
            content_type='article',
            has_document=True,
            document_filename=doc_file.name,  # Original filename
            document_path=destination_path,   # Full absolute path (same as frontend upload)
            document_type='pdf',
            date_added=datetime.utcnow().date()
        )
        
        db.session.add(review)
        db.session.flush()  # Get the ID
        
        # Create and associate tags
        for tag_name in tags:
            # Check if tag already exists
            tag = Tag.query.filter_by(name=tag_name).first()
            if not tag:
                tag = Tag(name=tag_name)
                db.session.add(tag)
                db.session.flush()
            
            review.tags.append(tag)
        
        print(f"   ✅ Created article: {title}")
    
    if not dry_run:
        db.session.commit()
        print(f"\n🎉 Successfully processed {len(doc_files)} documents!")


def main():
    parser = argparse.ArgumentParser(description='Populate database with PDF documents')
    parser.add_argument('--clear-only', action='store_true', 
                       help='Only clear the database, don\'t populate')
    parser.add_argument('--dry-run', action='store_true',
                       help='Show what would be done without making changes')
    
    args = parser.parse_args()
    
    # Get the documents directory (relative to server root)
    server_root = os.path.join(os.path.dirname(__file__), '..', '..')
    documents_dir = os.path.join(server_root, 'data', 'documents')
    
    with app.app_context():
        if args.clear_only:
            clear_database()
        else:
            if not args.dry_run:
                clear_database()
            
            process_documents(documents_dir, dry_run=args.dry_run)
    
    print("\n✨ Database population complete!")


if __name__ == '__main__':
    main()
