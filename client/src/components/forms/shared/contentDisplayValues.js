/**
 * Build the `formValues` object passed to ContentDisplay (FormSubmit.jsx) for each
 * long-form editor. Merge rules differ slightly between movie reviews and articles.
 */

/**
 * Movie review editor: prefer persisted/updated review fields for HTML body and metadata.
 *
 * @param {object} params
 * @param {object} params.formikValues
 * @param {object|null|undefined} params.initObj
 * @param {object|null|undefined} params.updatedReview
 * @param {Array} params.tags
 */
export function buildReviewFormContentDisplayValues({
  formikValues,
  initObj,
  updatedReview,
  tags,
}) {
  const reviewData = updatedReview || initObj;

  return {
    ...formikValues,
    ...initObj,
    reviewText:
      reviewData?.reviewText ||
      reviewData?.review_text ||
      formikValues.reviewText ||
      '',
    description: reviewData?.description || '',
    hasDocument: reviewData?.hasDocument || false,
    documentFilename: reviewData?.documentFilename || null,
    documentType: reviewData?.documentType || null,
    dateAdded: reviewData?.dateAdded || null,
    mainCast:
      formikValues.mainCast ??
      formikValues.main_cast ??
      reviewData?.mainCast ??
      reviewData?.main_cast ??
      null,
    lineNotes:
      formikValues.lineNotes ??
      formikValues.line_notes ??
      reviewData?.lineNotes ??
      reviewData?.line_notes ??
      null,
    tags,
  };
}

/**
 * Article editor: formik + local document state + initObj snake_case fallbacks.
 *
 * @param {object} params
 * @param {object} params.formikValues
 * @param {object|null|undefined} params.initObj
 * @param {boolean} params.hasDocument
 * @param {File|null|undefined} params.selectedFile
 */
export function buildArticleFormContentDisplayValues({
  formikValues,
  initObj,
  hasDocument,
  selectedFile,
}) {
  return {
    ...formikValues,
    ...initObj,
    reviewText:
      formikValues.reviewText || initObj?.reviewText || initObj?.review_text || '',
    hasDocument: hasDocument || initObj?.hasDocument || initObj?.has_document || false,
    documentFilename:
      selectedFile?.name ||
      initObj?.documentFilename ||
      initObj?.document_filename ||
      null,
    documentType: selectedFile
      ? selectedFile.name.split('.').pop().toLowerCase()
      : initObj?.documentType || initObj?.document_type || null,
    mainCast:
      formikValues.mainCast ??
      formikValues.main_cast ??
      initObj?.mainCast ??
      initObj?.main_cast ??
      null,
    lineNotes:
      formikValues.lineNotes ??
      formikValues.line_notes ??
      initObj?.lineNotes ??
      initObj?.line_notes ??
      null,
  };
}
