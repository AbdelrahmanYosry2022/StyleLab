import React from 'react';
import type { Tokens } from '../types';

interface VersionItem {
  id: string;
  name?: string;
  createdAt: string;
  tokens: Tokens;
}

interface Props {
  tokens: Tokens;
  onLoadTokens: (tokens: Tokens) => void;
}

export default function VersionHistory({ tokens, onLoadTokens }: Props) {
  const [versions, setVersions] = React.useState<VersionItem[]>([]);
  const [name, setName] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/versions');
      if (!res.ok) throw new Error('Failed to load versions');
      const data = (await res.json()) as VersionItem[];
      setVersions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    refresh();
  }, []);

  const save = async () => {
    try {
      const res = await fetch('/api/versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name || undefined, tokens }),
      });
      if (!res.ok) throw new Error('Failed to save version');
      setName('');
      await refresh();
    } catch (e) {
      console.error(e);
      alert('Failed to save version');
    }
  };

  return (
    <div className="panel">
      <div className="panel__title">Version History</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input
          type="text"
          placeholder="version name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ flex: 1 }}
        />
        <button onClick={save}>Save Snapshot</button>
        <button onClick={refresh} disabled={loading}>{loading ? 'Loading…' : 'Refresh'}</button>
      </div>
      <div className="version__list">
        {versions.map((v) => (
          <div key={v.id} className="version__item">
            <div>
              <div style={{ fontWeight: 600 }}>{v.name || '(unnamed)'}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{new Date(v.createdAt).toLocaleString()}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => onLoadTokens(v.tokens)}>Load</button>
              <button onClick={() => {
                const content = JSON.stringify(v, null, 2);
                const blob = new Blob([content], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `version-${v.id}.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
              }}>Download</button>
            </div>
          </div>
        ))}
        {versions.length === 0 && <div>No versions yet.</div>}
      </div>
    </div>
  );
}
