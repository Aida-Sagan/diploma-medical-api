const { expect, test } = require("@playwright/test");
const { request } = require("express");

const createAppointment = async (request, data) => {
    return await request.post('/api/appointments', {data});
}

test('создание приема пациента с ID 1', async ({request}) => {
    const response = await createAppointment(request, {
        patientId: 1,
        date: '2025-06-05',
        reason: 'Головная боль, мигрень'
    });
    expect(response.status()).toBe(201);
})

test('прием с несуществующим ID', async ({request}) => {
    const response = await createAppointment(request, {
        patientId: 9999,
        date: '2025-06-14',
        reason: 'Головная боль, мигрень'
    })
    expect(response.status()).toBeGreaterThanOrEqual(400);

})