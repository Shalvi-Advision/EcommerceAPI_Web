const express = require('express');
const router = express.Router();

const PopularCategory = require('../models/PopularCategory');
const Subcategory = require('../models/Subcategory');
const { normalizeStoreCodes } = require('../utils/routeHelpers');

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

const normalizeSubcategoriesInput = (rawSubcategories) => {
  let subcategoryList = rawSubcategories;

  if (Array.isArray(subcategoryList)) {
    // ok
  } else if (subcategoryList && typeof subcategoryList === 'object') {
    subcategoryList = Object.values(subcategoryList);
  } else {
    subcategoryList = [];
  }

  return subcategoryList.map((item, index) => {
    if (typeof item === 'string' || typeof item === 'number') {
      return {
        sub_category_id: item.toString().trim(),
        position: index,
        metadata: {}
      };
    }

    if (!item || typeof item !== 'object') {
      throw new Error(`Invalid subcategory format at index ${index}`);
    }

    const {
      sub_category_id,
      subcategory_id,
      store_code,
      position,
      metadata,
      redirect_url,
      ...rest
    } = item;

    const resolvedSubCategoryId = (sub_category_id || subcategory_id);

    if (!resolvedSubCategoryId || resolvedSubCategoryId.toString().trim() === '') {
      throw new Error(`Subcategory at index ${index} is missing sub_category_id`);
    }

    const normalizedPosition = parseNumber(position, index);
    const normalizedStoreCode = store_code ? store_code.toString().trim() : undefined;

    let normalizedMetadata = metadata;
    if (!normalizedMetadata || typeof normalizedMetadata !== 'object') {
      normalizedMetadata = {};
    }

    Object.entries(rest).forEach(([key, value]) => {
      if (value !== undefined) {
        normalizedMetadata[key] = value;
      }
    });

    const normalizedItem = {
      sub_category_id: resolvedSubCategoryId.toString().trim(),
      position: normalizedPosition,
      metadata: normalizedMetadata
    };

    if (redirect_url !== undefined && redirect_url !== null) {
      const trimmedRedirect = redirect_url.toString().trim();
      if (trimmedRedirect !== '') {
        normalizedItem.redirect_url = trimmedRedirect;
      }
    }

    if (normalizedStoreCode) {
      normalizedItem.store_code = normalizedStoreCode;
    }

    return normalizedItem;
  });
};

const resolveBannerUrls = ({ banner_urls, banner_url_desktop, banner_url_mobile, banner_url }) => {
  if (banner_urls && typeof banner_urls === 'object') {
    const desktop = banner_urls.desktop ? banner_urls.desktop.toString().trim() : '';
    const mobile = banner_urls.mobile ? banner_urls.mobile.toString().trim() : '';

    if (!desktop || !mobile) {
      throw new Error('banner_urls.desktop and banner_urls.mobile are required');
    }

    return { desktop, mobile };
  }

  const desktop = banner_url_desktop ? banner_url_desktop.toString().trim() : banner_url ? banner_url.toString().trim() : '';
  const mobile = banner_url_mobile ? banner_url_mobile.toString().trim() : '';

  if (!desktop || !mobile) {
    throw new Error('banner_url_desktop and banner_url_mobile are required');
  }

  return { desktop, mobile };
};

const mapSubcategory = (subcategory) => ({
  id: subcategory._id,
  idsub_category_master: subcategory.idsub_category_master,
  sub_category_name: subcategory.sub_category_name,
  category_id: subcategory.category_id,
  main_category_name: subcategory.main_category_name,
  dept_id: subcategory.dept_id,
  store_code: subcategory.store_code,
  sequence_id: subcategory.sequence_id,
  image_link: subcategory.image_link,
  sub_category_bg_color: subcategory.sub_category_bg_color
});

