const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/MarzhalID', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(db => console.log('Conectado a la base de datos'));