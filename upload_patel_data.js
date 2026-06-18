// Usage: node upload_patel_data.js <tenantSlug> [clear]
require('dotenv').config();
const { openTenant } = require('./scripts/lib/tenantScript');
const { getDataFiles, readJsonFile, processFileData, getFileSize } = require('./utils/fileProcessor');

/**
 * Upload data with progress tracking
 */
async function uploadData() {
  console.log('🚀 Starting Patel Full Collection data upload to MongoDB Atlas...\n');

  let db, close;
  try {
    // Open the tenant's database
    ({ db, close } = await openTenant(process.argv[2]));

    // Get all data files
    const files = await getDataFiles();
    console.log(`📁 Found ${files.length} files to upload:\n`);

    for (const file of files) {
      console.log(`📄 Processing: ${file.filename}`);

      try {
        // Get file size for progress indication
        const fileSize = await getFileSize(file.filepath);
        console.log(`   📏 Size: ${Math.round(fileSize / 1024 / 1024)} MB`);

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
        const collection = db.collection(file.collectionName);

        // Clear existing data (optional - can be controlled via env var)
        if (process.env.CLEAR_BEFORE_UPLOAD === 'true') {
          await collection.deleteMany({});
          console.log(`   🗑️  Cleared existing data`);
        }

        // Insert data in batches for large files
        const batchSize = fileSize > 50 * 1024 * 1024 ? 1000 : 5000; // Smaller batches for large files
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

      } catch (error) {
        console.error(`   ❌ Error uploading ${file.filename}:`, error.message);
        console.log(`   💥 Skipping this file and continuing...\n`);
      }
    }

    console.log('🎉 Upload completed!');
    console.log('\n📋 Summary:');
    console.log(`   ✅ Successfully processed ${files.length} files`);
    console.log('   🔗 Data uploaded to: Patel_Test_v2 database');
    console.log('   🌐 MongoDB Atlas connection established');

  } catch (error) {
    console.error('💥 Fatal error during upload:', error.message);
    process.exit(1);
  } finally {
    if (close) await close();
  }
}

/**
 * Clear database before upload (optional script)
 */
async function clearDatabase() {
  console.log('🗑️  Clearing all collections in Patel_Test_v2 database...');

  let db, close;
  try {
    ({ db, close } = await openTenant(process.argv[2]));

    const collections = [
      'addressbooks',
      'bannermasters',
      'categorymasters',
      'deliveryslots',
      'departmentmasters',
      'favoritemasters',
      'paymentmodes',
      'paymentstatuses',
      'pincodemasters',
      'pincodestoremasters',
      'productmasters',
      'subcategorymasters'
    ];

    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      const result = await collection.deleteMany({});
      console.log(`   🗑️  Cleared ${collectionName}: ${result.deletedCount} records`);
    }

    console.log('✅ Database cleared successfully');

  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
  } finally {
    if (close) await close();
  }
}

// Main execution
if (require.main === module) {
  const command = process.argv[3];

  if (command === 'clear') {
    clearDatabase();
  } else {
    uploadData();
  }
}

module.exports = { uploadData, clearDatabase };
