interface NavbarProps {
  onNewInspection: () => void;
  onLogout: () => void;
}


function Navbar({
  onNewInspection,
  onLogout,
}: NavbarProps) {

  return (
    <header className="border-b border-stone-200 bg-stone-50">

      <div className="
        mx-auto
        flex
        min-h-16
        max-w-7xl
        flex-wrap
        items-center
        justify-between
        gap-3
        px-3
        py-3
        sm:min-h-20
        sm:px-6
        sm:py-0
        lg:px-8
      ">

        {/* Brand */}

        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">

          <div className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-stone-900
            text-xs
            font-bold
            text-white
            sm:h-9
            sm:w-9
            sm:text-sm
          ">
            AI
          </div>


          <div className="min-w-0">

            <h1 className="
              truncate
              text-sm
              font-bold
              tracking-tight
              text-stone-900
              sm:text-base
            ">
              Room Surface Defect Classifier
            </h1>


            <p className="
              hidden
              text-xs
              text-stone-500
              sm:mt-0.5
              sm:block
            ">
              AI-powered property assessment
            </p>

          </div>

        </div>


        {/* Actions */}

        <div className="
          flex
          shrink-0
          items-center
          gap-2
          sm:gap-3
        ">

          {/* Logout */}

          <button
            onClick={onLogout}
            className="
              shrink-0
              rounded-lg
              border
              border-stone-300
              bg-white
              px-3
              py-2
              text-xs
              font-semibold
              text-stone-700
              transition
              hover:border-stone-400
              hover:bg-stone-100
              active:scale-[0.98]
              sm:px-4
              sm:py-2.5
              sm:text-sm
            "
          >
            Logout
          </button>


          {/* New inspection */}

          <button
            onClick={onNewInspection}
            className="
              shrink-0
              rounded-lg
              bg-orange-700
              px-3
              py-2
              text-xs
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-orange-800
              active:scale-[0.98]
              sm:px-4
              sm:py-2.5
              sm:text-sm
            "
          >
            <span className="sm:hidden">
              + New
            </span>

            <span className="hidden sm:inline">
              + New Inspection
            </span>
          </button>

        </div>

      </div>

    </header>
  );
}


export default Navbar;