import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import styled from 'styled-components';

const OptionalText = styled.p`
  color: var(--cinema-gold);
  font-size: 0.9em;
  font-family: var(--default-font);
`;

const RichTextEditor = ({ 
  value, 
  onChange, 
  onBlur, 
  placeholder, 
  hasDocument = false,
  label = "Content",
  error,
  touched,
  id = "reviewText",
  name = "reviewText"
}) => {
  // Standard toolbar configuration for both articles and reviews
  const modules = {
    toolbar: [
      [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'color', 'background',
    'align', 'code-block'
  ];

  return (
    <div>
      <label htmlFor={id}>
        {label}: {hasDocument && <OptionalText>(Document uploaded - content optional)</OptionalText>}
      </label>
      <ReactQuill
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
      />
      {touched && error && (
        <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
