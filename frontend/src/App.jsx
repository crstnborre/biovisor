import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import Map from './components/Map'
import LayerPanel from './components/LayerPanel'

const API_URL = import.meta.env.VITE_API_URL

export default function App() {
  const [layers, setLayers] = useState([])
  const [enabledIds, setEnabledIds] = useState(new Set())

  useEffect(() => {
    fetch(`${API_URL}/api/layers/`)
      .then(r => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(data => {
        setLayers(data)
        setEnabledIds(new Set(data.filter(l => l.visible).map(l => l.id)))
      })
      .catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Error de conexion',
          text: 'No se pudieron cargar las capas del servidor.',
          confirmButtonColor: '#10b981',
        })
      })
  }, [])

  const toggleLayer = id => {
    setEnabledIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="flex h-full">
      <LayerPanel layers={layers} enabledIds={enabledIds} toggleLayer={toggleLayer} />
      <Map layers={layers} enabledIds={enabledIds} />
    </div>
  )
}
