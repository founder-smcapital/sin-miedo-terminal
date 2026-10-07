import React, { useState, useMemo, useRef, useEffect } from "react";
import * as d3 from "d3";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  ShieldAlert,
  Navigation,
  Anchor,
  AlertTriangle,
  Radio,
  Eye,
  Info,
  ChevronRight,
  Sparkles,
  Map as MapIcon,
  X
} from "lucide-react";
import { WORLD_LAND_GEO, WORLD_BORDERS_GEO } from "../data/worldMapData";

export interface TacticalCorridorNode {
  id: string;
  name: string;
  category: "chokepoint" | "terminal" | "flashpoint" | "bypass" | "destination";
  coordinates: [number, number]; // [longitude, latitude]
  riskLevel: number; // 0-100
  threatStatus: "CRITICAL" | "ELEVATED" | "WATCH" | "SECURE TERMINAL" | "BYPASS ROUTE";
  flowShare: string;
  volume: string;
  role: string;
  vulnerability: string;
  rerouteNote?: string;
}

export const CORRIDOR_NODES: TacticalCorridorNode[] = [
  {
    id: "malacca-singapore",
    name: "Strait of Malacca & Singapore",
    category: "chokepoint",
    coordinates: [103.85, 1.29],
    riskLevel: 62,
    threatStatus: "WATCH",
    flowShare: "22% Global Oil Flow",
    volume: "16.2M bpd Crude Transit",
    role: "Primary western entry gate to Pacific; narrow 1.5 NM bottleneck at Phillips Channel.",
    vulnerability: "Heavy traffic density, draft limits (<20.5m), asymmetric interception risks.",
    rerouteNote: "Diverts via Sunda (+3 days) or deep-draft Lombok (+4.5 days)."
  },
  {
    id: "natuna-basin",
    name: "Natuna Sea Energy Corridor",
    category: "flashpoint",
    coordinates: [108.3, 4.0],
    riskLevel: 48,
    threatStatus: "WATCH",
    flowShare: "Regional Offshore Artery",
    volume: "8.5M bpd Transit + Gas",
    role: "Southern entrance to SCS; critical Indonesian EEZ natural gas and condensate zone.",
    vulnerability: "Naval patrols, overlapping maritime claims, maritime militia presence."
  },
  {
    id: "spratly-sector",
    name: "Spratly Islands Flashpoint",
    category: "flashpoint",
    coordinates: [114.5, 9.8],
    riskLevel: 78,
    threatStatus: "ELEVATED",
    flowShare: "$3.4T Global Commerce",
    volume: "Supertanker High-Density Fairway",
    role: "Heavily fortified island reefs with radar stations, missile bastions, and naval airstrips.",
    vulnerability: "Zone of active electronic jamming, naval shadowing, and military confrontations."
  },
  {
    id: "paracel-sector",
    name: "Paracel Islands Air-Sea Bastion",
    category: "flashpoint",
    coordinates: [112.0, 16.5],
    riskLevel: 68,
    threatStatus: "ELEVATED",
    flowShare: "North-Central SCS Conduit",
    volume: "12.0M bpd Equivalent",
    role: "Forward naval outpost commanding northern approaches to the Hainan nuclear submarine base.",
    vulnerability: "Air defense identification enforcement, live-fire exercise closures."
  },
  {
    id: "taiwan-luzon",
    name: "Taiwan Strait & Luzon Passage",
    category: "flashpoint",
    coordinates: [119.8, 22.8],
    riskLevel: 74,
    threatStatus: "CRITICAL",
    flowShare: "Northeast Asia Gatekeeper",
    volume: "14.5M bpd Crude + Semiconductors",
    role: "Vital trade artery linking South China Sea to Japan, South Korea, and Northern China.",
    vulnerability: "Immediate exposure to potential military blockade, maritime exclusion zones."
  },
  {
    id: "ningbo-zhoushan",
    name: "Port of Ningbo-Zhoushan",
    category: "terminal",
    coordinates: [121.85, 29.88],
    riskLevel: 16,
    threatStatus: "SECURE TERMINAL",
    flowShare: "World #1 Port by Tonnage",
    volume: "14.2M bpd Intake (1.32B Tons/Yr)",
    role: "Primary crude reception terminal; houses Sinopec mega-refineries and national strategic crude reserves (SPR).",
    vulnerability: "Regional choke downstream if East China Sea or Taiwan Strait is interdicted."
  },
  {
    id: "lombok-strait",
    name: "Lombok & Makassar Bypass",
    category: "bypass",
    coordinates: [115.7, -8.3],
    riskLevel: 32,
    threatStatus: "BYPASS ROUTE",
    flowShare: "Strategic Alternate Artery",
    volume: "3.5M bpd Current (Capacity 15M+)",
    role: "Unrestricted deep-water passage (>250m draft) capable of handling fully laden 300,000+ DWT VLCCs.",
    vulnerability: "Adds 1,200 nautical miles and +$450k bunker fuel cost per voyage."
  },
  {
    id: "tokyo-bay",
    name: "Tokyo Bay Terminal Complex",
    category: "destination",
    coordinates: [139.7, 35.3],
    riskLevel: 14,
    threatStatus: "SECURE TERMINAL",
    flowShare: "Pacific Megaterminal",
    volume: "3.4M bpd Imported Crude",
    role: "Feeds Japan's central refining grid (Chiba, Yokohama, Kawasaki). Highly dependent on Malacca flow.",
    vulnerability: "Over 85% reliant on seaborne transit via Malacca and South China Sea arteries.",
    rerouteNote: "Relies on emergency IEA release buffer and domestic 200-day reserves."
  }
];

