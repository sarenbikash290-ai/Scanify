import ImageUploader from './components/ImageUploader/ImageUploader';
import './App.css';

function App() {
  return (
    <div className="app">

      {/* Logo — left aligned */}
      <div className="app-logo">
        <div className="app-logo-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
          </svg>
        </div>
        <span className="app-logo-text">Scanify</span>
      </div>

      {/* Hero */}
      <div className="app-hero">
        <h1>Turn your images into<br /><em>flawless</em> PDF documents</h1>
        <p>The simplest, fastest way to convert JPG and PNG images to PDF. No watermarks, no registration required, completely free.</p>
      </div>

      {/* Main uploader */}
      <ImageUploader />

      {/* Features row */}
      <div className="app-features">
        <div className="app-feature">
          <div className="app-feature-dot" />
          <span>No watermarks</span>
        </div>
        <div className="app-feature">
          <div className="app-feature-dot" />
          <span>100% free</span>
        </div>
        <div className="app-feature">
          <div className="app-feature-dot" />
          <span>No sign up needed</span>
        </div>
        <div className="app-feature">
          <div className="app-feature-dot" />
          <span>Works offline</span>
        </div>
      </div>

    </div>
  );
}

export default App;