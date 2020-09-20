const { Router } = require('express');
const router = Router();

const User = require('../models/User');
const Sessions = require('../models/Sessions');
const verifyToken = require('./verifyToken')

const jwt = require('jsonwebtoken');
const config = require('../config');
/*
router.post('/signup', async(req, res) => {
    try {
        //* Recibimos datos
        const { username, email, password } = req.body;
        //* Creamos un nuevo usuario
        const user = new User({
            username,
            email,
            password
        });
        user.password = await user.encryptPassword(password);
        await user.save();
        //* Se crea el token 
        const token = jwt.sign({ id: user.id }, config.secret, {
            expiresIn: 60 * 60 * 24 //* Expira en este caso en 24 horas asies
        });

        res.json({ auth: true, token });

    } catch (e) {
        console.log(e)
        res.status(500).send('Hubo un problema al registrar el usuario.');
    }
});

*/

async function signup(req, res) {
    try {
        //* Recibimos datos
        const { username, email, password } = req;
        //* Creamos un nuevo usuario
        const user = new User({
            username,
            email,
            password
        });
        user.password = await user.encryptPassword(password);
        await user.save();
        //* Se crea el token 
        const token = jwt.sign({ id: user.id }, config.secret, {
            expiresIn: 25 //* Expira en este caso en 24 horas asies
        });
        // Se toma la fecha actual
        var expirationDate = new Date();
        var exp = expirationDate;
        console.log('Tiempo antes: ' + expirationDate);
        console.log('Tiempo antes: ' + expirationDate.getTime());
        var dateToday = expirationDate.getTime();
        // Se le suma la duracion del token
        exp.setSeconds(exp.getSeconds() + 25);
        console.log('Tiempo ahora: ' + exp);
        var dateExpiry = exp.getTime();
        console.log('Tiempo ahora: ' + exp.getTime());
        // Creamos una nueva sesion(id de usuario, token y fecha de expiracion)
        const session = new Sessions({
            userId: user._id,
            tokenSession: token,
            tokenDateExpiry: dateExpiry
        });
        await session.save();
        res.json({ auth: true, token });
    } catch (e) {
        console.log(e)
        res.status(500).send('Hubo un problema al registrar el usuario.');
    }
};

router.post('/prueba', async(req, res) => {
    //* Recibimos datos
    const { username, email, password } = req.body;
    //* Creamos un nuevo usuario
    const user = new User({
        username,
        email,
        password
    });
    User.findOne({ email: email }).exec((error, exists) => {
        if (!error) {
            if (exists == null) {
                signup(user, res);
            } else {
                res.status(500).send('Correo ocupado, ingrese otro e intentelo denuevo.');
            }
        } else {
            res.status(500).json(error);
        }
    });
});
router.get('/me', verifyToken, async(req, res) => {
    //* res.status(200).send(decoded);
    //* Busca informacion por ID
    //* const user = await User.findById(decoded.id, { password: 0});
    const user = await User.findById(req.userId, { password: 0 });
    if (!user) {
        return res.status(404).send("No se encontro el usuario.");
    }
    res.status(200).json(user);
});

router.post('/signin', async(req, res) => {
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return res.status(404).send("El email no existe en la base de datos.")
    }
    const validPassword = await user.comparePassword(req.body.password, user.password);
    if (!validPassword) {
        return res.status(401).send({ auth: false, token: null });
    }
    const token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 25
    });
    var expirationDate = new Date();
    var exp = expirationDate;
    console.log('Tiempo antes: ' + expirationDate);
    console.log('Tiempo antes: ' + expirationDate.getTime());
    var dateToday = expirationDate.getTime();
    exp.setSeconds(exp.getSeconds() + 25);
    console.log('Tiempo ahora: ' + exp);
    var dateExpiry = exp.getTime();
    console.log('Tiempo ahora: ' + exp.getTime());
    //* Creamos una nueva sesion
    const session = new Sessions({
        userId: user._id,
        tokenSession: token,
        tokenDateExpiry: dateExpiry
    });
    await session.save();
    res.status(200).json({ auth: true, token });

});

router.get('/logout', function(req, res) {
    res.status(200).send({ auth: false, token: null });
});

module.exports = router;