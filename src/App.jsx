import './App.css'
import { useEffect, useRef, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'

export default function App() {
  const [currentApp, setCurrentApp] = useState('Detecting...')
  const [usage, setUsage] = useState({})

  const lastApp = useRef(null)
  const lastTime = useRef(Date.now())

  useEffect(() => {
    const interval = setInterval(async () => {
      const app = await invoke('get_active_app')

      const now = Date.now()

      if (lastApp.current && lastApp.current !== app) {
        const diff = Math.floor((now - lastTime.current) / 1000)

        setUsage(prev => ({
          ...prev,
          [lastApp.current]: (prev[lastApp.current] || 0) + diff
        }))

        lastTime.current = now
      }

      lastApp.current = app
      setCurrentApp(app || 'Unknown')
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      <h1 className="text-xl mb-4">
        Active App: <span className="text-emerald-400">{currentApp}</span>
      </h1>

      <h2 className="text-lg mb-2">Usage</h2>

      <ul className="space-y-2">
        {Object.entries(usage).map(([app, time]) => (
          <li key={app} className="flex justify-between bg-zinc-800 p-2 rounded">
            <span>{app}</span>
            <span>{time}s</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
