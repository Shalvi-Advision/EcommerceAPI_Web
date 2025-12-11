require('dotenv').config();
const { connectDB, disconnectDB, mongoose } = require('./config/database');
const fs = require('fs').promises;
const path = require('path');

const PAGARIYA_DATA_PATH = path.join(__dirname, '../Pagariya Collection');

/**
 * Get list of all JSON files in Pagariya Collection
 */
const getDataFiles = async () => {
  try {
    const files = await fs.readdir(PAGARIYA_DATA_PATH);
    return files.filter(file => file.endsWith('.json')).map(file => ({
      filename: file,
      filepath: path.join(PAGARIYA_DATA_PATH, file),
      collectionName: file.replace('MasterRetailDB.', '').replace('.json', '')
    }));
  } catch (error) {
    console.error('Error reading data files:', error.message);
    return [];
  }
};

/**
 * Read and parse JSON file
 */
const readJsonFile = async (filepath) => {
  try {
    const data = await fs.readFile(filepath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filepath}:`, error.message);
    return [];
  }
};

/**
 * Process file data for MongoDB insertion
 */
const processFileData = (data, collectionName) => {
  if (!Array.isArray(data)) {
    console.warn(`Warning: ${collectionName} data is not an array`);
    return [];
  }

  return data.map(item => {
    // Remove MongoDB ObjectId wrapper if present
    if (item._id && item._id.$oid) {
      delete item._id; // Let MongoDB generate new IDs
    }

    // Convert $numberDecimal to regular number for prices
    if (item.product_mrp && item.product_mrp.$numberDecimal) {
      item.product_mrp = parseFloat(item.product_mrp.$numberDecimal);
    }
    if (item.our_price && item.our_price.$numberDecimal) {
      item.our_price = parseFloat(item.our_price.$numberDecimal);
    }

    // Convert string "null" to actual null
    Object.keys(item).forEach(key => {
      if (item[key] === "null") {
        item[key] = null;
      }
    });

    return item;
  });
};

/**
 * Get file size for progress tracking
 */
const getFileSize = async (filepath) => {
  try {
    const stats = await fs.stat(filepath);
    return stats.size;
  } catch (error) {
    return 0;
  }
};

/**
 * Clear all existing collections
 */
async function clearDatabase() {
  console.log('🗑️  Clearing all collections in database...\n');

  try {
    const collections = [
      'addressbooks',
      'bannermasters',
      'categorymasters',
      'deliveryslots',
      'departmentmasters',
      'favoritemasters',
      'nodeprojectconfigs',
      'paymentmodes',
      'paymentstatuses',
      'pincodemasters',
      'pincodestoremasters',
      'productmasters',
      'shoppingcarts',
      'subcategorymasters',
      'userdevicetokens'
    ];

    for (const collectionName of collections) {
      try {
        const collection = mongoose.connection.db.collection(collectionName);
        const result = await collection.deleteMany({});
        console.log(`   ✅ Cleared ${collectionName}: ${result.deletedCount} records`);
      } catch (error) {
        console.log(`   ⚠️  Collection ${collectionName} doesn't exist or error: ${error.message}`);
      }
    }

    console.log('\n✅ Database cleared successfully\n');

  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
    throw error;
  }
}

/**
 * Upload Pagariya Collection data
 */
async function uploadData() {
  console.log('🚀 Starting Pagariya Collection data upload to MongoDB...\n');

  try {
    // Connect to MongoDB
    await connectDB();

    // Clear existing data
    await clearDatabase();

    // Get all data files
    const files = await getDataFiles();
    console.log(`📁 Found ${files.length} files to upload:\n`);

    let totalInserted = 0;
    let successCount = 0;

    for (const file of files) {
      console.log(`📄 Processing: ${file.filename}`);

      try {
        // Get file size for progress indication
        const fileSize = await getFileSize(file.filepath);
        console.log(`   📏 Size: ${Math.round(fileSize / 1024)} KB`);

        // Read and parse JSON file
        const rawData = await readJsonFile(file.filepath);
        console.log(`   📊 Records: ${rawData.length}`);

        if (rawData.length === 0) {
          console.log(`   ⚠️  Skipping empty file\n`);
          continue;
        }

        // Process data for MongoDB insertion
        const processedData = processFileData(rawData, file.collectionName);
        console.log(`   🔄 Processed records: ${processedData.length}`);

        // Get the collection
        const collection = mongoose.connection.db.collection(file.collectionName);

        // Insert data in batches for large files
        const batchSize = fileSize > 50 * 1024 * 1024 ? 1000 : 5000;
        let insertedCount = 0;

        if (processedData.length <= batchSize) {
          // Insert all at once for small files
          const result = await collection.insertMany(processedData, { ordered: false });
          insertedCount = result.insertedCount;
        } else {
          // Batch insert for large files
          for (let i = 0; i < processedData.length; i += batchSize) {
            const batch = processedData.slice(i, i + batchSize);
            const result = await collection.insertMany(batch, { ordered: false });
            insertedCount += result.insertedCount;

            const progress = Math.round((i + batch.length) / processedData.length * 100);
            console.log(`   ⏳ Progress: ${progress}% (${insertedCount}/${processedData.length})`);
          }
        }

        console.log(`   ✅ Successfully uploaded ${insertedCount} records to ${file.collectionName}\n`);
        totalInserted += insertedCount;
        successCount++;

      } catch (error) {
        console.error(`   ❌ Error uploading ${file.filename}:`, error.message);
        console.log(`   💥 Skipping this file and continuing...\n`);
      }
    }

    console.log('🎉 Upload completed!\n');
    console.log('📋 Summary:');
    console.log(`   ✅ Successfully processed ${successCount}/${files.length} files`);
    console.log(`   📊 Total records inserted: ${totalInserted}`);
    console.log(`   🗄️  Database: ${mongoose.connection.name}`);
    console.log(`   🌐 MongoDB connection established`);

  } catch (error) {
    console.error('💥 Fatal error during upload:', error.message);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

// Main execution
if (require.main === module) {
  uploadData();
}

module.exports = { uploadData, clearDatabase };
