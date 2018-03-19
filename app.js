'use strict'

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

// cargar ruta
var userRoutes = require('./routes/user');
var animalRoutes = require('./routes/animals');

// los middleware de body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// configurar cabeceras y cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

// rutas base
app.use('/api', userRoutes);
app.use('/api', animalRoutes);

//app.get('/probando', (req, res) => {
//    res.status(200).send({ message: 'Este es el metodo de probando' });
//});

module.exports = app;