// Catalog seed templates (plan §5/§9). Generalized from the upload_*_data.js
// transform logic into one importer keyed by a tenant's models + store/project
// codes. Provisioning's seed step calls seedFromTemplate() to give a brand-new
// tenant a working baseline: departments, categories, payment modes, delivery
// slots. (Products are intentionally left to the catalog importer / CSV — a new
// store usually loads its own SKUs.)
//
// All docs use the field shapes the tenant models require (see models/*.js).

// The grocery starter template — a minimal but coherent department/category tree.
const GROCERY = {
  departments: [
    { department_id: '1', department_name: 'Grocery & Staples', dept_type_id: '1', sequence_id: 1 },
    { department_id: '2', department_name: 'Fruits & Vegetables', dept_type_id: '1', sequence_id: 2 },
    { department_id: '3', department_name: 'Dairy & Bakery', dept_type_id: '1', sequence_id: 3 },
    { department_id: '4', department_name: 'Beverages', dept_type_id: '1', sequence_id: 4 },
    { department_id: '5', department_name: 'Personal Care', dept_type_id: '1', sequence_id: 5 },
  ],
  // categories reference dept_id (matches department_id above)
  categories: [
    { idcategory_master: '101', category_name: 'Atta, Rice & Dal', dept_id: '1', sequence_id: 1 },
    { idcategory_master: '102', category_name: 'Oil & Ghee', dept_id: '1', sequence_id: 2 },
    { idcategory_master: '103', category_name: 'Masala & Spices', dept_id: '1', sequence_id: 3 },
    { idcategory_master: '201', category_name: 'Fresh Vegetables', dept_id: '2', sequence_id: 1 },
    { idcategory_master: '202', category_name: 'Fresh Fruits', dept_id: '2', sequence_id: 2 },
    { idcategory_master: '301', category_name: 'Milk & Curd', dept_id: '3', sequence_id: 1 },
    { idcategory_master: '302', category_name: 'Bread & Eggs', dept_id: '3', sequence_id: 2 },
    { idcategory_master: '401', category_name: 'Tea & Coffee', dept_id: '4', sequence_id: 1 },
    { idcategory_master: '402', category_name: 'Soft Drinks & Juices', dept_id: '4', sequence_id: 2 },
    { idcategory_master: '501', category_name: 'Bath & Body', dept_id: '5', sequence_id: 1 },
  ],
};

const TEMPLATES = { grocery: GROCERY };

function listTemplates() {
  return Object.keys(TEMPLATES);
}

// Defaults that every store needs regardless of template.
function defaultPaymentModes() {
  return [
    { idpayment_mode: 1, payment_mode_name: 'Cash on Delivery', is_enabled: 'Yes' },
    { idpayment_mode: 2, payment_mode_name: 'Online Payment', is_enabled: 'Yes' },
  ];
}

function defaultDeliverySlots(storeCode = 'MAIN') {
  return [
    { iddelivery_slot: 1, delivery_slot_from: '09:00', delivery_slot_to: '12:00', is_active: 'yes', store_code: storeCode },
    { iddelivery_slot: 2, delivery_slot_from: '12:00', delivery_slot_to: '15:00', is_active: 'yes', store_code: storeCode },
    { iddelivery_slot: 3, delivery_slot_from: '15:00', delivery_slot_to: '18:00', is_active: 'yes', store_code: storeCode },
    { iddelivery_slot: 4, delivery_slot_from: '18:00', delivery_slot_to: '21:00', is_active: 'yes', store_code: storeCode },
  ];
}

/**
 * Seed a tenant's baseline catalog from a template.
 * @param {object} models - tenant-bound models (from getTenantDb / registerModels)
 * @param {object} opts - { template: 'grocery', storeCode: 'MAIN', projectCode: 'SHALVI' }
 * @returns {Promise<{departments:number, categories:number, paymentModes:number, deliverySlots:number}>}
 */
async function seedFromTemplate(models, opts = {}) {
  const template = opts.template || 'grocery';
  const storeCode = opts.storeCode || 'MAIN';
  const projectCode = opts.projectCode || 'SHALVI';
  const tpl = TEMPLATES[template];
  if (!tpl) {
    const e = new Error(`Unknown catalog template "${template}". Available: ${listTemplates().join(', ')}`);
    e.status = 400;
    throw e;
  }

  const { Department, Category, PaymentMode, DeliverySlot } = models;

  const departments = tpl.departments.map((d) => ({ ...d, store_code: storeCode, project_code: projectCode }));
  const categories = tpl.categories.map((c) => ({ ...c, store_code: storeCode, project_code: projectCode }));

  await Department.insertMany(departments);
  await Category.insertMany(categories);
  await PaymentMode.insertMany(defaultPaymentModes());
  await DeliverySlot.insertMany(defaultDeliverySlots(storeCode));

  return {
    departments: departments.length,
    categories: categories.length,
    paymentModes: 2,
    deliverySlots: 4,
  };
}

module.exports = { seedFromTemplate, listTemplates, defaultPaymentModes, defaultDeliverySlots };
