import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import './CropModal.css';

function CropModal({ image, onCancel, onCropDone }) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    // Fires every time user moves/resizes the crop box
    const onCropComplete = useCallback((_, pixels) => {
        setCroppedAreaPixels(pixels);
    }, []);

    const handleDone = () => {
        onCropDone(croppedAreaPixels);
    };

    return (
        <div className="crop-overlay">
            <div className="crop-modal">

                <div className="crop-header">
                    <h3>Crop Image</h3>
                    <button className="crop-close" onClick={onCancel}>✕</button>
                </div>

                {/* Crop area */}
                <div className="crop-container">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={undefined}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                </div>

                {/* Zoom slider */}
                <div className="crop-controls">
                    <label>Zoom</label>
                    <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.01}
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="zoom-slider"
                    />
                </div>

                {/* Action buttons */}
                <div className="crop-actions">
                    <button className="crop-cancel-btn" onClick={onCancel}>
                        Cancel
                    </button>
                    <button className="crop-done-btn" onClick={handleDone}>
                        Apply Crop
                    </button>
                </div>

            </div>
        </div>
    );
}

export default CropModal;