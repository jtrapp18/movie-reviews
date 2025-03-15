from sqlalchemy import Column, Integer, String, Text, Date
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import validates
from lib.config import db

class Movie(db.Model, SerializerMixin):
    __tablename__ = 'movies'

    id = Column(Integer, primary_key=True)
    original_language = Column(String(10), nullable=False)
    original_title = Column(String(255), nullable=False)
    overview = Column(Text, nullable=False)
    title = Column(String(255), nullable=False)
    release_date = Column(Date, nullable=False)
    cover_photo = Column(String(500), nullable=False)  # URL to cover image

    reviews = db.relationship('Review', back_populates='movie', cascade='all, delete-orphan')

    serialize_rules = ('-reviews.movie',)

    def __repr__(self):
        return f'<Movie {self.id}, Title: {self.title}>'

    @validates('original_language', 'original_title', 'title')
    def validate_strings(self, key, value):
        """Ensures string fields are not empty."""
        if not value or not value.strip():
            raise ValueError(f"{key.replace('_', ' ').capitalize()} cannot be empty.")
        return value.strip()

    @validates('overview')
    def validate_overview(self, key, value):
        """Ensures overview is not empty."""
        if not value or not value.strip():
            raise ValueError("Overview cannot be empty.")
        return value.strip()

    @validates('cover_photo')
    def validate_url(self, key, value):
        """Ensures cover photo is a valid URL."""
        if not value or not value.strip():
            raise ValueError("Cover photo URL cannot be empty.")
        if not (value.startswith('http://') or value.startswith('https://')):
            raise ValueError("Cover photo must be a valid URL.")
        return value.strip()