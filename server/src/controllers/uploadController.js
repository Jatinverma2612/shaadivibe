import path from 'path';

export const uploadPhotos = (req, res) => {
  const baseUrl = process.env.BACKEND_URL ? process.env.BACKEND_URL.replace(/\/+$/, '') : '';

  if (req.file) {
    const sanitizedName = path.basename(req.file.filename);
    const fileUrl = baseUrl ? `${baseUrl}/uploads/${sanitizedName}` : `/uploads/${sanitizedName}`;
    return res.status(201).json({
      success: true,
      message: 'File uploaded successfully.',
      url: fileUrl,
      urls: [fileUrl],
      filename: req.file.originalname,
      size: req.file.size,
      file: {
        url: fileUrl,
        filename: req.file.originalname,
        size: req.file.size,
      },
    });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'Please select at least one file to upload.' });
  }

  const uploadedFiles = req.files.map((file) => {
    const sanitizedName = path.basename(file.filename);
    const fileUrl = baseUrl ? `${baseUrl}/uploads/${sanitizedName}` : `/uploads/${sanitizedName}`;
    return {
      url: fileUrl,
      filename: file.originalname,
      size: file.size,
    };
  });

  res.status(201).json({
    success: true,
    message: `${uploadedFiles.length} file(s) uploaded successfully.`,
    urls: uploadedFiles.map((f) => f.url),
    url: uploadedFiles[0]?.url,
    files: uploadedFiles,
  });
};
