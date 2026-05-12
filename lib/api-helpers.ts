import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, message: string, code = "ERROR") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const Unauthorized = (msg = "Not authenticated") =>
  new ApiError(401, msg, "UNAUTHORIZED");
export const Forbidden = (msg = "Not allowed") =>
  new ApiError(403, msg, "FORBIDDEN");
export const NotFound = (msg = "Not found") =>
  new ApiError(404, msg, "NOT_FOUND");
export const BadRequest = (msg = "Bad request") =>
  new ApiError(400, msg, "BAD_REQUEST");
export const Conflict = (msg = "Conflict") =>
  new ApiError(409, msg, "CONFLICT");

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function handleApiError(err: unknown) {
  if (err instanceof ApiError) {
    return NextResponse.json(
      { error: err.message, code: err.code },
      { status: err.status }
    );
  }
  if (err instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: err.flatten(),
      },
      { status: 400 }
    );
  }
  console.error("Unhandled API error:", err);
  return NextResponse.json(
    { error: "Internal server error", code: "INTERNAL" },
    { status: 500 }
  );
}

export function withErrorHandler<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>
) {
  return async (...args: TArgs) => {
    try {
      return await fn(...args);
    } catch (err) {
      return handleApiError(err);
    }
  };
}

export async function readJson<T = unknown>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw BadRequest("Invalid JSON body");
  }
}
