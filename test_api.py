#!/usr/bin/env python3
"""
Test API endpoints to check if movies and ratings are working
"""

import requests
import json

def test_api():
    base_url = "http://localhost:5555"
    
    print("Testing API endpoints...")
    
    # Test movies endpoint
    try:
        response = requests.get(f"{base_url}/api/movies")
        if response.status_code == 200:
            movies = response.json()
            print(f"✅ Movies endpoint working: {len(movies)} movies found")
            if movies:
                print(f"   First movie: {movies[0].get('title', 'No title')}")
        else:
            print(f"❌ Movies endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Movies endpoint error: {e}")
    
    # Test movie ratings endpoint
    try:
        response = requests.post(f"{base_url}/api/movie-ratings-bulk", 
                               json={"local_ids": [], "external_ids": []})
        if response.status_code == 200:
            ratings = response.json()
            print(f"✅ Movie ratings endpoint working: {len(ratings)} ratings found")
        else:
            print(f"❌ Movie ratings endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Movie ratings endpoint error: {e}")

if __name__ == "__main__":
    test_api()
