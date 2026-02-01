import type { NameDisplayProps } from '../../types'
import './NameDisplay.css'

export function NameDisplay({ name, onNameChange }: NameDisplayProps) {
  return (
    <section className="card">
      <h2>Name Display</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Enter your name"
        className="input-field"
      />
      {name && <p className="greeting">Hello, {name}!</p>}
    </section>
  )
}
