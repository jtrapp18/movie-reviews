#!/usr/bin/env python3

import os
import time
from datetime import date
from urllib.parse import quote_plus

import requests

# from flask_migrate import Migrate
from flask import request, session
from flask_restful import Resource
from sqlalchemy import func
from sqlalchemy.orm import joinedload

from movie_reviews.config import db
from movie_reviews.logging import logger
from movie_reviews.models import Director, Movie, Review, ReviewLike, Tag


def _fetch_tmdb_director_for_movie(external_movie_id):
    """Fetch director details from TMDb for a given movie external_id."""
    API_KEY = os.getenv("MOVIE_API_KEY")
    base_url = "https://api.themoviedb.org/3"

    if not API_KEY or not external_movie_id:
        return None

    # Step 1: Get credits for the movie to find the director (crew member with job "Director")
    credits_url = (
        f"{base_url}/movie/{external_movie_id}/credits?api_key={API_KEY}&language=en-US"
    )
    try:
        credits_response = requests.get(credits_url)
    except Exception:
        return None

    if credits_response.status_code != 200:
        return None

    credits_data = credits_response.json() or {}
    crew = credits_data.get("crew", []) or []
    director_entry = next((c for c in crew if c.get("job") == "Director"), None)

    if not director_entry:
        return None

    person_id = director_entry.get("id")
    if not person_id:
        return None

    # Step 2: Fetch person details to get biography and better profile photo info
    person_url = f"{base_url}/person/{person_id}?api_key={API_KEY}&language=en-US"
    try:
        person_response = requests.get(person_url)
    except Exception:
        person_response = None

    person_data = (
        person_response.json()
        if person_response and person_response.status_code == 200
        else {}
    )

    name = person_data.get("name") or director_entry.get("name")
    profile_path = person_data.get("profile_path") or director_entry.get("profile_path")
    biography = person_data.get("biography") or None

    if not name:
        return None

    image_base_url = "https://image.tmdb.org/t/p/w500"
    cover_photo = f"{image_base_url}{profile_path}" if profile_path else None

    return {
        "external_id": person_id,
        "name": name,
        "cover_photo": cover_photo,
        "biography": biography,
    }


def _get_or_create_director_for_movie(external_movie_id):
    """Ensure there is a Director row for the given TMDb movie external_id."""
    director_data = _fetch_tmdb_director_for_movie(external_movie_id)
    if not director_data:
        return None

    external_id = director_data["external_id"]
    if not external_id:
        return None

    # Look up existing director by external_id
    director = Director.query.filter_by(external_id=external_id).first()
    if director:
        # Optionally refresh basic fields from TMDb (non-destructive)
        director.name = director_data["name"] or director.name
        if director_data["cover_photo"]:
            director.cover_photo = director_data["cover_photo"]
        if director_data["biography"]:
            director.biography = director_data["biography"]
        return director

    # Create new director
    cover_photo = director_data["cover_photo"] or ""
    director = Director(
        external_id=external_id,
        name=director_data["name"],
        cover_photo=cover_photo,
        biography=director_data["biography"],
    )
    db.session.add(director)
    db.session.flush()  # ensure director.id is available
    return director


class Movies(Resource):
    def get(self):
        movies = [movie.to_dict() for movie in Movie.query.all()]
        return movies, 200

    def post(self):
        data = request.get_json()

        try:
            new_movie = Movie(
                external_id=data.get("external_id"),
                original_language=data.get("original_language"),
                original_title=data.get("original_title"),
                overview=data.get("overview"),
                title=data.get("title"),
                release_date=data.get("release_date"),
                cover_photo=data.get("cover_photo"),
                backdrop=data.get("backdrop"),
            )

            db.session.add(new_movie)
            db.session.flush()

            # If this movie came from TMDb, try to associate a director
            if new_movie.external_id:
                director = _get_or_create_director_for_movie(new_movie.external_id)
                if director:
                    new_movie.director_id = director.id

            db.session.commit()

            return new_movie.to_dict(), 201

        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 400


