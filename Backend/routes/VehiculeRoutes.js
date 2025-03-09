const express=require('express');
const routes=express.Router();

const jwtAuth=require('../middlewares/jwtAuth');
const addVehicle=require('../controllers/vehiculeControllers');
routes.post('/',jwtAuth(),addVehicle);

module.exports=routes;