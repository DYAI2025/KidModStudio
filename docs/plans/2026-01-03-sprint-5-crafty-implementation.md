# Sprint 5: Crafty LLM Voice Assistant - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Vollständiger Voice-Chat-Assistent "Crafty" mit lokalem LLM, Echtzeit-Sprache und Tool-Ausführung für KidModStudio.

**Architecture:** React CraftyPanel kommuniziert via WebSocket mit RealtimeVoiceChat Python-Backend. Backend nutzt Ollama für LLM, Whisper für STT, Kokoro/Coqui für TTS. Tool-Calls werden via IPC an Electron Main weitergeleitet.

**Tech Stack:** TypeScript, React, Python, FastAPI, WebSocket, Ollama, RealtimeSTT, RealtimeTTS

---

## Task 1: CraftyPanel UI Grundstruktur

**Files:**
- Create: `packages/renderer/src/components/CraftyPanel/CraftyPanel.tsx`
- Create: `packages/renderer/src/components/CraftyPanel/CraftyPanel.css`
- Create: `packages/renderer/src/components/CraftyPanel/index.ts`
- Modify: `packages/renderer/src/App.tsx`

**Step 1: Create CraftyPanel component**

```tsx
// packages/renderer/src/components/CraftyPanel/CraftyPanel.tsx
import { FC, useState } from 'react'
import './CraftyPanel.css'

export type CraftyStatus = 'idle' | 'listening' | 'processing' | 'speaking'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  action?: { type: string; success: boolean }
}

const CraftyPanel: FC = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const [status, setStatus] = useState<CraftyStatus>('idle')
  const [isListening, setIsListening] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])

  const statusText: Record<CraftyStatus, string> = {
    idle: 'Klicken zum Sprechen',
    listening: 'Crafty hört zu...',
    processing: 'Crafty denkt...',
    speaking: 'Crafty spricht...'
  }

  const handleMicToggle = () => {
    setIsListening(!isListening)
    setStatus(isListening ? 'idle' : 'listening')
  }

  if (!isOpen) {
    return (
      <button className="crafty-fab" onClick={() => setIsOpen(true)}>
        🤖
      </button>
    )
  }

  if (isMinimized) {
    return (
      <div className="crafty-panel minimized">
        <div className="crafty-header">
          <span>🤖 Crafty</span>
          <div className="crafty-header-buttons">
            <button onClick={() => setIsMinimized(false)}>▢</button>
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="crafty-panel">
      <div className="crafty-header">
        <span>🤖 Crafty</span>
        <div className="crafty-header-buttons">
          <button onClick={() => setIsMinimized(true)}>─</button>
          <button onClick={() => setIsOpen(false)}>×</button>
        </div>
      </div>

      <div className="crafty-waveform">
        <div className={`waveform-bars ${status === 'listening' || status === 'speaking' ? 'active' : ''}`}>
          {[...Array(20)].map((_, i) => (
            <div key={i} className="waveform-bar" style={{ animationDelay: `${i * 0.05}s` }} />
          ))}
        </div>
      </div>

      <div className="crafty-status">
        <span className={`status-dot ${status}`} />
        {statusText[status]}
      </div>

      <div className="crafty-chat">
        {messages.length === 0 ? (
          <div className="crafty-empty">
            Hallo! Ich bin Crafty. Klicke auf das Mikrofon und sag mir, was du bauen möchtest!
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`chat-message ${msg.role}`}>
              <span className="chat-icon">{msg.role === 'user' ? '🧒' : '🤖'}</span>
              <div className="chat-content">
                <p>{msg.content}</p>
                {msg.action && (
                  <div className={`chat-action ${msg.action.success ? 'success' : 'error'}`}>
                    {msg.action.success ? '✓' : '✗'} {msg.action.type}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="crafty-controls">
        <button
          className={`mic-button ${isListening ? 'active' : ''} ${status}`}
          onClick={handleMicToggle}
        >
          🎤
        </button>
        <span className="mic-hint">
          {isListening ? 'Klicken zum Stoppen' : 'Klicken zum Sprechen'}
        </span>
      </div>
    </div>
  )
}

export default CraftyPanel
```

**Step 2: Create CSS styles**

