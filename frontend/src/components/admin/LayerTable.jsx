import { useState } from 'react'
import { Trash2, Layers, Pencil, Eye, EyeOff, Search } from 'lucide-react'

const TYPE_BADGE = {
  geojson: 'bg-emerald-900/60 text-emerald-300',
  geotiff: 'bg-amber-900/60 text-amber-300',
}

export default function LayerTable({ layers, onToggle, onEdit, onDelete }) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? layers.filter(l => l.name.toLowerCase().includes(query.toLowerCase()))
    : layers

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700/60 p-5">
      <div className="flex items-center gap-3 mb-5">
        <Layers size={14} className="text-slate-400" />
        <h2 className="text-white font-semibold text-sm">
          Capas ({filtered.length}{query ? `/${layers.length}` : ''})
        </h2>
        <div className="ml-auto relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar capa..."
            className="bg-slate-800 text-slate-300 text-xs rounded-lg pl-7 pr-3 py-1.5 border border-slate-700 focus:outline-none focus:border-emerald-500 placeholder:text-slate-600 w-48 transition-colors"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-10">
          {query ? 'Sin resultados' : 'No hay capas cargadas'}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 text-xs border-b border-slate-800">
                <th className="text-left pb-3 font-medium w-8" />
                <th className="text-left pb-3 font-medium pr-4">Nombre</th>
                <th className="text-left pb-3 font-medium pr-4">Tipo</th>
                <th className="text-left pb-3 font-medium pr-4">Creada</th>
                <th className="pb-3 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map(layer => (
                <tr
                  key={layer.id}
                  onClick={() => onToggle(layer.id)}
                  className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                >
                  <td className="py-3 pr-3">
                    {layer.visible
                      ? <Eye size={13} className="text-emerald-400" />
                      : <EyeOff size={13} className="text-slate-600" />
                    }
                  </td>
                  <td className="py-3 pr-4 text-slate-200 max-w-[200px] truncate">{layer.name}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${TYPE_BADGE[layer.type] ?? 'bg-slate-700 text-slate-400'}`}>
                      {layer.type}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-slate-500 text-xs whitespace-nowrap">
                    {new Date(layer.created_at).toLocaleDateString('es-CO')}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={e => { e.stopPropagation(); onEdit(layer) }}
                        className="text-slate-500 hover:text-slate-200 transition-colors p-1"
                        title="Editar"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); onDelete(layer) }}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1"
                        title="Eliminar"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
