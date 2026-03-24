#!/usr/bin/env python3
"""
Backfill movie.release_date using TMDb earliest country release date.

Usage examples:
  # Dry-run (default): show what would change
  python -m movie_reviews.seeding.backfill_release_dates

  # Apply updates
  python -m movie_reviews.seeding.backfill_release_dates --apply

  # Limit scope for quick verification
  python -m movie_reviews.seeding.backfill_release_dates --limit 25
"""

import argparse
import os
from datetime import datetime

import requests

from movie_reviews.config import app, db
from movie_reviews.models import Movie


def extract_earliest_release_date(release_dates_payload):
    """Return earliest YYYY-MM-DD found in TMDb /release_dates response."""
    results = (release_dates_payload or {}).get("results", []) or []
    earliest = None

    for country_group in results:
        for release_info in country_group.get("release_dates") or []:
            release_dt = release_info.get("release_date")
            if not release_dt or not isinstance(release_dt, str):
                continue

            normalized = release_dt.replace("Z", "+00:00")
            try:
                parsed = datetime.fromisoformat(normalized)
            except ValueError:
                continue

            release_day = parsed.date().isoformat()
            if earliest is None or release_day < earliest:
                earliest = release_day

    return earliest


def fetch_earliest_release_date(external_movie_id, api_key, timeout=12):
    """Fetch earliest release date across countries for one TMDb movie id."""
    if not external_movie_id or not api_key:
        return None

    base_url = "https://api.themoviedb.org/3"
    url = f"{base_url}/movie/{external_movie_id}/release_dates?api_key={api_key}"

    try:
        response = requests.get(url, timeout=timeout)
    except Exception:
        return None

    if response.status_code != 200:
        return None

    return extract_earliest_release_date(response.json() or {})


def run_backfill(apply=False, limit=None):
    api_key = os.getenv("MOVIE_API_KEY")
    if not api_key:
        raise RuntimeError("MOVIE_API_KEY is required in environment.")

    with app.app_context():
        query = Movie.query.filter(Movie.external_id.isnot(None)).order_by(
            Movie.id.asc()
        )
        if limit:
            query = query.limit(limit)
        movies = query.all()

        checked = 0
        changed = 0
        unchanged = 0
        missing_tmdb = 0

        for movie in movies:
            checked += 1
            current = movie.release_date.isoformat() if movie.release_date else None
            earliest = fetch_earliest_release_date(movie.external_id, api_key)

            if not earliest:
                missing_tmdb += 1
                print(
                    f"[skip] movie_id={movie.id} external_id={movie.external_id} "
                    f"title={movie.title!r} reason=no_earliest_release_date"
                )
                continue

            if current == earliest:
                unchanged += 1
                continue

            changed += 1
            print(
                f"[update] movie_id={movie.id} external_id={movie.external_id} "
                f"title={movie.title!r} release_date {current} -> {earliest}"
            )
            if apply:
                movie.release_date = earliest

        if apply and changed > 0:
            db.session.commit()

        mode = "APPLY" if apply else "DRY-RUN"
        print(
            f"\n[{mode}] checked={checked} changed={changed} "
            f"unchanged={unchanged} missing_tmdb={missing_tmdb}"
        )


def main():
    parser = argparse.ArgumentParser(
        description="Backfill movies.release_date from TMDb earliest country release dates."
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Persist updates. Without this flag, runs as dry-run.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Optional limit for number of movies to process.",
    )
    args = parser.parse_args()

    run_backfill(apply=args.apply, limit=args.limit)


if __name__ == "__main__":
    main()
