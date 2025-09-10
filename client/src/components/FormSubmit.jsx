import { StyledSubmit, Button } from '../MiscStyling'
import { camelToProperCase } from '../helper'
import styled from 'styled-components'
import DocumentViewer from './DocumentViewer'

const DocumentInfo = styled.div`
  margin: 10px 0;
  padding: 15px;
  background-color: #e8f5e8;
  border: 1px solid #4caf50;
  border-radius: 8px;
  
  h4 {
    margin: 0 0 10px 0;
    color: #2e7d32;
  }
  
  .document-actions {
    margin-top: 10px;
    display: flex;
    gap: 10px;
  }
  
  .action-button {
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
  }
`;

const FormSubmit = ({ label, formValues, setIsEditing, reviewId }) => {

  const formatPhoneNumber = (phoneNumber) => {
    // Format phone number as (XXX) XXX-XXXX
    return phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  const handleDownload = () => {
    if (reviewId) {
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
        alert(result.error || 'Preview failed');
      }
    } catch (err) {
      alert('Failed to load preview');
    }
  };

  return (
    <StyledSubmit>
        <h1>{label}</h1>
        {Object.entries(formValues).map(([key, value]) => {
          // Skip document-related fields as they'll be shown separately
          if (['hasDocument', 'documentFilename', 'documentType'].includes(key)) {
            return null;
          }
          
          return (
            <div key={key}>
                <label>{camelToProperCase(key)}:</label>
                <p>
                  {key === 'phoneNumber' 
                    ? formatPhoneNumber(value) 
                    : typeof value === "boolean" 
                    ? value.toString() 
                    : value}
                </p>
            </div>
          );
        })}
        
        {/* Debug info */}
        
        {/* Document Viewer */}
        {formValues.hasDocument && formValues.documentFilename && reviewId && (
          <DocumentViewer
            documentUrl={`/api/view_document/${reviewId}`}
            documentType={formValues.documentType}
            filename={formValues.documentFilename}
            hasDocument={formValues.hasDocument}
          />
        )}
        
        {/* Show debug info if document viewer not showing */}
        {!formValues.hasDocument && (
          <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', border: '1px solid #ccc' }}>
            <h4>Debug Info:</h4>
            <p>hasDocument: {String(formValues.hasDocument)}</p>
            <p>documentFilename: {formValues.documentFilename || 'null'}</p>
            <p>documentType: {formValues.documentType || 'null'}</p>
            <p>reviewId: {reviewId || 'null'}</p>
          </div>
        )}
        
        <br />
        <Button 
            type="button" 
            onClick={() => setIsEditing(true)}
        >
            Edit
        </Button>
    </StyledSubmit>
  );
};

export default FormSubmit;