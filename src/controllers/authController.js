const { Router } = require('express');
const router = Router();
const ses = require('./ses.js');
const { uuid } = require('uuidv4');

var nodemailer = require("nodemailer");
const User = require('../models/User');
const Sessions = require('../models/Sessions');
const Blocks = require('../models/Blocks');
const Passwords = require('../models/Passwords');
const verifyToken = require('./verifyToken');

const jwt = require('jsonwebtoken');
const config = require('../config');
const app = require('../app');


//const imagen = require('../img/D3');
router.get('/', function(req, res) {
    //var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    //res.json('Bienvenido : ' +fullUrl);
    //console.log(uuid());
    //res.json('Bienvenido: ' + uuid());
    res.send(__dirname);
    res.end("<body><img src='../D3.SVG'  alt='' style='padding-top: 25%; padding-bottom: 2%; display: block; margin-left: auto; margin-right: auto;'></body>");
});

// var smtpTransport = nodemailer.createTransport({
//     port: 587,
//     service: "Gmail",
//     auth: {
//         user: "marzhalid@gmail.com",
//         pass: "agropecuario28"
//     }
// });

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
async function sendEmail(req, res) {
    //rand = Math.floor((Math.random() * 100) + 54);
    //host = "localhost:3000";
    const user = await User.findOne({ email: emailUser })
    if (!user) {
        //El email no existe en la base de datos
        return res.end("<h1>error</h1>");
    }
    console.log("Esto deberia funcionar: " + host);
    link = "http://" + host + "/api/auth/verify?id=" + user._id;
    // console.log(link);
    mailOptions = {
            to: emailUser,
            subject: "Por favor confirma tu cuenta",
            html: "Hola,<br> Por favor haz click en el link para verificar tu cuenta.<br><a href=" + link + ">Click para verificar</a>"
        }
        // console.log(mailOptions);
    ses.sendEmail(mailOptions.to, "Por favor confirma tu cuenta", "Hola,<br> Por favor haz click en el link para verificar tu cuenta.<br><a href=" + link + ">Click para verificar</a> <br>Por su seguridad,<strong>elimine</strong> este correo una vez utilizado el link.").then(data => {
        // console.log("Mensaje enviado: " + response.message);
        //res.end("enviado");
        return res.status(200).json({ message: 'Registro exitoso, se ha enviado un email a tu direccion de correo electrónico para continuar con la verificacion', number: 1 });
    }).catch((err) => {
        console.log(err);
        registerError(req, res);
        return res.json({ message: "Hubo un problema al momento de enviar el correo de verificacion, intentelo denuevo." });
    });
    // smtpTransport.sendMail(mailOptions, function(error, response) {
    //     if (error) {
    //         registerError(req, res);
    //         return res.json({ message: "Hubo un problema al momento de enviar el correo de verificacion, intentelo denuevo." });
    //     } else {
    //         console.log("Mensaje enviado: " + response.message);
    //         //res.end("enviado");
    //         return res.status(200).json({ message: 'Registro exitoso, se ha enviado un correo a tu direccion de correo electrónico para continuar con la verificacion', number: 1 });
    //     }
    // });
};

