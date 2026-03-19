#!/usr/bin/env python3

import secrets
from datetime import datetime, timedelta

# from flask_migrate import Migrate
from flask import Response, request, session
from flask_restful import Resource

from movie_reviews.config import app, db
from movie_reviews.models import Movie, PasswordResetToken, Review, User


@app.route("/robots.txt")
def robots_txt():
    """Serve robots.txt for SEO"""
    robots_content = """User-agent: *
Allow: /

# Sitemap location
Sitemap: {}/sitemap.xml

# Disallow admin and private areas
Disallow: /admin
Disallow: /login
Disallow: /articles/new

# Allow all movie and article pages
Allow: /movies/
Allow: /articles/
Allow: /search_movies""".format(
        request.url_root.rstrip("/")
    )

    return Response(robots_content, mimetype="text/plain")


# @app.before_request
# def check_if_logged_in():
#     app.logger.debug(f"Request endpoint: {request.endpoint}")
#     if not session.get('user_id') \
#     and request.endpoint in ['spongebob']:
#     # and request.endpoint in ['hives', 'inspections', 'queens']:
#         return {'error': 'Unauthorized'}, 401


class ClearSession(Resource):

    def delete(self):

        session["user_id"] = None

        return {}, 204


class AccountSignup(Resource):
    def post(self):
        # DEBUG: If you never see this in the terminal, the request isn't reaching this route (wrong URL, method, or CORS).
        print("[Sign up] POST /api/account_signup received", flush=True)
        app.logger.info("Sign up POST received")
        try:
            json = request.get_json() or {}
            username = json.get("username", "")

            # Check if the username already exists in the database
            existing_user = User.query.filter_by(username=json["username"]).first()

            # Check if the email already exists in the database
            existing_email = User.query.filter_by(email=json["email"]).first()

            error_dict = {}

            if existing_user:
                error_dict["username"] = "Username already taken."

            if existing_email:
                error_dict["email"] = "Email already registered."

            if existing_user or existing_email:
                app.logger.warning(
                    "Sign up rejected: duplicate username or email",
                    extra={
                        "username": username,
                        "username_taken": bool(existing_user),
                        "email_taken": bool(existing_email),
                    },
                )
                return {"error": error_dict}, 400

            user = User(
                username=json["username"],
                first_name=json.get("first_name"),
                last_name=json.get("last_name"),
                phone_number=json.get("phone_number"),
                email=json["email"],
                zipcode=json.get("zipcode"),
            )

            user.password_hash = json["password"]
            db.session.add(user)
            db.session.commit()

            session["user_id"] = user.id

            app.logger.info(
                "Sign up success", extra={"user_id": user.id, "username": user.username}
            )
            return user.to_dict(), 201
        except Exception as e:
            db.session.rollback()
            app.logger.exception("Sign up failed: %s", str(e))
            return {"error": str(e)}, 500


class CheckSession(Resource):
    def get(self):

        user_id = session.get("user_id", 0)
        if user_id:
            user = User.query.filter(User.id == user_id).first()
            return user.to_dict(), 200

        return {}, 204


class Login(Resource):
    def post(self):
        try:
            json = request.get_json() or {}
            email = json.get("email")
            password = json.get("password")

            if not email:
                return {"error": "Email is required"}, 400
            if not password:
                return {"error": "Invalid email or password"}, 401

            user = User.query.filter_by(email=email).first()

            if not user:
                return {"error": "Invalid email or password"}, 401

            if user.authenticate(password):
                session["user_id"] = user.id
                return user.to_dict(), 200

            return {"error": "Invalid email or password"}, 401
        except Exception as e:
            return {"error": f"An error occurred: {str(e)}"}, 500


class Logout(Resource):
    def delete(self):
        session["user_id"] = None
        return {}, 204


class UserById(Resource):
    def get(self, user_id):
        user = User.query.get(user_id)
        if not user:
            return {"error": "User not found"}, 404
        return user.to_dict(), 200

    def patch(self, user_id):
        user = User.query.get(user_id)
        if not user:
            return {"error": "User not found"}, 404

        data = request.get_json()

        # Check if username or email have changed
        if "username" in data and data["username"] != user.username:
            user.username = data["username"]

        if "email" in data and data["email"] != user.email:
            # Check if the new email is already taken (excluding the current user)
            if (
                db.session.query(User)
                .filter(User.email == data["email"], User.id != user.id)
                .first()
            ):
                return {"error": "Email address is already in use."}, 400
            user.email = data["email"]

        # Update other fields
        for attr in data:
            if attr not in [
                "username",
                "email",
            ]:  # Skip updating username and email if not changed
                setattr(user, attr, data.get(attr))

        db.session.commit()
        return user.to_dict(), 200


