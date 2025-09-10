import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import mammoth from 'mammoth';




const WordContent = styled.div`
  padding: 20px;
  line-height: 1.6;
  
  img {
    max-width: 100%;
    height: auto;
    margin: 10px 0;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
  }
  
  table, th, td {
    border: 1px solid #ddd;
  }
  
  th, td {
    padding: 8px;
    text-align: left;
  }
  
  p {
    margin: 10px 0;
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #666;
  font-size: 16px;
`;

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

const DocumentViewer = ({ documentUrl, documentType, filename, hasDocument }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wordContent, setWordContent] = useState('');

  // Debug logging
  console.log('DocumentViewer - documentUrl:', documentUrl);
  console.log('DocumentViewer - documentType:', documentType);
  console.log('DocumentViewer - filename:', filename);
  console.log('DocumentViewer - hasDocument:', hasDocument);

  // If no document is attached, don't render anything
  if (!hasDocument || !documentUrl || !documentType) {
    console.log('DocumentViewer - no document attached, not rendering');
    return null;
  }

  useEffect(() => {
    console.log('DocumentViewer useEffect - documentUrl:', documentUrl, 'documentType:', documentType);
    
    if (documentUrl && documentType) {
      console.log('DocumentViewer - calling loadDocument()');
      loadDocument();
    } else {
      console.log('DocumentViewer - missing documentUrl or documentType');
    }
  }, [documentUrl, documentType]);

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
      
      // Log any conversion messages
      if (result.messages.length > 0) {
        console.log('Document conversion messages:', result.messages);
      }
    } catch (err) {
      throw new Error(`Word document loading failed: ${err.message}`);
    }
  };




  console.log('DocumentViewer render - loading:', loading, 'error:', error, 'documentType:', documentType);

  if (loading) {
    console.log('DocumentViewer - rendering loading state');
    return <LoadingMessage>Loading document, please wait...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  return documentType === 'pdf' ? (
    <iframe
      src={`${documentUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH&statusbar=0&messages=0`}
      width="100%"
      height="1200px"
      scrolling="no"
      style={{
        border: 'none',
        display: 'block',
        backgroundColor: 'var(--cinema-black)',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden'
      }}
      title={filename || 'PDF Document'}
    />
  ) : (
    <WordContent
      dangerouslySetInnerHTML={{ __html: wordContent }}
    />
  );
};

export default DocumentViewer;
