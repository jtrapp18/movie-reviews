"""Like toggle endpoints for comments and reviews."""

from flask import session
from flask_restful import Resource

from movie_reviews.config import db
from movie_reviews.models import CommentLike, Review, ReviewComment, ReviewLike


class CommentLikeToggle(Resource):
    """POST to toggle like on a comment. Requires session. Returns { liked, like_count }."""

    def post(self, comment_id):
        user_id = session.get("user_id")
        if not user_id:
            return {"error": "You must be logged in to like"}, 401
        comment = ReviewComment.query.get(comment_id)
        if not comment:
            return {"error": "Comment not found"}, 404
        existing = CommentLike.query.filter_by(
            user_id=user_id, comment_id=comment_id
        ).first()
        if existing:
            db.session.delete(existing)
            db.session.commit()
            count = CommentLike.query.filter_by(comment_id=comment_id).count()
            return {"liked": False, "like_count": count}, 200
        like = CommentLike(user_id=user_id, comment_id=comment_id)
        db.session.add(like)
        db.session.commit()
        count = CommentLike.query.filter_by(comment_id=comment_id).count()
        return {"liked": True, "like_count": count}, 200


class ReviewLikeToggle(Resource):
    """POST to toggle like on a review/post. Requires session. Returns { liked, like_count }."""

    def post(self, review_id):
        user_id = session.get("user_id")
        if not user_id:
            return {"error": "You must be logged in to like"}, 401
        review = Review.query.get(review_id)
        if not review:
            return {"error": "Review not found"}, 404
        existing = ReviewLike.query.filter_by(
            user_id=user_id, review_id=review_id
        ).first()
        if existing:
            db.session.delete(existing)
            db.session.commit()
            count = ReviewLike.query.filter_by(review_id=review_id).count()
            return {"liked": False, "like_count": count}, 200
        like = ReviewLike(user_id=user_id, review_id=review_id)
        db.session.add(like)
        db.session.commit()
        count = ReviewLike.query.filter_by(review_id=review_id).count()
        return {"liked": True, "like_count": count}, 200


def register_routes(api_instance):
    api_instance.add_resource(CommentLikeToggle, "/api/comments/<int:comment_id>/like")
    api_instance.add_resource(ReviewLikeToggle, "/api/reviews/<int:review_id>/like")
