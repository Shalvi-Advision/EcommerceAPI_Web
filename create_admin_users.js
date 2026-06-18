// Usage: node create_admin_users.js <tenantSlug>
require('dotenv').config();
const { openTenant } = require('./scripts/lib/tenantScript');

const adminNumbers = [
    '+91 98903 54858',
    '+91 97734 43190',
    '+91 98810 27738',
    '+91 76664 75554',
    '+91 81080 53372'
];

const createAdminUsers = async () => {
    let close;
    try {
        const { models, close: closeFn } = await openTenant(process.argv[2]);
        close = closeFn;
        const { User } = models;
        console.log('Connected to database for admin creation...');

        for (const rawNumber of adminNumbers) {
            // Normalize: remove '+91' prefix (if present) and all spaces
            const mobile = rawNumber.replace(/^\+91/, '').replace(/\s+/g, '');

            if (!/^\d{10}$/.test(mobile)) {
                console.error(`Invalid mobile number format after cleaning: ${rawNumber} -> ${mobile}`);
                continue;
            }

            console.log(`Processing ${mobile}...`);

            let user = await User.findOne({ mobile });

            if (user) {
                console.log(`User found for ${mobile}. Updating role to admin...`);
                user.role = 'admin';
                // Ensure verified if they are being made admin manually
                if (!user.isVerified) user.isVerified = true;
                await user.save();
                console.log(`Updated ${mobile} to admin.`);
            } else {
                console.log(`User not found for ${mobile}. Creating new admin user...`);
                user = await User.create({
                    mobile,
                    role: 'admin',
                    isVerified: true,
                    name: 'Admin User' // Default name
                });
                console.log(`Created new admin user ${mobile}.`);
            }
        }

        console.log('Admin user creation/update complete.');

    } catch (error) {
        console.error('Error creating admin users:', error);
    } finally {
        if (close) await close();
        process.exit(0);
    }
};

createAdminUsers();