class PasswordResetRequest(Resource):
    def post(self):
        data = request.get_json() or {}
        email = data.get("email")
        username = data.get("username")

        if not email and not username:
            return {"error": "Email or username is required."}, 400

        user = None
        if email:
            user = User.query.filter_by(email=email).first()
        elif username:
            user = User.query.filter_by(username=username).first()

        # Always return 200 to avoid leaking which accounts exist
        if not user:
            return {
                "message": "If an account exists for that information, you will receive reset instructions shortly."
            }, 200

        token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(hours=1)

        reset_token = PasswordResetToken(
            user_id=user.id,
            token=token,
            expires_at=expires_at,
            used=False,
        )
        db.session.add(reset_token)
        db.session.commit()

        reset_url = f"{request.url_root.rstrip('/')}/#/reset-password?token={token}"
        print(f"[PasswordReset] Generated reset link for user {user.id}: {reset_url}")

        # NOTE: In production, you would email this link to the user instead of returning the token.
        return {
            "message": "If an account exists for that information, you will receive reset instructions shortly.",
            "token": token,
        }, 200


class PasswordReset(Resource):
    def post(self):
        data = request.get_json() or {}
        token = data.get("token")
        new_password = data.get("password")

        if not token or not new_password:
            return {"error": "Token and new password are required."}, 400

        reset_token = PasswordResetToken.query.filter_by(token=token).first()
        if (
            not reset_token
            or reset_token.used
            or reset_token.expires_at < datetime.utcnow()
        ):
            return {"error": "Invalid or expired reset token."}, 400

        user = User.query.get(reset_token.user_id)
        if not user:
            return {"error": "User not found."}, 400

        try:
            user.password_hash = new_password
            reset_token.used = True
            db.session.commit()
            return {"message": "Password has been reset."}, 200
        except Exception:
            db.session.rollback()
            return {"error": "Failed to reset password."}, 500


class Sitemap(Resource):
    """Generate XML sitemap for SEO"""

    def get(self):
        try:
            import xml.etree.ElementTree as ET

            from flask import Response

            # Get all movies and articles
            movies = Movie.query.all()
            articles = Review.query.filter_by(movie_id=None).all()

            # Create XML structure
            root = ET.Element("urlset")
            root.set("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9")

            # Add home page
            home_url = ET.SubElement(root, "url")
            ET.SubElement(home_url, "loc").text = request.url_root.rstrip("/")
            ET.SubElement(home_url, "changefreq").text = "daily"
            ET.SubElement(home_url, "priority").text = "1.0"

            # Add search page
            search_url = ET.SubElement(root, "url")
            ET.SubElement(search_url, "loc").text = (
                f"{request.url_root.rstrip('/')}/#/search_movies"
            )
            ET.SubElement(search_url, "changefreq").text = "weekly"
            ET.SubElement(search_url, "priority").text = "0.8"

            # Add articles page
            articles_url = ET.SubElement(root, "url")
            ET.SubElement(articles_url, "loc").text = (
                f"{request.url_root.rstrip('/')}/#/articles"
            )
            ET.SubElement(articles_url, "changefreq").text = "weekly"
            ET.SubElement(articles_url, "priority").text = "0.8"

            # Add movie pages
            for movie in movies:
                movie_url = ET.SubElement(root, "url")
                ET.SubElement(movie_url, "loc").text = (
                    f"{request.url_root.rstrip('/')}/#/movies/{movie.id}"
                )
                ET.SubElement(movie_url, "lastmod").text = movie.release_date.strftime(
                    "%Y-%m-%d"
                )
                ET.SubElement(movie_url, "changefreq").text = "monthly"
                ET.SubElement(movie_url, "priority").text = "0.7"

            # Add article pages
            for article in articles:
                article_url = ET.SubElement(root, "url")
                ET.SubElement(article_url, "loc").text = (
                    f"{request.url_root.rstrip('/')}/#/articles/{article.id}"
                )
                ET.SubElement(article_url, "lastmod").text = (
                    article.date_added.strftime("%Y-%m-%d")
                )
                ET.SubElement(article_url, "changefreq").text = "monthly"
                ET.SubElement(article_url, "priority").text = "0.6"

            # Convert to string
            xml_str = ET.tostring(root, encoding="unicode")

            return Response(xml_str, mimetype="application/xml")

        except Exception as e:
            return {"error": f"Sitemap generation failed: {str(e)}"}, 500


def register_routes(api):
    api.add_resource(ClearSession, "/api/clear", endpoint="clear")
    api.add_resource(AccountSignup, "/api/account_signup", endpoint="account_signup")
    api.add_resource(CheckSession, "/api/check_session")
    api.add_resource(Login, "/api/login")
    api.add_resource(Logout, "/api/logout")
    api.add_resource(UserById, "/api/users/<int:user_id>")
    api.add_resource(PasswordResetRequest, "/api/password_reset_request")
    api.add_resource(PasswordReset, "/api/password_reset")
    api.add_resource(Sitemap, "/sitemap.xml")
