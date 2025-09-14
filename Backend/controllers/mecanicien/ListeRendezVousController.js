const RendezVous = require('../../models/RendezVous');

/**
 * Récupère la liste des rendez-vous du mécanicien connecté (hors statut "Terminé")
 */
exports.getRendezVousMecanicien = async (req, res) => {
    try {
        const mecanicienId = req.user.id;

        const rendezVous = await RendezVous.find({
            mecanicien_id: mecanicienId,
            statut: { $ne: "Terminé" }
        })
        .populate("client_id", "nom prenom email telephone")
        .populate("vehicule_enregistrer", "marque modele annee type_moteur")
        .populate("prestations.prestation_id", "nom description prix_main_oeuvre")
        .sort({ date_rdv: 1 });

        const result = rendezVous.map(rdv => {
            // Gestion du véhicule (fallback entre vehicule_enregistrer et vehicule_id)
            let vehiculeInfo = "Véhicule non spécifié";

            if (rdv.vehicule_enregistrer) {
                // Véhicule enregistré (référence au modèle Vehicule)
                const vehicule = rdv.vehicule_enregistrer;
                vehiculeInfo = `${vehicule.marque} ${vehicule.modele} (${vehicule.annee}) - ${vehicule.type_moteur}`;
            } else if (rdv.vehicule_id && rdv.vehicule_id.marque) {
                // Véhicule en embedded document
                const vehicule = rdv.vehicule_id;
                const anneeText = vehicule.annee ? `(${vehicule.annee})` : '';
                const moteurText = vehicule.type_moteur ? `- ${vehicule.type_moteur}` : '';
                vehiculeInfo = `${vehicule.marque} ${vehicule.modele || ''} ${anneeText} ${moteurText}`.trim();
            }

            // Nom complet du client
            const clientNomComplet = rdv.client_id
                ? `${rdv.client_id.prenom || ''} ${rdv.client_id.nom || ''}`.trim()
                : "Client inconnu";

            return {
                id: rdv._id,
                client: {
                    nom_complet: clientNomComplet,
                    nom: rdv.client_id?.nom,
                    prenom: rdv.client_id?.prenom,
                    email: rdv.client_id?.email,
                    telephone: rdv.client_id?.telephone
                },
                vehicule: vehiculeInfo,
                date_rdv: rdv.date_rdv,
                statut: rdv.statut,
                prestations: rdv.prestations.map(p => ({
                    id: p._id,
                    prestation: {
                        nom: p.prestation_id?.nom || "Prestation inconnue",
                        description: p.prestation_id?.description,
                        prix_main_oeuvre: p.prestation_id?.prix_main_oeuvre
                    },
                    statuts: p.statuts,
                    statut_actuel: getStatutPrestation(p.statuts)
                })),
                mecanicien_id: rdv.mecanicien_id
            };
        });

        res.status(200).json({
            success: true,
            message: "Rendez-vous récupérés avec succès",
            data: result,
            count: result.length
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des rendez-vous:', error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur lors de la récupération des rendez-vous",
            error: error.message
        });
    }
};

/**
 * Démarre une réparation (prestation) pour un rendez-vous
 * Si prestationId fourni, démarre cette prestation spécifique
 * Sinon, démarre la première prestation en attente
 */
