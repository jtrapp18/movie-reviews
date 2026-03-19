import { useState, useEffect } from 'react';
import styled from 'styled-components';
import mammoth from 'mammoth';
import RichTextDisplay from './RichTextDisplay';
import Loading from '@components/ui/Loading';

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
  // border-radius: 8px;
  overflow: auto;
  margin-bottom: 10px;
`;

const DocumentViewer = ({ documentUrl, documentType, filename, hasDocument }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wordContent, setWordContent] = useState('');

  const loadDocument = async () => {
    console.log('DocumentViewer - loadDocument called');
    setLoading(true);
    setError(null);

    try {
      if (documentType === 'pdf') {
        console.log('DocumentViewer - PDF will be loaded via iframe');
        setLoading(false);
      } else if (documentType === 'docx' || documentType === 'doc') {
        console.log('DocumentViewer - loading Word document');
        await loadWordDocument();
      } else {
        console.log('DocumentViewer - unsupported document type:', documentType);
        setError('Unsupported document type');
      }
    } catch (err) {
      console.log('DocumentViewer - error loading document:', err);
      setError(`Failed to load document: ${err.message}`);
    } finally {
      console.log('DocumentViewer - loadDocument finished, setting loading to false');
      setLoading(false);
    }
  };

  const loadWordDocument = async () => {
    try {
      const response = await fetch(documentUrl);
      const arrayBuffer = await response.arrayBuffer();

      const result = await mammoth.convertToHtml({ arrayBuffer });
      setWordContent(result.value);

      if (result.messages.length > 0) {
        console.log('Document conversion messages:', result.messages);
      }
    } catch (err) {
      throw new Error(`Word document loading failed: ${err.message}`);
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

  if (loading) return <Loading text="Loading document, please wait" size="small" />;

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
      <RichTextDisplay content={wordContent} />
    </WordDocumentContainer>
  );
};

export default DocumentViewer;
