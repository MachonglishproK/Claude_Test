import { useState } from 'react'
import { NameDisplay, Counter, Memo } from './components'
import { useLocalStorage } from './hooks/useLocalStorage'
import './App.css'

function App() {
  const [name, setName] = useState('')
  const [count, setCount] = useState(0)
  const [memo, setMemo] = useLocalStorage('memo', '')

  return (
    <div className="app">
      <h1>Hello Claude Code</h1>

      <NameDisplay name={name} onNameChange={setName} />

      <Counter
        count={count}
        onIncrement={() => setCount((c) => c + 1)}
        onDecrement={() => setCount((c) => c - 1)}
        onReset={() => setCount(0)}
      />

      <Memo memo={memo} onMemoChange={setMemo} />
    </div>
  )
}

export default App
