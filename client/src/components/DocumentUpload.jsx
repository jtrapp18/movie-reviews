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
  align-items: center;
  
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

const DocumentUpload = ({ reviewId, onUploadSuccess, onUploadError, existingDocument, onFileSelect, onRemoveDocument }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState(null);
  const [replaceText, setReplaceText] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSelectedFilePreview, setShowSelectedFilePreview] = useState(false);
  const [selectedFilePreviewUrl, setSelectedFilePreviewUrl] = useState(null);

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

  const handlePreview = () => {
    setShowPreview(!showPreview);
  };

  const handlePreviewSelectedFile = () => {
    if (!selectedFile) return;
    
    const fileExtension = '.' + selectedFile.name.split('.').pop().toLowerCase();
    
    if (fileExtension === '.pdf') {
      // For PDFs, create an object URL for preview
      const url = URL.createObjectURL(selectedFile);
      setSelectedFilePreviewUrl(url);
      setShowSelectedFilePreview(!showSelectedFilePreview);
    } else {
      // For Word documents, show a message
      alert('Preview for Word documents will be available after upload.');
    }
  };

  const clearFile = () => {
    // Clean up object URL if it exists
    if (selectedFilePreviewUrl) {
      URL.revokeObjectURL(selectedFilePreviewUrl);
      setSelectedFilePreviewUrl(null);
    }
    setSelectedFile(null);
    setError(null);
    setShowSelectedFilePreview(false);
    
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
      
      {existingDocument && !selectedFile && (
        <FileInfo>
          <strong><FaPaperclip /> Attached Document:</strong> {existingDocument.documentFilename}
          <DocumentActions>
            <Button onClick={handlePreview}><FaEye /> Preview</Button>
            <Button onClick={handleDownload}><FaDownload /> Download</Button>
            {onRemoveDocument && (
              <Button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemoveDocument();
                }}
              >
                <FaTimes /> Remove Document
              </Button>
            )}
          </DocumentActions>
        </FileInfo>
      )}
      
      {showPreview && existingDocument && !selectedFile && (
        <div style={{ 
          marginTop: '10px', 
          border: '1px solid var(--cinema-gold)', 
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <iframe
            src={`/api/view_document/${reviewId}#toolbar=0&navpanes=0&scrollbar=0&view=FitH&statusbar=0&messages=0`}
            width="100%"
            height="300px"
            style={{
              border: 'none',
              display: 'block',
              backgroundColor: 'var(--cinema-black)'
            }}
            title="Document Preview"
          />
        </div>
      )}
      
      {(!existingDocument || selectedFile) && (
        <>
          <FileInput
            type="file"
            id="document-upload"
            accept=".pdf,.docx,.doc"
            onChange={handleFileInputChange}
          />
          <Button onClick={() => document.getElementById('document-upload').click()}>
            <FaFileAlt /> Choose File
          </Button>
          
          <p>or drag and drop your file here</p>
          
          {selectedFile && (
            <FileInfo className="selected-file">
              <strong><FaFileAlt /> Selected File:</strong> {selectedFile.name}
              <br />
              <small>Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</small>
              <br />
              <small style={{color: '#28a745'}}><FaCheck /> File will be uploaded when you submit the review</small>
              <DocumentActions>
                <Button onClick={handlePreviewSelectedFile}><FaEye /> Preview</Button>
                <Button onClick={clearFile}><FaTimes /> Remove File</Button>
              </DocumentActions>
            </FileInfo>
          )}
          
          {showSelectedFilePreview && selectedFile && selectedFilePreviewUrl && (
            <div style={{ 
              marginTop: '10px', 
              border: '1px solid var(--cinema-gold)', 
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <iframe
                src={selectedFilePreviewUrl}
                width="100%"
                height="300px"
                style={{
                  border: 'none',
                  display: 'block',
                  backgroundColor: 'var(--cinema-black)'
                }}
                title="Selected File Preview"
              />
            </div>
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