class MovieById(Resource):
    def get(self, movie_id):
        start = time.perf_counter()
        movie = Movie.query.get(movie_id)
        if not movie:
            return {"error": "Movie not found"}, 404
        out = movie.to_dict()
        reviews_list = out.get("reviews") or []
        if reviews_list:
            review_ids = [r["id"] for r in reviews_list]
            count_rows = (
                db.session.query(ReviewLike.review_id, func.count(ReviewLike.id))
                .filter(ReviewLike.review_id.in_(review_ids))
                .group_by(ReviewLike.review_id)
                .all()
            )
            counts = {row[0]: row[1] for row in count_rows}
            user_id = session.get("user_id")
            liked_ids = set()
            if user_id:
                liked_ids = {
                    row[0]
                    for row in db.session.query(ReviewLike.review_id)
                    .filter(
                        ReviewLike.review_id.in_(review_ids),
                        ReviewLike.user_id == user_id,
                    )
                    .all()
                }
            for r in reviews_list:
                rid = r.get("id")
                r["like_count"] = counts.get(rid, 0)
                r["liked_by_me"] = rid in liked_ids
        elapsed_ms = (time.perf_counter() - start) * 1000
        log = logger.warning if elapsed_ms > 300 else logger.info
        log(
            f"movies.get.by_id elapsed_ms={elapsed_ms:.2f}ms movie_id={movie_id} "
            f"reviews_count={len(reviews_list)}",
            extra={
                "endpoint": "/api/movies/<id>",
                "movie_id": movie_id,
                "elapsed_ms": round(elapsed_ms, 2),
                "reviews_count": len(reviews_list),
            },
        )
        return out, 200

    def patch(self, movie_id):
        movie = Movie.query.get(movie_id)
        if not movie:
            return {"error": "Movie not found"}, 404
        data = request.get_json()

        for attr in data:
            setattr(movie, attr, data.get(attr))

        db.session.commit()
        return movie.to_dict(), 200

    def delete(self, movie_id):
        movie = Movie.query.get(movie_id)
        if not movie:
            return {"error": "Movie not found"}, 404
        db.session.delete(movie)
        db.session.commit()
        return {}, 204


class Reviews(Resource):
    def get(self):
        reviews = [review.to_dict() for review in Review.query.all()]
        return reviews, 200

    def post(self):
        data = request.get_json()
        new_review = Review(
            title=data.get("title"),
            rating=data.get("rating"),
            review_text=data.get("review_text"),
            movie_id=data.get("movie_id"),
        )
        db.session.add(new_review)
        db.session.flush()  # Flush to get the review ID

        # Handle tags if provided
        if data.get("tags"):
            for tag_data in data["tags"]:
                tag_name = tag_data.get("name", "").strip().lower()
                if tag_name:
                    # Find or create tag
                    tag = Tag.query.filter_by(name=tag_name).first()
                    if not tag:
                        tag = Tag(name=tag_name)
                        db.session.add(tag)
                        db.session.flush()

                    # Associate tag with review
                    new_review.tags.append(tag)

        db.session.commit()
        return new_review.to_dict(), 201


def _add_like_fields_to_review_dict(review_dict, like_count, liked_by_me):
    """Attach like_count and liked_by_me to a review dict."""
    review_dict["like_count"] = like_count
    review_dict["liked_by_me"] = liked_by_me
    return review_dict


