#!/usr/bin/env python3
"""
Delete movies and their dependent review data by movie IDs.

Usage:
    python src/movie_reviews/seeding/delete_movies.py 12 15 22 --dry-run
    python src/movie_reviews/seeding/delete_movies.py 12 15 22

What this removes for each movie:
- Movie row
- Reviews linked by movie_id
- Review comments, comment likes, and review likes (via ORM cascades)
- review_tags join rows (via relationship cleanup)
- Orphaned tags (tags no longer linked to any review)
"""

import argparse
import os
import sys
from dataclasses import dataclass
from typing import Iterable, List, Set

# Allow importing app.py when run directly from this file path.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", ".."))

from app import app

from movie_reviews.config import db
from movie_reviews.models import Movie, Review, Tag


@dataclass
class DeleteSummary:
    requested_movie_ids: List[int]
    found_movie_ids: List[int]
    missing_movie_ids: List[int]
    review_ids_to_delete: List[int]
    orphan_tag_ids_to_delete: List[int]


def _find_orphan_tag_ids(exclude_tag_ids: Set[int] = None) -> List[int]:
    exclude_tag_ids = exclude_tag_ids or set()
    orphan_ids: List[int] = []
    for tag in Tag.query.all():
        if tag.id in exclude_tag_ids:
            continue
        if len(tag.reviews) == 0:
            orphan_ids.append(tag.id)
    return orphan_ids


def _collect_summary(movie_ids: Iterable[int]) -> DeleteSummary:
    unique_ids = list(dict.fromkeys(int(mid) for mid in movie_ids))
    movies = Movie.query.filter(Movie.id.in_(unique_ids)).all() if unique_ids else []
    found_ids = [m.id for m in movies]
    missing_ids = [mid for mid in unique_ids if mid not in set(found_ids)]

    reviews = (
        Review.query.filter(Review.movie_id.in_(found_ids)).all() if found_ids else []
    )
    review_ids = [r.id for r in reviews]

    # Determine which tags might become orphaned after deleting these reviews.
    affected_tag_ids: Set[int] = set()
    for review in reviews:
        for tag in review.tags:
            affected_tag_ids.add(tag.id)

    orphan_after_delete: List[int] = []
    if affected_tag_ids:
        for tag_id in affected_tag_ids:
            tag = Tag.query.get(tag_id)
            if not tag:
                continue
            linked_review_ids = [r.id for r in tag.reviews]
            # If every linked review is in deletion set, tag becomes orphan.
            if linked_review_ids and all(
                rid in set(review_ids) for rid in linked_review_ids
            ):
                orphan_after_delete.append(tag_id)

    return DeleteSummary(
        requested_movie_ids=unique_ids,
        found_movie_ids=found_ids,
        missing_movie_ids=missing_ids,
        review_ids_to_delete=review_ids,
        orphan_tag_ids_to_delete=orphan_after_delete,
    )


def _print_summary(summary: DeleteSummary, dry_run: bool) -> None:
    mode = "DRY RUN" if dry_run else "DELETE"
    print(f"\n=== {mode} SUMMARY ===")
    print(f"Requested movie IDs: {summary.requested_movie_ids}")
    print(f"Found movie IDs:     {summary.found_movie_ids}")
    print(f"Missing movie IDs:   {summary.missing_movie_ids}")
    print(f"Reviews to delete:   {summary.review_ids_to_delete}")
    print(f"Orphan tags to trim: {summary.orphan_tag_ids_to_delete}")


def _delete_movies(summary: DeleteSummary) -> None:
    if not summary.found_movie_ids:
        print("No matching movies found. Nothing to delete.")
        return

    movies = Movie.query.filter(Movie.id.in_(summary.found_movie_ids)).all()
    for movie in movies:
        db.session.delete(movie)

    db.session.flush()

    # Safety sweep for orphan tags after movie/review deletions are staged.
    for tag_id in _find_orphan_tag_ids():
        tag = Tag.query.get(tag_id)
        if tag:
            db.session.delete(tag)

    db.session.commit()


def delete_movies_by_ids(movie_ids: Iterable[int], dry_run: bool = False) -> dict:
    """
    Programmatic entrypoint for notebooks/scripts.

    Args:
        movie_ids: Iterable of movie IDs to delete.
        dry_run: If True, only return summary without deleting.

    Returns:
        dict summary with requested/found/missing IDs and dependent records.
    """
    with app.app_context():
        summary = _collect_summary(movie_ids)

        result = {
            "requested_movie_ids": summary.requested_movie_ids,
            "found_movie_ids": summary.found_movie_ids,
            "missing_movie_ids": summary.missing_movie_ids,
            "review_ids_to_delete": summary.review_ids_to_delete,
            "orphan_tag_ids_to_delete": summary.orphan_tag_ids_to_delete,
            "dry_run": dry_run,
            "deleted": False,
        }

        _print_summary(summary, dry_run=dry_run)
        if dry_run:
            print("\nNo changes written.")
            return result

        try:
            _delete_movies(summary)
            print("\nDelete completed.")
            result["deleted"] = True
            return result
        except Exception:
            db.session.rollback()
            raise


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Delete movies and dependent review data by movie ID."
    )
    parser.add_argument(
        "movie_ids",
        nargs="+",
        type=int,
        help="Movie IDs to delete.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview what will be deleted without writing changes.",
    )
    args = parser.parse_args()

    with app.app_context():
        try:
            delete_movies_by_ids(args.movie_ids, dry_run=args.dry_run)
            return 0
        except Exception as exc:
            print(f"\nDelete failed: {exc}")
            return 1


if __name__ == "__main__":
    raise SystemExit(main())
