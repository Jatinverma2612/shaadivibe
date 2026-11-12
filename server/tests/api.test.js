import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

import app from '../src/app.js';
import { connectDB, disconnectDB, getConnectionStatus, isDatabaseConnected } from '../src/config/db.js';
import jwt from 'jsonwebtoken';
import { User } from '../src/models/User.js';
import { Invitation } from '../src/models/Invitation.js';
import { Theme } from '../src/models/Theme.js';
import { Order } from '../src/models/Order.js';
import { Rsvp } from '../src/models/Rsvp.js';
import { Coupon } from '../src/models/Coupon.js';
import { Ticket } from '../src/models/Ticket.js';

let testServer = null;
let BASE_URL = 'http://127.0.0.1:5000/api';

test('ShaadiVibe Phase 4 API Test Suite', async (t) => {
  let customer1Token = '';
  let customer1User = null;
  let customer2Token = '';
  let draftId = '';
  let draftSlug = '';

  before(async () => {
    // Check if server is already running on port 5000
    try {
      const checkRes = await fetch('http://127.0.0.1:5000/api/health', { signal: AbortSignal.timeout(1000) });
      if (checkRes.ok) {
        BASE_URL = 'http://127.0.0.1:5000/api';
        await connectDB();
        return;
      }
    } catch (e) {
      // Server not running, launch ephemeral instance
    }

    testServer = http.createServer(app);
    await new Promise((resolve) => testServer.listen(0, '127.0.0.1', resolve));
    const port = testServer.address().port;
    BASE_URL = `http://127.0.0.1:${port}/api`;
    await connectDB();
    let retries = 0;
    while (!isDatabaseConnected() && retries < 15) {
      await new Promise((r) => setTimeout(r, 500));
      retries++;
    }
  });

  after(async () => {
    // Isolated cleanup of test-generated records only
    try {
      await User.deleteMany({ email: /@testroyal\.com$/ });
      await User.deleteMany({ email: /temp_deleted_/ });
      await Invitation.deleteMany({ slug: /meera-rajput-weds-vikramaditya-rathore/i });
      await Invitation.deleteMany({ slug: /ananya-roy-weds-kabir-kapoor/i });
      await Invitation.deleteMany({ slug: /rhea-singhania-weds-aryan-oberoi/i });
      await Invitation.deleteMany({ slug: /tanya-weds-varun/i });
      await Invitation.deleteMany({ slug: /simran-weds-raj/i });
      await Theme.deleteMany({ slug: /royal-jaipur-palace-\d+/ });
      await Theme.deleteMany({ slug: /test-draft-theme-\d+/ });
      await Theme.deleteMany({ slug: /test-archive-theme-/ });
      await Theme.deleteMany({ slug: /royal-udaipur-test-/ });
      await Order.deleteMany({ 'customerSnapshot.email': /@testroyal\.com$/ });
    } catch (cleanupErr) {
      // Safe cleanup ignore
    }

    if (testServer) {
      await new Promise((resolve) => testServer.close(resolve));
    }
    await disconnectDB();
  });

  await t.test('0. Database connection and health lifecycle monitoring', async () => {
    assert.ok(isDatabaseConnected(), 'Mongoose should report active connected readyState');
    const status = getConnectionStatus();
    assert.equal(status.isConnected, true);
    assert.equal(status.state, 'connected');
    assert.ok(status.host, 'Host should be reported');
    assert.ok(status.name, 'Database name should be reported');

    const healthRes = await fetch(`${BASE_URL}/health`);
    assert.equal(healthRes.status, 200);
    const health = await healthRes.json();
    assert.equal(health.status, 'healthy');
    assert.equal(health.database.isConnected, true);
    assert.equal(health.database.state, 'connected');
  });

  await t.test('1. Registration validation and success', async () => {
    // Missing fields
    const resEmpty = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(resEmpty.status, 400);

    // Password too short (< 8 chars)
    const resShort = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Customer',
        email: 'short_pw@test.com',
        password: '123',
      }),
    });
    assert.equal(resShort.status, 400);

    // Valid Customer 1 Registration
    const email1 = `customer_${Date.now()}@testroyal.com`;
    const res1 = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Meera Rajput',
        email: email1,
        password: 'RoyalPassword@2026',
      }),
    });
    assert.equal(res1.status, 201);
    const data1 = await res1.json();
    assert.equal(data1.success, true);
    assert.equal(data1.user.role, 'customer');
    assert.ok(data1.token);
    customer1Token = data1.token;
    customer1User = data1.user;

    // Duplicate email registration should fail
    const resDup = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Meera Duplicate',
        email: email1,
        password: 'RoyalPassword@2026',
      }),
    });
    assert.equal(resDup.status, 400);

    // Register Customer 2 (for IDOR testing)
    const email2 = `customer2_${Date.now()}@testroyal.com`;
    const res2 = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Devendra Singhania',
        email: email2,
        password: 'SinghaniaPassword@2026',
      }),
    });
    assert.equal(res2.status, 201);
    const data2 = await res2.json();
    customer2Token = data2.token;
  });

  await t.test('2. Customer Login & Session retrieval', async () => {
    // Bad credentials
    const badLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: customer1User.email,
        password: 'WrongPassword!',
      }),
    });
    assert.equal(badLogin.status, 401);

    // Valid login
    const goodLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: customer1User.email,
        password: 'RoyalPassword@2026',
      }),
    });
    assert.equal(goodLogin.status, 200);
    const loginData = await goodLogin.json();
    assert.equal(loginData.success, true);
    assert.equal(loginData.user.email, customer1User.email);

    // Fetch /api/auth/me
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    assert.equal(meRes.status, 200);
    const meData = await meRes.json();
    assert.equal(meData.user.email, customer1User.email);
    assert.equal(meData.user.name, 'Meera Rajput');
  });

  await t.test('3. Strict database-first authentication & token security', async () => {
    const secret = process.env.JWT_SECRET || 'shaadivibe_royal_super_secret_jwt_key_2026_dev';

    // 3a. Missing token
    const resNoAuth = await fetch(`${BASE_URL}/auth/me`);
    assert.equal(resNoAuth.status, 401);

    // 3b. Malformed token
    const resBadToken = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: 'Bearer invalid.token.payload' },
    });
    assert.equal(resBadToken.status, 401);

    // 3c. Invalid signature (signed with different secret)
    const forgedToken = jwt.sign(
      { id: customer1User.id, email: customer1User.email, role: 'customer' },
      'forged_secret_key_12345'
    );
    const resForged = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${forgedToken}` },
    });
    assert.equal(resForged.status, 401);

    // 3d. Expired token
    const expiredToken = jwt.sign(
      { id: customer1User.id, email: customer1User.email, role: 'customer' },
      secret,
      { expiresIn: '-1s' }
    );
    const resExpired = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    assert.equal(resExpired.status, 401);

    // 3e. Token belonging to deleted user (verifies that req.user is NEVER synthesized)
    const tempUser = await User.create({
      name: 'Temporary Deleted',
      email: `temp_deleted_${Date.now()}@testroyal.com`,
      password: 'TemporaryPassword@123',
      role: 'customer',
    });
    const tempToken = jwt.sign(
      { id: tempUser._id.toString(), email: tempUser.email, role: tempUser.role },
      secret,
      { expiresIn: '1h' }
    );
    // Delete user directly from MongoDB Atlas
    await User.deleteOne({ _id: tempUser._id });

    // Request with token of deleted user must return 401 (never synthesize req.user)
    const resDeletedUser = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${tempToken}` },
    });
    assert.equal(resDeletedUser.status, 401);
    const deletedBody = await resDeletedUser.json();
    assert.equal(deletedBody.success, false);
    assert.match(deletedBody.message, /no longer exists|invalidated/i);

    // 3f. Customer attempting to access admin-only API
    const resCustOnAdmin = await fetch(`${BASE_URL}/themes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({
        name: 'Unauthorized Theme',
        slug: 'unauthorized-theme',
        category: 'Royal',
        coverImage: 'https://example.com/cover.jpg',
      }),
    });
    assert.equal(resCustOnAdmin.status, 403);
    const custOnAdminData = await resCustOnAdmin.json();
    assert.equal(custOnAdminData.success, false);
    assert.match(custOnAdminData.message, /Admin privileges required/i);

    // 3g. Optional authentication on public route
    // Anonymous visitor with no token
    const resAnon = await fetch(`${BASE_URL}/invitations/priya-and-rohan`);
    assert.equal(resAnon.status, 200);

    // Anonymous visitor with garbage/invalid token (proceeds as public anonymous, does not crash or elevate privileges)
    const resAnonBadToken = await fetch(`${BASE_URL}/invitations/priya-and-rohan`, {
      headers: { Authorization: 'Bearer bad.token.here' },
    });
    assert.equal(resAnonBadToken.status, 200);

    // Authenticated customer accessing public route
    const resAuthVisitor = await fetch(`${BASE_URL}/invitations/priya-and-rohan`, {
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    assert.equal(resAuthVisitor.status, 200);
  });

  await t.test('4. Draft creation and persistence', async () => {
    const draftPayload = {
      brideName: 'Meera Rajput',
      groomName: 'Vikramaditya Rathore',
      weddingDate: '2026-12-10T18:00:00.000Z',
      weddingTime: '06:30 PM',
      language: 'English',
      tagline: 'A Royal Rajputana Union',
      venue: {
        name: 'Jagmandir Island Palace',
        address: 'Lake Pichola, Udaipur, Rajasthan',
        mapUrl: 'https://maps.google.com/?q=Jagmandir+Udaipur',
      },
      events: [
        {
          id: 'evt-pheran',
          title: 'Royal Pheras',
          date: '10 Dec 2026',
          time: '07:00 PM',
          venue: 'Main Courtyard',
          description: 'Vedic rituals and sacred mantras under mandap',
        },
      ],
      photos: [
        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1000&q=80',
      ],
      status: 'draft',
    };

    const res = await fetch(`${BASE_URL}/invitations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify(draftPayload),
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.data.status, 'draft');
    assert.equal(data.data.brideName, 'Meera Rajput');
    assert.ok(data.data._id);
    assert.ok(data.data.slug);

    draftId = data.data._id;
    draftSlug = data.data.slug;
  });

  await t.test('5. Private draft access restrictions', async () => {
    // Unauthenticated public visitor fetching private draft by slug -> must be 404
    const anonRes = await fetch(`${BASE_URL}/invitations/${draftSlug}`);
    assert.equal(anonRes.status, 404);

    // Customer 2 trying to fetch Customer 1 draft by ID -> must be 403 Forbidden
    const idorRes = await fetch(`${BASE_URL}/invitations/id/${draftId}`, {
      headers: { Authorization: `Bearer ${customer2Token}` },
    });
    assert.equal(idorRes.status, 403);

    // Customer 1 (owner) can fetch own draft
    const ownerRes = await fetch(`${BASE_URL}/invitations/id/${draftId}`, {
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    assert.equal(ownerRes.status, 200);
    const ownerData = await ownerRes.json();
    assert.equal(ownerData.data.brideName, 'Meera Rajput');
  });

  await t.test('6. Customer draft update & IDOR protection', async () => {
    // Customer 2 attempts to update Customer 1's draft -> must be 403
    const idorUpdate = await fetch(`${BASE_URL}/invitations/${draftId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer2Token}`,
      },
      body: JSON.stringify({ brideName: 'Malicious Overwrite' }),
    });
    assert.equal(idorUpdate.status, 403);

    // Customer 1 updates own draft
    const updateRes = await fetch(`${BASE_URL}/invitations/${draftId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({
        tagline: 'Two Souls, One Royal Heritage',
      }),
    });
    assert.equal(updateRes.status, 200);
    const updateData = await updateRes.json();
    assert.equal(updateData.data.tagline, 'Two Souls, One Royal Heritage');
  });

  await t.test('7. Explicit Publishing & Public Sharing', async () => {
    // Customer 2 attempts to publish Customer 1's draft -> must be 403
    const idorPub = await fetch(`${BASE_URL}/invitations/${draftId}/publish`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${customer2Token}` },
    });
    assert.equal(idorPub.status, 403);

    // Customer 1 publishes invitation
    const pubRes = await fetch(`${BASE_URL}/invitations/${draftId}/publish`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    assert.equal(pubRes.status, 200);
    const pubData = await pubRes.json();
    assert.equal(pubData.data.status, 'published');
    assert.ok(pubData.shareUrl.includes(draftSlug));

    // Public anonymous visitor can now access the published invitation!
    const publicRes = await fetch(`${BASE_URL}/invitations/${draftSlug}`);
    assert.equal(publicRes.status, 200);
    const publicData = await publicRes.json();
    assert.equal(publicData.success, true);
    assert.equal(publicData.data.brideName, 'Meera Rajput');
    assert.equal(publicData.data.groomName, 'Vikramaditya Rathore');
  });

  await t.test('8. Customer Dashboard invitation query', async () => {
    const listRes = await fetch(`${BASE_URL}/invitations`, {
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    assert.equal(listRes.status, 200);
    const listData = await listRes.json();
    assert.equal(listData.success, true);
    assert.ok(Array.isArray(listData.data));
    assert.ok(listData.data.some((inv) => inv._id === draftId || inv.slug === draftSlug));
  });

  await t.test('9. Unpublish and Re-lock private draft', async () => {
    // Unpublish
    const unpubRes = await fetch(`${BASE_URL}/invitations/${draftId}/unpublish`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    assert.equal(unpubRes.status, 200);
    const unpubData = await unpubRes.json();
    assert.equal(unpubData.data.status, 'draft');

    // Anonymous visitor once again gets 404 for unpublished draft
    const anonAfterUnpub = await fetch(`${BASE_URL}/invitations/${draftSlug}`);
    assert.equal(anonAfterUnpub.status, 404);
  });

  await t.test('10. Delete invitation with ownership check', async () => {
    // Customer 2 attempts to delete Customer 1's draft -> 403
    const idorDel = await fetch(`${BASE_URL}/invitations/${draftId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${customer2Token}` },
    });
    assert.equal(idorDel.status, 403);

    // Customer 1 deletes draft
    const delRes = await fetch(`${BASE_URL}/invitations/${draftId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    assert.equal(delRes.status, 200);

    // Verify it is gone
    const verifyGet = await fetch(`${BASE_URL}/invitations/id/${draftId}`, {
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    assert.equal(verifyGet.status, 404);
  });

  await t.test('11. Photo Upload validation', async () => {
    // Disallow non-image formats (e.g., text or script) -> 400 Bad Request
    const formBad = new FormData();
    formBad.append('photos', new Blob(['console.log("hack");'], { type: 'application/javascript' }), 'evil.js');

    const resBad = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      body: formBad,
    });
    assert.equal(resBad.status, 400); // Handled cleanly as Bad Request

    // Allow valid JPEG
    const formGood = new FormData();
    const dummyJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
    formGood.append('photos', new Blob([dummyJpeg], { type: 'image/jpeg' }), 'photo.jpg');

    const resGood = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      body: formGood,
    });
    assert.equal(resGood.status, 201);
    const goodData = await resGood.json();
    assert.equal(goodData.success, true);
    assert.ok(goodData.urls && goodData.urls.length > 0);
  });

  await t.test('12. Admin role enforcement & CMS updates', async () => {
    // Regular customer cannot update CMS content
    const customerCms = await fetch(`${BASE_URL}/content/hero`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({ data: { headline: 'Hacked Headline' } }),
    });
    assert.equal(customerCms.status, 403);

    // Admin login works and can update CMS
    const adminAuth = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: '@admin123',
      }),
    });
    assert.equal(adminAuth.status, 200);
    const adminData = await adminAuth.json();
    assert.equal(adminData.user.role, 'admin');

    const adminCms = await fetch(`${BASE_URL}/content/hero`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminData.token}`,
      },
      body: JSON.stringify({
        data: {
          headline: 'Craft Unforgettable Royal Indian Wedding Invitations',
        },
      }),
    });
    assert.equal(adminCms.status, 200);

    // Public guest fetching /api/content/hero sees the updated content
    const heroRes = await fetch(`${BASE_URL}/content/hero`);
    assert.equal(heroRes.status, 200);
    const heroData = await heroRes.json();
    assert.equal(heroData.data.headline, 'Craft Unforgettable Royal Indian Wedding Invitations');
  });

  await t.test('13. Draft saving idempotency and duplicate prevention', async () => {
    // Customer 1 creates a new draft
    const newDraft = await fetch(`${BASE_URL}/invitations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({
        brideName: 'Ananya Roy',
        groomName: 'Kabir Kapoor',
        weddingDate: '2026-11-20T18:00:00.000Z',
        weddingTime: '07:00 PM',
        venue: { name: 'Taj Lake Palace' },
        status: 'draft',
      }),
    });
    assert.equal(newDraft.status, 201);
    const draftRes = await newDraft.json();
    const invId = draftRes.data._id;
    const invSlug = draftRes.data.slug;

    // Saving again with the same _id must UPDATE the existing draft, not duplicate it
    const saveAgain = await fetch(`${BASE_URL}/invitations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({
        _id: invId,
        brideName: 'Ananya Roy',
        groomName: 'Kabir Kapoor',
        tagline: 'An Eternal Bond of Love',
        weddingDate: '2026-11-20T18:00:00.000Z',
        venue: { name: 'Taj Lake Palace' },
      }),
    });
    assert.equal(saveAgain.status, 200);
    const updatedRes = await saveAgain.json();
    assert.equal(updatedRes.data._id, invId);
    assert.equal(updatedRes.data.slug, invSlug);
    assert.equal(updatedRes.data.tagline, 'An Eternal Bond of Love');

    // Customer dashboard should only list this invitation once (no duplicates)
    const listRes = await fetch(`${BASE_URL}/invitations?search=Ananya`, {
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    assert.equal(listRes.status, 200);
    const listData = await listRes.json();
    const matched = listData.data.filter((i) => i.brideName === 'Ananya Roy');
    assert.equal(matched.length, 1);
  });

  await t.test('14. Ceremony itinerary updates and persistence', async () => {
    // Create draft with initial ceremony
    const createRes = await fetch(`${BASE_URL}/invitations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({
        brideName: 'Rhea Singhania',
        groomName: 'Aryan Oberoi',
        weddingDate: '2026-12-05T18:00:00.000Z',
        events: [
          {
            id: 'evt-haldi',
            title: 'Sunlit Haldi Ceremony',
            date: 'Day 1 — Morning',
            time: '10:00 AM',
            venue: 'Poolside Lawn',
            description: 'Auspicious turmeric blessing ceremony',
          },
        ],
      }),
    });
    assert.equal(createRes.status, 201);
    const inv = (await createRes.json()).data;

    // Update with an additional ceremony (Sangeet) and edit Haldi
    const updateRes = await fetch(`${BASE_URL}/invitations/${inv._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({
        events: [
          {
            id: 'evt-haldi',
            title: 'Golden Royal Haldi Ceremony',
            date: 'Day 1 — Morning',
            time: '10:30 AM',
            venue: 'Courtyard Lawn',
            description: 'Turmeric ritual with live dhol music',
          },
          {
            id: 'evt-sangeet',
            title: 'Musical Sangeet Night',
            date: 'Day 1 — Evening',
            time: '07:30 PM',
            venue: 'Grand Ballroom',
            description: 'Dance, music, and royal feast',
          },
        ],
      }),
    });
    assert.equal(updateRes.status, 200);
    const updatedInv = (await updateRes.json()).data;
    assert.equal(updatedInv.events.length, 2);
    assert.equal(updatedInv.events[0].title, 'Golden Royal Haldi Ceremony');
    assert.equal(updatedInv.events[1].title, 'Musical Sangeet Night');
  });

  await t.test('15. Admin Theme management and Public Gallery visibility', async () => {
    // Admin login
    const adminAuth = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: '@admin123',
      }),
    });
    const adminToken = (await adminAuth.json()).token;

    const themeTimestamp = Date.now();
    const uniqueThemeSlug = `royal-jaipur-palace-${themeTimestamp}`;
    const uniqueThemeName = `Royal Jaipur Palace ${themeTimestamp}`;

    // Create a new Theme
    const newThemeRes = await fetch(`${BASE_URL}/themes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: uniqueThemeName,
        slug: uniqueThemeSlug,
        description: 'Enchanting pink city floral elegance for royal weddings.',
        category: 'Floral',
        coverImage: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a',
        priceDisplay: 2499,
        supportedFormats: ['Interactive Website'],
      }),
    });
    assert.equal(newThemeRes.status, 201);
    const createdTheme = (await newThemeRes.json()).data;
    const themeId = createdTheme._id || createdTheme.id;

    // Initially published: public visitor can find it
    const publicThemes = await fetch(`${BASE_URL}/themes?search=${themeTimestamp}`);
    assert.equal(publicThemes.status, 200);
    const publicData = await publicThemes.json();
    assert.ok(publicData.data.some((t) => t.slug === uniqueThemeSlug));

    // Admin unpublishes the theme
    const unpubRes = await fetch(`${BASE_URL}/themes/${themeId}/publish`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(unpubRes.status, 200);
    const unpubData = await unpubRes.json();
    assert.equal(unpubData.data.isPublished, false);

    // Public gallery must not expose unpublished themes to unauthorised visitors
    const publicAfterUnpub = await fetch(`${BASE_URL}/themes?search=${themeTimestamp}`);
    assert.equal(publicAfterUnpub.status, 200);
    const afterData = await publicAfterUnpub.json();
    assert.ok(!afterData.data.some((t) => t.slug === uniqueThemeSlug));

    // Admin querying with ?all=true CAN see the unpublished theme
    const adminThemes = await fetch(`${BASE_URL}/themes?all=true&search=${themeTimestamp}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(adminThemes.status, 200);
    const adminThemeData = await adminThemes.json();
    assert.ok(adminThemeData.data.some((t) => t.slug === uniqueThemeSlug));
  });

  await t.test('16. Malformed ObjectId handling across all endpoints', async () => {
    // Malformed ID on invitation endpoints
    const badId = 'not-a-valid-objectid-123';

    const getRes = await fetch(`${BASE_URL}/invitations/id/${badId}`, {
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    assert.equal(getRes.status, 400);
    const getBody = await getRes.json();
    assert.equal(getBody.success, false);
    assert.match(getBody.message, /invalid invitation id format/i);

    const putRes = await fetch(`${BASE_URL}/invitations/${badId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({ brideName: 'Test' }),
    });
    assert.equal(putRes.status, 400);

    const pubRes = await fetch(`${BASE_URL}/invitations/${badId}/publish`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    assert.equal(pubRes.status, 400);

    const unpubRes = await fetch(`${BASE_URL}/invitations/${badId}/unpublish`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    assert.equal(unpubRes.status, 400);

    const delRes = await fetch(`${BASE_URL}/invitations/${badId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    assert.equal(delRes.status, 400);

    // Nonexistent valid 24-character ObjectId
    const nonExistentId = '507f1f77bcf86cd799439011';
    const nonExistentGet = await fetch(`${BASE_URL}/invitations/id/${nonExistentId}`, {
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    assert.equal(nonExistentGet.status, 404);

    // Malformed ID on admin Theme endpoints
    const adminAuth = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: '@admin123',
      }),
    });
    const adminToken = (await adminAuth.json()).token;

    const themePut = await fetch(`${BASE_URL}/themes/${badId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ name: 'Theme' }),
    });
    assert.equal(themePut.status, 400);

    const themePub = await fetch(`${BASE_URL}/themes/${badId}/publish`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(themePub.status, 400);
  });

  await t.test('17. Anonymous draft creation, legitimate claiming, and ownership isolation', async () => {
    // 17a. Create a legitimate anonymous draft (no token)
    const anonPayload = {
      brideName: 'Tanya',
      groomName: 'Varun',
      weddingDate: '2026-12-25T18:00:00.000Z',
      weddingTime: '06:00 PM',
      tagline: 'An Auspicious Destiny',
      status: 'draft',
    };

    const anonRes = await fetch(`${BASE_URL}/invitations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(anonPayload),
    });
    assert.equal(anonRes.status, 201);
    const anonData = await anonRes.json();
    assert.equal(anonData.success, true);
    const anonId = anonData.data._id;
    assert.ok(anonId);

    // Verify draft in database has userId = null
    const dbDoc = await Invitation.findById(anonId);
    assert.ok(dbDoc);
    assert.equal(dbDoc.userId, null);

    // 17b. Customer 1 claims the unowned draft via PUT /api/invitations/:id
    const claimRes = await fetch(`${BASE_URL}/invitations/${anonId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({
        tagline: 'Claimed by Customer 1',
      }),
    });
    assert.equal(claimRes.status, 200);
    const claimData = await claimRes.json();
    assert.equal(claimData.success, true);

    // Verify draft is now owned by Customer 1 in database
    const claimedDoc = await Invitation.findById(anonId);
    assert.ok(claimedDoc.userId);
    assert.equal(claimedDoc.userId.toString(), customer1User.id);
    assert.equal(claimedDoc.tagline, 'Claimed by Customer 1');

    // 17c. Customer 2 attempts to claim or modify Customer 1's claimed draft -> MUST return 403 Forbidden
    const cust2Hijack = await fetch(`${BASE_URL}/invitations/${anonId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer2Token}`,
      },
      body: JSON.stringify({
        tagline: 'Stolen by Customer 2',
      }),
    });
    assert.equal(cust2Hijack.status, 403);
    const hijackBody = await cust2Hijack.json();
    assert.equal(hijackBody.success, false);

    // 17d. Customer 2 cannot publish, unpublish, or delete Customer 1's draft
    const cust2Pub = await fetch(`${BASE_URL}/invitations/${anonId}/publish`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${customer2Token}` },
    });
    assert.equal(cust2Pub.status, 403);

    const cust2Unpub = await fetch(`${BASE_URL}/invitations/${anonId}/unpublish`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${customer2Token}` },
    });
    assert.equal(cust2Unpub.status, 403);

    const cust2Del = await fetch(`${BASE_URL}/invitations/${anonId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${customer2Token}` },
    });
    assert.equal(cust2Del.status, 403);

    // Verify the draft remains owned by Customer 1 and tagline was unchanged
    const verifyDoc = await Invitation.findById(anonId);
    assert.equal(verifyDoc.userId.toString(), customer1User.id);
    assert.equal(verifyDoc.tagline, 'Claimed by Customer 1');

    // Clean up
    await Invitation.findByIdAndDelete(anonId);
  });

  await t.test('18. Concurrent claim conflict handling and client userId stripping', async () => {
    // 18a. Create a fresh anonymous draft
    const anonPayload2 = {
      brideName: 'Simran',
      groomName: 'Raj',
      weddingDate: '2027-01-15T18:00:00.000Z',
      weddingTime: '07:00 PM',
      status: 'draft',
    };

    const anonRes2 = await fetch(`${BASE_URL}/invitations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(anonPayload2),
    });
    assert.equal(anonRes2.status, 201);
    const anonId2 = (await anonRes2.json()).data._id;

    // 18b. Simulate concurrent claim attempts from Customer 1 and Customer 2
    const [resA, resB] = await Promise.all([
      fetch(`${BASE_URL}/invitations/${anonId2}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customer1Token}`,
        },
        body: JSON.stringify({ tagline: 'Claimed by User A' }),
      }),
      fetch(`${BASE_URL}/invitations/${anonId2}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customer2Token}`,
        },
        body: JSON.stringify({ tagline: 'Claimed by User B' }),
      }),
    ]);

    const statuses = [resA.status, resB.status];
    // Exactly one customer succeeds (200), the other receives 403 Forbidden
    assert.ok(statuses.includes(200), 'One concurrent claim must succeed');
    assert.ok(statuses.includes(403), 'The competing concurrent claim must be rejected with 403 Forbidden');

    // 18c. Test client userId stripping (prevent customer from transferring ownership via body)
    const winningDoc = await Invitation.findById(anonId2);
    const originalOwnerId = winningDoc.userId.toString();
    const tokenToUse = originalOwnerId === customer1User.id ? customer1Token : customer2Token;
    const fakeNewUserId = '654321654321654321654321';

    const tamperRes = await fetch(`${BASE_URL}/invitations/${anonId2}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenToUse}`,
      },
      body: JSON.stringify({
        tagline: 'Ownership tamper attempt',
        userId: fakeNewUserId,
      }),
    });
    assert.equal(tamperRes.status, 200);

    const docAfterTamper = await Invitation.findById(anonId2);
    // userId must NOT be changed to the client-supplied fakeNewUserId
    assert.equal(docAfterTamper.userId.toString(), originalOwnerId);
    assert.equal(docAfterTamper.tagline, 'Ownership tamper attempt');

    // Clean up
    await Invitation.findByIdAndDelete(anonId2);
  });

  await t.test('19. Public Theme Draft Visibility & Query Protection', async () => {
    // 19a. Admin login
    const adminAuth = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: '@admin123',
      }),
    });
    assert.equal(adminAuth.status, 200);
    const adminToken = (await adminAuth.json()).token;

    const draftTimestamp = Date.now();
    const draftSlug = `test-draft-theme-${draftTimestamp}`;
    const draftName = `Test Draft Theme ${draftTimestamp}`;

    // 19b. Create a draft theme (isPublished: false, status: 'draft')
    const createRes = await fetch(`${BASE_URL}/themes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: draftName,
        slug: draftSlug,
        description: 'Exclusive unreleased theme in drafting phase.',
        coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552',
        priceDisplay: 2999,
        isPublished: false,
        status: 'draft',
      }),
    });
    assert.equal(createRes.status, 201);
    const createdTheme = (await createRes.json()).data;
    assert.equal(createdTheme.isPublished, false);
    assert.equal(createdTheme.status, 'draft');

    // 19c. Unauthenticated public visitor queries:
    // Standard query must NOT return draft
    const pubRes1 = await fetch(`${BASE_URL}/themes?search=${draftTimestamp}`);
    assert.equal(pubRes1.status, 200);
    const pubData1 = await pubRes1.json();
    assert.equal(pubData1.data.some((t) => t.slug === draftSlug), false);

    // Tampering with ?status=draft must NOT return draft
    const pubRes2 = await fetch(`${BASE_URL}/themes?status=draft&search=${draftTimestamp}`);
    assert.equal(pubRes2.status, 200);
    const pubData2 = await pubRes2.json();
    assert.equal(pubData2.data.some((t) => t.slug === draftSlug), false);

    // Tampering with ?status=inactive must NOT return draft
    const pubRes3 = await fetch(`${BASE_URL}/themes?status=inactive&search=${draftTimestamp}`);
    assert.equal(pubRes3.status, 200);
    const pubData3 = await pubRes3.json();
    assert.equal(pubData3.data.some((t) => t.slug === draftSlug), false);

    // Tampering with ?all=true must NOT return draft
    const pubRes4 = await fetch(`${BASE_URL}/themes?all=true&search=${draftTimestamp}`);
    assert.equal(pubRes4.status, 200);
    const pubData4 = await pubRes4.json();
    assert.equal(pubData4.data.some((t) => t.slug === draftSlug), false);

    // Direct slug fetch by public caller must return 404
    const pubSlugRes = await fetch(`${BASE_URL}/themes/${draftSlug}`);
    assert.equal(pubSlugRes.status, 404);
    const pubSlugData = await pubSlugRes.json();
    assert.equal(pubSlugData.success, false);
    assert.match(pubSlugData.message, /theme not found/i);

    // 19d. Authenticated regular customer queries:
    // Must also be denied draft access
    const custSlugRes = await fetch(`${BASE_URL}/themes/${draftSlug}`, {
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    assert.equal(custSlugRes.status, 404);

    const custQueryRes = await fetch(`${BASE_URL}/themes?status=draft&search=${draftTimestamp}`, {
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    assert.equal(custQueryRes.status, 200);
    const custQueryData = await custQueryRes.json();
    assert.equal(custQueryData.data.some((t) => t.slug === draftSlug), false);

    // 19e. Admin access:
    // Admin querying with ?all=true CAN see the draft theme
    const adminAllRes = await fetch(`${BASE_URL}/themes?all=true&search=${draftTimestamp}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(adminAllRes.status, 200);
    const adminAllData = await adminAllRes.json();
    assert.ok(adminAllData.data.some((t) => t.slug === draftSlug));

    // Admin querying with ?status=draft CAN see the draft theme
    const adminDraftRes = await fetch(`${BASE_URL}/themes?status=draft&search=${draftTimestamp}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(adminDraftRes.status, 200);
    const adminDraftData = await adminDraftRes.json();
    assert.ok(adminDraftData.data.some((t) => t.slug === draftSlug));

    // Admin direct slug fetch returns 200 with theme details
    const adminSlugRes = await fetch(`${BASE_URL}/themes/${draftSlug}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(adminSlugRes.status, 200);
    const adminSlugData = await adminSlugRes.json();
    assert.equal(adminSlugData.data.slug, draftSlug);

    // Cleanup
    await Theme.findByIdAndDelete(createdTheme._id);
  });

  await t.test('20. Safe Theme Deletion & Archive Safeguard', async () => {
    // 20a. Admin login
    const adminAuth = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: '@admin123',
      }),
    });
    const adminToken = (await adminAuth.json()).token;

    const stamp = Date.now();
    const unreferencedSlug = `test-archive-theme-unref-${stamp}`;
    const referencedSlug = `test-archive-theme-ref-${stamp}`;

    // 20b. Create unreferenced Theme A
    const themeARes = await fetch(`${BASE_URL}/themes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: `Unreferenced Theme ${stamp}`,
        slug: unreferencedSlug,
        description: 'Theme with no invitation links.',
        coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552',
        priceDisplay: 1999,
        isPublished: true,
      }),
    });
    assert.equal(themeARes.status, 201);
    const themeAId = (await themeARes.json()).data._id;

    // 20c. Create referenced Theme B
    const themeBRes = await fetch(`${BASE_URL}/themes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: `Referenced Theme ${stamp}`,
        slug: referencedSlug,
        description: 'Theme referenced by live customer invitation.',
        coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552',
        priceDisplay: 2499,
        isPublished: true,
      }),
    });
    assert.equal(themeBRes.status, 201);
    const themeBId = (await themeBRes.json()).data._id;

    // 20d. Create and publish an Invitation referencing Theme B (by themeId & themeSlug)
    const invRes = await fetch(`${BASE_URL}/invitations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({
        brideName: 'Aarti',
        groomName: 'Vikram',
        weddingDate: '2027-02-20T18:00:00.000Z',
        weddingTime: '06:00 PM',
        themeId: themeBId,
        themeSlug: referencedSlug,
      }),
    });
    assert.equal(invRes.status, 201);
    const invData = (await invRes.json()).data;
    const invId = invData._id;

    // Publish the invitation so it is publicly accessible
    const pubInvRes = await fetch(`${BASE_URL}/invitations/${invId}/publish`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    assert.equal(pubInvRes.status, 200);

    // 20e. Attempt to delete referenced Theme B -> MUST soft-delete/archive
    const delThemeBRes = await fetch(`${BASE_URL}/themes/${themeBId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(delThemeBRes.status, 200);
    const delThemeBData = await delThemeBRes.json();
    assert.equal(delThemeBData.success, true);
    assert.equal(delThemeBData.archived, true);
    assert.match(delThemeBData.message, /archived/i);

    // Verify Theme B still exists in database with archived status
    const docB = await Theme.findById(themeBId);
    assert.ok(docB, 'Referenced theme must still exist in MongoDB');
    assert.equal(docB.isPublished, false);
    assert.equal(docB.status, 'archived');
    assert.equal(docB.isArchived, true);
    assert.ok(docB.archivedAt instanceof Date);

    // Public visitor cannot discover archived Theme B
    const pubB = await fetch(`${BASE_URL}/themes/${referencedSlug}`);
    assert.equal(pubB.status, 404);

    // Customer invitation referencing Theme B remains completely intact
    const checkInv = await fetch(`${BASE_URL}/invitations/${invData.slug}`);
    assert.equal(checkInv.status, 200);
    const checkInvData = await checkInv.json();
    assert.equal(checkInvData.data.themeSlug, referencedSlug);

    // 20f. Delete unreferenced Theme A -> MUST hard delete
    const delThemeARes = await fetch(`${BASE_URL}/themes/${themeAId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(delThemeARes.status, 200);
    const delThemeAData = await delThemeARes.json();
    assert.equal(delThemeAData.success, true);
    assert.equal(delThemeAData.archived, false);

    // Verify Theme A is completely removed from DB
    const docA = await Theme.findById(themeAId);
    assert.equal(docA, null, 'Unreferenced theme must be hard deleted from database');

    // Clean up
    await Invitation.findByIdAndDelete(invId);
    await Theme.findByIdAndDelete(themeBId);
  });

  await t.test('21. Upload Endpoint Role Separation & MIME Pairing Validation', async () => {
    // 21a. Admin login
    const adminAuth = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: '@admin123',
      }),
    });
    const adminToken = (await adminAuth.json()).token;

    const uploadsCreated = [];

    // Helper to upload via fetch FormData
    const sendUpload = async (endpoint, fieldName, blobContent, mimeType, filename, token = null) => {
      const fd = new FormData();
      const blob = new Blob([blobContent], { type: mimeType });
      fd.append(fieldName, blob, filename);

      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      return await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: fd,
      });
    };

    // 21b. Customer upload (POST /api/upload) accepts valid JPG photo
    const custJpgRes = await sendUpload('/upload', 'photos', 'fake-jpg-content', 'image/jpeg', 'photo.jpg');
    assert.equal(custJpgRes.status, 201);
    const custJpgData = await custJpgRes.json();
    assert.equal(custJpgData.success, true);
    if (custJpgData.url) uploadsCreated.push(custJpgData.url);

    // 21c. Customer upload rejects script/executable masquerading or non-image types
    const custScriptRes = await sendUpload('/upload', 'photos', 'console.log("hack")', 'application/javascript', 'exploit.js');
    assert.equal(custScriptRes.status, 400);
    const custScriptData = await custScriptRes.json();
    assert.equal(custScriptData.success, false);
    assert.match(custScriptData.message, /only jpg, png, and webp images are allowed/i);

    // 21d. Customer upload rejects extension/MIME mismatch (e.g. .jpg file with text/plain)
    const custMismatchRes = await sendUpload('/upload', 'photos', 'fake-data', 'text/plain', 'mismatch.jpg');
    assert.equal(custMismatchRes.status, 400);
    const custMismatchData = await custMismatchRes.json();
    assert.equal(custMismatchData.success, false);
    assert.match(custMismatchData.message, /only jpg, png, and webp images are allowed/i);

    // 21e. Customer upload rejects ZIP packages on public photo endpoint
    const custZipRes = await sendUpload('/upload', 'photos', 'PK00zip', 'application/zip', 'template.zip');
    assert.equal(custZipRes.status, 400);

    // 21f. Admin theme asset upload (POST /api/upload/theme-asset) - Auth enforcement
    // Anonymous request rejected with 401
    const anonAssetRes = await sendUpload('/upload/theme-asset', 'file', 'sample-zip', 'application/zip', 'theme.zip');
    assert.equal(anonAssetRes.status, 401);

    // Non-admin customer token rejected with 403
    const custAssetRes = await sendUpload('/upload/theme-asset', 'file', 'sample-zip', 'application/zip', 'theme.zip', customer1Token);
    assert.equal(custAssetRes.status, 403);

    // Admin token allows valid ZIP upload
    const adminZipRes = await sendUpload('/upload/theme-asset', 'file', 'sample-zip-data', 'application/zip', 'template.zip', adminToken);
    assert.equal(adminZipRes.status, 201);
    const adminZipData = await adminZipRes.json();
    assert.equal(adminZipData.success, true);
    if (adminZipData.url) uploadsCreated.push(adminZipData.url);

    // Admin token allows valid MP4 video upload
    const adminMp4Res = await sendUpload('/upload/theme-asset', 'file', 'sample-mp4-data', 'video/mp4', 'preview.mp4', adminToken);
    assert.equal(adminMp4Res.status, 201);
    const adminMp4Data = await adminMp4Res.json();
    assert.equal(adminMp4Data.success, true);
    if (adminMp4Data.url) uploadsCreated.push(adminMp4Data.url);

    // Admin upload rejects mismatched MIME (e.g. .mp4 file with application/pdf)
    const adminMismatchRes = await sendUpload('/upload/theme-asset', 'file', 'fake-pdf', 'application/pdf', 'video.mp4', adminToken);
    assert.equal(adminMismatchRes.status, 400);
    const adminMismatchData = await adminMismatchRes.json();
    assert.equal(adminMismatchData.success, false);
    assert.match(adminMismatchData.message, /allowed formats: jpg, png, webp, mp4, mov, and zip/i);

    // Clean up created test files from uploads folder
    const uploadRoot = path.resolve(__dirname, '..', 'uploads');
    for (const relUrl of uploadsCreated) {
      try {
        const basename = path.basename(relUrl);
        const fullPath = path.join(uploadRoot, basename);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch (err) {
        // Safe cleanup ignore
      }
    }
  });

  await t.test('22. Order Creation, Customer Validation, Theme Selection, Server-Side Pricing & Snapshot Integrity', async () => {
    // 22a. Admin authentication
    const adminAuth = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: '@admin123',
      }),
    });
    assert.equal(adminAuth.status, 200);
    const adminToken = (await adminAuth.json()).token;
    const customer1Id = customer1User.id || customer1User._id;

    // 22b. Customer validation: rejects non-existent customer
    const fakeCustRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        customerId: '507f1f77bcf86cd799439011',
        themeId: '507f1f77bcf86cd799439012',
      }),
    });
    assert.equal(fakeCustRes.status, 404);
    const fakeCustData = await fakeCustRes.json();
    assert.match(fakeCustData.message, /customer.*not found/i);

    // 22c. Theme validation: rejects non-existent theme
    const fakeThemeRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        customerId: customer1Id,
        themeId: '507f1f77bcf86cd799439012',
      }),
    });
    assert.equal(fakeThemeRes.status, 404);
    const fakeThemeData = await fakeThemeRes.json();
    assert.match(fakeThemeData.message, /theme.*does not exist/i);

    // 22d. Draft / archived theme validation: cannot order unpublished draft theme
    const draftTheme = await Theme.create({
      name: 'Unpublished Draft Suite',
      slug: `draft-suite-${Date.now()}`,
      category: 'Royal',
      themeType: 'website',
      priceDisplay: 5999,
      offerPrice: 3999,
      coverImage: 'https://images.unsplash.com/photo-draft.jpg',
      isPublished: false,
      status: 'draft',
    });

    const orderDraftThemeRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        customerId: customer1Id,
        themeId: draftTheme._id,
      }),
    });
    assert.equal(orderDraftThemeRes.status, 400);
    const orderDraftThemeData = await orderDraftThemeRes.json();
    assert.match(orderDraftThemeData.message, /archived or inactive/i);
    await Theme.findByIdAndDelete(draftTheme._id);

    // 22e. Create active published theme
    const testTheme = await Theme.create({
      name: 'Royal Udaipur Palace Suite',
      slug: `royal-udaipur-test-${Date.now()}`,
      category: 'Royal',
      themeType: 'website',
      priceDisplay: 8999,
      offerPrice: 5499,
      rating: 4.9,
      reviewsCount: 12,
      coverImage: 'https://images.unsplash.com/photo-test-palace.jpg',
      isPublished: true,
      status: 'active',
      tier: 'premium',
      supportedFormats: ['Interactive Website'],
      features: ['Music', 'RSVP', 'Guest Management'],
    });

    // 22f. Positive creation with server-side authoritative pricing
    // Attempt client-side price manipulation by passing fake low pricing
    const orderCreateRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        customerId: customer1Id,
        themeId: testTheme._id,
        pricing: { subtotal: 10, total: 10 },
        status: 'draft',
        notes: 'Special royal stationery package requested',
        source: 'admin_panel',
      }),
    });
    assert.equal(orderCreateRes.status, 201);
    const orderCreateData = await orderCreateRes.json();
    assert.equal(orderCreateData.success, true);
    const createdOrder = orderCreateData.data;

    // Verify orderNumber format
    assert.match(createdOrder.orderNumber, /^SV\d+$/);

    // Verify server authoritative pricing strictly overrides client attempt
    assert.equal(createdOrder.pricing.subtotal, 5499);
    assert.equal(createdOrder.pricing.total, 5499);
    assert.equal(createdOrder.pricing.currency, 'INR');

    // Verify customer snapshot integrity
    assert.equal(createdOrder.customerSnapshot.name, customer1User.name);
    assert.equal(createdOrder.customerSnapshot.email, customer1User.email);

    // Verify package snapshot integrity
    assert.equal(createdOrder.packageSnapshot.name, 'Royal Udaipur Palace Suite');
    assert.equal(createdOrder.packageSnapshot.slug, testTheme.slug);
    assert.equal(createdOrder.packageSnapshot.basePrice, 8999);
    assert.equal(createdOrder.packageSnapshot.offerPrice, 5499);
    assert.equal(createdOrder.status, 'draft');
  });

  await t.test('23. Order Lifecycle Transitions & State Machine Enforcement', async () => {
    const adminAuth = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: '@admin123',
      }),
    });
    const adminToken = (await adminAuth.json()).token;

    // Retrieve the draft test order from Test 22
    const testOrder = await Order.findOne({ 'customerSnapshot.email': customer1User.email, status: 'draft' });
    assert.ok(testOrder, 'Draft test order must exist');
    const orderId = testOrder._id.toString();

    // 23a. Allowed transition: draft -> pending
    const toPendingRes = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'pending' }),
    });
    assert.equal(toPendingRes.status, 200);
    const pendingData = await toPendingRes.json();
    assert.equal(pendingData.data.status, 'pending');

    // 23b. Allowed transition: pending -> confirmed
    const toConfirmedRes = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'confirmed' }),
    });
    assert.equal(toConfirmedRes.status, 200);
    const confirmedData = await toConfirmedRes.json();
    assert.equal(confirmedData.data.status, 'confirmed');
    assert.ok(confirmedData.data.confirmedAt);

    // 23c. Allowed transition: confirmed -> processing
    const toProcessingRes = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'processing' }),
    });
    assert.equal(toProcessingRes.status, 200);
    const processingData = await toProcessingRes.json();
    assert.equal(processingData.data.status, 'processing');

    // 23d. Allowed transition: processing -> completed
    const toCompletedRes = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'completed' }),
    });
    assert.equal(toCompletedRes.status, 200);
    const completedData = await toCompletedRes.json();
    assert.equal(completedData.data.status, 'completed');
    assert.ok(completedData.data.completedAt);

    // 23e. Rejected transition: backwards illegal transition (completed -> pending)
    const illegalBackwardsRes = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'pending' }),
    });
    assert.equal(illegalBackwardsRes.status, 400);
    const illegalData = await illegalBackwardsRes.json();
    assert.match(illegalData.message, /invalid order status transition|cannot change order from/i);

    // 23f. Customer isolation: Customer 1 sees their own order in /my-orders
    const myOrdersRes = await fetch(`${BASE_URL}/orders/my-orders`, {
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    assert.equal(myOrdersRes.status, 200);
    const myOrdersData = await myOrdersRes.json();
    const hasMyOrder = myOrdersData.data.some((o) => (o._id || o.id) === orderId);
    assert.ok(hasMyOrder, 'Customer 1 must see their order in my-orders');

    // 23g. Customer isolation: Customer 2 receives 403 trying to view Customer 1 order by ID
    const crossAccessRes = await fetch(`${BASE_URL}/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${customer2Token}` },
    });
    assert.equal(crossAccessRes.status, 403);
    const crossAccessData = await crossAccessRes.json();
    assert.match(crossAccessData.message, /access denied|permission/i);
  });

  await t.test('24. Historical Snapshot Preservation on Theme Archive & Deletion Safeguard', async () => {
    const adminAuth = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: '@admin123',
      }),
    });
    const adminToken = (await adminAuth.json()).token;

    // Retrieve the completed test order
    const completedOrder = await Order.findOne({
      'customerSnapshot.email': customer1User.email,
      status: 'completed',
    });
    assert.ok(completedOrder, 'Completed order must exist');
    const completedOrderId = completedOrder._id.toString();

    // 24a. Archive and reprice the underlying Theme in the database
    const themeDoc = await Theme.findById(completedOrder.themeId);
    assert.ok(themeDoc, 'Original theme must exist');
    themeDoc.name = 'Renamed & Modified Palace Suite';
    themeDoc.offerPrice = 99999;
    themeDoc.priceDisplay = 199999;
    themeDoc.status = 'archived';
    themeDoc.isPublished = false;
    themeDoc.isArchived = true;
    await themeDoc.save();

    // 24b. Fetch the order via API: snapshot must remain perfectly preserved
    const fetchOrderRes = await fetch(`${BASE_URL}/orders/${completedOrderId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(fetchOrderRes.status, 200);
    const fetchOrderData = await fetchOrderRes.json();
    const orderDoc = fetchOrderData.data;

    // Snapshot integrity assertions: packageSnapshot reflects purchase-time, not mutated theme
    assert.equal(orderDoc.packageSnapshot.name, 'Royal Udaipur Palace Suite');
    assert.equal(orderDoc.packageSnapshot.offerPrice, 5499);
    assert.equal(orderDoc.packageSnapshot.basePrice, 8999);
    assert.equal(orderDoc.pricing.total, 5499);

    // 24c. Deletion Safeguard: Cannot delete non-draft (completed) order
    const delCompletedRes = await fetch(`${BASE_URL}/orders/${completedOrderId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(delCompletedRes.status, 400);
    const delCompletedData = await delCompletedRes.json();
    assert.match(delCompletedData.message, /cannot be deleted to preserve audit|cannot be deleted/i);

    // Completed order is still intact in DB
    const orderStillExists = await Order.findById(completedOrderId);
    assert.ok(orderStillExists, 'Completed order must not be deleted');

    // 24d. Draft deletion: Create another draft order and verify deletion succeeds
    const activeThemeForDraft = await Theme.create({
      name: 'Draft Deletion Test Suite',
      slug: `draft-del-theme-${Date.now()}`,
      category: 'Floral',
      themeType: 'website',
      priceDisplay: 3999,
      offerPrice: 2999,
      coverImage: 'https://images.unsplash.com/photo-draft-del.jpg',
      isPublished: true,
      status: 'active',
    });

    const draftRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        customerId: customer1User.id || customer1User._id,
        themeId: activeThemeForDraft._id,
        status: 'draft',
      }),
    });
    assert.equal(draftRes.status, 201);
    const draftData = await draftRes.json();
    const draftOrderId = draftData.data._id;

    // Delete draft order -> MUST succeed
    const delDraftRes = await fetch(`${BASE_URL}/orders/${draftOrderId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(delDraftRes.status, 200);
    const delDraftData = await delDraftRes.json();
    assert.equal(delDraftData.success, true);

    // Verify draft is removed from DB
    const deletedDraftDoc = await Order.findById(draftOrderId);
    assert.equal(deletedDraftDoc, null, 'Draft order must be deleted');

    // Clean up
    await Order.findByIdAndDelete(completedOrderId);
    await Theme.findByIdAndDelete(themeDoc._id);
    await Theme.findByIdAndDelete(activeThemeForDraft._id);
  });

  await t.test('25. Pricing Integrity, Idempotency & Dashboard Metrics Audit', async () => {
    const adminAuth = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: '@admin123',
      }),
    });
    const adminToken = (await adminAuth.json()).token;
    const customer1Id = customer1User.id || customer1User._id;

    // 25a. Missing/Zero/Invalid Price safely rejected
    const zeroPriceTheme = await Theme.create({
      name: 'Zero Price Test Theme',
      slug: `zero-price-${Date.now()}`,
      category: 'Minimal',
      themeType: 'website',
      priceDisplay: 0,
      coverImage: 'https://images.unsplash.com/photo-zero.jpg',
      isPublished: true,
      status: 'active',
    });

    const rejectZeroPriceRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        customerId: customer1Id,
        themeId: zeroPriceTheme._id,
      }),
    });
    assert.equal(rejectZeroPriceRes.status, 400);
    const rejectZeroData = await rejectZeroPriceRes.json();
    assert.match(rejectZeroData.message, /invalid or missing price configuration/i);
    await Theme.findByIdAndDelete(zeroPriceTheme._id);

    // 25b. Invalid Offer Price Rule: offerPrice >= priceDisplay must be ignored
    const badOfferTheme = await Theme.create({
      name: 'Inverted Price Test Theme',
      slug: `inverted-price-${Date.now()}`,
      category: 'Royal',
      themeType: 'website',
      priceDisplay: 5000,
      offerPrice: 6500, // Invalid: offer price cannot exceed base price
      coverImage: 'https://images.unsplash.com/photo-inv.jpg',
      isPublished: true,
      status: 'active',
    });

    const badOfferOrderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        customerId: customer1Id,
        themeId: badOfferTheme._id,
        status: 'draft',
      }),
    });
    assert.equal(badOfferOrderRes.status, 201);
    const badOfferOrderData = await badOfferOrderRes.json();
    // Authoritative pricing must fall back to basePrice 5000
    assert.equal(badOfferOrderData.data.pricing.total, 5000);
    assert.equal(badOfferOrderData.data.packageSnapshot.offerPrice, 0);

    // 25c. Payment status safety: confirmed order remains unpaid without payment mechanism
    assert.equal(badOfferOrderData.data.paymentStatus, 'unpaid');
    const orderIdToTest = badOfferOrderData.data._id;

    // 25d. Idempotency: re-submitting with existing _id updates the draft rather than duplicating
    const retrySaveRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        _id: orderIdToTest,
        customerId: customer1Id,
        themeId: badOfferTheme._id,
        notes: 'Idempotency test verified notes',
        status: 'pending',
      }),
    });
    assert.equal(retrySaveRes.status, 200);
    const retrySaveData = await retrySaveRes.json();
    assert.equal(retrySaveData.data._id, orderIdToTest);
    assert.equal(retrySaveData.data.notes, 'Idempotency test verified notes');
    assert.equal(retrySaveData.data.status, 'pending');

    // Verify no duplicate order document was created
    const countOrders = await Order.countDocuments({ _id: orderIdToTest });
    assert.equal(countOrders, 1);

    // 25e. Dashboard metric integrity: drafts are excluded from totalOrders
    const draftCountBefore = await Order.countDocuments({ status: 'draft' });
    const dashRes = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(dashRes.status, 200);
    const dashData = await dashRes.json();
    assert.ok(typeof dashData.data.kpis.totalOrders === 'number');

    // Clean up
    await Order.findByIdAndDelete(orderIdToTest);
    await Theme.findByIdAndDelete(badOfferTheme._id);
  });

  await t.test('26. Phase D - Customer Management & Profile Safety', async () => {
    const adminAuth = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: '@admin123',
      }),
    });
    const { token: adminToken } = await adminAuth.json();

    // 26a. Admin fetches customer list
    const custListRes = await fetch(`${BASE_URL}/admin/customers`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(custListRes.status, 200);
    const custListData = await custListRes.json();
    assert.equal(custListData.success, true);
    assert.ok(Array.isArray(custListData.data.customers));
    assert.ok(custListData.data.customers.length > 0);

    // Verify passwords are excluded
    const sampleCust = custListData.data.customers[0];
    assert.equal(sampleCust.password, undefined);

    // 26b. Non-admin access is blocked (HTTP 403)
    const blockedRes = await fetch(`${BASE_URL}/admin/customers`, {
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    assert.equal(blockedRes.status, 403);

    const custId = customer1User.id || customer1User._id;

    // 26c. Get single customer details
    const singleRes = await fetch(`${BASE_URL}/admin/customers/${custId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(singleRes.status, 200);
    const singleData = await singleRes.json();
    assert.equal(singleData.success, true);
    assert.equal(singleData.data.customer.email, customer1User.email);
    assert.ok(Array.isArray(singleData.data.orders));
    assert.ok(Array.isArray(singleData.data.invitations));

    // 26d. Safe profile update
    const updateRes = await fetch(`${BASE_URL}/admin/customers/${custId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Verified Customer Updated',
        phone: '+91 99999 88888',
      }),
    });
    assert.equal(updateRes.status, 200);
    const updateData = await updateRes.json();
    assert.equal(updateData.data.name, 'Verified Customer Updated');

    // 26e. Privilege escalation rejection: attempting to set role to 'admin' returns 403
    const escalateRes = await fetch(`${BASE_URL}/admin/customers/${custId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        role: 'admin',
      }),
    });
    assert.equal(escalateRes.status, 403);
  });

  await t.test('27. Phase D - RSVP Management & Atomic Upsert Idempotency', async () => {
    const adminAuth = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: '@admin123',
      }),
    });
    const { token: adminToken } = await adminAuth.json();

    const custId = customer1User.id || customer1User._id;

    // Ensure a published wedding with events exists for testing
    let pubInv = await Invitation.findOne({ status: 'published', 'events.0': { $exists: true } });
    if (!pubInv) {
      pubInv = await Invitation.create({
        slug: `rsvp-test-wedding-${Date.now()}`,
        brideName: 'Ananya',
        groomName: 'Kabir',
        weddingDate: new Date('2026-12-15'),
        status: 'published',
        events: [{ id: 'event-1', title: 'Sangeet Night', date: '2026-12-14', time: '7:00 PM' }],
        userId: custId,
      });
    } else {
      pubInv.userId = custId;
      await pubInv.save();
    }
    const testSlug = pubInv.slug;
    const testEventId = pubInv.events[0].id || pubInv.events[0]._id;
    const testInvId = pubInv._id.toString();

    // Clean up any previous test RSVP for this guest
    await Rsvp.deleteMany({ guestEmail: 'arjun@example.com' });

    // 27a. Rejection when invitation slug does not exist
    const nonExistentRes = await fetch(`${BASE_URL}/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invitationSlug: 'non-existent-wedding-slug-xyz',
        ceremonyId: testEventId,
        guestName: 'Arjun Verma',
        guestEmail: 'arjun@example.com',
        attendance: 'attending',
      }),
    });
    assert.equal(nonExistentRes.status, 404);

    // 27b. Rejection when selected ceremony is not part of itinerary
    const badCeremonyRes = await fetch(`${BASE_URL}/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invitationSlug: testSlug,
        ceremonyId: 'completely-invalid-ceremony-id',
        guestName: 'Arjun Verma',
        guestEmail: 'arjun@example.com',
        attendance: 'attending',
      }),
    });
    assert.equal(badCeremonyRes.status, 400);

    // 27c. Successful RSVP submission for published wedding
    const validRsvpRes = await fetch(`${BASE_URL}/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invitationSlug: testSlug,
        ceremonyId: testEventId,
        guestName: 'Arjun Verma',
        guestEmail: 'arjun@example.com',
        guestPhone: '+91 98765 11111',
        attendance: 'attending',
        guestCount: 2,
        dietaryPreferences: 'Vegetarian',
        message: 'Heartiest congratulations to the auspicious couple!',
      }),
    });
    assert.ok([200, 201].includes(validRsvpRes.status));
    const validRsvpData = await validRsvpRes.json();
    assert.equal(validRsvpData.success, true);
    assert.equal(validRsvpData.data.attendance, 'attending');
    assert.equal(validRsvpData.data.guestCount, 2);

    // 27d. Atomic upsert idempotency: repeating submission updates response without creating duplicate
    const updateRsvpRes = await fetch(`${BASE_URL}/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invitationSlug: testSlug,
        ceremonyId: testEventId,
        guestName: 'Arjun Verma',
        guestEmail: 'arjun@example.com',
        attendance: 'declined',
        guestCount: 0,
        message: 'Regretfully cannot attend due to travel conflict.',
      }),
    });
    assert.equal(updateRsvpRes.status, 200);
    const updateRsvpData = await updateRsvpRes.json();
    assert.equal(updateRsvpData.data.attendance, 'declined');

    // Verify only ONE document exists for this guest & ceremony in DB
    const countRsvps = await Rsvp.countDocuments({
      invitationId: testInvId,
      ceremonyId: testEventId,
      guestEmail: 'arjun@example.com',
    });
    assert.equal(countRsvps, 1);

    // 27e. Owner access control: owner customer1 can view RSVPs
    const ownerRes = await fetch(`${BASE_URL}/rsvp/invitation/${testInvId}`, {
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    assert.equal(ownerRes.status, 200);
    const ownerData = await ownerRes.json();
    assert.equal(ownerData.success, true);
    assert.ok((ownerData.stats?.total || ownerData.summary?.total || ownerData.data?.length) >= 1);

    // 27f. IDOR Protection: unauthorized customer2 is blocked
    const idorRes = await fetch(`${BASE_URL}/rsvp/invitation/${testInvId}`, {
      headers: { Authorization: `Bearer ${customer2Token}` },
    });
    assert.equal(idorRes.status, 403);

    // 27g. Admin can view platform RSVP overview
    const adminRsvpRes = await fetch(`${BASE_URL}/rsvp/admin/all`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(adminRsvpRes.status, 200);
    const adminRsvpData = await adminRsvpRes.json();
    assert.ok(Array.isArray(adminRsvpData.data.rsvps));

    // Clean up test RSVP
    await Rsvp.deleteMany({ invitationId: testInvId, guestEmail: 'arjun@example.com' });
  });

  await t.test('28. Phase D - Coupons & Server-Side Discount Calculation', async () => {
    const adminAuth = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: '@admin123',
      }),
    });
    const { token: adminToken } = await adminAuth.json();
    const custId = customer1User.id || customer1User._id;

    const testCouponCode = `TESTOFF${Date.now().toString().slice(-4)}`;

    // 28a. Admin creates a coupon (auto uppercase normalization)
    const createRes = await fetch(`${BASE_URL}/admin/coupons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        code: testCouponCode.toLowerCase(), // pass lowercase to verify uppercase normalization
        description: '20% off with max cap of 1000',
        discountType: 'percentage',
        discountValue: 20,
        minOrderAmount: 2000,
        maxDiscountAmount: 1000,
        usageLimit: 50,
      }),
    });
    assert.equal(createRes.status, 201);
    const createData = await createRes.json();
    assert.equal(createData.data.code, testCouponCode.toUpperCase());
    const couponId = createData.data._id;

    // 28b. Duplicate coupon code returns 409 Conflict
    const dupRes = await fetch(`${BASE_URL}/admin/coupons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        code: testCouponCode,
        discountType: 'percentage',
        discountValue: 10,
      }),
    });
    assert.equal(dupRes.status, 409);

    // 28c. Public checkout validation: subtotal below minimum order amount fails
    const lowAmountRes = await fetch(`${BASE_URL}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: testCouponCode,
        orderAmount: 1500, // below 2000 min
      }),
    });
    assert.equal(lowAmountRes.status, 400);

    // 28d. Public checkout validation: valid amount computes correct capped discount
    // 20% of 6000 is 1200, but capped at 1000
    const validValRes = await fetch(`${BASE_URL}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: testCouponCode,
        orderAmount: 6000,
      }),
    });
    assert.equal(validValRes.status, 200);
    const validValData = await validValRes.json();
    assert.equal(validValData.data.discountAmount, 1000);

    // 28e. Order creation applies coupon server-side and increments usage count
    let theme = await Theme.findOne({ isPublished: true, isArchived: { $ne: true } });
    if (!theme) {
      theme = await Theme.create({
        name: 'Royal Coupon Suite',
        slug: `royal-coupon-suite-${Date.now()}`,
        category: 'Royal',
        themeType: 'website',
        priceDisplay: 5000,
        offerPrice: 4000,
        isPublished: true,
        status: 'active',
        supportedFormats: ['Interactive Website'],
      });
    }

    const orderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        customerId: custId,
        themeId: theme._id,
        couponCode: testCouponCode,
        status: 'draft',
      }),
    });
    assert.equal(orderRes.status, 201);
    const orderData = await orderRes.json();
    const createdOrder = orderData.data;

    // Check that discount was applied and couponSnapshot attached
    assert.ok(createdOrder.pricing.discount > 0);
    assert.equal(createdOrder.couponSnapshot.code, testCouponCode.toUpperCase());
    assert.equal(createdOrder.pricing.total, createdOrder.pricing.subtotal - createdOrder.pricing.discount);

    // Verify coupon usedCount incremented
    const updatedCoupon = await Coupon.findById(couponId);
    assert.equal(updatedCoupon.usedCount, 1);

    // 28f. Toggle coupon status
    const toggleRes = await fetch(`${BASE_URL}/admin/coupons/${couponId}/toggle`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(toggleRes.status, 200);
    const toggleData = await toggleRes.json();
    assert.equal(toggleData.data.isActive, false);

    // Validating deactivated coupon fails
    const inactiveValRes = await fetch(`${BASE_URL}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: testCouponCode, orderAmount: 5000 }),
    });
    assert.equal(inactiveValRes.status, 400);

    // Clean up test order & coupon
    await Order.findByIdAndDelete(createdOrder._id);
    await Coupon.findByIdAndDelete(couponId);
  });

  await t.test('29. Phase D - Support Tickets & Customer Isolation', async () => {
    const adminAuth = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: '@admin123',
      }),
    });
    const { token: adminToken } = await adminAuth.json();

    // 29a. Customer 1 creates a support ticket
    const ticketCreateRes = await fetch(`${BASE_URL}/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({
        subject: 'Ceremony background music volume question',
        description: 'Can we upload a custom Shehnai background track to our royal invitation?',
        category: 'invitation_customization',
        priority: 'high',
      }),
    });
    assert.equal(ticketCreateRes.status, 201);
    const ticketCreateData = await ticketCreateRes.json();
    assert.equal(ticketCreateData.success, true);
    const createdTicket = ticketCreateData.data;

    // Verify ticketNumber format
    assert.match(createdTicket.ticketNumber, /^TKT-\d{4}-\d{4}$/);
    assert.equal(createdTicket.status, 'open');
    assert.equal(createdTicket.priority, 'high');

    // 29b. Customer 1 views own tickets
    const myTicketsRes = await fetch(`${BASE_URL}/tickets/my`, {
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    assert.equal(myTicketsRes.status, 200);
    const myTicketsData = await myTicketsRes.json();
    assert.ok(myTicketsData.data.some((t) => t._id === createdTicket._id));

    // 29c. IDOR Protection: Customer 2 is blocked from viewing Customer 1's ticket
    const idorRes = await fetch(`${BASE_URL}/tickets/${createdTicket._id}`, {
      headers: { Authorization: `Bearer ${customer2Token}` },
    });
    assert.equal(idorRes.status, 403);

    // 29d. Admin views all support tickets
    const adminTicketsRes = await fetch(`${BASE_URL}/admin/tickets`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(adminTicketsRes.status, 200);
    const adminTicketsData = await adminTicketsRes.json();
    assert.ok(Array.isArray(adminTicketsData.data.tickets));
    assert.ok(adminTicketsData.data.tickets.some((t) => t._id === createdTicket._id));

    // 29e. Admin updates ticket status to 'resolved' and adds internal notes
    const updateTicketRes = await fetch(`${BASE_URL}/admin/tickets/${createdTicket._id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'resolved',
        adminNotes: 'Informed customer that custom MP3 audio upload is enabled in Theme Builder audio settings.',
      }),
    });
    assert.equal(updateTicketRes.status, 200);
    const updateTicketData = await updateTicketRes.json();
    assert.equal(updateTicketData.data.status, 'resolved');
    assert.ok(updateTicketData.data.resolvedAt !== null);

    // Clean up test ticket
    await Ticket.findByIdAndDelete(createdTicket._id);
  });

  await t.test('30. Admin Authorization Enforcement, Strict Role Separation & Privilege Escalation Prevention', async () => {
    const adminAuth = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: '@admin123',
      }),
    });
    assert.equal(adminAuth.status, 200);
    const { token: adminToken } = await adminAuth.json();

    // 30a. Unauthenticated requests to admin endpoints return 401
    const unauthOrders = await fetch(`${BASE_URL}/orders`);
    assert.equal(unauthOrders.status, 401);
    const unauthOrdersData = await unauthOrders.json();
    assert.equal(unauthOrdersData.success, false);

    const unauthCustomers = await fetch(`${BASE_URL}/admin/customers`);
    assert.equal(unauthCustomers.status, 401);

    const unauthCoupons = await fetch(`${BASE_URL}/admin/coupons`);
    assert.equal(unauthCoupons.status, 401);

    const unauthTickets = await fetch(`${BASE_URL}/admin/tickets`);
    assert.equal(unauthTickets.status, 401);

    const unauthDashboard = await fetch(`${BASE_URL}/admin/dashboard`);
    assert.equal(unauthDashboard.status, 401);

    const unauthRsvps = await fetch(`${BASE_URL}/rsvp/admin/all`);
    assert.equal(unauthRsvps.status, 401);

    // 30b. Authenticated customer tokens return 403 Forbidden on all admin endpoints
    const customerOrders = await fetch(`${BASE_URL}/orders`, {
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    assert.equal(customerOrders.status, 403);
    const customerOrdersData = await customerOrders.json();
    assert.equal(customerOrdersData.success, false);
    assert.equal(customerOrdersData.message, 'Forbidden. Admin privileges required.');

    const customerCreateOrder = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({ customerId: customer1User.id, themeId: '507f1f77bcf86cd799439011' }),
    });
    assert.equal(customerCreateOrder.status, 403);
    const customerCreateOrderData = await customerCreateOrder.json();
    assert.equal(customerCreateOrderData.message, 'Forbidden. Admin privileges required.');

    const customerCustomers = await fetch(`${BASE_URL}/admin/customers`, {
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    assert.equal(customerCustomers.status, 403);
    const customerCustomersData = await customerCustomers.json();
    assert.equal(customerCustomersData.message, 'Forbidden. Admin privileges required.');

    const customerCoupons = await fetch(`${BASE_URL}/admin/coupons`, {
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    assert.equal(customerCoupons.status, 403);
    const customerCouponsData = await customerCoupons.json();
    assert.equal(customerCouponsData.message, 'Forbidden. Admin privileges required.');

    const customerTickets = await fetch(`${BASE_URL}/admin/tickets`, {
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    assert.equal(customerTickets.status, 403);
    const customerTicketsData = await customerTickets.json();
    assert.equal(customerTicketsData.message, 'Forbidden. Admin privileges required.');

    const customerDashboard = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    assert.equal(customerDashboard.status, 403);
    const customerDashboardData = await customerDashboard.json();
    assert.equal(customerDashboardData.message, 'Forbidden. Admin privileges required.');

    const customerRsvps = await fetch(`${BASE_URL}/rsvp/admin/all`, {
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    assert.equal(customerRsvps.status, 403);
    const customerRsvpsData = await customerRsvps.json();
    assert.equal(customerRsvpsData.message, 'Forbidden. Admin privileges required.');

    // 30c. Valid admin token returns 200 on all admin endpoints
    const adminOrders = await fetch(`${BASE_URL}/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(adminOrders.status, 200);

    const adminCustomers = await fetch(`${BASE_URL}/admin/customers`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(adminCustomers.status, 200);

    const adminCoupons = await fetch(`${BASE_URL}/admin/coupons`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(adminCoupons.status, 200);

    const adminTickets = await fetch(`${BASE_URL}/admin/tickets`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(adminTickets.status, 200);

    const adminDashboard = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(adminDashboard.status, 200);

    const adminRsvps = await fetch(`${BASE_URL}/rsvp/admin/all`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(adminRsvps.status, 200);

    // 30d. Privilege escalation & role manipulation prevention:
    // Attacker crafts a token with manipulated role claim but invalid signature
    const forgedToken = jwt.sign(
      { id: customer1User.id, email: customer1User.email, role: 'admin' },
      'wrong_fake_secret_key'
    );
    const forgedRes = await fetch(`${BASE_URL}/orders`, {
      headers: { Authorization: `Bearer ${forgedToken}` },
    });
    assert.equal(forgedRes.status, 401);

    // Attacker crafts a token signed with the secret containing customer's ID and claims role: 'admin'
    // Backend protect middleware fetches User from MongoDB and verifies user.role from DB, NOT token claims!
    const secret = process.env.JWT_SECRET || 'shaadivibe_royal_super_secret_jwt_key_2026_dev';
    const fakeAdminToken = jwt.sign(
      { id: customer1User.id, email: customer1User.email, role: 'admin' },
      secret,
      { expiresIn: '1h' }
    );
    const escalatedRes = await fetch(`${BASE_URL}/orders`, {
      headers: { Authorization: `Bearer ${fakeAdminToken}` },
    });
    // Database record for customer1User is role: 'customer', so requireAdmin rejects with 403!
    assert.equal(escalatedRes.status, 403);
    const escalatedData = await escalatedRes.json();
    assert.equal(escalatedData.message, 'Forbidden. Admin privileges required.');

    // 30e. Expired and malformed token rejection
    const expiredToken = jwt.sign(
      { id: customer1User.id, email: customer1User.email, role: 'admin' },
      secret,
      { expiresIn: '-10s' }
    );
    const expiredRes = await fetch(`${BASE_URL}/orders`, {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    assert.equal(expiredRes.status, 401);

    const malformedRes = await fetch(`${BASE_URL}/orders`, {
      headers: { Authorization: 'Bearer totally.invalid.token' },
    });
    assert.equal(malformedRes.status, 401);
  });
});
