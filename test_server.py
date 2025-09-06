#!/usr/bin/env python3
"""
Test the Flask server endpoints.
"""

import requests
import time
import subprocess
import sys
import os

def test_server():
    print("🧪 Testing Flask server...")
    print("=" * 50)
    
    # Start server in background
    print("1. Starting server...")
    server_process = subprocess.Popen(
        ["python", "app.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    # Wait for server to start
    print("2. Waiting for server to start...")
    time.sleep(3)
    
    # Test endpoints
    base_url = "http://localhost:5555"
    endpoints = [
        "/api/check_session",
        "/api/movies", 
        "/api/pull_movie_info"
    ]
    
    print("3. Testing endpoints...")
    for endpoint in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=5)
            print(f"✅ {endpoint}: {response.status_code}")
            if response.status_code != 200:
                print(f"   Error: {response.text[:100]}...")
        except requests.exceptions.RequestException as e:
            print(f"❌ {endpoint}: Connection failed - {e}")
    
    # Stop server
    print("4. Stopping server...")
    server_process.terminate()
    server_process.wait()
    
    print("\n" + "=" * 50)
    print("🎉 Server test completed!")

if __name__ == "__main__":
    os.chdir("server")
    test_server()
