#!/usr/bin/env python3
"""
Test script to verify S3/MinIO connection and functionality.
Run this to test your MinIO setup before deploying.
"""
import os
import sys
import tempfile
from io import BytesIO
from dotenv import load_dotenv

load_dotenv()

# Add the server directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_s3_connection():
    """Test S3 connection and basic functionality."""
    try:
        from lib.utils.s3_client import get_s3_client
        
        print("🔧 Testing S3/MinIO connection...")
        
        # Test connection
        s3_client = get_s3_client()
        connection_result = s3_client.check_connection()
        
        if not connection_result['success']:
            print(f"❌ Connection failed: {connection_result['error']}")
            return False
        
        print(f"✅ Connection successful!")
        print(f"   Bucket: {connection_result['bucket']}")
        print(f"   Endpoint: {connection_result['endpoint']}")
        
        # Test file upload
        print("\n📤 Testing file upload...")
        test_content = b"This is a test document for S3 upload."
        test_file = BytesIO(test_content)
        
        upload_result = s3_client.upload_file(
            test_file, 
            "test/connection_test.txt", 
            "text/plain"
        )
        
        if not upload_result['success']:
            print(f"❌ Upload failed: {upload_result['error']}")
            return False
        
        print("✅ Upload successful!")
        
        # Test file download
        print("\n📥 Testing file download...")
        download_result = s3_client.download_file("test/connection_test.txt")
        
        if not download_result['success']:
            print(f"❌ Download failed: {download_result['error']}")
            return False
        
        if download_result['file_data'] == test_content:
            print("✅ Download successful and content matches!")
        else:
            print("❌ Download content doesn't match upload!")
            return False
        
        # Test file deletion
        print("\n🗑️  Testing file deletion...")
        delete_result = s3_client.delete_file("test/connection_test.txt")
        
        if not delete_result['success']:
            print(f"❌ Deletion failed: {delete_result['error']}")
            return False
        
        print("✅ Deletion successful!")
        
        print("\n🎉 All S3 tests passed! Your MinIO setup is working correctly.")
        return True
        
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        return False

def check_environment_variables():
    """Check if all required environment variables are set."""
    required_vars = [
        'MINIO_PUBLIC_ENDPOINT',
        'MINIO_ROOT_USER', 
        'MINIO_ROOT_PASSWORD'
    ]
    
    # Optional bucket name (will use default if not set)
    optional_vars = ['MINIO_BUCKET']
    
    print("🔍 Checking environment variables...")
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
        else:
            print(f"   ✅ {var}: {'*' * 8}")  # Hide the actual value
    
    # Check optional variables
    for var in optional_vars:
        if os.getenv(var):
            print(f"   ✅ {var}: {'*' * 8}")
        else:
            print(f"   ⚠️  {var}: Not set (will use default)")
    
    if missing_vars:
        print(f"\n❌ Missing required environment variables: {', '.join(missing_vars)}")
        print("\nThese should be automatically set by Railway MinIO service.")
        return False
    
    print("✅ All required environment variables are set!")
    return True

if __name__ == "__main__":
    print("🚀 S3/MinIO Connection Test")
    print("=" * 40)
    
    # Check environment variables first
    if not check_environment_variables():
        sys.exit(1)
    
    # Test S3 connection
    if test_s3_connection():
        print("\n🎯 Ready to deploy! Your S3 integration should work correctly.")
        sys.exit(0)
    else:
        print("\n💥 S3 integration needs fixing before deployment.")
        sys.exit(1)
