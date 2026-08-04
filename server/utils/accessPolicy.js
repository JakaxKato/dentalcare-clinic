const Appointment = require('../models/Appointment');

const dentistHasPatientRelation = async (dentistId, patientId) =>
  Boolean(await Appointment.exists({ dentistId, patientId }));

module.exports = { dentistHasPatientRelation };
