// Central list of every tenant-scoped model, plus a helper to bind all of them
// to a given connection (plan §3.2).
//
// During the Phase 1/2 transition each model file exports a Mongoose Model
// (registered on the default connection) via models/_exportSchema.js. A Model
// exposes `.modelName` and `.schema`, which is all we need to re-register it on
// a tenant connection. This helper also accepts the post-migration shape
// `{ name, schema }`, so nothing here changes when the shim is removed later.

const defs = [
  require('../models/User'),
  require('../models/Address'),
  require('../models/AddressBook'),
  require('../models/Product'),
  require('../models/ProductMaster'),
  require('../models/Pincode'),
  require('../models/Store'),
  require('../models/Department'),
  require('../models/Category'),
  require('../models/Subcategory'),
  require('../models/PaymentMode'),
  require('../models/DeliverySlot'),
  require('../models/Counter'),
  require('../models/Favorite'),
  require('../models/Cart'),
  require('../models/Order'),
  require('../models/BestSeller'),
  require('../models/TopSeller'),
  require('../models/PopularCategory'),
  require('../models/SeasonalCategory'),
  require('../models/Advertisement'),
  require('../models/Banner'),
  require('../models/Offer'),
  require('../models/Notification'),
  require('../models/AdminNotification'),
];

// Normalize either shape -> { name, schema }.
function describe(def) {
  const name = def.modelName || def.name;       // Model.modelName | { name }
  const schema = def.schema;                    // both shapes expose .schema
  if (!name || !schema) {
    throw new Error('modelRegistry: a model def is missing name/schema. Check models/* exports.');
  }
  return { name, schema };
}

// Bind every model to `conn`, reusing an already-registered model if present
// (mongoose throws on duplicate registration otherwise).
function registerModels(conn) {
  const models = {};
  for (const def of defs) {
    const { name, schema } = describe(def);
    models[name] = conn.models[name] || conn.model(name, schema);
  }
  return models; // { User, Product, Order, … } bound to THIS connection
}

// Exposed for tooling/migration scripts that want the raw list.
function modelDefs() {
  return defs.map(describe);
}

module.exports = { registerModels, modelDefs };
