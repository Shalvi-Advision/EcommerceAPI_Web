const fs = require('fs').promises;
const path = require('path');

const PATEL_DATA_PATH = path.join(__dirname, '../../Patel Full Collection');

/**
 * Get list of all JSON files in Patel Full Collection
 */
const getDataFiles = async () => {
  try {
    const files = await fs.readdir(PATEL_DATA_PATH);
    return files.filter(file => file.endsWith('.json')).map(file => ({
      filename: file,
      filepath: path.join(PATEL_DATA_PATH, file),
      collectionName: file.replace('PatelDB.', '').replace('.json', '')
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
 * Handle common data issues
 */
const processFileData = (data, collectionName) => {
  if (!Array.isArray(data)) {
    console.warn(`Warning: ${collectionName} data is not an array`);
    return [];
  }

  return data.map(item => {
    // Remove MongoDB ObjectId wrapper if present
    if (item._id && item._id.$oid) {
      item._id = item._id.$oid;
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

module.exports = {
  getDataFiles,
  readJsonFile,
  processFileData,
  getFileSize,
  PATEL_DATA_PATH
};
