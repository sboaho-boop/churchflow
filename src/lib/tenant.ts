import { headers } from "next/headers";
import type { Church, User } from "@/generated/prisma/client";
import { prisma } from "./prisma";
import { getSession, type SessionUser } from "./session";

export interface ChurchContext {
  session: SessionUser;
  churchId: string | null;
  church: Church | null;
  isSuperAdmin: boolean;
}

export async function getChurchContext(): Promise<ChurchContext | null> {
  const session = await getSession();
  if (!session) return null;

  let churchId = session.churchId;

  // SUPER_ADMIN can scope into any church via x-church-id header (set by the
  // super-admin UI) or a subdomain hint (x-church-slug, set by proxy).
  if (!churchId) {
    const headerStore = await headers();
    const headerId = headerStore.get("x-church-id");
    if (headerId) {
      churchId = headerId;
    } else {
      const slug = headerStore.get("x-church-slug");
      if (slug) {
        const church = await prisma.church.findUnique({ where: { slug } });
        if (church) churchId = church.id;
      }
    }
  }

  const church = churchId
    ? await prisma.church.findUnique({ where: { id: churchId } })
    : null;

  return {
    session,
    churchId,
    church,
    isSuperAdmin: session.role === "SUPER_ADMIN",
  };
}

/**
 * Where clause that scopes a query to the current tenant. Every tenant-owned
 * query must use this so churches can never see each other's data.
 */
export function tenantScope(churchId: string | null): { churchId: string } {
  return { churchId: churchId ?? "__no_tenant__" };
}

export async function getChurchUser(
  churchId: string,
  userId: string
): Promise<User | null> {
  return prisma.user.findFirst({
    where: { id: userId, churchId },
  });
}
