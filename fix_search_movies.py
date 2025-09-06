#!/usr/bin/env python3
"""
Quick fix script for SearchMovies error.
This script helps diagnose and fix the issue.
"""

import os
import sys
import subprocess

def run_command(command, description):
    """Run a command and handle errors."""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        if result.stdout:
            print(f"Output: {result.stdout}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        return False

def main():
    print("🔧 Fixing SearchMovies error...")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("requirements.txt"):
        print("❌ Please run this script from the project root directory")
        sys.exit(1)
    
    # Step 1: Install dependencies
    print("\n1. Installing Python dependencies...")
    if not run_command("pip install -r requirements.txt", "Installing dependencies"):
        print("⚠️  Dependencies installation failed. Please install manually:")
        print("   pip install -r requirements.txt")
    
    # Step 2: Create uploads directory
    print("\n2. Creating uploads directory...")
    uploads_dir = "server/uploads/documents"
    os.makedirs(uploads_dir, exist_ok=True)
    print(f"✅ Created uploads directory: {uploads_dir}")
    
    # Step 3: Test database connection
    print("\n3. Testing database connection...")
    os.chdir("server")
    
    # Test if we can import the models
    test_import = """
import sys
sys.path.append('.')
try:
    from lib.models import Review, Movie, User
    print('✅ Models imported successfully')
    print(f'Review fields: {[c.name for c in Review.__table__.columns]}')
except Exception as e:
    print(f'❌ Model import failed: {e}')
    sys.exit(1)
"""
    
    if not run_command(f"python -c \"{test_import}\"", "Testing model imports"):
        print("❌ Model import test failed. This might be the cause of the SearchMovies error.")
        print("   The new document fields might not be compatible with your current database.")
        print("\n🔧 Try running the database migration:")
        print("   cd server && python -m flask db upgrade")
        os.chdir("..")
        return
    
    os.chdir("..")
    
    # Step 4: Check if migration is needed
    print("\n4. Checking database migration status...")
    os.chdir("server")
    
    migration_check = """
import sys
sys.path.append('.')
from lib.config import db
from lib.models import Review

try:
    # Try to query the reviews table
    reviews = Review.query.limit(1).all()
    print('✅ Database query successful')
    
    # Check if new fields exist
    review = Review()
    has_doc_field = hasattr(review, 'has_document')
    print(f'✅ has_document field exists: {has_doc_field}')
    
except Exception as e:
    print(f'❌ Database query failed: {e}')
    print('   This suggests the migration is needed.')
    sys.exit(1)
"""
    
    if not run_command(f"python -c \"{migration_check}\"", "Testing database queries"):
        print("\n🔧 Database migration is needed. Running migration...")
        if run_command("python -m flask db upgrade", "Running database migration"):
            print("✅ Migration completed successfully")
        else:
            print("❌ Migration failed. You may need to run it manually:")
            print("   cd server && python -m flask db upgrade")
    
    os.chdir("..")
    
    # Step 5: Test the application
    print("\n5. Testing application startup...")
    os.chdir("server")
    
    startup_test = """
import sys
sys.path.append('.')
try:
    from app import app
    print('✅ Flask app imported successfully')
    
    # Test if we can create a test context
    with app.app_context():
        from lib.models import Review, Movie
        print('✅ App context works')
        
except Exception as e:
    print(f'❌ App startup failed: {e}')
    sys.exit(1)
"""
    
    if run_command(f"python -c \"{startup_test}\"", "Testing app startup"):
        print("✅ Application should start successfully now")
    else:
        print("❌ Application startup test failed")
    
    os.chdir("..")
    
    print("\n" + "=" * 50)
    print("🎉 Fix attempt completed!")
    print("\n📋 Next steps:")
    print("1. Start the backend: cd server && python app.py")
    print("2. Start the frontend: cd client && npm run dev")
    print("3. Test the SearchMovies page")
    
    print("\n🔍 If SearchMovies still errors:")
    print("1. Check browser console for JavaScript errors")
    print("2. Check server logs for Python errors")
    print("3. Verify the database migration was applied")

if __name__ == "__main__":
    main()
