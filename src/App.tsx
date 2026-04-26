import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Benchmark from './pages/Benchmark'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/benchmark" element={<Benchmark />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
