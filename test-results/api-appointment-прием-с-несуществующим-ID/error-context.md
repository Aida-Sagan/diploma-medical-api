# Test info

- Name: прием с несуществующим ID
- Location: /home/idoc/QA projects/diploma-medical-api/tests/api/appointment.test.js:17:1

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 400
Received:    201
    at /home/idoc/QA projects/diploma-medical-api/tests/api/appointment.test.js:23:31
```

# Test source

```ts
   1 | const { expect, test } = require("@playwright/test");
   2 | const { request } = require("express");
   3 |
   4 | const createAppointment = async (request, data) => {
   5 |     return await request.post('/api/appointments', {data});
   6 | }
   7 |
   8 | test('создание приема пациента с ID 1', async ({request}) => {
   9 |     const response = await createAppointment(request, {
  10 |         patientId: 1,
  11 |         date: '2025-06-05',
  12 |         reason: 'Головная боль, мигрень'
  13 |     });
  14 |     expect(response.status()).toBe(201);
  15 | })
  16 |
  17 | test('прием с несуществующим ID', async ({request}) => {
  18 |     const response = await createAppointment(request, {
  19 |         patientId: 0,
  20 |         date: '2025-06-14',
  21 |         reason: 'Головная боль, мигрень'
  22 |     })
> 23 |     expect(response.status()).toBeGreaterThanOrEqual(400);
     |                               ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
  24 |
  25 | })
```