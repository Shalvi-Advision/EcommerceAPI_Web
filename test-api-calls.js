const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001/api';

async function testAPI() {
  console.log(`🧪 Testing API endpoints at: ${API_BASE_URL}\n`);

  try {
    // Test 1: Best Sellers List
    console.log('📊 Test 1: POST /best-sellers/list');
    const bestSellersResponse = await fetch(`${API_BASE_URL}/best-sellers/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        store_code: 'AVB',
        enrich_products: true
      })
    });

    console.log(`   Status: ${bestSellersResponse.status}`);
    const bestSellersData = await bestSellersResponse.json();
    console.log(`   Success: ${bestSellersData.success}`);
    console.log(`   Count: ${bestSellersData.count}`);
    console.log(`   Message: ${bestSellersData.message}`);
    if (bestSellersData.data && bestSellersData.data.length > 0) {
      console.log(`   First section title: ${bestSellersData.data[0].title}`);
      console.log(`   Products in first section: ${bestSellersData.data[0].products?.length || 0}`);
      if (bestSellersData.data[0].products && bestSellersData.data[0].products[0]) {
        console.log(`   First product has product_details: ${!!bestSellersData.data[0].products[0].product_details}`);
      }
    }
    console.log('');

    // Test 2: Popular Categories List
    console.log('📊 Test 2: POST /popular-categories/list');
    const popularCategoriesResponse = await fetch(`${API_BASE_URL}/popular-categories/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        store_code: 'AVB',
        enrich_subcategories: true
      })
    });

    console.log(`   Status: ${popularCategoriesResponse.status}`);
    const popularCategoriesData = await popularCategoriesResponse.json();
    console.log(`   Success: ${popularCategoriesData.success}`);
    console.log(`   Count: ${popularCategoriesData.count}`);
    console.log(`   Message: ${popularCategoriesData.message}`);
    if (popularCategoriesData.data && popularCategoriesData.data.length > 0) {
      console.log(`   First section title: ${popularCategoriesData.data[0].title}`);
      console.log(`   Subcategories in first section: ${popularCategoriesData.data[0].subcategories?.length || 0}`);
      if (popularCategoriesData.data[0].subcategories && popularCategoriesData.data[0].subcategories[0]) {
        console.log(`   First subcategory has subcategory_details: ${!!popularCategoriesData.data[0].subcategories[0].subcategory_details}`);
      }
    }
    console.log('');

    // Test 3: Advertisements Active
    console.log('📊 Test 3: POST /advertisements/active');
    const advertisementsResponse = await fetch(`${API_BASE_URL}/advertisements/active`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        store_code: 'AVB',
        category: 'homepage',
        enrich_products: true
      })
    });

    console.log(`   Status: ${advertisementsResponse.status}`);
    const advertisementsData = await advertisementsResponse.json();
    console.log(`   Success: ${advertisementsData.success}`);
    console.log(`   Count: ${advertisementsData.count}`);
    console.log(`   Message: ${advertisementsData.message}`);
    if (advertisementsData.data && advertisementsData.data.length > 0) {
      console.log(`   First ad title: ${advertisementsData.data[0].title}`);
      console.log(`   Products in first ad: ${advertisementsData.data[0].products?.length || 0}`);
      if (advertisementsData.data[0].products && advertisementsData.data[0].products[0]) {
        console.log(`   First product has product_details: ${!!advertisementsData.data[0].products[0].product_details}`);
      }
    }
    console.log('');

    console.log('✅ All API tests completed successfully!');
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    console.error(error);
  }
}

testAPI();
