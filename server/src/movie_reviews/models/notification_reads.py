"""
Tracks which notification events a user has read. Events are derived from
existing data (replies to my comments, likes on my comments/reviews); this
table stores only read state. event_type is one of 'reply', 'comment_like',
'review_like'. event_id is the primary key of the source row (review_comments.id,
comment_likes.id, or review_likes.id respectively).
"""

from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy_serializer import SerializerMixin

from movie_reviews.config import db


class NotificationRead(db.Model, SerializerMixin):
    __tablename__ = "notification_reads"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_type = Column(
        String(20), nullable=False
    )  # 'reply' | 'comment_like' | 'review_like'
    event_id = Column(Integer, nullable=False)
    read_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint(
            "user_id", "event_type", "event_id", name="uq_notification_read_user_event"
        ),
    )

    user = db.relationship("User", back_populates="notification_reads")

    serialize_rules = ("-user.notification_reads",)

    def __repr__(self):
        return f"<NotificationRead user_id={self.user_id} {self.event_type}={self.event_id}>"
