const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');

// @route   POST /api/banners
// @desc    Get banners grouped by sections (supports store filtering)
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { store_code, section_name } = req.body;

    let banners;

    // If store_code is provided, filter by store
    if (store_code) {
      const storeCodes = Array.isArray(store_code) ? store_code : [store_code];
      banners = await Banner.findByStoreCodes({
        storeCodes,
        sectionName: section_name,
        activeOnly: true
      });
    } else {
      // Get all active banners
      banners = await Banner.findActive({
        sectionName: section_name
      });
    }

    // Group banners by sections
    const bannerSections = await Banner.groupBySections(banners);

    res.status(200).json({
      success: true,
      data: {
        banner_sections: bannerSections
      }
    });
  } catch (error) {
    console.error('Get banners error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching banners',
      error: error.message
    });
  }
});

// @route   GET /api/banners
// @desc    Get banners grouped by sections (legacy support)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { store_code, section_name } = req.query;

    let banners;

    // If store_code is provided, filter by store
    if (store_code) {
      const storeCodes = Array.isArray(store_code) ? store_code : [store_code];
      banners = await Banner.findByStoreCodes({
        storeCodes,
        sectionName: section_name,
        activeOnly: true
      });
    } else {
      // Get all active banners
      banners = await Banner.findActive({
        sectionName: section_name
      });
    }

    // Group banners by sections
    const bannerSections = await Banner.groupBySections(banners);

    res.status(200).json({
      success: true,
      data: {
        banner_sections: bannerSections
      }
    });
  } catch (error) {
    console.error('Get banners error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching banners',
      error: error.message
    });
  }
});

module.exports = router;
