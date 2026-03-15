from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import validates
from sqlalchemy_serializer import SerializerMixin

from movie_reviews.config import db
from movie_reviews.utils import normalize_tag_name

review_tags = db.Table(
    "review_tags",
    db.Column("review_id", db.Integer, db.ForeignKey("reviews.id"), primary_key=True),
    db.Column("tag_id", db.Integer, db.ForeignKey("tags.id"), primary_key=True),
)


class Tag(db.Model, SerializerMixin):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)

    reviews = db.relationship("Review", secondary=review_tags, back_populates="tags")

    def __repr__(self):
        return f"<Tag {self.name}>"

    @validates("name")
    def validate_name(self, key, value):
        return normalize_tag_name(value, max_length=50)


# Indexes are handled through database migrations
