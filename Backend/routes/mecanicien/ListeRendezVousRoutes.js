const express = require('express');
const router = express.Router();
const ListeRendezVousController = require('../../controllers/mecanicien/ListeRendezVousController');
const jwtAuth = require('../../middlewares/jwtAuth');

// GET - Récupérer la liste des rendez-vous du mécanicien
router.get('/', jwtAuth("mecanicien"), ListeRendezVousController.getRendezVousMecanicien);

// GET - Récupérer les statistiques du mécanicien
router.get('/stats', jwtAuth("mecanicien"), ListeRendezVousController.getStatsMecanicien);

// GET - Récupérer toutes les prestations disponibles
router.get('/prestations', jwtAuth("mecanicien"), ListeRendezVousController.getPrestationsDisponibles);

// PATCH - Commencer une réparation
router.patch('/:id/commencer', jwtAuth("mecanicien"), ListeRendezVousController.commencerReparation);

// PATCH - Terminer une prestation spécifique
router.patch('/:id/prestations/:prestationId/terminer', jwtAuth("mecanicien"), ListeRendezVousController.terminerPrestation);

// PATCH - Annuler une prestation spécifique
router.patch('/:id/prestations/:prestationId/annuler', jwtAuth("mecanicien"), ListeRendezVousController.annulerPrestation);

// POST - Ajouter une nouvelle prestation à un rendez-vous
router.post('/:id/prestations', jwtAuth("mecanicien"), ListeRendezVousController.ajouterPrestation);

module.exports = router;
