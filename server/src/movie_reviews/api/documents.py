#!/usr/bin/env python3

import os

# from flask_migrate import Migrate
from flask import jsonify, request, send_file
from flask_restful import Resource

from movie_reviews.config import app, db
from movie_reviews.models import Director, Review, Tag
from movie_reviews.utils.document_processor import DocumentProcessor
from movie_reviews.utils.s3_client import get_s3_client


@app.route("/uploads/<filename>")
def uploaded_file(filename):
    """Serve uploaded files."""
    uploads_dir = os.path.join(app.root_path, "uploads")
    file_path = os.path.join(uploads_dir, filename)

    if os.path.exists(file_path):
        return send_file(file_path)
    else:
        return jsonify({"error": "File not found"}), 404


class ReviewWithDocument(Resource):
    """Handle review creation with optional document upload in one request."""

    def post(self):
        """Create a new review with optional document upload."""
        try:
            # Check if this is a file upload (multipart/form-data)
            if request.content_type and "multipart/form-data" in request.content_type:
                # Handle file upload
                data = request.form.to_dict()
                file = request.files.get("document")
            else:
                # Handle JSON data
                data = request.get_json()
                file = None

            # Validate required fields
            if not data.get("title"):
                return {"error": "Review title is required"}, 400
            if not data.get("rating"):
                return {"error": "Rating is required"}, 400
            if not data.get("movie_id"):
                return {"error": "Movie ID is required"}, 400

            # Create new review
            review = Review(
                title=data.get("title"),
                rating=data.get("rating"),
                review_text=data.get("review_text", ""),
                movie_id=data.get("movie_id"),
                content_type="review",
            )

            db.session.add(review)
            db.session.flush()  # Flush to get the review ID

            # Handle tags if provided
            if data.get("tags"):
                tags_data = data["tags"]
                # Parse JSON string if needed
                if isinstance(tags_data, str):
                    import json

                    tags_data = json.loads(tags_data)

                for tag_data in tags_data:
                    if isinstance(tag_data, dict) and "name" in tag_data:
                        tag_name = tag_data["name"].strip().lower()
                        if tag_name:
                            # Find or create tag
                            tag = Tag.query.filter_by(name=tag_name).first()
                            if not tag:
                                tag = Tag(name=tag_name)
                                db.session.add(tag)
                                db.session.flush()
                            review.tags.append(tag)

            # Handle document upload if file is provided
            if file and file.filename:
                result = DocumentProcessor.process_uploaded_document_s3(file, review.id)

                if result["success"]:
                    # Update review with document information
                    review.has_document = True
                    review.document_filename = result["filename"]
                    review.document_path = result["file_path"]
                    review.document_type = result["file_type"]

                    # Replace review text with extracted text if replace_text is true
                    replace_text = data.get("replace_text", "true").lower() == "true"
                    if replace_text and result["extracted_text"]:
                        review.review_text = result["extracted_text"]
                else:
                    return {
                        "error": f'Document processing failed: {result["error"]}'
                    }, 400

            db.session.commit()
            return review.to_dict(), 201

        except Exception as e:
            db.session.rollback()
            return {"error": f"Failed to create review: {str(e)}"}, 500


class ReviewWithDocumentById(Resource):
    """Handle review updates with optional document upload in one request."""

    def patch(self, review_id):
        """Update an existing review with optional document upload."""
        try:
            review = Review.query.get(review_id)
            if not review:
                return {"error": "Review not found"}, 404

            # Check if this is a file upload (multipart/form-data)
            if request.content_type and "multipart/form-data" in request.content_type:
                # Handle file upload
                data = request.form.to_dict()
                file = request.files.get("document")
            else:
                # Handle JSON data
                data = request.get_json()
                file = None

            # Update review fields
            if "title" in data:
                review.title = data["title"]
            if "rating" in data:
                review.rating = data["rating"]
            if "review_text" in data:
                review.review_text = data["review_text"]

            # Handle tags if provided
            if "tags" in data:
                # Clear existing tags
                review.tags.clear()
                # Add new tags
                tags_data = data["tags"]
                # Parse JSON string if needed
                if isinstance(tags_data, str):
                    import json

                    tags_data = json.loads(tags_data)

                for tag_data in tags_data:
                    if isinstance(tag_data, dict) and "name" in tag_data:
                        tag_name = tag_data["name"].strip().lower()
                        if tag_name:
                            # Find or create tag
                            tag = Tag.query.filter_by(name=tag_name).first()
                            if not tag:
                                tag = Tag(name=tag_name)
                                db.session.add(tag)
                            review.tags.append(tag)

            # Handle document upload if file is provided
            if file and file.filename:
                result = DocumentProcessor.process_uploaded_document_s3(file, review.id)

                if result["success"]:
                    # Update review with document information
                    review.has_document = True
                    review.document_filename = result["filename"]
                    review.document_path = result["file_path"]
                    review.document_type = result["file_type"]

                    # Replace review text with extracted text if replace_text is true
                    replace_text = data.get("replace_text", "true").lower() == "true"
                    if replace_text and result["extracted_text"]:
                        review.review_text = result["extracted_text"]
                else:
                    return {
                        "error": f'Document processing failed: {result["error"]}'
                    }, 400

            db.session.commit()
            return review.to_dict(), 200

        except Exception as e:
            db.session.rollback()
            return {"error": f"Failed to update review: {str(e)}"}, 500


