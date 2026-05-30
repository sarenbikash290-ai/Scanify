import { useState, useRef } from 'react';
import CropModal from '../CropModal/CropModal';
import { rotateImage, cropImage } from '../../utils/processImage';
import './ImageUploader.css';
import generatePDF from '../../utils/generatePDF';
import validateFiles from '../../utils/validateFiles';
import Spinner from '../Spinner/Spinner';
import { useGoogleLogin } from '@react-oauth/google';
import uploadToDrive from '../../utils/uploadToDrive';
import protectPDF from '../../utils/protectPDF';

function ImageUploader() {
    const [images, setImages] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [errors, setErrors] = useState([]);
    const [pageSize, setPageSize] = useState('a4');
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const inputRef = useRef(null);
    const dragIndex = useRef(null);
    const [cropTarget, setCropTarget] = useState(null); // { id, preview }
    const [driveSuccess, setDriveSuccess] = useState(false);
    const [password, setPassword] = useState('');
const [showPassword, setShowPassword] = useState(false);
    
    const handleDriveUpload = useGoogleLogin({
  scope: 'https://www.googleapis.com/auth/drive.file',
  onSuccess: async (tokenResponse) => {
    setIsGenerating(true);
    try {
      const blob = await generatePDF(images, pageSize, true);
      const filename = `scan-${Date.now()}.pdf`;
      await uploadToDrive(blob, tokenResponse.access_token, filename);
      setDriveSuccess(true);
      setTimeout(() => setDriveSuccess(false), 4000);
    } catch (err) {
      console.error('Drive upload failed:', err);
    }
    setIsGenerating(false);
  },
  onError: (err) => console.error('Google login failed:', err),
});

    const handleFiles = (files) => {
        const fileArray = Array.from(files);
        const { validFiles, errors } = validateFiles(fileArray, images);
        setErrors(errors);
        if (validFiles.length === 0) return;
        const newImages = validFiles.map((file) => ({
            id: crypto.randomUUID(),
            file,
            preview: URL.createObjectURL(file),
        }));
        setImages((prev) => [...prev, ...newImages]);
    };

    const handleInputChange = (e) => handleFiles(e.target.files);

    const handleDrop = (e) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
    };

    const handleRemove = (id) => {
        setImages((prev) => {
            const removed = prev.find((img) => img.id === id);
            URL.revokeObjectURL(removed.preview);
            return prev.filter((img) => img.id !== id);
        });
    };
    const handleRotate = async (id) => {
  const img = images.find((i) => i.id === id);
  const newPreview = await rotateImage(img.preview, 90);
  URL.revokeObjectURL(img.preview); // free old blob
  setImages((prev) =>
    prev.map((i) => (i.id === id ? { ...i, preview: newPreview } : i))
  );
};

const handleCropOpen = (id) => {
  const img = images.find((i) => i.id === id);
  setCropTarget({ id, preview: img.preview });
};

const handleCropDone = async (croppedAreaPixels) => {
  const newPreview = await cropImage(cropTarget.preview, croppedAreaPixels);
  URL.revokeObjectURL(cropTarget.preview); // free old blob
  setImages((prev) =>
    prev.map((i) =>
      i.id === cropTarget.id ? { ...i, preview: newPreview } : i
    )
  );
  setCropTarget(null);
};

