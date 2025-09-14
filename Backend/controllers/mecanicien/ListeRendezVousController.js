const RendezVous = require('../../models/RendezVous');
const mongoose = require('mongoose');

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
                const vehicule = rdv.vehicule_enregistrer;
                vehiculeInfo = `${vehicule.marque} ${vehicule.modele} (${vehicule.annee}) - ${vehicule.type_moteur}`;
            } else if (rdv.vehicule_id && rdv.vehicule_id.marque) {
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
                mecanicien_id: rdv.mecanicien_id,
                progression: calculerProgression(rdv.prestations)
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
 */
exports.commencerReparation = async (req, res) => {
    try {
        const { id: rdvId } = req.params;
        const { prestationId } = req.body || {};
        const mecanicienId = req.user.id;

        // Validation de l'ID du rendez-vous
        if (!rdvId || !mongoose.Types.ObjectId.isValid(rdvId)) {
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
            if (!mongoose.Types.ObjectId.isValid(prestationId)) {
                return res.status(400).json({
                    success: false,
                    message: "ID de prestation invalide"
                });
            }

            prestationIndex = rdv.prestations.findIndex(p => p._id.toString() === prestationId);
            if (prestationIndex === -1) {
                return res.status(400).json({
                    success: false,
                    message: "Prestation non trouvée dans ce rendez-vous"
                });
            }
            prestationInfo = `"${rdv.prestations[prestationIndex].prestation_id?.nom || 'Prestation inconnue'}"`;
        } else {
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

        // Retourner le RDV mis à jour
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
 * Termine une prestation spécifique
 */
exports.terminerPrestation = async (req, res) => {
    try {
        const { id: rdvId, prestationId } = req.params;
        const mecanicienId = req.user.id;

        // Validations
        if (!mongoose.Types.ObjectId.isValid(rdvId) || !mongoose.Types.ObjectId.isValid(prestationId)) {
            return res.status(400).json({
                success: false,
                message: "ID de rendez-vous ou de prestation invalide"
            });
        }

        const rdv = await RendezVous.findById(rdvId)
            .populate("prestations.prestation_id", "nom description prix_main_oeuvre");

        if (!rdv) {
            return res.status(404).json({
                success: false,
                message: "Rendez-vous non trouvé"
            });
        }

        // Vérifier l'autorisation
        if (!rdv.mecanicien_id || rdv.mecanicien_id.toString() !== mecanicienId) {
            return res.status(403).json({
                success: false,
                message: "Vous n'êtes pas autorisé à modifier ce rendez-vous"
            });
        }

        // Trouver la prestation
        const prestationIndex = rdv.prestations.findIndex(p => p._id.toString() === prestationId);
        if (prestationIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Prestation non trouvée dans ce rendez-vous"
            });
        }

        const prestation = rdv.prestations[prestationIndex];

        // Vérifier que la prestation est en cours
        if (!prestation.statuts.En_cours) {
            return res.status(400).json({
                success: false,
                message: "Cette prestation n'est pas en cours"
            });
        }

        if (prestation.statuts.Terminé) {
            return res.status(400).json({
                success: false,
                message: "Cette prestation est déjà terminée"
            });
        }

        // Terminer la prestation
        const maintenant = new Date();
        rdv.prestations[prestationIndex].statuts.Terminé = maintenant;

        await rdv.save();

        // Vérifier si toutes les prestations actives sont terminées
        await verifierEtMettreAJourStatutRDV(rdvId);

        // Retourner la réponse
        const updatedRdv = await RendezVous.findById(rdvId)
            .populate("client_id", "nom prenom email telephone")
            .populate("vehicule_enregistrer", "marque modele annee type_moteur")
            .populate("prestations.prestation_id", "nom description prix_main_oeuvre");

        res.status(200).json({
            success: true,
            message: `Prestation "${prestation.prestation_id?.nom || 'Prestation'}" terminée avec succès`,
            data: {
                rendezVous: updatedRdv,
                prestationTerminee: {
                    id: prestation._id,
                    nom: prestation.prestation_id?.nom,
                    dateFinEffective: maintenant,
                    dureeEffective: calculerDuree(prestation.statuts.En_cours, maintenant),
                    statut_precedent: "En cours",
                    statut_actuel: "Terminé"
                }
            }
        });

    } catch (error) {
        console.error('Erreur lors de la finalisation de la prestation:', error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur lors de la finalisation de la prestation",
            error: error.message
        });
    }
};

/**
 * Annule une prestation spécifique
 */
exports.annulerPrestation = async (req, res) => {
    try {
        const { id: rdvId, prestationId } = req.params;
        const { motif } = req.body || {};
        const mecanicienId = req.user.id;

        // Validations
        if (!mongoose.Types.ObjectId.isValid(rdvId) || !mongoose.Types.ObjectId.isValid(prestationId)) {
            return res.status(400).json({
                success: false,
                message: "ID de rendez-vous ou de prestation invalide"
            });
        }

        const rdv = await RendezVous.findById(rdvId)
            .populate("prestations.prestation_id", "nom description prix_main_oeuvre");

        if (!rdv) {
            return res.status(404).json({
                success: false,
                message: "Rendez-vous non trouvé"
            });
        }

        // Vérifier l'autorisation
        if (!rdv.mecanicien_id || rdv.mecanicien_id.toString() !== mecanicienId) {
            return res.status(403).json({
                success: false,
                message: "Vous n'êtes pas autorisé à modifier ce rendez-vous"
            });
        }

        // Trouver la prestation
        const prestationIndex = rdv.prestations.findIndex(p => p._id.toString() === prestationId);
        if (prestationIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Prestation non trouvée dans ce rendez-vous"
            });
        }

        const prestation = rdv.prestations[prestationIndex];

        // Vérifier que la prestation peut être annulée
        if (prestation.statuts.Terminé) {
            return res.status(400).json({
                success: false,
                message: "Impossible d'annuler une prestation déjà terminée"
            });
        }

        if (prestation.statuts.Annulé) {
            return res.status(400).json({
                success: false,
                message: "Cette prestation est déjà annulée"
            });
        }

        // Annuler la prestation
        const maintenant = new Date();
        rdv.prestations[prestationIndex].statuts.Annulé = maintenant;

        // Ajouter le motif si fourni
        if (motif) {
            rdv.prestations[prestationIndex].motif_annulation = motif;
        }

        await rdv.save();

        // Vérifier si toutes les prestations actives sont terminées
        await verifierEtMettreAJourStatutRDV(rdvId);

        // Retourner la réponse
        const updatedRdv = await RendezVous.findById(rdvId)
            .populate("client_id", "nom prenom email telephone")
            .populate("vehicule_enregistrer", "marque modele annee type_moteur")
            .populate("prestations.prestation_id", "nom description prix_main_oeuvre");

        res.status(200).json({
            success: true,
            message: `Prestation "${prestation.prestation_id?.nom || 'Prestation'}" annulée avec succès`,
            data: {
                rendezVous: updatedRdv,
                prestationAnnulee: {
                    id: prestation._id,
                    nom: prestation.prestation_id?.nom,
                    dateAnnulationEffective: maintenant,
                    motif: motif || null,
                    statut_precedent: prestation.statuts.En_cours ? "En cours" : "En attente",
                    statut_actuel: "Annulé"
                }
            }
        });

    } catch (error) {
        console.error('Erreur lors de l\'annulation de la prestation:', error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur lors de l'annulation de la prestation",
            error: error.message
        });
    }
};

