import json
import mimetypes
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence, Tuple

import PyPDF2
import requests
from docx import Document

DEFAULT_BASE_URL = "http://localhost:5555"
DEFAULT_TIMEOUT = 60
DEFAULT_CONFIG_CANDIDATES = (
    Path("server/tmp/batch_import.json"),
    Path("./tmp/batch_import.json"),
)

VERDICT_TO_RATING = {
    "magnum opus": 7,
    "masterpiece": 6,
    "must see": 5,
    "highly recommended": 4,
    "recommended": 3,
    "passable": 2,
    "unredeemable": 1,
}


def _tags_payload(tags: Any) -> List[Dict[str, str]]:
    if not tags:
        return []

    normalized = []
    for tag in tags:
        if isinstance(tag, str):
            cleaned = tag.strip().lower()
            if cleaned:
                normalized.append({"name": cleaned})
        elif isinstance(tag, dict) and tag.get("name"):
            cleaned = str(tag["name"]).strip().lower()
            if cleaned:
                normalized.append({"name": cleaned})

    return normalized


def _extract_text_from_source(document_path: Path) -> str:
    suffix = document_path.suffix.lower()
    if suffix == ".docx":
        doc = Document(str(document_path))
        return "\n".join(p.text for p in doc.paragraphs)

    if suffix == ".pdf":
        chunks = []
        with document_path.open("rb") as fp:
            reader = PyPDF2.PdfReader(fp)
            for page in reader.pages:
                chunks.append(page.extract_text() or "")
        return "\n".join(chunks)

    return ""


def _infer_rating_from_text(text: str) -> Optional[int]:
    if not text:
        return None

    lower = text.lower()

    verdict_match = re.search(r"verdict\s*[:\-]\s*([a-z\s]+)", lower)
    if verdict_match:
        verdict = re.sub(r"\s+", " ", verdict_match.group(1)).strip()
        for label, score in VERDICT_TO_RATING.items():
            if verdict.startswith(label):
                return score

    for label, score in VERDICT_TO_RATING.items():
        if re.search(rf"\b{re.escape(label)}\b", lower):
            return score

    numeric_match = re.search(r"\b([1-9]|10)\s*/\s*10\b", lower)
    if numeric_match:
        return int(numeric_match.group(1))

    return None


