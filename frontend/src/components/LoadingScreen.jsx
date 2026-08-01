import './LoadingScreen.css'

export default function LoadingScreen({ message = 'Loading workspace...' }) {
  return (
    <div className="inkz-loading-screen">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  )
}
