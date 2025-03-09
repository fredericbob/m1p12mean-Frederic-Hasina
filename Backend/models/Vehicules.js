const mongoose = require('mongoose');


const vehicules = new mongoose.Schema({
    proprietaire_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilisateur', 
        required: true
    },
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
    immatriculation: {
        type: String,
        required: [true, "L'immatriculation du véhicule est requise"],
        unique: true
    },
    kilometrage: {
        type: Number,
        required: [true, "Le kilométrage du véhicule est requis"]
    },
    date_ajout: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model('Vehicules', vehicules);


