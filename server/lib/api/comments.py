from flask import request, session
from flask_restful import Resource
from sqlalchemy.orm import joinedload
from lib.config import db, api
from lib.models import Review, ReviewComment


class ReviewComments(Resource):
    """GET comments for a review (paginated by top-level). POST a new comment (requires session)."""

    def get(self, review_id):
        review = Review.query.get(review_id)
        if not review:
            return {"error": "Review not found"}, 404
        limit = min(int(request.args.get("limit", 5)), 50)
        offset = max(int(request.args.get("offset", 0)), 0)
        # Total = count of top-level comments only
        total = ReviewComment.query.filter_by(
            review_id=review_id, parent_comment_id=None
        ).count()
        # Page of top-level comments (newest first)
        top_level = (
            ReviewComment.query.filter_by(
                review_id=review_id, parent_comment_id=None
            )
            .order_by(ReviewComment.created_at.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )
        top_level_ids = [c.id for c in top_level]
        if not top_level_ids:
            return {"comments": [], "total": total}, 200
        # All comments in this page: top-level + their replies
        comments = (
            ReviewComment.query.filter(
                ReviewComment.review_id == review_id,
                (
                    (ReviewComment.id.in_(top_level_ids))
                    | (ReviewComment.parent_comment_id.in_(top_level_ids))
                ),
            )
            .options(joinedload(ReviewComment.user))
            .order_by(ReviewComment.created_at)
            .all()
        )
        return {
            "comments": [c.to_dict() for c in comments],
            "total": total,
        }, 200

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
