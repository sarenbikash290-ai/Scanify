// Rotate a blob URL by degrees and return a new blob URL
export const rotateImage = (imageSrc, rotation) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');

      // Swap width/height for 90/270 degree rotations
      if (rotation === 90 || rotation === 270) {
        canvas.width = img.height;
        canvas.height = img.width;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      const ctx = canvas.getContext('2d');

      // Move to center, rotate, draw image
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      canvas.toBlob((blob) => {
        resolve(URL.createObjectURL(blob));
      }, 'image/jpeg');
    };
    img.src = imageSrc;
  });
};

// Crop an image using pixel coordinates from react-easy-crop
export const cropImage = (imageSrc, croppedAreaPixels) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      const ctx = canvas.getContext('2d');

      // Draw only the cropped portion
      ctx.drawImage(
        img,
        croppedAreaPixels.x,      // source x
        croppedAreaPixels.y,      // source y
        croppedAreaPixels.width,  // source width
        croppedAreaPixels.height, // source height
        0,                        // dest x
        0,                        // dest y
        croppedAreaPixels.width,  // dest width
        croppedAreaPixels.height  // dest height
      );

      canvas.toBlob((blob) => {
        resolve(URL.createObjectURL(blob));
      }, 'image/jpeg');
    };
    img.src = imageSrc;
  });
};