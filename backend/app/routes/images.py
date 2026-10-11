import uuid

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)

from sqlalchemy.orm import Session

from backend.app.core.dependencies import (
    get_current_user,
)

from backend.app.core.uploads import (
    UPLOAD_DIR,
    read_image_upload,
)

from backend.app.db.database import get_db

from backend.app.db.models import (
    Image,
    Inspection,
    Prediction,
    Room,
    User,
)

from ml.src.inference import predict_image


router = APIRouter()


@router.post(
    "/rooms/{room_id}/images",
    status_code=status.HTTP_201_CREATED,
)
async def upload_image(
    room_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    # ---------------------------------------------------------
    # Verify room ownership
    # ---------------------------------------------------------

    room = (
        db.query(Room)
        .join(
            Inspection,
            Room.inspection_id ==
            Inspection.id,
        )
        .filter(
            Room.id == room_id,
            Inspection.user_id ==
            current_user.id,
        )
        .first()
    )


    if room is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found",
        )


    # ---------------------------------------------------------
    # Read and validate image
    # ---------------------------------------------------------

    image_bytes, image, file_extension = (
        await read_image_upload(file)
    )


    # ---------------------------------------------------------
    # Run ML inference
    # ---------------------------------------------------------

    result = predict_image(
        image
    )


    # ---------------------------------------------------------
    # Save physical file
    # ---------------------------------------------------------

    unique_filename = (
        f"{uuid.uuid4().hex}{file_extension}"
    )


    (UPLOAD_DIR / unique_filename).write_bytes(
        image_bytes
    )


    image_url = (
        f"/uploads/{unique_filename}"
    )


    # ---------------------------------------------------------
    # Create Image record
    # ---------------------------------------------------------

    new_image = Image(
        room_id=room_id,
        file_path=image_url,
    )


    db.add(new_image)

    db.flush()


    # ---------------------------------------------------------
    # Create Prediction record
    # ---------------------------------------------------------

    new_prediction = Prediction(
        image_id=new_image.id,
        label=result["prediction"],
        confidence=result["confidence"],
        severity=result["severity"],
    )


    db.add(new_prediction)


    room.inspection.status = "completed"


    # ---------------------------------------------------------
    # Save database transaction
    # ---------------------------------------------------------

    db.commit()

    db.refresh(new_image)

    db.refresh(new_prediction)


    # ---------------------------------------------------------
    # Return response
    # ---------------------------------------------------------

    return {

        "image": {

            "id":
                new_image.id,

            "room_id":
                new_image.room_id,

            "file_path":
                new_image.file_path,

            "uploaded_at":
                new_image.uploaded_at,

        },

        "prediction": {

            "id":
                new_prediction.id,

            "label":
                new_prediction.label,

            "confidence":
                new_prediction.confidence,

            "severity":
                new_prediction.severity,

            "created_at":
                new_prediction.created_at,

        },

        "top_predictions":
            result["top_predictions"],

    }