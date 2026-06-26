import { useState, useEffect, useCallback } from 'react'
import { Globe, LogOut, Map } from 'lucide-react'
import Swal from 'sweetalert2'
import LoginPage from './LoginPage'
import UploadForm from '../components/admin/UploadForm'
import LayerTable from '../components/admin/LayerTable'
import { apiFetch } from '../utils/api'

export default function AdminPage() {
  const [user, setUser] = useState(undefined)
  const [layers, setLayers] = useState([])

  useEffect(() => {
    apiFetch('/api/auth/user/')
      .then(r => r.json())
      .then(data => setUser(data.username || null))
      .catch(() => setUser(null))
  }, [])

  const fetchLayers = useCallback(() => {
    apiFetch('/api/admin/layers/')
      .then(r => r.json())
      .then(setLayers)
  }, [])

  useEffect(() => {
    if (user) fetchLayers()
  }, [user, fetchLayers])

  const handleLogout = async () => {
    const r = await apiFetch('/api/auth/logout/', { method: 'POST' })
    if (r.ok) {
      setUser(null)
      setLayers([])
    }
  }

  const handleToggle = async id => {
    const r = await apiFetch(`/api/admin/layers/${id}/`, { method: 'PATCH' })
    if (r.ok) {
      const updated = await r.json()
      setLayers(prev => prev.map(l => l.id === id ? updated : l))
    } else {
      const body = await r.json().catch(() => ({}))
      Swal.fire({ icon: 'error', title: `Error ${r.status}`, text: body.detail || body.error || 'No se pudo actualizar la capa' })
    }
  }

  const handleEdit = async layer => {
    const { value } = await Swal.fire({
      title: 'Editar capa',
      html: `
        <input id="sw-name" class="swal2-input" placeholder="Nombre" value="${layer.name}">
        <input id="sw-desc" class="swal2-input" placeholder="Descripción (opcional)" value="${layer.description || ''}">
      `,
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#475569',
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      preConfirm: () => {
        const name = document.getElementById('sw-name').value.trim()
        if (!name) { Swal.showValidationMessage('El nombre es requerido'); return false }
        return { name, description: document.getElementById('sw-desc').value.trim() }
      },
    })
    if (!value) return
    const r = await apiFetch(`/api/admin/layers/${layer.id}/`, {
      method: 'PATCH',
      body: JSON.stringify(value),
    })
    if (r.ok) {
      const updated = await r.json()
      setLayers(prev => prev.map(l => l.id === layer.id ? updated : l))
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar' })
    }
  }

  const handleDelete = async layer => {
    const result = await Swal.fire({
      title: 'Eliminar capa',
      text: `Se eliminará "${layer.name}" y todos sus datos permanentemente.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#475569',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    })
    if (!result.isConfirmed) return
    const r = await apiFetch(`/api/admin/layers/${layer.id}/`, { method: 'DELETE' })
    if (r.ok || r.status === 204) {
      setLayers(prev => prev.filter(l => l.id !== layer.id))
      Swal.fire({ icon: 'success', title: 'Eliminada', timer: 1500, showConfirmButton: false })
    }
  }

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <span className="text-slate-600 text-sm">Cargando...</span>
      </div>
    )
  }

  if (!user) return <LoginPage onLogin={setUser} />

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="bg-slate-900 border-b border-slate-700/60 px-6 py-3 flex items-center gap-3 flex-shrink-0">
        <Globe size={16} className="text-emerald-400" />
        <span className="text-white font-bold text-sm">biovisor</span>
        <span className="text-slate-700">·</span>
        <span className="text-slate-400 text-sm">Panel admin</span>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-slate-600 text-xs">{user}</span>
          <a
            href="/"
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs transition-colors"
          >
            <Map size={13} />
            Ver mapa
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-slate-500 hover:text-white text-xs transition-colors"
          >
            <LogOut size={13} />
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 grid grid-cols-[360px_1fr] gap-6 items-start">
        <UploadForm onSuccess={fetchLayers} />
        <LayerTable layers={layers} onToggle={handleToggle} onEdit={handleEdit} onDelete={handleDelete} />
      </main>
    </div>
  )
}
