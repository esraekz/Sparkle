"""
Supabase Storage Service - Handle image uploads for posts

This service manages image uploads to Supabase Storage:
1. Upload images to 'sparkle_pic' bucket
2. Generate public URLs for uploaded images
3. Handle image compression and validation
4. Delete images when posts are deleted
"""

import logging
import uuid
from typing import Optional
from fastapi import HTTPException, status, UploadFile
from database import supabase

logger = logging.getLogger(__name__)

# Storage bucket name
STORAGE_BUCKET = "sparkle_pic"

# File constraints
MAX_FILE_SIZE = 2 * 1024 * 1024  # 2MB
ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png"]
ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png"]


class StorageService:
    """
    Service for managing image uploads to Supabase Storage.

    Usage:
        storage = StorageService()
        url = await storage.upload_image(file, user_id)
    """

    def __init__(self):
        """Initialize storage service"""
        self.bucket = STORAGE_BUCKET
        logger.info(f"✅ Storage service initialized (bucket: {self.bucket})")

    def _validate_image(self, file: UploadFile) -> None:
        """
        Validate image file type and size.

        Args:
            file: Uploaded file object

        Raises:
            HTTPException: If validation fails
        """
        # Check file extension
        filename = file.filename.lower()
        if not any(filename.endswith(ext) for ext in ALLOWED_EXTENSIONS):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
            )

        # Check MIME type
        if file.content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid content type. Allowed: {', '.join(ALLOWED_MIME_TYPES)}"
            )

    async def upload_image(
        self,
        file: UploadFile,
        user_id: str
    ) -> str:
        """
        Upload image to Supabase Storage and return public URL.

        Args:
            file: Uploaded image file
            user_id: User's UUID (for organizing files)

        Returns:
            Public URL of uploaded image

        Raises:
            HTTPException: If upload fails or validation fails
        """
        try:
            # Validate image
            self._validate_image(file)

            # Read file content
            contents = await file.read()
            file_size = len(contents)

            # Check file size
            if file_size > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024}MB"
                )

            # Generate unique filename
            file_extension = file.filename.split('.')[-1].lower()
            unique_filename = f"{user_id}/{uuid.uuid4()}.{file_extension}"

            logger.info(f"📤 Uploading image: {unique_filename} ({file_size} bytes)")

            # Upload to Supabase Storage
            response = supabase.storage.from_(self.bucket).upload(
                path=unique_filename,
                file=contents,
                file_options={"content-type": file.content_type}
            )

            # Get public URL
            public_url = supabase.storage.from_(self.bucket).get_public_url(unique_filename)

            logger.info(f"✅ Image uploaded successfully: {public_url}")
            return public_url

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Image upload failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload image: {str(e)}"
            )

    async def delete_image(self, image_url: str) -> bool:
        """
        Delete image from Supabase Storage.

        Args:
            image_url: Public URL of image to delete

        Returns:
            True if deleted successfully, False otherwise
        """
        try:
            # Extract filename from URL
            # URL format: https://{project}.supabase.co/storage/v1/object/public/post-images/{filename}
            if not image_url or self.bucket not in image_url:
                logger.warning(f"⚠️  Invalid image URL: {image_url}")
                return False

            # Extract path after bucket name
            parts = image_url.split(f"{self.bucket}/")
            if len(parts) < 2:
                logger.warning(f"⚠️  Could not extract filename from URL: {image_url}")
                return False

            filename = parts[1]

            logger.info(f"🗑️  Deleting image: {filename}")

            # Delete from storage
            supabase.storage.from_(self.bucket).remove([filename])

            logger.info(f"✅ Image deleted successfully: {filename}")
            return True

        except Exception as e:
            logger.error(f"❌ Image deletion failed: {str(e)}")
            return False


# Singleton instance
_storage_service: Optional[StorageService] = None


def get_storage_service() -> StorageService:
    """
    Get or create the global storage service instance.

    Returns:
        Storage service instance
    """
    global _storage_service
    if _storage_service is None:
        _storage_service = StorageService()
    return _storage_service
