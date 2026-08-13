import { z } from "zod";
import { apiContext, ok, fail, parseJson, requirePermission } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { tenantScope } from "@/lib/tenant";
import { logAudit } from "@/lib/audit";

const sermonSchema = z.object({
  title: z.string().min(1, "Title is required."),
  topic: z.string().optional().nullable(),
  series: z.string().optional().nullable(),
  date: z.string().optional(),
  audioUrl: z.string().optional().nullable(),
  videoUrl: z.string().optional().nullable(),
  pdfUrl: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  preacherId: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const ctx = await apiContext();
    requirePermission(ctx, "sermons.view");

    const sermons = await prisma.sermon.findMany({
      where: tenantScope(ctx.churchId),
      orderBy: { date: "desc" },
      take: 100,
      include: { preacher: true },
    });

    return ok({ sermons });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await apiContext();
    requirePermission(ctx, "sermons.manage");

    const body = await parseJson(request);
    const parsed = sermonSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid sermon details." },
        { status: 400 }
      );
    }

    const d = parsed.data;

    if (d.preacherId) {
      const preacher = await prisma.user.findFirst({
        where: { id: d.preacherId, churchId: ctx.churchId },
      });
      if (!preacher) return Response.json({ error: "Preacher not found." }, { status: 404 });
    }

    const sermon = await prisma.sermon.create({
      data: {
        churchId: ctx.churchId,
        title: d.title,
        topic: d.topic || null,
        series: d.series || null,
        date: d.date ? new Date(d.date) : new Date(),
        audioUrl: d.audioUrl || null,
        videoUrl: d.videoUrl || null,
        pdfUrl: d.pdfUrl || null,
        notes: d.notes || null,
        preacherId: d.preacherId || null,
      },
    });

    await logAudit(ctx, "CREATE", "Sermon", sermon.id, { title: sermon.title });

    return ok({ sermon }, 201);
  } catch (error) {
    return fail(error);
  }
}
