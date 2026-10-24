import path from 'path';

export const uploadPhotos = (req, res) => {
  if (!req.files || req.files.length === 0) {
    // If single file uploaded via req.file
    if (req.file) {
      const sanitizedName = path.basename(req.file.filename);
      return res.status(201).json({
        success: true,
        message: 'Photo uploaded successfully.',
        url: `/uploads/${sanitizedName}`,
      });
    }
    return res.status(400).json({ success: false, message: 'Please select at least one image to upload.' });
  }

  const uploadedUrls = req.files.map((file) => {
    const sanitizedName = path.basename(file.filename);
    return `/uploads/${sanitizedName}`;
  });

  res.status(201).json({
    success: true,
    message: `${uploadedUrls.length} photo(s) uploaded successfully.`,
    urls: uploadedUrls,
  });
};
