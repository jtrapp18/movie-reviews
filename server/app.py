#!/usr/bin/env python3

import os
import requests
import uuid
from datetime import date
from datetime import datetime
# from flask_migrate import Migrate
from flask import request, session, send_file, jsonify, Response
from flask_restful import  Resource
from collections import Counter
from urllib.parse import quote_plus
from lib.config import app, db, api
from sqlalchemy.orm import joinedload
from lib.models import User, Movie, Review, Tag
from lib.utils.document_processor import DocumentProcessor
from flask_cors import CORS

# Enable CORS for all routes
CORS(app)

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    """Serve uploaded files."""
    uploads_dir = os.path.join(app.root_path, 'uploads')
    file_path = os.path.join(uploads_dir, filename)
    
    if os.path.exists(file_path):
        return send_file(file_path)
    else:
        return jsonify({'error': 'File not found'}), 404

@app.route('/robots.txt')
def robots_txt():
    """Serve robots.txt for SEO"""
    robots_content = """User-agent: *
Allow: /

# Sitemap location
Sitemap: {}/sitemap.xml

# Disallow admin and private areas
Disallow: /admin
Disallow: /login
Disallow: /articles/new

# Allow all movie and article pages
Allow: /movies/
Allow: /articles/
Allow: /search_movies""".format(request.url_root.rstrip('/'))
    
    return Response(robots_content, mimetype='text/plain')

# @app.before_request
# def check_if_logged_in():
#     app.logger.debug(f"Request endpoint: {request.endpoint}")
#     if not session.get('user_id') \
#     and request.endpoint in ['spongebob']:
#     # and request.endpoint in ['hives', 'inspections', 'queens']:
#         return {'error': 'Unauthorized'}, 401
    
class ClearSession(Resource):

    def delete(self):
    
        session['user_id'] = None

        return {}, 204

class AccountSignup(Resource):
    def post(self):
        try:
            json = request.get_json()

            # Check if the username already exists in the database
            existing_user = User.query.filter_by(username=json['username']).first()

            # Check if the email already exists in the database
            existing_email = User.query.filter_by(email=json['email']).first()        

            error_dict = {}

            if existing_user:
                error_dict['username'] = 'Username already taken.'

            if existing_email:
                error_dict['email'] = 'Email already registered.'

            if existing_user or existing_email:
                return {'error': error_dict}, 400                

            user = User(
                username=json['username'],
                first_name=json['first_name'],
                last_name=json['last_name'],
                phone_number=json['phone_number'],
                email=json['email'],
                zipcode=json['zipcode']
                )
            
            user.password_hash = json['password']
            db.session.add(user)
            db.session.commit()

            session['user_id'] = user.id

            return user.to_dict(), 201
        except Exception as e:
            db.session.rollback()  # Rollback any changes made in the transaction
            return {'error': f'An error occurred: {str(e)}'}, 500
    
class CheckSession(Resource):
    def get(self):
        
        user_id = session.get('user_id', 0)
        if user_id:
            user = User.query.filter(User.id == user_id).first()
            return user.to_dict(), 200
        
        return {}, 204

class Login(Resource):
    def post(self):
        try:
            json = request.get_json()

            username = json['username']
            user = User.query.filter_by(username=username).first()

            if not user:
                return {'error': 'Invalid username or password'}, 401

            password = json['password']

            if user.authenticate(password):
                session['user_id'] = user.id
                return user.to_dict(), 200

            return {'error': 'Invalid username or password'}, 401
        except Exception as e:
            return {'error': f'An error occurred: {str(e)}'}, 500

class Logout(Resource):
    def delete(self):
        session['user_id'] = None
        return {}, 204

