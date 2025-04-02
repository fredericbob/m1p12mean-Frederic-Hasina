const Prestation = require("../../models/Prestation")
const Piece = require("../../models/Piece")

// Récupérer toutes les prestations avec le prix minimum
exports.getAccueilPrestations = async (req, res) => {
    try {
        const prestations = await Prestation.find().populate("processus.pieces_possibles");

        const formattedPrestations = prestations.map((prestation) => {
            let prixMinPieces = 0;

            // Calculer le prix minimum des pièces requises par chaque processus
            prestation.processus.forEach((processus) => {
                if (processus.pieces_possibles.length > 0) {
                    const prixMinProcessus = Math.min(
                        ...processus.pieces_possibles.flatMap(piece =>
                            piece.variantes.map(variant => variant.prix)
                        )
                    );
                    prixMinPieces += prixMinProcessus;
                }
            });

            // Prix total minimum = main d'œuvre + somme des prix min de chaque processus
            const prixMinTotal = prestation.prix_main_oeuvre + prixMinPieces;

            return {
                id: prestation._id,
                nom: prestation.nom,
                description: prestation.description,
                prix_minimum: prixMinTotal
            };
        });

        res.status(200).json(formattedPrestations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
