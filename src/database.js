const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://BrianGg:9WpPXdJh5NdFBlca@cluster0.jgbw0.mongodb.net/<dbname>?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(db => console.log('Conectado a la base de datos'));