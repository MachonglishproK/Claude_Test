import { useState, useEffect } from 'react'
import './App.css'

function App() {
  // Name form state
  const [name, setName] = useState('')

  // Counter state
  const [count, setCount] = useState(0)

  // Memo state with localStorage persistence
  const [memo, setMemo] = useState(() => {
    const saved = localStorage.getItem('memo')
    return saved || ''
  })

  // Save memo to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('memo', memo)
  }, [memo])

  return (
    <div className="app">
      <h1>Hello Claude Code</h1>

      <section className="card">
        <h2>Name Display</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="input-field"
        />
        {name && <p className="greeting">Hello, {name}!</p>}
      </section>

      <section className="card">
        <h2>Counter</h2>
        <div className="counter-controls">
          <button onClick={() => setCount((c) => c - 1)}>-</button>
          <span className="count-display">{count}</span>
          <button onClick={() => setCount((c) => c + 1)}>+</button>
        </div>
        <button className="reset-btn" onClick={() => setCount(0)}>
          Reset
        </button>
      </section>

      <section className="card">
        <h2>Memo (localStorage)</h2>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="Write your memo here... (auto-saved)"
          className="memo-field"
          rows={5}
        />
        <p className="memo-hint">Auto-saved to localStorage</p>
      </section>
    </div>
  )
}

export default App
