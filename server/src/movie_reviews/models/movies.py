from sqlalchemy import Column, Integer, String, Text, Date
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import validates
from movie_reviews.config import db
from movie_reviews.utils import validate_required_url, validate_required_string

class Movie(db.Model, SerializerMixin):
    __tablename__ = 'movies'

    id = Column(Integer, primary_key=True)
    external_id = Column(Integer, nullable=True, unique=True)  # TheMovieDB ID
    original_language = Column(String(10), nullable=False)
    original_title = Column(String(255), nullable=False)
    overview = Column(Text, nullable=False)
    title = Column(String(255), nullable=False)
    release_date = Column(Date, nullable=False)
    cover_photo = Column(String(500), nullable=False)  # URL to cover image
    backdrop = Column(String(500), nullable=True) # URL to backdrop photo
    director_id = db.Column(db.Integer, db.ForeignKey('directors.id'), nullable=True)

    reviews = db.relationship('Review', back_populates='movie', cascade='all')
    director = db.relationship('Director', back_populates='movies')

    serialize_rules = ('-reviews.movie', '-director.movies')

    def __repr__(self):
        return f'<Movie {self.id}, Title: {self.title}>'

    @validates('original_language', 'original_title', 'title')
    def validate_strings(self, key, value):
        return validate_required_string(value, key.replace('_', ' ').capitalize())

    @validates('overview')
    def validate_overview(self, key, value):
        return validate_required_string(value, 'Overview')

    @validates('cover_photo')
    def validate_url(self, key, value):
        """Ensures cover photo is a valid URL."""
        return validate_required_url(value, "Cover photo URL cannot be empty.", "Cover photo must be a valid URL.")

# Indexes are handled through database migrations