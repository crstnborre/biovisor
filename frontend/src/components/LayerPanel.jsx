import { Layers, Eye, EyeOff, Globe, LayoutDashboard, Crosshair } from 'lucide-react'

const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4']

const TYPE_BADGE = {
  geojson: { label: 'GeoJSON', cls: 'bg-emerald-900/60 text-emerald-300' },
  geotiff: { label: 'GeoTIFF', cls: 'bg-amber-900/60 text-amber-300' },
}

function isInteractive(layer) {
  if (layer.type === 'geojson') return true
  if (layer.type === 'geotiff') return layer.tile_status === 'ready' && !!layer.tiles_url
  return false
}

export default function LayerPanel({ layers, enabledIds, toggleLayer, onZoomToLayer, isAdmin = false }) {
  return (
    <aside className="w-72 bg-slate-900 text-white flex flex-col h-full shadow-2xl z-10 flex-shrink-0">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-700/60">
        <Globe size={18} className="text-emerald-400 flex-shrink-0" />
        <span className="font-bold text-base tracking-tight">biovisor</span>
        <span className="ml-auto text-[10px] text-slate-500 font-mono">Colombia</span>
      </div>

      <div className="px-5 pt-4 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
        <Layers size={12} />
        Capas ({layers.length})
      </div>

      <ul className="flex-1 overflow-y-auto px-3 pb-3 space-y-0.5">
        {layers.length === 0 && (
          <li className="text-slate-500 text-sm px-2 py-6 text-center">
            Sin capas disponibles
          </li>
        )}
        {layers.map((layer, idx) => {
          const enabled = enabledIds.has(layer.id)
          const color = COLORS[idx % COLORS.length]
          const badge = TYPE_BADGE[layer.type] ?? { label: layer.type, cls: 'bg-slate-700 text-slate-400' }
          const interactive = isInteractive(layer)

          return (
            <li key={layer.id} className="group/item">
              <div className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                enabled ? 'bg-slate-800' : 'opacity-50',
              ].join(' ')}>
                <button
                  onClick={() => interactive && toggleLayer(layer.id)}
                  disabled={!interactive}
                  className={[
                    'flex items-center gap-3 flex-1 min-w-0 text-left',
                    interactive ? 'cursor-pointer' : 'cursor-default',
                  ].join(' ')}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 ring-1 ring-white/20"
                    style={{ backgroundColor: enabled ? color : '#4b5563' }}
                  />
                  <span className="flex-1 text-sm text-slate-200 truncate leading-none">
                    {layer.name}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${badge.cls}`}>
                    {badge.label}
                  </span>
                  {interactive ? (
                    enabled
                      ? <Eye size={13} className="text-slate-300 flex-shrink-0" />
                      : <EyeOff size={13} className="text-slate-600 flex-shrink-0" />
                  ) : (
                    <span className="text-[10px] text-slate-600 flex-shrink-0">pronto</span>
                  )}
                </button>
                {enabled && (
                  <button
                    onClick={e => { e.stopPropagation(); onZoomToLayer?.(layer) }}
                    className="opacity-0 group-hover/item:opacity-100 text-slate-600 hover:text-emerald-400 transition-all flex-shrink-0"
                    title="Zoom a capa"
                  >
                    <Crosshair size={13} />
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      <div className="px-5 py-3 border-t border-slate-700/60 flex items-center justify-between">
        <span className="text-[10px] text-slate-600">capas ambientales y zonas de riesgo</span>
        {isAdmin && (
          <a
            href="/admin"
            className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-emerald-400 transition-colors"
          >
            <LayoutDashboard size={11} />
            Panel admin
          </a>
        )}
      </div>
    </aside>
  )
}
