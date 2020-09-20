const { Schema, model } = require('mongoose');

const sessionsSchema = new Schema({
    userId: String,
    tokenSession: String,
    tokenDateExpiry: String
});

module.exports = model('Sessions', sessionsSchema)