class DocumentUpload(Resource):
    """Handle document uploads for reviews."""

    def post(self):
        """Upload and process a document for a review using temporary processing."""
        try:
            # Check if file is present
            if "document" not in request.files:
                return {"error": "No document file provided"}, 400

            file = request.files["document"]
            if file.filename == "":
                return {"error": "No file selected"}, 400

            # Get review_id from form data
            review_id = request.form.get("review_id")
            print(f"DEBUG DocumentUpload - Received review_id: {review_id}")
            if not review_id:
                return {"error": "Review ID is required"}, 400

            # Check if we should replace text
            replace_text = request.form.get("replace_text", "false").lower() == "true"
            print(f"DEBUG DocumentUpload - Replace text: {replace_text}")

            # Find the review
            review = Review.query.get(review_id)
            print(f"DEBUG DocumentUpload - Found review: {review}")
            print(
                f"DEBUG DocumentUpload - Review ID: {review.id if review else 'None'}"
            )
            print(
                f"DEBUG DocumentUpload - Review current document_path: {review.document_path if review else 'None'}"
            )
            if not review:
                return {"error": "Review not found"}, 404

            # Process the document using S3 storage (production-ready)
            print(f"Processing document: {file.filename}")
            result = DocumentProcessor.process_uploaded_document_s3(
                file, int(review_id)
            )
            print(f"Document processing result: {result}")

            if not result["success"]:
                return {"error": result["error"]}, 400

            # Update review with document information
            print(
                f"DEBUG DocumentUpload - Before update - document_path: {review.document_path}"
            )
            review.has_document = True
            review.document_filename = result["filename"]
            review.document_path = result["file_path"]  # Store the actual file path
            review.document_type = result["file_type"]
            print(
                f"DEBUG DocumentUpload - After update - document_path: {review.document_path}"
            )
            print(
                f"DEBUG DocumentUpload - New file_path from result: {result['file_path']}"
            )

            # Optionally replace review text with extracted text
            if replace_text and result["extracted_text"]:
                review.review_text = result["extracted_text"]

            print("DEBUG DocumentUpload - About to commit changes")
            db.session.commit()
            print("DEBUG DocumentUpload - Commit successful")

            # Verify the update worked
            db.session.refresh(review)
            print(
                f"DEBUG DocumentUpload - After refresh - document_path: {review.document_path}"
            )

            return {
                "message": "Document processed successfully",
                "review": review.to_dict(),
                "document_info": {
                    "filename": result["filename"],
                    "file_type": result["file_type"],
                    "extracted_text_length": len(result["extracted_text"]),
                    "text_replaced": replace_text,
                },
            }, 200

        except Exception as e:
            return {"error": f"Upload failed: {str(e)}"}, 500


class ExtractText(Resource):
    """Handle text extraction from documents without saving."""

    def post(self):
        """Extract text from a document without saving it."""
        try:
            if "document" not in request.files:
                return {"error": "No document provided"}, 400

            file = request.files["document"]
            if file.filename == "":
                return {"error": "No file selected"}, 400

            # Process the document to extract text
            result = DocumentProcessor.process_uploaded_document_temporary(file)

            if not result["success"]:
                return {
                    "error": f'Text extraction failed: {result.get("error", "Unknown error")}'
                }, 400

            # Extract HTML with full formatting preservation
            file_type = result["file_type"]
            temp_path = result["file_path"]
            raw_text = result["extracted_text"]

            # Use the new HTML extraction method
            html_text = DocumentProcessor.extract_html_from_document(
                temp_path, file_type, clean_text=True, remove_title=True
            )

            return {
                "text": html_text,  # Return HTML formatted text
                "raw_text": raw_text,  # Also include raw text for reference
                "filename": result["filename"],
                "file_type": result["file_type"],
                "text_length": len(html_text),
            }, 200

        except Exception as e:
            return {"error": f"Text extraction failed: {str(e)}"}, 500


