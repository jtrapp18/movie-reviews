import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import RichTextEditor from "../components/RichTextEditor";
import { StyledForm, Button } from "../MiscStyling";
import Error from "../styles/Error";
import ContentDisplay from "../components/FormSubmit";
import DocumentUpload from "../components/DocumentUpload";
import TagInput from "../components/TagInput";
import SubmitButton from "../components/SubmitButton";
import { patchJSONToDb, postJSONToDb, snakeToCamel } from "../helper";
import { handleFormSubmit, submitFormWithDocument } from "../utils/formSubmit";
import { extractTextFromFile } from "../utils/textExtraction";
import useCrudStateDB from "../hooks/useCrudStateDB";

const ArticleForm = ({ initObj }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  // Check if we're creating a new article (no id and no existing article data)
  const isNewArticle = !id && (!initObj || !initObj.id);
  const [isEditing, setIsEditing] = useState(isNewArticle);
  const isEdit = !!initObj; // True if we have an existing article to edit

  const [submitError, setSubmitError] = useState(null);
  const [hasDocument, setHasDocument] = useState(initObj?.hasDocument || initObj?.has_document || false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [replaceText, setReplaceText] = useState(false);
  const [createdArticle, setCreatedArticle] = useState(null); // Store created article data
  const [tags, setTags] = useState(initObj?.tags || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const { setMovies, setArticles } = useOutletContext();
  const { addItem, updateItem } = useCrudStateDB(setArticles, "articles");

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

  const submitToDB = async (body) => {
    if (initObj && initObj.id) {
      // Update existing article
      const response = await patchJSONToDb("articles", initObj.id, body);
      return snakeToCamel(response);
    } else {
      // Create new article
      const response = await postJSONToDb("articles", body);
      return snakeToCamel(response);
    }
  };

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
      if (isSubmitting) return; // Prevent double submission
      
      setIsSubmitting(true);
      setSubmitError(null);
      
      try {
        const formData = {
          title: values.title,
          reviewText: values.reviewText,
          content_type: 'article',
          movie_id: null,
          rating: null,
          tags: tags,
        };

        console.log('ArticleForm - Submitting with tags:', tags);

        // Submit the main form data first
        const result = await submitFormWithDocument(formData, selectedFile, isEdit, id, true);
        
        if (result.success) {
          console.log('ArticleForm - API response result:', result.result);
          console.log('ArticleForm - Tags in response:', result.result?.tags);
          
          // Store the created article data for new articles
          if (!isEdit) {
            setCreatedArticle(result.result);
          }
          
          // Update the articles context with the new/updated article
          if (isEdit) {
            updateItem(result.result, initObj.id);
            // Update the initObj reference for existing articles
            if (initObj) {
              Object.assign(initObj, result.result);
            }
          } else {
            addItem(result.result);
          }
          
          // Switch to non-editing mode to show the saved article
          setIsEditing(false);
        } else {
          setSubmitError(result.error);
        }
        
      } catch (error) {
        console.error('Error submitting article:', error);
        setSubmitError(error.message || 'Failed to submit article');
      } finally {
        setIsSubmitting(false);
      }
    },
  });


  const handleDocumentUploadSuccess = (result) => {
    setHasDocument(true);
    
    // Convert snake_case to camelCase
    const review = snakeToCamel(result.review);
    
    if (review && review.reviewText) {
      formik.setFieldValue("reviewText", review.reviewText);
    }
    
    formik.setFieldTouched("reviewText", false);
    
    if (initObj && review) {
      initObj.hasDocument = review.hasDocument;
      initObj.documentFilename = review.documentFilename;
      initObj.documentType = review.documentType;
    }
    // Don't reload the page - just update the form state
    // The form should remain in edit mode after document upload
  };

  const handleExtractText = async () => {
    await extractTextFromFile(
      selectedFile,
      setSubmitError,
      setIsExtracting,
      formik.setFieldValue,
      initObj
    );
  };

  const handleDocumentUploadError = (error) => {
    setSubmitError(`Document upload failed: ${error}`);
  };

  const handleFileSelect = (file, replaceTextOption) => {
    setSelectedFile(file);
    setReplaceText(replaceTextOption);
    
    if (file) {
      setHasDocument(true);
    } else {
      setHasDocument(false);
    }
  };


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

          {/* Document Upload Section */}
          <div>
            <label>Document Upload (optional):</label>
            <DocumentUpload
              reviewId={initObj?.id}
              onUploadSuccess={handleDocumentUploadSuccess}
              onUploadError={handleDocumentUploadError}
              existingDocument={hasDocument ? initObj : null}
              onFileSelect={handleFileSelect}
              onRemoveDocument={() => {
                // Just update local state - persistence will happen on form submit
                setHasDocument(false);
                if (initObj) {
                  initObj.hasDocument = false;
                  initObj.documentFilename = null;
                  initObj.documentType = null;
                }
              }}
            />
            
            {/* Extract Text Button - only show if document is uploaded and article exists */}
            {hasDocument && initObj?.id && (
              <div style={{ marginTop: '10px', textAlign: 'center' }}>
                <Button
                  type="button"
                  onClick={handleExtractText}
                  disabled={isExtracting}
                  style={{
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: isExtracting ? 'not-allowed' : 'pointer',
                    opacity: isExtracting ? 0.6 : 1
                  }}
                >
                  {isExtracting ? 'Extracting...' : 'Extract Text from Document'}
                </Button>
                <p style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
                  Click to extract text from the selected document into the article content field below
                </p>
              </div>
            )}
          </div>

          <RichTextEditor
            value={formik.values.reviewText}
            onChange={(value) => formik.setFieldValue("reviewText", value)}
            onBlur={() => formik.setFieldTouched("reviewText", true)}
            placeholder={hasDocument ? "Optional: Add additional content here..." : "Write your article content here..."}
            hasDocument={hasDocument}
            label="Article Content"
            error={formik.errors.reviewText}
            touched={formik.touched.reviewText}
          />

          <div>
            <label htmlFor="tags">Tags</label>
            <TagInput
              tags={tags}
              onTagsChange={setTags}
              placeholder="Add tags to categorize your article..."
              maxTags={8}
            />
          </div>
          
          <div style={{ marginTop: '30px', marginBottom: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Button type="button" onClick={() => {
              if (initObj) {
                // If editing existing article, just exit edit mode
                setIsEditing(false);
              } else {
                // If creating new article, navigate back
                navigate(-1);
              }
            }}>Cancel</Button>
            <SubmitButton 
              isSubmitting={isSubmitting}
              isEdit={isEdit}
              editText="Save Changes"
              createText="Create Article"
            />
          </div>
        </StyledForm>
      ) : (
        <ContentDisplay
          formValues={(() => {
            const values = {
              ...formik.values,
              ...initObj, // Include all the original article data
              // Ensure we only use reviewText (camelCase) for consistency
              reviewText: formik.values.reviewText || initObj?.reviewText || initObj?.review_text || '',
              hasDocument: hasDocument || initObj?.hasDocument || initObj?.has_document || false,
              documentFilename: selectedFile?.name || initObj?.documentFilename || initObj?.document_filename || null,
              documentType: selectedFile ? selectedFile.name.split('.').pop().toLowerCase() : (initObj?.documentType || initObj?.document_type || null)
            };
            console.log('ContentDisplay formValues:', values);
            console.log('reviewText:', values.reviewText);
            console.log('review_text:', values.review_text);
            return values;
          })()}
          setIsEditing={setIsEditing}
          reviewId={createdArticle?.id || initObj?.id}
        />
      )}
    </div>
  );
};

export default ArticleForm;
