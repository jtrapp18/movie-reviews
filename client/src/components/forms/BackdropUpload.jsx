import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '@styles';
import { FaImage, FaEdit } from 'react-icons/fa';

const Container = styled.div`
  margin: 16px 0;
`;

const Frame = styled.div`
  position: relative;
  width: 100%;
  padding-top: 40%; /* 2.5:1 aspect ratio banner */
  border-radius: 10px;
  overflow: hidden;
  background: radial-gradient(circle at top left, #222 0%, #111 40%, #050505 100%);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--font-color-2);
`;

const PreviewImage = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.85);
`;

const Placeholder = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--font-color-2);
  font-size: 0.95rem;
`;

const IconCircle = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  // background: rgba(0, 0, 0, 0.6);
  border: 1px solid var(--border);
`;

const OverlayLabel = styled.div`
  position: absolute;
  top: 8px;
  left: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  // background: rgba(0, 0, 0, 0.6);
  background: var(--background-tertiary);
  font-size: 0.8rem;
  color: var(--font-color-2);
`;

const Controls = styled.div`
  margin-top: 8px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
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
      <Frame>
        {displayUrl && <PreviewImage src={displayUrl} alt="Backdrop preview" />}
        {!displayUrl && (
          <Placeholder>
            <IconCircle>
              <FaImage />
            </IconCircle>
            <span>No cover photo</span>
            <small>Click below to add one</small>
          </Placeholder>
        )}
        {displayUrl && (
          <OverlayLabel>
            <FaImage style={{ marginRight: 6 }} />
            Cover photo
          </OverlayLabel>
        )}
      </Frame>

      <Controls>
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
          <FaEdit style={{ marginRight: 6 }} />
          {displayUrl ? 'Change Image' : 'Choose Image'}
        </Button>
        <Button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
        {selectedFile && (
          <span style={{ fontSize: '0.85rem', color: '#ccc' }}>
            {selectedFile.name}
          </span>
        )}
      </Controls>

      {error && (
        <p style={{ color: '#f44336', marginTop: '8px' }}>{error}</p>
      )}
    </Container>
  );
}

export default BackdropUpload;

