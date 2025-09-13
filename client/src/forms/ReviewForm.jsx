import React, { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import ReactQuill from "react-quill"; // Import ReactQuill
import 'react-quill/dist/quill.snow.css';  // Quill's default theme
import styled from 'styled-components';
import { StyledForm, Button } from "../MiscStyling";
import Error from "../styles/Error";
import Stars from "../components/Stars"
import ContentDisplay from "../components/FormSubmit";
import DocumentUpload from "../components/DocumentUpload";
import TagInput from "../components/TagInput";
import SubmitButton from "../components/SubmitButton";
import { handleFormSubmit, submitFormWithDocument } from "../utils/formSubmit";
import useCrudStateDB from "../hooks/useCrudStateDB";

const StarsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
`;

const ReviewForm = ({ initObj }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(!initObj);
  const [submitError, setSubmitError] = useState(null);
  const [hasDocument, setHasDocument] = useState(initObj?.hasDocument || false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [replaceText, setReplaceText] = useState(true);
  const [contentType, setContentType] = useState(initObj?.contentType || 'review');
  const [tags, setTags] = useState(initObj?.tags || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setMovies } = useOutletContext();
  const { addToKey, updateKey } = useCrudStateDB(setMovies, "movies");
  const movieId = parseInt(id);

  const initialValues = initObj
    ? {
        rating: initObj.rating || "",
        reviewText: initObj.reviewText || "",
        title: initObj.title || "",
        contentType: initObj.contentType || 'review',
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
      title: body.title,
      rating: body.rating,
      review_text: body.reviewText,
      movie_id: body.movieId,
      tags: tags.map(tag => ({
        name: typeof tag === 'string' ? tag : tag.name
      }))
    };
    
    console.log('Tags being sent:', tags);
    console.log('SnakeBody tags:', snakeBody.tags);
    

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
        // Don't update state here - let the document upload complete first
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
        // Don't update state here - let the document upload complete first
        return result;
      } else {
        throw new Error('Failed to create review');
      }
    }
  };

  const validationSchema = Yup.object({
    title: Yup.string()
      .required("Review title is required")
      .min(3, "Title must be at least 3 characters")
      .max(100, "Title must be less than 100 characters"),
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

  // Function to clean up rich text content
  const cleanRichText = (html) => {
    if (!html) return '';
    
    // Remove empty paragraphs with just line breaks and whitespace
    const cleaned = html
      .replace(/<p><br><\/p>/gi, '') // Remove empty paragraphs
      .replace(/<p><br\/><\/p>/gi, '') // Remove empty paragraphs with self-closing br
      .replace(/<p>\s*<\/p>/gi, '') // Remove paragraphs with only whitespace
      .replace(/<p>&nbsp;<\/p>/gi, '') // Remove paragraphs with non-breaking spaces
      .replace(/<p>\s*&nbsp;\s*<\/p>/gi, '') // Remove paragraphs with whitespace and nbsp
      .trim();
    
    // If only empty tags remain, return empty string
    if (cleaned === '' || cleaned === '<p></p>' || cleaned === '<br>' || cleaned === '<p> </p>') {
      return '';
    }
    
    return cleaned;
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      if (isSubmitting) return; // Prevent double submission
      
      setIsSubmitting(true);
      setSubmitError(null);
      
      try {
        const formData = {
          ...values,
          movieId: movieId,
        };

        // Submit the main form data first
        const result = await submitFormWithDocument(formData, selectedFile, isEdit, id, false);
        
        if (result.success) {
          // Update the movies context with the new/updated review
          if (isEdit) {
            updateKey("reviews", initObj.id, result.result, movieId);
          } else {
            addToKey("reviews", result.result, movieId);
          }
          
          // Switch to non-editing mode to show the saved review
          setIsEditing(false);
        } else {
          setSubmitError(result.error);
        }
        
      } catch (error) {
        console.error('Error submitting review:', error);
        setSubmitError(error.message || 'Failed to submit review');
      } finally {
        setIsSubmitting(false);
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
    setHasDocument(true);
    
    if (result.review && result.review.review_text) {
      formik.setFieldValue("reviewText", result.review.review_text);
    }
    
    formik.setFieldTouched("reviewText", false);
    
    if (initObj && result.review) {
      initObj.hasDocument = result.review.has_document;
      initObj.documentFilename = result.review.document_filename;
      initObj.documentType = result.review.document_type;
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
          
          {/* Rating Stars */}
          <StarsContainer>
            <Stars rating={formik.values.rating} handleStarClick={updateRating} />
            {formik.touched.rating && formik.errors.rating && (
              <Error>{formik.errors.rating}</Error>
            )}
          </StarsContainer>
          
          {/* Title Input */}
          <div>
            <label htmlFor="title">Review Title:</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter a title for your review..."
            />
            {formik.touched.title && formik.errors.title && (
              <Error>{formik.errors.title}</Error>
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
          
          {/* Tags Input */}
          <div>
            <label htmlFor="tags">Tags (optional):</label>
            <TagInput
              tags={tags}
              onTagsChange={setTags}
              placeholder="Add tags to categorize your review..."
            />
          </div>
          
          {submitError && <Error>{submitError}</Error>}
          
          {/* Display validation errors */}
          {formik.errors.title && <Error>Title: {formik.errors.title}</Error>}
          {formik.errors.rating && <Error>Rating: {formik.errors.rating}</Error>}
          {formik.errors.reviewText && <Error>Review: {formik.errors.reviewText}</Error>}
          
          {/* Document Upload Component - only show if we have a reviewId or are creating new */}
          <DocumentUpload
            reviewId={initObj?.id || (initObj === null ? 'new' : null)}
            onUploadSuccess={handleDocumentUploadSuccess}
            onUploadError={handleDocumentUploadError}
            onFileSelect={handleFileSelect}
            existingDocument={hasDocument ? initObj : null}
            onRemoveDocument={() => {
              // Just update local state - persistence will happen on form submit
              setHasDocument(false);
              if (initObj) {
                initObj.hasDocument = false;
                initObj.documentFilename = null;
                initObj.documentType = null;
              }
            }}
          />
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
            <Button type="button" onClick={() => {
              if (initObj) {
                // If editing existing review, just exit edit mode
                setIsEditing(false);
              } else {
                // If creating new review, navigate back
                navigate(-1);
              }
            }}>Cancel</Button>
            <SubmitButton 
              isSubmitting={isSubmitting}
              isEdit={isEdit}
              editText="Save Changes"
              createText="Submit Review"
            />
          </div>
        </StyledForm>
      ) : (
        <ContentDisplay
          formValues={{
            ...formik.values,
            hasDocument: initObj?.hasDocument || false,
            documentFilename: initObj?.documentFilename || null,
            documentType: initObj?.documentType || null,
            dateAdded: initObj?.dateAdded || null,
            tags: tags
          }}
          setIsEditing={setIsEditing}
          reviewId={initObj?.id}
        />
      )}
    </div>
  );
};

export default ReviewForm;