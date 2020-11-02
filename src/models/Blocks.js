const { Schema, model } = require('mongoose');

const blocksSchema = new Schema({
    time: Number
});

module.exports = model('Blocks', blocksSchema)