import React, { useEffect, useMemo, useRef } from 'react';
import type { Tokens } from '../types';

interface Props {
  html: string;
  css: string;
  js: string;
  tokens: Tokens;
}

export default function PreviewIframe({ html, css, js, tokens }: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const srcDoc = useMemo(() => {
    const safeHTML = html; // for MVP we trust user-provided content
    const safeCSS = css;
    const safeJS = js;
    return `<!doctype html>
<html>
  <head>
    <meta charset=\"UTF-8\" />
    <style>html,body{margin:0;padding:0} ${safeCSS}</style>
  </head>
  <body>
    ${safeHTML}
    <script>
      (function(){
        window.addEventListener('message', function(ev){
          try {
            var data = ev.data || {};
            if (data && data.type === 'setTokens' && data.tokens) {
              var root = document.documentElement;
              var t = data.tokens;
              for (var k in t) {
                if (t.hasOwnProperty(k)) {
                  root.style.setProperty(k, t[k].value);
                }
              }
            }
          } catch (e) { /* noop */ }
        }, false);
      })();
    <\/script>
    <script>
      try { ${safeJS} } catch(e) { console.error(e); }
    <\/script>
  </body>
</html>`;
  }, [html, css, js]);

  // Post token updates without reloading iframe
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;
    iframe.contentWindow.postMessage({ type: 'setTokens', tokens }, '*');
  }, [tokens]);

  return (
    <div className="preview">
      <iframe
        ref={iframeRef}
        title="preview"
        style={{ width: '100%', height: '100%', border: 'none' }}
        sandbox="allow-scripts"
        srcDoc={srcDoc}
      />
    </div>
  );
}
