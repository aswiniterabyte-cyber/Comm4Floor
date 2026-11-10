/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SceneManager } from './3d/SceneManager';
import { Header } from './components/Header';
import { BottomControlDock } from './components/BottomControlDock';
import { ValidationModal } from './components/ValidationModal';
import { PlanViewerModal } from './components/PlanViewerModal';
import { RenderGalleryModal } from './components/RenderGalleryModal';
import { ExportModal } from './components/ExportModal';
import { RoomDetailCard } from './components/RoomDetailCard';
import { CameraPreset, FloorVisibility, LayerVisibility, RoomData } from './types/architecture';
import { Compass, CheckCircle2 } from 'lucide-react';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);

  // Visibility states
  const [floorVisibility, setFloorVisibility] = useState<FloorVisibility>({
    site: true,
    ground: true,
    first: true,
    second: true,
    third: true,
    roof: true,
  });

  const [layerVisibility, setLayerVisibility] = useState<LayerVisibility>({
    walls: true,
    columns: true,
    slabs: true,
    windows: true,
    furniture: true,
    vehicles: true,
    stairs: true,
    lift: true,
    roofEquipment: true,
    wireframe: false,
    blueprintOverlay: false,
    columnGrid: false,
  });

  const [explodedFactor, setExplodedFactor] = useState(0);
  const [isOrthographic, setIsOrthographic] = useState(false);
  const [isTransparentMode, setIsTransparentMode] = useState(false);

  // Active room inspection
  const [hoveredRoom, setHoveredRoom] = useState<RoomData | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(null);

  // Modals
  const [isValidationOpen, setIsValidationOpen] = useState(false);
  const [isPlansOpen, setIsPlansOpen] = useState(false);
  const [isRendersOpen, setIsRendersOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [snapshotToast, setSnapshotToast] = useState<string | null>(null);

  // Initialize Three.js scene once on mount
  useEffect(() => {
    if (!mountRef.current) return;

    const manager = new SceneManager(mountRef.current);
    sceneManagerRef.current = manager;

    manager.onRoomHoverCallback = (room) => {
      setHoveredRoom(room);
    };

    manager.onRoomSelectCallback = (room) => {
      setSelectedRoom(room);
    };

    return () => {
      manager.dispose();
      sceneManagerRef.current = null;
    };
  }, []);

  // Floor visibility handler
  const handleToggleFloor = useCallback((floor: keyof FloorVisibility) => {
    setFloorVisibility((prev) => {
      const updated = { ...prev, [floor]: !prev[floor] };
      sceneManagerRef.current?.setFloorVisibility(updated);
      return updated;
    });
  }, []);

  // Layer visibility handler
  const handleToggleLayer = useCallback((layer: keyof LayerVisibility) => {
    setLayerVisibility((prev) => {
      const updated = { ...prev, [layer]: !prev[layer] };
      sceneManagerRef.current?.setLayerVisibility(updated);
      return updated;
    });
  }, []);

  // Transparent / Glass BIM Mode handler
  const handleToggleTransparent = useCallback(() => {
    setIsTransparentMode((prev) => {
      const next = !prev;
      sceneManagerRef.current?.setTransparentMode(next);
      return next;
    });
  }, []);

  // Exploded slider handler
  const handleChangeExploded = useCallback((factor: number) => {
    setExplodedFactor(factor);
    sceneManagerRef.current?.setExplodedSlider(factor);
  }, []);

  // Camera preset handler
  const handleSelectCameraPreset = useCallback((preset: CameraPreset) => {
    sceneManagerRef.current?.setCameraPreset(preset);
  }, []);

  // Projection toggle handler
  const handleToggleOrthographic = useCallback(() => {
    setIsOrthographic((prev) => {
      const next = !prev;
      sceneManagerRef.current?.setOrthographicMode(next);
      return next;
    });
  }, []);

  // Capture high-res snapshot
  const handleCaptureSnapshot = useCallback(() => {
    if (!sceneManagerRef.current) return;
    const dataUrl = sceneManagerRef.current.captureScreenshot();
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `Commercial_Building_Render_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSnapshotToast('Photorealistic rendering saved to downloads!');
    setTimeout(() => setSnapshotToast(null), 3500);
  }, []);

  // Export GLB
  const handleExportGLB = useCallback(async () => {
    if (!sceneManagerRef.current) return;
    const blob = await sceneManagerRef.current.exportGLB();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Commercial_Building_3D_BIM_Model.glb';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  // Export OBJ
  const handleExportOBJ = useCallback(() => {
    if (!sceneManagerRef.current) return;
    const objText = sceneManagerRef.current.exportOBJ();
    const blob = new Blob([objText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Commercial_Building_3D_Geometry.obj';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden select-none font-sans">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />

      {/* BIM HUD Header */}
      <Header
        onOpenValidation={() => setIsValidationOpen(true)}
        onOpenPlans={() => setIsPlansOpen(true)}
        onOpenRenders={() => setIsRendersOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Bottom Center Collapsible Controls Dock (Zero Viewport Occlusion) */}
      <BottomControlDock
        floorVisibility={floorVisibility}
        onToggleFloor={handleToggleFloor}
        layerVisibility={layerVisibility}
        onToggleLayer={handleToggleLayer}
        isTransparentMode={isTransparentMode}
        onToggleTransparent={handleToggleTransparent}
        explodedFactor={explodedFactor}
        onChangeExploded={handleChangeExploded}
        onSelectCameraPreset={handleSelectCameraPreset}
        isOrthographic={isOrthographic}
        onToggleOrthographic={handleToggleOrthographic}
        onCaptureSnapshot={handleCaptureSnapshot}
      />

      {/* Interactive Room Inspection Card */}
      <RoomDetailCard
        room={selectedRoom || hoveredRoom}
        onClose={selectedRoom ? () => setSelectedRoom(null) : undefined}
      />

      {/* Viewport Overlay Indicators (Compass & CAD Scale) */}
      <div className="absolute top-20 left-4 z-10 pointer-events-none flex flex-col gap-2">
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-900/80 border border-slate-800 rounded-lg text-slate-300 text-xs backdrop-blur-sm">
          <Compass className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-mono text-[11px]">N: REAR / S: MAIN ROAD</span>
        </div>

        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-900/80 border border-slate-800 rounded-lg text-slate-300 text-xs backdrop-blur-sm">
          <div className="w-12 h-1 bg-sky-400 relative">
            <span className="absolute -top-3 left-0 text-[9px] font-mono">0</span>
            <span className="absolute -top-3 right-0 text-[9px] font-mono">5m</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono ml-1">Scale 1:100</span>
        </div>
      </div>

      {/* Toast Notification */}
      {snapshotToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4" />
          <span>{snapshotToast}</span>
        </div>
      )}

      {/* Section 8 Validation Schedule Modal */}
      <ValidationModal
        isOpen={isValidationOpen}
        onClose={() => setIsValidationOpen(false)}
      />

      {/* Original Architectural Floor Plans Modal */}
      <PlanViewerModal
        isOpen={isPlansOpen}
        onClose={() => setIsPlansOpen(false)}
        onEnable3DOverlay={() => {
          if (!layerVisibility.blueprintOverlay) {
            handleToggleLayer('blueprintOverlay');
          }
        }}
      />

      {/* Photorealistic Renderings & Elevation Portfolio Modal */}
      <RenderGalleryModal
        isOpen={isRendersOpen}
        onClose={() => setIsRendersOpen(false)}
        onSelectView={handleSelectCameraPreset}
        onCaptureSnapshot={handleCaptureSnapshot}
      />

      {/* 3D Model & Standalone Viewer Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExportGLB={handleExportGLB}
        onExportOBJ={handleExportOBJ}
      />
    </div>
  );
}
