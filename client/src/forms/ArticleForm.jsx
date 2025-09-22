import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import RichTextEditor from "../components/RichTextEditor";
import { StyledForm, Button, DeleteButton, CancelButton, ExtractButton } from "../styles";
import Error from "../styles/Error";
import ContentDisplay from "../components/FormSubmit";
import DocumentUpload from "../components/DocumentUpload";
import TagInput from "../components/TagInput";
import SubmitButton from "../components/SubmitButton";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import { patchJSONToDb, postJSONToDb, snakeToCamel } from "../helper";
import { handleFormSubmit, submitFormWithDocument } from "../utils/formSubmit";
import { extractTextFromFile } from "../utils/textExtraction";
import useCrudStateDB from "../hooks/useCrudStateDB";
import { useAdmin } from "../hooks/useAdmin";

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { setMovies, setArticles } = useOutletContext();
  const { addItem, updateItem, deleteItem } = useCrudStateDB(setArticles, "reviews");
  const { isAdmin } = useAdmin();

  const initialValues = initObj
    ? {
        title: initObj.title || "",
        description: initObj.description || "",
        reviewText: initObj.reviewText || "",
      }
    : {
        title: "",
        description: "",
        reviewText: "",
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

  const handleDelete = async () => {
    if (!initObj || !initObj.id) return;
    
    setIsDeleting(true);
    try {
      // Call the API directly to ensure it completes before updating state
      const response = await fetch(`/api/articles/${initObj.id}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Use the CRUD hook to update the frontend state
        deleteItem(initObj.id);
        
        // Navigate back to the articles list
        navigate('/#/articles');
      } else {
        const errorData = await response.json();
        setSubmitError(errorData.error || 'Failed to delete article');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      setSubmitError('Failed to delete article');
    } finally {
      setIsDeleting(false);
    }
  };

  const validationSchema = Yup.object({
    title: Yup.string()
      .required("Article title is required")
      .min(5, "Title must be at least 5 characters")
      .max(200, "Title must be less than 200 characters"),
    description: Yup.string()
      .max(500, "Description must be less than 500 characters"),
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
        // Only send the fields we want to update - no document fields
        const formData = {
          title: values.title,
          description: values.description,
          reviewText: values.reviewText,
          movie_id: null,
          rating: null,
          tags: tags,
        };

        console.log('ArticleForm - Submitting with tags:', tags);
        console.log('ArticleForm - Starting submission...');

        // Submit the main form data first
        const result = await submitFormWithDocument(formData, selectedFile, isEdit, id);
        
        console.log('ArticleForm - Submission completed, success:', result.success);
        
        if (result.success) {
          console.log('ArticleForm - API response ID:', result.result?.id);
          console.log('ArticleForm - Tags count:', result.result?.tags?.length || 0);
          
          // Store the created article data for new articles
          if (!isEdit) {
            setCreatedArticle(result.result);
            // Navigate to the new article's detail page
            navigate(`/articles/${result.result.id}`);
          }
          
          // Update the articles context with the new/updated article
          if (isEdit) {
            // Don't call updateItem - the form submission already updated the database
            // updateItem(result.result, initObj.id);
            // Update the initObj reference for existing articles
            if (initObj) {
              Object.assign(initObj, result.result);
            }
            // Switch to non-editing mode to show the updated article
            setIsEditing(false);
          }
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
    <>
      {isEditing ? (
        <StyledForm onSubmit={formik.handleSubmit}>
          <h1>{initObj ? "Edit Article" : "Create New Article"}</h1>
          
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
            <label htmlFor="description">Article Description</label>
            <textarea
              id="description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter a brief description of your article..."
              rows="3"
            />
            {formik.touched.description && formik.errors.description && (
              <Error>{formik.errors.description}</Error>
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
            
            {/* Extract Text Button - show if document is uploaded */}
            {hasDocument && selectedFile && (
              <div style={{ marginTop: '10px', textAlign: 'center' }}>
                <ExtractButton
                  type="button"
                  onClick={handleExtractText}
                  disabled={isExtracting}
                  isExtracting={isExtracting}
                >
                  {isExtracting ? 'Extracting...' : 'Extract Text from Document'}
                </ExtractButton>
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
          
          <div style={{ 
            marginTop: '30px', 
            marginBottom: '20px', 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: '10px', 
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <CancelButton type="button" onClick={() => {
              if (initObj) {
                // If editing existing article, just exit edit mode
                setIsEditing(false);
              } else {
                // If creating new article, navigate back
                navigate(-1);
              }
            }}>Cancel</CancelButton>
            <SubmitButton 
              isSubmitting={isSubmitting}
              isEdit={isEdit}
              editText="Save Changes"
              createText="Create Article"
            />
            {isAdmin && initObj && (
              <DeleteButton 
                type="button" 
                onClick={() => setShowDeleteModal(true)}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Article'}
              </DeleteButton>
            )}
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
            return values;
          })()}
          setIsEditing={setIsEditing}
          reviewId={createdArticle?.id || initObj?.id}
        />
      )}
      
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Article"
        message={`Are you sure you want to delete this article? This action cannot be undone.`}
        itemType="Article"
      />
    </>
  );
};

export default ArticleForm;
