const express = require('express');
const router = express.Router();
const ServiceProposeController = require('../../controllers/manager/ServiceProposeControllers');
const jwtAuth=require('../../middlewares/jwtAuth');

// router.post('/', jwtAuth("manager"), ServiceProposeController.createPrestation);
// router.get('/', jwtAuth("manager"), ServiceProposeController.getPrestations);
// router.get('/:id', jwtAuth("manager"), ServiceProposeController.getPrestationById);
// router.put('/:id', jwtAuth("manager"), ServiceProposeController.updatePrestation);
// router.delete('/:id', jwtAuth("manager"), ServiceProposeController.deletePrestation);

router.post('/', ServiceProposeController.createPrestation);
router.get('/', ServiceProposeController.getAllPrestations);
router.get('/:id', ServiceProposeController.getPrestationById);
router.put('/:id', ServiceProposeController.updatePrestation);
router.delete('/:id', ServiceProposeController.deletePrestation);
router.get('/pieces', ServiceProposeController.getAllPieces);

module.exports = router;
