import re

from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from sqlalchemy_serializer import SerializerMixin

from movie_reviews.config import bcrypt, db
from movie_reviews.utils import (
    validate_optional_email,
    validate_optional_phone,
    validate_optional_string,
    validate_required_string,
    validate_zipcode,
)


class User(db.Model, SerializerMixin):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, nullable=False, unique=True)
    _password_hash = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False, unique=True)
    first_name = db.Column(db.String, nullable=True)
    last_name = db.Column(db.String, nullable=True)
    phone_number = db.Column(db.String, nullable=True)
    zipcode = db.Column(db.String, nullable=True)
    is_admin = db.Column(db.Boolean, default=False)
    dark_mode = db.Column(db.Boolean, default=False)
    icon_color = db.Column(db.String, default="blue")

    review_comments = db.relationship(
        "ReviewComment",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="select",
    )
    comment_likes = db.relationship(
        "CommentLike",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="select",
    )
    review_likes = db.relationship(
        "ReviewLike",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="select",
    )
    notification_reads = db.relationship(
        "NotificationRead",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="select",
    )

    serialize_rules = (
        "-_password_hash",
        "-review_comments.user",
        "-comment_likes",
        "-review_likes",
        "-notification_reads",
    )

    @hybrid_property
    def password_hash(self):
        raise Exception("Password hashes may not be viewed.")

    @password_hash.setter
    def password_hash(self, password):
        self.validate_password(password)
        password_hash = bcrypt.generate_password_hash(password.encode("utf-8"))
        self._password_hash = password_hash.decode("utf-8")

    def authenticate(self, password):
        return bcrypt.check_password_hash(self._password_hash, password.encode("utf-8"))

    def validate_password(self, password):
        """Validates password complexity."""
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if not re.search(r"[A-Z]", password):
            raise ValueError("Password must include at least one uppercase letter.")
        if not re.search(r"[a-z]", password):
            raise ValueError("Password must include at least one lowercase letter.")
        if not re.search(r"\d", password):
            raise ValueError("Password must include at least one number.")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>+]', password):
            raise ValueError("Password must include at least one special character.")
        return True

    def __repr__(self):
        return f"<User {self.username}, ID: {self.id}>"

    @validates("username")
    def validate_username(self, key, value):
        value = validate_required_string(value, "Username", min_length=3)
        if db.session.query(User).filter(User.username == value).first():
            raise ValueError("Username is already taken.")
        return value

    @validates("email")
    def validate_email(self, key, value):
        value = validate_optional_email(value)
        if value and db.session.query(User).filter(User.email == value).first():
            raise ValueError("Email address is already in use.")
        return value

    @validates("first_name")
    def validate_first_name(self, key, value):
        return validate_optional_string(value, "First name")

    @validates("last_name")
    def validate_last_name(self, key, value):
        return validate_optional_string(value, "Last name")

    @validates("phone_number")
    def validate_phone_number(self, key, value):
        return validate_optional_phone(value)

    @validates("zipcode")
    def validate_zipcode(self, key, value):
        return validate_zipcode(value)
