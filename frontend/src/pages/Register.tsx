import {
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { API_BASE_URL } from "../config";


function Register() {

  const navigate = useNavigate();


  const [
    email,
    setEmail,
  ] = useState("");


  const [
    password,
    setPassword,
  ] = useState("");


  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");


  const [
    error,
    setError,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(false);


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    setError("");


    /*
     * Make sure both passwords match
     * before sending the request.
     */

    if (
      password !==
      confirmPassword
    ) {

      setError(
        "Passwords do not match."
      );

      return;
    }


    setLoading(true);


    try {

      const response =
        await fetch(
          `${API_BASE_URL}/auth/register`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              email,
              password,
            }),
          }
        );


      if (!response.ok) {

        const data =
          await response.json();

        throw new Error(
          data.detail ||
          "Unable to create account."
        );

      }


      /*
       * Registration succeeded.
       *
       * Redirect to login instead of
       * automatically signing the user in.
       */

      navigate("/login");

    } catch (error) {

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );

    } finally {

      setLoading(false);

    }

  }


  return (
    <div className="min-h-screen bg-stone-100">

      <div className="grid min-h-screen lg:grid-cols-2">

        {/* ================================================= */}
        {/* Left side */}
        {/* ================================================= */}

        <div className="hidden bg-stone-900 lg:flex lg:flex-col lg:justify-between">

          <div className="p-10">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-sm font-bold text-stone-900">
                AI
              </div>


              <div>

                <p className="text-sm font-bold text-white">
                  Room Surface Defect Classifier
                </p>

                <p className="text-xs text-stone-400">
                  AI-powered property assessment
                </p>

              </div>

            </div>

          </div>


          <div className="px-16 pb-20">

            <p className="mb-5 text-sm font-medium uppercase tracking-[0.2em] text-orange-400">
              Start inspecting
            </p>


            <h1 className="max-w-xl text-5xl font-semibold leading-tight tracking-tight text-white">

              A smarter way to

              <span className="text-orange-400">
                {" "}inspect.
              </span>

            </h1>


            <p className="mt-6 max-w-lg text-base leading-7 text-stone-400">
              Keep your inspection history organized,
              analyze property photos with AI, and
              generate professional reports from one
              workspace.
            </p>


            <div className="mt-10 space-y-4">

              {/* Feature 1 */}

              <div className="flex items-center gap-3">

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-800 text-sm text-orange-400">
                  ✓
                </div>


                <p className="text-sm text-stone-300">
                  AI-powered defect detection
                </p>

              </div>


              {/* Feature 2 */}

              <div className="flex items-center gap-3">

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-800 text-sm text-orange-400">
                  ✓
                </div>


                <p className="text-sm text-stone-300">
                  Organized room-by-room inspections
                </p>

              </div>


              {/* Feature 3 */}

              <div className="flex items-center gap-3">

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-800 text-sm text-orange-400">
                  ✓
                </div>


                <p className="text-sm text-stone-300">
                  Professional inspection reports
                </p>

              </div>

            </div>

          </div>


          <div className="px-16 pb-8">

            <p className="text-xs text-stone-600">
              © 2026 Room Surface Defect Classifier
            </p>

          </div>

        </div>


        {/* ================================================= */}
        {/* Right side */}
        {/* ================================================= */}

        <div className="flex items-center justify-center px-6 py-12 sm:px-10">

          <div className="w-full max-w-md">

            {/* Mobile brand */}

            <div className="mb-10 flex items-center gap-3 lg:hidden">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-900 text-sm font-bold text-white">
                AI
              </div>


              <div>

                <p className="text-sm font-bold text-stone-900">
                  Room Surface Defect Classifier
                </p>

                <p className="text-xs text-stone-500">
                  AI-powered property assessment
                </p>

              </div>

            </div>


            {/* Heading */}

            <div className="mb-8">

              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">
                Get started
              </p>


              <h2 className="text-3xl font-bold tracking-tight text-stone-900">
                Create your account
              </h2>


              <p className="mt-2 text-sm leading-6 text-stone-500">
                Create a private workspace for your
                property inspections.
              </p>

            </div>


            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Email */}

              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-stone-700"
                >
                  Email address
                </label>


                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="
                    w-full
                    rounded-lg
                    border
                    border-stone-300
                    bg-white
                    px-4
                    py-3
                    text-sm
                    text-stone-900
                    outline-none
                    transition
                    placeholder:text-stone-400
                    focus:border-orange-600
                    focus:ring-2
                    focus:ring-orange-600/10
                  "
                />

              </div>


              {/* Password */}

              <div>

                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-stone-700"
                >
                  Password
                </label>


                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className="
                    w-full
                    rounded-lg
                    border
                    border-stone-300
                    bg-white
                    px-4
                    py-3
                    text-sm
                    text-stone-900
                    outline-none
                    transition
                    placeholder:text-stone-400
                    focus:border-orange-600
                    focus:ring-2
                    focus:ring-orange-600/10
                  "
                />

              </div>


              {/* Confirm password */}

              <div>

                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-stone-700"
                >
                  Confirm password
                </label>


                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className="
                    w-full
                    rounded-lg
                    border
                    border-stone-300
                    bg-white
                    px-4
                    py-3
                    text-sm
                    text-stone-900
                    outline-none
                    transition
                    placeholder:text-stone-400
                    focus:border-orange-600
                    focus:ring-2
                    focus:ring-orange-600/10
                  "
                />

              </div>


              {/* Error */}

              {error && (

                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">

                  <p className="text-sm font-medium text-red-700">
                    {error}
                  </p>

                </div>

              )}


              {/* Submit */}

              <button
                type="submit"
                disabled={loading}
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-orange-700
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-orange-800
                  active:scale-[0.99]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >

                {loading ? (

                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    Creating account...
                  </>

                ) : (

                  <>
                    Create account

                    <span className="text-base">
                      →
                    </span>
                  </>

                )}

              </button>

            </form>


            {/* Login link */}

            <div className="mt-8 border-t border-stone-200 pt-6 text-center">

              <p className="text-sm text-stone-500">

                Already have an account?

                <Link
                  to="/login"
                  className="ml-1 font-semibold text-orange-700 hover:text-orange-800"
                >
                  Sign in
                </Link>

              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


export default Register;