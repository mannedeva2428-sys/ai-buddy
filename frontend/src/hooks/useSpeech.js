import { useState, useRef, useCallback, useEffect } from 'react'

/**
 * useSpeech
 *
 * A small wrapper around the browser's built-in Web Speech API, giving us:
 *  - Speech-to-Text (SpeechRecognition): listen() / stopListening()
 *  - Text-to-Speech (SpeechSynthesis): speak(text) / stopSpeaking()
 *
 * No external services or API keys are required — this runs entirely in
 * the browser. It works best in Chrome/Edge. Not all browsers support
 * SpeechRecognition (notably Firefox), so we expose `isSupported`.
 */
export function useSpeech() {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)

  const SpeechRecognition =
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition)

  const isSupported = Boolean(SpeechRecognition)
  const isTTSSupported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const isSecureOrigin =
    typeof window !== 'undefined' &&
    (window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1')

  useEffect(() => {
    if (!isSupported) return

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
    }
    recognition.onend = () => setIsListening(false)
    recognition.onerror = (event) => {
      setIsListening(false)
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError(
          'Microphone permission blocked. On non-localhost HTTP, Chrome requires allowing microphone permissions in site settings or configuring chrome://flags/#unsafely-treat-insecure-origin-as-secure.'
        )
      } else if (event.error !== 'no-speech') {
        setError(`Speech recognition issue: ${event.error}`)
      }
    }

    recognition.onresult = (event) => {
      let finalText = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        finalText += event.results[i][0].transcript
      }
      setTranscript(finalText)
    }

    recognitionRef.current = recognition

    return () => {
      recognition.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported])

  const listen = useCallback(async () => {
    if (!isSupported || isListening) return
    setError(null)
    setTranscript('')

    if (!isSecureOrigin) {
      setError(
        'Microphone is blocked because you connected via HTTP on an IP address. Browsers require HTTPS or chrome://flags for microphone access over network IP.'
      )
      return
    }

    try {
      if (navigator?.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach((track) => track.stop())
      }
      recognitionRef.current?.start()
    } catch (err) {
      console.error('Microphone permission error:', err)
      setError(
        'Microphone permission denied! Please tap the lock icon next to the URL bar, allow Microphone access, and refresh.'
      )
    }
  }, [isSupported, isListening, isSecureOrigin])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  const speak = useCallback(
    (text) => {
      if (!isTTSSupported || !text) return
      window.speechSynthesis.cancel()
      const cleanText = text.replace(/\*\*/g, '')
      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.rate = 1
      utterance.pitch = 1
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
    },
    [isTTSSupported]
  )

  const stopSpeaking = useCallback(() => {
    if (isTTSSupported) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [isTTSSupported])

  return {
    isSupported,
    isTTSSupported,
    isSecureOrigin,
    isListening,
    isSpeaking,
    transcript,
    error,
    setError,
    setTranscript,
    listen,
    stopListening,
    speak,
    stopSpeaking,
  }
}