router.post('/', async (req, res, next) => {
  try {
    const {
      banner_urls,
      banner_url,
      banner_url_desktop,
      banner_url_mobile,
      background_color,
      title,
      description,
      store_code,
      store_codes,
      sequence,
      is_active,
      subcategories,
      redirect_url
    } = req.body;

    let normalizedBannerUrls;
    try {
      normalizedBannerUrls = resolveBannerUrls({ banner_urls, banner_url, banner_url_desktop, banner_url_mobile });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message || 'Invalid banner URLs provided'
      });
    }

    if (!background_color || background_color.toString().trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'background_color is required'
      });
    }

    if (!title || title.toString().trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'title is required'
      });
    }

    const normalizedSubcategories = normalizeSubcategoriesInput(subcategories || []);

    if (!normalizedSubcategories.length) {
      return res.status(400).json({
        success: false,
        error: 'At least one subcategory must be provided'
      });
    }

    const normalizedStoreCodes = normalizeStoreCodes(store_code, store_codes);

    const popularCategoryData = {
      banner_urls: normalizedBannerUrls,
      background_color: background_color.toString().trim(),
      title: title.toString().trim(),
      description: description && description.toString().trim() !== '' ? description.toString().trim() : undefined,
      subcategories: normalizedSubcategories,
      is_active: parseBoolean(is_active, true),
      sequence: parseNumber(sequence, 0)
    };

    if (normalizedStoreCodes && normalizedStoreCodes.length > 0) {
      popularCategoryData.store_codes = normalizedStoreCodes;
      popularCategoryData.store_code = normalizedStoreCodes[0];
    } else {
      popularCategoryData.store_code = null;
      popularCategoryData.store_codes = undefined;
    }

    if (redirect_url !== undefined) {
      if (redirect_url === null) {
        popularCategoryData.redirect_url = null;
      } else {
        const trimmedRedirect = redirect_url.toString().trim();
        popularCategoryData.redirect_url = trimmedRedirect !== '' ? trimmedRedirect : null;
      }
    }

    const popularCategory = new PopularCategory(popularCategoryData);

    const savedPopularCategory = await popularCategory.save();

    res.status(201).json({
      success: true,
      message: 'Popular category section created successfully',
      data: savedPopularCategory
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

router.post('/list', async (req, res, next) => {
  try {
    const {
      store_code,
      include_inactive,
      enrich_subcategories
    } = req.body;

    const includeInactive = parseBoolean(include_inactive, false);
    const shouldEnrich = parseBoolean(enrich_subcategories, false);

    const query = {};

    if (!includeInactive) {
      query.is_active = true;
    }

    if (store_code && store_code.toString().trim() !== '') {
      const trimmedCode = store_code.toString().trim();
      query.$or = [
        { store_codes: trimmedCode },
        { store_code: trimmedCode }
      ];
    }

    const popularCategories = await PopularCategory.find(query).sort({ sequence: 1, createdAt: -1 }).lean();

    if (!popularCategories.length) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: 'No popular category sections found',
        data: []
      });
    }

    let responseData = popularCategories;

    if (shouldEnrich) {
      const subcategoryIds = Array.from(new Set(
        popularCategories.flatMap(section => section.subcategories.map(item => item.sub_category_id))
      ));

      const subcategoriesFromDb = await Subcategory.find({
        idsub_category_master: { $in: subcategoryIds }
      });

      const subcategoryMap = new Map();
      subcategoriesFromDb.forEach((subcategory) => {
        subcategoryMap.set(subcategory.idsub_category_master, mapSubcategory(subcategory));
      });

      responseData = popularCategories.map((section) => ({
        ...section,
        subcategories: section.subcategories.map((item) => ({
          ...item,
          subcategory_details: subcategoryMap.get(item.sub_category_id) || null
        }))
      }));
    }

    res.status(200).json({
      success: true,
      count: responseData.length,
      message: `Found ${responseData.length} popular category section(s)`,
      data: responseData
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { enrich_subcategories } = req.query;
    const shouldEnrich = parseBoolean(enrich_subcategories, false);

    const popularCategory = await PopularCategory.findById(id).lean();

    if (!popularCategory) {
      return res.status(404).json({
        success: false,
        error: 'Popular category section not found'
      });
    }

    let responseData = popularCategory;

    if (shouldEnrich) {
      const subcategoryIds = popularCategory.subcategories.map(item => item.sub_category_id);

      const subcategoriesFromDb = await Subcategory.find({
        idsub_category_master: { $in: subcategoryIds }
      });

      const subcategoryMap = new Map();
      subcategoriesFromDb.forEach((subcategory) => {
        subcategoryMap.set(subcategory.idsub_category_master, mapSubcategory(subcategory));
      });

      responseData = {
        ...popularCategory,
        subcategories: popularCategory.subcategories.map((item) => ({
          ...item,
          subcategory_details: subcategoryMap.get(item.sub_category_id) || null
        }))
      };
    }

    res.status(200).json({
      success: true,
      message: 'Popular category section fetched successfully',
      data: responseData
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      banner_urls,
      banner_url,
      banner_url_desktop,
      banner_url_mobile,
      background_color,
      title,
      description,
      store_code,
      store_codes,
      sequence,
      is_active,
      subcategories,
      redirect_url
    } = req.body;

    const updatePayload = {};

    const hasLegacyBannerUrl = banner_url !== undefined;
    const hasDesktopBannerUrl = banner_url_desktop !== undefined;
    const hasMobileBannerUrl = banner_url_mobile !== undefined;

    if (banner_urls !== undefined) {
      if (!banner_urls || typeof banner_urls !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'banner_urls must be an object containing desktop and mobile URLs'
        });
      }

      const desktop = banner_urls.desktop ? banner_urls.desktop.toString().trim() : '';
      const mobile = banner_urls.mobile ? banner_urls.mobile.toString().trim() : '';

      if (!desktop || !mobile) {
        return res.status(400).json({
          success: false,
          error: 'banner_urls.desktop and banner_urls.mobile cannot be empty'
        });
      }

      updatePayload.banner_urls = { desktop, mobile };
    } else if (hasLegacyBannerUrl || hasDesktopBannerUrl || hasMobileBannerUrl) {
      if (hasLegacyBannerUrl) {
        return res.status(400).json({
          success: false,
          error: 'banner_url is no longer supported. Please provide banner_url_desktop and banner_url_mobile.'
        });
      }

      if (!hasDesktopBannerUrl || !hasMobileBannerUrl) {
        return res.status(400).json({
          success: false,
          error: 'Both banner_url_desktop and banner_url_mobile must be provided together'
        });
      }

      const desktop = banner_url_desktop ? banner_url_desktop.toString().trim() : '';
      const mobile = banner_url_mobile ? banner_url_mobile.toString().trim() : '';

      if (!desktop || !mobile) {
        return res.status(400).json({
          success: false,
          error: 'banner_url_desktop and banner_url_mobile cannot be empty'
        });
      }

      updatePayload.banner_urls = { desktop, mobile };
    }

    if (background_color !== undefined) {
      if (background_color === null || background_color.toString().trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'background_color cannot be empty'
        });
      }
      updatePayload.background_color = background_color.toString().trim();
    }

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

    if (store_code !== undefined || store_codes !== undefined) {
      const normalizedStoreCodes = normalizeStoreCodes(store_code, store_codes);

      if (normalizedStoreCodes && normalizedStoreCodes.length > 0) {
        updatePayload.store_codes = normalizedStoreCodes;
        updatePayload.store_code = normalizedStoreCodes[0];
      } else {
        updatePayload.store_code = null;
        updatePayload.store_codes = undefined;
      }
    }

    if (subcategories !== undefined) {
      const normalizedSubcategories = normalizeSubcategoriesInput(subcategories);

      if (!normalizedSubcategories.length) {
        return res.status(400).json({
          success: false,
          error: 'At least one subcategory must be provided'
        });
      }

      updatePayload.subcategories = normalizedSubcategories;
    }

    if (is_active !== undefined) {
      updatePayload.is_active = parseBoolean(is_active, true);
    }

    if (sequence !== undefined) {
      updatePayload.sequence = parseNumber(sequence, 0);
    }

    if (redirect_url !== undefined) {
      if (redirect_url === null) {
        updatePayload.redirect_url = null;
      } else {
        const trimmedRedirect = redirect_url.toString().trim();
        updatePayload.redirect_url = trimmedRedirect !== '' ? trimmedRedirect : null;
      }
    }

    const updatedPopularCategory = await PopularCategory.findByIdAndUpdate(
      id,
      updatePayload,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedPopularCategory) {
      return res.status(404).json({
        success: false,
        error: 'Popular category section not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Popular category section updated successfully',
      data: updatedPopularCategory
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

    const deletedPopularCategory = await PopularCategory.findByIdAndDelete(id);

    if (!deletedPopularCategory) {
      return res.status(404).json({
        success: false,
        error: 'Popular category section not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Popular category section deleted successfully',
      data: {
        id: deletedPopularCategory._id
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