class UserById(Resource):
    def get(self, user_id):
        user = User.query.get(user_id)
        if not user:
            return {'error': 'User not found'}, 404
        return user.to_dict(), 200
    
    def patch(self, user_id):
        user = User.query.get(user_id)
        if not user:
            return {'error': 'User not found'}, 404

        data = request.get_json()

        # Check if username or email have changed
        if 'username' in data and data['username'] != user.username:
            user.username = data['username']

        if 'email' in data and data['email'] != user.email:
            # Check if the new email is already taken (excluding the current user)
            if db.session.query(User).filter(User.email == data['email'], User.id != user.id).first():
                return {'error': 'Email address is already in use.'}, 400
            user.email = data['email']

        # Update other fields
        for attr in data:
            if attr not in ['username', 'email']:  # Skip updating username and email if not changed
                setattr(user, attr, data.get(attr))

        db.session.commit()
        return user.to_dict(), 200

class Movies(Resource):
    def get(self):
        movies = [movie.to_dict() for movie in Movie.query.all()]
        return movies, 200
    
    def post(self):
        data = request.get_json()
        
        try:
            new_movie = Movie(
                external_id=data.get('external_id'),
                original_language=data.get('original_language'),
                original_title=data.get('original_title'),
                overview=data.get('overview'),
                title=data.get('title'),
                release_date=data.get('release_date'),
                cover_photo=data.get('cover_photo')
            )

            db.session.add(new_movie)
            db.session.commit()
            
            return new_movie.to_dict(), 201
        
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 400

class MovieById(Resource):
    def get(self, movie_id):
        movie = Movie.query.get(movie_id)
        if not movie:
            return {'error': 'Movie not found'}, 404
        return movie.to_dict(), 200

    def patch(self, movie_id):
        movie = Movie.query.get(movie_id)
        if not movie:
            return {'error': 'Movie not found'}, 404
        data = request.get_json()
        
        for attr in data:
            setattr(movie, attr, data.get(attr))

        db.session.commit()
        return movie.to_dict(), 200

    def delete(self, movie_id):
        movie = Movie.query.get(movie_id)
        if not movie:
            return {'error': 'Movie not found'}, 404
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
            title=data.get('title'),
            rating=data.get('rating'),
            review_text=data.get('review_text'),
            movie_id=data.get('movie_id')
        )
        db.session.add(new_review)
        db.session.flush()  # Flush to get the review ID
        
        # Handle tags if provided
        if data.get('tags'):
            for tag_data in data['tags']:
                tag_name = tag_data.get('name', '').strip().lower()
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

class ReviewById(Resource):
    def get(self, review_id):
        review = Review.query.get(review_id)
        if not review:
            return {'error': 'Review not found'}, 404
        return review.to_dict(), 200

    def patch(self, review_id):
        review = Review.query.get(review_id)
        if not review:
            return {'error': 'Review not found'}, 404
        data = request.get_json()
        
        # Handle tags separately since it's a relationship
        if 'tags' in data:
            tags_data = data.pop('tags')  # Remove tags from data
            # Clear existing tags
            review.tags.clear()
            # Add new tags
            for tag_data in tags_data:
                if isinstance(tag_data, dict) and 'name' in tag_data:
                    # Find or create tag
                    tag = Tag.query.filter_by(name=tag_data['name'].lower().strip()).first()
                    if not tag:
                        tag = Tag(name=tag_data['name'].lower().strip())
                        db.session.add(tag)
                    review.tags.append(tag)
        
        # Handle movie separately since it's a relationship
        if 'movie' in data:
            data.pop('movie')  # Remove movie from data - relationship handled by movie_id
        
        # Handle other attributes normally
        for attr in data:
            setattr(review, attr, data.get(attr))

        db.session.commit()
        return review.to_dict(), 200

    def delete(self, review_id):
        review = Review.query.get(review_id)
        if not review:
            return {'error': 'Review not found'}, 404
        db.session.delete(review)
        db.session.commit()
        return {}, 204

