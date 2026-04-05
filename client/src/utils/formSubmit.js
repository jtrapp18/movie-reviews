/**
 * Simplified form submission using existing helper functions
 */

import { postJSONToDb, patchJSONToDb } from '@helper';
import { devDebug } from './logger.js';

/**
 * Submit form with optional document upload
 * All submissions go to the reviews table (articles and reviews use the same model)
 */
export const submitFormWithDocument = async (
  formData,
  file,
  isEdit = false,
  id = null
) => {
  try {
    // Clean up the form data - remove empty values
    const cleanFormData = { ...formData };
    Object.keys(cleanFormData).forEach((key) => {
      if (cleanFormData[key] === '' || cleanFormData[key] === null) {
        delete cleanFormData[key];
      }
    });

    devDebug('[formSubmit] submitting review', {
      isEdit,
      id,
      hasDocument: !!file,
      showReviewBackdrop: formData.showReviewBackdrop,
      hasShowReviewBackdropKey: Object.prototype.hasOwnProperty.call(
        cleanFormData,
        'showReviewBackdrop'
      ),
    });

    // All submissions go to reviews table - articles and reviews are the same model
    const result = isEdit
      ? await patchJSONToDb('reviews', id, cleanFormData)
      : await postJSONToDb('reviews', cleanFormData);

    devDebug('[formSubmit] review saved', { id: result?.id });

    // Handle document upload if file is provided
    let mergedResult = result;
    if (file && mergedResult?.id) {
      try {
        devDebug('[formSubmit] uploading document', { id: mergedResult.id });
        const uploadJson = await uploadDocument(file, mergedResult.id, false);
        devDebug('[formSubmit] document uploaded');
        // Upload response includes full review with main_cast / line_notes; PATCH alone does not.
        if (uploadJson?.review && typeof uploadJson.review === 'object') {
          mergedResult = { ...mergedResult, ...uploadJson.review };
        }
      } catch (uploadError) {
        console.error('Document upload failed:', uploadError);
        // Don't fail the whole submission if document upload fails
      }
    }

    return { success: true, result: mergedResult };
  } catch (error) {
    console.error('Form submission failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Upload document for a review/article
 */
export const uploadDocument = async (file, reviewId, replaceText = true) => {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('review_id', reviewId);
  formData.append('replace_text', replaceText.toString());

  const response = await fetch('/api/upload_document', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Document upload failed');
  }

  return await response.json();
};

/**
 * Handle form submission - just submit and return result, no navigation
 */
export const handleFormSubmit = async (formData, file, isEdit = false, id = null) => {
  const result = await submitFormWithDocument(formData, file, isEdit, id);
  return result;
};
