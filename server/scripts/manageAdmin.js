import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';

const printUsage = () => {
  console.log(`
ShaadiVibe Administrator Account Management CLI
================================================
Usage:
  node server/scripts/manageAdmin.js promote <email>
  node server/scripts/manageAdmin.js demote <email>
  node server/scripts/manageAdmin.js create <email> <name> <password>
  node server/scripts/manageAdmin.js list

Examples:
  node server/scripts/manageAdmin.js promote jatinverma4554@gmail.com
  node server/scripts/manageAdmin.js create admin@shaadivibe.com "Platform Admin" "AdminPass123!"
  node server/scripts/manageAdmin.js list
`);
};

export const main = async () => {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase();

  if (!command || !['promote', 'demote', 'create', 'list'].includes(command)) {
    printUsage();
    process.exit(0);
  }

  const conn = await connectDB();
  if (!conn) {
    console.error('[Admin CLI] Fatal: Database connection failed.');
    process.exit(1);
  }

  try {
    if (command === 'list') {
      const users = await User.find({}).select('-password').sort({ createdAt: -1 });
      console.log(`\nFound ${users.length} registered user account(s):`);
      console.log('--------------------------------------------------------------------------------');
      console.log(
        'Email'.padEnd(35) +
        'Name'.padEnd(25) +
        'Role'.padEnd(12) +
        'ID'
      );
      console.log('--------------------------------------------------------------------------------');
      users.forEach((u) => {
        console.log(
          u.email.padEnd(35) +
          (u.name || '').padEnd(25) +
          u.role.padEnd(12) +
          u._id.toString()
        );
      });
      console.log('--------------------------------------------------------------------------------\n');
    } else if (command === 'promote') {
      const email = args[1]?.toLowerCase()?.trim();
      if (!email) {
        console.error('[Admin CLI] Error: Please provide an email address to promote.');
        process.exit(1);
      }

      const user = await User.findOne({ email });
      if (!user) {
        console.error(`[Admin CLI] Error: User with email "${email}" was not found in the database.`);
        process.exit(1);
      }

      if (user.role === 'admin') {
        console.log(`[Admin CLI] Notice: User "${email}" already has role "admin". No change required.`);
      } else {
        user.role = 'admin';
        await user.save();
        console.log(`[Admin CLI] Success: User "${email}" has been successfully promoted to "admin".`);
      }

      console.log(`  - ID: ${user._id}`);
      console.log(`  - Name: ${user.name}`);
      console.log(`  - Email: ${user.email}`);
      console.log(`  - Role: ${user.role}`);
    } else if (command === 'demote') {
      const email = args[1]?.toLowerCase()?.trim();
      if (!email) {
        console.error('[Admin CLI] Error: Please provide an email address to demote.');
        process.exit(1);
      }

      const user = await User.findOne({ email });
      if (!user) {
        console.error(`[Admin CLI] Error: User with email "${email}" was not found in the database.`);
        process.exit(1);
      }

      user.role = 'customer';
      await user.save();
      console.log(`[Admin CLI] Success: User "${email}" has been demoted to "customer".`);
    } else if (command === 'create') {
      const email = args[1]?.toLowerCase()?.trim();
      const name = args[2]?.trim();
      const password = args[3];

      if (!email || !name || !password) {
        console.error('[Admin CLI] Error: Required arguments missing.');
        console.error('Usage: node server/scripts/manageAdmin.js create <email> <name> <password>');
        process.exit(1);
      }

      if (password.length < 8) {
        console.error('[Admin CLI] Error: Password must be at least 8 characters long.');
        process.exit(1);
      }

      let user = await User.findOne({ email });
      if (user) {
        console.log(`[Admin CLI] User "${email}" already exists. Updating credentials and setting role to "admin"...`);
        user.name = name;
        user.role = 'admin';
        user.password = password; // Hashed by pre('save') hook
        await user.save();
        console.log(`[Admin CLI] User "${email}" updated to admin successfully.`);
      } else {
        user = await User.create({
          name,
          email,
          password,
          role: 'admin',
        });
        console.log(`[Admin CLI] New admin account "${email}" created successfully.`);
      }

      // Verify
      const verify = await User.findOne({ email });
      const matches = await verify.comparePassword(password);
      if (matches && verify.role === 'admin') {
        console.log('[Admin CLI] Verification check passed: Password and admin role verified.');
      } else {
        console.error('[Admin CLI] Verification failed.');
        process.exit(1);
      }
    }
  } catch (err) {
    console.error('[Admin CLI] Unexpected error:', err.message);
    process.exit(1);
  } finally {
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
    process.exit(0);
  }
};

// Auto-run if executed directly via node CLI
if (process.argv[1] && process.argv[1].includes('manageAdmin.js')) {
  main();
}
