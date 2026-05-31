import ImageUploader from './components/ImageUploader/ImageUploader';
import './App.css';

function App() {
  return (
    <div className="app">

      {/* Glass Header */}
      <header className="app-header">
        <div className="app-logo">
          <div className="app-logo-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
          </div>
          <span className="app-logo-text">Scanify</span>
        </div>
      </header>

      {/* Main two column */}
      <main className="app-main">
        <div className="app-two-col">

          {/* Left — hero + features */}
          <div className="app-left">
            <h1>Turn your images into <em>flawless</em> PDF documents</h1>
            <p>The simplest, fastest way to convert JPG and PNG images to PDF. No watermarks, no registration required, completely free.</p>

            <div className="app-features">
              {[
                'Drag & drop to reorder pages',
                'Crop & rotate images',
                'Password protect your PDF',
                'Save directly to Google Drive',
                'Extract text with OCR',
              ].map((feature) => (
                <div className="app-feature" key={feature}>
                  <div className="app-feature-dot">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="app-stats">
              <div className="app-stat"><h3>100%</h3><p>Free forever</p></div>
              <div className="app-stat"><h3>0</h3><p>Watermarks</p></div>
              <div className="app-stat"><h3>256-bit</h3><p>AES encryption</p></div>
            </div>
          </div>

          {/* Right — uploader */}
          <div className="app-right">
            <ImageUploader />
          </div>

        </div>
      </main>

      {/* Bottom strip */}
      <div className="app-bottom">
        {[
          { title: 'No watermarks', desc: 'Your PDF stays clean' },
          { title: '100% private', desc: 'Processed in your browser' },
          { title: 'Works offline', desc: 'No internet needed' },
          { title: 'All formats', desc: 'JPG, PNG supported' },
        ].map((item) => (
          <div className="app-bottom-feature" key={item.title}>
            <h4>{item.title}</h4>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>

    </div>
  );
}

export default App;