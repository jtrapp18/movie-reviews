#!/usr/bin/env python3
"""
Quick diagnostic script to check if movies and reviews exist in the database
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'server'))

from server.lib.config import db, app
from server.lib.models import Movie, Review

def check_database():
    with app.app_context():
        # Check movies
        movies = Movie.query.all()
        print(f"Total movies in database: {len(movies)}")
        
        if movies:
            print("\nFirst few movies:")
            for movie in movies[:3]:
                print(f"  - {movie.title} (ID: {movie.id})")
        
        # Check reviews
        reviews = Review.query.all()
        print(f"\nTotal reviews in database: {len(reviews)}")
        
        if reviews:
            print("\nFirst few reviews:")
            for review in reviews[:3]:
                print(f"  - Review ID: {review.id}, Movie ID: {review.movie_id}, Rating: {review.rating}")
        
        # Check reviews with ratings
        reviews_with_ratings = Review.query.filter(Review.rating.isnot(None)).all()
        print(f"\nReviews with ratings: {len(reviews_with_ratings)}")
        
        if reviews_with_ratings:
            print("\nReviews with ratings:")
            for review in reviews_with_ratings[:3]:
                print(f"  - Review ID: {review.id}, Movie ID: {review.movie_id}, Rating: {review.rating}")

if __name__ == "__main__":
    check_database()
