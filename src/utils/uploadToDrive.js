// Upload a PDF blob to Google Drive
const uploadToDrive = async (pdfBlob, accessToken, filename) => {
  // Step 1 — Create file metadata
  const metadata = {
    name: filename,
    mimeType: 'application/pdf',
  };

  // Step 2 — Build multipart form data
  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', pdfBlob);

  // Step 3 — Upload to Google Drive
  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    }
  );

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  const data = await response.json();
  return data.id; // Google Drive file ID
};

export default uploadToDrive;