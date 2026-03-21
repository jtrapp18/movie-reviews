import styled from 'styled-components';
import { CancelButton, DeleteButton } from '@styles';
import SubmitButton from '@components/forms/SubmitButton';

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  align-items: center;
  margin-top: ${(p) => p.$marginTop};
  margin-bottom: ${(p) => p.$marginBottom};
`;

/**
 * Shared footer row for long-form editors: Cancel, Submit, optional admin Delete.
 * Matches previous ReviewForm / ArticleForm layout (flex, centered, gaps).
 */
function FormActionRow({
  marginTop = '20px',
  marginBottom = '0',
  onCancel,
  isSubmitting,
  isEdit,
  editText = 'Save Changes',
  createText,
  /** When set, shows DeleteButton (e.g. admin + existing entity). */
  deleteConfig = null,
}) {
  return (
    <Row $marginTop={marginTop} $marginBottom={marginBottom}>
      <CancelButton type="button" onClick={onCancel}>
        Cancel
      </CancelButton>
      <SubmitButton
        isSubmitting={isSubmitting}
        isEdit={isEdit}
        editText={editText}
        createText={createText}
      />
      {deleteConfig && (
        <DeleteButton
          type="button"
          onClick={deleteConfig.onClick}
          disabled={deleteConfig.isDeleting}
        >
          {deleteConfig.isDeleting ? deleteConfig.pendingLabel : deleteConfig.label}
        </DeleteButton>
      )}
    </Row>
  );
}

export default FormActionRow;
