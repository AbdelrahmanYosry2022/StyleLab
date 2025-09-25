import React from 'react';
import type { Tokens } from '../types';

interface Props {
  css: string;
  tokens: Tokens;
  onParse: () => void;
}

export default function CSSParserPanel({ css, tokens, onParse }: Props) {
  const counts = React.useMemo(() => {
    const c = { color: 0, spacing: 0, fontSize: 0, fontFamily: 0 } as Record<string, number>;
    Object.values(tokens).forEach((t) => { c[t.type] = (c[t.type] || 0) + 1; });
    return c;
  }, [tokens]);

  return (
    <div className="panel">
      <div className="panel__title">CSS Parser</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        <button onClick={onParse}>Parse CSS</button>
        <div>Tokens: colors {counts.color} · spacing {counts.spacing} · fontSize {counts.fontSize} · fontFamily {counts.fontFamily}</div>
      </div>
      <div className="tokens__list">
        {Object.values(tokens).map((t) => (
          <div key={t.name} className="token__item">
            <div><strong>{t.name}</strong></div>
            <div>type: {t.type}</div>
            <div>value: {t.value}</div>
          </div>
        ))}
        {Object.keys(tokens).length === 0 && <div>No tokens detected yet. Click Parse CSS.</div>}
      </div>
    </div>
  );
}
