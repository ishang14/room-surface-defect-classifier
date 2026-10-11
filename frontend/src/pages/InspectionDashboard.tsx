import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import RoomCard from "../components/RoomCard";
import ConditionScore from "../components/ConditionScore";
import NewInspectionModal from "../components/NewInspectionModal";
import AddRoomModal from "../components/AddRoomModal";

import {
  createInspection,
  createRoom,
  getInspection,
  getInspections,
} from "../services/api";

import type {
  CreatedInspection,
  Inspection,
  InspectionType,
  Room,
} from "../types/inspection";


function InspectionDashboard() {

  const navigate = useNavigate();


  const [
    inspections,
    setInspections,
  ] = useState<CreatedInspection[]>([]);


  const [
    selectedInspectionId,
    setSelectedInspectionId,
  ] = useState<number | null>(null);


  const [
    inspection,
    setInspection,
  ] = useState<Inspection | null>(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  const [
    showNewInspectionModal,
    setShowNewInspectionModal,
  ] = useState(false);


  const [
    showAddRoomModal,
    setShowAddRoomModal,
  ] = useState(false);


  /*
   * ---------------------------------------------------------
   * Load all inspections
   * ---------------------------------------------------------
   */

  async function loadInspections() {

    try {

      setLoading(true);
      setError("");

      const data =
        await getInspections();

      setInspections(data);


      if (data.length > 0) {

        setSelectedInspectionId(
          (currentId) => {

            const stillExists =
              currentId !== null &&
              data.some(
                (item) =>
                  item.id === currentId
              );

            return stillExists
              ? currentId
              : data[0].id;
          }
        );

      } else {

        setSelectedInspectionId(null);
        setInspection(null);

      }

    } catch (error) {

      console.error(
        "Failed to load inspections:",
        error
      );

      setError(
        "Unable to load inspections."
      );

    } finally {

      setLoading(false);

    }
  }


  /*
   * ---------------------------------------------------------
   * Load selected inspection
   * ---------------------------------------------------------
   */

  async function loadInspection(
    inspectionId: number
  ) {

    try {

      setError("");

      const data =
        await getInspection(
          inspectionId
        );

      setInspection(data);

    } catch (error) {

      console.error(
        "Failed to load inspection:",
        error
      );

      setError(
        "Unable to load inspection."
      );

    }
  }


  /*
   * ---------------------------------------------------------
   * Initial load
   * ---------------------------------------------------------
   */

  useEffect(() => {

    // Fetch-on-mount: the setState calls happen after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInspections();

  }, []);


  /*
   * ---------------------------------------------------------
   * Load inspection whenever selection changes
   * ---------------------------------------------------------
   */

  useEffect(() => {

    if (
      selectedInspectionId === null
    ) {

      return;

    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInspection(
      selectedInspectionId
    );

  }, [selectedInspectionId]);


  /*
   * ---------------------------------------------------------
   * Create inspection
   * ---------------------------------------------------------
   */

  async function handleCreateInspection(
    propertyName: string,
    inspectionType: InspectionType
  ) {

    try {

      setError("");

      const created =
        await createInspection(
          propertyName,
          inspectionType
        );


      setShowNewInspectionModal(
        false
      );


      await loadInspections();


      setSelectedInspectionId(
        created.id
      );

    } catch (error) {

      console.error(
        "Failed to create inspection:",
        error
      );

      setError(
        "Unable to create inspection."
      );

    }
  }


  /*
   * ---------------------------------------------------------
   * Add room
   * ---------------------------------------------------------
   */

  async function handleAddRoom(
    name: string
  ) {

    if (
      selectedInspectionId === null
    ) {

      return;

    }


    try {

      setError("");

      await createRoom(
        selectedInspectionId,
        name
      );


      setShowAddRoomModal(
        false
      );


      await loadInspection(
        selectedInspectionId
      );

    } catch (error) {

      console.error(
        "Failed to create room:",
        error
      );

      setError(
        "Unable to add room."
      );

    }
  }


  /*
   * ---------------------------------------------------------
   * Logout
   * ---------------------------------------------------------
   */

  function handleLogout() {

    localStorage.removeItem(
      "access_token"
    );

    navigate("/login");

  }


  /*
   * ---------------------------------------------------------
   * Dashboard statistics
   * ---------------------------------------------------------
   */

  const statistics =
    useMemo(() => {

      if (!inspection) {

        return {
          photoCount: 0,
          predictedImages: 0,
          issueCount: 0,
          highRiskCount: 0,
          overallCondition: null,
        };

      }


      const allImages =
        inspection.rooms.flatMap(
          (room) =>
            room.images
        );


      const predictedImages =
        allImages.filter(
          (image) =>
            image.prediction !== null
        );


      const issues =
        predictedImages.filter(
          (image) =>
            image.prediction?.severity !==
            "None"
        );


      const highRisk =
        predictedImages.filter(
          (image) =>
            image.prediction?.severity ===
            "High"
        );


      /*
       * Application-level condition score.
       *
       * This is separate from the CNN's
       * classification accuracy.
       */

      let overallCondition:
        number | null = null;


      if (
        predictedImages.length > 0
      ) {

        const severityScore = {
          None: 100,
          Low: 90,
          Medium: 65,
          High: 30,
        };


        const totalScore =
          predictedImages.reduce(
            (
              total,
              image
            ) => {

              const severity =
                image.prediction?.severity;


              return (
                total +
                (
                  severity
                    ? severityScore[
                        severity
                      ]
                    : 0
                )
              );

            },
            0
          );


        overallCondition =
          totalScore /
          predictedImages.length;

      }


      return {

        photoCount:
          allImages.length,

        predictedImages:
          predictedImages.length,

        issueCount:
          issues.length,

        highRiskCount:
          highRisk.length,

        overallCondition:
          overallCondition !== null
            ? Math.round(
                overallCondition
              )
            : null,

      };

    }, [inspection]);


  /*
   * ---------------------------------------------------------
   * Loading state
   * ---------------------------------------------------------
   */

  if (loading) {

    return (
      <div className="min-h-screen bg-stone-100">

        <Navbar
          onNewInspection={() =>
            setShowNewInspectionModal(
              true
            )
          }
          onLogout={
            handleLogout
          }
        />


        <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

          <div className="flex min-h-[50vh] items-center justify-center">

            <div className="text-center">

              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-orange-700" />

              <p className="mt-4 text-sm text-stone-500">
                Loading inspection workspace...
              </p>

            </div>

          </div>

        </main>

      </div>
    );

  }


  return (
    <div className="min-h-screen bg-stone-100">

      {/* --------------------------------------------------- */}
      {/* Navbar */}
      {/* --------------------------------------------------- */}

      <Navbar
        onNewInspection={() =>
          setShowNewInspectionModal(
            true
          )
        }
        onLogout={
          handleLogout
        }
      />


      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ------------------------------------------------- */}
        {/* Error */}
        {/* ------------------------------------------------- */}

        {error && (

          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">

            <p className="text-sm font-medium text-red-700">
              {error}
            </p>

          </div>

        )}


        {/* ------------------------------------------------- */}
        {/* Empty state */}
        {/* ------------------------------------------------- */}

        {inspections.length === 0 ? (

          <div className="flex min-h-[70vh] items-center justify-center">

            <div className="max-w-lg text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-900 text-lg font-bold text-white">
                AI
              </div>


              <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-orange-700">
                Inspection workspace
              </p>


              <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
                Start your first inspection
              </h2>


              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-stone-500">
                Create an inspection, add rooms, and
                upload property photos. The AI model
                will analyze visible conditions and
                organize the findings for you.
              </p>


              <button
                onClick={() =>
                  setShowNewInspectionModal(
                    true
                  )
                }
                className="
                  mt-8
                  rounded-lg
                  bg-orange-700
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-orange-800
                  active:scale-[0.98]
                "
              >
                + Create inspection
              </button>

            </div>

          </div>

        ) : (

          <>
            {/* --------------------------------------------- */}
            {/* Inspection header */}
            {/* --------------------------------------------- */}

            <section className="mb-8">

              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

                <div>

                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700">
                    Inspection workspace
                  </p>


                  <h2 className="mt-2 text-3xl font-bold tracking-tight text-stone-900">
                    {inspection?.property_name ||
                      "Inspection"}
                  </h2>


                  {inspection && (

                    <div className="mt-3 flex flex-wrap items-center gap-3">

                      <span className="rounded-full bg-stone-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-stone-600">

                        {
                          inspection.inspection_type ===
                          "move_in"
                            ? "Move in"
                            : "Move out"
                        }

                      </span>


                      <span className="text-sm text-stone-400">
                        •
                      </span>


                      <span className="text-sm text-stone-500">

                        {
                          inspection.status ===
                          "completed"
                            ? "Analysis complete"
                            : "In progress"
                        }

                      </span>

                    </div>

                  )}

                </div>


                <div className="flex flex-col gap-3 sm:flex-row">

                  {inspection && (

                    <Link
                      to={`/inspections/${inspection.id}/report`}
                      className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-lg
                        bg-stone-900
                        px-4
                        py-2.5
                        text-sm
                        font-semibold
                        text-white
                        shadow-sm
                        transition
                        hover:bg-stone-800
                        active:scale-[0.98]
                      "
                    >

                      <span>
                        View Report
                      </span>


                      <span className="text-base leading-none">
                        →
                      </span>

                    </Link>

                  )}


                  {inspections.length > 1 && (

                    <select
                      value={
                        selectedInspectionId ??
                        ""
                      }
                      onChange={(event) =>
                        setSelectedInspectionId(
                          Number(
                            event.target.value
                          )
                        )
                      }
                      className="
                        rounded-lg
                        border
                        border-stone-300
                        bg-white
                        px-4
                        py-2.5
                        text-sm
                        font-medium
                        text-stone-700
                        outline-none
                        focus:border-orange-600
                        focus:ring-2
                        focus:ring-orange-600/10
                      "
                    >

                      {inspections.map(
                        (item) => (

                          <option
                            key={item.id}
                            value={item.id}
                          >
                            {
                              item.property_name
                            }
                          </option>

                        )
                      )}

                    </select>

                  )}

                </div>

              </div>

            </section>


            {/* --------------------------------------------- */}
            {/* Statistics */}
            {/* --------------------------------------------- */}

            <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">

              <StatCard
                label="Photos"
                value={
                  statistics.photoCount
                }
                description="Uploaded inspection photos"
              />


              <StatCard
                label="AI analyzed"
                value={
                  statistics.predictedImages
                }
                description="Photos processed by AI"
              />


              <StatCard
                label="Issues found"
                value={
                  statistics.issueCount
                }
                description="Visible conditions detected"
              />


              <StatCard
                label="High risk"
                value={
                  statistics.highRiskCount
                }
                description="High-severity findings"
              />

            </section>


            {/* --------------------------------------------- */}
            {/* Condition overview */}
            {/* --------------------------------------------- */}

            <section className="mb-8 overflow-hidden rounded-2xl border border-stone-200 bg-white">

              <div className="grid lg:grid-cols-[260px_1fr]">

                <div className="flex items-center justify-center border-b border-stone-200 px-6 py-8 lg:border-b-0 lg:border-r">

                  <ConditionScore
                    score={
                      statistics.overallCondition
                    }
                  />

                </div>


                <div className="p-6 sm:p-8">

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

                    <div>

                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">
                        Property condition
                      </p>


                      <h3 className="mt-2 text-xl font-bold text-stone-900">
                        Overall assessment
                      </h3>

                    </div>


                    {statistics.predictedImages >
                      0 && (

                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        AI analysis available
                      </span>

                    )}

                  </div>


                  <p className="mt-5 max-w-2xl text-sm leading-6 text-stone-500">

                    {statistics.predictedImages ===
                    0
                      ? "Upload photos to begin AI-powered condition analysis."
                      : statistics.highRiskCount >
                        0
                      ? "High-severity findings require attention. Review the evidence and generated report before making a final assessment."
                      : statistics.issueCount >
                        0
                      ? "The AI detected visible conditions that may require review. Open the inspection report to examine the evidence."
                      : "No visible defects have been identified in the analyzed photos."}

                  </p>


                  <div className="mt-7 grid grid-cols-2 gap-6 sm:grid-cols-3">

                    <div>

                      <p className="text-2xl font-bold text-stone-900">
                        {
                          statistics.predictedImages
                        }
                      </p>

                      <p className="mt-1 text-xs text-stone-500">
                        Photos analyzed
                      </p>

                    </div>


                    <div>

                      <p className="text-2xl font-bold text-stone-900">
                        {
                          statistics.issueCount
                        }
                      </p>

                      <p className="mt-1 text-xs text-stone-500">
                        Findings
                      </p>

                    </div>


                    <div>

                      <p className="text-2xl font-bold text-stone-900">
                        {
                          statistics.highRiskCount
                        }
                      </p>

                      <p className="mt-1 text-xs text-stone-500">
                        High severity
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </section>


            {/* --------------------------------------------- */}
            {/* Rooms */}
            {/* --------------------------------------------- */}

            <section>

              <div className="mb-5 flex items-center justify-between">

                <div>

                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">
                    Property areas
                  </p>


                  <h3 className="mt-1 text-xl font-bold text-stone-900">
                    Rooms
                  </h3>

                </div>


                {inspection && (

                  <button
                    onClick={() =>
                      setShowAddRoomModal(
                        true
                      )
                    }
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
                      transition
                      hover:border-stone-400
                      hover:bg-stone-50
                    "
                  >
                    + Add room
                  </button>

                )}

              </div>


              {inspection &&
              inspection.rooms.length > 0 ? (

                <div className="space-y-5">

                  {inspection.rooms.map(
                    (room: Room) => (

                      <RoomCard
                        key={room.id}
                        room={room}
                        onUploaded={() =>
                          loadInspection(
                            inspection.id
                          )
                        }
                      />

                    )
                  )}

                </div>

              ) : (

                <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">

                  <h4 className="text-base font-semibold text-stone-800">
                    No rooms yet
                  </h4>


                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-stone-500">
                    Add the first room to begin
                    uploading inspection photos.
                  </p>


                  <button
                    onClick={() =>
                      setShowAddRoomModal(
                        true
                      )
                    }
                    className="
                      mt-5
                      rounded-lg
                      bg-orange-700
                      px-4
                      py-2.5
                      text-sm
                      font-semibold
                      text-white
                      transition
                      hover:bg-orange-800
                    "
                  >
                    + Add room
                  </button>

                </div>

              )}

            </section>

          </>

        )}

      </main>


      {/* --------------------------------------------------- */}
      {/* New inspection modal */}
      {/* --------------------------------------------------- */}

      <NewInspectionModal
        open={
          showNewInspectionModal
        }
        onClose={() =>
          setShowNewInspectionModal(
            false
          )
        }
        onCreate={
          handleCreateInspection
        }
      />


      {/* --------------------------------------------------- */}
      {/* Add room modal */}
      {/* --------------------------------------------------- */}

      {showAddRoomModal && (

        <AddRoomModal
          onClose={() =>
            setShowAddRoomModal(
              false
            )
          }
          onCreate={
            handleAddRoom
          }
        />

      )}

    </div>
  );
}


export default InspectionDashboard;