class Articles(Resource):
    def get(self):
        search_query = request.args.get('search', '')
        articles = Review.query.filter_by(movie_id=None)
        
        if search_query:
            articles = articles.filter(
                db.or_(
                    Review.title.contains(search_query),
                    Review.review_text.contains(search_query),
                    Review.tags.any(Tag.name.contains(search_query))
                )
            )
        
        return [article.to_dict() for article in articles.all()], 200

    def post(self):
        data = request.get_json()
        
        # Validate required fields
        if not data.get('title'):
            return {'error': 'Article title is required'}, 400
        if not data.get('review_text'):
            return {'error': 'Article content is required'}, 400
        
        # Create new article
        article = Review(
            title=data.get('title'),
            review_text=data.get('review_text'),
            movie_id=None,  # Articles don't have movie_id
            rating=None,    # Articles don't have ratings
            date_added=date.today()
        )
        
        db.session.add(article)
        db.session.flush()  # Flush to get the article ID
        
        # Handle tags if provided
        if data.get('tags'):
            for tag_data in data['tags']:
                tag_name = tag_data.get('name', '').strip().lower()
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
            return {'error': 'Article not found'}, 404
        return article.to_dict(), 200

    def patch(self, article_id):
        article = Review.query.filter_by(id=article_id, movie_id=None).first()
        if not article:
            return {'error': 'Article not found'}, 404
        data = request.get_json()
        
        # Handle tags separately since it's a relationship
        if 'tags' in data:
            tags_data = data.pop('tags')  # Remove tags from data
            # Clear existing tags
            article.tags.clear()
            # Add new tags
            for tag_data in tags_data:
                if isinstance(tag_data, dict) and 'name' in tag_data:
                    # Find or create tag
                    tag = Tag.query.filter_by(name=tag_data['name'].lower().strip()).first()
                    if not tag:
                        tag = Tag(name=tag_data['name'].lower().strip())
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
            return {'error': 'Article not found'}, 404
        db.session.delete(article)
        db.session.commit()
        return {}, 204

class Tags(Resource):
    def get(self):
        tags = Tag.query.all()
        return [tag.to_dict() for tag in tags], 200

    def post(self):
        data = request.get_json()
        
        if not data.get('name'):
            return {'error': 'Tag name is required'}, 400
        
        # Check if tag already exists
        existing_tag = Tag.query.filter_by(name=data['name'].strip().lower()).first()
        if existing_tag:
            return existing_tag.to_dict(), 200
        
        # Create new tag
        new_tag = Tag(name=data['name'].strip().lower())
        db.session.add(new_tag)
        db.session.commit()
        
        return new_tag.to_dict(), 201
    
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
            return {'error': f'Failed to fetch movies. Status {response.status_code}: {response.text}'}, response.status_code

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
            return {'error': f'Failed to fetch movies. Status {response.status_code}: {response.text}'}, response.status_code

class MovieRatings(Resource):
    """Get ratings for movies by external IDs."""
    
    def post(self):
        """Get local movie ratings for a list of external IDs."""
        try:
            data = request.get_json()
            external_ids = data.get('external_ids', [])
            
            if not external_ids:
                return {}, 200
            
            # Single efficient query to get movies with ratings
            movies_with_ratings = db.session.query(
                Movie.id, 
                Movie.external_id, 
                Review.rating
            ).join(Review).filter(
                Movie.external_id.in_(external_ids)
            ).all()
            
            # Build response mapping external_id -> {local_id, rating}
            ratings_map = {}
            for movie in movies_with_ratings:
                ratings_map[movie.external_id] = {
                    'local_id': movie.id,
                    'rating': movie.rating
                }
            
            return ratings_map, 200
            
        except Exception as e:
            return {'error': f'Failed to fetch ratings: {str(e)}'}, 500

