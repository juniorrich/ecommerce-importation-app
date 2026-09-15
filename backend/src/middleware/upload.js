const multer = require('multer');
const path = require('path');
const cloudinary = require('../config/cloudinary');

// Store files in memory so we can upload directly to Cloudinary
const storage = multer.memoryStorage();

// Only allow image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only image files (jpeg, jpg, png, webp, gif) are allowed'));
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max per file
  },
  fileFilter,
});

// Multer middlewares
exports.uploadSingle = upload.single('image');
exports.uploadMultiple = upload.array('images', 5);

/**
 * Upload a buffer to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Cloudinary folder
 * @returns {Promise<{public_id: string, url: string}>}
 */
exports.uploadToCloudinary = (buffer, folder = 'ecommerce-importation') => {
  return new Promise((resolve, reject) => {
    // Check if Cloudinary is configured
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name'
    ) {
      // Mock mode for development without Cloudinary keys
      const mockId = `mock_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      return resolve({
        public_id: mockId,
        url: `https://via.placeholder.com/600x600?text=Product+Image`,
      });
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto:good' },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }
    );

    stream.end(buffer);
  });
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId
 */
exports.deleteFromCloudinary = async (publicId) => {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name' ||
    publicId.startsWith('mock_')
  ) {
    return { result: 'ok' }; // Mock mode
  }

  return cloudinary.uploader.destroy(publicId);
};
