import React from 'react';
import type { Tokens, Token } from '../types';

interface Props {
  tokens: Tokens;
  onChangeToken: (name: string, newValue: string) => void;
}

const FONT_FAMILIES = [
  'Inter, sans-serif',
  'system-ui, sans-serif',
  'Arial, sans-serif',
  'Helvetica, sans-serif',
  'Georgia, serif',
  'Times New Roman, serif',
  'Courier New, monospace',
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
];

const SPACING_RE = /^(-?\d*\.?\d+)(px|rem|em)$/;

function SpacingControl({ token, onChange }: { token: Token; onChange: (v: string) => void }) {
  const m = token.value.match(SPACING_RE);
  const [num, setNum] = React.useState<string>(m ? m[1] : '16');
  const [unit, setUnit] = React.useState<string>(m ? m[2] : 'px');

  React.useEffect(() => {
    const mm = token.value.match(SPACING_RE);
    if (mm) {
      setNum(mm[1]);
      setUnit(mm[2]);
    }
  }, [token.value]);

  return (
    <div className="control__row">
      <div>{token.label || token.name}</div>
      <input
        type="range"
        min={unit === 'px' ? -64 : -4}
        max={unit === 'px' ? 128 : 8}
        step={unit === 'px' ? 1 : 0.1}
        value={parseFloat(num) || 0}
        onChange={(e) => {
          const v = e.target.value;
          setNum(v);
          onChange(`${v}${unit}`);
        }}
      />
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          type="number"
          value={num}
          onChange={(e) => {
            const v = e.target.value;
            setNum(v);
            onChange(`${v}${unit}`);
          }}
          style={{ width: 70 }}
        />
        <select
          value={unit}
          onChange={(e) => {
            const u = e.target.value;
            setUnit(u);
            onChange(`${num}${u}`);
          }}
        >
          <option value="px">px</option>
          <option value="rem">rem</option>
          <option value="em">em</option>
        </select>
      </div>
    </div>
  );
}

function ColorControl({ token, onChange }: { token: Token; onChange: (v: string) => void }) {
  const [text, setText] = React.useState(token.value);
  React.useEffect(() => setText(token.value), [token.value]);
  return (
    <div className="control__row">
      <div>{token.label || token.name}</div>
      <input
        type="color"
        value={/^#([0-9a-fA-F]{3,8})$/.test(token.value) ? token.value : '#000000'}
        onChange={(e) => {
          setText(e.target.value);
          onChange(e.target.value);
        }}
      />
      <input
        type="text"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onChange(e.target.value);
        }}
      />
    </div>
  );
}

function FontSizeControl({ token, onChange }: { token: Token; onChange: (v: string) => void }) {
  return <SpacingControl token={token} onChange={onChange} />;
}

function FontFamilyControl({ token, onChange }: { token: Token; onChange: (v: string) => void }) {
  const [text, setText] = React.useState(token.value);
  React.useEffect(() => setText(token.value), [token.value]);
  return (
    <div className="control__row">
      <div>{token.label || token.name}</div>
      <select
        value={FONT_FAMILIES.includes(token.value) ? token.value : ''}
        onChange={(e) => {
          const v = e.target.value;
          setText(v);
          onChange(v);
        }}
      >
        <option value="">Custom…</option>
        {FONT_FAMILIES.map((f) => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>
      <input
        type="text"
        placeholder="custom font-family"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onChange(e.target.value);
        }}
      />
    </div>
  );
}

export default function ControlPanel({ tokens, onChangeToken }: Props) {
  const groups = React.useMemo(() => {
    const g: Record<string, Token[]> = { color: [], spacing: [], fontSize: [], fontFamily: [] } as any;
    Object.values(tokens).forEach((t) => g[t.type].push(t));
    return g;
  }, [tokens]);

  return (
    <div className="panel">
      <div className="panel__title">Control Panel</div>
      <div className="controls__list">
        {groups.color.length > 0 && <div style={{ fontWeight: 600 }}>Colors</div>}
        {groups.color.map((t) => (
          <ColorControl key={t.name} token={t} onChange={(v) => onChangeToken(t.name, v)} />
        ))}

        {groups.spacing.length > 0 && <div style={{ fontWeight: 600 }}>Spacing</div>}
        {groups.spacing.map((t) => (
          <SpacingControl key={t.name} token={t} onChange={(v) => onChangeToken(t.name, v)} />
        ))}

        {groups.fontSize.length > 0 && <div style={{ fontWeight: 600 }}>Font Size</div>}
        {groups.fontSize.map((t) => (
          <FontSizeControl key={t.name} token={t} onChange={(v) => onChangeToken(t.name, v)} />
        ))}

        {groups.fontFamily.length > 0 && <div style={{ fontWeight: 600 }}>Font Family</div>}
        {groups.fontFamily.map((t) => (
          <FontFamilyControl key={t.name} token={t} onChange={(v) => onChangeToken(t.name, v)} />
        ))}

        {Object.keys(tokens).length === 0 && <div>No tokens yet. Parse CSS to generate controls.</div>}
      </div>
    </div>
  );
}
