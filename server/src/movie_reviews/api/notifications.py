"""Notifications: derived from replies and likes; read state in NotificationRead."""

from flask import request, session
from flask_restful import Resource
from sqlalchemy import and_, or_
from sqlalchemy.orm import aliased

from movie_reviews.config import db
from movie_reviews.models import (
    CommentLike,
    NotificationRead,
    Review,
    ReviewComment,
    User,
)


def _replies_to_me(user_id):
    """Replies where I am the parent comment author. Returns list of (event_id, event_at, actor_id, review_id)."""
    parent = aliased(ReviewComment)
    rows = (
        db.session.query(
            ReviewComment.id,
            ReviewComment.created_at,
            ReviewComment.user_id,
            ReviewComment.review_id,
        )
        .join(parent, ReviewComment.parent_comment_id == parent.id)
        .filter(parent.user_id == user_id)
        .filter(ReviewComment.user_id != user_id)
        .all()
    )
    return [
        {
            "event_id": r[0],
            "event_at": r[1],
            "actor_id": r[2],
            "review_id": r[3],
            "event_type": "reply",
        }
        for r in rows
    ]


def _likes_on_my_comments(user_id):
    """Likes on comments I wrote. Returns list of (event_id, event_at, actor_id, review_id)."""
    rows = (
        db.session.query(
            CommentLike.id,
            CommentLike.created_at,
            CommentLike.user_id,
            ReviewComment.review_id,
        )
        .join(ReviewComment, CommentLike.comment_id == ReviewComment.id)
        .filter(ReviewComment.user_id == user_id)
        .filter(CommentLike.user_id != user_id)
        .all()
    )
    return [
        {
            "event_id": r[0],
            "event_at": r[1],
            "actor_id": r[2],
            "review_id": r[3],
            "event_type": "comment_like",
        }
        for r in rows
    ]


class NotificationsList(Resource):
    """GET /api/notifications - paginated list for current user. Newest first."""

    def get(self):
        user_id = session.get("user_id")
        if not user_id:
            return {"error": "You must be logged in to view notifications"}, 401

        limit_param = request.args.get("limit", 20)
        limit = min(int(limit_param), 50)
        offset_param = request.args.get("offset", 0)
        offset = max(int(offset_param), 0)

        replies = _replies_to_me(user_id)
        likes = _likes_on_my_comments(user_id)
        merged = replies + likes
        merged.sort(key=lambda x: x["event_at"], reverse=True)

        total = len(merged)
        page = merged[offset : offset + limit + 1]
        has_more = len(page) > limit
        if has_more:
            page = page[:limit]

        if not page:
            return {
                "items": [],
                "total": total,
                "unread_count": 0,
                "has_more": False,
            }, 200

        read_pairs = [(p["event_type"], p["event_id"]) for p in page]
        read_set = set()
        if read_pairs:
            conditions = [
                and_(
                    NotificationRead.event_type == et,
                    NotificationRead.event_id == eid,
                )
                for et, eid in read_pairs
            ]
            q = NotificationRead.query.filter_by(user_id=user_id)
            q = q.filter(or_(*conditions))
            read_records = q.all()
            read_set = {(r.event_type, r.event_id) for r in read_records}

        actor_ids = {p["actor_id"] for p in page}
        actors = {
            u.id: u.username for u in User.query.filter(User.id.in_(actor_ids)).all()
        }

        review_ids = {p["review_id"] for p in page}
        review_objs = Review.query.filter(Review.id.in_(review_ids)).all()
        review_titles = {}
        for r in review_objs:
            title = getattr(r, "title", None) or (
                r.review_text[:50] + "..." if r.review_text else f"Review {r.id}"
            )
            review_titles[r.id] = title

        items = []
        for p in page:
            items.append(
                {
                    "event_type": p["event_type"],
                    "event_id": p["event_id"],
                    "event_at": p["event_at"].isoformat() if p["event_at"] else None,
                    "review_id": p["review_id"],
                    "review_title": review_titles.get(p["review_id"], ""),
                    "actor_id": p["actor_id"],
                    "actor_username": actors.get(p["actor_id"], ""),
                    "read": (p["event_type"], p["event_id"]) in read_set,
                }
            )

        event_types = ["reply", "comment_like"]
        read_count = (
            NotificationRead.query.filter_by(user_id=user_id)
            .filter(NotificationRead.event_type.in_(event_types))
            .count()
        )
        unread_count = max(0, total - read_count)

        return {
            "items": items,
            "total": total,
            "unread_count": unread_count,
            "has_more": has_more,
        }, 200


class NotificationsMarkRead(Resource):
    """POST /api/notifications/mark_read - mark one or more events as read."""

    def post(self):
        user_id = session.get("user_id")
        if not user_id:
            return {"error": "You must be logged in to mark notifications read"}, 401

        data = request.get_json() or {}
        events = data.get("events")
        if not events:
            return {"error": "events array required"}, 400

        created = 0
        for ev in events:
            event_type = ev.get("event_type")
            event_id = ev.get("event_id")
            if event_type not in ("reply", "comment_like") or event_id is None:
                continue
            existing = NotificationRead.query.filter_by(
                user_id=user_id,
                event_type=event_type,
                event_id=event_id,
            ).first()
            if not existing:
                nr = NotificationRead(
                    user_id=user_id,
                    event_type=event_type,
                    event_id=event_id,
                )
                db.session.add(nr)
                created += 1

        db.session.commit()
        return {"marked": created}, 200


def register_routes(api_instance):
    api_instance.add_resource(NotificationsList, "/api/notifications")
    api_instance.add_resource(
        NotificationsMarkRead,
        "/api/notifications/mark_read",
    )
