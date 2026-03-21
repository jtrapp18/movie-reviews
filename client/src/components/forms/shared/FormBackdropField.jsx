import BackdropUpload from '@components/forms/BackdropUpload';

const DEFAULT_LABEL = 'Backdrop Image (optional):';

/**
 * Backdrop upload for an existing review/article (requires persisted entity id).
 * `uploadUrl` is the POST base, e.g. `/api/reviews/123/backdrop` — view URL is derived as `${uploadUrl}/view`.
 */
function FormBackdropField({
  /** When absent, nothing is rendered (e.g. new entity without id yet). */
  uploadUrl,
  backdropKey,
  onUploaded,
  label = DEFAULT_LABEL,
}) {
  if (!uploadUrl) {
    return null;
  }

  const currentUrl = backdropKey
    ? `${uploadUrl}/view?v=${encodeURIComponent(backdropKey)}`
    : null;

  return (
    <div>
      <label>{label}</label>
      <BackdropUpload
        uploadUrl={uploadUrl}
        currentUrl={currentUrl}
        onUploaded={onUploaded}
      />
    </div>
  );
}

export default FormBackdropField;
