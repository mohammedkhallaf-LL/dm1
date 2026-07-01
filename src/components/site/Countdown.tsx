'use client'
import { useEffect, useState } from 'react'

export function Countdown({ target }: { target: string }) {
  const [label, setLabel] = useState('')
  useEffect(() => {
    const tick = () => {
      const ms = new Date(target).getTime() - Date.now()
      if (ms <= 0) { setLabel('Live now'); return }
      const days = Math.floor(ms / 86400000)
      const hrs = Math.floor((ms % 86400000) / 3600000)
      setLabel(`${days}d ${hrs}h to go`)
    }
    tick()
    const t = setInterval(tick, 60000)
    return () => clearInterval(t)
  }, [target])
  return <span className="tabular-nums">{label}</span>
}
