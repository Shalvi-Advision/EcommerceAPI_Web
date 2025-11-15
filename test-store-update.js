const mongoose = require('mongoose');
require('dotenv').config();
const Store = require('./models/Store');

async function testStoreUpdate() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const storeId = '68a8a1db4169ced4c49f93f4';
    console.log('\n=== Testing Store Update ===');
    console.log('Store ID:', storeId);

    // 1. Check if store exists with find()
    console.log('\n1. Checking if store exists with find():');
    const stores = await Store.find({}).lean();
    const matchingStore = stores.find(s => s._id.toString() === storeId);
    if (matchingStore) {
      console.log('✓ Store found in find() results');
      console.log('  _id type:', typeof matchingStore._id);
      console.log('  _id constructor:', matchingStore._id.constructor.name);
      console.log('  _id value:', matchingStore._id.toString());
      console.log('  is_enabled:', matchingStore.is_enabled);
    } else {
      console.log('✗ Store NOT found in find() results');
      return;
    }

    // 2. Try findById with string
    console.log('\n2. Trying findById with string:');
    const storeByIdString = await Store.findById(storeId);
    console.log('  Result:', storeByIdString ? 'Found' : 'Not found');

    // 3. Try findById with ObjectId
    console.log('\n3. Trying findById with ObjectId:');
    const objectId = new mongoose.Types.ObjectId(storeId);
    const storeByIdObjectId = await Store.findById(objectId);
    console.log('  Result:', storeByIdObjectId ? 'Found' : 'Not found');

    // 4. Try findOne with _id string
    console.log('\n4. Trying findOne with _id string:');
    const storeFindOneString = await Store.findOne({ _id: storeId });
    console.log('  Result:', storeFindOneString ? 'Found' : 'Not found');

    // 5. Try findOne with _id ObjectId
    console.log('\n5. Trying findOne with _id ObjectId:');
    const storeFindOneObjectId = await Store.findOne({ _id: objectId });
    console.log('  Result:', storeFindOneObjectId ? 'Found' : 'Not found');

    // 6. Try updateOne with ObjectId
    console.log('\n6. Trying updateOne with ObjectId:');
    const updateResult = await Store.updateOne(
      { _id: objectId },
      { $set: { is_enabled: 'Disabled' } }
    );
    console.log('  matchedCount:', updateResult.matchedCount);
    console.log('  modifiedCount:', updateResult.modifiedCount);
    console.log('  acknowledged:', updateResult.acknowledged);

    // 7. Try updateOne with string
    console.log('\n7. Trying updateOne with string:');
    const updateResultString = await Store.updateOne(
      { _id: storeId },
      { $set: { is_enabled: 'Disabled' } }
    );
    console.log('  matchedCount:', updateResultString.matchedCount);
    console.log('  modifiedCount:', updateResultString.modifiedCount);
    console.log('  acknowledged:', updateResultString.acknowledged);

    // 8. Try direct MongoDB collection update
    console.log('\n8. Trying direct MongoDB collection update:');
    const collection = mongoose.connection.db.collection('pincodestoremasters');
    const directUpdate = await collection.updateOne(
      { _id: objectId },
      { $set: { is_enabled: 'Disabled' } }
    );
    console.log('  matchedCount:', directUpdate.matchedCount);
    console.log('  modifiedCount:', directUpdate.modifiedCount);
    console.log('  acknowledged:', directUpdate.acknowledged);

    // 9. Check final status
    console.log('\n9. Checking final status:');
    const finalStore = await Store.findById(objectId);
    if (finalStore) {
      console.log('  is_enabled:', finalStore.is_enabled);
    } else {
      console.log('  Store not found');
    }

    // 10. Try updating by store_code and pincode as alternative
    console.log('\n10. Trying update by store_code and pincode:');
    const altUpdate = await Store.updateOne(
      { store_code: 'ULN', pincode: '421002' },
      { $set: { is_enabled: 'Disabled' } }
    );
    console.log('  matchedCount:', altUpdate.matchedCount);
    console.log('  modifiedCount:', altUpdate.modifiedCount);

    await mongoose.disconnect();
    console.log('\n=== Test Complete ===');
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
  }
}

testStoreUpdate();

