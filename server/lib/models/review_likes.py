from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy_serializer import SerializerMixin
from lib.config import db


class ReviewLike(db.Model, SerializerMixin):
    __tablename__ = 'review_likes'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    review_id = Column(Integer, ForeignKey('reviews.id'), nullable=False)

    __table_args__ = (UniqueConstraint('user_id', 'review_id', name='uq_review_like_user_review'),)

    user = db.relationship('User', back_populates='review_likes')
    review = db.relationship('Review', back_populates='likes')

    serialize_rules = ('-user.review_likes', '-review.likes')

    def __repr__(self):
        return f'<ReviewLike user_id={self.user_id} review_id={self.review_id}>'
