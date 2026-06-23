import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!(session?.user as any)?.id) {
    return NextResponse.json([], { status: 401 })
  }

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? ""
  if (q.length < 2) return NextResponse.json([])

  const results = await (prisma as any).cardSet.findMany({
    where: {
      OR: [
        { setCode: { contains: q.toUpperCase() } },
        { card: { name: { contains: q } } },
        { card: { namePt: { contains: q } } },
      ],
    },
    include: {
      card: {
        select: {
          id: true,
          name: true,
          namePt: true,
          type: true,
          imageUrl: true,
          atk: true,
          def: true,
          level: true,
          attribute: true,
        },
      },
    },
    take: 15,
    orderBy: { setCode: "asc" },
  })

  return NextResponse.json(results)
}
