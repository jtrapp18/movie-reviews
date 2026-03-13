from flask import request, session
from flask_restful import Resource
from sqlalchemy.orm import joinedload
from lib.config import db, api
from lib.models import Review, ReviewComment


class ReviewComments(Resource):
    """GET all comments for a review; POST a new comment (requires session)."""

    def get(self, review_id):
        review = Review.query.get(review_id)
        if not review:
            return {"error": "Review not found"}, 404
        comments = (
            ReviewComment.query.filter_by(review_id=review_id)
            .options(joinedload(ReviewComment.user))
            .order_by(ReviewComment.created_at)
            .all()
        )
        return [c.to_dict() for c in comments], 200

    def post(self, review_id):
        user_id = session.get("user_id")
        if not user_id:
            return {"error": "You must be logged in to comment"}, 401
        review = Review.query.get(review_id)
        if not review:
            return {"error": "Review not found"}, 404
        data = request.get_json() or {}
        body = (data.get("body") or "").strip()
        if not body:
            return {"error": "Comment body is required"}, 400
        parent_comment_id = data.get("parent_comment_id")
        if parent_comment_id is not None:
            parent = ReviewComment.query.get(parent_comment_id)
            if not parent or parent.review_id != review_id:
                return {"error": "Invalid parent comment"}, 400
        comment = ReviewComment(
            review_id=review_id,
            user_id=user_id,
            body=body,
            parent_comment_id=parent_comment_id,
        )
        db.session.add(comment)
        db.session.commit()
        return comment.to_dict(), 201


def register_routes(api_instance):
    api_instance.add_resource(
        ReviewComments,
        "/api/reviews/<int:review_id>/comments",
    )
