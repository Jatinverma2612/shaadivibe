import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Theme } from '../src/models/Theme.js';
import { Invitation } from '../src/models/Invitation.js';
import { SiteContent } from '../src/models/SiteContent.js';
import { defaultThemes, sampleInvitation, defaultSiteContent } from '../../shared/constants/mockData.js';

export const seedDatabase = async () => {
  const conn = await connectDB();
  if (!conn) {
    console.log('[Seed] Database connection skipped or unavailable. Operating with in-memory datasets.');
    return;
  }

  try {
    console.log('[Seed] Checking and seeding default data...');

    // 1. Seed Admin User
    const existingAdmin = await User.findOne({ email: 'admin@shaadivibe.com' });
    if (!existingAdmin) {
      await User.create({
        name: 'ShaadiVibe Royal Admin',
        email: 'admin@shaadivibe.com',
        password: 'Admin@123456',
        role: 'admin',
      });
      console.log('[Seed] Admin user created: admin@shaadivibe.com / Admin@123456');
    }

    // 2. Seed Themes
    const themeCount = await Theme.countDocuments();
    if (themeCount === 0) {
      await Theme.insertMany(defaultThemes);
      console.log(`[Seed] Seeded ${defaultThemes.length} royal themes.`);
    }

    // 3. Seed Sample Invitation
    const existingInvite = await Invitation.findOne({ slug: 'priya-and-rohan' });
    if (!existingInvite) {
      await Invitation.create(sampleInvitation);
      console.log('[Seed] Seeded sample royal wedding invitation: priya-and-rohan');
    }

    // 4. Seed Site Content
    for (const [section, data] of Object.entries(defaultSiteContent)) {
      const existing = await SiteContent.findOne({ section });
      if (!existing) {
        await SiteContent.create({ section, data });
      }
    }
    console.log('[Seed] Seeded homepage CMS content.');
    console.log('[Seed] Seeding completed successfully!');
  } catch (error) {
    console.error('[Seed] Error during seeding:', error.message);
  }
};

// Execute if run directly from CLI
if (process.argv[1]?.includes('seedData.js')) {
  seedDatabase().then(() => process.exit(0));
}
