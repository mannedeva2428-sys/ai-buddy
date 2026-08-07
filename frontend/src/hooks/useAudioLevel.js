import { useState, useEffect, useRef, useCallback } from 'react'

export function useAudioLevel() {
  const [audioLevel, setAudioLevel] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const audioCtxRef = useRef(null)
  const analyserRef = useRef(null)
  const streamRef = useRef(null)
  const animFrameRef = useRef(null)

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const AudioCtx = window.AudioContext || window.webkitAudioContext
      const ctx = new AudioCtx()
      audioCtxRef.current = ctx

      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 64
      source.connect(analyser)
      analyserRef.current = analyser

      setIsActive(true)

      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      const updateLevel = () => {
        if (!analyserRef.current) return
        analyserRef.current.getByteFrequencyData(dataArray)
        let sum = 0
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i]
        }
        const avg = sum / dataArray.length
        setAudioLevel(avg / 255)
        animFrameRef.current = requestAnimationFrame(updateLevel)
      }

      updateLevel()
    } catch (e) {
      console.warn('Microphone access for AudioContext failed, falling back to simulated input:', e)
      setIsActive(true)
    }
  }, [])

  const stop = useCallback(() => {
    setIsActive(false)
    setAudioLevel(0)

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close()
      audioCtxRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      stop()
    }
  }, [stop])

  return { audioLevel, isActive, start, stop }
}
