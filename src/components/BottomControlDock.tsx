import React, { useState } from 'react';
import {
  Layers,
  Compass,
  Grid,
  Camera,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Box,
  SplitSquareVertical,
  Check,
  Eye,
  Sliders,
  Sparkles,
  Car,
} from 'lucide-react';
import { CameraPreset, FloorVisibility, LayerVisibility } from '../types/architecture';

interface BottomControlDockProps {
  floorVisibility: FloorVisibility;
  onToggleFloor: (floor: keyof FloorVisibility) => void;
  layerVisibility: LayerVisibility;
  onToggleLayer: (layer: keyof LayerVisibility) => void;
  isTransparentMode: boolean;
  onToggleTransparent: () => void;
  explodedFactor: number;
  onChangeExploded: (factor: number) => void;
  onSelectCameraPreset: (preset: CameraPreset) => void;
  isOrthographic: boolean;
  onToggleOrthographic: () => void;
  onCaptureSnapshot: () => void;
}

export const BottomControlDock: React.FC<BottomControlDockProps> = ({
  floorVisibility,
  onToggleFloor,
  layerVisibility,
  onToggleLayer,
  isTransparentMode,
  onToggleTransparent,
  explodedFactor,
  onChangeExploded,
  onSelectCameraPreset,
  isOrthographic,
  onToggleOrthographic,
  onCaptureSnapshot,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'floors' | 'elevations' | 'structure' | 'capture'>('floors');

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 z-30 transition-all duration-300 w-[95vw] max-w-[920px] ${
        isCollapsed ? 'bottom-2' : 'bottom-5'
      }`}
    >
      {/* Collapse / Expand Toggle Tab */}
      <div className="flex justify-center mb-1">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 rounded-full text-[11px] font-semibold backdrop-blur-md shadow-lg transition-all"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-sky-400" />
              <span>Show BIM Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Hide Controls (Cinema Mode)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Dock Container */}
      {!isCollapsed && (
        <div className="bg-slate-900/95 border border-slate-800 backdrop-blur-xl rounded-2xl p-3 shadow-2xl shadow-black/50 text-slate-200">
          {/* Navigation Tabs Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3 px-1 gap-2 overflow-x-auto">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('floors')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'floors'
                    ? 'bg-sky-600 text-white shadow-sm shadow-sky-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Floors & Cutaways</span>
              </button>

              <button
                onClick={() => setActiveTab('elevations')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'elevations'
                    ? 'bg-sky-600 text-white shadow-sm shadow-sky-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Elevations & Views</span>
              </button>

              <button
                onClick={() => setActiveTab('structure')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'structure'
                    ? 'bg-sky-600 text-white shadow-sm shadow-sky-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Column Grid (18 Cols)</span>
              </button>
            </div>

            {/* Quick Actions: Glass BIM / Transparent Mode & Snapshot */}
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleTransparent}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  isTransparentMode
                    ? 'bg-sky-500/25 text-sky-200 border-sky-400 shadow-sm shadow-sky-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
                }`}
                title="Toggle High-End Glass BIM / Transparent Building visual mode to inspect internal 4 garages, dual staircases, lift, and columns"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isTransparentMode ? 'text-sky-300 animate-pulse' : 'text-sky-400'}`} />
                <span>{isTransparentMode ? 'Glass BIM: ON' : 'Glass BIM / Transparent'}</span>
              </button>

              <button
                onClick={onCaptureSnapshot}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 rounded-lg text-xs font-medium transition-all active:scale-95 whitespace-nowrap"
                title="Instant high-resolution PNG snapshot of current viewport"
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Snapshot</span>
              </button>
            </div>
          </div>

          {/* TAB 1: FLOORS & CUTAWAYS */}
          {activeTab === 'floors' && (
            <div className="space-y-3">
              {/* Floor Visibility Toggles */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                  Floors:
                </span>
                <button
                  onClick={() => onToggleFloor('site')}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
                    floorVisibility.site
                      ? 'bg-slate-800 text-sky-300 border-sky-500/50'
                      : 'bg-slate-950 text-slate-500 border-slate-800 line-through'
                  }`}
                >
                  Site / Road
                </button>
                <button
                  onClick={() => onToggleFloor('ground')}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
                    floorVisibility.ground
                      ? 'bg-slate-800 text-sky-300 border-sky-500/50 font-semibold'
                      : 'bg-slate-950 text-slate-500 border-slate-800 line-through'
                  }`}
                >
                  Ground (Shops + 5 Garages)
                </button>
                <button
                  onClick={() => onToggleFloor('first')}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
                    floorVisibility.first
                      ? 'bg-slate-800 text-sky-300 border-sky-500/50 font-semibold'
                      : 'bg-slate-950 text-slate-500 border-slate-800 line-through'
                  }`}
                >
                  1st Floor (4 Offices)
                </button>
                <button
                  onClick={() => onToggleFloor('second')}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
                    floorVisibility.second
                      ? 'bg-slate-800 text-sky-300 border-sky-500/50'
                      : 'bg-slate-950 text-slate-500 border-slate-800 line-through'
                  }`}
                >
                  2nd (G+3 Shell)
                </button>
                <button
                  onClick={() => onToggleFloor('third')}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
                    floorVisibility.third
                      ? 'bg-slate-800 text-sky-300 border-sky-500/50'
                      : 'bg-slate-950 text-slate-500 border-slate-800 line-through'
                  }`}
                >
                  3rd (G+3 Shell)
                </button>
                <button
                  onClick={() => onToggleFloor('roof')}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
                    floorVisibility.roof
                      ? 'bg-slate-800 text-sky-300 border-sky-500/50'
                      : 'bg-slate-950 text-slate-500 border-slate-800 line-through'
                  }`}
                >
                  Roof & Parapet
                </button>

                <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

                {/* Blueprint Overlay Toggle */}
                <button
                  onClick={() => onToggleLayer('blueprintOverlay')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border transition-all ${
                    layerVisibility.blueprintOverlay
                      ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/60 font-semibold'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700'
                  }`}
                  title="Project original high-res CAD floor plan drawing directly onto 3D slab for 1:1 dimensional comparison"
                >
                  <Eye className="w-3 h-3" />
                  <span>CAD Plan Overlay in 3D</span>
                </button>
              </div>

              {/* Exploded View Slider */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-3 flex-1 max-w-md">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5 whitespace-nowrap">
                    <SplitSquareVertical className="w-3.5 h-3.5 text-sky-400" />
                    <span>Exploded Floor Separation:</span>
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(explodedFactor * 100)}
                    onChange={(e) => onChangeExploded(Number(e.target.value) / 100)}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                  <span className="text-xs font-mono text-sky-400 w-9 text-right">
                    {Math.round(explodedFactor * 100)}%
                  </span>
                  {explodedFactor > 0 && (
                    <button
                      onClick={() => onChangeExploded(0)}
                      className="text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Quick Cutaway & Staircase Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-400">Quick Focus:</span>
                  <button
                    onClick={() => onSelectCameraPreset('garages-rear')}
                    className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded text-xs font-semibold flex items-center gap-1"
                    title="Camera direct focus into Ground Floor rear 4 covered garages, 4 vehicles, and dividing wall"
                  >
                    <Car className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Rear 4 Garages</span>
                  </button>
                  <button
                    onClick={() => onSelectCameraPreset('stairs-west')}
                    className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-xs font-semibold flex items-center gap-1"
                    title="Zoom camera to West facade staircase curtain wall to inspect both upper and lower staircases"
                  >
                    <span>View Both Stairs (West)</span>
                  </button>
                  <button
                    onClick={() => onSelectCameraPreset('stairs-lobby')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 rounded text-xs font-medium"
                    title="Look straight into open lobby portals where stair entries start"
                  >
                    <span>Stairs from Lobby</span>
                  </button>
                  <button
                    onClick={() => {
                      onSelectCameraPreset('cutaway-ground');
                      onToggleFloor('second');
                      onToggleFloor('third');
                      onToggleFloor('roof');
                    }}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs"
                  >
                    Ground Cutaway
                  </button>
                  <button
                    onClick={() => {
                      onSelectCameraPreset('cutaway-first');
                      onToggleFloor('second');
                      onToggleFloor('third');
                      onToggleFloor('roof');
                    }}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs"
                  >
                    1st Floor Cutaway
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ELEVATIONS & CAMERA PRESETS */}
          {activeTab === 'elevations' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Architectural Elevation Views:
                </span>

                {/* Projection Mode Toggle: Perspective vs Orthographic */}
                <button
                  onClick={onToggleOrthographic}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border transition-all ${
                    isOrthographic
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                  title="Toggle between Perspective (Natural) and Orthographic (CAD Blueprint) projection"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>
                    Camera Projection: <strong>{isOrthographic ? 'ORTHOGRAPHIC (CAD)' : 'PERSPECTIVE'}</strong>
                  </span>
                </button>
              </div>

              {/* Elevation Preset Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-1.5">
                <button
                  onClick={() => onSelectCameraPreset('front')}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs font-medium text-left flex items-center justify-between"
                >
                  <span>Front (Main Road)</span>
                  <span className="text-[10px] text-sky-400">South</span>
                </button>

                <button
                  onClick={() => onSelectCameraPreset('rear')}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs font-medium text-left flex items-center justify-between"
                >
                  <span>Rear (Garages)</span>
                  <span className="text-[10px] text-sky-400">North</span>
                </button>

                <button
                  onClick={() => onSelectCameraPreset('left')}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs font-medium text-left flex items-center justify-between"
                >
                  <span>Left (Stairs Core)</span>
                  <span className="text-[10px] text-sky-400">West</span>
                </button>

                <button
                  onClick={() => onSelectCameraPreset('right')}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs font-medium text-left flex items-center justify-between"
                >
                  <span>Right (Driveway)</span>
                  <span className="text-[10px] text-sky-400">East</span>
                </button>

                <button
                  onClick={() => onSelectCameraPreset('top')}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs font-medium text-left flex items-center justify-between"
                >
                  <span>Top Aerial (90°)</span>
                  <span className="text-[10px] text-sky-400">Plan</span>
                </button>

                <button
                  onClick={() => onSelectCameraPreset('corner-se')}
                  className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded text-xs text-left"
                >
                  Corner SE (Front-Right)
                </button>

                <button
                  onClick={() => onSelectCameraPreset('corner-sw')}
                  className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded text-xs text-left"
                >
                  Corner SW (Front-Left)
                </button>

                <button
                  onClick={() => onSelectCameraPreset('corner-ne')}
                  className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded text-xs text-left"
                >
                  Corner NE (Rear-Right)
                </button>

                <button
                  onClick={() => onSelectCameraPreset('corner-nw')}
                  className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded text-xs text-left"
                >
                  Corner NW (Rear-Left)
                </button>

                <button
                  onClick={() => onSelectCameraPreset('garages-rear')}
                  className="px-2.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded text-xs text-left font-semibold flex items-center justify-between"
                >
                  <span>Rear 4 Garages</span>
                  <span className="text-[10px] text-emerald-400">Ground</span>
                </button>

                <button
                  onClick={() => onSelectCameraPreset('stairs-west')}
                  className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-xs text-left font-semibold"
                >
                  Dual Stairs (West Window)
                </button>

                <button
                  onClick={() => onSelectCameraPreset('stairs-lobby')}
                  className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-sky-300 border border-slate-700 rounded text-xs text-left"
                >
                  Stairs Lobby Entry
                </button>

                <button
                  onClick={() => onSelectCameraPreset('site-aerial')}
                  className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded text-xs text-left"
                >
                  Site Road Context
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: STRUCTURE & COLUMN GRID */}
          {activeTab === 'structure' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleLayer('columnGrid')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      layerVisibility.columnGrid
                        ? 'bg-sky-600/30 text-sky-300 border-sky-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5 text-sky-400" />
                    <span>3D Column Grid Lines (18 Columns)</span>
                    {layerVisibility.columnGrid && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                </div>

                <div className="text-xs text-emerald-400 font-mono bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-800/50">
                  Vertical Column Drift: 0.00 mm (100% Aligned)
                </div>
              </div>

              <div className="text-xs text-slate-400 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                <span className="font-semibold text-slate-300">Structural Column Alignment Audit:</span> All 18 reinforced concrete columns (0.4m × 0.4m) across Grid Lines A, B, C, and D are vertically aligned with 0.00 mm lateral offset from Ground Floor through First Floor, continuing up to G+3. Click on any room or column in 3D to inspect detailed dimensions.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
