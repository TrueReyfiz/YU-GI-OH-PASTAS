"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setError("A senha precisa ter pelo menos 8 caracteres.")
      return
    }
    setLoading(true)
    setError("")

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Erro ao criar conta.")
      setLoading(false)
      return
    }

    await signIn("credentials", { email, password, redirect: false })
    router.push("/")
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <h1 className="font-condensed font-bold text-[28px] tracking-[.05em] text-primary leading-none">
            A COLEÇÃO
          </h1>
          <p className="font-condensed text-[10px] tracking-[.24em] text-dim uppercase mt-2">
            Yu-Gi-Oh! Estampas Ilustradas
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-white/[.07] rounded-[8px] p-8 flex flex-col gap-5"
        >
          <h2 className="font-condensed font-semibold text-[15px] tracking-[.12em] text-secondary uppercase text-center">
            Criar conta
          </h2>

          {error && (
            <p className="text-[13px] text-red-400 text-center -mt-1">{error}</p>
          )}

          <Field label="NOME (opcional)" type="text" value={name} onChange={setName} />
          <Field
            label="EMAIL"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
          />
          <Field
            label="SENHA (mín. 8 caracteres)"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-1 bg-gold/10 border border-gold/40 text-gold font-condensed font-semibold text-[14px] tracking-[.08em] py-[13px] rounded-[6px] hover:bg-gold/15 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? "CRIANDO…" : "CRIAR CONTA"}
          </button>

          <p className="text-center text-[12px] text-dim">
            Já tem conta?{" "}
            <a href="/login" className="text-gold hover:opacity-70 transition-opacity">
              Entrar
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  type,
  value,
  onChange,
  autoComplete,
}: {
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  autoComplete?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="flex flex-col gap-[7px]">
      <label className="font-condensed font-semibold text-[10px] tracking-[.18em] text-dim uppercase">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={autoComplete}
        className="bg-bg rounded-[6px] px-[14px] py-[11px] text-[14px] outline-none transition-colors"
        style={{
          border: `1px solid ${focused ? "rgba(34,211,238,.5)" : "rgba(255,255,255,0.09)"}`,
        }}
      />
    </div>
  )
}
