import { EditorView, lineNumbers, drawSelection, keymap } from '@codemirror/view'
import { EditorState, Compartment, Extension } from '@codemirror/state'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { syntaxHighlighting, HighlightStyle, defaultHighlightStyle, bracketMatching, indentOnInput } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { oneDark } from '@codemirror/theme-one-dark'

// Eagerly imported language grammars — no dynamic import() issues in Chrome extensions
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { css } from '@codemirror/lang-css'
import { html } from '@codemirror/lang-html'
import { json } from '@codemirror/lang-json'
import { rust } from '@codemirror/lang-rust'
import { sql } from '@codemirror/lang-sql'
import { go } from '@codemirror/lang-go'

// Xcode-inspired light syntax highlight style
const lightHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: '#ad3da4' },
  { tag: tags.controlKeyword, color: '#ad3da4' },
  { tag: tags.operatorKeyword, color: '#ad3da4' },
  { tag: tags.definitionKeyword, color: '#ad3da4' },
  { tag: tags.modifier, color: '#ad3da4' },
  { tag: tags.string, color: '#c41a16' },
  { tag: tags.special(tags.string), color: '#c41a16' },
  { tag: tags.regexp, color: '#c41a16' },
  { tag: tags.comment, color: '#5c7a3e', fontStyle: 'italic' },
  { tag: tags.lineComment, color: '#5c7a3e', fontStyle: 'italic' },
  { tag: tags.blockComment, color: '#5c7a3e', fontStyle: 'italic' },
  { tag: tags.number, color: '#1c00cf' },
  { tag: tags.bool, color: '#1c00cf' },
  { tag: tags.null, color: '#1c00cf' },
  { tag: tags.typeName, color: '#3900a0' },
  { tag: tags.className, color: '#3900a0' },
  { tag: tags.namespace, color: '#3900a0' },
  { tag: tags.function(tags.variableName), color: '#0b4f79' },
  { tag: tags.function(tags.propertyName), color: '#0b4f79' },
  { tag: tags.definition(tags.variableName), color: '#0b4f79' },
  { tag: tags.attributeName, color: '#994500' },
  { tag: tags.attributeValue, color: '#c41a16' },
  { tag: tags.tagName, color: '#ad3da4' },
])

// Returns the per-theme extension: dark gets one-dark, light gets Xcode-style highlighting
export function getThemeExtension(dark: boolean): Extension {
  return dark ? oneDark : syntaxHighlighting(lightHighlightStyle)
}

// Pre-built language extensions keyed by language id
const LANGUAGES: Record<string, Extension> = {
  javascript: javascript({ jsx: false, typescript: false }),
  typescript: javascript({ jsx: false, typescript: true }),
  jsx: javascript({ jsx: true, typescript: false }),
  tsx: javascript({ jsx: true, typescript: true }),
  python: python(),
  css: css(),
  html5: html(),
  html: html(),
  json: json(),
  rust: rust(),
  sql: sql(),
  mysql: sql(),
  go: go(),
}

// Pastebin format value → language key
const FORMAT_TO_LANG: Record<string, string> = {
  html5: 'html5',
  html: 'html',
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  css: 'css',
  json: 'json',
  rust: 'rust',
  sql: 'sql',
  mysql: 'mysql',
  go: 'go',
}

function hasJsxPatterns(code: string): boolean {
  return (
    /<[A-Z][a-zA-Z]*[\s/>]/.test(code) ||
    /<\/[A-Z][a-zA-Z]*>/.test(code) ||
    /return\s*\(\s*</.test(code) ||
    /from\s+['"]react['"]/.test(code)
  )
}

export function getLangKey(format: string, code: string): string {
  let key = FORMAT_TO_LANG[format] ?? 'text'
  if (key === 'typescript' && hasJsxPatterns(code)) return 'tsx'
  if (key === 'javascript' && hasJsxPatterns(code)) return 'jsx'
  return key
}

/** Returns the language extension for the given key, or null for unsupported formats. */
export function getLanguage(langKey: string): Extension | null {
  return LANGUAGES[langKey] ?? null
}

export { EditorView, EditorState, Compartment }
export type { Extension }

export const languageCompartment = new Compartment()
export const themeCompartment = new Compartment()

export function buildBaseExtensions(dark: boolean, lang?: Extension | null): Extension[] {
  return [
    lineNumbers(),
    drawSelection(),
    history(),
    bracketMatching(),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
    themeCompartment.of(getThemeExtension(dark)),
    languageCompartment.of(lang ?? []),
    EditorView.theme({
      '&': {
        height: '100%',
        fontSize: '13px',
        fontFamily: 'Menlo, SF Mono, "Fira Code", monospace',
      },
      '.cm-scroller': {
        fontFamily: 'Menlo, SF Mono, "Fira Code", monospace',
        lineHeight: '1.625',
        overflow: 'auto',
      },
      '.cm-content': { padding: '14px 0' },
      '.cm-line': { padding: '0 16px' },
      '.cm-gutters': {
        backgroundColor: 'transparent',
        border: 'none',
        padding: '0 4px',
        minWidth: '0',
      },
      '.cm-lineNumbers .cm-gutterElement': {
        color: 'var(--color-text-muted)',
        opacity: '0.4',
        fontSize: '11px',
        lineHeight: '1.625',
        paddingRight: '6px',
        paddingLeft: '4px',
      },
      '.cm-activeLineGutter': { backgroundColor: 'transparent' },
      '.cm-activeLine': { backgroundColor: 'transparent' },
      '&.cm-focused': { outline: 'none' },
      '&.cm-focused .cm-activeLine': { backgroundColor: 'rgba(0,0,0,0.025)' },
    }),
    EditorView.lineWrapping,
  ]
}
