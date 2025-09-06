import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import mammoth from 'mammoth';

const ViewerContainer = styled.div`
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  background-color: white;
`;

const ViewerHeader = styled.div`
  background-color: #f8f9fa;
  padding: 15px 20px;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ViewerTitle = styled.h3`
  margin: 0;
  color: #333;
  font-size: 18px;
`;

const ViewerControls = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const ControlButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: #0056b3;
  }
  
  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.span`
  color: #666;
  font-size: 14px;
`;

const ViewerContent = styled.div`
  background-color: white;
  min-height: 400px;
  position: relative;
  overflow: auto;
`;


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


  const downloadDocument = () => {
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = filename || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  console.log('DocumentViewer render - loading:', loading, 'error:', error, 'documentType:', documentType);

  if (loading) {
    console.log('DocumentViewer - rendering loading state');
    return (
      <ViewerContainer>
        <ViewerHeader>
          <ViewerTitle>Loading Document...</ViewerTitle>
        </ViewerHeader>
        <ViewerContent>
          <LoadingMessage>Loading document, please wait...</LoadingMessage>
        </ViewerContent>
      </ViewerContainer>
    );
  }

  if (error) {
    return (
      <ViewerContainer>
        <ViewerHeader>
          <ViewerTitle>Document Error</ViewerTitle>
        </ViewerHeader>
        <ViewerContent>
          <ErrorMessage>{error}</ErrorMessage>
        </ViewerContent>
      </ViewerContainer>
    );
  }

  return (
    <ViewerContainer>
      <ViewerHeader>
        <ViewerTitle>
          {filename || 'Document Viewer'}
        </ViewerTitle>
        <ViewerControls>
          <ControlButton onClick={downloadDocument}>
            Download
          </ControlButton>
        </ViewerControls>
      </ViewerHeader>
      
      <ViewerContent>
        {documentType === 'pdf' ? (
          <iframe
            src={documentUrl}
            width="100%"
            height="600px"
            style={{ border: 'none' }}
            title={filename || 'PDF Document'}
          />
        ) : (
          <WordContent 
            dangerouslySetInnerHTML={{ __html: wordContent }}
          />
        )}
      </ViewerContent>
    </ViewerContainer>
  );
};

export default DocumentViewer;
