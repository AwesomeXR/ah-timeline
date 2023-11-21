import React from 'react';
import { createRoot } from 'react-dom/client';
import { ITLTrack, ITimelineRef, Timeline } from '../src';
import { range } from 'lodash';

const App = () => {
  const ref = React.useRef<ITimelineRef>({} as any);

  const tracks: ITLTrack[] = [
    {
      key: '1',
      label: 'Track 1',
      frames: range(0, 100).map(i => ({ key: i + '', offset: i, marker: { type: 'line' }, data: {} })),
      data: {},
    },
    {
      key: '2',
      label: 'Track 2',
      frames: [
        ...range(10, 20).map(i => ({ key: i + '', offset: i, marker: { type: 'line' as 'line', color: 'red' }, data: {} })),
        ...range(20, 30).map(i => ({ key: i + '', offset: i, marker: { type: 'line' as 'line' }, data: {} })),
        ...range(30, 40).map(i => ({
          key: i + '',
          offset: i,
          color: 'pink',
          marker: { type: 'line' as 'line', color: 'green' },
          data: {},
        })),
      ],
      data: {},
      children: [
        {
          key: '2.1',
          label: 'Track 2.1',
          frames: range(0, 10).map(i => ({ key: i + '', offset: i, marker: { type: 'line' }, data: {} })),
          data: {},
          children: [
            {
              key: '3.1',
              label: 'Track 3.1',
              frames: range(0, 10).map(i => ({ key: i + '', offset: i, marker: { type: 'line' }, data: {} })),
              data: {},
            },
          ],
        },
      ],
    },
    {
      key: '3',
      label: 'Track 3',
      frames: range(10, 30).map(i => ({ key: i + '', offset: i, marker: { type: 'text', text: i + '' }, data: {} })),
      data: {},
    },
    {
      key: '4',
      label: 'Track 4',
      frames: [
        ...range(0, 10).map(i => ({
          key: i + '',
          offset: i,
          marker: { type: 'img' as 'img', img: require('./icon1.png') },
          data: {},
          draggable: true,
        })),
        ...range(10, 15).map(i => ({ key: i + '', offset: i, marker: { type: 'line' as 'line' }, data: {} })),
        ...range(15, 30).map(i => ({ key: i + '', offset: i, marker: { type: 'img' as 'img', img: require('./icon2.png') }, data: {} })),
      ],
      data: {},
    },
    {
      key: '5',
      label: 'Track 5',
      frames: range(1, 30).map(i => ({ key: i + '', offset: i, marker: { type: 'text', text: i + '' }, data: {} })),
      data: {},
    },
    ...range(0, 30).map(i => ({
      key: '_eee_' + i,
      label: 'Track eee ' + i,
      frames: range(10, 20).map(i => ({ key: i + '', offset: i, marker: { type: 'line' as 'line' }, data: {} })),
      data: {},
    })),
  ];

  return (
    <div>
      <header style={{ display: 'flex', height: 64, alignItems: 'center' }}>
        <button onClick={() => ref.current.scrollIntoViewIfNeeded()}>Focus</button>
      </header>

      <Timeline _ref={ref} width={window.innerWidth - 100} height={window.innerHeight - 100} tracks={tracks} />
    </div>
  );
};

const root = createRoot(document.getElementById('app')!);
root.render(<App />);
