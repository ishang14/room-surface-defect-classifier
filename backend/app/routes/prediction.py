import io

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)
from PIL import Image

from backend.app.core.dependencies import (
    get_current_user,
)

from backend.app.db.models import User

from ml.src.inference import predict_image


router = APIRouter()


# Largest accepted upload.
MAX_UPLOAD_BYTES = 10 * 1024 * 1024


@router.post("/predict")
async def predict(
    file: UploadFile = File(...),
    current_user: User = Depends(
        get_current_user
    ),
):

    image_bytes = await file.read(
        MAX_UPLOAD_BYTES + 1
    )


    if len(image_bytes) > MAX_UPLOAD_BYTES:

        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail="Image must be 10 MB or smaller",
        )


    try:

        image = Image.open(
            io.BytesIO(image_bytes)
        ).convert("RGB")

    except Exception:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image file",
        )


    result = predict_image(image)

    return {
        "filename": file.filename,
        **result,
    }
