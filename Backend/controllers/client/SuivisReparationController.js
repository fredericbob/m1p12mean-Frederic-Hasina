const RendezVous = require('../../models/RendezVous');

/**
 * Récupère le détail d'un rendez-vous avec suivi des prestations pour le client
 */
exports.getSuiviReparations = async (req, res) => {
    try {
        const rendezVousId = req.params.id;
        const clientId = req.user.id;

        // Récupérer le rendez-vous avec les relations appropriées
        const rendezVous = await RendezVous.findById(rendezVousId)
            .populate('prestations.prestation_id', 'nom description prix_main_oeuvre')
            .populate('client_id', 'nom prenom email telephone')
            .populate('mecanicien_id', 'nom prenom')
            .populate('vehicule_enregistrer', 'marque modele annee type_moteur type_vehicule')
            .populate({
                path: 'vehicule_enregistrer',
                populate: {
                    path: 'type_vehicule',
                    model: 'TypeVehicule',
                    select: 'nom'
                }
            })
            .populate('vehicule_id.type', 'nom');

        if (!rendezVous) {
            return res.status(404).json({
                success: false,
                message: "Rendez-vous non trouvé"
            });
        }

        // Vérification de propriété simplifiée
        if (rendezVous.client_id._id.toString() !== clientId) {
            return res.status(403).json({
                success: false,
                message: "Accès non autorisé à ce rendez-vous"
            });
        }

        // Traitement des prestations avec gestion des cas null
        const prestationsAvecStatuts = rendezVous.prestations.map(prestation => {
            const statuts = prestation.statuts || {};

            // Détermination du statut actuel par priorité logique
            let statutActuel = "En attente";
            let dernierTimestamp = statuts.En_attente;

            if (statuts.Annulé) {
                statutActuel = "Annulé";
                dernierTimestamp = statuts.Annulé;
            } else if (statuts.Terminé) {
                statutActuel = "Terminé";
                dernierTimestamp = statuts.Terminé;
            } else if (statuts.En_cours) {
                statutActuel = "En cours";
                dernierTimestamp = statuts.En_cours;
            }

            // Gestion sécurisée des informations de prestation
            const prestationInfo = prestation.prestation_id ? {
                nom: prestation.prestation_id.nom,
                description: prestation.prestation_id.description,
                prix_main_oeuvre: prestation.prestation_id.prix_main_oeuvre
            } : {
                nom: "Prestation supprimée",
                description: "Cette prestation n'est plus disponible dans le système",
                prix_main_oeuvre: 0
            };

            return {
                id: prestation._id,
                prestation: prestationInfo,
                statut_actuel: statutActuel,
                statuts: statuts,
                derniere_modification: dernierTimestamp
            };
        });

        // Calcul de progression
        const prestationsTerminees = prestationsAvecStatuts.filter(p => p.statut_actuel === "Terminé").length;
        const pourcentageProgression = prestationsAvecStatuts.length > 0
            ? Math.round((prestationsTerminees / prestationsAvecStatuts.length) * 100)
            : 0;

        // Construction des informations véhicule selon la logique métier
        let vehiculeInfo = "Véhicule non spécifié";
        if (rendezVous.vehicule_enregistrer) {
            // Véhicule de la base de données
            const v = rendezVous.vehicule_enregistrer;
            const typeVehicule = v.type_vehicule ? ` (${v.type_vehicule.nom})` :
                                 v.type_vehicule_autre ? ` (${v.type_vehicule_autre})` : '';
            vehiculeInfo = `${v.marque} ${v.modele} ${v.annee} - ${v.type_moteur}${typeVehicule}`;
        } else if (rendezVous.vehicule_id && rendezVous.vehicule_id.marque) {
            // Véhicule saisi pour ce RDV uniquement
            const v = rendezVous.vehicule_id;
            const typeVehicule = v.type ? ` (${v.type.nom})` :
                                 v.type_autre ? ` (${v.type_autre})` : '';
            const moteur = v.type_moteur ? ` - ${v.type_moteur}` : '';
            vehiculeInfo = `${v.marque} ${v.modele} ${v.annee}${moteur}${typeVehicule}`;
        }

        // Réponse structurée
        const response = {
            id: rendezVous._id,
            date_rdv: rendezVous.date_rdv,
            statut: rendezVous.statut,
            vehicule: vehiculeInfo,
            mecanicien: rendezVous.mecanicien_id
                ? `${rendezVous.mecanicien_id.prenom} ${rendezVous.mecanicien_id.nom}`
                : 'Mécanicien non assigné',
            prestations: prestationsAvecStatuts,
            progression: {
                pourcentage: pourcentageProgression,
                prestations_terminees: prestationsTerminees,
                total_prestations: prestationsAvecStatuts.length
            },
            avis_client: rendezVous.avis_client || {
                note: null,
                commentaire: null,
                date_avis: null
            },
            peut_donner_avis: rendezVous.statut === "Terminé" &&
                             (!rendezVous.avis_client || !rendezVous.avis_client.note)
        };

        res.status(200).json({
            success: true,
            message: "Détails du rendez-vous récupérés avec succès",
            data: response
        });

    } catch (error) {
        console.error('Erreur lors de la récupération du suivi:', error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur lors de la récupération du suivi",
            error: error.message
        });
    }
};

/**
 * Permet au client de donner une note et un commentaire sur le rendez-vous terminé
 */
exports.donnerAvis = async (req, res) => {
    try {
        const rendezVousId = req.params.id;
        const clientId = req.user.id;
        const { note, commentaire } = req.body;

        // Validation simplifiée
        if (!note || !Number.isInteger(note) || note < 1 || note > 5) {
            return res.status(400).json({
                success: false,
                message: "La note doit être un entier entre 1 et 5"
            });
        }

        // Récupération et vérifications en une seule requête
        const rendezVous = await RendezVous.findOne({
            _id: rendezVousId,
            client_id: clientId,
            statut: "Terminé"
        });

        if (!rendezVous) {
            return res.status(404).json({
                success: false,
                message: "Rendez-vous non trouvé, non autorisé ou pas encore terminé"
            });
        }

        // Vérification unicité de l'avis
        if (rendezVous.avis_client && rendezVous.avis_client.note) {
            return res.status(400).json({
                success: false,
                message: "Un avis a déjà été donné pour ce rendez-vous"
            });
        }

        // Mise à jour atomique
        const rendezVousUpdated = await RendezVous.findByIdAndUpdate(
            rendezVousId,
            {
                avis_client: {
                    note: note,
                    commentaire: commentaire?.trim() || "",
                    date_avis: new Date()
                }
            },
            { new: true, select: 'avis_client' }
        );

        res.status(200).json({
            success: true,
            message: "Avis enregistré avec succès",
            data: {
                avis: rendezVousUpdated.avis_client
            }
        });

    } catch (error) {
        console.error('Erreur lors de l\'enregistrement de l\'avis:', error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur lors de l'enregistrement de l'avis",
            error: error.message
        });
    }
};
