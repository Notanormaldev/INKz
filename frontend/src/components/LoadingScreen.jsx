import './LoadingScreen.css'

export default function LoadingScreen({ message = 'Loading workspace...' }) {
  return (
    <div className="inkz-loading-screen">
      <div className="loading-content">
        {/* Official INKz Brand Logo */}
        <div className="loading-logo-wrapper">
          <div className="loading-inkz-logo">
            <span className="logo-i">I</span>
            <span className="logo-n">N</span>
            <span className="logo-k">K</span>
            <span className="logo-z">z</span>
          </div>
        </div>

        {/* Animated Spinner Ring */}
        <div className="loading-spinner-ring"></div>

        {/* Status Message */}
        <p className="loading-message">{message}</p>
      </div>
    </div>
  )
}