```css
/* packages/renderer/src/components/CraftyPanel/CraftyPanel.css */

/* Floating Action Button when closed */
.crafty-fab {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  font-size: 24px;
  z-index: 1000;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  cursor: pointer;
  transition: all 0.3s ease;
}

.crafty-fab:hover {
  transform: scale(1.1);
  box-shadow: var(--accent-glow);
}

/* Main Panel */
.crafty-panel {
  position: fixed;
  right: 16px;
  top: 92px;
  bottom: 16px;
  width: 320px;
  z-index: 50;
  display: flex;
  flex-direction: column;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  border-radius: 16px;
  overflow: hidden;
}

.crafty-panel.minimized {
  bottom: auto;
  height: auto;
}

/* Header */
.crafty-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--glass-border);
  font-weight: 600;
  color: var(--text-primary);
}

.crafty-header-buttons {
  display: flex;
  gap: 8px;
}

.crafty-header-buttons button {
  width: 28px;
  height: 28px;
  padding: 0;
  font-size: 14px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-muted);
}

.crafty-header-buttons button:hover {
  background: rgba(255, 255, 255, 0.2);
  color: var(--text-primary);
  transform: none;
  box-shadow: none;
}

/* Waveform */
.crafty-waveform {
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
}

.waveform-bars {
  display: flex;
  gap: 3px;
  align-items: center;
  height: 40px;
}

.waveform-bar {
  width: 4px;
  height: 8px;
  background: var(--accent);
  border-radius: 2px;
  opacity: 0.3;
  transition: height 0.1s ease;
}

.waveform-bars.active .waveform-bar {
  animation: waveform 0.5s ease-in-out infinite alternate;
  opacity: 1;
}

@keyframes waveform {
  0% { height: 8px; }
  100% { height: 35px; }
}

/* Status */
.crafty-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #666;
}

.status-dot.idle { background: #666; }
.status-dot.listening { background: var(--accent); animation: pulse 1s infinite; }
.status-dot.processing { background: #fbbf24; animation: pulse 0.5s infinite; }
.status-dot.speaking { background: #3b82f6; animation: pulse 1s infinite; }

/* Chat Area */
.crafty-chat {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.crafty-empty {
  color: var(--text-muted);
  text-align: center;
  padding: 20px;
  font-size: 0.9rem;
  line-height: 1.5;
}

.chat-message {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.chat-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.chat-content {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 0.9rem;
  line-height: 1.4;
}

.chat-message.user .chat-content {
  background: rgba(80, 200, 120, 0.15);
  border: 1px solid rgba(80, 200, 120, 0.3);
}

.chat-message.assistant .chat-content {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-content p {
  margin: 0;
}

.chat-action {
  margin-top: 8px;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
}

.chat-action.success {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.chat-action.error {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

/* Controls */
.crafty-controls {
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border-top: 1px solid var(--glass-border);
}

.mic-button {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.mic-button.idle {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.mic-button.active,
.mic-button.listening {
  background: rgba(80, 200, 120, 0.3);
  border-color: var(--accent);
  box-shadow: 0 0 20px rgba(80, 200, 120, 0.5);
  animation: pulse 1.5s infinite;
}

.mic-button.processing {
  background: rgba(251, 191, 36, 0.3);
  border-color: #fbbf24;
}

.mic-button.speaking {
  background: rgba(59, 130, 246, 0.3);
  border-color: #3b82f6;
}

.mic-hint {
  font-size: 0.8rem;
  color: var(--text-muted);
}
```

**Step 3: Create index export**

```ts
// packages/renderer/src/components/CraftyPanel/index.ts
export { default } from './CraftyPanel'
export type { CraftyStatus } from './CraftyPanel'
```

**Step 4: Add CraftyPanel to App.tsx**

Modify `packages/renderer/src/App.tsx`:

```tsx
// Add import at top
import CraftyPanel from './components/CraftyPanel'

// Add before closing </div> of app
      <CraftyPanel />
    </div>
  )
}
```

**Step 5: Verify it compiles**

Run: `pnpm typecheck`
Expected: No errors

**Step 6: Commit**

```bash
git add packages/renderer/src/components/CraftyPanel/
git add packages/renderer/src/App.tsx
git commit -m "feat(crafty): add CraftyPanel UI component

- Glassmorphism panel with header, minimize, close
- Waveform visualization placeholder
- Chat history display
- Mic toggle button with status states
- Responsive CSS with animations"
```

---

## Task 2: useCrafty WebSocket Hook

**Files:**
- Create: `packages/renderer/src/hooks/useCrafty.ts`
- Create: `packages/renderer/src/hooks/useCrafty.test.ts`

**Step 1: Create the hook**

