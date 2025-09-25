import React, { useEffect, useMemo, useRef, useState } from 'react';
import { parseCSSAndExtractTokens } from './lib/cssParser';
import type { ParseResult, Tokens } from './types';
import FileUpload from './components/FileUpload';
import CSSParserPanel from './components/CSSParser';
import ControlPanel from './components/ControlPanel';
import PreviewIframe from './components/PreviewIframe';
import ExportManager from './components/ExportManager';
import VersionHistory from './components/VersionHistory';

function buildRootVars(tokens: Tokens): string {
  const lines = Object.values(tokens).map((t) => `  ${t.name}: ${t.value};`);
  if (!lines.length) return '';
  return `:root {\n${lines.join('\n')}\n}`;
}

export default function App() {
  const [html, setHtml] = useState<string>(`<section class=\"hero\">\n  <h1>Hello Section</h1>\n  <p>Upload your own to get started.</p>\n  <button>Click me</button>\n</section>`);
  const [css, setCss] = useState<string>(`.hero {\n  background-color: #f5f5f5;\n  color: #333;\n  padding: 24px;\n  border-radius: 12px;\n}\n.hero h1 {\n  font-size: 32px;\n  margin-bottom: 12px;\n}\nbutton {\n  background-color: rgb(0, 120, 255);\n  color: white;\n  padding: 8px 16px;\n  border: none;\n  border-radius: 8px;\n}`);
  const [js, setJs] = useState<string>(`document.addEventListener('click', (e) => {\n  if (e.target && (e.target as HTMLElement).tagName === 'BUTTON') {\n    console.log('Button clicked inside iframe');\n  }\n});`);

  const [parseResult, setParseResult] = useState<ParseResult>({ tokens: {}, transformedCSS: '' });
  const [tokens, setTokens] = useState<Tokens>({});

  // When CSS changes or user clicks parse, update tokens/transformed CSS
  const handleParse = () => {
    const res = parseCSSAndExtractTokens(css);
    setParseResult(res);
    setTokens(res.tokens);
  };

  useEffect(() => {
    // Parse initial CSS once
    handleParse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyTokenChange = (name: string, newValue: string) => {
    setTokens((prev: Tokens) => ({ ...prev, [name]: { ...prev[name], value: newValue } }));
  };

  const effectiveCSS = useMemo(() => {
    const rootVars = buildRootVars(tokens);
    return `${rootVars}\n\n${parseResult.transformedCSS || css}`;
  }, [tokens, parseResult.transformedCSS, css]);

  return (
    <div className="app">
      <header className="app__header">Section Styler MVP</header>
      <main className="app__main">
        <section className="app__left">
          <FileUpload
            html={html}
            css={css}
            js={js}
            onChange={(next) => {
              if (next.html !== undefined) setHtml(next.html);
              if (next.css !== undefined) setCss(next.css);
              if (next.js !== undefined) setJs(next.js);
            }}
          />
          <CSSParserPanel onParse={handleParse} tokens={tokens} css={css} />
          <ExportManager html={html} css={effectiveCSS} js={js} tokens={tokens} />
          <VersionHistory tokens={tokens} onLoadTokens={(t: Tokens) => setTokens(t)} />
        </section>
        <aside className="app__right">
          <ControlPanel tokens={tokens} onChangeToken={applyTokenChange} />
          <PreviewIframe html={html} css={effectiveCSS} js={js} tokens={tokens} />
        </aside>
      </main>
    </div>
  );
}
