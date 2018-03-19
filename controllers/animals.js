'use strict'

// modulos
var fs = require('fs');
var path = require('path');

//modelos
var Animal = require('../models/animal');

//acciones
function pruebas(req, res) {
    res.status(200).send({
        message: 'Probando el controlador de animales y la accion pruebas',
        user: req.user
    });
}

function saveAnimal(req, res) {

    var animal = new Animal();

    var params = req.body;

    if (params.name) {
        animal.name = params.name;
        animal.description = params.description;
        animal.year = params.year;
        animal.image = null;
        animal.user = req.user.sub;

        animal.save((err, animalStored) => {
            if (err) {
                res.status(500).send({ message: 'Error en el servidor' });
            } else {
                if (!animalStored) {
                    res.status(404).send({ message: 'No se ha guardado el animal' });
                } else {
                    res.status(200).send({ animal: animalStored });
                }
            }
        });

    } else {
        res.status(200).send({ message: 'Ingrese todos los datos' });
    }
}

function getAnimals(req, res) {
    Animal.find({}).populate({ path: 'user' }).exec((err, animals) => {
        if (err) {
            res.status(500).send({ message: 'Error en la petición' });
        } else {
            if (!animals) {
                res.status(404).send({ message: 'No hay animales' });
            } else {
                res.status(200).send({ animals });
            }
        }
    });
}

function getAnimal(req, res) {
    var animalId = req.params.id;

    Animal.findById(animalId).populate({ path: 'user' }).exec((err, animal) => {
        if (err) {
            res.status(500).send({ message: 'Error en la petición' });
        } else {
            if (!animal) {
                res.status(404).send({ message: 'El animal no existe' });
            } else {
                res.status(200).send({ animal });
            }
        }
    });
}

function updateAnimal(req, res) {
    var animalId = req.params.id;
    var update = req.body;

    Animal.findByIdAndUpdate(animalId, update, { new: true }, (err, animalUpdated) => {
        if (err) {
            res.status(500).send({ message: 'Error en la petición' });
        } else {
            if (!animalUpdated) {
                res.status(404).send({ message: 'El animal no existe' });
            } else {
                res.status(200).send({ animal: animalUpdated });
            }
        }
    });
}

function uploadImage(req, res) {

    var animalId = req.params.id;

    if (req.files) {
        var filePath = req.files.image.path;
        var fileSplit = filePath.split('/');
        var fileName = fileSplit[2];

        var extSplit = fileName.split('\.');
        var ext = extSplit[1];

        if (ext == 'png' || ext == 'jpg' || ext == 'jpeg' || ext == 'png') {

            Animal.findByIdAndUpdate(animalId, { image: fileName }, { new: true }, (err, animalUpdated) => {
                if (err) {
                    res.status(500).send({ message: 'Error al actualizar el animal' });
                } else {
                    if (!animalUpdated) {
                        res.status(404).send({ message: 'No se ha podido actualizar el animal' });
                    } else {
                        res.status(200).send({ animal: animalUpdated, image: fileName });
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
    var pathFile = './uploads/animals/' + imageFile;

    fs.exists(pathFile, function(exist) {
        if (exist) {
            res.sendFile(path.resolve(pathFile))
        } else {
            res.status(404).send({ message: 'La imagen no existe' });
        }
    });
}

function deleteAnimal(req, res) {
    var animalId = req.params.id;

    Animal.findByIdAndRemove(animalId, (err, animalRemoved) => {
        if (err) {
            res.status(500).send({ message: 'Error en la petición' });
        } else {
            if (!animalRemoved) {
                res.status(404).send({ message: 'No se ha borrado el animal' });
            } else {
                res.status(200).send({ animal: animalRemoved });
            }
        }
    });
}

module.exports = {
    pruebas,
    saveAnimal,
    getAnimals,
    getAnimal,
    updateAnimal,
    uploadImage,
    getImageFile,
    deleteAnimal
};