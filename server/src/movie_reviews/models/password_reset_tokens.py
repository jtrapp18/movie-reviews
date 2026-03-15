from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy_serializer import SerializerMixin

from movie_reviews.config import db


class PasswordResetToken(db.Model, SerializerMixin):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String(255), nullable=False, unique=True)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False, nullable=False)

    user = db.relationship("User", backref="password_reset_tokens")

    def is_valid(self) -> bool:
        return not self.used and self.expires_at >= datetime.utcnow()
