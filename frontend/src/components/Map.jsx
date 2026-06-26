import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const API_URL = import.meta.env.VITE_API_URL
const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4']

function boundsFromGeoJSON(geojson) {
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity
  function coord([lng, lat]) {
    if (lng < minLng) minLng = lng
    if (lat < minLat) minLat = lat
    if (lng > maxLng) maxLng = lng
    if (lat > maxLat) maxLat = lat
  }
  function geometry(g) {
    if (!g) return
    if (g.type === 'Point') coord(g.coordinates)
    else if (g.type === 'MultiPoint' || g.type === 'LineString') g.coordinates.forEach(coord)
    else if (g.type === 'MultiLineString' || g.type === 'Polygon') g.coordinates.forEach(r => r.forEach(coord))
    else if (g.type === 'MultiPolygon') g.coordinates.forEach(p => p.forEach(r => r.forEach(coord)))
  }
  geojson.features?.forEach(f => geometry(f.geometry))
  if (!isFinite(minLng)) return null
  return [[minLng, minLat], [maxLng, maxLat]]
}

function showPopup(map, lngLat, props) {
  const entries = Object.entries(props)
  if (!entries.length) return
  const rows = entries.map(([k, v]) => {
    const display = v === null || v === undefined ? '—'
      : typeof v === 'boolean' ? (v ? 'Sí' : 'No')
      : typeof v === 'object' ? JSON.stringify(v)
      : String(v)
    return `<div class="bv-row"><span class="bv-key">${k}</span><span class="bv-val">${display}</span></div>`
  }).join('')
  new maplibregl.Popup({ closeButton: true, className: 'bv-popup', maxWidth: '280px' })
    .setLngLat(lngLat)
    .setHTML(`<div class="bv-rows">${rows}</div>`)
    .addTo(map)
}

const Map = forwardRef(function Map({ layers, enabledIds }, ref) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const layerBoundsRef = useRef({})

  useImperativeHandle(ref, () => ({
    zoomToLayer(layer) {
      const map = mapRef.current
      if (!map) return
      if (layer.type === 'geotiff' && layer.tilejson_url) {
        fetch(layer.tilejson_url)
          .then(r => r.json())
          .then(data => { if (data.bounds) map.fitBounds(data.bounds, { padding: 60, duration: 1000 }) })
          .catch(() => {})
      } else if (layer.type === 'geojson') {
        const bounds = layerBoundsRef.current[layer.id]
        if (bounds) map.fitBounds(bounds, { padding: 60, duration: 1000 })
      }
    }
  }), [])

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
      const isNew = !map.getSource(srcId)

      if (layer.type === 'geotiff' && layer.tiles_url) {
        if (isNew) {
          map.addSource(srcId, { type: 'raster', tiles: [layer.tiles_url], tileSize: 256 })
          map.addLayer({ id: `raster-${layer.id}`, type: 'raster', source: srcId, paint: { 'raster-opacity': 0.8 } })
          if (enabledIds.has(layer.id) && layer.tilejson_url) {
            fetch(layer.tilejson_url)
              .then(r => r.json())
              .then(data => { if (data.bounds) map.fitBounds(data.bounds, { padding: 60, duration: 1200 }) })
              .catch(() => {})
          }
        }
        if (map.getLayer(`raster-${layer.id}`)) {
          map.setLayoutProperty(`raster-${layer.id}`, 'visibility', vis)
        }
        return
      }

      if (layer.type !== 'geojson') return

      if (isNew) {
        const shouldZoom = enabledIds.has(layer.id)
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
          paint: { 'circle-color': color, 'circle-radius': 7, 'circle-stroke-color': '#fff', 'circle-stroke-width': 1.5 },
        })

        const clickLayers = [`fill-${layer.id}`, `line-${layer.id}`, `circle-${layer.id}`]
        clickLayers.forEach(lid => {
          map.on('mouseenter', lid, () => { map.getCanvas().style.cursor = 'pointer' })
          map.on('mouseleave', lid, () => { map.getCanvas().style.cursor = '' })
          map.on('click', lid, e => {
            const props = e.features[0]?.properties
            if (props) showPopup(map, e.lngLat, props)
          })
        })

        fetch(`${API_URL}/api/layers/${layer.id}/features/`)
          .then(r => r.json())
          .then(data => {
            map.getSource(srcId)?.setData(data)
            const bounds = boundsFromGeoJSON(data)
            if (bounds) {
              layerBoundsRef.current[layer.id] = bounds
              if (shouldZoom) map.fitBounds(bounds, { padding: 60, duration: 1200 })
            }
          })
      }

      ;[`fill-${layer.id}`, `line-${layer.id}`, `circle-${layer.id}`].forEach(lid => {
        if (map.getLayer(lid)) map.setLayoutProperty(lid, 'visibility', vis)
      })
    })
  }, [mapLoaded, layers, enabledIds])

  return <div ref={containerRef} className="flex-1 h-full" />
})

export default Map