```ts
// packages/renderer/src/hooks/useCrafty.ts
import { useState, useCallback, useRef, useEffect } from 'react'

export type CraftyStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'error'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  action?: { type: string; success: boolean }
}

export interface ToolCall {
  id: string
  name: string
  args: Record<string, unknown>
}

export interface UseCraftyOptions {
  wsUrl?: string
  onToolCall?: (toolCall: ToolCall) => Promise<unknown>
  onConfirmation?: (action: string, code?: string) => Promise<boolean>
}

export interface UseCraftyReturn {
  status: CraftyStatus
  isConnected: boolean
  isListening: boolean
  messages: ChatMessage[]
  currentTranscript: string
  error: string | null
  connect: () => void
  disconnect: () => void
  toggleListening: () => void
  sendConfirmation: (approved: boolean) => void
}

export function useCrafty(options: UseCraftyOptions = {}): UseCraftyReturn {
  const {
    wsUrl = 'ws://localhost:8765',
    onToolCall,
    onConfirmation
  } = options

  const [status, setStatus] = useState<CraftyStatus>('idle')
  const [isConnected, setIsConnected] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    try {
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        setIsConnected(true)
        setError(null)
        console.log('Crafty WebSocket connected')
      }

      ws.onclose = () => {
        setIsConnected(false)
        setIsListening(false)
        setStatus('idle')
        console.log('Crafty WebSocket disconnected')
      }

      ws.onerror = () => {
        setError('Verbindung zu Crafty fehlgeschlagen')
        setStatus('error')
      }

      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data)

        switch (data.type) {
          case 'status':
            setStatus(data.state as CraftyStatus)
            break

          case 'transcript':
            if (data.final) {
              setMessages(prev => [...prev, {
                id: crypto.randomUUID(),
                role: 'user',
                content: data.text,
                timestamp: new Date()
              }])
              setCurrentTranscript('')
            } else {
              setCurrentTranscript(data.text)
            }
            break

          case 'response_chunk':
            setMessages(prev => {
              const last = prev[prev.length - 1]
              if (last?.role === 'assistant' && !last.action) {
                return [...prev.slice(0, -1), { ...last, content: last.content + data.text }]
              }
              return [...prev, {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: data.text,
                timestamp: new Date()
              }]
            })
            break

          case 'tool_call':
            if (onToolCall) {
              try {
                const result = await onToolCall(data as ToolCall)
                ws.send(JSON.stringify({
                  type: 'tool_result',
                  id: data.id,
                  result
                }))
                setMessages(prev => {
                  const last = prev[prev.length - 1]
                  if (last?.role === 'assistant') {
                    return [...prev.slice(0, -1), {
                      ...last,
                      action: { type: data.name, success: true }
                    }]
                  }
                  return prev
                })
              } catch (err) {
                ws.send(JSON.stringify({
                  type: 'tool_result',
                  id: data.id,
                  error: String(err)
                }))
              }
            }
            break

          case 'confirmation_request':
            if (onConfirmation) {
              const approved = await onConfirmation(data.action, data.code)
              ws.send(JSON.stringify({
                type: 'user_confirmation',
                approved
              }))
            }
            break

          case 'audio_chunk':
            // Handle TTS audio playback
            playAudioChunk(data.data)
            break
        }
      }

      wsRef.current = ws
    } catch (err) {
      setError('WebSocket Fehler: ' + String(err))
    }
  }, [wsUrl, onToolCall, onConfirmation])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }
    setIsConnected(false)
    setIsListening(false)
  }, [])

  const toggleListening = useCallback(async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      connect()
      return
    }

    if (isListening) {
      // Stop listening
      wsRef.current.send(JSON.stringify({ type: 'toggle_listening', active: false }))
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop())
        mediaStreamRef.current = null
      }
      setIsListening(false)
      setStatus('idle')
    } else {
      // Start listening
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        mediaStreamRef.current = stream

        audioContextRef.current = new AudioContext()
        const source = audioContextRef.current.createMediaStreamSource(stream)
        const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1)

        source.connect(processor)
        processor.connect(audioContextRef.current.destination)

        processor.onaudioprocess = (e) => {
          if (wsRef.current?.readyState === WebSocket.OPEN && isListening) {
            const audioData = e.inputBuffer.getChannelData(0)
            const base64 = arrayBufferToBase64(audioData.buffer)
            wsRef.current.send(JSON.stringify({
              type: 'audio_chunk',
              data: base64
            }))
          }
        }

        wsRef.current.send(JSON.stringify({ type: 'toggle_listening', active: true }))
        setIsListening(true)
        setStatus('listening')
      } catch (err) {
        setError('Mikrofon-Zugriff verweigert')
      }
    }
  }, [isListening, connect])

  const sendConfirmation = useCallback((approved: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'user_confirmation',
        approved
      }))
    }
  }, [])

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    status,
    isConnected,
    isListening,
    messages,
    currentTranscript,
    error,
    connect,
    disconnect,
    toggleListening,
    sendConfirmation
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function playAudioChunk(base64: string): void {
  // Decode and play audio chunk
  const audioContext = new AudioContext()
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  audioContext.decodeAudioData(bytes.buffer, (buffer) => {
    const source = audioContext.createBufferSource()
    source.buffer = buffer
    source.connect(audioContext.destination)
    source.start()
  })
}

export default useCrafty
```

