"""
Document processing utilities for extracting text and images from PDF and Word documents.
Uses temporary processing for better deployment compatibility.
"""
import os
import uuid
import tempfile
import base64
from typing import Dict, Optional, Tuple, List
from werkzeug.utils import secure_filename
from docx import Document
import PyPDF2
import pdfplumber
from PIL import Image
import io


class DocumentProcessor:
    """Handles processing of uploaded documents (PDF and Word) with temporary file processing."""
    
    ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc'}
    UPLOAD_FOLDER = 'uploads/documents'
    TEMP_FOLDER = tempfile.gettempdir()
    
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
    def extract_images_from_pdf(file_path: str) -> List[Dict[str, str]]:
        """Extract images from PDF and return as base64 encoded strings."""
        images = []
        try:
            with pdfplumber.open(file_path) as pdf:
                for page_num, page in enumerate(pdf.pages):
                    # Extract images from the page
                    page_images = page.images
                    for img_num, img in enumerate(page_images):
                        try:
                            # Get image data
                            img_data = page.crop(img).to_image()
                            if img_data:
                                # Convert to PIL Image
                                pil_img = img_data.original
                                
                                # Convert to base64
                                buffer = io.BytesIO()
                                pil_img.save(buffer, format='PNG')
                                img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
                                
                                images.append({
                                    'page': page_num + 1,
                                    'image_num': img_num + 1,
                                    'data': f"data:image/png;base64,{img_base64}",
                                    'width': pil_img.width,
                                    'height': pil_img.height
                                })
                        except Exception as e:
                            print(f"Error extracting image {img_num} from page {page_num}: {e}")
                            continue
        except Exception as e:
            print(f"Error extracting images from PDF: {e}")
        
        return images
    
    @staticmethod
    def extract_images_from_docx(file_path: str) -> List[Dict[str, str]]:
        """Extract images from Word document and return as base64 encoded strings."""
        images = []
        try:
            doc = Document(file_path)
            for rel in doc.part.rels.values():
                if "image" in rel.target_ref.content_type:
                    try:
                        image_data = rel.target_part.blob
                        img_base64 = base64.b64encode(image_data).decode('utf-8')
                        
                        # Determine image format
                        img_format = 'png'
                        if rel.target_ref.content_type == 'image/jpeg':
                            img_format = 'jpeg'
                        elif rel.target_ref.content_type == 'image/png':
                            img_format = 'png'
                        elif rel.target_ref.content_type == 'image/gif':
                            img_format = 'gif'
                        
                        images.append({
                            'image_num': len(images) + 1,
                            'data': f"data:image/{img_format};base64,{img_base64}",
                            'format': img_format
                        })
                    except Exception as e:
                        print(f"Error processing image in Word doc: {e}")
                        continue
        except Exception as e:
            print(f"Error extracting images from Word document: {e}")
        
        return images
    
    @staticmethod
    def extract_images_from_document(file_path: str, file_type: str) -> List[Dict[str, str]]:
        """Extract images from document based on file type."""
        if file_type == 'pdf':
            return DocumentProcessor.extract_images_from_pdf(file_path)
        elif file_type in ['docx', 'doc']:
            return DocumentProcessor.extract_images_from_docx(file_path)
        else:
            return []
    
    @staticmethod
    def process_uploaded_document_temporary(file) -> Dict[str, any]:
        """
        Process uploaded document using temporary files for better deployment compatibility.
        Extracts text only - simple and reliable approach.
        
        Returns:
            Dict with keys: 'filename', 'file_type', 'extracted_text', 'success'
        """
        if not file or not file.filename:
            return {'success': False, 'error': 'No file provided'}
        
        if not DocumentProcessor.allowed_file(file.filename):
            return {'success': False, 'error': 'File type not allowed'}
        
        file_type = DocumentProcessor.get_file_type(file.filename)
        original_filename = secure_filename(file.filename)
        
        # Create temporary file
        temp_file = None
        try:
            # Create temporary file with proper extension
            temp_fd, temp_path = tempfile.mkstemp(suffix=f'.{file_type}')
            temp_file = os.fdopen(temp_fd, 'wb')
            
            # Save uploaded file to temporary location
            file.seek(0)  # Reset file pointer
            temp_file.write(file.read())
            temp_file.close()
            
            # Extract text only
            extracted_text = DocumentProcessor.extract_text_from_document(temp_path, file_type)
            if not extracted_text.strip():
                return {
                    'success': False, 
                    'error': 'Could not extract text from document',
                    'filename': original_filename,
                    'file_type': file_type
                }
            
            return {
                'success': True,
                'filename': original_filename,
                'file_type': file_type,
                'extracted_text': extracted_text
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Error processing document: {str(e)}'
            }
        finally:
            # Clean up temporary file
            if temp_file:
                temp_file.close()
            if temp_path and os.path.exists(temp_path):
                os.unlink(temp_path)
    
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
