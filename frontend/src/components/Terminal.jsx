import { useEffect, useRef } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { io } from 'socket.io-client'
import '@xterm/xterm/css/xterm.css'
import './Terminal.css'

const MAX_RECONNECT_ATTEMPTS = 5

export default function Terminal({ sandboxId, podReady }) {
  const containerRef = useRef(null)
  const termRef = useRef(null)
  const socketRef = useRef(null)
  const fitRef = useRef(null)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Init xterm
    const term = new XTerm({
      theme: {
        background: '#0a0b0d',
        foreground: '#e8eaf0',
        cursor: '#d4631a',
        cursorAccent: '#0a0b0d',
        selectionBackground: 'rgba(212,99,26,0.2)',
        black: '#1e2128',
        red: '#f85149',
        green: '#3fb950',
        yellow: '#d29922',
        blue: '#58a6ff',
        magenta: '#bc8cff',
        cyan: '#39c5cf',
        white: '#b1bac4',
        brightBlack: '#6e7681',
        brightRed: '#ff7b72',
        brightGreen: '#56d364',
        brightYellow: '#e3b341',
        brightBlue: '#79c0ff',
        brightMagenta: '#d2a8ff',
        brightCyan: '#56d4dd',
        brightWhite: '#f0f6fc',
      },
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      fontSize: 13,
      lineHeight: 1.45,
      cursorBlink: true,
      cursorStyle: 'bar',
      scrollback: 1000,
      allowTransparency: false,
      convertEol: true,
    })

    const fitAddon = new FitAddon()
    const webLinksAddon = new WebLinksAddon()
    term.loadAddon(fitAddon)
    term.loadAddon(webLinksAddon)
    term.open(containerRef.current)
    fitAddon.fit()

    termRef.current = term
    fitRef.current = fitAddon

    // If pod isn't ready yet, show a waiting message — don't connect socket
    if (!sandboxId || !podReady) {
      term.writeln('\r\x1b[33m── Waiting for sandbox to be ready… ──\x1b[0m\r')
      const resizeObserver = new ResizeObserver(() => {
        try { fitAddon.fit() } catch { }
      })
      resizeObserver.observe(containerRef.current)
      return () => {
        resizeObserver.disconnect()
        term.dispose()
      }
    }

    // ── Connect socket with auto-reconnect on disconnect ──────────────────
    function connect() {
      const isLocal = typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      const targetUrl = isLocal ? undefined : `${window.location.protocol}//${sandboxId}.agent.clickking.me`

      const socket = io(targetUrl, {
        query: { sandboxId },
        transports: ['websocket'],
        reconnection: false  // we handle reconnection manually for user feedback
      })
      socketRef.current = socket


      socket.on('connect', () => {
        reconnectAttemptsRef.current = 0
        if (reconnectAttemptsRef.current > 0) {
          term.writeln('\r\x1b[32m── reconnected ──\x1b[0m\r')
        } else {
          term.writeln('\r\x1b[1;38;5;208m─────────────────────────────────────────────────────────────\x1b[0m')
          term.writeln('\x1b[1;97m   INKz Cloud IDE — Created & Engineered by \x1b[1;38;5;208mHarsh Patel\x1b[0m')
          term.writeln('\x1b[1;36m   GitHub: https://github.com/Notanormaldev/INKz\x1b[0m')
          term.writeln('\x1b[1;33m  💡 Don\'t forget to star the repository!\x1b[0m')
          term.writeln('\x1b[1;38;5;208m─────────────────────────────────────────────────────────────\x1b[0m')
          term.writeln('\r\x1b[2m── connected to sandbox terminal ──\x1b[0m\r\n')
        }
      })

      socket.on('terminal-output', (data) => {
        term.write(data)
      })

      socket.on('disconnect', () => {
        term.writeln('\r\x1b[31m── terminal disconnected ──\x1b[0m\r')

        // Auto-reconnect with exponential backoff (up to MAX_RECONNECT_ATTEMPTS)
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(1000 * 2 ** reconnectAttemptsRef.current, 16000)
          reconnectAttemptsRef.current++
          term.writeln(`\r\x1b[33m── reconnecting in ${delay / 1000}s (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})… ──\x1b[0m\r`)
          reconnectTimerRef.current = setTimeout(connect, delay)
        } else {
          term.writeln('\r\x1b[31m── max reconnect attempts reached. Refresh to retry. ──\x1b[0m\r')
        }
      })

      // Send keystrokes to pty
      term.onData((data) => {
        socket.emit('terminal-input', data)
      })
    }

    connect()

    // Resize handler
    const resizeObserver = new ResizeObserver(() => {
      try { fitAddon.fit() } catch { }
    })
    resizeObserver.observe(containerRef.current)

    return () => {
      clearTimeout(reconnectTimerRef.current)
      resizeObserver.disconnect()
      socketRef.current?.disconnect()
      term.dispose()
    }
  }, [sandboxId, podReady])

  return (
    <div className="terminal-wrapper">
      <div className="terminal-header">
        <div className="terminal-dots">
          <span className="dot red" />
          <span className="dot yellow" />
          <span className="dot green" />
        </div>
        <span className="terminal-title">Terminal</span>
        <span className="terminal-sandbox-id">{sandboxId?.slice(0, 8)}…</span>
      </div>
      <div ref={containerRef} className="terminal-container" id="terminal-container" />
    </div>
  )
}