**Step 2: Create test file**

```ts
// packages/renderer/src/hooks/useCrafty.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCrafty } from './useCrafty'

// Mock WebSocket
class MockWebSocket {
  static OPEN = 1
  readyState = MockWebSocket.OPEN
  onopen: (() => void) | null = null
  onclose: (() => void) | null = null
  onmessage: ((event: { data: string }) => void) | null = null
  onerror: (() => void) | null = null
  send = vi.fn()
  close = vi.fn()

  constructor() {
    setTimeout(() => this.onopen?.(), 0)
  }
}

beforeEach(() => {
  vi.stubGlobal('WebSocket', MockWebSocket)
  vi.stubGlobal('navigator', {
    mediaDevices: {
      getUserMedia: vi.fn().mockResolvedValue({
        getTracks: () => [{ stop: vi.fn() }]
      })
    }
  })
})

describe('useCrafty', () => {
  it('should initialize with idle status', () => {
    const { result } = renderHook(() => useCrafty())
    expect(result.current.status).toBe('idle')
    expect(result.current.isConnected).toBe(false)
    expect(result.current.isListening).toBe(false)
  })

  it('should connect to WebSocket', async () => {
    const { result } = renderHook(() => useCrafty())

    act(() => {
      result.current.connect()
    })

    // Wait for onopen callback
    await vi.waitFor(() => {
      expect(result.current.isConnected).toBe(true)
    })
  })

  it('should handle status updates', async () => {
    const { result } = renderHook(() => useCrafty())

    act(() => {
      result.current.connect()
    })

    await vi.waitFor(() => expect(result.current.isConnected).toBe(true))
  })

  it('should add messages from transcripts', () => {
    const { result } = renderHook(() => useCrafty())
    expect(result.current.messages).toEqual([])
  })
})
```

**Step 3: Verify tests pass**

Run: `pnpm --filter @kms/renderer test`
Expected: Tests pass

**Step 4: Commit**

```bash
git add packages/renderer/src/hooks/useCrafty.ts
git add packages/renderer/src/hooks/useCrafty.test.ts
git commit -m "feat(crafty): add useCrafty WebSocket hook

- WebSocket connection management
- Audio streaming to backend
- Message handling (transcript, response, tool_call)
- TTS audio playback
- Microphone toggle with MediaDevices API"
```

---

## Task 3: Connect CraftyPanel to useCrafty Hook

**Files:**
- Modify: `packages/renderer/src/components/CraftyPanel/CraftyPanel.tsx`

**Step 1: Update CraftyPanel to use the hook**

