import io

from pathlib import Path

from fastapi import (
    HTTPException,
    UploadFile,
    status,
)

from PIL import Image


PROJECT_ROOT = Path(__file__).resolve().parents[3]

UPLOAD_DIR = PROJECT_ROOT / "uploads"


# Largest accepted upload.
MAX_UPLOAD_BYTES = 10 * 1024 * 1024


# Stored extension, chosen from the decoded image format rather than the
# client-supplied filename. Uploads are served back as static files, so a
# user-controlled extension (e.g. ".html") must never reach the disk.
ALLOWED_IMAGE_EXTENSIONS = {
    "JPEG": ".jpg",
    "PNG": ".png",
    "WEBP": ".webp",
    "BMP": ".bmp",
    "GIF": ".gif",
}


async def read_image_upload(
    file: UploadFile,
) -> tuple[bytes, Image.Image, str]:
    """Read and validate an uploaded image.

    Returns the raw bytes, the decoded RGB image and the file extension
    to store it under. Raises 400/413 for invalid or oversized uploads.
    """

    image_bytes = await file.read(
        MAX_UPLOAD_BYTES + 1
    )


    if len(image_bytes) > MAX_UPLOAD_BYTES:

        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail="Image must be 10 MB or smaller",
        )


    try:

        opened = Image.open(
            io.BytesIO(image_bytes)
        )

        image_format = opened.format

        image = opened.convert("RGB")

    except Exception:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image file",
        ) from None


    file_extension = ALLOWED_IMAGE_EXTENSIONS.get(
        image_format
    )


    if file_extension is None:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported image format",
        )


    return image_bytes, image, file_extension
