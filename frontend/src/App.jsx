import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

   return (
    <div>
      <h1>Nepali Kadam</h1>
      <p>Track your walks and runs.</p>
      <p>Count: {count}</p>
<button onClick={() => setCount(count + 1)}>Add one</button>
    </div>
  )
}

export default App
