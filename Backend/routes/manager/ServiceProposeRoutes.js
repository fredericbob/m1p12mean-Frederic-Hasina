const express = require('express');
const router = express.Router();
const ServiceProposeController = require('../../controllers/manager/ServiceProposeControllers');
const jwtAuth = require('../../middlewares/jwtAuth');

// Routes spécifiques AVANT les routes avec paramètres
router.get('/pieces', jwtAuth('manager'), ServiceProposeController.getAllPieces);
router.get('/types-vehicule', jwtAuth('manager'), ServiceProposeController.getAllTypesVehicule);

// Routes CRUD générales
router.post('/', jwtAuth('manager'), ServiceProposeController.createPrestation);
router.get('/', jwtAuth('manager'), ServiceProposeController.getAllPrestations);
router.get('/:id', jwtAuth('manager'), ServiceProposeController.getPrestationById);
router.put('/:id', jwtAuth('manager'), ServiceProposeController.updatePrestation);
router.delete('/:id', jwtAuth('manager'), ServiceProposeController.deletePrestation);

module.exports = router;
