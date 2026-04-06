const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function main() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('productmasters');

    // Get 30 active products with good variety (different categories)
    const products = await collection.find(
      { pcode_status: 'Y' }
    ).limit(30).toArray();

    console.log(`\nFound ${products.length} products\n`);

    // Display product details
    console.log('=== BEST SELLER PRODUCT CODES ===\n');

    const productList = products.map((p, index) => ({
      p_code: p.p_code,
      product_name: p.product_name,
      our_price: p.our_price ? parseFloat(p.our_price.toString()) : 0,
      product_mrp: p.product_mrp ? parseFloat(p.product_mrp.toString()) : 0,
      store_code: p.store_code,
      position: index
    }));

    productList.forEach((p, i) => {
      console.log(`${i + 1}. p_code: "${p.p_code}" | ${p.product_name} | MRP: ${p.product_mrp} | Price: ${p.our_price} | Store: ${p.store_code}`);
    });

    // Output the products array formatted for the Best Sellers API
    console.log('\n=== PRODUCTS ARRAY FOR BEST SELLERS API ===\n');

    const bestSellerProducts = productList.map((p, index) => ({
      p_code: p.p_code,
      position: index
    }));

    console.log(JSON.stringify(bestSellerProducts, null, 2));

    // Output a complete POST body example
    console.log('\n=== COMPLETE API POST BODY EXAMPLE ===\n');

    const postBody = {
      store_code: productList[0]?.store_code || "STORE001",
      banner_urls: {
        desktop: "https://example.com/banner-desktop.jpg",
        mobile: "https://example.com/banner-mobile.jpg"
      },
      background_color: "#FFFFFF",
      title: "Best Sellers",
      description: "Our top 30 best selling products",
      products: bestSellerProducts,
      is_active: true,
      sequence: 1
    };

    console.log(JSON.stringify(postBody, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

main();
