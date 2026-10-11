import axios, { isAxiosError } from "axios";

import { API_BASE_URL } from "../config";

import type {
  CreatedInspection,
  Inspection,
  InspectionType,
  Room,
  UploadedImageResponse,
} from "../types/inspection";


const api = axios.create({
  baseURL: API_BASE_URL,
});


/*
 * Attach the JWT to every API request.
 */

api.interceptors.request.use(
  (config) => {

    const token =
      localStorage.getItem(
        "access_token"
      );

    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;

    }

    return config;
  }
);


/*
 * Handle expired or invalid JWTs.
 *
 * If the backend returns 401:
 * 1. Remove the invalid token.
 * 2. Redirect the user to the login page.
 */

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {

    if (
      error.response?.status === 401
    ) {

      localStorage.removeItem(
        "access_token"
      );


      if (
        window.location.pathname !==
        "/login"
      ) {

        window.location.href =
          "/login";

      }

    }


    return Promise.reject(
      error
    );

  }
);


/*
 * Turn a failed request into a message for the user.
 *
 * FastAPI returns `detail` as a string for HTTP errors and as an
 * array of field errors for request validation (422).
 */

export function getApiErrorMessage(
  error: unknown,
  fallback: string
): string {

  if (!isAxiosError(error)) {
    return fallback;
  }


  const detail =
    error.response?.data?.detail;


  if (typeof detail === "string") {
    return detail;
  }


  if (Array.isArray(detail)) {

    const location: unknown[] =
      detail[0]?.loc ?? [];

    if (location.includes("password")) {
      return "Password must be at least 8 characters.";
    }

    if (location.includes("email")) {
      return "Please enter a valid email address.";
    }

  }


  return fallback;
}


export async function login(
  email: string,
  password: string
): Promise<void> {

  const response =
    await api.post<{ access_token: string }>(
      "/auth/login",
      { email, password }
    );

  localStorage.setItem(
    "access_token",
    response.data.access_token
  );
}


export async function register(
  email: string,
  password: string
): Promise<void> {

  await api.post(
    "/auth/register",
    { email, password }
  );
}


export async function getInspections(): Promise<
  CreatedInspection[]
> {

  const response =
    await api.get<CreatedInspection[]>(
      "/inspections"
    );

  return response.data;
}


export async function getInspection(
  inspectionId: number
): Promise<Inspection> {

  const response =
    await api.get<Inspection>(
      `/inspections/${inspectionId}`
    );

  return response.data;
}


export async function createInspection(
  propertyName: string,
  inspectionType: InspectionType
): Promise<CreatedInspection> {

  const response =
    await api.post<CreatedInspection>(
      "/inspections",
      {
        property_name: propertyName,
        inspection_type: inspectionType,
      }
    );

  return response.data;
}


export async function createRoom(
  inspectionId: number,
  name: string
): Promise<Room> {

  const response =
    await api.post<Room>(
      "/rooms",
      {
        inspection_id: inspectionId,
        name,
      }
    );

  return response.data;
}


export async function uploadRoomImage(
  roomId: number,
  file: File
): Promise<UploadedImageResponse> {

  const formData = new FormData();

  formData.append(
    "file",
    file
  );

  const response =
    await api.post<UploadedImageResponse>(
      `/rooms/${roomId}/images`,
      formData
    );

  return response.data;
}


export default api;