/**
 * Ajoute une nouvelle prestation à un rendez-vous en cours
 */
exports.ajouterPrestation = async (req, res) => {
    try {
        const { id: rdvId } = req.params;
        const { prestationId, motif } = req.body;
        const mecanicienId = req.user.id;

        // Validations
        if (!mongoose.Types.ObjectId.isValid(rdvId)) {
            return res.status(400).json({
                success: false,
                message: "ID de rendez-vous invalide"
            });
        }

        if (!prestationId || !mongoose.Types.ObjectId.isValid(prestationId)) {
            return res.status(400).json({
                success: false,
                message: "ID de prestation requis et valide"
            });
        }

        const rdv = await RendezVous.findById(rdvId)
            .populate("prestations.prestation_id", "nom description prix_main_oeuvre");

        if (!rdv) {
            return res.status(404).json({
                success: false,
                message: "Rendez-vous non trouvé"
            });
        }

        // Vérifier l'autorisation
        if (!rdv.mecanicien_id || rdv.mecanicien_id.toString() !== mecanicienId) {
            return res.status(403).json({
                success: false,
                message: "Vous n'êtes pas autorisé à modifier ce rendez-vous"
            });
        }

        // Vérifier que le RDV n'est pas terminé
        if (rdv.statut === 'Terminé') {
            return res.status(400).json({
                success: false,
                message: "Impossible d'ajouter une prestation à un rendez-vous terminé"
            });
        }

        // Vérifier que cette prestation n'existe pas déjà
        const prestationExiste = rdv.prestations.some(p =>
            p.prestation_id && p.prestation_id.toString() === prestationId && !p.statuts.Annulé
        );

        if (prestationExiste) {
            return res.status(400).json({
                success: false,
                message: "Cette prestation est déjà présente dans le rendez-vous"
            });
        }

        // Ajouter la nouvelle prestation
        const nouvellePrestation = {
            prestation_id: prestationId,
            statuts: {
                En_attente: new Date()
            }
        };

        if (motif) {
            nouvellePrestation.motif_ajout = motif;
        }

        rdv.prestations.push(nouvellePrestation);
        await rdv.save();

        // Retourner la réponse avec populate
        const updatedRdv = await RendezVous.findById(rdvId)
            .populate("client_id", "nom prenom email telephone")
            .populate("vehicule_enregistrer", "marque modele annee type_moteur")
            .populate("prestations.prestation_id", "nom description prix_main_oeuvre");

        const prestationAjoutee = updatedRdv.prestations[updatedRdv.prestations.length - 1];

        res.status(201).json({
            success: true,
            message: `Prestation "${prestationAjoutee.prestation_id?.nom || 'Nouvelle prestation'}" ajoutée avec succès`,
            data: {
                rendezVous: updatedRdv,
                prestationAjoutee: {
                    id: prestationAjoutee._id,
                    nom: prestationAjoutee.prestation_id?.nom,
                    dateAjout: prestationAjoutee.statuts.En_attente,
                    motif: motif || null,
                    statut_actuel: "En attente"
                }
            }
        });

    } catch (error) {
        console.error('Erreur lors de l\'ajout de la prestation:', error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur lors de l'ajout de la prestation",
            error: error.message
        });
    }
};

