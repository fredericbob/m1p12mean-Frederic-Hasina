const RendezVous = require('../../models/RendezVous');
const Utilisateur = require('../../models/Utilisateur');
const Prestation = require('../../models/Prestation');
const Piece = require('../../models/Piece');
const Vehicule = require('../../models/Vehicules');

/**
 * Statistiques générales du tableau de bord
 * Inclut : compteurs, pièces faible stock, moyenne notes, RDV aujourd'hui
 */
exports.getGeneralStats = async (req, res) => {
    try {
        // Date du jour (début et fin pour les requêtes)
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        // Compteurs de base (exécution en parallèle pour optimiser)
        const [
            totalRendezVous,
            enAttente,
            confirmes,
            annules,
            termines,
            totalClients,
            totalTechniciens,
            totalVehicules,
            totalPieces,
            rendezVousAujourdHui
        ] = await Promise.all([
            RendezVous.countDocuments(),
            RendezVous.countDocuments({ statut: 'En attente' }),
            RendezVous.countDocuments({ statut: 'Confirmé' }),
            RendezVous.countDocuments({ statut: 'Annulé' }),
            RendezVous.countDocuments({ statut: 'Terminé' }),
            Utilisateur.countDocuments({ role: 'client' }),
            Utilisateur.countDocuments({ role: 'mecanicien' }),
            Vehicule.countDocuments(),
            Piece.countDocuments(),
            RendezVous.countDocuments({
                date_rdv: { $gte: startOfDay, $lte: endOfDay }
            })
        ]);

        // Pièces avec stock faible (utilise aggregate pour optimiser)
        const piecesFaibleStock = await Piece.aggregate([
            { $unwind: "$compatibilites" },
            {
                $match: {
                    $expr: {
                        $lte: ["$compatibilites.quantite_stock", "$compatibilites.seuil_alerte"]
                    }
                }
            },
            {
                $lookup: {
                    from: "vehicules",
                    localField: "compatibilites.vehicule",
                    foreignField: "_id",
                    as: "vehiculeDetails"
                }
            },
            { $unwind: { path: "$vehiculeDetails", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    pieceId: "$_id",
                    nomPiece: "$nom",
                    vehicule: {
                        marque: "$vehiculeDetails.marque",
                        modele: "$vehiculeDetails.modele",
                        annee: "$vehiculeDetails.annee"
                    },
                    quantite_stock: "$compatibilites.quantite_stock",
                    seuil_alerte: "$compatibilites.seuil_alerte"
                }
            }
        ]);

        // Calcul moyenne des notes (exclut les RDV annulés)
        const avgNoteResult = await RendezVous.aggregate([
            {
                $match: {
                    "avis_client.note": { $exists: true, $ne: null },
                    statut: { $ne: 'Annulé' }
                }
            },
            {
                $group: {
                    _id: null,
                    moyenneNote: { $avg: "$avis_client.note" },
                    totalAvis: { $sum: 1 }
                }
            }
        ]);

        const moyenneNote = avgNoteResult.length > 0 ?
            Math.round(avgNoteResult[0].moyenneNote * 100) / 100 : null;
        const totalAvis = avgNoteResult.length > 0 ? avgNoteResult[0].totalAvis : 0;

        // Réponse JSON structurée
        res.json({
            totalRendezVous,
            rendezVousParStatut: {
                enAttente,
                confirmes,
                annules,
                termines
            },
            totalClients,
            totalTechniciens,
            totalVehicules,
            totalPieces,
            piecesFaibleStock,
            moyenneNote,
            totalAvis,
            rendezVousAujourdHui,
            dateCalcul: new Date().toISOString()
        });

    } catch (error) {
        console.error('Erreur getGeneralStats:', error);
        res.status(500).json({
            message: 'Erreur serveur',
            detail: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Top 5 des prestations les plus demandées
 * Exclut les RDV annulés pour avoir des stats pertinentes
 */
exports.getTopPrestations = async (req, res) => {
    try {
        const topPrestations = await RendezVous.aggregate([
            // Exclure les RDV annulés
            { $match: { statut: { $ne: 'Annulé' } } },
            // Décomposer le tableau des prestations
            { $unwind: "$prestations" },
            // Grouper par prestation et compter
            {
                $group: {
                    _id: "$prestations.prestation_id",
                    totalDemandes: { $sum: 1 }
                }
            },
            // Trier par popularité décroissante
            { $sort: { totalDemandes: -1 } },
            // Limiter aux 5 premières
            { $limit: 5 },
            // Récupérer les détails de la prestation
            {
                $lookup: {
                    from: "prestations",
                    localField: "_id",
                    foreignField: "_id",
                    as: "prestationDetails"
                }
            },
            { $unwind: "$prestationDetails" },
            // Projeter les champs nécessaires
            {
                $project: {
                    prestationId: "$_id",
                    nom: "$prestationDetails.nom",
                    prix_main_oeuvre: "$prestationDetails.prix_main_oeuvre",
                    totalDemandes: 1,
                    _id: 0
                }
            }
        ]);

        res.json(topPrestations);

    } catch (error) {
        console.error('Erreur getTopPrestations:', error);
        res.status(500).json({
            message: "Erreur serveur",
            detail: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Liste détaillée des pièces en alerte stock
 * Retourne toutes les compatibilités en dessous du seuil
 */
exports.getPiecesAlert = async (req, res) => {
    try {
        const piecesAlert = await Piece.aggregate([
            { $unwind: "$compatibilites" },
            {
                $match: {
                    $expr: {
                        $lte: ["$compatibilites.quantite_stock", "$compatibilites.seuil_alerte"]
                    }
                }
            },
            {
                $lookup: {
                    from: "vehicules",
                    localField: "compatibilites.vehicule",
                    foreignField: "_id",
                    as: "vehiculeDetails"
                }
            },
            { $unwind: { path: "$vehiculeDetails", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    pieceId: "$_id",
                    nomPiece: "$nom",
                    compatibiliteId: "$compatibilites._id",
                    vehicule: {
                        id: "$vehiculeDetails._id",
                        marque: "$vehiculeDetails.marque",
                        modele: "$vehiculeDetails.modele",
                        annee: "$vehiculeDetails.annee"
                    },
                    prix: "$compatibilites.prix",
                    quantite_stock: "$compatibilites.quantite_stock",
                    seuil_alerte: "$compatibilites.seuil_alerte",
                    _id: 0
                }
            },
            { $sort: { quantite_stock: 1 } } // Les plus critiques en premier
        ]);

        res.json({
            totalAlert: piecesAlert.length,
            pieces: piecesAlert
        });

    } catch (error) {
        console.error('Erreur getPiecesAlert:', error);
        res.status(500).json({
            message: "Erreur serveur",
            detail: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Estimation du revenu sur une période
 * HYPOTHÈSE: Calcul basé sur prix_main_oeuvre des prestations terminées
 * Ne prend pas en compte les pièces utilisées (données manquantes)
 */
exports.getRevenue = async (req, res) => {
    try {
        const { from, to } = req.query;

        // Validation des dates
        if (!from || !to) {
            return res.status(400).json({
                message: "Paramètres 'from' et 'to' requis (format: YYYY-MM-DD)"
            });
        }

        const dateFrom = new Date(from);
        const dateTo = new Date(to);

        if (isNaN(dateFrom.getTime()) || isNaN(dateTo.getTime())) {
            return res.status(400).json({
                message: "Format de date invalide (utilisez YYYY-MM-DD)"
            });
        }

        // Fin de journée pour dateTo
        dateTo.setHours(23, 59, 59, 999);

        // Agrégation pour calculer le revenu estimé
        const revenueData = await RendezVous.aggregate([
            {
                $match: {
                    statut: 'Terminé',
                    date_rdv: { $gte: dateFrom, $lte: dateTo }
                }
            },
            { $unwind: "$prestations" },
            {
                $lookup: {
                    from: "prestations",
                    localField: "prestations.prestation_id",
                    foreignField: "_id",
                    as: "prestationDetails"
                }
            },
            { $unwind: "$prestationDetails" },
            {
                $group: {
                    _id: null,
                    totalRevenu: { $sum: "$prestationDetails.prix_main_oeuvre" },
                    nombrePrestations: { $sum: 1 },
                    nombreRendezVous: { $addToSet: "$_id" }
                }
            },
            {
                $project: {
                    totalRevenu: 1,
                    nombrePrestations: 1,
                    nombreRendezVous: { $size: "$nombreRendezVous" },
                    _id: 0
                }
            }
        ]);

        const result = revenueData.length > 0 ? revenueData[0] : {
            totalRevenu: 0,
            nombrePrestations: 0,
            nombreRendezVous: 0
        };

        res.json({
            periode: { from, to },
            ...result,
            avertissement: "Calcul basé uniquement sur la main d'œuvre (prix des pièces non inclus)",
            dateCalcul: new Date().toISOString()
        });

    } catch (error) {
        console.error('Erreur getRevenue:', error);
        res.status(500).json({
            message: "Erreur serveur",
            detail: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
