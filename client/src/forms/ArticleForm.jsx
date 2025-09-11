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
import { patchJSONToDb, postJSONToDb, snakeToCamel } from "../helper";

const ArticleForm = ({ initObj }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  // Check if we're creating a new article (no id and no existing article data)
  const isNewArticle = !id && (!initObj || !initObj.id);
  const [isEditing, setIsEditing] = useState(isNewArticle);

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
  const { setMovies } = useOutletContext();

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
      try {
        setSubmitError(null);
        
        // Clean up the rich text content
        const cleanedReviewText = cleanRichText(values.reviewText);
        
        // Prepare the body for article submission
        const body = {
          title: values.title,
          review_text: cleanedReviewText,
          content_type: 'article',
          movie_id: null, // Articles don't have movie_id
          rating: null,   // Articles don't have ratings
          tags: tags,     // Include tags
        };

        // If a file is selected, send empty string
        if (selectedFile && (!cleanedReviewText || cleanedReviewText.trim() === '')) {
          body.review_text = '';
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
          setCreatedArticle(articleData);
          
          // Update the initObj reference if it exists (for existing articles)
          if (initObj !== null) {
            // Preserve existing document data if not in response
            const updatedData = {
              ...articleData,
              hasDocument: result.has_document !== undefined ? result.has_document : initObj.hasDocument,
              documentFilename: result.document_filename || initObj.documentFilename,
              documentType: result.document_type || initObj.documentType,
              documentUrl: initObj.documentUrl // Preserve the document URL
            };
            Object.assign(initObj, updatedData);
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
            <Button type="submit">{initObj ? "Save Changes" : "Create Article"}</Button>
          </div>
        </StyledForm>
      ) : (
        <ContentDisplay
          formValues={{
            ...formik.values,
            ...initObj, // Include all the original article data
            hasDocument: hasDocument || initObj?.hasDocument || initObj?.has_document || false,
            documentFilename: selectedFile?.name || initObj?.documentFilename || initObj?.document_filename || null,
            documentType: selectedFile ? selectedFile.name.split('.').pop().toLowerCase() : (initObj?.documentType || initObj?.document_type || null)
          }}
          setIsEditing={setIsEditing}
          reviewId={createdArticle?.id || initObj?.id}
        />
      )}
    </div>
  );
};

export default ArticleForm;