```tsx
// packages/renderer/src/components/CraftyPanel/CraftyPanel.tsx
import { FC, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useCrafty, ToolCall } from '../../hooks/useCrafty'
import { projectActions } from '../../store/projectSlice'
import { RootState } from '../../store'
import './CraftyPanel.css'

const CraftyPanel: FC = () => {
  const dispatch = useDispatch()
  const project = useSelector((state: RootState) => state.project.project)

  const [isOpen, setIsOpen] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)

  const handleToolCall = async (toolCall: ToolCall): Promise<unknown> => {
    const { name, args } = toolCall

    switch (name) {
      case 'createItem': {
        const id = crypto.randomUUID()
        dispatch(projectActions.addItem({
          id,
          name: args.name as string,
          type: (args.type as 'item' | 'block') || 'item'
        }))
        return { success: true, itemId: id }
      }

      case 'setElement': {
        dispatch(projectActions.updateItem({
          id: args.itemId as string,
          changes: {
            element: {
              type: args.element as string,
              level: (args.level as number) || 1
            }
          }
        }))
        return { success: true }
      }

      case 'setTrigger': {
        dispatch(projectActions.updateItem({
          id: args.itemId as string,
          changes: {
            trigger: { type: args.trigger as string }
          }
        }))
        return { success: true }
      }

      case 'deleteItem': {
        dispatch(projectActions.removeItem(args.itemId as string))
        return { success: true }
      }

      case 'renameItem': {
        dispatch(projectActions.updateItem({
          id: args.itemId as string,
          changes: { name: args.name as string }
        }))
        return { success: true }
      }

      case 'selectItem': {
        dispatch(projectActions.selectItem(args.itemId as string))
        return { success: true }
      }

      case 'exportDatapack': {
        if (project) {
          const result = await window.electronAPI.export.datapack(project)
          return result
        }
        return { success: false, error: 'Kein Projekt geladen' }
      }

      case 'getProjectState': {
        return {
          hasProject: !!project,
          projectName: project?.name,
          items: project?.items || []
        }
      }

      default:
        return { success: false, error: `Unbekannte Aktion: ${name}` }
    }
  }

  const handleConfirmation = async (action: string): Promise<boolean> => {
    return window.confirm(`Crafty möchte: ${action}\n\nErlauben?`)
  }

  const {
    status,
    isConnected,
    isListening,
    messages,
    currentTranscript,
    error,
    connect,
    toggleListening
  } = useCrafty({
    onToolCall: handleToolCall,
    onConfirmation: handleConfirmation
  })

  useEffect(() => {
    // Auto-connect when panel opens
    if (isOpen && !isMinimized) {
      connect()
    }
  }, [isOpen, isMinimized, connect])

  const statusText: Record<string, string> = {
    idle: 'Klicken zum Sprechen',
    listening: 'Crafty hört zu...',
    processing: 'Crafty denkt...',
    speaking: 'Crafty spricht...',
    error: error || 'Verbindungsfehler'
  }

  if (!isOpen) {
    return (
      <button className="crafty-fab" onClick={() => setIsOpen(true)}>
        🤖
      </button>
    )
  }

  if (isMinimized) {
    return (
      <div className="crafty-panel minimized">
        <div className="crafty-header">
          <span>🤖 Crafty {isConnected ? '●' : '○'}</span>
          <div className="crafty-header-buttons">
            <button onClick={() => setIsMinimized(false)}>▢</button>
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="crafty-panel">
      <div className="crafty-header">
        <span>🤖 Crafty {isConnected ? <span className="connected-dot">●</span> : <span className="disconnected-dot">○</span>}</span>
        <div className="crafty-header-buttons">
          <button onClick={() => setIsMinimized(true)}>─</button>
          <button onClick={() => setIsOpen(false)}>×</button>
        </div>
      </div>

      <div className="crafty-waveform">
        <div className={`waveform-bars ${status === 'listening' || status === 'speaking' ? 'active' : ''}`}>
          {[...Array(20)].map((_, i) => (
            <div key={i} className="waveform-bar" style={{ animationDelay: `${i * 0.05}s` }} />
          ))}
        </div>
      </div>

      <div className="crafty-status">
        <span className={`status-dot ${status}`} />
        {statusText[status]}
      </div>

      <div className="crafty-chat">
        {messages.length === 0 && !currentTranscript ? (
          <div className="crafty-empty">
            Hallo! Ich bin Crafty. Klicke auf das Mikrofon und sag mir, was du bauen möchtest!
          </div>
        ) : (
          <>
            {messages.map(msg => (
              <div key={msg.id} className={`chat-message ${msg.role}`}>
                <span className="chat-icon">{msg.role === 'user' ? '🧒' : '🤖'}</span>
                <div className="chat-content">
                  <p>{msg.content}</p>
                  {msg.action && (
                    <div className={`chat-action ${msg.action.success ? 'success' : 'error'}`}>
                      {msg.action.success ? '✓' : '✗'} {msg.action.type}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {currentTranscript && (
              <div className="chat-message user current">
                <span className="chat-icon">🧒</span>
                <div className="chat-content">
                  <p>{currentTranscript}...</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="crafty-controls">
        <button
          className={`mic-button ${isListening ? 'active' : ''} ${status}`}
          onClick={toggleListening}
          disabled={status === 'processing'}
        >
          🎤
        </button>
        <span className="mic-hint">
          {isListening ? 'Klicken zum Stoppen' : 'Klicken zum Sprechen'}
        </span>
      </div>
    </div>
  )
}

export default CraftyPanel
```

