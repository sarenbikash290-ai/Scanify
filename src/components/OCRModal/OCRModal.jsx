import { useState, useEffect } from 'react';
import extractText from '../../utils/extractText';
import './OCRModal.css';

function OCRModal({ images, onClose }) {
  const [results, setResults] = useState([]); // text per image
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [copied, setCopied] = useState(false);

  // Run OCR on all images when modal opens
  useEffect(() => {
    const runOCR = async () => {
      const texts = [];

      for (let i = 0; i < images.length; i++) {
        setCurrentIndex(i);
        setProgress(0);

        const text = await extractText(images[i].preview, (p) => {
          setProgress(p);
        });

        texts.push(text);
      }

      setResults(texts);
      setIsDone(true);
    };

    runOCR();
  }, []);

  // Copy all text to clipboard
  const handleCopy = () => {
    const allText = results.join('\n\n--- Page Break ---\n\n');
    navigator.clipboard.writeText(allText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download as .txt file
  const handleDownload = () => {
    const allText = results.join('\n\n--- Page Break ---\n\n');
    const blob = new Blob([allText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan-text-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="ocr-overlay">
      <div className="ocr-modal">

        <div className="ocr-header">
          <h3>Extract Text (OCR)</h3>
          <button className="ocr-close" onClick={onClose}>✕</button>
        </div>

        {/* Processing state */}
        {!isDone && (
          <div className="ocr-processing">
            <div className="ocr-status">
              <span>Processing image {currentIndex + 1} of {images.length}</span>
              <span>{progress}%</span>
            </div>
            <div className="ocr-progress-bar">
              <div
                className="ocr-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="ocr-hint">
              This may take a few seconds per image...
            </p>
          </div>
        )}

        {/* Results */}
        {isDone && (
          <>
            <div className="ocr-results">
              {results.map((text, index) => (
                <div key={index} className="ocr-page">
                  <div className="ocr-page-label">Page {index + 1}</div>
                  <div className="ocr-text">
                    {text || 'No text found in this image.'}
                  </div>
                </div>
              ))}
            </div>

            <div className="ocr-actions">
              <button className="ocr-copy-btn" onClick={handleCopy}>
                {copied ? '✓ Copied!' : 'Copy All Text'}
              </button>
              <button className="ocr-download-btn" onClick={handleDownload}>
                Download .txt
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default OCRModal;