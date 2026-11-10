export interface RoomData {
  id: string;
  name: string;
  floor: 'ground' | 'first' | 'second' | 'third';
  dimensionsImperial: string;
  dimensionsMetric: string;
  areaSqFt: number;
  areaSqM: number;
  description: string;
  features: string[];
  bounds: {
    x: number;
    z: number;
    width: number;
    depth: number;
  };
  highlightColor?: number;
}

export interface ColumnData {
  id: string;
  gridRef: string;
  x: number; // in meters relative to origin
  z: number;
  width: number;
  depth: number;
  groundFloorAligned: boolean;
  firstFloorAligned: boolean;
  upperFloorsContinued: boolean;
}

export type CameraPreset =
  | 'front'
  | 'rear'
  | 'left'
  | 'right'
  | 'corner-sw'
  | 'corner-se'
  | 'corner-nw'
  | 'corner-ne'
  | 'top'
  | 'cutaway-ground'
  | 'cutaway-first'
  | 'stairs-west'
  | 'stairs-lobby'
  | 'garages-rear'
  | 'site-aerial';

export interface ElevationInfo {
  id: CameraPreset;
  title: string;
  description: string;
  position: [number, number, number];
  target: [number, number, number];
  isOrthographic?: boolean;
}

export interface FloorVisibility {
  site: boolean;
  ground: boolean;
  first: boolean;
  second: boolean;
  third: boolean;
  roof: boolean;
}

export interface LayerVisibility {
  walls: boolean;
  columns: boolean;
  slabs: boolean;
  windows: boolean;
  furniture: boolean;
  vehicles: boolean;
  stairs: boolean;
  lift: boolean;
  roofEquipment: boolean;
  wireframe: boolean;
  blueprintOverlay: boolean;
  columnGrid: boolean;
}
