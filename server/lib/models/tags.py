from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import validates
from lib.config import db

review_tags = db.Table(
    'review_tags',
    db.Column('review_id', db.Integer, db.ForeignKey('reviews.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tags.id'), primary_key=True)
)

class Tag(db.Model, SerializerMixin):
    __tablename__ = 'tags'

    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)

    reviews = db.relationship('Review', secondary=review_tags, back_populates='tags')

    def __repr__(self):
        return f'<Tag {self.name}>'
    
    @validates('name')
    def validate_name(self, key, value):
        """Ensure tag name is non-empty, stripped, lowercase, and within length."""
        if not value or not value.strip():
            raise ValueError("Tag name cannot be empty.")
        
        value = value.strip().lower()

        if len(value) > 50:
            raise ValueError("Tag name must be 50 characters or fewer.")
        
        return value

# Indexes are handled through database migrations
