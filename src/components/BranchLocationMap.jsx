import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { cn } from '@/lib/utils'
import { Layers, Minus, Plus } from 'lucide-react'

// O'zbekiston viloyatlari markazlari koordinatalari
export const UZBEKISTAN_REGIONS_COORDS = {
  toshkent: [41.2995, 69.2401],
  tashkent: [41.2995, 69.2401],
  samarqand: [39.6542, 66.9597],
  samarkand: [39.6542, 66.9597],
  fargona: [40.3842, 71.7843],
  fergana: [40.3842, 71.7843],
  andijon: [40.7821, 72.3442],
  andijan: [40.7821, 72.3442],
  namangan: [40.9983, 71.6726],
  buxoro: [39.7747, 64.4286],
  bukhara: [39.7747, 64.4286],
  xorazm: [41.55, 60.6333],
  khorezm: [41.55, 60.6333],
  urganch: [41.55, 60.6333],
  qashqadaryo: [38.8606, 65.7891],
  kashkadarya: [38.8606, 65.7891],
  qarshi: [38.8606, 65.7891],
  surxondaryo: [37.2242, 67.2783],
  surkhandarya: [37.2242, 67.2783],
  termiz: [37.2242, 67.2783],
  navoiy: [40.0844, 65.3792],
  navoi: [40.0844, 65.3792],
  jizzax: [40.1158, 67.8422],
  jizzakh: [40.1158, 67.8422],
  sirdaryo: [40.4897, 68.7844],
  syrdarya: [40.4897, 68.7844],
  guliston: [40.4897, 68.7844],
  qoraqalpogiston: [42.4603, 59.6166],
  karakalpakstan: [42.4603, 59.6166],
  nukus: [42.4603, 59.6166],
}

