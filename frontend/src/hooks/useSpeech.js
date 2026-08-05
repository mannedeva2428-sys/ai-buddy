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
  const recognitionRef = useRef(null)

  const SpeechRecognition =
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition)

  const isSupported = Boolean(SpeechRecognition)
  const isTTSSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => {
    if (!isSupported) return

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)

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

  const listen = useCallback(() => {
    if (!isSupported || isListening) return
    setTranscript('')
    recognitionRef.current?.start()
  }, [isSupported, isListening])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  const speak = useCallback(
    (text) => {
      if (!isTTSSupported || !text) return
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
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
    isListening,
    isSpeaking,
    transcript,
    setTranscript,
    listen,
    stopListening,
    speak,
    stopSpeaking,
  }
}
