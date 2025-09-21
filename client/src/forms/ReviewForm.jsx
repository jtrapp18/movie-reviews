import React, { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import RichTextEditor from "../components/RichTextEditor";
import styled from 'styled-components';
import { StyledForm, Button, DeleteButton, CancelButton, ExtractButton } from "../MiscStyling";
import Error from "../styles/Error";
import Stars from "../components/Stars"
import ContentDisplay from "../components/FormSubmit";
import DocumentUpload from "../components/DocumentUpload";
import TagInput from "../components/TagInput";
import SubmitButton from "../components/SubmitButton";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import { handleFormSubmit, submitFormWithDocument, uploadDocument } from "../utils/formSubmit";
import { extractTextFromFile } from "../utils/textExtraction";
import useCrudStateDB from "../hooks/useCrudStateDB";
import { snakeToCamel, invalidateRatingsCache, getJSON } from "../helper";
import { useAdmin } from "../hooks/useAdmin";

const StarsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
`;

const ReviewForm = ({ initObj }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(!initObj);
  const isEdit = !!initObj; // True if we have an existing review to edit
  const [submitError, setSubmitError] = useState(null);
  const [hasDocument, setHasDocument] = useState(initObj?.hasDocument || false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [replaceText, setReplaceText] = useState(true);
  const [tags, setTags] = useState(initObj?.tags || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [updatedReview, setUpdatedReview] = useState(null); // Track updated review data
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { setMovies } = useOutletContext();
  const { addToKey, updateKey, deleteItem } = useCrudStateDB(setMovies, "movies");
  const { isAdmin } = useAdmin();
  const movieId = parseInt(id);

  const initialValues = initObj
    ? {
        rating: initObj.rating || "",
        reviewText: initObj.reviewText || "",
        title: initObj.title || "",
      }
    : {
        rating: 0,
        reviewText: "",
        title: "",
      };

  const submitToDB = initObj
    ? (body) => updateKey("reviews", initObj.id, body, movieId)
    : (body) => addToKey("reviews", body, movieId);

  const handleDelete = async () => {
    if (!movieId) return;
    
    setIsDeleting(true);
    try {
      // Call the API directly to ensure it completes before updating state
      const response = await fetch(`/api/movies/${movieId}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Use the CRUD hook to update the frontend state
        deleteItem(movieId);
        
        // Invalidate the ratings cache so the UI updates properly
        invalidateRatingsCache();
        
        // Refresh the movies data to ensure UI is up to date
        const movies = await getJSON('movies');
        setMovies(movies);
        
        // Navigate back to the movie list or home
        navigate('/#/search_movies');
      } else {
        const errorData = await response.json();
        setSubmitError(errorData.error || 'Failed to delete movie');
      }
    } catch (error) {
      console.error('Error deleting movie:', error);
      setSubmitError('Failed to delete movie');
    } finally {
      setIsDeleting(false);
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

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      if (isSubmitting) return; // Prevent double submission
      setIsSubmitting(true);
      setSubmitError(null);
      
      try {
        // Prepare the form data for submission
        const formData = {
          title: values.title,
          rating: values.rating,
          reviewText: values.reviewText,
          movieId: movieId,
          tags: tags.map(tag => ({ name: typeof tag === 'string' ? tag : tag.name }))
        };
        
        console.log('DEBUG - Final formData being sent:', formData);
        console.log('DEBUG - movieId value:', movieId);
        console.log('DEBUG - typeof movieId:', typeof movieId);
        
        // Submit the review
        const result = await submitFormWithDocument(formData, selectedFile, isEdit, initObj?.id);
        
        if (result.success) {
          console.log('ReviewForm - API response result:', result.result);
          console.log('ReviewForm - Tags in response:', result.result?.tags);
          
          // Convert snake_case to camelCase
          const camelCaseResult = snakeToCamel(result.result);
          
          // Update the movies context with the new/updated review
          if (isEdit) {
            // For edits, update the existing review in state
            setUpdatedReview(camelCaseResult);
            // Update initObj for immediate display
            Object.assign(initObj, camelCaseResult);
          } else {
            // For new reviews, just store the result - no need to call addToKey since we already submitted
            setUpdatedReview(camelCaseResult);
          }
          
          // Invalidate ratings cache since ratings may have changed
          invalidateRatingsCache();
          
          // Switch to non-editing mode to show the saved review
          setIsEditing(false);
        } else {
          throw new Error(result.error || 'Failed to submit review');
        }
      } catch (error) {
        console.error('Error submitting review:', error);
        setSubmitError(error.message || 'Failed to submit review');
      } finally {
        setIsSubmitting(false);
      }
    },
  });


  const updateRating = (rating) => {
    formik.setFieldValue("rating", rating);
  };

  const handleDocumentUploadSuccess = (result) => {
    console.log('handleDocumentUploadSuccess called with:', result);
    setHasDocument(true);
    
    // Convert snake_case to camelCase
    const review = snakeToCamel(result.review);
    console.log('Converted review:', review);
    
    // Don't automatically extract text - let user choose
    formik.setFieldTouched("reviewText", false);
    
    if (initObj && review) {
      initObj.hasDocument = review.hasDocument;
      initObj.documentFilename = review.documentFilename;
      initObj.documentType = review.documentType;
      console.log('Updated initObj:', initObj);
    }
  };

  const handleExtractText = async () => {
    await extractTextFromFile(
      selectedFile,
      setSubmitError,
      setIsExtracting,
      formik.setFieldValue,
      initObj
    );
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

          {/* Document Upload Section */}
          <div>
            <label>Document Upload (optional):</label>
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
            
            {/* Extract Text Button - show if document is uploaded */}
            {(() => {
              console.log('DEBUG EXTRACT BUTTON:', {
                hasDocument,
                selectedFile: selectedFile?.name,
                hasDocumentAndFile: hasDocument && selectedFile
              });
              return hasDocument && selectedFile;
            })() && (
              <div style={{ marginTop: '10px', textAlign: 'center' }}>
                <ExtractButton
                  type="button"
                  onClick={handleExtractText}
                  disabled={isExtracting}
                  isExtracting={isExtracting}
                >
                  {isExtracting ? 'Extracting...' : 'Extract Text from Document'}
                </ExtractButton>
                <p style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
                  Click to extract text from the uploaded document into the review field below
                </p>
              </div>
            )}
          </div>

          <RichTextEditor
            value={formik.values.reviewText}
            onChange={(value) => formik.setFieldValue("reviewText", value)}
            onBlur={() => formik.setFieldTouched("reviewText", true)}
            placeholder={hasDocument ? "Add additional review text (optional)..." : "Write your review here..."}
            hasDocument={hasDocument}
            label="Review"
            error={formik.errors.reviewText}
            touched={formik.touched.reviewText}
          />
          
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
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
            <CancelButton type="button" onClick={() => {
              if (initObj) {
                // If editing existing review, just exit edit mode
                setIsEditing(false);
              } else {
                // If creating new review, navigate back
                navigate(-1);
              }
            }}>Cancel</CancelButton>
            <SubmitButton 
              isSubmitting={isSubmitting}
              isEdit={isEdit}
              editText="Save Changes"
              createText="Submit Review"
            />
            {isAdmin && initObj && (
              <DeleteButton 
                type="button" 
                onClick={() => setShowDeleteModal(true)}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Movie'}
              </DeleteButton>
            )}
          </div>
        </StyledForm>
      ) : (
        <ContentDisplay
          formValues={(() => {
            // Use updatedReview if available, otherwise fall back to initObj
            const reviewData = updatedReview || initObj;
            console.log('DEBUG - reviewData:', reviewData);
            console.log('DEBUG - formik.values:', formik.values);
            
            const values = {
              ...formik.values,
              ...initObj, // Include all review data
              // Ensure we only use reviewText (camelCase) for consistency
              // Always prioritize the database value (which contains the HTML)
              reviewText: reviewData?.reviewText || reviewData?.review_text || formik.values.reviewText || '',
              hasDocument: reviewData?.hasDocument || false,
              documentFilename: reviewData?.documentFilename || null,
              documentType: reviewData?.documentType || null,
              dateAdded: reviewData?.dateAdded || null,
              tags: tags
            };
            console.log('ContentDisplay formValues for review:', values);
            console.log('reviewText:', values.reviewText);
            console.log('review_text:', values.review_text);
            return values;
          })()}
          setIsEditing={setIsEditing}
          reviewId={initObj?.id}
        />
      )}
      
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Movie"
        message={`Are you sure you want to delete this movie and all its reviews? This action cannot be undone.`}
        itemType="Movie"
      />
    </div>
  );
};

export default ReviewForm;