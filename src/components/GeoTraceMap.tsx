import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { RoutingHop } from '../types.ts';
import { MapPin, AlertTriangle, ShieldCheck } from 'lucide-react';

interface GeoTraceMapProps {
  hops: RoutingHop[];
  selectedHopIndex?: number | null;
  onSelectHop?: (index: number) => void;
}

export const GeoTraceMap: React.FC<GeoTraceMapProps> = ({
  hops,
  selectedHopIndex,
  onSelectHop,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);

  // Filter public hops with valid coordinates
  const validHops = hops.filter(
    (h) => !h.is_private && typeof h.lat === 'number' && typeof h.lon === 'number'
  );

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map if not yet created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [25, 10],
        zoom: 2,
        minZoom: 1.5,
        maxZoom: 16,
        zoomControl: true,
        attributionControl: false,
      });

      // Dark carto tiles to integrate with #07111F palette
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          maxZoom: 19,
          subdomains: 'abcd',
        }
      ).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear old markers and lines
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (validHops.length === 0) {
      map.setView([20, 0], 2);
      return;
    }

    const latLngs: [number, number][] = [];

    validHops.forEach((hop, idx) => {
      if (hop.lat === undefined || hop.lon === undefined) return;
      const pos: [number, number] = [hop.lat, hop.lon];
      latLngs.push(pos);

      const isSelected = selectedHopIndex === hop.hop_index;
      const isOrigin = idx === 0;
      const isDestination = idx === validHops.length - 1;
      const isAnomalous = hop.anomalous;

      let bgColor = '#3B82F6'; // Default relay
      let label = `Hop ${hop.hop_index}`;

      if (isAnomalous) {
        bgColor = '#EF4444';
        label = `Hop ${hop.hop_index} (Anomaly)`;
      } else if (isOrigin) {
        bgColor = '#8B5CF6';
        label = `Origin Hop ${hop.hop_index}`;
      } else if (isDestination) {
        bgColor = '#22C55E';
        label = `Destination Hop ${hop.hop_index}`;
      }

      // Custom HTML Marker Pin
      const iconHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px;">
          ${
            isAnomalous
              ? `<div style="position: absolute; width: 36px; height: 36px; border-radius: 9999px; background-color: rgba(239, 68, 68, 0.45); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
              : ''
          }
          <div style="
            width: ${isSelected ? '32px' : '26px'};
            height: ${isSelected ? '32px' : '26px'};
            border-radius: 9999px;
            background-color: ${bgColor};
            border: 2px solid #F8FAFC;
            box-shadow: 0 4px 12px rgba(0,0,0,0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #F8FAFC;
            font-weight: 700;
            font-size: ${isSelected ? '12px' : '11px'};
            font-family: monospace;
            transition: transform 0.2s ease;
          ">
            ${hop.hop_index}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'geotrace-hop-marker',
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18],
      });

      const marker = L.marker(pos, { icon: customIcon }).addTo(map);

      // Popup Content styled in dark theme
      const popupHtml = `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 220px; padding: 6px; background-color: #122338; color: #F8FAFC; border-radius: 8px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; border-bottom: 1px solid #29415D; padding-bottom: 4px;">
            <span style="font-weight: 700; font-size: 13px; color: ${bgColor};">
              ${label}
            </span>
            <span style="font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; background-color: #172C46; color: #60A5FA;">
              ${isOrigin ? 'Candidate Origin' : isDestination ? 'Inbound Edge' : 'MTA Relay'}
            </span>
          </div>
          <div style="font-size: 11px; color: #AFC2D8; line-height: 1.5;">
            <div><strong style="color: #F8FAFC;">IP:</strong> <span style="font-family: monospace; color: #60A5FA;">${hop.ip}</span></div>
            <div><strong style="color: #F8FAFC;">Location:</strong> ${hop.city ? `${hop.city}, ` : ''}${hop.country || 'Unknown'}</div>
            <div><strong style="color: #F8FAFC;">ISP/Org:</strong> ${hop.isp || hop.org || 'Unspecified'}</div>
            ${hop.host ? `<div><strong style="color: #F8FAFC;">Host:</strong> <span style="font-family: monospace; font-size: 10px; color: #AFC2D8;">${hop.host}</span></div>` : ''}
            ${
              hop.anomalous
                ? `<div style="margin-top: 6px; padding: 4px 6px; background-color: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 4px; color: #EF4444; font-size: 10px;">
                    <strong>Anomaly:</strong> ${hop.anomaly_reason || 'Unusual transit pattern'}
                   </div>`
                : ''
            }
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        if (onSelectHop) onSelectHop(hop.hop_index);
      });

      markersRef.current.push(marker);
    });

    // Draw connecting route polyline
    if (latLngs.length > 1) {
      polylineRef.current = L.polyline(latLngs, {
        color: '#3B82F6',
        weight: 3,
        opacity: 0.85,
        dashArray: '6, 8',
        lineCap: 'round',
      }).addTo(map);

      // Fit map viewport to encompass all transit hops
      map.fitBounds(polylineRef.current.getBounds(), {
        padding: [45, 45],
        maxZoom: 6,
      });
    } else if (latLngs.length === 1) {
      map.setView(latLngs[0], 5);
    }
  }, [hops, selectedHopIndex, onSelectHop]);

  // Handle container resize
  useEffect(() => {
    if (!mapContainerRef.current || !mapInstanceRef.current) return;
    const observer = new ResizeObserver(() => {
      mapInstanceRef.current?.invalidateSize();
    });
    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] rounded-2xl overflow-hidden border border-[#29415D] bg-[#07111F] shadow-xl shadow-black/50">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map Overlay Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-[#122338]/90 backdrop-blur-sm border border-[#29415D] rounded-xl p-3 text-xs shadow-lg text-[#F8FAFC] space-y-1.5 pointer-events-none">
        <div className="font-heading font-bold text-[11px] text-[#AFC2D8] uppercase tracking-wider mb-1">
          Relay Hop Legend
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-3 h-3 rounded-full bg-[#8B5CF6] border border-white inline-block" />
          <span>Probable Origin Relay</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-3 h-3 rounded-full bg-[#3B82F6] border border-white inline-block" />
          <span>Intermediate MTA Relay</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-3 h-3 rounded-full bg-[#22C55E] border border-white inline-block" />
          <span>Inbound Gateway</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-3 h-3 rounded-full bg-[#EF4444] border border-white inline-block" />
          <span>Geographic Anomaly / Divergence</span>
        </div>
      </div>
    </div>
  );
};