async function registerError(req, res) {
    const user = await User.findOne({ email: emailUser })
    if (user) {
        await user.delete();
        console.log(emailUser + " eliminado.");
    }
}
//Peticion para enviar correo de cambio de contraseña
router.post('/sendChangePass', async(req, res) => {
    const user = await User.findOne({ email: req.body.to })
    if (!user) {
        //El email no existe en la base de datos
        return res.json({ message: 'Se ha enviado un correo a <strong> ' + req.body.to + '</strong>, verifiquelo para confirmar el cambio de contraseña', number: 2 })
    }
    const { to } = req.body;
    host = req.body.hostSend;
    console.log("Esto deberia funcionar: " + host);
    //rand = Math.floor((Math.random() * 100) + 54);
    //host = "localhost:3000";
    link = "http://" + host + "/api/auth/changePassword?id=" + user.changeRad;
    mailOptions = {
        to: to,
        subject: "Recuperar contraseña",
        html: "Hola,<br> Por favor haz click en el link para asignar nueva contraseña.<br><a href=" + link + ">Click para verificar</a>"
    }
    console.log(mailOptions);
    ses.sendEmail(to, "Recuperar contraseña", "Hola,<br> Por favor haz click en el link para asignar nueva contraseña.<br><a href=" + link + ">Click para verificar</a> <br>Por su seguridad,<strong>elimine</strong> este correo una vez utilizado el link.").then(data => {
        console.log("Mensaje enviado");
        //res.end("Enviado");
        return res.status(200).json({ message: 'Se ha enviado un email a <strong> ' + to + '</strong>, verifiquelo para confirmar el cambio de contraseña', number: 1 });
    }).catch((err) => {
        console.log(err);
        return res.json({ message: 'Hubo un problema al enviar el correo, intentelo de nuevo', number: 3 });
    });
    // smtpTransport.sendMail(mailOptions, function(error, response) {
    //     if (error) {
    //         console.log(error);
    //         return res.json({ message: 'Hubo un problema al enviar el correo, intentelo de nuevo', number: 3 });
    //     } else {
    //         console.log("Mensaje enviado: " + response.message);
    //         //res.end("Enviado");
    //         return res.status(200).json({ message: 'Se ha enviado un correo a <strong> ' + to + '</strong>, verifiquelo para confirmar el cambio de contraseña', number: 1 });
    //     }
    // });
});
//Peticion para verificar por correo la verificacion de la cuenta
router.get('/verify', async(req, res) => {
    console.log(req.protocol + ":/" + req.get('host'));
    if ((req.protocol + "://" + req.get('host')) == ("http://" + host)) {
        console.log("Domain is matched. Information is from Authentic email");
        const user = await User.findOne({ _id: req.query.id })
        if (!user) {
            //El email no existe en la base de datos
            console.log(req.query.id);
            console.log("El correo aun no se ha verificado");
            return res.end("<h1>error</h1>");
        } else {
            verifyCompleted(user, res)
                //res.end("<h1 style='color: red;' >Email " + user.email + " ha sido activado exitosamente. <br>Por su seguridad, elimine el correo recibido una vez utilizado este link.");
            res.end("<body style='background: black;'><div style='padding-top: 25%;'><h1 style='color: white; text-align: center;'>Email " + user.email + " ha sido activado exitosamente. <br></h1><h1 style='color: orange;text-align: center';>Por su seguridad, elimine el correo recibido una vez utilizado este link.</h1></div></body>");
        }
        /*
        if (req.query.id == rand) {
            console.log(req.query.id);
            console.log("email verificado");
            verifyCompleted(req, res);
            res.end("<h1>Email " + mailOptions.to + " ha sido activado exitosamente");

        } else {
            console.log("El correo aun no se ha verificado");

            res.end("<h1>error</h1>");
        }*/
    } else {
        res.end("<h1>peticion desconocida");
    }
});
//Peticion para verificar por correo la autorizacion de cambio de contraseña
router.get('/changePassword', async(req, res) => {
    console.log(req.protocol + ":/" + req.get('host'));
    if ((req.protocol + "://" + req.get('host')) == ("http://" + host)) {
        console.log("Domain is matched. Information is from Authentic email");
        const user = await User.findOne({ changeRad: req.query.id })
        if (!user) {
            //El changedRad no existe en la base de datos
            console.log("Autorizacion no concedida");
            res.end("<h1>error</h1>");
        } else {
            console.log(req.query.id);
            console.log("Contrasena renovada");
            newPasswordChanged(user, res);
            //res.end("<h1>Autorizacion de cambio de contraseña para " + user.email + " aprobada. <br>Por su seguridad, elimine el correo recibido una vez utilizado este link.");
            res.end("<body style='background: black;'><div style='padding-top: 25%;'><img src='.../D3.SVG'  alt='' style='padding-top: 25%; padding-bottom: 2%; display: block; margin-left: auto; margin-right: auto;'><img src='./marzhalId2.svg' alt='' style='padding-bottom: 5%; display: block; margin-left: auto; margin-right: auto;'><h1 style='color: white; text-align: center;'>Autorizacion de cambio de contraseña para " + user.email + " aprobada. <br></h1><h1 style='color: orange;text-align: center';>Por su seguridad, elimine el correo recibido una vez utilizado este link.</h1></div></body>");
        }
        /*
        if (req.query.id == rand) {
            console.log(req.query.id);
            console.log("Contrasena renovada");
            newPasswordChanged(req, res);
            res.end("<h1>Autorizacion de cambio de contraseña para " + mailOptions.to + " aprobada. <br>Por su seguridad, elimine el correo recibido una vez usado este link.");

        } else {
            console.log("Autorizacion no concedida");

            res.end("<h1>error</h1>");
        }*/
    } else {
        res.end("<h1>peticion desconocida");
    }
});
//Funcion para aprobar la cuenta como verificada
function verifyCompleted(req, res) {
    //console.log(req);
    User.findOne({ email: req.email }).exec((error, exists) => {
        if (!error) {
            exists.isVerified = true;
            exists.save();
        } else {
            res.json(error);
        }
    });
}
//Funcion para autorizar el cambio de contraseña
async function newPasswordChanged(req, res) {
    const user = await User.findOne({ email: req.email })
    if (!user) {
        return res.status(404).send("El email no existe en la base de datos.")
    }
    user.changePassword = true;
    user.changeRad = null;
    var foundUID = false;
    var uidEmailUser;
    do {
        uidEmailUser = uuid();
        const userUID = await User.findOne({ changeRad: uidEmailUser })
        if (!userUID) {
            foundUID = true;
        } else {
            foundUID = false;
        }
    } while (foundUID != true);
    user.changeRad = uidEmailUser;
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
        //*Asignamos una 
        var foundUID = false;
        var uidEmailUser;
        do {
            uidEmailUser = uuid();
            const userUID = await User.findOne({ changeRad: uidEmailUser })
            if (!userUID) {
                foundUID = true;
            } else {
                foundUID = false;
            }
        } while (foundUID != true);
        //* Creamos un nuevo usuario
        const user = new User({
            username,
            email,
            password,
            changeRad: uidEmailUser
        });
        user.password = await user.encryptPassword(password);
        await user.save();
        emailUser = email;
        sendEmail(req, res);
        //console.log('nel');
        //return res.status(200).json({ message: 'Registro exitoso, se ha enviado un correo a tu direccion de correo electrónico para continuar con la verificacion', number: 1 });
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
    const { username, email, password, hostSend } = req.body;
    //* Creamos un nuevo usuario
    const user = new User({
        username,
        email,
        password
    });
    User.findOne({ email: email }).exec((error, exists) => {
        if (!error) {
            if (exists == null) {
                console.log(hostSend);
                host = hostSend;
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
    if (user.isVerified == false) {
        return res.json("Esta cuenta no está verificada")
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
        //El email no existe en la base de datos
        return res.json({ message: "Autorizacion no asignada, verifique su correo electronico y vuelva a intentarlo.", number: 2 })
    }
    if (user.changePassword == true) {
        user.password = await user.encryptPassword(password)
        user.changePassword = false;
        await user.save();
        return res.json({ message: "Contraseña cambiada con exito", number: 1 })
    }
    return res.json({ message: 'Autorizacion no asignada, verifique su correo electronico y vuelva a intentarlo.' })
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

//Peticion para enviar correo de alerta a usuario de posible intruso
router.post('/userTryFailed', async(req, res) => {
    const user = await User.findOne({ email: req.body.to })
    if (!user) {
        return res.json({ message: "El email no existe en la base de datos." })
    }
    console.log(req.body.to);
    mailOptions = {
        to: user.email,
        subject: "Alerta de cuenta",
        html: "Hola,<br> Alguien ha intendo ingresar a tu cuenta numerosas veces, te recomendamos verificarlo y cambiar la contraseña<br>"
    }
    console.log(mailOptions);
    ses.sendEmail(user.email, "Alerta de cuenta", "Hola,<br> Alguien ha intendo ingresar a tu cuenta numerosas veces, te recomendamos verificarlo y cambiar la contraseña<br>").then(data => {
        console.log("Mensaje enviado");
        //res.end("Enviado");
        return res.status(200).json({ message: 'Alerta enviada' });
    }).catch((error) => {
        console.log(error);
        return res.json('error');
    });

    /*smtpTransport.sendMail(mailOptions, function(error, response) {
        if (error) {
            console.log(error);
            res.status(500).send('error');
        } else {
            console.log("Mensaje enviado");
            //res.end("Enviado");
            return res.status(200).json({ message: 'Alerta enviada' });
        }
    });*/
});

//Peticion de prueba para ver los bloqueos
router.post('/block', async(req, res) => {
    Blocks.find().exec((error, blocks) => {
        if (!error) {
            res.status(200).json(blocks);
        } else {
            res.status(500).json(error);
        }
    });
});

//Peticion para verificar si el login está bloqueado
router.post('/checkLogin', async(req, res) => {
    const block = await Blocks.findOne({ idDevice: req.body.idDevice })
    if (!block) {
        //Login No Bloqueado
        res.json({ number: 1 });
    } else {
        if (block.time === null || block.time <= 0) {
            //Login Ya Desbloqueado
            res.json({ number: 1 });
        } else {
            //Login Ya Bloqueado
            res.json({ number: 2, time: block.time, idAccess: block.idDevice });
        }
    }
    /*
    Blocks.find().exec((error, blocks) => {
        if (!error) {
            if (blocks.length === 1 & blocks[0].time === null) {
                //Login No Bloqueado
                res.json({ number: 1 });
            } else {
                res.json({ number: 2, time: blocks[0].time });
            }
            //res.status(200).json(blocks);
        } else {
            res.status(500).json(error);
        }
    });
    */
});

//Peticion para bloquear el login
router.post('/blockLogin', async(req, res) => {
    const block = await Blocks.findOne({ idDevice: req.body.idDevice })
    if (!block) {
        const block = new Blocks({
            time: req.body.time,
            idDevice: req.body.idDevice
        });
        block.save();
        res.json(block.time);
    } else {
        block.time = req.body.time
        block.idDevice = req.body.idDevice
        block.save();
        res.json(block)
    }
    /*
    Blocks.find().exec((error, blocks) => {
        if (!error) {
            //console.log(blocks.length);
            if (blocks.length == 0) {
                const block = new Blocks({
                    time: req.body.time
                });
                block.save();
                res.json(block.time);
            } else {
                blocks[0].time = req.body.time
                res.json(blocks[0])
                blocks[0].save();
            }
        } else {
            res.status(500).json(error);
        }
    });
    /*const block = new Blocks({
        time: req.body.time
    });
    await block.save();
    */
});

//Peticion para generar contraseña (Crear)
router.post('/createNewPassword', async(req, res) => {
    var alfabeto = ['A', 'a', 'B', 'b', 'C', 'c', 'D', 'd', 'E', 'e', 'F', 'f', 'G', 'g', 'H', 'h', 'I', 'i', 'J', 'j', 'K', 'k', 'L', 'l', 'M', 'm', 'N', 'n', 'Ñ', 'ñ', 'O', 'o', 'P', 'p', 'Q', 'q', 'R', 'r', 'S', 's', 'T', 't', 'U', 'u', 'V', 'v', 'W', 'w', 'X', 'x', 'Y', 'y', 'Z', 'z'];
    var numeros = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    var caracteresEspeciales = ['_', '-', '@', '/', '.', ',', '{', '}', '[', ']', '!', '#', '$', '%', '&', '(', ')', '=', '¡', '?', '¿'];
    var contraseñaValida = false;
    const decoded = await jwt.verify(req.body.token, config.secret);
    req.userId = decoded.id;
    console.log(req.userId);
    var nuevoDigitosContraseña = req.body.digits;
    var seleccionAleatoria;
    var seleccionElementoAleatoria;
    var contraseñaFinal = "";
    //res.json(a.length);
    //console.log(contraseñaFinal.length);
    //console.log(alfabeto[0], alfabeto[53]);
    //console.log(numeros[0], numeros[9]);
    //console.log(caracteresEspeciales[0], caracteresEspeciales[20]);
    do {
        seleccionElementoAleatoria = Math.floor(Math.random() * 3);
        console.log(seleccionElementoAleatoria);
        if (seleccionElementoAleatoria == 0) {
            seleccionAleatoria = Math.floor(Math.random() * 54);
            //console.log(seleccionAleatoria);
            contraseñaFinal = contraseñaFinal + alfabeto[seleccionAleatoria];
            console.log('Abecedario: ' + contraseñaFinal);
        }
        if (seleccionElementoAleatoria == 1) {
            seleccionAleatoria = Math.floor(Math.random() * 10);
            contraseñaFinal = contraseñaFinal + numeros[seleccionAleatoria];
            console.log('Numero: ' + contraseñaFinal);
        }
        if (seleccionElementoAleatoria == 2) {
            seleccionAleatoria = Math.floor(Math.random() * 21);
            contraseñaFinal = contraseñaFinal + caracteresEspeciales[seleccionAleatoria];
            console.log('Especial: ' + contraseñaFinal);
        }

        //nuevoDigitosContraseña = nuevoDigitosContraseña - 1;
        //console.log(nuevoDigitosContraseña);
    } /*while (nuevoDigitosContraseña != 0);*/ while (contraseñaFinal.length != nuevoDigitosContraseña);
    console.log('Contraseña Final: ' + contraseñaFinal);

    const checkPasswordName = await Passwords.findOne({ userId: req.userId, namePassword: req.body.name })
    if (checkPasswordName) {
        return res.json({ message: "Ya existe una contraseña con el nombre " + req.body.name + ", verifiquelo y vuelva a intentarlo." })
    }

    const password = new Passwords({
        userId: req.userId,
        namePassword: req.body.name,
        password: contraseñaFinal
    });
    //Hola martin x2
    await password.save();
    console.log(password);
    res.json({ message: "Contraseña guardada!" });
    //res.json('Funciono yey');
});

//Peticion para editar una contraseña (Actualizar)
router.post('/editPassword', async(req, res) => {
    const decoded = await jwt.verify(req.body.token, config.secret);
    req.userId = decoded.id;
    console.log(req.userId);
    var messageCheck = ""
    const checkPassword = await Passwords.findOne({ _id: req.body.idPassword })
    if (checkPassword) {
        if (checkPassword.namePassword != req.body.newName) {
            const checkNameExists = await Passwords.findOne({ userId: req.userId, namePassword: req.body.newName })
            if (checkNameExists) {
                return res.json({ message: "Ya existe una contraseña con el nombre " + req.body.newName + ", verifiquelo y vuelva a intentarlo." })
            }
        } else {
            //return res.json({ message: "Sin cambios en el nombre" });
            messageCheck = messageCheck + "Sin cambios en el nombre";
        }
        if (checkPassword.password != req.body.newPassword) {} else {
            //return res.json({ message: "Sin cambios en la contraseña"});
            messageCheck = messageCheck + "Sin cambios en la contraseña";
        }
    }
    /*
    const checkNameExists = await Passwords.findOne({ userId: req.body.user_id, namePassword: req.body.newName })
    if (checkNameExists) {
        return res.json({ message: "Ya existe una contraseña con el nombre " + req.body.newName + ", verifiquelo y vuelva a intentarlo." })
    }
    const checkPasswordExists = await Passwords.findOne({ userId: req.body.user_id, password: req.body.newPassword })
    if (checkPasswordExists) {
        return res.json({ message: "Ya existe esta contraseña generada en su cuenta, verifiquelo y vuelva a intentarlo." })
    }
    */
    const editPassword = await Passwords.findOne({ _id: req.body.idPassword })
    if (!editPassword) {
        return res.json({ message: "Hubo un problema al momento de buscar la contraseña" });
    }
    editPassword.namePassword = req.body.newName;
    editPassword.password = req.body.newPassword;
    await editPassword.save();
    res.json({ message: "Contraseña actualizada!", messageCheck, editPassword });
});

//Peticion para traer las contraseñas de un usuario (Leer)
router.post('/readPassword', async(req, res) => {
    const decoded = await jwt.verify(req.body.token, config.secret);
    req.userId = decoded.id;
    console.log(req.userId);
    const userPasswords = await Passwords.find({ userId: req.userId })
    if (!userPasswords | userPasswords.length == 0) {
        return res.json({ message: "Este usuario no ha generado contraseñas", number: 1 });
    }
    console.log(userPasswords);
    res.json({ userPasswords, number: 2 });
});

//Peticion para borrar una contraseña (Eliminar)
router.post('/deletePassword', async(req, res) => {
    const deletePassword = await Passwords.findOne({ _id: req.body.idPassword })
    if (!deletePassword) {
        return res.json({ message: "Hubo un problema al momento de buscar la contraseña" });
    }
    await deletePassword.delete();
    res.json({ message: "Contraseña eliminada!" });
});


//Peticion para enviar calerta por usuario a MarzhalId
router.post('/userSendByAlert', async(req, res) => {
    console.log('MensajeAlerta: ' + req.body.message);
    const decoded = await jwt.verify(req.body.token, config.secret);
    req.userId = decoded.id;
    //req.userId = req.body.id;
    const user = await User.findOne({ _id: req.userId })
    if (!user) {
        return res.json("El email no existe en la base de datos.")
    }
    //rand = Math.floor((Math.random() * 100) + 54);
    //host = "localhost:3000";
    //link = "http://" + host + "/api/auth/changePassword?id=" + rand;
    mailOptions = {
        //to: 'marzhalid@gmail.com',
        to: 'fakturor@fakturor.com.mx',
        subject: "ALERTA - " + user.email,
        html: "El usuario con el correo: " + user.email + " dice:<br><i>" + req.body.message + ".</i><br>"
    }
    console.log(mailOptions);
    ses.sendEmail(mailOptions.to, "ALERTA - " + user.email, "El usuario con el correo: " + user.email + " dice:<br><i>" + req.body.message + ".</i><br>").then(data => {
        console.log("Mensaje enviado");
        //res.end("Enviado");
        return res.status(200).json({ header: 'ALERTA ENVIADA', message: 'En breve recibirás apoyo por parte de nuestro equipo.', number: 1 });
    }).catch((error) => {
        console.log(error);
        return res.json({ header: 'ERROR!', message: 'Hubo un problema al enviar la alerta, intentelo de nuevo.', number: 2 });
    });
    // smtpTransport.sendMail(mailOptions, function(error, response) {
    //     if (error) {
    //         console.log(error);
    //         return res.json({ header: 'ERROR!', message: 'Hubo un problema al enviar la alerta, intentelo de nuevo.', number: 2 });
    //     } else {
    //         console.log("Mensaje enviado: " + response.message);
    //         //res.end("Enviado");
    //         return res.status(200).json({ header: 'ALERTA ENVIADA', message: 'En breve recibirás apoyo por parte de nuestro equipo.', number: 1 });
    //     }
    // });
});

router.post('/userSendToAlert', async(req, res) => {
    console.log('MensajeAlerta: ' + req.body.message);
    const decoded = await jwt.verify(req.body.token, config.secret);
    req.userId = decoded.id;
    //req.userId = req.body.id;
    const user = await User.findOne({ _id: req.userId })
    if (!user) {
        return res.json("El email no existe en la base de datos.")
    }
    //rand = Math.floor((Math.random() * 100) + 54);
    //host = "localhost:3000";
    //link = "http://" + host + "/api/auth/changePassword?id=" + rand;
    mailOptions = {
        to: user.email,
        subject: "ALERTA ENVIADA - " + user.email,
        html: "Se ha enviado su alerta con el mensaje: <br><i>" + req.body.message + ".</i><br> <br>En breve recibirás apoyo por parte de nuestro equipo.<br>"
    }
    console.log(mailOptions);
    ses.sendEmail(user.email, "ALERTA - " + user.email, "Se ha enviado su alerta con el mensaje: <br><i>" + req.body.message + ".</i><br> <br>En breve recibirás apoyo por parte de nuestro equipo.<br>").then(data => {
        console.log("Mensaje enviado");
        //res.end("Enviado");
        return res.status(200).json({ header: 'ALERTA ENVIADA', message: 'En breve recibirás apoyo por parte de nuestro equipo.', number: 1 });
    }).catch((error) => {
        console.log(error);
        return res.json({ header: 'ERROR!', message: 'Hubo un problema al enviar la alerta, intentelo de nuevo.', number: 2 });
    });
    // smtpTransport.sendMail(mailOptions, function(error, response) {
    //     if (error) {
    //         console.log(error);
    //         return res.json({ header: 'ERROR!', message: 'Hubo un problema al enviar la alerta, intentelo de nuevo.', number: 2 });
    //     } else {
    //         console.log("Mensaje enviado: " + response.message);
    //         //res.end("Enviado");
    //         return res.status(200).json({ header: 'ALERTA ENVIADA', message: 'En breve recibirás apoyo por parte de nuestro equipo.', number: 1 });
    //     }
    // });
});
module.exports = router;