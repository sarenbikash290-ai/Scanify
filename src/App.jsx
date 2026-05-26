import ImageUploader from './components/ImageUploader/ImageUploader';
import './App.css';

function App() {
  return (
    <div className="app">
      <div className="app-bg-orb orb1" />
      <div className="app-bg-orb orb2" />

      <header className="app-header">
        <div className="app-logo">
          <div className="app-logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
            </svg>
          </div>
          <span className="app-logo-text">Scanify</span>
        </div>
        <span className="app-badge">Free forever</span>
      </header>

      <div className="app-hero">
        <h1>Turn images into PDF<br />instantly</h1>
        <p>Upload · Arrange · Export</p>
      </div>

      <ImageUploader />
    </div>
  );
}

export default App;