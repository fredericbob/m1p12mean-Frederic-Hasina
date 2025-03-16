const mongoose = require('mongoose');

const PieceSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    types: [
        {
            prix: {
                type: Number,
                required: true
            },
            vehicule: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Vehicule',
                required: true
            }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Piece', PieceSchema);
