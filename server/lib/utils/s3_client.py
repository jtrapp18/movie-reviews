"""
S3 client configuration for MinIO integration with Railway.
Handles file uploads, downloads, and management using boto3.
"""
import os
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from typing import Optional, Dict, Any
import tempfile
import uuid
from werkzeug.utils import secure_filename


class S3Client:
    """S3 client wrapper for MinIO integration."""
    
    def __init__(self):
        """Initialize S3 client with Railway MinIO configuration."""
        self.endpoint_url = os.getenv('MINIO_PUBLIC_ENDPOINT')
        self.access_key = os.getenv('MINIO_ROOT_USER')
        self.secret_key = os.getenv('MINIO_ROOT_PASSWORD')
        self.bucket_name = os.getenv('MINIO_BUCKET', 'documents')  # Default bucket name
        self.use_ssl = True  # Railway MinIO always uses SSL
        
        if not all([self.endpoint_url, self.access_key, self.secret_key, self.bucket_name]):
            raise ValueError("Missing required S3 environment variables")
        
        # Add https:// if not present
        if not self.endpoint_url.startswith('http'):
            self.endpoint_url = f"https://{self.endpoint_url}"
        
        # Initialize boto3 client
        self.client = boto3.client(
            's3',
            endpoint_url=self.endpoint_url,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            use_ssl=self.use_ssl,
            region_name='us-east-1'  # MinIO doesn't care about region
        )
        
        # Ensure bucket exists
        self._ensure_bucket_exists()
    
    def _ensure_bucket_exists(self):
        """Create bucket if it doesn't exist."""
        try:
            # Check if bucket exists
            self.client.head_bucket(Bucket=self.bucket_name)
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == '404':
                # Bucket doesn't exist, create it
                try:
                    self.client.create_bucket(Bucket=self.bucket_name)
                    print(f"✅ Created bucket: {self.bucket_name}")
                except ClientError as create_error:
                    print(f"❌ Failed to create bucket: {create_error}")
                    raise
            else:
                # Some other error
                print(f"❌ Error checking bucket: {e}")
                raise
    
    def upload_file(self, file_obj, object_key: str, content_type: str = None) -> Dict[str, Any]:
        """
        Upload a file to S3.
        
        Args:
            file_obj: File-like object to upload
            object_key: S3 object key (path in bucket)
            content_type: MIME type of the file
            
        Returns:
            Dict with upload result information
        """
        try:
            extra_args = {}
            if content_type:
                extra_args['ContentType'] = content_type
            
            self.client.upload_fileobj(
                file_obj,
                self.bucket_name,
                object_key,
                ExtraArgs=extra_args
            )
            
            return {
                'success': True,
                'object_key': object_key,
                'url': f"{self.endpoint_url}/{self.bucket_name}/{object_key}"
            }
            
        except ClientError as e:
            return {
                'success': False,
                'error': f"S3 upload failed: {str(e)}"
            }
        except Exception as e:
            return {
                'success': False,
                'error': f"Upload failed: {str(e)}"
            }
    
    def download_file(self, object_key: str) -> Dict[str, Any]:
        """
        Download a file from S3.
        
        Args:
            object_key: S3 object key to download
            
        Returns:
            Dict with file data or error
        """
        try:
            response = self.client.get_object(
                Bucket=self.bucket_name,
                Key=object_key
            )
            
            return {
                'success': True,
                'file_data': response['Body'].read(),
                'content_type': response.get('ContentType', 'application/octet-stream'),
                'metadata': response.get('Metadata', {})
            }
            
        except ClientError as e:
            if e.response['Error']['Code'] == 'NoSuchKey':
                return {
                    'success': False,
                    'error': 'File not found'
                }
            return {
                'success': False,
                'error': f"S3 download failed: {str(e)}"
            }
        except Exception as e:
            return {
                'success': False,
                'error': f"Download failed: {str(e)}"
            }
    
    def delete_file(self, object_key: str) -> Dict[str, Any]:
        """
        Delete a file from S3.
        
        Args:
            object_key: S3 object key to delete
            
        Returns:
            Dict with deletion result
        """
        try:
            self.client.delete_object(
                Bucket=self.bucket_name,
                Key=object_key
            )
            
            return {
                'success': True,
                'message': 'File deleted successfully'
            }
            
        except ClientError as e:
            return {
                'success': False,
                'error': f"S3 deletion failed: {str(e)}"
            }
        except Exception as e:
            return {
                'success': False,
                'error': f"Deletion failed: {str(e)}"
            }
    
    def generate_presigned_url(self, object_key: str, expiration: int = 3600) -> Dict[str, Any]:
        """
        Generate a presigned URL for file access.
        
        Args:
            object_key: S3 object key
            expiration: URL expiration time in seconds (default 1 hour)
            
        Returns:
            Dict with presigned URL or error
        """
        try:
            url = self.client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': object_key},
                ExpiresIn=expiration
            )
            
            return {
                'success': True,
                'url': url,
                'expires_in': expiration
            }
            
        except ClientError as e:
            return {
                'success': False,
                'error': f"Failed to generate presigned URL: {str(e)}"
            }
        except Exception as e:
            return {
                'success': False,
                'error': f"URL generation failed: {str(e)}"
            }
    
    def generate_object_key(self, filename: str, review_id: int) -> str:
        """
        Generate a unique S3 object key for a document.
        
        Args:
            filename: Original filename
            review_id: Review ID for organization
            
        Returns:
            S3 object key
        """
        # Create a unique filename to avoid conflicts
        file_ext = os.path.splitext(filename)[1]
        unique_id = str(uuid.uuid4())
        safe_filename = secure_filename(filename)
        base_name = os.path.splitext(safe_filename)[0]
        
        # Mimic the original path structure: uploads/documents/filename
        # But add unique ID to prevent conflicts
        return f"uploads/documents/{unique_id}_{base_name}{file_ext}"
    
    def check_connection(self) -> Dict[str, Any]:
        """
        Test S3 connection and bucket access.
        
        Returns:
            Dict with connection status
        """
        try:
            # Try to list objects in the bucket
            response = self.client.list_objects_v2(
                Bucket=self.bucket_name,
                MaxKeys=1
            )
            
            return {
                'success': True,
                'message': 'S3 connection successful',
                'bucket': self.bucket_name,
                'endpoint': self.endpoint_url
            }
            
        except ClientError as e:
            return {
                'success': False,
                'error': f"S3 connection failed: {str(e)}"
            }
        except Exception as e:
            return {
                'success': False,
                'error': f"Connection test failed: {str(e)}"
            }


# Global S3 client instance
s3_client = None

def get_s3_client() -> S3Client:
    """Get or create S3 client instance."""
    global s3_client
    if s3_client is None:
        s3_client = S3Client()
    return s3_client
