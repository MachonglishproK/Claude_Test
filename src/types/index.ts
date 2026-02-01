export interface NameDisplayProps {
  name: string
  onNameChange: (name: string) => void
}

export interface CounterProps {
  count: number
  onIncrement: () => void
  onDecrement: () => void
  onReset: () => void
}

export interface MemoProps {
  memo: string
  onMemoChange: (memo: string) => void
}
