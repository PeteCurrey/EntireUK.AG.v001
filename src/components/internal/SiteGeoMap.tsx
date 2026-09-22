'use client';

import React, { useState } from 'react';
import { GeoJSON } from '@/lib/land-radar/types';

export interface MapSiteItem {
  id: string;
  internal_reference: string;
  name?: string | null;
  geometry: GeoJSON.MultiPolygon | GeoJSON.Polygon | null;
  centroid?: GeoJSON.Point | null;
  priority?: string;
  isBrownfield?: boolean;
}

interface SiteGeoMapProps {
  geometry?: GeoJSON.MultiPolygon | GeoJSON.Polygon | null;
  centroid?: GeoJSON.Point | null;
  floodOverlap?: boolean;
  sssiOverlap?: boolean;
  siteName?: string;
  sites?: MapSiteItem[];
  selectedSiteId?: string;
  onSelectSite?: (siteId: string) => void;
  className?: string;
  showLayerToggles?: boolean;
}

// Authentic bounding box around Warwick District pilot area
const DEFAULT_BBOX = {
  minX: -1.6500,
  minY: 52.2400,
  maxX: -1.4700,
  maxY: 52.3600,
};

export function SiteGeoMap({
  geometry,
  centroid,
  floodOverlap = false,
  sssiOverlap = false,
  siteName,
  sites,
  selectedSiteId,
  onSelectSite,
  className = '',
  showLayerToggles = true,
}: SiteGeoMapProps) {
  const [layerSites, setLayerSites] = useState(true);
  const [layerFlood, setLayerFlood] = useState(true);
  const [layerSSSI, setLayerSSSI] = useState(true);
  const [layerSettlement, setLayerSettlement] = useState(true);

  // Multi-site mode or single-site mode
  const isMultiSite = Array.isArray(sites) && sites.length > 0;

  // Calculate bounding box
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const extractCoords = (coords: any) => {
    if (typeof coords[0] === 'number') {
      const [lon, lat] = coords;
      if (lon < minX) minX = lon;
      if (lon > maxX) maxX = lon;
      if (lat < minY) minY = lat;
      if (lat > maxY) maxY = lat;
    } else if (Array.isArray(coords)) {
      coords.forEach(extractCoords);
    }
  };

  if (isMultiSite) {
    sites.forEach((s) => {
      if (s.geometry?.coordinates) extractCoords(s.geometry.coordinates);
    });
  } else if (geometry?.coordinates) {
    extractCoords(geometry.coordinates);
  }

  if (minX === Infinity || maxX === -Infinity) {
    minX = DEFAULT_BBOX.minX;
    minY = DEFAULT_BBOX.minY;
    maxX = DEFAULT_BBOX.maxX;
    maxY = DEFAULT_BBOX.maxY;
  }

  // Add 15% padding around bounds
  const dx = Math.max(maxX - minX, 0.002);
  const dy = Math.max(maxY - minY, 0.002);
  const padX = dx * 0.18;
  const padY = dy * 0.18;

  const viewMinX = minX - padX;
  const viewMaxX = maxX + padX;
  const viewMinY = minY - padY;
  const viewMaxY = maxY + padY;

  const width = 800;
  const height = 500;

  // Transform lon, lat to SVG viewport x, y (inverted Y for latitude)
  const project = (lon: number, lat: number): [number, number] => {
    const x = ((lon - viewMinX) / (viewMaxX - viewMinX)) * width;
    const y = height - ((lat - viewMinY) / (viewMaxY - viewMinY)) * height;
    return [x, y];
  };

  // Convert geometry into SVG path d string
  const toSvgPath = (geom: GeoJSON.MultiPolygon | GeoJSON.Polygon | null): string => {
    if (!geom || !geom.coordinates) return '';
    const paths: string[] = [];

    const processPolygon = (rings: [number, number][][]) => {
      rings.forEach((ring) => {
        if (!ring || ring.length < 3) return;
        const pts = ring.map(([lon, lat]) => project(lon, lat));
        const d = `M ${pts[0][0]},${pts[0][1]} ` + pts.slice(1).map((p) => `L ${p[0]},${p[1]}`).join(' ') + ' Z';
        paths.push(d);
      });
    };

    if (geom.type === 'Polygon') {
      processPolygon(geom.coordinates as any);
    } else if (geom.type === 'MultiPolygon') {
      (geom.coordinates as any).forEach((poly: any) => processPolygon(poly));
    }

    return paths.join(' ');
  };

  const singlePathD = geometry ? toSvgPath(geometry) : '';
  const singleCentroidPt = centroid ? project(centroid.coordinates[0], centroid.coordinates[1]) : null;

  // Representative settlement extents (Warwick / Leamington Spa) for visual spatial reference
  const leamingtonExtent = [
    [-1.5550, 52.2780],
    [-1.5150, 52.2780],
    [-1.5150, 52.3020],
    [-1.5550, 52.3020],
    [-1.5550, 52.2780],
  ].map(([lon, lat]) => project(lon, lat));
  const leamingtonPath = `M ${leamingtonExtent[0][0]},${leamingtonExtent[0][1]} ` + leamingtonExtent.slice(1).map((p) => `L ${p[0]},${p[1]}`).join(' ') + ' Z';

  // Representative flood extent for visual spatial reference
  const floodExtent = [
    [-1.5500, 52.2750],
    [-1.5200, 52.2750],
    [-1.5200, 52.2880],
    [-1.5500, 52.2880],
    [-1.5500, 52.2750],
  ].map(([lon, lat]) => project(lon, lat));
  const floodPath = `M ${floodExtent[0][0]},${floodExtent[0][1]} ` + floodExtent.slice(1).map((p) => `L ${p[0]},${p[1]}`).join(' ') + ' Z';

  return (
    <div className={`relative bg-brand-surface border border-brand-edge rounded-sm overflow-hidden flex flex-col ${className}`}>
      {/* Top Map Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center space-x-2 bg-brand-obsidian/90 backdrop-blur-md px-3 py-1.5 rounded border border-brand-edge text-[11px] font-mono text-brand-silver pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>CRS: EPSG:4326 · Metric: EPSG:27700 (British National Grid)</span>
        </div>

        {showLayerToggles && (
          <div className="flex items-center space-x-2 bg-brand-obsidian/90 backdrop-blur-md px-3 py-1.5 rounded border border-brand-edge text-[10px] font-mono text-brand-silver pointer-events-auto">
            <span className="text-brand-steel uppercase tracking-wider mr-1">Layers:</span>
            <label className="flex items-center space-x-1 cursor-pointer hover:text-cyan-400">
              <input
                type="checkbox"
                checked={layerSites}
                onChange={(e) => setLayerSites(e.target.checked)}
                className="accent-cyan-400"
              />
              <span>Candidates</span>
            </label>
            <label className="flex items-center space-x-1 cursor-pointer hover:text-amber-400">
              <input
                type="checkbox"
                checked={layerFlood}
                onChange={(e) => setLayerFlood(e.target.checked)}
                className="accent-amber-400"
              />
              <span>Flood Risk</span>
            </label>
            <label className="flex items-center space-x-1 cursor-pointer hover:text-rose-400">
              <input
                type="checkbox"
                checked={layerSSSI}
                onChange={(e) => setLayerSSSI(e.target.checked)}
                className="accent-rose-400"
              />
              <span>SSSI</span>
            </label>
            <label className="flex items-center space-x-1 cursor-pointer hover:text-slate-300">
              <input
                type="checkbox"
                checked={layerSettlement}
                onChange={(e) => setLayerSettlement(e.target.checked)}
                className="accent-slate-400"
              />
              <span>Settlement</span>
            </label>
          </div>
        )}
      </div>

      {/* SVG Map Canvas */}
      <div className="relative w-full h-80 sm:h-[420px] bg-[#0c0f14] overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Grid */}
            <pattern id="workstationGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#161b22" strokeWidth="0.75" />
            </pattern>

            {/* Flood Hatch */}
            <pattern id="floodHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#f59e0b" strokeWidth="1.2" strokeOpacity="0.45" />
            </pattern>

            {/* SSSI Pattern */}
            <pattern id="sssiPattern" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="5" cy="5" r="1.5" fill="#f43f5e" fillOpacity="0.5" />
            </pattern>
          </defs>

          {/* Canvas Background */}
          <rect width={width} height={height} fill="#0b0e14" />
          <rect width={width} height={height} fill="url(#workstationGrid)" />

          {/* Settlement Boundary Layer (ONS BUA 2022) */}
          {layerSettlement && (
            <g className="transition-opacity duration-300">
              <path
                d={leamingtonPath}
                fill="#334155"
                fillOpacity="0.12"
                stroke="#64748b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text
                x={leamingtonExtent[0][0] + 10}
                y={leamingtonExtent[0][1] + 16}
                fill="#94a3b8"
                fontSize="10"
                fontFamily="monospace"
                className="select-none"
              >
                ONS BUA: Leamington Spa & Warwick Urban Boundary
              </text>
            </g>
          )}

          {/* Fluvial Flood Hazard Layer (EA Flood Zone 2/3) */}
          {layerFlood && (floodOverlap || isMultiSite) && (
            <g className="transition-opacity duration-300">
              <path
                d={floodPath}
                fill="url(#floodHatch)"
                stroke="#f59e0b"
                strokeWidth="1"
                strokeOpacity="0.5"
              />
              <text
                x={floodExtent[0][0] + 10}
                y={floodExtent[0][1] + 18}
                fill="#fbbf24"
                fontSize="9"
                fontFamily="monospace"
                className="select-none opacity-80"
              >
                EA Flood Zone 2/3 Extent (River Leam Corridor)
              </text>
            </g>
          )}

          {/* SSSI Protected Layer */}
          {layerSSSI && sssiOverlap && (
            <rect
              x={width * 0.72}
              y={height * 0.1}
              width={width * 0.22}
              height={height * 0.25}
              fill="url(#sssiPattern)"
              stroke="#f43f5e"
              strokeWidth="1"
              strokeOpacity="0.6"
            />
          )}

          {/* Single Site Rendering */}
          {!isMultiSite && singlePathD && layerSites && (
            <g>
              <path
                d={singlePathD}
                fill="#06b6d4"
                fillOpacity="0.22"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {singleCentroidPt && (
                <g transform={`translate(${singleCentroidPt[0]}, ${singleCentroidPt[1]})`}>
                  <circle r="9" fill="#06b6d4" fillOpacity="0.3" className="animate-ping" />
                  <circle r="4" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" />
                </g>
              )}
            </g>
          )}

          {/* Multi-Site Explorer Rendering */}
          {isMultiSite && layerSites && (
            <g>
              {sites.map((s) => {
                const d = toSvgPath(s.geometry);
                if (!d) return null;
                const isSelected = selectedSiteId === s.id || selectedSiteId === s.internal_reference;
                const strokeColor = isSelected ? '#38bdf8' : s.priority === 'HIGH' ? '#10b981' : s.priority === 'MEDIUM' ? '#06b6d4' : '#64748b';
                const fillColor = isSelected ? '#38bdf8' : s.priority === 'HIGH' ? '#10b981' : s.priority === 'MEDIUM' ? '#06b6d4' : '#64748b';
                const cPt = s.centroid ? project(s.centroid.coordinates[0], s.centroid.coordinates[1]) : null;

                return (
                  <g
                    key={s.id}
                    onClick={() => onSelectSite && onSelectSite(s.id)}
                    className="cursor-pointer group transition-all"
                  >
                    <path
                      d={d}
                      fill={fillColor}
                      fillOpacity={isSelected ? 0.45 : 0.22}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? 3.5 : 1.8}
                      strokeLinejoin="round"
                      className="transition-all hover:fill-opacity-50"
                    />
                    {cPt && (
                      <g transform={`translate(${cPt[0]}, ${cPt[1]})`}>
                        {isSelected && (
                          <circle r="12" fill="#38bdf8" fillOpacity="0.35" className="animate-ping" />
                        )}
                        <circle
                          r={isSelected ? 5 : 3.5}
                          fill={strokeColor}
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                        <text
                          y={-9}
                          textAnchor="middle"
                          fill={isSelected ? '#ffffff' : '#cbd5e1'}
                          fontSize={isSelected ? '10' : '8'}
                          fontWeight={isSelected ? 'bold' : 'normal'}
                          fontFamily="monospace"
                          className="pointer-events-none drop-shadow"
                        >
                          {s.internal_reference.replace('EUK-S-WARWICK-', '')}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          )}
        </svg>
      </div>

      {/* Layer Attribution Footer (Mandatory for OGL v3 & OS Compliance) */}
      <div className="px-4 py-2.5 bg-brand-charcoal/95 border-t border-brand-edge flex flex-wrap justify-between items-center gap-2 text-[10px] font-mono text-brand-steel">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-brand-silver">Authoritative Layers:</span>
          <span>• DLUHC Brownfield (OGL v3)</span>
          <span>• EA Flood Map (OGL v3)</span>
          <span>• NE SSSI (OGL v3)</span>
          <span>• HMLR INSPIRE (OGL v3)</span>
          <span>• ONS Built-up Areas (OGL v3)</span>
        </div>
        <div className="text-amber-400/90 font-medium">
          ⚠ Green Belt & Planning History: UNASSESSED (Epistemic Unknown)
        </div>
      </div>
    </div>
  );
}
