const Piece = require("../../models/Piece");
const Prestation = require("../../models/Prestation")

// Créer une prestation
exports.createPrestation = async (req, res) => {
    try {
        const prestation = new Prestation(req.body);
        await prestation.save();
        res.status(201).json(prestation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Récupérer toutes les prestations
exports.getAllPrestations = async (req, res) => {
    try {
        const prestations = await Prestation.find();
        res.json(prestations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Récupérer une prestation par ID
exports.getPrestationById = async (req, res) => {
    try {
        const prestation = await Prestation.findById(req.params.id);
        if (!prestation) return res.status(404).json({ message: 'Prestation non trouvée' });
        res.status(200).json(prestation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updatePrestation = async (req, res) => {
    try {
        const prestation = await Prestation.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!prestation) return res.status(404).json({ message: 'Prestation non trouvée' });
        res.status(200).json(prestation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


exports.deletePrestation = async (req, res) => {
    try {
        const prestation = await Prestation.findByIdAndDelete(req.params.id);
        if (!prestation) return res.status(404).json({ message: 'Prestation non trouvée' });
        res.status(200).json({ message: 'Prestation supprimée' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Récupérer toutes les pièces disponibles
exports.getAllPieces = async (req, res) => {
    try {
        const pieces = await Piece.find().populate('variantes.type_vehicule');
        res.json(pieces);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
