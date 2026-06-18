// Usage: node seed-merchandising-data.js <tenantSlug>
require('dotenv').config();
const { openTenant } = require('./scripts/lib/tenantScript');

async function seedMerchandisingData() {
  let close;
  try {
    console.log('🔗 Connecting to database...');
    const tenant = await openTenant(process.argv[2]);
    close = tenant.close;
    const { BestSeller, PopularCategory, Advertisement, ProductMaster, Subcategory } = tenant.models;
    console.log('✅ Connected to database successfully!\n');

    // Get sample product codes from database
    const sampleProducts = await ProductMaster.find({ pcode_status: 'Y' }).limit(10).lean();
    console.log(`📦 Found ${sampleProducts.length} sample products`);

    if (sampleProducts.length === 0) {
      console.error('❌ No products found in database. Please add products first.');
      if (close) await close();
      process.exit(1);
    }

    const productCodes = sampleProducts.map(p => p.p_code);
    console.log(`   Using p_codes: ${productCodes.slice(0, 5).join(', ')}...\n`);

    // Get sample subcategories
    const sampleSubcategories = await Subcategory.find({}).limit(10).lean();
    console.log(`📂 Found ${sampleSubcategories.length} sample subcategories`);

    if (sampleSubcategories.length === 0) {
      console.error('❌ No subcategories found in database. Please add subcategories first.');
      if (close) await close();
      process.exit(1);
    }

    const subcategoryIds = sampleSubcategories.map(s => s.idsub_category_master);
    console.log(`   Using sub_category_ids: ${subcategoryIds.slice(0, 5).join(', ')}...\n`);

    // Fix existing best sellers
    console.log('🔄 Fixing existing best sellers...');
    const existingBestSellers = await BestSeller.find({}).lean();
    for (const bs of existingBestSellers) {
      const updates = {};

      // Fix banner_urls if missing
      if (!bs.banner_urls || !bs.banner_urls.desktop || !bs.banner_urls.mobile) {
        updates.banner_urls = {
          desktop: bs.banner_url || 'https://img.freepik.com/free-vector/decorative-shubh-diwali-discount-offer-banner_1017-40224.jpg',
          mobile: bs.banner_url || 'https://img.freepik.com/free-vector/decorative-shubh-diwali-discount-offer-banner_1017-40224.jpg'
        };
      }

      // Fix store_codes if missing
      if (!bs.store_codes && bs.store_code) {
        updates.store_codes = [bs.store_code];
      }

      // Fix products if empty
      if (!bs.products || bs.products.length === 0) {
        updates.products = productCodes.slice(0, 5).map((p_code, index) => ({
          p_code,
          position: index,
          metadata: {},
          redirect_url: `app://product/${p_code}`
        }));
      }

      if (Object.keys(updates).length > 0) {
        await BestSeller.findByIdAndUpdate(bs._id, updates);
        console.log(`   ✅ Fixed best seller: ${bs.title}`);
      }
    }

    // Fix existing popular categories
    console.log('\n🔄 Fixing existing popular categories...');
    const existingPopularCategories = await PopularCategory.find({}).lean();
    for (const pc of existingPopularCategories) {
      const updates = {};

      // Fix store_codes if missing
      if (!pc.store_codes && pc.store_code) {
        updates.store_codes = [pc.store_code];
      }

      // Fix subcategories if empty
      if (!pc.subcategories || pc.subcategories.length === 0) {
        updates.subcategories = subcategoryIds.slice(0, 5).map((sub_category_id, index) => ({
          sub_category_id,
          position: index,
          metadata: {},
          redirect_url: `app://category/${sub_category_id}`
        }));
      }

      if (Object.keys(updates).length > 0) {
        await PopularCategory.findByIdAndUpdate(pc._id, updates);
        console.log(`   ✅ Fixed popular category: ${pc.title}`);
      }
    }

    // Fix existing advertisements
    console.log('\n🔄 Fixing existing advertisements...');
    const existingAdvertisements = await Advertisement.find({}).lean();
    for (const ad of existingAdvertisements) {
      const updates = {};

      // Fix store_codes if missing
      if (!ad.store_codes && !ad.store_code) {
        updates.store_code = 'AVB';
        updates.store_codes = ['AVB'];
      } else if (!ad.store_codes && ad.store_code) {
        updates.store_codes = [ad.store_code];
      }

      // Fix banner_urls if missing
      if (!ad.banner_urls) {
        updates.banner_urls = {
          desktop: ad.banner_url,
          mobile: ad.banner_url
        };
      }

      // Fix products if missing or empty
      if (!ad.products || ad.products.length === 0) {
        updates.products = productCodes.slice(0, 3).map((p_code, index) => ({
          p_code,
          position: index,
          metadata: {},
          redirect_url: `app://product/${p_code}`
        }));
      }

      if (Object.keys(updates).length > 0) {
        await Advertisement.findByIdAndUpdate(ad._id, updates);
        console.log(`   ✅ Fixed advertisement: ${ad.title}`);
      }
    }

    // Create new test data if none exists
    if (existingBestSellers.length === 0) {
      console.log('\n📝 Creating new best seller sections...');
      const newBestSeller = await BestSeller.create({
        store_code: 'AVB',
        store_codes: ['AVB'],
        banner_urls: {
          desktop: 'https://img.freepik.com/free-vector/gradient-flash-sale-banner-with-photo_52683-76133.jpg',
          mobile: 'https://img.freepik.com/free-vector/gradient-flash-sale-banner-with-photo_52683-76133.jpg'
        },
        background_color: '#FFE5E5',
        title: 'Best Sellers This Week',
        description: 'Top picks from our customers',
        products: productCodes.slice(0, 6).map((p_code, index) => ({
          p_code,
          position: index,
          metadata: {},
          redirect_url: `app://product/${p_code}`
        })),
        is_active: true,
        sequence: 1,
        redirect_url: 'app://best-sellers'
      });
      console.log(`   ✅ Created: ${newBestSeller.title}`);
    }

    if (existingPopularCategories.length === 0) {
      console.log('\n📝 Creating new popular category sections...');
      const newPopularCategory = await PopularCategory.create({
        store_code: 'AVB',
        store_codes: ['AVB'],
        banner_urls: {
          desktop: 'https://img.freepik.com/free-vector/organic-flat-sale-banner_23-2149020736.jpg',
          mobile: 'https://img.freepik.com/free-vector/organic-flat-sale-banner_23-2149020736.jpg'
        },
        background_color: '#E8F5E9',
        title: 'Popular Categories',
        description: 'Shop from trending categories',
        subcategories: subcategoryIds.slice(0, 8).map((sub_category_id, index) => ({
          sub_category_id,
          position: index,
          metadata: {},
          redirect_url: `app://category/${sub_category_id}`
        })),
        is_active: true,
        sequence: 1,
        redirect_url: 'app://categories'
      });
      console.log(`   ✅ Created: ${newPopularCategory.title}`);
    }

    if (existingAdvertisements.length === 0) {
      console.log('\n📝 Creating new advertisements...');
      const newAdvertisement = await Advertisement.create({
        store_code: 'AVB',
        store_codes: ['AVB'],
        title: 'Grand Opening Sale',
        description: 'Massive discounts on all products!',
        banner_url: 'https://img.freepik.com/free-vector/modern-sale-banner-website-slider-template-design_54925-45.jpg',
        banner_urls: {
          desktop: 'https://img.freepik.com/free-vector/modern-sale-banner-website-slider-template-design_54925-45.jpg',
          mobile: 'https://img.freepik.com/free-vector/modern-sale-banner-website-slider-template-design_54925-45.jpg'
        },
        redirect_url: 'app://sales/grand-opening',
        category: 'homepage',
        products: productCodes.slice(0, 4).map((p_code, index) => ({
          p_code,
          position: index,
          metadata: {},
          redirect_url: `app://product/${p_code}`
        })),
        is_active: true,
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        sequence: 1,
        metadata: { campaign: 'grand-opening-2025' }
      });
      console.log(`   ✅ Created: ${newAdvertisement.title}`);
    }

    console.log('\n✅ Merchandising data seeded successfully!');
    console.log('\n📊 Final counts:');
    console.log(`   Best Sellers: ${await BestSeller.countDocuments({})}`);
    console.log(`   Popular Categories: ${await PopularCategory.countDocuments({})}`);
    console.log(`   Advertisements: ${await Advertisement.countDocuments({})}`);

    if (close) await close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    if (close) await close();
    process.exit(1);
  }
}

seedMerchandisingData();
