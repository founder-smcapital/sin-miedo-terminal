import React, { useState, useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import {
  ShieldAlert,
  Flame,
  Anchor,
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  AlertTriangle,
  Radio,
  Navigation,
  Activity,
  Info,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  Sparkles,
  HelpCircle,
  X,
  Image as ImageIcon,
  Eye,
  EyeOff,
  MousePointer,
  Crosshair,
  PlusCircle,
  CheckCircle2,
  Sliders,
  Bell,
  Send,
  Trash2,
  Filter,
  MapPin,
  AlertCircle
} from "lucide-react";
import { MacroDataState } from "../types";
import {
  MARITIME_CHOKEPOINTS,
  SHIPPING_CORRIDORS,
  STRATEGIC_PIPELINES,
  ACTIVE_GEO_STRATEGIC_EVENTS,
  WORLD_LAND_GEO,
  WORLD_BORDERS_GEO,
  GeoChokepoint,
  GeoPipelineAsset,
  GeoStrategicEvent
} from "../data/worldMapData";
import { ChokepointRiskSparkline } from "./ChokepointRiskSparkline";
import { MalaccaScsCorridorMap } from "./MalaccaScsCorridorMap";

interface ChokepointHeatmapProps {
  macroData: MacroDataState;
  onOpenWarRiskEngine?: () => void;
  isExpanded?: boolean;
  onExpandToggle?: () => void;
}

type ViewPreset = "global" | "mideast" | "redsea" | "indopacific";

const ChokepointHeatmapComponent: React.FC<ChokepointHeatmapProps> = ({
  macroData,
  onOpenWarRiskEngine,
  isExpanded: propIsExpanded,
  onExpandToggle
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapViewportRef = useRef<HTMLDivElement | null>(null);

  // States
  const [selectedChokepointId, setSelectedChokepointId] = useState<string>("hormuz");
  const [hoveredCpId, setHoveredCpId] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<ViewPreset>("global");
  const [userZoom, setUserZoom] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [heatIntensity, setHeatIntensity] = useState<"high" | "medium" | "low">("medium");
  const [isCleanMode, setIsCleanMode] = useState<boolean>(true); // Default to clean, decluttered institutional view!
  const [pinDisplayMode, setPinDisplayMode] = useState<"compact" | "detailed">("compact"); // Compact pins declutter the map, detailed reveals leader lines
  const [showCorridors, setShowCorridors] = useState<boolean>(true); // Clean static vector shipping lanes (no moving dots)
  const [showPipelines, setShowPipelines] = useState<boolean>(true); // Overland strategic bypass pipelines (Petroline, ADCOP)
  const [showActiveEvents, setShowActiveEvents] = useState<boolean>(true); // Real-time geopolitical events (closures, strikes)
  const [activeEvents, setActiveEvents] = useState<GeoStrategicEvent[]>(ACTIVE_GEO_STRATEGIC_EVENTS);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>("saudi-east-west-pipeline");
  const [selectedEventId, setSelectedEventId] = useState<string | null>("evt-saudi-pipeline-shut");
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const [inspectorTab, setInspectorTab] = useState<"chokepoint" | "events" | "pipelines">("chokepoint");
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [showScsVisualModal, setShowScsVisualModal] = useState<boolean>(false);
  const [satelliteImageSrc, setSatelliteImageSrc] = useState<string | undefined>(undefined);

  const handleOpenScsModal = () => {
    setShowScsVisualModal(true);
    if (!satelliteImageSrc) {
      import("../assets/images/malacca_scs_flow_1788971019380.jpg").then((m) => {
        setSatelliteImageSrc(m.default);
      });
    }
  };
  const [showEventMonitorDrawer, setShowEventMonitorDrawer] = useState<boolean>(false);
  const [showInjectEventModal, setShowInjectEventModal] = useState<boolean>(false);
  const [targetedEventReticle, setTargetedEventReticle] = useState<{ lon: number; lat: number; id: string; label: string } | null>(null);
  const [recentIngestedToast, setRecentIngestedToast] = useState<{ title: string; id: string; timeStr: string } | null>(null);
  const [eventCategoryFilter, setEventCategoryFilter] = useState<string>("ALL");
  const [showAllCards, setShowAllCards] = useState<boolean>(true);
  const processedAlertIdsRef = useRef<Set<string>>(
    new Set(["al-saudi-pipe", "evt-saudi-pipeline-shut", "evt-houthi-asbm-bab", "evt-centcom-hormuz-counter"])
  );
  const [stressScenario, setStressScenario] = useState<"live" | "severe" | "extreme">("live");
  const [internalIsExpanded, setInternalIsExpanded] = useState<boolean>(false);
  const isExpanded = propIsExpanded !== undefined ? propIsExpanded : internalIsExpanded;

  const handleToggleExpand = async () => {
    const next = !isExpanded;
    setInternalIsExpanded(next);
    if (next) {
      try {
        if (!document.fullscreenElement && containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
      } catch (err) {
        // Fallback to overlay if iframe forbids native fullscreen
      }
    } else {
      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          await document.exitFullscreen();
        }
      } catch (err) {}
    }
    if (onExpandToggle) {
      onExpandToggle();
    }
  };

  const handleCloseExpand = async () => {
    setInternalIsExpanded(false);
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (err) {}
    if (onExpandToggle) {
      onExpandToggle();
    }
  };

  // Sync with native browser fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setInternalIsExpanded(false);
      } else if (document.fullscreenElement === containerRef.current) {
        setInternalIsExpanded(true);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 850,
    height: 520
  });

  // Synced refs for non-stale wheel event handlers
  const userZoomRef = useRef(userZoom);
  userZoomRef.current = userZoom;
  const panOffsetRef = useRef(panOffset);
  panOffsetRef.current = panOffset;

  // Drag-to-pan refs
  const isDraggingRef = useRef(false);
  const dragMovedRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mouseMoveRafRef = useRef<number | null>(null);

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
    if (mouseMoveRafRef.current) return;
    mouseMoveRafRef.current = requestAnimationFrame(() => {
      mouseMoveRafRef.current = null;
      setPanOffset({
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy
      });
    });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    if (mouseMoveRafRef.current) {
      cancelAnimationFrame(mouseMoveRafRef.current);
      mouseMoveRafRef.current = null;
    }
  };

  // Support smooth mouse wheel zooming with cursor-centered focal scaling (identical to Malacca & SCS corridor map)
  useEffect(() => {
    const el = mapViewportRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Position relative to center of viewport
      const cx = mouseX - rect.width / 2;
      const cy = mouseY - rect.height / 2;

      // Determine zoom factor: smooth scaling for mouse wheel steps and trackpad pinch
      const delta = e.deltaY;
      const zoomFactor = e.ctrlKey
        ? Math.exp(-delta * 0.02)
        : delta < 0
        ? 1.12
        : 0.89;

      const currentZoom = userZoomRef.current;
      const nextZoom = Math.max(0.5, Math.min(4.5, +(currentZoom * zoomFactor).toFixed(2)));

      if (nextZoom === currentZoom) return;

      const ratio = nextZoom / currentZoom;
      const currentPan = panOffsetRef.current;

      // Cursor-centered focal transformation: keep coordinates under mouse anchored
      const newPanX = Math.round(cx - (cx - currentPan.x) * ratio);
      const newPanY = Math.round(cy - (cy - currentPan.y) * ratio);

      setUserZoom(nextZoom);
      setPanOffset({ x: newPanX, y: newPanY });
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, [dimensions.width, dimensions.height, isExpanded]);

  // Double-click to zoom in at mouse position
  const handleDoubleClick = (e: React.MouseEvent) => {
    const el = mapViewportRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const cx = mouseX - rect.width / 2;
    const cy = mouseY - rect.height / 2;

    const currentZoom = userZoomRef.current;
    const nextZoom = Math.min(4.5, +(currentZoom * 1.5).toFixed(2));
    if (nextZoom === currentZoom) return;

    const ratio = nextZoom / currentZoom;
    const currentPan = panOffsetRef.current;
    const newPanX = Math.round(cx - (cx - currentPan.x) * ratio);
    const newPanY = Math.round(cy - (cy - currentPan.y) * ratio);

    setUserZoom(nextZoom);
    setPanOffset({ x: newPanX, y: newPanY });
  };

  const handleSelectPreset = (preset: ViewPreset) => {
    setActivePreset(preset);
    setUserZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Current live Middle East War-Risk Index
  const liveWarRiskIndex = macroData?.engines?.middleEastWarRisk?.riskIndex || 88.4;
  const liveBrentPremium = macroData?.engines?.middleEastWarRisk?.brentGeopoliticalPremium || "$18.50 / bbl";
  const liveGprIndex = macroData?.engines?.middleEastWarRisk?.gprIndex || 364.5;
  const liveDefcon = macroData?.engines?.middleEastWarRisk?.riskStatus || "CRITICAL WAR-RISK";

  // Stress test multiplier
  const riskMultiplier = useMemo(() => {
    if (stressScenario === "extreme") return 1.15; // Full Hormuz Closure
    if (stressScenario === "severe") return 1.08; // Multi-chokepoint escalation
    return 1.0; // Current Live
  }, [stressScenario]);

  // Adjust chokepoint risk scores dynamically based on the live war-risk index & scenario
  const augmentedChokepoints: GeoChokepoint[] = useMemo(() => {
    const warRiskDelta = (liveWarRiskIndex - 75) * 0.15; // escalation above baseline

    return MARITIME_CHOKEPOINTS.map((cp) => {
      let score = cp.baseRisk;
      // High sensitivity for Persian Gulf and Red Sea chokepoints
      if (cp.category === "Persian Gulf" || cp.category === "Red Sea & Suez") {
        score = Math.min(99, Math.round((cp.baseRisk + warRiskDelta) * riskMultiplier));
      } else if (cp.category === "Global Alternate") {
        // Diversion routes swell as conflict escalates
        score = Math.min(95, Math.round((cp.baseRisk + warRiskDelta * 0.8) * riskMultiplier));
      } else {
        score = Math.min(90, Math.round(cp.baseRisk * riskMultiplier));
      }

      let threatLevel: GeoChokepoint["threatLevel"] = "STABLE FLOW";
      if (score >= 85) threatLevel = "CRITICAL RED";
      else if (score >= 70) threatLevel = "HIGH ELEVATED";
      else if (score >= 50) threatLevel = "MEDIUM WATCH";

      // Scenario adjustments to active flow throughput
      let activeFlowBpd = cp.activeFlowBpd;
      let flowStatusNote = cp.flowStatusNote;

      if (stressScenario === "extreme") {
        if (cp.id === "hormuz") {
          activeFlowBpd = "3.5M bpd (bypass limit)";
          flowStatusNote = "-83% Closure (Pipelines Maxed)";
        } else if (cp.id === "bab-el-mandeb") {
          activeFlowBpd = "0.4M bpd";
          flowStatusNote = "-95% Total Blockade";
        } else if (cp.id === "cape-of-good-hope") {
          activeFlowBpd = "21.2M bpd";
          flowStatusNote = "+259% Maximum Diversion Saturation";
        } else if (cp.id === "suez-canal") {
          activeFlowBpd = "1.2M bpd";
          flowStatusNote = "-87% Transit Collapse";
        }
      } else if (stressScenario === "severe") {
        if (cp.id === "hormuz") {
          activeFlowBpd = "6.8M bpd";
          flowStatusNote = "-67% Severe Interdiction Drag";
        } else if (cp.id === "bab-el-mandeb") {
          activeFlowBpd = "1.1M bpd";
          flowStatusNote = "-88% Critical Stoppage";
        } else if (cp.id === "cape-of-good-hope") {
          activeFlowBpd = "18.5M bpd";
          flowStatusNote = "+214% Severe Diversion Surge";
        } else if (cp.id === "suez-canal") {
          activeFlowBpd = "2.6M bpd";
          flowStatusNote = "-72% Upstream Choke";
        }
      }

      // Dynamically scale 7-day risk history to anchor to the active scenario score
      const historyScale = cp.baseRisk > 0 ? score / cp.baseRisk : 1;
      const rawHistory = cp.riskHistory7d && cp.riskHistory7d.length === 7
        ? cp.riskHistory7d
        : [score - 6, score - 5, score - 3, score - 2, score - 1, score, score];
      const riskHistory7d = rawHistory.map((val, idx) => {
        if (idx === 6) return score;
        return Math.min(99, Math.max(5, Math.round(val * historyScale)));
      });

      return {
        ...cp,
        baseRisk: score,
        threatLevel,
        riskHistory7d,
        activeFlowBpd,
        flowStatusNote
      };
    });
  }, [liveWarRiskIndex, riskMultiplier, stressScenario]);

  const selectedChokepoint = useMemo(() => {
    return (
      augmentedChokepoints.find((c) => c.id === selectedChokepointId) ||
      augmentedChokepoints[0]
    );
  }, [augmentedChokepoints, selectedChokepointId]);

  const selectedPipeline = useMemo(() => {
    return STRATEGIC_PIPELINES.find((p) => p.id === selectedPipelineId) || STRATEGIC_PIPELINES[0];
  }, [selectedPipelineId]);

  const selectedEvent = useMemo(() => {
    return (
      activeEvents.find((e) => e.id === selectedEventId) ||
      activeEvents[0] ||
      ACTIVE_GEO_STRATEGIC_EVENTS[0]
    );
  }, [activeEvents, selectedEventId]);

  // Handle ESC key to exit fullscreen and lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isExpanded) {
        handleCloseExpand();
      }
    };
    if (isExpanded) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isExpanded]);

  // Resize observer to maintain responsive SVG dimensions calibrated to map viewport
  useEffect(() => {
    const targetEl = mapViewportRef.current || containerRef.current;
    if (!targetEl) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (width > 0) {
          const targetHeight = isExpanded
            ? Math.max(540, Math.min(840, Math.round(width * 0.65)))
            : Math.max(460, Math.min(600, Math.round(width * 0.62)));
          setDimensions({ width, height: targetHeight });
        }
      }
    });
    observer.observe(targetEl);
    return () => observer.disconnect();
  }, [isExpanded]);

  // D3 Projection and Path Generator (Cached to dimensions & preset; zooming & panning handled via GPU transform matrix)
  const { projection, pathGenerator } = useMemo(() => {
    const { width, height } = dimensions;
    let proj: d3.GeoProjection;

    // Configure center and scale based on active view preset
    switch (activePreset) {
      case "mideast":
        // Zoomed to Persian Gulf & Arabian Sea
        proj = d3
          .geoMercator()
          .center([53, 24])
          .scale(width * 1.5)
          .translate([width / 2, height / 2]);
        break;
      case "redsea":
        // Zoomed to Red Sea, Bab el-Mandeb & Suez with complete framing
        proj = d3
          .geoMercator()
          .center([38, 22])
          .scale(width * 1.35)
          .translate([width / 2, height / 2]);
        break;
      case "indopacific":
        // Zoomed to Malacca, South China Sea & East Asian megaterminals (Ningbo-Zhoushan)
        proj = d3
          .geoMercator()
          .center([110, 16])
          .scale(width * 0.68)
          .translate([width / 2, height / 2]);
        break;
      case "global":
      default:
        // Equal Earth Projection for Global Overview:
        // Eliminates the severe polar stretching of Mercator where northern latitudes
        // (Greenland, Arctic Siberia, Northern Canada) get cut off flat at the top of the container.
        const baseScale = Math.min(width * 0.185, height * 0.305);
        proj = d3
          .geoEqualEarth()
          .rotate([-25, -4])
          .scale(baseScale)
          .translate([width / 2, height / 2]);
    }

    // Prune off-screen topologies using Sutherland-Hodgman viewport clipping
    const pad = Math.max(30, width * 0.05);
    proj.clipExtent([[-pad, -pad], [width + pad, height + pad]]);

    const path = d3.geoPath().projection(proj);
    return { projection: proj, pathGenerator: path };
  }, [dimensions, activePreset]);

  // Precompute world landmasses Natural Earth 1:110m cartography paths once
  const landPaths = useMemo(() => {
    return WORLD_LAND_GEO.features
      .map((feature: any, idx: number) => ({
        id: `land-${idx}`,
        d: pathGenerator(feature)
      }))
      .filter((item: any) => Boolean(item.d));
  }, [pathGenerator]);

  // Globe ocean background (for global projection)
  const spherePath = useMemo(() => {
    if (activePreset !== "global") return null;
    try {
      return pathGenerator({ type: "Sphere" });
    } catch {
      return null;
    }
  }, [pathGenerator, activePreset]);

  // Graticule grid paths
  const graticulePath = useMemo(() => {
    const graticule = d3.geoGraticule().step([20, 20]);
    return pathGenerator(graticule() as any);
  }, [pathGenerator]);

  // International Country Borders mesh path
  const bordersPath = useMemo(() => {
    if (!WORLD_BORDERS_GEO) return null;
    return pathGenerator(WORLD_BORDERS_GEO as any);
  }, [pathGenerator]);

  // Precompute smooth maritime curves for shipping corridors using Catmull-Rom spline
  const corridorPaths = useMemo(() => {
    return SHIPPING_CORRIDORS.map((corridor) => {
      const pts = corridor.waypoints
        .map((wp) => projection(wp))
        .filter((p): p is [number, number] => p !== null && !isNaN(p[0]) && !isNaN(p[1]));

      if (pts.length < 2) return null;

      const lineGen = d3
        .line<[number, number]>()
        .x((d) => d[0])
        .y((d) => d[1])
        .curve(d3.curveCatmullRom.alpha(0.5));

      const pathData = lineGen(pts);
      if (!pathData) return null;

      const strokeColor =
        corridor.riskRating === "critical"
          ? "#EF4444"
          : corridor.riskRating === "high"
          ? "#F97316"
          : corridor.riskRating === "diverted"
          ? "#E5C794"
          : "#38BDF8";

      return {
        ...corridor,
        pathData,
        strokeColor,
        pts
      };
    }).filter(Boolean);
  }, [projection]);

  // Precompute overland strategic pipeline conduits
  const pipelinePaths = useMemo(() => {
    return STRATEGIC_PIPELINES.map((pipe) => {
      const pts = pipe.coordinates
        .map((coord) => projection(coord))
        .filter((p): p is [number, number] => p !== null && !isNaN(p[0]) && !isNaN(p[1]));

      if (pts.length < 2) return null;

      const lineGen = d3
        .line<[number, number]>()
        .x((d) => d[0])
        .y((d) => d[1])
        .curve(d3.curveCatmullRom.alpha(0.3));

      const pathData = lineGen(pts);
      if (!pathData) return null;

      const isOffline = pipe.status.includes("OFFLINE");
      const isRestricted = pipe.status.includes("RESTRICTED");

      const strokeColor = isOffline ? "#EF4444" : isRestricted ? "#F97316" : "#10B981";

      return {
        ...pipe,
        pathData,
        strokeColor,
        pts
      };
    }).filter(Boolean);
  }, [projection]);

  // Deduplicated active events ensuring no key collisions across renders
  const uniqueActiveEvents = useMemo(() => {
    const map = new Map<string, GeoStrategicEvent>();
    activeEvents.forEach((e) => {
      if (e && e.id && !map.has(e.id)) {
        map.set(e.id, e);
      }
    });
    return Array.from(map.values());
  }, [activeEvents]);

  // Precompute active geopolitical events projected coordinates
  const activeEventMarkers = useMemo(() => {
    return uniqueActiveEvents
      .filter((evt) => {
        if (!evt || !evt.isActive) return false;
        if (eventCategoryFilter === "ALL") return true;
        return evt.type === eventCategoryFilter;
      })
      .map((evt) => {
        const coords = projection(evt.coordinates);
        if (!coords || isNaN(coords[0]) || isNaN(coords[1])) return null;
        return {
          ...evt,
          screenCoords: coords
        };
      })
      .filter(Boolean);
  }, [uniqueActiveEvents, eventCategoryFilter, projection]);

  // Targeting & Fly-To camera navigation for real-time incidents
  const flyToIncident = (evt: GeoStrategicEvent) => {
    // Determine appropriate preset framing or zoom
    const [lon, lat] = evt.coordinates;
    if (lon >= 32 && lon <= 65 && lat >= 10 && lat <= 35) {
      // Middle East / Persian Gulf / Red Sea
      if (lon <= 45) {
        setActivePreset("redsea");
      } else {
        setActivePreset("mideast");
      }
    } else if (lon >= 90 && lon <= 130) {
      setActivePreset("indopacific");
    } else {
      setActivePreset("global");
    }
    setUserZoom(2.2);
    setSelectedEventId(evt.id);
    setInspectorTab("events");
    setTargetedEventReticle({
      lon,
      lat,
      id: evt.id,
      label: evt.title
    });
    setTimeout(() => {
      setTargetedEventReticle((prev) => (prev?.id === evt.id ? null : prev));
    }, 6000);
  };

  // Real-Time Event Ingestion from live SSE stream / flash alerts
  useEffect(() => {
    if (!macroData.flashAlerts || macroData.flashAlerts.length === 0) return;

    const newestAlert = macroData.flashAlerts[0];
    if (!newestAlert || !newestAlert.id) return;

    // Check if this exact alert ID was already processed
    if (processedAlertIdsRef.current.has(newestAlert.id)) return;
    processedAlertIdsRef.current.add(newestAlert.id);

    const alertText = newestAlert.text || "";
    const alertTitle = alertText.split(":")[0]?.trim() || newestAlert.category || "Tactical Alert";
    const alertHeadline = alertText.includes(":") ? alertText.split(":")[1]?.trim() : alertText;
    const combined = `${alertTitle} ${alertHeadline} ${alertText}`.toLowerCase();

    let matchedCoords: [number, number] | null = null;
    let region = "Strategic Maritime Corridor";
    let relatedCpIds: string[] = [];
    let eventType: GeoStrategicEvent["type"] = "KINETIC_STRIKE";
    let asset = "International Shipping Lane";

    if (combined.includes("petroline") || combined.includes("east-west")) {
      matchedCoords = [44.20, 24.80];
      region = "Saudi Arabia (Central Petroline)";
      relatedCpIds = ["hormuz", "bab-el-mandeb"];
      eventType = "PIPELINE_CLOSURE";
      asset = "Petroline Crude Artery (5.0M bpd)";
    } else if (combined.includes("hormuz") || combined.includes("iran") || combined.includes("irgc") || combined.includes("gulf of oman")) {
      matchedCoords = [56.40, 26.56];
      region = "Strait of Hormuz";
      relatedCpIds = ["hormuz", "fujairah"];
      eventType = combined.includes("mine") ? "MINE_ADVISORY" : combined.includes("jam") ? "ELECTRONIC_JAMMING" : "KINETIC_STRIKE";
      asset = "Hormuz Outbound VLCC Channel";
    } else if (combined.includes("bab el-mandeb") || combined.includes("red sea") || combined.includes("houthi") || combined.includes("yemen") || combined.includes("aden")) {
      matchedCoords = [43.33, 12.58];
      region = "Bab el-Mandeb";
      relatedCpIds = ["bab-el-mandeb"];
      eventType = "DRONE_INTERDICTION";
      asset = "Mandeb Transit Passage";
    } else if (combined.includes("yanbu") || combined.includes("red sea terminal")) {
      matchedCoords = [38.06, 24.09];
      region = "Yanbu Terminal (Red Sea)";
      relatedCpIds = ["bab-el-mandeb", "suez-canal"];
      eventType = "PORT_CLOSURE";
      asset = "Yanbu Commercial Crude Berths";
    } else if (combined.includes("adcop") || combined.includes("habshan") || combined.includes("fujairah")) {
      matchedCoords = [55.20, 24.40];
      region = "United Arab Emirates";
      relatedCpIds = ["fujairah", "hormuz"];
      eventType = "PIPELINE_CLOSURE";
      asset = "ADCOP Overland Artery";
    } else if (combined.includes("malacca") || combined.includes("singapore")) {
      matchedCoords = [103.80, 1.25];
      region = "Strait of Malacca";
      relatedCpIds = ["malacca"];
      eventType = "NAVAL_BLOCKADE";
      asset = "Malacca Arterial Channel";
    } else if (combined.includes("suez") || combined.includes("egypt")) {
      matchedCoords = [32.32, 30.35];
      region = "Suez Canal";
      relatedCpIds = ["suez-canal"];
      eventType = "NAVAL_BLOCKADE";
      asset = "Suez Canal Fairway";
    }

    if (matchedCoords) {
      const alertId = newestAlert.id || `live-evt-${Date.now()}`;
      const newEvt: GeoStrategicEvent = {
        id: alertId,
        title: alertTitle,
        type: eventType,
        timestamp: new Date().toISOString(),
        relativeTime: "Just now (SSE Live Stream)",
        coordinates: matchedCoords,
        severity: newestAlert.severity === "critical" ? "critical" : newestAlert.severity === "high" ? "high" : "warning",
        assetAffected: asset,
        region,
        headline: alertHeadline || alertText.slice(0, 75),
        operationalImpact: alertText,
        marketImpact: {
          brentSpread: "+$3.20/bbl live adder",
          tankerRates: "+220 bps war risk surcharge",
          macroShift: "Dynamic risk vector ingested across terminal"
        },
        isActive: true,
        relatedChokepointIds: relatedCpIds
      };

      setActiveEvents((prev) => {
        // Prevent duplicate keys
        if (
          prev.some(
            (e) =>
              e.id === alertId ||
              (alertId === "al-saudi-pipe" && (e.id === "evt-saudi-pipeline-shut" || e.id === "al-saudi-pipe"))
          )
        ) {
          return prev;
        }
        return [newEvt, ...prev];
      });

      setRecentIngestedToast({
        title: newEvt.title,
        id: newEvt.id,
        timeStr: new Date().toLocaleTimeString()
      });
      setTimeout(() => {
        setRecentIngestedToast((prev) => (prev?.id === newEvt.id ? null : prev));
      }, 7000);
    }
  }, [macroData.flashAlerts]);

  // Handler to resolve or dismiss an event
  const handleResolveEvent = (id: string) => {
    setActiveEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isActive: false } : e))
    );
  };

  // Handler to inject simulated threat incident
  const handleInjectSimulatedEvent = (eventData: Partial<GeoStrategicEvent>) => {
    const newId = `sim-evt-${Date.now()}`;
    const completeEvent: GeoStrategicEvent = {
      id: newId,
      title: eventData.title || "Simulated Maritime Threat Incident",
      type: eventData.type || "KINETIC_STRIKE",
      timestamp: new Date().toISOString(),
      relativeTime: "Just now (Manual Ingest)",
      coordinates: eventData.coordinates || [56.40, 26.56],
      severity: eventData.severity || "critical",
      assetAffected: eventData.assetAffected || "Strategic Corridor",
      region: eventData.region || "Middle East",
      headline: eventData.headline || eventData.title || "Tactical Alert Injected",
      operationalImpact: eventData.operationalImpact || "Commercial traffic halted pending naval escort validation.",
      marketImpact: eventData.marketImpact || {
        brentSpread: "+$4.50/bbl risk adder",
        tankerRates: "+310 bps war-risk premium",
        macroShift: "Global supply chain diversion activated"
      },
      isActive: true,
      relatedChokepointIds: eventData.relatedChokepointIds || ["hormuz"]
    };

    setActiveEvents((prev) => [completeEvent, ...prev]);
    flyToIncident(completeEvent);
    setRecentIngestedToast({
      title: completeEvent.title,
      id: completeEvent.id,
      timeStr: new Date().toLocaleTimeString()
    });
    setTimeout(() => {
      setRecentIngestedToast((prev) => (prev?.id === completeEvent.id ? null : prev));
    }, 7000);
  };

  // Smart non-colliding label placement offsets for chokepoints
  const getLabelLayout = (cpId: string) => {
    switch (cpId) {
      case "kharg-island":
        // Shift up-left with leader line
        return { dx: -130, dy: -22, leader: true, anchor: "end" };
      case "hormuz":
        // Shift up-right
        return { dx: 14, dy: -12, leader: false, anchor: "start" };
      case "fujairah":
        // Shift down-right
        return { dx: 14, dy: 16, leader: false, anchor: "start" };
      case "bab-el-mandeb":
        // Shift down-left with leader line
        return { dx: -110, dy: 18, leader: true, anchor: "end" };
      case "suez-canal":
        // Shift up-left with leader line
        return { dx: -98, dy: -16, leader: true, anchor: "end" };
      case "malacca":
        // Shift down-right
        return { dx: 14, dy: 10, leader: false, anchor: "start" };
      case "cape-of-good-hope":
        // Shift right
        return { dx: 14, dy: 4, leader: false, anchor: "start" };
      case "bosporus":
        // Shift up-right
        return { dx: 14, dy: -12, leader: false, anchor: "start" };
      case "gibraltar":
        // Shift up-left
        return { dx: -85, dy: -14, leader: true, anchor: "end" };
      case "panama":
        // Shift down-left
        return { dx: -75, dy: 14, leader: true, anchor: "end" };
      case "ningbo-zhoushan":
        // Shift up-right into East China Sea / Pacific open water
        return { dx: 14, dy: -12, leader: false, anchor: "start" };
      default:
        return { dx: 12, dy: -8, leader: false, anchor: "start" };
    }
  };

  // Helper color interpolator for risk score
  const getRiskColor = (score: number) => {
    if (score >= 85) return "#EF4444"; // Critical Red
    if (score >= 70) return "#F97316"; // High Orange
    if (score >= 50) return "#EAB308"; // Medium Gold
    return "#10B981"; // Stable Emerald
  };

  const getHeatRadius = (score: number) => {
    const base = score >= 85 ? (isCleanMode ? 26 : 38) : score >= 70 ? (isCleanMode ? 20 : 30) : score >= 50 ? (isCleanMode ? 15 : 22) : 12;
    const factor = heatIntensity === "high" ? 1.25 : heatIntensity === "medium" ? 1.0 : 0.65;
    return base * factor;
  };

  const getHeatOpacity = (score: number) => {
    if (heatIntensity === "low") return 0.2;
    if (score >= 85) return heatIntensity === "high" ? (isCleanMode ? 0.55 : 0.75) : (isCleanMode ? 0.42 : 0.6);
    if (score >= 70) return heatIntensity === "high" ? (isCleanMode ? 0.45 : 0.6) : (isCleanMode ? 0.35 : 0.45);
    return isCleanMode ? 0.25 : 0.35;
  };

  return (
    <>
      {/* Fullscreen Backdrop when expanded */}
      {isExpanded && (
        <div
          id="chokepoint-fullscreen-backdrop"
          className="fixed inset-0 z-50 bg-[#070D18]/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={handleCloseExpand}
          aria-hidden="true"
        />
      )}

      <div
        id="chokepoint-heatmap-container"
        ref={containerRef}
        className={
          isExpanded
            ? "fixed inset-1 sm:inset-3 lg:inset-5 z-50 bg-[#0A101C] border-2 border-[#B08D57]/70 rounded-2xl p-4 sm:p-6 shadow-[0_0_90px_rgba(0,0,0,0.95)] overflow-y-auto flex flex-col space-y-4 animate-in fade-in zoom-in-95 duration-200"
            : "bg-[#0A101A] border border-[#B08D57]/35 rounded-xl shadow-2xl p-4 sm:p-5 relative overflow-hidden transition-all flex flex-col space-y-4"
        }
      >
        {/* Background Ambience */}
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-[#A6291C]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-[#B08D57]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header & War-Risk Metric Ribbon */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#B08D57]/20 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#A6291C]/25 border border-[#A6291C]/50 text-[#FF8585]">
                <Flame className="w-4 h-4 animate-pulse" />
              </span>
              <h2
                className="text-lg sm:text-xl font-serif italic font-bold text-[#EDE9DE] tracking-tight"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Global Maritime Chokepoint Threat Heatmap
              </h2>
              <span className="text-[9px] font-mono-data font-bold bg-[#A6291C] text-[#EDE9DE] px-2 py-0.5 rounded uppercase tracking-wider">
                D3 GEOSPATIAL ENGINE
              </span>
              {isExpanded && (
                <span className="text-[9px] font-mono-data font-bold uppercase tracking-wider bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/40 px-2 py-0.5 rounded shadow-sm">
                  EXPANDED FULL SCREEN
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono-data text-[#8292A6] mt-1 tracking-wider">
              RADIAL THERMAL RISK TRANSMISSION • HORMUZ & BAB EL-MANDEB INTERDICTION VECTORS
            </p>
          </div>

          {/* War-Risk Overlay Summary Pills & Fullscreen Toggle */}
          <div className="flex flex-wrap items-center gap-2 font-mono-data text-xs">
            <div className="bg-black/60 border border-[#A6291C]/40 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
              <span className="text-[10px] text-[#8292A6]">War-Risk Index:</span>
              <span className="text-sm font-bold text-[#FF8585]">{liveWarRiskIndex} / 100</span>
            </div>

            <div className="bg-black/60 border border-[#10B981]/40 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span className="text-[10px] text-[#8292A6]">Brent War Adder:</span>
              <span className="text-xs font-bold text-[#10B981]">{liveBrentPremium}</span>
            </div>

            <div className="bg-black/60 border border-[#B08D57]/40 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span className="text-[10px] text-[#8292A6]">GPR Index:</span>
              <span className="text-xs font-bold text-[#E5C794]">{liveGprIndex} pts</span>
            </div>

            {/* Full Screen Toggle Button */}
            <button
              id="chokepoint-fullscreen-btn"
              onClick={handleToggleExpand}
              title={isExpanded ? "Exit Full Screen [ESC]" : "Open Chokepoint Heatmap in Full Screen"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono-data font-bold transition-all shadow-sm ${
                isExpanded
                  ? "bg-[#B08D57] text-[#0A111C] border-[#B08D57] shadow-[0_0_15px_rgba(176,141,87,0.4)]"
                  : "bg-black/70 hover:bg-[#B08D57]/20 text-[#E5C794] border-[#B08D57]/35 hover:border-[#B08D57] hover:text-[#EDE9DE]"
              }`}
            >
              {isExpanded ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>EXIT FULL SCREEN</span>
                  <span className="text-[9px] opacity-75 font-normal ml-0.5">[ESC]</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-[#B08D57]" />
                  <span className="hidden sm:inline">FULL SCREEN</span>
                </>
              )}
            </button>

            {isExpanded && (
              <button
                id="close-chokepoint-fullscreen-btn"
                onClick={handleCloseExpand}
                title="Close Full Screen [ESC]"
                className="p-1.5 rounded-lg bg-black/70 border border-[#B08D57]/40 text-[#8292A6] hover:text-[#EDE9DE] hover:border-[#B08D57] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      {/* Control Bar: View Presets, Clean Mode, Corridors & Scenarios */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 py-3 border-b border-[#B08D57]/15 relative z-10 text-xs font-mono-data">
        {/* Region View Presets */}
        <div className="flex items-center gap-1 bg-black/50 p-1 rounded-lg border border-[#B08D57]/25">
          <span className="text-[10px] text-[#8292A6] px-1.5 uppercase tracking-wider flex items-center gap-1">
            <Compass className="w-3 h-3 text-[#B08D57]" />
            Region:
          </span>
          <button
            onClick={() => handleSelectPreset("global")}
            className={`px-2.5 py-1 rounded transition-all text-[11px] ${
              activePreset === "global"
                ? "bg-[#B08D57] text-[#0A101A] font-bold shadow"
                : "text-[#8292A6] hover:text-[#EDE9DE]"
            }`}
          >
            Global
          </button>
          <button
            onClick={() => handleSelectPreset("mideast")}
            className={`px-2.5 py-1 rounded transition-all text-[11px] ${
              activePreset === "mideast"
                ? "bg-[#EF4444] text-[#EDE9DE] font-bold shadow"
                : "text-[#8292A6] hover:text-[#EDE9DE]"
            }`}
          >
            Persian Gulf
          </button>
          <button
            onClick={() => handleSelectPreset("redsea")}
            className={`px-2.5 py-1 rounded transition-all text-[11px] ${
              activePreset === "redsea"
                ? "bg-[#F97316] text-[#EDE9DE] font-bold shadow"
                : "text-[#8292A6] hover:text-[#EDE9DE]"
            }`}
          >
            Red Sea
          </button>
          <button
            onClick={() => handleSelectPreset("indopacific")}
            className={`px-2.5 py-1 rounded transition-all text-[11px] ${
              activePreset === "indopacific"
                ? "bg-[#E5C794] text-[#0A101A] font-bold shadow"
                : "text-[#8292A6] hover:text-[#EDE9DE]"
            }`}
          >
            Indo-Pacific
          </button>
        </div>

        {/* Display Settings: Clean Mode, Pin Density, Threat Monitor, Corridors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Clean Mode Toggle */}
          <button
            onClick={() => {
              const next = !isCleanMode;
              setIsCleanMode(next);
              if (next) setPinDisplayMode("compact");
            }}
            className={`px-2.5 py-1 rounded border text-[10px] transition-all flex items-center gap-1.5 shadow-sm ${
              isCleanMode
                ? "bg-[#B08D57]/20 border-[#B08D57] text-[#EDE9DE] font-bold"
                : "bg-black/40 border-[#8292A6]/30 text-[#8292A6] hover:text-[#EDE9DE]"
            }`}
            title="Clean Mode simplifies labels, tightens thermal halos, and declutters map pins"
          >
            <Sparkles className={`w-3 h-3 ${isCleanMode ? "text-[#B08D57]" : "text-[#8292A6]"}`} />
            <span>Clean Mode:</span>
            <span className={isCleanMode ? "text-[#10B981]" : "text-[#8292A6]"}>
              {isCleanMode ? "ACTIVE" : "OFF"}
            </span>
          </button>

          {/* Pin Density: Compact (zero-collision icons) vs Detailed (callout badges) */}
          <div className="flex items-center gap-0.5 bg-black/50 p-0.5 rounded-lg border border-[#B08D57]/25 text-[10px]">
            <span className="text-[#8292A6] px-1.5 flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#B08D57]" />
              Pins:
            </span>
            <button
              onClick={() => setPinDisplayMode("compact")}
              className={`px-2 py-0.5 rounded transition-all ${
                pinDisplayMode === "compact"
                  ? "bg-[#B08D57] text-[#0A101A] font-bold"
                  : "text-[#8292A6] hover:text-[#EDE9DE]"
              }`}
              title="Compact Mode: Clean diamond beacons with tactical icons, zero text collisions"
            >
              Compact
            </button>
            <button
              onClick={() => setPinDisplayMode("detailed")}
              className={`px-2 py-0.5 rounded transition-all ${
                pinDisplayMode === "detailed"
                  ? "bg-[#B08D57] text-[#0A101A] font-bold"
                  : "text-[#8292A6] hover:text-[#EDE9DE]"
              }`}
              title="Detailed Mode: Visible labels with anti-collision hairline leader lines"
            >
              Detailed
            </button>
          </div>

          {/* Live Threat Monitor Console Trigger */}
          <button
            onClick={() => setShowEventMonitorDrawer(true)}
            className="px-2.5 py-1 rounded bg-[#EF4444]/20 border border-[#EF4444]/50 hover:bg-[#EF4444]/30 text-[#FCA5A5] text-[10px] font-bold transition-all flex items-center gap-1.5 shadow-sm"
            title="Open Real-Time Threat Surveillance Console & Event Ingestion Hub"
          >
            <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-ping" />
            <Radio className="w-3 h-3 text-[#EF4444]" />
            <span>Threat Monitor ({activeEvents.filter((e) => e.isActive).length})</span>
          </button>

          {/* Real-Time Incident Simulator / Quick Ingest Trigger */}
          <button
            onClick={() => setShowInjectEventModal(true)}
            className="px-2 py-1 rounded bg-[#10B981]/20 border border-[#10B981]/40 hover:bg-[#10B981]/30 text-[#34D399] text-[10px] font-bold transition-all flex items-center gap-1 shadow-sm"
            title="Ingest Real-Time Maritime Threat Incident or Trigger Simulation"
          >
            <PlusCircle className="w-3 h-3 text-[#10B981]" />
            <span>+ Ingest Incident</span>
          </button>

          {/* Shipping Lanes Clean Vector Toggle */}
          <div className="flex items-center gap-0.5 bg-black/50 p-0.5 rounded-lg border border-[#B08D57]/25 text-[10px]">
            <span className="text-[#8292A6] px-1.5 flex items-center gap-1">
              <Navigation className="w-3 h-3 text-[#B08D57]" />
              Shipping Lanes:
            </span>
            <button
              onClick={() => setShowCorridors(true)}
              className={`px-2 py-0.5 rounded transition-all ${
                showCorridors
                  ? "bg-[#B08D57] text-[#0A101A] font-bold"
                  : "text-[#8292A6] hover:text-[#EDE9DE]"
              }`}
              title="Show strategic maritime corridors and Cape reroute bypass"
            >
              On
            </button>
            <button
              onClick={() => setShowCorridors(false)}
              className={`px-2 py-0.5 rounded transition-all ${
                !showCorridors
                  ? "bg-[#EF4444] text-[#EDE9DE] font-bold"
                  : "text-[#8292A6] hover:text-[#EDE9DE]"
              }`}
              title="Hide shipping corridor lines"
            >
              Off
            </button>
          </div>

          {/* Overland Pipelines Toggle */}
          <div className="flex items-center gap-0.5 bg-black/50 p-0.5 rounded-lg border border-[#B08D57]/25 text-[10px]">
            <span className="text-[#8292A6] px-1.5 flex items-center gap-1">
              <Flame className="w-3 h-3 text-[#EF4444]" />
              Pipelines:
            </span>
            <button
              onClick={() => setShowPipelines(!showPipelines)}
              className={`px-2 py-0.5 rounded transition-all ${
                showPipelines
                  ? "bg-[#EF4444] text-[#EDE9DE] font-bold"
                  : "text-[#8292A6] hover:text-[#EDE9DE]"
              }`}
              title="Toggle overland bypass crude pipelines (Petroline, ADCOP)"
            >
              {showPipelines ? "ON" : "OFF"}
            </button>
          </div>

          {/* Active Events Toggle */}
          <div className="flex items-center gap-0.5 bg-black/50 p-0.5 rounded-lg border border-[#EF4444]/40 text-[10px]">
            <button
              onClick={() => setShowActiveEvents(!showActiveEvents)}
              className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 font-bold ${
                showActiveEvents
                  ? "bg-[#7F1D1D] text-[#FCA5A5] border border-[#EF4444]"
                  : "text-[#8292A6] hover:text-[#EDE9DE]"
              }`}
              title="Toggle active real-time kinetic and pipeline closure alert markers"
            >
              <AlertTriangle className="w-3 h-3 text-[#EF4444] animate-pulse" />
              <span>Pins ({activeEvents.filter((e) => e.isActive).length})</span>
            </button>
          </div>

          {/* Stress Scenario Selector */}
          <div className="flex items-center gap-1 bg-black/50 p-1 rounded-lg border border-[#B08D57]/25">
            <span className="text-[10px] text-[#8292A6] px-1 uppercase">Scenario:</span>
            <button
              onClick={() => setStressScenario("live")}
              className={`px-1.5 py-0.5 rounded text-[10px] ${
                stressScenario === "live"
                  ? "bg-[#10B981] text-[#0A101A] font-bold"
                  : "text-[#8292A6] hover:text-[#EDE9DE]"
              }`}
            >
              Live
            </button>
            <button
              onClick={() => setStressScenario("severe")}
              className={`px-1.5 py-0.5 rounded text-[10px] ${
                stressScenario === "severe"
                  ? "bg-[#F97316] text-[#0A101A] font-bold"
                  : "text-[#8292A6] hover:text-[#EDE9DE]"
              }`}
            >
              Severe (+8%)
            </button>
            <button
              onClick={() => setStressScenario("extreme")}
              className={`px-1.5 py-0.5 rounded text-[10px] ${
                stressScenario === "extreme"
                  ? "bg-[#EF4444] text-[#EDE9DE] font-bold"
                  : "text-[#8292A6] hover:text-[#EDE9DE]"
              }`}
            >
              Blockade (+15%)
            </button>
          </div>

          {/* Malacca & SCS Flow Vector Map Trigger */}
          <button
            onClick={handleOpenScsModal}
            className="px-2.5 py-1 rounded bg-[#38BDF8]/15 hover:bg-[#38BDF8]/25 border border-[#38BDF8]/40 text-[#38BDF8] text-[10px] font-bold flex items-center gap-1.5 transition-all shadow-sm"
            title="View Malacca to South China Sea Maritime Trade Flow Vector Corridor Map"
          >
            <Compass className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>SCS Flow Map</span>
            <span className="text-[8px] px-1 py-0.2 rounded bg-[#38BDF8]/25 text-[#EDE9DE]">
              CORRIDOR
            </span>
          </button>

          {/* Corridors Guide Modal Trigger */}
          <button
            onClick={() => setShowInfoModal(true)}
            className="px-2 py-1 rounded bg-[#B08D57]/15 hover:bg-[#B08D57]/25 border border-[#B08D57]/40 text-[#EDE9DE] text-[10px] flex items-center gap-1 transition-all"
            title="What do the shipping corridors and dots signify?"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#B08D57]" />
            <span className="hidden sm:inline">Corridors Guide</span>
          </button>
        </div>
      </div>

      {/* Main Map Canvas and Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-3">
        {/* D3 Geospatial Heatmap Viewport (8 Columns on desktop) */}
        <div
          ref={mapViewportRef}
          className="lg:col-span-8 bg-[#070C16] rounded-xl border border-[#222E42] relative overflow-hidden flex items-center justify-center min-h-[460px]"
        >
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            className="w-full h-auto block select-none cursor-grab active:cursor-grabbing"
            style={{ backgroundColor: "#070C16" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDoubleClick={handleDoubleClick}
          >
            <defs>
              {/* Lightweight D3 Heatmap Gaussian Blur Filter for Thermal Radiance */}
              <filter id="d3-heat-blur" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation={isCleanMode ? "4" : "6"} result="blur" />
                <feColorMatrix
                  type="matrix"
                  values="
                    1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 1.25 0
                  "
                />
              </filter>

              {/* Radial Gradients for Heat Halos */}
              {augmentedChokepoints.map((cp) => {
                const isCrit = cp.baseRisk >= 85;
                const isHigh = cp.baseRisk >= 70;
                const coreColor = isCrit ? "#EF4444" : isHigh ? "#F97316" : "#EAB308";
                const midColor = isCrit ? "#DC2626" : isHigh ? "#EA580C" : "#CA8A04";

                return (
                  <radialGradient
                    key={`gradient-${cp.id}`}
                    id={`heat-radial-${cp.id}`}
                    cx="50%"
                    cy="50%"
                    r="50%"
                  >
                    <stop offset="0%" stopColor={coreColor} stopOpacity={getHeatOpacity(cp.baseRisk)} />
                    <stop offset="50%" stopColor={midColor} stopOpacity={getHeatOpacity(cp.baseRisk) * 0.45} />
                    <stop offset="100%" stopColor={midColor} stopOpacity="0" />
                  </radialGradient>
                );
              })}
            </defs>

            {/* Hardware-Accelerated Pan and Zoom Layer */}
            <g
              id="d3-map-pan-zoom-container"
              transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${userZoom})`}
              style={{
                transformOrigin: `${dimensions.width / 2}px ${dimensions.height / 2}px`,
                willChange: "transform"
              }}
            >
              {/* 0. Globe Ocean Basin & Horizon Boundary (Global View) */}
              {spherePath && (
                <g className="globe-basin">
                  <path
                    d={spherePath}
                    fill="#091220"
                    stroke="#1E2D44"
                    strokeWidth="1"
                    opacity="0.9"
                  />
                </g>
              )}

              {/* 1. Subtle Ocean Texture / Graticule Lines */}
              <g className="graticules" opacity={isCleanMode ? "0.15" : "0.22"}>
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

              {/* 2. World Landmasses - Precomputed Natural Earth 1:110m Cartography */}
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

            {/* 3. Subtle International Country Boundaries */}
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

            {/* 4. D3 Geographical Heatmap Thermal Layer */}
            <g className="heatmap-layer" filter="url(#d3-heat-blur)">
              {augmentedChokepoints.map((cp) => {
                const coords = projection(cp.coordinates);
                if (!coords) return null;
                const [cx, cy] = coords;
                const radius = getHeatRadius(cp.baseRisk);

                return (
                  <circle
                    key={`heat-halo-${cp.id}`}
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill={`url(#heat-radial-${cp.id})`}
                    pointerEvents="none"
                  />
                );
              })}
            </g>

            {/* 5. Strategic Shipping Corridors & Rerouting Pathways (Clean Static Vectors, No Moving Dots) */}
            {showCorridors && (
              <g className="shipping-corridors">
                {corridorPaths.map((corridor) => {
                  if (!corridor) return null;
                  const isDiverted = corridor.riskRating === "diverted";

                  return (
                    <g key={corridor.id} className="corridor-group">
                      {/* Luminous ambient glow backing */}
                      <path
                        d={corridor.pathData}
                        fill="none"
                        stroke={corridor.strokeColor}
                        strokeWidth={isDiverted ? 3.5 : 2.5}
                        strokeOpacity={isCleanMode ? 0.12 : 0.22}
                        strokeLinecap="round"
                      />

                      {/* Crisp Maritime Conduit (Static Clean Vector, No Moving Dots) */}
                      <path
                        d={corridor.pathData}
                        fill="none"
                        stroke={corridor.strokeColor}
                        strokeWidth={isDiverted ? 1.8 : 1.3}
                        strokeOpacity={isCleanMode ? 0.72 : 0.88}
                        strokeDasharray={isDiverted ? "5 4" : undefined}
                        strokeLinecap="round"
                      />
                    </g>
                  );
                })}
              </g>
            )}

            {/* 5.1 Strategic Overland Energy Bypass Pipelines */}
            {showPipelines && (
              <g className="strategic-pipelines">
                {pipelinePaths.map((pipe) => {
                  if (!pipe) return null;
                  const isOffline = pipe.status.includes("OFFLINE");
                  const isSelected = selectedPipelineId === pipe.id;

                  return (
                    <g
                      key={`pipeline-${pipe.id}`}
                      className="cursor-pointer group"
                      onClick={(e) => {
                        if (dragMovedRef.current) return;
                        e.stopPropagation();
                        setSelectedPipelineId(pipe.id);
                        setInspectorTab("pipelines");
                      }}
                    >
                      {/* Luminous outer halo for offline/compromised pipeline */}
                      <path
                        d={pipe.pathData}
                        fill="none"
                        stroke={pipe.strokeColor}
                        strokeWidth={isSelected ? 6 : 4}
                        strokeOpacity={isOffline ? 0.35 : 0.2}
                        strokeLinecap="round"
                      />

                      {/* Core Pipeline Line (Crossed dashes if offline) */}
                      <path
                        d={pipe.pathData}
                        fill="none"
                        stroke={pipe.strokeColor}
                        strokeWidth={isSelected ? 2.5 : 2.0}
                        strokeDasharray={isOffline ? "4 3" : undefined}
                        strokeLinecap="round"
                      />

                      {/* Start and End terminal nodes */}
                      {pipe.pts[0] && (
                        <circle
                          cx={pipe.pts[0][0]}
                          cy={pipe.pts[0][1]}
                          r={isSelected ? 3.5 : 2.5}
                          fill="#0A101A"
                          stroke={pipe.strokeColor}
                          strokeWidth="1.5"
                        />
                      )}
                      {pipe.pts[pipe.pts.length - 1] && (
                        <circle
                          cx={pipe.pts[pipe.pts.length - 1][0]}
                          cy={pipe.pts[pipe.pts.length - 1][1]}
                          r={isSelected ? 3.5 : 2.5}
                          fill={pipe.strokeColor}
                          stroke="#0A101A"
                          strokeWidth="1"
                        />
                      )}

                      {/* Pipeline Label Badge with smart de-collision positioning */}
                      {(() => {
                        const showPipeLabel = !isCleanMode || isSelected || activePreset !== "global";
                        if (!showPipeLabel) return null;

                        let labelPt = pipe.pts[Math.floor(pipe.pts.length / 2)];
                        let dy = -8;
                        let labelText = pipe.name;

                        if (pipe.id === "saudi-east-west-pipeline" && pipe.pts[3]) {
                          // Position towards Yanbu/Hejaz western corridor away from central desert pins
                          labelPt = pipe.pts[3];
                          dy = -10;
                          labelText = isOffline ? "⚠ PETROLINE [SHUT]" : "PETROLINE (5.0M)";
                        } else if (pipe.id === "habshan-fujairah-pipeline" && pipe.pts[1]) {
                          // Position south into interior UAE away from Hormuz & Fujairah anchorage
                          labelPt = pipe.pts[1];
                          dy = 16;
                          labelText = "ADCOP (1.5M)";
                        } else if (pipe.id === "kirkuk-ceyhan-pipeline" && pipe.pts[1]) {
                          // Position north in Anatolia
                          labelPt = pipe.pts[1];
                          dy = -12;
                          labelText = "CEYHAN (1.6M)";
                        }

                        if (!labelPt) return null;

                        return (
                          <g transform={`translate(${labelPt[0]}, ${labelPt[1] + dy})`}>
                            <rect
                              x="-46"
                              y="-7.5"
                              width="92"
                              height="15"
                              rx="3"
                              fill="#0A101A"
                              fillOpacity="0.94"
                              stroke={isOffline ? "#EF4444" : isSelected ? "#B08D57" : "#3B4E68"}
                              strokeWidth={isSelected || isOffline ? "1.2" : "0.7"}
                            />
                            <text
                              x="0"
                              y="3"
                              textAnchor="middle"
                              fill={isOffline ? "#EF4444" : "#CAD6E2"}
                              fontSize="8"
                              fontFamily="monospace"
                              fontWeight="bold"
                            >
                              {labelText}
                            </text>
                          </g>
                        );
                      })()}
                    </g>
                  );
                })}
              </g>
            )}

            {/* 5.2 Real-Time Geopolitical Event Kinetic & Interdiction Markers */}
            {showActiveEvents && (
              <g className="active-geopolitical-events">
                {activeEventMarkers.map((evt) => {
                  if (!evt) return null;
                  const [ex, ey] = evt.screenCoords;
                  const isSelected = selectedEventId === evt.id;
                  const isHovered = hoveredEventId === evt.id;
                  const isTargeted = targetedEventReticle?.id === evt.id;
                  const isCompact = isCleanMode || pinDisplayMode === "compact";
                  const showDetailedBadge = !isCompact || isSelected || isHovered || isTargeted;

                  // Smart non-colliding leader line layout for event callout badges
                  const getEventCalloutLayout = () => {
                    if (evt.id === "evt-saudi-pipeline-shut" || (evt.coordinates[0] < 50 && evt.coordinates[1] > 20)) {
                      // Central/Western Arabia: Offset North-West away from desert and pipelines
                      return {
                        boxX: -140,
                        boxY: -32,
                        width: 136,
                        points: "0,0 -18,-18 -140,-18",
                        textX: -134,
                        textY: -21
                      };
                    }
                    if (evt.id === "evt-centcom-hormuz-counter" || (evt.coordinates[0] >= 55 && evt.coordinates[1] >= 25)) {
                      // Hormuz / Gulf of Oman: Offset North-East into Iran/Mekran away from strait
                      return {
                        boxX: 24,
                        boxY: -26,
                        width: 132,
                        points: "0,0 16,-14 24,-14",
                        textX: 30,
                        textY: -15
                      };
                    }
                    if (evt.id === "evt-houthi-asbm-bab" || (evt.coordinates[1] <= 15 && evt.coordinates[0] < 50)) {
                      // Bab el-Mandeb / Red Sea: Offset East into Yemen interior
                      return {
                        boxX: 24,
                        boxY: 10,
                        width: 130,
                        points: "0,0 16,16 24,16",
                        textX: 30,
                        textY: 22
                      };
                    }
                    // Default smart leader line offset
                    return {
                      boxX: 22,
                      boxY: -12,
                      width: 130,
                      points: "0,0 14,-6 22,-6",
                      textX: 28,
                      textY: -1
                    };
                  };

                  const callout = getEventCalloutLayout();

                  // Category icon shorthand
                  const getIconChar = () => {
                    switch (evt.type) {
                      case "PIPELINE_CLOSURE":
                        return "🚨";
                      case "KINETIC_STRIKE":
                        return "⚡";
                      case "DRONE_INTERDICTION":
                        return "🚀";
                      case "NAVAL_BLOCKADE":
                        return "🚢";
                      case "MINE_ADVISORY":
                        return "⚓";
                      case "ELECTRONIC_JAMMING":
                        return "📡";
                      case "PORT_CLOSURE":
                        return "🛑";
                      default:
                        return "⚠";
                    }
                  };

                  const getShortLabel = () => {
                    if (evt.type === "PIPELINE_CLOSURE") return "PIPELINE SHUT";
                    if (evt.type === "DRONE_INTERDICTION") return "MISSILE VOLLEY";
                    if (evt.type === "KINETIC_STRIKE") return "KINETIC STRIKE";
                    if (evt.type === "MINE_ADVISORY") return "SEA MINE HAZARD";
                    if (evt.type === "ELECTRONIC_JAMMING") return "AIS SPOOFING";
                    if (evt.type === "PORT_CLOSURE") return "PORT INTERDICTED";
                    if (evt.type === "NAVAL_BLOCKADE") return "NAVAL BLOCKADE";
                    return evt.title.slice(0, 16).toUpperCase();
                  };

                  return (
                    <g
                      key={`active-evt-${evt.id}`}
                      transform={`translate(${ex}, ${ey})`}
                      className="cursor-pointer group"
                      onClick={(e) => {
                        if (dragMovedRef.current) return;
                        e.stopPropagation();
                        setSelectedEventId(evt.id);
                        setInspectorTab("events");
                        if (evt.relatedChokepointIds.length > 0) {
                          setSelectedChokepointId(evt.relatedChokepointIds[0]);
                        }
                      }}
                      onMouseEnter={() => setHoveredEventId(evt.id)}
                      onMouseLeave={() => setHoveredEventId(null)}
                    >
                      {/* Active Tactical Military Reticle when Targeted */}
                      {isTargeted && (
                        <g className="animate-spin-slow">
                          <circle
                            cx="0"
                            cy="0"
                            r="20"
                            fill="none"
                            stroke="#EF4444"
                            strokeWidth="1.5"
                            strokeDasharray="4 3"
                          />
                          <line x1="-24" y1="0" x2="-18" y2="0" stroke="#EF4444" strokeWidth="2" />
                          <line x1="18" y1="0" x2="24" y2="0" stroke="#EF4444" strokeWidth="2" />
                          <line x1="0" y1="-24" x2="0" y2="-18" stroke="#EF4444" strokeWidth="2" />
                          <line x1="0" y1="18" x2="0" y2="24" stroke="#EF4444" strokeWidth="2" />
                        </g>
                      )}

                      {/* Event Hex/Diamond Indicator */}
                      <polygon
                        points="0,-9 9,0 0,9 -9,0"
                        fill="#EF4444"
                        stroke="#EDE9DE"
                        strokeWidth={isSelected || isTargeted ? "2" : "1.2"}
                        className="filter drop-shadow"
                      />

                      {/* Tactical Center Beacon Dot */}
                      <circle cx="0" cy="0" r="2.5" fill="#0A101A" />

                      {/* Tactical Event Callout: De-cluttered anti-collision layout */}
                      {showDetailedBadge ? (
                        <g className="transition-all animate-in fade-in duration-150">
                          {/* Fine hairline leader line */}
                          <polyline
                            points={callout.points}
                            fill="none"
                            stroke="#EF4444"
                            strokeWidth="0.9"
                            strokeDasharray="2 2"
                            strokeOpacity="0.8"
                          />

                          {/* Tactical badge */}
                          <rect
                            x={callout.boxX}
                            y={callout.boxY}
                            width={callout.width}
                            height="17"
                            rx="3"
                            fill="#350A0A"
                            fillOpacity="0.96"
                            stroke="#EF4444"
                            strokeWidth={isSelected ? "1.4" : "0.9"}
                            className="shadow-lg"
                          />
                          <text
                            x={callout.textX}
                            y={callout.textY}
                            fill="#FCA5A5"
                            fontSize="8.5"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            {getIconChar()} {getShortLabel()}
                          </text>
                        </g>
                      ) : (
                        /* Compact mode minimal badge on pin hover */
                        <title>{`${getIconChar()} ${evt.title} (${evt.relativeTime}) - Click to inspect`}</title>
                      )}
                    </g>
                  );
                })}
              </g>
            )}

            {/* 5. Chokepoints Markers & De-Overlapped Labels */}
            <g className="chokepoint-markers">
              {augmentedChokepoints.map((cp) => {
                const coords = projection(cp.coordinates);
                if (!coords) return null;
                const [cx, cy] = coords;
                const isSelected = cp.id === selectedChokepointId;
                const isHovered = cp.id === hoveredCpId;
                const isCrit = cp.baseRisk >= 85;
                const color = getRiskColor(cp.baseRisk);
                const layout = getLabelLayout(cp.id);

                // Smart visibility: In clean mode, prioritize clarity and show selected, hovered, or primary hubs
                const showLabel =
                  activePreset !== "global" ||
                  isSelected ||
                  isHovered ||
                  (!isCleanMode && (isCrit || cp.id === "malacca" || cp.id === "hormuz" || cp.id === "ningbo-zhoushan" || cp.id === "panama"));

                return (
                  <g
                    key={`marker-${cp.id}`}
                    transform={`translate(${cx}, ${cy})`}
                    className="cursor-pointer transition-transform group"
                    onClick={(e) => {
                      if (dragMovedRef.current) return;
                      e.stopPropagation();
                      setSelectedChokepointId(cp.id);
                      setInspectorTab("chokepoint");
                    }}
                    onMouseEnter={() => setHoveredCpId(cp.id)}
                    onMouseLeave={() => setHoveredCpId(null)}
                  >
                    {/* Outer target ring */}
                    <circle
                      cx="0"
                      cy="0"
                      r={isSelected ? 8 : 6}
                      fill="#0A101A"
                      stroke={color}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                    />

                    {/* Center Core dot */}
                    <circle
                      cx="0"
                      cy="0"
                      r={isSelected ? 4.5 : 3}
                      fill={color}
                      className={isCrit && !isCleanMode ? "animate-pulse" : ""}
                    />

                    {/* Label Tag with Non-Colliding Layout & Crisp Leader Lines */}
                    {showLabel && (
                      <g className="chokepoint-label-callout">
                        {/* Leader line if tag is offset away from node */}
                        {layout.leader && (
                          <path
                            d={`M 0 0 L ${layout.dx > 0 ? layout.dx : layout.dx + (cp.name.length * 6.2 + 28)} ${layout.dy}`}
                            stroke="#3B4E68"
                            strokeWidth="0.8"
                            strokeDasharray="2 2"
                            fill="none"
                          />
                        )}

                        <g transform={`translate(${layout.dx}, ${layout.dy})`}>
                          <rect
                            x="0"
                            y="-8"
                            width={cp.name.length * 6.2 + 28}
                            height="16"
                            rx="3"
                            fill="#0A101A"
                            fillOpacity="0.94"
                            stroke={isSelected ? color : isHovered ? "#B08D57" : "#2E3D52"}
                            strokeWidth={isSelected ? "1.4" : "0.8"}
                          />
                          <text
                            x="5"
                            y="4"
                            fill={isSelected ? "#EDE9DE" : "#CAD6E2"}
                            fontSize="9"
                            fontFamily="monospace"
                            fontWeight={isSelected ? "bold" : "normal"}
                          >
                            {cp.name}
                          </text>
                          <text
                            x={cp.name.length * 6.2 + 8}
                            y="4"
                            fill={color}
                            fontSize="9"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            {cp.baseRisk}
                          </text>
                        </g>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
            </g>
          </svg>

          {/* Real-Time Incoming Threat Alert Banner HUD */}
          {recentIngestedToast && (
            <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 bg-[#350A0A]/95 border-2 border-[#EF4444] text-[#EDE9DE] px-3.5 py-2 rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.5)] flex items-center gap-3 backdrop-blur-md animate-in slide-in-from-top-3 duration-200">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-ping shrink-0" />
              <div className="text-xs font-mono-data">
                <div className="text-[10px] text-[#FCA5A5] font-bold flex items-center gap-1.5">
                  <Radio className="w-3 h-3 text-[#EF4444]" />
                  <span>REAL-TIME THREAT INGESTED &bull; {recentIngestedToast.timeStr}</span>
                </div>
                <div className="font-bold text-[#EDE9DE] mt-0.5 max-w-sm truncate text-[11px]">
                  {recentIngestedToast.title}
                </div>
              </div>
              <button
                onClick={() => {
                  const ev = activeEvents.find((e) => e.id === recentIngestedToast.id);
                  if (ev) flyToIncident(ev);
                }}
                className="px-2.5 py-1 rounded bg-[#EF4444] hover:bg-[#DC2626] text-white text-[10px] font-bold tracking-wider uppercase transition-colors shrink-0 flex items-center gap-1"
              >
                <Crosshair className="w-3 h-3" />
                <span>Target</span>
              </button>
              <button
                onClick={() => setRecentIngestedToast(null)}
                className="p-1 text-[#8292A6] hover:text-[#EDE9DE] shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Bottom Overlay Legend */}
          <div className="absolute bottom-2 left-2 bg-black/85 backdrop-blur-md border border-[#B08D57]/20 px-3 py-1.5 rounded-lg text-[10px] font-mono-data text-[#8292A6] flex flex-wrap items-center gap-3 shadow-lg">
            <span className="flex items-center gap-1 text-[#EF4444]">
              <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
              Critical (85-100)
            </span>
            <span className="flex items-center gap-1 text-[#F97316]">
              <span className="w-2 h-2 rounded-full bg-[#F97316]" />
              High (70-84)
            </span>
            <span className="flex items-center gap-1 text-[#EAB308]">
              <span className="w-2 h-2 rounded-full bg-[#EAB308]" />
              Watch (50-69)
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[#FCA5A5]">
              <span className="w-2 h-2 rotate-45 bg-[#EF4444]" />
              Live Events ({activeEvents.filter((e) => e.isActive).length})
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[#E5C794]">
              <span className="w-3 h-0.5 bg-[#E5C794]" />
              Cape Reroute (74.8% Diverted)
            </span>
            <button
              onClick={() => setShowInfoModal(true)}
              className="text-[#B08D57] hover:underline flex items-center gap-0.5 ml-1"
            >
              <HelpCircle className="w-3 h-3" />
              What do corridors signify?
            </button>
          </div>

          {/* Top Left Navigation HUD Indicator */}
          <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 bg-black/85 backdrop-blur-md border border-[#B08D57]/35 px-2.5 py-1 rounded-lg text-[9px] sm:text-[10px] font-mono-data text-[#BAC7D5] shadow-xl pointer-events-none">
            <MousePointer className="w-3 h-3 text-[#B08D57] animate-pulse" />
            <span className="hidden sm:inline">SCROLL WHEEL TO ZOOM • DRAG TO PAN</span>
            <span className="sm:hidden">SCROLL / DRAG MAP</span>
          </div>

          {/* Tactical Zoom & Framing Controls in Map Canvas */}
          <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5 bg-black/85 backdrop-blur-md border border-[#B08D57]/35 p-1 rounded-lg shadow-xl">
            <span className="text-[10px] text-[#BAC7D5] px-1 font-mono-data font-bold" title="Current Zoom Scale">
              {Math.round(userZoom * 100)}%
            </span>
            <button
              onClick={() => {
                const next = Math.min(4.5, +(userZoom + 0.25).toFixed(2));
                setUserZoom(next);
              }}
              className="w-7 h-7 flex items-center justify-center rounded bg-black/60 hover:bg-[#B08D57]/25 text-[#EDE9DE] hover:text-[#B08D57] transition-all text-xs"
              title="Zoom In (+25%) • Or Scroll Up"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                const next = Math.max(0.5, +(userZoom - 0.25).toFixed(2));
                setUserZoom(next);
              }}
              className="w-7 h-7 flex items-center justify-center rounded bg-black/60 hover:bg-[#B08D57]/25 text-[#EDE9DE] hover:text-[#B08D57] transition-all text-xs"
              title="Zoom Out (-25%) • Or Scroll Down"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            {(activePreset !== "global" || userZoom !== 1 || panOffset.x !== 0 || panOffset.y !== 0) && (
              <button
                onClick={() => {
                  setActivePreset("global");
                  setUserZoom(1);
                  setPanOffset({ x: 0, y: 0 });
                }}
                className="px-2 py-1 flex items-center gap-1 rounded bg-[#B08D57]/20 hover:bg-[#B08D57]/35 border border-[#B08D57]/40 text-[#EDE9DE] transition-all text-[10px] font-mono-data"
                title="Reset to Default Global Framing"
                aria-label="Reset to Default Global Framing"
              >
                <RotateCcw className="w-3 h-3 text-[#B08D57]" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Tactical Dossier: Inspector (4 Columns on desktop) */}
        <div className="lg:col-span-4 flex flex-col justify-between bg-[#0E1522] border border-[#B08D57]/25 rounded-xl p-4 space-y-3 font-mono-data text-xs">
          <div>
            {/* Inspector Navigation Tabs */}
            <div className="flex items-center gap-1 border-b border-[#B08D57]/20 pb-2 mb-2 text-[10px]">
              <button
                onClick={() => setInspectorTab("chokepoint")}
                className={`px-2 py-1 rounded transition-all flex items-center gap-1 font-bold ${
                  inspectorTab === "chokepoint"
                    ? "bg-[#B08D57] text-[#0A101A]"
                    : "text-[#8292A6] hover:text-[#EDE9DE]"
                }`}
              >
                <Anchor className="w-3 h-3" />
                <span>Chokepoint</span>
              </button>

              <button
                onClick={() => setInspectorTab("events")}
                className={`px-2 py-1 rounded transition-all flex items-center gap-1 font-bold relative ${
                  inspectorTab === "events"
                    ? "bg-[#EF4444] text-[#EDE9DE]"
                    : "text-[#F87171] hover:text-[#EDE9DE] bg-[#450A0A]/40"
                }`}
              >
                <AlertTriangle className="w-3 h-3 text-[#EF4444]" />
                <span>Events</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-ping" />
              </button>

              <button
                onClick={() => setInspectorTab("pipelines")}
                className={`px-2 py-1 rounded transition-all flex items-center gap-1 font-bold ${
                  inspectorTab === "pipelines"
                    ? "bg-[#F97316] text-[#0A101A]"
                    : "text-[#8292A6] hover:text-[#EDE9DE]"
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>Pipelines</span>
              </button>
            </div>

            {/* TAB 1: CHOKEPOINT DOSSIER */}
            {inspectorTab === "chokepoint" && (
              <>
                {/* Chokepoint Header */}
                <div className="flex items-start justify-between border-b border-[#B08D57]/20 pb-2.5">
                  <div>
                    <div className="text-[10px] text-[#B08D57] font-bold uppercase tracking-wider">
                      {selectedChokepoint.region}
                    </div>
                    <h3 className="text-base font-bold text-[#EDE9DE] mt-0.5">
                      {selectedChokepoint.name}
                    </h3>
                    <div className="text-[10px] text-[#8292A6] mt-0.5">
                      LAT: {selectedChokepoint.coordinates[1].toFixed(2)}°N | LON: {selectedChokepoint.coordinates[0].toFixed(2)}°E
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-[#EDE9DE]"
                      style={{ backgroundColor: getRiskColor(selectedChokepoint.baseRisk) }}
                    >
                      {selectedChokepoint.threatLevel}
                    </span>
                    <div className="text-lg font-bold text-[#FF8585] mt-1">
                      {selectedChokepoint.baseRisk} <span className="text-[10px] text-[#8292A6]">/ 100</span>
                    </div>
                  </div>
                </div>

                {/* 7-Day Risk Score Trajectory Sparkline Graph */}
                <div className="mt-3">
                  <ChokepointRiskSparkline
                    data={selectedChokepoint.riskHistory7d}
                    chokepointName={selectedChokepoint.name}
                    threatLevel={selectedChokepoint.threatLevel}
                    variant="detailed"
                  />
                </div>

                {/* Tactical Status & Threat Breakdown */}
                <div className="mt-3 space-y-2.5">
                  <div className="bg-black/40 p-2.5 rounded-lg border border-[#B08D57]/15">
                    <div className="text-[10px] text-[#8292A6] uppercase">Current Operational Status:</div>
                    <div className="text-xs font-bold text-[#EDE9DE] mt-0.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
                      {selectedChokepoint.status}
                    </div>
                  </div>

                  <div className="bg-black/40 p-2.5 rounded-lg border border-[#B08D57]/15">
                    <div className="text-[10px] text-[#8292A6] uppercase">Kinetic Threat Assessment:</div>
                    <div className="text-[11px] text-[#BAC7D5] font-sans mt-1 leading-relaxed">
                      {selectedChokepoint.threatDetails}
                    </div>
                  </div>

                  {/* Dual Flow Comparative Telemetry: Baseline vs Active Flow */}
                  <div className="bg-black/40 p-2.5 rounded-lg border border-[#B08D57]/20">
                    <div className="flex items-center justify-between text-[10px] uppercase text-[#8292A6] mb-1.5">
                      <span className="flex items-center gap-1 font-bold text-[#EDE9DE]">
                        <Activity className="w-3 h-3 text-[#B08D57]" />
                        Flow Volume Telemetry
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#B08D57]/15 text-[#E5C794] border border-[#B08D57]/30 font-mono-data">
                        {selectedChokepoint.flowStatusNote}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      {/* Baseline Metric */}
                      <div className="bg-[#0D1522] p-2 rounded border border-[#222E42]">
                        <div className="text-[9px] text-[#8292A6] uppercase flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                          Baseline Flow
                        </div>
                        <div className="text-xs font-bold text-[#38BDF8] mt-0.5 font-mono-data">
                          {selectedChokepoint.baselineFlowBpd}
                        </div>
                        <div className="text-[8px] text-[#8292A6] mt-0.5 leading-tight">
                          Fully Operational Cap
                        </div>
                      </div>

                      {/* Active / Current Flow Metric */}
                      <div className="bg-[#0D1522] p-2 rounded border border-[#EF4444]/35">
                        <div className="text-[9px] text-[#EF4444] uppercase flex items-center gap-1 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse" />
                          Active Disrupted Flow
                        </div>
                        <div className="text-xs font-bold text-[#F87171] mt-0.5 font-mono-data">
                          {selectedChokepoint.activeFlowBpd}
                        </div>
                        <div className="text-[8px] text-[#8292A6] mt-0.5 leading-tight">
                          Estimated Current Transit
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2 pt-1.5 border-t border-[#B08D57]/10 text-[10px]">
                      <div>
                        <span className="text-[8px] text-[#8292A6] uppercase block">Global Share</span>
                        <span className="font-bold text-[#EDE9DE]">{selectedChokepoint.globalSharePct}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-[#8292A6] uppercase block">War Risk Surcharge</span>
                        <span className="font-bold text-[#10B981]">{selectedChokepoint.insuranceSurcharge}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/40 p-2.5 rounded-lg border border-[#B08D57]/15">
                    <div className="text-[10px] text-[#8292A6] uppercase">Rerouting & Voyage Delta:</div>
                    <div className="text-[11px] text-[#BAC7D5] font-sans mt-0.5 leading-tight">
                      {selectedChokepoint.rerouteImpact}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: ACTIVE GEOPOLITICAL EVENTS (Saudi Pipeline Closure, ASBM Strikes) */}
            {inspectorTab === "events" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#EF4444]/30 pb-2">
                  <div className="text-[10px] text-[#EF4444] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Real-Time Crisis Log</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#FCA5A5] text-[9px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse" />
                      {activeEvents.filter((e) => e.isActive).length} Active Incidents
                    </span>
                    <button
                      onClick={() => setShowInjectEventModal(true)}
                      className="p-1 rounded bg-[#10B981]/20 border border-[#10B981]/40 text-[#34D399] hover:bg-[#10B981]/30 transition-colors"
                      title="Inject or simulate new real-time threat incident"
                    >
                      <PlusCircle className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Event Selector Mini-List */}
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                  {uniqueActiveEvents
                    .filter((evt) => evt.isActive)
                    .map((evt) => (
                      <button
                        key={`inspector-evt-${evt.id}`}
                        onClick={() => {
                          setSelectedEventId(evt.id);
                          if (evt.relatedChokepointIds.length > 0) {
                            setSelectedChokepointId(evt.relatedChokepointIds[0]);
                          }
                        }}
                        className={`w-full p-2 rounded text-left transition-all border ${
                          selectedEvent.id === evt.id
                            ? "bg-[#350A0A] border-[#EF4444] text-[#EDE9DE]"
                            : "bg-black/30 border-[#2E3D52] text-[#8292A6] hover:text-[#EDE9DE]"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[9px]">
                          <span className="text-[#EF4444] font-bold">{evt.relativeTime}</span>
                          <span className="text-[#B08D57] font-mono-data">{evt.type}</span>
                        </div>
                        <div className="text-[11px] font-bold truncate mt-0.5">{evt.title}</div>
                      </button>
                    ))}
                </div>

                {/* Selected Event Breakdown */}
                <div className="bg-[#1A0B0B] p-3 rounded-lg border border-[#EF4444]/40 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-[10px] text-[#F87171] uppercase font-bold">
                      {selectedEvent.headline}
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-[#EF4444]/20 border border-[#EF4444]/50 text-[#FCA5A5] uppercase whitespace-nowrap">
                      {selectedEvent.severity}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#EDE9DE] font-sans leading-relaxed border-t border-[#EF4444]/20 pt-2">
                    {selectedEvent.operationalImpact}
                  </div>

                  {/* Market & Asset Transmission */}
                  <div className="bg-black/50 p-2 rounded border border-[#B08D57]/20 text-[10px] space-y-1 mt-2">
                    <div className="text-[9px] text-[#B08D57] font-bold uppercase">Institutional Market Transmission</div>
                    <div className="flex justify-between">
                      <span className="text-[#8292A6]">Brent Crude Spread:</span>
                      <span className="text-[#F87171] font-bold">{selectedEvent.marketImpact.brentSpread}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8292A6]">Tanker War Risk Surcharge:</span>
                      <span className="text-[#F87171] font-bold">{selectedEvent.marketImpact.tankerRates}</span>
                    </div>
                    <div className="text-[9px] text-[#CAD6E2] mt-1 pt-1 border-t border-white/5 italic">
                      {selectedEvent.marketImpact.macroShift}
                    </div>
                  </div>

                  {/* Operational Quick Actions for Event */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[#EF4444]/20">
                    <button
                      onClick={() => flyToIncident(selectedEvent)}
                      className="flex-1 py-1 px-2 rounded bg-[#EF4444]/25 hover:bg-[#EF4444]/40 border border-[#EF4444]/50 text-[#EDE9DE] text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                      title="Lock camera onto incident coordinates with tactical reticle"
                    >
                      <Crosshair className="w-3 h-3 text-[#EF4444]" />
                      <span>Target on Map</span>
                    </button>
                    <button
                      onClick={() => handleResolveEvent(selectedEvent.id)}
                      className="py-1 px-2.5 rounded bg-black/40 hover:bg-black/70 border border-[#8292A6]/40 hover:border-[#10B981] text-[#8292A6] hover:text-[#10B981] text-[10px] transition-colors flex items-center gap-1"
                      title="Mark event as resolved and archive from live heatmap"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Resolve</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: OVERLAND STRATEGIC PIPELINES (Saudi Petroline, ADCOP, Ceyhan) */}
            {inspectorTab === "pipelines" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#F97316]/30 pb-2">
                  <div className="text-[10px] text-[#F97316] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" />
                    <span>Overland Bypass Grid</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#F97316]/20 border border-[#F97316]/40 text-[#FDBA74] text-[9px] font-bold">
                    3 Key Artery Corridors
                  </span>
                </div>

                {/* Pipeline Selector List */}
                <div className="space-y-1.5">
                  {STRATEGIC_PIPELINES.map((pipe) => {
                    const isOffline = pipe.status.includes("OFFLINE");
                    return (
                      <button
                        key={pipe.id}
                        onClick={() => setSelectedPipelineId(pipe.id)}
                        className={`w-full p-2 rounded text-left transition-all border ${
                          selectedPipeline.id === pipe.id
                            ? isOffline
                              ? "bg-[#350A0A] border-[#EF4444] text-[#EDE9DE]"
                              : "bg-[#1E170E] border-[#F97316] text-[#EDE9DE]"
                            : "bg-black/30 border-[#2E3D52] text-[#8292A6] hover:text-[#EDE9DE]"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[9px]">
                          <span className={isOffline ? "text-[#EF4444] font-bold" : "text-[#10B981] font-bold"}>
                            {pipe.status}
                          </span>
                          <span className="text-[#8292A6]">{pipe.country}</span>
                        </div>
                        <div className="text-[11px] font-bold truncate mt-0.5">{pipe.name}</div>
                        <div className="flex items-center justify-between text-[8.5px] text-[#8292A6] mt-1">
                          <span>Cap: {pipe.capacityBpd}</span>
                          <span className={isOffline ? "text-[#EF4444] font-bold" : "text-[#F97316]"}>
                            Flow: {pipe.activeThroughputBpd}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Pipeline In-Depth Dossier */}
                <div className="bg-black/50 p-3 rounded-lg border border-[#B08D57]/20 space-y-2">
                  <div className="text-[10px] text-[#B08D57] font-bold uppercase">
                    Route: {selectedPipeline.originName} &rarr; {selectedPipeline.terminalName}
                  </div>
                  {selectedPipeline.closureCause && (
                    <div className="p-2 rounded bg-[#450A0A]/50 border border-[#EF4444]/40 text-[10px] text-[#FCA5A5] leading-relaxed">
                      <strong>Interdiction Reason:</strong> {selectedPipeline.closureCause}
                    </div>
                  )}
                  <div className="text-[11px] text-[#CAD6E2] font-sans leading-relaxed">
                    <strong>Macro Impact:</strong> {selectedPipeline.macroImpact}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Pivot */}
          <div className="pt-2 border-t border-[#B08D57]/20 space-y-2">
            <button
              onClick={() => {
                if (inspectorTab === "pipelines" || selectedChokepoint.category === "Persian Gulf") {
                  setActivePreset("mideast");
                } else if (selectedChokepoint.category === "Red Sea & Suez") {
                  setActivePreset("redsea");
                } else if (selectedChokepoint.category === "Indo-Pacific") {
                  setActivePreset("indopacific");
                }
              }}
              className="w-full py-2 bg-[#1B2433] hover:bg-[#253247] text-[#EDE9DE] border border-[#B08D57]/30 hover:border-[#B08D57] rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow"
            >
              <ZoomIn className="w-3.5 h-3.5 text-[#B08D57]" />
              <span>
                {inspectorTab === "pipelines"
                  ? "Center Tactical Zoom on Arabian Bypass Grid"
                  : inspectorTab === "events"
                  ? `Center Tactical Zoom on Event Location`
                  : `Center Tactical Zoom on ${selectedChokepoint.name}`}
              </span>
            </button>

            {(selectedChokepoint.category === "Indo-Pacific" ||
              selectedChokepoint.id === "malacca" ||
              selectedChokepoint.id === "ningbo-zhoushan") && (
              <button
                onClick={handleOpenScsModal}
                className="w-full py-1.5 bg-[#38BDF8]/15 hover:bg-[#38BDF8]/25 text-[#38BDF8] border border-[#38BDF8]/35 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Malacca &rarr; SCS Tactical Flow Map</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Chokepoint Selector Carousel below map */}
      <div className="mt-4 pt-3 border-t border-[#B08D57]/20">
        <div className="text-[10px] font-mono-data text-[#8292A6] uppercase tracking-wider mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>Strategic Chokepoint Telemetry Cards & 7D Threat Sparklines</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 border border-[#B08D57]/30 text-[#E5C794]">
              {augmentedChokepoints.length} Monitored
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowAllCards(false)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold transition-colors ${
                !showAllCards
                  ? "bg-[#B08D57] text-[#0A101A]"
                  : "bg-black/50 text-[#8292A6] hover:text-[#EDE9DE] border border-[#B08D57]/30"
              }`}
            >
              Top 6 Priority
            </button>
            <button
              onClick={() => setShowAllCards(true)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold transition-colors ${
                showAllCards
                  ? "bg-[#B08D57] text-[#0A101A]"
                  : "bg-black/50 text-[#8292A6] hover:text-[#EDE9DE] border border-[#B08D57]/30"
              }`}
            >
              All {augmentedChokepoints.length} Strategic Hubs
            </button>
          </div>
        </div>

        <div
          className={`grid gap-2 font-mono-data ${
            showAllCards
              ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
              : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
          }`}
        >
          {(showAllCards ? augmentedChokepoints : augmentedChokepoints.slice(0, 6)).map((cp) => {
            const isSelected = cp.id === selectedChokepointId;
            const color = getRiskColor(cp.baseRisk);

            return (
              <button
                key={`card-${cp.id}`}
                onClick={() => setSelectedChokepointId(cp.id)}
                className={`p-2 rounded-lg text-left border transition-all flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#161F2E] border-[#B08D57] shadow-lg scale-[1.02] ring-1 ring-[#B08D57]/50"
                    : "bg-[#0B1018] border-[#222E42] hover:border-[#B08D57]/50"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-[#8292A6] truncate uppercase">{cp.region.split("/")[0]}</span>
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0 ml-1"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                  <div className="text-xs font-bold text-[#EDE9DE] truncate mt-0.5">
                    {cp.name}
                  </div>
                </div>

                {/* 7-Day Risk Score Sparkline Trend Graph */}
                <div className="my-1.5 py-1 border-y border-white/5">
                  <div className="flex items-center justify-between text-[7.5px] text-[#8292A6] mb-0.5 font-mono-data">
                    <span className="uppercase">7D Threat Trend</span>
                    <span className="text-[7px] text-[#627284]">T-6→Now</span>
                  </div>
                  <ChokepointRiskSparkline
                    data={cp.riskHistory7d}
                    chokepointName={cp.name}
                    threatLevel={cp.threatLevel}
                    variant="compact"
                  />
                </div>

                <div className="flex items-end justify-between pt-1 border-t border-white/5">
                  <div>
                    <span className="text-[8px] text-[#8292A6] block leading-none mb-0.5">Risk</span>
                    <span className="text-xs font-bold" style={{ color }}>
                      {cp.baseRisk}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-bold text-[#F87171] truncate" title={`Active Disrupted Flow: ${cp.activeFlowBpd}`}>
                      {cp.activeFlowBpd.split(" ")[0]}
                    </div>
                    <div className="text-[8px] text-[#8292A6] truncate" title={`Baseline Capacity: ${cp.baselineFlowBpd}`}>
                      base {cp.baselineFlowBpd.split(" ")[0]}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Corridors & Flow Guide Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#0D1522] border border-[#B08D57] rounded-xl max-w-lg w-full p-5 shadow-2xl relative text-xs font-mono-data">
            <button
              onClick={() => setShowInfoModal(false)}
              className="absolute top-3.5 right-3.5 text-[#8292A6] hover:text-[#EDE9DE] p-1 rounded hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <Navigation className="w-4 h-4 text-[#B08D57]" />
              <h4 className="text-sm font-bold text-[#EDE9DE]">
                Maritime Corridors & Shipping Flow Guide
              </h4>
            </div>

            <p className="text-[#BAC7D5] font-sans text-xs leading-relaxed mb-4">
              The maritime lines depict real-world strategic energy corridors, critical supply choke points, and wartime rerouting pathways:
            </p>

            <div className="space-y-3 mb-4">
              <div className="bg-black/40 p-2.5 rounded-lg border border-[#B08D57]/20">
                <div className="flex items-center gap-2 text-xs font-bold text-[#E5C794]">
                  <span className="w-3 h-0.5 bg-[#E5C794]" />
                  <span>Persian Gulf Outbound (Hormuz → Malacca & Asia)</span>
                </div>
                <p className="text-[11px] font-sans text-[#8292A6] mt-1 leading-normal">
                  Nominal baseline capacity is <strong className="text-[#38BDF8]">20.5M bpd</strong> (~21% of global petroleum consumption) when fully operational. Under active war-risk conditions, effective transits are throttled to <strong className="text-[#F87171]">~11.2M bpd</strong> due to naval escort delays, insurer underwriting halts (+480 bps), and dark vessel diversions.
                </p>
              </div>

              <div className="bg-black/40 p-2.5 rounded-lg border border-[#EF4444]/25">
                <div className="flex items-center gap-2 text-xs font-bold text-[#EF4444]">
                  <span className="w-3 h-0.5 bg-[#EF4444]" />
                  <span>Red Sea & Suez Corridor (Bab el-Mandeb)</span>
                </div>
                <p className="text-[11px] font-sans text-[#8292A6] mt-1 leading-normal">
                  The primary shortcut between the Indian Ocean and the Mediterranean. Currently classified as <strong className="text-[#EF4444]">CRITICAL WAR RISK</strong> due to anti-ship ballistic missiles and drone attacks.
                </p>
              </div>

              <div className="bg-black/40 p-2.5 rounded-lg border border-[#E5C794]/30">
                <div className="flex items-center gap-2 text-xs font-bold text-[#E5C794]">
                  <span className="w-3 h-0.5 border-t border-dashed border-[#E5C794]" />
                  <span>Cape of Good Hope Diversion Route (Africa Bypass)</span>
                </div>
                <p className="text-[11px] font-sans text-[#8292A6] mt-1 leading-normal">
                  Commercial vessels reroute around the southern tip of Africa to avoid kinetic strikes. Adds <strong className="text-[#EDE9DE]">10–14 days voyage time</strong>, +$1.2M bunker fuel cost, and ties up ~8% of global container capacity.
                </p>
              </div>

              <div className="bg-black/40 p-2.5 rounded-lg border border-[#38BDF8]/25">
                <div className="flex items-center gap-2 text-xs font-bold text-[#38BDF8]">
                  <span className="w-3 h-0.5 bg-[#38BDF8]" />
                  <span>Clean Static Vector Cartography</span>
                </div>
                <p className="text-[11px] font-sans text-[#8292A6] mt-1 leading-normal">
                  All corridors are rendered as clean, stationary vector conduits without extraneous moving dot effects. Solid lines indicate primary arterial lanes, while dashed gold lines trace wartime diversion routes around the Cape of Good Hope.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#B08D57]/20">
              <button
                onClick={() => {
                  setIsCleanMode(true);
                  setShowCorridors(true);
                  setShowInfoModal(false);
                }}
                className="px-3 py-1.5 rounded bg-[#B08D57] hover:bg-[#967442] text-[#0A101A] font-bold text-xs transition-colors"
              >
                Apply Clean View
              </button>
              <button
                onClick={() => setShowInfoModal(false)}
                className="px-3 py-1.5 rounded bg-black/40 border border-[#8292A6]/30 hover:border-[#EDE9DE] text-[#EDE9DE] text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Malacca to South China Sea Tactical Corridor Vector Map & Recon Modal */}
      {showScsVisualModal && (
        <div
          id="scs-visual-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setShowScsVisualModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="scs-modal-title"
        >
          <div
            id="scs-visual-modal-card"
            className="bg-[#09111C] border border-[#38BDF8]/40 rounded-xl max-w-5xl w-full p-4 sm:p-5 text-[#EDE9DE] shadow-2xl relative my-auto max-h-[94vh] overflow-y-auto custom-scrollbar font-mono-data"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Bar */}
            <div className="flex items-start justify-between border-b border-[#38BDF8]/20 pb-2.5 mb-3">
              <div>
                <h3 id="scs-modal-title" className="text-base sm:text-lg font-bold text-[#EDE9DE] font-sans">
                  Malacca &rarr; South China Sea Maritime Trade Flow & Vulnerability Map
                </h3>
                <p className="text-[11px] text-[#8292A6] font-mono-data mt-0.5">
                  Institutional D3 Geospatial Corridor Vector Engine &bull; Matched to Global Macro Map Cartography
                </p>
              </div>
              <button
                onClick={() => setShowScsVisualModal(false)}
                className="p-1.5 rounded-lg bg-black/40 border border-[#8292A6]/30 hover:border-[#EDE9DE] text-[#8292A6] hover:text-[#EDE9DE] transition-colors"
                aria-label="Close reconnaissance modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tactical Vector Map Component */}
            <MalaccaScsCorridorMap
              onClose={() => setShowScsVisualModal(false)}
              onSwitchToIndoPacificPreset={() => {
                setActivePreset("indopacific");
                setShowScsVisualModal(false);
              }}
              satelliteImageSrc={satelliteImageSrc}
            />
          </div>
        </div>
      )}

      {/* REAL-TIME THREAT SURVEILLANCE & INCIDENT MONITOR CONSOLE DRAWER */}
      {showEventMonitorDrawer && (
        <div
          id="event-monitor-drawer-backdrop"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end animate-in fade-in duration-200"
          onClick={() => setShowEventMonitorDrawer(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            id="event-monitor-drawer"
            className="w-full max-w-2xl bg-[#09111C] border-l border-[#EF4444]/40 text-[#EDE9DE] h-full flex flex-col shadow-2xl overflow-hidden font-mono-data"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#EF4444]/30 bg-[#160B0D] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EF4444]/20 border border-[#EF4444]/50 flex items-center justify-center text-[#EF4444]">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#EDE9DE] flex items-center gap-2">
                    <span>Geopolitical Real-Time Threat Surveillance</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#EF4444]/20 border border-[#EF4444]/60 text-[#FCA5A5] text-[10px] font-mono">
                      LIVE SSE FEED
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#8292A6]">
                    Active kinetic engagements, pipeline interdictions, and maritime hazards
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowInjectEventModal(true)}
                  className="px-2.5 py-1.5 rounded bg-[#10B981]/20 hover:bg-[#10B981]/30 border border-[#10B981]/40 text-[#34D399] text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ Ingest Incident</span>
                </button>
                <button
                  onClick={() => setShowEventMonitorDrawer(false)}
                  className="p-1.5 rounded-lg bg-black/40 border border-[#8292A6]/30 hover:border-[#EDE9DE] text-[#8292A6] hover:text-[#EDE9DE] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-black/40 border-b border-[#B08D57]/20 shrink-0 text-center">
              <div className="bg-[#1B0F12] p-2 rounded border border-[#EF4444]/30">
                <div className="text-[9px] text-[#8292A6] uppercase">Active Incidents</div>
                <div className="text-base font-bold text-[#EF4444] mt-0.5">
                  {activeEvents.filter((e) => e.isActive).length} Threat Signals
                </div>
              </div>
              <div className="bg-[#171510] p-2 rounded border border-[#B08D57]/30">
                <div className="text-[9px] text-[#8292A6] uppercase">Aggregate Oil at Risk</div>
                <div className="text-base font-bold text-[#E5C794] mt-0.5">
                  28.4M BPD
                </div>
              </div>
              <div className="bg-[#0B1520] p-2 rounded border border-[#38BDF8]/30">
                <div className="text-[9px] text-[#8292A6] uppercase">Max War Risk Surcharge</div>
                <div className="text-base font-bold text-[#38BDF8] mt-0.5">
                  +1.85% Hull
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="p-3 border-b border-[#B08D57]/20 flex flex-wrap items-center gap-1.5 shrink-0 bg-black/20 text-[10px]">
              <span className="text-[#8292A6] mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Filter:
              </span>
              {(
                [
                  { id: "ALL", label: "All Active" },
                  { id: "KINETIC", label: "Kinetic & Missiles" },
                  { id: "MARITIME", label: "Naval & Ports" },
                  { id: "PIPELINE", label: "Pipelines" },
                  { id: "ELECTRONIC", label: "Jamming & AIS" },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setEventCategoryFilter(cat.id)}
                  className={`px-2 py-1 rounded transition-all ${
                    eventCategoryFilter === cat.id
                      ? "bg-[#EF4444] text-[#EDE9DE] font-bold"
                      : "bg-black/40 border border-[#8292A6]/30 text-[#8292A6] hover:text-[#EDE9DE]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Events List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {uniqueActiveEvents
                .filter((evt) => {
                  if (eventCategoryFilter === "ALL") return true;
                  if (eventCategoryFilter === "KINETIC")
                    return evt.type === "KINETIC_STRIKE" || evt.type === "DRONE_INTERDICTION";
                  if (eventCategoryFilter === "MARITIME")
                    return evt.type === "NAVAL_BLOCKADE" || evt.type === "PORT_CLOSURE" || evt.type === "MINE_ADVISORY";
                  if (eventCategoryFilter === "PIPELINE") return evt.type === "PIPELINE_CLOSURE";
                  if (eventCategoryFilter === "ELECTRONIC") return evt.type === "ELECTRONIC_JAMMING";
                  return true;
                })
                .map((evt) => {
                  const isSelected = selectedEventId === evt.id;

                  return (
                    <div
                      key={`drawer-evt-${evt.id}`}
                      className={`p-3.5 rounded-xl border transition-all ${
                        evt.isActive
                          ? isSelected
                            ? "bg-[#28090C] border-[#EF4444] shadow-lg shadow-red-950/40"
                            : "bg-[#140D10] border-[#EF4444]/35 hover:border-[#EF4444]"
                          : "bg-black/30 border-gray-800 opacity-60"
                      }`}
                    >
                      {/* Event Card Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              evt.isActive ? "bg-[#EF4444] animate-ping" : "bg-[#8292A6]"
                            }`}
                          />
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#EF4444]/25 text-[#FCA5A5] border border-[#EF4444]/40">
                            {evt.type.replace(/_/g, " ")}
                          </span>
                          <span className="text-[10px] text-[#8292A6]">
                            {evt.relativeTime} &bull; {new Date(evt.timestamp).toLocaleTimeString()}
                          </span>
                        </div>

                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            evt.severity.toLowerCase() === "critical"
                              ? "bg-[#EF4444] text-white"
                              : evt.severity.toLowerCase() === "high"
                              ? "bg-[#F97316] text-[#0A101A]"
                              : "bg-[#EAB308] text-[#0A101A]"
                          }`}
                        >
                          {evt.severity}
                        </span>
                      </div>

                      {/* Headline & Title */}
                      <h4 className="text-sm font-bold text-[#EDE9DE] mt-2">{evt.title}</h4>
                      <p className="text-[11px] text-[#F87171] mt-0.5 font-semibold">
                        {evt.headline}
                      </p>

                      {/* Operational Impact */}
                      <p className="text-[11px] text-[#CAD6E2] font-sans leading-relaxed mt-2 bg-black/40 p-2.5 rounded border border-white/5">
                        {evt.operationalImpact}
                      </p>

                      {/* Market Impact & Coordinates */}
                      <div className="mt-2.5 pt-2.5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                        <div className="space-y-1">
                          <div className="text-[#8292A6] flex justify-between">
                            <span>Brent Impact:</span>
                            <span className="text-[#F87171] font-bold">
                              {evt.marketImpact.brentSpread}
                            </span>
                          </div>
                          <div className="text-[#8292A6] flex justify-between">
                            <span>War Risk Premium:</span>
                            <span className="text-[#F87171] font-bold">
                              {evt.marketImpact.tankerRates}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1 bg-black/30 p-1.5 rounded border border-[#B08D57]/20">
                          <div className="text-[#8292A6] flex justify-between">
                            <span>Target Coords:</span>
                            <span className="text-[#E5C794] font-mono">
                              {evt.coordinates[1].toFixed(2)}°N, {evt.coordinates[0].toFixed(2)}°E
                            </span>
                          </div>
                          <div className="text-[#8292A6] truncate">
                            Status:{" "}
                            <span className={evt.isActive ? "text-[#EF4444] font-bold" : "text-[#10B981]"}>
                              {evt.isActive ? "ACTIVE INTERDICTION" : "RESOLVED / ARCHIVED"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            flyToIncident(evt);
                            setShowEventMonitorDrawer(false);
                          }}
                          className="flex-1 py-1.5 px-3 rounded bg-[#EF4444]/25 hover:bg-[#EF4444]/40 border border-[#EF4444]/60 text-[#EDE9DE] text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow"
                        >
                          <Crosshair className="w-3.5 h-3.5 text-[#EF4444]" />
                          <span>Fly To & Target on Map</span>
                        </button>

                        {evt.isActive ? (
                          <button
                            onClick={() => handleResolveEvent(evt.id)}
                            className="py-1.5 px-3 rounded bg-black/40 hover:bg-black/70 border border-[#8292A6]/40 hover:border-[#10B981] text-[#8292A6] hover:text-[#10B981] text-xs transition-colors flex items-center gap-1"
                            title="Mark incident as resolved"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Resolve</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-[#10B981] font-bold flex items-center gap-1 px-2">
                            <CheckCircle2 className="w-3 h-3" /> Resolved
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-[#B08D57]/20 bg-black/60 flex items-center justify-between text-[11px] text-[#8292A6] shrink-0">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                Live Telemetry Ingestion Active
              </span>
              <button
                onClick={() => setShowEventMonitorDrawer(false)}
                className="px-3 py-1 rounded bg-[#B08D57]/20 hover:bg-[#B08D57]/30 border border-[#B08D57]/40 text-[#EDE9DE] transition-colors font-bold"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INCIDENT INGESTION & CRISIS SIMULATOR MODAL */}
      {showInjectEventModal && (
        <div
          id="inject-event-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setShowInjectEventModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            id="inject-event-modal-card"
            className="bg-[#09111C] border border-[#EF4444]/40 rounded-xl max-w-3xl w-full p-4 sm:p-5 text-[#EDE9DE] shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto custom-scrollbar font-mono-data"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#EF4444]/30 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#EF4444]/20 border border-[#EF4444]/50 flex items-center justify-center text-[#EF4444]">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#EDE9DE] font-sans">
                    Ingest Real-Time Geopolitical Incident
                  </h3>
                  <p className="text-[11px] text-[#8292A6] font-mono-data mt-0.5">
                    Inject kinetic strikes, electronic jamming, or chokepoint interdictions directly into the live map engine
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInjectEventModal(false)}
                className="p-1.5 rounded-lg bg-black/40 border border-[#8292A6]/30 hover:border-[#EDE9DE] text-[#8292A6] hover:text-[#EDE9DE] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick 1-Click Incident Scenario Presets */}
            <div className="mb-5">
              <label className="text-xs font-bold text-[#B08D57] uppercase tracking-wider block mb-2">
                1-Click Realistic Geopolitical Crisis Scenarios:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  {
                    title: "Bab el-Mandeb: Anti-Ship Ballistic Missile Salvo",
                    headline: "CENTCOM interceptors engage 4 ASBMs off Mocha; commercial convoy evasive reroute",
                    coords: [43.32, 12.65] as [number, number],
                    type: "DRONE_INTERDICTION" as const,
                    chokepoints: ["bab-el-mandeb"],
                    severity: "critical" as const,
                    region: "Bab el-Mandeb / Gulf of Aden",
                    asset: "Mandeb International Shipping Lane",
                    brentSpread: "+$4.20/bbl prompt",
                    tankerRates: "+1.65% hull",
                    impact: "Commercial tankers diverting south around Cape of Good Hope. Insurance underwriters demand immediate 72-hour notice.",
                  },
                  {
                    title: "Strait of Hormuz: High-Speed IRGC Interdiction",
                    headline: "IRGC fast-attack boats challenge crude supertanker in outbound separation lane",
                    coords: [56.35, 26.55] as [number, number],
                    type: "NAVAL_BLOCKADE" as const,
                    chokepoints: ["hormuz"],
                    severity: "critical" as const,
                    region: "Strait of Hormuz",
                    asset: "Hormuz Outbound VLCC Channel",
                    brentSpread: "+$7.50/bbl surge",
                    tankerRates: "+2.20% war-risk premium",
                    impact: "Tanker transit traffic stalled in Fujairah anchorage. ADCOP pipeline ramping to max 1.5M bpd capacity.",
                  },
                  {
                    title: "Malacca Strait: AIS Spoofing & GPS Jamming Cluster",
                    headline: "Over 40 VLCCs report phantom positioning data and electronic interference off Phillips Channel",
                    coords: [103.65, 1.25] as [number, number],
                    type: "ELECTRONIC_JAMMING" as const,
                    chokepoints: ["malacca"],
                    severity: "high" as const,
                    region: "Strait of Malacca",
                    asset: "Singapore Strait Fairway",
                    brentSpread: "+$1.10/bbl",
                    tankerRates: "+0.45% navigation risk",
                    impact: "Singapore port control shifting to visual radar pilotage. Speed reductions of 30% across Singapore Strait.",
                  },
                  {
                    title: "Black Sea / Bosphorus: Drifting Sea Mine Advisory",
                    headline: "Turkish Coast Guard halts northbound vessel convoys following drifting ordnance sighting",
                    coords: [29.1, 41.25] as [number, number],
                    type: "MINE_ADVISORY" as const,
                    chokepoints: ["turkish-straits"],
                    severity: "high" as const,
                    region: "Turkish Straits / Black Sea",
                    asset: "Bosphorus Northbound Transit Lane",
                    brentSpread: "+$0.85/bbl",
                    tankerRates: "+0.90% Bosphorus delay",
                    impact: "Black Sea crude and wheat flow paused at anchorages. Minesweeper flotilla deployed from Rumeli Feneri.",
                  },
                  {
                    title: "Suez Canal: Ultra-Large Container Ship Engine Failure",
                    headline: "24,000 TEU container vessel suffers rudder lock in Great Bitter Lake channel",
                    coords: [32.35, 30.5] as [number, number],
                    type: "PORT_CLOSURE" as const,
                    chokepoints: ["suez"],
                    severity: "high" as const,
                    region: "Suez Canal / Great Bitter Lake",
                    asset: "Suez Navigational Channel",
                    brentSpread: "+$2.30/bbl prompt",
                    tankerRates: "Suez toll surcharge +15%",
                    impact: "SCA tugs dispatched for salvage operation. Northbound convoy halted; 32 vessels queued at Port Said.",
                  },
                  {
                    title: "Saudi Petroline: Pumping Station 8 Mechanical Interruption",
                    headline: "East-West crude artery operating at 40% reduced capacity following telemetry surge",
                    coords: [44.8, 24.2] as [number, number],
                    type: "PIPELINE_CLOSURE" as const,
                    chokepoints: ["hormuz", "bab-el-mandeb"],
                    severity: "high" as const,
                    region: "Central Saudi Arabia",
                    asset: "East-West Petroline (Station 8)",
                    brentSpread: "+$1.90/bbl",
                    tankerRates: "Ras Tanura loading premium",
                    impact: "Aramco redirects crude flows to Ras Tanura terminal while inspection crews review valves at Station 8.",
                  },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      handleInjectSimulatedEvent({
                        title: preset.title,
                        headline: preset.headline,
                        type: preset.type,
                        severity: preset.severity,
                        coordinates: preset.coords,
                        relatedChokepointIds: preset.chokepoints,
                        assetAffected: preset.asset,
                        region: preset.region,
                        operationalImpact: preset.impact,
                        marketImpact: {
                          brentSpread: preset.brentSpread,
                          tankerRates: preset.tankerRates,
                          macroShift: "Simulated real-time crisis injection test",
                        },
                      });
                      setShowInjectEventModal(false);
                    }}
                    className="p-2.5 rounded-lg bg-black/40 border border-[#EF4444]/30 hover:border-[#EF4444] hover:bg-[#20090C] text-left transition-all group"
                  >
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="text-[#EF4444] font-bold group-hover:underline">
                        {preset.type.replace(/_/g, " ")}
                      </span>
                      <span className="text-[#E5C794]">{preset.brentSpread}</span>
                    </div>
                    <div className="text-xs font-bold text-[#EDE9DE] mt-1">{preset.title}</div>
                    <div className="text-[10px] text-[#8292A6] mt-0.5 truncate">
                      {preset.headline}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Incident Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const title = (form.elements.namedItem("eventTitle") as HTMLInputElement).value;
                const headline = (form.elements.namedItem("eventHeadline") as HTMLInputElement).value;
                const type = (form.elements.namedItem("eventType") as HTMLSelectElement).value as GeoStrategicEvent["type"];
                const severity = (form.elements.namedItem("eventSeverity") as HTMLSelectElement).value as GeoStrategicEvent["severity"];
                const lat = parseFloat((form.elements.namedItem("eventLat") as HTMLInputElement).value);
                const lon = parseFloat((form.elements.namedItem("eventLon") as HTMLInputElement).value);
                const brent = (form.elements.namedItem("eventBrent") as HTMLInputElement).value || "+$2.50/bbl";
                const impact = (form.elements.namedItem("eventImpact") as HTMLTextAreaElement).value;

                handleInjectSimulatedEvent({
                  title: title || "Custom Strategic Threat Event",
                  headline: headline || "Real-time tactical intelligence alert logged by operator",
                  type,
                  severity,
                  coordinates: [lon, lat],
                  relatedChokepointIds: [],
                  assetAffected: "Designated Maritime Sector",
                  region: "Geopolitical Theater",
                  operationalImpact: impact || "Vessel routing algorithms shifting away from indicated coordinates.",
                  marketImpact: {
                    brentSpread: brent,
                    tankerRates: "+1.20% war surcharge",
                    macroShift: "Custom scenario transmission test",
                  },
                });
                setShowInjectEventModal(false);
              }}
              className="space-y-3 bg-black/40 p-4 rounded-xl border border-[#B08D57]/20"
            >
              <div className="text-xs font-bold text-[#B08D57] uppercase tracking-wider">
                Or Configure Custom Threat Telemetry:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] text-[#8292A6] uppercase mb-1">
                    Event Title / Codename
                  </label>
                  <input
                    name="eventTitle"
                    defaultValue="Operation Deep Sentinel"
                    required
                    className="w-full bg-[#0E1724] border border-[#2D435E] rounded p-2 text-[#EDE9DE] text-xs focus:border-[#EF4444] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[#8292A6] uppercase mb-1">
                    Threat Category
                  </label>
                  <select
                    name="eventType"
                    defaultValue="KINETIC_STRIKE"
                    className="w-full bg-[#0E1724] border border-[#2D435E] rounded p-2 text-[#EDE9DE] text-xs focus:border-[#EF4444] focus:outline-none"
                  >
                    <option value="KINETIC_STRIKE">Kinetic Strike (Missile / Shelling)</option>
                    <option value="DRONE_INTERDICTION">Drone / UAV Swarm Attack</option>
                    <option value="NAVAL_BLOCKADE">Naval Blockade / Boarding</option>
                    <option value="MINE_ADVISORY">Sea Mine Advisory</option>
                    <option value="ELECTRONIC_JAMMING">Electronic Jamming / AIS Spoofing</option>
                    <option value="PORT_CLOSURE">Port / Canal Interdiction</option>
                    <option value="PIPELINE_CLOSURE">Overland Pipeline Disruption</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] text-[#8292A6] uppercase mb-1">
                    Latitude (°N)
                  </label>
                  <input
                    name="eventLat"
                    type="number"
                    step="0.01"
                    defaultValue="25.5"
                    required
                    className="w-full bg-[#0E1724] border border-[#2D435E] rounded p-1.5 text-[#EDE9DE] text-xs focus:border-[#EF4444] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#8292A6] uppercase mb-1">
                    Longitude (°E)
                  </label>
                  <input
                    name="eventLon"
                    type="number"
                    step="0.01"
                    defaultValue="54.2"
                    required
                    className="w-full bg-[#0E1724] border border-[#2D435E] rounded p-1.5 text-[#EDE9DE] text-xs focus:border-[#EF4444] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#8292A6] uppercase mb-1">
                    Severity
                  </label>
                  <select
                    name="eventSeverity"
                    defaultValue="CRITICAL"
                    className="w-full bg-[#0E1724] border border-[#2D435E] rounded p-1.5 text-[#EDE9DE] text-xs focus:border-[#EF4444] focus:outline-none"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="ELEVATED">Elevated</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#8292A6] uppercase mb-1">
                  Tactical Headline & Immediate Impact
                </label>
                <input
                  name="eventHeadline"
                  defaultValue="Surface engagement reported in international shipping channel"
                  required
                  className="w-full bg-[#0E1724] border border-[#2D435E] rounded p-2 text-[#EDE9DE] text-xs focus:border-[#EF4444] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#8292A6] uppercase mb-1">
                  Operational Details & Routing Transmission
                </label>
                <textarea
                  name="eventImpact"
                  rows={2}
                  defaultValue="Maritime safety operations center advises all commercial vessels to maintain minimum 20nm standoff distance."
                  className="w-full bg-[#0E1724] border border-[#2D435E] rounded p-2 text-[#EDE9DE] text-xs focus:border-[#EF4444] focus:outline-none resize-none font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInjectEventModal(false)}
                  className="px-3 py-1.5 rounded bg-black/40 border border-[#8292A6]/30 hover:border-[#EDE9DE] text-[#8292A6] hover:text-[#EDE9DE] text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-lg"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Ingest & Target on Map</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isExpanded && (
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#B08D57]/25 text-xs font-mono-data text-[#8292A6]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            Institutional Expanded Geospatial Cartography Active &bull; Press <kbd className="px-1.5 py-0.5 rounded bg-black/60 border border-[#B08D57]/40 text-[#E5C794] text-[10px]">ESC</kbd> to exit
          </span>
          <button
            onClick={handleCloseExpand}
            className="px-3 py-1 rounded bg-[#B08D57]/20 hover:bg-[#B08D57]/30 text-[#E5C794] border border-[#B08D57]/40 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Collapse View</span>
          </button>
        </div>
      )}
    </div>
    </>
  );
};

export const ChokepointHeatmap = React.memo(ChokepointHeatmapComponent);
