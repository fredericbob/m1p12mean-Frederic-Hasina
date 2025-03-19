const Prestation = require("../../models/Prestation")

// Récupérer toutes les prestations avec le prix minimum
exports.getAccueilPrestations = async (req, res) => {
    try {
        const prestations = await Prestation.find().populate("tarifs.vehicule_id");

        const formattedPrestations = prestations.map((prestation) => {
            // Trouver le prix minimum parmi tous les types de véhicules pour cette prestation
            const prixMin = prestation.tarifs.length > 0
                ? Math.min(...prestation.tarifs.map(tarif => tarif.prix_minimum))
                : 0; // Si pas de tarifs, prix à 0

            return {
                id: prestation._id,
                nom: prestation.nom,
                description: prestation.description,
                prix_minimum: prixMin
            };
        });

        res.status(200).json(formattedPrestations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
