import React, { useState } from 'react';
import { Download, X, Box, FileCode, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { generateStandaloneHtml } from '../utils/exportStandaloneHtml';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportGLB: () => Promise<void>;
  onExportOBJ: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExportGLB,
  onExportOBJ,
}) => {
  const [isExportingGLB, setIsExportingGLB] = useState(false);
  const [exportedStatus, setExportedStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGLB = async () => {
    try {
      setIsExportingGLB(true);
      await onExportGLB();
      setExportedStatus('GLB binary 3D model exported successfully.');
      setTimeout(() => setExportedStatus(null), 4000);
    } catch (e) {
      console.error(e);
      setExportedStatus('Export failed. Check console.');
    } finally {
      setIsExportingGLB(false);
    }
  };

  const handleOBJ = () => {
    try {
      onExportOBJ();
      setExportedStatus('OBJ 3D geometry exported successfully.');
      setTimeout(() => setExportedStatus(null), 4000);
    } catch (e) {
      console.error(e);
      setExportedStatus('Export failed.');
    }
  };

  const handleDownloadStandaloneHtml = () => {
    const html = generateStandaloneHtml();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Commercial_Building_3D_BIM_Standalone_Viewer.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportedStatus('Offline Standalone HTML 3D Viewer downloaded successfully!');
    setTimeout(() => setExportedStatus(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Export 3D Model & Standalone Viewer
              </h2>
              <p className="text-xs text-slate-400">
                Deliverables A & C: Standard 3D CAD formats (GLB, OBJ) and offline HTML viewer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Options */}
        <div className="p-5 space-y-4">
          {exportedStatus && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center gap-2 text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{exportedStatus}</span>
            </div>
          )}

          {/* Option 1: Standalone HTML Viewer (Deliverable C) */}
          <div className="p-4 bg-slate-950/60 border border-slate-800/90 rounded-xl hover:border-sky-500/50 transition-all">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">
                    Offline Standalone HTML 3D Viewer
                  </span>
                  <span className="px-2 py-0.5 bg-sky-500/20 text-sky-400 text-[10px] font-bold rounded">
                    Deliverable C
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Generates a single self-contained HTML file containing Three.js and the full 3D commercial building model with orbit, zoom, elevations, and exploded floors. Opens instantly in any modern browser without installation or web server.
                </p>
              </div>
              <button
                onClick={handleDownloadStandaloneHtml}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg text-xs transition-all active:scale-95 whitespace-nowrap shadow-md shadow-sky-600/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download HTML</span>
              </button>
            </div>
          </div>

          {/* Option 2: GLB Binary (Deliverable A) */}
          <div className="p-4 bg-slate-950/60 border border-slate-800/90 rounded-xl hover:border-sky-500/50 transition-all">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">
                    GLTF 2.0 Binary Model (.glb)
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded">
                    Industry Standard
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Full 3D hierarchy, separate floor groups, columns, slabs, glass, stairs, lift, furniture, and PBR materials. Compatible with Blender, Revit, 3ds Max, SketchUp, Unreal Engine, and Web 3D engines.
                </p>
              </div>
              <button
                onClick={handleGLB}
                disabled={isExportingGLB}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-lg text-xs transition-all active:scale-95 whitespace-nowrap"
              >
                {isExportingGLB ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                    <span>Packing GLB...</span>
                  </>
                ) : (
                  <>
                    <Box className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Export .GLB</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Option 3: Wavefront OBJ (Deliverable A) */}
          <div className="p-4 bg-slate-950/60 border border-slate-800/90 rounded-xl hover:border-sky-500/50 transition-all">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">
                    Wavefront OBJ Geometry (.obj)
                  </span>
                  <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-[10px] font-bold rounded">
                    Universal CAD
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Universal raw polygonal mesh geometry. Easily imported into AutoCAD, Rhino, ArchiCAD, and structural analysis tools.
                </p>
              </div>
              <button
                onClick={handleOBJ}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-lg text-xs transition-all active:scale-95 whitespace-nowrap"
              >
                <FileCode className="w-3.5 h-3.5 text-sky-400" />
                <span>Export .OBJ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
