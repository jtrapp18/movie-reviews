from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, UniqueConstraint
from sqlalchemy_serializer import SerializerMixin

from movie_reviews.config import db


class CommentLike(db.Model, SerializerMixin):
    __tablename__ = "comment_likes"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    comment_id = Column(Integer, ForeignKey("review_comments.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "comment_id", name="uq_comment_like_user_comment"),
        db.Index("ix_comment_likes_comment_id", "comment_id"),
        db.Index("ix_comment_likes_user_comment", "user_id", "comment_id"),
    )

    user = db.relationship("User", back_populates="comment_likes")
    comment = db.relationship("ReviewComment", back_populates="likes")

    serialize_rules = ("-user.comment_likes", "-comment.likes")

    def __repr__(self):
        return f"<CommentLike user_id={self.user_id} comment_id={self.comment_id}>"
