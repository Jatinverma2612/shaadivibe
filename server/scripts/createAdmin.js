import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';

export const createOrUpdateAdmin = async () => {
  const conn = await connectDB();
  if (!conn) {
    console.error('[Admin] Database connection failed.');
    process.exit(1);
  }

  const email = 'admin@gmail.com';
  const password = '@admin123';
  const name = 'Admin';
  const role = 'admin';

  let user = await User.findOne({ email });
  if (user) {
    console.log(`[Admin] User ${email} already exists. Updating password and ensuring role is admin...`);
    user.name = name;
    user.role = role;
    user.password = password; // Triggers userSchema.pre('save') bcrypt hashing
    await user.save();
    console.log(`[Admin] User ${email} updated successfully.`);
  } else {
    console.log(`[Admin] Creating new admin user ${email}...`);
    user = await User.create({
      name,
      email,
      password,
      role,
    });
    console.log(`[Admin] Admin user ${email} created successfully.`);
  }

  // Verification test
  const verifyUser = await User.findOne({ email });
  const isMatch = await verifyUser.comparePassword(password);
  console.log(`[Admin] Verification check:`);
  console.log(`  - Email: ${verifyUser.email}`);
  console.log(`  - Role: ${verifyUser.role}`);
  console.log(`  - Password match: ${isMatch}`);

  if (isMatch && verifyUser.role === 'admin') {
    console.log('[Admin] SUCCESS: Admin account created and verified.');
  } else {
    console.error('[Admin] FAILED: Password or role verification failed.');
    process.exit(1);
  }

  process.exit(0);
};

createOrUpdateAdmin().catch((err) => {
  console.error('[Admin] Unexpected error:', err);
  process.exit(1);
});
