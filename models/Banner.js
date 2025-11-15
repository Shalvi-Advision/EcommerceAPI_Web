const mongoose = require('mongoose');

const bannerActionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Action type is required'],
    enum: ['category', 'product', 'url', 'none'],
    trim: true
  },
  value: {
    type: String,
    trim: true
  }
}, { _id: false });

const bannerAssetSchema = new mongoose.Schema({
  key: {
    type: String,
    trim: true
  },
  desktop: {
    type: String,
    trim: true
  },
  mobile: {
    type: String,
    trim: true
  }
}, { _id: false });

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  section_name: {
    type: String,
    required: [true, 'Section name is required'],
    trim: true,
    index: true
  },
  image_url: {
    type: String,
    trim: true
  },
  banner_assets: {
    type: [bannerAssetSchema],
    default: undefined,
    validate: [
      {
        validator: function(assets) {
          return !assets || assets.length <= 10;
        },
        message: 'banner_assets cannot contain more than 10 items'
      },
      {
        validator: function(assets) {
          if (!assets) {
            return true;
          }
          return assets.every(asset => (asset && (asset.desktop || asset.mobile)));
        },
        message: 'Each banner asset must include at least a desktop or mobile URL'
      }
    ]
  },
  action: {
    type: bannerActionSchema,
    required: [true, 'Action is required']
  },
  store_code: {
    type: String,
    trim: true,
    default: null
  },
  store_codes: {
    type: [String],
    default: undefined,
    validate: {
      validator: function(codes) {
        return !codes || (Array.isArray(codes) && codes.length > 0 && codes.every(code => code && code.trim() !== ''));
      },
      message: 'store_codes must be a non-empty array of valid store codes'
    }
  },
  is_active: {
    type: Boolean,
    default: true
  },
  sequence: {
    type: Number,
    default: 0
  },
  start_date: {
    type: Date,
    default: Date.now
  },
  end_date: {
    type: Date
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  collection: 'banners'
});

// Indexes for better query performance
bannerSchema.index({ section_name: 1, is_active: 1 });
bannerSchema.index({ is_active: 1, start_date: 1, end_date: 1 });
bannerSchema.index({ sequence: 1 });
bannerSchema.index({ store_code: 1, is_active: 1 });
bannerSchema.index({ store_codes: 1, is_active: 1 });
bannerSchema.index({ section_name: 1, sequence: 1 });

const buildBannerAssets = (banner) => {
  if (!banner || !Array.isArray(banner.banner_assets)) {
    return [];
  }

  return banner.banner_assets.map((asset, index) => ({
    key: (asset.key && asset.key.toString().trim()) || `bannerUrl${index + 1}`,
    desktop: asset.desktop || null,
    mobile: asset.mobile || null
  }));
};

const buildBannerUrlMap = (assets) => {
  return assets.reduce((acc, asset) => {
    acc[asset.key] = {
      desktop: asset.desktop,
      mobile: asset.mobile
    };
    return acc;
  }, {});
};

// Static method to find active banners
bannerSchema.statics.findActive = function({ sectionName = null, activeOn = new Date(), limit = null } = {}) {
  const query = {
    is_active: true,
    start_date: { $lte: activeOn }
  };

  query.$or = [
    { end_date: { $exists: false } },
    { end_date: null },
    { end_date: { $gte: activeOn } }
  ];

  if (sectionName) {
    query.section_name = sectionName;
  }

  const cursor = this.find(query).sort({ section_name: 1, sequence: 1, start_date: -1 });

  if (limit && Number.isFinite(Number(limit))) {
    cursor.limit(Number(limit));
  }

  return cursor;
};

// Static method to find banners by store codes
bannerSchema.statics.findByStoreCodes = function({ storeCodes = null, sectionName = null, activeOnly = false, activeOn = new Date(), limit = null } = {}) {
  const query = {};

  if (activeOnly) {
    query.is_active = true;
    query.start_date = { $lte: activeOn };
    query.$or = [
      { end_date: { $exists: false } },
      { end_date: null },
      { end_date: { $gte: activeOn } }
    ];
  }

  if (storeCodes && Array.isArray(storeCodes) && storeCodes.length > 0) {
    if (!query.$or) {
      query.$or = [];
    } else {
      const dateConditions = query.$or;
      delete query.$or;
      query.$and = [
        { $or: dateConditions },
        {
          $or: [
            { store_codes: { $in: storeCodes } },
            { store_code: { $in: storeCodes } }
          ]
        }
      ];
    }

    if (!query.$and) {
      query.$or = [
        { store_codes: { $in: storeCodes } },
        { store_code: { $in: storeCodes } }
      ];
    }
  }

  if (sectionName) {
    query.section_name = sectionName;
  }

  const cursor = this.find(query).sort({ section_name: 1, sequence: 1, start_date: -1 });

  if (limit && Number.isFinite(Number(limit))) {
    cursor.limit(Number(limit));
  }

  return cursor;
};

// Static method to group banners by sections
bannerSchema.statics.groupBySections = async function(banners) {
  const sectionsMap = new Map();

  banners.forEach(banner => {
    const bannerAssets = buildBannerAssets(banner);
    const bannerUrlMap = buildBannerUrlMap(bannerAssets);
    const primaryAsset = bannerAssets[0] || {};
    const legacyImageUrl = banner.image_url
      || primaryAsset.desktop
      || primaryAsset.mobile
      || null;

    const section = banner.section_name;
    if (!sectionsMap.has(section)) {
      sectionsMap.set(section, []);
    }

    sectionsMap.get(section).push({
      id: banner._id,
      title: banner.title,
      image_url: legacyImageUrl,
      action: banner.action,
      banner_urls: bannerUrlMap,
      banner_assets: bannerAssets,
      store_code: banner.store_code || null,
      store_codes: banner.store_codes || null,
      sequence: banner.sequence,
      is_active: banner.is_active,
      start_date: banner.start_date,
      end_date: banner.end_date,
      metadata: banner.metadata || {}
    });
  });

  return Array.from(sectionsMap.entries()).map(([section_name, banners]) => ({
    section_name,
    banners
  }));
};

bannerSchema.pre('validate', function(next) {
  if (Array.isArray(this.banner_assets)) {
    this.banner_assets = this.banner_assets
      .map((asset, index) => {
        if (!asset) {
          return null;
        }

        const key = asset.key && asset.key.toString().trim()
          ? asset.key.toString().trim()
          : `bannerUrl${index + 1}`;
        const desktop = asset.desktop && asset.desktop.toString().trim() !== ''
          ? asset.desktop.toString().trim()
          : undefined;
        const mobile = asset.mobile && asset.mobile.toString().trim() !== ''
          ? asset.mobile.toString().trim()
          : undefined;

        if (!desktop && !mobile) {
          return null;
        }

        return {
          key,
          desktop,
          mobile
        };
      })
      .filter(Boolean);

    if (this.banner_assets.length === 0) {
      this.banner_assets = undefined;
    }
  }

  if (!this.image_url && Array.isArray(this.banner_assets) && this.banner_assets.length > 0) {
    const primary = this.banner_assets[0];
    this.image_url = primary.desktop || primary.mobile || null;
  }

  if (!this.image_url && (!this.banner_assets || this.banner_assets.length === 0)) {
    return next(new Error('At least one banner image (desktop or mobile) is required.'));
  }

  return next();
});

module.exports = mongoose.model('Banner', bannerSchema);
