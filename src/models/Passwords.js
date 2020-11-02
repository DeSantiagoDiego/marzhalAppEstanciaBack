const { Schema, model } = require('mongoose');

const passwordsSchema = new Schema({
    userId: String,
    namePassword: String,
    password: String
});

module.exports = model('Passwords', passwordsSchema);