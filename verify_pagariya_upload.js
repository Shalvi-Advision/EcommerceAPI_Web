// Usage: node verify_pagariya_upload.js <tenantSlug>
require('dotenv').config();
const { openTenant } = require('./scripts/lib/tenantScript');

async function verifyUpload() {
    console.log('🔍 Verifying Pagariya Collection upload...\n');

    let close;
    try {
        const { models, close: closeFn } = await openTenant(process.argv[2]);
        close = closeFn;
        const { ProductMaster, Category, Department } = models;

        // Check products
        const productCount = await ProductMaster.countDocuments();
        const sampleProduct = await ProductMaster.findOne();
        console.log(`📦 Products: ${productCount} records`);
        console.log(`   Sample: ${sampleProduct?.product_name}`);
        console.log(`   Store Code: ${sampleProduct?.store_code}`);
        console.log(`   Project Code: ${sampleProduct?.project_code}\n`);

        // Check categories
        const categoryCount = await Category.countDocuments();
        const sampleCategory = await Category.findOne();
        console.log(`📂 Categories: ${categoryCount} records`);
        console.log(`   Sample: ${sampleCategory?.category_name}`);
        console.log(`   Store Code: ${sampleCategory?.store_code}\n`);

        // Check departments
        const departmentCount = await Department.countDocuments();
        const departments = await Department.find().sort({ sequence_id: 1 });
        console.log(`🏢 Departments: ${departmentCount} records`);
        departments.forEach(dept => {
            console.log(`   - ${dept.department_name} (ID: ${dept.department_id})`);
        });

        console.log('\n✅ Verification complete!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (close) await close();
    }
}

verifyUpload();
