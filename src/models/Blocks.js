const { Schema, model } = require('mongoose');

const blocksSchema = new Schema({
    time: Number,
    idDevice: String
});

module.exports = model('Blocks', blocksSchema)