class DocumentDownload(Resource):
    """Handle document downloads."""

    def get(self, review_id):
        """Download the document associated with a review."""
        try:
            from movie_reviews.utils.s3_client import get_s3_client

            review = Review.query.get(review_id)
            if not review:
                return {"error": "Review not found"}, 404

            if not review.has_document or not review.document_path:
                return {"error": "No document associated with this review"}, 404

            # Download file from S3
            s3_client = get_s3_client()
            download_result = s3_client.download_file(review.document_path)

            if not download_result["success"]:
                return {"error": download_result["error"]}, 404

            # Create response with file data
            from flask import Response

            response = Response(
                download_result["file_data"],
                mimetype=download_result["content_type"],
                headers={
                    "Content-Disposition": f'attachment; filename="{review.document_filename}"'
                },
            )

            # Add cache-busting headers
            response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"

            return response

        except Exception as e:
            return {"error": f"Download failed: {str(e)}"}, 500


class DocumentView(Resource):
    """Handle document viewing (inline display)."""

    def get(self, review_id):
        """View the document associated with a review inline."""
        try:
            from movie_reviews.utils.s3_client import get_s3_client

            print(f"DEBUG DocumentView - Looking for review_id: {review_id}")
            review = Review.query.get(review_id)
            if not review:
                print(f"DEBUG DocumentView - Review {review_id} not found")
                return {"error": "Review not found"}, 404

            print(f"DEBUG DocumentView - Found review: {review.title}")
            print(f"DEBUG DocumentView - has_document: {review.has_document}")
            print(f"DEBUG DocumentView - document_path: {review.document_path}")

            if not review.has_document or not review.document_path:
                print(
                    f"DEBUG DocumentView - No document associated with review {review_id}"
                )
                return {"error": "No document associated with this review"}, 404

            # Download file from S3
            s3_client = get_s3_client()
            download_result = s3_client.download_file(review.document_path)

            if not download_result["success"]:
                print(
                    f"DEBUG DocumentView - S3 download failed: {download_result['error']}"
                )
                return {"error": download_result["error"]}, 404

            # Create response with file data for inline viewing
            from flask import Response

            mimetype = (
                "application/pdf"
                if review.document_type == "pdf"
                else download_result["content_type"]
            )
            response = Response(download_result["file_data"], mimetype=mimetype)

            # Add cache-busting headers
            response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"

            return response

        except Exception as e:
            return {"error": f"View failed: {str(e)}"}, 500


class DocumentPreview(Resource):
    """Get document preview without downloading."""

    def get(self, review_id):
        """Get a preview of the document content."""
        try:
            review = Review.query.get(review_id)
            if not review:
                return {"error": "Review not found"}, 404

            if not review.has_document:
                return {"error": "No document associated with this review"}, 404

            # Get preview from review text
            preview_text = ""
            if review.review_text:
                preview_text = (
                    review.review_text[:500] + "..."
                    if len(review.review_text) > 500
                    else review.review_text
                )

            return {
                "preview": preview_text,
                "filename": review.document_filename,
                "file_type": review.document_type,
                "has_document": review.has_document,
            }, 200

        except Exception as e:
            return {"error": f"Preview failed: {str(e)}"}, 500


class ArticleBackdropUpload(Resource):
    """Upload an image to use as an article (review) backdrop."""

    def post(self, article_id):
        try:
            if "image" not in request.files:
                return {"error": "No image file provided"}, 400

            file = request.files["image"]
            if not file or file.filename == "":
                return {"error": "No file selected"}, 400

            # Ensure this is an article (review with no movie_id)
            review = Review.query.filter_by(id=article_id, movie_id=None).first()
            if not review:
                return {"error": "Article not found"}, 404

            s3_client = get_s3_client()
            object_key = s3_client.generate_object_key(file.filename, int(article_id))
            upload_result = s3_client.upload_file(
                file, object_key, file.mimetype or "image/jpeg"
            )

            if not upload_result["success"]:
                return {"error": upload_result["error"]}, 400

            # Store the object key; we'll serve via a backend endpoint
            review.backdrop = upload_result["object_key"]
            db.session.commit()

            return {
                "backdrop": review.backdrop,
                "article": review.to_dict(),
            }, 200

        except Exception as e:
            db.session.rollback()
            return {"error": f"Backdrop upload failed: {str(e)}"}, 500


class ReviewBackdropUpload(Resource):
    """Upload an image to use as a movie review backdrop."""

    def post(self, review_id):
        try:
            if "image" not in request.files:
                return {"error": "No image file provided"}, 400

            file = request.files["image"]
            if not file or file.filename == "":
                return {"error": "No file selected"}, 400

            # Ensure this is a movie review (has movie_id)
            review = Review.query.filter(
                Review.id == review_id, Review.movie_id.isnot(None)
            ).first()
            if not review:
                return {"error": "Review not found"}, 404

            s3_client = get_s3_client()
            object_key = s3_client.generate_object_key(file.filename, int(review_id))
            upload_result = s3_client.upload_file(
                file, object_key, file.mimetype or "image/jpeg"
            )

            if not upload_result["success"]:
                return {"error": upload_result["error"]}, 400

            review.backdrop = upload_result["object_key"]
            db.session.commit()

            return {
                "backdrop": review.backdrop,
                "review": review.to_dict(),
            }, 200

        except Exception as e:
            db.session.rollback()
            return {"error": f"Backdrop upload failed: {str(e)}"}, 500


