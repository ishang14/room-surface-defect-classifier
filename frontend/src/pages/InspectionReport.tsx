import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import ConditionScore from "../components/ConditionScore";
import { SERVER_BASE_URL } from "../config";
import { getInspection } from "../services/api";

import type {
  Inspection,
} from "../types/inspection";
import {
  calculateConditionScore,
  formatPredictionLabel,
  getSeverityStyles,
} from "../utils/inspection";


function InspectionReport() {

  const { id } =
    useParams();


  const [inspection, setInspection] =
    useState<Inspection | null>(null);


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState<string | null>(null);


  useEffect(() => {

    async function loadInspection() {

      if (!id) {

        setError(
          "Inspection ID is missing."
        );

        setLoading(false);

        return;

      }


      try {

        const data =
          await getInspection(
            Number(id)
          );

        setInspection(data);

      } catch (err) {

        console.error(err);

        setError(
          "Failed to load inspection report."
        );

      } finally {

        setLoading(false);

      }

    }


    loadInspection();

  }, [id]);


  if (loading) {

    return (
      <div className="min-h-screen bg-stone-100 px-4 py-12 text-stone-900">

        <div className="mx-auto max-w-5xl">

          <p className="text-sm text-stone-500">
            Loading report...
          </p>

        </div>

      </div>
    );

  }


  if (error || !inspection) {

    return (
      <div className="min-h-screen bg-stone-100 px-4 py-12 text-stone-900">

        <div className="mx-auto max-w-5xl">

          <p className="text-sm text-red-600">
            {error ?? "Inspection not found."}
          </p>


          <Link
            to="/"
            className="mt-4 inline-block text-sm font-semibold text-orange-700 hover:text-orange-800"
          >
            ← Back to inspection
          </Link>

        </div>

      </div>
    );

  }


  /*
   * ---------------------------------------------------------
   * Report metrics
   * ---------------------------------------------------------
   */

  const allImages =
    inspection.rooms.flatMap(
      (room) => room.images
    );


  const predictedImages =
    allImages.filter(
      (image) =>
        image.prediction !== null
    );


  const photoCount =
    allImages.length;


  const issueImages =
    predictedImages.filter(
      (image) =>
        image.prediction!.severity !== "None"
    );


  const highRiskCount =
    predictedImages.filter(
      (image) =>
        image.prediction!.severity === "High"
    ).length;


  const overallCondition =
    calculateConditionScore(
      allImages
    );


  const formattedDate =
    new Date(
      inspection.created_at
    ).toLocaleDateString(
      "en-CA",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );


  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">

      {/* Header */}

      <header className="border-b border-stone-200 bg-stone-50 print:hidden">

        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-4 sm:px-6">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-900 text-sm font-bold text-white">
              AI
            </div>


            <div>

              <p className="text-sm font-bold text-stone-900">
                Inspection Report
              </p>

              <p className="text-xs text-stone-500">
                AI-powered property assessment
              </p>

            </div>

          </div>


          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() =>
                window.print()
              }
              className="
                hidden
                rounded-lg
                border
                border-stone-300
                bg-white
                px-4
                py-2
                text-sm
                font-semibold
                text-stone-700
                shadow-sm
                transition
                hover:bg-stone-50
                sm:block
              "
            >
              Print / Save PDF
            </button>


            <Link
              to="/"
              className="
                rounded-lg
                border
                border-stone-300
                bg-white
                px-4
                py-2
                text-sm
                font-semibold
                text-stone-700
                shadow-sm
                transition
                hover:bg-stone-50
              "
            >
              ← Dashboard
            </Link>

          </div>

        </div>

      </header>


      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">

        {/* Report heading */}

        <section className="mb-8">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
                Property inspection
              </p>


              <h1 className="mt-2 text-4xl font-bold tracking-tight text-stone-900">
                {inspection.property_name}
              </h1>


              <div className="mt-4 flex flex-wrap items-center gap-3">

                <span className="rounded-full bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white">
                  {inspection.inspection_type ===
                  "move_in"
                    ? "Move-in"
                    : "Move-out"}
                </span>


                <span className="text-xs text-stone-500">
                  Inspection #{inspection.id}
                </span>


                <span className="text-xs text-stone-500">
                  {formattedDate}
                </span>

              </div>

            </div>


            <div className="text-left sm:text-right">

              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                Status
              </p>

              <p className="mt-1 text-sm font-bold capitalize text-stone-800">
                {inspection.status}
              </p>

            </div>

          </div>

        </section>


        {/* Overall condition */}

        <section className="mb-10 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">

          <div className="grid lg:grid-cols-[240px_1fr]">

            <div className="flex items-center justify-center border-b border-stone-200 bg-stone-50 p-8 lg:border-b-0 lg:border-r">

              <ConditionScore
                score={overallCondition}
              />

            </div>


            <div className="p-8">

              <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-700">
                Executive summary
              </p>


              <h2 className="mt-2 text-2xl font-bold tracking-tight text-stone-900">
                Property condition
              </h2>


              <p className="mt-2 max-w-xl text-sm leading-6 text-stone-500">
                This report summarizes the conditions
                identified from the inspection photos
                analyzed by the AI model.
              </p>


              <div className="mt-7 grid grid-cols-2 gap-6 border-t border-stone-200 pt-6 sm:grid-cols-4">

                <div>

                  <p className="text-2xl font-bold text-stone-900">
                    {inspection.rooms.length}
                  </p>

                  <p className="mt-1 text-xs text-stone-500">
                    Rooms
                  </p>

                </div>


                <div>

                  <p className="text-2xl font-bold text-stone-900">
                    {photoCount}
                  </p>

                  <p className="mt-1 text-xs text-stone-500">
                    Photos
                  </p>

                </div>


                <div>

                  <p className="text-2xl font-bold text-stone-900">
                    {issueImages.length}
                  </p>

                  <p className="mt-1 text-xs text-stone-500">
                    Findings
                  </p>

                </div>


                <div>

                  <p
                    className={`
                      text-2xl
                      font-bold
                      ${
                        highRiskCount > 0
                          ? "text-red-600"
                          : "text-stone-900"
                      }
                    `}
                  >
                    {highRiskCount}
                  </p>

                  <p className="mt-1 text-xs text-stone-500">
                    High risk
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* Findings */}

        <section className="mb-10">

          <div className="mb-5">

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
              Evidence review
            </p>


            <h2 className="mt-1 text-2xl font-bold text-stone-900">
              Detected conditions
            </h2>


            <p className="mt-2 text-sm text-stone-500">
              AI findings are shown alongside the
              inspection photos used to identify them.
            </p>

          </div>


          {issueImages.length === 0 ? (

            <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center shadow-sm">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                ✓
              </div>


              <h3 className="mt-4 text-base font-bold text-stone-900">
                No issues detected
              </h3>


              <p className="mt-1 text-sm text-stone-500">
                The analyzed inspection photos did not
                contain any conditions classified as issues.
              </p>

            </div>

          ) : (

            <div className="space-y-5">

              {issueImages.map(
                (image, index) => {

                  const prediction =
                    image.prediction!;


                  const styles =
                    getSeverityStyles(
                      prediction.severity
                    );


                  const room =
                    inspection.rooms.find(
                      (item) =>
                        item.images.some(
                          (roomImage) =>
                            roomImage.id ===
                            image.id
                        )
                    );


                  const imageUrl =
                    `${SERVER_BASE_URL}${image.image_url}`;


                  return (
                    <article
                      key={image.id}
                      className={`
                        overflow-hidden
                        rounded-2xl
                        border
                        border-stone-200
                        border-l-4
                        bg-white
                        shadow-sm
                        ${styles.accent}
                      `}
                    >

                      <div className="grid md:grid-cols-[280px_1fr]">

                        {/* Evidence image */}

                        <div className="relative min-h-64 overflow-hidden bg-stone-100">

                          <img
                            src={imageUrl}
                            alt={`${room?.name ?? "Room"} inspection evidence`}
                            className="
                              h-full
                              min-h-64
                              w-full
                              object-cover
                            "
                          />


                          <span className="absolute left-4 top-4 rounded-full bg-stone-900/85 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                            Evidence {index + 1}
                          </span>

                        </div>


                        {/* Finding details */}

                        <div className="p-6">

                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                            <div>

                              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400">
                                {room?.name ?? "Inspection area"}
                              </p>


                              <h3 className="mt-1 text-xl font-bold tracking-tight text-stone-900">
                                {formatPredictionLabel(
                                  prediction.label
                                )}
                              </h3>

                            </div>


                            <span
                              className={`
                                inline-flex
                                w-fit
                                shrink-0
                                items-center
                                gap-1.5
                                rounded-full
                                border
                                px-3
                                py-1.5
                                text-xs
                                font-bold
                                ${styles.badge}
                              `}
                            >

                              <span
                                className={`
                                  h-1.5
                                  w-1.5
                                  rounded-full
                                  ${styles.dot}
                                `}
                              />

                              {prediction.severity}

                            </span>

                          </div>


                          <div className="mt-6 grid grid-cols-2 gap-6 border-t border-stone-100 pt-5">

                            <div>

                              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                                AI confidence
                              </p>


                              <p className="mt-1 text-lg font-bold text-stone-900">
                                {(
                                  prediction.confidence *
                                  100
                                ).toFixed(1)}
                                %
                              </p>

                            </div>


                            <div>

                              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                                Photo
                              </p>


                              <p className="mt-1 text-lg font-bold text-stone-900">
                                #{index + 1}
                              </p>

                            </div>

                          </div>


                          {/* Confidence bar */}

                          <div className="mt-5">

                            <div className="h-1.5 overflow-hidden rounded-full bg-stone-100">

                              <div
                                className="h-full rounded-full bg-stone-800"
                                style={{
                                  width: `${Math.min(
                                    prediction.confidence *
                                      100,
                                    100
                                  )}%`,
                                }}
                              />

                            </div>

                          </div>


                          <p className="mt-5 text-xs leading-5 text-stone-400">
                            Classification generated from
                            the inspection photo. AI confidence
                            indicates the model's classification
                            probability and does not guarantee
                            correctness.
                          </p>

                        </div>

                      </div>

                    </article>
                  );

                }
              )}

            </div>

          )}

        </section>


        {/* Room breakdown */}

        <section className="mb-10">

          <div className="mb-5">

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
              Inspection areas
            </p>


            <h2 className="mt-1 text-2xl font-bold text-stone-900">
              Room breakdown
            </h2>

          </div>


          <div className="space-y-3">

            {inspection.rooms.map(
              (room) => {

                const roomPredictions =
                  room.images.filter(
                    (image) =>
                      image.prediction !== null
                  );


                const roomScore =
                  calculateConditionScore(
                    room.images
                  );


                const roomIssues =
                  roomPredictions.filter(
                    (image) =>
                      image.prediction!
                        .severity !== "None"
                  ).length;


                return (
                  <div
                    key={room.id}
                    className="
                      flex
                      flex-col
                      gap-5
                      rounded-xl
                      border
                      border-stone-200
                      bg-white
                      p-5
                      shadow-sm
                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                    "
                  >

                    <div>

                      <h3 className="text-sm font-bold text-stone-900">
                        {room.name}
                      </h3>


                      <p className="mt-1 text-xs text-stone-500">
                        {room.images.length}{" "}
                        {room.images.length === 1
                          ? "photo"
                          : "photos"}{" "}
                        ·{" "}
                        {roomPredictions.length}{" "}
                        analyzed
                      </p>

                    </div>


                    <div className="flex items-center gap-7">

                      <div className="text-right">

                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                          Findings
                        </p>

                        <p
                          className={`
                            mt-1
                            text-lg
                            font-bold
                            ${
                              roomIssues > 0
                                ? "text-amber-600"
                                : "text-stone-900"
                            }
                          `}
                        >
                          {roomIssues}
                        </p>

                      </div>


                      <div className="text-right">

                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                          Condition
                        </p>

                        <p className="mt-1 text-lg font-bold text-stone-900">
                          {roomScore === null
                            ? "—"
                            : roomScore}
                        </p>

                      </div>

                    </div>

                  </div>
                );

              }
            )}

          </div>

        </section>


        {/* Report notes */}

        <section className="rounded-2xl border border-stone-200 bg-stone-50 p-6">

          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400">
            Report methodology
          </p>


          <p className="mt-2 max-w-3xl text-xs leading-5 text-stone-500">
            Condition scores are calculated from the
            severity assigned to each AI-detected condition.
            The underlying computer-vision model classifies
            visible conditions from uploaded inspection
            photographs. Results should be reviewed by a
            qualified human before being used for formal
            property-condition or dispute decisions.
          </p>

        </section>


        {/* Footer */}

        <footer className="mt-10 border-t border-stone-200 pt-6">

          <p className="text-center text-[11px] leading-5 text-stone-400">
            Room Surface Defect Classifier · Inspection #
            {inspection.id}
          </p>

        </footer>

      </main>

    </div>
  );
}


export default InspectionReport;