class ReviewById(Resource):
    def get(self, review_id):
        review = Review.query.get(review_id)
        if not review:
            return {"error": "Review not found"}, 404
        like_count = ReviewLike.query.filter_by(review_id=review_id).count()
        user_id = session.get("user_id")
        liked_by_me = bool(
            user_id
            and ReviewLike.query.filter_by(review_id=review_id, user_id=user_id).first()
        )
        out = review.to_dict()
        _add_like_fields_to_review_dict(out, like_count, liked_by_me)
        return out, 200

    def patch(self, review_id):
        review = Review.query.get(review_id)
        if not review:
            return {"error": "Review not found"}, 404
        data = request.get_json()

        print(f"DEBUG PATCH - Review ID: {review_id}")
        print(f"DEBUG PATCH - Current document_path: {review.document_path}")
        print(f"DEBUG PATCH - Received data: {data}")
        print(f"DEBUG PATCH - Data keys: {list(data.keys()) if data else 'None'}")

        # Handle tags separately since it's a relationship
        if "tags" in data:
            tags_data = data.pop("tags")  # Remove tags from data
            # Clear existing tags
            review.tags.clear()
            # Add new tags
            for tag_data in tags_data:
                if isinstance(tag_data, dict) and "name" in tag_data:
                    # Find or create tag
                    tag = Tag.query.filter_by(
                        name=tag_data["name"].lower().strip()
                    ).first()
                    if not tag:
                        tag = Tag(name=tag_data["name"].lower().strip())
                        db.session.add(tag)
                    review.tags.append(tag)

        # Handle movie separately since it's a relationship
        if "movie" in data:
            data.pop(
                "movie"
            )  # Remove movie from data - relationship handled by movie_id

        # Handle other attributes normally
        for attr in data:
            print(f"DEBUG PATCH - Setting {attr} = {data.get(attr)}")
            setattr(review, attr, data.get(attr))

        print(f"DEBUG PATCH - After update, document_path: {review.document_path}")
        db.session.commit()
        print(f"DEBUG PATCH - After commit, document_path: {review.document_path}")
        return review.to_dict(), 200

    def delete(self, review_id):
        review = Review.query.get(review_id)
        if not review:
            return {"error": "Review not found"}, 404
        db.session.delete(review)
        db.session.commit()
        return {}, 204


class Articles(Resource):
    def get(self):
        start = time.perf_counter()
        search_query = request.args.get("search", "")
        articles = Review.query.filter_by(movie_id=None)

        if search_query:
            articles = articles.filter(
                db.or_(
                    Review.title.contains(search_query),
                    Review.review_text.contains(search_query),
                    Review.tags.any(Tag.name.contains(search_query)),
                )
            )
        articles = articles.all()
        if not articles:
            return [], 200
        review_ids = [a.id for a in articles]
        count_rows = (
            db.session.query(ReviewLike.review_id, func.count(ReviewLike.id))
            .filter(ReviewLike.review_id.in_(review_ids))
            .group_by(ReviewLike.review_id)
            .all()
        )
        counts = {row[0]: row[1] for row in count_rows}
        user_id = session.get("user_id")
        liked_ids = set()
        if user_id:
            liked_ids = {
                row[0]
                for row in db.session.query(ReviewLike.review_id)
                .filter(
                    ReviewLike.review_id.in_(review_ids),
                    ReviewLike.user_id == user_id,
                )
                .all()
            }
        out = []
        for a in articles:
            d = a.to_dict()
            _add_like_fields_to_review_dict(d, counts.get(a.id, 0), a.id in liked_ids)
            out.append(d)
        elapsed_ms = (time.perf_counter() - start) * 1000
        log = logger.warning if elapsed_ms > 300 else logger.info
        log(
            f"articles.get.list elapsed_ms={elapsed_ms:.2f}ms "
            f"search='{search_query}' count={len(out)}",
            extra={
                "endpoint": "/api/articles",
                "search_query": search_query,
                "elapsed_ms": round(elapsed_ms, 2),
                "articles_count": len(out),
            },
        )
        return out, 200

    def post(self):
        data = request.get_json()

        # Validate required fields
        if not data.get("title"):
            return {"error": "Article title is required"}, 400
        if not data.get("review_text"):
            return {"error": "Article content is required"}, 400

        # Create new article
        article = Review(
            title=data.get("title"),
            review_text=data.get("review_text"),
            movie_id=None,  # Articles don't have movie_id
            rating=None,  # Articles don't have ratings
            date_added=date.today(),
        )

        db.session.add(article)
        db.session.flush()  # Flush to get the article ID

        # Handle tags if provided
        if data.get("tags"):
            for tag_data in data["tags"]:
                tag_name = tag_data.get("name", "").strip().lower()
                if tag_name:
                    # Find or create tag
                    tag = Tag.query.filter_by(name=tag_name).first()
                    if not tag:
                        tag = Tag(name=tag_name)
                        db.session.add(tag)
                        db.session.flush()

                    # Associate tag with article
                    article.tags.append(tag)

        db.session.commit()

        return article.to_dict(), 201


