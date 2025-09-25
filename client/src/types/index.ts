export type TokenType = 'color' | 'spacing' | 'fontSize' | 'fontFamily';

export interface Token {
  name: string; // CSS variable name, e.g., --auto-color-1 or --brand-color
  value: string; // e.g., #ff0000, 16px, 1rem, 'Inter, sans-serif'
  type: TokenType;
  label?: string; // optional friendly label
}

export type Tokens = Record<string, Token>;

export interface ParseResult {
  tokens: Tokens;
  transformedCSS: string; // CSS where static values are replaced by variables
}
