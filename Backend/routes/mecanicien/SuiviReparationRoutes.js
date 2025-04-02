const express = require("express");
const router = express.Router();
const jwtAuth = require('../../middlewares/jwtAuth');
const { getDetailsRendezVous, updateStatutPrestation } = require("../../controllers/mecanicien/SuiviReparationController");

// Route pour récupérer les détails d’un rendez-vous
router.get("/:id", getDetailsRendezVous);

// Route pour mettre à jour le statut d’une prestation
router.put("/prestation/:id", updateStatutPrestation);

module.exports = router;
