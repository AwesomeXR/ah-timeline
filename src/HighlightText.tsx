import React, { useMemo } from 'react';
import cx from 'classnames';
import { escapeRegExp, flatten } from 'lodash';

export interface IHighlightTextProps {
  className?: string;
  style?: React.CSSProperties;

  text: string;
  highlight?: string;
}

export const HighlightText = ({ className, style, text, highlight }: IHighlightTextProps) => {
  const children = useMemo(() => {
    // 高亮 highlight 匹配的字符串
    if (!highlight) return text;

    const reg = new RegExp(escapeRegExp(highlight), 'gi');
    const _match = text.match(reg);
    if (!_match) return text;

    const _highlight = _match[0];
    const segs = text.split(reg);

    const _eleList = [
      ...flatten(
        segs.slice(0, segs.length - 1).map((s, i) => {
          const _m = <mark key={'m' + i}>{_highlight}</mark>;
          if (!s) return [_m];
          return [<span key={'s' + i}>{s}</span>, _m];
        })
      ),
      <span key={'s' + (segs.length - 1)}>{segs[segs.length - 1]}</span>,
    ];

    return _eleList;
  }, [text, highlight]);

  return (
    <span className={cx(className)} style={style} title={text}>
      {children}
    </span>
  );
};
