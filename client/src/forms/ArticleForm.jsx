import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import { StyledForm, Button } from "../MiscStyling";
import Error from "../styles/Error";
import FormSubmit from "../components/FormSubmit";
import DocumentUpload from "../components/DocumentUpload";
import useCrudStateDB from "../hooks/useCrudStateDB";

const ArticleForm = ({ initObj }) => {
  const { id } = useParams();
  // Check if we're creating a new article (no id and no existing article data)
  const isNewArticle = !id && (!initObj || !initObj.id);
  const [isEditing, setIsEditing] = useState(isNewArticle);
  const [submitError, setSubmitError] = useState(null);
  const [hasDocument, setHasDocument] = useState(initObj?.has_document || false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [replaceText, setReplaceText] = useState(false);
  const [createdArticle, setCreatedArticle] = useState(null); // Store created article data
  const { setMovies } = useOutletContext();
  const { addToKey, updateKey } = useCrudStateDB(setMovies, "articles");

  const initialValues = initObj
    ? {
        title: initObj.title || "",
        reviewText: initObj.reviewText || "",
        contentType: 'article',
      }
    : {
        title: "",
        reviewText: "",
        contentType: 'article',
      };

  const submitToDB = (initObj && initObj.id)
    ? (body) => updateKey("articles", initObj.id, body)
    : (body) => addToKey("articles", body);

  const validationSchema = Yup.object({
    title: Yup.string()
      .required("Article title is required")
      .min(5, "Title must be at least 5 characters")
      .max(200, "Title must be less than 200 characters"),
    reviewText: Yup.string()
      .test('content-or-document', 'Either article content or a document is required.', function(value) {
        const hasContent = value && value.trim().length >= 10;
        return hasDocument || hasContent;
      })
      .when([], {
        is: () => hasDocument,
        then: (schema) => schema.optional(),
        otherwise: (schema) => schema.required("Article content is required when no document is uploaded")
      }),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        
        // Prepare the body for article submission
        const body = {
          title: values.title,
          review_text: values.reviewText,
          content_type: 'article',
          movie_id: null, // Articles don't have movie_id
          rating: null,   // Articles don't have ratings
        };

        // If a file is selected, set placeholder text
        if (selectedFile && !values.reviewText.trim()) {
          body.review_text = 'Document attached - see document viewer below for content.';
        }
        
        const result = await submitToDB(body);
        
        // Update initObj with the newly created article data
        if (result && result.id) {
          // Convert snake_case to camelCase for consistency
          const articleData = {
            id: result.id,
            title: result.title,
            reviewText: result.review_text,
            contentType: result.content_type,
            dateAdded: result.date_added,
            hasDocument: result.has_document || false,
            documentFilename: result.document_filename || null,
            documentType: result.document_type || null,
            tags: result.tags || []
          };
          
          // Store the created article data for new articles
          console.log('Setting createdArticle to:', articleData);
          setCreatedArticle(articleData);
          
          // Update the initObj reference if it exists (for existing articles)
          if (initObj !== null) {
            Object.assign(initObj, articleData);
          }
        }

        // Handle document upload if file is selected
        if (selectedFile && result && result.id) {
          try {
            const formData = new FormData();
            formData.append('document', selectedFile);
            formData.append('review_id', result.id);
            formData.append('replace_text', replaceText);

            const uploadResponse = await fetch('/api/upload_document', {
              method: 'POST',
              body: formData,
            });

            if (uploadResponse.ok) {
              const uploadResult = await uploadResponse.json();
              console.log('Upload successful:', uploadResult);
              handleDocumentUploadSuccess(uploadResult);
            } else {
              const errorData = await uploadResponse.json();
              console.error('Upload failed:', errorData);
              handleDocumentUploadError(errorData.error || 'Upload failed');
            }
          } catch (error) {
            console.error('Upload error:', error);
            handleDocumentUploadError(`Upload failed: ${error.message}`);
          }
        } else if (selectedFile) {
          console.log('No article ID available for document upload');
          handleDocumentUploadError('Article was created but document upload failed - no article ID');
        }

        setIsEditing(false);
      } catch (error) {
        console.error('Article submission error:', error);
        setSubmitError(`Article submission failed: ${error.message}`);
      }
    },
  });

  const handleDocumentUploadSuccess = (result) => {
    setHasDocument(true);
    
    if (result.review && result.review.review_text) {
      formik.setFieldValue("reviewText", result.review.review_text);
    }
    
    formik.setFieldTouched("reviewText", false);
    
    if (initObj && result.review) {
      initObj.hasDocument = result.review.has_document;
      initObj.documentFilename = result.review.document_filename;
      initObj.documentType = result.review.document_type;
    }
    
    // Don't reload the page - just update the form state
    // The form should remain in edit mode after document upload
  };

  const handleDocumentUploadError = (error) => {
    setSubmitError(`Document upload failed: ${error}`);
  };

  const handleFileSelect = (file, replaceTextOption) => {
    console.log('handleFileSelect called with file:', file);
    setSelectedFile(file);
    setReplaceText(replaceTextOption);
    
    if (file) {
      console.log('Setting hasDocument to true');
      setHasDocument(true);
    } else {
      console.log('Setting hasDocument to false');
      setHasDocument(false);
    }
  };

  // Debug logging
  console.log('ArticleForm render - hasDocument:', hasDocument, 'selectedFile:', selectedFile);
  console.log('ArticleForm render - createdArticle:', createdArticle);
  console.log('ArticleForm render - reviewId will be:', createdArticle?.id || initObj?.id);

  return (
    <div>
      {isEditing ? (
        <StyledForm onSubmit={formik.handleSubmit}>
          <h2>{initObj ? "Edit Article" : "Create New Article"}</h2>
          
          {submitError && <Error>{submitError}</Error>}
          
          <div>
            <label htmlFor="title">Article Title *</label>
            <input
              id="title"
              name="title"
              type="text"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter article title..."
            />
            {formik.touched.title && formik.errors.title && (
              <Error>{formik.errors.title}</Error>
            )}
          </div>

          <div>
            <label htmlFor="reviewText">
              Article Content: {hasDocument && <span style={{color: '#28a745', fontSize: '0.9em'}}>(Document uploaded - content optional)</span>}
            </label>
            <ReactQuill
              theme="snow"
              value={formik.values.reviewText}
              onChange={(value) => formik.setFieldValue("reviewText", value)}
              onBlur={() => formik.setFieldTouched("reviewText", true)}
              placeholder={hasDocument ? "Optional: Add additional content here..." : "Write your article content here..."}
              style={{ backgroundColor: 'white', color: 'black' }}
            />
            {formik.touched.reviewText && formik.errors.reviewText && (
              <Error>{formik.errors.reviewText}</Error>
            )}
          </div>

          <DocumentUpload
            reviewId={initObj?.id}
            onUploadSuccess={handleDocumentUploadSuccess}
            onUploadError={handleDocumentUploadError}
            existingDocument={initObj?.has_document}
            onFileSelect={handleFileSelect}
          />
          
          <div style={{ marginTop: '30px', marginBottom: '20px' }}>
            <Button type="submit">{initObj ? "Update Article" : "Create Article"}</Button>
          </div>
        </StyledForm>
      ) : (
        <FormSubmit
          label={"Article Details"}
          formValues={{
            ...formik.values,
            hasDocument: hasDocument,
            documentFilename: selectedFile?.name || null,
            documentType: selectedFile ? selectedFile.name.split('.').pop().toLowerCase() : null
          }}
          setIsEditing={setIsEditing}
          reviewId={createdArticle?.id || initObj?.id}
        />
      )}
    </div>
  );
};

export default ArticleForm;