class ArticleById(Resource):
    def get(self, article_id):
        article = Review.query.filter_by(id=article_id, movie_id=None).first()
        if not article:
            return {"error": "Article not found"}, 404
        return article.to_dict(), 200

    def patch(self, article_id):
        article = Review.query.filter_by(id=article_id, movie_id=None).first()
        if not article:
            return {"error": "Article not found"}, 404
        data = request.get_json()

        # Handle tags separately since it's a relationship
        if "tags" in data:
            tags_data = data.pop("tags")  # Remove tags from data
            # Clear existing tags
            article.tags.clear()
            # Add new tags
            for tag_data in tags_data:
                if isinstance(tag_data, dict) and "name" in tag_data:
                    # Find or create tag
                    tag = Tag.query.filter_by(
                        name=tag_data["name"].lower().strip()
                    ).first()
                    if not tag:
                        tag = Tag(name=tag_data["name"].lower().strip())
                        db.session.add(tag)
                    article.tags.append(tag)

        # Handle other attributes normally
        for attr in data:
            setattr(article, attr, data.get(attr))

        db.session.commit()
        return article.to_dict(), 200

    def delete(self, article_id):
        article = Review.query.filter_by(id=article_id, movie_id=None).first()
        if not article:
            return {"error": "Article not found"}, 404
        db.session.delete(article)
        db.session.commit()
        return {}, 204


class Tags(Resource):
    def get(self):
        tags = Tag.query.all()
        return [tag.to_dict() for tag in tags], 200

    def post(self):
        data = request.get_json()

        if not data.get("name"):
            return {"error": "Tag name is required"}, 400

        # Check if tag already exists
        existing_tag = Tag.query.filter_by(name=data["name"].strip().lower()).first()
        if existing_tag:
            return existing_tag.to_dict(), 200

        # Create new tag
        new_tag = Tag(name=data["name"].strip().lower())
        db.session.add(new_tag)
        db.session.commit()

        return new_tag.to_dict(), 201


class Directors(Resource):
    def get(self):
        """Return all directors, sorted by name."""
        directors = Director.query.order_by(Director.name.asc()).all()
        return [director.to_dict() for director in directors], 200


class DirectorById(Resource):
    def get(self, director_id):
        """Return a single director (with movies) by ID."""
        start = time.perf_counter()
        director = Director.query.get(director_id)
        if not director:
            return {"error": "Director not found"}, 404
        out = director.to_dict()
        elapsed_ms = (time.perf_counter() - start) * 1000
        log = logger.warning if elapsed_ms > 300 else logger.info
        log(
            f"directors.get.by_id elapsed_ms={elapsed_ms:.2f}ms "
            f"director_id={director_id} movies_count={len(out.get('movies') or [])}",
            extra={
                "endpoint": "/api/directors/<id>",
                "director_id": director_id,
                "elapsed_ms": round(elapsed_ms, 2),
                "movies_count": len(out.get("movies") or []),
            },
        )
        return out, 200

    def patch(self, director_id):
        """Update editable fields on a director (e.g., biography, cover photo)."""
        director = Director.query.get(director_id)
        if not director:
            return {"error": "Director not found"}, 404

        data = request.get_json() or {}

        # Allow updating a safe subset of fields
        for attr in ["name", "biography", "cover_photo"]:
            if attr in data:
                setattr(director, attr, data.get(attr))

        db.session.commit()
        return director.to_dict(), 200


class PullMovieInfo(Resource):
    def get(self):
        searchText = request.args.get("search", "").strip()

        API_KEY = os.getenv("MOVIE_API_KEY")
        base_url = "https://api.themoviedb.org/3"

        # If there's a search query, use the search endpoint
        if searchText:
            encoded_query = quote_plus(searchText)
            url = f"{base_url}/search/movie?api_key={API_KEY}&query={encoded_query}&language=en-US&page=1"
        else:
            # No search term provided, fetch popular movies
            url = f"{base_url}/movie/popular?api_key={API_KEY}"

        print(url)

        response = requests.get(url)

        if response.status_code == 200:
            return response.json()
        else:
            return {
                "error": f"Failed to fetch movies. Status {response.status_code}: {response.text}"
            }, response.status_code