export function findCoordsByRegionName(name) {
  if (!name) return null
  const clean = String(name)
    .toLowerCase()
    .replace(/['`ʻ’‘\-_\s]/g, '')
    .replace(/viloyati|viloyat|shahri|shahar|respublikasi/g, '')
    .trim()
  for (const [key, coords] of Object.entries(UZBEKISTAN_REGIONS_COORDS)) {
    if (clean.includes(key) || key.includes(clean)) {
      return coords
    }
  }
  return null
}

const DEFAULT_LAT = 41.2995
const DEFAULT_LNG = 69.2401
const DEFAULT_RADIUS = 150
const EARTH_RADIUS = 6378137 // metrda

function getEastPointLatLng(lat, lng, radiusMeters) {
  const dLng = (radiusMeters / (EARTH_RADIUS * Math.cos((Math.PI * lat) / 180))) * (180 / Math.PI)
  return [lat, lng + dLng]
}

function parseCoordinate(val, fallback) {
  const num = Number(val)
  if (isNaN(num) || num === 0) return fallback
  return num
}

export default function BranchLocationMap({
  latitude,
  longitude,
  radius = DEFAULT_RADIUS,
  interactive = false,
  onChange,
  className,
}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const centerMarkerRef = useRef(null)
  const handleMarkerRef = useRef(null)
  const circleRef = useRef(null)
  const tileLayerRef = useRef(null)

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const [mapType, setMapType] = useState('hybrid') // 'hybrid' | 'roadmap'
  const [currentRadius, setCurrentRadius] = useState(() => Number(radius) || DEFAULT_RADIUS)

  const initialLat = parseCoordinate(latitude, DEFAULT_LAT)
  const initialLng = parseCoordinate(longitude, DEFAULT_LNG)
  const initialRadius = Math.max(10, Number(radius) || DEFAULT_RADIUS)

  const coordsRef = useRef({ lat: initialLat, lng: initialLng, radius: initialRadius })

  // Koordinatalar yoki radius tashqaridan o'zgarganda xaritani yangilash (input yozilganda xaritani qayta yaratmaydi)
  useEffect(() => {
    const lat = parseCoordinate(latitude, DEFAULT_LAT)
    const lng = parseCoordinate(longitude, DEFAULT_LNG)
    const rad = Math.max(10, Number(radius) || DEFAULT_RADIUS)

    const prev = coordsRef.current
    const isDifferent =
      Math.abs(prev.lat - lat) > 0.000001 ||
      Math.abs(prev.lng - lng) > 0.000001 ||
      prev.radius !== rad

    coordsRef.current = { lat, lng, radius: rad }
    setCurrentRadius(rad)

    if (isDifferent && mapRef.current && centerMarkerRef.current && circleRef.current) {
      const centerLatLng = L.latLng(lat, lng)
      centerMarkerRef.current.setLatLng(centerLatLng)
      circleRef.current.setLatLng(centerLatLng)
      circleRef.current.setRadius(rad)

      if (handleMarkerRef.current) {
        handleMarkerRef.current.setLatLng(getEastPointLatLng(lat, lng, rad))
      }

      if (interactive) {
        mapRef.current.panTo(centerLatLng, { animate: true, duration: 0.5 })
      } else {
        const bounds = circleRef.current.getBounds()
        mapRef.current.fitBounds(bounds, { padding: [15, 15], maxZoom: 17 })
      }
    }
  }, [latitude, longitude, radius, interactive])

  // Xarita faqat bitta marta mount bo'lganda yaratiladi
  useEffect(() => {
    if (!containerRef.current) return

    delete L.Icon.Default.prototype._getIconUrl

    const centerLat = coordsRef.current.lat
    const centerLng = coordsRef.current.lng
    const rad = coordsRef.current.radius

    const map = L.map(containerRef.current, {
      center: [centerLat, centerLng],
      zoom: 16,
      zoomControl: false,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
      dragging: true,
      boxZoom: true,
      keyboard: true,
      attributionControl: false,
    })
    mapRef.current = map

    const hybridUrl = 'https://mt{s}.google.com/vt/lyrs=y&hl=uz&x={x}&y={y}&z={z}'
    const roadmapUrl = 'https://mt{s}.google.com/vt/lyrs=m&hl=uz&x={x}&y={y}&z={z}'

    const tileLayer = L.tileLayer(mapType === 'roadmap' ? roadmapUrl : hybridUrl, {
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 20,
    }).addTo(map)
    tileLayerRef.current = tileLayer

    // Markaz Pin belgisi
    const pinIcon = L.divIcon({
      className: 'branch-pin-icon',
      html: `
        <div style="transform: translate(-50%, -100%); display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; cursor: ${interactive ? 'grab' : 'default'};">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" fill="#EBF3FF" stroke="#0052D2" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="10" r="3.2" fill="#0052D2" stroke="#0052D2" stroke-width="1.5"/>
          </svg>
        </div>
      `,
      iconSize: [0, 0],
    })

    const centerMarker = L.marker([centerLat, centerLng], {
      icon: pinIcon,
      draggable: interactive,
    }).addTo(map)
    centerMarkerRef.current = centerMarker

    // Radius doirasi
    const circle = L.circle([centerLat, centerLng], {
      radius: rad,
      color: '#0052D2',
      weight: 2,
      dashArray: interactive ? undefined : '6, 6',
      fillColor: '#0052D2',
      fillOpacity: 0.18,
    }).addTo(map)
    circleRef.current = circle

    // Interaktiv rejim: radiusni o'zgartirish tutqichi (o'ng tarafdagi nuqta)
    if (interactive) {
      const handleIcon = L.divIcon({
        className: 'radius-handle-icon',
        html: `
          <div style="transform: translate(-50%, -50%); width: 15px; height: 15px; border-radius: 50%; background: white; border: 3px solid #0052D2; cursor: ew-resize; box-shadow: 0 1px 4px rgba(0,0,0,0.4);"></div>
        `,
        iconSize: [0, 0],
      })

      const handlePos = getEastPointLatLng(centerLat, centerLng, rad)
      const handleMarker = L.marker(handlePos, {
        icon: handleIcon,
        draggable: true,
      }).addTo(map)
      handleMarkerRef.current = handleMarker

      // Radius tutqichini surish
      handleMarker.on('drag', (e) => {
        const centerLatLng = centerMarker.getLatLng()
        const newHandleLatLng = e.target.getLatLng()
        const distance = centerLatLng.distanceTo(newHandleLatLng)
        const newRadius = Math.max(10, Math.min(5000, Math.round(distance)))

        circle.setRadius(newRadius)
        setCurrentRadius(newRadius)
        coordsRef.current.radius = newRadius
      })

      handleMarker.on('dragend', () => {
        const centerLatLng = centerMarker.getLatLng()
        const rad = coordsRef.current.radius
        handleMarker.setLatLng(getEastPointLatLng(centerLatLng.lat, centerLatLng.lng, rad))

        onChangeRef.current?.({
          latitude: centerLatLng.lat.toFixed(7),
          longitude: centerLatLng.lng.toFixed(7),
          radius: rad,
        })
      })

      // Markaz pinini surish
      centerMarker.on('drag', (e) => {
        const newCenter = e.target.getLatLng()
        circle.setLatLng(newCenter)
        handleMarker.setLatLng(getEastPointLatLng(newCenter.lat, newCenter.lng, coordsRef.current.radius))
      })

      centerMarker.on('dragend', () => {
        const newCenter = centerMarker.getLatLng()
        coordsRef.current.lat = newCenter.lat
        coordsRef.current.lng = newCenter.lng

        onChangeRef.current?.({
          latitude: newCenter.lat.toFixed(7),
          longitude: newCenter.lng.toFixed(7),
          radius: coordsRef.current.radius,
        })
      })

      // Xaritada ixtiyoriy joyga bosganda markazni ko'chirish
      map.on('click', (e) => {
        const newCenter = e.latlng
        centerMarker.setLatLng(newCenter)
        circle.setLatLng(newCenter)
        handleMarker.setLatLng(getEastPointLatLng(newCenter.lat, newCenter.lng, coordsRef.current.radius))

        coordsRef.current.lat = newCenter.lat
        coordsRef.current.lng = newCenter.lng

        onChangeRef.current?.({
          latitude: newCenter.lat.toFixed(7),
          longitude: newCenter.lng.toFixed(7),
          radius: coordsRef.current.radius,
        })
      })
    } else {
      const bounds = circle.getBounds()
      map.fitBounds(bounds, { padding: [15, 15], maxZoom: 17 })
    }

    const t = setTimeout(() => {
      map.invalidateSize()
    }, 250)

    return () => {
      clearTimeout(t)
      map.remove()
      mapRef.current = null
    }
  }, [interactive])

  const toggleMapType = () => {
    const nextType = mapType === 'hybrid' ? 'roadmap' : 'hybrid'
    setMapType(nextType)
    if (tileLayerRef.current) {
      const url =
        nextType === 'roadmap'
          ? 'https://mt{s}.google.com/vt/lyrs=m&hl=uz&x={x}&y={y}&z={z}'
          : 'https://mt{s}.google.com/vt/lyrs=y&hl=uz&x={x}&y={y}&z={z}'
      tileLayerRef.current.setUrl(url)
    }
  }

  return (
    <div className={cn('relative isolate z-0 overflow-hidden', className)}>
      <div ref={containerRef} className="h-full w-full" />

      {/* Radius ko'rsatkichi (xarita qatlamlari ustida ko'rinishi uchun z-[1000]) */}
      <div className="pointer-events-none absolute bottom-2.5 left-2.5 z-[1000] flex items-center gap-1.5 rounded-lg border border-black/5 bg-white/95 px-3 py-1.5 text-[12px] font-medium shadow-[0_2px_8px_rgba(0,0,0,0.2)] backdrop-blur-sm dark:border-white/10 dark:bg-[#1f1f23]/95">
        <span className="text-[#737373] dark:text-muted-foreground">Radius:</span>
        <span className="font-bold text-[#0A0A0A] dark:text-white">{currentRadius} m</span>
      </div>

      {/* Zoom boshqaruvi (+ / -) */}
      <div className="absolute left-2.5 top-2.5 z-[1000] flex flex-col gap-1">
        <button
          type="button"
          onClick={() => mapRef.current?.zoomIn()}
          title="Kattalashtirish"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-black/5 bg-white/95 text-[#0A0A0A] shadow-md backdrop-blur-sm transition-colors hover:bg-white active:scale-95 dark:border-white/10 dark:bg-[#1f1f23]/95 dark:text-white"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => mapRef.current?.zoomOut()}
          title="Kichraytirish"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-black/5 bg-white/95 text-[#0A0A0A] shadow-md backdrop-blur-sm transition-colors hover:bg-white active:scale-95 dark:border-white/10 dark:bg-[#1f1f23]/95 dark:text-white"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Xarita qatlami (Hybrid / Sxema) almashtirish tugmasi */}
      <button
        type="button"
        onClick={toggleMapType}
        title={mapType === 'hybrid' ? "Oddiy xaritaga o'tish" : "Gibrid (sun'iy yo'ldosh) xaritasiga o'tish"}
        className="absolute right-2.5 top-2.5 z-[1000] flex items-center gap-1.5 rounded-md border border-black/5 bg-white/95 px-2.5 py-1 text-[11px] font-medium text-[#0A0A0A] shadow-md backdrop-blur-sm transition-colors hover:bg-white dark:border-white/10 dark:bg-[#1f1f23]/95 dark:text-white"
      >
        <Layers className="h-3.5 w-3.5 text-[#0052D2]" />
        {mapType === 'hybrid' ? 'Gibrid' : 'Sxema'}
      </button>
    </div>
  )
}