interface MalaccaScsCorridorMapProps {
  onClose?: () => void;
  onSwitchToIndoPacificPreset?: () => void;
  satelliteImageSrc?: string;
}

export const MalaccaScsCorridorMap: React.FC<MalaccaScsCorridorMapProps> = ({
  onClose,
  onSwitchToIndoPacificPreset,
  satelliteImageSrc
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 820,
    height: 480
  });

  // Mode toggle: Tactical Vector Map (default, matching main map) vs Satellite Recon Imagery
  const [viewMode, setViewMode] = useState<"vector" | "satellite">("vector");

  // Map interactive controls
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState<string>("malacca-singapore");
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Drag-to-pan refs
  const isDraggingRef = useRef(false);
  const dragMovedRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Layer filters
  const [showPrimaryFlow, setShowPrimaryFlow] = useState<boolean>(true);
  const [showBypassFlow, setShowBypassFlow] = useState<boolean>(true);
  const [showHazardHalos, setShowHazardHalos] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);

  // Dynamic responsive sizing
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (width > 0) {
          const targetHeight = Math.max(440, Math.min(560, Math.round(width * 0.58)));
          setDimensions({ width, height: targetHeight });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Support mouse wheel zooming with passive: false to prevent scrolling the parent page
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.08 : -0.08;
      setZoomLevel((z) => {
        const next = +(z + delta).toFixed(2);
        return Math.max(0.4, Math.min(2.5, next));
      });
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    dragMovedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...panOffset };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      dragMovedRef.current = true;
    }
    setPanOffset({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy
    });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Focused Indo-Pacific / Malacca -> South China Sea -> Ningbo Mercator Projection
  // Calibrated to fit the full corridor (from Lombok in the south to Tokyo Bay in the northeast)
  const { projection, pathGenerator } = useMemo(() => {
    const { width, height } = dimensions;
    // Calibrated center over central South China Sea [118°E, 13.5°N]
    // Captures Singapore (103°E) and Indian Ocean approach on the west, Ningbo (122°E) and Tokyo (139°E) on the northeast,
    // and Lombok/Java (-8°S) on the south
    const baseScale = Math.min(width * 0.58, height * 0.94);
    const proj = d3
      .geoMercator()
      .center([118, 13.5])
      .scale(baseScale * zoomLevel)
      .translate([width / 2 + panOffset.x, height / 2 + panOffset.y])
      .clipExtent([[-50, -50], [width + 50, height + 50]]);

    const path = d3.geoPath().projection(proj);
    return { projection: proj, pathGenerator: path };
  }, [dimensions, zoomLevel, panOffset]);

  // Precompute world landmass paths for visible Indo-Pacific corridor
  const landPaths = useMemo(() => {
    return WORLD_LAND_GEO.features
      .map((feature: any, idx: number) => ({
        id: `land-${idx}`,
        d: pathGenerator(feature)
      }))
      .filter((item: any) => Boolean(item.d));
  }, [pathGenerator]);

  // Subtle coordinate graticules
  const graticulePath = useMemo(() => {
    const graticule = d3.geoGraticule().step([10, 10]);
    return pathGenerator(graticule() as any);
  }, [pathGenerator]);

  // Country borders
  const bordersPath = useMemo(() => {
    if (!WORLD_BORDERS_GEO) return null;
    return pathGenerator(WORLD_BORDERS_GEO as any);
  }, [pathGenerator]);

  // Primary Crude Corridor Spline: Indian Ocean -> Malacca -> Singapore -> SCS -> Taiwan Strait -> Ningbo-Zhoushan
  const primaryFlowPathData = useMemo(() => {
    const waypoints: [number, number][] = [
      [96.0, 5.0],    // Entrance from Indian Ocean / Andaman Sea
      [99.0, 3.8],    // Northern Malacca approach
      [101.5, 2.5],   // Malacca Strait narrows
      [103.85, 1.29], // Singapore Port & Phillips Channel
      [105.8, 2.8],   // South China Sea western funnel
      [108.5, 4.5],   // Natuna Sea passage
      [112.5, 9.5],   // Main supertanker deep-water fairway (west of Spratlys)
      [115.5, 15.0],  // Central SCS basin
      [118.5, 19.8],  // Approach to Luzon Strait / South of Taiwan
      [120.2, 23.5],  // Taiwan Strait passage
      [121.85, 29.88] // Port of Ningbo-Zhoushan (Discharge Megaterminal)
    ];

    const pts = waypoints
      .map((wp) => projection(wp))
      .filter((p): p is [number, number] => p !== null && !isNaN(p[0]) && !isNaN(p[1]));

    if (pts.length < 2) return null;

    const lineGen = d3
      .line<[number, number]>()
      .x((d) => d[0])
      .y((d) => d[1])
      .curve(d3.curveCatmullRom.alpha(0.5));

    return lineGen(pts);
  }, [projection]);

  // Secondary Northeast Extension: Ningbo-Zhoushan -> Tokyo Bay & Busan
  const pacificFlowPathData = useMemo(() => {
    const waypoints: [number, number][] = [
      [121.85, 29.88], // Ningbo-Zhoushan
      [125.5, 31.0],   // East China Sea outer fairway
      [129.5, 32.5],   // Kyushu approaches
      [134.0, 33.5],   // Pacific coastal route
      [139.7, 35.3]    // Tokyo Bay
    ];

    const pts = waypoints
      .map((wp) => projection(wp))
      .filter((p): p is [number, number] => p !== null && !isNaN(p[0]) && !isNaN(p[1]));

    if (pts.length < 2) return null;

    const lineGen = d3
      .line<[number, number]>()
      .x((d) => d[0])
      .y((d) => d[1])
      .curve(d3.curveCatmullRom.alpha(0.5));

    return lineGen(pts);
  }, [projection]);

  // Strategic Bypass Corridor Spline: Lombok Strait -> Makassar Strait -> Celebes Sea -> Philippine Sea -> Ningbo
  const bypassFlowPathData = useMemo(() => {
    const waypoints: [number, number][] = [
      [115.7, -8.3],  // Lombok Strait
      [117.5, -4.5],  // Java Sea eastern gap
      [118.5, -1.0],  // Makassar Strait
      [121.0, 2.0],   // Celebes Sea
      [125.5, 6.5],   // South of Philippines
      [127.5, 14.0],  // Philippine Sea deep-water trench
      [126.5, 22.0],  // East of Taiwan
      [124.5, 27.0],  // East China Sea outer rim
      [121.85, 29.88] // Port of Ningbo-Zhoushan
    ];

    const pts = waypoints
      .map((wp) => projection(wp))
      .filter((p): p is [number, number] => p !== null && !isNaN(p[0]) && !isNaN(p[1]));

    if (pts.length < 2) return null;

    const lineGen = d3
      .line<[number, number]>()
      .x((d) => d[0])
      .y((d) => d[1])
      .curve(d3.curveCatmullRom.alpha(0.5));

    return lineGen(pts);
  }, [projection]);

  // Selected node object
  const activeNode = useMemo(() => {
    return (
      CORRIDOR_NODES.find((n) => n.id === (hoveredNodeId || selectedNodeId)) ||
      CORRIDOR_NODES[0]
    );
  }, [selectedNodeId, hoveredNodeId]);

  // Color helper matching main map
  const getNodeColor = (node: TacticalCorridorNode) => {
    if (node.category === "terminal") return "#10B981"; // Emerald for mega-terminal
    if (node.category === "bypass") return "#E5C794";   // Amber for bypass route
    if (node.riskLevel >= 70) return "#EF4444";       // Red for critical war-risk / flashpoints
    if (node.riskLevel >= 50) return "#F59E0B";       // Amber-orange for elevated watch
    return "#38BDF8";                                 // Cyan for standard
  };

  return (
    <div className="flex flex-col space-y-3 font-mono-data text-[#EDE9DE]">
      {/* Top Header & View Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#38BDF8]/20">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-[#38BDF8]/20 border border-[#38BDF8]/40 text-[#38BDF8] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            <Radio className="w-3 h-3 text-[#38BDF8] animate-pulse" />
            Tactical Vector Corridor Map
          </span>
          <span className="text-[10px] text-[#8292A6] hidden sm:inline">
            Vector: Malacca &rarr; South China Sea &rarr; Ningbo-Zhoushan
          </span>
        </div>

        {/* View Mode Switcher: Vector vs Satellite */}
        <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-lg border border-[#38BDF8]/30 text-[10px]">
          <button
            onClick={() => setViewMode("vector")}
            className={`px-2.5 py-1 rounded transition-all font-bold flex items-center gap-1.5 ${
              viewMode === "vector"
                ? "bg-[#38BDF8] text-[#08101C] shadow-md"
                : "text-[#BAC7D5] hover:text-[#EDE9DE]"
            }`}
          >
            <MapIcon className="w-3 h-3" />
            <span>Tactical Vector Map</span>
          </button>
          {satelliteImageSrc && (
            <button
              onClick={() => setViewMode("satellite")}
              className={`px-2.5 py-1 rounded transition-all font-bold flex items-center gap-1.5 ${
                viewMode === "satellite"
                  ? "bg-[#E5C794] text-[#08101C] shadow-md"
                  : "text-[#BAC7D5] hover:text-[#EDE9DE]"
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Satellite Imagery</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Map Container */}
      {viewMode === "vector" ? (
        <div
          ref={containerRef}
          id="tactical-corridor-vector-map-frame"
          className="relative rounded-lg overflow-hidden border border-[#22354E] bg-[#070C16] shadow-2xl select-none"
          style={{ minHeight: "420px" }}
        >
          {/* SVG Canvas */}
          <svg
            width={dimensions.width}
            height={dimensions.height}
            className="w-full h-auto block cursor-grab active:cursor-grabbing"
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <defs>
              {/* Heat blur filter matching main map */}
              <filter id="corridor-heat-blur" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur" />
              </filter>

              {/* Glowing gradients for hazard nodes */}
              {CORRIDOR_NODES.map((node) => {
                const color = getNodeColor(node);
                return (
                  <radialGradient key={`grad-${node.id}`} id={`corridor-grad-${node.id}`}>
                    <stop offset="0%" stopColor={color} stopOpacity="0.65" />
                    <stop offset="40%" stopColor={color} stopOpacity="0.28" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                  </radialGradient>
                );
              })}

              {/* Pulse animation for radar rings */}
              <style>{`
                @keyframes pulse-corridor-ring {
                  0% { r: 6px; opacity: 0.9; }
                  70% { r: 24px; opacity: 0.1; }
                  100% { r: 30px; opacity: 0; }
                }
                .corridor-radar-pulse {
                  transform-origin: center;
                  animation: pulse-corridor-ring 3s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
                }
              `}</style>
            </defs>

            {/* 1. Subtle Ocean Grid / Graticules */}
            <g className="graticules" opacity="0.18">
              {graticulePath && (
                <path
                  d={graticulePath}
                  fill="none"
                  stroke="#1E293B"
                  strokeWidth="0.75"
                  strokeDasharray="2 4"
                />
              )}
            </g>

            {/* 2. Authentic Landmasses - Natural Earth 1:110m (Matching Main Map) */}
            <g className="landmasses">
              {landPaths.map((item: any) => (
                <path
                  key={item.id}
                  d={item.d}
                  fill="#131F30"
                  stroke="#2D435E"
                  strokeWidth="1.1"
                  className="transition-colors hover:fill-[#17263B]"
                />
              ))}
            </g>

            {/* 3. Subtle International Borders */}
            <g className="country-borders" opacity="0.32">
              {bordersPath && (
                <path
                  d={bordersPath}
                  fill="none"
                  stroke="#23354B"
                  strokeWidth="0.6"
                  strokeDasharray="2 3"
                />
              )}
            </g>

            {/* 4. Ambient Tactical Hazard Halos (Matching Main Map) */}
            {showHazardHalos && (
              <g className="hazard-halos" filter="url(#corridor-heat-blur)">
                {CORRIDOR_NODES.map((node) => {
                  const coords = projection(node.coordinates);
                  if (!coords) return null;
                  const [cx, cy] = coords;
                  const radius = node.riskLevel >= 70 ? 45 : node.category === "terminal" ? 38 : 28;

                  return (
                    <circle
                      key={`halo-${node.id}`}
                      cx={cx}
                      cy={cy}
                      r={radius}
                      fill={`url(#corridor-grad-${node.id})`}
                      pointerEvents="none"
                    />
                  );
                })}
              </g>
            )}

            {/* 5. Strategic Shipping Corridors (Matching Main Map) */}
            <g className="corridors-layer">
              {/* Alternate Bypass Corridor (Dashed Amber) */}
              {showBypassFlow && bypassFlowPathData && (
                <g className="bypass-flow-group">
                  {/* Ambient Glow */}
                  <path
                    d={bypassFlowPathData}
                    fill="none"
                    stroke="#E5C794"
                    strokeWidth="3.5"
                    strokeOpacity="0.22"
                    strokeLinecap="round"
                  />
                  {/* Dashed Conduit */}
                  <path
                    d={bypassFlowPathData}
                    fill="none"
                    stroke="#E5C794"
                    strokeWidth="1.8"
                    strokeOpacity="0.85"
                    strokeDasharray="5 4"
                    strokeLinecap="round"
                  />
                </g>
              )}

              {/* Primary Crude Conduit (Luminous Cyan) */}
              {showPrimaryFlow && primaryFlowPathData && (
                <g className="primary-flow-group">
                  {/* Wide Ambient Glow */}
                  <path
                    d={primaryFlowPathData}
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="5"
                    strokeOpacity="0.25"
                    strokeLinecap="round"
                  />
                  {/* Crisp Solid Conduit */}
                  <path
                    d={primaryFlowPathData}
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="2.2"
                    strokeOpacity="0.95"
                    strokeLinecap="round"
                  />
                </g>
              )}

              {/* Pacific Extension to Japan (Cyan) */}
              {showPrimaryFlow && pacificFlowPathData && (
                <g className="pacific-flow-group">
                  <path
                    d={pacificFlowPathData}
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="3"
                    strokeOpacity="0.2"
                    strokeLinecap="round"
                  />
                  <path
                    d={pacificFlowPathData}
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="1.6"
                    strokeOpacity="0.8"
                    strokeDasharray="3 3"
                    strokeLinecap="round"
                  />
                </g>
              )}
            </g>

            {/* 6. Tactical Waypoint Markers & Interactive Callout Badges */}
            <g className="waypoints-layer">
              {CORRIDOR_NODES.map((node) => {
                const coords = projection(node.coordinates);
                if (!coords) return null;
                const [cx, cy] = coords;
                const isSelected = node.id === selectedNodeId;
                const isHovered = node.id === hoveredNodeId;
                const color = getNodeColor(node);
                const isCrit = node.riskLevel >= 70;

                return (
                  <g
                    key={`node-${node.id}`}
                    transform={`translate(${cx}, ${cy})`}
                    className="cursor-pointer transition-transform group"
                    onClick={(e) => {
                      if (dragMovedRef.current) return;
                      e.stopPropagation();
                      setSelectedNodeId(node.id);
                    }}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                  >
                    {/* Animated Pulsing Radar Rings for Critical Points or Selected */}
                    {(isCrit || isSelected || node.category === "terminal") && (
                      <circle
                        cx="0"
                        cy="0"
                        r="20"
                        fill="none"
                        stroke={color}
                        strokeWidth="1.5"
                        className="corridor-radar-pulse"
                      />
                    )}

                    {/* Concentric Static Radar Ring */}
                    <circle
                      cx="0"
                      cy="0"
                      r={isSelected ? 10 : 7}
                      fill="none"
                      stroke={color}
                      strokeWidth="1.2"
                      strokeOpacity="0.6"
                    />

                    {/* Core Beacon Dot */}
                    <circle
                      cx="0"
                      cy="0"
                      r={isSelected ? 5 : 3.5}
                      fill={color}
                      stroke="#070C16"
                      strokeWidth="1.5"
                    />

                    {/* Tactical Pill Label (Matching Main Map Design) */}
                    {showLabels && (
                      <g
                        transform={
                          node.id === "malacca-singapore"
                            ? "translate(12, 4)"
                            : node.id === "ningbo-zhoushan"
                            ? "translate(-185, -16)"
                            : node.id === "tokyo-bay"
                            ? "translate(-170, 8)"
                            : node.id === "taiwan-luzon"
                            ? "translate(12, -8)"
                            : node.id === "spratly-sector"
                            ? "translate(12, 10)"
                            : node.id === "paracel-sector"
                            ? "translate(-130, -14)"
                            : node.id === "natuna-basin"
                            ? "translate(12, 12)"
                            : node.id === "lombok-strait"
                            ? "translate(12, -12)"
                            : "translate(12, -4)"
                        }
                      >
                        {/* Pill Background */}
                        <rect
                          x="0"
                          y="0"
                          width={
                            node.category === "terminal" || node.id === "tokyo-bay"
                              ? 175
                              : node.category === "chokepoint"
                              ? 160
                              : node.id === "spratly-sector"
                              ? 155
                              : 140
                          }
                          height="20"
                          rx="4"
                          fill="#060B14"
                          fillOpacity="0.88"
                          stroke={isSelected || isHovered ? color : `${color}60`}
                          strokeWidth={isSelected || isHovered ? "1.5" : "1"}
                          className="transition-all"
                        />
                        {/* Label Text */}
                        <text
                          x="7"
                          y="13"
                          fill="#EDE9DE"
                          fontSize="9.5"
                          fontWeight={isSelected ? "bold" : "600"}
                          fontFamily="monospace"
                        >
                          {node.name.length > 20 ? node.name.slice(0, 19) + "…" : node.name}
                        </text>
                        {/* Risk / Status Badge inside pill */}
                        <text
                          x={
                            node.category === "terminal" || node.id === "tokyo-bay"
                              ? 168
                              : node.category === "chokepoint"
                              ? 153
                              : node.id === "spratly-sector"
                              ? 148
                              : 133
                          }
                          y="13"
                          textAnchor="end"
                          fill={color}
                          fontSize="9"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {node.category === "terminal"
                            ? "#1 PORT"
                            : node.id === "tokyo-bay"
                            ? "TERMINAL"
                            : node.category === "bypass"
                            ? "BYPASS"
                            : `${node.riskLevel}`}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Floating Tactical Zoom Controls (Top Right, Identical to Main Map) */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/80 backdrop-blur-md p-1 rounded-lg border border-[#B08D57]/30 shadow-lg z-10">
            <span className="text-[10px] text-[#BAC7D5] px-1 font-mono-data font-bold">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.5, +(z + 0.15).toFixed(2)))}
              className="p-1 rounded hover:bg-white/10 text-[#BAC7D5] hover:text-[#E5C794] transition-colors"
              title="Zoom In (+15%)"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.4, +(z - 0.15).toFixed(2)))}
              className="p-1 rounded hover:bg-white/10 text-[#BAC7D5] hover:text-[#E5C794] transition-colors"
              title="Zoom Out (View Full Picture, down to 40%)"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setZoomLevel(1.0);
                setPanOffset({ x: 0, y: 0 });
              }}
              className="p-1 rounded hover:bg-white/10 text-[#BAC7D5] hover:text-[#E5C794] transition-colors"
              title="Reset to Full Picture View"
              aria-label="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Floating Map Layers Toggle (Top Left) */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg border border-[#38BDF8]/30 text-[10px] text-[#BAC7D5]">
            <span className="flex items-center gap-1 text-[#38BDF8] font-bold">
              <Layers className="w-3 h-3" />
              <span>Layers:</span>
            </span>
            <button
              onClick={() => setShowPrimaryFlow(!showPrimaryFlow)}
              className={`px-1.5 py-0.5 rounded transition-all ${
                showPrimaryFlow ? "bg-[#38BDF8]/25 text-[#38BDF8] font-bold border border-[#38BDF8]/40" : "opacity-40"
              }`}
            >
              Crude Artery
            </button>
            <button
              onClick={() => setShowBypassFlow(!showBypassFlow)}
              className={`px-1.5 py-0.5 rounded transition-all ${
                showBypassFlow ? "bg-[#E5C794]/25 text-[#E5C794] font-bold border border-[#E5C794]/40" : "opacity-40"
              }`}
            >
              Lombok Bypass
            </button>
            <button
              onClick={() => setShowHazardHalos(!showHazardHalos)}
              className={`px-1.5 py-0.5 rounded transition-all ${
                showHazardHalos ? "bg-[#EF4444]/25 text-[#EF4444] font-bold border border-[#EF4444]/40" : "opacity-40"
              }`}
            >
              Risk Halos
            </button>
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`px-1.5 py-0.5 rounded transition-all ${
                showLabels ? "bg-white/15 text-[#EDE9DE] font-bold" : "opacity-40"
              }`}
            >
              Labels
            </button>
          </div>

          {/* Floating Telemetry Strip (Bottom of Map) */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-black/80 backdrop-blur-md border border-[#38BDF8]/30 text-[10px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[#38BDF8] font-bold">PRIMARY CRUDE ARTERY:</span>
              <span className="text-[#EDE9DE]">~16.2M bpd (Strait of Malacca &rarr; East Asia)</span>
            </div>
            <div className="flex items-center gap-3 text-[#8292A6]">
              <span>Global Flow Share: <strong className="text-[#EDE9DE]">~22%</strong></span>
              <span>Discharge Terminal: <strong className="text-[#10B981]">Port of Ningbo-Zhoushan</strong></span>
            </div>
          </div>
        </div>
      ) : (
        /* Satellite Recon Imagery View (Toggled when user clicks Satellite tab) */
        <div className="relative rounded-lg overflow-hidden border border-[#22354E] bg-[#070C16] shadow-xl">
          {satelliteImageSrc && (
            <img
              src={satelliteImageSrc}
              alt="Maritime trade flow visualization from Strait of Malacca through the South China Sea to East Asia"
              referrerPolicy="no-referrer"
              className="w-full h-auto object-cover max-h-[440px] block"
            />
          )}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-black/75 backdrop-blur-md border border-[#38BDF8]/30 text-[10px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[#38BDF8] font-bold">AI SATELLITE TELEMETRY OVERLAY</span>
            </div>
            <span className="text-[#8292A6]">
              Resolution: 4K Synthetic Orbital Bathymetry & Radar Reconstruct
            </span>
          </div>
        </div>
      )}

      {/* Interactive Tactical Intelligence Dossier of Selected Hub */}
      <div className="bg-[#060B14] border border-[#B08D57]/30 rounded-lg p-3 sm:p-3.5 shadow-lg">
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#B08D57]/20 pb-2 mb-2.5">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getNodeColor(activeNode) }}
              />
              <span className="text-xs font-bold text-[#FBF8F1] tracking-wide font-sans">
                {activeNode.name}
              </span>
              <span
                className="text-[9px] font-mono-data font-bold uppercase px-2 py-0.5 rounded border"
                style={{
                  color: getNodeColor(activeNode),
                  borderColor: `${getNodeColor(activeNode)}60`,
                  backgroundColor: `${getNodeColor(activeNode)}15`
                }}
              >
                {activeNode.threatStatus}
              </span>
            </div>
            <p className="text-[11px] text-[#BAC7D5] mt-1 leading-snug font-sans">
              {activeNode.role}
            </p>
          </div>

          <div className="text-right shrink-0">
            <div className="text-[10px] text-[#8292A6]">Flow Volume</div>
            <div className="text-xs font-bold text-[#EDE9DE] font-mono-data">
              {activeNode.volume}
            </div>
          </div>
        </div>

        {/* Telemetry Micro-Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
          <div className="bg-black/40 p-2 rounded border border-[#B08D57]/15">
            <span className="text-[#8292A6] block uppercase tracking-wider text-[9px]">Global Strategic Share</span>
            <span className="font-bold text-[#E5C794] text-[11px] mt-0.5 block">
              {activeNode.flowShare}
            </span>
          </div>
          <div className="bg-black/40 p-2 rounded border border-[#B08D57]/15">
            <span className="text-[#8292A6] block uppercase tracking-wider text-[9px]">Primary Vulnerability</span>
            <span className="text-[#FFA4A4] font-medium text-[10.5px] mt-0.5 block leading-tight">
              {activeNode.vulnerability}
            </span>
          </div>
          <div className="bg-black/40 p-2 rounded border border-[#B08D57]/15">
            <span className="text-[#8292A6] block uppercase tracking-wider text-[9px]">Reroute / Mitigation</span>
            <span className="text-[#BAC7D5] text-[10.5px] mt-0.5 block leading-tight">
              {activeNode.rerouteNote || "Requires East Asia strategic petroleum reserve (SPR) release buffer."}
            </span>
          </div>
        </div>
      </div>

      {/* Strategic Supply Chain Risk Breakdown Grid (The 4 Core Quadrants) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
        {/* Point 1: Malacca / Singapore */}
        <button
          onClick={() => setSelectedNodeId("malacca-singapore")}
          className={`text-left p-2.5 rounded-lg border transition-all flex flex-col justify-between ${
            selectedNodeId === "malacca-singapore"
              ? "bg-[#B08D57]/20 border-[#B08D57] shadow-md"
              : "bg-black/40 border-[#B08D57]/20 hover:border-[#B08D57]/50"
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-[10px] text-[#B08D57] font-bold uppercase">
              <span>1. Malacca & Singapore</span>
              <span className="text-[#10B981]">Choke Gateway</span>
            </div>
            <div className="text-xs font-bold text-[#EDE9DE] mt-1 font-sans">
              16.2M bpd Crude Transit
            </div>
            <p className="text-[11px] font-sans text-[#BAC7D5] mt-1 leading-snug">
              Supplies ~85% of East Asian imported crude. Narrow navigable fairway (1.5 NM) creates extreme physical bottlenecking.
            </p>
          </div>
          <div className="mt-2 pt-1.5 border-t border-[#B08D57]/15 text-[9px] text-[#8292A6]">
            Vulnerability: Piracy & draft depth limits
          </div>
        </button>

        {/* Point 2: South China Sea Basin */}
        <button
          onClick={() => setSelectedNodeId("spratly-sector")}
          className={`text-left p-2.5 rounded-lg border transition-all flex flex-col justify-between ${
            selectedNodeId === "spratly-sector"
              ? "bg-[#38BDF8]/20 border-[#38BDF8] shadow-md"
              : "bg-black/40 border-[#38BDF8]/20 hover:border-[#38BDF8]/50"
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-[10px] text-[#38BDF8] font-bold uppercase">
              <span>2. South China Sea Basin</span>
              <span className="text-[#38BDF8]">Transit Artery</span>
            </div>
            <div className="text-xs font-bold text-[#EDE9DE] mt-1 font-sans">
              $3.4T Annual Maritime Flow
            </div>
            <p className="text-[11px] font-sans text-[#BAC7D5] mt-1 leading-snug">
              High-density supertanker corridor passing Natuna Sea and Spratly sectors, subject to overlapping exclusive economic zones (EEZ).
            </p>
          </div>
          <div className="mt-2 pt-1.5 border-t border-[#38BDF8]/15 text-[9px] text-[#8292A6]">
            Vulnerability: Naval shadowing & electronic jamming
          </div>
        </button>

        {/* Point 3: Taiwan & Luzon Strait Approaches */}
        <button
          onClick={() => setSelectedNodeId("taiwan-luzon")}
          className={`text-left p-2.5 rounded-lg border transition-all flex flex-col justify-between ${
            selectedNodeId === "taiwan-luzon"
              ? "bg-[#EF4444]/20 border-[#EF4444] shadow-md"
              : "bg-black/40 border-[#EF4444]/25 hover:border-[#EF4444]/50"
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-[10px] text-[#EF4444] font-bold uppercase">
              <span>3. Taiwan / Luzon Passage</span>
              <span className="text-[#EF4444]">High Risk Watch</span>
            </div>
            <div className="text-xs font-bold text-[#EDE9DE] mt-1 font-sans">
              Northeast Inbound Conduit
            </div>
            <p className="text-[11px] font-sans text-[#BAC7D5] mt-1 leading-snug">
              Flanks the Taiwan Strait and Bashi Channel towards Japan and China. Immediate sensitivity to naval transit alerts.
            </p>
          </div>
          <div className="mt-2 pt-1.5 border-t border-[#EF4444]/15 text-[9px] text-[#8292A6]">
            Vulnerability: Regional standoff or blockade
          </div>
        </button>

        {/* Point 4: Ningbo-Zhoushan Megaterminals */}
        <button
          onClick={() => setSelectedNodeId("ningbo-zhoushan")}
          className={`text-left p-2.5 rounded-lg border transition-all flex flex-col justify-between ${
            selectedNodeId === "ningbo-zhoushan"
              ? "bg-[#10B981]/20 border-[#10B981] shadow-md"
              : "bg-black/40 border-[#10B981]/25 hover:border-[#10B981]/50"
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-[10px] text-[#10B981] font-bold uppercase">
              <span>4. Ningbo-Zhoushan</span>
              <span className="text-[#10B981]">World #1 Port</span>
            </div>
            <div className="text-xs font-bold text-[#EDE9DE] mt-1 font-sans">
              14.2M bpd Equiv Intake
            </div>
            <p className="text-[11px] font-sans text-[#BAC7D5] mt-1 leading-snug">
              World’s largest cargo port by tonnage (1.3B+ tons/yr) and core Asian SPR offloading hub. Supplies Sinopec mega-refineries.
            </p>
          </div>
          <div className="mt-2 pt-1.5 border-t border-[#10B981]/15 text-[9px] text-[#8292A6]">
            Reroute delta: +3 to 4 days eastward via Ryukyu
          </div>
        </button>
      </div>

      {/* Modal Footer Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-1 border-t border-[#38BDF8]/20">
        <span className="text-[10px] text-[#8292A6]">
          Cartography: Tactical D3 Vector Corridor Engine &bull; Matched to Global Macro Map
        </span>
        <div className="flex items-center gap-2">
          {onSwitchToIndoPacificPreset && (
            <button
              onClick={onSwitchToIndoPacificPreset}
              className="px-3 py-1.5 rounded bg-[#E5C794] hover:bg-[#D4B27B] text-[#0A101A] font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Switch Main Map to Indo-Pacific</span>
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-black/50 border border-[#8292A6]/30 hover:border-[#EDE9DE] text-[#EDE9DE] text-xs transition-colors"
            >
              Close Recon View
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
