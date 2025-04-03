const Prestation = require('../../models/Prestation');
const Piece = require('../../models/Piece');
const TypeVehicule = require('../../models/TypeVehicule');

// Récupérer tous les types de véhicules et prestations
exports.getOptions = async (req, res) => {
    try {
        const typesVehicules = await TypeVehicule.find();
        const prestations = await Prestation.find();
        res.json({ typesVehicules, prestations });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des données", error });
    }
};

// Générer un devis
exports.generateDevis = async (req, res) => {
    try {
        const { typeVehiculeId, prestationIds } = req.body;

        // Vérifier que les IDs sont valides
        if (!typeVehiculeId || !prestationIds || prestationIds.length === 0) {
            return res.status(400).json({ message: "Veuillez fournir un type de véhicule et au moins une prestation." });
        }

        // Vérifier si le type de véhicule existe
        const typeVehicule = await TypeVehicule.findById(typeVehiculeId);
        if (!typeVehicule) {
            return res.status(404).json({ message: "Type de véhicule non trouvé." });
        }

        // Récupérer les prestations sélectionnées
        const prestations = await Prestation.find({ _id: { $in: prestationIds } }).populate('processus.pieces_possibles');

        let total = 0;
        const prestationsDetail = prestations.map(prestation => {
            let totalPieces = 0;
            let piecesDetail = [];

            prestation.processus.forEach(etape => {
                etape.pieces_possibles.forEach(piece => {
                    // Trouver la variante de prix correspondant au type de véhicule
                    const variante = piece.variantes.find(v => v.type_vehicule.toString() === typeVehiculeId);
                    if (variante) {
                        totalPieces += variante.prix;
                        piecesDetail.push({ nom: piece.nom, prix: variante.prix });
                    }
                });
            });

            // Calculer le total pour cette prestation
            const totalPrestation = prestation.prix_main_oeuvre + totalPieces;
            total += totalPrestation;

            return {
                nom: prestation.nom,
                prix_main_oeuvre: prestation.prix_main_oeuvre,
                pieces: piecesDetail,
                total_prestation: totalPrestation
            };
        });

        res.json({
            typeVehicule: typeVehicule.nom,
            prestations: prestationsDetail,
            total
        });

    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la génération du devis", error });
    }
};