**Step 2: Add connection indicator styles**

Add to `CraftyPanel.css`:

```css
.connected-dot {
  color: var(--accent);
  font-size: 10px;
  margin-left: 4px;
}

.disconnected-dot {
  color: #666;
  font-size: 10px;
  margin-left: 4px;
}

.chat-message.current .chat-content {
  opacity: 0.7;
  font-style: italic;
}
```

**Step 3: Verify it compiles**

Run: `pnpm typecheck`
Expected: No errors

**Step 4: Commit**

```bash
git add packages/renderer/src/components/CraftyPanel/
git commit -m "feat(crafty): connect CraftyPanel to useCrafty hook

- Tool call handlers for Redux actions
- Auto-connect on panel open
- Live transcript display
- Connection status indicator"
```

---

## Task 4: Setup RealtimeVoiceChat Backend Integration

**Files:**
- Create: `external/crafty-backend/requirements.txt`
- Create: `external/crafty-backend/main.py`
- Create: `external/crafty-backend/crafty_tools.py`
- Modify: `package.json` (root)

**Step 1: Create backend requirements**

```txt
# external/crafty-backend/requirements.txt
fastapi>=0.109.0
uvicorn>=0.27.0
websockets>=12.0
RealtimeSTT>=0.1.0
RealtimeTTS>=0.3.0
httpx>=0.26.0
python-dotenv>=1.0.0
```

**Step 2: Create main backend server**

```python
# external/crafty-backend/main.py
import asyncio
import json
import base64
import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import httpx

from crafty_tools import TOOLS, SYSTEM_PROMPT

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:7b")

# STT/TTS will be initialized per connection
# For now, using mock implementations


class CraftySession:
    def __init__(self, websocket: WebSocket):
        self.websocket = websocket
        self.is_listening = False
        self.conversation_history = []
        self.audio_buffer = []

    async def send_status(self, state: str):
        await self.websocket.send_json({"type": "status", "state": state})

    async def send_transcript(self, text: str, final: bool = False):
        await self.websocket.send_json({
            "type": "transcript",
            "text": text,
            "final": final
        })

    async def send_response(self, text: str):
        await self.websocket.send_json({
            "type": "response_chunk",
            "text": text
        })

    async def send_tool_call(self, tool_id: str, name: str, args: dict):
        await self.websocket.send_json({
            "type": "tool_call",
            "id": tool_id,
            "name": name,
            "args": args
        })

    async def process_with_ollama(self, user_message: str):
        await self.send_status("processing")

        self.conversation_history.append({
            "role": "user",
            "content": user_message
        })

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            *self.conversation_history
        ]

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{OLLAMA_URL}/api/chat",
                    json={
                        "model": OLLAMA_MODEL,
                        "messages": messages,
                        "tools": TOOLS,
                        "stream": True
                    }
                )

                full_response = ""
                tool_calls = []

                async for line in response.aiter_lines():
                    if line:
                        data = json.loads(line)

                        if "message" in data:
                            msg = data["message"]

                            # Handle content
                            if "content" in msg and msg["content"]:
                                chunk = msg["content"]
                                full_response += chunk
                                await self.send_response(chunk)

                            # Handle tool calls
                            if "tool_calls" in msg:
                                tool_calls.extend(msg["tool_calls"])

                # Process tool calls
                for tool_call in tool_calls:
                    tool_id = tool_call.get("id", str(id(tool_call)))
                    func = tool_call.get("function", {})
                    await self.send_tool_call(
                        tool_id,
                        func.get("name", ""),
                        json.loads(func.get("arguments", "{}"))
                    )

                self.conversation_history.append({
                    "role": "assistant",
                    "content": full_response
                })

                await self.send_status("speaking")
                # TTS would happen here
                await asyncio.sleep(0.5)  # Simulate TTS
                await self.send_status("idle")

        except Exception as e:
            await self.send_response(f"Entschuldigung, etwas ist schiefgelaufen: {str(e)}")
            await self.send_status("idle")


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    session = CraftySession(websocket)

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type == "toggle_listening":
                session.is_listening = data.get("active", False)
                if session.is_listening:
                    await session.send_status("listening")
                else:
                    await session.send_status("idle")

            elif msg_type == "audio_chunk":
                if session.is_listening:
                    # In full implementation: send to RealtimeSTT
                    # For now, we'll use a text fallback
                    pass

            elif msg_type == "text_input":
                # Fallback for testing without audio
                text = data.get("text", "")
                if text:
                    await session.send_transcript(text, final=True)
                    await session.process_with_ollama(text)

            elif msg_type == "tool_result":
                # Handle tool result from frontend
                tool_id = data.get("id")
                result = data.get("result")
                # Could use this to continue conversation
                pass

            elif msg_type == "user_confirmation":
                approved = data.get("approved", False)
                # Handle confirmation
                pass

    except WebSocketDisconnect:
        print("Client disconnected")


@app.get("/health")
async def health():
    return {"status": "ok", "model": OLLAMA_MODEL}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8765)
```

