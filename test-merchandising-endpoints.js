require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('./config/database');

// Import models
const BestSeller = require('./models/BestSeller');
const PopularCategory = require('./models/PopularCategory');
const Advertisement = require('./models/Advertisement');
const ProductMaster = require('./models/ProductMaster');
const Subcategory = require('./models/Subcategory');

async function testEndpoints() {
  try {
    console.log('🔗 Connecting to database...');
    await connectDB();
    console.log('✅ Connected to database successfully!\n');

    // Test Best Sellers
    console.log('📊 Testing Best Sellers...');
    const bestSellers = await BestSeller.find({}).lean();
    console.log(`   Found ${bestSellers.length} best seller sections`);
    if (bestSellers.length > 0) {
      console.log('   Sample:', JSON.stringify(bestSellers[0], null, 2));
    } else {
      console.log('   ⚠️  No best seller data found in database');
    }
    console.log('');

    // Test Popular Categories
    console.log('📊 Testing Popular Categories...');
    const popularCategories = await PopularCategory.find({}).lean();
    console.log(`   Found ${popularCategories.length} popular category sections`);
    if (popularCategories.length > 0) {
      console.log('   Sample:', JSON.stringify(popularCategories[0], null, 2));
    } else {
      console.log('   ⚠️  No popular category data found in database');
    }
    console.log('');

    // Test Advertisements
    console.log('📊 Testing Advertisements...');
    const advertisements = await Advertisement.find({}).lean();
    console.log(`   Found ${advertisements.length} advertisements`);
    if (advertisements.length > 0) {
      console.log('   Sample:', JSON.stringify(advertisements[0], null, 2));
    } else {
      console.log('   ⚠️  No advertisement data found in database');
    }
    console.log('');

    // Test Products
    console.log('📊 Testing Products...');
    const products = await ProductMaster.find({}).limit(3).lean();
    console.log(`   Found ${products.length} products (showing first 3)`);
    if (products.length > 0) {
      console.log('   Sample p_codes:', products.map(p => p.p_code).join(', '));
    } else {
      console.log('   ⚠️  No product data found in database');
    }
    console.log('');

    // Test Subcategories
    console.log('📊 Testing Subcategories...');
    const subcategories = await Subcategory.find({}).limit(3).lean();
    console.log(`   Found ${subcategories.length} subcategories (showing first 3)`);
    if (subcategories.length > 0) {
      console.log('   Sample IDs:', subcategories.map(s => s.idsub_category_master).join(', '));
    } else {
      console.log('   ⚠️  No subcategory data found in database');
    }
    console.log('');

    console.log('✅ All tests completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testEndpoints();