class DiscoverMovies(Resource):
    def get(self):
        genre_id = request.args.get("genre_id")
        search_query = request.args.get("search", "").strip()
        page = request.args.get("page", 1)

        API_KEY = os.getenv("MOVIE_API_KEY")
        base_url = "https://api.themoviedb.org/3"

        if search_query:
            # Use search endpoint with genre filter
            encoded_query = quote_plus(search_query)
            url = f"{base_url}/search/movie?api_key={API_KEY}&query={encoded_query}&with_genres={genre_id}&language=en-US&page={page}"
        else:
            # Use discover endpoint for popular movies in this genre
            url = f"{base_url}/discover/movie?api_key={API_KEY}&with_genres={genre_id}&language=en-US&page={page}&sort_by=popularity.desc"

        print(f"DiscoverMovies - {url}")

        response = requests.get(url)

        if response.status_code == 200:
            return response.json()
        else:
            return {
                "error": f"Failed to fetch movies. Status {response.status_code}: {response.text}"
            }, response.status_code


class MovieRatings(Resource):
    """Get ratings for movies by external IDs."""

    def post(self):
        """Get local movie ratings for a list of external IDs."""
        try:
            data = request.get_json()
            external_ids = data.get("external_ids", [])

            if not external_ids:
                return {}, 200

            # Single efficient query to get movies with ratings
            movies_with_ratings = (
                db.session.query(Movie.id, Movie.external_id, Review.rating)
                .join(Review)
                .filter(Movie.external_id.in_(external_ids))
                .all()
            )

            # Build response mapping external_id -> {local_id, rating}
            ratings_map = {}
            for movie in movies_with_ratings:
                ratings_map[movie.external_id] = {
                    "local_id": movie.id,
                    "rating": movie.rating,
                }

            return ratings_map, 200

        except Exception as e:
            return {"error": f"Failed to fetch ratings: {str(e)}"}, 500


class MovieRatingsBulk(Resource):
    """Get ratings for movies by both local and external IDs efficiently."""

    def post(self):
        """Get local movie ratings for a list of movie IDs (both local and external)."""
        try:
            data = request.get_json()
            local_ids = data.get("local_ids", [])
            external_ids = data.get("external_ids", [])

            ratings_map = {}

            # Handle local movies - direct ID lookup
            if local_ids:
                local_movies_with_ratings = (
                    db.session.query(Movie.id, Review.rating)
                    .join(Review)
                    .filter(Movie.id.in_(local_ids))
                    .all()
                )

                for movie in local_movies_with_ratings:
                    ratings_map[movie.id] = {
                        "local_id": movie.id,
                        "rating": movie.rating,
                    }

            # Handle external movies - external ID to local ID lookup
            if external_ids:
                external_movies_with_ratings = (
                    db.session.query(Movie.id, Movie.external_id, Review.rating)
                    .join(Review)
                    .filter(Movie.external_id.in_(external_ids))
                    .all()
                )

                for movie in external_movies_with_ratings:
                    ratings_map[movie.external_id] = {
                        "local_id": movie.id,
                        "rating": movie.rating,
                    }

            return ratings_map, 200

        except Exception as e:
            return {"error": f"Failed to fetch bulk ratings: {str(e)}"}, 500


class DeleteMovie(Resource):
    """Delete a movie and all its associated data (admin only)"""

    def delete(self, movie_id):
        try:
            movie = Movie.query.get(movie_id)
            if not movie:
                return {"error": "Movie not found"}, 404

            # Get all reviews for this movie to clean up S3 documents
            reviews = Review.query.filter_by(movie_id=movie_id).all()

            # Delete associated S3 documents for all reviews
            for review in reviews:
                if review.has_document and review.document_path:
                    try:
                        from movie_reviews.utils.s3_client import s3_client

                        s3_client.delete_object(
                            Bucket="movie-reviews-documents", Key=review.document_path
                        )
                    except Exception as e:
                        print(f"Warning: Could not delete S3 document: {e}")

            # Delete the movie (cascade will handle reviews and tags)
            db.session.delete(movie)
            db.session.commit()

            return {
                "message": "Movie and all associated data deleted successfully"
            }, 200

        except Exception as e:
            db.session.rollback()
            return {"error": f"Failed to delete movie: {str(e)}"}, 500


