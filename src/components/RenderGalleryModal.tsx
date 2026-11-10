import React from 'react';
import { Camera, X, Download, Eye, ExternalLink } from 'lucide-react';
import { ELEVATION_VIEWS } from '../data/buildingData';
import { CameraPreset } from '../types/architecture';

interface RenderGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectView: (preset: CameraPreset) => void;
  onCaptureSnapshot: () => void;
}

export const RenderGalleryModal: React.FC<RenderGalleryModalProps> = ({
  isOpen,
  onClose,
  onSelectView,
  onCaptureSnapshot,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Deliverable B: Architectural Renderings & Elevation Portfolio
              </h2>
              <p className="text-xs text-slate-400">
                Front, Rear, Left, Right, 4 Corners, Top Aerial, and Ground & First Floor Cutaways
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onCaptureSnapshot}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Capture View PNG</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {ELEVATION_VIEWS.map((view) => (
            <div
              key={view.id}
              className="group bg-slate-950/70 border border-slate-800/80 hover:border-sky-500/60 rounded-xl p-4 transition-all hover:shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-white group-hover:text-sky-400 transition-colors">
                    {view.title}
                  </h3>
                  {view.isOrthographic && (
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                      Orthographic CAD
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {view.description}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
                <button
                  onClick={() => {
                    onSelectView(view.id);
                    onClose();
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-sky-600 hover:text-white text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Align Camera to View</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <span>Tip: Click "Align Camera to View" then click "Snapshot" in the bottom dock for print-ready rendering exports.</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