class MovieRatingsBulk(Resource):
    """Get ratings for movies by both local and external IDs efficiently."""
    
    def post(self):
        """Get local movie ratings for a list of movie IDs (both local and external)."""
        try:
            data = request.get_json()
            local_ids = data.get('local_ids', [])
            external_ids = data.get('external_ids', [])
            
            ratings_map = {}
            
            # Handle local movies - direct ID lookup
            if local_ids:
                local_movies_with_ratings = db.session.query(
                    Movie.id, 
                    Review.rating
                ).join(Review).filter(
                    Movie.id.in_(local_ids)
                ).all()
                
                for movie in local_movies_with_ratings:
                    ratings_map[movie.id] = {
                        'local_id': movie.id,
                        'rating': movie.rating
                    }
            
            # Handle external movies - external ID to local ID lookup
            if external_ids:
                external_movies_with_ratings = db.session.query(
                    Movie.id, 
                    Movie.external_id, 
                    Review.rating
                ).join(Review).filter(
                    Movie.external_id.in_(external_ids)
                ).all()
                
                for movie in external_movies_with_ratings:
                    ratings_map[movie.external_id] = {
                        'local_id': movie.id,
                        'rating': movie.rating
                    }
            
            return ratings_map, 200
            
        except Exception as e:
            return {'error': f'Failed to fetch bulk ratings: {str(e)}'}, 500

class ReviewWithDocument(Resource):
    """Handle review creation with optional document upload in one request."""
    
    def post(self):
        """Create a new review with optional document upload."""
        try:
            # Check if this is a file upload (multipart/form-data)
            if request.content_type and 'multipart/form-data' in request.content_type:
                # Handle file upload
                data = request.form.to_dict()
                file = request.files.get('document')
            else:
                # Handle JSON data
                data = request.get_json()
                file = None
            
            # Validate required fields
            if not data.get('title'):
                return {'error': 'Review title is required'}, 400
            if not data.get('rating'):
                return {'error': 'Rating is required'}, 400
            if not data.get('movie_id'):
                return {'error': 'Movie ID is required'}, 400
            
            # Create new review
            review = Review(
                title=data.get('title'),
                rating=data.get('rating'),
                review_text=data.get('review_text', ''),
                movie_id=data.get('movie_id'),
                content_type='review'
            )
            
            db.session.add(review)
            db.session.flush()  # Flush to get the review ID
            
            # Handle tags if provided
            if data.get('tags'):
                tags_data = data['tags']
                # Parse JSON string if needed
                if isinstance(tags_data, str):
                    import json
                    tags_data = json.loads(tags_data)
                
                for tag_data in tags_data:
                    if isinstance(tag_data, dict) and 'name' in tag_data:
                        tag_name = tag_data['name'].strip().lower()
                        if tag_name:
                            # Find or create tag
                            tag = Tag.query.filter_by(name=tag_name).first()
                            if not tag:
                                tag = Tag(name=tag_name)
                                db.session.add(tag)
                                db.session.flush()
                            review.tags.append(tag)
            
            # Handle document upload if file is provided
            if file and file.filename:
                result = DocumentProcessor.process_uploaded_document_temporary(file)
                
                if result['success']:
                    # Update review with document information
                    review.has_document = True
                    review.document_filename = result['filename']
                    review.document_type = result['file_type']
                    
                    # Replace review text with extracted text if replace_text is true
                    replace_text = data.get('replace_text', 'true').lower() == 'true'
                    if replace_text and result['extracted_text']:
                        review.review_text = result['extracted_text']
                else:
                    return {'error': f'Document processing failed: {result["error"]}'}, 400
            
            db.session.commit()
            return review.to_dict(), 201
            
        except Exception as e:
            db.session.rollback()
            return {'error': f'Failed to create review: {str(e)}'}, 500

