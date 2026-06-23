import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email e senha são obrigatórios." },
      { status: 400 },
    )
  }

  const existing = await (prisma as any).user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "Email já cadastrado." }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 12)
  const user = await (prisma as any).user.create({
    data: { name: name?.trim() || null, email: email.trim(), password: hashed },
  })

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 })
}
