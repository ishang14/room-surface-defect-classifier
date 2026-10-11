"""Classify a single image from the command line.

Usage (from the repository root):

    python -m ml.src.run_inference path/to/image.jpg
"""

import sys

from PIL import Image

from ml.src.inference import predict_image


def main():

    if len(sys.argv) != 2:

        sys.exit(
            "Usage: python -m ml.src.run_inference <image_path>"
        )

    image = Image.open(sys.argv[1])

    result = predict_image(image)


    print("\nPrediction Result")
    print("-----------------")

    print("Prediction:", result["prediction"])
    print(f"Confidence: {result['confidence'] * 100:.2f}%")
    print("Severity:", result["severity"])

    print("\nTop 3 predictions:")

    for item in result["top_predictions"]:
        print(
            f"{item['class']:15s}"
            f"{item['confidence'] * 100:.2f}%"
        )


if __name__ == "__main__":
    main()
