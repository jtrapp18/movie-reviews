"""
Document processing utilities for extracting text from PDF and Word documents.
"""
import os
import uuid
from typing import Dict, Optional, Tuple
from werkzeug.utils import secure_filename
from docx import Document
import PyPDF2
import pdfplumber


class DocumentProcessor:
    """Handles processing of uploaded documents (PDF and Word)."""
    
    ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc'}
    UPLOAD_FOLDER = 'uploads/documents'
    
    @staticmethod
    def allowed_file(filename: str) -> bool:
        """Check if file extension is allowed."""
        return ('.' in filename and 
                filename.rsplit('.', 1)[1].lower() in DocumentProcessor.ALLOWED_EXTENSIONS)
    
    @staticmethod
    def get_file_type(filename: str) -> str:
        """Get file type from filename."""
        if not filename or '.' not in filename:
            return 'unknown'
        return filename.rsplit('.', 1)[1].lower()
    
    @staticmethod
    def generate_unique_filename(original_filename: str) -> str:
        """Generate a unique filename while preserving extension."""
        if not original_filename:
            return None
        
        # Get file extension
        file_ext = original_filename.rsplit('.', 1)[1].lower() if '.' in original_filename else ''
        
        # Generate unique name
        unique_id = str(uuid.uuid4())
        secure_name = secure_filename(original_filename.rsplit('.', 1)[0])
        
        return f"{secure_name}_{unique_id}.{file_ext}"
    
    @staticmethod
    def extract_text_from_pdf(file_path: str) -> str:
        """Extract text from PDF file using pdfplumber (better text extraction)."""
        try:
            text = ""
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            return text.strip()
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
            # Fallback to PyPDF2
            try:
                with open(file_path, 'rb') as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    text = ""
                    for page in pdf_reader.pages:
                        text += page.extract_text() + "\n"
                    return text.strip()
            except Exception as e2:
                print(f"Error with PyPDF2 fallback: {e2}")
                return ""
    
    @staticmethod
    def extract_text_from_docx(file_path: str) -> str:
        """Extract text from Word document."""
        try:
            doc = Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            print(f"Error extracting text from DOCX: {e}")
            return ""
    
    @staticmethod
    def extract_text_from_document(file_path: str, file_type: str) -> str:
        """Extract text from document based on file type."""
        if file_type == 'pdf':
            return DocumentProcessor.extract_text_from_pdf(file_path)
        elif file_type in ['docx', 'doc']:
            return DocumentProcessor.extract_text_from_docx(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")
    
    @staticmethod
    def process_uploaded_document(file, upload_folder: str) -> Dict[str, str]:
        """
        Process uploaded document and return metadata.
        
        Returns:
            Dict with keys: 'filename', 'file_path', 'file_type', 'extracted_text', 'success'
        """
        if not file or not file.filename:
            return {'success': False, 'error': 'No file provided'}
        
        if not DocumentProcessor.allowed_file(file.filename):
            return {'success': False, 'error': 'File type not allowed'}
        
        # Generate unique filename
        unique_filename = DocumentProcessor.generate_unique_filename(file.filename)
        file_type = DocumentProcessor.get_file_type(file.filename)
        
        # Ensure upload directory exists
        os.makedirs(upload_folder, exist_ok=True)
        
        # Save file
        file_path = os.path.join(upload_folder, unique_filename)
        file.save(file_path)
        
        # Extract text
        try:
            extracted_text = DocumentProcessor.extract_text_from_document(file_path, file_type)
            if not extracted_text.strip():
                return {
                    'success': False, 
                    'error': 'Could not extract text from document',
                    'filename': unique_filename,
                    'file_path': file_path,
                    'file_type': file_type
                }
            
            return {
                'success': True,
                'filename': unique_filename,
                'file_path': file_path,
                'file_type': file_type,
                'extracted_text': extracted_text
            }
            
        except Exception as e:
            # Clean up file if text extraction failed
            if os.path.exists(file_path):
                os.remove(file_path)
            return {
                'success': False,
                'error': f'Error processing document: {str(e)}'
            }
    
    @staticmethod
    def get_document_preview(file_path: str, file_type: str, max_chars: int = 500) -> str:
        """Get a preview of the document content."""
        try:
            full_text = DocumentProcessor.extract_text_from_document(file_path, file_type)
            if len(full_text) <= max_chars:
                return full_text
            return full_text[:max_chars] + "..."
        except Exception as e:
            return f"Error generating preview: {str(e)}"
