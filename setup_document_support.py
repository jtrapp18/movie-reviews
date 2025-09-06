#!/usr/bin/env python3
"""
Setup script for document support in movie reviews.
This script installs the required dependencies and runs database migrations.
"""

import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and handle errors."""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        return False

def main():
    print("🚀 Setting up document support for Movie Reviews...")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("requirements.txt"):
        print("❌ Please run this script from the project root directory")
        sys.exit(1)
    
    # Install Python dependencies
    if not run_command("pip install -r requirements.txt", "Installing Python dependencies"):
        print("❌ Failed to install dependencies. Please check your Python environment.")
        sys.exit(1)
    
    # Create uploads directory
    uploads_dir = "server/uploads/documents"
    os.makedirs(uploads_dir, exist_ok=True)
    print(f"✅ Created uploads directory: {uploads_dir}")
    
    # Run database migration
    os.chdir("server")
    if not run_command("python -m flask db upgrade", "Running database migration"):
        print("⚠️  Database migration failed. You may need to run it manually:")
        print("   cd server && python -m flask db upgrade")
    
    os.chdir("..")
    
    print("\n" + "=" * 50)
    print("🎉 Document support setup completed!")
    print("\n📋 What's been added:")
    print("   • PDF and Word document upload support")
    print("   • Text extraction from documents")
    print("   • Document preview and download functionality")
    print("   • Database fields for document metadata")
    print("   • Frontend upload interface")
    
    print("\n🚀 To start the application:")
    print("   Backend: cd server && python app.py")
    print("   Frontend: cd client && npm run dev")
    
    print("\n📁 Document uploads will be stored in: server/uploads/documents/")
    print("🔧 Supported formats: PDF (.pdf), Word (.docx, .doc)")

if __name__ == "__main__":
    main()
