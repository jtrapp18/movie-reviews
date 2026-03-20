import argparse
import json
from pathlib import Path

from movie_reviews.seeding.batch_import import (
    DEFAULT_BASE_URL,
    DEFAULT_TIMEOUT,
    load_config,
    resolve_config_path,
    run_batch_import,
)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Batch import reviews/articles from JSON config."
    )
    parser.add_argument(
        "--config",
        type=Path,
        default=None,
        help="Path to batch import JSON config. If omitted, default candidates are used.",
    )
    parser.add_argument(
        "--base-url",
        default=DEFAULT_BASE_URL,
        help=f"API base URL (default: {DEFAULT_BASE_URL})",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=DEFAULT_TIMEOUT,
        help=f"Request timeout in seconds (default: {DEFAULT_TIMEOUT})",
    )
    args = parser.parse_args()

    config_path = args.config if args.config else resolve_config_path()
    config = load_config(config_path)
    print(f"Loaded config from {config_path}")
    print(f"Entries: {len(config.get('entries', []))}")

    results = run_batch_import(config, base_url=args.base_url, timeout=args.timeout)
    successes = [r for r in results if r.get("ok")]
    failures = [r for r in results if not r.get("ok")]

    print("\n--- Batch import summary ---")
    print(f"Succeeded: {len(successes)}")
    print(f"Failed:    {len(failures)}")

    if failures:
        print("\nFailures:")
        for failure in failures:
            print(json.dumps(failure, indent=2, default=str))
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
