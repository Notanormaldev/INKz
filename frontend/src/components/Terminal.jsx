import { useEffect, useRef } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { io } from 'socket.io-client'
import '@xterm/xterm/css/xterm.css'
import './Terminal.css'

export default function Terminal({ sandboxId }) {
  const containerRef = useRef(null)
  const termRef = useRef(null)
  const socketRef = useRef(null)
  const fitRef = useRef(null)

  useEffect(() => {
    if (!sandboxId || !containerRef.current) return

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

    // Connect socket.io to agent
    const agentUrl = `http://${sandboxId}.agent.localhost`
    const socket = io(agentUrl, { transports: ['websocket'] })
    socketRef.current = socket

    socket.on('connect', () => {
      term.writeln('\r\x1b[2m── connected to sandbox terminal ──\x1b[0m\r')
    })

    socket.on('terminal-output', (data) => {
      term.write(data)
    })

    socket.on('disconnect', () => {
      term.writeln('\r\x1b[31m── terminal disconnected ──\x1b[0m\r')
    })

    // Send keystrokes to pty
    term.onData((data) => {
      socket.emit('terminal-input', data)
    })

    // Resize handler
    const resizeObserver = new ResizeObserver(() => {
      try { fitAddon.fit() } catch {}
    })
    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
      socket.disconnect()
      term.dispose()
    }
  }, [sandboxId])

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
