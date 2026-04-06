/**
 * Text extraction utilities for document processing
 */

/**
 * Apply main_cast / line_notes from extract API into Formik + optional initObj (camel + snake for consumers).
 * @param {Function} formikSetFieldValue
 * @param {Object|null|undefined} initObj
 * @param {{ file_type?: string, main_cast?: string|null, mainCast?: string|null, line_notes?: string|null, lineNotes?: string|null }} extractResult
 */
export function applyExtractedCastAndLineNotes(formikSetFieldValue, initObj, extractResult) {
  const ft = (extractResult.file_type || '').toLowerCase();
  if (ft !== 'docx' && ft !== 'doc') {
    return;
  }

  const mainCast =
    extractResult.main_cast !== undefined
      ? extractResult.main_cast
      : extractResult.mainCast;
  const lineNotes =
    extractResult.line_notes !== undefined
      ? extractResult.line_notes
      : extractResult.lineNotes;

  const mc = mainCast ?? null;
  const ln = lineNotes ?? null;

  formikSetFieldValue('mainCast', mc);
  formikSetFieldValue('lineNotes', ln);

  if (initObj) {
    initObj.mainCast = mc;
    initObj.lineNotes = ln;
    initObj.main_cast = mc;
    initObj.line_notes = ln;
  }
}

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
    formData.append('extract_only', 'true');

    const uploadResponse = await fetch('/api/extract_text', {
      method: 'POST',
      body: formData,
    });

    if (uploadResponse.ok) {
      const extractResult = await uploadResponse.json();
      console.log('Text extraction successful:', extractResult);

      if (extractResult.text) {
        console.log('Setting reviewText to:', extractResult.text);
        formikSetFieldValue('reviewText', extractResult.text);
        if (initObj) {
          initObj.reviewText = extractResult.text;
          initObj.review_text = extractResult.text;
        }
      }

      applyExtractedCastAndLineNotes(formikSetFieldValue, initObj, extractResult);

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
