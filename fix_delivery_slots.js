// Usage: node fix_delivery_slots.js <tenantSlug>
require('dotenv').config();
const { openTenant } = require('./scripts/lib/tenantScript');
const fs = require('fs').promises;
const path = require('path');

async function uploadDeliverySlots() {
    console.log('🚀 Uploading delivery slots...\n');

    let db, close;
    try {
        ({ db, close } = await openTenant(process.argv[2]));

        const filePath = path.join(__dirname, '../Pagariya Collection/MasterRetailDB.deliveryslots.json');
        const data = await fs.readFile(filePath, 'utf8');
        const rawData = JSON.parse(data);

        console.log(`📊 Found ${rawData.length} delivery slots`);

        // Process data
        const processedData = rawData.map(item => {
            if (item._id && item._id.$oid) {
                delete item._id;
            }
            Object.keys(item).forEach(key => {
                if (item[key] === "null") {
                    item[key] = null;
                }
            });
            return item;
        });

        // Drop the collection first to remove the unique index issue
        const collection = db.collection('deliveryslots');
        await collection.drop().catch(() => console.log('Collection does not exist, creating new one'));

        // Insert data
        const result = await collection.insertMany(processedData, { ordered: false });
        console.log(`✅ Successfully uploaded ${result.insertedCount} delivery slots\n`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (close) await close();
    }
}

uploadDeliverySlots();
