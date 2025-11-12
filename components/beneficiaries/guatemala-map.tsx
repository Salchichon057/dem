'use client'

import { useState } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps'
import guatemalaGeo from '@/lib/data/gt.json'

interface GuatemalaMapProps {
  data: Record<string, number>
}

interface GeoFeature {
  rsmKey: string
  properties: {
    name: string
    id: string
  }
  [key: string]: unknown
}

export default function GuatemalaMap({ data }: GuatemalaMapProps) {
  const [tooltipContent, setTooltipContent] = useState('')
  const [position, setPosition] = useState({ x: 0, y: 0 })

  // Find max value for color scaling
  const maxValue = Math.max(...Object.values(data), 1)

  // Get color intensity based on value
  const getColor = (departmentName: string) => {
    const value = data[departmentName] || 0
    if (value === 0) return '#e5e7eb' // gray-200

    const intensity = value / maxValue
    
    // Blue scale from light to dark
    if (intensity < 0.2) return '#dbeafe' // blue-100
    if (intensity < 0.4) return '#93c5fd' // blue-300
    if (intensity < 0.6) return '#60a5fa' // blue-400
    if (intensity < 0.8) return '#3b82f6' // blue-500
    return '#1e40af' // blue-800
  }

  return (
    <div className="relative w-full" style={{ height: '400px' }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 5500,
          center: [-90.25, 15.78],
        }}
        width={800}
        height={600}
        className="w-full h-full"
      >
        <ZoomableGroup center={[-90.25, 15.78]} zoom={1} minZoom={0.8} maxZoom={4}>
          <Geographies geography={guatemalaGeo}>
            {({ geographies }: { geographies: GeoFeature[] }) =>
              geographies.map((geo: GeoFeature) => {
                const departmentName = geo.properties.name
                const value = data[departmentName] || 0

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getColor(departmentName)}
                    stroke="#ffffff"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: {
                        fill: '#f59e0b',
                        outline: 'none',
                        cursor: 'pointer',
                      },
                      pressed: { outline: 'none' },
                    }}
                    onMouseEnter={(e: React.MouseEvent) => {
                      setTooltipContent(
                        `${departmentName}: ${value} beneficiario${value !== 1 ? 's' : ''}`
                      )
                      setPosition({ x: e.clientX, y: e.clientY })
                    }}
                    onMouseLeave={() => {
                      setTooltipContent('')
                    }}
                  />
                )
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {tooltipContent && (
        <div
          className="absolute bg-gray-900 text-white px-3 py-2 rounded-md text-sm pointer-events-none z-50"
          style={{
            left: position.x + 10,
            top: position.y - 30,
            transform: 'translateX(-50%)',
          }}
        >
          {tooltipContent}
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-md shadow-md border">
        <p className="text-xs font-semibold mb-2">Población</p>
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dbeafe' }}></div>
              <span className="text-xs">Bajo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#60a5fa' }}></div>
              <span className="text-xs">Medio</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#1e40af' }}></div>
              <span className="text-xs">Alto</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
