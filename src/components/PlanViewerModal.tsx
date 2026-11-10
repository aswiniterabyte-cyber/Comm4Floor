import React, { useState } from 'react';
import { Eye, X, ZoomIn, ZoomOut, RotateCcw, CheckCircle2, SplitSquareVertical } from 'lucide-react';

interface PlanViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnable3DOverlay: () => void;
}

export const PlanViewerModal: React.FC<PlanViewerModalProps> = ({
  isOpen,
  onClose,
  onEnable3DOverlay,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'ground' | 'first' | 'sideBySide'>('ground');
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Original Authoritative Architectural Floor Plans
              </h2>
              <p className="text-xs text-slate-400">
                Supplied CAD drawings (Scale 1:100) used for 100% exact 3D building generation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onEnable3DOverlay();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Project on 3D Slab</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Switcher & Zoom Tools */}
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-slate-800 bg-slate-950/40 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedPlan('ground');
                setZoomLevel(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedPlan === 'ground'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Ground Floor Plan
            </button>

            <button
              onClick={() => {
                setSelectedPlan('first');
                setZoomLevel(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedPlan === 'first'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              First Floor Office Plan
            </button>

            <button
              onClick={() => {
                setSelectedPlan('sideBySide');
                setZoomLevel(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedPlan === 'sideBySide'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Side-by-Side Comparison
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.2))}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono text-slate-400 w-12 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Plan Display Area */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/80 min-h-[400px]">
          {selectedPlan === 'sideBySide' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-sky-400 mb-2">Ground Floor Plan (Scale 1:100)</span>
                <div className="overflow-hidden border border-slate-700 rounded-xl bg-white shadow-xl max-h-[60vh]">
                  <img
                    src="/assets/aistudio/Detailed_Commercial_Ground_Floor_Plan_863446d9.png"
                    alt="Detailed Commercial Ground Floor Plan"
                    className="max-h-[60vh] object-contain transition-transform"
                    style={{ transform: `scale(${zoomLevel})` }}
                  />
                </div>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-sky-400 mb-2">First Floor Plan (Scale 1:100)</span>
                <div className="overflow-hidden border border-slate-700 rounded-xl bg-white shadow-xl max-h-[60vh]">
                  <img
                    src="/assets/aistudio/First_Floor_Office_Plan_9b2b2502.png"
                    alt="First Floor Office Plan"
                    className="max-h-[60vh] object-contain transition-transform"
                    style={{ transform: `scale(${zoomLevel})` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center max-w-2xl">
              <div className="overflow-hidden border border-slate-700 rounded-xl bg-white shadow-2xl max-h-[68vh]">
                <img
                  src={
                    selectedPlan === 'ground'
                      ? '/assets/aistudio/Detailed_Commercial_Ground_Floor_Plan_863446d9.png'
                      : '/assets/aistudio/First_Floor_Office_Plan_9b2b2502.png'
                  }
                  alt="Architectural Floor Plan"
                  className="max-h-[68vh] object-contain transition-transform"
                  style={{ transform: `scale(${zoomLevel})` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <span>Notice: Right angled driveway, 5 parking garages, 2 showrooms, and 4 office suites preserved 1:1.</span>
          <button
            onClick={() => {
              onEnable3DOverlay();
              onClose();
            }}
            className="text-emerald-400 hover:underline font-semibold"
          >
            Enable 3D Blueprint Projection Overlay →
          </button>
        </div>
      </div>
    </div>
  );
};
