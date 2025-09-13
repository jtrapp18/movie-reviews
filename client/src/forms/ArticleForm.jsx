import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import { StyledForm, Button } from "../MiscStyling";
import Error from "../styles/Error";
import ContentDisplay from "../components/FormSubmit";
import DocumentUpload from "../components/DocumentUpload";
import TagInput from "../components/TagInput";
import SubmitButton from "../components/SubmitButton";
import { patchJSONToDb, postJSONToDb, snakeToCamel } from "../helper";
import { handleFormSubmit, submitFormWithDocument } from "../utils/formSubmit";
import useCrudStateDB from "../hooks/useCrudStateDB";

const ArticleForm = ({ initObj }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  // Check if we're creating a new article (no id and no existing article data)
  const isNewArticle = !id && (!initObj || !initObj.id);
  const [isEditing, setIsEditing] = useState(isNewArticle);
  const isEdit = !!initObj; // True if we have an existing article to edit

  // Suppress ReactQuill findDOMNode warning
  useEffect(() => {
    const originalWarn = console.warn;
    console.warn = (message, ...args) => {
      if (typeof message === 'string' && message.includes('findDOMNode')) {
        return; // Suppress this specific warning
      }
      originalWarn(message, ...args);
    };
    
    return () => {
      console.warn = originalWarn;
    };
  }, []);
  const [submitError, setSubmitError] = useState(null);
  const [hasDocument, setHasDocument] = useState(initObj?.hasDocument || initObj?.has_document || false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [replaceText, setReplaceText] = useState(false);
  const [createdArticle, setCreatedArticle] = useState(null); // Store created article data
  const [tags, setTags] = useState(initObj?.tags || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Function to clean up rich text content
  const cleanRichText = (html) => {
    if (!html) return '';
    
    // Remove empty paragraphs with just line breaks and whitespace
    const cleaned = html
      .replace(/<p><br><\/p>/gi, '') // Remove empty paragraphs
      .replace(/<p><br\/><\/p>/gi, '') // Remove empty paragraphs with self-closing br
      .replace(/<p>\s*<\/p>/gi, '') // Remove paragraphs with only whitespace
      .replace(/<p>&nbsp;<\/p>/gi, '') // Remove paragraphs with non-breaking spaces
      .replace(/<p>\s*&nbsp;\s*<\/p>/gi, '') // Remove paragraphs with whitespace and nbsp
      .trim();
    
    // If only empty tags remain, return empty string
    if (cleaned === '' || cleaned === '<p></p>' || cleaned === '<br>' || cleaned === '<p> </p>') {
      return '';
    }
    
    return cleaned;
  };

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
      // Also update the initObj so it's available in the non-editing view
      if (initObj) {
        initObj.reviewText = review.reviewText;
      }
    }
    
    formik.setFieldTouched("reviewText", false);
    
    if (initObj && review) {
      initObj.hasDocument = review.hasDocument;
      initObj.documentFilename = review.documentFilename;
      initObj.documentType = review.documentType;
    }
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
