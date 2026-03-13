from sqlalchemy import Column, Integer, String, Text
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import validates
from lib.config import db
from lib.utils import validate_required_url, validate_required_string


class Director(db.Model, SerializerMixin):
    __tablename__ = 'directors'

    id = Column(Integer, primary_key=True)
    external_id = Column(Integer, nullable=True, unique=True)  # TheMovieDB ID
    name = Column(String(255), nullable=False)
    cover_photo = Column(String(500), nullable=False)
    backdrop = Column(String(500), nullable=True) # URL to backdrop photo
    biography = Column(Text, nullable=True)
    description = Column(Text, nullable=True) # long-form editorial

    # Relationships
    movies = db.relationship('Movie', back_populates='director', cascade='all', lazy='select')
    reviews = db.relationship('Review', back_populates='director', cascade='all', lazy='select')

    serialize_rules = ('-movies.director', '-reviews.director')

    def __repr__(self):
        return f'<Director {self.id}: {self.name}>'

    @validates('name')
    def validate_name(self, key, value):
        return validate_required_string(value, 'Director name')

    @validates('cover_photo')
    def validate_cover_photo(self, key, value):
        return validate_required_url(value, 'Cover photo URL cannot be empty.', 'Cover photo must be a valid URL.')


