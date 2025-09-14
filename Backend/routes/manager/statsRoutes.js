const express = require('express');
const router = express.Router();
const {
    getGeneralStats,
    getTopPrestations,
    getPiecesAlert,
    getRevenue
} = require('../../controllers/manager/statsController');
const jwtAuth = require('../../middlewares/jwtAuth');

// Route pour les statistiques générales
router.get('/general', jwtAuth('manager'), getGeneralStats);

// Route pour les prestations les plus populaires
router.get('/top-prestations', jwtAuth('manager'), getTopPrestations);

// Route pour les pièces en alerte stock
router.get('/pieces-alert', jwtAuth('manager'), getPiecesAlert);

// Route pour le calcul du revenu sur une période
router.get('/revenue', jwtAuth('manager'), getRevenue);

module.exports = router;
