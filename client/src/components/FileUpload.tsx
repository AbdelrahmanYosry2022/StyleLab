import React from 'react';

interface Props {
  html: string;
  css: string;
  js: string;
  onChange: (next: Partial<{ html: string; css: string; js: string }>) => void;
}

export default function FileUpload({ html, css, js, onChange }: Props) {
  const readFile = async (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>, key: 'html'|'css'|'js') => {
    const f = e.target.files?.[0];
    if (!f) return;
    const text = await readFile(f);
    onChange({ [key]: text });
  };

  return (
    <div className="panel">
      <div className="panel__title">File Upload</div>
      <div className="fileupload__grid">
        <div className="fileupload__item">
          <label>HTML</label>
          <input type="file" accept=".html,.htm,.txt" onChange={(e) => handleFile(e, 'html')} />
          <textarea value={html} onChange={(e) => onChange({ html: e.target.value })} />
        </div>
        <div className="fileupload__item">
          <label>CSS</label>
          <input type="file" accept=".css,.txt" onChange={(e) => handleFile(e, 'css')} />
          <textarea value={css} onChange={(e) => onChange({ css: e.target.value })} />
        </div>
        <div className="fileupload__item">
          <label>JS</label>
          <input type="file" accept=".js,.txt" onChange={(e) => handleFile(e, 'js')} />
          <textarea value={js} onChange={(e) => onChange({ js: e.target.value })} />
        </div>
      </div>
    </div>
  );
}
