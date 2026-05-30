"use client";

import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Compass,
  Cpu,
  Loader2,
  PackageCheck,
  Rocket,
  Settings,
  Shield,
  Sliders,
  Terminal,
  User,
  Wind,
  Zap,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Typewriter } from "react-simple-typewriter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OnboardingRightSideProps {
  currentStep: number;
  purposes: string[];
  username: string;
  selectedRole: string;
  projectName: string;
  projectStatus: string;
  theme?: string;
  clerkUser?: any;
  onLaunch?: () => Promise<void>;
  isLaunching?: boolean;
}

// ============================================================================
// --- CUSTOMIZATION CONFIGURATION (Tweak colors, sizes, and layout here) ---
// ============================================================================
export const ROCKET_HUD_CONFIG = {
  // Performance and Frame-rate settings
  performance: {
    maxFps: 40, // Cap FPS to avoid high CPU usage (especially on 120Hz Mac ProMotion screens)
    pauseWhenHidden: true, // Pause canvas animation entirely when tab is inactive (saves battery/CPU)
  },

  // Dimensions, Scaling, and Viewports
  sizes: {
    gridSize: 45, // Size of each background grid cell in pixels
    fov: 400, // Field of View depth projection (lower = more fish-eye, higher = flatter)
    cameraDistance: 300, // Camera distance from the object
    starCount: 300, // Total number of background warp stars
    starMaxZ: 900, // Max depth range for stars
    starSpeedBase: 0.8, // Normal speed for stars
    starSpeedWarp: 24.0, // Warp speed for stars (Step 5)
    centerYOffset: 30, // Additional vertical coordinate adjustment to center the rocket in layout
    vesselWarpYOffset: -185, // Fly-up height offset when step 5 is active

    // Rocket line stroke widths
    rocketLineThickness: {
      pilot: 0.9,
      latch: 1.3,
      cone: 1.2,
      structure: 1.0,
      flame: 1.3,
      smoke: 1.0, // Base multiplier for smoke fluid wind lines
      warpSplash: 1.0,
    },

    // Launchpad Turntable sizing (Step 1)
    padRadii: {
      inner: 100,
      middle: 145,
      outer: 195,
    },
  },

  // Color Palette Definitions (Colors & Opacity values)
  colors: {
    background: "#000000", // Canvas background color
    gridLine: "rgba(255, 255, 255, 0.012)", // Background grid lines

    // RGB channels (0-255, 0-255, 0-255) for dynamic opacity elements
    starRgb: "255, 255, 255",
    launchpadRgb: "255, 255, 255",
    igniterRingRgb: "255, 255, 255",
    flameRgb: "255, 255, 255",
    smokeRgb: "255, 255, 255",
    warpSplashRgb: "255, 255, 255",

    // Opacity bounds (0.0 to 1.0)
    starWarpOpacity: 0.38, // Star line opacity at warp speed (Step 5)
    starNormalOpacity: 0.08, // Star line opacity at normal speed (Steps 1-4)
    padMaxOpacity: 0.35, // Launchpad platform max opacity

    // Wireframe parts (solid or semi-transparent)
    pilotBack: "rgba(255, 255, 255, 0.12)",
    pilotFront: "rgba(255, 255, 255, 0.45)",
    latchBack: "rgba(255, 255, 255, 0.16)",
    latchFront: "rgba(255, 255, 255, 0.65)",
    coneBack: "rgba(255, 255, 255, 0.14)",
    coneFront: "rgba(255, 255, 255, 0.55)",
    structureBack: "rgba(255, 255, 255, 0.12)",
    structureFront: "rgba(255, 255, 255, 0.38)",

    // Step 1: Assembly indicators
    directionArrowLine: "rgba(255, 255, 255, 0.35)",
    directionArrowFill: "rgba(255, 255, 255, 0.4)",
    redDownwardArrowLine: "rgba(239, 68, 68, 0.8)",
    redDownwardArrowFill: "rgba(239, 68, 68, 0.9)",

    // Step 3+: Vessel Name & Exhaust Effects
    vesselNameText: "rgba(255, 255, 255, 0.55)",
    smokeRadialFogStart: "rgba(255, 255, 255, 0.05)",
    smokeRadialFogMiddle: "rgba(255, 255, 255, 0.02)",
    smokeRadialFogEnd: "rgba(255, 255, 255, 0)",
  },

  // 3D Text Typography Configurations
  fonts: {
    nameFontFamily: "monospace",
    nameFontWeight: "bold",
    nameFontSize: 9,
  },

  // Outer HUD Static Text Customizations (Modify HTML texts here)
  hudLabels: {
    stationHeader: "WEKRAFT LAUNCH STATION // R-01",
    stationStatus: "Holographic grid sync online",
    crewCardTitle: "VESSEL CREW",
    crewCardDefaultName: "ASTRONAUT",
    crewCardDefaultRole: "SPECIALIST",
    diagnosticsTitle: "DIAGNOSTIC LOGS",
    telemetryTitle: "MISSION TELEMETRY",
  },
};

// --- 3D Geometry Utilities ---
interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Edge {
  v1: number;
  v2: number;
  type?: "structure" | "pilot" | "latch" | "core" | "cone";
}

interface ComponentGeometry {
  vertices: Point3D[];
  edges: Edge[];
}

function rotateX(p: Point3D, angle: number): Point3D {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: p.x,
    y: p.y * cos - p.z * sin,
    z: p.y * sin + p.z * cos,
  };
}

function rotateY(p: Point3D, angle: number): Point3D {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: p.x * cos + p.z * sin,
    y: p.y,
    z: -p.x * sin + p.z * cos,
  };
}

function rotateZ(p: Point3D, angle: number): Point3D {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: p.x * cos - p.y * sin,
    y: p.x * sin + p.y * cos,
    z: p.z,
  };
}

function rotatePoint(
  p: Point3D,
  pitch: number,
  yaw: number,
  roll: number,
): Point3D {
  let pt = rotateY(p, yaw);
  pt = rotateX(pt, pitch);
  pt = rotateZ(pt, roll);
  return pt;
}

// --- Spacecraft Geometry Generators (Enlarged and Enhanced) ---

// Component 1: Top Cap (Funnel Shape + Conical Nose Cone Tip - Enlarged)
function generateTopCap(): ComponentGeometry {
  const vertices: Point3D[] = [];
  const edges: Edge[] = [];
  const segments = 16;

  const layers = [
    { y: -35, r: 45 }, // Cone base ring
    { y: -20, r: 75 }, // Outer rim upper
    { y: 0, r: 85 }, // Mid-body outer
    { y: 25, r: 85 }, // Lower outer
    { y: 25, r: 65 }, // Inner sleeve insertion ring
  ];

  // Generate standard layers
  layers.forEach((layer, layerIdx) => {
    const base = layerIdx * segments;
    for (let i = 0; i < segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      vertices.push({
        x: Math.cos(theta) * layer.r,
        y: layer.y,
        z: Math.sin(theta) * layer.r,
      });
      edges.push({
        v1: base + i,
        v2: base + ((i + 1) % segments),
        type: "structure",
      });
    }
  });

  // Longitudinal connecting lines
  for (let i = 0; i < segments; i++) {
    edges.push({ v1: i, v2: segments + i, type: "structure" });
    edges.push({ v1: segments + i, v2: 2 * segments + i, type: "structure" });
    edges.push({
      v1: 2 * segments + i,
      v2: 3 * segments + i,
      type: "structure",
    });
    edges.push({
      v1: 3 * segments + i,
      v2: 4 * segments + i,
      type: "structure",
    });
  }

  // Conical Nose Cone Tip vertex at the very top (local Y = -80)
  const tipIdx = vertices.length;
  vertices.push({ x: 0, y: -80, z: 0 });

  // Connect tip to form a true cone
  for (let i = 0; i < segments; i++) {
    edges.push({ v1: tipIdx, v2: i, type: "cone" });
  }

  // Antenna Tip needle extending straight up from the nose cone tip
  const antennaTipIdx = vertices.length;
  vertices.push({ x: 0, y: -110, z: 0 });
  edges.push({ v1: tipIdx, v2: antennaTipIdx, type: "cone" });

  return { vertices, edges };
}

