import yaml from 'js-yaml';
import gradingYaml from '../../data/gradingSystem.yaml?raw';
import Modal from '@components/shared/Modal';
import { StyledTable } from '@styles';

const gradingContent = yaml.load(gradingYaml);

function Paragraphs({ text }) {
  if (!text) return null;

  const paragraphs = text
    .split(/\n\s*\n/)
    .map((s) => s.trim().replace(/\n/g, ' '))
    .filter(Boolean);

  return (
    <>
      {paragraphs.map((para, index) => (
        <p key={index}>{para}</p>
      ))}
    </>
  );
}

const GradingModal = ({ isOpen, onClose }) => {
  const content = gradingContent.grading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={content.title}
      subtitle={content.systemTitle}
    >
      <Paragraphs text={content.intro} />

      <StyledTable>
        <thead>
          <tr>
            {content.table.headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {content.table.rows.map((row, index) => (
            <tr key={index}>
              <td>
                {row.grade} (Tier {row.tier})
              </td>
              <td>{row.definition}</td>
            </tr>
          ))}
        </tbody>
      </StyledTable>

      <Paragraphs text={content.notes} />

      {content.sections.map((section, index) => (
        <div key={index}>
          <h3>{section.title}</h3>
          <Paragraphs text={section.body} />
        </div>
      ))}
    </Modal>
  );
};

export default GradingModal;
