import './Preview.css'

export default function Preview({ previewUrl, sandboxId }) {
  if (!previewUrl) return null

  const url = previewUrl || `http://${sandboxId}.preview.localhost`

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
          onClick={() => {
            const iframe = document.getElementById('preview-iframe')
            if (iframe) iframe.src = iframe.src
          }}
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
      <iframe
        id="preview-iframe"
        src={url}
        title="Sandbox preview"
        className="preview-frame"
        sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
      />
    </div>
  )
}
