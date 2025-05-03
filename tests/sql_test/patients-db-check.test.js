const { open } = require('sqlite');
const sqlite3 = require('sqlite3'); 
const path = require('path');
const { expect, test } = require('@playwright/test');

test('в базе данных есть как минимум 3 пациента', async () => {
    const db = await open({
        filename: path.resolve(__dirname, '../../db/database.sqlite'),
        driver: sqlite3.Database
    });

    const rows = await db.all('SELECT * FROM patients');
    expect(rows.length).toBeGreaterThanOrEqual(3); 
});