**Step 3: Create tools definition**

```python
# external/crafty-backend/crafty_tools.py

SYSTEM_PROMPT = """Du bist Crafty, ein freundlicher Assistent in KidModStudio.
Du hilfst Kindern dabei, Minecraft-Mods zu erstellen.

WICHTIG:
- Sprich einfach und kindgerecht (8-12 Jahre)
- Sei enthusiastisch und ermutigend
- Erkläre was du tust
- Frage nach wenn unklar
- Antworte auf Deutsch

ELEMENT-ERKLÄRUNGEN:
- fire: Feuerschaden, brennt Gegner
- ice: Verlangsamt Gegner
- water: Knockback-Effekt
- poison: Gift über Zeit
- healing: Heilt den Spieler
- lightning: Blitzschlag
- light: Leuchtet und macht stärker

Wenn ein Kind etwas will, nutze die verfügbaren Tools um es umzusetzen.
Erkläre dabei was du machst."""

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "createItem",
            "description": "Erstellt ein neues Item oder einen Block im Projekt",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "Name des Items (z.B. 'Feuer-Schwert')"
                    },
                    "type": {
                        "type": "string",
                        "enum": ["item", "block"],
                        "description": "Art: item (Schwert, Werkzeug) oder block"
                    }
                },
                "required": ["name", "type"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "setElement",
            "description": "Setzt das Element eines Items (Feuer, Eis, etc.)",
            "parameters": {
                "type": "object",
                "properties": {
                    "itemId": {
                        "type": "string",
                        "description": "ID des Items"
                    },
                    "element": {
                        "type": "string",
                        "enum": ["fire", "ice", "water", "poison", "healing", "lightning", "light"],
                        "description": "Das Element"
                    },
                    "level": {
                        "type": "integer",
                        "minimum": 1,
                        "maximum": 3,
                        "description": "Stärke des Elements (1-3)"
                    }
                },
                "required": ["itemId", "element", "level"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "setTrigger",
            "description": "Setzt den Auslöser eines Items",
            "parameters": {
                "type": "object",
                "properties": {
                    "itemId": {
                        "type": "string",
                        "description": "ID des Items"
                    },
                    "trigger": {
                        "type": "string",
                        "enum": ["use", "hit"],
                        "description": "Auslöser: use (Rechtsklick) oder hit (Treffen)"
                    }
                },
                "required": ["itemId", "trigger"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "deleteItem",
            "description": "Löscht ein Item aus dem Projekt",
            "parameters": {
                "type": "object",
                "properties": {
                    "itemId": {
                        "type": "string",
                        "description": "ID des Items"
                    }
                },
                "required": ["itemId"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "renameItem",
            "description": "Benennt ein Item um",
            "parameters": {
                "type": "object",
                "properties": {
                    "itemId": {
                        "type": "string",
                        "description": "ID des Items"
                    },
                    "name": {
                        "type": "string",
                        "description": "Neuer Name"
                    }
                },
                "required": ["itemId", "name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "exportDatapack",
            "description": "Exportiert das Projekt als Minecraft Datapack",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "getProjectState",
            "description": "Gibt den aktuellen Projektzustand zurück (Items, Namen, etc.)",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    }
]
```

**Step 4: Add npm scripts for backend**

Add to root `package.json`:

```json
{
  "scripts": {
    "crafty:install": "cd external/crafty-backend && pip install -r requirements.txt",
    "crafty:start": "cd external/crafty-backend && python main.py",
    "dev:all": "concurrently \"pnpm dev\" \"pnpm crafty:start\""
  }
}
```

**Step 5: Verify backend starts**

Run: `cd external/crafty-backend && python main.py`
Expected: Server starts on port 8765

**Step 6: Commit**

