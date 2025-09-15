const express = require('express');
const router = express.Router();
const ServiceProposeController = require('../../controllers/manager/ServiceProposeControllers');
const jwtAuth = require('../../middlewares/jwtAuth');

// Routes CRUD pour les prestations
router.post('/', jwtAuth('manager'), ServiceProposeController.createPrestation);
router.get('/', jwtAuth('manager'), ServiceProposeController.getAllPrestations);
router.get('/pieces', jwtAuth('manager'), ServiceProposeController.getAllPieces); // AVANT les routes avec :id
router.get('/types-vehicule', jwtAuth('manager'), ServiceProposeController.getAllTypesVehicule);
router.get('/:id', jwtAuth('manager'), ServiceProposeController.getPrestationById);
router.put('/:id', jwtAuth('manager'), ServiceProposeController.updatePrestation);
router.delete('/:id', jwtAuth('manager'), ServiceProposeController.deletePrestation);

module.exports = router;
