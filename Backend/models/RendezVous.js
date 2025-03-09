const mongoose = require('mongoose');

const RendezVousSchema = new mongoose.Schema({
    client_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: true
    },
    mecanicien_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: true
    },
    vehicule_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicules',
        required: true
    },
    date_rdv: {
        type: Date,
        required: true
    },
    statut: {
        type: String,
        enum: ['En attente', 'Confirmé', 'Annulé', 'Terminé'],
        default: 'En attente'
    }
}, { timestamps: true });

module.exports = mongoose.model('RendezVous', RendezVousSchema);
