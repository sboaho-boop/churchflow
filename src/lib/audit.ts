import { prisma } from "./prisma";
import type { ChurchContext } from "./tenant";
import type { Prisma } from "@/generated/prisma/client";

export async function logAudit(
  ctx: ChurchContext,
  action: string,
  entity: string,
  entityId?: string,
  metadata?: Record<string, unknown>
) {
  try {
    await prisma.auditLog.create({
      data: {
        churchId: ctx.churchId,
        userId: ctx.session.sub,
        action,
        entity,
        entityId,
        metadata: (metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  } catch {
    // Audit logging must never break the main request.
  }
}
