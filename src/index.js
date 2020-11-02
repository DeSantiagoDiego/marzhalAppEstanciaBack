const app = require('./app');
require('./database');
//aqui
async function init() {
    var port = process.env.PORT || 3000;
    await app.listen(port);
    console.log('Server on port ' + port);
    //console.log(hostname);
}

init();