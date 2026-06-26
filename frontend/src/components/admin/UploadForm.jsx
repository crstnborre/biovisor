import { useState } from 'react'
import { Upload } from 'lucide-react'
import Swal from 'sweetalert2'
import { apiUpload } from '../../utils/api'

export default function UploadForm({ onSuccess }) {
  const [form, setForm] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [fileRef, setFileRef] = useState(null)

  const submit = async e => {
    e.preventDefault()
    const fileInput = e.target.querySelector('input[type=file]')
    const file = fileInput?.files[0]
    if (!file) return

    setLoading(true)
    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('description', form.description)
    fd.append('file', file)

    try {
      const r = await apiUpload('/api/admin/layers/upload/', fd)
      if (r.ok) {
        Swal.fire({ icon: 'success', title: 'Capa subida', timer: 1800, showConfirmButton: false })
        setForm({ name: '', description: '' })
        e.target.reset()
        onSuccess()
      } else {
        const data = await r.json()
        Swal.fire({ icon: 'error', title: 'Error', text: data.error || 'Error al subir la capa' })
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo conectar con el servidor' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700/60 p-5">
      <div className="flex items-center gap-2 mb-5">
        <Upload size={14} className="text-emerald-400" />
        <h2 className="text-white font-semibold text-sm">Subir capa</h2>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-slate-400 text-xs">Nombre *</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Nombre de la capa"
            className="w-full bg-slate-800 text-white rounded-lg px-3 py-2 text-sm border border-slate-700 focus:outline-none focus:border-emerald-500 placeholder:text-slate-600 transition-colors"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-slate-400 text-xs">Descripción</label>
          <input
            type="text"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Opcional"
            className="w-full bg-slate-800 text-white rounded-lg px-3 py-2 text-sm border border-slate-700 focus:outline-none focus:border-emerald-500 placeholder:text-slate-600 transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-slate-400 text-xs">Archivo *</label>
          <input
            type="file"
            accept=".geojson,.json,.tif,.tiff"
            className="w-full bg-slate-800 text-slate-400 rounded-lg px-3 py-2 text-sm border border-slate-700 file:mr-3 file:bg-emerald-900/60 file:text-emerald-300 file:border-0 file:rounded file:px-2 file:py-0.5 file:text-xs cursor-pointer"
            required
          />
          <p className="text-slate-600 text-xs">GeoJSON (.geojson .json) · GeoTIFF (.tif .tiff)</p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-lg py-2 text-sm transition-colors"
        >
          {loading ? 'Subiendo...' : 'Subir capa'}
        </button>
      </form>
    </div>
  )
}
