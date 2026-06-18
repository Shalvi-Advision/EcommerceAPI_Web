const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');
const { decrypt } = require('../utils/crypto');

// Per-tenant Cloudinary factory (plan §5). Each store uploads to its own
// Cloudinary account; secrets live encrypted in tenant.integrations.cloudinary.
// All assets are additionally namespaced under the tenant's folder so even a
// shared account never mixes two stores' media.
//
// per-tenant-required: an unconfigured store gets a 422 on upload.

/**
 * Build a Cloudinary client + helpers scoped to one tenant.
 * @param {object} tenant - req.tenant
 * @returns {{ upload(buffer, folder?): Promise, destroy(publicId): Promise<boolean>, baseFolder: string }}
 * @throws {Error} status 422 if media uploads are not configured for this tenant
 */
function cloudinaryFor(tenant) {
  const c = tenant && tenant.integrations && tenant.integrations.cloudinary;
  if (!c || !c.enabled) {
    const e = new Error('Media uploads are not configured for this store');
    e.status = 422;
    throw e;
  }
  if (!c.cloudName || !c.apiKey || !c.apiSecretEnc) {
    const e = new Error('Media configuration for this store is incomplete');
    e.status = 422;
    throw e;
  }

  // Per-call config object (do NOT mutate the global cloudinary.config()).
  const config = {
    cloud_name: c.cloudName,
    api_key: c.apiKey,
    api_secret: decrypt(c.apiSecretEnc),
  };
  // Every tenant's assets live under their own folder root.
  const baseFolder = c.folder || `tenant_${tenant.slug}`;

  function upload(buffer, subFolder = 'ecommerce') {
    const folder = `${baseFolder}/${subFolder}`.replace(/\/+/g, '/');
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
          ...config, // per-call account override
        },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      Readable.from(buffer).pipe(stream);
    });
  }

  async function destroy(publicId) {
    try {
      await cloudinary.uploader.destroy(publicId, config);
      return true;
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      return false;
    }
  }

  return { upload, destroy, baseFolder };
}

module.exports = { cloudinaryFor };
