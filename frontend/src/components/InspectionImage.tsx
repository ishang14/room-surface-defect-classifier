import { useRef, useState } from "react";

import type {
  InspectionImage as InspectionImageType,
} from "../types/inspection";

import { SERVER_BASE_URL } from "../config";
import { uploadRoomImage } from "../services/api";
import {
  formatPredictionLabel,
  getSeverityStyles,
} from "../utils/inspection";


interface InspectionImageProps {
  image: InspectionImageType;
  roomName: string;
}


function InspectionImage({
  image,
  roomName,
}: InspectionImageProps) {

  const prediction =
    image.prediction;


  const severityStyles =
    prediction
      ? getSeverityStyles(
          prediction.severity
        )
      : null;


  const confidencePercent =
    prediction
      ? prediction.confidence * 100
      : 0;


  return (
    <div>

      {/* Photo */}

      <div className="relative overflow-hidden bg-stone-100">

        <img
          src={`${SERVER_BASE_URL}${image.image_url}`}
          alt={`${roomName} inspection`}
          className="
            h-64
            w-full
            object-cover
            transition
            duration-500
            group-hover:scale-[1.02]
          "
        />


        {/* AI status */}

        {prediction && (

          <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold text-stone-700 shadow-sm backdrop-blur-sm">

            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

            AI ANALYZED

          </div>

        )}

      </div>


      {/* Assessment */}

      {prediction ? (

        <div className="p-4">

          {/* Header */}

          <div className="flex items-start justify-between gap-4">

            <div className="min-w-0">

              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400">
                AI assessment
              </p>


              <h4 className="mt-1 text-base font-bold tracking-tight text-stone-900">
                {formatPredictionLabel(
                  prediction.label
                )}
              </h4>

            </div>


            {/* Severity */}

            <span
              className={`
                inline-flex
                shrink-0
                items-center
                gap-1.5
                rounded-full
                border
                px-2.5
                py-1
                text-[10px]
                font-bold
                ${severityStyles?.badge}
              `}
            >

              <span
                className={`
                  h-1.5
                  w-1.5
                  rounded-full
                  ${severityStyles?.dot}
                `}
              />

              {prediction.severity}

            </span>

          </div>


          {/* Divider */}

          <div className="my-4 border-t border-stone-100" />


          {/* Confidence */}

          <div>

            <div className="flex items-center justify-between">

              <span className="text-xs font-medium text-stone-500">
                Model confidence
              </span>


              <span className="text-xs font-bold text-stone-800">
                {confidencePercent.toFixed(1)}%
              </span>

            </div>


            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100">

              <div
                className="h-full rounded-full bg-stone-800 transition-all duration-500"
                style={{
                  width: `${Math.min(
                    confidencePercent,
                    100
                  )}%`,
                }}
              />

            </div>

          </div>


          {/* Footer */}

          <p className="mt-4 text-[10px] leading-relaxed text-stone-400">
            Classification generated from the uploaded inspection photo.
          </p>

        </div>

      ) : (

        <div className="p-4">

          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400">
            AI assessment
          </p>


          <p className="mt-1 text-sm font-semibold text-stone-500">
            Analysis unavailable
          </p>


          <p className="mt-1 text-xs text-stone-400">
            No prediction was recorded for this photo.
          </p>

        </div>

      )}

    </div>
  );
}


interface UploadImageProps {
  roomId: number;
  onUploaded: () => void;
}


export function UploadImage({
  roomId,
  onUploaded,
}: UploadImageProps) {

  const inputRef =
    useRef<HTMLInputElement | null>(
      null
    );


  const [uploading, setUploading] =
    useState(false);


  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {

    const file =
      event.target.files?.[0];


    if (!file) {
      return;
    }


    try {

      setUploading(true);


      await uploadRoomImage(
        roomId,
        file
      );


      onUploaded();

    } catch (error) {

      console.error(error);

      alert(
        "Failed to upload and analyze image."
      );

    } finally {

      setUploading(false);


      if (inputRef.current) {

        inputRef.current.value = "";

      }

    }

  }


  return (
    <>

      {/* Hidden file input */}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />


      {/* Upload button */}

      <button
        type="button"
        disabled={uploading}
        onClick={() =>
          inputRef.current?.click()
        }
        className="
          inline-flex
          items-center
          gap-2
          rounded-lg
          border
          border-stone-300
          bg-white
          px-4
          py-2.5
          text-sm
          font-semibold
          text-stone-700
          shadow-sm
          transition
          hover:border-stone-400
          hover:bg-stone-50
          active:scale-[0.98]
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >

        {uploading ? (

          <>

            {/* Spinner */}

            <span
              className="
                h-3.5
                w-3.5
                animate-spin
                rounded-full
                border-2
                border-stone-300
                border-t-stone-800
              "
            />


            <span>
              AI analyzing…
            </span>

          </>

        ) : (

          <>

            <span className="text-base leading-none">
              +
            </span>


            <span>
              Upload Photo
            </span>

          </>

        )}

      </button>

    </>
  );
}


export default InspectionImage;