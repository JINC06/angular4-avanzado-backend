'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT || 3789;

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/zoo', { useMongoClient: true })
    .then(() => {
        console.log('La conexión a la base de datos zoo se ha realizado correctamente...');

        app.listen(port, () => {
            console.log('El servidor local de node y express esta corriendo correctamente...');
        });
    })
    .catch(err => console.log(err));