class DeleteArticle(Resource):
    """Delete an article (admin only)"""

    def delete(self, article_id):
        try:
            article = Review.query.filter_by(id=article_id, movie_id=None).first()
            if not article:
                return {"error": "Article not found"}, 404

            # Delete associated document if it exists
            if article.has_document and article.document_path:
                try:
                    from movie_reviews.utils.s3_client import s3_client

                    s3_client.delete_object(
                        Bucket="movie-reviews-documents", Key=article.document_path
                    )
                except Exception as e:
                    print(f"Warning: Could not delete S3 document: {e}")

            # Delete the article
            db.session.delete(article)
            db.session.commit()

            return {"message": "Article deleted successfully"}, 200

        except Exception as e:
            db.session.rollback()
            return {"error": f"Failed to delete article: {str(e)}"}, 500


class UnifiedSearch(Resource):
    def get(self):
        search_query = request.args.get("q", "").strip()

        if not search_query:
            # Return empty results if no search query
            return {
                "movies": [],
                "articles": [],
                "directors": [],
                "totalResults": 0,
            }, 200

        # Pre-compile search pattern for consistency
        search_pattern = f"%{search_query}%"

        # OPTIMIZED: Use eager loading to prevent N+1 queries
        # Load movies with their reviews and tags in a single query
        movie_results = (
            db.session.query(Movie)
            .options(joinedload(Movie.reviews).joinedload(Review.tags))
            .join(Review, Movie.id == Review.movie_id)
            .filter(
                db.or_(
                    Movie.title.ilike(search_pattern),
                    Review.review_text.ilike(search_pattern),
                    Review.tags.any(Tag.name.ilike(search_pattern)),
                )
            )
            .distinct()
            .limit(25)
            .all()
        )  # Reduced limit for faster response

        # OPTIMIZED: Use eager loading for articles with tags
        article_results = (
            db.session.query(Review)
            .options(joinedload(Review.tags))
            .filter_by(movie_id=None)
            .filter(
                db.or_(
                    Review.title.ilike(search_pattern),
                    Review.review_text.ilike(search_pattern),
                    Review.tags.any(Tag.name.ilike(search_pattern)),
                )
            )
            .limit(25)
            .all()
        )  # Reduced limit for faster response

        # Directors: search by name or biography
        director_results = (
            db.session.query(Director)
            .filter(
                db.or_(
                    Director.name.ilike(search_pattern),
                    Director.biography.ilike(search_pattern),
                )
            )
            .limit(25)
            .all()
        )

        # Convert to dictionaries (now with pre-loaded relationships)
        movies_data = [movie.to_dict() for movie in movie_results]
        articles_data = [article.to_dict() for article in article_results]
        directors_data = [director.to_dict() for director in director_results]

        return {
            "movies": movies_data,
            "articles": articles_data,
            "directors": directors_data,
            "totalResults": len(movies_data) + len(articles_data) + len(directors_data),
        }, 200


def register_routes(api):
    api.add_resource(Movies, "/api/movies")
    api.add_resource(MovieById, "/api/movies/<int:movie_id>")
    api.add_resource(Reviews, "/api/reviews")
    api.add_resource(ReviewById, "/api/reviews/<int:review_id>")
    api.add_resource(Articles, "/api/articles")
    api.add_resource(ArticleById, "/api/articles/<int:article_id>")
    api.add_resource(Tags, "/api/tags")
    api.add_resource(PullMovieInfo, "/api/pull_movie_info")
    api.add_resource(DiscoverMovies, "/api/discover_movies")
    api.add_resource(Directors, "/api/directors")
    api.add_resource(DirectorById, "/api/directors/<int:director_id>")
    api.add_resource(UnifiedSearch, "/api/search")
    api.add_resource(MovieRatings, "/api/movie-ratings")
    api.add_resource(MovieRatingsBulk, "/api/movie-ratings-bulk")
    api.add_resource(DeleteMovie, "/api/movies/<int:movie_id>/delete")
    api.add_resource(DeleteArticle, "/api/articles/<int:article_id>/delete")
