import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Theme } from '../src/models/Theme.js';
import { Invitation } from '../src/models/Invitation.js';
import { SiteContent } from '../src/models/SiteContent.js';
import { defaultThemes, sampleInvitation, defaultSiteContent } from '../src/constants/mockData.js';

export const seedDatabase = async () => {
  const conn = await connectDB();
  if (!conn) {
    console.log('[Seed] Database connection skipped or unavailable. Operating with in-memory datasets.');
    return;
  }

  try {
    console.log('[Seed] Checking database initialization status (strictly non-destructive)...');

    // 1. Seed Admin User (only if zero admins exist in database)
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (!existingAdmin) {
      await User.create({
        name: 'Admin',
        email: 'admin@gmail.com',
        password: '@admin123',
        role: 'admin',
      });
      console.log('[Seed] Initialized admin user: admin@gmail.com');
    } else {
      console.log(`[Seed] Admin user already exists (${existingAdmin.email}). Preserving existing record.`);
    }

    // 2. Seed Themes (only if zero themes exist in database)
    const themeCount = await Theme.countDocuments();
    if (themeCount === 0) {
      await Theme.insertMany(defaultThemes);
      console.log(`[Seed] Seeded ${defaultThemes.length} initial themes.`);
    } else {
      console.log(`[Seed] ${themeCount} themes already present. Preserving existing themes.`);
    }

    // 3. Seed Sample Invitation (only if slug does not exist)
    const existingInvite = await Invitation.findOne({ slug: 'priya-and-rohan' });
    if (!existingInvite) {
      await Invitation.create(sampleInvitation);
      console.log('[Seed] Seeded sample invitation: priya-and-rohan');
    } else {
      console.log('[Seed] Sample invitation (priya-and-rohan) already present. Preserving existing record.');
    }

    // 4. Seed Site Content (additive only for missing sections)
    let seededSections = 0;
    for (const [section, data] of Object.entries(defaultSiteContent)) {
      const existing = await SiteContent.findOne({ section });
      if (!existing) {
        await SiteContent.create({ section, data });
        seededSections++;
      }
    }
    if (seededSections > 0) {
      console.log(`[Seed] Seeded ${seededSections} missing CMS content section(s).`);
    } else {
      console.log('[Seed] All CMS content sections already present. Preserving existing content.');
    }
    console.log('[Seed] Database verification complete. Zero records overwritten.');
  } catch (error) {
    console.error('[Seed] Error during verification:', error.message);
  }
};

// Execute if run directly from CLI
if (process.argv[1]?.includes('seedData.js')) {
  seedDatabase().then(() => process.exit(0));
}
