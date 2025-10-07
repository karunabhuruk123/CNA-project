import { test, expect } from '@playwright/test';
import * as XLSX from 'xlsx';
import fs from 'fs';

// Helper to write data to Excel
function writeToExcel(filename: string, sheetName: string, data: any[]) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}

test('Export all booking IDs to Excel', async ({ request }) => {
  const response = await request.get('https://restful-booker.herokuapp.com/booking');
  expect(response.status()).toBe(200);
  const bookings = await response.json();

  // Fetch full details for each booking (limit to 20 for demo/performance)
  const details = [];
  for (let i = 0; i < Math.min(bookings.length, 20); i++) {
    const id = bookings[i].bookingid;
    const detailResp = await request.get(`https://restful-booker.herokuapp.com/booking/${id}`);
    if (detailResp.status() === 200) {
      const detail = await detailResp.json();
      if (detail.bookingdates && detail.bookingdates.checkin === '2013-02-23') {
        details.push({ firstname: detail.firstname, lastname: detail.lastname });
      }
    }
  }

  // Write to Excel with columns: firstname, lastname, only for checkin '2013-02-23'
  writeToExcel('booking-names-2013-02-23.xlsx', 'BookingNames', details);
  // Check file exists
  expect(fs.existsSync('booking-names-2013-02-23.xlsx')).toBe(true);
});
