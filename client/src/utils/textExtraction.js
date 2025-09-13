/**
 * Text extraction utilities for document processing
 */

/**
 * Extract text from a selected file using the backend API
 * @param {File} selectedFile - The file to extract text from
 * @param {Function} setSubmitError - Function to set error messages
 * @param {Function} setIsExtracting - Function to set loading state
 * @param {Function} formikSetFieldValue - Function to update formik field value
 * @param {Object} initObj - Initial object to update with extracted text
 * @returns {Promise<boolean>} - Success status
 */
export const extractTextFromFile = async (
  selectedFile,
  setSubmitError,
  setIsExtracting,
  formikSetFieldValue,
  initObj
) => {
  if (!selectedFile) {
    setSubmitError('No file selected for text extraction');
    return false;
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
        formikSetFieldValue("reviewText", extractResult.text);
        // Also update the initObj so it's available in the non-editing view
        if (initObj) {
          initObj.reviewText = extractResult.text;
        }
      }
      return true;
    } else {
      const errorData = await uploadResponse.json();
      console.error('Text extraction failed:', errorData);
      setSubmitError(errorData.error || 'Text extraction failed');
      return false;
    }
  } catch (error) {
    console.error('Text extraction error:', error);
    setSubmitError(`Text extraction failed: ${error.message}`);
    return false;
  } finally {
    setIsExtracting(false);
  }
};
