import createModule from '@neslinesli93/qpdf-wasm';

const protectPDF = async (pdfBlob, password) => {
  // Load qpdf WASM module
  const qpdf = await createModule({
    locateFile: () => '/qpdf.wasm',
    noInitialRun: true,
  });

  // Convert blob to Uint8Array
  const arrayBuffer = await pdfBlob.arrayBuffer();
  const inputBytes = new Uint8Array(arrayBuffer);

  // Write input to virtual filesystem
  qpdf.FS.writeFile('/input.pdf', inputBytes);

  // Run qpdf encryption command
  qpdf.callMain([
    '/input.pdf',
    '--encrypt',
    password,        // user password
    password,        // owner password
    '256',           // 256-bit AES encryption
    '--print=full',
    '--extract=y',
    '--',
    '/output.pdf',
  ]);

  // Read encrypted output
  const outputBytes = qpdf.FS.readFile('/output.pdf');

  // Cleanup virtual filesystem
  qpdf.FS.unlink('/input.pdf');
  qpdf.FS.unlink('/output.pdf');

  return new Blob([outputBytes], { type: 'application/pdf' });
};

export default protectPDF;