import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import RichTextEditor from '@components/forms/RichTextEditor';
import styled from 'styled-components';
import { StyledForm } from '@styles';
import Error from '@styles/Error';
import { Rating } from '@features/reviews';
import ContentDisplay from '@components/forms/FormSubmit';
import TagInput from '@components/forms/TagInput';
import DeleteConfirmationModal from '@components/feedback/DeleteConfirmationModal';
import { submitFormWithDocument } from '@utils/formSubmit';
import { extractTextFromFile } from '@utils/textExtraction';
import useCrudStateDB from '@hooks/useCrudStateDB';
import { snakeToCamel, invalidateRatingsCache, getJSON } from '@helper';
import { useAdmin } from '@hooks/useAdmin';
import {
  FormDocumentUploadSection,
  FormActionRow,
  buildReviewFormContentDisplayValues,
} from '@components/forms/shared';
import ReviewBackdropSection from '@components/forms/ReviewBackdropSection';

const RatingOverlayWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
`;

const ReviewForm = ({ initObj, movie, onEditingChange }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(!initObj);
  const isEdit = !!initObj; // True if we have an existing review to edit

  useEffect(() => {
    onEditingChange?.(isEditing);
  }, [isEditing, onEditingChange]);
  const [submitError, setSubmitError] = useState(null);
  const [hasDocument, setHasDocument] = useState(initObj?.hasDocument || false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [, setReplaceText] = useState(true);
  const [tags, setTags] = useState(initObj?.tags || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [updatedReview, setUpdatedReview] = useState(null); // Track updated review data
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [backdropKey, setBackdropKey] = useState(initObj?.backdrop || null);
  const { setMovies, setPosts } = useOutletContext();
  const { addToKey, updateKey, deleteItem } = useCrudStateDB(setMovies, 'movies');
  const { isAdmin } = useAdmin();
  const movieId = parseInt(id);

  const initialValues = initObj
    ? {
        rating: initObj.rating || '',
        reviewText: initObj.reviewText || '',
        title: initObj.title || '',
        description: initObj.description || '',
        showReviewBackdrop: initObj.showReviewBackdrop !== false,
      }
    : {
        rating: '',
        reviewText: '',
        title: '',
        description: '',
        showReviewBackdrop: true,
      };

  const _submitToDB = initObj
    ? (body) => updateKey('reviews', initObj.id, body, movieId)
    : (body) => addToKey('reviews', body, movieId);
  void _submitToDB;

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
      .required('Review title is required')
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title must be less than 100 characters'),
    description: Yup.string().max(500, 'Description must be less than 500 characters'),
    rating: Yup.number()
      .required('Rating is required.')
      .min(1, 'Rating must be at least 1.')
      .max(7, 'Rating must be at most 7.'),
    reviewText: Yup.string()
      .test(
        'review-or-document',
        'Either review text or a document is required.',
        function (value) {
          const hasReviewText = value && value.trim().length >= 10;
          return hasDocument || hasReviewText;
        }
      )
      .when([], {
        is: () => hasDocument,
        then: (schema) => schema.optional(),
        otherwise: (schema) =>
          schema.required('Review text is required when no document is uploaded.'),
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
          description: values.description,
          movieId: movieId,
          showReviewBackdrop: values.showReviewBackdrop,
          tags: tags.map((tag) => ({ name: typeof tag === 'string' ? tag : tag.name })),
        };

        console.info('ReviewForm - submitting review', {
          movieId,
          isEdit,
          hasDocument,
          tagCount: tags.length,
        });

        // Submit the review
        const result = await submitFormWithDocument(
          formData,
          selectedFile,
          isEdit,
          initObj?.id
        );

        if (result.success) {
          console.info('ReviewForm - review submitted successfully', {
            id: result.result?.id,
            tagCount: result.result?.tags?.length || 0,
          });

          // Convert snake_case to camelCase
          const camelCaseResult = snakeToCamel(result.result);

          // Update the movies context with the new/updated review
          if (isEdit) {
            // For edits, update the existing review in state
            setUpdatedReview(camelCaseResult);
            // Update initObj for immediate display
            Object.assign(initObj, camelCaseResult);
            // Keep Home "Recent Posts" in sync with latest review fields (e.g., description/backdrop)
            setPosts((prev) =>
              Array.isArray(prev)
                ? prev.map((post) =>
                    post.id === camelCaseResult.id
                      ? { ...post, ...camelCaseResult }
                      : post
                  )
                : prev
            );
          } else {
            // For new reviews, just store the result - no need to call addToKey since we already submitted
            setUpdatedReview(camelCaseResult);
            // Prepend new review to posts list so it appears immediately on Home
            setPosts((prev) =>
              Array.isArray(prev) ? [camelCaseResult, ...prev] : [camelCaseResult]
            );
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
    formik.setFieldValue('rating', rating);
  };

  const handleDocumentUploadSuccess = (result) => {
    setHasDocument(true);

    // Convert snake_case to camelCase
    const review = snakeToCamel(result.review);

    // Don't automatically extract text - let user choose
    formik.setFieldTouched('reviewText', false);

    if (initObj && review) {
      initObj.hasDocument = review.hasDocument;
      initObj.documentFilename = review.documentFilename;
      initObj.documentType = review.documentType;
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
    <>
      {isEditing ? (
        <StyledForm onSubmit={formik.handleSubmit}>
          <h2>{initObj ? 'Update Review' : 'Leave a Review'}</h2>

          <ReviewBackdropSection
            movieBackdropUrl={movie?.backdrop || null}
            uploadUrl={initObj?.id ? `/api/reviews/${initObj.id}/backdrop` : undefined}
            backdropKey={backdropKey}
            reviewPersisted={Boolean(initObj?.id)}
            showReviewBackdrop={formik.values.showReviewBackdrop}
            onShowReviewBackdropChange={(v) =>
              formik.setFieldValue('showReviewBackdrop', v)
            }
            onUploaded={(url) => {
              setBackdropKey(url);
              if (initObj) {
                initObj.backdrop = url;
              }
              setUpdatedReview((prev) => (prev ? { ...prev, backdrop: url } : prev));
              setPosts((prev) =>
                Array.isArray(prev)
                  ? prev.map((post) =>
                      post.id === initObj?.id ? { ...post, backdrop: url } : post
                    )
                  : prev
              );
            }}
            onReviewBackdropDeleted={() => {
              setBackdropKey(null);
              if (initObj) {
                initObj.backdrop = null;
              }
              setUpdatedReview((prev) => (prev ? { ...prev, backdrop: null } : prev));
              setPosts((prev) =>
                Array.isArray(prev)
                  ? prev.map((post) =>
                      post.id === initObj?.id ? { ...post, backdrop: null } : post
                    )
                  : prev
              );
            }}
          />

          {/* Rating Stars */}
          <RatingOverlayWrapper>
            <Rating rating={formik.values.rating} handleStarClick={updateRating} />
            {formik.touched.rating && formik.errors.rating && (
              <Error>{formik.errors.rating}</Error>
            )}
          </RatingOverlayWrapper>

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
            <label htmlFor="description">Review Description</label>
            <textarea
              id="description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Short summary shown in list/card hover..."
              rows="3"
            />
            {formik.touched.description && formik.errors.description && (
              <Error>{formik.errors.description}</Error>
            )}
          </div>

          <FormDocumentUploadSection
            reviewId={initObj?.id || (initObj === null ? 'new' : null)}
            hasDocument={hasDocument}
            selectedFile={selectedFile}
            existingDocumentSource={initObj}
            onUploadSuccess={handleDocumentUploadSuccess}
            onUploadError={handleDocumentUploadError}
            onFileSelect={handleFileSelect}
            onRemoveDocument={() => {
              setHasDocument(false);
              if (initObj) {
                initObj.hasDocument = false;
                initObj.documentFilename = null;
                initObj.documentType = null;
              }
            }}
            onExtractText={handleExtractText}
            isExtracting={isExtracting}
            extractHint="Click to extract text from the uploaded document into the review field below"
          />

          <RichTextEditor
            value={formik.values.reviewText}
            onChange={(value) => formik.setFieldValue('reviewText', value)}
            onBlur={() => formik.setFieldTouched('reviewText', true)}
            placeholder={
              hasDocument
                ? 'Add additional review text (optional)...'
                : 'Write your review here...'
            }
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
          {formik.errors.reviewText && (
            <Error>Review: {formik.errors.reviewText}</Error>
          )}

          <FormActionRow
            marginTop="20px"
            onCancel={() => {
              if (initObj) {
                setIsEditing(false);
              } else {
                navigate(-1);
              }
            }}
            isSubmitting={isSubmitting}
            isEdit={isEdit}
            editText="Save Changes"
            createText="Submit Review"
            deleteConfig={
              isAdmin && initObj
                ? {
                    onClick: () => setShowDeleteModal(true),
                    isDeleting,
                    label: 'Delete Movie',
                    pendingLabel: 'Deleting...',
                  }
                : null
            }
          />
        </StyledForm>
      ) : (
        <ContentDisplay
          formValues={buildReviewFormContentDisplayValues({
            formikValues: formik.values,
            initObj,
            updatedReview,
            tags,
          })}
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
    </>
  );
};

export default ReviewForm;