/**
 * Récupère les statistiques du mécanicien connecté
 */
exports.getStatsMecanicien = async (req, res) => {
    try {
        const mecanicienId = req.user.id;
        const aujourd = new Date();
        const debutJour = new Date(aujourd.getFullYear(), aujourd.getMonth(), aujourd.getDate());
        const finJour = new Date(debutJour.getTime() + 24 * 60 * 60 * 1000);

        // Statistiques des RDV
        const [rdvAujourdhui, rdvEnCours, rdvTermines, rdvTotal] = await Promise.all([
            RendezVous.countDocuments({
                mecanicien_id: mecanicienId,
                date_rdv: { $gte: debutJour, $lt: finJour }
            }),
            RendezVous.countDocuments({
                mecanicien_id: mecanicienId,
                statut: 'Confirmé'
            }),
            RendezVous.countDocuments({
                mecanicien_id: mecanicienId,
                statut: 'Terminé'
            }),
            RendezVous.countDocuments({
                mecanicien_id: mecanicienId
            })
        ]);

        // Statistiques des prestations
        const rdvAvecPrestations = await RendezVous.find({
            mecanicien_id: mecanicienId
        }).select('prestations');

        let prestationsTotal = 0;
        let prestationsTerminees = 0;
        let prestationsEnCours = 0;
        let tempsTotal = 0;

        rdvAvecPrestations.forEach(rdv => {
            rdv.prestations.forEach(prestation => {
                prestationsTotal++;

                if (prestation.statuts.Terminé) {
                    prestationsTerminees++;
                    // Calculer le temps si En_cours et Terminé existent
                    if (prestation.statuts.En_cours) {
                        const duree = prestation.statuts.Terminé - prestation.statuts.En_cours;
                        tempsTotal += Math.round(duree / (1000 * 60)); // en minutes
                    }
                }

                if (prestation.statuts.En_cours && !prestation.statuts.Terminé && !prestation.statuts.Annulé) {
                    prestationsEnCours++;
                }
            });
        });

        res.status(200).json({
            success: true,
            message: "Statistiques récupérées avec succès",
            data: {
                rendezvous: {
                    aujourd_hui: rdvAujourdhui,
                    en_cours: rdvEnCours,
                    termines: rdvTermines,
                    total: rdvTotal
                },
                prestations: {
                    total: prestationsTotal,
                    terminees: prestationsTerminees,
                    en_cours: prestationsEnCours,
                    taux_completion: prestationsTotal > 0 ? Math.round((prestationsTerminees / prestationsTotal) * 100) : 0
                },
                temps: {
                    total_minutes: tempsTotal,
                    total_heures: Math.round(tempsTotal / 60 * 10) / 10,
                    moyenne_par_prestation: prestationsTerminees > 0 ? Math.round(tempsTotal / prestationsTerminees) : 0
                }
            }
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur lors de la récupération des statistiques",
            error: error.message
        });
    }
};

