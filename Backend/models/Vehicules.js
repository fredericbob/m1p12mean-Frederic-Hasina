const mongoose = require('mongoose');


const vehicules = new mongoose.Schema({
    marque: {
        type: String,
        required: [true, "La marque du véhicule est requise"]
    },
    modele: {
        type: String,
        required: [true, "Le modèle du véhicule est requis"]
    },
    annee: {
        type: Number,
        required: [true, "L'année du véhicule est requise"]
    },
    type_moteur: {
        type: String,
        enum: ['essence', 'diesel'],
        required: [true, "Le type de moteur est requis"]
    },
    date_ajout: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model('Vehicules', vehicules);


