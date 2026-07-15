import { useState, useRef, useEffect } from 'react'
import './ChatPanel.css'

function ToolCallBadge({ tc }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`tool-badge ${open ? 'expanded' : ''}`}>
      <button className="tool-badge-header" onClick={() => setOpen(o => !o)}>
        <span className="tool-badge-icon">⚙</span>
        <span className="tool-badge-name">{tc.name}</span>
        <span className={`tool-badge-chevron ${open ? 'open' : ''}`}>›</span>
      </button>
      {open && (
        <div className="tool-badge-body">
          {tc.args && (
            <pre className="tool-badge-code">{JSON.stringify(tc.args, null, 2)}</pre>
          )}
          {tc.result && (
            <div className="tool-badge-result">
              <span className="tool-result-label">Result</span>
              <pre className="tool-badge-code">{
                typeof tc.result === 'string'
                  ? (tc.result.length > 400 ? tc.result.slice(0, 400) + '…' : tc.result)
                  : JSON.stringify(tc.result, null, 2)
              }</pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ThinkingBubble({ items }) {
  if (!items?.length) return null
  return (
    <div className="thinking-block">
      {items.map((t, i) => (
        <div key={i} className="thinking-item">
          <span className="thinking-label">{t.title}</span>
          {t.data && <span className="thinking-data">{String(t.data).slice(0, 120)}</span>}
        </div>
      ))}
    </div>
  )
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`chat-message ${isUser ? 'user' : 'assistant'}`}>
      <div className="msg-avatar">
        {isUser ? 'U' : 'AI'}
      </div>
      <div className="msg-body">
        {!isUser && <ThinkingBubble items={msg.thinking} />}
        {!isUser && msg.toolCalls?.map((tc, i) => (
          <ToolCallBadge key={i} tc={tc} />
        ))}
        {msg.content && (
          <div className={`msg-content ${msg.streaming ? 'streaming' : ''}`}>
            <MessageContent text={msg.content} />
          </div>
        )}
        {msg.streaming && !msg.content && (
          <div className="msg-typing">
            <span /><span /><span />
          </div>
        )}
      </div>
    </div>
  )
}

function MessageContent({ text }) {
  // Render code blocks with syntax styling
  const parts = text.split(/(```[\s\S]*?```)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          const match = part.match(/^```(\w*)\n?([\s\S]*?)```$/)
          const lang = match?.[1] || ''
          const code = match?.[2] || part.slice(3, -3)
          return (
            <div key={i} className="msg-code-block">
              {lang && <div className="msg-code-lang">{lang}</div>}
              <pre><code>{code}</code></pre>
            </div>
          )
        }
        return <span key={i} className="msg-text">{part}</span>
      })}
    </>
  )
}

export default function ChatPanel({ messages, streaming, onSend, onStop, sandboxId }) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend() {
    const text = input.trim()
    if (!text || streaming) return
    onSend(text)
    setInput('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chat-panel">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="chat-ai-dot" />
          <span className="chat-title">INKz AI</span>
          {streaming && <span className="chat-streaming-badge">streaming…</span>}
        </div>
        <div className="chat-header-right">
          <span className="chat-model">mistral-medium</span>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages" id="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <div className="chat-empty-icon">◈</div>
            <p>Ask INKz AI to build, fix, or explain anything in your project.</p>
            <div className="chat-suggestions">
              {[
                'Add a dark mode toggle',
                'Create a login page',
                'Fix all TypeScript errors',
                'Add a REST API fetch'
              ].map(s => (
                <button key={s} className="chat-suggestion" onClick={() => { setInput(s); inputRef.current?.focus() }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map(msg => <Message key={msg.id} msg={msg} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <div className="chat-input-box">
          <textarea
            ref={inputRef}
            id="chat-input"
            className="chat-textarea"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI to modify your project…"
            rows={1}
            disabled={streaming}
          />
          {streaming ? (
            <button className="chat-stop-btn" onClick={onStop} title="Stop generation">
              <span className="stop-icon" />
            </button>
          ) : (
            <button
              className="chat-send-btn"
              onClick={handleSend}
              disabled={!input.trim()}
              id="chat-send-btn"
              title="Send (Enter)"
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22 11 13 2 9l20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
        <p className="chat-hint">Enter to send · Shift+Enter for newline</p>
      </div>
    </div>
  )
}