// Fonctions utilitaires
function getStatutPrestation(statuts) {
    if (statuts.Terminé) return 'Terminé';
    if (statuts.Annulé) return 'Annulé';
    if (statuts.En_cours) return 'En cours';
    if (statuts.En_attente) return 'En attente';
    return 'Inconnu';
}

function calculerProgression(prestations) {
    if (!prestations || prestations.length === 0) return 0;

    const prestationsActives = prestations.filter(p => !p.statuts.Annulé);
    if (prestationsActives.length === 0) return 0;

    const prestationsTerminees = prestationsActives.filter(p => p.statuts.Terminé).length;
    return Math.round((prestationsTerminees / prestationsActives.length) * 100);
}

function calculerDuree(dateDebut, dateFin) {
    if (!dateDebut || !dateFin) return null;
    const dureeMs = dateFin - dateDebut;
    const dureeMinutes = Math.round(dureeMs / (1000 * 60));
    return dureeMinutes;
}

async function verifierEtMettreAJourStatutRDV(rdvId) {
    try {
        const rdv = await RendezVous.findById(rdvId);
        if (!rdv) return;

        const prestationsActives = rdv.prestations.filter(p => !p.statuts.Annulé);
        const prestationsTerminees = prestationsActives.filter(p => p.statuts.Terminé);

        if (prestationsActives.length > 0 && prestationsActives.length === prestationsTerminees.length) {
            rdv.statut = 'Terminé';
            await rdv.save();
            console.log(`RDV ${rdvId} automatiquement marqué comme terminé`);
        }
    } catch (error) {
        console.error('Erreur lors de la vérification du statut RDV:', error);
    }
}

/**
 * Récupère toutes les prestations disponibles
 */
exports.getPrestationsDisponibles = async (req, res) => {
    try {
        const Prestation = require('../../models/Prestation'); // Ajustez le chemin selon votre structure

        const prestations = await Prestation.find({})
            .select('nom description prix_main_oeuvre')
            .sort({ nom: 1 });

        res.status(200).json({
            success: true,
            message: "Prestations récupérées avec succès",
            data: prestations
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des prestations:', error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur lors de la récupération des prestations",
            error: error.message
        });
    }
};
