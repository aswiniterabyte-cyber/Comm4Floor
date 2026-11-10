import React from 'react';
import {
  Building2,
  FileCheck2,
  Eye,
  Camera,
  Download,
  Layers,
  Compass,
} from 'lucide-react';

interface HeaderProps {
  onOpenValidation: () => void;
  onOpenPlans: () => void;
  onOpenRenders: () => void;
  onOpenExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenValidation,
  onOpenPlans,
  onOpenRenders,
  onOpenExport,
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 pointer-events-none p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Project Branding */}
        <div className="pointer-events-auto bg-slate-900/90 border border-slate-800 backdrop-blur-md rounded-xl p-3 shadow-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-600/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  COMMERCIAL BUILDING 3D BIM
                </h1>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded">
                  LOD 350
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                  1:100 Scale
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span>G+3 Structure</span>
                <span className="text-slate-600">•</span>
                <span>Original Plot & Angled Right Boundary Preserved</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pointer-events-auto flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenValidation}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-sky-500/50 rounded-lg text-xs font-medium backdrop-blur-md transition-all shadow-md active:scale-95"
            title="Review Section 8 Structural and Dimensional Validation Audit"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Section 8</span> Audit & Schedule
          </button>

          <button
            onClick={onOpenPlans}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-sky-500/50 rounded-lg text-xs font-medium backdrop-blur-md transition-all shadow-md active:scale-95"
            title="Inspect original uploaded Ground and 1st floor CAD plans"
          >
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            <span>Original Plans</span>
          </button>

          <button
            onClick={onOpenRenders}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-sky-500/50 rounded-lg text-xs font-medium backdrop-blur-md transition-all shadow-md active:scale-95"
            title="View elevations, aerial, and cutaway photorealistic renderings"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Elevation</span> Renders
          </button>

          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg text-xs backdrop-blur-md transition-all shadow-lg shadow-sky-600/30 active:scale-95"
            title="Export 3D Model (GLB, OBJ, Standalone HTML Viewer)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export 3D</span>
          </button>
        </div>
      </div>
    </header>
  );
};
