import { useState, useCallback, useRef } from 'react'

const AI_ENDPOINT = '/api/ai/invoke'

export function useChat(sandboxId) {
  const [messages, setMessages] = useState([])
  const [streaming, setStreaming] = useState(false)
  const abortRef = useRef(null)

  const appendMessage = (msg) =>
    setMessages(prev => [...prev, msg])

  const updateLastAssistant = (updater) =>
    setMessages(prev => {
      const next = [...prev]
      for (let i = next.length - 1; i >= 0; i--) {
        if (next[i].role === 'assistant') {
          next[i] = updater(next[i])
          break
        }
      }
      return next
    })

  const sendMessage = useCallback(async (userText) => {
    if (!userText.trim() || streaming) return

    appendMessage({ role: 'user', content: userText, id: Date.now() })
    appendMessage({
      role: 'assistant',
      content: '',
      thinking: [],
      toolCalls: [],
      id: Date.now() + 1,
      streaming: true
    })

    setStreaming(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch(AI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, projectid: sandboxId }),
        signal: controller.signal
      })

      if (!res.ok) throw new Error(`AI error ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() // keep incomplete line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (!raw || raw === '[DONE]') continue

          try {
            const chunk = JSON.parse(raw)
            handleChunk(chunk)
          } catch {
            // non-JSON data line, skip
          }
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        updateLastAssistant(m => ({
          ...m,
          content: m.content + `\n\n⚠️ Error: ${e.message}`,
          streaming: false
        }))
      }
    } finally {
      setStreaming(false)
      updateLastAssistant(m => ({ ...m, streaming: false }))
    }
  }, [sandboxId, streaming])

  function handleChunk(chunk) {
    if (!chunk || typeof chunk !== 'object') return

    // writer calls emit { title, data } objects
    if (chunk.title !== undefined) {
      updateLastAssistant(m => ({
        ...m,
        thinking: [...(m.thinking || []), { title: chunk.title, data: chunk.data }]
      }))
      return
    }

    // Helper to safely extract text from LangChain message objects
    const extractText = (msg) => {
      if (!msg) return ''
      const raw = msg.content ?? msg.kwargs?.content ?? msg.text ?? ''
      if (typeof raw === 'string') return raw
      if (Array.isArray(raw)) {
        return raw.map(c => typeof c === 'string' ? c : (c.text || c.content || '')).join('')
      }
      return ''
    }

    // Helper to extract tool calls from LangChain message objects
    const extractToolCalls = (msg) => {
      if (!msg) return []
      return msg.tool_calls ?? msg.kwargs?.tool_calls ?? []
    }

    // Inspect all top-level keys of chunk (agent, model, tools, etc.)
    for (const key of Object.keys(chunk)) {
      const node = chunk[key]
      if (!node || typeof node !== 'object') continue

      const msgList = Array.isArray(node.messages)
        ? node.messages
        : (Array.isArray(node) ? node : null)

      if (msgList) {
        for (const msg of msgList) {
          const text = extractText(msg)
          const toolCalls = extractToolCalls(msg)

          if (text && key !== 'tools') {
            updateLastAssistant(m => ({ ...m, content: m.content + text }))
          }

          if (toolCalls.length > 0) {
            updateLastAssistant(m => ({
              ...m,
              toolCalls: [...(m.toolCalls || []), ...toolCalls]
            }))
          }

          if (key === 'tools' && text) {
            updateLastAssistant(m => ({
              ...m,
              toolCalls: (m.toolCalls || []).map((tc, i) =>
                i === (m.toolCalls?.length ?? 1) - 1
                  ? { ...tc, result: text }
                  : tc
              )
            }))
          }
        }
      }
    }

    // Direct content on chunk itself (if plain object format)
    if (typeof chunk.content === 'string' && chunk.content) {
      updateLastAssistant(m => ({ ...m, content: m.content + chunk.content }))
    }
  }

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort()
    setStreaming(false)
    updateLastAssistant(m => ({ ...m, streaming: false }))
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return { messages, streaming, sendMessage, stopStreaming, clearMessages }
}
