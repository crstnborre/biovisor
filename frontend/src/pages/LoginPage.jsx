import { useState } from 'react'
import { Globe } from 'lucide-react'
import { apiFetch } from '../utils/api'

export default function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const r = await apiFetch('/api/auth/login/', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      const data = await r.json()
      if (r.ok) {
        onLogin(data.username)
      } else {
        setError(data.error || 'Error al iniciar sesión')
      }
    } catch {
      setError('No se pudo conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Globe size={20} className="text-emerald-400" />
          <span className="text-white font-bold text-xl tracking-tight">biovisor</span>
        </div>
        <form onSubmit={submit} className="bg-slate-900 rounded-xl border border-slate-700/60 p-8 space-y-5">
          <h1 className="text-white font-semibold">Panel de administración</h1>
          {error && (
            <p className="text-red-400 text-sm bg-red-950/40 border border-red-800/50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <div className="space-y-1.5">
            <label className="text-slate-400 text-xs">Usuario</label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              className="w-full bg-slate-800 text-white rounded-lg px-3 py-2.5 text-sm border border-slate-700 focus:outline-none focus:border-emerald-500 transition-colors"
              required
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-slate-400 text-xs">Contraseña</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full bg-slate-800 text-white rounded-lg px-3 py-2.5 text-sm border border-slate-700 focus:outline-none focus:border-emerald-500 transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-lg py-2.5 text-sm transition-colors"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
