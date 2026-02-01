import type { MemoProps } from '../../types'
import './Memo.css'

export function Memo({ memo, onMemoChange }: MemoProps) {
  return (
    <section className="card">
      <h2>Memo (localStorage)</h2>
      <textarea
        value={memo}
        onChange={(e) => onMemoChange(e.target.value)}
        placeholder="Write your memo here... (auto-saved)"
        className="memo-field"
        rows={5}
      />
      <p className="memo-hint">Auto-saved to localStorage</p>
    </section>
  )
}
