"""Public site activity: recent comments and review likes (global, not personalized)."""

from flask import request
from flask_restful import Resource
from sqlalchemy.orm import joinedload

from movie_reviews.models import Review, ReviewComment, ReviewLike


def _review_display_title(review):
    if review.title and str(review.title).strip():
        return str(review.title).strip()
    if review.movie_id and review.movie is not None:
        return getattr(review.movie, "title", None) or f"Review {review.id}"
    text = (review.review_text or "").strip()
    if text:
        return (text[:50] + "…") if len(text) > 50 else text
    return f"Review {review.id}"


def _review_target(review):
    mid = review.movie_id
    path = f"/movies/{mid}" if mid else f"/articles/{review.id}"
    return {
        "review_id": review.id,
        "title": _review_display_title(review),
        "movie_id": mid,
        "path": path,
    }


def _snippet(text, max_len=100):
    if not text:
        return ""
    t = " ".join(text.split())
    return (t[:max_len] + "…") if len(t) > max_len else t


class ActivityFeed(Resource):
    """GET /api/activity — latest mixed comments and review likes, newest first."""

    def get(self):
        limit_param = request.args.get("limit", 5)
        try:
            limit = int(limit_param)
        except (TypeError, ValueError):
            limit = 5
        limit = max(1, min(limit, 20))

        fetch_n = min(limit * 4, 40)

        comment_opts = (
            joinedload(ReviewComment.user),
            joinedload(ReviewComment.review).joinedload(Review.movie),
        )
        comments = (
            ReviewComment.query.options(*comment_opts)
            .order_by(ReviewComment.created_at.desc())
            .limit(fetch_n)
            .all()
        )

        like_opts = (
            joinedload(ReviewLike.user),
            joinedload(ReviewLike.review).joinedload(Review.movie),
        )
        likes = (
            ReviewLike.query.options(*like_opts)
            .order_by(ReviewLike.created_at.desc())
            .limit(fetch_n)
            .all()
        )

        events = []

        for c in comments:
            if not c.user or not c.review:
                continue
            events.append(
                {
                    "type": "comment",
                    "id": c.id,
                    "occurred_at": c.created_at,
                    "actor": {
                        "id": c.user.id,
                        "username": c.user.username or "Someone",
                    },
                    "review": _review_target(c.review),
                    "snippet": _snippet(c.body),
                }
            )

        for lk in likes:
            if not lk.user or not lk.review:
                continue
            events.append(
                {
                    "type": "like",
                    "id": lk.id,
                    "occurred_at": lk.created_at,
                    "actor": {
                        "id": lk.user.id,
                        "username": lk.user.username or "Someone",
                    },
                    "review": _review_target(lk.review),
                }
            )

        events.sort(key=lambda x: x["occurred_at"], reverse=True)
        out = events[:limit]

        for e in out:
            if e["occurred_at"] is not None:
                e["occurred_at"] = e["occurred_at"].isoformat()

        return {"items": out}, 200


def register_routes(api_instance):
    api_instance.add_resource(ActivityFeed, "/api/activity")
