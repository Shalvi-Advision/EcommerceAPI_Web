const express = require('express');
const router = express.Router();
const Offer = require('../../models/Offer');
const { checkPermission } = require('../../middleware/checkPermission');

// @route   GET /api/admin/offers
// @desc    List all offers
// @access  Admin (offers:view)
router.get('/', checkPermission('offers', 'view'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      store_code = '',
      is_active = '',
      sortBy = 'priority',
      sortOrder = 'asc'
    } = req.query;

    const query = {};
    if (store_code) query.store_codes = store_code;
    if (is_active !== '') query.is_active = is_active === 'true';

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const offers = await Offer.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Offer.countDocuments(query);

    res.status(200).json({
      success: true,
      data: offers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get offers error:', error);
    res.status(500).json({ success: false, message: 'Error fetching offers', error: error.message });
  }
});

// @route   POST /api/admin/offers
// @desc    Create offer
// @access  Admin (offers:create)
router.post('/', checkPermission('offers', 'create'), async (req, res) => {
  try {
    const offer = await Offer.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Offer created successfully',
      data: offer
    });
  } catch (error) {
    console.error('Create offer error:', error);
    res.status(500).json({ success: false, message: 'Error creating offer', error: error.message });
  }
});

// @route   PUT /api/admin/offers/:id
// @desc    Update offer
// @access  Admin (offers:edit)
router.put('/:id', checkPermission('offers', 'edit'), async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Offer updated successfully',
      data: offer
    });
  } catch (error) {
    console.error('Update offer error:', error);
    res.status(500).json({ success: false, message: 'Error updating offer', error: error.message });
  }
});

// @route   DELETE /api/admin/offers/:id
// @desc    Delete offer
// @access  Admin (offers:delete)
router.delete('/:id', checkPermission('offers', 'delete'), async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    res.status(200).json({ success: true, message: 'Offer deleted successfully' });
  } catch (error) {
    console.error('Delete offer error:', error);
    res.status(500).json({ success: false, message: 'Error deleting offer', error: error.message });
  }
});

// @route   PATCH /api/admin/offers/:id/toggle
// @desc    Toggle offer active status
// @access  Admin (offers:edit)
router.patch('/:id/toggle', checkPermission('offers', 'edit'), async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    offer.is_active = !offer.is_active;
    await offer.save();

    res.status(200).json({
      success: true,
      message: `Offer ${offer.is_active ? 'activated' : 'deactivated'} successfully`,
      data: offer
    });
  } catch (error) {
    console.error('Toggle offer error:', error);
    res.status(500).json({ success: false, message: 'Error toggling offer', error: error.message });
  }
});

module.exports = router;
