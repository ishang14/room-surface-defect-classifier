import torch
import torch.nn.functional as F

from pathlib import Path
from PIL import Image
from torchvision import transforms

from ml.src.model import CLASS_NAMES, load_model


# --------------------------------------------------
# Paths
# --------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]

MODEL_PATH = (
    PROJECT_ROOT
    / "ml"
    / "models"
    / "room_surface_defect_resnet18.pth"
)


# --------------------------------------------------
# Severity mapping
# --------------------------------------------------

SEVERITY_MAP = {
    "plain": "None",
    "algae": "Low",
    "minor_crack": "Low",
    "stain": "Low",
    "peeling": "Medium",
    "spalling": "Medium",
    "major_crack": "High",
}


# --------------------------------------------------
# Image preprocessing
# --------------------------------------------------

transform = transforms.Compose([
    transforms.Resize((224, 224)),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])


# --------------------------------------------------
# Device
# --------------------------------------------------

device = (
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)


# --------------------------------------------------
# Load model
# --------------------------------------------------

model = load_model(
    MODEL_PATH,
    device=device
)


# --------------------------------------------------
# Prediction
# --------------------------------------------------

def predict_image(image: Image.Image):

    image = image.convert("RGB")

    input_tensor = transform(image)

    input_tensor = (
        input_tensor
        .unsqueeze(0)
        .to(device)
    )

    with torch.no_grad():

        outputs = model(input_tensor)

        probabilities = F.softmax(
            outputs,
            dim=1
        )

    top_probs, top_indices = torch.topk(
        probabilities,
        3
    )

    results = []

    for prob, index in zip(
        top_probs[0],
        top_indices[0]
    ):

        class_name = CLASS_NAMES[
            index.item()
        ]

        results.append({
            "class": class_name,
            "confidence": float(
                prob.item()
            )
        })

    prediction = results[0]["class"]

    confidence = results[0]["confidence"]

    severity = SEVERITY_MAP[
        prediction
    ]

    return {
        "prediction": prediction,
        "confidence": confidence,
        "severity": severity,
        "top_predictions": results,
    }