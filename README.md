# Patel E-commerce API

A comprehensive Node.js backend API for the Patel E-commerce platform with OTP authentication, product management, pincode-based store selection, and department browsing.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment (optional):**
   Create a `.env` file with your MongoDB Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   CLEAR_BEFORE_UPLOAD=false
   PORT=5001
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   OTP_EXPIRY_MINUTES=10
   ```

3. **Upload database:**
   ```bash
   npm run upload
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

## API Documentation

### Integration Guide
- **Complete Cart-to-Order Flow**: Step-by-step integration guide with code examples
  - See [Integration Guide](./INTEGRATION_GUIDE.md)

### Available Endpoints

- **Authentication**: OTP-based authentication with JWT tokens
  - See [Authentication API Docs](./context/README_AUTH.md)

- **Pincodes & Stores**: Pincode verification and store management
  - See [Pincode API Docs](./context/README_PINCODE_API.md)
  - See [Store API Docs](./context/README_STORE_API.md)

- **Departments**: Department browsing by store code
  - See [Department API Docs](./context/README_DEPARTMENT_API.md)

- **Products**: Product catalog and search
- **Categories**: Category management
- **Orders**: Order processing
- **Payments**: Payment handling
- **Addresses**: User address management

### Department API Quick Reference

**Get Departments by Store Code:**
```bash
POST /api/departments/by-store
Body: { "store_code": "null" }
```

**Get Departments by Type:**
```bash
POST /api/departments/by-type
Body: { "dept_type_id": "1", "store_code": "null" }
```

**Get All Departments:**
```bash
GET /api/departments
```

For detailed documentation, see [Department API Docs](./context/README_DEPARTMENT_API.md)

## What it does

- Connects to MongoDB Atlas using the provided connection string
- Reads all JSON files from the `../Patel Full Collection/` directory
- Processes and cleans the data (handles ObjectId wrappers, price formatting, null values)
- Uploads each file to its corresponding MongoDB collection:
  - `PatelDB.addressbooks.json` → `addressbooks` collection
  - `PatelDB.bannermasters.json` → `bannermasters` collection
  - `PatelDB.categorymasters.json` → `categorymasters` collection
  - `PatelDB.deliveryslots.json` → `deliveryslots` collection
  - `PatelDB.departmentmasters.json` → `departmentmasters` collection
  - `PatelDB.favoritemasters.json` → `favoritemasters` collection
  - `PatelDB.paymentmodes.json` → `paymentmodes` collection
  - `PatelDB.paymentstatuses.json` → `paymentstatuses` collection
  - `PatelDB.pincodemasters.json` → `pincodemasters` collection
  - `PatelDB.pincodestoremasters.json` → `pincodestoremasters` collection
  - `PatelDB.productmasters.json` → `productmasters` collection (154MB - uses batch processing)
  - `PatelDB.subcategorymasters.json` → `subcategorymasters` collection

## Features

- **Progress tracking**: Shows file size, record count, and upload progress
- **Batch processing**: Handles large files (like products) in batches to avoid memory issues
- **Error handling**: Continues with other files if one fails
- **Data processing**: Cleans common data issues before insertion
- **Optional clearing**: Can clear existing data before upload (set `CLEAR_BEFORE_UPLOAD=true`)

## Usage

```bash
# Upload all data
npm run upload

# Clear database first, then upload
CLEAR_BEFORE_UPLOAD=true npm run upload

# Clear database only (run this first if needed)
node upload_patel_data.js clear
```

## Data Processing

The script handles several common data issues:

- Converts `$numberDecimal` prices to regular numbers
- Removes MongoDB ObjectId wrappers (`$oid`)
- Converts string "null" values to actual `null`
- Validates JSON structure before insertion

## Output

The script provides detailed progress information:
```
🚀 Starting Patel Full Collection data upload to MongoDB Atlas...

📁 Found 12 files to upload:

📄 Processing: PatelDB.addressbooks.json
   📏 Size: 1 MB
   📊 Records: 40468
   🔄 Processed records: 40468
   ✅ Successfully uploaded 40468 records to addressbooks

📄 Processing: PatelDB.productmasters.json
   📏 Size: 154 MB
   📊 Records: 123456
   🔄 Processed records: 123456
   ⏳ Progress: 25% (30764/123456)
   ⏳ Progress: 50% (61528/123456)
   ⏳ Progress: 75% (92392/123456)
   ⏳ Progress: 100% (123456/123456)
   ✅ Successfully uploaded 123456 records to productmasters

🎉 Upload completed!
📋 Summary:
   ✅ Successfully processed 12 files
   🔗 Data uploaded to: Patel_Test_v2 database
   🌐 MongoDB Atlas connection established
```

## Troubleshooting

- **Connection errors**: Check your MongoDB Atlas connection string and network connectivity
- **Permission errors**: Ensure your IP is whitelisted in MongoDB Atlas
- **Memory issues**: For very large files, the script uses batch processing automatically
- **Empty files**: The script will skip files with no records

## Database Connection

The script connects to `Patel_Test_v2` database in MongoDB Atlas using the connection string:
```
mongodb+srv://gauravpawar904_patel:xBAquzKNZCcp88kG@cluster0.ufhe8af.mongodb.net/Patel_Test_v2?retryWrites=true&w=majority&appName=Cluster0
```

Make sure this connection string works and you have the necessary permissions to write to the database.
