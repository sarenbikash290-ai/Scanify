import { createWorker } from 'tesseract.js';

// Preprocess image for better OCR accuracy
const preprocessImage = (imageUrl) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Get pixel data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        // Convert to grayscale
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;

        // Increase contrast — push pixels toward black or white
        const contrast = 1.5;
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        const newVal = factor * (avg - 128) + 128;
        const final = Math.min(255, Math.max(0, newVal));

        data[i] = final;
        data[i + 1] = final;
        data[i + 2] = final;
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = imageUrl;
  });
};

const extractText = async (imageUrl, onProgress) => {
  // Preprocess for better accuracy
  const processedUrl = await preprocessImage(imageUrl);

  const worker = await createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        onProgress(Math.floor(m.progress * 100));
      }
    },
  });

  const { data: { text } } = await worker.recognize(processedUrl);
  await worker.terminate();
  return text.trim();
};

export default extractText;