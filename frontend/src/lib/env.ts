import type { NextRequest } from "next/server";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export function getAppOrigin(request?: NextRequest): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  if (request) {
    return request.nextUrl.origin;
  }

  return APP_BASE_URL;
}
