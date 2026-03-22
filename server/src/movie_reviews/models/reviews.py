from datetime import date

from sqlalchemy import Boolean, Column, Date, Integer, String, Text
from sqlalchemy.orm import validates
from sqlalchemy_serializer import SerializerMixin

from movie_reviews.config import db
from movie_reviews.utils import (
    validate_date_or_yyyy_mm_dd,
    validate_enum,
    validate_optional_int_in_range,
)

from .tags import review_tags


class Review(db.Model, SerializerMixin):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True)
    movie_id = db.Column(db.Integer, db.ForeignKey("movies.id"), nullable=True)
    director_id = db.Column(db.Integer, db.ForeignKey("directors.id"), nullable=True)
    rating = Column(Integer, nullable=True)  # Optional for theme-based articles
    main_cast = Column(Text, nullable=True)
    line_notes = Column(Text, nullable=True)
    review_text = Column(Text, nullable=False)
    date_added = Column(Date, default=date.today, nullable=False)
    content_type = Column(
        String(20), default="review", nullable=False
    )  # 'review' or 'article'
    title = Column(String(200), nullable=True)  # Optional title for articles
    description = Column(Text, nullable=True)  # Short description for articles
    backdrop = Column(String(500), nullable=True)  # URL to backdrop photo
    show_review_backdrop = Column(Boolean, default=True, nullable=False)
    # Document-related fields
    has_document = Column(Boolean, default=False, nullable=True)
    document_filename = Column(String(255), nullable=True)
    document_path = Column(String(500), nullable=True)
    document_type = Column(String(10), nullable=True)  # 'pdf', 'docx', etc.

    __table_args__ = (
        db.Index("ix_reviews_movie_id", "movie_id"),
        db.Index("ix_reviews_director_id", "director_id"),
        db.Index("ix_reviews_content_type_date", "content_type", "date_added"),
    )

    movie = db.relationship("Movie", back_populates="reviews")
    director = db.relationship("Director", back_populates="reviews")
    tags = db.relationship("Tag", secondary=review_tags, back_populates="reviews")
    comments = db.relationship(
        "ReviewComment",
        back_populates="review",
        cascade="all, delete-orphan",
        lazy="select",
    )
    likes = db.relationship(
        "ReviewLike",
        back_populates="review",
        cascade="all, delete-orphan",
        lazy="select",
    )

    serialize_rules = (
        "-movie.reviews",
        "-tags.reviews",
        "-director.reviews",
        "-director.movies",
        "-likes.review",
    )

    def __repr__(self):
        return f"<Review {self.id}, Movie ID: {self.movie_id}, Rating: {self.rating}>"

    @validates("rating")
    def validate_rating(self, key, value):
        return validate_optional_int_in_range(value, 1, 7, "Rating")

    @validates("review_text")
    def validate_review_text(self, key, value):
        """Ensures the review text is not empty for movie reviews."""
        # Allow empty review_text for articles (they can have documents instead)
        if not value or not value.strip():
            if hasattr(self, "content_type") and self.content_type == "article":
                return ""
            # For movie reviews, allow empty text if this is being updated with a document
            # Check if this is a PATCH request by looking at the request context
            from flask import request

            if hasattr(self, "content_type") and self.content_type == "review":
                # Allow empty text for PATCH requests (document uploads)
                if request.method == "PATCH":
                    return ""
                # Only require text for POST requests (new reviews)
                if not getattr(self, "has_document", False):
                    raise ValueError("Review text cannot be empty.")
        return value.strip() if value else ""

    @validates("content_type")
    def validate_content_type(self, key, value):
        return validate_enum(value, ["review", "article"], "Content type")

    @validates("date_added")
    def validate_date_added(self, key, value):
        return validate_date_or_yyyy_mm_dd(value, "date_added")

    @property
    def short_text(self):
        """Returns the first 100 characters of the review text (with ellipsis if truncated)."""
        return (
            self.review_text[:100] + "..."
            if len(self.review_text) > 100
            else self.review_text
        )


# Indexes are handled through database migrations