```bash
git add external/crafty-backend/
git add package.json
git commit -m "feat(crafty): add Python backend with Ollama integration

- FastAPI WebSocket server on port 8765
- Ollama chat completion with tool calling
- Crafty system prompt (kid-friendly German)
- Tool definitions for all KidModStudio actions
- npm scripts for backend management"
```

---

## Task 5: Add Text Input Fallback for Testing

**Files:**
- Modify: `packages/renderer/src/components/CraftyPanel/CraftyPanel.tsx`
- Modify: `packages/renderer/src/hooks/useCrafty.ts`

**Step 1: Add text input to hook**

Add to `useCrafty.ts` return interface and implementation:

```ts
// Add to UseCraftyReturn interface
sendTextMessage: (text: string) => void

// Add implementation
const sendTextMessage = useCallback((text: string) => {
  if (wsRef.current?.readyState === WebSocket.OPEN) {
    wsRef.current.send(JSON.stringify({
      type: 'text_input',
      text
    }))
  }
}, [])

// Add to return
return {
  // ... existing
  sendTextMessage
}
```

**Step 2: Add text input to CraftyPanel**

Add a text input for testing without microphone:

```tsx
// Add state
const [textInput, setTextInput] = useState('')

// Add handler
const handleTextSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  if (textInput.trim()) {
    sendTextMessage(textInput)
    setTextInput('')
  }
}

// Add to JSX before mic-button
<form className="crafty-text-input" onSubmit={handleTextSubmit}>
  <input
    type="text"
    value={textInput}
    onChange={e => setTextInput(e.target.value)}
    placeholder="Oder hier tippen..."
    disabled={status === 'processing'}
  />
  <button type="submit" disabled={!textInput.trim() || status === 'processing'}>
    →
  </button>
</form>
```

**Step 3: Add CSS for text input**

```css
.crafty-text-input {
  display: flex;
  gap: 8px;
  padding: 0 16px 8px;
}

.crafty-text-input input {
  flex: 1;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: var(--text-primary);
  font-size: 0.85rem;
}

.crafty-text-input input::placeholder {
  color: var(--text-muted);
}

.crafty-text-input button {
  width: 36px;
  height: 36px;
  padding: 0;
  font-size: 16px;
}
```

**Step 4: Test the connection**

1. Start backend: `pnpm crafty:start`
2. Start app: `pnpm dev`
3. Open Crafty panel
4. Type "Hallo" and press enter
5. Expected: Crafty responds

**Step 5: Commit**

```bash
git add packages/renderer/src/components/CraftyPanel/
git add packages/renderer/src/hooks/useCrafty.ts
git commit -m "feat(crafty): add text input fallback for testing

- Text input field as alternative to voice
- sendTextMessage function in hook
- Useful for development without microphone"
```

---

## Task 6: Final Integration Test

**Step 1: Ensure Ollama is running with a model**

```bash
ollama list  # Should show qwen2.5 or similar
ollama run qwen2.5:7b  # Start if not running
```

**Step 2: Start backend**

```bash
pnpm crafty:start
```

**Step 3: Start KidModStudio**

```bash
pnpm dev
```

**Step 4: Test workflow**

1. Create new project (Neu button)
2. Open Crafty panel
3. Type: "Erstelle ein Feuer-Schwert"
4. Verify: Crafty responds and creates item
5. Type: "Mach es stärker mit Level 3"
6. Verify: Element level is updated

**Step 5: Commit all changes**

```bash
git add -A
git commit -m "feat(crafty): complete Sprint 5 - Crafty LLM Voice Assistant

- CraftyPanel UI with glassmorphism design
- useCrafty hook for WebSocket communication
- Python backend with Ollama integration
- Tool calling for item manipulation
- Text input fallback for testing
- Kid-friendly German system prompt"
```

**Step 6: Push to GitHub**

```bash
git push
```

---

## Summary

Nach Abschluss aller Tasks hast du:

1. **CraftyPanel UI** - Glassmorphism-Panel mit Waveform, Chat, Mic-Button
2. **useCrafty Hook** - WebSocket-Kommunikation mit Status-Management
3. **Python Backend** - FastAPI + Ollama mit Tool-Calling
4. **Tool System** - createItem, setElement, setTrigger, etc.
5. **Text Fallback** - Zum Testen ohne Mikrofon

**Nächste Schritte (optional):**
- RealtimeSTT/TTS Integration für echte Sprache
- Voice Activity Detection
- Waveform mit echten Audio-Daten
- neutts-air für Crafty-Stimme
