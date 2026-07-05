/**
 * Detects the likely programming language of a text snippet.
 * Returns a pastebin api_paste_format value, or 'text' if no language detected.
 * Only runs when the current format is 'text' — respects user-chosen formats.
 */
export function detectLanguage(text: string): string {
  if (!text || text.length < 30) return 'text'

  const t = text.trimStart()

  // Definitive markers — check these first
  if (/^<\?php/i.test(t)) return 'php'
  if (/^#!(\/usr\/bin\/env\s+)?(bash|sh|zsh)/m.test(t)) return 'bash'
  if (/^<!DOCTYPE\s+html/i.test(t) || /^<html[\s>]/i.test(t)) return 'html5'

  // JSON — try parsing first few hundred chars
  if ((t.startsWith('{') || t.startsWith('[')) && t.length > 5) {
    try {
      JSON.parse(text)
      return 'json'
    } catch {
      // Not valid JSON, but might still look JSON-like — score it below
    }
  }

  // SQL
  if (/^\s*(SELECT|INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM|CREATE\s+(TABLE|DATABASE|INDEX)|DROP\s+(TABLE|DATABASE)|ALTER\s+TABLE)\s/im.test(t)) {
    return 'sql'
  }

  // YAML — key: value pattern across multiple lines without code-like content
  const yamlLines = t.split('\n').slice(0, 20)
  const yamlKeyCount = yamlLines.filter(l => /^[a-zA-Z_][a-zA-Z0-9_-]*\s*:/.test(l.trim())).length
  if (yamlKeyCount >= 3 && !t.includes('{') && !t.includes('def ') && !t.includes('function')) {
    return 'yaml'
  }

  // Markdown — heading or multiple markdown markers
  const mdMarkers = [/^#{1,6}\s+\w/m, /^\*\*\w/, /\[.+\]\(https?:/m, /^-\s+\w/m, /^>\s+\w/m]
  if (mdMarkers.filter(r => r.test(t)).length >= 2) return 'markdown'

  // Score-based detection for languages that share syntax
  const scores: Record<string, number> = {}

  const add = (lang: string, n: number) => { scores[lang] = (scores[lang] ?? 0) + n }

  // React / JSX — boost JS/TS scores for React code
  if (/from\s+['"]react['"]/.test(t)) add('javascript', 3)
  if (/\buseState\b|\buseEffect\b|\buseRef\b|\buseMemo\b|\buseCallback\b/.test(t)) add('javascript', 2)
  if (/<[A-Z][a-zA-Z]*[\s/>]/.test(t)) add('javascript', 2) // JSX component tags

  // TypeScript (check before JS — TS is a superset)
  if (/\binterface\s+[A-Z]\w*\s*\{/.test(t)) add('typescript', 4)
  if (/\btype\s+\w+\s*=\s/.test(t)) add('typescript', 3)
  if (/:\s*(string|number|boolean|void|never|unknown|any)\b/.test(t)) add('typescript', 2)
  if (/<[A-Z]\w*>|<[A-Z]\w*,/.test(t)) add('typescript', 2)
  if (/as\s+\w+Type|as\s+[A-Z]/.test(t)) add('typescript', 1)

  // JavaScript
  if (/\b(const|let)\s+\w+\s*=/.test(t)) add('javascript', 2)
  if (/\bimport\s+\{/.test(t) || /\bimport\s+\w+\s+from\s+'/.test(t)) add('javascript', 2)
  if (/=>\s*[\({]/.test(t)) add('javascript', 2)
  if (/\bexport\s+(default|const|function|class)\b/.test(t)) add('javascript', 2)
  if (/\bpromise\b|\basync\s+function|\bawait\s+\w/i.test(t)) add('javascript', 1)

  // Python
  if (/^def\s+\w+\s*\(/m.test(t)) add('python', 4)
  if (/^from\s+\w+\s+import\s+/m.test(t) || /^import\s+\w+(\.\w+)*\s*$/m.test(t)) add('python', 3)
  if (/\bself\b/.test(t)) add('python', 2)
  if (/^class\s+\w+(\s*\(.*\))?\s*:/m.test(t)) add('python', 2)
  if (/:\s*$\n\s+/m.test(t) && !/\{/.test(t)) add('python', 1) // colon + indentation, no braces

  // Rust
  if (/\bfn\s+\w+\s*(<.*>)?\s*\(/.test(t)) add('rust', 4)
  if (/\blet\s+mut\s+\w+/.test(t)) add('rust', 3)
  if (/\buse\s+std::/.test(t)) add('rust', 3)
  if (/impl\s+\w+/.test(t)) add('rust', 2)
  if (/\bOption<|Result<|Vec<|HashMap</.test(t)) add('rust', 2)

  // Go
  if (/^package\s+\w+/m.test(t)) add('go', 4)
  if (/\bfunc\s+\w+\s*\(/.test(t)) add('go', 3)
  if (/:=\s/.test(t)) add('go', 2)
  if (/\bfmt\.\w+\(/.test(t)) add('go', 2)
  if (/^import\s+\(\s*\n/m.test(t)) add('go', 2)

  // Java
  if (/\bpublic\s+class\s+\w+/.test(t)) add('java', 4)
  if (/@Override\b/.test(t)) add('java', 3)
  if (/\bSystem\.out\.(print|println)\(/.test(t)) add('java', 3)
  if (/\bimport\s+java\./.test(t)) add('java', 3)

  // Kotlin
  if (/\bfun\s+\w+\s*\(.*\)/.test(t) && !/function/.test(t)) add('kotlin', 4)
  if (/\bdata\s+class\s+\w+/.test(t)) add('kotlin', 4)
  if (/\bval\s+\w+\s*:\s*[A-Z]/.test(t)) add('kotlin', 2)

  // C++
  if (/#include\s*<\w+>/.test(t)) add('cpp', 3)
  if (/std::/.test(t)) add('cpp', 3)
  if (/cout\s*<</.test(t)) add('cpp', 3)
  if (/int\s+main\s*\(/.test(t)) add('cpp', 2)

  // C#
  if (/\busing\s+System/.test(t)) add('csharp', 3)
  if (/\bnamespace\s+\w+/.test(t)) add('csharp', 2)
  if (/Console\.(Write|Read)\w*\(/.test(t)) add('csharp', 3)

  // CSS
  if (/[a-z-]+\s*:\s*[^;{]+;/.test(t) && /\{[^}]+\}/.test(t) && !/{[\s\S]*function/.test(t)) add('css', 3)
  if (/@media\s+/.test(t)) add('css', 3)

  // Ruby
  if (/\bdef\s+\w+[\s\S]*?end\b/.test(t)) add('ruby', 3)
  if (/require\s+'[\w\/]+'/.test(t)) add('ruby', 2)
  if (/\bdo\s*\|[\w,\s]+\|/.test(t)) add('ruby', 3)
  if (/attr_(reader|writer|accessor)\s+:\w+/.test(t)) add('ruby', 3)

  // Swift
  if (/\bvar\s+\w+\s*:\s*[A-Z][a-zA-Z]*\??\s*=/.test(t)) add('swift', 3)
  if (/\bguard\s+let\b/.test(t)) add('swift', 3)
  if (/\bfunc\s+\w+.*->/.test(t)) add('swift', 3)
  if (/@IBOutlet|@IBAction|UIViewController|SwiftUI/.test(t)) add('swift', 4)

  // JSON-like (didn't pass parse above)
  if (/"[\w]+"\s*:\s*("|{|\[|[0-9]|true|false|null)/.test(t)) add('json', 2)

  // Pick winner
  const best = Object.entries(scores).sort(([, a], [, b]) => b - a)[0]
  if (best && best[1] >= 3) {
    // If both typescript and javascript scored, pick typescript if it has more
    if (best[0] === 'javascript' && (scores['typescript'] ?? 0) >= 3) return 'typescript'
    return best[0]
  }

  return 'text'
}
