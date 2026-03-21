import styled from 'styled-components';
import DocumentUpload from '@components/forms/DocumentUpload';
import { ExtractButton } from '@styles';

const ExtractHint = styled.p`
  font-size: 0.9em;
  color: #666;
  margin-top: 5px;
`;

const ExtractWrap = styled.div`
  margin-top: 10px;
  text-align: center;
`;

const DOC_LABEL = 'Document Upload (optional):';

/**
 * Shared document upload + “extract text” block used by ReviewForm and ArticleForm.
 * Parents own Formik state, hasDocument, selectedFile, and handlers — this is presentational only.
 */
function FormDocumentUploadSection({
  reviewId,
  hasDocument,
  selectedFile,
  /** Passed to DocumentUpload as existingDocument when hasDocument (usually initObj). */
  existingDocumentSource,
  onUploadSuccess,
  onUploadError,
  onFileSelect,
  onRemoveDocument,
  onExtractText,
  isExtracting,
  /** Shown under the extract button (e.g. “…into the review field below”). */
  extractHint,
  documentLabel = DOC_LABEL,
}) {
  return (
    <div>
      <label>{documentLabel}</label>
      <DocumentUpload
        reviewId={reviewId}
        onUploadSuccess={onUploadSuccess}
        onUploadError={onUploadError}
        onFileSelect={onFileSelect}
        existingDocument={hasDocument ? existingDocumentSource : null}
        onRemoveDocument={onRemoveDocument}
      />

      {hasDocument && selectedFile && (
        <ExtractWrap>
          <ExtractButton
            type="button"
            onClick={onExtractText}
            disabled={isExtracting}
            isExtracting={isExtracting}
          >
            {isExtracting ? 'Extracting...' : 'Extract Text from Document'}
          </ExtractButton>
          {extractHint ? <ExtractHint>{extractHint}</ExtractHint> : null}
        </ExtractWrap>
      )}
    </div>
  );
}

export default FormDocumentUploadSection;