class ReviewWithDocumentById(Resource):
    """Handle review updates with optional document upload in one request."""
    
    def patch(self, review_id):
        """Update an existing review with optional document upload."""
        try:
            review = Review.query.get(review_id)
            if not review:
                return {'error': 'Review not found'}, 404
            
            # Check if this is a file upload (multipart/form-data)
            if request.content_type and 'multipart/form-data' in request.content_type:
                # Handle file upload
                data = request.form.to_dict()
                file = request.files.get('document')
            else:
                # Handle JSON data
                data = request.get_json()
                file = None
            
            # Update review fields
            if 'title' in data:
                review.title = data['title']
            if 'rating' in data:
                review.rating = data['rating']
            if 'review_text' in data:
                review.review_text = data['review_text']
            
            # Handle tags if provided
            if 'tags' in data:
                # Clear existing tags
                review.tags.clear()
                # Add new tags
                tags_data = data['tags']
                # Parse JSON string if needed
                if isinstance(tags_data, str):
                    import json
                    tags_data = json.loads(tags_data)
                
                for tag_data in tags_data:
                    if isinstance(tag_data, dict) and 'name' in tag_data:
                        tag_name = tag_data['name'].strip().lower()
                        if tag_name:
                            # Find or create tag
                            tag = Tag.query.filter_by(name=tag_name).first()
                            if not tag:
                                tag = Tag(name=tag_name)
                                db.session.add(tag)
                            review.tags.append(tag)
            
            # Handle document upload if file is provided
            if file and file.filename:
                result = DocumentProcessor.process_uploaded_document_temporary(file)
                
                if result['success']:
                    # Update review with document information
                    review.has_document = True
                    review.document_filename = result['filename']
                    review.document_type = result['file_type']
                    
                    # Replace review text with extracted text if replace_text is true
                    replace_text = data.get('replace_text', 'true').lower() == 'true'
                    if replace_text and result['extracted_text']:
                        review.review_text = result['extracted_text']
                else:
                    return {'error': f'Document processing failed: {result["error"]}'}, 400
            
            db.session.commit()
            return review.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': f'Failed to update review: {str(e)}'}, 500

class DocumentUpload(Resource):
    """Handle document uploads for reviews."""
    
    def post(self):
        """Upload and process a document for a review using temporary processing."""
        try:
            # Check if file is present
            if 'document' not in request.files:
                return {'error': 'No document file provided'}, 400
            
            file = request.files['document']
            if file.filename == '':
                return {'error': 'No file selected'}, 400
            
            # Get review_id from form data
            review_id = request.form.get('review_id')
            if not review_id:
                return {'error': 'Review ID is required'}, 400
            
            # Check if we should replace text
            replace_text = request.form.get('replace_text', 'false').lower() == 'true'
            
            # Find the review
            review = Review.query.get(review_id)
            print(f"Found review: {review}")
            if not review:
                return {'error': 'Review not found'}, 404
            
            # Process the document using S3 storage (production-ready)
            print(f"Processing document: {file.filename}")
            result = DocumentProcessor.process_uploaded_document_s3(file, int(review_id))
            print(f"Document processing result: {result}")
            
            if not result['success']:
                return {'error': result['error']}, 400
            
            # Update review with document information
            review.has_document = True
            review.document_filename = result['filename']
            review.document_path = result['file_path']  # Store the actual file path
            review.document_type = result['file_type']
            
            # Optionally replace review text with extracted text
            if replace_text and result['extracted_text']:
                review.review_text = result['extracted_text']
            
            db.session.commit()
            
            return {
                'message': 'Document processed successfully',
                'review': review.to_dict(),
                'document_info': {
                    'filename': result['filename'],
                    'file_type': result['file_type'],
                    'extracted_text_length': len(result['extracted_text']),
                    'text_replaced': replace_text
                }
            }, 200
            
        except Exception as e:
            return {'error': f'Upload failed: {str(e)}'}, 500

class ExtractText(Resource):
    """Handle text extraction from documents without saving."""
    
    def post(self):
        """Extract text from a document without saving it."""
        try:
            if 'document' not in request.files:
                return {'error': 'No document provided'}, 400
            
            file = request.files['document']
            if file.filename == '':
                return {'error': 'No file selected'}, 400
            
            # Process the document to extract text
            result = DocumentProcessor.process_uploaded_document_temporary(file)
            
            if not result['success']:
                return {'error': f'Text extraction failed: {result.get("error", "Unknown error")}'}, 400
            
            # Extract HTML with full formatting preservation
            file_type = result['file_type']
            temp_path = result['file_path']
            raw_text = result['extracted_text']
            
            # Use the new HTML extraction method
            html_text = DocumentProcessor.extract_html_from_document(temp_path, file_type, clean_text=True, remove_title=True)
            
            return {
                'text': html_text,  # Return HTML formatted text
                'raw_text': raw_text,  # Also include raw text for reference
                'filename': result['filename'],
                'file_type': result['file_type'],
                'text_length': len(html_text)
            }, 200
            
        except Exception as e:
            return {'error': f'Text extraction failed: {str(e)}'}, 500

