import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../styles';

const Container = styled.div`
  margin: 16px 0;
  padding: 12px;
  border: 1px dashed var(--cinema-gold);
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.4);
`;

const PreviewImage = styled.img`
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 8px;
`;

const FileInput = styled.input`
  display: none;
`;

function BackdropUpload({ uploadUrl, currentUrl, onUploaded }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const res = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'Upload failed');
        return;
      }

      const newUrl = data.backdrop;
      if (onUploaded && newUrl) {
        onUploaded(newUrl);
      }
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error('Backdrop upload failed:', err);
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const displayUrl = previewUrl || currentUrl;

  return (
    <Container>
      {displayUrl && (
        <PreviewImage src={displayUrl} alt="Backdrop preview" />
      )}

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <FileInput
          id="backdrop-upload-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          onClick={() =>
            document.getElementById('backdrop-upload-input').click()
          }
        >
          Choose Image
        </Button>
        <Button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </div>

      {error && (
        <p style={{ color: '#f44336', marginTop: '8px' }}>{error}</p>
      )}
    </Container>
  );
}

export default BackdropUpload;

