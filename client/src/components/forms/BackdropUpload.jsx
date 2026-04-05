import { useState } from 'react';
import styled, { css } from 'styled-components';
import { Button } from '@styles';
import { FaImage, FaEdit, FaTrash } from 'react-icons/fa';

const Container = styled.div`
  margin: 16px 0;
`;

/** Empty: same treatment as DocumentUpload (readable on light + dark themes). Filled: dark letterbox behind image. */
const Frame = styled.div`
  position: relative;
  width: 100%;
  padding-top: 40%; /* 2.5:1 aspect ratio banner */
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  ${({ $empty }) =>
    $empty
      ? css`
          background-color: var(--background-secondary);
          border: 2px dashed var(--border);
          color: var(--font-color-2);
        `
      : css`
          background: radial-gradient(circle at top left, #222 0%, #111 40%, #050505 100%);
          border: 1px solid var(--border);
          color: rgba(248, 249, 250, 0.92);
        `}
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
  font-size: 0.95rem;
  font-weight: 500;
  text-align: center;
  padding: 12px;
  box-sizing: border-box;
`;

const PlaceholderHint = styled.small`
  font-weight: 400;
  color: var(--font-color-3);
  max-width: 16rem;
  line-height: 1.35;
`;

const IconCircle = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cinema-gold-ultra-light);
  border: 1px solid var(--border);
  color: var(--primary);
  font-size: 1.1rem;
`;

const OverlayLabel = styled.div`
  position: absolute;
  top: 8px;
  left: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(12, 12, 19, 0.72);
  backdrop-filter: blur(6px);
  font-size: 0.8rem;
  color: rgba(248, 249, 250, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.12);
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

function BackdropUpload({
  uploadUrl,
  currentUrl,
  onUploaded,
  onDeleted,
  /** When true, show a remove button (requires `uploadUrl` + persisted image). */
  allowDelete = false,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

  const handleDelete = async () => {
    if (!uploadUrl || !allowDelete) return;
    if (!window.confirm('Remove this review backdrop? The movie backdrop will be used if available.')) {
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(uploadUrl, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Delete failed');
        return;
      }
      setSelectedFile(null);
      setPreviewUrl(null);
      if (onDeleted) onDeleted();
    } catch (err) {
      console.error('Backdrop delete failed:', err);
      setError('Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const displayUrl = previewUrl || currentUrl;

  const showEmpty = !displayUrl;

  return (
    <Container>
      <Frame $empty={showEmpty}>
        {displayUrl && <PreviewImage src={displayUrl} alt="Backdrop preview" />}
        {showEmpty && (
          <Placeholder>
            <IconCircle aria-hidden>
              <FaImage />
            </IconCircle>
            <span>No cover photo</span>
            <PlaceholderHint>Click below to add one</PlaceholderHint>
          </Placeholder>
        )}
        {displayUrl && (
          <OverlayLabel>
            <FaImage style={{ marginRight: 6 }} />
            Review backdrop
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
          onClick={() => document.getElementById('backdrop-upload-input').click()}
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
        {allowDelete && uploadUrl && currentUrl && !previewUrl && (
          <Button
            type="button"
            onClick={handleDelete}
            disabled={deleting || uploading}
            style={{ background: 'rgba(180, 60, 60, 0.25)', borderColor: 'rgba(180, 80, 80, 0.5)' }}
          >
            <FaTrash style={{ marginRight: 6 }} />
            {deleting ? 'Removing…' : 'Remove'}
          </Button>
        )}
        {selectedFile && (
          <span style={{ fontSize: '0.85rem', color: 'var(--font-color-3)' }}>
            {selectedFile.name}
          </span>
        )}
      </Controls>

      {error && <p style={{ color: '#f44336', marginTop: '8px' }}>{error}</p>}
    </Container>
  );
}

export default BackdropUpload;
