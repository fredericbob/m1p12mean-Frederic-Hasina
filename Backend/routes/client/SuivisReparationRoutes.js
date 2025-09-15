const express = require('express');
const router = express.Router();
const SuiviReparationsController = require('../../controllers/client/SuivisReparationController');
const jwtAuth = require('../../middlewares/jwtAuth');

// GET - Récupérer le détail d'un rendez-vous avec suivi des prestations
router.get('/:id/suivi-prestations', jwtAuth("client"), SuiviReparationsController.getSuiviReparations);

// PUT - Donner une note et un commentaire sur un rendez-vous terminé
router.put('/:id/avis', jwtAuth("client"), SuiviReparationsController.donnerAvis);

module.exports = router;
