import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const API_URL = import.meta.env.VITE_API_URL
const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4']

export default function Map({ layers, enabledIds }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://tiles.openfreemap.org/styles/bright',
      center: [-74.0, 4.6],
      zoom: 5,
    })
    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-right')
    map.on('load', () => setMapLoaded(true))
    mapRef.current = map
    return () => map.remove()
  }, [])

  useEffect(() => {
    if (!mapLoaded || !layers.length) return
    const map = mapRef.current

    layers.forEach((layer, idx) => {
      const color = COLORS[idx % COLORS.length]
      const srcId = `src-${layer.id}`
      const vis = enabledIds.has(layer.id) ? 'visible' : 'none'

      if (layer.type === 'geotiff' && layer.tiles_url) {
        if (!map.getSource(srcId)) {
          map.addSource(srcId, { type: 'raster', tiles: [layer.tiles_url], tileSize: 256 })
          map.addLayer({
            id: `raster-${layer.id}`, type: 'raster', source: srcId,
            paint: { 'raster-opacity': 0.8 },
          })
        }
        if (map.getLayer(`raster-${layer.id}`)) {
          map.setLayoutProperty(`raster-${layer.id}`, 'visibility', vis)
        }
        return
      }

      if (layer.type !== 'geojson') return

      if (!map.getSource(srcId)) {
        map.addSource(srcId, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })

        map.addLayer({
          id: `fill-${layer.id}`, type: 'fill', source: srcId,
          filter: ['in', ['geometry-type'], ['literal', ['Polygon', 'MultiPolygon']]],
          paint: { 'fill-color': color, 'fill-opacity': 0.35 },
        })
        map.addLayer({
          id: `line-${layer.id}`, type: 'line', source: srcId,
          filter: ['in', ['geometry-type'], ['literal', ['Polygon', 'MultiPolygon', 'LineString', 'MultiLineString']]],
          paint: { 'line-color': color, 'line-width': 2 },
        })
        map.addLayer({
          id: `circle-${layer.id}`, type: 'circle', source: srcId,
          filter: ['in', ['geometry-type'], ['literal', ['Point', 'MultiPoint']]],
          paint: {
            'circle-color': color,
            'circle-radius': 7,
            'circle-stroke-color': '#fff',
            'circle-stroke-width': 1.5,
          },
        })

        fetch(`${API_URL}/api/layers/${layer.id}/features/`)
          .then(r => r.json())
          .then(data => map.getSource(srcId)?.setData(data))
      }

      ;[`fill-${layer.id}`, `line-${layer.id}`, `circle-${layer.id}`].forEach(lid => {
        if (map.getLayer(lid)) map.setLayoutProperty(lid, 'visibility', vis)
      })
    })
  }, [mapLoaded, layers, enabledIds])

  return <div ref={containerRef} className="flex-1 h-full" />
}
