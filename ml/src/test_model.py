"""Smoke test: load the trained weights.

Usage (from the repository root):

    python -m ml.src.test_model
"""

import torch

from ml.src.inference import MODEL_PATH
from ml.src.model import load_model


device = "cuda" if torch.cuda.is_available() else "cpu"

model = load_model(
    MODEL_PATH,
    device=device
)

print("Model loaded successfully!")
print("Device:", device)
print("Model type:", type(model).__name__)
