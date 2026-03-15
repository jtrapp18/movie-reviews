from flask import request, session
from flask_restful import Resource
from sqlalchemy import func
from sqlalchemy.orm import joinedload
from movie_reviews.config import db, api
from movie_reviews.models import Review, ReviewComment, CommentLike


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
        current_user_id = session.get('user_id')
        comment_ids = [c.id for c in comments]
        counts = {}
        liked_comment_ids = set()
        if comment_ids:
            count_rows = (
                db.session.query(CommentLike.comment_id, func.count(CommentLike.id))
                .filter(CommentLike.comment_id.in_(comment_ids))
                .group_by(CommentLike.comment_id)
                .all()
            )
            counts = {row[0]: row[1] for row in count_rows}
            if current_user_id:
                liked_comment_ids = {
                    row[0]
                    for row in db.session.query(CommentLike.comment_id).filter(
                        CommentLike.comment_id.in_(comment_ids),
                        CommentLike.user_id == current_user_id,
                    ).all()
                }
        out = []
        for c in comments:
            d = c.to_dict()
            d['like_count'] = counts.get(c.id, 0)
            d['liked_by_me'] = c.id in liked_comment_ids
            out.append(d)
        return {
            "comments": out,
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
