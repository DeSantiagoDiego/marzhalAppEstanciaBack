const jwt = require('jsonwebtoken');
const config = require('../config');
const Sessions = require('../models/Sessions');

async function verifyToken(req, res, next) {
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(401).send({ auth: false, message: 'No token provided' });
    } else {
        //Verifica si el toquen existente está en la BBD
        const tokenExpiry = await Sessions.findOne({ tokenSession: token });
        if (!tokenExpiry) {
            return res.status(401).send({ auth: false, message: 'No token provided' });
        } else {
            var dateToday = new Date().getTime();
            if (parseInt(tokenExpiry.tokenDateExpiry) > parseInt(dateToday)) {
                console.log('Token Valido');
            } else {
                console.log('Token expirado');
                await tokenExpiry.delete();
                return res.status(402).send({ auth: false, message: 'Token expirado' });
            }
        }
    }
    // console.log(token);
    // Tokenreq.userId = decoded.id;
    const decoded = await jwt.verify(token, config.secret);
    req.userId = decoded.id;
    next();
}



module.exports = verifyToken;