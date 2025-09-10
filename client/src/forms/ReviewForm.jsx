import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import ReactQuill from "react-quill"; // Import ReactQuill
import 'react-quill/dist/quill.snow.css';  // Quill's default theme
import { StyledForm, Button } from "../MiscStyling";
import Error from "../styles/Error";
import Stars from "../components/Stars"
import ContentDisplay from "../components/FormSubmit";
import DocumentUpload from "../components/DocumentUpload";
import useCrudStateDB from "../hooks/useCrudStateDB";

const ReviewForm = ({ initObj }) => {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(!initObj);
  const [submitError, setSubmitError] = useState(null);
  const [hasDocument, setHasDocument] = useState(initObj?.has_document || false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [replaceText, setReplaceText] = useState(false);
  const [contentType, setContentType] = useState(initObj?.content_type || 'review');
  const { setMovies } = useOutletContext();
  const { addToKey, updateKey } = useCrudStateDB(setMovies, "movies");
  const movieId = parseInt(id);

  const initialValues = initObj
    ? {
        rating: initObj.rating || "",
        reviewText: initObj.reviewText || "",
        title: initObj.title || "",
        contentType: initObj.content_type || 'review',
      }
    : {
        rating: 0,
        reviewText: "",
        title: "",
        contentType: 'review',
      };

  const submitToDB = initObj
    ? (body) => updateKey("reviews", initObj.id, body, movieId)
    : (body) => addToKey("reviews", body, movieId);

  const submitToDBAsync = async (body) => {
    // Transform camelCase to snake_case for the API
    const snakeBody = {
      rating: body.rating,
      review_text: body.reviewText,
      movie_id: body.movieId
    };

    if (initObj) {
      // For updates, we need to make the API call directly
      const response = await fetch(`/api/reviews/${initObj.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(snakeBody),
      });
      
      if (response.ok) {
        const result = await response.json();
        updateKey("reviews", initObj.id, result, movieId);
        return result;
      } else {
        throw new Error('Failed to update review');
      }
    } else {
      // For new reviews, make the API call directly
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(snakeBody),
      });
      
      if (response.ok) {
        const result = await response.json();
        addToKey("reviews", result, movieId);
        return result;
      } else {
        throw new Error('Failed to create review');
      }
    }
  };

  const validationSchema = Yup.object({
    rating: Yup.number()
      .required("Rating is required.")
      .min(1, "Rating must be at least 1.")
      .max(10, "Rating must be at most 10."),
    reviewText: Yup.string()
      .test('review-or-document', 'Either review text or a document is required.', function(value) {
        const hasReviewText = value && value.trim().length >= 10;
        return hasDocument || hasReviewText;
      })
      .when([], {
        is: () => hasDocument,
        then: (schema) => schema.optional(),
        otherwise: (schema) => schema.required("Review text is required when no document is uploaded.")
      }),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        // First, create or update the review
        const body = {
          ...Object.fromEntries(
            Object.entries(values).map(([key, value]) => [key, value === "" ? null : value])
          ),
          movieId: movieId,
        };

        // If there's a selected file but no review text, provide a placeholder
        if (selectedFile && (!body.reviewText || body.reviewText.trim() === '')) {
          body.reviewText = 'Document attached - see document viewer below for content.';
        }

        console.log('Submitting review with body:', body);

        // Submit the review and get the result
        const reviewResult = await submitToDBAsync(body);
        console.log('Review result:', reviewResult);
        
        // If there's a selected file and we have a review ID, upload it
        if (selectedFile && reviewResult?.id) {
          console.log('Uploading document for review ID:', reviewResult.id);
          try {
            const formData = new FormData();
            formData.append('document', selectedFile);
            formData.append('review_id', reviewResult.id);
            formData.append('replace_text', replaceText);

            const uploadResponse = await fetch('/api/upload_document', {
              method: 'POST',
              body: formData,
            });

            if (uploadResponse.ok) {
              const uploadResult = await uploadResponse.json();
              console.log('Upload successful:', uploadResult);
              handleDocumentUploadSuccess(uploadResult);
            } else {
              const errorData = await uploadResponse.json();
              console.error('Upload failed:', errorData);
              handleDocumentUploadError(errorData.error || 'Upload failed');
            }
          } catch (error) {
            console.error('Upload error:', error);
            handleDocumentUploadError(`Upload failed: ${error.message}`);
          }
        } else if (selectedFile) {
          console.log('No review ID available for document upload');
          handleDocumentUploadError('Review was created but document upload failed - no review ID');
        }

        setIsEditing(false);
      } catch (error) {
        console.error('Submission error:', error);
        setSubmitError(`Submission failed: ${error.message || 'Unknown error'}`);
      }
    },
  });

  const handleQuillChange = (value) => {
    formik.setFieldValue("reviewText", value); // Update the formik value for reviewText
  };

  const updateRating = (rating) => {
    formik.setFieldValue("rating", rating);
  };

  const handleDocumentUploadSuccess = (result) => {
    // Update the hasDocument state
    setHasDocument(true);
    
    // Update the review text if it was extracted from the document
    if (result.review && result.review.review_text) {
      formik.setFieldValue("reviewText", result.review.review_text);
    }
    
    // Clear any validation errors
    formik.setFieldTouched("reviewText", false);
    
    // Update the initObj with document information (using camelCase)
    if (initObj && result.review) {
      initObj.hasDocument = result.review.has_document;
      initObj.documentFilename = result.review.document_filename;
      initObj.documentType = result.review.document_type;
    }
    
    // Refresh the movies data to show updated review
    if (setMovies) {
      // You might want to add a refresh function here
      window.location.reload(); // Simple refresh for now
    }
  };

  const handleDocumentUploadError = (error) => {
    setSubmitError(`Document upload failed: ${error}`);
  };

  const handleFileSelect = (file, replaceTextOption) => {
    setSelectedFile(file);
    setReplaceText(replaceTextOption);
    
    if (file) {
      setHasDocument(true);
    } else {
      setHasDocument(false);
    }
  };


  // Debug logging
  console.log('DEBUG - initObj:', initObj);
  console.log('DEBUG - hasDocument:', hasDocument);
  console.log('DEBUG - documentFilename:', initObj?.documentFilename);
  console.log('DEBUG - documentType:', initObj?.documentType);

  return (
    <div>
      {isEditing ? (
        <StyledForm onSubmit={formik.handleSubmit}>
          <h2>{initObj ? "Update Review" : "Leave a Review"}</h2>
          <div>
          <Stars rating={formik.values.rating} handleStarClick={updateRating} />
            {formik.touched.rating && formik.errors.rating && (
              <Error>{formik.errors.rating}</Error>
            )}
          </div>
          <div>
            <label htmlFor="reviewText">
              Review: {hasDocument && <span style={{color: '#28a745', fontSize: '0.9em'}}>(Document uploaded - review text optional)</span>}
            </label>
            {/* Quill Editor for reviewText */}
            <ReactQuill
              id="reviewText"
              name="reviewText"
              value={formik.values.reviewText}
              onChange={handleQuillChange}
              placeholder={hasDocument ? "Add additional review text (optional)..." : "Write your review here..."}
              modules={{
                toolbar: [
                  [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  [{ 'align': [] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  ['blockquote', 'code-block'],
                  ['link', 'image'],
                  [{ 'color': [] }, { 'background': [] }],
                  ['clean']
                ]
              }}
            />
            {formik.touched.reviewText && formik.errors.reviewText && (
              <Error>{formik.errors.reviewText}</Error>
            )}
          </div>
          {submitError && <Error>{submitError}</Error>}
          
          {/* Document Upload Component */}
          <DocumentUpload
            reviewId={initObj?.id}
            onUploadSuccess={handleDocumentUploadSuccess}
            onUploadError={handleDocumentUploadError}
            onFileSelect={handleFileSelect}
            existingDocument={hasDocument ? initObj : null}
          />
          
          <Button type="submit">{initObj ? "Update" : "Submit"}</Button>
        </StyledForm>
      ) : (
        <ContentDisplay
          formValues={{
            ...formik.values,
            hasDocument: initObj?.hasDocument || false,
            documentFilename: initObj?.documentFilename || null,
            documentType: initObj?.documentType || null
          }}
          setIsEditing={setIsEditing}
          reviewId={initObj?.id}
        />
      )}
    </div>
  );
};

export default ReviewForm;