// Component 2: Upper Sleeve (Cockpit - Enlarged)
function generateUpperSleeve(): ComponentGeometry {
  const vertices: Point3D[] = [];
  const edges: Edge[] = [];
  const segments = 16;

  const layers = [
    { y: -50, r: 85 }, // Top collar
    { y: -15, r: 85 },
    { y: 15, r: 85 },
    { y: 50, r: 85 }, // Bottom collar
  ];

  layers.forEach((layer, layerIdx) => {
    const base = layerIdx * segments;
    for (let i = 0; i < segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      vertices.push({
        x: Math.cos(theta) * layer.r,
        y: layer.y,
        z: Math.sin(theta) * layer.r,
      });
      edges.push({
        v1: base + i,
        v2: base + ((i + 1) % segments),
        type: "structure",
      });
    }
  });

  // Vertical sleeve wall lines
  for (let i = 0; i < segments; i++) {
    edges.push({ v1: i, v2: segments + i, type: "structure" });
    edges.push({ v1: segments + i, v2: 2 * segments + i, type: "structure" });
    edges.push({
      v1: 2 * segments + i,
      v2: 3 * segments + i,
      type: "structure",
    });
  }

  // Add Front Latch (from screenshot shield element) at theta = PI (front of the cylinder, z < 0)
  const latchBase = vertices.length;
  vertices.push({ x: -16, y: -12, z: -90 }); // 0: top-left
  vertices.push({ x: 16, y: -12, z: -90 }); // 1: top-right
  vertices.push({ x: 12, y: 18, z: -90 }); // 2: bottom-right
  vertices.push({ x: -12, y: 18, z: -90 }); // 3: bottom-left
  vertices.push({ x: 0, y: 28, z: -90 }); // 4: lower tip

  edges.push({ v1: latchBase, v2: latchBase + 1, type: "latch" });
  edges.push({ v1: latchBase + 1, v2: latchBase + 2, type: "latch" });
  edges.push({ v1: latchBase + 2, v2: latchBase + 4, type: "latch" });
  edges.push({ v1: latchBase + 4, v2: latchBase + 3, type: "latch" });
  edges.push({ v1: latchBase + 3, v2: latchBase, type: "latch" });

  // Connect latch corners to the sleeve body at front points (theta approx 1.5*PI, which is index 12 in 16-segment layers)
  // Layer 1 starts at index 16, so 28 (16+12) is front center.
  // Layer 2 starts at index 32, so 44 (32+12) is front center.
  const bodyTop = 28;
  const bodyMid = 44;
  edges.push({ v1: latchBase, v2: bodyTop - 1, type: "latch" });
  edges.push({ v1: latchBase + 1, v2: bodyTop + 1, type: "latch" });
  edges.push({ v1: latchBase + 3, v2: bodyMid - 1, type: "latch" });
  edges.push({ v1: latchBase + 2, v2: bodyMid + 1, type: "latch" });

  // Add Pilot Helmet mesh (to be selectively rendered inside cockpit) - Enlarged
  const pilotBase = vertices.length;
  const rad = 15;
  const latBands = 5;
  const lonBands = 8;

  // Generate helmet sphere points
  for (let lat = 0; lat <= latBands; lat++) {
    const theta = (lat * Math.PI) / latBands;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let lon = 0; lon < lonBands; lon++) {
      const phi = (lon * 2 * Math.PI) / lonBands;
      vertices.push({
        x: Math.cos(phi) * sinTheta * rad,
        y: cosTheta * rad - 5, // sitting centered in sleeve
        z: Math.sin(phi) * sinTheta * rad,
      });
    }
  }

  // Connect pilot helmet mesh lines
  for (let lat = 0; lat < latBands; lat++) {
    for (let lon = 0; lon < lonBands; lon++) {
      const first = lat * lonBands + lon;
      const second = first + lonBands;

      edges.push({
        v1: pilotBase + first,
        v2: pilotBase + (((first + 1) % lonBands) + lat * lonBands),
        type: "pilot",
      });
      edges.push({
        v1: pilotBase + second,
        v2: pilotBase + (((second + 1) % lonBands) + (lat + 1) * lonBands),
        type: "pilot",
      });
      edges.push({
        v1: pilotBase + first,
        v2: pilotBase + second,
        type: "pilot",
      });
    }
  }

  return { vertices, edges };
}

// Component 3: Reactor core (vertical rods bundle - Enlarged & Enhanced)
function generateReactorCore(): ComponentGeometry {
  const vertices: Point3D[] = [];
  const edges: Edge[] = [];
  const numRods = 12;
  const rodRadius = 9;
  const coreRadius = 40;
  const rodHeight = 110;

  for (let r = 0; r < numRods; r++) {
    const angle = (r / numRods) * Math.PI * 2;
    const centerX = Math.cos(angle) * coreRadius;
    const centerZ = Math.sin(angle) * coreRadius;
    const baseVertIdx = vertices.length;
    const segments = 6;

    // Top cap of the rod
    for (let i = 0; i < segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      vertices.push({
        x: centerX + Math.cos(theta) * rodRadius,
        y: -rodHeight / 2,
        z: centerZ + Math.sin(theta) * rodRadius,
      });
      edges.push({
        v1: baseVertIdx + i,
        v2: baseVertIdx + ((i + 1) % segments),
        type: "core",
      });
    }

    // Bottom cap of the rod
    for (let i = 0; i < segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      vertices.push({
        x: centerX + Math.cos(theta) * rodRadius,
        y: rodHeight / 2,
        z: centerZ + Math.sin(theta) * rodRadius,
      });
      edges.push({
        v1: baseVertIdx + segments + i,
        v2: baseVertIdx + segments + ((i + 1) % segments),
        type: "core",
      });
      // Vertical connector
      edges.push({
        v1: baseVertIdx + i,
        v2: baseVertIdx + segments + i,
        type: "core",
      });
    }
  }

  return { vertices, edges };
}

// Component 4: Base Receptacle (Enlarged)
function generateBaseReceptacle(): ComponentGeometry {
  const vertices: Point3D[] = [];
  const edges: Edge[] = [];
  const segments = 16;

  const layers = [
    { y: -45, r: 85 }, // Top collar
    { y: -15, r: 85 },
    { y: 15, r: 85 },
    { y: 45, r: 85 }, // Bottom collar
    { y: 68, r: 55 }, // Engine nozzle bell
  ];

  layers.forEach((layer, layerIdx) => {
    const base = layerIdx * segments;
    for (let i = 0; i < segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      vertices.push({
        x: Math.cos(theta) * layer.r,
        y: layer.y,
        z: Math.sin(theta) * layer.r,
      });
      edges.push({
        v1: base + i,
        v2: base + ((i + 1) % segments),
        type: "structure",
      });
    }
  });

  // Vertical sleeve lines
  for (let i = 0; i < segments; i++) {
    edges.push({ v1: i, v2: segments + i, type: "structure" });
    edges.push({ v1: segments + i, v2: 2 * segments + i, type: "structure" });
    edges.push({
      v1: 2 * segments + i,
      v2: 3 * segments + i,
      type: "structure",
    });
    edges.push({
      v1: 3 * segments + i,
      v2: 4 * segments + i,
      type: "structure",
    });
  }

  // Add 4 aerodynamic stabilizer fins
  const finAngles = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
  finAngles.forEach((angle) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const vBase = vertices.length;
    // Fin outer points
    vertices.push({ x: cos * 125, y: 25, z: sin * 125 }); // fin tip top
    vertices.push({ x: cos * 125, y: 55, z: sin * 125 }); // fin tip bottom

    const segIdx = Math.round((angle / (Math.PI * 2)) * segments) % segments;

    // root top (layer 2, y = 15): index 2 * segments + segIdx
    const rootTop = 2 * segments + segIdx;
    // root bottom (layer 3, y = 45): index 3 * segments + segIdx
    const rootBottom = 3 * segments + segIdx;

    edges.push({ v1: rootTop, v2: vBase, type: "structure" });
    edges.push({ v1: vBase, v2: vBase + 1, type: "structure" });
    edges.push({ v1: vBase + 1, v2: rootBottom, type: "structure" });
    edges.push({ v1: vBase, v2: rootBottom, type: "structure" });
  });

  return { vertices, edges };
}

