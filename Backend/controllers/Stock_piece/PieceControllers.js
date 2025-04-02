const Piece = require('../../models/Piece');
const RendezVous = require('../../models/RendezVous'); 
const Vehicules = require('../../models/Vehicules'); 

const addPiece = async (req, res) => {
    try {
        const { nom, types } = req.body;

        if (!nom || !Array.isArray(types) || types.length === 0) {
            return res.status(400).json({ message: "Tous les champs sont requis et 'types' doit être un tableau non vide" });
        }

 
        for (const type of types) {
            if (!type.prix || !type.vehicule) {
                return res.status(400).json({ message: "Chaque type doit contenir un prix et un véhicule" });
            }
        }

        const newPiece = new Piece({
            nom,
            types
        });

        await newPiece.save();
        res.status(201).json({ message: "Pièce ajoutée avec succès", piece: newPiece });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};




const getPieces = async (req, res) => {
    try {
  
        const pieces = await Piece.find().populate('types.vehicule', 'marque modele annee type_moteur');
        res.status(200).json(pieces);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};



const deletePiece = async (req, res) => {
    try {
        const piece = await Piece.findByIdAndDelete(req.params.id);

        if (!piece) {
            return res.status(404).json({ message: "Pièce non trouvée" });
        }

        res.status(200).json({ message: "Pièce supprimée avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

module.exports = {
    addPiece,
    getPieces,
    deletePiece
};
