import { useState } from 'react'
import './IDEDemoSection.css'

export default function IDEDemoSection() {
  const [activeTab, setActiveTab] = useState('App.jsx')

  const codeSnippets = {
    'App.jsx': `import { useState } from 'react'
import './App.css'

export default function App() {
  const [counter, setCounter] = useState(0)

  return (
    <div className="container">
      <h1>🚀 INKz Live App Preview</h1>
      <button onClick={() => setCounter(c => c + 1)}>
        Count is: {counter}
      </button>
    </div>
  )
}`,
    'server.js': `const express = require('express')
const app = express()

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', k8sPod: process.env.POD_NAME })
})

app.listen(5173, () => console.log('Pod listening on port 5173'))`,
    'INKz.config.json': `{
  "sandbox": {
    "image": "node:20-alpine",
    "storage": "s3-mirror",
    "aiAgent": "enabled"
  }
}`
  }

  return (
    <section id="demo" className="demo-section-container">
      <div className="demo-header">
        <div className="features-tag">LIVE INTERACTIVE SHOWCASE</div>
        <h2 className="features-title">The Cloud IDE UI in action</h2>
        <p className="features-subtitle">
          Multi-panel layout with integrated Monaco Editor, AI orchestrator panel, and real-time live preview.
        </p>
      </div>

      <div className="ide-showcase-window">
        {/* Top Window Bar */}
        <div className="ide-top-bar">
          <div className="window-dots">
            <span className="w-dot red" />
            <span className="w-dot yellow" />
            <span className="w-dot green" />
          </div>
          <div className="window-title">INKz IDE — workspace-pod-8f39</div>
          <div className="window-actions">
            <span className="k8s-pod-badge">● K8s Pod Active</span>
          </div>
        </div>

        {/* IDE Main Workspace Split */}
        <div className="ide-main-split">
          {/* Sidebar File Tree */}
          <div className="ide-file-tree">
            <div className="tree-header">EXPLORER</div>
            <div
              className={`tree-item ${activeTab === 'App.jsx' ? 'active' : ''}`}
              onClick={() => setActiveTab('App.jsx')}
            >
              📄 App.jsx
            </div>
            <div
              className={`tree-item ${activeTab === 'server.js' ? 'active' : ''}`}
              onClick={() => setActiveTab('server.js')}
            >
              ⚙️ server.js
            </div>
            <div
              className={`tree-item ${activeTab === 'INKz.config.json' ? 'active' : ''}`}
              onClick={() => setActiveTab('INKz.config.json')}
            >
              🛠 INKz.config.json
            </div>
          </div>

          {/* Monaco Editor Center */}
          <div className="ide-editor-panel">
            <div className="editor-tabs">
              <span className="editor-tab active">{activeTab}</span>
            </div>
            <pre className="editor-code-view">
              <code>{codeSnippets[activeTab]}</code>
            </pre>
          </div>

          {/* Live Preview & AI Assistant Right */}
          <div className="ide-preview-ai-panel">
            {/* Live App Frame */}
            <div className="live-preview-box">
              <div className="preview-top">
                <span className="live-dot" />
                <span>Live Preview (Port 5173)</span>
              </div>
              <div className="preview-mock-screen">
                <h3>🚀 INKz Live App Preview</h3>
                <button className="preview-mock-btn">Count is: 42</button>
              </div>
            </div>

            {/* AI Assistant Chat */}
            <div className="ai-chat-box">
              <div className="ai-chat-head">🤖 INKz AI Partner</div>
              <div className="ai-chat-msg">
                <span className="ai-role">AI:</span> Refactored state management & attached S3 persistence mirror.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
