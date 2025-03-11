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
    },
    prestation: {
        prestation_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Prestation',
            required: true
        },
        statut: {
            type: String,
            enum: ['En attente', 'Confirmé', 'Annulé', 'Terminé'],
            default: 'En attente'
        }
    },
    avis_client: {
        note: {
            type: Number,
            min: 1,
            max: 5
        },
        commentaire: {
            type: String,
            trim: true
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('RendezVous', RendezVousSchema);
