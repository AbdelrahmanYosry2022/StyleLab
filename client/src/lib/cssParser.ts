import postcss from 'postcss';
import type { ParseResult, Tokens, Token, TokenType } from '../types';

const COLOR_PROPS = new Set([
  'color',
  'background-color',
  'border-color',
  'outline-color',
  'fill',
  'stroke',
]);

const SPACING_PROPS = new Set([
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'gap',
  'row-gap',
  'column-gap',
  'border-radius',
]);

const COLOR_HEX_RE = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/;
const COLOR_FUNC_RE = /(rgb|rgba|hsl|hsla)\s*\([^\)]*\)/i;
const SPACING_TOKEN_RE = /(-?\d*\.?\d+)(px|rem|em)\b/;

function isColor(value: string) {
  return COLOR_HEX_RE.test(value) || COLOR_FUNC_RE.test(value) || value === 'currentColor';
}

function extractSingleSpacing(value: string): { num: string; unit: string } | null {
  const matches = value.match(new RegExp(SPACING_TOKEN_RE.source, 'g'));
  if (!matches || matches.length !== 1) return null;
  const m = matches[0].match(SPACING_TOKEN_RE)!;
  return { num: m[1], unit: m[2] };
}

function nextVarName(map: Record<string, number>, type: TokenType): string {
  map[type] = (map[type] || 0) + 1;
  const base = type === 'spacing' ? 'space' : type;
  return `--auto-${base}-${map[type]}`;
}

export function parseCSSAndExtractTokens(cssText: string): ParseResult {
  const root = postcss.parse(cssText);
  const tokens: Tokens = {};
  const counters: Record<string, number> = {};

  // Collect existing custom properties from :root as tokens
  root.walkRules((rule) => {
    const sel = (rule as any).selector as string | undefined;
    if (sel && sel.includes(':root')) {
      rule.walkDecls((decl) => {
        if (decl.prop.startsWith('--')) {
          const val = decl.value.trim();
          let type: TokenType = 'spacing';
          if (isColor(val)) type = 'color';
          else if (SPACING_TOKEN_RE.test(val)) type = 'spacing';
          else if (decl.prop.toLowerCase().includes('font') || /serif|sans-serif|monospace/.test(val)) type = 'fontFamily';
          const token: Token = { name: decl.prop, value: val, type, label: decl.prop.replace(/^--/, '') };
          tokens[decl.prop] = token;
        }
      });
    }
  });

  // Replace static values with auto variables where applicable
  root.walkDecls((decl) => {
    const prop = decl.prop.toLowerCase();
    const value = decl.value.trim();

    if (value.startsWith('var(')) return; // already variable-based

    if (COLOR_PROPS.has(prop) && isColor(value)) {
      const name = nextVarName(counters, 'color');
      tokens[name] = { name, value, type: 'color', label: prop };
      decl.value = `var(${name})`;
      return;
    }

    if (SPACING_PROPS.has(prop)) {
      const s = extractSingleSpacing(value);
      if (s) {
        const name = nextVarName(counters, 'spacing');
        tokens[name] = { name, value: `${s.num}${s.unit}`, type: 'spacing', label: prop };
        decl.value = `var(${name})`;
        return;
      }
    }

    if (prop === 'font-size') {
      const s = extractSingleSpacing(value);
      if (s) {
        const name = nextVarName(counters, 'fontSize');
        tokens[name] = { name, value: `${s.num}${s.unit}`, type: 'fontSize', label: prop };
        decl.value = `var(${name})`;
        return;
      }
    }

    if (prop === 'font-family') {
      // Treat whole font-family list as a token value
      const name = nextVarName(counters, 'fontFamily');
      tokens[name] = { name, value, type: 'fontFamily', label: prop };
      decl.value = `var(${name})`;
      return;
    }
  });

  return { tokens, transformedCSS: root.toString() };
}
