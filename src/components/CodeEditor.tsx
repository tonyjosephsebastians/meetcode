import Editor from '@monaco-editor/react'
import type { Lang } from '@/lib/types'

const LANGUAGE_MAP: Record<Lang, string> = {
  ts: 'typescript',
  js: 'javascript',
}

interface CodeEditorProps {
  value: string
  lang: Lang
  onChange: (value: string) => void
  height?: number | string
}

export default function CodeEditor({ value, lang, onChange, height = 480 }: CodeEditorProps) {
  return (
    <div className="monaco-editor">
      <Editor
        theme="vs-dark"
        value={value}
        height={height}
        language={LANGUAGE_MAP[lang]}
        onChange={(nextValue) => onChange(nextValue ?? '')}
        options={{
          minimap: { enabled: false },
          fontFamily: 'JetBrains Mono, SFMono-Regular, ui-monospace, monospace',
          fontSize: 14,
          lineNumbersMinChars: 3,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          automaticLayout: true,
        }}
        loading={<div style={{ padding: '1rem' }}>Loading editor…</div>}
      />
    </div>
  )
}
