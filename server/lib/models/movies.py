from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import validates
from lib.config import db

class Movie(db.Model, SerializerMixin):
    __tablename__ = 'movies'

    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    cover_photo = Column(String(500), nullable=False)  # URL to cover image
    trailer = Column(String(500), nullable=False)  # URL to trailer video

    # serialize_rules = ('-reviews',)

    def __repr__(self):
        return f'<Movie {self.id}, Title: {self.title}>'

    @validates('title')
    def validate_title(self, key, value):
        """Ensures title is not empty."""
        if not value or not value.strip():
            raise ValueError("Title cannot be empty.")
        return value.strip()

    @validates('description')
    def validate_description(self, key, value):
        """Ensures description is not empty."""
        if not value or not value.strip():
            raise ValueError("Description cannot be empty.")
        return value.strip()

    @validates('cover_photo', 'trailer')
    def validate_urls(self, key, value):
        """Ensures URLs are valid."""
        if not value or not value.strip():
            raise ValueError(f"{key.replace('_', ' ').capitalize()} URL cannot be empty.")
        if not (value.startswith('http://') or value.startswith('https://')):
            raise ValueError(f"{key.replace('_', ' ').capitalize()} must be a valid URL.")
        return value.strip()