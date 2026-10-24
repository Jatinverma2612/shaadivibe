import test from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = 'http://127.0.0.1:5000/api';

test('ShaadiVibe Phase 2 API Test Suite', async (t) => {
  let customer1Token = '';
  let customer1User = null;
  let customer2Token = '';
  let draftId = '';
  let draftSlug = '';

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

  await t.test('3. Unauthorized access restrictions', async () => {
    // Missing token
    const resNoAuth = await fetch(`${BASE_URL}/auth/me`);
    assert.equal(resNoAuth.status, 401);

    // Invalid token
    const resBadToken = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: 'Bearer invalid.token.payload' },
    });
    assert.equal(resBadToken.status, 401);
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
    // Disallow non-image formats (e.g., text or script)
    const formBad = new FormData();
    formBad.append('photos', new Blob(['console.log("hack");'], { type: 'application/javascript' }), 'evil.js');

    const resBad = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      body: formBad,
    });
    assert.equal(resBad.status, 500); // Multer fileFilter throws format rejection error

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

  await t.test('12. Admin role enforcement', async () => {
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
        email: 'admin@shaadivibe.com',
        password: 'Admin@123456',
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
  });
});
