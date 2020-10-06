const { Router } = require('express');
const router = Router();

var nodemailer = require("nodemailer");
const User = require('../models/User');
const Sessions = require('../models/Sessions');
const verifyToken = require('./verifyToken')

const jwt = require('jsonwebtoken');
const config = require('../config');
const app = require('../app');

router.get('/', function(req, res) {
    res.json('Bienvenido');
});

var smtpTransport = nodemailer.createTransport({
    port: 587,
    service: "Gmail",
    auth: {
        user: "marzhalid@gmail.com",
        pass: "agropecuario28"
    }
});

var rand, mailOptions, host, link, emailUser

/*----------------------------Routing---------------*/
/*
router.get('/send', function(req, res) {
    rand = Math.floor((Math.random() * 100) + 54);
    host = req.get('host');
    link = "http://" + req.get('host') + "/api/auth/verify?id=" + rand;
    mailOptions = {
        to: emailUser,
        subject: "Por favor confirma tu cuenta",
        html: "Hola,<br> Por favor haz click en el link para verificar tu cuenta.<br><a href=" + link + ">Click para verificar</a>"
    }
    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function(error, response) {
        if (error) {
            console.log(error);
            res.end("error");
        } else {
            console.log("Mensaje enviado: " + response.message);
            res.end("enviado");
        }
    });
});
*/
//Funcion para enviar correo de verificacion una vez registrada la cuenta
function sendEmail(req, res) {
    rand = Math.floor((Math.random() * 100) + 54);
    host = "localhost:3000";
    link = "http://" + host + "/api/auth/verify?id=" + rand;
    console.log(link);
    mailOptions = {
        to: emailUser,
        subject: "Por favor confirma tu cuenta",
        html: "Hola,<br> Por favor haz click en el link para verificar tu cuenta.<br><a href=" + link + ">Click para verificar</a>"
    }
    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function(error, response) {
        if (error) {
            console.log(error);
            res.end("error");
        } else {
            console.log("Mensaje enviado: " + response.message);
            res.end("enviado");
        }
    });
};
//Peticion para enviar correo de cambio de contraseña
router.post('/sendChangePass', function(req, res) {
    const { to } = req.body;
    rand = Math.floor((Math.random() * 100) + 54);
    host = "localhost:3000";
    link = "http://" + host + "/api/auth/changePassword?id=" + rand;
    mailOptions = {
        to: to,
        subject: "Recuperar contraseña",
        html: "Hola,<br> Por favor haz click en el link para asignar nueva contraseña.<br><a href=" + link + ">Click para verificar</a>"
    }
    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function(error, response) {
        if (error) {
            console.log(error);
            res.status(500).send('error');
        } else {
            console.log("Mensaje enviado: " + response.message);
            //res.end("Enviado");
            return res.status(200).json({ message: 'Registro existoso, se ha enviado un correo a tu direccion para continuar con la verificacion', number: 1 });
        }
    });
});
//Peticion para verificar por correo la verificacion de la cuenta
router.get('/verify', function(req, res) {
    console.log(req.protocol + ":/" + req.get('host'));
    if ((req.protocol + "://" + req.get('host')) == ("http://" + host)) {
        console.log("Domain is matched. Information is from Authentic email");
        if (req.query.id == rand) {
            console.log(req.query.id);
            console.log("email verificado");
            verifyCompleted(req, res);
            res.end("<h1>Email " + mailOptions.to + " ha sido activado exitosamente");

        } else {
            console.log("El correo aun no se ha verificado");

            res.end("<h1>error</h1>");
        }
    } else {
        res.end("<h1>peticion desconocida");
    }
});
//Peticion para verificar por correo la autorizacion de cambio de contraseña
router.get('/changePassword', function(req, res) {
    console.log(req.protocol + ":/" + req.get('host'));
    if ((req.protocol + "://" + req.get('host')) == ("http://" + host)) {
        console.log("Domain is matched. Information is from Authentic email");
        if (req.query.id == rand) {
            console.log(req.query.id);
            console.log("Contrasena renovada");
            newPasswordChanged(req, res);
            res.end("<h1>Autorizacion de cambio de contraseña para " + mailOptions.to + " aprobada");

        } else {
            console.log("Autorizacion no concedida");

            res.end("<h1>error</h1>");
        }
    } else {
        res.end("<h1>peticion desconocida");
    }
});
//Funcion para aprobar la cuenta como verificada
function verifyCompleted(req, res) {
    User.findOne({ email: mailOptions.to }).exec((error, exists) => {
        if (!error) {
            exists.isVerified = true;
            exists.save();
        } else {
            res.status(500).json(error);
        }
    });
}
//Funcion para autorizar el cambio de contraseña
async function newPasswordChanged(req, res) {
    const user = await User.findOne({ email: mailOptions.to })
    if (!user) {
        return res.status(404).send("El email no existe en la base de datos.")
    }
    user.changePassword = true;
    //user.Changeassword = await user.encryptPassword(password)
    //$2a$10$jsB6sInE55HM9BZDriUVqe1/M1jJAuIKmfwvtYC3q9bvN2tCMgPlG
    await user.save();
}