exports.commencerReparation = async (req, res) => {
    try {
        const { id: rdvId } = req.params;
        const { prestationId } = req.body || {};
        const mecanicienId = req.user.id;

        // Validation de l'ID du rendez-vous
        if (!rdvId || !rdvId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "ID de rendez-vous invalide"
            });
        }

        // Vérifier que le RDV existe
        const rdv = await RendezVous.findById(rdvId)
            .populate("prestations.prestation_id", "nom description prix_main_oeuvre");

        if (!rdv) {
            return res.status(404).json({
                success: false,
                message: "Rendez-vous non trouvé"
            });
        }

        // Vérifier que le RDV n'est pas terminé ou annulé
        if (rdv.statut === 'Terminé' || rdv.statut === 'Annulé') {
            return res.status(400).json({
                success: false,
                message: `Impossible de démarrer une réparation sur un rendez-vous ${rdv.statut.toLowerCase()}`
            });
        }

        // Vérifier ou assigner le mécanicien
        if (rdv.mecanicien_id && rdv.mecanicien_id.toString() !== mecanicienId) {
            return res.status(403).json({
                success: false,
                message: "Vous n'êtes pas autorisé à modifier ce rendez-vous"
            });
        }

        // Assigner le mécanicien si pas encore assigné
        if (!rdv.mecanicien_id) {
            rdv.mecanicien_id = mecanicienId;
        }

        // Trouver la prestation à démarrer
        let prestationIndex = -1;
        let prestationInfo = "";

        if (prestationId) {
            // Validation de l'ID de prestation
            if (!prestationId.match(/^[0-9a-fA-F]{24}$/)) {
                return res.status(400).json({
                    success: false,
                    message: "ID de prestation invalide"
                });
            }

            // Prestation spécifique demandée
            prestationIndex = rdv.prestations.findIndex(p => p._id.toString() === prestationId);
            if (prestationIndex === -1) {
                return res.status(400).json({
                    success: false,
                    message: "Prestation non trouvée dans ce rendez-vous"
                });
            }
            prestationInfo = `"${rdv.prestations[prestationIndex].prestation_id?.nom || 'Prestation inconnue'}"`;
        } else {
            // Première prestation en attente
            prestationIndex = rdv.prestations.findIndex(p =>
                p.statuts.En_attente && !p.statuts.En_cours && !p.statuts.Terminé && !p.statuts.Annulé
            );
            if (prestationIndex === -1) {
                return res.status(400).json({
                    success: false,
                    message: "Aucune prestation en attente trouvée"
                });
            }
            prestationInfo = `"${rdv.prestations[prestationIndex].prestation_id?.nom || 'Prestation inconnue'}" (première en attente)`;
        }

        const prestationConcernee = rdv.prestations[prestationIndex];

        // Vérifications de l'état de la prestation
        if (prestationConcernee.statuts.En_cours) {
            return res.status(400).json({
                success: false,
                message: "Cette prestation est déjà en cours"
            });
        }

        if (prestationConcernee.statuts.Terminé) {
            return res.status(400).json({
                success: false,
                message: "Cette prestation est déjà terminée"
            });
        }

        if (prestationConcernee.statuts.Annulé) {
            return res.status(400).json({
                success: false,
                message: "Cette prestation est annulée"
            });
        }

        // Démarrer la prestation
        const maintenant = new Date();
        rdv.prestations[prestationIndex].statuts.En_cours = maintenant;

        // Mettre à jour le statut global du RDV si nécessaire
        if (rdv.statut === 'En attente') {
            rdv.statut = 'Confirmé';
        }

        await rdv.save();

        // Retourner le RDV mis à jour avec toutes les informations
        const updatedRdv = await RendezVous.findById(rdvId)
            .populate("client_id", "nom prenom email telephone")
            .populate("vehicule_enregistrer", "marque modele annee type_moteur")
            .populate("prestations.prestation_id", "nom description prix_main_oeuvre");

        res.status(200).json({
            success: true,
            message: `Réparation démarrée avec succès : ${prestationInfo}`,
            data: {
                rendezVous: updatedRdv,
                prestationDemarree: {
                    id: prestationConcernee._id,
                    nom: prestationConcernee.prestation_id?.nom,
                    dateDebutEffective: maintenant,
                    statut_precedent: "En attente",
                    statut_actuel: "En cours"
                }
            }
        });

    } catch (error) {
        console.error('Erreur lors du démarrage de la réparation:', error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur lors du démarrage de la réparation",
            error: error.message
        });
    }
};

/**
 * Fonction utilitaire pour déterminer le statut actuel d'une prestation
 */
function getStatutPrestation(statuts) {
    if (statuts.Terminé) return 'Terminé';
    if (statuts.Annulé) return 'Annulé';
    if (statuts.En_cours) return 'En cours';
    if (statuts.En_attente) return 'En attente';
    return 'Inconnu';
}
