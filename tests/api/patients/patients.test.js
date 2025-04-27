const {test, expect} = require('@playwright/test');
const {createPatient} = require('./patientsApi');
const { request } = require('express');


const patients = [
    {fullName: 'Amina Star', birthDate: '2000-03-20', gender: 'жен'},
    {fullName: 'David Bekh', birthDate: '1990-01-20', gender: 'муж'},
    {fullName: 'Martin Tom', birthDate: '1990-01-20', gender: 'муж'},
    {fullName: 'April', birthDate: '1995-01-20', gender: 'жен'}
]

patients.forEach((patient, index) => {
    test(`создание пациента ${index + 1}: ${patient.fullName}`, async ({request}) => {
        const response = await createPatient(request, patient);
        expect(response.status()).toBe(201);
        const data = await response.json();
        expect(data).toHaveProperty('id');
    })
})

test('неудачное создание пациента без имени', async ({request}) => {
    const response = await createPatient(request, {
         birthDate: '2000-03-20', 
         gender: 'жен'
    });
    expect(response.status()).toBeGreaterThan(400);
})