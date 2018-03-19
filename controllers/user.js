'use strict'

// modulos
var bcrypt = require('bcrypt-nodejs');
var fs = require('fs');
var path = require('path');

//modelos
var User = require('../models/user');

// servicios
var jwt = require('../services/jwt');

//acciones
function pruebas(req, res) {
    res.status(200).send({
        message: 'Probando el controlador de usuarios y la accion pruebas',
        user: req.user
    });
}

function saveUser(req, res) {
    // crear objecto
    var user = new User();

    // recoger parametros de la peticion
    var params = req.body;

    if (params.password && params.name && params.surname && params.email) {

        //asignar valores a usuario
        user.name = params.name;
        user.surname = params.surname;
        user.email = params.email;
        user.role = 'ROLE_USER';
        user.image = null;

        User.findOne({ email: user.email.toLowerCase() }, (err, issetUser) => {
            if (err) {
                res.status(500).send({
                    message: 'Error al comprobar el usuario'
                });
            } else {
                if (!issetUser) {

                    // cifrar contra
                    bcrypt.hash(params.password, null, null, function(err, hash) {
                        user.password = hash;

                        //guardo usuario en base de datos
                        user.save((err, userStored) => {
                            if (err) {
                                res.status(500).send({
                                    message: 'Error al guardar el usuario'
                                });
                            } else {
                                if (!userStored) {
                                    res.status(404).send({
                                        message: 'No se ha registrado el usuario'
                                    });
                                } else {
                                    res.status(200).send({
                                        user: userStored
                                    });
                                }
                            }
                        });
                    });

                } else {

                    res.status(404).send({
                        message: 'El usuario no puede registrarse'
                    });

                }
            }
        });

    } else {
        res.status(400).send({
            message: 'Introduce los datos correctamente'
        });
    }
}

function login(req, res) {

    var params = req.body;

    var emailParam = params.email;
    var password = params.password;

    User.findOne({ email: emailParam.toLowerCase() }, (err, issetUser) => {
        if (err) {
            res.status(500).send({
                message: 'Error al comprobar al usuario'
            });
        } else {
            if (issetUser) {

                bcrypt.compare(password, issetUser.password, (err, check) => {
                    if (check) {

                        //comprar y generar el token
                        if (params.gettoken) {

                            res.status(200).send({
                                token: jwt.createToken(issetUser)
                            });

                        } else {
                            res.status(200).send({
                                user: issetUser
                            });
                        }

                    } else {
                        res.status(401).send({
                            message: 'Usario y/o contraseña incorrectos'
                        });
                    }
                });

            } else {
                res.status(404).send({
                    message: 'El usuario no ha podido loguearse'
                });
            }
        }
    });
}

function updateUser(req, res) {
    var userId = req.params.id;
    var update = req.body;

    if (userId != req.user.sub) {
        return res.status(500).send({ message: 'No tienes permiso para actualizar el usuario' })
    }

    User.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdated) => {
        if (err) {
            res.status(500).send({ message: 'Error al actualizar usuario' });
        } else {
            if (!userUpdated) {
                res.status(404).send({ message: 'No se ha podido actualizar el usuario' });
            } else {
                res.status(200).send({ user: userUpdated });
            }
        }
    });
}

function uploadImage(req, res) {

    var userId = req.params.id;
    //var fileName = 'No subido...';

    if (req.files) {
        var filePath = req.files.image.path;
        var fileSplit = filePath.split('/');
        var fileName = fileSplit[2];

        var extSplit = fileName.split('\.');
        var ext = extSplit[1];

        if (ext == 'png' || ext == 'jpg' || ext == 'jpeg' || ext == 'png') {

            // res.status(200).send({ filePath, fileSplit, fileName, ext });

            if (userId != req.user.sub) {
                return res.status(500).send({ message: 'No tienes permiso para actualizar el usuario' })
            }

            User.findByIdAndUpdate(userId, { image: fileName }, { new: true }, (err, userUpdated) => {
                if (err) {
                    res.status(500).send({ message: 'Error al actualizar usuario' });
                } else {
                    if (!userUpdated) {
                        res.status(404).send({ message: 'No se ha podido actualizar el usuario' });
                    } else {
                        res.status(200).send({ user: userUpdated, image: fileName });
                    }
                }
            });


        } else {
            fs.unlink(filePath, (err) => {
                if (err) {
                    res.status(400).send({ message: 'La extensión del archivo no es válido y fichero no borrado' });
                } else {
                    res.status(400).send({ message: 'La extensión del archivo no es válido' });
                }
            });
        }

    } else {
        res.status(404).send({ message: 'No se han subido archivos' });
    }
}

function getImageFile(req, res) {
    var imageFile = req.params.imageFile;
    var pathFile = './uploads/users/' + imageFile;

    fs.exists(pathFile, function(exist) {
        if (exist) {
            res.sendFile(path.resolve(pathFile))
        } else {
            res.status(404).send({ message: 'La imagen no existe' });
        }
    });
}

function getKeepers(req, res) {
    User.find({ role: 'ROLE_ADMIN' }).exec((err, users) => {
        if (err) {
            res.status(500).send({ message: 'Error en la petición' });
        } else {
            if (!users) {
                res.status(404).send({ message: 'No hay cuidadores' });
            } else {
                res.status(200).send({ users });
            }
        }
    });

}

module.exports = {
    pruebas,
    saveUser,
    login,
    updateUser,
    uploadImage,
    getImageFile,
    getKeepers
};