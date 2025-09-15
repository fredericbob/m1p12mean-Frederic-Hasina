const Piece = require("../../models/Piece");
const Prestation = require("../../models/Prestation");
const TypeVehicule = require("../../models/TypeVehicule");

/**
 * Créer une nouvelle prestation
 */
exports.createPrestation = async (req, res) => {
    try {
        // Validation des données requises
        const { nom, description, prix_main_oeuvre, processus } = req.body;

        if (!nom || !description || !prix_main_oeuvre) {
            return res.status(400).json({
                message: 'Les champs nom, description et prix_main_oeuvre sont requis'
            });
        }

        if (prix_main_oeuvre < 0) {
            return res.status(400).json({
                message: 'Le prix main d\'œuvre doit être positif'
            });
        }

        // Créer la prestation
        const prestation = new Prestation(req.body);
        await prestation.save();

        // Populer les références pour la réponse
        await prestation.populate('processus.pieces_possibles');
        await prestation.populate('supplementMainOeuvre.typeVehicule');

        res.status(201).json({
            message: 'Prestation créée avec succès',
            prestation
        });
    } catch (error) {
        console.error('Erreur création prestation:', error);

        // Gestion erreur de duplication (nom unique)
        if (error.code === 11000) {
            return res.status(400).json({
                message: 'Une prestation avec ce nom existe déjà'
            });
        }

        res.status(400).json({
            message: 'Erreur lors de la création',
            detail: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Récupérer toutes les prestations avec leurs relations
 */
exports.getAllPrestations = async (req, res) => {
    try {
        const prestations = await Prestation.find()
            .populate('processus.pieces_possibles', 'nom')
            .populate('supplementMainOeuvre.typeVehicule', 'nom')
            .sort({ nom: 1 }); // Tri alphabétique

        res.json({
            count: prestations.length,
            prestations
        });
    } catch (error) {
        console.error('Erreur récupération prestations:', error);
        res.status(500).json({
            message: 'Erreur serveur',
            detail: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Récupérer une prestation par ID
 */
exports.getPrestationById = async (req, res) => {
    try {
        const prestation = await Prestation.findById(req.params.id)
            .populate('processus.pieces_possibles', 'nom compatibilites')
            .populate('supplementMainOeuvre.typeVehicule', 'nom');

        if (!prestation) {
            return res.status(404).json({
                message: 'Prestation non trouvée'
            });
        }

        res.json(prestation);
    } catch (error) {
        console.error('Erreur récupération prestation:', error);

        // Erreur d'ID invalide
        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'ID de prestation invalide'
            });
        }

        res.status(500).json({
            message: 'Erreur serveur',
            detail: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Mettre à jour une prestation
 */
exports.updatePrestation = async (req, res) => {
    try {
        const { nom, description, prix_main_oeuvre } = req.body;

        // Validation des données
        if (prix_main_oeuvre && prix_main_oeuvre < 0) {
            return res.status(400).json({
                message: 'Le prix main d\'œuvre doit être positif'
            });
        }

        const prestation = await Prestation.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true // Exécuter les validations du schéma
            }
        )
        .populate('processus.pieces_possibles', 'nom')
        .populate('supplementMainOeuvre.typeVehicule', 'nom');

        if (!prestation) {
            return res.status(404).json({
                message: 'Prestation non trouvée'
            });
        }

        res.json({
            message: 'Prestation mise à jour avec succès',
            prestation
        });
    } catch (error) {
        console.error('Erreur mise à jour prestation:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'ID de prestation invalide'
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                message: 'Une prestation avec ce nom existe déjà'
            });
        }

        res.status(400).json({
            message: 'Erreur lors de la mise à jour',
            detail: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Supprimer une prestation
 */
exports.deletePrestation = async (req, res) => {
    try {
        const prestation = await Prestation.findByIdAndDelete(req.params.id);

        if (!prestation) {
            return res.status(404).json({
                message: 'Prestation non trouvée'
            });
        }

        res.json({
            message: 'Prestation supprimée avec succès',
            deletedPrestation: {
                id: prestation._id,
                nom: prestation.nom
            }
        });
    } catch (error) {
        console.error('Erreur suppression prestation:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'ID de prestation invalide'
            });
        }

        res.status(500).json({
            message: 'Erreur serveur',
            detail: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Récupérer toutes les pièces avec compatibilités
 */
exports.getAllPieces = async (req, res) => {
    try {
        const pieces = await Piece.find()
            .populate('compatibilites.vehicule', 'marque modele annee type_vehicule')
            .sort({ nom: 1 });

        res.json({
            count: pieces.length,
            pieces
        });
    } catch (error) {
        console.error('Erreur récupération pièces:', error);
        res.status(500).json({
            message: 'Erreur serveur',
            detail: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Récupérer tous les types de véhicules
 */
exports.getAllTypesVehicule = async (req, res) => {
    try {
        const typesVehicule = await TypeVehicule.find().sort({ nom: 1 });

        res.json({
            count: typesVehicule.length,
            typesVehicule
        });
    } catch (error) {
        console.error('Erreur récupération types véhicule:', error);
        res.status(500).json({
            message: 'Erreur serveur',
            detail: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
