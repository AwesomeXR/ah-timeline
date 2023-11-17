export type ITLFrame<T = any> = {
  key: string;
  offset: number;
  draggable?: boolean; // 是否可拖拽
  marker: { type: 'img'; img: string } | { type: 'line'; color?: string } | { type: 'text'; text: string };
  data: T;
};

export type ITLTrackMarker = { type: 'warning'; start: number; end: number };

export type ITLTrack<T = any, K = any> = {
  key: string;
  label: string;
  frames: ITLFrame<K>[];
  data: T;

  markers?: ITLTrackMarker[];

  children?: ITLTrack[]; // 子 track
};

export type ITLRenderingTrack<T = any, K = any> = {
  id: string;
  parentId?: string;

  key: string;
  label: string;

  level: number;
  frameRenderGroups: { key: string; offset: number; span: number; marker: ITLFrame['marker']; draggable?: boolean }[]; // 帧分组
  frames: ITLFrame<K>[];
  markers: ITLTrackMarker[];

  hasChildren?: boolean;
  thumbs?: { range: number[] }[]; // 缩略图

  raw: ITLTrack<T, K>;
};
