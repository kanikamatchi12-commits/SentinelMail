import React, { useEffect, useRef, useState } from 'react';
import { RoutingHop } from '../types.ts';
import L from 'leaflet';
import { Globe, AlertTriangle, Crosshair, MapPin, Server } from 'lucide-react';

interface HopMapProps {
  hops: RoutingHop[];
  highlightAnomalies?: boolean;
}

export const HopMap: React.FC<HopMapProps> = ({ hops, highlightAnomalies = true }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [selectedHop, setSelectedHop] = useState<RoutingHop | null>(null);

  // Filter hops with valid lat/lon
  const validHops = hops.filter(
    (h) => typeof h.lat === 'number' && typeof h.lon === 'number' && (h.lat !== 0 || h.lon !== 0)
  );

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 1,
      maxZoom: 18,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // CartoDB Positron Clean Light tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    if (validHops.length === 0) {
      return;
    }

    const latLngs: L.LatLngExpression[] = [];

    validHops.forEach((hop) => {
      const latLng: [number, number] = [hop.lat!, hop.lon!];
      latLngs.push(latLng);

      const isAnomalous = hop.anomalous && highlightAnomalies;
      const isOrigin = hop.hop_index === 1;

      const bgColor = isAnomalous ? '#DC3545' : isOrigin ? '#14B8A6' : '#6D4AFF';

      const markerHtml = `
        <div style="
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: ${bgColor};
          border: 2px solid #FFFFFF;
          box-shadow: 0 4px 10px rgba(32,26,53,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          font-weight: bold;
          cursor: pointer;
        ">
          ${hop.hop_index}
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-hop-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -16],
      });

      const popupContent = `
        <div style="font-family: 'Inter', sans-serif; font-size: 12px; line-height: 1.4; min-width: 180px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; border-bottom: 1px solid #E7E2F2; padding-bottom: 4px;">
            <span style="font-weight: bold; color: ${isAnomalous ? '#DC3545' : '#6D4AFF'};">
              HOP #${hop.hop_index} ${isOrigin ? '(FIRST OBSERVED)' : ''}
            </span>
            ${isAnomalous ? '<span style="background: rgba(220,53,69,0.15); color: #DC3545; padding: 1px 4px; border-radius: 4px; font-size: 9px; font-weight: bold;">ANOMALOUS</span>' : ''}
          </div>
          <div style="margin-bottom: 3px;">
            <strong style="color: #6B6478;">IP:</strong> 
            <span style="font-family: 'IBM Plex Mono', monospace; color: #241F31; font-weight: 500;">${hop.ip}</span>
          </div>
          <div style="margin-bottom: 3px;">
            <strong style="color: #6B6478;">Location:</strong> 
            <span style="color: #241F31;">${hop.city || 'Unknown'}, ${hop.country || 'Unknown'}</span>
          </div>
          <div style="margin-bottom: 3px;">
            <strong style="color: #6B6478;">ISP/Org:</strong> 
            <span style="color: #241F31;">${hop.isp || hop.org || 'Not reported'}</span>
          </div>
          ${
            hop.anomaly_reason
              ? `<div style="margin-top: 6px; padding: 4px 6px; background: rgba(220,53,69,0.1); border: 1px solid rgba(220,53,69,0.2); border-radius: 4px; color: #DC3545; font-size: 11px;">
                  ⚠️ ${hop.anomaly_reason}
                </div>`
              : ''
          }
        </div>
      `;

      const marker = L.marker(latLng, { icon: customIcon }).addTo(map);
      marker.bindPopup(popupContent);
      marker.on('click', () => setSelectedHop(hop));
    });

    if (latLngs.length > 1) {
      L.polyline(latLngs, {
        color: '#6D4AFF',
        weight: 3,
        opacity: 0.8,
        dashArray: '6, 8',
      }).addTo(map);

      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 6 });
    } else if (latLngs.length === 1) {
      map.setView(latLngs[0], 5);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [hops, highlightAnomalies]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-[#E7E2F2] bg-white shadow-sm">
      <div ref={mapContainerRef} className="w-full h-80 z-10" />

      {/* Map Overlay Legend */}
      <div className="absolute bottom-3 left-3 z-20 flex flex-wrap items-center gap-2 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-[#E7E2F2] text-[11px] shadow-sm text-[#241F31]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#14B8A6]" />
          <span>Origin MTA</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#6D4AFF]" />
          <span>Intermediate Relay</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#DC3545]" />
          <span>Transit Anomaly</span>
        </div>
      </div>

      {validHops.length === 0 && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90 p-4 text-center">
          <Globe className="w-8 h-8 text-[#6B6478]/40 mb-2" />
          <p className="text-xs text-[#241F31] font-heading font-semibold">
            No public transit IP coordinates identified
          </p>
          <p className="text-[11px] text-[#6B6478] max-w-sm mt-0.5">
            Internal RFC-1918 private subnets or masked relay headers do not expose public geographic coordinates.
          </p>
        </div>
      )}
    </div>
  );
};
