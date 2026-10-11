from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import (
    Session,
    joinedload,
)

from backend.app.core.dependencies import (
    get_current_user,
)

from backend.app.db.database import get_db

from backend.app.db.models import (
    Image,
    Inspection,
    Room,
    User,
)

from backend.app.schemas.inspection import (
    InspectionCreate,
    InspectionDetailResponse,
    InspectionResponse,
)


router = APIRouter()


@router.post(
    "/inspections",
    response_model=InspectionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_inspection(
    inspection: InspectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    new_inspection = Inspection(
        user_id=current_user.id,
        property_name=inspection.property_name,
        inspection_type=inspection.inspection_type,
        status="created",
    )


    db.add(new_inspection)

    db.commit()

    db.refresh(new_inspection)


    return new_inspection


@router.get(
    "/inspections",
    response_model=list[InspectionResponse],
)
def get_inspections(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    inspections = (
        db.query(Inspection)
        .filter(
            Inspection.user_id ==
            current_user.id
        )
        .order_by(
            Inspection.created_at.desc()
        )
        .all()
    )


    return inspections


@router.get(
    "/inspections/{inspection_id}",
    response_model=InspectionDetailResponse,
)
def get_inspection(
    inspection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    inspection = (
        db.query(Inspection)
        .options(
            joinedload(
                Inspection.rooms
            )
            .joinedload(
                Room.images
            )
            .joinedload(
                Image.prediction
            )
        )
        .filter(
            Inspection.id == inspection_id,
            Inspection.user_id == current_user.id,
        )
        .first()
    )


    if inspection is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inspection not found",
        )


    rooms = []


    for room in inspection.rooms:

        images = []


        for image in room.images:

            image_data = {
                "id": image.id,
                "image_url": image.file_path,
                "uploaded_at": image.uploaded_at,
                "prediction": image.prediction,
            }


            images.append(
                image_data
            )


        rooms.append(
            {
                "id": room.id,
                "name": room.name,
                "images": images,
            }
        )


    return {
        "id": inspection.id,
        "user_id": inspection.user_id,
        "property_name": inspection.property_name,
        "inspection_type": inspection.inspection_type,
        "status": inspection.status,
        "created_at": inspection.created_at,
        "rooms": rooms,
    }