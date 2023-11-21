/// <reference types="./declare.d.ts" />

// 上面是 fix: @parcel/transformer-typescript-types: Cannot find module './icon/MinusSquareOutlined.svg' or its corresponding type declarations.

import React, { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import { ITLFrame, ITLRenderingTrack, ITLTrack, ITLTrackMarker } from './type';
import './style.less';
import { isEqual, range, set, sortBy } from 'lodash';
import { FlatTreeHelper } from 'ah-tree-helper';
import MinusSquareOutlined from './icon/MinusSquareOutlined.svg';
import PlusSquareOutlined from './icon/PlusSquareOutlined.svg';

type ITLTrack2 = ITLTrack & { id: string; parentId?: string };

export type ITimelineRef = {
  scrollIntoViewIfNeeded: () => void;
};

export interface ITimelineProps<T = any, K = any> {
  className?: string;

  _ref?: React.Ref<ITimelineRef>;

  width: number;
  height: number;

  tracks: ITLTrack<T, K>[];

  cursor?: number;
  defaultCursor?: number;
  onCursorChange?: (cursor: number) => any;

  selectedTrack?: string;
  defaultSelectedTrack?: string;
  onSelectedTrackChange?: (key?: string, track?: ITLTrack<T, K>) => any;

  expandedTracks?: string[];
  defaultExpandedTracks?: string[];
  onExpandedTracksChange?: (tracks: string[]) => any;

  autoExpand?: boolean;

  onFrameDragStart?: (info: { track: ITLTrack<T, K>; frame: ITLFrame<T>; startOffset: number }) => any;
  onFrameDrag?: (info: { track: ITLTrack<T, K>; frame: ITLFrame<T>; startOffset: number; movement: number }) => any;
  onFrameDragEnd?: (info: { track: ITLTrack<T, K>; frame: ITLFrame<T>; startOffset: number }) => any;

  onTrackContextMenu?: (info: { track: ITLTrack<T, K>; clientX: number; clientY: number }) => any;

  onCursorDragStart?: (info: {}) => any;
  onCursorDrag?: (info: {}) => any;
  onCursorDragEnd?: (info: {}) => any;
}

const calcGridBackground = (fw: number, fh: number, x: number, y: number): React.CSSProperties => {
  const color1 = '#d9d9d9';
  const color2 = '#f5f5f5';

  const background = `
repeating-linear-gradient(to right, ${color1} ${-x}px, ${color1} ${1 - x}px, transparent ${1 - x}px, transparent ${fw - x}px),
repeating-linear-gradient(to bottom, ${color1} ${-y}px, ${color1} ${1 - y}px, transparent ${1 - y}px, transparent ${fh - y}px),
repeating-linear-gradient(to bottom, ${color2} ${-y}px, ${color2} ${fh - y}px, transparent ${fh - y}px, transparent ${fh * 2 - y}px)
  `;

  return { background };
};

const EMPTY_FN = () => {};

export const Timeline = <T, K>({
  className,
  _ref,
  width,
  height,
  autoExpand,
  cursor: cursor0,
  defaultCursor,
  onCursorChange,
  tracks,
  selectedTrack: selectedTrack0,
  defaultSelectedTrack,
  onSelectedTrackChange,
  expandedTracks: expandedTracks0,
  defaultExpandedTracks,
  onExpandedTracksChange,

  onCursorDragStart = EMPTY_FN,
  onCursorDrag = EMPTY_FN,
  onCursorDragEnd = EMPTY_FN,

  onFrameDragStart = EMPTY_FN,
  onFrameDrag = EMPTY_FN,
  onFrameDragEnd = EMPTY_FN,

  onTrackContextMenu = EMPTY_FN,
}: ITimelineProps<T, K>) => {
  const container = useRef<HTMLDivElement>(null);

  const [cursor, setCursor] = useState<number>(cursor0 ?? defaultCursor ?? 0);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [frameWidth, _setFrameWidth] = useState<number>(20);
  const [frameHeight, _setFrameHeight] = useState<number>(20);

  const [selectedTrack, setSelectedTrack] = useState<string | undefined>(selectedTrack0 || defaultSelectedTrack || '');
  const [expandedTracks, setExpandedTracks] = useState<string[]>(expandedTracks0 || defaultExpandedTracks || []);
  const [colHeaderWidth] = useState<number>(96);

  // 对外暴露 ref 方法
  useImperativeHandle<ITimelineRef, ITimelineRef>(_ref, () => ({
    scrollIntoViewIfNeeded: () => {
      // 把 cursor 所在的 frame 滚动到视口范围内
      let newOffsetX: number | null = null;
      let newOffsetY: number | null = null;

      if (cursorRect.x < vpRect.x) newOffsetX = cursorRect.x;
      if (cursorRect.x + cursorRect.width > vpRect.x + vpRect.width) newOffsetX = cursorRect.x + cursorRect.width - vpRect.width;

      if (cursorRect.y < vpRect.y) newOffsetY = cursorRect.y;
      if (cursorRect.y + cursorRect.height > vpRect.y + vpRect.height) newOffsetY = cursorRect.y + cursorRect.height - vpRect.height;

      if (newOffsetX !== null) setOffsetX(newOffsetX);
      if (newOffsetY !== null) setOffsetY(newOffsetY);
    },
  }));

  const handleCursorChange = (c: number) => {
    if (c < 0) return;
    setCursor(c);
    onCursorChange?.(c);
  };

  const handleSelectedTrackChange = (key: string | undefined) => {
    setSelectedTrack(key);
    onSelectedTrackChange?.(key, key ? fTree.getById(key) : undefined);
  };

  const handleExpandsChange = (keys: string[]) => {
    setExpandedTracks(keys);
    onExpandedTracksChange?.(keys);
  };

  const scrollBarSize = 12;

  // 构建渲染树
  const { rTree, maxOffset } = useMemo(() => {
    const list: ITLRenderingTrack[] = [];
    let maxOffset = 0;

    const _getAllSubFrames = (track: ITLTrack) => {
      const frames: ITLFrame[] = [];

      const _walk = (t: ITLTrack) => {
        frames.push(...t.frames);
        t.children?.forEach(_walk);
      };

      track.children?.forEach(_walk);

      return frames;
    };

    const _calcFrameRenderGroups = (track: ITLTrack) => {
      const _groups: ITLRenderingTrack['frameRenderGroups'] = [];
      const _frames = track.frames;

      for (let i = 0; i < _frames.length; i++) {
        const fa = _frames[i];

        for (let j = i + 1; j <= _frames.length; j++) {
          const fb0 = _frames[j - 1];
          const fb = _frames[j] as ITLFrame | undefined;

          let _equal = false;

          // 只处理 line 类型
          if (fb && fa.marker.type === 'line' && isEqual(fa.marker, fb.marker) && fa.draggable === fb.draggable) {
            _equal = true;
          }

          if (!_equal) {
            _groups.push({
              key: `${fa.offset}-${fb0.offset}`,
              offset: fa.offset,
              span: fb0.offset - fa.offset + 1,
              marker: fa.marker,
              draggable: fa.draggable,
            });

            i = j - 1;
            break;
          }
        }
      }

      return _groups;
    };

    const _walk = (level: number, track: ITLTrack, parentId?: string) => {
      const hasChildren = track.children && track.children.length > 0;

      const rt: ITLRenderingTrack = {
        id: track.key,
        parentId,
        key: track.key,
        label: track.label,
        hasChildren,
        level,
        frameRenderGroups: _calcFrameRenderGroups(track),
        frames: track.frames,
        raw: track,
      };
      list.push(rt);

      maxOffset = Math.max(maxOffset, ...track.frames.map(f => f.offset), 0); // 计算最大偏移量

      const isExpanded = expandedTracks.includes(track.key);

      if (hasChildren && isExpanded) {
        track.children!.forEach(t => _walk(level + 1, t, track.key));
      }
    };

    tracks.forEach(t => _walk(0, t));

    const rTree = new FlatTreeHelper(list);

    return { rTree, maxOffset };
  }, [tracks, expandedTracks]);

  // 构建全量树
  const { fTree } = useMemo(() => {
    const list = [] as ITLTrack2[];

    const _walk = (track: ITLTrack, parentId?: string) => {
      list.push({ id: track.key, parentId, ...track });
      track.children?.forEach(t => _walk(t, track.key));
    };

    tracks.forEach(t => _walk(t));
    const fTree = new FlatTreeHelper(list);

    return { fTree };
  }, [tracks]);

  const rowHeaderBox = { width: width - colHeaderWidth, height: 24, left: colHeaderWidth, top: 0 };
  const colHeaderBox = { width: colHeaderWidth, height: height - rowHeaderBox.height, left: 0, top: rowHeaderBox.height };

  const viewportBox = {
    width: width - colHeaderBox.width - scrollBarSize,
    height: height - rowHeaderBox.height - scrollBarSize,
    left: colHeaderBox.width,
    top: rowHeaderBox.height,
  };

  const contentBox = {
    width: Math.max((maxOffset + 1) * frameWidth, viewportBox.width),
    height: Math.max(rTree.list.length * frameHeight, viewportBox.height),
  };
  const rowScrollBox = { width: viewportBox.width, height: scrollBarSize, left: colHeaderBox.width, top: height - scrollBarSize };
  const colScrollBox = { width: scrollBarSize, height: viewportBox.height, left: width - scrollBarSize, top: rowHeaderBox.height };

  const rowBarBox = {
    width: rowScrollBox.width * (viewportBox.width / contentBox.width),
    left: rowScrollBox.width * (offsetX / contentBox.width),
  };
  const colBarBox = {
    height: colScrollBox.height * (viewportBox.height / contentBox.height),
    top: colScrollBox.height * (offsetY / contentBox.height),
  };

  const scrollTransformX = `translate(${-offsetX}px, 0px)`;
  const scrollTransformY = `translate(0px, ${-offsetY}px)`;
  const scrollTransformXY = `translate(${-offsetX}px, ${-offsetY}px)`;

  const sTrackIndex = rTree.list.findIndex(t => t.key === selectedTrack);

  const vpRect = { x: offsetX, y: offsetY, width: viewportBox.width, height: viewportBox.height };
  const cursorRect = {
    x: cursor * frameWidth,
    y: sTrackIndex >= 0 ? sTrackIndex * frameHeight : offsetY, // 如果没有选中的 track，就用 offsetY
    width: frameWidth,
    height: frameHeight,
  };

  const offsetXRange = [0, contentBox.width - viewportBox.width];
  const offsetYRange = [0, contentBox.height - viewportBox.height];

  useLayoutEffect(() => {
    const el = container.current;
    if (!el) return;

    const _mouseWheel = (ev: WheelEvent) => {
      ev.preventDefault();
      ev.stopPropagation();

      // 设置 offset
      setOffsetX(x => Math.max(x + +ev.deltaX, 0));
      setOffsetY(y => Math.max(y + +ev.deltaY, 0));
    };

    el.addEventListener('wheel', _mouseWheel, { passive: false });

    return () => {
      el.removeEventListener('wheel', _mouseWheel);
    };
  }, []);

  // 限制 offsetX offsetY 的范围
  useEffect(() => {
    if (offsetX < offsetXRange[0]) setOffsetX(offsetXRange[0]);
    if (offsetX > offsetXRange[1]) setOffsetX(offsetXRange[1]);
    if (offsetY < offsetYRange[0]) setOffsetY(offsetYRange[0]);
    if (offsetY > offsetYRange[1]) setOffsetY(offsetYRange[1]);
  }, [offsetX, offsetY]);

  // cursor reactivity
  useEffect(() => {
    if (typeof cursor0 === 'number') setCursor(cursor0);
  }, [cursor0]);

  // selectedTrack reactivity
  useEffect(() => {
    if (typeof selectedTrack0 === 'string') setSelectedTrack(selectedTrack0);
  }, [selectedTrack0]);

  // expandedTracks reactivity
  useEffect(() => {
    if (expandedTracks0) setExpandedTracks(expandedTracks0);
  }, [expandedTracks0]);

  // 自动展开
  useEffect(() => {
    if (autoExpand && selectedTrack && !expandedTracks.includes(selectedTrack)) {
      const allPIds = fTree.findAllParent(selectedTrack).map(p => p.id);
      const _newEs = [...new Set([...expandedTracks, ...allPIds])];

      if (_newEs.length === expandedTracks.length) return; // 没有变化(用 length 简单判断)

      handleExpandsChange(_newEs);
    }
  }, [selectedTrack]);

  const toggleExpand = (key: string, expand: boolean) => {
    const newExpandedTracks = expand ? [...expandedTracks, key] : expandedTracks.filter(k => k !== key);
    handleExpandsChange(newExpandedTracks);
  };

  const handleRowBarMouseDown = (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const barEle = ev.currentTarget;
    barEle.classList.add('active');

    const startClientX = ev.clientX;

    // 左键拖动
    if (ev.button === 0) {
      const _mouseMove = (_ev: MouseEvent) => {
        const _movement = _ev.clientX - startClientX;
        const newBarLeft = rowBarBox.left + _movement;

        const newOffsetX = (newBarLeft / rowBarBox.width) * rowScrollBox.width;
        if (newOffsetX < 0) return;

        setOffsetX(newOffsetX);
      };

      const _mouseUp = () => {
        document.removeEventListener('mousemove', _mouseMove);
        document.removeEventListener('mouseup', _mouseUp);

        barEle.classList.remove('active');
      };

      document.addEventListener('mousemove', _mouseMove);
      document.addEventListener('mouseup', _mouseUp);
    }
  };

  const handleColBarMouseDown = (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const barEle = ev.currentTarget;
    barEle.classList.add('active');

    const startClientY = ev.clientY;

    // 左键拖动
    if (ev.button === 0) {
      const _mouseMove = (_ev: MouseEvent) => {
        const _movement = _ev.clientY - startClientY;
        const newBarTop = colBarBox.top + _movement;

        const newOffsetY = (newBarTop / colBarBox.height) * colScrollBox.height;
        if (newOffsetY < 0) return;

        setOffsetY(newOffsetY);
      };

      const _mouseUp = () => {
        document.removeEventListener('mousemove', _mouseMove);
        document.removeEventListener('mouseup', _mouseUp);
        barEle.classList.remove('active');
      };

      document.addEventListener('mousemove', _mouseMove);
      document.addEventListener('mouseup', _mouseUp);
    }
  };

  const calcCursor = (x: number) => Math.floor((x + offsetX) / frameWidth);
  const calcSelectedTrack = (y: number): ITLRenderingTrack | undefined => rTree.list[Math.floor((y + offsetY) / frameHeight)];

  const handleBodyMouseDown = (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const bounding = ev.currentTarget.getBoundingClientRect();
    const x = ev.clientX - bounding.left;
    const y = ev.clientY - bounding.top;

    const c1 = calcCursor(x);
    const track1 = calcSelectedTrack(y);
    handleCursorChange(c1);
    handleSelectedTrackChange(track1?.key);

    // 左键拖动
    if (ev.button === 0) {
      let _draggingInfo: { track: ITLTrack<any, any>; frame: ITLFrame<any>; startOffset: number } | undefined;

      if (track1) {
        const track = fTree.getById(track1.key)!;
        const frame = track1.frames.find(f => f.offset === c1);
        if (frame) _draggingInfo = { track, frame, startOffset: frame.offset };
      }

      if (_draggingInfo) {
        onFrameDragStart(_draggingInfo);
      } else {
        onCursorDragStart({});
      }

      let _lastMovement: any = null;

      const _mouseMove = (ev: MouseEvent) => {
        const x = ev.clientX - bounding.left;
        const y = ev.clientY - bounding.top;

        const c2 = calcCursor(x);
        const track2 = calcSelectedTrack(y);
        handleCursorChange(c2);
        handleSelectedTrackChange(track2?.key);

        if (_draggingInfo) {
          const movement = c2 - _draggingInfo.startOffset;

          if (movement !== _lastMovement) {
            _lastMovement = movement;
            onFrameDrag({ ..._draggingInfo, movement });
          }
        } else {
          onCursorDrag({});
        }
      };

      const _mouseUp = () => {
        document.removeEventListener('mousemove', _mouseMove);
        document.removeEventListener('mouseup', _mouseUp);

        if (_draggingInfo) onFrameDragEnd(_draggingInfo);
        else onCursorDragEnd({});
      };

      document.addEventListener('mousemove', _mouseMove);
      document.addEventListener('mouseup', _mouseUp);
    }

    // 右键菜单
    if (ev.button === 2 && track1) {
      const track = fTree.getById(track1.key)!;
      onTrackContextMenu({ track, clientX: ev.clientX, clientY: ev.clientY });
    }
  };

  const handleRowHeaderMouseDown = (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const bounding = ev.currentTarget.getBoundingClientRect();
    const x = ev.clientX - bounding.left;
    const c1 = calcCursor(x);
    handleCursorChange(c1);

    // 左键拖动
    if (ev.button === 0) {
      const _mouseMove = (ev: MouseEvent) => {
        const x = ev.clientX - bounding.left;
        const c2 = calcCursor(x);
        handleCursorChange(c2);
      };

      const _mouseUp = () => {
        document.removeEventListener('mousemove', _mouseMove);
        document.removeEventListener('mouseup', _mouseUp);
      };

      document.addEventListener('mousemove', _mouseMove);
      document.addEventListener('mouseup', _mouseUp);
    }
  };

  const handleColHeaderMouseDown = (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const bounding = ev.currentTarget.getBoundingClientRect();
    const y = ev.clientY - bounding.top;
    const track1 = calcSelectedTrack(y);
    handleSelectedTrackChange(track1?.key);

    // 左键拖动
    if (ev.button === 0) {
      const _mouseMove = (ev: MouseEvent) => {
        const y = ev.clientY - bounding.top;
        const track2 = calcSelectedTrack(y);
        handleSelectedTrackChange(track2?.key);
      };

      const _mouseUp = () => {
        document.removeEventListener('mousemove', _mouseMove);
        document.removeEventListener('mouseup', _mouseUp);
      };

      document.addEventListener('mousemove', _mouseMove);
      document.addEventListener('mouseup', _mouseUp);
    }

    // 右键菜单
    if (ev.button === 2) {
      if (track1) {
        onTrackContextMenu({ track: fTree.getById(track1.key)!, clientX: ev.clientX, clientY: ev.clientY });
      }
    }
  };

  const renderRowHeader = () => {
    return (
      <div className='row-header' onMouseDown={handleRowHeaderMouseDown} style={{ ...rowHeaderBox }}>
        <div className='bar' style={{ transform: scrollTransformX }}>
          {range(0, maxOffset + 1).map(offset => {
            const _isSelected = offset === cursor;

            return (
              <i key={offset} className={cx('label', { selected: _isSelected })} style={{ left: offset * frameWidth }}>
                {offset}
              </i>
            );
          })}
        </div>
      </div>
    );
  };

  const renderRowScrollbar = () => {
    return (
      <div className='row-scroll' style={{ ...rowScrollBox }}>
        <div className='bar' onMouseDown={handleRowBarMouseDown} style={{ ...rowBarBox }} />
      </div>
    );
  };

  const renderColHeader = () => {
    return (
      <div className='col-header' onMouseDown={handleColHeaderMouseDown} style={{ ...colHeaderBox }}>
        <ul className='bar' style={{ transform: scrollTransformY }}>
          {rTree.list.map(t => {
            const _isExpanded = expandedTracks.includes(t.id);
            const _isSelected = selectedTrack === t.key;

            const hasParent = !!t.parentId;
            const hasChildren = !!t.hasChildren;

            const iconEle = t.hasChildren ? (
              _isExpanded ? (
                <MinusSquareOutlined
                  className='icon'
                  onMouseDown={(ev: any) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    toggleExpand(t.key, false);
                  }}
                />
              ) : (
                <PlusSquareOutlined
                  className='icon'
                  onMouseDown={(ev: any) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    toggleExpand(t.key, true);
                  }}
                />
              )
            ) : (
              <i className='icon' />
            );

            return (
              <li
                key={t.id}
                className={cx({ selected: _isSelected, collapsed: !_isExpanded && hasChildren, hasParent })}
                style={{ paddingLeft: t.level * 22 }}
              >
                {hasParent && (
                  <svg className='indicator' viewBox='0 0 16 16' style={{ left: (t.level - 1) * 24 }}>
                    <path d='M 8 0 L 8 8 L 16 8' />
                  </svg>
                )}

                {iconEle}
                <i className='label' title={t.label}>
                  {t.label}
                </i>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  const renderColScrollbar = () => {
    return (
      <div className='col-scroll' style={{ ...colScrollBox }}>
        <div className='bar' onMouseDown={handleColBarMouseDown} style={{ ...colBarBox }} />
      </div>
    );
  };

  const renderFrame = (
    track: ITLRenderingTrack<any, any>,
    key: string,
    offset: number,
    span: number,
    marker: ITLFrame['marker'],
    draggable?: boolean
  ) => {
    let markerEle: any = null;

    if (marker.type === 'img') markerEle = <img className='marker marker-img' src={marker.img} />;
    else if (marker.type === 'text') markerEle = <span className='marker marker-text'>{marker.text}</span>;
    else if (marker.type === 'line') markerEle = <span className='marker marker-line' style={{ color: marker.color }} />;

    return (
      <div
        key={key}
        data-key={key}
        data-track={track.key}
        className={cx('frame', { draggable })}
        style={{ left: offset * frameWidth, width: span * frameWidth }}
        onDragStart={ev => {
          ev.preventDefault();
          ev.stopPropagation();
        }}
      >
        {markerEle}
      </div>
    );
  };

  const renderTrack = (track: ITLRenderingTrack<any, any>, index: number) => {
    const hasChildren = !!track.hasChildren;
    const hasParent = !!track.parentId;
    const collapsed = !expandedTracks.includes(track.id) && track.hasChildren;

    return (
      <section
        key={track.key}
        data-key={track.key}
        className={cx('track', { collapsed, hasChildren, hasParent })}
        style={{ top: index * frameHeight }}
      >
        {track.frameRenderGroups.map(d => renderFrame(track, d.key, d.offset, d.span, d.marker, d.draggable))}
      </section>
    );
  };

  const renderViewport = () => {
    return (
      <div
        className='viewport'
        onMouseDown={handleBodyMouseDown}
        onContextMenu={ev => {
          ev.preventDefault();
          ev.stopPropagation();
        }}
        style={{ ...viewportBox }}
      >
        <div className='grid' style={{ ...calcGridBackground(frameWidth, frameHeight, offsetX, offsetY) }} />
        <div className='cursor'>
          <div className='cursor-x' style={{ left: cursor * frameWidth, width: frameWidth, transform: scrollTransformX }} />
          <div className='cursor-y' style={{ top: sTrackIndex * frameHeight, height: frameHeight, transform: scrollTransformY }} />
        </div>
        <div className='painter' style={{ ...contentBox, transform: scrollTransformXY }}>
          {rTree.list.map(renderTrack)}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={container}
      className={cx('Timeline', className)}
      style={{ width, height, '--frame-width': frameWidth, '--frame-height': frameHeight } as any}
    >
      {renderRowHeader()}
      {renderRowScrollbar()}
      {renderColHeader()}
      {renderColScrollbar()}
      {renderViewport()}
    </div>
  );
};

function isPointInRect(x: number, y: number, rect: { x: number; y: number; width: number; height: number }) {
  return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
}
