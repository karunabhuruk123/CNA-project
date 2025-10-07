test('DELETE a booking by ID', async ({ request }) => {
  // First, create a booking to ensure we have one to delete
  const createResponse = await request.post('https://restful-booker.herokuapp.com/booking', {
    data: {
      firstname: 'DeleteMe',
      lastname: 'Test',
      totalprice: 123,
      depositpaid: true,
      bookingdates: { checkin: '2025-10-01', checkout: '2025-10-05' },
      additionalneeds: 'None',
    },
    headers: { 'Content-Type': 'application/json' },
  });
  expect(createResponse.status()).toBe(200);
  const { bookingid } = await createResponse.json();
  expect(bookingid).toBeDefined();

  // Authenticate to get a token
  const authResponse = await request.post('https://restful-booker.herokuapp.com/auth', {
    data: { username: 'admin', password: 'password123' },
    headers: { 'Content-Type': 'application/json' },
  });
  expect(authResponse.status()).toBe(200);
  const { token } = await authResponse.json();

  // Delete the booking
  const deleteResponse = await request.delete(`https://restful-booker.herokuapp.com/booking/${bookingid}`, {
    headers: {
      Cookie: `token=${token}`,
    },
  });
  console.log('DELETE response status:', deleteResponse.status());
  expect(deleteResponse.status()).toBe(201);
});
test('PATCH update some fields of a booking', async ({ request }) => {
  // First, get a booking ID
  const getResponse = await request.get('https://restful-booker.herokuapp.com/booking');
  expect(getResponse.status()).toBe(200);
  const bookings = await getResponse.json();
  if (!bookings.length || !bookings[0].bookingid) {
    console.warn('No bookings available to update.');
    return;
  }
  const bookingId = bookings[0].bookingid;

  // Prepare PATCH request
  const patchBody = {
    firstname: 'James',
    lastname: 'Brown',
  };

  // The API requires a token for auth. We'll use default credentials to get a token.
  const authResponse = await request.post('https://restful-booker.herokuapp.com/auth', {
    data: { username: 'admin', password: 'password123' },
    headers: { 'Content-Type': 'application/json' },
  });
  expect(authResponse.status()).toBe(200);
  const { token } = await authResponse.json();

  // Send PATCH request
  const patchResponse = await request.patch(
    `https://restful-booker.herokuapp.com/booking/${bookingId}`,
    {
      data: patchBody,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Cookie: `token=${token}`,
      },
    }
  );
  console.log('PATCH response:', await patchResponse.json());
  expect(patchResponse.status()).toBe(200);
  const updated = await patchResponse.json();
  expect(updated.firstname).toBe('James');
  expect(updated.lastname).toBe('Brown');
});
test('GET all booking IDs', async ({ request }) => {
  const response = await request.get('https://restful-booker.herokuapp.com/booking');
  expect(response.status()).toBe(200);
  const bookings = await response.json();
  console.log('All Booking IDs:', bookings);
  expect(Array.isArray(bookings)).toBe(true);
  if (bookings.length > 0) {
    expect(bookings[0]).toHaveProperty('bookingid');
  }
});

test('GET booking IDs with filters', async ({ request }) => {
  // Example filter: firstname=Jim
  const params = new URLSearchParams({ firstname: 'Jim' });
  const response = await request.get(`https://restful-booker.herokuapp.com/booking?${params.toString()}`);
  expect(response.status()).toBe(200);
  const bookings = await response.json();
  console.log('Filtered Booking IDs (firstname=Jim):', bookings);
  expect(Array.isArray(bookings)).toBe(true);
});
import { test, expect } from '@playwright/test';

// API test for restful-booker.herokuapp.com/booking

test('GET request to /booking', async ({ request }) => {
  const response = await request.get('https://restful-booker.herokuapp.com/booking');
  console.log('Status:', response.status());
  console.log('Headers:', response.headers());
  const bookings = await response.json();
  console.log('Body:', bookings);
  expect(response.status()).toBe(200);
  expect(Array.isArray(bookings)).toBe(true);

  // Fetch full details of the first booking by ID
  if (bookings.length > 0 && bookings[0].bookingid) {
    const bookingId = bookings[0].bookingid;
    const detailsResponse = await request.get(`https://restful-booker.herokuapp.com/booking/${bookingId}`);
    console.log(`Details for booking ID ${bookingId}:`, await detailsResponse.json());
    expect(detailsResponse.status()).toBe(200);
    expect(detailsResponse.headers()['content-type']).toContain('application/json');
    // Optionally, check for some expected fields
    const details = await detailsResponse.json();
    expect(details).toHaveProperty('firstname');
    expect(details).toHaveProperty('lastname');
  } else {
    console.warn('No bookings found to fetch details.');
  }
});
