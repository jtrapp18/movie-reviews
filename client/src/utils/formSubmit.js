/**
 * Unified form submission logic for both ReviewForm and ArticleForm
 * Simplified approach that reloads page on success
 */

import { snakeToCamel } from '../helper';

/**
 * Clean rich text content by removing empty paragraphs and formatting
 */
export const cleanRichText = (text) => {
  if (!text) return '';
  
  // Remove empty paragraphs and clean up whitespace
  return text
    .replace(/<p><br><\/p>/g, '') // Remove empty paragraphs
    .replace(/<p>\s*<\/p>/g, '') // Remove paragraphs with only whitespace
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};

/**
 * Submit form data to the database
 */
export const submitToDB = async (body, isEdit = false, id = null) => {
  const url = isEdit ? `/api/articles/${id}` : '/api/articles';
  const method = isEdit ? 'PATCH' : 'POST';
  
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to ${isEdit ? 'update' : 'create'} article`);
  }
  
  return await response.json();
};

/**
 * Submit review data to the database
 */
export const submitReviewToDB = async (body, isEdit = false, id = null) => {
  const url = isEdit ? `/api/reviews/${id}` : '/api/reviews';
  const method = isEdit ? 'PATCH' : 'POST';
  
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to ${isEdit ? 'update' : 'create'} review`);
  }
  
  return await response.json();
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
 * Unified form submission with document upload
 * Returns success status and any error message
 */
export const submitFormWithDocument = async (formData, file, isEdit = false, id = null, isArticle = false) => {
  try {
    // Clean the review text
    const cleanedText = cleanRichText(formData.reviewText);
    
    // Prepare the body
    const body = {
      ...formData,
      review_text: cleanedText,
    };

    // Remove empty values
    Object.keys(body).forEach(key => {
      if (body[key] === '' || body[key] === null) {
        delete body[key];
      }
    });

    console.log('submitFormWithDocument - Final body before submission:', body);

    // Submit the main form data
    const result = isArticle 
      ? await submitToDB(body, isEdit, id)
      : await submitReviewToDB(body, isEdit, id);

    // Upload document if file is selected
    if (file && result?.id) {
      try {
        console.log('Attempting document upload for article ID:', result.id);
        const uploadResult = await uploadDocument(file, result.id, true); // Always replace text
        console.log('Document uploaded successfully:', uploadResult);
        
        // The backend has already updated the review/article with the extracted text
        // We need to fetch the updated data
        const endpoint = isArticle ? `/api/articles/${result.id}` : `/api/reviews/${result.id}`;
        const updatedData = await fetch(endpoint).then(res => res.json());
        if (updatedData) {
          // Update the result with the fresh data from the database
          Object.assign(result, updatedData);
        }
      } catch (uploadError) {
        console.error('Document upload failed:', uploadError);
        // Don't throw here - the main form was successful
        // The user can try uploading again
      }
    } else {
      console.log('No file or no result ID for document upload:', { file: !!file, resultId: result?.id });
    }

    return { success: true, result };
  } catch (error) {
    console.error('Form submission failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Submit review with optional document upload in one request
 */
export const submitReviewWithDocument = async (formData, file, isEdit = false, reviewId = null) => {
  try {
    // Prepare form data
    const formDataToSend = new FormData();
    
    // Add review data
    formDataToSend.append('title', formData.title);
    formDataToSend.append('rating', formData.rating);
    formDataToSend.append('review_text', cleanRichText(formData.reviewText));
    formDataToSend.append('movie_id', formData.movieId);
    formDataToSend.append('replace_text', 'true'); // Always replace text with extracted content
    
    // Add tags
    if (formData.tags && formData.tags.length > 0) {
      formDataToSend.append('tags', JSON.stringify(formData.tags.map(tag => ({
        name: typeof tag === 'string' ? tag : tag.name
      }))));
    }
    
    // Add document if provided
    if (file) {
      formDataToSend.append('document', file);
    }
    
    // Choose endpoint
    const url = isEdit ? `/api/reviews_with_document/${reviewId}` : '/api/reviews_with_document';
    const method = isEdit ? 'PATCH' : 'POST';
    
    console.log(`Submitting review with document: ${method} ${url}`);
    
    const response = await fetch(url, {
      method,
      body: formDataToSend,
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        console.error('Could not parse error response as JSON:', e);
      }
      throw new Error(errorMessage);
    }
    
    let result;
    try {
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      result = JSON.parse(responseText);
    } catch (e) {
      console.error('Could not parse response as JSON:', e);
      throw new Error('Invalid JSON response from server');
    }
    
    console.log('Review with document submitted successfully:', result);
    
    return { success: true, result };
  } catch (error) {
    console.error('Review with document submission failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Handle form submission - just submit and return result, no navigation
 */
export const handleFormSubmit = async (formData, file, isEdit = false, id = null, isArticle = false) => {
  const result = await submitFormWithDocument(formData, file, isEdit, id, isArticle);
  return result;
};
