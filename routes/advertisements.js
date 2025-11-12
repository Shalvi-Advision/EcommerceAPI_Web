const express = require('express');
const router = express.Router();

const Advertisement = require('../models/Advertisement');

const parseBoolean = (value, defaultValue) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const lowered = value.trim().toLowerCase();
    if (lowered === 'true') {
      return true;
    }
    if (lowered === 'false') {
      return false;
    }
  }

  return defaultValue;
};

const parseNumber = (value, defaultValue) => {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : defaultValue;
};

const parseDate = (value) => {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

const normalizeBannerInput = ({ banner_urls, banner_url }) => {
  let normalizedBannerUrl = banner_url ? banner_url.toString().trim() : '';
  let normalizedBannerUrls;

  if (banner_urls && typeof banner_urls === 'object') {
    const desktop = banner_urls.desktop ? banner_urls.desktop.toString().trim() : '';
    const mobile = banner_urls.mobile ? banner_urls.mobile.toString().trim() : '';

    if (!desktop && !mobile) {
      throw new Error('At least one of banner_urls.desktop or banner_urls.mobile must be provided');
    }

    normalizedBannerUrls = {};
    if (desktop) {
      normalizedBannerUrls.desktop = desktop;
    }
    if (mobile) {
      normalizedBannerUrls.mobile = mobile;
    }

    if (!normalizedBannerUrl) {
      normalizedBannerUrl = desktop || mobile;
    }
  }

  if (!normalizedBannerUrl) {
    throw new Error('banner_url is required');
  }

  return {
    banner_url: normalizedBannerUrl,
    banner_urls: normalizedBannerUrls
  };
};

router.post('/', async (req, res, next) => {
  try {
    const {
      title,
      description,
      banner_url,
      banner_urls,
      redirect_url,
      category,
      is_active,
      start_date,
      end_date,
      sequence,
      metadata
    } = req.body;

    if (!title || title.toString().trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'title is required'
      });
    }

    if (!category || category.toString().trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'category is required'
      });
    }

    let normalizedBannerData;
    try {
      normalizedBannerData = normalizeBannerInput({ banner_url, banner_urls });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message || 'Invalid banner data provided'
      });
    }

    const parsedStartDate = parseDate(start_date);
    if (!parsedStartDate) {
      return res.status(400).json({
        success: false,
        error: 'start_date is required and must be a valid date'
      });
    }

    const parsedEndDate = parseDate(end_date);

    const advertisement = new Advertisement({
      title: title.toString().trim(),
      description: description && description.toString().trim() !== '' ? description.toString().trim() : undefined,
      banner_url: normalizedBannerData.banner_url,
      banner_urls: normalizedBannerData.banner_urls,
      redirect_url: redirect_url && redirect_url.toString().trim() !== '' ? redirect_url.toString().trim() : undefined,
      category: category.toString().trim(),
      is_active: parseBoolean(is_active, true),
      start_date: parsedStartDate,
      end_date: parsedEndDate || undefined,
      sequence: parseNumber(sequence, 0),
      metadata: metadata && typeof metadata === 'object' ? metadata : {}
    });

    const savedAdvertisement = await advertisement.save();

    res.status(201).json({
      success: true,
      message: 'Advertisement created successfully',
      data: savedAdvertisement
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const {
      category,
      is_active,
      active_only,
      active_on,
      include_expired,
      limit
    } = req.query;

    const filters = {};

    if (category && category.toString().trim() !== '') {
      filters.category = category.toString().trim();
    }

    const parsedIsActive = parseBoolean(is_active, null);
    if (parsedIsActive !== null) {
      filters.is_active = parsedIsActive;
    }

    const shouldOnlyActive = parseBoolean(active_only, false);
    const activeDate = parseDate(active_on) || new Date();
    const includeExpired = parseBoolean(include_expired, false);

    if (shouldOnlyActive) {
      filters.is_active = true;
      filters.start_date = { $lte: activeDate };
      filters.$or = [
        { end_date: { $exists: false } },
        { end_date: null },
        { end_date: { $gte: activeDate } }
      ];
    } else if (!includeExpired) {
      filters.$or = [
        { end_date: { $exists: false } },
        { end_date: null },
        { end_date: { $gte: new Date() } }
      ];
    }

    const query = Advertisement.find(filters).sort({ sequence: 1, start_date: -1, createdAt: -1 });

    if (limit && Number.isFinite(Number(limit))) {
      query.limit(Number(limit));
    }

    const advertisements = await query.lean();

    res.status(200).json({
      success: true,
      count: advertisements.length,
      message: `Found ${advertisements.length} advertisement(s)`,
      data: advertisements
    });
  } catch (error) {
    next(error);
  }
});

