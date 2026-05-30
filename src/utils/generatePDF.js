import { jsPDF } from 'jspdf';

const PAGE_SIZES = {
  a4:     { width: 210, height: 297 },
  letter: { width: 216, height: 279 },
};

// Returns a blob if returnBlob is true, otherwise saves directly
const generatePDF = async (images, pageSize = 'a4', returnBlob = false, password = '') => {
  const { width: pageWidth, height: pageHeight } = PAGE_SIZES[pageSize];

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
  });

  let isFirstPage = true;
  const margin = 4;

  for (const imgObj of images) {
    const imageData = await loadImage(imgObj.preview);

    const maxW = pageWidth - margin * 2;
    const maxH = pageHeight - margin * 2;

    const { width, height } = fitInsidePage(
      imageData.width,
      imageData.height,
      maxW,
      maxH
    );

    const x = (pageWidth - width) / 2;
    const y = (pageHeight - height) / 2;

    if (!isFirstPage) {
      pdf.addPage([pageWidth, pageHeight]);
    }

    pdf.addImage(imageData.src, 'JPEG', x, y, width, height);
    isFirstPage = false;
  }

  const filename = `scan-${Date.now()}.pdf`;

if (returnBlob) {
  return pdf.output('blob');
}

// Save with or without password
if (password) {
  pdf.save(filename, {
    userPassword: password,
    ownerPassword: password + '_owner',
    userPermissions: ['print', 'copy'],
  });
} else {
  pdf.save(filename);
}
};

const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

const fitInsidePage = (imgW, imgH, maxW, maxH) => {
  const ratio = Math.min(maxW / imgW, maxH / imgH);
  return {
    width: imgW * ratio,
    height: imgH * ratio,
  };
};

export default generatePDF;