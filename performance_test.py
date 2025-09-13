#!/usr/bin/env python3
"""
Performance testing script for the optimized rating system.
This script compares the old vs new approach for loading movie ratings.
"""

import requests
import time
import json
from typing import List, Dict

BASE_URL = "http://localhost:5555/api"

def test_old_approach_local_movies():
    """Test the old approach: fetch all movies with reviews."""
    print("🔄 Testing OLD approach (fetch all movies)...")
    
    start_time = time.time()
    
    try:
        response = requests.get(f"{BASE_URL}/movies")
        if response.status_code == 200:
            movies = response.json()
            end_time = time.time()
            
            # Simulate processing ratings (as done in old getLocalMovieRatings)
            ratings_map = {}
            for movie in movies:
                if movie.get('reviews') and len(movie['reviews']) > 0:
                    rating = movie['reviews'][0].get('rating')
                    if rating and rating > 0:
                        ratings_map[movie['id']] = {
                            'rating': rating,
                            'localId': movie['id']
                        }
            
            duration = end_time - start_time
            print(f"   ⏱️  Duration: {duration:.3f}s")
            print(f"   📊 Movies processed: {len(movies)}")
            print(f"   💾 Data size: ~{len(json.dumps(movies)) / 1024:.1f} KB")
            print(f"   ⭐ Ratings found: {len(ratings_map)}")
            
            return duration, len(movies), len(json.dumps(movies))
        else:
            print(f"   ❌ Error: {response.status_code}")
            return None, 0, 0
            
    except Exception as e:
        print(f"   ❌ Exception: {e}")
        return None, 0, 0

def test_new_approach_bulk_ratings():
    """Test the new approach: bulk ratings endpoint."""
    print("🔄 Testing NEW approach (bulk ratings endpoint)...")
    
    # First get some movie IDs to test with
    try:
        movies_response = requests.get(f"{BASE_URL}/movies")
        if movies_response.status_code != 200:
            print("   ❌ Could not fetch movies for testing")
            return None, 0, 0
            
        movies = movies_response.json()
        if not movies:
            print("   ⚠️  No movies found for testing")
            return None, 0, 0
            
        # Use first 20 movies for testing (simulate typical display scenario)
        test_movies = movies[:20]
        local_ids = [m['id'] for m in test_movies if not m.get('external_id')]
        external_ids = [m['external_id'] for m in test_movies if m.get('external_id')]
        
        start_time = time.time()
        
        payload = {
            'local_ids': local_ids,
            'external_ids': external_ids
        }
        
        response = requests.post(
            f"{BASE_URL}/movie-ratings-bulk",
            json=payload,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            ratings_map = response.json()
            end_time = time.time()
            
            duration = end_time - start_time
            print(f"   ⏱️  Duration: {duration:.3f}s")
            print(f"   📊 Movies queried: {len(local_ids)} local, {len(external_ids)} external")
            print(f"   💾 Response size: ~{len(json.dumps(ratings_map)) / 1024:.1f} KB")
            print(f"   ⭐ Ratings found: {len(ratings_map)}")
            
            return duration, len(test_movies), len(json.dumps(ratings_map))
        else:
            print(f"   ❌ Error: {response.status_code}")
            return None, 0, 0
            
    except Exception as e:
        print(f"   ❌ Exception: {e}")
        return None, 0, 0

def main():
    """Run performance comparison tests."""
    print("🚀 Movie Rating Performance Test")
    print("=" * 50)
    
    # Test old approach
    old_duration, old_movies, old_size = test_old_approach_local_movies()
    print()
    
    # Test new approach
    new_duration, new_movies, new_size = test_new_approach_bulk_ratings()
    print()
    
    # Compare results
    if old_duration and new_duration:
        print("📈 PERFORMANCE COMPARISON")
        print("=" * 30)
        
        speedup = old_duration / new_duration
        size_reduction = (old_size - new_size) / old_size * 100 if old_size > 0 else 0
        
        print(f"⏱️  Speed improvement: {speedup:.1f}x faster")
        print(f"💾 Data reduction: {size_reduction:.1f}% smaller")
        print(f"📊 Efficiency: {old_movies / new_movies:.1f}x fewer movies processed")
        
        if speedup > 1.5:
            print("✅ Significant performance improvement achieved!")
        elif speedup > 1.1:
            print("✅ Modest performance improvement achieved!")
        else:
            print("⚠️  Performance improvement is minimal")
            
    else:
        print("❌ Could not complete performance comparison")

if __name__ == "__main__":
    main()