class DirectorBackdropUpload(Resource):
    """Upload an image to use as a director backdrop."""

    def post(self, director_id):
        try:
            if "image" not in request.files:
                return {"error": "No image file provided"}, 400

            file = request.files["image"]
            if not file or file.filename == "":
                return {"error": "No file selected"}, 400

            director = Director.query.get(director_id)
            if not director:
                return {"error": "Director not found"}, 404

            s3_client = get_s3_client()
            object_key = s3_client.generate_object_key(file.filename, int(director_id))
            upload_result = s3_client.upload_file(
                file, object_key, file.mimetype or "image/jpeg"
            )

            if not upload_result["success"]:
                return {"error": upload_result["error"]}, 400

            # Store the object key; we'll serve via a backend endpoint
            director.backdrop = upload_result["object_key"]
            db.session.commit()

            return {
                "backdrop": director.backdrop,
                "director": director.to_dict(),
            }, 200

        except Exception as e:
            db.session.rollback()
            return {"error": f"Backdrop upload failed: {str(e)}"}, 500


class ArticleBackdropView(Resource):
    """Serve article backdrop image from S3."""

    def get(self, article_id):
        try:
            review = Review.query.filter_by(id=article_id, movie_id=None).first()
            if not review or not review.backdrop:
                return {"error": "Backdrop not found"}, 404

            s3_client = get_s3_client()
            key = review.backdrop
            download = s3_client.download_file(key)
            if not download["success"]:
                return {"error": download["error"]}, 404

            from flask import Response

            return Response(
                download["file_data"],
                mimetype=download.get("content_type", "image/jpeg"),
            )
        except Exception as e:
            return {"error": f"Backdrop fetch failed: {str(e)}"}, 500


class ReviewBackdropView(Resource):
    """Serve movie review backdrop image from S3."""

    def get(self, review_id):
        try:
            review = Review.query.filter(
                Review.id == review_id, Review.movie_id.isnot(None)
            ).first()
            if not review or not review.backdrop:
                return {"error": "Backdrop not found"}, 404

            s3_client = get_s3_client()
            key = review.backdrop
            download = s3_client.download_file(key)
            if not download["success"]:
                return {"error": download["error"]}, 404

            from flask import Response

            return Response(
                download["file_data"],
                mimetype=download.get("content_type", "image/jpeg"),
            )
        except Exception as e:
            return {"error": f"Backdrop fetch failed: {str(e)}"}, 500


class DirectorBackdropView(Resource):
    """Serve director backdrop image from S3."""

    def get(self, director_id):
        try:
            director = Director.query.get(director_id)
            if not director or not director.backdrop:
                return {"error": "Backdrop not found"}, 404

            s3_client = get_s3_client()
            key = director.backdrop
            download = s3_client.download_file(key)
            if not download["success"]:
                return {"error": download["error"]}, 404

            from flask import Response

            return Response(
                download["file_data"],
                mimetype=download.get("content_type", "image/jpeg"),
            )
        except Exception as e:
            return {"error": f"Backdrop fetch failed: {str(e)}"}, 500


def register_routes(api):
    api.add_resource(ExtractText, "/api/extract_text")
    api.add_resource(ReviewWithDocument, "/api/reviews_with_document")
    api.add_resource(
        ReviewWithDocumentById, "/api/reviews_with_document/<int:review_id>"
    )
    api.add_resource(DocumentDownload, "/api/download_document/<int:review_id>")
    api.add_resource(DocumentView, "/api/view_document/<int:review_id>")
    api.add_resource(DocumentPreview, "/api/document_preview/<int:review_id>")
    api.add_resource(ReviewBackdropUpload, "/api/reviews/<int:review_id>/backdrop")
    api.add_resource(ArticleBackdropUpload, "/api/articles/<int:article_id>/backdrop")
    api.add_resource(
        DirectorBackdropUpload, "/api/directors/<int:director_id>/backdrop"
    )
    api.add_resource(ReviewBackdropView, "/api/reviews/<int:review_id>/backdrop/view")
    api.add_resource(
        ArticleBackdropView, "/api/articles/<int:article_id>/backdrop/view"
    )
    api.add_resource(
        DirectorBackdropView, "/api/directors/<int:director_id>/backdrop/view"
    )
