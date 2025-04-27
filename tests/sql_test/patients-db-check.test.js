const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const {test, expect} = require('@playwright/test');

test('в базе данных есть как минимум 3 пациента', async () => {
    const db = await open({
        filename: path.resolve(__dirname, '../../db/database.sqlite'),
        driver: sqlite3.Database
      });
     const rows = await db.all('SELECT * FROM patients');
     expect(rows.length).toBeGreaterThanOrEqual(3);
})