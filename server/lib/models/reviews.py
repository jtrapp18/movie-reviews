from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import validates
from lib.config import db

class Review(db.Model, SerializerMixin):
    __tablename__ = 'reviews'

    id = Column(Integer, primary_key=True)
    movie_id = Column(Integer, nullable=False)  # Foreign key if needed
    rating = Column(Integer, nullable=False)  # Assuming a scale of 1-10
    review_text = Column(Text, nullable=False)
    date_added = Column(Date, default=date.today, nullable=False)

    # serialize_rules = ('-movie',)

    def __repr__(self):
        return f'<Review {self.id}, Movie ID: {self.movie_id}, Rating: {self.rating}>'

    @validates('rating')
    def validate_rating(self, key, value):
        """Validates that the rating is between 1 and 10."""
        if not isinstance(value, int) or value < 1 or value > 10:
            raise ValueError("Rating must be an integer between 1 and 10.")
        return value

    @validates('review_text')
    def validate_review_text(self, key, value):
        """Ensures the review text is not empty."""
        if not value or not value.strip():
            raise ValueError("Review text cannot be empty.")
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
