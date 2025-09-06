from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Text, Date, Boolean
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import validates
from lib.config import db
from .tags import article_tags

class Article(db.Model, SerializerMixin):
    __tablename__ = 'articles'

    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    date_added = Column(Date, default=date.today, nullable=False)
    # Document-related fields (same as reviews)
    has_document = Column(Boolean, default=False, nullable=True)
    document_filename = Column(String(255), nullable=True)
    document_path = Column(String(500), nullable=True)
    document_type = Column(String(10), nullable=True)  # 'pdf', 'docx', etc.

    tags = db.relationship('Tag', secondary=article_tags, back_populates='articles')

    serialize_rules = ('-tags.articles',)

    def __repr__(self):
        return f'<Article {self.id}: {self.title}>'

    @validates('title')
    def validate_title(self, key, value):
        """Validates that the title is not empty and within length limits."""
        if not value or not value.strip():
            raise ValueError("Article title cannot be empty.")
        value = value.strip()
        if len(value) > 200:
            raise ValueError("Article title must be 200 characters or fewer.")
        return value

    @validates('content')
    def validate_content(self, key, value):
        """Ensures the content is not empty."""
        if not value or not value.strip():
            raise ValueError("Article content cannot be empty.")
        return value.strip()

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
    def short_content(self):
        """Returns the first 200 characters of the content (with ellipsis if truncated)."""
        return self.content[:200] + "..." if len(self.content) > 200 else self.content