class BatchImportClient:
    def __init__(
        self, base_url: str = DEFAULT_BASE_URL, timeout: int = DEFAULT_TIMEOUT
    ):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    def _request_json(self, method: str, path: str, **kwargs) -> Tuple[int, Any]:
        resp = requests.request(
            method, f"{self.base_url}{path}", timeout=self.timeout, **kwargs
        )
        try:
            body = resp.json()
        except Exception:
            body = {"raw": resp.text}
        return resp.status_code, body

    def _resolve_rating(
        self, entry: Dict[str, Any], document_path: Optional[Path]
    ) -> int:
        explicit = entry.get("rating")
        if explicit is not None and str(explicit).strip() != "":
            resolved = int(explicit)
            print(f"   -> Using explicit rating={resolved}")
            return resolved

        print("   -> No explicit rating found; trying review_text verdict inference")
        inferred = _infer_rating_from_text(str(entry.get("review_text") or ""))
        if inferred is not None:
            print(f"   -> Inferred rating={inferred} from review text")
            return inferred

        if document_path:
            print(f"   -> Trying document-based rating inference from: {document_path}")
        if document_path and document_path.exists():
            inferred = _infer_rating_from_text(_extract_text_from_source(document_path))
            if inferred is not None:
                print(f"   -> Inferred rating={inferred} from document verdict")
                return inferred
            print(
                "   -> Document text read, but no recognized verdict/rating pattern found"
            )

        raise ValueError(
            "Rating missing and could not infer from review text/document. "
            "Include `rating` or add a detectable `Verdict:` label."
        )

    def _upload_document_via_patch(
        self, review_id: int, document_path: Path, replace_text: bool = True
    ) -> Tuple[int, Any]:
        if not document_path.exists():
            raise FileNotFoundError(f"Document does not exist: {document_path}")

        mime_type, _ = mimetypes.guess_type(str(document_path))
        mime_type = mime_type or "application/octet-stream"
        data = {"replace_text": str(replace_text).lower()}

        with document_path.open("rb") as fp:
            files = {"document": (document_path.name, fp, mime_type)}
            status, body = self._request_json(
                "PATCH",
                f"/api/reviews_with_document/{review_id}",
                data=data,
                files=files,
            )

        return status, body

    def _find_movie_by_external_id(self, external_id: int) -> Optional[Dict[str, Any]]:
        status, movies = self._request_json("GET", "/api/movies")
        if status != 200 or not isinstance(movies, list):
            return None

        for movie in movies:
            if movie.get("external_id") == external_id:
                return movie

        return None

    @staticmethod
    def _normalize_title(value: Any) -> str:
        return str(value or "").strip().casefold()

    def _find_existing_review_id(self, movie_id: int) -> Optional[int]:
        status, reviews = self._request_json("GET", "/api/reviews")
        if status != 200 or not isinstance(reviews, list):
            return None

        for review in reviews:
            if review.get("movie_id") == movie_id:
                return int(review["id"])
        return None

    def _find_existing_article_id(self, title: str) -> Optional[int]:
        status, articles = self._request_json("GET", "/api/articles")
        if status != 200 or not isinstance(articles, list):
            return None

        normalized_title = self._normalize_title(title)
        for article in articles:
            if self._normalize_title(article.get("title")) == normalized_title:
                return int(article["id"])
        return None

    def _search_tmdb_movie_by_title(self, movie_title: str) -> Optional[Dict[str, Any]]:
        status, payload = self._request_json(
            "GET", f"/api/pull_movie_info?search={movie_title}"
        )
        if status != 200:
            return None

        candidates = payload.get("results", []) if isinstance(payload, dict) else []
        if not candidates:
            return None

        target = movie_title.strip().lower()
        for candidate in candidates:
            c_title = str(candidate.get("title") or "").strip().lower()
            c_original_title = (
                str(candidate.get("original_title") or "").strip().lower()
            )
            if c_title == target or c_original_title == target:
                return candidate

        return candidates[0]

    def _build_movie_payload(
        self,
        external_id: int,
        tmdb_movie: Optional[Dict[str, Any]],
        entry: Dict[str, Any],
    ) -> Dict[str, Any]:
        tmdb_movie = tmdb_movie or {}

        poster_path = tmdb_movie.get("poster_path")
        backdrop_path = tmdb_movie.get("backdrop_path")

        cover_photo = (
            f"https://image.tmdb.org/t/p/w500{poster_path}"
            if poster_path
            else entry.get("cover_photo")
            or "https://example.com/placeholder-poster.jpg"
        )
        backdrop = (
            f"https://image.tmdb.org/t/p/original{backdrop_path}"
            if backdrop_path
            else entry.get("backdrop")
        )

        return {
            "external_id": external_id,
            "original_language": tmdb_movie.get("original_language")
            or entry.get("original_language")
            or "en",
            "original_title": tmdb_movie.get("original_title")
            or entry.get("original_title")
            or entry.get("movie_title")
            or entry.get("title"),
            "overview": tmdb_movie.get("overview")
            or entry.get("movie_overview")
            or "No overview available.",
            "title": tmdb_movie.get("title")
            or entry.get("movie_title")
            or entry.get("title"),
            "release_date": tmdb_movie.get("release_date")
            or entry.get("movie_release_date")
            or "1900-01-01",
            "cover_photo": cover_photo,
            "backdrop": backdrop,
        }

    def _require_movie_director(
        self, movie_obj: Dict[str, Any], external_id: int, entry: Dict[str, Any]
    ) -> None:
        director_id = movie_obj.get("director_id") or movie_obj.get("directorId")
        if director_id:
            title = (
                movie_obj.get("title") or entry.get("movie_title") or entry.get("title")
            )
            print(
                f"   -> Movie director linked (movie_id={movie_obj.get('id')}, "
                f"director_id={director_id}, title={title})"
            )
            return

        title = movie_obj.get("title") or entry.get("movie_title") or entry.get("title")
        raise ValueError(
            "Movie was created/found without director linkage. "
            f"external_id={external_id}, title={title}. "
            "Aborting before review/document import."
        )

    def _ensure_movie_id(self, entry: Dict[str, Any]) -> int:
        if entry.get("movie_id"):
            print(f"   -> Using provided movie_id={entry['movie_id']}")
            return int(entry["movie_id"])

        tmdb_movie = None
        external_id = entry.get("movie_external_id")

        if external_id is None:
            movie_title = entry.get("movie_title")
            if not movie_title:
                raise ValueError(
                    "Review entry needs one of: movie_id, movie_external_id, or movie_title"
                )

            tmdb_movie = self._search_tmdb_movie_by_title(str(movie_title))
            if not tmdb_movie:
                raise ValueError(f"No TMDb movie found for title: {movie_title}")

            external_id = tmdb_movie.get("id")
            if not external_id:
                raise ValueError(
                    "TMDb search result did not include an external movie id"
                )

        external_id = int(external_id)
        print(f"   -> Resolved movie external_id={external_id}")

        existing = self._find_movie_by_external_id(external_id)
        if existing:
            print(f"   -> Reusing existing movie_id={existing.get('id')}")
            self._require_movie_director(existing, external_id, entry)
            return int(existing["id"])

        if tmdb_movie is None and entry.get("movie_title"):
            tmdb_movie = self._search_tmdb_movie_by_title(str(entry.get("movie_title")))
            if tmdb_movie and int(tmdb_movie.get("id") or 0) != external_id:
                tmdb_movie = None

        payload = self._build_movie_payload(external_id, tmdb_movie, entry)

        print("   -> Creating movie in backend")
        status, created = self._request_json("POST", "/api/movies", json=payload)
        if status not in (200, 201):
            raise ValueError(
                f"Failed creating movie for external_id={external_id} "
                f"with payload={payload}: {created}"
            )

        movie_id = created.get("id")
        print(f"   -> Created movie_id={movie_id}")
        if not movie_id:
            raise ValueError(f"Movie create response missing id: {created}")

        self._require_movie_director(created, external_id, entry)
        return int(movie_id)

    def create_review(
        self, entry: Dict[str, Any], upsert: bool = True
    ) -> Dict[str, Any]:
        document_path = (
            Path(entry["document_path"]).expanduser()
            if entry.get("document_path")
            else None
        )
        movie_id = self._ensure_movie_id(entry)
        if entry.get("director_id") is not None:
            print(
                "   -> Ignoring director_id on review import; "
                "director is derived from movie linkage"
            )
        rating_value = self._resolve_rating(entry, document_path)

        payload = {
            "title": entry["title"],
            "rating": rating_value,
            "movie_id": movie_id,
            "review_text": entry.get("review_text") or "",
            "tags": _tags_payload(entry.get("tags")),
        }

        review_id = None
        body: Dict[str, Any] = {}
        if upsert:
            review_id = self._find_existing_review_id(movie_id=movie_id)
            if review_id:
                print(
                    f"   -> Found existing review_id={review_id}; updating instead of creating"
                )
                p_status, p_body = self._request_json(
                    "PATCH", f"/api/reviews/{review_id}", json=payload
                )
                if p_status not in (200,):
                    return {
                        "ok": False,
                        "stage": "update_review",
                        "status": p_status,
                        "body": p_body,
                        "review_id": review_id,
                    }
                body = p_body

        if not review_id:
            print(f"   -> Creating review with rating={rating_value}")
            status, body = self._request_json("POST", "/api/reviews", json=payload)
            if status not in (200, 201):
                return {
                    "ok": False,
                    "stage": "create_review",
                    "status": status,
                    "body": body,
                }

            review_id = body.get("id")
            if not review_id:
                return {
                    "ok": False,
                    "stage": "create_review",
                    "status": status,
                    "body": body,
                    "error": "Missing review id in response",
                }

        if document_path:
            print(f"   -> Uploading document for review_id={review_id}")
            doc_status, doc_body = self._upload_document_via_patch(
                review_id, document_path, bool(entry.get("replace_text", True))
            )
            if doc_status not in (200,):
                return {
                    "ok": False,
                    "stage": "upload_review_document",
                    "status": doc_status,
                    "body": doc_body,
                    "review_id": review_id,
                }

        patch_payload = {}
        for key in ["description", "date_added", "backdrop"]:
            if key not in entry or entry[key] is None:
                continue
            # Do not clear backdrop with "" — document upload may have set it from the .docx
            if key == "backdrop" and str(entry[key]).strip() == "":
                continue
            patch_payload[key] = entry[key]

        if patch_payload:
            p_status, p_body = self._request_json(
                "PATCH", f"/api/reviews/{review_id}", json=patch_payload
            )
            if p_status not in (200,):
                return {
                    "ok": False,
                    "stage": "patch_review",
                    "status": p_status,
                    "body": p_body,
                    "review_id": review_id,
                }
            body = p_body

        return {
            "ok": True,
            "kind": "review",
            "id": review_id,
            "movie_id": movie_id,
            "body": body,
        }

    def create_article(
        self, entry: Dict[str, Any], upsert: bool = True
    ) -> Dict[str, Any]:
        initial_text = entry.get("review_text") or "Document-backed article placeholder"
        payload = {
            "title": entry["title"],
            "review_text": initial_text,
            "tags": _tags_payload(entry.get("tags")),
        }

        article_id = None
        body: Dict[str, Any] = {}
        if upsert:
            article_id = self._find_existing_article_id(title=entry["title"])
            if article_id:
                print(
                    f"   -> Found existing article_id={article_id}; updating instead of creating"
                )
                p_status, p_body = self._request_json(
                    "PATCH", f"/api/articles/{article_id}", json=payload
                )
                if p_status not in (200,):
                    return {
                        "ok": False,
                        "stage": "update_article",
                        "status": p_status,
                        "body": p_body,
                        "article_id": article_id,
                    }
                body = p_body

        if not article_id:
            status, body = self._request_json("POST", "/api/articles", json=payload)
            if status not in (200, 201):
                return {
                    "ok": False,
                    "stage": "create_article",
                    "status": status,
                    "body": body,
                }

            article_id = body.get("id")
            if not article_id:
                return {
                    "ok": False,
                    "stage": "create_article",
                    "status": status,
                    "body": body,
                    "error": "Missing article id in response",
                }

        if entry.get("document_path"):
            doc_status, doc_body = self._upload_document_via_patch(
                article_id,
                Path(entry["document_path"]).expanduser(),
                bool(entry.get("replace_text", True)),
            )
            if doc_status not in (200,):
                return {
                    "ok": False,
                    "stage": "upload_article_document",
                    "status": doc_status,
                    "body": doc_body,
                    "article_id": article_id,
                }

        patch_payload = {}
        for key in [
            "director_id",
            "description",
            "date_added",
            "backdrop",
            "title",
            "review_text",
        ]:
            if key not in entry or entry[key] is None:
                continue
            if key == "backdrop" and str(entry[key]).strip() == "":
                continue
            patch_payload[key] = entry[key]

        if patch_payload:
            p_status, p_body = self._request_json(
                "PATCH", f"/api/articles/{article_id}", json=patch_payload
            )
            if p_status not in (200,):
                return {
                    "ok": False,
                    "stage": "patch_article",
                    "status": p_status,
                    "body": p_body,
                    "article_id": article_id,
                }
            body = p_body

        return {"ok": True, "kind": "article", "id": article_id, "body": body}

    def import_batch(self, config: Dict[str, Any]) -> List[Dict[str, Any]]:
        entries = config.get("entries", [])
        if not entries:
            raise ValueError("Config must include a non-empty 'entries' array")
        default_upsert = bool(config.get("upsert", True))

        results = []
        for i, entry in enumerate(entries, start=1):
            kind = (entry.get("kind") or "").strip().lower()
            print(
                f"[{i}/{len(entries)}] Importing {kind!r}: {entry.get('title', '<untitled>')}"
            )

            try:
                entry_upsert = bool(entry.get("upsert", default_upsert))
                if kind == "review":
                    result = self.create_review(entry, upsert=entry_upsert)
                elif kind == "article":
                    result = self.create_article(entry, upsert=entry_upsert)
                else:
                    result = {
                        "ok": False,
                        "stage": "validate",
                        "error": "kind must be 'review' or 'article'",
                        "entry": entry,
                    }
            except Exception as exc:
                result = {
                    "ok": False,
                    "stage": "exception",
                    "error": str(exc),
                    "entry": entry,
                }

            results.append(result)

            if result.get("ok"):
                extra = (
                    f", movie_id={result['movie_id']}" if result.get("movie_id") else ""
                )
                print(f"   -> OK ({result['kind']} id={result['id']}{extra})")
            else:
                print(
                    f"   -> FAIL ({result.get('stage')}) "
                    f"{result.get('error') or result.get('body')}"
                )

        return results


def resolve_config_path(candidates: Optional[Sequence[Path]] = None) -> Path:
    lookup = tuple(candidates) if candidates is not None else DEFAULT_CONFIG_CANDIDATES
    config_path = next((p for p in lookup if p.exists()), None)
    if config_path is None:
        raise FileNotFoundError(
            "No config file found. Checked: " + ", ".join(str(p) for p in lookup)
        )
    return config_path


def load_config(config_path: Path) -> Dict[str, Any]:
    return json.loads(config_path.read_text())


def run_batch_import(
    config: Dict[str, Any],
    base_url: str = DEFAULT_BASE_URL,
    timeout: int = DEFAULT_TIMEOUT,
) -> List[Dict[str, Any]]:
    client = BatchImportClient(base_url=base_url, timeout=timeout)
    return client.import_batch(config)
