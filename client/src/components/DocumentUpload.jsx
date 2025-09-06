import React, { useState } from 'react';
import styled from 'styled-components';

const UploadContainer = styled.div`
  margin: 20px 0;
  padding: 20px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  text-align: center;
  background-color: #f9f9f9;
  
  &.drag-over {
    border-color: #007bff;
    background-color: #e3f2fd;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const UploadButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  
  &:hover {
    background-color: #0056b3;
  }
`;

const FileInfo = styled.div`
  margin-top: 10px;
  padding: 10px;
  background-color: #e8f5e8;
  border-radius: 4px;
  border: 1px solid #4caf50;
`;

const ErrorMessage = styled.div`
  margin-top: 10px;
  padding: 10px;
  background-color: #ffebee;
  border-radius: 4px;
  border: 1px solid #f44336;
  color: #c62828;
`;

const DocumentActions = styled.div`
  margin-top: 10px;
  display: flex;
  gap: 10px;
  justify-content: center;
`;

const ActionButton = styled.button`
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: #545b62;
  }
  
  &.primary {
    background-color: #28a745;
    
    &:hover {
      background-color: #1e7e34;
    }
  }
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
      className={isDragOver ? 'drag-over' : ''}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h4>📄 Document Upload</h4>
      <p>Upload a PDF or Word document to attach to your review</p>
      
      {existingDocument && (
        <FileInfo>
          <strong>📎 Attached Document:</strong> {existingDocument.document_filename}
          <br />
          <small>Type: {existingDocument.document_type?.toUpperCase()}</small>
          <DocumentActions>
            <ActionButton onClick={handlePreview}>Preview</ActionButton>
            <ActionButton onClick={handleDownload}>Download</ActionButton>
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
            <UploadButton as="span">
              Choose File
            </UploadButton>
          </label>
          
          <p>or drag and drop your file here</p>
          
          {selectedFile && (
            <FileInfo>
              <strong>Selected File:</strong> {selectedFile.name}
              <br />
              <small>Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</small>
              <br />
              <small style={{color: '#28a745'}}>✓ File will be uploaded when you submit the review</small>
              <DocumentActions>
                <ActionButton onClick={clearFile}>Remove File</ActionButton>
              </DocumentActions>
            </FileInfo>
          )}
          
          <CheckboxContainer>
            <small style={{color: '#666'}}>
              💡 Document will be displayed in a viewer below the review
            </small>
          </CheckboxContainer>
        </>
      )}
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </UploadContainer>
  );
};

export default DocumentUpload;