class DocumentDownload(Resource):
    """Handle document downloads."""
    
    def get(self, review_id):
        """Download the document associated with a review."""
        try:
            from lib.utils.s3_client import get_s3_client
            
            review = Review.query.get(review_id)
            if not review:
                return {'error': 'Review not found'}, 404
            
            if not review.has_document or not review.document_path:
                return {'error': 'No document associated with this review'}, 404
            
            # Download file from S3
            s3_client = get_s3_client()
            download_result = s3_client.download_file(review.document_path)
            
            if not download_result['success']:
                return {'error': download_result['error']}, 404
            
            # Create response with file data
            from flask import Response
            response = Response(
                download_result['file_data'],
                mimetype=download_result['content_type'],
                headers={
                    'Content-Disposition': f'attachment; filename="{review.document_filename}"'
                }
            )
            
            # Add cache-busting headers
            response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response.headers['Pragma'] = 'no-cache'
            response.headers['Expires'] = '0'
            
            return response
            
        except Exception as e:
            return {'error': f'Download failed: {str(e)}'}, 500

class DocumentView(Resource):
    """Handle document viewing (inline display)."""
    
    def get(self, review_id):
        """View the document associated with a review inline."""
        try:
            from lib.utils.s3_client import get_s3_client
            
            print(f"DEBUG DocumentView - Looking for review_id: {review_id}")
            review = Review.query.get(review_id)
            if not review:
                print(f"DEBUG DocumentView - Review {review_id} not found")
                return {'error': 'Review not found'}, 404
            
            print(f"DEBUG DocumentView - Found review: {review.title}")
            print(f"DEBUG DocumentView - has_document: {review.has_document}")
            print(f"DEBUG DocumentView - document_path: {review.document_path}")
            
            if not review.has_document or not review.document_path:
                print(f"DEBUG DocumentView - No document associated with review {review_id}")
                return {'error': 'No document associated with this review'}, 404
            
            # Download file from S3
            s3_client = get_s3_client()
            download_result = s3_client.download_file(review.document_path)
            
            if not download_result['success']:
                print(f"DEBUG DocumentView - S3 download failed: {download_result['error']}")
                return {'error': download_result['error']}, 404
            
            # Create response with file data for inline viewing
            from flask import Response
            mimetype = 'application/pdf' if review.document_type == 'pdf' else download_result['content_type']
            response = Response(
                download_result['file_data'],
                mimetype=mimetype
            )
            
            # Add cache-busting headers
            response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response.headers['Pragma'] = 'no-cache'
            response.headers['Expires'] = '0'
            
            return response
            
        except Exception as e:
            return {'error': f'View failed: {str(e)}'}, 500

class DocumentPreview(Resource):
    """Get document preview without downloading."""
    
    def get(self, review_id):
        """Get a preview of the document content."""
        try:
            review = Review.query.get(review_id)
            if not review:
                return {'error': 'Review not found'}, 404
            
            if not review.has_document:
                return {'error': 'No document associated with this review'}, 404
            
            # Get preview from review text
            preview_text = ""
            if review.review_text:
                preview_text = review.review_text[:500] + "..." if len(review.review_text) > 500 else review.review_text
            
            return {
                'preview': preview_text,
                'filename': review.document_filename,
                'file_type': review.document_type,
                'has_document': review.has_document
            }, 200
            
        except Exception as e:
            return {'error': f'Preview failed: {str(e)}'}, 500

