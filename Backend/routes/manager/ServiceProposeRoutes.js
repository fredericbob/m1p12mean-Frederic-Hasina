const express = require('express');
const router = express.Router();
const ServiceProposeController = require('../../controllers/manager/ServiceProposeControllers');
const jwtAuth=require('../../middlewares/jwtAuth');

router.post('/', jwtAuth("manager"), ServiceProposeController.createPrestation);
router.get('/', ServiceProposeController.getPrestations);
router.get('/:id', jwtAuth("manager"), ServiceProposeController.getPrestationById);
router.put('/:id', jwtAuth("manager"), ServiceProposeController.updatePrestation);
router.delete('/:id', jwtAuth("manager"), ServiceProposeController.deletePrestation);

module.exports = router;
