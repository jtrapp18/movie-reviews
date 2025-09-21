/**
 * Simplified form submission using existing helper functions
 */

import { postJSONToDb, patchJSONToDb } from '../helper';

/**
 * Submit form with optional document upload
 * All submissions go to the reviews table (articles and reviews use the same model)
 */
export const submitFormWithDocument = async (formData, file, isEdit = false, id = null) => {
  try {
    // Clean up the form data - remove empty values
    const cleanFormData = { ...formData };
    Object.keys(cleanFormData).forEach(key => {
      if (cleanFormData[key] === '' || cleanFormData[key] === null) {
        delete cleanFormData[key];
      }
    });

    console.log('submitFormWithDocument - Form data:', cleanFormData);

    // All submissions go to reviews table - articles and reviews are the same model
    const result = isEdit 
      ? await patchJSONToDb('reviews', id, cleanFormData)
      : await postJSONToDb('reviews', cleanFormData);

    console.log('Form submitted successfully:', result);

    // Handle document upload if file is provided
    if (file && result?.id) {
      try {
        console.log('Uploading document for ID:', result.id);
        await uploadDocument(file, result.id, false);
        console.log('Document uploaded successfully');
      } catch (uploadError) {
        console.error('Document upload failed:', uploadError);
        // Don't fail the whole submission if document upload fails
      }
    }

    return { success: true, result };
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

