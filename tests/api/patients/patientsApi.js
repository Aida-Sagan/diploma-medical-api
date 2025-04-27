const { request } = require("express");

exports.createPatient = async (request, data) => {
   return await request.post('/api/patients', {data})
}