const handleCropCancel = () => {
  setCropTarget(null);
};

    const handleClearAll = () => {
        images.forEach((img) => URL.revokeObjectURL(img.preview));
        setImages([]);
        setErrors([]);
    };

    const handleConvert = async () => {
  if (images.length === 0) return;
  setIsGenerating(true);

  if (password) {
    // Generate blob first, then protect it
    const blob = await generatePDF(images, pageSize, true);
    const protectedBlob = await protectPDF(blob, password);

    // Download the protected PDF
    const url = URL.createObjectURL(protectedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan-${Date.now()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } else {
    // No password — normal download
    await generatePDF(images, pageSize, false);
  }

  setIsGenerating(false);
};

    const handleDragStart = (index) => {
        dragIndex.current = index;
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDragEnd = () => {
        dragIndex.current = null;
        setDragOverIndex(null);
    };

    const handleCardDrop = (toIndex) => {
        const fromIndex = dragIndex.current;
        if (fromIndex === toIndex) return;
        setImages((prev) => {
            const updated = [...prev];
            const [moved] = updated.splice(fromIndex, 1);
            updated.splice(toIndex, 0, moved);
            return updated;
        });
        dragIndex.current = null;
        setDragOverIndex(null);
    };

    return (
        <div className="uploader">
            {isGenerating && <Spinner message="Generating your PDF..." />}

{cropTarget && (
  <CropModal
    image={cropTarget.preview}
    onCancel={handleCropCancel}
    onCropDone={handleCropDone}
  />
)}
            <div
                className="drop-zone"
                onClick={() => inputRef.current.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
            >
                <div className="drop-zone-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0060dd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="16 16 12 12 8 16" />
                        <line x1="12" y1="12" x2="12" y2="21" />
                        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                    </svg>
                </div>
                <h3>Drop your images here</h3>
                <p>JPG, PNG supported · Max 10MB each</p>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleInputChange}
            />

            {/* Errors */}
            {errors.length > 0 && (
                <div className="error-box">
                    {errors.map((err, i) => (
                        <p key={i}>⚠ {err}</p>
                    ))}
                </div>
            )}

            {/* Divider */}
            {images.length > 0 && <div className="divider" />}

            {/* Preview grid */}
            {images.length > 0 && (
                <div className="preview-grid">
                    {images.map((img, index) => (
                        <div
                            key={img.id}
                            className={`preview-card ${dragIndex.current === index ? 'dragging' : ''
                                } ${dragOverIndex === index ? 'drag-over' : ''}`}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            onDrop={() => handleCardDrop(index)}
                        >
                            <img src={img.preview} alt={`page-${index + 1}`} />

                            {/* Top right — remove button */}
                            <button
                                className="remove-btn"
                                onClick={() => handleRemove(img.id)}
                            >
                                ✕
                            </button>

                            {/* Bottom toolbar */}
                            <div className="card-toolbar">
                                <button
                                    className="tool-btn"
                                    onClick={() => handleRotate(img.id)}
                                    title="Rotate"
                                >
                                    🔄
                                </button>
                                <button
                                    className="tool-btn"
                                    onClick={() => handleCropOpen(img.id)}
                                    title="Crop"
                                >
                                    ✂
                                </button>
                            </div>

                            <span className="page-number">{index + 1}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Controls */}
            {images.length > 0 && (
                <>
                    <div className="size-selector">
                        <div className="size-selector-inner">
                            <label htmlFor="page-size">Page size</label>
                            <select
                                id="page-size"
                                value={pageSize}
                                onChange={(e) => setPageSize(e.target.value)}
                            >
                                <option value="a4">A4 (210 × 297mm)</option>
                                <option value="letter">Letter (216 × 279mm)</option>
                            </select>
                        </div>
                    </div>

                    {images.length > 0 && (
  <div className="password-field">
    <div className="password-inner">
      <span className="password-icon">🔒</span>
      <input
        type={showPassword ? 'text' : 'password'}
        placeholder="Set PDF password (optional)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="password-input"
      />
      <button
        className="password-toggle"
        onClick={() => setShowPassword((p) => !p)}
      >
        {showPassword ? '🙈' : '👁'}
      </button>
    </div>
  </div>
)}

                    <div className="action-bar">
                        <button
                            className="convert-btn"
                            onClick={handleConvert}
                            disabled={isGenerating}
                        >
                            ↗ Convert {images.length} image{images.length > 1 ? 's' : ''} to PDF
                        </button>
                        {images.length > 0 && (
  <button
    className="drive-btn"
    onClick={handleDriveUpload}
    disabled={isGenerating}
  >
    <svg width="16" height="16" viewBox="0 0 87.3 78" fill="none">
      <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L28 55H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
      <path d="M43.65 25L29.35 0c-1.35.8-2.5 1.9-3.3 3.3L1.2 50.5c-.8 1.4-1.2 2.95-1.2 4.5h28z" fill="#00ac47"/>
      <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75L86.1 57c.8-1.4 1.2-2.95 1.2-4.5H59.3l5.9 11.5z" fill="#ea4335"/>
      <path d="M43.65 25L57.95 0H29.35z" fill="#00832d"/>
      <path d="M59.3 52.5H87.3L73.55 28.15 57.95 0 43.65 25 59.3 52.5z" fill="#2684fc"/>
      <path d="M28 55l-14.25 21.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2L59.3 52.5H28z" fill="#ffba00"/>
    </svg>
    {driveSuccess ? 'Saved to Drive ✓' : 'Save to Google Drive'}
  </button>
)}
                        <button
                            className="clear-btn"
                            onClick={handleClearAll}
                            disabled={isGenerating}
                        >
                            ✕ Clear
                        </button>
                    </div>

                    <p className="hint">Drag thumbnails to reorder pages</p>
                </>
            )}
        </div>
    );
}

export default ImageUploader;