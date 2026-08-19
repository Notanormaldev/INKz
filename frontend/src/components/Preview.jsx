import { useState, useEffect } from 'react'
import './Preview.css'

export default function Preview({ previewUrl, sandboxId }) {
  const url = previewUrl || `http://${sandboxId}.preview.localhost`
  const [loading, setLoading] = useState(true)
  const [key, setKey] = useState(0)

  useEffect(() => {
    setLoading(true)
  }, [url])

  function handleReload() {
    setLoading(true)
    setKey(k => k + 1)
  }

  return (
    <div className="preview-panel">
      <div className="preview-bar">
        <div className="preview-dot-cluster">
          <span className="pdot" />
          <span className="pdot" />
          <span className="pdot active" />
        </div>
        <div className="preview-url-bar">
          <span className="preview-scheme">http://</span>
          <span className="preview-domain">{sandboxId?.slice(0, 8)}….preview.localhost</span>
        </div>
        <button
          className="preview-reload"
          onClick={handleReload}
          title="Reload preview"
        >
          ⟳
        </button>
        <a
          className="preview-external"
          href={url}
          target="_blank"
          rel="noreferrer"
          title="Open in new tab"
        >
          ↗
        </a>
      </div>

      <div className="preview-container">
        {loading && (
          <div className="preview-loading-overlay">
            <div className="preview-spinner" />
            <span>Loading app preview…</span>
          </div>
        )}

        <iframe
          key={key}
          id="preview-iframe"
          src={url}
          title="Sandbox preview"
          className="preview-frame"
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
          onLoad={() => setLoading(false)}
        />
      </div>
    </div>
  )
}
