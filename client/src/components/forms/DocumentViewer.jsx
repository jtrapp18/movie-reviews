import { useState, useEffect } from 'react';
import styled from 'styled-components';
import mammoth from 'mammoth';
import RichTextDisplay from './RichTextDisplay';
import Loading from '@components/ui/Loading';
import {
  sha256Hex,
  getCachedEnrichedHtml,
  setCachedEnrichedHtml,
  fetchEnrichedHtml,
  logWordPipeline,
  getEnrichHtmlMarkers,
} from '@utils/enrichedDocCache';

const ErrorMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #dc3545;
  font-size: 16px;
  text-align: center;
  padding: 20px;
`;

const PDFIframe = styled.iframe`
  display: block;
  background-color: var(--cinema-black);
  width: 100%;
  max-width: 100%;
  border-radius: 8px;
  margin-bottom: 10px;
  min-height: 750px;
`;

const WordDocumentContainer = styled.div`
  /* overflow must stay visible: full-bleed images use negative margins + wider width; overflow:auto caused horizontal scroll */
  overflow-x: visible;
  overflow-y: visible;
  min-width: 0;
  width: 100%;
  margin-bottom: 10px;
`;

/**
 * Word: Mammoth → enrich API → RichTextDisplay. Images preserved; semantic classes applied.
 * Cached by SHA-256 of file bytes so repeat views skip Mammoth + enrich.
 */
const DocumentViewer = ({
  documentUrl,
  documentType,
  filename,
  hasDocument,
  /** HTML from DB (main cast + line notes) — prepended before Mammoth body in one RichTextDisplay */
  prependHtml = '',
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wordContent, setWordContent] = useState('');

  const loadDocument = async () => {
    setLoading(true);
    setError(null);

    try {
      if (documentType === 'pdf') {
        setLoading(false);
      } else if (documentType === 'docx' || documentType === 'doc') {
        await loadWordDocument();
      } else {
        setError('Unsupported document type');
      }
    } catch (err) {
      setError(`Failed to load document: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadWordDocument = async () => {
    const response = await fetch(documentUrl);
    if (!response.ok) {
      throw new Error(`Document fetch failed (${response.status})`);
    }
    const arrayBuffer = await response.arrayBuffer();

    let docHash = null;
    try {
      if (typeof crypto !== 'undefined' && crypto.subtle) {
        docHash = await sha256Hex(arrayBuffer);
      }
    } catch {
      docHash = null;
    }

    logWordPipeline('document fetched', {
      documentUrl,
      bytes: arrayBuffer.byteLength,
      hashPrefix: docHash ? `${docHash.slice(0, 12)}…` : '(no hash — cache disabled)',
    });

    if (docHash) {
      const cached = getCachedEnrichedHtml(docHash);
      if (cached) {
        setWordContent(cached);
        return;
      }
    }

    logWordPipeline('cache miss — running mammoth, then enrich API');

    const result = await mammoth.convertToHtml({ arrayBuffer });
    let html = result.value;
    logWordPipeline('after mammoth', getEnrichHtmlMarkers(html));
    html = await fetchEnrichedHtml(html);
    logWordPipeline('final HTML going to RichTextDisplay', getEnrichHtmlMarkers(html));

    if (docHash) {
      setCachedEnrichedHtml(docHash, html);
    }
    setWordContent(html);

    if (result.messages.length > 0) {
      logWordPipeline('Document conversion messages:', result.messages);
    }
  };

  useEffect(() => {
    if (documentUrl && documentType && hasDocument) {
      loadDocument();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadDocument is stable for these deps
  }, [documentUrl, documentType, hasDocument]);

  if (!hasDocument || !documentUrl || !documentType) {
    return null;
  }

  const structuredPrefix = prependHtml || '';
  const showFullPageLoading = loading && !structuredPrefix.trim();

  if (showFullPageLoading) {
    return <Loading text="Loading document, please wait" size="small" />;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  return documentType === 'pdf' ? (
    <PDFIframe
      src={`${documentUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH&statusbar=0&messages=0`}
      title={filename || 'PDF Document'}
    />
  ) : (
    <WordDocumentContainer>
      <RichTextDisplay content={`${structuredPrefix}${wordContent || ''}`} />
    </WordDocumentContainer>
  );
};

export default DocumentViewer;
