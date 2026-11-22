import { useState } from 'react'
import './App.css'

function App() {
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)

  return (
    <div>
      <h1>Nepali Kadam</h1>
      <p>Time: {seconds}</p>
      <button onClick={() => setRunning(!running)}>
        {running ? 'Pause' : 'Start'}
      </button>
    </div>
  )
}

export default App
