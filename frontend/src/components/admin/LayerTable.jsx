import { Trash2, Layers } from 'lucide-react'

const TYPE_BADGE = {
  geojson: 'bg-emerald-900/60 text-emerald-300',
  geotiff: 'bg-amber-900/60 text-amber-300',
}

export default function LayerTable({ layers, onToggle, onDelete }) {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700/60 p-5">
      <div className="flex items-center gap-2 mb-5">
        <Layers size={14} className="text-slate-400" />
        <h2 className="text-white font-semibold text-sm">Capas ({layers.length})</h2>
      </div>
      {layers.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-10">No hay capas cargadas</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 text-xs border-b border-slate-800">
                <th className="text-left pb-3 font-medium pr-4">Nombre</th>
                <th className="text-left pb-3 font-medium pr-4">Tipo</th>
                <th className="text-left pb-3 font-medium pr-4">Visible</th>
                <th className="text-left pb-3 font-medium pr-4">Creada</th>
                <th className="pb-3 w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {layers.map(layer => (
                <tr key={layer.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="py-3 pr-4 text-slate-200 max-w-[180px] truncate">{layer.name}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${TYPE_BADGE[layer.type] ?? 'bg-slate-700 text-slate-400'}`}>
                      {layer.type}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <button
                      onClick={() => onToggle(layer.id)}
                      className={`relative w-9 h-5 rounded-full transition-colors ${layer.visible ? 'bg-emerald-600' : 'bg-slate-700'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${layer.visible ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </td>
                  <td className="py-3 pr-4 text-slate-500 text-xs whitespace-nowrap">
                    {new Date(layer.created_at).toLocaleDateString('es-CO')}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => onDelete(layer)}
                      className="text-slate-700 hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
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
