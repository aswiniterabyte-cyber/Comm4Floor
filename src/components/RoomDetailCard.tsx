import React from 'react';
import { RoomData } from '../types/architecture';
import { Ruler, CheckCircle2, X } from 'lucide-react';

interface RoomDetailCardProps {
  room: RoomData | null;
  onClose?: () => void;
}

export const RoomDetailCard: React.FC<RoomDetailCardProps> = ({ room, onClose }) => {
  if (!room) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-20 pointer-events-auto w-80 bg-slate-900/95 border border-sky-500/40 backdrop-blur-xl rounded-xl p-4 shadow-2xl text-slate-200 animate-in fade-in slide-in-from-right-4 duration-200">
      <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5 mb-2.5">
        <div>
          <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
            {room.floor === 'ground' ? 'Ground Floor' : '1st Floor Office'}
          </span>
          <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
            {room.name}
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dimensions & Area */}
      <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80 mb-3 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 block">Imperial Size</span>
          <span className="font-mono font-bold text-sky-300">{room.dimensionsImperial}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">Metric Size</span>
          <span className="font-mono font-bold text-slate-200">{room.dimensionsMetric}</span>
        </div>
        <div className="col-span-2 pt-1 border-t border-slate-800/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">Total Floor Area:</span>
          <span className="font-semibold text-emerald-400 font-mono">
            {room.areaSqFt} sq.ft ({room.areaSqM} m²)
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-300 leading-relaxed mb-3">
        {room.description}
      </p>

      {/* Features List */}
      <div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
          Architectural Features
        </span>
        <ul className="space-y-1">
          {room.features.map((f, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
