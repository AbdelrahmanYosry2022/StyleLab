import React from 'react';
import { downloadMany, downloadText, downloadBlob } from '../utils/download';
import type { Tokens } from '../types';

interface Props {
  html: string;
  css: string;
  js: string;
  tokens: Tokens;
}

export default function ExportManager({ html, css, js, tokens }: Props) {
  const exportSeparate = () => {
    downloadMany([
      { filename: 'section.html', mime: 'text/html;charset=utf-8', content: html },
      { filename: 'styles.css', mime: 'text/css;charset=utf-8', content: css },
      { filename: 'script.js', mime: 'text/javascript;charset=utf-8', content: js },
    ]);
  };

  const exportSingle = async () => {
    try {
      const res = await fetch('/api/export/single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html, css, js }),
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      downloadBlob('section.html', 'text/html;charset=utf-8', blob);
    } catch (e) {
      console.error(e);
      alert('Failed to export single-file HTML');
    }
  };

  const exportZip = async () => {
    try {
      const res = await fetch('/api/export/zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html, css, js, tokens }),
      });
      if (!res.ok) throw new Error('ZIP export failed');
      const blob = await res.blob();
      downloadBlob('section.zip', 'application/zip', blob);
    } catch (e) {
      console.error(e);
      alert('Failed to export ZIP');
    }
  };

  return (
    <div className="panel">
      <div className="panel__title">Export Manager</div>
      <div className="export__row">
        <button onClick={exportSeparate}>Download Separate Files</button>
        <button onClick={exportSingle}>Download Single-File HTML</button>
        <button onClick={exportZip}>Download ZIP</button>
      </div>
    </div>
  );
}
