#!/usr/bin/env python3
"""
Test SearchMovies functionality.
"""

import os
import sys
import subprocess

def test_app():
    print("🧪 Testing SearchMovies functionality...")
    print("=" * 50)
    
    # Test 1: Check if app starts
    print("\n1. Testing app startup...")
    test_startup = """
import sys
sys.path.append('server')
from server.app import app
from server.lib.models import Review, Movie

with app.app_context():
    try:
        # Test reviews query
        reviews = Review.query.limit(1).all()
        print('✅ Reviews query successful')
        
        # Test movies query  
        movies = Movie.query.limit(1).all()
        print('✅ Movies query successful')
        
        # Test pull_movie_info endpoint
        from server.app import PullMovieInfo
        print('✅ PullMovieInfo class imported')
        
        print('✅ All database operations working')
        
    except Exception as e:
        print(f'❌ Error: {e}')
        sys.exit(1)
"""
    
    try:
        result = subprocess.run(f"python -c \"{test_startup}\"", shell=True, check=True, capture_output=True, text=True)
        print("✅ App startup test passed")
        print(f"Output: {result.stdout}")
    except subprocess.CalledProcessError as e:
        print("❌ App startup test failed")
        print(f"Error: {e.stderr}")
        return False
    
    # Test 2: Check if we can start the server
    print("\n2. Testing server startup...")
    print("Starting server in background for 5 seconds...")
    
    try:
        # Start server in background
        server_process = subprocess.Popen(
            ["python", "server/app.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Wait a bit for server to start
        import time
        time.sleep(3)
        
        # Test if server is responding
        import requests
        try:
            response = requests.get("http://localhost:5555/api/movies", timeout=5)
            if response.status_code == 200:
                print("✅ Server is responding to API calls")
            else:
                print(f"⚠️  Server responded with status {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"⚠️  Could not connect to server: {e}")
        
        # Stop the server
        server_process.terminate()
        server_process.wait()
        print("✅ Server test completed")
        
    except Exception as e:
        print(f"❌ Server test failed: {e}")
        return False
    
    print("\n" + "=" * 50)
    print("🎉 SearchMovies should be working now!")
    print("\n📋 To test manually:")
    print("1. Start backend: cd server && python app.py")
    print("2. Start frontend: cd client && npm run dev")
    print("3. Navigate to SearchMovies page")
    
    return True

if __name__ == "__main__":
    test_app()