class Sitemap(Resource):
    """Generate XML sitemap for SEO"""
    
    def get(self):
        try:
            from flask import Response
            import xml.etree.ElementTree as ET
            
            # Get all movies and articles
            movies = Movie.query.all()
            articles = Review.query.filter_by(movie_id=None).all()
            
            # Create XML structure
            root = ET.Element('urlset')
            root.set('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
            
            # Add home page
            home_url = ET.SubElement(root, 'url')
            ET.SubElement(home_url, 'loc').text = request.url_root.rstrip('/')
            ET.SubElement(home_url, 'changefreq').text = 'daily'
            ET.SubElement(home_url, 'priority').text = '1.0'
            
            # Add search page
            search_url = ET.SubElement(root, 'url')
            ET.SubElement(search_url, 'loc').text = f"{request.url_root.rstrip('/')}/#/search_movies"
            ET.SubElement(search_url, 'changefreq').text = 'weekly'
            ET.SubElement(search_url, 'priority').text = '0.8'
            
            # Add articles page
            articles_url = ET.SubElement(root, 'url')
            ET.SubElement(articles_url, 'loc').text = f"{request.url_root.rstrip('/')}/#/articles"
            ET.SubElement(articles_url, 'changefreq').text = 'weekly'
            ET.SubElement(articles_url, 'priority').text = '0.8'
            
            # Add movie pages
            for movie in movies:
                movie_url = ET.SubElement(root, 'url')
                ET.SubElement(movie_url, 'loc').text = f"{request.url_root.rstrip('/')}/#/movies/{movie.id}"
                ET.SubElement(movie_url, 'lastmod').text = movie.release_date.strftime('%Y-%m-%d')
                ET.SubElement(movie_url, 'changefreq').text = 'monthly'
                ET.SubElement(movie_url, 'priority').text = '0.7'
            
            # Add article pages
            for article in articles:
                article_url = ET.SubElement(root, 'url')
                ET.SubElement(article_url, 'loc').text = f"{request.url_root.rstrip('/')}/#/articles/{article.id}"
                ET.SubElement(article_url, 'lastmod').text = article.date_added.strftime('%Y-%m-%d')
                ET.SubElement(article_url, 'changefreq').text = 'monthly'
                ET.SubElement(article_url, 'priority').text = '0.6'
            
            # Convert to string
            xml_str = ET.tostring(root, encoding='unicode')
            
            return Response(xml_str, mimetype='application/xml')
            
        except Exception as e:
            return {'error': f'Sitemap generation failed: {str(e)}'}, 500

class DeleteMovie(Resource):
    """Delete a movie and all its associated data (admin only)"""
    
    def delete(self, movie_id):
        try:
            movie = Movie.query.get(movie_id)
            if not movie:
                return {'error': 'Movie not found'}, 404
            
            # Get all reviews for this movie to clean up S3 documents
            reviews = Review.query.filter_by(movie_id=movie_id).all()
            
            # Delete associated S3 documents for all reviews
            for review in reviews:
                if review.has_document and review.document_path:
                    try:
                        from lib.utils.s3_client import s3_client
                        s3_client.delete_object(Bucket='movie-reviews-documents', Key=review.document_path)
                    except Exception as e:
                        print(f"Warning: Could not delete S3 document: {e}")
            
            # Delete the movie (cascade will handle reviews and tags)
            db.session.delete(movie)
            db.session.commit()
            
            return {'message': 'Movie and all associated data deleted successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': f'Failed to delete movie: {str(e)}'}, 500

class DeleteArticle(Resource):
    """Delete an article (admin only)"""
    
    def delete(self, article_id):
        try:
            article = Review.query.filter_by(id=article_id, movie_id=None).first()
            if not article:
                return {'error': 'Article not found'}, 404
            
            # Delete associated document if it exists
            if article.has_document and article.document_path:
                try:
                    from lib.utils.s3_client import s3_client
                    s3_client.delete_object(Bucket='movie-reviews-documents', Key=article.document_path)
                except Exception as e:
                    print(f"Warning: Could not delete S3 document: {e}")
            
            # Delete the article
            db.session.delete(article)
            db.session.commit()
            
            return {'message': 'Article deleted successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': f'Failed to delete article: {str(e)}'}, 500
        
api.add_resource(ClearSession, '/api/clear', endpoint='clear')
api.add_resource(AccountSignup, '/api/account_signup', endpoint='account_signup')
api.add_resource(CheckSession, '/api/check_session')
api.add_resource(Login, '/api/login')
api.add_resource(Logout, '/api/logout')
api.add_resource(UserById, '/api/users/<int:user_id>')
api.add_resource(Movies, '/api/movies')
api.add_resource(MovieById, '/api/movies/<int:movie_id>')
api.add_resource(Reviews, '/api/reviews')
api.add_resource(ReviewById, '/api/reviews/<int:review_id>')
api.add_resource(Articles, '/api/articles')
api.add_resource(ArticleById, '/api/articles/<int:article_id>')
api.add_resource(Tags, '/api/tags')
api.add_resource(PullMovieInfo, '/api/pull_movie_info')
api.add_resource(DiscoverMovies, '/api/discover_movies')
class UnifiedSearch(Resource):
    def get(self):
        search_query = request.args.get('q', '').strip()
        
        if not search_query:
            # Return empty results if no search query
            return {
                'movies': [],
                'articles': [],
                'totalResults': 0
            }, 200
        
        # Pre-compile search pattern for consistency
        search_pattern = f'%{search_query}%'
        
        # OPTIMIZED: Use eager loading to prevent N+1 queries
        # Load movies with their reviews and tags in a single query
        movie_results = db.session.query(Movie)\
            .options(
                joinedload(Movie.reviews).joinedload(Review.tags)
            )\
            .join(Review, Movie.id == Review.movie_id)\
            .filter(
                db.or_(
                    Movie.title.ilike(search_pattern),
                    Review.review_text.ilike(search_pattern),
                    Review.tags.any(Tag.name.ilike(search_pattern))
                )
            )\
            .distinct()\
            .limit(25).all()  # Reduced limit for faster response
        
        # OPTIMIZED: Use eager loading for articles with tags
        article_results = db.session.query(Review)\
            .options(
                joinedload(Review.tags)
            )\
            .filter_by(movie_id=None)\
            .filter(
                db.or_(
                    Review.title.ilike(search_pattern),
                    Review.review_text.ilike(search_pattern),
                    Review.tags.any(Tag.name.ilike(search_pattern))
                )
            )\
            .limit(25).all()  # Reduced limit for faster response
        
        # Convert to dictionaries (now with pre-loaded relationships)
        movies_data = [movie.to_dict() for movie in movie_results]
        articles_data = [article.to_dict() for article in article_results]
        
        return {
            'movies': movies_data,
            'articles': articles_data,
            'totalResults': len(movies_data) + len(articles_data)
        }, 200

api.add_resource(UnifiedSearch, '/api/search')
api.add_resource(MovieRatings, '/api/movie-ratings')
api.add_resource(MovieRatingsBulk, '/api/movie-ratings-bulk')
api.add_resource(DocumentUpload, '/api/upload_document')
api.add_resource(ExtractText, '/api/extract_text')
api.add_resource(ReviewWithDocument, '/api/reviews_with_document')
api.add_resource(ReviewWithDocumentById, '/api/reviews_with_document/<int:review_id>')
api.add_resource(DocumentDownload, '/api/download_document/<int:review_id>')
api.add_resource(DocumentView, '/api/view_document/<int:review_id>')
api.add_resource(DocumentPreview, '/api/document_preview/<int:review_id>')
api.add_resource(Sitemap, '/sitemap.xml')
api.add_resource(DeleteMovie, '/api/movies/<int:movie_id>/delete')
api.add_resource(DeleteArticle, '/api/articles/<int:article_id>/delete')

if __name__ == '__main__':
    app.run(port=5555, debug=True)
