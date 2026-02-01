import type { CounterProps } from '../../types'
import './Counter.css'

export function Counter({ count, onIncrement, onDecrement, onReset }: CounterProps) {
  return (
    <section className="card">
      <h2>Counter</h2>
      <div className="counter-controls">
        <button onClick={onDecrement}>-</button>
        <span className="count-display">{count}</span>
        <button onClick={onIncrement}>+</button>
      </div>
      <button className="reset-btn" onClick={onReset}>
        Reset
      </button>
    </section>
  )
}
