import type {
  InspectionImage,
  Severity,
} from "../types/inspection";


/*
 * Application-level condition score per severity.
 *
 * This is separate from the CNN's classification accuracy.
 */

const SEVERITY_SCORE: Record<Severity, number> = {
  None: 100,
  Low: 90,
  Medium: 65,
  High: 30,
};


/**
 * Average condition score (0-100) across the analysed images,
 * or null when none of them has a prediction yet.
 */
export function calculateConditionScore(
  images: InspectionImage[]
): number | null {

  const predictions =
    images.flatMap(
      (image) =>
        image.prediction
          ? [image.prediction]
          : []
    );


  if (predictions.length === 0) {
    return null;
  }


  const total =
    predictions.reduce(
      (sum, prediction) =>
        sum + SEVERITY_SCORE[prediction.severity],
      0
    );


  return Math.round(
    total / predictions.length
  );

}


/** "major_crack" -> "Major Crack" */
export function formatPredictionLabel(
  label: string
) {

  return label
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");

}


export function getSeverityStyles(
  severity: Severity
) {

  switch (severity) {

    case "None":
      return {
        badge:
          "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot:
          "bg-emerald-500",
        accent:
          "border-l-emerald-500",
      };

    case "Low":
      return {
        badge:
          "bg-lime-50 text-lime-700 border-lime-200",
        dot:
          "bg-lime-500",
        accent:
          "border-l-lime-500",
      };

    case "Medium":
      return {
        badge:
          "bg-amber-50 text-amber-700 border-amber-200",
        dot:
          "bg-amber-500",
        accent:
          "border-l-amber-500",
      };

    case "High":
      return {
        badge:
          "bg-red-50 text-red-700 border-red-200",
        dot:
          "bg-red-500",
        accent:
          "border-l-red-500",
      };

    default:
      return {
        badge:
          "bg-stone-50 text-stone-600 border-stone-200",
        dot:
          "bg-stone-400",
        accent:
          "border-l-stone-400",
      };

  }

}
