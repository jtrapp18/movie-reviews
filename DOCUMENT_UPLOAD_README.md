# Document Upload Feature for Movie Reviews

This feature allows users to upload PDF and Word documents as movie reviews, with automatic text extraction and document management.

## 🚀 Quick Setup

1. **Install Dependencies:**
   ```bash
   python setup_document_support.py
   ```

2. **Manual Setup (if needed):**
   ```bash
   # Install Python packages
   pip install -r requirements.txt
   
   # Run database migration
   cd server
   python -m flask db upgrade
   cd ..
   
   # Create upload directory
   mkdir -p server/uploads/documents
   ```

## 📋 Features

### ✅ What's Included

- **Multi-format Support**: PDF (.pdf) and Word documents (.docx, .doc)
- **Automatic Text Extraction**: Extracts text from uploaded documents
- **Document Preview**: View document content without downloading
- **Document Download**: Download original documents
- **Drag & Drop Upload**: Easy file upload interface
- **File Validation**: Size limits (10MB) and type checking
- **Database Integration**: Stores document metadata with reviews

### 🔧 Technical Details

#### Backend (Flask)
- **Document Processing**: Uses `python-docx` for Word docs and `pdfplumber`/`PyPDF2` for PDFs
- **File Storage**: Documents stored in `server/uploads/documents/`
- **API Endpoints**:
  - `POST /api/upload_document` - Upload and process documents
  - `GET /api/download_document/<review_id>` - Download documents
  - `GET /api/document_preview/<review_id>` - Get document preview

#### Frontend (React)
- **Upload Component**: `DocumentUpload.jsx` with drag & drop support
- **Integration**: Seamlessly integrated into `ReviewForm.jsx`
- **User Experience**: Preview, download, and replace text options

#### Database Schema
New fields added to `reviews` table:
- `has_document` (Boolean) - Whether review has attached document
- `document_filename` (String) - Original filename
- `document_path` (String) - Server file path
- `document_type` (String) - File type (pdf, docx, etc.)

## 🎯 Usage

### For Users
1. **Create/Edit Review**: Go to any movie's review page
2. **Upload Document**: Use the document upload section
3. **Choose Options**:
   - Upload new document
   - Replace existing review text with document content
   - Preview document before uploading
4. **Manage Documents**: Download or preview existing documents

### For Developers

#### Upload a Document
```javascript
const formData = new FormData();
formData.append('document', file);
formData.append('review_id', reviewId);
formData.append('replace_text', 'true');

fetch('/api/upload_document', {
  method: 'POST',
  body: formData
});
```

#### Get Document Preview
```javascript
fetch(`/api/document_preview/${reviewId}`)
  .then(response => response.json())
  .then(data => console.log(data.preview));
```

## 🔒 Security & Validation

- **File Type Validation**: Only PDF and Word documents allowed
- **Size Limits**: Maximum 10MB per file
- **Secure Filenames**: UUID-based unique filenames prevent conflicts
- **Path Validation**: Prevents directory traversal attacks

## 📁 File Structure

```
movie-reviews/
├── server/
│   ├── lib/
│   │   └── utils/
│   │       └── document_processor.py  # Document processing logic
│   ├── uploads/
│   │   └── documents/                 # Uploaded documents storage
│   └── migrations/
│       └── versions/
│           └── add_document_fields_to_reviews.py
├── client/
│   └── src/
│       └── components/
│           └── DocumentUpload.jsx     # Upload component
└── setup_document_support.py         # Setup script
```

## 🐛 Troubleshooting

### Common Issues

1. **"No module named flask" error**:
   ```bash
   cd server
   pip install flask
   ```

2. **Database migration fails**:
   ```bash
   cd server
   python -m flask db upgrade
   ```

3. **Upload directory not found**:
   ```bash
   mkdir -p server/uploads/documents
   ```

4. **Document preview not working**:
   - Check if document file exists in uploads directory
   - Verify file permissions

### File Size Issues
- Default limit is 10MB
- To change: Modify `maxFileSize` in `DocumentUpload.jsx`
- Also update Flask's `MAX_CONTENT_LENGTH` if needed

## 🔄 Migration from Existing Reviews

Existing reviews will work normally. The new document fields are optional and default to `false`/`null`.

## 🚀 Future Enhancements

- **OCR Support**: Extract text from scanned PDFs
- **Document Templates**: Pre-defined review templates
- **Batch Upload**: Upload multiple documents at once
- **Document Versioning**: Keep multiple versions of documents
- **Search Integration**: Search within document content
- **Document Annotations**: Add comments to documents

## 📞 Support

If you encounter issues:
1. Check the browser console for JavaScript errors
2. Check the server logs for Python errors
3. Verify file permissions on uploads directory
4. Ensure all dependencies are installed correctly
