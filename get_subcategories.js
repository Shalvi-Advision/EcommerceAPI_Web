const mongoose = require('mongoose');
require('dotenv').config();

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('productmasters');

    // Get distinct sub_category_ids with their category and department info
    const subcategories = await collection.aggregate([
      { $match: { pcode_status: 'Y' } },
      {
        $group: {
          _id: '$sub_category_id',
          dept_id: { $first: '$dept_id' },
          category_id: { $first: '$category_id' },
          store_code: { $first: '$store_code' },
          product_count: { $sum: 1 },
          sample_product: { $first: '$product_name' }
        }
      },
      { $sort: { product_count: -1 } },
      { $limit: 30 }
    ]).toArray();

    console.log(`\nFound ${subcategories.length} sub-categories\n`);

    subcategories.forEach((sc, i) => {
      console.log(`${i + 1}. sub_category_id: "${sc._id}" | dept: ${sc.dept_id} | cat: ${sc.category_id} | store: ${sc.store_code} | products: ${sc.product_count} | e.g. ${sc.sample_product}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

main();
