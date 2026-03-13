from datetime import datetime
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy_serializer import SerializerMixin
from lib.config import db


class ReviewComment(db.Model, SerializerMixin):
    __tablename__ = 'review_comments'

    id = Column(Integer, primary_key=True)
    review_id = Column(Integer, ForeignKey('reviews.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    body = Column(Text, nullable=False)
    parent_comment_id = Column(Integer, ForeignKey('review_comments.id'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    review = db.relationship('Review', back_populates='comments')
    user = db.relationship('User', back_populates='review_comments')
    replies = db.relationship(
        'ReviewComment',
        backref=db.backref('parent', remote_side=[id]),
        cascade='all, delete-orphan',
        lazy='select',
    )

    serialize_rules = (
        '-review.comments',
        '-user.review_comments',
        '-replies.parent',
    )

    def __repr__(self):
        return f'<ReviewComment {self.id} on Review {self.review_id} by User {self.user_id}>'

