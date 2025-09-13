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
import { handleFormSubmit, submitFormWithDocument, uploadDocument } from "../utils/formSubmit";
import useCrudStateDB from "../hooks/useCrudStateDB";
import { snakeToCamel } from "../helper";

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
  const [contentType, setContentType] = useState(initObj?.contentType || 'review');
  const [tags, setTags] = useState(initObj?.tags || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [updatedReview, setUpdatedReview] = useState(null); // Track updated review data
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
        // Clean up the rich text content
        const cleanedReviewText = cleanRichText(values.reviewText);
        
        // Prepare the body for review submission
        const body = {
          title: values.title,
          rating: values.rating,
          review_text: cleanedReviewText,
          movie_id: movieId,
          tags: tags.map(tag => ({ name: typeof tag === 'string' ? tag : tag.name }))
        };
        
        // Submit the review first
        const result = await submitToDBAsync(body);
        
        if (result && result.id) {
          // Convert snake_case to camelCase
          const camelCaseResult = snakeToCamel(result);
          
          // Update the movies context with the new/updated review
          if (isEdit) {
            updateKey("reviews", initObj.id, camelCaseResult, movieId);
            setUpdatedReview(camelCaseResult);
            // Update initObj for immediate display
            Object.assign(initObj, camelCaseResult);
          } else {
            addToKey("reviews", camelCaseResult, movieId);
            setUpdatedReview(camelCaseResult);
          }
        }
        
        // Handle document upload if file is selected
        if (selectedFile && result && result.id) {
          try {
            const formData = new FormData();
            formData.append('document', selectedFile);
            formData.append('review_id', result.id);
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
        
        // Switch to non-editing mode to show the saved review
        setIsEditing(false);
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
    if (!selectedFile) {
      setSubmitError('No file selected for text extraction');
      return;
    }

    setIsExtracting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('extract_only', 'true'); // Flag to indicate we only want text extraction
      
      const uploadResponse = await fetch('/api/extract_text', {
        method: 'POST',
        body: formData,
      });
      
      if (uploadResponse.ok) {
        const extractResult = await uploadResponse.json();
        console.log('Text extraction successful:', extractResult);
        
        if (extractResult.text) {
          console.log('Setting reviewText to:', extractResult.text);
          formik.setFieldValue("reviewText", extractResult.text);
          // Also update the initObj so it's available in the non-editing view
          if (initObj) {
            initObj.reviewText = extractResult.text;
          }
        }
      } else {
        const errorData = await uploadResponse.json();
        console.error('Text extraction failed:', errorData);
        setSubmitError(errorData.error || 'Text extraction failed');
      }
    } catch (error) {
      console.error('Text extraction error:', error);
      setSubmitError(`Text extraction failed: ${error.message}`);
    } finally {
      setIsExtracting(false);
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
            
            {/* Extract Text Button - only show if document is uploaded and review exists */}
            {hasDocument && initObj?.id && (
              <div style={{ marginTop: '10px', textAlign: 'center' }}>
                <Button
                  type="button"
                  onClick={handleExtractText}
                  disabled={isExtracting}
                  style={{
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: isExtracting ? 'not-allowed' : 'pointer',
                    opacity: isExtracting ? 0.6 : 1
                  }}
                >
                  {isExtracting ? 'Extracting...' : 'Extract Text from Document'}
                </Button>
                <p style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
                  Click to extract text from the uploaded document into the review field below
                </p>
              </div>
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
          formValues={(() => {
            // Use updatedReview if available, otherwise fall back to initObj
            const reviewData = updatedReview || initObj;
            const values = {
              ...formik.values,
              ...reviewData, // Include all review data
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
    </div>
  );
};

export default ReviewForm;