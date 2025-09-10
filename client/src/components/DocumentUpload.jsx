import React, { useState } from 'react';
import styled from 'styled-components';
import { FaFileUpload, FaFileAlt, FaPaperclip, FaCheck, FaLightbulb, FaEye, FaDownload, FaTimes } from 'react-icons/fa';
import { Button } from '../MiscStyling';

const UploadContainer = styled.div`
  margin: 20px 0;
  padding: 20px;
  border: 2px dashed var(--cinema-gold);
  background-color: var(--cinema-gray);
  border-radius: 8px;
  text-align: center;
  color: var(--cinema-gold);
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  
  &.drag-over {
    border-color: var(--cinema-gold-dark);
    background-color: var(--cinema-black);
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileInfo = styled.div`
  margin-top: 10px;
  padding: 8px 12px;
  opacity: 0.8;
  border-radius: 4px;
  border: 1px solid var(--cinema-gold);
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
  color: var(--cinema-gold);
`;

const ErrorMessage = styled.div`
  margin-top: 10px;
  padding: 10px;
  background-color: rgba(244, 67, 54, 0.1);
  border-radius: 4px;
  border: 1px solid #f44336;
  color: #f44336;
`;

const DocumentActions = styled.div`
  margin-top: 8px;
  display: flex;
  gap: 8px;
  justify-content: center;
`;

const CheckboxContainer = styled.div`
  margin: 10px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const DocumentUpload = ({ reviewId, onUploadSuccess, onUploadError, existingDocument, onFileSelect }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState(null);
  const [replaceText, setReplaceText] = useState(false);

  const allowedTypes = ['.pdf', '.docx', '.doc'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    setError(null);
    
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      setError(`Please select a PDF or Word document (.pdf, .docx, .doc)`);
      return;
    }
    
    // Check file size
    if (file.size > maxFileSize) {
      setError(`File size must be less than 10MB`);
      return;
    }
    
    setSelectedFile(file);
    
    // Notify parent component about file selection
    if (onFileSelect) {
      onFileSelect(file, replaceText);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };


  const handleDownload = () => {
    if (existingDocument) {
      window.open(`/api/download_document/${reviewId}`, '_blank');
    }
  };

  const handlePreview = async () => {
    if (!reviewId) return;
    
    try {
      const response = await fetch(`/api/document_preview/${reviewId}`);
      const result = await response.json();
      
      if (response.ok) {
        // Show preview in a modal or new window
        const previewWindow = window.open('', '_blank', 'width=800,height=600');
        previewWindow.document.write(`
          <html>
            <head><title>Document Preview</title></head>
            <body>
              <h2>Document Preview: ${result.filename}</h2>
              <div style="white-space: pre-wrap; font-family: Arial, sans-serif; padding: 20px;">
                ${result.preview}
              </div>
            </body>
          </html>
        `);
      } else {
        setError(result.error || 'Preview failed');
      }
    } catch (err) {
      setError('Failed to load preview');
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
    
    // Notify parent component that file was cleared
    if (onFileSelect) {
      onFileSelect(null, replaceText);
    }
  };

  return (
    <UploadContainer
      className={isDragOver ? 'drag-over upload-container' : 'upload-container'}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h4><FaFileUpload /> Document Upload</h4>
      <p>Upload a PDF or Word document to attach to your review</p>
      
      {existingDocument && (
        <FileInfo>
          <strong><FaPaperclip /> Attached Document:</strong> {existingDocument.document_filename}
          <br />
          <small>Type: {existingDocument.document_type?.toUpperCase()}</small>
          <DocumentActions>
            <Button onClick={handlePreview}><FaEye /> Preview</Button>
            <Button onClick={handleDownload}><FaDownload /> Download</Button>
          </DocumentActions>
        </FileInfo>
      )}
      
      {!existingDocument && (
        <>
          <FileInput
            type="file"
            id="document-upload"
            accept=".pdf,.docx,.doc"
            onChange={handleFileInputChange}
          />
          <label htmlFor="document-upload">
            <Button as="span">
              <FaFileAlt /> Choose File
            </Button>
          </label>
          
          <p>or drag and drop your file here</p>
          
          {selectedFile && (
            <FileInfo className="selected-file">
              <strong><FaFileAlt /> Selected File:</strong> {selectedFile.name}
              <br />
              <small>Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</small>
              <br />
              <small style={{color: '#28a745'}}><FaCheck /> File will be uploaded when you submit the review</small>
              <DocumentActions>
                <Button onClick={clearFile}><FaTimes /> Remove File</Button>
              </DocumentActions>
            </FileInfo>
          )}
          
          <CheckboxContainer>
            <small style={{color: 'var(--cinema-gold)'}}>
              <FaLightbulb /> Document will be displayed in a viewer below the review
            </small>
          </CheckboxContainer>
        </>
      )}
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </UploadContainer>
  );
};

export default DocumentUpload;