// --- Main Component ---
export function OnboardingRightSide({
  currentStep,
  purposes,
  username,
  selectedRole,
  projectName,
  projectStatus,
  theme = "dark",
  clerkUser,
  onLaunch,
  isLaunching = false,
}: OnboardingRightSideProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const arrowSvgRef = useRef<SVGSVGElement>(null);
  const arrowPathRef = useRef<SVGPathElement>(null);
  const arrowDotRef = useRef<SVGCircleElement>(null);
  const nameOverlayRef = useRef<HTMLDivElement>(null);
  const nameArrowSvgRef = useRef<SVGSVGElement>(null);
  const nameArrowPathRef = useRef<SVGPathElement>(null);
  const nameArrowDotRef = useRef<SVGCircleElement>(null);

  const [showLaunchOverlay, setShowLaunchOverlay] = useState(false);
  const showLaunchOverlayRef = useRef(false);
  const step4StartTimeRef = useRef<number | null>(null);

  // Sync props to refs to avoid restarting canvas loop on updates
  const currentStepRef = useRef(currentStep);
  const projectNameRef = useRef(projectName);
  const usernameRef = useRef(username);
  const selectedRoleRef = useRef(selectedRole);

  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  useEffect(() => {
    projectNameRef.current = projectName;
  }, [projectName]);

  useEffect(() => {
    usernameRef.current = username;
  }, [username]);

  useEffect(() => {
    selectedRoleRef.current = selectedRole;
  }, [selectedRole]);

  // Tech diagnostic logs
  const [logs, setLogs] = useState<string[]>([
    "SYS INIT // CORE SEQUENCE LOADED",
    "PENDING hardpoint docking clamps release...",
  ]);

  useEffect(() => {
    const step = currentStep;
    let newLogs: string[] = [];
    if (step === 1) {
      newLogs = [
        "STATUS: ASSEMBLY MODE // EXPLODED STATE ACTIVED",
        "CONNECTING structural segments to launchpad turntable...",
        "WAITING for mission pilot assignment...",
      ];
    } else if (step === 2) {
      newLogs = [
        "STATUS: CREW BOARDING IN PROGRESS",
        `PILOT LOGGED: ${username || clerkUser?.fullName || ROCKET_HUD_CONFIG.hudLabels.crewCardDefaultName}`,
        `BIO-SYNC ROLE: ${selectedRole || ROCKET_HUD_CONFIG.hudLabels.crewCardDefaultRole}`,
        "COMMENCING structural module docking locking sequence...",
      ];
    } else if (step === 3) {
      newLogs = [
        "STATUS: ALL HARDPOINTS LOCKED & DOCKED",
        `VESSEL NAME DECLARED: [${projectName || "WEKRAFT-01"}]`,
        "IGNITING fusion reactor plasma rings...",
        "CHECKING fuel rods pressure metrics [OK]",
      ];
    } else if (step === 4) {
      newLogs = [
        "STATUS: WARP DRIVE ENGAGED // GO FOR LAUNCH",
        "VELOCITY: OVERDRIVE warp speed index [OK]",
        "ATMOSPHERIC drag shield deployed [100%]",
        "WELCOME ABOARD WEKRAFT WORKSPACE!",
      ];
    }
    setLogs(newLogs);
  }, [currentStep, username, selectedRole, projectName, clerkUser]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    let isRunning = true;
    let lastFrameTime = performance.now();

    // Visibility Listener to pause calculations when user switches tabs (saves CPU on Mac/Windows)
    const handleVisibilityChange = () => {
      const wasRunning = isRunning;
      isRunning = document.visibilityState === "visible";
      if (isRunning && !wasRunning) {
        lastFrameTime = performance.now();
        render();
      }
    };

    if (ROCKET_HUD_CONFIG.performance.pauseWhenHidden) {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    // Component geometries
    const topCap = generateTopCap();
    const upperSleeve = generateUpperSleeve();
    const core = generateReactorCore();
    const base = generateBaseReceptacle();

    // Base component center Y layout positions when locked (stacked larger height offsets)
    const lockedY = {
      topCap: -140,
      upperSleeve: -70,
      core: 30,
      base: 125,
    };

    // Current animated component offsets (starts exploded)
    // Redesigned: topCap target offset is reduced (-220 instead of -280) to fix the gap
    const offsets = {
      topCap: -220,
      upperSleeve: -145,
      core: 20,
      base: 190,
    };

    // Rotation angles
    let pitch = 0.35; // perspective tilt
    let yaw = 0.0; // spin
    let roll = 0.0; // roll wobble
    let time = 0;

    // Displacement offsets (for vertical flying motion in Step 5)
    let vesselCenterYOffset = 0;
    let takeoffY = 0;

    // Particle types
    interface Star {
      x: number;
      y: number;
      z: number;
      prevZ: number;
      brightness: number;
    }

    interface SmokePoint {
      x: number;
      y: number;
      z: number;
    }

    interface Smoke {
      path: SmokePoint[];
      vx: number;
      vy: number;
      vz: number;
      life: number;
      opacity: number;
      side: number; // -1 for left, 1 for right
      width: number;
    }

    interface Flame {
      x: number;
      y: number;
      z: number;
      vy: number;
      length: number;
      life: number;
    }

    interface AirSplash {
      y: number;
      radius: number;
      opacity: number;
    }

    // Full dense stars background (300 stars)
    const stars: Star[] = [];
    for (let i = 0; i < ROCKET_HUD_CONFIG.sizes.starCount; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 1500,
        y: (Math.random() - 0.5) * 1500,
        z: Math.random() * ROCKET_HUD_CONFIG.sizes.starMaxZ,
        prevZ: 0,
        brightness: 0.2 + Math.random() * 0.8,
      });
    }

    const smokeParticles: Smoke[] = [];
    const flameParticles: Flame[] = [];
    const splashRings: AirSplash[] = [];

    // Camera settings
    const fov = ROCKET_HUD_CONFIG.sizes.fov;
    const cameraDistance = ROCKET_HUD_CONFIG.sizes.cameraDistance;
    const cameraShake = { x: 0, y: 0 };
    let launchpadY = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        // Keeps rendering scale at 1x logical pixels. Perfect for performance on High DPI Retina Mac displays
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    window.addEventListener("resize", resize);
    resize();

    // Render loop
    const render = (timestamp?: number) => {
      if (!isRunning) return;

      animFrame = requestAnimationFrame(render);

      // Throttling to capped FPS to avoid high CPU/GPU usage (especially on high-refresh 120Hz displays)
      const now = timestamp || performance.now();
      const elapsed = now - lastFrameTime;
      const targetInterval = 1000 / ROCKET_HUD_CONFIG.performance.maxFps;
      if (elapsed < targetInterval) return;

      lastFrameTime = now - (elapsed % targetInterval);

      const width = canvas.width;
      const height = canvas.height;
      const step = currentStepRef.current;
      time += 1;

      // 1. Interpolate visual states based on active step
      let targetOffsets = { topCap: 0, upperSleeve: 0, core: 0, base: 0 };
      let targetPitch = 0.38;
      let targetRoll = 0.0;
      let targetStarSpeed = ROCKET_HUD_CONFIG.sizes.starSpeedBase;
      let targetLaunchpadY = 0;
      let targetVesselCenterYOffset = 0;
      let shakeAmt = 0;

      if (step === 1) {
        // Exploded view - topCap gap is reduced to prevent huge gaps
        targetOffsets = {
          topCap: -220,
          upperSleeve: -145,
          core: 20,
          base: 190,
        };
      } else if (step === 2) {
        // Halfways assembled - topCap gap is reduced
        targetOffsets = { topCap: -70, upperSleeve: -45, core: 5, base: 70 };
      } else if (step === 3) {
        // Fully locked & Ignited (rumble starts!)
        targetOffsets = { topCap: 0, upperSleeve: 0, core: 0, base: 0 };
        shakeAmt = 1.8;
      } else if (step === 4) {
        // Launch warp speed (blastoff up the frame!)
        targetOffsets = { topCap: 0, upperSleeve: 0, core: 0, base: 0 };
        targetLaunchpadY = 500; // discard turntable launchpad down out of frame
        targetVesselCenterYOffset = 0; // Handled by takeoffY flying loop

        targetPitch = 0.25; // elegant upright 3D angle
        targetRoll = 0.0;

        if (step4StartTimeRef.current === null) {
          step4StartTimeRef.current = Date.now();
        }
        const elapsedStep5 = Date.now() - step4StartTimeRef.current;

        if (elapsedStep5 <= 1000) {
          // Phase 1: Go up a little (from 0 to -150)
          const t = elapsedStep5 / 1000;
          takeoffY = -150 * (t * (2 - t)); // easeOutQuad
          targetStarSpeed = 2.0;
          shakeAmt = 1.5;
        } else if (elapsedStep5 <= 3000) {
          // Phase 2: Hover/stay for 2.0 seconds (reduced by 1.5s)
          takeoffY = -150 + Math.sin(time * 0.5) * 1.5;
          targetStarSpeed = 2.5;
          shakeAmt = 2.0;
        } else if (elapsedStep5 <= 4000) {
          // Phase 3: Go outside the window from top (1.0 second blastoff)
          const warpT = (elapsedStep5 - 3000) / 1000;
          takeoffY = -150 - 1200 * (warpT * warpT); // accelerate straight up
          targetStarSpeed = ROCKET_HUD_CONFIG.sizes.starSpeedWarp;
          shakeAmt = 5.0;
        } else {
          // Phase 4: Rocket is gone
          takeoffY = -1500;
          targetStarSpeed = 0.2;
          shakeAmt = 0;

          // Trigger completion overlay after 4.0s
          if (!showLaunchOverlayRef.current) {
            showLaunchOverlayRef.current = true;
            setShowLaunchOverlay(true);
          }
        }
      } else {
        step4StartTimeRef.current = null;
        if (showLaunchOverlayRef.current) {
          showLaunchOverlayRef.current = false;
          setShowLaunchOverlay(false);
        }
      }

      // Smooth step variables transitions
      offsets.topCap += (targetOffsets.topCap - offsets.topCap) * 0.08;
      offsets.upperSleeve +=
        (targetOffsets.upperSleeve - offsets.upperSleeve) * 0.08;
      offsets.core += (targetOffsets.core - offsets.core) * 0.08;
      offsets.base += (targetOffsets.base - offsets.base) * 0.08;
      pitch += (targetPitch - pitch) * 0.04;
      roll += (targetRoll - roll) * 0.04;
      launchpadY += (targetLaunchpadY - launchpadY) * 0.06;
      vesselCenterYOffset +=
        (targetVesselCenterYOffset - vesselCenterYOffset) * 0.05;

      // Update takeoff vertical position when not in Step 4
      if (step !== 4) {
        takeoffY += (0 - takeoffY) * 0.1; // return smoothly to launchpad if step back
      }

      // Handle continuous rotation
      if (step === 4) {
        yaw += 0.015;
      } else {
        yaw += 0.005;
      }

      // Set camera shake displacement
      if (shakeAmt > 0) {
        cameraShake.x = (Math.random() - 0.5) * shakeAmt;
        cameraShake.y = (Math.random() - 0.5) * shakeAmt;
      } else {
        cameraShake.x = 0;
        cameraShake.y = 0;
      }

      // Precompute sines and cosines once per frame for high performance point projection
      const cx = Math.cos(pitch);
      const sx = Math.sin(pitch);
      const cy = Math.cos(yaw);
      const sy = Math.sin(yaw);
      const cz = Math.cos(roll);
      const sz = Math.sin(roll);

      // Math Optimized point rotation: avoids calling Math.sin / Math.cos inside point loop
      const rotatePointOpt = (p: Point3D) => {
        const x1 = p.x * cy + p.z * sy;
        const z1 = -p.x * sy + p.z * cy;
        const y2 = p.y * cx - z1 * sx;
        const z2 = p.y * sx + z1 * cx;
        const x3 = x1 * cz - y2 * sz;
        const y3 = x1 * sz + y2 * cz;
        return { x: x3, y: y3, z: z2 };
      };

      // Draw background
      ctx.fillStyle = ROCKET_HUD_CONFIG.colors.background;
      ctx.fillRect(0, 0, width, height);

      // Draw blueprint grid pattern
      ctx.strokeStyle = ROCKET_HUD_CONFIG.colors.gridLine;
      ctx.lineWidth = 1;
      const gridSize = ROCKET_HUD_CONFIG.sizes.gridSize;
      ctx.beginPath();
      for (let x = 0; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      const centerX = width / 2;
      // Shifted rocket slightly downwards for a cleaner layout
      const centerY = height / 2 + ROCKET_HUD_CONFIG.sizes.centerYOffset;

      // Projection for the rocket (shifting vertically with vesselCenterYOffset and takeoffY)
      const project = (p: Point3D) => {
        const scale = fov / (fov + p.z + cameraDistance);
        return {
          x: centerX + p.x * scale + cameraShake.x,
          y:
            centerY +
            (p.y + vesselCenterYOffset + takeoffY) * scale +
            cameraShake.y,
          scale: scale,
          z: p.z,
        };
      };

      // Projector for static hangar objects (launchpad, assembly layout arrows)
      const projectHangar = (p: Point3D) => {
        const scale = fov / (fov + p.z + cameraDistance);
        return {
          x: centerX + p.x * scale + cameraShake.x,
          y: centerY + p.y * scale + cameraShake.y, // ignores rocket fly-up offset
          scale: scale,
          z: p.z,
        };
      };

      // 2. Draw dense 3D stars (Warp speed streaking)
      stars.forEach((star) => {
        star.prevZ = star.z;
        star.z -= targetStarSpeed;

        if (star.z <= 0) {
          star.z = ROCKET_HUD_CONFIG.sizes.starMaxZ;
          star.prevZ = ROCKET_HUD_CONFIG.sizes.starMaxZ;
          star.x = (Math.random() - 0.5) * 1500;
          star.y = (Math.random() - 0.5) * 1500;
        }

        const pCurrent = projectHangar(star);
        const pPrev = projectHangar({ x: star.x, y: star.y, z: star.prevZ });

        ctx.beginPath();
        ctx.moveTo(pPrev.x, pPrev.y);
        ctx.lineTo(pCurrent.x, pCurrent.y);
        const opacity =
          Math.min(
            1,
            (ROCKET_HUD_CONFIG.sizes.starMaxZ - star.z) /
            (ROCKET_HUD_CONFIG.sizes.starMaxZ / 2),
          ) *
          (step === 4
            ? ROCKET_HUD_CONFIG.colors.starWarpOpacity
            : ROCKET_HUD_CONFIG.colors.starNormalOpacity) *
          star.brightness;
        ctx.strokeStyle = `rgba(${ROCKET_HUD_CONFIG.colors.starRgb}, ${opacity})`;
        ctx.lineWidth = step === 4 ? 1.4 : 0.7;
        ctx.stroke();
      });

      // 3. Draw 3D holographic launchpad turntable (Much whiter/brighter)
      const drawTurntableRing = (
        yPos: number,
        radius: number,
        opacity: number,
      ) => {
        const segs = 32;
        ctx.beginPath();
        for (let i = 0; i <= segs; i++) {
          const t = (i / segs) * Math.PI * 2;
          const pt = rotatePointOpt({
            x: Math.cos(t) * radius,
            y: yPos,
            z: Math.sin(t) * radius,
          });
          const proj = projectHangar(pt);
          if (i === 0) ctx.moveTo(proj.x, proj.y);
          else ctx.lineTo(proj.x, proj.y);
        }
        ctx.strokeStyle = `rgba(${ROCKET_HUD_CONFIG.colors.launchpadRgb}, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      };

      if (launchpadY < 450) {
        const padBaseY = lockedY.base + offsets.base + 47 + launchpadY;
        // Whiter base stand opacity (increased to 0.35 max)
        const padOpacity =
          Math.max(0, 1 - launchpadY / 450) *
          ROCKET_HUD_CONFIG.colors.padMaxOpacity;

        // Concentric deck rings (widened to match enlarged base)
        drawTurntableRing(
          padBaseY,
          ROCKET_HUD_CONFIG.sizes.padRadii.inner,
          padOpacity,
        );
        drawTurntableRing(
          padBaseY,
          ROCKET_HUD_CONFIG.sizes.padRadii.middle,
          padOpacity,
        );
        drawTurntableRing(
          padBaseY,
          ROCKET_HUD_CONFIG.sizes.padRadii.outer,
          padOpacity,
        );

        // Draw radial deck ticks (very clear white)
        const radialTics = 12;
        ctx.beginPath();
        for (let i = 0; i < radialTics; i++) {
          const t = (i / radialTics) * Math.PI * 2;
          const innerPt = rotatePointOpt({
            x: Math.cos(t) * ROCKET_HUD_CONFIG.sizes.padRadii.inner,
            y: padBaseY,
            z: Math.sin(t) * ROCKET_HUD_CONFIG.sizes.padRadii.inner,
          });
          const outerPt = rotatePointOpt({
            x: Math.cos(t) * ROCKET_HUD_CONFIG.sizes.padRadii.outer,
            y: padBaseY,
            z: Math.sin(t) * ROCKET_HUD_CONFIG.sizes.padRadii.outer,
          });
          const pInner = projectHangar(innerPt);
          const pOuter = projectHangar(outerPt);
          ctx.moveTo(pInner.x, pInner.y);
          ctx.lineTo(pOuter.x, pOuter.y);
        }
        ctx.strokeStyle = `rgba(${ROCKET_HUD_CONFIG.colors.launchpadRgb}, ${padOpacity * 0.95})`;
        ctx.stroke();
      }

      // Helper function to draw 3D components with back-face line depth fading (Enhanced contrast/whiter)
      const drawComponent3D = (
        geom: ComponentGeometry,
        yOffset: number,
        isAssembled: boolean,
      ) => {
        const projectedVerts = geom.vertices.map((v) => {
          const localPt = { x: v.x, y: v.y + yOffset, z: v.z };
          const rotated = rotatePointOpt(localPt);
          return {
            proj: project(rotated),
            rotatedZ: rotated.z,
          };
        });

        geom.edges.forEach((edge) => {
          if (edge.type === "pilot" && step < 2) return;
          if (edge.type === "core" && step === 1 && !isAssembled) {
            // Keep rods showing exploded
          }

          const v1 = projectedVerts[edge.v1];
          const v2 = projectedVerts[edge.v2];

          const avgZ = (v1.rotatedZ + v2.rotatedZ) / 2;

          ctx.beginPath();
          ctx.moveTo(v1.proj.x, v1.proj.y);
          ctx.lineTo(v2.proj.x, v2.proj.y);

          // Configure sketch strokes (increased structural opacities for brighter lines)
          if (edge.type === "pilot") {
            ctx.strokeStyle =
              avgZ > 0
                ? ROCKET_HUD_CONFIG.colors.pilotBack
                : ROCKET_HUD_CONFIG.colors.pilotFront;
            ctx.lineWidth = ROCKET_HUD_CONFIG.sizes.rocketLineThickness.pilot;
          } else if (edge.type === "latch") {
            ctx.strokeStyle =
              avgZ > 0
                ? ROCKET_HUD_CONFIG.colors.latchBack
                : ROCKET_HUD_CONFIG.colors.latchFront;
            ctx.lineWidth = ROCKET_HUD_CONFIG.sizes.rocketLineThickness.latch;
          } else if (edge.type === "cone") {
            ctx.strokeStyle =
              avgZ > 0
                ? ROCKET_HUD_CONFIG.colors.coneBack
                : ROCKET_HUD_CONFIG.colors.coneFront;
            ctx.lineWidth = ROCKET_HUD_CONFIG.sizes.rocketLineThickness.cone;
          } else {
            // Standard structures (Whiter & clearer lines)
            ctx.strokeStyle =
              avgZ > 0
                ? ROCKET_HUD_CONFIG.colors.structureBack
                : ROCKET_HUD_CONFIG.colors.structureFront;
            ctx.lineWidth =
              ROCKET_HUD_CONFIG.sizes.rocketLineThickness.structure;
          }

          ctx.stroke();
        });
      };

      // 4. Render the 4 rocket components with their respectiveOffsets
      drawComponent3D(topCap, lockedY.topCap + offsets.topCap, step >= 3);
      drawComponent3D(
        upperSleeve,
        lockedY.upperSleeve + offsets.upperSleeve,
        step >= 3,
      );
      drawComponent3D(core, lockedY.core + offsets.core, step >= 3);
      drawComponent3D(base, lockedY.base + offsets.base, step >= 3);

      // 5. Draw Exploded-view layout arrows (Step 1 Blueprint exact recreation)
      if (step === 1 && Math.abs(offsets.base - 190) < 15) {
        ctx.strokeStyle = ROCKET_HUD_CONFIG.colors.directionArrowLine;
        ctx.lineWidth = 1;

        // Radial white arrow - Left (expanded for larger size)
        const arrowLeftStart = projectHangar(
          rotatePointOpt({ x: -45, y: lockedY.core + offsets.core, z: 0 }),
        );
        const arrowLeftEnd = projectHangar(
          rotatePointOpt({ x: -105, y: lockedY.core + offsets.core, z: 0 }),
        );

        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(arrowLeftStart.x, arrowLeftStart.y);
        ctx.lineTo(arrowLeftEnd.x, arrowLeftEnd.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Arrow head Left
        ctx.beginPath();
        ctx.moveTo(arrowLeftEnd.x, arrowLeftEnd.y);
        ctx.lineTo(arrowLeftEnd.x + 6, arrowLeftEnd.y - 4);
        ctx.lineTo(arrowLeftEnd.x + 6, arrowLeftEnd.y + 4);
        ctx.closePath();
        ctx.fillStyle = ROCKET_HUD_CONFIG.colors.directionArrowFill;
        ctx.fill();

        // Radial white arrow - Right
        const arrowRightStart = projectHangar(
          rotatePointOpt({ x: 45, y: lockedY.core + offsets.core, z: 0 }),
        );
        const arrowRightEnd = projectHangar(
          rotatePointOpt({ x: 105, y: lockedY.core + offsets.core, z: 0 }),
        );

        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(arrowRightStart.x, arrowRightStart.y);
        ctx.lineTo(arrowRightEnd.x, arrowRightEnd.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Arrow head Right
        ctx.beginPath();
        ctx.moveTo(arrowRightEnd.x, arrowRightEnd.y);
        ctx.lineTo(arrowRightEnd.x - 6, arrowRightEnd.y - 4);
        ctx.lineTo(arrowRightEnd.x - 6, arrowRightEnd.y + 4);
        ctx.closePath();
        ctx.fill();

        // Central Red Downward Arrow 1 (between topCap and upperSleeve)
        const red1Start = projectHangar(
          rotatePointOpt({
            x: 0,
            y: lockedY.upperSleeve + offsets.upperSleeve - 110,
            z: 0,
          }),
        );
        const red1End = projectHangar(
          rotatePointOpt({
            x: 0,
            y: lockedY.upperSleeve + offsets.upperSleeve - 60,
            z: 0,
          }),
        );

        ctx.strokeStyle = ROCKET_HUD_CONFIG.colors.redDownwardArrowLine;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(red1Start.x, red1Start.y);
        ctx.lineTo(red1End.x, red1End.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(red1End.x, red1End.y);
        ctx.lineTo(red1End.x - 4, red1End.y - 6);
        ctx.lineTo(red1End.x + 4, red1End.y - 6);
        ctx.closePath();
        ctx.fillStyle = ROCKET_HUD_CONFIG.colors.redDownwardArrowFill;
        ctx.fill();

        // Central Red Downward Arrow 2 (between upperSleeve and core)
        const red2Start = projectHangar(
          rotatePointOpt({ x: 0, y: lockedY.core + offsets.core - 180, z: 0 }),
        );
        const red2End = projectHangar(
          rotatePointOpt({ x: 0, y: lockedY.core + offsets.core - 100, z: 0 }),
        );

        ctx.beginPath();
        ctx.moveTo(red2Start.x, red2Start.y);
        ctx.lineTo(red2End.x, red2End.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(red2End.x, red2End.y);
        ctx.lineTo(red2End.x - 4, red2End.y - 6);
        ctx.lineTo(red2End.x + 4, red2End.y - 6);
        ctx.closePath();
        ctx.fill();

        // Central Red Downward Arrow 3 (between core and base - relative to base position)
        const redStart = projectHangar(
          rotatePointOpt({ x: 0, y: lockedY.base + offsets.base - 80, z: 0 }),
        );
        const redEnd = projectHangar(
          rotatePointOpt({ x: 0, y: lockedY.base + offsets.base - 20, z: 0 }),
        );

        ctx.beginPath();
        ctx.moveTo(redStart.x, redStart.y);
        ctx.lineTo(redEnd.x, redEnd.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(redEnd.x, redEnd.y);
        ctx.lineTo(redEnd.x - 4, redEnd.y - 6);
        ctx.lineTo(redEnd.x + 4, redEnd.y - 6);
        ctx.closePath();
        ctx.fill();
      }

      // 6. Draw 3D Projected Vessel Name (Step 3)
      if (step >= 3) {
        const anchor = { x: 0, y: 0, z: -87 };
        const rotAnchor = rotatePointOpt({
          x: anchor.x,
          y: anchor.y + lockedY.upperSleeve + offsets.upperSleeve,
          z: anchor.z,
        });

        if (rotAnchor.z < 0) {
          const projAnchor = project(rotAnchor);

          const tangentPt = { x: 20, y: 0, z: -87 };
          const rotTangent = rotatePointOpt({
            x: tangentPt.x,
            y: tangentPt.y + lockedY.upperSleeve + offsets.upperSleeve,
            z: tangentPt.z,
          });
          const projTangent = project(rotTangent);

          const dx = projTangent.x - projAnchor.x;
          const dy = projTangent.y - projAnchor.y;
          const textAngle = Math.atan2(dy, dx);

          ctx.save();
          ctx.translate(projAnchor.x, projAnchor.y);
          ctx.rotate(textAngle);

          const labelName = projectNameRef.current || "WEKRAFT-01";
          ctx.font = `${ROCKET_HUD_CONFIG.fonts.nameFontWeight} ${Math.round(ROCKET_HUD_CONFIG.fonts.nameFontSize * projAnchor.scale)}px ${ROCKET_HUD_CONFIG.fonts.nameFontFamily}`;
          ctx.fillStyle = ROCKET_HUD_CONFIG.colors.vesselNameText;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(labelName.toUpperCase(), 0, 0);

          ctx.restore();
        }
      }

      // 7. Draw ignition thruster energy rings (Step 3)
      if (step >= 3) {
        const ringBaseY = lockedY.base + offsets.base + 47;
        const ringSpacing = 16;
        const count = 3;

        for (let i = 0; i < count; i++) {
          const ringRad =
            ((time * 0.8 + i * ringSpacing) % (ringSpacing * count)) + 10;
          const ringOpacity =
            Math.max(0, 1 - ringRad / (ringSpacing * count)) * 0.35;
          const drawHolographicRingLocal = (
            yPos: number,
            radius: number,
            opacity: number,
          ) => {
            const segs = 32;
            ctx.beginPath();
            for (let j = 0; j <= segs; j++) {
              const t = (j / segs) * Math.PI * 2;
              const pt = rotatePointOpt({
                x: Math.cos(t) * radius,
                y: yPos,
                z: Math.sin(t) * radius,
              });
              const proj = project(pt);
              if (j === 0) ctx.moveTo(proj.x, proj.y);
              else ctx.lineTo(proj.x, proj.y);
            }
            ctx.strokeStyle = `rgba(${ROCKET_HUD_CONFIG.colors.igniterRingRgb}, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          };
          drawHolographicRingLocal(ringBaseY, ringRad, ringOpacity);
        }
      }

      // 8. Physics-based exhaust flame lines (Step 3 onwards - Heavy ignition density)
      if (step >= 3) {
        const nozzleBaseY = lockedY.base + offsets.base + 45;

        // Spawn flame particles
        const flameSpawns = step === 4 ? 4 : 3;
        for (let k = 0; k < flameSpawns; k++) {
          const theta = Math.random() * Math.PI * 2;
          const r = Math.random() * 32;
          flameParticles.push({
            x: Math.cos(theta) * r,
            y: nozzleBaseY,
            z: Math.sin(theta) * r,
            vy: 7.0 + Math.random() * 9.0,
            length: 15 + Math.random() * 25,
            life: 1.0,
          });
        }

        // Update and draw flames
        flameParticles.forEach((f, idx) => {
          f.y += f.vy;
          f.life -= 0.09;

          if (f.life <= 0) {
            flameParticles.splice(idx, 1);
            return;
          }

          const rotStart = rotatePointOpt(f);
          const rotEnd = rotatePointOpt({ x: f.x, y: f.y + f.length, z: f.z });

          const projStart = project(rotStart);
          const projEnd = project(rotEnd);

          ctx.beginPath();
          ctx.moveTo(projStart.x, projStart.y);
          ctx.lineTo(projEnd.x, projEnd.y);
          ctx.strokeStyle = `rgba(${ROCKET_HUD_CONFIG.colors.flameRgb}, ${f.life * 0.65})`;
          ctx.lineWidth = ROCKET_HUD_CONFIG.sizes.rocketLineThickness.flame;
          ctx.stroke();
        });
      }

      // 9. Volumetric Smoke/Steam (Spreads OUTSIDE the rocket and flows DOWNWARDS + LEFT/RIGHT - Ribbon CAD Wind lines & soft shadows)
      if (step >= 3) {
        const nozzleBaseY = lockedY.base + offsets.base + 45;
        const shipProjBase = project({ x: 0, y: nozzleBaseY, z: 0 });

        // A. Draw soft radial shadow/fog core under nozzle first (extremely light weight shadows)
        const grad = ctx.createRadialGradient(
          shipProjBase.x,
          shipProjBase.y + 15,
          5 * shipProjBase.scale,
          shipProjBase.x,
          shipProjBase.y + 35,
          120 * shipProjBase.scale,
        );
        grad.addColorStop(0, ROCKET_HUD_CONFIG.colors.smokeRadialFogStart);
        grad.addColorStop(
          0.3,
          `rgba(${ROCKET_HUD_CONFIG.colors.smokeRgb}, 0.02)`,
        );
        grad.addColorStop(1, ROCKET_HUD_CONFIG.colors.smokeRadialFogEnd);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(
          shipProjBase.x,
          shipProjBase.y + 35,
          220 * shipProjBase.scale,
          75 * shipProjBase.scale,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();

        // B. Spawn sweeping flow line streamers (comes from bottom and spreads left/right)
        if (time % 2 === 0 && smokeParticles.length < 50) {
          const side = Math.random() < 0.5 ? -1 : 1;
          const startPt = {
            x: (Math.random() - 0.5) * 20,
            y: nozzleBaseY + 12, // start outside bottom
            z: (Math.random() - 0.5) * 20,
          };
          smokeParticles.push({
            path: [startPt],
            // Shoot down and outwards
            vx: side * (1.5 + Math.random() * 3.0),
            vy: 1.2 + Math.random() * 2.5,
            vz: (Math.random() - 0.5) * 2.0,
            life: 1.0,
            opacity: 0.12 + Math.random() * 0.12,
            side: side,
            width: 0.8 + Math.random() * 1.0,
          });
        }

        // C. Update and draw the sweeping fluid wind lines
        smokeParticles.forEach((p, idx) => {
          const lastPt = p.path[p.path.length - 1];

          // Physics: curve outwards horizontally and drift downwards
          const nextX = lastPt.x + p.vx;
          const nextY = lastPt.y + p.vy;
          const nextZ = lastPt.z + p.vz;

          p.vx += p.side * 0.14; // curve outwards
          p.vy += 0.08; // fall downwards

          p.vx *= 0.96;
          p.vy *= 0.96;
          p.vz *= 0.96;

          p.path.push({ x: nextX, y: nextY, z: nextZ });
          if (p.path.length > 12) {
            p.path.shift(); // keep length finite
          }

          p.life -= 0.012; // decay life

          if (p.life <= 0) {
            smokeParticles.splice(idx, 1);
            return;
          }

          // Draw the stream lines using a drafting CAD line-dash pattern
          ctx.beginPath();
          p.path.forEach((pt, pIdx) => {
            const rot = rotatePointOpt(pt);
            const proj = project(rot);
            if (pIdx === 0) ctx.moveTo(proj.x, proj.y);
            else ctx.lineTo(proj.x, proj.y);
          });

          ctx.strokeStyle = `rgba(${ROCKET_HUD_CONFIG.colors.smokeRgb}, ${p.life * p.opacity})`;
          ctx.lineWidth =
            p.width * ROCKET_HUD_CONFIG.sizes.rocketLineThickness.smoke;
          ctx.setLineDash([6, 3, 2, 3]); // CAD wind lines dash pattern
          ctx.stroke();
          ctx.setLineDash([]);
        });
      }

      // 10. Warp aerodynamic air-splashes (Step 4 warp speed)
      if (step === 4) {
        if (time % 8 === 0 && splashRings.length < 5) {
          splashRings.push({
            y: lockedY.topCap - 80,
            radius: 12,
            opacity: 0.9,
          });
        }

        splashRings.forEach((ring, idx) => {
          ring.y += 7.0;
          ring.radius += 6.5;
          ring.opacity = Math.max(
            0,
            1 - (ring.y - (lockedY.topCap - 80)) / 260,
          );

          if (ring.opacity <= 0) {
            splashRings.splice(idx, 1);
            return;
          }

          const segments = 24;
          ctx.beginPath();
          ctx.setLineDash([3, 3]);

          for (let i = 0; i <= segments; i++) {
            const t = (i / segments) * Math.PI * 2;
            const pt = rotatePointOpt({
              x: Math.cos(t) * ring.radius,
              y: ring.y,
              z: Math.sin(t) * ring.radius,
            });
            const proj = project(pt);
            if (i === 0) ctx.moveTo(proj.x, proj.y);
            else ctx.lineTo(proj.x, proj.y);
          }

          ctx.strokeStyle = `rgba(${ROCKET_HUD_CONFIG.colors.warpSplashRgb}, ${ring.opacity * 0.3})`;
          ctx.lineWidth =
            ROCKET_HUD_CONFIG.sizes.rocketLineThickness.warpSplash;
          ctx.stroke();
          ctx.setLineDash([]);
        });
      }

      // Calculate cockpit screen coordinates and position/update the HTML overlay and leader line arrow
      const cockpitLocalPt = {
        x: 0,
        y: lockedY.upperSleeve + offsets.upperSleeve,
        z: 0,
      };
      const cockpitRotated = rotatePointOpt(cockpitLocalPt);
      const cockpitProjected = project(cockpitRotated);

      if (
        step === 2 &&
        overlayRef.current &&
        arrowSvgRef.current &&
        arrowPathRef.current &&
        arrowDotRef.current
      ) {
        overlayRef.current.style.display = "flex";
        arrowSvgRef.current.style.display = "block";

        // Position the card to the right of the cockpit
        const cardX = cockpitProjected.x + 140;
        const cardY = cockpitProjected.y - 45;

        overlayRef.current.style.left = `${cardX}px`;
        overlayRef.current.style.top = `${cardY}px`;

        // Leader line: from cockpit to intermediate bend, then horizontal to card left edge
        const x1 = cockpitProjected.x;
        const y1 = cockpitProjected.y;
        const x2 = cardX - 5;
        const y2 = cardY + 32; // middle of card height

        const pathData = `M ${x1} ${y1} L ${x1 + 35} ${y2} L ${x2} ${y2}`;
        arrowPathRef.current.setAttribute("d", pathData);

        // Position dot on the cockpit
        arrowDotRef.current.setAttribute("cx", `${x1}`);
        arrowDotRef.current.setAttribute("cy", `${y1}`);
      } else {
        if (overlayRef.current) overlayRef.current.style.display = "none";
        if (arrowSvgRef.current) arrowSvgRef.current.style.display = "none";
      }

      // Calculate spaceship tip coordinates
      const tipLocalPt = {
        x: 0,
        y: lockedY.topCap + offsets.topCap - 80,
        z: 0,
      };
      const tipRotated = rotatePointOpt(tipLocalPt);
      const tipProjected = project(tipRotated);

      if (
        step === 3 &&
        nameOverlayRef.current &&
        nameArrowSvgRef.current &&
        nameArrowPathRef.current &&
        nameArrowDotRef.current
      ) {
        nameOverlayRef.current.style.display = "flex";
        nameArrowSvgRef.current.style.display = "block";

        // Position the card to the left of the tip
        const cardWidth = 220;
        const cardX = tipProjected.x - 140 - cardWidth;
        const cardY = tipProjected.y - 35;

        nameOverlayRef.current.style.left = `${cardX}px`;
        nameOverlayRef.current.style.top = `${cardY}px`;

        // Leader line: from tip to intermediate bend, then horizontal to card right edge
        const x1 = tipProjected.x;
        const y1 = tipProjected.y;
        const x2 = cardX + cardWidth + 5;
        const y2 = cardY + 25; // middle of card height

        const pathData = `M ${x1} ${y1} L ${x1 - 35} ${y2} L ${x2} ${y2}`;
        nameArrowPathRef.current.setAttribute("d", pathData);

        // Position dot on the tip
        nameArrowDotRef.current.setAttribute("cx", `${x1}`);
        nameArrowDotRef.current.setAttribute("cy", `${y1}`);
      } else {
        if (nameOverlayRef.current)
          nameOverlayRef.current.style.display = "none";
        if (nameArrowSvgRef.current)
          nameArrowSvgRef.current.style.display = "none";
      }
    };

    animFrame = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
      if (ROCKET_HUD_CONFIG.performance.pauseWhenHidden) {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "hidden lg:flex lg:w-[60%] relative overflow-hidden select-none h-screen transition-all duration-500",
        "bg-black! border-l border-zinc-900",
      )}
    >
      {/* 3D Blueprint Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* SVG Leader Line Arrow for Step 2 cockpit */}
      <svg
        ref={arrowSvgRef}
        style={{ display: "none" }}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      >
        <path
          ref={arrowPathRef}
          fill="none"
          stroke="rgba(255, 255, 255, 0.45)"
          strokeWidth="1.2"
          strokeDasharray="3 3"
        />
        <circle ref={arrowDotRef} r="3" fill="rgba(255, 255, 255, 0.85)" />
      </svg>

      {/* Cockpit HUD Overlay (Step 2 Only) */}
      <div
        ref={overlayRef}
        style={{ display: "none" }}
        className="absolute z-20 bg-neutral-900/80 border border-zinc-800 rounded-md py-3 px-6 flex flex-col gap-2.5 max-w-[300px] shadow-2xl font-sans text-xs tracking-tight text-zinc-300 pointer-events-none transition-opacity duration-300"
      >
        <div className="text-sm text-primary/80 flex items-center gap-1.5 font-sans!">
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-pulse shrink-0" />
          Name of Pilot
        </div>
        <div className="flex items-center gap-3">
          <div className="relative shrink-0 w-9 h-9 rounded-lg border border-zinc-800 bg-zinc-800! overflow-hidden flex items-center justify-center">
            {clerkUser?.imageUrl ? (
              <img
                src={clerkUser.imageUrl}
                className="w-full h-full object-cover"
                alt=""
              />
            ) : (
              <User className="w-4 h-4 text-zinc-500" />
            )}
          </div>

          <div className="min-w-0">
            <div className="text-xs text-zinc-100 truncate max-w-[130px] capitalize">
              Name:{" "}
              {username ||
                clerkUser?.fullName ||
                ROCKET_HUD_CONFIG.hudLabels.crewCardDefaultName}
            </div>
            <div className="text-zinc-450 mt-2 text-[10px]  truncate">
              Role:{" "}
              {selectedRole || ROCKET_HUD_CONFIG.hudLabels.crewCardDefaultRole}
            </div>
          </div>
        </div>
      </div>

      {/* SVG Leader Line Arrow for Step 3 designation */}
      <svg
        ref={nameArrowSvgRef}
        style={{ display: "none" }}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      >
        <path
          ref={nameArrowPathRef}
          fill="none"
          stroke="rgba(255, 255, 255, 0.45)"
          strokeWidth="1.2"
          strokeDasharray="3 3"
        />
        <circle ref={nameArrowDotRef} r="3" fill="rgba(255, 255, 255, 0.85)" />
      </svg>

      {/* Spaceship Name HUD Overlay (Step 3 Only) */}
      <div
        ref={nameOverlayRef}
        style={{ display: "none" }}
        className="absolute z-20 bg-neutral-900/80 border border-zinc-800 rounded-md py-3 px-6 flex flex-col gap-1.5 min-w-[200px] max-w-[300px] shadow-2xl font-sans text-xs tracking-tight text-zinc-300 pointer-events-none transition-opacity duration-300"
      >
        <div className="text-sm text-primary/80 flex items-center gap-1.5 font-sans!">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
          Project Name
        </div>
        <div className="text-xs text-zinc-100 truncate max-w-[200px] capitalize">
          Name: {projectName || "WEKRAFT-01"}
        </div>
        <div className="text-zinc-450 mt-1 text-[10px]">
          Name the spaceship to launch
        </div>
      </div>

      {/* 1. Technical Corner Brackets */}
      {/* To customize size/color of corner brackets, adjust borders & spacing classes below */}
      <div
        className={cn(
          "transition-opacity duration-700",
          showLaunchOverlay && "opacity-0 pointer-events-none",
        )}
      >
        <div className="absolute top-6 left-6 w-8 h-8 border-t border-l border-zinc-600 pointer-events-none" />
        <div className="absolute top-6 right-6 w-8 h-8 border-t border-r border-zinc-600 pointer-events-none" />
        <div className="absolute bottom-6 left-6 w-8 h-8 border-b border-l border-zinc-600 pointer-events-none" />
        <div className="absolute bottom-6 right-6 w-8 h-8 border-b border-r border-zinc-600 pointer-events-none" />
      </div>

      {/* 2. Top-Left System Status Header */}
      {/* To customize top-left header text size (e.g. text-[9px]) or color (e.g. text-zinc-400), tweak classes here */}
      <div
        className={cn(
          "absolute top-8 left-8 flex flex-col font-mono text-xs text-zinc-300 gap-1 tracking-wider uppercase select-none pointer-events-none transition-opacity duration-700",
          showLaunchOverlay && "opacity-0",
        )}
      >
        <div className="flex items-center gap-1.5 text-zinc-300 font-normal">
          <Activity className="w-3.5 h-3.5 shrink-0 text-zinc-300" />
          <span>Wekraft // Product Delivery Workspace</span>
        </div>
        <div className="text-[10px] text-zinc-300  ml-5 mt-0.5">
          Launch At the speed of Light
        </div>
      </div>

      {/* 3. Top-Right Pilot Synced Card (Visible Step >= 3) */}
      {/* To customize pilot crew card background, padding (p-3.5) or borders, modify Tailwind classes here */}
      {currentStep >= 3 && (
        <div
          className={cn(
            "absolute top-8 right-8 bg-neutral-900/60 border border-zinc-800 rounded-md p-3 flex items-center gap-3.5 max-w-[240px] shadow-2xl text-[9.5px] tracking-wide text-zinc-300 transition-opacity duration-700",
            showLaunchOverlay && "opacity-0 pointer-events-none",
          )}
        >
          <div className="relative shrink-0 w-9 h-9 rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden flex items-center justify-center">
            {clerkUser?.imageUrl ? (
              <img
                src={clerkUser.imageUrl}
                className="w-full h-full object-cover "
                alt=""
              />
            ) : (
              <User className="w-4 h-4 text-zinc-500" />
            )}
          </div>

          <div className="min-w-0">
            <div className="text-zinc-400 text-xs">Personal Details</div>
            <div className="font-bold text-zinc-100 truncate mt-0.5 max-w-[130px] capitalize">
              Name:{" "}
              {username ||
                clerkUser?.fullName ||
                ROCKET_HUD_CONFIG.hudLabels.crewCardDefaultName}
            </div>
            <div className="text-zinc-400 text-[10px] mt-0.5 truncate ">
              Role:{" "}
              {selectedRole || ROCKET_HUD_CONFIG.hudLabels.crewCardDefaultRole}
            </div>
          </div>
        </div>
      )}

      {/* 4. Minimal Bottom Onboarding Status & Progress Bar */}
      <div
        className={cn(
          "absolute bottom-8 left-8 right-8 flex flex-col gap-3 font-sans select-none pointer-events-none transition-opacity duration-700",
          showLaunchOverlay && "opacity-0 pointer-events-none",
        )}
      >
        <div className="flex justify-between items-center text-xs text-zinc-400 font-medium">
          <span className="uppercase">SYSTEM STATUS</span>
          <span className="text-zinc-400 flex items-center gap-1">
            {currentStep === 4 ? (
              <span className="text-emerald-500 font-mono">
                <Typewriter
                  words={["your workspace is ready . launching the system...."]}
                  loop={1}
                  cursor
                  cursorStyle="_"
                  typeSpeed={55}
                />
              </span>
            ) : (
              <>
                <span>Complete Onboarding to launch spaceship ||</span>
                <span className="text-blue-500">
                  <Typewriter
                    key={currentStep}
                    words={[
                      currentStep === 1 ? " awaiting purpose selection..." : "",
                      currentStep === 2
                        ? " awaiting pilot authorization..."
                        : "",
                      currentStep === 3
                        ? " awaiting spaceship designation registry..."
                        : "",
                    ].filter(Boolean)}
                    loop={1}
                    cursor
                    cursorStyle="_"
                    typeSpeed={60}
                    delaySpeed={1000}
                  />
                </span>
              </>
            )}
          </span>
          <span className="font-mono">ONBOARDING STEP {currentStep} OF 4</span>
        </div>
        <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-800">
          <div
            className={cn(
              "h-full bg-blue-600 transition-all duration-700 rounded-full",
              currentStep === 1 && "w-[25%]",
              currentStep === 2 && "w-[50%]",
              currentStep === 3 && "w-[75%]",
              currentStep === 4 && "w-full bg-emerald-500 ",
            )}
          />
        </div>
      </div>

      {/* 5. Onboarding Completed Overlay (Step 5 Phase 4) */}
      {showLaunchOverlay && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-30 transition-all duration-700 select-auto">
          <div className="max-w-md w-full px-8 text-center space-y-6 animate-in fade-in zoom-in duration-500">
            <PackageCheck className="size-16 mx-auto" />

            <div className="space-y-2">
              <h3 className="text-2xl font-semibold tracking-tight text-white font-sans">
                Onboarding completed
              </h3>
              <p className="text-zinc-400 text-sm font-sans">
                launching the workspace
              </p>
            </div>

            <Button
              onClick={onLaunch}
              disabled={isLaunching}
              className={cn(
                "px-5! text-sm",
              )}
            >
              {isLaunching ? (
                <>
                  Launching{" "}
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                </>
              ) : (
                <>
                  Launch now
                  <Rocket className="w-4.5 h-4.5 text-black stroke-[2.5px]" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
