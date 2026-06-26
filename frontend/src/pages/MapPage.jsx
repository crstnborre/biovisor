import { useState, useEffect, useRef } from 'react'
import Swal from 'sweetalert2'
import Map from '../components/Map'
import LayerPanel from '../components/LayerPanel'
import { apiFetch } from '../utils/api'

const API_URL = import.meta.env.VITE_API_URL

export default function MapPage() {
  const [layers, setLayers] = useState([])
  const [enabledIds, setEnabledIds] = useState(new Set())
  const [isAdmin, setIsAdmin] = useState(false)
  const mapRef = useRef(null)

  useEffect(() => {
    apiFetch('/api/auth/user/')
      .then(r => r.json())
      .then(data => setIsAdmin(!!data.username))
      .catch(() => {})
  }, [])

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
      <LayerPanel
        layers={layers}
        enabledIds={enabledIds}
        toggleLayer={toggleLayer}
        isAdmin={isAdmin}
        onZoomToLayer={layer => mapRef.current?.zoomToLayer(layer)}
      />
      <Map ref={mapRef} layers={layers} enabledIds={enabledIds} />
    </div>
  )
}
