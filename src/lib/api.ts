import { getSession } from "./session";
import { getChurchContext, type ChurchContext } from "./tenant";
import { can } from "./rbac";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiContext(): Promise<ChurchContext> {
  const session = await getSession();
  if (!session) throw new ApiError(401, "Not authenticated.");
  const ctx = await getChurchContext();
  if (!ctx || !ctx.churchId || !ctx.church) {
    throw new ApiError(404, "Church not found.");
  }
  return ctx;
}

export async function parseJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ApiError(400, "Invalid JSON body.");
  }
}

export function requirePermission(ctx: ChurchContext, permission: string) {
  if (!can(ctx.session.role, permission)) {
    throw new ApiError(403, "You do not have permission to do that.");
  }
}

export function ok(data: object = {}, status = 200) {
  return Response.json({ ok: true, ...data }, { status });
}

export function fail(error: unknown): Response {
  if (error instanceof ApiError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error(error);
  return Response.json({ error: "Something went wrong." }, { status: 500 });
}
