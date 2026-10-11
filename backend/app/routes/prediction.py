from fastapi import (
    APIRouter,
    Depends,
    File,
    UploadFile,
)

from backend.app.core.dependencies import (
    get_current_user,
)

from backend.app.core.uploads import read_image_upload

from backend.app.db.models import User

from ml.src.inference import predict_image


router = APIRouter()


@router.post("/predict")
async def predict(
    file: UploadFile = File(...),
    current_user: User = Depends(
        get_current_user
    ),
):

    _, image, _ = await read_image_upload(file)

    result = predict_image(image)

    return {
        "filename": file.filename,
        **result,
    }
