const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { cloudinaryFor } = require('../integrations/cloudinary');
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   POST /api/upload/image
 * @desc    Upload a single image to Cloudinary
 * @access  Private (Admin only)
 */
router.post('/image', protect, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Get folder from request or use default
    const folder = req.body.folder || 'ecommerce';

    // Upload to the tenant's Cloudinary account (422 if not configured)
    const cl = cloudinaryFor(req.tenant);
    const result = await cl.upload(req.file.buffer, folder);

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.status === 422 ? error.message : 'Failed to upload image',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/upload/images
 * @desc    Upload multiple images to Cloudinary
 * @access  Private (Admin only)
 */
router.post('/images', protect, authorize('admin'), upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    // Get folder from request or use default
    const folder = req.body.folder || 'ecommerce';

    // Upload all images to the tenant's Cloudinary account (422 if not configured)
    const cl = cloudinaryFor(req.tenant);
    const uploadPromises = req.files.map(file => cl.upload(file.buffer, folder));
    const results = await Promise.all(uploadPromises);

    const uploadedImages = results.map(result => ({
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height
    }));

    res.status(200).json({
      success: true,
      message: `${uploadedImages.length} image(s) uploaded successfully`,
      data: uploadedImages
    });
  } catch (error) {
    console.error('Images upload error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.status === 422 ? error.message : 'Failed to upload images',
      error: error.message
    });
  }
});

module.exports = router;
