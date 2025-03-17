const mongoose = require('mongoose');

const tarifSchema = new mongoose.Schema({
    vehicule_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicules', required: true },
    prix_minimum: { type: Number, required: true },
    prix_recommandation: { type: Number, required: true }
});

const prestationSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    description: { type: String, required: true },
    tarifs: [tarifSchema]
});

module.exports = mongoose.model('Prestation', prestationSchema);
