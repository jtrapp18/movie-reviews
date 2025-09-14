from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey, Boolean
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import validates
from lib.config import db
from .tags import review_tags

class Review(db.Model, SerializerMixin):
    __tablename__ = 'reviews'

    id = Column(Integer, primary_key=True)
    movie_id = db.Column(db.Integer, db.ForeignKey('movies.id'), nullable=True)
    rating = Column(Integer, nullable=True)  # Optional for theme-based articles
    review_text = Column(Text, nullable=False)
    date_added = Column(Date, default=date.today, nullable=False)
    content_type = Column(String(20), default='review', nullable=False)  # 'review' or 'article'
    title = Column(String(200), nullable=True)  # Optional title for articles
    description = Column(Text, nullable=True)  # Short description for articles
    # Document-related fields
    has_document = Column(Boolean, default=False, nullable=True)
    document_filename = Column(String(255), nullable=True)
    document_path = Column(String(500), nullable=True)
    document_type = Column(String(10), nullable=True)  # 'pdf', 'docx', etc.

    movie = db.relationship('Movie', back_populates='reviews')
    tags = db.relationship('Tag', secondary=review_tags, back_populates='reviews')

    serialize_rules = ('-movie.reviews', '-tags.reviews')

    def __repr__(self):
        return f'<Review {self.id}, Movie ID: {self.movie_id}, Rating: {self.rating}>'

    @validates('rating')
    def validate_rating(self, key, value):
        """Validates that the rating is between 1 and 10, or None for articles."""
        if value is not None:
            if not isinstance(value, int) or value < 1 or value > 10:
                raise ValueError("Rating must be an integer between 1 and 10, or None for articles.")
        return value

    @validates('review_text')
    def validate_review_text(self, key, value):
        """Ensures the review text is not empty for movie reviews."""
        # Allow empty review_text for articles (they can have documents instead)
        if not value or not value.strip():
            if hasattr(self, 'content_type') and self.content_type == 'article':
                return ""
            # For movie reviews, allow empty text if this is being updated with a document
            # Check if this is a PATCH request by looking at the request context
            from flask import request
            if hasattr(self, 'content_type') and self.content_type == 'review':
                # Allow empty text for PATCH requests (document uploads)
                if request.method == 'PATCH':
                    return ""
                # Only require text for POST requests (new reviews)
                if not getattr(self, 'has_document', False):
                    raise ValueError("Review text cannot be empty.")
        return value.strip() if value else ""

    @validates('content_type')
    def validate_content_type(self, key, value):
        """Validates that content_type is either 'review' or 'article'."""
        if value not in ['review', 'article']:
            raise ValueError("Content type must be either 'review' or 'article'.")
        return value

    @validates('date_added')
    def validate_date_added(self, key, value):
        """Validates that the date_added field is a valid date."""
        if isinstance(value, str):
            try:
                datetime.strptime(value, '%Y-%m-%d')
            except ValueError:
                raise ValueError("Invalid date format. Must be YYYY-MM-DD.")
        elif not isinstance(value, (datetime, date)):
            raise ValueError("Invalid date format. Must be a string or date object.")
        return value

    @property
    def short_text(self):
        """Returns the first 100 characters of the review text (with ellipsis if truncated)."""
        return self.review_text[:100] + "..." if len(self.review_text) > 100 else self.review_text

# Indexes are handled through database migrations