/*--------------END

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
//Funcion agregar usuario
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
        emailUser = email;
        sendEmail(req, res);
        return res.status(200).json({ message: 'Registro exitoso, se ha enviado un correo a tu direccion de correo electrónico para continuar con la verificacion', number: 1 });
        /*
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
        */
    } catch (e) {
        console.log(e)
        res.json('Hubo un problema al registrar el usuario.');
    }
};
//Peticion para verificar el registro de usuario
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
                res.json({ message: 'Correo ocupado, ingrese otro e intentelo denuevo.' });
                console.log('Ocupado');
            }
        } else {
            res.json({ message: 'Correo ocupado, ingrese otro e intentelo denuevo.' });
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

//Peticion para iniciar sesion
router.post('/login', async(req, res) => {
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return res.json("El email no existe en la base de datos.")
    }
    const validPassword = await user.comparePassword(req.body.password, user.password);
    if (!validPassword) {
        //return res.status(401).send({ auth: false, token: null });
        return res.json("Contraseña incorrecta");
    }
    const token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 86400
            //expiresIn: 86400
    });
    var expirationDate = new Date();
    var exp = expirationDate;
    console.log('Tiempo antes: ' + expirationDate);
    console.log('Tiempo antes: ' + expirationDate.getTime());
    var dateToday = expirationDate.getTime();
    exp.setSeconds(exp.getSeconds() + 86400);
    console.log('Tiempo ahora: ' + exp);
    var dateExpiry = exp.getTime();
    console.log('Tiempo ahora: ' + exp.getTime());
    //* Creamos una nueva sesion
    const session = new Sessions({
        userId: user._id,
        tokenSession: token,
        tokenDateExpiry: dateExpiry
    });
    //Hola martin x2
    await session.save();
    //res.status(200).json({ auth });
    console.log(token);
    res.status(200).json({ auth: true, token, number: 1, account: user.isVerified });

});
//Peticion para cerrar sesion
router.get('/logout', function(req, res) {
    res.status(200).send({ auth: false, token: null });
});

//Peticion para traer sesion actual
router.post('/session', function(req, res) {
    const { sessionVerify } = req.body;
    console.log(sessionVerify);
    verifyToken2(sessionVerify, res);
});

//Funcion para verificar sesion actual
async function verifyToken2(req, res, next) {
    console.log(req);
    const token = req;
    if (!token) {
        return res.json({ auth: false, message: 'No token provided' });
    } else {
        //Verifica si el toquen existente está en la BBD
        const tokenExpiry = await Sessions.findOne({ tokenSession: token });
        if (!tokenExpiry) {
            return res.json({ auth: false, message: 'No token provided' });
        } else {
            var dateToday = new Date().getTime();
            if (parseInt(tokenExpiry.tokenDateExpiry) > parseInt(dateToday)) {
                console.log('Token Valido');
                return res.json({ auth: true, message: 'Session Aceptada', number: 1 });
            } else {
                console.log('Token expirado');
                await tokenExpiry.delete();
                return res.json({ auth: false, message: 'Session Expirada' });
            }
        }
    }
    // console.log(token);
    // Tokenreq.userId = decoded.id;
    const decoded = await jwt.verify(token, config.secret);
    req.userId = decoded.id;
    next();
}
//Peticion para cambiar contraseña
router.post('/verifyChangePassword', async(req, res) => {
    const user = await User.findOne({ email: req.body.email })
    const password = req.body.password;
    if (!user) {
        return res.json({ message: "El email no existe en la base de datos." })
    }
    if (user.changePassword == true) {
        user.password = await user.encryptPassword(password)
        user.changePassword = false;
        await user.save();
        return res.json({ message: "Contraseña cambiada con exito", number: 1 })
    }
    return res.json({ message: 'Autorizacion no asignada, verifique su correo electronico y vuela a intentarlo' })
});

router.post('/deleteToken', async(req, res) => {
    const { tokenSession } = req.body;
    //Verifica si el toquen existente está en la BBD
    const tokenExpiry = await Sessions.findOne({ tokenSession: tokenSession });
    if (!tokenExpiry) {
        return res.json({ auth: false, message: 'No token provided' });
    } else {
        console.log('Token expirado');
        await tokenExpiry.delete();
        return res.json({ auth: false, message: 'Session Expirada' });
    }
});
module.exports = router;