router.get('/active', async (req, res, next) => {
  try {
    const { category, active_on, limit } = req.query;

    const activeDate = parseDate(active_on) || new Date();

    const advertisements = await Advertisement.findActive({
      category: category && category.toString().trim() !== '' ? category.toString().trim() : null,
      activeOn: activeDate,
      limit: limit && Number.isFinite(Number(limit)) ? Number(limit) : null
    }).lean();

    res.status(200).json({
      success: true,
      count: advertisements.length,
      message: `Found ${advertisements.length} active advertisement(s)`,
      data: advertisements
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const advertisement = await Advertisement.findById(id).lean();

    if (!advertisement) {
      return res.status(404).json({
        success: false,
        error: 'Advertisement not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Advertisement fetched successfully',
      data: advertisement
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      banner_url,
      banner_urls,
      redirect_url,
      category,
      is_active,
      start_date,
      end_date,
      sequence,
      metadata
    } = req.body;

    const updatePayload = {};

    if (title !== undefined) {
      if (title === null || title.toString().trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'title cannot be empty'
        });
      }
      updatePayload.title = title.toString().trim();
    }

    if (description !== undefined) {
      updatePayload.description = description && description.toString().trim() !== ''
        ? description.toString().trim()
        : undefined;
    }

    if (banner_url !== undefined || banner_urls !== undefined) {
      let normalizedBannerData;
      try {
        normalizedBannerData = normalizeBannerInput({
          banner_url: banner_url !== undefined ? banner_url : updatePayload.banner_url,
          banner_urls
        });
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: error.message || 'Invalid banner data provided'
        });
      }

      updatePayload.banner_url = normalizedBannerData.banner_url;
      updatePayload.banner_urls = normalizedBannerData.banner_urls;
    }

    if (redirect_url !== undefined) {
      updatePayload.redirect_url = redirect_url && redirect_url.toString().trim() !== ''
        ? redirect_url.toString().trim()
        : undefined;
    }

    if (category !== undefined) {
      if (category === null || category.toString().trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'category cannot be empty'
        });
      }
      updatePayload.category = category.toString().trim();
    }

    if (is_active !== undefined) {
      updatePayload.is_active = parseBoolean(is_active, true);
    }

    if (start_date !== undefined) {
      const parsedStartDate = parseDate(start_date);
      if (!parsedStartDate) {
        return res.status(400).json({
          success: false,
          error: 'start_date must be a valid date'
        });
      }
      updatePayload.start_date = parsedStartDate;
    }

    if (end_date !== undefined) {
      const parsedEndDate = parseDate(end_date);
      updatePayload.end_date = parsedEndDate || undefined;
    }

    if (sequence !== undefined) {
      updatePayload.sequence = parseNumber(sequence, 0);
    }

    if (metadata !== undefined) {
      updatePayload.metadata = metadata && typeof metadata === 'object' ? metadata : {};
    }

    const updatedAdvertisement = await Advertisement.findByIdAndUpdate(
      id,
      updatePayload,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedAdvertisement) {
      return res.status(404).json({
        success: false,
        error: 'Advertisement not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Advertisement updated successfully',
      data: updatedAdvertisement
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedAdvertisement = await Advertisement.findByIdAndDelete(id);

    if (!deletedAdvertisement) {
      return res.status(404).json({
        success: false,
        error: 'Advertisement not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Advertisement deleted successfully',
      data: {
        id: deletedAdvertisement._id
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

