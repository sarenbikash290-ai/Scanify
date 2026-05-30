import { useState, useRef } from 'react';
import CropModal from '../CropModal/CropModal';
import { rotateImage, cropImage } from '../../utils/processImage';
import './ImageUploader.css';
import generatePDF from '../../utils/generatePDF';
import validateFiles from '../../utils/validateFiles';
import Spinner from '../Spinner/Spinner';

function ImageUploader() {
    const [images, setImages] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [errors, setErrors] = useState([]);
    const [pageSize, setPageSize] = useState('a4');
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const inputRef = useRef(null);
    const dragIndex = useRef(null);
    const [cropTarget, setCropTarget] = useState(null); // { id, preview }

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
        await generatePDF(images, pageSize);
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

                    <div className="action-bar">
                        <button
                            className="convert-btn"
                            onClick={handleConvert}
                            disabled={isGenerating}
                        >
                            ↗ Convert {images.length} image{images.length > 1 ? 's' : ''} to PDF
                        </button>
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